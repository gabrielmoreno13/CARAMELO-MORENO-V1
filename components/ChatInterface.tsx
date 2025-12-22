import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, AnamnesisData, ChatMessage } from '../types';
import { geminiService } from '../services/geminiService';
import { Send, Phone, AlertCircle, Mic, Image as ImageIcon, Volume2, X, Loader2, Link as LinkIcon, LogOut } from 'lucide-react';

interface ChatInterfaceProps {
  user: UserProfile;
  anamnesis: AnamnesisData;
  onExit: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ user, anamnesis, onExit }) => {
  // Geração de saudação local instantânea para evitar delay de rede
  const getInitialGreeting = (): string => {
    const name = user.name.split(' ')[0]; // Primeiro nome
    const mood = anamnesis.mood;

    if (mood === 'Ansioso' || mood === 'Instável') {
      return `Olá, ${name}. Notei que você está se sentindo um pouco ${mood.toLowerCase()} hoje. Respire fundo. Estou aqui para te ouvir sem julgamentos. O que está passando pela sua cabeça agora?`;
    }
    if (mood === 'Deprimido' || mood === 'Apático') {
      return `Oi, ${name}. Sinto muito que esteja se sentindo assim. O Caramelo está aqui com você. Quer me contar um pouco sobre o que tirou sua energia hoje?`;
    }
    if (mood === 'Irritado') {
      return `Olá, ${name}. Percebi que você está irritado. Este é um espaço seguro para desabafar. Quer me dizer o que aconteceu?`;
    }
    return `Olá, ${name}. Sou o Caramelo. Vi que sua queixa principal é sobre "${anamnesis.mainComplaint}". Estou pronto para conversar. Como você está agora?`;
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'model',
      text: getInitialGreeting(),
      timestamp: new Date()
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [ttsPlaying, setTtsPlaying] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Inicializa o serviço silenciosamente (sem chamada de rede bloqueante)
    geminiService.initializeChat(user, anamnesis);
  }, [user, anamnesis]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, selectedImage]);

  const handlePlayTTS = async (text: string, msgId: string) => {
    if (ttsPlaying) return;
    
    setTtsPlaying(msgId);
    try {
      const audioBuffer = await geminiService.generateSpeech(text);
      if (audioBuffer) {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        
        const context = audioContextRef.current;
        const decodedBuffer = await context.decodeAudioData(audioBuffer);
        const source = context.createBufferSource();
        source.buffer = decodedBuffer;
        source.connect(context.destination);
        source.start(0);
        
        source.onended = () => setTtsPlaying(null);
      } else {
        setTtsPlaying(null);
      }
    } catch (e) {
      console.error(e);
      setTtsPlaying(null);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          setIsLoading(true);
          const transcribedText = await geminiService.transcribeAudio(base64Audio);
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
    <div className="flex flex-col h-screen bg-[#F5F5F5]">
      
      <header className="bg-white px-6 py-4 flex justify-between items-center shadow-md z-20 border-b border-gray-200">
        <div className="flex items-center gap-4">
           <button onClick={onExit} className="text-gray-500 hover:text-gray-800 transition">
             <LogOut size={20} />
           </button>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-caramel-500 overflow-hidden border-2 border-caramel-600">
               <img src="https://images.unsplash.com/photo-1596495578065-6e0763fa1178?q=80&w=200&auto=format&fit=crop" alt="Caramelo" className="w-full h-full object-cover" />
             </div>
             <div>
                <h1 className="font-bold text-gray-800 text-lg">Caramelo</h1>
                <p className="text-xs text-gray-500">Assistente de Saúde Mental</p>
             </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           <button 
             onClick={openWhatsApp} 
             className="hidden md:flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-bold transition shadow-sm"
           >
             <Phone size={16} />
             Vamos seguir a conversa no WhatsApp?
           </button>
           <button 
             onClick={openWhatsApp} 
             className="md:hidden bg-green-500 text-white p-2 rounded-full shadow-sm"
             title="Vamos seguir a conversa no WhatsApp?"
           >
             <Phone size={20} />
           </button>
           
           <button onClick={handleSOS} className="p-2 text-red-600 hover:bg-red-50 rounded-full transition border border-red-200" title="Emergência 188">
             <AlertCircle size={24} />
           </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="flex justify-center my-4">
          <div className="bg-white border border-gray-200 text-gray-500 text-xs px-4 py-2 rounded-full shadow-sm flex items-center gap-2">
            <AlertCircle size={12} className="text-caramel-600"/>
            <span>O Caramelo é uma IA e não substitui profissionais de saúde.</span>
          </div>
        </div>
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div
              className={`max-w-[85%] md:max-w-[70%] px-5 py-4 rounded-xl text-[15px] leading-relaxed shadow-sm border ${
                msg.role === 'user'
                  ? 'bg-caramel-600 text-white border-caramel-700 rounded-tr-none'
                  : 'bg-white text-gray-800 border-gray-200 rounded-tl-none'
              }`}
            >
              {msg.image && (
                <div className="mb-3 rounded-lg overflow-hidden border border-gray-200/50">
                  <img src={msg.image} alt="Enviado pelo usuário" className="max-h-56 object-cover" />
                </div>
              )}

              <div className="whitespace-pre-wrap font-sans">{msg.text}</div>
              
              {msg.groundingSources && msg.groundingSources.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-100/50">
                  <p className="text-[10px] opacity-70 font-bold mb-2 flex items-center gap-1">
                    <LinkIcon size={10} /> Referências:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {msg.groundingSources.map((source, idx) => (
                      <a 
                        key={idx} 
                        href={source.uri} 
                        target="_blank" 
                        rel="noreferrer"
                        className={`text-[10px] px-2 py-1 rounded truncate max-w-[150px] ${
                          msg.role === 'user' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {source.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {msg.role === 'model' && (
                 <button 
                   onClick={() => handlePlayTTS(msg.text, msg.id)}
                   className={`absolute -bottom-8 left-0 p-2 rounded-full shadow-sm border bg-white transition-colors ${ttsPlaying === msg.id ? 'text-caramel-600 border-caramel-200' : 'text-gray-400 border-gray-200 hover:text-gray-600'}`}
                 >
                   {ttsPlaying === msg.id ? <Loader2 size={16} className="animate-spin"/> : <Volume2 size={16} />}
                 </button>
              )}
            </div>
             <div className="text-[10px] text-gray-400 mt-1 px-1">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
             </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white px-4 py-3 rounded-xl rounded-tl-none border border-gray-200 shadow-sm flex items-center gap-3">
              <span className="text-xs text-gray-500 font-medium">Analisando...</span>
              <Loader2 size={14} className="text-caramel-600 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
        {selectedImage && (
          <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 rounded-lg border border-gray-200 w-fit">
            <img src={selectedImage} alt="Preview" className="h-12 w-12 object-cover rounded" />
            <button onClick={removeImage} className="text-gray-400 hover:text-red-500"><X size={16}/></button>
          </div>
        )}

        <div className="max-w-4xl mx-auto flex items-end gap-3">
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="mb-1.5 p-2 text-gray-400 hover:text-caramel-600 transition rounded-full hover:bg-gray-100"
          >
            <ImageIcon size={24} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageSelect} 
            accept="image/*" 
            className="hidden" 
          />

          <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-1 flex items-center focus-within:ring-2 focus-within:ring-caramel-100 transition-all border border-transparent focus-within:border-caramel-200">
             <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isRecording ? "Ouvindo..." : "Digite sua mensagem..."}
              disabled={isRecording}
              className={`flex-1 bg-transparent border-0 focus:ring-0 text-gray-800 resize-none max-h-32 placeholder-gray-400 py-3 ${isRecording ? 'animate-pulse text-red-600 font-medium' : ''}`}
              rows={1}
              style={{ minHeight: '48px' }}
            />
             <button
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              className={`p-2 rounded-full transition ${isRecording ? 'text-red-500 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Mic size={20} />
            </button>
          </div>

          <button
            onClick={handleSend}
            disabled={(!inputValue.trim() && !selectedImage) || isLoading || isRecording}
            className="mb-1.5 p-3 bg-caramel-600 text-white rounded-xl hover:bg-caramel-700 disabled:opacity-50 disabled:bg-gray-300 transition shadow-sm"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};