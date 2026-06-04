Feature: Gestão de Projetos
  Como usuário autenticado
  Quero criar e gerenciar projetos
  Para acompanhar o andamento dos trabalhos

  Scenario: Visualizar lista de projetos vazia
    Given estou autenticado no sistema
    When acesso a página de projetos
    Then vejo o botão "Novo Projeto"

  Scenario: Acessar formulário de novo projeto
    Given estou autenticado no sistema
    When acesso a página de projetos
    And clico em "Novo Projeto"
    Then vejo o formulário de criação de projeto
