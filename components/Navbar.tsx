
import React, { useState, useEffect } from 'react';
import { Menu, X, Moon, Sun, Globe } from 'lucide-react';
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

export const Navbar: React.FC<NavbarProps> = ({ 
  onNavigate, onStart, activeView, isDarkMode, toggleTheme, language, onLanguageChange 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const t = getT(language);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNav = (view: AppView) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  const LangSwitcher = () => (
    <div className="relative">
      <button 
        onClick={() => setLangMenuOpen(!langMenuOpen)}
        className="flex items-center gap-1 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
      >
        <span className="text-xl">{language === 'pt' ? '🇧🇷' : language === 'en' ? '🇺🇸' : '🇪🇸'}</span>
      </button>
      {langMenuOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 w-32 animate-fade-in z-50">
          {[
            { code: 'pt', flag: '🇧🇷', label: 'Português' },
            { code: 'en', flag: '🇺🇸', label: 'English' },
            { code: 'es', flag: '🇪🇸', label: 'Español' }
          ].map((lang) => (
            <button 
              key={lang.code}
              onClick={() => { onLanguageChange(lang.code as Language); setLangMenuOpen(false); }}
              className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 ${language === lang.code ? 'font-bold text-caramel-600' : 'text-gray-600 dark:text-gray-300'}`}
            >
              <span>{lang.flag}</span> {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${scrolled ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-gray-200 dark:border-gray-800 shadow-sm py-2' : 'bg-transparent border-transparent py-4'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => handleNav(AppView.LANDING)}>
          <CarameloLogo className="w-10 h-10 md:w-12 md:h-12" />
          <span className="text-2xl font-extrabold text-gray-800 dark:text-white tracking-tight">Caramelo</span>
        </div>

        <div className="hidden lg:flex items-center gap-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm px-6 py-2 rounded-full border border-gray-100 dark:border-gray-700">
          <button onClick={() => handleNav(AppView.OUR_APPROACH)} className="text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-caramel-600">{t.methodology}</button>
          <button onClick={() => handleNav(AppView.FOR_BUSINESS)} className="text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-caramel-600">{t.forBusiness}</button>
          <button onClick={() => handleNav(AppView.PROFESSIONAL_HELP)} className="text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-caramel-600">{t.help}</button>
          <button onClick={() => handleNav(AppView.ABOUT_US)} className="text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-caramel-600">{t.about}</button>
        </div>

        <div className="flex items-center gap-3">
          <LangSwitcher />
          <button onClick={toggleTheme} className="p-2.5 rounded-full transition text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
            {isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}
          </button>
          {activeView === AppView.LANDING ? (
            <>
              <button onClick={() => onNavigate(AppView.LOGIN)} className="hidden md:block font-bold text-gray-600 dark:text-gray-300 hover:text-caramel-600 px-4">{t.login}</button>
              <button onClick={onStart} className="bg-caramel-500 hover:bg-caramel-600 text-white font-bold py-2.5 px-6 rounded-full shadow-lg transition-all">{t.register}</button>
            </>
          ) : (
            <button onClick={onStart} className="bg-caramel-500 hover:bg-caramel-600 text-white font-bold py-2.5 px-6 rounded-full shadow-lg transition-all">{t.app}</button>
          )}
          <button className="lg:hidden text-gray-600 dark:text-gray-300" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-gray-900 absolute w-full px-6 py-6 shadow-2xl flex flex-col gap-4 animate-fade-in z-50">
          <button onClick={() => handleNav(AppView.OUR_APPROACH)} className="text-left py-2 font-bold dark:text-white border-b border-gray-100 dark:border-gray-800">{t.methodology}</button>
          <button onClick={() => handleNav(AppView.FOR_BUSINESS)} className="text-left py-2 font-bold dark:text-white border-b border-gray-100 dark:border-gray-800">{t.forBusiness}</button>
          <button onClick={() => handleNav(AppView.PROFESSIONAL_HELP)} className="text-left py-2 font-bold dark:text-white border-b border-gray-100 dark:border-gray-800">{t.help}</button>
          <button onClick={() => handleNav(AppView.ABOUT_US)} className="text-left py-2 font-bold dark:text-white border-b border-gray-100 dark:border-gray-800">{t.about}</button>
          <button onClick={() => handleNav(AppView.LOGIN)} className="w-full border-2 border-caramel-100 dark:border-gray-700 text-caramel-700 py-3 rounded-2xl font-bold">{t.login}</button>
          <button onClick={() => { onStart(); setMobileMenuOpen(false); }} className="w-full bg-caramel-500 text-white py-4 rounded-2xl font-bold">{t.register}</button>
        </div>
      )}
    </nav>
  );
};
