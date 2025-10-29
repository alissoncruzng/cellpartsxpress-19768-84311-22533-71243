import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import InitialSignUpForm from '@/components/InitialSignUpForm';
import WholesaleRegistration from '../../WholesaleRegistration';

interface Profile {
  id: string;
  status?: 'pending_registration' | 'pending_approval' | 'active' | 'rejected' | 'suspended';
  [key: string]: any;
}

export default function WholesaleRegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'initial' | 'complete_profile'>('initial');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Verifica se o usuário já está autenticado e redireciona se necessário
  useEffect(() => {
    const checkAuth = async () => {
      try {
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
          
          const profileStatus = (profile as Profile)?.status || 'pending_registration';
          
          if (profileStatus === 'active') {
            navigate('/wholesale/dashboard');
          } else if (profileStatus === 'pending_approval') {
            toast.info('Seu cadastro está aguardando aprovação. Você receberá um email quando for aprovado.');
            await supabase.auth.signOut();
            navigate('/login');
          } else if (profileStatus === 'pending_registration') {
            setStep('complete_profile');
          }
        }
      } catch (error: any) {
        console.error('Erro ao verificar autenticação:', error);
        toast.error('Erro ao verificar status do usuário');
      }
    };

    checkAuth();
  }, [navigate]);

  const handleInitialSignUpSuccess = (userEmail: string, userPassword: string) => {
    setEmail(userEmail);
    setPassword(userPassword);
    setStep('complete_profile');
  };

  const handleCompleteProfile = async () => {
    try {
      // Atualiza o status do perfil para aguardando aprovação
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) throw authError;
      
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({ 
            status: 'pending_approval',
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (error) throw error;

        // Desloga o usuário
        await supabase.auth.signOut();
        
        toast.success('Cadastro finalizado com sucesso! Aguarde a aprovação do administrador.');
        navigate('/login');
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
          role="wholesale" 
          onSuccess={handleInitialSignUpSuccess} 
        />
      </div>
    );
  }

  return (
    <WholesaleRegistration 
      onComplete={handleCompleteProfile}
    />
  );
}
