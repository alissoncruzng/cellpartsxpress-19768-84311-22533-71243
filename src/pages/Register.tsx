import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/hooks/useUser';
import { EmailSignUp } from '@/components/auth/EmailSignUp';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import acrLogo from '@/assets/acr-logo-new.jpeg';

const Register = () => {
  const navigate = useNavigate();
  const { session } = useUser();

  useEffect(() => {
    if (session) {
      navigate('/complete-registration', { replace: true });
    }
  }, [navigate, session]);

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

      {/* Conteúdo Principal */}
      <main className="flex-1">
        <div className="container relative flex h-[calc(100vh-4rem)] flex-col items-center justify-center">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
            <EmailSignUp />
            
            <p className="px-4 text-center text-sm text-muted-foreground">
              Já tem uma conta?{' '}
              <button
                onClick={() => navigate('/login')}
                className="underline underline-offset-4 hover:text-primary"
              >
                Faça login
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;
