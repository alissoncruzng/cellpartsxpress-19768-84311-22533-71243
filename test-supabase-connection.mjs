// Teste simplificado da conexão Supabase - CellPartsXpress Delivery
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase (substitua pelas suas)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://seu-projeto.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sua-chave-publica';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔍 Testando conexão com Supabase...\n');

  try {
    // Teste 1: Conexão básica
    console.log('1. Testando conexão básica...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });

    if (connectionError) {
      console.error('❌ Erro na conexão:', connectionError.message);
      return;
    }
    console.log('✅ Conexão estabelecida com sucesso\n');

    // Teste 2: Verificar tabelas
    console.log('2. Verificando tabelas existentes...');
    const tables = ['profiles', 'products', 'orders', 'order_items', 'delivery_tracking', 'payments'];

    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        if (error) {
          console.log(`❌ Tabela '${table}': ${error.message}`);
        } else {
          console.log(`✅ Tabela '${table}': OK (${count} registros)`);
        }
      } catch (err) {
        console.log(`❌ Tabela '${table}': Erro ao verificar`);
      }
    }
    console.log('');

    // Teste 3: Verificar buckets de storage
    console.log('3. Verificando buckets de storage...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    if (bucketsError) {
      console.error('❌ Erro ao verificar buckets:', bucketsError.message);
    } else {
      const expectedBuckets = ['avatars', 'delivery-proofs'];
      expectedBuckets.forEach(expectedBucket => {
        const bucket = buckets.find(b => b.name === expectedBucket);
        if (bucket) {
          console.log(`✅ Bucket '${expectedBucket}': OK`);
        } else {
          console.log(`❌ Bucket '${expectedBucket}': Não encontrado`);
        }
      });
    }
    console.log('');

    // Teste 4: Verificar produtos de exemplo
    console.log('4. Verificando produtos de exemplo...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('name, price, category')
      .limit(5);

    if (productsError) {
      console.error('❌ Erro ao buscar produtos:', productsError.message);
    } else if (products && products.length > 0) {
      console.log('✅ Produtos encontrados:');
      products.forEach(product => {
        console.log(`   - ${product.name} (${product.category}): R$ ${product.price}`);
      });
    } else {
      console.log('⚠️  Nenhum produto encontrado (execute o script SQL primeiro)');
    }

    console.log('\n🎉 Teste concluído!');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar teste
testConnection();
