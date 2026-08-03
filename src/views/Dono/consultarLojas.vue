<template>
  <ion-page class="loja-page">
    <ion-content :fullscreen="true" class="loja-content">

      <RefresherIonic />

      <!-- ══ HEADER ══ -->
      <div class="lc-header">
        <div class="lc-header-left">
          <button class="back-btn" @click="$router.back()">
            <span class="material-symbols-outlined">arrow_back_ios_new</span>
          </button>
          <div class="lc-identity">
            <span class="lc-label">GERENCIAR</span>
            <span class="lc-title">Minhas Lojas</span>
          </div>
        </div>
        <button class="add-store-btn poppins-medium" @click="abrirCriarLoja">
          <span class="material-symbols-outlined">add</span>
          Nova Loja
        </button>
      </div>

      <!-- ══ LOJA ATUAL BADGE ══ -->
      <div class="current-loja-bar" v-if="lojaAtual">
        <div class="current-bar-left">
          <span class="material-symbols-outlined current-icon">store</span>
          <div class="current-info">
            <span class="current-label poppins-regular">Loja ativa</span>
            <span class="current-name poppins-semibold">{{ lojaAtual.nome_fantasia }}</span>
          </div>
        </div>
        <div class="current-env-badge" :class="lojaAtual.ambiente">
            <!--
            {{ lojaAtual.ambiente === 'homologacao' ? 'Homolog.' : 'Produção' }}
            -->
            Selecionado
        </div>
      </div>

      <!-- ══ LOADING ══ -->
      <div v-if="loadingLojas" class="loading-state">
        <ion-spinner name="crescent" color="primary"></ion-spinner>
        <p class="poppins-regular">Carregando lojas...</p>
      </div>

      <!-- ══ EMPTY ══ -->
      <div v-else-if="lojas.length === 0" class="empty-state">
        <div class="empty-icon-wrap">
          <span class="material-symbols-outlined">store_mall_directory</span>
        </div>
        <h3 class="poppins-semibold">Nenhuma loja cadastrada</h3>
        <p class="poppins-regular">Crie sua primeira loja para começar.</p>
        <button class="action-btn btn-primary poppins-medium" @click="abrirCriarLoja">
          <span class="material-symbols-outlined">add</span> Criar Loja
        </button>
      </div>

      <!-- ══ LISTA DE LOJAS ══ -->
      <div v-else class="lojas-list">
        <p class="section-label poppins-regular">Selecione uma loja para ativar</p>

        <div
          v-for="loja in lojas"
          :key="loja.id_loja"
          :class="['loja-card', { active: isLojaAtiva(loja.id_loja) }]"
          @click="selecionarLoja(loja)"
        >
          <!-- Ícone + Nome -->
          <div class="lc-card-top">
            <div :class="['lc-avatar', { 'avatar-active': isLojaAtiva(loja.id_loja) }]">
              <span class="material-symbols-outlined">storefront</span>
            </div>
            <div class="lc-card-info">
              <span class="lc-card-name poppins-semibold">{{ loja.nome_fantasia }}</span>
              <span class="lc-card-razao poppins-regular">{{ loja.razao_social }}</span>
            </div>
            <div class="lc-card-right">
              <div class="env-dot" :class="loja.ambiente"></div>
              <div v-if="isLojaAtiva(loja.id_loja)" class="active-check">
                <span class="material-symbols-outlined">check_circle</span>
              </div>
              <div v-else class="select-circle"></div>
            </div>
          </div>

          <!-- Dados Expandidos quando ativa -->
          <transition name="expand">
            <div v-if="isLojaAtiva(loja.id_loja)" class="lc-card-details">
              <div class="details-divider"></div>
              <div class="details-grid">
                <div class="detail-item" v-if="loja.cnpj">
                  <span class="detail-icon material-symbols-outlined">badge</span>
                  <div class="detail-body">
                    <span class="detail-label poppins-regular">CNPJ</span>
                    <span class="detail-val poppins-medium">{{ formatCnpj(loja.cnpj) }}</span>
                  </div>
                </div>
                <div class="detail-item" v-if="loja.celular || loja.telefone">
                  <span class="detail-icon material-symbols-outlined">phone</span>
                  <div class="detail-body">
                    <span class="detail-label poppins-regular">Contato</span>
                    <span class="detail-val poppins-medium">{{ formatPhone(loja.celular || loja.telefone) }}</span>
                  </div>
                </div>
                <div class="detail-item" v-if="loja.email_empresa">
                  <span class="detail-icon material-symbols-outlined">mail</span>
                  <div class="detail-body">
                    <span class="detail-label poppins-regular">E-mail</span>
                    <span class="detail-val poppins-medium">{{ loja.email_empresa }}</span>
                  </div>
                </div>
                <div class="detail-item" v-if="loja.cidade">
                  <span class="detail-icon material-symbols-outlined">location_on</span>
                  <div class="detail-body">
                    <span class="detail-label poppins-regular">Cidade</span>
                    <span class="detail-val poppins-medium">{{ loja.cidade }}, {{ loja.estado }}</span>
                  </div>
                </div>
                <div class="detail-item" v-if="loja.cep">
                  <span class="detail-icon material-symbols-outlined">markunread_mailbox</span>
                  <div class="detail-body">
                    <span class="detail-label poppins-regular">CEP</span>
                    <span class="detail-val poppins-medium">{{ formatCep(loja.cep) }}</span>
                  </div>
                </div>
                <div class="detail-item" v-if="loja.inscricao_estadual">
                  <span class="detail-icon material-symbols-outlined">description</span>
                  <div class="detail-body">
                    <span class="detail-label poppins-regular">Insc. Estadual</span>
                    <span class="detail-val poppins-medium">{{ loja.inscricao_estadual }}</span>
                  </div>
                </div>
              </div>

              <!--
              <div class="nf-row">
                <div class="nf-chip">
                  <span class="nf-chip-label">NF-e</span>
                  <span class="nf-chip-val poppins-semibold">{{ loja.ultimo_numero_nfe || '0' }}</span>
                </div>
                <div class="nf-chip">
                  <span class="nf-chip-label">NFC-e</span>
                  <span class="nf-chip-val poppins-semibold">{{ loja.ultimo_numero_nfce || '0' }}</span>
                </div>
                <div class="nf-chip">
                  <span class="nf-chip-label">Série NF-e</span>
                  <span class="nf-chip-val poppins-semibold">{{ loja.serie_nfe }}</span>
                </div>
                <div class="nf-chip">
                  <span class="nf-chip-label">Série NFC-e</span>
                  <span class="nf-chip-val poppins-semibold">{{ loja.serie_nfce }}</span>
                </div>
              </div>
              -->
            </div>
          </transition>
        </div>
      </div>

    </ion-content>

    <!-- ══════════════════════════════════
         MODAL — CRIAR NOVA LOJA
    ══════════════════════════════════ -->
    <ion-modal
      :is-open="showCriarModal"
      class="bottom-sheet criar-modal"
      @did-dismiss="fecharCriarLoja"
    >
      <ion-content class="modal-content">
        <div class="modal-handle"></div>
        <div class="modal-box">

          <!-- Header modal -->
          <div class="modal-header">
            <span class="poppins-semibold">Nova Loja</span>
            <button class="modal-close" @click="fecharCriarLoja">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <!-- Corpo -->
          <div class="modal-body criar-body">

            <!-- Seção: Identificação -->
            <div class="form-section">
              <div class="form-section-title poppins-medium">
                <span class="material-symbols-outlined">store</span> Identificação
              </div>

              <div class="form-group">
                <label class="form-label">CNPJ *</label>
                <input
                  class="form-input poppins-regular"
                  type="tel"
                  v-model="form.cnpj"
                  placeholder="00.000.000/0000-00"
                  maxlength="18"
                  @input="maskCnpj"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Nome Fantasia *</label>
                <input
                  class="form-input poppins-regular"
                  type="text"
                  v-model="form.nome_fantasia"
                  placeholder="Ex: Loja Centro"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Razão Social *</label>
                <input
                  class="form-input poppins-regular"
                  type="text"
                  v-model="form.razao_social"
                  placeholder="Ex: Empresa Ltda."
                />
              </div>

              <div class="form-group">
                <label class="form-label">Inscrição Estadual</label>
                <input
                  class="form-input poppins-regular"
                  type="tel"
                  v-model="form.inscricao_estadual"
                  placeholder="Opcional"
                />
              </div>
            </div>

            <!-- Seção: Contato -->
            <div class="form-section">
              <div class="form-section-title poppins-medium">
                <span class="material-symbols-outlined">contacts</span> Contato
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Telefone</label>
                  <input
                    class="form-input poppins-regular"
                    type="tel"
                    v-model="form.telefone"
                    placeholder="(00) 0000-0000"
                    maxlength="14"
                    @input="maskTelefone"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">Celular</label>
                  <input
                    class="form-input poppins-regular"
                    type="tel"
                    v-model="form.celular"
                    placeholder="(00) 00000-0000"
                    maxlength="15"
                    @input="maskCelular"
                  />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">E-mail</label>
                <input
                  class="form-input poppins-regular"
                  type="email"
                  v-model="form.email_empresa"
                  placeholder="contato@empresa.com"
                />
              </div>
            </div>

            <!-- Seção: Endereço -->
            <div class="form-section">
              <div class="form-section-title poppins-medium">
                <span class="material-symbols-outlined">location_on</span> Endereço
              </div>

              <div class="form-group">
                <label class="form-label">CEP</label>
                <div class="input-with-btn">
                  <input
                    class="form-input poppins-regular"
                    type="tel"
                    v-model="form.cep"
                    placeholder="00000-000"
                    maxlength="9"
                    @input="maskCep"
                    @blur="buscarCep"
                  />
                  <button class="cep-btn" :disabled="loadingCep" @click="buscarCep">
                    <ion-spinner v-if="loadingCep" name="crescent" style="width:16px;height:16px;"></ion-spinner>
                    <span v-else class="material-symbols-outlined">search</span>
                  </button>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Rua</label>
                <input
                  class="form-input poppins-regular"
                  type="text"
                  v-model="form.rua"
                  placeholder="Rua, Avenida..."
                />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Cidade</label>
                  <input
                    class="form-input poppins-regular"
                    type="text"
                    v-model="form.cidade"
                    placeholder="São Paulo"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">Estado</label>
                  <input
                    class="form-input poppins-regular"
                    type="text"
                    v-model="form.estado"
                    placeholder="SP"
                    maxlength="2"
                    style="text-transform:uppercase"
                  />
                </div>
              </div>
            </div>

          </div><!-- /modal-body -->

          <!-- Footer -->
          <div class="modal-footer">
            <button class="action-btn btn-outline poppins-medium flex-1" @click="fecharCriarLoja">
              Cancelar
            </button>
            <button
              class="action-btn btn-primary poppins-medium flex-1"
              :disabled="loadingCriar || !formValido"
              @click="criarLoja"
            >
              <ion-spinner v-if="loadingCriar" name="crescent" style="width:16px;height:16px;color:#fff"></ion-spinner>
              <span v-else class="material-symbols-outlined">add_business</span>
              {{ loadingCriar ? 'Criando...' : 'Criar Loja' }}
            </button>
          </div>

        </div>
      </ion-content>
    </ion-modal>

    <!-- ══ TOASTS ══ -->
    <div class="toast-container">
      <transition-group name="toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          :class="['toast-item', 'poppins-medium', t.type]"
        >
          <span class="material-symbols-outlined">{{ t.type === 'success' ? 'check_circle' : 'error' }}</span>
          {{ t.msg }}
        </div>
      </transition-group>
    </div>

  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import {
  IonPage, IonContent, IonModal, IonSpinner
} from '@ionic/vue'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/services/api'
import RefresherIonic from '@/components/refresherIonic.vue'
import exibeErro from '@/utils/ExibeErro'
import axios from 'axios'

const formDefault = () => ({
  cnpj: '',
  nome_fantasia: '',
  razao_social: '',
  telefone: '',
  celular: '',
  email_empresa: '',
  rua: '',
  cidade: '',
  estado: '',
  cep: '',
  inscricao_estadual: ''
})

export default defineComponent({
  name: 'ConsultarLojas',

  components: {
    IonPage,
    IonContent,
    IonModal,
    IonSpinner,
    RefresherIonic
  },

  data() {
    return {
      auth: null as any,
      lojas: [] as any[],
      loadingLojas: false,
      showCriarModal: false,
      loadingCriar: false,
      loadingCep: false,
      toasts: [] as { id: number; msg: string; type: string }[],
      form: formDefault()
    }
  },

  computed: {
    lojaAtual(): any {
      return this.lojas.find((l: any) => l.id_loja === this.auth?.loja?.id_loja) || null
    },

    formValido(): boolean {
      return (
        this.form.cnpj.replace(/\D/g, '').length === 14 &&
        this.form.nome_fantasia.trim() !== '' &&
        this.form.razao_social.trim() !== ''
      )
    }
  },

  methods: {
    // ── API ────────────────────────────────────────────────
    async consultarLojas() {
      this.loadingLojas = true
      try {
        const { data } = await api.get('/mvpu/usuario/consultarLojas')
        this.lojas = data?.data || []
      } catch {
        this.showToast('Erro ao consultar lojas', 'error')
      } finally {
        this.loadingLojas = false
      }
    },

    async criarLoja() {
      if (!this.formValido) return
      this.loadingCriar = true
      try {
        const payload = {
          cnpj              : this.form.cnpj.replace(/\D/g, ''),
          nome_fantasia     : this.form.nome_fantasia,
          razao_social      : this.form.razao_social,
          telefone          : this.form.telefone.replace(/\D/g, '') || null,
          celular           : this.form.celular.replace(/\D/g, '') || null,
          email_empresa     : this.form.email_empresa || null,
          rua               : this.form.rua || null,
          cidade            : this.form.cidade || null,
          estado            : this.form.estado || null,
          cep               : this.form.cep.replace(/\D/g, '') || null,
          inscricao_estadual: this.form.inscricao_estadual || null,
        }

        await api.post('/mvpu/usuario/criarLoja', payload)

        this.$toast.add({
          severity: 'success',
          summary: 'Sucesso!',
          detail: 'Nova loja criada com sucesso!',
          life: 3000
        })

        this.fecharCriarLoja()
        await this.consultarLojas()
      } catch (e) {
        exibeErro(e, this.$toast)
      } finally {
        this.loadingCriar = false
      }
    },

    // ── Seleção ────────────────────────────────────────────
    async selecionarLoja(loja: any) {
      try {
        await api.get(`/mvpu/usuario/selecionarLoja/${loja.id_loja}`)
      } catch (e) {
        exibeErro(e, this.$toast)
        return
      }

      this.auth.setLoja(loja)
      await new Promise(resolve => setTimeout(resolve, 700))
      window.location.reload()
    },

    isLojaAtiva(id: any): boolean {
      return this.auth?.loja?.id_loja === id
    },

    // ── Modal ──────────────────────────────────────────────
    abrirCriarLoja() {
      this.form = formDefault()
      this.showCriarModal = true
    },

    fecharCriarLoja() {
      this.showCriarModal = false
    },

    // ── CEP lookup ─────────────────────────────────────────
    async buscarCep() {
      const cep = this.form.cep.replace(/\D/g, '')
      if (cep.length !== 8) return
      this.loadingCep = true
      try {
        const { data } = await axios.get(`https://viacep.com.br/ws/${cep}/json/`)
        if (!data.erro) {
          this.form.rua    = data.logradouro || this.form.rua
          this.form.cidade = data.localidade || this.form.cidade
          this.form.estado = data.uf         || this.form.estado
        }
      } catch { /* silencia */ } finally {
        this.loadingCep = false
      }
    },

    // ── Masks ──────────────────────────────────────────────
    maskCnpj(e: Event) {
      let v = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 14)
      v = v.replace(/^(\d{2})(\d)/, '$1.$2')
      v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      v = v.replace(/\.(\d{3})(\d)/, '.$1/$2')
      v = v.replace(/(\d{4})(\d)/, '$1-$2')
      this.form.cnpj = v
    },

    maskTelefone(e: Event) {
      let v = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 10)
      v = v.replace(/^(\d{2})(\d)/, '($1) $2')
      v = v.replace(/(\d{4})(\d)/, '$1-$2')
      this.form.telefone = v
    },

    maskCelular(e: Event) {
      let v = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 11)
      v = v.replace(/^(\d{2})(\d)/, '($1) $2')
      v = v.replace(/(\d{5})(\d)/, '$1-$2')
      this.form.celular = v
    },

    maskCep(e: Event) {
      let v = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 8)
      v = v.replace(/(\d{5})(\d)/, '$1-$2')
      this.form.cep = v
    },

    // ── Formatters ─────────────────────────────────────────
    formatCnpj(v: string): string {
      if (!v) return ''
      v = v.replace(/\D/g, '').slice(0, 14)
      return v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
    },

    formatPhone(v: string): string {
      if (!v) return ''
      v = v.replace(/\D/g, '')
      if (v.length === 11) return v.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
      if (v.length === 10) return v.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3')
      return v
    },

    formatCep(v: string): string {
      if (!v) return ''
      return v.replace(/^(\d{5})(\d{3})$/, '$1-$2')
    },

    // ── Toasts ─────────────────────────────────────────────
    showToast(msg: string, type = 'success') {
      const id = Date.now()
      this.toasts.push({ id, msg, type })
      setTimeout(() => {
        this.toasts = this.toasts.filter(t => t.id !== id)
      }, 3000)
    }
  },

  mounted() {
    this.auth = useAuthStore()
    this.consultarLojas()
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');

/* ── Globals ── */
* { box-sizing: border-box; }
.loja-page  { font-family: 'Poppins', sans-serif; }
.loja-content { --background: #FFF; }

.poppins-regular  { font-weight: 400; }
.poppins-medium   { font-weight: 500; }
.poppins-semibold { font-weight: 600; }

/* ── Header ── */
.lc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 12px;
  background: #fff;
  border-bottom: 1px solid #f1f5f9;
  position: sticky; top: 0; z-index: 10;
}
.lc-header-left { display: flex; align-items: center; gap: 10px; }
.back-btn {
  background: none; border: none; color: #64748b;
  display: flex; align-items: center; cursor: pointer;
  padding: 4px;
}
.back-btn span { font-size: 20px; }
.lc-identity { display: flex; flex-direction: column; }
.lc-label { font-size: 9px; letter-spacing: 1.2px; color: #ff8049; text-transform: uppercase; font-weight: 600; }
.lc-title { font-size: 16px; color: #1e293b; font-weight: 600; line-height: 1.2; }

.add-store-btn {
  display: flex; align-items: center; gap: 5px;
  background: #ff8049; color: #fff; border: none;
  border-radius: 10px; padding: 8px 14px;
  font-size: 13px; cursor: pointer;
  transition: background .2s;
}
.add-store-btn span { font-size: 18px; }
.add-store-btn:active { background: #e86b35; }

/* ── Current Loja Bar ── */
.current-loja-bar {
  margin: 12px 16px 4px;
  background: linear-gradient(135deg, rgba(255,128,73,.08) 0%, rgba(255,128,73,.04) 100%);
  border: 1.5px solid rgba(255,128,73,.2);
  border-radius: 14px;
  padding: 12px 14px;
  display: flex; align-items: center; justify-content: space-between;
}
.current-bar-left { display: flex; align-items: center; gap: 10px; background: transparent; }
.current-icon { font-size: 22px; color: #ff8049;  background: transparent;}
.current-info { display: flex; flex-direction: column; gap: 1px; background: transparent;}
.current-label { font-size: 10px; color: #62676e; text-transform: uppercase; letter-spacing: .5px; }
.current-name { font-size: 14px; color: #1e293b; }

.current-env-badge, .env-dot {
  font-size: 10px; padding: 3px 8px; border-radius: 20px;
  font-weight: 600; text-transform: capitalize;
}
.current-env-badge.homologacao { background: rgba(234,179,8,.12); color: #b45309; }
.current-env-badge.producao    { background: rgba(16,185,129,.12); color: #059669; }
.env-dot {
  width: 8px; height: 8px; border-radius: 50%; padding: 0;
  flex-shrink: 0;
}
.env-dot.homologacao { background: #f59e0b; }
.env-dot.producao    { background: #10b981; }

/* ── Section label ── */
.section-label {
  font-size: 11px; color: #94a3b8;
  text-transform: uppercase; letter-spacing: .5px;
  margin: 16px 16px 8px;
}

/* ── Lojas list ── */
.lojas-list { padding-bottom: 32px; }

.loja-card {
  margin: 0 16px 10px;
  background: #fff;
  border: 1.5px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: border-color .2s, box-shadow .2s;
}
.loja-card:active { transform: scale(.99); }
.loja-card.active {
  border-color: #ff8049;
  box-shadow: 0 4px 16px rgba(255,128,73,.15);
}

.lc-card-top {
  display: flex; align-items: center; gap: 12px;
  padding: 14px;
}

.lc-avatar {
  width: 42px; height: 42px; border-radius: 12px;
  background: rgba(100,116,139,.08);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: background .2s;
}
.lc-avatar span { font-size: 22px; color: #94a3b8; }
.lc-avatar.avatar-active { background: rgba(255,128,73,.12); }
.lc-avatar.avatar-active span { color: #ff8049; }

.lc-card-info { flex: 1; min-width: 0; }
.lc-card-name { font-size: 14px; color: #1e293b; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lc-card-razao { font-size: 11px; color: #94a3b8; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.lc-card-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

.active-check span { font-size: 22px; color: #ff8049; }

.select-circle {
  width: 20px; height: 20px; border-radius: 50%;
  border: 2px solid #e2e8f0;
}

/* ── Card details (expandido) ── */
.details-divider { height: 1px; background: #f1f5f9; margin: 0 14px; }
.lc-card-details { padding: 12px 14px 14px; }

.details-grid {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 10px; margin-bottom: 12px;
}
.detail-item { display: flex; align-items: flex-start; gap: 8px; }
.detail-icon { font-size: 16px; color: #ff8049; margin-top: 1px; flex-shrink: 0; }
.detail-body { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.detail-label { font-size: 9px; color: #94a3b8; text-transform: uppercase; letter-spacing: .5px; }
.detail-val { font-size: 12px; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.nf-row { display: flex; gap: 8px; flex-wrap: wrap; }
.nf-chip {
  background: #f8fafc; border: 1px solid #e2e8f0;
  border-radius: 8px; padding: 6px 10px;
  display: flex; flex-direction: column; gap: 1px;
  flex: 1; min-width: 60px;
}
.nf-chip-label { font-size: 9px; color: #94a3b8; text-transform: uppercase; letter-spacing: .4px; }
.nf-chip-val { font-size: 14px; color: #1e293b; }

/* ── Expand transition ── */
.expand-enter-active, .expand-leave-active {
  transition: all .3s ease;
  overflow: hidden;
}
.expand-enter-from, .expand-leave-to {
  max-height: 0;
  opacity: 0;
}
.expand-enter-to, .expand-leave-from {
  max-height: 400px;
  opacity: 1;
}

/* ── Loading / Empty ── */
.loading-state, .empty-state {
  display: flex; flex-direction: column; align-items: center;
  padding: 60px 24px; gap: 12px; text-align: center;
}
.empty-icon-wrap {
  width: 64px; height: 64px; border-radius: 20px;
  background: rgba(255,128,73,.08);
  display: flex; align-items: center; justify-content: center;
}
.empty-icon-wrap span { font-size: 32px; color: #ff8049; }
.empty-state h3 { font-size: 16px; color: #1e293b; margin: 0; }
.empty-state p  { font-size: 13px; color: #64748b; margin: 0; }

/* ── Buttons ── */
.action-btn {
  display: inline-flex; align-items: center; justify-content: center;
  gap: 6px; padding: 10px 18px; border-radius: 12px;
  font-size: 13px; border: none; cursor: pointer;
  transition: all .2s;
}
.btn-primary  { background: #ff8049; color: #fff; }
.btn-primary:active  { background: #e86b35; }
.btn-primary:disabled { opacity: .6; }
.btn-outline  { background: transparent; color: #ff8049; border: 1.5px solid #ff8049; }
.btn-outline:active  { background: rgba(255,128,73,.08); }
.flex-1 { flex: 1; }

/* ══ MODAL ══ */
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
.modal-footer {
  display: flex; gap: 10px;
  padding: 14px 18px;
  border-top: 1px solid #f1f5f9;
  position: sticky; bottom: 0; background: #fff;
}

/* Criar body */
.criar-body { padding: 12px 18px 8px; }

.form-section { margin-bottom: 20px; }
.form-section-title {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; color: #ff8049; text-transform: uppercase;
  letter-spacing: .6px; margin-bottom: 12px;
}
.form-section-title span { font-size: 16px; }

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

.form-group { margin-bottom: 10px; }
.form-label {
  display: block; font-size: 10px; text-transform: uppercase;
  letter-spacing: .5px; color: #ff8049; margin-bottom: 5px;
  font-weight: 600;
}
.form-input {
  width: 100%; background: #f8fafc;
  border: 1.5px solid #e2e8f0; border-radius: 10px;
  padding: 10px 12px; font-size: 13px; color: #1e293b;
  outline: none; font-family: 'Poppins', sans-serif;
  transition: border-color .2s;
  -webkit-appearance: none;
}
.form-input:focus { border-color: #ff8049; background: #fff; }

.input-with-btn { display: flex; gap: 8px; }
.input-with-btn .form-input { flex: 1; }
.cep-btn {
  background: #ff8049; border: none; border-radius: 10px;
  width: 42px; height: 42px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #fff;
}
.cep-btn span { font-size: 18px; }
.cep-btn:disabled { opacity: .6; }

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
</style>