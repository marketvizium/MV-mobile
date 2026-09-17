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
            <span class="cotacao-name">Colaboradores</span>
          </div>
        </div>
      </div>
    </ion-header>

    <ion-content :fullscreen="true" class="console-content">
      <div class="form-container">
        <div class="title-section">
          <h2 class="poppins-semibold">Gerenciar colaboradores</h2>
          <p class="poppins-regular muted">Cadastre novos colaboradores ou consulte os já existentes.</p>
        </div>

        <div class="cards-wrapper margin-top-20">
          <cardOps
            icon="person_add"
            iconColor="#5A0F83"
            title="Cadastrar colaborador"
            descricao="Registre um novo colaborador no sistema"
            route="CadastrarColaborador"
          />

          <cardOps
            icon="person_search"
            iconColor="#082E5D"
            title="Consultar colaboradores"
            descricao="Visualize e gerencie a lista de colaboradores."
            route="ConsultarColaborador"
          />
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
import cardOps from '@/components/cardOps.vue'
import RefresherIonic from '@/components/refresherIonic.vue'

export default defineComponent({
  name: 'GerenciarColaboradores',

  components: {
    IonPage,
    IonHeader,
    IonContent,
    cardOps,
    RefresherIonic
  }
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
}

.title-section {
  margin-bottom: 8px;
}

.title-section h2 {
  font-size: 22px;
  margin: 0 0 6px 0;
  color: #000 !important;
}

.title-section p.muted {
  font-size: 14px;
  margin: 0;
  color: #525151 !important;
}

/* === CARDS === */
.cards-wrapper {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 20px;
}

/* === UTILS === */
.margin-top-20 { margin-top: 20px; }

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
</style>