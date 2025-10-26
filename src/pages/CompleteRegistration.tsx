// src/pages/CompleteRegistration.tsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useUser, UserProfile } from "@/hooks/useUser";
import { supabase } from "@/integrations/supabase/client";
import { validationUtils } from "@/utile/validation";
import { AvatarUpload } from "@/components/ui/avatar-upload";
const { validatePhone, validateCPF, validateCNPJ } = validationUtils;

// Funções auxiliares para formatação
const formatDocument = (value: string, type: 'cpf' | 'cnpj' = 'cpf') => {
  const numbers = value.replace(/\D/g, '');
  
  if (type === 'cpf') {
    return numbers
      .slice(0, 11)
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(\-\d{2})\d+?$/, '$1');
  } else {
    return numbers
      .slice(0, 14)
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(\-\d{2})\d+?$/, '$1');
  }
};

const formatPhone = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length <= 10) {
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(\-\d{4})\d+?$/, '$1');
  } else {
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(\-\d{4})\d+?$/, '$1');
  }
};

const formatCep = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  return numbers
    .slice(0, 8)
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(\-\d{3})\d+?$/, '$1');
};

type FormData = {
  fullName: string;
  document: string;
  documentType: 'cpf' | 'cnpj';
  phone: string;
  cep: string;
  state: string;
  city: string;
  address: string;
  addressNumber: string;
  complement: string;
  neighborhood: string;
  role: 'client' | 'wholesale' | 'driver';
  cnhNumber?: string;
  vehicleType?: string;
  vehiclePlate?: string;
};

// Tipos para erros de validação
type FormErrors = {
  [key: string]: string | null;
};

export default function CompleteRegistration() {
  const { user, updateProfile } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    document: '',
    documentType: 'cpf',
    phone: '',
    cep: '',
    state: '',
    city: '',
    address: '',
    addressNumber: '',
    complement: '',
    neighborhood: '',
    role: 'client',
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});
  
  const navigate = useNavigate();
  const location = useLocation();

  // Validação de telefone
  const validatePhone = (phone: string): { isValid: boolean; message?: string } => {
    const numbers = phone.replace(/\D/g, '');
    const isValid = numbers.length >= 10 && numbers.length <= 11;
    
    if (numbers.length === 0) {
      return { isValid: false, message: 'Telefone é obrigatório' };
    }
    
    if (!isValid) {
      return { 
        isValid: false, 
        message: 'Telefone inválido. Deve conter 10 ou 11 dígitos (com DDD)' 
      };
    }
    
    return { isValid: true };
  };

  // Estado para controlar o carregamento do CEP
  const [loadingCep, setLoadingCep] = useState(false);

  // Validação de CEP
  const validateCep = (cep: string): { isValid: boolean; message?: string } => {
    const cleanCep = cep.replace(/\D/g, '');
    const isValid = cleanCep.length === 8;
    
    if (cleanCep.length === 0) {
      return { isValid: false, message: 'CEP é obrigatório' };
    }
    
    if (!isValid) {
      return { 
        isValid: false, 
        message: 'CEP inválido. Deve conter 8 dígitos' 
      };
    }
    
    return { isValid: true };
  };

  // Busca o endereço pelo CEP usando a API do ViaCEP
  const fetchAddressByCep = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    
    // Valida o formato do CEP
    if (cleanCep.length !== 8) {
      setErrors(prev => ({ ...prev, cep: 'CEP deve ter 8 dígitos' }));
      return;
    }

    setLoadingCep(true);
    
    try {
      setErrors(prev => ({ ...prev, cep: 'Buscando endereço...' }));
      
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      
      if (!response.ok) {
        throw new Error('Erro na requisição');
      }
      
      const data = await response.json();
      
      if (data.erro) {
        setErrors(prev => ({ ...prev, cep: 'CEP não encontrado' }));
        return;
      }
      
      // Atualiza os campos do formulário com os dados do endereço
      setFormData(prev => ({
        ...prev,
        cep: formatCep(cleanCep),
        address: data.logradouro || '',
        neighborhood: data.bairro || '',
        city: data.localidade || '',
        state: data.uf || '',
        complement: data.complemento || ''
      }));
      
      // Limpa os erros de endereço
      setErrors(prev => ({
        ...prev,
        cep: '',
        address: '',
        neighborhood: '',
        city: '',
        state: ''
      }));
      
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      setErrors(prev => ({ 
        ...prev, 
        cep: 'Erro ao buscar CEP. Verifique sua conexão e tente novamente.' 
      }));
    } finally {
      setLoadingCep(false);
    }
  };
  
  // Manipulador de mudança do CEP
  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const formattedValue = formatCep(value);
    
    setFormData(prev => ({
      ...prev,
      cep: formattedValue
    }));
    
    // Limpa o erro do CEP ao digitar
    if (errors.cep) {
      setErrors(prev => ({ ...prev, cep: '' }));
    }
    
    // Busca o endereço quando o CEP estiver completo
    const cleanCep = value.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      fetchAddressByCep(cleanCep);
    }
  };


  // Função para validar documento (CPF/CNPJ)
  const validateDocument = (value: string, type: 'cpf' | 'cnpj'): boolean => {
    const numbers = value.replace(/\D/g, '');
    
    if (type === 'cpf') {
      return validateCPF(numbers);
    } else {
      return validateCNPJ(numbers);
    }
  };

  // Validação de campos obrigatórios
  const validateField = (name: string, value: string): string | null => {
    if (!value.trim()) return 'Este campo é obrigatório';
    
    switch (name) {
      case 'document':
        return validateDocument(value, formData.documentType) ? null : `Documento inválido para ${formData.documentType.toUpperCase()}`;
      case 'phone': {
        const { isValid, message } = validatePhone(value);
        return isValid ? null : (message || 'Telefone inválido');
      }
      case 'cep': {
        const { isValid, message } = validateCep(value);
        return isValid ? null : (message || 'CEP inválido');
      }
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : 'E-mail inválido';
      default:
        return null;
    }
  };

  // Atualiza o campo e valida
  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Valida o campo se já foi tocado
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  // Marca o campo como tocado quando perde o foco
  const handleBlur = (name: string) => {
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Valida o campo quando perde o foco
    const error = validateField(name, formData[name as keyof FormData] as string);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  // Função para fazer upload do avatar
  const handleAvatarUpload = async (file: File): Promise<string> => {
    try {
      if (!user) throw new Error('Usuário não autenticado');
      
      // Gera um nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Faz o upload do arquivo para o Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Obtém a URL pública do arquivo
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Atualiza o estado com a nova URL do avatar
      setAvatarUrl(publicUrl);
      
      return publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload do avatar:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Marca todos os campos como tocados para exibir erros
    const newTouched: {[key: string]: boolean} = {};
    const fields: (keyof FormData)[] = [
      'fullName', 'document', 'phone', 'cep', 'state', 
      'city', 'address', 'addressNumber', 'neighborhood'
    ];
    
    fields.forEach(field => {
      newTouched[field] = true;
    });
    setTouched(newTouched);

    // Validação básica
    const newErrors: FormErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Nome completo é obrigatório';
    const phoneValidation = validatePhone(formData.phone);
    if (!phoneValidation.isValid) {
      newErrors.phone = phoneValidation.message || 'Telefone inválido';
    }
    if (!formData.document) {
      newErrors.document = 'CPF/CNPJ é obrigatório';
    } else if (formData.documentType) {
      const isValid = validateDocument(formData.document, formData.documentType);
      if (!isValid) {
        newErrors.document = `Documento inválido para ${formData.documentType.toUpperCase()}`;
      }
    }
    if (!formData.documentType) newErrors.documentType = 'Tipo de documento é obrigatório';
    const cepValidation = validateCep(formData.cep);
    if (!cepValidation.isValid) {
      newErrors.cep = cepValidation.message || 'CEP inválido';
    }
    if (!formData.address) newErrors.address = 'Endereço é obrigatório';
    if (!formData.addressNumber) newErrors.addressNumber = 'Número é obrigatório';
    if (!formData.neighborhood) newErrors.neighborhood = 'Bairro é obrigatório';
    if (!formData.city) newErrors.city = 'Cidade é obrigatória';
    if (!formData.state) newErrors.state = 'UF é obrigatória';
    if (formData.role === 'driver' && !formData.cnhNumber) {
      newErrors.cnhNumber = 'Número da CNH é obrigatório para motoristas';
    }
    
    if (!validateCep(formData.cep)) {
      newErrors.cep = 'CEP inválido';
    }
    
    // Se houver erros, não envia o formulário
    if (hasErrors) {
      setErrors(newErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (!user) throw new Error('Usuário não autenticado');

      // Mapeia o role do formulário para o formato esperado pelo UserProfile
      const role = formData.role as 'client' | 'wholesale' | 'driver';

      // Prepara os dados do perfil para atualização
      const profileData: Partial<UserProfile> = {
        full_name: formData.fullName.trim(),
        phone: formData.phone.replace(/\D/g, ''),
        cep: formData.cep.replace(/\D/g, ''),
        state: formData.state.toUpperCase(),
        city: formData.city,
        address: `${formData.address}, ${formData.addressNumber}${formData.complement ? `, ${formData.complement}` : ''}`,
        neighborhood: formData.neighborhood,
        role,
        avatar_url: avatarUrl || null,
        is_approved: formData.role !== 'driver',
        is_blocked: false,
        cnh_image_url: null,
        updated_at: new Date().toISOString(),
        // Campos personalizados que não existem na tabela profiles
        document: formData.document.replace(/\D/g, ''),
        document_type: formData.documentType,
        date_of_birth: '',
        complement: formData.complement || undefined,
        address_number: formData.addressNumber,
        // Campos específicos para motoristas
        ...(formData.role === 'driver' && {
          cnh_number: formData.cnhNumber?.replace(/\D/g, '') || null,
          vehicle_type: formData.vehicleType || null,
          vehicle_plate: formData.vehiclePlate || null,
          // Adiciona a placa do veículo ao endereço se for motorista
          address: `${formData.address}, ${formData.addressNumber}${formData.complement ? `, ${formData.complement}` : ''}${formData.vehiclePlate ? ` (Placa: ${formData.vehiclePlate.toUpperCase()})` : ''}`,
        })
      };

      // Atualiza o perfil usando a função updateProfile do hook useUser
      await updateProfile(profileData);

      toast.success('Cadastro atualizado com sucesso!');
      
      // Redireciona para a página de origem ou para a página inicial
      const from = location.state?.from?.pathname || '/';
      navigate(from);
      
    } catch (error) {
      console.error('Erro ao atualizar cadastro:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar informações. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Verifica se há erros de validação
  const hasErrors = Object.values(errors).some(error => error !== null);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex flex-col items-center space-y-4">
            <AvatarUpload 
              onUpload={handleAvatarUpload} 
              initialImageUrl={avatarUrl || undefined}
              className="mb-4"
            />
            <div className="text-center">
              <CardTitle>Complete seu cadastro</CardTitle>
              <CardDescription>
                Preencha os campos abaixo para finalizar seu cadastro no sistema. 
                Os campos com <span className="text-red-500">*</span> são obrigatórios.
              </CardDescription>
            </div>
          </div>
          
          {hasErrors && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded" role="alert">
              <p className="font-bold">Atenção</p>
              <p>Por favor, corrija os erros abaixo antes de continuar.</p>
            </div>
          )}
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome Completo */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="fullName">Nome completo <span className="text-red-500">*</span></Label>
                  {touched.fullName && errors.fullName && (
                    <span className="text-xs text-red-500">{errors.fullName}</span>
                  )}
                </div>
                <Input
                  id="fullName"
                  placeholder="Seu nome completo"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  onBlur={() => handleBlur('fullName')}
                  className={touched.fullName && errors.fullName ? 'border-red-500' : ''}
                />
              </div>

              {/* Tipo de Documento */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="documentType">Tipo de documento <span className="text-red-500">*</span></Label>
                  {touched.documentType && errors.documentType && (
                    <span className="text-xs text-red-500">{errors.documentType}</span>
                  )}
                </div>
                <Select
                  value={formData.documentType}
                  onValueChange={(value: 'cpf' | 'cnpj') => {
                    setFormData({
                      ...formData,
                      documentType: value,
                      document: ''
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cpf">CPF</SelectItem>
                    <SelectItem value="cnpj">CNPJ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* CPF/CNPJ */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="document">
                    {formData.documentType === 'cpf' ? 'CPF ' : 'CNPJ '}
                    <span className="text-red-500">*</span>
                  </Label>
                  {touched.document && errors.document && (
                    <span className="text-xs text-red-500">{errors.document}</span>
                  )}
                </div>
                <Input
                  id="document"
                  placeholder={formData.documentType === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                  value={formData.document}
                  onChange={(e) => {
                    const value = e.target.value;
                    const formatted = formatDocument(value, formData.documentType);
                    handleChange('document', formatted);
                  }}
                  onBlur={() => handleBlur('document')}
                  className={touched.document && errors.document ? 'border-red-500' : ''}
                />
              </div>

              {/* Telefone */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="phone">Telefone <span className="text-red-500">*</span></Label>
                  {touched.phone && errors.phone && (
                    <span className="text-xs text-red-500">{errors.phone}</span>
                  )}
                </div>
                <Input
                  id="phone"
                  placeholder="(00) 00000-0000"
                  value={formData.phone}
                  onChange={(e) => {
                    const value = formatPhone(e.target.value);
                    handleChange('phone', value);
                  }}
                  onBlur={() => handleBlur('phone')}
                  className={touched.phone && errors.phone ? 'border-red-500' : ''}
                />
              </div>

              {/* CEP */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="cep">CEP <span className="text-red-500">*</span></Label>
                  {touched.cep && errors.cep && (
                    <span className="text-xs text-red-500">{errors.cep}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    id="cep"
                    placeholder="00000-000"
                    value={formData.cep}
                    onChange={(e) => {
                      const value = formatCep(e.target.value);
                      handleChange('cep', value);
                      
                      // Buscar endereço quando o CEP estiver completo
                      if (value.replace(/\D/g, '').length === 8) {
                        fetchAddressByCep(value);
                      }
                    }}
                    onBlur={() => handleBlur('cep')}
                    className={touched.cep && errors.cep ? 'border-red-500' : ''}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => formData.cep && fetchAddressByCep(formData.cep)}
                    disabled={!formData.cep || formData.cep.replace(/\D/g, '').length !== 8}
                  >
                    {errors.cep === 'Buscando endereço...' ? (
                      <span className="animate-pulse">Buscando...</span>
                    ) : 'Buscar'}
                  </Button>
                </div>
              </div>

              {/* Estado */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="state">UF <span className="text-red-500">*</span></Label>
                  {touched.state && errors.state && (
                    <span className="text-xs text-red-500">{errors.state}</span>
                  )}
                </div>
                <Input
                  id="state"
                  placeholder="SP"
                  maxLength={2}
                  value={formData.state}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase();
                    handleChange('state', value);
                  }}
                  onBlur={() => handleBlur('state')}
                  className={touched.state && errors.state ? 'border-red-500' : ''}
                />
              </div>

              {/* Cidade */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="city">Cidade <span className="text-red-500">*</span></Label>
                  {touched.city && errors.city && (
                    <span className="text-xs text-red-500">{errors.city}</span>
                  )}
                </div>
                <Input
                  id="city"
                  placeholder="Sua cidade"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  onBlur={() => handleBlur('city')}
                  className={touched.city && errors.city ? 'border-red-500' : ''}
                />
              </div>

              {/* Endereço */}
              <div className="space-y-2 col-span-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="address">Endereço <span className="text-red-500">*</span></Label>
                  {touched.address && errors.address && (
                    <span className="text-xs text-red-500">{errors.address}</span>
                  )}
                </div>
                <Input
                  id="address"
                  placeholder="Rua, avenida, etc."
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  onBlur={() => handleBlur('address')}
                  className={touched.address && errors.address ? 'border-red-500' : ''}
                />
              </div>

              {/* Número */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="addressNumber">Número <span className="text-red-500">*</span></Label>
                  {touched.addressNumber && errors.addressNumber && (
                    <span className="text-xs text-red-500">{errors.addressNumber}</span>
                  )}
                </div>
                <Input
                  id="addressNumber"
                  placeholder="Número"
                  value={formData.addressNumber}
                  onChange={(e) => handleChange('addressNumber', e.target.value)}
                  onBlur={() => handleBlur('addressNumber')}
                  className={touched.addressNumber && errors.addressNumber ? 'border-red-500' : ''}
                />
              </div>

              {/* Complemento */}
              <div className="space-y-2">
                <Label htmlFor="complement">Complemento</Label>
                <Input
                  id="complement"
                  placeholder="Apto, bloco, etc."
                  value={formData.complement}
                  onChange={(e) => 
                    setFormData({...formData, complement: e.target.value})
                  }
                />
              </div>

              {/* Bairro */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="neighborhood">Bairro <span className="text-red-500">*</span></Label>
                  {touched.neighborhood && errors.neighborhood && (
                    <span className="text-xs text-red-500">{errors.neighborhood}</span>
                  )}
                </div>
                <Input
                  id="neighborhood"
                  placeholder="Seu bairro"
                  value={formData.neighborhood}
                  onChange={(e) => handleChange('neighborhood', e.target.value)}
                  onBlur={() => handleBlur('neighborhood')}
                  className={touched.neighborhood && errors.neighborhood ? 'border-red-500' : ''}
                />
              </div>

              {/* Tipo de Conta */}
              <div className="space-y-2 col-span-2">
                <Label htmlFor="role">Tipo de Conta *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: 'client' | 'wholesale' | 'driver') => 
                    setFormData({...formData, role: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de conta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Cliente (Pessoa Física)</SelectItem>
                    <SelectItem value="wholesale">Atacadista</SelectItem>
                    <SelectItem value="driver">Entregador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Campos específicos para motoristas */}
              {formData.role === 'driver' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="cnhNumber">Número da CNH *</Label>
                    <Input
                      id="cnhNumber"
                      placeholder="Número da Carteira Nacional de Habilitação"
                      value={formData.cnhNumber || ''}
                      onChange={(e) => 
                        setFormData({...formData, cnhNumber: e.target.value})
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vehicleType">Tipo de Veículo *</Label>
                    <Select
                      value={formData.vehicleType || ''}
                      onValueChange={(value) => 
                        setFormData({...formData, vehicleType: value})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o veículo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="moto">Moto</SelectItem>
                        <SelectItem value="carro">Carro</SelectItem>
                        <SelectItem value="caminhao">Caminhão</SelectItem>
                        <SelectItem value="bicicleta">Bicicleta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vehiclePlate">Placa do Veículo *</Label>
                    <Input
                      id="vehiclePlate"
                      placeholder="ABC-1234"
                      value={formData.vehiclePlate || ''}
                      onChange={(e) => 
                        setFormData({
                          ...formData, 
                          vehiclePlate: e.target.value.toUpperCase()
                        })
                      }
                    />
                  </div>
                </>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4 pt-6">
            <div className="w-full flex space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
                disabled={isSubmitting}
                className="flex-1"
              >
                Voltar
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-primary hover:bg-primary/90"
                disabled={isSubmitting || hasErrors}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Salvando...
                  </>
                ) : 'Salvar Cadastro'}
              </Button>
            </div>
            
            <div className="w-full text-center text-sm text-gray-500">
              <p>Ao se cadastrar, você concorda com nossos <a href="/termos" className="text-primary hover:underline">Termos de Uso</a> e <a href="/privacidade" className="text-primary hover:underline">Política de Privacidade</a>.</p>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}