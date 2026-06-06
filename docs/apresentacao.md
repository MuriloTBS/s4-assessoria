# S4 Assessoria — Apresentação do Projeto

---

## Slide 1 — Abertura

**S4 Assessoria**
*Gestão e Tecnologia para PMEs*

Desenvolvido para consultores e pequenas empresas que precisam de organização,
mas não têm tempo — nem dinheiro — para sistemas complexos.

---

## Slide 2 — O Problema

Pensa em um consultor que está crescendo. Ele tem cinco clientes, doze projetos
em andamento, e toda a gestão está espalhada em planilhas do Excel, blocos de
notas e mensagens de WhatsApp.

Quando chega a hora de cobrar, ele não sabe exatamente quantas horas trabalhou.
Quando o cliente pergunta sobre o andamento, ele precisa garimpar e-mails para
lembrar. Quando um prazo vence, ninguém avisou.

Esse cenário é mais comum do que parece. E é exatamente esse problema que o S4
Assessoria resolve.

---

## Slide 3 — A Solução

O S4 é uma plataforma web — você abre no navegador, sem instalação — que reúne
num só lugar tudo o que um consultor ou pequena empresa precisa para trabalhar
de forma organizada:

- Uma lista de **clientes** com todas as informações de contato
- Um painel de **projetos** com status, prazos e valores
- Um **checklist de etapas** para cada projeto
- Uma **calculadora de precificação** para não cobrar barato
- Um **dashboard** para ter a visão geral do negócio em segundos
- **Alertas automáticos** quando um prazo está se aproximando

Tudo isso com tema escuro, responsivo, e funcionando em qualquer dispositivo.

---

## Slide 4 — Como Funciona na Prática

Imagine que você acabou de fechar um novo projeto com um cliente. O fluxo é
simples:

**1. Cadastra o cliente** — nome, email, telefone, empresa.

**2. Cria o projeto** — associa ao cliente, define o status, o valor cobrado e
o prazo de entrega.

**3. Adiciona as etapas** — uma lista de tarefas dentro do projeto. Conforme
avança, vai marcando cada etapa como concluída.

**4. Acompanha pelo dashboard** — vê quantos projetos estão ativos, quais
vencem nos próximos dias, e como o portfólio está distribuído por cliente.

**5. Recebe um alerta** — três dias antes de qualquer prazo vencer, o sistema
manda um email de aviso automaticamente. Sem surpresas.

---

## Slide 5 — A Calculadora de Precificação

Esse é um dos pontos que mais agrada consultores: a Calculadora.

Você informa quatro coisas:
- Quanto vale a sua hora
- Quantas horas estima para o projeto
- A complexidade do trabalho (simples, médio, complexo, muito complexo)
- Os custos extras, se houver

O sistema aplica um fator de complexidade sobre a base de horas, adiciona os
custos e calcula o preço final já com a margem mínima que você definiu.

O resultado é o **preço sugerido** — o quanto você deveria cobrar para não
trabalhar no prejuízo.

Cada nível de complexidade tem um multiplicador diferente. Um projeto
classificado como "Muito Complexo" tem seu preço base multiplicado por 2,2 em
relação a um projeto simples. Isso garante que o consultor seja remunerado de
forma justa pelo esforço real.

Os valores padrão — sua hora, sua margem — ficam salvos nos **Parâmetros**, e a
calculadora já abre com eles preenchidos.

---

## Slide 6 — Multi-tenancy: Cada Usuário Vê Só o Seu

O sistema foi pensado desde o início para suportar múltiplos usuários. Cada
conta enxerga apenas os seus próprios clientes, projetos e parâmetros. Não há
mistura de dados entre usuários.

Quando uma nova conta é criada, ela entra em modo de espera. O administrador
do sistema revisa e aprova o acesso antes que o usuário possa entrar. Isso
garante controle sobre quem usa a plataforma.

---

## Slide 7 — Segurança

Quando se fala em gestão de negócios, segurança não é detalhe. Tomamos algumas
decisões importantes:

**As senhas nunca ficam em texto legível.** Quando você cria uma senha, ela é
transformada num código criptografado usando um algoritmo chamado Argon2 —
considerado um dos mais seguros do mundo hoje — antes de ser guardada. Mesmo
que alguém acessasse o banco de dados, não conseguiria ler as senhas.

**Há um segredo adicional.** Além do próprio algoritmo, existe uma chave secreta
do servidor que é misturada à senha antes do processo. Sem essa chave, o código
criptografado é inútil.

**Recuperação de senha por email.** Se você esquecer a senha, recebe um link por
email com validade de uma hora. Depois desse tempo, o link expira.

**Proteção contra tentativas automáticas.** Se alguém tentar descobrir uma senha
por força bruta, o sistema bloqueia o IP após dez tentativas em quinze minutos.

**Conexão sempre por HTTPS.** Todas as comunicações são criptografadas.

---

## Slide 8 — Tecnologia (em linguagem humana)

Você não precisa entender de programação para usar o S4, mas é bom saber o que
está por baixo:

O sistema roda em dois grandes pilares. O **banco de dados** fica na Oracle Cloud
— uma das maiores infraestruturas de nuvem do mundo — no plano gratuito
permanente, com backups automáticos e alta disponibilidade.

O **aplicativo** fica hospedado na Vercel, que publica o sistema em servidores
espalhados pelo mundo para que qualquer um abra rápido, independente de onde
esteja.

O código que você vê na tela é carregado de forma inteligente: cada seção do
sistema só é baixada quando você a acessa pela primeira vez. Isso faz com que a
página abra muito mais rápido.

Para monitoramento, usamos o Sentry: se algo der errado em qualquer parte do
sistema, a equipe recebe um alerta imediato com todos os detalhes do problema,
antes mesmo que o usuário precise reportar.

---

## Slide 9 — O que está pronto hoje

| Funcionalidade | Status |
|----------------|--------|
| Cadastro e gestão de clientes | ✅ Pronto |
| Cadastro e gestão de projetos | ✅ Pronto |
| Checklist de etapas por projeto | ✅ Pronto |
| Calculadora de precificação | ✅ Pronto |
| Parâmetros personalizáveis | ✅ Pronto |
| Dashboard com gráficos | ✅ Pronto |
| Login, cadastro e recuperação de senha | ✅ Pronto |
| Painel de administração | ✅ Pronto |
| Alertas automáticos de prazo por email | ✅ Pronto |
| Exportação para PDF | ✅ Pronto |
| Segurança Argon2 + rate limiting | ✅ Pronto |
| Monitoramento de erros em tempo real | ✅ Pronto |
| Funciona no celular | ✅ Pronto |

---

## Slide 10 — Próximos Passos Naturais

O sistema está funcional e em produção. As evoluções mais óbvias a partir daqui são:

**Relatórios financeiros** — hoje o dashboard mostra quantidade de projetos e
clientes. O próximo passo natural é mostrar faturamento por período, por cliente
e por status.

**Sessão mais segura** — a sessão atual usa o armazenamento do navegador. A
evolução ideal é um cookie de servidor que não pode ser lido por código externo,
aumentando a proteção contra ataques.

**Planos e faturamento** — a estrutura de organizações já está no banco de dados.
Adicionar planos pagos (free, pro) seria uma extensão direta do que já existe.

**Integração com ferramentas** — conectar com Google Calendar para os prazos,
ou com o WhatsApp Business para notificações, são evoluções que agregariam
muito valor no dia a dia do usuário.

---

## Slide 11 — Fechamento

O S4 Assessoria nasceu de uma necessidade real: dar ao consultor e à pequena
empresa uma ferramenta que funciona, que é segura, e que não exige treinamento
para usar.

Não é um ERP. Não é uma planilha. É um sistema enxuto, focado no que importa:
**saber o que tem para fazer, quanto vai cobrar, e não perder prazo.**

Está em produção em **s4assessoria.com.br**.

---

*Perguntas?*
