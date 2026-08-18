<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="welcome-wrapper">

        <div class="content-inner">
          <div class="image-container">
            <img src="../assets/Data_extraction.gif" class="foto-desktop" alt="Bem-vindo">
          </div>

          <div class="poppins-semibold title">
            Bem-Vindo à <span class="highlight">Market Vizium</span>
          </div>

          <swiper
            :modules="modules"
            :pagination="{ clickable: true }"
            class="mySwiper"
          >
            <swiper-slide v-for="(item, index) in slides" :key="index">
              <div class="poppins-regular subtitle">
                {{ item.description }}
              </div>
            </swiper-slide>
          </swiper>

          <div class="actions-container">
            <ion-button expand="block" class="login-button" @click="irPara('/login')">
              Login
            </ion-button>

            <div class="divider">
              <span class="line"></span>
              <span class="text">OU</span>
              <span class="line"></span>
            </div>

            <ion-button fill="clear" class="create-account-button" @click="irPara('/cadastro')">
              Criar conta de vendedor
            </ion-button>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonButton, IonPage, IonContent } from '@ionic/vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Pagination } from 'swiper/modules';

// Estilos do Swiper
import 'swiper/css';
import 'swiper/css/pagination';

export default defineComponent({
  name: 'BemVindo',
  components: {
    IonButton,
    IonPage,
    IonContent,
    Swiper,
    SwiperSlide
  },
  data() {
    return {
      modules: [Pagination],
      slides: [
        {
          description: 'Solicite, acompanhe e organize suas cotações de forma prática diretamente pelo celular.'
        },
        {
          description: 'Tenha mais agilidade no atendimento e controle total dos pedidos em um só lugar.'
        }
      ]
    };
  },
  methods: {
    irPara(rota: string) {
      this.$router.push(rota);
    }
  }
});
</script>

<style scoped>
/* ===========================
   BASE (mobile-first)
   =========================== */
* {
  box-sizing: border-box;
}

.welcome-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-height: 100%;
  width: 100%;
  background: #fff;
  overflow-x: hidden;
}

.content-inner {
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
}

.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: clamp(16px, 6vh, 40px);
  padding: 0 10px;
}

.foto-desktop {
  width: clamp(160px, 55vw, 300px);
  max-width: 100%;
  height: auto;
}

.title {
  font-size: clamp(20px, 6vw, 30px);
  text-align: center;
  margin-top: clamp(16px, 4vh, 30px);
  margin-bottom: 0;
  padding-left: 8px;
  padding-right: 8px;
  line-height: 1.3;
  word-wrap: break-word;
}

.highlight {
  color: #ff8049;
}

.mySwiper {
  width: 100%;
  margin-top: 0;
  padding-bottom: 10px;
}

.subtitle {
  color: #777;
  font-size: clamp(0.85rem, 3.2vw, 1.1rem);
  line-height: 1.5;
  margin-bottom: clamp(20px, 5vh, 35px);
  text-align: center;
  padding: 0 clamp(10px, 4vw, 15px);
}

:deep(.swiper-pagination-bullet-active) {
  background: #FF8552;
  width: 12px;
  border-radius: 4px;
}

.actions-container {
  padding: clamp(12px, 4vw, 20px);
  margin-bottom: clamp(10px, 3vh, 20px);
  width: 100%;
}

.login-button {
  --background: #FF8552;
  --border-radius: 25px;
  height: clamp(46px, 12vw, 55px);
  font-weight: 600;
  font-size: clamp(0.85rem, 3vw, 1rem);
  text-transform: none;
  color: #FFF;
}

.divider {
  display: flex;
  align-items: center;
  margin: clamp(12px, 4vh, 20px) 0;
}

.divider .line {
  height: 1px;
  background: #ddd;
  flex: 1;
}

.divider .text {
  margin: 0 10px;
  color: #999;
  font-size: clamp(0.75rem, 2.8vw, 0.9rem);
  white-space: nowrap;
}

.create-account-button {
  --color: #FF8552;
  text-transform: none;
  width: 100%;
  font-size: clamp(0.8rem, 3vw, 0.95rem);
  white-space: normal;
}

/* ===========================
   TELAS MUITO PEQUENAS (320px)
   =========================== */
@media (max-width: 360px) {
  .image-container {
    margin-top: 12px;
  }

  .foto-desktop {
    width: 140px;
  }

  .title {
    font-size: 18px;
    margin-top: 12px;
    padding-left: 4px;
    padding-right: 4px;
  }

  .subtitle {
    font-size: 0.8rem;
    margin-bottom: 16px;
    padding: 0 8px;
  }

  .actions-container {
    padding: 10px;
    margin-bottom: 8px;
  }

  .login-button {
    height: 44px;
    font-size: 0.8rem;
  }

  .divider {
    margin: 10px 0;
  }

  .create-account-button {
    font-size: 0.78rem;
  }
}

/* ===========================
   TELAS BAIXAS (altura curta)
   =========================== */
@media (max-height: 650px) {
  .image-container {
    margin-top: 8px;
  }

  .foto-desktop {
    width: 120px;
  }

  .title {
    font-size: clamp(16px, 5vw, 22px);
    margin-top: 8px;
  }

  .subtitle {
    margin-bottom: 12px;
  }

  .actions-container {
    padding: 8px;
    margin-bottom: 6px;
  }

  .divider {
    margin: 8px 0;
  }
}

/* ===========================
   TELAS MAIORES (tablets)
   =========================== */
@media (min-width: 600px) {
  .content-inner {
    max-width: 480px;
  }
}
</style>