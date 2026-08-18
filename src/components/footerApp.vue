<template>
  <!-- ══ DESKTOP (≥992px): Sidebar lateral ══ -->
  <aside v-if="isDesktop" :class="{ 'Menu1': expandindo, 'Menu2': !expandindo }">

    <!-- Topo: logo + info da marca -->
    <div>
      <div class="header-user-top" v-if="expandindo">
        <div class="logo-rect">
          <img src="../assets/img/retangulo-logo.png" alt="" />
        </div>
        <div class="user-info">
          <span style="color: #222; padding: 0; font-weight: 700;">
            Market <span style="color: #ff8049;">Vizium</span>
          </span>
          <span class="role" v-if="nivel == 1">Administrador</span>
          <span class="role" v-if="nivel == 4">Estoquista</span>
          <span class="role" v-if="nivel == 6">Supervisor</span>
          <span class="role" v-if="nivel == 4">Operador</span>
          <span class="role" v-if="nivel == 5">Vendedor</span>
        </div>
      </div>
      <div v-else style="display: flex; justify-content: center; align-items: center; padding: 10px; padding-top: 20px;">
        <div class="logo-rect">
          <img src="../assets/img/retangulo-logo.png" alt="" />
        </div>
      </div>
    </div>

    <!-- Botão Dashboard destacado -->
    <div style="padding-left: 5px; padding-right: 5px; width: 100%;" v-if="expandindo">
      <button class="dashboard-button" v-if="dashButtonData.name" @click="handleItemClick(dashButtonData, -1)">
        <div style="display: flex; align-items: center; padding-left: 5px; font-size: 19px;">
          <i class="material-symbols-outlined botaoIcone" style="color: #FFF;">dashboard</i>
          <div style="padding-left: 10px; font-size: 14px;">Dashboard</div>
          <div class="novo-estilo">Novo</div>
        </div>
      </button>
    </div>
    <div style="padding-left: 5px; padding-right: 5px; width: 100%;" v-else>
      <button class="dashboard-button" v-if="dashButtonData.name" @click="handleItemClick(dashButtonData, -1)">
        <div style="display: flex; align-items: center; font-size: 19px; justify-content: center;">
          <i class="material-symbols-outlined botaoIcone" style="color: #FFF;">dashboard</i>
        </div>
      </button>
    </div>
    

    <!-- Itens do menu -->
    <div class="itens-section">
      <div :class="{ 'ItensMenu1': expandindo, 'ItensMenu2': !expandindo }">
        <div v-for="(item, index) in itens" :key="index" class="menu-item-wrapper">

          <!-- Botão pai -->
          <button
            :class="{ 'itens-style': expandindo, 'itens-style2': !expandindo, 'item-bloqueado': itemBloqueado(item) }"
            :style="abaAtiva === item.name ? 'border-right: solid 5px #FF8049; background-color: #f5f5f5;' : ''"
            style="color: #000; "
            :disabled="itemBloqueado(item)"
            @click="handleItemClick(item, index)"
          >
            <div style="display: flex; align-items: center; padding-left: 5px; font-size: 19px;">
              <i class="material-symbols-outlined botaoIcone" style="color: #000; font-weight: 700;">{{ item.icon }}</i>
              <div style="padding-left: 10px; font-size: 14px;" v-if="expandindo">{{ item.name_front }}</div>
            </div>
            <div v-show="expandindo" class="poppins-regular menu-label">
              <i
                v-if="item.children"
                class="material-symbols-outlined arrow"
                :class="{ open: openMenuIndex === index }"
              >expand_more</i>
            </div>
          </button>

          <!-- Dropdown filhos -->
          <div v-show="openMenuIndex === index && expandindo" class="submenu">
            <button
              v-for="(child, cIndex) in item.children"
              :key="cIndex"
              class="submenu-item"
              @click="goToChild(child.route)"
            >
              {{ child.name }}
            </button>
          </div>

        </div>
      </div>
    </div>

    <!-- Rodapé: avatar + nome/email do usuário -->
    <div style="color: #222;" v-if="expandindo">
      <div class="header-user" style="cursor: pointer;" @click="user.nivel==5 ? $router.push({name: 'Perfil'}) : $router.push({name: 'MeuPerfil'})">
        <div class="logo-rect" style="cursor: pointer;">
          <img v-if="user.foto_perfil" :src="user.foto_perfil" alt="Profile" @click="goTo('minhaConta')" style="border-radius: 10px; margin-top: 5px;" width="40" height="40" />
          <img v-else-if="user.foto" :src="user.foto" alt="Profile" @click="goTo('minhaConta')" style="border-radius: 10px; margin-top: 5px;" width="40" height="40" />
          <img v-else src="../assets/img/personagem.png" alt="Profile" @click="goTo('minhaConta')" style="border-radius: 10px; margin-top: 5px;" width="40" height="40" />
        </div>
        <div class="user-info">
          <span class="nome-user-negrito poppins-extrabold"><b>{{ nome }}</b></span>
          <span class="nome-user">{{ email }}</span>
        </div>
      </div>
    </div>
    <div v-else style="display: flex; justify-content: center; align-items: center; padding: 10px; padding-bottom: 20px;">
      <div class="logo-rect" style="cursor: pointer;">
        <img v-if="user.foto_perfil" :src="user.foto_perfil" alt="Profile" @click="goTo('minhaConta')" style="border-radius: 10px; margin-top: 5px;" width="40" height="40" />
        <img v-else-if="user.foto" :src="user.foto" alt="Profile" @click="goTo('minhaConta')" style="border-radius: 10px; margin-top: 5px;" width="40" height="40" />
        <img v-else src="../assets/img/personagem.png" alt="Profile" @click="goTo('minhaConta')" style="border-radius: 10px; margin-top: 5px;" width="40" height="40" />
      </div>
    </div>
  </aside>

  <!-- ══ MOBILE (<992px): Footer tab-bar ══ -->
  <ion-footer v-else class="ion-no-border">
    <div class="footer-container">

      <!-- Sempre 3 itens no mobile, nessa ordem: Menu | Explorar (FAB) | Perfil -->
      <div class="tab-bar-custom tab-bar-compact">

        <button class="tab-btn menu-toggle-btn" @click="menuLateralAberto = true">
          <span class="material-symbols-outlined">menu</span>
        </button>

        <div class="fab-wrapper" v-if="user.nivel == 5 || user.nivel == 1">
          <button class="fab-button" @click="navegar(user.nivel == 5 ? 'Explorar' : 'ExplorarVendedores')">
            <span class="material-symbols-outlined">search</span>
          </button>
        </div>

        <button
          class="tab-btn"
          :class="{ 'active': abaAtiva === 'Perfil' || abaAtiva === 'MeuPerfil' }"
          @click="navegar(user.nivel == 5 ? 'Perfil' : 'MeuPerfil')"
        >
          <img v-if="user.foto_perfil" :src="user.foto_perfil" class="tab-avatar" />
          <img v-else-if="user.foto" :src="user.foto" class="tab-avatar" />
          <img v-else src="../assets/personagem.png" class="tab-avatar" />
        </button>

      </div>
    </div>

    <!-- ═ Menu lateral (drawer) — abre pelo botão de menu no mobile ═ -->
    <transition name="menu-lateral-fade">
      <div v-if="menuLateralAberto" class="menu-lateral-overlay" @click.self="menuLateralAberto = false">
        <transition name="menu-lateral-slide" appear>
          <div class="menu-lateral-panel">
            <div class="menu-lateral-header">
              <div class="menu-lateral-user">
                <img v-if="user.foto_perfil" :src="user.foto_perfil" class="menu-lateral-avatar" />
                <img v-else-if="user.foto" :src="user.foto" class="menu-lateral-avatar" />
                <img v-else src="../assets/personagem.png" class="menu-lateral-avatar" />
                <div class="user-info">
                  <span class="nome-user-negrito poppins-extrabold">{{ nome }}</span>
                  <span class="nome-user">{{ email }}</span>
                </div>
              </div>
              <button class="menu-lateral-close" @click="menuLateralAberto = false">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            <div class="menu-lateral-itens">
              <button
                v-for="menu in menuPermitido"
                :key="menu.name"
                class="menu-lateral-item"
                :class="{ active: abaAtiva === menu.name, 'item-bloqueado': itemBloqueado(menu) }"
                :disabled="itemBloqueado(menu)"
                @click="navegarLateral(menu.name)"
              >
                <span class="material-symbols-outlined">{{ menu.icon }}</span>
                <span>{{ menu.name_front || menu.name }}</span>
              </button>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </ion-footer>
</template>

<script lang="ts">
import avatarDefault from '@/assets/personagem.png';

import {
  IonHeader,
  IonToolbar,
  IonContent,
  IonFooter,
  IonRefresher,
  IonRefresherContent,
  IonRouterOutlet
} from '@ionic/vue';
import { defineComponent } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { mapState } from 'pinia';
import headerApp from '@/components/headerApp.vue';
import { api } from '@/services/api';

// Itens do menu que exigem empresa cadastrada para o Vendedor (nivel 5)
const ITENS_REQUER_EMPRESA = ['PedidoDiretoVend', 'TrendsVendedor'];

export default defineComponent({
  name: 'footerApp',
  components: {
    IonHeader,
    IonToolbar,
    IonContent,
    IonFooter,
    IonRefresher,
    IonRefresherContent,
    IonRouterOutlet,
    headerApp
  },
  data() {
    return {
      abaAtiva: 'Dashboard',

      // Sidebar state
      isDesktop: false,
      mediaQuery: null as MediaQueryList | null,
      expandindo: true,
      openMenuIndex: null as number | null,
      dashButtonData: {} as any,
      itens: [] as any[],
      nome: null as string | null,
      email: null as string | null,
      nivel: null as number | null,
      foto_perfil: null as string | null,

      menuLateralAberto: false,

      // Vendedor (nivel 5): controla se possui empresa cadastrada E selecionada.
      // Começa true para não "piscar" desabilitado antes da checagem terminar.
      temEmpresaSelecionada: true,
    };
  },
  computed: {
    ...mapState(useAuthStore, ['user', 'menuPermitido']),

    primeiroNome() {
      return this.user?.nome?.split(' ')[0] || 'Usuário';
    }
  },
  props :{
    expandir: {
      type: Boolean
    }
  },
  methods: {
    handleRefresh(event: any) {
      setTimeout(() => event.target.complete(), 1500);
    },

    // Mobile: navega e atualiza aba
    navegar(routeName: string) {
      if (!routeName) return;
      this.abaAtiva = routeName;
      this.$router.push({ name: routeName });
    },

    // Mobile compacto: navega a partir do menu lateral e fecha o drawer
    navegarLateral(routeName: string) {
      if (this.itemBloqueado({ name: routeName })) return;
      this.navegar(routeName);
      this.menuLateralAberto = false;
    },

    // Desktop: navega por item do sidebar
    handleItemClick(item: any, index: number) {

      if (this.itemBloqueado(item)) return;

      if (!this.expandindo) this.expandindo = true;

      if (item.children && item.children.length) {
        this.openMenuIndex = this.openMenuIndex === index ? null : index;
      } else {
        this.abaAtiva = item.name;
        this.$router.push({name: item.name});
      }
    },

    goToChild(route: any) {
      this.$router.push(route);
    },

    goTo(routeName: string) {
      this.$router.push({ name: routeName });
    },

    onMediaChange(e: MediaQueryListEvent) {
      this.isDesktop = e.matches;
    },

    // Vendedor (nivel 5): verifica se há empresa cadastrada E selecionada.
    // Enquanto não houver (nenhuma cadastrada OU nenhuma marcada como selecionada),
    // os itens em ITENS_REQUER_EMPRESA ficam bloqueados.
    async verificarEmpresaVendedor() {
      try {
        const response = await api.get('/mvpu/usuario/operacoesEmpresaVendedor/');
        const empresas = response.data?.data || [];

        if (empresas.length === 0) {
          // Nenhuma empresa cadastrada
          this.temEmpresaSelecionada = false;
          return;
        }

        // Precisa existir pelo menos uma empresa marcada como selecionada
        this.temEmpresaSelecionada = empresas.some((empresa: any) => empresa.selecionada);
      } catch (err) {
        // Em caso de falha na verificação, não bloqueia o usuário indevidamente
        this.temEmpresaSelecionada = true;
      }
    },

    // Indica se o item do menu deve ficar bloqueado para o vendedor sem empresa cadastrada/selecionada
    itemBloqueado(item: any): boolean {
      return (
        this.nivel === 5 &&
        !this.temEmpresaSelecionada &&
        ITENS_REQUER_EMPRESA.includes(item.name)
      );
    },

    initSidebarData() {
      const auth = useAuthStore();
      const usuario = auth.usuario || auth.user;
      const arrayItens: any[] = [];

      auth.menuPermitido.forEach((item: any) => {
        if (item.name === 'Dashboard' || item.name === 'DashboardAdmin') {
          this.dashButtonData = item;
        } else {
            arrayItens.push(item);
        }

        
      });

      this.itens       = arrayItens;
      if(this.user.nivel == 5 && this.isDesktop){
        this.itens.push({
          name_front: 'Explorar lojas',
          name: "Explorar",
          icon: "search",
          route: "/explorar",
          roles: [5],
        },)
      }
      this.nivel       = usuario?.nivel ?? null;
      this.nome        = usuario?.nome ?? null;
      this.email       = usuario?.email ?? null;
      this.foto_perfil = usuario?.foto ?? null;

      if (this.nivel === 5) {
        this.verificarEmpresaVendedor();
      }
    }
  },
  mounted() {
    // Rota ativa inicial
    const auth = useAuthStore();
    const usuario = auth.usuario || auth.user;
    if (usuario?.nivel != 1) {
      this.abaAtiva = (this.$route.name as string) || 'Dashboard';
    } else {
      this.abaAtiva = (this.$route.name as string) || 'DashboardAdmin';
    }

    // Breakpoint
    this.mediaQuery = window.matchMedia('(min-width: 992px)');
    this.isDesktop  = this.mediaQuery.matches;
    this.mediaQuery.addEventListener('change', this.onMediaChange);

    // Dados do sidebar
    this.initSidebarData();
  },
  beforeUnmount() {
    this.mediaQuery?.removeEventListener('change', this.onMediaChange);
  },
  watch: {
    '$route.name'(newVal) {
      if (newVal) this.abaAtiva = newVal as string;
      this.menuLateralAberto = false;
    },

    expandir(novoValor){
      this.expandindo = novoValor
    }

  }
});
</script>

<style scoped>

/* ══════════════════════════
   SIDEBAR (desktop ≥992px)
══════════════════════════ */

.Menu1 {
  width: 198px;
  height: 100vh;
  background-color: #fff;
  border-right: solid 1px #f0f0f0;
  color: #222;
  transition: width 0.3s;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  flex-shrink: 0;
}

.Menu2 {
  width: 80px;
  height: 100vh;
  background-color: #fff;
  border-right: solid 1px #f0f0f0;
  color: #222;
  transition: width 0.3s;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  flex-shrink: 0;
  position: relative;
}

.header-user {
  padding: 10px;
  display: flex;
  align-items: flex-start;
}

.header-user-top {
  padding: 10px;
  padding-top: 20px;
  display: flex;
  align-items: flex-start;
}

.logo-rect img {
  margin-top: 2px;
  display: block;
}

.user-info {
  padding-left: 10px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  justify-content: flex-start;
}

.role {
  margin-top: 0;
  font-size: 14px;
  color: #888888;
}

.itens-section {
  height: 100%;
  overflow-y: auto;
}

.nome-user {
  margin: 0;
  font-size: 14px;
  width: 110px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nome-user-negrito {
  margin: 0;
  font-size: 16px;
  width: 115px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu-item-wrapper {
  display: flex;
  flex-direction: column;
}

.arrow {
  margin-left: auto;
  transition: transform 0.3s;
}

.arrow.open {
  transform: rotate(180deg);
}

.submenu {
  padding-left: 48px;
  display: flex;
  flex-direction: column;
}

.submenu-item {
  background: transparent;
  border: none;
  color: #666;
  text-align: left;
  padding: 6px 0;
  cursor: pointer;
  font-size: 14px;
}

.submenu-item:hover {
  color: #FF8049;
}

.itens-style {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: transparent;
  border: none;
  cursor: pointer;
  height: 40px;
  width: 100%;
}

.itens-style:hover {
  border-right: solid 5px #FF8049;
  background-color: #e5e5e5;
  transition: 0.2s;
}

.itens-style2 {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: transparent;
  border: none;
  cursor: pointer;
  height: 40px;
  width: 100%;
}

.itens-style2:hover {
  border-right: solid 5px #FF8049;
  background-color: #e5e5e5;
  transition: 0.2s;
}

.dashboard-button {
  width: 100%;
  height: 40px;
  margin-top: 20px;
  margin-bottom: 20px;
  background: linear-gradient(to right, #0D129E, #6D197C);
  color: #FFF;
  border-radius: 8px;
  cursor: pointer;
  border: none;
  transition: 0.5s;
}

.dashboard-button:hover {
  transform: translateY(-5px);
  transition: 0.5s;
}

.novo-estilo {
  color: #FFF;
  font-size: 12px;
  background-color: #DD0000;
  border-radius: 2px;
  padding-left: 2px;
  padding-right: 2px;
  margin-left: 5px;
}

.botaoIcone {
  font-size: 20px;
  color: #000;
  font-style: normal;
}

/* Item de menu bloqueado (vendedor sem empresa cadastrada) */
.item-bloqueado,
.item-bloqueado:hover {
  cursor: not-allowed !important;
  opacity: 0.45;
  pointer-events: none;
  border-right: none !important;
  background-color: transparent !important;
}

/* Botão colapsar/expandir sidebar */
.toggle-btn {
  position: absolute;
  bottom: 12px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid #e5e5e5;
  background: #f8f8f8;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #888;
  transition: background 0.2s;
}

.toggle-btn:hover {
  background: #ffe8df;
  color: #ff8049;
}

.toggle-btn i {
  font-size: 18px;
  font-style: normal;
}

/* ══════════════════════════
   FOOTER (mobile <992px)
══════════════════════════ */

.footer-container {
  background: #eef1f3;
  /* Barra fixa "grudada" na base, sem gap flutuante. 15px de respiro pros
     ícones + a área segura do dispositivo (notch/gesture bar). */
  padding: 8px 16px calc(15px + env(safe-area-inset-bottom, 0px)) 16px;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.05);
}

.tab-bar-custom {
  background: transparent;
  height: 56px;
  border-radius: 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  position: relative;
}

.tab-bar-compact {
  justify-content: space-between;
  padding: 0 4px;
}

.fab-wrapper {
  position: relative;
  /* Continua "subindo" o botão de busca como destaque visual, mas os demais
     ícones ficam todos alinhados na mesma altura da barra. */
  top: -18px;
}

.fab-button {
  width: 56px;
  height: 56px;
  background: #ff7f50;
  border: none;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(255, 127, 80, 0.4);
  cursor: pointer;
}

.material-symbols-outlined {
  font-variation-settings: 'wght' 200, 'opsz' 24;
  font-size: 28px;
  -webkit-font-smoothing: antialiased;
  display: block;
  font-style: normal;
}

.tab-btn {
  background: none;
  border: none;
  color: #64748b;
  height: 56px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  cursor: pointer;
}

.tab-btn.active {
  color: #ff7f50;
}

.tab-btn.active .material-symbols-outlined {
  font-variation-settings: 'wght' 400, 'opsz' 24;
}

.menu-toggle-btn {
  color: #1e293b;
}

.tab-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  filter: grayscale(100%);
  transition: 0.2s;
  border: 1px solid transparent;
}

.active .tab-avatar {
  filter: grayscale(0%);
  border-color: #ff7f50;
}

/* ══════════════════════════
   MENU LATERAL (<450px)
══════════════════════════ */

.menu-lateral-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  z-index: 9999;
  display: flex;
  justify-content: flex-start;
}

.menu-lateral-panel {
  width: 78%;
  max-width: 300px;
  height: 100%;
  background: #fff;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding-top: env(safe-area-inset-top, 0px);
}

.menu-lateral-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 18px 16px 14px;
  border-bottom: 1px solid #f0f0f0;
}

.menu-lateral-user {
  display: flex;
  align-items: center;
}

.menu-lateral-avatar {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  object-fit: cover;
}

.menu-lateral-close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: #f1f3f5;
  color: #1e293b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex: none;
}

.menu-lateral-itens {
  display: flex;
  flex-direction: column;
  padding: 10px 8px;
}

.menu-lateral-item {
  display: flex;
  align-items: center;
  gap: 12px;
  border: none;
  background: transparent;
  color: #222;
  border-radius: 10px;
  padding: 12px 10px;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
}

.menu-lateral-item:hover {
  background: #f5f5f5;
}

.menu-lateral-item.active {
  background: #ffe8df;
  color: #ff7f50;
}

.menu-lateral-item.active .material-symbols-outlined {
  color: #ff7f50;
}

.menu-lateral-fade-enter-active,
.menu-lateral-fade-leave-active {
  transition: opacity 0.2s ease;
}
.menu-lateral-fade-enter-from,
.menu-lateral-fade-leave-to {
  opacity: 0;
}

.menu-lateral-slide-enter-active,
.menu-lateral-slide-leave-active {
  transition: transform 0.25s ease;
}
.menu-lateral-slide-enter-from,
.menu-lateral-slide-leave-to {
  transform: translateX(-100%);
}

.main-content {
  --ion-background-color: #ffffff;
}

/* utilitários */
.poppins-regular   { font-family: 'Poppins', sans-serif; font-weight: 400; }
.poppins-extrabold { font-family: 'Poppins', sans-serif; font-weight: 800; }
</style>