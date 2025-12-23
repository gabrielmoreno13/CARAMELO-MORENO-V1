import { createClient } from '@supabase/supabase-js';

// 1. Tenta pegar as variáveis de ambiente (Configuradas no Netlify)
const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 2. Valores de Fallback (Segurança caso as variáveis falhem)
const FALLBACK_URL = 'https://ntpjniwetuwcdqhdnvrd.supabase.co';
// Nota: Recomenda-se atualizar esta chave no Netlify para a chave 'anon public' (começa com eyJ...)
const FALLBACK_KEY = 'sb_publishable_zSKapPdUKGmaix0N3RBppQ_qO7AxKoP'; 

// 3. Determina quais credenciais usar
const supabaseUrl = (envUrl && envUrl.startsWith('http')) ? envUrl : FALLBACK_URL;
const supabaseKey = envKey || FALLBACK_KEY;

// 4. Cria o cliente
export const supabase = createClient(supabaseUrl, supabaseKey);

// 5. Logs de Diagnóstico (Ajudam a saber se o Netlify está configurado certo)
if (envKey) {
  console.log('✅ CARAMELO: Conectado ao Supabase via Variáveis de Ambiente (Netlify).');
} else {
  console.warn('⚠️ CARAMELO: Variáveis de ambiente não detectadas. Usando modo de fallback (pode ter limitações).');
  console.log('ℹ️ Para corrigir: Adicione NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no Netlify.');
}