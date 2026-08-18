<template>
  <div class="ion-page modern-app" :class="{ 'desktop-layout': isDesktop }">

    <!-- DESKTOP: sidebar (footerApp lateral) -->
    <aside class="sidebar" v-if="isDesktop">
      <footerApp :expandir="variavelExpandir" />
    </aside>

    <!-- Coluna principal: header + content -->
    <div class="main-column">
      <headerApp @expandir-diminuir-menu="funcaoExpandir" />

      <ion-content :fullscreen="true" :scroll-events="true">

          <!--
          <ModalAtualizacaoTermos />
          -->

        <ion-router-outlet
          class="main-content"
          style="padding-top: 90px; padding-bottom: 90px; margin-top: 80px; margin-bottom: 30px; overflow-y: auto;"
        />

      </ion-content>

      <!-- MOBILE: footer embaixo -->
      <footerApp v-if="!isDesktop" />
    </div>

  </div>
</template>

<script lang="ts">
import {
  IonContent,
  IonRouterOutlet
} from '@ionic/vue';
import { defineComponent } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { mapState } from 'pinia';
import headerApp from '@/components/headerApp.vue';
import footerApp from '@/components/footerApp.vue';
//import ModalAtualizacaoTermos from '@/components/modalAtualizacaoTermos.vue';

export default defineComponent({
  name: 'PlataformLayout',
  components: {
    IonContent,
    IonRouterOutlet,
    headerApp,
    footerApp,
    //ModalAtualizacaoTermos
  },
  data() {
    return {
      abaAtiva: 'Dashboard',
      isDesktop: false,
      mediaQuery: null as MediaQueryList | null,
      variavelExpandir: true,
    };
  },
  computed: {
    ...mapState(useAuthStore, ['user', 'menuPermitido']),

    primeiroNome() {
      return this.user?.nome?.split(' ')[0] || 'Usuário';
    }
  },
  methods: {
    navegar(routeName: string) {
      this.abaAtiva = routeName;
      this.$router.push({ name: routeName });
    },
    onMediaChange(e: MediaQueryListEvent) {
      this.isDesktop = e.matches;
    },
    funcaoExpandir(){
      if(this.variavelExpandir) this.variavelExpandir = false
      else this.variavelExpandir = true
    }
  },
  mounted() {
    this.abaAtiva = (this.$route.name as string) || 'Dashboard';

    this.mediaQuery = window.matchMedia('(min-width: 992px)');
    this.isDesktop = this.mediaQuery.matches;
    this.mediaQuery.addEventListener('change', this.onMediaChange);
  },
  beforeUnmount() {
    this.mediaQuery?.removeEventListener('change', this.onMediaChange);
  },
  watch: {
    '$route.name'(newVal) {
      if (newVal) this.abaAtiva = newVal as string;
    }
  }
});
</script>

<style scoped>
/* Reset e Base */
.modern-app {
  --ion-background-color: #ffffff;
}

/* ── MOBILE: empilhado (padrão) ── */
.modern-app {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.main-column {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

ion-content {
  flex: 1;
}

/* ── DESKTOP: sidebar lateral ── */
@media (min-width: 992px) {
  .modern-app.desktop-layout {
    flex-direction: row;
  }

  .sidebar {
    display: flex;
    flex-direction: column;
    height: 100%;
    flex-shrink: 0;
    background: #ffffff;
    z-index: 100;
  }

  .main-column {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }
}

/* Header Espaçamento */
.main-content {
  background: #FFFFFF;
  --ion-background-color: #ffffff;
  height: calc(100vh - 90px);
}

@media(max-width: 992px){
  .main-content {
    background: #FFFFFF;
    --ion-background-color: #ffffff;
    height: calc(100vh - 170px);
  }
}

/* Estilização do Refresher para não sobrepor o Header */
ion-refresher {
  z-index: 10;
}

/* Material Symbols - Otimização de nitidez */
.material-symbols-outlined {
  font-variation-settings: 'wght' 200, 'opsz' 24;
  font-size: 28px;
  -webkit-font-smoothing: antialiased;
  display: block;
}

.tab-btn {
  background: none;
  border: none;
  color: #64748b;
  padding: 10px;
  transition: all 0.2s ease;
}

.tab-btn.active {
  color: #ff7f50;
}

.tab-btn.active .material-symbols-outlined {
  font-variation-settings: 'wght' 400, 'opsz' 24;
}

/* Avatar na Tab Bar */
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
</style>