-- CellPartsXpress Delivery - Schema Completo
-- Criado para ambiente Supabase

-- Habilitar UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- TABELA: PROFILES (Perfis de Usuários)
-- ===========================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'cliente' CHECK (role IN ('admin', 'entregador', 'cliente')),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
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

CREATE POLICY "Apenas admins podem gerenciar produtos"
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
  delivery_driver_id UUID REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmado', 'preparando', 'pronto_entrega', 'saiu_entrega', 'entregue', 'cancelado')),
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

CREATE POLICY "Entregadores podem ver pedidos atribuídos a eles"
  ON orders FOR SELECT
  USING (auth.uid() = delivery_driver_id);

CREATE POLICY "Clientes podem criar pedidos"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Clientes podem atualizar seus próprios pedidos (se pendente)"
  ON orders FOR UPDATE
  USING (
    auth.uid() = customer_id AND status = 'pendente'
  );

CREATE POLICY "Entregadores podem atualizar status de pedidos atribuídos"
  ON orders FOR UPDATE
  USING (
    auth.uid() = delivery_driver_id
  );

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
CREATE POLICY "Itens são visíveis para cliente, entregador e admin"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (
        orders.customer_id = auth.uid()
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
      AND orders.status = 'pendente'
    )
  );

CREATE POLICY "Clientes podem atualizar itens do seu pedido pendente"
  ON order_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.customer_id = auth.uid()
      AND orders.status = 'pendente'
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
-- TABELA: DELIVERY_TRACKING (Rastreamento de Entregas)
-- ===========================================
CREATE TABLE public.delivery_tracking (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  driver_id UUID REFERENCES public.profiles(id) NOT NULL,
  status TEXT NOT NULL,
  location JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.delivery_tracking ENABLE ROW LEVEL SECURITY;

-- Políticas para rastreamento
CREATE POLICY "Cliente e entregador podem ver rastreamento do pedido"
  ON delivery_tracking FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = delivery_tracking.order_id
      AND (orders.customer_id = auth.uid() OR orders.delivery_driver_id = auth.uid())
    )
  );

CREATE POLICY "Entregadores podem adicionar rastreamento aos seus pedidos"
  ON delivery_tracking FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = delivery_tracking.order_id
      AND orders.delivery_driver_id = auth.uid()
    )
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

CREATE TRIGGER handle_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Função para criar perfil automaticamente após registro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Função para calcular total do pedido
CREATE OR REPLACE FUNCTION public.calculate_order_total(order_uuid UUID)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  total DECIMAL(10,2) := 0;
BEGIN
  SELECT COALESCE(SUM(total_price), 0) + COALESCE(delivery_fee, 0)
  INTO total
  FROM orders
  LEFT JOIN order_items ON orders.id = order_items.order_id
  WHERE orders.id = order_uuid
  GROUP BY orders.id, orders.delivery_fee;

  RETURN total;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- STORAGE BUCKETS
-- ===========================================

-- Bucket para avatares
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas para avatars
CREATE POLICY "Avatares são públicos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Usuários podem fazer upload do próprio avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Usuários podem atualizar o próprio avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Usuários podem deletar o próprio avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Bucket para comprovantes de entrega
INSERT INTO storage.buckets (id, name, public)
VALUES ('delivery-proofs', 'delivery-proofs', false)
ON CONFLICT (id) DO NOTHING;

-- Políticas para comprovantes (privados)
CREATE POLICY "Cliente e entregador podem ver comprovantes do pedido"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'delivery-proofs'
    AND EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id::text = (storage.foldername(name))[1]
      AND (orders.customer_id = auth.uid() OR orders.delivery_driver_id = auth.uid())
    )
  );

CREATE POLICY "Entregadores podem fazer upload de comprovantes"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'delivery-proofs'
    AND EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id::text = (storage.foldername(name))[1]
      AND orders.delivery_driver_id = auth.uid()
    )
  );

CREATE POLICY "Admins podem gerenciar todos os comprovantes"
  ON storage.objects FOR ALL
  USING (
    bucket_id IN ('avatars', 'delivery-proofs')
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ===========================================
-- DADOS INICIAIS (OPCIONAIS)
-- ===========================================

-- Inserir admin padrão (você pode ajustar)
-- INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
-- VALUES (
--   '550e8400-e29b-41d4-a716-446655440000',
--   'admin@cellpartsxpress.com',
--   crypt('senha_admin', gen_salt('bf')),
--   NOW(),
--   NOW(),
--   NOW()
-- ) ON CONFLICT DO NOTHING;

-- Inserir perfil admin
-- INSERT INTO public.profiles (id, email, full_name, role)
-- VALUES (
--   '550e8400-e29b-41d4-a716-446655440000',
--   'admin@cellpartsxpress.com',
--   'Administrador',
--   'admin'
-- ) ON CONFLICT (id) DO NOTHING;

-- Alguns produtos de exemplo
INSERT INTO public.products (name, description, price, category, stock_quantity) VALUES
('Filtro de Óleo', 'Filtro de óleo para motores', 25.00, 'Filtros', 100),
('Pastilha de Freio', 'Pastilha de freio dianteira', 85.00, 'Freios', 50),
('Bateria 60Ah', 'Bateria automotiva 60Ah', 180.00, 'Elétrica', 20),
('Óleo de Motor 5W30', 'Óleo sintético 5W30 1L', 35.00, 'Lubrificantes', 80),
('Velas de Ignição', 'Jogo com 4 velas', 45.00, 'Ignição', 60)
ON CONFLICT DO NOTHING;
