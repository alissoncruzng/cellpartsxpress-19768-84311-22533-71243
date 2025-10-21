-- Create function to add wallet transaction when order is delivered
CREATE OR REPLACE FUNCTION add_driver_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create transaction when status changes to delivered and driver is assigned
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' AND NEW.driver_id IS NOT NULL THEN
    INSERT INTO public.wallet_transactions (
      driver_id,
      order_id,
      amount,
      type,
      description
    ) VALUES (
      NEW.driver_id,
      NEW.id,
      NEW.delivery_fee,
      'credit',
      'Pagamento pela entrega #' || LEFT(NEW.id::text, 8)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_add_driver_payment ON orders;
CREATE TRIGGER trigger_add_driver_payment
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION add_driver_payment();