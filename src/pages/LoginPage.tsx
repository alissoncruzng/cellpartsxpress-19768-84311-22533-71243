import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhoneAuth } from '@/components/auth/PhoneAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import acrLogo from '@/assets/acr-logo-new.jpeg';

export function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Verificar se o usuário já está autenticado
  useEffect(() => {
    const checkUser = async () => {
      try {
        setLoading(true);
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (session) {
          navigate('/admin');
          return;
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      {/* Cabeçalho */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center space-x-2">
            <img src={acrLogo} alt="ACR Logo" className="h-10 w-auto" />
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o início
          </Button>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="flex-1">
        <div className="container relative flex h-[calc(100vh-4rem)] flex-col items-center justify-center">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Acesse sua conta
              </h1>
              <p className="text-sm text-muted-foreground">
                Digite seu número de telefone para continuar
              </p>
            </div>
            
            <p className="text-center text-sm text-muted-foreground">
              Não tem uma conta?{' '}
              <a 
                href="/register" 
                className="font-medium text-primary hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/register');
                }}
              >
                Cadastre-se
              </a>
            </p>
            
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <PhoneAuth />
              
              <p className="mt-4 px-4 text-center text-sm text-muted-foreground">
                Ao continuar, você concorda com nossos{' '}
                <a href="/terms" className="underline underline-offset-4 hover:text-primary">
                  Termos de Serviço
                </a>{' '}
                e{' '}
                <a href="/privacy" className="underline underline-offset-4 hover:text-primary">
                  Política de Privacidade
                </a>
                .
              </p>
            </div>
            
            <p className="px-4 text-center text-sm text-muted-foreground">
              <a
                href="/support"
                className="hover:text-brand underline underline-offset-4 hover:text-primary"
              >
                Precisa de ajuda? Fale com nosso suporte
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default LoginPage;
