import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function PhoneAuth() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const formatPhoneNumber = (phone: string): string => {
    // Remove tudo que não for dígito
    const cleaned = phone.replace(/\D/g, '');
    
    // Verifica se tem DDD + número (10 ou 11 dígitos)
    if (cleaned.length === 11) {
      // Formato: 11999999999 -> +5511999999999
      return `+55${cleaned}`;
    } else if (cleaned.length === 10) {
      // Se tiver 10 dígitos, assume que é um número fixo
      return `+55${cleaned}`;
    } else if (cleaned.length > 11 && cleaned.startsWith('55')) {
      // Se já tiver o código do país
      return `+${cleaned}`;
    } else if (cleaned.startsWith('+')) {
      // Se já estiver no formato internacional
      return cleaned;
    }
    
    throw new Error('Número de telefone inválido. Formato esperado: (DD) 9XXXX-XXXX ou (DD) XXXX-XXXX');
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Formatar o número de telefone
      const formattedPhone = formatPhoneNumber(phone);
      
      console.log('Enviando OTP para:', formattedPhone);
      
      // Primeiro, enviamos o código OTP usando o método correto
      const { error, data } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          shouldCreateUser: true,
          data: {
            phone: formattedPhone,
          },
          // Especifica o canal de envio
          channel: 'sms'
        }
      });
      
      console.log('Resposta do signInWithOtp:', { error, data });

      if (error) throw error;
      
      setVerificationSent(true);
      toast.success('Código de verificação enviado!');
    } catch (error) {
      console.error('Erro ao enviar código:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Erro ao enviar código. Tente novamente mais tarde.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formattedPhone = formatPhoneNumber(phone);
      
      console.log('Verificando OTP para:', formattedPhone, 'código:', otp);
      
      const { error, data } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: 'sms',
      });

      if (error) throw error;
      
      // Verifica se o usuário completou o cadastro
      if (data.session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .single();
          
        if (profile) {
          // Usuário já tem perfil, redireciona para o painel
          window.location.href = '/admin';
        } else {
          // Usuário precisa completar o cadastro
          window.location.href = '/complete-registration';
        }
      }
      
      toast.success('Autenticação realizada com sucesso!');
    } catch (error) {
      console.error('Erro ao verificar código:', error);
      toast.error(error instanceof Error ? error.message : 'Código inválido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (verificationSent) {
    return (
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-xl font-semibold tracking-tight">Verificação de Código</h2>
          <p className="text-sm text-muted-foreground">
            Enviamos um código de verificação para <span className="font-medium">{phone}</span>
          </p>
        </div>
        
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp" className="text-sm font-medium">Código de Verificação</Label>
            <Input
              id="otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Digite o código de 6 dígitos"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
              required
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">
              Não recebeu o código? <button 
                type="button" 
                onClick={handleSendOtp}
                className="text-primary underline-offset-4 hover:underline"
                disabled={loading}
              >
                Reenviar código
              </button>
            </p>
          </div>
          
          <div className="space-y-2">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verificando...
                </span>
              ) : 'Verificar Código'}
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
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSendOtp} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium">Número de Telefone</Label>
          <div className="flex">
            <span className="inline-flex items-center px-3 text-sm text-foreground bg-muted border border-r-0 border-input rounded-l-md">
              +55
            </span>
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              placeholder="(00) 00000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="rounded-l-none h-10"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Enviaremos um código de verificação para este número
          </p>
        </div>
        
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Enviando código...
            </span>
          ) : 'Receber Código'}
        </Button>
      </form>
    </div>
  );
}
