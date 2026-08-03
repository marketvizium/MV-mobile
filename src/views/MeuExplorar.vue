<template>
  <ion-page class="explore-page">
    <ion-content :fullscreen="true" class="ion-padding">
      
      <RefresherIonic />

      <div class="header-section">
        <h1 v-if="!isSearching" class="poppins-bold page-title animate-fadein">Explorar</h1>
        <p v-if="!isSearching" class="poppins-regular animate-fadein" style="color: #777;">
          Pesquise pelas lojas que você quer encontrar abaixo.
        </p>
        
        
        <div class="search-wrapper mt-3" style="margin-bottom: 15px; margin-top: 15px;">
          <div class="search-input-box">
            <i class="pi pi-search search-icon-inside" @click="handleSearch" style="cursor: pointer;" />
            <InputText 
              v-model="searchQuery" 
              placeholder="Buscar lojistas por nome ou cidade..." 
              class="search-input-field"
              @focus="isSearching = true"
              @input="onTyping" 
              @keyup.enter="handleSearch"
            />
          </div>
          <Button 
            v-if="isSearching" 
            icon="pi pi-times" 
            class="p-button-rounded p-button-text cancel-search-btn" 
            @click="cancelSearch" 
          />
        </div>
      </div>

      <div v-if="!showResults && !loading && !isSearching" class="explore-home animate-fadein">
        <div class="promo-banner mt-4">
          <div class="promo-content" style="background-color: #00000000; color: #FFF;">
            <span class="promo-tag">Destaque</span>
            <h3 class="poppins-bold">Novos Fornecedores na sua região!</h3>
            <p class="poppins-regular">Confira as lojas que entraram no Market Vizium esta semana.</p>
          </div>
          <img src="https://cdn-icons-png.flaticon.com/512/3081/3081559.png" class="promo-img" />
        </div>

        <Swiper
          class="widgets-slider mt-4"
          :slides-per-view="1.2"
          :space-between="12"
          :loop="true"
          :modules="swiperModules"
          :autoplay="{ delay: 4000, disableOnInteraction: false }"
        >
          <SwiperSlide v-for="(widget, index) in widgets" :key="index">
            <div class="widget-card">
              <div class="widget-icon" :class="widget.color">
                <i :class="widget.icon"></i>
              </div>

              <strong class="poppins-semibold widget-title">
                {{ widget.title }}
              </strong>

              <span class="poppins-regular widget-text">
                {{ widget.text }}
              </span>
            </div>
          </SwiperSlide>
        </Swiper>

        <!--
          <div class="widgets-grid mt-4">
            <div class="widget-card">
              <div class="widget-icon blue"><i class="pi pi-map-marker"></i></div>
              <span class="poppins-medium">Perto de você</span>
            </div>
            <div class="widget-card">
              <div class="widget-icon orange"><i class="pi pi-verified"></i></div>
              <span class="poppins-medium">Verificadas</span>
            </div>
            <div class="widget-card">
              <div class="widget-icon green"><i class="pi pi-percentage"></i></div>
              <span class="poppins-medium">Promoções</span>
            </div>
          </div>
        -->

        <div class="section-header mt-5">
          <h2 class="poppins-semibold">Principais Lojas </h2>
          <Button label="Explorar mais lojas" @click="explorarMais" class="p-button-text p-button-sm text-orange" />
        </div>

        <div class="stores-list mt-3">
          <div v-for="loja in lojasDestaque" :key="loja.id_loja" class="store-item-card" @click="verDetalhes(loja)">
            <div class="store-logo">{{ loja.nome_fantasia.charAt(0) }}</div>
            <div class="store-info">
              <h4 class="poppins-bold">{{ loja.nome_fantasia }}</h4>
              <p class="poppins-regular">{{ loja.cidade }}, {{ loja.estado }}</p>
              <div class="store-badges">
                <Tag value="Recomendado" severity="warning" class="mini-tag" />
                
              </div>
            </div>
            <i class="pi pi-chevron-right arrow-icon"></i>
          </div>
        </div>
      </div>

      <div v-if="isSearching && !showResults && !loading" class="search-placeholder mt-5 animate-fadein">
        <div class="empty-state">
          <span class="material-symbols-outlined large-icon">storefront</span>
          <h3 class="poppins-semibold">Pesquise por lojistas</h3>
          <p class="poppins-regular">Digite o nome da empresa, CNPJ ou localização para encontrar parceiros.</p>
        </div>
      </div>

      <div v-if="showResults && !loading" class="search-results mt-4 animate-fadein">
        <div v-if="resultados.length > 0">
          <p class="results-count poppins-medium">{{ resultados.length }} lojas encontradas</p>
          <div v-for="loja in resultados" :key="loja.id_loja" class="result-card mt-3">
            <div class="result-header">
              <h3 class="poppins-bold">{{ loja.nome_fantasia }}</h3>
              <Tag :value="loja.estado" class="state-tag" />
            </div>
            <div class="result-body">
              <p><i class="pi pi-map-marker"></i> {{ loja.rua }}, {{ loja.cidade }}</p>
              <p><i class="pi pi-phone"></i> {{ loja.celular }}</p>
              <p><i class="pi pi-envelope"></i> {{ loja.email_empresa }}</p>
            </div>
            <Button label="Ver perfil" class="w-full mt-3 custom-btn" @click="verDetalhes(loja)" icon="pi pi-external-link" />
          </div>
        </div>
        <div v-else class="empty-state mt-5">
          <i class="pi pi-search-minus" style="font-size: 3rem; color: #ccc;"></i>
          <h3 class="poppins-semibold mt-3">Nenhuma loja encontrada</h3>
        </div>
      </div>

      <div v-if="loading" class="mt-5 text-center">
        <ProgressSpinner style="width:50px; height:50px" strokeWidth="4" />
        <p class="poppins-medium mt-2">Buscando no Market Vizium...</p>
      </div>

      <div class="bottom-spacer"></div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonPage, IonContent } from '@ionic/vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/autoplay';

import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import ProgressSpinner from 'primevue/progressspinner';
import { api } from '@/services/api';
import RefresherIonic from '@/components/refresherIonic.vue';



export default defineComponent({
  name: 'ExplorePage',
  components: { 
    IonPage,
    IonContent,
    Swiper,
    SwiperSlide,
    InputText,
    Button,
    Tag,
    ProgressSpinner,
    RefresherIonic 
  },

  data() {
    return {
      widgets: [
        {
          title: 'Encontre compradores',
          text: 'Conecte sua loja a novos clientes todos os dias',
          icon: 'pi pi-users',
          color: 'blue'
        },
        {
          title: 'Receba cotações',
          text: 'Vendedores interessados enviam pedidos direto para você',
          icon: 'pi pi-inbox',
          color: 'orange'
        },
        {
          title: 'Venda mais rápido',
          text: 'Negocie preços e condições em tempo real',
          icon: 'pi pi-bolt',
          color: 'green'
        },
        {
          title: 'Gerencie pedidos',
          text: 'Centralize conversas, propostas e vendas',
          icon: 'pi pi-briefcase',
          color: 'blue'
        }
      ],
      swiperModules: [Autoplay],
      searchQuery: '',
      isSearching: false,
      showResults: false,
      loading: false,
      debounceTimer: null as any,
      lojasDestaque: [] as any[],
      resultados: [] as any[]
    };
  },

  mounted() {
    this.buscarLojasDestaque();
  },

  methods: {

    /* ===============================
       LOJAS EM DESTAQUE (GET)
    =============================== */
    async buscarLojasDestaque() {
      try {
        const response = await api.get('/mvpu/loja/getAleatoriaLojas/');
        this.lojasDestaque = response.data.data || [];
      } catch (error) {
        
      }
    },

    /* ===============================
       DISPARA A CADA TECLA (DEBOUNCE)
    =============================== */
    onTyping() {
      this.isSearching = true;

      if (!this.searchQuery.trim()) {
        this.showResults = false;
        this.loading = false;
        this.resultados = [];
        return;
      }

      this.loading = true;
      this.showResults = false;

      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.handleSearch();
      }, 500);
    },

    /* ===============================
       BUSCA REAL (POST)
    =============================== */
    async handleSearch() {
      if (!this.searchQuery.trim()) return;

      this.loading = true;
      this.showResults = false;

      try {
        const response = await api.post('/mvpu/loja/buscaVendeLoja/', {
          busca: this.searchQuery
        });

        this.resultados = response.data.data || [];
      } catch (error) {
        
        this.resultados = [];
      } finally {
        this.loading = false;
        this.showResults = true;
      }
    },

    /* ===============================
       CANCELAR BUSCA
    =============================== */
    cancelSearch() {
      this.searchQuery = '';
      this.isSearching = false;
      this.showResults = false;
      this.resultados = [];
      clearTimeout(this.debounceTimer);
    },

    explorarMais(){
      this.isSearching = true
    },

    verDetalhes(loja: any) {

      this.$router.push({ 
        name: 'LojaPerfil', 
        query: { id_loja: loja.id_loja } 
      });

      
    }
  }
});
</script>

<style scoped>
/* SEU CSS ORIGINAL MANTIDO 100% */
.explore-page { --background: #f8fafc; }
.page-title { font-size: 28px; color: #1e293b; margin-top: 20px; }
.search-wrapper { display: flex; align-items: center; gap: 8px; width: 100%; }
.search-input-box { position: relative; flex: 1; display: flex; align-items: center; }
.search-icon-inside { position: absolute; left: 14px; color: #94a3b8; z-index: 2; font-size: 1.1rem; }
.search-input-field { width: 100%; border-radius: 15px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); padding: 12px 12px 12px 42px !important; font-family: 'Poppins', sans-serif; transition: all 0.3s ease; background-color: #FFF; color: #777;}
.search-input-field:focus { border-color: #FF8049; box-shadow: 0 4px 12px rgba(255, 128, 73, 0.15); }
.cancel-search-btn { color: #64748b !important; flex-shrink: 0; }
.promo-banner { background: linear-gradient(135deg, #FF8049 0%, #ff9d73 100%); border-radius: 20px; padding: 20px; display: flex; align-items: center; color: white; position: relative; overflow: hidden; }
.promo-tag { background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 10px; font-size: 10px; text-transform: uppercase; font-weight: bold; }
.promo-content h3 { font-size: 18px; margin: 8px 0; }
.promo-content p { font-size: 12px; opacity: 0.9; max-width: 70%; }
.promo-img { width: 80px; position: absolute; right: 10px; bottom: 10px; opacity: 0.8; }
.widgets-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.widget-card { background: white; padding: 15px 10px; border-radius: 18px; display: flex; flex-direction: column; align-items: center; box-shadow: 0 2px 8px rgba(0,0,0,0.02); }
.widget-card span { font-size: 11px; margin-top: 8px; color: #64748b; }
.widget-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
.widget-icon.blue { background: #eff6ff; color: #3b82f6; }
.widget-icon.orange { background: #fff7ed; color: #FF8049; }
.widget-icon.green { background: #f0fdf4; color: #22c55e; }
.section-header { display: flex; justify-content: space-between; align-items: center; }
.section-header h2 { font-size: 18px; color: #1e293b; }
.text-orange { color: #FF8049 !important; font-weight: bold; }
.store-item-card { background: white; padding: 15px; border-radius: 18px; display: flex; align-items: center; gap: 15px; margin-bottom: 12px; transition: transform 0.2s; }
.store-item-card:active { transform: scale(0.98); }
.store-logo { width: 50px; height: 50px; background: #f1f5f9; border-radius: 15px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; color: #FF8049; }
.store-info { flex: 1; }
.store-info h4 { font-size: 15px; color: #1e293b; margin: 0; }
.store-info p { font-size: 12px; color: #64748b; margin: 2px 0; }
.store-badges { display: flex; align-items: center; gap: 8px; }
.mini-tag { font-size: 9px !important; padding: 2px 6px !important; }
.rating { font-size: 11px; color: #f59e0b; font-weight: bold; }
.arrow-icon { color: #cbd5e1; font-size: 12px; }
.result-card { background: white; padding: 20px; border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); }
.result-header { display: flex; justify-content: space-between; align-items: flex-start; }
.state-tag { background: #FF8049 !important; }
.result-body p { font-size: 13px; color: #64748b; display: flex; align-items: center; gap: 8px; margin: 8px 0; }
.custom-btn { background: #FF8049 !important; border: none; border-radius: 12px; padding: 12px; }
.empty-state { text-align: center; padding: 40px 20px; color: #94a3b8; }
.large-icon { font-size: 60px; margin-bottom: 15px; color: #cbd5e1; }
.animate-fadein { animation: fadeIn 0.4s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.bottom-spacer { height: 100px; }

.widget-icon.blue {
  background: #eff6ff;
  color: #3b82f6;
}

.widget-icon.orange {
  background: #fff7ed;
  color: #fb923c;
}

.widget-icon.green {
  background: #f0fdf4;
  color: #22c55e;
}

.widget-card {
  background: white;
  padding: 16px 14px;
  border-radius: 18px;
  height: 140px; /* 🔥 altura fixa */
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  box-shadow: 0 4px 14px rgba(0,0,0,0.04);
}

.widget-title {
  font-size: 13px;
  margin-top: 10px;
  color: #1e293b;
}

.widget-text {
  font-size: 11px;
  color: #64748b;
  margin-top: 4px;
  line-height: 1.4;
}

.widgets-slider {
  margin-top: 20px;
  margin-bottom: 24px;
}

</style>