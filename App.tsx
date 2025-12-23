
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
import { Loader2, AlertCircle } from 'lucide-react';

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
  const [diagnostics, setDiagnostics] = useState<string[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const logDiag = (msg: string) => {
    console.log(`[DIAGNOSTIC] ${msg}`);
    setDiagnostics(prev => [...prev.slice(-4), msg]);
  };

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem(THEME_KEY, isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  useEffect(() => {
    const restoreSession = async () => {
        logDiag("Iniciando restauração de sessão...");
        try {
            const { data, error } = await supabase.auth.getSession();
            if (error) {
              logDiag(`Erro Supabase: ${error.message}`);
              return;
            }

            const session = data?.session;
            if (session?.user) {
                logDiag(`Usuário encontrado: ${session.user.id}`);
                const profile = await dataService.getProfile(session.user.id);
                const anamnesis = await dataService.getAnamnesis(session.user.id);
                
                if (profile) {
                    logDiag("Perfil carregado com sucesso.");
                    setState(prev => ({
                        ...prev,
                        user: profile,
                        anamnesis: anamnesis,
                        view: anamnesis ? AppView.CHAT : AppView.ANAMNESIS
                    }));
                } else {
                    logDiag("Perfil não encontrado para o ID fornecido.");
                }
            } else {
                logDiag("Nenhuma sessão ativa encontrada.");
            }
        } catch (e: any) {
            logDiag(`Exceção: ${e.message}`);
        } finally {
            setIsLoaded(true);
        }
    };
    restoreSession();
  }, []);

  const navigate = (view: AppView) => {
    window.scrollTo(0, 0);
    setState(prev => ({ ...prev, view }));
  };

  if (!isLoaded) {
      return (
          <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-caramel-500 mb-4" size={48} />
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Caramelo está chegando...</p>
          </div>
      );
  }

  const commonProps = { 
    isDarkMode, 
    toggleTheme, 
    language: state.language, 
    onLanguageChange: (l: Language) => {
      setState(s => ({ ...s, language: l }));
      localStorage.setItem(LANG_KEY, l);
    }
  };

  return (
    <main className="font-sans text-gray-900 dark:text-gray-100 min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Overlay de Diagnóstico Temporário (Apenas visível se em dev ou com erro) */}
      {state.view === AppView.LANDING && diagnostics.some(d => d.includes("Erro")) && (
        <div className="fixed bottom-4 left-4 z-[9999] bg-red-600 text-white text-[10px] p-2 rounded-lg shadow-2xl opacity-80 flex items-center gap-2">
          <AlertCircle size={12}/> {diagnostics[diagnostics.length - 1]}
        </div>
      )}

      {state.view === AppView.LANDING && (
        <LandingPage onStart={() => navigate(AppView.REGISTER)} onNavigate={navigate} {...commonProps} />
      )}
      {state.view === AppView.LOGIN && (
        <Login onLoginSuccess={(u, a) => setState(prev => ({...prev, user: u, anamnesis: a, view: a ? AppView.CHAT : AppView.ANAMNESIS}))} onBack={() => navigate(AppView.LANDING)} {...commonProps} />
      )}
      {state.view === AppView.REGISTER && (
        <Registration onComplete={(u) => setState(prev => ({...prev, user: u, view: AppView.ANAMNESIS}))} onBack={() => navigate(AppView.LANDING)} {...commonProps} />
      )}
      {state.view === AppView.ANAMNESIS && state.user && (
        <Anamnesis userName={state.user.name} onComplete={(a) => {
          if (state.user?.id) dataService.saveAnamnesis(state.user.id, a);
          setState(prev => ({ ...prev, anamnesis: a, view: AppView.CHAT }));
        }} {...commonProps} />
      )}
      {state.view === AppView.CHAT && state.user && state.anamnesis && (
        <ChatInterface user={state.user} anamnesis={state.anamnesis} onExit={() => navigate(AppView.LANDING)} {...commonProps} />
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
