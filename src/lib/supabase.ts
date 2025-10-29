import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas corretamente', {
    VITE_SUPABASE_URL: supabaseUrl ? '✅' : '❌ Não definido',
    VITE_SUPABASE_PUBLISHABLE_KEY: supabaseAnonKey ? '✅' : '❌ Não definido'
  });

  // Em desenvolvimento, lança erro. Em produção, cria cliente dummy
  if (import.meta.env.DEV) {
    throw new Error('Variáveis de ambiente do Supabase não configuradas. Verifique o arquivo .env');
  }
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storageKey: 'cellpartsxpress-session',
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
    })
  : null;
