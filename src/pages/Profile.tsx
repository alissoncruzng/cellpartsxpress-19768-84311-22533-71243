import { useState, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  User,
  Package,
  Key,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Truck,
  Eye,
  Edit3,
  Save,
  X,
  Lock
} from "lucide-react";
import Header from "@/components/Header";

interface Order {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  delivery_address: any;
}

export default function Profile() {
  const { user, updateProfile } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    cep: user?.cep || '',
    city: user?.city || '',
    state: user?.state || '',
    neighborhood: user?.neighborhood || '',
    address_number: user?.address_number || '',
    complement: user?.complement || '',
    document: user?.document || '',
    date_of_birth: user?.date_of_birth || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      loadUserOrders();
      setFormData({
        full_name: user.full_name || '',
        phone: user.phone || '',
        address: user.address || '',
        cep: user.cep || '',
        city: user.city || '',
        state: user.state || '',
        neighborhood: user.neighborhood || '',
        address_number: user.address_number || '',
        complement: user.complement || '',
        document: user.document || '',
        date_of_birth: user.date_of_birth || ''
      });
    }
  }, [user]);

  const loadUserOrders = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar pedidos:', error);
      toast.error('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setUpdating(true);
    try {
      await updateProfile(formData);
      toast.success('Perfil atualizado com sucesso!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Erro ao atualizar perfil');
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    setUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      toast.success('Senha alterada com sucesso!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setChangingPassword(false);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao alterar senha');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'entregue': return 'bg-green-100 text-green-800';
      case 'saiu_entrega': return 'bg-blue-100 text-blue-800';
      case 'preparando': return 'bg-yellow-100 text-yellow-800';
      case 'confirmado': return 'bg-purple-100 text-purple-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'entregue': return 'Entregue';
      case 'saiu_entrega': return 'Saiu para entrega';
      case 'preparando': return 'Preparando';
      case 'confirmado': return 'Confirmado';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <User className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Meu Perfil</h1>
              <p className="text-muted-foreground">
                Gerencie suas informações pessoais e visualize seus pedidos
              </p>
            </div>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Perfil
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Pedidos
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Segurança
              </TabsTrigger>
            </TabsList>

            {/* Perfil */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Informações Pessoais</CardTitle>
                      <CardDescription>
                        Mantenha suas informações atualizadas
                      </CardDescription>
                    </div>
                    <Button
                      variant={isEditing ? "destructive" : "outline"}
                      onClick={() => setIsEditing(!isEditing)}
                      className="flex items-center gap-2"
                    >
                      {isEditing ? (
                        <>
                          <X className="h-4 w-4" />
                          Cancelar
                        </>
                      ) : (
                        <>
                          <Edit3 className="h-4 w-4" />
                          Editar
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Informações básicas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome Completo</Label>
                      {isEditing ? (
                        <Input
                          value={formData.full_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                        />
                      ) : (
                        <p className="text-sm font-medium p-2 bg-muted rounded">{user.full_name || 'Não informado'}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Email</Label>
                      <p className="text-sm font-medium p-2 bg-muted rounded">{user.email}</p>
                    </div>

                    <div className="space-y-2">
                      <Label>Telefone</Label>
                      {isEditing ? (
                        <Input
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      ) : (
                        <p className="text-sm font-medium p-2 bg-muted rounded">{user.phone || 'Não informado'}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Tipo de Conta</Label>
                      <Badge variant="outline" className="w-fit">
                        {user.role === 'admin' ? 'Administrador' :
                         user.role === 'driver' ? 'Entregador' : 'Cliente'}
                      </Badge>
                    </div>

                    {user.document && (
                      <div className="space-y-2">
                        <Label>{user.role === 'wholesale' ? 'CNPJ' : 'CPF'}</Label>
                        <p className="text-sm font-medium p-2 bg-muted rounded">{user.document}</p>
                      </div>
                    )}

                    {user.date_of_birth && (
                      <div className="space-y-2">
                        <Label>Data de Nascimento</Label>
                        <p className="text-sm font-medium p-2 bg-muted rounded">{user.date_of_birth}</p>
                      </div>
                    )}
                  </div>

                  {/* Endereço */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Endereço
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>CEP</Label>
                        {isEditing ? (
                          <Input
                            value={formData.cep}
                            onChange={(e) => setFormData(prev => ({ ...prev, cep: e.target.value }))}
                          />
                        ) : (
                          <p className="text-sm font-medium p-2 bg-muted rounded">{user.cep || 'Não informado'}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Cidade</Label>
                        {isEditing ? (
                          <Input
                            value={formData.city}
                            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                          />
                        ) : (
                          <p className="text-sm font-medium p-2 bg-muted rounded">{user.city || 'Não informado'}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Estado</Label>
                        {isEditing ? (
                          <Input
                            value={formData.state}
                            onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                          />
                        ) : (
                          <p className="text-sm font-medium p-2 bg-muted rounded">{user.state || 'Não informado'}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Bairro</Label>
                        {isEditing ? (
                          <Input
                            value={formData.neighborhood}
                            onChange={(e) => setFormData(prev => ({ ...prev, neighborhood: e.target.value }))}
                          />
                        ) : (
                          <p className="text-sm font-medium p-2 bg-muted rounded">{user.neighborhood || 'Não informado'}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Endereço</Label>
                      {isEditing ? (
                        <Input
                          value={formData.address}
                          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                          placeholder="Rua, número"
                        />
                      ) : (
                        <p className="text-sm font-medium p-2 bg-muted rounded">{user.address || 'Não informado'}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Número</Label>
                        {isEditing ? (
                          <Input
                            value={formData.address_number}
                            onChange={(e) => setFormData(prev => ({ ...prev, address_number: e.target.value }))}
                          />
                        ) : (
                          <p className="text-sm font-medium p-2 bg-muted rounded">{user.address_number || 'Não informado'}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Complemento</Label>
                        {isEditing ? (
                          <Input
                            value={formData.complement}
                            onChange={(e) => setFormData(prev => ({ ...prev, complement: e.target.value }))}
                          />
                        ) : (
                          <p className="text-sm font-medium p-2 bg-muted rounded">{user.complement || 'Não informado'}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex gap-2 pt-4 border-t">
                      <Button onClick={handleUpdateProfile} disabled={updating}>
                        {updating ? 'Salvando...' : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Salvar Alterações
                          </>
                        )}
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pedidos */}
            <TabsContent value="orders" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Meus Pedidos
                  </CardTitle>
                  <CardDescription>
                    Histórico dos seus últimos pedidos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                      <p>Carregando pedidos...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Nenhum pedido encontrado</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <Card key={order.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">Pedido #{order.id.slice(-8)}</span>
                                  <Badge className={getStatusColor(order.status)}>
                                    {getStatusText(order.status)}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(order.created_at).toLocaleDateString('pt-BR')}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Total: R$ {order.total_amount?.toFixed(2)}
                                </p>
                              </div>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-2" />
                                Detalhes
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Segurança */}
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Alterar Senha
                  </CardTitle>
                  <CardDescription>
                    Mantenha sua conta segura alterando sua senha regularmente
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!changingPassword ? (
                    <Button onClick={() => setChangingPassword(true)} variant="outline">
                      <Key className="h-4 w-4 mr-2" />
                      Alterar Senha
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Nova Senha</Label>
                        <Input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                          placeholder="Digite a nova senha"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Confirmar Nova Senha</Label>
                        <Input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          placeholder="Confirme a nova senha"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={handleChangePassword} disabled={updating}>
                          {updating ? 'Alterando...' : 'Alterar Senha'}
                        </Button>
                        <Button variant="outline" onClick={() => setChangingPassword(false)}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
