import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { User, ChevronLeft, Moon, Sun, Lock, Briefcase, FileText, Loader2, Mail, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
      const pass = formData.password;
      let score = 0;
      if (pass.length > 5) score++;
      if (pass.length > 8) score++;
      if (/[A-Z]/.test(pass)) score++;
      if (/[0-9]/.test(pass)) score++;
      if (/[^A-Za-z0-9]/.test(pass)) score++;
      setPasswordStrength(score);
  }, [formData.password]);

  const getStrengthLabel = () => {
      if (passwordStrength < 2) return { text: "Fraca", color: "bg-red-500", width: "33%" };
      if (passwordStrength < 4) return { text: "Média", color: "bg-yellow-500", width: "66%" };
      return { text: "Forte", color: "bg-green-500", width: "100%" };
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

    if (formData.cpf.length < 14) {
        setError("Por favor, preencha o CPF corretamente.");
        setIsLoading(false);
        return;
    }
    
    if (passwordStrength < 2) {
        setError("Sua senha é muito fraca. Tente misturar letras e números.");
        setIsLoading(false);
        return;
    }

    try {
      // SÊNIOR FIX: Passamos todos os dados no 'data' (metadata).
      // O Trigger SQL 'handle_new_user' vai ler isso e criar o perfil automaticamente.
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
            data: {
                name: formData.name,
                company: formData.company,
                cpf: formData.cpf,
                age: parseInt(formData.age) || 0,
                phone: formData.phone
            }
        }
      });

      if (authError) {
        if (authError.message === 'User already registered') throw new Error("ALREADY_REGISTERED");
        throw authError;
      }
      
      // Cenário 1: Confirmação de e-mail ATIVADA (User existe, mas Session é null)
      if (data.user && !data.session) {
          setIsLoading(false);
          setSuccessMessage("Cadastro realizado! Verifique seu e-mail para ativar a conta.");
          return;
      }

      // Cenário 2: Confirmação de e-mail DESATIVADA (Login imediato)
      if (data.user && data.session) {
         // Pequeno delay para garantir que o Trigger do banco terminou de rodar
         await new Promise(r => setTimeout(r, 1000));
         
         const userProfile: UserProfile = {
            id: data.user.id,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            cpf: formData.cpf,
            company: formData.company,
            age: parseInt(formData.age) || 0
         };
         onComplete(userProfile);
      }

    } catch (err: any) {
      if (err.message === "ALREADY_REGISTERED") setError("Este e-mail já está cadastrado.");
      else setError(err.message || "Erro ao criar conta.");
    } finally {
      if (!successMessage) setIsLoading(false);
    }
  };

  if (successMessage) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-xl p-8 max-w-md w-full text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600"><CheckCircle size={32} /></div>
                <h2 className="text-2xl font-bold dark:text-white mb-2">Verifique seu E-mail</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Enviamos um link de confirmação para <strong>{formData.email}</strong>.
                    <br/><br/>
                    <span className="text-sm text-gray-500">Clique no link para ativar sua conta e acessar o Caramelo.</span>
                </p>
                <button onClick={onBack} className="w-full bg-caramel-600 text-white font-bold py-3 rounded-xl hover:bg-caramel-700 transition">Voltar para Login</button>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-lg w-full relative">
        <div className="flex justify-between items-center mb-6">
           <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-caramel-600 font-bold"><ChevronLeft size={20} /> Voltar</button>
           <button onClick={toggleTheme} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800">{isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}</button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-xl p-8 md:p-10 relative">
            <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white mb-2">Criar Conta</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 flex items-center gap-2"><ShieldCheck size={16}/> Seus dados estão seguros e criptografados.</p>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100 flex gap-2"><AlertTriangle size={16}/> {error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nome Completo</label>
                <div className="relative">
                   <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
                   <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-0 focus:ring-2 focus:ring-caramel-500 dark:text-white" placeholder="Seu nome" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">CPF</label>
                    <div className="relative">
                       <FileText size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
                       <input type="text" name="cpf" required value={formData.cpf} onChange={handleCpfChange} maxLength={14} className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-0 focus:ring-2 focus:ring-caramel-500 dark:text-white" placeholder="000.000.000-00" />
                    </div>
                 </div>
                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Idade</label>
                    <input type="number" name="age" required value={formData.age} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-0 focus:ring-2 focus:ring-caramel-500 dark:text-white" placeholder="Anos" />
                 </div>
              </div>

               <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">E-mail</label>
                  <div className="relative">
                      <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
                      <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-0 focus:ring-2 focus:ring-caramel-500 dark:text-white" placeholder="seu@email.com" />
                  </div>
               </div>
               
               <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Senha</label>
                  <div className="relative">
                      <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
                      <input type="password" name="password" required minLength={6} value={formData.password} onChange={handleChange} className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-0 focus:ring-2 focus:ring-caramel-500 dark:text-white" placeholder="Mínimo 6 caracteres" />
                  </div>
                  {/* Password Strength Meter */}
                  {formData.password && (
                      <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                              <div className={`h-full transition-all duration-300 ${getStrengthLabel().color}`} style={{ width: getStrengthLabel().width }}></div>
                          </div>
                          <span className="text-xs font-bold text-gray-400">{getStrengthLabel().text}</span>
                      </div>
                  )}
               </div>

              <button type="submit" disabled={isLoading} className="w-full bg-caramel-600 hover:bg-caramel-700 text-white text-lg font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mt-6">
                  {isLoading ? <Loader2 className="animate-spin" /> : "Criar Conta e Continuar"}
              </button>
            </form>
        </div>
      </div>
    </div>
  );
};