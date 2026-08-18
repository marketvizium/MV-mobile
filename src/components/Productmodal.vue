<template >
  <transition name="pm-fade" >
    <div v-if="visible" class="pm-overlay" @click.self="fechar">
      <div class="pm-panel">

        <button class="pm-close" @click="fechar">
          <span class="material-symbols-outlined">close</span>
        </button>

        <div class="pm-grid">

          <!-- ═══ GALERIA ═══ -->
          <div class="pm-gallery">
            <div class="pm-gallery-main">
              <img :src="fotoAtiva" :alt="produto?.nome" @error="onImgError" />
              <span v-if="temDesconto" class="pm-badge pm-badge-red">-{{ percentualDesconto }}%</span>
              <span v-if="produto?.eh_lancamento" class="pm-badge pm-badge-green" style="left:auto;right:10px;">Novo</span>
            </div>
            <div class="pm-thumbs" v-if="fotos.length > 1">
              <button
                v-for="(f, i) in fotos"
                :key="i"
                class="pm-thumb"
                :class="{ active: fotoIndex === i }"
                @click="fotoIndex = i"
              >
                <img :src="f" />
              </button>
            </div>
          </div>

          <!-- ═══ INFORMAÇÕES ═══ -->
          <div class="pm-info">
            <div class="pm-info-scroll">
              <div class="pm-top-tags">
                <span v-if="produto?.categoria" class="pm-tag">{{ produto.categoria }}</span>
                <span v-if="produto?.fornecedor" class="pm-tag pm-tag-alt">{{ produto.fornecedor }}</span>
                <span v-if="produto?.ativo === false" class="pm-tag pm-tag-red">Inativo</span>
              </div>

              <h2 class="pm-title poppins-semibold">{{ produto?.nome || 'Produto' }}</h2>
              <div class="pm-barcode" v-if="produto?.codigo_barra">
                <span class="material-symbols-outlined" style="font-size:14px">barcode_scanner</span>
                {{ produto.codigo_barra }}
              </div>

              <!-- Ações sociais: curtir + compartilhar (exporta PDF) + visualizações -->
              <div class="pm-social-row">
                <button
                  type="button"
                  class="pm-social-btn"
                  :class="{ liked: curtidoLocal }"
                  @click="alternarCurtir"
                  title="Curtir"
                >
                  <span class="material-symbols-outlined">{{ curtidoLocal ? 'favorite' : 'favorite_border' }}</span>
                  {{ formatCount(statValue(produto, 'curtidas')) }}
                </button>

                <button
                  type="button"
                  class="pm-social-btn"
                  :disabled="gerandoPdf"
                  @click="compartilharProduto"
                  title="Compartilhar (gera um PDF do produto)"
                >
                  <span class="material-symbols-outlined pm-spin" v-if="gerandoPdf">progress_activity</span>
                  <span class="material-symbols-outlined" v-else>share</span>
                  {{ gerandoPdf ? 'Gerando PDF...' : formatCount(statValue(produto, 'compartilhamentos')) }}
                </button>

                <span class="pm-social-metric" title="Visualizações">
                  <span class="material-symbols-outlined">visibility</span>
                  {{ formatCount(statValue(produto, 'visualizacoes')) }}
                </span>
              </div>

              <!-- Avaliação (0 a 5 estrelas) -->
              <div class="pm-rating-row" :title="`Avaliação: ${notaAvaliacao.toFixed(1)}/5`">
                <span
                        v-for="(s, i) in starArray(Number(notaAvaliacao || 0))"
                        :key="i"
                        class="material-symbols-outlined star-ic"
                        :class="'star-' + s"
                        >
                        {{ s === 'half' ? 'star_half' : 'star' }}
                    </span>
                <span class="pm-rating-txt poppins-medium">{{ notaAvaliacao.toFixed(1) }} / 5</span>
                <span class="pm-rating-count" v-if="statValue(produto, 'avaliacoes_qtd')">
                  ({{ formatCount(statValue(produto, 'avaliacoes_qtd')) }} avaliações)
                </span>
              </div>

              <div class="pm-preco-row">
                <template v-if="temDesconto">
                  <span class="pm-preco-final poppins-semibold">{{ formatBRL(precoFinal) }}</span>
                  <span class="pm-preco-original">{{ formatBRL(precoBase) }}</span>
                </template>
                <template v-else>
                  <span class="pm-preco-final poppins-semibold">{{ formatBRL(precoBase) }}</span>
                </template>
              </div>

              <div class="pm-desconto-info" v-if="temDesconto && (produto.desconto_inicio || produto.desconto_fim)">
                <span class="material-symbols-outlined" style="font-size:14px;color:var(--red)">local_fire_department</span>
                Promoção válida até {{ formatDate(produto.desconto_fim) }}
              </div>

              <div class="pm-lancamento-info" v-if="produto?.status_lancamento">
                <div class="pm-li-row">
                  <span class="material-symbols-outlined" style="font-size:14px">campaign</span>
                  Lançamento anunciado em {{ formatDate(produto.anunciado_em) }}
                </div>
                <div class="pm-li-status" :class="'st-' + produto.status_lancamento">{{ statusLancamentoLabel }}</div>
                <div v-if="produto.motivo_recusa" class="pm-li-motivo">Motivo da recusa: {{ produto.motivo_recusa }}</div>
              </div>

              <p class="pm-descricao" v-if="produto?.descricao">{{ produto.descricao }}</p>
              <p class="pm-descricao pm-descricao-vazia" v-else>Este anúncio ainda não possui uma descrição.</p>

              <div class="pm-completude">
                <div class="pm-completude-head">
                  <span>Qualidade do anúncio</span>
                  <span class="poppins-semibold">{{ produto?.completude_score ?? 0 }}/8</span>
                </div>
                <div class="pcard-completude-track">
                  <div
                    class="pcard-completude-fill"
                    :style="{ width: (((produto?.completude_score ?? 0) / 8) * 100) + '%' }"
                  ></div>
                </div>
              </div>
            </div>

            <!-- ═══ AÇÕES ═══ -->
            <div class="pm-actions">

              <div v-if="modoAtivo === 'cotacao'" style="color: red; margin-bottom: 10px;">
                Se esse produto for adicionado à cotação, não será exclusivo de um vendedor. Qualquer um poderá enviar oferta.
              </div>

              <label class="pm-field-label poppins-medium">Adicionar item a...</label>

              <!-- Toggle entre Pedido Direto e Cotação -->
              <div class="pm-modo-toggle">
                <button
                  type="button"
                  class="pm-modo-btn"
                  :class="{ active: modoAtivo === 'pedido_direto' }"
                  @click="toggleModo('pedido_direto')"
                >
                  <span class="material-symbols-outlined">bolt</span>
                  Pedido Direto
                </button>
                <button
                  type="button"
                  class="pm-modo-btn"
                  :class="{ active: modoAtivo === 'cotacao' }"
                  @click="toggleModo('cotacao')"
                >
                  <span class="material-symbols-outlined">request_quote</span>
                  Cotação
                </button>
              </div>

              <!-- Lista (pedidos diretos OU cotações, conforme modo ativo) -->
              <template v-if="modoAtivo">
                <div v-if="carregandoListaAtiva" class="pm-loading-hint">
                  <span class="material-symbols-outlined pm-spin">progress_activity</span>
                  {{ modoAtivo === 'pedido_direto' ? 'Carregando pedidos diretos...' : 'Carregando cotações abertas...' }}
                </div>

                <template v-else-if="listaAtiva.length">
                  <div class="pm-cotacoes-lista">
                    <button
                      v-for="item in itensPaginados"
                      :key="modoAtivo === 'pedido_direto' ? item.id_pedido_direto : item.id_cotacao"
                      type="button"
                      class="pm-opcao-item"
                      :class="{ active: itemSelecionado === item }"
                      @click="selecionarItem(item)"
                    >
                      <span class="material-symbols-outlined pm-opcao-icone">
                        {{ modoAtivo === 'pedido_direto' ? 'bolt' : 'request_quote' }}
                      </span>
                      <span class="pm-opcao-texto">
                        {{ modoAtivo === 'pedido_direto' ? item.nome_pedido_direto : item.nome_cotacao }}
                        <span class="pm-opcao-id">#{{ modoAtivo === 'pedido_direto' ? item.id_pedido_direto : item.id_cotacao }}</span>
                      </span>
                      <span v-if="itemSelecionado === item" class="material-symbols-outlined pm-opcao-check">check_circle</span>
                    </button>
                  </div>

                  <div v-if="totalPaginas > 1" class="pm-paginacao">
                    <button
                      type="button"
                      class="pm-pag-btn"
                      :disabled="paginaAtual === 1"
                      @click="paginaAnterior"
                    >
                      <span class="material-symbols-outlined" style="font-size:16px">chevron_left</span>
                    </button>
                    <span class="pm-pag-info">Página {{ paginaAtual }} de {{ totalPaginas }}</span>
                    <button
                      type="button"
                      class="pm-pag-btn"
                      :disabled="paginaAtual === totalPaginas"
                      @click="proximaPagina"
                    >
                      <span class="material-symbols-outlined" style="font-size:16px">chevron_right</span>
                    </button>
                  </div>
                </template>

                <div v-else class="pm-empty-hint">
                  {{ modoAtivo === 'pedido_direto'
                    ? 'Nenhum pedido direto disponível no momento.'
                    : 'Nenhuma cotação aberta encontrada no momento.' }}
                </div>
              </template>

              <template v-if="itemSelecionado">
                <!-- Quantidade (comum às duas opções) -->
                <div class="pm-qty-row">
                  <span class="pm-qty-label poppins-medium">Quantidade</span>
                  <div class="pm-qty-stepper">
                    <button @click="decQty"><span class="material-symbols-outlined">remove</span></button>
                    <input type="number" min="1" v-model.number="quantidade" />
                    <button @click="incQty"><span class="material-symbols-outlined">add</span></button>
                  </div>
                </div>
                <div class="pm-qty-row">
                  <span class="pm-qty-label poppins-medium">Tipo</span>
                  <div class="pm-qty-stepper" style="color: red;">
                    {{produto?.tipo || "Não especificado"}}
                  </div>
                </div>

                <button
                  class="pm-confirm-btn poppins-medium"
                  :disabled="estaSalvando"
                  @click="confirmar"
                >
                  <span class="material-symbols-outlined" style="font-size:16px">
                    {{ ehPedidoDireto ? 'shopping_cart_checkout' : 'add_shopping_cart' }}
                  </span>
                  {{ textoBotaoConfirmar }}
                </button>
              </template>

              <div v-if="feedbackExibido" class="pm-feedback" :class="'fb-' + feedbackExibido.tipo">
                <span class="material-symbols-outlined" style="font-size:15px">
                  {{ feedbackExibido.tipo === 'ok' ? 'check_circle' : 'error' }}
                </span>
                {{ feedbackExibido.msg }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
// ajuste os caminhos abaixo conforme a estrutura do seu projeto
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/auth';

export default defineComponent({
  name: 'ProductModal',

  props: {
    visible: { type: Boolean, default: false },
    produto: { type: Object as PropType<any>, default: null },
    // Estado de "curtido" controlado pelo componente pai (mesmo padrão do ProductCard)
    isFavorite: { type: Boolean, default: false },
    // Lista de cotações abertas continua vindo de fora (o componente pai já
    // sabe recarregá-la quando necessário), mas agora ela só aparece quando
    // o usuário clica no botão "Cotação".
    // Mantidos por compatibilidade: se o componente pai ainda quiser
    // controlar um estado de envio/feedback externo, ele continua funcionando
    // em conjunto com o estado interno (ver computeds `estaSalvando` e `feedbackExibido`).
    enviando: { type: Boolean, default: false },
    feedback: { type: Object as PropType<{ tipo: 'ok' | 'erro'; msg: string } | null>, default: null },
    // Necessário para as chamadas de API (id_loja, id_usuario do colaborador logado).
    // Se o projeto já expõe `auth` via mixin global, esta prop pode ser removida
    // e as referências a `this.auth` abaixo passam a resolver automaticamente.
  },

  emits: ['close', 'item-adicionado', 'toggle-favorite', 'produto-compartilhado'],

  data() {
    return {
      fotoIndex: 0,
      imgFallback: false,

      // Qual bloco está aberto: null | 'pedido_direto' | 'cotacao'
      modoAtivo: null as 'pedido_direto' | 'cotacao' | null,

      // Pedidos diretos existentes (buscados sob demanda ao clicar no botão)
      pedidosDiretos: [] as any[],
      loadingPedidosDiretos: false,

      // Item selecionado na lista ativa (um pedido direto OU uma cotação)
      itemSelecionado: null as any,

      cotacoesInternas: [] as any[],
      loadingCotacoesInternas: false,

      quantidade: 1,
      observacao: '',
      auth: null,

      // Paginação (compartilhada entre as duas listas, reseta ao trocar de modo)
      paginaAtual: 1,
      itensPorPagina: 5,

      // Estado interno de envio/feedback (usado pelas chamadas de API feitas aqui)
      salvando: false,
      feedbackLocal: null as { tipo: 'ok' | 'erro'; msg: string } | null,

      // Curtir (espelha a prop isFavorite pra dar feedback visual imediato)
      curtidoLocal: false,

      // Exportação do PDF ao compartilhar
      gerandoPdf: false
    };
  },

  watch: {
    produto() {
      this.fotoIndex = 0;
      this.imgFallback = false;
      this.modoAtivo = null;
      this.itemSelecionado = null;
      this.quantidade = 1;
      this.observacao = '';
      this.paginaAtual = 1;
      this.feedbackLocal = null;
      this.curtidoLocal = this.isFavorite;
    },
    isFavorite: {
      immediate: true,
      handler(novoValor) {
        this.curtidoLocal = !!novoValor;
      }
    },
    cotacoesAbertas() {
      // Se a lista mudar (ex.: recarregada) e a página atual ficar fora do range, volta pra 1ª
      if (this.paginaAtual > this.totalPaginas) {
        this.paginaAtual = 1;
      }
    }
  },

  computed: {
    placeholder(): string {
      return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500"><rect width="100%" height="100%" fill="#f1f3f5"/><text x="50%" y="50%" font-family="sans-serif" font-size="16" fill="#94a3b8" text-anchor="middle" dy=".3em">Sem imagem</text></svg>`
      );
    },
    fotos(): string[] {
      if (!this.produto) return [];
      return [this.produto.foto_capa, this.produto.foto_1, this.produto.foto_2, this.produto.foto_3]
        .filter((f) => !!f);
    },
    fotoAtiva(): string {
      if (this.imgFallback) return this.placeholder;
      return this.fotos[this.fotoIndex] || this.placeholder;
    },
    precoBase(): number {
      if (!this.produto) return 0;
      const p = this.produto;
      const valor = p.preco ?? p.valor ?? p.preco_venda ?? p.valor_venda ?? p.preco_unitario ?? 0;
      return Number(valor) || 0;
    },
    temDesconto(): boolean {
      if (!this.produto) return false;
      const p = this.produto;
      if (p.promocao_desconto === null || p.promocao_desconto === undefined) return false;
      const agora = Date.now();
      const inicio = p.desconto_inicio ? Number(p.desconto_inicio) : null;
      const fim = p.desconto_fim ? Number(p.desconto_fim) : null;
      if (inicio && fim) return agora >= inicio && agora <= fim;
      return true;
    },
    percentualDesconto(): number {
      if (!this.produto) return 0;
      const v = Number(this.produto.promocao_desconto) || 0;
      return v > 0 && v <= 1 ? Math.round(v * 100) : Math.round(v);
    },
    precoFinal(): number {
      if (!this.temDesconto) return this.precoBase;
      return Math.max(this.precoBase * (1 - this.percentualDesconto / 100), 0);
    },
    statusLancamentoLabel(): string {
      const map: Record<string, string> = {
        nao_lido: 'Aguardando análise',
        aceito: 'Aceito pela loja',
        recusado: 'Recusado pela loja',
        lido: 'Visualizado'
      };
      return map[this.produto?.status_lancamento] || this.produto?.status_lancamento || '';
    },

    // Lista atualmente exibida, conforme o botão escolhido
    listaAtiva(): any[] {
      if (this.modoAtivo === 'pedido_direto') return this.pedidosDiretos;
      if (this.modoAtivo === 'cotacao') return this.cotacoesInternas;
      return [];
    },

    carregandoListaAtiva(): boolean {
      if (this.modoAtivo === 'pedido_direto') return this.loadingPedidosDiretos;
      if (this.modoAtivo === 'cotacao') return this.loadingCotacoesInternas;
      return false;
    },
    totalPaginas(): number {
      return Math.max(Math.ceil(this.listaAtiva.length / this.itensPorPagina), 1);
    },

    itensPaginados(): any[] {
      const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
      return this.listaAtiva.slice(inicio, inicio + this.itensPorPagina);
    },

    ehPedidoDireto(): boolean {
      return this.modoAtivo === 'pedido_direto' && !!this.itemSelecionado;
    },

    idCotacaoSelecionada(): number | null {
      return this.modoAtivo === 'cotacao' && this.itemSelecionado ? this.itemSelecionado.id_cotacao : null;
    },

    idPedidoDiretoSelecionado(): number | null {
      return this.modoAtivo === 'pedido_direto' && this.itemSelecionado ? this.itemSelecionado.id_pedido_direto : null;
    },

    // Combina o estado interno (chamadas feitas por este componente) com o
    // estado eventualmente controlado pelo componente pai
    estaSalvando(): boolean {
      return this.salvando || this.enviando;
    },

    feedbackExibido(): { tipo: 'ok' | 'erro'; msg: string } | null {
      return this.feedbackLocal || this.feedback;
    },

    textoBotaoConfirmar(): string {
      if (this.estaSalvando) return this.ehPedidoDireto ? 'Enviando...' : 'Adicionando...';
      return this.ehPedidoDireto ? 'Adicionar ao Pedido Direto' : 'Adicionar à Cotação';
    },

    // ── Avaliação (0 a 5) ──────────────────────────────────
    // Testamos os nomes de campo mais prováveis; ajuste conforme o payload real.
    notaAvaliacao(): number {
      if (!this.produto) return 0;
      const p = this.produto;
      const valor = p.avaliacao ?? p.nota_media ?? p.media_avaliacao ?? p.rating ?? p?.metricas?.avaliacao ?? 0;
      return Math.min(5, Math.max(0, Number(valor) || 0));
    },

    // Lista de características exibidas na seção "Características" do PDF
    listaCaracteristicas(): { label: string; valor: string }[] {
      if (!this.produto) return [];
      const p = this.produto;
      const linhas: { label: string; valor: string }[] = [];
      if (p.categoria) linhas.push({ label: 'Categoria', valor: p.categoria });
      if (p.fornecedor) linhas.push({ label: 'Fornecedor', valor: p.fornecedor });
      if (p.codigo_barra) linhas.push({ label: 'Código de barras', valor: p.codigo_barra });
      if (p.tipo || p.tipo_produto) linhas.push({ label: 'Tipo', valor: p.tipo || p.tipo_produto });
      if (p.qtd_unitaria_composicao) linhas.push({ label: 'Qtd. unitária', valor: String(p.qtd_unitaria_composicao) });
      linhas.push({ label: 'Status', valor: p.ativo === false ? 'Inativo' : 'Ativo' });
      if (p.eh_lancamento) linhas.push({ label: 'Lançamento', valor: 'Sim' });
      return linhas;
    }
  },

  methods: {
    fechar() {
      this.$emit('close');
    },
    onImgError() {
      this.imgFallback = true;
    },

    // Alterna qual bloco (Pedido Direto / Cotação) está sendo exibido
    toggleModo(modo: 'pedido_direto' | 'cotacao') {
      this.modoAtivo = this.modoAtivo === modo ? null : modo;
      this.itemSelecionado = null;
      this.paginaAtual = 1;
      this.feedbackLocal = null;

      if (this.modoAtivo === 'pedido_direto') {
        this.buscarPedidosDiretos();
      } else if (this.modoAtivo === 'cotacao') {
        this.buscarCotacoes();
      }
    },

    statusCotacaoLabel(cotacao: any): string {
      if (!cotacao?.status_cotacao) return '';
      if (cotacao.status_cotacao === 'fechada') return 'INDISPONÍVEL';
      if (cotacao.status_cotacao === 'aberta') return 'ABERTA';
      if (cotacao.status_cotacao === 'finalizada') {
        return cotacao.status_fechamento === 'concluido' ? 'FINALIZADA' : 'FECHADA';
      }
      return cotacao.status_cotacao.toUpperCase();
    },

    async buscarCotacoes() {
      this.loadingCotacoesInternas = true;
      try {
        const response = await api.get(`/mvpu/cotacao/consultarCotacao/${this.auth.loja.id_loja}`);
        const todas = response.data.data || [];

        // Só entram na lista as cotações cujo status calculado é "FECHADA"
        const fechadas = todas.filter((c: any) => this.statusCotacaoLabel(c) === 'INDISPONÍVEL');

        // Ordena da mais recente para a menos recente
        this.cotacoesInternas = fechadas.sort((a: any, b: any) =>
          this.timestampCotacao(b) - this.timestampCotacao(a)
        );
      } catch (e) {
        this.tratarErro(e);
      } finally {
        this.loadingCotacoesInternas = false;
      }
    },

    // Extrai um valor comparável de data/hora da cotação, testando os campos
    // mais prováveis. Ajuste os nomes abaixo conforme o que sua API realmente retorna.
    timestampCotacao(cotacao: any): number {
      const bruto =
        cotacao?.inicio_cotacao ??
        null;

      if (bruto) {
        const n = Number(bruto);
        // timestamp numérico (ms ou s)
        if (!isNaN(n)) return n < 1e12 ? n * 1000 : n;
        // string de data
        const d = new Date(bruto);
        if (!isNaN(d.getTime())) return d.getTime();
      }

      // fallback: usa o id_cotacao como proxy de recência
      return Number(cotacao?.id_cotacao) || 0;
    },

    statValue(p, field) {
      return Number(p && p[field]) || 0;
    },
    // Abrevia números grandes para caber na listagem (1200 -> "1,2 mil")
    formatCount(n) {
      const v = Number(n) || 0;
      if (v >= 1000) return (v / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' mil';
      return String(v);
    },
    
    // Retorna um array de 5 posições ('full' | 'half' | 'empty') para desenhar a barra de estrelas
    starArray (media){
        const stars = [];

        for (let i = 1; i <= 5; i++) {
            if (media >= i) {
            stars.push('full');
            } else if (media >= i - 0.5) {
            stars.push('half');
            } else {
            stars.push('empty');
            }
        }

        return stars;
    },


    selecionarItem(item: any) {
      this.itemSelecionado = item;
    },

    async buscarPedidosDiretos() {
      this.loadingPedidosDiretos = true;
      try {
        const response = await api.get(`/mvpu/cotacao/consultarPedidosDiretos/${this.auth.loja.id_loja}/0`);
        this.pedidosDiretos = response.data.data || [];
      } catch (e) {
        this.tratarErro(e);
      } finally {
        this.loadingPedidosDiretos = false;
      }
    },

    paginaAnterior() {
      if (this.paginaAtual > 1) this.paginaAtual--;
    },
    proximaPagina() {
      if (this.paginaAtual < this.totalPaginas) this.paginaAtual++;
    },
    incQty() {
      this.quantidade = (Number(this.quantidade) || 1) + 1;
    },
    decQty() {
      this.quantidade = Math.max((Number(this.quantidade) || 1) - 1, 1);
    },
    formatBRL(v: number): string {
      return Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    },
    formatDate(ts: any): string {
      if (!ts) return '-';
      const n = Number(ts);
      const d = new Date(n);
      if (isNaN(d.getTime())) return '-';
      return d.toLocaleDateString('pt-BR');
    },
    confirmar() {
      if (!this.itemSelecionado || !this.produto) return;
      if (this.ehPedidoDireto) {
        this.adicionarItemPedidoDireto();
      } else if (this.idCotacaoSelecionada) {
        this.adicionarItemCotacao();
      }
    },

    // Insere o produto em uma cotação já existente
    async adicionarItemCotacao() {
      if (!this.idCotacaoSelecionada) return;
      try {
        this.salvando = true;

        const payload_item = [
          this.produto.nome,
          this.quantidade,
          // ajuste os nomes dos campos abaixo conforme o objeto `produto` recebido
          this.produto.tipo_produto ?? this.produto.tipo ?? null,
          this.produto.qtd_unitaria_composicao ?? null
        ];

        const payload_final = {
          codigo_barra: [payload_item]
        }

        await api.post(`/mvpu/cotacao/adicionarProdutoInexis/${this.auth.loja.id_loja}/${this.idCotacaoSelecionada}`, payload_final);
        this.exibirFeedback('ok', 'Produto adicionado à cotação!');
        this.$emit('item-adicionado', {
          tipo: 'cotacao',
          id_cotacao: this.idCotacaoSelecionada,
          produto: this.produto,
          quantidade: this.quantidade
        });
      } catch (e) {
        this.tratarErro(e);
      } finally {
        this.salvando = false;
      }
    },

    // Insere o produto em um pedido direto já existente
    async adicionarItemPedidoDireto() {
      if (!this.idPedidoDiretoSelecionado) return;
      try {
        this.salvando = true;
        const payload = {
          id_pedido_direto: this.idPedidoDiretoSelecionado,
          // ajuste os nomes dos campos abaixo conforme o objeto `produto` recebido
          nome: this.produto.nome,
          id_produto: this.produto.id_produto,
          id_vendedor: this.produto.id_vendedor,
          id_colaborador: this.auth.user?.id_usuario,
          tipo_produto: this.produto.tipo ?? null,
          origem: 'marviztrend',
          preco_produto: Number(this.precoFinal).toFixed(2),
          quantidade: this.quantidade,
          qtd_unitaria_composicao: this.produto.qtd_unitaria_composicao ?? null
        };
        await api.post(
          `/mvpu/cotacao/criarItemPedDir/${this.auth.loja.id_loja}/${this.idPedidoDiretoSelecionado}`,
          payload
        );
        this.exibirFeedback('ok', 'Produto adicionado ao pedido direto!');
        this.$emit('item-adicionado', {
          tipo: 'pedido_direto',
          id_pedido_direto: this.idPedidoDiretoSelecionado,
          produto: this.produto,
          quantidade: this.quantidade,
          observacao: this.observacao
        });
      } catch (e) {
        this.tratarErro(e);
      } finally {
        this.salvando = false;
      }
    },

    exibirFeedback(tipo: 'ok' | 'erro', msg: string) {
      this.feedbackLocal = { tipo, msg };
      setTimeout(() => {
        this.feedbackLocal = null;
      }, 3500);
    },

    tratarErro(e: any) {
      // Se o projeto já tiver um util `exibeErro(e, this.$toast)`, substitua
      // o bloco abaixo pela chamada a ele para manter o padrão usado no resto da app.
      const msg = e?.response?.data?.message || e?.message || 'Ocorreu um erro. Tente novamente.';
      if (this.$toast?.add) {
        this.$toast.add({ severity: 'error', summary: 'Erro', detail: msg, life: 3000 });
      }
      this.exibirFeedback('erro', msg);
    }
  },

  mounted(){
    this.auth = useAuthStore()
  }
});
</script>

<style scoped>
.pm-fade-enter-active, .pm-fade-leave-active { transition: opacity .2s ease; }
.pm-fade-enter-from, .pm-fade-leave-to { opacity: 0; }

.pm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(2px);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  min-height: 800px;
  padding: 16px;
}

.pm-panel {
  background: var(--bg-card, #ffffff);
  border-radius: 16px;
  width: 100%;
  max-width: 880px;
  max-height: 92vh;
  overflow: hidden;
  position: relative;
  box-shadow: var(--shadow-md, 0 10px 15px -3px rgba(0,0,0,0.06), 0 4px 6px -2px rgba(0,0,0,0.03));
}

.pm-close {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 5;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.9);
  color: var(--text1, #1e293b);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: var(--shadow, 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03));
}

.pm-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  max-height: 92vh;
}

/* Galeria */
.pm-gallery { background: var(--bg-el, #f1f3f5); display: flex; flex-direction: column; }
.pm-gallery-main {
  position: relative;
  width: 100%;
  aspect-ratio: 1/1;
  background: var(--bg-el, #f1f3f5);
}
.pm-gallery-main img { width: 100%; height: 100%; object-fit: cover; display: block; }
.pm-badge {
  position: absolute; top: 10px; left: 10px;
  font-size: 11px; font-weight: 800; color: #fff;
  padding: 4px 9px; border-radius: 6px;
}
.pm-badge-red { background: var(--accent, #FF8049); }
.pm-badge-green { background: var(--green, #16a34a); }

.pm-thumbs { display: flex; gap: 8px; padding: 10px; overflow-x: auto; }
.pm-thumb {
  width: 52px; height: 52px; border-radius: 8px; overflow: hidden;
  border: 2px solid transparent; padding: 0; cursor: pointer; flex: none;
  background: var(--bg-card, #ffffff);
}
.pm-thumb.active { border-color: var(--accent, #FF8049); }
.pm-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }

/* Info */
.pm-info { display: flex; flex-direction: column; max-height: 92vh; background: #fff !important; }
.pm-info-scroll { padding: 20px 20px 8px; overflow-y: auto; flex: 1; }

.pm-top-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }
.pm-tag {
  font-size: 10.5px; font-weight: 700; color: var(--blue, #2563eb);
  background: var(--blue2, #dbeafe); padding: 3px 9px; border-radius: 20px;
}
.pm-tag-alt { color: var(--text2, #64748b); background: var(--bg-el, #f1f3f5); }
.pm-tag-red { color: var(--red, #dc2626); background: var(--red2, #fee2e2); }

.pm-title { font-size: 19px; color: var(--text1, #1e293b); margin: 0 0 6px; line-height: 1.3; }
.pm-barcode { font-size: 11.5px; color: var(--muted, #94a3b8); display: flex; align-items: center; gap: 5px; margin-bottom: 10px; }

.pm-preco-row { display: flex; align-items: baseline; gap: 10px; margin-bottom: 6px; }
.pm-preco-final { font-size: 24px; color: var(--accent, #FF8049); }
.pm-preco-original { font-size: 14px; color: var(--muted, #94a3b8); text-decoration: line-through; }

.pm-desconto-info {
  font-size: 11.5px; color: var(--text2, #64748b); display: flex; align-items: center; gap: 5px;
  background: var(--accent2, #FFE4D1); padding: 6px 10px; border-radius: 8px; margin-bottom: 10px; width: fit-content;
}

.pm-lancamento-info {
  background: var(--bg-el, #f1f3f5); border: 1px solid var(--border, #e2e8f0); border-radius: 10px;
  padding: 10px 12px; margin-bottom: 12px; font-size: 11.5px; color: var(--text2, #64748b);
}
.pm-li-row { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
.pm-li-status { font-weight: 700; font-size: 11px; display: inline-block; padding: 2px 8px; border-radius: 5px; }
.st-nao_lido { color: var(--blue, #2563eb); background: var(--blue2, #dbeafe); }
.st-aceito { color: var(--green, #16a34a); background: var(--green2, #dcfce7); }
.st-recusado { color: var(--red, #dc2626); background: var(--red2, #fee2e2); }
.pm-li-motivo { margin-top: 4px; color: var(--red, #dc2626); }

.pm-descricao { font-size: 13px; color: var(--text2, #64748b); line-height: 1.55; margin: 0 0 14px; }
.pm-descricao-vazia { font-style: italic; color: var(--muted, #94a3b8); }

.pm-completude { margin-bottom: 4px; }
.pm-completude-head { display: flex; justify-content: space-between; font-size: 11.5px; color: var(--text2, #64748b); margin-bottom: 5px; }
.pcard-completude-track { height: 5px; border-radius: 4px; background: var(--bg-el2, #e9ecef); overflow: hidden; }
.pcard-completude-fill { height: 100%; background: var(--green, #16a34a); border-radius: 4px; }

/* Ações */
.pm-actions {
  border-top: 1px solid var(--border, #e2e8f0);
  padding: 14px 20px 18px;
  background: var(--bg-card, #ffffff);
}
.pm-qty-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.pm-qty-label { font-size: 12px; color: var(--text2, #64748b); }
.pm-qty-stepper { display: flex; align-items: center; border: 1px solid var(--border, #e2e8f0); border-radius: 8px; overflow: hidden; }
.pm-qty-stepper button {
  width: 30px; height: 30px; border: none; background: var(--bg-el, #f1f3f5); color: var(--text1, #1e293b);
  display: flex; align-items: center; justify-content: center; cursor: pointer;
}
.pm-qty-stepper button .material-symbols-outlined { font-size: 15px; }
.pm-qty-stepper input {
  width: 42px; text-align: center; border: none; outline: none; font-size: 13px;
  -moz-appearance: textfield;
}
.pm-qty-stepper input::-webkit-outer-spin-button,
.pm-qty-stepper input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }

.pm-field-label { font-size: 11.5px; color: var(--text2, #64748b); display: block; margin-bottom: 6px; }
.pm-textarea {
  width: 100%; border: 1px solid var(--border, #e2e8f0); border-radius: 8px; padding: 9px 10px;
  font-size: 12.5px; color: var(--text1, #1e293b); font-family: inherit; outline: none; background: var(--bg-card, #ffffff);
  margin-bottom: 8px; resize: vertical;
}

/* Toggle Pedido Direto / Cotação */
.pm-modo-toggle { display: flex; gap: 8px; margin-bottom: 10px; }
.pm-modo-btn {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
  border: 1px solid var(--border, #e2e8f0); background: var(--bg-card, #ffffff);
  border-radius: 8px; padding: 9px 10px; font-size: 12.5px; font-weight: 600;
  color: var(--text1, #1e293b); cursor: pointer; transition: border-color .15s ease, background .15s ease;
}
.pm-modo-btn:hover { border-color: var(--accent, #FF8049); }
.pm-modo-btn.active { border-color: var(--accent, #FF8049); background: var(--accent2, #FFE4D1); color: var(--accent, #FF8049); }
.pm-modo-btn .material-symbols-outlined { font-size: 16px !important; }

/* Lista de opções (pedido direto + cotações) */
.pm-opcao-item {
  width: 100%; display: flex; align-items: center; gap: 8px;
  border: 1px solid var(--border, #e2e8f0); background: var(--bg-card, #ffffff);
  border-radius: 8px; padding: 9px 10px; margin-bottom: 6px;
  font-size: 12.5px; color: var(--text1, #1e293b); font-family: inherit;
  cursor: pointer; text-align: left; transition: border-color .15s ease, background .15s ease;
}
.pm-opcao-item:hover { border-color: var(--accent, #FF8049); }
.pm-opcao-item.active {
  border-color: var(--accent, #FF8049);
  background: var(--accent2, #FFE4D1);
}
.pm-opcao-icone { font-size: 16px !important; color: var(--text2, #64748b); flex: none; }
.pm-opcao-item.active .pm-opcao-icone { color: var(--accent, #FF8049); }
.pm-opcao-texto { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pm-opcao-id { color: var(--muted, #94a3b8); font-size: 11px; }
.pm-opcao-check { font-size: 17px !important; color: var(--accent, #FF8049); flex: none; }

.pm-cotacoes-lista { display: flex; flex-direction: column; }

.pm-paginacao {
  display: flex; align-items: center; justify-content: center; gap: 12px;
  margin: 4px 0 10px;
}
.pm-pag-btn {
  width: 28px; height: 28px; border-radius: 7px; border: 1px solid var(--border, #e2e8f0);
  background: var(--bg-el, #f1f3f5); color: var(--text1, #1e293b);
  display: flex; align-items: center; justify-content: center; cursor: pointer;
}
.pm-pag-btn:disabled { opacity: .4; cursor: not-allowed; }
.pm-pag-info { font-size: 11.5px; color: var(--text2, #64748b); }

.pm-empty-hint { font-size: 11px; color: var(--muted, #94a3b8); margin-bottom: 10px; line-height: 1.4; }
.pm-loading-hint {
  font-size: 11px; color: var(--text2, #64748b); margin-bottom: 10px;
  display: flex; align-items: center; gap: 6px;
}
.pm-spin { font-size: 15px !important; animation: pm-spin-anim 1s linear infinite; }
@keyframes pm-spin-anim { to { transform: rotate(360deg); } }

.pm-confirm-btn {
  width: 100%; border: none; background: var(--accent, #FF8049); color: #fff; border-radius: 9px;
  padding: 11px 0; font-size: 12.5px; display: flex; align-items: center; justify-content: center;
  gap: 6px; cursor: pointer; transition: background .15s ease;
  margin-top: 4px;
}
.pm-confirm-btn:hover:not(:disabled) { background: #E86A32; }
.pm-confirm-btn:disabled { opacity: .5; cursor: not-allowed; }

.pm-feedback {
  margin-top: 10px; font-size: 11.5px; padding: 8px 10px; border-radius: 8px;
  display: flex; align-items: center; gap: 6px;
}
.fb-ok { background: var(--green2, #dcfce7); color: var(--green, #16a34a); }
.fb-erro { background: var(--red2, #fee2e2); color: var(--red, #dc2626); }

@media (max-width: 720px) {
  .pm-grid { grid-template-columns: 1fr; overflow-y: auto; }
  .pm-panel { max-height: 94vh; }
  .pm-gallery-main { aspect-ratio: 4/3; }
}

</style>