-- Create coupons table
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL CHECK (discount_value > 0),
  min_order_value DECIMAL(10,2) DEFAULT 0,
  max_discount DECIMAL(10,2),
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  user_limit INTEGER DEFAULT 1,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create coupon_usage table to track who used which coupons
CREATE TABLE IF NOT EXISTS public.coupon_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  discount_amount DECIMAL(10,2) NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(coupon_id, order_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON public.coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_valid_until ON public.coupons(valid_until);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon_id ON public.coupon_usage(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user_id ON public.coupon_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_order_id ON public.coupon_usage(order_id);

-- Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for coupons
CREATE POLICY "Anyone can view active coupons"
  ON public.coupons FOR SELECT
  USING (is_active = true AND (valid_until IS NULL OR valid_until > NOW()));

CREATE POLICY "Admins can manage coupons"
  ON public.coupons FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for coupon_usage
CREATE POLICY "Users can view their own coupon usage"
  ON public.coupon_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert coupon usage"
  ON public.coupon_usage FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all coupon usage"
  ON public.coupon_usage FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Function to validate and apply coupon
CREATE OR REPLACE FUNCTION validate_coupon(
  p_code TEXT,
  p_user_id UUID,
  p_order_value DECIMAL
)
RETURNS TABLE (
  valid BOOLEAN,
  discount_amount DECIMAL,
  message TEXT
) AS $$
DECLARE
  v_coupon RECORD;
  v_usage_count INTEGER;
  v_calculated_discount DECIMAL;
BEGIN
  -- Get coupon details
  SELECT * INTO v_coupon
  FROM public.coupons
  WHERE code = p_code AND is_active = true;

  -- Check if coupon exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0::DECIMAL, 'Cupom inválido ou expirado';
    RETURN;
  END IF;

  -- Check if coupon is still valid
  IF v_coupon.valid_until IS NOT NULL AND v_coupon.valid_until < NOW() THEN
    RETURN QUERY SELECT false, 0::DECIMAL, 'Cupom expirado';
    RETURN;
  END IF;

  IF v_coupon.valid_from > NOW() THEN
    RETURN QUERY SELECT false, 0::DECIMAL, 'Cupom ainda não está válido';
    RETURN;
  END IF;

  -- Check minimum order value
  IF p_order_value < v_coupon.min_order_value THEN
    RETURN QUERY SELECT false, 0::DECIMAL, 
      'Valor mínimo do pedido: R$ ' || v_coupon.min_order_value::TEXT;
    RETURN;
  END IF;

  -- Check usage limit
  IF v_coupon.usage_limit IS NOT NULL AND v_coupon.usage_count >= v_coupon.usage_limit THEN
    RETURN QUERY SELECT false, 0::DECIMAL, 'Cupom esgotado';
    RETURN;
  END IF;

  -- Check user usage limit
  SELECT COUNT(*) INTO v_usage_count
  FROM public.coupon_usage
  WHERE coupon_id = v_coupon.id AND user_id = p_user_id;

  IF v_usage_count >= v_coupon.user_limit THEN
    RETURN QUERY SELECT false, 0::DECIMAL, 'Você já utilizou este cupom';
    RETURN;
  END IF;

  -- Calculate discount
  IF v_coupon.discount_type = 'percentage' THEN
    v_calculated_discount := (p_order_value * v_coupon.discount_value / 100);
    IF v_coupon.max_discount IS NOT NULL AND v_calculated_discount > v_coupon.max_discount THEN
      v_calculated_discount := v_coupon.max_discount;
    END IF;
  ELSE
    v_calculated_discount := v_coupon.discount_value;
  END IF;

  -- Ensure discount doesn't exceed order value
  IF v_calculated_discount > p_order_value THEN
    v_calculated_discount := p_order_value;
  END IF;

  RETURN QUERY SELECT true, v_calculated_discount, 'Cupom aplicado com sucesso!';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment coupon usage
CREATE OR REPLACE FUNCTION increment_coupon_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.coupons
  SET usage_count = usage_count + 1
  WHERE id = NEW.coupon_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for coupon usage
DROP TRIGGER IF EXISTS trigger_increment_coupon_usage ON coupon_usage;
CREATE TRIGGER trigger_increment_coupon_usage
  AFTER INSERT ON coupon_usage
  FOR EACH ROW
  EXECUTE FUNCTION increment_coupon_usage();
