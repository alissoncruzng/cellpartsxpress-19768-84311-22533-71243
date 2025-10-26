import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'client' | 'driver' | 'wholesale';

export interface UserProfile {

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
  const isAdmin = user?.role === 'admin';
  const navigate = useNavigate();

  // Função para mapear os dados do perfil
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

  // Função para buscar o perfil do usuário
  const fetchUserProfile = useCallback(async (user: User) => {
    if (!user) return null;
    
    setLoading(true);
    try {
      // Tenta buscar o perfil com tratamento de erro específico para 406
      let profile = null;
      let error = null;
      
      try {
        const result = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        profile = result.data;
        error = result.error;
      } catch (err) {
        console.warn('Erro ao buscar perfil, tentando criar um novo...', err);
      }

      // Se não encontrou o perfil, tenta criar um novo
      if (error || !profile) {
        console.log('Criando novo perfil para o usuário:', user.id);
        const newProfile = {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || '',
          role: user.user_metadata?.user_type || 'client',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_approved: false,
          is_blocked: false
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();

        if (createError) {
          console.error('Erro ao criar perfil:', createError);
          throw createError;
        }
        
        return mapProfileToUserProfile(user, createdProfile);
      }
      
      return mapProfileToUserProfile(user, profile);
    } catch (error) {
      console.error('Erro ao buscar/criar perfil:', error);
      setError(error as Error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [mapProfileToUserProfile]);

  // Função para atualizar o perfil do usuário
  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user) return false;
    
    setLoading(true);
    try {
      // Remover campos undefined para evitar erros no Supabase
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, v]) => v !== undefined)
      );

      const { data, error } = await supabase
        .from('profiles')
        .update(cleanUpdates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Atualiza o estado local do usuário
      setUser(prev => ({
        ...prev!,
        ...cleanUpdates,
        // Manter campos personalizados que não estão na tabela profiles
        document: 'document' in updates ? updates.document : prev?.document,
        document_type: 'document_type' in updates ? updates.document_type : prev?.document_type,
        date_of_birth: 'date_of_birth' in updates ? updates.date_of_birth : prev?.date_of_birth,
        complement: 'complement' in updates ? updates.complement : prev?.complement,
        neighborhood: 'neighborhood' in updates ? updates.neighborhood : prev?.neighborhood,
        address_number: 'address_number' in updates ? updates.address_number : prev?.address_number
      }));

      return data;
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      setError(err instanceof Error ? err : new Error('Erro ao atualizar perfil'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Função para fazer logout
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setSession(null);
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      setError(error as Error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Efeito para gerenciar mudanças de sessão
  useEffect(() => {
    let isMounted = true;
    let subscription: { unsubscribe: () => void } | null = null;

    // Função para carregar a sessão e o perfil do usuário
    const loadSessionAndProfile = async () => {
      try {
        console.log('Iniciando verificação de sessão...');
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Erro ao obter sessão:', sessionError);
          throw sessionError;
        }
        
        if (isMounted) {
          if (currentSession) {
            console.log('Sessão encontrada, carregando perfil...');
            try {
              const userProfile = await fetchUserProfile(currentSession.user);
              if (isMounted) {
                setSession(currentSession);
                setUser(userProfile);
              }
            } catch (profileError) {
              console.error('Erro ao carregar perfil, fazendo logout...', profileError);
              // Se não conseguir carregar o perfil, faz logout para evitar loops
              await supabase.auth.signOut();
              if (isMounted) {
                setSession(null);
                setUser(null);
              }
            }
          } else {
            console.log('Nenhuma sessão ativa encontrada');
            setSession(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar sessão:', error);
        if (isMounted) {
          setError(error as Error);
          setSession(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Configura o listener de mudança de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        console.log('Evento de autenticação:', event);
        
        if (event === 'SIGNED_IN' && session) {
          try {
            const userProfile = await fetchUserProfile(session.user);
            if (isMounted) {
              setSession(session);
              setUser(userProfile);
            }
          } catch (error) {
            console.error('Erro ao carregar perfil:', error);
            if (isMounted) {
              setError(error as Error);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          if (isMounted) {
            setSession(null);
            setUser(null);
          }
        }
      }
    );
    
    subscription = authListener.subscription;
    
    // Carrega a sessão inicial
    loadSessionAndProfile();

    // Limpeza
    return () => {
      isMounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [fetchUserProfile]);

  return {
    session,
    user,
    loading,
    error,
    refreshUser: async () => {
      try {
        setLoading(true);
        const { data: { session: newSession } } = await supabase.auth.getSession();
        if (newSession) {
          await fetchUserProfile(newSession.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Error refreshing user:', err);
        setError(err instanceof Error ? err : new Error('Failed to refresh user'));
      } finally {
        setLoading(false);
      }
    },
    signOut,
    updateProfile,
    isAdmin,
  };
}
