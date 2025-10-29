import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Store,
  Package,
  ShoppingCart,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  DollarSign,
  Truck,
  Star,
  Upload
} from "lucide-react";
import Header from "@/components/Header";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
}

interface Order {
  id: string;
  status: string;
  total_amount: number;
  customer_name: string;
  created_at: string;
}

interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  todayOrders: number;
  totalRevenue: number;
  pendingOrders: number;
}

export default function WholesaleDashboard() {
  const { user } = useUser();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    todayOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock_quantity: '',
    image_url: ''
  });

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Carregar produtos da loja
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', user.id)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      // Carregar pedidos da loja
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          total_amount,
          created_at,
          profiles!customer_id(full_name)
        `)
        .eq('store_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (ordersError) throw ordersError;

      // Processar dados dos pedidos
      const processedOrders = ordersData?.map(order => ({
        id: order.id,
        status: order.status,
        total_amount: order.total_amount,
        customer_name: order.profiles?.full_name || 'Cliente',
        created_at: order.created_at
      })) || [];

      setProducts(productsData || []);
      setOrders(processedOrders);

      // Calcular estatísticas
      const totalProducts = productsData?.length || 0;
      const activeProducts = productsData?.filter(p => p.is_active).length || 0;
      const totalOrders = processedOrders.length;
      const today = new Date().toDateString();
      const todayOrders = processedOrders.filter(order =>
        new Date(order.created_at).toDateString() === today
      ).length;
      const totalRevenue = processedOrders.reduce((sum, order) => sum + order.total_amount, 0);
      const pendingOrders = processedOrders.filter(order =>
        !['entregue', 'cancelado'].includes(order.status)
      ).length;

      setStats({
        totalProducts,
        activeProducts,
        totalOrders,
        todayOrders,
        totalRevenue,
        pendingOrders
      });

    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    try {
      const productData = {
        store_id: user.id,
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        category: productForm.category,
        stock_quantity: parseInt(productForm.stock_quantity),
        image_url: productForm.image_url || null
      };

      if (editingProduct) {
        // Atualizar produto
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        toast.success('Produto atualizado com sucesso!');
      } else {
        // Criar novo produto
        const { error } = await supabase
          .from('products')
          .insert(productData);

        if (error) throw error;
        toast.success('Produto cadastrado com sucesso!');
      }

      // Limpar formulário e recarregar dados
      setProductForm({
        name: '',
        description: '',
        price: '',
        category: '',
        stock_quantity: '',
        image_url: ''
      });
      setEditingProduct(null);
      setShowAddProduct(false);
      loadDashboardData();

    } catch (error: any) {
      console.error('Erro ao salvar produto:', error);
      toast.error(error.message || 'Erro ao salvar produto');
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      stock_quantity: product.stock_quantity.toString(),
      image_url: product.image_url || ''
    });
    setShowAddProduct(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      toast.success('Produto excluído com sucesso!');
      loadDashboardData();

    } catch (error: any) {
      console.error('Erro ao excluir produto:', error);
      toast.error('Erro ao excluir produto');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'entregue': return 'bg-green-100 text-green-800';
      case 'saiu_entrega': return 'bg-blue-100 text-blue-800';
      case 'pronto_retirada': return 'bg-yellow-100 text-yellow-800';
      case 'em_preparo': return 'bg-orange-100 text-orange-800';
      case 'pedido_recebido': return 'bg-purple-100 text-purple-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pedido_recebido': return 'Pedido Recebido';
      case 'em_preparo': return 'Em Preparo';
      case 'pronto_retirada': return 'Pronto para Retirada';
      case 'saiu_entrega': return 'Saiu para Entrega';
      case 'entregue': return 'Entregue';
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
        <div className="flex items-center gap-4 mb-8">
          <Store className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Painel do Lojista</h1>
            <p className="text-muted-foreground">
              Gerencie seus produtos e acompanhe seus pedidos
            </p>
          </div>
        </div>

        {/* Status de Aprovação */}
        {!user.is_approved && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-full">
                  <Eye className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-orange-800">Conta em Análise</h3>
                  <p className="text-sm text-orange-700">
                    Sua conta está sendo analisada pela equipe. Você receberá uma notificação assim que for aprovada.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Pedidos
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Relatórios
            </TabsTrigger>
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="overview" className="space-y-6">
            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalProducts}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.activeProducts} ativos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pedidos Hoje</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.todayOrders}</div>
                  <p className="text-xs text-muted-foreground">
                    Total: {stats.totalOrders}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Faturamento</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ {stats.totalRevenue.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    Receita total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pedidos Pendentes</CardTitle>
                  <Truck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingOrders}</div>
                  <p className="text-xs text-muted-foreground">
                    Aguardando entrega
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Pedidos Recentes */}
            <Card>
              <CardHeader>
                <CardTitle>Pedidos Recentes</CardTitle>
                <CardDescription>
                  Últimos pedidos recebidos na sua loja
                </CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhum pedido ainda</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">#{order.id.slice(-8)}</span>
                            <Badge className={getStatusColor(order.status)}>
                              {getStatusText(order.status)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {order.customer_name} • {new Date(order.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">R$ {order.total_amount.toFixed(2)}</p>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Produtos */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Gerenciar Produtos</h2>
              <Button onClick={() => setShowAddProduct(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Novo Produto
              </Button>
            </div>

            {showAddProduct && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProductSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome do Produto *</Label>
                        <Input
                          id="name"
                          value={productForm.name}
                          onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category">Categoria *</Label>
                        <Select
                          value={productForm.category}
                          onValueChange={(value) => setProductForm(prev => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Filtros">Filtros</SelectItem>
                            <SelectItem value="Freios">Freios</SelectItem>
                            <SelectItem value="Elétrica">Elétrica</SelectItem>
                            <SelectItem value="Lubrificantes">Lubrificantes</SelectItem>
                            <SelectItem value="Ignição">Ignição</SelectItem>
                            <SelectItem value="Suspensão">Suspensão</SelectItem>
                            <SelectItem value="Motor">Motor</SelectItem>
                            <SelectItem value="Transmissão">Transmissão</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        value={productForm.description}
                        onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">Preço (R$) *</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={productForm.price}
                          onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="stock_quantity">Estoque *</Label>
                        <Input
                          id="stock_quantity"
                          type="number"
                          value={productForm.stock_quantity}
                          onChange={(e) => setProductForm(prev => ({ ...prev, stock_quantity: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="image_url">URL da Imagem</Label>
                        <Input
                          id="image_url"
                          value={productForm.image_url}
                          onChange={(e) => setProductForm(prev => ({ ...prev, image_url: e.target.value }))}
                          placeholder="https://..."
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button type="submit">
                        {editingProduct ? 'Atualizar Produto' : 'Cadastrar Produto'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowAddProduct(false);
                          setEditingProduct(null);
                          setProductForm({
                            name: '',
                            description: '',
                            price: '',
                            category: '',
                            stock_quantity: '',
                            image_url: ''
                          });
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <div className="aspect-video bg-muted relative">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                    <Badge className="absolute top-2 right-2">
                      {product.category}
                    </Badge>
                    {!product.is_active && (
                      <Badge variant="secondary" className="absolute top-2 left-2">
                        Inativo
                      </Badge>
                    )}
                  </div>

                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{product.description}</p>

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-primary">
                        R$ {product.price.toFixed(2)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Estoque: {product.stock_quantity}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditProduct(product)}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {products.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum produto cadastrado</h3>
                  <p className="text-muted-foreground mb-4">
                    Comece cadastrando seus primeiros produtos
                  </p>
                  <Button onClick={() => setShowAddProduct(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Cadastrar Primeiro Produto
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Pedidos */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Pedidos</CardTitle>
                <CardDescription>
                  Acompanhe e atualize o status dos pedidos da sua loja
                </CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhum pedido ainda</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <Card key={order.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold">#{order.id.slice(-8)}</span>
                                <Badge className={getStatusColor(order.status)}>
                                  {getStatusText(order.status)}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Cliente: {order.customer_name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Data: {new Date(order.created_at).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-lg">R$ {order.total_amount.toFixed(2)}</p>
                              <div className="flex gap-2 mt-2">
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4 mr-2" />
                                  Detalhes
                                </Button>
                                <Button variant="outline" size="sm">
                                  Atualizar Status
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Relatórios */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios e Estatísticas</CardTitle>
                <CardDescription>
                  Análise de desempenho da sua loja
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Relatórios em Desenvolvimento</h3>
                  <p className="text-muted-foreground">
                    Em breve você terá acesso a relatórios detalhados de vendas e performance
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
