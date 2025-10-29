import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface InitialSignUpFormProps {
  role: "client" | "wholesale" | "driver";
  onSuccess: (email: string, password: string) => void;
}

export default function InitialSignUpForm({ role, onSuccess }: InitialSignUpFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      toast.error("Preencha todos os campos");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (password.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      // Cria o usuário no Supabase Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            role,
            full_name: "",
            status: 'pending_registration'
          }
        }
      });

      if (signUpError) throw signUpError;
      
      if (signUpData.user?.identities?.length === 0) {
        // Se o usuário já existe, mas o e-mail não foi confirmado
        toast.info('Já existe uma conta com este e-mail. Por favor, verifique sua caixa de entrada para confirmar seu e-mail.');
        return;
      }
      
      // Se o e-mail foi enviado para confirmação
      if (signUpData.user && !signUpData.user.identities) {
        toast.success('Cadastro realizado com sucesso! Por favor, verifique seu e-mail para confirmar sua conta.');
        // Não tenta fazer login, aguarda confirmação do e-mail
        navigate('/login');
        return;
      }
      
      // Se o e-mail já está confirmado (raro, mas possível)
      if (signUpData.user?.email_confirmed_at) {
        // Faz login automaticamente
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (signInError) throw signInError;
        
        onSuccess(email, password);
        toast.success("Conta criada com sucesso! Preencha seus dados para continuar.");
      }
    } catch (error: any) {
      console.error("Erro ao criar conta:", error);
      toast.error(error.message || "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Criar Conta</h2>
        <p className="text-muted-foreground mt-2">
          {role === 'client' && 'Preencha seus dados para se cadastrar como cliente'}
          {role === 'wholesale' && 'Preencha seus dados para se cadastrar como lojista'}
          {role === 'driver' && 'Preencha seus dados para se cadastrar como entregador'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10"
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar Senha</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirme sua senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10"
              disabled={loading}
            />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Criando conta...
            </>
          ) : (
            'Próximo'
          )}
        </Button>
      </form>

      <div className="text-center text-sm">
        <p className="text-muted-foreground">
          Já tem uma conta?{" "}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-primary hover:underline"
          >
            Faça login
          </button>
        </p>
      </div>
    </div>
  );
}
