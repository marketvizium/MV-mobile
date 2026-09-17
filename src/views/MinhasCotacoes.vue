<template>
  <ion-page class="quotes-browser-page">
    <ion-content :fullscreen="true" class="ion-padding">
      <RefresherIonic />

      <!-- ════════════════════════════════════════════
           VISÃO MOBILE (< 992px) — layout original em cards
      ════════════════════════════════════════════ -->
      <div class="mobile-view">
        <h1 class="poppins-semibold page-title mobile-page-title">Cotações</h1>
        <section
          v-if="!loading && !error && !nenhumaCotacao"
          class="featured-section featured-section--upcoming"
          aria-label="Cotações que irão abrir em breve"
        >
          <div class="featured-heading">
            <div class="featured-heading-icon">
              <span class="material-symbols-outlined">schedule</span>
            </div>
            <div>
              <h2>
                Cotações que irão abrir em breve
                <span class="featured-count">{{
                  filteredUpcomingQuotes.length
                }}</span>
              </h2>
              <p>Prepare suas respostas para as próximas oportunidades.</p>
            </div>
          </div>
          <div class="featured-search">
            <span class="material-symbols-outlined" aria-hidden="true"
              >search</span
            >
            <input
              v-model="upcomingSearch"
              type="search"
              aria-label="Buscar em Cotações que irão abrir em breve por cotação ou loja"
              placeholder="Buscar por cotação ou loja..."
            />
          </div>
          <div
            v-if="filteredUpcomingQuotes.length"
            class="featured-scroll"
            tabindex="0"
            aria-label="Lista: Cotações que irão abrir em breve"
          >
            <div class="featured-grid">
              <div
                v-for="quote in filteredUpcomingQuotes"
                :key="quote.id_cotacao"
                class="quote-info-card"
                @click="navigateToDetails(quote)"
              >
                <div class="qic-header">
                  <span
                    class="qic-status-pill"
                    :class="'is-' + getStatusKeyDesktop(quote)"
                  >
                    <span class="material-symbols-outlined qic-status-icon">{{
                      getStatusIcon(getStatusKeyDesktop(quote))
                    }}</span>
                    {{ getLabelStatusDesktop(quote) }}
                  </span>
                  <span class="qic-id-tag">
                    <span class="material-symbols-outlined">tag</span>
                    {{ quote.id_cotacao }}
                  </span>
                </div>

                <div v-if="quote.participando" class="qic-participando-badge">
                  <span class="material-symbols-outlined">check_circle</span>
                  Participando da cotação
                </div>

                <h3 class="qic-title poppins-semibold">
                  {{ quote.nome_cotacao }}
                </h3>

                <div class="qic-store">
                  <span class="material-symbols-outlined qic-store-icon"
                    >storefront</span
                  >
                  <div class="qic-store-text">
                    <span class="qic-store-name poppins-medium">{{
                      quote.nome_fantasia || "Loja não identificada"
                    }}</span>
                    <span class="qic-store-razao poppins-regular">{{
                      quote.razao_social || "—"
                    }}</span>
                  </div>
                </div>

                <div class="qic-dates">
                  <div class="qic-date-block">
                    <span class="qic-date-label">
                      <span class="material-symbols-outlined"
                        >event_available</span
                      >
                      Início
                    </span>
                    <span class="qic-date-value poppins-medium">{{
                      formatarDataDesktop(quote.inicio_cotacao)
                    }}</span>
                  </div>
                  <span class="qic-date-sep material-symbols-outlined"
                    >arrow_forward</span
                  >
                  <div class="qic-date-block">
                    <span class="qic-date-label">
                      <span class="material-symbols-outlined">event_busy</span>
                      Término
                    </span>
                    <span class="qic-date-value poppins-medium">{{
                      formatarDataDesktop(quote.final_cotacao)
                    }}</span>
                  </div>
                </div>

                <div class="qic-fields-grid">
                  <div class="qic-field">
                    <span class="material-symbols-outlined qic-field-icon"
                      >inventory_2</span
                    >
                    <div class="qic-field-text">
                      <span class="qic-field-label">Produtos</span>
                      <span class="qic-field-value poppins-medium">{{
                        quote.quantidade_produtos ?? "Não informado"
                      }}</span>
                    </div>
                  </div>
                  <div class="qic-field">
                    <span class="material-symbols-outlined qic-field-icon"
                      >receipt_long</span
                    >
                    <div class="qic-field-text">
                      <span class="qic-field-label">Boletos</span>
                      <span class="qic-field-value poppins-medium">{{
                        getQtdBoletosTexto(quote)
                      }}</span>
                    </div>
                  </div>
                  <div class="qic-field qic-field-full">
                    <span class="material-symbols-outlined qic-field-icon"
                      >payments</span
                    >
                    <div class="qic-field-text">
                      <span class="qic-field-label">Prazo dos boletos</span>
                      <span class="qic-field-value poppins-medium">{{
                        getPrazoBoletoTexto(quote)
                      }}</span>
                    </div>
                  </div>
                </div>

                <div class="qic-obs">
                  <b style="font-size: 0.8rem">Observação: </b>
                  <p class="qic-obs-text">{{ quote.observacao || "--" }}</p>
                </div>

                <div class="qic-footer">
                  <span>Ver detalhes da cotação</span>
                  <span class="material-symbols-outlined">arrow_forward</span>
                </div>
              </div>
            </div>
          </div>
          <p v-else class="featured-empty">
            Nenhuma cotação encontrada nesta seção.
          </p>
        </section>
        <section
          v-if="!loading && !error && !nenhumaCotacao"
          class="featured-section featured-section--open"
          aria-label="Cotações que já estão abertas"
        >
          <div class="featured-heading">
            <div class="featured-heading-icon">
              <span class="material-symbols-outlined">bolt</span>
            </div>
            <div>
              <h2>
                Cotações que já estão abertas
                <span class="featured-count">{{
                  filteredOpenQuotes.length
                }}</span>
              </h2>
              <p>Estas cotações já podem receber sua resposta.</p>
            </div>
          </div>
          <div class="featured-search">
            <span class="material-symbols-outlined" aria-hidden="true"
              >search</span
            >
            <input
              v-model="openSearch"
              type="search"
              aria-label="Buscar em Cotações que já estão abertas por cotação ou loja"
              placeholder="Buscar por cotação ou loja..."
            />
          </div>
          <div
            v-if="filteredOpenQuotes.length"
            class="featured-scroll"
            tabindex="0"
            aria-label="Lista: Cotações que já estão abertas"
          >
            <div class="featured-grid">
              <div
                v-for="quote in filteredOpenQuotes"
                :key="quote.id_cotacao"
                class="quote-info-card"
                @click="navigateToDetails(quote)"
              >
                <div class="qic-header">
                  <span
                    class="qic-status-pill"
                    :class="'is-' + getStatusKeyDesktop(quote)"
                  >
                    <span class="material-symbols-outlined qic-status-icon">{{
                      getStatusIcon(getStatusKeyDesktop(quote))
                    }}</span>
                    {{ getLabelStatusDesktop(quote) }}
                  </span>
                  <span class="qic-id-tag">
                    <span class="material-symbols-outlined">tag</span>
                    {{ quote.id_cotacao }}
                  </span>
                </div>

                <div v-if="quote.participando" class="qic-participando-badge">
                  <span class="material-symbols-outlined">check_circle</span>
                  Participando da cotação
                </div>

                <h3 class="qic-title poppins-semibold">
                  {{ quote.nome_cotacao }}
                </h3>

                <div class="qic-store">
                  <span class="material-symbols-outlined qic-store-icon"
                    >storefront</span
                  >
                  <div class="qic-store-text">
                    <span class="qic-store-name poppins-medium">{{
                      quote.nome_fantasia || "Loja não identificada"
                    }}</span>
                    <span class="qic-store-razao poppins-regular">{{
                      quote.razao_social || "—"
                    }}</span>
                  </div>
                </div>

                <div class="qic-dates">
                  <div class="qic-date-block">
                    <span class="qic-date-label">
                      <span class="material-symbols-outlined"
                        >event_available</span
                      >
                      Início
                    </span>
                    <span class="qic-date-value poppins-medium">{{
                      formatarDataDesktop(quote.inicio_cotacao)
                    }}</span>
                  </div>
                  <span class="qic-date-sep material-symbols-outlined"
                    >arrow_forward</span
                  >
                  <div class="qic-date-block">
                    <span class="qic-date-label">
                      <span class="material-symbols-outlined">event_busy</span>
                      Término
                    </span>
                    <span class="qic-date-value poppins-medium">{{
                      formatarDataDesktop(quote.final_cotacao)
                    }}</span>
                  </div>
                </div>

                <div class="qic-fields-grid">
                  <div class="qic-field">
                    <span class="material-symbols-outlined qic-field-icon"
                      >inventory_2</span
                    >
                    <div class="qic-field-text">
                      <span class="qic-field-label">Produtos</span>
                      <span class="qic-field-value poppins-medium">{{
                        quote.quantidade_produtos ?? "Não informado"
                      }}</span>
                    </div>
                  </div>
                  <div class="qic-field">
                    <span class="material-symbols-outlined qic-field-icon"
                      >receipt_long</span
                    >
                    <div class="qic-field-text">
                      <span class="qic-field-label">Boletos</span>
                      <span class="qic-field-value poppins-medium">{{
                        getQtdBoletosTexto(quote)
                      }}</span>
                    </div>
                  </div>
                  <div class="qic-field qic-field-full">
                    <span class="material-symbols-outlined qic-field-icon"
                      >payments</span
                    >
                    <div class="qic-field-text">
                      <span class="qic-field-label">Prazo dos boletos</span>
                      <span class="qic-field-value poppins-medium">{{
                        getPrazoBoletoTexto(quote)
                      }}</span>
                    </div>
                  </div>
                </div>

                <div class="qic-obs">
                  <b style="font-size: 0.8rem">Observação: </b>
                  <p class="qic-obs-text">{{ quote.observacao || "--" }}</p>
                </div>

                <div class="qic-footer">
                  <span>Ver detalhes da cotação</span>
                  <span class="material-symbols-outlined">arrow_forward</span>
                </div>
              </div>
            </div>
          </div>
          <p v-else class="featured-empty">
            Nenhuma cotação encontrada nesta seção.
          </p>
        </section>
        <section class="all-quotes-section" aria-label="Todas as cotações">
          <h2 class="all-quotes-title">Todas as cotações</h2>
          <div class="search-section">
            <div class="header-actions">
              <div class="search-bar-container">
                <span class="search-wrapper">
                  <span class="material-symbols-outlined search-icon"
                    >search</span
                  >
                  <InputText
                    v-model="searchQuery"
                    placeholder="Buscar cotação..."
                    class="w-full custom-search-input poppins-regular"
                    :disabled="nenhumaCotacao"
                  />
                </span>
              </div>

              <Button
                @click="showFilters = !showFilters"
                class="filter-toggle-btn"
                :class="{ 'filter-active': showFilters }"
                :disabled="nenhumaCotacao"
              >
                <span class="material-symbols-outlined">filter_list</span>
              </Button>
            </div>

            <transition name="fade-slide">
              <div v-if="showFilters" class="expanded-filters-panel mt-3">
                <div class="filter-group">
                  <label class="filter-label poppins-medium"
                    >Status da Cotação</label
                  >
                  <SelectButton
                    v-model="activeFilter"
                    :options="filterOptions"
                    optionLabel="label"
                    optionValue="value"
                    class="custom-select-button-vertical poppins-medium"
                  />
                </div>

                <div class="filter-group mt-3">
                  <label class="filter-label poppins-medium">Ordenar por</label>
                  <SelectButton
                    v-model="activeSort"
                    :options="sortOptions"
                    optionLabel="label"
                    optionValue="value"
                    class="custom-select-button-vertical sort-group poppins-medium"
                  />
                </div>
              </div>
            </transition>
          </div>
        </section>

        <div v-if="loading" class="quotes-grid mt-3">
          <div v-for="i in 6" :key="i" class="skeleton-card mb-3">
            <Skeleton width="100%" height="90px" borderRadius="16px"></Skeleton>
          </div>
        </div>

        <div v-else-if="error" class="error-state">
          <span class="material-symbols-outlined error-icon">cloud_off</span>
          <h3 class="poppins-semibold">Conexão falhou</h3>
          <p class="poppins-regular">Não conseguimos buscar as cotações.</p>
          <Button
            label="Tentar Novamente"
            class="p-button-rounded mt-3 retry-btn"
            @click="fetchQuotes"
          />
        </div>

        <div v-else-if="nenhumaCotacao">
          <div style="width: 100%; display: flex; justify-content: center">
            <img src="../assets/Telecommuting.gif" alt="" />
          </div>

          <div
            style="
              font-family: 'Poppins';
              font-size: 20px;
              font-weight: 600;
              text-align: center;
            "
          >
            Explore mais!
          </div>

          <div
            style="
              font-family: 'Poppins';
              text-align: center;
              margin-top: 15px;
              color: #333;
            "
          >
            Ainda você não possui nenhuma cotação para consultar... Encontre e
            faça parcerias com lojas para você visualizar as cotações aqui!
          </div>

          <div style="display: flex; justify-content: center; margin-top: 20px">
            <button
              @click="$router.push({ name: 'Explorar' })"
              style="
                background-color: #ff8049;
                padding: 20px 30px 20px 30px;
                border: none;
                border-radius: 5px;
                color: #fff;
                font-family: 'Poppins';
                font-size: 16px;
              "
            >
              Encontrar lojas!
            </button>
          </div>
        </div>

        <div v-else class="quotes-list-container mt-3">
          <div v-if="paginatedQuotes.length > 0">
            <div class="quotes-grid-cards">
              <div
                v-for="quote in paginatedQuotes"
                :key="quote.id_cotacao"
                class="quote-info-card"
                @click="navigateToDetails(quote)"
              >
                <div class="qic-header">
                  <span
                    class="qic-status-pill"
                    :class="'is-' + getStatusKeyDesktop(quote)"
                  >
                    <span class="material-symbols-outlined qic-status-icon">{{
                      getStatusIcon(getStatusKeyDesktop(quote))
                    }}</span>
                    {{ getLabelStatusDesktop(quote) }}
                  </span>
                  <span class="qic-id-tag">
                    <span class="material-symbols-outlined">tag</span>
                    {{ quote.id_cotacao }}
                  </span>
                </div>

                <div v-if="quote.participando" class="qic-participando-badge">
                  <span class="material-symbols-outlined">check_circle</span>
                  Participando da cotação
                </div>

                <h3 class="qic-title poppins-semibold">
                  {{ quote.nome_cotacao }}
                </h3>

                <div class="qic-store">
                  <span class="material-symbols-outlined qic-store-icon"
                    >storefront</span
                  >
                  <div class="qic-store-text">
                    <span class="qic-store-name poppins-medium">{{
                      quote.nome_fantasia || "Loja não identificada"
                    }}</span>
                    <span class="qic-store-razao poppins-regular">{{
                      quote.razao_social || "—"
                    }}</span>
                  </div>
                </div>

                <div class="qic-dates">
                  <div class="qic-date-block">
                    <span class="qic-date-label">
                      <span class="material-symbols-outlined"
                        >event_available</span
                      >
                      Início
                    </span>
                    <span class="qic-date-value poppins-medium">{{
                      formatarDataDesktop(quote.inicio_cotacao)
                    }}</span>
                  </div>
                  <span class="qic-date-sep material-symbols-outlined"
                    >arrow_forward</span
                  >
                  <div class="qic-date-block">
                    <span class="qic-date-label">
                      <span class="material-symbols-outlined">event_busy</span>
                      Término
                    </span>
                    <span class="qic-date-value poppins-medium">{{
                      formatarDataDesktop(quote.final_cotacao)
                    }}</span>
                  </div>
                </div>

                <div class="qic-fields-grid">
                  <div class="qic-field">
                    <span class="material-symbols-outlined qic-field-icon"
                      >inventory_2</span
                    >
                    <div class="qic-field-text">
                      <span class="qic-field-label">Produtos</span>
                      <span class="qic-field-value poppins-medium">{{
                        quote.quantidade_produtos ?? "Não informado"
                      }}</span>
                    </div>
                  </div>
                  <div class="qic-field">
                    <span class="material-symbols-outlined qic-field-icon"
                      >receipt_long</span
                    >
                    <div class="qic-field-text">
                      <span class="qic-field-label">Boletos</span>
                      <span class="qic-field-value poppins-medium">{{
                        getQtdBoletosTexto(quote)
                      }}</span>
                    </div>
                  </div>
                  <div class="qic-field qic-field-full">
                    <span class="material-symbols-outlined qic-field-icon"
                      >payments</span
                    >
                    <div class="qic-field-text">
                      <span class="qic-field-label">Prazo dos boletos</span>
                      <span class="qic-field-value poppins-medium">{{
                        getPrazoBoletoTexto(quote)
                      }}</span>
                    </div>
                  </div>
                </div>

                <div class="qic-obs">
                  <b style="font-size: 0.8rem">Observação: </b>
                  <p class="qic-obs-text">{{ quote.observacao || "--" }}</p>
                </div>

                <div class="qic-footer">
                  <span>Ver detalhes da cotação</span>
                  <span class="material-symbols-outlined">arrow_forward</span>
                </div>
              </div>
            </div>

            <div class="pagination-wrapper mt-4">
              <Paginator
                v-model:first="firstRow"
                :rows="rowsPerPage"
                :totalRecords="filteredQuotes.length"
                template="PrevPageLink PageLinks NextPageLink"
                class="custom-paginator"
              ></Paginator>
            </div>
          </div>

          <div v-else class="empty-state">
            <div class="empty-icon-wrapper">
              <span class="material-symbols-outlined">search_off</span>
            </div>
            <h3 class="poppins-semibold">Nenhum resultado</h3>
            <p class="poppins-regular">
              Ajuste os filtros para encontrar o que precisa.
            </p>
            <Button
              v-if="
                searchQuery ||
                activeFilter !== 'todas' ||
                activeSort !== 'recent'
              "
              label="Limpar Filtros"
              class="p-button-text mt-2"
              @click="resetFilters"
            />
          </div>
        </div>

        <div class="bottom-spacer"></div>
      </div>
      <!-- /.mobile-view -->

      <!-- ════════════════════════════════════════════
           VISÃO DESKTOP (>= 992px) — mesmo estilo do
           Painel de Cotações (consultarCotacoesConsole.vue)
      ════════════════════════════════════════════ -->
      <div class="desktop-view">
        <!-- Modal: Entendendo os Status de Cotação -->
        <transition name="modal-fade">
          <div
            v-if="modalStatusVisivel"
            class="modal-overlay"
            @click.self="fecharModal"
          >
            <div class="modal-card" style="font-family: 'Poppins'">
              <div class="modal-header">
                <div class="modal-header-icon">
                  <span class="material-symbols-outlined">help</span>
                </div>
                <div>
                  <h2 class="modal-title">Entendendo os Status de Cotação</h2>
                  <p class="modal-subtitle">
                    Saiba o que acontece em cada etapa do ciclo da cotação
                  </p>
                </div>
                <button class="modal-close-btn" @click="fecharModal">
                  <span class="material-symbols-outlined">close</span>
                </button>
              </div>

              <div class="modal-body">
                <div class="status-card status-card--indisponivel">
                  <div class="status-card-badge">
                    <span class="material-symbols-outlined">block</span>
                    Não disponibilizada
                  </div>
                  <p class="status-card-desc">
                    Somente a <strong>loja</strong> tem acesso à cotação neste
                    momento. Os vendedores ainda
                    <strong>não conseguem visualizá-la</strong>. Este é o
                    período reservado para a loja configurar e adicionar os
                    produtos à cotação antes de disponibilizá-la ao mercado.
                  </p>
                </div>

                <div class="status-card status-card--aberta">
                  <div class="status-card-badge">
                    <span class="material-symbols-outlined"
                      >radio_button_unchecked</span
                    >
                    Aberta
                  </div>
                  <p class="status-card-desc">
                    A cotação está <strong>disponível para você</strong>. Você
                    pode acessar os produtos solicitados e
                    <strong>enviar suas ofertas de preço</strong>, competindo
                    com outros vendedores para oferecer as melhores condições à
                    loja.
                  </p>
                </div>

                <div class="status-card status-card--finalizada">
                  <div class="status-card-badge">
                    <span class="material-symbols-outlined">lock</span>
                    Fechada
                  </div>
                  <p class="status-card-desc">
                    O prazo para oferta encerrou e a cotação está em análise
                    pela loja. Não é mais possível enviar ou alterar preços
                    enquanto a loja avalia as ofertas recebidas.
                  </p>
                </div>

                <div class="status-card status-card--concluido">
                  <div class="status-card-badge">
                    <span class="material-symbols-outlined">check_circle</span>
                    Concluído
                  </div>
                  <p class="status-card-desc">
                    A loja <strong>concluiu a seleção</strong>. Caso você tenha
                    sido contemplado, o pedido foi enviado e você já pode
                    <strong>faturar e encaminhar</strong> para as empresas que
                    representa.
                  </p>
                </div>
              </div>

              <div class="modal-footer">
                <button
                  class="btn-nunca-mais"
                  @click="fecharModalDefinitivamente"
                >
                  <span class="material-symbols-outlined">visibility_off</span>
                  Não quero ver novamente
                </button>
                <button class="btn-entendi" @click="fecharModal">
                  Entendi!
                  <span class="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </transition>

        <!-- Header -->
        <header class="page-header">
          <div class="header-content">
            <h1>Cotações</h1>
            <p style="font-size: 16px">Consulte suas cotações</p>
          </div>
          <div class="header-actions">
            <button class="btn-ajuda-status" @click="modalStatusVisivel = true">
              <span class="material-symbols-outlined">help_outline</span>
              Dúvidas sobre os status?
            </button>

            <span class="p-input-icon-left search-box">
              <span class="material-symbols-outlined position-search-icon"
                >search</span
              >
              <InputText
                v-model="searchQuery"
                placeholder="Pesquisar por nome..."
                class="p-inputtext-sm custom-input"
                :disabled="nenhumaCotacao"
              />
            </span>
          </div>
        </header>

        <section
          v-if="!loading && !error && !nenhumaCotacao"
          class="featured-section featured-section--upcoming"
          aria-label="Cotações que irão abrir em breve"
        >
          <div class="featured-heading">
            <div class="featured-heading-icon">
              <span class="material-symbols-outlined">schedule</span>
            </div>
            <div>
              <h2>
                Cotações que irão abrir em breve
                <span class="featured-count">{{
                  filteredUpcomingQuotes.length
                }}</span>
              </h2>
              <p>Prepare suas respostas para as próximas oportunidades.</p>
            </div>
          </div>
          <div class="featured-search">
            <span class="material-symbols-outlined" aria-hidden="true"
              >search</span
            >
            <input
              v-model="upcomingSearch"
              type="search"
              aria-label="Buscar em Cotações que irão abrir em breve por cotação ou loja"
              placeholder="Buscar por cotação ou loja..."
            />
          </div>
          <div
            v-if="filteredUpcomingQuotes.length"
            class="featured-scroll"
            tabindex="0"
            aria-label="Lista: Cotações que irão abrir em breve"
          >
            <div class="featured-grid">
              <div
                v-for="quote in filteredUpcomingQuotes"
                :key="quote.id_cotacao"
                class="quote-info-card"
                @click="navigateToDetails(quote)"
              >
                <div class="qic-header">
                  <span
                    class="qic-status-pill"
                    :class="'is-' + getStatusKeyDesktop(quote)"
                  >
                    <span class="material-symbols-outlined qic-status-icon">{{
                      getStatusIcon(getStatusKeyDesktop(quote))
                    }}</span>
                    {{ getLabelStatusDesktop(quote) }}
                  </span>
                  <span class="qic-id-tag">
                    <span class="material-symbols-outlined">tag</span>
                    {{ quote.id_cotacao }}
                  </span>
                </div>

                <div v-if="quote.participando" class="qic-participando-badge">
                  <span class="material-symbols-outlined">check_circle</span>
                  Participando da cotação
                </div>

                <h3 class="qic-title poppins-semibold">
                  {{ quote.nome_cotacao }}
                </h3>

                <div class="qic-store">
                  <span class="material-symbols-outlined qic-store-icon"
                    >storefront</span
                  >
                  <div class="qic-store-text">
                    <span class="qic-store-name poppins-medium">{{
                      quote.nome_fantasia || "Loja não identificada"
                    }}</span>
                    <span class="qic-store-razao poppins-regular">{{
                      quote.razao_social || "—"
                    }}</span>
                  </div>
                </div>

                <div class="qic-dates">
                  <div class="qic-date-block">
                    <span class="qic-date-label">
                      <span class="material-symbols-outlined"
                        >event_available</span
                      >
                      Início
                    </span>
                    <span class="qic-date-value poppins-medium">{{
                      formatarDataDesktop(quote.inicio_cotacao)
                    }}</span>
                  </div>
                  <span class="qic-date-sep material-symbols-outlined"
                    >arrow_forward</span
                  >
                  <div class="qic-date-block">
                    <span class="qic-date-label">
                      <span class="material-symbols-outlined">event_busy</span>
                      Término
                    </span>
                    <span class="qic-date-value poppins-medium">{{
                      formatarDataDesktop(quote.final_cotacao)
                    }}</span>
                  </div>
                </div>

                <div class="qic-fields-grid">
                  <div class="qic-field">
                    <span class="material-symbols-outlined qic-field-icon"
                      >inventory_2</span
                    >
                    <div class="qic-field-text">
                      <span class="qic-field-label">Produtos</span>
                      <span class="qic-field-value poppins-medium">{{
                        quote.quantidade_produtos ?? "Não informado"
                      }}</span>
                    </div>
                  </div>
                  <div class="qic-field">
                    <span class="material-symbols-outlined qic-field-icon"
                      >receipt_long</span
                    >
                    <div class="qic-field-text">
                      <span class="qic-field-label">Boletos</span>
                      <span class="qic-field-value poppins-medium">{{
                        getQtdBoletosTexto(quote)
                      }}</span>
                    </div>
                  </div>
                  <div class="qic-field qic-field-full">
                    <span class="material-symbols-outlined qic-field-icon"
                      >payments</span
                    >
                    <div class="qic-field-text">
                      <span class="qic-field-label">Prazo dos boletos</span>
                      <span class="qic-field-value poppins-medium">{{
                        getPrazoBoletoTexto(quote)
                      }}</span>
                    </div>
                  </div>
                </div>

                <div class="qic-obs">
                  <b style="font-size: 0.8rem">Observação: </b>
                  <p class="qic-obs-text">{{ quote.observacao || "--" }}</p>
                </div>

                <div class="qic-footer">
                  <span>Ver detalhes da cotação</span>
                  <span class="material-symbols-outlined">arrow_forward</span>
                </div>
              </div>
            </div>
          </div>
          <p v-else class="featured-empty">
            Nenhuma cotação encontrada nesta seção.
          </p>
        </section>
        <section
          v-if="!loading && !error && !nenhumaCotacao"
          class="featured-section featured-section--open"
          aria-label="Cotações que já estão abertas"
        >
          <div class="featured-heading">
            <div class="featured-heading-icon">
              <span class="material-symbols-outlined">bolt</span>
            </div>
            <div>
              <h2>
                Cotações que já estão abertas
                <span class="featured-count">{{
                  filteredOpenQuotes.length
                }}</span>
              </h2>
              <p>Estas cotações já podem receber sua resposta.</p>
            </div>
          </div>
          <div class="featured-search">
            <span class="material-symbols-outlined" aria-hidden="true"
              >search</span
            >
            <input
              v-model="openSearch"
              type="search"
              aria-label="Buscar em Cotações que já estão abertas por cotação ou loja"
              placeholder="Buscar por cotação ou loja..."
            />
          </div>
          <div
            v-if="filteredOpenQuotes.length"
            class="featured-scroll"
            tabindex="0"
            aria-label="Lista: Cotações que já estão abertas"
          >
            <div class="featured-grid">
              <div
                v-for="quote in filteredOpenQuotes"
                :key="quote.id_cotacao"
                class="quote-info-card"
                @click="navigateToDetails(quote)"
              >
                <div class="qic-header">
                  <span
                    class="qic-status-pill"
                    :class="'is-' + getStatusKeyDesktop(quote)"
                  >
                    <span class="material-symbols-outlined qic-status-icon">{{
                      getStatusIcon(getStatusKeyDesktop(quote))
                    }}</span>
                    {{ getLabelStatusDesktop(quote) }}
                  </span>
                  <span class="qic-id-tag">
                    <span class="material-symbols-outlined">tag</span>
                    {{ quote.id_cotacao }}
                  </span>
                </div>

                <div v-if="quote.participando" class="qic-participando-badge">
                  <span class="material-symbols-outlined">check_circle</span>
                  Participando da cotação
                </div>

                <h3 class="qic-title poppins-semibold">
                  {{ quote.nome_cotacao }}
                </h3>

                <div class="qic-store">
                  <span class="material-symbols-outlined qic-store-icon"
                    >storefront</span
                  >
                  <div class="qic-store-text">
                    <span class="qic-store-name poppins-medium">{{
                      quote.nome_fantasia || "Loja não identificada"
                    }}</span>
                    <span class="qic-store-razao poppins-regular">{{
                      quote.razao_social || "—"
                    }}</span>
                  </div>
                </div>

                <div class="qic-dates">
                  <div class="qic-date-block">
                    <span class="qic-date-label">
                      <span class="material-symbols-outlined"
                        >event_available</span
                      >
                      Início
                    </span>
                    <span class="qic-date-value poppins-medium">{{
                      formatarDataDesktop(quote.inicio_cotacao)
                    }}</span>
                  </div>
                  <span class="qic-date-sep material-symbols-outlined"
                    >arrow_forward</span
                  >
                  <div class="qic-date-block">
                    <span class="qic-date-label">
                      <span class="material-symbols-outlined">event_busy</span>
                      Término
                    </span>
                    <span class="qic-date-value poppins-medium">{{
                      formatarDataDesktop(quote.final_cotacao)
                    }}</span>
                  </div>
                </div>

                <div class="qic-fields-grid">
                  <div class="qic-field">
                    <span class="material-symbols-outlined qic-field-icon"
                      >inventory_2</span
                    >
                    <div class="qic-field-text">
                      <span class="qic-field-label">Produtos</span>
                      <span class="qic-field-value poppins-medium">{{
                        quote.quantidade_produtos ?? "Não informado"
                      }}</span>
                    </div>
                  </div>
                  <div class="qic-field">
                    <span class="material-symbols-outlined qic-field-icon"
                      >receipt_long</span
                    >
                    <div class="qic-field-text">
                      <span class="qic-field-label">Boletos</span>
                      <span class="qic-field-value poppins-medium">{{
                        getQtdBoletosTexto(quote)
                      }}</span>
                    </div>
                  </div>
                  <div class="qic-field qic-field-full">
                    <span class="material-symbols-outlined qic-field-icon"
                      >payments</span
                    >
                    <div class="qic-field-text">
                      <span class="qic-field-label">Prazo dos boletos</span>
                      <span class="qic-field-value poppins-medium">{{
                        getPrazoBoletoTexto(quote)
                      }}</span>
                    </div>
                  </div>
                </div>

                <div class="qic-obs">
                  <b style="font-size: 0.8rem">Observação: </b>
                  <p class="qic-obs-text">{{ quote.observacao || "--" }}</p>
                </div>

                <div class="qic-footer">
                  <span>Ver detalhes da cotação</span>
                  <span class="material-symbols-outlined">arrow_forward</span>
                </div>
              </div>
            </div>
          </div>
          <p v-else class="featured-empty">
            Nenhuma cotação encontrada nesta seção.
          </p>
        </section>
        <h2 class="all-quotes-title">Todas as cotações</h2>

        <!-- Painel de Filtros -->
        <section class="filter-panel">
          <div class="filter-group">
            <label>Período Rápido</label>
            <div class="button-group">
              <Button
                label="Hoje"
                :class="[
                  'p-button-sm',
                  { 'active-filter': filtroAtivo === 'hoje' },
                ]"
                @click="definirFiltroData('hoje')"
                :disabled="nenhumaCotacao"
              />
              <Button
                label="Esta Semana"
                :class="[
                  'p-button-sm',
                  { 'active-filter': filtroAtivo === 'semana' },
                ]"
                @click="definirFiltroData('semana')"
                :disabled="nenhumaCotacao"
              />
              <Button
                label="Este Mês"
                :class="[
                  'p-button-sm',
                  { 'active-filter': filtroAtivo === 'mes' },
                ]"
                @click="definirFiltroData('mes')"
                :disabled="nenhumaCotacao"
              />
              <button
                class="p-button-sm-filter p-button-text"
                :class="{ 'button-filter-disable': !filtroAtivo }"
                title="Limpar Filtros"
                @click="limparFiltrosDesktop"
                :disabled="!filtroAtivo"
              >
                <span class="material-symbols-outlined">filter_alt_off</span>
              </button>
            </div>
          </div>

          <div class="filter-group">
            <label>Intervalo Específico</label>
            <Calendar
              v-model="filtroDatas"
              selectionMode="range"
              :manualInput="false"
              placeholder="00/00/0000 - 00/00/0000"
              class="custom-calendar"
              dateFormat="dd/mm/yy"
              showIcon
              :disabled="nenhumaCotacao"
            />
          </div>

          <div class="filter-group">
            <label>Status da Cotação</label>
            <div class="toggle-group">
              <button
                type="button"
                :class="[
                  'filter-btn-toggle',
                  { active: activeFilterDesktop === 'aberta' },
                ]"
                @click="definirFiltroStatusDesktop('aberta')"
              >
                <span class="material-symbols-outlined">
                  {{
                    activeFilterDesktop === "aberta"
                      ? "task_alt"
                      : "radio_button_unchecked"
                  }}
                </span>
                Aberta
              </button>

              <button
                type="button"
                :class="[
                  'filter-btn-toggle',
                  { active: activeFilterDesktop === 'indisponivel' },
                ]"
                @click="definirFiltroStatusDesktop('indisponivel')"
              >
                <span class="material-symbols-outlined">
                  {{
                    activeFilterDesktop === "indisponivel"
                      ? "block"
                      : "do_not_disturb_on"
                  }}
                </span>
                Não disponibilizada
              </button>

              <button
                type="button"
                :class="[
                  'filter-btn-toggle',
                  { active: activeFilterDesktop === 'finalizada' },
                ]"
                @click="definirFiltroStatusDesktop('finalizada')"
              >
                <span class="material-symbols-outlined">
                  {{
                    activeFilterDesktop === "finalizada"
                      ? "lock"
                      : "do_not_disturb_on"
                  }}
                </span>
                Fechada
              </button>

              <button
                type="button"
                :class="[
                  'filter-btn-toggle',
                  { active: activeFilterDesktop === 'concluido' },
                ]"
                @click="definirFiltroStatusDesktop('concluido')"
              >
                <span class="material-symbols-outlined">
                  {{
                    activeFilterDesktop === "concluido"
                      ? "check_circle"
                      : "task_alt"
                  }}
                </span>
                Concluído
              </button>

              <button
                type="button"
                :class="[
                  'filter-btn-toggle',
                  { active: activeFilterDesktop === 'participando' },
                ]"
                @click="definirFiltroStatusDesktop('participando')"
              >
                <span class="material-symbols-outlined">
                  {{
                    activeFilterDesktop === "participando"
                      ? "check_circle"
                      : "radio_button_unchecked"
                  }}
                </span>
                Participando
              </button>
            </div>
          </div>
        </section>

        <!-- Tabela -->
        <main class="table-section">
          <div v-if="error" class="error-state">
            <span class="material-symbols-outlined error-icon">cloud_off</span>
            <h3 class="poppins-semibold">Conexão falhou</h3>
            <p class="poppins-regular">Não conseguimos buscar as cotações.</p>
            <Button
              label="Tentar Novamente"
              class="p-button-rounded mt-3 retry-btn"
              @click="fetchQuotes"
            />
          </div>

          <div v-else-if="nenhumaCotacao" class="explore-state">
            <div style="width: 100%; display: flex; justify-content: center">
              <img
                src="../assets/Telecommuting.gif"
                alt=""
                style="max-width: 280px"
              />
            </div>
            <div
              style="
                font-family: 'Poppins';
                font-size: 20px;
                font-weight: 600;
                text-align: center;
              "
            >
              Explore mais!
            </div>
            <div
              style="
                font-family: 'Poppins';
                text-align: center;
                margin-top: 15px;
                color: #333;
                max-width: 480px;
              "
            >
              Ainda você não possui nenhuma cotação para consultar... Encontre e
              faça parcerias com lojas para você visualizar as cotações aqui!
            </div>
            <div
              style="display: flex; justify-content: center; margin-top: 20px"
            >
              <button
                @click="$router.push({ name: 'Explorar' })"
                style="
                  background-color: #ff8049;
                  padding: 20px 30px 20px 30px;
                  border: none;
                  border-radius: 5px;
                  color: #fff;
                  font-family: 'Poppins';
                  font-size: 16px;
                "
              >
                Encontrar lojas!
              </button>
            </div>
          </div>

          <template v-else>
            <div
              v-if="paginatedQuotesDesktop.length > 0"
              class="quotes-grid-cards"
            >
              <div
                v-for="quote in paginatedQuotesDesktop"
                :key="quote.id_cotacao"
                class="quote-info-card"
                @click="navigateToDetails(quote)"
              >
                <div class="qic-header">
                  <span
                    class="qic-status-pill"
                    :class="'is-' + getStatusKeyDesktop(quote)"
                  >
                    <span class="material-symbols-outlined qic-status-icon">{{
                      getStatusIcon(getStatusKeyDesktop(quote))
                    }}</span>
                    {{ getLabelStatusDesktop(quote) }}
                  </span>
                  <span class="qic-id-tag">
                    <span class="material-symbols-outlined">tag</span>
                    {{ quote.id_cotacao }}
                  </span>
                </div>

                <div v-if="quote.participando" class="qic-participando-badge">
                  <span class="material-symbols-outlined">check_circle</span>
                  Participando da cotação
                </div>

                <h3 class="qic-title poppins-semibold">
                  {{ quote.nome_cotacao }}
                </h3>

                <div class="qic-store">
                  <span class="material-symbols-outlined qic-store-icon"
                    >storefront</span
                  >
                  <div class="qic-store-text">
                    <span class="qic-store-name poppins-medium">{{
                      quote.nome_fantasia || "Loja não identificada"
                    }}</span>
                    <span class="qic-store-razao poppins-regular">{{
                      quote.razao_social || "—"
                    }}</span>
                  </div>
                </div>

                <div class="qic-dates">
                  <div class="qic-date-block">
                    <span class="qic-date-label">
                      <span class="material-symbols-outlined"
                        >event_available</span
                      >
                      Início
                    </span>
                    <span class="qic-date-value poppins-medium">{{
                      formatarDataDesktop(quote.inicio_cotacao)
                    }}</span>
                  </div>
                  <span class="qic-date-sep material-symbols-outlined"
                    >arrow_forward</span
                  >
                  <div class="qic-date-block">
                    <span class="qic-date-label">
                      <span class="material-symbols-outlined">event_busy</span>
                      Término
                    </span>
                    <span class="qic-date-value poppins-medium">{{
                      formatarDataDesktop(quote.final_cotacao)
                    }}</span>
                  </div>
                </div>

                <div class="qic-fields-grid">
                  <div class="qic-field">
                    <span class="material-symbols-outlined qic-field-icon"
                      >inventory_2</span
                    >
                    <div class="qic-field-text">
                      <span class="qic-field-label">Produtos</span>
                      <span class="qic-field-value poppins-medium">{{
                        quote.quantidade_produtos ?? "Não informado"
                      }}</span>
                    </div>
                  </div>
                  <div class="qic-field">
                    <span class="material-symbols-outlined qic-field-icon"
                      >receipt_long</span
                    >
                    <div class="qic-field-text">
                      <span class="qic-field-label">Boletos</span>
                      <span class="qic-field-value poppins-medium">{{
                        getQtdBoletosTexto(quote)
                      }}</span>
                    </div>
                  </div>
                  <div class="qic-field qic-field-full">
                    <span class="material-symbols-outlined qic-field-icon"
                      >payments</span
                    >
                    <div class="qic-field-text">
                      <span class="qic-field-label">Prazo dos boletos</span>
                      <span class="qic-field-value poppins-medium">{{
                        getPrazoBoletoTexto(quote)
                      }}</span>
                    </div>
                  </div>
                </div>

                <div class="qic-obs">
                  <b style="font-size: 0.8rem">Observação: </b>
                  <p class="qic-obs-text">{{ quote.observacao }}</p>
                </div>

                <div class="qic-footer">
                  <span>Ver detalhes da cotação</span>
                  <span class="material-symbols-outlined">arrow_forward</span>
                </div>
              </div>
            </div>

            <div v-else class="empty-state">
              <div class="empty-icon-wrapper">
                <span class="material-symbols-outlined">search_off</span>
              </div>
              <h3 class="poppins-semibold">Nenhum resultado</h3>
              <p class="poppins-regular">
                Ajuste os filtros para encontrar o que precisa.
              </p>
            </div>

            <div
              v-if="paginatedQuotesDesktop.length > 0"
              class="pagination-wrapper mt-4"
            >
              <Paginator
                v-model:first="firstRowDesktop"
                :rows="rowsPerPageDesktop"
                :totalRecords="filteredQuotesDesktop.length"
                template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
                currentPageReportTemplate="Exibindo {first} a {last} de {totalRecords}"
                class="custom-paginator"
              ></Paginator>
            </div>
          </template>
        </main>
      </div>
      <!-- /.desktop-view -->

      <!-- Overlay: sem empresa selecionada -> lista para escolher ou cadastro de nova -->
      <transition name="fade">
        <div
          v-if="!loadingEmpresas && !temEmpresaVinculada"
          class="fintech-overlay"
        >
          <!-- Modo lista: já existem empresas cadastradas no perfil -->
          <div
            v-if="!mostrarFormCadastro && empresasDisponiveis.length > 0"
            class="overlay-content overlay-content-form"
          >
            <div class="illustration-container">
              <div class="icon-circle-main">
                <span class="material-symbols-outlined">domain</span>
              </div>
            </div>

            <h2 class="poppins-semibold">Selecione sua empresa</h2>
            <p class="poppins-regular text-muted">
              Encontramos empresas já cadastradas no seu perfil. Selecione qual
              você representa para continuar, ou cadastre uma nova empresa.
            </p>

            <div class="empresas-select-list">
              <div
                v-for="empresa in empresasDisponiveis"
                :key="empresa.cnpj"
                class="empresa-select-card"
              >
                <div class="empresa-select-info">
                  <span class="empresa-select-nome poppins-medium">{{
                    empresa.nome_empresa
                  }}</span>
                  <span class="empresa-select-cnpj poppins-regular"
                    >CNPJ: {{ empresa.cnpj }}</span
                  >
                </div>
                <button
                  class="select-empresa-btn poppins-medium"
                  :disabled="selecionandoCnpj === empresa.cnpj"
                  @click="selecionarEmpresaExistente(empresa.cnpj)"
                >
                  <span v-if="selecionandoCnpj === empresa.cnpj"
                    >Selecionando...</span
                  >
                  <span v-else>Selecionar</span>
                </button>
              </div>
            </div>

            <div class="action-footer">
              <button
                class="secondary-fintech-btn poppins-medium"
                @click="abrirFormCadastro"
              >
                <span class="material-symbols-outlined">add_business</span>
                Cadastrar Nova Empresa
              </button>
            </div>
          </div>

          <!-- Modo formulário: cadastro de nova empresa -->
          <div v-else class="overlay-content overlay-content-form">
            <div class="illustration-container">
              <div class="icon-circle-main">
                <span class="material-symbols-outlined">add_business</span>
              </div>
            </div>

            <h2 class="poppins-semibold">Cadastre sua empresa</h2>
            <p class="poppins-regular text-muted">
              Para visualizar e participar de cotações, você precisa cadastrar a
              empresa que você representa. Preencha os dados abaixo para liberar
              o acesso.
            </p>

            <div class="inline-form">
              <div class="input-group">
                <label
                  >Nome da Empresa <span class="required-star">*</span></label
                >
                <input
                  v-model="cadastroForm.nome_empresa"
                  placeholder="Ex: Distribuidora Silva"
                  class="poppins-regular"
                />
              </div>

              <div class="input-group">
                <label>CNPJ <span class="required-star">*</span></label>
                <input
                  v-model="cadastroForm.cnpjRaw"
                  placeholder="00.000.000/0000-00"
                  maxlength="18"
                  inputmode="numeric"
                  class="poppins-regular"
                  @input="onCnpjInput"
                />
              </div>

              <div class="input-group">
                <label
                  >Pedido Mínimo (R$)
                  <span class="required-star">*</span></label
                >
                <div class="currency-input-wrap">
                  <span class="currency-prefix">R$</span>
                  <input
                    v-model="cadastroForm.pedidoMinimoRaw"
                    placeholder="0,00"
                    inputmode="numeric"
                    class="poppins-regular"
                    @input="onPedidoMinimoInput"
                  />
                </div>
                <span class="field-hint"
                  >Valor mínimo de pedido da sua distribuidora</span
                >
              </div>

              <p v-if="erroCadastro" class="form-error poppins-regular">
                {{ erroCadastro }}
              </p>

              <button
                class="primary-fintech-btn poppins-medium"
                :disabled="submittingCadastro"
                @click="cadastrarEmpresa"
              >
                <span v-if="submittingCadastro">Salvando...</span>
                <template v-else>
                  Cadastrar Empresa
                  <span class="material-symbols-outlined">arrow_forward</span>
                </template>
              </button>

              <button
                v-if="empresasDisponiveis.length > 0"
                type="button"
                class="link-back-btn poppins-regular"
                @click="voltarParaLista"
              >
                Voltar para lista de empresas
              </button>

              <p class="support-text poppins-regular">
                Leva menos de 2 minutos.
              </p>
            </div>
          </div>
        </div>
      </transition>

      <!-- Overlay: empresa sem pedido mínimo cadastrado -->
      <transition name="fade">
        <div
          v-if="!loadingEmpresas && temEmpresaVinculada && !temPedidoMinimo"
          class="fintech-overlay"
        >
          <div class="overlay-content">
            <div class="illustration-container">
              <div class="icon-circle-main icon-circle-warning">
                <span class="material-symbols-outlined">edit_note</span>
              </div>
            </div>

            <h2 class="poppins-semibold">Cadastro incompleto</h2>
            <p class="poppins-regular text-muted">
              Sua distribuidora ainda não possui um
              <strong>pedido mínimo</strong> definido. Para que os varejistas
              possam visualizar e negociar com você corretamente, é necessário
              regularizar esse dado no seu perfil de empresa.
            </p>

            <div class="action-footer">
              <button
                class="primary-fintech-btn poppins-medium"
                @click="irParaCadastroEmpresa"
              >
                Regularizar Cadastro
                <span class="material-symbols-outlined">arrow_forward</span>
              </button>
              <p class="support-text poppins-regular">
                Adicione o valor do pedido mínimo da sua distribuidora.
              </p>
            </div>
          </div>
        </div>
      </transition>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { IonPage, IonContent, toastController } from "@ionic/vue";
import { api } from "@/services/api";

import InputText from "primevue/inputtext";
import SelectButton from "primevue/selectbutton";
import Skeleton from "primevue/skeleton";
import Button from "primevue/button";
import Paginator from "primevue/paginator";
import Calendar from "primevue/calendar";
import RefresherIonic from "@/components/refresherIonic.vue";

const LS_KEY_MODAL_STATUS_MINHAS_COTACOES =
  "mvsgdb_modal_status_oculto_minhas_cotacoes";

export default defineComponent({
  name: "QuotesBrowserPage",
  components: {
    IonPage,
    IonContent,
    InputText,
    SelectButton,
    Skeleton,
    Button,
    Paginator,
    Calendar,
    RefresherIonic,
  },
  data() {
    return {
      loading: true,
      nowTimestamp: Date.now(),
      clockInterval: null as ReturnType<typeof setInterval> | null,
      error: false,
      showFilters: false,
      searchQuery: "",
      upcomingSearch: "",
      openSearch: "",
      activeFilter: "todas",
      activeSort: "recent",
      quotes: [] as any[],
      firstRow: 0,
      rowsPerPage: 7,
      firstRowDesktop: 0,
      rowsPerPageDesktop: 9,
      nenhumaCotacao: true,
      temEmpresaVinculada: true,
      temPedidoMinimo: true,
      loadingEmpresas: true,
      empresasDisponiveis: [] as any[],
      mostrarFormCadastro: false,
      selecionandoCnpj: "",
      cadastroForm: {
        nome_empresa: "",
        cnpjRaw: "",
        cnpj: "",
        pedidoMinimoRaw: "",
        pedido_minimo: 0,
      },
      erroCadastro: "",
      submittingCadastro: false,
      filterOptions: [
        { label: "Todas", value: "todas" },
        { label: "Aberta", value: "aberta" },
        { label: "Não disponibilizada", value: "indisponivel" },
        { label: "Fechada", value: "finalizada" },
        { label: "Concluído", value: "concluido" },
        { label: "Participando", value: "participando" },
      ],
      sortOptions: [
        { label: "Mais Recentes", value: "recent" },
        { label: "Mais Antigas", value: "oldest" },
        { label: "Nome (A-Z)", value: "az" },
      ],

      // ── Campos exclusivos da visão desktop (>= 992px) ──────────────
      filtroAtivo: null as string | null,
      filtroDatas: null as Date[] | null,
      modalStatusVisivel: false,
      activeFilterDesktop: null as string | null, // 'aberta' | 'fechada' | 'finalizada' | 'indisponivel' | null
    };
  },
  computed: {
    filteredUpcomingQuotes() {
      return this.filterFeaturedQuotes(
        this.upcomingQuotes,
        this.upcomingSearch
      );
    },
    filteredOpenQuotes() {
      return this.filterFeaturedQuotes(this.openQuotes, this.openSearch);
    },
    upcomingQuotes() {
      return this.quotes
        .filter((q) => {
          const start = this.quoteTimestamp(q.inicio_cotacao);
          return (
            start !== null &&
            start > this.nowTimestamp &&
            !["finalizada", "concluido"].includes(this.getStatusKeyDesktop(q))
          );
        })
        .sort(
          (a, b) =>
            this.quoteTimestamp(a.inicio_cotacao)! -
            this.quoteTimestamp(b.inicio_cotacao)!
        );
    },
    openQuotes() {
      return this.quotes
        .filter((q) => {
          const start = this.quoteTimestamp(q.inicio_cotacao);
          const end = this.quoteTimestamp(q.final_cotacao);
          return (
            this.getStatusKeyDesktop(q) === "aberta" &&
            start !== null &&
            start <= this.nowTimestamp &&
            (end === null || end >= this.nowTimestamp)
          );
        })
        .sort(
          (a, b) =>
            (this.quoteTimestamp(a.final_cotacao) ?? Infinity) -
            (this.quoteTimestamp(b.final_cotacao) ?? Infinity)
        );
    },
    filteredQuotes() {
      let result = [...this.quotes];

      if (this.activeFilter === "participando") {
        result = result.filter((q) => !!q.participando);
      } else if (this.activeFilter !== "todas") {
        result = result.filter(
          (q) => this.getStatusKeyDesktop(q) === this.activeFilter
        );
      }

      if (this.searchQuery.trim() !== "") {
        const query = this.searchQuery.toLowerCase();
        result = result.filter((q) =>
          q.nome_cotacao.toLowerCase().includes(query)
        );
      }

      result.sort((a, b) => {
        if (this.activeSort === "recent")
          return parseInt(b.id_cotacao) - parseInt(a.id_cotacao);
        if (this.activeSort === "oldest")
          return parseInt(a.id_cotacao) - parseInt(b.id_cotacao);
        if (this.activeSort === "az")
          return a.nome_cotacao.localeCompare(b.nome_cotacao);
        return parseInt(b.id_cotacao) - parseInt(a.id_cotacao);
      });

      return result;
    },
    paginatedQuotes() {
      return this.filteredQuotes.slice(
        this.firstRow,
        this.firstRow + this.rowsPerPage
      );
    },

    // ── Computed exclusivo da visão desktop (>= 992px) ──────────────
    // Reaproveita searchQuery e activeFilter (compartilhados com o mobile)
    // e adiciona o filtro por período de data, próprio do desktop.
    filteredQuotesDesktop() {
      let result = [...this.quotes];

      if (this.activeFilterDesktop === "participando") {
        result = result.filter((q) => !!q.participando);
      } else if (this.activeFilterDesktop) {
        result = result.filter(
          (q) => this.getStatusKeyDesktop(q) === this.activeFilterDesktop
        );
      }

      if (this.searchQuery.trim() !== "") {
        const query = this.searchQuery.toLowerCase();
        result = result.filter((q) =>
          q.nome_cotacao.toLowerCase().includes(query)
        );
      }

      if (this.filtroDatas && this.filtroDatas[0] && this.filtroDatas[1]) {
        const inicio = this.filtroDatas[0];
        const fim = this.filtroDatas[1];
        result = result.filter((q) => {
          const dataCotacao = new Date(Number(q.inicio_cotacao));
          return dataCotacao >= inicio && dataCotacao <= fim;
        });
      }

      // Ordena sempre pelo id da cotação, do maior para o menor
      result.sort((a, b) => Number(b.id_cotacao) - Number(a.id_cotacao));

      return result;
    },

    paginatedQuotesDesktop() {
      return this.filteredQuotesDesktop.slice(
        this.firstRowDesktop,
        this.firstRowDesktop + this.rowsPerPageDesktop
      );
    },
  },
  watch: {
    searchQuery() {
      this.firstRow = 0;
      this.firstRowDesktop = 0;
    },
    activeFilter() {
      this.firstRow = 0;
    },
    activeSort() {
      this.firstRow = 0;
    },
    activeFilterDesktop() {
      this.firstRowDesktop = 0;
    },
    filtroDatas() {
      this.firstRowDesktop = 0;
    },
  },
  methods: {
    filterFeaturedQuotes(quotes: any[], search: string) {
      const normalize = (value: unknown) =>
        String(value ?? "")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLocaleLowerCase("pt-BR");
      const query = normalize(search.trim());
      if (!query) return quotes;
      return quotes.filter((q) =>
        [q.nome_cotacao, q.nome_fantasia, q.razao_social].some((value) =>
          normalize(value).includes(query)
        )
      );
    },
    quoteTimestamp(value: unknown): number | null {
      if (value === null || value === undefined || value === "") return null;
      const numeric = Number(value);
      const timestamp = Number.isFinite(numeric)
        ? numeric < 1e12
          ? numeric * 1000
          : numeric
        : new Date(String(value)).getTime();
      return Number.isFinite(timestamp) ? timestamp : null;
    },
    async fetchQuotes() {
      this.loading = true;
      this.error = false;
      try {
        const response = await api.get("/mvpu/cotacao/vendedorGetCotacoes/0");

        const responseEmpresas = await api.get(
          "/mvpu/usuario/operacoesEmpresaVendedor/"
        );
        const empresas = responseEmpresas.data?.data || [];
        this.empresasDisponiveis = empresas;

        if (empresas.length === 0) {
          // Sem nenhuma empresa cadastrada: vai direto para o formulário de cadastro
          this.temEmpresaVinculada = false;
          this.mostrarFormCadastro = true;
          this.nenhumaCotacao = true;
          this.loadingEmpresas = false;
          return; // Interrompe aqui, não precisa buscar stats se não tem empresa
        }

        let verificaSelecionada = false;

        for (let empresa of empresas) {
          if (empresa.selecionada) {
            verificaSelecionada = true;
          }
        }

        if (!verificaSelecionada) {
          // Já existem empresas cadastradas, mas nenhuma selecionada: mostra a lista para escolher
          this.temEmpresaVinculada = false;
          this.nenhumaCotacao = true;
          this.loadingEmpresas = false;
          return; // Interrompe aqui, não precisa buscar stats se não tem empresa
        }

        this.temEmpresaVinculada = true;

        // Verificar se a empresa selecionada tem pedido_minimo preenchido
        const empresaSelecionada = empresas.find((e: any) => e.selecionada);
        if (
          empresaSelecionada &&
          (empresaSelecionada.pedido_minimo === null ||
            empresaSelecionada.pedido_minimo === undefined)
        ) {
          this.temPedidoMinimo = false;
          this.loadingEmpresas = false;
          return;
        }
        this.temPedidoMinimo = true;
        this.loadingEmpresas = false;

        //Adicionar essa validação em enviar solicitação loja. Só pode enviar se houver uma empresa no mínimo

        if (response.data.data.length == 0) {
          this.nenhumaCotacao = true;
          return;
        }

        this.nenhumaCotacao = false;

        // Criamos um Map usando o ID como chave e depois pegamos apenas os valores
        const arrayLimpo = [
          ...new Map(
            response.data.data.map((item) => [item.id_cotacao, item])
          ).values(),
        ];

        // Ordena da maior para a menor id_cotacao (cotações mais recentes primeiro)
        arrayLimpo.sort((a, b) => b.id_cotacao - a.id_cotacao);

        this.quotes = arrayLimpo || [];
      } catch (err) {
        this.error = true;
      } finally {
        setTimeout(() => {
          this.loading = false;
        }, 600);
      }
    },
    // Quantidade de boletos da cotação, em texto (ex.: "2 boletos"). "Não informado" se ausente.
    getQtdBoletosTexto(quote: any): string {
      const qtd = quote?.qtd_boletos;
      if (qtd === null || qtd === undefined || qtd === "")
        return "Não informado";

      const qtdNumero = Number(qtd);
      return qtdNumero === 1 ? "1 boleto" : `${qtdNumero} boletos`;
    },
    // Prazo dos boletos formatado a partir de prazo_boleto ("7" -> "7 dias", "7/14" -> "7/14 dias", etc.)
    // "Não informado" se ausente.
    getPrazoBoletoTexto(quote: any): string {
      const prazo = quote?.prazo_boleto;
      if (!prazo) return "Não informado";

      return `${prazo} dias`;
    },
    // Ícone indicativo para cada status da cotação (mesma taxonomia usada em getStatusKeyDesktop)
    getStatusIcon(statusKey: string): string {
      const icons: Record<string, string> = {
        aberta: "radio_button_unchecked",
        indisponivel: "block",
        finalizada: "lock",
        concluido: "check_circle",
      };
      return icons[statusKey] || "help";
    },
    resetFilters() {
      this.searchQuery = "";
      this.activeFilter = "todas";
      this.activeSort = "recent";
      this.firstRow = 0;
    },
    irParaCadastroEmpresa() {
      this.$router.push({ name: "MinhasEmpresas" });
    },

    // ── Máscaras / helpers de formulário ──────────────────────────────────
    aplicarMascaraCnpj(valor: string): string {
      let v = valor.replace(/\D/g, "").slice(0, 14);

      if (v.length > 2) {
        v = v.replace(/^(\d{2})(\d)/, "$1.$2");
      }
      if (v.length > 6) {
        v = v.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
      }
      if (v.length > 9) {
        v = v.replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4");
      }
      if (v.length > 13) {
        v = v.replace(
          /^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/,
          "$1.$2.$3/$4-$5"
        );
      }
      return v;
    },
    cnpjSomenteNumeros(valor: string): string {
      return valor.replace(/\D/g, "");
    },
    centavosParaExibicao(centavos: number): string {
      return (centavos / 100).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    },
    extrairErroApi(error: any): string {
      const data = error?.response?.data;
      if (data && (data.MSG || data.COD)) {
        return `Erro: ${data.MSG ?? "Desconhecido"} (COD: ${data.COD ?? "?"})`;
      }
      return "Erro desconhecido. Tente novamente.";
    },
    onCnpjInput(e: Event) {
      const input = e.target as HTMLInputElement;
      const masked = this.aplicarMascaraCnpj(input.value);

      this.cadastroForm.cnpjRaw = masked;
      this.cadastroForm.cnpj = this.cnpjSomenteNumeros(masked);
      input.value = masked;
    },
    onPedidoMinimoInput(e: Event) {
      const raw = (e.target as HTMLInputElement).value.replace(/\D/g, "");
      const centavos = parseInt(raw || "0", 10);
      const formatado = this.centavosParaExibicao(centavos);

      this.cadastroForm.pedidoMinimoRaw = formatado;
      this.cadastroForm.pedido_minimo = centavos / 100;
      (e.target as HTMLInputElement).value = formatado;
    },
    async showToast(msg: string, color = "success") {
      const toast = await toastController.create({
        message: msg,
        duration: 3000,
        color,
        position: "bottom",
      });
      await toast.present();
    },
    // ── Seleção de empresa já cadastrada ─────────────────────────────────
    async selecionarEmpresaExistente(cnpj: string) {
      this.selecionandoCnpj = cnpj;
      try {
        await api.post(`/mvpu/usuario/selecionarEmpresa/${cnpj}`, {});
        this.showToast("Empresa selecionada com sucesso!");
        await this.fetchQuotes();
      } catch (err: any) {
        this.showToast(this.extrairErroApi(err), "danger");
      } finally {
        this.selecionandoCnpj = "";
      }
    },
    abrirFormCadastro() {
      this.resetCadastroForm();
      this.mostrarFormCadastro = true;
    },
    voltarParaLista() {
      this.resetCadastroForm();
      this.mostrarFormCadastro = false;
    },
    // ── Cadastro de nova empresa ──────────────────────────────────────────
    async cadastrarEmpresa() {
      this.erroCadastro = "";

      if (!this.cadastroForm.nome_empresa.trim()) {
        this.erroCadastro = "Informe o nome da empresa.";
        return;
      }
      if (this.cadastroForm.cnpj.length !== 14) {
        this.erroCadastro = "CNPJ inválido. Informe os 14 dígitos.";
        return;
      }
      if (
        !this.cadastroForm.pedido_minimo ||
        this.cadastroForm.pedido_minimo <= 0
      ) {
        this.erroCadastro = "Informe o pedido mínimo da distribuidora.";
        return;
      }

      this.submittingCadastro = true;
      try {
        await api.post("/mvpu/usuario/operacoesEmpresaVendedor/", {
          cnpj: this.cadastroForm.cnpj,
          nome_empresa: this.cadastroForm.nome_empresa,
          pedido_minimo: this.cadastroForm.pedido_minimo,
        });
        this.showToast("Empresa cadastrada com sucesso!");
        this.resetCadastroForm();
        this.mostrarFormCadastro = false;
        this.fetchQuotes();
      } catch (err: any) {
        this.erroCadastro = this.extrairErroApi(err);
        this.showToast(this.erroCadastro, "danger");
      } finally {
        this.submittingCadastro = false;
      }
    },
    resetCadastroForm() {
      this.cadastroForm = {
        nome_empresa: "",
        cnpjRaw: "",
        cnpj: "",
        pedidoMinimoRaw: "",
        pedido_minimo: 0,
      };
      this.erroCadastro = "";
    },
    navigateToDetails(quote: any) {
      this.$router.push({
        name: "DetalhesCotacao",
        query: {
          id_cotacao: quote.id_cotacao,
          id_loja: quote.id_loja,
          status_fechamento: quote.status_fechamento,
          nome_fantasia: quote.nome_fantasia,
          razao_social: quote.razao_social,
        },
      });
    },

    // ── Lógica de status, compartilhada pelos cards mobile e desktop ──────
    // Deriva um status único ("aberta" | "indisponivel" | "finalizada" | "concluido")
    // a partir de status_cotacao + status_fechamento:
    // 1) status_fechamento == null                 && status_cotacao == 'fechada'      → indisponivel  (Não disponibilizada)
    // 2) status_fechamento == null                 && status_cotacao == 'aberta'       → aberta        (Aberta)
    // 3) status_fechamento == 'pendente'                                               → finalizada    (Fechada)
    // 4) status_fechamento == null                 && status_cotacao == 'finalizada'   → finalizada    (Fechada)
    // 5) status_fechamento == 'concluido'                                              → concluido     (Concluído)
    getStatusKeyDesktop(cotacao: any) {
      const s = cotacao.status_cotacao;
      const f = cotacao.status_fechamento;

      if (f === "concluido") {
        return "concluido";
      }

      if (f === "pendente") {
        return "finalizada";
      }

      if (f == null && s === "fechada") {
        return "indisponivel";
      }

      if (f == null && s === "aberta") {
        return "aberta";
      }

      if (f == null && s === "finalizada") {
        return "finalizada";
      }

      return "aberta";
    },

    getLabelStatusDesktop(cotacao: any) {
      const key = this.getStatusKeyDesktop(cotacao);

      const labels: Record<string, string> = {
        aberta: "Aberta",
        finalizada: "Fechada",
        indisponivel: "Não disponibilizada",
        concluido: "Concluído",
      };
      return labels[key] || key;
    },

    getStatusSeverityDesktop(
      cotacao: any
    ): "success" | "secondary" | "info" | "warn" | undefined {
      const key = this.getStatusKeyDesktop(cotacao);

      switch (key) {
        case "aberta":
          return "success";
        case "indisponivel":
          return "secondary";
        case "concluido":
          return "info";
        case "finalizada":
          return "warn";
        default:
          return "secondary";
      }
    },

    formatarDataDesktop(timestamp: string) {
      if (!timestamp) return "-";
      return new Date(Number(timestamp)).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },

    definirFiltroData(tipo: string) {
      this.filtroAtivo = tipo;
      const hoje = new Date();
      let inicio = new Date();
      let fim = new Date();

      if (tipo === "hoje") {
        inicio.setHours(0, 0, 0, 0);
        fim.setHours(23, 59, 59, 999);
      } else if (tipo === "semana") {
        const diaSemana = hoje.getDay();
        inicio.setDate(hoje.getDate() - diaSemana);
        inicio.setHours(0, 0, 0, 0);
      } else if (tipo === "mes") {
        inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      }

      this.filtroDatas = [inicio, fim];
      this.firstRow = 0;
    },

    limparFiltrosDesktop() {
      this.filtroAtivo = null;
      this.filtroDatas = null;
      this.activeFilterDesktop = null;
      this.firstRow = 0;
    },

    definirFiltroStatusDesktop(status: string) {
      this.activeFilterDesktop =
        this.activeFilterDesktop === status ? null : status;
      this.firstRow = 0;
    },

    fecharModal() {
      this.modalStatusVisivel = false;
    },

    fecharModalDefinitivamente() {
      localStorage.setItem(LS_KEY_MODAL_STATUS_MINHAS_COTACOES, "true");
      this.modalStatusVisivel = false;
    },

    verificarExibirModalStatus() {
      const oculto = localStorage.getItem(LS_KEY_MODAL_STATUS_MINHAS_COTACOES);
      if (!oculto) {
        this.modalStatusVisivel = true;
      }
    },
  },
  mounted() {
    this.fetchQuotes();
    this.verificarExibirModalStatus();
    this.clockInterval = setInterval(() => {
      this.nowTimestamp = Date.now();
    }, 60000);
  },
  beforeUnmount() {
    if (this.clockInterval) clearInterval(this.clockInterval);
  },
});
</script>

<style scoped>
/* Destaques com rolagem vertical independente e cards completos. */
.mobile-page-title {
  margin: 8px 0 18px;
  font-size: clamp(1.5rem, 4vw, 2rem);
}
.featured-section {
  margin: 0 0 24px;
  padding: 18px;
  border: 1px solid #e8edf3;
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 10px 28px rgba(29, 47, 75, 0.05);
  min-width: 0;
}
.featured-section--upcoming {
  border-top: 4px solid #f59e0b;
}
.featured-section--open {
  border-top: 4px solid #22c55e;
}
.featured-heading {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}
.featured-heading-icon {
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  display: grid;
  place-items: center;
  border-radius: 13px;
  color: #b45309;
  background: #fffbeb;
}
.featured-section--open .featured-heading-icon {
  color: #15803d;
  background: #f0fdf4;
}
.featured-heading h2 {
  margin: 0;
  color: #172033;
  font-size: clamp(1rem, 2.6vw, 1.3rem);
  font-weight: 700;
  line-height: 1.3;
}
.featured-heading p {
  margin: 3px 0 0;
  color: #64748b;
  font-size: 0.85rem;
}
.featured-count {
  display: inline-grid;
  place-items: center;
  min-width: 24px;
  padding: 2px 7px;
  border-radius: 99px;
  background: #f1f5f9;
  color: #475569;
  font-size: 0.75rem;
  vertical-align: middle;
}
.featured-search {
  display: flex;
  align-items: center;
  gap: 9px;
  width: min(100%, 440px);
  min-height: 42px;
  margin-bottom: 14px;
  padding: 0 12px;
  border: 1px solid #dbe3ed;
  border-radius: 12px;
  background: #f8fafc;
  color: #64748b;
}
.featured-search:focus-within {
  border-color: #ff8049;
  box-shadow: 0 0 0 3px #ff804925;
}
.featured-search input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: #172033;
  font: inherit;
  font-size: 0.875rem;
}
.featured-search input::placeholder {
  color: #94a3b8;
}
.featured-scroll {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  overscroll-behavior-x: contain;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
  padding: 3px 3px 12px;
}
.featured-scroll:focus-visible {
  outline: 2px solid #ff8049;
  outline-offset: 3px;
}
.featured-grid {
  display: flex;
  align-items: stretch;
  gap: 14px;
  width: max-content;
  min-width: 100%;
}
.featured-grid .quote-info-card {
  flex: 0 0 clamp(280px, 28vw, 360px);
  min-width: 0;
  box-shadow: 0 3px 14px rgba(29, 47, 75, 0.07);
}
.featured-empty {
  margin: 0;
  padding: 18px;
  border-radius: 12px;
  background: #f8fafc;
  color: #64748b;
  font-size: 0.9rem;
}
.all-quotes-title {
  margin: 8px 0 16px;
  color: #172033;
  font-size: clamp(1.2rem, 3vw, 1.55rem);
  font-weight: 700;
}
.mobile-view {
  min-width: 0;
}
.mobile-view .search-section {
  margin: 0 0 16px;
  border: 1px solid #e8edf3;
  border-radius: 16px;
}
@media (max-width: 600px) {
  .featured-section {
    padding: 14px;
    border-radius: 16px;
  }
  .featured-grid .quote-info-card {
    flex-basis: min(82vw, 340px);
  }
  .featured-heading {
    align-items: flex-start;
  }
  .featured-heading p {
    line-height: 1.4;
  }
}

.quotes-browser-page {
  --background: #f8fafc;
}

.search-section {
  background: white;
  margin: -16px -16px 0 -16px;
  padding: 20px 16px 16px 16px;
  border-bottom: 1px solid #f1f5f9;
}

.page-title {
  font-size: 20px;
  color: #0f172a;
  margin: 0 0 16px 0;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-bar-container {
  flex: 1;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #94a3b8;
  font-size: 20px;
}

.custom-search-input {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 12px 12px 12px 42px;
  background: #f8fafc;
  font-size: 14px;
}

/* Botão de Toggle Filtro */
.filter-toggle-btn {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #475569;
  border-radius: 12px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.filter-active {
  background: #1e293b;
  color: white;
  border-color: #1e293b;
}

/* Painel de Filtros Vertical */
.expanded-filters-panel {
  background: #f8fafc;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
}

.filter-label {
  display: block;
  font-size: 12px;
  color: #64748b;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.custom-select-button-vertical {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.custom-select-button-vertical :deep(.p-button) {
  background: white;
  border: 1px solid #e2e8f0;
  color: #64748b;
  font-size: 13px;
  justify-content: flex-start;
  padding: 10px 16px;
  border-radius: 8px !important; /* Força arredondamento individual */
}

.custom-select-button-vertical :deep(.p-button.p-highlight) {
  background: #3b82f6 !important;
  border-color: #3b82f6 !important;
  color: white !important;
}

/* ═══════════════════════════════════════════════════════════
   QUOTE INFO CARD — design único usado tanto no mobile-view
   quanto no desktop-view, dentro de um grid responsivo.
═══════════════════════════════════════════════════════════ */
.quotes-grid-cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}

@media (min-width: 670px) {
  .quotes-grid-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

.quote-info-card {
  background: white;
  border: 1px solid #e0dede;
  box-shadow: 4px 4px 15px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: box-shadow 0.2s ease, transform 0.15s ease, border-color 0.2s ease;
}

.quote-info-card:hover {
  border-color: #ffd9c2;
  box-shadow: 4px 4px 15px rgba(226, 127, 13, 0.1);
}

.quote-info-card:active {
  transform: scale(0.98);
}

/* Cabeçalho: status + id */
.qic-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.qic-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  padding: 4px 10px 4px 8px;
  border-radius: 20px;
}

.qic-status-icon {
  font-size: 14px;
}

.qic-status-pill.is-aberta {
  background: #22c55e1f;
  color: #16a34a;
}
.qic-status-pill.is-finalizada {
  background: #f59e0b1f;
  color: #b45309;
}
.qic-status-pill.is-indisponivel {
  background: #94a3b81f;
  color: #64748b;
}
.qic-status-pill.is-concluido {
  background: #10b9811f;
  color: #0d9488;
}

.qic-id-tag {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 11px;
  font-weight: 500;
  color: #94a3b8;
}

.qic-id-tag .material-symbols-outlined {
  font-size: 14px;
}

/* Selo indicando que o vendedor já possui oferta enviada nesta cotação */
.qic-participando-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  align-self: flex-start;
  font-size: 13px;
  font-weight: 800;
  color: #36c223;
  background: #1eff0020;
  border: 1px solid #1eff0040;
  border-radius: 20px;
  padding: 4px 10px 4px 8px;
}

.qic-participando-badge .material-symbols-outlined {
  font-size: 14px;
}

/* Título da cotação */
.qic-title {
  font-size: 15px;
  color: #1e293b;
  margin: 0;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Loja: nome fantasia + razão social */
.qic-store {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: #f8fafc;
  border-radius: 10px;
  padding: 8px 10px;
}

.qic-store-icon {
  font-size: 18px;
  color: #94a3b8;
  margin-top: 1px;
  flex-shrink: 0;
}

.qic-store-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.qic-store-name {
  font-size: 12.5px;
  color: #334155;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.qic-store-razao {
  font-size: 11px;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Datas: início / término */
.qic-dates {
  display: flex;
  align-items: center;
  gap: 8px;
}

.qic-date-block {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.qic-date-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: #94a3b8;
}

.qic-date-label .material-symbols-outlined {
  font-size: 13px;
}

.qic-date-value {
  font-size: 12.5px;
  color: #1e293b;
}

.qic-date-sep {
  font-size: 15px;
  color: #cbd5e1;
  flex-shrink: 0;
}

/* Campos: produtos + condição de pagamento */
.qic-fields-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.qic-field {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  background: #fafbfc;
  border: 1px solid #f1f5f9;
  border-radius: 10px;
  padding: 8px 9px;
}

.qic-field-full {
  grid-column: 1 / -1;
}

.qic-field-icon {
  font-size: 17px;
  color: #ff8049;
  margin-top: 1px;
  flex-shrink: 0;
}

.qic-field-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 1px;
}

.qic-field-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: #94a3b8;
}

.qic-field-value {
  font-size: 12.5px;
  color: #1e293b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Observação */
.qic-obs {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  background: #fff8f4;
  border: 1px solid #ffe6d5;
  border-radius: 10px;
  padding: 8px 9px;
}

.qic-obs-icon {
  font-size: 15px;
  color: #ff8049;
  margin-top: 1px;
  flex-shrink: 0;
}

.qic-obs-text {
  font-size: 11.5px;
  color: #7c4a2d;
  line-height: 1.45;
  margin: 0;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  font-weight: 700;
}

/* Rodapé: call to action */
.qic-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 500;
  color: #ff8049;
  padding-top: 2px;
  border-top: 1px solid #f1f5f9;
  margin-top: 2px;
  padding-top: 10px;
}

.qic-footer .material-symbols-outlined {
  font-size: 16px;
}

/* Grid do desktop: mais colunas em telas largas */
@media (min-width: 992px) {
  .desktop-view .quotes-grid-cards {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

@media (min-width: 1400px) {
  .desktop-view .quotes-grid-cards {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Animação do Painel */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Paginator */
.custom-paginator {
  background: transparent !important;
  border: none !important;
}

.custom-paginator :deep(.p-paginator-page),
.custom-paginator :deep(.p-paginator-next),
.custom-paginator :deep(.p-paginator-prev) {
  background: white !important;
  border-radius: 8px !important;
  margin: 0 4px !important;
  min-width: 35px !important;
  height: 35px !important;
  color: #64748b !important;
  border: 1px solid #e2e8f0 !important;
}

.custom-paginator :deep(.p-highlight) {
  background: #3b82f6 !important;
  color: white !important;
}

.empty-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 30px;
  text-align: center;
}

.empty-icon-wrapper {
  width: 64px;
  height: 64px;
  background: #f1f5f9;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.empty-icon-wrapper span {
  font-size: 32px;
  color: #94a3b8;
}
.error-icon {
  font-size: 48px;
  color: #ef4444;
  margin-bottom: 12px;
}
.retry-btn {
  background: #3b82f6;
  border: none;
  font-size: 14px;
}
.bottom-spacer {
  height: 100px;
}

/* ===== OVERLAYS EMPRESA / PEDIDO MÍNIMO ===== */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fintech-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #ffffff;
  z-index: 1000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 40px 24px;
  overflow-y: auto;
}

.overlay-content {
  text-align: center;
  max-width: 320px;
}

.overlay-content-form {
  max-width: 380px;
  width: 100%;
  padding-top: 20px;
}

.icon-circle-main {
  width: 80px;
  height: 80px;
  background: #f8fafc;
  border-radius: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  color: #ff8049;
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.1);
}

.icon-circle-main span {
  font-size: 38px;
}

.icon-circle-warning {
  color: #f59e0b;
  box-shadow: 0 10px 25px rgba(245, 158, 11, 0.15);
}

.overlay-content h2 {
  color: #1e293b;
  font-size: 24px;
  margin-bottom: 12px;
}

.text-muted {
  color: #64748b;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 24px;
}

.action-footer {
  margin-top: 8px;
}

/* Formulário de cadastro inline (overlays de empresa / pedido mínimo) */
.inline-form {
  text-align: left;
}

.input-group {
  margin-bottom: 16px;
}

.input-group label {
  display: block;
  font-size: 13px;
  margin-bottom: 6px;
  color: #64748b;
}

.input-group input {
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  border: 1.5px solid #e2e8f0;
  outline: none;
  transition: 0.3s;
  font-size: 15px;
  box-sizing: border-box;
}

.input-group input:focus {
  border-color: #ff8049;
}

.required-star {
  color: #ef4444;
  margin-left: 2px;
}

.currency-input-wrap {
  display: flex;
  align-items: center;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  transition: border-color 0.3s;
}

.currency-input-wrap:focus-within {
  border-color: #ff8049;
}

.currency-prefix {
  padding: 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: #94a3b8;
  background: #f8fafc;
  border-right: 1.5px solid #e2e8f0;
  height: 100%;
  display: flex;
  align-items: center;
  align-self: stretch;
}

.currency-input-wrap input {
  border: none;
  outline: none;
  padding: 14px 12px;
  font-size: 15px;
  width: 100%;
  background: transparent;
  box-sizing: border-box;
}

.field-hint {
  display: block;
  font-size: 11px;
  color: #94a3b8;
  margin-top: 4px;
}

.form-error {
  color: #ef4444;
  font-size: 13px;
  margin: 0 0 14px;
  padding: 8px 12px;
  background: #fef2f2;
  border-radius: 8px;
  text-align: left;
}

/* Lista de empresas já cadastradas (overlay de seleção) */
.empresas-select-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 280px;
  overflow-y: auto;
  margin-bottom: 20px;
  padding-right: 2px;
  text-align: left;
}

.empresa-select-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 14px 16px;
}

.empresa-select-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.empresa-select-nome {
  font-size: 14px;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empresa-select-cnpj {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 2px;
}

.select-empresa-btn {
  flex-shrink: 0;
  background: #1e293b;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 13px;
  white-space: nowrap;
  cursor: pointer;
}

.select-empresa-btn:disabled {
  opacity: 0.6;
  cursor: default;
}

.secondary-fintech-btn {
  width: 100%;
  background: #f1f5f9;
  color: #1e293b;
  border: 1px solid #e2e8f0;
  padding: 16px 24px;
  border-radius: 16px;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
}

.secondary-fintech-btn span {
  font-size: 18px;
}

.link-back-btn {
  display: block;
  width: 100%;
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 13px;
  padding: 12px 0 0;
  text-align: center;
  text-decoration: underline;
  cursor: pointer;
}

.primary-fintech-btn {
  width: 100%;
  background: #1e293b;
  color: white;
  border: none;
  padding: 18px 24px;
  border-radius: 16px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: transform 0.2s;
  box-shadow: 0 10px 20px rgba(30, 41, 59, 0.2);
  cursor: pointer;
}

.primary-fintech-btn:active {
  transform: scale(0.96);
}

.primary-fintech-btn span {
  font-size: 20px;
}

.support-text {
  display: block;
  margin-top: 15px;
  color: #94a3b8;
  font-size: 13px;
}

/* ════════════════════════════════════════════════════════════════
   VISIBILIDADE RESPONSIVA
   < 992px → mostra .mobile-view (cards, layout original)
   >= 992px → mostra .desktop-view (mesmo estilo do Painel de
   Cotações / consultarCotacoesConsole.vue)
════════════════════════════════════════════════════════════════ */
.desktop-view {
  display: none;
}

@media (min-width: 992px) {
  .mobile-view {
    display: none;
  }

  .desktop-view {
    display: block;
  }
}

/* ════════════════════════════════════════════════════════════════
   VISÃO DESKTOP (>= 992px) — réplica do estilo de
   consultarCotacoesConsole.vue
════════════════════════════════════════════════════════════════ */
.desktop-view {
  padding: 2rem;
  background-color: #f8f9fa;
  font-family: "Poppins", sans-serif;
  color: #334155;
}

/* MODAL */
.desktop-view .modal-overlay {
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

.desktop-view .modal-card {
  background: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 620px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.18);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.desktop-view .modal-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.4rem 1.6rem;
  border-bottom: 1px solid #f1f5f9;
}

.desktop-view .modal-header-icon {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #ff8049, #ff6020);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.desktop-view .modal-header-icon .material-symbols-outlined {
  color: #ffffff;
  font-size: 22px;
}

.desktop-view .modal-title {
  font-size: 1.05rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.desktop-view .modal-subtitle {
  font-size: 0.82rem;
  color: #64748b;
  margin: 2px 0 0 0;
}

.desktop-view .modal-close-btn {
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
  transition: background 0.15s, color 0.15s;
}

.desktop-view .modal-close-btn:hover {
  background: #f1f5f9;
  color: #475569;
}

.desktop-view .modal-body {
  padding: 1.4rem 1.6rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  max-height: 65vh;
  overflow-y: auto;
}

.desktop-view .status-card {
  border-radius: 10px;
  padding: 1rem 1.2rem;
  border-left: 4px solid transparent;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.desktop-view .status-card--indisponivel {
  background: #f8fafc;
  border-left-color: #94a3b8;
}
.desktop-view .status-card--aberta {
  background: #f0fdf4;
  border-left-color: #22c55e;
}
.desktop-view .status-card--finalizada {
  background: #fff7f3;
  border-left-color: #ff8049;
}
.desktop-view .status-card--concluido {
  background: #eff6ff;
  border-left-color: #3b82f6;
}

.desktop-view .status-card-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.desktop-view .status-card-badge .material-symbols-outlined {
  font-size: 18px;
}
.desktop-view .status-card--indisponivel .status-card-badge {
  color: #64748b;
}
.desktop-view .status-card--aberta .status-card-badge {
  color: #16a34a;
}
.desktop-view .status-card--finalizada .status-card-badge {
  color: #ff8049;
}
.desktop-view .status-card--concluido .status-card-badge {
  color: #2563eb;
}

.desktop-view .status-card-desc {
  font-size: 0.875rem;
  color: #475569;
  line-height: 1.6;
  margin: 0;
}

.desktop-view .modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem 1.6rem;
  border-top: 1px solid #f1f5f9;
  gap: 0.75rem;
}

.desktop-view .btn-nunca-mais {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #94a3b8;
  font-family: "Poppins", sans-serif;
  font-size: 0.82rem;
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 6px;
  transition: color 0.15s, background 0.15s;
}

.desktop-view .btn-nunca-mais:hover {
  color: #64748b;
  background: #f8fafc;
}
.desktop-view .btn-nunca-mais .material-symbols-outlined {
  font-size: 17px;
}

.desktop-view .btn-entendi {
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #ff8049, #ff6020);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1.4rem;
  font-family: "Poppins", sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
}

.desktop-view .btn-entendi:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}
.desktop-view .btn-entendi .material-symbols-outlined {
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

/* BOTÃO DE AJUDA NO HEADER */
.desktop-view .btn-ajuda-status {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fff7f3;
  border: 1px solid #ffd4be;
  color: #ff8049;
  font-family: "Poppins", sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.desktop-view .btn-ajuda-status:hover {
  background: #fff1eb;
  border-color: #ff8049;
  box-shadow: 0 2px 8px rgba(255, 128, 73, 0.15);
}

.desktop-view .btn-ajuda-status .material-symbols-outlined {
  font-size: 18px;
}

/* HEADER */
.desktop-view .page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.desktop-view .header-content h1 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: #1e293b;
}

.desktop-view .header-content p {
  font-size: 0.9rem;
  color: #64748b;
  margin: 0.2rem 0 0 0;
}

.desktop-view .header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

/* BUSCA */
.desktop-view .custom-input {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  width: 300px;
  padding: 0.6rem 1rem 0.6rem 2.5rem;
  transition: all 0.2s;
}

.desktop-view .custom-input:focus {
  border-color: #ff8049;
  box-shadow: 0 0 0 2px rgba(255, 128, 73, 0.1);
}

/* FILTROS */
.desktop-view .filter-panel {
  display: flex;
  gap: 2rem;
  background: white;
  padding: 1.2rem;
  border-radius: 12px;
  border: 1px solid #edf2f7;
  margin-bottom: 1.5rem;
  align-items: flex-end;
  flex-wrap: wrap;
}

.desktop-view .filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.desktop-view .filter-group label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #94a3b8;
  letter-spacing: 0.05em;
}

.desktop-view .button-group {
  display: flex;
  gap: 0.5rem;
}

.desktop-view .button-group :deep(.p-button) {
  background: #f1f5f9;
  border: none;
  color: #475569;
  font-family: "Poppins", sans-serif;
  font-size: 0.85rem;
  border-radius: 6px;
}

.desktop-view .button-group :deep(.p-button:hover) {
  background: #e2e8f0;
}

.desktop-view .button-group :deep(.active-filter) {
  background: #ff8049 !important;
  color: white !important;
}

.desktop-view .custom-calendar {
  height: 38px;
}

/* PAINEL DE COTAÇÕES (grid de cards) */
.desktop-view .table-section {
  background: white;
  border-radius: 12px;
  border: 1px solid #edf2f7;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  padding: 20px;
}

.desktop-view .filter-btn-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 16px;
  background-color: #ffffff;
  border: 1px solid #d0d5dd;
  border-radius: 8px;
  color: #475467;
  font-family: "Poppins", sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.desktop-view .filter-btn-toggle span {
  font-size: 20px;
  transition: transform 0.2s ease;
}

.desktop-view .filter-btn-toggle.active {
  background-color: #fff1eb;
  border-color: #ff8049;
  color: #ff8049;
  box-shadow: 0 1px 2px rgba(255, 128, 73, 0.1);
}

.desktop-view .filter-btn-toggle.active span {
  color: #ff8049;
  font-variation-settings: "FILL" 1;
}

.desktop-view .filter-btn-toggle:hover:not(.active) {
  background-color: #f9fafb;
  border-color: #98a2b3;
}

.desktop-view .filter-btn-toggle:active {
  transform: scale(0.98);
}

.desktop-view .toggle-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.desktop-view .p-button-sm-filter {
  color: #ff8049;
  background-color: #f1f5f9;
  cursor: pointer;
}

.desktop-view .button-filter-disable {
  color: #a7a2a2;
  background-color: #dce0e4;
  cursor: not-allowed;
}

.desktop-view .position-search-icon {
  position: relative;
  transform: translate(35px, 8px);
  z-index: 1;
}

.desktop-view .search-box {
  position: relative;
}

.desktop-view .p-inputtext-sm {
  position: relative;
  padding-left: 40px;
}

/* Estado de erro / "explore mais" na visão desktop, dentro do card da tabela */
.desktop-view .explore-state,
.desktop-view .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 30px;
  text-align: center;
}

.desktop-view .error-icon {
  font-size: 48px;
  color: #ef4444;
  margin-bottom: 12px;
}
.desktop-view .retry-btn {
  background: #3b82f6;
  border: none;
  font-size: 14px;
}
</style>
