import React, { useState, useEffect } from 'react';
import { AppView, AnamnesisData, MoodEntry, GratitudeEntry, CbtWinEntry } from '../types';
import { Wind, Anchor, ArrowLeft, Play, Pause, X, TrendingUp, Smile, BookOpen, PenTool, CheckCircle, Save, Calendar, BarChart2, Moon, Sun, Trophy, Download } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { dataService } from '../services/dataService';

interface SelfCareToolsProps {
  onNavigate: (view: AppView) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const SelfCareTools: React.FC<SelfCareToolsProps> = ({ onNavigate, isDarkMode, toggleTheme }) => {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [userData, setUserData] = useState<AnamnesisData | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
       const { data: { session } } = await supabase.auth.getSession();
       if (session?.user) {
           setUserId(session.user.id);
           const data = await dataService.getAnamnesis(session.user.id);
           setUserData(data);
       }
    };
    loadData();
  }, []);

  const saveUserData = async (newData: AnamnesisData) => {
      setUserData(newData);
      if (userId) {
          await dataService.saveAnamnesis(userId, newData);
      }
  };

  // --- FUNÇÃO DE EXPORTAR RELATÓRIO ---
  const handleExport = () => {
      if (!userData) return;
      
      const printContent = `
        RELATÓRIO DE BEM-ESTAR - CARAMELO APP
        Data: ${new Date().toLocaleDateString()}
        
        -- ESTADO ATUAL --
        Humor Recente: ${userData.mood}
        Ansiedade (1-10): ${userData.anxietyLevel}
        Sono (1-10): ${userData.sleepQuality}
        
        -- REGISTROS DE HUMOR (Últimos 7 dias) --
        ${userData.moodHistory?.slice(-7).map(m => 
            `${new Date(m.date).toLocaleDateString()}: Nível ${m.level}`
        ).join('\n') || 'Sem registros recentes.'}
        
        -- TRIUNFOS COGNITIVOS (Reestruturações) --
        ${userData.cbtWins?.slice(-5).map(w => 
            `- Pensamento: "${w.negativeThought}"\n  Reestruturação: "${w.reframe}"`
        ).join('\n\n') || 'Nenhum registro.'}
        
        Este documento é para uso pessoal e não substitui diagnóstico médico.
      `;
      
      const blob = new Blob([printContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Relatorio_Caramelo_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  // --- FERRAMENTA: GALERIA DE VITÓRIAS ---
  const WinsGallery = () => {
      const wins = userData?.cbtWins || [];

      return (
        <div className="animate-fade-in h-full flex flex-col">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-6">
                 <Trophy className="text-yellow-500"/> Galeria de Vitórias
            </h3>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-xl border border-yellow-100 dark:border-yellow-800/30 mb-6">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      Aqui ficam guardados os momentos em que você venceu seus pensamentos negativos. Releia para lembrar da sua força.
                  </p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                 {wins.length === 0 && <p className="text-center text-gray-400 mt-10">Você ainda não registrou reestruturações.</p>}
                 {wins.map(win => (
                     <div key={win.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden">
                         <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                         <p className="text-xs text-red-400 font-bold uppercase mb-1">O que eu pensava:</p>
                         <p className="text-gray-500 dark:text-gray-400 italic mb-4 text-sm">"{win.negativeThought}"</p>
                         
                         <p className="text-xs text-green-500 font-bold uppercase mb-1">A verdade:</p>
                         <p className="text-gray-800 dark:text-white font-medium">"{win.reframe}"</p>
                         <p className="text-[10px] text-gray-300 mt-3 text-right">{new Date(win.date).toLocaleDateString()}</p>
                     </div>
                 ))}
            </div>
        </div>
      );
  };

  // --- FERRAMENTA 1: MONITOR DE HUMOR (MOOD TRACKER) ---
  const MoodTracker = () => {
    const [selectedMood, setSelectedMood] = useState<number | null>(null);
    const [savedToday, setSavedToday] = useState(false);

    const moods = [
        { level: 1, icon: '😫', label: 'Péssimo' },
        { level: 2, icon: '😕', label: 'Ruim' },
        { level: 3, icon: '😐', label: 'Ok' },
        { level: 4, icon: '🙂', label: 'Bom' },
        { level: 5, icon: '🤩', label: 'Incrível' },
    ];

    const handleSaveMood = async () => {
        if (!selectedMood || !userData) return;
        
        const newEntry: MoodEntry = {
            date: new Date().toISOString(),
            level: selectedMood
        };

        const history = userData.moodHistory || [];
        const newData = { ...userData, moodHistory: [...history, newEntry] };
        
        await saveUserData(newData);
        setSavedToday(true);
    };

    const history = userData?.moodHistory || [];
    const last7 = history.slice(-7);

    return (
        <div className="animate-fade-in space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <TrendingUp className="text-caramel-500"/> Monitor de Humor
            </h3>
            
            {!savedToday ? (
                <div className="bg-white dark:bg-gray-700 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-600">
                    <p className="text-center mb-4 text-gray-600 dark:text-gray-300 font-medium">Como você está se sentindo agora?</p>
                    <div className="flex justify-between mb-6">
                        {moods.map((m) => (
                            <button 
                                key={m.level}
                                onClick={() => setSelectedMood(m.level)}
                                className={`flex flex-col items-center gap-1 transition-all p-2 rounded-xl ${selectedMood === m.level ? 'bg-caramel-100 dark:bg-caramel-900/50 scale-110' : 'hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                            >
                                <span className="text-3xl filter drop-shadow-sm">{m.icon}</span>
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{m.label}</span>
                            </button>
                        ))}
                    </div>
                    <button 
                        onClick={handleSaveMood}
                        disabled={!selectedMood}
                        className="w-full bg-caramel-600 text-white font-bold py-3 rounded-xl disabled:opacity-50 hover:bg-caramel-700 transition"
                    >
                        Registrar Humor
                    </button>
                </div>
            ) : (
                <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 p-4 rounded-xl flex items-center justify-center gap-2 font-bold">
                    <CheckCircle size={20}/> Registrado com sucesso!
                </div>
            )}

            <div className="mt-8">
                <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-4">Sua semana</h4>
                <div className="h-40 flex items-end justify-between gap-2 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                    {last7.length > 0 ? last7.map((entry, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-1 flex-1">
                            <div 
                                className="w-full max-w-[20px] bg-caramel-400 rounded-t-lg transition-all hover:bg-caramel-500" 
                                style={{ height: `${(entry.level / 5) * 100}%`, minHeight: '10%' }}
                            ></div>
                            <span className="text-[10px] text-gray-400">
                                {new Date(entry.date).toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0,3)}
                            </span>
                        </div>
                    )) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                            Sem dados suficientes ainda.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
  };

  // --- FERRAMENTA 2: DIÁRIO DE GRATIDÃO ---
  const GratitudeJournal = () => {
      const [input, setInput] = useState('');
      
      const handleAdd = async () => {
          if(!input.trim() || !userData) return;
          const newEntry: GratitudeEntry = {
              id: Date.now().toString(),
              date: new Date().toISOString(),
              text: input
          };
          const currentLog = userData.gratitudeLog || [];
          const newData = { ...userData, gratitudeLog: [newEntry, ...currentLog] };
          await saveUserData(newData);
          setInput('');
      };

      const log = userData?.gratitudeLog || [];

      return (
          <div className="animate-fade-in h-full flex flex-col">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-6">
                 <BookOpen className="text-pink-500"/> Diário de Gratidão
              </h3>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-xl border border-yellow-100 dark:border-yellow-800/30 mb-6">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 italic">
                      "A gratidão não muda o que acontece, muda o que você sente sobre o que acontece."
                  </p>
              </div>

              <div className="flex gap-2 mb-6">
                  <input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Sou grato por..."
                    className="flex-1 p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-pink-400 outline-none text-gray-800 dark:text-white"
                  />
                  <button onClick={handleAdd} className="bg-pink-500 hover:bg-pink-600 text-white p-3 rounded-xl transition">
                      <Save size={20}/>
                  </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                  {log.length === 0 && <p className="text-center text-gray-400 mt-10">Nada registrado ainda. Que tal começar?</p>}
                  {log.map(item => (
                      <div key={item.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border-l-4 border-pink-400 shadow-sm animate-fade-in-up">
                          <p className="text-gray-800 dark:text-gray-200 font-medium">{item.text}</p>
                          <p className="text-xs text-gray-400 mt-2 text-right">{new Date(item.date).toLocaleDateString('pt-BR')} às {new Date(item.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</p>
                      </div>
                  ))}
              </div>
          </div>
      );
  };

  // --- FERRAMENTA 3: DESAFIO DE PENSAMENTOS (CBT) ---
  const ThoughtChallenger = () => {
      const [step, setStep] = useState(1);
      const [thought, setThought] = useState('');
      const [distortion, setDistortion] = useState('');
      const [reframe, setReframe] = useState('');

      const finish = async () => {
          if (!userData) return;
          
          // SALVAR O TRIUNFO NO HISTÓRICO
          const newWin: CbtWinEntry = {
              id: Date.now().toString(),
              date: new Date().toISOString(),
              negativeThought: thought,
              distortion: distortion,
              reframe: reframe
          };
          
          const currentWins = userData.cbtWins || [];
          const newData = { ...userData, cbtWins: [newWin, ...currentWins] };
          await saveUserData(newData);

          setStep(1);
          setThought('');
          setDistortion('');
          setReframe('');
          setActiveTool(null);
      };

      return (
          <div className="animate-fade-in">
               <h3 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-2">
                 <PenTool className="text-blue-500"/> Reformular Pensamento
              </h3>
              <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full mb-6">
                  <div className="bg-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: `${(step/3)*100}%` }}></div>
              </div>

              {step === 1 && (
                  <div className="space-y-4">
                      <p className="text-lg font-medium text-gray-700 dark:text-gray-200">Qual pensamento negativo está te incomodando?</p>
                      <textarea 
                        className="w-full p-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 min-h-[120px] focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                        placeholder="Ex: Eu nunca faço nada direito..."
                        value={thought}
                        onChange={e => setThought(e.target.value)}
                      />
                      <button onClick={() => setStep(2)} disabled={!thought} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50">Próximo</button>
                  </div>
              )}

              {step === 2 && (
                  <div className="space-y-4">
                      <p className="text-lg font-medium text-gray-700 dark:text-gray-200">Isso parece ser uma armadilha mental. Qual delas?</p>
                      <div className="grid grid-cols-1 gap-2">
                          {['Generalização (Sempre/Nunca)', 'Catastrofização (Vai dar tudo errado)', 'Leitura Mental (Sei o que pensam)', 'Tudo ou Nada'].map(d => (
                              <button key={d} onClick={() => setDistortion(d)} className={`p-3 rounded-lg border text-left transition ${distortion === d ? 'bg-blue-100 dark:bg-blue-900 border-blue-500 dark:text-white' : 'border-gray-200 dark:border-gray-600 dark:text-gray-300'}`}>
                                  {d}
                              </button>
                          ))}
                      </div>
                      <div className="flex gap-2 pt-4">
                        <button onClick={() => setStep(1)} className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-bold py-3 rounded-xl">Voltar</button>
                        <button onClick={() => setStep(3)} disabled={!distortion} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl disabled:opacity-50">Próximo</button>
                      </div>
                  </div>
              )}

              {step === 3 && (
                  <div className="space-y-4">
                      <p className="text-lg font-medium text-gray-700 dark:text-gray-200">Agora, vamos reescrever isso de forma mais gentil e realista.</p>
                      <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border-l-4 border-red-400 mb-2">
                          <p className="text-xs text-red-500 uppercase font-bold">Pensamento Original</p>
                          <p className="text-gray-600 dark:text-gray-300 italic">"{thought}"</p>
                      </div>
                      <textarea 
                        className="w-full p-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 min-h-[120px] focus:ring-2 focus:ring-green-500 outline-none dark:text-white"
                        placeholder="Ex: Eu cometi um erro, mas posso aprender com ele..."
                        value={reframe}
                        onChange={e => setReframe(e.target.value)}
                      />
                      <button onClick={finish} disabled={!reframe} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50">Salvar Triunfo</button>
                  </div>
              )}
          </div>
      );
  };

  // --- RESPIRAÇÃO (Código existente) ---
  const BreathingExercise = () => {
    const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
    const [timeLeft, setTimeLeft] = useState(4);
    const [isActive, setIsActive] = useState(false);
    useEffect(() => {
      let interval: any;
      if (isActive) {
        interval = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev === 1) {
              if (phase === 'Inhale') { setPhase('Hold'); return 7; } 
              else if (phase === 'Hold') { setPhase('Exhale'); return 8; } 
              else { setPhase('Inhale'); return 4; }
            }
            return prev - 1;
          });
        }, 1000);
      }
      return () => clearInterval(interval);
    }, [isActive, phase]);
    const getScale = () => { if (!isActive) return 1; if (phase === 'Inhale' || phase === 'Hold') return 1.5; return 1; };
    return (
      <div className="flex flex-col items-center justify-center py-6 animate-fade-in">
        <div className="relative w-64 h-64 flex items-center justify-center mb-8">
           <div className="absolute w-40 h-40 bg-blue-100 dark:bg-blue-900/40 rounded-full transition-all duration-[4000ms] ease-in-out" style={{ transform: `scale(${getScale()})`, transitionDuration: phase === 'Inhale' ? '4000ms' : phase === 'Exhale' ? '8000ms' : '0ms' }}></div>
           <div className="absolute w-32 h-32 bg-blue-200 dark:bg-blue-800/60 rounded-full transition-all duration-[4000ms] ease-in-out flex items-center justify-center shadow-lg" style={{ transform: `scale(${getScale()})`, transitionDuration: phase === 'Inhale' ? '4000ms' : phase === 'Exhale' ? '8000ms' : '0ms' }}>
              <span className="text-4xl font-bold text-blue-800 dark:text-blue-100">{isActive ? timeLeft : <Wind size={32}/>}</span>
           </div>
        </div>
        <p className="text-xl font-medium text-blue-600 dark:text-blue-300 mb-6">{isActive ? (phase === 'Inhale' ? "Inspire..." : phase === 'Hold' ? "Segure..." : "Solte...") : "Pronto?"}</p>
        <button onClick={() => setIsActive(!isActive)} className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold text-white transition-all ${isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
           {isActive ? "Pausar" : "Iniciar"}
        </button>
      </div>
    );
  };

  // --- ATERRAMENTO (Código existente) ---
  const GroundingExercise = () => (
    <div className="space-y-4 animate-fade-in">
      <h3 className="text-2xl font-bold text-gray-800 dark:text-white">5-4-3-2-1</h3>
      <p className="text-gray-600 dark:text-gray-300 mb-4">Identifique ao seu redor:</p>
      {[
          { num: 5, text: "Coisas que você vê", icon: "👀", color: "bg-red-100 text-red-700" },
          { num: 4, text: "Coisas que você toca", icon: "✋", color: "bg-orange-100 text-orange-700" },
          { num: 3, text: "Sons que você ouve", icon: "👂", color: "bg-yellow-100 text-yellow-700" },
          { num: 2, text: "Cheiros", icon: "👃", color: "bg-green-100 text-green-700" },
          { num: 1, text: "Sabores", icon: "👅", color: "bg-blue-100 text-blue-700" },
        ].map((item) => (
           <div key={item.num} className={`p-3 rounded-xl flex items-center gap-4 ${item.color} dark:bg-opacity-20`}>
              <span className="text-xl font-bold opacity-50">{item.num}</span>
              <span className="font-bold">{item.text}</span>
           </div>
        ))}
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <nav className="fixed w-full z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
         <div className="max-w-2xl mx-auto px-6 h-16 flex justify-between items-center">
             <button onClick={() => onNavigate(AppView.CHAT)} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-caramel-600 font-bold">
                 <ArrowLeft size={20}/> Chat
             </button>
             <div className="flex items-center gap-3">
                 <button onClick={handleExport} className="p-2 text-caramel-600 dark:text-caramel-400 hover:bg-caramel-50 dark:hover:bg-caramel-900/20 rounded-full" title="Exportar Relatório">
                    <Download size={20}/>
                 </button>
                 <button onClick={toggleTheme} className="p-2 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                     {isDarkMode ? <Sun size={20}/> : <Moon size={20} className="text-yellow-500"/>}
                 </button>
             </div>
         </div>
      </nav>

      <div className="pt-24 px-4 pb-20 max-w-2xl mx-auto w-full flex-1">
        
        {!activeTool ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up">
            <div className="col-span-1 md:col-span-2 text-center mb-6">
               <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Jornada de Bem-Estar</h2>
               <p className="text-gray-500 dark:text-gray-400">Pequenas práticas diárias, grandes mudanças.</p>
            </div>

            {/* NOVAS TOOLS (WOEBOT STYLE) */}
            <button onClick={() => setActiveTool('mood')} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-caramel-300 transition group text-left relative overflow-hidden">
               <div className="absolute right-0 top-0 w-24 h-24 bg-caramel-100 dark:bg-caramel-900/20 rounded-bl-full -mr-4 -mt-4 transition group-hover:scale-110"></div>
               <div className="relative z-10">
                   <div className="w-10 h-10 bg-caramel-100 dark:bg-caramel-900/50 rounded-full flex items-center justify-center text-caramel-600 dark:text-caramel-400 mb-3"><BarChart2 size={20}/></div>
                   <h3 className="font-bold text-gray-800 dark:text-white">Monitor de Humor</h3>
                   <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Acompanhe seus altos e baixos.</p>
               </div>
            </button>

            <button onClick={() => setActiveTool('gratitude')} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-pink-300 transition group text-left relative overflow-hidden">
               <div className="absolute right-0 top-0 w-24 h-24 bg-pink-50 dark:bg-pink-900/20 rounded-bl-full -mr-4 -mt-4 transition group-hover:scale-110"></div>
               <div className="relative z-10">
                   <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/50 rounded-full flex items-center justify-center text-pink-600 dark:text-pink-400 mb-3"><BookOpen size={20}/></div>
                   <h3 className="font-bold text-gray-800 dark:text-white">Diário de Gratidão</h3>
                   <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">3 coisas boas do dia.</p>
               </div>
            </button>
            
            <button onClick={() => setActiveTool('wins')} className="col-span-1 bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-yellow-300 transition group text-left relative overflow-hidden">
               <div className="absolute right-0 top-0 w-24 h-24 bg-yellow-50 dark:bg-yellow-900/20 rounded-bl-full -mr-4 -mt-4 transition group-hover:scale-110"></div>
               <div className="relative z-10">
                   <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/50 rounded-full flex items-center justify-center text-yellow-600 dark:text-yellow-400 mb-3"><Trophy size={20}/></div>
                   <h3 className="font-bold text-gray-800 dark:text-white">Galeria de Vitórias</h3>
                   <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Seus triunfos cognitivos.</p>
               </div>
            </button>

            <button onClick={() => setActiveTool('cbt')} className="col-span-1 bg-gradient-to-br from-blue-500 to-blue-600 text-white p-5 rounded-2xl shadow-md border border-blue-400 hover:shadow-lg transition group text-left relative overflow-hidden">
               <div className="relative z-10 flex flex-col h-full justify-between">
                   <div>
                       <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white mb-3"><PenTool size={20}/></div>
                       <h3 className="font-bold text-lg">Desafiar Pensamentos</h3>
                       <p className="text-sm text-blue-100 mt-1">Reescreva o que te incomoda (TCC).</p>
                   </div>
               </div>
            </button>

            {/* TOOLS ANTIGAS (QUICK ACCESS) */}
            <h4 className="col-span-1 md:col-span-2 font-bold text-gray-400 text-xs uppercase tracking-widest mt-4">SOS Rápido</h4>

            <button onClick={() => setActiveTool('breathing')} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700">
               <div className="text-blue-500"><Wind size={20}/></div>
               <span className="font-bold text-gray-700 dark:text-gray-200 text-sm">Respirar</span>
            </button>

            <button onClick={() => setActiveTool('grounding')} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700">
               <div className="text-orange-500"><Anchor size={20}/></div>
               <span className="font-bold text-gray-700 dark:text-gray-200 text-sm">Aterrar</span>
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl relative animate-fade-in min-h-[400px]">
             <button onClick={() => setActiveTool(null)} className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 text-gray-500"><X size={20}/></button>
             
             {activeTool === 'mood' && <MoodTracker />}
             {activeTool === 'gratitude' && <GratitudeJournal />}
             {activeTool === 'cbt' && <ThoughtChallenger />}
             {activeTool === 'wins' && <WinsGallery />}
             {activeTool === 'breathing' && <BreathingExercise />}
             {activeTool === 'grounding' && <GroundingExercise />}
          </div>
        )}

      </div>
    </div>
  );
};