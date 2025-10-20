-- Criar bucket para imagens de produtos
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas RLS para o bucket product-images
CREATE POLICY "Public can view product images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images' 
    AND has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can update product images"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'product-images' 
    AND has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can delete product images"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'product-images' 
    AND has_role(auth.uid(), 'admin')
  );

-- Criar bucket para provas de entrega (fotos e assinaturas)
INSERT INTO storage.buckets (id, name, public)
VALUES ('delivery-proofs', 'delivery-proofs', false)
ON CONFLICT (id) DO NOTHING;

-- Políticas RLS para delivery-proofs
CREATE POLICY "Drivers can upload delivery proofs"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'delivery-proofs');

CREATE POLICY "Users can view their delivery proofs"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'delivery-proofs' 
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR has_role(auth.uid(), 'admin')
    )
  );