
import React, { useState, useEffect } from 'react';
import { Menu, X, Moon, Sun, ChevronDown, Globe } from 'lucide-react';
import { AppView, Language } from '../types';
import { getT } from '../translations';

interface NavbarProps {
  onNavigate: (view: AppView) => void;
  onStart: () => void;
  activeView: AppView;
  isDarkMode: boolean;
  toggleTheme: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export const CarameloLogo = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="45" fill="#f59e0b" />
    <path d="M30 35C30 35 20 25 20 40C20 55 32 50 32 50" fill="#78350f" opacity="0.2"/>
    <path d="M70 35C70 35 80 25 80 40C80 55 68 50 68 50" fill="#78350f" opacity="0.2"/>
    <circle cx="35" cy="45" r="4" fill="#3E2723"/>
    <circle cx="65" cy="45" r="4" fill="#3E2723"/>
    <ellipse cx="50" cy="55" rx="6" ry="4" fill="#3E2723"/>
    <path d="M45 65Q50 70 55 65" stroke="#3E2723" strokeWidth="3" strokeLinecap="round"/>
    <path d="M25 25L35 35" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
  </svg>
);

const LangSwitcher: React.FC<{ 
  language: Language; 
  onLanguageChange: (l: Language) => void;
  scrolled: boolean;
}> = ({ language, onLanguageChange, scrolled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const flags = { pt: '🇧🇷', en: '🇺🇸', es: '🇪🇸' };
  const labels = { pt: 'Português', en: 'English', es: 'Español' };

  return (
    <div className="relative inline-block text-left">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all border shadow-sm ${
          scrolled 
            ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700' 
            : 'bg-white/20 backdrop-blur-md border-white/30'
        } hover:scale-105 active:scale-95`}
        aria-label="Selecionar Idioma"
      >
        <span className="text-xl leading-none">{flags[language]}</span>
        <ChevronDown size={14} className={`transition-transform ${scrolled ? 'text-gray-600 dark:text-gray-400' : 'text-white'} ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[90]" onClick={() => setIsOpen(false)}></div>
          <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 py-2 w-48 animate-fade-in z-[100] overflow-hidden">
            {(['pt', 'en', 'es'] as Language[]).map((lang) => (
              <button 
                key={lang}
                onClick={() => { onLanguageChange(lang); setIsOpen(false); }}
                className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 hover:bg-caramel-50 dark:hover:bg-gray-700 transition ${language === lang ? 'font-black text-caramel-600 bg-caramel-50/50 dark:bg-gray-700' : 'text-gray-600 dark:text-gray-300'}`}
              >
                <span className="text-xl leading-none">{flags[lang]}</span> 
                <span className="flex-1">{labels[lang]}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export const Navbar: React.FC<NavbarProps> = ({ 
  onNavigate, onStart, activeView, isDarkMode, toggleTheme, language, onLanguageChange 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const t = getT(language);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${scrolled ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-gray-200 dark:border-gray-800 shadow-lg py-2' : 'bg-transparent border-transparent py-4'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onNavigate(AppView.LANDING)}>
          <CarameloLogo className="w-10 h-10 md:w-12 md:h-12" />
          <span className={`text-2xl font-black tracking-tight transition-colors ${scrolled ? 'text-gray-900 dark:text-white' : 'text-white'}`}>Caramelo</span>
        </div>

        {/* Links Desktop */}
        <div className="hidden lg:flex items-center gap-8 px-6 py-2">
          {['OUR_APPROACH', 'FOR_BUSINESS', 'PROFESSIONAL_HELP', 'ABOUT_US'].map((v) => (
            <button 
              key={v}
              onClick={() => onNavigate(AppView[v as keyof typeof AppView])} 
              className={`text-sm font-bold transition-colors ${scrolled ? 'text-gray-600 dark:text-gray-300' : 'text-white/80'} hover:text-caramel-500`}
            >
              {t[v.toLowerCase().replace('_', '') as keyof typeof t] || v}
            </button>
          ))}
        </div>

        {/* Ações Direitas */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Seletor de Idioma - Visível a partir de SM */}
          <div className="hidden sm:block">
            <LangSwitcher language={language} onLanguageChange={onLanguageChange} scrolled={scrolled} />
          </div>
          
          <button onClick={toggleTheme} className={`p-2.5 rounded-xl transition ${scrolled ? 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800' : 'text-white hover:bg-white/10'}`}>
            {isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}
          </button>
          
          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => onNavigate(AppView.LOGIN)} className={`font-bold transition ${scrolled ? 'text-gray-600 dark:text-gray-300' : 'text-white'}`}>{t.login}</button>
            <button onClick={onStart} className="bg-caramel-500 hover:bg-caramel-600 text-white font-black py-2.5 px-6 rounded-xl shadow-md transition-all active:scale-95">
              {activeView === AppView.LANDING ? t.register : t.app}
            </button>
          </div>
          
          {/* Botão Mobile */}
          <button className={`lg:hidden p-2 ${scrolled ? 'text-gray-600 dark:text-gray-300' : 'text-white'}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Menu Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] bg-white dark:bg-gray-900 animate-fade-in flex flex-col p-8">
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-3">
              <CarameloLogo className="w-10 h-10" />
              <span className="text-2xl font-black dark:text-white">Caramelo</span>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} className="text-gray-500 dark:text-gray-400 p-2">
              <X size={32} />
            </button>
          </div>

          <div className="flex flex-col gap-6 flex-1 overflow-y-auto">
            <button onClick={() => { onNavigate(AppView.OUR_APPROACH); setMobileMenuOpen(false); }} className="text-left font-black text-2xl dark:text-white">{t.methodology}</button>
            <button onClick={() => { onNavigate(AppView.FOR_BUSINESS); setMobileMenuOpen(false); }} className="text-left font-black text-2xl dark:text-white">{t.forBusiness}</button>
            <button onClick={() => { onNavigate(AppView.PROFESSIONAL_HELP); setMobileMenuOpen(false); }} className="text-left font-black text-2xl dark:text-white">{t.help}</button>
            <button onClick={() => { onNavigate(AppView.ABOUT_US); setMobileMenuOpen(false); }} className="text-left font-black text-2xl dark:text-white">{t.about}</button>
            
            <div className="h-px bg-gray-100 dark:bg-gray-800 my-4"></div>
            
            {/* Idiomas no Mobile - Sempre Visível */}
            <div className="space-y-4">
              <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Globe size={14} /> Selecionar Idioma
              </p>
              <div className="flex flex-wrap gap-3">
                {(['pt', 'en', 'es'] as Language[]).map(l => (
                  <button 
                    key={l} 
                    onClick={() => { onLanguageChange(l); setMobileMenuOpen(false); }} 
                    className={`flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all ${language === l ? 'border-caramel-500 bg-caramel-50 dark:bg-caramel-900/20 font-black text-caramel-700 dark:text-caramel-400' : 'border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400'}`}
                  >
                    <span className="text-2xl">{l === 'pt' ? '🇧🇷' : l === 'en' ? '🇺🇸' : '🇪🇸'}</span>
                    <span>{l === 'pt' ? 'BR' : l === 'en' ? 'EN' : 'ES'}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-auto pt-8 flex flex-col gap-4">
            <button onClick={() => { onNavigate(AppView.LOGIN); setMobileMenuOpen(false); }} className="w-full border-2 border-caramel-100 dark:border-gray-700 text-caramel-700 dark:text-caramel-400 py-4 rounded-2xl font-black text-lg">{t.login}</button>
            <button onClick={() => { onStart(); setMobileMenuOpen(false); }} className="w-full bg-caramel-500 text-white py-5 rounded-2xl font-black text-lg shadow-xl">{t.register}</button>
          </div>
        </div>
      )}
    </nav>
  );
};
