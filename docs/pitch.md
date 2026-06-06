# S4 Assessoria — Pitch de Vendas

---

## O Problema que Ninguém Resolve Direito

Consultores e pequenas empresas de serviço crescem e continuam gerindo seus
negócios como se fossem freelancers de fim de semana. Planilha para cliente,
outra planilha para projeto, bloco de notas para checklist, calculadora no
celular para precificação, e uma mensagem no WhatsApp para lembrar do prazo.

O resultado é sempre o mesmo: projeto cobrado barato, prazo perdido, cliente sem
visibilidade, consultor sem controle.

Ferramentas como Trello ou Notion são genéricas — o consultor precisa montar do
zero o que deveria vir pronto. ERPs são caros, complexos, e desenhados para
indústrias, não para serviços profissionais.

---

## A Proposta

**S4 Assessoria** é um sistema web completo, focado exclusivamente na realidade
de consultores e PMEs de serviço. Está em produção em
[s4assessoria.com.br](https://s4assessoria.com.br), sem instalação, sem
configuração, acessível em qualquer dispositivo.

Em vez de ser mais um sistema genérico, ele resolve quatro problemas
específicos de quem vende serviço:

> **Não sei o que tenho pra fazer** → gestão de projetos com checklist
> **Não sei quanto cobrar** → calculadora de precificação com sua hora e margem
> **Não tenho visão do negócio** → dashboard com gráficos e métricas
> **Esqueço prazos** → alertas automáticos por email 3 dias antes

---

## Funcionalidades

### Gestão de Clientes
Cadastro completo com nome, email, telefone, empresa e observações. Busca por
nome. Proteção automática: o sistema impede exclusão de um cliente que ainda tem
projetos vinculados.

### Gestão de Projetos
Cada projeto tem status (Em andamento, Concluído, Pausado, Cancelado), valor,
prazo, links úteis e notas internas. A listagem tem filtro por status e busca por
nome. Cada projeto tem um checklist de etapas que pode ser marcado conforme o
trabalho avança. A página de detalhe pode ser impressa ou exportada como PDF
com um clique.

### Calculadora de Precificação
O consultor informa o valor da hora, as horas estimadas, a complexidade do
trabalho e os custos extras. O sistema aplica um fator de complexidade sobre a
base, adiciona os custos e calcula o preço sugerido com a margem mínima
configurada.

| Complexidade | Fator aplicado |
|---|---|
| Simples | 1,0× |
| Médio | 1,3× |
| Complexo | 1,7× |
| Muito Complexo | 2,2× |

Os parâmetros padrão — hora, margem, complexidade — ficam salvos por usuário.
A calculadora abre sempre com os valores do perfil.

### Dashboard
Quatro cards de resumo: total de projetos, projetos ativos, total de clientes,
prazos próximos. Três gráficos: projetos criados por mês nos últimos seis meses,
distribuição por status, distribuição por cliente. Tabela dos cinco projetos mais
recentes com acesso direto ao detalhe.

### Alertas Automáticos
Um cron job roda todos os dias às 9h da manhã. Ele varre os projetos com status
"Em andamento", identifica os que têm prazo nos próximos três dias, e envia um
email personalizado para o responsável. Sem configuração. Sem plugin. Funciona
automaticamente desde o primeiro dia.

### Controle de Acesso por Aprovação
Toda conta nova entra em modo de espera. O administrador aprova manualmente cada
acesso. Isso garante que a plataforma nunca seja usada por pessoas não
autorizadas.

---

## Metodologia de Desenvolvimento

O projeto foi construído com práticas de engenharia de software aplicadas de
forma consistente. Isso não é marketing — está evidenciado no código e nos testes.

### Clean Code
Cada módulo tem responsabilidade única. A camada de API está completamente
isolada dos componentes de tela. Hooks encapsulam toda a lógica de negócio. Os
componentes de UI são genéricos e reutilizáveis. Nenhum arquivo tem mais de 200
linhas.

### TDD — Test-Driven Development
Os módulos críticos foram desenvolvidos com testes escritos antes ou junto com
o código. A suíte atual tem **28 testes unitários, 100% passando**, cobrindo:

- Validação de schemas (login, cadastro, projetos, parâmetros)
- Formatação de moeda, datas e status
- Comportamento de hooks assíncronos (loading, erro, resultado)
- Componentes de interface (variantes, estados de disabled)

```
Test Files  4 passed
Tests       28 passed
Duration    ~700ms
```

### BDD — Behavior-Driven Development
Os fluxos de negócio estão documentados em linguagem natural no formato Gherkin,
executáveis via Playwright. Exemplos reais do projeto:

```gherkin
Feature: Autenticação
  Como usuário do sistema
  Quero fazer login com minhas credenciais
  Para acessar o painel de gestão

  Scenario: Login com credenciais inválidas
    Given estou na página de login
    When preencho o email "invalido@teste.com" e senha "senhaerrada"
    And clico em Entrar
    Then vejo a mensagem "Email ou senha incorretos"
```

```gherkin
Feature: Painel Admin
  Scenario: Cadastro gera conta pendente
    Given estou na página de login
    When clico em "Criar conta"
    And preencho o formulário com nome, email e senha
    And clico em "Criar conta"
    Then vejo a mensagem "Aguarde aprovação do administrador"
```

Cada cenário descreve um comportamento esperado do sistema em linguagem que
qualquer stakeholder consegue ler e validar — não só desenvolvedores.

### Arquitetura de Microserviços
O backend é composto por funções serverless independentes, cada uma com
responsabilidade única e deployada de forma isolada:

| Função | Responsabilidade |
|--------|-----------------|
| `api/auth/login.js` | Verificação de credenciais + migração de legado |
| `api/auth/register.js` | Cadastro + criação de organização |
| `api/auth/forgot-password.js` | Geração e envio de token de recuperação |
| `api/auth/reset-password.js` | Validação de token + atualização de senha |
| `api/notifications/deadline.js` | Cron de alertas de prazo |
| `api/services/*.js` | Proxy autenticado para o banco de dados |

Cada função falha de forma isolada. Se o serviço de notificações tiver um
problema, o login continua funcionando. Se o email não for entregue, os dados
continuam sendo salvos. Nenhuma parte depende da outra para existir.

### Validação com Schema (Zod)
Todos os dados que entram no sistema — formulários, parâmetros de API — passam
por schemas de validação tipados com Zod antes de qualquer processamento. Erros
de entrada chegam ao usuário com mensagens claras, em português, antes de
qualquer chamada ao servidor.

---

## Segurança

Segurança não foi pensada depois. Foi construída no núcleo do sistema desde o
início.

### Argon2id + Pepper — padrão ouro em hashing de senha

A senha nunca é armazenada. Ela passa por dois processos antes de chegar ao banco:

1. Um segredo do servidor (o **pepper**) é misturado à senha
2. O resultado passa pelo algoritmo **Argon2id** — vencedor da competição
   internacional Password Hashing Competition, projetado especificamente para
   resistir a ataques de GPU e hardware especializado

Mesmo que o banco de dados fosse completamente comprometido, o atacante
encontraria apenas hashes impossíveis de reverter sem o pepper — que fica em
servidor separado.

### Migração automática de legado
Contas antigas usavam SHA-256. Na primeira entrada de cada usuário legado, o
sistema detecta o formato antigo, verifica a senha, e imediatamente migra para
Argon2id. Na próxima entrada, o usuário já usa o padrão moderno.

### Recuperação de senha com token HMAC e expiração
O link de recuperação é gerado com HMAC-SHA256, assinado com uma chave secreta
do servidor, e embutido com timestamp. O servidor valida assinatura e tempo a
cada uso. Após 1 hora, o link é inválido. O email nunca revela se o endereço
está cadastrado — a resposta é sempre a mesma, independente do resultado.

### Rate limiting no login
Após 10 tentativas de login com falha pelo mesmo IP em 15 minutos, o endpoint
retorna HTTP 429 e bloqueia novas tentativas. Isso elimina ataques de força bruta
automatizados.

### Chave interna de API
Todo o tráfego entre o frontend e o backend carrega uma chave interna compartilhada
(`x-s4-internal-key`). Chamadas sem essa chave são rejeitadas antes de chegar
ao banco de dados.

### Headers HTTP de segurança
Aplicados em todas as respostas, sem exceção:

| Header | Proteção |
|--------|----------|
| `Strict-Transport-Security` | Força HTTPS por 2 anos, inclui subdomínios |
| `X-Content-Type-Options: nosniff` | Bloqueia MIME sniffing |
| `X-Frame-Options: SAMEORIGIN` | Protege contra clickjacking |
| `X-XSS-Protection` | Camada adicional contra XSS em browsers legados |
| `Referrer-Policy` | Controla informações enviadas em referências |
| `Permissions-Policy` | Bloqueia acesso a câmera, microfone e geolocalização |

### Monitoramento em tempo real com Sentry
Qualquer erro não tratado em produção é capturado automaticamente e enviado ao
Sentry com stack trace completo, contexto de usuário e rastreamento da requisição.
O time vê o problema antes do usuário precisar reportar.

---

## Infraestrutura

Nenhum servidor para gerenciar. Nenhum contrato de hosting complexo.

| Componente | Plataforma | Custo |
|------------|-----------|-------|
| Banco de dados Oracle ATP | Oracle Cloud Free Tier | Gratuito permanente |
| Aplicativo + Serverless Functions | Vercel | Gratuito no plano hobby |
| Envio de email | Resend | Gratuito até 3.000 emails/mês |
| Monitoramento de erros | Sentry | Gratuito até 5.000 erros/mês |

O custo operacional atual é **zero**. A plataforma está em produção servindo
usuários reais sem nenhum custo mensal.

---

## Por que Confiar neste Projeto

**Está em produção.** Não é um protótipo. Está rodando em
[s4assessoria.com.br](https://s4assessoria.com.br) com usuários reais, banco de
dados real e dados reais.

**Tem testes.** 28 testes unitários passando. Cenários BDD documentados e
executáveis. O código não foi escrito e esquecido — foi verificado.

**Tem monitoramento.** Se algo quebrar amanhã de madrugada, o Sentry captura e
notifica antes que qualquer usuário reclame.

**Tem segurança real.** Não é um checkbox de segurança. É Argon2id com pepper,
HMAC com expiração, rate limiting, headers HTTP, chave interna de API. Cada
camada foi pensada para um vetor de ataque específico.

**Tem documentação.** README completo com arquitetura, decisões técnicas, schema
do banco, endpoints, variáveis de ambiente e guia de deploy. Qualquer
desenvolvedor consegue entender e evoluir o sistema sem depender do autor
original.

---

## Resumo Executivo

| Item | Detalhe |
|------|---------|
| **Produto** | Plataforma SaaS de gestão para consultores e PMEs |
| **Status** | Em produção — s4assessoria.com.br |
| **Stack** | React 19 + TypeScript + Vite + Oracle + Vercel Functions |
| **Segurança** | Argon2id + Pepper + HMAC + Rate Limiting + Headers HTTP |
| **Qualidade** | Clean Code + TDD (28 testes) + BDD (Playwright/Gherkin) |
| **Arquitetura** | Microserviços serverless + banco gerenciado |
| **Custo operacional** | R$ 0/mês no plano atual |
| **Escalabilidade** | Multi-tenant por design — suporta múltiplos clientes |

---

*S4 Assessoria — construído para durar, documentado para crescer,
seguro para confiar.*
