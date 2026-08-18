<template>
  <ion-page>
    <ion-content :fullscreen="true" class="mvt-ion-content">
      <div class="mvt-root">

        <!-- ══════════════════ HEADER ══════════════════ -->
        <div class="mvt-header">
          <div class="mvt-header-left">
            <div class="mvt-badge">
              <span class="material-symbols-outlined">bolt</span>
              MARVIZ TRENDS
            </div>
            <h1 class="mvt-title">Marviz Trends - Crie seus anúncios</h1>
            <p class="mvt-sub" style="font-size: 0.9rem;">Cadastre seus produtos, monte promoções e anuncie para vender mais</p>
          </div>
          <div style="display: flex; gap: 10px;">

            <button v-if="view === 'lista'" class="tbtn primary mvt-new-btn" @click="startNewProduct">
              <span class="material-symbols-outlined">add</span>
              Novo Produto
            </button>
            <button class="tbtn primary mvt-new-btn" style="background-color: #555; border-color: #AAA;" @click="openProdutosOfertados">
              <span class="material-symbols-outlined">sell</span>
              Produtos ofertados
            </button>
          </div>
        </div>

        <!-- ══════════════════ TABS ══════════════════ -->
        <div class="mvt-tabs">
          <button class="mvt-tab" :class="{ active: view === 'lista' }" @click="goToList">
            <span class="material-symbols-outlined">grid_view</span>
            Meu Catálogo
            <span class="mvt-tab-count">{{ pagination.total }}</span>
          </button>
          <button class="mvt-tab" :class="{ active: view === 'form' }" @click="view = 'form'">
            <span class="material-symbols-outlined">campaign</span>
            {{ editingId ? 'Editar Anúncio' : 'Novo Anúncio' }}
          </button>
        </div>

        

        <!-- ══════════════════════════════════════════════════════ -->
        <!-- ═══════════════════  LISTAGEM  ═════════════════════════ -->
        <!-- ══════════════════════════════════════════════════════ -->
        <template v-if="view === 'lista'">

          <BannerSiteVendedor />

          <div class="mvt-filters">
            <div class="search-box">
              <span class="material-symbols-outlined">search</span>
              <input
                v-model="filters.search"
                @input="onSearchInput"
                type="text"
                placeholder="Buscar por nome ou código de barras..."
              />
              <span
                v-if="filters.search"
                class="material-symbols-outlined search-clear"
                @click="filters.search = ''; fetchProdutos(1)"
              >close</span>
            </div>

            <select v-model="filters.status" @change="fetchProdutos(1)" class="mvt-select-sm">
              <option v-for="s in statusOptions" :key="s.value" :value="s.value">{{ s.label }}</option>
            </select>


            <!--
          
            <button class="stab" :class="{ active: filters.promo }" @click="togglePromoFilter">
              <span class="material-symbols-outlined" style="font-size:15px">local_offer</span>
              Em promoção
            </button>
            -->
          </div>

          <!-- LOADING SKELETON -->
          <div v-if="loadingList" class="mvt-grid">
            <div v-for="n in 8" :key="'sk'+n" class="prod-card skeleton">
              <div class="prod-cover sk-block"></div>
              <div class="prod-body">
                <div class="sk-line" style="width:60%"></div>
                <div class="sk-line" style="width:90%"></div>
                <div class="sk-line" style="width:40%"></div>
              </div>
            </div>
          </div>

          <!-- EMPTY STATE -->
          <div v-else-if="!produtos.length" class="mvt-empty">
            <span class="material-symbols-outlined">storefront</span>
            <h3>{{ filters.search || filters.promo || filters.status !== 'todos' ? 'Nenhum produto encontrado' : 'Seu catálogo está vazio' }}</h3>
            <p>{{ filters.search || filters.promo || filters.status !== 'todos' ? 'Ajuste os filtros ou a busca para encontrar seus produtos.' : 'Cadastre o primeiro produto e comece a vender na plataforma.' }}</p>
            <button class="tbtn primary" @click="startNewProduct">
              <span class="material-symbols-outlined">add</span> Cadastrar Produto
            </button>
          </div>

          <!-- GRID DE PRODUTOS -->
          <div v-else class="mvt-grid">
            <div v-for="p in produtos" :key="p.id_produto_vendedor" class="prod-card">
              <div class="prod-cover" @click="viewProduct(p)">
                <img v-if="p.foto_capa" :src="p.foto_capa" :alt="p.nome" />
                <div v-else class="prod-cover-empty">
                  <span class="material-symbols-outlined">image</span>
                </div>
                <button
                  v-if="p.foto_capa"
                  class="prod-zoom-btn"
                  title="Ver foto ampliada"
                  @click.stop="openLightbox(productPhotos(p), 0)"
                >
                </button>
                <span v-if="p.destaque" class="prod-flag flag-destaque">
                  <span class="material-symbols-outlined">bolt</span> Destaque
                </span>
                <span v-if="isPromoAtiva(p)" class="prod-flag flag-promo">
                  -{{ p.promocao_desconto }}%
                </span>
                <span class="prod-status" :class="'status-' + (p.ativo === false ? 'pausado' : 'ativo')">
                  {{ statusLabel(p.ativo) }}
                </span>
              </div>
              <div class="prod-body">

                <span  v-if="!p.ativo">
                  <button style="width: 100%; height: 30px; font-size: 0.9rem; background-color: #ff8049; color: #fff; font-family: 'Poppins';
                  border-radius: 5px;  margin-bottom: 10px;" @click="askReativar(p)">
                    Reativar produto
                  </button>
                </span>
                <div class="prod-cat">
                  <span style="font-size: 1.2rem;" class="material-symbols-outlined">{{ categoriaIcon(p.categoria) }}</span>
                  {{ categoriaLabel(p.categoria) }}
                </div>
                <div class="prod-name" :title="p.nome">{{ p.nome }}</div>
                <div class="prod-price-row">
                  <template v-if="isPromoAtiva(p)">
                    <span class="prod-price-old">{{ formatPrice(p.preco) }}</span>
                    <span class="prod-price-new">{{ formatPrice(precoComDesconto(p)) }}</span>
                  </template>
                  <template v-else>
                    <span class="prod-price-new">{{ formatPrice(p.preco) }}</span>
                  </template>
                </div>
                <div class="prod-tags">
                  <span class="prod-tipo-tag">{{ tipoLabel(p.tipo) }}</span>
                  <span v-if="p.codigo_barra" class="prod-ean">EAN {{ p.codigo_barra }}</span>
                </div>

                <!-- ESTATÍSTICAS: avaliação (estrelas), curtidas, compartilhamentos, visualizações -->
                <div class="prod-stats" style="margin-top: 15px;">
                  <div class="prod-rating">
                    <span
                        v-for="(s, i) in starArray(Number(p.media || 0))"
                        :key="i"
                        class="material-symbols-outlined star-ic"
                        :class="'star-' + s"
                        >
                        {{ s === 'half' ? 'star_half' : 'star' }}
                    </span>
                    <span class="prod-rating-count">({{ formatCount(statValue(p, 'avaliacoes')) }})</span>
                  </div>
                  <div class="prod-metrics" style="margin-top: 15px; display: flex; justify-content: space-between; width: 60%;">
                    <span class="metric metric-like" title="Curtidas" style="display: flex; flex-direction: column; align-items: center; gap: 5px;">
                      <span class="material-symbols-outlined">favorite</span>{{ formatCount(statValue(p, 'curtidas')) }}
                    </span>
                    <span class="metric metric-share" title="Compartilhamentos" style="display: flex; flex-direction: column; align-items: center; gap: 5px;" >
                      <span class="material-symbols-outlined">share</span>{{ formatCount(statValue(p, 'compartilhamentos')) }}
                    </span>
                    <span class="metric metric-view" title="Visualizações" style="display: flex; flex-direction: column; align-items: center; gap: 5px;" >
                      <span class="material-symbols-outlined">visibility</span>{{ formatCount(statValue(p, 'visualizacoes')) }}
                    </span>
                  </div>
                </div>
              </div>

              <div style="padding: 10px;" v-if="p.ativo">
                <button style="width: 100%; height: 30px; font-size: 0.9rem; background-color: #938A82; color: #fff; font-family: 'Poppins';
                    border-radius: 5px;  margin-bottom: 10px;" @click="modalEnviarProd(p)">
                      Enviar como lançamento
                </button>
              </div>

              <div class="prod-actions">
                <button class="picon" title="Visualizar" @click="viewProduct(p)">
                  <span class="material-symbols-outlined">visibility</span>
                </button>
                <button class="picon picon-edit" title="Editar" @click="editProduct(p)">
                  <span class="material-symbols-outlined">edit</span>
                </button>
                <button class="picon picon-danger" title="Excluir" @click="askDelete(p)">
                  <span class="material-symbols-outlined">delete</span>
                </button>
              </div>
            </div>

            
          </div>

          <!-- PAGINAÇÃO -->
          <Paginator
            v-if="!loadingList && pagination.total > filters.limit"
            :rows="filters.limit"
            :totalRecords="pagination.total"
            :first="(pagination.page - 1) * filters.limit"
            class="mvt-paginator"
            @page="onPageChange"
          />
        </template>

        <!-- ══════════════════════════════════════════════════════ -->
        <!-- ═════════════════  WIZARD DE CADASTRO  ═════════════════ -->
        <!-- ══════════════════════════════════════════════════════ -->
        <template v-else>
          <div class="wizard-card">

            <!-- STEP INDICATOR -->
            <div class="step-indicator">
              <template v-for="(s, idx) in steps" :key="s.n">
                <div
                  class="step-dot-wrap"
                  :class="{ done: currentStep > s.n, active: currentStep === s.n, clickable: s.n <= maxStepReached }"
                  @click="goToStep(s.n)"
                >
                  <div class="step-dot">
                    <span v-if="currentStep > s.n" class="material-symbols-outlined">check</span>
                    <span v-else class="material-symbols-outlined">{{ s.icon }}</span>
                  </div>
                  <span class="step-label">{{ s.label }}</span>
                </div>
                <div v-if="idx < steps.length - 1" class="step-line" :class="{ done: currentStep > s.n }"></div>
              </template>
            </div>

            <!-- ═══ STEP 1 — FOTOS ═══ -->
            <div v-if="currentStep === 1" class="step-body">
              <h2 class="step-title" style="font-size: 1.2rem;">Fotos do produto</h2>
              <p class="step-desc" style="font-size: 0.9rem;">Fotos nítidas aumentam em até 3x a chance de venda. A primeira foto é a capa do seu anúncio.</p>

              <div class="photo-grid">
                <label
                  class="photo-slot photo-main"
                  :class="{ filled: !!entrada.foto_capa, 'has-error': errors.foto_capa, uploading: uploadingPhoto.foto_capa }"
                >
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    hidden
                    :disabled="uploadingPhoto.foto_capa"
                    @change="onFileChange($event, 'foto_capa')"
                  />
                  <template v-if="entrada.foto_capa">
                    <img :src="entrada.foto_capa" alt="Foto de capa" />
                    <span class="photo-badge">CAPA</span>
                    <span v-if="uploadingPhoto.foto_capa" class="photo-uploading-overlay">
                      <span class="btn-spinner"></span>
                    </span>
                    <span v-else class="photo-remove" @click.prevent="removePhoto('foto_capa')">
                      <span class="material-symbols-outlined">close</span>
                    </span>
                  </template>
                  <template v-else>
                    <span class="material-symbols-outlined">add_photo_alternate</span>
                    <span class="photo-slot-label">Foto de capa</span>
                    <span class="photo-slot-sub">Obrigatória</span>
                  </template>
                </label>

                <label
                  v-for="f in ['foto_1', 'foto_2', 'foto_3']"
                  :key="f"
                  class="photo-slot"
                  :class="{ filled: !!entrada[f], uploading: uploadingPhoto[f] }"
                >
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    hidden
                    :disabled="uploadingPhoto[f]"
                    @change="onFileChange($event, f)"
                  />
                  <template v-if="entrada[f]">
                    <img :src="entrada[f]" alt="Foto adicional" />
                    <span v-if="uploadingPhoto[f]" class="photo-uploading-overlay">
                      <span class="btn-spinner"></span>
                    </span>
                    <span v-else class="photo-remove" @click.prevent="removePhoto(f)">
                      <span class="material-symbols-outlined">close</span>
                    </span>
                  </template>
                  <template v-else>
                    <span class="material-symbols-outlined">add_photo_alternate</span>
                    <span class="photo-slot-label">Adicional</span>
                  </template>
                </label>
              </div>
              <span v-if="errors.foto_capa" class="field-error">{{ errors.foto_capa }}</span>
            </div>

            <!-- ═══ STEP 2 — INFORMAÇÕES ═══ -->
            <div v-if="currentStep === 2" class="step-body">
              <h2 class="step-title" style="font-size: 1.1rem;">Informações do produto</h2>
              <p class="step-desc" style="font-size: 0.9rem;">Capriche na descrição: ela é o principal fator de decisão de compra do cliente.</p>

              <div class="form-grid">
                <div class="form-field span-2">
                  <label style="font-size: 0.9rem;" >Nome do produto <span class="req">*</span></label>
                  <input
                    v-model="entrada.nome"
                    type="text"
                    style="font-size: 0.9rem;"
                    maxlength="120"
                    placeholder="Ex: Shampoo Anticaspa 400ml"
                    :class="{ 'has-error': errors.nome }"
                  />
                  <div class="field-footer">
                    <span v-if="errors.nome" class="field-error">{{ errors.nome }}</span>
                    <span class="field-count">{{ (entrada.nome || '').length }}/120</span>
                  </div>
                </div>

                <div class="form-field">
                  <label style="font-size: 0.9rem;">Código de barras (EAN)</label>
                  <input
                    v-model="entrada.codigo_barra"
                    type="text"
                    inputmode="numeric"
                    style="font-size: 0.9rem;"
                    maxlength="14"
                    placeholder="Opcional"
                  />
                </div>

                <div class="form-field">
                  <label style="font-size: 0.9rem;">Fabricante <span class="req">*</span></label>
                  <input
                    v-model="entrada.fornecedor"
                    type="text"
                    style="font-size: 0.9rem;"
                    placeholder="Ex: Pampers, Tio Nacho, etc..."
                    :class="{ 'has-error': errors.fornecedor }"
                  />
                  <span v-if="errors.fornecedor" class="field-error">{{ errors.fornecedor }}</span>
                </div>

                <div class="form-field">
                  <label style="font-size: 0.9rem;">Categoria <span class="req">*</span></label>
                  <select v-model="entrada.categoria" style="font-size: 0.9rem;" :class="{ 'has-error': errors.categoria }">
                    <option  :value="null" disabled>Selecione a categoria</option>
                    <option v-for="c in categorias" :key="c.value" :value="c.value" style="font-size: 0.9rem;">{{ c.label }}</option>
                  </select>
                  <span v-if="errors.categoria" class="field-error">{{ errors.categoria }}</span>
                </div>

                <div class="form-field">
                  <label style="font-size: 0.9rem;">Tipo / unidade de venda <span class="req">*</span></label>
                  <select style="font-size: 0.9rem;" v-model="entrada.tipo" :class="{ 'has-error': errors.tipo }">
                    <option :value="null" disabled>Selecione o tipo</option>
                    <option v-for="t in tiposProduto" :key="t.value" :value="t.value">{{ t.label }}</option>
                  </select>
                  <span v-if="errors.tipo" class="field-error">{{ errors.tipo }}</span>
                </div>

                <div class="form-field span-2">
                  <label style="font-size: 0.9rem;">Descrição <span class="req">*</span></label>
                  <textarea
                    v-model="entrada.descricao"
                    style="font-size: 0.9rem;"
                    rows="5"
                    maxlength="1000"
                    placeholder="Descreva características, benefícios, modo de uso, composição..."
                    :class="{ 'has-error': errors.descricao }"
                  ></textarea>
                  <div class="field-footer">
                    <span v-if="errors.descricao" class="field-error">{{ errors.descricao }}</span>
                    <span class="field-count">{{ (entrada.descricao || '').length }}/1000</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- ═══ STEP 3 — PREÇO E PROMOÇÃO ═══ -->
            <div v-if="currentStep === 3" class="step-body">
              <h2 class="step-title" style="font-size: 1.1rem;">Preço e promoção</h2>
              <p class="step-desc" style="font-size: 0.9rem;">Defina o valor de venda e, se quiser, uma promoção por tempo limitado.</p>

              <div class="form-grid">
                <div class="form-field">
                  <label style="font-size: 0.9rem;">Preço de venda <span class="req">*</span></label>
                  <div class="price-input" :class="{ 'has-error': errors.preco }">
                    <span>R$</span>
                    <input style="font-size: 0.9rem;" v-model.number="entrada.preco" type="number" min="0" step="0.01" placeholder="0,00" />
                  </div>
                  <span v-if="errors.preco" class="field-error">{{ errors.preco }}</span>
                </div>
              </div>

              <div class="promo-toggle-box">
                <div class="promo-toggle-info">
                  <span class="material-symbols-outlined">local_offer</span>
                  <div>
                    <div class="promo-toggle-title" style="font-size: 0.9rem;">Ativar promoção com desconto</div>
                    <div class="promo-toggle-sub" style="font-size: 0.8rem;">Produtos em promoção ganham destaque na busca do catálogo</div>
                  </div>
                </div>
                <button
                  class="switch"
                  :class="{ on: promoAtiva }"
                  @click="togglePromo"
                  type="button"
                  role="switch"
                  :aria-checked="promoAtiva"
                >
                  <span class="switch-knob"></span>
                </button>
              </div>

              <div v-if="promoAtiva" class="promo-fields">
                <div class="form-grid">
                  <div class="form-field">
                    <label style="font-size: 0.9rem;">Desconto (%) <span class="req">*</span></label>
                    <div class="price-input" :class="{ 'has-error': errors.promocao_desconto }">
                      <input style="font-size: 0.9rem;" v-model.number="entrada.promocao_desconto" type="number" min="1" max="89" step="1" placeholder="Ex: 15" />
                      <span>%</span>
                    </div>
                    <span v-if="errors.promocao_desconto" class="field-error">{{ errors.promocao_desconto }}</span>
                  </div>
                  <div class="form-field">
                    <label style="font-size: 0.9rem;">Início da promoção <span class="req">*</span></label>
                      <div class="input-date-wrapper" style="width: 100%;">
                      <Calendar
                        v-model="entrada.desconto_inicio"
                        showTime
                        hourFormat="24"
                        dateFormat="dd/mm/yy"
                        placeholder="Selecione data e hora"
                        class="w-full prime-calendar"
                        inputClass="form-input poppins-regular input-date w-full"
                      />
                    </div>
                    <span v-if="errors.desconto_inicio" class="field-error">{{ errors.desconto_inicio }}</span>
                  </div>
                  <div class="form-field">
                    <label style="font-size: 0.9rem;" >Fim da promoção <span class="req">*</span></label>
                    <div class="input-date-wrapper">
                      <Calendar
                        v-model="entrada.desconto_fim"
                        showTime
                        hourFormat="24"
                        dateFormat="dd/mm/yy"
                        placeholder="Selecione data e hora"
                        class="w-full prime-calendar"
                        inputClass="form-input poppins-regular input-date w-full"
                      />
                    </div>
                    <span v-if="errors.desconto_fim" class="field-error">{{ errors.desconto_fim }}</span>
                  </div>
                </div>

                <div v-if="entrada.preco && entrada.promocao_desconto" class="promo-preview">
                  <span class="material-symbols-outlined">sell</span>
                  Preço com desconto:
                  <strong>{{ formatPrice(precoFinalCalculado) }}</strong>
                  <span class="promo-preview-old">{{ formatPrice(entrada.preco) }}</span>
                </div>
              </div>
            </div>

            <!-- ═══ STEP 4 — DESTAQUE E REVISÃO ═══ -->
            <div v-if="currentStep === 4" class="step-body">
              <h2 class="step-title" style="font-size: 1.1rem;">Anúncio e revisão</h2>
              <p class="step-desc" style="font-size: 0.9rem;">Revise seu anúncio antes de publicar. Assim ele aparecerá para os clientes.</p>

              <div class="ads-box">
                <div class="ads-box-info">
                  <span class="material-symbols-outlined">rocket_launch</span>
                  <div>
                    <div class="promo-toggle-title" style="font-size: 1rem;">Destacar este produto</div>
                    <div class="promo-toggle-sub" style="font-size: 0.8rem;">Anúncios em destaque aparecem no topo da vitrine e nas buscas de categoria</div>
                  </div>
                </div>
                <button
                  class="switch"
                  :class="{ on: entrada.destaque }"
                  @click="entrada.destaque = !entrada.destaque"
                  type="button"
                  role="switch"
                  :aria-checked="entrada.destaque"
                >
                  <span class="switch-knob"></span>
                </button>
              </div>

              <div class="review-layout">
                <div class="review-preview">
                  <div class="review-preview-label">
                    <span class="material-symbols-outlined">visibility</span>
                    Como vai aparecer no catálogo
                  </div>
                  <div class="prod-card preview-card">
                    <div class="prod-cover">
                      <img v-if="entrada.foto_capa" :src="entrada.foto_capa" alt="preview" />
                      <div v-else class="prod-cover-empty"><span class="material-symbols-outlined">image</span></div>
                      <span v-if="entrada.destaque" class="prod-flag flag-destaque">
                        <span class="material-symbols-outlined">bolt</span> Destaque
                      </span>
                      <span v-if="promoAtiva && entrada.promocao_desconto" class="prod-flag flag-promo">
                        -{{ entrada.promocao_desconto }}%
                      </span>
                    </div>
                    <div class="prod-body">
                      <div class="prod-cat">
                        <span class="material-symbols-outlined">{{ categoriaIcon(entrada.categoria) }}</span>
                        {{ categoriaLabel(entrada.categoria) || 'Categoria' }}
                      </div>
                      <div class="prod-name">{{ entrada.nome || 'Nome do produto' }}</div>
                      <div class="prod-price-row">
                        <template v-if="promoAtiva && entrada.promocao_desconto">
                          <span class="prod-price-old">{{ formatPrice(entrada.preco) }}</span>
                          <span class="prod-price-new">{{ formatPrice(precoFinalCalculado) }}</span>
                        </template>
                        <template v-else>
                          <span class="prod-price-new">{{ formatPrice(entrada.preco) }}</span>
                        </template>
                      </div>
                      <div class="prod-tags">
                        <span class="prod-tipo-tag">{{ tipoLabel(entrada.tipo) || 'Tipo' }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="review-summary">
                  <div class="review-row">
                    <span class="material-symbols-outlined">description</span>
                    <div>
                      <div class="review-row-label" style="font-size: 0.8rem;">Descrição</div>
                      <div class="review-row-value">{{ entrada.descricao || '—' }}</div>
                    </div>
                  </div>
                  <div class="review-row">
                    <span class="material-symbols-outlined">local_shipping</span>
                    <div>
                      <div class="review-row-label" style="font-size: 0.8rem;">Fabricante</div>
                      <div class="review-row-value">{{ entrada.fornecedor || '—' }}</div>
                    </div>
                  </div>
                  <div class="review-row">
                    <span class="material-symbols-outlined">barcode</span>
                    <div>
                      <div class="review-row-label" style="font-size: 0.8rem;">Código de barras</div>
                      <div class="review-row-value">{{ entrada.codigo_barra || 'Não informado' }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- NAVEGAÇÃO DO WIZARD -->
            <div class="wizard-nav">
              <button v-if="currentStep > 1" class="tbtn" @click="prevStep">
                <span class="material-symbols-outlined">arrow_back</span> Voltar
              </button>
              <button v-else class="tbtn" @click="goToList">Cancelar</button>

              <button v-if="currentStep < totalSteps" class="tbtn primary" @click="nextStep">
                Avançar <span class="material-symbols-outlined">arrow_forward</span>
              </button>
              <button v-else class="tbtn primary" :disabled="loadingSubmit" @click="submitProduct">
                <span v-if="loadingSubmit" class="btn-spinner"></span>
                <span v-else class="material-symbols-outlined">{{ editingId ? 'save' : 'rocket_launch' }}</span>
                {{ loadingSubmit ? 'Publicando...' : (editingId ? 'Salvar alterações' : 'Publicar anúncio') }}
              </button>
            </div>
          </div>
        </template>

        <!-- ══════════════════ MODAL DE DETALHES ══════════════════ -->
        <Dialog v-model:visible="showDetail" modal :dismissableMask="true" class="mvt-dialog" header="Detalhes do produto">
          <div v-if="detailProduto" class="detail-body">
            <div class="detail-gallery">
              <div class="detail-main-wrap" @click="openLightbox(galleryPhotos, galleryPhotos.indexOf(activeGalleryPhoto))">
                <img :src="activeGalleryPhoto || placeholderImg" alt="Foto do produto" class="detail-main-img" />
                <span class="detail-zoom-hint">

                </span>
              </div>
              <div class="detail-thumbs">
                <div
                  v-for="(foto, i) in galleryPhotos"
                  :key="i"
                  class="detail-thumb"
                  :class="{ active: activeGalleryPhoto === foto }"
                  @click="activeGalleryPhoto = foto"
                >
                  <img :src="foto" alt="thumb" />
                </div>
              </div>
            </div>
            <div class="detail-info">
              <div class="prod-cat">
                <span class="material-symbols-outlined">{{ categoriaIcon(detailProduto.categoria) }}</span>
                {{ categoriaLabel(detailProduto.categoria) }}
              </div>
              <h2 class="detail-name">{{ detailProduto.nome }}</h2>
              <div class="prod-price-row" style="margin-bottom:14px">
                <template v-if="isPromoAtiva(detailProduto)">
                  <span class="prod-price-old">{{ formatPrice(detailProduto.preco) }}</span>
                  <span class="prod-price-new" style="font-size:20px">{{ formatPrice(precoComDesconto(detailProduto)) }}</span>
                  <span class="prod-flag flag-promo" style="position:static">-{{ detailProduto.promocao_desconto }}%</span>
                </template>
                <template v-else>
                  <span class="prod-price-new" style="font-size:20px">{{ formatPrice(detailProduto.preco) }}</span>
                </template>
              </div>

              <!-- ESTATÍSTICAS COLORIDAS: avaliação, curtidas, compartilhamentos, visualizações -->
              <div class="detail-stats">
                <div class="stat-pill pill-rating">
                  <span class="material-symbols-outlined">star</span>
                  <div>
                    <strong>{{ (Number(detailProduto.media) || 0).toFixed(1) }}</strong>
                    <small>{{ formatCount(statValue(detailProduto, 'avaliacoes')) }} avaliações</small>
                  </div>
                </div>
                <div class="stat-pill pill-like">
                  <span class="material-symbols-outlined">favorite</span>
                  <div>
                    <strong>{{ formatCount(statValue(detailProduto, 'curtidas')) }}</strong>
                    <small>curtidas</small>
                  </div>
                </div>
                <div class="stat-pill pill-share">
                  <span class="material-symbols-outlined">share</span>
                  <div>
                    <strong>{{ formatCount(statValue(detailProduto, 'compartilhamentos')) }}</strong>
                    <small>compart.</small>
                  </div>
                </div>
                <div class="stat-pill pill-view">
                  <span class="material-symbols-outlined">visibility</span>
                  <div>
                    <strong>{{ formatCount(statValue(detailProduto, 'visualizacoes')) }}</strong>
                    <small>visualiz.</small>
                  </div>
                </div>
              </div>

              <p class="detail-desc">{{ detailProduto.descricao }}</p>
              <div class="detail-meta-grid">
                <div class="detail-meta-item">
                  <span class="detail-meta-label">Fabricante</span>
                  <span class="detail-meta-value">{{ detailProduto.fornecedor || '—' }}</span>
                </div>
                <div class="detail-meta-item">
                  <span class="detail-meta-label">Tipo</span>
                  <span class="detail-meta-value">{{ tipoLabel(detailProduto.tipo) }}</span>
                </div>
                <div class="detail-meta-item">
                  <span class="detail-meta-label">Código de barras</span>
                  <span class="detail-meta-value">{{ detailProduto.codigo_barra || 'Não informado' }}</span>
                </div>
                <div class="detail-meta-item">
                  <span class="detail-meta-label">Status</span>
                  <span class="detail-meta-value">{{ statusLabel(detailProduto.status) }}</span>
                </div>
                <div v-if="isPromoAtiva(detailProduto)" class="detail-meta-item">
                  <span class="detail-meta-label">Promoção válida</span>
                  <span class="detail-meta-value">{{ formatDate(detailProduto.desconto_inicio) }} até {{ formatDate(detailProduto.desconto_fim) }}</span>
                </div>
                <div class="detail-meta-item">
                  <span class="detail-meta-label">Destaque</span>
                  <span class="detail-meta-value">{{ detailProduto.destaque ? 'Sim' : 'Não' }}</span>
                </div>
              </div>
              <div class="detail-actions">
                <button class="tbtn primary" @click="editProduct(detailProduto); showDetail = false">
                  <span class="material-symbols-outlined">edit</span> Editar produto
                </button>
                <button class="tbtn" @click="showDetail = false">Fechar</button>
              </div>
            </div>
          </div>
        </Dialog>

        <!-- ══════════════════ CONFIRMAÇÃO DE EXCLUSÃO ══════════════════ -->
        <Dialog v-model:visible="showDeleteConfirm" modal :dismissableMask="true" class="mvt-dialog-sm" header="Desativar produto">
          <div class="confirm-body">
            <span class="material-symbols-outlined confirm-icon">warning</span>
            <p style="font-size: 0.9rem;">Tem certeza que deseja desativar <strong>{{ deleteTarget && deleteTarget.nome }}</strong>? Seu produto não será mais visível para varejistas...</p>
          </div>
          <div class="detail-actions">
            <button class="tbtn tbtn-danger" :disabled="deletingId" @click="deleteProduct">
              <span v-if="deletingId" class="btn-spinner"></span>
              {{ deletingId ? 'Desativando...' : 'Desativar' }}
            </button>
            <button class="tbtn"  style="width: 50%;" @click="showDeleteConfirm = false">Cancelar</button>
          </div>
        </Dialog>


        <Dialog 
          v-model:visible="showDeleteReativar" 
          modal 
          :dismissableMask="true" 
          class="mvt-dialog-sm" 
          header="Reativar produto?"
        >
          <div class="confirm-body">
            <span class="material-symbols-outlined confirm-icon">warning</span>

            <p style="font-size: 0.9rem;">
              Deseja reativar o produto? Seu produto ficará visível novamente para compras, etc...
            </p>
          </div>

          <div class="detail-actions">
            <button 
              class="tbtn tbtn-reativ"
              style="width: 50%; background-color: #ff8049; color: #FFF; border: none; font-size: 0.9rem;" 
              :disabled="reativandoID" 
              @click="reativarProduto()"
            >
              <span v-if="reativandoID" class="btn-spinner"></span>
              {{ reativandoID ? 'Reativando...' : 'Reativar' }}
            </button>

            <button 
              class="tbtn" 
              style="width: 50%; font-size: 0.9rem;" 
              @click="showDeleteReativar = false"
            >
              Cancelar
            </button>
          </div>
        </Dialog>

        <ModalSelecionarLoja 
          v-model:isOpen="showEnviarLoja"
          :idProdutoVendedor="targetEnviarLoja?.id_produto_vendedor"
          :produtoNome="targetEnviarLoja?.nome"
          @enviado="onProdutoEnviado" 
        />

        <ModalLojaProduto
          v-model:isOpen="showOfertas" 
          :idVendedor="idVendedorAtivo"
        />

        <!-- ══════════════════ LIGHTBOX (visualização em tela cheia) ══════════════════ -->
        <Teleport to="body">
          <div v-if="showLightbox" class="lightbox-overlay" @click.self="closeLightbox">
            <button class="lightbox-close" title="Fechar" @click="closeLightbox">
              <span class="material-symbols-outlined">close</span>
            </button>
            <button
              v-if="lightboxPhotos.length > 1"
              class="lightbox-nav lightbox-prev"
              title="Anterior"
              @click.stop="lightboxPrev"
            >
              <span class="material-symbols-outlined">chevron_left</span>
            </button>
            <img :src="lightboxSrc" alt="Visualização ampliada do produto" class="lightbox-img" />
            <button
              v-if="lightboxPhotos.length > 1"
              class="lightbox-nav lightbox-next"
              title="Próxima"
              @click.stop="lightboxNext"
            >
              <span class="material-symbols-outlined">chevron_right</span>
            </button>
            <div v-if="lightboxPhotos.length > 1" class="lightbox-counter">
              {{ lightboxIndex + 1 }} / {{ lightboxPhotos.length }}
            </div>
          </div>
        </Teleport>

        <MarvizTrendsWelcomeModal />

      </div>
      

      <div style="height: 120px;" ></div>
    </ion-content>
  </ion-page>
</template>

<script>
import { IonPage, IonContent } from '@ionic/vue';
import Dialog from 'primevue/dialog';
import Paginator from 'primevue/paginator';
import { useAuthStore } from '@/stores/auth';
import exibeErro from '@/utils/ExibeErro';
import { toastService } from '@/services/toast';
import { api } from '@/services/api';
import Calendar from 'primevue/calendar'
import ModalSelecionarLoja from '@/components/modalSelecionarLoja.vue';
import ModalLojaProduto from '@/components/modalLojaProduto.vue';
import MarvizTrendsWelcomeModal from '@/components/MarvizTrendsWelcomeModal.vue';
import BannerSiteVendedor from '@/components/BannerSiteVendedor.vue';

// Endpoint único conforme especificação do backend (CRUD por método HTTP + tipo_op)
const API_ENDPOINT = '/mvpu/cotacao/operacoesProduto/';

// Rota de upload de fotos do produto — mesmo padrão da rota de foto de perfil
// (multipart/form-data, campo "foto", resposta em response.data.data.foto_url).
// AJUSTE este valor caso o backend exponha uma rota com outro nome/caminho.
const UPLOAD_FOTO_ENDPOINT = '/mvpu/cotacao/enviarFotoProduto';

export default {
  name: 'CatalogoProdutosMarvizTrends',
  components: { 
    IonPage,
     IonContent,
     Dialog,
     Paginator,
     Calendar,
     ModalSelecionarLoja,
     ModalLojaProduto,
     MarvizTrendsWelcomeModal,
     BannerSiteVendedor
    },

  props: {
    // Prop mantida apenas como fallback/override manual (ex: uso em telas de admin
    // visualizando o catálogo de outro vendedor). Em uso normal, o id do vendedor
    // logado é obtido automaticamente via useAuthStore, igual ao padrão do Login.vue.
    idVendedor: { type: [String, Number], default: null },
  },

  data() {
    return {
      view: 'lista', // 'lista' | 'form'

      // ── listagem / paginação ──
      produtos: [],
      loadingList: false,
      pagination: { page: 1, total: 0 },
      filters: { search: '', status: 'todos', promo: false, limit: 12 },
      searchDebounce: null,

      statusOptions: [
        { label: 'Todos os status', value: 'todos' },
        { label: 'Ativos', value: 'ativo' },
        { label: 'Pausados', value: 'pausado' },
      ],

      // ── wizard ──
      currentStep: 1,
      maxStepReached: 1,
      totalSteps: 4,
      steps: [
        { n: 1, label: 'Fotos', icon: 'photo_camera' },
        { n: 2, label: 'Informações', icon: 'edit_note' },
        { n: 3, label: 'Preço', icon: 'sell' },
        { n: 4, label: 'Revisão', icon: 'rocket_launch' },
      ],
      editingId: null,
      loadingSubmit: false,
      promoAtiva: false,
      errors: {},

      reativandoID: false,
      showDeleteReativar: false,
      targetAtualizar   : null,

      showEnviarLoja   : false,
      targetEnviarLoja : null,

      showOfertas: false,

      entrada: {
        foto_capa: null,
        foto_1: null,
        foto_2: null,
        foto_3: null,
        nome: '',
        codigo_barra: '',
        descricao: '',
        preco: null,
        promocao_desconto: null,
        desconto_inicio: null,
        desconto_fim: null,
        fornecedor: '',
        categoria: null,
        tipo: null,
        destaque: false,
        ativo: true,
      },

      // Indica, por slot de foto, se o upload real (para a rota de upload) está em andamento.
      // Enquanto true, entrada[field] contém uma preview local (blob:) e não deve ser enviada ao backend.
      uploadingPhoto: { foto_capa: false, foto_1: false, foto_2: false, foto_3: false },

      // ── modais ──
      showDetail: false,
      detailProduto: null,
      activeGalleryPhoto: null,
      showDeleteConfirm: false,
      deleteTarget: null,
      deletingId: null,



      // ── lightbox (visualização em tela cheia, com navegação entre fotos) ──
      showLightbox: false,
      lightboxPhotos: [],
      lightboxIndex: 0,

      placeholderImg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="100%" height="100%" fill="%23f1f3f5"/></svg>',

      // Mapa completo de categorias — de farmacêuticos a perfumaria e mercado
      categorias: [
        { value: 'alimentos_bebidas', label: 'Alimentos e Bebidas', icon: 'restaurant' },
        { value: 'bebidas_alcoolicas', label: 'Bebidas Alcoólicas', icon: 'liquor' },
        { value: 'mercearia', label: 'Mercearia', icon: 'shopping_basket' },
        { value: 'hortifruti', label: 'Hortifruti', icon: 'nutrition' },
        { value: 'acougue_peixaria', label: 'Açougue e Peixaria', icon: 'kebab_dining' },
        { value: 'padaria_confeitaria', label: 'Padaria e Confeitaria', icon: 'bakery_dining' },
        { value: 'laticinios_frios', label: 'Laticínios e Frios', icon: 'egg' },
        { value: 'congelados', label: 'Congelados', icon: 'ac_unit' },
        { value: 'farmacia_medicamentos', label: 'Farmácia e Medicamentos', icon: 'medication' },
        { value: 'vitaminas_suplementos', label: 'Vitaminas e Suplementos', icon: 'vaccines' },
        { value: 'primeiros_socorros', label: 'Primeiros Socorros', icon: 'healing' },
        { value: 'perfumaria_cosmeticos', label: 'Perfumaria e Cosméticos', icon: 'spa' },
        { value: 'higiene_pessoal', label: 'Higiene Pessoal', icon: 'soap' },
        { value: 'maquiagem', label: 'Maquiagem', icon: 'brush' },
        { value: 'cuidados_cabelo', label: 'Cuidados com o Cabelo', icon: 'content_cut' },
        { value: 'bebes_infantil', label: 'Bebês e Infantil', icon: 'child_care' },
        { value: 'brinquedos', label: 'Brinquedos', icon: 'toys' },
        { value: 'limpeza', label: 'Produtos de Limpeza', icon: 'cleaning_services' },
        { value: 'utilidades_domesticas', label: 'Utilidades Domésticas', icon: 'kitchen' },
        { value: 'papelaria_escritorio', label: 'Papelaria e Escritório', icon: 'edit_note' },
        { value: 'eletronicos_informatica', label: 'Eletrônicos e Informática', icon: 'devices' },
        { value: 'eletrodomesticos', label: 'Eletrodomésticos', icon: 'blender' },
        { value: 'celulares_acessorios', label: 'Celulares e Acessórios', icon: 'smartphone' },
        { value: 'moda_vestuario', label: 'Moda e Vestuário', icon: 'checkroom' },
        { value: 'calcados', label: 'Calçados', icon: 'shopping_bag' },
        { value: 'esporte_lazer', label: 'Esporte e Lazer', icon: 'sports_soccer' },
        { value: 'fitness_suplementacao', label: 'Fitness e Suplementação Esportiva', icon: 'fitness_center' },
        { value: 'automotivo', label: 'Automotivo', icon: 'directions_car' },
        { value: 'ferramentas_construcao', label: 'Ferramentas e Construção', icon: 'construction' },
        { value: 'jardim_piscina', label: 'Jardim e Piscina', icon: 'yard' },
        { value: 'pet_shop', label: 'Pet Shop', icon: 'pets' },
        { value: 'livros_papelaria_escolar', label: 'Livros e Papelaria Escolar', icon: 'menu_book' },
        { value: 'instrumentos_musicais', label: 'Instrumentos Musicais', icon: 'piano' },
        { value: 'moveis_decoracao', label: 'Móveis e Decoração', icon: 'weekend' },
        { value: 'cama_mesa_banho', label: 'Cama, Mesa e Banho', icon: 'bed' },
        { value: 'joias_relogios', label: 'Joias e Relógios', icon: 'diamond' },
        { value: 'oticas', label: 'Óticas', icon: 'visibility' },
      ],

      tiposProduto: [
        { value: 'unidade', label: 'Unidade' },
        { value: 'kg', label: 'Quilograma (Kg)' },
        { value: 'litro', label: 'Litro' },
        { value: 'caixa', label: 'Caixa' },
        { value: 'pacote', label: 'Pacote' },
        { value: 'fardo', label: 'Fardo' },
        { value: 'duzia', label: 'Dúzia' },
        { value: 'par', label: 'Par' },
      ],
    };
  },

  computed: {
    lightboxSrc() {
      return this.lightboxPhotos[this.lightboxIndex] || null;
    },
    galleryPhotos() {
      if (!this.detailProduto) return [];
      // Atenção: o backend retorna a capa no nível raiz (foto_capa) e as fotos
      // secundárias aninhadas em "fotos" (fotos.foto_1/foto_2/foto_3).
      const fotos = this.detailProduto.fotos || {};
      return [
        this.detailProduto.foto_capa,
        fotos.foto_1,
        fotos.foto_2,
        fotos.foto_3,
      ].filter(Boolean);
    },
    precoFinalCalculado() {
      const preco = Number(this.entrada.preco) || 0;
      const desconto = Number(this.entrada.promocao_desconto) || 0;
      if (!preco || !desconto) return preco;
      return preco - (preco * desconto) / 100;
    },
    // Id do vendedor logado, obtido do useAuthStore (mesma store usada no Login.vue).
    // Mantém a prop idVendedor como fallback para não quebrar usos isolados/legados.
    // ATENÇÃO: ajuste "vendedor.id_vendedor" abaixo caso o campo tenha outro nome no seu authStore.
    idVendedorAtivo() {
      return (
        this.idVendedor ??
        this.authStore?.vendedor?.id_vendedor ??
        this.authStore?.usuario?.id_vendedor ??
        null
      );
    },
  },

  created() {
    // Segue o mesmo padrão do Login.vue: instancia do Pinia store para acessar
    // os dados do vendedor autenticado.
    this.authStore = useAuthStore();
  },

  mounted() {
    this.fetchProdutos(1);
  },

  beforeUnmount() {
    document.removeEventListener('keydown', this.onLightboxKeydown);
  },

  methods: {
    // ═══════════════════════ NAVEGAÇÃO ═══════════════════════
    goToList() {
      this.view = 'lista';
    },

    startNewProduct() {
      this.editingId = null;
      this.entrada = {
        foto_capa: null, foto_1: null, foto_2: null, foto_3: null,
        nome: '', codigo_barra: '', descricao: '',
        preco: null, promocao_desconto: null, desconto_inicio: null, desconto_fim: null,
        fornecedor: '', categoria: null, tipo: null, destaque: false, ativo: true,
      };
      this.uploadingPhoto = { foto_capa: false, foto_1: false, foto_2: false, foto_3: false };
      this._uploadTokens = {};
      this.promoAtiva = false;
      this.errors = {};
      this.currentStep = 1;
      this.maxStepReached = 1;
      this.view = 'form';
    },

    // ═══════════════════════ TOASTS ═══════════════════════
    // Substitui o array caseiro de toasts pelo serviço global do app (this.$toast),
    // exatamente como feito no Login.vue.
    notify(type, message) {
      const severityMap = { error: 'error', success: 'success', info: 'info' };
      const summaryMap = { error: 'Erro', success: 'Sucesso', info: 'Aviso' };
      this.$toast.add({
        severity: severityMap[type] || 'info',
        summary: summaryMap[type] || 'Aviso',
        detail: message,
        life: 3000,
      });
    },

    // ═══════════════════════ HELPERS DE EXIBIÇÃO ═══════════════════════
    categoriaLabel(value) {
      const c = this.categorias.find((c) => c.value === value);
      return c ? c.label : value;
    },
    categoriaIcon(value) {
      const c = this.categorias.find((c) => c.value === value);
      return c ? c.icon : 'category';
    },
    tipoLabel(value) {
      const t = this.tiposProduto.find((t) => t.value === value);
      return t ? t.label : value;
    },
    statusLabel(ativo) {
      return ativo === false ? 'Pausado' : 'Ativo';
    },
    formatPrice(v) {
      const n = Number(v) || 0;
      return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    },
    formatDate(v) {
      if (!v) return '—';
      const d = new Date(v.length === 10 ? v + 'T00:00:00' : v);
      if (isNaN(d.getTime())) return v;
      return d.toLocaleDateString('pt-BR');
    },
    isPromoAtiva(p) {
      if (!p || !p.promocao_desconto || Number(p.promocao_desconto) <= 0) return false;
      if (p.desconto_fim) {
        const fim = new Date(p.desconto_fim.length === 10 ? p.desconto_fim + 'T23:59:59' : p.desconto_fim);
        if (!isNaN(fim.getTime()) && fim < new Date()) return false;
      }
      return true;
    },
    precoComDesconto(p) {
      const preco = Number(p.preco) || 0;
      const desconto = Number(p.promocao_desconto) || 0;
      return preco - (preco * desconto) / 100;
    },

    // ═══════════════════════ ESTATÍSTICAS (curtidas, avaliações, compartilhamentos, visualizações) ═══════════════════════
    // "visualizacoes" ainda não vem do backend — usa 0 como fallback até o campo existir na API.
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

    // ═══════════════════════ LIGHTBOX (visualização em tela cheia) ═══════════════════════
    // Monta o array de fotos (capa + secundárias) de um produto da listagem para o lightbox.
    productPhotos(p) {
      if (!p) return [];
      const fotos = p.fotos || {};
      return [p.foto_capa, fotos.foto_1, fotos.foto_2, fotos.foto_3].filter(Boolean);
    },
    // Abre o lightbox com um array de fotos e o índice inicial (permite navegar com as setas).
    openLightbox(photos, index = 0) {
      const arr = (photos || []).filter(Boolean);
      if (!arr.length) return;
      this.lightboxPhotos = arr;
      this.lightboxIndex = index >= 0 && index < arr.length ? index : 0;
      this.showLightbox = true;
      document.addEventListener('keydown', this.onLightboxKeydown);
    },
    closeLightbox() {
      this.showLightbox = false;
      this.lightboxPhotos = [];
      this.lightboxIndex = 0;
      document.removeEventListener('keydown', this.onLightboxKeydown);
    },
    lightboxNext() {
      if (!this.lightboxPhotos.length) return;
      this.lightboxIndex = (this.lightboxIndex + 1) % this.lightboxPhotos.length;
    },
    lightboxPrev() {
      if (!this.lightboxPhotos.length) return;
      this.lightboxIndex = (this.lightboxIndex - 1 + this.lightboxPhotos.length) % this.lightboxPhotos.length;
    },
    onLightboxKeydown(e) {
      if (e.key === 'Escape') this.closeLightbox();
      else if (e.key === 'ArrowRight') this.lightboxNext();
      else if (e.key === 'ArrowLeft') this.lightboxPrev();
    },

    // ═══════════════════════ UPLOAD DE FOTOS ═══════════════════════
    // Mesmo padrão de consumo da rota de foto de perfil: FormData com o campo "foto",
    // POST via `api` (axios) e a URL pública fica em response.data.data.foto_url.
    // Diferença: aqui existem 4 slots (foto_capa, foto_1, foto_2, foto_3), então o
    // upload e o estado de carregamento são controlados individualmente por campo (field).
    async onFileChange(e, field) {
      const file = e.target.files && e.target.files[0];
      e.target.value = '';
      if (!file) return;

      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        this.notify('error', 'Formato de imagem inválido. Use JPEG, PNG ou WEBP.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.notify('error', 'A imagem deve ter no máximo 5MB.');
        return;
      }

      if (this.errors[field]) delete this.errors[field];

      // Token evita que uma resposta de upload atrasada sobrescreva uma seleção/remoção mais recente no mesmo slot
      this._uploadTokens = this._uploadTokens || {};
      const token = Symbol('upload');
      this._uploadTokens[field] = token;

      // Preview local instantânea enquanto o upload real acontece em segundo plano
      const previewUrl = URL.createObjectURL(file);
      this.entrada[field] = previewUrl;
      this.uploadingPhoto[field] = true;

      try {
        const fotoUrl = await this.uploadFotoProduto(file);
        if (this._uploadTokens[field] !== token) return; // este upload foi invalidado (removido/trocado nesse meio tempo)
        this.entrada[field] = fotoUrl;
      } catch (err) {
        if (this._uploadTokens[field] === token) {
          this.entrada[field] = null;
          exibeErro(err, this.$toast);
        }
      } finally {
        URL.revokeObjectURL(previewUrl);
        if (this._uploadTokens[field] === token) {
          this.uploadingPhoto[field] = false;
        }
      }
    },

    // Envia o arquivo para a rota de upload e retorna a URL pública da foto
    async uploadFotoProduto(file) {
      const formData = new FormData();
      formData.append('foto', file);
      const response = await api.post(UPLOAD_FOTO_ENDPOINT, formData);
      return response.data.data.foto_url;
    },

    removePhoto(field) {
      // Invalida qualquer upload em andamento para este slot antes de limpar
      this._uploadTokens = this._uploadTokens || {};
      this._uploadTokens[field] = Symbol('removed');
      this.entrada[field] = null;
      this.uploadingPhoto[field] = false;
    },

    // ═══════════════════════ PROMOÇÃO ═══════════════════════
    togglePromo() {
      this.promoAtiva = !this.promoAtiva;
      if (!this.promoAtiva) {
        this.entrada.promocao_desconto = null;
        this.entrada.desconto_inicio = null;
        this.entrada.desconto_fim = null;
        delete this.errors.promocao_desconto;
        delete this.errors.desconto_inicio;
        delete this.errors.desconto_fim;
      }
    },

    // ═══════════════════════ VALIDAÇÃO ═══════════════════════
    validateStep(step) {
      const errs = { ...this.errors };
      ['foto_capa', 'nome', 'descricao', 'categoria', 'tipo', 'fornecedor', 'preco', 'promocao_desconto', 'desconto_inicio', 'desconto_fim']
        .forEach((k) => delete errs[k]);

      if (step === 1) {
        if (!this.entrada.foto_capa) errs.foto_capa = 'Adicione a foto de capa do produto.';
      }
      if (step === 2) {
        if (!this.entrada.nome || !this.entrada.nome.trim()) errs.nome = 'Informe o nome do produto.';
        if (!this.entrada.descricao || !this.entrada.descricao.trim()) errs.descricao = 'Descreva o produto.';
        if (!this.entrada.categoria) errs.categoria = 'Selecione uma categoria.';
        if (!this.entrada.tipo) errs.tipo = 'Selecione o tipo de venda.';
        if (!this.entrada.fornecedor || !this.entrada.fornecedor.trim()) errs.fornecedor = 'Informe o fornecedor.';
      }
      if (step === 3) {
        if (!this.entrada.preco || Number(this.entrada.preco) <= 0) errs.preco = 'Informe um preço válido.';
        if (this.promoAtiva) {
          if (!this.entrada.promocao_desconto || Number(this.entrada.promocao_desconto) <= 0) {
            errs.promocao_desconto = 'Informe o percentual de desconto.';
          } else if (Number(this.entrada.promocao_desconto) >= 90) {
            errs.promocao_desconto = 'O desconto deve ser menor que 90%.';
          }
          if (!this.entrada.desconto_inicio) errs.desconto_inicio = 'Informe a data de início.';
          if (!this.entrada.desconto_fim) errs.desconto_fim = 'Informe a data de término.';
          if (this.entrada.desconto_inicio && this.entrada.desconto_fim &&
              this.entrada.desconto_fim.getTime() <= this.entrada.desconto_inicio.getTime()) {
            errs.desconto_fim = 'A data final deve ser depois da inicial.';
          }
        }
      }
      this.errors = errs;
      const relevant = { 1: ['foto_capa'], 2: ['nome', 'descricao', 'categoria', 'tipo', 'fornecedor'],
        3: ['preco', 'promocao_desconto', 'desconto_inicio', 'desconto_fim'] }[step] || [];
      return relevant.every((k) => !errs[k]);
    },

    nextStep() {
      if (this.validateStep(this.currentStep)) {
        if (this.currentStep < this.totalSteps) this.currentStep++;
        this.maxStepReached = Math.max(this.maxStepReached, this.currentStep);
      } else {
        this.notify('error', 'Verifique os campos destacados antes de continuar.');
      }
    },
    prevStep() {
      if (this.currentStep > 1) this.currentStep--;
    },
    goToStep(n) {
      if (n <= this.maxStepReached) {
        this.currentStep = n;
      }
    },

    // ═══════════════════════ API — REQUEST WRAPPER (axios) ═══════════════════════
    // Segue o mesmo padrão de integração usado no Login.vue: chamadas via `api`
    // (instância axios de '@/services/api'), sem uso de fetch nativo.
    async apiRequest(method, body, params) {
      const config = {};
      if (params) {
        config.params = Object.fromEntries(
          Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
        );
      }

      let response;
      switch (method) {
        case 'GET':
          response = await api.get(API_ENDPOINT, config);
          break;
        case 'POST':
          response = await api.post(API_ENDPOINT, body);
          break;
        case 'PUT':
          response = await api.put(API_ENDPOINT, body);
          break;
        case 'DELETE':
          response = await api.delete(API_ENDPOINT, { ...config, data: body });
          break;
        default:
          throw new Error('Método HTTP inválido.');
      }

      return response.data;
    },

    // ═══════════════════════ LISTAGEM (GET paginado) ═══════════════════════
    async fetchProdutos(page = 1) {
      this.loadingList = true;
      this.pagination.page = page;
      try {
        const data = await this.apiRequest('GET', null, {
          page,
          limit: this.filters.limit,
          search: this.filters.search || undefined,
          status: this.filters.status !== 'todos' ? this.filters.status : undefined,
          promo: this.filters.promo ? 1 : undefined,
        });

        // Estrutura real do backend: { COD, MSG, data: { produtos: [...], paginacao: {...} } }
        const payload = data.data || {};
        const paginacao = payload.paginacao || {};
        this.produtos = payload.produtos || [];

        this.produtos = this.produtos.map(produto => ({
          ...produto,
          desconto_inicio: produto.desconto_inicio 
            ? new Date(Number(produto.desconto_inicio)) 
            : null,

          desconto_fim: produto.desconto_fim 
            ? new Date(Number(produto.desconto_fim)) 
            : null
        }))

        this.pagination.total = Number(paginacao.total_registros ?? this.produtos.length) || 0;
        this.pagination.page = Number(paginacao.pagina_atual) || page;
        if (paginacao.itens_por_pagina) this.filters.limit = Number(paginacao.itens_por_pagina);
      } catch (err) {
        exibeErro(err, this.$toast);
        this.produtos = [];
        this.pagination.total = 0;
      } finally {
        this.loadingList = false;
      }
    },

    onPageChange(e) {
      this.fetchProdutos(e.page + 1);
    },

    onSearchInput() {
      clearTimeout(this.searchDebounce);
      this.searchDebounce = setTimeout(() => this.fetchProdutos(1), 400);
    },

    togglePromoFilter() {
      this.filters.promo = !this.filters.promo;
      this.fetchProdutos(1);
    },

    // ═══════════════════════ CRIAR / ATUALIZAR ═══════════════════════
    // Nunca envia uma preview local (blob:) ao backend — só a foto_url pública já enviada.
    sanitizeFotoPayload(value) {
      return typeof value === 'string' && value.startsWith('blob:') ? null : value;
    },
    buildPayload() {
      // Espelha a estrutura COMPLETA do produto conforme devolvida pelo GET:
      // capa no nível raiz + fotos secundárias aninhadas em "fotos".
      // Campos somente-leitura do backend (criado_em, atualizado_em, curtidas,
      // avaliacoes, compartilhamentos, media) não são reenviados.
      return {
        foto_capa: this.sanitizeFotoPayload(this.entrada.foto_capa),
        fotos: {
          foto_1: this.sanitizeFotoPayload(this.entrada.foto_1),
          foto_2: this.sanitizeFotoPayload(this.entrada.foto_2),
          foto_3: this.sanitizeFotoPayload(this.entrada.foto_3),
        },
        nome: this.entrada.nome.trim(),
        codigo_barra: this.entrada.codigo_barra ? this.entrada.codigo_barra.trim() : '',
        descricao: this.entrada.descricao.trim(),
        preco: Number(this.entrada.preco),
        promocao_desconto: this.promoAtiva ? Number(this.entrada.promocao_desconto) : null,
        desconto_inicio: this.promoAtiva ? this.entrada.desconto_inicio.getTime() : null,
        desconto_fim: this.promoAtiva ? this.entrada.desconto_fim.getTime() : null,
        fornecedor: this.entrada.fornecedor.trim(),
        categoria: this.entrada.categoria,
        tipo: this.entrada.tipo,
        destaque: !!this.entrada.destaque,
        ativo: this.entrada.ativo !== false,
      };
    },

    async submitProduct() {
      const stepsOk = [1, 2, 3].map((s) => this.validateStep(s));
      if (stepsOk.includes(false)) {
        const firstInvalid = [1, 2, 3][stepsOk.indexOf(false)];
        this.currentStep = firstInvalid;
        this.notify('error', 'Existem campos obrigatórios pendentes.');
        return;
      }

      if (Object.values(this.uploadingPhoto).some(Boolean)) {
        this.notify('error', 'Aguarde o upload das fotos ser concluído antes de publicar.');
        return;
      }

      this.loadingSubmit = true;
      const payload = this.buildPayload();
      // id_vendedor identifica o vendedor dono do catálogo (sessão autenticada via useAuthStore)
      payload.id_vendedor = this.idVendedorAtivo;

      try {
        if (this.editingId) {
          // Atualização: payload completo reenviado ao backend, conforme especificação
          payload.id_produto_vendedor = this.editingId;
          payload.tipo_op = 'update';
          await this.apiRequest('PUT', payload);
          this.notify('success', 'Produto atualizado com sucesso.');
        } else {
          payload.tipo_op = 'create';
          await this.apiRequest('POST', payload);
          this.notify('success', 'Produto publicado com sucesso.');
        }
        this.goToList();
        this.fetchProdutos(this.editingId ? this.pagination.page : 1);
      } catch (err) {
        exibeErro(err, this.$toast);
      } finally {
        this.loadingSubmit = false;
      }
    },

    editProduct(p) {
      this.editingId = p.id_produto_vendedor;
      // Guarda uma cópia COMPLETA do produto original (exatamente como veio do GET),
      // incluindo campos somente-leitura (ids, timestamps, curtidas, avaliações,
      // compartilhamentos, media). Usado no submit para reenviar o payload completo.
      this._originalProduto = JSON.parse(JSON.stringify(p));
      // Fotos secundárias vêm aninhadas em p.fotos (fotos.foto_1/foto_2/foto_3);
      // a capa continua no nível raiz (p.foto_capa).
      const fotos = p.fotos || {};
      this.entrada = {
        foto_capa: p.foto_capa || null,
        foto_1: fotos.foto_1 || null,
        foto_2: fotos.foto_2 || null,
        foto_3: fotos.foto_3 || null,
        nome: p.nome || '',
        codigo_barra: p.codigo_barra || '',
        descricao: p.descricao || '',
        preco: p.preco != null ? Number(p.preco) : null,
        promocao_desconto: p.promocao_desconto != null ? Number(p.promocao_desconto) : null,
        desconto_inicio: p.desconto_inicio || null,
        desconto_fim: p.desconto_fim || null,
        fornecedor: p.fornecedor || '',
        categoria: p.categoria || null,
        tipo: p.tipo || null,
        destaque: !!p.destaque,
        ativo: p.ativo !== false,
      };
      this.promoAtiva = !!(p.promocao_desconto && Number(p.promocao_desconto) > 0);
      this.uploadingPhoto = { foto_capa: false, foto_1: false, foto_2: false, foto_3: false };
      this._uploadTokens = {};
      this.errors = {};
      this.currentStep = 1;
      this.maxStepReached = this.totalSteps;
      this.view = 'form';
    },

    // ═══════════════════════ VISUALIZAR ═══════════════════════
    viewProduct(p) {
      this.detailProduto = p;
      this.activeGalleryPhoto = p.foto_capa || null;
      this.showDetail = true;
    },

    // ═══════════════════════ EXCLUIR ═══════════════════════
    askDelete(p) {
      this.deleteTarget = p;
      this.showDeleteConfirm = true;
    },

    openProdutosOfertados(){
      this.showOfertas = true
    },

    askReativar(p){
      this.targetAtualizar    = p
      this.showDeleteReativar = true
    },

    modalEnviarProd(p){
      this.showEnviarLoja = true
      this.targetEnviarLoja = p
    },

    async onProdutoEnviado(){
      this.showEnviarLoja = false
      this.notify('success', 'Produto ofertado para loja com sucesso');
    },

    async reativarProduto(){
      try{

        if(!this.targetAtualizar) return

        const payload = {
          ...this.targetAtualizar
        }

        payload['ativo'] = true

        if(!payload['ativo']){
          this.notify('error', 'Produto não foi ativado');
          return
        }

        await this.apiRequest('PUT', payload);
        this.notify('success', 'Produto reativado com sucesso.');

        this.fetchProdutos(0);

      }catch(e){
        exibeErro(err, this.$toast);
      }finally{
        this.showDeleteReativar = false
        this.targetAtualizar    = null
      }
    },

    async deleteProduct() {
      if (!this.deleteTarget) return;
      this.deletingId = this.deleteTarget.id_produto_vendedor;
      try {
        await this.apiRequest('DELETE', {
          id_vendedor: this.idVendedorAtivo,
          id_produto_vendedor: this.deleteTarget.id_produto_vendedor,
        });
        this.notify('success', 'Produto excluído com sucesso.');
        this.showDeleteConfirm = false;
        this.pagination.total = Math.max(0, this.pagination.total - 1);
        this.fetchProdutos(0);
      } catch (err) {
        exibeErro(err, this.$toast);
      } finally {
        this.deletingId = null;
        this.deleteTarget = null;
      }
    },
  },
};
</script>

<style scoped>
/* ══════════════════════════════════════════════
   TOKENS (mesma paleta do dashboard Marviz)
══════════════════════════════════════════════ */
.mvt-root {
  --accent:   #FF8049;
  --accent2:  #FF804915;
  --acc-h:    #E65D26;
  --green:    #16a34a;
  --green2:   #dcfce7;
  --blue:     #2563eb;
  --blue2:    #dbeafe;
  --yellow:   #ca8a04;
  --yellow2:  #fef9c3;
  --red:      #dc2626;
  --red2:     #fee2e2;
  --bg:       #f8f9fa;
  --bg-card:  #ffffff;
  --bg-el:    #f1f3f5;
  --bg-el2:   #e9ecef;
  --border:   #e2e8f0;
  --border2:  #cbd5e1;
  --text1:    #1e293b;
  --text2:    #64748b;
  --muted:    #94a3b8;
  --radius:   13px;
  --radius-s: 8px;
  --shadow:   0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.02);

  background: var(--bg);
  color: var(--text1);
  font-family: 'DM Sans', 'Segoe UI', sans-serif;
  font-size: 13.5px;
  min-height: 100%;
  padding: 20px 24px 60px;
  box-sizing: border-box;
}
.mvt-ion-content { --background: #f8f9fa; }

/* ══ HEADER ══ */
.mvt-header {
  display: flex; align-items: flex-end; justify-content: space-between;
  gap: 16px; margin-bottom: 18px; flex-wrap: wrap;
}
.mvt-badge {
  display: inline-flex; align-items: center; gap: 6px;
  background: var(--accent2); color: var(--accent);
  font-size: 10.5px; font-weight: 800; letter-spacing: 0.6px;
  padding: 5px 10px; border-radius: 50px; margin-bottom: 8px;
}
.mvt-badge .material-symbols-outlined { font-size: 14px; }
.mvt-title { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; margin: 0 0 4px; }
.mvt-sub { font-size: 12.5px; color: var(--text2); margin: 0; }
.mvt-new-btn { white-space: nowrap; }

/* ══ TABS ══ */
.mvt-tabs {
  display: flex; gap: 6px; background: var(--bg-card);
  border: 1px solid var(--border); border-radius: var(--radius);
  padding: 5px; margin-bottom: 18px; width: fit-content; max-width: 100%;
}
.mvt-tab {
  display: flex; align-items: center; gap: 7px;
  padding: 9px 16px; border-radius: var(--radius-s);
  background: transparent; border: none; cursor: pointer;
  font-family: inherit; font-size: 12.5px; font-weight: 600; color: var(--text2);
  transition: all 0.15s; white-space: nowrap;
}
.mvt-tab .material-symbols-outlined { font-size: 17px; }
.mvt-tab.active { background: var(--accent); color: #fff; }
.mvt-tab-count {
  background: rgba(255,255,255,0.25); border-radius: 20px;
  padding: 1px 7px; font-size: 10.5px; font-weight: 800;
}
.mvt-tab:not(.active) .mvt-tab-count { background: var(--bg-el2); color: var(--text2); }

/* ══ BOTÕES GENÉRICOS ══ */
.tbtn {
  display: inline-flex; align-items: center; gap: 6px;
  background-color:;
  padding: 9px 16px; border-radius: var(--radius-s);
  border: 1px solid #888; display: flex; justify-content: center; background: var(--bg-card);
  color: var(--text2); font-size: 12.5px; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: all 0.15s;
}
.tbtn .material-symbols-outlined { font-size: 17px; }
.tbtn:hover { background: var(--bg-el); color: var(--text1); }
.tbtn.primary { background: #ff8049; color: #fff; border-color: var(--accent); }
.tbtn.primary:hover { background: #db8d6c; }
.tbtn.primary:disabled { opacity: 0.65; cursor: not-allowed; }
.tbtn-danger { background: #b91c1c; width: 50%; text-align: center; display: flex; justify-content: center ;color: #fff; border-color: var(--red); }
.tbtn-danger:hover { background: #b91c1c; }

tbtn-reativ { background: #ff8049; width: 50%; text-align: center; display: flex; justify-content: center ;color: #fff; border-color: var(--red); }
.tbtn-reativ:hover { background: #cc6539; }

.btn-spinner {
  width: 13px; height: 13px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ══ FILTROS ══ */
.mvt-filters { display: flex; gap: 10px; margin-bottom: 18px; flex-wrap: wrap; }
.search-box {
  flex: 1; min-width: 220px; display: flex; align-items: center; gap: 8px;
  background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-s);
  padding: 0 12px; height: 38px;
}
.search-box .material-symbols-outlined { color: var(--muted); font-size: 19px; }
.search-box input {
  border: none; outline: none; background: transparent; flex: 1;
  font-family: inherit; font-size: 12.5px; color: var(--text1);
}
.search-clear { cursor: pointer; font-size: 16px !important; }
.mvt-select-sm {
  height: 38px; border-radius: var(--radius-s); border: 1px solid var(--border);
  background: var(--bg-card); color: var(--text1); font-family: inherit;
  font-size: 12.5px; padding: 0 10px; cursor: pointer;
}
.stab {
  display: flex; align-items: center; gap: 5px; height: 38px;
  padding: 0 12px; border-radius: var(--radius-s);
  background: var(--bg-card); border: 1px solid var(--border);
  color: var(--muted); font-size: 12px; font-weight: 500;
  cursor: pointer; transition: all 0.15s; font-family: inherit;
}
.stab.active { border-color: var(--accent); color: var(--accent); background: var(--accent2); }

/* ══ GRID DE PRODUTOS ══ */
.mvt-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 16px;
}
.prod-card {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius); overflow: hidden; display: flex; flex-direction: column;
  transition: box-shadow 0.15s, border-color 0.15s;
}
.prod-card:hover { box-shadow: var(--shadow); border-color: var(--border2); }
.prod-cover { position: relative; aspect-ratio: 1.15/1; background: var(--bg-el); cursor: pointer; }
.prod-cover img { width: 100%; height: 100%; object-fit: cover; display: block; }
.prod-cover-empty { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: var(--muted); }
.prod-cover-empty .material-symbols-outlined { font-size: 40px; }
.prod-flag {
  position: absolute; top: 8px; left: 8px;
  display: flex; align-items: center; gap: 3px;
  font-size: 10px; font-weight: 800; padding: 3px 7px; border-radius: 5px; color: #fff;
}
.prod-flag .material-symbols-outlined { font-size: 12px; }
.flag-destaque { background: linear-gradient(135deg, var(--accent), var(--acc-h)); }
.flag-promo { background: var(--red); top: 8px; left: auto; right: 8px; }
.prod-status {
  position: absolute; bottom: 8px; left: 8px;
  font-size: 9.5px; font-weight: 700; padding: 2px 7px; border-radius: 5px;
  background: rgba(255,255,255,0.92);
}
.status-ativo { color: var(--green);  font-size: 1.2rem;}
.status-pausado { color: var(--red); font-size: 1.2rem; }
.prod-body { padding: 12px 13px 6px; flex: 1; }
.prod-cat {
  display: flex; align-items: center; gap: 4px;
  font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px;
  color: var(--muted); margin-bottom: 5px;
}
.prod-cat .material-symbols-outlined { font-size: 13px; }
.prod-name {
  font-size: 13px; font-weight: 700; color: var(--text1); margin-bottom: 7px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  line-height: 1.3; min-height: 33px;
}
.prod-price-row { display: flex; align-items: baseline; gap: 7px; flex-wrap: wrap; margin-bottom: 8px; }
.prod-price-old { font-size: 11px; color: var(--muted); text-decoration: line-through; }
.prod-price-new { font-size: 16px; font-weight: 800; color: var(--text1); letter-spacing: -0.3px; }
.prod-tags { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.prod-tipo-tag {
  font-size: 10px; font-weight: 600; color: var(--accent); background: var(--accent2);
  padding: 2px 7px; border-radius: 5px;
}
.prod-ean { font-size: 9.5px; color: var(--muted); }
.prod-actions {
  display: flex; border-top: 1px solid var(--border);
}
.picon {
  flex: 1; display: flex; align-items: center; justify-content: center;
  padding: 8px 0; background: transparent; border: none; cursor: pointer;
  color: var(--text2); transition: background 0.15s;
}
.picon:not(:last-child) { border-right: 1px solid var(--border); }
.picon:hover { background: var(--bg-el); color: var(--text1); }
.picon-danger:hover { background: var(--red2); color: var(--red); }
.picon .material-symbols-outlined { font-size: 18px; }

/* ══ SKELETON ══ */
.sk-block { background: linear-gradient(90deg, var(--bg-el) 25%, var(--bg-el2) 37%, var(--bg-el) 63%); background-size: 400% 100%; animation: sk 1.4s ease infinite; }
.sk-line { height: 9px; border-radius: 4px; margin: 6px 0; background: linear-gradient(90deg, var(--bg-el) 25%, var(--bg-el2) 37%, var(--bg-el) 63%); background-size: 400% 100%; animation: sk 1.4s ease infinite; }
@keyframes sk { 0% { background-position: 100% 50%; } 100% { background-position: 0 50%; } }

/* ══ EMPTY STATE ══ */
.mvt-empty {
  display: flex; flex-direction: column; align-items: center; text-align: center;
  padding: 60px 20px; background: var(--bg-card); border: 1px dashed var(--border2);
  border-radius: var(--radius); color: var(--text2);
}
.mvt-empty .material-symbols-outlined { font-size: 46px; color: var(--muted); margin-bottom: 10px; }
.mvt-empty h3 { font-size: 15px; color: var(--text1); margin: 0 0 6px; }
.mvt-empty p { font-size: 12px; max-width: 320px; margin: 0 0 18px; }

/* ══ PAGINADOR ══ */
.mvt-paginator { margin-top: 20px; background: transparent; }
:deep(.p-paginator) { background: transparent; border: none; padding: 0; }
:deep(.p-paginator .p-paginator-page.p-highlight) { background: var(--accent); color: #fff; }

/* ══ WIZARD ══ */
.wizard-card {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 24px; max-width: 760px; margin: 0 auto;
}
.step-indicator { display: flex; align-items: flex-start; margin-bottom: 28px; }
.step-dot-wrap {
  display: flex; flex-direction: column; align-items: center; gap: 6px; opacity: 0.55;
}
.step-dot-wrap.clickable { cursor: pointer; }
.step-dot-wrap.active, .step-dot-wrap.done { opacity: 1; }
.step-dot {
  width: 34px; height: 34px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: var(--bg-el); border: 2px solid var(--border2); color: var(--muted);
  transition: all 0.2s;
}
.step-dot .material-symbols-outlined { font-size: 17px; }
.step-dot-wrap.active .step-dot { background: var(--accent2); border-color: var(--accent); color: var(--accent); }
.step-dot-wrap.done .step-dot { background: var(--accent); border-color: var(--accent); color: #fff; }
.step-label { font-size: 10.5px; font-weight: 600; color: var(--text2); white-space: nowrap; }
.step-dot-wrap.active .step-label { color: var(--text1); }
.step-line { flex: 1; height: 2px; background: var(--border); margin: 17px 6px 0; transition: background 0.2s; }
.step-line.done { background: var(--accent); }

.step-title { font-size: 18px; font-weight: 800; margin: 0 0 4px; }
.step-desc { font-size: 12px; color: var(--text2); margin: 0 0 22px; }

/* ══ FOTOS ══ */
.photo-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.photo-slot {
  position: relative; aspect-ratio: 1/1; border-radius: var(--radius-s);
  border: 2px dashed var(--border2); background: var(--bg-el);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 4px; cursor: pointer; overflow: hidden; transition: all 0.15s; text-align: center; padding: 6px;
}
.photo-slot:hover { border-color: var(--accent); background: var(--accent2); }
.photo-slot.filled { border-style: solid; padding: 0; }
.photo-slot img { width: 100%; height: 100%; object-fit: cover; }
.photo-slot .material-symbols-outlined { font-size: 24px; color: var(--muted); }
.photo-slot-label { font-size: 1rem; font-weight: 700; color: var(--text2); }
.photo-slot-sub { font-size: 0.8rem; color: var(--accent); font-weight: 700; }
.photo-main { grid-column: span 2; grid-row: span 2; }
.photo-main .material-symbols-outlined { font-size: 30px; }
.photo-badge {
  position: absolute; top: 6px; left: 6px; background: var(--accent); color: #fff;
  font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px;
}
.photo-remove {
  position: absolute; top: 6px; right: 6px; width: 22px; height: 22px; border-radius: 50%;
  background: rgba(0,0,0,0.55); display: flex; align-items: center; justify-content: center; cursor: pointer;
}
.photo-remove .material-symbols-outlined { font-size: 14px; color: #fff; }
.photo-slot.has-error { border-color: var(--red); }
.photo-slot.uploading { pointer-events: none; opacity: 0.85; }
.photo-uploading-overlay {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,0.45); border-radius: inherit;
}
.photo-uploading-overlay .btn-spinner {
  width: 20px; height: 20px; border-width: 2.5px;
  border-color: rgba(255,255,255,0.35); border-top-color: #fff;
}

/* ══ FORM FIELDS ══ */
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-field { display: flex; flex-direction: column; gap: 6px; }
.form-field.span-2 { grid-column: span 2; }
.form-field label { font-size: 11.5px; font-weight: 700; color: var(--text1); }
.req { color: var(--red); }
.form-field input[type="text"], .form-field input[type="number"], .form-field input[type="date"],
.form-field select, .form-field textarea {
  border: 1px solid var(--border); background: var(--bg-el); border-radius: var(--radius-s);
  padding: 9px 11px; font-family: inherit; font-size: 12.5px; color: var(--text1);
  outline: none; transition: border-color 0.15s; width: 100%; box-sizing: border-box;
}
.form-field input:focus, .form-field select:focus, .form-field textarea:focus { border-color: var(--accent); background: var(--bg-card); }
.form-field textarea { resize: vertical; min-height: 90px; }
.has-error { border-color: var(--red) !important; }
.field-error { font-size: 10.5px; color: var(--red); font-weight: 600; }
.field-footer { display: flex; justify-content: space-between; align-items: center; }
.field-count { font-size: 10px; color: var(--muted); margin-left: auto; }

.price-input {
  display: flex; align-items: center; gap: 6px;
  border: 1px solid var(--border); background: var(--bg-el); border-radius: var(--radius-s);
  padding: 0 11px;
}
.price-input span { font-size: 12px; font-weight: 700; color: var(--muted); }
.price-input input {
  border: none !important; background: transparent !important; padding: 9px 0 !important;
  flex: 1; min-width: 0;
}

/* ══ TOGGLES / PROMO / DESTAQUE ══ */
.switch {
  width: 42px; height: 24px; border-radius: 20px; background: var(--bg-el2);
  border: 1px solid var(--border2); position: relative; cursor: pointer; flex-shrink: 0;
  transition: background 0.2s; padding: 0;
}
.switch.on { background: var(--accent); border-color: var(--accent); }
.switch-knob {
  position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; border-radius: 50%;
  background: #fff; transition: transform 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.25);
}
.switch.on .switch-knob { transform: translateX(18px); }

.promo-toggle-box, .ads-box {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  background: var(--bg-el); border: 1px solid var(--border); border-radius: var(--radius-s);
  padding: 14px 16px; margin: 18px 0;
}
.ads-box { background: linear-gradient(120deg, var(--accent2), var(--bg-el)); border-color: var(--accent2); }
.promo-toggle-info, .ads-box-info { display: flex; align-items: flex-start; gap: 10px; }
.promo-toggle-info .material-symbols-outlined, .ads-box-info .material-symbols-outlined { color: var(--accent); font-size: 22px; }
.promo-toggle-title { font-size: 12.5px; font-weight: 700; color: var(--text1); }
.promo-toggle-sub { font-size: 11px; color: var(--text2); margin-top: 2px; max-width: 420px; }

.promo-fields { animation: fadeIn 0.2s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
.promo-preview {
  display: flex; align-items: center; gap: 8px; margin-top: 12px;
  background: var(--green2); color: var(--green); border-radius: var(--radius-s);
  padding: 10px 14px; font-size: 12.5px; font-weight: 600;
}
.promo-preview .material-symbols-outlined { font-size: 17px; }
.promo-preview strong { font-size: 14px; }
.promo-preview-old { text-decoration: line-through; color: var(--muted); font-weight: 500; margin-left: auto; }

/* ══ REVISÃO ══ */
.review-layout { display: grid; grid-template-columns: 220px 1fr; gap: 20px; margin-top: 8px; }
.review-preview-label {
  display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700;
  color: var(--text2); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.4px;
}
.review-preview-label .material-symbols-outlined { font-size: 15px; }
.preview-card { pointer-events: none; }
.review-summary { display: flex; flex-direction: column; gap: 14px; }
.review-row { display: flex; gap: 10px; align-items: flex-start; }
.review-row .material-symbols-outlined { font-size: 18px; color: var(--muted); margin-top: 1px; }
.review-row-label { font-size: 10.5px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.3px; }
.review-row-value { font-size: 12.5px; color: var(--text1); margin-top: 2px; line-height: 1.5; white-space: pre-line; }

/* ══ NAV DO WIZARD ══ */
.wizard-nav { display: flex; justify-content: space-between; margin-top: 26px; padding-top: 18px; border-top: 1px solid var(--border); }

/* ══ MODAIS ══ */
:deep(.mvt-dialog) { width: 90vw; max-width: 780px; }
:deep(.mvt-dialog-sm) { width: 90vw; max-width: 380px; }
:deep(.mvt-dialog .p-dialog-content), :deep(.mvt-dialog-sm .p-dialog-content) { padding: 20px; }
.detail-body { display: grid; grid-template-columns: 280px 1fr; gap: 22px; }
.detail-main-img { width: 100%; aspect-ratio: 1/1; object-fit: cover; border-radius: var(--radius-s); background: var(--bg-el); }
.detail-thumbs { display: flex; gap: 6px; margin-top: 8px; }
.detail-thumb { width: 52px; height: 52px; border-radius: 6px; overflow: hidden; cursor: pointer; border: 2px solid transparent; opacity: 0.6; }
.detail-thumb.active { border-color: var(--accent); opacity: 1; }
.detail-thumb img { width: 100%; height: 100%; object-fit: cover; }
.detail-name { font-size: 19px; font-weight: 800; margin: 4px 0 10px; }
.detail-desc { font-size: 12.5px; color: var(--text2); line-height: 1.6; margin: 0 0 16px; white-space: pre-line; }
.detail-meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 18px; }
.detail-meta-label { display: block; font-size: 10px; font-weight: 700; color: var(--muted); text-transform: uppercase; }
.detail-meta-value { display: block; font-size: 12.5px; color: var(--text1); font-weight: 600; margin-top: 2px; }
.detail-actions { display: flex; gap: 10px; margin-top: 6px; }

.confirm-body { text-align: center; padding: 6px 0 18px; }
.confirm-icon { font-size: 40px; color: var(--yellow); margin-bottom: 8px; }
.confirm-body p { font-size: 13px; color: var(--text2); line-height: 1.5; }

/* ══════════════════════════════════════════════
   RESPONSIVIDADE — até 320px
══════════════════════════════════════════════ */
@media (max-width: 900px) {
  .review-layout { grid-template-columns: 1fr; }
}
@media (max-width: 768px) {
  .mvt-root { padding: 14px 14px 50px; }
  .mvt-header { align-items: flex-start; }
  .mvt-title { font-size: 20px; }
  .form-grid { grid-template-columns: 1fr; }
  .form-field.span-2 { grid-column: span 1; }
  .detail-body { grid-template-columns: 1fr; }
  .wizard-card { padding: 18px 14px; }
  .step-label { display: none; }
  .mvt-tab span:not(.material-symbols-outlined):not(.mvt-tab-count) { display: inline; }
}
@media (max-width: 480px) {
  
  .photo-grid { grid-template-columns: repeat(2, 1fr); }
  .photo-main { grid-column: span 2; grid-row: span 1; }
  .mvt-filters { flex-direction: column; }
  .mvt-filters .search-box, .mvt-filters select, .mvt-filters .stab { width: 100%; }
  .mvt-header { flex-direction: column; align-items: stretch; }
  .mvt-new-btn { justify-content: center; }
}
@media (max-width: 360px) {
  
  .step-dot { width: 28px; height: 28px; }
  .wizard-nav { flex-direction: column-reverse; gap: 8px; }
  .wizard-nav .tbtn { width: 100%; justify-content: center; }
}

.star-ic {
  font-size: 20px;
  color: #fbbc04;
}

.star-full {
  font-variation-settings:
    'FILL' 1,
    'wght' 400,
    'GRAD' 0,
    'opsz' 24;
}

.star-half {
  font-variation-settings:
    'FILL' 1,
    'wght' 400,
    'GRAD' 0,
    'opsz' 24;
}

.star-empty {
  font-variation-settings:
    'FILL' 0,
    'wght' 400,
    'GRAD' 0,
    'opsz' 24;
}

.w-full {
  width: 100%;
}


form-label {
  font-size: 13px;
  color: #555 !important;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-input {
  background-color: #f0f0f0 !important;
  border: 1px solid rgb(177, 177, 177) !important;
  color: #000 !important;
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 15px;
  outline: none;
  width: 100%;
  height: 48px;
  box-sizing: border-box;
  transition: border-color 0.3s ease;
}

.form-input:focus {
  border-color: #FF8049 !important;
}

@media(max-width: 576px){
    .calendar-section{
        display: flex;
        flex-direction: column;
    }
}

/* Forçar cor do placeholder no padrão dark */
.form-input::placeholder {
  color: #474747 !important;
}

.input-date {
  color: #525252 !important;
}

.input-date-wrapper {
  position: relative;
  width: 100%;
}

/* === PRIME VUE OVERRIDES === */
.w-full {
  width: 100%;
}

.prime-calendar {
  width: 100%;
}
:deep(.prime-calendar){
  background-color: #FFF !important;
}

/* Evitar que o PrimeVue crie bordas duplas já que aplicamos o form-input direto no inputClass */
:deep(.p-calendar) {
  width: 100%;
}

/* === BOTÕES E AÇÕES === */
.form-actions-row {
  display: flex;
  gap: 10px;
  width: 100%;
}

.action-btn {
  border-radius: 12px;
  padding: 10px 20px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  border: none;
  transition: background 0.2s ease, opacity 0.2s ease;
}

</style>