# S4 Assessoria — Sistema de Gestão para Freelancers

Sistema web completo para gerenciamento de projetos, clientes e precificação, desenvolvido para freelancers e consultores independentes.

**URL de Produção:** https://s4-assessoria.vercel.app

---

## Sumário

- [Visão Geral](#visão-geral)
- [Stack Tecnológica](#stack-tecnológica)
- [Arquitetura](#arquitetura)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Banco de Dados](#banco-de-dados)
- [API REST (ORDS)](#api-rest-ords)
- [Funcionalidades](#funcionalidades)
- [Autenticação](#autenticação)
- [Instalação e Desenvolvimento Local](#instalação-e-desenvolvimento-local)
- [Deploy](#deploy)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Decisões de Arquitetura](#decisões-de-arquitetura)

---

## Visão Geral

O S4 Assessoria é uma SPA (Single Page Application) com tema escuro que permite ao freelancer:

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
| Banco de dados | Oracle Autonomous AI Database (ATP) 19c |
| API REST | Oracle ORDS (AutoREST) |
| Proxy / Deploy | Vercel |
| Hash de senha | Web Crypto API (SHA-256, nativo do browser) |

---

## Arquitetura

```
Browser
  │
  │  HTTPS (mesmo domínio — sem CORS)
  ▼
Vercel Edge
  ├── /assets/*      → arquivos estáticos (CSS, JS, fontes)
  ├── /api/*         → proxy reverso → Oracle ORDS
  ├── / e /landing   → landing.html (página pública)
  └── /*             → index.html (SPA fallback — app autenticado)
          │
          │  HTTPS
          ▼
Oracle ORDS (Autonomous Database)
  └── /ords/admin/{tabela}/   → AutoREST CRUD
```

O Vercel atua como proxy reverso para o Oracle ORDS, eliminando problemas de CORS. O browser nunca chama o Oracle diretamente — tudo passa por `/api/*` no mesmo domínio do Vercel.

---

## Estrutura do Projeto

```
Projeto-S4/
├── api/
│   └── [...path].js          # Vercel Edge Function — proxy para Oracle ORDS
├── src/
│   ├── App.tsx                # Roteamento principal
│   ├── main.tsx               # Entry point React
│   ├── index.css              # Estilos globais + Tailwind
│   ├── vite-env.d.ts          # Tipos de ambiente Vite
│   │
│   ├── types/
│   │   └── index.ts           # Interfaces TypeScript (User, Client, Project, ...)
│   │
│   ├── context/
│   │   └── AuthContext.tsx    # Contexto de autenticação (login, register, logout)
│   │
│   ├── lib/
│   │   ├── api.ts             # Cliente HTTP — todos os endpoints Oracle ORDS
│   │   ├── hash.ts            # Hash SHA-256 de senhas via Web Crypto API
│   │   ├── utils.ts           # Helpers: formatCurrency, formatDate, statusColor
│   │   └── storage.ts         # (legado) mock localStorage inicial
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Layout.tsx         # Shell com sidebar + outlet
│   │   │   ├── Sidebar.tsx        # Navegação lateral
│   │   │   └── ProtectedRoute.tsx # Guarda de rota — redireciona para /login
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Input.tsx
│   │       ├── Select.tsx
│   │       └── Textarea.tsx
│   │
│   └── pages/
│       ├── Login.tsx              # Login + cadastro
│       ├── Dashboard.tsx          # Métricas + gráficos
│       ├── Calculator.tsx         # Calculadora de precificação
│       ├── Parameters.tsx         # Parâmetros padrão da calculadora
│       ├── clients/
│       │   ├── ClientList.tsx     # Listagem de clientes
│       │   └── ClientForm.tsx     # Criar / editar cliente
│       └── projects/
│           ├── ProjectList.tsx    # Listagem de projetos
│           ├── ProjectForm.tsx    # Criar / editar projeto
│           └── ProjectDetail.tsx  # Detalhes + checklist de etapas
│
├── database/
│   └── migrations/
│       └── 001_create_tables.sql  # Schema Oracle (referência)
│
├── vercel.json                # Roteamento Vercel (proxy + SPA)
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Banco de Dados

**Oracle Autonomous AI Database (ATP)** hospedado na Oracle Cloud Free Tier, região Brazil East (São Paulo).

- Host: `g6602a8de4565f4-s4db.adb.sa-saopaulo-1.oraclecloudapps.com`
- Schema: `ADMIN`
- Acesso: Oracle ORDS AutoREST via HTTPS

### Tabelas

> **Nota:** o arquivo `database/migrations/001_create_tables.sql` é um schema de referência com nomes sem prefixo (`users`, `clients`, etc.). As tabelas reais no Oracle foram criadas com o prefixo `S4_` para evitar conflito com objetos reservados do schema `ADMIN`.

#### `S4_USERS`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | NUMBER IDENTITY | PK auto-gerada |
| `email` | VARCHAR2(255) NOT NULL UNIQUE | Email de login |
| `name` | VARCHAR2(255) NOT NULL | Nome do usuário |
| `password_hash` | VARCHAR2(255) NOT NULL | SHA-256 da senha |
| `logo_url` | VARCHAR2(500) | URL do logo/avatar (campo reservado — não usado na UI atual) |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Última atualização |

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
| `completed` | NUMBER(1) DEFAULT 0 | 0 = pendente, 1 = concluído |
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

## API REST (ORDS)

Todos os endpoints são acessados pelo frontend via `/api/*`, que o Vercel faz proxy para:

```
https://g6602a8de4565f4-s4db.adb.sa-saopaulo-1.oraclecloudapps.com/ords/admin/*
```

Os endpoints seguem o padrão AutoREST do Oracle ORDS.

### Endpoints disponíveis

#### Usuários
| Método | Caminho | Descrição |
|--------|---------|-----------|
| `GET` | `/api/s4_users/?q={"email":"...","password_hash":"..."}` | Login (filtra por credenciais) |
| `POST` | `/api/s4_users/` | Cadastro de novo usuário |

#### Clientes
| Método | Caminho | Descrição |
|--------|---------|-----------|
| `GET` | `/api/s4_clients/?q={"user_id":N}&limit=200` | Lista clientes do usuário |
| `GET` | `/api/s4_clients/{id}` | Busca cliente por ID |
| `POST` | `/api/s4_clients/` | Cria cliente |
| `PUT` | `/api/s4_clients/{id}` | Atualiza cliente |
| `DELETE` | `/api/s4_clients/{id}` | Remove cliente |

#### Projetos
| Método | Caminho | Descrição |
|--------|---------|-----------|
| `GET` | `/api/s4_projects/?q={"user_id":N}&limit=200&orderby=deadline` | Lista projetos |
| `GET` | `/api/s4_projects/{id}` | Busca projeto por ID |
| `POST` | `/api/s4_projects/` | Cria projeto |
| `PUT` | `/api/s4_projects/{id}` | Atualiza projeto |
| `DELETE` | `/api/s4_projects/{id}` | Remove projeto |

#### Etapas do Projeto
| Método | Caminho | Descrição |
|--------|---------|-----------|
| `GET` | `/api/s4_project_steps/?q={"project_id":N}&orderby=position` | Lista etapas |
| `POST` | `/api/s4_project_steps/` | Cria etapa |
| `PUT` | `/api/s4_project_steps/{id}` | Atualiza etapa (ex: marcar concluído) |
| `DELETE` | `/api/s4_project_steps/{id}` | Remove etapa |

#### Parâmetros
| Método | Caminho | Descrição |
|--------|---------|-----------|
| `GET` | `/api/s4_parameters/?q={"user_id":N}&limit=1` | Busca parâmetros do usuário |
| `POST` | `/api/s4_parameters/` | Cria parâmetros (primeira vez) |
| `PUT` | `/api/s4_parameters/{id}` | Atualiza parâmetros |

### Formato de resposta (lista)
```json
{
  "items": [ { "id": 1, "name": "...", "..." : "..." } ],
  "hasMore": false,
  "limit": 200,
  "offset": 0,
  "count": 5
}
```

### Filtro QBE (Query By Example)
O ORDS aceita filtros via parâmetro `q` em formato JSON:
```
?q={"user_id":1}           → WHERE user_id = 1
?q={"status":"Concluído"}  → WHERE status = 'Concluído'
```

---

## Funcionalidades

### Dashboard (`/`)
- Cards de resumo: total de projetos, projetos ativos, total de clientes, próximos prazos
- Gráfico de linha: projetos criados por mês (últimos 6 meses)
- Gráfico de pizza: projetos distribuídos por cliente
- Gráfico de barras: projetos por status
- Tabela de projetos recentes com link para detalhes
- Atalhos rápidos para criar projeto, cliente e abrir calculadora

### Projetos (`/projects`)
- Listagem com filtro por status e busca por nome
- Criação e edição: nome, cliente, status, valor, prazo, links úteis, notas
- Página de detalhe com checklist de etapas (adicionar, marcar concluído, remover)
- Exclusão de projetos (remove também as etapas vinculadas)

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

## Autenticação

O sistema usa autenticação própria sem serviço externo:

1. **Registro:** usuário informa nome, email e senha
2. **Hash:** a senha é hasheada no browser com SHA-256 + salt via Web Crypto API
   ```typescript
   // src/lib/hash.ts
   // salt fixo: 's4assessoria_salt'
   crypto.subtle.digest('SHA-256', encode(password + 's4assessoria_salt'))
   ```
3. **Armazenamento:** apenas o hash é enviado e salvo no Oracle — a senha nunca trafega em texto claro
4. **Login:** o hash é recalculado no browser e comparado via filtro QBE no Oracle
5. **Sessão:** dados do usuário (`id`, `name`, `email`) ficam em `sessionStorage` — limpam ao fechar o browser
6. **Rotas protegidas:** `ProtectedRoute` redireciona para `/login` se não há sessão ativa

> **Nota de segurança:** os endpoints Oracle são públicos (sem OAuth ORDS) por ser uma ferramenta pessoal. Em produção escalável, recomenda-se autenticação ORDS com JWT.

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

# 3. Inicie o servidor de desenvolvimento
npm run dev
```

O app abre em `http://localhost:5173`.

> Em desenvolvimento, as chamadas `/api/*` não têm proxy configurado no Vite. Para testar com o Oracle real, use `npx vercel dev` (que aplica os `routes` do `vercel.json` localmente).

### Comandos disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento com HMR |
| `npm run build` | Build de produção (TypeScript + Vite) |
| `npm run preview` | Preview do build de produção |
| `npm run lint` | ESLint |
| `npm run typecheck` | Verificação TypeScript sem gerar arquivos |

---

## Deploy

O deploy é feito na **Vercel** via CLI:

```bash
npx vercel --prod
```

O Vercel detecta automaticamente o projeto como Vite e:
1. Executa `npm run build`
2. Publica o conteúdo de `dist/` como assets estáticos
3. Aplica as regras de roteamento do `vercel.json`

### vercel.json

```json
{
  "routes": [
    {
      "src": "/(.*)",
      "headers": {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "SAMEORIGIN",
        "X-XSS-Protection": "1; mode=block",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
        "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload"
      },
      "continue": true
    },
    {
      "src": "/api/(.*)",
      "dest": "https://g6602a8de4565f4-s4db.adb.sa-saopaulo-1.oraclecloudapps.com/ords/admin/$1"
    },
    { "src": "/", "dest": "/landing.html" },
    { "src": "/landing", "dest": "/landing.html" },
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

| Regra | Comportamento |
|-------|--------------|
| `/(.*) + continue: true` | Aplica headers de segurança HTTP em todas as respostas |
| `/api/(.*)` | Proxy direto para Oracle ORDS |
| `/` e `/landing` | Redireciona para `landing.html` (landing page pública) |
| `handle: filesystem` | Serve assets estáticos do `dist/` |
| `/(.*)` | SPA fallback — retorna `index.html` para todas as demais rotas |

### Primeiro deploy em um novo ambiente

```bash
npx vercel login
npx vercel --prod --name s4-assessoria
```

---

## Variáveis de Ambiente

O projeto não usa variáveis de ambiente no frontend. A URL do Oracle ORDS está hardcoded em dois lugares:

| Arquivo | Uso |
|---------|-----|
| `vercel.json` | Proxy de produção via Vercel routes |
| `api/[...path].js` | Edge Function de fallback |

Para trocar o banco, atualize o hostname Oracle nesses dois arquivos e faça um novo deploy.

---

## Decisões de Arquitetura

### Por que Oracle ORDS AutoREST?
O Oracle ATP (Autonomous Transaction Processing) no Free Tier inclui ORDS, que gera endpoints REST automaticamente para qualquer tabela habilitada. Isso elimina a necessidade de um servidor backend separado (Node.js, Python etc.), reduzindo custo e complexidade.

### Por que proxy Vercel em vez de chamar o Oracle diretamente?
Chamadas diretas do browser para `*.oraclecloudapps.com` são bloqueadas por CORS. O Vercel atua como proxy reverso — faz as chamadas server-side sem problema de CORS e sem expor a URL interna do Oracle no código do browser.

### Por que `routes` em vez de `rewrites` no vercel.json?
Os `rewrites` do Vercel para projetos Vite são interceptados pelo catch-all SPA `/(.*) → /index.html` antes de chegarem ao proxy Oracle. O formato `routes` processa as regras em ordem explícita, garantindo que `/api/*` seja tratado antes do SPA fallback.

### Por que hash no browser e não no servidor?
Não há servidor próprio — o backend é o Oracle ORDS. Fazer hash no browser via Web Crypto API garante que a senha nunca trafegue em texto claro, mesmo sem um servidor intermediário para fazer a transformação.

### Por que `sessionStorage` em vez de `localStorage`?
A sessão expira ao fechar o browser — comportamento seguro para uma ferramenta que pode ser acessada em computadores compartilhados ou públicos.

### Por que enviar timestamps do frontend?
O Oracle ORDS AutoREST envia `NULL` explícito para colunas ausentes no body do POST, sobrescrevendo o `DEFAULT CURRENT_TIMESTAMP` definido na tabela. Enviar `created_at` e `updated_at` direto do frontend (`new Date().toISOString()`) contorna esse comportamento sem precisar alterar o schema ou criar triggers.
