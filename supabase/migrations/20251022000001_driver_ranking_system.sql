-- Create driver_stats table for ranking and performance
CREATE TABLE IF NOT EXISTS public.driver_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_deliveries INTEGER DEFAULT 0,
  completed_deliveries INTEGER DEFAULT 0,
  cancelled_deliveries INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  total_earnings DECIMAL(10,2) DEFAULT 0.00,
  on_time_deliveries INTEGER DEFAULT 0,
  late_deliveries INTEGER DEFAULT 0,
  acceptance_rate DECIMAL(5,2) DEFAULT 100.00,
  total_accepted INTEGER DEFAULT 0,
  total_rejected INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(driver_id)
);

-- Create driver_ratings table
CREATE TABLE IF NOT EXISTS public.driver_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(order_id)
);

-- Create withdrawal_requests table for driver wallet withdrawals
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('pix', 'bank_transfer')),
  pix_key TEXT,
  bank_name TEXT,
  bank_account TEXT,
  bank_agency TEXT,
  rejection_reason TEXT,
  processed_by UUID REFERENCES auth.users(id),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_driver_stats_driver_id ON public.driver_stats(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_ratings_driver_id ON public.driver_ratings(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_ratings_order_id ON public.driver_ratings(order_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_driver_id ON public.withdrawal_requests(driver_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON public.withdrawal_requests(status);

-- Function to update driver stats when order is completed
CREATE OR REPLACE FUNCTION update_driver_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update when status changes to delivered or cancelled
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' AND NEW.driver_id IS NOT NULL THEN
    -- Insert or update driver stats
    INSERT INTO public.driver_stats (driver_id, total_deliveries, completed_deliveries)
    VALUES (NEW.driver_id, 1, 1)
    ON CONFLICT (driver_id) 
    DO UPDATE SET 
      total_deliveries = driver_stats.total_deliveries + 1,
      completed_deliveries = driver_stats.completed_deliveries + 1,
      total_earnings = driver_stats.total_earnings + NEW.delivery_fee,
      updated_at = NOW();
      
  ELSIF NEW.status = 'cancelled' AND OLD.status != 'cancelled' AND NEW.driver_id IS NOT NULL THEN
    INSERT INTO public.driver_stats (driver_id, total_deliveries, cancelled_deliveries)
    VALUES (NEW.driver_id, 1, 1)
    ON CONFLICT (driver_id) 
    DO UPDATE SET 
      total_deliveries = driver_stats.total_deliveries + 1,
      cancelled_deliveries = driver_stats.cancelled_deliveries + 1,
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for driver stats
DROP TRIGGER IF EXISTS trigger_update_driver_stats ON orders;
CREATE TRIGGER trigger_update_driver_stats
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_driver_stats();

-- Function to update driver rating average
CREATE OR REPLACE FUNCTION update_driver_rating_average()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.driver_stats
  SET 
    average_rating = (
      SELECT AVG(rating)::DECIMAL(3,2)
      FROM public.driver_ratings
      WHERE driver_id = NEW.driver_id
    ),
    updated_at = NOW()
  WHERE driver_id = NEW.driver_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for rating updates
DROP TRIGGER IF EXISTS trigger_update_driver_rating_average ON driver_ratings;
CREATE TRIGGER trigger_update_driver_rating_average
  AFTER INSERT OR UPDATE ON driver_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_driver_rating_average();

-- Function to track acceptance rate
CREATE OR REPLACE FUNCTION update_acceptance_rate()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'orders' THEN
    -- When driver accepts order
    IF NEW.driver_id IS NOT NULL AND OLD.driver_id IS NULL THEN
      INSERT INTO public.driver_stats (driver_id, total_accepted)
      VALUES (NEW.driver_id, 1)
      ON CONFLICT (driver_id) 
      DO UPDATE SET 
        total_accepted = driver_stats.total_accepted + 1,
        acceptance_rate = ((driver_stats.total_accepted + 1)::DECIMAL / 
                          NULLIF((driver_stats.total_accepted + driver_stats.total_rejected + 1), 0) * 100),
        updated_at = NOW();
    END IF;
  ELSIF TG_TABLE_NAME = 'rejection_logs' THEN
    -- When driver rejects order
    INSERT INTO public.driver_stats (driver_id, total_rejected)
    VALUES (NEW.driver_id, 1)
    ON CONFLICT (driver_id) 
    DO UPDATE SET 
      total_rejected = driver_stats.total_rejected + 1,
      acceptance_rate = (driver_stats.total_accepted::DECIMAL / 
                        NULLIF((driver_stats.total_accepted + driver_stats.total_rejected + 1), 0) * 100),
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for acceptance rate
DROP TRIGGER IF EXISTS trigger_update_acceptance_rate_accept ON orders;
CREATE TRIGGER trigger_update_acceptance_rate_accept
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_acceptance_rate();

DROP TRIGGER IF EXISTS trigger_update_acceptance_rate_reject ON rejection_logs;
CREATE TRIGGER trigger_update_acceptance_rate_reject
  AFTER INSERT ON rejection_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_acceptance_rate();

-- Enable RLS
ALTER TABLE public.driver_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for driver_stats
CREATE POLICY "Drivers can view their own stats"
  ON public.driver_stats FOR SELECT
  USING (auth.uid() = driver_id);

CREATE POLICY "Admins can view all driver stats"
  ON public.driver_stats FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for driver_ratings
CREATE POLICY "Anyone can view ratings"
  ON public.driver_ratings FOR SELECT
  USING (true);

CREATE POLICY "Clients can insert ratings for their orders"
  ON public.driver_ratings FOR INSERT
  WITH CHECK (auth.uid() = client_id);

-- RLS Policies for withdrawal_requests
CREATE POLICY "Drivers can view their own withdrawal requests"
  ON public.withdrawal_requests FOR SELECT
  USING (auth.uid() = driver_id);

CREATE POLICY "Drivers can create withdrawal requests"
  ON public.withdrawal_requests FOR INSERT
  WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "Admins can view all withdrawal requests"
  ON public.withdrawal_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update withdrawal requests"
  ON public.withdrawal_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
