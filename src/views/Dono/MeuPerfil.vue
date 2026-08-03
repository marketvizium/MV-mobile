<template>
  <ion-page class="profile-page">
    <ion-content :fullscreen="true" class="ion-padding">

      <RefresherIonic />

      <div class="profile-header" v-if="usuarioLocal">
        <div class="avatar-section">
          <Avatar
            v-if="usuarioLocal.foto"
            :image="usuarioLocal.foto || personagem"
            shape="circle"
            size="xlarge"
            class="profile-avatar"
          />
          <img v-else src="../../assets/personagem.png" class="profile-avatar" style="border-radius: 100px;" alt="" />
          <div class="nivel-badge-abs">
            <span class="poppins-semibold" v-if="usuarioLocal.nivel == 1">Admin</span>
            <span class="poppins-semibold" v-if="usuarioLocal.nivel == 6">Supervisor</span>
            <span class="poppins-semibold" v-if="usuarioLocal.nivel == 7">Colaborador</span>
          </div>
        </div>

        <h2 class="poppins-semibold user-name">{{ usuarioLocal.nome || 'Usuário' }}</h2>
        <p class="poppins-regular user-role">{{ usuarioLocal.email }}</p>

        <div class="btn-row mt-3">
          <Button
            label="Editar Perfil"
            icon="pi pi-user-edit"
            class="edit-profile-btn poppins-medium"
            @click="navigateToEdit"
          />
          <Button
            v-show="usuarioLocal.nivel == 1"
            label="Consultar Lojas"
            icon="pi pi-shop"
            class="lojas-btn poppins-medium"
            @click="navigateToLojas"
          />
        </div>
      </div>

      <div class="stats-grid mt-4" v-if="usuarioLocal">
        <div class="stat-card">
          <span class="stat-value poppins-semibold" v-if="usuarioLocal.nivel == 1">Admin</span>
          <span class="stat-value poppins-semibold" v-if="usuarioLocal.nivel == 6">Supervisor</span>
          <span class="stat-value poppins-semibold" v-if="usuarioLocal.nivel == 7">Colaborador</span>
          <span class="stat-label poppins-medium">Nível</span>
        </div>
        <div class="stat-card">
          <span class="stat-value poppins-semibold">{{ dataCriacaoFormatada }}</span>
          <span class="stat-label poppins-medium">Membro desde</span>
        </div>
        <div class="stat-card">
          <span class="stat-value poppins-semibold">Ativo</span>
          <span class="stat-label poppins-medium">Perfil</span>
        </div>
      </div>

      <div class="settings-container mt-4" v-if="usuarioLocal">

        <!-- Dados de Contato -->
        <h3 class="section-title poppins-semibold">Dados de Contato</h3>
        <div class="settings-group">
          <div class="setting-item">
            <div class="setting-icon"><span class="material-symbols-outlined">mail</span></div>
            <div class="setting-content">
              <label class="poppins-medium">E-mail</label>
              <span class="poppins-regular info-text-display">{{ usuarioLocal.email || 'Não informado' }}</span>
            </div>
          </div>
          <div class="setting-item">
            <div class="setting-icon"><span class="material-symbols-outlined">smartphone</span></div>
            <div class="setting-content">
              <label class="poppins-medium">Celular</label>
              <span class="poppins-regular info-text-display">{{ usuarioLocal.celular || 'Não informado' }}</span>
            </div>
          </div>
        </div>

        <!-- Documentação -->
        <h3 class="section-title poppins-semibold mt-4">Documentação</h3>
        <div class="settings-group">
          <div class="setting-item">
            <div class="setting-icon"><span class="material-symbols-outlined">badge</span></div>
            <div class="setting-content">
              <label class="poppins-medium">CPF</label>
              <span class="poppins-regular info-text-display">{{ usuarioLocal.cpf || 'Não informado' }}</span>
            </div>
          </div>
          <div class="setting-item">
            <div class="setting-icon"><span class="material-symbols-outlined">calendar_month</span></div>
            <div class="setting-content">
              <label class="poppins-medium">Data de Pagamento</label>
              <span class="poppins-regular info-text-display">{{ usuarioLocal.data_pagamento || 'Não informado' }}</span>
            </div>
          </div>
        </div>

        <!-- Endereço -->
        <h3 class="section-title poppins-semibold mt-4">Endereço</h3>
        <div class="settings-group">
          <div class="setting-item">
            <div class="setting-icon"><span class="material-symbols-outlined">signpost</span></div>
            <div class="setting-content">
              <label class="poppins-medium">Rua</label>
              <span class="poppins-regular info-text-display">{{ usuarioLocal.rua || 'Não informado' }}</span>
            </div>
          </div>
          <div class="setting-item">
            <div class="setting-icon"><span class="material-symbols-outlined">location_on</span></div>
            <div class="setting-content">
              <label class="poppins-medium">Cidade / Estado</label>
              <span class="poppins-regular info-text-display">
                {{ usuarioLocal.cidade || 'Não informado' }}
                <template v-if="usuarioLocal.estado"> - {{ usuarioLocal.estado }}</template>
              </span>
            </div>
          </div>
          <div class="setting-item">
            <div class="setting-icon"><span class="material-symbols-outlined">markunread_mailbox</span></div>
            <div class="setting-content">
              <label class="poppins-medium">CEP</label>
              <span class="poppins-regular info-text-display">{{ usuarioLocal.cep || 'Não informado' }}</span>
            </div>
          </div>
        </div>

        <div class="logout-section mt-5" style="margin-top: 20px; margin-bottom: 60px;">
          <Button
            label="Sair da Conta"
            icon="pi pi-sign-out"
            class="p-button-text p-button-danger w-full logout-btn poppins-semibold"
            @click="handleLogout"
          />
          <p class="app-version">Versão {{version}} • Market Vizium</p>
        </div>

      </div>

      <div class="bottom-spacer"></div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonPage, IonContent } from '@ionic/vue';
import Avatar from 'primevue/avatar';
import Button from 'primevue/button';
import { useAuthStore } from '@/stores/auth';
import { mapState } from 'pinia';
import personagem from '@/assets/personagem.png';
import RefresherIonic from '@/components/refresherIonic.vue';
import pkg from '../../../package.json';

export default defineComponent({
  name: 'MeuPerfil',
  components: { IonPage, IonContent, Avatar, Button, RefresherIonic },
  data() {
    return {
      // Variável local que armazena os dados do usuário.
      // O template NUNCA acessa "usuario" da store diretamente,
      // evitando erro quando a store resetar para null (logout).
      usuarioLocal: null as any,
      personagem,
      version: pkg.version,
    };
  },
  computed: {
    ...mapState(useAuthStore, ['usuario']),

    dataCriacaoFormatada() {
      if (!this.usuarioLocal?.data_criacao) return '-';
      const d = new Date(this.usuarioLocal.data_criacao);
      if (isNaN(d.getTime())) return '-';
      return d.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
    },

    dataPagamentoFormatada() {
      if (!this.usuarioLocal?.data_pagamento) return '-';
      const d = new Date(this.usuarioLocal.data_pagamento);
      if (isNaN(d.getTime())) return this.usuarioLocal.data_pagamento;
      return d.toLocaleDateString('pt-BR');
    },
  },
  watch: {
    // Sempre que o "usuario" da store mudar (login, logout, atualização),
    // sincroniza com a variável local de forma segura.
    usuario: {
      immediate: true,
      deep: true,
      handler(novoUsuario) {
        this.usuarioLocal = novoUsuario ? novoUsuario : null;
      }
    }
  },
  methods: {
    navigateToEdit() {
      this.$router.push({ name: 'EditarMeuPerfil' });
    },
    navigateToLojas() {
      this.$router.push({ name: 'consultarLojasDono' });
    },
    handleLogout() {
      const authStore = useAuthStore();
      authStore.logout();
    },
  },
  mounted() {
    // Reforço de sincronização inicial, cobrindo cenários de
    // hot reload / navegação rápida onde o watch immediate
    // ainda não tenha sido processado.
    this.usuarioLocal = this.usuario ?? null;
  },
});
</script>

<style scoped>
.profile-page {
  --background: #fbfbfb;
}

/* Header */
.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 0 10px 0;
}

.avatar-section {
  position: relative;
  margin-bottom: 15px;
}

.profile-avatar {
  border: 3px solid #FF8049;
  padding: 3px;
  background: white;
  width: 100px !important;
  height: 100px !important;
}

.nivel-badge-abs {
  position: absolute;
  bottom: -6px;
  right: -10px;
  background: #FF8049;
  border-radius: 30px;
  padding: 2px 8px;
  display: flex;
  align-items: center;
  color: white;
  font-size: 11px;
  box-shadow: 0 2px 8px rgba(255,128,73,0.35);
}

.user-name {
  font-size: 22px;
  color: #1a1a1a;
  text-align: center;
  margin: 0;
}

.user-role {
  font-size: 13px;
  color: #888;
  margin-top: 2px;
}

/* Botões lado a lado */
.btn-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

.edit-profile-btn {
  background: #FF8049 !important;
  border: none;
  border-radius: 12px;
  padding: 8px 20px;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(255, 128, 73, 0.25);
}

.lojas-btn {
  background: white !important;
  color: #FF8049 !important;
  border: 1.5px solid #FF8049 !important;
  border-radius: 12px;
  padding: 8px 20px;
  font-size: 14px;
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.stat-card {
  background: white;
  padding: 16px 8px;
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.02);
}

.stat-value {
  font-size: 15px;
  color: #1a1a1a;
  text-align: center;
}

.stat-label {
  font-size: 10px;
  color: #bbb;
  text-transform: uppercase;
  text-align: center;
  margin-top: 4px;
}

/* Seções */
.section-title {
  font-size: 11px;
  color: #FF8049;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 25px 0 10px 4px;
}

.settings-group {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid #f2f2f2;
}

.setting-item {
  display: flex;
  align-items: center;
  padding: 16px;
  gap: 16px;
  border-bottom: 1px solid #f9f9f9;
}

.setting-item.vertical {
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}

.setting-item:last-child { border-bottom: none; }

.setting-icon {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: #fff7f4;
  color: #FF8049;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.setting-icon span { font-size: 20px; }

.setting-content {
  display: flex;
  flex-direction: column;
}

.setting-content label,
.setting-item.vertical label {
  font-size: 10px;
  color: #bbb;
  text-transform: uppercase;
  font-weight: 700;
}

.info-text-display {
  font-size: 14px;
  color: #333;
  margin-top: 2px;
  word-break: break-word;
}

.logout-btn {
  color: #ff4d4d !important;
  border-radius: 16px;
  border: solid 1px #ff4d4d;
  width: 100%;
}

.app-version {
  text-align: center;
  font-size: 11px;
  color: #B0B0B0;
  margin-top: 15px;
  height: 50px;
}

.bottom-spacer { height: 60px; }
</style>