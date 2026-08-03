<template>
  <ion-page class="quotes-browser-page">
    <ion-content :fullscreen="true" class="ion-padding">
      <RefresherIonic />

      <AvisoFintech 
        v-model="abrirModal"
        :titulo="TituloModal"
        :descricao="DescricaoModal"
      
      />

      <!-- ════════════════════════════════════════════
           VISÃO MOBILE (< 992px) — layout original em cards
      ════════════════════════════════════════════ -->
      <div class="mobile-view">
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
      </div>
      <!-- /.mobile-view -->

      <!-- ════════════════════════════════════════════
           VISÃO DESKTOP (>= 992px) — mesmo estilo do
           Painel de Cotações (consultarCotacoesConsole.vue)
      ════════════════════════════════════════════ -->
      <div class="desktop-view">

        <!-- Modal: Entendendo os Status de Cotação -->
        <transition name="modal-fade">
          <div v-if="modalStatusVisivel" class="modal-overlay" @click.self="fecharModal">
            <div class="modal-card" style="font-family: 'Poppins';">

              <div class="modal-header">
                <div class="modal-header-icon">
                  <span class="material-symbols-outlined">help</span>
                </div>
                <div>
                  <h2 class="modal-title">Entendendo os Status de Cotação</h2>
                  <p class="modal-subtitle">Saiba o que acontece em cada etapa do ciclo da cotação</p>
                </div>
                <button class="modal-close-btn" @click="fecharModal">
                  <span class="material-symbols-outlined">close</span>
                </button>
              </div>

              <div class="modal-body">
                <div class="status-card status-card--indisponivel">
                  <div class="status-card-badge">
                    <span class="material-symbols-outlined">block</span>
                    Indisponível
                  </div>
                  <p class="status-card-desc">
                    Somente a <strong>loja</strong> tem acesso à cotação neste momento. Os vendedores ainda <strong>não conseguem visualizá-la</strong>. Este é o período reservado para a loja configurar e adicionar os produtos à cotação antes de disponibilizá-la ao mercado.
                  </p>
                </div>

                <div class="status-card status-card--aberta">
                  <div class="status-card-badge">
                    <span class="material-symbols-outlined">radio_button_unchecked</span>
                    Aberta
                  </div>
                  <p class="status-card-desc">
                    A cotação está <strong>disponível para você</strong>. Você pode acessar os produtos solicitados e <strong>enviar suas ofertas de preço</strong>, competindo com outros vendedores para oferecer as melhores condições à loja.
                  </p>
                </div>

                <div class="status-card status-card--fechada">
                  <div class="status-card-badge">
                    <span class="material-symbols-outlined">lock</span>
                    Fechada
                  </div>
                  <p class="status-card-desc">
                    O prazo para oferta encerrou e a cotação está em análise pela loja. Não é mais possível enviar ou alterar preços enquanto a loja avalia as ofertas recebidas.
                  </p>
                </div>

                <div class="status-card status-card--finalizada">
                  <div class="status-card-badge">
                    <span class="material-symbols-outlined">verified</span>
                    Finalizada
                  </div>
                  <p class="status-card-desc">
                    A loja <strong>concluiu a seleção</strong>. Caso você tenha sido contemplado, o pedido foi enviado e você já pode <strong>faturar e encaminhar</strong> para as empresas que representa.
                  </p>
                </div>
              </div>

              <div class="modal-footer">
                <button class="btn-nunca-mais" @click="fecharModalDefinitivamente">
                  <span class="material-symbols-outlined">visibility_off</span>
                  Não quero ver novamente
                </button>
                <button class="btn-entendi" @click="fecharModal">
                  Entendi!
                  <span class="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>

            </div>
          </div>
        </transition>

        <!-- Header -->
        <header class="page-header">
          <div class="header-content">
            <h1>Cotações</h1>
            <p style="font-size: 16px;">Consulte suas cotações</p>
          </div>
          <div class="header-actions">
            <button class="btn-ajuda-status" @click="modalStatusVisivel = true">
              <span class="material-symbols-outlined">help_outline</span>
              Dúvidas sobre os status?
            </button>

            <span class="p-input-icon-left search-box">
              <span class="material-symbols-outlined position-search-icon">search</span>
              <InputText 
                v-model="searchQuery" 
                placeholder="Pesquisar por nome..." 
                class="p-inputtext-sm custom-input"
                :disabled="nenhumaCotacao"
              />
            </span>
          </div>
        </header>

        <!-- Painel de Filtros -->
        <section class="filter-panel">
          <div class="filter-group">
            <label>Período Rápido</label>
            <div class="button-group">
              <Button 
                label="Hoje" 
                :class="['p-button-sm', { 'active-filter': filtroAtivo === 'hoje' }]" 
                @click="definirFiltroData('hoje')"
                :disabled="nenhumaCotacao"
              />
              <Button 
                label="Esta Semana" 
                :class="['p-button-sm', { 'active-filter': filtroAtivo === 'semana' }]" 
                @click="definirFiltroData('semana')"
                :disabled="nenhumaCotacao"
              />
              <Button 
                label="Este Mês" 
                :class="['p-button-sm', { 'active-filter': filtroAtivo === 'mes' }]" 
                @click="definirFiltroData('mes')"
                :disabled="nenhumaCotacao"
              />
              <button
                class="p-button-sm-filter p-button-text" 
                :class="{ 'button-filter-disable': !filtroAtivo }"
                title="Limpar Filtros"
                @click="limparFiltrosDesktop"
                :disabled="!filtroAtivo"
              >
                <span class="material-symbols-outlined">filter_alt_off</span>
              </button>
            </div>
          </div>

          <div class="filter-group">
            <label>Intervalo Específico</label>
            <Calendar 
              v-model="filtroDatas" 
              selectionMode="range" 
              :manualInput="false" 
              placeholder="00/00/0000 - 00/00/0000"
              class="custom-calendar"
              dateFormat="dd/mm/yy"
              showIcon
              :disabled="nenhumaCotacao"
            />
          </div>

          <div class="filter-group">
            <label>Status da Cotação</label>
            <div class="toggle-group">
              <button 
                type="button"
                :class="['filter-btn-toggle', { 'active': activeFilterDesktop === 'aberta' }]"
                @click="definirFiltroStatusDesktop('aberta')"
              >
                <span class="material-symbols-outlined">
                  {{ activeFilterDesktop === 'aberta' ? 'task_alt' : 'radio_button_unchecked' }}
                </span>
                Abertas
              </button>

              <button 
                type="button"
                :class="['filter-btn-toggle', { 'active': activeFilterDesktop === 'fechada' }]"
                @click="definirFiltroStatusDesktop('fechada')"
              >
                <span class="material-symbols-outlined">
                  {{ activeFilterDesktop === 'fechada' ? 'lock' : 'lock_open' }}
                </span>
                Fechadas
              </button>

              <button 
                type="button"
                :class="['filter-btn-toggle', { 'active': activeFilterDesktop === 'finalizada' }]"
                @click="definirFiltroStatusDesktop('finalizada')"
              >
                <span class="material-symbols-outlined">
                  {{ activeFilterDesktop === 'finalizada' ? 'verified' : 'new_releases' }}
                </span>
                Finalizadas
              </button>

              <button 
                type="button"
                :class="['filter-btn-toggle', { 'active': activeFilterDesktop === 'indisponivel' }]"
                @click="definirFiltroStatusDesktop('indisponivel')"
              >
                <span class="material-symbols-outlined">
                  {{ activeFilterDesktop === 'indisponivel' ? 'block' : 'do_not_disturb_on' }}
                </span>
                Indisponíveis
              </button>
            </div>
          </div>
        </section>

        <!-- Tabela -->
        <main class="table-section">
          <div v-if="error" class="error-state">
            <span class="material-symbols-outlined error-icon">cloud_off</span>
            <h3 class="poppins-semibold">Conexão falhou</h3>
            <p class="poppins-regular">Não conseguimos buscar as cotações.</p>
            <Button label="Tentar Novamente" class="p-button-rounded mt-3 retry-btn" @click="fetchQuotes" />
          </div>

          <div v-else-if="nenhumaCotacao" class="explore-state">
            <div style="width: 100%; display: flex; justify-content: center;">
              <img src="../assets/Telecommuting.gif" alt="" style="max-width: 280px;">
            </div>
            <div style="font-family: 'Poppins'; font-size: 20px; font-weight: 600; text-align: center;">
              Explore mais!
            </div>
            <div style="font-family: 'Poppins'; text-align: center; margin-top: 15px; color: #333; max-width: 480px;">
              Ainda você não possui nenhuma cotação para consultar... Encontre e faça parcerias com lojas
              para você visualizar as cotações aqui!
            </div>
            <div style="display: flex; justify-content: center; margin-top: 20px;">
              <button @click="$router.push({name: 'Explorar'})" style="background-color: #ff8049; padding: 20px 30px 20px 30px; border: none; border-radius: 5px; color: #fff; font-family: 'Poppins'; font-size: 16px;">
                Encontrar lojas!
              </button>
            </div>
          </div>

          <DataTable 
            v-else
            :value="filteredQuotesDesktop" 
            :paginator="true" 
            :rows="15" 
            :rowHover="true"
            :rowClass="rowClassDesktop"
            @row-click="onRowClickDesktop"
            :rowsPerPageOptions="[5, 10, 20, 50]"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Exibindo {first} a {last} de {totalRecords}"
            class="p-datatable-sm custom-table"
            :loading="loading"
            responsiveLayout="stack"
            dataKey="id_cotacao"
          >
            <Column field="nome_cotacao" header="NOME DA COTAÇÃO" sortable>
              <template #body="{ data }">
                <span class="font-medium text-dark">{{ data.nome_cotacao }}</span>
              </template>
            </Column>

            <Column field="status_cotacao" header="STATUS">
              <template #body="{ data }">
                <Tag 
                  :value="getLabelStatusDesktop(data).toUpperCase()" 
                  :severity="getStatusSeverityDesktop(data)"
                  class="custom-tag"
                  :class="'tag-' + getStatusKeyDesktop(data)"
                />
              </template>
            </Column>

            <Column field="inicio_cotacao" header="DATA INICIAL" sortable>
              <template #body="{ data }">
                {{ formatarDataDesktop(data.inicio_cotacao) }}
              </template>
            </Column>

            <Column field="id_cotacao" header="ID">
              <template #body="{ data }">
                {{ data.id_cotacao }}
              </template>
            </Column>

            <Column header="AÇÕES" headerStyle="width: 8rem; text-align: center" bodyStyle="text-align: center">
              <template #body="{ data }">
                <Button 
                  icon="pi pi-arrow-right" 
                  class="p-button-rounded p-button-text action-btn active-btn"
                  @click.stop="navigateToDetails(data)"
                  title="Ver detalhes da cotação"
                />
              </template>
            </Column>
          </DataTable>
        </main>

      </div>
      <!-- /.desktop-view -->

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
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Calendar from 'primevue/calendar';
import Tag from 'primevue/tag';
import AvisoFintech from '@/components/AvisoFintech.vue'
import RefresherIonic from '@/components/refresherIonic.vue';

const LS_KEY_MODAL_STATUS_MINHAS_COTACOES = 'mvsgdb_modal_status_oculto_minhas_cotacoes';

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
    DataTable,
    Column,
    Calendar,
    Tag,
    AvisoFintech,
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
      ],

      abrirModal : false,
      TituloModal : '',
      DescricaoModal : '',

      // ── Campos exclusivos da visão desktop (>= 992px) ──────────────
      filtroAtivo: null as string | null,
      filtroDatas: null as Date[] | null,
      modalStatusVisivel: false,
      activeFilterDesktop: null as string | null, // 'aberta' | 'fechada' | 'finalizada' | 'indisponivel' | null

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
    },

    // ── Computed exclusivo da visão desktop (>= 992px) ──────────────
    // Reaproveita searchQuery e activeFilter (compartilhados com o mobile)
    // e adiciona o filtro por período de data, próprio do desktop.
    filteredQuotesDesktop() {
      let result = [...this.quotes];

      if (this.activeFilterDesktop) {
        result = result.filter(q => this.getStatusKeyDesktop(q) === this.activeFilterDesktop);
      }

      if (this.searchQuery.trim() !== '') {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(q => q.nome_cotacao.toLowerCase().includes(query));
      }

      if (this.filtroDatas && this.filtroDatas[0] && this.filtroDatas[1]) {
        const inicio = this.filtroDatas[0];
        const fim = this.filtroDatas[1];
        result = result.filter(q => {
          const dataCotacao = new Date(Number(q.inicio_cotacao));
          return dataCotacao >= inicio && dataCotacao <= fim;
        });
      }

      result.sort((a, b) => Number(b.inicio_cotacao) - Number(a.inicio_cotacao));

      return result;
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
      this.error = false;
      try {
        const response = await api.get('/mvpu/cotacao/vendedorGetCotacoes/0');


        const responseEmpresas = await api.get('/mvpu/usuario/operacoesEmpresaVendedor/');
        const empresas = responseEmpresas.data?.data || [];
        
        if (empresas.length === 0) {
          this.abrirModal = true
          this.TituloModal = 'Ops... Parece que você não possui a empresa que você representa cadastrada.'
          this.DescricaoModal = 'Vá em:  Perfil -> Editar Perfil -> Cadastrar Empresa. Adicione ao menos uma empresa para você conferir suas cotações'
          this.temEmpresaVinculada = false
          this.nenhumaCotacao = true
          this.loadingEmpresas = false
          return; // Interrompe aqui, não precisa buscar stats se não tem empresa
        }

        let verificaSelecionada = false

        for(let empresa of empresas){
          if(empresa.selecionada){
            verificaSelecionada = true
          }
        }

        if(!verificaSelecionada){
          this.abrirModal = true
          this.TituloModal = 'Você possui empresas, mas não selecionou nenhuma....'
          this.DescricaoModal = 'Vá em:  Perfil -> Editar Perfil -> Cadastrar Empresa, clique no ícone ao lado do olho e selecione a empresa.'
          this.temEmpresaVinculada = false
          this.nenhumaCotacao = true
          this.loadingEmpresas = false
          return; // Interrompe aqui, não precisa buscar stats se não tem empresa
        }

        this.temEmpresaVinculada = true;

        // Verificar se a empresa selecionada tem pedido_minimo preenchido
        const empresaSelecionada = empresas.find((e: any) => e.selecionada);
        if (empresaSelecionada && (empresaSelecionada.pedido_minimo === null || empresaSelecionada.pedido_minimo === undefined)) {
          this.temPedidoMinimo = false;
          this.loadingEmpresas = false;
          return;
        }
        this.temPedidoMinimo = true;
        this.loadingEmpresas = false;

        //Adicionar essa validação em enviar solicitação loja. Só pode enviar se houver uma empresa no mínimo

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
    },

    // ── Métodos exclusivos da visão desktop (>= 992px) ──────────────
    // Status derivado no mesmo padrão de consultarCotacoesConsole.vue,
    // espelhando EXATAMENTE as mesmas 5 condições de badge usadas
    // no card mobile (ver template, bloco .card-actions):
    // 1) status_fechamento == null  && status_cotacao == 'fechada'                      → Indisponível
    // 2) status_fechamento == null  && status_cotacao == 'aberta'                       → Aberta
    // 3) (status_fechamento == null || 'pendente') && status_cotacao == 'finalizada'    → Fechada
    // 4) status_fechamento == 'pendente'                                                → Fechada
    // 5) status_fechamento == 'concluido'                                               → Finalizado
    getStatusKeyDesktop(cotacao: any) {
      const s = cotacao.status_cotacao;
      const f = cotacao.status_fechamento;

      if (f === 'concluido') return 'finalizada';
      if (f === 'pendente') return 'fechada';
      if (f == null && s === 'fechada') return 'indisponivel';
      if (f == null && s === 'aberta') return 'aberta';
      if (f == null && s === 'finalizada') return 'fechada';
      return 'aberta';
    },

    getLabelStatusDesktop(cotacao: any) {
      const key = this.getStatusKeyDesktop(cotacao);
      const labels: Record<string, string> = {
        aberta: 'Aberta',
        fechada: 'Fechada',
        finalizada: 'Finalizada',
        indisponivel: 'Indisponível'
      };
      return labels[key] || key;
    },

    getStatusSeverityDesktop(cotacao: any): "success" | "secondary" | "info" | "warn" | undefined {
      const key = this.getStatusKeyDesktop(cotacao);
      switch (key) {
        case 'aberta': return 'success';
        case 'fechada': return 'warn';
        case 'finalizada': return 'info';
        case 'indisponivel': return 'secondary';
        default: return 'secondary';
      }
    },

    formatarDataDesktop(timestamp: string) {
      if (!timestamp) return '-';
      return new Date(Number(timestamp)).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    definirFiltroData(tipo: string) {
      this.filtroAtivo = tipo;
      const hoje = new Date();
      let inicio = new Date();
      let fim = new Date();

      if (tipo === 'hoje') {
        inicio.setHours(0, 0, 0, 0);
        fim.setHours(23, 59, 59, 999);
      } else if (tipo === 'semana') {
        const diaSemana = hoje.getDay();
        inicio.setDate(hoje.getDate() - diaSemana);
        inicio.setHours(0, 0, 0, 0);
      } else if (tipo === 'mes') {
        inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      }

      this.filtroDatas = [inicio, fim];
      this.firstRow = 0;
    },

    limparFiltrosDesktop() {
      this.filtroAtivo = null;
      this.filtroDatas = null;
      this.activeFilterDesktop = null;
      this.firstRow = 0;
    },

    definirFiltroStatusDesktop(status: string) {
      this.activeFilterDesktop = this.activeFilterDesktop === status ? null : status;
      this.firstRow = 0;
    },

    onRowClickDesktop(event: any) {
      this.navigateToDetails(event.data);
    },

    rowClassDesktop() {
      return 'row-clickable';
    },

    fecharModal() {
      this.modalStatusVisivel = false;
    },

    fecharModalDefinitivamente() {
      localStorage.setItem(LS_KEY_MODAL_STATUS_MINHAS_COTACOES, 'true');
      this.modalStatusVisivel = false;
    },

    verificarExibirModalStatus() {
      const oculto = localStorage.getItem(LS_KEY_MODAL_STATUS_MINHAS_COTACOES);
      if (!oculto) {
        this.modalStatusVisivel = true;
      }
    }
  },
  mounted() {
    this.fetchQuotes();
    this.verificarExibirModalStatus();
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
  background: transparent !important;
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

/* ===== OVERLAYS EMPRESA / PEDIDO MÍNIMO ===== */
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

/* ════════════════════════════════════════════════════════════════
   VISIBILIDADE RESPONSIVA
   < 992px → mostra .mobile-view (cards, layout original)
   >= 992px → mostra .desktop-view (mesmo estilo do Painel de
   Cotações / consultarCotacoesConsole.vue)
════════════════════════════════════════════════════════════════ */
.desktop-view {
  display: none;
}

@media (min-width: 992px) {
  .mobile-view {
    display: none;
  }

  .desktop-view {
    display: block;
  }
}

/* ════════════════════════════════════════════════════════════════
   VISÃO DESKTOP (>= 992px) — réplica do estilo de
   consultarCotacoesConsole.vue
════════════════════════════════════════════════════════════════ */
.desktop-view {
  padding: 2rem;
  background-color: #f8f9fa;
  font-family: 'Poppins', sans-serif;
  color: #334155;
}

/* MODAL */
.desktop-view .modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.desktop-view .modal-card {
  background: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 620px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.18);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.desktop-view .modal-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.4rem 1.6rem;
  border-bottom: 1px solid #f1f5f9;
}

.desktop-view .modal-header-icon {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #ff8049, #ff6020);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.desktop-view .modal-header-icon .material-symbols-outlined {
  color: #ffffff;
  font-size: 22px;
}

.desktop-view .modal-title {
  font-size: 1.05rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.desktop-view .modal-subtitle {
  font-size: 0.82rem;
  color: #64748b;
  margin: 2px 0 0 0;
}

.desktop-view .modal-close-btn {
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  padding: 4px;
  transition: background 0.15s, color 0.15s;
}

.desktop-view .modal-close-btn:hover {
  background: #f1f5f9;
  color: #475569;
}

.desktop-view .modal-body {
  padding: 1.4rem 1.6rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  max-height: 65vh;
  overflow-y: auto;
}

.desktop-view .status-card {
  border-radius: 10px;
  padding: 1rem 1.2rem;
  border-left: 4px solid transparent;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.desktop-view .status-card--indisponivel { background: #f8fafc; border-left-color: #94a3b8; }
.desktop-view .status-card--aberta { background: #f0fdf4; border-left-color: #22c55e; }
.desktop-view .status-card--fechada { background: #fff7f3; border-left-color: #ff8049; }
.desktop-view .status-card--finalizada { background: #eff6ff; border-left-color: #3b82f6; }

.desktop-view .status-card-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.desktop-view .status-card-badge .material-symbols-outlined { font-size: 18px; }
.desktop-view .status-card--indisponivel .status-card-badge { color: #64748b; }
.desktop-view .status-card--aberta .status-card-badge { color: #16a34a; }
.desktop-view .status-card--fechada .status-card-badge { color: #ff8049; }
.desktop-view .status-card--finalizada .status-card-badge { color: #2563eb; }

.desktop-view .status-card-desc {
  font-size: 0.875rem;
  color: #475569;
  line-height: 1.6;
  margin: 0;
}

.desktop-view .modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem 1.6rem;
  border-top: 1px solid #f1f5f9;
  gap: 0.75rem;
}

.desktop-view .btn-nunca-mais {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #94a3b8;
  font-family: 'Poppins', sans-serif;
  font-size: 0.82rem;
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 6px;
  transition: color 0.15s, background 0.15s;
}

.desktop-view .btn-nunca-mais:hover { color: #64748b; background: #f8fafc; }
.desktop-view .btn-nunca-mais .material-symbols-outlined { font-size: 17px; }

.desktop-view .btn-entendi {
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #ff8049, #ff6020);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1.4rem;
  font-family: 'Poppins', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
}

.desktop-view .btn-entendi:hover { opacity: 0.9; transform: translateY(-1px); }
.desktop-view .btn-entendi .material-symbols-outlined { font-size: 18px; }

.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.25s ease;
}
.modal-fade-enter-active .modal-card, .modal-fade-leave-active .modal-card {
  transition: transform 0.25s ease, opacity 0.25s ease;
}
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-from .modal-card, .modal-fade-leave-to .modal-card {
  transform: translateY(20px);
  opacity: 0;
}

/* BOTÃO DE AJUDA NO HEADER */
.desktop-view .btn-ajuda-status {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fff7f3;
  border: 1px solid #ffd4be;
  color: #ff8049;
  font-family: 'Poppins', sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.desktop-view .btn-ajuda-status:hover {
  background: #fff1eb;
  border-color: #ff8049;
  box-shadow: 0 2px 8px rgba(255, 128, 73, 0.15);
}

.desktop-view .btn-ajuda-status .material-symbols-outlined { font-size: 18px; }

/* HEADER */
.desktop-view .page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.desktop-view .header-content h1 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: #1e293b;
}

.desktop-view .header-content p {
  font-size: 0.9rem;
  color: #64748b;
  margin: 0.2rem 0 0 0;
}

.desktop-view .header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

/* BUSCA */
.desktop-view .custom-input {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  width: 300px;
  padding: 0.6rem 1rem 0.6rem 2.5rem;
  transition: all 0.2s;
}

.desktop-view .custom-input:focus {
  border-color: #ff8049;
  box-shadow: 0 0 0 2px rgba(255, 128, 73, 0.1);
}

/* FILTROS */
.desktop-view .filter-panel {
  display: flex;
  gap: 2rem;
  background: white;
  padding: 1.2rem;
  border-radius: 12px;
  border: 1px solid #edf2f7;
  margin-bottom: 1.5rem;
  align-items: flex-end;
  flex-wrap: wrap;
}

.desktop-view .filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.desktop-view .filter-group label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #94a3b8;
  letter-spacing: 0.05em;
}

.desktop-view .button-group {
  display: flex;
  gap: 0.5rem;
}

.desktop-view .button-group :deep(.p-button) {
  background: #f1f5f9;
  border: none;
  color: #475569;
  font-family: 'Poppins', sans-serif;
  font-size: 0.85rem;
  border-radius: 6px;
}

.desktop-view .button-group :deep(.p-button:hover) {
  background: #e2e8f0;
}

.desktop-view .button-group :deep(.active-filter) {
  background: #ff8049 !important;
  color: white !important;
}

.desktop-view .custom-calendar {
  height: 38px;
}

/* TABELA */
.desktop-view .table-section {
  background: white;
  border-radius: 12px;
  border: 1px solid #edf2f7;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.desktop-view .custom-table :deep(.p-datatable-thead > tr > th) {
  background: #f8fafc;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
}

.desktop-view .custom-table :deep(.p-datatable-tbody > tr > td) {
  padding: 1rem;
  font-size: 0.9rem;
  border-bottom: 1px solid #f8fafc;
}

/* CORES DAS TAGS DE STATUS */
.desktop-view :deep(.tag-fechada.p-tag) {
  font-size: 13px;
  background-color: #ff804930 !important;
  color: #ff8049 !important;
}

.desktop-view :deep(.tag-indisponivel.p-tag) {
  font-size: 13px;
  background-color: #94a3b830 !important;
  color: #94a3b8 !important;
}

.desktop-view :deep(.tag-finalizada.p-tag) {
  font-size: 13px;
  background-color: #3b82f630 !important;
  color: #3b82f6 !important;
}

.desktop-view :deep(.tag-aberta.p-tag) {
  font-size: 13px;
  background-color: #22c55e30 !important;
  color: #22c55e !important;
}

.desktop-view .custom-tag {
  font-family: 'Poppins', sans-serif;
  font-weight: 500;
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
}

.desktop-view .action-btn { transition: all 0.2s; }
.desktop-view .active-btn { color: #ff8049 !important; }
.desktop-view .active-btn:hover { background: rgba(255, 128, 73, 0.1) !important; }

.desktop-view :deep(.row-clickable) { cursor: pointer; }

.desktop-view :deep(.p-datatable-hoverable-rows .p-selectable-row:hover) {
  background: rgba(255, 128, 73, 0.04) !important;
  transition: background 0.2s ease;
}

.desktop-view :deep(.row-clickable:hover td:first-child) {
  box-shadow: inset 4px 0 0 0 #ff8049;
}

.desktop-view .filter-btn-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 16px;
  background-color: #ffffff;
  border: 1px solid #d0d5dd;
  border-radius: 8px;
  color: #475467;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.desktop-view .filter-btn-toggle span {
  font-size: 20px;
  transition: transform 0.2s ease;
}

.desktop-view .filter-btn-toggle.active {
  background-color: #fff1eb;
  border-color: #ff8049;
  color: #ff8049;
  box-shadow: 0 1px 2px rgba(255, 128, 73, 0.1);
}

.desktop-view .filter-btn-toggle.active span {
  color: #ff8049;
  font-variation-settings: 'FILL' 1;
}

.desktop-view .filter-btn-toggle:hover:not(.active) {
  background-color: #f9fafb;
  border-color: #98a2b3;
}

.desktop-view .filter-btn-toggle:active {
  transform: scale(0.98);
}

.desktop-view .toggle-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.desktop-view .p-button-sm-filter {
  color: #ff8049;
  background-color: #F1F5F9;
  cursor: pointer;
}

.desktop-view .button-filter-disable {
  color: #a7a2a2;
  background-color: #dce0e4;
  cursor: not-allowed;
}

.desktop-view .position-search-icon {
  position: relative;
  transform: translate(35px, 8px);
  z-index: 1;
}

.desktop-view .search-box {
  position: relative;
}

.desktop-view .p-inputtext-sm {
  position: relative;
  padding-left: 40px;
}

/* Estado de erro / "explore mais" na visão desktop, dentro do card da tabela */
.desktop-view .explore-state,
.desktop-view .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 30px;
  text-align: center;
}

.desktop-view .error-icon { font-size: 48px; color: #ef4444; margin-bottom: 12px; }
.desktop-view .retry-btn { background: #3b82f6; border: none; font-size: 14px; }
</style>