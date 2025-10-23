# 🎯 Guia Simples - Como Obter as Credenciais

## 📌 NÃO SE PREOCUPE!
Vou te guiar passo a passo. É só seguir as instruções e copiar/colar.

---

## 1️⃣ SUPABASE (Banco de Dados)

### Passo 1: Criar Conta
1. Abra: https://supabase.com/
2. Clique em **"Start your project"**
3. Faça login com GitHub ou email

### Passo 2: Criar Projeto
1. Clique em **"New Project"**
2. Preencha:
   - **Name:** ACR Delivery
   - **Database Password:** Crie uma senha forte (anote!)
   - **Region:** Brazil (São Paulo)
3. Clique em **"Create new project"**
4. Aguarde 2-3 minutos (vai criar o banco)

### Passo 3: Copiar as Credenciais
1. Quando terminar, clique em **Settings** (⚙️ no menu lateral)
2. Clique em **API**
3. Você verá 3 informações importantes:

**COPIE E ME ENVIE:**
```
📍 Project URL: 
   (Exemplo: https://abcdefgh.supabase.co)
   
📍 Project ID:
   (Exemplo: abcdefgh - é a primeira parte da URL)
   
📍 anon public (chave pública):
   (Clique em "Copy" ao lado de "anon public")
   (É um texto LONGO que começa com eyJ...)
```

---

## 2️⃣ FIREBASE (Notificações)

### Passo 1: Criar Conta
1. Abra: https://console.firebase.google.com/
2. Faça login com sua conta Google

### Passo 2: Criar Projeto
1. Clique em **"Adicionar projeto"** ou **"Create a project"**
2. Nome do projeto: **ACR Delivery**
3. Clique em **Continuar**
4. Desmarque **"Ativar Google Analytics"** (não precisa)
5. Clique em **"Criar projeto"**
6. Aguarde criar (1-2 minutos)
7. Clique em **"Continuar"**

### Passo 3: Adicionar App Web
1. Na tela inicial, clique no ícone **</>** (Web)
2. Nome do app: **ACR Delivery Web**
3. **NÃO** marque "Firebase Hosting"
4. Clique em **"Registrar app"**

### Passo 4: Copiar Credenciais
Você verá um código assim:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "acr-delivery-xxxxx.firebaseapp.com",
  projectId: "acr-delivery-xxxxx",
  storageBucket: "acr-delivery-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

**COPIE E ME ENVIE cada linha:**
```
📍 apiKey: 
📍 authDomain: 
📍 projectId: 
📍 storageBucket: 
📍 messagingSenderId: 
📍 appId: 
```

### Passo 5: Ativar Cloud Messaging
1. No menu lateral, clique em **"Build"** > **"Cloud Messaging"**
2. Se aparecer botão **"Get Started"**, clique nele

### Passo 6: Gerar VAPID Key
1. Ainda em Cloud Messaging
2. Clique na aba **"Web configuration"**
3. Em **"Web Push certificates"**, clique em **"Generate key pair"**
4. Vai aparecer uma chave (começa com B...)

**COPIE E ME ENVIE:**
```
📍 VAPID Key: 
   (Clique no ícone de copiar ao lado)
```

---

## 3️⃣ GOOGLE MAPS (Mapas e Rotas)

### Passo 1: Acessar Google Cloud
1. Abra: https://console.cloud.google.com/
2. Faça login com sua conta Google

### Passo 2: Criar Projeto
1. No topo, clique em **"Select a project"** ou **"Selecionar projeto"**
2. Clique em **"NEW PROJECT"** ou **"NOVO PROJETO"**
3. Nome: **ACR Delivery**
4. Clique em **"Create"** ou **"Criar"**
5. Aguarde criar

### Passo 3: Ativar Billing (IMPORTANTE!)
⚠️ **Google Maps precisa de cartão cadastrado, MAS:**
- Você ganha $200 GRÁTIS por mês
- Só cobra se passar de $200/mês
- Para começar, não vai gastar nada

1. No menu lateral (☰), clique em **"Billing"** ou **"Faturamento"**
2. Clique em **"Link a billing account"** ou **"Vincular conta de faturamento"**
3. Clique em **"Create billing account"** ou **"Criar conta de faturamento"**
4. Preencha os dados do cartão
5. Clique em **"Start my free trial"** ou **"Iniciar avaliação gratuita"**

### Passo 4: Ativar APIs
1. No menu (☰), vá em **"APIs & Services"** > **"Library"**
2. Procure e ative (clique em cada uma e depois em "Enable"):
   - **Maps JavaScript API**
   - **Directions API**
   - **Geocoding API**
   - **Distance Matrix API**

### Passo 5: Criar API Key
1. Vá em **"APIs & Services"** > **"Credentials"**
2. Clique em **"+ CREATE CREDENTIALS"**
3. Selecione **"API key"**
4. Vai aparecer uma chave (começa com AIzaSy...)
5. Clique em **"Copy"** para copiar

**COPIE E ME ENVIE:**
```
📍 Google Maps API Key: 
```

---

## 4️⃣ PAGAMENTOS (OPCIONAL - Pode pular por enquanto)

### Stripe (Se quiser aceitar cartão)
1. Abra: https://dashboard.stripe.com/register
2. Crie conta
3. Vá em **"Developers"** > **"API keys"**
4. Copie a **"Publishable key"** (começa com pk_test_)

### MercadoPago (Se quiser aceitar PIX/Boleto)
1. Abra: https://www.mercadopago.com.br/developers
2. Faça login
3. Vá em **"Suas integrações"**
4. Crie uma aplicação
5. Copie a **"Public Key"** de teste

---

## 📝 RESUMO - ME ENVIE ASSIM:

Copie este modelo e preencha com suas informações:

```
========================================
CREDENCIAIS ACR DELIVERY
========================================

1. SUPABASE:
   URL: 
   Project ID: 
   anon key: 

2. FIREBASE:
   apiKey: 
   authDomain: 
   projectId: 
   storageBucket: 
   messagingSenderId: 
   appId: 
   VAPID Key: 

3. GOOGLE MAPS:
   API Key: 

4. PAGAMENTOS (opcional):
   Stripe: 
   MercadoPago: 
```

---

## ❓ DÚVIDAS COMUNS

**P: Vou ter que pagar algo?**
R: Não! Todos têm planos gratuitos generosos:
- Supabase: Grátis até 500MB
- Firebase: Grátis até 10GB
- Google Maps: $200 grátis/mês

**P: Preciso de cartão?**
R: Só para Google Maps, mas você ganha $200 grátis/mês

**P: E se eu errar?**
R: Sem problemas! Posso te ajudar a refazer qualquer passo

**P: Quanto tempo leva?**
R: Uns 15-20 minutos no total

---

## 🆘 PRECISA DE AJUDA?

Se travar em algum passo, me avise qual é e te ajudo!

**Quando tiver todas as informações, é só me enviar e eu configuro tudo! 🚀**
