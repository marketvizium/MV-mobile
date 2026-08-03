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
          <div style="padding-left: 10px; font-size: 14px;">{{ dashButtonData.name }}</div>
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
            :class="{ 'itens-style': expandindo, 'itens-style2': !expandindo }"
            :style="abaAtiva === item.name ? 'border-right: solid 5px #FF8049; background-color: #f5f5f5;' : ''"
            style="color: #000; "
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
      <div class="tab-bar-custom">

        <template v-for="(menu, index) in menuPermitido" :key="menu.name">

          <div style="background: transparent;" v-if="user.nivel == 5">
            <div style="background: transparent;" v-if="index === Math.floor(menuPermitido.length / 2)" class="fab-wrapper">
              <button class="fab-button" @click="navegar('Explorar')">
                <span class="material-symbols-outlined">search</span>
              </button>
            </div>
          </div>
          <div style="background: transparent;" v-else-if="user.nivel == 1">
            <div style="background: transparent;" v-if="index === Math.floor(menuPermitido.length / 2)" class="fab-wrapper">
              <button class="fab-button" @click="navegar('ExplorarVendedores')">
                <span class="material-symbols-outlined">search</span>
              </button>
            </div>
          </div>

          <button
            class="tab-btn"
            :class="{ 'active': abaAtiva === menu.name }"
            @click="navegar(menu.name)"
          >
          
            <template v-if="menu.name == 'Perfil' || menu.name == 'MeuPerfil'">
              <img v-if="user.foto_perfil" :src="user.foto_perfil" class="tab-avatar" />
              <img v-else-if="user.foto" :src="user.foto" class="tab-avatar" />
              <img v-else src="../assets/personagem.png" class="tab-avatar" />
            </template>
            <template v-else>
              <span class="material-symbols-outlined">{{ menu.icon }}</span>
            </template>
          </button>

        </template>

      </div>
    </div>
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
      this.abaAtiva = routeName;
      this.$router.push({ name: routeName });
    },

    // Desktop: navega por item do sidebar
    handleItemClick(item: any, index: number) {
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

    initSidebarData() {
      const auth = useAuthStore();
      const usuario = auth.usuario || auth.user;
      const arrayItens: any[] = [];

      auth.menuPermitido.forEach((item: any) => {
        if (item.name === 'Dashboard') {
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
  background: transparent;
  padding: 0 16px 40px 16px;
}

.tab-bar-custom {
  background: #eef1f3;
  height: 72px;
  border-radius: 35px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}

.fab-wrapper {
  position: relative;
  top: -22px;
}

.fab-button {
  width: 62px;
  height: 62px;
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
  padding: 10px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.tab-btn.active {
  color: #ff7f50;
}

.tab-btn.active .material-symbols-outlined {
  font-variation-settings: 'wght' 400, 'opsz' 24;
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

.main-content {
  --ion-background-color: #ffffff;
}

/* utilitários */
.poppins-regular   { font-family: 'Poppins', sans-serif; font-weight: 400; }
.poppins-extrabold { font-family: 'Poppins', sans-serif; font-weight: 800; }
</style>