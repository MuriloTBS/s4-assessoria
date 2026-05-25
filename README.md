# S4 Assessoria — Sistema de Gestão para Freelancers

Sistema completo de gestão de clientes, projetos, progresso e precificação para freelancers.

## Stack

- **Frontend:** Lovable (React + Vite + Tailwind CSS)
- **Backend:** Oracle Database
- **Autenticação:** A definir (JWT / Oracle APEX Auth)
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

## Banco de Dados (Oracle)

### Tabelas
- `USERS` — usuários do sistema
- `CLIENTS` — clientes por usuário
- `PROJECTS` — projetos vinculados a clientes
- `PROJECT_STEPS` — etapas/checklist por projeto
- `PARAMETERS` — parâmetros personalizáveis por usuário

### Segurança
Isolamento de dados por `user_id` em todas as queries. Credenciais via variáveis de ambiente.

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
# Preencher VITE_ORACLE_DB_URL e credenciais

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
├── hooks/          # Custom hooks (Oracle API queries)
├── lib/            # Configuração do Oracle client / API
└── types/          # TypeScript types

database/
└── migrations/     # SQL migrations Oracle

.github/
└── workflows/      # CI/CD GitHub Actions
```
