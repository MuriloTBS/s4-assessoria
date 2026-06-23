Feature: Painel Admin
  Como administrador do sistema
  Quero controlar o acesso de usuários
  Para garantir que apenas usuários autorizados acessem o sistema

  Scenario: Admin vê painel de administração
    Given estou autenticado como administrador
    When acesso a página do admin
    Then vejo o título "Painel Admin"

  Scenario: Cadastro gera conta pendente
    Given estou na página de login
    When clico em "Criar conta"
    And preencho o formulário com nome "Novo User", email "novo@teste.com" e senha "abc123456"
    And clico em "Criar conta"
    Then vejo a mensagem "Aguarde aprovação do administrador"
