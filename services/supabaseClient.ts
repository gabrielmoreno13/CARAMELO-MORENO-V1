import { createClient } from '@supabase/supabase-js';

// No Vite, é OBRIGATÓRIO usar import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ERRO: Chaves do Supabase não encontradas. O site pode travar.');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);
