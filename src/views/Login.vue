<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="login-wrapper">

        <!-- LEFT: marketing / visual panel — desktop only -->
        <div class="visual">
          <div
            v-for="(slide, i) in slidesData"
            :key="'bg' + i"
            class="bg-layer"
            :style="{ backgroundImage: 'url(' + slide.img + ')', opacity: i === current ? 1 : 0 }"
          ></div>
          <div class="visual-overlay"></div>


          <div class="caption-wrap">
            <div class="slides">
              <div
                v-for="(slide, i) in slidesData"
                :key="'slide' + i"
                class="slide"
                :class="{ active: i === current }"
              >
                <span class="material-symbols-outlined slide-icon">{{ slide.icon }}</span>
                <h2>{{ slide.title }}</h2>
                <p>{{ slide.desc }}</p>
              </div>
            </div>

            <div class="dots">
              <div
                v-for="(slide, i) in slidesData"
                :key="'dot' + i"
                class="dot"
                :class="{ active: i === current, done: i < current }"
                :style="{ '--dur': slideDuration + 'ms' }"
                @click="goTo(i)"
              ></div>
            </div>
          </div>
        </div>

        <!-- RIGHT: login form -->
        <div class="content-inner">

          <div>

          </div>

          <div>

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
  
  
  
              
            </div>
          </div>

          <p class="footer-text poppins-regular">
              <div style="color: #888; font-size: clamp(0.6rem, 3.5vw, 0.9rem); text-align: center; width: 100%;">v{{ version }}</div>
              Você é vendedor e não <br> possui conta? <a @click="irPara('/cadastro')" class="brand-link">Criar uma nova conta!</a>
           </p>
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
      loading: false,
      version: pkg.version,

      // ---- painel de marketing (desktop) ----
      current: 0,
      timer: null as ReturnType<typeof setInterval> | null,
      slideDuration: 6000,
      slidesData: [
        {
          icon: 'hub',
          title: 'Um jeito mais inteligente de comprar',
          desc: 'Do pedido direto à cotação em massa: peça direto ao fornecedor, lance cotações ilimitadas ou deixe a automação encontrar a melhor oferta por você.',
          img: new URL('../assets/img/loading-a.png', import.meta.url).href
        },
        {
          icon: 'diversity_3',
          title: 'Conecte-se com toda a rede Marviz',
          desc: 'Fale com os fornecedores de sempre ou amplie sua cotação para outros vendedores da rede e aumente as chances de fechar um preço melhor.',
          img: new URL('../assets/img/loading-b.png', import.meta.url).href
        },
        {
          icon: 'trending_up',
          title: 'Marviz Trends: fique à frente do mercado',
          desc: 'Descubra tendências e lançamentos do seu segmento direto na tela onde você já faz suas cotações, sem sair do sistema.',
          img: new URL('../assets/img/loading-c.png', import.meta.url).href
        }
      ]
    };
  },
  mounted() {
    this.resetTimer();
  },
  beforeUnmount() {
    if (this.timer) clearInterval(this.timer);
  },
  methods: {
    irPara(rota: string) {
      this.$router.push(rota);
    },
    goTo(i: number) {
      this.current = i;
      this.resetTimer();
    },
    nextSlide() {
      this.current = (this.current + 1) % this.slidesData.length;
    },
    resetTimer() {
      if (this.timer) clearInterval(this.timer);
      this.timer = setInterval(this.nextSlide, this.slideDuration);
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

/* ===========================
   PAINEL DE MARKETING (visual)
   escondido no mobile, aparece no desktop
   =========================== */
.visual {
  display: none;
  position: relative;
  overflow: hidden;
  background: #111;
  flex-direction: column;
  justify-content: flex-end;
}

.bg-layer {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  transition: opacity 1.2s ease;
}

.visual-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,.3) 0%, rgba(0,0,0,0.8) 100%);
  pointer-events: none;
  z-index: 2;
}

.brand {
  position: relative;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 32px 44px 0;
}

.brand .logo {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: rgba(255,255,255,.95);
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand .logo .material-symbols-outlined {
  font-size: 20px;
  color: #ff8049;
}

.brand-name {
  color: #fff;
  font-weight: 600;
  font-size: 16px;
  letter-spacing: .2px;
  font-family: 'Poppins', sans-serif;
}

/* legendas do carrossel — alinhadas à esquerda, com o contador
   diretamente abaixo, sem fundo (transparente) */
.caption-wrap {
  position: relative;
  z-index: 3;
  width: 100%;
  padding: 0 44px 46px;
  text-align: left;
  background: transparent;
}

.slides {
  position: relative;
  min-height: 168px;
}

.slide {
  position: absolute;
  inset: 0;
  text-align: left;
  opacity: 0;
  transform: translateY(14px);
  transition: opacity .6s ease, transform .6s ease;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-start;
  pointer-events: none;
}

.slide.active {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.slide-icon {
  color: #fff;
  font-size: 22px;
  margin-bottom: 10px;
  text-shadow: 0 2px 12px rgba(0,0,0,.35);
}

.slide h2 {
  color: #fff;
  font-size: 26px;
  font-weight: 700;
  line-height: 1.25;
  max-width: 420px;
  text-shadow: 0 2px 18px rgba(0,0,0,.35);
  margin-bottom: 8px;
  font-family: 'Poppins', sans-serif;
}

.slide p {
  color: rgba(255,255,255,.85);
  font-size: 13.5px;
  font-weight: 300;
  max-width: 380px;
  line-height: 1.5;
  font-family: 'Poppins', sans-serif;
}

/* contador — logo abaixo da descrição, fundo transparente, sem "fita" */
.dots {
  display: flex;
  gap: 8px;
  margin-top: 18px;
  background: transparent;
}

.dot {
  height: 4px;
  border-radius: 4px;
  background: rgba(255,255,255,.35);
  width: 26px;
  cursor: pointer;
  overflow: hidden;
  position: relative;
}

.dot::after {
  content: "";
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 0%;
  background: #fff;
}

.dot.done::after { width: 100%; transition: none; }
.dot.active::after { width: 0%; animation: fillProgress var(--dur, 6s) linear forwards; }

@keyframes fillProgress {
  from { width: 0%; }
  to { width: 100%; }
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

/* ===========================
   DESKTOP — split-screen integrado à tela,
   SEM aparência de card (sem sombra, sem
   raio de borda, sem largura máxima central)
   =========================== */
@media (min-width: 900px) {
  .login-wrapper {
    flex-direction: row;
    align-items: stretch;
    justify-content: stretch;
    height: 100%;
    min-height: 100%;
    width: 100%;
    padding: 0;
    background: #ffffff;
  }

  .visual {
    display: flex;
    flex: 1.15;
    min-width: 0;
  }

  .content-inner {
    flex: 1;
    min-width: 0;
    max-width: none;
    margin: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 0 clamp(48px, 6vw, 96px);
    padding-top: 150px;
    padding-bottom: 10px;
    overflow-y: auto;
  }

  .content-top,
  .actions-section {
    width: 100%;
    max-width: 440px;
    margin: 0 auto;
  }
}
</style>