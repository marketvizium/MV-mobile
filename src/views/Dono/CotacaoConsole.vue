<template>
  <ion-page class="console-page">
    <ion-content :fullscreen="true" class="console-content">

      <RefresherIonic />

      <!-- ══ HEADER ══ -->
      <div class="cc-header">
        <div class="cc-header-left">
          <button class="back-btn" @click="$router.back()">
            <span class="material-symbols-outlined">arrow_back_ios_new</span>
          </button>
          <div class="cotacao-identity">
            <span class="cotacao-label">COTAÇÃO</span>
            <span class="cotacao-name">{{ cabecalho?.nome_cotacao || nomeCotacao || '—' }}</span>
          </div>
        </div>
        <div class="cc-header-right" v-if="cabecalho">
          <span class="meta-id">#{{ cabecalho.id_cotacao }}</span>
          <div :class="['status-pill', 'status-' + cabecalho.status_cotacao]">
            <span class="status-dot"></span>
            {{ statusLabel(cabecalho.status_cotacao, cabecalho.status_fechamento) }}
          </div>
        </div>
      </div>

      <!-- ══ PERÍODO ══ -->
      <div class="periodo-bar" v-if="cabecalho" v-show="user?.nivel != 7">
        <span class="material-symbols-outlined periodo-icon">calendar_today</span>
        <span class="periodo-text poppins-regular">
          {{ formatarData(cabecalho.inicio_cotacao) }} → {{ formatarData(cabecalho.final_cotacao) }}
        </span>
      </div>

     

      <!-- ══ AÇÕES DO HEADER (baseadas no status) ══ -->
      <div class="header-actions" v-if="cabecalho" v-show="user?.nivel != 7">
        <button
          class="action-btn btn-outline poppins-medium"
          @click="showPeriodoModal = true"
          :disabled="cabecalho.status_cotacao !== 'fechada'"
        >
          <span class="material-symbols-outlined">schedule</span> Período
        </button>

        <button
          class="action-btn btn-primary poppins-medium"
          v-if="cabecalho.status_cotacao === 'fechada'"
          :disabled="loadingAcao"
          @click="abrirCotacao"
        >
          <span class="material-symbols-outlined">lock_open</span> Abrir Cotação
        </button>

        <button
          class="action-btn btn-info poppins-medium"
          v-if="cabecalho.status_cotacao === 'aberta'"
          :disabled="loadingAcao"
          @click="finalizarCotacao"
        >
          <span class="material-symbols-outlined">check_circle</span> Finalizar
        </button>

        <button
          class="action-btn btn-success poppins-medium"
          v-if="cabecalho.status_cotacao === 'finalizada' && existePendente"
          :disabled="loadingButtonConcluir"
          @click="concluirCotacao"
        >
          <span class="material-symbols-outlined">flag</span> Concluir
        </button>
      </div>

      <!-- ══ TABS ══ -->
      <div class="tabs-bar" v-show="user?.nivel != 7">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          :class="['tab-btn', 'poppins-medium', { active: activeTab === tab.key, 'tab-disable': tab.disabled }]"
          :disabled="tab.disabled"
          @click="activeTab = tab.key"
        >
          <span class="material-symbols-outlined tab-icon">{{ tab.icon }}</span>
          <span class="tab-label">{{ tab.label }}</span>
          <span class="tab-badge" v-if="tab.badge">{{ tab.badge }}</span>
        </button>
      </div>

      <!-- ══════════════════════════════════
           TAB: PRODUTOS
      ══════════════════════════════════ -->
      <div v-if="activeTab === 'produtos'" class="tab-pane">

        <!-- Search + Ações -->
        <div class="pane-header">
          <div class="search-wrap">
            <span class="material-symbols-outlined sb-icon">search</span>
            <input
              type="text"
              v-model="searchProdutos"
              placeholder="Buscar produto, cód. barras..."
              class="sb-input poppins-regular"
            />
            <button v-if="searchProdutos" class="sb-clear" @click="searchProdutos = ''">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <div class="pane-btn-group" v-if="cabecalho && cabecalho.status_cotacao === 'fechada'">
            <!-- Adicionar produto cadastrado via câmera (NOVO) -->
            <button class="fab-scan-btn poppins-medium" @click="abrirScannerCatalogo">
              <span class="material-symbols-outlined">barcode_scanner</span>
            </button>

            <button class="action-btn btn-outline poppins-medium" @click="showAddProdutoModal = true">
              <span class="material-symbols-outlined">add</span> Produto
            </button>

            <button class="action-btn btn-outline-gray poppins-medium" @click="showAddProdutoModalInexistente = true">
              <span class="material-symbols-outlined">add_circle</span> Produto não cadastrado
            </button>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loadingProdutos" class="loading-state">
          <ion-spinner name="crescent" color="primary"></ion-spinner>
          <p class="poppins-regular">Carregando produtos...</p>
        </div>

        <!-- Vazio -->
        <div v-else-if="produtosFiltrados.length === 0" class="empty-state">
          <div class="empty-icon-wrap">
            <span class="material-symbols-outlined">inventory_2</span>
          </div>
          <h3 class="poppins-semibold">Nenhum produto</h3>
          <p class="poppins-regular">Adicione produtos à cotação usando os botões acima.</p>
        </div>

        <!-- Lista de produtos (mobile cards) -->
        <div v-else class="produtos-list">
          <div
            v-for="p in produtosFiltrados"
            :key="p.id_solicitado"
            class="produto-card"
          >
            <div class="pc-top">
              <div class="pc-info">
                <span class="pc-name poppins-semibold">{{ p.nome }}</span>
                <span class="pc-barcode poppins-regular mono" v-if="p.codigo_barra">
                  {{ p.codigo_barra }}
                </span>
                <span class="pc-barcode poppins-regular muted" v-else>Não cadastrado</span>
                <span class="pc-cat poppins-regular" v-if="p.categoria">{{ p.categoria }}</span>
              </div>
              <div class="pc-actions" v-if="podeEditarProduto">
                <button class="icon-btn edit" @click="abrirDetalhes(p)">
                  <span class="material-symbols-outlined">visibility</span>
                </button>
                <button class="icon-btn edit" @click="abrirEditarProduto(p)">
                  <span class="material-symbols-outlined">edit</span>
                </button>
                <button class="icon-btn del" @click="confirmarDeleteProduto(p)">
                  <span class="material-symbols-outlined">delete</span>
                </button>
              </div>
              <span class="material-symbols-outlined locked-hint" v-else>lock</span>
            </div>

            <div class="pc-details">
              <div class="pc-detail-item">
                <span class="pc-detail-label poppins-regular">Qtd</span>
                <span class="pc-detail-val poppins-semibold">{{ p.quantidade || '—' }}</span>
              </div>
              <div class="pc-detail-item" v-if="p.tipo">
                <span class="pc-detail-label poppins-regular">Tipo</span>
                <span class="type-tag poppins-medium">{{ p.tipo }}</span>
              </div>
              <div class="pc-detail-item" v-if="p.qtd_unitaria_composicao">
                <span class="pc-detail-label poppins-regular">Comp.</span>
                <span class="pc-detail-val poppins-medium">{{ p.qtd_unitaria_composicao }} un</span>
              </div>
              <div class="pc-detail-item">
                <span class="pc-detail-label poppins-regular">Custo</span>
                <span class="pc-detail-val poppins-medium">R$ {{ formatVal(p.preco_custo) }}</span>
              </div>
              <div class="pc-detail-item">
                <span class="pc-detail-label poppins-regular">Últ. Preço</span>
                <span class="pc-detail-val poppins-medium">R$ {{ p.ultimo_preco || "--" }}</span>
              </div>
              <div class="pc-detail-item">
                <span class="pc-detail-label poppins-regular">Últ. Qtd</span>
                <span class="pc-detail-val poppins-medium">R$ {{ p.ultima_quantidade || "--" }}</span>
              </div>
              <div class="pc-detail-item" v-if="p.margem != null">
                <span class="pc-detail-label poppins-regular">Margem</span>
                <span :class="['margem-badge', 'poppins-semibold', p.margem > 0 ? 'pos' : 'neg']">
                  {{ p.margem }}%
                </span>
              </div>
              <div class="pc-detail-item">
                <span class="pc-detail-label poppins-regular">Venda</span>
                <span class="pc-detail-val poppins-medium">R$ {{ formatVal(p.preco_venda) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ══════════════════════════════════
           TAB: OFERTAS
      ══════════════════════════════════ -->
      <div v-if="activeTab === 'ofertas'" v-show="user?.nivel != 7" class="tab-pane">

        <div class="pane-header">
          <div class="search-wrap">
            <span class="material-symbols-outlined sb-icon">search</span>
            <input
              type="text"
              v-model="searchOfertas"
              placeholder="Buscar produto ou vendedor..."
              class="sb-input poppins-regular"
            />
          </div>
          <div class="pane-btn-group" v-if="cabecalho && cabecalho.status_cotacao === 'finalizada'">
            <button class="action-btn btn-outline poppins-medium" @click="removerTodasSelecoes" :disabled="!existePendente">
              <span class="material-symbols-outlined">remove_done</span>
            </button>
            <button class="action-btn btn-outline poppins-medium" @click="selecaoAutomatica" :disabled="loadingAutoSelect">
              <span class="material-symbols-outlined">auto_fix_high</span> Auto
            </button>
          </div>
        </div>

        <div v-if="loadingOfertas" class="loading-state">
          <ion-spinner name="crescent" color="primary"></ion-spinner>
          <p class="poppins-regular">Carregando ofertas...</p>
        </div>

        <div v-else-if="itensFiltradosOfertas.length === 0" class="empty-state">
          <div class="empty-icon-wrap">
            <span class="material-symbols-outlined">local_offer</span>
          </div>
          <h3 class="poppins-semibold">Nenhuma oferta</h3>
          <p class="poppins-regular">Nenhuma oferta recebida ainda.</p>
        </div>

        <div v-else class="ofertas-list">
          <div
            v-for="item in itensFiltradosOfertas"
            :key="item.id_solicitado"
            :class="['oferta-card', item.status_fechamento]"
          >
            <!-- Cabeçalho do item -->
            <div class="oferta-card-header">
              <div class="oih-left">
                <span class="oih-name poppins-semibold">{{ item.nome }}</span>
                <span class="oih-code mono poppins-regular" v-if="item.codigo_barra">{{ item.codigo_barra }}</span>
              </div>
              <div class="oih-right">
                <span class="oih-qty poppins-regular"  style="color: #000;">{{ item.quantidade }} un.</span>
                <div :class="['status-pill', 'status-' + (item.status_fechamento || 'none')]">
                  <span class="status-dot"></span>
                  <span class="poppins-medium">{{ item.status_fechamento ? capitalize(item.status_fechamento) : 'Não Selecionado' }}</span>
                </div>
              </div>
            </div>

            <!-- Resumo de ofertas -->
            <div class="oferta-resumo">
              <div class="oferta-resumo-stats">
                <div class="ors-item">
                  <span class="ors-label poppins-regular">Ofertas</span>
                  <span class="ors-val poppins-semibold">{{ item.ofertas ? item.ofertas.length : 0 }}</span>
                </div>
                <div class="ors-item" v-if="melhorOfertaItem(item)">
                  <span class="ors-label poppins-regular">Ganhando</span>
                  <span class="ors-vendedor poppins-semibold">{{ melhorOfertaItem(item).nome }}</span>
                </div>
                <div class="ors-item" v-if="melhorOfertaItem(item)">
                  <span class="ors-label poppins-regular">Menor preço</span>
                  <span class="ors-preco poppins-semibold">R$ {{ formatVal(melhorPrecoItem(item)) }}</span>
                </div>
                <div class="ors-item" v-if="!item.ofertas || item.ofertas.length === 0">
                  <span class="ors-empty poppins-regular">Nenhuma oferta ainda</span>
                </div>
              </div>
              <div class="oferta-resumo-actions">
                <button
                  class="ver-ofertas-btn poppins-medium"
                  v-if="item.ofertas && item.ofertas.length > 0"
                  @click="abrirModalOfertas(item)"
                >
                  <span class="material-symbols-outlined">local_offer</span>
                  Ver ofertas
                </button>
                <!--
                <button
                  class="link-btn poppins-medium"
                  v-if="cabecalho && cabecalho.status_cotacao === 'finalizada' && item.status_fechamento !== 'concluido'"
                  @click="abrirFaturamentoExtra(item)"
                >
                  <span class="material-symbols-outlined">add_circle</span> Extra
                </button>
                -->
              </div>
            </div>
          </div>
        </div>

        <!-- Bar concluir -->
        <div class="conclude-bar" v-if="cabecalho && cabecalho.status_cotacao === 'finalizada' && existePendente">
          <span class="conclude-hint poppins-regular">
            <span class="material-symbols-outlined">info</span>
            {{ itens.filter(i => i.status_fechamento === 'pendente').length }} produto(s) pendente(s).
          </span>
          <button class="action-btn btn-success poppins-medium" :disabled="loadingButtonConcluir" @click="concluirCotacao">
            <span class="material-symbols-outlined">flag</span> Concluir
          </button>
        </div>
      </div>

      <!-- ══════════════════════════════════
           TAB: VENDEDORES
      ══════════════════════════════════ -->
      <div v-if="activeTab === 'vendedores'" v-show="user?.nivel != 7" class="tab-pane">
        <div v-if="loadingVendedores" class="loading-state">
          <ion-spinner name="crescent" color="primary"></ion-spinner>
          <p class="poppins-regular">Carregando vendedores...</p>
        </div>
        <div v-else-if="vendedores.length === 0" class="empty-state">
          <div class="empty-icon-wrap">
            <span class="material-symbols-outlined">group</span>
          </div>
          <h3 class="poppins-semibold">Nenhum vendedor</h3>
          <p class="poppins-regular">Nenhum vendedor encontrado.</p>
        </div>
        <div v-else class="vendedores-list-mobile">
          <div v-for="v in vendedores" :key="v.id_vendedor" class="vendedor-card-mobile">
            <div class="vc-avatar">
              <img v-if="v.foto_perfil" :src="v.foto_perfil" :alt="v.nome" />
              <span v-else class="vc-initials poppins-semibold">{{ initials(v.nome) }}</span>
              <span :class="['vc-status', v.status_conta]"></span>
            </div>
            <div class="vc-info">
              <span class="vc-name poppins-semibold">{{ v.nome }}</span>
              <span class="vc-user muted poppins-regular">@{{ v.nome_usuario }}</span>
              <span class="vc-email muted poppins-regular">{{ v.email }}</span>
            </div>
            <div class="vc-stats">
              <div class="vc-stat">
                <b class="poppins-semibold">{{ v.num_cotacoes }}</b>
                <span class="poppins-regular">Cotações</span>
              </div>
              <div class="vc-stat">
                <b class="poppins-semibold">{{ v.taxa_resposta }}</b>
                <span class="poppins-regular">Resp.</span>
              </div>
              <div class="vc-stat">
                <b class="poppins-semibold">{{ v.num_vendas }}</b>
                <span class="poppins-regular">Vendas</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ══════════════════════════════════
           TAB: SUGESTÃO (desabilitada)
      ══════════════════════════════════ -->
      <div v-if="activeTab === 'sugestao'" v-show="user?.nivel != 7" class="tab-pane">
        <div class="empty-state">
          <div class="empty-icon-wrap">
            <span class="material-symbols-outlined">lightbulb</span>
          </div>
          <p class="poppins-regular">Sugestão de pedido em breve.</p>
        </div>
      </div>

    </ion-content>

    <!-- ═══════════════════════════════════════════════════════
         MODAIS (ion-modal)
    ═══════════════════════════════════════════════════════ -->

    <!-- MODAL: EDITAR PRODUTO -->
    <ion-modal :is-open="showEditModal" @did-dismiss="showEditModal = false" class="bottom-sheet">
      <ion-content class="modal-content">
        <div class="modal-handle"></div>
        <div class="modal-box">
          <div class="modal-header">
            <span class="poppins-semibold">Editar Produto</span>
            <button class="modal-close" @click="showEditModal = false">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <div class="modal-body" v-if="editTarget">
            <p class="modal-prod-name poppins-semibold">{{ editTarget.nome }}</p>
            <div class="form-group">
              <label class="form-label poppins-medium">Quantidade *</label>
              <input type="number" v-model.number="editTarget.quantidade" min="1" class="form-input poppins-regular" />
            </div>
            <div class="form-group">
              <label class="form-label poppins-medium">Tipo</label>
              <select v-model="editTarget.tipo" class="form-input poppins-regular">
                <option value="">Selecionar...</option>
                <option value="unidade">Unidade</option>
                <option value="caixa">Caixa</option>
                <option value="fardo">Fardo</option>

              </select>
            </div>
            <div class="form-group">
              <label class="form-label poppins-medium">Qtd por embalagem</label>
              <input type="number" v-model.number="editTarget.qtd_unitaria_composicao" min="1" class="form-input poppins-regular" placeholder="Ex: 12" />
            </div>
          </div>
          <div class="modal-footer">
            <button class="action-btn btn-outline poppins-medium full-w" @click="showEditModal = false">Cancelar</button>
            <button class="action-btn btn-primary poppins-medium full-w" :disabled="loadingEdit" @click="salvarEdicao">
              <span class="material-symbols-outlined">save</span> Salvar
            </button>
          </div>
        </div>
      </ion-content>
    </ion-modal>

    <!-- MODAL: ADD PRODUTO CADASTRADO -->
    <!--
      ╔══════════════════════════════════════════════════════════════╗
      ║  LEITURA DE CÓDIGO DE BARRAS PELA CÂMERA                    ║
      ║                                                              ║
      ║  NPM necessário:                                             ║
      ║    npm install @capacitor/barcode-scanner                    ║
      ║    npx cap sync                                              ║
      ║                                                              ║
      ║  Permissão android (AndroidManifest.xml):                    ║
      ║    <uses-permission android:name="android.permission.CAMERA"/>║
      ║                                                              ║
      ║  Permissão iOS (Info.plist):                                 ║
      ║    NSCameraUsageDescription → "Leitura de código de barras"  ║
      ╚══════════════════════════════════════════════════════════════╝
    -->
    <ion-modal :is-open="showAddProdutoModal" @did-dismiss="fecharModalAddProduto" class="bottom-sheet">
      <ion-content class="modal-content">
        <div class="modal-handle"></div>
        <div class="modal-box">
          <div class="modal-header">
            <span class="poppins-semibold">
              <template v-if="!modoSelecaoMultipla">Adicionar Produto</template>
              <template v-else-if="etapaSelecaoMultipla === 'selecionar'">Selecionar Produtos</template>
              <template v-else>Configurar Produtos</template>
            </span>
            <button class="modal-close" @click="fecharModalAddProduto">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <div class="modal-body">

            <template v-if="!(modoSelecaoMultipla && etapaSelecaoMultipla === 'configurar')">
              <p class="modal-hint poppins-regular">Busque por código de barras, descrição do produto ou leia pela câmera.</p>

              <!-- Busca + botão câmera -->
              <div class="search-camera-row">
                <div class="search-wrap search-wrap-flex">
                  <span class="material-symbols-outlined sb-icon">search</span>
                  <input
                    type="text"
                    ref="searchCatalogoInput"
                    v-model="searchCatalogo"
                    placeholder="Nome, cód. barras, descrição..."
                    class="sb-input poppins-regular"
                    :readonly="bloquearTecladoCatalogo"
                    @input="buscarCatalogo($event)"
                    @focus="onFocusSearchCatalogo"
                  />
                </div>
                <div v-if="searchCatalogo.length" @click="limparTudo" style="background-color: #EEE; border-radius: 50px; height: 30px; width: 30px; font-size: 12px; color: #333;
                  display: flex; justify-content: center; align-items: center; ">
                  <div>
                    X
                  </div>
                </div>
              </div>
            </template>

            <!-- ═══════════════════════════════════════
                 MODO SELEÇÃO ÚNICA (padrão)
            ═══════════════════════════════════════ -->
            <template v-if="!modoSelecaoMultipla">

              <!-- ── ETAPA 1: Lista de resultados (nenhum produto selecionado ainda) ── -->
              <template v-if="!addProduto.id_produto">

                <button
                  class="multi-select-btn poppins-semibold"
                  v-if="catalogoFiltrado.length > 0"
                  @click="ativarSelecaoMultipla"
                >
                  <span class="material-symbols-outlined">playlist_add_check</span>
                  Selecionar mais de um produto
                </button>

                <!-- Loading da busca -->
                <div v-if="loadingCatalogo" class="catalogo-loading poppins-regular">
                  <ion-spinner name="crescent" color="primary" style="width:18px;height:18px"></ion-spinner>
                  Buscando...
                </div>

                <!-- Resultados -->
                <div class="catalogo-list" v-else-if="catalogoFiltrado.length > 0">
                  <div
                    v-for="p in catalogoFiltrado"
                    :key="p.id_produto"
                    class="catalogo-item"
                    @click="selecionarProdutoCatalogo(p)"
                  >
                    <div class="catalogo-item-info">
                      <span class="prod-name poppins-semibold">{{ p.nome }}</span>
                      <span class="mono muted poppins-regular catalogo-barcode">{{ p.codigo_barra || 'Sem cód.' }}</span>
                      <!--
                        <span class="poppins-regular catalogo-fornecedor" v-if="p.nome_fornecedor">{{ p.nome_fornecedor }}</span>
                      -->
                    </div>
                    <div class="catalogo-item-right">
                      <span class="prod-price poppins-medium">R$ {{ formatVal(p.preco_custo) }}</span>
                      <span class="material-symbols-outlined catalogo-arrow">chevron_right</span>
                    </div>
                  </div>
                </div>

                <!-- Paginação -->
                <div class="catalogo-pagination" v-if="catalogoFiltrado.length > 0 && catalogoPages > 1">
                  <button
                    class="pag-btn poppins-medium"
                    :disabled="catalogoPage <= 1"
                    @click="mudarPaginaCatalogo(catalogoPage - 1)"
                  >
                    <span class="material-symbols-outlined">chevron_left</span>
                  </button>
                  <span class="pag-info poppins-regular">{{ catalogoPage }} / {{ catalogoPages }}</span>
                  <button
                    class="pag-btn poppins-medium"
                    :disabled="catalogoPage >= catalogoPages"
                    @click="mudarPaginaCatalogo(catalogoPage + 1)"
                  >
                    <span class="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>

                <!-- Sem resultados -->
                <div v-else-if="!loadingCatalogo && searchCatalogo.length >= 2 && catalogoFiltrado.length == 0" class="muted poppins-regular text-center" style="padding:16px 0">
                  Nenhum produto encontrado.
                </div>
              </template>

              <!-- ── ETAPA 2: Produto selecionado — detalhe + campos ── -->
              <div v-if="addProduto.id_produto" class="form-selected-prod">

                <!-- Card de detalhe do produto selecionado -->
                <div class="selected-prod-detail">
                  <div class="selected-prod-detail-top">
                    <span class="material-symbols-outlined spd-icon">inventory_2</span>
                    <div class="spd-info">
                      <span class="spd-name poppins-semibold">{{ addProduto.nome }}</span>
                      <span class="spd-barcode mono poppins-regular">{{ addProduto.codigo_barra || 'Sem código' }}</span>
                      <!--
                      <span class="spd-fornecedor poppins-regular muted" v-if="addProduto.nome_fornecedor">{{ addProduto.nome_fornecedor }}</span>
                      -->
                    </div>
                  </div>
                  <div class="spd-prices" v-if="addProduto.preco_custo != null || addProduto.preco_venda != null">
                    <div class="spd-price-item" v-if="addProduto.preco_custo != null">
                      <span class="spd-price-label poppins-regular">Custo</span>
                      <span class="spd-price-val poppins-semibold">R$ {{ formatVal(addProduto.preco_custo) }}</span>
                    </div>
                    <div class="spd-price-item" v-if="addProduto.margem != null">
                      <span class="spd-price-label poppins-regular">Margem</span>
                      <span :class="['spd-price-val poppins-semibold', addProduto.margem > 0 ? 'pos' : 'neg']">{{ addProduto.margem }}%</span>
                    </div>
                    <div class="spd-price-item" v-if="addProduto.preco_venda != null">
                      <span class="spd-price-label poppins-regular">Venda</span>
                      <span class="spd-price-val poppins-semibold">R$ {{ formatVal(addProduto.preco_venda) }}</span>
                    </div>
                    <div class="spd-price-item">
                      <span class="spd-price-label poppins-regular">Ult. Preço</span>
                      <span class="spd-price-val poppins-semibold">R$ {{ formatVal(addProduto.ultimo_preco) || "--" }}</span>
                    </div>
                    <div class="spd-price-item">
                      <span class="spd-price-label poppins-regular">Ult. Qtd</span>
                      <span class="spd-price-val poppins-semibold">{{ `${formatVal(addProduto.ultima_quantidade) } ${addProduto.tipo || ""}`  || "--" }}</span>
                    </div>
                  </div>
                  <!-- Botão de voltar para a lista -->
                  <button class="trocar-prod-btn poppins-medium" @click="voltarParaListaCatalogo">
                    <span class="material-symbols-outlined">arrow_back</span> Trocar produto
                  </button>
                </div>

                <!-- Campos de quantidade / tipo / composição -->
                <div class="form-group">
                  <label class="form-label poppins-medium">Quantidade *</label>
                  <input type="number" v-model.number="addProduto.quantidade" min="1" class="form-input poppins-regular" />
                </div>
                <div class="form-group">
                  <label class="form-label poppins-medium">Tipo</label>
                  <select v-model="addProduto.tipo" class="form-input poppins-regular">
                    <option value="">Selecionar...</option>
                    <option value="unidade">Unidade</option>
                    <option value="caixa">Caixa</option>
                    <option value="fardo">Fardo</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label poppins-medium">Qtd por embalagem</label>
                  <input type="number" v-model.number="addProduto.qtd_unitaria_composicao" min="1" class="form-input poppins-regular" />
                </div>
              </div>
            </template>

            <!-- ═══════════════════════════════════════
                 MODO SELEÇÃO MÚLTIPLA
            ═══════════════════════════════════════ -->
            <template v-else>

              <!-- ── ETAPA 1: seleção dos produtos ── -->
              <template v-if="etapaSelecaoMultipla === 'selecionar'">

                <div class="multi-header">
                  <span class="multi-header-count poppins-medium">
                    {{ produtosSelecionadosMultiplos.length }} produto(s) selecionado(s)
                  </span>
                  <button class="multi-exit-btn poppins-medium" @click="cancelarSelecaoMultipla">
                    <span class="material-symbols-outlined">close</span> Sair da seleção
                  </button>
                </div>

                <!-- Produtos já selecionados (scroll) -->
                <div class="multi-selected-scroll" v-if="produtosSelecionadosMultiplos.length > 0">
                  <div class="multi-chip" v-for="p in produtosSelecionadosMultiplos" :key="p.id_produto">
                    <span class="multi-chip-name poppins-medium">{{ p.nome }}</span>
                    <button class="multi-chip-remove" @click.stop="removerProdutoMultiplo(p)">
                      <span class="material-symbols-outlined">close</span>
                    </button>
                  </div>
                </div>

                <!-- Loading da busca -->
                <div v-if="loadingCatalogo" class="catalogo-loading poppins-regular">
                  <ion-spinner name="crescent" color="primary" style="width:18px;height:18px"></ion-spinner>
                  Buscando...
                </div>

                <!-- Resultados (com checkbox) -->
                <div class="catalogo-list" v-else-if="catalogoFiltrado.length > 0">
                  <div
                    v-for="p in catalogoFiltrado"
                    :key="p.id_produto"
                    :class="['catalogo-item', { 'catalogo-item-selected': isProdutoSelecionadoMultiplo(p) }]"
                    @click="toggleProdutoMultiplo(p)"
                  >
                    <span class="material-symbols-outlined catalogo-item-check">
                      {{ isProdutoSelecionadoMultiplo(p) ? 'check_box' : 'check_box_outline_blank' }}
                    </span>
                    <div class="catalogo-item-info">
                      <span class="prod-name poppins-semibold">{{ p.nome }}</span>
                      <span class="mono muted poppins-regular catalogo-barcode">{{ p.codigo_barra || 'Sem cód.' }}</span>
                    </div>
                    <div class="catalogo-item-right">
                      <span class="prod-price poppins-medium">R$ {{ formatVal(p.preco_custo) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Paginação -->
                <div class="catalogo-pagination" v-if="catalogoFiltrado.length > 0 && catalogoPages > 1">
                  <button
                    class="pag-btn poppins-medium"
                    :disabled="catalogoPage <= 1"
                    @click="mudarPaginaCatalogo(catalogoPage - 1)"
                  >
                    <span class="material-symbols-outlined">chevron_left</span>
                  </button>
                  <span class="pag-info poppins-regular">{{ catalogoPage }} / {{ catalogoPages }}</span>
                  <button
                    class="pag-btn poppins-medium"
                    :disabled="catalogoPage >= catalogoPages"
                    @click="mudarPaginaCatalogo(catalogoPage + 1)"
                  >
                    <span class="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>

                <!-- Sem resultados -->
                <div v-else-if="!loadingCatalogo && searchCatalogo.length >= 2" class="muted poppins-regular text-center" style="padding:16px 0">
                  Nenhum produto encontrado.
                </div>
              </template>

              <!-- ── ETAPA 2: configurar quantidade/tipo/composição para todos ── -->
              <template v-else>

                <button class="trocar-prod-btn poppins-medium" style="margin-bottom:12px;" @click="voltarSelecaoMultipla">
                  <span class="material-symbols-outlined">arrow_back</span> Voltar para seleção
                </button>

                <p class="modal-hint poppins-regular">
                  Defina a quantidade, o tipo e a composição que serão aplicados a todos os produtos selecionados.
                </p>

                <!-- Lista dos produtos selecionados (scroll) -->
                <div class="multi-selected-list">
                  <div class="multi-selected-item" v-for="p in produtosSelecionadosMultiplos" :key="p.id_produto">
                    <span class="material-symbols-outlined spd-icon" style="font-size:18px;">inventory_2</span>
                    <div class="multi-selected-item-info">
                      <span class="poppins-semibold">{{ p.nome }}</span>
                      <span class="mono muted poppins-regular catalogo-barcode">{{ p.codigo_barra || 'Sem cód.' }}</span>
                    </div>
                    <button class="multi-chip-remove" @click="removerProdutoMultiplo(p)">
                      <span class="material-symbols-outlined">close</span>
                    </button>
                  </div>
                </div>

                <!-- Campos compartilhados -->
                <div class="form-group">
                  <label class="form-label poppins-medium">Quantidade *</label>
                  <input type="number" v-model.number="multiploConfig.quantidade" min="1" class="form-input poppins-regular" />
                </div>
                <div class="form-group">
                  <label class="form-label poppins-medium">Tipo *</label>
                  <select v-model="multiploConfig.tipo" class="form-input poppins-regular">
                    <option value="">Selecionar...</option>
                    <option value="unidade">Unidade</option>
                    <option value="caixa">Caixa</option>
                    <option value="fardo">Fardo</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label poppins-medium">Qtd por embalagem</label>
                  <input type="number" v-model.number="multiploConfig.qtd_unitaria_composicao" min="1" class="form-input poppins-regular" />
                </div>
              </template>
            </template>

          </div>
          <div class="modal-footer">
            <template v-if="!modoSelecaoMultipla">
              <button class="action-btn btn-outline poppins-medium full-w" @click="fecharModalAddProduto">Cancelar</button>
              <button
                class="action-btn btn-primary poppins-medium full-w"
                :disabled="!addProduto.id_produto || !addProduto.quantidade || !addProduto.tipo || loadingAdd"
                @click="adicionarProduto()"
              >
                <span class="material-symbols-outlined">add</span> Adicionar
              </button>
            </template>
            <template v-else-if="etapaSelecaoMultipla === 'selecionar'">
              <button class="action-btn btn-outline poppins-medium full-w" @click="cancelarSelecaoMultipla">Cancelar</button>
              <button
                class="action-btn btn-primary poppins-medium full-w"
                :disabled="produtosSelecionadosMultiplos.length === 0"
                @click="avancarSelecaoMultipla"
              >
                <span class="material-symbols-outlined">arrow_forward</span>
                Avançar ({{ produtosSelecionadosMultiplos.length }})
              </button>
            </template>
            <template v-else>
              <button class="action-btn btn-outline poppins-medium full-w" @click="voltarSelecaoMultipla">Voltar</button>
              <button
                class="action-btn btn-primary poppins-medium full-w"
                :disabled="!multiploConfig.quantidade || !multiploConfig.tipo || produtosSelecionadosMultiplos.length === 0 || loadingAdd"
                @click="adicionarProduto()"
              >
                <span class="material-symbols-outlined">add</span>
                Adicionar todos ({{ produtosSelecionadosMultiplos.length }})
              </button>
            </template>
          </div>
        </div>
      </ion-content>
    </ion-modal>

    <!-- MODAL: ADD PRODUTO NÃO CADASTRADO -->
    <ion-modal :is-open="showAddProdutoModalInexistente" @did-dismiss="showAddProdutoModalInexistente = false" class="bottom-sheet">
      <ion-content class="modal-content">
        <div class="modal-handle"></div>
        <div class="modal-box">
          <div class="modal-header">
            <span class="poppins-semibold">Produto Não Cadastrado</span>
            <button class="modal-close" @click="showAddProdutoModalInexistente = false">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <div class="modal-body">
            <p class="modal-hint poppins-regular">
              Use para produtos não cadastrados no sistema, como lançamentos ou novos itens ainda não identificados.
            </p>
            <div class="form-group">
              <label class="form-label poppins-medium">Nome *</label>
              <input type="text" v-model="addProdutoInexistente.nome" class="form-input poppins-regular" placeholder="Nome do produto" />
            </div>
            <div class="form-group">
              <label class="form-label poppins-medium">Quantidade *</label>
              <input type="number" v-model.number="addProdutoInexistente.quantidade" min="1" class="form-input poppins-regular" />
            </div>
          </div>
          <div class="modal-footer">
            <button class="action-btn btn-outline poppins-medium full-w" @click="showAddProdutoModalInexistente = false">Cancelar</button>
            <button
              class="action-btn btn-primary poppins-medium full-w"
              :disabled="!addProdutoInexistente.nome || !addProdutoInexistente.quantidade || loadingAdd"
              @click="adicionarProdutoInexistente"
            >
              <span class="material-symbols-outlined">add</span> Adicionar
            </button>
          </div>
        </div>
      </ion-content>
    </ion-modal>

    <!-- MODAL: PERÍODO -->
    <ion-modal :is-open="showPeriodoModal" @did-dismiss="showPeriodoModal = false" class="bottom-sheet">
      <ion-content class="modal-content">
        <div class="modal-handle"></div>
        <div class="modal-box">
          <div class="modal-header">
            <span class="poppins-semibold">Ajustar Período</span>
            <button class="modal-close" @click="showPeriodoModal = false">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label poppins-medium">Data Início</label>
              <input type="date" v-model="periodoEdit.inicio" class="form-input poppins-regular" />
            </div>
            <div class="form-group">
              <label class="form-label poppins-medium">Data Final</label>
              <input type="date" v-model="periodoEdit.final" class="form-input poppins-regular" />
            </div>
          </div>
          <div class="modal-footer">
            <button class="action-btn btn-outline poppins-medium full-w" @click="showPeriodoModal = false">Cancelar</button>
            <button class="action-btn btn-primary poppins-medium full-w" @click="salvarPeriodo">
              <span class="material-symbols-outlined">save</span> Salvar
            </button>
          </div>
        </div>
      </ion-content>
    </ion-modal>

    <!-- MODAL: FATURAMENTO EXTRA -->
    <ion-modal :is-open="showFatExtra" @did-dismiss="showFatExtra = false" class="bottom-sheet">
      <ion-content class="modal-content">
        <div class="modal-handle"></div>
        <div class="modal-box">
          <div class="modal-header">
            <span class="poppins-semibold">Produto Extra para Faturar</span>
            <button class="modal-close" @click="showFatExtra = false">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <div class="modal-body">
            <p class="modal-hint poppins-regular">Selecione o vendedor e configure o produto adicional.</p>
            <div class="form-group">
              <label class="form-label poppins-medium">Vendedor</label>
              <select v-model="fatExtra.id_vendedor" class="form-input poppins-regular">
                <option value="" disabled>Selecionar vendedor...</option>
                <option v-for="v in vendedores" :key="v.id_vendedor" :value="v.id_vendedor">{{ v.nome }}</option>
              </select>
            </div>
            <div class="search-camera-row">
              <div class="search-wrap search-wrap-flex">
                <span class="material-symbols-outlined sb-icon">search</span>
                <input
                  type="text"
                  v-model="fatExtra.searchProd"
                  placeholder="Buscar produto..."
                  class="sb-input poppins-regular"
                  @input="buscarCatalogoExtra"
                />
              </div>
              <!-- Câmera também disponível no modal de faturamento extra -->
              <button class="camera-btn" @click="escanearCodigoBarrasFatExtra" title="Ler código de barras">
                <span class="material-symbols-outlined">barcode_scanner</span>
              </button>
            </div>
            <div class="catalogo-list" v-if="catalogoExtra.length > 0" style="max-height:130px">
              <div
                v-for="p in catalogoExtra"
                :key="p.id_produto"
                :class="['catalogo-item', { selected: fatExtra.id_produto === p.id_produto }]"
                @click="fatExtra.id_produto = p.id_produto; fatExtra.nome = p.nome"
              >
                <span class="prod-name poppins-semibold">{{ p.nome }}</span>
                <span class="mono muted poppins-regular"> · {{ p.codigo_barra }}</span>
              </div>
            </div>
            <div v-if="fatExtra.id_produto">
              <div class="form-group">
                <label class="form-label poppins-medium">Quantidade</label>
                <input type="number" v-model.number="fatExtra.quantidade" min="1" class="form-input poppins-regular" />
              </div>
              <div class="form-group">
                <label class="form-label poppins-medium">Preço Unitário</label>
                <input type="number" v-model.number="fatExtra.preco" step="0.01" min="0" class="form-input poppins-regular" />
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="action-btn btn-outline poppins-medium full-w" @click="showFatExtra = false">Cancelar</button>
            <button
              class="action-btn btn-primary poppins-medium full-w"
              :disabled="!fatExtra.id_vendedor || !fatExtra.id_produto"
              @click="confirmarFatExtra"
            >
              <span class="material-symbols-outlined">check</span> Confirmar
            </button>
          </div>
        </div>
      </ion-content>
    </ion-modal>

    <!-- MODAL: VER OFERTAS DO PRODUTO -->
    <ion-modal :is-open="showOfertasModal" @did-dismiss="fecharModalOfertas" class="bottom-sheet ofertas-modal-sheet">
      <ion-content class="modal-content">
        <div class="modal-handle"></div>
        <div class="modal-box">
          <div class="modal-header">
            <div class="om-header-info">
              <span class="poppins-semibold om-title">Ofertas</span>
              <span class="om-prod-name poppins-regular" v-if="ofertasModalItem">{{ ofertasModalItem.nome }}</span>
            </div>
            <button class="modal-close" @click="fecharModalOfertas">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <!-- Busca + filtros -->
          <div class="om-filters">
            <div class="search-wrap om-search">
              <span class="material-symbols-outlined sb-icon">search</span>
              <input
                type="text"
                v-model="ofertasModalSearch"
                placeholder="Buscar vendedor..."
                class="sb-input poppins-regular"
                @input="ofertasModalPage = 1"
              />
              <button v-if="ofertasModalSearch" class="sb-clear" @click="ofertasModalSearch = ''; ofertasModalPage = 1">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            <div class="om-sort-row">
              <button
                :class="['om-sort-btn poppins-medium', { active: ofertasModalOrdem === 'asc' }]"
                @click="ofertasModalOrdem = 'asc'; ofertasModalPage = 1"
              >
                <span class="material-symbols-outlined">arrow_upward</span> Menor
              </button>
              <button
                :class="['om-sort-btn poppins-medium', { active: ofertasModalOrdem === 'desc' }]"
                @click="ofertasModalOrdem = 'desc'; ofertasModalPage = 1"
              >
                <span class="material-symbols-outlined">arrow_downward</span> Maior
              </button>
              <button
                :class="['om-sort-btn poppins-medium', { active: ofertasModalSoEquiv }]"
                @click="ofertasModalSoEquiv = !ofertasModalSoEquiv; ofertasModalPage = 1"
              >
                <span class="material-symbols-outlined">swap_horiz</span> Equiv.
              </button>
            </div>
          </div>

          <!-- Lista paginada -->
          <div class="om-body">
            <div v-if="ofertasModalPaginadas.length === 0" class="om-empty poppins-regular">
              <span class="material-symbols-outlined">inbox</span>
              Nenhuma oferta encontrada.
            </div>
            <div v-else class="om-ofertas-list">
              <div
                v-for="oferta in ofertasModalPaginadas"
                :key="oferta.id_oferta"
                :class="['vendedor-oferta', { selected: oferta.opcao_1 || oferta.opcao_2 }]"
              >
                <div class="vo-vendor poppins-medium">
                  <span class="material-symbols-outlined vo-icon">person</span>
                  <b>{{ oferta.nome }}</b>
                  <span class="muted poppins-regular vo-email">{{ oferta.email }}</span>
                </div>

                <!-- Produto solicitado (1ª opção) -->
                <div v-if="oferta.primeiro_quantidade != null">
                  <div :class="['opcao-mini', { chosen: oferta.opcao_1 }]">
                    <div class="opcao-row">
                      <span class="poppins-regular opcao-item"><b>Qtd:</b> {{ oferta.primeiro_quantidade }}</span>
                      <span class="poppins-regular opcao-item"><b>Preço:</b> R$ {{ formatVal(oferta.primeiro_preco) }}</span>
                      <span class="poppins-regular opcao-item"><b>Tipo:</b> {{ oferta.primeiro_tipo }}</span>
                      <span class="poppins-regular opcao-item" v-if="oferta.primeiro_unid_composicao"><b>Un/emb:</b> {{ oferta.primeiro_unid_composicao }}</span>
                    </div>
                    <span v-if="oferta.opcao_1" class="chosen-badge poppins-medium">
                      <span class="material-symbols-outlined">check_circle</span> Selecionado
                    </span>
                  </div>
                </div>

                <!-- Produto equivalente (2ª opção) — só aparece se existir -->
                <div v-if="oferta.segundo_quantidade != null">
                  <p class="indicador-oferta poppins-medium">Produto equivalente sugerido:</p>
                  <div :class="['opcao-mini', 'eq', { chosen: oferta.opcao_2 }]">
                    <span class="opcao-label eq poppins-semibold">Equivalente</span>
                    <div class="opcao-row">
                      <span class="poppins-regular opcao-item" v-if="oferta.codigo_barra"><b>Cód:</b> {{ oferta.codigo_barra }}</span>
                      <span class="poppins-regular opcao-item"><b>Qtd:</b> {{ oferta.segundo_quantidade }}</span>
                      <span class="poppins-regular opcao-item"><b>Preço:</b> R$ {{ formatVal(oferta.segundo_preco) }}</span>
                      <span class="poppins-regular opcao-item"><b>Tipo:</b> {{ oferta.segundo_tipo }}</span>
                      <span class="poppins-regular opcao-item" v-if="oferta.segundo_unid_composicao"><b>Un/emb:</b> {{ oferta.segundo_unid_composicao }}</span>
                    </div>
                    <span v-if="oferta.opcao_2" class="chosen-badge poppins-medium">
                      <span class="material-symbols-outlined">check_circle</span> Selecionado
                    </span>
                  </div>
                </div>

                <!-- Obs -->
                <p class="vo-obs poppins-regular" v-if="oferta.mensagem">
                  <span class="material-symbols-outlined obs-icon">comment</span> {{ oferta.mensagem }}
                </p>

                <!-- Ações de seleção (só na finalizada) -->
                <div class="vo-actions" v-if="cabecalho && cabecalho.status_cotacao === 'finalizada' && ofertasModalItem && ofertasModalItem.status_fechamento !== 'concluido'">
                  <template v-if="oferta.primeiro_quantidade != null">
                    <button v-if="!oferta.opcao_1" class="sel-btn poppins-medium" @click="selecionarOfertaModal(ofertasModalItem, oferta, 1)">
                      <span class="material-symbols-outlined">check</span> Selecionar
                    </button>
                    <button v-else class="desel-btn poppins-medium" @click="removerOfertaModal(ofertasModalItem, oferta, 1)">
                      <span class="material-symbols-outlined">close</span> Remover
                    </button>
                  </template>
                  <template v-if="oferta.segundo_quantidade != null">
                    <button v-if="!oferta.opcao_2" class="sel-btn eq poppins-medium" @click="selecionarOfertaModal(ofertasModalItem, oferta, 2)">
                      <span class="material-symbols-outlined">check</span> Equiv.
                    </button>
                    <button v-else class="desel-btn poppins-medium" @click="removerOfertaModal(ofertasModalItem, oferta, 2)">
                      <span class="material-symbols-outlined">close</span> Remover equiv.
                    </button>
                  </template>
                </div>
              </div>
            </div>

            <!-- Paginação -->
            <div class="om-pagination" v-if="ofertasModalTotalPages > 1">
              <button
                class="pag-btn"
                :disabled="ofertasModalPage <= 1"
                @click="ofertasModalPage--"
              >
                <span class="material-symbols-outlined">chevron_left</span>
              </button>
              <span class="pag-info poppins-regular">{{ ofertasModalPage }} / {{ ofertasModalTotalPages }}</span>
              <button
                class="pag-btn"
                :disabled="ofertasModalPage >= ofertasModalTotalPages"
                @click="ofertasModalPage++"
              >
                <span class="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </ion-content>
    </ion-modal>

    <!-- ══ SCANNER OVERLAY (html5-qrcode) ══
         O div #html5-qrcode-reader é onde a câmera é renderizada pela lib.
         O overlay envolve o visor com a UI customizada.
    -->
    <div class="scanner-overlay" v-if="scannerAtivo">
      <div class="scanner-viewfinder">
        <!-- Contêiner obrigatório para o html5-qrcode renderizar o vídeo -->
        <div id="html5-qrcode-reader" class="qr-reader-container"></div>
        <!-- Cantos decorativos sobre o vídeo -->
        <div class="scanner-corners">
          <div class="scanner-corner tl"></div>
          <div class="scanner-corner tr"></div>
          <div class="scanner-corner bl"></div>
          <div class="scanner-corner br"></div>
          <div class="scanner-line"></div>
        </div>
      </div>
      <p class="scanner-hint poppins-regular">Aponte para o código de barras</p>
      <button class="scanner-cancel poppins-medium" @click="cancelarScanner">
        <span class="material-symbols-outlined">close</span> Cancelar
      </button>
    </div>

    <ModalDetalhesProduto
      v-model="showDetalhesProduto"
      :produto="produtoDetalhes"
    />

    <!-- ══ TOASTS ══ -->
    
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import {
  IonPage,
  IonContent,
  IonSpinner,
  IonModal,
  alertController,
} from '@ionic/vue'
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import exibeErro from '@/utils/ExibeErro'
import RefresherIonic from '@/components/refresherIonic.vue'
import { Camera, CameraPermissionState } from '@capacitor/camera'

/*
  ╔══════════════════════════════════════════════════════════════════╗
  ║  html5-qrcode — funciona em web, Android e iOS (via WebView)    ║
  ║                                                                  ║
  ║  npm install html5-qrcode                                        ║
  ╚══════════════════════════════════════════════════════════════════╝
*/
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { mapState } from 'pinia'
import ModalDetalhesProduto from '@/components/ModalDetalhesProduto.vue'

export default defineComponent({
  name: 'ConsoleCotacaoMobile',

  components: {
    IonPage,
    IonContent,
    IonSpinner,
    IonModal,
    RefresherIonic,
    ModalDetalhesProduto
  },

  props: {
    id_cotacao: Number,
  },

  data() {
    return {
      activeTab: 'produtos' as string,
      auth: null as any,
      idCotacaoLocal: null as number | null,
      nomeCotacao: null as string | null,

      // Dados principais
      cabecalho: null as any,
      itens: [] as any[],
      ofertas: [] as any[],
      vendedores: [] as any[],
      sugestoes: [] as any[],

      showDetalhesProduto: false,
      produtoDetalhes: null,

      // Loading flags
      loadingProdutos: false,
      loadingOfertas: false,
      loadingVendedores: false,
      loadingSugestoes: false,
      loadingAcao: false,
      loadingButtonConcluir: false,
      loadingEdit: false,
      loadingAdd: false,
      loadingAutoSelect: false,

      // Search
      searchProdutos: '',
      searchOfertas: '',

      // Modais
      showEditModal: false,
      showAddProdutoModal: false,
      showAddProdutoModalInexistente: false,
      showPeriodoModal: false,
      showFatExtra: false,

      // Edit produto
      editTarget: null as any,

      // Add produto cadastrado
      searchCatalogo: '',
      catalogoFiltrado: [] as any[],
      loadingCatalogo: false,
      catalogoPage: 1,
      catalogoPages: 1,
      // true quando o preenchimento de searchCatalogo vem da leitura rápida (scanner),
      // mantém o input em modo readonly para o teclado virtual não abrir sozinho
      bloquearTecladoCatalogo: false,
      addProduto: {
        id_produto: null as number | null,
        nome: '',
        codigo_barra: '',
        nome_fornecedor: '',
        preco_custo: null as number | null,
        preco_venda: null as number | null,
        margem: null as number | null,
        quantidade: null as number | null,
        qtd_unitaria_composicao: null as number | null,
        ultimo_preco: null as number | null,
        ultima_quantidade: null as number | null,
        tipo: null as string | null,
      },

      // Add múltiplos produtos simultaneamente
      modoSelecaoMultipla: false,
      etapaSelecaoMultipla: 'selecionar' as 'selecionar' | 'configurar',
      produtosSelecionadosMultiplos: [] as any[],
      multiploConfig: {
        quantidade: null as number | null,
        tipo: '' as string,
        qtd_unitaria_composicao: null as number | null,
      },

      // Add produto não cadastrado
      addProdutoInexistente: { nome: '', quantidade: null as number | null },

      // Faturamento extra
      fatExtra: {
        id_vendedor: '',
        id_produto: null as number | null,
        nome: '',
        quantidade: null as number | null,
        tipo: null as string | null,
        preco: null as number | null,
        searchProd: '',
      },
      catalogoExtra: [] as any[],

      // Período
      periodoEdit: { inicio: '', final: '' },

      // Sugestões
      sugestoesSelecionadas: [] as number[],

      // Toasts
      toasts: [] as any[],
      toastId: 0,

      // Modal de ofertas do produto
      showOfertasModal: false,
      ofertasModalItem: null as any,
      ofertasModalSearch: '',
      ofertasModalOrdem: 'asc' as 'asc' | 'desc',
      ofertasModalSoEquiv: false,
      ofertasModalPage: 1,
      OFERTAS_POR_PAGINA: 10,

      totalOfertas: 0,

      barcodeBuffer: '',
      barcodeTimeout: null,
      barcodeLastKeyTime: 0,
      barcodeInterval: null,

      // Timers debounce
      timer: null as any,
      timerExtra: null as any,

      // Scanner
      scannerAtivo: false,
      scannerContexto: '' as string, // 'catalogo' | 'fatExtra'

      // Instância html5-qrcode
      html5QrcodeInstance: null as any,

      // Permissão de câmera
      permissaoCamera: 'prompt' as CameraPermissionState,
      verificandoPermissao: false,
    }
  },

  computed: {
    ...mapState(useAuthStore, ['user', 'menuPermitido']),
    tabs(): any[] {
      return [
        { key: 'produtos',   label: 'Produtos',   icon: 'inventory_2',  badge: this.itens.length || null,    disabled: false },
        { key: 'ofertas',    label: 'Ofertas',    icon: 'local_offer',  badge: this.totalOfertas || null,         disabled: false },
        { key: 'vendedores', label: 'Vendedores', icon: 'group',        badge: null,                         disabled: false },
        { key: 'sugestao',   label: 'Sugestão',   icon: 'lightbulb',    badge: null,                         disabled: true  },
      ]
    },

    produtosFiltrados(): any[] {
      const t = this.searchProdutos.toLowerCase()
      if (!t) return this.itens
      return this.itens.filter(i =>
        (i.nome?.toLowerCase().includes(t)) || (i.codigo_barra?.toLowerCase().includes(t))
      )
    },

    itensFiltradosOfertas(): any[] {
      const t = this.searchOfertas.toLowerCase()
      return this.ofertas.filter(i => {
        if (!t) return true
        return (i.nome?.toLowerCase().includes(t)) ||
          i.ofertas?.some((o: any) => o.nome?.toLowerCase().includes(t))
      })
    },

    ofertasModalFiltradas(): any[] {
      if (!this.ofertasModalItem?.ofertas) return []
      let lista = [...this.ofertasModalItem.ofertas]

      // Filtro de busca por vendedor
      const t = this.ofertasModalSearch.toLowerCase()
      if (t) {
        lista = lista.filter((o: any) =>
          o.nome?.toLowerCase().includes(t) || o.email?.toLowerCase().includes(t)
        )
      }

      // Filtro somente equivalentes
      if (this.ofertasModalSoEquiv) {
        lista = lista.filter((o: any) => o.segundo_quantidade != null)
      }

      // Separar principais e equivalentes (sem principal)
      const principais = lista.filter((o: any) => o.primeiro_quantidade != null)
      const soEquiv    = lista.filter((o: any) => o.primeiro_quantidade == null && o.segundo_quantidade != null)

      // Ordenar principais por preço
      const sortFn = (a: any, b: any) => {
        const pa = Number(a.primeiro_preco ?? a.segundo_preco ?? Infinity)
        const pb = Number(b.primeiro_preco ?? b.segundo_preco ?? Infinity)
        return this.ofertasModalOrdem === 'asc' ? pa - pb : pb - pa
      }
      principais.sort(sortFn)
      soEquiv.sort(sortFn)

      return [...principais, ...soEquiv]
    },

    ofertasModalTotalPages(): number {
      return Math.max(1, Math.ceil(this.ofertasModalFiltradas.length / this.OFERTAS_POR_PAGINA))
    },

    ofertasModalPaginadas(): any[] {
      const ini = (this.ofertasModalPage - 1) * this.OFERTAS_POR_PAGINA
      return this.ofertasModalFiltradas.slice(ini, ini + this.OFERTAS_POR_PAGINA)
    },

    existePendente(): boolean {
      return this.itens.some(i => i.status_fechamento === 'pendente')
    },

    podeEditarProduto(): boolean {
      return this.cabecalho && (this.cabecalho.status_cotacao === 'fechada')
    },
  },

  watch: {
    activeTab(v: string) {
      if (v === 'ofertas'    && this.ofertas.length === 0)    this.carregarOfertas()
      if (v === 'vendedores' && this.vendedores.length === 0) this.carregarVendedores()
      if (v === 'sugestao'   && this.sugestoes.length === 0)  this.carregarSugestoes()
    },
  },

  methods: {
    // ─── UTILS ───────────────────────────────────────────────────
    formatarData(v: any): string {
      if (!v) return '—'
      return new Date(Number(v)).toLocaleDateString('pt-BR')
    },
    formatVal(v: any): string {
      if (v == null) return '—'
      return Number(v).toFixed(2)
    },
    capitalize(s: string): string {
      if (!s) return ''
      return s.charAt(0).toUpperCase() + s.slice(1)
    },
    initials(nome: string): string {
      return (nome || '').split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()
    },
    statusLabel(s: string, statusFechamento?: string | null): string {

      if (s === 'fechada') return 'Indisponível'
      if (s === 'aberta')  return 'Aberta'
      if (s === 'finalizada') {
        return !this.existePendente ? 'Finalizada' : 'Fechada'
      }
      const map: Record<string, string> = {
        rascunho: 'Rascunho',
        concluida: 'Concluída',
      }
      return map[s] || s
    },
    toast(msg: string, type = 'success') {
      const id = ++this.toastId
      this.toasts.push({ id, msg, type })
      setTimeout(() => { this.toasts = this.toasts.filter((t: any) => t.id !== id) }, 3500)
    },

    // ─── CARREGAMENTO ────────────────────────────────────────────
    async carregarProdutos() {
      try {
        this.loadingProdutos = true
        const res = await api.get(`/mvpu/cotacao/historicoCotacao/${this.auth.loja.id_loja}/${this.idCotacaoLocal}`)
        const d = res.data.data
        if (d) {
          if (Array.isArray(d)) {
            this.itens = d
          } else {
            this.cabecalho = d.cabecalho_cotacao || this.cabecalho
            this.itens = d.conteudo_cotacao || d
          }
        }
      } catch (e) {
        exibeErro(e, this.$toast)
      } finally {
        this.loadingProdutos = false
      }
    },

    async carregarOfertas() {
      try {
        this.loadingOfertas = true
        const res = await api.get(`/mvpu/cotacao/historicoCotacao/${this.auth.loja.id_loja}/${this.idCotacaoLocal}`)
        const d = res.data.data
        if (d) {
          this.cabecalho = d.cabecalho_cotacao || this.cabecalho
          this.ofertas = d.conteudo_cotacao || []

          if(this.ofertas.length){
            for(const ofertaProd of this.ofertas){
              this.totalOfertas += ofertaProd.ofertas.length
            }
          }

          

        }
      } catch (e) {
        exibeErro(e, this.$toast)
      } finally {
        this.loadingOfertas = false
      }
    },

    async carregarVendedores() {
      try {
        this.loadingVendedores = true
        const res = await api.get(`/mvpu/usuario/consultarVendedores/${this.auth.loja.id_loja}`)
        this.vendedores = res.data.data || []
      } catch (e) {
        exibeErro(e, this.$toast)
      } finally {
        this.loadingVendedores = false
      }
    },

    async carregarSugestoes() {
      try {
        this.loadingSugestoes = true
        await new Promise(r => setTimeout(r, 600))
        this.sugestoes = []
      } catch (e) {
        exibeErro(e, this.$toast)
      } finally {
        this.loadingSugestoes = false
      }
    },

    /**
     * Detecta se um InputEvent representa uma inserção "em lote" (ex: colar,
     * ou leitor de código de barras que digita via input.value de uma vez)
     * contendo uma sequência de pelo menos 8 dígitos numéricos.
     * Se detectado, substitui TODO o conteúdo anterior do input pela nova
     * sequência de dígitos (descarta o que estava digitado antes).
     * Retorna true se a substituição foi aplicada (e portanto o fluxo normal
     * de busca já foi disparado e deve ser interrompido).
     */
    aplicarSubstituicaoCodigoBarras(event: any): boolean {
      if (!event) return false

      const inputType: string = event.inputType || ''
      const dataInserida: string = event.data || ''

      // Só nos interessa inserção em lote: colar (insertFromPaste) ou
      // inserção de texto direto via valor (insertText com múltiplos chars,
      // típico de leitores de código de barras que escrevem tudo de uma vez)
      const ehInsercaoEmLote =
        inputType === 'insertFromPaste' ||
        inputType === 'insertFromDrop' ||
        (inputType === 'insertText' && dataInserida && dataInserida.length >= 8)

      if (!ehInsercaoEmLote) return false

      // Extrai sequências de dígitos do trecho inserido (prioridade) ou,
      // se o evento não informar `data` (ex: alguns casos de paste), do
      // valor atual do input inteiro.
      const origem = dataInserida && dataInserida.length >= 8 ? dataInserida : (event.target?.value || '')
      const sequencias = origem.match(/\d{8,}/g)

      if (!sequencias || sequencias.length === 0) return false

      // Usa a maior sequência numérica encontrada como o novo código.
      const novoCodigo = sequencias.reduce((a: string, b: string) => (b.length > a.length ? b : a), sequencias[0])

      this.searchCatalogo = novoCodigo
      return true
    },

    async buscarCatalogo(event?: any) {
      // Se vier uma nova sequência de 8+ dígitos de uma só vez (colar ou
      // digitação em lote de leitor de código de barras), substitui o valor
      // anterior do campo pelos novos dígitos antes de buscar.
      if (this.aplicarSubstituicaoCodigoBarras(event)) {
        await this.buscarCatalogoImediato(this.searchCatalogo)
        return
      }

      if (!this.searchCatalogo || this.searchCatalogo.length < 2) {
        this.catalogoFiltrado = []
        this.catalogoPage = 1
        this.catalogoPages = 1
        return
      }
      clearTimeout(this.timer)
      this.timer = setTimeout(async () => {
        await this._fetchCatalogo(this.searchCatalogo, 1)
      }, 400)
    },

    async mudarPaginaCatalogo(page: number) {
      await this._fetchCatalogo(this.searchCatalogo, page)
    },

    async _fetchCatalogo(search: string, page: number) {
      try {
        this.loadingCatalogo = true
        const res = await api.get(
          `/mvpu/produto/consultarProdutos/${this.auth.loja.id_loja}`,
          { params: { page, limit: 10, search, id_usuario: this.auth.user?.id_usuario } }
        )
        this.catalogoFiltrado = res.data.data || []
        this.catalogoPage     = res.data.page  || 1
        this.catalogoPages    = res.data.pages || 1
      } catch (e) {
        this.catalogoFiltrado = []
      } finally {
        this.loadingCatalogo = false
      }
    },

    abrirDetalhes(produto) {
      this.produtoDetalhes = produto
      this.showDetalhesProduto = true
    },

    async buscarCatalogoExtra() {
      if (!this.fatExtra.searchProd || this.fatExtra.searchProd.length < 2) {
        this.catalogoExtra = []
        return
      }
      clearTimeout(this.timerExtra)
      this.timerExtra = setTimeout(async () => {
        try {
          const res = await api.get(
            `/mvpu/produto/consultarProdutos/${this.auth.loja.id_loja}`,
            { params: { page: 1, limit: 10, search: this.fatExtra.searchProd, id_usuario: this.auth.user?.id_usuario } }
          )
          this.catalogoExtra = res.data.data || []
        } catch (e) {
          this.catalogoExtra = []
        }
      }, 400)
    },

    // ─── PERMISSÃO DE CÂMERA ─────────────────────────────────────

    /**
     * Verifica o estado atual da permissão de câmera via @capacitor/camera.
     * Atualiza this.permissaoCamera com o resultado.
     * Retorna true se a permissão estiver concedida, false caso contrário.
     */
    async verificarPermissaoCamera(): Promise<boolean> {
      try {
        const status = await Camera.checkPermissions()
        // "camera" é a chave retornada pelo Capacitor Camera plugin
        this.permissaoCamera = (status as any).camera ?? status
        return this.permissaoCamera === 'granted'
      } catch (e) {
        // Em ambiente web puro (fora do Capacitor), a API pode não existir —
        // retornamos true para deixar o html5-qrcode tratar via MediaDevices API
        
        return true
      }
    },

    /**
     * Solicita permissão de câmera ao usuário via @capacitor/camera.
     * Retorna true se a permissão foi concedida após a solicitação.
     *
     * Fluxo:
     *   'granted'  → câmera liberada, prossegue.
     *   'prompt'   → abre diálogo nativo de permissão.
     *   'denied'   → permissão negada definitivamente; orienta o usuário a
     *                abrir as configurações do dispositivo para habilitá-la.
     */
    async solicitarPermissaoCamera(): Promise<boolean> {
      try {
        this.verificandoPermissao = true

        // 1. Verifica estado atual antes de pedir
        const jaPermitido = await this.verificarPermissaoCamera()
        if (jaPermitido) return true

        // 2. Permissão negada definitivamente — não é possível pedir novamente
        if (this.permissaoCamera === 'denied') {
          this.toast(
            'Câmera bloqueada. Abra as configurações do dispositivo e habilite a permissão para este app.',
            'error'
          )
          return false
        }

        // 3. Estado 'prompt' ou 'prompt-with-rationale' — solicita ao usuário
        const resultado = await Camera.requestPermissions({ permissions: ['camera'] })
        this.permissaoCamera = (resultado as any).camera ?? resultado

        if (this.permissaoCamera === 'granted') {
          return true
        }

        // Usuário recusou
        this.toast(
          'Permissão de câmera negada. Para usar o leitor de código de barras, autorize o acesso à câmera.',
          'error'
        )
        return false

      } catch (e) {
        // Em ambiente web puro (sem Capacitor), a API não existe —
        // deixamos o html5-qrcode chamar getUserMedia e tratar o prompt nativo do browser
        
        return true
      } finally {
        this.verificandoPermissao = false
      }
    },

    /**
     * Verifica silenciosamente a permissão ao entrar na tela.
     * Não exibe diálogo — apenas atualiza this.permissaoCamera para refletir
     * o estado atual e dar contexto ao ícone/botão se necessário no futuro.
     */
    async verificarPermissaoCameraAoEntrar() {
      await this.verificarPermissaoCamera()
    },

    // ─── SCANNER DE CÓDIGO DE BARRAS (html5-qrcode) ──────────────
    /**
     * Inicializa a instância Html5Qrcode dentro do elemento #html5-qrcode-reader.
     * Suporta todos os formatos de código de barras 1D e 2D.
     */
    _criarInstanciaScanner(): any {
      const formatos = [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.CODE_128,
      ]
      return new Html5Qrcode('html5-qrcode-reader', {
        formatsToSupport: formatos,
        verbose: true,
      })
    },

    

    /**
     * Inicia o scanner html5-qrcode usando a câmera traseira (environment).
     * Solicita permissão de câmera antes de iniciar — aborta se negada.
     * Chama o callback ao detectar um código.
     */
    async _iniciarScanner(onSucesso: (codigo: string) => void) {
      try {
        // ── Guarda de permissão ──────────────────────────────────
        // Solicita (ou confirma) permissão antes de tentar abrir a câmera.
        // Em Android/iOS nativo usa @capacitor/camera; em web usa MediaDevices.
        const permitido = await this.solicitarPermissaoCamera()
        if (!permitido) {
          // Permissão negada: fecha o overlay e aborta sem lançar erro
          this.scannerAtivo = false
          return
        }
        // ────────────────────────────────────────────────────────

        // Para qualquer scan anterior antes de iniciar um novo
        await this._pararScanner()

        this.html5QrcodeInstance = this._criarInstanciaScanner()

        const config = {
          fps: 10,

        }

        await this.html5QrcodeInstance.start(
          { facingMode: 'environment' }, // câmera traseira
          config,
          (decodedText: string) => {
            this.showAddProdutoModal = true
            onSucesso(decodedText)
          },
          // Erros de frame são ignorados (não logar cada frame sem leitura)
          undefined
        )
      } catch (e: any) {
        this.scannerAtivo = false
        // Usuário negou permissão ou câmera indisponível
        const msg = e?.message || String(e)
        if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('notallowed')) {
          this.toast('Permissão de câmera negada. Habilite nas configurações.', 'error')
        } else {
          exibeErro(e, this.$toast)
        }
      }
    },

    /**
     * Para e limpa o scanner html5-qrcode de forma segura.
     */
    async _pararScanner() {
      if (this.html5QrcodeInstance) {
        try {
          const state = this.html5QrcodeInstance.getState()
          // Estado 2 = SCANNING, estado 3 = PAUSED
          if (state === 2 || state === 3) {
            await this.html5QrcodeInstance.stop()
          }
          await this.html5QrcodeInstance.clear()
        } catch (_) {
          // Ignorar erros ao parar (ex.: scanner já estava parado)
        }
        this.html5QrcodeInstance = null
      }
    },

    /**
     * Abre o modal de Adicionar Produto já ativando o scanner de câmera.
     * Chamado pelo botão FAB de câmera na tab de produtos.
     */
    async abrirScannerCatalogo() {
      this.fecharModalAddProduto()
      await this.$nextTick()
      this.escanearCodigoBarrasCatalogo()
    },

    

    /**
     * Escaneia código de barras e preenche o campo de busca do catálogo.
     * Usa html5-qrcode — funciona em web, Android (WebView) e iOS (WKWebView).
     */
    async escanearCodigoBarrasCatalogo() {
      this.scannerAtivo = true
      this.scannerContexto = 'catalogo'

      await this.$nextTick()

      await this._iniciarScanner(async (codigo: string) => {
        await this._pararScanner()
        this.scannerAtivo = false

        // Leitura rápida: bloqueia o teclado virtual antes de focar/preencher o input
        this.bloquearTecladoCatalogo = true
        this.searchCatalogo = codigo

        await this.$nextTick()
        const input = this.$refs.searchCatalogoInput as HTMLInputElement | undefined
        input?.focus()

        await this.buscarCatalogoImediato(codigo)
      })
    },

    /**
     * Disparado pelo evento @focus do input de busca do catálogo.
     * Se o foco foi causado pela leitura rápida (scanner), mantém o input
     * em modo readonly por mais um tick (sem abrir o teclado) e depois libera,
     * já com o foco mantido, para permitir edição manual posterior sem reabrir o teclado.
     * Se o foco veio de um toque manual do usuário, libera o readonly imediatamente
     * para o teclado abrir normalmente, como já era o comportamento padrão.
     */
    async onFocusSearchCatalogo() {
      if (!this.bloquearTecladoCatalogo) return
      await this.$nextTick()
      this.bloquearTecladoCatalogo = false
    },

    /**
     * Escaneia código de barras para o modal de Faturamento Extra.
     */
    async escanearCodigoBarrasFatExtra() {
      this.scannerAtivo = true
      this.scannerContexto = 'fatExtra'

      await this.$nextTick()

      await this._iniciarScanner(async (codigo: string) => {
        await this._pararScanner()
        this.scannerAtivo = false
        this.fatExtra.searchProd = codigo
        await this.buscarCatalogoExtraImediato(codigo)
      })
    },

    /**
     * Versão sem debounce para busca imediata após leitura de câmera.
     */
    async buscarCatalogoImediato(codigo: string) {
      try {
        const res = await api.get(
          `/mvpu/produto/consultarProdutos/${this.auth.loja.id_loja}`,
          { params: { page: 1, limit: 10, search: codigo, id_usuario: this.auth.user?.id_usuario } }
        )
        this.catalogoFiltrado = res.data.data || []
        this.catalogoPage     = 1
        this.catalogoPages    = res.data.pages || 1
        // Auto-seleciona se vier exatamente 1 resultado com código exato
        if (this.catalogoFiltrado.length === 1) {
          this.selecionarProdutoCatalogo(this.catalogoFiltrado[0])
        }
      } catch (e) {
        this.catalogoFiltrado = []
      }
    },

    async buscarCatalogoExtraImediato(codigo: string) {
      try {
        const res = await api.get(
          `/mvpu/produto/consultarProdutos/${this.auth.loja.id_loja}`,
          { params: { page: 1, limit: 10, search: codigo, id_usuario: this.auth.user?.id_usuario } }
        )
        this.catalogoExtra = res.data.data || []
        if (this.catalogoExtra.length === 1) {
          this.fatExtra.id_produto = this.catalogoExtra[0].id_produto
          this.fatExtra.nome = this.catalogoExtra[0].nome
        }
      } catch (e) {
        this.catalogoExtra = []
      }
    },

    async cancelarScanner() {
      await this._pararScanner()
      this.scannerAtivo = false
    },

    // ─── AÇÕES COTAÇÃO ────────────────────────────────────────────
    async abrirCotacao() {
      try {
        this.loadingAcao = true
        const payload = { update_tipo: 'aberta', inicio_cotacao: 'n/a', final_cotacao: 'n/a' }
        await api.put(`/mvpu/cotacao/alterarEstadoCotacao/${this.auth.loja.id_loja}/${this.idCotacaoLocal}`, payload)
        this.toast('Cotação aberta! Vendedores já podem ofertar.')
        await this.carregarProdutos()
      } catch (e) {
        exibeErro(e, this.$toast)
      } finally {
        this.loadingAcao = false
      }
    },

    async finalizarCotacao() {
      try {
        this.loadingAcao = true
        const payload = { update_tipo: 'finalizada', inicio_cotacao: 'n/a', final_cotacao: 'n/a' }
        await api.put(`/mvpu/cotacao/alterarEstadoCotacao/${this.auth.loja.id_loja}/${this.idCotacaoLocal}`, payload)
        this.toast('Cotação finalizada. Selecione as melhores ofertas.')
        await this.carregarProdutos()
        await this.carregarOfertas()
        this.activeTab = 'ofertas'
      } catch (e) {
        exibeErro(e, this.$toast)
      } finally {
        this.loadingAcao = false
      }
    },

    async concluirCotacao() {
      try {
        this.loadingButtonConcluir = true
        await api.put(`/mvpu/cotacao/confirmarCotacao/${this.auth.loja.id_loja}/${this.idCotacaoLocal}`)
        this.toast('Cotação concluída com sucesso!')
        await this.carregarProdutos()
        await this.carregarOfertas()
      } catch (e) {
        exibeErro(e, this.$toast)
      } finally {
        this.loadingButtonConcluir = false
      }
    },

    // ─── PRODUTOS ────────────────────────────────────────────────
    async selecionarProdutoCatalogo(p: any) {
      this.addProduto.id_produto             = p.id_produto
      this.addProduto.nome                   = p.nome
      this.addProduto.codigo_barra           = p.codigo_barra || ''
      this.addProduto.nome_fornecedor        = p.nome_fornecedor || ''
      this.addProduto.preco_custo            = p.preco_custo
      this.addProduto.preco_venda            = p.preco_venda
      this.addProduto.margem                 = p.margem

      const payload = {
        id_cotacao: this.idCotacaoLocal,
        codigo_barra: this.addProduto.codigo_barra
      }

      const produtoUltimaCompra = await api.post(`/mvpu/produto/ultimaCotProd/${this.auth.loja.id_loja}`, payload)
      
      this.addProduto.ultimo_preco      = produtoUltimaCompra.data.data[0].ultimo_preco
      this.addProduto.ultima_quantidade = produtoUltimaCompra.data.data[0].quantidade
      this.addProduto.tipo              = produtoUltimaCompra.data.data[0].tipo

    },

    voltarParaListaCatalogo() {
      this.addProduto.id_produto             = null
      this.addProduto.nome                   = ''
      this.addProduto.codigo_barra           = ''
      this.addProduto.nome_fornecedor        = ''
      this.addProduto.preco_custo            = null
      this.addProduto.preco_venda            = null
      this.addProduto.margem                 = null
      this.addProduto.quantidade             = null
      this.addProduto.tipo                   = ''
      this.addProduto.qtd_unitaria_composicao = null
    },

    fecharModalAddProduto() {
      this.showAddProdutoModal = false
      this.addProduto = {
        id_produto: null, nome: '', codigo_barra: '', nome_fornecedor: '',
        preco_custo: null, preco_venda: null, margem: null,
        quantidade: null, tipo: '', qtd_unitaria_composicao: null,
      }
      this.searchCatalogo = ''
      this.catalogoFiltrado = []
      this.catalogoPage = 1
      this.catalogoPages = 1
      this.bloquearTecladoCatalogo = false
      this.cancelarSelecaoMultipla()
    },

    // ─── SELEÇÃO MÚLTIPLA DE PRODUTOS ─────────────────────────────
    ativarSelecaoMultipla() {
      this.modoSelecaoMultipla = true
      this.etapaSelecaoMultipla = 'selecionar'
      this.produtosSelecionadosMultiplos = []
    },

    cancelarSelecaoMultipla() {
      this.modoSelecaoMultipla = false
      this.etapaSelecaoMultipla = 'selecionar'
      this.produtosSelecionadosMultiplos = []
      this.multiploConfig = { quantidade: null, tipo: '', qtd_unitaria_composicao: null }
    },

    toggleProdutoMultiplo(p: any) {
      const idx = this.produtosSelecionadosMultiplos.findIndex((sp: any) => sp.id_produto === p.id_produto)
      if (idx >= 0) {
        this.produtosSelecionadosMultiplos.splice(idx, 1)
      } else {
        this.produtosSelecionadosMultiplos.push(p)
      }
    },

    isProdutoSelecionadoMultiplo(p: any): boolean {
      return this.produtosSelecionadosMultiplos.some((sp: any) => sp.id_produto === p.id_produto)
    },

    removerProdutoMultiplo(p: any) {
      const idx = this.produtosSelecionadosMultiplos.findIndex((sp: any) => sp.id_produto === p.id_produto)
      if (idx >= 0) this.produtosSelecionadosMultiplos.splice(idx, 1)
    },

    avancarSelecaoMultipla() {
      if (this.produtosSelecionadosMultiplos.length === 0) {
        this.$toast.add({
          severity: 'info',
          summary: 'Nenhum produto selecionado',
          detail: 'Selecione ao menos um produto para continuar',
          life: 3000
        });
        return
      }
      this.etapaSelecaoMultipla = 'configurar'
    },

    voltarSelecaoMultipla() {
      this.etapaSelecaoMultipla = 'selecionar'
    },

    resetarNovoProdutoAdicionado(){
      this.addProduto = {
        id_produto: null, nome: '', codigo_barra: '', nome_fornecedor: '',
        preco_custo: null, preco_venda: null, margem: null,
        quantidade: null, tipo: '', qtd_unitaria_composicao: null,
      }
    },

    limparTudo(){
      this.searchCatalogo=''
      this.catalogoExtra = []
      this.catalogoFiltrado = []
      this.catalogoPage = 1
      this.catalogoPages = 1
    },

    /**
     * Envia à API um ou mais itens para serem adicionados à cotação.
     * `itens` é uma matriz de itens, cada um na ordem:
     * [codigo_barra, quantidade, tipo, qtd_unitaria_composicao]
     */
    async _enviarItensCotacao(itens: any[][]) {
      for (const item of itens) {
        const codigoBarra = item[0]
        const produtoJaAdicionado = this.itens.find(
          (i: any) => i.codigo_barra === codigoBarra
        )

        if (produtoJaAdicionado) {
          this.$toast.add({ 
            severity: 'warn', 
            summary: `Produto já existe na cotação.`, 
            detail: `O Produto com código de barra ${codigoBarra} já foi adicionado à cotação. Feche essa janela e procure o produto para alterar a quantidade`, 
            life: 3000 
          });
          return
        }
      }

      const payloadRequisicao = {
        codigo_barra: itens,
        id_cotacao: `${this.idCotacaoLocal}`,
      }

      await api.post(`/mvpu/cotacao/adicionarItem/${this.auth.loja.id_loja}`, payloadRequisicao)
      this.$toast.add({ 
        severity: 'success', 
        summary: `Sucesso ao adicionar produtos`, 
        detail: `Produtos adicionados com sucesso, ao fechar, confira na lista`, 
        life: 3000 
      });
      this.resetarNovoProdutoAdicionado()
    },

    /**
     * Adiciona produto(s) à cotação.
     * - Modo padrão: adiciona o produto único selecionado em `addProduto`.
     * - Modo seleção múltipla: adiciona todos os produtos em
     *   `produtosSelecionadosMultiplos`, aplicando a mesma quantidade,
     *   tipo e qtd_unitaria_composicao (definidos em `multiploConfig`)
     *   para todos eles em uma única requisição.
     */
    async adicionarProduto() {
      if (this.modoSelecaoMultipla) {
        return await this.adicionarProdutosMultiplos()
      }

      try {

        if(!this.addProduto.quantidade || !this.addProduto.tipo || !this.addProduto.codigo_barra){
          this.$toast.add({ 
            severity: 'info', 
            summary: 'Dados faltantes', 
            detail: `Preencha os campos obrigatórios para prosseguir`, 
            life: 3000 
          });
          return
        }

        this.loadingAdd = true
        const payload_item = [
          this.addProduto.codigo_barra,
          this.addProduto.quantidade,
          this.addProduto.tipo,
          this.addProduto.qtd_unitaria_composicao,
        ]
        await this._enviarItensCotacao([payload_item])
        await this.carregarProdutos()
      } catch (e) {
        exibeErro(e, this.$toast)
      } finally {
        this.loadingAdd = false
      }
    },

    /**
     * Adiciona todos os produtos selecionados no modo múltiplo,
     * usando a mesma quantidade/tipo/composição para cada um.
     */
    async adicionarProdutosMultiplos() {
      try {
        if (!this.multiploConfig.quantidade || !this.multiploConfig.tipo) {
          this.$toast.add({
            severity: 'info',
            summary: 'Dados faltantes',
            detail: `Preencha os campos obrigatórios para prosseguir`,
            life: 3000
          });
          return
        }

        if (this.produtosSelecionadosMultiplos.length === 0) {
          this.$toast.add({
            severity: 'info',
            summary: 'Nenhum produto selecionado',
            detail: 'Selecione ao menos um produto para continuar',
            life: 3000
          });
          return
        }

        this.loadingAdd = true
        const itens = this.produtosSelecionadosMultiplos.map((p: any) => [
          p.codigo_barra,
          this.multiploConfig.quantidade,
          this.multiploConfig.tipo,
          this.multiploConfig.qtd_unitaria_composicao,
        ])
        await this._enviarItensCotacao(itens)
        this.toast(`${itens.length} produto(s) adicionado(s)!`)
        this.cancelarSelecaoMultipla()
        await this.carregarProdutos()
      } catch (e) {
        exibeErro(e, this.$toast)
      } finally {
        this.loadingAdd = false
      }
    },

    async adicionarProdutoInexistente() {
      try {
        this.loadingAdd = true
        const payloadRequisicao = {
          codigo_barra: [[this.addProdutoInexistente.nome, this.addProdutoInexistente.quantidade]],
        }
        await api.post(`/mvpu/cotacao/adicionarProdutoInexis/${this.auth.loja.id_loja}/${this.idCotacaoLocal}`, payloadRequisicao)
        this.toast('Produto adicionado!')
        this.showAddProdutoModalInexistente = false
        this.addProdutoInexistente = { nome: '', quantidade: null }
        await this.carregarProdutos()
      } catch (e) {
        exibeErro(e, this.$toast)
      } finally {
        this.loadingAdd = false
      }
    },

    abrirEditarProduto(p: any) {
      this.editTarget = { ...p }
      this.showEditModal = true
    },

    async salvarEdicao() {
      try {
        this.loadingEdit = true
        await api.put(`/mvpu/cotacao/atualizarItem/${this.auth.loja.id_loja}`, {
          id_solicitado: this.editTarget.id_solicitado,
          id_cotacao: this.idCotacaoLocal,
          quantidade: this.editTarget.quantidade,
          tipo: this.editTarget.tipo || null,
          qtd_unitaria_composicao: this.editTarget.qtd_unitaria_composicao || null,
        })
        this.toast('Produto atualizado!')
        this.showEditModal = false
        await this.carregarProdutos()
      } catch (e) {
        exibeErro(e, this.$toast)
      } finally {
        this.loadingEdit = false
      }
    },

    async confirmarDeleteProduto(p: any) {
      const alert = await alertController.create({
        header: 'Remover produto',
        message: `Remover "${p.nome}" da cotação?`,
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          {
            text: 'Remover',
            role: 'destructive',
            handler: () => this.deletarProduto(p),
          },
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

    // ─── MODAL OFERTAS ───────────────────────────────────────────
    abrirModalOfertas(item: any) {
      this.ofertasModalItem    = item
      this.ofertasModalSearch  = ''
      this.ofertasModalOrdem   = 'asc'
      this.ofertasModalSoEquiv = false
      this.ofertasModalPage    = 1
      this.showOfertasModal    = true
    },

    fecharModalOfertas() {
      this.showOfertasModal = false
      this.ofertasModalItem = null
    },

    async selecionarOfertaModal(item: any, oferta: any, opcao: number) {
      await this.selecionarOferta(item, oferta, opcao)
      // atualiza o item do modal com os dados frescos
      const atualizado = this.ofertas.find((o: any) => o.id_solicitado === item.id_solicitado)
      if (atualizado) this.ofertasModalItem = atualizado
    },

    async removerOfertaModal(item: any, oferta: any, opcao: number) {
      await this.removerOferta(item, oferta, opcao)
      const atualizado = this.ofertas.find((o: any) => o.id_solicitado === item.id_solicitado)
      if (atualizado) this.ofertasModalItem = atualizado
    },

    // ─── HELPERS CARD RESUMO ─────────────────────────────────────
    melhorOfertaItem(item: any): any {
      if (!item.ofertas?.length) return null
      let melhor: any = null
      let melhorPreco = Infinity
      for (const o of item.ofertas) {
        const preco = Number(o.primeiro_preco ?? o.segundo_preco ?? Infinity)
        if (preco < melhorPreco) { melhorPreco = preco; melhor = o }
      }
      return melhor
    },

    melhorPrecoItem(item: any): number | null {
      const o = this.melhorOfertaItem(item)
      if (!o) return null
      return Number(o.primeiro_preco ?? o.segundo_preco ?? null)
    },

    // ─── OFERTAS / SELEÇÃO ───────────────────────────────────────
    async selecionarOferta(item: any, oferta: any, opcao: number) {
      try {
        await api.post(`/mvpu/cotacao/confirmarPendente/${this.auth.loja.id_loja}/${this.idCotacaoLocal}`, {
          pendentes: [{
            id_solicitado: oferta.id_solicitado,
            id_oferta: oferta.id_oferta,
            opcao_1: opcao === 1,
            opcao_2: opcao === 2,
          }],
        })
        this.toast('Oferta selecionada!')
        await this.carregarOfertas()
        await this.carregarProdutos()
      } catch (e) {
        exibeErro(e, this.$toast)
      }
    },

    async removerOferta(item: any, oferta: any, opcao: number) {
      try {
        const payload = { pendentes: [[oferta.id_resultado, opcao]] }
        await api.delete(`/mvpu/cotacao/deletarPendente/${this.auth.loja.id_loja}/${this.idCotacaoLocal}`, { data: payload })
        this.toast('Seleção removida.')
        await this.carregarOfertas()
        await this.carregarProdutos()
      } catch (e) {
        exibeErro(e, this.$toast)
      }
    },

    selecaoAutomatica() {
      this.loadingAutoSelect = true
      try {
        const pendentes: any[] = []
        for (const item of this.ofertas) {
          if (item.status_fechamento === 'concluido') continue
          if (!item.ofertas?.length) continue

          let melhor: any = null
          let melhorPreco = Infinity
          let melhorOpcao: number | null = null

          for (const oferta of item.ofertas) {
            if (oferta.primeiro_quantidade != null && oferta.primeiro_preco != null) {
              const preco = Number(oferta.primeiro_preco)
              if (preco < melhorPreco) {
                melhorPreco = preco
                melhor = oferta
                melhorOpcao = 1
              }
            }
          }
          if (!melhor) {
            for (const oferta of item.ofertas) {
              if (oferta.segundo_quantidade != null && oferta.segundo_preco != null) {
                const preco = Number(oferta.segundo_preco)
                if (preco < melhorPreco) {
                  melhorPreco = preco
                  melhor = oferta
                  melhorOpcao = 2
                }
              }
            }
          }

          if (melhor && melhorOpcao) {
            pendentes.push({
              id_solicitado: melhor.id_solicitado,
              id_oferta: melhor.id_oferta,
              opcao_1: melhorOpcao === 1,
              opcao_2: melhorOpcao === 2,
            })
          }
        }

        if (pendentes.length === 0) {
          this.toast('Nenhuma oferta válida para seleção automática.', 'error')
          return
        }

        api.post(`/mvpu/cotacao/confirmarPendente/${this.auth.loja.id_loja}/${this.idCotacaoLocal}`, { pendentes })
          .then(() => {
            this.toast(`${pendentes.length} oferta(s) selecionadas automaticamente!`)
            this.carregarOfertas()
            this.carregarProdutos()
          })
          .catch((e: any) => exibeErro(e, this.$toast))
      } finally {
        this.loadingAutoSelect = false
      }
    },

    async removerTodasSelecoes() {
      this.loadingAutoSelect = true
      const pendentes: any[] = []
      try {
        for (const item of this.ofertas) {
          if (!item.ofertas?.length) continue
          for (const oferta of item.ofertas) {
            if (!oferta.id_resultado) continue
            if (oferta.opcao_1) pendentes.push([oferta.id_resultado, oferta.opcao_1])
            if (oferta.opcao_2) pendentes.push([oferta.id_resultado, oferta.opcao_2])
          }
        }
        await api.delete(`/mvpu/cotacao/deletarPendente/${this.auth.loja.id_loja}/${this.idCotacaoLocal}`, {
          data: { pendentes },
        })
        this.toast('Seleção removida.')
        await this.carregarOfertas()
        await this.carregarProdutos()
      } catch (e) {
        exibeErro(e, this.$toast)
      } finally {
        this.loadingAutoSelect = false
      }
    },

    // ─── FATURAMENTO EXTRA ───────────────────────────────────────
    abrirFaturamentoExtra(item: any) {
      this.fatExtra = { id_vendedor: '', id_produto: null, nome: '', quantidade: null, tipo: null, preco: null, searchProd: '' }
      this.catalogoExtra = []
      this.showFatExtra = true
    },

    async confirmarFatExtra() {
      this.toast('Produto extra adicionado ao faturamento do vendedor!')
      this.showFatExtra = false
    },

    // ─── PERÍODO ─────────────────────────────────────────────────
    async salvarPeriodo() {
      try {
        const payload = {
          update_tipo: 'periodo',
          inicio_cotacao: new Date(this.periodoEdit.inicio).getTime(),
          final_cotacao: new Date(this.periodoEdit.final).getTime(),
        }
        if (payload.inicio_cotacao > payload.final_cotacao) {
          this.toast('A data final deve ser maior que a data inicial.', 'error')
          return
        }
        await api.put(`/mvpu/cotacao/alterarEstadoCotacao/${this.auth.loja.id_loja}/${this.idCotacaoLocal}`, payload)
        this.toast('Período atualizado!')
        this.showPeriodoModal = false
        await this.carregarProdutos()
      } catch (e) {
        exibeErro(e, this.$toast)
      }
    },

    // ─── SUGESTÕES ───────────────────────────────────────────────
    toggleAllSugestoes(e: any) {
      this.sugestoesSelecionadas = e.target.checked ? this.sugestoes.map((s: any) => s.id_produto) : []
    },

    async adicionarSugestoes() {
      const selecionados = this.sugestoes.filter((s: any) => this.sugestoesSelecionadas.includes(s.id_produto))
      for (const s of selecionados) {
        try {
          await api.post(`/mvpu/cotacao/adicionarItem/${this.auth.loja.id_loja}`, {
            id_cotacao: this.idCotacaoLocal,
            id_produto: s.id_produto,
            quantidade: s.qtd_sugerida || 1,
          })
        } catch (e) {
          exibeErro(e, this.$toast)
        }
      }
      this.toast(`${selecionados.length} produto(s) adicionado(s) à cotação!`)
      this.sugestoesSelecionadas = []
      await this.carregarProdutos()
      this.activeTab = 'produtos'
    },

    
    handleBarcodeScanner(event) {
      if (event.key === 'Enter') {
        return
      }

      // Buffer apenas dígitos: a regra de detecção de leitor de código de
      // barras é baseada em sequência numérica (mín. 8 números numa rajada).
      if (/^[0-9]$/.test(event.key)) {
        this.barcodeBuffer += event.key
        this.lastBarcodeKeyTime = Date.now()
      }
    },

    async onBarcodeScanned(codigo) {

      // Exemplo para catálogo
      this.searchCatalogo = codigo
      await this.buscarCatalogoImediato(codigo)

      // Exemplo para faturamento extra
      // this.fatExtra.searchProd = codigo
      // await this.buscarCatalogoExtraImediato(codigo)
    },

    async verificarScanner() {
    if (!this.barcodeBuffer) return

    const agora = Date.now()

    // Nenhuma tecla recebida nos últimos 100ms
    if (agora - this.lastBarcodeKeyTime > 100) {
      const codigo = this.barcodeBuffer

      this.barcodeBuffer = ''

      // Sequência com pelo menos 8 dígitos numéricos chegou de uma vez:
      // SUBSTITUI qualquer código/busca anterior pelo novo, em vez de
      // concatenar ou manter o que já estava no campo.
      if (codigo.length >= 8) {


        this.showAddProdutoModal = true

        this.searchCatalogo = codigo
        setTimeout(()=>{
          this.searchCatalogo = codigo
        },150)
        await this.buscarCatalogoImediato(codigo)
      }
    }

  }

  },

  ionViewDidEnter() {
    const authStore = useAuthStore()
    if (!authStore.token && !localStorage.getItem('token')) {
      this.$router.replace({ name: 'Login' })
      return
    }
    this.auth = authStore

    const query = this.$route?.query || {}


    document.addEventListener('keydown', this.handleBarcodeScanner)

      this.barcodeInterval = setInterval(() => {
        this.verificarScanner()
      }, 50)

    

    this.idCotacaoLocal = this.id_cotacao || Number(query.id_cotacao)
    this.nomeCotacao = query.nome_cotacao as string

    if (query.status_cotacao) {
      this.cabecalho = {
        id_cotacao: this.idCotacaoLocal,
        nome_cotacao: query.nome_cotacao,
        status_cotacao: query.status_cotacao,
        inicio_cotacao: query.inicio_cotacao,
        final_cotacao: query.final_cotacao,
      }
      if (query.inicio_cotacao) {
        const ini = new Date(Number(query.inicio_cotacao))
        const fin = new Date(Number(query.final_cotacao))
        this.periodoEdit.inicio = ini.toISOString().split('T')[0]
        this.periodoEdit.final = fin.toISOString().split('T')[0]
      }
    }

    // Verifica permissão de câmera silenciosamente ao entrar na tela
    // (não exibe diálogo — apenas atualiza this.permissaoCamera)
    this.verificarPermissaoCameraAoEntrar()

    setTimeout(() => {
      this.carregarProdutos()
      this.carregarOfertas()
      this.carregarVendedores()
    }, 100)
  },


  async ionViewWillLeave() {
    // Garante que o scanner é parado ao sair da tela (libera câmera)
    await this._pararScanner()
    this.scannerAtivo = false

    if (this.barcodeInterval) {
      clearInterval(this.barcodeInterval)
      this.barcodeInterval = null
    }
  },
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

/* ══ FONTS ══ */
.poppins-regular  { font-family: 'Poppins', sans-serif; font-weight: 400; }
.poppins-medium   { font-family: 'Poppins', sans-serif; font-weight: 500; }
.poppins-semibold { font-family: 'Poppins', sans-serif; font-weight: 600; }
.mono { font-family: 'DM Mono', monospace; }
.muted { color: #94a3b8; }
.text-center { text-align: center; }

/* ══ PAGE ══ */
.console-page { background: #fff; }
.console-content { --background: #f8fafc; }

/* ══ HEADER ══ */
.cc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 10px;
  background: #fff;
  border-bottom: 1px solid #f1f5f9;
}
.cc-header-left { display: flex; align-items: center; gap: 10px; }
.back-btn {
  width: 34px; height: 34px;
  background: rgba(255,128,73,.1);
  border: none; border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  color: #ff8049; flex-shrink: 0;
}
.back-btn span { font-size: 18px; }
.cotacao-identity { display: flex; flex-direction: column; }
.cotacao-label { font-size: 9px; font-weight: 700; letter-spacing: .1em; color: #ff8049; text-transform: uppercase; }
.cotacao-name { font-size: 14px; font-weight: 700; color: #1e293b; line-height: 1.2; max-width: 170px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cc-header-right { display: flex; align-items: center; gap: 7px; }
.meta-id { font-size: 11px; color: #94a3b8; font-family: 'DM Mono', monospace; }

/* ══ STATUS PILL ══ */
.status-pill {
  display: flex; align-items: center; gap: 4px;
  padding: 3px 8px; border-radius: 20px;
  font-size: 10px;
}
.status-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.status-aberta    { background: rgba(16,185,129,.15); color: #059669; }
.status-aberta .status-dot { background: #10b981; }
.status-fechada   { background: rgba(0,0,0,.08); color: #64748b; }
.status-fechada .status-dot { background: #94a3b8; }
.status-finalizada { background: rgba(99,102,241,.15); color: #4f46e5; }
.status-finalizada .status-dot { background: #818cf8; }
.status-concluida  { background: rgba(16,185,129,.15); color: #059669; }
.status-concluida .status-dot { background: #10b981; }
.status-pendente  { background: rgba(245,158,11,.15); color: #d97706; }
.status-pendente .status-dot { background: #f59e0b; }
.status-concluido { background: rgba(16,185,129,.15); color: #059669; }
.status-concluido .status-dot { background: #10b981; }
.status-none { background: rgba(0,0,0,.05); color: #64748b; }
.status-none .status-dot { background: #cbd5e1; }

/* ══ PERÍODO ══ */
.periodo-bar {
  display: flex; align-items: center; gap: 7px;
  padding: 8px 16px;
  background: #fff7ed;
  border-bottom: 1px solid #fed7aa;
}
.periodo-icon { font-size: 14px; color: #ff8049; }
.periodo-text { font-size: 12px; color: #c2410c; }

/* ══ HEADER ACTIONS ══ */
.header-actions {
  display: flex;
  gap: 8px;
  padding: 10px 16px;
  background: #fff;
  border-bottom: 1px solid #f1f5f9;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.header-actions::-webkit-scrollbar { display: none; }

/* ══ ACTION BUTTONS ══ */
.action-btn {
  display: flex; align-items: center; gap: 5px;
  padding: 8px 14px; border-radius: 10px;
  font-size: 12px; font-weight: 500;
  border: none; cursor: pointer;
  white-space: nowrap; flex-shrink: 0;
  transition: all .2s;
}
.action-btn span { font-size: 16px; }
.action-btn:disabled { opacity: .5; cursor: not-allowed; }
.btn-primary    { background: #ff8049; color: #fff; }
.btn-primary:not(:disabled):active { background: #e67341; }
.btn-outline    { background: #fff; color: #ff8049; border: 1px solid #ff8049; }
.btn-outline:not(:disabled):active { background: #fff7ed; }
.btn-outline-gray { background: #fff; color: #64748b; border: 1px solid #e2e8f0; }
.btn-info       { background: #6366f1; color: #fff; }
.btn-info:not(:disabled):active { background: #4f46e5; }
.btn-success    { background: #10b981; color: #fff; }
.btn-success:not(:disabled):active { background: #059669; }
.full-w { flex: 1; justify-content: center; }

/* ══ TABS ══ */
.tabs-bar {
  display: flex;
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.tabs-bar::-webkit-scrollbar { display: none; }
.tab-btn {
  display: flex; align-items: center; gap: 5px;
  padding: 11px 14px;
  background: transparent; border: none;
  color: #94a3b8; font-size: 12px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all .2s;
  white-space: nowrap; flex-shrink: 0;
}
.tab-btn.active { color: #ff8049; border-bottom-color: #ff8049; }
.tab-btn.tab-disable { opacity: .4; cursor: not-allowed; }
.tab-icon { font-size: 16px; }
.tab-label { }
.tab-badge {
  background: rgba(255,128,73,.15); color: #ff8049;
  font-size: 9px; font-weight: 700;
  padding: 1px 5px; border-radius: 8px;
}

/* ══ TAB PANE ══ */
.tab-pane {
  padding: 14px 14px 120px;
  animation: fadeIn .2s ease;
}
@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }

/* ══ PANE HEADER ══ */
.pane-header {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 12px;
}


@media(max-width: 600px){
  .pane-header{
    display: flex;
    flex-direction: column;
    width: 100%;
    align-items: start;
  }
  .search-wrap{
    width: 100%;
  }
  .pane-btn-group{
    width: 100%;
  }
  
}

/* ══ SEARCH ══ */
.search-wrap {
  display: flex; align-items: center; gap: 7px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 9px 12px;
  flex: 1;
}
.search-wrap-flex { flex: 1; }
.sb-icon { font-size: 17px; color: #94a3b8; flex-shrink: 0; }
.sb-input { flex: 1; border: none; background: transparent; font-size: 13px; color: #334155; outline: none; width: 100%; }
.sb-input::placeholder { color: #cbd5e1; }
.sb-clear { background: none; border: none; padding: 0; display: flex; align-items: center; }
.sb-clear span { font-size: 16px; color: #cbd5e1; }

/* Botão câmera */
.search-camera-row { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.camera-btn {
  width: 42px; height: 42px;
  background: #ff8049; border: none; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  color: #fff; flex-shrink: 0; cursor: pointer;
  box-shadow: 0 4px 12px rgba(255,128,73,.35);
  transition: all .2s;
}
.camera-btn span { font-size: 20px; }
.camera-btn:active { background: #e67341; transform: scale(.95); }

/* FAB scanner no pane de produtos */
.pane-btn-group { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.fab-scan-btn {
  width: 38px; height: 38px;
  background: #ff8049; border: none; border-radius: 11px;
  display: flex; align-items: center; justify-content: center;
  color: #fff; cursor: pointer;
  box-shadow: 0 4px 10px rgba(255,128,73,.3);
  transition: all .2s; flex-shrink: 0;
}
.fab-scan-btn span { font-size: 20px; }
.fab-scan-btn:active { transform: scale(.93); }

/* ══ LOADING / EMPTY ══ */
.loading-state, .empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 50px 20px; text-align: center; gap: 10px;
}
.loading-state p { font-size: 13px; color: #94a3b8; margin: 6px 0 0; }
.empty-icon-wrap {
  width: 64px; height: 64px;
  background: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 20px;
  display: flex; align-items: center; justify-content: center;
}
.empty-icon-wrap span { font-size: 28px; color: #cbd5e1; }
.empty-state h3 { font-size: 15px; color: #334155; margin: 0; }
.empty-state p  { font-size: 13px; color: #94a3b8; margin: 0; max-width: 240px; line-height: 1.5; }

/* ══ PRODUTOS LIST (mobile cards) ══ */
.produtos-list { display: flex; flex-direction: column; gap: 10px; }
.produto-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 13px 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,.04);
}
.pc-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 10px; }
.pc-info { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
.pc-name { font-size: 13px; color: #1e293b; }
.pc-barcode { font-size: 11px; }
.pc-cat { font-size: 11px; color: #94a3b8; }
.pc-actions { display: flex; gap: 6px; flex-shrink: 0; }
.icon-btn {
  width: 30px; height: 30px; border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  border: none; cursor: pointer; transition: all .2s;
}
.icon-btn span { font-size: 17px; }
.icon-btn.edit { background: #f1f5f9; color: #64748b; }
.icon-btn.edit:active { background: #ff8049; color: #fff; }
.icon-btn.del  { background: rgba(239,68,68,.1); color: #ef4444; }
.icon-btn.del:active  { background: #ef4444; color: #fff; }
.locked-hint { font-size: 16px; color: #cbd5e1; }
.pc-details {
  display: flex; flex-wrap: wrap; gap: 8px;
  padding-top: 10px;
  border-top: 1px solid #f1f5f9;
}
.pc-detail-item { display: flex; flex-direction: column; gap: 1px; min-width: 60px; }
.pc-detail-label { font-size: 9px; color: #94a3b8; text-transform: uppercase; letter-spacing: .4px; }
.pc-detail-val { font-size: 12px; color: #475569; }
.type-tag {
  display: inline-block; background: #f1f5f9; color: #475569;
  padding: 1px 7px; border-radius: 6px; font-size: 11px; text-transform: capitalize;
}
.margem-badge { display: inline-block; padding: 1px 7px; border-radius: 6px; font-size: 11px; }
.margem-badge.pos { background: rgba(16,185,129,.15); color: #059669; }
.margem-badge.neg { background: rgba(239,68,68,.15); color: #dc2626; }

/* ══ OFERTAS ══ */
.ofertas-list { display: flex; flex-direction: column; gap: 12px; }
.oferta-card {
  background: #fff; border: 1px solid #e2e8f0;
  border-radius: 16px; overflow: hidden;
}
.oferta-card.pendente  { border-color: rgba(245,158,11,.5); }
.oferta-card.concluido { border-color: rgba(16,185,129,.5); }
.oferta-card-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 12px 14px;
  background: #fafafa;
  border-bottom: 1px solid #f1f5f9;
  gap: 8px;
}
.oih-name { font-size: 13px; color: #1e293b; display: block; }
.oih-code { font-size: 10px; display: block; }
.oih-right { display: flex; flex-direction: column; align-items: flex-end; gap: 5px; flex-shrink: 0; }
.oih-qty { font-size: 11px; color: #94a3b8; }
.vendedores-list { padding: 10px 14px; display: flex; flex-direction: column; gap: 10px; }
.no-ofertas { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #94a3b8; padding: 8px 0; }
.no-ofertas span { font-size: 18px; }
.vendedor-oferta {
  background: #f8fafc; border: 1px solid #e2e8f0;
  border-radius: 12px; padding: 11px 12px;
  transition: border-color .2s;
}
.vendedor-oferta.selected { border-color: #10b981; background: rgba(16,185,129,.03); }
.vo-vendor { display: flex; align-items: center; gap: 6px; font-size: 13px; margin-bottom: 8px; flex-wrap: wrap; }
.vo-icon { font-size: 16px; color: #ff8049; }
.vo-email { font-size: 11px; }
.indicador-oferta { font-size: 11px; color: #64748b; margin: 8px 0 4px; }
.opcao-mini {
  display: flex; flex-direction: column; gap: 4px;
  background: #fff; border: 1px solid #e2e8f0;
  border-radius: 10px; padding: 8px 10px; margin-bottom: 6px;
}
.opcao-mini.chosen { background: rgba(16,185,129,.07); border-color: #10b981; }
.opcao-mini.eq { border-style: dashed; }
.opcao-label {
  font-size: 10px; font-weight: 700; letter-spacing: .05em;
  background: rgba(255,128,73,.12); color: #ff8049;
  padding: 1px 6px; border-radius: 5px; width: fit-content;
}
.opcao-label.eq { background: rgba(99,102,241,.12); color: #6366f1; }
.opcao-row { display: flex; flex-wrap: wrap; gap: 6px; }
.opcao-item { font-size: 12px; color: #475569; }
.chosen-badge { display: flex; align-items: center; gap: 4px; font-size: 11px; color: #059669; }
.chosen-badge span { font-size: 14px; }
.vo-obs { font-size: 12px; color: #64748b; font-style: italic; margin-top: 6px; display: flex; align-items: flex-start; gap: 5px; }
.obs-icon { font-size: 14px; }
.vo-actions { display: flex; gap: 7px; flex-wrap: wrap; margin-top: 8px; }
.sel-btn, .desel-btn {
  display: flex; align-items: center; gap: 4px;
  padding: 6px 12px; border-radius: 8px;
  font-size: 11px; border: none; cursor: pointer;
  transition: all .2s;
}
.sel-btn  { background: rgba(16,185,129,.1); color: #059669; border: 1px solid rgba(16,185,129,.3); }
.sel-btn:active  { background: #10b981; color: #fff; }
.sel-btn.eq { background: rgba(99,102,241,.1); color: #4f46e5; border-color: rgba(99,102,241,.3); }
.sel-btn.eq:active { background: #6366f1; color: #fff; }
.desel-btn { background: rgba(239,68,68,.1); color: #ef4444; border: 1px solid rgba(239,68,68,.25); }
.desel-btn:active { background: #ef4444; color: #fff; }
.extra-faturamento { padding: 6px 14px 12px; }
.link-btn {
  display: flex; align-items: center; gap: 5px;
  background: none; border: none; color: #ff8049;
  cursor: pointer; font-size: 12px; padding: 0;
}
.link-btn span { font-size: 16px; }
.conclude-bar {
  display: flex; justify-content: space-between; align-items: center;
  background: #fff; border: 1px solid #e2e8f0;
  border-radius: 14px; padding: 12px 14px; margin-top: 14px;
  gap: 10px;
}
.conclude-hint { font-size: 12px; color: #64748b; display: flex; align-items: center; gap: 6px; }
.conclude-hint span { font-size: 16px; }

/* ══ VENDEDORES MOBILE ══ */
.vendedores-list-mobile { display: flex; flex-direction: column; gap: 10px; }
.vendedor-card-mobile {
  background: #fff; border: 1px solid #e2e8f0;
  border-radius: 16px; padding: 14px;
  display: flex; align-items: center; gap: 12px;
}
.vc-avatar { position: relative; flex-shrink: 0; }
.vc-avatar img { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; }
.vc-initials {
  width: 44px; height: 44px; border-radius: 50%;
  background: rgba(255,128,73,.1); color: #ff8049;
  display: flex; align-items: center; justify-content: center;
  font-size: 15px;
}
.vc-status { position: absolute; bottom: 1px; right: 1px; width: 11px; height: 11px; border-radius: 50%; border: 2px solid #fff; }
.vc-status.ativo { background: #10b981; }
.vc-status.inativo { background: #9ca3af; }
.vc-info { display: flex; flex-direction: column; gap: 1px; flex: 1; min-width: 0; }
.vc-name { font-size: 13px; color: #1e293b; }
.vc-user, .vc-email { font-size: 11px; }
.vc-stats { display: flex; gap: 12px; flex-shrink: 0; }
.vc-stat { display: flex; flex-direction: column; align-items: center; gap: 1px; }
.vc-stat b { font-size: 14px; color: #ff8049; }
.vc-stat span { font-size: 9px; color: #94a3b8; text-transform: uppercase; letter-spacing: .4px; }

/* ══ MODAIS (bottom sheet) ══ */
ion-modal.bottom-sheet {
  --border-radius: 20px 20px 0 0;
  --box-shadow: 0 -4px 24px rgba(0,0,0,.1);
  align-items: flex-end;
}
.modal-content { --background: #fff; }
.modal-handle {
  width: 36px; height: 4px; background: #e2e8f0;
  border-radius: 4px; margin: 10px auto 0;
}
.modal-box { padding: 0; }
.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 18px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 15px; color: #1e293b;
}
.modal-close { background: none; border: none; color: #94a3b8; cursor: pointer; display: flex; align-items: center; }
.modal-close span { font-size: 20px; }
.modal-body { padding: 16px 18px; }
.modal-footer {
  display: flex; gap: 10px;
  padding: 14px 18px;
  border-top: 1px solid #f1f5f9;
}
.modal-prod-name { font-size: 14px; color: #ff8049; margin-bottom: 14px; }
.modal-hint { font-size: 13px; color: #64748b; margin-bottom: 14px; line-height: 1.5; }
.form-group { margin-bottom: 12px; }
.form-label {
  display: block; font-size: 10px; text-transform: uppercase;
  letter-spacing: .5px; color: #ff8049; margin-bottom: 5px;
}
.form-input {
  width: 100%; background: #f8fafc;
  border: 1px solid #e2e8f0; border-radius: 10px;
  padding: 10px 12px; font-size: 13px; color: #1e293b;
  outline: none; font-family: 'Poppins', sans-serif;
  transition: border-color .2s;
  -webkit-appearance: none;
}
.form-input:focus { border-color: #ff8049; background: #fff; }

/* Catálogo de busca — estilos migrados para bloco CATÁLOGO — BUSCA NOVA */
.prod-name { color: #1e293b; font-size: 13px; }
.prod-price { font-size: 12px; color: #94a3b8; }
.form-selected-prod { margin-top: 4px; }

/* ══ SCANNER OVERLAY (html5-qrcode) ══ */
.scanner-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.92);
  z-index: 9999;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 20px;
}
/* Contêiner que envolve o vídeo + cantos decorativos */
.scanner-viewfinder {
  position: relative;
  width: 280px;
  border-radius: 16px;
  overflow: hidden;
}
/* Div obrigatória para o html5-qrcode montar o vídeo */
.qr-reader-container {
  width: 280px;
  min-height: 220px;
  background: #000;
}
/* Neutraliza estilos padrão injetados pelo html5-qrcode */
.qr-reader-container video {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  border-radius: 0 !important;
}
/* Esconde a UI padrão do html5-qrcode (botões, selects, etc.) */
.qr-reader-container > div > div:not(:first-child),
.qr-reader-container img,
.qr-reader-container select,
.qr-reader-container button,
.qr-reader-container span {
  display: none !important;
}
/* Cantos decorativos sobrepostos ao vídeo */
.scanner-corners {
  position: absolute; inset: 0; pointer-events: none;
}
.scanner-corner {
  position: absolute; width: 28px; height: 28px;
  border-color: #ff8049; border-style: solid;
}
.scanner-corner.tl { top: 8px;  left: 8px;  border-width: 3px 0 0 3px; border-radius: 6px 0 0 0; }
.scanner-corner.tr { top: 8px;  right: 8px; border-width: 3px 3px 0 0; border-radius: 0 6px 0 0; }
.scanner-corner.bl { bottom: 8px; left: 8px;  border-width: 0 0 3px 3px; border-radius: 0 0 0 6px; }
.scanner-corner.br { bottom: 8px; right: 8px; border-width: 0 3px 3px 0; border-radius: 0 0 6px 0; }
.scanner-line {
  position: absolute; left: 12px; right: 12px; top: 50%;
  height: 2px; background: #ff8049;
  animation: scanLine 2s ease-in-out infinite;
  border-radius: 2px;
}
@keyframes scanLine {
  0%, 100% { top: 12%; }
  50%       { top: 88%; }
}
.scanner-hint { font-size: 14px; color: rgba(255,255,255,.85); }
.scanner-cancel {
  background: rgba(255,255,255,.15); border: 1px solid rgba(255,255,255,.3);
  color: #fff; border-radius: 12px; padding: 10px 24px;
  font-size: 14px; display: flex; align-items: center; gap: 6px; cursor: pointer;
}
.scanner-cancel span { font-size: 18px; }

/* ══ TOASTS ══ */
.toast-container {
  position: fixed; bottom: 24px; left: 16px; right: 16px;
  z-index: 10000; display: flex; flex-direction: column; gap: 8px;
  pointer-events: none;
}
.toast-item {
  display: flex; align-items: center; gap: 9px;
  padding: 12px 16px; border-radius: 14px;
  font-size: 13px;
  box-shadow: 0 8px 24px rgba(0,0,0,.15);
  pointer-events: auto;
}
.toast-item span { font-size: 18px; }
.toast-item.success { background: #10b981; color: #fff; }
.toast-item.error   { background: #ef4444; color: #fff; }
.toast-enter-active, .toast-leave-active { transition: all .3s ease; }
.toast-enter-from { opacity: 0; transform: translateY(20px); }
.toast-leave-to   { opacity: 0; transform: translateY(20px); }

/* ══ CATÁLOGO — BUSCA NOVA ══ */
.catalogo-loading {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; color: #94a3b8; padding: 12px 0;
}
.catalogo-list {
  max-height: 220px; overflow-y: auto;
  border: 1px solid #e2e8f0; border-radius: 12px;
  margin-bottom: 10px;
}
.catalogo-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 12px; cursor: pointer;
  border-bottom: 1px solid #f1f5f9; transition: background .15s;
  gap: 8px;
}
.catalogo-item:last-child { border-bottom: none; }
.catalogo-item:active { background: rgba(255,128,73,.08); }
.catalogo-item-info { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
.catalogo-barcode { font-size: 11px; }
.catalogo-fornecedor { font-size: 11px; color: #94a3b8; }
.catalogo-item-right { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
.catalogo-arrow { font-size: 18px; color: #cbd5e1; }

/* Paginação do catálogo */
.catalogo-pagination {
  display: flex; align-items: center; justify-content: center; gap: 12px;
  padding: 6px 0 10px;
}
.pag-btn {
  width: 30px; height: 30px; border-radius: 8px;
  background: #f1f5f9; border: none; color: #475569;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all .15s;
}
.pag-btn:disabled { opacity: .35; cursor: not-allowed; }
.pag-btn span { font-size: 18px; }
.pag-info { font-size: 12px; color: #64748b; }

/* Detalhe do produto selecionado */
.selected-prod-detail {
  background: #fff8f5;
  border: 1px solid rgba(255,128,73,.25);
  border-radius: 14px; padding: 12px 14px;
  margin-bottom: 14px;
}
.selected-prod-detail-top { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 10px; }
.spd-icon { font-size: 22px; color: #ff8049; flex-shrink: 0; margin-top: 2px; }
.spd-info { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
.spd-name { font-size: 13px; color: #1e293b; line-height: 1.3; }
.spd-barcode { font-size: 11px; color: #64748b; }
.spd-fornecedor { font-size: 11px; }
.spd-prices {
  display: flex; flex-wrap: wrap; gap: 10px;
  padding: 8px 0; border-top: 1px solid rgba(255,128,73,.15);
  margin-bottom: 10px;
}
.spd-price-item { display: flex; flex-direction: column; gap: 1px; min-width: 55px; }
.spd-price-label { font-size: 9px; text-transform: uppercase; letter-spacing: .4px; color: #94a3b8; }
.spd-price-val { font-size: 13px; color: #1e293b; }
.spd-price-val.pos { color: #059669; }
.spd-price-val.neg { color: #dc2626; }

/* Botão trocar produto */
.trocar-prod-btn {
  display: flex; align-items: center; gap: 5px;
  background: none; border: 1px solid #e2e8f0;
  border-radius: 9px; padding: 6px 12px;
  font-size: 12px; color: #64748b; cursor: pointer;
  transition: all .15s;
}
.trocar-prod-btn span { font-size: 16px; }
.trocar-prod-btn:active { background: #f1f5f9; border-color: #cbd5e1; }

/* ══ OFERTA CARD — RESUMO ══ */
.oferta-resumo {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px 12px;
  gap: 10px; flex-wrap: wrap;
}
.oferta-resumo-stats {
  display: flex; flex-wrap: wrap; gap: 12px; flex: 1;
}
.ors-item { display: flex; flex-direction: column; gap: 1px; min-width: 60px; }
.ors-label { font-size: 9px; color: #94a3b8; text-transform: uppercase; letter-spacing: .4px; }
.ors-val { font-size: 14px; color: #1e293b; }
.ors-vendedor { font-size: 12px; color: #ff8049; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 110px; }
.ors-preco { font-size: 13px; color: #059669; }
.ors-empty { font-size: 12px; color: #94a3b8; font-style: italic; padding: 4px 0; }
.oferta-resumo-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.ver-ofertas-btn {
  display: flex; align-items: center; gap: 5px;
  background: rgba(255,128,73,.1); color: #ff8049;
  border: 1px solid rgba(255,128,73,.3);
  border-radius: 10px; padding: 7px 12px;
  font-size: 12px; cursor: pointer; transition: all .2s;
  white-space: nowrap;
}
.ver-ofertas-btn span { font-size: 16px; }
.ver-ofertas-btn:active { background: #ff8049; color: #fff; }

/* ══ MODAL OFERTAS ══ */
ion-modal.ofertas-modal-sheet {
  --height: 90%;
}
.om-header-info { display: flex; flex-direction: column; gap: 1px; }
.om-title { font-size: 15px; color: #1e293b; }
.om-prod-name { font-size: 12px; color: #ff8049; }
.om-filters { padding: 10px 18px 0; display: flex; flex-direction: column; gap: 8px; }
.om-search { margin-bottom: 0; }
.om-sort-row { display: flex; gap: 6px; flex-wrap: wrap; }
.om-sort-btn {
  display: flex; align-items: center; gap: 4px;
  padding: 5px 10px; border-radius: 8px;
  font-size: 11px; border: 1px solid #e2e8f0;
  background: #f8fafc; color: #64748b; cursor: pointer;
  transition: all .2s;
}
.om-sort-btn span { font-size: 14px; }
.om-sort-btn.active { background: rgba(255,128,73,.1); color: #ff8049; border-color: rgba(255,128,73,.4); }
.om-body { padding: 10px 14px 20px; overflow-y: auto; }
.om-empty {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; color: #94a3b8;
  padding: 24px 0; justify-content: center;
}
.om-empty span { font-size: 20px; }
.om-ofertas-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px; }
.om-pagination {
  display: flex; align-items: center; justify-content: center; gap: 12px;
  padding: 8px 0;
}
.oih-left { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }

/* ══ SELEÇÃO MÚLTIPLA DE PRODUTOS ══ */
.multi-select-btn {
  width: 100%; height: 40px; color: #FFF; font-family: 'Poppins'; font-weight: 650;
  background-color: #ff8049; margin-bottom: 10px; border-radius: 10px;
  border: none; display: flex; align-items: center; justify-content: center; gap: 6px;
  cursor: pointer; transition: opacity .15s;
}
.multi-select-btn span { font-size: 18px; }
.multi-select-btn:active { opacity: .85; }

.multi-header {
  display: flex; align-items: center; justify-content: space-between;
  gap: 10px; margin-bottom: 10px; flex-wrap: wrap;
}
.multi-header-count { font-size: 13px; color: #1e293b; }
.multi-exit-btn {
  display: flex; align-items: center; gap: 4px;
  background: none; border: 1px solid #e2e8f0; border-radius: 9px;
  padding: 6px 10px; font-size: 12px; color: #64748b; cursor: pointer;
  transition: all .15s;
}
.multi-exit-btn span { font-size: 16px; }
.multi-exit-btn:active { background: #f1f5f9; border-color: #cbd5e1; }

.multi-selected-scroll {
  display: flex; gap: 8px; overflow-x: auto; padding: 2px 2px 10px;
  scrollbar-width: none;
}
.multi-selected-scroll::-webkit-scrollbar { display: none; }
.multi-chip {
  display: flex; align-items: center; gap: 6px; flex-shrink: 0;
  background: rgba(255,128,73,.1); border: 1px solid rgba(255,128,73,.3);
  color: #ff8049; border-radius: 999px; padding: 6px 8px 6px 12px;
  font-size: 12px; white-space: nowrap; max-width: 180px;
}
.multi-chip-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.multi-chip-remove {
  display: flex; align-items: center; justify-content: center;
  width: 18px; height: 18px; border-radius: 50%; flex-shrink: 0;
  background: rgba(255,128,73,.2); border: none; color: #ff8049; cursor: pointer;
}
.multi-chip-remove span { font-size: 13px; }

.catalogo-item-check { font-size: 20px; color: #ff8049; flex-shrink: 0; }
.catalogo-item-selected { background: rgba(255,128,73,.08); }

.multi-selected-list {
  max-height: 180px; overflow-y: auto;
  border: 1px solid #e2e8f0; border-radius: 12px;
  margin-bottom: 14px;
}
.multi-selected-item {
  display: flex; align-items: center; gap: 8px;
  padding: 9px 12px; border-bottom: 1px solid #f1f5f9;
}
.multi-selected-item:last-child { border-bottom: none; }
.multi-selected-item-info {
  display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0;
}
.multi-selected-item-info span:first-child { font-size: 13px; color: #1e293b; }

/* Fim dos estilos */
</style>