import React, { useState } from 'react';
import { UserProfile } from '../types';
import { User, ChevronLeft, ShieldCheck } from 'lucide-react';

interface RegistrationProps {
  onComplete: (user: UserProfile) => void;
  onBack: () => void;
}

export const Registration: React.FC<RegistrationProps> = ({ onComplete, onBack }) => {
  const [formData, setFormData] = useState<UserProfile>({
    name: '',
    email: '',
    phone: '',
    age: 0
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email) {
      onComplete(formData);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Header de Navegação */}
        <button 
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-gray-500 hover:text-caramel-600 transition font-bold"
        >
          <ChevronLeft size={20} /> Voltar
        </button>

        <div className="bg-white rounded-[2rem] shadow-xl p-8 md:p-10 border border-white relative overflow-hidden">
          {/* Decorative Background Blob */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-caramel-100 rounded-bl-[4rem] -z-0"></div>
          
          <div className="relative z-10">
            <div className="w-16 h-16 bg-caramel-100 rounded-2xl flex items-center justify-center text-caramel-600 mb-6 shadow-sm">
              <User size={32} />
            </div>

            <h2 className="text-3xl font-extrabold text-gray-800 mb-2">Bem-vindo(a)</h2>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Para personalizar seu suporte, precisamos de alguns dados básicos. Tudo permanece confidencial.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Como devemos te chamar?</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-caramel-500 focus:border-transparent outline-none transition text-lg text-gray-800 placeholder-gray-400"
                  placeholder="Seu nome"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Idade</label>
                  <input
                    type="number"
                    name="age"
                    required
                    min="12"
                    max="120"
                    className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-caramel-500 focus:border-transparent outline-none transition text-lg"
                    placeholder="Anos"
                    value={formData.age || ''}
                    onChange={handleChange}
                  />
                </div>
                 <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">WhatsApp</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-caramel-500 focus:border-transparent outline-none transition text-lg"
                    placeholder="(00) 00000"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">E-mail de Acesso</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-caramel-500 focus:border-transparent outline-none transition text-lg placeholder-gray-400"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-caramel-600 hover:bg-caramel-700 text-white text-lg font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-caramel-200 transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  Continuar
                </button>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-gray-400 text-xs mt-4">
                 <ShieldCheck size={14} />
                 <span>Seus dados são criptografados.</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};