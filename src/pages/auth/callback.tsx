import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

type UserRole = 'client' | 'wholesale' | 'driver' | 'admin';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (session) {
          // Se já tem sessão, redireciona para a página apropriada baseada no role
          const { data: profile } = await supabase
            .from('profiles')
            .select('role, is_approved, is_blocked')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            // Atualiza o status do perfil se necessário
            if (!profile.is_approved && !profile.is_blocked) {
              await supabase
                .from('profiles')
                .update({ is_approved: false })
                .eq('id', session.user.id);
            }

            // Redireciona baseado no papel do usuário
            const role = profile.role as UserRole;
            switch (role) {
              case 'admin':
                navigate('/admin/dashboard');
                break;
              case 'wholesale':
                navigate('/wholesale/dashboard');
                break;
              case 'driver':
                navigate('/driver/dashboard');
                break;
              case 'client':
              default:
                navigate('/catalog');
            }
            return;
          }
        }

        // Se não tem sessão ou perfil, redireciona para login
        navigate('/login');
      } catch (error: any) {
        console.error('Erro ao processar callback de autenticação:', error);
        setError(error.message || 'Erro ao processar autenticação');
        toast.error('Erro ao confirmar seu e-mail. Tente novamente mais tarde.');
        setTimeout(() => navigate('/login'), 3000);
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium">Confirmando seu e-mail...</p>
          <p className="text-muted-foreground text-center">
            Por favor, aguarde enquanto confirmamos sua conta.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center space-y-4 max-w-md text-center">
          <div className="bg-destructive/10 p-3 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-destructive"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold">Erro ao confirmar e-mail</h2>
          <p className="text-muted-foreground">
            {error}
          </p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Voltar para o login
          </button>
        </div>
      </div>
    );
  }

  return null;
}
