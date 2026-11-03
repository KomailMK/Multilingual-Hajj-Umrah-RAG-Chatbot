# Customizable RAG Chatbot Pipeline

This is a **fully customizable RAG (Retrieval-Augmented Generation) pipeline**. Re-run the notebook to generate a new knowledge base, and follow the instructions below to host your very own custom RAG application!

By default, this repository acts as an intelligent, multilingual (English and Arabic) chatbot designed to provide guidance for Hajj and Umrah, but it can be adapted to **any domain** simply by swapping the PDF files.

## Architecture & Pipeline

The project is split into three main components:

1. **Data Ingestion & Vector DB (Jupyter Notebook)**
   * **Tooling:** Python, LangChain, PyPDF2, FAISS, Hugging Face Embeddings.
   * **Process:** Reads multiple PDF documents, merges them, chunks the text, generates embeddings using `sentence-transformers/paraphrase-multilingual-mpnet-base-v2`, and saves them into a local FAISS Vector Database (`vector_db`).

2. **Backend API (Hugging Face Spaces)**
   * **Tooling:** FastAPI, LangChain, OpenRouter.
   * **Process:** Hosts the REST API. It loads the pre-built FAISS `vector_db` and uses it to retrieve relevant context based on the user's query. It then prompts the LLM to generate a highly accurate, cited response.

3. **Frontend UI (Vercel)**
   * **Tooling:** Next.js 15, React 19, Tailwind CSS v4, Framer Motion.
   * **Process:** A responsive, modern web interface that communicates with the backend API.

---

## 1. Customize with Your Own Data

The chatbot's knowledge is entirely dependent on the documents processed into the Vector Database. Here is how to replace the existing data with your own:

1. **Add your PDFs:** Place your custom PDF documents (e.g., `hr_policies.pdf`, `product_manual.pdf`) in the root directory alongside the Jupyter notebook.
2. **Open the Notebook:** Open `rag_optimized.ipynb` in Jupyter Notebook, VS Code, or Google Colab.
3. **Update the Merge List:** Locate the Python cell containing the `pdfs_to_merge` list and replace it with your file names.
   ```python
   pdfs_to_merge = ["hr_policies.pdf", "product_manual.pdf"] # Add your PDFs here
   ```
4. **Re-run the Notebook:** Execute all cells in the notebook. 
   * The script will extract the text, chunk it, and generate new embeddings.
   * A new folder named `vector_db` will be created in your root directory.
5. **Update the Backend:**
   * Delete the old `vector_db` folder inside the `backend/` directory.
   * Move your newly generated `vector_db` folder into the `backend/` directory.

---

## 2. Local Development Setup

### Backend Setup (Python 3.9+)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set your OpenRouter API Key
export OPENROUTER_API_KEY="your_api_key_here" # Windows: set OPENROUTER_API_KEY=your_api_key_here

uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Setup (Node.js 18+)
*Note: To test locally, update the axios POST URL in `frontend/app/page.tsx` from the production URL to `http://localhost:8000/chat`.*
```bash
cd frontend
npm install
npm run dev
```

---

## 3. Deployment Instructions

Follow these steps to host your own RAG application in the cloud for free.

### Step A: Get an OpenRouter API Key
OpenRouter provides access to various LLMs (like Llama 3, Mixtral, etc.).
1. Go to [OpenRouter.ai](https://openrouter.ai/) and create an account.
2. Navigate to **Keys** and click **Create Key**.
3. Copy this API key. You will need it for the backend deployment.

### Step B: Host the Backend on Hugging Face Spaces
Hugging Face Spaces provides free hosting for machine learning APIs using Docker.
1. Go to [Hugging Face](https://huggingface.co/) and create an account.
2. Click on your profile picture -> **New Space**.
3. Give your space a name (e.g., `my-custom-rag-backend`).
4. Select **Docker** as the Space SDK and choose the **Blank** template.
5. Click **Create Space**.
6. **Upload your files:** Upload the *contents* of your local `backend/` folder (`main.py`, `requirements.txt`, `Dockerfile`, and the `vector_db/` folder) to the root of this new Space.
7. **Add your API Key:** 
   * Go to the **Settings** tab of your Space.
   * Scroll down to **Variables and secrets**.
   * Click **New secret**.
   * Set the Name to `OPENROUTER_API_KEY` and paste your OpenRouter key as the Value.
8. The Space will automatically build and start. Once it says "Running", click the **three dots** (top right) -> **Embed this Space** to find your Direct URL (it will look like `https://yourusername-yourspacename.hf.space`).

### Step C: Host the Frontend on Vercel
1. **Update the API URL:** In your local code, open `frontend/app/page.tsx`. Find the `axios.post` request and replace the URL with your new Hugging Face Space URL (append `/chat` to the end of it).
   ```javascript
   // Example:
   const res = await axios.post("https://yourusername-yourspacename.hf.space/chat", { ... })
   ```
2. Push your entire project to a new **GitHub repository**.
3. Go to [Vercel.com](https://vercel.com/) and create an account.
4. Click **Add New** -> **Project**.
5. Import your newly created GitHub repository.
6. **CRITICAL STEP:** In the "Configure Project" screen, look for the **Root Directory** setting. Click Edit, select the `frontend` folder, and save.
7. Click **Deploy**. Vercel will build and host your frontend automatically.

Congratulations! You have now successfully customized and hosted your own RAG application!

## Built With
* [Next.js](https://nextjs.org/) & [React](https://react.dev/)
* [Tailwind CSS](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/)
* [FastAPI](https://fastapi.tiangolo.com/)
* [LangChain](https://www.langchain.com/) & [FAISS](https://github.com/facebookresearch/faiss)
* [Hugging Face](https://huggingface.co/) & [OpenRouter](https://openrouter.ai/)
