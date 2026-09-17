<template>
  <ion-page class="console-page">

    <RefresherIonic />

    <ion-header class="ion-no-border">
      <div class="cc-header">
        <div class="cc-header-left">
          <button class="back-btn" @click="$router.back()">
            <span class="material-symbols-outlined">arrow_back_ios_new</span>
          </button>
          <div class="cotacao-identity">
            <span class="cotacao-label">GESTÃO</span>
            <span class="cotacao-name">Cadastrar colaborador</span>
          </div>
        </div>
      </div>
    </ion-header>

    <ion-content :fullscreen="true" class="console-content">
      <div class="form-container">
        <div class="title-section">
          <h2 class="poppins-semibold">Cadastrar Colaborador</h2>
          <p class="poppins-regular muted">Registre um novo colaborador preenchendo as informações abaixo.</p>
        </div>

        <!-- ══ FOTO ══ -->
        <div class="photo-container">
          <div class="photo-circle" @click="triggerUpload">
            <i v-if="!fotoPreview && !uploadingFoto" class="pi pi-user" style="font-size: 2.5rem; color: #888"></i>
            <span v-if="uploadingFoto" class="pi pi-spin pi-spinner" style="font-size: 1.8rem; color: #FF8049;"></span>
            <img v-if="fotoPreview && !uploadingFoto" :src="fotoPreview" class="photo-img" />
            <div class="photo-badge">
              <i class="pi pi-camera" style="font-size: 0.8rem; color: #fff"></i>
            </div>
          </div>
          <input
            type="file"
            ref="fileInput"
            hidden
            accept="image/jpeg,image/png,image/webp"
            @change="onFileChange"
          />
          <span class="photo-label poppins-regular">
            {{ uploadingFoto ? 'Enviando foto...' : 'Foto do colaborador (opcional)' }}
          </span>
          <!-- Botão limpar foto apenas quando há preview e não está enviando -->
          <button
            v-if="fotoPreview && !uploadingFoto"
            class="photo-remove-btn"
            @click.stop="removerFoto"
            title="Remover foto"
          >
            <i class="pi pi-times"></i> Remover foto
          </button>
        </div>

        <!-- ══ NOME + CPF ══ -->
        <div class="form-row margin-top-20">
          <div class="form-col col-70">
            <inputDesktop
              placeholder="Nome Completo (*)"
              v-model="colab.nome"
            />
          </div>
          <div class="form-col col-30">
            <inputDesktop
              placeholder="CPF (*)"
              v-model="colab.cpf"
              data-maska="###.###.###-##"
              v-maska
            />
          </div>
        </div>

        <!-- ══ E-MAIL + CELULAR ══ -->
        <div class="form-row margin-top-20">
          <div class="form-col col-60">
            <inputDesktop
              placeholder="E-mail (*)"
              v-model="colab.email"
            />
          </div>
          <div class="form-col col-40">
            <inputDesktop
              placeholder="Celular (Opcional)"
              v-model="colab.celular"
              data-maska="(##) #####-####"
              v-maska
            />
          </div>
        </div>

        <!-- ══ CEP + RUA + UF ══ -->
        <div class="form-row margin-top-20">
          <div class="form-col col-25">
            <inputDesktop
              placeholder="CEP (Opcional)"
              v-model="colab.cep"
              data-maska="#####-###"
              v-maska
            />
          </div>
          <div class="form-col col-60">
            <inputDesktop
              placeholder="Rua (Opcional)"
              v-model="colab.rua"
            />
          </div>
          <div class="form-col col-15">
            <inputDesktop
              placeholder="UF"
              maxlength="2"
              v-model="colab.estado"
            />
          </div>
        </div>

        <!-- ══ CIDADE + FUNÇÃO ══ -->
        <div class="form-row margin-top-20">
          <div class="form-col">
            <inputDesktop
              placeholder="Cidade (Opcional)"
              v-model="colab.cidade"
            />
          </div>
          <div class="form-col">
            <Dropdown
              v-model="colab.nivel"
              :options="niveisPermissao"
              style="width: 100%; height: 50px; display: flex; align-items: center;"
              optionLabel="label"
              optionValue="value"
              placeholder="Função do Colaborador (*)"
              class="custom-dropdown w-full"
            />
          </div>
        </div>

        <!-- ══ SENHA ══ -->
        <div class="form-row margin-top-20">
          <div class="form-col">
            <inputDesktop
              placeholder="Senha de Acesso (*)"
              v-model="colab.passe_usuario"
              type="password"
            />
          </div>
        </div>

        <!-- ══ AÇÕES ══ -->
        <div class="form-actions-row margin-top-30">
          <button
            @click="limparTudo"
            class="action-btn btn-outline-gray poppins-medium full-w height-50"
            :disabled="loading"
          >
            Limpar tudo
          </button>

          <button
            @click="handleCadastro"
            class="action-btn btn-primary poppins-medium full-w height-50"
            :disabled="loading || uploadingFoto"
          >
            <ion-spinner name="crescent" v-if="loading" class="spinner-button"></ion-spinner>
            <span v-else>Cadastrar colaborador</span>
          </button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import {
  IonPage,
  IonHeader,
  IonContent,
  IonSpinner
} from '@ionic/vue'
import inputDesktop from '@/components/inputDesktop.vue'
import Dropdown from 'primevue/dropdown'
import { vMaska } from 'maska/vue'
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import exibeErro from '@/utils/ExibeErro'
import RefresherIonic from '@/components/refresherIonic.vue'

export default defineComponent({
  name: 'CadastroColaborador',

  directives: { maska: vMaska },

  components: {
    IonPage,
    IonHeader,
    IonContent,
    IonSpinner,
    inputDesktop,
    Dropdown,
    RefresherIonic
  },

  data() {
    return {
      loading: false,
      uploadingFoto: false,  // spinner enquanto faz upload
      auth: null as any,
      fotoPreview: null as string | null,     // URL local para preview (createObjectURL)
      selectedFile: null as File | null,      // File selecionado antes do upload
      colab: {
        nome: '',
        cpf: '',
        celular: '',
        email: '',
        rua: '',
        foto: '',            // URL retornada pela API após upload
        cidade: '',
        estado: '',
        cep: '',
        nivel: null as number | null,
        passe_usuario: ''
      },
      // Supervisor = 6 | Operador = 7
      niveisPermissao: [
        { label: 'Supervisor', value: 6 },
        { label: 'Operador',   value: 7 }
      ]
    }
  },

  methods: {
    // ── Abre seletor de arquivo ──────────────────────────
    triggerUpload() {
      (this.$refs.fileInput as HTMLInputElement).click()
    },

    // ── Chamado quando o usuário escolhe um arquivo ──────
    async onFileChange(e: Event) {
      const target = e.target as HTMLInputElement
      const file = target.files ? target.files[0] : null
      // Limpa o input para permitir re-selecionar o mesmo arquivo
      target.value = ''
      if (!file) return

      // Validação de tamanho (máx 2 MB — igual ao EditarPerfil)
      if (file.size > 2 * 1024 * 1024) {
        this.$toast.add({
          severity: 'warn',
          summary: 'Limite máximo atingido',
          detail: 'A foto deve ter no máximo 2 MB.',
          life: 3000,
        })
        return
      }

      // Validação de formato
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        this.$toast.add({
          severity: 'warn',
          summary: 'Formato inválido',
          detail: 'Formato inválido! Use JPEG, PNG ou WebP.',
          life: 3000,
        })

        return
      }

      // Preview local imediato (mesmo padrão do EditarPerfil)
      this.fotoPreview = URL.createObjectURL(file)
      this.selectedFile = file

      // Faz upload e guarda a URL retornada em colab.foto
      await this.uploadFotoColaborador(file)
    },

    // ── Envia a foto à API e armazena a URL no form ──────
    async uploadFotoColaborador(file: File) {
      this.uploadingFoto = true
      try {
        const formData = new FormData()
        formData.append('foto', file)

        // Mesmo endpoint usado no EditarPerfil para foto de perfil
        const response = await api.post('/mvpu/usuario/enviarFotoPerfil', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })

        const fotoUrl = response?.data?.data?.foto_url
        if (fotoUrl) {
          this.colab.foto = fotoUrl
        } else {
          // Se a API não retornar a URL esperada, avisa mas mantém o preview
          this.$toast.add({
            severity: 'warn',
            summary: 'Aviso',
            detail: 'Foto enviada, mas a URL não foi retornada. Verifique a API.',
            life: 4000
          })
        }
      } catch (e) {
        // Reverte o preview em caso de falha
        this.fotoPreview = null
        this.selectedFile = null
        this.colab.foto = ''
        this.$toast.add({
          severity: 'error',
          summary: 'Erro ao enviar foto',
          detail: 'Não foi possível fazer o upload da imagem.',
          life: 3000
        })
      } finally {
        this.uploadingFoto = false
      }
    },

    // ── Remove foto selecionada ──────────────────────────
    removerFoto() {
      this.fotoPreview = null
      this.selectedFile = null
      this.colab.foto = ''
    },

    // ── Limpa o formulário inteiro ───────────────────────
    limparTudo() {
      this.colab = {
        nome: '', cpf: '', celular: '', email: '',
        rua: '', foto: '', cidade: '', estado: '',
        cep: '', nivel: null, passe_usuario: ''
      }
      this.fotoPreview = null
      this.selectedFile = null
    },

    // ── Submete o cadastro ───────────────────────────────
    async handleCadastro() {
      if (!this.colab.nome || !this.colab.cpf || !this.colab.email || !this.colab.nivel || !this.colab.passe_usuario) {
        this.$toast.add({
          severity: 'info',
          summary: 'Campos não preenchidos',
          detail: 'Preencha todos os campos obrigatórios (*)',
          life: 3000,
        })

        return
      }

      // Bloqueia envio enquanto o upload de foto ainda não terminou
      if (this.uploadingFoto) {
        this.$toast.add({
            severity: 'info',
            summary: 'Aguarde...',
            detail: 'Aguarde o upload da foto finalizar.',
            life: 3000,
          })
        return
      }

      this.loading = true
      try {
        const payload = {
          nome:          this.colab.nome,
          cpf:           this.colab.cpf,
          celular:       this.colab.celular.replace(/\D/g, ''),
          email:         this.colab.email,
          rua:           this.colab.rua,
          cidade:        this.colab.cidade,
          estado:        this.colab.estado,
          cep:           this.colab.cep.replace(/\D/g, ''),
          foto:          this.colab.foto,   // URL já resolvida pelo upload
          id_dono:       this.auth.id_usuario,
          id_loja:       this.auth.loja.id_loja,
          nivel:         this.colab.nivel,
          passe_usuario: this.colab.passe_usuario
        }

        await api.post('/mvpu/usuario/cadastrarColab', payload)

        if (this.$toast) {
          this.$toast.add({
            severity: 'success',
            summary: 'Colaborador cadastrado',
            detail: 'Colaborador cadastrado com sucesso!',
            life: 3000
          })
        }

        this.limparTudo()
      } catch (e) {
        exibeErro(e, this.$toast)
      } finally {
        this.loading = false
      }
    }
  },

  mounted() {
    this.auth = useAuthStore()
  }
})
</script>

<style scoped>

/* === CONTAINER & ESTRUTURA BASE === */
.console-page {
  --background: #FFF !important;
  background-color: #FFF !important;
  height: 100%;
}

.console-content {
  --background: #FFF !important;
  background-color: #FFF !important;
  color: #000;
  height: 100%;
}

.form-container {
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  background-color: #FFF;
  box-sizing: border-box;
  width: 100%;
  margin: 0 auto;
}

.title-section {
  margin-bottom: 8px;
}

.title-section h2 {
  font-size: 22px;
  margin: 0 0 6px 0;
  color: #000 !important;
}

.title-section p.muted {
  font-size: 14px;
  margin: 0;
  color: #525151 !important;
}

/* === FOTO === */
.photo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
  gap: 8px;
}

.photo-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 2px dashed #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  background-color: #f0f0f0;
  overflow: hidden;
  transition: 0.3s;
}

.photo-circle:active {
  border-color: #FF8049;
  background-color: #ececec;
}

.photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-badge {
  position: absolute;
  bottom: 5px;
  right: 5px;
  background: #FF8049;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #fff;
}

.photo-label {
  font-size: 12px;
  color: #666 !important;
}

.photo-remove-btn {
  background: none;
  border: none;
  color: #e74c3c;
  font-family: 'Poppins', sans-serif;
  font-size: 11px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 4px;
  transition: background 0.2s;
}

.photo-remove-btn:active {
  background: #ffeaea;
}

/* === FORMULÁRIOS & CAMPOS === */
.form-row {
  display: flex;
  gap: 10px;
  width: 100%;
}

.form-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.col-70 { flex: 0 0 70%; }
.col-60 { flex: 0 0 60%; }
.col-40 { flex: 0 0 40%; }
.col-30 { flex: 0 0 30%; }
.col-25 { flex: 0 0 25%; }
.col-15 { flex: 0 0 15%; }

/* === BOTÕES E AÇÕES === */
.form-actions-row {
  display: flex;
  gap: 10px;
  width: 100%;
}

.action-btn {
  border-radius: 12px;
  padding: 10px 20px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  border: none;
  transition: background 0.2s ease, opacity 0.2s ease;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #FF8049 !important;
  color: #FFF !important;
}

.btn-primary:active {
  background-color: #ce673b !important;
}

.btn-outline-gray {
  background-color: rgb(88, 88, 88) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  color: #ffffff !important;
}

.btn-outline-gray:active {
  background-color: rgba(255, 255, 255, 0.15) !important;
}

.full-w {
  width: 100%;
}

.height-50 {
  height: 50px;
}

.spinner-button {
  width: 24px;
  height: 24px;
  --color: #000 !important;
}

/* === UTILS === */
.margin-top-20 { margin-top: 20px; }
.margin-top-30 { margin-top: 30px; }

/* === PRIME VUE OVERRIDES === */
.w-full {
  width: 100%;
}

:deep(.custom-dropdown.p-dropdown) {
  background: transparent;
  border: 1px solid rgb(177, 177, 177);
  border-radius: 10px;
  height: 50px;
  font-family: 'Poppins', sans-serif;
  display: flex;
  align-items: center;
  width: 100%;
}

:deep(.p-dropdown-label) {
  padding-left: 10px;
}

/* === REGRAS ESTILIZADAS DO HEADER MOBILE === */
.cc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background-color: #FFF !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.cc-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.back-btn {
  background: none;
  border: none;
  color: #FF8049 !important;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
}
.back-btn span {
  font-size: 20px;
}
.cotacao-identity {
  display: flex;
  flex-direction: column;
}
.cotacao-label {
  font-size: 10px;
  color: #FF8049 !important;
  letter-spacing: 1px;
}
.cotacao-name {
  font-size: 16px;
  color: #000 !important;
}

/* === RESPONSIVIDADE === */

/* Telas bem estreitas (celulares pequenos): empilha os campos em coluna única */
@media (max-width: 420px) {
  .form-row {
    flex-direction: column;
    gap: 14px;
  }

  .col-70, .col-60, .col-40, .col-30, .col-25, .col-15 {
    flex: 0 0 100%;
    width: 100%;
  }

  .form-actions-row {
    flex-direction: column;
  }

  .photo-circle {
    width: 88px;
    height: 88px;
  }

  .form-container {
    padding: 20px 14px;
  }

  .title-section h2 {
    font-size: 19px;
  }
}

/* Telas médias (tablets em pé): mantém 2 colunas mas com respiro extra */
@media (min-width: 421px) and (max-width: 600px) {
  .form-row {
    gap: 8px;
  }
}

/* Telas largas (tablets deitados / desktop): limita a largura e centraliza,
   além de dar mais respiro ao conteúdo */
@media (min-width: 900px) {
  .form-container {
    padding: 32px 24px;
  }

  .form-row {
    gap: 16px;
  }

  .form-actions-row {
    margin-left: auto;
    margin-right: auto;
  }
}
</style>