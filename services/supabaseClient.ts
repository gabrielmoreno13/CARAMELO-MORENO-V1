
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const isConfigured = supabaseUrl && supabaseKey && supabaseUrl !== 'undefined';

export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseKey)
  : {
      auth: { 
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        signInWithPassword: () => Promise.reject("Configuração ausente"),
        signUp: () => Promise.reject("Configuração ausente"),
        signOut: () => Promise.resolve({}),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
      },
      from: () => ({ 
        select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: null }), single: () => Promise.resolve({ data: null }), order: () => ({ limit: () => Promise.resolve({ data: [] }) }) }) }),
        upsert: () => Promise.resolve({ error: null }),
        insert: () => Promise.resolve({ error: null })
      })
    } as any;
