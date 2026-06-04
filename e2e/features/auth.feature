Feature: Autenticação
  Como usuário do sistema
  Quero fazer login com minhas credenciais
  Para acessar o painel de gestão

  Scenario: Login com credenciais inválidas
    Given estou na página de login
    When preencho o email "invalido@teste.com" e senha "senhaerrada"
    And clico em Entrar
    Then vejo a mensagem "Email ou senha incorretos"

  Scenario: Alternância entre login e cadastro
    Given estou na página de login
    When clico em "Criar conta"
    Then vejo o campo "Nome"

  Scenario: Validação de email inválido
    Given estou na página de login
    When preencho o email "nao-e-email" e senha "abc123"
    And clico em Entrar
    Then vejo a mensagem "Email inválido"

  Scenario: Validação de senha curta
    Given estou na página de login
    When preencho o email "teste@teste.com" e senha "123"
    And clico em Entrar
    Then vejo a mensagem "pelo menos 6 caracteres"
