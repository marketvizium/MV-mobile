<template>
  <ion-page class="store-profile-page">
    <ion-content :fullscreen="true" class="ion-padding">

      <RefresherIonic />

      <div class="back-button-container" @click="$router.back()" style="display: flex; align-items: center; margin: 10px; cursor: pointer;">
        <span class="material-symbols-outlined">arrow_back_ios</span>
        <span class="poppins-medium">Voltar</span>
      </div>

      <div class="profile-header">
        <div class="avatar-section">
          <Avatar 
            :image="loja?.foto || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'" 
            shape="circle" 
            size="xlarge"
            class="store-avatar"
          />
          <div class="verified-badge-abs">
            <span class="material-symbols-outlined">verified</span>
          </div>
        </div>

        <h2 class="poppins-semibold store-name">
          {{ loja?.nome_fantasia || 'Carregando...' }}
        </h2>

        <p class="poppins-regular store-subtitle">
          {{ loja?.razao_social }} {{ loja?.data_criacao ? '• Desde ' + formatarData(loja?.data_criacao) : '' }}
        </p>

        <!--
        
        <div class="actions-row mt-3">
          <Button 
            icon="pi pi-share-alt" 
            class="p-button-rounded p-button-outlined share-btn" 
          />
          
          <Button 
            v-if="statusParceria === 'aceita'"
            icon="pi pi-user-minus" 
            class="p-button-rounded p-button-danger partnership-btn" 
            v-tooltip.bottom="'Cancelar Parceria'"
            @click="cancelarSolicitacao"
          />
          <Button 
            v-else-if="statusParceria === 'pendente'"
            icon="pi pi-clock" 
            class="p-button-rounded p-button-warning partnership-btn" 
            v-tooltip.bottom="'Aguardando Aprovação'"
            @click="cancelarSolicitacao"
          />
          <Button 
            v-else
            icon="pi pi-user-plus" 
            class="p-button-rounded p-button-outlined partnership-btn primary-color" 
            v-tooltip.bottom="'Solicitar Parceria'"
            @click="enviarSolicitacao"
          />
        </div>
        -->
      </div>

      <div class="stats-grid mt-4">
        <div class="stat-card">
          <span class="stat-value poppins-semibold">Recomendado</span>
          <span class="stat-label poppins-medium">Relevância</span>
        </div>
        <div class="stat-card">
          <span class="stat-value poppins-semibold">{{ loja?.nmr_cotacoes ?? 0 }}</span>
          <span class="stat-label poppins-medium">N° Cotações</span>
        </div>
        <div class="stat-card">
          <span class="stat-value poppins-semibold">{{ loja?.nmr_vendedores ?? 0 }}</span>
          <span class="stat-label poppins-medium">N° Vendedores</span>
        </div>
      </div>

      <div class="settings-container mt-4">
        <h3 class="section-title poppins-semibold">Informações da Empresa</h3>
        <div class="settings-group">
          <div class="setting-item">
            <div class="setting-icon"><span class="material-symbols-outlined">badge</span></div>
            <div class="setting-content">
              <label class="poppins-medium">CNPJ</label>
              <span class="poppins-regular info-text-display">{{ loja?.cnpj }}</span>
            </div>
          </div>
          <div class="setting-item">
            <div class="setting-icon"><span class="material-symbols-outlined">location_on</span></div>
            <div class="setting-content">
              <label class="poppins-medium">Localização</label>
              <span class="poppins-regular info-text-display">{{ loja?.cidade }} - {{ loja?.estado }}</span>
            </div>
          </div>
        </div>

        <h3 class="section-title poppins-semibold mt-4">Contato Comercial</h3>
        <div class="settings-group">
          <div class="setting-item">
            <div class="setting-icon"><span class="material-symbols-outlined">mail</span></div>
            <div class="setting-content">
              <label class="poppins-medium">E-mail Corporativo</label>
              <span class="poppins-regular info-text-display">{{ loja?.email_empresa }}</span>
            </div>
          </div>
          <div class="setting-item">
            <div class="setting-icon"><span class="material-symbols-outlined">smartphone</span></div>
            <div class="setting-content">
              <label class="poppins-medium">Celular / WhatsApp</label>
              <span class="poppins-regular info-text-display">{{ loja?.celular }}</span>
            </div>
          </div>
        </div>

        <h3 class="section-title poppins-semibold mt-4">Responsável Legal</h3>
        <div class="settings-group">
          <div class="setting-item">
            <div class="setting-icon blue"><span class="material-symbols-outlined">person</span></div>
            <div class="setting-content">
              <label class="poppins-medium">Nome do Dono</label>
              <span class="poppins-regular info-text-display">{{ loja?.nome }}</span>
            </div>
          </div>
        </div>

        <div class="footer-info mt-5">
          <p class="app-version">Loja verificada pelo Market Vizium</p>
        </div>
      </div>

      <div class="bottom-spacer"></div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { IonPage, IonContent } from '@ionic/vue';
import Avatar from 'primevue/avatar';
import Button from 'primevue/button';
import { api } from '@/services/api';
import RefresherIonic from '@/components/refresherIonic.vue';

export default {
  name: 'StoreProfilePage',
  components: { IonPage, IonContent, Avatar, Button, RefresherIonic },
  data() {
    return {
      loja: {} as any,
      statusParceria: null as string | null // 'pendente', 'aceita' ou null
    };
  },
  methods: {
    async carregarDadosLoja() {

      
      const idLoja = this.$route.query.id_loja;
      if (!idLoja) return;
      

      try {
        const { data } = await api.post('/mvpu/loja/DadosDonoLoja/', { id_loja: idLoja });
        const dados = data.data?.[0] || {};
        
        dados.nmr_cotacoes = dados.nmr_cotacoes ?? 0;
        dados.nmr_vendedores = dados.nmr_vendedores ?? 0;
        
        this.loja = dados;
        this.verificarStatusParceria(idLoja);
      } catch (error) {
        
      }
    },

    async verificarStatusParceria(idLoja: any) {
      try {
        const { data } = await api.get('/mvpu/usuario/getStatusSolicitacao/');
        // Procura se a loja atual está na lista de solicitações do usuário
        const solicitacao = data.data?.find((s: any) => s.id_loja == idLoja);
        
        if (solicitacao) {
          this.statusParceria = solicitacao.solicitacao_vendedor; // 'pendente' ou 'aceita'
        } else {
          this.statusParceria = null;
        }
      } catch (error) {
        
      }
    },

    async enviarSolicitacao() {
      try {
        await api.post('/mvpu/usuario/enviarAceitarSoliVende/', { id_loja: this.loja.id_loja || this.$route.query.id_loja });
        this.statusParceria = 'pendente';
      } catch (error) {
        
      }
    },

    async cancelarSolicitacao() {
      try {
        await api.post('/mvpu/usuario/cancelAceitarSoliVende/', { id_loja: this.loja.id_loja || this.$route.query.id_loja });
        this.statusParceria = null;
      } catch (error) {
        
      }
    },

    formatarData(dataStr: string) {
      if (!dataStr || dataStr === "...") return '';
      const data = new Date(dataStr);
      return data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    }
  },
  watch: {
    '$route.query.id_loja': {
      immediate: true,
      handler(val) {
        if (val) {
          this.loja = { nome_fantasia: "Carregando..." };
          this.statusParceria = null;
          this.carregarDadosLoja();
        }
      }
    }
  }
};
</script>

<style scoped>
.store-profile-page { --background: #fbfbfb; }
.profile-header { display: flex; flex-direction: column; align-items: center; padding: 30px 0 10px 0; }
.avatar-section { position: relative; margin-bottom: 15px; }
.store-avatar { border: 3px solid #FF8049; padding: 3px; background: white; width: 110px !important; height: 110px !important; }
.verified-badge-abs { position: absolute; bottom: 8px; right: 8px; background: white; border-radius: 50%; display: flex; color: #3b82f6; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
.verified-badge-abs span { font-size: 24px; }
.store-name { font-size: 24px; color: #1a1a1a; text-align: center; margin: 0; }
.store-subtitle { font-size: 13px; color: #888; margin-top: 4px; }
.actions-row { display: flex; gap: 10px; align-items: center; }

/* Botões */
.action-btn { background: #FF8049 !important; border: none; border-radius: 12px; padding: 10px 20px; font-size: 14px; }
.share-btn, .partnership-btn { width: 45px; height: 45px; }
.primary-color { color: #FF8049 !important; border-color: #FF8049 !important; }

/* Stats */
.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.stat-card { background: white; padding: 14px 8px; border-radius: 18px; display: flex; flex-direction: column; align-items: center; border: 1px solid #f2f2f2; }
.stat-value { font-size: 16px; color: #1a1a1a; }
.stat-label { font-size: 9px; color: #bbb; text-transform: uppercase; margin-top: 2px; }

/* Listas de Info */
.section-title { font-size: 11px; color: #FF8049; text-transform: uppercase; letter-spacing: 1px; margin: 25px 0 10px 4px; }
.settings-group { background: white; border-radius: 20px; overflow: hidden; border: 1px solid #f2f2f2; }
.setting-item { display: flex; align-items: center; padding: 16px; gap: 16px; border-bottom: 1px solid #f9f9f9; }
.setting-item:last-child { border-bottom: none; }
.setting-icon { width: 40px; height: 40px; border-radius: 12px; background: #fff7f4; color: #FF8049; display: flex; align-items: center; justify-content: center; }
.setting-icon.blue { background: #f0f6ff; color: #3b82f6; }
.setting-content { display: flex; flex-direction: column; }
.setting-content label { font-size: 10px; color: #bbb; text-transform: uppercase; font-weight: 700; }
.info-text-display { font-size: 14px; color: #333; margin-top: 2px; }

.footer-info { text-align: center; margin-bottom: 40px; }
.app-version { font-size: 11px; color: #B0B0B0; }
.bottom-spacer { height: 60px; }
</style>