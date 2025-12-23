import React, { useState } from 'react';
import { UserProfile } from '../types';
import { User, ChevronLeft, Lock, FileText, Loader2, Mail, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface RegistrationProps {
  onComplete: (user: UserProfile) => void;
  onBack: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const Registration: React.FC<RegistrationProps> = ({ onComplete, onBack, isDarkMode, toggleTheme }) => {
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
      // REGRA SÊNIOR: Enviamos os dados extras como METADATA. 
      // O Trigger que criamos no SQL vai ler isso e criar o perfil automaticamente no banco.
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
        // E-mail de confirmação ativado nas configurações do Supabase
        setStep('success');
      } else if (data.user && data.session) {
        // Logado direto (e-mail confirmado ou confirmação desativada)
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
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 max-w-md w-full text-center border border-gray-100 dark:border-gray-700">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold dark:text-white mb-4">Verifique seu e-mail</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            Enviamos um link de ativação para <strong>{formData.email}</strong>. 
            Você precisa clicar nele para liberar seu acesso ao Caramelo.
          </p>
          <button onClick={onBack} className="w-full bg-caramel-600 text-white font-bold py-4 rounded-xl hover:bg-caramel-700 transition">
            Voltar para o Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-gray-100 dark:border-gray-700">
          <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-caramel-600 mb-8 font-bold transition">
            <ChevronLeft size={20} /> Voltar
          </button>
          
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Criar conta</h2>
          <p className="text-gray-500 mb-8">Comece sua jornada de autocuidado hoje.</p>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 text-sm border border-red-100 dark:border-red-900/50 flex items-center gap-2">
              <AlertTriangle size={18} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Nome</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input name="name" required value={formData.name} onChange={handleChange} className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-none focus:ring-2 focus:ring-caramel-500 dark:text-white" placeholder="Seu nome" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Idade</label>
                <input name="age" type="number" required value={formData.age} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-none focus:ring-2 focus:ring-caramel-500 dark:text-white" placeholder="Ex: 25" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input name="email" type="email" required value={formData.email} onChange={handleChange} className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-none focus:ring-2 focus:ring-caramel-500 dark:text-white" placeholder="seu@email.com" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">CPF (Opcional)</label>
              <div className="relative">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input name="cpf" value={formData.cpf} onChange={handleChange} className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-none focus:ring-2 focus:ring-caramel-500 dark:text-white" placeholder="000.000.000-00" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input name="password" type="password" required minLength={6} value={formData.password} onChange={handleChange} className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-none focus:ring-2 focus:ring-caramel-500 dark:text-white" placeholder="Mínimo 6 dígitos" />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-caramel-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-caramel-700 transition flex items-center justify-center gap-2 mt-4">
              {isLoading ? <Loader2 className="animate-spin" /> : "Criar minha conta"}
            </button>
          </form>
          
          <p className="mt-8 text-center text-sm text-gray-400">
            Ao se cadastrar, você concorda com nossos <span className="underline cursor-pointer">Termos</span> e <span className="underline cursor-pointer">Privacidade</span>.
          </p>
        </div>
      </div>
    </div>
  );
};