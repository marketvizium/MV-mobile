import { defineStore } from 'pinia'
import { jwtDecode } from 'jwt-decode'
import { api } from '../services/api'
import router from '@/router'

// Tipagem básica para o usuário (ajuste conforme seu JWT)
interface User {
  id_usuario: number;
  nivel: number;
  [key: string]: any;
}

export const useAuthStore = defineStore('auth', {
  persist: true, // Certifique-se de que o pinia-plugin-persistedstate está instalado
  
  state: () => ({
    token    : localStorage.getItem('token')     || null as string | null,
    conectado: localStorage.getItem('conectado') || null,
    user     : localStorage.getItem('token') ? jwtDecode<User>(localStorage.getItem('token')!) : null as User | null,
    loj: JSON.parse(localStorage.getItem('loj') || '{}'),

  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    usuario: (state) => state.user,
    id_usuario: (state) => state.user ? state.user.id_usuario : null,
    loja: (state) => state.loj,

    // Getter para menus adaptado para Ionicons
    menuPermitido: (state) => {

      const menus = [

        // =========================================
        // VENDEDOR
        // =========================================

        {
          name_front: 'Dashboard',
          name: "Dashboard",
          icon: "home",
          route: "/dashboard",
          roles: [5],
        },

        {
          name_front: 'Minhas cotações',
          name: "Cotacoes",
          icon: "list_alt",
          route: "/cotacoes",
          roles: [5],
        },

        {
          name_front: 'Pedido direto',
          name: "PedidoDiretoVend",
          icon: "move_group",
          route: "/pedido-direto-v",
          roles: [5],
        },
        
        {
          name_front: 'Marviz Trends',
          name: "TrendsVendedor",
          icon: "view_in_ar",
          route: "/trends-vendedor",
          roles: [5],
        },

        {
          name_front: 'Lojas',
          name: "Lojas",
          icon: "storefront",
          route: "/lojas",
          roles: [5],
        },

        {
          name_front: 'Meu perfil',
          name: "Perfil",
          icon: "person",
          route: "/perfil",
          roles: [5],
        },

        // =========================================
        // DONO DA LOJA
        // =========================================

        {
          name_front: 'Dashboard',
          name: "DashboardAdmin",
          icon: "dashboard",
          route: "/dashboard-admin",
          roles: [1, 6],
        },
        

        {
          name_front: 'Minhas cotações',
          name: "MinhasCotacoes",
          icon: "box",
          route: "/cons-pedido-direto",
          roles: [1, 6, 7],
        },

        {
          name_front: 'Pedido direto',
          name: "ConsPedidosDiretos",
          icon: "move_group",
          route: "/minhas-cotacoes",
          roles: [1, 6, 7],
        },

        {
          name_front: 'Marviz Trends',
          name: "TrendsVarejor",
          icon: "view_in_ar",
          route: "/marviz-trends-var",
          roles: [1, 6],
        },

        {
          name_front: 'Colaboradores',
          name: "ColaboradorHome",
          icon: "person_book",
          route: "/colaboradores-home",
          roles: [1, 6],
        },

        {
          name_front: 'Vendedores',
          name: "VendedoresHome",
          icon: "sell",
          route: "/vendedores-home",
          roles: [1, 6],
        },


        {
          name_front: 'Cadastro produtos',
          name: "CadastroProdutoDono",
          icon: "list_alt_add",
          route: "/cadastro-produto-dono",
          roles: [1, 6],
        },


        {
          name_front: 'Meu perfil',
          name: "MeuPerfil",
          icon: "person",
          route: "/meu-perfil",
          roles: [1, 6, 7],
        },

        // =========================================
        // ADMIN MARVIZ
        // =========================================

        {
          name_front: 'Cadastro Cliente',
          name: "AberturaCliente",
          icon: "person",
          route: "/abertura-cliente",
          roles: [8],
        },
      ]

      // =========================================
      // SEM USER
      // =========================================

      if (!state.user?.nivel) {
        return []
      }

      const userNivel = Number(state.user.nivel)

      // =========================================
      // FILTRA MENUS
      // =========================================

      return menus
        .filter(menu => menu.roles?.includes(userNivel))
        .map(menu => {

          // =========================================
          // CHILDREN
          // =========================================

          if (
            "children" in menu &&
            Array.isArray(menu.children)
          ) {

            return {
              ...menu,
              children: menu.children.filter(
                child => child.roles?.includes(userNivel)
              )
            }
          }

          return menu
        })
    }
  },

  actions: {
    async login(payload: any) {
      try {

        let data: any = null

        // =========================================
        // TENTA LOGIN VENDEDOR
        // =========================================

        try {

          const response = await api.post('/mvpu/usuario/loginVendedor', payload)
          data = response.data

          

        } catch (error: any) {

          // =========================================
          // SE FOR 401 -> TENTA LOGIN SIS
          // =========================================

          

          if (error?.response?.status === 401) {

            try {

              const responseSis = await api.post('/mvpu/usuario/loginSis', payload)
              data = responseSis.data

            } catch (errorSis: any) {

              // Se também falhar
              throw new Error('Usuário inexistente')
            }

          } else {

            // Qualquer outro erro
            throw error
          }
        }

        // =========================================
        // TOKEN
        // =========================================

        this.token = data.data.token

        localStorage.setItem('token', this.token!)

        this.decodeToken()

        console.log(this.user)

        ////////////////////////////////////////////////////////////////////////////
        //REDIRECIONAMENTOS USUÁRIOS////////////////////////////////////////////////
        if (this.user?.nivel == 5 && this.token) {////////VENDEDOR//////////////////

          localStorage.setItem('conectado', payload.manter_conectado)

          

          await router.replace({ name: 'Dashboard' })

          return

        }else if (this.user?.nivel == 1 && this.token) {//COMERCIENTE///////////////

          const responseSis = await api.get(
            '/mvpu/usuario/consultarLojas',
            {
              ...payload,

              headers: {
                Authorization: `Bearer ${this.token}`
              }
            }
          )
          
          const QUANTIDADES_LOJAS = responseSis.data.data.length

          //Aqui é a lógica de selecionar mais de uma loja caso houver

          if(QUANTIDADES_LOJAS > 1){
            localStorage.setItem('conectado', payload.manter_conectado)
            await router.replace({ name: 'SelecionarLoja' })
            return
          }else{

            localStorage.setItem(
              'loj',
              JSON.stringify(responseSis.data.data[0])
            )

            this.loj = responseSis.data.data[0]

            localStorage.setItem('conectado', payload.manter_conectado)
            await router.replace({ name: 'DashboardAdmin' })
            return
          }

        }else if (this.user?.nivel == 6 && this.token) {//SUPERVISOR////////////////
          const responseSis = await api.get(
            '/mvpu/usuario/consultarLojas',
            {
              ...payload,

              headers: {
                Authorization: `Bearer ${this.token}`
              }
            }
          )
          
          const QUANTIDADES_LOJAS = responseSis.data.data.length
          

          //Aqui é a lógica de selecionar mais de uma loja caso houver

          if(QUANTIDADES_LOJAS > 1){
            localStorage.setItem('conectado', payload.manter_conectado)
            await router.replace({ name: 'SelecionarLoja' })
            return
          }else{

            localStorage.setItem(
              'loj',
              JSON.stringify(responseSis.data.data[0])
            )

            this.loj = responseSis.data.data[0]

            localStorage.setItem('conectado', payload.manter_conectado)
            await router.replace({ name: 'DashboardAdmin' })
            return
          }
        }else if (this.user?.nivel == 7 && this.token) {//OPERADOR//////////////////
          const responseSis = await api.get(
            '/mvpu/usuario/consultarLojas',
            {
              ...payload,

              headers: {
                Authorization: `Bearer ${this.token}`
              }
            }
          )
          
          const QUANTIDADES_LOJAS = responseSis.data.data.length

          //Aqui é a lógica de selecionar mais de uma loja caso houver

          if(QUANTIDADES_LOJAS > 1){
            localStorage.setItem('conectado', payload.manter_conectado)
            await router.replace({ name: 'SelecionarLoja' })
            return
          }else{

            localStorage.setItem(
              'loj',
              JSON.stringify(responseSis.data.data[0])
            )

            this.loj = responseSis.data.data[0]

            localStorage.setItem('conectado', payload.manter_conectado)
            await router.replace({ name: 'MinhasCotacoes' })
            return
          }
        }else if (this.user?.nivel == 8 && this.token) {//ADMIN MARKET VIZIUM///////

          console.log("CHEGOU AQUI")
          localStorage.setItem('conectado', payload.manter_conectado)
          await router.replace({ name: 'AberturaCliente' })
          console.log("REDIRECT")
          return
          
        }else {/////////////////////////////////////////////////////////////////////

          throw new Error('Usuário inexistente')
        }///////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////

      } catch (error: any) {
        throw new Error('Usuário inexistente')
      }
    },

    setLoja(payload: any){
      localStorage.setItem(
        'loj',
        JSON.stringify(payload)
      )

      this.loj = payload

      return true
    },

    setUsuario(payload: any){
      if(!payload) return
      this.user = payload
    },

    decodeToken() {
      if (!this.token) return
      try {
        this.user = jwtDecode<User>(this.token)
      } catch (e) {
        this.logout()
      }
    },

    async logout() {
      
      localStorage.removeItem('token')
      localStorage.removeItem('eimrd')
      localStorage.removeItem('loj')
      localStorage.removeItem('conectado')
      localStorage.removeItem('auth')

      this.token      = null
      this.loj        = null
      this.conectado  = null
      this.user       = null

      window.location.replace('/login')
      
      // No Ionic, replace é melhor no logout para limpar a pilha de navegação
    }
  }
})