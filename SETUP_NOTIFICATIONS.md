# Configuração de Notificações Push (Firebase Cloud Messaging)

## Passo 1: Instalar Firebase

```bash
npm install firebase
```

## Passo 2: Criar Projeto no Firebase

1. Acesse https://console.firebase.google.com/
2. Crie um novo projeto ou use um existente
3. Ative o Firebase Cloud Messaging (FCM)
4. Gere as credenciais Web Push (VAPID Key)

## Passo 3: Configurar Variáveis de Ambiente

Adicione as seguintes variáveis no arquivo `.env`:

```env
VITE_FIREBASE_API_KEY="sua-api-key"
VITE_FIREBASE_AUTH_DOMAIN="seu-projeto.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="seu-projeto-id"
VITE_FIREBASE_STORAGE_BUCKET="seu-projeto.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="seu-sender-id"
VITE_FIREBASE_APP_ID="seu-app-id"
VITE_FIREBASE_VAPID_KEY="sua-vapid-key"
```

## Passo 4: Atualizar Service Worker

O arquivo `public/firebase-messaging-sw.js` precisa ter as credenciais atualizadas.
Substitua os placeholders pelas suas credenciais reais do Firebase.

## Passo 5: Aplicar Migrations no Supabase

Execute as migrations para criar as tabelas de notificações:

```bash
# Se estiver usando Supabase CLI
supabase db push

# Ou aplique manualmente via Supabase Dashboard
# SQL Editor > Execute os arquivos:
# - 20251022000001_driver_ranking_system.sql
# - 20251022000002_fcm_notifications.sql
```

## Passo 6: Regenerar Types do Supabase

```bash
# Se estiver usando Supabase CLI
npx supabase gen types typescript --project-id seu-project-id > src/integrations/supabase/types.ts
```

## Como Funciona

### Para Motoristas:
- Recebem notificação quando um novo pedido está disponível
- Recebem confirmação quando aceitam um pedido
- Podem ativar/desativar notificações no dashboard

### Para Clientes:
- Recebem notificação quando motorista aceita o pedido
- Recebem atualizações de status (coletado, em rota, entregue)
- Recebem notificações de promoções

### Para Admins:
- Recebem notificações de novos pedidos
- Recebem alertas de solicitações de saque
- Recebem notificações de sistema

## Testando Notificações

1. Faça login como motorista
2. Clique no ícone de sino no header
3. Clique em "Ativar Notificações"
4. Permita notificações no navegador
5. Crie um novo pedido (como cliente)
6. O motorista deve receber uma notificação

## Troubleshooting

### Notificações não aparecem:
- Verifique se o navegador permite notificações
- Verifique se o service worker está registrado (DevTools > Application > Service Workers)
- Verifique o console para erros do Firebase
- Confirme que as credenciais do Firebase estão corretas

### Service Worker não registra:
- Certifique-se que está rodando em HTTPS (ou localhost)
- Limpe o cache do navegador
- Verifique se o arquivo `firebase-messaging-sw.js` está acessível em `/firebase-messaging-sw.js`

### Token FCM não é salvo:
- Verifique se as migrations foram aplicadas
- Verifique as policies RLS no Supabase
- Confirme que o usuário está autenticado
