-- Add status column to profiles for driver management
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive'));

-- Add reason for suspension
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS suspension_reason TEXT;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS suspended_by UUID REFERENCES auth.users(id);

-- Create audit log table for LGPD compliance
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON public.audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON public.audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audit_logs
CREATE POLICY "Admins can view all audit logs"
  ON public.audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "System can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);

-- Function to log profile changes
CREATE OR REPLACE FUNCTION log_profile_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log status changes
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO public.audit_logs (
      user_id,
      admin_id,
      action,
      entity_type,
      entity_id,
      old_data,
      new_data
    ) VALUES (
      NEW.id,
      NEW.suspended_by,
      CASE 
        WHEN NEW.status = 'suspended' THEN 'driver_suspended'
        WHEN NEW.status = 'active' THEN 'driver_activated'
        WHEN NEW.status = 'inactive' THEN 'driver_deactivated'
      END,
      'profile',
      NEW.id,
      jsonb_build_object('status', OLD.status),
      jsonb_build_object('status', NEW.status, 'reason', NEW.suspension_reason)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for profile changes
DROP TRIGGER IF EXISTS trigger_log_profile_changes ON profiles;
CREATE TRIGGER trigger_log_profile_changes
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION log_profile_changes();

-- Function to log order changes
CREATE OR REPLACE FUNCTION log_order_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO public.audit_logs (
      user_id,
      action,
      entity_type,
      entity_id,
      old_data,
      new_data
    ) VALUES (
      NEW.client_id,
      'order_status_changed',
      'order',
      NEW.id,
      jsonb_build_object('status', OLD.status),
      jsonb_build_object('status', NEW.status)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for order changes
DROP TRIGGER IF EXISTS trigger_log_order_changes ON orders;
CREATE TRIGGER trigger_log_order_changes
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION log_order_changes();

-- Function to prevent suspended drivers from accepting orders
CREATE OR REPLACE FUNCTION check_driver_status()
RETURNS TRIGGER AS $$
DECLARE
  driver_status TEXT;
BEGIN
  IF NEW.driver_id IS NOT NULL THEN
    SELECT status INTO driver_status
    FROM public.profiles
    WHERE id = NEW.driver_id;
    
    IF driver_status = 'suspended' THEN
      RAISE EXCEPTION 'Driver is suspended and cannot accept orders';
    END IF;
    
    IF driver_status = 'inactive' THEN
      RAISE EXCEPTION 'Driver is inactive and cannot accept orders';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to check driver status
DROP TRIGGER IF EXISTS trigger_check_driver_status ON orders;
CREATE TRIGGER trigger_check_driver_status
  BEFORE INSERT OR UPDATE OF driver_id ON orders
  FOR EACH ROW
  EXECUTE FUNCTION check_driver_status();
