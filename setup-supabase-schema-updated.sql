-- ACR Delivery System - Schema Completo Atualizado
-- Baseado na documentação detalhada

-- ===========================================
-- TABELA: PROFILES (Perfis de Usuários)
-- ===========================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'client', 'wholesale', 'driver')),
  is_approved BOOLEAN DEFAULT FALSE,
  is_blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

  -- Campos específicos para clientes
  cpf TEXT UNIQUE,

  -- Campos específicos para lojistas
  cnpj TEXT UNIQUE,
  razao_social TEXT,
  nome_fantasia TEXT,
  logo_url TEXT,
  business_description TEXT,

  -- Campos específicos para motoboys
  cnh_number TEXT,
  cnh_image_url TEXT,
  vehicle_type TEXT CHECK (vehicle_type IN ('motocicleta', 'bicicleta', 'carro', 'van')),
  vehicle_plate TEXT,
  endereco_base JSONB,

  -- Endereço comum para todos
  address TEXT,
  address_number TEXT,
  complement TEXT,
  neighborhood TEXT,
  city TEXT,
  state TEXT,
  cep TEXT
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Perfis públicos são visíveis para todos os usuários autenticados"
  ON profiles FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins podem gerenciar todos os perfis"
  ON profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ===========================================
-- TABELA: PRODUCTS (Produtos/Catálogo)
-- ===========================================
CREATE TABLE public.products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  store_id UUID REFERENCES public.profiles(id) NOT NULL, -- Lojista que cadastrou
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  stock_quantity INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Políticas para produtos
CREATE POLICY "Produtos são visíveis para todos"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Lojistas podem gerenciar seus próprios produtos"
  ON products FOR ALL
  USING (
    auth.uid() = store_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'wholesale'
    )
  );

CREATE POLICY "Admins podem gerenciar todos os produtos"
  ON products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ===========================================
-- TABELA: ORDERS (Pedidos)
-- ===========================================
CREATE TABLE public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID REFERENCES public.profiles(id) NOT NULL,
  store_id UUID REFERENCES public.profiles(id) NOT NULL, -- Lojista
  delivery_driver_id UUID REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'pedido_recebido' CHECK (status IN ('pedido_recebido', 'em_preparo', 'pronto_retirada', 'saiu_entrega', 'entregue', 'cancelado')),
  delivery_address JSONB NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  estimated_delivery_time TIMESTAMP WITH TIME ZONE,
  actual_delivery_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Políticas para pedidos
CREATE POLICY "Clientes podem ver seus próprios pedidos"
  ON orders FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY "Lojistas podem ver pedidos da sua loja"
  ON orders FOR SELECT
  USING (auth.uid() = store_id);

CREATE POLICY "Entregadores podem ver pedidos atribuídos a eles"
  ON orders FOR SELECT
  USING (auth.uid() = delivery_driver_id);

CREATE POLICY "Clientes podem criar pedidos"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Clientes podem atualizar seus próprios pedidos (se pendente)"
  ON orders FOR UPDATE
  USING (
    auth.uid() = customer_id AND status IN ('pedido_recebido', 'em_preparo')
  );

CREATE POLICY "Lojistas podem atualizar pedidos da sua loja"
  ON orders FOR UPDATE
  USING (auth.uid() = store_id);

CREATE POLICY "Entregadores podem atualizar status de pedidos atribuídos"
  ON orders FOR UPDATE
  USING (auth.uid() = delivery_driver_id);

CREATE POLICY "Admins podem gerenciar todos os pedidos"
  ON orders FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ===========================================
-- TABELA: ORDER_ITEMS (Itens do Pedido)
-- ===========================================
CREATE TABLE public.order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Políticas para itens do pedido
CREATE POLICY "Itens são visíveis para cliente, lojista, entregador e admin"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (
        orders.customer_id = auth.uid()
        OR orders.store_id = auth.uid()
        OR orders.delivery_driver_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
      )
    )
  );

CREATE POLICY "Clientes podem adicionar itens ao seu pedido pendente"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.customer_id = auth.uid()
      AND orders.status IN ('pedido_recebido', 'em_preparo')
    )
  );

CREATE POLICY "Clientes podem atualizar itens do seu pedido pendente"
  ON order_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.customer_id = auth.uid()
      AND orders.status IN ('pedido_recebido', 'em_preparo')
    )
  );

CREATE POLICY "Admins podem gerenciar todos os itens"
  ON order_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ===========================================
-- TABELA: DELIVERIES (Entregas)
-- ===========================================
CREATE TABLE public.deliveries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  driver_id UUID REFERENCES public.profiles(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'recebida' CHECK (status IN ('recebida', 'retirada', 'em_rota', 'entregue', 'cancelada')),
  current_location JSONB,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;

-- Políticas para entregas
CREATE POLICY "Cliente e lojista podem ver entregas do pedido"
  ON deliveries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = deliveries.order_id
      AND (orders.customer_id = auth.uid() OR orders.store_id = auth.uid())
    )
  );

CREATE POLICY "Entregadores podem ver suas próprias entregas"
  ON deliveries FOR SELECT
  USING (auth.uid() = driver_id);

CREATE POLICY "Entregadores podem atualizar suas próprias entregas"
  ON deliveries FOR UPDATE
  USING (auth.uid() = driver_id);

CREATE POLICY "Admins podem gerenciar todas as entregas"
  ON deliveries FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ===========================================
-- TABELA: RATINGS (Avaliações)
-- ===========================================
CREATE TABLE public.ratings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.profiles(id) NOT NULL,
  driver_rating INTEGER CHECK (driver_rating >= 1 AND driver_rating <= 5),
  store_rating INTEGER CHECK (store_rating >= 1 AND store_rating <= 5),
  driver_comment TEXT,
  store_comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Políticas para avaliações
CREATE POLICY "Avaliações são públicas"
  ON ratings FOR SELECT
  USING (true);

CREATE POLICY "Clientes podem criar avaliações dos seus pedidos"
  ON ratings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = ratings.order_id
      AND orders.customer_id = auth.uid()
      AND orders.status = 'entregue'
    )
  );

CREATE POLICY "Clientes podem atualizar suas próprias avaliações"
  ON ratings FOR UPDATE
  USING (
    customer_id = auth.uid()
  );

-- ===========================================
-- TABELA: PAYMENTS (Pagamentos)
-- ===========================================
CREATE TABLE public.payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('pix', 'cartao_credito', 'cartao_debito', 'dinheiro')),
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'recusado', 'cancelado', 'reembolsado')),
  transaction_id TEXT UNIQUE,
  payment_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Políticas para pagamentos
CREATE POLICY "Cliente pode ver pagamentos do seu pedido"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = payments.order_id
      AND orders.customer_id = auth.uid()
    )
  );

CREATE POLICY "Admins podem gerenciar pagamentos"
  ON payments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ===========================================
-- FUNCTIONS E TRIGGERS
-- ===========================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger nas tabelas
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_deliveries_updated_at
  BEFORE UPDATE ON public.deliveries
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Função para criar perfil automaticamente após registro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'client')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ===========================================
-- STORAGE BUCKETS
-- ===========================================

-- Bucket para logos de lojas
INSERT INTO storage.buckets (id, name, public)
VALUES ('store-logos', 'store-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas para logos
CREATE POLICY "Logos de lojas são públicos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'store-logos');

CREATE POLICY "Lojistas podem fazer upload do logo da sua loja"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'store-logos'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'wholesale'
    )
  );

CREATE POLICY "Lojistas podem atualizar o logo da sua loja"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'store-logos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Bucket para imagens de produtos
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas para imagens de produtos
CREATE POLICY "Imagens de produtos são públicas"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Lojistas podem fazer upload de imagens dos seus produtos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'wholesale'
    )
  );

-- Manter buckets existentes
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('delivery-proofs', 'delivery-proofs', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('cnh-images', 'cnh-images', false)
ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- DADOS INICIAIS
-- ===========================================

-- Inserir admin padrão
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'admin@cellpartsxpress.com',
  crypt('Admin123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT DO NOTHING;

-- Inserir perfil admin
INSERT INTO public.profiles (id, email, full_name, role, is_approved)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'admin@cellpartsxpress.com',
  'Administrador do Sistema',
  'admin',
  true
) ON CONFLICT (id) DO NOTHING;
