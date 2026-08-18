<template>
  <ion-page class="signup-page">
    <ion-content :fullscreen="true">
      <div class="signup-container" style="padding-top: 50px; padding-bottom: 40px;">
        
        <div class="nav-header">
          <button @click="handleBack" class="back-button">
            <div class="back-button-container" style="display: flex; align-items: center; justify-content: start;">
              <span class="material-symbols-outlined">arrow_back_ios</span>
              <span class="poppins-medium">Voltar</span>
            </div>
          </button>

          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: (currentStep / 6) * 100 + '%' }"></div>
          </div>
          <div class="step-indicator poppins-medium">{{ currentStep }}/6</div>
        </div>

        <transition name="step-fade" mode="out-in">
          <div v-if="currentStep === 1" class="step-content" key="step1">
            <h2 class="poppins-bold step-title">Como devemos te chamar?</h2>
            <p class="poppins-regular step-subtitle">Comece preenchendo seu nome completo e crie um nome de usuário único.</p>
            
            <div class="form-group">
              <label class="label poppins-medium">Nome Completo</label>
              <InputText v-model="form.nome" placeholder="Digite seu nome" class="w-full custom-input" autofocus />
            </div>

            <div class="form-group">
              <label class="label poppins-medium">Nome de Usuário</label>
              <div class="input-with-prefix" :class="{ 'input-error': errors.nome_usuario }">
                <span class="prefix">@</span>
                <InputText 
                  @input="checkViabilidadeDeInput('nome_usuario')" 
                  v-model="form.nome_usuario" 
                  :class="{ 'p-invalid': errors.nome_usuario }"
                  placeholder="usuario" 
                  class="w-full custom-input" 
                  style="width: 100%;"
                />
              </div>
              <small v-if="errors.nome_usuario" class="error-message">Este nome de usuário já está sendo usado.</small>
            </div>
          </div>

          <div v-else-if="currentStep === 2" class="step-content" key="step2">
            <h2 class="poppins-bold step-title">Segurança e Contato</h2>
            <p class="poppins-regular step-subtitle">Esses dados serão usados para validação e acesso à sua conta.</p>

            <div class="form-group">
              <label class="label poppins-medium">E-mail</label>
              <InputText 
                type="email" 
                @input="checkViabilidadeDeInput('email')" 
                v-model="form.email" 
                :class="{ 'p-invalid': errors.email }"
                placeholder="email@exemplo.com" 
                class="w-full custom-input" 
              />
              <small v-if="errors.email" class="error-message">Este e-mail já está cadastrado.</small>
            </div>

            <div class="form-group">
              <label class="label poppins-medium">Celular</label>
              <InputMask 
                v-model="form.celular" 
                @update:modelValue="checkViabilidadeDeInput('celular')" 
                mask="(99) 99999-9999" 
                :class="{ 'p-invalid': errors.celular }"
                placeholder="(00) 00000-0000" 
                class="w-full custom-input" 
              />
              <small v-if="errors.celular" class="error-message">Este número de celular já está em uso.</small>
            </div>

            <div class="form-group">
              <label class="label poppins-medium">Sua Senha</label>
              <Password v-model="form.passe_usuario" toggleMask placeholder="••••••••" fluid class="custom-password" :feedback="true" />
            </div>
          </div>

          <div v-else-if="currentStep === 3" class="step-content" key="step3">
            <h2 class="poppins-bold step-title">Seu Perfil Profissional</h2>
            <p class="poppins-regular step-subtitle">Conte-nos um pouco sobre suas especialidades e sua trajetória.</p>

            <div class="form-group">
              <label class="label poppins-medium">Especialidades</label>
              <div class="especialidades-input-row">
                <InputText
                  v-model="novaEspecialidade"
                  placeholder="Ex: Design, Marketing..."
                  class="custom-input especialidades-input"
                  @keyup.enter="adicionarEspecialidade"
                />
                <button class="add-chip-btn" @click="adicionarEspecialidade" type="button">
                  <span class="material-symbols-outlined">add</span>
                </button>
              </div>
              <div v-if="form.especialidades.length > 0" class="chips-list">
                <span
                  v-for="(esp, index) in form.especialidades"
                  :key="index"
                  class="chip-tag poppins-medium"
                >
                  {{ esp }}
                  <button class="chip-remove" @click="removerEspecialidade(index)" type="button">
                    <span class="material-symbols-outlined">close</span>
                  </button>
                </span>
              </div>
            </div>

            <div class="form-group">
              <label class="label poppins-medium" >Bio / Descrição</label>
              <Textarea v-model="form.desc_perfil" rows="4" placeholder="Fale um pouco sobre você..." class="w-full custom-textarea" />
            </div>
          </div>

          <div v-else-if="currentStep === 4" class="step-content" key="step4">
            <h2 class="poppins-bold step-title">Onde você está?</h2>
            <p class="poppins-regular step-subtitle">Precisamos desses dados para emissão de documentos e notas.</p>

            <div class="grid-form">
              <div class="form-group">
                <label class="label poppins-medium">CPF ou CNPJ</label>
                <InputText 
                  v-model="form.cpf_cnpj" 
                  @input="formatDocumento($event); checkViabilidadeDeInput('cpf_cnpj')"
                  :class="{ 'p-invalid': errors.cpf_cnpj }"
                  placeholder="Digite aqui o seu CPF ou CNPJ" 
                  class="w-full custom-input" 
                  maxlength="18"
                />
                <small v-if="errors.cpf_cnpj" class="error-message">Este documento já está vinculado a uma conta.</small>
              </div>
              <div class="form-group">
                <label class="label poppins-medium">CEP</label>
                <InputMask v-model="form.cep" mask="99999-999" placeholder="00000-000" class="w-full custom-input" />
              </div>
            </div>

            <div class="grid-form-stack">
              <div class="form-group">
                <label class="label poppins-medium">Estado</label>
                <Dropdown v-model="form.estado" :options="estados" placeholder="UF" class="w-full custom-dropdown" />
              </div>
              <div class="form-group">
                <label class="label poppins-medium">Cidade</label>
                <InputText v-model="form.cidade" placeholder="Cidade" class="w-full custom-input" />
              </div>
            </div>
          </div>

          <div v-else-if="currentStep === 5" class="step-content" key="step5">
            <h2 class="poppins-bold step-title">Para finalizar, uma foto!</h2>
            <p class="poppins-regular step-subtitle">Sorria! Uma foto profissional aumenta a confiança em 80%.</p>

            <div class="photo-upload-container">
              <div class="avatar-preview" @click="triggerUpload">
                <img v-if="photoPreview" :src="photoPreview" class="preview-img" />
                <span v-else class="material-symbols-outlined">add_photo_alternate</span>
              </div>
              <input type="file" ref="fileInput" @change="onFileSelect" accept="image/*" style="display: none" />
              <ion-button fill="clear" color="medium" @click="triggerUpload" class="poppins-medium">
                Selecionar imagem
              </ion-button>
            </div>
          </div>

          <div v-else-if="currentStep === 6" class="step-content" key="step6">
            <h2 class="poppins-bold step-title">Verifique seu e-mail</h2>
            <p class="poppins-regular step-subtitle">Enviamos um código de 6 dígitos para <strong>{{ form.email }}</strong>. Insira-o abaixo para confirmar sua identidade.</p>

            <div class="otp-container">
              <input 
                v-for="(digit, index) in 6" 
                :key="index"
                :id="'otp-' + index"
                type="text"
                maxlength="1"
                v-model="otpDigits[index]"
                @input="handleOtpInput($event, index)"
                @keydown.backspace="handleOtpBackspace($event, index)"
                class="otp-input poppins-bold"
                inputmode="numeric"
              />
            </div>
            
            <p class="resend-text poppins-regular">
              Não recebeu o código? <a @click="generateAndSendCode" class="brand-link">Reenviar código</a>
            </p>
          </div>
        </transition>

        <div class="footer-actions">
          <ion-button expand="block" class="next-button poppins-bold" @click="handleNext" :disabled="loading">
            <span v-if="!loading">{{ isLastStep ? 'Concluir Registro' : 'Continuar' }}</span>
            <ProgressSpinner v-else style="width: 25px; height: 25px" strokeWidth="4" />
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonPage, IonContent, IonButton } from '@ionic/vue';
import InputText from 'primevue/inputtext';
import InputMask from 'primevue/inputmask';
import Password from 'primevue/password';
import Dropdown from 'primevue/dropdown';
import Textarea from 'primevue/textarea';
import ProgressSpinner from 'primevue/progressspinner';
import { useAuthStore } from '@/stores/auth';
import { api } from '@/services/api';

export default defineComponent({
  name: 'SignupPage',
  components: { 
    IonPage, IonContent, IonButton, InputText, InputMask, 
    Password, Dropdown, Textarea, ProgressSpinner 
  },
  data() {
    return {
      novaEspecialidade: '' as string,
      currentStep: 1,
      loading: false,
      photoPreview: null as string | null,
      selectedFile: null as File | null,
      generatedCode: "", // Código "enviado" por email
      otpDigits: ["", "", "", "", "", ""],
      timeoutVerificador: null,
      errors: {
        nome_usuario: false,
        email: false,
        celular: false,
        cpf_cnpj: false
      },
      form: {
        nome: '',
        nome_usuario: '',
        email: '',
        celular: '',
        passe_usuario: '',
        especialidades: [] as string[],
        desc_perfil: '',
        cpf_cnpj: '',
        cep: '',
        cidade: '',
        estado: '',
        foto_perfil: '',
      },
      estados: [
        'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 
        'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
      ]
    };
  },
  computed: {
    progressPercentage(): number {
      return (this.currentStep / 6) * 100;
    },
    isLastStep(): boolean {
      return this.currentStep === 6;
    }
  },
  methods: {
    adicionarEspecialidade() {
      const val = this.novaEspecialidade.trim();
      if (val && !this.form.especialidades.includes(val)) {
        this.form.especialidades.push(val);
      }
      this.novaEspecialidade = '';
    },

    removerEspecialidade(index: number) {
      this.form.especialidades.splice(index, 1);
    },

    validateStep(): boolean {

      // Impede avançar se houver algum erro de duplicidade no passo atual
      if (this.currentStep === 1 && this.errors.nome_usuario) return false;
      if (this.currentStep === 2 && (this.errors.email || this.errors.celular)) return false;
      if (this.currentStep === 4 && this.errors.cpf_cnpj) return false;

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      switch (this.currentStep) {
        case 1:
          if (!this.form.nome.trim() || this.form.nome.split(' ').length < 2) {
            this.showToast('Digite seu nome completo.');
            return false;
          }
          if (!this.form.nome_usuario.trim() || this.form.nome_usuario.length < 3) {
            this.showToast('O nome de usuário deve ter pelo menos 3 caracteres.');
            return false;
          }
          return true;

        case 2:
          if (!emailRegex.test(this.form.email)) {
            this.showToast('Insira um e-mail válido.');
            return false;
          }
          if (!this.form.celular || this.form.celular.includes('_')) {
            this.showToast('Celular incompleto.');
            return false;
          }
          if (this.form.passe_usuario.length < 6) {
            this.showToast('A senha deve ter no mínimo 6 caracteres.');
            return false;
          }
          return true;

        case 3:
          if (this.form.especialidades.length === 0) {
            this.showToast('Adicione pelo menos uma especialidade.');
            return false;
          }
          if (!this.form.desc_perfil.trim() || this.form.desc_perfil.length < 10) {
            this.showToast('Sua bio precisa de um pouco mais de detalhes.');
            return false;
          }
          return true;

        case 4:
          if (!this.form.cpf_cnpj || this.form.cpf_cnpj.includes('_')) {
            this.showToast('CPF/CNPJ inválido ou incompleto.');
            return false;
          }
          if (!this.form.cep || this.form.cep.includes('_')) {
            this.showToast('CEP incompleto.');
            return false;
          }
          if (!this.form.estado || !this.form.cidade.trim()) {
            this.showToast('Selecione seu Estado e Cidade.');
            return false;
          }
          return true;
        case 5:
          return true;

        case 6:
          const typedCode = this.otpDigits.join("");
          if (typedCode.length < 6) {
            this.showToast('Insira o código completo de 6 dígitos.');
            return false;
          }
          if (typedCode !== this.generatedCode) {
            this.showToast('Código incorreto. Verifique seu e-mail.');
            return false;
          }
          return true;

        default:
          return false;
      }
    },

    showToast(message: string) {
      this.$toast.add({ 
        severity: 'warn', 
        summary: 'Atenção', 
        detail: message, 
        life: 3000 
      });
    },

    async generateAndSendCode() {
      // Simulação de geração de código aleatório de 6 dígitos
      this.generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      this.otpDigits = ["", "", "", "", "", ""];

      try{

        const payload = {
          remetente: 'marketvizium@gmail.com',
          destinatario: this.form.email,
          assunto: `${this.generatedCode} é o seu código de verificação`,
          texto: `Seu código de verificação é ${this.generatedCode}. Use-o para concluir seu cadastro no MarketVizium.`,
          template: `
            <div style="background-color: #000000; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; text-align: center;">
              <div style="max-width: 500px; margin: 0 auto; background-color: #121212; border-radius: 24px; padding: 40px; border: 1px solid #222222;">
                
                <div style="margin-bottom: 30px;">
                  <h1 style="color: #ffffff; font-size: 24px; letter-spacing: -1px; margin: 0;">Market<span style="color: #ff8049;">Vizium</span></h1>
                </div>

                <h2 style="color: #ffffff; font-size: 20px; font-weight: 600; margin-bottom: 10px;">Verifique seu e-mail</h2>
                <p style="color: #94a3b8; font-size: 15px; line-height: 1.5; margin-bottom: 30px;">
                  Para garantir a segurança da sua conta e concluir o acesso à nossa plataforma, utilize o código de segurança abaixo:
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
        }

        await api.post('/mvpu/usuario/enviarEmail/', payload)

        this.$toast.add({ 
          severity: 'info', 
          summary: 'E-mail enviado', 
          detail: 'Um novo código foi enviado para você.', 
          life: 3000 
        });

      }catch(e){

        

        this.$toast.add({ 
          severity: 'error', 
          summary: 'Falha ao enviar o email', 
          detail: 'Tente novamente mais tarde...', 
          life: 3000 
        });
      }

    },

    async handleNext() {
      if (!this.validateStep()) return;

      if (this.currentStep === 5) {
        this.generateAndSendCode();
        this.currentStep = 6;
      } else if (this.currentStep < 5) {
        this.currentStep++;
      } else {
        await this.finalizeRegistration();
      }
    },

    handleBack() {
      if (this.currentStep > 1) {
        this.currentStep--;
      } else {
        this.$router.push('/login');
      }
    },

    // Lógica dos quadradinhos OTP
    handleOtpInput(event: any, index: number) {
      const val = event.target.value;
      if (val && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    },

    handleOtpBackspace(event: any, index: number) {
      if (!this.otpDigits[index] && index > 0) {
        const prevInput = document.getElementById(`otp-${index - 1}`);
        prevInput?.focus();
      }
    },

    triggerUpload() {
      (this.$refs.fileInput as HTMLInputElement).click()
    },

    onFileSelect(event: any) {
      const input = event.target as HTMLInputElement
      const file = input.files?.[0]

      if (!file) return

      if (file.size > 2 * 1024 * 1024) {
        this.showToast('A foto deve ter no máximo 2MB.')
        input.value = ''
        return
      }

      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        this.showToast('Formato de imagem inválido.')
        input.value = ''
        return
      }

      this.selectedFile = file
      this.photoPreview = URL.createObjectURL(file)
    },

    async uploadFotoPerfil() {
      try{
        const formData = new FormData()
        formData.append('foto', this.selectedFile)

        for (const [key, value] of formData.entries()) {
          
        }

  
        const response = await api.post(
          '/mvpu/usuario/enviarFotoPerfil',
          formData
        )
  
        return response.data.data.foto_url
      }catch{
        this.showToast('Erro ao enviar foto de perfil. Tente novamente mais tarde...')
      }
    },

    async checkViabilidadeDeInput(parametro) {

      

      clearTimeout(this.timeoutVerificador);

      // Limpa o erro enquanto o usuário digita
      this.errors[parametro] = false;

      this.timeoutVerificador = setTimeout(async () => {
        if (!this.form[parametro]) return;

        try {
          const payload = {
            campo: parametro,
            valor: this.form[parametro]
          };

          const response = await api.post('/mvpu/usuario/verificarParamsVendedor', payload);
          
          // Se valorExiste for true, marcamos como erro
          if (response.data?.data?.valorExiste) {
            this.errors[parametro] = true;
            this.showToast(`Este ${parametro.replace('_', ' ')} já está em uso.`);
          }
        } catch (e) {
          
        }
      }, 800); // Ajustado para 800ms para melhor UX
    },

    formatDocumento(event: any) {
      let value = event.target.value.replace(/\D/g, "");
      if (value.length <= 11) {
        value = value.replace(/(\d{3})(\d)/, "$1.$2");
        value = value.replace(/(\d{3})(\d)/, "$1.$2");
        value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
      } else {
        value = value.replace(/^(\d{2})(\d)/, "$1.$2");
        value = value.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
        value = value.replace(/\.(\d{3})(\d)/, ".$1/$2");
        value = value.replace(/(\d{4})(\d)/, "$1-$2");
      }
      this.form.cpf_cnpj = value;
    },

    async finalizeRegistration() {
      this.loading = true
      const authStore = useAuthStore()

      try {



        //1️⃣ Se o usuário selecionou uma foto, faz upload
        if (this.selectedFile) {
          const fotoUrl = await this.uploadFotoPerfil()
          this.form.foto_perfil = fotoUrl
        } else {
          this.form.foto_perfil = null // ou '' se o backend exigir
        }

        // 2️⃣ Registra o usuário já com a URL da foto
        await api.post('/mvpu/usuario/cadastrarVende', {
          ...this.form,
          especialidades: this.form.especialidades.join(', ')
        })

        // 3️⃣ Login automático
        await authStore.login({
          email: this.form.email,
          passe_usuario: this.form.passe_usuario
        })

      } catch (error) {
        
        this.showToast('Erro ao realizar cadastro. Tente novamente.')
      } finally {
        this.loading = false
      }
    }

  }
});
</script>

<style scoped>
.signup-page { --background: #ffffff; }
.signup-container { display: flex; flex-direction: column; min-height: 100vh; padding: 20px 25px; }
.nav-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 40px; }
.back-button { background: none; border: none; color: #1e293b; padding: 10px 0; }
.progress-bar { flex: 1; height: 6px; background: #f1f5f9; border-radius: 10px; margin: 0 20px; overflow: hidden; }
.progress-fill { height: 100%; background: #ff8049; transition: width 0.4s ease; }
.step-indicator { color: #94a3b8; font-size: 0.9rem; }
.step-title { font-size: 1.8rem; color: #1e293b; line-height: 1.2; margin-bottom: 12px; }
.step-subtitle { color: #64748b; font-size: 1rem; margin-bottom: 35px; line-height: 1.5; }
.form-group { margin-bottom: 25px; }
.label { display: block; margin-bottom: 8px; color: #475569; font-size: 0.9rem; }

/* Estilização OTP */
.otp-container {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin: 30px 0;
}

.otp-input {
  width: 45px;
  height: 55px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  text-align: center;
  font-size: 1.5rem;
  background: #f8fafc;
  color: #1e293b;
  transition: all 0.2s;
}

.otp-input:focus {
  border-color: #ff8049;
  background: #fff;
  box-shadow: 0 0 0 1px #ff8049;
  outline: none;
}

.resend-text {
  text-align: center;
  margin-top: 10px;
  color: #64748b;
  font-size: 0.9rem;
}

.brand-link { color: #ff8049; font-weight: 600; cursor: pointer; }

/* Resto dos Estilos */
.custom-input, .custom-textarea, :deep(.p-password-input) {
  border-radius: 14px !important;
  border: 1px solid #e2e8f0 !important;
  padding: 14px 18px !important;
  font-family: 'Poppins', sans-serif;
  width: 100% !important;
  box-sizing: border-box;
}
.custom-input:focus { border-color: #ff8049 !important; box-shadow: 0 0 0 1px #ff8049 !important; }
.input-with-prefix { display: flex; align-items: center; border: 1px solid #e2e8f0; border-radius: 14px; padding-left: 15px; width: 100%; box-sizing: border-box; }
.prefix { color: #ff8049; font-weight: bold; font-size: 1.2rem; }
.input-with-prefix .custom-input { border: none !important; }
.grid-form { display: grid; grid-template-columns: 1fr; gap: 0; width: 100%; }
.grid-form-stack { display: flex; flex-direction: column; width: 100%; }
.grid-form-stack .form-group { width: 100%; }

/* Especialidades */
.especialidades-input-row {
  display: flex;
  gap: 10px;
  align-items: center;
  width: 100%;
}
.especialidades-input {
  flex: 1;
  min-width: 0;
}
.add-chip-btn {
  flex-shrink: 0;
  width: 50px;
  height: 50px;
  border-radius: 14px;
  border: none;
  background: #1e293b;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}
.add-chip-btn:active { background: #ff8049; }
.add-chip-btn .material-symbols-outlined { font-size: 1.4rem; }
.chips-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}
.chip-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 0.82rem;
  color: #1e293b;
}
.chip-remove {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: #94a3b8;
  display: flex;
  align-items: center;
  line-height: 1;
}
.chip-remove .material-symbols-outlined { font-size: 1rem; }
.chip-remove:active { color: #ef4444; }

/* Dropdown */
:deep(.p-dropdown) {
  width: 100% !important;
  height: 50px;
  border-radius: 14px !important;
  border: 1px solid #e2e8f0 !important;
  display: flex;
  align-items: center;
}
:deep(.p-dropdown:not(.p-disabled).p-focus) {
  border-color: #ff8049 !important;
  box-shadow: 0 0 0 1px #ff8049 !important;
}

.photo-upload-container { display: flex; flex-direction: column; align-items: center; margin-top: 20px; }
.avatar-preview {
  width: 160px; height: 160px; border-radius: 50%; background: #f8fafc;
  border: 2px dashed #cbd5e1; display: flex; align-items: center; justify-content: center;
  overflow: hidden; cursor: pointer; transition: all 0.3s;
}
.avatar-preview .material-symbols-outlined { font-size: 3rem; color: #cbd5e1; }
.preview-img { width: 100%; height: 100%; object-fit: cover; }
.footer-actions { margin-top: auto; padding-bottom: 20px; }
.next-button { --background: #1e293b; --border-radius: 18px; height: 60px; font-size: 1.1rem; }
.step-fade-enter-active, .step-fade-leave-active { transition: all 0.3s ease; }
.step-fade-enter-from { opacity: 0; transform: translateX(20px); }
.step-fade-leave-to { opacity: 0; transform: translateX(-20px); }

.error-message {
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 4px;
  display: block;
}

:deep(.p-invalid) {
  border-color: #ef4444 !important;
}

.input-error {
  border-color: #ef4444 !important;
}
</style>