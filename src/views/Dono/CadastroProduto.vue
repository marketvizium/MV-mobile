<template>
  <ion-page class="cpc-page">
    <ion-content :fullscreen="true" class="cpc-content">

      <RefresherIonic />

      <!-- ══ HEADER ══ -->
      <div class="cpc-header">
        <div class="cpc-header-left">
          <button class="back-btn" @click="$router.back()">
            <span class="material-symbols-outlined">arrow_back_ios_new</span>
          </button>
          <div class="page-identity">
            <span class="page-label">PRODUTOS</span>
            <span class="page-name">Cadastro de produtos</span>
          </div>
        </div>

        <!-- Indicador de fila no header -->
        <button
          v-if="listaProdutos.length > 0"
          class="queue-badge-btn"
          @click="modalFilaAberta = true"
        >
          <span class="material-symbols-outlined">inventory_2</span>
          <span class="queue-badge-count">{{ listaProdutos.length }}</span>
          <span class="queue-badge-label">na fila</span>
          <span class="material-symbols-outlined queue-eye">visibility</span>
        </button>
      </div>

      <!-- ══ BANNER: produto adicionado à fila via manual+xml ══ -->
      <transition name="slide-down">
        <div class="queue-banner" v-if="mostrarBannerFila">
          <span class="material-symbols-outlined">info</span>
          <span class="queue-banner-text poppins-medium">
            Produto adicionado à fila — clique em <strong>Cadastrar</strong> para concluir.
          </span>
          <button class="queue-banner-close" @click="mostrarBannerFila = false">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
      </transition>

      <!-- Atalho: Consultar produtos -->
      <div class="step-card consult-card">
        <button
          class="consult-btn poppins-medium"
          @click="$router.push({name: 'ConsultaProdutosDono'})"
        >
          <span class="material-symbols-outlined">search</span>
          Consultar meus produtos
          <span class="material-symbols-outlined consult-arrow">chevron_right</span>
        </button>
      </div>

      <!-- ══════════════════════════════
           IMPORTAR VIA XML
      ══════════════════════════════ -->
      <div class="step-card">
        <div class="step-header">
          <div class="step-num xml-step" :class="{ done: !!xmlFileName }">
            <span class="material-symbols-outlined" v-if="xmlFileName">check</span>
            <span class="material-symbols-outlined" v-else style="font-size:16px;">upload_file</span>
          </div>
          <div style="flex:1;min-width:0;">
            <span class="step-title poppins-semibold">Importar via XML</span>
            <span class="step-sub poppins-regular">NF-e — preenche automaticamente</span>
          </div>
          <span class="optional-tag poppins-regular">Opcional</span>
        </div>

        <div v-if="!xmlFileName">
          <p class="xml-hint poppins-regular">
            Selecione um arquivo <strong>.xml</strong> de NF-e para importar todos os produtos de uma vez.
          </p>
          <button class="xml-upload-btn poppins-medium" @click="$refs.xmlInput.click()">
            <span class="material-symbols-outlined">upload_file</span>
            Selecionar arquivo XML
          </button>
          <input ref="xmlInput" type="file" accept=".xml" hidden @change="onFileChange" />
        </div>

        <div v-else class="xml-loaded-state">
          <div class="xml-loaded-top">
            <span class="material-symbols-outlined xml-ok-icon">task_alt</span>
            <div>
              <span class="xml-filename poppins-semibold">{{ xmlFileName }}</span>
              <span class="xml-count poppins-regular">{{ listaProdutos.length }} produto(s) importado(s)</span>
            </div>
          </div>
          <button class="xml-remove-btn poppins-medium" @click="limparXML">
            <span class="material-symbols-outlined">close</span> Remover XML
          </button>
        </div>
      </div>

      <!-- ══════════════════════════════
           FORMULÁRIO PRODUTO
      ══════════════════════════════ -->
      <div class="step-card" :class="{ 'step-editing': modoEdicao !== null }">
        <div class="step-header">
          <div class="step-num" :class="{ editing: modoEdicao !== null }">
            <span class="material-symbols-outlined" v-if="modoEdicao !== null" style="font-size:16px;">edit</span>
            <span v-else>1</span>
          </div>
          <div style="flex:1;min-width:0;">
            <span class="step-title poppins-semibold">
              {{ modoEdicao !== null ? `Editando produto ${modoEdicao + 1}` : 'Adicionar produto' }}
            </span>
            <span class="step-sub poppins-regular">
              {{ modoEdicao !== null ? 'Altere os dados e confirme' : xmlFileName ? 'Adiciona à fila do XML' : 'Cadastro manual' }}
            </span>
          </div>
        </div>

        <!-- ── Campos obrigatórios ── -->
        <div class="fields-section-label poppins-medium">
          <span class="material-symbols-outlined" style="font-size:14px;color:#ff8049;">star</span>
          Campos obrigatórios
        </div>

        <div class="form-group">
          <label class="form-label poppins-medium">Nome do produto <span class="req-star">*</span></label>
          <div :class="['input-wrap', { 'input-filled': formProduto.nome, 'input-error': tentouAdicionar && !formProduto.nome }]">
            <span class="material-symbols-outlined input-icon">label</span>
            <input
              type="text"
              class="form-input poppins-regular"
              placeholder="Ex: Arroz Branco Tipo 1 5kg"
              v-model="formProduto.nome"
            />
          </div>
          <span class="field-error poppins-regular" v-if="tentouAdicionar && !formProduto.nome">Campo obrigatório</span>
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label poppins-medium">Cód. barras <span class="req-star">*</span></label>
            <div :class="['input-wrap', { 'input-filled': formProduto.codigo_barra, 'input-error': tentouAdicionar && !formProduto.codigo_barra }]">
              <span class="material-symbols-outlined input-icon">barcode</span>
              <input
                type="text"
                class="form-input poppins-regular mono"
                placeholder="EAN-13"
                v-model="formProduto.codigo_barra"
                maxlength="13"
                inputmode="numeric"
              />
            </div>
            <span class="field-error poppins-regular" v-if="tentouAdicionar && !formProduto.codigo_barra">Obrigatório</span>
          </div>

          <div class="form-group">
            <label class="form-label poppins-medium">Preço custo <span class="req-star">*</span></label>
            <div :class="['input-wrap', { 'input-filled': formProduto.preco_custo, 'input-error': tentouAdicionar && !formProduto.preco_custo }]">
              <span class="material-symbols-outlined input-icon">payments</span>
              <input
                type="number"
                class="form-input poppins-regular"
                placeholder="R$ 0,00"
                v-model="formProduto.preco_custo"
                inputmode="decimal"
                step="0.01"
                min="0"
              />
            </div>
            <span class="field-error poppins-regular" v-if="tentouAdicionar && !formProduto.preco_custo">Obrigatório</span>
          </div>
        </div>

        <!-- ── Campos adicionais (colapsável — inclui fornecedor) ── -->
        <button class="optional-toggle poppins-regular" @click="showOpcionais = !showOpcionais">
          <span class="material-symbols-outlined">{{ showOpcionais ? 'remove' : 'add' }}</span>
          Campos adicionais
          <span class="optional-count" v-if="camposAdicionaisPreenchidos > 0">
            {{ camposAdicionaisPreenchidos }} preenchido(s)
          </span>
        </button>

        <div v-show="showOpcionais" class="optional-body">

          <!-- ── FORNECEDOR (integrado nos campos adicionais) ── -->
          <div class="section-divider poppins-medium">
            <span class="material-symbols-outlined" style="font-size:13px;">business</span>
            Fornecedor
          </div>

          <div class="form-group">
            <label class="form-label poppins-medium">Nome do fornecedor</label>
            <div :class="['input-wrap', { 'input-filled': fornecedor_selecionado.nome_fornecedor }]">
              <span class="material-symbols-outlined input-icon">business</span>
              <input
                type="text"
                class="form-input poppins-regular"
                placeholder="Buscar ou digitar nome..."
                v-model="fornecedor_selecionado.nome_fornecedor"
                @input="filtrarFornecedores"
                @blur="touchedFornecedor = true"
              />
              <button class="input-action-btn" v-if="fornecedor_selecionado.nome_fornecedor" @click="limparFornecedor">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            <div class="catalogo-list" v-if="fornecedoresFiltrados.length > 0 && showFornecedorList">
              <button
                v-for="f in fornecedoresFiltrados"
                :key="f.cnpj"
                class="catalogo-item poppins-regular"
                @click="selecionarFornecedor(f)"
              >
                <div>
                  <span class="prod-name">{{ f.nome_fornecedor }}</span>
                  <span class="prod-meta mono">{{ f.cnpj }}</span>
                </div>
                <span class="material-symbols-outlined" style="color:#ff8049;font-size:18px;">chevron_right</span>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label poppins-medium">
              CNPJ do fornecedor
              <span class="optional-badge poppins-regular">Recomendado</span>
            </label>
            <div :class="['input-wrap', { 'input-filled': fornecedor_selecionado.cnpj }]">
              <span class="material-symbols-outlined input-icon">badge</span>
              <input
                type="text"
                class="form-input poppins-regular mono"
                placeholder="00.000.000/0001-00"
                v-model="fornecedor_selecionado.cnpj"
                inputmode="numeric"
                maxlength="18"
              />
            </div>
          </div>

          <!-- ── Precificação ── -->
          <div class="section-divider poppins-medium">
            <span class="material-symbols-outlined" style="font-size:13px;">sell</span>
            Precificação
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label poppins-medium">Margem (%)</label>
              <div :class="['input-wrap', { 'input-filled': formProduto.margem }]">
                <span class="material-symbols-outlined input-icon">percent</span>
                <input
                  type="number"
                  class="form-input poppins-regular"
                  placeholder="Ex: 30"
                  v-model="formProduto.margem"
                  inputmode="decimal"
                  maxlength="3"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label poppins-medium">Preço de venda</label>
              <div class="input-wrap input-disabled">
                <span class="material-symbols-outlined input-icon">calculate</span>
                <input
                  type="text"
                  class="form-input poppins-regular"
                  :placeholder="precoVendaForm ? 'R$ ' + precoVendaForm : 'Calculado auto'"
                  :value="precoVendaForm ? 'R$ ' + precoVendaForm : ''"
                  disabled
                />
              </div>
            </div>
          </div>

          <!-- ── Classificação ── -->
          <div class="section-divider poppins-medium">
            <span class="material-symbols-outlined" style="font-size:13px;">category</span>
            Classificação
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label poppins-medium">Categoria</label>
              <div :class="['input-wrap', { 'input-filled': formProduto.categoria }]">
                <span class="material-symbols-outlined input-icon">category</span>
                <input type="text" class="form-input poppins-regular" placeholder="Ex: Alimentos" v-model="formProduto.categoria" />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label poppins-medium">Busca rápida</label>
              <div :class="['input-wrap', { 'input-filled': formProduto.busca_rapida }]">
                <span class="material-symbols-outlined input-icon">saved_search</span>
                <input type="text" class="form-input poppins-regular" placeholder="Código ou frase" v-model="formProduto.busca_rapida" />
              </div>
            </div>
          </div>

          <!-- ── Fiscal ── -->
          <div class="section-divider poppins-medium">
            <span class="material-symbols-outlined" style="font-size:13px;">receipt_long</span>
            Dados fiscais
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label poppins-medium">NCM</label>
              <div :class="['input-wrap', { 'input-filled': formProduto.ncm }]">
                <span class="material-symbols-outlined input-icon">receipt_long</span>
                <input type="text" class="form-input poppins-regular mono" placeholder="Ex: 1006.30.21" v-model="formProduto.ncm" />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label poppins-medium">CEST</label>
              <div :class="['input-wrap', { 'input-filled': formProduto.cest }]">
                <span class="material-symbols-outlined input-icon">tag</span>
                <input type="text" class="form-input poppins-regular mono" placeholder="Opcional" v-model="formProduto.cest" />
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label poppins-medium">Origem</label>
            <div :class="['input-wrap', { 'input-filled': formProduto.origem }]">
              <span class="material-symbols-outlined input-icon">public</span>
              <input type="text" class="form-input poppins-regular" placeholder="Opcional" v-model="formProduto.origem" />
            </div>
          </div>

          <!-- ── Localização ── -->
          <div class="section-divider poppins-medium">
            <span class="material-symbols-outlined" style="font-size:13px;">store</span>
            Localização
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label poppins-medium">Gôndola loja</label>
              <div :class="['input-wrap', { 'input-filled': formProduto.gondula_loja }]">
                <span class="material-symbols-outlined input-icon">store</span>
                <input type="text" class="form-input poppins-regular" placeholder="Ex: A3" v-model="formProduto.gondula_loja" />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label poppins-medium">Gôndola estoque</label>
              <div :class="['input-wrap', { 'input-filled': formProduto.gondula_estoque }]">
                <span class="material-symbols-outlined input-icon">warehouse</span>
                <input type="text" class="form-input poppins-regular" placeholder="Ex: B7" v-model="formProduto.gondula_estoque" maxlength="16" />
              </div>
            </div>
          </div>

        </div>

        <!-- Botões do formulário -->
        <div class="form-actions">
          <button class="btn-adicionar poppins-semibold" @click="adicionarProduto">
            <span class="material-symbols-outlined">{{ modoEdicao !== null ? 'check_circle' : (xmlFileName ? 'playlist_add' : 'send') }}</span>
            {{ modoEdicao !== null ? 'Confirmar edição' : (xmlFileName ? 'Adicionar à fila' : 'Adicionar à fila') }}
          </button>
          <button v-if="modoEdicao !== null" class="btn-cancelar-edicao poppins-medium" @click="cancelarEdicao">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>

      <!-- ── Ações da fila (somente quando há fila) ── -->
      <div class="step-card queue-actions-card" v-if="listaProdutos.length > 0">
        <div class="queue-actions-row">
          <button class="footer-btn btn-clear poppins-medium" @click="confirmarLimpar">
            <span class="material-symbols-outlined">refresh</span>
            Limpar
          </button>
          <button
            class="footer-btn btn-submit poppins-semibold btn-submit-ready"
            :disabled="loading"
            @click="cadastrarProdutos"
          >
            <ion-spinner name="crescent" v-if="loading" style="width:18px;height:18px;"></ion-spinner>
            <span class="material-symbols-outlined" v-else>send</span>
            {{ loading ? 'Enviando...' : `Cadastrar ${listaProdutos.length > 1 ? listaProdutos.length + ' produtos' : 'produto'}` }}
          </button>
        </div>
      </div>

      <!-- Espaço para safe-area no fim -->
      <div style="height: 180px;"></div>

    </ion-content>

    <!-- ══ MODAL: FILA DE PRODUTOS ══ -->
    <ion-modal :is-open="modalFilaAberta" @did-dismiss="modalFilaAberta = false" class="bottom-sheet fila-modal">
      <ion-content class="modal-content">
        <div class="modal-handle"></div>
        <div class="modal-box">
          <div class="modal-header">
            <div style="display:flex;align-items:center;gap:8px;">
              <span class="material-symbols-outlined" style="color:#ff8049;font-size:20px;">inventory_2</span>
              <span class="poppins-semibold">Fila de cadastro</span>
              <span class="fila-count-chip poppins-medium">{{ listaProdutos.length }}</span>
            </div>
            <button class="modal-close" @click="modalFilaAberta = false">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <!-- Paginação info -->
          <div class="fila-pagination-info poppins-regular" v-if="listaProdutos.length > filaPorPagina">
            Mostrando {{ filaInicioExibicao + 1 }}–{{ Math.min(filaInicioExibicao + filaPorPagina, listaProdutos.length) }} de {{ listaProdutos.length }}
          </div>

          <div class="modal-body fila-modal-body">
            <div
              v-for="(p, i) in produtosPaginados"
              :key="filaInicioExibicao + i"
              :class="['fila-item', { 'fila-item-editing': modoEdicao === (filaInicioExibicao + i) }]"
            >
              <div class="fila-item-num poppins-medium">{{ filaInicioExibicao + i + 1 }}</div>
              <div class="fila-item-info">
                <span class="fila-item-nome poppins-semibold">{{ p.nome }}</span>
                <div class="fila-item-meta poppins-regular">
                  <span class="mono">{{ p.codigo_barra || '—' }}</span>
                  <span class="meta-sep">·</span>
                  <span>R$ {{ Number(p.preco_custo).toFixed(2) }}</span>
                  <template v-if="p.margem">
                    <span class="meta-sep">·</span>
                    <span class="margem-chip poppins-medium">{{ p.margem }}%</span>
                    <span class="meta-sep">→</span>
                    <span>R$ {{ calcularVenda(p).toFixed(2) }}</span>
                  </template>
                </div>
                <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:3px;">
                  <span class="fila-item-cat poppins-regular" v-if="p.categoria">{{ p.categoria }}</span>
                  <span class="badge-xml poppins-regular" v-if="xmlFileName">via XML</span>
                </div>
              </div>
              <div class="fila-item-actions">
                <button class="icon-btn edit" @click="editarProdutoDaFila(filaInicioExibicao + i)">
                  <span class="material-symbols-outlined">edit</span>
                </button>
                <button class="icon-btn del" @click="removerProduto(filaInicioExibicao + i)">
                  <span class="material-symbols-outlined">delete</span>
                </button>
              </div>
            </div>

            <!-- Empty state -->
            <div class="fila-empty" v-if="listaProdutos.length === 0">
              <span class="material-symbols-outlined fila-empty-icon">inventory_2</span>
              <span class="poppins-regular">Nenhum produto na fila</span>
            </div>
          </div>

          <!-- Paginação controles -->
          <div class="fila-pagination" v-if="listaProdutos.length > filaPorPagina">
            <button
              class="pag-btn poppins-medium"
              :disabled="filaPagina === 0"
              @click="filaPagina--"
            >
              <span class="material-symbols-outlined">chevron_left</span>
            </button>
            <span class="pag-info poppins-regular">
              Pág. {{ filaPagina + 1 }} / {{ totalPaginas }}
            </span>
            <button
              class="pag-btn poppins-medium"
              :disabled="filaPagina >= totalPaginas - 1"
              @click="filaPagina++"
            >
              <span class="material-symbols-outlined">chevron_right</span>
            </button>
          </div>

          <div class="modal-footer">
            <button class="action-btn btn-outline poppins-medium full-w" @click="modalFilaAberta = false">Fechar</button>
            <button
              class="action-btn btn-primary poppins-semibold full-w"
              :disabled="loading"
              @click="() => { modalFilaAberta = false; cadastrarProdutos(); }"
            >
              <ion-spinner name="crescent" v-if="loading" style="width:16px;height:16px;"></ion-spinner>
              <span class="material-symbols-outlined" v-else>send</span>
              Cadastrar todos
            </button>
          </div>
        </div>
      </ion-content>
    </ion-modal>

    <!-- ══ MODAL: SEM CONEXÃO ══ -->
    <ion-modal :is-open="modalSemConexao" @did-dismiss="modalSemConexao = false" class="bottom-sheet">
      <ion-content class="modal-content">
        <div class="modal-handle"></div>
        <div class="modal-box">
          <div class="modal-header">
            <span class="poppins-semibold">Sem conexão</span>
            <button class="modal-close" @click="modalSemConexao = false">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="offline-icon-wrap">
              <span class="material-symbols-outlined offline-icon-main">wifi_off</span>
              <span class="offline-icon-pulse"></span>
            </div>
            <p class="offline-title poppins-semibold">Ops… sem conexão!</p>
            <p class="offline-subtitle poppins-regular">
              Você está sem internet ou nosso servidor está temporariamente fora do ar.
              Seus dados estão seguros.
            </p>
            <div class="offline-summary">
              <div class="offline-row">
                <span class="material-symbols-outlined" style="color:#ff8049;font-size:16px;">inventory_2</span>
                <span class="poppins-regular">{{ listaProdutos.length }} produto(s) preenchido(s)</span>
              </div>
              <div class="offline-row">
                <span class="material-symbols-outlined" style="color:#ff8049;font-size:16px;">store</span>
                <span class="poppins-regular">Fornecedor: <strong>{{ fornecedor_selecionado.nome_fornecedor || '—' }}</strong></span>
              </div>
              <div class="offline-row">
                <span class="material-symbols-outlined" style="color:#ff8049;font-size:16px;">badge</span>
                <span class="poppins-regular">CNPJ: <strong>{{ fornecedor_selecionado.cnpj || '—' }}</strong></span>
              </div>
            </div>
            <div class="offline-tip poppins-regular">
              <span class="material-symbols-outlined" style="font-size:16px;color:#1a56db;vertical-align:middle;margin-right:6px;">info</span>
              Baixe um XML de backup. Quando a conexão voltar, importe-o em <strong>"Importar via XML"</strong> para cadastrar rapidamente.
            </div>
          </div>
          <div class="modal-footer">
            <button class="action-btn btn-outline poppins-medium full-w" @click="modalSemConexao = false">Fechar</button>
            <button class="action-btn btn-primary poppins-semibold full-w" @click="baixarXMLBackup">
              <span class="material-symbols-outlined">download</span> Baixar backup XML
            </button>
          </div>
        </div>
      </ion-content>
    </ion-modal>

    <!-- ══ MODAL: CONFIRMAR LIMPAR ══ -->
    <ion-modal :is-open="modalConfirmarLimpar" @did-dismiss="modalConfirmarLimpar = false" class="bottom-sheet">
      <ion-content class="modal-content">
        <div class="modal-handle"></div>
        <div class="modal-box">
          <div class="modal-header">
            <span class="poppins-semibold">Limpar tudo?</span>
            <button class="modal-close" @click="modalConfirmarLimpar = false">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <div class="modal-body">
            <p class="poppins-regular" style="color:#64748b;font-size:14px;line-height:1.6;">
              Isso irá remover todos os {{ listaProdutos.length }} produto(s) da fila, o fornecedor selecionado e o XML importado. Esta ação não pode ser desfeita.
            </p>
          </div>
          <div class="modal-footer">
            <button class="action-btn btn-outline poppins-medium full-w" @click="modalConfirmarLimpar = false">Cancelar</button>
            <button class="action-btn btn-danger poppins-semibold full-w" style="background-color: #ff8049;" @click="limparTudo">
              <span class="material-symbols-outlined">delete_sweep</span> Limpar tudo
            </button>
          </div>
        </div>
      </ion-content>
    </ion-modal>

    <!-- ══ TOASTS ══ -->
    <transition-group name="toast" tag="div" class="toast-container">
      <div v-for="t in toasts" :key="t.id" :class="['toast-item', t.type, 'poppins-medium']">
        <span class="material-symbols-outlined">{{ t.type === 'success' ? 'check_circle' : t.type === 'error' ? 'error' : 'info' }}</span>
        {{ t.message }}
      </div>
    </transition-group>

  </ion-page>
</template>

<script>
import { IonPage, IonContent, IonSpinner, IonModal } from '@ionic/vue';
import { api } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import { mapState } from 'pinia';
import exibeErro from '@/utils/ExibeErro';
import { XMLParser } from 'fast-xml-parser';

const produtoEmBranco = () => ({
  nome            : null,
  codigo_barra    : null,
  preco_custo     : null,
  margem          : null,
  categoria       : null,
  busca_rapida    : null,
  ncm             : null,
  cest            : null,
  origem          : null,
  gondula_loja    : null,
  gondula_estoque : null,
  ajuste_automatico: false,
  controle_lote   : false,
});

export default {
  name: 'CadastroProdutosCotacaoMobile',
  components: { IonPage, IonContent, IonSpinner, IonModal },

  data() {
    return {
      loading              : false,
      auth                 : null,
      tentouAdicionar      : false,
      modoEdicao           : null,
      showScanner          : false,
      showOpcionais        : false,
      showFornecedorList   : false,
      touchedFornecedor    : false,
      xmlFileName          : null,
      modalSemConexao      : false,
      modalConfirmarLimpar : false,
      modalFilaAberta      : false,
      mostrarBannerFila    : false,
      toasts               : [],
      toastId              : 0,

      // Paginação da fila no modal
      filaPagina    : 0,
      filaPorPagina : 5,

      fornecedores          : [],
      fornecedoresFiltrados : [],

      fornecedor_selecionado : { nome_fornecedor: null, cnpj: null },
      formProduto            : produtoEmBranco(),
      listaProdutos          : [],
    };
  },

  computed: {
    ...mapState(useAuthStore, ['id_loja']),

    precoVendaForm() {
      const custo  = parseFloat(this.formProduto.preco_custo);
      const margem = parseFloat(this.formProduto.margem);
      if (!custo || isNaN(margem)) return null;
      return (custo * (margem / 100 + 1)).toFixed(2);
    },

    fornecedorOk() {
      return !!(this.fornecedor_selecionado.nome_fornecedor);
    },

    camposAdicionaisPreenchidos() {
      const p = this.formProduto;
      const f = this.fornecedor_selecionado;
      return [
        p.margem, p.categoria, p.busca_rapida, p.ncm, p.cest,
        p.origem, p.gondula_loja, p.gondula_estoque,
        f.nome_fornecedor, f.cnpj
      ].filter(v => v !== null && v !== '').length;
    },

    totalPaginas() {
      return Math.ceil(this.listaProdutos.length / this.filaPorPagina);
    },

    filaInicioExibicao() {
      return this.filaPagina * this.filaPorPagina;
    },

    produtosPaginados() {
      return this.listaProdutos.slice(
        this.filaInicioExibicao,
        this.filaInicioExibicao + this.filaPorPagina
      );
    },
  },

  methods: {
    // ── Toasts ──────────────────────────────────────────────────
    showToast(message, type = 'info') {
      const id = ++this.toastId;
      this.toasts.push({ id, message, type });
      setTimeout(() => { this.toasts = this.toasts.filter(t => t.id !== id); }, 3500);
    },

    // ── Fornecedor ───────────────────────────────────────────────
    filtrarFornecedores() {
      const q = (this.fornecedor_selecionado.nome_fornecedor || '').toLowerCase();
      if (!q) { this.fornecedoresFiltrados = []; this.showFornecedorList = false; return; }
      this.fornecedoresFiltrados = this.fornecedores
        .filter(f => f.nome_fornecedor.toLowerCase().includes(q))
        .slice(0, 6);
      this.showFornecedorList = this.fornecedoresFiltrados.length > 0;
    },

    selecionarFornecedor(f) {
      this.fornecedor_selecionado.nome_fornecedor = f.nome_fornecedor;
      this.fornecedor_selecionado.cnpj            = f.cnpj;
      this.showFornecedorList = false;
      this.fornecedoresFiltrados = [];
    },

    limparFornecedor() {
      this.fornecedor_selecionado = { nome_fornecedor: null, cnpj: null };
      this.showFornecedorList = false;
    },

    // ── Scanner (stub) ───────────────────────────────────────────
    abrirScanner()  { this.showScanner = true; },
    fecharScanner() { this.showScanner = false; },

    // ── Formulário produto ───────────────────────────────────────
    adicionarProduto() {
      this.tentouAdicionar = true;
      if (!this.formProduto.nome || !this.formProduto.codigo_barra || !this.formProduto.preco_custo) {
        this.showToast('Preencha nome, código de barras e preço de custo.', 'error');
        return;
      }

      const produto = { ...this.formProduto };
      Object.keys(produto).forEach(k => {
        if (produto[k] === null || produto[k] === '') delete produto[k];
      });

      if (this.modoEdicao !== null) {
        this.listaProdutos.splice(this.modoEdicao, 1, produto);
        this.modoEdicao = null;
        this.showToast('Produto atualizado com sucesso.', 'success');
      } else {
        this.listaProdutos.push(produto);

        // Se há XML ativo, significa que o usuário está adicionando manualmente à fila do XML
        if (this.xmlFileName) {
          this.mostrarBannerFila = true;
          this.showToast(`"${produto.nome}" adicionado à fila.`, 'info');
        } else if (this.listaProdutos.length === 1) {
          // Primeiro produto sem XML: cadastra direto (sem fila visual)
          // — mas o produto ainda fica em listaProdutos para o botão "Cadastrar"
          this.showToast(`"${produto.nome}" pronto para cadastro.`, 'success');
        } else {
          // Mais de um produto sem XML: mantém na fila
          this.mostrarBannerFila = true;
          this.showToast(`"${produto.nome}" adicionado à fila.`, 'info');
        }
      }

      this.formProduto     = produtoEmBranco();
      this.tentouAdicionar = false;
      this.showOpcionais   = false;
    },

    editarProduto(i) {
      this.formProduto     = { ...produtoEmBranco(), ...this.listaProdutos[i] };
      this.modoEdicao      = i;
      this.tentouAdicionar = false;
      this.showOpcionais   = true;
      setTimeout(() => {
        const el = document.querySelector('.step-editing');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    },

    editarProdutoDaFila(i) {
      this.modalFilaAberta = false;
      setTimeout(() => this.editarProduto(i), 300);
    },

    cancelarEdicao() {
      this.modoEdicao      = null;
      this.formProduto     = produtoEmBranco();
      this.tentouAdicionar = false;
      this.showOpcionais   = false;
    },

    removerProduto(i) {
      const nome = this.listaProdutos[i].nome;
      this.listaProdutos.splice(i, 1);
      if (this.modoEdicao === i) this.cancelarEdicao();
      // Ajusta paginação se necessário
      if (this.filaPagina >= this.totalPaginas && this.filaPagina > 0) {
        this.filaPagina--;
      }
      if (this.listaProdutos.length === 0) this.mostrarBannerFila = false;
      this.showToast(`"${nome}" removido da fila.`, 'info');
    },

    calcularVenda(p) {
      return Number(p.preco_custo) * (Number(p.margem) / 100 + 1);
    },

    // ── Cadastrar ────────────────────────────────────────────────
    async cadastrarProdutos() {
      if (this.listaProdutos.length === 0) {
        this.showToast('Adicione ao menos um produto antes de enviar.', 'info');
        return;
      }

      this.loading = true;
      try {
        const payload = {
          id_loja   : this.auth.loja.id_loja,
          id_usuario: this.auth.user?.id || this.auth.id_usuario,
          cnpj      : this.fornecedor_selecionado.cnpj,
          produtos  : this.listaProdutos,
        };

        await api.post('/mvpu/produto/cadastroProduto', payload);
        this.showToast(`${this.listaProdutos.length} produto(s) cadastrado(s) com sucesso!`, 'success');
        setTimeout(() => this.limparTudo(), 1500);

      } catch (e) {
        if (!navigator.onLine || e?.code === 'ERR_NETWORK') {
          this.modalSemConexao = true;
        } else {
          exibeErro(e, this.$toast);
        }
      } finally {
        this.loading = false;
      }
    },

    // ── XML ──────────────────────────────────────────────────────
    onFileChange(event) {
      const file = event.target.files[0];
      if (file) this.processarArquivoXML(file);
    },

    processarArquivoXML(file) {
      if (!file.name.endsWith('.xml')) {
        this.showToast('Somente arquivos .xml são aceitos.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => this.lerXML(e.target.result, file.name);
      reader.readAsText(file);
    },

    lerXML(xmlString, fileName) {
      const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' });
      try {
        const json    = parser.parse(xmlString);
        const infoNFe = json?.nfeProc?.NFe?.infNFe || json?.NFe?.infNFe;

        if (!infoNFe?.det) {
          this.showToast('XML inválido ou sem produtos.', 'error');
          return;
        }

        const nomeFornecedor = infoNFe?.emit?.xNome || null;
        const cnpjFornecedor = infoNFe?.emit?.CNPJ  || infoNFe?.emit?.CPF || null;
        if (nomeFornecedor || cnpjFornecedor) {
          this.fornecedor_selecionado.nome_fornecedor = nomeFornecedor;
          this.fornecedor_selecionado.cnpj            = cnpjFornecedor;
        }

        const itens = Array.isArray(infoNFe.det) ? infoNFe.det : [infoNFe.det];

        this.listaProdutos = itens.map((element) => {
          const prod       = element.prod || {};
          const qCom       = parseFloat(prod.qCom || 1);
          const qTrib      = parseFloat(prod.qTrib || 1);
          const fator      = qTrib > qCom ? Math.round(qTrib / qCom) : 1;
          const precoCusto = parseFloat(prod.vUnCom || 0);

          const produto = {
            nome            : prod.xProd             || null,
            codigo_barra    : String(prod.cEAN || ''),
            preco_custo     : precoCusto,
            margem          : prod.xPed_margem          || null,
            categoria       : prod.xPed_categoria       || null,
            busca_rapida    : prod.xPed_busca_rapida    || null,
            ncm             : prod.NCM  ? String(prod.NCM)  : null,
            cest            : prod.CEST ? String(prod.CEST) : null,
            origem          : prod.orig ? String(prod.orig) : null,
            gondula_loja    : prod.xPed_gondula_loja    || null,
            gondula_estoque : prod.xPed_gondula_estoque || null,
            ajuste_automatico: false,
            controle_lote   : false,
            _quantidade_unit: fator,
          };

          Object.keys(produto).forEach(k => {
            if (produto[k] === null || produto[k] === '') delete produto[k];
          });

          return produto;
        });

        this.xmlFileName = fileName;
        this.mostrarBannerFila = true;
        this.filaPagina = 0;
        this.showToast(`${this.listaProdutos.length} produto(s) importado(s) do XML!`, 'success');

      } catch (error) {
        this.showToast('Erro ao processar o arquivo XML.', 'error');
      }
    },

    limparXML() {
      this.xmlFileName        = null;
      this.listaProdutos      = [];
      this.mostrarBannerFila  = false;
      if (this.$refs.xmlInput) this.$refs.xmlInput.value = '';
      this.showToast('Arquivo XML removido.', 'info');
    },

    // ── Backup XML offline ───────────────────────────────────────
    baixarXMLBackup() {
      const f         = this.fornecedor_selecionado;
      const agora     = new Date();
      const timestamp = agora.toISOString().replace(/[:.]/g, '-').slice(0, 19);

      const itens = this.listaProdutos.map((p, idx) => {
        const n = idx + 1;
        return `
    <det nItem="${n}">
      <prod>
        <cEAN>${p.codigo_barra || ''}</cEAN>
        <xProd>${this.escapeXml(p.nome || '')}</xProd>
        <NCM>${p.ncm || ''}</NCM>
        <CEST>${p.cest || ''}</CEST>
        <orig>${p.origem || '0'}</orig>
        <uCom>UN</uCom>
        <qCom>1.0000</qCom>
        <vUnCom>${Number(p.preco_custo || 0).toFixed(4)}</vUnCom>
        <qTrib>1.0000</qTrib>
        <uTrib>UN</uTrib>
        <vUnTrib>${Number(p.preco_custo || 0).toFixed(4)}</vUnTrib>${p.margem ? `\n        <xPed_margem>${p.margem}</xPed_margem>` : ''}${p.categoria ? `\n        <xPed_categoria>${this.escapeXml(p.categoria)}</xPed_categoria>` : ''}${p.busca_rapida ? `\n        <xPed_busca_rapida>${this.escapeXml(p.busca_rapida)}</xPed_busca_rapida>` : ''}${p.gondula_loja ? `\n        <xPed_gondula_loja>${this.escapeXml(p.gondula_loja)}</xPed_gondula_loja>` : ''}${p.gondula_estoque ? `\n        <xPed_gondula_estoque>${this.escapeXml(p.gondula_estoque)}</xPed_gondula_estoque>` : ''}
      </prod>
    </det>`;
      }).join('');

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Backup gerado em ${agora.toLocaleString('pt-BR')} -->
<nfeProc>
  <NFe>
    <infNFe>
      <emit>
        <CNPJ>${f.cnpj || ''}</CNPJ>
        <xNome>${this.escapeXml(f.nome_fornecedor || '')}</xNome>
      </emit>${itens}
    </infNFe>
  </NFe>
</nfeProc>`;

      const blob = new Blob([xml], { type: 'application/xml;charset=utf-8;' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `backup_cadastro_${timestamp}.xml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      this.showToast('Backup XML baixado com sucesso.', 'success');
      this.modalSemConexao = false;
    },

    escapeXml(str) {
      return String(str)
        .replace(/&/g,  '&amp;')
        .replace(/</g,  '&lt;')
        .replace(/>/g,  '&gt;')
        .replace(/"/g,  '&quot;')
        .replace(/'/g,  '&apos;');
    },

    // ── Reset ────────────────────────────────────────────────────
    confirmarLimpar() {
      if (this.listaProdutos.length === 0 && !this.fornecedor_selecionado.nome_fornecedor) {
        this.showToast('Nada para limpar.', 'info');
        return;
      }
      this.modalConfirmarLimpar = true;
    },

    limparTudo() {
      this.listaProdutos            = [];
      this.formProduto              = produtoEmBranco();
      this.fornecedor_selecionado   = { nome_fornecedor: null, cnpj: null };
      this.modoEdicao               = null;
      this.tentouAdicionar          = false;
      this.xmlFileName              = null;
      this.showOpcionais            = false;
      this.touchedFornecedor        = false;
      this.modalSemConexao          = false;
      this.modalConfirmarLimpar     = false;
      this.mostrarBannerFila        = false;
      this.filaPagina               = 0;
      if (this.$refs.xmlInput) this.$refs.xmlInput.value = '';
    },

    async getFornecedores() {
      try {
        const res = await api.get(`/mvpu/produto/consultarFornecedores/${this.auth.loja.id_loja}`);
        this.fornecedores = res.data.data || [];
      } catch (e) {
        exibeErro(e, this.$toast);
      }
    },
  },

  mounted() {
    this.auth = useAuthStore();
    this.getFornecedores();
  },
};
</script>

<style scoped>
/* ══ VARIÁVEIS ══ */
:root {
  --primary:       #ff8049;
  --primary-light: rgba(255,128,73,.10);
  --primary-mid:   rgba(255,128,73,.20);
  --success:       #10b981;
  --error:         #ef4444;
  --info:          #3b82f6;
  --warning:       #f59e0b;
  --border:        #e2e8f0;
  --bg:            #f8fafc;
  --text:          #1e293b;
  --muted:         #64748b;
  --card-bg:       #ffffff;
}

/* ══ PAGE ══ */
.cpc-page    { --background: #f1f5f9; }
.cpc-content { --background: #f1f5f9; }

/* ══ HEADER ══ */
.cpc-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 16px 10px;
  background: #fff;
  border-bottom: 1px solid var(--border);
  position: sticky; top: 0; z-index: 100;
  gap: 8px;
}
.cpc-header-left { display: flex; align-items: center; gap: 10px; }
.back-btn {
  width: 36px; height: 36px; border-radius: 10px; border: none;
  background: var(--bg); display: flex; align-items: center; justify-content: center;
  cursor: pointer; flex-shrink: 0;
}
.back-btn span { font-size: 18px; color: var(--text); }
.page-identity { display: flex; flex-direction: column; }
.page-label { font-size: 10px; color: var(--muted); font-family: 'Poppins', sans-serif; font-weight: 500; letter-spacing: .08em; }
.page-name  { font-size: 15px; color: var(--text);  font-family: 'Poppins', sans-serif; font-weight: 600; line-height: 1.2; }

/* ══ QUEUE BADGE BUTTON ══ */
.queue-badge-btn {
  display: flex; align-items: center; gap: 5px;
  background: linear-gradient(135deg, #ff8049, #ff6030);
  color: #fff; border: none; border-radius: 20px;
  padding: 6px 12px 6px 8px;
  cursor: pointer; transition: all .2s;
  box-shadow: 0 3px 10px rgba(255,128,73,.35);
  font-family: 'Poppins', sans-serif;
  flex-shrink: 0;
}
.queue-badge-btn:active { transform: scale(.96); }
.queue-badge-btn .material-symbols-outlined { font-size: 16px; }
.queue-badge-count {
  background: rgba(255,255,255,.3); border-radius: 10px;
  padding: 1px 7px; font-size: 13px; font-weight: 700;
}
.queue-badge-label { font-size: 12px; font-weight: 500; }
.queue-eye { font-size: 16px; opacity: .85; }

/* ══ BANNER FILA ══ */
.queue-banner {
  display: flex; align-items: center; gap: 8px;
  background: #fffbeb; border-bottom: 1px solid #fde68a;
  padding: 10px 16px;
}
.queue-banner .material-symbols-outlined { font-size: 18px; color: #d97706; flex-shrink: 0; }
.queue-banner-text { flex: 1; font-size: 13px; color: #92400e; line-height: 1.4; }
.queue-banner-close { background: none; border: none; cursor: pointer; padding: 2px; display: flex; }
.queue-banner-close span { font-size: 18px; color: #92400e; }

/* slide-down transition */
.slide-down-enter-active, .slide-down-leave-active { transition: all .3s ease; overflow: hidden; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; max-height: 0; }
.slide-down-enter-to, .slide-down-leave-from { opacity: 1; max-height: 80px; }

/* ══ CARDS ══ */
.step-card {
  background: var(--card-bg); border-radius: 16px;
  margin: 12px 12px 0; padding: 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,.06);
}
.step-card.step-editing {
  border: 2px solid #ff8049;
  box-shadow: 0 0 0 4px rgba(255,128,73,.12);
}
.consult-card { padding: 0; overflow: hidden; }
.consult-btn {
  width: 100%; display: flex; align-items: center; gap: 8px;
  padding: 14px 16px; background: #fff; border: none;
  font-size: 14px; color: var(--text); cursor: pointer;
  font-family: 'Poppins', sans-serif;
}
.consult-btn .material-symbols-outlined:first-child { color: #ff8049; font-size: 18px; }
.consult-arrow { margin-left: auto; color: var(--muted); font-size: 20px; }

/* ══ QUEUE ACTIONS ══ */
.queue-actions-card { padding: 12px 16px; }
.queue-actions-row  { display: flex; gap: 10px; }

/* ══ STEP HEADER ══ */
.step-header { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
.step-num {
  width: 30px; height: 30px; border-radius: 10px;
  background: var(--bg); border: 1.5px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; color: var(--muted); font-weight: 700;
  flex-shrink: 0;
}
.step-num.done    { background: #ecfdf5; border-color: #10b981; color: #10b981; }
.step-num.editing { background: rgba(255,128,73,.1); border-color: #ff8049; color: #ff8049; }
.step-num.xml-step { background: rgba(255,128,73,.08); border-color: rgba(255,128,73,.3); color: #ff8049; }
.step-title { display: block; font-size: 15px; color: var(--text); line-height: 1.2; }
.step-sub   { display: block; font-size: 12px; color: var(--muted); margin-top: 1px; }
.optional-tag {
  font-size: 11px; color: var(--muted);
  background: var(--bg); border: 1px solid var(--border);
  border-radius: 8px; padding: 2px 8px; white-space: nowrap;
}

/* ══ XML STATES ══ */
.xml-hint { font-size: 13px; color: var(--muted); line-height: 1.5; margin: 0 0 12px; }
.xml-upload-btn {
  width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 13px; border-radius: 12px;
  border: 2px dashed var(--border); background: var(--bg);
  color: var(--muted); font-size: 14px; cursor: pointer;
  transition: all .2s; font-family: 'Poppins', sans-serif;
}
.xml-upload-btn:active { border-color: #ff8049; color: #ff8049; background: rgba(255,128,73,.06); }
.xml-upload-btn span { font-size: 20px; }
.xml-loaded-state { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.xml-loaded-top { display: flex; align-items: center; gap: 10px; }
.xml-ok-icon { font-size: 22px; color: #10b981; }
.xml-filename { display: block; font-size: 13px; color: var(--text); }
.xml-count    { display: block; font-size: 12px; color: var(--muted); }
.xml-remove-btn {
  display: flex; align-items: center; gap: 5px;
  padding: 7px 11px; border-radius: 10px;
  border: 1px solid #fee2e2; background: #fef2f2;
  color: #ef4444; font-size: 12px; cursor: pointer; white-space: nowrap;
  font-family: 'Poppins', sans-serif;
}
.xml-remove-btn span { font-size: 14px; }

/* ══ SECTION DIVIDER ══ */
.section-divider {
  display: flex; align-items: center; gap: 5px;
  font-size: 13px; color: var(--muted); letter-spacing: .06em; text-transform: uppercase;
  padding: 10px 0 8px;
  font-weight: 800;
  border-top: 1px solid var(--border);
  margin-top: 25px;
  margin-bottom: 6px;
}

/* ══ FORM ══ */
.fields-section-label {
  display: flex; align-items: center; gap: 5px;
  font-size: 13px; color: var(--muted); letter-spacing: .06em; text-transform: uppercase;
  font-weight: 800;
  margin-bottom: 10px;
}
.form-group  { display: flex; flex-direction: column; gap: 5px; margin-bottom: 10px; }
.form-row-2  { display: flex; flex-direction: column; width: 100%; }
.form-label  { font-size: 13px; color: var(--text); display: flex; align-items: center; gap: 6px; }
.req-star    { color: #ef4444; }
.optional-badge {
  font-size: 10px; color: var(--muted);
  background: var(--bg); border: 1px solid var(--border);
  border-radius: 6px; padding: 1px 6px;
}
.input-wrap {
  display: flex; align-items: center; gap: 6px;
  background: var(--bg); border: 1.5px solid var(--border);
  border-radius: 12px; padding: 10px 12px; transition: border-color .2s;
  position: relative;
}
.input-wrap:focus-within { border-color: #ff8049; background: #fff; }
.input-filled { border-color: #cbd5e1; background: #fff; }
.input-error  { border-color: #ef4444 !important; background: #fef2f2 !important; }
.input-disabled { opacity: .65; }
.input-icon { font-size: 17px; color: var(--muted); flex-shrink: 0; }
.form-input {
  flex: 1; border: none; background: transparent;
  font-size: 14px; color: var(--text); outline: none; min-width: 0;
  font-family: 'Poppins', sans-serif;
}
.form-input::placeholder { color: #94a3b8; }
.form-input.mono { font-family: 'Roboto Mono', monospace; letter-spacing: .02em; }
.input-action-btn {
  background: none; border: none; cursor: pointer; padding: 2px;
  display: flex; align-items: center; color: var(--muted);
}
.input-action-btn span { font-size: 17px; }
.scan-inline-btn {
  background: rgba(255,128,73,.1); border: none; cursor: pointer; padding: 4px 6px;
  border-radius: 8px; display: flex; align-items: center; color: #ff8049;
}
.scan-inline-btn span { font-size: 16px; }
.field-error { font-size: 11px; color: #ef4444; }

/* optional toggle */
.optional-toggle {
  display: flex; align-items: center; gap: 6px;
  font-size: 13px; color: var(--muted);
  background: none; border: none; cursor: pointer; padding: 8px 0;
  font-family: 'Poppins', sans-serif; width: 100%; text-align: left;
}
.optional-toggle span { font-size: 16px; color: #ff8049; }
.optional-count {
  margin-left: auto; font-size: 11px; font-weight: 600;
  background: rgba(255,128,73,.1); color: #ff8049;
  border-radius: 8px; padding: 2px 8px;
}
.optional-body { padding-top: 2px; }

/* autocomplete */
.catalogo-list {
  border: 1.5px solid var(--border); border-radius: 12px;
  overflow: hidden; margin-top: 4px; background: #fff;
  box-shadow: 0 4px 16px rgba(0,0,0,.08);
}
.catalogo-item {
  width: 100%; display: flex; align-items: center; justify-content: space-between;
  padding: 10px 12px; border: none; background: #fff; cursor: pointer;
  border-bottom: 1px solid var(--border); text-align: left;
}
.catalogo-item:last-child { border-bottom: none; }
.catalogo-item:active { background: var(--bg); }
.prod-name { display: block; font-size: 13px; color: var(--text); font-weight: 500; }
.prod-meta { display: block; font-size: 11px; color: var(--muted); font-family: 'Roboto Mono', monospace; margin-top: 2px; }

/* form actions */
.form-actions {
  display: flex; gap: 8px; margin-top: 14px;
}
.btn-adicionar {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 7px;
  padding: 14px; border-radius: 14px; border: none;
  background: #ff8049; color: #fff; font-size: 15px;
  cursor: pointer; transition: all .2s;
  font-family: 'Poppins', sans-serif;
  box-shadow: 0 4px 14px rgba(255,128,73,.3);
}
.btn-adicionar:active { background: #e06e3a; transform: scale(.98); }
.btn-adicionar span { font-size: 20px; }
.btn-cancelar-edicao {
  width: 48px; height: 48px; border-radius: 14px; border: 1.5px solid #e2e8f0;
  background: #f8fafc; color: var(--muted); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.btn-cancelar-edicao span { font-size: 20px; }

/* ══ FOOTER BTNS ══ */
.footer-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 14px 16px; border-radius: 14px; border: none;
  font-size: 14px; cursor: pointer; font-family: 'Poppins', sans-serif;
  transition: all .2s; white-space: nowrap; overflow: hidden;
  text-overflow: ellipsis; min-width: 0;
}
.btn-clear {
  background: var(--bg); color: var(--muted);
  border: 1.5px solid var(--border); flex-shrink: 0;
}
.btn-clear:active { background: var(--border); }
.btn-submit { flex: 1; justify-content: center; background: var(--border); color: var(--muted); }
.btn-submit-ready { background: #FF8049; color: #fff; box-shadow: 0 4px 16px rgba(255,128,73,.35); }
.btn-submit-ready:active { background: #e06e3a; }
.btn-submit:disabled { opacity: .6; }
.btn-submit span, .btn-clear span { font-size: 18px; }

/* ══ SCANNER ══ */
.scanner-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.87);
  z-index: 9999; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 24px;
}
.scanner-box { width: min(250px, 80vw); height: min(200px, 64vw); position: relative; }
.scanner-corner { position: absolute; width: 32px; height: 32px; border-color: #FF8049; border-style: solid; }
.scanner-corner.tl { top: 0; left: 0; border-width: 3px 0 0 3px; border-radius: 6px 0 0 0; }
.scanner-corner.tr { top: 0; right: 0; border-width: 3px 3px 0 0; border-radius: 0 6px 0 0; }
.scanner-corner.bl { bottom: 0; left: 0; border-width: 0 0 3px 3px; border-radius: 0 0 0 6px; }
.scanner-corner.br { bottom: 0; right: 0; border-width: 0 3px 3px 0; border-radius: 0 0 6px 0; }
.scanner-line { position: absolute; left: 0; right: 0; top: 50%; height: 2px; background: #FF8049; animation: scanLine 2s ease-in-out infinite; }
@keyframes scanLine { 0%, 100% { top: 10%; } 50% { top: 90%; } }
.scanner-hint { font-size: 14px; color: rgba(255,255,255,.8); font-family: 'Poppins', sans-serif; }
.scanner-cancel { background: rgba(255,255,255,.15); border: 1px solid rgba(255,255,255,.3); color: #fff; border-radius: 14px; padding: 12px 28px; font-size: 14px; display: flex; align-items: center; gap: 8px; cursor: pointer; font-family: 'Poppins', sans-serif; }
.scanner-cancel span { font-size: 18px; }

/* ══ MODAIS ══ */
ion-modal.bottom-sheet {
  --border-radius: 20px 20px 0 0;
  --box-shadow: 0 -4px 24px rgba(0,0,0,.1);
  align-items: flex-end;
  background-color: transparent;
}
ion-modal.fila-modal { --height: 85vh; }
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
.modal-body { padding: 10px 14px; }
.fila-modal-body { padding: 10px 14px; overflow-y: auto; }
.modal-footer { display: flex; gap: 10px; padding: 14px 18px; border-top: 1px solid #f1f5f9; flex-wrap: wrap; }

/* fila count chip */
.fila-count-chip {
  background: #ff8049; color: #fff;
  border-radius: 10px; padding: 1px 8px; font-size: 12px;
}

/* paginação */
.fila-pagination-info {
  font-size: 12px; color: var(--muted);
  padding: 6px 18px 0;
}
.fila-pagination {
  display: flex; align-items: center; justify-content: center; gap: 12px;
  padding: 10px 18px; border-top: 1px solid #f1f5f9;
}
.pag-btn {
  width: 36px; height: 36px; border-radius: 10px;
  border: 1.5px solid var(--border); background: var(--bg);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--text);
}
.pag-btn:disabled { opacity: .4; cursor: not-allowed; }
.pag-btn span { font-size: 20px; }
.pag-info { font-size: 13px; color: var(--muted); font-family: 'Poppins', sans-serif; }

/* ══ FILA ITEMS ══ */
.fila-item {
  display: flex; align-items: flex-start; gap: 8px;
  padding: 12px 0; border-bottom: 1px solid #f1f5f9;
}
.fila-item:last-child { border-bottom: none; }
.fila-item-editing { background: rgba(255,128,73,.06); border-radius: 10px; padding: 10px 8px; margin: -2px -8px; }
.fila-item-num {
  width: 22px; height: 22px; border-radius: 7px;
  background: var(--bg); border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; color: var(--muted); flex-shrink: 0; margin-top: 1px;
}
.fila-item-info { flex: 1; min-width: 0; overflow: hidden; }
.fila-item-nome { display: block; font-size: 13px; color: var(--text); font-family: 'Poppins', sans-serif; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.fila-item-meta {
  display: flex; flex-wrap: wrap; align-items: center; gap: 4px;
  font-size: 11px; color: var(--muted); font-family: 'Poppins', sans-serif;
  margin-top: 3px;
}
.meta-sep { color: var(--border); }
.margem-chip {
  background: rgba(255,128,73,.1); color: #FF8049;
  padding: 1px 6px; border-radius: 6px; font-size: 10px;
}
.fila-item-cat {
  font-size: 10px; color: var(--muted); font-family: 'Poppins', sans-serif;
  background: var(--bg); border: 1px solid var(--border);
  border-radius: 6px; padding: 1px 6px;
}
.fila-item-actions { display: flex; gap: 4px; flex-shrink: 0; padding-top: 1px; }
.icon-btn {
  width: 32px; height: 32px; border-radius: 8px; border: none;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all .2s;
}
.icon-btn span { font-size: 17px; }
.icon-btn.edit { background: rgba(59,130,246,.1); color: #3b82f6; }
.icon-btn.edit:active { background: #3b82f6; color: #fff; }
.icon-btn.del  { background: rgba(239,68,68,.1); color: #ef4444; }
.icon-btn.del:active { background: #ef4444; color: #fff; }
.badge-xml {
  font-size: 10px; background: rgba(255,128,73,.1); color: #ff8049;
  padding: 1px 6px; border-radius: 6px; font-family: 'Poppins', sans-serif;
}

/* fila empty */
.fila-empty {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 32px 0; color: var(--muted);
}
.fila-empty-icon { font-size: 40px; color: #cbd5e1; }

/* ══ ACTION BTNS ══ */
.action-btn {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  padding: 12px 16px; border-radius: 12px; border: none;
  font-size: 13px; cursor: pointer; font-family: 'Poppins', sans-serif;
  transition: all .2s; white-space: nowrap;
}
.action-btn.btn-outline  { background: var(--bg); color: var(--muted); border: 1.5px solid var(--border); }
.action-btn.btn-primary  { background: #FF8049; color: #fff; box-shadow: 0 4px 12px rgba(255,128,73,.3); }
.action-btn.btn-danger   { background: #ef4444; color: #fff; }
.action-btn.full-w { flex: 1; }
.action-btn span { font-size: 18px; }
@media (max-width: 360px) {
  .modal-footer { flex-direction: column; }
  .action-btn.full-w { flex: none; width: 100%; }
}

/* ══ OFFLINE MODAL ══ */
.offline-icon-wrap { position: relative; width: 70px; height: 70px; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; }
.offline-icon-main { font-size: 44px; color: #FF8049; }
.offline-icon-pulse { position: absolute; inset: 0; border-radius: 50%; background: rgba(255,128,73,.15); animation: pulseRing 2s ease-out infinite; }
@keyframes pulseRing { 0% { transform: scale(.8); opacity: .8; } 70% { transform: scale(1.3); opacity: 0; } 100% { transform: scale(1.3); opacity: 0; } }
.offline-title   { font-size: 17px; color: var(--text); font-family: 'Poppins', sans-serif; text-align: center; margin-bottom: 6px; }
.offline-subtitle { font-size: 13px; color: var(--muted); font-family: 'Poppins', sans-serif; text-align: center; line-height: 1.6; margin-bottom: 14px; }
.offline-summary { background: var(--bg); border: 1px solid var(--border); border-radius: 12px; padding: 12px 14px; display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
.offline-row { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text); font-family: 'Poppins', sans-serif; }
.offline-tip { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 11px 13px; font-size: 12px; color: #1e40af; line-height: 1.5; font-family: 'Poppins', sans-serif; }

/* ══ TOASTS ══ */
.toast-container {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10000;

  display: flex;
  flex-direction: column;
  gap: 8px;

  pointer-events: none;

  width: fit-content;
  max-width: 90vw;
}

.toast-item {
  display: flex; align-items: center; gap: 9px;
  padding: 12px 16px; border-radius: 14px;
  font-size: 13px; font-family: 'Poppins', sans-serif;
  box-shadow: 0 8px 24px rgba(0,0,0,.15);
  pointer-events: auto; word-break: break-word; overflow-wrap: anywhere;
}
.toast-item span { font-size: 18px; }
.toast-item.success { background: #10b981; color: #fff; }
.toast-item.error   { background: #ef4444; color: #fff; }
.toast-item.info    { background: #3b82f6; color: #fff; }
.toast-enter-active, .toast-leave-active { transition: all .3s ease; }
.toast-enter-from { opacity: 0; transform: translateY(20px); }
.toast-leave-to   { opacity: 0; transform: translateY(20px); }

/* ══ UTILITÁRIOS ══ */
.poppins-regular  { font-family: 'Poppins', sans-serif; font-weight: 400; }
.poppins-medium   { font-family: 'Poppins', sans-serif; font-weight: 500; }
.poppins-semibold { font-family: 'Poppins', sans-serif; font-weight: 600; }
.mono { font-family: 'Roboto Mono', monospace; }
</style>