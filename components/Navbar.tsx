import React, { useState } from 'react';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { AppView } from '../types';

interface NavbarProps {
  onNavigate: (view: AppView) => void;
  onStart: () => void;
  activeView: AppView;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, onStart, activeView, isDarkMode, toggleTheme }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItemClass = (view: AppView) =>
    `cursor-pointer hover:text-caramel-600 dark:hover:text-caramel-400 transition font-medium text-sm ${
      activeView === view ? 'text-caramel-600 dark:text-caramel-400 font-bold' : 'text-gray-600 dark:text-gray-300'
    }`;

  const handleNav = (view: AppView) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="fixed w-full z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNav(AppView.LANDING)}>
          <div className="w-10 h-10 bg-caramel-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg border-2 border-caramel-400">
            C
          </div>
          <span className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">Caramelo</span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-8">
          <div onClick={() => handleNav(AppView.OUR_APPROACH)} className={navItemClass(AppView.OUR_APPROACH)}>
            Nossa Abordagem
          </div>
          <div onClick={() => handleNav(AppView.FOR_BUSINESS)} className={navItemClass(AppView.FOR_BUSINESS)}>
            Para Empresas
          </div>
          <div onClick={() => handleNav(AppView.PROFESSIONAL_HELP)} className={navItemClass(AppView.PROFESSIONAL_HELP)}>
            Ajuda Profissional
          </div>
          <div onClick={() => handleNav(AppView.ABOUT_US)} className={navItemClass(AppView.ABOUT_US)}>
            Sobre Nós
          </div>
        </div>

        {/* Actions */}
        <div className="hidden lg:flex items-center gap-4">
          <button 
             onClick={toggleTheme}
             className="p-2 rounded-full transition text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
             title={isDarkMode ? "Modo Claro" : "Modo Escuro"}
           >
              {isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}
           </button>

          <button 
            onClick={onStart}
            className="bg-caramel-600 hover:bg-caramel-700 text-white font-bold py-2.5 px-6 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
          >
            Iniciar Conversa
          </button>
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
            className="text-gray-600 dark:text-gray-300"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 absolute w-full px-6 py-4 shadow-xl flex flex-col gap-4 animate-fade-in">
          <button onClick={() => handleNav(AppView.OUR_APPROACH)} className="text-left py-2 text-gray-700 dark:text-gray-200 font-medium">Nossa Abordagem</button>
          <button onClick={() => handleNav(AppView.FOR_BUSINESS)} className="text-left py-2 text-gray-700 dark:text-gray-200 font-medium">Para Empresas</button>
          <button onClick={() => handleNav(AppView.PROFESSIONAL_HELP)} className="text-left py-2 text-gray-700 dark:text-gray-200 font-medium">Ajuda Profissional</button>
          <button onClick={() => handleNav(AppView.ABOUT_US)} className="text-left py-2 text-gray-700 dark:text-gray-200 font-medium">Sobre Nós</button>
          <button 
            onClick={() => { onStart(); setMobileMenuOpen(false); }}
            className="w-full bg-caramel-600 text-white font-bold py-3 rounded-xl mt-2"
          >
            Iniciar Conversa
          </button>
        </div>
      )}
    </nav>
  );
};