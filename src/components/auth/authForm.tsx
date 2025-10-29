typewriter
// src/components/auth/AuthForm.tsx
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

type AuthMethod = 'phone' | 'email';

export function AuthForm() {
  const [method, setMethod] = useState<AuthMethod>('phone');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (method === 'phone') {
        const formattedPhone = identifier.startsWith('+') ? identifier : `+55${identifier.replace(/\D/g, '')}`;
        const { error } = await supabase.auth.signInWithOtp({
          phone: formattedPhone,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email: identifier,
        });
        if (error) throw error;
      }
      
      setVerificationSent(true);
      toast.success('Código de verificação enviado!');
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao enviar código. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        [method === 'phone' ? 'phone' : 'email']: method === 'phone' 
          ? identifier.startsWith('+') ? identifier : `+55${identifier.replace(/\D/g, '')}`
          : identifier,
        token: otp,
        type: 'sms',
      });

      if (error) throw error;
      
      // Verifica se o usuário já tem perfil
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile?.full_name) {
          // Se já tem perfil, redireciona
          navigate(profile.role === 'admin' ? '/admin' : '/dashboard');
        } else {
          // Se não tem perfil, redireciona para completar cadastro
          navigate('/complete-registration');
        }
      }
    } catch (error) {
      console.error('Erro ao verificar código:', error);
      toast.error('Código inválido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (verificationSent) {
    return (
      <div className="w-full max-w-md p-6 space-y-4 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Verificação</h2>
        <p className="text-sm text-gray-600 text-center">
          Enviamos um código de verificação para {method === 'phone' ? `+55 ${identifier}` : identifier}
        </p>
        
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp">Código de Verificação</Label>
            <Input
              id="otp"
              type="text"
              placeholder="Digite o código recebido"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Verificando...' : 'Verificar Código'}
          </Button>
          
          <Button 
            type="button" 
            variant="outline" 
            className="w-full"
            onClick={() => setVerificationSent(false)}
            disabled={loading}
          >
            Voltar
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md p-6 space-y-4 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center">Entrar</h2>
      
      <div className="flex border-b">
        <button
          type="button"
          className={`flex-1 py-2 font-medium ${method === 'phone' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
          onClick={() => setMethod('phone')}
        >
          Telefone
        </button>
        <button
          type="button"
          className={`flex-1 py-2 font-medium ${method === 'email' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
          onClick={() => setMethod('email')}
        >
          E-mail
        </button>
      </div>
      
      <form onSubmit={handleSendOtp} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="identifier">
            {method === 'phone' ? 'Número de Telefone' : 'Endereço de E-mail'}
          </Label>
          {method === 'phone' ? (
            <div className="flex">
              <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
                +55
              </span>
              <Input
                id="identifier"
                type="tel"
                placeholder="(00) 00000-0000"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value.replace(/\D/g, ''))}
                required
                className="rounded-l-none"
              />
            </div>
          ) : (
            <Input
              id="identifier"
              type="email"
              placeholder="seu@email.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          )}
        </div>
        
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Enviando...' : 'Continuar'}
        </Button>
      </form>
    </div>
  );
}