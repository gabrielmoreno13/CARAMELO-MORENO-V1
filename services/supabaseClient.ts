import { createClient } from '@supabase/supabase-js';

// No Vite, usamos import.meta.env em vez de process.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ ATENÇÃO: Variáveis do Supabase não encontradas. O login não funcionará.');
}

// Cria a conexão oficial
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);
