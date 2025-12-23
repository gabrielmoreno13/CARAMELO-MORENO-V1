
import React from 'react';
import { ArrowRight, Brain, Heart, Shield, Clock, MessageCircle, Sparkles, TrendingUp, CheckCircle, Star, Users, Briefcase, ChevronRight, Plus } from 'lucide-react';
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

const FeatureCard = ({ icon: Icon, title, desc, color }: any) => (
  <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
    <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
      <Icon size={28} />
    </div>
    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
    <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
  </div>
);

const TestimonialCard = ({ name, role, text, rating }: any) => (
  <div className="bg-gray-50 dark:bg-gray-800/40 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-700">
    <div className="flex gap-1 mb-4">
      {[...Array(rating)].map((_, i) => <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />)}
    </div>
    <p className="text-gray-600 dark:text-gray-300 italic mb-6">"{text}"</p>
    <div>
      <h4 className="font-bold text-gray-900 dark:text-white">{name}</h4>
      <p className="text-xs text-gray-400 uppercase tracking-widest">{role}</p>
    </div>
  </div>
);

const FAQItem = ({ q, a }: any) => {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="border-b border-gray-100 dark:border-gray-800">
      <button onClick={() => setOpen(!open)} className="w-full py-6 flex justify-between items-center text-left hover:text-caramel-600 transition">
        <span className="font-bold text-lg text-gray-800 dark:text-gray-200">{q}</span>
        <Plus className={`transition-transform duration-300 ${open ? 'rotate-45 text-caramel-600' : ''}`} />
      </button>
      {open && <p className="pb-6 text-gray-500 dark:text-gray-400 animate-fade-in">{a}</p>}
    </div>
  );
};

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

      {/* HERO SECTION */}
      <header className="relative pt-32 md:pt-48 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="space-y-10 animate-fade-in-up text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-caramel-50 dark:bg-caramel-900/30 border border-caramel-100 dark:border-caramel-800 text-caramel-700 dark:text-caramel-400 text-sm font-bold shadow-sm">
               <Sparkles size={16} /> {t.heroSub}
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 dark:text-white leading-tight">
              {t.heroTitle.split(' ').slice(0, -1).join(' ')} <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-caramel-500 to-orange-600 drop-shadow-sm">{t.heroTitle.split(' ').slice(-1)}</span>
            </h1>
            
            <p className="text-lg md:text-2xl text-gray-500 dark:text-gray-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {t.heroDesc}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <button onClick={onStart} className="group bg-caramel-500 hover:bg-caramel-600 text-white text-xl font-black py-5 px-10 rounded-3xl shadow-2xl shadow-caramel-200 dark:shadow-none transition-all flex items-center justify-center gap-3">
                {t.btnStart} <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button onClick={() => onNavigate(AppView.OUR_APPROACH)} className="bg-white/80 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold py-5 px-10 rounded-3xl transition-all hover:bg-gray-50">
                {t.btnLearn}
              </button>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-8 pt-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                <div className="text-center">
                    <div className="text-2xl font-black dark:text-white">50k+</div>
                    <div className="text-[10px] uppercase font-bold tracking-widest">{t.statsUsers.split(' ')[1]}</div>
                </div>
                <div className="h-10 w-px bg-gray-200 dark:bg-gray-700"></div>
                <div className="text-center">
                    <div className="text-2xl font-black dark:text-white">24/7</div>
                    <div className="text-[10px] uppercase font-bold tracking-widest">{t.statsAvailability}</div>
                </div>
                <div className="h-10 w-px bg-gray-200 dark:bg-gray-700"></div>
                <div className="text-center">
                    <div className="text-2xl font-black dark:text-white">98%</div>
                    <div className="text-[10px] uppercase font-bold tracking-widest">{t.statsSatisfaction.split(' ')[0]}</div>
                </div>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end animate-fade-in pointer-events-none">
             <div className="relative w-full max-w-lg aspect-square">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 md:w-96 md:h-96 bg-caramel-500/10 dark:bg-caramel-500/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute inset-0 bg-white/40 dark:bg-gray-800/40 backdrop-blur-3xl rounded-[4rem] border border-white/50 dark:border-gray-700/50 shadow-2xl flex items-center justify-center z-20 overflow-hidden transform rotate-2">
                    <div className="absolute inset-0 bg-gradient-to-br from-caramel-50/50 to-orange-50/50 dark:from-gray-800/50 dark:to-gray-900/50"></div>
                    <div className="relative text-center space-y-6">
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-caramel-400 to-orange-600 rounded-[2.5rem] mx-auto flex items-center justify-center shadow-2xl transform hover:rotate-6 transition-transform"><CarameloLogo className="w-16 h-16 md:w-20 md:h-20 text-white"/></div>
                        <div>
                            <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Caramelo AI</h3>
                            <p className="text-caramel-600 font-bold text-sm">Empathetic Assistant</p>
                        </div>
                    </div>
                </div>
                <div className="absolute top-0 right-10 animate-bounce-slow z-30"><div className="bg-white dark:bg-gray-800 p-4 rounded-3xl shadow-2xl flex items-center gap-3 border border-gray-100 dark:border-gray-700"><div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600"><Brain size={18}/></div><span className="font-bold text-sm dark:text-white">Science-based</span></div></div>
                <div className="absolute bottom-10 left-0 animate-bounce-slow z-30" style={{ animationDelay: '2s' }}><div className="bg-white dark:bg-gray-800 p-4 rounded-3xl shadow-2xl flex items-center gap-3 border border-gray-100 dark:border-gray-700"><div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center text-pink-600"><Heart size={18}/></div><span className="font-bold text-sm dark:text-white">Empathetic</span></div></div>
             </div>
          </div>
        </div>
      </header>

      {/* PROBLEM SECTION */}
      <section className="py-24 px-6 bg-gray-50 dark:bg-gray-800/20">
        <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight">
                {t.problemTitle}
            </h2>
            <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                {t.problemDesc}
            </p>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-24 px-6 max-w-7xl mx-auto w-full">
         <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard color="bg-caramel-500" icon={MessageCircle} title={t.featChatTitle} desc={t.featChatDesc} />
            <FeatureCard color="bg-blue-500" icon={TrendingUp} title={t.featVoiceTitle} desc={t.featVoiceDesc} />
            <FeatureCard color="bg-pink-500" icon={Shield} title={t.featToolsTitle} desc={t.featToolsDesc} />
         </div>
      </section>

      {/* STORYTELLING SECTION */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto bg-caramel-500 rounded-[4rem] p-10 md:p-20 text-white grid lg:grid-cols-2 gap-16 items-center shadow-2xl shadow-caramel-200 dark:shadow-none">
            <div className="space-y-8">
                <h2 className="text-4xl md:text-6xl font-black leading-tight">{t.whyTitle}</h2>
                <p className="text-xl text-caramel-50 leading-relaxed opacity-90">
                    {t.whyDesc}
                </p>
                <button onClick={onStart} className="bg-white text-caramel-600 font-black py-4 px-10 rounded-2xl hover:bg-caramel-50 transition-colors shadow-xl">
                    {t.btnStart}
                </button>
            </div>
            <div className="flex justify-center">
                <div className="w-full max-w-sm aspect-square bg-white/20 backdrop-blur-md rounded-[3rem] border border-white/30 flex items-center justify-center transform -rotate-3 transition-transform hover:rotate-0">
                    <CarameloLogo className="w-32 h-32 md:w-48 md:h-48 text-white opacity-90"/>
                </div>
            </div>
        </div>
      </section>

      {/* SOCIAL PROOF / TESTIMONIALS */}
      <section className="py-24 px-6 max-w-7xl mx-auto w-full">
         <div className="text-center mb-16 space-y-4">
             <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white">O que dizem os Caramelos</h2>
             <p className="text-gray-500">Histórias reais de quem encontrou acolhimento.</p>
         </div>
         <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard name="Mariana S." role="Estudante" text="O Caramelo me ajudou a sair de uma crise de ansiedade no meio da madrugada. A voz calma foi tudo que eu precisei." rating={5} />
            <TestimonialCard name="Ricardo F." role="Engenheiro" text="Uso as ferramentas de CBT todos os dias. Me ajuda a focar no que é real e não nas minhas paranoias." rating={5} />
            <TestimonialCard name="Ana Paula" role="Gestora de RH" text="Implementamos na nossa startup e o feedback foi imediato. O time se sente mais seguro e ouvido." rating={5} />
         </div>
      </section>

      {/* CORPORATE SECTION */}
      <section className="py-24 px-6 bg-gray-900 dark:bg-black text-white rounded-[4rem] mx-4 my-12">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 text-blue-400 font-bold uppercase tracking-widest text-sm"><Briefcase size={18}/> Caramelo Corporate</div>
                <h2 className="text-4xl md:text-6xl font-black leading-tight">{t.b2bTitle}</h2>
                <p className="text-xl text-gray-400 leading-relaxed">
                    {t.b2bDesc}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-black py-5 px-10 rounded-2xl transition shadow-xl">Falar com Consultor</button>
                    <button className="border border-gray-700 hover:bg-gray-800 text-white font-bold py-5 px-10 rounded-2xl transition">Baixar PDF de Apresentação</button>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
                {[
                    { label: "Redução de Burnout", val: "40%", icon: TrendingUp },
                    { label: "Engajamento", val: "3.5x", icon: Users },
                    { label: "Anônimo", val: "100%", icon: Shield },
                    { label: "ROI Mental", val: "Positivo", icon: TrendingUp }
                ].map((stat, i) => (
                    <div key={i} className="bg-white/5 p-8 rounded-3xl border border-white/10 text-center hover:bg-white/10 transition">
                        <stat.icon size={24} className="mx-auto mb-4 text-blue-400" />
                        <div className="text-3xl font-black mb-1">{stat.val}</div>
                        <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">{stat.label}</div>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-24 px-6 max-w-4xl mx-auto w-full">
         <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white text-center mb-16">{t.faqTitle}</h2>
         <div className="space-y-4">
            <FAQItem q={t.faqQ1} a={t.faqA1} />
            <FAQItem q={t.faqQ2} a={t.faqA2} />
            <FAQItem q="Quanto custa?" a="Temos um plano gratuito generoso para suporte diário. Planos premium oferecem recursos de voz ilimitados e ferramentas avançadas de análise." />
            <FAQItem q="Posso usar pelo celular?" a="Sim! Nossa plataforma é totalmente responsiva e funciona como um Progressive Web App (PWA) no seu smartphone." />
         </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-6 bg-caramel-50 dark:bg-gray-800/20 text-center">
        <div className="max-w-3xl mx-auto space-y-10">
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white">Pronto para dar o primeiro passo?</h2>
            <p className="text-xl text-gray-500">Milhares de pessoas já estão cuidando de suas mentes com o Caramelo. Junte-se a nós hoje.</p>
            <button onClick={onStart} className="bg-caramel-500 hover:bg-caramel-600 text-white text-2xl font-black py-6 px-16 rounded-[2rem] shadow-2xl transition-all scale-100 hover:scale-105">
                {t.btnStart}
            </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 pt-20 pb-10 px-6 mt-auto">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 mb-20">
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <CarameloLogo className="w-10 h-10" />
                    <span className="text-2xl font-black dark:text-white">Caramelo</span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">O vira-lata que cuida da sua mente. Tecnologia brasileira exportada para o mundo.</p>
            </div>
            <div>
                <h4 className="font-black mb-6 dark:text-white">Navegação</h4>
                <ul className="space-y-4 text-gray-400 text-sm">
                    <li><button onClick={() => onNavigate(AppView.OUR_APPROACH)} className="hover:text-caramel-600">Metodologia</button></li>
                    <li><button onClick={() => onNavigate(AppView.FOR_BUSINESS)} className="hover:text-caramel-600">Empresas</button></li>
                    <li><button onClick={() => onNavigate(AppView.ABOUT_US)} className="hover:text-caramel-600">Sobre Nós</button></li>
                </ul>
            </div>
            <div>
                <h4 className="font-black mb-6 dark:text-white">Legal</h4>
                <ul className="space-y-4 text-gray-400 text-sm">
                    <li><button className="hover:text-caramel-600">Privacidade</button></li>
                    <li><button className="hover:text-caramel-600">Termos de Uso</button></li>
                    <li><button className="hover:text-caramel-600">Ética em IA</button></li>
                </ul>
            </div>
            <div>
                <h4 className="font-black mb-6 dark:text-white">Suporte</h4>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-900/40">
                    <p className="text-red-600 dark:text-red-400 text-[10px] uppercase font-black tracking-widest mb-1">Emergência</p>
                    <p className="text-red-700 dark:text-red-300 text-xs font-bold">{t.emergency}</p>
                </div>
            </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-gray-100 dark:border-gray-800 pt-10 text-center text-gray-400 text-xs">
            <p>© 2024 Caramelo AI. Proudly Brazilian 🇧🇷</p>
        </div>
      </footer>
    </div>
  );
};
