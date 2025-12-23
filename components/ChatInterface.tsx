import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, AnamnesisData, ChatMessage, DailyIntention } from '../types';
import { geminiService } from '../services/geminiService';
import { dataService } from '../services/dataService';
import ReactMarkdown from 'react-markdown';
import { Send, AlertCircle, Mic, Image as ImageIcon, Volume2, X, Loader2, Link as LinkIcon, LogOut, Moon, Sun, Headphones, StopCircle, LayoutGrid, Heart, Sparkles, Brain, CheckSquare, Settings, ExternalLink } from 'lucide-react';

interface ChatInterfaceProps {
  user: UserProfile;
  anamnesis: AnamnesisData;
  onExit: () => void;
  onOpenTools: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

// Helper para formatar data relativa (Hoje, Ontem, etc)
const getRelativeDate = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const daysDiff = Math.floor(diff / (1000 * 3600 * 24));

  if (daysDiff === 0 && now.getDate() === date.getDate()) return "Hoje";
  if (daysDiff === 1) return "Ontem";
  if (daysDiff < 7) return date.toLocaleDateString('pt-BR', { weekday: 'long' });
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
};

// Componente Visualizador de Áudio (Barras que dançam)
const AudioVisualizer = ({ analyser }: { analyser: AnalyserNode | null }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        if (!analyser || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        let animationId: number;
        
        const draw = () => {
            animationId = requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const barWidth = (canvas.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;
            
            // Desenha do centro para as pontas para simular onda
            const centerX = canvas.width / 2;
            
            for (let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i] / 2; // Altura baseada no volume
                
                // Cor gradiente baseada na altura
                ctx.fillStyle = `rgba(245, 158, 11, ${barHeight / 100})`; // Caramelo Color
                
                // Desenha espelhado
                if (i < 20) { // Limita as barras para não ficar muito denso
                   ctx.fillRect(centerX + (i * 8), canvas.height/2 - barHeight/2, 4, barHeight);
                   ctx.fillRect(centerX - (i * 8), canvas.height/2 - barHeight/2, 4, barHeight);
                }
            }
        };
        draw();
        return () => cancelAnimationFrame(animationId);
    }, [analyser]);
    
    return <canvas ref={canvasRef} width={300} height={100} className="opacity-80" />;
};

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ user, anamnesis, onExit, onOpenTools, isDarkMode, toggleTheme }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingText, setThinkingText] = useState("Digitando..."); // Texto dinâmico de loading
  
  const [isRecording, setIsRecording] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [ttsPlaying, setTtsPlaying] = useState<string | null>(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  
  // Features UX
  const [showAvatarConfig, setShowAvatarConfig] = useState(false);
  const [avatarHue, setAvatarHue] = useState(user.avatarHue || 0);
  const [showDailyCheckin, setShowDailyCheckin] = useState(false);
  const [dailyIntentionInput, setDailyIntentionInput] = useState('');
  const [showResourcesMenu, setShowResourcesMenu] = useState(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null); // Ref para o visualizador
  const animationFrameRef = useRef<number | null>(null);

  const quickReplies = ["Estou ansioso", "Não consigo dormir", "Me sinto sozinho", "Preciso desabafar", "Estou tendo crise de pânico"];

  // Efeito para frases de pensamento dinâmicas
  useEffect(() => {
    if (!isLoading) return;
    const thoughts = [
        "Lendo sua mensagem...",
        "Analisando sentimentos...",
        "Consultando psicologia...",
        "Formulando resposta...",
        "Escrevendo..."
    ];
    let i = 0;
    const interval = setInterval(() => {
        setThinkingText(thoughts[i % thoughts.length]);
        i++;
    }, 1500);
    return () => clearInterval(interval);
  }, [isLoading]);

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

  // 2. SCROLL E MANUTENÇÃO
  useEffect(() => {
    if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, selectedImage, historyLoaded]);

  useEffect(() => {
      return () => {
          stopRecording();
          if (audioContextRef.current) audioContextRef.current.close();
          if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      };
  }, []);

  // --- ÁUDIO LOGIC ---
  const startRecording = async () => {
    try {
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
      analyserRef.current = analyser; // Salva para o componente visualizador usar
      
      // Force update para o componente re-renderizar com o novo analyser
      setAvatarHue(prev => prev); 
      
      let mimeType = '';
      if (MediaRecorder.isTypeSupported('audio/mp4')) { mimeType = 'audio/mp4'; } 
      else if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) { mimeType = 'audio/webm;codecs=opus'; } 
      else if (MediaRecorder.isTypeSupported('audio/webm')) { mimeType = 'audio/webm'; }
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => { 
          if (event.data.size > 0) audioChunksRef.current.push(event.data); 
      };
      
      mediaRecorder.onstop = async () => {
        analyserRef.current = null;
        audioCtx.close();
        stream.getTracks().forEach(track => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        if (audioBlob.size > 1000) {
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
              const base64Audio = (reader.result as string).split(',')[1];
              setIsLoading(true);
              const transcribedText = await geminiService.transcribeAudio(base64Audio, mimeType);
              if (transcribedText) {
                 if (isVoiceMode) { handleSend(transcribedText); } 
                 else { setInputValue(transcribedText); setIsLoading(false); }
              } else { setIsLoading(false); }
            };
        } else { setIsLoading(false); }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) { 
        console.error(err); 
        alert("Permissão de microfone necessária."); 
        setIsVoiceMode(false); 
    }
  };

  const stopRecording = () => { 
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') { 
          mediaRecorderRef.current.stop(); 
          setIsRecording(false); 
      } 
  };

  const handlePlayTTS = async (text: string, msgId: string) => {
    if (ttsPlaying === msgId) { 
        audioContextRef.current?.suspend(); 
        setTtsPlaying(null); 
        return; 
    }
    if (audioContextRef.current) { await audioContextRef.current.close(); audioContextRef.current = null; }

    setTtsPlaying(msgId);
    try {
      const audioBuffer = await geminiService.generateSpeech(text);
      if (audioBuffer) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass({ sampleRate: 24000 });
        const context = audioContextRef.current;
        const int16Array = new Int16Array(audioBuffer);
        const float32Array = new Float32Array(int16Array.length);
        for (let i = 0; i < int16Array.length; i++) { float32Array[i] = int16Array[i] / 32768.0; }
        const buffer = context.createBuffer(1, float32Array.length, 24000);
        buffer.copyToChannel(float32Array, 0);
        const source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(context.destination);
        source.start(0);
        source.onended = () => { setTtsPlaying(null); };
      } else { setTtsPlaying(null); }
    } catch (e) { setTtsPlaying(null); }
  };

  const handleSend = async (overrideText?: string) => {
    const textToSend = overrideText || inputValue;
    if ((!textToSend.trim() && !selectedImage) || isLoading) return;
    
    setInputValue(''); 
    setSelectedImage(null); 
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (isRecording) stopRecording(); 
    
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: textToSend, image: selectedImage || undefined, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    if (user.id) dataService.saveMessage(user.id, userMsg);
    
    try {
      const imageBase64 = selectedImage ? selectedImage.split(',')[1] : undefined;
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
    } catch (error) { console.error(error); } 
    finally { setIsLoading(false); }
  };

  // Funções Auxiliares
  const handleSaveIntention = async () => {
     if (!dailyIntentionInput.trim() || !user.id) return;
     const newIntention: DailyIntention = { date: new Date().toISOString().split('T')[0], text: dailyIntentionInput };
     const newData = { ...anamnesis, dailyIntentions: [...(anamnesis.dailyIntentions || []), newIntention] };
     await dataService.saveAnamnesis(user.id, newData);
     setShowDailyCheckin(false);
     handleSend(`Minha intenção para hoje é: ${dailyIntentionInput}. Me ajude a focar nisso.`);
  };
  
  const saveAvatar = async (hue: number) => {
      setAvatarHue(hue);
      if (user.id) await dataService.saveProfile({ ...user, avatarHue: hue });
  };

  // Renderização Agrupada por Data
  const renderMessages = () => {
      const groups: { [key: string]: ChatMessage[] } = {};
      messages.forEach(msg => {
          const dateKey = getRelativeDate(msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp));
          if (!groups[dateKey]) groups[dateKey] = [];
          groups[dateKey].push(msg);
      });

      return Object.entries(groups).map(([dateLabel, msgs]) => (
          <div key={dateLabel} className="mb-6">
              <div className="flex justify-center mb-4">
                  <span className="text-xs font-bold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full uppercase tracking-wider">{dateLabel}</span>
              </div>
              {msgs.map(msg => (
                  <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-fade-in mb-4`}>
                      <div className={`relative max-w-[85%] md:max-w-[70%] px-5 py-4 rounded-2xl text-[15px] leading-relaxed shadow-sm border transition-colors ${msg.role === 'user' ? 'bg-caramel-600 text-white border-caramel-700 rounded-tr-none' : 'bg-white text-gray-800 border-gray-200 rounded-tl-none dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700'}`}>
                          {msg.image && <div className="mb-3 rounded-lg overflow-hidden border border-gray-200/50"><img src={msg.image} alt="Upload" className="max-h-56 object-cover" /></div>}
                          
                          <div className="whitespace-pre-wrap font-sans markdown-content">
                              <ReactMarkdown components={{ 
                                  strong: ({node, ...props}) => <span className="font-bold" {...props} />, 
                                  em: ({node, ...props}) => <span className="italic opacity-90" {...props} />, 
                                  p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                                  ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                                  li: ({node, ...props}) => <li className="pl-1" {...props} />,
                                  a: ({node, ...props}) => <a className="underline font-bold hover:opacity-80" target="_blank" rel="noreferrer" {...props} />
                              }}>
                                  {msg.text}
                              </ReactMarkdown>
                              
                              {/* FONTES RICAS (RICH CARDS) */}
                              {msg.groundingSources && msg.groundingSources.length > 0 && (
                                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/50">
                                      <p className="text-xs font-bold uppercase mb-2 opacity-70 flex items-center gap-1"><Brain size={12}/> Fontes consultadas:</p>
                                      <div className="flex flex-wrap gap-2">
                                          {msg.groundingSources.map((source, idx) => (
                                              <a key={idx} href={source.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-caramel-400 hover:text-caramel-600 transition shadow-sm max-w-full">
                                                  <div className="bg-white dark:bg-gray-600 p-1 rounded-full"><LinkIcon size={10} /></div>
                                                  <span className="truncate max-w-[150px]">{source.title}</span>
                                                  <ExternalLink size={10} className="opacity-50"/>
                                              </a>
                                          ))}
                                      </div>
                                  </div>
                              )}
                          </div>
                          
                          {msg.role === 'model' && (
                              <button onClick={() => handlePlayTTS(msg.text, msg.id)} className={`absolute -bottom-8 left-0 p-2 rounded-full shadow-sm border transition-colors bg-white border-gray-200 text-gray-400 hover:text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-500 hover:scale-110 ${ttsPlaying === msg.id ? 'text-caramel-600 !border-caramel-400' : ''}`}>
                                  {ttsPlaying === msg.id ? <StopCircle size={16} className="animate-pulse text-red-500"/> : <Volume2 size={16} />}
                              </button>
                          )}
                          <span className="text-[10px] absolute bottom-2 right-4 opacity-40">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                  </div>
              ))}
          </div>
      ));
  };

  return (
    <div className={`flex flex-col h-screen transition-colors duration-500 relative ${isVoiceMode ? 'bg-gradient-to-br from-indigo-900 via-gray-900 to-black' : 'bg-[#F5F5F5] dark:bg-gray-900'}`}>
      
      {/* HEADER SIMPLIFICADO */}
      <header className={`px-6 py-4 flex justify-between items-center z-20 transition-colors ${isVoiceMode ? 'text-white' : 'bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700'}`}>
        <div className="flex items-center gap-4">
           <button onClick={onExit} className="hover:opacity-70 transition"><LogOut size={20} /></button>
           <div className="flex items-center gap-3 relative">
             {!isVoiceMode && (
                 <>
                    <button onClick={() => setShowAvatarConfig(!showAvatarConfig)} className="w-10 h-10 rounded-full overflow-hidden border-2 border-caramel-600 transition hover:scale-105" style={{ filter: `hue-rotate(${avatarHue}deg)` }}>
                        <img src="https://images.unsplash.com/photo-1596495578065-6e0763fa1178?q=80&w=200&auto=format&fit=crop" alt="Caramelo" className="w-full h-full object-cover" />
                    </button>
                    <div><h1 className="font-bold text-gray-800 dark:text-white">Caramelo</h1></div>
                 </>
             )}
             {showAvatarConfig && !isVoiceMode && (
                 <div className="absolute top-12 left-0 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl z-50 w-64">
                    <h4 className="font-bold text-sm mb-3 dark:text-white">Estilo do Caramelo</h4>
                    <input type="range" min="0" max="360" value={avatarHue} onChange={(e) => saveAvatar(parseInt(e.target.value))} className="w-full accent-caramel-600"/>
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
                {showResourcesMenu && (
                    <div className="absolute top-12 right-0 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-xl z-50 w-56 flex flex-col gap-1 border border-gray-100 dark:border-gray-700">
                        <button onClick={onOpenTools} className="p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-sm font-bold flex items-center gap-2 dark:text-white"><LayoutGrid size={16}/> Ferramentas</button>
                        <button onClick={() => {setShowResourcesMenu(false); handleSend("Me dê uma missão de autocuidado rápida.");}} className="p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-sm font-bold flex items-center gap-2 dark:text-white"><CheckSquare size={16}/> Missão do Dia</button>
                    </div>
                )}
             </div>
           )}
           <button onClick={() => setIsVoiceMode(!isVoiceMode)} className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all ${isVoiceMode ? 'bg-white text-indigo-900' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200'}`}>
             <Headphones size={18} className={isVoiceMode ? "animate-pulse" : ""}/>
           </button>
           {!isVoiceMode && <button onClick={toggleTheme} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">{isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}</button>}
        </div>
      </header>

      {/* MODAL CHECK-IN */}
      {showDailyCheckin && !isVoiceMode && (
          <div className="absolute inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-fade-in-up">
                  <div className="w-12 h-12 bg-caramel-100 rounded-full flex items-center justify-center mb-4 mx-auto text-caramel-600"><Sparkles size={24}/></div>
                  <h3 className="text-2xl font-bold text-center dark:text-white mb-2">Bom dia, {user.name.split(' ')[0]}!</h3>
                  <input value={dailyIntentionInput} onChange={(e) => setDailyIntentionInput(e.target.value)} placeholder="Minha intenção hoje é..." className="w-full p-4 mt-2 mb-6 bg-gray-50 dark:bg-gray-700 rounded-xl border-none dark:text-white" />
                  <button onClick={handleSaveIntention} className="w-full bg-caramel-600 text-white font-bold py-3 rounded-xl">Definir Intenção</button>
                  <button onClick={() => setShowDailyCheckin(false)} className="w-full text-gray-400 text-sm mt-4">Pular</button>
              </div>
          </div>
      )}

      {/* MODO VOZ COM VISUALIZER */}
      {isVoiceMode ? (
          <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
             {/* Partículas de fundo */}
             <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                 <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
                 <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-caramel-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
             </div>

             <div className="z-10 flex flex-col items-center gap-8 text-center px-6">
                 <div className="relative flex items-center justify-center h-48 w-full">
                    {/* VISUALIZADOR REAL */}
                    {isRecording ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <AudioVisualizer analyser={analyserRef.current} />
                        </div>
                    ) : (
                        <div className={`w-32 h-32 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${ttsPlaying ? 'bg-caramel-500 animate-pulse' : 'bg-white/10 border border-white/20'}`}>
                             {ttsPlaying ? <Volume2 size={48} className="text-white"/> : <Mic size={48} className="text-white opacity-50"/>}
                        </div>
                    )}
                 </div>

                 <div className="h-24 flex items-center justify-center">
                     {isLoading ? (
                         <div className="flex items-center gap-3 text-white/80 bg-white/10 px-6 py-3 rounded-full backdrop-blur-sm animate-pulse">
                             <Loader2 className="animate-spin" /> <span>{thinkingText}</span>
                         </div>
                     ) : (
                         <p className="text-white/90 text-lg font-medium max-w-md line-clamp-3 leading-relaxed drop-shadow-md">
                             {messages[messages.length - 1]?.text || "Toque abaixo para falar..."}
                         </p>
                     )}
                 </div>
                 
                 <button onClick={() => isRecording ? stopRecording() : startRecording()} className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 ${isRecording ? 'bg-red-500 text-white' : 'bg-white text-indigo-900'}`}>
                    {isRecording ? <div className="w-8 h-8 bg-white rounded-md"></div> : <Mic size={32}/>}
                 </button>
             </div>
          </div>
      ) : (
        /* MODO CHAT TEXTO */
        <>
            <div className="flex-1 overflow-y-auto p-4">
                {!historyLoaded ? (
                    <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-caramel-500" size={32} /></div>
                ) : (
                    <>
                        <div className="flex justify-center my-4">
                            <div className="text-xs px-4 py-2 rounded-full flex items-center gap-2 border bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                                <AlertCircle size={12}/> <span>IA de Apoio • Não substitui terapia.</span>
                            </div>
                        </div>
                        {renderMessages()}
                        {isLoading && (
                            <div className="flex justify-start animate-fade-in ml-4 mb-4">
                                <div className="px-5 py-3 rounded-2xl rounded-tl-none border shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700">
                                    <div className="flex items-center gap-2">
                                        <Loader2 size={14} className="animate-spin text-caramel-500"/>
                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 animate-pulse">{thinkingText}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>
            
            <button onClick={() => handleSend("Preciso de esperança agora.")} className="absolute bottom-24 right-4 z-30 bg-pink-500 hover:bg-pink-600 text-white p-3 rounded-full shadow-lg transition hover:scale-110"><Heart fill="currentColor" size={24}/></button>

            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 z-20">
                {messages.length > 0 && !isLoading && !inputValue && (
                    <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar">
                        {quickReplies.map((reply, i) => (
                            <button key={i} onClick={() => handleSend(reply)} className="whitespace-nowrap px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 text-xs font-bold rounded-full hover:bg-caramel-100 dark:hover:bg-caramel-900/40 transition">
                                {reply}
                            </button>
                        ))}
                    </div>
                )}
                {selectedImage && (
                    <div className="flex items-center gap-2 mb-2 p-2 rounded-lg border w-fit bg-gray-50 dark:bg-gray-700"><img src={selectedImage} alt="Preview" className="h-10 w-10 rounded" /><button onClick={() => setSelectedImage(null)}><X size={16}/></button></div>
                )}
                <div className="flex items-end gap-2">
                    <button onClick={() => fileInputRef.current?.click()} className="p-3 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"><ImageIcon size={24}/></button>
                    <input type="file" ref={fileInputRef} onChange={(e) => {const f=e.target.files?.[0]; if(f){const r=new FileReader(); r.onload=()=>setSelectedImage(r.result as string); r.readAsDataURL(f);}}} className="hidden" />
                    
                    <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center px-4 py-2 focus-within:ring-2 ring-caramel-500/50">
                        <textarea value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => {if(e.key === 'Enter' && !e.shiftKey){e.preventDefault(); handleSend();}}} placeholder="Digite sua mensagem..." className="flex-1 bg-transparent border-0 focus:ring-0 resize-none max-h-32 py-2 text-gray-800 dark:text-white" rows={1}/>
                        <button onMouseDown={startRecording} onMouseUp={stopRecording} className={`p-2 transition ${isRecording ? 'text-red-500 scale-110' : 'text-gray-400'}`}><Mic size={20}/></button>
                    </div>
                    <button onClick={() => handleSend()} disabled={(!inputValue.trim() && !selectedImage) || isLoading} className="p-3 bg-caramel-600 text-white rounded-full hover:bg-caramel-700 disabled:opacity-50 transition shadow-lg"><Send size={20}/></button>
                </div>
            </div>
        </>
      )}
    </div>
  );
};