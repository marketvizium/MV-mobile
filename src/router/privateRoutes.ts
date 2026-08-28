// src/router/privateRoutes.ts
import { RouteRecordRaw } from 'vue-router';

const privateRoutes: RouteRecordRaw = {
  path: '/p', // Prefixo para rotas privadas (ex: /p/dashboard)
  component: () => import('@/layouts/plataformLayout.vue'),
  meta: { 
    requiresAuth: true, 
    roles: [5] //Apenas o nível 5 pode acessar
  },
  children: [
    {
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/HomePage.vue'),
      meta: {
          title: 'Dashboard',
          subtitle: 'Consulte a sua atividade no app'
      }
    },
    {
      path: 'perfil',
      name: 'Perfil',
      component: () => import('@/views/MeuPerfil.vue'),
      meta: {
          title: 'Meu perfil',
          subtitle: 'Veja o seu perfil, aqui você pode alterar seu cadastro'
      }
    },
    {
      path: 'explorar',
      name: 'Explorar',
      component: () => import('@/views/MeuExplorar.vue'),
      meta: {
          title: 'Explorar',
          subtitle: 'Explore novas lojas aqui'
      }
    },
    {
      path: 'cotacoes',
      name: 'Cotacoes',
      component: () => import('@/views/MinhasCotacoes.vue'),
      meta: {
          title: 'Minhas cotações',
          subtitle: 'Consulte todas as cotações que você está incluído'
      }
    },
    {
      path: 'cotacoes-especifica',
      name: 'CotacaoEspecifica',
      component: () => import('@/views/CotacaoEspecifica.vue'),
      meta: {
          title: 'Cotações da loja',
          subtitle: 'Aqui você pode consultar as cotações da loja específica'
      }
    },
    {
      path: 'detalhes-cotacao',
      name: 'DetalhesCotacao',
      component: () => import('@/views/DetalhesCotacao.vue'),
      meta: {
          title: 'Console de cotação',
          subtitle: 'Aqui você pode monitorar responder os itens da cotação'
      }
    },
    {
      path: 'lojas',
      name: 'Lojas',
      component: () => import('@/views/MinhasLojas.vue'),
      meta: {
          title: 'Lojas',
          subtitle: 'Aqui aparece as lojas que você está associado'
      }
    },
    {
      path: 'loja-perfil',
      name: 'LojaPerfil',
      component: () => import('@/views/LojaPerfil.vue'),
      meta: {
          title: 'Perfil da loja',
          subtitle: 'Consulte os contatos da loja'
      }
    },
    {
      path: 'editar-perfil',
      name: 'EditarPerfil',
      component: () => import('@/views/EditarPerfil.vue'),
      meta: {
          title: 'Editar perfil',
          subtitle: 'Atualize aqui o seu perfil'
      }
    },
    {
      path: 'minhas-empresas',
      name: 'MinhasEmpresas',
      component: () => import('@/views/MinhasEmpresas.vue'),
      meta: {
          title: 'Minhas empresas',
          subtitle: 'Aqui você cadastra e seleciona a empresa que você representa para poder participar das cotações'
      }
    },
    {
      path: 'dashboard-admin',
      name: 'DashboardAdmin',
      component: () => import('@/views/Dono/Dashboard.vue'),
      meta: {
          title: 'Dashboard',
          subtitle: 'Consulte a sua atividade no app'
      }
    },
    {
      path: 'minhas-cotacoes',
      name: 'MinhasCotacoes',
      component: () => import('@/views/Dono/MinhasCotacoes.vue'),
       meta: {
          title: 'Minhas cotações',
          subtitle: 'Consulte todas as cotações que você criou'
      }
    },
    {
      path: 'console-cotacao',
      name: 'consoleCotacao',
      component: () => import('@/views/Dono/CotacaoConsole.vue'),
       meta: {
          title: 'Console de cotação',
          subtitle: 'Nessa página você pode fazer toda a gestão do seu pedido'
      }
    },
    {
      path: 'registrar-cotacao',
      name: 'registrarCotacao',
      component: () => import('@/views/Dono/CriarCotacao.vue'),
       meta: {
          title: 'Registrar cotação',
          subtitle: 'Cadastre novas cotações para os vendedores participarem'
      }
    },
    {
      path: 'explorar-vendedores',
      name: 'ExplorarVendedores',
      component: () => import('@/views/Dono/ExplorarVendedores.vue'),
       meta: {
          title: 'Explorar vendedores',
          subtitle: 'Explore novos vendedores no sistema e associe à sua loja'
      }
    },
    {
      path: 'meus-vendedores',
      name: 'MeusVendedores',
      component: () => import('@/views/Dono/MeusVendedores.vue'),
       meta: {
          title: 'Meus vendedores',
          subtitle: 'Consulte todos os vendedores que estão associados à sua loja'
      }
    },
    {
      path: 'meu-perfil',
      name: 'MeuPerfil',
      component: () => import('@/views/Dono/MeuPerfil.vue'),
       meta: {
          title: 'Meu perfil',
          subtitle: 'Consulte seus dados de contato, e atividades'
      }
    },
    {
      path: 'editar-meu-perfil',
      name: 'EditarMeuPerfil',
      component: () => import('@/views/Dono/EditarPerfil.vue'),
      meta: {
          title: 'Editar perfil',
          subtitle: 'Altere o seu cadastro'
      }
    },
    {
      path: 'consultar-lojas-dono',
      name: 'consultarLojasDono',
      component: () => import('@/views/Dono/consultarLojas.vue'),
      meta: {
          title: 'Consultar lojas',
          subtitle: 'Consulte aqui todas as lojas do seu sistema'
      }
    },
    {
      path: 'cadastro-produto-dono',
      name: 'CadastroProdutoDono',
      component: () => import('@/views/Dono/CadastroProduto.vue'),
      meta: {
          title: 'Cadastro de produto',
          subtitle: 'Cadastre aqui novos produtos no seu sistema'
      }
    },
    {
      path: 'consulta-produtos-dono',
      name: 'ConsultaProdutosDono',
      component: () => import('@/views/Dono/ConsultaProdutos.vue'),
      meta: {
          title: 'Consultar produtos',
          subtitle: 'Consulte todos os produtos cadastrados no sisema'
      }
    },

    {
      path: 'privacidade',
      name: 'Privacidade',
      component: () => import('@/views/Privacidade.vue'),
      meta: {
          title: 'Conferir privacidade',
          subtitle: 'Confira termos e privacidade no sistema'
      }
    },

    {
      path: 'trends-vendedor',
      name: 'TrendsVendedor',
      component: () => import('@/views/TrendsVendedor.vue'),
      meta: {
          title: 'Participe do Marviz Trends',
          subtitle: 'Crie seu catálogo de produtos e lançamentos e aumente seu ticket médio.'
      }
    },

    {
      path: 'marviz-trends-var',
      name: 'TrendsVarejor',
      component: () => import('@/views/Dono/TrendsVarejo.vue'),
      meta: {
          title: 'Participe do Marviz Trends',
          subtitle: 'Encontre as melhores ofertas de vendedores e adicione em seus pedidos ou cotações.'
      }
    },

    {
      path: 'cons-pedido-direto',
      name: 'ConsPedidosDiretos',
      component: () => import('@/views/Dono/ConsPedidosDiretos.vue'),
      meta: {
          title: 'Consulte seus pedidos diretos',
          subtitle: 'Faça seus pedidos sem precisar de cotação'
      }
    },

    {
      path: 'criar-pedido-direto',
      name: 'CriarPedidoDireto',
      component: () => import('@/views/Dono/criarPedidoDireto.vue'),
      meta: {
          title: 'Cadastre seu pedido direto',
          subtitle: 'Cadastre um novo pedido direto para enviar demandas sem precisar de cotação'
      }
    },

    {
      path: 'pedido-direto',
      name: 'PedidoDireto',
      component: () => import('@/views/Dono/PedidoDireto.vue'),
      meta: {
          title: 'Pedido direto',
          subtitle: 'Adicione produtos cadastrados ou não cadastrados e faça seus pedidos sem precisar de cotação.'
      }
    },

    {
      path: 'pedido-direto-v',
      name: 'PedidoDiretoVend',
      component: () => import('@/views/PedidoDiretoVend.vue'),
      meta: {
          title: 'Pedido direto',
          subtitle: 'Confira os pedidos diretos que você está associado e fature imediatamente sem cotar'
      }
    },

    {
      path: 'detalhes-pedido-direto',
      name: 'DetalhesPedidoDireto',
      component: () => import('@/views/DetalhesPedidoDireto.vue'),
      meta: {
          title: 'Pedido direto',
          subtitle: 'Consulte seu faturamento no pedido direto'
      }
    },

    {
      path: 'cotacao-console-c',
      name: 'cotacaoConsoleColetor',
      component: () => import('@/views/TelasColetor/CotacaoConsole.vue'),
      meta: {
          title: 'Pedido direto',
          subtitle: 'Consulte seu faturamento no pedido direto'
      }
    },

    {
      path: 'console-cotacao-d',
      name: 'ConsoleCotacaoDesktop',
      component: () => import('@/views/Dono/ConsoleCotacaoDesktop.vue'),
      meta: {
          title: 'Console de cotação',
          subtitle: 'Aqui você pode monitorar responder os itens da cotação'
      }
    },

  ]
};

export default privateRoutes;