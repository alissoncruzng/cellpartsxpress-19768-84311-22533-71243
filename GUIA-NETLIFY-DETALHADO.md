# 📋 GUIA COMPLETO: Configuração do Firebase no Netlify Dashboard

## 🚀 PASSO A PASSO DETALHADO

### **PASSO 1: Acessar o Netlify Dashboard**

1. **Abra seu navegador** e vá para: https://app.netlify.com/

2. **Faça login** com sua conta:
   - Use sua conta do GitHub, GitLab, Bitbucket ou email
   - Se não tiver conta, clique em "Sign up"

3. **Selecione seu site**:
   - Se você já tem um site criado: clique nele na lista
   - Se não tem: clique em **"New site from Git"** ou **"Import an existing project"**

### **PASSO 2: Configurar Repository (se necessário)**

Se você está criando um novo site:

1. **Escolha onde seu código está**:
   - **GitHub**: Autorize o Netlify a acessar seu GitHub
   - **GitLab**: Conecte sua conta do GitLab
   - **Bitbucket**: Conecte sua conta do Bitbucket
   - **Manual Deploy**: Faça upload dos arquivos manualmente

2. **Selecione o repositório**:
   - Encontre seu projeto `cellpartsxpress-19768-84311-22533-71243`
   - Clique em **"Deploy site"**

### **PASSO 3: Configurar Build Settings**

1. **Vá para Site Settings**:
   - No menu lateral esquerdo, clique em **"Site settings"**

2. **Configure Build & Deploy**:
   - Role até a seção **"Build & deploy"**
   - Clique em **"Edit settings"**

3. **Preencha os campos**:

   ```
   Build command: npm run build
   Publish directory: dist
   ```

4. **Node.js Version**:
   - Clique em **"Show advanced"**
   - Em **"Node version"**, selecione **"18.18.0"** ou superior
   - Clique em **"Save"**

### **PASSO 4: Configurar Environment Variables** ⭐

1. **No menu lateral**, clique em **"Site settings"**

2. **Role até** **"Environment variables"**

3. **Clique em** **"Add a variable"**

4. **Adicione cada variável** (uma por vez):

   **🔥 Firebase Configuration (OBRIGATÓRIO):**

   | Variable Name | Value |
   |---------------|--------|
   | `VITE_FIREBASE_API_KEY` | `AIzaSyCVF0y8L02_JCIUBj3addBFO8hz-ljfi8E` |
   | `VITE_FIREBASE_AUTH_DOMAIN` | `cellpartsxpress-delivery.firebaseapp.com` |
   | `VITE_FIREBASE_PROJECT_ID` | `cellpartsxpress-delivery` |
   | `VITE_FIREBASE_STORAGE_BUCKET` | `cellpartsxpress-delivery.appspot.com` |
   | `VITE_FIREBASE_MESSAGING_SENDER_ID` | `76625547073` |
   | `VITE_FIREBASE_APP_ID` | `1:76625547073:web:4e6c8ba79dfc0a20635bc0` |
   | `VITE_FIREBASE_MEASUREMENT_ID` | `G-YDRMZD2SSW` |

   **👤 Admin Configuration:**

   | Variable Name | Value |
   |---------------|--------|
   | `VITE_ADMIN_EMAIL` | `admin@cellpartsxpress.com` |
   | `VITE_ADMIN_PASSWORD` | `admin123` |
   | `VITE_ADMIN_PHONE` | `5511999999999` |

   **📱 WhatsApp Configuration:**

   | Variable Name | Value |
   |---------------|--------|
   | `VITE_WHATSAPP_BUSINESS_PHONE` | `5511946698650` |

5. **Para cada variável**:
   - Clique em **"Add a variable"**
   - Cole o **Variable Name** (nome da variável)
   - Cole o **Value** (valor da variável)
   - Clique em **"Create variable"**

6. **Verifique se todas foram adicionadas**:
   - Você deve ver 11 variáveis na lista
   - Nenhuma deve ter valor vazio

### **PASSO 5: Configurar Domain (opcional)**

1. **No menu lateral**, clique em **"Site settings"**

2. **Role até** **"Domain management"**

3. **Para usar domínio do Netlify**:
   - Use a URL padrão: `https://your-site-name.netlify.app`

4. **Para domínio personalizado** (opcional):
   - Clique em **"Add custom domain"**
   - Digite seu domínio
   - Configure o DNS conforme instruções

### **PASSO 6: Deploy da Aplicação**

1. **No menu superior**, clique em **"Deploys"**

2. **Inicie o deploy**:
   - Clique em **"Trigger deploy"**
   - Selecione **"Deploy site"**

3. **Aguarde o build**:
   - O status mudará para **"Building"**
   - Aguarde aparecer **"Published"**
   - Isso pode levar 2-5 minutos

4. **Verifique o resultado**:
   - Clique na URL do site
   - Deve abrir sua aplicação

### **PASSO 7: Testar a Aplicação**

1. **Acesse a URL** do seu site no Netlify

2. **Teste o login**:
   - Email: `admin@cellpartsxpress.com`
   - Senha: `admin123`

3. **Verifique no console** (F12):
   - Não deve haver erros de Firebase
   - Console deve mostrar "Firebase initialized successfully"

4. **Teste as funcionalidades**:
   - Login/logout
   - Navegação entre páginas
   - Responsividade mobile

## 🔧 **PASSO 8: Configurar Firebase Console**

### **Authentication Setup:**

1. **Acesse:** https://console.firebase.google.com/

2. **Selecione o projeto:** `cellpartsxpress-delivery`

3. **Vá para Authentication:**
   - Menu lateral > **"Authentication"**

4. **Configure Sign-in method:**
   - Clique em **"Sign-in method"**
   - Ative **"Email/Password"**
   - Clique em **"Save"**

5. **Authorized domains:**
   - Role até **"Authorized domains"**
   - Clique em **"Add domain"**
   - Adicione: `your-site-name.netlify.app`
   - Adicione: `cellpartsxpress-delivery.web.app`
   - Clique em **"Add"**

### **Firestore Database Setup:**

1. **Menu lateral > "Firestore Database"**

2. **Configure Rules:**
   - Clique em **"Rules"**
   - Substitua por:

   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

3. **Clique em "Publish"**

### **Storage Setup:**

1. **Menu lateral > "Storage"**

2. **Configure Rules:**
   - Clique em **"Rules"**
   - Substitua por:

   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

3. **Clique em "Publish"**

## 🚨 **PASSO 9: Troubleshooting**

### **Se der erro "Environment variables not found":**
1. Volte para **Site Settings > Environment variables**
2. Verifique se todas as 11 variáveis estão lá
3. Certifique-se de que não há espaços extras nos nomes
4. Re-deploy: **Deploys > Trigger deploy > Deploy site**

### **Se der erro "Firebase configuration not found":**
1. Verifique se todas as variáveis VITE_FIREBASE_ estão corretas
2. No Firebase Console, verifique se o projeto está ativo
3. Re-deploy após corrigir

### **Se der erro "Auth domain not authorized":**
1. No Firebase Console > Authentication > Authorized domains
2. Adicione seu domínio do Netlify: `your-site-name.netlify.app`

### **Se o build falhar:**
1. Verifique **Site Settings > Build & deploy**
2. Certifique-se de que **Build command** é `npm run build`
3. Certifique-se de que **Publish directory** é `dist`
4. Clique em **"Clear cache and deploy site"**

## ✅ **PASSO 10: Verificação Final**

1. **Acesse seu site** no Netlify
2. **Abra o console** (F12)
3. **Procure por:** "Firebase initialized successfully"
4. **Teste o login** com as credenciais de admin
5. **Verifique se não há erros** no console

## 🎯 **Status Esperado**

✅ **Build:** Deve completar sem erros
✅ **Environment Variables:** 11 variáveis configuradas
✅ **Firebase Console:** Authentication e Firestore configurados
✅ **Login:** Funcionando com admin@cellpartsxpress.com
✅ **Console:** Sem erros de Firebase

---

## 🚀 **RESUMO EXECUTIVO**

**Para configurar no Netlify Dashboard:**

1. ✅ **Site Settings > Build & deploy** = `npm run build` + `dist`
2. ✅ **Site Settings > Environment variables** = 11 variáveis Firebase + Admin
3. ✅ **Firebase Console > Authentication** = Email/Password + Domínios
4. ✅ **Firebase Console > Firestore** = Regras de segurança
5. ✅ **Deploy** = Trigger deploy e aguardar
6. ✅ **Teste** = Login e funcionalidades

**Agora você tem um guia completo para configurar tudo no Netlify Dashboard!** 🎉
