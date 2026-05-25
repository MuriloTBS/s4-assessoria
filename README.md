# S4 Assessoria — Sistema de Gestão para Freelancers

Sistema completo de gestão de clientes, projetos, progresso e precificação para freelancers.

## Stack

- **Frontend:** Lovable (React + Vite + Tailwind CSS)
- **Backend:** Supabase (PostgreSQL + Auth + RLS)
- **CI/CD:** GitHub Actions

## Telas

| # | Tela | Rota |
|---|------|------|
| 1 | Dashboard | `/` |
| 2 | Lista de Projetos | `/projects` |
| 3 | Criar/Editar Projeto | `/projects/new` · `/projects/:id/edit` |
| 4 | Detalhes do Projeto | `/projects/:id` |
| 5 | Lista de Clientes | `/clients` |
| 6 | Criar/Editar Cliente | `/clients/new` · `/clients/:id/edit` |
| 7 | Calculadora de Precificação | `/calculator` |
| 8 | Parâmetros | `/settings/parameters` |
| 9 | Login | `/login` |
| 10 | Configurações | `/settings` |

## Banco de Dados (Supabase)

### Tabelas
- `users` — gerenciado pelo Supabase Auth
- `clients` — clientes por usuário
- `projects` — projetos vinculados a clientes
- `project_steps` — etapas/checklist por projeto
- `parameters` — parâmetros personalizáveis por usuário

### Políticas RLS
Todas as tabelas usam Row Level Security com `auth.uid()` para isolamento por usuário.

## Tema Visual

- Fundo: `#0D1B2A` / `#1B263B`
- Cards coloridos: vermelho, amarelo, verde, azul, laranja
- Tipografia: Inter / Montserrat
- Border-radius: 12px
- Desktop-first, responsivo

## Regras de Negócio

- Usuário autenticado obrigatório em todas as rotas (exceto `/login`)
- Status padrão de novo projeto: `Em andamento`
- Cliente não pode ser excluído com projetos vinculados
- Projetos ordenados por prazo crescente por padrão
- Filtros de projetos funcionam de forma combinada

## Desenvolvimento

```bash
# Instalar dependências
npm install

# Variáveis de ambiente
cp .env.example .env.local
# Preencher VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY

# Rodar localmente
npm run dev

# Build de produção
npm run build
```

## Estrutura de Pastas

```
src/
├── components/     # Componentes reutilizáveis
├── pages/          # Telas da aplicação
├── hooks/          # Custom hooks (Supabase queries)
├── lib/            # Configuração do Supabase client
└── types/          # TypeScript types

supabase/
└── migrations/     # SQL migrations

.github/
└── workflows/      # CI/CD GitHub Actions
```
