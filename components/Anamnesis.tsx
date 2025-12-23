import React, { useState } from 'react';
import { AnamnesisData } from '../types';
import { ArrowRight, ArrowLeft, Heart, Zap, Moon, Frown, Smile, Meh, AlertCircle, Activity, Sun, SkipForward } from 'lucide-react';

interface AnamnesisProps {
  userName: string;
  onComplete: (data: AnamnesisData) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const Anamnesis: React.FC<AnamnesisProps> = ({ userName, onComplete, isDarkMode, toggleTheme }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 5;
  const [data, setData] = useState<AnamnesisData>({
    sleepQuality: 5,
    anxietyLevel: 5,
    mood: '',
    mainComplaint: '',
    medication: '',
    physicalActivity: 'Sedentário',
    appetite: 'Normal',
    previousTherapy: false,
    familyHistory: '',
    supportNetwork: '',
    childhoodBrief: '',
    lifeGoals: ''
  });

  const handleChange = (field: keyof AnamnesisData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
      if(step < totalSteps) setStep(s => s + 1);
      else onComplete(data);
  };
  
  const prevStep = () => setStep(s => s - 1);

  const progress = (step / totalSteps) * 100;

  // Componente auxiliar para Botões de Seleção (estilo Wysa)
  const SelectionCard = ({ label, icon: Icon, selected, onClick }: any) => (
      <button 
        onClick={onClick}
        className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 w-full h-full gap-2
            ${selected 
                ? 'border-caramel-500 bg-caramel-50 dark:bg-caramel-900/50 text-caramel-800 dark:text-caramel-300 shadow-md transform scale-105' 
                : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:border-caramel-200 dark:hover:border-caramel-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
      >
          <Icon size={32} className={selected ? 'text-caramel-600 dark:text-caramel-400' : 'text-gray-300 dark:text-gray-600'} />
          <span className="font-bold text-sm">{label}</span>
      </button>
  );

  const renderStep = () => {
    switch (step) {
      case 1: // Humor e Queixa
        return (
          <div className="animate-fade-in space-y-8">
            <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Olá, {userName.split(' ')[0]}! Como você está hoje?</h3>
                <p className="text-gray-500 dark:text-gray-400">Selecione o que melhor descreve seu momento atual.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <SelectionCard icon={Zap} label="Ansioso" selected={data.mood === 'Ansioso'} onClick={() => handleChange('mood', 'Ansioso')} />
                <SelectionCard icon={Frown} label="Deprimido" selected={data.mood === 'Deprimido'} onClick={() => handleChange('mood', 'Deprimido')} />
                <SelectionCard icon={Meh} label="Apático" selected={data.mood === 'Apático'} onClick={() => handleChange('mood', 'Apático')} />
                <SelectionCard icon={AlertCircle} label="Irritado" selected={data.mood === 'Irritado'} onClick={() => handleChange('mood', 'Irritado')} />
                <SelectionCard icon={Activity} label="Instável" selected={data.mood === 'Instável'} onClick={() => handleChange('mood', 'Instável')} />
                <SelectionCard icon={Smile} label="Equilibrado" selected={data.mood === 'Equilibrado'} onClick={() => handleChange('mood', 'Equilibrado')} />
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">O que mais te incomoda agora?</label>
              <textarea
                className="w-full p-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-caramel-500 outline-none min-h-[100px] text-gray-800 dark:text-white"
                placeholder="Ex: Não consigo parar de pensar no trabalho..."
                value={data.mainComplaint}
                onChange={(e) => handleChange('mainComplaint', e.target.value)}
              />
            </div>
          </div>
        );
      case 2: // Sliders (Ansiedade/Sono)
        return (
          <div className="animate-fade-in space-y-8">
             <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Vamos medir sua energia</h3>
                <p className="text-gray-500 dark:text-gray-400">Arraste para definir os níveis.</p>
             </div>
             
             <div className="space-y-8 py-4">
                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 rounded-2xl shadow-sm">
                    <div className="flex justify-between mb-4">
                        <label className="flex items-center gap-2 font-bold text-gray-700 dark:text-gray-300"><Zap className="text-yellow-500"/> Nível de Ansiedade</label>
                        <span className="text-2xl font-bold text-caramel-600 dark:text-caramel-400">{data.anxietyLevel}</span>
                    </div>
                    <input type="range" min="1" max="10" value={data.anxietyLevel} onChange={(e) => handleChange('anxietyLevel', parseInt(e.target.value))} className="w-full accent-caramel-600 h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"/>
                    <div className="flex justify-between text-xs text-gray-400 mt-2">
                        <span>Calmo</span>
                        <span>Muito Ansioso</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 rounded-2xl shadow-sm">
                    <div className="flex justify-between mb-4">
                        <label className="flex items-center gap-2 font-bold text-gray-700 dark:text-gray-300"><Moon className="text-indigo-500"/> Qualidade do Sono</label>
                        <span className="text-2xl font-bold text-caramel-600 dark:text-caramel-400">{data.sleepQuality}</span>
                    </div>
                    <input type="range" min="1" max="10" value={data.sleepQuality} onChange={(e) => handleChange('sleepQuality', parseInt(e.target.value))} className="w-full accent-caramel-600 h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"/>
                    <div className="flex justify-between text-xs text-gray-400 mt-2">
                        <span>Péssimo</span>
                        <span>Excelente</span>
                    </div>
                </div>
             </div>
             
             <div className="space-y-2">
                 <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Toma alguma medicação?</label>
                 <input type="text" className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 text-gray-800 dark:text-white" placeholder="Se sim, qual?" value={data.medication} onChange={(e) => handleChange('medication', e.target.value)} />
             </div>
          </div>
        );
      case 3: // Rotina (Botões)
        return (
          <div className="animate-fade-in space-y-8">
             <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Sua Rotina</h3>
                <p className="text-gray-500 dark:text-gray-400">Para entendermos seu corpo e mente.</p>
             </div>

             <div>
                 <p className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 text-center">Atividade Física</p>
                 <div className="grid grid-cols-1 gap-3">
                     {['Sedentário', 'Leve (1-2x)', 'Moderado (3-4x)', 'Intenso (5+)'].map(opt => (
                         <button 
                            key={opt}
                            onClick={() => handleChange('physicalActivity', opt)}
                            className={`p-4 rounded-xl border text-left font-medium transition-all ${data.physicalActivity === opt ? 'bg-caramel-50 dark:bg-caramel-900/50 border-caramel-500 text-caramel-900 dark:text-caramel-300' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}
                         >
                             {opt}
                         </button>
                     ))}
                 </div>
             </div>
             
             <div>
                 <p className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 text-center">Apetite</p>
                 <div className="flex gap-2">
                     {['Diminuído', 'Normal', 'Aumentado'].map(opt => (
                         <button 
                            key={opt}
                            onClick={() => handleChange('appetite', opt)}
                            className={`flex-1 p-3 rounded-xl border text-center text-sm font-medium transition-all ${data.appetite === opt ? 'bg-caramel-50 dark:bg-caramel-900/50 border-caramel-500 text-caramel-900 dark:text-caramel-300' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}
                         >
                             {opt}
                         </button>
                     ))}
                 </div>
             </div>
          </div>
        );
      case 4: // Histórico
        return (
          <div className="animate-fade-in space-y-6">
             <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Um pouco de história</h3>
                <p className="text-gray-500 dark:text-gray-400">Estas perguntas são opcionais, mas ajudam muito.</p>
             </div>
             
             <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
                 <div className="flex items-center gap-3">
                    <input type="checkbox" checked={data.previousTherapy} onChange={(e) => handleChange('previousTherapy', e.target.checked)} className="w-6 h-6 text-caramel-600 rounded focus:ring-caramel-500" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium text-lg">Já fiz terapia antes</span>
                 </div>
                 
                 <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Histórico Familiar</label>
                    <textarea className="w-full p-4 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl focus:ring-2 focus:ring-caramel-200 text-gray-800 dark:text-white placeholder-gray-400" placeholder="Histórico de saúde mental na família..." value={data.familyHistory} onChange={(e) => handleChange('familyHistory', e.target.value)} />
                 </div>
                 
                 <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Rede de Apoio</label>
                    <input type="text" className="w-full p-4 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl focus:ring-2 focus:ring-caramel-200 text-gray-800 dark:text-white placeholder-gray-400" placeholder="Quem te apoia? (Família, Amigos)" value={data.supportNetwork} onChange={(e) => handleChange('supportNetwork', e.target.value)} />
                 </div>
             </div>
          </div>
        );
        case 5: // Profundo / Objetivos
        return (
          <div className="animate-fade-in space-y-6">
             <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Último passo</h3>
                <p className="text-gray-500 dark:text-gray-400">O que você busca com o Caramelo?</p>
             </div>

             <div className="space-y-4">
                <div>
                   <div className="flex justify-between items-center mb-2">
                     <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Resumo da Infância</label>
                     <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">Opcional</span>
                   </div>
                   <textarea className="w-full p-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl min-h-[100px] focus:ring-2 focus:ring-caramel-500 text-gray-800 dark:text-white placeholder-gray-400" placeholder="Se quiser, compartilhe algo marcante..." value={data.childhoodBrief} onChange={(e) => handleChange('childhoodBrief', e.target.value)} />
                </div>
                
                <div>
                   <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Seu Objetivo Principal</label>
                   <textarea className="w-full p-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl min-h-[100px] focus:ring-2 focus:ring-caramel-500 text-gray-800 dark:text-white placeholder-gray-400" placeholder="Ex: Dormir melhor, controlar ansiedade, desabafar..." value={data.lifeGoals} onChange={(e) => handleChange('lifeGoals', e.target.value)} />
                </div>
             </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4 transition-colors duration-300">
       <div className="w-full max-w-xl flex flex-col h-[85vh] md:h-auto md:min-h-[600px] bg-white dark:bg-gray-800 rounded-[2rem] shadow-xl overflow-hidden relative transition-colors border border-white dark:border-gray-700">
         
         {/* Progress Bar */}
         <div className="w-full h-2 bg-gray-100 dark:bg-gray-700">
            <div className="h-full bg-caramel-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
         </div>
         
         {/* Header */}
         <div className="px-8 pt-6 pb-2 flex justify-between items-center">
            {step > 1 ? (
                <button onClick={prevStep} className="text-gray-400 hover:text-caramel-600"><ArrowLeft size={24}/></button>
            ) : <div className="w-6"></div>}
            
            <div className="flex items-center gap-4">
               <span className="font-bold text-gray-300 dark:text-gray-500 text-sm tracking-widest">ETAPA {step}/{totalSteps}</span>
               <button 
                onClick={toggleTheme}
                className="p-1 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                 {isDarkMode ? <Sun size={16}/> : <Moon size={16}/>}
              </button>
            </div>
            
            <div className="w-6"></div>
         </div>
         
         {/* Content Scrollable */}
         <div className="flex-1 overflow-y-auto px-8 py-4">
            {renderStep()}
         </div>

         {/* Footer Action */}
         <div className="p-8 border-t border-gray-50 dark:border-gray-700 bg-white dark:bg-gray-800">
            <button 
                onClick={nextStep}
                disabled={step === 1 && !data.mood}
                className="w-full bg-caramel-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-caramel-200 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {step === totalSteps ? 'Finalizar e Conversar' : (step >= 4 ? 'Continuar / Pular' : 'Continuar')} <ArrowRight size={20} />
            </button>
         </div>
       </div>
    </div>
  );
};