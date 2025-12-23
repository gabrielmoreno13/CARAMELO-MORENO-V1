
import React, { useState } from 'react';
import { UserProfile, Language } from '../types';
import { User, ChevronLeft, Lock, FileText, Loader2, Mail, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { getT } from '../translations';

interface RegistrationProps {
  onComplete: (user: UserProfile) => void;
  onBack: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  language: Language;
}

export const Registration: React.FC<RegistrationProps> = ({ onComplete, onBack, isDarkMode, toggleTheme, language }) => {
  const t = getT(language);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    company: '',
    age: '',
    password: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'form' | 'success'>('form');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            cpf: formData.cpf,
            company: formData.company,
            phone: formData.phone,
            age: parseInt(formData.age) || 0
          }
        }
      });

      if (authError) throw authError;

      if (data.user && !data.session) {
        setStep('success');
      } else if (data.user && data.session) {
        onComplete({
          id: data.user.id,
          name: formData.name,
          email: formData.email,
          cpf: formData.cpf,
          company: formData.company,
          phone: formData.phone,
          age: parseInt(formData.age) || 0
        });
      }
    } catch (err: any) {
      setError(err.message || "Erro ao realizar cadastro.");
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-xl p-10 max-w-md w-full text-center border border-gray-100 dark:border-gray-700">
          <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-8 text-green-600">
            <CheckCircle size={48} />
          </div>
          <h2 className="text-3xl font-black dark:text-white mb-4">{t.regSuccessTitle}</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
            {t.regSuccessDesc.replace('{email}', formData.email)}
          </p>
          <button onClick={onBack} className="w-full bg-caramel-600 text-white font-black py-5 rounded-2xl hover:bg-caramel-700 transition shadow-lg">
            {t.login}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="bg-white dark:bg-gray-800 rounded-[3rem] shadow-2xl p-8 md:p-12 border border-gray-100 dark:border-gray-700">
          <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-caramel-600 mb-8 font-black transition">
            <ChevronLeft size={20} /> {t.back}
          </button>
          
          <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-2">{t.regTitle}</h2>
          <p className="text-gray-500 mb-8 font-medium">{t.regSub}</p>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-2xl mb-6 text-sm border border-red-100 dark:border-red-900/50 flex items-center gap-2">
              <AlertTriangle size={18} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-black text-gray-400 uppercase ml-1 tracking-widest">{t.nameLabel}</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input name="name" required value={formData.name} onChange={handleChange} className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700 rounded-2xl border-none focus:ring-2 focus:ring-caramel-500 dark:text-white outline-none" placeholder="..." />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-gray-400 uppercase ml-1 tracking-widest">{t.ageLabel}</label>
                <input name="age" type="number" required value={formData.age} onChange={handleChange} className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700 rounded-2xl border-none focus:ring-2 focus:ring-caramel-500 dark:text-white outline-none" placeholder="Ex: 25" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-gray-400 uppercase ml-1 tracking-widest">{t.emailLabel}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input name="email" type="email" required value={formData.email} onChange={handleChange} className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700 rounded-2xl border-none focus:ring-2 focus:ring-caramel-500 dark:text-white outline-none" placeholder="email@exemplo.com" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-gray-400 uppercase ml-1 tracking-widest">{t.cpfLabel}</label>
              <div className="relative">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input name="cpf" value={formData.cpf} onChange={handleChange} className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700 rounded-2xl border-none focus:ring-2 focus:ring-caramel-500 dark:text-white outline-none" placeholder="..." />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-gray-400 uppercase ml-1 tracking-widest">{t.passLabel}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input name="password" type="password" required minLength={6} value={formData.password} onChange={handleChange} className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700 rounded-2xl border-none focus:ring-2 focus:ring-caramel-500 dark:text-white outline-none" placeholder="******" />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-caramel-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-caramel-700 transition flex items-center justify-center gap-2 mt-4 active:scale-95">
              {isLoading ? <Loader2 className="animate-spin" /> : t.regBtn}
            </button>
          </form>
          
          <p className="mt-8 text-center text-xs text-gray-400 leading-relaxed">
            Ao se cadastrar, você concorda com nossos <span className="underline cursor-pointer">Termos</span> e <span className="underline cursor-pointer">Privacidade</span>.
          </p>
        </div>
      </div>
    </div>
  );
};
