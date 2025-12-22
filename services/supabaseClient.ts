import { createClient } from '@supabase/supabase-js';

// Verificação de segurança para evitar crash se as variáveis não estiverem definidas ou forem inválidas.
// O createClient lança erro se a URL não for um HTTP/HTTPS válido.
const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isValidUrl = (url: string | undefined): boolean => {
  return !!url && (url.startsWith('http://') || url.startsWith('https://'));
};

const SUPABASE_URL = isValidUrl(envUrl) ? envUrl! : 'https://projeto-exemplo.supabase.co';
const SUPABASE_ANON_KEY = envKey || 'chave-anonima-exemplo';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);