
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
    <div className="relative inline-block text-left z-[1000]">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all border shadow-lg ${
          scrolled 
            ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100' 
            : 'bg-white border-white/50 text-gray-900'
        } hover:scale-105 active:scale-95`}
      >
        <span className="text-xl leading-none">{flags[language]}</span>
        <ChevronDown size={14} className={`opacity-60 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[1010]" onClick={() => setIsOpen(false)}></div>
          <div className="absolute top-full right-0 mt-3 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 py-2 w-48 animate-fade-in z-[1020] overflow-hidden">
            {(['pt', 'en', 'es'] as Language[]).map((lang) => (
              <button 
                key={lang}
                onClick={() => { onLanguageChange(lang); setIsOpen(false); }}
                className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 hover:bg-caramel-50 dark:hover:bg-gray-700 transition ${language === lang ? 'font-black text-caramel-600 bg-caramel-50/50 dark:bg-gray-700' : 'text-gray-600 dark:text-gray-300'}`}
              >
                <span className="text-xl leading-none">{flags[lang]}</span> 
                <span className="flex-1 font-bold">{labels[lang]}</span>
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

  // Mapeamento explícito de chaves para evitar erros de tradução
  const navLinks = [
    { view: AppView.OUR_APPROACH, labelKey: 'ourapproach' },
    { view: AppView.FOR_BUSINESS, labelKey: 'forbusiness' },
    { view: AppView.PROFESSIONAL_HELP, labelKey: 'professionalhelp' },
    { view: AppView.ABOUT_US, labelKey: 'aboutus' },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 py-2 shadow-lg' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onNavigate(AppView.LANDING)}>
          <CarameloLogo className="w-10 h-10" />
          <span className={`text-2xl font-black tracking-tight transition-colors ${scrolled ? 'text-gray-900 dark:text-white' : 'text-white'}`}>Caramelo</span>
        </div>

        {/* Links Centralizados (Estilo Pílula do Print) */}
        <div className={`hidden lg:flex items-center gap-8 px-8 py-2.5 rounded-full border transition-all ${scrolled ? 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700' : 'bg-white/10 border-white/20'}`}>
          {navLinks.map((link) => (
            <button 
              key={link.labelKey}
              onClick={() => onNavigate(link.view)} 
              className={`text-[11px] font-black uppercase tracking-widest transition-colors ${scrolled ? 'text-gray-500 hover:text-caramel-600 dark:text-gray-400' : 'text-white/80 hover:text-white'}`}
            >
              {t[link.labelKey as keyof typeof t] || link.labelKey}
            </button>
          ))}
        </div>

        {/* Ações Direitas */}
        <div className="flex items-center gap-4">
          {/* SELETOR DE IDIOMA - VISIBILIDADE FORÇADA */}
          <LangSwitcher language={language} onLanguageChange={onLanguageChange} scrolled={scrolled} />
          
          <button onClick={toggleTheme} className={`p-2.5 rounded-full transition ${scrolled ? 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800' : 'text-white hover:bg-white/10'}`}>
            {isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}
          </button>
          
          <div className="hidden sm:flex items-center gap-4">
            <button onClick={() => onNavigate(AppView.LOGIN)} className={`text-sm font-black transition ${scrolled ? 'text-gray-700 dark:text-gray-200' : 'text-white'}`}>{t.login}</button>
            <button onClick={onStart} className="bg-caramel-500 hover:bg-caramel-600 text-white text-sm font-black py-2.5 px-6 rounded-full shadow-lg transition-transform active:scale-95 whitespace-nowrap">
              {activeView === AppView.LANDING ? t.register : t.app}
            </button>
          </div>
          
          <button className={`lg:hidden p-2 ${scrolled ? 'text-gray-600 dark:text-gray-300' : 'text-white'}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[2000] bg-white dark:bg-gray-900 p-8 flex flex-col">
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-3">
              <CarameloLogo className="w-10 h-10" />
              <span className="text-2xl font-black dark:text-white">Caramelo</span>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} className="text-gray-500"><X size={32}/></button>
          </div>
          <div className="flex flex-col gap-8 flex-1">
             {navLinks.map(link => (
               <button key={link.labelKey} onClick={() => { onNavigate(link.view); setMobileMenuOpen(false); }} className="text-left text-2xl font-black dark:text-white">
                 {t[link.labelKey as keyof typeof t] || link.labelKey}
               </button>
             ))}
             <div className="h-px bg-gray-100 dark:bg-gray-800"></div>
             <div className="space-y-4">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Idioma / Language</p>
                <div className="flex gap-4">
                   {(['pt', 'en', 'es'] as Language[]).map(l => (
                      <button key={l} onClick={() => { onLanguageChange(l); setMobileMenuOpen(false); }} className={`text-3xl p-3 rounded-2xl border ${language === l ? 'border-caramel-500 bg-caramel-50' : 'border-gray-100 dark:border-gray-700'}`}>
                         {l === 'pt' ? '🇧🇷' : l === 'en' ? '🇺🇸' : '🇪🇸'}
                      </button>
                   ))}
                </div>
             </div>
          </div>
          <button onClick={onStart} className="w-full bg-caramel-500 text-white py-5 rounded-2xl font-black text-xl shadow-xl mt-auto">{t.register}</button>
        </div>
      )}
    </nav>
  );
};
