
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, AnamnesisData, ChatMessage, Language, AppView } from '../types';
import { geminiService } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { Send, LogOut, Brain, Sparkles, Loader2, X, Mic, MicOff, Wind, BookOpen, Trophy, MoreHorizontal, ExternalLink } from 'lucide-react';

export const ChatInterface: React.FC<{
  user: UserProfile; anamnesis: AnamnesisData; onExit: () => void;
  isDarkMode: boolean; toggleTheme: () => void; language: Language;
  onNavigate: (view: AppView) => void;
}> = ({ user, onExit, onNavigate }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'chat' | 'thinking' | 'search'>('chat');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Saudação inicial
    if (messages.length === 0) {
      setMessages([{
        id: 'init',
        role: 'model',
        text: `Oi ${user.name}! Sou o Caramelo, seu parceiro de auto-cuidado. Como você está se sentindo agora?`,
        timestamp: new Date()
      }]);
    }
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const handleSend = async (overrideMode?: 'chat' | 'thinking' | 'search') => {
    const activeMode = overrideMode || mode;
    if (!input.trim()) return;

    const userMsg: ChatMessage = { 
      id: Date.now().toString(), 
      role: 'user', 
      text: input, 
      timestamp: new Date() 
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await geminiService.getResponse(input, user, messages, activeMode);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text || "Estou aqui com você.",
        timestamp: new Date(),
        isDeepAnalysis: activeMode === 'thinking'
      };

      // Fix: Extract grounding metadata to display source links as required by GenAI guidelines
      const chunks = (response as any).candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        aiMsg.groundingSources = chunks
          .filter((c: any) => c.web)
          .map((c: any) => ({ 
            title: c.web?.title || "Fonte", 
            uri: c.web?.uri || "#" 
          }));
      }

      setMessages(prev => [...prev, aiMsg]);
      setMode('chat'); // Reset mode after use
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { id: 'err', role: 'model', text: "Houve um pequeno problema, mas ainda estou aqui.", timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-caramel-50 dark:bg-gray-950 transition-colors">
      {/* Header Compacto */}
      <header className="px-6 py-3 border-b dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-between items-center z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-caramel-500 rounded-xl flex items-center justify-center text-white font-black text-xl">C</div>
          <div>
            <h1 className="font-black text-sm text-gray-900 dark:text-white">Caramelo <span className="text-caramel-500">v3</span></h1>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setMode(mode === 'thinking' ? 'chat' : 'thinking')} 
            className={`p-2.5 rounded-xl transition-all ${mode === 'thinking' ? 'bg-caramel-100 text-caramel-600' : 'text-gray-400 hover:bg-gray-50'}`}
            title="Análise Profunda"
          >
            <Brain size={20}/>
          </button>
          <button 
            onClick={() => setMode(mode === 'search' ? 'chat' : 'search')} 
            className={`p-2.5 rounded-xl transition-all ${mode === 'search' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-50'}`}
            title="Busca Local"
          >
            <Sparkles size={20}/>
          </button>
          <button onClick={onExit} className="p-2.5 text-red-400 hover:bg-red-50 rounded-xl transition"><LogOut size={20}/></button>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4 max-w-2xl mx-auto w-full">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div className={`max-w-[85%] p-4 rounded-[1.5rem] shadow-sm ${
              m.role === 'user' 
                ? 'bg-caramel-500 text-white rounded-tr-none' 
                : 'bg-white dark:bg-gray-800 border dark:border-gray-700 text-gray-800 dark:text-gray-100 rounded-tl-none'
            }`}>
              {m.isDeepAnalysis && <div className="text-[10px] font-black uppercase text-caramel-500 mb-2 tracking-widest">Pensando...</div>}
              <div className="prose dark:prose-invert text-[15px] leading-relaxed font-medium">
                <ReactMarkdown>{m.text}</ReactMarkdown>
              </div>

              {/* Added rendering for grounding sources to satisfy "ALWAYS extract and list URLs" requirement */}
              {m.groundingSources && m.groundingSources.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Fontes:</p>
                  <div className="flex flex-wrap gap-2">
                    {m.groundingSources.map((source, idx) => (
                      <a 
                        key={idx} 
                        href={source.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 bg-gray-50 dark:bg-gray-700 px-3 py-1.5 rounded-full text-[10px] font-bold text-caramel-600 dark:text-caramel-400 border border-gray-100 dark:border-gray-600 hover:scale-105 transition-transform"
                      >
                        <ExternalLink size={10}/>
                        {source.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl rounded-tl-none border dark:border-gray-700 flex items-center gap-3">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-caramel-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-caramel-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-caramel-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
                <span className="text-[10px] font-black text-caramel-500 uppercase tracking-widest">Caramelo está ouvindo</span>
             </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </main>

      {/* Toolbar / Quick Actions */}
      {showTools && (
        <div className="px-4 py-3 bg-white dark:bg-gray-900 border-t dark:border-gray-800 flex gap-3 overflow-x-auto no-scrollbar animate-fade-in-up">
           <button onClick={() => onNavigate(AppView.TOOLS)} className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 px-4 py-2 rounded-full text-xs font-black whitespace-nowrap"><Wind size={14}/> Respirar</button>
           <button onClick={() => onNavigate(AppView.TOOLS)} className="flex items-center gap-2 bg-pink-50 dark:bg-pink-900/30 text-pink-600 px-4 py-2 rounded-full text-xs font-black whitespace-nowrap"><BookOpen size={14}/> Diário</button>
           <button onClick={() => onNavigate(AppView.TOOLS)} className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 px-4 py-2 rounded-full text-xs font-black whitespace-nowrap"><Trophy size={14}/> Vitórias</button>
        </div>
      )}

      {/* Footer / Input Area */}
      <footer className="p-4 bg-white dark:bg-gray-900 border-t dark:border-gray-800 pb-8 md:pb-6">
        <div className="max-w-2xl mx-auto flex gap-2 items-center">
          <button 
            onClick={() => setShowTools(!showTools)}
            className={`p-3.5 rounded-2xl transition-all ${showTools ? 'bg-caramel-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}
          >
            <MoreHorizontal size={20}/>
          </button>

          <div className="flex-1 relative group">
            <input 
              className={`w-full bg-gray-100 dark:bg-gray-800 rounded-2xl px-5 py-4 outline-none border-2 transition-all font-medium dark:text-white ${
                mode === 'thinking' ? 'border-caramel-300' : mode === 'search' ? 'border-blue-300' : 'border-transparent focus:border-caramel-400'
              }`}
              placeholder={mode === 'thinking' ? "Pensando profundamente..." : mode === 'search' ? "Buscando ao redor..." : "O que está passando pela sua cabeça?"}
              value={input} 
              onChange={e=>setInput(e.target.value)} 
              onKeyDown={e=>e.key==='Enter' && handleSend()} 
            />
            
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button 
                onClick={() => setIsVoiceActive(!isVoiceActive)}
                className={`p-2.5 rounded-xl transition-all ${isVoiceActive ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              >
                {isVoiceActive ? <MicOff size={18}/> : <Mic size={18}/>}
              </button>
              <button 
                onClick={()=>handleSend()} 
                disabled={!input.trim()}
                className="bg-caramel-500 disabled:opacity-30 text-white p-2.5 rounded-xl shadow-lg transition active:scale-95"
              >
                <Send size={18}/>
              </button>
            </div>
          </div>
        </div>
        {mode !== 'chat' && (
           <p className="text-[10px] text-center mt-2 font-black uppercase tracking-widest text-caramel-500 animate-pulse">
             {mode === 'thinking' ? "Modo de Análise Profunda Ativo" : "Modo de Busca em Tempo Real Ativo"}
           </p>
        )}
      </footer>
    </div>
  );
};
