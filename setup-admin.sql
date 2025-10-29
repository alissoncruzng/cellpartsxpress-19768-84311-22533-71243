-- Script para configurar Administrador Padrão
-- CellPartsXpress Delivery

-- 1. Criar usuário administrador no auth.users
-- Execute este comando no SQL Editor do Supabase:
-- IMPORTANTE: Substitua 'admin@cellpartsxpress.com' pela senha que você quiser

-- Primeiro, vamos verificar se o administrador já existe
DO $$
DECLARE
    admin_exists BOOLEAN := FALSE;
    admin_user_id UUID;
BEGIN
    -- Verificar se já existe um admin
    SELECT EXISTS(
        SELECT 1 FROM auth.users
        WHERE email = 'admin@cellpartsxpress.com'
    ) INTO admin_exists;

    IF admin_exists THEN
        RAISE NOTICE 'Administrador já existe no sistema';
    ELSE
        -- Criar usuário admin (você precisa executar isso manualmente no painel do Supabase)
        RAISE NOTICE 'Execute o seguinte comando no SQL Editor do Supabase para criar o admin:';
        RAISE NOTICE 'INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)';
        RAISE NOTICE 'VALUES (';
        RAISE NOTICE '  gen_random_uuid(),';
        RAISE NOTICE '  ''admin@cellpartsxpress.com'',';
        RAISE NOTICE '  crypt(''Admin123!'', gen_salt(''bf'')),';
        RAISE NOTICE '  NOW(),';
        RAISE NOTICE '  NOW(),';
        RAISE NOTICE '  NOW()';
        RAISE NOTICE ');';
    END IF;
END $$;

-- 2. Criar perfil do administrador (execute após criar o usuário auth)
-- IMPORTANTE: Substitua o UUID abaixo pelo ID real do usuário criado acima

INSERT INTO public.profiles (
  id,
  email,
  full_name,
  phone,
  role,
  is_approved,
  is_blocked,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@cellpartsxpress.com' LIMIT 1),
  'admin@cellpartsxpress.com',
  'Administrador do Sistema',
  '5511999999999',
  'admin',
  true,
  false,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  is_approved = EXCLUDED.is_approved,
  is_blocked = EXCLUDED.is_blocked,
  updated_at = NOW();

-- 3. Verificar se o administrador foi criado corretamente
SELECT
  u.email,
  p.full_name,
  p.role,
  p.is_approved,
  p.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'admin@cellpartsxpress.com';

-- 4. Credenciais de acesso:
-- Email: admin@cellpartsxpress.com
-- Senha: Admin123!
