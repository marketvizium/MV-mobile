<template>
  <ion-page class="console-page">

    <RefresherIonic />

    <ion-header class="ion-no-border">
      <div class="cc-header">
        <div class="cc-header-left">
          <button class="back-btn" @click="$router.back()">
            <span class="material-symbols-outlined">arrow_back_ios_new</span>
          </button>
          <div class="cotacao-identity">
            <span class="cotacao-label">CONSULTA</span>
            <span class="cotacao-name">Pedidos Diretos </span>
          </div>
        </div>
      </div>
    </ion-header>

    <ion-content :fullscreen="true" class="console-content">
      <div class="form-container" style="padding-bottom: 100px;">

        <!-- ═══ BUSCA ═══ -->
        <div class="search-box margin-top-20">
          <span class="material-symbols-outlined search-icon">search</span>
          <input
            v-model="busca"
            class="search-input poppins-regular"
            :placeholder="abaAtiva === 'cotacoes' ? 'Pesquisar por nome da cotação...' : 'Pesquisar por nome do pedido...'"
          />
        </div>

        <!-- ═══ FILTRO RÁPIDO DE PERÍODO ═══ -->
        <div class="periodo-filtros margin-top-12">
          <button
            class="chip-btn poppins-medium"
            :class="{ active: filtroPeriodoAtivo === 'hoje' }"
            @click="definirFiltroData('hoje')"
          >
            Hoje
          </button>
          <button
            class="chip-btn poppins-medium"
            :class="{ active: filtroPeriodoAtivo === 'semana' }"
            @click="definirFiltroData('semana')"
          >
            Esta semana
          </button>
          <button
            class="chip-btn poppins-medium"
            :class="{ active: filtroPeriodoAtivo === 'mes' }"
            @click="definirFiltroData('mes')"
          >
            Este mês
          </button>
          <button
            v-if="filtroPeriodoAtivo || filtroStatus || filtroStatusPedidoDireto"
            class="chip-btn chip-btn-limpar poppins-medium"
            @click="limparFiltros"
          >
            <span class="material-symbols-outlined" style="font-size:15px">filter_alt_off</span>
            Limpar
          </button>
        </div>

        <!-- ═══ FILTRO DE STATUS — PEDIDOS DIRETOS ═══ -->
        <div class="status-filtros margin-top-12">
          <button
            class="filter-btn-toggle poppins-medium"
            :class="{ active: filtroStatusPedidoDireto === 'indisponivel' }"
            @click="definirFiltroStatusPedidoDireto('indisponivel')"
          >
            <span class="material-symbols-outlined">{{ filtroStatusPedidoDireto === 'indisponivel' ? 'schedule' : 'radio_button_unchecked' }}</span>
            Em andamento
          </button>
          <button
            class="filter-btn-toggle poppins-medium"
            :class="{ active: filtroStatusPedidoDireto === 'finalizada' }"
            @click="definirFiltroStatusPedidoDireto('finalizada')"
          >
            <span class="material-symbols-outlined">{{ filtroStatusPedidoDireto === 'finalizada' ? 'verified' : 'new_releases' }}</span>
            Finalizados
          </button>
        </div>

        <!-- ═══════════════════════════════════════════
             LISTA: PEDIDOS DIRETOS
        ═══════════════════════════════════════════ -->
        <div class="lista-section margin-top-20">
          <div v-if="loadingPedidosDiretos" class="loading-lista poppins-regular">
            Carregando pedidos diretos...
          </div>

          <template v-else>
            <div class="lista-cards">
              <div
                v-for="pedido in pedidosDiretosPaginados"
                :key="pedido.id_pedido_direto"
                class="item-card"
                @click="irParaPedidoDireto(pedido)"
              >
                <div class="item-card-main">
                  <div class="item-card-top">
                    <div style="display: flex; flex-direction: column;">
                      <span class="item-nome poppins-medium">{{ pedido.nome_loja }}</span>
                      <span class="poppins-medium" style="font-size: 0.8rem;">{{ formatarCNPJ(pedido.cnpj) }}</span>
                    </div>
                    <span
                      class="status-tag poppins-medium"
                      :class="'tag-' + (pedido.status_pedido_direto === 'finalizada' ? 'finalizada' : 'indisponivel')"
                    >
                      {{ pedido.status_pedido_direto === 'finalizada' ? 'Finalizado' : 'Em andamento' }}
                    </span>
                  </div>
                  <div class="item-card-bottom">
                    <span class="item-data poppins-regular">
                      <span class="material-symbols-outlined" style="font-size:14px">event</span>
                      Criado em {{ formatarData(pedido.criado_em) }}
                    </span>
                  </div>
                </div>
                <span class="material-symbols-outlined item-card-chevron">chevron_right</span>
              </div>

              <div v-if="pedidosDiretosProcessados.length === 0" class="sem-itens poppins-regular">
                Nenhum pedido direto encontrado.
              </div>
            </div>

            <div v-if="totalPaginasPedidosDiretos > 1" class="paginacao">
              <button class="btn-pag" :disabled="paginaPedidosDiretos === 1" @click="paginaPedidosDiretos--">‹</button>
              <span class="pag-info poppins-regular">{{ paginaPedidosDiretos }} / {{ totalPaginasPedidosDiretos }}</span>
              <button class="btn-pag" :disabled="paginaPedidosDiretos === totalPaginasPedidosDiretos" @click="paginaPedidosDiretos++">›</button>
            </div>
          </template>
        </div>

      </div>
    </ion-content>

  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import {
  IonPage,
  IonHeader,
  IonContent
} from '@ionic/vue'
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import exibeErro from '@/utils/ExibeErro'
import RefresherIonic from '@/components/refresherIonic.vue'
import { mapState } from 'pinia'

const LS_KEY_MODAL_STATUS = 'mvsgdb_modal_status_oculto'
const POR_PAGINA = 10

export default defineComponent({
  name: 'ConsultarCotacoesMobile',

  components: {
    IonPage,
    IonHeader,
    IonContent,
    RefresherIonic
  },

  data() {
    return {
      auth: null as any,

      // Aba ativa: 'cotacoes' | 'pedidos_diretos'
      abaAtiva: 'pedidos_diretos',

      // Cotações
      cotacoes: [] as any[],
      loadingCotacoes: true,
      paginaCotacoes: 1,

      // Pedidos diretos
      pedidosDiretos: [] as any[],
      loadingPedidosDiretos: true,
      paginaPedidosDiretos: 1,

      // Filtros (compartilhados entre as duas abas)
      busca: '',
      filtroPeriodoAtivo: null as string | null,
      filtroDatas: null as [Date, Date] | null,
      filtroStatus: null as string | null,              // cotações: aberta | fechada | finalizada | indisponivel
      filtroStatusPedidoDireto: null as string | null,   // pedidos diretos: indisponivel | finalizada

      modalStatusVisivel: false
    }
  },

  computed: {
    ...mapState(useAuthStore, ['user']),

    cotacoesProcessadas(): any[] {
      let lista = [...this.cotacoes]

      if (this.busca) {
        const termo = this.busca.toLowerCase()
        lista = lista.filter((c: any) => (c.nome_cotacao || '').toLowerCase().includes(termo))
      }

      if (this.filtroStatus) {
        lista = lista.filter((c: any) => this.getStatusKey(c) === this.filtroStatus)
      }

      if (this.filtroDatas && this.filtroDatas[0] && this.filtroDatas[1]) {
        const [inicio, fim] = this.filtroDatas
        lista = lista.filter((c: any) => {
          const data = new Date(Number(c.inicio_cotacao))
          return data >= inicio && data <= fim
        })
      }

      lista.sort((a: any, b: any) => Number(b.inicio_cotacao) - Number(a.inicio_cotacao))

      return lista
    },

    totalPaginasCotacoes(): number {
      return Math.max(1, Math.ceil(this.cotacoesProcessadas.length / POR_PAGINA))
    },

    cotacoesPaginadas(): any[] {
      const inicio = (this.paginaCotacoes - 1) * POR_PAGINA
      return this.cotacoesProcessadas.slice(inicio, inicio + POR_PAGINA)
    },

    pedidosDiretosProcessados(): any[] {
      let lista = [...this.pedidosDiretos]

      if (this.busca) {
        const termo = this.busca.toLowerCase()
        lista = lista.filter((p: any) => (p.nome_pedido_direto || '').toLowerCase().includes(termo))
      }

      if (this.filtroStatusPedidoDireto) {
        lista = lista.filter((p: any) => p.status_pedido_direto === this.filtroStatusPedidoDireto)
      }

      if (this.filtroDatas && this.filtroDatas[0] && this.filtroDatas[1]) {
        const [inicio, fim] = this.filtroDatas
        lista = lista.filter((p: any) => {
          const data = new Date(Number(p.criado_em))
          return data >= inicio && data <= fim
        })
      }

      lista.sort((a: any, b: any) => Number(b.criado_em) - Number(a.criado_em))

      return lista
    },

    totalPaginasPedidosDiretos(): number {
      return Math.max(1, Math.ceil(this.pedidosDiretosProcessados.length / POR_PAGINA))
    },

    pedidosDiretosPaginados(): any[] {
      const inicio = (this.paginaPedidosDiretos - 1) * POR_PAGINA
      return this.pedidosDiretosProcessados.slice(inicio, inicio + POR_PAGINA)
    }
  },

  watch: {
    busca() {
      this.paginaCotacoes = 1
      this.paginaPedidosDiretos = 1
    }
  },

  methods: {
    trocarAba(aba: string) {
      this.abaAtiva = aba
    },

    async buscarPedidosDiretos() {
      this.loadingPedidosDiretos = true
      try {
        const response = await api.get(`/mvpu/cotacao/consultarPedidosDiretosVend/`)
        this.pedidosDiretos = response.data.data || []
      } catch (e) {
        exibeErro(e, this.$toast)
      } finally {
        this.loadingPedidosDiretos = false
      }
    },

    definirFiltroData(tipo: string) {
      this.filtroPeriodoAtivo = tipo
      const hoje = new Date()
      let inicio = new Date()
      let fim = new Date()

      if (tipo === 'hoje') {
        inicio.setHours(0, 0, 0, 0)
        fim.setHours(23, 59, 59, 999)
      } else if (tipo === 'semana') {
        const diaSemana = hoje.getDay()
        inicio.setDate(hoje.getDate() - diaSemana)
        inicio.setHours(0, 0, 0, 0)
        fim.setHours(23, 59, 59, 999)
      } else if (tipo === 'mes') {
        inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
        fim.setHours(23, 59, 59, 999)
      }

      this.filtroDatas = [inicio, fim]
      this.paginaCotacoes = 1
      this.paginaPedidosDiretos = 1
    },

    limparFiltros() {
      this.busca = ''
      this.filtroDatas = null
      this.filtroPeriodoAtivo = null
      this.filtroStatus = null
      this.filtroStatusPedidoDireto = null
      this.paginaCotacoes = 1
      this.paginaPedidosDiretos = 1
    },

    definirFiltroStatus(status: string) {
      this.filtroStatus = this.filtroStatus === status ? null : status
      this.paginaCotacoes = 1
    },

    definirFiltroStatusPedidoDireto(status: string) {
      this.filtroStatusPedidoDireto = this.filtroStatusPedidoDireto === status ? null : status
      this.paginaPedidosDiretos = 1
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

    formatarCNPJ(cnpj) {
      if (!cnpj) return '';

      const valor = String(cnpj).replace(/\D/g, '');

      return valor
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .substring(0, 18);
    },

    // ── Status Derivado (Cotação) ──────────────────────────────────
    getStatusKey(cotacao: any): string {
      const s = cotacao.status_cotacao
      const f = cotacao.status_fechamento
      if (s === 'fechada') return 'indisponivel'
      if (s === 'aberta') return 'aberta'
      if (s === 'finalizada') {
        if (f === 'concluido') return 'finalizada'
        return 'fechada' // null ou 'pendente'
      }
      return 'aberta'
    },

    getLabelStatus(cotacao: any): string {
      const key = this.getStatusKey(cotacao)
      const labels: Record<string, string> = {
        aberta: 'Aberta',
        fechada: 'Fechada',
        finalizada: 'Finalizada',
        indisponivel: 'Indisponível'
      }
      return labels[key] || key
    },

    formatarData(timestamp: any): string {
      if (!timestamp) return '-'
      return new Date(Number(timestamp)).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    // ATENÇÃO: ajuste o "name" da rota abaixo caso a página de
    // gerenciamento/itens do pedido direto tenha outro nome de rota.
    irParaPedidoDireto(pedido: any) {
      this.$router.push({
        name: 'DetalhesPedidoDireto',
        query: {
          nome_pedido_direto: pedido.nome_pedido_direto,
          id_pedido_direto: pedido.id_pedido_direto,
          status_pedido_direto: pedido.status_pedido_direto,
          id_usuario: pedido.id_usuario,
          finalizado_em: pedido.finalizado_em
        }
      })
    }
  },

  mounted() {
    this.auth = useAuthStore()
    this.buscarPedidosDiretos()
    this.verificarExibirModal()
  }
})
</script>

<style scoped>
/* === CONTAINER & ESTRUTURA BASE === */
.console-page {
  --background: #FFF !important;
  background-color: #FFF !important;
}

.console-content {
  --background: #FFF !important;
  background-color: #FFF !important;
  color: #000;
}

.form-container {
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  background-color: #FFF;
  min-height: 100%;
}

.title-section {
  margin-bottom: 8px;
}

.title-section h2 {
  font-size: 22px;
  margin: 0 0 6px 0;
  color: #000 !important;
}

.title-section p.muted {
  font-size: 14px;
  margin: 0;
  color: #525151 !important;
}

/* === UTILS === */
.margin-top-12 { margin-top: 12px; }
.margin-top-20 { margin-top: 20px; }

/* === ABAS === */
.segment-tabs {
  display: flex;
  background: #f0f0f0;
  border-radius: 12px;
  padding: 4px;
  gap: 4px;
}

.segment-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: none;
  background: transparent;
  color: #666;
  font-size: 13px;
  padding: 10px 0;
  border-radius: 9px;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.segment-btn .material-symbols-outlined {
  font-size: 17px;
}

.segment-btn.active {
  background: #FF8049;
  color: #fff;
  box-shadow: 0 2px 6px rgba(255, 128, 73, 0.35);
}

/* === BOTÃO AJUDA STATUS === */
.btn-ajuda-status {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fff7f3;
  border: 1px solid #ffd4be;
  color: #FF8049 !important;
  font-size: 13px;
  border-radius: 8px;
  padding: 10px 14px;
  cursor: pointer;
  width: 100%;
  justify-content: center;
}

.btn-ajuda-status .material-symbols-outlined {
  font-size: 18px;
}

/* === BUSCA === */
.search-box {
  display: flex;
  align-items: center;
  background-color: #f0f0f0;
  border: 1px solid rgb(177, 177, 177);
  border-radius: 10px;
  padding: 0 12px;
  height: 46px;
}

.search-icon {
  color: #888;
  flex-shrink: 0;
  margin-right: 8px;
  font-size: 18px;
}

.search-input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  color: #000 !important;
  width: 100%;
  height: 100%;
}

.search-input::placeholder {
  color: #888 !important;
}

/* === FILTRO RÁPIDO DE PERÍODO (chips) === */
.periodo-filtros {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
}

.chip-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  border: 1px solid #ddd;
  background: #fff;
  color: #555;
  font-size: 12.5px;
  padding: 8px 14px;
  border-radius: 999px;
  cursor: pointer;
  white-space: nowrap;
}

.chip-btn.active {
  background: #FF8049;
  border-color: #FF8049;
  color: #fff;
}

.chip-btn-limpar {
  color: #FF8049;
  background: #fff7f3;
  border-color: #ffd4be;
}

/* === FILTRO DE STATUS (toggle) === */
.status-filtros {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
}

.filter-btn-toggle {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  height: 38px;
  padding: 0 14px;
  background-color: #ffffff;
  border: 1px solid #d0d5dd;
  border-radius: 8px;
  color: #475467;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.filter-btn-toggle .material-symbols-outlined {
  font-size: 17px;
}

.filter-btn-toggle.active {
  background-color: #fff1eb;
  border-color: #FF8049;
  color: #FF8049;
}

/* === LISTA (cards) === */
.lista-section {
  display: flex;
  flex-direction: column;
}

.loading-lista,
.sem-itens {
  text-align: center;
  color: #aaa !important;
  font-size: 14px;
  padding: 32px 0;
}

.lista-cards {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px;
  border-radius: 10px;
  border: 1.5px solid #eee;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}

.item-card:active {
  border-color: #FF8049;
  background: #fff7f3;
}

.item-card-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.item-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.item-nome {
  font-size: 14px;
  color: #000 !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-card-bottom {
  display: flex;
  align-items: center;
}

.item-data {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11.5px;
  color: #888 !important;
}

.item-card-chevron {
  color: #ccc !important;
  flex-shrink: 0;
}

/* Tags de status */
.status-tag {
  font-size: 10.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  padding: 3px 9px;
  border-radius: 20px;
  flex-shrink: 0;
}

.tag-fechada {
  background-color: #ff804930 !important;
  color: #FF8049 !important;
}

.tag-indisponivel {
  background-color: #94a3b830 !important;
  color: #64748b !important;
}

.tag-finalizada {
  background-color: #3b82f630 !important;
  color: #3b82f6 !important;
}

.tag-aberta {
  background-color: #22c55e30 !important;
  color: #16a34a !important;
}

/* Paginação */
.paginacao {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 14px 0 4px;
}

.btn-pag {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background: #fff;
  font-size: 16px;
  cursor: pointer;
  color: #555;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.btn-pag:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.pag-info {
  font-size: 12px;
  color: #666 !important;
  min-width: 46px;
  text-align: center;
}

/* === REGRAS DO HEADER MOBILE === */
.cc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background-color: #FFF !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.cc-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.back-btn {
  background: none;
  border: none;
  color: #FF8049 !important;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
}
.back-btn span {
  font-size: 20px;
}
.cotacao-identity {
  display: flex;
  flex-direction: column;
}
.cotacao-label {
  font-size: 10px;
  color: #FF8049 !important;
  letter-spacing: 1px;
}
.cotacao-name {
  font-size: 16px;
  color: #000 !important;
}

/* ════════════════════════════════════════════
   MODAL: Entendendo os Status
════════════════════════════════════════════ */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 9999;
  padding: 0;
}

.modal-card {
  background: #ffffff;
  border-radius: 20px 20px 0 0;
  width: 100%;
  max-width: 620px;
  max-height: 88vh;
  box-shadow: 0 -12px 32px rgba(0, 0, 0, 0.18);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.2rem 1.4rem;
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

.modal-header-icon .material-symbols-outlined {
  color: #ffffff;
  font-size: 20px;
}

.modal-title {
  font-size: 0.98rem;
  color: #1e293b !important;
  margin: 0;
}

.modal-subtitle {
  font-size: 0.78rem;
  color: #64748b !important;
  margin: 2px 0 0 0;
}

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
}

.modal-body {
  padding: 1.2rem 1.4rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  overflow-y: auto;
}

.status-card {
  border-radius: 10px;
  padding: 0.9rem 1rem;
  border-left: 4px solid transparent;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.status-card--indisponivel { background: #f8fafc; border-left-color: #94a3b8; }
.status-card--aberta       { background: #f0fdf4; border-left-color: #22c55e; }
.status-card--fechada      { background: #fff7f3; border-left-color: #FF8049; }
.status-card--finalizada   { background: #eff6ff; border-left-color: #3b82f6; }

.status-card-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.status-card-badge .material-symbols-outlined {
  font-size: 17px;
}

.status-card--indisponivel .status-card-badge { color: #64748b !important; }
.status-card--aberta      .status-card-badge { color: #16a34a !important; }
.status-card--fechada     .status-card-badge { color: #FF8049 !important; }
.status-card--finalizada  .status-card-badge { color: #2563eb !important; }

.status-card-desc {
  font-size: 0.82rem;
  color: #475569 !important;
  line-height: 1.55;
  margin: 0;
}

.modal-footer {
  display: flex;
  flex-direction: column-reverse;
  gap: 0.6rem;
  padding: 1rem 1.4rem 1.4rem;
  border-top: 1px solid #f1f5f9;
}

.btn-nunca-mais {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: none;
  border: none;
  color: #94a3b8 !important;
  font-size: 0.8rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
}

.btn-nunca-mais .material-symbols-outlined {
  font-size: 16px;
}

.btn-entendi {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: linear-gradient(135deg, #ff8049, #ff6020);
  color: #ffffff !important;
  border: none;
  border-radius: 10px;
  padding: 0.75rem 1.4rem;
  font-size: 0.9rem;
  cursor: pointer;
  width: 100%;
}

.btn-entendi .material-symbols-outlined {
  font-size: 18px;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}

.modal-fade-enter-active .modal-card,
.modal-fade-leave-active .modal-card {
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .modal-card,
.modal-fade-leave-to .modal-card {
  transform: translateY(20px);
  opacity: 0;
}

/* === RESPONSIVO (tablet/desktop) === */
@media (min-width: 640px) {
  .modal-overlay {
    align-items: center;
    padding: 1rem;
  }
  .modal-card {
    border-radius: 16px;
  }
}
</style>