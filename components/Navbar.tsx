import React, { useState, useEffect } from 'react';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { AppView } from '../types';

interface NavbarProps {
  onNavigate: (view: AppView) => void;
  onStart: () => void;
  activeView: AppView;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

// Logo do Cachorro Caramelo (SVG Inline)
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

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, onStart, activeView, isDarkMode, toggleTheme }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Efeito de scroll para mudar a transparência da navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItemClass = (view: AppView) =>
    `cursor-pointer text-sm font-bold transition-all duration-300 hover:text-caramel-600 dark:hover:text-caramel-400 ${
      activeView === view 
        ? 'text-caramel-600 dark:text-caramel-400 bg-caramel-50 dark:bg-caramel-900/20 px-3 py-1 rounded-full' 
        : 'text-gray-600 dark:text-gray-300'
    }`;

  const handleNav = (view: AppView) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <nav 
      className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${
        scrolled 
          ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-gray-200 dark:border-gray-800 shadow-sm py-2' 
          : 'bg-transparent border-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        
        {/* Logo & Brand */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => handleNav(AppView.LANDING)}>
          <div className="transform group-hover:rotate-12 transition-transform duration-300">
             <CarameloLogo className="w-10 h-10 md:w-12 md:h-12 drop-shadow-md" />
          </div>
          <span className="text-2xl font-extrabold text-gray-800 dark:text-white tracking-tight group-hover:text-caramel-600 transition-colors">Caramelo</span>
        </div>

        {/* Desktop Menu - Centralizado */}
        <div className="hidden lg:flex items-center gap-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm px-6 py-2 rounded-full border border-gray-100 dark:border-gray-700 shadow-sm">
          <div onClick={() => handleNav(AppView.OUR_APPROACH)} className={navItemClass(AppView.OUR_APPROACH)}>
            Metodologia
          </div>
          <div onClick={() => handleNav(AppView.FOR_BUSINESS)} className={navItemClass(AppView.FOR_BUSINESS)}>
            Para Empresas
          </div>
          <div onClick={() => handleNav(AppView.PROFESSIONAL_HELP)} className={navItemClass(AppView.PROFESSIONAL_HELP)}>
            Ajuda Profissional
          </div>
          <div onClick={() => handleNav(AppView.ABOUT_US)} className={navItemClass(AppView.ABOUT_US)}>
            Quem Somos
          </div>
        </div>

        {/* Actions (Right) */}
        <div className="hidden lg:flex items-center gap-3">
          <button 
             onClick={toggleTheme}
             className="p-2.5 rounded-full transition text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
             title={isDarkMode ? "Modo Claro" : "Modo Escuro"}
           >
              {isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}
           </button>

           {/* Se estiver na Landing, mostra botão de Login, senão apenas Iniciar Conversa */}
           {activeView === AppView.LANDING ? (
             <>
                <button onClick={() => onNavigate(AppView.LOGIN)} className="font-bold text-gray-600 dark:text-gray-300 hover:text-caramel-600 px-4">Entrar</button>
                <button 
                  onClick={onStart}
                  className="bg-caramel-500 hover:bg-caramel-600 text-white font-bold py-2.5 px-6 rounded-full shadow-lg hover:shadow-caramel-500/30 hover:-translate-y-0.5 transition-all duration-300"
                >
                  Criar Conta
                </button>
             </>
           ) : (
             <button 
                onClick={onStart}
                className="bg-caramel-500 hover:bg-caramel-600 text-white font-bold py-2.5 px-6 rounded-full shadow-lg hover:shadow-caramel-500/30 hover:-translate-y-0.5 transition-all duration-300"
              >
                App
              </button>
           )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="lg:hidden flex items-center gap-4">
          <button 
             onClick={toggleTheme}
             className="p-2 rounded-full transition text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
           >
              {isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}
           </button>
          <button 
            className="text-gray-600 dark:text-gray-300 p-1"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 absolute w-full px-6 py-6 shadow-2xl flex flex-col gap-4 animate-fade-in z-50 h-screen">
          <button onClick={() => handleNav(AppView.OUR_APPROACH)} className="text-left text-lg py-2 text-gray-700 dark:text-gray-200 font-bold border-b border-gray-100 dark:border-gray-800">Metodologia</button>
          <button onClick={() => handleNav(AppView.FOR_BUSINESS)} className="text-left text-lg py-2 text-gray-700 dark:text-gray-200 font-bold border-b border-gray-100 dark:border-gray-800">Para Empresas</button>
          <button onClick={() => handleNav(AppView.PROFESSIONAL_HELP)} className="text-left text-lg py-2 text-gray-700 dark:text-gray-200 font-bold border-b border-gray-100 dark:border-gray-800">Ajuda Profissional</button>
          <button onClick={() => handleNav(AppView.ABOUT_US)} className="text-left text-lg py-2 text-gray-700 dark:text-gray-200 font-bold border-b border-gray-100 dark:border-gray-800">Sobre Nós</button>
          
          <div className="mt-4 flex flex-col gap-3">
             <button onClick={() => handleNav(AppView.LOGIN)} className="w-full border-2 border-caramel-100 dark:border-gray-700 text-caramel-700 dark:text-caramel-400 font-bold py-3 rounded-2xl">Já tenho conta</button>
             <button 
                onClick={() => { onStart(); setMobileMenuOpen(false); }}
                className="w-full bg-caramel-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-caramel-500/20"
              >
                Criar Conta Grátis
              </button>
          </div>
        </div>
      )}
    </nav>
  );
};