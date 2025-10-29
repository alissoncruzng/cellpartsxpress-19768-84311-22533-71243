import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import InitialSignUpForm from '@/components/InitialSignUpForm';
import ClientRegistration from '../../ClientRegistration';
import { Profile } from '@/types/supabase';

export default function ClientRegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'initial' | 'complete_profile'>('initial');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Verifica se o usuário já está autenticado e redireciona se necessário
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Força a atualização da sessão
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) throw userError;
        
        if (user) {
          // Verifica se o perfil já está completo
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profileError) throw profileError;
          
          // Usa is_approved para verificar o status do perfil
          const isApproved = (profile as any)?.is_approved;
          const isBlocked = (profile as any)?.is_blocked;
          
          if (isBlocked) {
            toast.error('Sua conta foi bloqueada. Entre em contato com o suporte.');
            await supabase.auth.signOut();
            navigate('/login');
          } else if (isApproved) {
            navigate('/catalog');
          } else {
            // Se não estiver aprovado, mostra o formulário de cadastro completo
            setStep('complete_profile');
          }
        } else {
          // Se não estiver autenticado, redireciona para a etapa inicial
          setStep('initial');
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        // Em caso de erro, mantém na página de registro
        setStep('initial');
      }
    };

    checkAuth();
    
    // Configura um listener para mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Se o usuário acabou de fazer login, verifica o status do perfil
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profile && !(profile as any)?.is_approved) {
            setStep('complete_profile');
          }
        }
      }
    );
    
    return () => {
      subscription?.unsubscribe();
    };
  }, [navigate]);

  const handleInitialSignUpSuccess = async (userEmail: string, userPassword: string) => {
    try {
      setEmail(userEmail);
      setPassword(userPassword);
      
      // Aguarda um pouco para garantir que a sessão foi atualizada
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verifica se o usuário está autenticado
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      
      if (user) {
        // Atualiza o perfil com informações iniciais
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            is_approved: false,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
          
        if (updateError) throw updateError;
        
        setStep('complete_profile');
      } else {
        throw new Error('Falha ao autenticar após o cadastro');
      }
    } catch (error: any) {
      console.error('Erro após cadastro inicial:', error);
      toast.error(error.message || 'Erro ao processar cadastro');
    }
  };

  const handleCompleteProfile = async () => {
    try {
      // Atualiza o status do perfil para aguardando aprovação
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({ 
            is_approved: false, // Aguardando aprovação do admin
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (error) throw error;

        // Desloga o usuário
        await supabase.auth.signOut();
        
        toast.success('Cadastro finalizado com sucesso! Aguarde a aprovação do administrador.');
        navigate('/login');
      } else {
        throw new Error('Usuário não autenticado');
      }
    } catch (error: any) {
      console.error('Erro ao finalizar cadastro:', error);
      toast.error(error.message || 'Erro ao finalizar cadastro');
    }
  };

  if (step === 'initial') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <InitialSignUpForm 
          role="client" 
          onSuccess={handleInitialSignUpSuccess} 
        />
      </div>
    );
  }

  return (
    <ClientRegistration 
      onComplete={handleCompleteProfile}
    />
  );
}
