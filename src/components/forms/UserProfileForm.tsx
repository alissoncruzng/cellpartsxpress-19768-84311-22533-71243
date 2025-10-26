import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UserProfile } from "@/hooks/useUser";
import { cn } from "@/lib/utils";
import { cpf, cnpj } from 'cpf-cnpj-validator';

const userProfileSchema = z.object({
  full_name: z.string().min(3, { message: "Nome completo é obrigatório" }),
  email: z.string().email({ message: "E-mail inválido" }),
  phone: z.string().min(10, { message: "Telefone inválido" }),
  document: z.string()
    .refine((val) => {
      // Remove caracteres não numéricos
      const cleanVal = val.replace(/\D/g, '');
      return cleanVal.length === 11 ? cpf.isValid(cleanVal) : cnpj.isValid(cleanVal);
    }, { message: "CPF ou CNPJ inválido" }),
  address: z.object({
    street: z.string().min(3, { message: "Rua é obrigatória" }),
    number: z.string().min(1, { message: "Número é obrigatório" }),
    complement: z.string().optional(),
    neighborhood: z.string().min(1, { message: "Bairro é obrigatório" }),
    city: z.string().min(1, { message: "Cidade é obrigatória" }),
    state: z.string().length(2, { message: "UF inválida" }),
    zip_code: z.string().min(8, { message: "CEP inválido" })
  })
});

type UserProfileFormValues = z.infer<typeof userProfileSchema>;

interface UserProfileFormProps {
  user: UserProfile;
  onSubmit: (values: UserProfileFormValues) => void;
  isSubmitting?: boolean;
  className?: string;
}

export function UserProfileForm({ user, onSubmit, isSubmitting, className }: UserProfileFormProps) {
  const form = useForm<UserProfileFormValues>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      full_name: user.full_name || '',
      email: user.email || '',
      phone: user.phone || '',
      document: user.document || '',
      address: {
        street: user.address?.street || '',
        number: user.address?.number || '',
        complement: user.address?.complement || '',
        neighborhood: user.address?.neighborhood || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        zip_code: user.address?.zip_code || ''
      }
    },
  });

  const formatDocument = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    
    if (cleanValue.length <= 11) {
      // Formata CPF (000.000.000-00)
      return cleanValue
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      // Formata CNPJ (00.000.000/0000-00)
      return cleanValue
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
  };

  const formatPhone = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    
    if (cleanValue.length <= 10) {
      // Formata telefone fixo (00) 0000-0000
      return cleanValue
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    } else {
      // Formata celular (00) 00000-0000
      return cleanValue
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
  };

  const formatZipCode = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{3})\d+?$/, '$1');
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDocument(e.target.value);
    form.setValue('document', formatted);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    form.setValue('phone', formatted);
  };

  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatZipCode(e.target.value);
    form.setValue('address.zip_code', formatted);
    
    // Se o CEP estiver completo (8 dígitos), busca o endereço
    if (formatted.replace(/\D/g, '').length === 8) {
      // Aqui você pode adicionar a lógica para buscar o CEP
      // usando uma API como ViaCEP ou outra de sua preferência
    }
  };

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(onSubmit)} 
        className={cn("space-y-6", className)}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Completo</FormLabel>
                <FormControl>
                  <Input placeholder="Seu nome completo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="seu@email.com" 
                    disabled={!!user.email} // Impede a edição do e-mail após cadastro
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="phone"
            render={({ field: { onChange, ...field } }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="(00) 00000-0000" 
                    onChange={(e) => {
                      const formatted = formatPhone(e.target.value);
                      onChange(formatted);
                    }}
                    maxLength={15}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="document"
            render={({ field: { onChange, ...field } }) => (
              <FormItem>
                <FormLabel>{user.role === 'wholesale' ? 'CNPJ' : 'CPF'}</FormLabel>
                <FormControl>
                  <Input 
                    placeholder={user.role === 'wholesale' ? '00.000.000/0000-00' : '000.000.000-00'} 
                    onChange={(e) => {
                      const formatted = formatDocument(e.target.value);
                      onChange(formatted);
                    }}
                    maxLength={user.role === 'wholesale' ? 18 : 14}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium mb-4">Endereço</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="address.zip_code"
                render={({ field: { onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>CEP</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="00000-000" 
                        onChange={(e) => {
                          const formatted = formatZipCode(e.target.value);
                          onChange(formatted);
                        }}
                        maxLength={9}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex items-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    // Lógica para buscar CEP
                    const cep = form.getValues('address.zip_code').replace(/\D/g, '');
                    if (cep.length === 8) {
                      // Implemente a busca do CEP aqui
                      console.log('Buscando CEP:', cep);
                    }
                  }}
                >
                  Buscar CEP
                </Button>
              </div>
              
              <FormField
                control={form.control}
                name="address.street"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Rua</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da rua" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="address.number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número</FormLabel>
                    <FormControl>
                      <Input placeholder="Número" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="address.complement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Complemento</FormLabel>
                    <FormControl>
                      <Input placeholder="Apto, bloco, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="address.neighborhood"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bairro</FormLabel>
                    <FormControl>
                      <Input placeholder="Bairro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="address.city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input placeholder="Cidade" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="address.state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado (UF)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="UF" 
                        maxLength={2}
                        style={{ textTransform: 'uppercase' }}
                        {...field} 
                        onChange={(e) => {
                          field.onChange(e.target.value.toUpperCase());
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
