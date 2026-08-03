import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import privateRoutes from './privateRoutes';
import noPlataformRoutes from './publicRoutes';
import { useAuthStore } from '@/stores/auth';

const routes: Array<RouteRecordRaw> = [
  noPlataformRoutes,
  privateRoutes,
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})


router.beforeEach((to, from, next) => {

  const authStore = useAuthStore()

  // =========================================
  // AUTH
  // =========================================

  const requiresAuth = to.matched.some(
    record => record.meta.requiresAuth
  )

  // =========================================
  // NÃO LOGADO
  // =========================================

  if (requiresAuth && !authStore.isAuthenticated) {
    return next({ name: 'Login' })
  }

  // =========================================
  // LOGADO TENTANDO IR PRO LOGIN
  // =========================================

  if (
    (to.name === 'Login' || to.name === 'BemVindo')
    && authStore.isAuthenticated
  ) {

    
    if (authStore.user?.nivel == 1) {
      return next({ name: 'DashboardAdmin' })
    }

    if (authStore.user?.nivel == 6) {
      return next({ name: 'DashboardAdmin' })
    }

    if (authStore.user?.nivel == 7) {
      return next({ name: 'MinhasCotacoes' })
    }

    if (authStore.user?.nivel == 5) {
      return next({ name: 'Dashboard' })
    }
  }

  // =========================================
  // ROLES
  // =========================================

  const allowedRoles = to.meta.roles as number[] | undefined
  const userNivel = Number(authStore.user?.nivel)

  if (
    requiresAuth &&
    allowedRoles &&
    !allowedRoles.includes(userNivel)
  ) {

    

    
    // ADMIN
    if (userNivel === 1 || userNivel === 6) {

      if (to.name !== 'DashboardAdmin') {
        //return next({ name: 'DashboardAdmin' })
      }

      return next()
    }

    if (userNivel === 7) {

      if (to.name !== 'MinhasCotacoes') {
        //return next({ name: 'MinhasCotacoes' })
      }

      return next()
    }


    // VENDEDOR
    if (userNivel === 5) {

      if (to.name !== 'Dashboard') {
        return next({ name: 'Dashboard' })
      }

      return next()
    }

    return next({ name: 'Login' })
  }

  // =========================================
  // LIBERA ROTA
  // =========================================

  return next()
})

export default router
