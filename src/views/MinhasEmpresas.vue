<template>
  <ion-page class="companies-page">

    <ion-content :fullscreen="true" class="ion-padding">

      <RefresherIonic />

      <div class="custom-header">
            <div class="header-content">
                <h1 class="poppins-semibold" >Empresas</h1>
                <p class="poppins-regular">Gerencie as empresas que você representa</p>
            </div>
            <button class="add-fab" @click="abrirModalCadastro">
                <span class="material-symbols-outlined">add</span>
            </button>
      </div>
      <div class="search-container" v-if="empresas.length > 0">
        <span class="material-symbols-outlined search-icon">search</span>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Buscar por nome ou CNPJ..." 
          class="poppins-regular"
        />
      </div>

      <div style="
    font-family: 'Poppins', 'Segoe UI', Tahoma, sans-serif;
    background: #ffffff;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.05);
    max-width: 450px;
    border: 1px solid #f1f1f1;
    margin-bottom: 20px;
">
    <div style="
        display: flex; 
        align-items: center; 
        margin-bottom: 20px;
    ">
        <div style="
            background: rgba(255, 128, 73, 0.1);
            color: #ff8049;
            width: 40px;
            height: 40px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
        ">
            <span class="material-symbols-outlined" style="font-size: 22px;">domain</span>
        </div>
        <div style="font-weight: 700; color: #1a1d23; font-size: 16px; letter-spacing: -0.5px;">
            Dados da Corporação
        </div>
    </div>

    <div style="display: flex; flex-direction: column; gap: 16px;">
        
              <div style="display: flex; align-items: center; gap: 12px;">
                  <span class="material-symbols-outlined" style="color: #ff8049; font-size: 18px; opacity: 0.8;">corporate_fare</span>
                  <div style="display: flex; flex-direction: column;">
                      <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af; font-weight: 600; margin-bottom: 2px;">Razão Social</span>
                      <span style="font-size: 15px; color: #374151; font-weight: 600;">{{ empresaSelecionadaVendedor.nome_empresa }}</span>
                  </div>
              </div>

              <div style="height: 1px; background: #f3f4f6; width: 100%;"></div>

              <div style="display: flex; align-items: center; gap: 12px;">
                  <span class="material-symbols-outlined" style="color: #ff8049; font-size: 18px; opacity: 0.8;">fingerprint</span>
                  <div style="display: flex; flex-direction: column;">
                      <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af; font-weight: 600; margin-bottom: 2px;">Documento ID</span>
                      <span style="font-size: 15px; color: #374151; font-weight: 500; font-family: 'Roboto Mono', monospace;">{{empresaSelecionadaVendedor.cnpj}}</span>
                  </div>
              </div>

          </div>

          <div style="
              margin-top: 20px;
              display: inline-flex;
              align-items: center;
              background: #ecfdf5;
              color: #059669;
              padding: 4px 12px;
              border-radius: 100px;
              font-size: 12px;
              font-weight: 600;
          ">
              <span style="width: 6px; height: 6px; background: #10b981; border-radius: 50%; margin-right: 8px;"></span>
              Empresa Selecionada
          </div>
      </div>

      <div v-if="loading" class="center-state">
        <ion-spinner name="crescent" color="primary"></ion-spinner>
      </div>

      <div v-else-if="empresasFiltradas.length > 0" class="list-container">
        <transition-group name="list-fade">
          <div class="company-card" v-for="empresa in empresasFiltradas" :key="empresa.cnpj">
            <div class="company-info">
              <h3 class="poppins-medium">{{ empresa.nome_empresa }}</h3>
              <p class="poppins-regular">CNPJ: {{ empresa.cnpj }}</p>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <button @click="RemoverSelecao(empresa.cnpj)" v-if="empresa.selecionada" style="padding: 7px; color: #EE0000; background-color: #EE000030; border-radius: 8px;">
                  <span class="material-symbols-outlined">
                    close
                  </span>
              </button>
              <button v-else style="padding: 7px; color: #ff8049; background-color: #ff804930; border-radius: 8px;">
                <span @click="SelecionarEmpresa(empresa.cnpj)" class="material-symbols-outlined">
                  fire_check
                </span>
              </button>
              <button class="view-btn" @click="visualizarEmpresa(empresa)">
                <span class="material-symbols-outlined">visibility</span>
              </button>
            </div>
          </div>
        </transition-group>
      </div>

      <div v-else class="empty-state-container">
        <div class="empty-icon-wrapper">
          <span class="material-symbols-outlined">domain_disabled</span>
        </div>
        <h2 class="poppins-semibold">Nenhuma empresa encontrada</h2>
        <p class="poppins-regular">Você ainda não possui representadas vinculadas ao seu perfil.</p>
        <button class="primary-btn poppins-medium" @click="abrirModalCadastro">
          Cadastrar Primeira Empresa
        </button>
      </div>

      <Dialog 
        v-model:visible="modalDetalhes" 
        modal 
        header="Detalhes da Empresa" 
        :style="{ width: '90vw', maxWidth: '400px' }"
        class="fintech-modal"
      >
        <div class="modal-body poppins-regular">
          <div class="detail-row">
            <label>Nome Fantasia</label>
            <strong>{{ empresaSelecionada?.nome_empresa }}</strong>
          </div>
          <div class="detail-row">
            <label>CNPJ</label>
            <strong>{{ empresaSelecionada?.cnpj }}</strong>
          </div>
          <div class="detail-row">
            <label>Pedido Mínimo</label>
            <strong>{{ empresaSelecionada?.pedido_minimo != null ? formatarMoeda(empresaSelecionada.pedido_minimo) : 'Não cadastrado' }}</strong>
          </div>
          
          <button class="edit-btn poppins-medium" @click="abrirModalEdicao(empresaSelecionada)">
            <span class="material-symbols-outlined">edit</span>
            EDITAR EMPRESA
          </button>
          <button class="delete-btn poppins-medium" @click="deletarEmpresa">
            <span class="material-symbols-outlined">delete</span>
            DELETAR EMPRESA
          </button>
        </div>
      </Dialog>

      <!-- Modal: Cadastro de nova empresa -->
      <Dialog 
        v-model:visible="modalCadastro" 
        modal 
        header="Nova Empresa" 
        :style="{ width: '90vw', maxWidth: '400px' }"
        class="fintech-modal"
      >
        <div class="modal-body poppins-regular">
          <div class="input-group">
            <label>Nome da Empresa <span class="required-star">*</span></label>
            <input v-model="novaEmpresa.nome_empresa" placeholder="Ex: Distribuidora Silva" />
          </div>
          <div class="input-group">
            <label>CNPJ <span class="required-star">*</span></label>
            <input
              v-model="novaEmpresa.cnpjRaw"
              placeholder="00.000.000/0000-00"
              maxlength="18"
              @input="onCnpjInputNova"
              inputmode="numeric"
            />
          </div>
          <div class="input-group">
            <label>Pedido Mínimo (R$) <span class="required-star">*</span></label>
            <div class="currency-input-wrap">
              <span class="currency-prefix">R$</span>
              <input
                v-model="novaEmpresa.pedidoMinimoRaw"
                placeholder="0,00"
                @input="onPedidoMinimoInputNova"
                inputmode="numeric"
              />
            </div>
            <span class="field-hint">Valor mínimo de pedido da sua distribuidora</span>
          </div>
          <p v-if="erroCadastro" class="form-error">{{ erroCadastro }}</p>
          <button class="confirm-btn poppins-medium" @click="salvarEmpresa" :disabled="submitting">
            <span v-if="submitting">Salvando...</span>
            <span v-else>Confirmar Cadastro</span>
          </button>
        </div>
      </Dialog>

      <!-- Modal: Edição de empresa existente -->
      <Dialog 
        v-model:visible="modalEdicao" 
        modal 
        header="Editar Empresa" 
        :style="{ width: '90vw', maxWidth: '400px' }"
        class="fintech-modal"
      >
        <div class="modal-body poppins-regular">
          <div class="input-group">
            <label>Nome da Empresa <span class="required-star">*</span></label>
            <input v-model="empresaEmEdicao.nome_empresa" placeholder="Ex: Distribuidora Silva" />
          </div>
          <div class="input-group">
            <label>CNPJ</label>
            <input :value="empresaEmEdicao.cnpj" disabled class="input-disabled" />
            <span class="field-hint">O CNPJ não pode ser alterado</span>
          </div>
          <div class="input-group">
            <label>Pedido Mínimo (R$) <span class="required-star">*</span></label>
            <div class="currency-input-wrap">
              <span class="currency-prefix">R$</span>
              <input
                v-model="empresaEmEdicao.pedidoMinimoRaw"
                placeholder="0,00"
                @input="onPedidoMinimoInputEdicao"
                inputmode="numeric"
              />
            </div>
          </div>
          <p v-if="erroEdicao" class="form-error">{{ erroEdicao }}</p>
          <button class="confirm-btn poppins-medium" @click="atualizarEmpresa" :disabled="submitting">
            <span v-if="submitting">Salvando...</span>
            <span v-else>Salvar Alterações</span>
          </button>
        </div>
      </Dialog>

      <div style="height: 180px;"></div>

    </ion-content>
  </ion-page>
</template>
<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { IonPage, IonContent, IonSpinner, toastController } from '@ionic/vue';
import Dialog from 'primevue/dialog';
import { api } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import RefresherIonic from '@/components/refresherIonic.vue';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Extrai a mensagem de erro da resposta da API ou retorna mensagem genérica. */
function extrairErroApi(error: any): string {
  const data = error?.response?.data;
  if (data && (data.MSG || data.COD)) {
    return `Erro: ${data.MSG ?? 'Desconhecido'} (COD: ${data.COD ?? '?'})`;
  }
  return 'Erro desconhecido. Tente novamente.';
}

/** Formata string numérica para máscara de CNPJ: 00.000.000/0000-00 */
function aplicarMascaraCnpj(valor: string): string {
  const nums = valor.replace(/\D/g, '').slice(0, 14);
  return nums
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.?(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

/** Remove máscara do CNPJ, retornando apenas dígitos. */
function cnpjSomenteNumeros(valor: string): string {
  return valor.replace(/\D/g, '');
}

/** Formata centavos (inteiro) para exibição "1.234,56" */
function centavosParaExibicao(centavos: number): string {
  return (centavos / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Converte string de exibição "1.234,56" em número float. */
function exibicaoParaFloat(valor: string): number {
  return parseFloat(valor.replace(/\./g, '').replace(',', '.')) || 0;
}

/** Formata valor numérico para moeda BRL sem o prefixo R$. */
function formatarMoeda(valor: number | string): string {
  const num = typeof valor === 'string' ? parseFloat(valor) : valor;
  if (isNaN(num)) return 'R$ --';
  return 'R$ ' + num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── Componente ────────────────────────────────────────────────────────────────

export default defineComponent({
  name: 'EmpresasVendedor',
  components: { IonPage, IonContent, IonSpinner, Dialog, RefresherIonic },
  setup() {
    const empresas = ref<any[]>([]);
    const loading = ref(true);
    const submitting = ref(false);
    const searchQuery = ref('');
    const modalDetalhes = ref(false);
    const modalCadastro = ref(false);
    const modalEdicao = ref(false);
    const empresaSelecionada = ref<any>(null);
    const empresaSelecionadaVendedor = ref({ cnpj: '', nome_empresa: '' });
    const erroCadastro = ref('');
    const erroEdicao = ref('');

    // Estado do formulário de nova empresa
    const novaEmpresa = ref({
      cnpj: '',        // apenas dígitos (enviado à API)
      cnpjRaw: '',     // com máscara (exibido no input)
      nome_empresa: '',
      pedido_minimo: 0,        // float (enviado à API)
      pedidoMinimoRaw: '',     // string formatada (exibida no input)
    });

    // Estado do formulário de edição
    const empresaEmEdicao = ref<any>({
      cnpj: '',
      nome_empresa: '',
      pedido_minimo: 0,
      pedidoMinimoRaw: '',
    });

    // ── Handlers de máscara ─────────────────────────────────────────────────

    const onCnpjInputNova = (e: Event) => {
      const raw = (e.target as HTMLInputElement).value;
      const masked = aplicarMascaraCnpj(raw);
      novaEmpresa.value.cnpjRaw = masked;
      novaEmpresa.value.cnpj = cnpjSomenteNumeros(masked);
      (e.target as HTMLInputElement).value = masked;
    };

    const onPedidoMinimoInputNova = (e: Event) => {
      const raw = (e.target as HTMLInputElement).value.replace(/\D/g, '');
      const centavos = parseInt(raw || '0', 10);
      const formatado = centavosParaExibicao(centavos);
      novaEmpresa.value.pedidoMinimoRaw = formatado;
      novaEmpresa.value.pedido_minimo = centavos / 100;
      (e.target as HTMLInputElement).value = formatado;
    };

    const onPedidoMinimoInputEdicao = (e: Event) => {
      const raw = (e.target as HTMLInputElement).value.replace(/\D/g, '');
      const centavos = parseInt(raw || '0', 10);
      const formatado = centavosParaExibicao(centavos);
      empresaEmEdicao.value.pedidoMinimoRaw = formatado;
      empresaEmEdicao.value.pedido_minimo = centavos / 100;
      (e.target as HTMLInputElement).value = formatado;
    };

    // ── API ─────────────────────────────────────────────────────────────────

    const fetchEmpresas = async () => {
      loading.value = true;
      try {
        const { data } = await api.get('/mvpu/usuario/operacoesEmpresaVendedor/');
        for (const empresa of data.data) {
          if (empresa.selecionada) {
            empresaSelecionadaVendedor.value.cnpj = empresa.cnpj;
            empresaSelecionadaVendedor.value.nome_empresa = empresa.nome_empresa;
          }
        }
        empresas.value = data.data || [];
      } catch (error: any) {
        showToast(extrairErroApi(error), 'danger');
      } finally {
        loading.value = false;
      }
    };

    const empresasFiltradas = computed(() => {
      return empresas.value.filter(e =>
        e.nome_empresa.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        e.cnpj.includes(searchQuery.value)
      );
    });

    const visualizarEmpresa = (empresa: any) => {
      empresaSelecionada.value = empresa;
      modalDetalhes.value = true;
    };

    const abrirModalCadastro = () => {
      novaEmpresa.value = { cnpj: '', cnpjRaw: '', nome_empresa: '', pedido_minimo: 0, pedidoMinimoRaw: '' };
      erroCadastro.value = '';
      modalCadastro.value = true;
    };

    const abrirModalEdicao = (empresa: any) => {
      const pedMin = empresa.pedido_minimo ?? 0;
      empresaEmEdicao.value = {
        cnpj: empresa.cnpj,
        nome_empresa: empresa.nome_empresa,
        pedido_minimo: pedMin,
        pedidoMinimoRaw: centavosParaExibicao(Math.round(pedMin * 100)),
      };
      erroEdicao.value = '';
      modalDetalhes.value = false;
      modalEdicao.value = true;
    };

    const salvarEmpresa = async () => {
      erroCadastro.value = '';
      if (!novaEmpresa.value.nome_empresa.trim()) {
        erroCadastro.value = 'Informe o nome da empresa.';
        return;
      }
      if (novaEmpresa.value.cnpj.length !== 14) {
        erroCadastro.value = 'CNPJ inválido. Informe os 14 dígitos.';
        return;
      }
      if (!novaEmpresa.value.pedido_minimo || novaEmpresa.value.pedido_minimo <= 0) {
        erroCadastro.value = 'Informe o pedido mínimo da distribuidora.';
        return;
      }
      submitting.value = true;
      try {
        await api.post('/mvpu/usuario/operacoesEmpresaVendedor/', {
          cnpj: novaEmpresa.value.cnpj,
          nome_empresa: novaEmpresa.value.nome_empresa,
          pedido_minimo: novaEmpresa.value.pedido_minimo,
        });
        showToast('Empresa cadastrada com sucesso!');
        modalCadastro.value = false;
        fetchEmpresas();
      } catch (error: any) {
        erroCadastro.value = extrairErroApi(error);
        showToast(erroCadastro.value, 'danger');
      } finally {
        submitting.value = false;
      }
    };

    const atualizarEmpresa = async () => {
      erroEdicao.value = '';
      if (!empresaEmEdicao.value.nome_empresa.trim()) {
        erroEdicao.value = 'Informe o nome da empresa.';
        return;
      }
      if (!empresaEmEdicao.value.pedido_minimo || empresaEmEdicao.value.pedido_minimo <= 0) {
        erroEdicao.value = 'Informe o pedido mínimo da distribuidora.';
        return;
      }
      submitting.value = true;
      try {
        await api.put('/mvpu/usuario/operacoesEmpresaVendedor/', {
          cnpj: empresaEmEdicao.value.cnpj,
          nome_empresa: empresaEmEdicao.value.nome_empresa,
          pedido_minimo: empresaEmEdicao.value.pedido_minimo,
        });
        showToast('Empresa atualizada com sucesso!');
        modalEdicao.value = false;
        fetchEmpresas();
      } catch (error: any) {
        erroEdicao.value = extrairErroApi(error);
        showToast(erroEdicao.value, 'danger');
      } finally {
        submitting.value = false;
      }
    };

    const RemoverSelecao = async (cnpj: any) => {
      try {
        await api.post(`/mvpu/usuario/deselecionarEmpresa/${cnpj}`, {});
        showToast('Seleção da empresa removida!');
        fetchEmpresas();
      } catch (error: any) {
        showToast(extrairErroApi(error), 'danger');
      }
    };

    const SelecionarEmpresa = async (cnpj: any) => {
      try {
        await api.post(`/mvpu/usuario/selecionarEmpresa/${cnpj}`, {});
        showToast('Empresa selecionada com sucesso!');
        fetchEmpresas();
      } catch (error: any) {
        showToast(extrairErroApi(error), 'danger');
      }
    };

    const deletarEmpresa = async () => {
      try {
        await api.delete('/mvpu/usuario/operacoesEmpresaVendedor/', {
          data: { cnpj: empresaSelecionada.value.cnpj }
        });
        showToast('Empresa removida');
        modalDetalhes.value = false;
        fetchEmpresas();
      } catch (error: any) {
        showToast(extrairErroApi(error), 'danger');
      }
    };

    const showToast = async (msg: string, color = 'success') => {
      const toast = await toastController.create({
        message: msg,
        duration: 3000,
        color,
        position: 'bottom'
      });
      await toast.present();
    };

    onMounted(fetchEmpresas);

    return {
      empresas, loading, searchQuery, empresasFiltradas,
      modalDetalhes, modalCadastro, modalEdicao,
      empresaSelecionada, empresaSelecionadaVendedor,
      novaEmpresa, empresaEmEdicao,
      erroCadastro, erroEdicao,
      visualizarEmpresa, abrirModalCadastro, abrirModalEdicao,
      salvarEmpresa, atualizarEmpresa, deletarEmpresa,
      SelecionarEmpresa, RemoverSelecao,
      submitting,
      onCnpjInputNova,
      onPedidoMinimoInputNova,
      onPedidoMinimoInputEdicao,
      formatarMoeda,
    };
  }
});
</script>
<style scoped>
/* Variáveis de Cores */
:host {
  --navy: #1e293b;
  --orange: #ff8049;
  --bg-clean: #f8fafc;
}

.companies-page {
  --background: #f8fafc;
}

/* Header Fintech */
.custom-header {
  padding: 40px 20px 20px;
  background: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
}

.header-content{
    display: flex;
    flex-direction: column;
    align-items: start;
    margin: 0;
    padding: 0;
}

.header-content h1 {
  margin: 0;
  font-size: 24px;
  color: #1e293b;
}

.header-content p {
  margin: 4px 0 0;
  font-size: 14px;
  color: #64748b;
}

.add-fab {
  width: 48px;
  height: 48px;
  background: #1e293b;
  color: white;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(30, 41, 59, 0.2);
}

/* Barra de Pesquisa */
.search-container {
  background: white;
  border-radius: 14px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  border: 1px solid #e2e8f0;
}

.search-icon {
  color: #94a3b8;
  margin-right: 12px;
}

.search-container input {
  border: none;
  outline: none;
  width: 100%;
  font-size: 15px;
  color: #1e293b;
}

/* Company Cards */
.company-card {
  background: white;
  border-radius: 18px;
  padding: 18px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.02);
  border: 1px solid #f1f5f9;
}

.company-info h3 {
  margin: 0;
  font-size: 16px;
  color: #1e293b;
}

.company-info p {
  margin: 4px 0 0;
  font-size: 13px;
  color: #94a3b8;
}

.view-btn {
  background: #f1f5f9;
  color: #1e293b;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Empty State */
.empty-state-container {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon-wrapper {
  width: 80px;
  height: 80px;
  background: #f1f5f9;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: #cbd5e1;
}

.empty-icon-wrapper span { font-size: 40px; }

.primary-btn {
  margin-top: 30px;
  background: #ff8049;
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 16px;
  font-size: 15px;
  width: 100%;
  box-shadow: 0 6px 16px rgba(255, 128, 73, 0.25);
}

/* Modal PrimeVue Customization */
:deep(.fintech-modal) {
  border-radius: 24px;
}

:deep(.p-dialog-header) {
  padding: 24px;
  font-family: 'Poppins', sans-serif;
}

.modal-body {
  padding: 0 24px 24px;
}

.detail-row {
  margin-bottom: 20px;
}

.detail-row label {
  display: block;
  font-size: 12px;
  color: #94a3b8;
  text-transform: uppercase;
}

.detail-row strong {
  font-size: 16px;
  color: #1e293b;
}

.input-group {
  margin-bottom: 16px;
}

.input-group label {
  display: block;
  font-size: 13px;
  margin-bottom: 6px;
  color: #64748b;
}

.input-group input {
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  border: 1.5px solid #e2e8f0;
  outline: none;
  transition: 0.3s;
}

.input-group input:focus { border-color: #ff8049; }

.delete-btn {
  width: 100%;
  padding: 14px;
  background: #fef2f2;
  color: #ef4444;
  border: none;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  margin-top: 20px;
}

.confirm-btn {
  width: 100%;
  padding: 16px;
  background: #1e293b;
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 15px;
  margin-top: 10px;
}

/* Animations */
.list-fade-enter-active, .list-fade-leave-active {
  transition: all 0.4s ease;
}
.list-fade-enter-from, .list-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Campo obrigatório */
.required-star {
  color: #ef4444;
  margin-left: 2px;
}

/* Input de moeda */
.currency-input-wrap {
  display: flex;
  align-items: center;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  transition: border-color 0.3s;
}
.currency-input-wrap:focus-within {
  border-color: #ff8049;
}
.currency-prefix {
  padding: 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: #94a3b8;
  background: #f8fafc;
  border-right: 1.5px solid #e2e8f0;
  height: 100%;
  display: flex;
  align-items: center;
  align-self: stretch;
}
.currency-input-wrap input {
  border: none;
  outline: none;
  padding: 14px 12px;
  font-size: 15px;
  width: 100%;
  background: transparent;
}

/* Campo desabilitado */
.input-disabled {
  background: #f8fafc !important;
  color: #94a3b8 !important;
  cursor: not-allowed;
}

/* Hint abaixo do campo */
.field-hint {
  display: block;
  font-size: 11px;
  color: #94a3b8;
  margin-top: 4px;
}

/* Erro de validação inline */
.form-error {
  color: #ef4444;
  font-size: 13px;
  margin: 0 0 10px;
  padding: 8px 12px;
  background: #fef2f2;
  border-radius: 8px;
}

/* Botão de editar */
.edit-btn {
  width: 100%;
  padding: 14px;
  background: #f0f9ff;
  color: #0ea5e9;
  border: none;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  margin-top: 12px;
}
</style>