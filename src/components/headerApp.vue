<template>

  <!-- ══════════════════════════════════════
       DESKTOP ≥992px — layout headerTop
  ══════════════════════════════════════ -->
  

  <!-- ══════════════════════════════════════
       MOBILE <992px — layout headerApp
  ══════════════════════════════════════ -->
  <ion-header class="ion-no-border header-glass">
    <ion-toolbar class="transparent-toolbar" style="overflow: visible;">

      <div v-if="isDesktop" class="root-header">

        <!-- LEFT: botão menu + título/subtítulo da página -->
        <div class="main-left-section">
          <button class="btn-menu" @click="emitExpandir">
            <i class="material-symbols-outlined">menu</i>
          </button>

          
          <div class="page-header">
            <span class="page-title">{{ $route.meta?.title }}</span>
            <span class="page-subtitle">{{ $route.meta?.subtitle }}</span>
          </div>
          
        </div>

        <!-- RIGHT: atualizar + usuário com dropdown -->
        <div class="right-section">

          <div class="icons-section">
            <button @click="updatePage" class="btn-headers" style="margin-top: 7px;">
              <span class="material-symbols-outlined">update</span>
            </button>
          </div>

          <!-- USER DROPDOWN -->
          <div class="user-wrapper" ref="userWrapper">
            <div class="header-user" @click="toggleDropdown">
              <div class="logo-rect">
                <img
                  v-if="usuarioLocal?.foto_perfil"
                  :src="usuarioLocal.foto_perfil"
                  alt="Profile"
                  style="border-radius: 10px; margin-top: 5px;"
                  width="40" height="40"
                />
                <img
                  v-else-if="usuarioLocal?.foto"
                  :src="usuarioLocal.foto"
                  alt="Profile"
                  style="border-radius: 10px; margin-top: 5px;"
                  width="40" height="40"
                />
                <img
                  v-else
                  src="../assets/personagem.png"
                  alt="Profile"
                  style="border-radius: 10px; margin-top: 5px;"
                  width="40" height="40"
                />
              </div>

              <div class="user-info" @click="user.nivel==5 ? $router.push({name: 'Perfil'}) : $router.push({name: 'MeuPerfil'})">
                <span class="nome-user-negrito poppins-extrabold">
                  <b>{{ usuarioLocal?.nome }}</b>
                </span>
                <span class="nome-user">{{ usuarioLocal?.email }}</span>
              </div>

              <div :class="'arrow'">
                <span class="material-symbols-outlined">arrow_drop_down</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div v-else class="header-content" style="transform: translateY(5px);">

        <div class="title-group">
          <h1 class="welcome-text poppins-medium">Olá, {{ primeiroNome }}!</h1>
        </div>

        <div class="header-actions">
          <div class="avatar-mini" v-if="usuarioLocal">
            <div v-if="usuarioLocal.nivel == 1">
              <img v-if="usuarioLocal.foto_perfil" :src="usuarioLocal.foto_perfil" alt="Profile" @click="goTo('MeuPerfil')" />
              <img v-else-if="usuarioLocal.foto"   :src="usuarioLocal.foto"         alt="Profile" @click="goTo('MeuPerfil')" />
              <img v-else src="../assets/personagem.png"                             alt="Profile" @click="goTo('MeuPerfil')" />
            </div>
            <div v-else>
              <img v-if="usuarioLocal.foto_perfil" :src="usuarioLocal.foto_perfil" alt="Profile" @click="goTo('Perfil')" />
              <img v-else-if="usuarioLocal.foto"   :src="usuarioLocal.foto"         alt="Profile" @click="goTo('Perfil')" />
              <img v-else src="../assets/personagem.png"                             alt="Profile" @click="goTo('Perfil')" />
            </div>
          </div>
        </div>

      </div>

    </ion-toolbar>
  </ion-header>

</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { mapState } from 'pinia';
import { IonHeader, IonToolbar } from '@ionic/vue';
import avatarDefault from '@/assets/personagem.png';

export default defineComponent({
  name: 'HeaderApp',
  components: {
    IonHeader,
    IonToolbar,
  },

  emits: ['expandir-diminuir-menu'],

  data() {
    return {
      usuarioLocal: null as any,
      isDesktop: false,
      mediaQuery: null as MediaQueryList | null,
      dropdownAberto: false,
    };
  },

  computed: {
    ...mapState(useAuthStore, ['user', 'menuPermitido']),

    primeiroNome() {
      return this.usuarioLocal?.nome?.split(' ')[0] || 'Usuário';
    },
  },

  watch: {
    user: {
      immediate: true,
      deep: true,
      handler(novoUser) {
        this.usuarioLocal = novoUser ?? null;
      },
    },
  },

  methods: {
    goTo(routeName: string) {
      this.$router.push({ name: routeName });
    },

    emitExpandir() {
      this.$emit('expandir-diminuir-menu');
    },

    toggleDropdown() {
      this.dropdownAberto = !this.dropdownAberto;
    },

    fecharDropdown(e: MouseEvent) {
      const wrapper = this.$refs.userWrapper as HTMLElement | undefined;
      if (wrapper && !wrapper.contains(e.target as Node)) {
        this.dropdownAberto = false;
      }
    },

    irMinhaConta() {
      this.dropdownAberto = false;
      this.$router.push('/minha-conta');
    },

    logout() {
      this.dropdownAberto = false;
      const auth = useAuthStore();
      auth.logout();
      this.$router.push('/');
    },

    updatePage() {
      window.location.reload();
    },

    onMediaChange(e: MediaQueryListEvent) {
      this.isDesktop = e.matches;
    },
  },

  mounted() {
    this.usuarioLocal = this.user ?? null;

    this.mediaQuery = window.matchMedia('(min-width: 992px)');
    this.isDesktop  = this.mediaQuery.matches;
    this.mediaQuery.addEventListener('change', this.onMediaChange);

    document.addEventListener('click', this.fecharDropdown);
  },

  beforeUnmount() {
    this.mediaQuery?.removeEventListener('change', this.onMediaChange);
    document.removeEventListener('click', this.fecharDropdown);
  },
});
</script>

<!-- 
  IMPORTANTE: tudo em <style> global (sem scoped).
  Com múltiplos nós raiz (v-if / v-else no topo do template), o Vue
  não consegue injetar o atributo de escopo no elemento raiz do desktop,
  fazendo o <style scoped> simplesmente não se aplicar — causando o
  "tudo branco" sem erros nos logs.
-->
<style scoped>

/* ══ SHARED ══════════════════════════════════════════════════════ */

.modern-app {
  --ion-background-color: #E6E8F3;
}

/* ══ MOBILE ══════════════════════════════════════════════════════ */

.header-glass {
  background-color: #FFF;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px 0 20px;
}

.title-group {
  color: #FFF;
}

.header-actions {
  display: flex;
}

.welcome-text {
  font-size: 22px;
  color: #1e293b;
  margin: 0;
  letter-spacing: -0.5px;
}

.icon-button {
  background: none;
  border: none;
  color: #334155;
  display: flex;
  padding: 8px;
}

.avatar-mini img {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
}

/* ══ DESKTOP ═════════════════════════════════════════════════════ */

.root-header {
  height: 80px;
  padding-left: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: solid 1px #f0f0f0;
  background: #fff;
  width: 100%;
  box-sizing: border-box;
}

.main-left-section {
  display: flex;
  align-items: center;
}

.page-header {
  display: flex;
  flex-direction: column;
  padding-left: 15px;
}

.page-title {
  font-size: 20px;
  color: #222;
}

.page-subtitle {
  font-size: 15px;
  color: #555;
}

.right-section {
  display: flex;
  align-items: center;
  gap: 15px;
}

.icons-section {
  display: flex;
}

.btn-menu,
.btn-headers {
  background: transparent;
  border: none;
  cursor: pointer;
  transition: transform 0.3s;
}

.btn-menu:hover,
.btn-headers:hover {
  transform: translateY(-4px);
}

.user-wrapper {
  position: relative;
  margin-right: 20px;
}

.header-user {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.user-info {
  padding-left: 10px;
  display: flex;
  flex-direction: column;
}

.nome-user {
  font-size: 14px;
  max-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nome-user-negrito {
  margin: 0;
  font-size: 16px;
  width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.arrow {
  padding-left: 10px;
  transition: transform 0.3s ease;
}

.arrow-top {
  padding-left: 10px;
  transition: transform 0.3s ease;
  transform: rotate(180deg);
}

.dropdown-user {
  position: absolute;
  right: 0;
  top: 70px;
  width: 180px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 9999;
}

.dropdown-user button {
  padding: 12px 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 14px;
}

.dropdown-user button:hover {
  background: #f5f5f5;
}

.dropdown-user .logout-btn {
  color: #c0392b;
}

/* Material Symbols */
.material-symbols-outlined {
  font-variation-settings: 'wght' 200, 'opsz' 24;
  font-size: 28px;
  -webkit-font-smoothing: antialiased;
  display: block;
  font-style: normal;
}

/* Utilitários */
.poppins-medium    { font-family: 'Poppins', sans-serif; font-weight: 500; }
.poppins-extrabold { font-family: 'Poppins', sans-serif; font-weight: 800; }

</style>