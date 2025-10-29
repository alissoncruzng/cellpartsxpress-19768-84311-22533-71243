import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { User, Phone, MapPin, Calendar, ArrowLeft, Loader2, FileText } from "lucide-react";
import { cpf } from "cpf-cnpj-validator";

interface ClientRegistrationFormData {
  full_name: string;
  phone: string;
  document: string; // CPF
  date_of_birth: string;
  address: string;
  address_number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
}

interface ClientRegistrationProps {
  onComplete: () => Promise<void>;
}

export default function ClientRegistration({ onComplete }: ClientRegistrationProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ClientRegistrationFormData>({
    full_name: '',
    phone: '',
    document: '',
    date_of_birth: '',
    address: '',
    address_number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    cep: '',
    acceptTerms: false,
    acceptPrivacy: false
  });

  // Verifica se o usuário está autenticado
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Você precisa criar uma conta primeiro');
        navigate('/register/client');
      }
    };

    checkAuth();
  }, [navigate]);

  const handleInputChange = (field: keyof ClientRegistrationFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.full_name.trim()) {
      toast.error('Nome completo é obrigatório');
      return false;
    }

    if (!formData.phone.trim()) {
      toast.error('Telefone é obrigatório');
      return false;
    }

    if (!formData.document.trim()) {
      toast.error('CPF é obrigatório');
      return false;
    }

    if (!cpf.isValid(formData.document)) {
      toast.error('CPF inválido');
      return false;
    }

    if (!formData.date_of_birth) {
      toast.error('Data de nascimento é obrigatória');
      return false;
    }

    if (!formData.address.trim()) {
      toast.error('Endereço é obrigatório');
      return false;
    }

    if (!formData.neighborhood.trim()) {
      toast.error('Bairro é obrigatório');
      return false;
    }

    if (!formData.city.trim()) {
      toast.error('Cidade é obrigatória');
      return false;
    }

    if (!formData.state) {
      toast.error('Estado é obrigatório');
      return false;
    }

    if (!formData.cep.trim()) {
      toast.error('CEP é obrigatório');
      return false;
    }

    if (!formData.acceptTerms) {
      toast.error('Você deve aceitar os termos de uso');
      return false;
    }

    if (!formData.acceptPrivacy) {
      toast.error('Você deve aceitar a política de privacidade');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    let retryCount = 0;
    const maxRetries = 2;

    const updateProfile = async (): Promise<boolean> => {
      try {
        // 1. Verifica se o usuário está autenticado
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) throw userError;
        if (!user) {
          // Tenta recuperar a sessão se o usuário não estiver autenticado
          if (retryCount < maxRetries) {
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, 1000)); // Aguarda 1s antes de tentar novamente
            return updateProfile();
          }
          throw new Error("Sessão expirada. Por favor, faça login novamente.");
        }

        // 2. Atualiza o perfil do usuário
        const updates = {
          full_name: formData.full_name.trim(),
          phone: formData.phone.replace(/\D/g, ''), // Remove caracteres não numéricos
          document: formData.document.replace(/\D/g, ''), // Remove caracteres não numéricos
          date_of_birth: formData.date_of_birth,
          address: formData.address.trim(),
          address_number: formData.address_number.trim(),
          complement: formData.complement.trim(),
          neighborhood: formData.neighborhood.trim(),
          city: formData.city.trim(),
          state: formData.state,
          cep: formData.cep.replace(/\D/g, ''), // Remove caracteres não numéricos
          privacy_policy_accepted: true,
          terms_of_service_accepted: true,
          privacy_policy_accepted_at: new Date().toISOString(),
          terms_of_service_accepted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_approved: false // Aguardando aprovação do administrador
        };

        const { error: profileError } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id);

        if (profileError) throw profileError;

        // 3. Chama a função de conclusão fornecida pelo componente pai
        await onComplete();
        return true;
        
      } catch (error: any) {
        console.error('Erro ao atualizar perfil:', error);
        
        // Se ainda tiver tentativas, tenta novamente
        if (retryCount < maxRetries) {
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 1000)); // Aguarda 1s antes de tentar novamente
          return updateProfile();
        }
        
        // Se esgotar as tentativas, mostra a mensagem de erro
        const errorMessage = error.message.includes('permission denied')
          ? 'Você não tem permissão para realizar esta ação.'
          : error.message || 'Erro ao atualizar perfil. Por favor, tente novamente.';
          
        toast.error(errorMessage);
        return false;
      }
    };

    try {
      const success = await updateProfile();
      if (!success) {
        // Se todas as tentativas falharem, redireciona para a página de login
        await supabase.auth.signOut();
        navigate('/login');
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Ocorreu um erro inesperado. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div className="flex items-center justify-center gap-2 mb-4">
              <User className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Complete seu Cadastro</h1>
            </div>
            <p className="text-muted-foreground">
              Preencha seus dados pessoais para finalizar o cadastro
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>
                Preencha seus dados para completar seu cadastro
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Dados de Contato */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Dados de Contato
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        placeholder="(11) 99999-9999"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="pl-10"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                {/* Dados Pessoais */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Dados Pessoais
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="full_name">Nome Completo *</Label>
                    <Input
                      id="full_name"
                      placeholder="Seu nome completo"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="document">CPF *</Label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="document"
                          placeholder="000.000.000-00"
                          value={formData.document}
                          onChange={(e) => handleInputChange('document', e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date_of_birth">Data de Nascimento *</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="date_of_birth"
                          type="date"
                          value={formData.date_of_birth}
                          onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Endereço */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Endereço
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cep">CEP *</Label>
                      <Input
                        id="cep"
                        placeholder="00000-000"
                        value={formData.cep}
                        onChange={(e) => handleInputChange('cep', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">Estado *</Label>
                      <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SP">São Paulo</SelectItem>
                          <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                          <SelectItem value="MG">Minas Gerais</SelectItem>
                          <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                          <SelectItem value="PR">Paraná</SelectItem>
                          <SelectItem value="SC">Santa Catarina</SelectItem>
                          <SelectItem value="GO">Goiás</SelectItem>
                          <SelectItem value="DF">Distrito Federal</SelectItem>
                          <SelectItem value="ES">Espírito Santo</SelectItem>
                          <SelectItem value="BA">Bahia</SelectItem>
                          <SelectItem value="CE">Ceará</SelectItem>
                          <SelectItem value="PE">Pernambuco</SelectItem>
                          <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                          <SelectItem value="PB">Paraíba</SelectItem>
                          <SelectItem value="AL">Alagoas</SelectItem>
                          <SelectItem value="SE">Sergipe</SelectItem>
                          <SelectItem value="PI">Piauí</SelectItem>
                          <SelectItem value="MA">Maranhão</SelectItem>
                          <SelectItem value="TO">Tocantins</SelectItem>
                          <SelectItem value="MT">Mato Grosso</SelectItem>
                          <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                          <SelectItem value="AM">Amazonas</SelectItem>
                          <SelectItem value="PA">Pará</SelectItem>
                          <SelectItem value="RO">Rondônia</SelectItem>
                          <SelectItem value="AC">Acre</SelectItem>
                          <SelectItem value="RR">Roraima</SelectItem>
                          <SelectItem value="AP">Amapá</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">Cidade *</Label>
                      <Input
                        id="city"
                        placeholder="Sua cidade"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="neighborhood">Bairro *</Label>
                      <Input
                        id="neighborhood"
                        placeholder="Seu bairro"
                        value={formData.neighborhood}
                        onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço *</Label>
                    <Input
                      id="address"
                      placeholder="Rua, Avenida, etc."
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="address_number">Número</Label>
                      <Input
                        id="address_number"
                        placeholder="123"
                        value={formData.address_number}
                        onChange={(e) => handleInputChange('address_number', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="complement">Complemento</Label>
                      <Input
                        id="complement"
                        placeholder="Apto, sala, etc."
                        value={formData.complement}
                        onChange={(e) => handleInputChange('complement', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Termos e Condições */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="acceptTerms"
                      checked={formData.acceptTerms}
                      onCheckedChange={(checked) => handleInputChange('acceptTerms', !!checked)}
                    />
                    <div className="flex items-center text-sm">
                      <span>Aceito os </span>
                      <Button 
                      variant="link" 
                      className="p-0 h-auto text-sm font-medium text-blue-400 hover:text-blue-300 hover:underline underline-offset-2 ml-1"
                    >
                      Termos de Uso
                    </Button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="acceptPrivacy"
                      checked={formData.acceptPrivacy}
                      onCheckedChange={(checked) => handleInputChange('acceptPrivacy', !!checked)}
                    />
                    <div className="flex items-center text-sm">
                      <span>Aceito a </span>
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-sm font-medium text-blue-400 hover:text-blue-300 hover:underline underline-offset-2 ml-1"
                      >
                        Política de Privacidade
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Botão de Cadastro */}
                <Button 
                  type="submit" 
                  className="w-full h-14 text-lg font-semibold bg-green-600 hover:bg-green-700 text-white shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-100 border-2 border-green-500"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Finalizando cadastro...
                    </>
                  ) : (
                    'Finalizar Cadastro'
                  )}
                </Button>

                <div className="text-center mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/')}
                    className="w-full h-12 text-base font-medium border-2 border-green-500 text-green-400 hover:bg-green-900/30 hover:text-green-300"
                  >
                    Já tem conta? <span className="font-semibold ml-1">Faça login</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
