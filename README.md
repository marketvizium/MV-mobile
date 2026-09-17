# Primeiro commit oficial repositório Market Vizium
- Este commit é o primeiro do mobile da market vizium

# Teste github subindo repo oficial novas versões
- Teste ao subir novas versões ao github

# V215 - Novas atualizações

- Atualização da quantidade de boletos: permite informar e atualizar a quantidade de boletos disponível na cotação.
- Prazo de boletos: possibilita definir e visualizar o prazo para pagamento dos boletos.
- Observações: inclusão de observações adicionais na cotação para fornecer informações importantes aos participantes.
- Visibilidade para o vendedor: o vendedor consegue visualizar quando está participando de uma cotação e acompanhar novas informações e atualizações disponibilizadas sobre ela.


# V219 - Trabalhando em UX, integração com coletor e novas interfaces
- Trabalhei no UX da página de console da cotação. Os usuários estavam solicitando que houvesse algo indicando se o produto adicionado deu certo pois não havia um feedback claro.
- Trablhei na UI de minhas cotações para o coletor e o celular mobile.
- Integrei o coletor de dados junto ao aplicativo para poder versionar e distribuir a aplicação na play store. Agora o usuário deve selecionar qual dispositivo está utilizando antes de prosseguir com o acesso ao aplicativo.
- Melhorei o design e exibição da tela de login no Marviz.


# V220 - Atualização em cotações
- Adicionando botão de criar cotação na consulta de cotação, antigamente estava sem, e não dá para criar cotação se não for no aplicativo de computador, estou flexibilizando para utilizar o app de qualquer lugar.
- Adicionando novos menus na plataforma web como Colaboradores e Vendedores. Antigamente só dava para cadastrar colaborador pelo aplicativo, e era péssimo, agora em qualquer lugar dá para cadastrar um novo colaborador e associar vendedores às lojas. 
- No mobile adicionarei as novas colunas na próxima versão, por enquanto no mobile foram as correções de interface para criar cotação

# V221 - Atualizações e correções de bugs na aplicação
- Fiz uma atualização prévia para modificar o dashboard dos vendedores focando em networking na plataforma, porém, coloquei todas as alterações em um arquivo, mas deixei para o cliente ver ainda a mesma versão, na próxima versão eu crio essa integração.
- Corriji para a plataforma de cotações dos comerciantes a alteração do período para o mobile. Antigamente só dava para fazer a alteração correta do período no desktop web ou no app desktop, agora todos podem fazer alterações. 
- Criei novos caminhos para cadastrar colaborador no aplicativo mobile, com experiências de que o cliente precisa fazer tudo em qualquer plataforma que ele tinha oportunidade nós paramos de deixar tudo centralizado no aplicativo desktop, e distribuimos todas as funcionalidades para todas as pçataformas. 
- Adicioni consulta de vendedores.
- Alterei o dashboard para ficar com uma UI um pouco mais moderna, estava bem engessado para o mobile e para a plataforma desktop.
- Adicionei a funcionalidade de convite, agora o comerciante compartilha o link para o vendedor e ele se associa na loja sem precisar que o comerciante fique em cima de adicionar vendedor por vendedor. Ele lança o link e os comerciantes começar a poder participar das atividades da loja.
- Para o vendedor, adicionei a funcionalidade do olho, ao clicar ele pode ver quais produtos ele está ganhando apenas uma única vez. 
- Corriji algumas experiências da página de cotação.
- Para o backend mantive a arquitetura padrão, não busquei melhorias nenhuma, apenas reproduzi o mesmo padrão de arquitetura, mas a minha meta é mudar isso futuramente para o clean architeture. Preciso pegar mais pra estudar antes de implementar. 
- Adicionei também a nova página de adminsitrador da market vizium para cadastro de cliente, lojas, associações, bloqueios remotos, liberações de módulos e cadastro de colaboradores