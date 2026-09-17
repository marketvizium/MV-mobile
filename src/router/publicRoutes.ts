// src/router/privateRoutes.ts
import { RouteRecordRaw } from 'vue-router';

const noPlataformRoutes: RouteRecordRaw = {
  path: '/', // Prefixo para rotas no layout da plataforma
  component: () => import('@/layouts/NoPlataformLayout.vue'),
  children: [
    {
      path: '',
      name: 'BemVindo',
      component: () => import('@/views/BemVindo.vue')
    },
    {
      path: 'login', // Alterado de 'perfil' para 'login' para bater com o arquivo
      name: 'Login',
      component: () => import('@/views/Login.vue')
    },
    {
      path: 'cadastro', // Alterado de 'explorar' para 'cadastro'
      name: 'CadastroUsuario',
      component: () => import('@/views/CadastroUsuario.vue')
    },
    {
      path: 'completar-perfil', // Alterado de 'cotacoes' para algo mais semântico
      name: 'CompletarPerfil',
      component: () => import('@/views/CompletarPerfil.vue')
    },
    {
      path: 'selecionar-loja', // Alterado de 'cotacoes' para algo mais semântico
      name: 'SelecionarLoja',
      component: () => import('@/views/Dono/SelecionarLoja.vue')
    },
    { path: '/esqueci-senha', 
      name: 'EsqueciSenha', 
      component: () => import('@/views/EsqueciSenha.vue') 
    },
    {
      path: '/conv/:hash_convite',
      name: 'AceitarConvite',
      component: () => import('@/views/ConviteVendedor.vue'),
      meta: { requiresAuth: false },
    },
  ]
};

export default noPlataformRoutes;