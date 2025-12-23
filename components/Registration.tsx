import React, { useState } from 'react';
import { UserProfile } from '../types';
import { User, ChevronLeft, Moon, Sun, Lock, Briefcase, FileText, Loader2, Mail, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { dataService } from '../services/dataService';

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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    
    setFormData(prev => ({ ...prev, cpf: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (formData.cpf.length < 14) {
        setError("Por favor, preencha o CPF corretamente.");
        setIsLoading(false);
        return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
            data: {
                name: formData.name,
                company: formData.company,
                cpf: formData.cpf,
                age: formData.age,
                phone: formData.phone
            }
        }
      });

      if (authError) {
        if (authError.message === 'User already registered') throw new Error("ALREADY_REGISTERED");
        if (authError.message.includes('API key')) throw new Error("Erro de configuração (API Key). Verifique o Netlify.");
        throw authError;
      }
      
      // CASO: E-mail requer confirmação (Se a opção estiver ativada no Supabase)
      if (authData.user && !authData.session) {
          setIsLoading(false);
          setSuccessMessage("Conta criada com sucesso!");
          return;
      }

      if (!authData.user || !authData.session) {
          throw new Error("Erro ao iniciar sessão.");
      }

      const userProfile: UserProfile = {
        id: authData.user.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        cpf: formData.cpf,
        company: formData.company,
        age: parseInt(formData.age) || 0
      };

      await dataService.saveProfile(userProfile);
      onComplete(userProfile);

    } catch (err: any) {
      console.error(err);
      if (err.message === "ALREADY_REGISTERED") {
         setError("Este e-mail já está cadastrado. Tente fazer login.");
      } else {
         setError(err.message || "Erro ao criar conta. Tente novamente.");
      }
    } finally {
      if (!successMessage) setIsLoading(false);
    }
  };

  if (successMessage) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 transition-colors duration-300">
            <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-xl p-8 max-w-md w-full text-center border border-white dark:border-gray-700">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 dark:text-green-400">
                    <CheckCircle size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Verifique seu E-mail</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Enviamos um link de confirmação para <strong>{formData.email}</strong>.
                </p>
                
                <button onClick={onBack} className="w-full bg-caramel-600 hover:bg-caramel-700 text-white font-bold py-3 rounded-xl transition">
                    Voltar para Login
                </button>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="max-w-lg w-full relative">
        <div className="flex justify-between items-center mb-6">
           <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-caramel-600 dark:text-gray-400 dark:hover:text-caramel-400 transition font-bold"><ChevronLeft size={20} /> Voltar</button>
           <button onClick={toggleTheme} className="p-2 rounded-full transition text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800">{isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}</button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-xl p-8 md:p-10 border border-white dark:border-gray-700 relative overflow-hidden transition-colors">
          <div className="relative z-10">
            <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white mb-2">Criar Conta</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Preencha seus dados para criar seu perfil seguro.</p>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100 dark:border-red-900 flex flex-col gap-2">
                   <div className="flex items-center gap-2"><AlertTriangle size={16}/> {error}</div>
                   {error.includes('fazer login') && (
                       <button onClick={onBack} className="bg-red-100 dark:bg-red-800/50 text-red-700 dark:text-red-200 py-2 rounded-lg text-xs font-bold hover:bg-red-200 transition">
                           Ir para tela de Login
                       </button>
                   )}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Nome Completo</label>
                <div className="relative">
                   <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
                   <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-0 focus:ring-2 focus:ring-caramel-500 text-gray-800 dark:text-white placeholder-gray-400" placeholder="Seu nome" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">CPF</label>
                    <div className="relative">
                       <FileText size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
                       <input 
                         type="text" 
                         name="cpf" 
                         required 
                         value={formData.cpf} 
                         onChange={handleCpfChange} 
                         maxLength={14}
                         className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-0 focus:ring-2 focus:ring-caramel-500 text-gray-800 dark:text-white placeholder-gray-400" 
                         placeholder="000.000.000-00" 
                       />
                    </div>
                 </div>
                 <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Idade</label>
                    <input type="number" name="age" required value={formData.age} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-0 focus:ring-2 focus:ring-caramel-500 text-gray-800 dark:text-white placeholder-gray-400" placeholder="Anos" />
                 </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Empresa (Opcional)</label>
                <div className="relative">
                   <Briefcase size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
                   <input type="text" name="company" value={formData.company} onChange={handleChange} className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-0 focus:ring-2 focus:ring-caramel-500 text-gray-800 dark:text-white placeholder-gray-400" placeholder="Onde você trabalha?" />
                </div>
              </div>

               <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">E-mail (Login)</label>
                  <div className="relative">
                      <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
                      <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-0 focus:ring-2 focus:ring-caramel-500 text-gray-800 dark:text-white placeholder-gray-400" placeholder="seu@email.com" />
                  </div>
               </div>
               
               <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Senha</label>
                  <div className="relative">
                      <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
                      <input type="password" name="password" required minLength={6} value={formData.password} onChange={handleChange} className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-0 focus:ring-2 focus:ring-caramel-500 text-gray-800 dark:text-white placeholder-gray-400" placeholder="Mínimo 6 caracteres" />
                  </div>
               </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-caramel-600 hover:bg-caramel-700 text-white text-lg font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : "Criar Conta e Continuar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};