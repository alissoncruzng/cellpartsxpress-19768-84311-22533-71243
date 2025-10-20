-- Criar tabela de provas de entrega (fotos e assinaturas)
CREATE TABLE IF NOT EXISTS public.delivery_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('foto_retirada', 'foto_entrega', 'assinatura')),
  file_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS na tabela delivery_proofs
ALTER TABLE public.delivery_proofs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para delivery_proofs
CREATE POLICY "Drivers can insert their own proofs"
  ON public.delivery_proofs
  FOR INSERT
  WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "Drivers can view their own proofs"
  ON public.delivery_proofs
  FOR SELECT
  USING (auth.uid() = driver_id);

CREATE POLICY "Clients can view proofs of their orders"
  ON public.delivery_proofs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = delivery_proofs.order_id 
      AND orders.client_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all proofs"
  ON public.delivery_proofs
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Criar tabela de logs de rejeição
CREATE TABLE IF NOT EXISTS public.rejection_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  motivo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS na tabela rejection_logs
ALTER TABLE public.rejection_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para rejection_logs
CREATE POLICY "Drivers can view their own rejections"
  ON public.rejection_logs
  FOR SELECT
  USING (auth.uid() = driver_id);

CREATE POLICY "System can insert rejection logs"
  ON public.rejection_logs
  FOR INSERT
  WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "Admins can view all rejection logs"
  ON public.rejection_logs
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_delivery_proofs_order_id ON public.delivery_proofs(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_proofs_driver_id ON public.delivery_proofs(driver_id);
CREATE INDEX IF NOT EXISTS idx_rejection_logs_driver_id ON public.rejection_logs(driver_id);
CREATE INDEX IF NOT EXISTS idx_rejection_logs_order_id ON public.rejection_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_rejection_logs_created_at ON public.rejection_logs(created_at DESC);