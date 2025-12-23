
import React from 'react';
import { Navbar } from './Navbar';
import { AppView, Language } from '../types';
import { Shield, Brain, Smile, Activity, Users, TrendingUp, CheckCircle, AlertTriangle, ArrowRight, Star } from 'lucide-react';
import { getT } from '../translations';

interface PageProps {
  onStart: () => void;
  onNavigate: (view: AppView) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

const Footer = ({ onNavigate }: { onNavigate: (v: AppView) => void }) => (
  <footer className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 pt-10 pb-8 px-6 mt-auto">
    <div className="max-w-7xl mx-auto text-center text-sm text-gray-500 dark:text-gray-400">
      <p className="mb-2">© 2024 Caramelo AI. Proudly Brazilian 🇧🇷</p>
      <div className="flex justify-center gap-4 mt-4">
        <button onClick={() => onNavigate(AppView.LANDING)} className="hover:text-caramel-600 dark:hover:text-caramel-400">Home</button>
        <button onClick={() => onNavigate(AppView.ABOUT_US)} className="hover:text-caramel-600 dark:hover:text-caramel-400">About</button>
      </div>
    </div>
  </footer>
);

// PÁGINA: NOSSA ABORDAGEM
export const OurApproachPage: React.FC<PageProps> = ({ onStart, onNavigate, isDarkMode, toggleTheme, language, onLanguageChange }) => {
  const t = getT(language);
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Navbar onNavigate={onNavigate} onStart={onStart} activeView={AppView.OUR_APPROACH} isDarkMode={isDarkMode} toggleTheme={toggleTheme} language={language} onLanguageChange={onLanguageChange} />
      <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <span className="text-caramel-600 dark:text-caramel-400 font-bold tracking-widest text-sm uppercase">{t.methodology}</span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mt-2">{t.approachHero}</h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">{t.approachDesc}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
           <div className="bg-caramel-50 dark:bg-caramel-900/20 p-8 rounded-3xl border border-caramel-100 dark:border-caramel-800 text-center">
              <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 text-caramel-600 dark:text-caramel-400 shadow-sm"><Brain size={32}/></div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{t.approachCBT}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t.approachCBTDesc}</p>
           </div>
           <div className="bg-blue-50 dark:bg-blue-900/20 p-8 rounded-3xl border border-blue-100 dark:border-blue-800 text-center">
              <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600 dark:text-blue-400 shadow-sm"><Shield size={32}/></div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{t.approachSafety}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t.approachSafetyDesc}</p>
           </div>
           <div className="bg-green-50 dark:bg-green-900/20 p-8 rounded-3xl border border-green-100 dark:border-green-800 text-center">
              <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 dark:text-green-400 shadow-sm"><Smile size={32}/></div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{t.approachAlliance}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t.approachAllianceDesc}</p>
           </div>
        </div>
      </div>
      <Footer onNavigate={onNavigate} />
    </div>
  );
};

// PÁGINA: PARA EMPRESAS
export const ForBusinessPage: React.FC<PageProps> = ({ onStart, onNavigate, isDarkMode, toggleTheme, language, onLanguageChange }) => {
  const t = getT(language);
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Navbar onNavigate={onNavigate} onStart={onStart} activeView={AppView.FOR_BUSINESS} isDarkMode={isDarkMode} toggleTheme={toggleTheme} language={language} onLanguageChange={onLanguageChange} />
      <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto w-full">
         <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
            <div>
               <span className="text-blue-600 dark:text-blue-400 font-bold tracking-widest text-sm uppercase">Caramelo Corporate</span>
               <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mt-2 mb-6">{t.b2bSub}</h1>
               <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">{t.b2bDesc}</p>
               <button onClick={() => window.open('mailto:empresas@caramelo.ai')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition">Contact Sales</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl text-center">
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">40%</div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm">{t.b2bStat1}</div>
               </div>
               <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl text-center">
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">3x</div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm">{t.b2bStat2}</div>
               </div>
               <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl text-center">
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">24h</div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm">{t.statsAvailability}</div>
               </div>
               <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl text-center">
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">100%</div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm">{t.b2bStat3}</div>
               </div>
            </div>
         </div>
      </div>
      <Footer onNavigate={onNavigate} />
    </div>
  );
};

// PÁGINA: AJUDA PROFISSIONAL
export const ProfessionalHelpPage: React.FC<PageProps> = ({ onStart, onNavigate, isDarkMode, toggleTheme, language, onLanguageChange }) => {
  const t = getT(language);
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Navbar onNavigate={onNavigate} onStart={onStart} activeView={AppView.PROFESSIONAL_HELP} isDarkMode={isDarkMode} toggleTheme={toggleTheme} language={language} onLanguageChange={onLanguageChange} />
      <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto w-full">
         <div className="text-center mb-12">
            <AlertTriangle className="mx-auto text-yellow-500 mb-4" size={48} />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">{t.helpTitle}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">{t.helpDesc}</p>
         </div>

         <div className="bg-gray-50 dark:bg-gray-800 rounded-3xl p-8 md:p-12 mb-12">
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="py-4 px-4 text-gray-500 dark:text-gray-400 font-medium">{t.helpTableFeature}</th>
                        <th className="py-4 px-4 text-caramel-600 dark:text-caramel-400 font-bold text-lg">{t.helpTableCaramelo}</th>
                        <th className="py-4 px-4 text-gray-800 dark:text-gray-200 font-bold text-lg">{t.helpTableHuman}</th>
                     </tr>
                  </thead>
                  <tbody>
                     <tr className="border-b border-gray-100 dark:border-gray-700">
                        <td className="py-4 px-4 font-medium text-gray-700 dark:text-gray-300">{t.helpTableAvailability}</td>
                        <td className="py-4 px-4 text-caramel-600 dark:text-caramel-400">24/7</td>
                        <td className="py-4 px-4 text-gray-600 dark:text-gray-400">Sessions</td>
                     </tr>
                     <tr className="border-b border-gray-100 dark:border-gray-700">
                        <td className="py-4 px-4 font-medium text-gray-700 dark:text-gray-300">{t.helpTableCost}</td>
                        <td className="py-4 px-4 text-caramel-600 dark:text-caramel-400">Low/Free</td>
                        <td className="py-4 px-4 text-gray-600 dark:text-gray-400">Medium/High</td>
                     </tr>
                     <tr className="border-b border-gray-100 dark:border-gray-700">
                        <td className="py-4 px-4 font-medium text-gray-700 dark:text-gray-300">{t.helpTableDiagnosis}</td>
                        <td className="py-4 px-4 text-red-500 font-bold">No</td>
                        <td className="py-4 px-4 text-green-600 dark:text-green-500 font-bold">Yes</td>
                     </tr>
                  </tbody>
               </table>
            </div>
         </div>
         
         <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 p-8 rounded-2xl text-center">
            <h3 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">{t.helpEmergencyTitle}</h3>
            <p className="text-red-600 dark:text-red-300 mb-4">{t.helpEmergencyDesc}</p>
            <div className="flex flex-col md:flex-row justify-center gap-4">
               <a href="tel:188" className="bg-red-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-700 transition">CVV 188 (BR)</a>
            </div>
         </div>
      </div>
      <Footer onNavigate={onNavigate} />
    </div>
  );
};

// PÁGINA: SOBRE NÓS
export const AboutUsPage: React.FC<PageProps> = ({ onStart, onNavigate, isDarkMode, toggleTheme, language, onLanguageChange }) => {
  const t = getT(language);
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Navbar onNavigate={onNavigate} onStart={onStart} activeView={AppView.ABOUT_US} isDarkMode={isDarkMode} toggleTheme={toggleTheme} language={language} onLanguageChange={onLanguageChange} />
      <div className="pt-32 pb-20 px-6 max-w-5xl mx-auto w-full text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-8">{t.aboutMissionTitle}</h1>
          <p className="text-2xl text-gray-600 dark:text-gray-300 leading-relaxed mb-16">{t.aboutMissionDesc}</p>

          <div className="grid md:grid-cols-2 gap-12 text-left items-center mb-20">
             <div>
                <img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1000&auto=format&fit=crop" alt="Team" className="rounded-3xl shadow-xl w-full"/>
             </div>
             <div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{t.aboutWhyTitle}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{t.whyDesc}</p>
             </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
             <div className="p-4">
                <div className="text-4xl font-bold text-caramel-600 dark:text-caramel-400 mb-2">2024</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{t.aboutYear}</div>
             </div>
             <div className="p-4">
                <div className="text-4xl font-bold text-caramel-600 dark:text-caramel-400 mb-2">SP</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{t.aboutLocation}</div>
             </div>
             <div className="p-4">
                <div className="text-4xl font-bold text-caramel-600 dark:text-caramel-400 mb-2">AI</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{t.aboutTech}</div>
             </div>
             <div className="p-4">
                <div className="text-4xl font-bold text-caramel-600 dark:text-caramel-400 mb-2">♥</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{t.aboutLove}</div>
             </div>
          </div>
      </div>
      <Footer onNavigate={onNavigate} />
    </div>
  );
};
