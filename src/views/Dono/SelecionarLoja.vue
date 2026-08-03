<template>
  <ion-page class="sl-page">
    <ion-content :fullscreen="true" class="sl-content">

      <!-- ══ HERO / TOPO ══ -->
      <div class="sl-hero">
        <div class="sl-hero-icon">
          <span class="material-symbols-outlined">store</span>
        </div>
        <h1 class="sl-title poppins-semibold">Selecione a sua loja</h1>
        <p class="sl-subtitle poppins-regular">
          Escolha a loja com a qual deseja trabalhar agora
        </p>
      </div>

      <!-- ══ LOADING ══ -->
      <div v-if="loadingLojas" class="feedback-state">
        <ion-spinner name="crescent" class="sl-spinner"></ion-spinner>
        <p class="poppins-regular feedback-text">Carregando suas lojas...</p>
      </div>

      <!-- ══ VAZIO ══ -->
      <div v-else-if="lojas.length === 0" class="feedback-state">
        <div class="empty-icon-wrap">
          <span class="material-symbols-outlined">store_mall_directory</span>
        </div>
        <h3 class="poppins-semibold empty-title">Nenhuma loja encontrada</h3>
        <p class="poppins-regular empty-sub">Entre em contato com o administrador para vinculá-lo a uma loja.</p>
        <button class="retry-btn poppins-medium" @click="consultarLojas">
          <span class="material-symbols-outlined">refresh</span>
          Tentar novamente
        </button>
      </div>

      <!-- ══ LISTA DE LOJAS ══ -->
      <div v-else class="lojas-list">
        <p class="section-label poppins-regular">{{ lojas.length }} loja{{ lojas.length > 1 ? 's' : '' }} disponível{{ lojas.length > 1 ? 'is' : '' }}</p>

        <div
          v-for="loja in lojas"
          :key="loja.id_loja"
          :class="['loja-card', { 'loja-card--selected': lojaSelecionadaId === loja.id_loja, 'loja-card--loading': loadingLogin === loja.id_loja }]"
          @click="selecionarLoja(loja)"
        >
          <!-- Topo do card -->
          <div class="lc-top">
            <div :class="['lc-avatar', { 'lc-avatar--active': lojaSelecionadaId === loja.id_loja }]">
              <span class="material-symbols-outlined">storefront</span>
            </div>

            <div class="lc-info">
              <span class="lc-nome poppins-semibold">{{ loja.nome_fantasia }}</span>
              <span class="lc-razao poppins-regular">{{ loja.razao_social }}</span>
              <div class="lc-meta">
                <span class="lc-cidade poppins-regular" v-if="loja.cidade">
                  <span class="material-symbols-outlined" style="font-size:11px;vertical-align:middle;">location_on</span>
                  {{ loja.cidade }}{{ loja.estado ? ', ' + loja.estado : '' }}
                </span>
                <span :class="['env-badge poppins-medium', loja.ambiente]">
                  {{ loja.ambiente === 'homologacao' ? 'Homologação' : 'Produção' }}
                </span>
              </div>
            </div>

            <div class="lc-action">
              <!-- Spinner de loading ao selecionar -->
              <div v-if="loadingLogin === loja.id_loja" class="lc-spinner-wrap">
                <ion-spinner name="crescent" style="width:22px;height:22px;color:#ff8049;"></ion-spinner>
              </div>
              <!-- Check se já selecionada -->
              <div v-else-if="lojaSelecionadaId === loja.id_loja" class="lc-check">
                <span class="material-symbols-outlined">check_circle</span>
              </div>
              <!-- Círculo vazio -->
              <div v-else class="lc-circle"></div>
            </div>
          </div>

          <!-- Detalhes expandidos ao selecionar -->
          <transition name="expand">
            <div v-if="lojaSelecionadaId === loja.id_loja" class="lc-details">
              <div class="lc-divider"></div>
              <div class="details-grid">
                <div class="detail-item" v-if="loja.cnpj">
                  <span class="material-symbols-outlined detail-icon">badge</span>
                  <div class="detail-body">
                    <span class="detail-label poppins-regular">CNPJ</span>
                    <span class="detail-val poppins-medium">{{ formatCnpj(loja.cnpj) }}</span>
                  </div>
                </div>
                <div class="detail-item" v-if="loja.celular || loja.telefone">
                  <span class="material-symbols-outlined detail-icon">phone</span>
                  <div class="detail-body">
                    <span class="detail-label poppins-regular">Contato</span>
                    <span class="detail-val poppins-medium">{{ formatPhone(loja.celular || loja.telefone) }}</span>
                  </div>
                </div>
                <div class="detail-item" v-if="loja.email_empresa">
                  <span class="material-symbols-outlined detail-icon">mail</span>
                  <div class="detail-body">
                    <span class="detail-label poppins-regular">E-mail</span>
                    <span class="detail-val poppins-medium">{{ loja.email_empresa }}</span>
                  </div>
                </div>
                <div class="detail-item" v-if="loja.cep">
                  <span class="material-symbols-outlined detail-icon">markunread_mailbox</span>
                  <div class="detail-body">
                    <span class="detail-label poppins-regular">CEP</span>
                    <span class="detail-val poppins-medium">{{ formatCep(loja.cep) }}</span>
                  </div>
                </div>
              </div>

              <!-- Botão confirmar -->
              <button
                class="btn-confirmar poppins-semibold"
                :disabled="loadingLogin === loja.id_loja"
                @click.stop="confirmarLoja(loja)"
              >
                <ion-spinner v-if="loadingLogin === loja.id_loja" name="crescent" style="width:16px;height:16px;"></ion-spinner>
                <span v-else class="material-symbols-outlined">login</span>
                {{ loadingLogin === loja.id_loja ? 'Entrando...' : 'Entrar nessa loja' }}
              </button>
            </div>
          </transition>
        </div>
      </div>

      <!-- Espaço de respiro no fim -->
      <div style="height: 40px;"></div>

    </ion-content>

  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { IonPage, IonContent, IonSpinner } from '@ionic/vue'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/services/api'
import exibeErro from '@/utils/ExibeErro'

export default defineComponent({
  name: 'SelecionarLoja',

  components: {
    IonPage,
    IonContent,
    IonSpinner
  },

  data() {
    return {
      auth: null as any,
      lojas: [] as any[],
      loadingLojas: false,
      loadingLogin: null as any,     // id_loja sendo processado
      lojaSelecionadaId: null as any // id da loja com card expandido
    }
  },

  methods: {
    // ── API: consultar lojas ───────────────────────────────
    async consultarLojas() {
      this.loadingLojas = true
      try {
        const { data } = await api.get('/mvpu/usuario/consultarLojas')
        this.lojas = data?.data || []

        // Se só tem uma loja, pré-seleciona automaticamente
        if (this.lojas.length === 1) {
          this.lojaSelecionadaId = this.lojas[0].id_loja
        }
      } catch {
        this.$toast.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao consultar lojas',
          life: 3000
        })
      } finally {
        this.loadingLojas = false
      }
    },

    // ── Seleção: expande o card ────────────────────────────
    selecionarLoja(loja: any) {
      // Se clicar na loja já expandida, recolhe
      if (this.lojaSelecionadaId === loja.id_loja) {
        this.lojaSelecionadaId = null
        return
      }
      this.lojaSelecionadaId = loja.id_loja
    },

    // ── Confirmar: valida módulos, persiste e navega ───────
    async confirmarLoja(loja: any) {
      this.loadingLogin = loja.id_loja
      try {
        // Verifica se o usuário tem módulos habilitados para essa loja
        await api.get(`/mvpu/usuario/selecionarLoja/${loja.id_loja}`)
      } catch (e) {
        exibeErro(e, this.$toast)
        this.loadingLogin = null
        return
      }

      try {
        // Persiste a loja no authStore
        this.auth.setLoja(loja)

        this.$toast.add({
          severity: 'success',
          summary: 'Bem-vindo!',
          detail: `Bem-vindo à ${loja.nome_fantasia}!`,
          life: 3000
        })

        // Aguarda um instante para o toast aparecer antes de navegar
        await new Promise(resolve => setTimeout(resolve, 700))

        // Navega para a rota principal da aplicação
        await this.$router.replace({ name: 'DashboardAdmin' })

      } catch {
        this.$toast.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao entrar na loja. Tente novamente.',
          life: 3000
        })
      } finally {
        this.loadingLogin = null
      }
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

/* ── Base ── */
* { box-sizing: border-box; }
.sl-page    { font-family: 'Poppins', sans-serif; }
.sl-content { --background: #FFF; }

.poppins-regular  { font-weight: 400; }
.poppins-medium   { font-weight: 500; }
.poppins-semibold { font-weight: 600; }

/* ── Hero ── */
.sl-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 48px 24px 28px;
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
}

.sl-hero-icon {
  width: 72px; height: 72px; border-radius: 22px;
  background: linear-gradient(135deg, #ff8049 0%, #ff5e1a 100%);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 18px;
  box-shadow: 0 8px 24px rgba(255,128,73,.35);
}
.sl-hero-icon span {
  font-size: 36px; color: #fff;
}

.sl-title {
  font-size: 22px; color: #1e293b;
  margin: 0 0 8px; line-height: 1.25;
}

.sl-subtitle {
  font-size: 14px; color: #64748b;
  margin: 0; line-height: 1.6; max-width: 280px;
}

/* ── Feedback states ── */
.feedback-state {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 64px 24px; gap: 14px; text-align: center;
}

.sl-spinner {
  width: 44px; height: 44px; color: #ff8049;
}

.feedback-text {
  font-size: 14px; color: #64748b; margin: 0;
}

.empty-icon-wrap {
  width: 68px; height: 68px; border-radius: 20px;
  background: rgba(255,128,73,.08);
  display: flex; align-items: center; justify-content: center;
}
.empty-icon-wrap span { font-size: 32px; color: #ff8049; }

.empty-title { font-size: 16px; color: #1e293b; margin: 0; }
.empty-sub   { font-size: 13px; color: #64748b; margin: 0; max-width: 260px; line-height: 1.5; }

.retry-btn {
  display: flex; align-items: center; gap: 6px;
  background: rgba(255,128,73,.1); color: #ff8049;
  border: 1.5px solid rgba(255,128,73,.25); border-radius: 12px;
  padding: 10px 18px; font-size: 13px; cursor: pointer;
  font-family: 'Poppins', sans-serif; transition: all .2s;
  margin-top: 4px;
}
.retry-btn:active { background: rgba(255,128,73,.2); }
.retry-btn span { font-size: 18px; }

/* ── Section label ── */
.section-label {
  font-size: 10px; color: #94a3b8;
  text-transform: uppercase; letter-spacing: .6px;
  margin: 16px 16px 10px;
}

/* ── Lista ── */
.lojas-list { padding-bottom: 16px; }

/* ── Card da loja ── */
.loja-card {
  margin: 0 16px 10px;
  background: #fff;
  border: 1.5px solid #e2e8f0;
  border-radius: 18px;
  overflow: hidden;
  cursor: pointer;
  transition: border-color .2s, box-shadow .2s, transform .1s;
}
.loja-card:active:not(.loja-card--loading) {
  transform: scale(.99);
}
.loja-card--selected {
  border-color: #ff8049;
  box-shadow: 0 4px 20px rgba(255,128,73,.15);
}
.loja-card--loading {
  pointer-events: none;
  opacity: .9;
}

/* Topo */
.lc-top {
  display: flex; align-items: center; gap: 12px;
  padding: 15px;
}

.lc-avatar {
  width: 46px; height: 46px; border-radius: 14px;
  background: rgba(100,116,139,.08);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: background .2s;
}
.lc-avatar span { font-size: 24px; color: #94a3b8; transition: color .2s; }
.lc-avatar--active { background: rgba(255,128,73,.12); }
.lc-avatar--active span { color: #ff8049; }

.lc-info { flex: 1; min-width: 0; }
.lc-nome {
  font-size: 14px; color: #1e293b;
  display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  margin-bottom: 2px;
}
.lc-razao {
  font-size: 11px; color: #94a3b8;
  display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  margin-bottom: 5px;
}
.lc-meta {
  display: flex; align-items: center; gap: 7px; flex-wrap: wrap;
}
.lc-cidade {
  font-size: 11px; color: #64748b; font-family: 'Poppins', sans-serif;
}

.env-badge {
  font-size: 9px; padding: 2px 8px; border-radius: 20px;
  font-weight: 600; text-transform: capitalize;
}
.env-badge.homologacao { background: rgba(234,179,8,.12); color: #b45309; }
.env-badge.producao    { background: rgba(16,185,129,.12); color: #059669; }

.lc-action { display: flex; align-items: center; flex-shrink: 0; }

.lc-spinner-wrap {
  width: 28px; height: 28px;
  display: flex; align-items: center; justify-content: center;
}

.lc-check span {
  font-size: 26px; color: #ff8049;
}

.lc-circle {
  width: 22px; height: 22px; border-radius: 50%;
  border: 2px solid #e2e8f0;
  transition: border-color .2s;
}
.loja-card--selected .lc-circle {
  border-color: #ff8049;
}

/* ── Detalhes expandidos ── */
.lc-divider { height: 1px; background: #f1f5f9; margin: 0 15px; }
.lc-details { padding: 12px 15px 14px; }

.details-grid {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 10px; margin-bottom: 14px;
}

.detail-item { display: flex; align-items: flex-start; gap: 8px; }
.detail-icon { font-size: 16px; color: #ff8049; margin-top: 1px; flex-shrink: 0; }
.detail-body { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.detail-label {
  font-size: 9px; color: #94a3b8;
  text-transform: uppercase; letter-spacing: .5px;
}
.detail-val {
  font-size: 12px; color: #1e293b;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

/* ── Botão confirmar ── */
.btn-confirmar {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  width: 100%; padding: 14px;
  background: #ff8049; color: #fff; border: none;
  border-radius: 13px; font-size: 14px; cursor: pointer;
  font-family: 'Poppins', sans-serif;
  box-shadow: 0 4px 16px rgba(255,128,73,.35);
  transition: background .2s, transform .1s;
}
.btn-confirmar:active:not(:disabled) {
  background: #e86b35; transform: scale(.98);
}
.btn-confirmar:disabled { opacity: .7; cursor: not-allowed; }
.btn-confirmar span { font-size: 18px; }

/* ── Animação expand ── */
.expand-enter-active, .expand-leave-active {
  transition: all .28s ease;
  overflow: hidden;
}
.expand-enter-from, .expand-leave-to {
  max-height: 0; opacity: 0;
}
.expand-enter-to, .expand-leave-from {
  max-height: 400px; opacity: 1;
}

/* ── Responsivo ── */
@media (min-width: 480px) {
  .sl-hero { padding: 56px 32px 32px; }
  .lojas-list { max-width: 480px; margin: 0 auto; }
  .section-label { margin-left: 0; margin-right: 0; }
}
</style>