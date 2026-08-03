<template>
  <Dialog 
    v-model:visible="visible" 
    modal 
    :draggable="false"
    :dismissableMask="true"
    class="fintech-modal-container"
    :style="{ width: '90vw', maxWidth: '380px' }"
    :show-header="false"
  >
    <div class="fintech-modal-content poppins-regular">
      <div class="modal-indicator"></div>

      <div class="content-body">
        <h2 class="poppins-semibold modal-title">{{ titulo }}</h2>
        <p class="modal-description">{{ descricao }}</p>
      </div>

      <div class="modal-footer">
        <button class="close-btn poppins-medium" @click="closeModal">
          Entendido
        </button>
      </div>
    </div>
  </Dialog>
</template>

<script>
import Dialog from 'primevue/dialog';

export default {
  name: 'AvisoFintech',
  components: {
    Dialog
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    titulo: { 
      type: String, 
      default: 'Aviso Importante' 
    },
    descricao: { 
      type: String, 
      default: 'Este é um aviso do sistema.' 
    }
  },
  emits: ['update:modelValue'],
  computed: {
    // Computed com getter e setter para suportar v-model
    visible: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      }
    }
  },
  methods: {
    closeModal() {
      this.visible = false;
    }
  }
};
</script>

<style scoped>
/* Estilização Nível Fintech - Sobrescrevendo PrimeVue */
:deep(.fintech-modal-container) {
  border: none !important;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15) !important;
  border-radius: 28px !important;
  overflow: hidden;
  width: 80vw;
  max-width: 380px;
  background: white !important;
}

.fintech-modal-content {
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.modal-indicator {
  width: 40px;
  height: 4px;
  background: #e2e8f0;
  border-radius: 10px;
  margin-bottom: 24px;
}

.modal-title {
  color: #1e293b; /* Navy */
  font-size: 20px;
  margin-bottom: 12px;
  line-height: 1.3;
}

.modal-description {
  color: #64748b; /* Slate */
  font-size: 15px;
  line-height: 1.6;
  margin-bottom: 32px;
}

.modal-footer {
  width: 100%;
}

.close-btn {
  width: 100%;
  padding: 16px;
  background: #1e293b;
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(30, 41, 59, 0.2);
}

.close-btn:active {
  transform: scale(0.97);
  background: #0f172a;
}

/* Tipografia */
.poppins-semibold { font-family: 'Poppins', sans-serif; font-weight: 600; }
.poppins-regular { font-family: 'Poppins', sans-serif; font-weight: 400; }
.poppins-medium { font-family: 'Poppins', sans-serif; font-weight: 500; }
</style>