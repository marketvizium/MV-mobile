<template>
  <div class="ion-page"> 
    
    <transition name="fade">
      <div v-if="carregandoMarketVizium" class="loading-overlay">
        <img src="../assets/logo.png" alt="Logo" class="pulse-logo" style="width: 150px;" >
        <div class="loading-content">
          <p class="loading-text">Carregando <span>Marviz</span>...</p>
        </div>
      </div>
    </transition>

    <main v-show="!carregandoMarketVizium" class="main-content">
      <ion-router-outlet />
    </main>
  </div>
</template>

<script lang="ts">
import { IonRouterOutlet, IonPage, IonRefresher, IonRefresherContent, IonContent } from '@ionic/vue';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'NoPlataformLayout',
  // Importante: adicionei IonContent e IonRefresherContent nas dependências
  components: { 
    IonRouterOutlet, 
    IonPage, 
    IonRefresher, 
    IonRefresherContent, 
    IonContent 
  },
  data() {
    return {
      carregandoMarketVizium: true,
    };
  },
  mounted() {
    this.$router.beforeEach((to, from, next) => {
      this.carregandoMarketVizium = true;
      next();
    });

    this.$router.afterEach(() => {
      setTimeout(() => { this.carregandoMarketVizium = false; }, 1200);
    });

    setTimeout(() => { this.carregandoMarketVizium = false; }, 2000);
  },
  methods: {
    handleRefresh(event: any) {
      setTimeout(() => {
        event.target.complete();
      }, 1500);
    },
  },
});
</script>

<style scoped>
/* EFEITO DE PULSAÇÃO NA LOGO */
.pulse-logo {
  width: 180px; /* Ajuste o tamanho conforme sua logo */
  height: auto;
  animation: pulse 1.5s infinite ease-in-out;
}

@keyframes pulse {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.3; /* Fica transparente */
    transform: scale(1); /* Dá um leve efeito de encolher */
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.loading-overlay {
  position: fixed;
  inset: 0;
  background: #ffffff !important;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 99999 !important;
}

.loading-text {
  margin-top: 30px;
  font-family: 'Poppins', sans-serif;
  color: #1e293b;
  font-weight: 600;
  font-size: 0.9rem;
  letter-spacing: 0.5px;
}

.main-content {
  height: 100%;
}

/* Transição suave de entrada e saída do loading */
.fade-enter-active, .fade-leave-active { 
  transition: opacity 0.5s ease; 
}
.fade-enter-from, .fade-leave-to { 
  opacity: 0; 
}
</style>