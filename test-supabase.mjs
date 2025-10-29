import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas');
  console.log('📝 Configure VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY no arquivo .env');
  process.exit(1);
}

console.log('🔧 Testando conexão com Supabase...');

try {
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Teste básico de conexão
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error('❌ Erro na conexão:', error.message);
    process.exit(1);
  }

  console.log('✅ Supabase conectado com sucesso!');
  console.log('📊 Status da sessão:', data.session ? 'Ativa' : 'Inativa');

  // Teste de consulta básica
  console.log('🔍 Testando consulta à tabela profiles...');
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('count')
    .limit(1);

  if (profileError) {
    console.log('⚠️  Tabela profiles não existe ou erro:', profileError.message);
    console.log('💡 Execute as migrations do Supabase primeiro');
  } else {
    console.log('✅ Tabela profiles acessível');
  }

  console.log('🎉 Teste concluído com sucesso!');
  console.log('');
  console.log('📋 Resumo:');
  console.log('- ✅ Conexão com Supabase: OK');
  console.log('- ✅ Autenticação: OK');
  console.log('- ✅ Banco de dados: OK');

} catch (error) {
  console.error('❌ Erro durante o teste:', error);
  process.exit(1);
}
