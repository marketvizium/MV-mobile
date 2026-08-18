<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="login-wrapper">
        

        <div class="content-inner">
          <div class="content-top">
            <div class="back-row" @click="$router.push({name: 'BemVindo'})">
              <div class="back-btn">
                <span class="material-symbols-outlined back-icon">arrow_back_ios</span>
              </div>
              <div class="back-text">
                Voltar
              </div>
            </div>
            <div class="header-section">
              <h1 class="poppins-bold title">Login</h1>
              <p class="poppins-regular subtitle">Seja bem-vindo ao nosso app.</p>
            </div>
    
            <div class="form-section">
              <div class="field">
                <label for="email" class="poppins-medium label">Endereço de Email</label>
                <InputText 
                  id="email" 
                  type="email"
                  v-model="pacoteUsuario.email" 
                  placeholder="Ex: usuarioexemplo@com" 
                  class="w-full custom-input poppins-regular" 
                  style="width: 100%;"
                />
              </div>
    
              <div class="field">
                <div class="label-row">
                  <label for="password" class="poppins-medium label">Senha</label>
                  <a @click="$router.push({name: 'EsqueciSenha'})" class="forgot-link poppins-regular">Esqueceu a senha?</a>
                </div>
                <Password 
                  id="password" 
                  v-model="pacoteUsuario.passe_usuario" 
                  toggleMask 
                  :feedback="false" 
                  placeholder="••••••••"
                  fluid
                  class="custom-password"
                />
              </div>
    
              <div class="checkbox-container">
                <ion-checkbox mode="md" v-model="pacoteUsuario.manter_conectado" class="custom-checkbox"></ion-checkbox>
                <span class="poppins-regular checkbox-text">Me mantenha conectado</span>
              </div>
            </div>
          </div>
  
          <div class="actions-section">

            <div class="margin-section-button">
              <ion-button expand="block" class="main-button poppins-semibold" @click="handleLogin">
                Login
              </ion-button>
              <p style="color: #888; font-size: clamp(0.6rem, 3.5vw, 0.9rem); text-align: center;">
                Ao fazer login, você concorda com nossa 
                <a style="color: #555; font-weight: 500;" href="https://market-vizium.cloud/legal"> Política de Privacidade</a> e 
                <a style="color: #555; font-weight: 500;" href="https://market-vizium.cloud/legal"> Termos de Uso</a>
                e declara estar ciente das condições de uso da plataforma.
              </p>
            </div>
            
            <!--
            <div class="divider">
              <span class="line"></span>
              <span class="divider-text poppins-regular">Entre também com</span>
              <span class="line"></span>
            </div>
            -->
            
            <!--
            <ion-button expand="block" fill="clear" class="google-button poppins-medium">
              <img src="../assets/google-icon.png" alt="Google" slot="start" class="google-logo" />
              Continuar com Google
            </ion-button>
            -->
            
            

            <p class="footer-text poppins-regular">
              Você é vendedor e não <br> possui conta? <a @click="irPara('/cadastro')" class="brand-link">Criar uma nova conta!</a>
            </p>
          </div>
        </div>

      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonPage, IonContent, IonButton, IonCheckbox } from '@ionic/vue';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import { useAuthStore } from '@/stores/auth';
import exibeErro from '@/utils/ExibeErro';
import { toastService } from '@/services/toast';
import pkg from '../../package.json';
import { api } from '@/services/api';

export default defineComponent({
  name: 'LoginPage',
  components: { 
    IonPage, 
    IonContent, 
    IonButton, 
    IonCheckbox,
    InputText, 
    Password 
  },
  data() {
    return {
      pacoteUsuario:{
        email: "",
        passe_usuario: "",
        manter_conectado: true,
      },
      loading: false
    };
  },
  methods: {
    irPara(rota: string) {
      this.$router.push(rota);
    },
    async handleLogin() {

       try{

        const payloadTermos = {
          email: this.pacoteUsuario.email,
          versao_term: pkg.termosuso,
          versao_priv: pkg.polpriv
        }

        const termosAceitos = await api.post('/mvpu/usuario/conTermos/', payloadTermos)

        if(!termosAceitos.data.data.length){

            const payloadCadastrarTermos = {
              email: this.pacoteUsuario.email,
              passe_usuario: this.pacoteUsuario.passe_usuario,
              versao_term: pkg.termosuso,
              versao_priv: pkg.polpriv
            }

            await api.post('/mvpu/usuario/termos/', payloadCadastrarTermos)
        }

        //this.loading = true
        const auth = useAuthStore()
        await auth.login(this.pacoteUsuario)

        this.$toast.add({ 
          severity: 'success', 
          summary: 'Sucesso', 
          detail: 'Seja bem vindo!', 
          life: 3000 
        });

        this.loading = false

      }catch(e){

        //this.loading = false
        exibeErro(e, this.$toast)

      }
    }
  }
});
</script>

<style scoped>
/* ===========================
   BASE (mobile-first)
   =========================== */
* {
  box-sizing: border-box;
}

.login-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-height: 100%;
  width: 100%;
  padding: clamp(20px, 6vh, 40px) clamp(14px, 5vw, 25px) clamp(16px, 4vh, 30px);
  background: #ffffff;
  overflow-x: hidden;
}

.content-inner {
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
}

/* Botão Voltar */
.back-row {
  display: flex;
  gap: 2px;
  font-size: clamp(15px, 4vw, 18px);
  align-items: center;
  cursor: pointer;
}

.back-icon {
  font-size: clamp(16px, 4vw, 20px);
  color: #000;
}

.back-text {
  color: #333;
  font-family: 'Poppins';
  margin-bottom: 3px;
  font-weight: 500;
  font-size: clamp(0.85rem, 3vw, 1rem);
}

/* Cabeçalho */
.header-section {
  margin-top: clamp(10px, 3vh, 18px);
}

.title {
  font-size: clamp(1.6rem, 7vw, 2.2rem);
  color: #1e293b;
  margin-bottom: 8px;
  line-height: 1.2;
}

.subtitle {
  color: #64748b;
  font-size: clamp(0.85rem, 3.5vw, 1.1rem);
  margin-bottom: clamp(18px, 5vh, 30px);
}

/* Formulário */
.field {
  margin-bottom: clamp(14px, 4vw, 20px);
}

.label {
  display: block;
  margin-bottom: 8px;
  color: #475569;
  font-size: clamp(0.8rem, 3vw, 0.95rem);
}

.label-row {
  display: flex; 
  align-items: center; 
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 4px;
}

/* Customização InputText PrimeVue */
.custom-input {
  border-radius: 12px !important;
  border: 1px solid #cbd5e1 !important;
  padding: clamp(10px, 3vw, 12px) clamp(12px, 4vw, 15px) !important;
  background-color: #ffffff !important;
  color: #1e293b !important;
  font-size: clamp(0.85rem, 3.2vw, 1rem) !important;
}

/* CORREÇÃO: Estilização do Password PrimeVue */
:deep(.custom-password .p-password-input) {
  width: 100% !important;
  border-radius: 12px !important;
  border: 1px solid #cbd5e1 !important;
  padding: clamp(10px, 3vw, 12px) clamp(12px, 4vw, 15px) !important;
  background-color: #ffffff !important; /* Remove fundo preto */
  color: #1e293b !important;            /* Texto visível */
  font-size: clamp(0.85rem, 3.2vw, 1rem) !important;
}

:deep(.p-password-input:focus) {
  border-color: #ff8049 !important;
  box-shadow: 0 0 0 1px #ff8049 !important;
}

:deep(.p-password-toggle-mask-icon) {
  color: #64748b !important;
}

.forgot-link {
  color: #ff8049;
  font-size: clamp(0.75rem, 2.8vw, 0.85rem);
  text-decoration: none;
  white-space: nowrap;
}

/* Checkbox Personalizado */
.checkbox-container {
  display: flex;
  align-items: center;
  margin-top: clamp(10px, 3vh, 15px);
}

.checkbox-text {
  margin-left: 10px;
  color: #64748b;
  font-size: clamp(0.78rem, 3vw, 0.9rem);
}

.custom-checkbox {
  --border-color: #cbd5e1; /* Borda visível desmarcada */
  --checkbox-background-checked: #ff8049;
  --border-color-checked: #ff8049;
  --checkmark-color: #ffffff;
  --border-radius: 4px;
  width: clamp(18px, 5vw, 20px);
  height: clamp(18px, 5vw, 20px);
  flex-shrink: 0;
}

/* Ações e Botões */
.actions-section {
  margin-top: clamp(20px, 5vh, 30px);
}

.main-button {
  --background: #ff8049;
  --border-radius: 25px;
  --box-shadow: none;
  --color: #ffffff;
  height: clamp(48px, 12vw, 56px);
  font-size: clamp(0.9rem, 3.5vw, 1.1rem);
  margin-top: 10px;
}

.margin-section-button{
  margin-bottom: clamp(30px, 10vh, 80px);
}

.divider {
  display: flex;
  align-items: center;
  margin: 25px 0;
}

.line {
  flex: 1;
  height: 1px;
  background: #e2e8f0;
}

.divider-text {
  padding: 0 15px;
  color: #94a3b8;
  font-size: 0.85rem;
}

.google-button {
  --background: #f1f5f9;
  --color: #475569;
  --border-radius: 25px;
  height: 56px;
  font-size: 1rem;
}

.google-logo {
  width: 24px;
  margin-right: 12px;
}

.footer-text {
  text-align: center;
  margin-top: clamp(16px, 4vh, 25px);
  color: #64748b;
  font-size: clamp(0.8rem, 3.2vw, 0.95rem);
  line-height: 1.5;
}

.brand-link {
  color: #ff8049;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
}

/* ===========================
   TELAS MUITO PEQUENAS (320px)
   =========================== */
@media (max-width: 360px) {
  .login-wrapper {
    padding: 16px 12px 14px;
  }

  .back-text {
    font-size: 0.8rem;
  }

  .header-section {
    margin-top: 8px;
  }

  .title {
    font-size: 1.5rem;
    margin-bottom: 4px;
  }

  .subtitle {
    font-size: 0.78rem;
    margin-bottom: 14px;
  }

  .field {
    margin-bottom: 12px;
  }

  .label {
    font-size: 0.75rem;
  }

  .forgot-link {
    font-size: 0.7rem;
  }

  .checkbox-text {
    font-size: 0.72rem;
  }

  .actions-section {
    margin-top: 16px;
  }

  .main-button {
    height: 46px;
    font-size: 0.85rem;
  }

  .margin-section-button{
    margin-bottom: 24px;
  }

  .footer-text {
    font-size: 0.75rem;
    margin-top: 14px;
  }
}

/* ===========================
   TELAS BAIXAS (altura curta)
   =========================== */
@media (max-height: 650px) {
  .login-wrapper {
    padding-top: 16px;
    padding-bottom: 12px;
  }

  .header-section {
    margin-top: 6px;
  }

  .subtitle {
    margin-bottom: 14px;
  }

  .field {
    margin-bottom: 10px;
  }

  .actions-section {
    margin-top: 14px;
  }

  .margin-section-button {
    margin-bottom: 16px;
  }

  .footer-text {
    margin-top: 12px;
  }
}

/* ===========================
   TELAS MAIORES (tablets)
   =========================== */
@media (min-width: 600px) {
  .content-inner {
    max-width: 480px;
  }
}
</style>