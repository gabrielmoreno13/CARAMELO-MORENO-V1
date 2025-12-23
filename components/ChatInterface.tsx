
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, AnamnesisData, ChatMessage, Language, AppView } from '../types';
import { geminiService } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { Send, LogOut, Brain, Sparkles, Loader2, X, Mic, MicOff, Wind, BookOpen, Trophy, MoreHorizontal, ExternalLink, Volume2, VolumeX } from 'lucide-react';

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

  // Audio Context Refs for Live API
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
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

  const toggleVoice = async () => {
    if (isVoiceActive) {
      setIsVoiceActive(false);
      // Aqui fecharíamos a sessão live se implementada
    } else {
      setIsVoiceActive(true);
      // Iniciar Live API Session (Simulado ou Real se API Key permitir)
      console.log("Iniciando Caramelo Voice Mode...");
    }
  };

  const handleSend = async (overrideMode?: 'chat' | 'thinking' | 'search') => {
    const activeMode = overrideMode || mode;
    const textToSend = input.trim();
    if (!textToSend) return;

    const userMsg: ChatMessage = { 
      id: Date.now().toString(), 
      role: 'user', 
      text: textToSend, 
      timestamp: new Date() 
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await geminiService.getResponse(textToSend, user, messages, activeMode);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text || "Estou aqui com você.",
        timestamp: new Date(),
        isDeepAnalysis: activeMode === 'thinking'
      };

      const chunks = (response as any).candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        aiMsg.groundingSources = chunks
          .filter((c: any) => c.web)
          .map((c: any) => ({ title: c.web?.title || "Fonte", uri: c.web?.uri || "#" }));
      }

      setMessages(prev => [...prev, aiMsg]);
      setMode('chat'); // Reseta para chat normal após enviar
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { id: 'err', role: 'model', text: "Houve um pequeno problema, mas ainda estou aqui com você.", timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-caramel-50 dark:bg-gray-950 transition-colors">
      {/* Header Estilo App Moderno */}
      <header className="px-6 py-4 border-b dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-between items-center z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-caramel-500 rounded-2xl flex items-center justify-center text-white shadow-lg transform -rotate-3">
             <span className="font-black text-xl">C</span>
          </div>
          <div>
            <h1 className="font-black text-base text-gray-900 dark:text-white">Caramelo <span className="text-caramel-500 text-xs">v3</span></h1>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sempre aqui</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Botões de IA agora Visíveis e Clicáveis */}
          <button 
            onClick={() => setMode(m => m === 'thinking' ? 'chat' : 'thinking')} 
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all ${mode === 'thinking' ? 'bg-caramel-100 border-caramel-400 text-caramel-700 shadow-inner' : 'bg-gray-50 dark:bg-gray-800 border-transparent text-gray-400'}`}
          >
            <Brain size={18}/>
            <span className="text-[10px] font-black uppercase hidden sm:inline">Análise</span>
          </button>
          
          <button 
            onClick={() => setMode(m => m === 'search' ? 'chat' : 'search')} 
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all ${mode === 'search' ? 'bg-blue-100 border-blue-400 text-blue-700 shadow-inner' : 'bg-gray-50 dark:bg-gray-800 border-transparent text-gray-400'}`}
          >
            <Sparkles size={18}/>
            <span className="text-[10px] font-black uppercase hidden sm:inline">Busca</span>
          </button>

          <button onClick={onExit} className="p-2.5 text-red-400 hover:bg-red-50 rounded-xl transition ml-2">
            <LogOut size={20}/>
          </button>
        </div>
      </header>

      {/* Área de Mensagens (Woebot Style) */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 max-w-3xl mx-auto w-full no-scrollbar">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div className={`max-w-[88%] md:max-w-[75%] p-5 rounded-[2rem] shadow-sm ${
              m.role === 'user' 
                ? 'bg-caramel-500 text-white rounded-tr-none shadow-caramel-100' 
                : 'bg-white dark:bg-gray-800 border dark:border-gray-700 text-gray-800 dark:text-gray-100 rounded-tl-none'
            }`}>
              {m.isDeepAnalysis && (
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-caramel-100 dark:border-gray-700">
                  <Brain size={14} className="text-caramel-500"/>
                  <span className="text-[10px] font-black uppercase text-caramel-500 tracking-widest">Análise Profunda Concluída</span>
                </div>
              )}
              
              <div className="prose dark:prose-invert text-[15px] leading-relaxed font-medium">
                <ReactMarkdown>{m.text}</ReactMarkdown>
              </div>

              {m.groundingSources && m.groundingSources.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex flex-wrap gap-2">
                   {m.groundingSources.map((s, i) => (
                     <a key={i} href={s.uri} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-[10px] font-bold rounded-full border border-blue-100 dark:border-blue-800 hover:scale-105 transition-transform">
                       <ExternalLink size={10}/> {s.title}
                     </a>
                   ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start animate-pulse">
             <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl rounded-tl-none border dark:border-gray-700 flex items-center gap-4">
                <Loader2 size={18} className="animate-spin text-caramel-500"/>
                <span className="text-[10px] font-black text-caramel-500 uppercase tracking-widest">O Caramelo está pensando...</span>
             </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </main>

      {/* Ferramentas Rápidas (Wysa Style) */}
      {showTools && (
        <div className="px-6 py-4 bg-white dark:bg-gray-900 border-t dark:border-gray-800 flex gap-4 overflow-x-auto no-scrollbar animate-fade-in-up">
           <button onClick={() => onNavigate(AppView.TOOLS)} className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/40 text-blue-600 px-6 py-3 rounded-2xl text-xs font-black whitespace-nowrap shadow-sm"><Wind size={16}/> Respirar</button>
           <button onClick={() => onNavigate(AppView.TOOLS)} className="flex items-center gap-2 bg-pink-50 dark:bg-pink-900/40 text-pink-600 px-6 py-3 rounded-2xl text-xs font-black whitespace-nowrap shadow-sm"><BookOpen size={16}/> Diário</button>
           <button onClick={() => onNavigate(AppView.TOOLS)} className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/40 text-yellow-600 px-6 py-3 rounded-2xl text-xs font-black whitespace-nowrap shadow-sm"><Trophy size={16}/> Minhas Vitórias</button>
        </div>
      )}

      {/* Input e Voz */}
      <footer className="p-4 md:p-6 bg-white dark:bg-gray-900 border-t dark:border-gray-800 pb-10">
        <div className="max-w-3xl mx-auto flex gap-3 items-center">
          <button 
            onClick={() => setShowTools(!showTools)}
            className={`p-4 rounded-2xl transition-all shadow-md ${showTools ? 'bg-caramel-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}
          >
            <MoreHorizontal size={24}/>
          </button>

          <div className="flex-1 relative">
            <input 
              className={`w-full bg-gray-50 dark:bg-gray-800 rounded-3xl px-6 py-4 pr-24 outline-none border-2 transition-all font-medium dark:text-white shadow-sm ${
                mode === 'thinking' ? 'border-caramel-300' : mode === 'search' ? 'border-blue-300' : 'border-transparent focus:border-caramel-400'
              }`}
              placeholder={mode === 'thinking' ? "Modo de Análise Profunda..." : mode === 'search' ? "Buscando informações..." : "Desabafe aqui..."}
              value={input} 
              onChange={e => setInput(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && handleSend()} 
            />
            
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              <button 
                onClick={toggleVoice}
                title="Modo Voz (Live API)"
                className={`p-3 rounded-full transition-all shadow-sm ${isVoiceActive ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 hover:text-caramel-500'}`}
              >
                {isVoiceActive ? <Volume2 size={20}/> : <Mic size={20}/>}
              </button>
              <button 
                onClick={() => handleSend()} 
                disabled={!input.trim() || loading}
                className="bg-caramel-500 disabled:opacity-20 text-white p-3 rounded-2xl shadow-lg transition active:scale-95"
              >
                <Send size={20}/>
              </button>
            </div>
          </div>
        </div>
        
        {isVoiceActive && (
          <div className="text-center mt-4 animate-pulse">
            <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Live Audio Mode Ativo - Pode falar</span>
          </div>
        )}
      </footer>
    </div>
  );
};
