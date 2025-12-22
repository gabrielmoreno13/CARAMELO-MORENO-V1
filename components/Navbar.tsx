import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { AppView } from '../types';

interface NavbarProps {
  onNavigate: (view: AppView) => void;
  onStart: () => void;
  activeView: AppView;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, onStart, activeView }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItemClass = (view: AppView) =>
    `cursor-pointer hover:text-caramel-600 transition font-medium text-sm ${
      activeView === view ? 'text-caramel-600 font-bold' : 'text-gray-600'
    }`;

  const handleNav = (view: AppView) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="fixed w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNav(AppView.LANDING)}>
          <div className="w-10 h-10 bg-caramel-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg border-2 border-caramel-400">
            C
          </div>
          <span className="text-2xl font-bold text-gray-800 tracking-tight">Caramelo</span>
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

        {/* CTA Button */}
        <div className="hidden lg:block">
          <button 
            onClick={onStart}
            className="bg-caramel-600 hover:bg-caramel-700 text-white font-bold py-2.5 px-6 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
          >
            Iniciar Conversa
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="lg:hidden text-gray-600"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 absolute w-full px-6 py-4 shadow-xl flex flex-col gap-4 animate-fade-in">
          <button onClick={() => handleNav(AppView.OUR_APPROACH)} className="text-left py-2 text-gray-700 font-medium">Nossa Abordagem</button>
          <button onClick={() => handleNav(AppView.FOR_BUSINESS)} className="text-left py-2 text-gray-700 font-medium">Para Empresas</button>
          <button onClick={() => handleNav(AppView.PROFESSIONAL_HELP)} className="text-left py-2 text-gray-700 font-medium">Ajuda Profissional</button>
          <button onClick={() => handleNav(AppView.ABOUT_US)} className="text-left py-2 text-gray-700 font-medium">Sobre Nós</button>
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