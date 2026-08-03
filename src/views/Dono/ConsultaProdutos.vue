<template>
  <ion-page class="cp-page">
    <ion-content :fullscreen="true" class="cp-content">

      <!-- ══ HEADER ══ -->
      <div class="cp-header">
        <div class="cp-header-left">
          <button class="back-btn" @click="$router.back()">
            <span class="material-symbols-outlined">arrow_back_ios_new</span>
          </button>
          <div class="page-identity">
            <span class="page-label">PRODUTOS</span>
            <span class="page-name">Consultar produtos</span>
          </div>
        </div>
        <div class="total-chip" v-if="!loading && totalRegistros > 0">
          <span class="material-symbols-outlined">inventory_2</span>
          {{ totalRegistros }}
        </div>
      </div>

      <!-- ══ BARRA DE BUSCA ══ -->
      <div class="search-card">
        <div class="search-wrap">
          <span class="material-symbols-outlined search-icon">search</span>
          <input
            type="text"
            class="search-input poppins-regular"
            placeholder="Nome, categoria ou código..."
            v-model="search"
            @input="onSearchInput"
          />
          <button class="search-clear" v-if="search" @click="limparBusca">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Filtros rápidos (chips horizontais) -->
        <div class="filter-row">
          <button
            :class="['filter-chip poppins-medium', { active: !filterStatus && filterPromo === null }]"
            @click="clearFilters"
          >Todos</button>

          <!--
          <button
            :class="['filter-chip poppins-medium', { active: filterStatus === 'ativo' }]"
            @click="setStatus('ativo')"
          >
            <span class="chip-dot dot-green"></span>Ativos
          </button>
          <button
            :class="['filter-chip poppins-medium', { active: filterStatus === 'desativado' }]"
            @click="setStatus('desativado')"
          >
            <span class="chip-dot dot-red"></span>Desativados
          </button>
          <button
            :class="['filter-chip poppins-medium', { active: filterPromo === true }]"
            @click="setPromo(true)"
          >
            <span class="material-symbols-outlined" style="font-size:13px;">local_offer</span>Com promo
          </button>
          <button
            :class="['filter-chip poppins-medium', { active: filterPromo === false }]"
            @click="setPromo(false)"
          >Sem promo</button>
          -->
        </div>
      </div>

      <!-- ══ LOADING ══ -->
      <div v-if="loading" class="feedback-container">
        <ion-spinner name="crescent" style="color:#ff8049; width:40px; height:40px;"></ion-spinner>
        <span class="feedback-text poppins-regular">Buscando produtos...</span>
      </div>

      <!-- ══ VAZIO ══ -->
      <div v-else-if="!loading && produtos.length === 0" class="feedback-container">
        <span class="material-symbols-outlined empty-icon">inventory_2</span>
        <span class="feedback-text poppins-medium">Nenhum produto encontrado</span>
        <span class="feedback-sub poppins-regular">Tente ajustar o filtro ou a busca</span>
      </div>

      <!-- ══ LISTA DE PRODUTOS ══ -->
      <div v-else class="list-area">
        <div
          v-for="produto in produtos"
          :key="produto.id_produto"
          class="produto-card"
          @click="toggleExpand(produto.id_produto)"
        >
          <!-- Linha principal -->
          <div class="card-main">
            <div class="card-info">
              <span class="card-nome poppins-semibold">{{ produto.nome }}</span>
              <span class="card-codigo mono poppins-regular">{{ produto.codigo_barra }}</span>
              <div class="card-precos">
                <span class="preco-label poppins-regular">Custo</span>
                <span class="preco-val poppins-semibold">R$ {{ Number(produto.preco_custo).toFixed(2) }}</span>
                <span class="preco-sep">·</span>
                <span class="preco-label poppins-regular">Venda</span>
                <span class="preco-val preco-venda poppins-semibold">R$ {{ Number(produto.preco_venda).toFixed(2) }}</span>
              </div>
            </div>
            <div class="card-right">
              <span :class="['status-badge poppins-medium', produto.status === 'ativo' ? 'badge-ativo' : 'badge-desativado']">
                {{ produto.status === 'ativo' ? 'Ativo' : 'Inativo' }}
              </span>
              <span class="expand-icon material-symbols-outlined" :class="{ rotated: expandedId === produto.id_produto }">
                expand_more
              </span>
            </div>
          </div>

          <!-- Expansão detalhes -->
          <transition name="expand">
            <div v-if="expandedId === produto.id_produto" class="card-expansion">

              <!-- Precificação e Promoção -->
              <div class="detail-section">
                <span class="detail-section-title poppins-semibold title-purple">
                  <span class="material-symbols-outlined" style="font-size:14px;">payments</span>
                  Precificação e Promoção
                </span>
                <div class="detail-grid">
                  <div class="detail-item">
                    <span class="detail-label poppins-regular">Preço Custo</span>
                    <span class="detail-val poppins-semibold">R$ {{ produto.preco_custo }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label poppins-regular">Margem</span>
                    <span class="detail-val poppins-semibold">{{ produto.margem }}%</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label poppins-regular">Promoção (%)</span>
                    <span class="detail-val poppins-semibold">{{ produto.porcentagem_promo || '0' }}%</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label poppins-regular">Último Reajuste</span>
                    <span class="detail-val poppins-semibold">{{ produto.ultimo_reajuste }}</span>
                  </div>
                  <div class="detail-item detail-item-full">
                    <span class="detail-label poppins-regular">Vigência Promoção</span>
                    <span class="detail-val poppins-semibold">{{ produto.inicio_promo }} até {{ produto.fim_promo }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label poppins-regular">Categoria</span>
                    <span class="detail-val poppins-semibold">{{ produto.categoria || '--' }}</span>
                  </div>
                </div>
              </div>

              <!-- Logística -->
              <div class="detail-section">
                <span class="detail-section-title poppins-semibold title-blue">
                  <span class="material-symbols-outlined" style="font-size:14px;">warehouse</span>
                  Logística e Identificação
                </span>
                <div class="detail-grid">
                  <div class="detail-item">
                    <span class="detail-label poppins-regular">Gôndola Estoque</span>
                    <span class="detail-val poppins-semibold">{{ produto.gondula_estoque || '--' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label poppins-regular">Gôndola Loja</span>
                    <span class="detail-val poppins-semibold">{{ produto.gondula_loja || '--' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label poppins-regular">NCM</span>
                    <span class="detail-val mono poppins-semibold">{{ produto.ncm || '--' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label poppins-regular">Busca Rápida</span>
                    <span class="detail-val poppins-semibold">{{ produto.busca_rapida || '--' }}</span>
                  </div>
                </div>
              </div>

              <!-- Estoque -->
              <div class="detail-section">
                <span class="detail-section-title poppins-semibold title-green">
                  <span class="material-symbols-outlined" style="font-size:14px;">settings</span>
                  Configurações de Estoque
                </span>
                <div class="detail-grid">
                  <div class="detail-item">
                    <span class="detail-label poppins-regular">Ajuste Automático</span>
                    <span :class="['config-badge poppins-medium', produto.ajuste_automatico ? 'badge-on' : 'badge-off']">
                      {{ produto.ajuste_automatico ? 'Habilitado' : 'Desabilitado' }}
                    </span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label poppins-regular">Controle por Lote</span>
                    <span :class="['config-badge poppins-medium', produto.controle_lote ? 'badge-on' : 'badge-off']">
                      {{ produto.controle_lote ? 'Habilitado' : 'Desabilitado' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Ações -->
              <div class="card-actions">
                <button class="action-btn-card btn-edit poppins-medium" @click.stop="editarProduto(produto)">
                  <span class="material-symbols-outlined">edit</span>
                  Editar
                </button>
                <button class="action-btn-card btn-delete poppins-medium" @click.stop="confirmarDelete(produto)">
                  <span class="material-symbols-outlined">delete</span>
                  Excluir
                </button>
              </div>
            </div>
          </transition>
        </div>
      </div>

      <!-- ══ PAGINAÇÃO ══ -->
      <div v-if="totalPaginas > 1 && !loading" class="pagination-card">
        <button
          class="page-btn"
          @click="irParaPagina(paginaAtual - 1)"
          :disabled="paginaAtual === 1"
        >
          <span class="material-symbols-outlined">chevron_left</span>
        </button>
        <div class="page-info">
          <span class="current-page poppins-semibold">{{ paginaAtual }}</span>
          <span class="poppins-regular" style="color:#94a3b8;"> / {{ totalPaginas }}</span>
          <span class="total-info poppins-regular"> · {{ totalRegistros }} produtos</span>
        </div>
        <button
          class="page-btn"
          @click="irParaPagina(paginaAtual + 1)"
          :disabled="paginaAtual === totalPaginas"
        >
          <span class="material-symbols-outlined">chevron_right</span>
        </button>
      </div>

      <!-- Espaço para o footer -->
      <div style="height: 150px; background-color: #f1f5f9;"></div>

    </ion-content>

    <!-- ══ MODAL: CONFIRMAR DELETE ══ -->
    <ion-modal :is-open="showConfirmDelete" @did-dismiss="cancelarExcluir" class="bottom-sheet">
      <ion-content class="modal-content">
        <div class="modal-handle"></div>
        <div class="modal-box">
          <div class="modal-header">
            <span class="poppins-semibold">Excluir produto?</span>
            <button class="modal-close" @click="cancelarExcluir">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="delete-info">
              <div class="delete-row">
                <span class="delete-label poppins-regular">Cód. Barras</span>
                <span class="delete-val poppins-semibold mono">{{ produtoSelecionado?.codigo_barra }}</span>
              </div>
              <div class="delete-row">
                <span class="delete-label poppins-regular">Produto</span>
                <span class="delete-val poppins-semibold">{{ produtoSelecionado?.nome }}</span>
              </div>
            </div>
            <p class="delete-warning poppins-regular">
              <span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle;color:#ef4444;margin-right:4px;">warning</span>
              Esta ação não pode ser desfeita.
            </p>
          </div>
          <div class="modal-footer">
            <button class="action-btn btn-outline poppins-medium full-w" @click="cancelarExcluir">Cancelar</button>
            <button
              class="action-btn btn-danger poppins-semibold full-w"
              style="background-color: #ff8049;"
              :disabled="loadingDelete"
              @click="excluirProduto"
            >
              <ion-spinner name="crescent" v-if="loadingDelete" style="width:16px;height:16px;"></ion-spinner>
              <span class="material-symbols-outlined" v-else>delete</span>
              {{ loadingDelete ? 'Excluindo...' : 'Excluir produto' }}
            </button>
          </div>
        </div>
      </ion-content>
    </ion-modal>

    <!-- ══ MODAL: EDITAR PRODUTO ══ -->
    <ion-modal :is-open="showEditarProduto" @did-dismiss="fecharEditar" class="bottom-sheet full-sheet">
      <ion-content class="modal-content">
        <div class="modal-handle"></div>
        <div class="modal-box">
          <div class="modal-header">
            <div style="display:flex;flex-direction:column;gap:2px;min-width:0;">
              <span class="poppins-semibold" style="font-size:15px;">Editar produto</span>
              <span class="poppins-regular" style="font-size:11px;color:#94a3b8;">
                ID #{{ produtoSelecionado?.id_produto }} · {{ produtoSelecionado?.codigo_barra }}
              </span>
            </div>
            <button class="modal-close" @click="fecharEditar">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <div class="modal-body" v-if="produtoSelecionado">
            <p class="edit-hint poppins-regular">Campos marcados com (*) são obrigatórios.</p>

            <!-- Nome -->
            <div class="form-group">
              <label class="form-label poppins-medium">Nome do produto <span class="req-star">*</span></label>
              <div class="input-wrap">
                <span class="material-symbols-outlined input-icon">label</span>
                <input
                  type="text"
                  class="form-input poppins-regular"
                  placeholder="Nome do produto"
                  v-model="produtoSelecionado.nome"
                />
              </div>
            </div>

            <!-- Preço custo + Margem + Venda -->
            <div class="form-row-3">
              <div class="form-group">
                <label class="form-label poppins-medium">Custo <span class="req-star">*</span></label>
                <div class="input-wrap">
                  <span class="material-symbols-outlined input-icon">payments</span>
                  <input
                    type="number"
                    class="form-input poppins-regular"
                    placeholder="R$ 0,00"
                    v-model="produtoSelecionado.preco_custo"
                    @input="atualizarVendaManual"
                    inputmode="decimal"
                    step="0.01"
                  />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label poppins-medium">Margem (%) <span class="req-star">*</span></label>
                <div class="input-wrap">
                  <span class="material-symbols-outlined input-icon">percent</span>
                  <input
                    type="number"
                    class="form-input poppins-regular"
                    placeholder="Ex: 30"
                    v-model="produtoSelecionado.margem"
                    @input="atualizarVendaManual"
                    inputmode="decimal"
                  />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label poppins-medium">Preço Venda</label>
                <div class="input-wrap input-disabled">
                  <span class="material-symbols-outlined input-icon">calculate</span>
                  <input
                    type="text"
                    class="form-input poppins-regular"
                    :value="calculoPrecoCusto"
                    disabled
                  />
                </div>
              </div>
            </div>

            <!-- Gôndolas -->
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label poppins-medium">Gôndola Estoque <span class="req-star">*</span></label>
                <div class="input-wrap">
                  <span class="material-symbols-outlined input-icon">warehouse</span>
                  <input
                    type="text"
                    class="form-input poppins-regular"
                    placeholder="Ex: B7"
                    v-model="produtoSelecionado.gondula_estoque"
                  />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label poppins-medium">Gôndola Loja <span class="req-star">*</span></label>
                <div class="input-wrap">
                  <span class="material-symbols-outlined input-icon">store</span>
                  <input
                    type="text"
                    class="form-input poppins-regular"
                    placeholder="Ex: A3"
                    v-model="produtoSelecionado.gondula_loja"
                  />
                </div>
              </div>
            </div>

            <!-- NCM -->
            <div class="form-group">
              <label class="form-label poppins-medium">NCM</label>
              <div class="input-wrap">
                <span class="material-symbols-outlined input-icon">receipt_long</span>
                <input
                  type="text"
                  class="form-input poppins-regular mono"
                  placeholder="Ex: 1006.30.21"
                  v-model="produtoSelecionado.ncm"
                />
              </div>
            </div>

            <!-- Toggles -->
            <div class="toggles-section">
              <button
                :class="['toggle-row', { 'toggle-active': produtoSelecionado.controle_lote }]"
                @click="produtoSelecionado.controle_lote = !produtoSelecionado.controle_lote"
              >
                <div class="toggle-info">
                  <span class="material-symbols-outlined toggle-icon">layers</span>
                  <span class="poppins-medium" style="font-size:13px;color:#1e293b;">Controle por lote</span>
                </div>
                <div :class="['toggle-switch', { on: produtoSelecionado.controle_lote }]">
                  <div class="toggle-thumb"></div>
                </div>
              </button>

              <button
                :class="['toggle-row', { 'toggle-active': produtoSelecionado.ajuste_automatico }]"
                @click="produtoSelecionado.ajuste_automatico = !produtoSelecionado.ajuste_automatico"
              >
                <div class="toggle-info">
                  <span class="material-symbols-outlined toggle-icon">autorenew</span>
                  <span class="poppins-medium" style="font-size:13px;color:#1e293b;">Reajuste automático de preço</span>
                </div>
                <div :class="['toggle-switch', { on: produtoSelecionado.ajuste_automatico }]">
                  <div class="toggle-thumb"></div>
                </div>
              </button>

              <button
                :class="['toggle-row', { 'toggle-active': produtoSelecionado.desativado }]"
                @click="produtoSelecionado.desativado = !produtoSelecionado.desativado"
              >
                <div class="toggle-info">
                  <span class="material-symbols-outlined toggle-icon">block</span>
                  <span class="poppins-medium" style="font-size:13px;color:#1e293b;">Desativar produto</span>
                </div>
                <div :class="['toggle-switch', { on: produtoSelecionado.desativado }]">
                  <div class="toggle-thumb"></div>
                </div>
              </button>
            </div>
          </div>

          <div class="modal-footer">
            <button class="action-btn btn-outline poppins-medium full-w" @click="fecharEditar">Cancelar</button>
            <button
              class="action-btn btn-primary poppins-semibold full-w"
              :disabled="loadingEdit"
              @click="editarConfirmarProduto"
            >
              <ion-spinner name="crescent" v-if="loadingEdit" style="width:16px;height:16px;"></ion-spinner>
              <span class="material-symbols-outlined" v-else>check_circle</span>
              {{ loadingEdit ? 'Salvando...' : 'Salvar alterações' }}
            </button>
          </div>
        </div>
      </ion-content>
    </ion-modal>

    <!-- ══ TOASTS ══ -->
    <transition-group name="toast" tag="div" class="toast-container">
      <div v-for="t in toasts" :key="t.id" :class="['toast-item', t.type, 'poppins-medium']">
        <span class="material-symbols-outlined">
          {{ t.type === 'success' ? 'check_circle' : t.type === 'error' ? 'error' : 'info' }}
        </span>
        {{ t.message }}
      </div>
    </transition-group>

  </ion-page>
</template>

<script>
import { IonPage, IonContent, IonSpinner, IonModal } from '@ionic/vue'
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import exibeErro from '@/utils/ExibeErro'

export default {
  name: 'ConsultaProdutosMobile',
  components: { IonPage, IonContent, IonSpinner, IonModal },

  data() {
    return {
      // busca e filtros
      search: '',
      searchTimer: null,
      filterStatus: null,
      filterPromo: null,

      // estado UI
      loading: false,
      loadingDelete: false,
      loadingEdit: false,
      expandedId: null,

      // dados
      produtos: [],
      paginaAtual: 1,
      itensPorPagina: 15,
      totalRegistros: 0,

      // auth
      auth: null,

      // modais
      produtoSelecionado: null,
      showEditarProduto: false,
      showConfirmDelete: false,

      // toasts
      toasts: [],
      toastId: 0,
    }
  },

  computed: {
    totalPaginas() {
      return Math.ceil(this.totalRegistros / this.itensPorPagina) || 1
    },

    calculoPrecoCusto() {
      if (!this.produtoSelecionado) return '0.00'
      const custo  = parseFloat(this.produtoSelecionado.preco_custo) || 0
      const margem = parseFloat(this.produtoSelecionado.margem) || 0
      return (custo * (1 + margem / 100)).toFixed(2)
    },
  },

  methods: {
    // ── Toasts ──────────────────────────────────────────────────
    showToast(message, type = 'info') {
      const id = ++this.toastId
      this.toasts.push({ id, message, type })
      setTimeout(() => { this.toasts = this.toasts.filter(t => t.id !== id) }, 3500)
    },

    // ── Filtros ──────────────────────────────────────────────────
    setStatus(status) {
      this.filterStatus = status
      this.filterPromo  = null
      this.paginaAtual  = 1
      this.receberPaginado()
    },

    setPromo(valor) {
      this.filterPromo  = valor
      this.filterStatus = null
      this.paginaAtual  = 1
      this.receberPaginado()
    },

    clearFilters() {
      this.filterStatus = null
      this.filterPromo  = null
      this.search       = ''
      this.paginaAtual  = 1
      this.receberPaginado()
    },

    limparBusca() {
      this.search      = ''
      this.paginaAtual = 1
      this.receberPaginado()
    },

    onSearchInput() {
      clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => {
        this.paginaAtual = 1
        this.receberPaginado()
      }, 400)
    },

    irParaPagina(pagina) {
      if (pagina < 1 || pagina > this.totalPaginas) return
      this.paginaAtual = pagina
      this.receberPaginado()
    },

    // ── Expand ───────────────────────────────────────────────────
    toggleExpand(id) {
      this.expandedId = this.expandedId === id ? null : id
    },

    // ── Mapear produto ───────────────────────────────────────────
    formatarDataHora(v) {
      if (!v) return '--'
      const d = new Date(Number(v))
      return isNaN(d.getTime()) ? '--' : d.toLocaleString('pt-BR')
    },

    mapearProduto(p) {
      return {
        ...p,
        status:         p.desativado ? 'desativado' : 'ativo',
        desativado:     !!p.desativado,
        inicio_promo:   p.inicio_promo ? this.formatarDataHora(p.inicio_promo) : '--',
        fim_promo:      p.fim_promo    ? this.formatarDataHora(p.fim_promo)    : '--',
        ultimo_reajuste: this.formatarDataHora(p.ultimo_reajuste),
      }
    },

    // ── Consultar ────────────────────────────────────────────────
    async receberPaginado() {
      try {
        this.loading    = true
        this.expandedId = null
        this.auth       = useAuthStore()

        const params = {
          page:   this.paginaAtual,
          limit:  this.itensPorPagina,
          search: this.search   || undefined,
          status: this.filterStatus || undefined,
          promo:  this.filterPromo !== null ? this.filterPromo : undefined,
        }

        const res = await api.get(
          `/mvpu/produto/consultarProdutos/${this.auth.loja.id_loja}`,
          { params }
        )

        const d             = res.data
        this.produtos       = (d.data || []).map(p => this.mapearProduto(p))
        this.totalRegistros = d.total ?? this.produtos.length

      } catch (e) {
        exibeErro(e, this.$toast)
      } finally {
        this.loading = false
      }
    },

    // ── Editar ───────────────────────────────────────────────────
    editarProduto(produto) {
      this.produtoSelecionado = { ...produto }
      this.showEditarProduto  = true
    },

    fecharEditar() {
      this.showEditarProduto  = false
      this.produtoSelecionado = null
    },

    atualizarVendaManual() {
      // Computed já faz o cálculo, método deixado para compatibilidade
    },

    async editarConfirmarProduto() {

        

      const camposObrigatorios = ['nome', 'codigo_barra', 'preco_custo', 'margem']

      for (const campo of camposObrigatorios) {
        if (!this.produtoSelecionado[campo] && this.produtoSelecionado[campo] !== 0) {

          this.$toast.add({ 
            severity: 'info', 
            summary: 'Dados faltantes', 
            detail: `Campo obrigatório: ${campo}`, 
            life: 3000 
          });
          return
        }
      }

      try {
        this.loadingEdit = true
        this.auth        = useAuthStore()

        const payload = {
          nome:              this.produtoSelecionado.nome,
          codigo_barra:      this.produtoSelecionado.codigo_barra,
          busca_rapida:      this.produtoSelecionado.busca_rapida  || null,
          preco_custo:       parseFloat(this.produtoSelecionado.preco_custo),
          margem:            parseFloat(this.produtoSelecionado.margem),
          ncm:               this.produtoSelecionado.ncm           || null,
          gondula_estoque:   this.produtoSelecionado.gondula_estoque,
          gondula_loja:      this.produtoSelecionado.gondula_loja,
          controle_lote:     this.produtoSelecionado.controle_lote     ? 1 : 0,
          ajuste_automatico: this.produtoSelecionado.ajuste_automatico ? 1 : 0,
          desativado:        this.produtoSelecionado.desativado ? Date.now() : null,
          id_loja:           this.auth.loja.id_loja,
        }

        await api.put('/mvpu/produto/editarProduto', payload)

        this.$toast.add({ 
            severity: 'success', 
            summary: 'Sucesso!', 
            detail: 'Produto editado com sucesso!', 
            life: 3000 
        });

        this.fecharEditar()
        await this.receberPaginado()

      } catch (e) {
        exibeErro(e, this.$toast)
      } finally {
        this.loadingEdit = false
      }
    },

    // ── Deletar ──────────────────────────────────────────────────
    confirmarDelete(produto) {
      this.produtoSelecionado = produto
      this.showConfirmDelete  = true
    },

    cancelarExcluir() {
      this.showConfirmDelete  = false
      this.produtoSelecionado = null
    },

    async excluirProduto() {
      try {
        this.loadingDelete = true
        this.auth          = useAuthStore()

        const payload = {
          itens_deletados: [{ codigo_barra: this.produtoSelecionado.codigo_barra }]
        }

        await api.delete(`/mvpu/produto/deletarProduto/${this.auth.loja.id_loja}`, { data: payload })

        this.$toast.add({ 
            severity: 'success', 
            summary: 'Sucesso!', 
            detail: 'Produto excluido com sucesso!', 
            life: 3000 
        });

        this.cancelarExcluir()

        if (this.produtos.length === 1 && this.paginaAtual > 1) this.paginaAtual--
        await this.receberPaginado()

      } catch (e) {
        exibeErro(e, this.$toast)
      } finally {
        this.loadingDelete = false
      }
    },
  },

  mounted() {
    this.auth = useAuthStore()
    this.receberPaginado()
  },

  beforeUnmount() {
    clearTimeout(this.searchTimer)
  },
}
</script>

<style scoped>
/* ══ VARIÁVEIS ══ */
:root {
  --primary:       #ff8049;
  --primary-light: rgba(255,128,73,.10);
  --success:       #10b981;
  --error:         #ef4444;
  --border:        #e2e8f0;
  --bg:            #f8fafc;
  --text:          #1e293b;
  --muted:         #64748b;
  --card-bg:       #ffffff;
}

/* ══ PAGE ══ */
.cp-page    { --background: #f1f5f9; }
.cp-content { --background: #f1f5f9; }

/* ══ HEADER ══ */
.cp-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 16px 10px;
  background: #fff;
  border-bottom: 1px solid var(--border);
  position: sticky; top: 0; z-index: 100;
}
.cp-header-left { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
.back-btn {
  background: none; border: none; cursor: pointer;
  color: var(--muted); display: flex; align-items: center; padding: 4px; flex-shrink: 0;
}
.back-btn span { font-size: 20px; }
.page-identity { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.page-label {
  font-size: 9px; font-weight: 600; letter-spacing: 1px;
  color: #ff8049; font-family: 'Poppins', sans-serif; text-transform: uppercase;
}
.page-name {
  font-size: 15px; color: var(--text);
  font-family: 'Poppins', sans-serif; font-weight: 600;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.total-chip {
  display: flex; align-items: center; gap: 5px;
  background: #ff8049; color: #fff;
  padding: 5px 10px; border-radius: 20px;
  font-size: 12px; font-family: 'Poppins', sans-serif; font-weight: 600;
  flex-shrink: 0;
}
.total-chip span { font-size: 14px; }

/* ══ BUSCA ══ */
.search-card {
  background: #fff;
  margin: 10px 14px 0;
  border-radius: 16px;
  border: 1px solid var(--border);
  padding: 12px 14px;
}
.search-wrap {
  display: flex; align-items: center;
  background: var(--bg); border: 1.5px solid var(--border);
  border-radius: 12px; padding: 0 12px;
  transition: border-color .2s;
  margin-bottom: 10px;
}
.search-wrap:focus-within { border-color: #ff8049; background: #fff; }
.search-icon { font-size: 18px; color: var(--muted); flex-shrink: 0; margin-right: 8px; }
.search-input {
  flex: 1; background: none; border: none; outline: none;
  padding: 11px 0; font-size: 13px; color: var(--text);
  font-family: 'Poppins', sans-serif;
}
.search-input::placeholder { color: #b0bec5; }
.search-clear {
  background: none; border: none; cursor: pointer;
  color: var(--muted); display: flex; align-items: center; padding: 4px;
}
.search-clear span { font-size: 18px; }

/* Filtros chips */
.filter-row {
  display: flex; gap: 7px; overflow-x: auto; padding-bottom: 2px;
  scrollbar-width: none;
}
.filter-row::-webkit-scrollbar { display: none; }
.filter-chip {
  display: flex; align-items: center; gap: 4px;
  padding: 6px 12px; border-radius: 20px;
  border: 1.5px solid var(--border);
  background: var(--bg); color: var(--muted);
  font-size: 12px; font-family: 'Poppins', sans-serif;
  white-space: nowrap; cursor: pointer;
  transition: all .2s; flex-shrink: 0;
}
.filter-chip.active {
  background: rgba(255,128,73,.12);
  border-color: #ff8049; color: #ff8049;
}
.chip-dot {
  width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
}
.dot-green { background: #22c55e; }
.dot-red   { background: #ef4444; }

/* ══ FEEDBACK (loading / vazio) ══ */
.feedback-container {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 60px 20px; gap: 10px;
}
.empty-icon { font-size: 56px; color: #cbd5e1; }
.feedback-text { font-size: 14px; color: var(--text); font-family: 'Poppins', sans-serif; }
.feedback-sub  { font-size: 12px; color: var(--muted); font-family: 'Poppins', sans-serif; }

/* ══ LISTA ══ */
.list-area {
  margin: 10px 14px 0;
  display: flex; flex-direction: column; gap: 8px;
}

/* ══ CARD PRODUTO ══ */
.produto-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid var(--border);
  overflow: hidden;
  transition: border-color .2s, box-shadow .2s;
}
.produto-card:active { opacity: .97; }

.card-main {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 14px; cursor: pointer;
}
.card-info { flex: 1; min-width: 0; }
.card-nome {
  display: block; font-size: 13px; color: var(--text);
  font-family: 'Poppins', sans-serif; font-weight: 600;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  margin-bottom: 3px;
}
.card-codigo {
  display: block; font-size: 11px; color: #6366f1;
  font-family: 'Courier New', monospace; margin-bottom: 6px;
}
.card-precos {
  display: flex; flex-wrap: wrap; align-items: center; gap: 4px;
}
.preco-label { font-size: 10px; color: var(--muted); font-family: 'Poppins', sans-serif; }
.preco-val   { font-size: 12px; color: var(--text);  font-family: 'Poppins', sans-serif; font-weight: 600; }
.preco-venda { color: #ff8049; }
.preco-sep   { font-size: 10px; color: #cbd5e1; }

.card-right {
  display: flex; flex-direction: column; align-items: flex-end; gap: 8px; flex-shrink: 0;
}
.status-badge {
  padding: 3px 10px; border-radius: 20px;
  font-size: 11px; font-family: 'Poppins', sans-serif;
}
.badge-ativo       { background: rgba(16,185,129,.12); color: #059669; }
.badge-desativado  { background: rgba(245,158,11,.12);  color: #b45309; }

.expand-icon {
  font-size: 20px; color: var(--muted);
  transition: transform .25s ease;
}
.expand-icon.rotated { transform: rotate(180deg); }

/* ══ EXPANSÃO ══ */
.card-expansion {
  border-top: 1px solid var(--bg);
  padding: 14px;
  background: #fcfcfd;
}
.detail-section { margin-bottom: 14px; }
.detail-section:last-of-type { margin-bottom: 0; }

.detail-section-title {
  display: flex; align-items: center; gap: 5px;
  font-size: 10px; text-transform: uppercase; letter-spacing: .5px;
  font-family: 'Poppins', sans-serif;
  margin-bottom: 10px; padding-bottom: 6px;
  border-bottom: 1px solid var(--bg);
}
.title-purple { color: #5A0F83; }
.title-blue   { color: #0284c7; }
.title-green  { color: #10b981; }

.detail-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
}
.detail-item { display: flex; flex-direction: column; gap: 2px; }
.detail-item-full { grid-column: 1 / -1; }
.detail-label {
  font-size: 9px; text-transform: uppercase; letter-spacing: .5px;
  color: #94a3b8; font-family: 'Poppins', sans-serif;
}
.detail-val {
  font-size: 13px; color: var(--text);
  font-family: 'Poppins', sans-serif;
}
.config-badge {
  display: inline-block; padding: 2px 8px; border-radius: 10px;
  font-size: 10px; font-family: 'Poppins', sans-serif;
}
.badge-on  { background: rgba(16,185,129,.12); color: #059669; }
.badge-off { background: rgba(100,116,139,.1);  color: var(--muted); }

/* Ações dentro do card */
.card-actions {
  display: flex; gap: 8px; margin-top: 14px;
  border-top: 1px solid var(--bg); padding-top: 12px;
}
.action-btn-card {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
  padding: 10px; border-radius: 12px; border: none;
  font-size: 13px; cursor: pointer; font-family: 'Poppins', sans-serif;
  transition: all .2s;
}
.btn-edit   { background: rgba(59,130,246,.1); color: #2563eb; }
.btn-delete { background: rgba(239,68,68,.1);  color: #dc2626; }
.action-btn-card:active { filter: brightness(.93); }
.action-btn-card span { font-size: 17px; }

/* Animação expand */
.expand-enter-active, .expand-leave-active { transition: all .25s ease; overflow: hidden; }
.expand-enter-from, .expand-leave-to { opacity: 0; max-height: 0; }
.expand-enter-to, .expand-leave-from { opacity: 1; max-height: 800px; }

/* ══ PAGINAÇÃO ══ */
.pagination-card {
  display: flex; align-items: center; justify-content: center; gap: 16px;
  margin: 14px 14px 0;
  background: #fff; border: 1px solid var(--border);
  border-radius: 16px; padding: 10px 16px;
}
.page-btn {
  width: 38px; height: 38px; border-radius: 50%;
  background: #ff8049; border: none; color: #fff;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all .2s; flex-shrink: 0;
}
.page-btn:disabled { background: #fed7aa; cursor: not-allowed; }
.page-btn:not(:disabled):active { background: #e06e3a; transform: scale(.95); }
.page-btn span { font-size: 20px; }
.page-info { display: flex; align-items: center; gap: 2px; }
.current-page { font-size: 16px; color: var(--text); font-family: 'Poppins', sans-serif; }
.total-info { font-size: 11px; color: #94a3b8; font-family: 'Poppins', sans-serif; }

/* ══ MODAIS ══ */
ion-modal.bottom-sheet {
  --border-radius: 20px 20px 0 0;
  --box-shadow: 0 -4px 24px rgba(0,0,0,.1);
  align-items: flex-end;
}
ion-modal.full-sheet {
  --height: 90%;
}
.modal-content { --background: #fff; }
.modal-handle { width: 36px; height: 4px; background: var(--border); border-radius: 4px; margin: 10px auto 0; }
.modal-box { padding: 0; }
.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 18px; border-bottom: 1px solid #f1f5f9;
  font-size: 15px; color: var(--text);
}
.modal-close { background: none; border: none; color: var(--muted); cursor: pointer; display: flex; align-items: center; }
.modal-close span { font-size: 20px; }
.modal-body { padding: 16px 18px; overflow-y: auto; }
.modal-footer {
  display: flex; gap: 10px; padding: 14px 18px;
  border-top: 1px solid #f1f5f9; flex-wrap: wrap;
}
.action-btn {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  padding: 12px 16px; border-radius: 12px; border: none;
  font-size: 13px; cursor: pointer; font-family: 'Poppins', sans-serif;
  transition: all .2s; white-space: nowrap;
}
.action-btn.btn-outline { background: var(--bg); color: var(--muted); border: 1.5px solid var(--border); }
.action-btn.btn-primary { background: #ff8049; color: #fff; box-shadow: 0 4px 12px rgba(255,128,73,.3); }
.action-btn.btn-danger  { background: var(--error); color: #fff; }
.action-btn.full-w { flex: 1; }
.action-btn:disabled { opacity: .6; cursor: not-allowed; }
.action-btn span { font-size: 18px; }

/* Modal delete */
.delete-info {
  background: var(--bg); border: 1px solid var(--border);
  border-radius: 12px; padding: 12px 14px;
  display: flex; flex-direction: column; gap: 8px;
  margin-bottom: 12px;
}
.delete-row { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
.delete-label { font-size: 12px; color: var(--muted); font-family: 'Poppins', sans-serif; }
.delete-val   { font-size: 13px; color: var(--text); font-family: 'Poppins', sans-serif; text-align: right; }
.delete-warning {
  font-size: 12px; color: #ef4444; font-family: 'Poppins', sans-serif;
  text-align: center;
}

/* Modal editar */
.edit-hint {
  font-size: 11px; color: var(--muted); font-family: 'Poppins', sans-serif;
  margin-bottom: 14px;
}
.form-group { margin-bottom: 12px; }
.form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.form-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
@media (max-width: 380px) {
  .form-row-3 { grid-template-columns: 1fr 1fr; }
  .form-row-2 { grid-template-columns: 1fr; }
}
.form-label {
  display: block; font-size: 10px; text-transform: uppercase;
  letter-spacing: .5px; color: #ff8049;
  margin-bottom: 5px; font-family: 'Poppins', sans-serif; font-weight: 500;
}
.req-star { color: #ff8049; font-weight: 600; }
.input-wrap {
  display: flex; align-items: center;
  background: var(--bg); border: 1.5px solid var(--border);
  border-radius: 12px; padding: 0 12px;
  transition: border-color .2s; overflow: hidden;
}
.input-wrap:focus-within { border-color: #ff8049; background: #fff; }
.input-wrap.input-disabled { opacity: .6; }
.input-icon { font-size: 17px; color: var(--muted); flex-shrink: 0; margin-right: 7px; }
.form-input {
  flex: 1; background: none; border: none; outline: none;
  padding: 10px 0; font-size: 13px; color: var(--text);
  font-family: 'Poppins', sans-serif; min-width: 0; width: 0;
  -webkit-appearance: none;
}
.form-input::placeholder { color: #b0bec5; }
.form-input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; }
.mono { font-family: 'Courier New', monospace; letter-spacing: .5px; }

/* Toggles */
.toggles-section {
  margin-top: 4px;
  display: flex; flex-direction: column; gap: 8px;
}
.toggle-row {
  display: flex; align-items: center; justify-content: space-between;
  background: var(--bg); border: 1.5px solid var(--border);
  border-radius: 12px; padding: 12px 14px;
  cursor: pointer; transition: all .2s; width: 100%;
}
.toggle-row.toggle-active { border-color: rgba(255,128,73,.4); background: rgba(255,128,73,.05); }
.toggle-info { display: flex; align-items: center; gap: 8px; min-width: 0; flex: 1; }
.toggle-icon { font-size: 18px; color: var(--muted); flex-shrink: 0; }
.toggle-switch {
  width: 42px; height: 24px; border-radius: 12px;
  background: var(--border); position: relative;
  transition: background .25s; flex-shrink: 0;
}
.toggle-switch.on { background: #ff8049; }
.toggle-thumb {
  position: absolute; top: 3px; left: 3px;
  width: 18px; height: 18px; border-radius: 50%;
  background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,.15);
  transition: left .25s;
}
.toggle-switch.on .toggle-thumb { left: 21px; }

/* ══ TOASTS ══ */
.toast-container {
  position: fixed; bottom: 24px; left: 16px; right: 16px;
  z-index: 10000; display: flex; flex-direction: column; gap: 8px;
  pointer-events: none;
}
.toast-item {
  display: flex; align-items: center; gap: 9px;
  padding: 12px 16px; border-radius: 14px;
  font-size: 13px; font-family: 'Poppins', sans-serif;
  box-shadow: 0 8px 24px rgba(0,0,0,.15);
  pointer-events: auto;
}
.toast-item span { font-size: 18px; }
.toast-item.success { background: #10b981; color: #fff; }
.toast-item.error   { background: #ef4444; color: #fff; }
.toast-item.info    { background: #ff8049; color: #fff; }
.toast-enter-active, .toast-leave-active { transition: all .3s ease; }
.toast-enter-from, .toast-leave-to       { opacity: 0; transform: translateY(20px); }

/* ══ UTILITÁRIOS ══ */
.poppins-regular  { font-family: 'Poppins', sans-serif; font-weight: 400; }
.poppins-medium   { font-family: 'Poppins', sans-serif; font-weight: 500; }
.poppins-semibold { font-family: 'Poppins', sans-serif; font-weight: 600; }
</style>