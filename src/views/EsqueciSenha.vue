<template>
  <ion-page class="forgot-page">
    <ion-content :fullscreen="true">
      <div class="forgot-wrapper">

        <!-- ── NAV HEADER ── -->
        <div class="nav-header">
          <button class="back-button" @click="handleBack">
            <div class="back-button-container">
              <span class="material-symbols-outlined">arrow_back_ios</span>
              <span class="poppins-medium">Voltar</span>
            </div>
          </button>

          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: (currentStep / 3) * 100 + '%' }"></div>
          </div>
          <div class="step-indicator poppins-medium">{{ currentStep }}/3</div>
        </div>

        <!-- ── STEPS ── -->
        <transition name="step-fade" mode="out-in">

          <!-- STEP 1: E-MAIL -->
          <div v-if="currentStep === 1" class="step-content" key="step1">
            <div class="step-icon-wrap">
              <span class="material-symbols-outlined step-icon">lock_reset</span>
            </div>
            <h2 class="poppins-bold step-title">Esqueceu sua senha?</h2>
            <p class="poppins-regular step-subtitle">
              Informe o e-mail cadastrado na sua conta e enviaremos um código de verificação.
            </p>

            <!-- ── SELEÇÃO DE TIPO DE USUÁRIO ── -->
            <div class="form-group">
              <label class="label poppins-medium">Você é vendedor ou faz parte de um varejo?</label>
              <div class="user-type-selector">
                <button
                  type="button"
                  :class="['user-type-option poppins-medium', tipoUsuario === 'vendedor' ? 'user-type-selected' : '']"
                  @click="tipoUsuario = 'vendedor'"
                >
                  <span class="material-symbols-outlined user-type-icon">store</span>
                  Sou vendedor
                  <span v-if="tipoUsuario === 'vendedor'" class="material-symbols-outlined check-icon">check_circle</span>
                </button>
                <button
                  type="button"
                  :class="['user-type-option poppins-medium', tipoUsuario === 'cliente' ? 'user-type-selected' : '']"
                  @click="tipoUsuario = 'cliente'"
                >
                  <span class="material-symbols-outlined user-type-icon">shopping_bag</span>
                  Faço parte de um varejo
                  <span v-if="tipoUsuario === 'cliente'" class="material-symbols-outlined check-icon">check_circle</span>
                </button>
              </div>
            </div>

            <div class="form-group">
              <label class="label poppins-medium">Endereço de E-mail</label>
              <InputText
                type="email"
                v-model="email"
                placeholder="email@exemplo.com"
                class="w-full custom-input poppins-regular"
                style="width: 100%;"
                @keyup.enter="handleNext"
              />
              <small v-if="errors.email" class="error-message">{{ errors.email }}</small>
            </div>
          </div>

          <!-- STEP 2: CÓDIGO OTP -->
          <div v-else-if="currentStep === 2" class="step-content" key="step2">
            <div class="step-icon-wrap">
              <span class="material-symbols-outlined step-icon">mark_email_read</span>
            </div>
            <h2 class="poppins-bold step-title">Código de verificação</h2>
            <p class="poppins-regular step-subtitle">
              Enviamos um código de 6 dígitos para <strong>{{ email }}</strong>.
              <a class="brand-link" @click="voltarParaEmail">E-mail errado?</a>
            </p>

            <div class="otp-container">
              <input
                v-for="(_, index) in 6"
                :key="index"
                :id="'otp-' + index"
                type="text"
                maxlength="1"
                v-model="otpDigits[index]"
                @input="handleOtpInput($event, index)"
                @keydown.backspace="handleOtpBackspace($event, index)"
                class="otp-input poppins-bold"
                inputmode="numeric"
                autocomplete="one-time-code"
              />
            </div>

            <small v-if="errors.otp" class="error-message text-center">{{ errors.otp }}</small>

            <p class="resend-text poppins-regular">
              Não recebeu o código?
              <a
                class="brand-link"
                :class="{ 'link-disabled': reenvioTimer > 0 }"
                @click="reenviarCodigo"
              >
                {{ reenvioTimer > 0 ? `Reenviar em ${reenvioTimer}s` : 'Reenviar código' }}
              </a>
            </p>
          </div>

          <!-- STEP 3: NOVA SENHA -->
          <div v-else-if="currentStep === 3" class="step-content" key="step3">
            <div class="step-icon-wrap">
              <span class="material-symbols-outlined step-icon">key</span>
            </div>
            <h2 class="poppins-bold step-title">Crie uma nova senha</h2>
            <p class="poppins-regular step-subtitle">
              Escolha uma senha segura para proteger sua conta.
            </p>

            <div class="form-group">
              <label class="label poppins-medium">Nova Senha</label>
              <Password
                v-model="novaSenha"
                toggleMask
                placeholder="••••••••"
                fluid
                class="custom-password"
                :feedback="true"
              />
              <small v-if="errors.novaSenha" class="error-message">{{ errors.novaSenha }}</small>
            </div>

            <div class="form-group">
              <label class="label poppins-medium">Confirmar Senha</label>
              <Password
                v-model="confirmarSenha"
                toggleMask
                placeholder="••••••••"
                fluid
                class="custom-password"
                :feedback="false"
                @keyup.enter="handleNext"
              />
              <small v-if="errors.confirmarSenha" class="error-message">{{ errors.confirmarSenha }}</small>
            </div>

            <div class="senha-requisitos">
              <div :class="['req-item poppins-regular', novaSenha.length >= 8 ? 'req-ok' : 'req-pending']">
                <span class="material-symbols-outlined req-icon">
                  {{ novaSenha.length >= 8 ? 'check_circle' : 'radio_button_unchecked' }}
                </span>
                Mínimo 8 caracteres
              </div>
              <div :class="['req-item poppins-regular', /[A-Z]/.test(novaSenha) ? 'req-ok' : 'req-pending']">
                <span class="material-symbols-outlined req-icon">
                  {{ /[A-Z]/.test(novaSenha) ? 'check_circle' : 'radio_button_unchecked' }}
                </span>
                Uma letra maiúscula
              </div>
              <div :class="['req-item poppins-regular', /[0-9]/.test(novaSenha) ? 'req-ok' : 'req-pending']">
                <span class="material-symbols-outlined req-icon">
                  {{ /[0-9]/.test(novaSenha) ? 'check_circle' : 'radio_button_unchecked' }}
                </span>
                Um número
              </div>
            </div>
          </div>

        </transition>

        <!-- ── FOOTER / BOTÃO ── -->
        <div class="footer-actions">
          <ion-button
            expand="block"
            class="main-button poppins-semibold"
            @click="handleNext"
            :disabled="loading"
          >
            <span v-if="!loading">{{ labelBotao }}</span>
            <ion-spinner v-else name="crescent" style="width: 22px; height: 22px;"></ion-spinner>
          </ion-button>
        </div>

      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonPage, IonContent, IonButton, IonSpinner } from '@ionic/vue';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import { api } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import exibeErro from '@/utils/ExibeErro';

export default defineComponent({
  name: 'EsqueciSenhaPage',

  components: {
    IonPage,
    IonContent,
    IonButton,
    IonSpinner,
    InputText,
    Password,
  },

  data() {
    return {
      currentStep: 1,
      loading: false,

      // Step 1
      email: '',
      tipoUsuario: 'vendedor' as 'vendedor' | 'cliente',

      // Código gerado no front (igual ao generatedCode do CadastroUsuario)
      generatedCode: '' as string,

      // Step 2 — OTP digitado pelo usuário
      otpDigits: ['', '', '', '', '', ''] as string[],
      reenvioTimer: 0,
      reenvioInterval: null as any,

      // Step 3 — Nova senha
      novaSenha: '',
      confirmarSenha: '',

      errors: {
        email: '',
        otp: '',
        novaSenha: '',
        confirmarSenha: '',
      },
    };
  },

  computed: {
    labelBotao(): string {
      const labels: Record<number, string> = {
        1: 'Enviar código',
        2: 'Verificar código',
        3: 'Salvar nova senha',
      };
      return labels[this.currentStep] || 'Continuar';
    },

    otpCompleto(): string {
      return this.otpDigits.join('');
    },
  },

  methods: {

    // ─── NAVEGAÇÃO ────────────────────────────────────────────────
    handleBack() {
      if (this.currentStep > 1) {
        this.currentStep--;
        this.limparErros();
      } else {
        this.$router.back();
      }
    },

    voltarParaEmail() {
      this.otpDigits     = ['', '', '', '', '', ''];
      this.generatedCode = '';
      this.limparErros();
      this.pararTimerReenvio();
      this.currentStep = 1;
    },

    limparErros() {
      this.errors = { email: '', otp: '', novaSenha: '', confirmarSenha: '' };
    },

    // ─── FLUXO PRINCIPAL ──────────────────────────────────────────
    async handleNext() {
      this.limparErros();
      if      (this.currentStep === 1) await this.enviarCodigo();
      else if (this.currentStep === 2)       this.verificarCodigo();
      else if (this.currentStep === 3) await this.salvarNovaSenha();
    },

    // ─── STEP 1: GERAR CÓDIGO E ENVIAR E-MAIL (igual ao CadastroUsuario) ───
    async enviarCodigo() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.email)) {
        this.errors.email = 'Informe um e-mail válido.';
        return;
      }

      // Gera o código de 6 dígitos no front — mesma lógica do CadastroUsuario
      this.generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
      this.otpDigits     = ['', '', '', '', '', ''];


      const payload = {
        remetente:    'marketvizium@gmail.com',
        destinatario: this.email,
        assunto:      `${this.generatedCode} é o seu código de verificação`,
        texto:        `Seu código de verificação é ${this.generatedCode}. Use-o para redefinir sua senha no MarketVizium.`,
        template: `
          <div style="background-color: #000000; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; text-align: center;">
            <div style="max-width: 500px; margin: 0 auto; background-color: #121212; border-radius: 24px; padding: 40px; border: 1px solid #222222;">

              <div style="margin-bottom: 30px;">
                <h1 style="color: #ffffff; font-size: 24px; letter-spacing: -1px; margin: 0;">Market<span style="color: #ff8049;">Vizium</span></h1>
              </div>

              <h2 style="color: #ffffff; font-size: 20px; font-weight: 600; margin-bottom: 10px;">Redefinição de senha</h2>
              <p style="color: #94a3b8; font-size: 15px; line-height: 1.5; margin-bottom: 30px;">
                Para garantir a segurança da sua conta e redefinir sua senha, utilize o código de segurança abaixo:
              </p>

              <div style="background-color: #1a1a1a; border-radius: 16px; padding: 25px; border: 1px solid #333333; margin-bottom: 30px;">
                <span style="color: #ff8049; font-size: 36px; font-weight: 700; letter-spacing: 8px; display: block;">
                  ${this.generatedCode}
                </span>
              </div>

              <p style="color: #64748b; font-size: 13px; margin-bottom: 30px;">
                Este código expira em 10 minutos. Se você não solicitou este e-mail, pode ignorá-lo com segurança.
              </p>

              <div style="border-top: 1px solid #222222; margin-bottom: 20px;"></div>

              <p style="color: #475569; font-size: 11px; line-height: 1.4;">
                © 2026 MarketVizium Tecnologia Ltda.<br>
                Esta é uma mensagem automática, por favor não responda.
              </p>
            </div>
          </div>
        `
      };

      try {
        this.loading = true;
        await api.post('/mvpu/usuario/enviarEmail/', payload);

        this.$toast.add({
          severity: 'info',
          summary:  'E-mail enviado',
          detail:   'Um código de verificação foi enviado para você.',
          life:     3000,
        });

        this.currentStep = 2;
        this.iniciarTimerReenvio();

      } catch (e) {
        this.$toast.add({
          severity: 'error',
          summary:  'Falha ao enviar o e-mail',
          detail:   'Tente novamente mais tarde...',
          life:     3000,
        });
      } finally {
        this.loading = false;
      }
    },

    // ─── STEP 2: COMPARAÇÃO LOCAL (igual ao validateStep case 6 do CadastroUsuario) ──
    verificarCodigo() {
      const digitado = this.otpDigits.join('');

      if (digitado.length < 6) {
        this.errors.otp = 'Insira o código completo de 6 dígitos.';
        return;
      }

      if (digitado !== this.generatedCode) {
        this.errors.otp = 'Código incorreto. Verifique seu e-mail.';
        this.otpDigits  = ['', '', '', '', '', ''];
        this.$nextTick(() => {
          const first = document.getElementById('otp-0') as HTMLInputElement;
          if (first) first.focus();
        });
        return;
      }

      // Código correto — avança
      this.pararTimerReenvio();
      this.currentStep = 3;
    },

    // ─── STEP 3: ÚNICA REQUISIÇÃO AO BACKEND ─────────────────────
    async salvarNovaSenha() {
      let valido = true;

      if (this.novaSenha.length < 8) {
        this.errors.novaSenha = 'A senha deve ter no mínimo 8 caracteres.';
        valido = false;
      }
      if (this.novaSenha !== this.confirmarSenha) {
        this.errors.confirmarSenha = 'As senhas não coincidem.';
        valido = false;
      }
      if (!valido) return;

      try {
        this.loading = true;

        // Requisição ao backend: email + nova senha + tipo de usuário
        await api.post('/mvpu/usuario/redefinirSenha', {
          email        :      this.email,
          passe_usuario: this.novaSenha,
          tipo_usuario :      this.tipoUsuario,
        });

        // Login automático (igual ao CadastroUsuario.finalizeRegistration)
        const authStore = useAuthStore();
        await authStore.login({
          email:         this.email,
          passe_usuario: this.novaSenha,
        });

        this.$toast.add({
          severity: 'success',
          summary:  'Senha redefinida',
          detail:   'Sua senha foi atualizada com sucesso!',
          life:     3000,
        });

      } catch (e) {
        exibeErro(e, this.$toast);
      } finally {
        this.loading = false;
      }
    },

    // ─── REENVIO COM TIMER ────────────────────────────────────────
    iniciarTimerReenvio() {
      this.reenvioTimer = 60;
      this.pararTimerReenvio();
      this.reenvioInterval = setInterval(() => {
        this.reenvioTimer--;
        if (this.reenvioTimer <= 0) this.pararTimerReenvio();
      }, 1000);
    },

    pararTimerReenvio() {
      if (this.reenvioInterval) {
        clearInterval(this.reenvioInterval);
        this.reenvioInterval = null;
      }
    },

    // Reenvio: gera novo código e chama enviarEmail novamente (igual ao generateAndSendCode)
    async reenviarCodigo() {
      if (this.reenvioTimer > 0) return;
      await this.enviarCodigo();
    },

    // ─── OTP HANDLERS (idêntico ao CadastroUsuario) ──────────────
    handleOtpInput(event: any, index: number) {
      const val = (event.target as HTMLInputElement).value.replace(/\D/g, '');
      (event.target as HTMLInputElement).value = val;
      this.otpDigits[index] = val;

      if (val && index < 5) {
        const next = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
        if (next) next.focus();
      }

      if (this.otpCompleto.length === 6) this.limparErros();
    },

    handleOtpBackspace(event: any, index: number) {
      if (!this.otpDigits[index] && index > 0) {
        const prev = document.getElementById(`otp-${index - 1}`) as HTMLInputElement;
        if (prev) {
          prev.focus();
          this.otpDigits[index - 1] = '';
        }
      }
    },
  },

  beforeUnmount() {
    this.pararTimerReenvio();
  },
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

.poppins-regular  { font-family: 'Poppins', sans-serif; font-weight: 400; }
.poppins-medium   { font-family: 'Poppins', sans-serif; font-weight: 500; }
.poppins-semibold { font-family: 'Poppins', sans-serif; font-weight: 600; }
.poppins-bold     { font-family: 'Poppins', sans-serif; font-weight: 700; }

.forgot-page { --background: #ffffff; }

.forgot-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 50px 25px 40px;
  background: #ffffff;
  box-sizing: border-box;
}

/* ── NAV HEADER ── */
.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 40px;
}

.back-button {
  background: none;
  border: none;
  color: #222;
  padding: 8px 0;
  cursor: pointer;
}

.back-button-container {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 15px;
  color: #222;
}

.back-button-container .material-symbols-outlined { font-size: 18px; }

.progress-bar {
  flex: 1;
  height: 5px;
  background: #f1f5f9;
  border-radius: 10px;
  margin: 0 16px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #FF8049;
  border-radius: 10px;
  transition: width 0.4s ease;
}

.step-indicator { font-size: 0.85rem; color: #94a3b8; }

/* ── STEP CONTENT ── */
.step-content { flex: 1; }

.step-icon-wrap {
  width: 62px;
  height: 62px;
  border-radius: 18px;
  background: rgba(255, 128, 73, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 22px;
}

.step-icon { font-size: 30px; color: #FF8049; }

.step-title {
  font-size: 1.8rem;
  color: #222;
  line-height: 1.2;
  margin-bottom: 10px;
}

.step-subtitle {
  font-family: 'Poppins', sans-serif;
  font-weight: 400;
  color: #64748b;
  font-size: 0.97rem;
  margin-bottom: 32px;
  line-height: 1.6;
}

.step-subtitle strong { color: #222; font-weight: 600; }

/* ── FORMULÁRIO ── */
.form-group { margin-bottom: 22px; }

.label {
  display: block;
  margin-bottom: 8px;
  color: #475569;
  font-size: 0.9rem;
}

/* ── SELEÇÃO DE TIPO DE USUÁRIO ── */
.user-type-selector {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.user-type-option {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 14px 16px;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  font-family: 'Poppins', sans-serif;
  font-weight: 500;
  font-size: 0.92rem;
  color: #475569;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
  position: relative;
}

.user-type-option:hover {
  border-color: #FF8049;
  background: #fff8f5;
  color: #222;
}

.user-type-selected {
  border-color: #FF8049 !important;
  background: rgba(255, 128, 73, 0.06) !important;
  color: #FF8049 !important;
}

.user-type-icon {
  font-size: 20px;
  color: inherit;
  flex-shrink: 0;
}

.check-icon {
  font-size: 18px;
  color: #FF8049;
  margin-left: auto;
  flex-shrink: 0;
}

.custom-input {
  border-radius: 14px !important;
  border: 1px solid #e2e8f0 !important;
  padding: 14px 18px !important;
  font-family: 'Poppins', sans-serif !important;
  font-size: 0.95rem !important;
  color: #1e293b !important;
  background: #fff !important;
  width: 100% !important;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
}

.custom-input:focus {
  border-color: #FF8049 !important;
  box-shadow: 0 0 0 1px #FF8049 !important;
}

:deep(.custom-password .p-password-input) {
  width: 100% !important;
  border-radius: 14px !important;
  border: 1px solid #e2e8f0 !important;
  padding: 14px 18px !important;
  font-family: 'Poppins', sans-serif !important;
  background-color: #ffffff !important;
  color: #1e293b !important;
  font-size: 0.95rem !important;
}

:deep(.p-password-input:focus) {
  border-color: #FF8049 !important;
  box-shadow: 0 0 0 1px #FF8049 !important;
}

:deep(.p-password-toggle-mask-icon) { color: #64748b !important; }

/* ── OTP ── */
.otp-container {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin: 28px 0 12px;
  width: 100%;
}

.otp-input {
  flex: 1;
  height: 58px;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  text-align: center;
  font-size: 1.5rem;
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  background: #f8fafc;
  width: 100%;
  color: #222;
  transition: all 0.2s;
  outline: none;
  caret-color: #FF8049;
}

.otp-input:focus {
  border-color: #FF8049;
  background: #fff;
  box-shadow: 0 0 0 2px rgba(255, 128, 73, 0.18);
}

/* ── REENVIO ── */
.resend-text {
  text-align: center;
  margin-top: 14px;
  color: #64748b;
  font-size: 0.88rem;
  font-family: 'Poppins', sans-serif;
}

.brand-link {
  color: #FF8049;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
}

.link-disabled {
  color: #94a3b8 !important;
  cursor: not-allowed;
  pointer-events: none;
}

/* ── REQUISITOS DE SENHA ── */
.senha-requisitos {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
  padding: 14px 16px;
  background: #f8fafc;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
}

.req-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  transition: color 0.2s;
}

.req-icon { font-size: 16px; }
.req-pending { color: #94a3b8; }
.req-ok { color: #10b981; }
.req-ok .req-icon { color: #10b981; }

/* ── ERROS ── */
.error-message {
  display: block;
  color: #ef4444;
  font-size: 0.78rem;
  font-family: 'Poppins', sans-serif;
  margin-top: 6px;
}

.text-center { text-align: center; }

/* ── BOTÃO PRINCIPAL ── */
.footer-actions {
  margin-top: auto;
  padding-top: 30px;
}

.main-button {
  --background: #FF8049;
  --background-activated: #e66a35;
  --border-radius: 18px;
  --box-shadow: 0 6px 20px rgba(255, 128, 73, 0.35);
  --color: #ffffff;
  height: 58px;
  font-size: 1rem;
  letter-spacing: 0.02em;
}

/* ── TRANSIÇÃO DE STEPS ── */
.step-fade-enter-active,
.step-fade-leave-active { transition: all 0.28s ease; }
.step-fade-enter-from   { opacity: 0; transform: translateX(22px); }
.step-fade-leave-to     { opacity: 0; transform: translateX(-22px); }
</style>