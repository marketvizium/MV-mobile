<template>
  <ion-page class="dash-cotacao-page">
    <ion-content :fullscreen="true" class="ion-padding dash-content">


      <RefresherIonic />

      <!-- ══ HEADER ══ -->
      <div class="dc-header">
        <div class="dc-header-left">
          <div class="dc-brand-icon">
            <span class="material-symbols-outlined">request_quote</span>
          </div>
          <div>
            <h1 class="dc-title poppins-semibold">Dashboard</h1>
            <p class="dc-subtitle poppins-regular">Cotações · Área de Compras</p>
          </div>
        </div>
        <div class="dc-header-right">
   
          <button class="dc-refresh-btn" @click="refreshData" :class="{ spinning: loadingDashboard }">
            <span class="material-symbols-outlined">refresh</span>
          </button>
        </div>
      </div>

      <!-- ══ PERIOD FILTER ══ -->
      <div class="period-scroll-wrap">
        <div class="period-chips-row">
          <button
            v-for="p in periodPresets"
            :key="p.key"
            class="pchip poppins-medium"
            :class="{ active: activePeriod === p.key }"
            @click="setPreset(p.key)"
          >{{ p.label }}</button>
        </div>
      </div>

      <!-- ══ PERIOD SUMMARY BAR ══ -->
      <div class="period-summary-bar" style="margin-top: 30px;">
        <div class="psb-left">
          <span class="material-symbols-outlined psb-icon">date_range</span>
          <span class="psb-label poppins-medium">{{ periodLabel }}</span>
        </div>
        <div class="psb-right">
          <span class="psb-count poppins-semibold">{{ totalCotacoes }}</span>
          <span class="psb-count-lbl poppins-regular"> cotações</span>
        </div>
      </div>

      <!-- ══ LOADING STATE ══ -->
      <div v-if="loadingDashboard" class="loading-state">
        <ion-spinner name="crescent" color="primary"></ion-spinner>
        <p class="poppins-regular">Carregando dashboard...</p>
      </div>

      <!-- ══ ERROR STATE ══ -->
      <div v-else-if="error" class="error-state">
        <span class="material-symbols-outlined error-icon">cloud_off</span>
        <h3 class="poppins-semibold">Ops! Algo deu errado.</h3>
        <p class="poppins-regular">Não foi possível carregar os dados.</p>
        <button class="retry-btn poppins-medium" @click="carregarDashboard">
          Tentar novamente
        </button>
      </div>

      <div v-else class="dash-body" style="padding-bottom: 120px;">

        <!-- ══ MINI STATS ROW (Taxa, Pendentes, Médio, Fornecedores) ══ -->
        <div class="mini-stats-row">
          <div v-for="m in miniKpis" :key="m.label" class="mini-stat-card">
            <div class="ms-value poppins-semibold">{{ m.value }}</div>
            <div class="ms-label poppins-regular">{{ m.label }}</div>
            <div
              class="ms-sub poppins-regular"
              :style="{ color: m.up === true ? '#16a34a' : m.up === false ? '#ef4444' : '#94a3b8' }"
            >
              <span v-if="m.trend">{{ m.up ? '▲' : '▼' }} {{ m.trend }}</span>
              <span v-else>{{ m.sub }}</span>
            </div>
          </div>
        </div>

        <!-- ══ KPIs PRINCIPAIS (2x2 grid) ══ -->
        <div class="section-header" style="margin-top: 50px; margin-bottom: 20px;">
          <div class="sh-icon c-orange">
            <span class="material-symbols-outlined">monitoring</span>
          </div>
          <div>
            <h2 class="sh-title poppins-semibold">Resumo Executivo</h2>
            <p class="sh-sub poppins-regular">{{ periodLabel }}</p>
          </div>
        </div>

        <div class="kpi-grid">
          <div
            v-for="k in mainKpis"
            :key="k.label"
            class="kpi-card"
            :class="k.cls"
          >
            <div class="kpi-icon-wrap">
              <span class="material-symbols-outlined kpi-icon">{{ k.icon }}</span>
              <span class="material-symbols-outlined kpi-bg-icon">{{ k.icon }}</span>
            </div>
            <div class="kpi-label poppins-regular">{{ k.label }}</div>
            <div class="kpi-value poppins-semibold">{{ k.value }}</div>
            <div class="kpi-footer">
              <span class="kpi-delta poppins-medium" :class="k.up === true ? 'up' : k.up === false ? 'down' : 'neutral'">
                <span class="material-symbols-outlined delta-icon">
                  {{ k.up === true ? 'trending_up' : k.up === false ? 'trending_down' : 'remove' }}
                </span>
                {{ k.delta }}
              </span>
              <span class="kpi-vs poppins-regular">vs ant.</span>
            </div>
          </div>
        </div>

        <!-- ══ GRÁFICO EVOLUÇÃO DE PREÇO ══ -->
        <div class="section-header mt-20" style="margin-top: 50px; margin-bottom: 20px;">
          <div class="sh-icon c-orange">
            <span class="material-symbols-outlined">trending_up</span>
          </div>
          <div>
            <h2 class="sh-title poppins-semibold">Evolução de Preço</h2>
            <p class="sh-sub poppins-regular">Busque por código de barras</p>
          </div>
        </div>

        <div class="chart-card">
          <div class="barcode-search-bar">
            <span class="material-symbols-outlined bs-icon">barcode_scanner</span>
            <input
              type="text"
              v-model="barcodeSearch"
              placeholder="Cód. de barras do produto..."
              class="bs-input poppins-regular"
              @input="debouncedSearch"
              @keyup.enter="searchProduct"
            />
            <button class="bs-btn" @click="searchProduct">
              <span class="material-symbols-outlined">search</span>
            </button>
          </div>

          <div v-if="selectedProduct" class="selected-product-bar">
            <div class="spb-top">
              <div class="spb-info" style="background: #fff7ed;">
                <span class="spb-name poppins-semibold">{{ selectedProduct.name }}</span>
                <span class="spb-code poppins-regular" style="background: #fff7ed;">{{ selectedProduct.barcode }}</span>
              </div>
              <span class="spb-cat poppins-medium">{{ selectedProduct.category }}</span>
            </div>
            <div class="spb-stats-row" style="background: #fff7ed;">
              <div class="spb-stat" style="background: #fff7ed;">
                <span class="spb-stat-val poppins-semibold">R$ {{ selectedProduct.lastPrice }}</span>
                <span class="spb-stat-lbl poppins-regular">Último preço</span>
              </div>
              <div class="spb-stat" style="background: #fff7ed;">
                <span
                  class="spb-stat-val poppins-semibold"
                  :style="{ color: selectedProduct.priceChange > 0 ? '#ef4444' : '#16a34a' }"
                >
                  {{ selectedProduct.priceChange > 0 ? '+' : '' }}{{ selectedProduct.priceChange }}%
                </span>
                <span class="spb-stat-lbl poppins-regular" style="background: #fff7ed;">Variação</span>
              </div>
              <div class="spb-stat" style="background: #fff7ed;">
                <span class="spb-stat-val poppins-semibold">{{ selectedProduct.totalQuotes }}</span>
                <span class="spb-stat-lbl poppins-regular">Cotações</span>
              </div>
            </div>
          </div>

          <div v-if="priceEvoData && selectedProduct">
            <apexchart
              type="area"
              height="200"
              :options="priceEvoChartOptions"
              :series="priceEvoSeries"
            ></apexchart>
          </div>
          <div v-else-if="!selectedProduct" class="empty-chart-state">
            <span class="material-symbols-outlined">search</span>
            <p class="poppins-regular">Digite um código de barras para visualizar a evolução</p>
          </div>
          <div v-else class="empty-chart-state">
            <span class="material-symbols-outlined">hide_image</span>
            <p class="poppins-regular">Nenhum dado encontrado para esse produto no período</p>
          </div>
        </div>

        <!-- ══ VALOR MÉDIO / COTAÇÃO ══ -->
        <div class="avg-quote-card">
          <div class="aqc-header">
            <span class="material-symbols-outlined aqc-hicon">calculate</span>
            <span class="aqc-hlabel poppins-medium">Valor Médio por Cotação</span>
          </div>
          <div class="aqc-value poppins-semibold">R$ {{ valorMedioCotacao }}</div>
          <div class="aqc-delta poppins-regular">
            <span :style="{ color: avgUp ? '#16a34a' : '#ef4444' }">
              {{ avgUp ? '▲' : '▼' }} {{ avgDelta }}%
            </span>
            vs período anterior
          </div>
          <div class="aqc-breakdown">
            <div class="aqc-b-item">
              <div class="aqc-b-val poppins-semibold">R$ {{ avgMin }}</div>
              <div class="aqc-b-lbl poppins-regular">Mínimo</div>
            </div>
            <div class="aqc-b-sep"></div>
            <div class="aqc-b-item">
              <div class="aqc-b-val poppins-semibold accent-text">R$ {{ valorMedioCotacao }}</div>
              <div class="aqc-b-lbl poppins-regular">Médio</div>
            </div>
            <div class="aqc-b-sep"></div>
            <div class="aqc-b-item">
              <div class="aqc-b-val poppins-semibold">R$ {{ avgMax }}</div>
              <div class="aqc-b-lbl poppins-regular">Máximo</div>
            </div>
          </div>
        </div>

        <!-- ══ VENDEDORES / FORNECEDORES ══ -->
        <div class="section-header mt-20" style="margin-top: 50px; margin-bottom: 20px;">
          <div class="sh-icon c-blue">
            <span class="material-symbols-outlined">group</span>
          </div>
          <div>
            <h2 class="sh-title poppins-semibold">Performance de Vendedores</h2>
            <p class="sh-sub poppins-regular">Ranking e tempo de resposta</p>
          </div>
        </div>

        <!-- Filtro de ranking -->
        <div class="chip-filter-row">
          <button
            v-for="f in ['Vendas', 'Cotações', 'Resposta', 'Aceite']"
            :key="f"
            class="chip poppins-medium"
            :class="{ active: sellerRankFilter === f }"
            @click="sellerRankFilter = f"
          >{{ f }}</button>
        </div>

        <!-- Vendedor destaque: Mais rápido -->
        <div class="highlight-seller-card highlight-green" v-if="fastestSeller.name !== '—'">
          <div class="hsc-badge">
            <span class="material-symbols-outlined hsc-badge-icon">speed</span>
            <span class="poppins-medium">Mais Rápido</span>
          </div>
          <div class="hsc-body">
            <div class="mini-av" :class="'sc-av-' + fastestSeller.avColor">
              {{ fastestSeller.initials }}
            </div>
            <div class="hsc-info">
              <div class="hsc-name poppins-semibold">{{ fastestSeller.name }}</div>
              <div class="hsc-company poppins-regular">{{ fastestSeller.company }}</div>
              <div class="hsc-metric poppins-medium green-text">
                <span class="material-symbols-outlined" style="font-size: 15px;">timer</span>
                {{ fastestSeller.tempoMedio }}h tempo médio
              </div>
            </div>
            <div class="hsc-stats">
              <div class="hsc-stat">
                <div class="hsc-stat-val poppins-semibold green-text">{{ fastestSeller.cotacoesParticipadas }}</div>
                <div class="hsc-stat-lbl poppins-regular">Cotações</div>
              </div>
              <div class="hsc-stat">
                <div class="hsc-stat-val poppins-semibold">{{ fastestSeller.taxaAceite }}%</div>
                <div class="hsc-stat-lbl poppins-regular">Aceite</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Vendedor destaque: Mais lento -->
        <div class="highlight-seller-card highlight-red" v-if="slowestSeller.name !== '—'" style="margin-top: 10px;">
          <div class="hsc-badge">
            <span class="material-symbols-outlined hsc-badge-icon">hourglass_bottom</span>
            <span class="poppins-medium">Mais Lento</span>
          </div>
          <div class="hsc-body">
            <div class="mini-av" :class="'sc-av-' + slowestSeller.avColor">
              {{ slowestSeller.initials }}
            </div>
            <div class="hsc-info">
              <div class="hsc-name poppins-semibold">{{ slowestSeller.name }}</div>
              <div class="hsc-company poppins-regular">{{ slowestSeller.company }}</div>
              <div class="hsc-metric poppins-medium red-text">
                <span class="material-symbols-outlined" style="font-size: 15px;">timer_off</span>
                {{ slowestSeller.tempoMedio }}h tempo médio
              </div>
            </div>
            <div class="hsc-stats">
              <div class="hsc-stat">
                <div class="hsc-stat-val poppins-semibold red-text">{{ slowestSeller.cotacoesParticipadas }}</div>
                <div class="hsc-stat-lbl poppins-regular">Cotações</div>
              </div>
              <div class="hsc-stat">
                <div class="hsc-stat-val poppins-semibold">{{ slowestSeller.taxaAceite }}%</div>
                <div class="hsc-stat-lbl poppins-regular">Aceite</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Lista de ranking de vendedores (cards empilhados no mobile) -->
        <div class="sellers-rank-list" v-if="sellersDetailed.length > 0">
          <div
            v-for="(s, i) in sellersDetailed"
            :key="s.name"
            class="seller-rank-card"
          >
            <span class="rank-num poppins-semibold" :class="['gold','silver','bronze'][i] || ''">
              {{ i + 1 }}
            </span>
            <div class="mini-av" :class="'sc-av-' + s.avColor">{{ s.initials }}</div>
            <div class="src-info">
              <div class="src-name poppins-semibold">{{ s.name }}</div>
              <div class="src-company poppins-regular">{{ s.company }}</div>
            </div>
            <div class="src-metrics">
              <div class="src-metric">
                <span class="src-metric-val poppins-semibold accent-text">{{ s.qtdVendas }}</span>
                <span class="src-metric-lbl poppins-regular">Vendas</span>
              </div>
              <div class="src-metric">
                <span
                  class="src-tag poppins-medium"
                  :class="s.tempoMedio <= 4 ? 'tag-green' : s.tempoMedio <= 12 ? 'tag-orange' : 'tag-red'"
                >
                  {{ s.tempoMedio <= 4 ? 'Ágil' : s.tempoMedio <= 12 ? 'Regular' : 'Lento' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-sellers-state">
          <span class="material-symbols-outlined">person_off</span>
          <p class="poppins-regular">Nenhum vendedor no período</p>
        </div>

        <!-- ══ PRODUTOS ══ -->
        <div class="section-header mt-20" style="margin-top: 50px; margin-bottom: 20px;">
          <div class="sh-icon c-yellow">
            <span class="material-symbols-outlined">inventory_2</span>
          </div>
          <div>
            <h2 class="sh-title poppins-semibold">Produtos em Destaque</h2>
            <p class="sh-sub poppins-regular">Mais comprado no período</p>
          </div>
        </div>

        <div class="top-product-card" v-if="topProduct.name !== '—'">
          <div class="tpc-rank poppins-semibold">#1</div>
          <div class="tpc-info">
            <div class="tpc-name poppins-semibold">{{ topProduct.name }}</div>
            <div class="tpc-code poppins-regular">
              <span class="material-symbols-outlined" style="font-size:12px">barcode</span>
              {{ topProduct.barcode }}
            </div>
            <span class="tpc-cat poppins-medium">{{ topProduct.category }}</span>
          </div>
          <div class="tpc-metrics">
            <div class="tpc-metric">
              <div class="tpcm-val poppins-semibold accent-text">{{ topProduct.cotacoes }}</div>
              <div class="tpcm-lbl poppins-regular">Cotações</div>
            </div>
            <div class="tpc-metric">
              <div class="tpcm-val poppins-semibold">{{ topProduct.totalUnits }}</div>
              <div class="tpcm-lbl poppins-regular">Unidades</div>
            </div>
            <div class="tpc-metric">
              <div class="tpcm-val poppins-semibold green-text">R$ {{ topProduct.avgPrice }}</div>
              <div class="tpcm-lbl poppins-regular">Preço médio</div>
            </div>
          </div>
        </div>

        <!-- Outros produtos do top -->
        <div
          class="other-product-row"
          v-for="(p, i) in otherTopProducts"
          :key="p.barcode"
        >
          <span class="opr-rank poppins-regular">#{{ i + 2 }}</span>
          <div class="opr-info">
            <div class="opr-name poppins-medium">{{ p.name }}</div>
            <div class="opr-code poppins-regular">{{ p.barcode }}</div>
          </div>
          <div class="opr-bar-wrap">
            <div class="opr-bar-fill" :style="{ width: p.pct + '%' }"></div>
          </div>
          <span class="opr-qty poppins-medium">{{ p.totalUnits }}</span>
        </div>

        <!-- ══ ÚLTIMA COTAÇÃO ══ -->
        <div class="section-header mt-20" style="margin-top: 50px; margin-bottom: 20px;">
          <div class="sh-icon c-blue">
            <span class="material-symbols-outlined">receipt_long</span>
          </div>
          <div>
            <h2 class="sh-title poppins-semibold">Última Cotação</h2>
            <p class="sh-sub poppins-regular">Detalhes da cotação mais recente</p>
          </div>
        </div>

        <div class="last-cotacao-card">
          <div class="lcc-header">
            <div class="lcc-name-wrap" style="background: #eff6ff;">
              <div class="lcc-icon">
                <span class="material-symbols-outlined">description</span>
              </div>
              <div style="background: #eff6ff;">
                <div class="lcc-name poppins-semibold" style="background: #eff6ff;">{{ lastCotacao.name }}</div>
                <div class="lcc-date poppins-regular" style="background: #eff6ff;">
                  <span class="material-symbols-outlined" style="font-size:12px">schedule</span>
                  {{ lastCotacao.date }}
                </div>
              </div>
            </div>
            <span class="lcc-status-tag poppins-medium">{{ lastCotacao.status }}</span>
          </div>

          <div class="lcc-details">
            <div class="lcc-detail-row">
              <div class="lcc-detail-lbl poppins-regular">
                <span class="material-symbols-outlined" style="font-size:14px">person</span>
                Criada por
              </div>
              <span class="lcc-detail-val poppins-medium">{{ lastCotacao.createdBy }}</span>
            </div>
            <div class="lcc-detail-row">
              <div class="lcc-detail-lbl poppins-regular">
                <span class="material-symbols-outlined" style="font-size:14px">inventory</span>
                Itens
              </div>
              <span class="lcc-detail-val poppins-medium">{{ lastCotacao.items }} produtos</span>
            </div>
            <div class="lcc-detail-row">
              <div class="lcc-detail-lbl poppins-regular">
                <span class="material-symbols-outlined" style="font-size:14px">local_offer</span>
                Fornecedores
              </div>
              <span class="lcc-detail-val poppins-medium">{{ lastCotacao.suppliers }} participantes</span>
            </div>
            <div class="lcc-detail-row lcc-total-row">
              <div class="lcc-detail-lbl poppins-regular">
                <span class="material-symbols-outlined" style="font-size:14px">attach_money</span>
                Valor total
              </div>
              <span class="lcc-total-val poppins-semibold accent-text">R$ {{ lastCotacao.total }}</span>
            </div>
          </div>
        </div>

        <!-- Footer info -->
        <div class="dash-footer">
          <span class="poppins-regular">Última atualização: {{ lastUpdate }}</span>
        </div>

      </div>

    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonPage, IonContent, IonSpinner, IonRefresher, 
  IonRefresherContent, } from '@ionic/vue';
import VueApexCharts from 'vue3-apexcharts';
import { api } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import RefresherIonic from '@/components/refresherIonic.vue';

export default defineComponent({
  name: 'DashboardCotacaoMobile',

  components: {
    IonPage,
    IonContent,
    IonSpinner,
    IonRefresher, 
    IonRefresherContent,
    apexchart: VueApexCharts,
    RefresherIonic
  },

  data() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

    return {
      // Auth
      auth: null as any,

      // Estados de UI
      loadingDashboard: false,
      error: false,

      // Filtros
      activePeriod: 'mes' as string,
      dateFrom: firstDay.toISOString().slice(0, 10),
      dateTo: today.toISOString().slice(0, 10),
      sellerRankFilter: 'Vendas' as string,
      barcodeSearch: '' as string,
      _searchTimeout: null as any,

      periodPresets: [
        { key: 'hoje',      label: 'Hoje' },
        { key: 'semana',    label: 'Semana' },
        { key: 'mes',       label: 'Mês' },
        { key: 'trimestre', label: 'Trimestre' },
        { key: 'ano',       label: 'Ano' },
      ],

      // ── KPIs da API ──
      totalCotacoes: 0 as number,
      cotacoesConcluidas: 0 as number,
      cotacoesPendentes: 0 as number,
      cotacoesCanceladas: 0 as number,
      valorTotalComprado: 0 as number,
      deltaValorPct: null as number | null,
      economiaGerada: 0 as number,
      deltaCotacoes: 0 as number,
      cotacoesUp: true as boolean,
      valorUp: null as boolean | null,

      // ── Mini KPIs ──
      taxaConclusaoApi: 0 as number,
      valorMedioCotacao: '0,00' as string,
      avgMin: '0,00' as string,
      avgMax: '0,00' as string,
      deltaValorMedioPct: null as number | null,
      avgUp: null as boolean | null,
      fornecedoresAtivos: 0 as number,

      // ── Vendedores ──
      sellersDetalhadosApi: [] as any[],
      fastestSellerApi: null as any,
      slowestSellerApi: null as any,
      topSellerApi: null as any,

      // ── Produtos ──
      topProductApi: null as any,
      otherTopProductsApi: [] as any[],

      // ── Última cotação ──
      lastCotacaoApi: null as any,

      // ── Busca produto / gráfico de preço ──
      selectedProduct: null as any,
      priceEvoData: null as any,

      // ── Dados do gráfico de volume ──
      volumeChartData: null as any,

      lastUpdate: new Date().toLocaleString('pt-BR'),
    };
  },

  computed: {
    taxaConclusao(): number {
      if (this.taxaConclusaoApi && this.taxaConclusaoApi !== 0) return this.taxaConclusaoApi;
      if (!this.totalCotacoes) return 0;
      return Math.round((this.cotacoesConcluidas / this.totalCotacoes) * 100);
    },

    periodLabel(): string {
      const labels: Record<string, string> = {
        hoje: 'Hoje',
        semana: 'Esta Semana',
        mes: 'Este Mês',
        trimestre: 'Último Trimestre',
        ano: 'Este Ano',
        custom: `${this.dateFrom} até ${this.dateTo}`,
      };
      return labels[this.activePeriod] || 'Período Personalizado';
    },

    mainKpis(): any[] {
      const deltaCotacoesStr = this.deltaCotacoes != null
        ? `${this.cotacoesUp ? '+' : ''}${this.deltaCotacoes}`
        : '—';
      const deltaValorStr = this.deltaValorPct != null
        ? `${this.deltaValorPct > 0 ? '+' : ''}${this.deltaValorPct}%`
        : '—';

      return [
        {
          label: 'Cotações Criadas',
          value: this.totalCotacoes.toString(),
          icon: 'request_quote',
          cls: 'k-orange',
          delta: deltaCotacoesStr,
          up: this.cotacoesUp,
        },
        {
          label: 'Concluídas',
          value: this.cotacoesConcluidas.toString(),
          icon: 'task_alt',
          cls: 'k-green',
          delta: deltaCotacoesStr,
          up: this.cotacoesUp,
        },
        {
          label: 'Valor Comprado',
          value: `R$ ${this.formatVal(this.valorTotalComprado)}`,
          icon: 'payments',
          cls: 'k-blue',
          delta: deltaValorStr,
          up: this.valorUp,
        },
        {
          label: 'Economia Gerada',
          value: `R$ ${this.formatVal(this.economiaGerada)}`,
          icon: 'savings',
          cls: 'k-yellow',
          delta: '—',
          up: null,
        },
      ];
    },

    miniKpis(): any[] {
      const deltaValorMedioStr = this.deltaValorMedioPct != null
        ? `${Math.abs(this.deltaValorMedioPct)}%`
        : null;

      return [
        {
          label: 'Conclusão',
          value: `${this.taxaConclusao}%`,
          trend: null,
          up: null,
          sub: 'do período',
        },
        {
          label: 'Pendentes',
          value: this.cotacoesPendentes.toString(),
          trend: null,
          up: null,
          sub: 'aguardando',
        },
        {
          label: 'Valor Médio',
          value: `R$ ${this.valorMedioCotacao}`,
          trend: deltaValorMedioStr,
          up: this.avgUp,
          sub: 'por cotação',
        },
        {
          label: 'Fornecedores',
          value: this.fornecedoresAtivos.toString(),
          trend: null,
          up: null,
          sub: 'no período',
        },
      ];
    },

    sellersSummary(): any[] {
      return this.sellersDetalhadosApi || [];
    },

    sellersDetailed(): any[] {
      const sorted = [...this.sellersSummary];
      if (this.sellerRankFilter === 'Vendas') sorted.sort((a, b) => b.qtdVendas - a.qtdVendas);
      else if (this.sellerRankFilter === 'Cotações') sorted.sort((a, b) => b.cotacoesParticipadas - a.cotacoesParticipadas);
      else if (this.sellerRankFilter === 'Resposta') sorted.sort((a, b) => a.tempoMedio - b.tempoMedio);
      else if (this.sellerRankFilter === 'Aceite') sorted.sort((a, b) => b.taxaAceite - a.taxaAceite);
      return sorted;
    },

    fastestSeller(): any {
      if (this.fastestSellerApi) return this.fastestSellerApi;
      if (!this.sellersSummary.length) return { name: '—', company: '—', initials: '—', avColor: 'orange', tempoMedio: 0, cotacoesParticipadas: 0, taxaAceite: 0, qtdVendas: 0 };
      return [...this.sellersSummary].sort((a, b) => a.tempoMedio - b.tempoMedio)[0];
    },

    slowestSeller(): any {
      if (this.slowestSellerApi) return this.slowestSellerApi;
      if (!this.sellersSummary.length) return { name: '—', company: '—', initials: '—', avColor: 'orange', tempoMedio: 0, cotacoesParticipadas: 0, taxaAceite: 0, qtdVendas: 0 };
      return [...this.sellersSummary].sort((a, b) => b.tempoMedio - a.tempoMedio)[0];
    },

    topProduct(): any {
      if (this.topProductApi) {
        return {
          name: this.topProductApi.nome,
          barcode: this.topProductApi.codigo_barra || '—',
          category: this.topProductApi.categoria || 'Sem categoria',
          totalUnits: this.topProductApi.totalUnits,
          cotacoes: this.topProductApi.cotacoes,
          avgPrice: this.formatVal(this.topProductApi.avgPrice),
        };
      }
      return { name: '—', barcode: '—', category: '—', totalUnits: 0, cotacoes: 0, avgPrice: '0,00' };
    },

    otherTopProducts(): any[] {
      if (this.otherTopProductsApi?.length > 0) {
        return this.otherTopProductsApi.map((p: any) => ({
          name: p.nome,
          barcode: p.codigo_barra || '—',
          totalUnits: p.totalUnits,
          pct: p.pct || 0,
        }));
      }
      return [];
    },

    lastCotacao(): any {
      if (this.lastCotacaoApi) {
        return {
          name: this.lastCotacaoApi.name || '—',
          date: this.lastCotacaoApi.date || '—',
          status: this.lastCotacaoApi.status || '—',
          createdBy: this.lastCotacaoApi.createdBy || '—',
          items: this.lastCotacaoApi.items ?? 0,
          suppliers: this.lastCotacaoApi.suppliers ?? 0,
          total: this.lastCotacaoApi.total || '0,00',
        };
      }
      return { name: '—', date: '—', status: '—', createdBy: '—', items: 0, suppliers: 0, total: '0,00' };
    },

    avgDelta(): number {
      return this.deltaValorMedioPct != null ? Math.abs(this.deltaValorMedioPct) : 0;
    },

    // ── Séries para o gráfico de volume ──
    volumeSeries(): any[] {
      if (this.volumeChartData?.datasets) {
        const datasets = this.volumeChartData.datasets;
        return [
          { name: 'Criadas', data: datasets[0]?.data || [] },
          { name: 'Concluídas', data: datasets[1]?.data || [] },
        ];
      }
      return [
        { name: 'Criadas', data: [] as number[] },
        { name: 'Concluídas', data: [] as number[] },
      ];
    },

    volumeChartOptions(): any {
      return {
        chart: {
          type: 'bar',
          toolbar: { show: false },
          animations: { enabled: true },
        },
        colors: ['#FF8049', '#16a34a'],
        plotOptions: {
          bar: { borderRadius: 4, columnWidth: '60%' },
        },
        dataLabels: { enabled: false },
        xaxis: {
          categories: this.volumeChartData?.labels || [],
          tickAmount: 4,
          labels: {
            rotate: 0,
            hideOverlappingLabels: true,
            style: { colors: '#94a3b8', fontSize: '10px' },
          },
          axisBorder: { show: false },
          axisTicks: { show: false },
        },
        yaxis: {
          min: 0,
          forceNiceScale: true,
          labels: { style: { colors: '#94a3b8', fontSize: '10px' } },
        },
        grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
        legend: {
          position: 'top',
          horizontalAlign: 'right',
          fontSize: '11px',
          labels: { colors: ['#64748b'] },
        },
        tooltip: {
          y: { title: { formatter: (name: string) => name + ':' } },
        },
      };
    },

    // ── Séries para o gráfico de evolução de preço ──
    priceEvoSeries(): any[] {
      if (this.priceEvoData) {
        return [{
          name: 'Preço (R$)',
          data: this.priceEvoData.precos || [],
        }];
      }
      return [{ name: 'Preço (R$)', data: [] as number[] }];
    },

    priceEvoChartOptions(): any {
      return {
        chart: {
          type: 'area',
          toolbar: { show: false },
          animations: { enabled: true },
        },
        colors: ['#FF8049'],
        fill: {
          type: 'gradient',
          gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 90, 100] },
        },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 2 },
        xaxis: {
          categories: this.priceEvoData?.labels || [],
          tickAmount: 4,
          labels: {
            rotate: 0,
            hideOverlappingLabels: true,
            style: { colors: '#94a3b8', fontSize: '10px' },
          },
          axisBorder: { show: false },
          axisTicks: { show: false },
        },
        yaxis: {
          min: 0,
          forceNiceScale: true,
          labels: {
            style: { colors: '#94a3b8', fontSize: '10px' },
            formatter: (v: number) => `R$ ${v.toFixed(2)}`,
          },
        },
        grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
        tooltip: {
          y: {
            formatter: (v: number) => `R$ ${v.toFixed(2)}`,
            title: { formatter: () => 'Preço:' },
          },
        },
      };
    },
  },

  methods: {
    formatVal(v: any): string {
      if (v == null) return '0,00';
      return Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },

    async carregarDashboard() {
      this.loadingDashboard = true;
      this.error = false;

      try {
        const authStore = useAuthStore();

        

        this.auth = authStore;

        const payload = {
          timestamp_inicio: new Date(this.dateFrom).getTime(),
          timestamp_fim: new Date(this.dateTo + 'T23:59:59').getTime(),
        };

        const res = await api.post(
          `/mvpu/cotacao/getDashboardCotacao/${authStore.loja.id_loja}`,
          payload
        );

        const d = res.data?.data;
        if (!d) return;

        // KPIs principais
        const k = d.kpis || {};
        this.totalCotacoes       = k.totalCotacoes       ?? 0;
        this.cotacoesConcluidas  = k.cotacoesConcluidas  ?? 0;
        this.cotacoesPendentes   = k.cotacoesPendentes   ?? 0;
        this.cotacoesCanceladas  = k.cotacoesCanceladas  ?? 0;
        this.valorTotalComprado  = k.valorTotalComprado  ?? 0;
        this.deltaValorPct       = k.deltaValorPct       ?? null;
        this.economiaGerada      = k.economiaGerada      ?? 0;
        this.deltaCotacoes       = k.deltaCotacoes       ?? 0;
        this.cotacoesUp          = k.cotacoesUp          ?? true;
        this.valorUp             = k.valorUp             ?? null;

        // Mini KPIs
        const mk = d.miniKpis || {};
        this.taxaConclusaoApi   = mk.taxaConclusao      ?? 0;
        this.cotacoesPendentes  = mk.cotacoesPendentes  ?? this.cotacoesPendentes;
        this.valorMedioCotacao  = mk.valorMedioCotacao != null ? this.formatVal(mk.valorMedioCotacao) : '0,00';
        this.avgMin             = mk.avgMin != null ? this.formatVal(mk.avgMin) : '0,00';
        this.avgMax             = mk.avgMax != null ? this.formatVal(mk.avgMax) : '0,00';
        this.deltaValorMedioPct = mk.deltaValorMedioPct ?? null;
        this.avgUp              = mk.avgUp              ?? null;
        this.fornecedoresAtivos = mk.fornecedoresAtivos ?? 0;

        // Vendedores
        const sellers = d.sellers || {};
        this.sellersDetalhadosApi = sellers.detalhados    || [];
        this.fastestSellerApi     = sellers.fastestSeller || null;
        this.slowestSellerApi     = sellers.slowestSeller || null;
        this.topSellerApi         = sellers.topSeller     || null;

        // Produtos
        const produtos = d.produtos || {};
        this.topProductApi       = produtos.topProduct       || null;
        this.otherTopProductsApi = produtos.otherTopProducts || [];

        // Volume chart
        this.volumeChartData = d.volumeChartData || null;

        // Última cotação
        this.lastCotacaoApi = d.lastCotacao || null;

        this.lastUpdate = new Date().toLocaleString('pt-BR');

      } catch (err) {
        
        this.error = true;
      } finally {
        this.loadingDashboard = false;
      }
    },
    handleRefresh(event: any) {
      // O evento 'complete()' para o spinner do Ionic antes do reload total
      setTimeout(() => {
        event.target.complete();
        window.location.reload();
      }, 1000);
    },
    setPreset(key: string) {
      this.activePeriod = key;
      this.barcodeSearch = '';
      this.selectedProduct = null;
      this.priceEvoData = null;

      const today = new Date();
      this.dateTo = today.toISOString().slice(0, 10);

      if (key === 'hoje') {
        this.dateFrom = today.toISOString().slice(0, 10);
      } else if (key === 'semana') {
        const d = new Date(today);
        d.setDate(d.getDate() - 7);
        this.dateFrom = d.toISOString().slice(0, 10);
      } else if (key === 'mes') {
        this.dateFrom = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
      } else if (key === 'trimestre') {
        const d = new Date(today);
        d.setMonth(d.getMonth() - 3);
        this.dateFrom = d.toISOString().slice(0, 10);
      } else if (key === 'ano') {
        this.dateFrom = new Date(today.getFullYear(), 0, 1).toISOString().slice(0, 10);
      }

      this.refreshData();
    },

    refreshData() {
      this.carregarDashboard();
    },

    debouncedSearch() {
      clearTimeout(this._searchTimeout);
      this._searchTimeout = setTimeout(() => this.searchProduct(), 1200);
    },

    async searchProduct() {
      const q = this.barcodeSearch.trim();
      if (!q) {
        this.selectedProduct = null;
        this.priceEvoData = null;
        return;
      }

      try {
        const authStore = useAuthStore();


        const payload = {
          codigo_barra: q,
          timestamp_inicio: new Date(this.dateFrom).getTime(),
          timestamp_fim: new Date(this.dateTo + 'T23:59:59').getTime(),
        };

        const res = await api.post(
          `/mvpu/cotacao/getEvolucaoPrecoProduto/${authStore.loja.id_loja}`,
          payload
        );

        const d = res.data?.data;
        if (!d || d.semDados) {
          this.priceEvoData = null;
          this.selectedProduct = null;
          return;
        }

        const prod = d.produto || {};
        this.selectedProduct = {
          barcode: prod.barcode || q,
          name: prod.name || q,
          category: prod.category || 'Sem categoria',
          lastPrice: prod.lastPrice || '0,00',
          priceChange: prod.priceChange ?? 0,
          totalQuotes: prod.totalQuotes ?? 0,
        };


        

        this.priceEvoData = d.priceEvoChart || null;

      } catch (e) {
        
      }
    },
  },

  mounted() {
    const authStore = useAuthStore();
    if (!authStore.token && !localStorage.getItem('token')) {
      this.$router.replace({ name: 'Login' });
      return;
    }
    this.carregarDashboard();
  },
});
</script>

<style scoped>

/* ══ PAGE & CONTENT ══ */
.dash-cotacao-page {
  background-color: #f8fafc;
}
.dash-content {
  --background: #FFF;
}

/* ══ HEADER ══ */
.dc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-top: 4px;
}
.dc-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.dc-brand-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #ff8049, #ff9a6a);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(255, 128, 73, 0.3);
  flex-shrink: 0;
}
.dc-brand-icon span {
  font-size: 22px;
  color: #fff;
}
.dc-title {
  font-size: 18px;
  color: #1e293b;
  margin: 0;
  line-height: 1.2;
}
.dc-subtitle {
  font-size: 11px;
  color: #94a3b8;
  margin: 0;
}
.dc-header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.dc-sync-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 20px;
  padding: 4px 10px;
  font-size: 10px;
  color: #16a34a;
}
.sync-dot {
  width: 6px;
  height: 6px;
  background: #16a34a;
  border-radius: 50%;
  animation: pulse-dot 2s infinite;
}
@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
.dc-refresh-btn {
  width: 34px;
  height: 34px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}
.dc-refresh-btn span {
  font-size: 18px;
  color: #64748b;
  transition: transform 0.3s;
}
.dc-refresh-btn.spinning span {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

/* ══ PERIOD FILTER ══ */
.period-scroll-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin: 0 -16px 12px;
  padding: 0 16px;
  scrollbar-width: none;
}
.period-scroll-wrap::-webkit-scrollbar { display: none; }
.period-chips-row {
  display: flex;
  gap: 8px;
  width: max-content;
}
.pchip {
  padding: 6px 14px;
  border-radius: 20px;
  background: #fff;
  border: 1px solid #e2e8f0;
  font-size: 12px;
  color: #475569;
  white-space: nowrap;
  transition: all 0.2s;
}
.pchip.active {
  background: #ff8049;
  border-color: #ff8049;
  color: #fff;
  box-shadow: 0 4px 10px rgba(255, 128, 73, 0.3);
}

/* ══ PERIOD SUMMARY BAR ══ */
.period-summary-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 10px 14px;
  margin-bottom: 16px;
}
.psb-left {
  display: flex;
  align-items: center;
  gap: 6px;
}
.psb-icon {
  font-size: 16px;
  color: #ff8049;
}
.psb-label {
  font-size: 13px;
  color: #334155;
}
.psb-count {
  font-size: 16px;
  color: #1e293b;
}
.psb-count-lbl {
  font-size: 12px;
  color: #94a3b8;
}

/* ══ LOADING / ERROR ══ */
.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  text-align: center;
  gap: 10px;
}
.loading-state p, .error-state p { font-size: 14px; color: #64748b; }
.error-icon { font-size: 52px; color: #ef4444; }
.error-state h3 { font-size: 16px; color: #1e293b; margin: 0; }
.retry-btn {
  margin-top: 10px;
  padding: 10px 24px;
  background: #ff8049;
  color: white;
  border-radius: 12px;
  border: none;
  font-size: 14px;
}

/* ══ MINI STATS ROW ══ */
.mini-stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 18px;
}

@media(max-width: 410px){
    .mini-stats-row {
        grid-template-columns: repeat(2, 1fr);
    }
}

.mini-stat-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 10px 8px;
  text-align: center;
}
.ms-value {
  font-size: 15px;
  color: #1e293b;
  line-height: 1.2;
}
.ms-label {
  font-size: 9px;
  color: #94a3b8;
  margin: 3px 0 2px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.ms-sub {
  font-size: 9px;
  color: #94a3b8;
}

/* ══ SECTION HEADER ══ */
.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}
.sh-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.sh-icon span { font-size: 18px; }
.c-orange { background: #fff7ed; color: #ff8049; }
.c-orange span { color: #ff8049; }
.c-green  { background: #f0fdf4; color: #16a34a; }
.c-green span  { color: #16a34a; }
.c-blue   { background: #eff6ff; color: #2563eb; }
.c-blue span   { color: #2563eb; }
.c-yellow { background: #fefce8; color: #ca8a04; }
.c-yellow span { color: #ca8a04; }
.sh-title {
  font-size: 15px;
  color: #1e293b;
  margin: 0;
}
.sh-sub {
  font-size: 11px;
  color: #94a3b8;
  margin: 0;
}

/* ══ KPI GRID ══ */
.kpi-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 18px;
}
.kpi-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 14px;
  position: relative;
  overflow: hidden;
}
.kpi-icon-wrap {
  margin-bottom: 10px;
}
.kpi-icon {
  font-size: 22px;
}
.kpi-bg-icon {
  position: absolute;
  right: -8px;
  bottom: -8px;
  font-size: 64px;
  opacity: 0.05;
}
.kpi-label {
  font-size: 11px;
  color: #64748b;
  margin-bottom: 4px;
  line-height: 1.3;
}
.kpi-value {
  font-size: 18px;
  color: #1e293b;
  margin-bottom: 6px;
  letter-spacing: -0.5px;
}
.kpi-footer {
  display: flex;
  align-items: center;
  gap: 3px;
}
.kpi-delta {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 10px;
}
.kpi-delta .delta-icon { font-size: 12px; }
.kpi-delta.up      { color: #16a34a; }
.kpi-delta.down    { color: #ef4444; }
.kpi-delta.neutral { color: #94a3b8; }
.kpi-vs {
  font-size: 9px;
  color: #94a3b8;
}

/* KPI color variants */
.k-orange { border-top: 3px solid #ff8049; }
.k-orange .kpi-icon { color: #ff8049; }
.k-green  { border-top: 3px solid #16a34a; }
.k-green .kpi-icon  { color: #16a34a; }
.k-blue   { border-top: 3px solid #2563eb; }
.k-blue .kpi-icon   { color: #2563eb; }
.k-yellow { border-top: 3px solid #ca8a04; }
.k-yellow .kpi-icon { color: #ca8a04; }

/* ══ CHART CARD ══ */
.chart-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 14px;
  margin-bottom: 6px;
  overflow: hidden;
}
.empty-chart-state {
  height: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.empty-chart-state span {
  font-size: 36px;
  color: #e2e8f0;
}
.empty-chart-state p {
  font-size: 12px;
  color: #94a3b8;
  text-align: center;
  margin: 0;
}

/* Volume summary strip */
.volume-summary-strip {
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-top: 1px solid #f1f5f9;
  padding-top: 12px;
  margin-top: 4px;
}
.vs-item { text-align: center; }
.vs-val { font-size: 17px; color: #1e293b; display: block; }
.vs-lbl { font-size: 10px; color: #94a3b8; }
.vs-sep { width: 1px; height: 30px; background: #f1f5f9; }

/* ══ BARCODE SEARCH ══ */
.barcode-search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 8px 12px;
  margin-bottom: 12px;
}
.bs-icon { font-size: 18px; color: #94a3b8; }
.bs-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 13px;
  color: #334155;
  outline: none;
}
.bs-input::placeholder { color: #cbd5e1; }
.bs-btn {
  background: #ff8049;
  border: none;
  border-radius: 8px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.bs-btn span { font-size: 16px; color: #fff; }

/* Selected product bar */
.selected-product-bar {
  background: #fff7ed;
  border: 1px solid #fed7aa;
  border-radius: 12px;
  padding: 10px 12px;
  margin-bottom: 10px;
}
.spb-top {
  display: flex;
  justify-content: space-between;
  background: #fff7ed;
  align-items: flex-start;
  margin-bottom: 8px;
}
.spb-name { font-size: 13px; color: #1e293b; display: block; background: #fff7ed;}
.spb-code { font-size: 10px; color: #94a3b8; font-family: monospace;  background: #fff7ed;}
.spb-cat {
  background: #dbeafe;
  color: #2563eb;
  border-radius: 8px;
  padding: 2px 8px;
  font-size: 10px;
  white-space: nowrap;
}
.spb-stats-row {
  display: flex;
  gap: 16px;
}
.spb-stat { text-align: center; }
.spb-stat-val { font-size: 13px; color: #1e293b; display: block; }
.spb-stat-lbl { font-size: 10px; color: #94a3b8; }

/* ══ AVG QUOTE CARD ══ */
.avg-quote-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-top: 3px solid #ff8049;
  border-radius: 16px;
  padding: 14px;
  margin-bottom: 6px;
}
.aqc-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}
.aqc-hicon { font-size: 16px; color: #ff8049; }
.aqc-hlabel { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.4px; }
.aqc-value { font-size: 28px; color: #ff8049; letter-spacing: -0.8px; margin-bottom: 4px; }
.aqc-delta { font-size: 12px; color: #94a3b8; margin-bottom: 14px; }
.aqc-breakdown {
  display: flex;
  align-items: center;
  justify-content: space-around;
  border-top: 1px solid #f1f5f9;
  padding-top: 12px;
}
.aqc-b-item { text-align: center; }
.aqc-b-val { font-size: 14px; color: #1e293b; display: block; }
.aqc-b-lbl { font-size: 10px; color: #94a3b8; }
.aqc-b-sep { width: 1px; height: 30px; background: #f1f5f9; }

/* ══ CHIP FILTER ══ */
.chip-filter-row {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding-bottom: 2px;
}
.chip-filter-row::-webkit-scrollbar { display: none; }
.chip {
  padding: 5px 14px;
  border-radius: 20px;
  background: #f1f5f9;
  border: none;
  font-size: 12px;
  color: #475569;
  white-space: nowrap;
  transition: all 0.2s;
}
.chip.active {
  background: #1e293b;
  color: #fff;
}

/* ══ HIGHLIGHT SELLER CARDS ══ */
.highlight-seller-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
}
.highlight-green { border-top: 3px solid #16a34a; }
.highlight-red   { border-top: 3px solid #ef4444; }

.hsc-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 12px;
  color: #475569;
}
.hsc-badge-icon { font-size: 16px; color: #94a3b8; }
.hsc-body {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
}
.hsc-info { flex: 1; min-width: 0; }
.hsc-name { font-size: 14px; color: #1e293b; }
.hsc-company { font-size: 11px; color: #94a3b8; margin: 1px 0 4px; }
.hsc-metric {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
}
.hsc-stats { display: flex; gap: 14px; flex-shrink: 0; }
.hsc-stat { text-align: right; }
.hsc-stat-val { font-size: 15px; color: #1e293b; display: block; }
.hsc-stat-lbl { font-size: 10px; color: #94a3b8; }

/* ══ SELLERS RANK LIST ══ */
.sellers-rank-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
}
.seller-rank-card {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 10px 12px;
}
.src-info { flex: 1; min-width: 0; }
.src-name { font-size: 13px; color: #1e293b; }
.src-company { font-size: 11px; color: #94a3b8; }
.src-metrics { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.src-metric { text-align: right; }
.src-metric-val { font-size: 15px; display: block; }
.src-metric-lbl { font-size: 10px; color: #94a3b8; }
.src-tag {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 8px;
  font-size: 11px;
}

.empty-sellers-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px;
  gap: 8px;
}
.empty-sellers-state span { font-size: 36px; color: #e2e8f0; }
.empty-sellers-state p { font-size: 13px; color: #94a3b8; margin: 0; }

/* ══ TOP PRODUCT CARD ══ */
.top-product-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-top: 3px solid #ca8a04;
  border-radius: 16px;
  padding: 14px;
  margin-bottom: 8px;
  position: relative;
}
.tpc-rank {
  font-size: 36px;
  color: #ca8a04;
  opacity: 0.2;
  line-height: 1;
  position: absolute;
  top: 10px;
  right: 14px;
}
.tpc-info { margin-bottom: 12px; }
.tpc-name { font-size: 14px; color: #1e293b; margin-bottom: 2px; }
.tpc-code {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  color: #94a3b8;
  font-family: monospace;
  margin-bottom: 6px;
}
.tpc-cat {
  background: #fefce8;
  color: #ca8a04;
  border-radius: 8px;
  padding: 2px 8px;
  font-size: 11px;
}
.tpc-metrics {
  display: flex;
  justify-content: space-around;
  border-top: 1px solid #f1f5f9;
  padding-top: 10px;
}
.tpc-metric { text-align: center; }
.tpcm-val { font-size: 16px; color: #1e293b; display: block; }
.tpcm-lbl { font-size: 10px; color: #94a3b8; }

/* Other top products */
.other-product-row {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  padding: 10px 12px;
  margin-bottom: 6px;
}
.opr-rank { font-size: 12px; color: #94a3b8; width: 20px; flex-shrink: 0; }
.opr-info { flex: 1; min-width: 0; }
.opr-name { font-size: 12px; color: #334155; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.opr-code { font-size: 10px; color: #94a3b8; font-family: monospace; }
.opr-bar-wrap {
  width: 60px;
  height: 5px;
  background: #f1f5f9;
  border-radius: 3px;
  overflow: hidden;
  flex-shrink: 0;
}
.opr-bar-fill { height: 100%; background: #ff8049; opacity: 0.5; border-radius: 3px; }
.opr-qty { font-size: 12px; color: #475569; width: 36px; text-align: right; flex-shrink: 0; }

/* ══ LAST COTAÇÃO CARD ══ */
.last-cotacao-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 6px;
}
.lcc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: #eff6ff;
  border-bottom: 1px solid #dbeafe;
  gap: 10px;
}
.lcc-name-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.lcc-icon {
  width: 36px;
  height: 36px;
  background: #dbeafe;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.lcc-icon span { font-size: 18px; color: #2563eb; }
.lcc-name { font-size: 13px; color: #1e3a8a; line-height: 1.3; }
.lcc-date {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  color: #3f648d;
}
.lcc-status-tag {
  background: #dbeafe;
  color: #2563eb;
  border-radius: 10px;
  padding: 3px 10px;
  font-size: 11px;
  white-space: nowrap;
  flex-shrink: 0;
}
.lcc-details { padding: 12px 14px; display: flex; flex-direction: column; gap: 10px; }
.lcc-detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.lcc-detail-lbl {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #94a3b8;
}
.lcc-detail-val { font-size: 13px; color: #334155; }
.lcc-total-row {
  border-top: 1px solid #f1f5f9;
  padding-top: 10px;
  margin-top: 2px;
}
.lcc-total-val { font-size: 16px; }

/* ══ AVATAR COLORS ══ */
.mini-av {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 800;
  color: #fff;
  flex-shrink: 0;
}
.sc-av-orange { background: linear-gradient(135deg, #ff8049, #ff9a6a); }
.sc-av-blue   { background: linear-gradient(135deg, #2563eb, #60a5fa); }
.sc-av-green  { background: linear-gradient(135deg, #16a34a, #4ade80); }
.sc-av-red    { background: linear-gradient(135deg, #ef4444, #f87171); }
.sc-av-purple { background: linear-gradient(135deg, #7c3aed, #a78bfa); }
.sc-av-yellow { background: linear-gradient(135deg, #ca8a04, #fbbf24); }

/* ══ RANK NUMBERS ══ */
.rank-num {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  background: #f1f5f9;
  color: #475569;
  flex-shrink: 0;
}
.rank-num.gold   { background: #fef3c7; color: #92400e; }
.rank-num.silver { background: #f1f5f9; color: #475569; }
.rank-num.bronze { background: #fff7ed; color: #c2410c; }

/* ══ STATUS TAGS ══ */
.tag-green  { background: #dcfce7; color: #16a34a; }
.tag-orange { background: #fef3c7; color: #ca8a04; }
.tag-red    { background: #fee2e2; color: #ef4444; }
.tag-blue   { background: #dbeafe; color: #2563eb; }

/* ══ TEXT UTILS ══ */
.accent-text { color: #ff8049; }
.green-text  { color: #16a34a; }
.red-text    { color: #ef4444; }
.yellow-text { color: #ca8a04; }

/* ══ FOOTER ══ */
.dash-footer {
  text-align: center;
  padding: 16px 0 4px;
  font-size: 11px;
  color: #cbd5e1;
}

/* ══ MISC ══ */
.mt-20 { margin-top: 20px; }

</style>