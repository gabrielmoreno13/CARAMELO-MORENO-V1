
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, AnamnesisData, ChatMessage, Language } from '../types';
import { geminiService } from '../services/geminiService';
import { dataService } from '../services/dataService';
import ReactMarkdown from 'react-markdown';
import { Send, Mic, Headphones, LogOut, Moon, Sun, Loader2, PhoneOff, X, Volume2, StopCircle, VolumeX, MicOff, MoreHorizontal, ExternalLink, Settings, Radio } from 'lucide-react';
import { getT } from '../translations';

// --- Audio Helpers ---
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number = 24000): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const buffer = ctx.createBuffer(1, dataInt16.length, sampleRate);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
  return buffer;
}

function createBlob(data: Float32Array): { data: string; mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) int16[i] = data[i] * 32768;
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

export const ChatInterface: React.FC<{
  user: UserProfile;
  anamnesis: AnamnesisData;
  onExit: () => void;
  onOpenTools: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}> = ({ user, anamnesis, onExit, onOpenTools, isDarkMode, toggleTheme, language, onLanguageChange }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [isAutoSpeak, setIsAutoSpeak] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0); 
  const [botAudioLevel, setBotAudioLevel] = useState(0);
  const [callDuration, setCallDuration] = useState(0);

  const t = getT(language);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatSessionRef = useRef<any>(null);
  
  // Audio Refs
  const outAudioCtxRef = useRef<AudioContext | null>(null);
  const inAudioCtxRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const analyserRef = useRef<AnalyserNode | null>(null);
  const botAnalyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const callTimerRef = useRef<any>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    loadHistory();
    return () => cleanupAudio();
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const cleanupAudio = () => {
    activeSourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
    activeSourcesRef.current.clear();
    outAudioCtxRef.current?.close();
    inAudioCtxRef.current?.close();
    micStreamRef.current?.getTracks().forEach(track => track.stop());
    outAudioCtxRef.current = null;
    inAudioCtxRef.current = null;
    micStreamRef.current = null;
    setIsLiveConnected(false);
    nextStartTimeRef.current = 0;
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    setCallDuration(0);
  };

  const loadHistory = async () => {
    const history = await dataService.getChatHistory(user.id!);
    setMessages(history.length ? history : [{
      id: '1', role: 'model', text: t.welcome, timestamp: new Date()
    }]);
    chatSessionRef.current = await geminiService.createChatSession(user, anamnesis, history, language);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTranscription = async () => {
    if (isTranscribing) {
      recorderRef.current?.stop();
      setIsTranscribing(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(',')[1];
          setIsLoading(true);
          const text = await geminiService.transcribeAudio(base64);
          if (text) setInputValue(text);
          setIsLoading(false);
        };
        stream.getTracks().forEach(t => t.stop());
      };

      recorder.start();
      recorderRef.current = recorder;
      setIsTranscribing(true);
    } catch (err) {
      console.error("Mic error:", err);
    }
  };

  const playSpeech = async (text: string) => {
    const audioBufferRaw = await geminiService.generateSpeech(text, language);
    if (audioBufferRaw) {
      if (!outAudioCtxRef.current) outAudioCtxRef.current = new AudioContext({ sampleRate: 24000 });
      const bytes = new Uint8Array(audioBufferRaw);
      const buffer = await decodeAudioData(bytes, outAudioCtxRef.current, 24000);
      const source = outAudioCtxRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(outAudioCtxRef.current.destination);
      nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outAudioCtxRef.current.currentTime);
      source.start(nextStartTimeRef.current);
      nextStartTimeRef.current += buffer.duration;
    }
  };

  const handleSend = async (overrideText?: string) => {
    const text = overrideText || inputValue;
    if (!text.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);
    try {
      if (user.id) dataService.saveMessage(user.id, userMsg);
      const res = await chatSessionRef.current.sendMessage({ message: text });
      
      const groundingSources = res.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
        title: chunk.web?.title || 'Fonte',
        uri: chunk.web?.uri || '#'
      })) || [];

      const aiMsg: ChatMessage = { 
        id: (Date.now()+1).toString(), 
        role: 'model', 
        text: res.text, 
        groundingSources,
        timestamp: new Date() 
      };
      
      setMessages(prev => [...prev, aiMsg]);
      if (user.id) dataService.saveMessage(user.id, aiMsg);
      if (isAutoSpeak) playSpeech(res.text);
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  const startVoiceCall = async () => {
    setIsVoiceMode(true);
    setIsLoading(true);
    setCallDuration(0);
    
    outAudioCtxRef.current = new AudioContext({ sampleRate: 24000 });
    inAudioCtxRef.current = new AudioContext({ sampleRate: 16000 });
    
    botAnalyserRef.current = outAudioCtxRef.current.createAnalyser();
    botAnalyserRef.current.fftSize = 256;
    const botDataArray = new Uint8Array(botAnalyserRef.current.frequencyBinCount);

    const updateBotVisualizer = () => {
      if (botAnalyserRef.current && isVoiceMode) {
        botAnalyserRef.current.getByteFrequencyData(botDataArray);
        const sum = botDataArray.reduce((a, b) => a + b, 0);
        setBotAudioLevel(Math.min(100, (sum / botDataArray.length) * 2));
        requestAnimationFrame(updateBotVisualizer);
      }
    };
    updateBotVisualizer();

    const sessionPromise = geminiService.connectLive({
      systemInstruction: geminiService.buildSystemInstruction(user, anamnesis, language),
      onMessage: async (message) => {
        const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
        if (audioData && outAudioCtxRef.current) {
          const bytes = decode(audioData);
          const buffer = await decodeAudioData(bytes, outAudioCtxRef.current, 24000);
          const source = outAudioCtxRef.current.createBufferSource();
          source.buffer = buffer;
          source.connect(botAnalyserRef.current!);
          botAnalyserRef.current!.connect(outAudioCtxRef.current.destination);
          
          nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outAudioCtxRef.current.currentTime);
          source.start(nextStartTimeRef.current);
          nextStartTimeRef.current += buffer.duration;
          activeSourcesRef.current.add(source);
          source.onended = () => activeSourcesRef.current.delete(source);
        }

        if (message.serverContent?.interrupted) {
          activeSourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
          activeSourcesRef.current.clear();
          nextStartTimeRef.current = 0;
        }
      },
      onClose: () => setIsLiveConnected(false),
      onerror: () => setIsLiveConnected(false)
    });

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      setIsLiveConnected(true);
      setIsLoading(false);

      callTimerRef.current = setInterval(() => setCallDuration(prev => prev + 1), 1000);

      const source = inAudioCtxRef.current.createMediaStreamSource(stream);
      const processor = inAudioCtxRef.current.createScriptProcessor(4096, 1, 1);
      
      analyserRef.current = inAudioCtxRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

      const updateVisualizer = () => {
        if (analyserRef.current && isVoiceMode) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const sum = dataArray.reduce((a, b) => a + b, 0);
          setAudioLevel(Math.min(100, (sum / dataArray.length) * 2.5));
          requestAnimationFrame(updateVisualizer);
        }
      };
      updateVisualizer();

      processor.onaudioprocess = (e) => {
        if (isMuted) return;
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmBlob = createBlob(inputData);
        sessionPromise.then((session) => {
          session.sendRealtimeInput({ media: pcmBlob });
        });
      };

      source.connect(analyserRef.current);
      source.connect(processor);
      processor.connect(inAudioCtxRef.current.destination);
    } catch (err) {
      console.error("Mic error:", err);
      setIsVoiceMode(false);
    }
  };

  const toggleMute = () => {
    if (micStreamRef.current) {
      micStreamRef.current.getAudioTracks().forEach(track => track.enabled = !track.enabled);
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className={`flex flex-col h-screen ${isVoiceMode ? 'bg-black overflow-hidden' : 'bg-gray-50 dark:bg-gray-900'}`}>
      {!isVoiceMode ? (
        <>
          <header className="px-6 py-4 flex justify-between items-center bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-sm z-30">
            <div className="flex items-center gap-3">
              <button onClick={onExit} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full dark:text-white"><LogOut size={20}/></button>
              <div className="font-bold dark:text-white">Caramelo AI</div>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setIsAutoSpeak(!isAutoSpeak)} className={`p-2 rounded-xl transition-all ${isAutoSpeak ? 'text-caramel-600 bg-caramel-50' : 'text-gray-400'}`}>
                {isAutoSpeak ? <Volume2 size={20}/> : <VolumeX size={20}/>}
              </button>
              <button onClick={startVoiceCall} className="bg-caramel-500 hover:bg-caramel-600 text-white font-black py-2.5 px-6 rounded-xl flex items-center gap-2 shadow-lg active:scale-95 transition-all">
                <Headphones size={20}/> {t.voiceCall}
              </button>
              <button onClick={toggleTheme} className="p-2 dark:text-white">{isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}</button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl mx-auto w-full">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                <div className={`max-w-[85%] px-6 py-4 rounded-[2rem] shadow-sm ${m.role === 'user' ? 'bg-caramel-600 text-white rounded-tr-none' : 'bg-white dark:bg-gray-800 dark:text-white border dark:border-gray-700 rounded-tl-none'}`}>
                  <ReactMarkdown className="prose dark:prose-invert text-sm md:text-base leading-relaxed">{m.text}</ReactMarkdown>
                  
                  {m.groundingSources && m.groundingSources.length > 0 && (
                    <div className="mt-4 pt-4 border-t dark:border-gray-700 flex flex-wrap gap-2">
                      {m.groundingSources.map((source, i) => (
                        <a key={i} href={source.uri} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-gray-700 rounded-full text-xs font-bold text-caramel-600 dark:text-caramel-400 hover:bg-caramel-50 transition">
                          <ExternalLink size={12}/> {source.title}
                        </a>
                      ))}
                    </div>
                  )}

                  {m.role === 'model' && (
                    <button onClick={() => playSpeech(m.text)} className="mt-3 text-caramel-500 flex items-center gap-1 text-xs font-black opacity-70 hover:opacity-100">
                      <Volume2 size={14}/> {t.autoSpeak}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-pulse">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl rounded-tl-none border dark:border-gray-700">
                  <MoreHorizontal className="text-gray-300 dark:text-gray-600" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
            <div className="max-w-4xl mx-auto flex gap-3 items-center">
              <button 
                onClick={handleTranscription} 
                className={`p-4 rounded-2xl transition-all ${isTranscribing ? 'bg-red-500 text-white animate-pulse shadow-red-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}
              >
                <Mic size={24}/>
              </button>
              <input 
                value={inputValue} 
                onChange={e => setInputValue(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && handleSend()} 
                placeholder={isTranscribing ? "Escutando..." : t.placeholderChat} 
                className="flex-1 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-caramel-500/50 transition-all" 
              />
              <button onClick={() => handleSend()} className="bg-caramel-600 hover:bg-caramel-700 text-white p-4 rounded-2xl shadow-xl active:scale-95 transition-all"><Send size={24}/></button>
            </div>
          </div>
        </>
      ) : (
        /* --- IMMERSIVE VOICE CALL UI --- */
        <div className="relative h-full w-full flex flex-col items-center justify-between p-8 md:p-12 animate-fade-in text-white overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-caramel-900/40 via-black to-black"></div>
          
          <header className="relative z-20 w-full max-w-4xl flex justify-between items-center bg-white/5 backdrop-blur-3xl px-8 py-5 rounded-[2.5rem] border border-white/10 shadow-2xl">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className={`absolute inset-0 bg-caramel-500 rounded-2xl blur-xl opacity-40 transition-opacity duration-500 ${isLiveConnected ? 'animate-pulse' : 'opacity-0'}`}></div>
                <div className="relative w-14 h-14 bg-caramel-500 rounded-2xl flex items-center justify-center text-white font-black shadow-xl">C</div>
              </div>
              <div>
                <h3 className="font-black text-xl tracking-tight">Caramelo AI</h3>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isLiveConnected ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`}></div>
                  <p className="text-[11px] text-white/40 font-bold uppercase tracking-[0.2em]">{isLiveConnected ? formatDuration(callDuration) : 'Conectando...'}</p>
                </div>
              </div>
            </div>
            <button onClick={onExit} className="p-3.5 hover:bg-white/10 rounded-2xl transition-all active:scale-90"><X size={24}/></button>
          </header>

          <main className="relative z-10 flex flex-col items-center justify-center flex-1 w-full space-y-16">
             <div className="relative w-72 h-72 md:w-[28rem] md:h-[28rem] flex items-center justify-center">
                <div className="absolute inset-0 bg-caramel-500/10 rounded-full blur-[100px] animate-pulse"></div>
                
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="absolute inset-0 border border-caramel-500/10 rounded-full transition-all duration-300" style={{ transform: `scale(${1 + i*0.2 + botAudioLevel/60})`, opacity: Math.max(0, (botAudioLevel/100) - (i*0.2)) }}></div>
                ))}

                <div className="relative w-56 h-56 md:w-72 md:h-72 rounded-full overflow-hidden flex items-center justify-center transition-all duration-200 shadow-[0_0_80px_rgba(245,158,11,0.2)]" style={{ transform: `scale(${1 + botAudioLevel/400 + audioLevel/500})` }}>
                   <div className="absolute inset-0 bg-gradient-to-br from-caramel-600 via-orange-500 to-caramel-400 animate-spin-slow"></div>
                   <div className="absolute inset-0 backdrop-blur-3xl bg-black/10 border border-white/20 rounded-full"></div>
                   <div className="relative z-20 flex items-center justify-center">
                      {botAudioLevel > 5 ? (
                        <div className="flex gap-2 items-end h-16">
                          {[...Array(6)].map((_, i) => (
                            <div key={i} className="w-2 bg-white/90 rounded-full animate-bounce-slow" style={{ height: `${30 + Math.random() * 70}%`, animationDelay: `${i * 0.1}s` }}></div>
                          ))}
                        </div>
                      ) : (
                        <div className="relative">
                          {isMuted ? <MicOff size={64} className="text-white/20" /> : <Mic size={64} className="text-white/80 animate-pulse" />}
                        </div>
                      )}
                   </div>
                </div>

                <svg className="absolute inset-[-40px] w-[calc(100%+80px)] h-[calc(100%+80px)] -rotate-90 pointer-events-none opacity-40">
                  <circle cx="50%" cy="50%" r="48%" fill="none" stroke="white" strokeWidth="2" strokeDasharray={`${audioLevel * 3} 1000`} className="transition-all duration-75" strokeLinecap="round" />
                </svg>
             </div>
             
             <div className="text-center space-y-4 max-w-lg">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/10 mb-2">
                   <div className={`w-1.5 h-1.5 rounded-full bg-caramel-400 ${botAudioLevel > 5 ? 'animate-ping' : ''}`}></div>
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">{botAudioLevel > 5 ? 'Caramelo Processando' : 'Ouvindo Você'}</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40 leading-none">
                  {botAudioLevel > 5 ? 'Caramelo...' : (isMuted ? 'Mudo' : 'Estou ouvindo')}
                </h2>
                <p className="text-white/30 font-bold text-sm md:text-base px-10 tracking-wide uppercase">{t.voiceDesc}</p>
             </div>
          </main>

          <footer className="relative z-30 w-full max-w-lg bg-white/[0.03] backdrop-blur-[60px] p-8 rounded-[4rem] border border-white/10 flex items-center justify-between shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
             <button onClick={toggleMute} className={`p-6 rounded-3xl transition-all active:scale-90 ${isMuted ? 'bg-red-500 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border border-white/5'}`}>
                {isMuted ? <MicOff size={28}/> : <Mic size={28}/>}
             </button>
             <button onClick={() => { cleanupAudio(); setIsVoiceMode(false); }} className="group relative p-10 bg-red-600 hover:bg-red-700 text-white rounded-[2.5rem] shadow-2xl shadow-red-500/40 transition-all hover:scale-105 active:scale-95">
                <div className="absolute inset-0 bg-red-400 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-40 transition-opacity"></div>
                <PhoneOff size={40} className="relative z-10" />
             </button>
             <button className="p-6 bg-white/5 border border-white/5 rounded-3xl text-white/50 hover:bg-white/10 hover:text-white transition-all active:scale-90"><Volume2 size={28}/></button>
          </footer>
          
          <div className="absolute bottom-0 left-0 w-full h-1.5 flex gap-1 items-end px-1 opacity-20">
             {[...Array(60)].map((_, i) => (
                <div key={i} className="flex-1 bg-caramel-500 rounded-t-full transition-all duration-75" style={{ height: `${Math.max(4, (i % 2 === 0 ? audioLevel : botAudioLevel) * (Math.random() + 0.5))}%` }}></div>
             ))}
          </div>
        </div>
      )}
    </div>
  );
};
