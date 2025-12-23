import { createClient } from '@supabase/supabase-js';

/**
 * No Netlify e em muitos bundlers modernos, o acesso a variáveis de ambiente 
 * deve ser estático (process.env.NOME_DA_VAR) para que o sistema consiga 
 * substituir o valor durante a compilação/deploy.
 */

// Busca URL
const supabaseUrl = 
  process.env.NEXT_PUBLIC_SUPABASE_URL || 
  process.env.SUPABASE_URL || 
  (import.meta as any).env?.VITE_SUPABASE_URL;

// Busca Chave Anon
const supabaseKey = 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  process.env.SUPABASE_ANON_KEY || 
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

const isConfigured = (val?: string) => val && val !== 'undefined' && val !== '';

/**
 * Objeto de fallback silencioso para evitar que o App quebre se as chaves falharem.
 */
const fallbackClient = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: () => Promise.reject(new Error("Supabase não configurado.")),
    signUp: () => Promise.reject(new Error("Supabase não configurado.")),
    signOut: () => Promise.resolve({ error: null }),
  },
  from: () => ({
    select: () => ({ 
      eq: () => ({ 
        single: () => Promise.resolve({ data: null, error: null }), 
        maybeSingle: () => Promise.resolve({ data: null, error: null }),
        order: () => ({ 
          limit: () => Promise.resolve({ data: [], error: null }) 
        }) 
      }) 
    }),
    upsert: () => Promise.resolve({ error: null }),
    insert: () => Promise.resolve({ error: null }),
  })
} as any;

if (!isConfigured(supabaseUrl) || !isConfigured(supabaseKey)) {
  console.warn("⚠️ [Caramelo] Supabase: URL ou Chave não detectadas. Verifique se você realizou um NOVO DEPLOY no Netlify após salvar as variáveis de ambiente.");
} else {
  console.log("✅ [Caramelo] Supabase: Conectado com sucesso.");
}

// Exporta o cliente real se configurado, ou o fallback seguro
export const supabase = (isConfigured(supabaseUrl) && isConfigured(supabaseKey))
  ? createClient(supabaseUrl!, supabaseKey!)
  : fallbackClient;
