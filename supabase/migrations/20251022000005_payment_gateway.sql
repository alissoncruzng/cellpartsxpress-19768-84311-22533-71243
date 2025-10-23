-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('pix', 'credit_card', 'debit_card', 'cash')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled')),
  
  -- PIX data
  pix_qr_code TEXT,
  pix_qr_code_base64 TEXT,
  pix_copy_paste TEXT,
  pix_expiration TIMESTAMP WITH TIME ZONE,
  
  -- Card data (tokenized)
  card_token TEXT,
  card_last_digits TEXT,
  card_brand TEXT,
  
  -- Gateway data
  gateway_provider TEXT CHECK (gateway_provider IN ('stripe', 'mercadopago', 'asaas', 'pagseguro')),
  gateway_transaction_id TEXT,
  gateway_response JSONB,
  
  -- Metadata
  ip_address TEXT,
  user_agent TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  refunded_at TIMESTAMP WITH TIME ZONE,
  refund_reason TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  UNIQUE(order_id)
);

-- Create payment_webhooks table for logging
CREATE TABLE IF NOT EXISTS public.payment_webhooks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_gateway_transaction ON public.payments(gateway_transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_webhooks_processed ON public.payment_webhooks(processed);
CREATE INDEX IF NOT EXISTS idx_payment_webhooks_provider ON public.payment_webhooks(provider);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_webhooks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payments
CREATE POLICY "Users can view their own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create payments for their orders"
  ON public.payments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = order_id AND client_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all payments"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update payments"
  ON public.payments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for payment_webhooks
CREATE POLICY "System can insert webhooks"
  ON public.payment_webhooks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view webhooks"
  ON public.payment_webhooks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Function to update order status when payment is completed
CREATE OR REPLACE FUNCTION update_order_on_payment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_status = 'completed' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'completed') THEN
    UPDATE public.orders
    SET 
      status = 'confirmed',
      updated_at = NOW()
    WHERE id = NEW.order_id;
    
    -- Log audit
    INSERT INTO public.audit_logs (
      user_id,
      action,
      entity_type,
      entity_id,
      new_data
    ) VALUES (
      NEW.user_id,
      'payment_completed',
      'payment',
      NEW.id,
      jsonb_build_object(
        'order_id', NEW.order_id,
        'amount', NEW.amount,
        'method', NEW.payment_method
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_order_on_payment ON payments;
CREATE TRIGGER trigger_update_order_on_payment
  AFTER INSERT OR UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_order_on_payment();

-- Function to check payment expiration
CREATE OR REPLACE FUNCTION check_payment_expiration()
RETURNS void AS $$
BEGIN
  UPDATE public.payments
  SET 
    payment_status = 'cancelled',
    updated_at = NOW()
  WHERE 
    payment_status = 'pending' AND
    payment_method = 'pix' AND
    pix_expiration IS NOT NULL AND
    pix_expiration < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
