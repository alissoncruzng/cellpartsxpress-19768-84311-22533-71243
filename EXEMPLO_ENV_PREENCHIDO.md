# 📝 Exemplo de .env Preenchido

## ⚠️ IMPORTANTE
Este é apenas um EXEMPLO para você entender como preencher.
Use suas próprias credenciais reais!

---

## 🔍 COMO SERIA O .ENV PREENCHIDO

```env
# ============================================
# SUPABASE (Obrigatório)
# ============================================
# Exemplo de como ficaria preenchido:

VITE_SUPABASE_URL="https://xyzabc123def.supabase.co"
VITE_SUPABASE_PROJECT_ID="xyzabc123def"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emFiYzEyM2RlZiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjk1MDAwMDAwLCJleHAiOjIwMTA1NzYwMDB9.abc123def456ghi789jkl012mno345pqr678stu901vwx234yz"

# ============================================
# GOOGLE MAPS (Obrigatório)
# ============================================
# Exemplo de como ficaria preenchido:

VITE_GOOGLE_MAPS_API_KEY="AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# ============================================
# FIREBASE CLOUD MESSAGING (Obrigatório)
# ============================================
# Exemplo de como ficaria preenchido:

VITE_FIREBASE_API_KEY="AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
VITE_FIREBASE_AUTH_DOMAIN="acr-delivery-12345.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="acr-delivery-12345"
VITE_FIREBASE_STORAGE_BUCKET="acr-delivery-12345.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789012"
VITE_FIREBASE_APP_ID="1:123456789012:web:abc123def456ghi789"
VITE_FIREBASE_VAPID_KEY="BMn3xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# ============================================
# PAYMENT GATEWAYS (Opcional)
# ============================================
# Exemplo de como ficaria preenchido:

VITE_STRIPE_PUBLIC_KEY="pk_test_51Abc123DefGhiJklMnoPqrStUvWxYz"
VITE_MERCADOPAGO_PUBLIC_KEY="TEST-12345678-1234-1234-1234-123456789012"

# ============================================
# WHATSAPP BUSINESS API (Opcional)
# ============================================
# Exemplo de como ficaria preenchido:

VITE_WHATSAPP_BUSINESS_PHONE="5511999999999"
VITE_WHATSAPP_API_TOKEN="EAABsbCS1234ZABCdefGHIjklMNOpqrSTUvwxYZ"
```

---

## 📍 ONDE ENCONTRAR CADA CREDENCIAL

### 1. SUPABASE

**Acesse:** https://supabase.com/dashboard

```
1. Selecione seu projeto
2. Vá em: Settings (⚙️) > API
3. Copie:
   - Project URL → VITE_SUPABASE_URL
   - Project ID (está na URL) → VITE_SUPABASE_PROJECT_ID
   - anon/public key → VITE_SUPABASE_PUBLISHABLE_KEY
```

**Exemplo visual:**
```
Project URL: https://xyzabc123def.supabase.co
             ↓
VITE_SUPABASE_URL="https://xyzabc123def.supabase.co"

Project ID: xyzabc123def (parte antes de .supabase.co)
            ↓
VITE_SUPABASE_PROJECT_ID="xyzabc123def"

anon/public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
             ↓
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 2. FIREBASE

**Acesse:** https://console.firebase.google.com/

```
1. Crie/selecione projeto
2. Clique no ícone Web (</>)
3. Registre o app
4. Copie as credenciais que aparecem
```

**Exemplo do que você verá:**
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "acr-delivery-12345.firebaseapp.com",
  projectId: "acr-delivery-12345",
  storageBucket: "acr-delivery-12345.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456ghi789"
};
```

**Transforme em:**
```env
VITE_FIREBASE_API_KEY="AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
VITE_FIREBASE_AUTH_DOMAIN="acr-delivery-12345.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="acr-delivery-12345"
VITE_FIREBASE_STORAGE_BUCKET="acr-delivery-12345.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789012"
VITE_FIREBASE_APP_ID="1:123456789012:web:abc123def456ghi789"
```

**VAPID Key:**
```
1. No Firebase Console
2. Build > Cloud Messaging
3. Web configuration > Web Push certificates
4. Generate key pair
5. Copie a chave (começa com "B")
```

---

### 3. GOOGLE MAPS

**Acesse:** https://console.cloud.google.com/

```
1. Crie/selecione projeto
2. APIs & Services > Library
3. Ative: Maps JavaScript API, Directions API, Geocoding API
4. APIs & Services > Credentials
5. Create Credentials > API key
6. Copie a chave
```

**Exemplo:**
```
API Key: AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
         ↓
VITE_GOOGLE_MAPS_API_KEY="AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

---

## 🎯 COMPARAÇÃO: ANTES vs DEPOIS

### ❌ ANTES (Template)
```env
VITE_SUPABASE_URL="your-project-id.supabase.co"
VITE_FIREBASE_API_KEY="your-firebase-api-key"
VITE_GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
```

### ✅ DEPOIS (Preenchido)
```env
VITE_SUPABASE_URL="https://xyzabc123def.supabase.co"
VITE_FIREBASE_API_KEY="AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
VITE_GOOGLE_MAPS_API_KEY="AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

---

## 📋 CHECKLIST DE PREENCHIMENTO

### Supabase (3 variáveis)
- [ ] VITE_SUPABASE_URL (começa com https://)
- [ ] VITE_SUPABASE_PROJECT_ID (sem https, só o ID)
- [ ] VITE_SUPABASE_PUBLISHABLE_KEY (token JWT longo)

### Firebase (7 variáveis)
- [ ] VITE_FIREBASE_API_KEY (começa com AIzaSy)
- [ ] VITE_FIREBASE_AUTH_DOMAIN (termina com .firebaseapp.com)
- [ ] VITE_FIREBASE_PROJECT_ID (nome do projeto)
- [ ] VITE_FIREBASE_STORAGE_BUCKET (termina com .appspot.com)
- [ ] VITE_FIREBASE_MESSAGING_SENDER_ID (números)
- [ ] VITE_FIREBASE_APP_ID (formato: 1:números:web:hash)
- [ ] VITE_FIREBASE_VAPID_KEY (começa com B)

### Google Maps (1 variável)
- [ ] VITE_GOOGLE_MAPS_API_KEY (começa com AIzaSy)

---

## ⚠️ ERROS COMUNS

### ❌ Esquecer aspas
```env
# ERRADO
VITE_SUPABASE_URL=https://xyz.supabase.co

# CORRETO
VITE_SUPABASE_URL="https://xyz.supabase.co"
```

### ❌ Esquecer https://
```env
# ERRADO
VITE_SUPABASE_URL="xyz.supabase.co"

# CORRETO
VITE_SUPABASE_URL="https://xyz.supabase.co"
```

### ❌ Copiar com espaços
```env
# ERRADO
VITE_FIREBASE_API_KEY=" AIzaSy... "

# CORRETO
VITE_FIREBASE_API_KEY="AIzaSy..."
```

### ❌ Usar credenciais de exemplo
```env
# ERRADO - Não use as credenciais deste exemplo!
VITE_SUPABASE_URL="https://xyzabc123def.supabase.co"

# CORRETO - Use suas próprias credenciais
VITE_SUPABASE_URL="https://SEU_PROJECT_ID.supabase.co"
```

---

## 🔒 SEGURANÇA

### ✅ O que é SEGURO (pode estar no .env)
- Supabase anon/public key
- Firebase config (public)
- Google Maps API key (com restrições)
- Stripe/MercadoPago public keys

### ❌ O que é PERIGOSO (NUNCA coloque no .env)
- Supabase service_role key
- Firebase Admin SDK
- Stripe/MercadoPago secret keys
- Senhas de banco

### 🔐 Verificar .gitignore
```bash
# O .env já está no .gitignore
# Verifique com:
git status

# .env NÃO deve aparecer na lista
```

---

## ✅ VALIDAR SE ESTÁ CORRETO

Após preencher, verifique:

```bash
# 1. Iniciar projeto
npm run dev

# 2. Abrir navegador
http://localhost:8080

# 3. Abrir DevTools (F12)
# 4. Verificar console

# Deve aparecer:
✓ Firebase initialized successfully
✓ Supabase client initialized
✓ No errors
```

---

## 🆘 PRECISA DE AJUDA?

Consulte os guias detalhados:
- **GUIA_CREDENCIAIS.md** - Passo a passo completo
- **PROXIMOS_PASSOS.md** - Checklist de configuração
- **README_CONFIGURACAO.md** - Guia rápido

---

**Agora edite seu arquivo .env com suas credenciais reais!**

```bash
code .env
```
