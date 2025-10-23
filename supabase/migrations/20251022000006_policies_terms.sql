-- Create policies table for terms and privacy policy
CREATE TABLE IF NOT EXISTS public.policies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('terms', 'privacy', 'cookies')),
  version TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  effective_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(type, version)
);

-- Create policy_acceptances table
CREATE TABLE IF NOT EXISTS public.policy_acceptances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  policy_id UUID NOT NULL REFERENCES public.policies(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  accepted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, policy_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_policies_type ON public.policies(type);
CREATE INDEX IF NOT EXISTS idx_policies_is_active ON public.policies(is_active);
CREATE INDEX IF NOT EXISTS idx_policy_acceptances_user_id ON public.policy_acceptances(user_id);
CREATE INDEX IF NOT EXISTS idx_policy_acceptances_policy_id ON public.policy_acceptances(policy_id);

-- Enable RLS
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_acceptances ENABLE ROW LEVEL SECURITY;

-- RLS Policies for policies
CREATE POLICY "Anyone can view active policies"
  ON public.policies FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage policies"
  ON public.policies FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for policy_acceptances
CREATE POLICY "Users can view their own acceptances"
  ON public.policy_acceptances FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can accept policies"
  ON public.policy_acceptances FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all acceptances"
  ON public.policy_acceptances FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Function to check if user has accepted current policies
CREATE OR REPLACE FUNCTION check_policy_acceptance(p_user_id UUID, p_type TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_policy_id UUID;
  v_accepted BOOLEAN;
BEGIN
  -- Get current active policy
  SELECT id INTO v_current_policy_id
  FROM public.policies
  WHERE type = p_type AND is_active = true
  ORDER BY effective_date DESC
  LIMIT 1;
  
  IF v_current_policy_id IS NULL THEN
    RETURN true; -- No policy exists
  END IF;
  
  -- Check if user has accepted
  SELECT EXISTS (
    SELECT 1 FROM public.policy_acceptances
    WHERE user_id = p_user_id AND policy_id = v_current_policy_id
  ) INTO v_accepted;
  
  RETURN v_accepted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default policies
INSERT INTO public.policies (type, version, title, content, is_active, effective_date) VALUES
(
  'terms',
  '1.0',
  'Termos de Uso - ACR Delivery',
  E'# Termos de Uso\n\n## 1. Aceitação dos Termos\nAo utilizar o ACR Delivery, você concorda com estes termos.\n\n## 2. Serviços Oferecidos\nO ACR Delivery é uma plataforma de entrega que conecta clientes, motoristas e estabelecimentos.\n\n## 3. Responsabilidades do Usuário\n- Fornecer informações verdadeiras\n- Manter a confidencialidade da conta\n- Usar o serviço de forma legal\n\n## 4. Pagamentos\n- Os pagamentos são processados de forma segura\n- Taxas de entrega são calculadas automaticamente\n\n## 5. Cancelamentos\n- Pedidos podem ser cancelados conforme política\n- Reembolsos seguem as regras estabelecidas\n\n## 6. Propriedade Intelectual\nTodo conteúdo é propriedade do ACR Delivery.\n\n## 7. Limitação de Responsabilidade\nO ACR Delivery não se responsabiliza por danos indiretos.\n\n## 8. Alterações nos Termos\nPodemos atualizar estes termos a qualquer momento.\n\n## 9. Contato\nPara dúvidas: contato@acrdelivery.com',
  true,
  NOW()
),
(
  'privacy',
  '1.0',
  'Política de Privacidade - ACR Delivery',
  E'# Política de Privacidade\n\n## 1. Informações que Coletamos\n- Dados de cadastro (nome, email, telefone)\n- Endereços de entrega\n- Histórico de pedidos\n- Localização (para motoristas)\n\n## 2. Como Usamos suas Informações\n- Processar pedidos\n- Melhorar nossos serviços\n- Comunicação sobre pedidos\n- Análises e estatísticas\n\n## 3. Compartilhamento de Dados\n- Com motoristas (para entregas)\n- Com estabelecimentos (para pedidos)\n- Não vendemos seus dados\n\n## 4. Segurança\n- Criptografia de dados sensíveis\n- Acesso restrito a informações\n- Monitoramento de segurança\n\n## 5. Seus Direitos (LGPD)\n- Acesso aos seus dados\n- Correção de dados\n- Exclusão de dados\n- Portabilidade\n\n## 6. Cookies\nUsamos cookies para melhorar a experiência.\n\n## 7. Retenção de Dados\nMantemos dados pelo tempo necessário.\n\n## 8. Alterações na Política\nPodemos atualizar esta política.\n\n## 9. Contato\nDPO: privacidade@acrdelivery.com',
  true,
  NOW()
);
