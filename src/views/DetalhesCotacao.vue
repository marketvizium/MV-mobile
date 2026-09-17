<template>
  <ion-page class="quote-details-page">
    <ion-content :fullscreen="true">

      <RefresherIonic />

      <!-- PDF hidden container -->
      <div ref="reportContainer" v-show="false" class="pdf-container">
        <div class="pdf-header">
          <h1 class="brand-logo">Market<span>Vizium</span></h1>
          <p class="pdf-subtitle">Relatório de Cotação Profissional</p>
        </div>
        <table class="pdf-table">
          <thead>
            <tr>
              <th>EAN</th>
              <th>Produto</th>
              <th>Qtd</th>
              <th>Vl. Unit</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in mappedOrderItems" :key="item.ean">
              <td>{{ item.ean }}</td>
              <td class="product-name">{{ item.nome }}</td>
              <td>{{ item.detalhe_qtd }}</td>
              <td>R$ {{ item.preco_unitario }}</td>
              <td class="total-cell">R$ {{ item.total_item }}</td>
            </tr>
          </tbody>
        </table>
        <div class="pdf-footer">
          <p class="grand-total">Total Geral: <span>R$ {{ totalGeralFormatado }}</span></p>
        </div>
      </div>

      <div class="page-wrapper">

        <!-- Back -->
        <div class="back-btn" @click="$router.back()">
          <span class="material-symbols-outlined">arrow_back_ios</span>
          <span>Voltar</span>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="skeleton-list">
          <div v-for="i in 4" :key="i" class="skeleton-card"></div>
        </div>

        <!-- Waiting for store -->
        <div v-else-if="currentQuoteStatus === 'fechada' && status_fechamento !== 'concluido'" class="center-state">
          <div class="state-card">
            <div class="state-icon orange">
              <span class="material-symbols-outlined">hourglass_empty</span>
            </div>
            <h2>Loja preparando itens...</h2>
            <p>A loja ainda está adicionando os produtos a esta cotação. Por favor, retorne mais tarde.</p>
            <div class="date-pill">
              <span class="material-symbols-outlined">calendar_today</span>
              <span>Abertura prevista: {{ formatDate(currentQuoteData?.inicio_cotacao) }}</span>
            </div>
            <button class="btn-primary mt-16" @click="$router.back()">Voltar para Listagem</button>
          </div>
        </div>

        <!-- Finished order view -->
        <div v-else-if="status_fechamento === 'concluido'" class="finished-view">
          <div class="finished-header">
            <div class="success-chip">
              <span class="material-symbols-outlined">verified</span>
              PEDIDO SELECIONADO
            </div>
            <h1 class="quote-title">{{ currentQuoteData?.nome_cotacao }}</h1>
            <p class="quote-subtitle">Confira os itens ganhos e o resumo financeiro.</p>
          </div>

          <div class="stats-row">
            <div class="stat-box">
              <span class="stat-label">Total de Itens</span>
              <span class="stat-value">{{ totalItens }}</span>
            </div>
            <div class="stat-box accent">
              <span class="stat-label">Valor Total</span>
              <span class="stat-value">R$ {{ valorTotalFaturamento }}</span>
            </div>
          </div>

          <div v-if="possuiProdutosFaturamentoExtra" class="faturamento-extra-banner">
            <span style="font-size: 25px; margin-bottom: 3px;" class="material-symbols-outlined">local_atm</span>
            <span>ESSA COTAÇÃO POSSUI PRODUTOS EXTRAS FATURADOS, AQUELES QUE CONTER ESSE ÍCONE SÃO DE FATURAMENTO EXTRA</span>
          </div>

          <div class="table-card">
            <h3 class="table-title">Itens do Pedido</h3>
            <DataTable :value="produtos_selecionados" class="slim-table" responsiveLayout="scroll">
              <Column header="CÓDIGO">
                <template #body="s"><span class="cell-sm">{{ s.data.codigo_barra }}</span></template>
              </Column>
              <Column header="PRODUTO">
                <template #body="s"><span class="cell-sm"  >{{ s.data.nome }}</span></template>
              </Column>
              <Column header="QTD">
                <template #body="s"><span class="cell-sm">{{ s.data.quantidade_p }}</span></template>
              </Column>

              <Column header="TIPO">
                <template #body="s"><span class="cell-sm">{{ s.data.primeiro_tipo }}</span></template>
              </Column>

              <Column header="QTD POR EMB.">
                <template #body="s"><span class="cell-sm">{{ s.data.unid_comp_p || '--' }}</span></template>
              </Column>

              <Column header="UNIT.">
                <template #body="s">
                  <span v-if="isFaturamentoExtra(s.data)" class="cell-sm faturamento-extra-cell" title="Produto de faturamento extra (sem preço na cotação)">
                    <span class="material-symbols-outlined">local_atm</span>
                  </span>
                  <span v-else class="cell-sm">R$ {{ s.data.preco_unit_p }}</span>
                </template>
              </Column>
              <Column header="TOTAL">
                <template #body="s"><b class="cell-accent">R$ {{ s.data.qtd_total_oferta }}</b></template>
              </Column>
            </DataTable>
          </div>

          <div class="footer-actions">
            <button class="btn-primary" @click="exportToPDF">
              <span class="material-symbols-outlined">print</span>
              Imprimir Comprovante
            </button>
            <button class="btn-ghost" @click="$router.back()">Voltar para Listagem</button>
          </div>
        </div>

        <!-- ===================== MAIN QUOTE VIEW ===================== -->
        <div v-else class="quote-main">

          <!-- Header -->
          <div class="quote-header">
            <div>
              <h1 class="quote-title">{{ currentQuoteData?.nome_cotacao || 'Itens da Cotação' }}</h1>
              <span class="items-count">{{ items.length }} itens solicitados</span>
            </div>
            <div class="status-chip" :class="statusChipClass">
              <span class="material-symbols-outlined">{{ statusChipIcon }}</span>
              {{ statusChipLabel }}
            </div>
          </div>

          <transition name="fade-slide">
            <div v-if="currentQuoteData?.participando" class="participando-banner">
              <span class="participando-banner-icon">
                <span class="material-symbols-outlined">check_circle</span>
              </span>
              <span class="participando-banner-text">Você está participando dessa cotação</span>
            </div>
          </transition>

          <p v-if="currentQuoteStatus === 'finalizada'" class="closed-info">
            Cotação finalizada em {{ formatDate(currentQuoteData?.final_cotacao) }}. Apenas consulta.
          </p>
          <p v-else-if="currentQuoteStatus === 'fechada'" class="closed-info closed-info--unavailable">
            Esta cotação está indisponível no momento. Apenas consulta.
          </p>

          <!-- Progress bar -->
          <div class="progress-bar-wrap">
            <div class="progress-bar-track">
              <div class="progress-bar-fill" :style="{ width: progressPercent + '%' }"></div>
            </div>
            <span class="progress-label">{{ respondedCount }}/{{ combinedItems.length }}</span>
          </div>

          <!-- ===== PAGINATION HEADER ===== -->
          <div class="pagination-header">
            <div class="pagination-info">
              <span class="page-label">Página {{ currentPage }} de {{ totalPages }}</span>
              <span class="page-range">Itens {{ pageStartIndex + 1 }}–{{ pageEndIndex }} de {{ combinedItems.length }}</span>
            </div>
          </div>

          <!-- Consulta única: retrato parcial, separado do faturamento final. -->
          <section v-if="isQuoteOpen || resumoGanhando" class="winning-panel" aria-labelledby="winning-title" :aria-busy="carregandoGanhando">
            <div class="winning-heading">
              <span class="winning-icon material-symbols-outlined" aria-hidden="true">leaderboard</span>
              <div><span class="winning-eyebrow">SUA POSIÇÃO NA DISPUTA</span><h2 id="winning-title">O que você está ganhando</h2></div>
              <span class="winning-partial">Resultado parcial</span>
            </div>
            <div class="winning-warning">
              <span class="material-symbols-outlined" aria-hidden="true">info</span>
              <p><strong>Este NÃO é o faturamento final da cotação.</strong> É apenas o que você está ganhando no momento da consulta. O valor e os produtos estão sujeitos a alterações caso outro vendedor faça uma oferta melhor.</p>
            </div>
            <template v-if="!resumoGanhando">
              <p class="winning-once">Você pode consultar <strong>uma única vez por cotação</strong>. Ao clicar, sua consulta será registrada e não poderá ser atualizada.</p>
              <button class="winning-button" :disabled="carregandoGanhando || consultaGanhandoBloqueada || !isQuoteOpen" @click="visualizarGanhando">
                <span class="material-symbols-outlined" :class="{ spin: carregandoGanhando }" aria-hidden="true">{{ carregandoGanhando ? 'progress_activity' : 'visibility' }}</span>
                {{ carregandoGanhando ? 'Consultando sua posição…' : consultaGanhandoBloqueada ? 'Consulta já utilizada' : 'Visualizar o que estou ganhando' }}
              </button>
            </template>
            <p v-if="erroGanhando" class="winning-error" role="alert">{{ erroGanhando }}</p>
            <div v-if="resumoGanhando" class="winning-result" role="status" aria-live="polite">
              <div class="winning-stats">
                <div class="winning-total"><span>Valor total que você estava ganhando</span><strong>{{ moedaGanhando(resumoGanhando.valor_total_ganhando) }}</strong><small>Valor parcial · não representa venda confirmada</small></div>
                <div class="winning-count"><span>Produtos em vantagem</span><strong>{{ quantidadeProdutosGanhando }}</strong><small>no momento da consulta</small></div>
              </div>
              <div class="winning-legend"><span class="material-symbols-outlined" aria-hidden="true">check_circle</span><strong>Os produtos que você está ganhando estão em verde.</strong></div>
              <p class="winning-snapshot">Consulta única realizada {{ dataConsultaGanhando }}. Os destaques representam esse momento e não são atualizados após novas ofertas.</p>
              <div v-if="!resumoGanhando.produtos.length" class="winning-empty"><span class="material-symbols-outlined" aria-hidden="true">trending_up</span><div><strong>Nenhum produto em vantagem nesta consulta.</strong><p>Você ainda pode revisar suas ofertas enquanto a cotação estiver aberta.</p></div></div>
            </div>
          </section>

          <!-- ===== EXCEL ACTIONS ===== -->
          <div class="excel-actions" v-if="statusChipLabel == 'Aberta'" style="margin-bottom: 20px;">
            <button class="btn-excel-export" style="width: 100%; height: 50px;" @click="exportToExcel">
              <span class="material-symbols-outlined">download</span>
              Exportar Pedido (Excel)
            </button>
            <label class="btn-excel-import" style="width: 100%; height: 50px;">
              <span class="material-symbols-outlined">upload</span>
              Importar Respostas (Excel)
              <input type="file" accept=".xlsx,.xls" style="display:none" @change="importFromExcel" />
            </label>

            <!--
            
            <button class="btn-excel-import" style="color: #FF8049; border-color: #ff8049;" @click="AlterarBoleto">
              <span class="material-symbols-outlined">autorenew</span>
              Alterar prazos de boletos
              <input type="file" accept=".xlsx,.xls" style="display:none" />
            </button>
            -->
          </div>

          <!-- ════════════════════════════════════════════
               VISÃO MOBILE (< 992px) — lista de cards original
          ════════════════════════════════════════════ -->
          <div class="mobile-view">

          <!-- Items list (paginated) -->
          <div class="items-list" >
            <div
              v-for="item in paginatedItems"
              :key="item.id_solicitado"
              class="item-card"
              :class="{ 'is-answered': item.oferta_existente, 'is-saving': savingItems[item.id_solicitado], 'is-winning': produtoEstaGanhando(item) }"
            >
              <!-- Card Header -->
              <div class="card-head">
                <div class="card-head-left">
                  <div class="status-dot" :class="item.oferta_existente ? 'answered' : 'pending'"></div>
                  <div class="card-info">
                    <span class="ean-label">{{ item.codigo_barra }}</span>
                    <span class="prod-name">{{ item.nome }}</span>
                    <span v-if="produtoEstaGanhando(item)" class="winning-item-tag"><span class="material-symbols-outlined" aria-hidden="true">check_circle</span>Ganhando na consulta</span>
                    <div class="prod-meta">
                      <span>Qtd: <b>{{ item.quantidade }}</b></span>
                      <span>Tipo: <b>{{ item.tipo }}</b></span>
                      <span v-if="item.qtd_unitaria_composicao">Cx/Fd: <b>{{ item.qtd_unitaria_composicao }}</b></span>
                    </div>
                  </div>
                </div>
                <!-- Price display when answered -->
                <div class="price-badge" v-if="item.oferta_existente && !focusedItem[item.id_solicitado]">
                  <span class="price-value">R$ {{ formatPrice(tempOffers[item.id_solicitado]?.primeiro_preco) }}</span>
                  <button v-if="isQuoteOpen" class="clear-btn" @click.stop="clearOffer(item)" title="Remover oferta">
                    <span class="material-symbols-outlined">close</span>
                  </button>
                </div>
              </div>

              <!-- Price input row — always visible -->
              <div class="price-row" v-if="isQuoteOpen">
                <div class="price-input-wrap" :class="{ active: focusedItem[item.id_solicitado] }">
                  <span class="currency-symbol">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    class="price-input"
                    placeholder="0,00"
                    :value="tempOffers[item.id_solicitado]?.primeiro_preco || ''"
                    @focus="onPriceFocus(item.id_solicitado)"
                    @blur="onPriceBlur(item, $event)"
                    @keydown.enter="($event.target as HTMLInputElement).blur()"
                  />
                  <span v-if="savingItems[item.id_solicitado]" class="saving-spinner">
                    <span class="material-symbols-outlined spin">refresh</span>
                  </span>
                  <span v-else-if="item.oferta_existente" class="saved-check">
                    <span class="material-symbols-outlined">check_circle</span>
                  </span>
                </div>
              </div>

              <!-- Read-only price when closed -->
              <div class="price-row-readonly" v-else-if="item.oferta_existente">
                <span class="readonly-label">Preço ofertado:</span>
                <span class="readonly-price">R$ {{ formatPrice(tempOffers[item.id_solicitado]?.primeiro_preco) }}</span>
              </div>

              <!-- Expandable: Observação -->
              <div class="expandable" v-if="isQuoteOpen || tempOffers[item.id_solicitado]?.mensagem">
                <button
                  class="expand-toggle"
                  :class="{ active: expandedObs[item.id_solicitado] }"
                  @click="toggleObs(item.id_solicitado)"
                >
                  <span class="material-symbols-outlined">{{ expandedObs[item.id_solicitado] ? 'expand_less' : 'chat_bubble_outline' }}</span>
                  <span>{{ expandedObs[item.id_solicitado] ? 'Fechar' : 'Observação' }}</span>
                  <span v-if="tempOffers[item.id_solicitado]?.mensagem" class="obs-dot"></span>
                </button>

                <transition name="slide">
                  <div class="expand-body" v-if="expandedObs[item.id_solicitado]">
                    <textarea
                      class="obs-textarea"
                      v-model="tempOffers[item.id_solicitado].mensagem"
                      rows="2"
                      placeholder="Observação sobre esta oferta..."
                      :disabled="!isQuoteOpen"
                      @blur="debouncedSave(item)"
                    ></textarea>
                  </div>
                </transition>
              </div>
              

              <!-- Expandable: Produto Equivalente -->

              <!--
              <div class="expandable" v-if="isQuoteOpen">
                <button
                  class="expand-toggle"
                  :class="{ active: expandedEq[item.id_solicitado] }"
                  @click="toggleEq(item.id_solicitado)"
                >
                  <span class="material-symbols-outlined">{{ expandedEq[item.id_solicitado] ? 'expand_less' : 'swap_horiz' }}</span>
                  <span>{{ expandedEq[item.id_solicitado] ? 'Fechar' : 'Produto Equivalente' }}</span>
                  <span v-if="tempOffers[item.id_solicitado]?.segundo_preco" class="obs-dot"></span>
                </button>

                <transition name="slide">
                  <div class="expand-body eq-body" v-if="expandedEq[item.id_solicitado]">
                    <div class="eq-grid">
                      <div class="eq-field">
                        <label>Nome do produto</label>
                        <input type="text" v-model="tempOffers[item.id_solicitado].nome_equivalente" placeholder="Nome do equivalente" @blur="debouncedSave(item)" />
                      </div>
                      <div class="eq-field">
                        <label>Código de barras</label>
                        <input type="text" v-model="tempOffers[item.id_solicitado].codigo_barra" maxlength="13" placeholder="EAN 13" @blur="debouncedSave(item)" />
                      </div>
                      <div class="eq-field">
                        <label>Tipo</label>
                        <select v-model="tempOffers[item.id_solicitado].segundo_tipo" @change="debouncedSave(item)">
                          <option value="unidade">Unidade</option>
                          <option value="caixa">Caixa</option>
                        </select>
                      </div>
                      <div class="eq-field" v-if="tempOffers[item.id_solicitado].segundo_tipo !== 'unidade'">
                        <label>Qtd por caixa</label>
                        <input type="number" v-model.number="tempOffers[item.id_solicitado].segundo_unid_composicao" placeholder="0" @blur="debouncedSave(item)" />
                      </div>
                      <div class="eq-field">
                        <label>Preço unitário (R$)</label>
                        <input type="number" step="0.01" min="0" v-model.number="tempOffers[item.id_solicitado].segundo_preco" placeholder="0,00" @blur="debouncedSave(item)" />
                      </div>
                    </div>
                  </div>
                </transition>
              </div>
              -->

            </div>
          </div>

          <!-- ===== PAGINATION FOOTER ===== -->
          <div class="pagination-footer" style="margin-bottom: 100px;">
            <button
              class="nav-btn prev"
              :class="{ disabled: currentPage === 1 }"
              :disabled="currentPage === 1"
              @click="goToPage(currentPage - 1); scrollToTop()"
            >
              <span class="material-symbols-outlined">arrow_back_ios</span>
              Anterior
            </button>

            <div class="page-counter">
              <span class="page-counter-current">{{ currentPage }}</span>
              <span class="page-counter-sep">/</span>
              <span class="page-counter-total">{{ totalPages }}</span>
            </div>

            <button
              class="nav-btn next"
              :class="{ disabled: currentPage === totalPages }"
              :disabled="currentPage === totalPages"
              @click="goToPage(currentPage + 1); scrollToTop()"
            >
              Próxima
              <span class="material-symbols-outlined">arrow_forward_ios</span>
            </button>
          </div>

          </div>
          <!-- /.mobile-view -->

          <!-- ════════════════════════════════════════════
               VISÃO DESKTOP (>= 992px) — tabela no estilo
               de consoleCotacao.vue
          ════════════════════════════════════════════ -->
          <div class="desktop-view">

            <!-- Busca -->
            <div class="desktop-toolbar">
              <span class="desktop-search-wrap">
                <span class="material-symbols-outlined desktop-search-icon">search</span>
                <input
                  type="text"
                  v-model="searchQueryDesktop"
                  placeholder="Buscar por nome, código de barras ou tipo..."
                  class="desktop-search-input"
                />
              </span>
              <span class="desktop-results-count">{{ filteredItemsDesktop.length }} item(ns)</span>
            </div>

            <div v-if="filteredItemsDesktop.length === 0" class="empty-state-desktop">
              <span class="material-symbols-outlined" style="font-size:2.5rem;opacity:.3">search_off</span>
              <span>Nenhum item encontrado para esta busca.</span>
            </div>

            <div v-else class="produtos-table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Cód. Barras</th>
                    <th>Qtd</th>
                    <th>Tipo</th>
                    <th>Preço Ofertado</th>
                    <!--
                      <th>Equivalente</th>
                    -->
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in paginatedItemsDesktop"
                    :key="item.id_solicitado"
                    :class="{ 'produto-selecionado-auto': item.oferta_existente, 'is-winning': produtoEstaGanhando(item) }"
                  >
                    <td>
                      <div class="prod-cell">
                        <span class="prod-name">{{ item.nome }}</span>
                    <span v-if="produtoEstaGanhando(item)" class="winning-item-tag"><span class="material-symbols-outlined" aria-hidden="true">check_circle</span>Ganhando na consulta</span>
                      </div>
                    </td>
                    <td><span class="mono">{{ item.codigo_barra || item.codigo_barra_inex || 'Não cadastrado' }}</span></td>
                    <td><b>{{ item.quantidade || '--' }}</b></td>
                    <td>
                      <span class="type-tag" v-if="item.tipo">{{ item.tipo }}</span>
                      <span v-if="item.qtd_unitaria_composicao" class="comp-info"> · {{ item.qtd_unitaria_composicao }}un</span>
                      <span class="muted" v-if="!item.tipo && !item.qtd_unitaria_composicao">—</span>
                    </td>

                    <!-- Preço: editável quando aberta, somente leitura quando fechada/finalizada -->
                    <td>
                      <div
                        v-if="isQuoteOpen"
                        class="desktop-price-input-wrap"
                        :class="{ active: focusedItem[item.id_solicitado] }"
                      >
                        <span class="currency-symbol">R$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          class="desktop-price-input"
                          placeholder="0,00"
                          :value="tempOffers[item.id_solicitado]?.primeiro_preco || ''"
                          @focus="onPriceFocus(item.id_solicitado)"
                          @input="onDesktopPriceInput(item, $event)"
                          @blur="onPriceBlur(item, $event)"
                          @keydown.enter="($event.target as HTMLInputElement).blur()"
                        />
                        <span v-if="savingItems[item.id_solicitado]" class="saving-spinner">
                          <span class="material-symbols-outlined spin">refresh</span>
                        </span>
                        <span v-else-if="item.oferta_existente" class="saved-check">
                          <span class="material-symbols-outlined">check_circle</span>
                        </span>
                      </div>
                      <span v-else-if="item.oferta_existente" class="readonly-price">
                        R$ {{ formatPrice(tempOffers[item.id_solicitado]?.primeiro_preco) }}
                      </span>
                      <span v-else class="muted">—</span>
                    </td>

                    <!-- Produto Equivalente: chamada bem visível para abrir o modal -->
                     <!--
                     <td>
                       <button
                         v-if="isQuoteOpen"
                         class="equivalente-btn"
                         :class="{ filled: tempOffers[item.id_solicitado]?.segundo_preco }"
                         @click="abrirModalEquivalente(item)"
                         title="Adicionar produto equivalente"
                       >
                         <span class="material-symbols-outlined">swap_horiz</span>
                         <span v-if="tempOffers[item.id_solicitado]?.segundo_preco">Equivalente adicionado</span>
                         <span v-else>Adicionar equivalente</span>
                       </button>
                       <span v-else-if="tempOffers[item.id_solicitado]?.nome_equivalente" class="muted">
                         {{ tempOffers[item.id_solicitado]?.nome_equivalente }}
                       </span>
                       <span v-else class="muted">—</span>
                     </td>
                     -->

                    <td>
                      <div class="row-actions">
                        <button
                          v-if="isQuoteOpen"
                          class="icon-btn edit"
                          @click="abrirModalObservacao(item.id_solicitado)"
                          :title="tempOffers[item.id_solicitado]?.mensagem ? 'Editar observação' : 'Adicionar observação'"
                        >
                          <span class="material-symbols-outlined">chat_bubble_outline</span>
                        </button>
                        <button
                          v-if="isQuoteOpen && item.oferta_existente"
                          class="icon-btn del"
                          @click="clearOffer(item)"
                          title="Remover oferta"
                        >
                          <span class="material-symbols-outlined">close</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- ===== PAGINAÇÃO DA TABELA (máx. 10 por página) ===== -->
            <div class="desktop-pagination-footer" v-if="filteredItemsDesktop.length > 0">
              <span class="desktop-pagination-range">
                Itens {{ desktopPageStartIndex + 1 }}–{{ desktopPageEndIndex }} de {{ filteredItemsDesktop.length }}
              </span>

              <div class="pagination-footer" style="margin: 0;">
                <button
                  class="nav-btn prev"
                  :class="{ disabled: currentPageDesktop === 1 }"
                  :disabled="currentPageDesktop === 1"
                  @click="goToPageDesktop(currentPageDesktop - 1)"
                >
                  <span class="material-symbols-outlined">arrow_back_ios</span>
                  Anterior
                </button>

                <div class="page-counter">
                  <span class="page-counter-current">{{ currentPageDesktop }}</span>
                  <span class="page-counter-sep">/</span>
                  <span class="page-counter-total">{{ totalPagesDesktop }}</span>
                </div>

                <button
                  class="nav-btn next"
                  style="margin-left: 15px;"
                  :class="{ disabled: currentPageDesktop === totalPagesDesktop }"
                  :disabled="currentPageDesktop === totalPagesDesktop"
                  @click="goToPageDesktop(currentPageDesktop + 1)"
                >
                  Próxima
                  <span class="material-symbols-outlined">arrow_forward_ios</span>
                </button>
              </div>
            </div>

          </div>
          <!-- /.desktop-view -->

        </div>

      </div>

      <div class="bottom-spacer"></div>

      <!-- ════════════════════════════════════════════
           MODAL: Produto Equivalente (visão desktop)
      ════════════════════════════════════════════ -->
      <transition name="modal-fade">
        <div v-if="itemModalEquivalente" class="eq-modal-overlay" @click.self="fecharModalEquivalente">
          <div class="eq-modal-card">
            <div class="eq-modal-header">
              <div class="eq-modal-header-icon">
                <span class="material-symbols-outlined">swap_horiz</span>
              </div>
              <div class="eq-modal-header-text">
                <h2>Produto Equivalente</h2>
                <p>{{ itemModalEquivalente.nome }}</p>
              </div>
              <button class="eq-modal-close-btn" @click="fecharModalEquivalente">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            <div class="eq-modal-body">
              <div class="eq-grid">
                <div class="eq-field">
                  <label>Nome do produto</label>
                  <input type="text" v-model="tempOffers[itemModalEquivalente.id_solicitado].nome_equivalente" placeholder="Nome do equivalente" />
                </div>
                <div class="eq-field">
                  <label>Código de barras</label>
                  <input type="text" v-model="tempOffers[itemModalEquivalente.id_solicitado].codigo_barra" maxlength="13" placeholder="EAN 13" />
                </div>
                <div class="eq-field">
                  <label>Tipo</label>
                  <select v-model="tempOffers[itemModalEquivalente.id_solicitado].segundo_tipo">
                    <option value="unidade">Unidade</option>
                    <option value="caixa">Caixa</option>
                  </select>
                </div>
                <div class="eq-field" v-if="tempOffers[itemModalEquivalente.id_solicitado].segundo_tipo !== 'unidade'">
                  <label>Qtd por caixa</label>
                  <input type="number" v-model.number="tempOffers[itemModalEquivalente.id_solicitado].segundo_unid_composicao" placeholder="0" />
                </div>
                <div class="eq-field">
                  <label>Preço unitário (R$)</label>
                  <input type="number" step="0.01" min="0" v-model.number="tempOffers[itemModalEquivalente.id_solicitado].segundo_preco" placeholder="0,00" />
                </div>
              </div>
            </div>

            <div class="eq-modal-footer">
              <button class="btn-ghost-modal" @click="fecharModalEquivalente">Cancelar</button>
              <button class="btn-entendi-modal" @click="salvarModalEquivalente">
                Salvar Equivalente
                <span class="material-symbols-outlined">check</span>
              </button>
            </div>
          </div>
        </div>
      </transition>

      <!-- ════════════════════════════════════════════
           MODAL: Observação (visão desktop)
      ════════════════════════════════════════════ -->
      <transition name="modal-fade">
        <div v-if="obsAtivoDesktop" class="eq-modal-overlay" @click.self="fecharModalObservacao">
          <div class="eq-modal-card">
            <div class="eq-modal-header">
              <div class="eq-modal-header-icon">
                <span class="material-symbols-outlined">chat_bubble_outline</span>
              </div>
              <div class="eq-modal-header-text">
                <h2>Observação</h2>
                <p>{{ obsItemAtivoNome }}</p>
              </div>
              <button class="eq-modal-close-btn" @click="fecharModalObservacao">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            <div class="eq-modal-body">
              <textarea
                class="obs-textarea"
                v-model="tempOffers[obsAtivoDesktop].mensagem"
                rows="4"
                placeholder="Observação sobre esta oferta..."
              ></textarea>
            </div>

            <div class="eq-modal-footer">
              <button class="btn-ghost-modal" @click="fecharModalObservacao">Cancelar</button>
              <button class="btn-entendi-modal" @click="salvarModalObservacao">
                Salvar Observação
                <span class="material-symbols-outlined">check</span>
              </button>
            </div>
          </div>
        </div>
      </transition>


      <!--
      <ModalBoletos
        v-model="abrirModalBoletos"
        :id-loja="idLoja"
        :id-cotacao="idCotacao"
        :id-vendedor="idVendedor"
        @salvo="aoSalvarBoleto"
      />

      <ModalBoletosAtualiza
        v-model="abrirModalBoletosAtualiza"
        :id-loja="idLoja"
        :id-cotacao="idCotacao"
        :id-vendedor="idVendedor"
        @salvo="aoSalvarBoleto"
      />
      -->

    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonPage, IonContent } from '@ionic/vue';
import { api } from '@/services/api';

import Tag from 'primevue/tag';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Skeleton from 'primevue/skeleton';

import { jsPDF } from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";
import RefresherIonic from '@/components/refresherIonic.vue';
import { useAuthStore } from '@/stores/auth';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
//import ModalBoletos from '@/components/modalBoletos.vue';
//import ModalBoletosAtualiza from '@/components/modalBoletosAtualiza.vue';

const ITEMS_PER_PAGE = 10;

export default defineComponent({
  name: 'QuoteDetailsPage',
  components: {
    IonPage, IonContent, Tag, Button, DataTable, Column, Skeleton, RefresherIonic, 
    //ModalBoletos, ModalBoletosAtualiza
  },
  data() {
    return {
      carregandoGanhando: false,
      consultasGanhando: {} as Record<string, { resumo?: any; bloqueada?: boolean; erro?: string }>,
      loading: true,
      items: [] as any[],
      offers: [] as any[],
      currentQuoteData: null as any,
      currentQuoteStatus: 'aberta' as string,
      id_loja: null as string | null,
      id_cotacao: null as string | null,
      status_fechamento: null as string | null,
      nome_fantasia: null as string | null,
      razao_social: null as string | null,
      pageActive: false,
      produtos_selecionados: [] as any[],
      tempOffers: {} as Record<string, any>,
      valorTotalFaturamento: null as any,
      totalItens: null as any,
      // UX state
      focusedItem: {} as Record<string, boolean>,
      savingItems: {} as Record<string, boolean>,
      expandedObs: {} as Record<string, boolean>,
      expandedEq: {} as Record<string, boolean>,
      saveTimers: {} as Record<string, any>,
      // Pagination
      currentPage: 1,
      itemsPerPage: ITEMS_PER_PAGE,
      abrirModalBoletos: false,
      abrirModalBoletosAtualiza: false,
      idLoja: null,
      idCotacao: null,
      idVendedor: null,

      // ── Campos exclusivos da visão desktop (>= 992px) ──────────────
      searchQueryDesktop: '',
      obsAtivoDesktop: null as string | null,
      itemModalEquivalente: null as any,
      currentPageDesktop: 1,
      itemsPerPageDesktop: 10,
    };
  },
  computed: {
    chaveConsultaGanhando(): string {
      return JSON.stringify([this.idVendedor, this.id_loja, this.id_cotacao]);
    },
    resumoGanhando(): any {
      return this.consultasGanhando[this.chaveConsultaGanhando]?.resumo || null;
    },
    consultaGanhandoBloqueada(): boolean {
      return !!this.consultasGanhando[this.chaveConsultaGanhando]?.bloqueada;
    },
    erroGanhando(): string {
      return this.consultasGanhando[this.chaveConsultaGanhando]?.erro || '';
    },
    idsProdutosGanhando(): Set<string> {
      return new Set((this.resumoGanhando?.produtos || []).map((p: any) => this.normalizarIdentificador(p.id_produto)).filter(Boolean));
    },
    barrasProdutosGanhando(): Set<string> {
      return new Set((this.resumoGanhando?.produtos || []).map((p: any) => this.normalizarIdentificador(p.codigo_barra)).filter(Boolean));
    },
    quantidadeProdutosGanhando(): number {
      return this.resumoGanhando?.quantidade_produtos_ganhando ?? this.idsProdutosGanhando.size;
    },
    dataConsultaGanhando(): string {
      const timestamp = Number(this.resumoGanhando?.visualizado_em);
      return Number.isFinite(timestamp) && timestamp > 0
        ? new Date(timestamp).toLocaleString('pt-BR') : 'nesta sessão';
    },
    isQuoteOpen(): boolean {
      return this.currentQuoteStatus === 'aberta';
    },
    statusChipLabel(): string {
      const map: Record<string, string> = {
        aberta: 'Aberta',
        fechada: 'Indisponível',
        finalizada: 'Finalizada',
      };
      return map[this.currentQuoteStatus] || this.currentQuoteStatus;
    },
    statusChipClass(): string {
      const map: Record<string, string> = {
        aberta: 'open',
        fechada: 'unavailable',
        finalizada: 'closed',
      };
      return map[this.currentQuoteStatus] || 'closed';
    },
    statusChipIcon(): string {
      const map: Record<string, string> = {
        aberta: 'lock_open',
        fechada: 'block',
        finalizada: 'lock',
      };
      return map[this.currentQuoteStatus] || 'lock';
    },
    combinedItems(): any[] {
      return this.items.map(item => {
        const offer = this.offers.find(o => o.id_solicitado === item.id_solicitado);
        return {
          ...item,
          submitting: false,
          oferta_existente: offer || null
        };
      });
    },
    respondedCount(): number {
      return this.combinedItems.filter(i => i.oferta_existente).length;
    },
    progressPercent(): number {
      if (!this.combinedItems.length) return 0;
      return Math.round((this.respondedCount / this.combinedItems.length) * 100);
    },
    totalPages(): number {
      return Math.ceil(this.combinedItems.length / this.itemsPerPage);
    },
    pageStartIndex(): number {
      return (this.currentPage - 1) * this.itemsPerPage;
    },
    pageEndIndex(): number {
      return Math.min(this.currentPage * this.itemsPerPage, this.combinedItems.length);
    },
    paginatedItems(): any[] {
      return this.combinedItems.slice(this.pageStartIndex, this.pageEndIndex);
    },
    mappedOrderItems(): any[] {
      return this.offers.map(offer => {
        const itemOrigin = this.items.find(i => i.id_solicitado === offer.id_solicitado);
        const ean = offer.codigo_barra || itemOrigin?.codigo_barra || 'N/A';
        const nome = itemOrigin?.nome || 'Produto';
        const precoUn = offer.primeiro_preco || offer.segundo_preco || 0;
        const tipo = offer.primeiro_tipo || itemOrigin?.tipo || 'unidade';
        let qtd = itemOrigin?.quantidade || 0;
        let composicao = itemOrigin?.qtd_unitaria_composicao || 1;
        let total = (tipo === 'caixa' || tipo === 'fardo') ? (precoUn * composicao) * qtd : precoUn * qtd;
        return {
          ean, nome,
          detalhe_qtd: `${qtd}`,
          composicaoQtd: itemOrigin?.qtd_unitaria_composicao != null ? composicao : '--',
          preco_unitario: precoUn.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
          total_item: total.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
          raw_total: total
        };
      });
    },
    totalGeralFormatado(): string {
      const total = this.mappedOrderItems.reduce((acc, curr) => acc + curr.raw_total, 0);
      return total.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    },

    // ── Produtos de faturamento extra (sem preço definido na cotação) ──
    possuiProdutosFaturamentoExtra(): boolean {
      return (this.produtos_selecionados || []).some((p: any) => this.isFaturamentoExtra(p));
    },

    // ── Computeds exclusivos da visão desktop (>= 992px) ────────────
    itemsById(): Record<string, any> {
      const map: Record<string, any> = {};
      this.combinedItems.forEach(item => { map[item.id_solicitado] = item; });
      return map;
    },
    filteredItemsDesktop(): any[] {
      const query = this.searchQueryDesktop.trim().toLowerCase();
      if (!query) return this.combinedItems;
      return this.combinedItems.filter(item => {
        const nome = (item.nome || '').toLowerCase();
        const ean = (item.codigo_barra || '').toLowerCase();
        const tipo = (item.tipo || '').toLowerCase();
        return nome.includes(query) || ean.includes(query) || tipo.includes(query);
      });
    },
    obsItemAtivoNome(): string {
      const item = this.itemsById[this.obsAtivoDesktop as string];
      return item ? item.nome : '';
    },
    totalPagesDesktop(): number {
      return Math.max(1, Math.ceil(this.filteredItemsDesktop.length / this.itemsPerPageDesktop));
    },
    desktopPageStartIndex(): number {
      return (this.currentPageDesktop - 1) * this.itemsPerPageDesktop;
    },
    desktopPageEndIndex(): number {
      return Math.min(this.currentPageDesktop * this.itemsPerPageDesktop, this.filteredItemsDesktop.length);
    },
    paginatedItemsDesktop(): any[] {
      return this.filteredItemsDesktop.slice(this.desktopPageStartIndex, this.desktopPageEndIndex);
    }
  },
  watch: {
    searchQueryDesktop() {
      this.currentPageDesktop = 1;
    }
  },
  methods: {
    normalizarIdentificador(valor: unknown): string {
      return valor == null ? '' : String(valor).trim();
    },
    produtoEstaGanhando(item: any): boolean {
      if (!this.resumoGanhando) return false;
      const id = this.normalizarIdentificador(item.id_produto);
      const barras = [item.codigo_barra, item.codigo_barra_inex, item.oferta_existente?.codigo_barra]
        .map(this.normalizarIdentificador).filter(Boolean);
      return (!!id && this.idsProdutosGanhando.has(id)) || barras.some(barra => this.barrasProdutosGanhando.has(barra));
    },
    moedaGanhando(valor: unknown): string {
      return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    },
    async visualizarGanhando() {
      if (this.carregandoGanhando || this.resumoGanhando || this.consultaGanhandoBloqueada || !this.isQuoteOpen) return;
      const chave = this.chaveConsultaGanhando;
      if (!this.id_loja || !this.id_cotacao) {
        this.consultasGanhando[chave] = { erro: 'Não foi possível identificar a loja e a cotação. Reabra os detalhes.' };
        return;
      }
      this.carregandoGanhando = true;
      this.consultasGanhando[chave] = {};
      try {
        const { data } = await api.get(`/mvpu/cotacao/visualizarGanhando/${encodeURIComponent(this.id_loja)}/${encodeURIComponent(this.id_cotacao)}`);
        // Suporta tanto { body: { data } } quanto { data }.
        const envelope = data?.body ?? data;
        if (String(envelope?.COD) === '1430') {
          this.consultasGanhando[chave] = { bloqueada: true, erro: 'Você já utilizou a consulta única desta cotação. Não é possível consultar novamente.' };
          return;
        }
        if (Number(data?.status) >= 400) {
          throw new Error(envelope?.MSG || 'Não foi possível consultar sua posição.');
        }
        const resumo = envelope?.data;
        if (!Array.isArray(resumo?.produtos) || resumo.valor_total_ganhando == null || resumo.valor_total_ganhando === '' || !Number.isFinite(Number(resumo.valor_total_ganhando))) {
          this.consultasGanhando[chave] = { bloqueada: true, erro: 'O servidor respondeu sem um resumo válido. A consulta pode ter sido registrada; entre em contato com o suporte.' };
          return;
        }
        this.consultasGanhando[chave] = { resumo, bloqueada: true };
      } catch (erro: any) {
        const envelope = erro.response?.data?.body ?? erro.response?.data;
        const jaConsultou = String(envelope?.COD) === '1430';
        this.consultasGanhando[chave] = {
          bloqueada: jaConsultou,
          erro: jaConsultou
            ? 'Você já utilizou a consulta única desta cotação. O resultado anterior não está disponível nesta sessão.'
            : envelope?.MSG || (erro.response ? 'Não foi possível consultar sua posição. Tente novamente.' : 'Não foi possível receber o resultado. A consulta pode ter sido registrada pelo servidor; uma nova tentativa não garante uma nova consulta.')
        };
      } finally {
        this.carregandoGanhando = false;
      }
    },
    // ===== PAGINATION =====
    goToPage(page: number) {
      if (page < 1 || page > this.totalPages) return;
      this.currentPage = page;
      // Scroll to top of content when navigating pages
      const content = document.querySelector('ion-content');
      if (content) (content as any).scrollToTop(300);
    },

    /** Returns items for a given page number */
    getPageItems(page: number): any[] {
      const start = (page - 1) * this.itemsPerPage;
      const end = Math.min(page * this.itemsPerPage, this.combinedItems.length);
      return this.combinedItems.slice(start, end);
    },

    /** True if ALL items on this page have been answered */
    isPageFullyAnswered(page: number): boolean {
      const pageItems = this.getPageItems(page);
      return pageItems.length > 0 && pageItems.every(i => i.oferta_existente);
    },

    /** True if SOME (but not all) items on this page have been answered */
    isPagePartiallyAnswered(page: number): boolean {
      const pageItems = this.getPageItems(page);
      return pageItems.some(i => i.oferta_existente) && !this.isPageFullyAnswered(page);
    },

    /** Abre a página do último item respondido na ordem da lista. */
    autoNavigateToLastAnsweredPage() {
      const pageOfLastAnswer = (items: any[], pageSize: number): number => {
        for (let index = items.length - 1; index >= 0; index--) {
          if (items[index].oferta_existente) {
            return Math.floor(index / pageSize) + 1;
          }
        }
        return 1;
      };

      this.currentPage = pageOfLastAnswer(this.combinedItems, this.itemsPerPage);
      // No desktop, a posição deve respeitar a busca que está sendo exibida.
      this.currentPageDesktop = pageOfLastAnswer(this.filteredItemsDesktop, this.itemsPerPageDesktop);
    },

    // ===== EXISTING METHODS =====
    formatPrice(val: any): string {
      if (val == null || val === '') return '--';
      return Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    },
    toggleObs(id: string) {
      this.expandedObs[id] = !this.expandedObs[id];
    },
    toggleEq(id: string) {
      this.expandedEq[id] = !this.expandedEq[id];
    },

    // ── Métodos exclusivos da visão desktop (>= 992px) ──────────────
    onDesktopPriceInput(item: any, event: Event) {
      const val = parseFloat((event.target as HTMLInputElement).value);
      if (this.tempOffers[item.id_solicitado]) {
        this.tempOffers[item.id_solicitado].primeiro_preco = isNaN(val) ? null : val;
      }
    },
    abrirModalObservacao(id: string) {
      this.obsAtivoDesktop = id;
    },
    fecharModalObservacao() {
      this.obsAtivoDesktop = null;
    },
    salvarModalObservacao() {
      if (!this.obsAtivoDesktop) return;
      const item = this.itemsById[this.obsAtivoDesktop];
      this.obsAtivoDesktop = null;
      if (item) this.debouncedSave(item);
    },
    abrirModalEquivalente(item: any) {
      this.itemModalEquivalente = item;
    },
    fecharModalEquivalente() {
      this.itemModalEquivalente = null;
    },
    salvarModalEquivalente() {
      if (!this.itemModalEquivalente) return;
      const item = this.itemModalEquivalente;
      this.itemModalEquivalente = null;
      this.debouncedSave(item);
    },
    goToPageDesktop(page: number) {
      if (page < 1 || page > this.totalPagesDesktop) return;
      this.currentPageDesktop = page;
    },
    onPriceFocus(id: string) {
      this.focusedItem[id] = true;
    },
    onPriceBlur(item: any, event: FocusEvent) {
      this.focusedItem[item.id_solicitado] = false;
      const val = parseFloat((event.target as HTMLInputElement).value);
      if (!isNaN(val) && val > 0) {
        this.tempOffers[item.id_solicitado].primeiro_preco = val;
        this.triggerAutoSave(item);
      }
    },
    triggerAutoSave(item: any) {
      const id = item.id_solicitado;
      if (this.saveTimers[id]) clearTimeout(this.saveTimers[id]);
      this.saveTimers[id] = setTimeout(() => {
        this.saveOffer(item);
      }, 600);
    },
    debouncedSave(item: any) {
      this.triggerAutoSave(item);
    },
    async clearOffer(item: any) {
      if (!this.isQuoteOpen) return;
      if (!confirm('Remover esta oferta?')) return;
      try {
        
        const payload = {
          arrayDeletados: [item.oferta_existente.id_oferta],
          id_cotacao: parseInt(this.id_cotacao as string)
        };
        await api.delete(`/mvpu/cotacao/removerOferta/${this.id_loja}`, { data: payload });
        await this.fetchAllData();

      } catch (err) {
        alert('Erro ao remover');
      }
    },
    async saveOffer(item: any) {
      if (!this.isQuoteOpen) return;
      const id = item.id_solicitado;
      const currentTempOffer = { ...this.tempOffers[id] };

      // Clean internal keys
      delete currentTempOffer.preco_custo;
      delete currentTempOffer.tipo;
      delete currentTempOffer.qtd_unitaria_composicao;

      const hasPrice =
        (currentTempOffer.primeiro_preco && currentTempOffer.primeiro_preco > 0) ||
        (currentTempOffer.segundo_preco && currentTempOffer.segundo_preco > 0);
      const hasMensagem = currentTempOffer.mensagem && currentTempOffer.mensagem.trim() !== '';

      if (!hasPrice && !hasMensagem) return;

      this.savingItems[id] = true;

      try {
        const responseEmpresas = await api.get('/mvpu/usuario/operacoesEmpresaVendedor/');
        const empresas = responseEmpresas.data?.data || [];

        if (empresas.length === 0) {
          this.$toast.add({ severity: 'warn', summary: 'Sem empresas cadastradas', detail: 'Cadastre uma empresa representante para enviar uma oferta', life: 3000 });
          return;
        }

        const empresaSelecionada = empresas.find((e: any) => e.selecionada);
        if (!empresaSelecionada) {
          this.$toast.add({ severity: 'warn', summary: 'Nenhuma empresa selecionada', detail: 'Selecione uma empresa representante para continuar', life: 3000 });
          return;
        }

        currentTempOffer['cnpj_representa_vendedor'] = empresaSelecionada.cnpj;

        // Find oferta_existente from current combinedItems
        const oferta = this.offers.find(o => o.id_solicitado === id);

        // Se o vendedor ainda não possuía nenhuma oferta nesta cotação e este item
        // também não tinha oferta, esta será a sua primeira participação na cotação.
        const eraPrimeiraOferta = !oferta && this.offers.length === 0;

        if (oferta) {
          const payload = { atualizar: [{ ...currentTempOffer, id_oferta: oferta.id_oferta }] };

          payload.atualizar.forEach((prod)=>{
            prod['id_vendedor'] = {}
          })
          await api.put(`/mvpu/cotacao/atualizarOferta/${this.id_loja}/${this.id_cotacao}`, payload);

        } else {
          const payload = { ofertas: [currentTempOffer], id_cotacao: parseInt(this.id_cotacao as string) };
          await api.post(`/mvpu/cotacao/adicionarOfeta/${this.id_loja}`, payload);

          try{
              const [resList, resItems, resOffers] = await Promise.all([
                api.get(`/mvpu/cotacao/vendedorGetCotacoes/${this.id_loja}`),
                api.get(`/mvpu/cotacao/donoGetCotacoes/${this.id_loja}/${this.id_cotacao}`),
                api.get(`/mvpu/cotacao/consultarOfertas/${this.id_loja}/${this.id_cotacao}`)
              ]);

              const cotacoes = resList.data.data || [];
              this.currentQuoteData = cotacoes.find((c: any) => c.id_cotacao == this.id_cotacao);
              if (this.currentQuoteData) this.currentQuoteStatus = this.currentQuoteData.status_cotacao;



              this.items = resItems.data.data || [];
              this.offers = resOffers.data.data || [];

              // Primeira oferta enviada com sucesso nesta cotação: avisa o vendedor
              // que ele agora está participando.
              if (eraPrimeiraOferta && this.offers.length > 0) {
                this.$toast.add({
                  severity: 'success',
                  summary: 'Participando da cotação',
                  detail: 'Agora você está participando da cotação',
                  life: 4000
                });
              }

              const newTempOffers: Record<string, any> = {};
              this.items.forEach(item => {
                const offer = this.offers.find(o => o.id_solicitado === item.id_solicitado);
                newTempOffers[item.id_solicitado] = offer
                  ? { ...offer }
                  : {
                      id_solicitado: item.id_solicitado,
                      primeiro_quantidade: item.quantidade,
                      preco_custo: item.preco_custo,
                      tipo: item.tipo,
                      qtd_unitaria_composicao: item.qtd_unitaria_composicao,
                      primeiro_preco: null,
                      primeiro_tipo: 'unidade',
                      primeiro_unid_composicao: null,
                      nome_equivalente: '',
                      codigo_barra: '',
                      segundo_quantidade: null,
                      segundo_preco: null,
                      segundo_tipo: 'unidade',
                      segundo_unid_composicao: null,
                      mensagem: ''
                    };
              });
              this.tempOffers = newTempOffers;
          }catch(e){
            this.$toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao consultar oferta', life: 3000 });
          }

        }

        //await this.fetchAllData();
      } catch (err) {
        this.$toast.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível salvar a oferta', life: 3000 });
      } finally {
        this.savingItems[id] = false;
      }
    },

    async AlterarBoleto(){
      this.abrirModalBoletosAtualiza = true
    },

    async fetchAllData() {
      this.loading = true;
      try {
        const [resList, resItems, resOffers] = await Promise.all([
          api.get(`/mvpu/cotacao/vendedorGetCotacoes/${this.id_loja}`),
          api.get(`/mvpu/cotacao/donoGetCotacoes/${this.id_loja}/${this.id_cotacao}`),
          api.get(`/mvpu/cotacao/consultarOfertas/${this.id_loja}/${this.id_cotacao}`)
        ]);

        const cotacoes = resList.data.data || [];
        this.currentQuoteData = cotacoes.find((c: any) => c.id_cotacao == this.id_cotacao);
        if (this.currentQuoteData) this.currentQuoteStatus = this.currentQuoteData.status_cotacao;

        if(this.currentQuoteData.status_cotacao == 'aberta') this.abrirModalBoletos = true


        this.items = resItems.data.data || [];
        this.offers = resOffers.data.data || [];

        const newTempOffers: Record<string, any> = {};
        this.items.forEach(item => {
          const offer = this.offers.find(o => o.id_solicitado === item.id_solicitado);
          newTempOffers[item.id_solicitado] = offer
            ? { ...offer }
            : {
                id_solicitado: item.id_solicitado,
                primeiro_quantidade: item.quantidade,
                preco_custo: item.preco_custo,
                tipo: item.tipo,
                qtd_unitaria_composicao: item.qtd_unitaria_composicao,
                primeiro_preco: null,
                primeiro_tipo: 'unidade',
                primeiro_unid_composicao: null,
                nome_equivalente: '',
                codigo_barra: '',
                segundo_quantidade: null,
                segundo_preco: null,
                segundo_tipo: 'unidade',
                segundo_unid_composicao: null,
                mensagem: ''
              };
        });
        this.tempOffers = newTempOffers;

        // Após carregar produtos e ofertas, retoma a página do último respondido.
        this.$nextTick(() => {
          this.autoNavigateToLastAnsweredPage();
        });
      } catch (err) {
        this.$toast.add({ severity: 'error', summary: 'Erro ao buscar dados', detail: 'Tente novamente em instantes.', life: 3000 });
      } finally {
        this.loading = false;
      }
    },

    formatDate(timestamp: any) {
      if (!timestamp) return '--/--/----';
      return new Date(parseInt(timestamp)).toLocaleString('pt-BR');
    },

    // Produto sem preço unitário definido na cotação = faturamento extra
    isFaturamentoExtra(produto: any): boolean {
      const preco = produto?.preco_unit_p;
      return preco === null || preco === undefined || preco === '' || isNaN(Number(preco)) || Number(preco) === 0;
    },

    async montarDocumento() {
      try {
        this.totalItens = 0;
        this.valorTotalFaturamento = 0;
        const produtos = await api.get(`/mvpu/cotacao/buscarProdutosCotados/${this.id_loja}/${this.id_cotacao}`);
        this.produtos_selecionados = produtos.data?.data;
        this.produtos_selecionados.forEach((prod: any) => {
          this.totalItens += (prod.quantidade_p * (prod.unid_comp_p || 1));
          this.valorTotalFaturamento += Number(prod.qtd_total_oferta) || 0;
        });
      } catch (e) {
        this.$toast.add({ severity: 'error', summary: 'Erro ao buscar produtos', detail: 'Aguarde um momento...', life: 3000 });
      }
    },

    async exportToPDF() {
      this.loading = true;
      try {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const primaryColor: [number, number, number] = [255, 128, 73];
        const secondaryColor: [number, number, number] = [30, 41, 59];
        const lightGray: [number, number, number] = [100, 116, 139];
        const borderColor: [number, number, number] = [226, 232, 240];

        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        const textMarket = "Market ";
        const textVizium = "Vizium";
        const marketWidth = doc.getTextWidth(textMarket);
        const viziumWidth = doc.getTextWidth(textVizium);
        let startX = (pageWidth - marketWidth - viziumWidth) / 2;
        doc.setTextColor(85, 85, 85);
        doc.text(textMarket, startX, 25);
        doc.setTextColor(...primaryColor);
        doc.text(textVizium, startX + marketWidth, 25);

        doc.setDrawColor(...borderColor);
        doc.line(15, 35, pageWidth - 15, 35);
        doc.setFontSize(8);
        doc.setTextColor(...lightGray);
        doc.setFont("helvetica", "bold");
        doc.text("RESULTADO DA COTAÇÃO", 15, 42);

        const agora = new Date();

        const dataHora = agora.toLocaleString('pt-BR', {
          timeZone: 'America/Sao_Paulo',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });

        doc.text(`EMITIDO EM: ${dataHora}`, pageWidth - 15, 42, { align: "right" });

        doc.setFontSize(10);
        doc.setTextColor(...secondaryColor);
        doc.text("Resumo do Pedido", 15, 52);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...lightGray);
        doc.text(`NOME DA COTAÇÃO: ${this.currentQuoteData?.nome_cotacao || 'COTAÇÃO'}`, 15, 58);
        doc.text(`NOME FANTASIA: ${this.nome_fantasia || 'N/A'}`, 15, 63);
        doc.text(`RAZÃO SOCIAL: ${this.razao_social || 'N/A'}`, 15, 68);

        let tableStartY = 75;
        if (this.possuiProdutosFaturamentoExtra) {
          doc.setFontSize(7.5);
          doc.setTextColor(...primaryColor);
          doc.setFont("helvetica", "bold");
          doc.text("ESSA COTAÇÃO POSSUI PRODUTOS EXTRAS FATURADOS (MARCADOS COMO \"FAT. EXTRA\" NA COLUNA UNIT.)", 15, tableStartY);
          tableStartY += 6;
        }

        const formatMoeda = (v: any) => {
          const n = Number(v);
          return isNaN(n) ? '0.00' : n.toFixed(2);
        };

        const tableBody = this.produtos_selecionados.map(item => [
          item.codigo_barra,
          { content: item.nome, styles: { fontStyle: 'bold', textColor: [30, 41, 59] } },
          item.quantidade_p,
          item.unid_comp_p,
          item.primeiro_tipo,
          this.isFaturamentoExtra(item) ? 'FAT. EXTRA' : `R$ ${formatMoeda(item.preco_unit_p)}`,
          `R$ ${formatMoeda(item.qtd_total_oferta)}`
        ]);

        autoTable(doc, {
          startY: tableStartY,
          head: [['CÓD. BARRA', 'NOME PROD.', 'QTD.','QTD. POR EMB.', 'TIPO', 'UNIT.', 'SUBTOTAL']],
          body: tableBody,
          theme: 'plain',
          headStyles: { fillColor: [255, 255, 255], textColor: secondaryColor, fontStyle: 'bold', fontSize: 7, cellPadding: { top: 5, bottom: 5, left: 2, right: 2 } },
          styles: { font: "helvetica", fontSize: 9, cellPadding: 4, textColor: [51, 65, 85], lineWidth: 0 },
          columnStyles: { 0: { cellWidth: 35, fontSize: 8, textColor: lightGray }, 5: { halign: 'right', fontStyle: 'bold', textColor: secondaryColor } },
          didDrawCell: (data: any) => {
            if (data.section === 'body') {
              doc.setDrawColor(...borderColor);
              doc.setLineWidth(0.1);
              doc.line(data.cell.x, data.cell.y + data.cell.height, data.cell.x + data.cell.width, data.cell.y + data.cell.height);
            }
          }
        });

        const finalY = (doc as any).lastAutoTable.finalY + 15;
        doc.setFillColor(252, 253, 255);
        doc.setDrawColor(...borderColor);
        doc.roundedRect(pageWidth - 85, finalY - 5, 70, 22, 2, 2, 'FD');
        doc.setFontSize(8);
        doc.setTextColor(...lightGray);
        doc.setFont("helvetica", "bold");
        doc.text("VALOR TOTAL", pageWidth - 80, finalY + 3);
        doc.setFontSize(15);
        doc.setTextColor(...primaryColor);
        doc.text(`R$ ${this.valorTotalFaturamento.toFixed(2)}`, pageWidth - 20, finalY + 13, { align: "right" });

        const footerY = pageHeight - 12;
        doc.setFontSize(7);
        doc.setTextColor(...lightGray);
        doc.setFont("helvetica", "normal");
        doc.text("Documento gerado pela plataforma MarketVizium.", 15, footerY);
        doc.text(`Página ${doc.internal.getNumberOfPages()}`, pageWidth - 15, footerY, { align: "right" });
        const pdfFileName = `MarketVizium_Cotacao_${new Date().toISOString().split('T')[0]}.pdf`;

        if (Capacitor.isNativePlatform()) {
          // Mesmo motivo do Excel: doc.save() usa o download do navegador,
          // que não existe no WebView nativo. Gravamos via Filesystem e
          // abrimos a folha de compartilhamento nativa.
          const pdfBase64 = doc.output('datauristring').split(',')[1];

          const result = await Filesystem.writeFile({
            path: pdfFileName,
            data: pdfBase64,
            directory: Directory.Cache,
          });

          await Share.share({
            title: 'Comprovante de Pedido',
            text: 'Comprovante gerado pelo MarketVizium',
            url: result.uri,
            dialogTitle: 'Salvar ou enviar comprovante',
          });
        } else {
          doc.save(pdfFileName);
        }
      } catch (error) {
        this.$toast.add({ severity: 'error', summary: 'Erro ao gerar PDF', detail: 'Não foi possível gerar o comprovante. Tente novamente.', life: 3000 });
      } finally {
        this.loading = false;
      }
    },
    async exportToExcel() {
      try {
        // Dynamically import SheetJS
        const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.2/package/xlsx.mjs');

        const wb = XLSX.utils.book_new();

        // ── Sheet 1: INSTRUÇÕES ──────────────────────────────────────────────
        const instrucoes = [
          ['⚠️  ATENÇÃO: A ESTRUTURA DESTA PLANILHA NÃO PODE SER ALTERADA  ⚠️'],
          ['Remover, renomear ou reordenar colunas impedirá a importação correta dos dados.'],
          [''],
          ['COMO PREENCHER:'],
          ['• Preencha apenas as colunas marcadas com ✏️ (Preço Unitário e Mensagem/Observação)'],
          ['• Não altere as colunas preenchidas automaticamente (ID, Produto, Qtd. Solicitada, EAN)'],
          [''],
          ['CAMPOS PREENCHIDOS AUTOMATICAMENTE NA IMPORTAÇÃO:'],
          ['• Tipo Oferta → preenchido automaticamente como "unidade"'],
          ['• CNPJ Vendedor → preenchido com o CNPJ da sua empresa selecionada'],
        ];
        const wsInst = XLSX.utils.aoa_to_sheet(instrucoes);
        wsInst['!cols'] = [{ wch: 110 }];
        XLSX.utils.book_append_sheet(wb, wsInst, '📋 Instruções');

        // ── Sheet 2: PEDIDO ──────────────────────────────────────────────────
        // Linha de grupo (acima do header): separa visualmente o bloco de
        // colunas "Pedido do varejista" (preenchidas automaticamente) do
        // bloco "Sua oferta" (colunas que o vendedor deve preencher).
        const groupRow = [
          'Pedido do varejista', '', '', '', '', '',
          'Sua oferta (Escreva aqui)', '',
        ];

        const header = [
          // Produto solicitado
          'ID Solicitado',
          'Nome Produto',
          'EAN Produto',
          'Qtd. Solicitada',
          'Tipo Solicitado',
          'Unidade por Caixa/Fardo',
          // Resposta do vendedor ao produto solicitado
          '✏️ Preço Unitário (R$)',
          // Observação
          '✏️ Mensagem/Observação',
        ];

        const COL_COUNT = header.length;
        const PEDIDO_COLS = 6; // colunas 0–5 = pedido do varejista; 6–7 = oferta do vendedor

        const rows: any[][] = [groupRow, header];

        this.combinedItems.forEach(item => {
          const offer = this.tempOffers[item.id_solicitado] || {};
          rows.push([
            item.id_solicitado,
            item.nome || '--',
            item.codigo_barra || '--',
            item.quantidade ?? '--',
            item.tipo || '--',
            item.qtd_unitaria_composicao ?? '--',
            offer.primeiro_preco ?? '',
            offer.mensagem || '',
          ]);
        });

        const wsPedido = XLSX.utils.aoa_to_sheet(rows);

        // Mescla as células da linha de grupo, uma para cada bloco de colunas
        wsPedido['!merges'] = [
          { s: { r: 0, c: 0 }, e: { r: 0, c: PEDIDO_COLS - 1 } },
          { s: { r: 0, c: PEDIDO_COLS }, e: { r: 0, c: COL_COUNT - 1 } },
        ];

        // Column widths
        wsPedido['!cols'] = [
          { wch: 14 }, // ID
          { wch: 32 }, // Nome
          { wch: 18 }, // EAN
          { wch: 14 }, // Qtd Solic.
          { wch: 16 }, // Tipo Solic.
          { wch: 22 }, // Unidade por Caixa/Fardo
          { wch: 20 }, // ✏️ Preço
          { wch: 36 }, // ✏️ Mensagem
        ];

        // Freeze the first two rows (linha de grupo + header)
        wsPedido['!freeze'] = { xSplit: 0, ySplit: 2, topLeftCell: 'A3', activePane: 'bottomLeft' };

        // ── Estilos visuais ────────────────────────────────────────────────
        const THIN_BORDER = { style: 'thin', color: { rgb: 'D9D9D9' } };
        const THICK_BORDER = { style: 'medium', color: { rgb: '7F7F7F' } };

        const FILL_GROUP_PEDIDO = 'FFE0C2';  // laranja claro — "Pedido do varejista"
        const FILL_GROUP_OFERTA = 'FFC98A';  // laranja mais forte — "Sua oferta"
        const FILL_HEADER = '595959';
        const FILL_ZEBRA_ORANGE = 'FFF3E8';
        const FILL_ZEBRA_WHITE = 'FFFFFF';

        const GROUP_ROW_IDX = 0;
        const HEADER_ROW_IDX = 1;
        const FIRST_DATA_ROW_IDX = 2;
        const lastRowIdx = rows.length - 1;
        const lastColIdx = COL_COUNT - 1;

        for (let r = 0; r <= lastRowIdx; r++) {
          for (let c = 0; c <= lastColIdx; c++) {
            const cellRef = XLSX.utils.encode_cell({ r, c });
            if (!wsPedido[cellRef]) wsPedido[cellRef] = { t: 's', v: '' };

            const isPedidoBloco = c < PEDIDO_COLS;

            // Bordas mais espessas separando os dois grupos de colunas e
            // separando a área de cabeçalho da área de dados; bordas finas
            // entre as demais linhas/colunas.
            const border: any = {
              top: r === GROUP_ROW_IDX || r === FIRST_DATA_ROW_IDX ? THICK_BORDER : THIN_BORDER,
              bottom: r === HEADER_ROW_IDX || r === lastRowIdx ? THICK_BORDER : THIN_BORDER,
              left: c === 0 || c === PEDIDO_COLS ? THICK_BORDER : THIN_BORDER,
              right: c === lastColIdx || c === PEDIDO_COLS - 1 ? THICK_BORDER : THIN_BORDER,
            };

            let fill: string;
            let font: any;
            let alignment: any;

            if (r === GROUP_ROW_IDX) {
              fill = isPedidoBloco ? FILL_GROUP_PEDIDO : FILL_GROUP_OFERTA;
              font = { name: 'Arial', sz: 11, bold: true, color: { rgb: '7A3E00' } };
              alignment = { horizontal: 'center', vertical: 'center' };
            } else if (r === HEADER_ROW_IDX) {
              fill = FILL_HEADER;
              font = { name: 'Arial', sz: 10, bold: true, color: { rgb: 'FFFFFF' } };
              alignment = { horizontal: 'center', vertical: 'center', wrapText: true };
            } else {
              // Zebra: linhas de dados intercaladas laranja clarinho / branco
              const dataRowOffset = r - FIRST_DATA_ROW_IDX;
              fill = dataRowOffset % 2 === 0 ? FILL_ZEBRA_ORANGE : FILL_ZEBRA_WHITE;
              font = { name: 'Arial', sz: 10, color: { rgb: '333333' } };
              alignment = { horizontal: c === 1 ? 'left' : 'center', vertical: 'center' };
            }

            wsPedido[cellRef].s = {
              font,
              alignment,
              border,
              fill: { patternType: 'solid', fgColor: { rgb: fill }, bgColor: { rgb: fill } },
            };
          }
        }

        XLSX.utils.book_append_sheet(wb, wsPedido, '📦 Pedido');

        const nomeCotacao = (this.currentQuoteData?.nome_cotacao || 'cotacao').replace(/[^a-z0-9]/gi, '_');
        const fileName = `MarketVizium_${nomeCotacao}_${new Date().toISOString().split('T')[0]}.xlsx`;

        if (Capacitor.isNativePlatform()) {
          // ── Ambiente nativo (Android/iOS via Capacitor) ──────────────────
          // XLSX.writeFile() depende do mecanismo de download do navegador,
          // que não existe dentro do WebView nativo. Por isso geramos os
          // bytes do arquivo e gravamos via plugin Filesystem, depois
          // abrimos a folha de compartilhamento nativa (Share) para o
          // usuário salvar/enviar o arquivo.
          const wbout: string = XLSX.write(wb, { bookType: 'xlsx', type: 'base64', cellStyles: true });

          const result = await Filesystem.writeFile({
            path: fileName,
            data: wbout,
            directory: Directory.Cache,
          });

          await Share.share({
            title: 'Exportar Pedido (Excel)',
            text: 'Planilha de cotação gerada pelo MarketVizium',
            url: result.uri,
            dialogTitle: 'Salvar ou enviar planilha',
          });

          this.$toast.add({ severity: 'success', summary: 'Exportado!', detail: 'Planilha gerada. Escolha onde salvar ou enviar.', life: 3000 });
        } else {
          // ── Navegador (web) ───────────────────────────────────────────
          XLSX.writeFile(wb, fileName, { cellStyles: true });
          this.$toast.add({ severity: 'success', summary: 'Exportado!', detail: 'Planilha gerada com sucesso.', life: 3000 });
        }
      } catch (err) {
        this.$toast.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível exportar a planilha.', life: 3000 });
      }
    },

    async importFromExcel(event: Event) {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.2/package/xlsx.mjs');

        const buffer = await file.arrayBuffer();
        const wb = XLSX.read(buffer, { type: 'array' });

        // ── Validar aba obrigatória ──────────────────────────────────────────
        const sheetName = '📦 Pedido';
        if (!wb.SheetNames.includes(sheetName)) {
          this.$toast.add({ severity: 'error', summary: 'Planilha inválida', detail: 'A aba "📦 Pedido" não foi encontrada. Certifique-se de usar a planilha exportada pelo sistema.', life: 5000 });
          return;
        }

        const ws = wb.Sheets[sheetName];
        const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

        // ── Validar estrutura do cabeçalho ───────────────────────────────────
        // A linha 0 é a linha de grupo mesclada ("Pedido do varejista" /
        // "Sua oferta"); o cabeçalho real das colunas está na linha 1.
        const expectedHeaders = [
          'ID Solicitado', 'Nome Produto', 'EAN Produto', 'Qtd. Solicitada',
          'Tipo Solicitado', 'Unidade por Caixa/Fardo',
          '✏️ Preço Unitário (R$)',
          '✏️ Mensagem/Observação',
        ];

        if (rows.length < 3) {
          this.$toast.add({ severity: 'warn', summary: 'Planilha vazia', detail: 'Nenhum dado encontrado na planilha.', life: 4000 });
          return;
        }

        const headerRow: string[] = rows[1].map((h: any) => String(h).trim());
        const invalid = expectedHeaders.some((h, i) => headerRow[i] !== h);

        if (invalid) {
          this.$toast.add({
            severity: 'error',
            summary: 'Estrutura inválida',
            detail: 'O cabeçalho da planilha foi alterado. Use apenas o arquivo exportado pelo sistema sem modificar colunas.',
            life: 6000
          });
          return;
        }

        // ── Buscar CNPJ da empresa selecionada ───────────────────────────────
        let cnpjVendedor = '';
        try {
          const responseEmpresas = await api.get('/mvpu/usuario/operacoesEmpresaVendedor/');
          const empresas = responseEmpresas.data?.data || [];
          const empresaSelecionada = empresas.find((e: any) => e.selecionada);
          if (!empresaSelecionada) {
            this.$toast.add({ severity: 'warn', summary: 'Nenhuma empresa selecionada', detail: 'Selecione uma empresa representante para importar ofertas.', life: 4000 });
            return;
          }
          cnpjVendedor = empresaSelecionada.cnpj;
        } catch {
          this.$toast.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível verificar sua empresa. Tente novamente.', life: 4000 });
          return;
        }

        // ── Processar linhas e separar em novas ofertas vs atualizações ───────
        const novasOfertas: any[]   = [];   // → POST em lote
        const atualizacoes: any[]   = [];   // → PUT em lote
        let skippedCount = 0;

        for (let i = 2; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.every((c: any) => c === '')) continue;

          const idSolicitado = Number(row[0]);
          if (!idSolicitado) continue;

          if (!this.tempOffers[idSolicitado]) { skippedCount++; continue; }

          const precoUnitario = row[6] !== '' ? parseFloat(String(row[6]).replace(',', '.')) : null;
          const mensagemRaw   = String(row[7] || '').trim();
          const mensagem      = mensagemRaw || null;

          const hasData = precoUnitario || mensagem;
          if (!hasData) { skippedCount++; continue; }

          // Montar objeto de oferta limpo (sem chaves internas do tempOffers)
          const ofertaPayload: any = {
            id_solicitado: idSolicitado,
            primeiro_quantidade: this.tempOffers[idSolicitado]?.primeiro_quantidade ?? null,
            primeiro_preco: precoUnitario,
            primeiro_tipo: this.tempOffers[idSolicitado]?.primeiro_tipo || 'unidade',
            primeiro_unid_composicao: this.tempOffers[idSolicitado]?.primeiro_unid_composicao ?? null,
            codigo_barra: this.tempOffers[idSolicitado]?.codigo_barra || undefined,
            nome_equivalente: this.tempOffers[idSolicitado]?.nome_equivalente || undefined,
            segundo_quantidade: this.tempOffers[idSolicitado]?.segundo_quantidade ?? null,
            segundo_tipo: this.tempOffers[idSolicitado]?.segundo_tipo || 'unidade',
            segundo_unid_composicao: this.tempOffers[idSolicitado]?.segundo_unid_composicao ?? null,
            segundo_preco: this.tempOffers[idSolicitado]?.segundo_preco ?? null,
            mensagem: mensagem,
            cnpj_representa_vendedor: cnpjVendedor,
          };

          // Verificar se já existe uma oferta salva para este item
          const ofertaExistente = this.offers.find((o: any) => o.id_solicitado === idSolicitado);

          if (ofertaExistente) {
            // Atualização: inclui id_oferta
            atualizacoes.push({ ...ofertaPayload, id_oferta: ofertaExistente.id_oferta });
          } else {
            // Nova oferta
            novasOfertas.push(ofertaPayload);
          }
        }

        if (novasOfertas.length === 0 && atualizacoes.length === 0) {
          this.$toast.add({ severity: 'warn', summary: 'Nenhum dado para importar', detail: `${skippedCount} linha(s) ignorada(s) (sem dados ou ID não encontrado).`, life: 4000 });
          (event.target as HTMLInputElement).value = '';
          return;
        }

        // ── Disparar requisições em lote (máximo 2 chamadas) ─────────────────
        const requisicoes: Promise<any>[] = [];

        if (novasOfertas.length > 0) {
          requisicoes.push(
            api.post(`/mvpu/cotacao/adicionarOfeta/${this.id_loja}`, {
              ofertas: novasOfertas,
              id_cotacao: parseInt(this.id_cotacao as string),
            })
          );
        }

        const auth = useAuthStore()

        atualizacoes.forEach((prod)=>{
          prod['id_vendedor'] = auth.usuario.id_vendedor
        })

        if (atualizacoes.length > 0) {
          requisicoes.push(
            api.put(`/mvpu/cotacao/atualizarOferta/${this.id_loja}/${this.id_cotacao}`, {
              atualizar: atualizacoes,
            })
          );
        }

        await Promise.all(requisicoes);

        // ── Atualizar estado local após importação ────────────────────────────
        await this.fetchAllData();

        // Reset file input
        (event.target as HTMLInputElement).value = '';

        const totalImportados = novasOfertas.length + atualizacoes.length;
        this.$toast.add({
          severity: 'success',
          summary: 'Importação concluída',
          detail: `${totalImportados} item(ns) enviado(s) em lote.${novasOfertas.length ? ` ${novasOfertas.length} nova(s) oferta(s).` : ''}${atualizacoes.length ? ` ${atualizacoes.length} atualização(ões).` : ''}${skippedCount ? ` ${skippedCount} linha(s) ignorada(s).` : ''}`,
          life: 6000
        });

      } catch (err) {
        this.$toast.add({ severity: 'error', summary: 'Erro na importação', detail: 'Não foi possível processar a planilha.', life: 4000 });
      }
    },

    scrollToTop() {
      const element = document.querySelector('.btn-excel-import')

      element?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }

  },

  ionViewWillEnter() {
    this.pageActive = true;
  },
  ionViewWillLeave() {
    this.pageActive = false;
    setTimeout(() => { this.loading = true; }, 200);
  },
  ionViewDidEnter() {
    this.loading = true;
    this.currentPage = 1;
    this.id_loja = this.$route.query.id_loja as string | null;
    this.id_cotacao = this.$route.query.id_cotacao as string | null;
    
    const auth = useAuthStore()
    this.idCotacao = this.id_cotacao
    this.idLoja = this.id_loja
    this.idVendedor = auth.usuario.id_vendedor
    
    this.status_fechamento = this.$route.query.status_fechamento as string | null;
    this.nome_fantasia = this.$route.query.nome_fantasia as string | null;
    this.razao_social = this.$route.query.razao_social as string | null;
    this.fetchAllData();
    if (this.status_fechamento === 'concluido') this.montarDocumento();
  }
});
</script>

<style scoped>
/* ===== BASE ===== */
* { box-sizing: border-box; }

.quote-details-page {
  --background: #FFF;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
}

ion-content {
  --background: #FFF;
}

.page-wrapper {
  max-width: 720px;
  margin: 0 auto;
  padding: 16px 16px 0;
}

/* ===== BACK BUTTON ===== */
.back-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #999;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  padding: 8px 0 12px;
  width: fit-content;
}
.back-btn:active { opacity: 0.6; }
.back-btn .material-symbols-outlined { font-size: 16px; }

/* ===== SKELETON ===== */
.skeleton-list { display: flex; flex-direction: column; gap: 10px; margin-top: 12px; }
.skeleton-card {
  height: 90px;
  background: linear-gradient(90deg, #ececec 25%, #f5f5f5 50%, #ececec 75%);
  background-size: 200% 100%;
  border-radius: 16px;
  animation: shimmer 1.4s infinite;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ===== CENTER STATE (waiting / empty) ===== */
.center-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}
.state-card {
  text-align: center;
  padding: 32px 24px;
  max-width: 360px;
}
.state-icon {
  width: 72px; height: 72px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 20px;
}
.state-icon.orange { background: #fff3ee; }
.state-icon.orange .material-symbols-outlined { font-size: 36px; color: #FF8049; }
.state-card h2 { font-size: 18px; font-weight: 700; color: #1a1a1a; margin: 0 0 8px; }
.state-card p { font-size: 14px; color: #666; line-height: 1.6; margin: 0 0 16px; }
.date-pill {
  display: inline-flex; align-items: center; gap: 6px;
  background: #f5f5f7; border-radius: 50px;
  padding: 8px 14px; font-size: 12px; color: #666;
}
.date-pill .material-symbols-outlined { font-size: 14px; }

/* ===== BUTTONS ===== */
.btn-primary {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  background: #FF8049; color: #fff;
  border: none; border-radius: 12px;
  padding: 13px 24px; font-size: 14px; font-weight: 600;
  cursor: pointer; width: 100%;
  font-family: inherit;
  transition: background 0.15s, transform 0.1s;
}
.btn-primary:active { background: #e56a36; transform: scale(0.98); }
.btn-primary .material-symbols-outlined { font-size: 18px; }

.btn-ghost {
  display: flex; align-items: center; justify-content: center;
  background: transparent; color: #999;
  border: none; border-radius: 12px;
  padding: 12px 24px; font-size: 14px; font-weight: 500;
  cursor: pointer; width: 100%;
  font-family: inherit;
}
.btn-ghost:active { opacity: 0.6; }

.mt-16 { margin-top: 16px; }

/* ===== FINISHED VIEW ===== */
.finished-view { animation: fadeUp 0.4s ease; }

.finished-header { margin-bottom: 20px; padding-top: 8px; }

.success-chip {
  display: inline-flex; align-items: center; gap: 6px;
  background: #ecfdf5; color: #059669;
  border-radius: 50px; padding: 5px 12px;
  font-size: 11px; font-weight: 700;
  letter-spacing: 0.5px;
}
.success-chip .material-symbols-outlined { font-size: 14px; }

.stats-row {
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;
}
.stat-box {
  background: #fff;
  border-radius: 14px;
  padding: 14px 16px;
  border: 1px solid #eee;
  display: flex; flex-direction: column; gap: 4px;
}
.stat-box.accent { background: #FF8049; border-color: #FF8049; }
.stat-label { font-size: 10px; text-transform: uppercase; color: #999; font-weight: 600; letter-spacing: 0.5px; }
.stat-box.accent .stat-label { color: rgba(255,255,255,0.8); }
.stat-value { font-size: 20px; font-weight: 700; color: #1a1a1a; }
.stat-box.accent .stat-value { color: #fff; }

.table-card {
  background: #fff; border-radius: 16px;
  padding: 16px; border: 1px solid #eee;
  margin-bottom: 16px;
}
.table-title { font-size: 13px; font-weight: 700; color: #333; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.5px; }

.cell-sm { font-size: 11px; color: #444; }
.cell-accent { font-size: 12px; font-weight: 700; color: #FF8049; }

/* ===== Aviso de produtos de faturamento extra ===== */
.faturamento-extra-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.35);
  color: #059669;
  border-radius: 12px;
  padding: 12px 14px;
  margin-bottom: 16px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
}
.faturamento-extra-banner .material-symbols-outlined {
  font-size: 20px;
  flex-shrink: 0;
}
.faturamento-extra-cell {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.faturamento-extra-cell .material-symbols-outlined {
  font-size: 18px;
  color: #059669;
}

.footer-actions { display: flex; flex-direction: column; gap: 8px; padding-bottom: 16px; }

/* ===== QUOTE HEADER ===== */
.quote-main { padding-top: 4px; }

.quote-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 6px;
}

.quote-title {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 4px;
  line-height: 1.3;
}
.items-count { font-size: 12px; color: #999; font-weight: 500; }
.quote-subtitle { font-size: 13px; color: #666; margin: 4px 0 0; }

/* ===== BANNER "PARTICIPANDO DA COTAÇÃO" ===== */
.participando-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, rgba(16,185,129,0.10), rgba(16,185,129,0.04));
  border: 1px solid rgba(16,185,129,0.35);
  border-radius: 12px;
  padding: 10px 14px;
  margin: 10px 0 6px;
}
.participando-banner-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #10b981;
  flex-shrink: 0;
}
.participando-banner-icon .material-symbols-outlined { font-size: 16px; color: #fff; }
.participando-banner-text {
  font-size: 13px;
  font-weight: 700;
  color: #059669;
  letter-spacing: 0.01em;
}

.fade-slide-enter-active, .fade-slide-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.closed-info { font-size: 11px; color: #999; margin: 4px 0 12px; }

/* ===== PROGRESS ===== */
.progress-bar-wrap {
  display: flex; align-items: center; gap: 10px;
  margin: 10px 0 16px;
}
.progress-bar-track {
  flex: 1; height: 5px; background: #ebebeb; border-radius: 10px; overflow: hidden;
}
.progress-bar-fill {
  height: 100%; background: #FF8049; border-radius: 10px;
  transition: width 0.4s ease;
}
.progress-label { font-size: 11px; color: #999; font-weight: 600; white-space: nowrap; }

/* ===== PAGINATION HEADER ===== */
.pagination-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  gap: 10px;
}

.pagination-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.page-label {
  font-size: 13px;
  font-weight: 700;
  color: #1a1a1a;
}
.page-range {
  font-size: 11px;
  color: #aaa;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}

.page-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1.5px solid #e8e8e8;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  flex-shrink: 0;
}
.page-btn .material-symbols-outlined { font-size: 16px; color: #555; }
.page-btn:active:not(.disabled) { background: #fff3ee; border-color: #FF8049; }
.page-btn.disabled { opacity: 0.35; cursor: not-allowed; }

.page-dots {
  display: flex;
  align-items: center;
  gap: 5px;
}

.page-dot {
  min-width: 28px;
  height: 28px;
  padding: 0 6px;
  border-radius: 8px;
  border: 1.5px solid #e8e8e8;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  color: #999;
  font-family: inherit;
  transition: all 0.15s;
}
.page-dot.active {
  background: #FF8049;
  border-color: #FF8049;
  color: #fff;
  box-shadow: 0 2px 8px rgba(255, 128, 73, 0.3);
}
.page-dot.answered:not(.active) {
  background: #ecfdf5;
  border-color: #6ee7b7;
  color: #059669;
}
.page-dot.partial:not(.active) {
  background: #fff8f0;
  border-color: #fbbf80;
  color: #FF8049;
}
.page-dot:active { transform: scale(0.92); }

.dot-check {
  font-size: 13px;
}

/* ===== ITEMS LIST ===== */
.items-list { display: flex; flex-direction: column; gap: 10px; }

.item-card {
  background: #fff;
  border-radius: 16px;
  border: 1.5px solid #ebebeb;
  overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.item-card.is-answered {
  border-color: #ffe0d4;
}
.item-card.is-saving {
  border-color: #FF8049;
  box-shadow: 0 0 0 3px rgba(255, 128, 73, 0.12);
}

/* ===== CARD HEAD ===== */
.card-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 14px 14px 10px;
  gap: 12px;
}
.card-head-left { display: flex; gap: 10px; align-items: flex-start; flex: 1; min-width: 0; }

.status-dot {
  width: 8px; height: 8px; border-radius: 50%;
  flex-shrink: 0; margin-top: 5px;
}
.status-dot.answered { background: #FF8049; }
.status-dot.pending { background: #ddd; }

.card-info { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
.ean-label { font-size: 12px; color: #222; font-weight: 500; letter-spacing: 0.3px; }
.prod-name {
  font-size: 14px; font-weight: 800; color: #1a1a1a;
}
.prod-meta {
  display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px;
}
.prod-meta span { font-size: 11px; color: #999; }
.prod-meta b { color: #555; }

/* ===== PRICE BADGE (answered, not focused) ===== */
.price-badge {
  display: flex; align-items: center; gap: 6px; flex-shrink: 0;
}
.price-value {
  font-size: 16px; font-weight: 700; color: #FF8049;
  white-space: nowrap;
}
.clear-btn {
  background: #fef2ee; border: none; border-radius: 50%;
  width: 24px; height: 24px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; padding: 0;
}
.clear-btn .material-symbols-outlined { font-size: 13px; color: #FF8049; }
.clear-btn:active { background: #fce0d8; }

/* ===== PRICE INPUT ===== */
.price-row { padding: 0 14px 12px; }
.price-row-readonly {
  padding: 0 14px 12px;
  display: flex; align-items: center; gap: 8px;
}
.readonly-label { font-size: 11px; color: #bbb; }
.readonly-price { font-size: 15px; font-weight: 700; color: #FF8049; }

.price-input-wrap {
  display: flex;
  align-items: center;
  background: #f8f8f8;
  border: 1.5px solid #e8e8e8;
  border-radius: 12px;
  padding: 0 12px;
  height: 46px;
  gap: 6px;
  transition: border-color 0.15s, background 0.15s;
}
.price-input-wrap.active,
.price-input-wrap:focus-within {
  border-color: #FF8049;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(255, 128, 73, 0.1);
}

.currency-symbol { font-size: 14px; font-weight: 600; color: #999; flex-shrink: 0; }

.price-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  font-family: inherit;
  outline: none;
  min-width: 0;
  -moz-appearance: textfield;
}
.price-input::-webkit-outer-spin-button,
.price-input::-webkit-inner-spin-button { -webkit-appearance: none; }
.price-input::placeholder { color: #ddd; font-weight: 400; font-size: 15px; }

.saving-spinner .material-symbols-outlined,
.saved-check .material-symbols-outlined { font-size: 18px; flex-shrink: 0; }
.saving-spinner .material-symbols-outlined { color: #FF8049; }
.saved-check .material-symbols-outlined { color: #10b981; }

@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.spin { animation: spin 0.8s linear infinite; display: inline-block; }

/* ===== EXPANDABLES ===== */
.expandable { border-top: 1px solid #f2f2f2; }

.expand-toggle {
  display: flex; align-items: center; gap: 6px;
  width: 100%; padding: 10px 14px;
  background: transparent; border: none;
  cursor: pointer; text-align: left;
  font-family: inherit; font-size: 12px; font-weight: 600; color: #999;
  transition: color 0.15s;
}
.expand-toggle:active { opacity: 0.7; }
.expand-toggle.active { color: #FF8049; }
.expand-toggle .material-symbols-outlined { font-size: 16px; }

.obs-dot {
  width: 6px; height: 6px; border-radius: 50%; background: #FF8049; margin-left: 2px;
}

.expand-body { padding: 4px 14px 14px; }

.obs-textarea {
  width: 100%;
  border: 1.5px solid #e8e8e8;
  border-radius: 10px;
  padding: 10px 12px;
  font-family: inherit;
  font-size: 13px;
  color: #333;
  background: #f8f8f8;
  resize: none;
  outline: none;
  line-height: 1.5;
  transition: border-color 0.15s;
}
.obs-textarea:focus { border-color: #FF8049; background: #fff; }

/* Equivalent product grid */
.eq-body { padding: 4px 14px 14px; }
.eq-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

.eq-field { display: flex; flex-direction: column; gap: 4px; }
.eq-field label { font-size: 10px; font-weight: 700; color: #bbb; text-transform: uppercase; letter-spacing: 0.4px; }
.eq-field input,
.eq-field select {
  border: 1.5px solid #e8e8e8;
  border-radius: 10px;
  padding: 9px 11px;
  font-family: inherit; font-size: 13px; color: #333;
  background: #f8f8f8; outline: none;
  transition: border-color 0.15s;
  -moz-appearance: textfield;
  width: 100%;
}
.eq-field input::-webkit-outer-spin-button,
.eq-field input::-webkit-inner-spin-button { -webkit-appearance: none; }
.eq-field input:focus,
.eq-field select:focus { border-color: #FF8049; background: #fff; }

/* ===== PAGINATION FOOTER ===== */
.pagination-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
  margin-bottom: 8px;
  padding: 12px 0;
  border-top: 1px solid #f0f0f0;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #fff;
  border: 1.5px solid #e8e8e8;
  border-radius: 12px;
  padding: 9px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #555;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s;
}
.nav-btn .material-symbols-outlined { font-size: 15px; }
.nav-btn.next { background: #FF8049; border-color: #FF8049; color: #fff; }
.nav-btn.next:active { background: #e56a36; transform: scale(0.97); }
.nav-btn.prev:active:not(.disabled) { background: #f8f8f8; }
.nav-btn.disabled { opacity: 0.35; cursor: not-allowed; }

.page-counter {
  display: flex;
  align-items: baseline;
  gap: 3px;
}
.page-counter-current {
  font-size: 20px;
  font-weight: 700;
  color: #FF8049;
}
.page-counter-sep {
  font-size: 14px;
  color: #ccc;
  font-weight: 400;
}
.page-counter-total {
  font-size: 14px;
  color: #bbb;
  font-weight: 600;
}

/* ===== SLIDE TRANSITION ===== */
.slide-enter-active, .slide-leave-active { transition: all 0.2s ease; overflow: hidden; }
.slide-enter-from, .slide-leave-to { opacity: 0; max-height: 0; padding-top: 0; padding-bottom: 0; }
.slide-enter-to, .slide-leave-from { opacity: 1; max-height: 400px; }

/* ===== ANIMATIONS ===== */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ===== PRIMEVUE OVERRIDES ===== */
:deep(.slim-table .p-datatable-thead > tr > th) {
  background: #fafafa; font-size: 10px; text-transform: uppercase;
  color: #aaa; padding: 10px 8px; border-bottom: 1px solid #f0f0f0;
}
:deep(.slim-table .p-datatable-tbody > tr > td) {
  font-size: 12px; padding: 10px 8px; border-bottom: 1px solid #f8f8f8;
}

/* ===== SPACER ===== */
.bottom-spacer { height: 80px; }

/* ===== PDF HIDDEN ===== */
.pdf-container {
  position: absolute; left: -9999px; top: 0;
  width: 210mm; padding: 20mm; background: white;
  font-family: 'Poppins', sans-serif;
}
.brand-logo { font-size: 32px; text-align: center; color: #555; margin-bottom: 5px; }
.brand-logo span { color: #ff8049; }
.pdf-table { width: 100%; border-collapse: collapse; margin-top: 30px; }
.pdf-table th { background: #f8fafc; padding: 12px; border-bottom: 2px solid #ff8049; text-align: left; font-size: 12px; }
.pdf-table td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
.pdf-footer { margin-top: 50px; text-align: right; }
.grand-total { font-size: 18px; font-weight: bold; }
.grand-total span { color: #ff8049; margin-left: 10px; }


/* ===== STATUS CHIP VARIANTS ===== */
.status-chip {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 5px 12px; border-radius: 20px;
  font-size: 11px; font-weight: 700; letter-spacing: 0.3px;
  flex-shrink: 0;
}
.status-chip .material-symbols-outlined { font-size: 14px; }
.status-chip.open    { background: #dcfce7; color: #16a34a; }
.status-chip.closed  { background: #f1f5f9; color: #64748b; }
.status-chip.unavailable { background: #fee2e2; color: #dc2626; }

.closed-info--unavailable { color: #dc2626; }

/* ===== EXCEL ACTIONS ===== */
.excel-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin: 16px 0 4px;
}
.btn-excel-export,
.btn-excel-import {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border-radius: 12px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  border: none;
}
.btn-excel-export {
  background: #16a34a;
  color: #fff;
}
.btn-excel-export:active { background: #15803d; transform: scale(0.97); }
.btn-excel-import {
  background: #fff;
  color: #16a34a;
  border: 1.5px solid #16a34a;
}
.btn-excel-import:active { background: #f0fdf4; transform: scale(0.97); }
.btn-excel-export .material-symbols-outlined,
.btn-excel-import .material-symbols-outlined { font-size: 18px; }

/* ===== RESPONSIVE DESKTOP ===== */
@media (min-width: 640px) {
  .page-wrapper { padding: 24px 24px 0; }

  .quote-header { align-items: center; }
  .quote-title { font-size: 22px; }

  .item-card { border-radius: 18px; }

  .card-head { padding: 18px 18px 12px; }

  .price-row { padding: 0 18px 14px; }

  .eq-grid { grid-template-columns: 1fr 1fr 1fr; }

  .stats-row { gap: 16px; }
  .stat-value { font-size: 24px; }
}

@media (min-width: 768px) {
  .page-wrapper { padding: 32px 32px 0; }

  .items-list { gap: 12px; }

  .prod-name { font-size: 15px; }

  .price-input { font-size: 20px; }
}

/* ════════════════════════════════════════════════════════════════
   VISIBILIDADE RESPONSIVA
   < 992px → mostra .mobile-view (lista de cards original)
   >= 992px → mostra .desktop-view (tabela no estilo de
   consoleCotacao.vue)
════════════════════════════════════════════════════════════════ */
.desktop-view { display: none; }

@media (min-width: 992px) {
  .page-wrapper { max-width: 1600px; }

  .mobile-view { display: none; }
  .desktop-view { display: block; }
}

/* ════════════════════════════════════════════════════════════════
   VISÃO DESKTOP (>= 992px) — réplica do estilo de tabela de
   consoleCotacao.vue
════════════════════════════════════════════════════════════════ */

/* Busca */
.desktop-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.desktop-search-wrap {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  max-width: 420px;
}

.desktop-search-icon {
  position: absolute;
  left: 12px;
  color: #bbb;
  font-size: 18px;
}

.desktop-search-input {
  width: 100%;
  border: 1.5px solid #e8e8e8;
  border-radius: 10px;
  padding: 9px 12px 9px 38px;
  font-family: inherit;
  font-size: 13px;
  color: #333;
  background: #f8f8f8;
  outline: none;
  transition: border-color 0.15s, background 0.15s;
}
.desktop-search-input:focus { border-color: #FF8049; background: #fff; }
.desktop-search-input::placeholder { color: #bbb; }

.desktop-results-count {
  font-size: 12px;
  color: #999;
  font-weight: 600;
  white-space: nowrap;
}

.empty-state-desktop {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 60px 20px;
  color: #999;
  font-size: 13px;
}

/* Tabela — mesmo padrão visual de consoleCotacao.vue */
.produtos-table-wrap { overflow-x: auto; border-radius: 10px; border: 1px solid rgba(0,0,0,0.07); }
.data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.data-table thead tr { background: #fafafa; }
.data-table th {
  padding: 10px;
  text-align: left;
  font-size: 11px; font-weight: 700; letter-spacing: .07em; text-transform: uppercase;
  color: rgba(0,0,0,0.5);
  border-bottom: 1px solid rgba(0,0,0,0.07);
  white-space: nowrap;
}
.data-table td { padding: 10px; border-bottom: 1px solid rgba(0,0,0,0.04); vertical-align: middle; }
.data-table tbody tr:last-child td { border-bottom: none; }
.data-table tbody tr:hover { background: rgba(255, 128, 73, 0.02); }
.data-table tbody tr.produto-selecionado-auto { background: rgba(255, 128, 73, 0.06); }
.data-table tbody tr.produto-selecionado-auto td:first-child { box-shadow: inset 3px 0 0 0 #FF8049; }

.prod-cell { display: flex; flex-direction: column; gap: 2px; }
.data-table .mono { font-family: 'DM Mono', monospace; font-size: 12px; }
.data-table .muted { color: rgba(0,0,0,0.4); }
.data-table .type-tag { background: rgba(255, 128, 73, 0.1); color: #FF8049; padding: 2px 7px; border-radius: 4px; font-size: 11px; font-weight: 600; }
.data-table .comp-info { font-size: 12px; color: rgba(0,0,0,0.5); }
.data-table .row-actions { display: flex; gap: 6px; align-items: center; }
.data-table .icon-btn {
  background: none; border: none; cursor: pointer;
  width: 30px; height: 30px;
  border-radius: 6px; display: flex; align-items: center; justify-content: center;
  font-size: 16px; transition: all .2s;
}
.data-table .icon-btn.edit { color: rgba(0,0,0,0.4); }
.data-table .icon-btn.edit:hover { background: rgba(255, 128, 73, 0.1); color: #FF8049; }
.data-table .icon-btn.del { color: rgba(0,0,0,0.3); }
.data-table .icon-btn.del:hover { background: rgba(239,68,68,0.1); color: #ef4444; }

/* Input de preço dentro da célula da tabela */
.desktop-price-input-wrap {
  display: inline-flex;
  align-items: center;
  background: #f8f8f8;
  border: 1.5px solid #e8e8e8;
  border-radius: 8px;
  padding: 0 10px;
  height: 36px;
  gap: 5px;
  min-width: 110px;
  transition: border-color 0.15s, background 0.15s;
}
.desktop-price-input-wrap.active,
.desktop-price-input-wrap:focus-within {
  border-color: #FF8049;
  background: #fff;
  box-shadow: 0 0 0 2px rgba(255, 128, 73, 0.1);
}
.desktop-price-input {
  flex: 1;
  width: 70px;
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 700;
  color: #1a1a1a;
  font-family: inherit;
  outline: none;
  min-width: 0;
  -moz-appearance: textfield;
}
.desktop-price-input::-webkit-outer-spin-button,
.desktop-price-input::-webkit-inner-spin-button { -webkit-appearance: none; }
.desktop-price-input::placeholder { color: #ccc; font-weight: 400; }
.desktop-price-input-wrap .saving-spinner .material-symbols-outlined,
.desktop-price-input-wrap .saved-check .material-symbols-outlined { font-size: 16px; flex-shrink: 0; }
.desktop-price-input-wrap .saving-spinner .material-symbols-outlined { color: #FF8049; }
.desktop-price-input-wrap .saved-check .material-symbols-outlined { color: #10b981; }

.data-table .readonly-price { font-size: 13px; font-weight: 700; color: #FF8049; white-space: nowrap; }

/* Botão "Adicionar equivalente" — chamada bem visível */
.equivalente-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 128, 73, 0.08);
  border: 1.5px dashed rgba(255, 128, 73, 0.5);
  color: #FF8049;
  border-radius: 8px;
  padding: 7px 12px;
  font-size: 12px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
}
.equivalente-btn:hover { background: rgba(255, 128, 73, 0.16); border-color: #FF8049; }
.equivalente-btn .material-symbols-outlined { font-size: 16px; }
.equivalente-btn.filled {
  background: rgba(16,185,129,0.08);
  border: 1.5px solid rgba(16,185,129,0.4);
  color: #059669;
}
.equivalente-btn.filled:hover { background: rgba(16,185,129,0.14); border-color: #10b981; }

/* Paginação da tabela desktop */
.desktop-pagination-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 14px;
  flex-wrap: wrap;
}
.desktop-pagination-range {
  font-size: 12px;
  color: #999;
  font-weight: 600;
  white-space: nowrap;
}

/* ════════════════════════════════════════════════════════════════
   MODAL: Produto Equivalente
════════════════════════════════════════════════════════════════ */
.eq-modal-overlay {
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

.eq-modal-card {
  background: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 560px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.18);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-family: 'Poppins', sans-serif;
}

.eq-modal-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.2rem 1.4rem;
  border-bottom: 1px solid #f1f5f9;
}
.eq-modal-header-icon {
  width: 42px; height: 42px;
  background: linear-gradient(135deg, #ff8049, #ff6020);
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.eq-modal-header-icon .material-symbols-outlined { color: #fff; font-size: 20px; }
.eq-modal-header-text { flex: 1; min-width: 0; }
.eq-modal-header-text h2 { font-size: 1rem; font-weight: 700; color: #1a1a1a; margin: 0; }
.eq-modal-header-text p { font-size: 0.8rem; color: #999; margin: 2px 0 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.eq-modal-close-btn {
  background: none; border: none; cursor: pointer; color: #bbb;
  display: flex; align-items: center; justify-content: center;
  border-radius: 8px; padding: 4px; flex-shrink: 0;
  transition: background 0.15s, color 0.15s;
}
.eq-modal-close-btn:hover { background: #f1f5f9; color: #666; }

.eq-modal-body { padding: 1.2rem 1.4rem; }

.eq-modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.6rem;
  padding: 1rem 1.4rem;
  border-top: 1px solid #f1f5f9;
}
.btn-ghost-modal {
  background: none; border: none; cursor: pointer;
  color: #999; font-family: inherit; font-size: 0.85rem; font-weight: 600;
  padding: 0.6rem 1rem; border-radius: 8px;
  transition: background 0.15s, color 0.15s;
}
.btn-ghost-modal:hover { background: #f8fafc; color: #666; }
.btn-entendi-modal {
  display: flex; align-items: center; gap: 6px;
  background: linear-gradient(135deg, #ff8049, #ff6020);
  color: #fff; border: none; border-radius: 8px;
  padding: 0.6rem 1.2rem; font-family: inherit;
  font-size: 0.85rem; font-weight: 600; cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
}
.btn-entendi-modal:hover { opacity: 0.9; transform: translateY(-1px); }
.btn-entendi-modal .material-symbols-outlined { font-size: 16px; }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.25s ease; }
.modal-fade-enter-active .eq-modal-card, .modal-fade-leave-active .eq-modal-card {
  transition: transform 0.25s ease, opacity 0.25s ease;
}
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-from .eq-modal-card, .modal-fade-leave-to .eq-modal-card {
  transform: translateY(20px); opacity: 0;
}

@media print {
  .back-btn, .footer-actions { display: none !important; }
}

/* Posição parcial: não se confunde com o faturamento do pedido. */
.winning-panel{margin:0 0 20px;padding:24px;border:1px solid #cde4d7;border-radius:20px;background:linear-gradient(135deg,#f4fbf7,#fff 70%);box-shadow:0 8px 28px #163c2810}
.winning-heading{display:flex;align-items:center;gap:12px;margin-bottom:18px}.winning-icon{display:grid;place-items:center;width:46px;height:46px;border-radius:14px;background:#dcf3e5;color:#177443;font-size:26px;flex-shrink:0}.winning-eyebrow{font-size:10px;letter-spacing:1.4px;font-weight:700;color:#397051}.winning-heading h2{font-size:20px;line-height:1.3;margin:4px 0 0;color:#173b29;letter-spacing:-.5px}.winning-partial{margin-left:auto;font-size:11px;font-weight:600;padding:6px 10px;border-radius:20px;background:#fff0d4;color:#805414;white-space:nowrap}
.winning-warning{display:flex;gap:10px;background:#fff8e9;border:1px solid #eedcba;border-radius:12px;padding:13px;color:#735322}.winning-warning>.material-symbols-outlined{font-size:21px;flex-shrink:0}.winning-warning p{margin:0;font-size:12px;line-height:1.7}.winning-warning strong{display:block;color:#664315}.winning-once{font-size:12px;line-height:1.6;color:#53665a;margin:16px 0 12px}.winning-button{display:flex;justify-content:center;align-items:center;gap:9px;background:#187244;color:#fff;border:0;border-radius:12px;padding:14px 20px;font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;min-height:48px;width:100%;transition:background .2s}.winning-button:hover:not(:disabled){background:#105b35}.winning-button:disabled{opacity:.65;cursor:not-allowed}.winning-button:focus-visible{outline:3px solid #309662;outline-offset:3px}.winning-button .material-symbols-outlined{font-size:21px}.winning-error{font-size:12px;line-height:1.6;color:#9e2929;background:#fff0ee;border-radius:10px;padding:12px;margin:14px 0 0}
.winning-stats{display:grid;grid-template-columns:2fr 1fr;gap:16px;margin-top:20px}.winning-total,.winning-count{padding:20px;border-radius:14px;display:flex;flex-direction:column;gap:8px}.winning-total{background:#17613d;color:white}.winning-count{background:#eaf5ee;color:#205436}.winning-stats span{font-size:12px}.winning-stats strong{font-size:32px;line-height:1.2;letter-spacing:-1px;overflow-wrap:anywhere}.winning-stats small{font-size:11px;opacity:.85;line-height:1.5}.winning-legend{display:flex;align-items:center;gap:8px;color:#186b3e;font-size:12px;margin-top:18px;line-height:1.5}.winning-legend .material-symbols-outlined{font-size:20px;flex-shrink:0}.winning-snapshot{font-size:11px;color:#617365;line-height:1.7;margin:8px 0 0}.winning-empty{display:flex;gap:12px;margin-top:16px;padding:16px;background:#f1f5f2;border-radius:12px;color:#45614e;font-size:12px}.winning-empty p{margin:6px 0 0;line-height:1.6}
.item-card.is-winning{background:#eefaf2;border:1px solid #78c798;box-shadow:inset 4px 0 0 #25824c}.item-card.is-winning .status-dot{background:#23834b}.winning-item-tag{display:inline-flex;align-items:center;gap:4px;width:fit-content;font-size:10px;font-weight:700;line-height:1.5;padding:3px 7px;border-radius:6px;color:#176337;background:#d7efdf;margin-top:5px}.winning-item-tag .material-symbols-outlined{font-size:14px}.data-table tbody tr.is-winning,.data-table tbody tr.is-winning:hover,.data-table tbody tr.is-winning.produto-selecionado-auto{background:#eaf8ef}.data-table tbody tr.is-winning td:first-child{box-shadow:inset 4px 0 0 #25824c}.data-table .is-winning .prod-cell{align-items:flex-start;flex-direction:column}
@media(max-width:600px){.winning-panel{padding:16px;border-radius:16px}.winning-heading{flex-wrap:wrap;gap:10px}.winning-heading h2{font-size:17px}.winning-partial{margin-left:56px;margin-top:-5px}.winning-stats{grid-template-columns:1fr;gap:10px}.winning-total,.winning-count{padding:16px}.winning-stats strong{font-size:28px}.winning-count{display:grid;grid-template-columns:1fr auto;align-items:center}.winning-count small{grid-column:1/-1}.winning-button{font-size:12px;padding:14px 10px}}
@media(prefers-reduced-motion:reduce){.winning-panel .spin{animation:none}.winning-button{transition:none}}

</style>