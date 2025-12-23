
import React from 'react';
import { ArrowRight, Brain, Heart, Shield, Clock, MessageCircle, Sparkles } from 'lucide-react';
import { Navbar, CarameloLogo } from './Navbar';
import { AppView, Language } from '../types';
import { getT } from '../translations';

interface LandingPageProps {
  onStart: () => void;
  onNavigate: (view: AppView) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onStart, onNavigate, isDarkMode, toggleTheme, language, onLanguageChange 
}) => {
  const t = getT(language);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300 overflow-x-hidden">
      <Navbar 
         onNavigate={onNavigate} 
         onStart={onStart} 
         activeView={AppView.LANDING} 
         isDarkMode={isDarkMode} 
         toggleTheme={toggleTheme}
         language={language}
         onLanguageChange={onLanguageChange}
      />

      <header className="relative pt-32 md:pt-40 pb-20 px-6 z-10">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in-up text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-caramel-100 text-caramel-700 text-sm font-bold shadow-sm">
               <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-caramel-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-caramel-500"></span></span>
               {t.heroSub}
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white leading-tight tracking-tight">
              {t.heroTitle.split(' ').slice(0, -2).join(' ')} <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-caramel-500 to-orange-600">{t.heroTitle.split(' ').slice(-2).join(' ')}</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-lg mx-auto lg:mx-0">
              {t.heroDesc}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button onClick={onStart} className="bg-caramel-500 hover:bg-caramel-600 text-white text-lg font-bold py-4 px-10 rounded-full shadow-xl transition-all flex items-center justify-center gap-2">
                {t.btnStart} <ArrowRight size={20} />
              </button>
              <button onClick={() => onNavigate(AppView.ABOUT_US)} className="bg-white/80 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold py-4 px-10 rounded-full transition-all">
                {t.btnLearn}
              </button>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end animate-fade-in">
             <div className="relative w-full max-w-[320px] md:max-w-lg aspect-square">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 md:w-80 md:h-80 bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl rounded-[3rem] border border-white/50 shadow-2xl flex items-center justify-center z-20">
                    <div className="text-center space-y-4">
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-caramel-400 to-orange-500 rounded-3xl mx-auto flex items-center justify-center shadow-lg transform rotate-3"><CarameloLogo className="w-12 h-12 md:w-16 md:h-16 text-white"/></div>
                        <h3 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">Caramelo AI</h3>
                    </div>
                </div>
                <div className="absolute top-0 right-4 animate-bounce-slow"><div className="bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-xl flex items-center gap-3"><Brain size={20} className="text-blue-600"/><span className="font-bold text-xs md:text-sm dark:text-white">Wellness</span></div></div>
                <div className="absolute bottom-4 left-4 animate-bounce-slow" style={{ animationDelay: '1.5s' }}><div className="bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-xl flex items-center gap-3"><Heart size={20} className="text-pink-600"/><span className="font-bold text-xs md:text-sm dark:text-white">Support</span></div></div>
             </div>
          </div>
        </div>
      </header>
    </div>
  );
};
