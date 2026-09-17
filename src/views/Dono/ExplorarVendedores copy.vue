<template>
  <ion-page class="exp-page">
    <ion-content :fullscreen="true" class="exp-content" :scroll-events="true">

      <!-- ══ HERO HEADER ══ -->
      <div class="exp-hero">
        <div class="hero-bg-orbs">
          <div class="orb orb1"></div>
          <div class="orb orb2"></div>
          <div class="orb orb3"></div>
        </div>
        <div class="hero-top">
          <button class="back-btn" @click="$router.back()">
            <span class="material-symbols-outlined">arrow_back_ios_new</span>
          </button>
          <div class="hero-brand">
            <span class="hero-eyebrow poppins-medium">REDE</span>
            <h1 class="hero-title poppins-semibold">Explorar</h1>
          </div>
          <div class="hero-pills">
            <div class="stat-bubble">
              <span class="sb-num poppins-semibold">{{ vendedores.length }}</span>
              <span class="sb-label poppins-regular">vendedores</span>
            </div>
            <div class="stat-bubble accent">
              <span class="sb-num poppins-semibold">{{ associados.size }}</span>
              <span class="sb-label poppins-regular">na loja</span>
            </div>
          </div>
        </div>

        <!-- Search flutuante -->
        <div class="hero-search">
          <div class="search-pill" :class="{ focused: searchFocused }">
            <span class="material-symbols-outlined sp-icon">search</span>
            <input
              type="text"
              v-model="busca"
              placeholder="Buscar vendedores, especialidades..."
              class="sp-input poppins-regular"
              @focus="searchFocused = true"
              @blur="searchFocused = false"
            />
            <transition name="fade">
              <button v-if="busca" class="sp-clear" @click="busca = ''">
                <span class="material-symbols-outlined">close</span>
              </button>
            </transition>
          </div>
        </div>

        <!-- Filtro chips rolável -->
        <div class="filter-scroll" style="padding-top: 10px;">
          <div class="filter-track" style="padding-top: 30px;">
            
          </div>
        </div>
      </div>

      <!-- ══ LOADING ══ -->
      <div v-if="loading" class="loading-screen">
        <div class="loading-cards">
          <div v-for="i in 4" :key="i" class="skeleton-card">
            <div class="skel-cover"></div>
            <div class="skel-body">
              <div class="skel-avatar"></div>
              <div class="skel-line w70"></div>
              <div class="skel-line w45"></div>
              <div class="skel-line w85"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- ══ EMPTY ══ -->
      <div v-else-if="!vendedoresFiltrados.length" class="empty-screen">
        <div class="empty-icon">
          <span class="material-symbols-outlined">manage_search</span>
        </div>
        <h3 class="poppins-semibold">Nenhum vendedor encontrado</h3>
        <p class="poppins-regular">Tente outros filtros ou termos de busca</p>
        <button class="btn-reset poppins-medium" @click="resetFiltros">
          <span class="material-symbols-outlined">refresh</span>
          Limpar filtros
        </button>
      </div>

      <!-- ══ CONTEÚDO PRINCIPAL ══ -->
      <div v-else class="exp-body">

        <div style="padding: 30px;">
          <button style="background-color: transparent; color: #000; 
          border: none; border-radius: 15px; font-size: 15px; font-family: 'Poppins'; font-weight: 600; padding: 0;
          display: flex; gap: 10px; align-items: center; transform: translateX(-15px);"

          @click="$router.push({name: 'MeusVendedores'})"
          
          >
          <div>
            <span class="material-symbols-outlined" style="font-size: 13px; color: #000;">
              arrow_forward_ios
            </span>
          </div>
          <div>
            <u>
              Meus vendedores
            </u>
          </div>
          </button>
        </div>

        <!-- ── Seção: Destaque da rede ── -->
        <div class="section" style="margin-top: 10px;" v-if="!busca && filtroAtivo === 'todos'">
          <div class="section-header">
            <div class="sh-left">
              <span class="material-symbols-outlined sh-icon accent">auto_awesome</span>
              <span class="sh-title poppins-semibold">Destaques da Rede</span>
            </div>
            <span class="sh-sub poppins-regular">Top avaliados</span>
          </div>
          <div class="carousel">
            <div class="carousel-track">
              <div
                v-for="v in topVendedores"
                :key="'dest-' + v.id_vendedor"
                class="dest-card"
                @click="abrirPerfil(v)"
              >
                <div class="dc-cover" :style="{ background: getCoverGradient(v.id_vendedor) }">
                  <div class="dc-cover-pattern"></div>
                  <div v-if="isAssociado(v.id_vendedor)" class="dc-badge-assoc">
                    <span class="material-symbols-outlined">check</span>
                  </div>
                  <div class="dc-star-badge" v-if="v.avaliacao_media">
                    <span class="material-symbols-outlined">star</span>
                    {{ v.avaliacao_media }}
                  </div>
                </div>
                <div class="dc-avatar-wrap">
                  <div class="dc-avatar" :style="getFotoStyle(v.foto_perfil, v.id_vendedor)">
                    <span v-if="!v.foto_perfil" class="dc-initials poppins-semibold">{{ getInitials(v.nome) }}</span>
                  </div>
                  <div class="dc-status" :class="v.status_conta === 'ativo' ? 'live' : 'off'"></div>
                </div>
                <div class="dc-info" style="display: flex; flex-direction: column; justify-content: space-between; height: 130px;">
                    <div>
                        <div class="dc-name poppins-semibold">{{ v.nome.split(' ')[0] }}</div>
                        <div class="dc-user poppins-regular">@{{ v.nome_usuario }}</div>
                        <div class="dc-metrics">
                            <span class="dcm poppins-medium">
                              <span class="material-symbols-outlined">shopping_bag</span>
                              {{ v.num_vendas }}
                            </span>
                            <span class="dcm poppins-medium">
                              <span class="material-symbols-outlined">request_quote</span>
                              {{ v.num_cotacoes }}
                            </span>
                    </div>
                  </div>
                  <button
                    class="dc-btn poppins-semibold"
                    v-if="user.nivel==1"
                    :class="{ assoc: isAssociado(v.id_vendedor) }"
                    @click.stop="isAssociado(v.id_vendedor) ? desassociar(v.id_vendedor) : associar(v.id_vendedor)"
                    :disabled="loadingId === v.id_vendedor"
                  >
                    <span class="material-symbols-outlined">{{ isAssociado(v.id_vendedor) ? 'how_to_reg' : 'person_add' }}</span>
                    {{ isAssociado(v.id_vendedor) ? 'Associado' : 'Associar' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Seção: Associados à sua loja ── -->
        <div class="section" style="margin-top: 50px;" v-if="!busca && filtroAtivo === 'todos' && associadosList.length">
          <div class="section-header">
            <div class="sh-left">
              <span class="material-symbols-outlined sh-icon green">storefront</span>
              <span class="sh-title poppins-semibold">Na sua loja</span>
            </div>
            <span class="sh-sub poppins-regular">{{ associadosList.length }} vendedores</span>
          </div>
          <div class="carousel">
            <div class="carousel-track">
              <div
                v-for="v in associadosList"
                :key="'assoc-' + v.id_vendedor"
                class="mini-card"
                @click="abrirPerfil(v)"
              >
                <div class="mc-avatar" :style="getFotoStyle(v.foto_perfil, v.id_vendedor)">
                  <span v-if="!v.foto_perfil" class="mc-initials poppins-semibold">{{ getInitials(v.nome) }}</span>
                  <div class="mc-status live"></div>
                </div>
                <div class="mc-name poppins-semibold">{{ v.nome.split(' ')[0] }}</div>
                <div class="mc-sub poppins-regular">{{ v.num_vendas }} vendas</div>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Seção: Melhores em cotações ── -->
        <div class="section" style="margin-top: 50px;" v-if="!busca && filtroAtivo === 'todos'">
          <div class="section-header">
            <div class="sh-left">
              <span class="material-symbols-outlined sh-icon blue">request_quote</span>
              <span class="sh-title poppins-semibold">Campeões de Cotações</span>
            </div>
            <span class="sh-sub poppins-regular">Mais participações</span>
          </div>
          <div class="cotacao-list">
            <div
              v-for="(v, i) in cotacaoRanking"
              :key="'cot-' + v.id_vendedor"
              class="cot-row"
              @click="abrirPerfil(v)"
            >
              <div class="cot-rank poppins-semibold" :class="i < 3 ? 'gold' : ''">
                {{ i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}` }}
              </div>
              <div class="cot-avatar" :style="getFotoStyle(v.foto_perfil, v.id_vendedor)">
                <span v-if="!v.foto_perfil" class="poppins-semibold" style="font-size:13px;color:#fff">{{ getInitials(v.nome) }}</span>
              </div>
              <div class="cot-info">
                <div class="cot-name poppins-semibold">{{ v.nome }}</div>
                <div class="cot-sub poppins-regular">{{ v.cidade }}, {{ v.estado }}</div>
              </div>
              <div class="cot-stats">
                <div class="cot-val poppins-semibold">{{ v.num_cotacoes }}</div>
                <div class="cot-lbl poppins-regular">cotações</div>
              </div>
              <div class="cot-conv poppins-medium" :class="getConversao(v) >= 50 ? 'green' : 'orange'">
                {{ getConversao(v) }}%
              </div>
            </div>
          </div>
        </div>

        <!-- ── Seção: Sort row (quando busca ativa ou filtro específico) ── -->
        <div class="sort-row" v-if="busca || filtroAtivo !== 'todos'">
          <span class="sort-lbl poppins-regular">Ordenar:</span>
          <div class="sort-chips">
            <button
              v-for="s in sorts"
              :key="s.key"
              :class="['schip poppins-medium', { active: sortAtivo === s.key }]"
              @click="sortAtivo = s.key"
            >{{ s.label }}</button>
          </div>
        </div>

        <!-- ── Seção: Todos / Grid explore ── -->
        <div class="section" style="margin-top: 50px;">
          <div class="section-header" v-if="!busca && filtroAtivo === 'todos'">
            <div class="sh-left">
              <span class="material-symbols-outlined sh-icon purple">explore</span>
              <span class="sh-title poppins-semibold">Explore e conheça</span>
            </div>
            <div class="sort-inline">
              <button
                v-for="s in sorts"
                :key="s.key"
                :class="['schip-sm poppins-medium', { active: sortAtivo === s.key }]"
                @click="sortAtivo = s.key"
              >{{ s.label }}</button>
            </div>
          </div>
          <div class="grid-cards">
            <div
              v-for="(v, i) in vendedoresFiltrados"
              :key="v.id_vendedor"
              class="grid-card"
              :class="{ wide: i % 5 === 0, associated: isAssociado(v.id_vendedor) }"
              @click="abrirPerfil(v)"
            >
              <div class="gc-cover" :style="{ background: getCoverGradient(v.id_vendedor) }">
                <div class="gc-pattern"></div>
                <div v-if="isAssociado(v.id_vendedor)" class="gc-ribbon">
                  <span class="material-symbols-outlined" style="font-size:9px">check</span>
                  Associado à loja
                </div>
                <div class="gc-status" :class="v.status_conta === 'ativo' ? 'live' : 'off'"></div>
              </div>
              <div class="gc-avatar-wrap">
                <div class="gc-avatar" :style="getFotoStyle(v.foto_perfil, v.id_vendedor)">
                  <span v-if="!v.foto_perfil" class="gc-initials poppins-semibold">{{ getInitials(v.nome) }}</span>
                </div>
              </div>
              <div class="gc-body">
                <div class="gc-name poppins-semibold">{{ v.nome.split(' ').slice(0,2).join(' ') }}</div>
                <div class="gc-user poppins-regular">@{{ v.nome_usuario }}</div>
                <div class="gc-city poppins-regular" v-if="v.cidade">
                  <span class="material-symbols-outlined" style="font-size:10px">location_on</span>
                  {{ v.cidade }}
                </div>

                <div class="gc-tags" v-if="v.especialidades">
                  <span
                    v-for="tag in getEspecialidades(v.especialidades).slice(0, 2)"
                    :key="tag"
                    class="gtag poppins-medium"
                  >{{ tag }}</span>
                </div>

                <div class="gc-metrics">
                  <span class="gm poppins-medium">
                    <span class="material-symbols-outlined">star</span>
                    {{ v.avaliacao_media || '–' }}
                  </span>
                  <span class="gm poppins-medium">
                    <span class="material-symbols-outlined">shopping_bag</span>
                    {{ v.num_vendas }}
                  </span>
                  <span class="gm poppins-medium">
                    <span class="material-symbols-outlined">timer</span>
                    {{ formatResposta(v.taxa_resposta) }}
                  </span>
                </div>

                <div class="gc-action" @click.stop v-if="user.nivel==1">
                  <button
                    v-if="!isAssociado(v.id_vendedor)"
                    class="gc-btn-assoc poppins-semibold"
                    :class="{ loading: loadingId === v.id_vendedor }"
                    @click="associar(v.id_vendedor)"
                    :disabled="loadingId === v.id_vendedor"
                  >
                    <span class="material-symbols-outlined">{{ loadingId === v.id_vendedor ? 'hourglass_empty' : 'person_add' }}</span>
                    {{ loadingId === v.id_vendedor ? '...' : 'Associar' }}
                  </button>
                  <button
                    v-else
                    class="gc-btn-desassoc poppins-semibold"
                    :class="{ loading: loadingId === v.id_vendedor }"
                    @click="desassociar(v.id_vendedor)"
                    :disabled="loadingId === v.id_vendedor"
                  >
                    <span class="material-symbols-outlined">how_to_reg</span>
                    Associado
                  </button>
                  <button class="gc-btn-perfil" @click="abrirPerfil(v)">
                    <span class="material-symbols-outlined">open_in_new</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style="height: 100px;"></div>
      </div>

    </ion-content>

    <!-- ══ MODAL DE PERFIL ══ -->
    <ion-modal
      :is-open="!!perfilAberto"
      @did-dismiss="fecharPerfil"
      class="perfil-modal"
    >
      <ion-content class="modal-ion-content" v-if="perfilAberto">
        <div class="pm-wrap">

          <!-- Cover imersivo -->
          <div class="pm-cover" :style="{ background: getCoverGradient(perfilAberto.id_vendedor) }">
            <div class="pm-cover-pattern"></div>
            <div class="pm-cover-grad"></div>
            <button class="pm-close" @click="fecharPerfil">
              <span class="material-symbols-outlined">close</span>
            </button>
            <div class="pm-handle"></div>
          </div>

          <!-- Avatar flutuante -->
          <div class="pm-avatar-float">
            <div class="pm-avatar" :style="getFotoStyle(perfilAberto.foto_perfil, perfilAberto.id_vendedor)">
              <span v-if="!perfilAberto.foto_perfil" class="pm-initials poppins-semibold">{{ getInitials(perfilAberto.nome) }}</span>
            </div>
            <div class="pm-status-dot" :class="perfilAberto.status_conta === 'ativo' ? 'live' : 'off'"></div>
          </div>

          <!-- Identity -->
          <div class="pm-identity">
            <div class="pm-badges-row">
              <span class="pm-badge green poppins-medium" v-if="perfilAberto.status_conta === 'ativo'">
                <span class="material-symbols-outlined">fiber_manual_record</span>
                Ativo
              </span>
              <span class="pm-badge orange poppins-medium" v-if="isAssociado(perfilAberto.id_vendedor)">
                <span class="material-symbols-outlined">storefront</span>
                Na sua loja
              </span>
              <span class="pm-badge blue poppins-medium" v-if="perfilAberto.num_vendas > 0">
                <span class="material-symbols-outlined">verified</span>
                Experiente
              </span>
            </div>
            <h2 class="pm-name poppins-semibold">{{ perfilAberto.nome }}</h2>
            <div class="pm-user poppins-regular">@{{ perfilAberto.nome_usuario }}</div>
            <div class="pm-city poppins-regular" v-if="perfilAberto.cidade">
              <span class="material-symbols-outlined">location_on</span>
              {{ perfilAberto.cidade }}, {{ perfilAberto.estado }}
            </div>
          </div>

          <!-- Bio -->
          <div class="pm-section" v-if="perfilAberto.desc_perfil">
            <p class="pm-bio poppins-regular">{{ perfilAberto.desc_perfil }}</p>
          </div>

          <!-- KPI cards -->
          <div class="pm-section">
            <div class="pm-sec-title poppins-semibold">
              <span class="material-symbols-outlined">bar_chart</span>
              Métricas
            </div>
            <div class="pm-kpi-grid">
              <div class="pm-kpi orange">
                <span class="material-symbols-outlined">star</span>
                <div class="pk-val poppins-semibold">{{ perfilAberto.avaliacao_media || '0' }}</div>
                <div class="pk-label poppins-regular">Avaliação</div>
                <div class="pk-sub poppins-regular">{{ perfilAberto.num_avaliacoes }} avaliações</div>
              </div>
              <div class="pm-kpi green">
                <span class="material-symbols-outlined">shopping_bag</span>
                <div class="pk-val poppins-semibold">{{ perfilAberto.num_vendas }}</div>
                <div class="pk-label poppins-regular">Vendas</div>
                <div class="pk-sub poppins-regular">total histórico</div>
              </div>
              <div class="pm-kpi blue">
                <span class="material-symbols-outlined">request_quote</span>
                <div class="pk-val poppins-semibold">{{ perfilAberto.num_cotacoes }}</div>
                <div class="pk-label poppins-regular">Cotações</div>
                <div class="pk-sub poppins-regular">participadas</div>
              </div>
              <div class="pm-kpi purple">
                <span class="material-symbols-outlined">timer</span>
                <div class="pk-val poppins-semibold">{{ formatResposta(perfilAberto.taxa_resposta) }}</div>
                <div class="pk-label poppins-regular">Resposta</div>
                <div class="pk-sub poppins-regular">tempo médio</div>
              </div>
            </div>
          </div>

          <!-- Performance -->
          <div class="pm-section">
            <div class="pm-sec-title poppins-semibold">
              <span class="material-symbols-outlined">insights</span>
              Performance
            </div>
            <div class="pm-perf">
              <div class="pp-item">
                <div class="pp-head">
                  <span class="pp-label poppins-regular">Taxa de Conversão</span>
                  <span class="pp-val poppins-semibold" :class="getConversao(perfilAberto) >= 50 ? 'green' : 'orange'">{{ getConversao(perfilAberto) }}%</span>
                </div>
                <div class="pp-bar"><div class="pp-fill" :class="getConversao(perfilAberto) >= 50 ? 'green' : 'orange'" :style="{ width: getConversao(perfilAberto) + '%' }"></div></div>
              </div>
              <div class="pp-item">
                <div class="pp-head">
                  <span class="pp-label poppins-regular">Velocidade de Resposta</span>
                  <span class="pp-val poppins-semibold" :class="getRespostaClass(perfilAberto.taxa_resposta)">{{ formatResposta(perfilAberto.taxa_resposta) }}</span>
                </div>
                <div class="pp-bar"><div class="pp-fill" :style="{ width: getRespostaPct(perfilAberto.taxa_resposta) + '%', background: getRespostaCor(perfilAberto.taxa_resposta) }"></div></div>
              </div>
              <div class="pp-item">
                <div class="pp-head">
                  <span class="pp-label poppins-regular">Avaliação dos clientes</span>
                  <span class="pp-val poppins-semibold green">{{ perfilAberto.avaliacao_media || 0 }}/5</span>
                </div>
                <div class="pp-bar"><div class="pp-fill green" :style="{ width: ((perfilAberto.avaliacao_media || 0) / 5 * 100) + '%' }"></div></div>
              </div>
            </div>
          </div>

          <!-- Especialidades -->
          <div class="pm-section" v-if="perfilAberto.especialidades">
            <div class="pm-sec-title poppins-semibold">
              <span class="material-symbols-outlined">workspace_premium</span>
              Especialidades
            </div>
            <div class="pm-tags">
              <span
                v-for="tag in getEspecialidades(perfilAberto.especialidades)"
                :key="tag"
                class="skill-tag poppins-medium"
              >{{ tag }}</span>
            </div>
          </div>

          <!-- Contato -->
          <div class="pm-section">
            <div class="pm-sec-title poppins-semibold">
              <span class="material-symbols-outlined">contact_page</span>
              Contato
            </div>
            <div class="pm-contact">
              <div class="pmc-row">
                <div class="pmc-icon-wrap">
                  <span class="material-symbols-outlined">mail</span>
                </div>
                <span class="poppins-regular">{{ perfilAberto.email }}</span>
              </div>
              <div class="pmc-row" v-if="perfilAberto.celular">
                <div class="pmc-icon-wrap">
                  <span class="material-symbols-outlined">smartphone</span>
                </div>
                <span class="poppins-regular">{{ perfilAberto.celular }}</span>
              </div>
              <div class="pmc-row">
                <div class="pmc-icon-wrap">
                  <span class="material-symbols-outlined">calendar_today</span>
                </div>
                <span class="poppins-regular">Membro desde {{ formatDate(perfilAberto.criado_em) }}</span>
              </div>
            </div>
          </div>

          <!-- Ação -->
          <div class="pm-action" v-if="user.nivel==1">
            <button
              v-if="!isAssociado(perfilAberto.id_vendedor)"
              class="pm-btn-assoc poppins-semibold"
              :class="{ loading: loadingId === perfilAberto.id_vendedor }"
              @click="associar(perfilAberto.id_vendedor)"
              :disabled="loadingId === perfilAberto.id_vendedor"
              style="background-color: #ff8049;"
            >
              <span class="material-symbols-outlined">{{ loadingId === perfilAberto.id_vendedor ? 'hourglass_empty' : 'person_add' }}</span>
              {{ loadingId === perfilAberto.id_vendedor ? 'Associando...' : 'Associar à loja' }}
            </button>
            <button
              v-else
              class="pm-btn-desassoc poppins-semibold"
              :class="{ loading: loadingId === perfilAberto.id_vendedor }"
              @click="desassociar(perfilAberto.id_vendedor)"
              :disabled="loadingId === perfilAberto.id_vendedor"
              style="background-color: #AAA; color: #FFF;"
            >
              <span class="material-symbols-outlined">{{ loadingId === perfilAberto.id_vendedor ? 'hourglass_empty' : 'person_remove' }}</span>
              {{ loadingId === perfilAberto.id_vendedor ? 'Removendo...' : 'Remover da loja' }}
            </button>
            <button class="pm-btn-cancel poppins-medium" @click="fecharPerfil">Fechar</button>
          </div>

          <div style="height: 32px;"></div>
        </div>
      </ion-content>
    </ion-modal>

    <!-- ══ TOASTS ══ -->
    <transition-group name="toast" tag="div" class="toast-container">
      <div v-for="t in toasts" :key="t.id" class="toast-item poppins-medium" :class="t.type">
        <span class="material-symbols-outlined">{{ t.icon }}</span>
        <span>{{ t.msg }}</span>
      </div>
    </transition-group>

  </ion-page>
</template>

<script>
import {
  IonPage,
  IonContent,
  IonModal,
} from '@ionic/vue';
import { api } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import { defineComponent } from 'vue';

const COVER_GRADIENTS = [
  'linear-gradient(135deg, #FF8049 0%, #ff4444 100%)',
  'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
  'linear-gradient(135deg, #16a34a 0%, #0891b2 100%)',
  'linear-gradient(135deg, #ca8a04 0%, #ea580c 100%)',
  'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
  'linear-gradient(135deg, #0891b2 0%, #2563eb 100%)',
  'linear-gradient(135deg, #16a34a 0%, #84cc16 100%)',
  'linear-gradient(135deg, #dc2626 0%, #7c3aed 100%)',
];

export default defineComponent({
  name: 'ExplorarVendedores',
  components: { IonPage, IonContent, IonModal },

  data() {
    return {
      vendedores: [],
      associados: new Set(),
      loading: true,
      loadingId: null,
      busca: '',
      searchFocused: false,
      filtroAtivo: 'todos',
      sortAtivo: 'vendas',
      perfilAberto: null,
      user: null,
      toasts: [],
      _toastId: 0,
      filtros: [
        { key: 'todos',      label: 'Todos',       icon: 'grid_view',    count: 0 },
        { key: 'associados', label: 'Na Loja',      icon: 'storefront',   count: 0 },
        { key: 'disponiveis',label: 'Disponíveis',  icon: 'person_search',count: 0 },
        { key: 'top',        label: 'Top Vendas',   icon: 'workspace_premium', count: 0 },
      ],
      sorts: [
        { key: 'vendas',    label: 'Vendas' },
        { key: 'avaliacao', label: 'Avaliação' },
        { key: 'nome',      label: 'Nome' },
        { key: 'recente',   label: 'Recente' },
      ],
    };
  },

  computed: {
    vendedoresFiltrados() {
      let list = [...this.vendedores];

      if (this.filtroAtivo === 'associados')   list = list.filter(v => this.associados.has(v.id_vendedor));
      if (this.filtroAtivo === 'disponiveis')  list = list.filter(v => !this.associados.has(v.id_vendedor));
      if (this.filtroAtivo === 'top')          list = list.filter(v => v.num_vendas >= 2);

      if (this.busca.trim()) {
        const q = this.busca.toLowerCase();
        list = list.filter(v =>
          v.nome?.toLowerCase().includes(q) ||
          v.nome_usuario?.toLowerCase().includes(q) ||
          v.email?.toLowerCase().includes(q) ||
          v.especialidades?.toLowerCase().includes(q)
        );
      }

      list.sort((a, b) => {
        if (this.sortAtivo === 'nome')      return a.nome.localeCompare(b.nome);
        if (this.sortAtivo === 'vendas')    return b.num_vendas - a.num_vendas;
        if (this.sortAtivo === 'avaliacao') return b.avaliacao_media - a.avaliacao_media;
        if (this.sortAtivo === 'recente')   return Number(b.criado_em) - Number(a.criado_em);
        return 0;
      });

      if (this.filtroAtivo === 'todos' && !this.busca) {
        list.sort((a, b) => {
          const aA = this.associados.has(a.id_vendedor) ? 0 : 1;
          const bA = this.associados.has(b.id_vendedor) ? 0 : 1;
          return aA - bA;
        });
      }

      return list;
    },

    topVendedores() {
      return [...this.vendedores]
        .sort((a, b) => (b.avaliacao_media || 0) - (a.avaliacao_media || 0))
        .slice(0, 8);
    },

    associadosList() {
      return this.vendedores.filter(v => this.associados.has(v.id_vendedor));
    },

    cotacaoRanking() {
      return [...this.vendedores]
        .sort((a, b) => (b.num_cotacoes || 0) - (a.num_cotacoes || 0))
        .slice(0, 5);
    },
  },

  methods: {
    async carregarDados() {
      this.loading = true;
      try {
        const auth = useAuthStore();
        this.user = auth.user
        const [todosRes, lojaRes] = await Promise.all([
          api.post('/mvpu/usuario/buscarVendedor/', {}),
          api.get(`/mvpu/usuario/consultarVendedores/${auth.loja.id_loja}`)
        ]);
        this.vendedores = todosRes.data.data || [];
        const assoc = lojaRes.data.data || [];
        this.associados = new Set(assoc.map(v => v.id_vendedor));
        this.atualizarContagens();
      } catch (e) {
        
        this.toast('Erro ao carregar vendedores', 'error', 'error');
      } finally {
        this.loading = false;
      }
    },

    atualizarContagens() {
      this.filtros[0].count = this.vendedores.length;
      this.filtros[1].count = this.associados.size;
      this.filtros[2].count = this.vendedores.filter(v => !this.associados.has(v.id_vendedor)).length;
      this.filtros[3].count = this.vendedores.filter(v => v.num_vendas >= 2).length;
    },

    async associar(id) {
      this.loadingId = id;
      try {
        const auth = useAuthStore();
        await api.post(`/mvpu/usuario/associarVendedor/${auth.loja.id_loja}`, { id_vendedor: id });
        this.associados = new Set([...this.associados, id]);
        this.atualizarContagens();
        this.toast('Vendedor associado com sucesso!', 'success', 'check_circle');
        if (this.perfilAberto?.id_vendedor === id) this.perfilAberto = { ...this.perfilAberto };
      } catch (e) {
        this.toast('Erro ao associar vendedor', 'error', 'error');
      } finally {
        this.loadingId = null;
      }
    },

    async desassociar(id) {
      this.loadingId = id;
      try {
        const auth = useAuthStore();
        await api.delete(`/mvpu/usuario/desassociarVendedor/${auth.loja.id_loja}`, { data: { id_vendedor: id } });
        const next = new Set(this.associados);
        next.delete(id);
        this.associados = next;
        this.atualizarContagens();
        this.toast('Vendedor removido da loja.', 'info', 'person_remove');
        if (this.perfilAberto?.id_vendedor === id) this.perfilAberto = { ...this.perfilAberto };
      } catch (e) {
        this.toast('Erro ao desassociar vendedor', 'error', 'error');
      } finally {
        this.loadingId = null;
      }
    },

    abrirPerfil(v)  { this.perfilAberto = v; },
    fecharPerfil()  { this.perfilAberto = null; },
    isAssociado(id) { return this.associados.has(id); },

    getInitials(nome) {
      return (nome || '?').split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
    },

    getFotoStyle(url, id) {
      if (url) return { backgroundImage: `url(${url})`, backgroundSize: 'cover', backgroundPosition: 'center' };
      const g = COVER_GRADIENTS[id % COVER_GRADIENTS.length];
      return { background: g };
    },

    getCoverGradient(id) { return COVER_GRADIENTS[id % COVER_GRADIENTS.length]; },

    getEspecialidades(str) {
      return (str || '').split(',').map(s => s.trim()).filter(Boolean);
    },

    formatResposta(val) {
      if (!val || val === '0' || val === '0.0 min.') return 'Imediato';
      return val.includes('min') ? val : val + ' min.';
    },

    formatDate(ts) {
      if (!ts) return '-';
      return new Date(Number(ts)).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' });
    },

    getConversao(v) {
      if (!v.num_cotacoes) return 0;
      return Math.min(100, Math.round((v.num_vendas / v.num_cotacoes) * 100));
    },

    getRespostaPct(val) {
      const n = parseFloat(val) || 0;
      if (n === 0)   return 100;
      if (n <= 10)   return 90;
      if (n <= 30)   return 70;
      if (n <= 60)   return 45;
      return 20;
    },

    getRespostaCor(val) {
      const n = parseFloat(val) || 0;
      if (n === 0 || n <= 10) return '#16a34a';
      if (n <= 30)            return '#FF8049';
      return '#dc2626';
    },

    getRespostaClass(val) {
      const n = parseFloat(val) || 0;
      if (n === 0 || n <= 10) return 'green';
      if (n <= 30)            return 'orange';
      return 'red';
    },

    resetFiltros() { this.busca = ''; this.filtroAtivo = 'todos'; },

    toast(msg, type = 'success', icon = 'check_circle') {
      const id = ++this._toastId;
      this.toasts.push({ id, msg, type, icon });
      setTimeout(() => { this.toasts = this.toasts.filter(t => t.id !== id); }, 3200);
    },
  },

  mounted() { this.carregarDados(); },
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');

/* ══ TOKENS ══ */
.exp-page {
  --accent:   #FF8049;
  --acc-h:    #E8622A;
  --green:    #16a34a;
  --green2:   #dcfce7;
  --blue:     #2563eb;
  --blue2:    #dbeafe;
  --yellow:   #ca8a04;
  --yellow2:  #fef9c3;
  --red:      #dc2626;
  --red2:     #fee2e2;
  --purple:   #7c3aed;
  --purple2:  #ede9fe;
  --orange2:  rgba(255,128,73,0.12);
  --bg:       #FFF;
  --card:     #ffffff;
  --border:   #e2e8f0;
  --text1:    #0f172a;
  --text2:    #475569;
  --muted:    #94a3b8;
  --radius:   18px;
  --radius-s: 12px;
  --radius-xs: 8px;
  font-family: 'Poppins', sans-serif;
}

.poppins-regular  { font-family: 'Poppins', sans-serif; font-weight: 400; }
.poppins-medium   { font-family: 'Poppins', sans-serif; font-weight: 500; }
.poppins-semibold { font-family: 'Poppins', sans-serif; font-weight: 600; }

.exp-page    { background: var(--bg); }
.exp-content { --background: var(--bg); }

/* ══ HERO ══ */
.exp-hero {
  background: #fff;
  padding: 0 0 0 0;
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid var(--border);
}

.hero-bg-orbs {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}
.orb {
  position: absolute;
  border-radius: 50%;
  opacity: 0.07;
}
.orb1 { width: 180px; height: 180px; background: var(--accent); top: -60px; right: -40px; }
.orb2 { width: 120px; height: 120px; background: var(--blue); top: 20px; right: 60px; }
.orb3 { width: 80px; height: 80px; background: var(--purple); bottom: -20px; left: 40px; }

.hero-top {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 16px 10px;
  position: relative;
  z-index: 2;
  padding-top: calc(16px + env(safe-area-inset-top, 0px));
}

.back-btn {
  width: 36px; height: 36px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}
.back-btn .material-symbols-outlined { font-size: 16px; color: var(--text2); }

.hero-brand { flex: 1; }
.hero-eyebrow {
  font-size: 9px;
  letter-spacing: 2px;
  color: var(--accent);
  display: block;
  line-height: 1;
}
.hero-title {
  font-size: 22px;
  color: var(--text1);
  margin: 0;
  line-height: 1.1;
}

.hero-pills { display: flex; gap: 8px; }
.stat-bubble {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px 12px;
  background: var(--bg);
  border-radius: 12px;
  border: 1px solid var(--border);
}
.stat-bubble.accent {
  background: var(--orange2);
  border-color: rgba(255,128,73,0.25);
}
.sb-num { font-size: 16px; color: var(--text1); line-height: 1; }
.stat-bubble.accent .sb-num { color: var(--accent); }
.sb-label { font-size: 9px; color: var(--muted); }

/* Search pill */
.hero-search { padding: 8px 16px 10px; position: relative; z-index: 2; }
.search-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg);
  border: 1.5px solid var(--border);
  border-radius: 50px;
  padding: 10px 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.search-pill.focused {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--orange2);
}
.sp-icon { font-size: 18px; color: var(--muted); flex-shrink: 0; }
.sp-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 13px;
  color: var(--text1);
  outline: none;
}
.sp-input::placeholder { color: var(--muted); }
.sp-clear {
  width: 22px; height: 22px;
  border-radius: 50%;
  background: var(--muted);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.sp-clear .material-symbols-outlined { font-size: 13px; color: #fff; }

/* Filter chips */
.filter-scroll { overflow-x: auto; scrollbar-width: none; }
.filter-scroll::-webkit-scrollbar { display: none; }
.filter-track {
  display: flex;
  gap: 8px;
  padding: 2px 16px 14px;
  width: max-content;
}
.fchip {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 13px;
  border-radius: 50px;
  border: 1.5px solid var(--border);
  background: var(--bg);
  color: var(--text2);
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.18s;
}
.fchip.active {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
  box-shadow: 0 4px 12px rgba(255,128,73,0.3);
}
.fchip-icon { font-size: 14px; }
.fchip-badge {
  background: rgba(255,255,255,0.3);
  border-radius: 50px;
  padding: 1px 6px;
  font-size: 10px;
}
.fchip:not(.active) .fchip-badge {
  background: var(--border);
  color: var(--muted);
}

/* ══ LOADING SKELETON ══ */
.loading-screen { padding: 16px; }
.loading-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.skeleton-card {
  background: var(--card);
  border-radius: var(--radius);
  overflow: hidden;
  animation: shimmer 1.4s infinite;
}
.skel-cover { height: 80px; background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%); background-size: 200% 100%; }
.skel-body { padding: 36px 12px 12px; }
.skel-avatar { width: 48px; height: 48px; border-radius: 50%; background: #e2e8f0; margin-bottom: 8px; }
.skel-line { height: 10px; border-radius: 5px; background: #e2e8f0; margin-bottom: 6px; }
.skel-line.w70 { width: 70%; }
.skel-line.w45 { width: 45%; }
.skel-line.w85 { width: 85%; }
@keyframes shimmer { 0% { opacity: 1; } 50% { opacity: 0.6; } 100% { opacity: 1; } }

/* ══ EMPTY ══ */
.empty-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 32px;
  text-align: center;
  gap: 8px;
}
.empty-icon {
  width: 72px; height: 72px;
  border-radius: 50%;
  background: var(--bg);
  border: 2px dashed var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}
.empty-icon .material-symbols-outlined { font-size: 32px; color: var(--muted); }
.empty-screen h3 { font-size: 16px; color: var(--text1); margin: 0; }
.empty-screen p { font-size: 13px; color: var(--muted); margin: 0; }
.btn-reset {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 10px 20px;
  border-radius: 50px;
  border: 1.5px solid var(--accent);
  background: transparent;
  color: var(--accent);
  font-size: 13px;
  cursor: pointer;
}

/* ══ BODY ══ */
.exp-body { padding-top: 4px; }

/* ══ SECTION ══ */
.section { padding: 16px 0 4px; }
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px 10px;
}
.sh-left { display: flex; align-items: center; gap: 7px; }
.sh-icon { font-size: 18px; }
.sh-icon.accent  { color: var(--accent); }
.sh-icon.green   { color: var(--green); }
.sh-icon.blue    { color: var(--blue); }
.sh-icon.purple  { color: var(--purple); }
.sh-title { font-size: 15px; color: var(--text1); }
.sh-sub { font-size: 11px; color: var(--muted); }

/* ══ CAROUSEL (destaque) ══ */
.carousel { overflow-x: auto; scrollbar-width: none; }
.carousel::-webkit-scrollbar { display: none; }
.carousel-track {
  display: flex;
  gap: 12px;
  padding: 0 16px 8px;
  width: max-content;
}

/* DEST CARD */
.dest-card {
  width: 150px;
  background: var(--card);
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  flex-shrink: 0;
  border: 1.5px solid transparent;
}
.dest-card:active { transform: scale(0.97); }

.dc-cover {
  height: 72px;
  position: relative;
  overflow: hidden;
}
.dc-cover-pattern {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, rgba(255,255,255,0.18) 1px, transparent 1px);
  background-size: 14px 14px;
}
.dc-badge-assoc {
  position: absolute;
  top: 8px; right: 8px;
  width: 20px; height: 20px;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dc-badge-assoc .material-symbols-outlined { font-size: 12px; color: var(--green); }
.dc-star-badge {
  position: absolute;
  bottom: 6px; left: 6px;
  background: rgba(0,0,0,0.35);
  backdrop-filter: blur(4px);
  border-radius: 20px;
  padding: 2px 8px;
  font-size: 10px;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 3px;
}
.dc-star-badge .material-symbols-outlined { font-size: 11px; color: #fbbf24; }

.dc-avatar-wrap {
  position: relative;
  margin: -22px 0 0 10px;
  width: fit-content;
}
.dc-avatar {
  width: 44px; height: 44px;
  border-radius: 50%;
  border: 2.5px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.dc-initials { font-size: 14px; color: #fff; }
.dc-status {
  position: absolute;
  bottom: 1px; right: 1px;
  width: 11px; height: 11px;
  border-radius: 50%;
  border: 2px solid #fff;
}
.dc-status.live { background: #10b981; }
.dc-status.off  { background: var(--muted); }

.dc-info { padding: 6px 10px 10px; }
.dc-name { font-size: 13px; color: var(--text1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dc-user { font-size: 10px; color: var(--muted); }
.dc-metrics {
  display: flex;
  gap: 8px;
  margin: 6px 0;
}
.dcm {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  color: var(--text2);
}
.dcm .material-symbols-outlined { font-size: 12px; color: var(--muted); }

.dc-btn {
  width: 100%;
  padding: 7px 0;
  border-radius: 50px;
  border: none;
  background: var(--accent);
  color: #fff;
  font-size: 11px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all 0.18s;
}
.dc-btn .material-symbols-outlined { font-size: 13px; }
.dc-btn.assoc {
  background: var(--green2);
  color: var(--green);
  border: 1px solid rgba(22,163,74,0.25);
}

/* MINI CARD (associados) */
.mini-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  flex-shrink: 0;
  width: 72px;
}
.mc-avatar {
  width: 60px; height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  border: 2.5px solid var(--accent);
  box-shadow: 0 0 0 2px var(--orange2);
}
.mc-initials { font-size: 18px; color: #fff; }
.mc-status {
  position: absolute;
  bottom: 2px; right: 2px;
  width: 12px; height: 12px;
  border-radius: 50%;
  border: 2px solid #fff;
}
.mc-status.live { background: #10b981; }
.mc-name { font-size: 11px; color: var(--text1); text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; }
.mc-sub { font-size: 9px; color: var(--muted); text-align: center; }

/* COTAÇÃO LIST */
.cotacao-list {
  margin: 0 16px;
  background: var(--card);
  border-radius: var(--radius);
  overflow: hidden;
  border: 1px solid var(--border);
}
.cot-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid var(--border);
}
.cot-row:last-child { border-bottom: none; }
.cot-row:active { background: var(--bg); }

.cot-rank { font-size: 16px; width: 28px; text-align: center; flex-shrink: 0; }
.cot-rank.gold { color: #ca8a04; }
.cot-avatar {
  width: 38px; height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}
.cot-info { flex: 1; min-width: 0; }
.cot-name { font-size: 13px; color: var(--text1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cot-sub { font-size: 10px; color: var(--muted); }
.cot-stats { text-align: right; flex-shrink: 0; }
.cot-val { font-size: 15px; color: var(--text1); line-height: 1; }
.cot-lbl { font-size: 9px; color: var(--muted); }
.cot-conv {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 20px;
  flex-shrink: 0;
}
.cot-conv.green  { background: var(--green2); color: var(--green); }
.cot-conv.orange { background: var(--orange2); color: var(--accent); }

/* ══ SORT ROW ══ */
.sort-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px 4px;
}
.sort-lbl { font-size: 12px; color: var(--muted); }
.sort-chips { display: flex; gap: 6px; flex-wrap: nowrap; overflow-x: auto; }
.schip {
  padding: 5px 12px;
  border-radius: 50px;
  border: 1.5px solid var(--border);
  background: var(--card);
  color: var(--text2);
  font-size: 11px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.18s;
}
.schip.active {
  background: var(--text1);
  border-color: var(--text1);
  color: #fff;
}

/* Inline sort (na section-header) */
.sort-inline { display: flex; gap: 5px; }
.schip-sm {
  padding: 4px 10px;
  border-radius: 50px;
  border: 1.5px solid var(--border);
  background: var(--card);
  color: var(--text2);
  font-size: 10px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.18s;
}
.schip-sm.active {
  background: var(--text1);
  border-color: var(--text1);
  color: #fff;
}

/* ══ GRID CARDS ══ */
.grid-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 4px 16px 8px;
}
.grid-card {
  background: var(--card);
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  cursor: pointer;
  transition: transform 0.18s, box-shadow 0.18s;
  border: 1.5px solid transparent;
  position: relative;
}
.grid-card.wide { grid-column: span 2; }
.grid-card.associated { border-color: rgba(22,163,74,0.3); }
.grid-card:active { transform: scale(0.98); box-shadow: 0 1px 6px rgba(0,0,0,0.08); }

.gc-cover {
  height: 60px;
  position: relative;
  overflow: hidden;
}
.grid-card.wide .gc-cover { height: 80px; }
.gc-pattern {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px);
  background-size: 12px 12px;
}
.gc-ribbon {
  position: absolute;
  top: 8px; left: 8px;
  background: var(--green);
  color: #fff;
  border-radius: 20px;
  padding: 2px 7px;
  font-size: 9px;
  display: flex;
  align-items: center;
  gap: 2px;
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
}
.gc-status {
  position: absolute;
  top: 8px; right: 8px;
  width: 10px; height: 10px;
  border-radius: 50%;
  border: 1.5px solid rgba(255,255,255,0.6);
}
.gc-status.live { background: #10b981; }
.gc-status.off  { background: rgba(255,255,255,0.4); }

.gc-avatar-wrap { margin: 0px 0 0 10px; }
.gc-avatar {
  width: 50px; height: 50px;
  border-radius: 50%;
  border: 2px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}
.gc-initials { font-size: 13px; color: #fff; }

.gc-body { padding: 4px 10px 10px; }
.gc-name { font-size: 13px; color: var(--text1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.gc-user { font-size: 10px; color: var(--muted); }
.gc-city {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 10px;
  color: var(--muted);
  margin-top: 2px;
}

.gc-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; }
.gtag {
  padding: 2px 8px;
  background: var(--bg);
  border-radius: 20px;
  font-size: 9px;
  color: var(--text2);
  border: 1px solid var(--border);
}

.gc-metrics {
  display: flex;
  gap: 6px;
  margin: 8px 0 6px;
  flex-wrap: wrap;
}
.gm {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  color: var(--text2);
}
.gm .material-symbols-outlined { font-size: 11px; color: var(--accent); }

.gc-action {
  display: flex;
  gap: 6px;
  margin-top: 6px;
}
.gc-btn-assoc {
  flex: 1;
  padding: 7px 0;
  border-radius: 50px;
  border: none;
  background: var(--accent);
  color: #fff;
  font-size: 11px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  box-shadow: 0 3px 10px rgba(255,128,73,0.3);
  transition: all 0.18s;
}
.gc-btn-assoc .material-symbols-outlined { font-size: 13px; }
.gc-btn-assoc:active { transform: scale(0.97); }

.gc-btn-desassoc {
  flex: 1;
  padding: 7px 0;
  border-radius: 50px;
  border: 1px solid rgba(22,163,74,0.3);
  background: var(--green2);
  color: var(--green);
  font-size: 11px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all 0.18s;
}
.gc-btn-desassoc .material-symbols-outlined { font-size: 13px; }

.gc-btn-perfil {
  width: 32px; height: 32px;
  border-radius: 50%;
  border: 1.5px solid var(--border);
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}
.gc-btn-perfil .material-symbols-outlined { font-size: 14px; color: var(--text2); }

/* Skill tags */
.skill-tag {
  padding: 3px 10px;
  background: var(--orange2);
  border-radius: 20px;
  font-size: 10px;
  color: var(--accent);
  border: 1px solid rgba(255,128,73,0.2);
}

/* ══ MODAL ══ */
.perfil-modal {
  --border-radius: 24px 24px 0 0;
  --height: 92%;
  align-items: flex-end;
}

.modal-ion-content { --background: var(--bg); }
.pm-wrap { background: var(--bg); }

.pm-cover {
  height: 140px;
  position: relative;
  overflow: hidden;
}
.pm-cover-pattern {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px);
  background-size: 18px 18px;
}
.pm-cover-grad {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.12) 100%);
}
.pm-handle {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 36px; height: 4px;
  background: rgba(255,255,255,0.5);
  border-radius: 2px;
}
.pm-close {
  position: absolute;
  top: 24px; right: 16px;
  width: 32px; height: 32px;
  border-radius: 50%;
  background: rgba(0,0,0,0.25);
  backdrop-filter: blur(4px);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.pm-close .material-symbols-outlined { font-size: 16px; color: #fff; }

.pm-avatar-float {
  position: relative;
  margin: -36px 0 0 20px;
  width: fit-content;
  z-index: 2;
}
.pm-avatar {
  width: 72px; height: 72px;
  border-radius: 50%;
  border: 3px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
}
.pm-initials { font-size: 24px; color: #fff; }
.pm-status-dot {
  position: absolute;
  bottom: 3px; right: 3px;
  width: 16px; height: 16px;
  border-radius: 50%;
  border: 2.5px solid #fff;
}
.pm-status-dot.live { background: #10b981; }
.pm-status-dot.off  { background: var(--muted); }

.pm-identity {
  padding: 10px 20px 16px;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
}
.pm-badges-row { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
.pm-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 10px;
}
.pm-badge .material-symbols-outlined { font-size: 10px; }
.pm-badge.green  { background: var(--green2); color: var(--green); }
.pm-badge.orange { background: var(--orange2); color: var(--accent); }
.pm-badge.blue   { background: var(--blue2); color: var(--blue); }
.pm-name { font-size: 20px; color: var(--text1); margin: 0; }
.pm-user { font-size: 12px; color: var(--muted); margin-top: 2px; }
.pm-city {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text2);
  margin-top: 4px;
}
.pm-city .material-symbols-outlined { font-size: 13px; color: var(--muted); }

.pm-section {
  background: var(--card);
  margin: 10px 16px;
  border-radius: var(--radius);
  padding: 14px 16px;
  border: 1px solid var(--border);
}
.pm-sec-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.7px;
  margin-bottom: 12px;
}
.pm-sec-title .material-symbols-outlined { font-size: 15px; color: var(--accent); }

.pm-bio { font-size: 13px; color: var(--text2); line-height: 1.65; margin: 0; }

/* KPI grid no modal */
.pm-kpi-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.pm-kpi {
  border-radius: var(--radius-s);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  border: 1px solid transparent;
}
.pm-kpi .material-symbols-outlined { font-size: 20px; margin-bottom: 2px; }
.pm-kpi.orange { background: var(--yellow2); border-color: rgba(202,138,4,0.15); }
.pm-kpi.orange .material-symbols-outlined { color: var(--yellow); }
.pm-kpi.green  { background: var(--green2); border-color: rgba(22,163,74,0.15); }
.pm-kpi.green  .material-symbols-outlined { color: var(--green); }
.pm-kpi.blue   { background: var(--blue2); border-color: rgba(37,99,235,0.15); }
.pm-kpi.blue   .material-symbols-outlined { color: var(--blue); }
.pm-kpi.purple { background: var(--purple2); border-color: rgba(124,58,237,0.15); }
.pm-kpi.purple .material-symbols-outlined { color: var(--purple); }
.pk-val   { font-size: 18px; color: var(--text1); line-height: 1; }
.pk-label { font-size: 11px; color: var(--text2); }
.pk-sub   { font-size: 10px; color: var(--muted); }

/* Performance bars no modal */
.pm-perf { display: flex; flex-direction: column; gap: 12px; }
.pp-item {}
.pp-head { display: flex; justify-content: space-between; margin-bottom: 5px; }
.pp-label { font-size: 12px; color: var(--text2); }
.pp-val { font-size: 12px; }
.pp-val.green  { color: var(--green); }
.pp-val.orange { color: var(--accent); }
.pp-val.red    { color: var(--red); }
.pp-bar { height: 6px; background: var(--bg); border-radius: 3px; overflow: hidden; }
.pp-fill { height: 100%; border-radius: 3px; background: var(--accent); transition: width 0.6s ease; }
.pp-fill.green  { background: var(--green); }
.pp-fill.orange { background: var(--accent); }

/* Tags no modal */
.pm-tags { display: flex; flex-wrap: wrap; gap: 6px; }

/* Contato no modal */
.pm-contact { display: flex; flex-direction: column; gap: 10px; }
.pmc-row { display: flex; align-items: center; gap: 10px; }
.pmc-icon-wrap {
  width: 32px; height: 32px;
  border-radius: var(--radius-xs);
  background: var(--bg);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.pmc-icon-wrap .material-symbols-outlined { font-size: 15px; color: var(--muted); }
.pmc-row span.poppins-regular { font-size: 13px; color: var(--text2); }

/* Ação modal */
.pm-action {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 4px 16px 10px;
}
.pm-btn-assoc {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 15px 20px;
  border-radius: var(--radius);
  border: none;
  font-size: 14px;
  cursor: pointer;
  width: 100%;
  background: var(--accent);
  color: #fff;
  box-shadow: 0 4px 16px rgba(255,128,73,0.35);
  transition: all 0.18s;
}
.pm-btn-assoc .material-symbols-outlined { font-size: 18px; }
.pm-btn-assoc:active { background: var(--acc-h); }

.pm-btn-desassoc {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 15px 20px;
  border-radius: var(--radius);
  border: 1px solid rgba(220,38,38,0.25);
  font-size: 14px;
  cursor: pointer;
  width: 100%;
  background: var(--red2);
  color: var(--red);
  transition: all 0.18s;
}
.pm-btn-desassoc .material-symbols-outlined { font-size: 18px; }

.pm-btn-cancel {
  padding: 13px 20px;
  border-radius: var(--radius);
  background: var(--card);
  border: 1px solid var(--border);
  color: var(--text2);
  font-size: 14px;
  cursor: pointer;
  width: 100%;
  transition: all 0.18s;
}

/* ══ TOASTS ══ */
.toast-container {
  position: fixed;
  bottom: 24px;
  left: 16px;
  right: 16px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}
.toast-item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 13px 16px;
  border-radius: var(--radius);
  font-size: 13px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  pointer-events: auto;
}
.toast-item .material-symbols-outlined { font-size: 18px; }
.toast-item.success { background: #10b981; color: #fff; }
.toast-item.info    { background: #2563eb; color: #fff; }
.toast-item.error   { background: #ef4444; color: #fff; }

.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from { opacity: 0; transform: translateY(20px); }
.toast-leave-to   { opacity: 0; transform: translateY(20px); }

/* Fade transition */
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>