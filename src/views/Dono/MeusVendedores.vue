<template>
  <ion-page class="me-page">
    <ion-content :fullscreen="true" class="me-content">

      <RefresherIonic />

      <!-- ══ HEADER ══ -->
      <div class="cc-header">
        <div class="cc-header-left">
          <button class="back-btn" @click="$router.back()">
            <span class="material-symbols-outlined">arrow_back_ios_new</span>
          </button>
          <div class="cotacao-identity">
            <span class="cotacao-label">EQUIPE</span>
            <span class="cotacao-name">Minha Equipe</span>
          </div>
        </div>
        <div class="cc-header-right">
          <span class="team-count poppins-semibold">{{ vendedores.length }}</span>
          <span class="team-count-label poppins-regular">vendedor{{ vendedores.length !== 1 ? 'es' : '' }}</span>
        </div>
      </div>

      <!-- ══ SEARCH ══ -->
      <div class="search-bar-wrap">
        <div class="search-wrap">
          <span class="material-symbols-outlined sb-icon">search</span>
          <input
            type="text"
            v-model="filtro"
            placeholder="Pesquisar na minha equipe..."
            class="sb-input poppins-regular"
          />
          <button v-if="filtro" class="sb-clear" @click="filtro = ''">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>

      <!-- ══ LOADING ══ -->
      <div v-if="loading" class="loading-state">
        <ion-spinner name="crescent" color="primary"></ion-spinner>
        <p class="poppins-regular">Carregando sua equipe...</p>
      </div>

      <!-- ══ VAZIO ══ -->
      <div v-else-if="vendedoresFiltrados.length === 0" class="empty-state">
        <div class="empty-icon-wrap">
          <span class="material-symbols-outlined">group_off</span>
        </div>
        <h3 class="poppins-semibold">
          {{ filtro ? 'Nenhum resultado' : 'Equipe vazia' }}
        </h3>
        <p class="poppins-regular">
          {{ filtro
              ? 'Nenhum vendedor encontrado para "' + filtro + '".'
              : 'Você ainda não possui vendedores associados.' }}
        </p>
        <button v-if="filtro" class="btn-limpar poppins-medium" @click="filtro = ''">
          <span class="material-symbols-outlined">refresh</span>
          Limpar pesquisa
        </button>
      </div>

      <!-- ══ LISTA ══ -->
      <div v-else class="tab-pane">
        <div class="vendedores-list-mobile" style="margin-bottom: 120px;">
          <div
            v-for="v in vendedoresFiltrados"
            :key="v.id_vendedor"
            class="vendedor-card-mobile"
          >
            <!-- Linha principal: avatar + info + ação -->
            <div class="vc-main">

              <!-- Avatar -->
              <div class="vc-avatar">
                <img v-if="v.foto_perfil" :src="v.foto_perfil" :alt="v.nome" />
                <span v-else class="vc-initials poppins-semibold">{{ initials(v.nome) }}</span>
                <span :class="['vc-status', v.status_conta === 'ativo' ? 'ativo' : 'inativo']"></span>
              </div>

              <!-- Info -->
              <div class="vc-info">
                <span class="vc-name poppins-semibold">{{ v.nome }}</span>
                <span class="vc-user muted poppins-regular">@{{ v.nome_usuario }}</span>
                <span class="vc-email muted poppins-regular">{{ v.email }}</span>
                <div class="vc-location poppins-regular">
                  <span class="material-symbols-outlined" style="font-size:11px">location_on</span>
                  {{ v.cidade }} — {{ v.estado }}
                </div>
              </div>

              <!-- Status tag + expand -->
              <div class="vc-right">
                <div :class="['status-pill', v.status_conta === 'ativo' ? 'status-aberta' : 'status-fechada']">
                  <span class="status-dot"></span>
                  {{ v.status_conta === 'ativo' ? 'Ativo' : 'Inativo' }}
                </div>
                <button
                  :class="['expand-btn', { open: expandedId === v.id_vendedor }]"
                  @click="toggleExpand(v.id_vendedor)"
                >
                  <span class="material-symbols-outlined">expand_more</span>
                </button>
              </div>
            </div>

            <!-- Linha de stats rápidos -->
            <div class="vc-stats-row">
              <div class="vc-stat">
                <b class="poppins-semibold">{{ v.num_cotacoes }}</b>
                <span class="poppins-regular">Cotações</span>
              </div>
              <div class="vc-stat-sep"></div>
              <div class="vc-stat">
                <b class="poppins-semibold">{{ v.num_vendas }}</b>
                <span class="poppins-regular">Vendas</span>
              </div>
              <div class="vc-stat-sep"></div>
              <div class="vc-stat">
                <b class="poppins-semibold">{{ v.num_produtos }}</b>
                <span class="poppins-regular">Produtos</span>
              </div>
              <div class="vc-stat-sep"></div>
              <div class="vc-stat">
                <b class="poppins-semibold">{{ v.avaliacao_media || 0 }} ⭐</b>
                <span class="poppins-regular">Avaliação</span>
              </div>
            </div>

            <!-- Expansão (equivalente ao #expansion do DataTable) -->
            <transition name="expand">
              <div v-if="expandedId === v.id_vendedor" class="vc-detalhes">
                <div class="detalhes-grid">
                  <div class="detalhe-stat">
                    <span class="detalhe-label poppins-regular">Produtos</span>
                    <span class="detalhe-val poppins-semibold">{{ v.num_produtos }}</span>
                  </div>
                  <div class="detalhe-stat">
                    <span class="detalhe-label poppins-regular">Vendas</span>
                    <span class="detalhe-val poppins-semibold">{{ v.num_vendas }}</span>
                  </div>
                  <div class="detalhe-stat">
                    <span class="detalhe-label poppins-regular">Cotações</span>
                    <span class="detalhe-val poppins-semibold">{{ v.num_cotacoes }}</span>
                  </div>
                  <div class="detalhe-stat">
                    <span class="detalhe-label poppins-regular">Avaliação Média</span>
                    <span class="detalhe-val poppins-semibold">{{ v.avaliacao_media || 0 }} ⭐</span>
                  </div>
                </div>
                <div class="detalhe-especialidades">
                  <span class="detalhe-label poppins-regular">Especialidades</span>
                  <div class="esp-tags">
                    <template v-if="v.especialidades">
                      <span
                        v-for="tag in getEspecialidades(v.especialidades)"
                        :key="tag"
                        class="esp-tag poppins-medium"
                      >{{ tag }}</span>
                    </template>
                    <span v-else class="muted poppins-regular" style="font-size:13px">Não informada</span>
                  </div>
                </div>
                <!-- Botão Remover na expansão -->
                <div class="detalhe-action">
                  <button
                    class="action-btn btn-danger-outline poppins-medium"
                    @click="abrirConfirmacao(v)"
                  >
                    <span class="material-symbols-outlined">person_remove</span>
                    Remover Vendedor
                  </button>
                </div>
              </div>
            </transition>

          </div>
        </div>
      </div>

      <div style="height: 40px;"></div>

    </ion-content>

    <!-- ══ MODAL CONFIRMAÇÃO DE REMOÇÃO ══ -->
    <ion-modal
      :is-open="displayConfirmation"
      @did-dismiss="displayConfirmation = false"
      class="bottom-sheet"
    >
      <ion-content class="modal-content">
        <div class="modal-handle"></div>
        <div class="modal-box">

          <div class="modal-header">
            <span class="poppins-semibold">Confirmar Remoção</span>
            <button class="modal-close" @click="displayConfirmation = false">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <div class="modal-body" v-if="vendedorParaRemover">

            <!-- Preview do vendedor -->
            <div class="confirm-vendedor-row">
              <div class="confirm-avatar">
                <img
                  v-if="vendedorParaRemover.foto_perfil"
                  :src="vendedorParaRemover.foto_perfil"
                  :alt="vendedorParaRemover.nome"
                />
                <span v-else class="confirm-initials poppins-semibold">
                  {{ initials(vendedorParaRemover.nome) }}
                </span>
              </div>
              <div>
                <div class="poppins-semibold" style="font-size:14px;color:#1e293b">
                  {{ vendedorParaRemover.nome }}
                </div>
                <div class="poppins-regular" style="font-size:12px;color:#94a3b8">
                  @{{ vendedorParaRemover.nome_usuario }}
                </div>
              </div>
            </div>

            <!-- Aviso -->
            <div class="confirm-warning">
              <span class="material-symbols-outlined warn-icon">warning</span>
              <p class="poppins-regular">
                Deseja realmente remover
                <strong>{{ vendedorParaRemover.nome }}</strong>
                da sua equipe? Ele não terá mais acesso às suas cotações.
              </p>
            </div>

          </div>

          <div class="modal-footer">
            <button
              class="action-btn btn-outline poppins-medium full-w"
              @click="displayConfirmation = false"
              :disabled="loadingRemocao"
            >
              Cancelar
            </button>
            <button
              class="action-btn btn-danger poppins-medium full-w"
              @click="desassociarVendedor"
              :disabled="loadingRemocao"
            >
              <span class="material-symbols-outlined">
                {{ loadingRemocao ? 'hourglass_empty' : 'check' }}
              </span>
              {{ loadingRemocao ? 'Removendo...' : 'Sim, Remover' }}
            </button>
          </div>

        </div>
      </ion-content>
    </ion-modal>

    <!-- ══ TOASTS ══ -->
    <transition-group name="toast" tag="div" class="toast-container">
      <div
        v-for="t in toasts"
        :key="t.id"
        :class="['toast-item', 'poppins-medium', t.type]"
      >
        <span class="material-symbols-outlined">{{ t.icon }}</span>
        <span>{{ t.msg }}</span>
      </div>
    </transition-group>

  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import {
  IonPage,
  IonContent,
  IonSpinner,
  IonModal,
} from '@ionic/vue'
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import exibeErro from '@/utils/ExibeErro'
import RefresherIonic from '@/components/refresherIonic.vue'

export default defineComponent({
  name: 'MinhaEquipeMobile',

  components: { IonPage, IonContent, IonSpinner, IonModal, RefresherIonic },

  data() {
    return {
      vendedores: [] as any[],
      loading: false,
      filtro: '',

      expandedId: null as number | null,

      // Modal de confirmação
      displayConfirmation: false,
      vendedorParaRemover: null as any,
      loadingRemocao: false,

      // Toasts
      toasts: [] as any[],
      toastId: 0,

      auth: null as any,
    }
  },

  computed: {
    vendedoresFiltrados(): any[] {
      if (!this.filtro) return this.vendedores
      const termo = this.filtro.toLowerCase()
      return this.vendedores.filter(v =>
        v.nome?.toLowerCase().includes(termo) ||
        v.nome_usuario?.toLowerCase().includes(termo)
      )
    },
  },

  methods: {
    // ─── CARREGAR ────────────────────────────────────────────────
    async getVendedoresDaLoja() {
      try {
        this.loading = true
        this.auth = useAuthStore()
        const res = await api.get(`/mvpu/usuario/consultarVendedores/${this.auth.loja.id_loja}`)
        this.vendedores = res.data.data || []
      } catch (e) {
        exibeErro(e, this.$toast)
        this.toast('Erro ao carregar a equipe', 'error', 'error')
      } finally {
        this.loading = false
      }
    },

    // ─── EXPANSÃO ────────────────────────────────────────────────
    toggleExpand(id: number) {
      this.expandedId = this.expandedId === id ? null : id
    },

    // ─── REMOÇÃO ─────────────────────────────────────────────────
    abrirConfirmacao(vendedor: any) {
      this.vendedorParaRemover = vendedor
      this.displayConfirmation = true
    },

    async desassociarVendedor() {
      if (!this.vendedorParaRemover) return
      try {
        this.loadingRemocao = true
        await api.delete(
          `/mvpu/usuario/desassociarVendedor/${this.auth.loja.id_loja}`,
          { data: { id_vendedor: this.vendedorParaRemover.id_vendedor } }
        )
        // Remove da lista local sem novo GET (igual ao original)
        this.vendedores = this.vendedores.filter(
          v => v.id_vendedor !== this.vendedorParaRemover.id_vendedor
        )
        this.displayConfirmation = false
        this.expandedId = null
        this.toast('Vendedor removido da equipe.', 'success', 'check_circle')
      } catch (e) {
        exibeErro(e, this.$toast)
        this.toast('Erro ao remover vendedor', 'error', 'error')
      } finally {
        this.loadingRemocao = false
        this.vendedorParaRemover = null
      }
    },

    // ─── UTILS ───────────────────────────────────────────────────
    initials(nome: string): string {
      return (nome || '?').split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()
    },

    getEspecialidades(str: string): string[] {
      return (str || '').split(',').map((s: string) => s.trim()).filter(Boolean)
    },

    toast(msg: string, type = 'success', icon = 'check_circle') {
      const id = ++this.toastId
      this.toasts.push({ id, msg, type, icon })
      setTimeout(() => {
        this.toasts = this.toasts.filter((t: any) => t.id !== id)
      }, 3500)
    },
  },

  mounted() {
    this.getVendedoresDaLoja()
  },
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');

/* ══ PAGE ══ */
.me-page    { background: #f8fafc; }
.me-content { --background: #f8fafc; }

.poppins-regular  { font-family: 'Poppins', sans-serif; font-weight: 400; }
.poppins-medium   { font-family: 'Poppins', sans-serif; font-weight: 500; }
.poppins-semibold { font-family: 'Poppins', sans-serif; font-weight: 600; }
.muted            { color: #94a3b8; }

/* ══ HEADER (idêntico ao CotacaoConsole) ══ */
.cc-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 24px 16px 12px;
  background: #fff;
  border-bottom: 1px solid #f1f5f9;
}
.cc-header-left  { display: flex; align-items: center; gap: 10px; }
.cc-header-right { display: flex; align-items: center; gap: 5px; }

.back-btn {
  width: 34px; height: 34px;
  background: rgba(255,128,73,.1);
  border: none; border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  color: #ff8049; flex-shrink: 0; cursor: pointer;
}
.back-btn span { font-size: 18px; }

.cotacao-identity { display: flex; flex-direction: column; }
.cotacao-label {
  font-size: 9px; font-weight: 700; letter-spacing: .1em;
  color: #ff8049; text-transform: uppercase;
  font-family: 'Poppins', sans-serif;
}
.cotacao-name {
  font-size: 15px; font-weight: 700; color: #1e293b; line-height: 1.2;
  font-family: 'Poppins', sans-serif;
}

.team-count {
  font-size: 18px; color: #ff8049; line-height: 1;
  font-family: 'Poppins', sans-serif;
}
.team-count-label {
  font-size: 11px; color: #94a3b8;
  font-family: 'Poppins', sans-serif;
}

/* ══ SEARCH (idêntico ao CotacaoConsole) ══ */
.search-bar-wrap {
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #f1f5f9;
}
.search-wrap {
  display: flex; align-items: center; gap: 7px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 9px 12px;
}
.sb-icon   { font-size: 17px; color: #94a3b8; flex-shrink: 0; }
.sb-input  {
  flex: 1; border: none; background: transparent;
  font-size: 13px; color: #334155; outline: none;
  font-family: 'Poppins', sans-serif;
}
.sb-input::placeholder { color: #cbd5e1; }
.sb-clear  { background: none; border: none; padding: 0; display: flex; align-items: center; cursor: pointer; }
.sb-clear span { font-size: 16px; color: #cbd5e1; }

/* ══ STATUS PILL (idêntico ao CotacaoConsole) ══ */
.status-pill {
  display: flex; align-items: center; gap: 4px;
  padding: 3px 8px; border-radius: 20px; font-size: 10px;
  font-family: 'Poppins', sans-serif; font-weight: 500;
  white-space: nowrap;
}
.status-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.status-aberta { background: rgba(16,185,129,.15); color: #059669; }
.status-aberta .status-dot { background: #10b981; }
.status-fechada { background: rgba(0,0,0,.08); color: #64748b; }
.status-fechada .status-dot { background: #94a3b8; }

/* ══ LOADING / EMPTY (idêntico ao CotacaoConsole) ══ */
.loading-state, .empty-state {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 60px 20px;
  text-align: center; gap: 10px;
}
.loading-state p { font-size: 13px; color: #94a3b8; margin: 6px 0 0; }
.empty-icon-wrap {
  width: 64px; height: 64px;
  background: #f8fafc;
  border: 2px dashed #e2e8f0;
  border-radius: 20px;
  display: flex; align-items: center; justify-content: center;
}
.empty-icon-wrap span { font-size: 28px; color: #cbd5e1; }
.empty-state h3 { font-size: 15px; color: #334155; margin: 0; }
.empty-state p  { font-size: 13px; color: #94a3b8; margin: 0; max-width: 240px; line-height: 1.5; }
.btn-limpar {
  display: flex; align-items: center; gap: 6px;
  padding: 9px 18px; border-radius: 10px;
  border: 1px solid #e2e8f0; background: #fff;
  color: #64748b; font-size: 13px; cursor: pointer;
  font-family: 'Poppins', sans-serif; margin-top: 4px;
}
.btn-limpar span { font-size: 16px; }

/* ══ TAB PANE (idêntico ao CotacaoConsole) ══ */
.tab-pane {
  padding: 14px 14px 120px;
  animation: fadeIn .2s ease;
}
@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }

/* ══ LISTA DE VENDEDORES (baseado em .vendedores-list-mobile do CotacaoConsole) ══ */
.vendedores-list-mobile { display: flex; flex-direction: column; gap: 10px; }

.vendedor-card-mobile {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,.04);
}

/* ── Linha principal ── */
.vc-main {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 14px 14px 0 14px;
}

/* Avatar (idêntico ao CotacaoConsole) */
.vc-avatar { position: relative; flex-shrink: 0; }
.vc-avatar img  { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; }
.vc-initials {
  width: 44px; height: 44px; border-radius: 50%;
  background: rgba(255,128,73,.1); color: #ff8049;
  display: flex; align-items: center; justify-content: center;
  font-size: 15px; font-family: 'Poppins', sans-serif;
}
.vc-status {
  position: absolute; bottom: 1px; right: 1px;
  width: 11px; height: 11px; border-radius: 50%; border: 2px solid #fff;
}
.vc-status.ativo   { background: #10b981; }
.vc-status.inativo { background: #9ca3af; }

/* Info */
.vc-info {
  display: flex; flex-direction: column; gap: 1px;
  flex: 1; min-width: 0;
}
.vc-name  { font-size: 13px; color: #1e293b; }
.vc-user  { font-size: 11px; }
.vc-email { font-size: 11px; }
.vc-location {
  display: flex; align-items: center; gap: 3px;
  font-size: 11px; color: #94a3b8; margin-top: 3px;
}

/* Right: status + expand */
.vc-right {
  display: flex; flex-direction: column; align-items: flex-end;
  gap: 6px; flex-shrink: 0;
}
.expand-btn {
  background: none; border: none; cursor: pointer;
  color: #94a3b8; display: flex; align-items: center;
  padding: 0; transition: transform .25s;
}
.expand-btn span { font-size: 22px; }
.expand-btn.open { transform: rotate(180deg); }

/* ── Stats rápidos ── */
.vc-stats-row {
  display: flex; align-items: center;
  margin: 10px 14px 14px;
  background: #f8fafc;
  border-radius: 10px;
  padding: 9px 12px;
  gap: 0;
}
.vc-stat {
  display: flex; flex-direction: column; align-items: center;
  gap: 1px; flex: 1;
}
.vc-stat b    { font-size: 13px; color: #ff8049; font-family: 'Poppins', sans-serif; }
.vc-stat span { font-size: 9px; color: #94a3b8; text-transform: uppercase; letter-spacing: .4px; }
.vc-stat-sep  { width: 1px; height: 26px; background: #e2e8f0; flex-shrink: 0; }

/* ── Expansão (equivale ao #expansion do PrimeVue DataTable) ── */
.vc-detalhes {
  border-top: 1px solid #f1f5f9;
  padding: 14px;
  background: #fcfcfd;
}

.detalhes-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 14px;
}
.detalhe-stat {
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 10px;
  padding: 10px 12px;
  display: flex; flex-direction: column; gap: 3px;
}
.detalhe-label {
  font-size: 9px; text-transform: uppercase;
  letter-spacing: .5px; color: #94a3b8;
}
.detalhe-val { font-size: 16px; color: #1e293b; }

.detalhe-especialidades { margin-bottom: 14px; }
.esp-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
.esp-tag {
  padding: 3px 10px; border-radius: 14px;
  background: rgba(255,128,73,.08); color: #ff8049;
  font-size: 11px; font-family: 'Poppins', sans-serif;
}

.detalhe-action { display: flex; justify-content: flex-end; }

/* ══ ACTION BUTTONS (idêntico ao CotacaoConsole) ══ */
.action-btn {
  display: flex; align-items: center; gap: 5px;
  padding: 8px 14px; border-radius: 10px;
  font-size: 12px; font-weight: 500;
  border: none; cursor: pointer;
  white-space: nowrap; flex-shrink: 0;
  transition: all .2s;
  font-family: 'Poppins', sans-serif;
}
.action-btn span { font-size: 16px; }
.action-btn:disabled { opacity: .5; cursor: not-allowed; }
.full-w { flex: 1; justify-content: center; }

.btn-outline {
  background: #fff; color: #ff8049; border: 1px solid #ff8049;
}
.btn-outline:not(:disabled):active { background: #fff7ed; }

/* Danger outline (usado no card) */
.btn-danger-outline {
  background: rgba(239,68,68,.07);
  color: #ef4444;
  border: 1px solid rgba(239,68,68,.25);
}
.btn-danger-outline:active { background: rgba(239,68,68,.15); }

/* Danger filled (usado no modal) */
.btn-danger {
  background: #ef4444; color: #fff;
}
.btn-danger:not(:disabled):active { background: #dc2626; }

/* ══ MODAIS (bottom-sheet — idêntico ao CotacaoConsole) ══ */
ion-modal.bottom-sheet {
  --border-radius: 20px 20px 0 0;
  --box-shadow: 0 -4px 24px rgba(0,0,0,.1);
  align-items: flex-end;
  --height: auto;
}
.modal-content  { --background: #fff; }
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
  font-family: 'Poppins', sans-serif;
}
.modal-close { background: none; border: none; color: #94a3b8; cursor: pointer; display: flex; align-items: center; }
.modal-close span { font-size: 20px; }
.modal-body   { padding: 16px 18px; }
.modal-footer {
  display: flex; gap: 10px;
  padding: 14px 18px;
  border-top: 1px solid #f1f5f9;
}

/* Preview do vendedor no modal */
.confirm-vendedor-row {
  display: flex; align-items: center; gap: 12px;
  margin-bottom: 16px;
}
.confirm-avatar {
  width: 48px; height: 48px; border-radius: 50%;
  background: rgba(255,128,73,.1);
  display: flex; align-items: center; justify-content: center;
  overflow: hidden; flex-shrink: 0;
}
.confirm-avatar img { width: 100%; height: 100%; object-fit: cover; }
.confirm-initials {
  font-size: 16px; color: #ff8049;
  font-family: 'Poppins', sans-serif;
}

/* Aviso */
.confirm-warning {
  display: flex; align-items: flex-start; gap: 10px;
  background: rgba(239,68,68,.06);
  border: 1px solid rgba(239,68,68,.2);
  border-radius: 12px;
  padding: 12px 14px;
}
.warn-icon { font-size: 20px; color: #ef4444; flex-shrink: 0; margin-top: 1px; }
.confirm-warning p {
  font-size: 13px; color: #334155;
  line-height: 1.55; margin: 0;
}

/* ══ TRANSIÇÃO DE EXPANSÃO ══ */
.expand-enter-active { animation: slideDown .22s ease; }
.expand-leave-active { animation: slideDown .18s ease reverse; }
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ══ TOASTS (idêntico ao CotacaoConsole) ══ */
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
  font-family: 'Poppins', sans-serif;
}
.toast-item span { font-size: 18px; }
.toast-item.success { background: #10b981; color: #fff; }
.toast-item.error   { background: #ef4444; color: #fff; }

.toast-enter-active, .toast-leave-active { transition: all .3s ease; }
.toast-enter-from { opacity: 0; transform: translateY(20px); }
.toast-leave-to   { opacity: 0; transform: translateY(20px); }
</style>