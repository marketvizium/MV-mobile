<template>
  <ion-page class="console-page">

    <RefresherIonic />

    <ion-header class="ion-no-border">
      <div class="cc-header">
        <div class="cc-header-left">
          <button class="back-btn" @click="$router.back()">
            <span class="material-symbols-outlined">arrow_back_ios_new</span>
          </button>
          <div class="cotacao-identity">
            <span class="cotacao-label">GESTÃO</span>
            <span class="cotacao-name">Consultar vendedores</span>
          </div>
        </div>
      </div>
    </ion-header>

    <ion-content :fullscreen="true" class="console-content">
      <div class="form-container">
        <div class="title-section">
          <h2 class="poppins-semibold">Vendedores <span class="highlight">Associados</span> à Loja</h2>
          <p class="poppins-regular muted">Conheça os vendedores associados à sua loja.</p>
        </div>

        <!-- ══ TABELA DE VENDEDORES ══ -->
        <div class="tabela-container margin-top-20">
          <Tabela23 />
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import {
  IonPage,
  IonHeader,
  IonContent
} from '@ionic/vue'
import Tabela23 from '@/components/Tabela23.vue'
import RefresherIonic from '@/components/refresherIonic.vue'

export default defineComponent({
  name: 'ConsultarMeusVendedores',

  components: {
    IonPage,
    IonHeader,
    IonContent,
    Tabela23,
    RefresherIonic
  },

  data() {
    return {}
  },

  watch: {},

  methods: {},

  mounted() {}
})
</script>

<style scoped>

/* === CONTAINER & ESTRUTURA BASE === */
.console-page {
  --background: #FFF !important;
  background-color: #FFF !important;
  height: 100%;
}

.console-content {
  --background: #FFF !important;
  background-color: #FFF !important;
  color: #000;
  height: 100%;
}

.form-container {
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  background-color: #FFF;
  box-sizing: border-box;
  width: 100%;
  margin: 0 auto;
}

.title-section {
  margin-bottom: 8px;
}

.title-section h2 {
  font-size: 22px;
  margin: 0 0 6px 0;
  color: #000 !important;
}

.title-section h2 .highlight {
  color: #FF8049;
}

.title-section p.muted {
  font-size: 14px;
  margin: 0;
  color: #525151 !important;
}

/* === TABELA === */
.tabela-container {
  width: 100%;
}

/* === UTILS === */
.margin-top-20 { margin-top: 20px; }
.margin-top-30 { margin-top: 30px; }

/* === REGRAS ESTILIZADAS DO HEADER MOBILE === */
.cc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background-color: #FFF !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.cc-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.back-btn {
  background: none;
  border: none;
  color: #FF8049 !important;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
}
.back-btn span {
  font-size: 20px;
}
.cotacao-identity {
  display: flex;
  flex-direction: column;
}
.cotacao-label {
  font-size: 10px;
  color: #FF8049 !important;
  letter-spacing: 1px;
}
.cotacao-name {
  font-size: 16px;
  color: #000 !important;
}

/* === RESPONSIVIDADE === */

/* Telas bem estreitas (celulares pequenos) */
@media (max-width: 420px) {
  .form-container {
    padding: 20px 14px;
  }

  .title-section h2 {
    font-size: 19px;
  }
}

/* Telas largas (tablets deitados / desktop): limita a largura e centraliza,
   além de dar mais respiro ao conteúdo */
@media (min-width: 900px) {
  .form-container {
    padding: 32px 24px;
  }
}
</style>