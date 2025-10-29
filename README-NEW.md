# CellPartsXpress Delivery

Sistema completo de delivery de peças automotivas com React, TypeScript e Supabase.

## 🚀 Tecnologias

- **Frontend**: React + TypeScript + Vite
- **UI**: TailwindCSS + Radix UI + Lucide Icons
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **PWA**: Service Worker + Manifest

## 📦 Instalação

1. **Clone o repositório**
   ```bash
   git clone <url-do-repositorio>
   cd cellpartsxpress-delivery
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env.local
   ```
   Preencha o `.env.local` com suas credenciais do Supabase.

4. **Configure o banco de dados**
   - Acesse o painel do Supabase
   - Vá para SQL Editor
   - Execute o conteúdo do arquivo `setup-supabase-schema.sql`

## 🧪 Testes

```bash
# Testar conexão com Supabase
npm run supabase:test

# Executar linting
npm run lint
```

## 🚀 Desenvolvimento

```bash
# Servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## 📋 Funcionalidades

- ✅ Autenticação completa (cliente, entregador, admin)
- ✅ Catálogo de produtos
- ✅ Sistema de pedidos
- ✅ Rastreamento de entregas
- ✅ Gestão de pagamentos
- ✅ Upload de imagens (avatars, comprovantes)
- ✅ PWA (Progressive Web App)

## 🔒 Segurança

- Row Level Security (RLS) habilitado em todas as tabelas
- Políticas de acesso granular por role
- Autenticação obrigatória para operações sensíveis

## 📱 PWA

O aplicativo é uma PWA completa com:
- Service Worker para cache offline
- Manifest para instalação
- Notificações push (configuráveis)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.
