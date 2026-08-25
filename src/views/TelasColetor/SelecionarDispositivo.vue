<template>
  <ion-page class="sl-page">
    <ion-content :fullscreen="true" class="sl-content">

      <!-- ══ HERO / TOPO ══ -->
      <div class="sl-hero">
        <div class="sl-hero-icon">
          <span class="material-symbols-outlined">devices</span>
        </div>
        <h1 class="sl-title poppins-semibold">Selecione o seu dispositivo</h1>
        <p class="sl-subtitle poppins-regular">
          Escolha o dispositivo que você irá utilizar agora
        </p>
      </div>

      <!-- ══ LISTA DE DISPOSITIVOS ══ -->
      <div class="lojas-list">
        <p class="section-label poppins-regular">{{ dispositivos.length }} opções disponíveis</p>

        <div
          v-for="dispositivo in dispositivos"
          :key="dispositivo.tipo"
          :class="['loja-card', { 'loja-card--selected': dispositivoSelecionado === dispositivo.tipo, 'loja-card--loading': loadingConfirmar === dispositivo.tipo }]"
          @click="selecionarDispositivo(dispositivo)"
        >
          <!-- Topo do card -->
          <div class="lc-top">
            <div :class="['lc-avatar', { 'lc-avatar--active': dispositivoSelecionado === dispositivo.tipo }]">
              <span class="material-symbols-outlined">{{ dispositivo.icon }}</span>
            </div>

            <div class="lc-info">
              <span class="lc-nome poppins-semibold">{{ dispositivo.nome }}</span>
              <span class="lc-razao poppins-regular">{{ dispositivo.descricao }}</span>
            </div>

            <div class="lc-action">
              <!-- Spinner de loading ao confirmar -->
              <div v-if="loadingConfirmar === dispositivo.tipo" class="lc-spinner-wrap">
                <ion-spinner name="crescent" style="width:22px;height:22px;color:#ff8049;"></ion-spinner>
              </div>
              <!-- Check se já selecionado -->
              <div v-else-if="dispositivoSelecionado === dispositivo.tipo" class="lc-check">
                <span class="material-symbols-outlined">check_circle</span>
              </div>
              <!-- Círculo vazio -->
              <div v-else class="lc-circle"></div>
            </div>
          </div>

          <!-- Detalhes expandidos ao selecionar -->
          <transition name="expand">
            <div v-if="dispositivoSelecionado === dispositivo.tipo" class="lc-details">
              <div class="lc-divider"></div>

              <!-- Botão confirmar -->
              <button
                class="btn-confirmar poppins-semibold"
                :disabled="loadingConfirmar === dispositivo.tipo"
                @click.stop="confirmarDispositivo(dispositivo)"
              >
                <ion-spinner v-if="loadingConfirmar === dispositivo.tipo" name="crescent" style="width:16px;height:16px;"></ion-spinner>
                <span v-else class="material-symbols-outlined">login</span>
                {{ loadingConfirmar === dispositivo.tipo ? 'Entrando...' : 'Confirmar dispositivo' }}
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

export default defineComponent({
  name: 'SelecionarDispositivo',

  components: {
    IonPage,
    IonContent,
    IonSpinner
  },

  data() {
    return {
      auth: null as any,
      dispositivoSelecionado: null as any, // 'celular' | 'coletor'
      loadingConfirmar: null as any,       // tipo sendo processado
      dispositivos: [
        {
          tipo: 'celular',
          nome: 'Celular',
          descricao: 'Acessar utilizando o aplicativo no celular',
          icon: 'smartphone'
        },
        {
          tipo: 'coletor',
          nome: 'Coletor de dados',
          descricao: 'Acessar utilizando o coletor de dados',
          icon: 'barcode_reader'
        }
      ] as any[]
    }
  },

  methods: {
    // ── Seleção: expande o card ────────────────────────────
    selecionarDispositivo(dispositivo: any) {
      // Se clicar no dispositivo já expandido, recolhe
      if (this.dispositivoSelecionado === dispositivo.tipo) {
        this.dispositivoSelecionado = null
        return
      }
      this.dispositivoSelecionado = dispositivo.tipo
    },

    // ── Confirmar: persiste e navega conforme o nível do usuário ──
    async confirmarDispositivo(dispositivo: any) {
      this.loadingConfirmar = dispositivo.tipo

      try {
        // Persiste o tipo de dispositivo no authStore
        this.auth.setDispositivo(dispositivo.tipo)

        this.$toast.add({
          severity: 'success',
          summary: 'Dispositivo selecionado!',
          detail: `Você está usando: ${dispositivo.nome}`,
          life: 3000
        })

        // Aguarda um instante para o toast aparecer antes de navegar
        await new Promise(resolve => setTimeout(resolve, 700))

        // Navega conforme o nível do usuário
        const nivel = Number(this.auth.usuario?.nivel)

        if (nivel === 7) {
          await this.$router.replace({ name: 'MinhasCotacoes' })
        } else if (nivel === 6) {
          await this.$router.replace({ name: 'DashboardAdmin' })
        } else if (nivel === 1) {
          await this.$router.replace({ name: 'DashboardAdmin' })
        } else {
          await this.$router.replace({ name: 'MinhasCotacoes' })
        }

      } catch {
        this.$toast.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao selecionar o dispositivo. Tente novamente.',
          life: 3000
        })
      } finally {
        this.loadingConfirmar = null
      }
    }
  },

  mounted() {
    this.auth = useAuthStore()
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

/* ── Section label ── */
.section-label {
  font-size: 10px; color: #94a3b8;
  text-transform: uppercase; letter-spacing: .6px;
  margin: 16px 16px 10px;
}

/* ── Lista ── */
.lojas-list { padding-bottom: 16px; }

/* ── Card do dispositivo ── */
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
}

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
  max-height: 200px; opacity: 1;
}

/* ── Responsivo ── */
@media (min-width: 480px) {
  .sl-hero { padding: 56px 32px 32px; }
  .lojas-list { max-width: 480px; margin: 0 auto; }
  .section-label { margin-left: 0; margin-right: 0; }
}
</style>