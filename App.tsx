import React, { useState } from 'react';
import { AppState, AppView, UserProfile, AnamnesisData } from './types';
import { LandingPage } from './components/LandingPage';
import { Registration } from './components/Registration';
import { Anamnesis } from './components/Anamnesis';
import { ChatInterface } from './components/ChatInterface';
import { OurApproachPage, ForBusinessPage, ProfessionalHelpPage, AboutUsPage } from './components/ExtraPages';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    view: AppView.LANDING,
    user: null,
    anamnesis: null,
  });

  const navigate = (view: AppView) => {
    setState(prev => ({ ...prev, view }));
  };

  const startRegistration = () => {
    setState(prev => ({ ...prev, view: AppView.REGISTER }));
  };

  const handleRegistrationComplete = (user: UserProfile) => {
    setState(prev => ({ ...prev, user, view: AppView.ANAMNESIS }));
  };

  const handleAnamnesisComplete = (anamnesis: AnamnesisData) => {
    setState(prev => ({ ...prev, anamnesis, view: AppView.CHAT }));
  };

  const goBackToLanding = () => {
    if (state.view === AppView.CHAT) {
        if (!window.confirm("Deseja realmente sair? O histórico desta sessão será perdido.")) return;
    }
    setState(prev => ({ ...prev, view: AppView.LANDING, anamnesis: null, user: null }));
  };

  return (
    <main className="font-sans text-gray-900">
      {state.view === AppView.LANDING && (
        <LandingPage onStart={startRegistration} onNavigate={navigate} />
      )}

      {state.view === AppView.OUR_APPROACH && (
        <OurApproachPage onStart={startRegistration} onNavigate={navigate} />
      )}

      {state.view === AppView.FOR_BUSINESS && (
        <ForBusinessPage onStart={startRegistration} onNavigate={navigate} />
      )}

      {state.view === AppView.PROFESSIONAL_HELP && (
        <ProfessionalHelpPage onStart={startRegistration} onNavigate={navigate} />
      )}

      {state.view === AppView.ABOUT_US && (
        <AboutUsPage onStart={startRegistration} onNavigate={navigate} />
      )}

      {state.view === AppView.REGISTER && (
        <Registration 
          onComplete={handleRegistrationComplete} 
          onBack={goBackToLanding} 
        />
      )}

      {state.view === AppView.ANAMNESIS && state.user && (
        <Anamnesis 
          userName={state.user.name} 
          onComplete={handleAnamnesisComplete} 
        />
      )}

      {state.view === AppView.CHAT && state.user && state.anamnesis && (
        <ChatInterface 
          user={state.user} 
          anamnesis={state.anamnesis} 
          onExit={goBackToLanding}
        />
      )}
    </main>
  );
};

export default App;