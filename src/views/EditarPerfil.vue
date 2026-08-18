<template>
  <ion-page class="edit-profile-page">
    <ion-content :fullscreen="true" class="ion-padding">
      
      <RefresherIonic />

      <div v-if="!activeEdit" class="header-nav">
        <div class="back-btn" @click="$router.back()">
          <span class="material-symbols-outlined" style="font-size: 18px; color: #000;">arrow_back_ios</span>
        </div>
        <h2 class="poppins-semibold page-title" style="margin-right: 50px;">Configurações de Perfil</h2>
        <div class="placeholder-box"></div>
      </div>

      <transition name="fade">
        <div v-if="activeEdit" class="edit-overlay">
          <div class="edit-header" style="margin-top: 20px; margin-bottom: 20px;">
            <button class="cancel-btn" @click="closeEdit">
              <span class="material-symbols-outlined">close</span>
            </button>
            <div class="poppins-semibold" style="color: #000;">Editar {{ activeEdit.label }}</div>
            <div  >
              <span v-if="!saving" @click="saveIndividualChange" :disabled="saving" style="color: #000;" class="material-symbols-outlined">check</span>
              <i v-else-if="saving" class="pi pi-spin pi-spinner"></i>
            </div>
          </div>
          
          <div class="edit-focus-container mt-5">
            <div class="field-label-active poppins-bold">{{ activeEdit.label }}</div>

            <InputText 
                v-if="activeEdit.type === 'text' && activeEdit.key === 'nome_usuario'"
                v-model="form[activeEdit.key]" 
                class="focus-input w-full" 
                autofocus 
                @input="form.nome_usuario = form.nome_usuario.replace(/[^a-zA-Z0-9@_]/g, '')"
            />

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

            <InputText 
                v-else-if="activeEdit.type === 'text' && activeEdit.key !== 'nome_usuario'"
                v-model="form[activeEdit.key]" 
                class="focus-input w-full" 
                autofocus 
            />
            
            <InputMask 
              v-if="activeEdit.type === 'mask'"
              v-model="form[activeEdit.key]" 
              :mask="activeEdit.mask"
              class="focus-input w-full" 
              autofocus 
            />

            <Textarea 
              v-if="activeEdit.type === 'textarea' && activeEdit.key == 'desc_perfil'"
              v-model="form[activeEdit.key]" 
              rows="5"
              maxlength="1200" 
              class="focus-input w-full" 
              autofocus 
              autoResize
            />

            <Textarea 
              v-else-if="activeEdit.type === 'textarea' && activeEdit.key !== 'desc_perfil'"
              v-model="form[activeEdit.key]" 
              rows="5" 
              class="focus-input w-full" 
              autofocus 
              autoResize
            />

            <div style="font-size: 14px; display: flex; align-items: center; margin-top: 7px; color: #555;">
              <span class="material-symbols-outlined">info</span>
              <p style="padding-left: 8px;">{{ activeEdit.description }}</p>
            </div>
          </div>
        </div>
      </transition>

      <div v-if="!activeEdit" class="main-view-container">
        
        <div class="photo-edit-section">
          <div class="avatar-wrapper">
            <Avatar 
              :image="form.foto_perfil || 'https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png'" 
              shape="circle" 
              class="profile-avatar-edit"
            />
            <label for="file-upload" class="upload-badge">
              <span class="material-symbols-outlined">photo_camera</span>
            </label>
            <input id="file-upload" type="file" @change="onFileChange" accept="image/*" style="display: none;" />
          </div>
        </div>

        <div style="display: flex; justify-content: center;">
          <button @click="$router.push({name: 'MinhasEmpresas'})" style="padding: 10px; background-color: #ff8049; color: #FFF; border-radius: 7px; font-size: 15px;">
            Cadastrar nova empresa + 
          </button>
        </div>

        <div class="form-container">
          <h3 class="section-title poppins-semibold">Informações Básicas</h3>
          <div class="input-group">
            <div class="field-item" @click="openEdit('nome')">
              <label>Nome Completo</label>
              <div class="display-value">{{ form.nome || 'Toque para definir' }}</div>
              <span class="material-symbols-outlined arrow">chevron_right</span>
            </div>

            <div class="field-item" @click="openEdit('nome_usuario')">
              <label>Nome de Usuário (@)</label>
              <div class="display-value">@{{ form.nome_usuario }}</div>
              <span class="material-symbols-outlined arrow">chevron_right</span>
            </div>
          </div>

          <h3 class="section-title poppins-semibold mt-4">Profissional</h3>
          <div class="input-group">
            <div class="field-item" @click="openEdit('especialidades')">
              <label>Especialidades</label>
              <div class="display-value">{{ form.especialidades || 'Não informado' }}</div>
              <span class="material-symbols-outlined arrow">chevron_right</span>
            </div>

            <div class="field-item" @click="openEdit('desc_perfil')">
              <label>Bio</label>
              <div class="display-value truncate">{{ form.desc_perfil || 'Descreva seu perfil...' }}</div>
              <span class="material-symbols-outlined arrow">chevron_right</span>
            </div>
          </div>

          <h3 class="section-title poppins-semibold mt-4">Segurança e Localização</h3>
          <div class="input-group" style="margin-bottom: 50px;">
            <div class="field-item disabled">
              <label>CPF ou CNPJ (Bloqueado)</label>
              <div class="display-value">{{ form.cpf_cnpj }}</div>
              <span class="material-symbols-outlined lock">lock</span>
            </div>

            <div class="field-item disabled">
              <label>Email (Bloqueado)</label>
              <div class="display-value">{{ form.email }}</div>
              <span class="material-symbols-outlined lock">lock</span>
            </div>

            <div class="field-item" @click="openEdit('celular')">
              <label>Celular</label>
              <div class="display-value">{{ form.celular || 'Não cadastrado' }}</div>
              <span class="material-symbols-outlined arrow">chevron_right</span>
            </div>

            <div class="field-item" @click="openEdit('cidade')">
              <label>Cidade</label>
              <div class="display-value">{{ form.cidade }}</div>
              <span class="material-symbols-outlined arrow">chevron_right</span>
            </div>
            <div class="field-item" @click="openEdit('estado')">
              <label>Estado</label>
              <div class="display-value">{{ form.estado }}</div>
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
import { Avatar, Button, InputText, InputMask, Textarea, Dropdown } from 'primevue';
import { useAuthStore } from '@/stores/auth';
import { api } from '@/services/api';
import RefresherIonic from '@/components/refresherIonic.vue';

export default defineComponent({
  name: 'EditarPerfil',
  components: { IonPage, IonContent, Avatar, Button, InputText, InputMask, Textarea, Dropdown, RefresherIonic },
  setup() {
    const authStore = useAuthStore();
    const saving = ref(false);
    const activeEdit = ref<any>(null);
    const selectedFile = null;
    
    const form = ref<any>({
      nome: '',
      nome_usuario: '',
      especialidades: '',
      desc_perfil: '',
      email: '',
      celular: '',
      cpf_cnpj: '',
      cidade: '',
      estado: '',
      foto_perfil: ''
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
        { nome: 'Tocantins', sigla: 'TO' }
    ]);

    // Mapa de metadados para o modo de foco
    const fieldsConfig: Record<string, any> = {
      nome: { label: 'Nome Completo', key: 'nome', type: 'text', description: 'Este é o seu nome público que aparecerá nas cotações e propostas.' },
      nome_usuario: { label: 'Nome de Usuário', key: 'nome_usuario', type: 'text', description: 'Seu identificador único na plataforma. Use apenas letras e números.' },
      especialidades: { label: 'Especialidades', key: 'especialidades', type: 'text', description: 'Liste as categorias ou produtos que você mais domina.' },
      desc_perfil: { label: 'Bio Profissional', key: 'desc_perfil', type: 'textarea', description: 'Conte sua trajetória. Uma boa bio aumenta sua credibilidade com clientes. Máximo de 1200 caractéres.' },
      celular: { label: 'Celular', key: 'celular', type: 'mask', mask: '(99) 99999-9999', description: 'Usado para notificações urgentes e contato direto do cliente.' },
      cidade: { label: 'Cidade', key: 'cidade', type: 'text', description: 'Cidade onde você está localizado atualmente.' },
      estado: { label: 'Estado', key: 'estado', type: 'text', description: 'Estado onde você está localizado atualmente.' }
    };

    onMounted(() => {
      if (authStore.usuario) {
        form.value = { ...authStore.usuario };
      }
    });

    return { form, saving, authStore, activeEdit, fieldsConfig, estadosBR };
  },
  methods: {
    openEdit(fieldKey: string) {
      this.activeEdit = this.fieldsConfig[fieldKey];
    },
    closeEdit() {
      // Reverte para o estado original do store se cancelar
      this.form = { ...this.authStore.usuario };
      this.activeEdit = null;
    },
    async saveIndividualChange() {
      this.saving = true;

      try {
        // Payload completo conforme solicitado
        await api.put(`/mvpu/usuario/editarPerfilVendedor/`, this.form);
        
        this.authStore.setUsuario(this.form)
        this.activeEdit = null;

        this.$toast.add({ 
          severity: 'success', 
          summary: 'Perfil editado', 
          detail: 'Você atualizou o perfil com sucesso', 
          life: 3000 
        })


      } catch (error) {
        alert("Erro ao atualizar campo.");
      } finally {
        this.saving = false;
      }
    },

    async uploadFotoPerfil() {
      try{
        const formData = new FormData()
        formData.append('foto', this.selectedFile)


  
        const response = await api.post(
          '/mvpu/usuario/enviarFotoPerfil',
          formData
        )
  
        return response.data.data.foto_url
      }catch{
        this.$toast.add({ 
          severity: 'error', 
          summary: 'Erro ao adicionar foto', 
          detail: 'Erro ao adicionar foto de perfil', 
          life: 3000 
        })
      }
    },

    async onFileChange(event: any) {
      const file = event.target.files[0];

      if (!file) return

      if (file.size > 2 * 1024 * 1024) {

        this.$toast.add({ 
          severity: 'info', 
          summary: 'Tamanho máximo atingido', 
          detail: 'A foto deve ter no máximo 2MB.', 
          life: 3000 
        })

        return
      }

      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {

        this.$toast.add({ 
          severity: 'info', 
          summary: 'Entrada inválida', 
          detail: 'Formato de imagem inválido.', 
          life: 3000 
        })

        return
      }

      this.selectedFile = file
   

      if (this.selectedFile) {
          const fotoUrl = await this.uploadFotoPerfil()
          this.form.foto_perfil = fotoUrl
        } else {
          this.form.foto_perfil = null // ou '' se o backend exigir
        }

      if (file) {

        
        const reader = new FileReader();
        reader.onload = async (e: any) => {
          await this.saveIndividualChange(); // Salva foto automaticamente
        };
        reader.readAsDataURL(file);
      }
    }
  }
});
</script>

<style scoped>
.edit-profile-page { --background: #fbfbfb; }

/* OVERLAY DE FOCO TOTAL */
.edit-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: white; z-index: 1000;
  padding: 20px;
}

.edit-header {
  display: flex; justify-content: space-between; align-items: center;
}

.confirm-btn {
  background: #FF8049; color: white; border: none;
  width: 45px; height: 45px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}

.cancel-btn { background: none; border: none; color: #888; }

.field-label-active { color: #FF8049; font-size: 14px; margin-bottom: 8px; }

.focus-input {
  font-size: 15px;
  background-color: #FFF;
  color: #000;
  width: 100%;
}

.edit-description {
  display: flex; gap: 10px; padding: 15px;
  background: #fff7f4; border-radius: 12px; color: #cc663d;
}
.edit-description span { font-size: 20px; }
.edit-description p { margin: 0; font-size: 13px; line-height: 1.4; }

/* LISTA DE CAMPOS ESTILO IOS */
.input-group {
  background: white; border-radius: 16px;
  overflow: hidden; border: 1px solid #f2f2f2;
}

.field-item {
  display: flex; flex-direction: column; padding: 15px;
  border-bottom: 1px solid #f9f9f9; cursor: pointer;
  position: relative;
}
.field-item:active { background: #fafafa; }
.field-item.disabled { background: #fdfdfd; cursor: not-allowed; }

.field-item label { font-size: 11px; color: #bbb; text-transform: uppercase; font-weight: 700; }
.display-value { font-size: 15px; color: #333; margin-top: 4px; }
.display-value.truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 90%; }

.arrow { position: absolute; right: 15px; top: 50%; transform: translateY(-50%); color: #ddd; }
.lock { position: absolute; right: 15px; top: 50%; transform: translateY(-50%); color: #eee; font-size: 18px; }

/* HEADER E ESTILOS GERAIS */
.header-nav { display: flex; align-items: center; justify-content: space-between; padding: 10px 0 20px 0; }
.back-btn { width: 40px; height: 40px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
.page-title { font-size: 18px; color: #1a1a1a; margin: 0; }
.section-title { font-size: 11px; color: #FF8049; text-transform: uppercase; margin: 25px 0 10px 5px; }

.photo-edit-section { display: flex; justify-content: center; margin-bottom: 30px; }
.avatar-wrapper { position: relative; }
.profile-avatar-edit { width: 100px !important; height: 100px !important; border: 3px solid white; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
.upload-badge { position: absolute; bottom: 0; right: 0; background: #FF8049; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.bottom-spacer { height: 150px; }
</style>