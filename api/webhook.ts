import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/genai';

// Configuração do Supabase (usando chaves do ambiente da Vercel)
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Configuração do Gemini
const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export default async function handler(req: any, res: any) {
  // 1. Verificação de Segurança (Para garantir que é POST)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 2. Receber os dados (simulando estrutura do WhatsApp/Twilio)
    // Adapte 'Body' e 'From' conforme o serviço que você usar (Twilio, Meta, etc)
    const { Body, From } = req.body; 

    if (!Body || !From) {
      return res.status(400).json({ error: 'Mensagem ou Remetente faltando' });
    }

    // 3. Identificar o Usuário no Supabase pelo Telefone
    // (O formato do telefone deve ser igual ao salvo no cadastro)
    const { data: userProfile, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('phone', From) // Assume que o 'From' vem limpo ou formatado igual ao banco
      .single();

    if (userError || !userProfile) {
      // Se não achar, pode mandar uma mensagem pedindo cadastro no site
      return res.status(200).json({ 
        reply: "Olá! Sou o Caramelo. Não encontrei seu cadastro. Por favor, crie sua conta no nosso site para conversarmos!" 
      });
    }

    // 4. Salvar Mensagem do Usuário no Histórico
    await supabase.from('chat_history').insert({
      user_id: userProfile.id,
      role: 'user',
      text: Body
    });

    // 5. Gerar Resposta com Gemini
    // (Aqui você pode injetar o prompt do sistema igual fez no Front)
    const chat = model.startChat({
        history: [
            { role: "user", parts: [{ text: "Aja como o Caramelo, assistente de saúde mental." }] }
        ]
    });
    const result = await chat.sendMessage(Body);
    const responseText = result.response.text();

    // 6. Salvar Resposta da IA no Histórico
    await supabase.from('chat_history').insert({
      user_id: userProfile.id,
      role: 'model',
      text: responseText
    });

    // 7. Devolver a resposta para o WhatsApp
    return res.status(200).json({ reply: responseText });

  } catch (error: any) {
    console.error("Erro no Webhook:", error);
    return res.status(500).json({ error: 'Erro interno no servidor do Caramelo.' });
  }
}
