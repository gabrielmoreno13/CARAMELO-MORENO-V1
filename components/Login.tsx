
import React, { useState } from 'react';
import { ChevronLeft, Lock, Mail, Moon, Sun, Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { dataService } from '../services/dataService';
import { UserProfile, AnamnesisData, Language } from '../types';
import { getT } from '../translations';

interface LoginProps {
  onLoginSuccess: (user: UserProfile, anamnesis: AnamnesisData | null) => void;
  onBack: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  language: Language;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, onBack, isDarkMode, toggleTheme, language }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = getT(language);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
          if (authError.message.includes("Email not confirmed")) throw new Error("EMAIL_NOT_CONFIRMED");
          if (authError.message.includes("Invalid login credentials")) throw new Error("INVALID_CREDENTIALS");
          throw authError;
      }

      if (authData.user) {
        const profile = await dataService.getProfile(authData.user.id);
        if (!profile) throw new Error("PROFILE_NOT_FOUND");
        const anamnesis = await dataService.getAnamnesis(authData.user.id);
        onLoginSuccess(profile, anamnesis);
      }
    } catch (err: any) {
      if (err.message === "EMAIL_NOT_CONFIRMED") setError(t.regSuccessDesc);
      else if (err.message === "INVALID_CREDENTIALS") setError("E-mail ou senha incorretos.");
      else setError(err.message || "Falha no login.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="max-w-md w-full relative">
        <div className="flex justify-between items-center mb-6">
           <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-caramel-600 dark:text-gray-400 font-bold"><ChevronLeft size={20} /> {t.back}</button>
           <button onClick={toggleTheme} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-400">{isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}</button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-xl p-8 border border-white dark:border-gray-700">
           <div className="text-center mb-8">
             <div className="w-16 h-16 bg-caramel-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg">C</div>
             <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{t.loginTitle}</h2>
             <p className="text-gray-500 dark:text-gray-400 text-sm">{t.loginSub}</p>
           </div>

           {error && (
             <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 p-4 rounded-xl text-sm mb-4 border border-red-100 dark:border-red-900/50 flex gap-2">
                <AlertTriangle size={16} className="shrink-0 mt-0.5"/> <span>{error}</span>
             </div>
           )}

           <form onSubmit={handleLogin} className="space-y-4">
             <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">{t.emailLabel}</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 dark:text-white outline-none" placeholder="seu@email.com" />
                </div>
             </div>
             <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">{t.passLabel}</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 dark:text-white outline-none" placeholder="******" />
                </div>
             </div>
             <button type="submit" disabled={isLoading} className="w-full bg-caramel-600 hover:bg-caramel-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2 mt-4">
               {isLoading ? <Loader2 className="animate-spin" /> : t.loginBtn}
             </button>
           </form>
        </div>
      </div>
    </div>
  );
};
