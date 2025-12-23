import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, AnamnesisData, ChatMessage, DailyIntention } from '../types';
import { geminiService } from '../services/geminiService';
import { dataService } from '../services/dataService';
import ReactMarkdown from 'react-markdown';
import { Send, AlertCircle, Mic, Image as ImageIcon, Volume2, X, Loader2, Link as LinkIcon, LogOut, Moon, Sun, Headphones, StopCircle, LayoutGrid, Heart, Sparkles, Brain, CheckSquare, Settings } from 'lucide-react';

interface ChatInterfaceProps {
  user: UserProfile;
  anamnesis: AnamnesisData;
  onExit: () => void;
  onOpenTools: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ user, anamnesis, onExit, onOpenTools, isDarkMode, toggleTheme }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [ttsPlaying, setTtsPlaying] = useState<string | null>(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0);
  
  // Features UX
  const [showAvatarConfig, setShowAvatarConfig] = useState(false);
  const [avatarHue, setAvatarHue] = useState(user.avatarHue || 0);
  const [showDailyCheckin, setShowDailyCheckin] = useState(false);
  const [dailyIntentionInput, setDailyIntentionInput] = useState('');
  const [showResourcesMenu, setShowResourcesMenu] = useState(false);
  
  // Refs para controle de hardware/DOM
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const quickReplies = [
    "Estou ansioso",
    "Não consigo dormir",
    "Me sinto sozinho",
    "Preciso desabafar",
    "Estou tendo crise de pânico"
  ];

  const hopeQuotes = [
    "Isso também vai passar. Você já superou dias difíceis antes.",
    "Respire fundo. Você está seguro agora.",
    "Não se cobre tanto. Você está fazendo o melhor que pode.",
    "Um passo de cada vez. O progresso não precisa ser linear.",
    "Você é mais forte do que imagina."
  ];

  // 1. CARREGAMENTO INICIAL
  useEffect(() => {
    let isMounted = true;
    const loadHistoryAndInit = async () => {
        if (!user.id) return;
        try {
            const history = await dataService.getChatHistory(user.id);
            if (!isMounted) return;

            let currentMessages = history;
            if (history.length === 0) {
                 const initialGreeting: ChatMessage = {
                    id: 'init-1',
                    role: 'model',
                    text: `Olá, **${user.name.split(' ')[0]}**. Sou o Caramelo. Estou aqui para te ouvir e te apoiar. Como você está se sentindo agora?`,
                    timestamp: new Date()
                };
                currentMessages = [initialGreeting];
                await dataService.saveMessage(user.id, initialGreeting);
            }
            
            setMessages(currentMessages);
            geminiService.initializeChat(user, anamnesis, currentMessages);

            // Trigger Check-in Matinal
            const today = new Date().toISOString().split('T')[0];
            const lastIntention = anamnesis.dailyIntentions?.[anamnesis.dailyIntentions.length - 1];
            if (!lastIntention || lastIntention.date !== today) {
                setTimeout(() => { if (isMounted) setShowDailyCheckin(true); }, 1500);
            }
        } catch (error) {
            console.error("Erro ao carregar histórico", error);
            geminiService.initializeChat(user, anamnesis, []);
        } finally {
            if (isMounted) setHistoryLoaded(true);
        }
    };
    loadHistoryAndInit();
    return () => { isMounted = false; };
  }, [user.id, anamnesis, user.name]);

  // 2. SCROLL AUTOMÁTICO
  useEffect(() => {
    if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, selectedImage, historyLoaded]);

  // 3. LIMPEZA DE RECURSOS AO DESMONTAR
  useEffect(() => {
      return () => {
          stopRecording();
          if (audioContextRef.current) {
              audioContextRef.current.close();
          }
          if (animationFrameRef.current) {
              cancelAnimationFrame(animationFrameRef.current);
          }
      };
  }, []);

  // 4. LOOP DE CONVERSA POR VOZ
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    // Se acabou de falar (ttsPlaying ficou null), está no modo voz, não está gravando e não está carregando...
    if (!ttsPlaying && isVoiceMode && !isRecording && !isLoading && historyLoaded) {
       // Aguarda um pouco para não cortar o finalzinho do áudio anterior e abre o mic
       timeout = setTimeout(() => {
          startRecording();
       }, 800);
    }
    return () => clearTimeout(timeout);
  }, [ttsPlaying, isVoiceMode, isRecording, isLoading, historyLoaded]);


  // --- FEATURES SECUNDÁRIAS ---
  const handleSaveIntention = async () => {
     if (!dailyIntentionInput.trim() || !user.id) return;
     const newIntention: DailyIntention = { date: new Date().toISOString().split('T')[0], text: dailyIntentionInput };
     const newIntentions = [...(anamnesis.dailyIntentions || []), newIntention];
     const newData = { ...anamnesis, dailyIntentions: newIntentions };
     await dataService.saveAnamnesis(user.id, newData);
     setShowDailyCheckin(false);
     handleSend(`Minha intenção para hoje é: ${dailyIntentionInput}. Me ajude a focar nisso.`);
  };

  const saveAvatar = async (hue: number) => {
      setAvatarHue(hue);
      if (user.id) {
          await dataService.saveProfile({ ...user, avatarHue: hue });
      }
  };

  const handleHopeButton = () => {
      // Mensagem visual do sistema
      const quote = hopeQuotes[Math.floor(Math.random() * hopeQuotes.length)];
      handleSend(`Estou precisando de esperança. Me ajude a acreditar nisso: "${quote}"`);
  };

  const triggerMission = () => {
      setShowResourcesMenu(false);
      handleSend("Gostaria de um pequeno desafio ou missão de autocuidado para hoje. Algo simples e realizável.");
  };

  const triggerEducation = () => {
      setShowResourcesMenu(false);
      handleSend("Pode me explicar brevemente como a ansiedade funciona no cérebro? Use uma linguagem simples.");
  };

  // --- ÁUDIO (TTS & ASR) ---
  const handlePlayTTS = async (text: string, msgId: string) => {
    // Se clicar no mesmo, para.
    if (ttsPlaying === msgId) { 
        audioContextRef.current?.suspend(); 
        setTtsPlaying(null); 
        return; 
    }
    
    // Limpa áudio anterior
    if (audioContextRef.current) { 
        await audioContextRef.current.close(); 
        audioContextRef.current = null; 
    }

    setTtsPlaying(msgId);
    
    try {
      const audioBuffer = await geminiService.generateSpeech(text);
      if (audioBuffer) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass({ sampleRate: 24000 });
        const context = audioContextRef.current;
        
        // Decodificação Manual PCM 16-bit
        const int16Array = new Int16Array(audioBuffer);
        const float32Array = new Float32Array(int16Array.length);
        for (let i = 0; i < int16Array.length; i++) { 
            float32Array[i] = int16Array[i] / 32768.0; 
        }
        
        const buffer = context.createBuffer(1, float32Array.length, 24000);
        buffer.copyToChannel(float32Array, 0);
        const source = context.createBufferSource();
        source.buffer = buffer;
        source.playbackRate.value = 0.95; // Levemente mais lento para soar mais calmo
        source.connect(context.destination);
        source.start(0);
        source.onended = () => { setTtsPlaying(null); };
      } else { 
          setTtsPlaying(null); 
      }
    } catch (e) { 
        console.error("Erro ao reproduzir áudio:", e); 
        setTtsPlaying(null); 
    }
  };

  const updateVolumeIndicator = () => {
    if (analyserRef.current && isRecording) {
      const array = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(array);
      const arraySum = array.reduce((a, value) => a + value, 0);
      const average = arraySum / array.length;
      setAudioVolume(average);
      animationFrameRef.current = requestAnimationFrame(updateVolumeIndicator);
    }
  };

  const startRecording = async () => {
    try {
      // Pausa qualquer TTS ativo antes de ouvir
      if (audioContextRef.current && audioContextRef.current.state === 'running') { 
          audioContextRef.current.suspend(); 
          setTtsPlaying(null); 
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      
      let mimeType = '';
      if (MediaRecorder.isTypeSupported('audio/mp4')) { mimeType = 'audio/mp4'; } 
      else if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) { mimeType = 'audio/webm;codecs=opus'; } 
      else if (MediaRecorder.isTypeSupported('audio/webm')) { mimeType = 'audio/webm'; }
      
      const options = { mimeType, audioBitsPerSecond: 128000 };
      const mediaRecorder = new MediaRecorder(stream, options.mimeType ? options : undefined);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => { 
          if (event.data.size > 0) audioChunksRef.current.push(event.data); 
      };
      
      mediaRecorder.onstop = async () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        setAudioVolume(0);
        analyserRef.current = null;
        audioCtx.close();
        stream.getTracks().forEach(track => track.stop()); // Libera o microfone (luz vermelha apaga)

        const finalMimeType = mediaRecorder.mimeType || mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: finalMimeType });
        
        // Transcreve apenas se o blob tiver tamanho razoável
        if (audioBlob.size > 1000) {
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
              const base64String = (reader.result as string);
              const base64Audio = base64String.split(',')[1];
              setIsLoading(true);
              const transcribedText = await geminiService.transcribeAudio(base64Audio, finalMimeType);
              if (transcribedText && transcribedText.length > 0) {
                 if (isVoiceMode) { handleSend(transcribedText); } 
                 else { setInputValue(transcribedText); setIsLoading(false); }
              } else { 
                  setIsLoading(false); 
              }
            };
        } else {
            setIsLoading(false);
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      updateVolumeIndicator();
    } catch (err) { 
        console.error(err); 
        alert("Para conversar, o navegador precisa de permissão de microfone."); 
        setIsVoiceMode(false); 
    }
  };

  const stopRecording = () => { 
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') { 
          mediaRecorderRef.current.stop(); 
          setIsRecording(false); 
      } 
  };

  const toggleVoiceMode = async () => {
      const newState = !isVoiceMode;
      if (newState) {
          // Hack para desbloquear AudioContext no iOS/Mobile
          try {
             const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
             const ctx = new AudioContextClass(); await ctx.resume(); ctx.close();
          } catch (e) {}
          
          setIsVoiceMode(true);
          if (!isRecording && !isLoading) { startRecording(); }
      } else {
          setIsVoiceMode(false); 
          if (isRecording) stopRecording(); 
          if (audioContextRef.current) audioContextRef.current.suspend(); 
          setTtsPlaying(null);
      }
  };

  const handleSend = async (overrideText?: string) => {
    const textToSend = overrideText || inputValue;
    const imageToSend = selectedImage;
    if ((!textToSend.trim() && !imageToSend) || isLoading) return;
    
    setInputValue(''); 
    setSelectedImage(null); 
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (isRecording) stopRecording(); 
    
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: textToSend, image: imageToSend || undefined, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    
    if (user.id) dataService.saveMessage(user.id, userMsg);
    
    try {
      const imageBase64 = imageToSend ? imageToSend.split(',')[1] : undefined;
      const response = await geminiService.sendMessage(textToSend, imageBase64);
      
      const aiMsg: ChatMessage = { 
          id: (Date.now() + 1).toString(), 
          role: 'model', 
          text: response.text, 
          groundingSources: response.groundingSources, 
          timestamp: new Date() 
      };
      
      setMessages(prev => [...prev, aiMsg]);
      if (user.id) dataService.saveMessage(user.id, aiMsg);
      if (isVoiceMode) { handlePlayTTS(response.text, aiMsg.id); }
      
    } catch (error) { 
        console.error(error); 
        setIsVoiceMode(false); 
    } finally { 
        setIsLoading(false); 
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => setSelectedImage(reader.result as string); reader.readAsDataURL(file); } };
  const removeImage = () => { setSelectedImage(null); if (fileInputRef.current) fileInputRef.current.value = ''; };

  return (
    <div className={`flex flex-col h-screen transition-colors duration-500 relative ${isVoiceMode ? 'bg-gradient-to-br from-indigo-900 via-gray-900 to-black' : 'bg-[#F5F5F5] dark:bg-gray-900'}`}>
      
      {/* HEADER */}
      <header className={`px-6 py-4 flex justify-between items-center z-20 transition-colors ${isVoiceMode ? 'bg-transparent text-white border-0' : 'bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700'}`}>
        <div className="flex items-center gap-4">
           <button onClick={onExit} className={`transition ${isVoiceMode ? 'text-white/70 hover:text-white' : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white'}`}>
             <LogOut size={20} />
           </button>
           <div className="flex items-center gap-3 relative">
             {!isVoiceMode && (
                 <>
                    <button 
                      onClick={() => setShowAvatarConfig(!showAvatarConfig)}
                      className="w-10 h-10 rounded-full overflow-hidden border-2 border-caramel-600 relative group transition-transform hover:scale-105"
                      style={{ filter: `hue-rotate(${avatarHue}deg)` }}
                    >
                        <img src="https://images.unsplash.com/photo-1596495578065-6e0763fa1178?q=80&w=200&auto=format&fit=crop" alt="Caramelo" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Settings size={14} className="text-white"/></div>
                    </button>
                    <div>
                        <h1 className="font-bold text-lg text-gray-800 dark:text-white">Caramelo</h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Apoio Emocional</p>
                    </div>
                 </>
             )}
             
             {/* AVATAR CONFIG DROPDOWN */}
             {showAvatarConfig && !isVoiceMode && (
                 <div className="absolute top-12 left-0 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 w-64 animate-fade-in-up">
                    <h4 className="font-bold text-sm mb-3 dark:text-white">Personalizar Caramelo</h4>
                    <input 
                      type="range" 
                      min="0" 
                      max="360" 
                      value={avatarHue} 
                      onChange={(e) => saveAvatar(parseInt(e.target.value))}
                      className="w-full accent-caramel-600 h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-2">
                       <span>Original</span>
                       <span>Estilo</span>
                    </div>
                 </div>
             )}
           </div>
        </div>
        
        <div className="flex items-center gap-3">
           {!isVoiceMode && (
             <div className="relative">
                <button onClick={() => setShowResourcesMenu(!showResourcesMenu)} className="bg-caramel-100 dark:bg-caramel-900/30 text-caramel-700 dark:text-caramel-300 p-2 px-4 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-caramel-200 transition">
                  <LayoutGrid size={16} /> <span className="hidden sm:inline">Recursos</span>
                </button>
                {/* MENU DE RECURSOS RÁPIDOS */}
                {showResourcesMenu && (
                    <div className="absolute top-12 right-0 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 w-56 animate-fade-in-up flex flex-col gap-1">
                        <button onClick={onOpenTools} className="p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg flex items-center gap-3 transition">
                             <div className="bg-blue-100 dark:bg-blue-900 text-blue-600 p-1.5 rounded-lg"><LayoutGrid size={16}/></div>
                             <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Todas as Ferramentas</span>
                        </button>
                        <button onClick={triggerMission} className="p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg flex items-center gap-3 transition">
                             <div className="bg-orange-100 dark:bg-orange-900 text-orange-600 p-1.5 rounded-lg"><CheckSquare size={16}/></div>
                             <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Missão do Dia</span>
                        </button>
                        <button onClick={triggerEducation} className="p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg flex items-center gap-3 transition">
                             <div className="bg-purple-100 dark:bg-purple-900 text-purple-600 p-1.5 rounded-lg"><Brain size={16}/></div>
                             <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Entender minha Mente</span>
                        </button>
                    </div>
                )}
             </div>
           )}

           <button 
             onClick={toggleVoiceMode}
             className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all ${isVoiceMode ? 'bg-white text-indigo-900 shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 hover:bg-caramel-100 dark:hover:bg-gray-600'}`}
           >
             {isVoiceMode ? <Headphones size={18} className="animate-pulse"/> : <Headphones size={18}/>}
             <span className="hidden md:inline text-xs md:text-sm">{isVoiceMode ? 'Voz' : 'Voz'}</span>
           </button>
           
           {!isVoiceMode && (
               <button onClick={toggleTheme} className="p-2 rounded-full transition text-gray-500 hover:bg-gray-100 dark:text-yellow-400 dark:hover:bg-gray-700">
                  {isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}
               </button>
           )}
        </div>
      </header>

      {/* CHECK-IN MATINAL MODAL */}
      {showDailyCheckin && !isVoiceMode && (
          <div className="absolute inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-fade-in-up border border-white dark:border-gray-700">
                  <div className="w-12 h-12 bg-caramel-100 dark:bg-caramel-900/30 text-caramel-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <Sparkles size={24}/>
                  </div>
                  <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">Bom dia, {user.name.split(' ')[0]}!</h3>
                  <p className="text-center text-gray-600 dark:text-gray-300 mb-6">Definir uma pequena intenção pode mudar o rumo do seu dia.</p>
                  
                  <label className="text-xs font-bold text-gray-500 uppercase">Minha intenção para hoje é...</label>
                  <input 
                    value={dailyIntentionInput}
                    onChange={(e) => setDailyIntentionInput(e.target.value)}
                    placeholder="Ex: Ser mais gentil comigo mesmo..."
                    className="w-full p-4 mt-2 mb-6 bg-gray-50 dark:bg-gray-700 rounded-xl border-none focus:ring-2 focus:ring-caramel-500 dark:text-white"
                  />
                  
                  <button onClick={handleSaveIntention} className="w-full bg-caramel-600 hover:bg-caramel-700 text-white font-bold py-3 rounded-xl transition shadow-lg">
                      Definir Intenção
                  </button>
                  <button onClick={() => setShowDailyCheckin(false)} className="w-full text-gray-400 text-sm mt-4 hover:text-gray-600 dark:hover:text-gray-200">
                      Pular por hoje
                  </button>
              </div>
          </div>
      )}

      {/* OVERLAY DO MODO DE VOZ */}
      {isVoiceMode ? (
          <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
             {/* Background Calmo */}
             <div className="absolute top-0 left-0 w-full h-full opacity-20">
                 <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
                 <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
                 <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
             </div>

             <div className="z-10 flex flex-col items-center gap-8 text-center px-6">
                 {/* Visualização Central */}
                 <div className="relative">
                    <button 
                       onClick={() => isRecording ? stopRecording() : startRecording()}
                       className={`w-40 h-40 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 relative z-20 ${
                           isRecording 
                             ? 'bg-red-500/90 text-white scale-110 shadow-[0_0_50px_rgba(239,68,68,0.5)]' 
                             : ttsPlaying 
                                ? 'bg-caramel-500 text-white animate-pulse shadow-[0_0_50px_rgba(245,158,11,0.5)]'
                                : 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20'
                       }`}
                    >
                        {isRecording ? (
                             <div className="flex flex-col items-center">
                                 <Mic size={48} />
                                 <span className="text-xs font-bold mt-2">Ouvindo...</span>
                                 <span className="text-[10px] mt-1 opacity-70">Toque para enviar</span>
                             </div>
                        ) : ttsPlaying ? (
                             <div className="flex flex-col items-center">
                                 <Volume2 size={48} />
                                 <span className="text-xs font-bold mt-2">Falando...</span>
                             </div>
                        ) : (
                             <div className="flex flex-col items-center opacity-80">
                                 <Mic size={48} />
                                 <span className="text-xs font-bold mt-2">Toque para Falar</span>
                             </div>
                        )}
                        
                        {isRecording && (
                            <>
                                <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping" style={{ animationDuration: '2s' }}></div>
                                <div className="absolute inset-0 rounded-full bg-red-500/20" style={{ transform: `scale(${1 + audioVolume / 50})`, transition: 'transform 0.1s' }}></div>
                            </>
                        )}
                    </button>
                 </div>

                 <div className="space-y-4 max-w-md h-32 flex items-center justify-center">
                     {isLoading ? (
                         <div className="flex items-center gap-3 text-white/80 bg-white/10 px-6 py-3 rounded-full backdrop-blur-sm animate-pulse">
                             <Loader2 className="animate-spin" />
                             <span>Caramelo está pensando...</span>
                         </div>
                     ) : ttsPlaying ? (
                         <p className="text-xl text-white font-medium leading-relaxed drop-shadow-md animate-fade-in line-clamp-4">
                             {messages[messages.length - 1]?.text}
                         </p>
                     ) : (
                         <p className="text-white/60 text-sm">Toque no círculo para falar ou interromper.</p>
                     )}
                 </div>
             </div>

             <button onClick={toggleVoiceMode} className="absolute bottom-10 text-white/50 hover:text-white flex flex-col items-center gap-2 transition hover:scale-105 z-20">
                 <div className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center bg-black/20 backdrop-blur">
                    <X size={24} />
                 </div>
                 <span className="text-xs uppercase tracking-widest">Sair do Modo Voz</span>
             </button>
          </div>
      ) : (
        /* MODO CHAT TEXTO */
        <>
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
                            <span>Apoio Emocional • Não substitui terapia.</span>
                        </div>
                        </div>
                        
                        {messages.map((msg) => (
                        <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-fade-in`}>
                            <div className={`max-w-[85%] md:max-w-[70%] px-5 py-4 rounded-xl text-[15px] leading-relaxed shadow-sm border transition-colors ${msg.role === 'user' ? 'bg-caramel-600 text-white border-caramel-700 rounded-tr-none' : 'bg-white text-gray-800 border-gray-200 rounded-tl-none dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700'}`}>
                            {msg.image && <div className="mb-3 rounded-lg overflow-hidden border border-gray-200/50 dark:border-gray-600"><img src={msg.image} alt="Enviado pelo usuário" className="max-h-56 object-cover" /></div>}
                            <div className="whitespace-pre-wrap font-sans markdown-content">
                                <ReactMarkdown components={{ 
                                    strong: ({node, ...props}) => <span className="font-bold text-current" {...props} />, 
                                    em: ({node, ...props}) => <span className="italic" {...props} />, 
                                    p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                                    ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                                    ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                                    li: ({node, ...props}) => <li className="pl-1" {...props} />,
                                    a: ({node, ...props}) => <a className="underline hover:text-caramel-500 text-caramel-600 dark:text-caramel-400 font-medium" target="_blank" rel="noreferrer" {...props} />
                                }}>
                                {msg.text}
                                </ReactMarkdown>
                                {msg.groundingSources && msg.groundingSources.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50 flex flex-wrap gap-2">
                                        {msg.groundingSources.map((source, idx) => (
                                            <a key={idx} href={source.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded text-gray-500 dark:text-gray-400 hover:text-caramel-600 dark:hover:text-caramel-400 transition">
                                                <LinkIcon size={10} /> {source.title.substring(0, 20)}...
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {msg.role === 'model' && (
                                <button onClick={() => handlePlayTTS(msg.text, msg.id)} className={`absolute -bottom-8 left-0 p-2 rounded-full shadow-sm border transition-colors bg-white border-gray-200 text-gray-400 hover:text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-500 dark:hover:text-caramel-400 ${ttsPlaying === msg.id ? 'text-caramel-600 !border-caramel-400' : ''}`}>
                                {ttsPlaying === msg.id ? <StopCircle size={16} className="animate-pulse text-red-500"/> : <Volume2 size={16} />}
                                </button>
                            )}
                            </div>
                        </div>
                        ))}
                        
                        {isLoading && (
                        <div className="flex justify-start animate-pulse">
                            <div className="px-4 py-3 rounded-xl rounded-tl-none border shadow-sm flex items-center gap-3 bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 transition-colors">
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Caramelo está digitando...</span>
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-caramel-500 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-caramel-500 rounded-full animate-bounce delay-75"></span>
                                <span className="w-1.5 h-1.5 bg-caramel-500 rounded-full animate-bounce delay-150"></span>
                            </div>
                            </div>
                        </div>
                        )}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>
            
            {/* BOTÃO FLUTUANTE DE ESPERANÇA */}
            <button 
                onClick={handleHopeButton}
                className="absolute bottom-24 right-4 z-30 bg-pink-500 hover:bg-pink-600 text-white p-3 rounded-full shadow-lg shadow-pink-500/30 transition-transform hover:scale-110 animate-bounce-slow"
                title="Preciso de esperança"
            >
                <Heart fill="currentColor" size={24}/>
            </button>

            {/* INPUT AREA */}
            <div className="p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20 transition-colors bg-white border-t border-transparent dark:bg-gray-800 dark:border-gray-700">
                {/* Quick Replies */}
                {messages.length > 0 && !isLoading && !inputValue && (
                    <div className="flex gap-2 overflow-x-auto pb-3 mb-1 no-scrollbar mask-gradient">
                        {quickReplies.map((reply, index) => (
                            <button 
                                key={index} 
                                onClick={() => handleSend(reply)}
                                className="whitespace-nowrap px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 text-xs font-bold rounded-full hover:bg-caramel-100 dark:hover:bg-caramel-900/40 hover:text-caramel-700 transition border border-transparent hover:border-caramel-200"
                            >
                                {reply}
                            </button>
                        ))}
                    </div>
                )}

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
                    <textarea value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => {if(e.key === 'Enter' && !e.shiftKey) {e.preventDefault(); handleSend();}}} placeholder="Digite sua mensagem..." className="flex-1 bg-transparent border-0 focus:ring-0 resize-none max-h-32 py-3 text-gray-800 dark:text-gray-100 placeholder-gray-400" rows={1} style={{ minHeight: '48px' }}/>
                    <button onMouseDown={startRecording} onMouseUp={stopRecording} onTouchStart={startRecording} onTouchEnd={stopRecording} className={`p-2 rounded-full transition ${isRecording ? 'text-red-500 scale-110' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}><Mic size={20} /></button>
                </div>
                <button onClick={() => handleSend()} disabled={(!inputValue.trim() && !selectedImage) || isLoading} className="mb-1.5 p-3 bg-caramel-600 text-white rounded-xl hover:bg-caramel-700 disabled:opacity-50 disabled:bg-gray-500 transition shadow-sm"><Send size={20} /></button>
                </div>
            </div>
        </>
      )}
    </div>
  );
};