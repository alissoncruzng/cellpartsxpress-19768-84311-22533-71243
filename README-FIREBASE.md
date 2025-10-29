# Firebase Configuration - CellPartsXpress Delivery

## ✅ Configuração Completa do Firebase CLI

O Firebase CLI foi instalado e configurado com sucesso no projeto!

### 📋 Arquivos Criados

1. **`.firebaserc`** - Configuração do projeto padrão
2. **`firebase.json`** - Configuração dos serviços Firebase
3. **`firestore.rules`** - Regras de segurança do Firestore
4. **`firestore.indexes.json`** - Índices do Firestore
5. **`test-firebase.mjs`** - Script de teste da configuração

### 🚀 Scripts Disponíveis

Adicionei os seguintes scripts no `package.json`:

```json
{
  "scripts": {
    "firebase:emulators": "firebase emulators:start",
    "firebase:deploy": "firebase deploy",
    "firebase:test": "node test-firebase.mjs",
    "firebase:login": "firebase login",
    "firebase:projects": "firebase projects:list"
  }
}
```

### 🛠️ Como Usar

#### 1. **Testar a Configuração**
```bash
npm run firebase:test
```

#### 2. **Iniciar Emuladores Locais**
```bash
npm run firebase:emulators
```
- Auth Emulator: http://localhost:9099
- Firestore Emulator: http://localhost:8080
- Emulator UI: http://localhost:4000

#### 3. **Fazer Deploy para Produção**
```bash
npm run firebase:deploy
```

#### 4. **Verificar Projetos**
```bash
npm run firebase:projects
```

### 🔧 Configuração do Firebase Console

1. **Acesse:** https://console.firebase.google.com/
2. **Selecione o projeto:** `cellpartsxpress-delivery`
3. **Verifique os serviços ativados:**
   - ✅ Authentication (Email/Senha)
   - ✅ Firestore Database
   - ✅ Storage
   - ✅ Hosting

### 🔐 Configuração de Autenticação

No Firebase Console, vá para **Authentication > Sign-in method** e ative:
- ☑️ Email/Password
- ☑️ Google (opcional)

**Domínios autorizados:**
- `localhost`
- `cellpartsxpress-delivery.web.app`
- `cellpartsxpress-delivery.firebaseapp.com`

### 🗄️ Configuração do Firestore

**Regras de segurança ativas:**
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

### 📱 Configuração no Código

As variáveis de ambiente estão configuradas em `.env.CONFIGURADO`:

```env
VITE_FIREBASE_API_KEY="AIzaSyCVF0y8L02_JCIUBj3addBFO8hz-ljfi8E"
VITE_FIREBASE_AUTH_DOMAIN="cellpartsxpress-delivery.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="cellpartsxpress-delivery"
VITE_FIREBASE_STORAGE_BUCKET="cellpartsxpress-delivery.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="76625547073"
VITE_FIREBASE_APP_ID="1:76625547073:web:4e6c8ba79dfc0a20635bc0"
VITE_FIREBASE_MEASUREMENT_ID="G-YDRMZD2SSW"
```

### 🧪 Teste Realizado

✅ **Teste de configuração:** PASSED
✅ **Firebase App:** Inicializado com sucesso
✅ **Auth Service:** Configurado
✅ **Firestore Service:** Configurado
✅ **Storage Service:** Configurado
✅ **Projeto:** Conectado a `cellpartsxpress-delivery`

### 🚨 Próximos Passos

1. **Teste a aplicação:**
   ```bash
   npm run dev
   ```

2. **Configure o usuário admin:**
   - Email: `admin@cellpartsxpress.com`
   - Senha: `admin123`

3. **Teste o login no emulador:**
   - Use a interface do emulador em http://localhost:4000

4. **Deploy para produção:**
   ```bash
   npm run firebase:deploy
   ```

### 🔍 Troubleshooting

Se encontrar algum problema:

1. **Verifique os logs:**
   ```bash
   firebase functions:log
   ```

2. **Teste a conectividade:**
   ```bash
   npm run firebase:test
   ```

3. **Reinicie os emuladores:**
   ```bash
   firebase emulators:start --force
   ```

4. **Verifique a autenticação:**
   ```bash
   firebase auth:export users.json --format=json
   ```

### 📞 Suporte

Se precisar de ajuda adicional:
- Verifique o console do navegador (F12)
- Verifique os logs do Firebase
- Teste a conectividade com `npm run firebase:test`

---

**Status:** ✅ Firebase CLI configurado e testado com sucesso!
