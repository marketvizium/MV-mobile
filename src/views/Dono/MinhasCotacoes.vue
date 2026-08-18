<template>
  <ion-page class="cotacoes-page">
    <ion-content :fullscreen="true" class="ion-padding cotacoes-content">

      <RefresherIonic />

      <!-- ══ HEADER ══ -->
      <div class="cc-header">
        <div class="cc-header-left">
          <div class="cc-brand-icon">
            <span class="material-symbols-outlined">request_quote</span>
          </div>
          <div>
            <h1 class="cc-title poppins-semibold">Painel de Cotações</h1>
            <p class="cc-subtitle poppins-regular">Consulte e gerencie suas cotações</p>
          </div>
        </div>
        <button
          class="cc-refresh-btn"
          @click="buscarCotacoes"
          :class="{ spinning: loading }"
        >
          <span class="material-symbols-outlined">refresh</span>
        </button>
      </div>

      <!-- ══ SEARCH BAR ══ -->
      <div class="search-bar">
        <span class="material-symbols-outlined sb-icon">search</span>
        <input
          type="text"
          v-model="filtros.busca"
          placeholder="Pesquisar por nome da cotação..."
          class="sb-input poppins-regular"
        />
        <button
          v-if="filtros.busca"
          class="sb-clear"
          @click="filtros.busca = ''"
        >
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <!-- ══ FILTROS RÁPIDOS DE PERÍODO ══ -->
      <div class="filter-block">
        <span class="filter-label poppins-medium">Período</span>
        <div class="period-chips-row">
          <button
            v-for="p in periodPresets"
            :key="p.key"
            class="pchip poppins-medium"
            :class="{ active: filtroAtivo === p.key }"
            @click="definirFiltroData(p.key)"
          >{{ p.label }}</button>

          <button
            class="pchip poppins-medium chip-clear"
            :class="{ disabled: !filtroAtivo && !filtroStatus && !filtros.busca }"
            @click="limparFiltros"
          >
            <span class="material-symbols-outlined" style="font-size: 15px;">filter_alt_off</span>
            Limpar
          </button>
        </div>
      </div>

      <!-- ══ FILTROS DE STATUS ══ -->
      <div class="filter-block" v-show="user?.nivel != 7">
        <span class="filter-label poppins-medium">Status</span>
        <div class="status-chips-row">
          <button
            class="status-chip poppins-medium"
            :class="{ active: filtroStatus === 'aberta', 'chip-aberta': filtroStatus === 'aberta' }"
            @click="definirFiltroStatus('aberta')"
          >
            <span class="material-symbols-outlined">
              {{ filtroStatus === 'aberta' ? 'task_alt' : 'radio_button_unchecked' }}
            </span>
            Abertas
          </button>

          <button
            class="status-chip poppins-medium"
            :class="{ active: filtroStatus === 'finalizada', 'chip-finalizada': filtroStatus === 'finalizada' }"
            @click="definirFiltroStatus('finalizada')"
          >
            <span class="material-symbols-outlined">
              {{ filtroStatus === 'finalizada' ? 'check_circle' : 'pending' }}
            </span>
            Finalizadas
          </button>

          <button
            class="status-chip poppins-medium"
            :class="{ active: filtroStatus === 'fechada', 'chip-fechada': filtroStatus === 'fechada' }"
            @click="definirFiltroStatus('fechada')"
          >
            <span class="material-symbols-outlined">
              {{ filtroStatus === 'fechada' ? 'lock' : 'lock_open' }}
            </span>
            Indisponíveis
          </button>
        </div>
      </div>

      <div style="margin-top: 20px; margin-bottom: 20px; display: flex;" v-show="user?.nivel != 7">
        <button style="width: 100%; height: 40px; border-radius: 10px; background-color: #ff8049; color: #FFF; font-family: 'Poppins';" @click="goToNovaCotacao()">
            + Adicionar nova cotação
        </button>
      </div>

      <!-- ══ CONTADOR DE RESULTADOS ══ -->
      <div class="results-bar">
        <span class="results-count poppins-semibold">{{ cotacoesProcessadas.length }}</span>
        <span class="results-label poppins-regular"> cotaç{{ cotacoesProcessadas.length === 1 ? 'ão' : 'ões' }} encontrada{{ cotacoesProcessadas.length === 1 ? '' : 's' }}</span>
        <div class="results-active-filters" v-if="filtroAtivo || filtroStatus">
          <span v-if="filtroAtivo" class="active-filter-badge poppins-medium">
            {{ periodPresets.find(p => p.key === filtroAtivo)?.label }}
          </span>
          <span v-if="filtroStatus" class="active-filter-badge poppins-medium">
            {{ filtroStatus === 'fechada' ? 'Indisponíveis' : filtroStatus === 'aberta' ? 'Abertas' : 'Finalizadas' }}
          </span>
        </div>
      </div>

      <!-- ══ LOADING ══ -->
      <div v-if="loading" class="loading-state">
        <ion-spinner name="crescent" color="primary"></ion-spinner>
        <p class="poppins-regular">Buscando cotações...</p>
      </div>

      <!-- ══ ERROR ══ -->
      <div v-else-if="error" class="error-state">
        <span class="material-symbols-outlined error-icon">cloud_off</span>
        <h3 class="poppins-semibold">Ops! Algo deu errado.</h3>
        <p class="poppins-regular">Não foi possível carregar as cotações.</p>
        <button class="retry-btn poppins-medium" @click="buscarCotacoes">
          Tentar novamente
        </button>
      </div>

      <!-- ══ LISTA VAZIA ══ -->
      <div
        v-else-if="!loading && cotacoesProcessadas.length === 0"
        class="empty-state"
      >
        <div class="empty-icon-wrap">
          <span class="material-symbols-outlined">deployed_code_history</span>
        </div>
        <h3 class="poppins-semibold">Nenhuma cotação encontrada</h3>
        <p class="poppins-regular">
          {{ filtroAtivo || filtroStatus || filtros.busca
            ? 'Tente ajustar ou limpar os filtros aplicados.'
            : 'Não há cotações disponíveis para a sua loja no momento.' }}
        </p>
        <button
          v-if="filtroAtivo || filtroStatus || filtros.busca"
          class="retry-btn poppins-medium"
          @click="limparFiltros"
        >
          Limpar filtros
        </button>
      </div>

      <!-- ══ LISTA DE COTAÇÕES ══ -->
      <div
        v-else
        class="cotacoes-list"
        style="padding-bottom: 120px;"
      >
        <div
          v-for="cotacao in cotacoesPaginadas"
          :key="cotacao.id_cotacao"
          class="cotacao-card"
          :class="{ 'card-aberta': cotacao.status_cotacao === 'aberta', 'card-disabled': cotacao.status_cotacao !== 'aberta' }"
          @click="irParaAdicionarProdutos(cotacao)"
        >
          <!-- Indicador lateral de status -->
          <div class="card-status-bar" :class="'bar-' + cotacao.status_cotacao"></div>

          <div class="card-body">
            <!-- Linha superior: nome + status badge -->
            <div class="card-top">
              <div class="card-icon-wrap" :class="'icon-' + cotacao.status_cotacao">
                <span class="material-symbols-outlined">
                  {{ cotacao.status_cotacao === 'aberta' ? 'request_quote'
                    : cotacao.status_cotacao === 'finalizada' && cotacao.status_fechamento === 'concluido' ? 'task_alt'
                    : 'lock' }}
                </span>
              </div>

              <div class="card-info">
                <h4 class="card-nome poppins-semibold">{{ cotacao.nome_cotacao }}</h4>
                <span
                  class="status-badge poppins-medium"
                  :class="'badge-' + cotacao.status_cotacao"
                >
                  {{ labelStatus(cotacao) }}
                </span>
              </div>

              <!-- Seta de ação -->
              <span
                class="material-symbols-outlined card-arrow"
                :class="{ 'arrow-active': cotacao.status_cotacao === 'aberta' }"
              >
                chevron_right
              </span>
            </div>

            <!-- Linha inferior: datas -->
            <div class="card-dates">
              <div class="card-date-item">
                <span class="material-symbols-outlined date-icon">calendar_today</span>
                <div>
                  <span class="date-label poppins-regular">Início</span>
                  <span class="date-val poppins-medium">{{ formatarData(cotacao.inicio_cotacao) }}</span>
                </div>
              </div>

              <div class="card-date-sep"></div>

              <div class="card-date-item">
                <span class="material-symbols-outlined date-icon">event</span>
                <div>
                  <span class="date-label poppins-regular">Encerra</span>
                  <span class="date-val poppins-medium">{{ formatarData(cotacao.final_cotacao) }}</span>
                </div>
              </div>

              <!-- Hint de ação -->
              <div
                class="card-hint poppins-regular"
                v-if="cotacao.status_cotacao === 'aberta'"
              >
                <span class="material-symbols-outlined" style="font-size: 13px;">touch_app</span>
                Gerenciar
              </div>
              <div class="card-hint-disabled poppins-regular" v-else>
                <span class="material-symbols-outlined" style="font-size: 13px;">visibility</span>
                Visualizar
              </div>
            </div>
          </div>
        </div>

        <!-- ══ PAGINAÇÃO ══ -->
        <div class="pagination-wrap" v-if="totalPaginas > 1">
          <button
            class="page-btn poppins-medium"
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
            class="page-btn poppins-medium"
            :disabled="paginaAtual === totalPaginas"
            @click="paginaAtual++"
          >
            <span class="material-symbols-outlined">chevron_right</span>
          </button>
        </div>

        <!-- Info de paginação -->
        <p class="pagination-info poppins-regular" v-if="cotacoesProcessadas.length > itensPorPagina">
          Exibindo {{ inicioItem }}–{{ fimItem }} de {{ cotacoesProcessadas.length }} cotações
        </p>

      </div>

    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { IonPage, IonContent, IonSpinner } from '@ionic/vue'
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import RefresherIonic from '@/components/refresherIonic.vue';
import { mapState } from 'pinia';

export default defineComponent({
  name: 'ConsultarCotacoesMobile',

  components: {
    IonPage,
    IonContent,
    IonSpinner,
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
      

      periodPresets: [
        { key: 'hoje',   label: 'Hoje' },
        { key: 'semana', label: 'Semana' },
        { key: 'mes',    label: 'Este Mês' },
      ],
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

      // 2. Filtro por status
      if (this.filtroStatus) {
        lista = lista.filter(c => c.status_cotacao === this.filtroStatus)
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
      lista.sort((a, b) => Number(b.inicio_cotacao) - Number(a.inicio_cotacao))

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

    cotacoesPaginadas(): any[] {
      const inicio = (this.paginaAtual - 1) * this.itensPorPagina
      return this.cotacoesProcessadas.slice(inicio, inicio + this.itensPorPagina)
    },
  },

  watch: {
    // Volta para a página 1 sempre que um filtro muda
    filtros: {
      deep: true,
      handler() { this.paginaAtual = 1 },
    },
    filtroAtivo()  { this.paginaAtual = 1 },
    filtroStatus() { this.paginaAtual = 1 },
  },

  methods: {
    // Retorna o rótulo de exibição do status da cotação
    labelStatus(cotacao: any): string {
      if (cotacao.status_cotacao === 'fechada') return 'INDISPONÍVEL'
      if (cotacao.status_cotacao === 'aberta') return 'ABERTA'
      if (cotacao.status_cotacao === 'finalizada') {
        return cotacao.status_fechamento === 'concluido' ? 'FINALIZADA' : 'FECHADA'
      }
      return cotacao.status_cotacao.toUpperCase()
    },

    async buscarCotacoes() {
      this.loading = true
      this.error = false
      try {

        
        const response = await api.get(
          `/mvpu/cotacao/consultarCotacao/${this.auth.loja.id_loja}`
        )
        this.cotacoes = response.data.data || []
      } catch (e) {
        
        this.error = true
      } finally {
        this.loading = false
      }
    },

    goToNovaCotacao(){
      this.$router.push({ name: 'registrarCotacao'})
    },

    definirFiltroData(tipo: string) {
      // Toggle: clicar no mesmo limpa o filtro
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
      // Toggle: clicar no mesmo limpa
      this.filtroStatus = this.filtroStatus === status ? null : status
    },

    limparFiltros() {
      this.filtros.busca = ''
      this.filtros.datas = null
      this.filtroAtivo = null
      this.filtroStatus = null
      this.paginaAtual = 1

      if(this.user.nivel == 7){
        this.filtroStatus = 'fechada'
      }
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

    irParaAdicionarProdutos(cotacao: any) {
      this.$router.push({
        name: 'consoleCotacao',
        query: {
          nome_cotacao: cotacao.nome_cotacao,
          id_cotacao: cotacao.id_cotacao,
          id_usuario: cotacao.id_usuario,
        },
      })
    },
  },

  mounted() {
    const authStore = useAuthStore()

    if (!authStore.token && !localStorage.getItem('token')) {
      this.$router.replace({ name: 'Login' })
      return
    }

    if(this.user?.nivel == 7){
      this.definirFiltroStatus('fechada')
    }

    this.auth = authStore
    this.buscarCotacoes()
  },
})
</script>

<style scoped>

/* ══ PAGE ══ */
.cotacoes-page { background-color: #FFF; }
.cotacoes-content { --background: #FFF; }

/* ══ HEADER ══ */
.cc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-top: 4px;
}
.cc-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.cc-brand-icon {
  width: 42px;
  height: 42px;
  background: linear-gradient(135deg, #ff8049, #ff9a6a);
  border-radius: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 14px rgba(255, 128, 73, 0.3);
  flex-shrink: 0;
}
.cc-brand-icon span { font-size: 22px; color: #fff; }
.cc-title {
  font-size: 17px;
  color: #1e293b;
  margin: 0;
  line-height: 1.2;
}
.cc-subtitle {
  font-size: 11px;
  color: #94a3b8;
  margin: 0;
}
.cc-refresh-btn {
  width: 36px;
  height: 36px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  flex-shrink: 0;
}
.cc-refresh-btn span { font-size: 19px; color: #64748b; transition: transform 0.3s; }
.cc-refresh-btn.spinning span { animation: spin 0.9s linear infinite; }
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

/* ══ SEARCH BAR ══ */
.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 10px 13px;
  margin-bottom: 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.sb-icon { font-size: 19px; color: #94a3b8; flex-shrink: 0; }
.sb-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 13px;
  color: #334155;
  outline: none;
}
.sb-input::placeholder { color: #cbd5e1; }
.sb-clear {
  background: none;
  border: none;
  padding: 0;
  display: flex;
  align-items: center;
}
.sb-clear span { font-size: 18px; color: #cbd5e1; }

/* ══ FILTER BLOCKS ══ */
.filter-block {
  margin-bottom: 12px;
}
.filter-label {
  font-size: 10px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: block;
  margin-bottom: 6px;
}

/* ── Period chips ── */
.period-chips-row {
  display: flex;
  gap: 7px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding-bottom: 2px;
}
.period-chips-row::-webkit-scrollbar { display: none; }

.pchip {
  padding: 6px 14px;
  border-radius: 20px;
  background: #fff;
  border: 1px solid #e2e8f0;
  font-size: 12px;
  color: #475569;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
  flex-shrink: 0;
}
.pchip.active {
  background: #ff8049;
  border-color: #ff8049;
  color: #fff;
  box-shadow: 0 4px 10px rgba(255, 128, 73, 0.3);
}
.chip-clear {
  color: #ff8049;
  border-color: #fed7aa;
  background: #fff7ed;
}
.chip-clear.disabled {
  color: #cbd5e1;
  border-color: #e2e8f0;
  background: #f8fafc;
  cursor: not-allowed;
  opacity: 0.6;
}

/* ── Status chips ── */
.status-chips-row {
  display: flex;
  gap: 7px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding-bottom: 2px;
}
.status-chips-row::-webkit-scrollbar { display: none; }

.status-chip {
  padding: 6px 13px;
  border-radius: 20px;
  background: #fff;
  border: 1px solid #e2e8f0;
  font-size: 12px;
  color: #475569;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s;
  flex-shrink: 0;
}
.status-chip span { font-size: 16px; }

.chip-aberta    { background: #f0fdf4; border-color: #86efac; color: #16a34a; }
.chip-finalizada { background: #eff6ff; border-color: #93c5fd; color: #2563eb; }
.chip-fechada   { background: #fff7ed; border-color: #fdba74; color: #ea580c; }

/* ══ RESULTS BAR ══ */
.results-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
}
.results-count { font-size: 14px; color: #1e293b; }
.results-label { font-size: 13px; color: #94a3b8; }
.results-active-filters { display: flex; gap: 5px; margin-left: auto; }
.active-filter-badge {
  background: #fff7ed;
  color: #ff8049;
  border: 1px solid #fed7aa;
  border-radius: 8px;
  padding: 2px 8px;
  font-size: 11px;
}

/* ══ LOADING / ERROR / EMPTY ══ */
.loading-state, .error-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  gap: 10px;
}
.loading-state p  { font-size: 14px; color: #94a3b8; margin: 0; }
.error-icon { font-size: 52px; color: #ef4444; }
.error-state h3   { font-size: 17px; color: #1e293b; margin: 0; }
.error-state p    { font-size: 13px; color: #94a3b8; margin: 0; }

.empty-icon-wrap {
  width: 72px;
  height: 72px;
  background: #f8fafc;
  border: 2px dashed #e2e8f0;
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.empty-icon-wrap span { font-size: 32px; color: #cbd5e1; }
.empty-state h3 { font-size: 16px; color: #334155; margin: 0; }
.empty-state p  { font-size: 13px; color: #94a3b8; line-height: 1.5; margin: 0; max-width: 260px; }

.retry-btn {
  margin-top: 6px;
  padding: 10px 24px;
  background: #ff8049;
  color: #fff;
  border-radius: 12px;
  border: none;
  font-size: 14px;
}

/* ══ COTACOES LIST ══ */
.cotacoes-list { display: flex; flex-direction: column; gap: 10px; }

/* ── Card ── */
.cotacao-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  overflow: hidden;
  display: flex;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.cotacao-card:active { transform: scale(0.985); box-shadow: 0 1px 2px rgba(0,0,0,0.06); }

/* Indicador lateral */
.card-status-bar {
  width: 5px;
  flex-shrink: 0;
  border-radius: 0;
}
.bar-aberta    { background: linear-gradient(180deg, #22c55e, #16a34a); }
.bar-finalizada { background: linear-gradient(180deg, #60a5fa, #2563eb); }
.bar-fechada   { background: linear-gradient(180deg, #fb923c, #ea580c); }

.card-body { flex: 1; padding: 13px 14px; min-width: 0; }

/* Linha superior */
.card-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}
.card-icon-wrap {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.card-icon-wrap span { font-size: 20px; }

.icon-aberta    { background: #f0fdf4; color: #16a34a; }
.icon-aberta span { color: #16a34a; }
.icon-finalizada { background: #eff6ff; color: #2563eb; }
.icon-finalizada span { color: #2563eb; }
.icon-fechada   { background: #fff7ed; color: #ea580c; }
.icon-fechada span { color: #ea580c; }

.card-info { flex: 1; min-width: 0; }
.card-nome {
  font-size: 13px;
  color: #1e293b;
  margin: 0 0 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}

.status-badge {
  display: inline-block;
  padding: 2px 9px;
  border-radius: 8px;
  font-size: 10px;
  letter-spacing: 0.3px;
}
.badge-aberta     { background: #dcfce7; color: #16a34a; }
.badge-finalizada { background: #dbeafe; color: #2563eb; }
.badge-fechada    { background: #ffedd5; color: #ea580c; }

.card-arrow { font-size: 20px; color: #e2e8f0; flex-shrink: 0; }
.card-arrow.arrow-active { color: #ff8049; }

/* Linha inferior: datas */
.card-dates {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 10px;
  border-top: 1px solid #f8fafc;
}
.card-date-item {
  display: flex;
  align-items: center;
  gap: 5px;
  flex: 1;
}
.date-icon { font-size: 14px; color: #cbd5e1; }
.date-label { font-size: 9px; color: #94a3b8; display: block; text-transform: uppercase; letter-spacing: 0.3px; }
.date-val   { font-size: 11px; color: #475569; display: block; }
.card-date-sep { width: 1px; height: 26px; background: #f1f5f9; flex-shrink: 0; }

.card-hint {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  color: #ff8049;
  white-space: nowrap;
  flex-shrink: 0;
}
.card-hint-disabled {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  color: #cbd5e1;
  white-space: nowrap;
  flex-shrink: 0;
}

/* card desabilitado visualmente */
.card-disabled { opacity: 0.75; }

/* ══ PAGINAÇÃO ══ */
.pagination-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 16px;
  padding: 12px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
}
.page-btn {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.15s;
}
.page-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.page-btn:not(:disabled):active { background: #ff8049; border-color: #ff8049; }
.page-btn:not(:disabled):active span { color: #fff; }
.page-btn span { font-size: 20px; color: #475569; }
.page-info { font-size: 13px; color: #334155; }

.pagination-info {
  text-align: center;
  font-size: 11px;
  color: #94a3b8;
  margin: 8px 0 0;
}

</style>