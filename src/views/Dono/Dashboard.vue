<template>
  <ion-page class="dash-cotacao-page">
    <ion-content :fullscreen="true" class="dash-content">

      <RefresherIonic />

      <div class="cotacao-root">

        <!-- ══ HEADER ══ -->
        <div class="reports-header">
          <div class="rh-left">
            <div class="rh-brand">
              <span class="material-symbols-outlined rh-brand-icon">request_quote</span>
              <div>
                <div class="rh-title poppins-semibold">Dashboard de Cotações</div>
                <div class="rh-sub poppins-regular">Cotações · Área de Compras</div>
              </div>
            </div>
          </div>
          <div class="rh-right">
            <div class="rh-sync">
              <span class="material-symbols-outlined" style="font-size:14px;color:var(--green)">fiber_manual_record</span>
              <span class="rh-sync-text">Tempo real</span>
            </div>
            <button class="rh-refresh-btn" @click="refreshData" :class="{ spinning: loadingDashboard }">
              <span class="material-symbols-outlined">refresh</span>
            </button>
          </div>
        </div>

        <!-- ══ LOADING STATE ══ -->
        <div v-if="loadingDashboard" class="loading-state">
          <ion-spinner name="crescent" color="primary"></ion-spinner>
          <p class="poppins-regular">Carregando dashboard...</p>
        </div>

        <!-- ══ ERROR STATE ══ -->
        <div v-else-if="error" class="error-state">
          <span class="material-symbols-outlined error-icon">cloud_off</span>
          <h3 class="poppins-semibold">Ops! Algo deu errado.</h3>
          <p class="poppins-regular">Não foi possível carregar os dados.</p>
          <button class="retry-btn poppins-medium" @click="carregarDashboard">
            Tentar novamente
          </button>
        </div>

        <template v-else>

          <!-- ══ FILTER BAR ══ -->
          <div class="filter-bar">
            <div class="filter-section">
              <span class="filter-label">
                <span class="material-symbols-outlined" style="font-size:15px">calendar_month</span>
                Período
              </span>
              <div class="period-chips">
                <button
                  v-for="p in periodPresets"
                  :key="p.key"
                  class="pchip poppins-medium"
                  :class="{ active: activePeriod === p.key }"
                  @click="setPreset(p.key)"
                >{{ p.label }}</button>
              </div>
            </div>
            <div class="date-range">
              <span class="dr-label">De</span>
              <input type="date" v-model="dateFrom" class="dr-input" />
              <span class="dr-label">Até</span>
              <input type="date" v-model="dateTo" class="dr-input" />
              <button class="btn-apply" @click="applyCustomRange">
                <span class="material-symbols-outlined" style="font-size:15px">search</span>
                <span class="btn-apply-text">Aplicar</span>
              </button>
            </div>
          </div>

          <!-- ══ PERIOD BADGE ══ -->
          <div class="period-badge-row">
            <div class="period-badge">
              <span class="material-symbols-outlined" style="font-size:14px">date_range</span>
              {{ periodLabel }}
            </div>
            <div class="pb-location">
              <span class="material-symbols-outlined" style="font-size:14px">shopping_cart</span>
              {{ totalCotacoes }} cotações
            </div>
            <div class="pb-stats-wrap">
              <div class="pb-stat">
                <span class="pb-stat-val">{{ totalCotacoes }}</span>
                <span class="pb-stat-lbl">Total</span>
              </div>
              <div class="pb-stat">
                <span class="pb-stat-val accent">{{ cotacoesConcluidas }}</span>
                <span class="pb-stat-lbl">Concluídas</span>
              </div>
              <div class="pb-stat">
                <span class="pb-stat-val green">{{ taxaConclusao }}%</span>
                <span class="pb-stat-lbl">Taxa Concl.</span>
              </div>
              <div class="pb-stat">
                <span class="pb-stat-val" style="color:var(--blue)">R$ {{ valorMedioCotacao }}</span>
                <span class="pb-stat-lbl">Valor Médio</span>
              </div>
            </div>
          </div>

          <!-- ══ CONTENT ══ -->
          <div class="reports-content">


            <BannerSite />

            <!-- ═══ KPIs PRINCIPAIS ═══ -->
            <div class="section-block">
              <div class="section-header">
                <div class="section-icon c-orange">
                  <span class="material-symbols-outlined">monitoring</span>
                </div>
                <div>
                  <div class="section-title poppins-semibold">Resumo Executivo de Cotações</div>
                  <div class="section-sub poppins-regular">Indicadores gerais · {{ periodLabel }}</div>
                </div>
              </div>

              <div class="kpi-grid-4">
                <div v-for="k in mainKpis" :key="k.label" class="kpi-report" :class="k.cls">
                  <div class="kr-icon"><span class="material-symbols-outlined">{{ k.icon }}</span></div>
                  <div class="kr-body">
                    <div class="kr-label">{{ k.label }}</div>
                    <div class="kr-value poppins-semibold">{{ k.value }}</div>
                    <div class="kr-footer">
                      <span class="kr-delta" :class="k.up === true ? 'up' : k.up === false ? 'down' : 'neutral'">
                        <span class="material-symbols-outlined" style="font-size:12px">
                          {{ k.up === true ? 'trending_up' : k.up === false ? 'trending_down' : 'remove' }}
                        </span>
                        {{ k.delta }}
                      </span>
                      <span class="kr-sub">vs ant.</span>
                    </div>
                  </div>
                  <span class="material-symbols-outlined kr-bg">{{ k.icon }}</span>
                </div>
              </div>

              <!-- Mini métricas complementares -->
              <div class="kpi-grid-4">
                <div v-for="m in miniKpis" :key="m.label" class="kpi-mini">
                  <div class="kmr-label">{{ m.label }}</div>
                  <div class="kmr-value poppins-semibold">{{ m.value }}</div>
                  <div class="kmr-sub" :style="{ color: m.up ? 'var(--green)' : m.up === false ? 'var(--red)' : 'var(--muted)' }">
                    <span v-if="m.trend">{{ m.up ? '▲' : '▼' }} {{ m.trend }}</span>
                    {{ m.sub }}
                  </div>
                </div>
              </div>
            </div>

            <!--
            
              <div class="section-block">
                <div class="section-header">
                  <div class="section-icon c-blue">
                    <span class="material-symbols-outlined">show_chart</span>
                  </div>
                  <div>
                    <div class="section-title poppins-semibold">Evolução de Preços e Volume de Cotações</div>
                    <div class="section-sub poppins-regular">Histórico de preços por produto e quantidade de cotações</div>
                  </div>
                </div>

                <div class="chart-section-grid">
                  <div class="card">
                    <div class="card-head">
                      <div class="card-icon c-orange"><span class="material-symbols-outlined">trending_up</span></div>
                      <div>
                        <div class="card-title poppins-semibold">Evolução de Preço por Produto</div>
                        <div class="card-sub">Baseado em ofertas aceitas</div>
                      </div>
                    </div>
                    <div class="card-actions-row">
                      <div class="barcode-search">
                        <span class="material-symbols-outlined" style="font-size:14px;color:var(--muted)">barcode_scanner</span>
                        <input
                          type="text"
                          v-model="barcodeSearch"
                          placeholder="Cód. de barras do produto..."
                          class="barcode-input poppins-regular"
                          @input="debouncedSearch"
                          @keyup.enter="searchProduct"
                        />
                        <button class="btn-barcode" @click="searchProduct">
                          <span class="material-symbols-outlined" style="font-size:14px">search</span>
                        </button>
                      </div>
                    </div>

                    <div v-if="selectedProduct" class="selected-product-bar">
                      <div class="spb-info">
                        <span class="spb-code">{{ selectedProduct.barcode }}</span>
                        <span class="spb-name">{{ selectedProduct.name }}</span>
                        <span class="spb-cat tag-r tag-blue-soft">{{ selectedProduct.category }}</span>
                      </div>
                      <div class="spb-stats">
                        <div class="spb-stat">
                          <span class="spb-stat-val">R$ {{ selectedProduct.lastPrice }}</span>
                          <span class="spb-stat-lbl">Último preço</span>
                        </div>
                        <div class="spb-stat">
                          <span class="spb-stat-val" :style="{ color: selectedProduct.priceChange > 0 ? 'var(--red)' : 'var(--green)' }">
                            {{ selectedProduct.priceChange > 0 ? '+' : '' }}{{ selectedProduct.priceChange }}%
                          </span>
                          <span class="spb-stat-lbl">Variação</span>
                        </div>
                        <div class="spb-stat">
                          <span class="spb-stat-val">{{ selectedProduct.totalQuotes }}</span>
                          <span class="spb-stat-lbl">Cotações</span>
                        </div>
                      </div>
                    </div>

                    <div v-if="priceEvoData && selectedProduct" class="chart-wrap h260" style="width: 100%; height: 500px;">
                      <canvas ref="priceEvoChart"></canvas>
                    </div>
                    <div v-else-if="!selectedProduct" class="empty-chart-state">
                      <span class="material-symbols-outlined">search</span>
                      <p class="poppins-regular">Digite um código de barras para visualizar a evolução</p>
                    </div>
                    <div v-else class="empty-chart-state">
                      <span class="material-symbols-outlined">hide_image</span>
                      <p class="poppins-regular">Nenhum dado encontrado para esse produto no período</p>
                    </div>
                  </div>

                  <div class="card">
                    <div class="card-head">
                      <div class="card-icon c-green"><span class="material-symbols-outlined">bar_chart</span></div>
                      <div>
                        <div class="card-title poppins-semibold">Cotações Criadas vs Concluídas</div>
                        <div class="card-sub">Evolução diária · {{ periodLabel }}</div>
                      </div>
                    </div>
                    <div class="chart-wrap h260">
                      <canvas ref="volumeChart"></canvas>
                    </div>
                    <div class="stock-summary">
                      <div class="ss-item"><div class="ss-val accent poppins-semibold">{{ totalCotacoes }}</div><div class="ss-lbl">Criadas</div></div>
                      <div class="ss-item"><div class="ss-val green poppins-semibold">{{ cotacoesConcluidas }}</div><div class="ss-lbl">Concluídas</div></div>
                      <div class="ss-item"><div class="ss-val poppins-semibold" style="color:var(--yellow)">{{ cotacoesPendentes }}</div><div class="ss-lbl">Pendentes</div></div>
                      <div class="ss-item"><div class="ss-val red poppins-semibold">{{ cotacoesCanceladas }}</div><div class="ss-lbl">Canceladas</div></div>
                    </div>
                  </div>
                </div>
              </div>
            
            -->
            

            <!-- ═══ VENDEDORES / FORNECEDORES ═══ -->
            <div class="section-block">
              <div class="section-header">
                <div class="section-icon c-blue">
                  <span class="material-symbols-outlined">group</span>
                </div>
                <div>
                  <div class="section-title poppins-semibold">Performance de Vendedores / Fornecedores</div>
                  <div class="section-sub poppins-regular">Ranking, tempo de resposta e participação em cotações</div>
                </div>
              </div>

              <!-- Tabela ranking vendedores -->
              <div class="card">
                <div class="card-head">
                  <div class="card-icon c-blue"><span class="material-symbols-outlined">leaderboard</span></div>
                  <div>
                    <div class="card-title poppins-semibold">Ranking Detalhado de Vendedores</div>
                    <div class="card-sub">Vendas, cotações e tempo de resposta</div>
                  </div>
                </div>
                <div class="card-actions-row">
                  <div class="chip-filter-row">
                    <button
                      v-for="f in ['Vendas','Cotações','Resposta','Aceite']"
                      :key="f"
                      class="chip poppins-medium"
                      :class="{ active: sellerRankFilter === f }"
                      @click="sellerRankFilter = f"
                    >{{ f }}</button>
                  </div>
                </div>

                <div v-if="sellersDetailed.length > 0" class="table-wrapper">
                  <table class="report-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>VENDEDOR</th>
                        <th>EMPRESA</th>
                        <th>QTDE. VENDAS</th>
                        <th>COTAÇÕES</th>
                        <th>TAXA ACEITE</th>
                        <th>RESP. RÁPIDA</th>
                        <th>RESP. LENTA</th>
                        <th>TEMPO MÉDIO</th>
                        <th>TOTAL VENDIDO</th>
                        <th>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(s, i) in sellersDetailed" :key="s.name">
                        <td>
                          <span class="rank-num poppins-semibold" :class="['gold','silver','bronze'][i]||''">{{ i+1 }}</span>
                        </td>
                        <td>
                          <div class="user-cell">
                            <div class="mini-av" :class="'sc-av-'+s.avColor">{{ s.initials }}</div>
                            <div>
                              <div class="cell-name">{{ s.name }}</div>
                              <div class="cell-sub">{{ s.role }}</div>
                            </div>
                          </div>
                        </td>
                        <td><span class="cell-name">{{ s.company }}</span></td>
                        <td><span class="mono-bold">{{ s.qtdVendas }}</span></td>
                        <td>{{ s.cotacoesParticipadas }}</td>
                        <td>
                          <div class="inline-bar">
                            <div class="ib-fill" :style="{ width: s.taxaAceite+'%', background: s.taxaAceite >= 60 ? 'var(--green)' : 'var(--accent)' }"></div>
                            <span class="ib-val">{{ s.taxaAceite }}%</span>
                          </div>
                        </td>
                        <td><span class="tag-r tag-green">{{ s.respMin }}h</span></td>
                        <td><span class="tag-r tag-red">{{ s.respMax }}h</span></td>
                        <td>{{ s.tempoMedio }}h</td>
                        <td><span class="mono-bold accent-text">R$ {{ s.totalVendido }}</span></td>
                        <td>
                          <span class="tag-r" :class="s.tempoMedio <= 4 ? 'tag-green' : s.tempoMedio <= 12 ? 'tag-orange' : 'tag-red'">
                            {{ s.tempoMedio <= 4 ? 'Ágil' : s.tempoMedio <= 12 ? 'Regular' : 'Lento' }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div v-else class="empty-chart-state">
                  <span class="material-symbols-outlined">person_off</span>
                  <p class="poppins-regular">Nenhum vendedor no período</p>
                </div>
              </div>

              <!-- Cards: Mais rápido e mais lento -->
              <div class="chart-section-grid">
                <div class="card highlight-card highlight-green" v-if="fastestSeller.name !== '—'">
                  <div class="card-head">
                    <div class="card-icon c-green"><span class="material-symbols-outlined">speed</span></div>
                    <div>
                      <div class="card-title poppins-semibold">Vendedor Mais Rápido</div>
                      <div class="card-sub">Menor tempo médio de resposta</div>
                    </div>
                  </div>
                  <div class="highlight-body">
                    <div class="hb-avatar" :class="'sc-av-'+fastestSeller.avColor">{{ fastestSeller.initials }}</div>
                    <div class="hb-info">
                      <div class="hb-name poppins-semibold">{{ fastestSeller.name }}</div>
                      <div class="hb-company">{{ fastestSeller.company }}</div>
                      <div class="hb-metric green-text">
                        <span class="material-symbols-outlined" style="font-size:18px">timer</span>
                        {{ fastestSeller.tempoMedio }}h tempo médio
                      </div>
                    </div>
                    <div class="hb-stats">
                      <div class="hb-stat">
                        <div class="hb-stat-val green poppins-semibold">{{ fastestSeller.cotacoesParticipadas }}</div>
                        <div class="hb-stat-lbl">Cotações</div>
                      </div>
                      <div class="hb-stat">
                        <div class="hb-stat-val poppins-semibold">{{ fastestSeller.taxaAceite }}%</div>
                        <div class="hb-stat-lbl">Aceite</div>
                      </div>
                      <div class="hb-stat">
                        <div class="hb-stat-val poppins-semibold">{{ fastestSeller.qtdVendas }}</div>
                        <div class="hb-stat-lbl">Vendas</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="card highlight-card highlight-red" v-if="slowestSeller.name !== '—'">
                  <div class="card-head">
                    <div class="card-icon c-red"><span class="material-symbols-outlined">hourglass_bottom</span></div>
                    <div>
                      <div class="card-title poppins-semibold">Vendedor Mais Lento</div>
                      <div class="card-sub">Maior tempo médio de resposta</div>
                    </div>
                  </div>
                  <div class="highlight-body">
                    <div class="hb-avatar" :class="'sc-av-'+slowestSeller.avColor">{{ slowestSeller.initials }}</div>
                    <div class="hb-info">
                      <div class="hb-name poppins-semibold">{{ slowestSeller.name }}</div>
                      <div class="hb-company">{{ slowestSeller.company }}</div>
                      <div class="hb-metric red-text">
                        <span class="material-symbols-outlined" style="font-size:18px">timer_off</span>
                        {{ slowestSeller.tempoMedio }}h tempo médio
                      </div>
                    </div>
                    <div class="hb-stats">
                      <div class="hb-stat">
                        <div class="hb-stat-val red poppins-semibold">{{ slowestSeller.cotacoesParticipadas }}</div>
                        <div class="hb-stat-lbl">Cotações</div>
                      </div>
                      <div class="hb-stat">
                        <div class="hb-stat-val poppins-semibold">{{ slowestSeller.taxaAceite }}%</div>
                        <div class="hb-stat-lbl">Aceite</div>
                      </div>
                      <div class="hb-stat">
                        <div class="hb-stat-val poppins-semibold">{{ slowestSeller.qtdVendas }}</div>
                        <div class="hb-stat-lbl">Vendas</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- ═══ PRODUTOS E MÉTRICAS ADICIONAIS ═══ -->
            <div class="section-block">
              <div class="section-header">
                <div class="section-icon c-yellow">
                  <span class="material-symbols-outlined">inventory_2</span>
                </div>
                <div>
                  <div class="section-title poppins-semibold">Produtos e Métricas de Cotação</div>
                  <div class="section-sub poppins-regular">Principal produto, top vendedor e última cotação</div>
                </div>
              </div>

              <div class="grid-3">
                <!-- Principal produto mais comprado -->
                <div class="card">
                  <div class="card-head">
                    <div class="card-icon c-yellow"><span class="material-symbols-outlined">star</span></div>
                    <div>
                      <div class="card-title poppins-semibold">Produto Mais Comprado</div>
                      <div class="card-sub">Maior volume no período</div>
                    </div>
                  </div>
                  <div class="top-product-body" v-if="topProduct.name !== '—'">
                    <div class="tpb-rank">#1</div>
                    <div class="tpb-info">
                      <div class="tpb-name poppins-semibold">{{ topProduct.name }}</div>
                      <div class="tpb-code">
                        <span class="material-symbols-outlined" style="font-size:13px">barcode_scanner</span>
                        {{ topProduct.barcode }}
                      </div>
                      <div class="tpb-category"><span class="tag-r tag-blue-soft">{{ topProduct.category }}</span></div>
                    </div>
                    <div class="tpb-metrics">
                      <div class="tpb-metric">
                        <div class="tpbm-val accent poppins-semibold">{{ topProduct.totalUnits }}</div>
                        <div class="tpbm-lbl">Unidades</div>
                      </div>
                      <div class="tpb-metric">
                        <div class="tpbm-val poppins-semibold">{{ topProduct.cotacoes }}</div>
                        <div class="tpbm-lbl">Cotações</div>
                      </div>
                      <div class="tpb-metric">
                        <div class="tpbm-val green poppins-semibold">R$ {{ topProduct.avgPrice }}</div>
                        <div class="tpbm-lbl">Preço Médio</div>
                      </div>
                    </div>
                    <div class="tpb-bar-wrap">
                      <div class="tpb-bar-fill" :style="{ width: '100%' }"></div>
                    </div>
                  </div>
                  <div v-else class="empty-chart-state">
                    <span class="material-symbols-outlined">inventory_2</span>
                    <p class="poppins-regular">Sem dados de produtos no período</p>
                  </div>

                  <!-- Outros produtos top -->
                  <div class="top-products-list" v-if="otherTopProducts.length > 0">
                    <div class="tpl-header">Outros mais comprados</div>
                    <div v-for="(p, i) in otherTopProducts" :key="p.barcode" class="tpl-row">
                      <div class="tpl-rank">{{ i + 2 }}</div>
                      <div class="tpl-info">
                        <div class="tpl-name">{{ p.name }}</div>
                        <div class="tpl-code">{{ p.barcode }}</div>
                      </div>
                      <div class="tpl-bar-wrap">
                        <div class="tpl-bar" :style="{ width: p.pct+'%' }"></div>
                      </div>
                      <div class="tpl-qty">{{ p.totalUnits }} un.</div>
                    </div>
                  </div>
                </div>

                <!-- Vendedor que mais vende na loja -->
                <div class="card">
                  <div class="card-head">
                    <div class="card-icon c-orange"><span class="material-symbols-outlined">emoji_events</span></div>
                    <div>
                      <div class="card-title poppins-semibold">Vendedor que Mais Vende</div>
                      <div class="card-sub">Maior quantidade vendida</div>
                    </div>
                  </div>
                  <div class="top-seller-body" v-if="topSeller.name !== '—'">
                    <div class="tsb-crown">👑</div>
                    <div class="sc-avatar large" :class="'sc-av-'+topSeller.avColor">{{ topSeller.initials }}</div>
                    <div class="tsb-name poppins-semibold">{{ topSeller.name }}</div>
                    <div class="tsb-company">{{ topSeller.company }}</div>
                    <div class="tsb-metrics">
                      <div class="tsb-metric">
                        <div class="tsb-val accent poppins-semibold">{{ topSeller.qtdVendas }}</div>
                        <div class="tsb-lbl">Qtd. Vendas</div>
                      </div>
                      <div class="tsb-metric">
                        <div class="tsb-val poppins-semibold">{{ topSeller.cotacoesParticipadas }}</div>
                        <div class="tsb-lbl">Cotações</div>
                      </div>
                      <div class="tsb-metric">
                        <div class="tsb-val green poppins-semibold">{{ topSeller.taxaAceite }}%</div>
                        <div class="tsb-lbl">Aceite</div>
                      </div>
                    </div>
                    <div class="tsb-total">
                      <span class="tsb-total-lbl">Total vendido no período</span>
                      <span class="tsb-total-val poppins-semibold">R$ {{ topSeller.totalVendido }}</span>
                    </div>
                  </div>
                  <div v-else class="empty-chart-state">
                    <span class="material-symbols-outlined">emoji_events</span>
                    <p class="poppins-regular">Sem dados de vendedores no período</p>
                  </div>

                  <div class="chart-wrap h160" v-if="sellersSummary.length > 0">
                    <canvas ref="topSellerChart"></canvas>
                  </div>
                </div>

                <!-- Última cotação + valor médio -->
                <div class="card">
                  <div class="card-head">
                    <div class="card-icon c-blue"><span class="material-symbols-outlined">receipt_long</span></div>
                    <div>
                      <div class="card-title poppins-semibold">Última Cotação & Métricas</div>
                      <div class="card-sub">Cotação mais recente</div>
                    </div>
                  </div>
                  <div class="last-quote-body">
                    <div class="lqb-badge">
                      <span class="material-symbols-outlined" style="font-size:28px;color:var(--blue)">description</span>
                      <div>
                        <div class="lqb-name poppins-semibold">{{ lastCotacao.name }}</div>
                        <div class="lqb-date">
                          <span class="material-symbols-outlined" style="font-size:12px">calendar_today</span>
                          {{ lastCotacao.date }}
                        </div>
                      </div>
                      <span class="tag-r tag-blue-soft lqb-status">{{ lastCotacao.status }}</span>
                    </div>
                    <div class="lqb-details">
                      <div class="lqb-detail-row">
                        <span class="lqb-detail-lbl">
                          <span class="material-symbols-outlined" style="font-size:13px">person</span>
                          Criada por
                        </span>
                        <span class="lqb-detail-val">{{ lastCotacao.createdBy }}</span>
                      </div>
                      <div class="lqb-detail-row">
                        <span class="lqb-detail-lbl">
                          <span class="material-symbols-outlined" style="font-size:13px">inventory</span>
                          Itens
                        </span>
                        <span class="lqb-detail-val">{{ lastCotacao.items }} produtos</span>
                      </div>
                      <div class="lqb-detail-row">
                        <span class="lqb-detail-lbl">
                          <span class="material-symbols-outlined" style="font-size:13px">local_offer</span>
                          Fornecedores
                        </span>
                        <span class="lqb-detail-val">{{ lastCotacao.suppliers }} participantes</span>
                      </div>
                      <div class="lqb-detail-row">
                        <span class="lqb-detail-lbl">
                          <span class="material-symbols-outlined" style="font-size:13px">attach_money</span>
                          Valor total
                        </span>
                        <span class="lqb-detail-val accent-text">R$ {{ lastCotacao.total }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Valor médio por cotação -->
                  <div class="avg-quote-box">
                    <div class="aqb-header">
                      <span class="material-symbols-outlined" style="font-size:16px;color:var(--accent)">calculate</span>
                      Valor Médio por Cotação
                    </div>
                    <div class="aqb-value poppins-semibold">R$ {{ valorMedioCotacao }}</div>
                    <div class="aqb-sub">
                      <span :style="{ color: avgUp ? 'var(--green)' : 'var(--red)' }">
                        {{ avgUp ? '▲' : '▼' }} {{ avgDelta }}%
                      </span>
                      vs período anterior
                    </div>
                    <div class="aqb-breakdown">
                      <div class="aqb-b-item">
                        <div class="aqb-b-val poppins-semibold">R$ {{ avgMin }}</div>
                        <div class="aqb-b-lbl">Mínimo</div>
                      </div>
                      <div class="aqb-b-sep"></div>
                      <div class="aqb-b-item">
                        <div class="aqb-b-val accent-text poppins-semibold">R$ {{ valorMedioCotacao }}</div>
                        <div class="aqb-b-lbl">Médio</div>
                      </div>
                      <div class="aqb-b-sep"></div>
                      <div class="aqb-b-item">
                        <div class="aqb-b-val poppins-semibold">R$ {{ avgMax }}</div>
                        <div class="aqb-b-lbl">Máximo</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <!-- ══ FOOTER ══ -->
          <div class="reports-footer">
            <span class="poppins-regular">Dashboard de Cotações</span>
            <span class="poppins-regular">Última atualização: {{ lastUpdate }}</span>
          </div>

        </template>

      </div>

    </ion-content>
  </ion-page>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { IonPage, IonContent, IonSpinner, IonRefresher, IonRefresherContent } from '@ionic/vue';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  BarController,
  LineController,
  DoughnutController,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { api } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import RefresherIonic from '@/components/refresherIonic.vue';
import BannerSite from '@/components/BannerSite.vue';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  BarController,
  LineController,
  DoughnutController,
  Title,
  Tooltip,
  Legend,
  Filler,
);

export default defineComponent({
  name: 'DashboardCotacao',

  components: {
    IonPage,
    IonContent,
    IonSpinner,
    IonRefresher,
    IonRefresherContent,
    RefresherIonic,
    BannerSite
  },

  data() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

    return {
      // Auth
      auth: null as any,

      // Estados de UI
      loadingDashboard: false,
      error: false,

      // Filtros
      activePeriod: 'mes' as string,
      dateFrom: firstDay.toISOString().slice(0, 10),
      dateTo: today.toISOString().slice(0, 10),
      sellerRankFilter: 'Vendas' as string,
      barcodeSearch: '' as string,
      _searchTimeout: null as any,

      // Charts
      _charts: {} as Record<string, any>,

      periodPresets: [
        { key: 'hoje',      label: 'Hoje' },
        { key: 'semana',    label: 'Semana' },
        { key: 'mes',       label: 'Mês' },
        { key: 'trimestre', label: 'Trimestre' },
        { key: 'ano',       label: 'Ano' },
      ],

      // ── KPIs da API ──
      totalCotacoes: 0 as number,
      cotacoesConcluidas: 0 as number,
      cotacoesPendentes: 0 as number,
      cotacoesCanceladas: 0 as number,
      valorTotalComprado: 0 as number,
      deltaValorPct: null as number | null,
      economiaGerada: 0 as number,
      deltaCotacoes: 0 as number,
      cotacoesUp: true as boolean,
      valorUp: null as boolean | null,

      // ── Mini KPIs ──
      taxaConclusaoApi: 0 as number,
      valorMedioCotacao: '0,00' as string,
      avgMin: '0,00' as string,
      avgMax: '0,00' as string,
      deltaValorMedioPct: null as number | null,
      avgUp: null as boolean | null,
      fornecedoresAtivos: 0 as number,

      // ── Vendedores ──
      sellersDetalhadosApi: [] as any[],
      fastestSellerApi: null as any,
      slowestSellerApi: null as any,
      topSellerApi: null as any,

      // ── Produtos ──
      topProductApi: null as any,
      otherTopProductsApi: [] as any[],

      // ── Última cotação ──
      lastCotacaoApi: null as any,

      // ── Busca produto / gráfico de preço ──
      selectedProduct: null as any,
      priceEvoData: null as any,

      // ── Dados do gráfico de volume ──
      volumeChartData: null as any,

      lastUpdate: new Date().toLocaleString('pt-BR'),
    };
  },

  computed: {
    taxaConclusao(): number {
      if (this.taxaConclusaoApi && this.taxaConclusaoApi !== 0) return this.taxaConclusaoApi;
      if (!this.totalCotacoes) return 0;
      return Math.round((this.cotacoesConcluidas / this.totalCotacoes) * 100);
    },

    periodLabel(): string {
      const labels: Record<string, string> = {
        hoje: 'Hoje',
        semana: 'Esta Semana',
        mes: 'Este Mês',
        trimestre: 'Último Trimestre',
        ano: 'Este Ano',
        custom: `${this.dateFrom} até ${this.dateTo}`,
      };
      return labels[this.activePeriod] || 'Período Personalizado';
    },

    mainKpis(): any[] {
      const deltaCotacoesStr = this.deltaCotacoes != null
        ? `${this.cotacoesUp ? '+' : ''}${this.deltaCotacoes}`
        : '—';
      const deltaValorStr = this.deltaValorPct != null
        ? `${this.deltaValorPct > 0 ? '+' : ''}${this.deltaValorPct}%`
        : '—';

      return [
        {
          label: 'Cotações Criadas',
          value: this.totalCotacoes.toString(),
          icon: 'request_quote',
          cls: 'k-orange',
          delta: deltaCotacoesStr,
          up: this.cotacoesUp,
        },
        {
          label: 'Cotações Concluídas',
          value: this.cotacoesConcluidas.toString(),
          icon: 'task_alt',
          cls: 'k-green',
          delta: deltaCotacoesStr,
          up: this.cotacoesUp,
        },
        {
          label: 'Valor Total Comprado',
          value: `R$ ${this.formatVal(this.valorTotalComprado)}`,
          icon: 'payments',
          cls: 'k-blue',
          delta: deltaValorStr,
          up: this.valorUp,
        },
        {
          label: 'Economia Gerada',
          value: `R$ ${this.formatVal(this.economiaGerada)}`,
          icon: 'savings',
          cls: 'k-yellow',
          delta: '—',
          up: null,
        },
      ];
    },

    miniKpis(): any[] {
      const deltaValorMedioStr = this.deltaValorMedioPct != null
        ? `${Math.abs(this.deltaValorMedioPct)}%`
        : null;

      return [
        {
          label: 'Taxa de Conclusão',
          value: `${this.taxaConclusao}%`,
          trend: null,
          up: null,
          sub: 'do período',
        },
        {
          label: 'Cotações Pendentes',
          value: this.cotacoesPendentes.toString(),
          trend: null,
          up: null,
          sub: 'aguardando resposta',
        },
        {
          label: 'Valor Médio/Cotação',
          value: `R$ ${this.valorMedioCotacao}`,
          trend: deltaValorMedioStr,
          up: this.avgUp,
          sub: 'vs período ant.',
        },
        {
          label: 'Fornecedores Ativos',
          value: this.fornecedoresAtivos.toString(),
          trend: null,
          up: null,
          sub: 'no período',
        },
      ];
    },

    sellersSummary(): any[] {
      return this.sellersDetalhadosApi || [];
    },

    sellersDetailed(): any[] {
      const sorted = [...this.sellersSummary];
      if (this.sellerRankFilter === 'Vendas') sorted.sort((a, b) => b.qtdVendas - a.qtdVendas);
      else if (this.sellerRankFilter === 'Cotações') sorted.sort((a, b) => b.cotacoesParticipadas - a.cotacoesParticipadas);
      else if (this.sellerRankFilter === 'Resposta') sorted.sort((a, b) => a.tempoMedio - b.tempoMedio);
      else if (this.sellerRankFilter === 'Aceite') sorted.sort((a, b) => b.taxaAceite - a.taxaAceite);
      return sorted;
    },

    fastestSeller(): any {
      if (this.fastestSellerApi) return this.fastestSellerApi;
      if (!this.sellersSummary.length) return { name: '—', company: '—', initials: '—', avColor: 'orange', tempoMedio: 0, cotacoesParticipadas: 0, taxaAceite: 0, qtdVendas: 0 };
      return [...this.sellersSummary].sort((a, b) => a.tempoMedio - b.tempoMedio)[0];
    },

    slowestSeller(): any {
      if (this.slowestSellerApi) return this.slowestSellerApi;
      if (!this.sellersSummary.length) return { name: '—', company: '—', initials: '—', avColor: 'orange', tempoMedio: 0, cotacoesParticipadas: 0, taxaAceite: 0, qtdVendas: 0 };
      return [...this.sellersSummary].sort((a, b) => b.tempoMedio - a.tempoMedio)[0];
    },

    topSeller(): any {
      if (this.topSellerApi) return this.topSellerApi;
      if (!this.sellersSummary.length) return { name: '—', company: '—', initials: '—', avColor: 'orange', qtdVendas: 0, cotacoesParticipadas: 0, taxaAceite: 0, totalVendido: '0,00' };
      return [...this.sellersSummary].sort((a, b) => b.qtdVendas - a.qtdVendas)[0];
    },

    topProduct(): any {
      if (this.topProductApi) {
        return {
          name: this.topProductApi.nome,
          barcode: this.topProductApi.codigo_barra || '—',
          category: this.topProductApi.categoria || 'Sem categoria',
          totalUnits: this.topProductApi.totalUnits,
          cotacoes: this.topProductApi.cotacoes,
          avgPrice: this.formatVal(this.topProductApi.avgPrice),
        };
      }
      return { name: '—', barcode: '—', category: '—', totalUnits: 0, cotacoes: 0, avgPrice: '0,00' };
    },

    otherTopProducts(): any[] {
      if (this.otherTopProductsApi?.length > 0) {
        return this.otherTopProductsApi.map((p: any) => ({
          name: p.nome,
          barcode: p.codigo_barra || '—',
          totalUnits: p.totalUnits,
          pct: p.pct || 0,
        }));
      }
      return [];
    },

    lastCotacao(): any {
      if (this.lastCotacaoApi) {
        return {
          name: this.lastCotacaoApi.name || '—',
          date: this.lastCotacaoApi.date || '—',
          status: this.lastCotacaoApi.status || '—',
          createdBy: this.lastCotacaoApi.createdBy || '—',
          items: this.lastCotacaoApi.items ?? 0,
          suppliers: this.lastCotacaoApi.suppliers ?? 0,
          total: this.lastCotacaoApi.total || '0,00',
        };
      }
      return { name: '—', date: '—', status: '—', createdBy: '—', items: 0, suppliers: 0, total: '0,00' };
    },

    avgDelta(): number {
      return this.deltaValorMedioPct != null ? Math.abs(this.deltaValorMedioPct) : 0;
    },
  },

  methods: {
    formatVal(v: any): string {
      if (v == null) return '0,00';
      return Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },

    async carregarDashboard() {
      this.loadingDashboard = true;
      this.error = false;

      try {
        const authStore = useAuthStore();
        this.auth = authStore;

        const payload = {
          timestamp_inicio: new Date(this.dateFrom).getTime(),
          timestamp_fim: new Date(this.dateTo + 'T23:59:59').getTime(),
        };

        const res = await api.post(
          `/mvpu/cotacao/getDashboardCotacao/${authStore.loja.id_loja}`,
          payload
        );

        const d = res.data?.data;
        if (!d) return;

        // KPIs principais
        const k = d.kpis || {};
        this.totalCotacoes       = k.totalCotacoes       ?? 0;
        this.cotacoesConcluidas  = k.cotacoesConcluidas  ?? 0;
        this.cotacoesPendentes   = k.cotacoesPendentes   ?? 0;
        this.cotacoesCanceladas  = k.cotacoesCanceladas  ?? 0;
        this.valorTotalComprado  = k.valorTotalComprado  ?? 0;
        this.deltaValorPct       = k.deltaValorPct       ?? null;
        this.economiaGerada      = k.economiaGerada      ?? 0;
        this.deltaCotacoes       = k.deltaCotacoes       ?? 0;
        this.cotacoesUp          = k.cotacoesUp          ?? true;
        this.valorUp             = k.valorUp             ?? null;

        // Mini KPIs
        const mk = d.miniKpis || {};
        this.taxaConclusaoApi   = mk.taxaConclusao      ?? 0;
        this.cotacoesPendentes  = mk.cotacoesPendentes  ?? this.cotacoesPendentes;
        this.valorMedioCotacao  = mk.valorMedioCotacao != null ? this.formatVal(mk.valorMedioCotacao) : '0,00';
        this.avgMin             = mk.avgMin != null ? this.formatVal(mk.avgMin) : '0,00';
        this.avgMax             = mk.avgMax != null ? this.formatVal(mk.avgMax) : '0,00';
        this.deltaValorMedioPct = mk.deltaValorMedioPct ?? null;
        this.avgUp              = mk.avgUp              ?? null;
        this.fornecedoresAtivos = mk.fornecedoresAtivos ?? 0;

        // Vendedores
        const sellers = d.sellers || {};
        this.sellersDetalhadosApi = sellers.detalhados    || [];
        this.fastestSellerApi     = sellers.fastestSeller || null;
        this.slowestSellerApi     = sellers.slowestSeller || null;
        this.topSellerApi         = sellers.topSeller     || null;

        // Produtos
        const produtos = d.produtos || {};
        this.topProductApi       = produtos.topProduct       || null;
        this.otherTopProductsApi = produtos.otherTopProducts || [];

        // Volume chart
        this.volumeChartData = d.volumeChartData || null;

        // Última cotação
        this.lastCotacaoApi = d.lastCotacao || null;

        this.lastUpdate = new Date().toLocaleString('pt-BR');

        this.$nextTick(() => {
          this.refreshVolumeChart();
          this.refreshTopSellerChart();
        });

      } catch (err) {
        this.error = true;
      } finally {
        this.loadingDashboard = false;
      }
    },

    handleRefresh(event: any) {
      setTimeout(() => {
        event.target.complete();
        window.location.reload();
      }, 1000);
    },

    setPreset(key: string) {
      this.activePeriod = key;
      this.barcodeSearch = '';
      this.selectedProduct = null;
      this.priceEvoData = null;

      const today = new Date();
      this.dateTo = today.toISOString().slice(0, 10);

      if (key === 'hoje') {
        this.dateFrom = today.toISOString().slice(0, 10);
      } else if (key === 'semana') {
        const d = new Date(today);
        d.setDate(d.getDate() - 7);
        this.dateFrom = d.toISOString().slice(0, 10);
      } else if (key === 'mes') {
        this.dateFrom = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
      } else if (key === 'trimestre') {
        const d = new Date(today);
        d.setMonth(d.getMonth() - 3);
        this.dateFrom = d.toISOString().slice(0, 10);
      } else if (key === 'ano') {
        this.dateFrom = new Date(today.getFullYear(), 0, 1).toISOString().slice(0, 10);
      }

      this.refreshData();
    },

    applyCustomRange() {
      this.activePeriod = 'custom';
      this.refreshData();
    },

    refreshData() {
      this.carregarDashboard();
      if (this.barcodeSearch) {
        this.searchProduct();
      }
    },

    debouncedSearch() {
      clearTimeout(this._searchTimeout);
      this._searchTimeout = setTimeout(() => this.searchProduct(), 1200);
    },

    async searchProduct() {
      const q = this.barcodeSearch.trim();
      if (!q) {
        this.selectedProduct = null;
        this.priceEvoData = null;
        return;
      }

      try {
        const authStore = useAuthStore();

        const payload = {
          codigo_barra: q,
          timestamp_inicio: new Date(this.dateFrom).getTime(),
          timestamp_fim: new Date(this.dateTo + 'T23:59:59').getTime(),
        };

        const res = await api.post(
          `/mvpu/cotacao/getEvolucaoPrecoProduto/${authStore.loja.id_loja}`,
          payload
        );

        const d = res.data?.data;
        if (!d || d.semDados) {
          this.priceEvoData = null;
          this.selectedProduct = null;
          this.refreshPriceEvoChart();
          return;
        }

        const prod = d.produto || {};
        this.selectedProduct = {
          barcode: prod.barcode || q,
          name: prod.name || q,
          category: prod.category || 'Sem categoria',
          lastPrice: prod.lastPrice || '0,00',
          priceChange: prod.priceChange ?? 0,
          totalQuotes: prod.totalQuotes ?? 0,
        };

        this.priceEvoData = d.priceEvoChart || null;

        this.$nextTick(() => this.refreshPriceEvoChart());

      } catch (e) {
        // silencioso
      }
    },

    // ── Charts (Chart.js) ────────────────────────────────────────────────
    getChartColors() {
      return {
        ACCENT: '#FF8049',
        GREEN: '#16a34a',
        BLUE: '#2563eb',
        TEXT: '#64748b',
        GRID: 'rgba(226,232,240,0.8)',
      };
    },

    getBaseTooltip() {
      return {
        backgroundColor: '#1e293b',
        titleColor: '#f8fafc',
        bodyColor: '#94a3b8',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        displayColors: true,
      };
    },

    refreshVolumeChart() {
      const { ACCENT, GREEN, TEXT, GRID } = this.getChartColors();
      const tooltip = this.getBaseTooltip();

      const labels = this.volumeChartData?.labels || [];
      const criadas = this.volumeChartData?.datasets?.[0]?.data || this.volumeChartData?.criadas || [];
      const concluid = this.volumeChartData?.datasets?.[1]?.data || this.volumeChartData?.concluidas || [];

      const ctx = this.$refs.volumeChart as HTMLCanvasElement;
      if (!ctx) return;

      if (this._charts.volume) this._charts.volume.destroy();

      this._charts.volume = new ChartJS(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            { label: 'Criadas', data: criadas, backgroundColor: ACCENT + 'CC', borderRadius: 4, borderSkipped: false },
            { label: 'Concluídas', data: concluid, backgroundColor: GREEN + 'CC', borderRadius: 4, borderSkipped: false },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { color: TEXT, font: { size: 11 }, boxWidth: 10, padding: 16 } },
            tooltip,
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: {
                color: TEXT,
                font: { size: 10 },
                callback: function (value: any) {
                  const label = (this as any).getLabelForValue(value);
                  if (label?.includes('-')) {
                    const [, mes, dia] = label.split('-');
                    return `${dia}/${mes}`;
                  }
                  return label;
                },
              },
            },
            y: {
              beginAtZero: true,
              grid: { color: GRID },
              ticks: { color: TEXT, font: { size: 10 }, stepSize: 1 },
            },
          },
        },
      });
    },

    refreshPriceEvoChart() {
      const { ACCENT, BLUE, TEXT, GRID } = this.getChartColors();
      const tooltip = this.getBaseTooltip();

      let labels: any[] = [];
      let data: any[] = [];
      let mediaArray: any[] = [];

      if (this.priceEvoData) {
        labels = this.priceEvoData.labels || [];
        data = this.priceEvoData.precos || [];
        const mediaPeriodo = this.priceEvoData.mediaPeriodo ?? null;
        mediaArray = this.priceEvoData.mediaArray || labels.map(() => mediaPeriodo);
      }

      const ctx = this.$refs.priceEvoChart as HTMLCanvasElement;
      if (!ctx) return;

      if (this._charts.priceEvo) this._charts.priceEvo.destroy();

      this._charts.priceEvo = new ChartJS(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: this.selectedProduct?.name || 'Evolução de Preço',
              data,
              borderColor: ACCENT,
              backgroundColor: 'rgba(255,128,73,0.10)',
              borderWidth: 2.5,
              pointBackgroundColor: ACCENT,
              pointRadius: 4,
              pointHoverRadius: 6,
              fill: true,
              tension: 0.35,
            },
            {
              label: 'Média do período',
              data: mediaArray,
              borderColor: BLUE + '88',
              borderWidth: 1.5,
              borderDash: [6, 4],
              pointRadius: 0,
              fill: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { color: TEXT, font: { size: 11 }, boxWidth: 10 } },
            tooltip: { ...tooltip, callbacks: { label: (ctx: any) => `R$ ${Number(ctx.parsed.y).toFixed(2)}` } },
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: TEXT, font: { size: 10 } } },
            y: {
              grid: { color: GRID },
              ticks: { color: TEXT, font: { size: 10 }, callback: (v: any) => `R$ ${Number(v).toFixed(2)}` },
            },
          },
        },
      });
    },

    refreshTopSellerChart() {
      const { TEXT } = this.getChartColors();
      const tooltip = this.getBaseTooltip();

      const ctx = this.$refs.topSellerChart as HTMLCanvasElement;
      if (!ctx) return;

      if (this._charts.topSeller) this._charts.topSeller.destroy();

      const sellersData = this.sellersSummary.length > 0
        ? this.sellersSummary
        : [{ name: 'Sem dados', qtdVendas: 1 }];

      this._charts.topSeller = new ChartJS(ctx, {
        type: 'doughnut',
        data: {
          labels: sellersData.map((s: any) => (s.name ? s.name.split(' ')[0] : '—')),
          datasets: [{
            data: sellersData.map((s: any) => s.qtdVendas || 0),
            backgroundColor: ['#FF8049CC', '#2563ebCC', '#16a34aCC', '#dc2626CC', '#ca8a04CC'],
            borderWidth: 2,
            borderColor: '#ffffff',
            hoverOffset: 6,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '65%',
          plugins: {
            legend: { position: 'bottom', labels: { color: TEXT, font: { size: 10 }, padding: 8, boxWidth: 8 } },
            tooltip,
          },
        },
      });
    },
  },

  mounted() {
    const authStore = useAuthStore();
    if (!authStore.token && !localStorage.getItem('token')) {
      this.$router.replace({ name: 'Login' });
      return;
    }

    this.carregarDashboard();
  },

  beforeUnmount() {
    Object.values(this._charts).forEach((c: any) => c && c.destroy && c.destroy());
  },
});
</script>
<style scoped>
/* ══════════════════════════════════════
   PAGE / IONIC WRAPPER
══════════════════════════════════════ */
.dash-cotacao-page {
  background-color: #f8f9fa;
}
.dash-content {
  --background: #f8f9fa;
  --padding-start: 0;
  --padding-end: 0;
  --padding-top: 0;
  --padding-bottom: 0;
}

/* ══════════════════════════════════════
   TOKENS — Design System Market Vizium
══════════════════════════════════════ */
.cotacao-root {
  --accent:    #FF8049;
  --accent2:   #FF804915;
  --acc-h:     #E65D26;
  --green:     #16a34a;
  --green2:    #dcfce7;
  --blue:      #2563eb;
  --blue2:     #dbeafe;
  --yellow:    #ca8a04;
  --yellow2:   #fef9c3;
  --red:       #dc2626;
  --red2:      #fee2e2;
  --bg:        #f8f9fa;
  --bg-card:   #ffffff;
  --bg-el:     #f1f3f5;
  --bg-el2:    #e9ecef;
  --border:    #e2e8f0;
  --border2:   #cbd5e1;
  --text1:     #1e293b;
  --text2:     #64748b;
  --muted:     #94a3b8;
  --radius:    13px;
  --radius-s:  8px;
  --shadow:    0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03);
  --shadow-md: 0 10px 15px -3px rgba(0,0,0,0.06), 0 4px 6px -2px rgba(0,0,0,0.03);

  font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
  background: var(--bg);
  color: var(--text1);
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

/* ══ LOADING / ERROR ══ */
.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  text-align: center;
  gap: 10px;
  padding: 0 20px;
}
.loading-state p, .error-state p { font-size: 14px; color: var(--muted); }
.error-icon { font-size: 52px; color: var(--red); }
.error-state h3 { font-size: 16px; color: var(--text1); margin: 0; }
.retry-btn {
  margin-top: 10px;
  padding: 10px 24px;
  background: var(--accent);
  color: white;
  border-radius: var(--radius-s);
  border: none;
  font-size: 14px;
  cursor: pointer;
  font-family: inherit;
}
.retry-btn:hover { background: var(--acc-h); }

/* ══ HEADER ══ */
.reports-header {
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
  padding: 16px 28px;
  display: flex; align-items: center; justify-content: space-between;
  gap: 16px; position: sticky; top: 0; z-index: 100;
  box-shadow: var(--shadow);
}
.rh-left { display: flex; align-items: center; gap: 16px; min-width: 0; }
.rh-brand { display: flex; align-items: center; gap: 12px; min-width: 0; }
.rh-brand-icon {
  width: 40px; height: 40px; background: var(--accent);
  border-radius: var(--radius-s);
  display: flex; align-items: center; justify-content: center;
  color: white; font-size: 20px; flex-shrink: 0;
}
.rh-title { font-size: 17px; font-weight: 800; color: var(--text1); letter-spacing: -0.3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rh-sub { font-size: 11.5px; color: var(--muted); margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rh-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.rh-sync { display: flex; align-items: center; gap: 5px; font-size: 11.5px; color: var(--muted); white-space: nowrap; }
.rh-refresh-btn {
  width: 34px; height: 34px; border-radius: var(--radius-s);
  background: var(--bg-el); border: 1px solid var(--border);
  color: var(--text2); display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.15s; flex-shrink: 0;
}
.rh-refresh-btn:hover { background: var(--bg-el2); }
.rh-refresh-btn.spinning span { animation: rh-spin 0.9s linear infinite; }
@keyframes rh-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

/* ══ FILTER BAR ══ */
.filter-bar {
  background: var(--bg-card); border-bottom: 1px solid var(--border);
  padding: 12px 28px; display: flex; align-items: center;
  gap: 12px; flex-wrap: wrap;
}
.filter-section { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; min-width: 0; }
.filter-label {
  display: flex; align-items: center; gap: 4px;
  font-size: 11px; font-weight: 700; color: var(--muted);
  text-transform: uppercase; letter-spacing: 0.4px; white-space: nowrap;
}
.period-chips { display: flex; gap: 4px; flex-wrap: nowrap; overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
.period-chips::-webkit-scrollbar { display: none; }
.pchip {
  display: flex; align-items: center; gap: 4px;
  padding: 5px 11px; border-radius: 20px;
  background: var(--bg-el); border: 1px solid var(--border);
  color: var(--text2); font-size: 11.5px; font-weight: 500;
  cursor: pointer; transition: all 0.15s; font-family: inherit;
  white-space: nowrap; flex-shrink: 0;
}
.pchip.active { background: var(--accent2); border-color: var(--accent); color: var(--accent); font-weight: 700; }
.pchip:hover:not(.active) { background: var(--bg-el2); }
.date-range {
  display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
  background: var(--bg-el); border: 1px solid var(--border);
  border-radius: var(--radius-s); padding: 4px 10px;
}
.dr-label { font-size: 11px; color: var(--muted); white-space: nowrap; }
.dr-input { border: none; background: transparent; font-size: 12px; color: var(--text1); font-family: inherit; outline: none; min-width: 0; }
.btn-apply {
  display: flex; align-items: center; gap: 4px;
  padding: 5px 12px; border-radius: var(--radius-s);
  background: var(--accent); color: white; border: none;
  font-size: 12px; font-weight: 600; cursor: pointer;
  font-family: inherit; transition: all 0.15s; white-space: nowrap;
}
.btn-apply:hover { background: var(--acc-h); }

/* ══ PERIOD BADGE ══ */
.period-badge-row {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 28px; border-bottom: 1px solid var(--border);
  background: var(--accent2); flex-wrap: wrap;
}
.period-badge, .pb-location {
  display: flex; align-items: center; gap: 5px;
  font-size: 12.5px; font-weight: 600; color: var(--accent);
  background: white; border: 1px solid var(--accent);
  padding: 4px 12px; border-radius: 20px; white-space: nowrap;
}
.pb-stats-wrap { display: flex; gap: 8px; flex-wrap: wrap; margin-left: auto; }
.pb-stat {
  display: flex; flex-direction: column; align-items: flex-end;
  background: white; border: 1px solid var(--border);
  padding: 4px 12px; border-radius: var(--radius-s);
}
.pb-stat-val { font-size: 13px; font-weight: 800; color: var(--text1); }
.pb-stat-val.accent { color: var(--accent); }
.pb-stat-val.green { color: var(--green); }
.pb-stat-lbl { font-size: 10px; color: var(--muted); }
.accent-text { color: var(--accent); }
.green-text { color: var(--green); }
.red-text { color: var(--red); }

/* ══ CONTENT ══ */
.reports-content { padding: 24px 28px; flex: 1; display: flex; flex-direction: column; gap: 32px; }

/* ══ SECTION BLOCK ══ */
.section-block { display: flex; flex-direction: column; gap: 16px; min-width: 0; }
.section-header {
  display: flex; align-items: center; gap: 12px;
  padding: 16px 20px; background: var(--bg-card);
  border-radius: var(--radius); border: 1px solid var(--border);
  box-shadow: var(--shadow);
}
.section-icon {
  width: 38px; height: 38px; border-radius: var(--radius-s);
  display: flex; align-items: center; justify-content: center;
  color: white; font-size: 18px; flex-shrink: 0;
}
.section-title { font-size: 15px; font-weight: 800; color: var(--text1); letter-spacing: -0.3px; }
.section-sub { font-size: 12px; color: var(--muted); margin-top: 2px; }

/* ══ CARDS ══ */
.card {
  background: var(--bg-card); border-radius: var(--radius);
  border: 1px solid var(--border); box-shadow: var(--shadow);
  overflow: hidden; min-width: 0;
}
.card-head {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 18px; border-bottom: 1px solid var(--border);
}
.card-icon {
  width: 34px; height: 34px; border-radius: var(--radius-s);
  display: flex; align-items: center; justify-content: center;
  color: white; font-size: 17px; flex-shrink: 0;
}
.card-title { font-size: 13.5px; font-weight: 700; color: var(--text1); }
.card-sub { font-size: 11px; color: var(--muted); margin-top: 1px; }
.card-actions-row { padding: 10px 18px; border-bottom: 1px solid var(--border); }
.chip-filter-row { display: flex; gap: 4px; flex-wrap: wrap; }
.chip {
  padding: 4px 10px; border-radius: 20px;
  background: var(--bg-el); border: 1px solid var(--border);
  color: var(--text2); font-size: 11px; font-weight: 500;
  cursor: pointer; transition: all 0.15s; font-family: inherit;
  white-space: nowrap;
}
.chip.active { background: var(--accent2); border-color: var(--accent); color: var(--accent); font-weight: 700; }
.chip:hover:not(.active) { background: var(--bg-el2); }

/* ══ COLOR HELPERS ══ */
.c-orange { background: var(--accent); }
.c-green  { background: var(--green);  }
.c-blue   { background: var(--blue);   }
.c-yellow { background: var(--yellow); }
.c-red    { background: var(--red);    }

/* ══ KPI GRID ══ */
.kpi-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.kpi-report {
  position: relative; overflow: hidden;
  background: var(--bg-card); border-radius: var(--radius);
  border: 1px solid var(--border); padding: 18px 18px 14px;
  display: flex; gap: 12px; align-items: flex-start;
  box-shadow: var(--shadow); min-width: 0;
}
.kr-icon {
  width: 40px; height: 40px; border-radius: var(--radius-s);
  display: flex; align-items: center; justify-content: center;
  color: white; font-size: 20px; flex-shrink: 0;
}
.kr-body { flex: 1; min-width: 0; }
.kr-label { font-size: 10.5px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; }
.kr-value { font-size: 22px; font-weight: 900; letter-spacing: -0.8px; color: var(--text1); margin: 4px 0 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.kr-footer { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.kr-delta { display: flex; align-items: center; gap: 2px; font-size: 11.5px; font-weight: 700; }
.kr-delta.up      { color: var(--green); }
.kr-delta.down    { color: var(--red);   }
.kr-delta.neutral { color: var(--muted); }
.kr-sub { font-size: 11px; color: var(--muted); }
.kr-bg {
  position: absolute; right: -10px; bottom: -10px;
  font-size: 72px !important; opacity: 0.04; pointer-events: none;
}
.k-orange .kr-icon { background: var(--accent); }
.k-green  .kr-icon { background: var(--green);  }
.k-blue   .kr-icon { background: var(--blue);   }
.k-yellow .kr-icon { background: var(--yellow); }
.k-red    .kr-icon { background: var(--red);    }

/* ══ MINI KPI ══ */
.kpi-mini {
  background: var(--bg-card); border-radius: var(--radius);
  border: 1px solid var(--border); padding: 14px 16px;
  box-shadow: var(--shadow); min-width: 0;
}
.kmr-label { font-size: 10.5px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 6px; }
.kmr-value { font-size: 19px; font-weight: 900; color: var(--text1); letter-spacing: -0.5px; }
.kmr-sub { font-size: 11px; margin-top: 4px; color: var(--muted); }

/* ══ CHART GRID ══ */
.chart-section-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.chart-wrap { padding: 14px 18px; position: relative; }
.chart-wrap.h260 { height: 260px; }
.chart-wrap.h160 { height: 160px; }
.chart-wrap canvas { width: 100% !important; height: 100% !important; }

/* ══ BARCODE SEARCH ══ */
.barcode-search {
  display: flex; align-items: center; gap: 6px;
  background: var(--bg-el); border: 1px solid var(--border);
  border-radius: var(--radius-s); padding: 5px 10px;
}
.barcode-input {
  border: none; background: transparent; font-size: 12px;
  color: var(--text1); font-family: inherit; outline: none;
  width: 100%; min-width: 0;
}
.barcode-input::placeholder { color: var(--muted); }
.btn-barcode {
  background: var(--accent); color: white;
  border: none; border-radius: 6px;
  padding: 3px 8px; cursor: pointer;
  display: flex; align-items: center;
  transition: all 0.15s; flex-shrink: 0;
}
.btn-barcode:hover { background: var(--acc-h); }

/* ══ SELECTED PRODUCT BAR ══ */
.selected-product-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 18px; background: var(--accent2);
  border-bottom: 1px solid var(--border); flex-wrap: wrap; gap: 8px;
}
.spb-info { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; min-width: 0; }
.spb-code { font-size: 11px; font-weight: 700; color: var(--muted); font-family: monospace; }
.spb-name { font-size: 13px; font-weight: 700; color: var(--text1); }
.spb-stats { display: flex; gap: 16px; flex-wrap: wrap; }
.spb-stat { text-align: right; }
.spb-stat-val { font-size: 13px; font-weight: 800; color: var(--text1); }
.spb-stat-lbl { font-size: 10px; color: var(--muted); }

/* ══ EMPTY CHART STATE ══ */
.empty-chart-state {
  min-height: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
}
.empty-chart-state span { font-size: 36px; color: var(--border); }
.empty-chart-state p { font-size: 12px; color: var(--muted); text-align: center; margin: 0; }

/* ══ REPORT TABLE ══ */
.table-wrapper {
  max-height: 320px;
  overflow-y: auto;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.report-table {
  width: 100%; border-collapse: collapse;
  font-size: 12px; min-width: 760px;
}
.report-table thead tr {
  background: var(--bg-el); border-bottom: 1px solid var(--border);
}
.report-table th {
  padding: 10px 12px;
  text-align: left; font-size: 10.5px;
  font-weight: 700; color: var(--muted); white-space: nowrap;
}
.report-table tbody tr {
  border-bottom: 1px solid var(--border); transition: background 0.1s;
}
.report-table tbody tr:hover { background: var(--accent2); }
.report-table td { padding: 10px 12px; vertical-align: middle; white-space: nowrap; }
.user-cell { display: flex; align-items: center; gap: 8px; }
.mini-av {
  width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 800; color: white; flex-shrink: 0;
}
.cell-name { font-size: 12.5px; font-weight: 600; color: var(--text1); }
.cell-sub { font-size: 11px; color: var(--muted); }
.mono-bold { font-weight: 700; font-family: 'Inter', monospace; }
.rank-num {
  display: inline-flex; align-items: center; justify-content: center;
  width: 22px; height: 22px; border-radius: 6px;
  font-size: 11px; font-weight: 800;
  background: var(--bg-el); color: var(--muted);
}
.rank-num.gold   { background: #fef9c3; color: #b45309; }
.rank-num.silver { background: #f1f5f9; color: #475569; }
.rank-num.bronze { background: #fef3c7; color: #92400e; }
.inline-bar {
  display: flex; align-items: center; gap: 6px;
  height: 18px; background: var(--bg-el2);
  border-radius: 4px; overflow: hidden; position: relative;
  min-width: 80px;
}
.ib-fill { height: 100%; border-radius: 4px; transition: width 0.4s; }
.ib-val { position: absolute; right: 6px; font-size: 10px; font-weight: 700; color: var(--text1); }
.tag-r {
  display: inline-block; padding: 2px 8px; border-radius: 8px;
  font-size: 11px; font-weight: 700; white-space: nowrap;
}
.tag-green  { background: var(--green2); color: var(--green); }
.tag-orange { background: var(--yellow2); color: var(--yellow); }
.tag-red    { background: var(--red2); color: var(--red); }
.tag-blue   { background: var(--blue2); color: var(--blue); }
.tag-blue-soft { background: var(--blue2); color: var(--blue); }

/* ══ HIGHLIGHT CARD ══ */
.highlight-card.highlight-green { border-top: 3px solid var(--green); }
.highlight-card.highlight-red   { border-top: 3px solid var(--red); }
.highlight-body {
  display: flex; align-items: center; gap: 16px;
  padding: 16px 18px; flex-wrap: wrap;
}
.hb-avatar {
  width: 48px; height: 48px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 17px; font-weight: 800; color: white; flex-shrink: 0;
}
.hb-info { flex: 1; min-width: 120px; }
.hb-name { font-size: 14px; font-weight: 800; color: var(--text1); }
.hb-company { font-size: 11.5px; color: var(--muted); margin-bottom: 4px; }
.hb-metric {
  display: flex; align-items: center; gap: 4px;
  font-size: 12.5px; font-weight: 700;
}
.hb-stats { display: flex; flex-direction: column; gap: 6px; }
.hb-stat { text-align: right; }
.hb-stat-val { font-size: 14px; font-weight: 900; color: var(--text1); }
.hb-stat-val.green { color: var(--green); }
.hb-stat-val.red   { color: var(--red); }
.hb-stat-lbl { font-size: 10px; color: var(--muted); }

/* ══ GRID ══ */
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }

/* ══ TOP PRODUCT ══ */
.top-product-body { padding: 16px 18px; display: flex; flex-direction: column; gap: 10px; }
.tpb-rank { font-size: 36px; font-weight: 900; color: var(--accent); opacity: 0.25; line-height: 1; }
.tpb-info { display: flex; flex-direction: column; gap: 4px; }
.tpb-name { font-size: 14px; font-weight: 800; color: var(--text1); }
.tpb-code { display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--muted); font-family: monospace; }
.tpb-category { margin-top: 2px; }
.tpb-metrics { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
.tpb-metric { text-align: center; }
.tpbm-val { font-size: 16px; font-weight: 900; color: var(--text1); }
.tpbm-val.accent { color: var(--accent); }
.tpbm-val.green  { color: var(--green); }
.tpbm-lbl { font-size: 10px; color: var(--muted); }
.tpb-bar-wrap { height: 5px; background: var(--bg-el2); border-radius: 3px; overflow: hidden; }
.tpb-bar-fill { height: 100%; background: var(--accent); border-radius: 3px; transition: width 0.5s; }
.top-products-list { border-top: 1px solid var(--border); padding: 12px 18px 14px; }
.tpl-header { font-size: 10.5px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 10px; }
.tpl-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.tpl-rank { font-size: 11px; font-weight: 700; color: var(--muted); width: 14px; text-align: center; flex-shrink: 0; }
.tpl-info { min-width: 0; width: 110px; flex-shrink: 0; }
.tpl-name { font-size: 11.5px; font-weight: 600; color: var(--text1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tpl-code { font-size: 10px; color: var(--muted); font-family: monospace; }
.tpl-bar-wrap { flex: 1; height: 6px; background: var(--bg-el2); border-radius: 3px; overflow: hidden; min-width: 30px; }
.tpl-bar { height: 100%; background: var(--accent); border-radius: 3px; opacity: 0.55; }
.tpl-qty { font-size: 11px; color: var(--muted); width: 52px; text-align: right; white-space: nowrap; flex-shrink: 0; }

/* ══ TOP SELLER ══ */
.top-seller-body {
  padding: 16px 18px; display: flex; flex-direction: column;
  align-items: center; gap: 8px;
}
.tsb-crown { font-size: 24px; line-height: 1; }
.sc-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 800; color: white; flex-shrink: 0;
}
.sc-avatar.large { width: 52px; height: 52px; font-size: 18px; }
.sc-av-orange { background: var(--accent); }
.sc-av-blue   { background: var(--blue); }
.sc-av-green  { background: var(--green); }
.sc-av-red    { background: var(--red); }
.sc-av-yellow { background: var(--yellow); }
.sc-av-purple { background: #7c3aed; }
.tsb-name { font-size: 15px; font-weight: 800; color: var(--text1); text-align: center; }
.tsb-company { font-size: 11.5px; color: var(--muted); text-align: center; margin-bottom: 4px; }
.tsb-metrics { display: flex; gap: 20px; flex-wrap: wrap; justify-content: center; }
.tsb-metric { text-align: center; }
.tsb-val { font-size: 16px; font-weight: 900; color: var(--text1); }
.tsb-val.accent { color: var(--accent); }
.tsb-val.green  { color: var(--green); }
.tsb-lbl { font-size: 10px; color: var(--muted); }
.tsb-total {
  display: flex; flex-direction: column; align-items: center;
  border-top: 1px solid var(--border); padding-top: 10px; width: 100%;
}
.tsb-total-lbl { font-size: 11px; color: var(--muted); }
.tsb-total-val { font-size: 18px; font-weight: 900; color: var(--accent); letter-spacing: -0.5px; }

/* ══ LAST QUOTE ══ */
.last-quote-body { padding: 14px 18px; display: flex; flex-direction: column; gap: 12px; }
.lqb-badge {
  display: flex; align-items: center; gap: 10px;
  padding: 10px; background: var(--blue2);
  border-radius: var(--radius-s); flex-wrap: wrap;
}
.lqb-name { font-size: 14px; font-weight: 800; color: var(--blue); }
.lqb-date { display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--muted); margin-top: 2px; }
.lqb-status { margin-left: auto; }
.lqb-details { display: flex; flex-direction: column; gap: 8px; }
.lqb-detail-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
.lqb-detail-lbl { display: flex; align-items: center; gap: 4px; font-size: 11.5px; color: var(--muted); }
.lqb-detail-val { font-size: 12px; font-weight: 700; color: var(--text1); }

/* ══ AVG QUOTE BOX ══ */
.avg-quote-box {
  border-top: 1px solid var(--border);
  padding: 14px 18px; background: var(--accent2);
}
.aqb-header {
  display: flex; align-items: center; gap: 6px;
  font-size: 11px; font-weight: 700; color: var(--muted);
  text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 6px;
}
.aqb-value { font-size: 24px; font-weight: 900; color: var(--accent); letter-spacing: -0.8px; }
.aqb-sub { font-size: 11.5px; color: var(--muted); margin-top: 2px; margin-bottom: 12px; }
.aqb-breakdown { display: flex; align-items: center; gap: 8px; justify-content: space-between; }
.aqb-b-item { text-align: center; flex: 1; min-width: 0; }
.aqb-b-val { font-size: 13px; font-weight: 800; color: var(--text1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.aqb-b-lbl { font-size: 10px; color: var(--muted); }
.aqb-b-sep { width: 1px; height: 28px; background: var(--border); flex-shrink: 0; }

/* ══ STOCK SUMMARY ══ */
.stock-summary {
  display: flex; justify-content: space-around;
  padding: 12px 18px; border-top: 1px solid var(--border); flex-wrap: wrap; gap: 8px;
}
.ss-item { text-align: center; min-width: 60px; }
.ss-val  { font-size: 17px; font-weight: 800; letter-spacing: -0.4px; }
.ss-val.accent { color: var(--accent); }
.ss-val.green  { color: var(--green);  }
.ss-val.red    { color: var(--red);    }
.ss-lbl  { font-size: 10px; color: var(--muted); margin-top: 2px; }

/* ══ FOOTER ══ */
.reports-footer {
  padding: 14px 28px; border-top: 1px solid var(--border);
  display: flex; justify-content: space-between; flex-wrap: wrap; gap: 4px;
  font-size: 11px; color: var(--muted);
  background: var(--bg-card);
}

/* ══════════════════════════════════════
   RESPONSIVE — comprimido até 320px
══════════════════════════════════════ */
@media (max-width: 1280px) {
  .kpi-grid-4        { grid-template-columns: repeat(2, 1fr); }
  .chart-section-grid { grid-template-columns: 1fr; }
}
@media (max-width: 900px) {
  .reports-header { padding: 14px 18px; }
  .filter-bar { padding: 10px 18px; }
  .period-badge-row { padding: 10px 18px; flex-direction: column; align-items: flex-start; }
  .pb-stats-wrap { margin-left: 0; width: 100%; }
  .reports-content { padding: 16px; gap: 24px; }
  .kpi-grid-4 { grid-template-columns: 1fr 1fr; }
  .grid-3 { grid-template-columns: 1fr; }
  .chart-section-grid { grid-template-columns: 1fr; }
  .reports-footer { padding: 14px 18px; flex-direction: column; text-align: center; }
}
@media (max-width: 640px) {
  .rh-title { font-size: 15px; }
  .rh-sub { font-size: 10.5px; }
  .rh-sync-text { display: none; }
  .filter-section { width: 100%; }
  .period-chips { width: 100%; }
  .date-range { width: 100%; }
  .dr-input { flex: 1; }
  .btn-apply-text { display: none; }
  .section-header { padding: 12px 14px; }
  .section-title { font-size: 13.5px; }
  .section-sub { font-size: 11px; }
  .kpi-report { padding: 14px 14px 12px; }
  .kr-value { font-size: 19px; }
  .card-head { padding: 12px 14px; }
  .card-actions-row { padding: 10px 14px; }
  .chart-wrap.h260 { height: 220px; }
  .table-wrapper { max-height: 280px; }
}
@media (max-width: 480px) {
  .kpi-grid-4 { grid-template-columns: 1fr 1fr; gap: 10px; }
  .reports-content { padding: 12px; gap: 20px; }
  .section-block { gap: 12px; }
  .kpi-report { flex-direction: row; gap: 10px; }
  .kr-icon { width: 34px; height: 34px; font-size: 17px; }
  .kr-value { font-size: 17px; margin: 3px 0 5px; }
  .kpi-mini { padding: 12px; }
  .kmr-value { font-size: 17px; }
  .grid-3 { gap: 12px; }
  .chart-section-grid { gap: 12px; }
  .highlight-body { padding: 14px; gap: 12px; }
  .hb-avatar { width: 40px; height: 40px; font-size: 14px; }
  .hb-stats { flex-direction: row; gap: 12px; width: 100%; justify-content: space-between; }
  .hb-stat { text-align: left; }
  .tpb-metrics { justify-content: space-between; }
  .tsb-metrics { gap: 14px; }
  .aqb-value { font-size: 20px; }
  .period-badge, .pb-location { font-size: 11.5px; padding: 4px 10px; }
  .pb-stat { padding: 4px 9px; }
}
@media (max-width: 360px) {
  .kpi-grid-4 { grid-template-columns: 1fr; }
  .reports-header { padding: 12px 14px; }
  .rh-brand-icon { width: 34px; height: 34px; font-size: 17px; }
  .rh-title { font-size: 14px; }
  .filter-bar { padding: 10px 14px; }
  .pchip { padding: 5px 9px; font-size: 11px; }
  .period-badge-row { padding: 8px 14px; }
  .reports-content { padding: 10px; gap: 18px; }
  .kr-value { font-size: 16px; }
  .kpi-report { padding: 12px; }
  .kr-icon { width: 30px; height: 30px; font-size: 15px; }
  .barcode-input { font-size: 11px; }
  .empty-chart-state { min-height: 130px; }
  .chart-wrap.h260 { height: 200px; }
  .aqb-breakdown { flex-wrap: wrap; gap: 10px; }
  .aqb-b-sep { display: none; }
  .aqb-b-item { min-width: 30%; }
  .tsb-metrics { gap: 10px; }
  .grid-3, .chart-section-grid { gap: 10px; }
}
@media (max-width: 320px) {
  .reports-header { padding: 10px 12px; }
  .rh-title { font-size: 13px; }
  .rh-sub { display: none; }
  .filter-bar { padding: 8px 12px; }
  .period-badge-row { padding: 8px 12px; }
  .pb-stat { padding: 3px 7px; }
  .pb-stat-val { font-size: 12px; }
  .reports-content { padding: 8px; }
  .section-header { padding: 10px 12px; gap: 8px; }
  .section-icon { width: 32px; height: 32px; font-size: 16px; }
  .section-title { font-size: 12.5px; }
  .kpi-report { padding: 10px; gap: 8px; }
  .kr-value { font-size: 15px; }
  .card-head { padding: 10px 12px; gap: 8px; }
  .card-icon { width: 30px; height: 30px; font-size: 15px; }
  .card-title { font-size: 12.5px; }
  .top-seller-body, .last-quote-body, .top-product-body { padding: 12px; }
}

/* ══ MISC ══ */
.mt-20 { margin-top: 20px; }

</style>