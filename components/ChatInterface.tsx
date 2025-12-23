
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, AnamnesisData, ChatMessage, Language } from '../types';
import { geminiService } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { Send, LogOut, Brain, Sparkles, Loader2, X, ExternalLink } from 'lucide-react';

export const ChatInterface: React.FC<{
  user: UserProfile; anamnesis: AnamnesisData; onExit: () => void;
  isDarkMode: boolean; toggleTheme: () => void; language: Language;
}> = ({ user, onExit }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [attachment, setAttachment] = useState<{data: string, type: string} | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const handleSend = async (mode: 'chat' | 'thinking' | 'search' = 'chat') => {
    if (!input.trim() && !attachment) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, image: attachment ? `data:${attachment.type};base64,${attachment.data}` : undefined, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input; const currentAttachment = attachment;
    setInput(''); setAttachment(null); setLoading(true);
    if (mode === 'thinking') setIsThinking(true);

    try {
      let response;
      if (currentAttachment) response = await geminiService.analyzeMultimodal(currentInput || "Analise.", currentAttachment.data, currentAttachment.type);
      else if (mode === 'thinking') response = await geminiService.getDeepResponse(currentInput, user, messages);
      else if (mode === 'search') response = await geminiService.searchAndMap(currentInput);
      else response = await geminiService.getDeepResponse(currentInput, user, messages);

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(), role: 'model', text: response.text || "Estou ouvindo...", timestamp: new Date(), isDeepAnalysis: mode === 'thinking'
      };

      const chunks = (response as any).candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) aiMsg.groundingSources = chunks.map((c: any) => ({ title: c.web?.title || "Fonte", uri: c.web?.uri || "#" }));

      setMessages(prev => [...prev, aiMsg]);
    } catch (e) { console.error(e); } finally { setLoading(false); setIsThinking(false); }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950">
      <header className="px-6 py-4 border-b dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-between items-center z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-caramel-500 rounded-2xl flex items-center justify-center text-white font-black">C</div>
          <h1 className="font-black text-lg">Caramelo <span className="text-caramel-500">v3</span></h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => handleSend('thinking')} className="p-2.5 text-caramel-600 hover:bg-caramel-50 rounded-xl transition"><Brain size={20}/></button>
          <button onClick={() => handleSend('search')} className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition"><Sparkles size={20}/></button>
          <button onClick={onExit} className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition"><LogOut size={20}/></button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4 max-w-4xl mx-auto w-full">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-3xl shadow-sm ${m.role === 'user' ? 'bg-caramel-500 text-white rounded-tr-none' : 'bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-tl-none'}`}>
              {m.isDeepAnalysis && <div className="text-[10px] font-black uppercase text-caramel-600 mb-2 border-b border-caramel-100 pb-1">Thinking Mode v3</div>}
              <div className="prose dark:prose-invert text-sm"><ReactMarkdown>{m.text}</ReactMarkdown></div>
              {m.image && <img src={m.image} className="mt-3 rounded-xl w-full" alt="User upload" />}
              {m.groundingSources && (
                <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t dark:border-gray-700">
                  {m.groundingSources.map((s, i) => <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full flex items-center gap-1 font-bold"><ExternalLink size={10}/> {s.title}</a>)}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && <div className="text-caramel-500 flex items-center gap-2 text-xs font-black animate-pulse"><Loader2 className="animate-spin" size={14}/> {isThinking ? "Thinking Deeply..." : "Processing..."}</div>}
        <div ref={chatEndRef} />
      </main>

      <footer className="p-4 bg-white dark:bg-gray-900 border-t dark:border-gray-800">
        <div className="max-w-4xl mx-auto flex gap-2 items-center">
          {attachment && <div className="relative"><div className="w-12 h-12 rounded-xl border-2 border-caramel-500 overflow-hidden"><img src={`data:${attachment.type};base64,${attachment.data}`} className="object-cover h-full w-full" alt="Attachment" /></div><button onClick={()=>setAttachment(null)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"><X size={10}/></button></div>}
          <div className="flex-1 relative">
            <input className="w-full bg-gray-100 dark:bg-gray-800 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-caramel-500 dark:text-white" placeholder="Desabafe aqui..." value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter' && handleSend()} />
            <button onClick={()=>handleSend()} className="absolute right-2 top-1/2 -translate-y-1/2 bg-caramel-500 text-white p-2.5 rounded-xl shadow-lg transition active:scale-95"><Send size={18}/></button>
          </div>
        </div>
      </footer>
    </div>
  );
};
