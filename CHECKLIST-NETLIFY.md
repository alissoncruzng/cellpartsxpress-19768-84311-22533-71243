# 📋 CHECKLIST: Configuração Netlify Dashboard

## ✅ **Antes de Começar**
- [ ] Tenho acesso ao Netlify Dashboard (https://app.netlify.com/)
- [ ] Tenho acesso ao Firebase Console (https://console.firebase.google.com/)
- [ ] O código do projeto está no GitHub/GitLab/Bitbucket ou pronto para upload
- [ ] Executei `npm run firebase:test` e funcionou ✅

---

## 🚀 **PASSO 1: Criar/Selecionar Site no Netlify**

### **Se criar novo site:**
1. [ ] Acesse https://app.netlify.com/
2. [ ] Clique em **"New site from Git"**
3. [ ] Conecte com GitHub/GitLab/Bitbucket
4. [ ] Selecione o repositório `cellpartsxpress-19768-84311-22533-71243`
5. [ ] Clique em **"Deploy site"**

### **Se usar site existente:**
1. [ ] Acesse https://app.netlify.com/
2. [ ] Clique no seu site na lista
3. [ ] Vá para **"Site settings"**

---

## 🔧 **PASSO 2: Configurar Build Settings**

1. [ ] Menu lateral > **"Site settings"**
2. [ ] Role até **"Build & deploy"**
3. [ ] Clique em **"Edit settings"**

### **Preencher:**
- [ ] **Build command:** `npm run build`
- [ ] **Publish directory:** `dist`
- [ ] **Node version:** `18.18.0` (ou superior)

4. [ ] Clique em **"Show advanced"**
5. [ ] Em **"Node version"**, selecione **18.18.0**
6. [ ] Clique em **"Save"**

---

## 🌍 **PASSO 3: Configurar Environment Variables**

1. [ ] Menu lateral > **"Site settings"**
2. [ ] Role até **"Environment variables"**
3. [ ] Clique em **"Add a variable"**

### **Adicionar uma por uma:**

#### **🔥 Firebase Configuration:**
- [ ] `VITE_FIREBASE_API_KEY` = `AIzaSyCVF0y8L02_JCIUBj3addBFO8hz-ljfi8E`
- [ ] `VITE_FIREBASE_AUTH_DOMAIN` = `cellpartsxpress-delivery.firebaseapp.com`
- [ ] `VITE_FIREBASE_PROJECT_ID` = `cellpartsxpress-delivery`
- [ ] `VITE_FIREBASE_STORAGE_BUCKET` = `cellpartsxpress-delivery.appspot.com`
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID` = `76625547073`
- [ ] `VITE_FIREBASE_APP_ID` = `1:76625547073:web:4e6c8ba79dfc0a20635bc0`
- [ ] `VITE_FIREBASE_MEASUREMENT_ID` = `G-YDRMZD2SSW`

#### **👤 Admin Configuration:**
- [ ] `VITE_ADMIN_EMAIL` = `admin@cellpartsxpress.com`
- [ ] `VITE_ADMIN_PASSWORD` = `admin123`
- [ ] `VITE_ADMIN_PHONE` = `5511999999999`

#### **📱 WhatsApp Configuration:**
- [ ] `VITE_WHATSAPP_BUSINESS_PHONE` = `5511946698650`

---

## 📱 **PASSO 4: Configurar Domain (opcional)**

1. [ ] Menu lateral > **"Site settings"**
2. [ ] **"Domain management"**
3. [ ] Para usar domínio Netlify: ✅ Já configurado automaticamente
4. [ ] Para domínio personalizado: Configure DNS conforme instruções

---

## 🚀 **PASSO 5: Deploy**

1. [ ] Menu superior > **"Deploys"**
2. [ ] Clique em **"Trigger deploy"**
3. [ ] Selecione **"Deploy site"**
4. [ ] Aguarde **"Building..."** → **"Published"**
5. [ ] Clique na URL do site para testar

---

## 🔧 **PASSO 6: Configurar Firebase Console**

### **Authentication:**
1. [ ] Acesse https://console.firebase.google.com/
2. [ ] Selecione projeto `cellpartsxpress-delivery`
3. [ ] Menu lateral > **"Authentication"**
4. [ ] **"Sign-in method"** > Ative **"Email/Password"**
5. [ ] **"Authorized domains"** > Adicione seu domínio Netlify

### **Firestore Database:**
1. [ ] Menu lateral > **"Firestore Database"**
2. [ ] **"Rules"** > Cole as regras de segurança
3. [ ] Clique em **"Publish"**

### **Storage:**
1. [ ] Menu lateral > **"Storage"**
2. [ ] **"Rules"** > Cole as regras de segurança
3. [ ] Clique em **"Publish"**

---

## 🧪 **PASSO 7: Testar**

1. [ ] Acesse a URL do seu site no Netlify
2. [ ] Abra console (F12)
3. [ ] Procure: "Firebase initialized successfully"
4. [ ] Teste login: admin@cellpartsxpress.com / admin123
5. [ ] Verifique se não há erros no console

---

## 🚨 **PASSO 8: Troubleshooting**

### **Se der erro:**
- [ ] Verificar **Environment variables** (devem ser 11)
- [ ] Verificar **Build settings** (comando e diretório)
- [ ] Re-deploy: **Deploys > Trigger deploy > Clear cache and deploy site**
- [ ] Verificar **Firebase Console** (Authentication ativado)

---

## ✅ **PASSO 9: Final Check**

- [ ] Build completou sem erros?
- [ ] Environment variables configuradas?
- [ ] Firebase Console configurado?
- [ ] Login funcionando?
- [ ] Console sem erros?
- [ ] Site responsivo?

---

## 🎯 **RESUMO**

**Total de variáveis:** 11  
**Build command:** `npm run build`  
**Publish directory:** `dist`  
**Node version:** 18.18.0  
**Firebase projeto:** `cellpartsxpress-delivery`  
**Admin login:** `admin@cellpartsxpress.com` / `admin123`

---

**✅ PRONTO! Agora você pode fazer deploy da sua aplicação no Netlify!** 🚀

**Documentação completa:** GUIA-NETLIFY-DETALHADO.md
