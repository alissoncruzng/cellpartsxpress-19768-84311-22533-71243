import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Mail, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Verificar o token de verificação de e-mail
  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      const type = searchParams.get('type');
      const next = searchParams.get('next') || '/login';

      // Se não houver token, apenas mostre a mensagem de verificação
      if (!token || type !== 'signup') {
        setLoading(false);
        return;
      }

      try {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'signup',
        });

        if (error) throw error;

        // O Supabase já atualiza automaticamente o email_confirmed_at na tabela auth.users
        // Não é necessário fazer atualizações adicionais no perfil
        // pois o status de verificação é gerenciado pelo próprio Supabase Auth

        setIsVerified(true);
        toast.success('E-mail verificado com sucesso!');
        
        // Redirecionar após 3 segundos
        setTimeout(() => {
          navigate(next);
        }, 3000);
      } catch (err) {
        const error = err as Error;
        console.error('Erro ao verificar e-mail:', error);
        setError(error.message || 'Erro ao verificar e-mail');
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  const handleResendVerification = async () => {
    const email = searchParams.get('email');
    if (!email) {
      setError('Nenhum e-mail encontrado para reenvio');
      return;
    }

    setIsResending(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`,
        },
      });

      if (error) throw error;

      toast.success('E-mail de verificação reenviado com sucesso!');
    } catch (err) {
      const error = err as Error;
      console.error('Erro ao reenviar e-mail de verificação:', error);
      setError(error.message || 'Erro ao reenviar e-mail de verificação');
    } finally {
      setIsResending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <Card className="w-full max-w-md text-center p-8">
          <RefreshCw className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
          <h2 className="text-xl font-semibold mb-2">Verificando seu e-mail...</h2>
          <p className="text-muted-foreground">Aguarde enquanto confirmamos sua conta.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            {isVerified ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : (
              <Mail className="h-6 w-6 text-blue-600" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            {isVerified ? 'E-mail Verificado!' : 'Verifique seu E-mail'}
          </CardTitle>
          <CardDescription className="text-center">
            {isVerified
              ? 'Seu endereço de e-mail foi verificado com sucesso!'
              : 'Enviamos um link de verificação para o seu e-mail. Por favor, verifique sua caixa de entrada.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!isVerified && (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Não recebeu o e-mail? Verifique sua pasta de spam ou clique no botão abaixo para reenviar.
              </p>
              <Button 
                variant="outline" 
                onClick={handleResendVerification}
                disabled={isResending}
                className="w-full"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Reenviar E-mail de Verificação'
                )}
              </Button>
            </div>
          )}

          {isVerified && (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Você será redirecionado automaticamente em instantes.
              </p>
              <Button 
                onClick={() => navigate('/login')}
                className="w-full"
              >
                Ir para o Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
