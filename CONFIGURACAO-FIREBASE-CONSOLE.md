# 🔥 CONFIGURAÇÃO FIREBASE CONSOLE - PASSO A PASSO

## 🚀 **Acesse o Firebase Console**

### **1. Acesse:**
- 🌐 https://console.firebase.google.com/
- 📧 Use a mesma conta do `firebase login`

### **2. Selecione o Projeto:**
- 📱 Procure por **"cellpartsxpress-delivery"**
- 🖱️ Clique no projeto

---

## ⚙️ **PASSO 1: Configurar Authentication**

### **1. Menu lateral > "Authentication"**

### **2. Configure Sign-in method:**
- 🖱️ Clique em **"Sign-in method"** (aba superior)
- 🔍 Procure **"Email/Password"**
- ✅ **Ative** (clique no slider)
- 💾 **Clique em "Save"**

### **3. Authorized domains:**
- 🖱️ Role até **"Authorized domains"**
- ➕ **Clique em "Add domain"**
- 📝 **Adicione:** `cellpartsxpress-delivery.netlify.app`
- 📝 **Adicione:** `cellpartsxpress-delivery.web.app`
- ✅ **Clique em "Add"**

---

## 🗄️ **PASSO 2: Configurar Firestore Database**

### **1. Menu lateral > "Firestore Database"**

### **2. Se não existir, crie:**
- 🖱️ Clique em **"Create database"**
- 📍 **Escolha:** "Start in test mode" (depois mudamos)
- 📍 **Selecione região:** (qualquer uma)
- ✅ **Clique em "Enable"**

### **3. Configure Rules:**
- 🖱️ Clique em **"Rules"** (aba superior)
- 📝 **Substitua por:**

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

- 💾 **Clique em "Publish"**

---

## 💾 **PASSO 3: Configurar Storage**

### **1. Menu lateral > "Storage"**

### **2. Configure Rules:**
- 🖱️ Clique em **"Rules"** (aba superior)
- 📝 **Substitua por:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

- 💾 **Clique em "Publish"**

---

## 📱 **PASSO 4: Configurar Cloud Messaging**

### **1. Menu lateral > "Project settings"**

### **2. Cloud Messaging:**
- 🖱️ Clique em **"Cloud Messaging"** (aba superior)
- 📋 **Copie a "Server key"** (VAPID key)
- 📝 **Cole no Netlify Dashboard:**
  ```
  VITE_FIREBASE_VAPID_KEY = [COLE A SERVER KEY AQUI]
  ```

---

## ✅ **PASSO 7: Verificação Final**

### **Total de Variáveis: 12**
- [ ] 7 variáveis Firebase
- [ ] 1 variável VAPID key
- [ ] 3 variáveis Admin
- [ ] 1 variável WhatsApp

---

## 🎯 **CONFIGURAÇÃO DO PLANO GRATUITO**

**Firebase Spark Plan (Gratuito) inclui:**
- ✅ **Auth:** 10K usuários
- ✅ **Firestore:** 1GB storage
- ✅ **Storage:** 5GB storage
- ✅ **Functions:** 2M invocações
- ✅ **Hosting:** 1GB storage

**Para seu projeto de delivery:**
- ✅ **Auth:** Motoristas e admin
- ✅ **Firestore:** Pedidos e dados
- ✅ **Storage:** Fotos de entrega
- ✅ **Notifications:** Push para motoristas

---

**🎊 Pronto! Agora seu Firebase está configurado para funcionar com a aplicação!** 🚀

**O plano gratuito é suficiente para começar. Quando crescer, pode fazer upgrade!** 💪

**Teste o login agora:** https://cellpartsxpress-delivery.netlify.app 😊
