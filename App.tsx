
import React, { useState, useEffect } from 'react';
import { AppState, AppView, UserProfile, AnamnesisData, Language } from './types';
import { LandingPage } from './components/LandingPage';
import { Registration } from './components/Registration';
import { Login } from './components/Login';
import { Anamnesis } from './components/Anamnesis';
import { ChatInterface } from './components/ChatInterface';
import { SelfCareTools } from './components/SelfCareTools';
import { OurApproachPage, ForBusinessPage, ProfessionalHelpPage, AboutUsPage } from './components/ExtraPages';
import { supabase } from './services/supabaseClient';
import { dataService } from './services/dataService';
import { Loader2 } from 'lucide-react';

const THEME_KEY = 'caramelo_theme';
const LANG_KEY = 'caramelo_lang';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    view: AppView.LANDING,
    user: null,
    anamnesis: null,
    language: (localStorage.getItem(LANG_KEY) as Language) || 'pt'
  });

  const [isLoaded, setIsLoaded] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem(THEME_KEY, isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleLanguageChange = (language: Language) => {
    setState(prev => ({ ...prev, language }));
    localStorage.setItem(LANG_KEY, language);
  };

  useEffect(() => {
    const restoreSession = async () => {
        try {
            const sessionResponse = await supabase.auth.getSession();
            const session = sessionResponse?.data?.session;
            if (session && session.user) {
                const profile = await dataService.getProfile(session.user.id);
                const anamnesis = await dataService.getAnamnesis(session.user.id);
                if (profile) {
                    setState(prev => ({
                        ...prev,
                        user: profile,
                        anamnesis: anamnesis,
                        view: anamnesis ? AppView.CHAT : AppView.ANAMNESIS
                    }));
                }
            }
        } catch (e) {
            console.log("Supabase info: no session.");
        } finally {
            setIsLoaded(true);
        }
    };
    restoreSession();
  }, []);

  const navigate = (view: AppView) => setState(prev => ({ ...prev, view }));
  const handleAnamnesisComplete = async (anamnesis: AnamnesisData) => {
    if (state.user?.id) await dataService.saveAnamnesis(state.user.id, anamnesis);
    setState(prev => ({ ...prev, anamnesis, view: AppView.CHAT }));
  };
  const goBackToLanding = async () => {
    if (state.view === AppView.CHAT || state.view === AppView.TOOLS) await supabase.auth.signOut();
    setState(prev => ({ ...prev, view: AppView.LANDING, anamnesis: null, user: null }));
  };

  if (!isLoaded) {
      return (
          <div className="min-h-screen bg-caramel-50 dark:bg-gray-900 flex flex-col items-center justify-center transition-colors">
              <Loader2 className="animate-spin text-caramel-600 mb-4" size={48} />
              <p className="text-gray-500 font-medium">Carregando Caramelo...</p>
          </div>
      );
  }

  const commonProps = { 
    isDarkMode, 
    toggleTheme, 
    language: state.language, 
    onLanguageChange: handleLanguageChange 
  };

  return (
    <main className="font-sans text-gray-900 dark:text-gray-100 h-full bg-white dark:bg-gray-900 transition-colors duration-300">
      {state.view === AppView.LANDING && (
        <LandingPage onStart={() => navigate(AppView.REGISTER)} onNavigate={navigate} {...commonProps} />
      )}
      {state.view === AppView.LOGIN && (
        <Login onLoginSuccess={(u, a) => setState(prev => ({...prev, user: u, anamnesis: a, view: a ? AppView.CHAT : AppView.ANAMNESIS}))} onBack={() => navigate(AppView.LANDING)} {...commonProps} />
      )}
      {state.view === AppView.REGISTER && (
        <Registration onComplete={(u) => setState(prev => ({...prev, user: u, view: AppView.ANAMNESIS}))} onBack={goBackToLanding} {...commonProps} />
      )}
      {state.view === AppView.ANAMNESIS && state.user && (
        <Anamnesis userName={state.user.name} onComplete={handleAnamnesisComplete} {...commonProps} />
      )}
      {state.view === AppView.CHAT && state.user && state.anamnesis && (
        <ChatInterface user={state.user} anamnesis={state.anamnesis} onExit={goBackToLanding} onOpenTools={() => navigate(AppView.TOOLS)} {...commonProps} />
      )}
      {state.view === AppView.TOOLS && <SelfCareTools onNavigate={navigate} {...commonProps} />}
      {state.view === AppView.OUR_APPROACH && <OurApproachPage onStart={() => navigate(AppView.REGISTER)} onNavigate={navigate} {...commonProps} />}
      {state.view === AppView.FOR_BUSINESS && <ForBusinessPage onStart={() => navigate(AppView.REGISTER)} onNavigate={navigate} {...commonProps} />}
      {state.view === AppView.PROFESSIONAL_HELP && <ProfessionalHelpPage onStart={() => navigate(AppView.REGISTER)} onNavigate={navigate} {...commonProps} />}
      {state.view === AppView.ABOUT_US && <AboutUsPage onStart={() => navigate(AppView.REGISTER)} onNavigate={navigate} {...commonProps} />}
    </main>
  );
};

export default App;
