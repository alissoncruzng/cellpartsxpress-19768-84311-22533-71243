import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '@/lib/supabase';
import { toast } from 'sonner';

type User = {
  id: string;
  email?: string;
  role?: 'client' | 'wholesale' | 'driver' | 'admin';
  is_approved?: boolean;
  is_blocked?: boolean;
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();

  // Efeito para verificar a sessão ao carregar
  useEffect(() => {
    const checkSession = async () => {
      try {
        setLoading(true);
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Erro ao verificar sessão:', err);
        setError(err instanceof Error ? err : new Error('Erro ao verificar sessão'));
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Configura o listener de mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await fetchUserProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Busca o perfil do usuário
  const fetchUserProfile = async (userId: string): Promise<User> => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      if (!profile) {
        throw new Error('Perfil não encontrado');
      }

      // Fazendo type assertion para o perfil retornado
      const profileData = profile as unknown as {
        id: string;
        email?: string;
        role: 'client' | 'wholesale' | 'driver' | 'admin';
        is_approved: boolean;
        is_blocked: boolean;
      };

      const userData: User = {
        id: profileData.id,
        email: profileData.email,
        role: profileData.role,
        is_approved: profileData.is_approved,
        is_blocked: profileData.is_blocked,
      };

      setUser(userData);
      return userData;
    } catch (err) {
      console.error('Erro ao buscar perfil do usuário:', err);
      throw err;
    }
  };

  // Função de login
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Verifica se o email está verificado primeiro
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        // Trata erros específicos do Supabase
        if (authError.message.includes('Email not confirmed')) {
          throw new Error('Por favor, verifique seu email para confirmar sua conta antes de fazer login.');
        }
        if (authError.message.includes('Invalid login credentials')) {
          throw new Error('Email ou senha incorretos. Verifique suas credenciais.');
        }
        throw authError;
      }
      
      if (!authData.user) {
        throw new Error('Erro ao autenticar. Tente novamente.');
      }

      // Verifica se o email foi verificado
      if (!authData.user.email_confirmed_at) {
        // Se não estiver verificado, força o logout e pede para verificar o email
        await signOut();
        throw new Error('Por favor, verifique seu email para confirmar sua conta antes de fazer login.');
      }

      // Busca o perfil do usuário
      const profile = await fetchUserProfile(authData.user.id);
      
      if (profile?.is_blocked) {
        await signOut();
        throw new Error('Sua conta foi bloqueada. Entre em contato com o suporte.');
      }

      if (!profile?.is_approved) {
        await signOut();
        throw new Error('Sua conta ainda não foi aprovada. Aguarde a aprovação do administrador.');
      }

      return { user: authData.user };
    } catch (err) {
      console.error('Erro ao fazer login:', err);
      if (err instanceof Error) {
        throw err;
      }
      throw new Error('Ocorreu um erro ao tentar fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Função de cadastro
  const signUp = async (email: string, password: string, userData: any) => {
    try {
      setLoading(true);
      
      // Validação básica dos dados do usuário
      if (!email || !password) {
        throw new Error('Email e senha são obrigatórios');
      }

      // 1. Cria o usuário no Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            ...userData,
            status: 'pending_approval',
            created_at: new Date().toISOString(),
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          throw new Error('Este email já está cadastrado. Tente fazer login ou recuperar sua senha.');
        }
        throw error;
      }

      if (error) throw error;
      
      // 2. Se o usuário já existe mas o e-mail não foi confirmado
      if (data.user?.identities?.length === 0) {
        // Envia novamente o e-mail de confirmação
        const { error: resendError } = await supabase.auth.resend({
          type: 'signup',
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (resendError) throw resendError;
        
        throw new Error('Já existe uma conta com este e-mail. Um novo e-mail de confirmação foi enviado.');
      }

      return { user: data.user };
    } catch (err) {
      console.error('Erro ao cadastrar usuário:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Função de logout
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      navigate('/login');
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Função para redefinir senha
  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      return true;
    } catch (err) {
      console.error('Erro ao enviar e-mail de redefinição de senha:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };
}
