import React, { useState, useEffect } from 'react';
import { AppState, AppView, UserProfile, AnamnesisData } from './types';
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

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    view: AppView.LANDING,
    user: null,
    anamnesis: null,
  });

  const [isLoaded, setIsLoaded] = useState(false);

  // Estado do Tema Global
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Aplicar tema no HTML
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem(THEME_KEY, 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem(THEME_KEY, 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Tenta restaurar sessão do Supabase ao iniciar
  useEffect(() => {
    const restoreSession = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
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
            console.error("Erro ao restaurar sessão", e);
        } finally {
            setIsLoaded(true);
        }
    };
    restoreSession();
  }, []);

  const navigate = (view: AppView) => {
    setState(prev => ({ ...prev, view }));
  };

  const startRegistration = () => {
    setState(prev => ({ ...prev, view: AppView.REGISTER }));
  };

  const handleRegistrationComplete = (user: UserProfile) => {
    setState(prev => ({ ...prev, user, view: AppView.ANAMNESIS }));
  };

  const handleLoginComplete = (user: UserProfile, anamnesis: AnamnesisData | null) => {
     setState(prev => ({
         ...prev,
         user,
         anamnesis,
         view: anamnesis ? AppView.CHAT : AppView.ANAMNESIS
     }));
  };

  const handleAnamnesisComplete = async (anamnesis: AnamnesisData) => {
    if (state.user?.id) {
        await dataService.saveAnamnesis(state.user.id, anamnesis);
    }
    setState(prev => ({ ...prev, anamnesis, view: AppView.CHAT }));
  };

  const goBackToLanding = async () => {
    if (state.view === AppView.CHAT || state.view === AppView.TOOLS) {
        if (!window.confirm("Deseja sair da sua conta?")) return;
        await supabase.auth.signOut();
    }
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

  const commonProps = { isDarkMode, toggleTheme };

  return (
    <main className="font-sans text-gray-900 dark:text-gray-100 h-full bg-white dark:bg-gray-900 transition-colors duration-300">
      {state.view === AppView.LANDING && (
        <LandingPage onStart={startRegistration} onNavigate={navigate} {...commonProps} />
      )}

      {state.view === AppView.LOGIN && (
        <Login onLoginSuccess={handleLoginComplete} onBack={() => navigate(AppView.LANDING)} {...commonProps} />
      )}

      {state.view === AppView.OUR_APPROACH && (
        <OurApproachPage onStart={startRegistration} onNavigate={navigate} {...commonProps} />
      )}

      {state.view === AppView.FOR_BUSINESS && (
        <ForBusinessPage onStart={startRegistration} onNavigate={navigate} {...commonProps} />
      )}

      {state.view === AppView.PROFESSIONAL_HELP && (
        <ProfessionalHelpPage onStart={startRegistration} onNavigate={navigate} {...commonProps} />
      )}

      {state.view === AppView.ABOUT_US && (
        <AboutUsPage onStart={startRegistration} onNavigate={navigate} {...commonProps} />
      )}

      {state.view === AppView.REGISTER && (
        <Registration 
          onComplete={handleRegistrationComplete} 
          onBack={goBackToLanding} 
          {...commonProps}
        />
      )}

      {state.view === AppView.ANAMNESIS && state.user && (
        <Anamnesis 
          userName={state.user.name} 
          onComplete={handleAnamnesisComplete} 
          {...commonProps}
        />
      )}

      {state.view === AppView.CHAT && state.user && state.anamnesis && (
        <ChatInterface 
          user={state.user} 
          anamnesis={state.anamnesis} 
          onExit={goBackToLanding}
          onOpenTools={() => navigate(AppView.TOOLS)}
          {...commonProps}
        />
      )}

      {state.view === AppView.TOOLS && (
         <SelfCareTools 
            onNavigate={navigate}
            {...commonProps}
         />
      )}
    </main>
  );
};

export default App;