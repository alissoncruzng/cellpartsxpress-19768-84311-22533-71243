-- Create FCM tokens table for push notifications
CREATE TABLE IF NOT EXISTS public.fcm_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  device_type TEXT NOT NULL CHECK (device_type IN ('android', 'ios', 'web')),
  user_role TEXT NOT NULL CHECK (user_role IN ('client', 'driver', 'admin')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, token)
);

-- Create notifications table for tracking sent notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('new_order', 'order_update', 'delivery_assigned', 'delivery_completed', 'payment', 'promotion', 'system')),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_user_id ON public.fcm_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_active ON public.fcm_tokens(is_active);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);

-- Enable RLS
ALTER TABLE public.fcm_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for fcm_tokens
CREATE POLICY "Users can view their own FCM tokens"
  ON public.fcm_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own FCM tokens"
  ON public.fcm_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own FCM tokens"
  ON public.fcm_tokens FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own FCM tokens"
  ON public.fcm_tokens FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all FCM tokens"
  ON public.fcm_tokens FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Function to send notification when new order is created
CREATE OR REPLACE FUNCTION notify_drivers_new_order()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notification for all active drivers
  INSERT INTO public.notifications (user_id, title, body, type, order_id, data)
  SELECT 
    ur.user_id,
    'Novo Pedido Disponível! 🚚',
    'Um novo pedido está aguardando aceitação. Valor: R$ ' || NEW.delivery_fee::TEXT,
    'new_order',
    NEW.id,
    jsonb_build_object(
      'order_id', NEW.id,
      'delivery_fee', NEW.delivery_fee,
      'delivery_address', NEW.delivery_address,
      'url', '/driver/dashboard'
    )
  FROM public.user_roles ur
  WHERE ur.role = 'driver';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to notify client when order status changes
CREATE OR REPLACE FUNCTION notify_client_order_update()
RETURNS TRIGGER AS $$
DECLARE
  notification_title TEXT;
  notification_body TEXT;
BEGIN
  -- Only notify on status changes
  IF NEW.status != OLD.status THEN
    CASE NEW.status
      WHEN 'driver_assigned' THEN
        notification_title := 'Motorista Aceito! 🚗';
        notification_body := 'Um motorista aceitou seu pedido e está a caminho.';
      WHEN 'picked_up' THEN
        notification_title := 'Pedido Coletado! 📦';
        notification_body := 'Seu pedido foi coletado e está sendo preparado para entrega.';
      WHEN 'out_for_delivery' THEN
        notification_title := 'Saiu para Entrega! 🛵';
        notification_body := 'Seu pedido está a caminho! Acompanhe em tempo real.';
      WHEN 'delivered' THEN
        notification_title := 'Pedido Entregue! ✅';
        notification_body := 'Seu pedido foi entregue com sucesso. Obrigado pela preferência!';
      WHEN 'cancelled' THEN
        notification_title := 'Pedido Cancelado ❌';
        notification_body := 'Seu pedido foi cancelado.';
      ELSE
        RETURN NEW;
    END CASE;

    INSERT INTO public.notifications (user_id, title, body, type, order_id, data)
    VALUES (
      NEW.client_id,
      notification_title,
      notification_body,
      'order_update',
      NEW.id,
      jsonb_build_object(
        'order_id', NEW.id,
        'status', NEW.status,
        'url', '/order-tracking/' || NEW.id
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to notify driver when assigned
CREATE OR REPLACE FUNCTION notify_driver_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify when driver is newly assigned
  IF NEW.driver_id IS NOT NULL AND (OLD.driver_id IS NULL OR OLD.driver_id != NEW.driver_id) THEN
    INSERT INTO public.notifications (user_id, title, body, type, order_id, data)
    VALUES (
      NEW.driver_id,
      'Pedido Aceito! 🎉',
      'Você aceitou um pedido. Valor da entrega: R$ ' || NEW.delivery_fee::TEXT,
      'delivery_assigned',
      NEW.id,
      jsonb_build_object(
        'order_id', NEW.id,
        'delivery_fee', NEW.delivery_fee,
        'delivery_address', NEW.delivery_address,
        'url', '/driver/dashboard'
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_notify_drivers_new_order ON orders;
CREATE TRIGGER trigger_notify_drivers_new_order
  AFTER INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.status = 'pending')
  EXECUTE FUNCTION notify_drivers_new_order();

DROP TRIGGER IF EXISTS trigger_notify_client_order_update ON orders;
CREATE TRIGGER trigger_notify_client_order_update
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_client_order_update();

DROP TRIGGER IF EXISTS trigger_notify_driver_assignment ON orders;
CREATE TRIGGER trigger_notify_driver_assignment
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_driver_assignment();
