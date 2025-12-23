
import React, { useState, useEffect } from 'react';
import { AppState, AppView, UserProfile, Language } from './types';
import { LandingPage } from './components/LandingPage';
import { Registration } from './components/Registration';
import { Login } from './components/Login';
import { Anamnesis } from './components/Anamnesis';
import { ChatInterface } from './components/ChatInterface';
import { SelfCareTools } from './components/SelfCareTools';
import { OurApproachPage, ForBusinessPage, ProfessionalHelpPage, AboutUsPage } from './components/ExtraPages';
import { supabase } from './services/supabaseClient';
import { dataService } from './services/dataService';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    view: AppView.LANDING,
    user: null,
    anamnesis: null,
    language: (localStorage.getItem('caramelo_lang') as Language) || 'pt'
  });

  const [isLoaded, setIsLoaded] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    const root = window.document.documentElement;
    isDarkMode ? root.classList.add('dark') : root.classList.remove('dark');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const [profile, anamnesis] = await Promise.all([
            dataService.getProfile(session.user.id),
            dataService.getAnamnesis(session.user.id)
          ]);
          if (profile) {
            setState(prev => ({ ...prev, user: profile, anamnesis, view: anamnesis ? AppView.CHAT : AppView.ANAMNESIS }));
          }
        }
      } catch (e) { console.error("v3 Init Error", e); }
      finally { setIsLoaded(true); }
    };
    init();
  }, []);

  const navigate = (view: AppView) => { setState(prev => ({ ...prev, view })); window.scrollTo(0,0); };

  if (!isLoaded) return (
    <div className="h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center">
      <div className="w-16 h-16 bg-caramel-500 rounded-3xl animate-pulse mb-4"></div>
      <p className="text-caramel-600 font-black text-xs uppercase tracking-widest">Caramelo v3</p>
    </div>
  );

  const props = {
    isDarkMode, toggleTheme: () => setIsDarkMode(!isDarkMode),
    language: state.language, onLanguageChange: (l: Language) => { setState(s=>({...s, language:l})); localStorage.setItem('caramelo_lang', l); }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {state.view === AppView.LANDING && <LandingPage onStart={()=>navigate(AppView.REGISTER)} onNavigate={navigate} {...props} />}
      {state.view === AppView.LOGIN && <Login onLoginSuccess={(u, a)=>setState(s=>({...s, user:u, anamnesis:a, view:a?AppView.CHAT:AppView.ANAMNESIS}))} onBack={()=>navigate(AppView.LANDING)} {...props} />}
      {state.view === AppView.REGISTER && <Registration onComplete={(u)=>setState(s=>({...s, user:u, view:AppView.ANAMNESIS}))} onBack={()=>navigate(AppView.LANDING)} {...props} />}
      {state.view === AppView.ANAMNESIS && state.user && <Anamnesis userName={state.user.name} onComplete={a=>{ dataService.saveAnamnesis(state.user!.id, a); setState(s=>({...s, anamnesis:a, view:AppView.CHAT})); }} {...props} />}
      {/* Fix: Passed onNavigate prop to ChatInterface to resolve TypeScript error reported on line 70 */}
      {state.view === AppView.CHAT && state.user && state.anamnesis && <ChatInterface user={state.user} anamnesis={state.anamnesis} onExit={()=>navigate(AppView.LANDING)} onNavigate={navigate} {...props} />}
      {state.view === AppView.TOOLS && <SelfCareTools onNavigate={navigate} {...props} />}
      {state.view === AppView.OUR_APPROACH && <OurApproachPage onStart={()=>navigate(AppView.REGISTER)} onNavigate={navigate} {...props} />}
      {state.view === AppView.FOR_BUSINESS && <ForBusinessPage onStart={()=>navigate(AppView.REGISTER)} onNavigate={navigate} {...props} />}
      {state.view === AppView.PROFESSIONAL_HELP && <ProfessionalHelpPage onStart={()=>navigate(AppView.REGISTER)} onNavigate={navigate} {...props} />}
      {state.view === AppView.ABOUT_US && <AboutUsPage onStart={()=>navigate(AppView.REGISTER)} onNavigate={navigate} {...props} />}
    </div>
  );
};

export default App;
