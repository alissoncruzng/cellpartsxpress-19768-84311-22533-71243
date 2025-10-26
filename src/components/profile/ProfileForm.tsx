import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { cpf, cnpj } from 'cpf-cnpj-validator';
import { UserProfile } from '@/hooks/useUser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCog } from 'lucide-react';
import { toast } from 'sonner';

// Esquema de validação para o formulário de perfil
const profileFormSchema = z.object({
  full_name: z.string().min(3, { message: "Nome completo é obrigatório" }),
  email: z.string().email({ message: "E-mail inválido" }),
  phone: z.string().min(10, { message: "Telefone inválido" }),
  document: z.string().refine((val) => {
    if (!val) return false;
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

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
  user: UserProfile;
  onUpdate: (data: Partial<UserProfile>) => Promise<void>;
}

export function ProfileForm({ user, onUpdate }: ProfileFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
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
    }
  });

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setIsLoading(true);
      await onUpdate({
        ...data,
        address: {
          ...data.address,
          zip_code: data.address.zip_code.replace(/\D/g, '')
        }
      });
      toast.success('Perfil atualizado com sucesso!');
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error('Erro ao atualizar perfil. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center space-x-2">
          <UserCog className="h-6 w-6" />
          <CardTitle>Meu Perfil</CardTitle>
        </div>
        {!isEditing ? (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            Editar Perfil
          </Button>
        ) : (
          <div className="space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                form.reset();
                setIsEditing(false);
              }}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              size="sm" 
              onClick={form.handleSubmit(onSubmit)}
              disabled={isLoading}
            >
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nome Completo</Label>
              <Input 
                id="full_name" 
                {...form.register('full_name')} 
                disabled={!isEditing}
                className={!isEditing ? 'bg-gray-50' : ''}
              />
              {form.formState.errors.full_name && (
                <p className="text-sm text-red-500">{form.formState.errors.full_name.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input 
                id="email" 
                type="email" 
                {...form.register('email')} 
                disabled
                className="bg-gray-100"
              />
              <p className="text-xs text-gray-500">Para alterar o e-mail, entre em contato com o suporte.</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input 
                id="phone" 
                type="tel" 
                {...form.register('phone')} 
                disabled={!isEditing}
                className={!isEditing ? 'bg-gray-50' : ''}
                placeholder="(00) 00000-0000"
              />
              {form.formState.errors.phone && (
                <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="document">
                {user.role === 'wholesale' ? 'CNPJ' : 'CPF'}
              </Label>
              <Input 
                id="document" 
                {...form.register('document')} 
                disabled={!isEditing}
                className={!isEditing ? 'bg-gray-50' : ''}
                placeholder={user.role === 'wholesale' ? '00.000.000/0000-00' : '000.000.000-00'}
              />
              {form.formState.errors.document && (
                <p className="text-sm text-red-500">{form.formState.errors.document.message}</p>
              )}
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <h3 className="text-lg font-medium mb-4">Endereço</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="street">Rua</Label>
                <Input 
                  id="street" 
                  {...form.register('address.street')} 
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-gray-50' : ''}
                />
                {form.formState.errors.address?.street && (
                  <p className="text-sm text-red-500">{form.formState.errors.address.street.message}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="number">Número</Label>
                  <Input 
                    id="number" 
                    {...form.register('address.number')} 
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                  />
                  {form.formState.errors.address?.number && (
                    <p className="text-sm text-red-500">{form.formState.errors.address.number.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="complement">Complemento</Label>
                  <Input 
                    id="complement" 
                    {...form.register('address.complement')} 
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="neighborhood">Bairro</Label>
                <Input 
                  id="neighborhood" 
                  {...form.register('address.neighborhood')} 
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-gray-50' : ''}
                />
                {form.formState.errors.address?.neighborhood && (
                  <p className="text-sm text-red-500">{form.formState.errors.address.neighborhood.message}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input 
                    id="city" 
                    {...form.register('address.city')} 
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                  />
                  {form.formState.errors.address?.city && (
                    <p className="text-sm text-red-500">{form.formState.errors.address.city.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="state">UF</Label>
                  <Input 
                    id="state" 
                    {...form.register('address.state')} 
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                    maxLength={2}
                    style={{ textTransform: 'uppercase' }}
                  />
                  {form.formState.errors.address?.state && (
                    <p className="text-sm text-red-500">{form.formState.errors.address.state.message}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="zip_code">CEP</Label>
                <Input 
                  id="zip_code" 
                  {...form.register('address.zip_code')} 
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-gray-50' : ''}
                  placeholder="00000-000"
                />
                {form.formState.errors.address?.zip_code && (
                  <p className="text-sm text-red-500">{form.formState.errors.address.zip_code.message}</p>
                )}
              </div>
            </div>
          </div>
          
          {isEditing && (
            <div className="flex justify-end pt-4 border-t">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
