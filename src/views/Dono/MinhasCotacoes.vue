<template>
  <ion-page class="cotacoes-page">
    <ion-content :fullscreen="true" class="cotacoes-content">

      <RefresherIonic />

      <div class="dashboard-container">

        <!-- ════════════════════════════════════════════
             MODAL: Entendendo os Status de Cotação
        ════════════════════════════════════════════ -->
        <Teleport to="body">
          <Transition name="modal-fade">
            <div v-if="modalStatusVisivel" class="modal-overlay" @click.self="fecharModal">
              <div class="modal-card" style="font-family: 'Poppins';">

                <!-- Cabeçalho -->
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

                <!-- Conteúdo: Cards de Status -->
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

                  <div class="status-card status-card--aberta" v-if="user?.nivel != 7">
                    <div class="status-card-badge">
                      <span class="material-symbols-outlined">radio_button_unchecked</span>
                      Aberta
                    </div>
                    <p class="status-card-desc">
                      A cotação está <strong>disponível para os vendedores</strong>. Neste momento eles podem acessar os produtos solicitados e <strong>ofertar seus preços</strong>, competindo entre si para oferecer as melhores condições à loja.
                    </p>
                  </div>

                  <div class="status-card status-card--fechada" v-if="user?.nivel != 7">
                    <div class="status-card-badge">
                      <span class="material-symbols-outlined">lock</span>
                      Fechada
                    </div>
                    <p class="status-card-desc">
                      O prazo para oferta encerrou. Os vendedores <strong>não podem mais enviar preços</strong>. Agora a loja pode analisar todas as ofertas recebidas, comparar valores, cotar os mais baratos e até utilizar a <strong>ferramenta de seleção automática de preços</strong>.
                    </p>
                  </div>

                  <div class="status-card status-card--finalizada" v-if="user?.nivel != 7">
                    <div class="status-card-badge">
                      <span class="material-symbols-outlined">verified</span>
                      Finalizada
                    </div>
                    <p class="status-card-desc">
                      A loja <strong>concluiu a seleção</strong> e enviou os produtos para os vendedores contemplados. Cada vendedor recebe seu pedido e pode <strong>faturar e encaminhar</strong> para as empresas que representa.
                    </p>
                  </div>

                </div>

                <!-- Rodapé -->
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
          </Transition>
        </Teleport>

        <!-- ════════════════════════════════════════════
             HEADER
        ════════════════════════════════════════════ -->
        <header class="page-header">
          <div class="header-content">
            <div class="header-title-row">
              <div class="cc-brand-icon">
                <span class="material-symbols-outlined">request_quote</span>
              </div>
              <div>
                <h1>Painel de Cotações</h1>
                <p>{{ user?.nivel == 7 ? 'Consulte suas cotações indisponíveis' : 'Consulte e gerencie suas cotações' }}</p>
              </div>
            </div>
          </div>
          <div class="header-actions">
            <button
              class="cc-refresh-btn"
              @click="buscarCotacoes"
              :class="{ spinning: loading }"
            >
              <span class="material-symbols-outlined">refresh</span>
            </button>

            <button class="btn-ajuda-status" @click="modalStatusVisivel = true">
              <span class="material-symbols-outlined">help_outline</span>
              Dúvidas sobre os status?
            </button>

            <span class="search-box">
              <span class="material-symbols-outlined position-search-icon">search</span>
              <input
                type="text"
                v-model="filtros.busca"
                placeholder="Pesquisar por nome..."
                class="custom-input poppins-regular"
              />
              <button v-if="filtros.busca" class="sb-clear" @click="filtros.busca = ''">
                <span class="material-symbols-outlined">close</span>
              </button>
            </span>
          </div>
        </header>

        <!-- ════════════════════════════════════════════
             FILTROS
        ════════════════════════════════════════════ -->
        <section class="filter-panel">
          <div class="filter-group">
            <label>Período rápido</label>
            <div class="button-group">
              <button
                class="p-button-sm poppins-medium"
                :class="{ 'active-filter': filtroAtivo === 'hoje' }"
                @click="definirFiltroData('hoje')"
              >Hoje</button>
              <button
                class="p-button-sm poppins-medium"
                :class="{ 'active-filter': filtroAtivo === 'semana' }"
                style="text-wrap: inherit;"
                @click="definirFiltroData('semana')"
              >Esta Semana</button>
              <button
                class="p-button-sm poppins-medium"
                :class="{ 'active-filter': filtroAtivo === 'mes' }"
                @click="definirFiltroData('mes')"
              >Este Mês</button>
              <button
                class="p-button-sm-filter"
                :class="{ 'button-filter-disable': !filtroAtivo }"
                :disabled="!filtroAtivo"
                @click="limparFiltros"
              >
                <span class="material-symbols-outlined">filter_alt_off</span>
              </button>
            </div>
          </div>

          <div class="filter-group" v-if="user?.nivel != 7">
            <label>Status da cotação</label>
            <div class="toggle-group">
              <button
                type="button"
                :class="['filter-btn-toggle', { active: filtroStatus === 'aberta' }]"
                @click="definirFiltroStatus('aberta')"
              >
                <span class="material-symbols-outlined">
                  {{ filtroStatus === 'aberta' ? 'task_alt' : 'radio_button_unchecked' }}
                </span>
                Abertas
              </button>

              <button
                type="button"
                :class="['filter-btn-toggle', { active: filtroStatus === 'fechada' }]"
                @click="definirFiltroStatus('fechada')"
              >
                <span class="material-symbols-outlined">
                  {{ filtroStatus === 'fechada' ? 'lock' : 'lock_open' }}
                </span>
                Fechadas
              </button>

              <button
                type="button"
                :class="['filter-btn-toggle', { active: filtroStatus === 'finalizada' }]"
                @click="definirFiltroStatus('finalizada')"
              >
                <span class="material-symbols-outlined">
                  {{ filtroStatus === 'finalizada' ? 'verified' : 'new_releases' }}
                </span>
                Finalizadas
              </button>

              <button
                type="button"
                :class="['filter-btn-toggle', { active: filtroStatus === 'indisponivel' }]"
                @click="definirFiltroStatus('indisponivel')"
              >
                <span class="material-symbols-outlined">
                  {{ filtroStatus === 'indisponivel' ? 'block' : 'do_not_disturb_on' }}
                </span>
                Indisponíveis
              </button>
            </div>
          </div>
        </section>

        <div class="results-bar" v-if="user?.nivel == 1 || user?.nivel == 6">
          <button style="width: 100%; display: flex; justify-content: center; align-items: center;
           text-align: center; height: 40px; font-family: 'Poppins'; font-size: 15px; font-weight: 600;
            background-color: #ff8049; color: #fff; border-radius: 8px;" @click="$router.push({name: 'registrarCotacao'})"
            >
            <span class="material-symbols-outlined">
              add
            </span>
            <div>
              Criar nova cotação
            </div>
          </button>
        </div>

        <!-- ════════════════════════════════════════════
             CONTADOR DE RESULTADOS
        ════════════════════════════════════════════ -->
        <div class="results-bar">
          <span class="results-count poppins-semibold">{{ cotacoesProcessadas.length }}</span>
          <span class="results-label poppins-regular"> cotaç{{ cotacoesProcessadas.length === 1 ? 'ão' : 'ões' }} encontrada{{ cotacoesProcessadas.length === 1 ? '' : 's' }}</span>
        </div>

        <!-- ════════════════════════════════════════════
             CONTEÚDO
        ════════════════════════════════════════════ -->
        <main class="table-section">
          <div v-if="loading" class="quotes-grid-cards">
            <div v-for="i in 4" :key="i" class="skeleton-card"></div>
          </div>

          <template v-else>
            <div v-if="paginatedCotacoes.length > 0" class="quotes-grid-cards">
              <div
                v-for="cotacao in paginatedCotacoes"
                :key="cotacao.id_cotacao"
                class="quote-info-card"
                @click="irParaAdicionarProdutos(cotacao)"
              >
                <div class="qic-header">
                  <span class="qic-status-pill" :class="'is-' + getStatusKey(cotacao)">
                    <span class="material-symbols-outlined qic-status-icon">{{ getStatusIcon(cotacao) }}</span>
                    {{ getLabelStatus(cotacao) }}
                  </span>
                  <span class="qic-id-tag">
                    <span class="material-symbols-outlined">tag</span>
                    {{ cotacao.id_cotacao }}
                  </span>
                </div>

                <h3 class="qic-title poppins-semibold">{{ cotacao.nome_cotacao }}</h3>

                <div class="qic-dates">
                  <div class="qic-date-block">
                    <span class="qic-date-label">
                      <span class="material-symbols-outlined">event_available</span>
                      Início
                    </span>
                    <span class="qic-date-value poppins-medium">{{ formatarData(cotacao.inicio_cotacao) }}</span>
                  </div>
                  <span class="qic-date-sep material-symbols-outlined">arrow_forward</span>
                  <div class="qic-date-block">
                    <span class="qic-date-label">
                      <span class="material-symbols-outlined">event_busy</span>
                      Término
                    </span>
                    <span class="qic-date-value poppins-medium">{{ formatarData(cotacao.final_cotacao) }}</span>
                  </div>
                </div>

                <div class="qic-fields-grid">
                  <div class="qic-field" :class="{ 'qic-field-full': user?.nivel == 7 }">
                    <span class="material-symbols-outlined qic-field-icon">inventory_2</span>
                    <div class="qic-field-text">
                      <span class="qic-field-label">Produtos</span>
                      <span class="qic-field-value poppins-medium">{{ cotacao.quantidade_produtos ?? 'Não informado' }}</span>
                    </div>
                  </div>

                  <!-- ══ Campos restritos: apenas para níveis diferentes de operador (7) ══ -->
                  <template v-if="user?.nivel != 7">
                    <div class="qic-field">
                      <span class="material-symbols-outlined qic-field-icon">receipt_long</span>
                      <div class="qic-field-text">
                        <span class="qic-field-label">Boletos</span>
                        <span class="qic-field-value poppins-medium">{{ getQtdBoletosTexto(cotacao) }}</span>
                      </div>
                    </div>
                    <div class="qic-field qic-field-full">
                      <span class="material-symbols-outlined qic-field-icon">payments</span>
                      <div class="qic-field-text">
                        <span class="qic-field-label">Prazo dos boletos</span>
                        <span class="qic-field-value poppins-medium">{{ getPrazoBoletoTexto(cotacao) }}</span>
                      </div>
                    </div>
                  </template>
                </div>

                <!-- ══ Observação: restrita para operador (nível 7) ══ -->
                <div class="qic-obs" v-if="user?.nivel != 7">
                  <b style="font-size: 0.8rem;">Observação: </b>
                  <p class="qic-obs-text">{{ cotacao.observacao || '--' }}</p>
                </div>

                <div class="qic-footer">
                  <span>{{ getStatusKey(cotacao) === 'aberta' ? 'Gerenciar cotação' : 'Ver detalhes da cotação' }}</span>
                  <span class="material-symbols-outlined">arrow_forward</span>
                </div>
              </div>
            </div>

            <div v-else class="empty-state">
              <div class="empty-icon-wrapper">
                <span class="material-symbols-outlined">search_off</span>
              </div>
              <h3 class="poppins-semibold">Nenhuma cotação encontrada</h3>
              <p class="poppins-regular">
                {{ filtroAtivo || filtroStatus || filtros.busca
                  ? 'Ajuste os filtros para encontrar o que precisa.'
                  : (user?.nivel == 7 ? 'Não há cotações indisponíveis no momento.' : 'Não há cotações disponíveis para a sua loja no momento.') }}
              </p>
              <button
                v-if="filtroAtivo || filtroStatus || filtros.busca"
                class="retry-btn poppins-medium"
                @click="limparFiltros"
              >
                Limpar filtros
              </button>
            </div>

            <!-- ══ PAGINAÇÃO ══ -->
            <div class="pagination-wrap" v-if="totalPaginas > 1">
              <button
                class="page-btn"
                :disabled="paginaAtual === 1"
                @click="paginaAtual--"
              >
                <span class="material-symbols-outlined">chevron_left</span>
              </button>

              <div class="page-info">
                <span class="poppins-semibold">{{ paginaAtual }}</span>
                <span class="poppins-regular"> de </span>
                <span class="poppins-semibold">{{ totalPaginas }}</span>
              </div>

              <button
                class="page-btn"
                :disabled="paginaAtual === totalPaginas"
                @click="paginaAtual++"
              >
                <span class="material-symbols-outlined">chevron_right</span>
              </button>
            </div>

            <p class="pagination-info poppins-regular" v-if="cotacoesProcessadas.length > itensPorPagina">
              Exibindo {{ inicioItem }}–{{ fimItem }} de {{ cotacoesProcessadas.length }} cotações
            </p>
          </template>
        </main>

      </div>

    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { IonPage, IonContent } from '@ionic/vue'
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import RefresherIonic from '@/components/refresherIonic.vue'
import { mapState } from 'pinia'

const LS_KEY_MODAL_STATUS = 'mvsgdb_modal_status_oculto'

export default defineComponent({
  name: 'ConsultarCotacoesMobile',

  components: {
    IonPage,
    IonContent,
    RefresherIonic
  },

  data() {
    return {
      cotacoes: [] as any[],
      loading: true,
      error: false,
      auth: null as any,

      // Paginação
      paginaAtual: 1,
      itensPorPagina: 10,

      // Filtros
      filtroAtivo: null as string | null,
      filtroStatus: null as string | null,
      filtros: {
        busca: '',
        datas: null as [Date, Date] | null,
      },

      modalStatusVisivel: false,
    }
  },

  computed: {
    ...mapState(useAuthStore, ['user', 'menuPermitido']),

    cotacoesProcessadas(): any[] {
      let lista = [...this.cotacoes]

      // 1. Filtro por nome
      if (this.filtros.busca) {
        const termo = this.filtros.busca.toLowerCase()
        lista = lista.filter(c =>
          c.nome_cotacao.toLowerCase().includes(termo)
        )
      }

      // 2. Filtro por status (usando status derivado)
      if (this.filtroStatus) {
        lista = lista.filter(c => this.getStatusKey(c) === this.filtroStatus)
      }

      // 3. Filtro por período de data
      if (this.filtros.datas && this.filtros.datas[0] && this.filtros.datas[1]) {
        const [inicio, fim] = this.filtros.datas
        lista = lista.filter(c => {
          const dataCotacao = new Date(Number(c.inicio_cotacao))
          return dataCotacao >= inicio && dataCotacao <= fim
        })
      }

      // 4. Ordem: mais recentes primeiro
      lista.sort((a, b) => Number(b.id_cotacao) - Number(a.id_cotacao))

      return lista
    },

    totalPaginas(): number {
      return Math.ceil(this.cotacoesProcessadas.length / this.itensPorPagina)
    },

    inicioItem(): number {
      return (this.paginaAtual - 1) * this.itensPorPagina + 1
    },

    fimItem(): number {
      return Math.min(this.paginaAtual * this.itensPorPagina, this.cotacoesProcessadas.length)
    },

    paginatedCotacoes(): any[] {
      const inicio = (this.paginaAtual - 1) * this.itensPorPagina
      return this.cotacoesProcessadas.slice(inicio, inicio + this.itensPorPagina)
    },
  },

  watch: {
    filtros: {
      deep: true,
      handler() { this.paginaAtual = 1 },
    },
    filtroAtivo()  { this.paginaAtual = 1 },
    filtroStatus() { this.paginaAtual = 1 },
  },

  methods: {
    // ══ Busca das cotações — RESTRIÇÃO CRÍTICA: operador (nível 7) só pode
    // enxergar cotações com status_cotacao === 'fechada' (Indisponíveis).
    // O filtro é aplicado já na origem dos dados (nunca chega ao front-end
    // do operador nenhuma cotação de outro status), independente de
    // qualquer manipulação de filtro na tela. ══
    async buscarCotacoes() {
      this.loading = true
      this.error = false
      try {
        const response = await api.get(
          `/mvpu/cotacao/consultarCotacao/${this.auth.loja.id_loja}`
        )

        if (this.user?.nivel != 7) {
          this.cotacoes = response.data.data || []
        } else {
          const cotacoesFiltradas: any[] = []

          if (response.data?.data) {
            response.data.data.forEach((cotacao: any) => {
              if (cotacao.status_cotacao === 'fechada') {
                cotacoesFiltradas.push(cotacao)
              }
            })
          }

          this.cotacoes = cotacoesFiltradas
        }
      } catch (e) {
        this.error = true
      } finally {
        this.loading = false
      }
    },

    // ── Status Derivado ──────────────────────────────────────────
    // - status_cotacao 'fechada'                                        → 'indisponivel'
    // - status_cotacao 'aberta'                                         → 'aberta'
    // - status_cotacao 'finalizada' + status_fechamento null|'pendente' → 'fechada'
    // - status_cotacao 'finalizada' + status_fechamento 'concluido'     → 'finalizada'
    getStatusKey(cotacao: any): string {
      const s = cotacao.status_cotacao
      const f = cotacao.status_fechamento
      if (s === 'fechada') return 'indisponivel'
      if (s === 'aberta') return 'aberta'
      if (s === 'finalizada') {
        if (f === 'concluido') return 'finalizada'
        return 'fechada'
      }
      return 'aberta'
    },

    getLabelStatus(cotacao: any): string {
      const key = this.getStatusKey(cotacao)
      const labels: any = {
        aberta: 'Aberta',
        fechada: 'Fechada',
        finalizada: 'Finalizada',
        indisponivel: 'Indisponível'
      }
      return labels[key] || key
    },

    getStatusIcon(cotacao: any): string {
      const key = this.getStatusKey(cotacao)
      const icons: any = {
        aberta: 'radio_button_unchecked',
        fechada: 'lock',
        finalizada: 'verified',
        indisponivel: 'block'
      }
      return icons[key] || 'help'
    },

    // Restrito: só é chamado no template quando user.nivel != 7
    getQtdBoletosTexto(cotacao: any): string {
      const qtd = cotacao?.qtd_boletos
      if (qtd === null || qtd === undefined || qtd === '') return 'Não informado'
      const qtdNumero = Number(qtd)
      return qtdNumero === 1 ? '1 boleto' : `${qtdNumero} boletos`
    },

    // Restrito: só é chamado no template quando user.nivel != 7
    getPrazoBoletoTexto(cotacao: any): string {
      const prazo = cotacao?.prazo_boleto
      if (!prazo) return 'Não informado'
      return `${prazo} dias`
    },

    formatarData(timestamp: any): string {
      if (!timestamp) return '—'
      return new Date(Number(timestamp)).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    },

    definirFiltroData(tipo: string) {
      if (this.filtroAtivo === tipo) {
        this.filtroAtivo = null
        this.filtros.datas = null
        return
      }

      this.filtroAtivo = tipo
      const hoje = new Date()
      let inicio = new Date()
      const fim = new Date()
      fim.setHours(23, 59, 59, 999)

      if (tipo === 'hoje') {
        inicio.setHours(0, 0, 0, 0)
      } else if (tipo === 'semana') {
        const diaSemana = hoje.getDay()
        inicio.setDate(hoje.getDate() - diaSemana)
        inicio.setHours(0, 0, 0, 0)
      } else if (tipo === 'mes') {
        inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
        inicio.setHours(0, 0, 0, 0)
      }

      this.filtros.datas = [inicio, fim]
    },

    definirFiltroStatus(status: string) {
      // Operador (nível 7) não pode alterar o filtro de status: sempre
      // permanece restrito às cotações indisponíveis.
      if (this.user?.nivel == 7) return
      this.filtroStatus = this.filtroStatus === status ? null : status
    },

    limparFiltros() {
      this.filtros.busca = ''
      this.filtros.datas = null
      this.filtroAtivo = null
      this.filtroStatus = null
      this.paginaAtual = 1

      if (this.user?.nivel == 7) {
        this.filtroStatus = 'indisponivel'
      }
    },

    // ── Modal de Status ──────────────────────────────────────────
    fecharModal() {
      this.modalStatusVisivel = false
    },

    fecharModalDefinitivamente() {
      localStorage.setItem(LS_KEY_MODAL_STATUS, 'true')
      this.modalStatusVisivel = false
    },

    verificarExibirModal() {
      const oculto = localStorage.getItem(LS_KEY_MODAL_STATUS)
      if (!oculto) {
        this.modalStatusVisivel = true
      }
    },

    irParaAdicionarProdutos(cotacao: any) {
      if(this.auth.tipoDispositivo=='coletor'){
        
        this.$router.push({
          name: 'cotacaoConsoleColetor',
          query: {
            nome_cotacao: cotacao.nome_cotacao,
            id_cotacao: cotacao.id_cotacao,
            id_usuario: cotacao.id_usuario,
          },
        })

      }else{
        if (window.innerWidth > 992) {

          this.$router.push({
            name: 'ConsoleCotacaoDesktop',
            query: {
              nome_cotacao: cotacao.nome_cotacao,
              id_cotacao: cotacao.id_cotacao,
              id_usuario: cotacao.id_usuario,
            },
          })

        } else {

          this.$router.push({
            name: 'consoleCotacao',
            query: {
              nome_cotacao: cotacao.nome_cotacao,
              id_cotacao: cotacao.id_cotacao,
              id_usuario: cotacao.id_usuario,
            },
          })

        }
      }
    },
  },

  mounted() {
    const authStore = useAuthStore()

    if (!authStore.token && !localStorage.getItem('token')) {
      this.$router.replace({ name: 'Login' })
      return
    }

    this.auth = authStore

    // Operador (nível 7): trava o filtro de status em "Indisponível"
    if (this.user?.nivel == 7) {
      this.filtroStatus = 'indisponivel'
    }

    this.buscarCotacoes()
    this.verificarExibirModal()
  },

  ionViewDidEnter() {
    const authStore = useAuthStore()

    if (!authStore.token && !localStorage.getItem('token')) {
      this.$router.replace({ name: 'Login' })
      return
    }

    this.auth = authStore

    // Operador (nível 7): trava o filtro de status em "Indisponível"
    if (this.user?.nivel == 7) {
      this.filtroStatus = 'indisponivel'
    }

    this.buscarCotacoes()
    this.verificarExibirModal()
  },
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

* { box-sizing: border-box; }

/* ══ PAGE ══ */
.cotacoes-page { font-family: 'Poppins', sans-serif; }
.cotacoes-content { --background: #f8f9fa; }

.poppins-regular  { font-weight: 400; }
.poppins-medium   { font-weight: 500; }
.poppins-semibold { font-weight: 600; }

.dashboard-container {
  padding: 14px;
  min-height: 100%;
  color: #334155;
}

/* ════════════════════════════════════════════
   HEADER
════════════════════════════════════════════ */
.page-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 14px;
}

.header-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cc-brand-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #ff8049, #ff9a6a);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 14px rgba(255, 128, 73, 0.3);
  flex-shrink: 0;
}
.cc-brand-icon span { font-size: 20px; color: #fff; }

.header-content h1 {
  font-size: 1.15rem;
  font-weight: 600;
  margin: 0;
  color: #1e293b;
  line-height: 1.25;
}

.header-content p {
  font-size: 0.72rem;
  color: #64748b;
  margin: 2px 0 0 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.cc-refresh-btn {
  width: 36px;
  height: 36px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  flex-shrink: 0;
}
.cc-refresh-btn span { font-size: 18px; color: #64748b; transition: transform 0.3s; }
.cc-refresh-btn.spinning span { animation: spin 0.9s linear infinite; }
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.btn-ajuda-status {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fff7f3;
  border: 1px solid #ffd4be;
  color: #ff8049;
  font-family: 'Poppins', sans-serif;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 8px;
  padding: 0.45rem 0.7rem;
  cursor: pointer;
  white-space: nowrap;
  flex: 1;
  justify-content: center;
}
.btn-ajuda-status .material-symbols-outlined { font-size: 16px; }

/* BUSCA */
.search-box {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
}
.position-search-icon {
  position: absolute;
  left: 10px;
  font-size: 18px;
  color: #94a3b8;
  pointer-events: none;
}
.custom-input {
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0.55rem 2rem 0.55rem 2.2rem;
  font-size: 13px;
  color: #334155;
  background: #fff;
  outline: none;
}
.custom-input:focus {
  border-color: #ff8049;
  box-shadow: 0 0 0 2px rgba(255, 128, 73, 0.1);
}
.sb-clear {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  padding: 0;
  display: flex;
}
.sb-clear span { font-size: 16px; color: #cbd5e1; }

/* ════════════════════════════════════════════
   FILTROS
════════════════════════════════════════════ */
.filter-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: white;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #edf2f7;
  margin-bottom: 12px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.filter-group label {
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #94a3b8;
  letter-spacing: 0.05em;
}

.button-group {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.p-button-sm {
  background: #f1f5f9;
  border: none;
  color: #475569;
  font-family: 'Poppins', sans-serif;
  font-size: 0.76rem;
  border-radius: 6px;
  padding: 7px 10px;
  flex: 1;
  min-width: 0;
  white-space: nowrap;
}

.p-button-sm.active-filter {
  background: #ff8049 !important;
  color: white !important;
}

.p-button-sm-filter {
  color: #ff8049;
  background-color: #f1f5f9;
  border: none;
  border-radius: 6px;
  width: 36px;
  height: 34px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.p-button-sm-filter span { font-size: 17px; }
.button-filter-disable {
  color: #a7a2a2;
  background-color: #dce0e4;
  cursor: not-allowed;
}

.toggle-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.filter-btn-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 38px;
  padding: 0 12px;
  background-color: #ffffff;
  border: 1px solid #d0d5dd;
  border-radius: 8px;
  color: #475467;
  font-family: 'Poppins', sans-serif;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
}
.filter-btn-toggle span { font-size: 18px; }
.filter-btn-toggle.active {
  background-color: #fff1eb;
  border-color: #ff8049;
  color: #ff8049;
}

/* ══ RESULTS BAR ══ */
.results-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 10px;
  padding: 8px 12px;
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
}
.results-count { font-size: 13px; color: #1e293b; }
.results-label { font-size: 12px; color: #94a3b8; }

/* ════════════════════════════════════════════
   MODAL
════════════════════════════════════════════ */
.modal-overlay {
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

.modal-card {
  background: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 620px;
  max-height: 90vh;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.18);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  padding: 1.1rem 1.2rem;
  border-bottom: 1px solid #f1f5f9;
}

.modal-header-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #ff8049, #ff6020);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.modal-header-icon .material-symbols-outlined { color: #ffffff; font-size: 20px; }

.modal-title { font-size: 0.95rem; font-weight: 600; color: #1e293b; margin: 0; }
.modal-subtitle { font-size: 0.75rem; color: #64748b; margin: 2px 0 0 0; }

.modal-close-btn {
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
  flex-shrink: 0;
}

.modal-body {
  padding: 1rem 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  overflow-y: auto;
}

.status-card {
  border-radius: 10px;
  padding: 0.8rem 0.9rem;
  border-left: 4px solid transparent;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.status-card--indisponivel { background: #f8fafc; border-left-color: #94a3b8; }
.status-card--aberta       { background: #f0fdf4; border-left-color: #22c55e; }
.status-card--fechada      { background: #fff7f3; border-left-color: #ff8049; }
.status-card--finalizada   { background: #eff6ff; border-left-color: #3b82f6; }

.status-card-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.status-card-badge .material-symbols-outlined { font-size: 16px; }

.status-card--indisponivel .status-card-badge { color: #64748b; }
.status-card--aberta      .status-card-badge { color: #16a34a; }
.status-card--fechada     .status-card-badge { color: #ff8049; }
.status-card--finalizada  .status-card-badge { color: #2563eb; }

.status-card-desc { font-size: 0.8rem; color: #475569; line-height: 1.55; margin: 0; }

.modal-footer {
  display: flex;
  flex-direction: column-reverse;
  gap: 8px;
  padding: 1rem 1.2rem;
  border-top: 1px solid #f1f5f9;
}

.btn-nunca-mais {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: none;
  border: none;
  color: #94a3b8;
  font-family: 'Poppins', sans-serif;
  font-size: 0.78rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
}
.btn-nunca-mais .material-symbols-outlined { font-size: 16px; }

.btn-entendi {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: linear-gradient(135deg, #ff8049, #ff6020);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.2rem;
  font-family: 'Poppins', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
}
.btn-entendi .material-symbols-outlined { font-size: 17px; }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.25s ease; }
.modal-fade-enter-active .modal-card, .modal-fade-leave-active .modal-card {
  transition: transform 0.25s ease, opacity 0.25s ease;
}
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-from .modal-card, .modal-fade-leave-to .modal-card {
  transform: translateY(20px); opacity: 0;
}

/* ════════════════════════════════════════════
   LOADING / EMPTY
════════════════════════════════════════════ */
.table-section { padding: 0; }

.skeleton-card {
  height: 230px;
  border-radius: 16px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 37%, #f1f5f9 63%);
  background-size: 400% 100%;
  animation: skeleton-loading 1.4s ease infinite;
}
@keyframes skeleton-loading {
  0% { background-position: 100% 50%; }
  100% { background-position: 0 50%; }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 56px 20px;
  text-align: center;
  gap: 8px;
}
.empty-icon-wrapper {
  width: 60px; height: 60px; background: #f1f5f9;
  border-radius: 18px; display: flex; align-items: center; justify-content: center; margin-bottom: 6px;
}
.empty-icon-wrapper span { font-size: 28px; color: #94a3b8; }
.empty-state h3 { font-size: 15px; color: #334155; margin: 0; }
.empty-state p  { font-size: 12.5px; color: #94a3b8; line-height: 1.5; margin: 0; max-width: 260px; }

.retry-btn {
  margin-top: 6px;
  padding: 9px 20px;
  background: #ff8049;
  color: #fff;
  border-radius: 10px;
  border: none;
  font-size: 13px;
}

/* ════════════════════════════════════════════
   GRID DE CARDS DAS COTAÇÕES
════════════════════════════════════════════ */
.quotes-grid-cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

@media (min-width: 700px) {
  .quotes-grid-cards { grid-template-columns: repeat(2, 1fr); }
  .page-header { flex-direction: row; align-items: center; justify-content: space-between; }
  .header-actions { flex-wrap: nowrap; }
  .search-box { width: 240px; }
  .btn-ajuda-status { flex: none; }
  .filter-panel { flex-direction: row; align-items: flex-end; flex-wrap: wrap; }
  .toggle-group { flex-direction: row; width: auto; }
  .filter-btn-toggle { width: auto; }
  .button-group { flex-wrap: nowrap; }
  .p-button-sm { flex: none; }
}

.quote-info-card {
  background: white;
  border: 1px solid #e0dede;
  box-shadow: 4px 4px 15px rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  padding: 14px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: box-shadow 0.2s ease, transform 0.15s ease, border-color 0.2s ease;
  min-width: 0;
}
.quote-info-card:active { transform: scale(0.98); box-shadow: 2px 2px 8px rgba(0,0,0,0.08); }

.qic-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.qic-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  padding: 4px 9px 4px 7px;
  border-radius: 20px;
  white-space: nowrap;
}
.qic-status-icon { font-size: 13px; }

.qic-status-pill.is-aberta { background: #22c55e1f; color: #16a34a; }
.qic-status-pill.is-fechada { background: #ff80491f; color: #c2410c; }
.qic-status-pill.is-finalizada { background: #3b82f61f; color: #2563eb; }
.qic-status-pill.is-indisponivel { background: #94a3b81f; color: #64748b; }

.qic-id-tag {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 10px;
  font-weight: 500;
  color: #94a3b8;
  white-space: nowrap;
}
.qic-id-tag .material-symbols-outlined { font-size: 13px; }

.qic-title {
  font-size: 14px;
  color: #1e293b;
  margin: 0;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}

.qic-dates { display: flex; align-items: center; gap: 6px; }
.qic-date-block { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.qic-date-label {
  display: flex; align-items: center; gap: 4px;
  font-size: 9.5px; font-weight: 600; text-transform: uppercase;
  letter-spacing: 0.03em; color: #94a3b8; white-space: nowrap;
}
.qic-date-label .material-symbols-outlined { font-size: 12px; }
.qic-date-value { font-size: 12px; color: #1e293b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.qic-date-sep { font-size: 14px; color: #cbd5e1; flex-shrink: 0; }

.qic-fields-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 7px;
}

.qic-field {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  background: #fafbfc;
  border: 1px solid #f1f5f9;
  border-radius: 10px;
  padding: 7px 8px;
  min-width: 0;
}
.qic-field-full { grid-column: 1 / -1; }
.qic-field-icon { font-size: 16px; color: #ff8049; margin-top: 1px; flex-shrink: 0; }
.qic-field-text { display: flex; flex-direction: column; min-width: 0; gap: 1px; }
.qic-field-label {
  font-size: 9.5px; font-weight: 600; text-transform: uppercase;
  letter-spacing: 0.03em; color: #94a3b8;
}
.qic-field-value {
  font-size: 12px; color: #1e293b;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

.qic-obs {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  background: #fff8f4;
  border: 1px solid #ffe6d5;
  border-radius: 10px;
  padding: 8px 9px;
}
.qic-obs-text {
  font-size: 11px;
  color: #7c4a2d;
  line-height: 1.45;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-weight: 700;
  word-break: break-word;
}

.qic-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11.5px;
  font-weight: 500;
  color: #ff8049;
  border-top: 1px solid #f1f5f9;
  margin-top: 2px;
  padding-top: 9px;
}
.qic-footer .material-symbols-outlined { font-size: 15px; }

/* ══ PAGINAÇÃO ══ */
.pagination-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-top: 14px;
  padding: 12px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
}
.page-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}
.page-btn:disabled { opacity: 0.35; }
.page-btn span { font-size: 19px; color: #475569; }
.page-info { font-size: 12.5px; color: #334155; }

.pagination-info {
  text-align: center;
  font-size: 11px;
  color: #94a3b8;
  margin: 8px 0 0;
}

/* ══ RESPONSIVIDADE ATÉ 320px ══ */
@media (max-width: 360px) {
  .dashboard-container { padding: 10px; }
  .quote-info-card { padding: 11px; gap: 8px; }
  .qic-title { font-size: 13px; }
  .qic-fields-grid { grid-template-columns: 1fr; }
  .qic-field-full { grid-column: auto; }
  .qic-status-pill { font-size: 9px; padding: 3px 7px 3px 6px; }
  .qic-date-value { font-size: 11px; }
  .btn-ajuda-status { font-size: 0.68rem; padding: 0.4rem 0.5rem; }
  .header-content h1 { font-size: 1rem; }
  .p-button-sm { font-size: 0.68rem; padding: 6px 6px; }
  .modal-header, .modal-body, .modal-footer { padding-left: 0.9rem; padding-right: 0.9rem; }
}
</style>