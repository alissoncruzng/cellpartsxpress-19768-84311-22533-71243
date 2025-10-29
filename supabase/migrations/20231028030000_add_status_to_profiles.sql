-- Adiciona a coluna status à tabela profiles se ela não existir
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'profiles' 
                 AND column_name = 'status') THEN
    ALTER TABLE public.profiles 
    ADD COLUMN status TEXT NOT NULL DEFAULT 'pending_registration';
    
    -- Cria um índice para melhorar consultas por status
    CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles (status);
    
    -- Comentário explicando os possíveis valores do status
    COMMENT ON COLUMN public.profiles.status IS 'Status do perfil: pending_registration, pending_approval, active, rejected, suspended';
    
    -- Atualiza os perfis existentes para terem status ativo
    UPDATE public.profiles 
    SET status = 'active' 
    WHERE status = 'pending_registration';
  END IF;
END $$;
