-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('client', 'driver', 'admin');

-- Create enum for order status
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'driver_assigned', 'picked_up', 'out_for_delivery', 'delivered', 'cancelled');

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'client',
  full_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  cep TEXT,
  city TEXT,
  state TEXT,
  avatar_url TEXT,
  
  -- Driver specific fields
  vehicle_type TEXT,
  vehicle_plate TEXT,
  cnh_number TEXT,
  cnh_image_url TEXT,
  rejection_count INTEGER DEFAULT 0,
  is_blocked BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  
  -- Policies acceptance
  privacy_policy_accepted_at TIMESTAMP WITH TIME ZONE,
  work_policy_accepted_at TIMESTAMP WITH TIME ZONE,
  warranty_policy_accepted_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  stock INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES profiles(id),
  driver_id UUID REFERENCES profiles(id),
  
  status order_status DEFAULT 'pending',
  
  -- Delivery info
  delivery_address TEXT NOT NULL,
  delivery_cep TEXT NOT NULL,
  delivery_city TEXT NOT NULL,
  delivery_state TEXT NOT NULL,
  delivery_latitude DECIMAL(10,8),
  delivery_longitude DECIMAL(11,8),
  
  -- Pickup info
  pickup_address TEXT,
  pickup_latitude DECIMAL(10,8),
  pickup_longitude DECIMAL(11,8),
  
  -- Photos and signature
  pickup_photo_url TEXT,
  delivery_photo_url TEXT,
  signature_data TEXT,
  
  -- Pricing
  subtotal DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  
  -- Driver feedback
  driver_notes TEXT,
  issue_reported BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ratings table
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id),
  client_id UUID NOT NULL REFERENCES profiles(id),
  driver_id UUID NOT NULL REFERENCES profiles(id),
  
  delivery_rating INTEGER NOT NULL CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
  driver_rating INTEGER NOT NULL CHECK (driver_rating >= 1 AND driver_rating <= 5),
  app_rating INTEGER NOT NULL CHECK (app_rating >= 1 AND app_rating <= 5),
  
  comment TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create policies table
CREATE TABLE policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  version TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create promotions table
CREATE TABLE promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  discount_percentage DECIMAL(5,2),
  discount_amount DECIMAL(10,2),
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  target_role user_role,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create delivery_configs table
CREATE TABLE delivery_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  region TEXT NOT NULL,
  base_fee DECIMAL(10,2) NOT NULL,
  per_km_fee DECIMAL(10,2) NOT NULL,
  max_distance_km DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wallet_transactions table
CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID NOT NULL REFERENCES profiles(id),
  order_id UUID REFERENCES orders(id),
  amount DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Anyone can view driver profiles" ON profiles FOR SELECT USING (role = 'driver');

-- Products policies
CREATE POLICY "Anyone can view active products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage products" ON products FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Orders policies
CREATE POLICY "Clients can view their orders" ON orders FOR SELECT USING (client_id = auth.uid());
CREATE POLICY "Drivers can view their orders" ON orders FOR SELECT USING (driver_id = auth.uid());
CREATE POLICY "Clients can create orders" ON orders FOR INSERT WITH CHECK (client_id = auth.uid());
CREATE POLICY "Drivers can update their orders" ON orders FOR UPDATE USING (driver_id = auth.uid());

-- Order items policies
CREATE POLICY "Users can view order items" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE id = order_id AND (client_id = auth.uid() OR driver_id = auth.uid()))
);

-- Ratings policies
CREATE POLICY "Anyone can view ratings" ON ratings FOR SELECT USING (true);
CREATE POLICY "Clients can create ratings" ON ratings FOR INSERT WITH CHECK (client_id = auth.uid());

-- Policies table policies
CREATE POLICY "Anyone can view active policies" ON policies FOR SELECT USING (is_active = true);

-- Promotions policies
CREATE POLICY "Anyone can view active promotions" ON promotions FOR SELECT USING (is_active = true);

-- Delivery configs policies
CREATE POLICY "Anyone can view active delivery configs" ON delivery_configs FOR SELECT USING (is_active = true);

-- Wallet transactions policies
CREATE POLICY "Drivers can view their transactions" ON wallet_transactions FOR SELECT USING (driver_id = auth.uid());

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();