import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage

# --- 1. GLOBAL VARIABLES ---
vectorstore = None
llm = None

# --- 2. LIFESPAN MANAGER ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    global vectorstore, llm
    
    print("--- STARTUP: Loading Models ---")

    print("1. Loading Embeddings Model...")
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/paraphrase-multilingual-mpnet-base-v2"
    )
    
    if os.path.exists("vector_db"):
        print("2. Loading FAISS Vector Store...")
        vectorstore = FAISS.load_local(
            "vector_db", 
            embeddings, 
            allow_dangerous_deserialization=True
        )
    else:
        print("CRITICAL WARNING: 'vector_db' folder not found. Chat will fail.")

    print("3. Initializing OpenRouter Model...")
    try:
        # Fetch key directly from Hugging Face secrets
        openrouter_key = os.getenv("OPENROUTER_API_KEY")
        if not openrouter_key:
             raise ValueError("OPENROUTER_API_KEY secret is not set in Hugging Face.")
             
        llm = ChatOpenAI(
            # Tries Gemma first, falls back to Llama 3, then falls back to Mistral
            model="nvidia/nemotron-3-ultra-550b-a55b:free",
            temperature=0.1,
            max_tokens=1024,
            api_key=openrouter_key,
            base_url="https://openrouter.ai/api/v1",
            default_headers={
                "HTTP-Referer": "https://huggingface.co/spaces",
                "X-Title": "Hajj RAG Chatbot"
            }
        )
        print("--- BACKEND READY ---")
        
    except Exception as e:
        print(f"Error initializing LLM: {e}")
        raise

    yield  
    print("--- SHUTDOWN ---")

# --- 3. APP INITIALIZATION ---
app = FastAPI(title="Hajj RAG Chatbot", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False, 
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 4. DATA MODELS ---
class ChatRequest(BaseModel):
    message: str
    language: str  # "en" or "ar"

# --- 5. ENDPOINTS ---
@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    if not vectorstore:
        raise HTTPException(status_code=500, detail="Vector store is not loaded. Check server logs.")
    
    if not llm:
        raise HTTPException(status_code=500, detail="LLM is not initialized. Check API Key.")

    # A. Retrieve Context (Search the vector DB)
    try:
        docs = vectorstore.similarity_search(request.message, k=4)
        context = "\n".join([doc.page_content for doc in docs])
    except Exception as e:
         print(f"Vector search error: {e}")
         context = ""

    # B. Select System Prompt based on Language
    if request.language == "ar":
        system_prompt = f"""
أنت مساعد دقيق متخصص في إرشادات الحج والعمرة.
استخدم فقط المقاطع المستندية المقدمة للإجابة على سؤال المستخدم. اذكر المصادر في النص بين قوسين [المصدر].
قدم تعليمات إجرائية خطوة بخطوة عند الاقتضاء.
إذا لم تدعم الأدلة إجابة واثقة، فاذكر ذلك بوضوح.

السياق:
{context}

السؤال:
{request.message}
"""
    else:
        system_prompt = f"""
You are a careful assistant specialized in Hajj and Umrah guidance.
Use only the provided evidence passages to answer the user's question. Cite sources inline as [source].
Give step-by-step procedural instructions when applicable.
If the evidence does not support a confident answer, say so clearly.

Context:
{context}

Question:
{request.message}
"""

    # C. Generate Response
    # C. Generate Response
    try:
        messages = [HumanMessage(content=system_prompt)]
        response = llm.invoke(messages)
        return {"response": response.content}
    except Exception as e:
        error_msg = str(e)
        print(f"LLM Generation Error: {error_msg}")
        
        # Check if it's a rate limit error
        if "429" in error_msg:
            raise HTTPException(status_code=429, detail="The AI provider is currently overloaded. Please try again in a few moments.")
            
        raise HTTPException(status_code=500, detail="An error occurred while generating the response.")

@app.get("/")
def home():
    return {"status": "active", "message": "Hajj Chatbot Backend is Running"}
    
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)