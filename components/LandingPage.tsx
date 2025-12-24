
import React from 'react';
import { ArrowRight, Brain, Heart, Shield, MessageCircle, Sparkles, TrendingUp, Star, Users, Briefcase, Plus, Smile } from 'lucide-react';
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
    <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">{desc}</p>
  </div>
);

const TestimonialCard = ({ name, role, text, rating }: any) => (
  <div className="bg-gray-50 dark:bg-gray-800/40 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-700">
    <div className="flex gap-1 mb-4">
      {[...Array(rating)].map((_, i) => <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />)}
    </div>
    <p className="text-gray-600 dark:text-gray-300 italic mb-6 leading-relaxed font-medium">"{text}"</p>
    <div>
      <h4 className="font-bold text-gray-900 dark:text-white">{name}</h4>
      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mt-1">{role}</p>
    </div>
  </div>
);

const FAQItem = ({ q, a }: any) => {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="border-b border-gray-100 dark:border-gray-800">
      <button onClick={() => setOpen(!open)} className="w-full py-6 flex justify-between items-center text-left hover:text-caramel-600 transition group">
        <span className="font-black text-lg text-gray-800 dark:text-gray-200 group-hover:translate-x-1 transition-transform">{q}</span>
        <Plus className={`transition-transform duration-500 ${open ? 'rotate-45 text-caramel-600' : ''}`} />
      </button>
      {open && <p className="pb-8 text-gray-500 dark:text-gray-400 animate-fade-in leading-relaxed font-medium">{a}</p>}
    </div>
  );
};

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onStart, onNavigate, isDarkMode, toggleTheme, language, onLanguageChange 
}) => {
  const t = getT(language);

  const rawTitle = (t.heroTitle || "Alguém para te ouvir.").toString();
  const heroWords = rawTitle.split(' ');
  const lastWord = heroWords.length > 0 ? heroWords.pop() : "";
  const firstPart = heroWords.join(' ');

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300 overflow-x-hidden">
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
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-caramel-100/30 dark:bg-caramel-900/10 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-100/20 dark:bg-blue-900/10 rounded-full blur-[100px] -z-10 -translate-x-1/2 translate-y-1/2"></div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="space-y-10 animate-fade-in-up text-center lg:text-left">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-caramel-50 dark:bg-caramel-900/30 border border-caramel-100 dark:border-caramel-800 text-caramel-700 dark:text-caramel-400 text-sm font-black shadow-sm">
               <Heart size={18} /> {t.heroSub}
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 dark:text-white leading-[1.1]">
              {firstPart} <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-caramel-500 to-orange-600 drop-shadow-sm">{lastWord}</span>
            </h1>
            
            <p className="text-lg md:text-2xl text-gray-600 dark:text-gray-400 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              {t.heroDesc}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start pt-6">
              <button onClick={onStart} className="group bg-caramel-500 hover:bg-caramel-600 text-white text-xl font-black py-5 px-12 rounded-[2rem] shadow-2xl shadow-caramel-200 dark:shadow-none transition-all flex items-center justify-center gap-3 active:scale-95">
                {t.btnStart} <ArrowRight className="group-hover:translate-x-1 transition-transform" size={24} />
              </button>
              <button onClick={() => onNavigate(AppView.OUR_APPROACH)} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-2 border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-black py-5 px-10 rounded-[2rem] transition-all hover:bg-gray-50 active:scale-95">
                {t.btnLearn}
              </button>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-10 pt-10 opacity-70">
                <div className="text-center lg:text-left">
                    <div className="text-3xl font-black text-gray-900 dark:text-white">50k+</div>
                    <div className="text-[10px] uppercase font-black text-gray-400 tracking-[0.2em] mt-1">{t.statsUsers}</div>
                </div>
                <div className="h-12 w-px bg-gray-200 dark:bg-gray-800"></div>
                <div className="text-center lg:text-left">
                    <div className="text-3xl font-black text-gray-900 dark:text-white">24/7</div>
                    <div className="text-[10px] uppercase font-black text-gray-400 tracking-[0.2em] mt-1">{t.statsAvailability}</div>
                </div>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end animate-fade-in pointer-events-none">
             <div className="relative w-full max-w-lg aspect-square">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 md:w-96 md:h-96 bg-caramel-500/15 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/40 backdrop-blur-3xl rounded-[4rem] border-2 border-white/60 dark:border-gray-700/50 shadow-2xl flex items-center justify-center z-20 overflow-hidden transform rotate-2">
                    <div className="absolute inset-0 bg-gradient-to-br from-caramel-50/60 to-orange-50/60 dark:from-gray-800/50 dark:to-gray-900/50"></div>
                    <div className="relative text-center space-y-6">
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-caramel-400 to-orange-600 rounded-[2.5rem] mx-auto flex items-center justify-center shadow-2xl transform hover:rotate-6 transition-transform">
                          <CarameloLogo className="w-16 h-16 md:w-20 md:h-20 text-white"/>
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Caramelo</h3>
                            <p className="text-caramel-600 font-black text-sm uppercase tracking-widest mt-1">Sempre ao seu lado</p>
                        </div>
                    </div>
                </div>
                <div className="absolute top-0 right-10 animate-bounce-slow z-30">
                  <div className="bg-white dark:bg-gray-800 p-5 rounded-[2rem] shadow-2xl flex items-center gap-4 border border-gray-100 dark:border-gray-700">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center text-blue-600"><Smile size={22}/></div>
                    <span className="font-black text-sm text-gray-800 dark:text-white">Acolhedor</span>
                  </div>
                </div>
                <div className="absolute bottom-10 left-0 animate-bounce-slow z-30" style={{ animationDelay: '2s' }}>
                  <div className="bg-white dark:bg-gray-800 p-5 rounded-[2rem] shadow-2xl flex items-center gap-4 border border-gray-100 dark:border-gray-700">
                    <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/40 rounded-full flex items-center justify-center text-pink-600"><Heart size={22}/></div>
                    <span className="font-black text-sm text-gray-800 dark:text-white">Leal</span>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </header>

      {/* PROBLEM SECTION */}
      <section className="py-24 px-6 bg-caramel-50/50 dark:bg-gray-900/40">
        <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight">
                {t.problemTitle}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed">
                {t.problemDesc}
            </p>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-24 px-6 max-w-7xl mx-auto w-full">
         <div className="grid md:grid-cols-3 gap-10">
            <FeatureCard color="bg-caramel-500" icon={MessageCircle} title={t.featChatTitle} desc={t.featChatDesc} />
            <FeatureCard color="bg-blue-500" icon={Users} title={t.featVoiceTitle} desc={t.featVoiceDesc} />
            <FeatureCard color="bg-pink-500" icon={Shield} title={t.featToolsTitle} desc={t.featToolsDesc} />
         </div>
      </section>

      {/* STORYTELLING SECTION */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto bg-caramel-500 rounded-[4rem] p-12 md:p-24 text-white grid lg:grid-cols-2 gap-20 items-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2"></div>
            <div className="space-y-10 relative z-10">
                <h2 className="text-4xl md:text-6xl font-black leading-tight">{t.whyTitle}</h2>
                <p className="text-xl text-caramel-50 leading-relaxed font-medium">
                    {t.whyDesc}
                </p>
                <button onClick={onStart} className="bg-white text-caramel-600 font-black py-5 px-12 rounded-2xl hover:bg-caramel-50 transition-all shadow-2xl active:scale-95 text-lg uppercase tracking-widest">
                    {t.btnStart}
                </button>
            </div>
            <div className="flex justify-center relative z-10">
                <div className="w-full max-w-sm aspect-square bg-white/15 backdrop-blur-xl rounded-[4rem] border-2 border-white/30 flex items-center justify-center transform -rotate-3 transition-transform hover:rotate-0 shadow-2xl">
                    <CarameloLogo className="w-40 h-40 md:w-56 md:h-56 text-white"/>
                </div>
            </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 px-6 max-w-7xl mx-auto w-full">
         <div className="text-center mb-20 space-y-4">
             <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">Vozes que ouvimos</h2>
             <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-sm">Pessoas reais, sentimentos reais.</p>
         </div>
         <div className="grid md:grid-cols-3 gap-10">
            <TestimonialCard name="Mariana S." role="Estudante" text="Senti que finalmente tinha um espaço pra falar sem ser julgada. O Caramelo me ouviu quando ninguém mais podia." rating={5} />
            <TestimonialCard name="Ricardo F." role="Engenheiro" text="As pausas para respirar me ajudam a voltar pro eixo nos dias de correria. É como ter um amigo no bolso." rating={5} />
            <TestimonialCard name="Ana Paula" role="Gestora" text="A simplicidade do Caramelo é o que mais me agrada. É direto, humano e me faz sentir segura." rating={5} />
         </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-24 px-6 max-w-4xl mx-auto w-full">
         <h2 className="text-3xl md:text-6xl font-black text-gray-900 dark:text-white text-center mb-20 tracking-tight">{t.faqTitle}</h2>
         <div className="space-y-2">
            <FAQItem q={t.faqQ1} a={t.faqA1} />
            <FAQItem q={t.faqQ2} a={t.faqA2} />
         </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-32 px-6 bg-caramel-50 dark:bg-gray-900/40 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-12 relative z-10">
            <h2 className="text-4xl md:text-7xl font-black text-gray-900 dark:text-white leading-[1.1]">Você não precisa lidar com tudo só.</h2>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed">Me conta como você está agora e vamos caminhar juntos.</p>
            <button onClick={onStart} className="bg-caramel-500 hover:bg-caramel-600 text-white text-3xl font-black py-8 px-20 rounded-[3rem] shadow-2xl shadow-caramel-200 transition-all hover:scale-105 active:scale-95 inline-flex items-center gap-4">
                {t.btnStart} <ArrowRight size={32}/>
            </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-900 pt-32 pb-12 px-8 mt-auto">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-16 mb-24">
            <div className="space-y-8">
                <div className="flex items-center gap-4">
                    <CarameloLogo className="w-12 h-12" />
                    <span className="text-3xl font-black dark:text-white tracking-tight">Caramelo</span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed font-medium">O amigo que cuida de você. Um projeto brasileiro focado em levar acolhimento para onde houver necessidade.</p>
            </div>
            <div>
                <h4 className="font-black mb-8 dark:text-white uppercase tracking-widest text-xs">Navegação</h4>
                <ul className="space-y-5 text-gray-500 dark:text-gray-400 text-sm font-bold">
                    <li><button onClick={() => onNavigate(AppView.OUR_APPROACH)} className="hover:text-caramel-600 transition-colors">{t.ourapproach}</button></li>
                    <li><button onClick={() => onNavigate(AppView.FOR_BUSINESS)} className="hover:text-caramel-600 transition-colors">{t.forbusiness}</button></li>
                    <li><button onClick={() => onNavigate(AppView.ABOUT_US)} className="hover:text-caramel-600 transition-colors">{t.aboutus}</button></li>
                </ul>
            </div>
            <div>
                <h4 className="font-black mb-8 dark:text-white uppercase tracking-widest text-xs">Suporte Crítico</h4>
                <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-3xl border border-red-100 dark:border-red-900/40 space-y-3">
                    <p className="text-red-600 dark:text-red-400 text-[10px] uppercase font-black tracking-[0.2em]">Emergência</p>
                    <p className="text-red-700 dark:text-red-300 text-sm font-black leading-tight">{t.emergency}</p>
                    <button className="w-full bg-red-600 text-white text-xs font-black py-3 rounded-xl shadow-lg mt-2">LIGAR 188 AGORA</button>
                </div>
            </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-gray-100 dark:border-gray-900 pt-12 text-center text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">
            <p>© 2024 Caramelo. Criado com carinho no Brasil 🇧🇷</p>
        </div>
      </footer>
    </div>
  );
};
