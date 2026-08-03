<template>
  <ion-page class="stores-browser-page">
    <ion-content :fullscreen="true" class="ion-padding">
      
      <div class="search-section">
        <h2 class="poppins-bold page-title">Minhas Lojas</h2>
        <p class="page-subtitle poppins-regular">Selecione uma loja para gerenciar cotações</p>
        
        <div class="search-bar-container mt-3" style="margin-top: 15px;">
          <span class="search-wrapper">
            <span class="material-symbols-outlined search-icon">storefront</span>
            <InputText 
              v-model="searchQuery" 
              placeholder="Buscar por nome ou cidade..." 
              class="w-full custom-search-input poppins-regular"
            />
          </span>
        </div>
      </div>

      <div v-if="loading" class="stores-grid mt-3">
        <div v-for="i in 4" :key="i" class="skeleton-card mb-3">
          <Skeleton width="100%" height="110px" borderRadius="16px"></Skeleton>
        </div>
      </div>

      <div v-else-if="error" class="error-state">
        <span class="material-symbols-outlined error-icon">cloud_off</span>
        <h3 class="poppins-semibold">Erro de conexão</h3>
        <p class="poppins-regular">Não foi possível carregar suas lojas associadas.</p>
        <Button label="Tentar Novamente" class="p-button-rounded mt-3 retry-btn" @click="fetchStores" />
      </div>

      <div v-else class="stores-list-container mt-3">
        <div v-if="filteredStores.length > 0">
          <div 
            v-for="store in filteredStores" 
            :key="store.id_loja" 
            class="store-card-modern"
          >
            <div class="card-inner-content" >
              <div class="store-main-info" @click="verDetalhes(store)">
                <div class="store-avatar">
                  {{ store.nome_fantasia.charAt(0).toUpperCase() }}
                </div>
                <div class="store-text">
                  <h3 class="store-name poppins-semibold">{{ store.nome_fantasia }}</h3>
                  <div class="store-location">
                    <span class="material-symbols-outlined tiny-icon">location_on</span>
                    {{ store.cidade }} - {{ store.estado }}
                  </div>
                </div>
              </div>

              <div class="store-contact-row" @click="verDetalhes(store)">
                <div class="contact-item">
                  <span class="material-symbols-outlined tiny-icon">call</span>
                  {{ formatPhone(store.celular) }}
                </div>
                <div class="contact-item">
                  <span class="material-symbols-outlined tiny-icon">mail</span>
                  {{ store.email_empresa }}
                </div>
              </div>
              
              <div class="card-footer" @click="selectStore(store)">
                <span class="action-text poppins-medium">Ver Cotações</span>
                <span class="material-symbols-outlined arrow-icon">chevron_right</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <div class="empty-icon-wrapper">
            <span class="material-symbols-outlined">store_hide</span>
          </div>
          <h3 class="poppins-semibold">Nenhuma loja encontrada</h3>
          <p class="poppins-regular">Não encontramos resultados para sua busca.</p>
          <Button 
            v-if="searchQuery" 
            label="Limpar Busca" 
            class="p-button-text mt-2" 
            @click="searchQuery = ''" 
          />
        </div>
      </div>

      <div class="bottom-spacer"></div>

    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonPage, IonContent } from '@ionic/vue';
import { api } from '@/services/api';

import InputText from 'primevue/inputtext';
import Skeleton from 'primevue/skeleton';
import Button from 'primevue/button';

export default defineComponent({
  name: 'StoresBrowserPage',
  components: { 
    IonPage, 
    IonContent, 
    InputText, 
    Skeleton, 
    Button
  },
  data() {
    return {
      loading: true,
      error: false,
      searchQuery: '',
      stores: [] as any[],
    };
  },
  computed: {
    filteredStores() {
      if (!this.searchQuery.trim()) return this.stores;
      const query = this.searchQuery.toLowerCase();
      return this.stores.filter(s => 
        s.nome_fantasia.toLowerCase().includes(query) || 
        s.cidade.toLowerCase().includes(query)
      );
    }
  },
  methods: {
    async fetchStores() {
      this.loading = true;
      this.error = false;
      try {
        // Exemplo usando o ID do vendedor (vindo do seu store de auth ou params)
        const response = await api.get(`/mvpu/usuario/VendedorAssociadas/`);
        this.stores = response.data.data || [];
      } catch (err) {
        
        this.error = true;
      } finally {
        setTimeout(() => { this.loading = false; }, 600);
      }
    },
    formatPhone(phone: string) {
      if (!phone) return '';
      return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    },
    selectStore(store: any) {
      // Navega para a página de cotações passando o ID da loja
      this.$router.push({
        name: 'CotacaoEspecifica', // Nome da sua rota de listagem de cotações
        query: { id_loja: store.id_loja } // ou params dependendo da sua rota
      });
    },

    verDetalhes(loja: any) {

      this.$router.push({ 
        name: 'LojaPerfil', 
        query: { id_loja: loja.id_loja } 
      });

      
    }
  },
  mounted() {
    this.fetchStores();
  }
});
</script>

<style scoped>
.stores-browser-page {
  --background: #f8fafc;
}

.search-section {
  background: white;
  margin: -16px -16px 0 -16px;
  padding: 24px 16px 20px 16px;
  border-bottom: 1px solid #f1f5f9;
}

.page-title {
  font-size: 24px;
  color: #0f172a;
  margin: 0;
}

.page-subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 4px 0 0 0;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #94a3b8;
  font-size: 20px;
}

.custom-search-input {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 12px 12px 12px 42px;
  background: #f8fafc;
  font-size: 14px;
  transition: all 0.2s ease;
}

.custom-search-input:focus {
  border-color: #3b82f6;
  background: white;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.05);
}

/* Cards de Loja */
.store-card-modern {
  background: white;
  border-radius: 16px;
  margin-bottom: 16px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  transition: transform 0.2s ease, background 0.2s ease;
}

.store-card-modern:active {
  transform: scale(0.98);
  background: #f8fafc;
}

.card-inner-content {
  padding: 16px;
}

.store-main-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.store-avatar {
  width: 48px;
  height: 48px;
  background: #eff6ff;
  color: #3b82f6;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 20px;
}

.store-name {
  font-size: 16px;
  color: #1e293b;
  margin: 0;
}

.store-location {
  font-size: 12px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 4px;
}

.store-contact-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 0;
  border-top: 1px dashed #e2e8f0;
  border-bottom: 1px dashed #e2e8f0;
}

.contact-item {
  font-size: 13px;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tiny-icon {
  font-size: 16px;
  color: #94a3b8;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.action-text {
  font-size: 13px;
  color: #3b82f6;
}

.arrow-icon {
  color: #3b82f6;
  font-size: 20px;
}

/* Estados de Interface */
.empty-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 30px;
  text-align: center;
}

.empty-icon-wrapper {
  width: 64px; height: 64px; background: #f1f5f9;
  border-radius: 20px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;
}

.empty-icon-wrapper span { font-size: 32px; color: #94a3b8; }
.error-icon { font-size: 48px; color: #ef4444; margin-bottom: 12px; }
.retry-btn { background: #3b82f6; border: none; font-size: 14px; }
.bottom-spacer { height: 80px; }
</style>