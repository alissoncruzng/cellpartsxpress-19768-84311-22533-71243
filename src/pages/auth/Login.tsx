import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

type UserType = 'client' | 'wholesale' | 'driver';

const Login = () => {
  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login-existing');
  };

  const handleSelectUserType = (type: UserType) => {
    setUserType(type);
  };

  const handleBack = () => {
    setUserType(null);
  };

  const handleSendCode = async () => {
    if (!email) {
      toast.error("Por favor, insira um e-mail válido");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Por favor, insira um e-mail válido");
      return;
    }

    setLoading(true);
    try {
      // Simula o envio do código (substituir por chamada real à API)
      const code = '123456'; // Código fixo para teste
      localStorage.setItem('verification_code', code);
      localStorage.setItem('verification_email', email);
      localStorage.setItem('verification_expires', (Date.now() + 15 * 60 * 1000).toString());
      localStorage.setItem('user_type', userType || 'client');

      navigate('/verify', { state: { email, userType } });
      toast.success(`Código de verificação enviado para ${email}. Use: ${code}`);
    } catch (error) {
      console.error('Erro ao enviar código:', error);
      toast.error('Erro ao enviar código. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Tela de seleção de tipo de usuário
  if (userType === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Bem-vindo</CardTitle>
            <CardDescription>
              Escolha o tipo de acesso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full justify-start p-6 h-auto"
              onClick={() => handleSelectUserType('client')}
            >
              <div className="text-left">
                <div className="font-medium">Cliente</div>
                <div className="text-sm text-muted-foreground">Compre produtos e serviços</div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start p-6 h-auto"
              onClick={() => handleSelectUserType('wholesale')}
            >
              <div className="text-left">
                <div className="font-medium">Lojista</div>
                <div className="text-sm text-muted-foreground">Venda seus produtos</div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start p-6 h-auto"
              onClick={() => handleSelectUserType('driver')}
            >
              <div className="text-left">
                <div className="font-medium">Motoboy</div>
                <div className="text-sm text-muted-foreground">Faça entregas</div>
              </div>
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button 
              variant="ghost" 
              onClick={handleLogin}
            >
              Já tenho uma conta
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }


  // Tela de cadastro com campo de e-mail
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute left-4 top-4"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="text-2xl font-bold text-center">
            {userType === 'client' && 'Cadastro de Cliente'}
            {userType === 'wholesale' && 'Cadastro de Lojista'}
            {userType === 'driver' && 'Cadastro de Motoboy'}
          </CardTitle>
          <CardDescription className="text-center">
            Insira seu e-mail para receber o código de verificação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              onKeyDown={(e) => e.key === 'Enter' && handleSendCode()}
            />
          </div>
          <Button 
            onClick={handleSendCode}
            disabled={loading || !email}
            className="w-full mt-4"
          >
            {loading ? 'Enviando...' : 'Enviar Código'}
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button
            variant="ghost"
            className="w-full"
            onClick={handleBack}
            disabled={loading}
          >
            Voltar
          </Button>
          <p className="text-sm text-gray-500 text-center">
            Ao continuar, você concorda com nossos Termos de Uso e Política de Privacidade
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default Login;
