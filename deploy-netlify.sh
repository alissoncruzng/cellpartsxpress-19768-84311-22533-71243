#!/bin/bash

echo "🚀 Iniciando deploy para Netlify..."

# Verificar se está logado no Netlify
echo "🔐 Verificando login no Netlify..."
netlify status

if [ $? -ne 0 ]; then
    echo "❌ Você não está logado no Netlify!"
    echo "🔑 Execute: netlify login"
    exit 1
fi

# Verificar variáveis de ambiente
echo "🌍 Verificando variáveis de ambiente..."
echo "✅ Arquivo .env.example atualizado"
echo "✅ Arquivo .env.netlify criado"

# Build da aplicação
echo "🔨 Fazendo build da aplicação..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erro no build!"
    exit 1
fi

echo "✅ Build concluído com sucesso!"

# Deploy para Netlify
echo "📦 Fazendo deploy para Netlify..."
netlify deploy --prod --dir=dist

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deploy concluído com sucesso!"
    echo ""
    echo "📋 Próximos passos:"
    echo "1. ✅ Acesse seu site no Netlify"
    echo "2. ✅ Teste o login: admin@cellpartsxpress.com / admin123"
    echo "3. ✅ Configure as environment variables no Netlify Dashboard"
    echo "4. ✅ Verifique o Firebase Console"
    echo ""
    echo "📖 Consulte: GUIA-NETLIFY-DETALHADO.md"
else
    echo "❌ Erro no deploy!"
    exit 1
fi
