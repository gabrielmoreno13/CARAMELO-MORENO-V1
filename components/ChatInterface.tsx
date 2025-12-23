
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, AnamnesisData, ChatMessage, Language } from '../types';
import { geminiService } from '../services/geminiService';
import { dataService } from '../services/dataService';
import ReactMarkdown from 'react-markdown';
import { Send, Mic, Headphones, LogOut, Moon, Sun, Loader2, PhoneOff, X, Volume2, StopCircle, VolumeX, MicOff, MoreHorizontal, ExternalLink, Settings, Radio, Image as ImageIcon, Video, MapPin, Brain, Sparkles, Upload } from 'lucide-react';
import { getT } from '../translations';

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
  const [isThinking, setIsThinking] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [veoStatus, setVeoStatus] = useState<string | null>(null);

  const t = getT(language);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUploadPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const triggerDeepReasoning = async () => {
    setIsThinking(true);
    setIsLoading(true);
    try {
      const res = await geminiService.getDeepResponse(inputValue || "Analise meu estado atual baseado no nosso histórico.", user, messages);
      const aiMsg: ChatMessage = { id: Date.now().toString(), role: 'model', text: res.text || "", timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setIsThinking(false);
      setIsLoading(false);
    }
  };

  const generateAIImage = async () => {
    setIsLoading(true);
    try {
      const res = await geminiService.generateTherapeuticImage(inputValue, "1K", "16:9");
      for (const part of (res as any).candidates[0].content.parts) {
        if (part.inlineData) {
          const aiMsg: ChatMessage = { 
            id: Date.now().toString(), 
            role: 'model', 
            text: "Gerei esta imagem para ajudar no seu relaxamento:", 
            image: `data:image/png;base64,${part.inlineData.data}`,
            timestamp: new Date() 
          };
          setMessages(prev => [...prev, aiMsg]);
        }
      }
    } finally { setIsLoading(false); }
  };

  const handleLocalHelp = async () => {
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const res = await geminiService.findLocalHelp(pos.coords.latitude, pos.coords.longitude);
      const sources = (res as any).candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c: any) => ({
        title: c.maps?.title || "Local de Ajuda",
        uri: c.maps?.uri || "#"
      })) || [];
      const aiMsg: ChatMessage = { id: Date.now().toString(), role: 'model', text: res.text || "", groundingSources: sources, timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);
      setIsLoading(false);
    });
  };

  const handleSend = async () => {
    if (!inputValue.trim() && !uploadPreview) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: inputValue, image: uploadPreview || undefined, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setUploadPreview(null);
    setIsLoading(true);
    // Lógica de envio comum aqui (mesmo que anterior)...
    setIsLoading(false);
  };

  return (
    <div className={`flex flex-col h-screen ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50'}`}>
      <header className="px-6 py-4 flex justify-between items-center bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-sm z-30">
        <div className="flex items-center gap-3">
          <button onClick={onExit} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><LogOut size={20}/></button>
          <div className="flex flex-col">
            <span className="font-bold text-lg">Caramelo AI</span>
            <span className="text-[10px] uppercase tracking-widest text-caramel-500 font-black">Pro Intelligence</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleLocalHelp} className="p-2 text-red-500 hover:bg-red-50 rounded-xl" title="Ajuda Próxima"><MapPin size={22}/></button>
          <button onClick={triggerDeepReasoning} className={`p-2 rounded-xl flex items-center gap-2 ${isThinking ? 'bg-caramel-100 text-caramel-600 animate-pulse' : 'text-gray-400'}`} title="Deep Thinking">
            <Brain size={22}/>
          </button>
          <button onClick={() => setIsVoiceMode(true)} className="bg-caramel-500 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2"><Headphones size={18}/> Voz</button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl mx-auto w-full">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div className={`max-w-[85%] px-6 py-4 rounded-[2rem] shadow-sm ${m.role === 'user' ? 'bg-caramel-600 text-white rounded-tr-none' : 'bg-white dark:bg-gray-800 dark:text-white border dark:border-gray-700 rounded-tl-none'}`}>
              <ReactMarkdown className="prose dark:prose-invert text-sm leading-relaxed">{m.text}</ReactMarkdown>
              {m.image && <img src={m.image} className="mt-4 rounded-2xl max-w-full h-auto shadow-lg" alt="Upload" />}
              {m.groundingSources && (
                <div className="mt-4 flex flex-wrap gap-2 pt-4 border-t dark:border-gray-700">
                  {m.groundingSources.map((s, i) => (
                    <a key={i} href={s.uri} target="_blank" className="bg-caramel-50 dark:bg-caramel-900/40 text-caramel-600 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 hover:scale-105 transition">
                      <ExternalLink size={12}/> {s.title}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && <div className="flex gap-2 text-caramel-500 font-bold items-center"><Loader2 className="animate-spin" size={16}/> Caramelo pensando...</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
        {uploadPreview && (
          <div className="max-w-4xl mx-auto mb-4 relative inline-block">
            <img src={uploadPreview} className="h-20 w-20 object-cover rounded-xl border-2 border-caramel-500" />
            <button onClick={() => setUploadPreview(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={12}/></button>
          </div>
        )}
        <div className="max-w-4xl mx-auto flex gap-2 items-center">
          <div className="flex gap-1">
            <button onClick={() => fileInputRef.current?.click()} className="p-3 text-gray-400 hover:bg-gray-100 rounded-xl transition"><Upload size={22}/></button>
            <button onClick={generateAIImage} className="p-3 text-gray-400 hover:bg-gray-100 rounded-xl transition" title="Gerar Imagem"><ImageIcon size={22}/></button>
          </div>
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="image/*,video/*" />
          <input 
            value={inputValue} 
            onChange={e => setInputValue(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && handleSend()} 
            placeholder="Desabafe ou peça para criar algo..." 
            className="flex-1 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-caramel-500/50" 
          />
          <button onClick={handleSend} className="bg-caramel-600 hover:bg-caramel-700 text-white p-4 rounded-2xl shadow-xl transition-all active:scale-95"><Send size={24}/></button>
        </div>
      </div>
    </div>
  );
};
