import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import type { Subscription } from '@supabase/supabase-js';

export function EmailSignUp() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const navigate = useNavigate();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('Enviando código para:', email);
      
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/complete-registration`,
          shouldCreateUser: true,
          data: {
            full_name: '',
            phone: ''
          }
        }
      });

      console.log('Resposta do signInWithOtp:', { data, error });

      if (error) {
        console.error('Erro detalhado:', error);
        if (error.status === 422) {
          throw new Error('Formato de e-mail inválido');
        } else if (error.status === 429) {
          throw new Error('Muitas tentativas. Tente novamente mais tarde.');
        } else {
          throw error;
        }
      }
      
      if (data) {
        setCodeSent(true);
        toast.success('Código enviado com sucesso! Verifique seu e-mail.');
      }
    } catch (error: any) {
      console.error('Erro ao enviar código:', error);
      toast.error(error.message || 'Erro ao enviar código. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('Verificando código para:', email);
      
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'email',
      });

      console.log('Resposta do verifyOtp:', { data, error });

      if (error) {
        console.error('Erro na verificação:', error);
        throw error;
      }
      
      if (data.session) {
        console.log('Sessão criada, redirecionando...');
        // Força um refresh para garantir que o usuário está autenticado
        window.location.href = '/complete-registration';
      }
    } catch (error) {
      console.error('Erro ao verificar código:', error);
      toast.error('Código inválido ou expirado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Verifica se já está autenticado (caso tenha clicado no link de confirmação)
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log('Sessão ativa detectada, redirecionando...');
        window.location.href = '/complete-registration';
      }
    };
    
    checkSession();
    
    // Verifica por mudanças na autenticação
    const { data: { subscription } }: { data: { subscription: Subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Evento de autenticação:', event);
      if (event === 'SIGNED_IN' && session) {
        window.location.href = '/complete-registration';
      }
    });
    
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Criar Conta</h2>
        <p className="text-muted-foreground">
          {codeSent 
            ? 'Digite o código enviado para seu e-mail' 
            : 'Digite seu e-mail para começar'}
        </p>
      </div>

      {!codeSent ? (
        <form onSubmit={handleSendCode} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar Código'}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Código de Verificação</Label>
            <Input
              id="code"
              type="text"
              placeholder="Digite o código de 6 dígitos"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              disabled={loading}
            />
            <p className="text-sm text-muted-foreground">
              Enviamos um código para {email}
            </p>
          </div>
          
          <div className="flex flex-col space-y-2">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Verificando...' : 'Verificar Código'}
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setCodeSent(false)}
              disabled={loading}
            >
              Alterar e-mail
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
