# 🔑 Guia Completo de Configuração de Credenciais

## 📋 Checklist de Credenciais

- [ ] Supabase (Obrigatório)
- [ ] Firebase Cloud Messaging (Obrigatório - para notificações)
- [ ] Google Maps API (Obrigatório - para rotas)
- [ ] Stripe (Opcional - para pagamentos)
- [ ] MercadoPago (Opcional - para pagamentos)

---

## 1️⃣ SUPABASE (Obrigatório)

### Passo 1: Acessar o Projeto
1. Acesse https://supabase.com/dashboard
2. Faça login ou crie uma conta
3. Selecione seu projeto ou crie um novo

### Passo 2: Obter Credenciais
1. No menu lateral, clique em **Settings** (⚙️)
2. Clique em **API**
3. Copie as seguintes informações:

```env
# Project URL
VITE_SUPABASE_URL="https://xxxxxxxxx.supabase.co"

# Project ID (está na URL)
VITE_SUPABASE_PROJECT_ID="xxxxxxxxx"

# anon/public key
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Passo 3: Aplicar Migrations
1. No Supabase Dashboard, vá em **SQL Editor**
2. Execute os arquivos na ordem:
   - `20251022000001_driver_ranking_system.sql`
   - `20251022000002_fcm_notifications.sql`
   - `20251022000003_driver_management.sql`
   - `20251022000004_coupons_system.sql`
   - `20251022000005_payment_gateway.sql`
   - `20251022000006_policies_terms.sql`

---

## 2️⃣ FIREBASE CLOUD MESSAGING (Obrigatório)

### Passo 1: Criar Projeto Firebase
1. Acesse https://console.firebase.google.com/
2. Clique em **Adicionar projeto**
3. Nome do projeto: `ACR Delivery` (ou o que preferir)
4. Desabilite Google Analytics (opcional)
5. Clique em **Criar projeto**

### Passo 2: Adicionar App Web
1. No painel do projeto, clique no ícone **Web** (</>)
2. Nome do app: `ACR Delivery Web`
3. **NÃO** marque "Firebase Hosting"
4. Clique em **Registrar app**
5. Copie as credenciais que aparecem:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "acr-delivery.firebaseapp.com",
  projectId: "acr-delivery",
  storageBucket: "acr-delivery.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### Passo 3: Ativar Cloud Messaging
1. No menu lateral, vá em **Build** > **Cloud Messaging**
2. Se aparecer para ativar, clique em **Get Started**

### Passo 4: Gerar VAPID Key
1. Ainda em Cloud Messaging
2. Vá na aba **Web configuration**
3. Em **Web Push certificates**, clique em **Generate key pair**
4. Copie a chave gerada (começa com `B...`)

### Passo 5: Adicionar ao .env
```env
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="acr-delivery.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="acr-delivery"
VITE_FIREBASE_STORAGE_BUCKET="acr-delivery.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
VITE_FIREBASE_APP_ID="1:123456789:web:abc123"
VITE_FIREBASE_VAPID_KEY="BMn3x..."
```

### Passo 6: Atualizar Service Worker
Edite `public/firebase-messaging-sw.js` com suas credenciais:

```javascript
firebase.initializeApp({
  apiKey: "AIzaSy...",
  authDomain: "acr-delivery.firebaseapp.com",
  projectId: "acr-delivery",
  storageBucket: "acr-delivery.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
});
```

---

## 3️⃣ GOOGLE MAPS API (Obrigatório)

### Passo 1: Criar Projeto Google Cloud
1. Acesse https://console.cloud.google.com/
2. Crie um novo projeto ou selecione existente
3. Nome: `ACR Delivery`

### Passo 2: Ativar APIs
1. No menu, vá em **APIs & Services** > **Library**
2. Procure e ative as seguintes APIs:
   - **Maps JavaScript API**
   - **Directions API**
   - **Geocoding API**
   - **Distance Matrix API**

### Passo 3: Criar API Key
1. Vá em **APIs & Services** > **Credentials**
2. Clique em **+ CREATE CREDENTIALS**
3. Selecione **API key**
4. Copie a chave gerada

### Passo 4: Restringir API Key (Recomendado)
1. Clique na chave criada para editar
2. Em **Application restrictions**:
   - Selecione **HTTP referrers**
   - Adicione: `http://localhost:8080/*`
   - Adicione: `https://seu-dominio.com/*`
3. Em **API restrictions**:
   - Selecione **Restrict key**
   - Marque as 4 APIs ativadas acima
4. Clique em **Save**

### Passo 5: Configurar Billing
⚠️ **IMPORTANTE:** Google Maps requer billing ativo
1. Vá em **Billing**
2. Configure um método de pagamento
3. Google oferece $200 de crédito grátis por mês

### Passo 6: Adicionar ao .env
```env
VITE_GOOGLE_MAPS_API_KEY="AIzaSyB..."
```

---

## 4️⃣ STRIPE (Opcional - Pagamentos)

### Passo 1: Criar Conta
1. Acesse https://dashboard.stripe.com/register
2. Crie sua conta

### Passo 2: Obter Chaves
1. No Dashboard, vá em **Developers** > **API keys**
2. Copie a **Publishable key** (começa com `pk_test_...`)

### Passo 3: Adicionar ao .env
```env
VITE_STRIPE_PUBLIC_KEY="pk_test_..."
```

---

## 5️⃣ MERCADOPAGO (Opcional - Pagamentos)

### Passo 1: Criar Conta
1. Acesse https://www.mercadopago.com.br/developers
2. Faça login ou crie conta

### Passo 2: Criar Aplicação
1. Vá em **Suas integrações**
2. Clique em **Criar aplicação**
3. Nome: `ACR Delivery`

### Passo 3: Obter Credenciais
1. Selecione a aplicação criada
2. Vá em **Credenciais**
3. Copie a **Public Key** (modo teste)

### Passo 4: Adicionar ao .env
```env
VITE_MERCADOPAGO_PUBLIC_KEY="TEST-..."
```

---

## 📝 CRIAR ARQUIVO .env

Agora crie o arquivo `.env` na raiz do projeto:

```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# Ou crie manualmente
```

Depois edite o arquivo `.env` com suas credenciais:

```env
# Supabase Configuration (OBRIGATÓRIO)
VITE_SUPABASE_PROJECT_ID="seu-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="sua-publishable-key"
VITE_SUPABASE_URL="https://seu-project.supabase.co"

# Google Maps API (OBRIGATÓRIO)
VITE_GOOGLE_MAPS_API_KEY="sua-google-maps-key"

# Firebase Cloud Messaging (OBRIGATÓRIO)
VITE_FIREBASE_API_KEY="sua-firebase-api-key"
VITE_FIREBASE_AUTH_DOMAIN="seu-projeto.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="seu-project-id"
VITE_FIREBASE_STORAGE_BUCKET="seu-projeto.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="seu-sender-id"
VITE_FIREBASE_APP_ID="seu-app-id"
VITE_FIREBASE_VAPID_KEY="sua-vapid-key"

# Payment Gateways (OPCIONAL)
VITE_STRIPE_PUBLIC_KEY="pk_test_..."
VITE_MERCADOPAGO_PUBLIC_KEY="TEST-..."

# WhatsApp Business API (OPCIONAL)
VITE_WHATSAPP_BUSINESS_PHONE="5511999999999"
VITE_WHATSAPP_API_TOKEN=""
```

---

## ✅ VERIFICAR CONFIGURAÇÃO

Após configurar tudo, execute:

```bash
# Instalar dependências
npm install

# Iniciar projeto
npm run dev
```

### Verificar no Console do Navegador

1. Abra http://localhost:8080
2. Abra DevTools (F12)
3. Vá na aba **Console**
4. Verifique se não há erros de:
   - Firebase initialization
   - Google Maps loading
   - Supabase connection

### Testar Notificações

1. Faça login no sistema
2. Permita notificações quando solicitado
3. Verifique no console se o token FCM foi registrado

---

## 🔒 SEGURANÇA

### ⚠️ NUNCA COMMITE O .env

O arquivo `.env` já está no `.gitignore`, mas verifique:

```bash
# Verificar se .env está ignorado
git status

# .env NÃO deve aparecer na lista
```

### 🔐 Variáveis Públicas vs Privadas

**Públicas (podem estar no frontend):**
- ✅ Supabase URL e anon key
- ✅ Firebase config
- ✅ Google Maps API key (com restrições)
- ✅ Stripe/MercadoPago public keys

**Privadas (NUNCA no frontend):**
- ❌ Supabase service_role key
- ❌ Firebase Admin SDK
- ❌ Stripe/MercadoPago secret keys
- ❌ Senhas de banco de dados

---

## 🆘 PROBLEMAS COMUNS

### Firebase não inicializa
- Verifique se todas as variáveis estão corretas
- Verifique se o projeto está ativo no Firebase Console
- Limpe o cache: `Ctrl + Shift + Delete`

### Google Maps não carrega
- Verifique se billing está ativo
- Verifique se as APIs estão ativadas
- Verifique restrições da API key

### Supabase connection error
- Verifique se a URL está correta
- Verifique se as migrations foram aplicadas
- Verifique se o projeto está ativo

---

## 📞 SUPORTE

Se tiver problemas:
1. Verifique o console do navegador (F12)
2. Verifique os logs do Supabase Dashboard
3. Consulte a documentação oficial:
   - Supabase: https://supabase.com/docs
   - Firebase: https://firebase.google.com/docs
   - Google Maps: https://developers.google.com/maps

---

## ✅ CHECKLIST FINAL

Antes de continuar, verifique:

- [ ] Arquivo `.env` criado
- [ ] Credenciais Supabase configuradas
- [ ] Migrations aplicadas no Supabase
- [ ] Firebase configurado
- [ ] Service Worker atualizado
- [ ] Google Maps API configurada
- [ ] Billing do Google Cloud ativo
- [ ] `npm install` executado
- [ ] Projeto inicia sem erros
- [ ] Sem erros no console do navegador

---

**Pronto! Suas credenciais estão configuradas! 🎉**
