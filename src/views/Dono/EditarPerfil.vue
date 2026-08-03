<template>
  <ion-page class="edit-profile-page">
    <ion-content :fullscreen="true" class="ion-padding">

      <RefresherIonic />

      <!-- Header principal -->
      <div v-if="!activeEdit" class="header-nav">
        <div class="back-btn" @click="$router.back()">
          <span class="material-symbols-outlined" style="font-size: 18px; color: #000;">arrow_back_ios</span>
        </div>
        <h2 class="poppins-semibold page-title" style="margin-right: 50px;">Configurações de Perfil</h2>
        <div class="placeholder-box"></div>
      </div>

      <!-- Overlay de edição individual -->
      <transition name="fade">
        <div v-if="activeEdit" class="edit-overlay">
          <div class="edit-header" style="margin-top: 20px; margin-bottom: 20px;">
            <button class="cancel-btn" @click="closeEdit">
              <span class="material-symbols-outlined">close</span>
            </button>
            <div class="poppins-semibold" style="color: #000;">Editar {{ activeEdit.label }}</div>
            <div>
              <span v-if="!saving" @click="saveIndividualChange" style="color: #000;" class="material-symbols-outlined">check</span>
              <i v-else class="pi pi-spin pi-spinner"></i>
            </div>
          </div>

          <div class="edit-focus-container mt-5">
            <div class="field-label-active poppins-bold">{{ activeEdit.label }}</div>

            <!-- Dropdown de estados -->
            <Dropdown
              v-if="activeEdit.key === 'estado'"
              v-model="form[activeEdit.key]"
              :options="estadosBR"
              optionLabel="nome"
              optionValue="sigla"
              placeholder="Selecione o estado"
              class="focus-input w-full custom-dropdown-edit"
              autofocus
            />

            <!-- InputMask para celular e cep -->
            <InputMask
              v-else-if="activeEdit.type === 'mask'"
              v-model="form[activeEdit.key]"
              :mask="activeEdit.mask"
              class="focus-input w-full"
              autofocus
            />

            <!-- Input de texto padrão -->
            <InputText
              v-else-if="activeEdit.type === 'text'"
              v-model="form[activeEdit.key]"
              class="focus-input w-full"
              autofocus
            />

            <div style="font-size: 14px; display: flex; align-items: center; margin-top: 7px; color: #555;">
              <span class="material-symbols-outlined">info</span>
              <p style="padding-left: 8px;">{{ activeEdit.description }}</p>
            </div>
          </div>
        </div>
      </transition>

      <!-- Visualização principal dos campos -->
      <div v-if="!activeEdit" class="main-view-container">

        <!-- Foto de perfil -->
        <div class="photo-edit-section">
          <div class="avatar-wrapper">
            <Avatar
              :image="form.foto || personagem"
              shape="circle"
              class="profile-avatar-edit"
            />
            <label for="file-upload" class="upload-badge">
              <span class="material-symbols-outlined">photo_camera</span>
            </label>
            <input id="file-upload" type="file" @change="onFileChange" accept="image/*" style="display: none;" />
          </div>
        </div>

        <div class="form-container">

          <!-- Informações Básicas -->
          <h3 class="section-title poppins-semibold">Informações Básicas</h3>
          <div class="input-group">
            <div class="field-item" @click="openEdit('nome')">
              <label>Nome Completo</label>
              <div class="display-value">{{ form.nome || 'Toque para definir' }}</div>
              <span class="material-symbols-outlined arrow">chevron_right</span>
            </div>
          </div>

          <!-- Contato -->
          <h3 class="section-title poppins-semibold mt-4">Contato</h3>
          <div class="input-group">
            <div class="field-item disabled">
              <label>E-mail (Bloqueado)</label>
              <div class="display-value">{{ form.email || '—' }}</div>
              <span class="material-symbols-outlined lock">lock</span>
            </div>

            <div class="field-item" @click="openEdit('celular')">
              <label>Celular</label>
              <div class="display-value">{{ form.celular || 'Não cadastrado' }}</div>
              <span class="material-symbols-outlined arrow">chevron_right</span>
            </div>
          </div>

          <!-- Documentação -->
          <h3 class="section-title poppins-semibold mt-4">Documentação</h3>
          <div class="input-group">
            <div class="field-item disabled">
              <label>CPF (Bloqueado)</label>
              <div class="display-value">{{ form.cpf || '—' }}</div>
              <span class="material-symbols-outlined lock">lock</span>
            </div>
          </div>

          <!-- Endereço -->
          <h3 class="section-title poppins-semibold mt-4">Endereço</h3>
          <div class="input-group" style="margin-bottom: 50px;">
            <div class="field-item" @click="openEdit('cep')">
              <label>CEP</label>
              <div class="display-value">{{ form.cep || 'Não informado' }}</div>
              <span class="material-symbols-outlined arrow">chevron_right</span>
            </div>

            <div class="field-item" @click="openEdit('rua')">
              <label>Rua</label>
              <div class="display-value">{{ form.rua || 'Não informado' }}</div>
              <span class="material-symbols-outlined arrow">chevron_right</span>
            </div>

            <div class="field-item" @click="openEdit('cidade')">
              <label>Cidade</label>
              <div class="display-value">{{ form.cidade || 'Não informado' }}</div>
              <span class="material-symbols-outlined arrow">chevron_right</span>
            </div>

            <div class="field-item" @click="openEdit('estado')">
              <label>Estado</label>
              <div class="display-value">{{ form.estado || 'Não informado' }}</div>
              <span class="material-symbols-outlined arrow">chevron_right</span>
            </div>
          </div>

        </div>
      </div>

      <div style="display: flex; justify-content: center;">
          <button @click="$router.push({name: 'Privacidade'})" style="padding: 10px; background-color: #777; color: #FFF; border-radius: 7px; font-size: 15px; width: 100%; max-width: 576px">
            Privacidade
          </button>
      </div>

      <div class="bottom-spacer"></div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { IonPage, IonContent } from '@ionic/vue';
import { Avatar, Button, InputText, InputMask, Dropdown } from 'primevue';
import { useAuthStore } from '@/stores/auth';
import personagem from '@/assets/personagem.png'
import RefresherIonic from '@/components/refresherIonic.vue';
import { api } from '@/services/api';

export default defineComponent({
  name: 'EditarPerfil',
  components: { IonPage, IonContent, Avatar, Button, InputText, InputMask, Dropdown, RefresherIonic },
  setup() {
    const authStore = useAuthStore();
    const saving = ref(false);
    const activeEdit = ref<any>(null);
    const selectedFile = ref<File | null>(null);

    // Campos editáveis espelhando exatamente a tabela usuario
    const form = ref<{
      nome: string;
      cpf: string;
      email: string;
      celular: string;
      nivel: number | null;
      rua: string;
      cidade: string;
      estado: string;
      cep: string;
      foto: string;
      data_pagamento: string;
      data_criacao: string;
      soft_delete: string | null;
      plano: string;
      passe_usuario: string;
      id_loja: number | null;
      id_dono: number | null;
    }>({
      nome: '',
      cpf: '',
      email: '',
      celular: '',
      nivel: null,
      rua: '',
      cidade: '',
      estado: '',
      cep: '',
      foto: '',
      data_pagamento: '',
      data_criacao: '',
      soft_delete: null,
      plano: '',
      passe_usuario: '',
      id_loja: null,
      id_dono: null,
    });

    const estadosBR = ref([
      { nome: 'Acre', sigla: 'AC' },
      { nome: 'Alagoas', sigla: 'AL' },
      { nome: 'Amapá', sigla: 'AP' },
      { nome: 'Amazonas', sigla: 'AM' },
      { nome: 'Bahia', sigla: 'BA' },
      { nome: 'Ceará', sigla: 'CE' },
      { nome: 'Distrito Federal', sigla: 'DF' },
      { nome: 'Espírito Santo', sigla: 'ES' },
      { nome: 'Goiás', sigla: 'GO' },
      { nome: 'Maranhão', sigla: 'MA' },
      { nome: 'Mato Grosso', sigla: 'MT' },
      { nome: 'Mato Grosso do Sul', sigla: 'MS' },
      { nome: 'Minas Gerais', sigla: 'MG' },
      { nome: 'Pará', sigla: 'PA' },
      { nome: 'Paraíba', sigla: 'PB' },
      { nome: 'Paraná', sigla: 'PR' },
      { nome: 'Pernambuco', sigla: 'PE' },
      { nome: 'Piauí', sigla: 'PI' },
      { nome: 'Rio de Janeiro', sigla: 'RJ' },
      { nome: 'Rio Grande do Norte', sigla: 'RN' },
      { nome: 'Rio Grande do Sul', sigla: 'RS' },
      { nome: 'Rondônia', sigla: 'RO' },
      { nome: 'Roraima', sigla: 'RR' },
      { nome: 'Santa Catarina', sigla: 'SC' },
      { nome: 'São Paulo', sigla: 'SP' },
      { nome: 'Sergipe', sigla: 'SE' },
      { nome: 'Tocantins', sigla: 'TO' },
    ]);

    // Configuração de cada campo editável
    const fieldsConfig: Record<string, any> = {
      nome: {
        label: 'Nome Completo',
        key: 'nome',
        type: 'text',
        description: 'Seu nome que aparecerá na plataforma.',
      },
      celular: {
        label: 'Celular',
        key: 'celular',
        type: 'mask',
        mask: '(99) 99999-9999',
        description: 'Usado para notificações urgentes e contato direto.',
      },
      cep: {
        label: 'CEP',
        key: 'cep',
        type: 'mask',
        mask: '99999-999',
        description: 'CEP do seu endereço atual.',
      },
      rua: {
        label: 'Rua',
        key: 'rua',
        type: 'text',
        description: 'Nome da rua, número e complemento.',
      },
      cidade: {
        label: 'Cidade',
        key: 'cidade',
        type: 'text',
        description: 'Cidade onde você está localizado.',
      },
      estado: {
        label: 'Estado',
        key: 'estado',
        type: 'dropdown',
        description: 'Estado onde você está localizado.',
      },
    };

    // Carrega os dados do store no formulário
    onMounted(() => {
      if (authStore.usuario) {
        const u = authStore.usuario as any;
        form.value = {
          nome: u.nome ?? '',
          cpf: u.cpf ?? '',
          email: u.email ?? '',
          celular: u.celular ?? '',
          nivel: u.nivel ?? null,
          rua: u.rua ?? '',
          cidade: u.cidade ?? '',
          estado: u.estado ?? '',
          cep: u.cep ?? '',
          foto: u.foto ?? '',
          data_pagamento: u.data_pagamento ?? '',
          data_criacao: u.data_criacao ?? '',
          soft_delete: u.soft_delete ?? null,
          plano: u.plano ?? '',
          passe_usuario: u.passe_usuario ?? '',
          id_loja: u.id_loja ?? null,
          id_dono: u.id_dono ?? null,
        };
      }

      

    });

    return { form, saving, authStore, activeEdit, fieldsConfig, estadosBR, selectedFile, personagem };
  },
  methods: {
    openEdit(fieldKey: string) {
      this.activeEdit = this.fieldsConfig[fieldKey];
    },

    closeEdit() {
      // Reverte alterações não salvas
      if (this.authStore.usuario) {
        const u = this.authStore.usuario as any;
        this.form = {
          nome: u.nome ?? '',
          cpf: u.cpf ?? '',
          email: u.email ?? '',
          celular: u.celular ?? '',
          nivel: u.nivel ?? null,
          rua: u.rua ?? '',
          cidade: u.cidade ?? '',
          estado: u.estado ?? '',
          cep: u.cep ?? '',
          foto: u.foto ?? '',
          data_pagamento: u.data_pagamento ?? '',
          data_criacao: u.data_criacao ?? '',
          soft_delete: u.soft_delete ?? null,
          plano: u.plano ?? '',
          passe_usuario: u.passe_usuario ?? '',
          id_loja: u.id_loja ?? null,
          id_dono: u.id_dono ?? null,
        };
      }
      this.activeEdit = null;
    },

    async saveIndividualChange() {
      this.saving = true;
      try {
        // ---- DUMMY: substitua pela chamada real à API ----
        await api.put('/mvpu/usuario/editarPerfilUsuario', this.form);
        // -------------------------------------------------

        // Atualiza o store com os dados novos (MeuPerfil.vue reflete em tempo real)
        this.authStore.setUsuario({ ...this.form });

        this.activeEdit = null;

        (this as any).$toast?.add({
          severity: 'success',
          summary: 'Perfil atualizado',
          detail: 'As alterações foram salvas com sucesso.',
          life: 3000,
        });
      } catch {
        (this as any).$toast?.add({
          severity: 'error',
          summary: 'Erro ao salvar',
          detail: 'Não foi possível salvar as alterações.',
          life: 3000,
        });
      } finally {
        this.saving = false;
      }
    },

    async uploadFotoPerfil(): Promise<string | null> {
      try {
        if (!this.selectedFile) return null;
        const formData = new FormData();
        formData.append('foto', this.selectedFile);
        
        // ---- DUMMY: substitua pela chamada real à API ----
        const response = await api.post('/mvpu/usuario/enviarFotoPerfil', formData);

        

        // return response.data.data.foto_url;
        await new Promise((resolve) => setTimeout(resolve, 600));
        return response.data.data.foto_url; // preview local como dummy
        // -------------------------------------------------
      } catch {
        (this as any).$toast?.add({
          severity: 'error',
          summary: 'Erro ao enviar foto',
          detail: 'Não foi possível atualizar a foto de perfil.',
          life: 3000,
        });
        return null;
      }
    },

    async onFileChange(event: any) {
      const file: File = event.target.files[0];
      if (!file) return;

      if (file.size > 2 * 1024 * 1024) {
        (this as any).$toast?.add({
          severity: 'info',
          summary: 'Tamanho máximo atingido',
          detail: 'A foto deve ter no máximo 2MB.',
          life: 3000,
        });
        return;
      }

      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        (this as any).$toast?.add({
          severity: 'info',
          summary: 'Formato inválido',
          detail: 'Use JPEG, PNG ou WebP.',
          life: 3000,
        });
        return;
      }

      this.selectedFile = file;
      const fotoUrl = await this.uploadFotoPerfil();

      this.form.foto = fotoUrl

      

      if (fotoUrl) {
        await this.saveIndividualChange();
      }
    },
  },
});
</script>

<style scoped>
.edit-profile-page { --background: #fbfbfb; }

/* Overlay de foco */
.edit-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: white; z-index: 1000;
  padding: 20px;
}

.edit-header {
  display: flex; justify-content: space-between; align-items: center;
}

.cancel-btn { background: none; border: none; color: #888; }
.field-label-active { color: #FF8049; font-size: 14px; margin-bottom: 8px; }

.focus-input {
  font-size: 15px;
  background-color: #fff;
  color: #000;
  width: 100%;
}

/* Lista de campos estilo iOS */
.input-group {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #f2f2f2;
}

.field-item {
  display: flex; flex-direction: column; padding: 15px;
  border-bottom: 1px solid #f9f9f9; cursor: pointer;
  position: relative;
}
.field-item:active { background: #f9f9f9; }
.field-item:last-child { border-bottom: none; }
.field-item.disabled { background: #fdfdfd; cursor: not-allowed; }

.field-item label {
  font-size: 11px; color: #a3a3a3;
  text-transform: uppercase; font-weight: 700;
}
.display-value { font-size: 15px; color: #333; margin-top: 4px; }
.display-value.truncate {
  white-space: nowrap; overflow: hidden;
  text-overflow: ellipsis; max-width: 90%;
}

.arrow { position: absolute; right: 15px; top: 50%; transform: translateY(-50%); color: #ddd; }
.lock  { position: absolute; right: 15px; top: 50%; transform: translateY(-50%); color: #eee; font-size: 18px; }

/* Header */
.header-nav {
  display: flex; align-items: center;
  justify-content: space-between; padding: 10px 0 20px 0;
}
.back-btn {
  width: 40px; height: 40px; background: white;
  border-radius: 12px; display: flex; align-items: center; justify-content: center;
}
.page-title { font-size: 18px; color: #1a1a1a; margin: 0; }
.section-title {
  font-size: 11px; color: #FF8049;
  text-transform: uppercase; margin: 25px 0 10px 5px;
}

/* Avatar */
.photo-edit-section { display: flex; justify-content: center; margin-bottom: 30px; }
.avatar-wrapper { position: relative; }
.profile-avatar-edit {
  width: 100px !important; height: 100px !important;
  border: 3px solid #FF8049; box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}
.upload-badge {
  position: absolute; bottom: 0; right: 0;
  background: #FF8049; color: white;
  width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid white; cursor: pointer;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.bottom-spacer { height: 150px; }
</style>