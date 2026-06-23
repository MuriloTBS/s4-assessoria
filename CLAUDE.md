# S4 Assessoria — CLAUDE.md

Guia técnico para o assistente de IA neste projeto. Leia antes de qualquer tarefa.

---

## Visão Geral

**S4 Assessoria** é uma plataforma B2B SaaS de gestão de projetos para consultores.
Produção: https://s4assessoria.com.br

Stack: React 19 · TypeScript · Vite 8 · Tailwind 4 · Vercel · Oracle Cloud (ORDS) · Resend · Sentry

---

## Regra Crítica: Vercel Hobby — Limite de 12 Funções Serverless

**NUNCA** adicione uma nova função serverless (`api/*.js` ou `api/**/*.js`) sem remover outra primeiro.

Contagem atual (12/12):
```
api/auth/forgot-password.js  ← 1
api/auth/login.js            ← 2
api/auth/logout.js           ← 3
api/auth/me.js               ← 4
api/auth/register.js         ← 5
api/auth/reset-password.js   ← 6
api/notifications/deadline.js ← 7
api/services/clients.js      ← 8
api/services/parameters.js   ← 9
api/services/projects.js     ← 10
api/services/steps.js        ← 11
api/services/users.js        ← 12
```

`api/[...path].js` é uma **Edge Function** e NÃO conta para o limite. Mas ela não funciona
para chamadas ao Oracle ORDS — veja seção abaixo.

---

## ORDS e o Bloqueio do Cloudflare

**Problema crítico descoberto em produção:**
Vercel Edge Functions rodam na rede Cloudflare. Oracle ORDS bloqueia IPs Cloudflare
silenciosamente (retorna 404). As funções serverless Node.js rodam na AWS — ORDS
aceita normalmente.

**Regra:** NUNCA proxy chamadas ORDS por Edge Functions. Sempre use Node.js serverless
(`api/services/*.js`, sem `export const config = { runtime: 'edge' }`).

O arquivo `api/[...path].js` existe mas está efetivamente desativado (rotas do
`vercel.json` direcionam para os service files antes de chegar nele).

---

## Autenticação ORDS (OAuth2)

Oracle ORDS usa OAuth2 Client Credentials. As credenciais estão em Vercel:
- `ORDS_CLIENT_ID` (Production + Preview)
- `ORDS_CLIENT_SECRET` (Production + Preview)

A lógica de obtenção do token está em `api/_lib/ords-proxy.js` → `getOrdsToken()`.
Token URL: `{ORDS_BASE_URL sem o schema}/ords/oauth/token`.

Toda chamada ao ORDS **deve** incluir `Authorization: Bearer {token}`.
Funções que chamam ORDS diretamente (ex: `api/auth/login.js`) importam `getOrdsToken` de
`api/_lib/ords-proxy.js`.

---

## Arquitetura de API

```
Frontend (React) → /api/projects/ → api/services/projects.js (Node.js, AWS)
                                  → api/_lib/ords-proxy.js (Bearer token + proxy)
                                  → Oracle ORDS (ADB São Paulo)
```

Todas as chamadas do frontend enviam `x-s4-internal-key` (header).
O `ords-proxy.js` valida a chave antes de fazer proxy.

**Segurança:** A `VITE_INTERNAL_API_KEY` fica exposta no bundle JS do frontend
(é uma camada de proteção superficial). O verdadeiro controle de acesso é o OAuth2 do ORDS.

---

## Variáveis de Ambiente (Vercel)

| Var | Uso |
|-----|-----|
| `ORDS_BASE_URL` | URL base do Oracle ORDS (ex: `https://host/ords/admin`) |
| `ORDS_CLIENT_ID` | OAuth2 Client ID para ORDS |
| `ORDS_CLIENT_SECRET` | OAuth2 Client Secret para ORDS |
| `INTERNAL_API_KEY` | Valida requests internos (servidor) |
| `VITE_INTERNAL_API_KEY` | Chave interna no bundle do frontend |
| `AUTH_PEPPER` | Pepper para Argon2 (hashing de senhas) |
| `RESET_SECRET` | Segredo para tokens de reset de senha |
| `RESEND_API_KEY` | API Key do Resend (emails) |
| `SESSION_SECRET` | Segredo para assinatura HMAC de sessões |

---

## Oracle ORDS — Tabelas Principais

Base URL: `https://g6602a8de4565f4-s4db.adb.sa-saopaulo-1.oraclecloudapps.com/ords/admin`

| Tabela ORDS | Endpoint API |
|-------------|-------------|
| `s4_projects` | `/api/projects/` |
| `s4_clients` | `/api/clients/` |
| `s4_users` | `/api/users/` |
| `s4_parameters` | `/api/parameters/` |
| `s4_project_steps` | `/api/steps/` |

---

## Observabilidade

**Real-time:** `src/components/admin/SystemStatus.tsx` — card no AdminPanel que pinga
`/api/projects/?limit=1` a cada 5 minutos e mostra latência e status.

**Cron:** `api/notifications/deadline.js` executa health check do ORDS a cada execução
(9h diárias via `vercel.json`). Loga `[S4-HEALTH]` no console Vercel se ORDS cair.

---

## LGPD

- Página pública: `/privacidade` → `src/pages/PrivacyPolicy.tsx`
- Consentimento no cadastro: checkbox obrigatório em `src/pages/Login.tsx`
- Operadores subcontratados declarados: Oracle, Vercel, Resend, Sentry

---

## Comandos Comuns

```bash
npm run dev          # Vite apenas (sem API functions)
vercel dev           # Vite + serverless functions locais (porta 3001 se 3000 ocupada)
npm run build        # Build de produção (TypeScript + Vite)
npm run typecheck    # tsc --noEmit
npm run lint         # ESLint
npm test             # Vitest
npm run test:e2e     # Playwright BDD
```

---

## Convenções de Commit

Formato: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`, `ci:`, `perf:`

Commits recentes relevantes:
- `8ef7985` feat: OAuth2 no ORDS e observabilidade em produção
- `f125c65` feat: LGPD — política de privacidade, consentimento e rodapé legal
- `0e2e396` fix: restaura api/services Node.js (contorna bloqueio ORDS no Cloudflare)

---

## Filosofia do Projeto

CLI First → Observabilidade → UI

- Novas features devem funcionar 100% via CLI antes de ter UI
- UI nunca deve ser obrigatória para operação do sistema
