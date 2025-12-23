
import React, { useState, useEffect } from 'react';
import { AnamnesisData, Language } from '../types';
import { ArrowRight, ArrowLeft, Zap, Moon, Frown, Smile, Meh, AlertCircle, Activity, Sun } from 'lucide-react';
import { getT } from '../translations';

interface AnamnesisProps {
  userName: string | null | undefined;
  onComplete: (data: AnamnesisData) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  language: Language;
}

export const Anamnesis: React.FC<AnamnesisProps> = ({ userName, onComplete, isDarkMode, toggleTheme, language }) => {
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
  
  const t = getT(language);

  // Fallback robusto para evitar tela branca se userName for nulo
  const safeName = (userName || "Amigo").toString().split(' ')[0];

  useEffect(() => {
      const saved = localStorage.getItem('caramelo_anamnesis_draft');
      if (saved) {
          try {
              const parsed = JSON.parse(saved);
              if (parsed.mood || parsed.mainComplaint) setData(prev => ({ ...prev, ...parsed }));
          } catch (e) {}
      }
  }, []);

  useEffect(() => {
      localStorage.setItem('caramelo_anamnesis_draft', JSON.stringify(data));
  }, [data]);

  const handleChange = (field: keyof AnamnesisData, value: any) => setData(prev => ({ ...prev, [field]: value }));
  const nextStep = () => {
      if(step < totalSteps) setStep(s => s + 1);
      else {
          localStorage.removeItem('caramelo_anamnesis_draft');
          onComplete(data);
      }
  };
  const prevStep = () => setStep(s => s - 1);
  const progress = (step / totalSteps) * 100;

  const SelectionCard = ({ label, icon: Icon, selected, onClick }: any) => (
      <button onClick={onClick} className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 w-full gap-2 ${selected ? 'border-caramel-500 bg-caramel-50 dark:bg-caramel-900/50 text-caramel-800 dark:text-caramel-300 shadow-md transform scale-105' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:border-caramel-200'}`}>
          <Icon size={32} className={selected ? 'text-caramel-600 dark:text-caramel-400' : 'text-gray-300'} />
          <span className="font-bold text-sm">{label}</span>
      </button>
  );

  const renderStep = () => {
    switch (step) {
      case 1: 
        return (
          <div className="animate-fade-in space-y-8">
            <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t.anaWelcome.replace('{name}', safeName)}</h3>
                <p className="text-gray-600 dark:text-gray-400 font-medium">{t.anaSub}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <SelectionCard icon={Zap} label={t.anaMoodAns} selected={data.mood === 'Ansioso'} onClick={() => handleChange('mood', 'Ansioso')} />
                <SelectionCard icon={Frown} label={t.anaMoodDep} selected={data.mood === 'Deprimido'} onClick={() => handleChange('mood', 'Deprimido')} />
                <SelectionCard icon={Meh} label={t.anaMoodApa} selected={data.mood === 'Apático'} onClick={() => handleChange('mood', 'Apático')} />
                <SelectionCard icon={AlertCircle} label={t.anaMoodIrr} selected={data.mood === 'Irritado'} onClick={() => handleChange('mood', 'Irritado')} />
                <SelectionCard icon={Activity} label={t.anaMoodIns} selected={data.mood === 'Instável'} onClick={() => handleChange('mood', 'Instável')} />
                <SelectionCard icon={Smile} label={t.anaMoodEqu} selected={data.mood === 'Equilibrado'} onClick={() => handleChange('mood', 'Equilibrado')} />
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border dark:border-gray-700">
              <label className="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase mb-3 tracking-widest">{t.anaComplaint}</label>
              <textarea className="w-full p-4 bg-white dark:bg-gray-700 border-2 border-gray-100 dark:border-gray-600 rounded-xl outline-none min-h-[120px] dark:text-white focus:border-caramel-400 transition-colors" value={data.mainComplaint} onChange={(e) => handleChange('mainComplaint', e.target.value)} />
            </div>
          </div>
        );
      case 2: 
        return (
          <div className="animate-fade-in space-y-8">
             <div className="text-center space-y-2"><h3 className="text-2xl font-bold text-gray-900 dark:text-white">Fisiologia</h3></div>
             <div className="space-y-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border-2 border-gray-50 dark:border-gray-700">
                    <div className="flex justify-between mb-4"><label className="font-bold text-gray-700 dark:text-gray-300">{t.anaAnxiety}</label><span className="text-2xl font-bold text-caramel-600">{data.anxietyLevel}</span></div>
                    <input type="range" min="1" max="10" value={data.anxietyLevel} onChange={(e) => handleChange('anxietyLevel', parseInt(e.target.value))} className="w-full accent-caramel-600 h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"/>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border-2 border-gray-50 dark:border-gray-700">
                    <div className="flex justify-between mb-4"><label className="font-bold text-gray-700 dark:text-gray-300">{t.anaSleep}</label><span className="text-2xl font-bold text-caramel-600">{data.sleepQuality}</span></div>
                    <input type="range" min="1" max="10" value={data.sleepQuality} onChange={(e) => handleChange('sleepQuality', parseInt(e.target.value))} className="w-full accent-caramel-600 h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"/>
                </div>
             </div>
             <div className="space-y-2">
                 <label className="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase ml-1 tracking-widest">{t.anaMed}</label>
                 <input type="text" className="w-full p-4 border-2 border-gray-100 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 dark:text-white outline-none focus:border-caramel-400" value={data.medication} onChange={(e) => handleChange('medication', e.target.value)} />
             </div>
          </div>
        );
      case 3: 
        return (
          <div className="animate-fade-in space-y-8">
             <div className="text-center space-y-2"><h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t.anaRoutine}</h3></div>
             <div>
                 <p className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-4 text-center">{t.anaActivity}</p>
                 <div className="grid grid-cols-1 gap-3">
                     {['Sedentário', 'Leve (1-2x)', 'Moderado (3-4x)', 'Intenso (5+)'].map(opt => (
                         <button key={opt} onClick={() => handleChange('physicalActivity', opt)} className={`p-5 rounded-2xl border-2 text-left font-bold transition-all ${data.physicalActivity === opt ? 'bg-caramel-50 dark:bg-caramel-900 border-caramel-500 text-caramel-700 dark:text-caramel-300' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 dark:text-white'}`}>{opt}</button>
                     ))}
                 </div>
             </div>
          </div>
        );
      case 5:
        return (
          <div className="animate-fade-in space-y-6">
             <div className="text-center space-y-2"><h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t.finish}</h3></div>
             <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border dark:border-gray-700">
                <label className="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase mb-3 tracking-widest">Metas e Desejos</label>
                <textarea className="w-full p-4 bg-white dark:bg-gray-700 border-2 border-gray-100 dark:border-gray-600 rounded-xl min-h-[180px] dark:text-white outline-none focus:border-caramel-400" placeholder="O que você espera alcançar com o Caramelo?" value={data.lifeGoals} onChange={(e) => handleChange('lifeGoals', e.target.value)} />
             </div>
          </div>
        );
      default: return <div className="p-10 text-center text-gray-400">Carregando...</div>;
    }
  };

  return (
    <div className="min-h-screen bg-caramel-50 dark:bg-gray-950 flex items-center justify-center p-4">
       <div className="w-full max-w-xl bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl overflow-hidden border border-white dark:border-gray-700">
         <div className="w-full h-2 bg-gray-100 dark:bg-gray-700"><div className="h-full bg-caramel-500 transition-all duration-500" style={{ width: `${progress}%` }}></div></div>
         <div className="px-8 pt-8 pb-2 flex justify-between items-center">
            {step > 1 ? <button onClick={prevStep} className="text-gray-400 hover:text-caramel-600 transition-colors"><ArrowLeft size={24}/></button> : <div className="w-6"></div>}
            <span className="font-black text-gray-300 dark:text-gray-600 text-xs tracking-[0.2em] uppercase">{t.anaStep} {step}/{totalSteps}</span>
            <button onClick={toggleTheme} className="p-2 text-gray-400 hover:text-caramel-500 transition-colors">{isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}</button>
         </div>
         <div className="flex-1 overflow-y-auto px-8 py-6">{renderStep()}</div>
         <div className="p-8 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
            <button onClick={nextStep} disabled={step === 1 && !data.mood} className="w-full bg-caramel-500 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-caramel-600 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50">
                {step === totalSteps ? t.anaFinish : t.anaContinue} <ArrowRight size={22} />
            </button>
         </div>
       </div>
    </div>
  );
};
