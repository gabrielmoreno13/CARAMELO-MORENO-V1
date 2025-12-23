import React from 'react';
import { 
  Heart, Shield, Clock, ArrowRight, Globe, Lock, Brain, MessageCircle, Sparkles, Smile, Activity 
} from 'lucide-react';
import { Navbar, CarameloLogo } from './Navbar';
import { AppView } from '../types';

interface LandingPageProps {
  onStart: () => void;
  onNavigate: (view: AppView) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onNavigate, isDarkMode, toggleTheme }) => {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 font-sans transition-colors duration-300 overflow-x-hidden">
      
      {/* Background Blobs (Efeito Fluido) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
         <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-caramel-200/40 dark:bg-caramel-900/20 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-blob"></div>
         <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-blue-200/40 dark:bg-blue-900/20 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-blob animation-delay-2000"></div>
         <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-pink-200/40 dark:bg-pink-900/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navbar Global */}
      <Navbar 
         onNavigate={onNavigate} 
         onStart={onStart} 
         activeView={AppView.LANDING} 
         isDarkMode={isDarkMode} 
         toggleTheme={toggleTheme} 
      />

      {/* --- HERO SECTION --- */}
      <header className="relative pt-32 md:pt-40 pb-20 px-6 z-10">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Text Content */}
          <div className="space-y-8 animate-fade-in-up text-center lg:text-left order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-caramel-100 dark:border-gray-700 text-caramel-700 dark:text-caramel-300 text-sm font-bold tracking-wide shadow-sm">
               <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-caramel-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-caramel-500"></span>
                </span>
               IA com empatia real
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white leading-[1.1] tracking-tight">
              Seu amigo leal para <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-caramel-500 to-orange-600">toda hora.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-lg mx-auto lg:mx-0">
              O Caramelo une tecnologia avançada e psicologia comportamental para te ouvir sem julgamentos. Um espaço seguro para sua mente respirar.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button 
                onClick={onStart}
                className="bg-caramel-500 hover:bg-caramel-600 text-white text-lg font-bold py-4 px-10 rounded-full shadow-xl shadow-caramel-500/30 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Conversar Agora <ArrowRight size={20} />
              </button>
              <button 
                onClick={() => onNavigate(AppView.ABOUT_US)}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-lg font-bold py-4 px-10 rounded-full transition-all duration-300 shadow-sm"
              >
                Saber Mais
              </button>
            </div>
            
            <div className="flex items-center justify-center lg:justify-start gap-6 pt-4 opacity-80">
               <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                     <div key={i} className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-900 overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className="w-full h-full object-cover"/>
                     </div>
                  ))}
               </div>
               <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                  Usado por +10.000 pessoas
               </p>
            </div>
          </div>

          {/* Image Content - ABSTRATO / TECH / AMIGÁVEL */}
          <div className="relative flex justify-center lg:justify-end animate-fade-in order-1 lg:order-2 mb-8 lg:mb-0">
             {/* Composition Container */}
             <div className="relative w-full max-w-[320px] md:max-w-lg aspect-square">
                
                {/* Central Glass Card */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 md:w-80 md:h-80 bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl rounded-[2.5rem] md:rounded-[3rem] border border-white/50 dark:border-gray-600 shadow-2xl flex items-center justify-center z-20">
                    <div className="text-center space-y-4">
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-caramel-400 to-orange-500 rounded-3xl mx-auto flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-500">
                             <CarameloLogo className="w-12 h-12 md:w-16 md:h-16 text-white"/>
                        </div>
                        <div>
                            <h3 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">Caramelo AI</h3>
                            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Sempre online.</p>
                        </div>
                    </div>
                </div>

                {/* Floating Elements (Connected Concept) */}
                <div className="absolute top-0 right-4 md:right-10 animate-bounce-slow" style={{ animationDelay: '0s' }}>
                   <div className="bg-white dark:bg-gray-800 p-3 md:p-4 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 flex items-center gap-3">
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-1.5 md:p-2 rounded-full text-blue-600"><Brain size={20} className="md:w-6 md:h-6"/></div>
                      <span className="font-bold text-gray-700 dark:text-gray-200 text-xs md:text-sm">Saúde Mental</span>
                   </div>
                </div>

                <div className="absolute bottom-4 left-4 md:bottom-10 md:left-0 animate-bounce-slow" style={{ animationDelay: '1.5s' }}>
                   <div className="bg-white dark:bg-gray-800 p-3 md:p-4 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 flex items-center gap-3">
                      <div className="bg-pink-100 dark:bg-pink-900/30 p-1.5 md:p-2 rounded-full text-pink-600"><Heart size={20} className="md:w-6 md:h-6" fill="currentColor"/></div>
                      <span className="font-bold text-gray-700 dark:text-gray-200 text-xs md:text-sm">Acolhimento</span>
                   </div>
                </div>

                <div className="absolute top-1/2 left-[-10px] md:left-[-20px] animate-bounce-slow" style={{ animationDelay: '2.5s' }}>
                   <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                      <MessageCircle size={20} className="text-green-500 md:w-6 md:h-6"/>
                   </div>
                </div>
                
                 <div className="absolute bottom-16 md:bottom-20 right-[-10px] animate-bounce-slow" style={{ animationDelay: '3s' }}>
                   <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                      <Sparkles size={20} className="text-yellow-500 md:w-6 md:h-6"/>
                   </div>
                </div>

                {/* Decorative Circle Behind */}
                <div className="absolute inset-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-full animate-spin-slow opacity-50 z-0"></div>
             </div>
          </div>
        </div>
      </header>

      {/* --- FEATURES GRID (Cards Clean) --- */}
      <section className="py-20 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
           <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Por que o Caramelo?</h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">Não somos apenas um chatbot. Somos uma plataforma desenhada com base em evidências para o seu bem-estar.</p>
           </div>
           
           <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-md p-8 rounded-3xl border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                 <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-2xl flex items-center justify-center mb-6">
                    <Clock size={24}/>
                 </div>
                 <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Disponível 24/7</h3>
                 <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    Ansiedade não tem hora marcada. O Caramelo está acordado quando você não consegue dormir.
                 </p>
              </div>

              <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-md p-8 rounded-3xl border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                 <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                    <Shield size={24}/>
                 </div>
                 <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Privacidade Total</h3>
                 <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    Suas conversas são criptografadas e anônimas. Você não precisa se identificar para desabafar.
                 </p>
              </div>

              <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-md p-8 rounded-3xl border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                 <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                    <Brain size={24}/>
                 </div>
                 <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Baseado em Ciência</h3>
                 <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    Utilizamos técnicas da Terapia Cognitivo-Comportamental (TCC) para te ajudar a reestruturar pensamentos.
                 </p>
              </div>
           </div>
        </div>
      </section>

      {/* --- FINAL CTA --- */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-caramel-500 to-orange-600 rounded-[3rem] p-12 md:p-20 text-center shadow-2xl relative overflow-hidden">
          {/* Background decoration inside CTA */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl"></div>
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl"></div>
          </div>
          
          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white">
              Sua mente merece esse cuidado.
            </h2>
            <p className="text-xl text-orange-100 max-w-2xl mx-auto">
              Junte-se a milhares de pessoas que encontraram no Caramelo um refúgio seguro para seus dias difíceis.
            </p>
            <button 
                onClick={onStart}
                className="bg-white text-orange-600 text-xl font-bold py-5 px-12 rounded-full shadow-lg hover:shadow-xl hover:bg-gray-50 hover:-translate-y-1 transition-all duration-300"
            >
                Começar Gratuitamente
            </button>
            <p className="text-orange-200 text-sm font-medium">Sem cartão de crédito necessário • 100% Grátis</p>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 pt-16 pb-8 px-6 relative z-10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
             <div className="flex items-center gap-2">
                <CarameloLogo className="w-8 h-8"/>
                <span className="font-bold text-xl text-gray-800 dark:text-white">Caramelo</span>
             </div>
             <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
               Tecnologia humanizada para saúde mental. <br/> Porque todo mundo precisa de um amigo leal.
             </p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-4">Empresa</h4>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <li><button onClick={() => onNavigate(AppView.ABOUT_US)} className="hover:text-caramel-600 dark:hover:text-caramel-400 transition">Sobre Nós</button></li>
              <li><button onClick={() => window.open('mailto:contato@caramelo.ai')} className="hover:text-caramel-600 dark:hover:text-caramel-400 transition">Contato</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-4">Produto</h4>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <li><button onClick={() => onNavigate(AppView.FOR_BUSINESS)} className="hover:text-caramel-600 dark:hover:text-caramel-400 transition">Para Empresas</button></li>
              <li><button onClick={() => onNavigate(AppView.OUR_APPROACH)} className="hover:text-caramel-600 dark:hover:text-caramel-400 transition">Metodologia</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-4">Legal</h4>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <li><a href="#" className="hover:text-caramel-600 dark:hover:text-caramel-400 transition">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-caramel-600 dark:hover:text-caramel-400 transition">Privacidade</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto border-t border-gray-100 dark:border-gray-800 pt-8 text-center text-xs text-gray-400">
          <p className="mb-2 max-w-2xl mx-auto">
            <strong>Aviso Importante:</strong> O Caramelo é uma ferramenta de suporte e bem-estar baseada em IA. Não somos um serviço médico. Se você estiver em risco de vida, ligue para o 188 (CVV) ou 192 (SAMU).
          </p>
          <p>© 2024 Caramelo AI. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};