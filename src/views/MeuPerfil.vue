<template>
  <ion-page class="profile-page">
    <ion-content :fullscreen="true" class="ion-padding">
      
      <RefresherIonic />

      <div class="profile-header" v-if="usuarioLocal">
        <div class="avatar-section">
          <Avatar 
            v-if="usuarioLocal.foto_perfil"
            :image="usuarioLocal.foto_perfil" 
            shape="circle" 
            size="xlarge"
            class="profile-avatar"
          />
          <img v-else src="../assets/personagem.png" class="profile-avatar" style="border-radius: 100px;" alt="">
          <div class="verified-badge-abs" v-if="usuarioLocal.verificado">
            <span class="material-symbols-outlined">verified</span>
          </div>
        </div>

        <h2 class="poppins-semibold user-name">{{ usuarioLocal.nome }}</h2>
        <p class="poppins-regular user-role">@{{ usuarioLocal.nome_usuario }} • ID #{{ usuarioLocal.id_vendedor }}</p>
        
        <Button
          label="Editar Perfil" 
          icon="pi pi-user-edit" 
          class="edit-profile-btn poppins-medium mt-3" 
          @click="navigateToEdit"
        />
      </div>

      <div class="stats-grid mt-4" v-if="usuarioLocal">
        <div class="stat-card">
          <span class="stat-value poppins-semibold">{{ usuarioLocal.num_cotacoes || 0 }}</span>
          <span class="stat-label poppins-medium">Cotações</span>
        </div>
        <div class="stat-card">
          <span class="stat-value poppins-semibold">{{ usuarioLocal.taxa_resposta || 0 }}</span>
          <span class="stat-label poppins-medium">Resposta</span>
        </div>
        <div class="stat-card">
          <span class="stat-value poppins-semibold">{{ usuarioLocal.num_vendas || 0 }}</span>
          <span class="stat-label poppins-medium">Vendas</span>
        </div>
      </div>

      <div class="settings-container mt-4" v-if="usuarioLocal">
        
        <h3 class="section-title poppins-semibold">Sobre Profissional</h3>
        <div class="settings-group">
          <div class="setting-item vertical">
            <label class="poppins-medium">Especialidades</label>
            <span class="poppins-regular info-text-display">{{ usuarioLocal.especialidades || 'Não informado' }}</span>
          </div>
          <div class="setting-item vertical">
            <label class="poppins-medium">Bio</label>
            <span class="poppins-regular info-text-display">{{ usuarioLocal.desc_perfil || 'Sem descrição profissional disponível.' }}</span>
          </div>
        </div>

        <h3 class="section-title poppins-semibold mt-4">Dados de Contato</h3>
        <div class="settings-group">
          <div class="setting-item">
            <div class="setting-icon"><span class="material-symbols-outlined">mail</span></div>
            <div class="setting-content">
              <label class="poppins-medium">E-mail</label>
              <span class="poppins-regular info-text-display">{{ usuarioLocal.email }}</span>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-icon"><span class="material-symbols-outlined">smartphone</span></div>
            <div class="setting-content">
              <label class="poppins-medium">Celular</label>
              <span class="poppins-regular info-text-display">{{ usuarioLocal.celular }}</span>
            </div>
          </div>
        </div>

        <h3 class="section-title poppins-semibold mt-4">Documentação e Localização</h3>
        <div class="settings-group">
          <div class="setting-item">
            <div class="setting-icon"><span class="material-symbols-outlined">badge</span></div>
            <div class="setting-content">
              <label class="poppins-medium">CPF/CNPJ</label>
              <span class="poppins-regular info-text-display">{{ usuarioLocal.cpf_cnpj }}</span>
            </div>
          </div>
          <div class="setting-item">
            <div class="setting-icon"><span class="material-symbols-outlined">location_on</span></div>
            <div class="setting-content">
              <label class="poppins-medium">Localidade</label>
              <span class="poppins-regular info-text-display">{{ usuarioLocal.cidade }} - {{ usuarioLocal.estado }}</span>
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
import RefresherIonic from '../components/refresherIonic.vue';
import pkg from '../../package.json';

export default defineComponent({
  name: 'ProfilePage',
  components: { IonPage, IonContent, Avatar, Button, RefresherIonic },
  data() {
    return {
      // Variável local que armazena os dados do usuário.
      // O template NUNCA acessa "usuario" da store diretamente,
      // evitando erro quando a store resetar para null (logout).
      version: pkg.version,
      usuarioLocal: null as any,
    };
  },
  computed: {
    ...mapState(useAuthStore, ['usuario']),
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
      // Redireciona para a rota de edição de perfil
      this.$router.push({ name: 'EditarPerfil' });
    },
    handleLogout() {
      const authStore = useAuthStore();
      authStore.logout();
    }
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

.verified-badge-abs {
  position: absolute;
  bottom: 5px;
  right: 5px;
  background: white;
  border-radius: 50%;
  display: flex;
  color: #3b82f6;
}
.verified-badge-abs span { font-size: 22px; }

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

/* Botão Editar */
.edit-profile-btn {
  background: #FF8049 !important;
  border: none;
  border-radius: 12px;
  color: #FFF !important;
  padding: 8px 24px;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(255, 128, 73, 0.25);
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
  font-size: 18px;
  color: #1a1a1a;
}

.stat-label {
  font-size: 10px;
  color: #bbb;
  text-transform: uppercase;
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
}
.setting-icon span { font-size: 20px; }

.setting-content {
  display: flex;
  flex-direction: column;
}

.setting-content label, .setting-item.vertical label {
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