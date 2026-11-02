"use client";
import { useState, useEffect, useRef } from "react";
import { Send, User, Bot, ChevronDown, Check, Sparkles, MessageSquare } from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
}

const SUGGESTIONS = [
  { en: "How to perform Tawaf al-Ifadah?", ar: "كيف أؤدي طواف الإفاضة؟" },
  { en: "How to Perform Hajj?", ar: "ما هي أركان الحج؟" },
  { en: "Recommended Duas for Arafat", ar: "أدعية مستحبة في يوم عرفة" }
];

export default function Home() {
  const [language, setLanguage] = useState<"en" | "ar">("en");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (textOverride?: string) => {
    const messageText = textOverride || input;
    if (!messageText.trim()) return;

    const userMsg: Message = { id: Date.now(), text: messageText, sender: "user" };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await axios.post("https://ahmadkomail77-hajj-backend.hf.space/chat", {
        message: userMsg.text,
        language: language, 
      });
      const botMsg: Message = { 
        id: Date.now() + 1, 
        text: res.data.response, 
        sender: "bot" 
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), text: "Sorry, connection error.", sender: "bot" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 bg-[#0a0c10] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 ${language === 'ar' ? 'font-arabic' : ''}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* --- Executive Header --- */}
      <header className="z-50 bg-[#0a0c10]/80 backdrop-blur-2xl border-b border-white/[0.04] px-4 md:px-6 py-3 shrink-0">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          
          <div className="flex items-center gap-3 select-none group cursor-pointer">
            <div className="relative">
                <div className="absolute inset-0 bg-emerald-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center relative shadow-lg ring-1 ring-emerald-500/50">
                    <Sparkles className="text-white w-4 h-4" />
                </div>
            </div>
            <div className="flex flex-col">
                <h1 className="font-bold text-lg tracking-tight text-white leading-tight">Hajj<span className="text-emerald-500">Guide</span></h1>
                <p className="text-[9px] uppercase tracking-widest text-emerald-500/80 font-bold">RAG Architecture</p>
            </div>
          </div>

          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 bg-slate-800/40 hover:bg-slate-800/80 border border-white/[0.05] hover:border-white/[0.1] rounded-lg px-3 py-1.5 transition-all duration-300 backdrop-blur-md shadow-sm"
            >
              <span className="text-xs font-medium text-slate-300">
                {language === 'en' ? 'EN Model' : 'النموذج العربي'}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute top-full mt-2 w-40 bg-[#161923]/95 backdrop-blur-xl border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden z-50 ltr:right-0 rtl:left-0"
                >
                  <div className="p-1.5 flex flex-col gap-1">
                    <button 
                      onClick={() => { setLanguage('en'); setIsDropdownOpen(false); }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                        language === 'en' ? 'bg-emerald-500/15 text-emerald-400' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                      }`}
                    >
                      <span>English</span>
                      {language === 'en' && <Check className="w-3.5 h-3.5" />}
                    </button>
                    <button 
                      onClick={() => { setLanguage('ar'); setIsDropdownOpen(false); }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                        language === 'ar' ? 'bg-emerald-500/15 text-emerald-400' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                      }`}
                    >
                      <span className="font-arabic">العربية</span>
                      {language === 'ar' && <Check className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* --- Scrollable Chat Canvas --- */}
      <div className="flex-1 overflow-y-auto relative scroll-smooth" ref={scrollRef}>
        <div className="max-w-3xl mx-auto px-4 py-8 pb-32 flex flex-col gap-6 min-h-full">
          
          {/* Dynamic Empty State */}
          {messages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex flex-col items-center justify-center my-auto text-center px-4"
            >
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full"></div>
                <div className="w-20 h-20 bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl flex items-center justify-center relative border border-white/[0.08] shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                    <Sparkles className="w-10 h-10 text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-3 tracking-tight">
                {language === 'en' ? 'Your AI Hajj Companion' : 'رفيقك الذكي في الحج'}
              </h2>
              <p className="text-slate-400 max-w-md text-sm leading-relaxed mb-8">
                 {language === 'en' 
                  ? 'Ask complex questions about rituals, Fiqa rulings, or specific prayers. Powered by specialized RAG architecture.'
                  : 'اسأل عن المناسك، الأحكام الفقهية، أو الأدعية. مدعوم ببنية RAG المتخصصة.'}
              </p>

              {/* Suggestion Chips */}
              <div className="flex flex-wrap justify-center gap-3 max-w-2xl">
                {SUGGESTIONS.map((suggestion, idx) => (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + idx * 0.1 }}
                    onClick={() => handleSend(language === 'en' ? suggestion.en : suggestion.ar)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800/30 hover:bg-slate-800/80 border border-white/[0.05] hover:border-emerald-500/30 rounded-full text-xs font-medium text-slate-300 hover:text-emerald-300 transition-all duration-300 backdrop-blur-sm"
                  >
                    <MessageSquare className="w-3.5 h-3.5 opacity-70" />
                    <span>{language === 'en' ? suggestion.en : suggestion.ar}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Render Messages */}
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex items-end gap-3 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-lg border border-white/10 ${
                  msg.sender === "user" 
                    ? "bg-gradient-to-br from-blue-500 to-indigo-600" 
                    : "bg-gradient-to-br from-emerald-500 to-emerald-700"
                }`}>
                  {msg.sender === "user" ? <User size={13} className="text-white" /> : <Bot size={13} className="text-white" />}
                </div>
                
                <div className={`relative max-w-[85%] px-5 py-4 shadow-2xl ${
                  msg.sender === "user" 
                    ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl rounded-br-sm border border-blue-500/30" 
                    : "bg-[#161923]/80 backdrop-blur-md border border-white/[0.05] text-slate-200 rounded-2xl rounded-bl-sm"
                }`}>
                  {msg.sender === "user" ? (
                    <p className={`whitespace-pre-wrap text-sm leading-relaxed ${language === 'ar' ? 'text-right font-arabic' : 'text-left'}`}>
                        {msg.text}
                    </p>
                  ) : (
                    <div className={`text-[14.5px] leading-relaxed prose prose-invert prose-emerald max-w-none ${language === 'ar' ? 'text-right font-arabic' : 'text-left'}`}>
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm as any]}
                        components={{
                          // @ts-ignore
                          h1: ({node, ...props}) => <h1 className="text-lg font-bold text-white mt-5 mb-3 border-b border-white/10 pb-2" {...props} />,
                          // @ts-ignore
                          h2: ({node, ...props}) => <h2 className="text-base font-bold text-emerald-400 mt-4 mb-2" {...props} />,
                          // @ts-ignore
                          h3: ({node, ...props}) => <h3 className="text-sm font-bold text-emerald-300/90 mt-3 mb-1" {...props} />,
                          // @ts-ignore
                          p: ({node, ...props}) => <p className="mb-4 last:mb-0 text-slate-300 leading-relaxed" {...props} />,
                          // @ts-ignore
                          ul: ({node, ...props}) => <ul className="list-disc list-outside mb-4 space-y-1.5 ml-4 mr-4 text-slate-300" {...props} />,
                          // @ts-ignore
                          ol: ({node, ...props}) => <ol className="list-decimal list-outside mb-4 space-y-1.5 ml-4 mr-4 text-slate-300" {...props} />,
                          // @ts-ignore
                          li: ({node, ...props}) => <li className="pl-1" {...props} />,
                          // @ts-ignore
                          strong: ({node, ...props}) => <strong className="font-semibold text-white" {...props} />,
                          // @ts-ignore
                          a: ({node, ...props}) => <a className="text-emerald-400 hover:text-emerald-300 underline decoration-emerald-500/30 underline-offset-2 transition-colors" target="_blank" rel="noopener noreferrer" {...props} />,
                          // @ts-ignore
                          blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-emerald-500 bg-emerald-500/5 px-4 py-2 my-4 rounded-r-lg italic text-slate-400" {...props} />,
                          // @ts-ignore
                          table: ({node, ...props}) => <div className="overflow-x-auto my-4 rounded-xl border border-white/10"><table className="w-full text-sm text-left border-collapse" {...props} /></div>,
                          // @ts-ignore
                          thead: ({node, ...props}) => <thead className="text-xs uppercase bg-slate-800/80 text-emerald-400" {...props} />,
                          // @ts-ignore
                          th: ({node, ...props}) => <th className="px-4 py-3 border-b border-white/10 font-semibold" {...props} />,
                          // @ts-ignore
                          td: ({node, ...props}) => <td className="px-4 py-3 border-b border-white/5 text-slate-300" {...props} />,
                          // @ts-ignore
                          code: ({node, inline, ...props}: any) => inline 
                            ? <code className="bg-slate-800/80 text-emerald-300 px-1.5 py-0.5 rounded-md text-xs font-mono" {...props} />
                            : <div className="bg-[#0f1117] border border-white/10 rounded-xl p-4 my-4 overflow-x-auto"><code className="text-sm font-mono text-slate-300" {...props} /></div>
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="flex items-end gap-3"
            >
               <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 border border-emerald-500/30 bg-emerald-500/10">
                  <Bot size={13} className="text-emerald-500" />
               </div>
               <div className="bg-[#161923]/80 backdrop-blur-md px-5 py-4 rounded-2xl rounded-bl-sm border border-white/[0.05] flex gap-1.5 items-center shadow-lg">
                  <span className="w-1.5 h-1.5 bg-emerald-500/60 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-emerald-500/60 rounded-full animate-bounce delay-150"></span>
                  <span className="w-1.5 h-1.5 bg-emerald-500/60 rounded-full animate-bounce delay-300"></span>
               </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* --- Sticky Input Console --- */}
      <div className="absolute bottom-0 w-full bg-gradient-to-t from-[#0a0c10] via-[#0a0c10] to-transparent pt-10 pb-6 px-4 md:px-6">
        <div className="max-w-3xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700"></div>
            
            <div className="relative flex items-center bg-[#161923]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all duration-300 overflow-hidden">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={language === "en" ? "Ask a question..." : "اطرح سؤالاً..."}
                className={`w-full bg-transparent text-slate-100 py-4 px-5 focus:outline-none placeholder:text-slate-500/80 text-sm ${language === 'ar' ? 'text-right font-arabic' : 'text-left'}`}
                autoComplete="off"
              />
              <button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="mr-2 ml-2 p-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 disabled:bg-slate-700/50 disabled:text-slate-500 disabled:cursor-not-allowed transition-all transform active:scale-95 flex items-center justify-center shrink-0"
              >
                <Send size={16} className={language === 'ar' ? 'rotate-180' : ''} />
              </button>
            </div>
            
            <div className="mt-3 flex justify-center">
              <p className="text-[10px] text-slate-500/80 font-medium tracking-wide">
                  AI generations may contain inaccuracies. Consult authoritative scholars for Fiqa rulings.
              </p>
            </div>
        </div>
      </div>
    </div>
  );
}