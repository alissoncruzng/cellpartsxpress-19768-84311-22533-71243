import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'admin' | 'client' | 'deliveryman';

interface UserProfile {
  id: string;
  email?: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  is_approved: boolean | null;
  is_blocked: boolean | null;
  address: string | null;
  cep: string | null;
  city: string | null;
  cnh_image_url: string | null;
  cnh_number: string | null;
  created_at: string | null;
  role: UserRole;
  state: string | null;
  updated_at: string | null;
  vehicle_plate: string | null;
  vehicle_type: string | null;
  work_policy_accepted_at: string | null;
  privacy_policy_accepted_at: string | null;
  warranty_policy_accepted_at: string | null;
  rejection_count: number | null;
  document?: string;
  document_type?: string;
  date_of_birth?: string;
  complement?: string;
  neighborhood?: string;
  address_number?: string;
}

export function useUser() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();

  const mapProfileToUserProfile = useCallback((user: User, profileData: any): UserProfile => ({
    id: user.id,
    email: user.email || undefined,
    full_name: profileData?.full_name || '',
    phone: profileData?.phone || null,
    avatar_url: profileData?.avatar_url || null,
    is_approved: profileData?.is_approved ?? null,
    is_blocked: profileData?.is_blocked ?? null,
    address: profileData?.address || null,
    cep: profileData?.cep || null,
    city: profileData?.city || null,
    cnh_image_url: profileData?.cnh_image_url || null,
    cnh_number: profileData?.cnh_number || null,
    created_at: profileData?.created_at || null,
    role: (profileData?.role as UserRole) || 'client',
    state: profileData?.state || null,
    updated_at: profileData?.updated_at || null,
    vehicle_plate: profileData?.vehicle_plate || null,
    vehicle_type: profileData?.vehicle_type || null,
    work_policy_accepted_at: profileData?.work_policy_accepted_at || null,
    privacy_policy_accepted_at: profileData?.privacy_policy_accepted_at || null,
    warranty_policy_accepted_at: profileData?.warranty_policy_accepted_at || null,
    rejection_count: profileData?.rejection_count ?? null,
    document: profileData?.document,
    document_type: profileData?.document_type,
    date_of_birth: profileData?.date_of_birth,
    complement: profileData?.complement,
    neighborhood: profileData?.neighborhood,
    address_number: profileData?.address_number
  }), []);

  const fetchUserProfile = useCallback(async (user: User) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116' || error.code === 'PGRST200') {
          navigate('/complete-registration');
          return;
        }
        throw error;
      }

      const userProfile = mapProfileToUserProfile(user, profile);
      setUser(userProfile);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err : new Error('Error loading profile'));
    } finally {
      setLoading(false);
    }
  }, [mapProfileToUserProfile, navigate]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setUser(prev => ({ ...prev!, ...updates }));
      return data;
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err : new Error('Error updating profile'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      navigate('/login');
    } catch (err) {
      console.error('Error signing out:', err);
      setError(err instanceof Error ? err : new Error('Error signing out'));
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session?.user) {
          await fetchUserProfile(session.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [fetchUserProfile]);

  return {
    user,
    session,
    loading,
    error,
    signOut,
    updateProfile,
    refreshProfile: () => user && fetchUserProfile(user as User)
  };
}

export default useUser;
