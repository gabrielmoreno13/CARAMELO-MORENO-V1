
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, AnamnesisData, ChatMessage, Language } from '../types';
import { geminiService } from '../services/geminiService';
import { dataService } from '../services/dataService';
import ReactMarkdown from 'react-markdown';
import { Send, Mic, Headphones, LogOut, Moon, Sun, Loader2, PhoneOff, X, Volume2, StopCircle, VolumeX } from 'lucide-react';
import { getT } from '../translations';

function encodeAudio(data: Float32Array): string {
  const int16 = new Int16Array(data.length);
  for (let i = 0; i < data.length; i++) int16[i] = data[i] * 32768;
  let binary = '';
  const bytes = new Uint8Array(int16.buffer);
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
  return buffer;
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
  const [isRecording, setIsRecording] = useState(false);
  const [isAutoSpeak, setIsAutoSpeak] = useState(true);
  
  const chatSessionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const outAudioCtxRef = useRef<AudioContext | null>(null);
  const inAudioCtxRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const currentInputTranscription = useRef('');
  const currentOutputTranscription = useRef('');

  const t = getT(language);

  useEffect(() => {
    loadHistory();
    return () => cleanupAudio();
  }, [language]); // Reinicia sessão se idioma mudar

  const cleanupAudio = () => {
    activeSourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
    activeSourcesRef.current.clear();
    outAudioCtxRef.current?.close();
    inAudioCtxRef.current?.close();
    outAudioCtxRef.current = null;
    inAudioCtxRef.current = null;
  };

  const ensureOutAudioCtx = () => {
    if (!outAudioCtxRef.current) outAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    return outAudioCtxRef.current;
  };

  const playSpeech = async (text: string) => {
    const audioBufferRaw = await geminiService.generateSpeech(text, language);
    if (audioBufferRaw) {
      const ctx = ensureOutAudioCtx();
      const bytes = new Uint8Array(audioBufferRaw);
      const buffer = await decodeAudioData(bytes, ctx);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
      source.start(nextStartTimeRef.current);
      nextStartTimeRef.current += buffer.duration;
      activeSourcesRef.current.add(source);
      source.onended = () => activeSourcesRef.current.delete(source);
    }
  };

  const loadHistory = async () => {
    const history = await dataService.getChatHistory(user.id!);
    setMessages(history.length ? history : [{
      id: '1', role: 'model', text: t.welcome, timestamp: new Date()
    }]);
    chatSessionRef.current = await geminiService.createChatSession(user, anamnesis, history, language);
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
      const aiMsg: ChatMessage = { id: (Date.now()+1).toString(), role: 'model', text: res.text, timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);
      if (user.id) dataService.saveMessage(user.id, aiMsg);
      if (isAutoSpeak) playSpeech(res.text);
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  const startLiveMode = async () => {
    setIsVoiceMode(true);
    setIsLoading(true);
    currentInputTranscription.current = '';
    currentOutputTranscription.current = '';
    const ctxOut = ensureOutAudioCtx();
    inAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    const sessionPromise = geminiService.connectLive({
      systemInstruction: geminiService.buildSystemInstruction(user, anamnesis, language),
      onMessage: async (msg) => {
        const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
        if (audioData && outAudioCtxRef.current) {
          const buffer = await decodeAudioData(new Uint8Array(atob(audioData).split("").map(c => c.charCodeAt(0))), outAudioCtxRef.current);
          const source = outAudioCtxRef.current.createBufferSource();
          source.buffer = buffer;
          source.connect(outAudioCtxRef.current.destination);
          nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outAudioCtxRef.current.currentTime);
          source.start(nextStartTimeRef.current);
          nextStartTimeRef.current += buffer.duration;
          activeSourcesRef.current.add(source);
        }
        if (msg.serverContent?.turnComplete) setIsLoading(false);
      }
    });
    await sessionPromise;
    setIsLiveConnected(true);
    setIsLoading(false);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const source = inAudioCtxRef.current!.createMediaStreamSource(stream);
    const processor = inAudioCtxRef.current!.createScriptProcessor(4096, 1, 1);
    processor.onaudioprocess = (e) => {
      const input = e.inputBuffer.getChannelData(0);
      sessionPromise.then(s => s.sendRealtimeInput({ media: { data: encodeAudio(input), mimeType: 'audio/pcm;rate=16000' } }));
    };
    source.connect(processor);
    processor.connect(inAudioCtxRef.current!.destination);
  };

  return (
    <div className={`flex flex-col h-screen ${isVoiceMode ? 'bg-caramel-900 text-white' : 'bg-gray-50 dark:bg-gray-900'}`}>
      <header className="px-6 py-4 flex justify-between items-center bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-sm z-30">
        <div className="flex items-center gap-3">
          <button onClick={onExit} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full dark:text-white"><LogOut size={20}/></button>
          <div className="font-bold dark:text-white">Caramelo AI</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-1 mr-2">
            {['pt', 'en', 'es'].map(lang => (
              <button 
                key={lang} 
                onClick={() => onLanguageChange(lang as Language)}
                className={`p-1 rounded-full transition-all ${language === lang ? 'bg-white dark:bg-gray-600 shadow-sm scale-110' : 'opacity-50'}`}
              >
                {lang === 'pt' ? '🇧🇷' : lang === 'en' ? '🇺🇸' : '🇪🇸'}
              </button>
            ))}
          </div>
          {!isVoiceMode && (
            <button onClick={() => setIsAutoSpeak(!isAutoSpeak)} className={`p-2 rounded-full transition-all ${isAutoSpeak ? 'text-caramel-600 bg-caramel-50' : 'text-gray-400'}`}>
              {isAutoSpeak ? <Volume2 size={20}/> : <VolumeX size={20}/>}
            </button>
          )}
          <button onClick={isVoiceMode ? () => setIsVoiceMode(false) : startLiveMode} className={`p-2 rounded-full transition-all ${isVoiceMode ? 'bg-red-500 text-white' : 'bg-caramel-100 text-caramel-700'}`}>
            {isVoiceMode ? <PhoneOff size={20}/> : <Headphones size={20}/>}
          </button>
          <button onClick={toggleTheme} className="p-2 dark:text-white">{isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}</button>
        </div>
      </header>

      {isVoiceMode ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-8 animate-fade-in">
          <div className="relative">
             <div className={`w-48 h-48 rounded-full bg-caramel-500/20 flex items-center justify-center border-4 border-caramel-400 ${isLiveConnected ? 'animate-pulse' : ''}`}>
                <div className="w-32 h-32 rounded-full bg-caramel-500 flex items-center justify-center shadow-2xl"><Mic size={48} className="text-white"/></div>
             </div>
          </div>
          <h2 className="text-2xl font-bold">{isLiveConnected ? t.listening : t.connecting}</h2>
          <p className="text-caramel-200">{t.voiceDesc}</p>
          <button onClick={() => setIsVoiceMode(false)} className="mt-8 bg-white/10 px-8 py-3 rounded-full font-bold transition">{t.endCall}</button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              <div className={`max-w-[85%] px-4 py-3 rounded-2xl shadow-sm ${m.role === 'user' ? 'bg-caramel-600 text-white rounded-tr-none' : 'bg-white dark:bg-gray-800 dark:text-white border dark:border-gray-700 rounded-tl-none'}`}>
                <ReactMarkdown className="prose dark:prose-invert text-sm">{m.text}</ReactMarkdown>
                {m.role === 'model' && <button onClick={() => playSpeech(m.text)} className="mt-2 text-caramel-500 p-1 hover:bg-caramel-50 rounded-lg"><Volume2 size={14}/></button>}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef}/>
        </div>
      )}

      {!isVoiceMode && (
        <div className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
          <div className="flex gap-2 max-w-4xl mx-auto items-center">
            <input value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder={t.placeholderChat} className="flex-1 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-3 outline-none" />
            <button onClick={() => handleSend()} className="bg-caramel-600 text-white p-3 rounded-xl"><Send size={20}/></button>
          </div>
        </div>
      )}
    </div>
  );
};
