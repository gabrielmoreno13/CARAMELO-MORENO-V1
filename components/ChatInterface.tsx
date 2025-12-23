import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, AnamnesisData, ChatMessage } from '../types';
import { geminiService } from '../services/geminiService';
import { dataService } from '../services/dataService';
import ReactMarkdown from 'react-markdown';
import { Send, Phone, AlertCircle, Mic, Image as ImageIcon, Volume2, X, Loader2, Link as LinkIcon, LogOut, Moon, Sun } from 'lucide-react';

interface ChatInterfaceProps {
  user: UserProfile;
  anamnesis: AnamnesisData;
  onExit: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ user, anamnesis, onExit, isDarkMode, toggleTheme }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [ttsPlaying, setTtsPlaying] = useState<string | null>(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Carrega histórico do banco e SÓ DEPOIS inicializa o Gemini
  useEffect(() => {
    const loadHistoryAndInit = async () => {
        if (!user.id) return;
        try {
            const history = await dataService.getChatHistory(user.id);
            let currentMessages = history;

            if (history.length === 0) {
                 // Saudação inicial se não houver histórico
                 const initialGreeting: ChatMessage = {
                    id: 'init-1',
                    role: 'model',
                    text: getInitialGreeting(),
                    timestamp: new Date()
                };
                currentMessages = [initialGreeting];
                // Salva a saudação inicial
                await dataService.saveMessage(user.id, initialGreeting);
            }
            
            setMessages(currentMessages);
            // Inicializa a sessão do Gemini com o histórico recuperado
            geminiService.initializeChat(user, anamnesis, currentMessages);

        } catch (error) {
            console.error("Erro ao carregar histórico", error);
            // Inicializa mesmo com erro, para não travar
            geminiService.initializeChat(user, anamnesis, []);
        } finally {
            setHistoryLoaded(true);
        }
    };
    
    loadHistoryAndInit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id, anamnesis]); // Removemos user/anamnesis do initializeChat direto para evitar duplicação

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, selectedImage, historyLoaded]);

  // Geração de saudação local
  const getInitialGreeting = (): string => {
    const name = user.name.split(' ')[0];
    const mood = anamnesis.mood;

    if (mood === 'Ansioso' || mood === 'Instável') {
      return `Olá, **${name}**. Notei que você está se sentindo um pouco *${mood.toLowerCase()}* hoje. Respire fundo. Estou aqui para te ouvir sem julgamentos. \n\nO que está passando pela sua cabeça agora?`;
    }
    if (mood === 'Deprimido' || mood === 'Apático') {
      return `Oi, **${name}**. Sinto muito que esteja se sentindo assim. O Caramelo está aqui com você. \n\nQuer me contar um pouco sobre o que tirou sua energia hoje?`;
    }
    return `Olá, **${name}**. Sou o Caramelo. Vi que sua queixa principal é sobre *"${anamnesis.mainComplaint}"*. \n\nEstou pronto para conversar. Como você está agora?`;
  };

  // Lógica de Áudio (TTS)
  const handlePlayTTS = async (text: string, msgId: string) => {
    if (ttsPlaying) return;
    
    setTtsPlaying(msgId);
    try {
      const audioBuffer = await geminiService.generateSpeech(text);
      if (audioBuffer) {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        
        const context = audioContextRef.current;
        const int16Array = new Int16Array(audioBuffer);
        const float32Array = new Float32Array(int16Array.length);
        
        for (let i = 0; i < int16Array.length; i++) {
          float32Array[i] = int16Array[i] / 32768.0;
        }

        const buffer = context.createBuffer(1, float32Array.length, 24000);
        buffer.copyToChannel(float32Array, 0);

        const source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(context.destination);
        source.start(0);
        
        source.onended = () => setTtsPlaying(null);
      } else {
        setTtsPlaying(null);
      }
    } catch (e) {
      console.error("Erro ao reproduzir áudio:", e);
      setTtsPlaying(null);
    }
  };

  // Gravação de Áudio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm')) mimeType = 'audio/webm';
      else if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
      else if (MediaRecorder.isTypeSupported('audio/ogg')) mimeType = 'audio/ogg';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const finalMimeType = mediaRecorder.mimeType || mimeType;
        const audioBlob = new Blob(audioChunksRef.current, { type: finalMimeType });
        
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          setIsLoading(true);
          const transcribedText = await geminiService.transcribeAudio(base64Audio, finalMimeType);
          setIsLoading(false);
          if (transcribedText) {
            setInputValue(transcribedText);
          }
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone", err);
      alert("Não foi possível acessar o microfone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async () => {
    if ((!inputValue.trim() && !selectedImage) || isLoading) return;

    const currentImage = selectedImage;
    const currentText = inputValue;

    setInputValue('');
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: currentText,
      image: currentImage || undefined,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // Salvar Mensagem do Usuário no Supabase
    if (user.id) {
        dataService.saveMessage(user.id, userMsg).catch(err => console.error("Falha ao salvar msg user", err));
    }

    try {
      const imageBase64 = currentImage ? currentImage.split(',')[1] : undefined;
      const response = await geminiService.sendMessage(currentText, imageBase64);
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text,
        groundingSources: response.groundingSources,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
      
      // Salvar Mensagem da IA no Supabase
      if (user.id) {
        dataService.saveMessage(user.id, aiMsg).catch(err => console.error("Falha ao salvar msg ai", err));
      }

    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const openWhatsApp = () => {
    const text = `Olá, gostaria de seguir a conversa pelo WhatsApp. Sou ${user.name}, usuário do Caramelo.`;
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/5511999999999?text=${encoded}`, '_blank');
  };

  const handleSOS = () => {
     if(window.confirm("Você será redirecionado para o atendimento do CVV (188). Deseja continuar?")) {
         window.open('tel:188');
     }
  };

  return (
    <div className="flex flex-col h-screen transition-colors duration-300 bg-[#F5F5F5] dark:bg-gray-900">
      
      {/* HEADER */}
      <header className="px-6 py-4 flex justify-between items-center shadow-md z-20 border-b transition-colors bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
           <button onClick={onExit} className="transition text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
             <LogOut size={20} />
           </button>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-caramel-500 overflow-hidden border-2 border-caramel-600">
               <img src="https://images.unsplash.com/photo-1596495578065-6e0763fa1178?q=80&w=200&auto=format&fit=crop" alt="Caramelo" className="w-full h-full object-cover" />
             </div>
             <div>
                <h1 className="font-bold text-lg text-gray-800 dark:text-white">Caramelo</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Assistente de Saúde Mental</p>
             </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           <button onClick={toggleTheme} className="p-2 rounded-full transition text-gray-500 hover:bg-gray-100 dark:text-yellow-400 dark:hover:bg-gray-700">
              {isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}
           </button>
           <button onClick={openWhatsApp} className="hidden md:flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-bold transition shadow-sm">
             <Phone size={16} /> WhatsApp
           </button>
           <button onClick={handleSOS} className="p-2 rounded-full transition border text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-900/50 dark:hover:bg-red-900/20">
             <AlertCircle size={24} />
           </button>
        </div>
      </header>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {!historyLoaded ? (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="animate-spin text-caramel-500" size={32} />
            </div>
        ) : (
            <>
                <div className="flex justify-center my-4">
                <div className="text-xs px-4 py-2 rounded-full shadow-sm flex items-center gap-2 border bg-white border-gray-200 text-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 transition-colors">
                    <AlertCircle size={12} className="text-caramel-600"/>
                    <span>O Caramelo é uma IA e não substitui médicos.</span>
                </div>
                </div>
                
                {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-fade-in`}>
                    <div className={`max-w-[85%] md:max-w-[70%] px-5 py-4 rounded-xl text-[15px] leading-relaxed shadow-sm border transition-colors ${msg.role === 'user' ? 'bg-caramel-600 text-white border-caramel-700 rounded-tr-none' : 'bg-white text-gray-800 border-gray-200 rounded-tl-none dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700'}`}>
                    {msg.image && <div className="mb-3 rounded-lg overflow-hidden border border-gray-200/50 dark:border-gray-600"><img src={msg.image} alt="Enviado pelo usuário" className="max-h-56 object-cover" /></div>}
                    <div className="whitespace-pre-wrap font-sans markdown-content">
                        <ReactMarkdown components={{ strong: ({node, ...props}) => <span className="font-bold text-current" {...props} />, em: ({node, ...props}) => <span className="italic" {...props} />, ul: ({node, ...props}) => <ul className="list-disc pl-4 space-y-1 my-2" {...props} />, ol: ({node, ...props}) => <ol className="list-decimal pl-4 space-y-1 my-2" {...props} />, p: ({node, ...props}) => <p className="mb-1 last:mb-0" {...props} /> }}>
                        {msg.text}
                        </ReactMarkdown>
                    </div>
                    {msg.groundingSources && msg.groundingSources.length > 0 && (
                        <div className={`mt-4 pt-3 border-t ${msg.role === 'user' ? 'border-white/20' : 'border-gray-100/50 dark:border-gray-700'}`}>
                        <p className="text-[10px] opacity-70 font-bold mb-2 flex items-center gap-1"><LinkIcon size={10} /> Referências:</p>
                        <div className="flex flex-wrap gap-2">{msg.groundingSources.map((source, idx) => <a key={idx} href={source.uri} target="_blank" rel="noreferrer" className={`text-[10px] px-2 py-1 rounded truncate max-w-[150px] transition ${msg.role === 'user' ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}>{source.title}</a>)}</div>
                        </div>
                    )}
                    {msg.role === 'model' && (
                        <button onClick={() => handlePlayTTS(msg.text, msg.id)} className={`absolute -bottom-8 left-0 p-2 rounded-full shadow-sm border transition-colors bg-white border-gray-200 text-gray-400 hover:text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-500 dark:hover:text-caramel-400 ${ttsPlaying === msg.id ? 'text-caramel-600 !border-caramel-400' : ''}`}>
                        {ttsPlaying === msg.id ? <Loader2 size={16} className="animate-spin"/> : <Volume2 size={16} />}
                        </button>
                    )}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-1 px-1">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                ))}
                
                {isLoading && (
                <div className="flex justify-start animate-pulse">
                    <div className="px-4 py-3 rounded-xl rounded-tl-none border shadow-sm flex items-center gap-3 bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 transition-colors">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Caramelo está digitando...</span>
                    <Loader2 size={14} className="text-caramel-600 animate-spin" />
                    </div>
                </div>
                )}
                <div ref={messagesEndRef} />
            </>
        )}
      </div>

      {/* INPUT AREA */}
      <div className="p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20 transition-colors bg-white border-t border-transparent dark:bg-gray-800 dark:border-gray-700">
        {selectedImage && (
          <div className="flex items-center gap-2 mb-3 p-2 rounded-lg border w-fit bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600">
            <img src={selectedImage} alt="Preview" className="h-12 w-12 object-cover rounded" />
            <button onClick={removeImage} className="text-gray-400 hover:text-red-500"><X size={16}/></button>
          </div>
        )}

        <div className="max-w-4xl mx-auto flex items-end gap-3">
          <button onClick={() => fileInputRef.current?.click()} className="mb-1.5 p-2 transition rounded-full text-gray-400 hover:text-caramel-600 hover:bg-gray-100 dark:hover:text-caramel-400 dark:hover:bg-gray-700"><ImageIcon size={24} /></button>
          <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
          <div className="flex-1 rounded-2xl px-4 py-1 flex items-center focus-within:ring-2 focus-within:ring-caramel-500/50 transition-all border border-transparent bg-gray-100 focus-within:bg-white focus-within:border-caramel-200 dark:bg-gray-700 dark:focus-within:bg-gray-700 dark:text-white">
             <textarea value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} placeholder={isRecording ? "Ouvindo..." : "Digite sua mensagem..."} disabled={isRecording} className={`flex-1 bg-transparent border-0 focus:ring-0 resize-none max-h-32 py-3 text-gray-800 dark:text-gray-100 placeholder-gray-400 ${isRecording ? 'animate-pulse text-red-500 font-medium' : ''}`} rows={1} style={{ minHeight: '48px' }}/>
             <button onMouseDown={startRecording} onMouseUp={stopRecording} onTouchStart={startRecording} onTouchEnd={stopRecording} className={`p-2 rounded-full transition ${isRecording ? 'text-red-500 scale-110' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}><Mic size={20} /></button>
          </div>
          <button onClick={handleSend} disabled={(!inputValue.trim() && !selectedImage) || isLoading || isRecording} className="mb-1.5 p-3 bg-caramel-600 text-white rounded-xl hover:bg-caramel-700 disabled:opacity-50 disabled:bg-gray-500 transition shadow-sm"><Send size={20} /></button>
        </div>
      </div>
    </div>
  );
};