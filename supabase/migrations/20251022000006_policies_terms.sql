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
    public.has_role(auth.uid(), 'admin')
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
    public.has_role(auth.uid(), 'admin')
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

INSERT INTO public.policies (type, version, title, content, is_active, effective_date) VALUES
(
  'terms',
  '1.0',
  'Termos de Uso - ACR Delivery',
  E'# Termos de Uso

## 1. Aceitação dos Termos
Ao utilizar o ACR Delivery, você concorda com estes termos.

## 2. Serviços Oferecidos
O ACR Delivery é uma plataforma de entrega que conecta clientes, motoristas e estabelecimentos.

## 3. Responsabilidades do Usuário
- Fornecer informações verdadeiras
- Manter a confidencialidade da conta
- Usar o serviço de forma legal

## 4. Pagamentos
- Os pagamentos são processados de forma segura
- Taxas de entrega são calculadas automaticamente

## 5. Cancelamentos
- Pedidos podem ser cancelados conforme política
- Reembolsos seguem as regras estabelecidas

## 6. Propriedade Intelectual
Todo conteúdo é propriedade do ACR Delivery.

## 7. Limitação de Responsabilidade
O ACR Delivery não se responsabiliza por danos indiretos.

## 8. Alterações nos Termos
Podemos atualizar estes termos a qualquer momento.

## 9. Contato
Para dúvidas: contato@acrdelivery.com',
  true,
  NOW()
),
(
  'privacy',
  '1.0',
  'Política de Privacidade - ACR Delivery',
  E'# Política de Privacidade

## 1. Informações que Coletamos
- Dados de cadastro (nome, email, telefone)
- Endereços de entrega
- Histórico de pedidos
- Localização (para motoristas)

## 2. Como Usamos suas Informações
- Processar pedidos
- Melhorar nossos serviços
- Comunicação sobre pedidos
- Análises e estatísticas

## 3. Compartilhamento de Dados
- Com motoristas (para entregas)
- Com estabelecimentos (para pedidos)
- Não vendemos seus dados

## 4. Segurança
- Criptografia de dados sensíveis
- Acesso restrito a informações
- Monitoramento de segurança

## 5. Seus Direitos (LGPD)
- Acesso aos seus dados
- Correção de dados
- Exclusão de dados
- Portabilidade

## 6. Cookies
Usamos cookies para melhorar a experiência.

## 7. Retenção de Dados
Mantemos dados pelo tempo necessário.

## 8. Alterações na Política
Podemos atualizar esta política.

## 9. Contato
DPO: privacidade@acrdelivery.com',
  true,
  NOW()
),
(
  'cookies',
  '1.0',
  'Política de Cookies - ACR Delivery',
  E'# Política de Cookies

## 1. O que são Cookies
Cookies são pequenos arquivos de texto armazenados no seu dispositivo.

## 2. Como Usamos Cookies
- Melhorar a experiência do usuário
- Manter você logado
- Analisar o uso do site
- Personalizar conteúdo

## 3. Tipos de Cookies
- **Essenciais**: Necessários para o funcionamento do site
- **Analíticos**: Para entender como você usa o site
- **Funcionais**: Para lembrar suas preferências
- **Marketing**: Para anúncios relevantes

## 4. Gerenciamento de Cookies
Você pode gerenciar cookies nas configurações do seu navegador.

## 5. Alterações na Política
Podemos atualizar esta política de cookies.

## 6. Contato
Para dúvidas: contato@acrdelivery.com',
  true,
  NOW()
);

-- Create trigger for updated_at on policies
CREATE TRIGGER update_policies_updated_at BEFORE UPDATE ON public.policies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
