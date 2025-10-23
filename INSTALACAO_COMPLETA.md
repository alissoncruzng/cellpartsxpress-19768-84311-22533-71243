# 🚀 Guia de Instalação Completa - ACR Delivery

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta no Supabase
- Conta no Firebase (para notificações)
- Conta no Google Cloud (para Google Maps API)

---

## 1️⃣ Instalação de Dependências

```bash
# Instalar todas as dependências
npm install

# Instalar dependências adicionais necessárias
npm install firebase react-markdown
```

---

## 2️⃣ Configuração do Supabase

### Aplicar Migrations

Acesse o Supabase Dashboard > SQL Editor e execute os arquivos na ordem:

```sql
-- 1. Sistema de ranking e carteira
supabase/migrations/20251022000001_driver_ranking_system.sql

-- 2. Notificações FCM
supabase/migrations/20251022000002_fcm_notifications.sql

-- 3. Gestão de motoristas e auditoria
supabase/migrations/20251022000003_driver_management.sql

-- 4. Sistema de cupons
supabase/migrations/20251022000004_coupons_system.sql

-- 5. Gateway de pagamento
supabase/migrations/20251022000005_payment_gateway.sql

-- 6. Políticas e termos
supabase/migrations/20251022000006_policies_terms.sql
```

### Regenerar Types

```bash
npx supabase gen types typescript --project-id SEU_PROJECT_ID > src/integrations/supabase/types.ts
```

---

## 3️⃣ Configuração do Firebase

### Criar Projeto Firebase

1. Acesse https://console.firebase.google.com/
2. Crie um novo projeto
3. Ative o Firebase Cloud Messaging (FCM)
4. Gere as credenciais Web Push (VAPID Key)

### Configurar Service Worker

Edite `public/firebase-messaging-sw.js` e substitua as credenciais:

```javascript
firebase.initializeApp({
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_PROJETO.appspot.com",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID"
});
```

---

## 4️⃣ Configuração do Google Maps

1. Acesse https://console.cloud.google.com/
2. Crie/selecione um projeto
3. Ative as APIs:
   - Maps JavaScript API
   - Directions API
   - Geocoding API
4. Crie uma API Key

---

## 5️⃣ Configurar Variáveis de Ambiente

Crie o arquivo `.env` na raiz do projeto:

```env
# Supabase
VITE_SUPABASE_PROJECT_ID="seu-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="sua-publishable-key"
VITE_SUPABASE_URL="https://seu-project.supabase.co"

# Firebase Cloud Messaging
VITE_FIREBASE_API_KEY="sua-api-key"
VITE_FIREBASE_AUTH_DOMAIN="seu-projeto.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="seu-project-id"
VITE_FIREBASE_STORAGE_BUCKET="seu-projeto.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="seu-sender-id"
VITE_FIREBASE_APP_ID="seu-app-id"
VITE_FIREBASE_VAPID_KEY="sua-vapid-key"

# Google Maps
VITE_GOOGLE_MAPS_API_KEY="sua-google-maps-key"
```

---

## 6️⃣ Iniciar o Projeto

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

O projeto estará disponível em: http://localhost:8080

---

## 7️⃣ Configuração Inicial no Sistema

### Criar Usuário Admin

1. Registre-se no sistema
2. No Supabase Dashboard, execute:

```sql
-- Substitua USER_ID pelo ID do seu usuário
INSERT INTO public.user_roles (user_id, role)
VALUES ('SEU_USER_ID', 'admin');
```

### Configurar Regiões de Entrega

1. Acesse como admin: `/admin/orders`
2. Vá para aba "Configuração de Frete"
3. Adicione suas regiões com taxas

### Criar Cupons (Opcional)

1. Acesse Admin Dashboard
2. Navegue até gestão de cupons
3. Crie cupons promocionais

---

## 8️⃣ Testar Funcionalidades

### Fluxo Completo de Teste

1. **Cliente:**
   - Registrar como cliente
   - Navegar no catálogo
   - Adicionar produtos ao carrinho
   - Aplicar cupom de desconto
   - Finalizar pedido
   - Aceitar termos de uso

2. **Motorista:**
   - Registrar como motorista
   - Ativar notificações
   - Ver pedidos disponíveis
   - Aceitar pedido
   - Ver informações do cliente
   - Abrir rota no Google Maps
   - Iniciar entrega (foto de coleta)
   - Concluir entrega (foto + assinatura)
   - Solicitar saque

3. **Admin:**
   - Acessar dashboard admin
   - Gerenciar pedidos
   - Atribuir motorista manualmente
   - Configurar frete por região
   - Criar cupons
   - Gerenciar motoristas (suspender/ativar)
   - Aprovar saques
   - Ver logs de auditoria

---

## 9️⃣ Troubleshooting

### Notificações não funcionam

```bash
# Verificar se Firebase está configurado
# Verificar console do navegador
# Verificar se service worker está registrado
# DevTools > Application > Service Workers
```

### Erro ao aplicar migrations

```bash
# Verificar se há migrations anteriores conflitantes
# Executar migrations uma por vez
# Verificar logs de erro no Supabase Dashboard
```

### Types do Supabase desatualizados

```bash
# Regenerar types após aplicar migrations
npx supabase gen types typescript --project-id SEU_ID > src/integrations/supabase/types.ts
```

### Google Maps não carrega

```bash
# Verificar se API Key está correta
# Verificar se APIs estão ativadas no Google Cloud
# Verificar billing no Google Cloud
```

---

## 🔟 Deploy em Produção

### Netlify (Recomendado)

```bash
# Build
npm run build

# Deploy
# Arraste a pasta dist/ para Netlify
# Ou conecte o repositório Git
```

### Configurar Variáveis de Ambiente

No painel do Netlify:
1. Site settings > Build & deploy > Environment
2. Adicione todas as variáveis do `.env`

### Configurar Redirects

Crie `public/_redirects`:

```
/*    /index.html   200
```

---

## 📊 Monitoramento

### Logs de Auditoria

Acesse via Supabase Dashboard:

```sql
SELECT * FROM public.audit_logs
ORDER BY created_at DESC
LIMIT 100;
```

### Estatísticas de Uso

```sql
-- Total de pedidos
SELECT COUNT(*) FROM public.orders;

-- Pedidos por status
SELECT status, COUNT(*) 
FROM public.orders 
GROUP BY status;

-- Motoristas ativos
SELECT COUNT(*) 
FROM public.profiles 
WHERE status = 'active';

-- Cupons mais usados
SELECT c.code, c.usage_count
FROM public.coupons c
ORDER BY c.usage_count DESC
LIMIT 10;
```

---

## 🔒 Segurança

### Checklist de Segurança

- ✅ RLS (Row Level Security) ativado em todas as tabelas
- ✅ Policies configuradas corretamente
- ✅ Variáveis sensíveis no `.env`
- ✅ `.env` no `.gitignore`
- ✅ HTTPS em produção
- ✅ Validação de dados no backend (triggers)
- ✅ Logs de auditoria (LGPD)
- ✅ Tokens JWT do Supabase

---

## 📚 Documentação Adicional

- `IMPLEMENTACOES_COMPLETAS.md` - Lista de todas as funcionalidades
- `SETUP_NOTIFICATIONS.md` - Configuração detalhada do Firebase
- `README.md` - Documentação geral do projeto

---

## 🆘 Suporte

Para problemas ou dúvidas:
- Verifique os logs do console do navegador
- Verifique os logs do Supabase Dashboard
- Consulte a documentação oficial:
  - Supabase: https://supabase.com/docs
  - Firebase: https://firebase.google.com/docs
  - React: https://react.dev/

---

## ✅ Checklist Final

Antes de ir para produção:

- [ ] Todas as migrations aplicadas
- [ ] Types do Supabase regenerados
- [ ] Firebase configurado
- [ ] Google Maps configurado
- [ ] Variáveis de ambiente configuradas
- [ ] Usuário admin criado
- [ ] Regiões de entrega configuradas
- [ ] Testes realizados em todos os fluxos
- [ ] Build de produção testado
- [ ] Domínio configurado
- [ ] SSL/HTTPS ativo
- [ ] Backup do banco configurado

---

**🎉 Parabéns! Seu ACR Delivery está pronto para uso!**
