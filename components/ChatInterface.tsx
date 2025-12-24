
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, AnamnesisData, ChatMessage, Language, AppView } from '../types';
import { geminiService } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { Send, LogOut, Brain, Sparkles, Loader2, X, Mic, MicOff, Wind, BookOpen, Trophy, MoreHorizontal, ExternalLink, Volume2, Headphones } from 'lucide-react';

// Auxiliares de Áudio conforme diretrizes Gemini API
function decode(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}

export const ChatInterface: React.FC<{
  user: UserProfile; anamnesis: AnamnesisData; onExit: () => void;
  isDarkMode: boolean; toggleTheme: () => void; language: Language;
  onNavigate: (view: AppView) => void;
}> = ({ user, onExit, onNavigate }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'chat' | 'thinking' | 'search'>('chat');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [showTools, setShowTools] = useState(false);
  
  // Estados de Voz Live
  const [liveTranscription, setLiveTranscription] = useState({ user: '', model: '' });
  const [isLiveActive, setIsLiveActive] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<{ input?: AudioContext, output?: AudioContext }>({});
  const liveSessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'init',
        role: 'model',
        text: `Oi ${user.name}! Sou o Caramelo, seu parceiro de auto-cuidado. Como você está se sentindo agora?`,
        timestamp: new Date()
      }]);
    }
    return () => stopVoiceSession();
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading, liveTranscription]);

  const stopVoiceSession = () => {
    if (liveSessionRef.current) {
      liveSessionRef.current.then((s: any) => s.close());
      liveSessionRef.current = null;
    }
    activeSourcesRef.current.forEach(s => s.stop());
    activeSourcesRef.current.clear();
    setIsLiveActive(false);
    setIsVoiceMode(false);
  };

  const startVoiceSession = async () => {
    try {
      setIsVoiceMode(true);
      setIsLiveActive(true);
      setLiveTranscription({ user: '', model: '' });

      const inCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = { input: inCtx, output: outCtx };

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = geminiService.connectLiveAudio(user.name, {
        onopen: () => {
          const source = inCtx.createMediaStreamSource(stream);
          const processor = inCtx.createScriptProcessor(4096, 1, 1);
          processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const int16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
            sessionPromise.then(s => s.sendRealtimeInput({
              media: { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' }
            }));
          };
          source.connect(processor);
          processor.connect(inCtx.destination);
        },
        onmessage: async (msg: any) => {
          if (msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) {
            const audioData = decode(msg.serverContent.modelTurn.parts[0].inlineData.data);
            const buffer = await decodeAudioData(audioData, outCtx, 24000, 1);
            const source = outCtx.createBufferSource();
            source.buffer = buffer;
            source.connect(outCtx.destination);
            const startTime = Math.max(nextStartTimeRef.current, outCtx.currentTime);
            source.start(startTime);
            nextStartTimeRef.current = startTime + buffer.duration;
            activeSourcesRef.current.add(source);
            source.onended = () => activeSourcesRef.current.delete(source);
          }
          if (msg.serverContent?.interrupted) {
            activeSourcesRef.current.forEach(s => s.stop());
            activeSourcesRef.current.clear();
            nextStartTimeRef.current = 0;
          }
          if (msg.serverContent?.inputAudioTranscription?.text) {
            setLiveTranscription(prev => ({ ...prev, user: prev.user + msg.serverContent.inputAudioTranscription.text }));
          }
          if (msg.serverContent?.outputAudioTranscription?.text) {
            setLiveTranscription(prev => ({ ...prev, model: prev.model + msg.serverContent.outputAudioTranscription.text }));
          }
          if (msg.serverContent?.turnComplete) {
            setMessages(prev => [
              ...prev,
              { id: Date.now().toString(), role: 'user', text: liveTranscription.user, timestamp: new Date() },
              { id: (Date.now() + 1).toString(), role: 'model', text: liveTranscription.model, timestamp: new Date() }
            ]);
            setLiveTranscription({ user: '', model: '' });
          }
        },
        onerror: (e: any) => console.error("Live Error", e),
        onclose: () => setIsLiveActive(false)
      });

      liveSessionRef.current = sessionPromise;
    } catch (e) {
      console.error("Mic error", e);
      setIsVoiceMode(false);
    }
  };

  const handleSend = async (overrideMode?: 'chat' | 'thinking' | 'search') => {
    const activeMode = overrideMode || mode;
    const textToSend = input.trim();
    if (!textToSend || loading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: textToSend, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const aiMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: aiMsgId, role: 'model', text: '', timestamp: new Date(), isDeepAnalysis: activeMode === 'thinking' }]);

    try {
      const stream = await geminiService.getResponseStream(textToSend, user, messages, activeMode);
      let fullText = '';
      for await (const chunk of stream) {
        fullText += chunk.text || '';
        setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: fullText } : m));
      }
      setMode('chat');
    } catch (e) {
      setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: "Houve um problema, mas estou aqui. 🧡" } : m));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-caramel-50 dark:bg-gray-950 transition-colors">
      {/* Voice Mode Overlay */}
      {isVoiceMode && (
        <div className="fixed inset-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-8 animate-fade-in">
          <button onClick={stopVoiceSession} className="absolute top-10 right-10 p-4 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all">
            <X size={32}/>
          </button>
          
          <div className="relative w-64 h-64 mb-12">
            <div className="absolute inset-0 bg-caramel-400/20 rounded-full animate-ping"></div>
            <div className="absolute inset-4 bg-caramel-500/30 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-caramel-500 rounded-[3rem] shadow-2xl flex items-center justify-center text-white transform rotate-6">
                <Volume2 size={48} />
              </div>
            </div>
          </div>

          <div className="max-w-md w-full text-center space-y-6">
             <div className="min-h-[60px]">
                <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Você disse:</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2 italic">"{liveTranscription.user || "Ouvindo..."}"</p>
             </div>
             
             <div className="h-px bg-gray-100 dark:bg-gray-800 w-24 mx-auto"></div>

             <div className="min-h-[100px]">
                <p className="text-caramel-500 text-xs font-black uppercase tracking-widest mb-2">Caramelo:</p>
                <p className="text-2xl font-black text-caramel-600 dark:text-caramel-400 leading-tight">
                  {liveTranscription.model || "Aguardando..."}
                </p>
             </div>
          </div>

          <div className="mt-16 flex flex-col items-center gap-4">
             <div className="flex gap-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-1.5 h-8 bg-caramel-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}></div>
                ))}
             </div>
             <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">Conexão Segura Ativa</p>
          </div>
        </div>
      )}

      <header className="px-6 pt-[calc(env(safe-area-inset-top)+1rem)] pb-4 border-b dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-between items-center z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-caramel-500 rounded-2xl flex items-center justify-center text-white shadow-lg transform -rotate-3">
             <span className="font-black text-xl">C</span>
          </div>
          <div>
            <h1 className="font-black text-base text-gray-900 dark:text-white">Caramelo</h1>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ativo</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5">
          <button onClick={() => setMode(m => m === 'thinking' ? 'chat' : 'thinking')} className={`p-2.5 rounded-xl border-2 transition-all ${mode === 'thinking' ? 'bg-caramel-100 border-caramel-400 text-caramel-700' : 'bg-gray-50 dark:bg-gray-800 border-transparent text-gray-400'}`}><Brain size={18}/></button>
          <button onClick={() => setMode(m => m === 'search' ? 'chat' : 'search')} className={`p-2.5 rounded-xl border-2 transition-all ${mode === 'search' ? 'bg-blue-100 border-blue-400 text-blue-700' : 'bg-gray-50 dark:bg-gray-800 border-transparent text-gray-400'}`}><Sparkles size={18}/></button>
          <button onClick={onExit} className="p-2.5 text-red-400 hover:bg-red-50 rounded-xl transition ml-1"><LogOut size={20}/></button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 max-w-3xl mx-auto w-full no-scrollbar pb-32">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div className={`max-w-[88%] p-5 rounded-[2rem] shadow-sm transition-all ${
              m.role === 'user' ? 'bg-caramel-500 text-white rounded-tr-none' : 'bg-white dark:bg-gray-800 border dark:border-gray-700 text-gray-800 dark:text-gray-100 rounded-tl-none'
            }`}>
              {m.isDeepAnalysis && m.text && (
                 <div className="flex items-center gap-2 mb-2 text-caramel-600 dark:text-caramel-400">
                    <Brain size={12} /> <span className="text-[10px] font-black uppercase tracking-tighter">Análise Atenta</span>
                 </div>
              )}
              <div className="prose dark:prose-invert text-[15px] leading-relaxed font-medium">
                {m.text ? <ReactMarkdown>{m.text}</ReactMarkdown> : <div className="flex gap-1 py-1"><div className="w-2 h-2 bg-gray-200 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-gray-200 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div><div className="w-2 h-2 bg-gray-200 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div></div>}
              </div>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} className="h-4" />
      </main>

      <footer className="p-4 md:p-6 bg-white dark:bg-gray-900 border-t dark:border-gray-800 fixed bottom-0 left-0 right-0 z-30 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
        <div className="max-w-3xl mx-auto flex gap-3 items-center">
          <button onClick={startVoiceSession} className="p-4 rounded-2xl bg-caramel-100 text-caramel-600 dark:bg-gray-800 dark:text-caramel-400 hover:bg-caramel-500 hover:text-white transition-all shadow-md">
            <Headphones size={24}/>
          </button>

          <div className="flex-1 relative">
            <input className={`w-full bg-gray-50 dark:bg-gray-800 rounded-3xl px-6 py-4 pr-16 outline-none border-2 transition-all font-medium dark:text-white shadow-sm ${mode === 'thinking' ? 'border-caramel-300' : mode === 'search' ? 'border-blue-300' : 'border-transparent focus:border-caramel-400'}`} placeholder="Como você está se sentindo?" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <button onClick={() => handleSend()} disabled={!input.trim() || loading} className="bg-caramel-500 disabled:opacity-30 text-white p-3 rounded-2xl shadow-lg transition active:scale-95">
                {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20}/>}
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
