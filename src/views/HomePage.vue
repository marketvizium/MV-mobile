<template>
  <ion-page class="dashboard-page">
    <ion-content :fullscreen="true" class="ion-padding">

      <RefresherIonic />

      <div class="section-header">
        <h2 class="poppins-semibold">Conheça o Marviz!</h2>
      </div>

      <!-- =========================
          WIDGET PRINCIPAL - DICAS
      ========================== -->
      <Swiper
        class="main-tips-widget"
        :slides-per-view="1"
        :space-between="12"
        :loop="true"
        :autoplay="{ delay: 5000, disableOnInteraction: false }"
        :modules="swiperModules"
      >
        <SwiperSlide v-for="(tip, index) in tips" :key="index">
          <div class="tip-slide" :class="tip.variant || ''">
            <div class="tip-icon">
              <span class="material-symbols-outlined">{{ tip.icon }}</span>
            </div>

            <div class="tip-content" style="background-color: #00000000; color: #FFF;">
              <strong class="poppins-semibold">{{ tip.title }}</strong>
              <p class="poppins-regular">{{ tip.text }}</p>
            </div>

            <div v-if="tip.badge" class="tip-badge">{{ tip.badge }}</div>
          </div>
        </SwiperSlide>
      </Swiper>

      <div class="quick-widgets" style="margin-bottom: 20px; margin-top: 5px;">

        <!-- Widget 1 — Ação rápida -->
        <div class="quick-widget action-widget" style="cursor: pointer;" @click="$router.push({name: 'Cotacoes'})">
          <div class="widget-left">
            <span class="material-symbols-outlined">bolt</span>
          </div>

          <div class="widget-content" >
            <strong class="poppins-semibold">Ações rápidas</strong>
            <p class="poppins-regular">
              Veja cotações abertas e responda antes dos concorrentes.
            </p>
          </div>

          <span class="material-symbols-outlined widget-arrow">chevron_right</span>
        </div>

        <!-- Widget 2 — Descoberta -->
        <div class="quick-widget discover-widget" style="cursor: pointer;" @click="$router.push({name: 'Explorar'})">
          <div class="widget-left">
            <span class="material-symbols-outlined">explore</span>
          </div>

          <div class="widget-content">
            <strong class="poppins-semibold">Descubra novas lojas</strong>
            <p class="poppins-regular">
              Encontre parceiros próximos para aumentar suas vendas.
            </p>
          </div>

          <span class="material-symbols-outlined widget-arrow">chevron_right</span>
        </div>

      </div>

      <div class="section-header">
        <h2 class="poppins-semibold">Minha Atividade</h2>
      </div>

      <div v-if="loading" class="loading-state">
        <ion-spinner name="crescent" color="primary"></ion-spinner>
        <p class="poppins-regular">Buscando estatísticas...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <span class="material-symbols-outlined error-icon">cloud_off</span>
        <h3 class="poppins-semibold">Ops! Algo deu errado.</h3>
        <p class="poppins-regular">Não conseguimos carregar seus dados agora.</p>
        <button class="retry-btn poppins-medium" @click="fetchDashboardData">
          Tentar novamente
        </button>
      </div>

      <div v-else>
        <div v-if="temDados" class="stats-container" style="padding-bottom: 20px;">
          
          <div class="chart-card">
            <div class="chart-header">
              <div>
                <h3 class="poppins-medium">Cotações Participadas</h3>
                <p class="chart-sub"><span class="blue-dot"></span> Índice por dia</p>
              </div>
            </div>
            
            <div id="chart">
              <apexchart 
                v-if="series[0].data.length > 0 && series[0].data.some(v => v > 0)"
                type="area" 
                height="200" 
                :options="chartOptions" 
                :series="series"
              ></apexchart>

              <div v-else class="empty-chart-state">
                <div class="empty-chart-content">
                  <span class="material-symbols-outlined">auto_graph</span>
                  <h4 class="poppins-medium">Acompanhe sua evolução</h4>
                  <p class="poppins-regular">Participe de novas cotações para visualizar o índice de atividade diária aqui.</p>
                </div>
              </div>
            </div>
          </div>

          <div class="stats-grid" v-if="estatisticas && estatisticas.length > 0">
            <div class="stat-card" v-for="stat in estatisticas" :key="stat.label">
              <div class="stat-card-header">
                <div class="icon-wrapper" :style="{ backgroundColor: stat.bgColor || '#f1f5f9' }">
                  <span class="material-symbols-outlined" :style="{ color: stat.color || '#64748b' }">
                    {{ stat.icon || 'monitoring' }}
                  </span>
                </div>
              </div>
              <p class="stat-label poppins-regular">{{ stat.label }}</p>
              <h4 class="stat-value poppins-semibold">
                {{ stat.value && stat.value !== 'null' ? stat.value : '0' }}
              </h4>
              <p class="stat-percentage" :class="stat.trendUp ? 'trend-up' : 'trend-down'"></p>
            </div>
          </div>

          <div v-else class="empty-stats-placeholder">
            <div class="empty-stats-content">
              <span class="material-symbols-outlined">leaderboard</span>
              <p class="poppins-medium">Aguardando dados...</p>
              <span class="sub-text poppins-regular">Suas métricas de desempenho aparecerão aqui.</span>
            </div>
          </div>

          <div class="section-header mt-20">
            <h2 class="poppins-semibold">Minhas Cotações</h2>
          </div>
          
          <div class="quote-item" v-if="cotacoesRecentes?.length>0" v-for="quote in cotacoesRecentes" style="cursor: pointer;" @click="navigateToDetails(quote)" :key="quote.id">
            <div class="quote-icon">
              <span class="material-symbols-outlined">person</span>
            </div>
            <div class="quote-info">
              <h4 class="poppins-medium">{{ quote.nome }}</h4>
              <p class="poppins-regular">{{ quote.loja }}</p>
            </div>
            <div class="quote-status">
              <p class="date">Abrirá em: {{ quote.data }}</p>
              <span class="status-badge">{{ quote.status }}</span>
            </div>
          </div>
          <div v-else class="empty-quotes-card">
            <div class="empty-content">
              <div class="icon-circle">
                <span class="material-symbols-outlined">deployed_code_history</span>
              </div>
              <h3 class="poppins-medium">Nenhuma cotação aberta</h3>
              <p class="poppins-regular">Não encontramos cotações disponíveis para as suas lojas no momento.</p>
            </div>
          </div>
          
          <button @click="$router.push({name: 'Cotacoes'})" style="font-size: 15px; text-align: center; width: 100%; background-color: transparent; height: 20px; margin-top: 10px; color: #ff8049;">
            Ver todas
          </button>
        </div>
      </div>

      <!-- ============================
           CARD DE SUPORTE
      ============================= -->
      <div class="support-card">
        <div class="support-card-inner">
          <div class="support-icon-wrap">
            <span class="material-symbols-outlined">support_agent</span>
          </div>
          <div class="support-text-block">
            <p class="support-title poppins-semibold">Precisa de ajuda?</p>
            <p class="support-sub poppins-regular">Nossa equipe está pronta para te atender.</p>
          </div>
        </div>
        <div class="support-contacts">
          <a href="mailto:marketvizium@gmail.com" class="support-contact-item">
            <span class="material-symbols-outlined">mail</span>
            <span class="poppins-regular">marketvizium@gmail.com</span>
          </a>
        </div>
      </div>

      <div style="height: 100px;"></div>

      <!-- =============================================
           OVERLAY: sem empresa selecionada -> lista para escolher ou cadastro de nova
      ============================================== -->
      <transition name="fade">
        <div v-if="!loadingEmpresas && !temEmpresaVinculada" class="fintech-overlay">

          <!-- Modo lista: já existem empresas cadastradas no perfil -->
          <div v-if="!mostrarFormCadastro && empresasDisponiveis.length > 0" class="overlay-content overlay-content-form">
            <div class="illustration-container">
              <div class="icon-circle-main">
                <span class="material-symbols-outlined">domain</span>
              </div>
            </div>

            <h2 class="poppins-semibold">Selecione sua empresa</h2>
            <p class="poppins-regular text-muted">
              Encontramos empresas já cadastradas no seu perfil. Selecione qual você representa para
              continuar, ou cadastre uma nova empresa.
            </p>

            <div class="empresas-select-list">
              <div v-for="empresa in empresasDisponiveis" :key="empresa.cnpj" class="empresa-select-card">
                <div class="empresa-select-info">
                  <span class="empresa-select-nome poppins-medium">{{ empresa.nome_empresa }}</span>
                  <span class="empresa-select-cnpj poppins-regular">CNPJ: {{ empresa.cnpj }}</span>
                </div>
                <button
                  class="select-empresa-btn poppins-medium"
                  :disabled="selecionandoCnpj === empresa.cnpj"
                  @click="selecionarEmpresaExistente(empresa.cnpj)"
                >
                  <span v-if="selecionandoCnpj === empresa.cnpj">Selecionando...</span>
                  <span v-else>Selecionar</span>
                </button>
              </div>
            </div>

            <div class="action-footer" style="margin-bottom: 90px;">
              <button class="secondary-fintech-btn poppins-medium" @click="abrirFormCadastro">
                <span class="material-symbols-outlined">add_business</span>
                Cadastrar Nova Empresa
              </button>

              <!-- Contato dentro do overlay -->
              <div class="overlay-support">
                <p class="poppins-regular overlay-support-title">Dúvidas? Fale com a gente:</p>
                <div class="overlay-support-links">
                  <a href="mailto:marketvizium@gmail.com" class="overlay-support-link">
                    <span class="material-symbols-outlined">mail</span> marketvizium@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- Modo formulário: cadastro de nova empresa -->
          <div v-else class="overlay-content overlay-content-form">
            <div class="illustration-container">
              <div class="icon-circle-main">
                <span class="material-symbols-outlined">add_business</span>
              </div>
            </div>

            <h2 class="poppins-semibold">Cadastre sua empresa</h2>
            <p class="poppins-regular text-muted">
              Para acessar suas estatísticas e cotações, você precisa cadastrar a empresa que você representa.
              Preencha os dados abaixo para liberar o acesso.
            </p>

            <div class="inline-form">
              <div class="input-group">
                <label>Nome da Empresa <span class="required-star">*</span></label>
                <input
                  v-model="cadastroForm.nome_empresa"
                  placeholder="Ex: Distribuidora Silva"
                  class="poppins-regular"
                />
              </div>

              <div class="input-group">
                <label>CNPJ <span class="required-star">*</span></label>
                <input
                  v-model="cadastroForm.cnpjRaw"
                  placeholder="00.000.000/0000-00"
                  maxlength="18"
                  inputmode="numeric"
                  class="poppins-regular"
                  @input="onCnpjInput"
                />
              </div>

              <div class="input-group">
                <label>Pedido Mínimo (R$) <span class="required-star">*</span></label>
                <div class="currency-input-wrap">
                  <span class="currency-prefix">R$</span>
                  <input
                    v-model="cadastroForm.pedidoMinimoRaw"
                    placeholder="0,00"
                    inputmode="numeric"
                    class="poppins-regular"
                    @input="onPedidoMinimoInput"
                  />
                </div>
                <span class="field-hint">Valor mínimo de pedido da sua distribuidora</span>
              </div>

              <p v-if="erroCadastro" class="form-error poppins-regular">{{ erroCadastro }}</p>

              <button class="primary-fintech-btn poppins-medium" :disabled="submittingCadastro" @click="cadastrarEmpresa">
                <span v-if="submittingCadastro">Salvando...</span>
                <template v-else>
                  Cadastrar Empresa
                  <span class="material-symbols-outlined">arrow_forward</span>
                </template>
              </button>

              <button
                v-if="empresasDisponiveis.length > 0"
                type="button"
                class="link-back-btn poppins-regular"
                @click="voltarParaLista"
              >
                Voltar para lista de empresas
              </button>

              <p class="support-text poppins-regular">Leva menos de 2 minutos.</p>

              <!-- Contato dentro do overlay -->
              <div class="overlay-support" style="margin-bottom: 90px;">
                <p class="poppins-regular overlay-support-title">Dúvidas? Fale com a gente:</p>
                <div class="overlay-support-links">
                  <a href="mailto:marketvizium@gmail.com" class="overlay-support-link">
                    <span class="material-symbols-outlined">mail</span> marketvizium@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>
      </transition>

      <!-- =============================================
           OVERLAY: empresa sem pedido mínimo
      ============================================== -->
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
              Para que varejistas possam negociar com você corretamente, regularize esse dado no seu perfil.
            </p>

            <!-- Novidades da plataforma -->
            <div class="news-card">
              <div class="news-card-header">
                <span class="material-symbols-outlined news-star">auto_awesome</span>
                <span class="poppins-semibold news-card-title">Novidades da plataforma</span>
              </div>
              <div class="news-item">
                <span class="material-symbols-outlined news-item-icon">table_chart</span>
                <p class="poppins-regular"><strong>Importação e exportação via Excel</strong> — Suba seu catálogo de produtos e baixe pedidos fechados em segundos.</p>
              </div>
              <div class="news-item">
                <span class="material-symbols-outlined news-item-icon">manage_history</span>
                <p class="poppins-regular"><strong>Reutilize cotações anteriores</strong> — Adicione automaticamente itens não respondidos a novas cotações.</p>
              </div>
              <div class="news-item">
                <span class="material-symbols-outlined news-item-icon">groups</span>
                <p class="poppins-regular"><strong>Seleção de vendedores</strong> — Escolha quais distribuidores participam de cada cotação.</p>
              </div>
              <div class="news-item">
                <span class="material-symbols-outlined news-item-icon">notifications_active</span>
                <p class="poppins-regular"><strong>Alertas em tempo real</strong> — Notificações instantâneas quando novas cotações são abertas.</p>
              </div>
            </div>

            <div class="action-footer">
              <button class="primary-fintech-btn poppins-medium" @click="irParaCadastroEmpresa">
                Regularizar Cadastro
                <span class="material-symbols-outlined">arrow_forward</span>
              </button>
              <p class="support-text poppins-regular">Adicione o valor do pedido mínimo da sua distribuidora.</p>

              <div class="overlay-support">
                <p class="poppins-regular overlay-support-title">Precisa de ajuda?</p>
                <div class="overlay-support-links">
                  <a href="mailto:marketvizium@gmail.com" class="overlay-support-link">
                    <span class="material-symbols-outlined">mail</span> marketvizium@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonPage, IonContent, IonSpinner, toastController } from '@ionic/vue';
import VueApexCharts from "vue3-apexcharts";
import { api } from '@/services/api';

import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay } from 'swiper/modules'
import 'swiper/css'
import router from '@/router';
import { useAuthStore } from '@/stores/auth';
import RefresherIonic from '../components/refresherIonic.vue';


export default defineComponent({
  name: 'DashboardPage',
  components: { 
    IonPage, 
    IonContent,
    IonSpinner,
    apexchart: VueApexCharts,
    Swiper,
    SwiperSlide,
    RefresherIonic
  },
  data() {
    return {
      loading: true,
      error: false,
      temDados: false,
      // Dados da API
      series: [{ 
        name: 'Cotações', 
        data: [] as number[] 
      }],
      estatisticas: [] as any[],
      cotacoesRecentes: [] as any[],
      // Configurações do Gráfico
      chartOptions: {
        chart: { 
          type: 'area', 
          toolbar: { show: false }, 
          sparkline: { enabled: false },
          animations: { enabled: true }
        },
        colors: ['#3b82f6'],
        fill: { 
          type: 'gradient', 
          gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.1, stops: [0, 90, 100] } 
        },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 2 },
        xaxis: {
          categories: [] as string[],
          tickAmount: 4,
          labels: { 
            rotate: 0,
            hideOverlappingLabels: true,
            style: { colors: '#94a3b8', fontSize: '10px' } 
          },
          axisBorder: { show: false },
          axisTicks: { show: false }
        },
        yaxis: { 
          min: 0,
          forceNiceScale: true,
          labels: { style: { colors: '#94a3b8', fontSize: '10px' } } 
        },
        grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
        tooltip: {
          x: { show: true },
          y: { title: { formatter: () => 'Participação:' } }
        }
      },

      tips: [
        {
          icon: 'tips_and_updates',
          title: 'Bem-vindo ao Marviz 👋',
          text: 'Use o app para encontrar lojas, enviar pedidos e acompanhar cotações em tempo real.'
        },
        {
          icon: 'table_chart',
          title: 'Quer adquirir nosso sistema? Fale com vendas.',
          text: 'Entre em contato com +55 (11) 96302-0831',
          badge: 'Novo'
        },
        {
          icon: 'table_chart',
          title: '🆕 Importação e exportação via Excel',
          text: 'Importe seu catálogo de produtos e exporte pedidos fechados com um clique. Nunca foi tão fácil.',
          badge: 'Novo'
        },
        {
          icon: 'storefront',
          title: 'Encontre lojas',
          text: 'Descubra fornecedores próximos e amplie suas oportunidades de negócio.'
        },
        {
          icon: 'request_quote',
          title: 'Cotações em tempo real',
          text: 'Participe de cotações e responda rápido para fechar negócios antes dos concorrentes.'
        },
        {
          icon: 'shopping_cart',
          title: 'Passe pedidos com facilidade',
          text: 'Negocie preços e condições direto pelo aplicativo, sem ligações ou burocracias.'
        },
        {
          icon: 'trending_up',
          title: 'Venda mais todos os dias',
          text: 'Use os dados do app para tomar decisões melhores e bater suas metas.'
        }
      ],

      swiperModules: [Autoplay],

      temEmpresaVinculada: true, 
      temPedidoMinimo: true,
      loadingEmpresas: true,
      empresasDisponiveis: [] as any[],
      mostrarFormCadastro: false,
      selecionandoCnpj: '',
      cadastroForm: {
        nome_empresa: '',
        cnpjRaw: '',
        cnpj: '',
        pedidoMinimoRaw: '',
        pedido_minimo: 0
      },
      erroCadastro: '',
      submittingCadastro: false,
    };
  },
  methods: {
    async fetchDashboardData() {
      this.loadingEmpresas = true;
      this.error = false;
      
      try {
        const responseEmpresas = await api.get('/mvpu/usuario/operacoesEmpresaVendedor/');
        const empresas = responseEmpresas.data?.data || [];
        this.empresasDisponiveis = empresas;

        let verificaSelecionada = false

        if (empresas.length === 0) {
          // Sem nenhuma empresa cadastrada: vai direto para o formulário de cadastro
          this.temEmpresaVinculada = false;
          this.mostrarFormCadastro = true;
          this.loadingEmpresas = false;
          return;
        } else {
          for(let empresa of empresas){
            if(empresa.selecionada){
              verificaSelecionada = true
            }
          }
        }

        if(!verificaSelecionada){
          // Já existem empresas cadastradas, mas nenhuma selecionada: mostra a lista para escolher
          this.temEmpresaVinculada = false;
          this.loadingEmpresas = false;
          return;
        }
        
        this.temEmpresaVinculada = true;

        const empresaSelecionada = empresas.find((e: any) => e.selecionada);
        if (empresaSelecionada && (empresaSelecionada.pedido_minimo === null || empresaSelecionada.pedido_minimo === undefined)) {
          this.temPedidoMinimo = false;
          this.loadingEmpresas = false;
          this.loading = false;
          return;
        }
        this.temPedidoMinimo = true;

        let { data } = await api.get('/mvpu/usuario/consultarStatsVendedor');
        data = data.data;

        if (data && data.hasContent) {
          this.series[0].data = data.chartData?.values || [];
          this.chartOptions.xaxis.categories = data.chartData?.labels || [];
          this.estatisticas = data.cards || [];
          this.cotacoesRecentes = data.recentQuotes || [];
          this.temDados = true;
        } else {
          this.temDados = false;
        }

        
        
        
        

      } catch (err) {
        
        this.error = true;
      } finally {
        this.loadingEmpresas = false;
        this.loading = false
      }
    },

    irParaCadastroEmpresa() {
      this.$router.push({ name: 'MinhasEmpresas' }); 
    },

    // ── Máscaras / helpers de formulário ──────────────────────────────────
    aplicarMascaraCnpj(valor: string): string {
      let v = valor.replace(/\D/g, '').slice(0, 14);

      if (v.length > 2) {
        v = v.replace(/^(\d{2})(\d)/, '$1.$2');
      }
      if (v.length > 6) {
        v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
      }
      if (v.length > 9) {
        v = v.replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4');
      }
      if (v.length > 13) {
        v = v.replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, '$1.$2.$3/$4-$5');
      }
      return v;
    },
    cnpjSomenteNumeros(valor: string): string {
      return valor.replace(/\D/g, '');
    },
    centavosParaExibicao(centavos: number): string {
      return (centavos / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },
    extrairErroApi(error: any): string {
      const data = error?.response?.data;
      if (data && (data.MSG || data.COD)) {
        return `Erro: ${data.MSG ?? 'Desconhecido'} (COD: ${data.COD ?? '?'})`;
      }
      return 'Erro desconhecido. Tente novamente.';
    },
    onCnpjInput(e: Event) {
      const input = e.target as HTMLInputElement;
      const masked = this.aplicarMascaraCnpj(input.value);

      this.cadastroForm.cnpjRaw = masked;
      this.cadastroForm.cnpj = this.cnpjSomenteNumeros(masked);
      input.value = masked;
    },
    onPedidoMinimoInput(e: Event) {
      const raw = (e.target as HTMLInputElement).value.replace(/\D/g, '');
      const centavos = parseInt(raw || '0', 10);
      const formatado = this.centavosParaExibicao(centavos);

      this.cadastroForm.pedidoMinimoRaw = formatado;
      this.cadastroForm.pedido_minimo = centavos / 100;
      (e.target as HTMLInputElement).value = formatado;
    },
    async showToast(msg: string, color = 'success') {
      const toast = await toastController.create({
        message: msg,
        duration: 3000,
        color,
        position: 'bottom'
      });
      await toast.present();
    },
    // ── Seleção de empresa já cadastrada ─────────────────────────────────
    async selecionarEmpresaExistente(cnpj: string) {
      this.selecionandoCnpj = cnpj;
      try {
        await api.post(`/mvpu/usuario/selecionarEmpresa/${cnpj}`, {});
        this.showToast('Empresa selecionada com sucesso!');
        await this.fetchDashboardData();
      } catch (err: any) {
        this.showToast(this.extrairErroApi(err), 'danger');
      } finally {
        this.selecionandoCnpj = '';
      }
    },
    abrirFormCadastro() {
      this.resetCadastroForm();
      this.mostrarFormCadastro = true;
    },
    voltarParaLista() {
      this.resetCadastroForm();
      this.mostrarFormCadastro = false;
    },
    // ── Cadastro de nova empresa ──────────────────────────────────────────
    async cadastrarEmpresa() {
      this.erroCadastro = '';

      if (!this.cadastroForm.nome_empresa.trim()) {
        this.erroCadastro = 'Informe o nome da empresa.';
        return;
      }
      if (this.cadastroForm.cnpj.length !== 14) {
        this.erroCadastro = 'CNPJ inválido. Informe os 14 dígitos.';
        return;
      }
      if (!this.cadastroForm.pedido_minimo || this.cadastroForm.pedido_minimo <= 0) {
        this.erroCadastro = 'Informe o pedido mínimo da distribuidora.';
        return;
      }

      this.submittingCadastro = true;
      try {
        await api.post('/mvpu/usuario/operacoesEmpresaVendedor/', {
          cnpj: this.cadastroForm.cnpj,
          nome_empresa: this.cadastroForm.nome_empresa,
          pedido_minimo: this.cadastroForm.pedido_minimo
        });
        this.showToast('Empresa cadastrada com sucesso!');
        this.resetCadastroForm();
        this.mostrarFormCadastro = false;
        this.fetchDashboardData();
      } catch (err: any) {
        this.erroCadastro = this.extrairErroApi(err);
        this.showToast(this.erroCadastro, 'danger');
      } finally {
        this.submittingCadastro = false;
      }
    },
    resetCadastroForm() {
      this.cadastroForm = {
        nome_empresa: '',
        cnpjRaw: '',
        cnpj: '',
        pedidoMinimoRaw: '',
        pedido_minimo: 0
      };
      this.erroCadastro = '';
    },

    navigateToDetails(quote: any) {
      this.$router.push({
        name: 'DetalhesCotacao',
        query: { id_cotacao: quote.id_cotacao, id_loja: quote.id_loja }
      });
    }

  },
  mounted() {
    const auth = useAuthStore()

    if(!auth.token || !localStorage.getItem('token')){
      router.replace({ name: 'Login' });
    }

    this.fetchDashboardData()
  }
});
</script>

<style scoped>
.dashboard-page { background-color: #fff; }

.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  text-align: center;
}

.error-icon { font-size: 64px; color: #f44336; margin-bottom: 16px; }
.retry-btn {
  margin-top: 20px;
  padding: 10px 24px;
  background: #3b82f6;
  color: white;
  border-radius: 8px;
  border: none;
}

.section-header { margin: 15px 0; }
.section-header h2 { font-size: 19px; color: #1e293b; margin: 0; }

.chart-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 15px;
}

.chart-header { display: flex; justify-content: space-between; margin-bottom: 10px; }
.chart-header h3 { font-size: 15px; margin: 0; color: #334155; }
.chart-sub { font-size: 11px; color: #94a3b8; display: flex; align-items: center; gap: 5px; }
.blue-dot { width: 8px; height: 8px; background: #3b82f6; border-radius: 2px; }

.chart-filter {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #475569;
  gap: 4px;
  background: #FFF;
  padding: 4px 8px;
  border-radius: 8px;
}

.stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.stat-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  padding: 14px;
}

.stat-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.icon-wrapper {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.more-icon { color: #94a3b8; font-size: 20px; }
.stat-label { font-size: 11px; color: #64748b; margin: 0; }
.stat-value { font-size: 22px; color: #1e293b; margin: 4px 0; }
.stat-percentage { font-size: 10px; display: flex; align-items: center; gap: 3px; margin: 0; }
.trend-up { color: #10b981; }
.trend-down { color: #ef4444; }
.text-muted { color: #94a3b8; margin-left: 2px; }

.quote-item {
  display: flex;
  align-items: center;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  padding: 12px;
  margin-top: 10px;
}
.quote-icon {
  width: 40px; height: 40px; background: #f0fdfa; color: #2dd4bf;
  border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px;
}
.quote-info h4 { font-size: 14px; margin: 0; color: #1e293b; }
.quote-info p { font-size: 12px; margin: 0; color: #64748b; }
.quote-status { margin-left: auto; text-align: right; }
.quote-status .date { font-size: 10px; color: #94a3b8; margin: 0 0 4px 0; }
.status-badge { background: #e2e8f0; color: #64748b; padding: 2px 10px; border-radius: 12px; font-size: 10px; }

.empty-state { display: flex; justify-content: center; align-items: center; height: 60vh; }
.empty-card { text-align: center; padding: 30px; }
.empty-icon { font-size: 60px; color: #cbd5e1; margin-bottom: 15px; }
.mt-20 { margin-top: 20px; }

.empty-quotes-card {
  background: #ffffff;
  border: 2px dashed #e2e8f0;
  border-radius: 16px;
  padding: 30px 20px;
  margin-top: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.empty-content {
  text-align: center;
  max-width: 250px;
}

.icon-circle {
  width: 48px;
  height: 48px;
  background: #f8fafc;
  color: #94a3b8;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
}

.icon-circle span { font-size: 24px; }

.empty-content h3 {
  font-size: 14px;
  color: #334155;
  margin: 0 0 4px 0;
}

.empty-content p {
  font-size: 12px;
  color: #94a3b8;
  line-height: 1.5;
  margin: 0;
}

.empty-stats-placeholder {
  background: #FFF;
  border: 1px dashed #e2e8f0;
  border-radius: 16px;
  padding: 40px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 180px;
  margin-bottom: 15px;
}

.empty-stats-content {
  text-align: center;
  color: #94a3b8;
}

.empty-stats-content span.material-symbols-outlined {
  font-size: 32px;
  margin-bottom: 12px;
  color: #cbd5e1;
}

.empty-stats-content p {
  font-size: 14px;
  margin: 0;
  color: #64748b;
}

.empty-stats-content .sub-text {
  font-size: 11px;
  display: block;
  margin-top: 4px;
  color: #94a3b8;
}

.empty-chart-state {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fcfcfc;
  border-radius: 12px;
}

.empty-chart-content {
  text-align: center;
  padding: 0 20px;
}

.empty-chart-content span {
  font-size: 40px;
  color: #e2e8f0;
  margin-bottom: 8px;
}

.empty-chart-content h4 {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 6px 0;
}

.empty-chart-content p {
  font-size: 11px;
  color: #94a3b8;
  line-height: 1.4;
  margin: 0 auto;
  max-width: 220px;
}

/* ===== SWIPER TIPS ===== */
.main-tips-widget {
  margin: 18px 0 22px;
}

.tip-slide {
  background: linear-gradient(135deg, #ff8049, #ff9a6a);
  border-radius: 20px;
  padding: 20px;
  min-height: 120px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #ffffff;
  box-shadow: 0 8px 24px rgba(255, 128, 73, 0.25);
  position: relative;
  overflow: hidden;
}

.tip-badge {
  position: absolute;
  top: 10px;
  right: 12px;
  background: rgba(255,255,255,0.25);
  color: #fff;
  font-size: 10px;
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 20px;
  letter-spacing: 0.5px;
}

.tip-icon {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.22);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tip-icon span {
  font-size: 26px;
  color: #ffffff;
}

.tip-content strong {
  font-size: 15px;
  display: block;
  margin-bottom: 4px;
}

.tip-content p {
  font-size: 12px;
  line-height: 1.5;
  margin: 0;
  opacity: 0.95;
}

/* ===== QUICK WIDGETS ===== */
.quick-widgets {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.quick-widget {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 14px;
}

.widget-left {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.widget-left span { font-size: 22px; }

.widget-content { flex: 1; }

.widget-content strong {
  font-size: 14px;
  color: #1e293b;
  display: block;
}

.widget-content p {
  font-size: 12px;
  color: #64748b;
  margin: 2px 0 0;
  line-height: 1.4;
}

.widget-arrow { font-size: 20px; color: #94a3b8; }

.action-widget .widget-left { background: #fff7ed; color: #fb923c; }
.discover-widget .widget-left { background: #f0f9ff; color: #38bdf8; }

/* ===== SUPPORT CARD ===== */
.support-card {
  margin-top: 28px;
  background: linear-gradient(135deg, #1e293b 0%, #2d3f55 100%);
  border-radius: 20px;
  padding: 20px;
  color: #fff;
}

.support-card-inner {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}

.support-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: rgba(255,255,255,0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.support-icon-wrap span {
  font-size: 24px;
  color: #fff;
}

.support-text-block { flex: 1; }

.support-title {
  font-size: 15px;
  color: #fff;
  margin: 0 0 2px;
}

.support-sub {
  font-size: 12px;
  color: rgba(255,255,255,0.6);
  margin: 0;
}

.support-contacts {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.support-contact-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 12px;
  padding: 11px 14px;
  text-decoration: none;
  color: #fff;
  font-size: 13px;
  font-family: 'Poppins', sans-serif;
  transition: background 0.2s;
}

.support-contact-item span.material-symbols-outlined {
  font-size: 18px;
  color: rgba(255,255,255,0.7);
}

.support-contact-item:active { background: rgba(255,255,255,0.15); }

.support-whatsapp { color: #4ade80; border-color: rgba(74, 222, 128, 0.2); background: rgba(74, 222, 128, 0.07); }
.whatsapp-icon { flex-shrink: 0; }

/* ===== TRANSITIONS ===== */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* ===== OVERLAY ===== */
.fintech-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #ffffff;
  z-index: 1000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 40px 24px;
  overflow-y: auto;
}

.overlay-content {
  text-align: center;
  max-width: 340px;
  width: 100%;
  padding-bottom: 40px;
}

.overlay-content-form {
  max-width: 380px;
}

/* Formulário de cadastro inline (overlay sem empresa) */
.inline-form {
  text-align: left;
}

.input-group {
  margin-bottom: 16px;
}

.input-group label {
  display: block;
  font-size: 13px;
  margin-bottom: 6px;
  color: #64748b;
}

.input-group input {
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  border: 1.5px solid #e2e8f0;
  outline: none;
  transition: 0.3s;
  font-size: 15px;
  box-sizing: border-box;
}

.input-group input:focus {
  border-color: #ff8049;
}

.required-star {
  color: #ef4444;
  margin-left: 2px;
}

.currency-input-wrap {
  display: flex;
  align-items: center;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  transition: border-color 0.3s;
}

.currency-input-wrap:focus-within {
  border-color: #ff8049;
}

.currency-prefix {
  padding: 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: #94a3b8;
  background: #f8fafc;
  border-right: 1.5px solid #e2e8f0;
  height: 100%;
  display: flex;
  align-items: center;
  align-self: stretch;
}

.currency-input-wrap input {
  border: none;
  outline: none;
  padding: 14px 12px;
  font-size: 15px;
  width: 100%;
  background: transparent;
  box-sizing: border-box;
}

.field-hint {
  display: block;
  font-size: 11px;
  color: #94a3b8;
  margin-top: 4px;
}

.form-error {
  color: #ef4444;
  font-size: 13px;
  margin: 0 0 14px;
  padding: 8px 12px;
  background: #fef2f2;
  border-radius: 8px;
  text-align: left;
}

/* Lista de empresas já cadastradas (overlay de seleção) */
.empresas-select-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 280px;
  overflow-y: auto;
  margin-bottom: 20px;
  padding-right: 2px;
  text-align: left;
}

.empresa-select-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 14px 16px;
}

.empresa-select-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.empresa-select-nome {
  font-size: 14px;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empresa-select-cnpj {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 2px;
}

.select-empresa-btn {
  flex-shrink: 0;
  background: #1e293b;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 13px;
  white-space: nowrap;
  cursor: pointer;
}

.select-empresa-btn:disabled {
  opacity: 0.6;
  cursor: default;
}

.secondary-fintech-btn {
  width: 100%;
  background: #f1f5f9;
  color: #1e293b;
  border: 1px solid #e2e8f0;
  padding: 16px 24px;
  border-radius: 16px;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
}

.secondary-fintech-btn span {
  font-size: 18px;
}

.link-back-btn {
  display: block;
  width: 100%;
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 13px;
  padding: 12px 0 0;
  text-align: center;
  text-decoration: underline;
  cursor: pointer;
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

.icon-circle-main span { font-size: 48px; }

h2 { color: #1e293b; font-size: 24px; margin-bottom: 12px; }

.text-muted {
  color: #64748b;
  font-size: 15px;
  line-height: 1.6;
  margin-bottom: 24px;
}

/* Feature list (overlay sem empresa) */
.feature-list {
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 28px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 12px 14px;
}

.feature-icon {
  font-size: 22px !important;
  color: #ff8049;
  flex-shrink: 0;
  margin-top: 1px;
}

.feature-item strong {
  display: block;
  font-size: 13px;
  color: #1e293b;
  margin-bottom: 2px;
}

.feature-item p {
  font-size: 12px;
  color: #64748b;
  margin: 0;
  line-height: 1.4;
}

/* News card (overlay sem pedido mínimo) */
.news-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 16px;
  text-align: left;
  margin-bottom: 24px;
}

.news-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.news-star {
  font-size: 18px !important;
  color: #f59e0b;
}

.news-card-title {
  font-size: 14px;
  color: #1e293b;
}

.news-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 12px;
}

.news-item:last-child { margin-bottom: 0; }

.news-item-icon {
  font-size: 18px !important;
  color: #ff8049;
  flex-shrink: 0;
  margin-top: 1px;
}

.news-item p {
  font-size: 12px;
  color: #64748b;
  margin: 0;
  line-height: 1.4;
}

.news-item p strong {
  color: #334155;
  font-size: 12px;
}

/* Botão fintech */
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
}

.primary-fintech-btn:active { transform: scale(0.96); }
.primary-fintech-btn span { font-size: 20px; }

.support-text {
  display: block;
  margin-top: 15px;
  color: #94a3b8;
  font-size: 13px;
  margin-bottom: 0;
}

/* Suporte dentro dos overlays */
.overlay-support {
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid #f1f5f9;
}

.overlay-support-title {
  font-size: 12px;
  color: #94a3b8;
  margin: 0 0 10px;
}

.overlay-support-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.overlay-support-link {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  color: #475569;
  text-decoration: none;
  font-family: 'Poppins', sans-serif;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 9px 12px;
  transition: background 0.2s;
}

.overlay-support-link span.material-symbols-outlined {
  font-size: 16px;
  color: #64748b;
}

.overlay-support-link:active { background: #f1f5f9; }

.overlay-support-whatsapp {
  color: #16a34a;
  border-color: #dcfce7;
  background: #f0fdf4;
}

.icon-circle-warning {
  color: #f59e0b;
  box-shadow: 0 10px 25px rgba(245, 158, 11, 0.15);
}
</style>