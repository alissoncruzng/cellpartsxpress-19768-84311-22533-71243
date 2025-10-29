import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Truck, Mail, Lock, Phone, MapPin, CreditCard, Calendar, Upload, ArrowLeft, CheckCircle, X } from "lucide-react";
import { cpf } from "cpf-cnpj-validator";

interface DriverRegistrationFormData {
  email: string;
  password: string;
  confirmPassword: string;
  full_name: string;
  phone: string;
  document: string; // CPF
  date_of_birth: string;
  cnh_number: string;
  vehicle_type: string;
  vehicle_plate: string;
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

interface DriverRegistrationProps {
  onComplete: () => Promise<void>;
}

export default function DriverRegistration({ onComplete }: DriverRegistrationProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cnhFile, setCnhFile] = useState<File | null>(null);
  const [cnhPreview, setCnhPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<DriverRegistrationFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: '',
    document: '',
    date_of_birth: '',
    cnh_number: '',
    vehicle_type: '',
    vehicle_plate: '',
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

  const handleInputChange = (field: keyof DriverRegistrationFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Arquivo muito grande. Máximo 5MB.');
        return;
      }

      if (!['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'].includes(file.type)) {
        toast.error('Formato não suportado. Use JPG, PNG ou PDF.');
        return;
      }

      setCnhFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setCnhPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setCnhPreview(null);
      }
    }
  };

  const removeFile = () => {
    setCnhFile(null);
    setCnhPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadCnhFile = async (userId: string): Promise<string | null> => {
    if (!cnhFile) return null;

    const fileExt = cnhFile.name.split('.').pop();
    const fileName = `${userId}/cnh.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('delivery-proofs')
      .upload(fileName, cnhFile);

    if (uploadError) throw uploadError;

    return fileName;
  };

  const validateForm = () => {
    if (!formData.full_name.trim()) {
      toast.error('Nome completo é obrigatório');
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

    if (!formData.cnh_number.trim()) {
      toast.error('Número da CNH é obrigatório');
      return false;
    }

    if (!formData.vehicle_type) {
      toast.error('Tipo de veículo é obrigatório');
      return false;
    }

    if (!formData.vehicle_plate.trim()) {
      toast.error('Placa do veículo é obrigatória');
      return false;
    }

    if (!cnhFile) {
      toast.error('Foto da CNH é obrigatória');
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
            full_name: formData.full_name,
            user_type: 'driver'
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Upload da CNH
        let cnhFileName = null;
        try {
          cnhFileName = await uploadCnhFile(data.user.id);
        } catch (uploadError) {
          console.error('Erro ao fazer upload da CNH:', uploadError);
          // Continua mesmo se o upload falhar, mas registra no perfil
        }

        // Criar perfil do motoboy
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: formData.email,
            full_name: formData.full_name,
            phone: formData.phone,
            document: formData.document,
            date_of_birth: formData.date_of_birth,
            cnh_number: formData.cnh_number,
            cnh_image_url: cnhFileName,
            vehicle_type: formData.vehicle_type,
            vehicle_plate: formData.vehicle_plate,
            address: formData.address,
            address_number: formData.address_number,
            complement: formData.complement,
            neighborhood: formData.neighborhood,
            city: formData.city,
            state: formData.state,
            cep: formData.cep,
            role: 'driver',
            is_approved: false, // Motoboys precisam ser aprovados
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
              <Truck className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Cadastro de Motoboy</h1>
            </div>
            <p className="text-muted-foreground">
              Junte-se à nossa equipe de entregadores e aumente sua renda
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>
                Preencha seus dados para se tornar um entregador parceiro
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
                      <Label htmlFor="email">Email *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="seu@email.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

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

                {/* Dados Pessoais */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
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
                        <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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

                {/* Dados da CNH e Veículo */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    CNH e Veículo
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cnh_number">Número da CNH *</Label>
                      <Input
                        id="cnh_number"
                        placeholder="00000000000"
                        value={formData.cnh_number}
                        onChange={(e) => handleInputChange('cnh_number', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vehicle_type">Tipo de Veículo *</Label>
                      <Select value={formData.vehicle_type} onValueChange={(value) => handleInputChange('vehicle_type', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="motocicleta">Motocicleta</SelectItem>
                          <SelectItem value="bicicleta">Bicicleta</SelectItem>
                          <SelectItem value="carro">Carro</SelectItem>
                          <SelectItem value="van">Van</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vehicle_plate">Placa do Veículo *</Label>
                    <Input
                      id="vehicle_plate"
                      placeholder="ABC-1234"
                      value={formData.vehicle_plate}
                      onChange={(e) => handleInputChange('vehicle_plate', e.target.value)}
                      style={{ textTransform: 'uppercase' }}
                    />
                  </div>

                  {/* Upload da CNH */}
                  <div className="space-y-2">
                    <Label>Foto da CNH *</Label>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                      {cnhFile ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                              <span className="text-sm font-medium">{cnhFile.name}</span>
                            </div>
                            <Button variant="ghost" size="sm" onClick={removeFile}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          {cnhPreview && (
                            <div className="max-w-xs mx-auto">
                              <img
                                src={cnhPreview}
                                alt="CNH Preview"
                                className="w-full h-auto rounded-lg border"
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Clique para fazer upload da CNH</p>
                            <p className="text-xs text-muted-foreground">
                              JPG, PNG ou PDF até 5MB
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-4"
                          >
                            Selecionar Arquivo
                          </Button>
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
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

                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-800">
                      <strong>Nota:</strong> Após o cadastro, seus documentos serão analisados pelo administrador.
                      Você será notificado por email assim que sua conta for aprovada para começar a trabalhar.
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
