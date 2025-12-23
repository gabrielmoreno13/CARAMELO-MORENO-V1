
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, AnamnesisData, ChatMessage, Language } from '../types';
import { geminiService } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { Send, Mic, Headphones, LogOut, Brain, MapPin, Sparkles, Image as ImageIcon, Video, Loader2, X, Plus, ExternalLink, Volume2, MicOff } from 'lucide-react';
import { getT } from '../translations';

export const ChatInterface: React.FC<{
  user: UserProfile;
  anamnesis: AnamnesisData;
  onExit: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  language: Language;
}> = ({ user, anamnesis, onExit, isDarkMode, toggleTheme, language }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const t = getT(language);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = async (type: 'chat' | 'thinking' | 'search' | 'image' | 'video' = 'chat') => {
    if (!input.trim() && !preview) return;

    const userMsg: ChatMessage = { 
      id: Date.now().toString(), 
      role: 'user', 
      text: input, 
      image: preview || undefined, 
      timestamp: new Date() 
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setPreview(null);
    setLoading(true);

    try {
      let response;
      if (type === 'thinking') {
        setIsThinking(true);
        response = await geminiService.getDeepResponse(userMsg.text, user, messages);
      } else if (type === 'image') {
        response = await geminiService.generateArt(userMsg.text, "1K", "1:1");
      } else if (type === 'search') {
        response = await geminiService.searchHelp(userMsg.text);
      } else {
        // Fallback para chat normal
        response = await geminiService.getDeepResponse(userMsg.text, user, messages);
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text || "Estou aqui para você.",
        timestamp: new Date(),
        isDeepAnalysis: type === 'thinking'
      };

      // Extrair Grounding se houver
      if ((response as any).candidates?.[0]?.groundingMetadata?.groundingChunks) {
        aiMsg.groundingSources = (response as any).candidates[0].groundingMetadata.groundingChunks.map((c: any) => ({
          title: c.web?.title || c.maps?.title || "Fonte",
          uri: c.web?.uri || c.maps?.uri || "#"
        }));
      }

      // Extrair Imagem se houver
      for (const part of (response as any).candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) aiMsg.image = `data:image/png;base64,${part.inlineData.data}`;
      }

      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setIsThinking(false);
    }
  };

  return (
    <div className={`flex flex-col h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      <header className="p-4 border-b dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-caramel-500 rounded-xl flex items-center justify-center text-white font-black">C</div>
          <div>
            <h1 className="font-bold">Caramelo AI</h1>
            <p className="text-[10px] uppercase tracking-widest text-caramel-500 font-black">Powered by Gemini 3 Pro</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => handleSend('thinking')} className="p-2 hover:bg-caramel-50 dark:hover:bg-caramel-900/30 rounded-lg text-caramel-600" title="Pensamento Profundo"><Brain size={20}/></button>
          <button onClick={() => handleSend('search')} className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg text-blue-600" title="Google Search"><Sparkles size={20}/></button>
          <button onClick={onExit} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg text-red-500"><LogOut size={20}/></button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${m.role === 'user' ? 'bg-caramel-500 text-white' : 'bg-white dark:bg-gray-800 border dark:border-gray-700'}`}>
              {m.isDeepAnalysis && <div className="flex items-center gap-1 text-[10px] font-black uppercase text-caramel-600 mb-2"><Brain size={12}/> Análise Profunda Concluída</div>}
              <ReactMarkdown className="prose dark:prose-invert text-sm">{m.text}</ReactMarkdown>
              {m.image && <img src={m.image} className="mt-3 rounded-xl w-full max-w-sm" alt="AI Generated" />}
              {m.groundingSources && (
                <div className="mt-3 flex flex-wrap gap-2 pt-3 border-t dark:border-gray-700">
                  {m.groundingSources.map((s, i) => (
                    <a key={i} href={s.uri} target="_blank" className="flex items-center gap-1 text-[10px] bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full hover:bg-caramel-100 transition">
                      <ExternalLink size={10}/> {s.title}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-caramel-500 font-bold text-sm animate-pulse">
            <Loader2 className="animate-spin" size={16}/> 
            {isThinking ? "Analisando profundamente sua mente..." : "Caramelo está digitando..."}
          </div>
        )}
      </main>

      <footer className="p-4 bg-white dark:bg-gray-900 border-t dark:border-gray-800">
        <div className="max-w-4xl mx-auto">
          {preview && (
            <div className="relative inline-block mb-3">
              <img src={preview} className="h-20 w-20 object-cover rounded-xl border-2 border-caramel-500" />
              <button onClick={() => setPreview(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={12}/></button>
            </div>
          )}
          <div className="flex gap-2 items-center">
            <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-caramel-500 transition"><ImageIcon size={24}/></button>
            <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = () => setPreview(reader.result as string);
                reader.readAsDataURL(file);
              }
            }} />
            <input 
              className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-caramel-500"
              placeholder="Desabafe aqui..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <button onClick={() => handleSend('chat')} className="bg-caramel-500 text-white p-3 rounded-xl shadow-lg hover:bg-caramel-600 active:scale-95 transition">
              <Send size={20}/>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
