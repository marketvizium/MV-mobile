<template>
  <ion-modal
    :is-open="isOpen"
    :backdrop-dismiss="false"
    :keyboard-close="false"
    :can-dismiss="false"
    class="termos-modal"
  >
    <div class="tm-wrapper">

      <!-- ══ CONTEÚDO ROLÁVEL ══ -->
      <div class="tm-scroll">

        <div class="tm-icon-wrap">
          <span class="material-symbols-outlined tm-icon">gavel</span>
        </div>

        <h2 class="tm-title poppins-semibold">Atualizamos nossos termos</h2>
        <p class="tm-subtitle poppins-regular">
          Para continuar usando a plataforma, revise e aceite nossos novos
          <strong>Termos de Uso</strong> e <strong>Política de Privacidade</strong>.
        </p>

        <!-- ══ LINKS PARA CONFERIR ══ -->
        <div class="tm-links">
          <a
            class="tm-link-card"
            @click.prevent="openLegal('termos')"
            href="#"
          >
            <span class="tm-link-icon-wrap">
              <span class="material-symbols-outlined tm-link-icon">description</span>
            </span>
            <div class="tm-link-text">
              <span class="tm-link-title poppins-medium">Termos de Uso</span>
              <span class="tm-link-sub poppins-regular">Versão {{ versaoTermos }} · confira em</span>
            </div>
            <span class="material-symbols-outlined tm-link-arrow">chevron_right</span>
          </a>

          <a
            class="tm-link-card"
            @click.prevent="openLegal('privacidade')"
            href="#"
          >
            <span class="tm-link-icon-wrap" style="background:#eff6ff;">
              <span class="material-symbols-outlined tm-link-icon" style="color:#2563eb;">privacy_tip</span>
            </span>
            <div class="tm-link-text">
              <span class="tm-link-title poppins-medium">Política de Privacidade</span>
              <span class="tm-link-sub poppins-regular">Versão {{ versaoPrivacidade }} · confira em</span>
            </div>
            <span class="material-symbols-outlined tm-link-arrow">chevron_right</span>
          </a>
        </div>

        <!-- ══ CHECKBOX DE ACEITE ══ -->
        <label class="tm-checkbox-row">
          <ion-checkbox v-model="aceite" class="tm-checkbox" mode="ios"></ion-checkbox>
          <span class="tm-checkbox-label poppins-regular">
            Li e aceito os novos Termos de Uso e a Política de Privacidade.
          </span>
        </label>

        <!-- ══ ERRO ══ -->
        <div v-if="erro" class="tm-error poppins-regular">
          <span class="material-symbols-outlined">error</span>
          Não foi possível registrar seu aceite. Tente novamente.
        </div>

        <p class="tm-warning poppins-regular">
          <span class="material-symbols-outlined tm-warning-icon">info</span>
          Caso não aceite, você será desconectado da plataforma.
        </p>
      </div>

      <!-- ══ AÇÕES (fixas, fora do scroll) ══ -->
      <div class="tm-actions">
        <button
          class="tm-btn-recusar poppins-medium"
          @click="recusar"
          :disabled="loading"
        >
          Não aceitar e sair
        </button>
        <button
          class="tm-btn-aceitar poppins-semibold"
          @click="aceitarTermos"
          :disabled="!aceite || loading"
        >
          <ion-spinner v-if="loading" name="crescent" class="tm-btn-spinner"></ion-spinner>
          <span v-else>Aceitar e continuar</span>
        </button>
      </div>
    </div>
  </ion-modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonModal, IonCheckbox, IonSpinner } from '@ionic/vue';
import pkg from '../../package.json';
import { api } from '@/services/api';
import { useAuthStore } from '@/stores/auth'; // ajuste o caminho conforme seu projeto
import { Browser } from '@capacitor/browser';

export default defineComponent({
  name: 'TermosModal',
  components: { IonModal, IonCheckbox, IonSpinner },
  props: {
    // Links para o usuário "conferir" os termos/política antes de aceitar.
    // Podem ser URLs externas (https://...) ou rotas internas (/termos-de-uso).
    linkTermos: {
      type: String,
      default: 'https://seudominio.com.br/termos-de-uso',
    },
    linkPrivacidade: {
      type: String,
      default: 'https://seudominio.com.br/politica-privacidade',
    },
  },
  data() {
    return {
      isOpen: false,
      aceite: false,
      loading: false,
      erro: false,
      verificando: false,
      versaoTermos: pkg.termosuso,
      versaoPrivacidade: pkg.polpriv,
      links: {
        termos: 'https://market-vizium.cloud/termos-uso',
        privacidade: 'https://market-vizium.cloud/legal',
      },
    };
  },
  methods: {

    async openLegal(legalTipo: String){

        if(legalTipo == 'termos'){
            await Browser.open({
                url: this.links.termos
            });

        }else{
            await Browser.open({
                url: this.links.privacidade
            });
        }
    },

    // Verifica se o usuário já aceitou a versão atual dos termos.
    // Deve ser chamado assim que o usuário estiver autenticado dentro da plataforma
    // (ex: no App.vue, ou no mounted() de um layout raiz autenticado).
    async verificarTermos() {
      const authStore = useAuthStore();
      const email = authStore.usuario?.email; // ajuste conforme o campo real do seu authStore

      if (!email) return;

      this.verificando = true;

      try {
        const payloadTermos = {
          email,
          versao_term: this.versaoTermos,
          versao_priv: this.versaoPrivacidade,
        };

        const termosAceitos = await api.post('/mvpu/usuario/conTermos/', payloadTermos);

        if (!termosAceitos.data.data.length) {
          this.isOpen = true;
        }
      } catch (e) {
        // Falha silenciosa na verificação — não bloqueia o usuário indevidamente
      } finally {
        this.verificando = false;
      }
    },

    async aceitarTermos() {
      if (!this.aceite || this.loading) return;

      const authStore = useAuthStore();
      const email = authStore.usuario?.email;

      this.loading = true;
      this.erro = false;

      try {
        const payloadUpdTermos = {
          email,
          versao_term: this.versaoTermos,
          versao_priv: this.versaoPrivacidade,
        };

        await api.post('/mvpu/usuario/updTermos/', payloadUpdTermos);

        this.isOpen = false;
        this.$emit('termos-aceitos');
      } catch (e) {
        this.erro = true;
      } finally {
        this.loading = false;
      }
    },

    recusar() {
      const authStore = useAuthStore();
      authStore.logout();
      this.isOpen = false;
      this.$router.replace({ name: 'Login' });
    },
  },
  mounted() {
    console.log("AOBA")
    this.verificarTermos();
  },
});
</script>

<style scoped>
/* ══ MODAL SHELL ══ */
.termos-modal {
  --width: 100%;
  --max-width: 460px;
  --height: auto;
  --max-height: 88vh;
  --border-radius: 22px;
  --box-shadow: 0 24px 60px rgba(15, 23, 42, 0.28);
  --background: #fff;
}

@media (max-width: 400px) {
  .termos-modal {
    --width: 92vw;
    --max-height: 92vh;
    --border-radius: 20px;
  }
}

.tm-wrapper {
  display: flex;
  flex-direction: column;
  max-height: 88vh;
}

/* ══ SCROLL AREA ══ */
.tm-scroll {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 28px 24px 8px;
  scrollbar-width: thin;
}
.tm-scroll::-webkit-scrollbar { width: 5px; }
.tm-scroll::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}

@media (max-width: 360px) {
  .tm-scroll { padding: 22px 16px 6px; }
}

/* ══ ICON HEADER ══ */
.tm-icon-wrap {
  width: 56px;
  height: 56px;
  margin: 0 auto 16px;
  background: linear-gradient(135deg, #ff8049, #ff9a6a);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(255, 128, 73, 0.32);
}
.tm-icon {
  font-size: 28px;
  color: #fff;
}

.tm-title {
  font-size: 19px;
  color: #1e293b;
  text-align: center;
  margin: 0 0 8px;
  line-height: 1.3;
}
.tm-subtitle {
  font-size: 13px;
  color: #64748b;
  text-align: center;
  margin: 0 0 20px;
  line-height: 1.5;
}
.tm-subtitle strong {
  color: #334155;
  font-weight: 600;
}

/* ══ LINK CARDS ══ */
.tm-links {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 18px;
}
.tm-link-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 12px 14px;
  text-decoration: none;
  transition: background 0.15s, border-color 0.15s;
  cursor: pointer;
}
.tm-link-card:active {
  background: #f1f5f9;
}
.tm-link-icon-wrap {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  background: #fff7ed;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.tm-link-icon {
  font-size: 19px;
  color: #ff8049;
}
.tm-link-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.tm-link-title {
  font-size: 13px;
  color: #1e293b;
}
.tm-link-sub {
  font-size: 11px;
  color: #94a3b8;
}
.tm-link-arrow {
  font-size: 20px;
  color: #cbd5e1;
  flex-shrink: 0;
}

/* ══ CHECKBOX ══ */
.tm-checkbox-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: #fff7ed;
  border: 1px solid #ffe3d1;
  border-radius: 14px;
  padding: 12px 14px;
  margin-bottom: 12px;
  cursor: pointer;
}
.tm-checkbox {
  flex-shrink: 0;
  margin-top: 1px;
  --size: 20px;
  --checkbox-background-checked: #ff8049;
  --border-color-checked: #ff8049;
}
.tm-checkbox-label {
  font-size: 12.5px;
  color: #7c4a2d;
  line-height: 1.5;
}

/* ══ ERRO ══ */
.tm-error {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 12px;
  margin-bottom: 12px;
}
.tm-error span { font-size: 16px; flex-shrink: 0; }

/* ══ AVISO ══ */
.tm-warning {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #94a3b8;
  text-align: center;
  justify-content: center;
  margin: 4px 0 4px;
}
.tm-warning-icon { font-size: 14px; }

/* ══ AÇÕES ══ */
.tm-actions {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 24px 22px;
  border-top: 1px solid #f1f5f9;
}
@media (max-width: 360px) {
  .tm-actions { padding: 14px 16px 18px; }
}

.tm-btn-aceitar {
  width: 100%;
  border: none;
  background: linear-gradient(135deg, #ff8049, #ff9a6a);
  color: #fff;
  font-size: 14px;
  border-radius: 14px;
  padding: 13px;
  box-shadow: 0 8px 20px rgba(255, 128, 73, 0.32);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: opacity 0.15s, transform 0.1s;
}
.tm-btn-aceitar:active { transform: scale(0.98); }
.tm-btn-aceitar:disabled {
  opacity: 0.45;
  box-shadow: none;
}
.tm-btn-spinner {
  width: 18px;
  height: 18px;
  --color: #fff;
}

.tm-btn-recusar {
  width: 100%;
  border: none;
  background: transparent;
  color: #94a3b8;
  font-size: 12.5px;
  border-radius: 14px;
  padding: 8px;
  text-decoration: underline;
  text-underline-offset: 2px;
}
.tm-btn-recusar:disabled {
  opacity: 0.5;
}
</style>