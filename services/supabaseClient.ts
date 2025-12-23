
import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string) => {
  return process.env[key] || (import.meta as any).env?.[`VITE_${key}`] || "";
};

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL') || getEnv('SUPABASE_URL');
const supabaseKey = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') || getEnv('SUPABASE_ANON_KEY');

const isConfigured = (val?: string) => val && val !== 'undefined' && val !== '';

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
        order: () => ({ limit: () => Promise.resolve({ data: [], error: null }) }) 
      }) 
    }),
    upsert: () => Promise.resolve({ error: null }),
    insert: () => Promise.resolve({ error: null }),
  })
} as any;

export const supabase = (isConfigured(supabaseUrl) && isConfigured(supabaseKey))
  ? createClient(supabaseUrl, supabaseKey)
  : fallbackClient;
