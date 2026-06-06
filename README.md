# S4 Assessoria | Gestão e Tecnologia para PMEs

Sistema web para gerenciamento de projetos, clientes e precificação, desenvolvido para consultores e PMEs.

**URL de Produção:** https://s4assessoria.com.br  
**URL alternativa:** https://www.s4assessoria.com.br

---

## Sumário

- [Visão Geral](#visão-geral)
- [Stack Tecnológica](#stack-tecnológica)
- [Arquitetura](#arquitetura)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Banco de Dados](#banco-de-dados)
- [Serverless Functions](#serverless-functions)
- [Funcionalidades](#funcionalidades)
- [Autenticação e Segurança](#autenticação-e-segurança)
- [Painel Admin](#painel-admin)
- [Monitoramento de Erros](#monitoramento-de-erros-sentry)
- [Notificações](#notificações)
- [Instalação e Desenvolvimento Local](#instalação-e-desenvolvimento-local)
- [Deploy](#deploy)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Decisões de Arquitetura](#decisões-de-arquitetura)

---

## Visão Geral

O S4 Assessoria é uma SPA (Single Page Application) com tema escuro que permite ao consultor:

- Cadastrar e gerenciar **clientes**
- Criar e acompanhar **projetos** com status, prazos e valores
- Definir **etapas (checklist)** por projeto
- Calcular o **preço ideal** de um projeto com base em horas, complexidade e margem
- Configurar **parâmetros padrão** da calculadora
- Visualizar o **dashboard** com gráficos e métricas

Cada usuário vê apenas seus próprios dados — o sistema é multi-tenant por `user_id`.

---

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 19 + TypeScript + Vite 8 |
| Estilização | Tailwind CSS 4 |
| Roteamento | React Router DOM 7 |
| Gráficos | Recharts 3 |
| Ícones | Lucide React |
| Validação | Zod 4 |
| Banco de dados | Oracle Autonomous AI Database (ATP) 19c |
| API REST | Oracle ORDS (AutoREST) |
| Serverless | Vercel Functions (Node.js) |
| Hash de senha | Argon2id via `@node-rs/argon2` (server-side) |
| Email transacional | Resend |
| Monitoramento | Sentry (`@sentry/react` + `@sentry/vite-plugin`) |
| Deploy | Vercel |

---

## Arquitetura

```
Browser
  │
  │  HTTPS (mesmo domínio — sem CORS)
  ▼
Vercel Edge
  ├── /assets/*                 → arquivos estáticos (CSS, JS chunks)
  ├── /api/auth/login           → Vercel Function — autenticação Argon2+Pepper
  ├── /api/auth/register        → Vercel Function — cadastro + criação de org
  ├── /api/auth/forgot-password → Vercel Function — envia email com token
  ├── /api/auth/reset-password  → Vercel Function — valida token e redefine senha
  ├── /api/notifications/deadline → Vercel Function (cron diário 9h) — alertas de prazo
  ├── /api/{projects,clients,users,parameters,steps}/* → Vercel Functions — proxy ORDS
  ├── / e /landing              → landing.html (página pública)
  └── /*                        → index.html (SPA fallback — app autenticado)
          │
          │  HTTPS (server-side — sem CORS)
          ▼
Oracle ORDS (Autonomous Database)
  └── /ords/admin/s4_{tabela}/  → AutoREST CRUD
```

O Vercel atua como intermediário em duas camadas:
1. **Serverless Functions** para operações que exigem segurança server-side (auth, Argon2, envio de email)
2. **Proxy ORDS** para as demais operações CRUD, protegidas pela `x-s4-internal-key`

O browser nunca acessa o Oracle diretamente — tudo passa por `/api/*` no domínio do Vercel.

---

## Estrutura do Projeto

```
Projeto-S4/
├── api/
│   ├── [...path].js                  # Proxy fallback → Oracle ORDS (autenticado por internal key)
│   ├── auth/
│   │   ├── login.js                  # Argon2+Pepper verify + migração de legado SHA-256
│   │   ├── register.js               # Cadastro com Argon2 hash + criação de organização
│   │   ├── forgot-password.js        # Gera token HMAC-SHA256 e envia email via Resend
│   │   └── reset-password.js         # Valida token e atualiza hash da senha
│   ├── lib/
│   │   └── ords-proxy.js             # Helper de fetch para o Oracle ORDS
│   ├── notifications/
│   │   └── deadline.js               # Cron: busca projetos com prazo próximo e notifica por email
│   └── services/
│       ├── clients.js                # Proxy ORDS /s4_clients
│       ├── parameters.js             # Proxy ORDS /s4_parameters
│       ├── projects.js               # Proxy ORDS /s4_projects
│       ├── steps.js                  # Proxy ORDS /s4_project_steps
│       └── users.js                  # Proxy ORDS /s4_users
│
├── src/
│   ├── App.tsx                       # Roteamento com React.lazy (code splitting por rota)
│   ├── main.tsx                      # Entry point — inicializa Sentry antes do React
│   ├── index.css                     # Estilos globais + Tailwind
│   ├── styles/
│   │   └── print.css                 # Estilos de impressão/PDF para ProjectDetail
│   │
│   ├── types/
│   │   └── index.ts                  # Interfaces: User, Organization, Client, Project, ...
│   │
│   ├── context/
│   │   └── AuthContext.tsx           # Contexto global: login, register, logout, isAdmin
│   │
│   ├── hooks/
│   │   ├── useAdminUsers.ts          # Gerencia lista de usuários no painel admin
│   │   ├── useAsyncAction.ts         # Hook genérico: loading + error para ações assíncronas
│   │   ├── useDashboardData.ts       # Agrega dados do dashboard
│   │   └── useLoginForm.ts           # Lógica do formulário de login/registro
│   │
│   ├── lib/
│   │   ├── api.ts                    # Cliente HTTP — todos os endpoints (auth + CRUD)
│   │   ├── constants.ts              # Constantes globais (ex: complexidade, status)
│   │   ├── schemas.ts                # Schemas Zod de validação
│   │   ├── sentry.ts                 # Inicialização do Sentry (BrowserTracing + Replay)
│   │   ├── storage.ts                # Helper sessionStorage
│   │   └── utils.ts                  # Helpers: formatCurrency, formatDate, statusColor
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Layout.tsx            # Shell com sidebar + outlet
│   │   │   ├── Sidebar.tsx           # Navegação lateral
│   │   │   └── ProtectedRoute.tsx    # Guarda de rota — redireciona para /login
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Input.tsx
│   │       ├── Select.tsx
│   │       └── Textarea.tsx
│   │
│   └── pages/
│       ├── Login.tsx                 # Login + cadastro (com fluxo de aprovação)
│       ├── ForgotPassword.tsx        # Solicitar redefinição de senha
│       ├── ResetPassword.tsx         # Formulário de nova senha (via token de email)
│       ├── Dashboard.tsx             # Métricas + gráficos
│       ├── Calculator.tsx            # Calculadora de precificação
│       ├── Parameters.tsx            # Parâmetros padrão da calculadora
│       ├── admin/
│       │   └── AdminPanel.tsx        # Painel admin — aprovar/excluir contas
│       ├── clients/
│       │   ├── ClientList.tsx
│       │   └── ClientForm.tsx
│       └── projects/
│           ├── ProjectList.tsx
│           ├── ProjectForm.tsx
│           └── ProjectDetail.tsx     # Detalhes + checklist + impressão/PDF
│
├── e2e/                              # Testes E2E com Playwright + BDD (Cucumber)
│   ├── features/                     # Cenários .feature (Gherkin)
│   └── steps/                        # Step definitions TypeScript
│
├── database/
│   └── migrations/
│       └── 001_create_tables.sql     # Schema Oracle (referência)
│
├── vercel.json                       # Roteamento Vercel + cron de notificações
├── vite.config.ts                    # Vite + Tailwind + Sentry plugin + code splitting
├── vitest.config.ts                  # Configuração de testes unitários
├── playwright.config.ts              # Configuração de testes E2E
├── tsconfig.json
└── package.json
```

---

## Banco de Dados

**Oracle Autonomous AI Database (ATP)** hospedado na Oracle Cloud Free Tier, região Brazil East (São Paulo). Acesso via Oracle ORDS AutoREST sobre HTTPS.

> A URL do banco é configurada pela variável de ambiente `ORDS_BASE_URL` — nunca exposta no código-fonte ou em arquivos versionados.

### Tabelas

> **Nota:** o arquivo `database/migrations/001_create_tables.sql` é um schema de referência com nomes sem prefixo. As tabelas reais no Oracle usam o prefixo `S4_` para evitar conflito com objetos reservados do schema `ADMIN`.

#### `S4_USERS`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | NUMBER IDENTITY | PK auto-gerada |
| `email` | VARCHAR2(255) NOT NULL UNIQUE | Email de login |
| `name` | VARCHAR2(255) NOT NULL | Nome do usuário |
| `password_hash` | VARCHAR2(255) NOT NULL | Hash Argon2id da senha (com pepper) |
| `logo_url` | VARCHAR2(500) | `'PENDING'` = aguarda aprovação; `null` = conta ativa |
| `org_id` | NUMBER | FK → S4_ORGANIZATIONS (opcional) |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Última atualização |

#### `S4_ORGANIZATIONS`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | NUMBER IDENTITY | PK |
| `name` | VARCHAR2(255) NOT NULL | Nome da organização |
| `slug` | VARCHAR2(255) NOT NULL UNIQUE | Slug gerado do nome |
| `plan` | VARCHAR2(20) DEFAULT 'free' | `free` / `pro` / `owner` |
| `status` | VARCHAR2(20) DEFAULT 'active' | `active` / `suspended` |
| `owner_id` | NUMBER | FK → S4_USERS |
| `created_at` | TIMESTAMP | Data de criação |

#### `S4_CLIENTS`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | NUMBER IDENTITY | PK |
| `user_id` | NUMBER NOT NULL | FK → S4_USERS |
| `name` | VARCHAR2(255) NOT NULL | Nome do cliente |
| `email` | VARCHAR2(255) | Email |
| `phone` | VARCHAR2(50) | Telefone |
| `company` | VARCHAR2(255) | Empresa |
| `notes` | CLOB | Observações |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Última atualização |

#### `S4_PROJECTS`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | NUMBER IDENTITY | PK |
| `user_id` | NUMBER NOT NULL | FK → S4_USERS |
| `client_id` | NUMBER NOT NULL | FK → S4_CLIENTS |
| `name` | VARCHAR2(255) NOT NULL | Nome do projeto |
| `description` | CLOB | Descrição |
| `status` | VARCHAR2(50) | `Em andamento` / `Concluído` / `Pausado` / `Cancelado` |
| `value` | NUMBER(15,2) | Valor do projeto (R$) |
| `deadline` | DATE | Prazo de entrega |
| `useful_links` | CLOB | Links úteis |
| `notes` | CLOB | Observações |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Última atualização |

#### `S4_PROJECT_STEPS`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | NUMBER IDENTITY | PK |
| `project_id` | NUMBER NOT NULL | FK → S4_PROJECTS |
| `title` | VARCHAR2(500) NOT NULL | Título da etapa |
| `completed` | NUMBER(1) DEFAULT 0 | `0` = pendente, `1` = concluído |
| `position` | NUMBER DEFAULT 0 | Ordem no checklist |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Última atualização |

#### `S4_PARAMETERS`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | NUMBER IDENTITY | PK |
| `user_id` | NUMBER NOT NULL UNIQUE | FK → S4_USERS (1 por usuário) |
| `hourly_rate` | NUMBER(10,2) DEFAULT 100 | Valor/hora padrão (R$) |
| `default_margin` | NUMBER(5,2) DEFAULT 20 | Margem mínima padrão (%) |
| `default_complexity` | VARCHAR2(50) DEFAULT 'Médio' | Complexidade padrão |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Última atualização |

---

## Serverless Functions

As Vercel Functions em `api/` são o backend real do sistema. O Oracle ORDS é acessado apenas server-side.

### Auth (`api/auth/`)

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/auth/login` | POST | Verifica senha com Argon2+Pepper; migra legado SHA-256 na primeira entrada |
| `/api/auth/register` | POST | Hash Argon2 da senha; cria organização (opcional); status inicial `PENDING` |
| `/api/auth/forgot-password` | POST | Gera token HMAC-SHA256 com expiração de 1h; envia email via Resend |
| `/api/auth/reset-password` | POST | Valida token; atualiza `password_hash` com novo hash Argon2 |

#### Rate limiting (login)
O endpoint de login aplica rate limiting de **10 tentativas por IP por 15 minutos**. Resposta em caso de excesso: `HTTP 429 { "error": "too_many_attempts" }`.

> Implementado com Map em memória por instância serverless. Para ambientes de alta concorrência, substituir por Vercel KV ou Upstash Redis.

### Serviços (`api/services/`)

Cada arquivo faz proxy autenticado para o ORDS, validando a `x-s4-internal-key` antes de repassar a requisição.

| Arquivo | Tabela ORDS |
|---------|-------------|
| `clients.js` | `s4_clients` |
| `projects.js` | `s4_projects` |
| `steps.js` | `s4_project_steps` |
| `parameters.js` | `s4_parameters` |
| `users.js` | `s4_users` |

### Notificações (`api/notifications/deadline.js`)

Cron job executado diariamente às **09:00 BRT** via Vercel Crons. Lógica:
1. Busca todos os projetos com status `Em andamento`
2. Filtra aqueles com prazo nos próximos 3 dias
3. Envia email ao usuário dono de cada projeto via Resend

Configurado em `vercel.json`:
```json
"crons": [{ "path": "/api/notifications/deadline", "schedule": "0 9 * * *" }]
```

---

## Funcionalidades

### Dashboard (`/`)
- Cards de resumo: total de projetos, projetos ativos, total de clientes, próximos prazos
- Gráfico de linha: projetos criados por mês (últimos 6 meses)
- Gráfico de pizza: projetos por cliente
- Gráfico de barras: projetos por status
- Tabela de projetos recentes com link para detalhes
- Atalhos rápidos para criar projeto, cliente e abrir calculadora

### Projetos (`/projects`)
- Listagem com filtro por status e busca por nome
- Criação e edição: nome, cliente, status, valor, prazo, links úteis, notas
- Página de detalhe com checklist de etapas (adicionar, marcar concluído, remover)
- Impressão / exportação para PDF via CSS de mídia print (`src/styles/print.css`)
- Exclusão de projetos

### Clientes (`/clients`)
- Listagem com busca por nome
- Cadastro completo: nome, email, telefone, empresa, observações
- Exclusão bloqueada se o cliente tiver projetos vinculados

### Calculadora de Precificação (`/calculator`)
Fórmula aplicada em cadeia:

```
Base             = valor/hora × horas estimadas
Com complexidade = base × fator_complexidade
Com extras       = com_complexidade + custos_extras
Preço sugerido   = com_extras × (1 + margem / 100)
```

| Complexidade | Fator |
|---|---|
| Simples | 1.0× |
| Médio | 1.3× |
| Complexo | 1.7× |
| Muito Complexo | 2.2× |

Os valores iniciais são carregados automaticamente dos **Parâmetros** do usuário.

### Parâmetros (`/parameters`)
Configura os valores padrão usados na Calculadora:
- Valor/hora (R$)
- Margem mínima (%)
- Complexidade padrão

---

## Autenticação e Segurança

### Fluxo de registro e login

1. **Registro** — usuário informa nome, email e senha; conta criada com status `PENDING` (campo `logo_url = 'PENDING'` na tabela `S4_USERS`)
2. **Hash** — a senha é hasheada **server-side** com Argon2id + Pepper (`AUTH_PEPPER`); a senha jamais trafega ou é armazenada em texto claro
3. **Aprovação** — conta permanece bloqueada até o admin aprovar via Painel Admin
4. **Login** — a function `api/auth/login.js` verifica o hash; retorna `ok` | `pending` | `invalid`
5. **Sessão** — dados do usuário ficam em `sessionStorage` — limpam ao fechar o browser
6. **Rotas protegidas** — `ProtectedRoute` redireciona para `/login` se não há sessão ativa

### Migração de legado SHA-256

Contas criadas antes da implementação do Argon2 tinham senha hasheada com SHA-256 no browser. Na **primeira entrada** de cada usuário legado, o sistema:
1. Verifica o hash SHA-256 armazenado
2. Se válido, gera imediatamente um novo hash Argon2id e atualiza o banco
3. A partir desse momento, o usuário passa a usar Argon2

### Recuperação de senha

Fluxo completo disponível em `/forgot-password`:

1. Usuário informa o email
2. `api/auth/forgot-password.js` gera um token HMAC-SHA256 com expiração de 1 hora
3. Email enviado via **Resend** com link para `/reset-password?token=...`
4. `api/auth/reset-password.js` valida o token (HMAC + TTL) e atualiza o hash da senha

### Proteção do proxy ORDS

Todas as requisições ao proxy ORDS passam pelo header `x-s4-internal-key` (variável `INTERNAL_API_KEY`). O frontend também envia esse header via `VITE_INTERNAL_API_KEY`, validado pelas Vercel Functions antes de repassar para o Oracle.

### Headers HTTP de segurança

Aplicados em todas as respostas via `vercel.json`:

| Header | Valor |
|--------|-------|
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `SAMEORIGIN` |
| `X-XSS-Protection` | `1; mode=block` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |

---

## Painel Admin

Acessível em `/admin` — visível apenas para o usuário com email `smnogueira@proton.me` (constante `ADMIN_EMAIL` em `src/lib/api.ts`).

| Ação | Descrição |
|------|-----------|
| **Ver contas pendentes** | Usuários cadastrados aguardando aprovação |
| **Aprovar conta** | Define `logo_url = null`, liberando acesso ao sistema |
| **Excluir conta** | Remove o usuário do banco |
| **Excluir todas as contas** | Remove todos os usuários exceto o admin |

### Como funciona o status de aprovação

O campo `logo_url` da tabela `S4_USERS` é reaproveitado como marcador de status:

| Valor de `logo_url` | Significado |
|---------------------|-------------|
| `'PENDING'` | Conta aguardando aprovação |
| `null` | Conta ativa — acesso liberado |

> Reaproveitamento de campo para evitar migração de schema. Em versão futura, recomenda-se coluna `status VARCHAR2(20)` dedicada.

---

## Monitoramento de Erros (Sentry)

O projeto usa `@sentry/react` (frontend) e `@sentry/vite-plugin` (source maps em deploy).

### Configuração

Sentry é inicializado em `src/lib/sentry.ts` antes do render do React:
- **BrowserTracing** — rastreamento de performance por rota
- **Replay** — gravação de sessão em erros (10% das sessões, 100% dos erros)

O DSN é configurado via variável de ambiente `VITE_SENTRY_DSN`. O plugin Vite faz upload automático dos source maps durante o `npm run build` se `SENTRY_AUTH_TOKEN` estiver disponível.

### Variáveis necessárias no dashboard da Vercel

| Variável | Onde obter |
|----------|-----------|
| `VITE_SENTRY_DSN` | Sentry → Settings → Client Keys (DSN) |
| `SENTRY_AUTH_TOKEN` | Sentry → Settings → Auth Tokens |

---

## Notificações

O cron job `api/notifications/deadline.js` executa diariamente às 09:00 e envia email para usuários com projetos vencendo nos próximos 3 dias. Usa a API **Resend** com o `RESEND_API_KEY`.

---

## Instalação e Desenvolvimento Local

### Pré-requisitos
- Node.js 20+
- npm 10+

### Setup

```bash
# 1. Clone o repositório
git clone https://github.com/MuriloTBS/s4-assessoria.git
cd s4-assessoria

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente (veja a seção Variáveis de Ambiente)
cp .env.example .env.local
# edite .env.local com os valores reais

# 4. Inicie o servidor de desenvolvimento
npx vercel dev
```

> Use `npx vercel dev` em vez de `npm run dev` para que as Vercel Functions (`api/`) e o proxy ORDS funcionem localmente com as variáveis de ambiente corretas.

O app abre em `http://localhost:3000`.

### Comandos disponíveis

| Comando | Descrição |
|---------|-----------|
| `npx vercel dev` | Dev com HMR + Vercel Functions + proxy ORDS |
| `npm run dev` | Dev só com Vite (sem Functions) |
| `npm run build` | Build de produção (TypeScript + Vite + source maps Sentry) |
| `npm run preview` | Preview do build de produção |
| `npm run typecheck` | Verificação TypeScript sem gerar arquivos |
| `npm run lint` | ESLint |
| `npm test` | Testes unitários com Vitest |
| `npm run test:coverage` | Testes com relatório de cobertura |
| `npm run test:e2e` | Testes E2E com Playwright + BDD |

---

## Deploy

O deploy é feito na **Vercel** via CLI ou push para o branch `main`:

```bash
npx vercel --prod
```

O Vercel:
1. Executa `npm run build` (TypeScript → Vite → chunks separados por rota)
2. Publica `dist/` como assets estáticos com CDN global
3. Aplica as regras de roteamento do `vercel.json`
4. Registra as Vercel Functions em `api/`
5. Agenda o cron de notificações

### Bundle de produção (code splitting)

Cada rota é carregada sob demanda (`React.lazy`). Os vendors são divididos em chunks separados:

| Chunk | Conteúdo | Tamanho (gzip) |
|-------|----------|---------------|
| `vendor-react` | react, react-dom, react-router-dom | ~71 KB |
| `vendor-sentry` | @sentry/react | ~87 KB |
| `vendor-charts` | recharts + d3 | ~113 KB |
| `index` | App entry + código da aplicação | ~6 KB |
| Cada rota | Componente isolado | 1–20 KB |

O usuário que nunca acessa o Dashboard **nunca carrega** o recharts (113 KB).

### vercel.json (estrutura resumida)

```json
{
  "routes": [
    { "src": "/(.*)", "headers": { /* headers de segurança HTTP */ }, "continue": true },
    { "src": "/api/auth/login",            "dest": "/api/auth/login.js" },
    { "src": "/api/auth/register",         "dest": "/api/auth/register.js" },
    { "src": "/api/auth/forgot-password",  "dest": "/api/auth/forgot-password.js" },
    { "src": "/api/auth/reset-password",   "dest": "/api/auth/reset-password.js" },
    { "src": "/api/notifications/deadline","dest": "/api/notifications/deadline.js" },
    { "src": "/api/projects(.*)",          "dest": "/api/services/projects.js" },
    { "src": "/api/clients(.*)",           "dest": "/api/services/clients.js" },
    { "src": "/api/users(.*)",             "dest": "/api/services/users.js" },
    { "src": "/api/parameters(.*)",        "dest": "/api/services/parameters.js" },
    { "src": "/api/steps(.*)",             "dest": "/api/services/steps.js" },
    { "src": "/api/(.*)",                  "dest": "<ORDS_BASE_URL>/$1" },
    { "src": "/",                          "dest": "/landing.html" },
    { "handle": "filesystem" },
    { "src": "/(.*)",                      "dest": "/index.html" }
  ],
  "crons": [
    { "path": "/api/notifications/deadline", "schedule": "0 9 * * *" }
  ]
}
```

---

## Variáveis de Ambiente

Configure todas as variáveis no **dashboard da Vercel** (Settings → Environment Variables). Nunca faça commit de valores reais.

| Variável | Onde usar | Descrição |
|----------|-----------|-----------|
| `ORDS_BASE_URL` | Vercel Functions | URL base do Oracle ORDS (sem trailing slash) |
| `AUTH_PEPPER` | `api/auth/login.js`, `api/auth/register.js`, `api/auth/reset-password.js` | Segredo adicionado à senha antes do hash Argon2. Gere com `openssl rand -hex 32` |
| `RESET_SECRET` | `api/auth/forgot-password.js`, `api/auth/reset-password.js` | Segredo para assinar tokens de recuperação de senha. Gere com `openssl rand -hex 32` |
| `INTERNAL_API_KEY` | Todas as Functions de serviço | Chave compartilhada entre frontend e backend para autenticar o proxy ORDS |
| `RESEND_API_KEY` | `api/auth/forgot-password.js`, `api/notifications/deadline.js` | Chave da API Resend para envio de emails |
| `VITE_INTERNAL_API_KEY` | Frontend (Vite) | Deve ter o mesmo valor de `INTERNAL_API_KEY` |
| `VITE_SENTRY_DSN` | Frontend (Vite) | DSN do projeto Sentry (Settings → Client Keys) |
| `SENTRY_AUTH_TOKEN` | Build (Vite plugin) | Token para upload de source maps. Configure em `.env.sentry-build-plugin` localmente ou como var na Vercel |

> O arquivo `.env.sentry-build-plugin` já está no `.gitignore`. Nunca comite esse arquivo.

---

## Decisões de Arquitetura

### Por que Argon2 server-side e não SHA-256 no browser?

O modelo original hasheava a senha no browser com SHA-256 + salt fixo antes de enviar. Isso protege contra interceptação em trânsito, mas tem limitações: SHA-256 é extremamente rápido, facilitando ataques de força bruta offline caso o banco seja comprometido. Argon2id é resistente por design a ataques de GPU e ASIC. O Pepper garante que o hash do banco sozinho — sem a chave do servidor — é inútil.

### Por que Vercel Functions e não só o ORDS?

O Oracle ORDS é excelente para CRUD, mas não executa lógica de negócio complexa server-side (Argon2, envio de email, geração de token HMAC). As Vercel Functions complementam o ORDS sem exigir infraestrutura adicional.

### Por que proxy Vercel em vez de chamar o Oracle diretamente?

Chamadas diretas do browser para domínios Oracle são bloqueadas por CORS. O Vercel atua como proxy reverso server-side, eliminando o problema. Como bônus, a URL real do banco nunca fica exposta no código do frontend.

### Por que `routes` em vez de `rewrites` no vercel.json?

Os `rewrites` são interceptados pelo catch-all SPA `/(.*) → /index.html` antes de chegarem ao proxy Oracle. O formato `routes` processa as regras em ordem explícita, garantindo que `/api/*` seja tratado antes do SPA fallback.

### Por que React.lazy por rota?

O bundle original era um único arquivo de 743 KB. Com `React.lazy`, o usuário na tela de login carrega apenas ~183 KB gzipped. O recharts (113 KB gzip) só é baixado quando o Dashboard é acessado pela primeira vez. Cada rota adicional é um chunk de 1–20 KB.

### Por que `sessionStorage` em vez de `localStorage`?

A sessão expira ao fechar o browser — comportamento esperado para uma ferramenta que pode ser acessada em computadores compartilhados. O ideal de longo prazo seria um `HttpOnly cookie` gerenciado pelo servidor (imune a XSS), mas exigiria refatoração da camada de auth.

### Por que enviar timestamps do frontend?

O Oracle ORDS AutoREST envia `NULL` para colunas ausentes no body do POST, sobrescrevendo `DEFAULT CURRENT_TIMESTAMP`. Enviar `created_at` e `updated_at` direto do frontend contorna esse comportamento sem precisar de triggers ou alterações de schema.

### Por que o campo `logo_url` como marcador de status?

Para evitar uma migração de schema (`ALTER TABLE ADD COLUMN`) em produção com dados reais, o campo `logo_url` — sem uso funcional na UI atual — foi reaproveitado como flag `'PENDING'` / `null`. Uma migração futura deve adicionar coluna `status` dedicada.
