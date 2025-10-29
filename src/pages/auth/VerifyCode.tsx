import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function VerifyCode() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState<'client' | 'wholesale' | 'driver'>('client');
  
  const location = useLocation();
  const navigate = useNavigate();

  // Carrega o email e tipo de usuário do estado da navegação
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
    if (location.state?.userType) {
      setUserType(location.state.userType);
    } else {
      // Se não tiver tipo de usuário, volta para o login
      navigate('/login');
    }
  }, [location, navigate]);

  // Contagem regressiva para reenvio de código
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleCodeChange = (index: number, value: string) => {
    if (value && !/^\d*$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Move para o próximo input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`) as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`) as HTMLInputElement;
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerifyCode = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      toast.error('Por favor, insira o código de 6 dígitos');
      return;
    }

    setLoading(true);
    try {
      // Verifica o código usando Supabase
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: fullCode,
        type: 'email'
      });

      if (error) {
        console.error('Erro na verificação:', error);
        throw error;
      }

      // Redireciona para completar o cadastro
      navigate('/complete-registration', {
        state: { userType }
      });
      
    } catch (error: any) {
      console.error('Erro ao verificar código:', error);
      toast.error('Código inválido ou expirado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;

    setLoading(true);
    try {
      // Reenvia o código usando Supabase
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          data: {
            user_type: userType
          }
        }
      });

      if (error) {
        console.error('Erro ao reenviar código:', error);
        throw error;
      }

      setCountdown(60);
      toast.success('Novo código enviado! Verifique seu e-mail.');
    } catch (error: any) {
      console.error('Erro ao reenviar código:', error);
      toast.error('Erro ao reenviar código. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Verificação de Email</CardTitle>
          <CardDescription>
            Enviamos um código de 6 dígitos para <span className="font-medium">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center space-x-2">
            {code.map((digit, index) => (
              <Input
                key={index}
                id={`code-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-xl"
                autoFocus={index === 0}
              />
            ))}
          </div>

          <Button 
            onClick={handleVerifyCode}
            disabled={loading || code.some(digit => !digit)}
            className="w-full"
          >
            {loading ? 'Verificando...' : 'Verificar Código'}
          </Button>

          <div className="text-center text-sm text-gray-500">
            Não recebeu o código?{' '}
            <button
              onClick={handleResendCode}
              disabled={countdown > 0}
              className={`font-medium ${
                countdown > 0 ? 'text-gray-400' : 'text-blue-600 hover:text-blue-500'
              }`}
            >
              {countdown > 0 ? `Reenviar em ${countdown}s` : 'Reenviar código'}
            </button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <button 
            onClick={() => navigate('/login')}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            Voltar para o login
          </button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default VerifyCode;
