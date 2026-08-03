<template>
  <ion-page class="quotes-browser-page">
    <ion-content :fullscreen="true" class="ion-padding">
      
      <RefresherIonic />

      <div class="search-section">
        <h2 class="poppins-semibold page-title">Cotações</h2>
        
        <div class="header-actions">
          <div class="search-bar-container">
            <span class="search-wrapper">
              <span class="material-symbols-outlined search-icon">search</span>
              <InputText 
                v-model="searchQuery" 
                placeholder="Buscar cotação..." 
                class="w-full custom-search-input poppins-regular"
                :disabled="nenhumaCotacao"
              />
            </span>
          </div>
          
          <Button 
            @click="showFilters = !showFilters" 
            class="filter-toggle-btn"
            :class="{ 'filter-active': showFilters }"
            :disabled="nenhumaCotacao"
          >
            <span class="material-symbols-outlined">filter_list</span>
          </Button>
        </div>

        <transition name="fade-slide">
          <div v-if="showFilters" class="expanded-filters-panel mt-3">
            <div class="filter-group">
              <label class="filter-label poppins-medium">Status da Cotação</label>
              <SelectButton 
                v-model="activeFilter" 
                :options="filterOptions" 
                optionLabel="label" 
                optionValue="value"
                class="custom-select-button-vertical poppins-medium"
              />
            </div>

            <div class="filter-group mt-3">
              <label class="filter-label poppins-medium">Ordenar por</label>
              <SelectButton 
                v-model="activeSort" 
                :options="sortOptions" 
                optionLabel="label" 
                optionValue="value"
                class="custom-select-button-vertical sort-group poppins-medium"
              />
            </div>
          </div>
        </transition>
      </div>

      <div v-if="loading" class="quotes-grid mt-3">
        <div v-for="i in 6" :key="i" class="skeleton-card mb-3">
          <Skeleton width="100%" height="90px" borderRadius="16px"></Skeleton>
        </div>
      </div>

      <div v-else-if="error" class="error-state">
        <span class="material-symbols-outlined error-icon">cloud_off</span>
        <h3 class="poppins-semibold">Conexão falhou</h3>
        <p class="poppins-regular">Não conseguimos buscar as cotações.</p>
        <Button label="Tentar Novamente" class="p-button-rounded mt-3 retry-btn" @click="fetchQuotes" />
      </div>

      <div v-else-if="nenhumaCotacao">
        <div style="width: 100%; display: flex; justify-content: center;">
          <img src="../assets/Telecommuting.gif" alt="">
        </div>

        <div style="font-family: 'Poppins'; font-size: 20px; font-weight: 600; text-align: center;">
          Explore mais!
        </div>

        <div style="font-family: 'Poppins'; text-align: center; margin-top: 15px; color: #333;">
          Ainda você não possui nenhuma cotação para consultar... Encontre e faça parcerias com lojas
          para você visualizar as cotações aqui!
        </div>


        <div style="display: flex; justify-content: center; margin-top: 20px;">
          <button @click="$router.push({name: 'Explorar'})" style="background-color: #ff8049; padding: 20px 30px 20px 30px; border: none; border-radius: 5px; color: #fff; font-family: 'Poppins'; font-size: 16px;">
            Encontrar lojas!
          </button>
        </div>

      </div>

      <div v-else class="quotes-list-container mt-3">
        <div v-if="paginatedQuotes.length > 0">
          <div 
            v-for="quote in paginatedQuotes" 
            :key="quote.id_cotacao" 
            class="quote-card-modern"
            @click="navigateToDetails(quote)"
          >
            <div class="card-accent" :class="getStatusClass(quote.status_cotacao)"></div>
            
            <div class="card-inner-content">
              <div class="card-info">
                <h3 class="quote-title poppins-semibold">{{ quote.nome_cotacao }}</h3>
                <div class="quote-details">
                  <span class="detail-item">
                    <span class="material-symbols-outlined tiny-icon">calendar_today</span>
                    {{ formatDate(quote.inicio_cotacao) }}
                  </span>
                  <span class="detail-item">
                    <span class="material-symbols-outlined tiny-icon">tag</span>
                    ID: {{ quote.id_cotacao }}
                  </span>
                </div>
              </div>
              
              <div class="card-actions">

                <Badge 
                  v-if="quote.status_fechamento == null && quote.status_cotacao == 'fechada'"
                  :value="formatStatusText('Indisponível')" 
                  :severity="getBadgeSeverity(quote.status_cotacao)"
                  class="status-badge poppins-medium"
                ></Badge>

                <Badge 
                  v-if="quote.status_fechamento == null && quote.status_cotacao == 'aberta'"
                  :value="formatStatusText('Aberta')" 
                  :severity="getBadgeSeverity(quote.status_cotacao)"
                  class="status-badge poppins-medium"
                ></Badge>

                <Badge 
                  v-if="(quote.status_fechamento == null || quote.status_fechamento == 'pendente') && quote.status_cotacao == 'finalizada'"
                  :value="formatStatusText('Fechada')" 
                  :severity="getBadgeSeverity(quote.status_cotacao)"
                  class="status-badge poppins-medium"
                ></Badge>

                <Badge 
                  v-else-if="quote.status_fechamento == 'pendente'"
                  :value="formatStatusText('Fechada')" 
                  :severity="getBadgeSeverity(quote.status_fechamento)"
                  class="status-badge poppins-medium"
                ></Badge>

                <Badge 
                  v-else-if="quote.status_fechamento == 'concluido'"
                  :value="formatStatusText('Finalizado')" 
                  :severity="getBadgeSeverity(quote.status_fechamento)"
                  class="status-badge poppins-medium"
                ></Badge>

                <span class="material-symbols-outlined arrow-icon">chevron_right</span>
              </div>
            </div>
          </div>

          <div class="pagination-wrapper mt-4">
            <Paginator 
              v-model:first="firstRow" 
              :rows="rowsPerPage" 
              :totalRecords="filteredQuotes.length"
              template="PrevPageLink PageLinks NextPageLink"
              class="custom-paginator"
            ></Paginator>
          </div>
        </div>

        <div v-else class="empty-state">
          <div class="empty-icon-wrapper">
            <span class="material-symbols-outlined">search_off</span>
          </div>
          <h3 class="poppins-semibold">Nenhum resultado</h3>
          <p class="poppins-regular">Ajuste os filtros para encontrar o que precisa.</p>
          <Button 
            v-if="searchQuery || activeFilter !== 'todas' || activeSort !== 'recent'" 
            label="Limpar Filtros" 
            class="p-button-text mt-2" 
            @click="resetFilters" 
          />
        </div>
      </div>

      <div class="bottom-spacer"></div>

      <!-- Overlay: sem empresa vinculada -->
      <transition name="fade">
        <div v-if="!loadingEmpresas && !temEmpresaVinculada" class="fintech-overlay">
          <div class="overlay-content">
            <div class="illustration-container">
              <div class="icon-circle-main">
                <span class="material-symbols-outlined">add_business</span>
              </div>
            </div>

            <h2 class="poppins-semibold">Vamos começar?</h2>
            <p class="poppins-regular text-muted">
              Identificamos que você ainda não possui empresas cadastradas.
              Para acessar suas estatísticas e cotações, você precisa vincular ao menos uma empresa que você representa.
            </p>

            <div class="action-footer">
              <button class="primary-fintech-btn poppins-medium" @click="irParaCadastroEmpresa">
                Cadastrar Minha Primeira Empresa
                <span class="material-symbols-outlined">arrow_forward</span>
              </button>
              <p class="support-text poppins-regular">Leva menos de 2 minutos.</p>
            </div>
          </div>
        </div>
      </transition>

      <!-- Overlay: empresa sem pedido mínimo cadastrado -->
      <transition name="fade">
        <div v-if="!loadingEmpresas && temEmpresaVinculada && !temPedidoMinimo" class="fintech-overlay">
          <div class="overlay-content">
            <div class="illustration-container">
              <div class="icon-circle-main icon-circle-warning">
                <span class="material-symbols-outlined">edit_note</span>
              </div>
            </div>

            <h2 class="poppins-semibold">Cadastro incompleto</h2>
            <p class="poppins-regular text-muted">
              Sua distribuidora ainda não possui um <strong>pedido mínimo</strong> definido.
              Para que os varejistas possam visualizar e negociar com você corretamente, é necessário regularizar esse dado no seu perfil de empresa.
            </p>

            <div class="action-footer">
              <button class="primary-fintech-btn poppins-medium" @click="irParaCadastroEmpresa">
                Regularizar Cadastro
                <span class="material-symbols-outlined">arrow_forward</span>
              </button>
              <p class="support-text poppins-regular">Adicione o valor do pedido mínimo da sua distribuidora.</p>
            </div>
          </div>
        </div>
      </transition>

    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonPage, IonContent } from '@ionic/vue';
import { api } from '@/services/api';

import InputText from 'primevue/inputtext';
import SelectButton from 'primevue/selectbutton';
import Skeleton from 'primevue/skeleton';
import Badge from 'primevue/badge';
import Button from 'primevue/button';
import Paginator from 'primevue/paginator';
import RefresherIonic from '../components/refresherIonic.vue';

export default defineComponent({
  name: 'QuotesBrowserPage',
  components: { 
    IonPage, 
    IonContent, 
    InputText, 
    SelectButton, 
    Skeleton, 
    Badge,
    Button,
    Paginator,
    RefresherIonic
  },
  data() {
    return {
      loading: true,
      error: false,
      showFilters: false,
      searchQuery: '',
      activeFilter: 'todas',
      activeSort: 'recent',
      quotes: [] as any[],
      firstRow: 0,
      rowsPerPage: 7,
      nenhumaCotacao: true,
      temEmpresaVinculada: true,
      temPedidoMinimo: true,
      loadingEmpresas: true,
      filterOptions: [
        { label: 'Todas', value: 'todas' },
        { label: 'Abertas', value: 'aberta' },
        { label: 'Fechadas', value: 'fechada' },
        { label: 'Finalizadas', value: 'finalizada' }
      ],
      sortOptions: [
        { label: 'Mais Recentes', value: 'recent' },
        { label: 'Mais Antigas', value: 'oldest' },
        { label: 'Nome (A-Z)', value: 'az' }
      ]
    };
  },
  computed: {
    filteredQuotes() {
      let result = [...this.quotes];

      if (this.activeFilter !== 'todas') {
        result = result.filter(q => q.status_cotacao === this.activeFilter);
      }

      if (this.searchQuery.trim() !== '') {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(q => q.nome_cotacao.toLowerCase().includes(query));
      }

      result.sort((a, b) => {
        if (this.activeSort === 'recent') return parseInt(b.id_cotacao) - parseInt(a.id_cotacao);
        if (this.activeSort === 'oldest') return parseInt(a.id_cotacao) - parseInt(b.id_cotacao);
        if (this.activeSort === 'az') return a.nome_cotacao.localeCompare(b.nome_cotacao);
        return 0;
      });

      return result;
    },
    paginatedQuotes() {
      return this.filteredQuotes.slice(this.firstRow, this.firstRow + this.rowsPerPage);
    }
  },
  watch: {
    searchQuery() { this.firstRow = 0; },
    activeFilter() { this.firstRow = 0; },
    activeSort() { this.firstRow = 0; }
  },
  methods: {
    async fetchQuotes() {
      this.loading = true;
      this.loadingEmpresas = true;
      this.error = false;

      try {
        // 1. Verificar se existem empresas cadastradas
        const responseEmpresas = await api.get('/mvpu/usuario/operacoesEmpresaVendedor/');
        const empresas = responseEmpresas.data?.data || [];

        let verificaSelecionada = false;

        if (empresas.length === 0) {
          this.temEmpresaVinculada = false;
          this.loadingEmpresas = false;
          this.loading = false;
          return;
        } else {
          for (let empresa of empresas) {
            if (empresa.selecionada) {
              verificaSelecionada = true;
            }
          }
        }

        if (!verificaSelecionada) {
          this.temEmpresaVinculada = false;
          this.loadingEmpresas = false;
          this.loading = false;
          return;
        }

        this.temEmpresaVinculada = true;

        // 1b. Verificar se a empresa selecionada tem pedido_minimo preenchido
        const empresaSelecionada = empresas.find((e: any) => e.selecionada);
        if (empresaSelecionada && (empresaSelecionada.pedido_minimo === null || empresaSelecionada.pedido_minimo === undefined)) {
          this.temPedidoMinimo = false;
          this.loadingEmpresas = false;
          this.loading = false;
          return;
        }
        this.temPedidoMinimo = true;
        this.loadingEmpresas = false;
      } catch (err) {
        this.error = true;
        this.loadingEmpresas = false;
        this.loading = false;
        return;
      }

      const idLoja = this.$route.query.id_loja || 0;

      try {
        const response = await api.get(`/mvpu/cotacao/vendedorGetCotacoes/${idLoja}`);



        if(response.data.data.length == 0){
          this.nenhumaCotacao = true
          return
        }

        this.nenhumaCotacao = false

        // Criamos um Map usando o ID como chave e depois pegamos apenas os valores
        const arrayLimpo = [...new Map(response.data.data.map(item => [item.id_cotacao, item])).values()];

        this.quotes = arrayLimpo || [];
      } catch (err) {
        this.error = true;
      } finally {
        setTimeout(() => { this.loading = false; }, 600);
      }
    },
    formatDate(timestamp: string) {
      if (!timestamp) return '--/--';
      const date = new Date(parseInt(timestamp));
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
    },
    getBadgeSeverity(status: string): "success" | "secondary" | "info" | "warn" | "danger" | undefined {



      switch (status) {
        case 'pendente': return 'warn';
        case 'concluido': return 'success';
        case 'aberta': return 'success';
        case 'fechada': return 'danger';
        case 'finalizada': return 'info';
        default: return 'secondary';
      }
    },
    formatStatusText(status: string) {
      return status.charAt(0).toUpperCase() + status.slice(1);
    },
    getStatusClass(status: string) {
      return `status-accent-${status}`;
    },
    resetFilters() {
      this.searchQuery = '';
      this.activeFilter = 'todas';
      this.activeSort = 'recent';
      this.firstRow = 0;
    },
    irParaCadastroEmpresa() {
      this.$router.push({ name: 'MinhasEmpresas' });
    },
    navigateToDetails(quote: any) {
      this.$router.push({
        name: 'DetalhesCotacao',
        query: { id_cotacao: quote.id_cotacao, id_loja: quote.id_loja, status_fechamento: quote.status_fechamento, nome_fantasia: quote.nome_fantasia, razao_social: quote.razao_social}
      });
    }
  },
  mounted() {
    this.fetchQuotes();
  }
});
</script>

<style scoped>
.quotes-browser-page {
  --background: #f8fafc;
}

.search-section {
  background: white;
  margin: -16px -16px 0 -16px;
  padding: 20px 16px 16px 16px;
  border-bottom: 1px solid #f1f5f9;
}

.page-title {
  font-size: 20px;
  color: #0f172a;
  margin: 0 0 16px 0;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-bar-container {
  flex: 1;
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
}

/* Botão de Toggle Filtro */
.filter-toggle-btn {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #475569;
  border-radius: 12px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.filter-active {
  background: #1e293b;
  color: white;
  border-color: #1e293b;
}

/* Painel de Filtros Vertical */
.expanded-filters-panel {
  background: #f8fafc;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
}

.filter-label {
  display: block;
  font-size: 12px;
  color: #64748b;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.custom-select-button-vertical {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.custom-select-button-vertical :deep(.p-button) {
  background: white;
  border: 1px solid #e2e8f0;
  color: #64748b;
  font-size: 13px;
  justify-content: flex-start;
  padding: 10px 16px;
  border-radius: 8px !important; /* Força arredondamento individual */
}

.custom-select-button-vertical :deep(.p-button.p-highlight) {
  background: #3b82f6 !important;
  border-color: #3b82f6 !important;
  color: white !important;
}

/* Cards */
.quote-card-modern {
  background: white;
  border-radius: 16px;
  margin-bottom: 12px;
  display: flex;
  overflow: hidden;
  border: 1px solid #f1f5f9;
}

.quote-card-modern:active { transform: scale(0.97); background: #f1f5f9; }

.card-accent { width: 5px; height: auto; }
.status-accent-aberta { background: #10b981; }
.status-accent-fechada { background: #ef4444; }
.status-accent-finalizada { background: #3b82f6; }

.card-inner-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  width: 100%;
}

.quote-title {
  font-size: 14px;
  color: #1e293b;
  margin: 0 0 4px 0;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.quote-details { display: flex; gap: 12px; }
.detail-item { font-size: 11px; color: #94a3b8; display: flex; align-items: center; gap: 4px; }
.tiny-icon { font-size: 14px; }
.card-actions { display: flex; align-items: center; gap: 8px; }
.status-badge { font-size: 10px; border-radius: 6px; padding: 4px 8px; }
.arrow-icon { color: #cbd5e1; font-size: 20px; }

/* Animação do Painel */
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Paginator */
.custom-paginator {
  background: white !important;
  border: none !important;
}

.custom-paginator :deep(.p-paginator-page), 
.custom-paginator :deep(.p-paginator-next), 
.custom-paginator :deep(.p-paginator-prev) {
  background: white !important;
  border-radius: 8px !important;
  margin: 0 4px !important;
  min-width: 35px !important;
  height: 35px !important;
  color: #64748b !important;
  border: 1px solid #e2e8f0 !important;
}

.custom-paginator :deep(.p-highlight) {
  background: #3b82f6 !important;
  color: white !important;
}

.empty-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 30px;
  text-align: center;
}

.empty-icon-wrapper {
  width: 64px; height: 64px; background: #f1f5f9;
  border-radius: 20px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;
}

.empty-icon-wrapper span { font-size: 32px; color: #94a3b8; }
.error-icon { font-size: 48px; color: #ef4444; margin-bottom: 12px; }
.retry-btn { background: #3b82f6; border: none; font-size: 14px; }
.bottom-spacer { height: 100px; }

/* ===== OVERLAY DE EMPRESA / PEDIDO MÍNIMO ===== */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.fintech-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #ffffff;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.overlay-content {
  text-align: center;
  max-width: 320px;
}

.icon-circle-main {
  width: 100px;
  height: 100px;
  background: #f8fafc;
  border-radius: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 30px;
  color: #ff8049;
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.1);
}

.icon-circle-main span {
  font-size: 48px;
}

.icon-circle-warning {
  color: #f59e0b;
  box-shadow: 0 10px 25px rgba(245, 158, 11, 0.15);
}

.overlay-content h2 {
  color: #1e293b;
  font-size: 24px;
  margin-bottom: 12px;
}

.text-muted {
  color: #64748b;
  font-size: 15px;
  line-height: 1.6;
  margin-bottom: 40px;
}

.action-footer {
  margin-top: 8px;
}

.primary-fintech-btn {
  width: 100%;
  background: #1e293b;
  color: white;
  border: none;
  padding: 18px 24px;
  border-radius: 16px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: transform 0.2s;
  box-shadow: 0 10px 20px rgba(30, 41, 59, 0.2);
  cursor: pointer;
}

.primary-fintech-btn:active {
  transform: scale(0.96);
}

.primary-fintech-btn span {
  font-size: 20px;
}

.support-text {
  display: block;
  margin-top: 15px;
  color: #94a3b8;
  font-size: 13px;
}
</style>