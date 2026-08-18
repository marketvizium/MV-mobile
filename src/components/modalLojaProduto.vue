<template>
  <ion-modal :is-open="isOpen" :backdrop-dismiss="true" class="ept-modal ept-modal-lg" @didDismiss="fechar">
    <div class="ept-wrapper">

      <!-- ══ HEADER ══ -->
      <div class="ept-header">
        <div class="ept-header-text">
          <h2 class="ept-title poppins-semibold">Ofertas enviadas</h2>
          <p class="ept-subtitle poppins-regular">Acompanhe o status dos produtos ofertados às lojas</p>
        </div>
        <button class="ept-close" @click="fechar">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <!-- ══ BUSCA + FILTRO ══ -->
      <div class="ept-filters">
        <div class="ept-search-box">
          <span class="material-symbols-outlined">search</span>
          <input v-model="busca" type="text" placeholder="Buscar produto, loja ou cód. barra..." @input="paginaAtual = 1" />
        </div>
        <!--
          <select v-model="filtroStatus" class="ept-select" @change="paginaAtual = 1">
            <option value="todos">Todos os status</option>
            <option value="nao_lido">Não lidos</option>
            <option value="lido">Lidos</option>
            <option value="escolhido">Escolhidos</option>
            <option value="recusado">Recusados</option>
          </select>
        -->
      </div>

      <!-- ══ LISTA ROLÁVEL ══ -->
      <div class="ept-scroll">

        <div v-if="loading" class="ept-loja-card skeleton" v-for="n in 3" :key="'sk'+n">
          <div class="sk-avatar"></div>
          <div class="sk-lines">
            <div class="sk-line" style="width:60%"></div>
            <div class="sk-line" style="width:40%"></div>
          </div>
        </div>

        <div v-else-if="erro" class="ept-empty">
          <span class="material-symbols-outlined">error</span>
          <p>Não foi possível carregar as ofertas.</p>
          <button class="ept-retry" @click="getProdutoLojaVendedor">Tentar novamente</button>
        </div>

        <div v-else-if="!lojasPagina.length" class="ept-empty">
          <span class="material-symbols-outlined">storefront</span>
          <p>Nenhuma oferta encontrada.</p>
        </div>

        <!-- ══ GRUPO POR LOJA ══ -->
        <div v-else v-for="loja in lojasPagina" :key="loja.id_loja" class="ept-loja-group">
          <div class="ept-loja-head" @click="toggleLoja(loja.id_loja)">
            <span class="material-symbols-outlined">storefront</span>
            <div class="ept-loja-info">
              <span class="ept-loja-nome poppins-medium">{{ loja.nome_fantasia || 'Loja' }}</span>
              <span class="ept-loja-sub poppins-regular">CNPJ {{ formatCnpj(loja.cnpj) }} · {{ loja.produtos.length }} produto(s)</span>
            </div>
            <span
              class="material-symbols-outlined ept-expand-ic"
              :class="{ open: lojaExpandida === loja.id_loja }"
            >expand_more</span>
          </div>

          <div v-if="lojaExpandida === loja.id_loja" class="ept-prod-list">
            <div v-for="p in loja.produtos" :key="p.id_produto_vendedor" class="ept-prod-card" @click="toggleExpand(p)">
              <div class="ept-prod-row">
                <div class="ept-prod-info">
                  <span class="ept-prod-nome poppins-medium">{{ p.nome }}</span>
                  <span class="ept-prod-sub poppins-regular">
                    <span v-if="p.codigo_barra">EAN {{ p.codigo_barra }} · </span>Enviado em {{ formatData(p.anunciado_em) }}
                  </span>
                </div>
                <!--
                  <span class="ept-status" :class="'st-' + p.status">{{ statusLabel(p.status) }}</span>
                -->
                <span
                  v-if="p.motivo_recusa"
                  class="material-symbols-outlined ept-expand-ic"
                  :class="{ open: expandido === chaveProduto(p) }"
                >expand_more</span>
              </div>
              <div v-if="p.motivo_recusa && expandido === chaveProduto(p)" class="ept-motivo">
                <span class="material-symbols-outlined">info</span>
                <span><strong>Motivo:</strong> {{ p.motivo_recusa }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ══ PAGINAÇÃO ══ -->
      <div class="ept-pager" v-if="!loading && totalPaginas > 1">
        <button class="ept-pager-btn" :disabled="paginaAtual === 1" @click="paginaAtual--">
          <span class="material-symbols-outlined">chevron_left</span>
        </button>
        <span class="ept-pager-label poppins-regular">Página {{ paginaAtual }} de {{ totalPaginas }}</span>
        <button class="ept-pager-btn" :disabled="paginaAtual === totalPaginas" @click="paginaAtual++">
          <span class="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
    </div>
  </ion-modal>
</template>

<script>
import { IonModal } from '@ionic/vue';
import { api } from '@/services/api';

export default {
  name: 'ModalConsultaOfertasLoja',
  components: { IonModal },
  props: {
    isOpen: { type: Boolean, default: false },
    idVendedor: { type: [String, Number], required: true },
  },
  emits: ['update:isOpen'],
  data() {
    return {
      registros: [],
      loading: false,
      erro: false,
      busca: '',
      filtroStatus: 'todos',
      paginaAtual: 1,
      lojasPorPagina: 5,
      lojaExpandida: null,
      expandido: null,
      statusLabels: { nao_lido: 'Não lido', lido: 'Lido', escolhido: 'Escolhido', recusado: 'Recusado' },
    };
  },
  computed: {
    lojasAgrupadas() {
      const termo = this.busca.trim().toLowerCase();
      const mapa = new Map();

      for (const r of this.registros) {
        if (this.filtroStatus !== 'todos' && r.status !== this.filtroStatus) continue;

        if (termo) {
          const alvo = `${r.nome} ${r.codigo_barra || ''} ${r.nome_fantasia || ''}`.toLowerCase();
          if (!alvo.includes(termo)) continue;
        }

        if (!mapa.has(r.id_loja)) {
          mapa.set(r.id_loja, { id_loja: r.id_loja, nome_fantasia: r.nome_fantasia, cnpj: r.cnpj, produtos: [] });
        }
        mapa.get(r.id_loja).produtos.push(r);
      }
      return Array.from(mapa.values());
    },
    totalPaginas() {
      return Math.max(1, Math.ceil(this.lojasAgrupadas.length / this.lojasPorPagina));
    },
    lojasPagina() {
      const inicio = (this.paginaAtual - 1) * this.lojasPorPagina;
      return this.lojasAgrupadas.slice(inicio, inicio + this.lojasPorPagina);
    },
  },
  watch: {
    isOpen(val) {
      if (val) {
        this.busca = '';
        this.filtroStatus = 'todos';
        this.paginaAtual = 1;
        this.lojaExpandida = null;
        this.expandido = null;
        this.getProdutoLojaVendedor();
      }
    },
  },
  methods: {
    async getProdutoLojaVendedor() {
      this.loading = true;
      this.erro = false;
      try {
        const response = await api.get(`/mvpu/cotacao/vendedorConsLojaProd/${this.idVendedor}`);
        const payload = response.data?.data;
        this.registros = Array.isArray(payload) ? payload : (payload?.produtos || []);
      } catch (err) {
        this.erro = true;
        this.registros = [];
      } finally {
        this.loading = false;
      }
    },
    toggleLoja(idLoja) {
      this.lojaExpandida = this.lojaExpandida === idLoja ? null : idLoja;
      this.expandido = null;
    },
    chaveProduto(p) { return `${p.id_loja}-${p.id_produto_vendedor}`; },
    toggleExpand(p) {
      if (!p.motivo_recusa) return;
      const chave = this.chaveProduto(p);
      this.expandido = this.expandido === chave ? null : chave;
    },
    statusLabel(s) { return this.statusLabels[s] || s; },
    formatCnpj(cnpj) {
      if (!cnpj) return '-';
      const v = String(cnpj).replace(/\D/g, '');
      return v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    },
    formatData(ts) {
      if (!ts) return '-';
      const d = new Date(Number(ts));
      const data = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      return `${data} às ${hora}`;
    },
    fechar() { this.$emit('update:isOpen', false); },
  },
};
</script>

<style scoped>
.ept-modal {
  --width: 100%; --max-width: 480px; --height: auto; --max-height: 86vh;
  --border-radius: 22px; --box-shadow: 0 24px 60px rgba(15, 23, 42, 0.28); --background: #fff;
}
.ept-modal-lg { --max-width: 560px; }
@media (max-width: 400px) { .ept-modal { --width: 92vw; --max-height: 90vh; --border-radius: 20px; } }

.ept-wrapper { display: flex; flex-direction: column; max-height: 86vh; }

.ept-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding: 22px 22px 14px; border-bottom: 1px solid #f1f5f9; }
.ept-title { font-size: 19px; color: #1e293b; margin: 0 0 4px; line-height: 1.3; }
.ept-subtitle { font-size: 13px; color: #64748b; margin: 0; line-height: 1.5; }
.ept-close { flex-shrink: 0; width: 34px; height: 34px; border: none; background: #f1f5f9; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #64748b; }
.ept-close .material-symbols-outlined { font-size: 20px; }

.ept-filters { display: flex; gap: 8px; margin: 14px 22px 0; }
.ept-search-box { flex: 1; display: flex; align-items: center; gap: 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px 14px; min-width: 0; }
.ept-search-box .material-symbols-outlined { font-size: 19px; color: #94a3b8; }
.ept-search-box input { border: none; outline: none; background: transparent; font-size: 14px; color: #1e293b; width: 100%; }
.ept-select { border: 1px solid #e2e8f0; background: #f8fafc; border-radius: 12px; padding: 0 10px; font-size: 12.5px; color: #334155; flex-shrink: 0; }

.ept-scroll { overflow-y: auto; -webkit-overflow-scrolling: touch; padding: 14px 22px 6px; display: flex; flex-direction: column; gap: 18px; }

.ept-loja-group { display: flex; flex-direction: column; gap: 8px; }
.ept-loja-head {
  display: flex; align-items: center; gap: 10px; cursor: pointer;
  background: #fff7ed; border: 1px solid #ffe3d1; border-radius: 14px; padding: 12px 14px;
}
.ept-loja-head > .material-symbols-outlined:first-child { font-size: 20px; color: #ff8049; }
.ept-loja-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.ept-loja-nome { font-size: 14.5px; color: #1e293b; }
.ept-loja-sub { font-size: 12px; color: #94a3b8; }

.ept-prod-list { display: flex; flex-direction: column; gap: 8px; padding-left: 4px; }
.ept-prod-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 12px; cursor: pointer; }
.ept-prod-row { display: flex; align-items: center; gap: 10px; }
.ept-prod-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.ept-prod-nome { font-size: 13.5px; color: #1e293b; }
.ept-prod-sub { font-size: 12px; color: #94a3b8; }

.ept-status { flex-shrink: 0; font-size: 11.5px; font-weight: 600; border-radius: 20px; padding: 5px 11px; white-space: nowrap; }
.st-nao_lido { background: #f1f5f9; color: #64748b; }
.st-lido { background: #dbeafe; color: #2563eb; }
.st-escolhido { background: #dcfce7; color: #16a34a; }
.st-recusado { background: #fee2e2; color: #dc2626; }

.ept-expand-ic { font-size: 20px; color: #94a3b8; transition: transform 0.15s; flex-shrink: 0; }
.ept-expand-ic.open { transform: rotate(180deg); }

.ept-motivo { display: flex; gap: 8px; align-items: flex-start; margin-top: 10px; padding-top: 10px; border-top: 1px dashed #e2e8f0; font-size: 12.5px; color: #7c4a2d; line-height: 1.5; }
.ept-motivo .material-symbols-outlined { font-size: 16px; flex-shrink: 0; margin-top: 1px; color: #dc2626; }

.ept-empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 36px 16px; text-align: center; color: #94a3b8; }
.ept-empty .material-symbols-outlined { font-size: 34px; }
.ept-empty p { font-size: 13px; margin: 0; }
.ept-retry { margin-top: 4px; border: 1px solid #e2e8f0; background: #fff; border-radius: 10px; padding: 8px 16px; font-size: 12.5px; color: #ff8049; }

.ept-loja-card.skeleton { display: flex; align-items: center; gap: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 12px; }
.sk-avatar { width: 44px; height: 44px; border-radius: 12px; background: #e2e8f0; flex-shrink: 0; animation: sk-pulse 1.2s infinite ease-in-out; }
.sk-lines { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.sk-line { height: 10px; border-radius: 6px; background: #e2e8f0; animation: sk-pulse 1.2s infinite ease-in-out; }
@keyframes sk-pulse { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }

.ept-pager { flex-shrink: 0; display: flex; align-items: center; justify-content: center; gap: 14px; padding: 14px 22px 20px; border-top: 1px solid #f1f5f9; }
.ept-pager-btn { width: 34px; height: 34px; border: 1px solid #e2e8f0; background: #fff; border-radius: 10px; color: #475569; display: flex; align-items: center; justify-content: center; }
.ept-pager-btn:disabled { opacity: 0.4; }
.ept-pager-label { font-size: 12.5px; color: #64748b; }
</style>