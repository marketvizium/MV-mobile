<!--
  ══════════════════════════════════════════════════════════════════
  CotacaoProdutosSimples.vue

  Versão simplificada da tela de produtos da cotação, pensada para uso
  rápido no coletor MovFast R1kg (tela 320x535) com leitor de código de
  barras em modo Keyboard Wedge.

  Recursos (somente estes, por design):
    - Buscar produto por nome
    - Adicionar produto cadastrado (via bipagem ou busca por nome)
    - Adicionar produto não cadastrado (manual)
    - Editar produto (quantidade / tipo)
    - Excluir produto

  Ao bipar um código de barras em qualquer lugar da tela, o app abre
  automaticamente o formulário de "Adicionar Produto" já com o código
  preenchido — e se houver correspondência exata no catálogo, o produto
  já vem selecionado, restando ao usuário apenas confirmar a quantidade
  e tocar em "Adicionar". Uma nova bipagem SEMPRE substitui a anterior,
  nunca concatena.
  ══════════════════════════════════════════════════════════════════
-->
<template>
  <ion-page class="cp-page">
    <ion-content :fullscreen="true" class="cp-content">

      <RefresherIonic />


      <!-- ══ HEADER ══ -->
      <div class="cp-header">
        <button class="back-btn" @click="$router.back()">
          <span class="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <div class="cp-title">
          <span>Produtos</span>
          <span class="count-pill">{{ itens.length }}</span>
        </div>
        <span
          :class="['scan-dot', { ready: scannerPronto }]"
          title="Leitor pronto"
          @click="debugMode = !debugMode"
        ></span>
      </div>

      <!-- ══ PAINEL DE DEBUG (temporário) ══
           Toque no ponto verde/cinza do cabeçalho para abrir/fechar.
           Mostra em tempo real tudo que chega do coletor, já que não dá
           pra usar console.log direto no aparelho. Remova este bloco
           depois que a leitura estiver validada em produção.
      -->
           <!--
           {{ JSON.stringify(eventKey, null, 2) }}
           <div v-if="debugMode" class="debug-panel">
             <div class="debug-title">🐞 Debug do leitor <small>(toque no ponto para fechar)</small></div>
             <div class="debug-row"><b>Foco atual:</b> {{ debugFocoAtual }}</div>
             <div class="debug-row"><b>Input do coletor focado (evento):</b> {{ debugScannerFocado ? 'sim ✅' : 'NÃO ⚠️' }}</div>
             <div class="debug-row"><b>Listeners ativos:</b> {{ listenersAtivos ? 'sim' : 'NÃO (bug!)' }}</div>
             <div class="debug-row"><b>Eventos keydown recebidos:</b> {{ debugContadorKeydown }}</div>
             <div class="debug-row"><b>Buffer teclado (keydown):</b> "{{ barcodeBuffer }}"</div>
             <div class="debug-row"><b>Última tecla:</b> {{ debugUltimaTecla || '—' }}</div>
             <div class="debug-row"><b>Valor input invisível:</b> "{{ scannerInputBuffer }}"</div>
             <div class="debug-row"><b>Último evento "input":</b> {{ debugUltimoInputEvent || '—' }}</div>
             <div class="debug-row"><b>Últimas leituras detectadas:</b></div>
             <div class="debug-scan" v-for="(s, i) in debugHistoricoScans" :key="i">{{ s }}</div>
             <div class="debug-scan muted" v-if="debugHistoricoScans.length === 0">nenhuma ainda</div>
           </div>
           -->

      <!-- ══ BUSCA + AÇÕES ══ -->
      <div class="cp-toolbar">
        <div class="search-box">
          <span class="material-symbols-outlined sb-icon">search</span>
          <input
            type="text"
            v-model="searchProdutos"
            placeholder="Buscar produto por nome..."
            class="sb-input"
          />
          <button v-if="searchProdutos" class="sb-clear" @click="searchProdutos = ''">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="actions-row">
          <button class="btn btn-primary" @click="abrirAddCadastrado()">
            <span class="material-symbols-outlined">add</span> Adicionar Produto
          </button>
          <button class="btn btn-outline" @click="abrirAddManual()">
            <span class="material-symbols-outlined">add_circle</span> Produto Não Cadastrado
          </button>
        </div>
      </div>

      <!-- ══ LOADING ══ -->
      <div v-if="loadingProdutos" class="loading-state">
        <ion-spinner name="crescent" color="primary"></ion-spinner>
        <p>Carregando produtos...</p>
      </div>

      <!-- ══ VAZIO ══ -->
      <div v-else-if="produtosFiltrados.length === 0" class="empty-state">
        <span class="material-symbols-outlined">inventory_2</span>
        <b>{{ searchProdutos ? 'Nada encontrado' : 'Nenhum produto' }}</b>
        <p>
          {{ searchProdutos
            ? 'Tente buscar por outro nome.'
            : 'Toque em "Produto" ou "Manual" para adicionar, ou apenas bipe um código.' }}
        </p>
      </div>

      <!-- ══ LISTA ══ -->
      <div v-else class="cp-list">
        <div v-for="p in produtosFiltrados" :key="p.id_solicitado" class="p-card">
          <div class="p-main">
            <span class="p-title">{{ p.nome }}</span>
            <span class="p-meta">Últ. Preço: <b>R${{ p.ultimo_preco || '--' }}</b></span>
            <span class="p-meta">Últ. Qtd.: <b>{{ p.ultima_quantidade || '--' }} {{ p.ultimo_tipo ? p.ultimo_tipo + 's' : '' || '' }}</b></span>
            <div class="p-sub">
              <span class="p-code mono" v-if="p.codigo_barra">{{ p.codigo_barra }}</span>
              <span class="p-code none" v-else>Não cadastrado</span>
              <span class="p-qty-badge">{{ p.quantidade }} {{ unidadeAbrev(p.tipo) }}</span>
            </div>
          </div>
          <div class="p-actions">
            <button class="icon-btn edit" @click="abrirEditarProduto(p)">
              <span class="material-symbols-outlined">edit</span>
            </button>
            <button class="icon-btn del" @click="confirmarDeleteProduto(p)">
              <span class="material-symbols-outlined">delete</span>
            </button>
          </div>
        </div>
      </div>

      <div style="width: 100%; height: 180px;">

      </div>

    </ion-content>

    <!-- ══════════════════════════════════════════════════════════
         MODAIS MANUAIS (sem <ion-modal>)
         Ver nota no <script> sobre o motivo da troca. Cada modal é
         teleportado para o <body>, então fica sempre acima de tudo,
         imune a overflow/transform/clipping do ion-content e sem
         focus-trap escondido — o foco só muda quando NÓS mandamos.
    ══════════════════════════════════════════════════════════════ -->

    <!-- MODAL: ADICIONAR PRODUTO CADASTRADO -->
    <teleport to="body">
      <transition name="backdrop-fade">
        <div v-if="showAddCadastrado" class="custom-modal-backdrop" @click.self="fecharAddCadastrado">
          <transition name="sheet-slide" appear>
            <div class="custom-modal-sheet">
              <div class="modal-handle"></div>
              <div class="modal-box">
                <div class="modal-header">
                  <span>Adicionar Produto</span>
                  <button class="modal-close" @click="fecharAddCadastrado">
                    <span class="material-symbols-outlined">close</span>
                  </button>
                </div>

                <div class="modal-body">
                  
                  <!-- MODO: BUSCA / LISTA -->
                  <div v-if="!addProduto.id_produto">
                    <div v-if="veioDeBipagem" class="scanned-flag">
                      <span class="material-symbols-outlined">check_circle</span> Código bipado
                    </div>
                    <input
                      type="text"
                      v-model="searchCatalogo"
                      placeholder="Nome ou código de barras..."
                      class="form-input catalogo-search-input"
                      @input="buscarCatalogo"
                    />

                    <!-- PAGINAÇÃO DA BUSCA -->
                    <div
                      v-if="!loadingCatalogo && catalogoFiltrado.length > 0 && (catalogoPage > 1 || catalogoTemMais)"
                      class="catalogo-pagination"
                    >
                      <button
                        class="pg-btn"
                        :disabled="catalogoPage <= 1"
                        @click="paginaAnteriorCatalogo"
                      >
                        <span class="material-symbols-outlined">chevron_left</span>
                      </button>
                      <span class="pg-info">Página {{ catalogoPage }}</span>
                      <button
                        class="pg-btn"
                        :disabled="!catalogoTemMais"
                        @click="proximaPaginaCatalogo"
                      >
                        <span class="material-symbols-outlined">chevron_right</span>
                      </button>
                    </div>

                    <div v-if="loadingCatalogo" class="catalogo-loading">
                      <ion-spinner name="crescent" color="primary"></ion-spinner> Buscando...
                    </div>
                    <div v-else class="catalogo-list">
                      <div v-if="catalogoFiltrado.length === 0" class="catalogo-empty">
                        Digite o nome ou bipe o código de barras
                      </div>
                      <div
                        v-for="p in catalogoFiltrado"
                        :key="p.id_produto"
                        class="catalogo-item"
                        @click="selecionarProdutoCatalogo(p)"
                      >
                        <div class="ci-info">
                          <span class="ci-name">{{ p.nome }}</span>
                          <span class="ci-code mono">{{ p.codigo_barra || 'Sem código' }}</span>
                        </div>
                        <span class="material-symbols-outlined ci-arrow">chevron_right</span>
                      </div>
                    </div>

                    
                  </div>

                  <!-- MODO: CONFIRMAR -->
                  <div v-else>
                    <div class="selected-box">
                      <div class="selected-top">
                        <span class="material-symbols-outlined">inventory_2</span>
                        <div class="selected-info">
                          <span class="selected-name">{{ addProduto.nome }}</span>
                          <span class="selected-code mono">{{ addProduto.codigo_barra || 'Sem código' }}</span>
                        </div>
                      </div>
                      <button class="swap-btn" @click="voltarParaListaCatalogo">
                        <span class="material-symbols-outlined">arrow_back</span> Trocar produto
                      </button>
                    </div>

                    <div class="form-stack">
                      <div class="form-group">
                        <label class="form-label">Quantidade *</label>
                        <input type="number" v-model.number="addProduto.quantidade" min="1" class="form-input" />
                      </div>
                      <div class="form-group">
                        <label class="form-label">Tipo *</label>
                        <select v-model="addProduto.tipo" class="form-input">
                          <option value="unidade">Unidade</option>
                          <option value="caixa">Caixa</option>
                          <option value="fardo">Fardo</option>
                        </select>
                      </div>
                      <div class="form-group">
                        <label class="form-label">Quantidade por embalagem</label>
                        <input type="number"  :disabled="addProduto.tipo=='unidade'" v-model.number="addProduto.qtd_unitaria_composicao" min="1" class="form-input" :class="{'campo-desabilitado':addProduto.tipo=='unidade' }" />
                      </div>
                    </div>
                  </div>
                </div>

                <div class="modal-footer">
                  <button
                    class="btn btn-primary full-w"
                    :disabled="!addProduto.id_produto || !addProduto.quantidade || !addProduto.tipo || loadingAdd"
                    @click="adicionarProduto"
                  >
                    <span class="material-symbols-outlined">add</span> Adicionar
                  </button>
                  <button class="btn btn-outline full-w" @click="fecharAddCadastrado">Cancelar</button>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </transition>
    </teleport>

    <!-- MODAL: ADICIONAR PRODUTO NÃO CADASTRADO -->
    <teleport to="body">
      <transition name="backdrop-fade">
        <div v-if="showAddManual" class="custom-modal-backdrop" @click.self="showAddManual = false">
          <transition name="sheet-slide" appear>
            <div class="custom-modal-sheet">
              <div class="modal-handle"></div>
              <div class="modal-box">
                <div class="modal-header">
                  <span>Produto Não Cadastrado</span>
                  <button class="modal-close" @click="showAddManual = false">
                    <span class="material-symbols-outlined">close</span>
                  </button>
                </div>
                <div class="modal-body">
                  <p class="hint-text">Use para itens ainda não cadastrados no sistema.</p>
                  <div class="form-group">
                    <label class="form-label">Nome *</label>
                    <input type="text" v-model="addManual.nome" class="form-input" placeholder="Nome do produto" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Quantidade *</label>
                    <input type="number" v-model.number="addManual.quantidade" min="1" class="form-input" />
                  </div>
                  <!--
                  <div class="form-group">
                    <label class="form-label">Código de barras</label>
                    <input type="text" v-model="addManual.codigo_barra" maxlength="14" class="form-input" placeholder="Código de barras" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Quantidade por embalagem</label>
                    <input type="number" v-model.number="addManual.qtd_unitaria_composicao" min="1" class="form-input" />
                  </div>
                  -->
                </div>
                <div class="modal-footer">
                  <button
                    class="btn btn-primary full-w"
                    :disabled="!addManual.nome || !addManual.quantidade || loadingAdd"
                    @click="adicionarProdutoManual"
                  >
                    <span class="material-symbols-outlined">add</span> Adicionar
                  </button>
                  <button class="btn btn-outline full-w" @click="showAddManual = false">Cancelar</button>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </transition>
    </teleport>

    <!-- MODAL: EDITAR PRODUTO -->
    <teleport to="body">
      <transition name="backdrop-fade">
        <div v-if="showEdit" class="custom-modal-backdrop" @click.self="showEdit = false">
          <transition name="sheet-slide" appear>
            <div class="custom-modal-sheet">
              <div class="modal-handle"></div>
              <div class="modal-box">
                <div class="modal-header">
                  <span>Editar Produto</span>
                  <button class="modal-close" @click="showEdit = false">
                    <span class="material-symbols-outlined">close</span>
                  </button>
                </div>
                <div class="modal-body" v-if="editTarget">
                  <p class="edit-nome">{{ editTarget.nome }}</p>
                  <div class="form-stack">
                    <div class="form-group">
                      <label class="form-label">Quantidade *</label>
                      <input type="number" v-model.number="editTarget.quantidade" min="1" class="form-input" />
                    </div>
                    <div class="form-group" v-if="editTarget.codigo_barra">
                      <label class="form-label">Tipo</label>
                      <select v-model="editTarget.tipo" class="form-input">
                        <option value="unidade">Unidade</option>
                        <option value="caixa">Caixa</option>
                        <option value="fardo">Fardo</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div class="modal-footer">
                  <button class="btn btn-primary full-w" :disabled="loadingEdit" @click="salvarEdicao">
                    <span class="material-symbols-outlined">save</span> Salvar
                  </button>
                  <button class="btn btn-outline full-w" @click="showEdit = false">Cancelar</button>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </transition>
    </teleport>

    <!-- ══ TOASTS ══ -->
    <teleport to="body">
      <transition-group name="toast" tag="div" class="toast-container">
        <div v-for="t in toasts" :key="t.id" :class="['toast-item', t.type]">
          <span class="material-symbols-outlined">{{ t.type === 'error' ? 'error' : 'check_circle' }}</span>
          {{ t.msg }}
        </div>
      </transition-group>
    </teleport>

    <!-- ══ INPUT INVISÍVEL DO COLETOR (Keyboard Wedge) ══
         O coletor MovFast R1kg simula digitação no elemento que estiver
         com foco. Este input fica sempre focado em segundo plano para
         garantir que o navegador sempre tenha um alvo recebendo os
         eventos de teclado do scanner. Nunca usar display:none /
         visibility:hidden — impediria o foco em alguns WebViews Android.
         Ao detectar uma leitura válida, o teclado virtual é fechado
         automaticamente (ver esconderTeclado / onBarcodeScanned no
         script) — não é mais necessário tocar na tela para escondê-lo.
    -->
    <input
      ref="scannerInput"
      v-model="scannerInputBuffer"
      class="scanner-hidden-input"
      type="text"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      tabindex="-1"
      aria-hidden="true"
      @input="handleHiddenInputEvent"
      @focus="debugScannerFocado = true"
      @blur="debugScannerFocado = false"
    />
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { IonPage, IonContent, IonSpinner, alertController } from '@ionic/vue'
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import exibeErro from '@/utils/ExibeErro'
import RefresherIonic from '@/components/refresherIonic.vue'

// ══════════════════════════════════════════════════════════════════
// NOTA IMPORTANTE (modais manuais):
// Os modais desta tela NÃO usam mais <ion-modal>. O <ion-modal> do
// Ionic Vue, quando inline (v-if/is-open) dentro da árvore do
// componente, cria um overlay com focus-trap próprio; em alguns
// WebViews Android isso "sequestra" o foco da página (mesmo com o
// modal visualmente quebrado/invisível) e o input invisível do
// coletor nunca mais recebe foco — por isso o leitor parava de
// disparar QUALQUER evento depois da primeira tentativa de abrir um
// modal. Trocamos por um modal 100% manual (div + Teleport +
// <transition>), sem focus-trap e sem shadow DOM, o que elimina esse
// problema de raiz e dá controle total sobre a animação.
// ══════════════════════════════════════════════════════════════════

export default defineComponent({
  name: 'CotacaoProdutosSimples',

  components: { IonPage, IonContent, IonSpinner, RefresherIonic },

  props: {
    id_cotacao: Number,
  },

  data() {
    return {
      auth: null as any,
      idCotacaoLocal: null as number | null,

      itens: [] as any[],
      loadingProdutos: false,
      loadingAdd: false,
      loadingEdit: false,

      searchProdutos: '',
      eventKey: '',

      // Modais
      showAddCadastrado: false,
      showAddManual: false,
      showEdit: false,

      // Adicionar produto cadastrado
      searchCatalogo: '',
      catalogoFiltrado: [] as any[],
      loadingCatalogo: false,
      veioDeBipagem: false,
      // Paginação da busca do catálogo
      catalogoPage: 1,
      catalogoLimit: 15,
      catalogoTemMais: false,
      addProduto: {
        id_produto: null as number | null,
        nome: '',
        codigo_barra: '',
        quantidade: 1 as number | null,
        qtd_unitaria_composicao : null as number | null,
        tipo: 'unidade' as string,
      },
      timerBusca: null as any,

      // Adicionar produto não cadastrado
      addManual: { nome: '', quantidade: 1 as number | null, qtd_unitaria_composicao: null as number | null, codigo_barra: null as String | null },

      // Editar
      editTarget: null as any,

      // Toasts
      toasts: [] as any[],
      toastId: 0,

      // Scanner (keyboard wedge)
      scannerInputBuffer: '',
      barcodeBuffer: '',
      barcodeLastKeyTime: 0,
      barcodeInterval: null as any,
      scannerPronto: false,
      listenersAtivos: false,
      focoInterval: null as any,
      // Tamanho mínimo para considerar uma sequência como código de barras.
      // Reduzido para 6 (em vez de 8) durante a fase de diagnóstico, para
      // não perder leituras de códigos mais curtos.
      MIN_BARCODE_LEN: 6,

      // Debug (temporário, ajuda a diagnosticar o coletor em campo)
      debugMode: true,
      debugFocoAtual: '',
      debugUltimaTecla: '',
      debugUltimoInputEvent: '',
      debugContadorKeydown: 0,
      debugHistoricoScans: [] as string[],
      debugScannerFocado: false,
    }
  },

  computed: {
    produtosFiltrados(): any[] {
      const t = this.searchProdutos.trim().toLowerCase()
      if (!t) return this.itens
      return this.itens.filter(i => i.nome?.toLowerCase().includes(t))
    },
  },

  methods: {
    // ─── UTILS ───────────────────────────────────────────────────
    unidadeAbrev(tipo: string): string {
      if (tipo === 'caixa') return 'cx'
      if (tipo === 'fardo') return 'fd'
      return 'un'
    },
    toast(msg: string, type = 'success') {
      const id = ++this.toastId
      this.toasts.push({ id, msg, type })
      setTimeout(() => { this.toasts = this.toasts.filter((t: any) => t.id !== id) }, 3000)
    },

    // ─── CARREGAMENTO ────────────────────────────────────────────
    async carregarProdutos() {
      try {
        this.loadingProdutos = true
        const res = await api.get(`/mvpu/cotacao/historicoCotacao/${this.auth.loja.id_loja}/${this.idCotacaoLocal}`)
        const d = res.data.data
        if (d) {
          this.itens = Array.isArray(d) ? d : (d.conteudo_cotacao || [])
        }
      } catch (e) {
        exibeErro(e, this.$toast)
      } finally {
        this.loadingProdutos = false
      }
    },

    // ─── ADICIONAR: PRODUTO CADASTRADO ──────────────────────────
    abrirAddCadastrado(codigoBipado?: string) {
      this.showAddManual = false
      this.showEdit = false
      this.addProduto = { id_produto: null, nome: '', codigo_barra: '', quantidade: 1, tipo: 'unidade' }
      this.showAddCadastrado = true

      if (codigoBipado) {
        this.veioDeBipagem = true
        this.searchCatalogo = codigoBipado
        this.catalogoPage = 1
        this.catalogoTemMais = false
        this._buscarCatalogoImediato(codigoBipado, true, 1)
      } else {
        this.veioDeBipagem = false
        this.searchCatalogo = ''
        this.catalogoFiltrado = []
        this.catalogoPage = 1
        this.catalogoTemMais = false
      }
    },

    fecharAddCadastrado() {
      this.showAddCadastrado = false
      this.addProduto = { id_produto: null, nome: '', codigo_barra: '', quantidade: 1, tipo: 'unidade' }
      this.searchCatalogo = ''
      this.catalogoFiltrado = []
      this.veioDeBipagem = false
      this.catalogoPage = 1
      this.catalogoTemMais = false
      //this.$nextTick(() => this.refocarScannerInput())
    },

    buscarCatalogo() {
      this.veioDeBipagem = false
      if (!this.searchCatalogo || this.searchCatalogo.length < 2) {
        this.catalogoFiltrado = []
        this.catalogoPage = 1
        this.catalogoTemMais = false
        return
      }
      clearTimeout(this.timerBusca)
      this.timerBusca = setTimeout(() => {
        // Toda nova digitação reinicia a busca na primeira página.
        this._buscarCatalogoImediato(this.searchCatalogo, false, 1)
      }, 350)
    },

    async _buscarCatalogoImediato(termo: string, exato: boolean, page = 1) {
      try {
        this.loadingCatalogo = true
        const res = await api.get(
          `/mvpu/produto/consultarProdutos/${this.auth.loja.id_loja}`,
          { params: { page, limit: this.catalogoLimit, search: termo, id_usuario: this.auth.user?.id_usuario } }
        )
        const dados = res.data.data || []
        this.catalogoFiltrado = dados
        this.catalogoPage = page

        // A API não retorna necessariamente o total de registros, então
        // inferimos que há próxima página quando a página atual veio
        // completa (tamanho igual ao limite pedido).
        this.catalogoTemMais = dados.length === this.catalogoLimit

        // Se a busca veio de uma bipagem e existe correspondência exata de
        // código de barras, seleciona automaticamente — o usuário só
        // precisa conferir e confirmar a quantidade.
        if (exato) {
          const match = this.catalogoFiltrado.find((p: any) => p.codigo_barra === termo)
          if (match) this.selecionarProdutoCatalogo(match)
        }
      } catch (e) {
        this.catalogoFiltrado = []
        this.catalogoTemMais = false
      } finally {
        this.loadingCatalogo = false
      }
    },

    proximaPaginaCatalogo() {
      if (!this.catalogoTemMais || this.loadingCatalogo) return
      this._buscarCatalogoImediato(this.searchCatalogo, false, this.catalogoPage + 1)
    },

    paginaAnteriorCatalogo() {
      if (this.catalogoPage <= 1 || this.loadingCatalogo) return
      this._buscarCatalogoImediato(this.searchCatalogo, false, this.catalogoPage - 1)
    },

    selecionarProdutoCatalogo(p: any) {
      this.addProduto.id_produto = p.id_produto
      this.addProduto.nome = p.nome
      this.addProduto.codigo_barra = p.codigo_barra || ''
      this.addProduto.quantidade = 1
      this.addProduto.tipo = 'unidade'
    },

    voltarParaListaCatalogo() {
      this.addProduto = { id_produto: null, nome: '', codigo_barra: '', quantidade: 1, tipo: 'unidade' }
    },

    async adicionarProduto() {
      if (!this.addProduto.quantidade || !this.addProduto.tipo || !this.addProduto.codigo_barra) {
        this.$toast.add({ 
            severity: 'error', 
            summary: `Campos obrigatórios não preenchidos`, 
            detail: `Unidade e tipo são obrigatórios o preenchimetno`, 
            life: 3000 
        });
        
        this.toast('Preencha os campos obrigatórios', 'error')
        return
      }

      const produtoJaAdicionado = this.itens.find(
        (i: any) => i.codigo_barra === this.addProduto.codigo_barra
      )

      if (produtoJaAdicionado) {
        this.$toast.add({ 
            severity: 'warn', 
            summary: `Produto já existe na cotação.`, 
            detail: `O Produto com código de barra ${this.addProduto.codigo_barra} já foi adicionado à cotação. Feche essa janela e procure o produto para alterar a quantidade`, 
            life: 3000 
          });
        this.toast('Produto já adicionado à cotação, altere na lista', 'error')
        return
      }

      try {
        this.loadingAdd = true
        const payloadRequisicao = {
          codigo_barra: [[this.addProduto.codigo_barra, this.addProduto.quantidade, this.addProduto.tipo, null]],
          id_cotacao: `${this.idCotacaoLocal}`,
        }
        await api.post(`/mvpu/cotacao/adicionarItem/${this.auth.loja.id_loja}`, payloadRequisicao)
        this.toast('Produto adicionado!')
        this.fecharAddCadastrado()
        await this.carregarProdutos()
      } catch (e) {
        exibeErro(e, this.$toast)
      } finally {
        this.loadingAdd = false
      }
    },

    // ─── ADICIONAR: PRODUTO NÃO CADASTRADO ──────────────────────
    abrirAddManual() {
      this.showAddCadastrado = false
      this.showEdit = false
      this.addManual = { nome: '', quantidade: 1 }
      this.showAddManual = true
    },

    async adicionarProdutoManual() {
      try {
        this.loadingAdd = true

        const payload = [this.addManual.nome, this.addManual.quantidade]
        const payloadRequisicao = { codigo_barra: [payload] }
        
        await api.post(`/mvpu/cotacao/adicionarProdutoInexis/${this.auth.loja.id_loja}/${this.idCotacaoLocal}`, payloadRequisicao)
        this.toast('Produto adicionado!')
        this.showAddManual = false
        this.addManual = { nome: '', quantidade: 1 }
        await this.carregarProdutos()
        //this.$nextTick(() => this.refocarScannerInput())
      } catch (e) {
        exibeErro(e, this.$toast)
      } finally {
        this.loadingAdd = false
      }
    },

    // ─── EDITAR ──────────────────────────────────────────────────
    abrirEditarProduto(p: any) {
      this.showAddCadastrado = false
      this.showAddManual = false
      this.editTarget = { ...p }
      this.showEdit = true
    },

    async salvarEdicao() {
      try {
        this.loadingEdit = true
        await api.put(`/mvpu/cotacao/atualizarItem/${this.auth.loja.id_loja}`, {
          id_solicitado: this.editTarget.id_solicitado,
          id_cotacao: this.idCotacaoLocal,
          quantidade: this.editTarget.quantidade,
          tipo: this.editTarget.tipo || null,
        })
        this.toast('Produto atualizado!')
        this.showEdit = false
        await this.carregarProdutos()
        //this.$nextTick(() => this.refocarScannerInput())
      } catch (e) {
        exibeErro(e, this.$toast)
      } finally {
        this.loadingEdit = false
      }
    },

    // ─── DELETAR ─────────────────────────────────────────────────
    async confirmarDeleteProduto(p: any) {
      const alert = await alertController.create({
        header: 'Remover produto',
        message: `Remover "${p.nome}" da cotação?`,
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          { text: 'Remover', role: 'destructive', handler: () => this.deletarProduto(p) },
        ],
      })
      await alert.present()
    },

    async deletarProduto(p: any) {
      try {
        await api.delete(`/mvpu/cotacao/deletarItem/${this.auth.loja.id_loja}`, {
          data: { id_solicitado: [p.id_solicitado], id_cotacao: this.idCotacaoLocal },
        })
        this.toast('Produto removido.')
        await this.carregarProdutos()
      } catch (e) {
        exibeErro(e, this.$toast)
      }
    },

    // ─── SCANNER — INPUT INVISÍVEL (KEYBOARD WEDGE) ─────────────
    // Mesma técnica usada no console completo: um input invisível fica
    // sempre focado em segundo plano para capturar a digitação simulada
    // pelo coletor. Dígitos são acumulados em buffer; após 100ms sem
    // nova tecla, se houver 8+ dígitos, considera-se uma leitura válida
    // e ela SEMPRE substitui qualquer busca/código anterior.
    handleBarcodeScanner(event: KeyboardEvent) {
      this.eventKey = "a"
      this.$nextTick(() => this.refocarScannerInput())
      this.debugContadorKeydown++
      const alvo = event.target as HTMLElement
      
      
      setTimeout(()=>{
        this.eventKey = "b"

        this.debugUltimaTecla = `"${event.key}" (code:${event.code}) alvo:${alvo?.tagName || '?'}`
        if (event.key === 'Enter') return
        const ehInputInvisivel = alvo === this.$refs.scannerInput
        const ehCampoComum = !ehInputInvisivel && (alvo?.tagName === 'INPUT' || alvo?.tagName === 'TEXTAREA')
        if (ehCampoComum) return
        this.verificarScanner()
        // Aceita dígitos e também letras/símbolos comuns em códigos de barras,
        // para não perder leituras que não sejam puramente numéricas.
        if (event.key.length === 1) {
          this.barcodeBuffer += event.key
          this.barcodeLastKeyTime = Date.now()
        }
      }, 10)
    },

    // Alguns coletores (dependendo do modo de operação) não disparam um
    // keydown por caractere — em vez disso, inserem a string inteira de
    // uma vez através de um evento "input" (ex: inputType "insertText"
    // com data longa, ou "insertFromPaste"). Este handler cobre esse caso.
    handleHiddenInputEvent(event: any) {
      const inputType: string = event.inputType || ''
      const data: string = event.data || ''
      const valor: string = event.target?.value || ''
      this.debugUltimoInputEvent = `tipo:"${inputType}" data:"${data}" valor:"${valor}"`

      // Aceita QUALQUER inputType (insertText, insertCompositionText,
      // insertFromPaste, insertFromDrop, ou até vazio) desde que o
      // conteúdo inserido/atual tenha tamanho de código de barras.
      // Alguns coletores usam um IME próprio para "digitar" a leitura,
      // e o inputType que ele reporta varia por fabricante/Android —
      // por isso não restringimos mais a um conjunto fixo de tipos.
      const ehInsercaoEmLote =
        data.length >= this.MIN_BARCODE_LEN || valor.length >= this.MIN_BARCODE_LEN

      if (!ehInsercaoEmLote) return

      const origem = data.length >= this.MIN_BARCODE_LEN ? data : valor
      const regex = new RegExp(`[0-9A-Za-z]{${this.MIN_BARCODE_LEN},}`, 'g')
      const sequencias = origem.match(regex)
      if (!sequencias || sequencias.length === 0) return

      const codigo = sequencias.reduce((a: string, b: string) => (b.length > a.length ? b : a), sequencias[0])
      this.scannerInputBuffer = ''
      this.barcodeBuffer = ''
      this.onBarcodeScanned(codigo)
    },

    verificarScanner() {
        this.eventKey = "c"
      if (!this.barcodeBuffer) return
        this.eventKey = "d"
      const agora = Date.now()
      if (agora - this.barcodeLastKeyTime > 100) {
        const codigo = this.barcodeBuffer
        this.barcodeBuffer = ''
        this.scannerInputBuffer = ''
        if (codigo.length >= this.MIN_BARCODE_LEN) {
          this.onBarcodeScanned(codigo)
        }
      }
    },

    onBarcodeScanned(codigo: string) {
      this.debugHistoricoScans.unshift(`${new Date().toLocaleTimeString()} → "${codigo}"`)
      this.debugHistoricoScans = this.debugHistoricoScans.slice(0, 5)

      // Fecha o teclado virtual imediatamente — a leitura já foi
      // identificada, então não faz sentido continuar mostrando o
      // teclado nem exigir que o usuário toque na tela para escondê-lo.
      this.esconderTeclado()

      // Fecha qualquer outro modal e abre (ou reabre) o fluxo de
      // "Adicionar Produto" já com o novo código — substitui o anterior.
      this.abrirAddCadastrado(codigo)
    },

    // Fecha o teclado virtual do Android tirando o foco do elemento
    // ativo (normalmente o input invisível do coletor). blur() é o
    // gatilho padrão que o WebView usa para recolher o teclado.
    esconderTeclado() {
      const ativo = document.activeElement as HTMLElement | null
      if (ativo && typeof ativo.blur === 'function') {
        ativo.blur()
      }
      // Blur extra no próprio ref, por segurança, caso o activeElement
      // não bata exatamente com o input do coletor em algum WebView.
      const input = this.$refs.scannerInput as HTMLInputElement | undefined
      input?.blur?.()
    },

    handleClickRefoco(event: MouseEvent) {
      const alvo = event.target as HTMLElement
      if (alvo?.closest('input, textarea, select, button, [contenteditable]')) return
      //this.refocarScannerInput()
    },

    refocarScannerInput() {
      setTimeout(() => {
        // Enquanto qualquer modal manual estiver aberto, NUNCA rouba o
        // foco de volta para o input invisível. Sem essa checagem, o
        // blur() disparado por esconderTeclado() aciona 'focusout' →
        // este método é chamado → ele focaria o input do coletor de
        // novo → o teclado reabriria na hora, anulando o efeito de
        // esconderTeclado() e sobre o próprio campo de busca do modal.


        if (this.showAddCadastrado || this.showAddManual || this.showEdit) return

        const ativo = document.activeElement as HTMLElement | null
        const elementoInterativo =
          ativo && ativo !== this.$refs.scannerInput &&
          ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(ativo.tagName)
        if (elementoInterativo) return
        const input = this.$refs.scannerInput as HTMLInputElement | undefined
        input?.focus({ preventScroll: true })
        this.scannerPronto = true
      }, 0)
    },

    // ─── CICLO DE VIDA DO SCANNER ────────────────────────────────
    iniciarConsoleProdutos() {
      const authStore = useAuthStore()
      if (!authStore.token && !localStorage.getItem('token')) {
        this.$router?.replace?.({ name: 'Login' })
        return
      }
      this.auth = authStore
      this.idCotacaoLocal = this.id_cotacao || Number((this.$route?.query || {}).id_cotacao)

      this.iniciarListenersScanner()
      this.carregarProdutos()
    },

    iniciarListenersScanner() {
      // Evita registrar os listeners duas vezes (ex: mounted + ionViewDidEnter).
      if (this.listenersAtivos) return
      this.listenersAtivos = true

      document.addEventListener('keydown', this.handleBarcodeScanner)
      document.addEventListener('click', this.handleClickRefoco)
      //document.addEventListener('focusout', this.refocarScannerInput)
      this.barcodeInterval = setInterval(() => this.verificarScanner(), 50)

      // Atualiza o painel de debug com o elemento em foco a cada 300ms.
      this.focoInterval = setInterval(() => {
        const ativo = document.activeElement as HTMLElement | null
        this.debugFocoAtual = ativo
          ? `${ativo.tagName}${ativo === this.$refs.scannerInput ? ' (input do scanner ✅)' : ''}`
          : 'nenhum'
      }, 300)

      //this.$nextTick(() => this.refocarScannerInput())
    },

    pararListenersScanner() {
      if (!this.listenersAtivos) return
      this.listenersAtivos = false

      if (this.barcodeInterval) { clearInterval(this.barcodeInterval); this.barcodeInterval = null }
      if (this.focoInterval) { clearInterval(this.focoInterval); this.focoInterval = null }
      document.removeEventListener('keydown', this.handleBarcodeScanner)
      document.removeEventListener('click', this.handleClickRefoco)
      document.removeEventListener('focusout', this.refocarScannerInput)
      this.esconderTeclado()

    },
  },

  // ─────────────────────────────────────────────────────────────
  // IMPORTANTE: usamos mounted()/beforeUnmount() (hooks padrão do Vue,
  // que SEMPRE executam) em vez de depender só de ionViewDidEnter()/
  // ionViewWillLeave(). Os hooks ionView* só disparam quando o
  // componente é navegado como uma página dentro de um
  // <ion-router-outlet> — se ele for usado de outra forma (dentro de
  // um modal, embutido em outro componente etc.), esses hooks nunca
  // são chamados e o leitor de código de barras nunca é inicializado
  // (era exatamente esse o bug relatado: nada abria ao bipar).
  // ionViewDidEnter/WillLeave são mantidos como reforço para quando o
  // componente FOR usado como página com keep-alive do Ionic; o guard
  // "listenersAtivos" evita registrar os listeners em duplicidade.
  // ─────────────────────────────────────────────────────────────
  mounted() {
    this.iniciarConsoleProdutos()
  },

  beforeUnmount() {
    this.pararListenersScanner()
  },

  ionViewDidEnter() {
    this.iniciarConsoleProdutos()
  },

  ionViewWillLeave() {
    this.pararListenersScanner()
  },
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=DM+Mono:wght@500&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap');

/*
  IMPORTANTE: NÃO usar um seletor universal "* { font-family: 'Poppins' }"
  aqui — isso sobrescreve a fonte dos ícones (.material-symbols-outlined)
  e faz eles aparecerem como texto ("search", "add" etc.) em vez do
  glifo do ícone. Cada elemento de texto usa Poppins via herdança normal
  (definida em .cp-page abaixo); os ícones têm sua própria fonte, isolada.
*/
.cp-page, .cp-page * { box-sizing: border-box; }
.cp-page { font-family: 'Poppins', sans-serif; }
.mono { font-family: 'DM Mono', monospace; }

.material-symbols-outlined {
  font-family: 'Material Symbols Outlined';
  font-weight: normal;
  font-style: normal;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-feature-settings: 'liga';
  font-feature-settings: 'liga';
  -webkit-font-smoothing: antialiased;
}

:root {
  --accent: #ff8049;
  --accent-dark: #e8663a;
}

/* Alvo: tela do coletor MovFast R1kg, 320 x 535 — fontes e áreas de
   toque ampliadas para uso operacional rápido, com luvas ou em
   movimento. Prioriza legibilidade e acerto no toque sobre densidade
   de informação. */
.cp-page { --background: #f6f7f9; max-width: 320px; margin: 0 auto; }
.cp-content { --background: #FFF; font-size: 15px; }

/* ══ HEADER ══ */
.cp-header {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 14px; background: #fff; border-bottom: 1px solid #e7e9ee;
}
.back-btn {
  border: none; background: none; color: #475569; display: flex;
  padding: 6px; margin: -6px; border-radius: 8px;
}
.back-btn .material-symbols-outlined { font-size: 24px; }
.cp-title { flex: 1; display: flex; align-items: center; gap: 10px; }
.cp-title span:first-child { font-size: 19px; font-weight: 700; color: #1e293b; }
.count-pill {
  background: rgba(255,128,73,.12); color: var(--accent-dark);
  font-size: 13px; font-weight: 700; padding: 3px 10px; border-radius: 20px;
}
.scan-dot { width: 13px; height: 13px; border-radius: 50%; background: #cbd5e1; flex-shrink: 0; }
.scan-dot.ready { background: #16a34a; box-shadow: 0 0 0 4px rgba(22,163,74,.15); }

/* ══ TOOLBAR ══ */
.cp-toolbar { padding: 12px 14px; display: flex; flex-direction: column; gap: 10px; }
.search-box {
  display: flex; align-items: center; gap: 8px;
  background: #fff; border: 1.5px solid #e7e9ee; border-radius: 12px; padding: 12px 14px;
}
.sb-icon { font-size: 22px; color: #94a3b8; }
.sb-input { border: none; outline: none; flex: 1; font-size: 16px; background: transparent; }
.sb-clear { border: none; background: none; color: #94a3b8; display: flex; padding: 4px; }
.sb-clear .material-symbols-outlined { font-size: 20px; }

/* Botões de ação principal: um embaixo do outro, alvo de toque
   generoso (altura mínima ~52px), sem disputar espaço lado a lado. */
.actions-row { display: flex; flex-direction: column; gap: 10px; }
.btn {
  border: none; border-radius: 12px; font-weight: 600; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  font-size: 15.5px; padding: 15px 12px; width: 100%; min-height: 52px;
}
.btn .material-symbols-outlined { font-size: 22px; }
.btn-primary { background: #FF8049; color: #fff; }
.btn-primary:active { background: #ff8049); }
.btn-outline { background: #fff; color: #1e293b; border: 1.5px solid #e7e9ee; }
.btn-outline:active { background: #f1f5f9; }
.btn[disabled] { opacity: .45; cursor: not-allowed; }
.full-w { width: 100%; }

/* ══ ESTADOS ══ */
.loading-state, .empty-state {
  display: flex; flex-direction: column; align-items: center; text-align: center;
  padding: 48px 24px; color: #94a3b8; gap: 8px;
}
.loading-state p { font-size: 14px; }
.empty-state .material-symbols-outlined { font-size: 44px; opacity: .5; }
.empty-state b { color: #475569; font-size: 16px; }
.empty-state p { font-size: 13.5px; line-height: 1.5; margin: 0; }

/* ══ LISTA ══ */
.cp-list { padding: 0 14px 14px; display: flex; flex-direction: column; gap: 10px; }
.p-card {
  background: #fff; border: 1.5px solid #e7e9ee; border-radius: 14px;
  padding: 14px; display: flex; align-items: center; gap: 10px;
}
.p-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.p-title {
  font-size: 16px; font-weight: 700; color: #1e293b; line-height: 1.3;
  white-space: normal; overflow-wrap: break-word;
}
.p-meta { font-size: 13.5px; color: #64748b; }
.p-meta b { color: #334155; font-weight: 600; }
.p-sub { display: flex; align-items: center; gap: 8px; margin-top: 2px; flex-wrap: wrap; }
.p-code { font-size: 12px; color: #64748b; }
.p-code.none { color: #94a3b8; font-style: italic; font-family: 'Poppins', sans-serif; }
.p-qty-badge {
  font-size: 12.5px; font-weight: 700; color: var(--accent-dark);
  background: rgba(255,128,73,.1); padding: 3px 9px; border-radius: 7px; white-space: nowrap;
}
.p-actions { display: flex; flex-direction: column; gap: 6px; flex-shrink: 0; }
.icon-btn {
  width: 42px; height: 42px; border-radius: 10px; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center; background: #f1f5f9; color: #64748b;
}

.icon-btn .material-symbols-outlined { font-size: 20px; }
.icon-btn.del { background: rgba(239,68,68,.1); color: #ef4444; }

/* ══ MODAIS (manuais, sem ion-modal) ══
   Teleportados para o <body>. Como escapam do <ion-content>, ficam
   imunes a qualquer overflow/transform/contain interno do Ionic que
   antes fazia o backdrop aparecer sem a folha do modal subir junto. */
.custom-modal-backdrop {
  position: fixed; inset: 0; z-index: 20000;
  background: rgba(15, 23, 42, .45);
  display: flex; align-items: flex-end; justify-content: center;
}
.custom-modal-sheet {
  width: 100%; max-width: 320px; max-height: 88vh;
  background: #fff; border-radius: 18px 18px 0 0;
  overflow-y: auto; box-shadow: 0 -8px 30px rgba(0,0,0,.25);
}
/* Fade do backdrop */
.backdrop-fade-enter-active, .backdrop-fade-leave-active { transition: opacity .2s ease; }
.backdrop-fade-enter-from, .backdrop-fade-leave-to { opacity: 0; }
/* Slide-up da folha do modal */
.sheet-slide-enter-active { transition: transform .25s cubic-bezier(.32,.72,0,1); }
.sheet-slide-leave-active { transition: transform .2s ease-in; }
.sheet-slide-enter-from, .sheet-slide-leave-to { transform: translateY(100%); }

.modal-handle { width: 40px; height: 5px; background: #e2e8f0; border-radius: 3px; margin: 10px auto 4px; }
.modal-box { padding: 0 0 max(10px, env(safe-area-inset-bottom)); }
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 16px 12px; border-bottom: 1px solid #e7e9ee; font-size: 17px; font-weight: 700; color: #1e293b;
}
.modal-close {
  border: none; background: #f1f5f9; color: #64748b; display: flex;
  padding: 6px; border-radius: 8px;
}
.modal-close .material-symbols-outlined { font-size: 20px; }
.modal-body { padding: 16px; max-height: 62vh; overflow-y: auto; }

/* Footer dos modais: ação principal em cima, sempre em largura total;
   ação secundária (cancelar) logo abaixo, um embaixo do outro. */
.modal-footer { display: flex; flex-direction: column; gap: 10px; padding: 12px 16px 16px; border-top: 1px solid #e7e9ee; }
.modal-footer .btn { padding: 15px; font-size: 15.5px; min-height: 52px; }

.hint-text { font-size: 13px; color: #94a3b8; line-height: 1.5; margin: 0 0 14px; }
.edit-nome { font-size: 17px; font-weight: 700; color: #1e293b; margin: 0 0 14px; }
.form-stack { display: flex; flex-direction: column; width: 100%; }
.form-group { margin-bottom: 14px; }
.form-label { display: block; font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 6px; text-transform: uppercase; letter-spacing: .02em; }
.form-input {
  width: 100%; border: 1.5px solid #e7e9ee; border-radius: 11px; padding: 14px;
  font-size: 16px; color: #1e293b; outline: none; margin-bottom: 0; min-height: 50px;
}
.form-input:focus { border-color: var(--accent); }
.catalogo-search-input { margin-bottom: 12px; }

.scanned-flag {
  display: flex; align-items: center; gap: 6px; background: rgba(22,163,74,.1); color: #16a34a;
  font-size: 13px; font-weight: 700; padding: 8px 12px; border-radius: 9px; margin-bottom: 12px; width: fit-content;
}
.scanned-flag .material-symbols-outlined { font-size: 17px; }

.catalogo-loading { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #94a3b8; padding: 14px 0; }
.catalogo-list { border: 1.5px solid #e7e9ee; border-radius: 12px; max-height: 280px; overflow-y: auto; }
.catalogo-empty { font-size: 13.5px; color: #94a3b8; text-align: center; padding: 22px 12px; line-height: 1.5; }
.catalogo-item {
  display: flex; justify-content: space-between; align-items: center; gap: 8px;
  padding: 14px; border-bottom: 1px solid #f1f5f9; cursor: pointer; min-height: 54px;
}
.catalogo-item:last-child { border-bottom: none; }
.catalogo-item:active { background: rgba(255,128,73,.08); }
.ci-info { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.ci-name { font-size: 15px; font-weight: 600; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 190px; }
.ci-code { font-size: 12.5px; color: #94a3b8; }
.ci-arrow { font-size: 22px; color: #cbd5e1; }

.catalogo-pagination {
  display: flex; align-items: center; justify-content: center; gap: 16px;
  padding: 4px 4px 12px;
}
.pg-btn {
  width: 44px; height: 44px; border-radius: 10px; border: 1.5px solid #e7e9ee;
  background: #fff; color: #475569; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.pg-btn .material-symbols-outlined { font-size: 22px; }
.pg-btn[disabled] { opacity: .4; cursor: not-allowed; }
.pg-info { font-size: 14px; font-weight: 700; color: #475569; min-width: 76px; text-align: center; }

.selected-box { background: #fff8f5; border: 1.5px solid rgba(255,128,73,.3); border-radius: 14px; padding: 14px; margin-bottom: 16px; }
.selected-top { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px; }
.selected-top .material-symbols-outlined { font-size: 26px; color: var(--accent); margin-top: 1px; }
.selected-info { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.selected-name { font-size: 16px; font-weight: 700; color: #1e293b; line-height: 1.35; }
.selected-code { font-size: 13px; color: #64748b; }
.swap-btn {
  display: flex; align-items: center; justify-content: center; gap: 6px; background: #fff; border: 1.5px solid #e7e9ee;
  border-radius: 10px; padding: 12px; font-size: 13.5px; font-weight: 600; color: #64748b; cursor: pointer; width: 100%;
}
.swap-btn .material-symbols-outlined { font-size: 18px; }

/* ══ TOASTS ══ */
.toast-container {
  position: fixed; bottom: 16px; left: 12px; right: 12px; z-index: 10000;
  display: flex; flex-direction: column; gap: 8px; pointer-events: none;
}
.toast-item {
  display: flex; align-items: center; gap: 8px; padding: 14px 16px; border-radius: 12px;
  font-size: 14px; font-weight: 600; box-shadow: 0 8px 20px rgba(0,0,0,.15); pointer-events: auto; color: #fff;
}
.toast-item .material-symbols-outlined { font-size: 18px; }
.toast-item.success { background: #16a34a; }
.toast-item.error { background: #ef4444; }
.toast-enter-active, .toast-leave-active { transition: all .25s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(20px); }

/* ══ PAINEL DE DEBUG (temporário) ══ */
.debug-panel {
  margin: 0 12px 8px; background: #0f172a; color: #d1d5db;
  border-radius: 10px; padding: 9px 10px; font-size: 10.5px; line-height: 1.6;
  font-family: 'DM Mono', monospace; max-height: 160px; overflow-y: auto;
}
.debug-title { color: #fbbf24; font-weight: 600; margin-bottom: 4px; font-family: 'Poppins', sans-serif; font-size: 11px; }
.debug-title small { color: #64748b; font-weight: 400; }
.debug-row { word-break: break-all; }
.debug-row b { color: #93c5fd; font-weight: 600; }
.debug-scan { color: #86efac; padding-left: 4px; }
.debug-scan.muted { color: #64748b; }
.scan-dot { cursor: pointer; }

/* ══ INPUT INVISÍVEL DO COLETOR ══
   Nunca usar display:none / visibility:hidden — impede foco em alguns
   WebViews Android, o que faria o coletor parar de funcionar. */
.scanner-hidden-input {
  position: fixed; top: 0; left: -9999px; width: 1px; height: 1px; opacity: 0;
  border: none; padding: 0; margin: 0; pointer-events: none;
}


.campo-desabilitado{
  background-color: #CCC;
}
</style>