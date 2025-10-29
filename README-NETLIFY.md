# 🚀 Configuração do Firebase no Netlify

## 📋 Instruções para Configurar no Netlify Dashboard

### 1. Acesse o Netlify Dashboard
- Vá para: https://app.netlify.com/
- Selecione seu site ou crie um novo

### 2. Configure as Variáveis de Ambiente

No Netlify Dashboard, vá para **Site Settings > Environment Variables** e adicione:

#### **Firebase Configuration (OBRIGATÓRIO)**
```
VITE_FIREBASE_API_KEY = AIzaSyCVF0y8L02_JCIUBj3addBFO8hz-ljfi8E
VITE_FIREBASE_AUTH_DOMAIN = cellpartsxpress-delivery.firebaseapp.com
VITE_FIREBASE_PROJECT_ID = cellpartsxpress-delivery
VITE_FIREBASE_STORAGE_BUCKET = cellpartsxpress-delivery.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID = 76625547073
VITE_FIREBASE_APP_ID = 1:76625547073:web:4e6c8ba79dfc0a20635bc0
VITE_FIREBASE_MEASUREMENT_ID = G-YDRMZD2SSW
```

#### **Admin Configuration**
```
VITE_ADMIN_EMAIL = admin@cellpartsxpress.com
VITE_ADMIN_PASSWORD = admin123
VITE_ADMIN_PHONE = 5511999999999
```

#### **WhatsApp Configuration**
```
VITE_WHATSAPP_BUSINESS_PHONE = 5511946698650
```

### 3. Configurações de Build

No **Site Settings > Build & Deploy**, verifique:

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node version:** `18` (recomendado)

### 4. Deploy

Após configurar as variáveis de ambiente:

1. Clique em **"Trigger deploy"** > **"Deploy site"**
2. Aguarde o build completar
3. Acesse a URL do seu site

## 🔧 Configuração do Firebase Console

### 1. Authentication
1. Acesse: https://console.firebase.google.com/
2. Selecione o projeto: `cellpartsxpress-delivery`
3. Vá para **Authentication > Sign-in method**
4. Ative: **Email/Password**
5. **Authorized domains:** Adicione seu domínio do Netlify

### 2. Firestore Database
1. Vá para **Firestore Database > Rules**
2. Use estas regras:

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

### 3. Storage
1. Vá para **Storage > Rules**
2. Use estas regras:

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

## 🧪 Teste da Configuração

### Teste Local
```bash
npm run firebase:test
```

### Teste no Netlify
1. Deploy a aplicação
2. Acesse: `https://your-site-name.netlify.app`
3. Teste o login com:
   - Email: `admin@cellpartsxpress.com`
   - Senha: `admin123`

## 🚨 Troubleshooting

### Problema: "Firebase configuration not found"
**Solução:**
- Verifique se todas as variáveis de ambiente estão configuradas no Netlify
- Certifique-se de que os nomes das variáveis estão exatamente como especificado
- Re-deploy após adicionar as variáveis

### Problema: "Auth domain not authorized"
**Solução:**
- No Firebase Console, vá para Authentication > Authorized domains
- Adicione: `your-site-name.netlify.app`
- Adicione: `cellpartsxpress-delivery.web.app`

### Problema: "CORS errors"
**Solução:**
- O Netlify tem CORS configurado automaticamente
- Verifique se as regras do Firestore permitem acesso autenticado

## 📱 Funcionalidades Disponíveis

✅ **Authentication:** Login com email/senha
✅ **Firestore:** Banco de dados em tempo real
✅ **Storage:** Upload de arquivos
✅ **Admin Panel:** Gerenciamento de usuários
✅ **Responsive:** Funciona em mobile e desktop

## 🔄 Próximos Passos

1. **Configure notificações push** (opcional)
2. **Adicione Google Analytics** (opcional)
3. **Configure backup automático** do Firestore
4. **Adicione monitoramento** de performance

---

## 🎯 Resumo

**Status:** ✅ Firebase configurado para Netlify
**Deploy:** Pronto para produção
**Teste:** `npm run firebase:test` ✅ PASSED
**Documentação:** README-FIREBASE.md

Agora você pode fazer deploy da sua aplicação no Netlify com o Firebase totalmente funcional! 🚀
