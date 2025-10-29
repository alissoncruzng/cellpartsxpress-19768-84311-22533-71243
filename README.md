# 📱 **CellPartsXpress Delivery**

## 🚀 **Sistema de Delivery Completo com Supabase**

Aplicação web para sistema de delivery de peças de celular, desenvolvida com React, TypeScript, Vite e Supabase.

### **🎯 Funcionalidades Principais:**
- ✅ **Autenticação:** Login/Cadastro com email e senha
- ✅ **Sistema Multi-Role:** Cliente, Motorista, Admin
- ✅ **Dashboard Admin:** Gerenciamento completo do negócio
- ✅ **Catálogo de Produtos:** Interface moderna com filtros
- ✅ **Sistema de Pedidos:** Acompanhamento em tempo real
- ✅ **Upload de Arquivos:** Imagens de produtos e documentos
- ✅ **Notificações:** Sistema de notificações do navegador
- ✅ **PWA:** Progressive Web App otimizado

---

## 🛠️ **Tecnologias Utilizadas**

### **Frontend:**
- **React 18** com TypeScript
- **Vite** (build tool ultra-rápido)
- **shadcn-ui** (component library moderna)
- **Tailwind CSS** (styling utility-first)
- **React Router** (navegação SPA)
- **React Hook Form** (formulários)

### **Backend:**
- **Supabase** (PostgreSQL + Auth + Storage)
- **Row Level Security** (RLS)
- **Real-time subscriptions**
- **File storage** para uploads

---

## 🚀 **Como Executar**

### **Pré-requisitos:**
- Node.js 18+
- npm ou yarn
- Conta no [Supabase](https://supabase.com)

### **1. Clone o projeto:**
```bash
git clone <seu-repositorio>
cd cellpartsxpress-19768-84311-22533-71243
```

### **2. Instale dependências:**
```bash
npm install
```

### **3. Configure o Supabase:**

#### **a) Crie um projeto no Supabase:**
- Acesse [supabase.com](https://supabase.com)
- Crie um novo projeto
- Vá em **Settings > API**
- Copie **URL** e **anon/public key**

#### **b) Configure as variáveis de ambiente:**
```bash
# No arquivo .env
VITE_SUPABASE_URL=sua_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=sua_supabase_anon_key
VITE_ADMIN_EMAIL=admin@cellpartsxpress.com
VITE_ADMIN_PASSWORD=admin123
VITE_ADMIN_PHONE=5511999999999
VITE_WHATSAPP_BUSINESS_PHONE=5511946698650
```

#### **c) Execute as migrations:**
- No Supabase Dashboard, vá em **SQL Editor**
- Execute os scripts da pasta `supabase/`
- Configure as políticas RLS conforme documentado

### **4. Teste a conexão:**
```bash
npm run supabase:test
```

### **5. Execute o projeto:**
```bash
npm run dev
```

Acesse: **http://localhost:5173**

---

## 📋 **Scripts Disponíveis**

```bash
npm run dev              # Servidor de desenvolvimento
npm run build           # Build para produção
npm run build:dev       # Build em modo desenvolvimento
npm run lint            # Verificação de código
npm run preview         # Preview do build
npm run supabase:test   # Teste da conexão Supabase
```

---

## 🏗️ **Estrutura do Projeto**

```
src/
├── components/          # Componentes React
│   ├── ui/             # Componentes base (shadcn-ui)
│   ├── auth/           # Autenticação
│   ├── admin/          # Painel administrativo
│   └── driver/          # Dashboard motorista
├── pages/              # Páginas da aplicação
├── hooks/              # Hooks customizados
├── integrations/       # Integrações externas
│   └── supabase/       # Cliente e tipos Supabase
└── lib/                # Utilitários e configurações
    ├── supabase.ts     # Cliente Supabase principal
    ├── storage.ts      # Upload de arquivos
    └── utils.ts        # Funções utilitárias
```

---

## 🌐 **Deploy**

### **Build Otimizado:**
```bash
npm run build
```

### **Upload:**
- Faça upload da pasta `dist/` para qualquer hosting estático
- Recomendado: **Vercel**, **Netlify**, **Railway**, ou **Render**

### **Variáveis de Ambiente no Hosting:**
Configure as mesmas variáveis do `.env` no painel do seu hosting.

---

## 🔧 **Configuração Supabase**

### **Tabelas Necessárias:**
- `profiles` - Perfis de usuários
- `products` - Catálogo de produtos
- `orders` - Pedidos
- `drivers` - Motoristas
- `order_tracking` - Rastreamento de pedidos
- `user_notifications` - Permissões de notificação

### **Autenticação:**
- Email/Senha configurado
- RLS habilitado
- Políticas de segurança implementadas

### **Storage:**
- Buckets: `products`, `avatars`, `documents`
- Políticas RLS configuradas

---

## 📱 **Login Admin**

**Email:** `admin@cellpartsxpress.com`  
**Senha:** `admin123`

---

## 🆘 **Suporte**

### **Problemas Comuns:**

**1. Erro de conexão Supabase:**
- Verifique as variáveis de ambiente
- Execute `npm run supabase:test`

**2. Erro de autenticação:**
- Configure as credenciais admin no `.env`
- Verifique se o usuário existe no Supabase

**3. Erro de upload:**
- Configure os buckets no Supabase Storage
- Verifique as políticas RLS

---

## 📄 **Licença**

Este projeto é privado e proprietário da CellPartsXpress.

---

**🎯 Status:** ✅ **100% Funcional com Supabase**  
**🚀 Pronto para deploy em qualquer hosting estático!**
