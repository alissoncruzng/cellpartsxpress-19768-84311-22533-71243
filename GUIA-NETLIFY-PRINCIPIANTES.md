# 🔍 GUIA BÁSICO: Primeiro Passos no Netlify

## 📋 SE VOCÊ AINDA NÃO TEM UM SITE NO NETLIFY

### **PASSO 1: Criar Site no Netlify**

1. **Acesse:** https://app.netlify.com/
2. **Clique em "New site from Git"** (canto superior direito)
3. **Escolha onde seu código está:**
   - **GitHub:** Se você usa GitHub
   - **Upload manually:** Para fazer upload dos arquivos

### **Se usar GitHub:**
1. Clique em **"Connect to GitHub"**
2. Autorize o Netlify a acessar seu GitHub
3. Encontre seu projeto `cellpartsxpress-19768-84311-22533-71243`
4. Clique em **"Deploy site"**

### **Se usar Upload Manual:**
1. Clique em **"Upload manually"**
2. Arraste a pasta do seu projeto ou clique para selecionar
3. Clique em **"Deploy site"**

---

## 🔧 DEPOIS QUE O SITE FOR CRIADO

### **PASSO 2: Encontrar as Configurações**

1. **Na tela principal do Netlify**, você verá seu site
2. **Clique no nome do seu site** (deve aparecer como `cellpartsxpress-19768-84311-22533-71243` ou similar)

3. **Agora você está no Dashboard do seu site**
4. **No menu lateral esquerdo**, clique em **"Site settings"**

### **PASSO 3: Configurar Build Settings**

1. **Em Site Settings**, role até **"Build & deploy"**
2. **Clique em "Edit settings"**
3. **Preencha:**
   ```
   Build command: npm run build
   Publish directory: dist
   ```
4. **Role para baixo e clique em "Save"**

### **PASSO 4: Configurar Environment Variables**

1. **Em Site Settings**, role até **"Environment variables"**
2. **Clique em "Add a variable"**
3. **Adicione uma por uma:**

#### **🔥 Primeiro adicione as do Firebase:**
```
Nome: VITE_FIREBASE_API_KEY
Valor: AIzaSyCVF0y8L02_JCIUBj3addBFO8hz-ljfi8E
```

```
Nome: VITE_FIREBASE_AUTH_DOMAIN
Valor: cellpartsxpress-delivery.firebaseapp.com
```

```
Nome: VITE_FIREBASE_PROJECT_ID
Valor: cellpartsxpress-delivery
```

```
Nome: VITE_FIREBASE_STORAGE_BUCKET
Valor: cellpartsxpress-delivery.appspot.com
```

```
Nome: VITE_FIREBASE_MESSAGING_SENDER_ID
Valor: 76625547073
```

```
Nome: VITE_FIREBASE_APP_ID
Valor: 1:76625547073:web:4e6c8ba79dfc0a20635bc0
```

```
Nome: VITE_FIREBASE_MEASUREMENT_ID
Valor: G-YDRMZD2SSW
```

#### **👤 Agora as do Admin:**
```
Nome: VITE_ADMIN_EMAIL
Valor: admin@cellpartsxpress.com
```

```
Nome: VITE_ADMIN_PASSWORD
Valor: admin123
```

```
Nome: VITE_ADMIN_PHONE
Valor: 5511999999999
```

#### **📱 E a do WhatsApp:**
```
Nome: VITE_WHATSAPP_BUSINESS_PHONE
Valor: 5511946698650
```

### **PASSO 5: Deploy**

1. **No menu superior**, clique em **"Deploys"**
2. **Clique em "Trigger deploy"**
3. **Selecione "Deploy site"**
4. **Aguarde** o build completar (2-5 minutos)

---

## 🌐 **DEPOIS DO DEPLOY**

### **PASSO 6: Configurar Firebase Console**

1. **Acesse:** https://console.firebase.google.com/
2. **Selecione o projeto:** `cellpartsxpress-delivery`
3. **Menu lateral > "Authentication"**
4. **"Sign-in method" > Ative "Email/Password"**
5. **"Authorized domains" > Adicione seu domínio do Netlify**

---

## 🧪 **PASSO 7: Testar**

1. **Acesse a URL** que o Netlify gerou
2. **Teste o login** com:
   - Email: `admin@cellpartsxpress.com`
   - Senha: `admin123`

---

## 📱 **SE DER ERRO:**

**"Environment variables not found":**
- Volte para **Site Settings > Environment variables**
- Verifique se todas as 11 variáveis estão lá
- Re-deploy

**"Firebase configuration error":**
- Verifique se todas as variáveis VITE_FIREBASE_ estão corretas
- Re-deploy

---

## ✅ **CHECKLIST RÁPIDO:**

- [ ] Site criado no Netlify
- [ ] Build settings configurados (npm run build + dist)
- [ ] 11 Environment Variables adicionadas
- [ ] Deploy executado
- [ ] Firebase Console configurado
- [ ] Login testado

---

**🎯 Pronto! Agora você consegue configurar tudo no Netlify!** 🚀

**Precisa de ajuda em algum passo?** Me avise qual está com dificuldade!
