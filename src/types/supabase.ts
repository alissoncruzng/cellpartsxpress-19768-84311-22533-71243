import { Database } from './supabase-db';

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];

type ProfileBase = Tables<'profiles'>;

export interface Profile extends ProfileBase {
  status?: 'pending_registration' | 'pending_approval' | 'active' | 'rejected' | 'suspended';
}

export type UserRole = Database['public']['Tables']['profiles']['Row']['role'];
