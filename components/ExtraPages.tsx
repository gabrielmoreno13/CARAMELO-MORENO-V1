import React from 'react';
import { Navbar } from './Navbar';
import { AppView } from '../types';
import { Shield, Brain, Smile, Activity, Users, TrendingUp, CheckCircle, AlertTriangle, ArrowRight, Star } from 'lucide-react';

interface PageProps {
  onStart: () => void;
  onNavigate: (view: AppView) => void;
}

const Footer = ({ onNavigate }: { onNavigate: (v: AppView) => void }) => (
  <footer className="bg-gray-50 border-t border-gray-200 pt-10 pb-8 px-6 mt-auto">
    <div className="max-w-7xl mx-auto text-center text-sm text-gray-500">
      <p className="mb-2">© 2024 Caramelo AI. Construindo um futuro mentalmente saudável.</p>
      <div className="flex justify-center gap-4 mt-4">
        <button onClick={() => onNavigate(AppView.LANDING)} className="hover:text-caramel-600">Início</button>
        <button onClick={() => onNavigate(AppView.ABOUT_US)} className="hover:text-caramel-600">Sobre</button>
      </div>
    </div>
  </footer>
);

// PÁGINA: NOSSA ABORDAGEM
export const OurApproachPage: React.FC<PageProps> = ({ onStart, onNavigate }) => (
  <div className="flex flex-col min-h-screen bg-white">
    <Navbar onNavigate={onNavigate} onStart={onStart} activeView={AppView.OUR_APPROACH} />
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto w-full">
      <div className="text-center mb-16">
        <span className="text-caramel-600 font-bold tracking-widest text-sm uppercase">Metodologia</span>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mt-2">Inteligência Artificial com <br/><span className="text-caramel-500">Coração Humano</span></h1>
        <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">Combinamos técnicas baseadas em evidências com a acessibilidade da tecnologia para criar um espaço de escuta ativa e segura.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-20">
         <div className="bg-caramel-50 p-8 rounded-3xl border border-caramel-100 text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 text-caramel-600 shadow-sm"><Brain size={32}/></div>
            <h3 className="text-xl font-bold mb-3">Cognitivo-Comportamental</h3>
            <p className="text-gray-600">Utilizamos princípios de reestruturação cognitiva para ajudar a identificar e mudar padrões de pensamento negativos.</p>
         </div>
         <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100 text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600 shadow-sm"><Shield size={32}/></div>
            <h3 className="text-xl font-bold mb-3">Segurança Clínica</h3>
            <p className="text-gray-600">Protocolos rigorosos para detecção de crises. O sistema sabe quando parar e sugerir ajuda humana especializada.</p>
         </div>
         <div className="bg-green-50 p-8 rounded-3xl border border-green-100 text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 shadow-sm"><Smile size={32}/></div>
            <h3 className="text-xl font-bold mb-3">Aliança Terapêutica</h3>
            <p className="text-gray-600">Focamos em criar um vínculo de confiança. Estudos mostram que a "aliança" é crucial para o sucesso do suporte.</p>
         </div>
      </div>

      {/* Gráfico Simulado CSS */}
      <div className="bg-gray-900 text-white rounded-[3rem] p-10 md:p-16 mb-20">
         <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
               <h3 className="text-3xl font-bold mb-4">Eficácia Comprovada</h3>
               <p className="text-gray-400 mb-8">Comparativo de redução de sintomas de ansiedade após 4 semanas de uso contínuo.</p>
               <ul className="space-y-4">
                  <li className="flex items-center gap-3"><CheckCircle className="text-caramel-500"/> <span>Disponibilidade 24/7 aumenta adesão</span></li>
                  <li className="flex items-center gap-3"><CheckCircle className="text-caramel-500"/> <span>Sem julgamento = maior honestidade</span></li>
                  <li className="flex items-center gap-3"><CheckCircle className="text-caramel-500"/> <span>Exercícios práticos diários</span></li>
               </ul>
            </div>
            <div className="bg-white/10 p-8 rounded-2xl">
               <div className="space-y-6">
                  <div>
                     <div className="flex justify-between text-sm mb-1"><span>Apps Comuns</span> <span>20% Melhora</span></div>
                     <div className="w-full bg-gray-700 rounded-full h-4"><div className="bg-gray-500 h-4 rounded-full" style={{width: '20%'}}></div></div>
                  </div>
                  <div>
                     <div className="flex justify-between text-sm mb-1"><span>Terapia Semanal</span> <span>45% Melhora</span></div>
                     <div className="w-full bg-gray-700 rounded-full h-4"><div className="bg-blue-500 h-4 rounded-full" style={{width: '45%'}}></div></div>
                  </div>
                  <div>
                     <div className="flex justify-between text-sm font-bold text-caramel-400 mb-1"><span>Caramelo AI + Terapia</span> <span>68% Melhora</span></div>
                     <div className="w-full bg-gray-700 rounded-full h-4"><div className="bg-caramel-500 h-4 rounded-full" style={{width: '68%'}}></div></div>
                  </div>
               </div>
               <p className="text-xs text-gray-400 mt-4 text-center">*Dados simulados baseados em estudos de mercado de Saúde Digital.</p>
            </div>
         </div>
      </div>
    </div>
    <Footer onNavigate={onNavigate} />
  </div>
);

// PÁGINA: PARA EMPRESAS
export const ForBusinessPage: React.FC<PageProps> = ({ onStart, onNavigate }) => (
  <div className="flex flex-col min-h-screen bg-white">
    <Navbar onNavigate={onNavigate} onStart={onStart} activeView={AppView.FOR_BUSINESS} />
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto w-full">
       <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
          <div>
             <span className="text-blue-600 font-bold tracking-widest text-sm uppercase">Caramelo Corporate</span>
             <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mt-2 mb-6">Cuide da mente do seu time, potencialize resultados.</h1>
             <p className="text-lg text-gray-600 mb-8">Burnout e ansiedade custam bilhões às empresas anualmente. Ofereça o Caramelo como benefício e crie uma cultura de cuidado preventivo.</p>
             <button onClick={() => window.open('mailto:empresas@caramelo.ai')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition">Agendar Demo</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-gray-50 p-6 rounded-2xl text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">40%</div>
                <div className="text-gray-600 text-sm">Redução de Burnout</div>
             </div>
             <div className="bg-gray-50 p-6 rounded-2xl text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">3x</div>
                <div className="text-gray-600 text-sm">Mais Engajamento</div>
             </div>
             <div className="bg-gray-50 p-6 rounded-2xl text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">24h</div>
                <div className="text-gray-600 text-sm">Suporte Imediato</div>
             </div>
             <div className="bg-gray-50 p-6 rounded-2xl text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">100%</div>
                <div className="text-gray-600 text-sm">Anônimo para o RH</div>
             </div>
          </div>
       </div>

       <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900">Como funciona para o RH?</h2>
       </div>

       <div className="grid md:grid-cols-3 gap-8">
          <div className="border border-gray-200 p-8 rounded-3xl hover:shadow-lg transition">
             <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 font-bold text-xl">1</div>
             <h3 className="font-bold text-lg mb-2">Implementação Rápida</h3>
             <p className="text-gray-600">Sem integração complexa de TI. Apenas um link de acesso exclusivo para sua empresa.</p>
          </div>
          <div className="border border-gray-200 p-8 rounded-3xl hover:shadow-lg transition">
             <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 font-bold text-xl">2</div>
             <h3 className="font-bold text-lg mb-2">Dashboard Agregado</h3>
             <p className="text-gray-600">Receba relatórios de tendências de bem-estar (estresse, sono) sem identificar indivíduos.</p>
          </div>
          <div className="border border-gray-200 p-8 rounded-3xl hover:shadow-lg transition">
             <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 font-bold text-xl">3</div>
             <h3 className="font-bold text-lg mb-2">Suporte Contínuo</h3>
             <p className="text-gray-600">Webinars mensais e materiais educativos para promover saúde mental na cultura.</p>
          </div>
       </div>
    </div>
    <Footer onNavigate={onNavigate} />
  </div>
);

// PÁGINA: AJUDA PROFISSIONAL
export const ProfessionalHelpPage: React.FC<PageProps> = ({ onStart, onNavigate }) => (
  <div className="flex flex-col min-h-screen bg-white">
    <Navbar onNavigate={onNavigate} onStart={onStart} activeView={AppView.PROFESSIONAL_HELP} />
    <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto w-full">
       <div className="text-center mb-12">
          <AlertTriangle className="mx-auto text-yellow-500 mb-4" size={48} />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Entenda os Limites</h1>
          <p className="text-lg text-gray-600">O Caramelo é uma ferramenta poderosa, mas não substitui o cuidado humano especializado.</p>
       </div>

       <div className="bg-gray-50 rounded-3xl p-8 md:p-12 mb-12">
          <h3 className="text-2xl font-bold mb-8 text-center">Comparativo de Suporte</h3>
          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="border-b border-gray-200">
                      <th className="py-4 px-4 text-gray-500 font-medium">Recurso</th>
                      <th className="py-4 px-4 text-caramel-600 font-bold text-lg">Caramelo AI</th>
                      <th className="py-4 px-4 text-gray-800 font-bold text-lg">Psicólogo Humano</th>
                   </tr>
                </thead>
                <tbody>
                   <tr className="border-b border-gray-100">
                      <td className="py-4 px-4 font-medium text-gray-700">Disponibilidade</td>
                      <td className="py-4 px-4 text-caramel-600">24 horas / 7 dias</td>
                      <td className="py-4 px-4 text-gray-600">Agendado (Sessões)</td>
                   </tr>
                   <tr className="border-b border-gray-100">
                      <td className="py-4 px-4 font-medium text-gray-700">Custo</td>
                      <td className="py-4 px-4 text-caramel-600">Acessível / Gratuito</td>
                      <td className="py-4 px-4 text-gray-600">Investimento Médio/Alto</td>
                   </tr>
                   <tr className="border-b border-gray-100">
                      <td className="py-4 px-4 font-medium text-gray-700">Diagnóstico Clínico</td>
                      <td className="py-4 px-4 text-red-500 font-bold">Não realiza</td>
                      <td className="py-4 px-4 text-green-600 font-bold">Realiza</td>
                   </tr>
                   <tr className="border-b border-gray-100">
                      <td className="py-4 px-4 font-medium text-gray-700">Tratamento de Traumas</td>
                      <td className="py-4 px-4 text-gray-500">Apoio superficial</td>
                      <td className="py-4 px-4 text-green-600 font-bold">Tratamento Profundo</td>
                   </tr>
                   <tr>
                      <td className="py-4 px-4 font-medium text-gray-700">Prescrição Médica</td>
                      <td className="py-4 px-4 text-red-500">Nunca</td>
                      <td className="py-4 px-4 text-gray-600">Apenas Psiquiatras</td>
                   </tr>
                </tbody>
             </table>
          </div>
       </div>
       
       <div className="bg-red-50 border border-red-100 p-8 rounded-2xl text-center">
          <h3 className="text-xl font-bold text-red-700 mb-2">Em caso de emergência</h3>
          <p className="text-red-600 mb-4">Se você ou alguém que você conhece estiver em perigo imediato, não use o aplicativo.</p>
          <div className="flex flex-col md:flex-row justify-center gap-4">
             <a href="tel:188" className="bg-red-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-700 transition">Ligar 188 (CVV)</a>
             <a href="tel:192" className="bg-white border border-red-200 text-red-600 font-bold py-3 px-6 rounded-lg hover:bg-red-50 transition">Ligar 192 (SAMU)</a>
          </div>
       </div>
    </div>
    <Footer onNavigate={onNavigate} />
  </div>
);

// PÁGINA: SOBRE NÓS
export const AboutUsPage: React.FC<PageProps> = ({ onStart, onNavigate }) => (
  <div className="flex flex-col min-h-screen bg-white">
    <Navbar onNavigate={onNavigate} onStart={onStart} activeView={AppView.ABOUT_US} />
    <div className="pt-32 pb-20 px-6 max-w-5xl mx-auto w-full text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-8">Nossa Missão</h1>
        <p className="text-2xl text-gray-600 leading-relaxed mb-16">
          "Democratizar o acesso ao bem-estar emocional, garantindo que ninguém precise enfrentar seus momentos difíceis sozinho."
        </p>

        <div className="grid md:grid-cols-2 gap-12 text-left items-center mb-20">
           <div>
              <img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1000&auto=format&fit=crop" alt="Equipe" className="rounded-3xl shadow-xl w-full"/>
           </div>
           <div>
              <h3 className="text-2xl font-bold mb-4">Por que "Caramelo"?</h3>
              <p className="text-gray-600 mb-4">
                 No Brasil, o vira-lata caramelo é símbolo de resiliência, onipresença e, acima de tudo, amizade incondicional. Ele está em toda esquina, pronto para acompanhar quem precisa.
              </p>
              <p className="text-gray-600">
                 Nossa IA foi batizada assim para representar esse companheiro fiel, que não julga sua aparência, seu dinheiro ou seu passado. Ele apenas está ali, presente, quando você precisa conversar.
              </p>
           </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
           <div className="p-4">
              <div className="text-4xl font-bold text-caramel-600 mb-2">2024</div>
              <div className="text-sm text-gray-500">Ano de Fundação</div>
           </div>
           <div className="p-4">
              <div className="text-4xl font-bold text-caramel-600 mb-2">SP</div>
              <div className="text-sm text-gray-500">Sede em São Paulo</div>
           </div>
           <div className="p-4">
              <div className="text-4xl font-bold text-caramel-600 mb-2">AI</div>
              <div className="text-sm text-gray-500">Tecnologia Gemini</div>
           </div>
           <div className="p-4">
              <div className="text-4xl font-bold text-caramel-600 mb-2">♥</div>
              <div className="text-sm text-gray-500">Feito com Amor</div>
           </div>
        </div>
    </div>
    <Footer onNavigate={onNavigate} />
  </div>
);