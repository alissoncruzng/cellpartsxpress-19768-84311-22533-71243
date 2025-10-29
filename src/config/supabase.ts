import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase-db';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variáveis de ambiente do Supabase não configuradas corretamente');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: localStorage,
    flowType: 'pkce',
  },
});

// Tipos de armazenamento
export enum StorageBucket {
  AVATARS = 'avatars',
  PRODUCTS = 'products',
  BRANDS = 'brands',
  CATEGORIES = 'categories',
  DELIVERY_PROOFS = 'delivery-proofs',
}

export default supabase;
