import React from 'react';
import { 
  Heart, Shield, Clock, ArrowRight, Globe, Lock 
} from 'lucide-react';
import { Navbar } from './Navbar';
import { AppView } from '../types';

interface LandingPageProps {
  onStart: () => void;
  onNavigate: (view: AppView) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onNavigate, isDarkMode, toggleTheme }) => {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 font-sans transition-colors duration-300">
      
      {/* Custom Navbar com botão de Login */}
      <nav className="fixed w-full z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate(AppView.LANDING)}>
                <div className="w-10 h-10 bg-caramel-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg border-2 border-caramel-400">C</div>
                <span className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">Caramelo</span>
            </div>
            
            <div className="flex items-center gap-4">
                 <button onClick={() => onNavigate(AppView.LOGIN)} className="text-sm font-bold text-caramel-600 dark:text-caramel-400 hover:underline">Já tenho conta</button>
                 <button onClick={onStart} className="bg-caramel-600 hover:bg-caramel-700 text-white font-bold py-2.5 px-6 rounded-full shadow-lg transition">Criar Conta</button>
            </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="pt-32 pb-20 px-6 bg-gradient-to-b from-caramel-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Text Content */}
          <div className="space-y-8 animate-fade-in-up">
            <div className="inline-block px-4 py-1.5 rounded-full bg-caramel-100 dark:bg-caramel-900/30 text-caramel-800 dark:text-caramel-300 text-sm font-bold tracking-wide mb-2">
               🚀 O App #1 de Suporte Emocional
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white leading-[1.1]">
              Saúde mental acessível com o <span className="text-caramel-600">Caramelo.</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-lg">
              Um assistente virtual seguro para você desabafar, organizar pensamentos e encontrar suporte emocional. Lembre-se: não substituímos o atendimento médico especializado.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={onStart}
                className="bg-caramel-600 hover:bg-caramel-700 text-white text-lg font-bold py-4 px-10 rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Criar Conta Grátis <ArrowRight size={20} />
              </button>
              <button 
                onClick={() => onNavigate(AppView.LOGIN)}
                className="bg-white dark:bg-gray-800 border-2 border-caramel-100 dark:border-gray-700 text-caramel-700 dark:text-caramel-400 hover:bg-caramel-50 dark:hover:bg-gray-700 text-lg font-bold py-4 px-10 rounded-full transition-all duration-300"
              >
                Fazer Login
              </button>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <Shield size={16} className="text-green-600 dark:text-green-500" />
              100% Confidencial, Seguro e Anônimo.
            </p>
          </div>

          {/* Image Content - CACHORRO CARAMELO */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white dark:border-gray-800">
              <img 
                src="https://images.unsplash.com/photo-1596495578065-6e0763fa1178?q=80&w=1000&auto=format&fit=crop" 
                alt="Cachorro Caramelo" 
                className="w-full max-w-md h-auto object-cover"
              />
               {/* Floating Badge */}
               <div className="absolute bottom-8 left-8 bg-white/95 dark:bg-gray-800/95 backdrop-blur shadow-lg p-4 rounded-2xl flex items-center gap-3 animate-bounce-slow border border-gray-100 dark:border-gray-700">
                 <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                   <Heart fill="currentColor" size={20} />
                 </div>
                 <div>
                   <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase">Status</p>
                   <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Pronto para ouvir 🐶</p>
                 </div>
               </div>
            </div>
            
            {/* Background Decor */}
            <div className="absolute top-10 right-10 w-full h-full bg-caramel-200 dark:bg-caramel-900/20 rounded-[3rem] -z-10 transform translate-x-4 translate-y-4"></div>
          </div>
        </div>
      </header>

      {/* --- TRUSTED BY SECTION --- */}
      <section className="py-10 border-y border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Padrões de segurança e privacidade de nível empresarial</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <h3 className="text-xl md:text-2xl font-bold text-gray-600 dark:text-gray-400 flex items-center gap-2"><Globe size={24}/> Saúde Digital</h3>
            <h3 className="text-xl md:text-2xl font-bold text-gray-600 dark:text-gray-400">Bem-estar Corporativo</h3>
            <h3 className="text-xl md:text-2xl font-bold text-gray-600 dark:text-gray-400">Inovação Social</h3>
          </div>
        </div>
      </section>

      {/* --- FEATURE 1: 24/7 SUPPORT --- */}
      <section className="py-20 px-6 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
           {/* Mockup Esquerda */}
           <div className="order-2 lg:order-1 relative flex justify-center">
              <div className="w-72 h-[500px] bg-gray-900 rounded-[3rem] p-3 shadow-2xl border-4 border-gray-800 relative z-10">
                 <div className="w-full h-full bg-caramel-50 dark:bg-gray-800 rounded-[2.5rem] overflow-hidden flex flex-col relative">
                    {/* Fake Chat UI */}
                    <div className="bg-white dark:bg-gray-900 p-4 shadow-sm flex items-center gap-2 z-10">
                       <div className="w-8 h-8 bg-caramel-500 rounded-full border border-caramel-600 overflow-hidden">
                           <img src="https://images.unsplash.com/photo-1596495578065-6e0763fa1178?q=80&w=100&auto=format&fit=crop" className="w-full h-full object-cover"/>
                       </div>
                       <div className="h-2 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                    <div className="p-4 space-y-3 flex-1">
                       <div className="bg-white dark:bg-gray-700 p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[80%] text-xs text-gray-600 dark:text-gray-200">
                         Olá. Identifiquei que você está um pouco ansioso hoje. Gostaria de conversar sobre isso?
                       </div>
                       <div className="bg-caramel-500 p-3 rounded-2xl rounded-tr-none shadow-sm max-w-[80%] ml-auto text-xs text-white">
                         Sim, está difícil focar no trabalho.
                       </div>
                       <div className="bg-white dark:bg-gray-700 p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[80%] text-xs text-gray-600 dark:text-gray-200">
                         Compreendo. Vamos tentar organizar o que está sentindo passo a passo.
                       </div>
                    </div>
                 </div>
              </div>
              {/* Circle Decor */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-caramel-50 dark:bg-gray-800 rounded-full -z-10"></div>
           </div>

           {/* Content Direita */}
           <div className="order-1 lg:order-2 space-y-6">
             <div className="inline-block px-4 py-1 rounded-full bg-caramel-100 dark:bg-caramel-900/30 text-caramel-800 dark:text-caramel-300 text-sm font-bold mb-2">
               Suporte 24h
             </div>
             <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
               Disponível sempre que <span className="text-caramel-600">você precisar</span>.
             </h2>
             <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
               O Caramelo utiliza inteligência artificial avançada para oferecer escuta ativa e suporte imediato. Sem julgamentos, sem fila de espera e com total privacidade.
             </p>
             <ul className="space-y-4 pt-4">
               <li className="flex items-center gap-3 text-gray-700 dark:text-gray-300 font-medium">
                 <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400"><Clock size={16} /></div>
                 Atendimento imediato a qualquer hora.
               </li>
               <li className="flex items-center gap-3 text-gray-700 dark:text-gray-300 font-medium">
                 <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400"><Lock size={16} /></div>
                 Ambiente seguro e confidencial.
               </li>
             </ul>
           </div>
        </div>
      </section>

      {/* --- FINAL CTA --- */}
      <section className="py-24 px-6 bg-white dark:bg-gray-900 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Vamos conversar?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            O Caramelo está pronto para te ouvir agora.
          </p>
          <button 
            onClick={onStart}
            className="bg-caramel-600 hover:bg-caramel-700 text-white text-xl font-bold py-5 px-12 rounded-full shadow-2xl hover:shadow-orange-200 hover:-translate-y-1 transition-all duration-300"
          >
            Iniciar Conversa Agora
          </button>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 pt-16 pb-8 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-caramel-600 rounded-full flex items-center justify-center text-white font-bold">C</div>
                <span className="font-bold text-xl text-gray-800 dark:text-white">Caramelo</span>
             </div>
             <p className="text-gray-500 dark:text-gray-400 text-sm">
               Assistente de Saúde Mental. Cuidando de quem você é.
             </p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-4">Empresa</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li><button onClick={() => onNavigate(AppView.ABOUT_US)} className="hover:text-caramel-600 dark:hover:text-caramel-400">Sobre Nós</button></li>
              <li><button onClick={() => window.open('mailto:contato@caramelo.ai')} className="hover:text-caramel-600 dark:hover:text-caramel-400">Contato</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-4">Produto</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li><button onClick={() => onNavigate(AppView.FOR_BUSINESS)} className="hover:text-caramel-600 dark:hover:text-caramel-400">Para Empresas</button></li>
              <li><button onClick={() => onNavigate(AppView.OUR_APPROACH)} className="hover:text-caramel-600 dark:hover:text-caramel-400">Metodologia</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li><a href="#" className="hover:text-caramel-600 dark:hover:text-caramel-400">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-caramel-600 dark:hover:text-caramel-400">Privacidade</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto border-t border-gray-200 dark:border-gray-700 pt-8 text-center text-xs text-gray-400">
          <p className="mb-2">
            <strong>Aviso Importante:</strong> O Caramelo é uma ferramenta de suporte e bem-estar. Não somos um serviço médico de emergência. Se você estiver em perigo ou precisar de assistência médica urgente, ligue para o 192 ou dirija-se ao pronto-socorro mais próximo.
          </p>
          <p>© 2024 Caramelo AI. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};