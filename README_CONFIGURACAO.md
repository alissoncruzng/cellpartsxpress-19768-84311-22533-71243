# 🎯 ACR Delivery - Guia Rápido de Configuração

## ⚡ INÍCIO RÁPIDO

### 1. Arquivo .env já foi criado ✅
Agora você precisa editá-lo com suas credenciais.

### 2. Abra o arquivo .env
```bash
code .env
# ou
notepad .env
```

---

## 🔑 CREDENCIAIS NECESSÁRIAS

### 📊 SUPABASE (Obrigatório)
**Onde obter:** https://supabase.com/dashboard

```env
VITE_SUPABASE_URL="https://xxxxxxxxx.supabase.co"
VITE_SUPABASE_PROJECT_ID="xxxxxxxxx"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Como obter:**
1. Acesse seu projeto no Supabase
2. Settings > API
3. Copie: Project URL, Project ID, anon/public key

---

### 🔔 FIREBASE (Obrigatório - Notificações)
**Onde obter:** https://console.firebase.google.com/

```env
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="seu-projeto.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="seu-projeto"
VITE_FIREBASE_STORAGE_BUCKET="seu-projeto.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
VITE_FIREBASE_APP_ID="1:123456789:web:abc123"
VITE_FIREBASE_VAPID_KEY="BMn3x..."
```

**Como obter:**
1. Crie projeto no Firebase
2. Adicione app Web
3. Copie as credenciais
4. Ative Cloud Messaging
5. Gere VAPID Key (Web Push certificates)

**IMPORTANTE:** Também atualize `public/firebase-messaging-sw.js` com as mesmas credenciais!

---

### 🗺️ GOOGLE MAPS (Obrigatório - Rotas)
**Onde obter:** https://console.cloud.google.com/

```env
VITE_GOOGLE_MAPS_API_KEY="AIzaSyB..."
```

**Como obter:**
1. Crie projeto no Google Cloud
2. Ative APIs: Maps JavaScript, Directions, Geocoding
3. Crie API Key
4. **IMPORTANTE:** Configure billing (requerido)

---

### 💳 PAGAMENTOS (Opcional)

**Stripe:** https://dashboard.stripe.com/
```env
VITE_STRIPE_PUBLIC_KEY="pk_test_..."
```

**MercadoPago:** https://www.mercadopago.com.br/developers
```env
VITE_MERCADOPAGO_PUBLIC_KEY="TEST-..."
```

---

## 📝 APÓS CONFIGURAR O .ENV

### 1. Aplicar Migrations no Supabase

Acesse: Supabase Dashboard > SQL Editor

Execute **NA ORDEM**:
1. `20251022000001_driver_ranking_system.sql`
2. `20251022000002_fcm_notifications.sql`
3. `20251022000003_driver_management.sql`
4. `20251022000004_coupons_system.sql`
5. `20251022000005_payment_gateway.sql`
6. `20251022000006_policies_terms.sql`

### 2. Atualizar Service Worker

Edite: `public/firebase-messaging-sw.js`

Substitua as credenciais do Firebase (mesmas do .env)

### 3. Instalar Dependências

```bash
npm install
npm install firebase react-markdown
```

### 4. Regenerar Types

```bash
npx supabase gen types typescript --project-id SEU_PROJECT_ID > src/integrations/supabase/types.ts
```

### 5. Iniciar Projeto

```bash
npm run dev
```

Acesse: http://localhost:8080

---

## ✅ VERIFICAR SE ESTÁ FUNCIONANDO

### Console do Navegador (F12)

Deve aparecer:
```
✓ Firebase initialized successfully
✓ Supabase client initialized
✓ No errors
```

### Testar Notificações

1. Faça login
2. Permita notificações
3. Verifique se token FCM foi registrado

---

## 🆘 PROBLEMAS COMUNS

### Firebase não inicializa
- Verifique se TODAS as variáveis VITE_FIREBASE_* estão no .env
- Verifique se service worker foi atualizado
- Limpe cache do navegador

### Google Maps não carrega
- Verifique se billing está ATIVO no Google Cloud
- Verifique se as APIs estão ativadas
- Verifique se a API key está correta

### Supabase erro de conexão
- Verifique se URL está correta (com https://)
- Verifique se migrations foram aplicadas
- Verifique se projeto está ativo

---

## 📚 DOCUMENTAÇÃO COMPLETA

- **GUIA_CREDENCIAIS.md** - Guia detalhado passo a passo
- **PROXIMOS_PASSOS.md** - Checklist completo
- **IMPLEMENTACOES_COMPLETAS.md** - Lista de funcionalidades
- **INSTALACAO_COMPLETA.md** - Guia completo de instalação

---

## 🎯 RESUMO

1. ✅ Arquivo .env criado
2. ⏳ Edite .env com suas credenciais
3. ⏳ Aplique migrations no Supabase
4. ⏳ Atualize service worker
5. ⏳ npm install
6. ⏳ npm run dev

**Comece editando o arquivo .env agora!**

```bash
code .env
```

---

**Boa configuração! 🚀**
