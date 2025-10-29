import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Store, Mail, Lock, Phone, MapPin, Building, FileText, ArrowLeft, CheckCircle } from "lucide-react";
import { cnpj } from "cpf-cnpj-validator";

interface WholesaleRegistrationFormData {
  email: string;
  password: string;
  confirmPassword: string;
  company_name: string;
  contact_name: string;
  phone: string;
  document: string; // CNPJ
  business_description: string;
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

interface WholesaleRegistrationProps {
  onComplete: () => Promise<void>;
}

export default function WholesaleRegistration({ onComplete }: WholesaleRegistrationProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<WholesaleRegistrationFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    company_name: '',
    contact_name: '',
    phone: '',
    document: '',
    business_description: '',
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

  const handleInputChange = (field: keyof WholesaleRegistrationFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.company_name.trim()) {
      toast.error('Nome da empresa é obrigatório');
      return false;
    }

    if (!formData.contact_name.trim()) {
      toast.error('Nome do contato é obrigatório');
      return false;
    }

    if (!formData.email.trim()) {
      toast.error('Email é obrigatório');
      return false;
    }

    if (!formData.password) {
      toast.error('Senha é obrigatória');
      return false;
    }

    if (formData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return false;
    }

    if (!formData.phone.trim()) {
      toast.error('Telefone é obrigatório');
      return false;
    }

    if (!formData.document.trim()) {
      toast.error('CNPJ é obrigatório');
      return false;
    }

    if (!cnpj.isValid(formData.document)) {
      toast.error('CNPJ inválido');
      return false;
    }

    if (!formData.business_description.trim()) {
      toast.error('Descrição do negócio é obrigatória');
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

    try {
      // Criar usuário no Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.contact_name,
            company_name: formData.company_name,
            user_type: 'wholesale'
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Criar perfil do lojista
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: formData.email,
            full_name: formData.contact_name,
            phone: formData.phone,
            document: formData.document,
            company_name: formData.company_name,
            business_description: formData.business_description,
            address: formData.address,
            address_number: formData.address_number,
            complement: formData.complement,
            neighborhood: formData.neighborhood,
            city: formData.city,
            state: formData.state,
            cep: formData.cep,
            role: 'wholesale',
            is_approved: false, // Lojistas precisam ser aprovados
            privacy_policy_accepted_at: new Date().toISOString(),
            work_policy_accepted_at: new Date().toISOString()
          });

        if (profileError) throw profileError;

        // Chama a função onComplete para finalizar o cadastro
        await onComplete();
      }
    } catch (error: any) {
      console.error('Erro ao criar conta:', error);
      toast.error(error.message || 'Erro ao criar conta');
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
              <Store className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Cadastro de Lojista</h1>
            </div>
            <p className="text-muted-foreground">
              Cadastre sua empresa para ter acesso a preços especiais e condições diferenciadas
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Informações da Empresa</CardTitle>
              <CardDescription>
                Preencha os dados da sua empresa para criar a conta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Dados de Acesso */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Dados de Acesso
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Empresarial *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="contato@empresa.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone Empresarial *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          placeholder="(11) 99999-9999"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Senha *</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Repita a senha"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Dados da Empresa */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Dados da Empresa
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="company_name">Razão Social *</Label>
                    <Input
                      id="company_name"
                      placeholder="Nome da empresa Ltda."
                      value={formData.company_name}
                      onChange={(e) => handleInputChange('company_name', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact_name">Nome do Contato *</Label>
                      <Input
                        id="contact_name"
                        placeholder="Pessoa responsável"
                        value={formData.contact_name}
                        onChange={(e) => handleInputChange('contact_name', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="document">CNPJ *</Label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="document"
                          placeholder="00.000.000/0000-00"
                          value={formData.document}
                          onChange={(e) => handleInputChange('document', e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="business_description">Descrição do Negócio *</Label>
                    <Textarea
                      id="business_description"
                      placeholder="Descreva o tipo de negócio, especialidade, etc."
                      value={formData.business_description}
                      onChange={(e) => handleInputChange('business_description', e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>

                {/* Endereço */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Endereço da Empresa
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
                        placeholder="Cidade da empresa"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="neighborhood">Bairro *</Label>
                      <Input
                        id="neighborhood"
                        placeholder="Bairro da empresa"
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
                        placeholder="Sala, andar, etc."
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
                    <Label htmlFor="acceptTerms" className="text-sm">
                      Aceito os <Button variant="link" className="p-0 h-auto text-sm">Termos de Uso</Button>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="acceptPrivacy"
                      checked={formData.acceptPrivacy}
                      onCheckedChange={(checked) => handleInputChange('acceptPrivacy', !!checked)}
                    />
                    <Label htmlFor="acceptPrivacy" className="text-sm">
                      Aceito a <Button variant="link" className="p-0 h-auto text-sm">Política de Privacidade</Button>
                    </Label>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Nota:</strong> Após o cadastro, sua conta será analisada pelo administrador antes da aprovação.
                      Você será notificado por email assim que sua conta for aprovada.
                    </p>
                  </div>
                </div>

                {/* Botão de Cadastro */}
                <Button type="submit" className="w-full h-12" disabled={loading}>
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Criando conta...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Solicitar Cadastro
                    </div>
                  )}
                </Button>

                <div className="text-center">
                  <Button variant="link" onClick={() => navigate('/')}>
                    Já tem conta? Faça login
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
