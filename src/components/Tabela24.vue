<template>
  <div class="card">
    <div class="table-header" style="overflow: auto">
      <div class="tabs">
        <button class="tab-btn" :class="{ active: abaAtiva === 'ativos' }" @click="abaAtiva = 'ativos'">
          Ativos
          <span class="tab-count">{{ colaboradoresAtivos.length }}</span>
        </button>
        <button class="tab-btn" :class="{ active: abaAtiva === 'desativados' }" @click="abaAtiva = 'desativados'">
          Desativados
          <span class="tab-count">{{ colaboradoresDesativados.length }}</span>
        </button>
        <button v-if="this.user?.nivel==1" class="tab-btn" :class="{ active: abaAtiva === 'auditoria' }" @click="selecionarAuditoria">
          <span class="material-symbols-outlined tab-icon">history</span>
          Auditoria
        </button>
      </div>

      <div v-if="abaAtiva !== 'auditoria'" class="search-box" style="width: 100%;">
        <span class="material-symbols-outlined">search</span>
        <input type="text" v-model="filtro" placeholder="Buscar por nome, e-mail ou CPF..." />
      </div>

      <div v-else class="search-box" style="width: 100%;">
        <span class="material-symbols-outlined">search</span>
        <input type="text" v-model="filtroAuditoria" placeholder="Buscar por e-mail do operador..." />
      </div>
    </div>

    <!-- ===================== ATIVOS / DESATIVADOS ===================== -->
    <template v-if="abaAtiva === 'ativos' || abaAtiva === 'desativados'">
      <DataTable
        v-if="!loading && colaboradoresFiltrados.length > 0"
        :value="colaboradoresFiltrados"
        dataKey="id_usuario"
        responsiveLayout="scroll"
        stripedRows
        rowHover
        v-model:expandedRows="expandedRows"
      >
        <Column expander style="width: 3rem" />

        <Column header="Colaborador">
          <template #body="{ data }">
            <div class="perfil">
              <Avatar v-if="!data.foto" :image="data.foto" icon="pi pi-user" shape="circle" class="avatar" />
              <img v-else :src="data.foto" alt="" style="width: 35px; height: 35px; border-radius: 50px;">
              <div>
                <div class="nome">{{ data.nome }}</div>
                <div class="email">{{ data.email }}</div>
              </div>
            </div>
          </template>
        </Column>

        <Column field="cpf" header="CPF" />

        <Column header="Função">
          <template #body="{ data }">
            <Tag
              :value="getLabelNivel(data.nivel)"
              :class="'tag-' + (data.nivel === 4 ? 'estoque' : 'caixa')"
            />
          </template>
        </Column>

        <Column header="Ações" headerStyle="width: 10rem; text-align: center" bodyStyle="text-align: center">
          <template #body="{ data }">
            <div class="acoes-buttons">
              <template v-if="!isDesativado(data)">
                <button class="btn-action key" @click="abrirNovaSenha(data)" title="Enviar nova senha de acesso">
                  <span class="material-symbols-outlined">key</span>
                </button>
                <button class="btn-action delete" @click="confirmarDesativar(data)" title="Desativar">
                  <span class="material-symbols-outlined">person_off</span>
                </button>
              </template>

              <button v-else class="btn-action reactivate" @click="confirmarReativar(data)" title="Reativar">
                <span class="material-symbols-outlined">restart_alt</span>
              </button>
            </div>
          </template>
        </Column>

        <template #expansion="{ data }">
          <div class="detalhes-container">
            <div class="detalhes-grid">
              <div class="info-group">
                <span class="info-label">Contato Direto</span>
                <span class="info-value"><i class="pi pi-whatsapp"></i> {{ data.celular }}</span>
              </div>
              <div class="info-group">
                <span class="info-label">Localização</span>
                <span class="info-value">{{ data.rua }}</span>
                <span class="info-subvalue">{{ data.cidade }} - {{ data.estado }} ({{ data.cep }})</span>
              </div>
              <div class="info-group">
                <span class="info-label">Data de Cadastro</span>
                <span class="info-value">{{ formatarData(data.data_criacao) }}</span>
              </div>
            </div>
          </div>
        </template>
      </DataTable>

      <div v-if="loading" class="state-container">
        <ProgressSpinner style="width: 40px; height: 40px" strokeWidth="4" />
        <span class="muted">Sincronizando colaboradores...</span>
      </div>

      <div v-else-if="!loading && colaboradoresFiltrados.length === 0" class="state-container">
        <span class="material-symbols-outlined empty-icon">group_off</span>
        <div class="poppins-regular">
          {{ abaAtiva === 'ativos' ? 'Nenhum colaborador ativo encontrado' : 'Nenhum colaborador desativado encontrado' }}
        </div>
      </div>
    </template>

    <!-- ===================== AUDITORIA ===================== -->
    <template v-else>
      <div class="tabs tabs-secondary">
        <button class="tab-btn small" :class="{ active: abaAuditoria === 'usuario' }" @click="abaAuditoria = 'usuario'">
          Por Usuário
        </button>
        <button class="tab-btn small" :class="{ active: abaAuditoria === 'periodo' }" @click="abaAuditoria = 'periodo'">
          Por Período
        </button>
      </div>

      <div v-if="loadingAuditoria" class="state-container">
        <ProgressSpinner style="width: 40px; height: 40px" strokeWidth="4" />
        <span class="muted">Carregando auditoria...</span>
      </div>

      <template v-else>
        <!-- POR USUÁRIO (AGRUPADO POR OPERADOR) -->
        <DataTable
          v-if="abaAuditoria === 'usuario' && operadoresFiltrados.length > 0"
          :value="operadoresFiltrados"
          dataKey="email_operador"
          responsiveLayout="scroll"
          stripedRows
          rowHover
          v-model:expandedRows="expandedOperadores"
        >
          <Column expander style="width: 3rem" />

          <Column header="Operador">
            <template #body="{ data }">
              <div class="perfil">
                <Avatar icon="pi pi-user" shape="circle" class="avatar" />
                <div>
                  <div class="nome">{{ data.email_operador }}</div>
                  <div class="email">{{ data.totalAcoes }} ação(ões) registrada(s)</div>
                </div>
              </div>
            </template>
          </Column>

          <Column header="Última Alteração">
            <template #body="{ data }">{{ formatarDataHora(data.ultimaData) }}</template>
          </Column>

          <Column header="Tipo da Última Alteração">
            <template #body="{ data }">
              <Tag :value="tipoAlteracaoLabel(data.ultimoTipo)" class="tag-audit" />
            </template>
          </Column>

          <template #expansion="{ data }">
            <div class="detalhes-container">
              <div class="audit-timeline">
                <div v-for="registro in data.registros" :key="registro.id_auditoria_colab" class="audit-record">
                  <div class="audit-record-header" style="display: flex; justify-content: space-between;">
                    <div style="display: flex; gap: 15px; align-items: center;">
                      <div>
                        <span class="audit-data">{{ formatarDataHora(registro.data_operacao) }}</span>
                      </div>
                      <div>
                        <Tag :value="tipoAlteracaoLabel(registro.tipo_alteracao)" class="tag-audit" />
                      </div>
                      <div>
                        <span class="audit-metodo">{{ metodoAlteracaoLabel(registro.metodo_alteracao) }}</span>
                      </div>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                      <span class="audit-usuario-afetado">Usuário que alterou: <strong>{{ registro.email }}</strong></span>
                      <span class="audit-usuario-afetado">Usuário afetado: <strong>{{ registro.email_operador }}</strong></span>
                    </div>
                  </div>
                  <div class="diff-list">
                    <div
                      v-for="(item, idx) in diffCampos(registro.dados_anteriores, registro.dados_novos)"
                      :key="idx"
                      class="diff-item"
                    >
                      <span class="diff-label">{{ item.label }}</span>
                      <span class="diff-values">
                        <span class="diff-old">{{ item.de }}</span>
                        <span class="material-symbols-outlined diff-arrow">arrow_forward</span>
                        <span class="diff-new">{{ item.para }}</span>
                      </span>
                    </div>
                    <div v-if="diffCampos(registro.dados_anteriores, registro.dados_novos).length === 0" class="diff-empty">
                      Nenhuma alteração de dados registrada para esta ação.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </DataTable>

        <!-- POR PERÍODO (LISTA CRONOLÓGICA) -->
        <DataTable
          v-if="abaAuditoria === 'periodo' && auditoriaFiltradaPeriodo.length > 0"
          :value="auditoriaFiltradaPeriodo"
          dataKey="id_auditoria_colab"
          responsiveLayout="scroll"
          stripedRows
          rowHover
          v-model:expandedRows="expandedRegistros"
        >
          <Column expander style="width: 3rem" />

          <Column header="Data/Hora">
            <template #body="{ data }">{{ formatarDataHora(data.data_operacao) }}</template>
          </Column>

          <Column header="Usuário que alterou" field="email" />

          <Column header="Usuário Afetado" field="email_operador" />


          <Column header="Tipo">
            <template #body="{ data }">
              <Tag :value="tipoAlteracaoLabel(data.tipo_alteracao)" class="tag-audit" />
            </template>
          </Column>

          <Column header="Método">
            <template #body="{ data }">
              <span class="audit-metodo">{{ metodoAlteracaoLabel(data.metodo_alteracao) }}</span>
            </template>
          </Column>

          <template #expansion="{ data }">
            <div class="detalhes-container">
              <div class="diff-list">
                <div
                  v-for="(item, idx) in diffCampos(data.dados_anteriores, data.dados_novos)"
                  :key="idx"
                  class="diff-item"
                >
                  <span class="diff-label">{{ item.label }}</span>
                  <span class="diff-values">
                    <span class="diff-old">{{ item.de }}</span>
                    <span class="material-symbols-outlined diff-arrow">arrow_forward</span>
                    <span class="diff-new">{{ item.para }}</span>
                  </span>
                </div>
                <div v-if="diffCampos(data.dados_anteriores, data.dados_novos).length === 0" class="diff-empty">
                  Nenhuma alteração de dados registrada para esta ação.
                </div>
              </div>
            </div>
          </template>
        </DataTable>

        <div
          v-if="(abaAuditoria === 'usuario' && operadoresFiltrados.length === 0) || (abaAuditoria === 'periodo' && auditoriaFiltradaPeriodo.length === 0)"
          class="state-container"
        >
          <span class="material-symbols-outlined empty-icon">history_toggle_off</span>
          <div class="poppins-regular">Nenhum registro de auditoria encontrado</div>
        </div>
      </template>
    </template>

    <!-- ===================== MODAIS ===================== -->
    <Dialog style="font-family: 'Poppins'" v-model:visible="modalSenha" header="Enviar Nova Senha de Acesso" :modal="true" :style="{width: '400px'}">
      <div class="form-container">
        <p class="modal-desc">Defina uma nova senha de acesso para <strong>{{ selectedColab.nome }}</strong>.</p>
        <div class="field">
          <label>Nova senha</label>
          <InputText v-model="novaSenha" type="password" placeholder="Digite a nova senha" />
        </div>
        <div class="field">
          <label>Confirmar nova senha</label>
          <InputText v-model="confirmarSenha" type="password" placeholder="Repita a nova senha" />
        </div>
        <span v-if="senhaDivergente" class="field-erro">As senhas não coincidem.</span>
      </div>
      <template #footer>
        <Button label="Cancelar" class="p-button-text" @click="modalSenha = false" />
        <Button
          label="Enviar Nova Senha"
          class="btn-confirm"
          @click="enviarNovaSenha"
          :loading="loadingAcao"
          :disabled="!novaSenha || !confirmarSenha || senhaDivergente"
        />
      </template>
    </Dialog>

    <Dialog style="font-family: 'Poppins'" v-model:visible="modalDesativar" header="Atenção" :modal="true" :style="{width: '350px'}">
      <div class="delete-confirm">
        <span class="material-symbols-outlined warning-icon">warning</span>
        <p>Deseja realmente desativar <strong>{{ selectedColab.nome }}</strong>? Ele perderá o acesso ao sistema.</p>
      </div>
      <template #footer>
        <Button label="Manter" class="p-button-text" @click="modalDesativar = false" />
        <Button label="Sim, Desativar" class="p-button-danger p-button-raised" @click="desativarColaborador" :loading="loadingAcao" />
      </template>
    </Dialog>

    <Dialog style="font-family: 'Poppins'" v-model:visible="modalReativar" header="Reativar Colaborador" :modal="true" :style="{width: '350px'}">
      <div class="delete-confirm">
        <span class="material-symbols-outlined reactivate-icon">restart_alt</span>
        <p>Deseja reativar <strong>{{ selectedColab.nome }}</strong>?</p>
      </div>
      <template #footer>
        <Button label="Cancelar" class="p-button-text" @click="modalReativar = false" />
        <Button label="Sim, Reativar" class="btn-confirm" @click="reativarColaborador" :loading="loadingAcao" />
      </template>
    </Dialog>
  </div>
</template>

<script>
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Avatar from 'primevue/avatar'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import ProgressSpinner from 'primevue/progressspinner'
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import exibeErro from '@/utils/ExibeErro'

// ///////////////////////////////////////////////////////////////////////
// Tradução genérica de campos de usuário para exibição humanizada
// ///////////////////////////////////////////////////////////////////////

const CAMPO_LABELS = {
  nome: 'Nome',
  email: 'E-mail',
  cpf: 'CPF',
  celular: 'Celular',
  nivel: 'Função',
  rua: 'Rua',
  cidade: 'Cidade',
  estado: 'Estado',
  cep: 'CEP',
  foto: 'Foto de Perfil',
  plano: 'Plano',
  data_pagamento: 'Data de Pagamento',
  passe_usuario: 'Senha',
  desativado: 'Status',
  soft_delete: 'Desativado em',
  desativado_em: 'Desativado em',
  data_criacao: 'Data de Criação',
  id_loja: 'Loja',
  id_dono: 'Dono',
}

// Campos que não devem aparecer no diff de auditoria (irrelevantes para o usuário final)
const CAMPOS_OCULTOS = ['data_pagamento', 'plano', 'id_dono', 'id_loja', 'id_usuario']

const TIPO_ALTERACAO_LABELS = {
  reat: 'Reativação',
  reativacao: 'Reativação',
  updpwd: 'Alteração de Senha',
  senha: 'Alteração de Senha',
  atualizacao: 'Atualização de Dados',
  edicao: 'Atualização de Dados',
  desativacao: 'Desativação',
  exclusao: 'Desativação',
  criacao: 'Criação de Usuário',
}

const METODO_ALTERACAO_LABELS = {
  PUT: 'Atualização (PUT)',
  POST: 'Criação (POST)',
  DELETE: 'Remoção (DELETE)',
  PATCH: 'Atualização (PATCH)',
}

export default {
  name: 'TabelaColaboradores',
  components: { DataTable, Column, Tag, Avatar, Button, Dialog, InputText, ProgressSpinner },

  data() {
    return {
      colaboradores: [],
      expandedRows: [],
      filtro: '',
      abaAtiva: 'ativos',

      loading: false,
      loadingAcao: false,

      modalSenha: false,
      modalDesativar: false,
      modalReativar: false,
      selectedColab: {},
      novaSenha: '',
      confirmarSenha: '',
      user: null,

      // Auditoria
      abaAuditoria: 'usuario',
      auditoriaResultados: [],
      auditoriaCarregada: false,
      loadingAuditoria: false,
      filtroAuditoria: '',
      expandedOperadores: [],
      expandedRegistros: [],

      niveis: [
        { label: 'Estoquista', value: 4 },
        { label: 'Operador de Caixa', value: 3 },
        { label: 'Supervisor', value: 6 },
        { label: 'Operador', value: 7 },
      ]
    }
  },

  computed: {
    colaboradoresAtivos() {
      return this.colaboradores.filter(c => !this.isDesativado(c));
    },
    colaboradoresDesativados() {
      return this.colaboradores.filter(c => this.isDesativado(c));
    },
    colaboradoresFiltrados() {
      const base = this.abaAtiva === 'ativos' ? this.colaboradoresAtivos : this.colaboradoresDesativados;
      if (!this.filtro) return base;
      const t = this.filtro.toLowerCase();
      return base.filter(c =>
        c.nome?.toLowerCase().includes(t) || c.email?.toLowerCase().includes(t) || c.cpf?.includes(t)
      );
    },
    senhaDivergente() {
      return !!this.novaSenha && !!this.confirmarSenha && this.novaSenha !== this.confirmarSenha;
    },

    // Agrupa os registros de auditoria pelo e-mail do OPERADOR
    operadoresAgrupados() {
      const grupos = {};
      this.auditoriaResultados.forEach(registro => {
        const email = registro.email_operador;
        if (!grupos[email]) grupos[email] = [];
        grupos[email].push(registro);
      });

      return Object.keys(grupos).map(email => {
        const registros = [...grupos[email]].sort((a, b) => Number(b.data_operacao) - Number(a.data_operacao));
        return {
          email_operador: email,
          totalAcoes: registros.length,
          ultimaData: registros[0]?.data_operacao,
          ultimoTipo: registros[0]?.tipo_alteracao,
          registros
        };
      }).sort((a, b) => Number(b.ultimaData) - Number(a.ultimaData));
    },

    operadoresFiltrados() {
      if (!this.filtroAuditoria) return this.operadoresAgrupados;
      const t = this.filtroAuditoria.toLowerCase();
      return this.operadoresAgrupados.filter(o => o.email_operador?.toLowerCase().includes(t));
    },

    auditoriaOrdenadaPeriodo() {
      return [...this.auditoriaResultados].sort((a, b) => Number(b.data_operacao) - Number(a.data_operacao));
    },

    auditoriaFiltradaPeriodo() {
      if (!this.filtroAuditoria) return this.auditoriaOrdenadaPeriodo;
      const t = this.filtroAuditoria.toLowerCase();
      return this.auditoriaOrdenadaPeriodo.filter(r =>
        r.email_operador?.toLowerCase().includes(t) || r.email?.toLowerCase().includes(t)
      );
    }
  },

  methods: {
    getLabelNivel(n) { return this.niveis.find(i => i.value === n)?.label || 'Usuário'; },
    formatarData(d) { return d ? new Date(d).toLocaleDateString('pt-BR') : '—'; },
    formatarDataHora(ts) {
      if (!ts) return '—';
      const data = new Date(Number(ts));
      if (isNaN(data.getTime())) return '—';
      return data.toLocaleString('pt-BR');
    },
    isDesativado(c) { return !!c.soft_delete || c.desativado === true; },

    tipoAlteracaoLabel(tipo) {
      if (!tipo) return 'Ação';
      const chave = String(tipo).toLowerCase();
      return TIPO_ALTERACAO_LABELS[chave] || (tipo.charAt(0).toUpperCase() + tipo.slice(1));
    },
    metodoAlteracaoLabel(metodo) {
      if (!metodo) return '—';
      return METODO_ALTERACAO_LABELS[String(metodo).toUpperCase()] || metodo;
    },
    campoLabel(campo) { return CAMPO_LABELS[campo] || campo; },
    formatarValorCampo(campo, valor) {
      if (valor === null || valor === undefined || valor === '') return '—';
      if (campo === 'nivel') return this.getLabelNivel(Number(valor));
      if (campo === 'passe_usuario') return '••••••••';
      if (campo === 'desativado') return valor ? 'Sim' : 'Não';
      if (campo === 'desativado_em' || campo === 'soft_delete' || campo === 'data_criacao') {
        const formatado = this.formatarDataHora(valor);
        return formatado !== '—' ? formatado : String(valor);
      }
      return String(valor);
    },

    // Gera a diferença humanizada entre dados_anteriores e dados_novos
    diffCampos(anteriores, novos) {
      const de = anteriores || {};
      const para = novos || {};
      const chaves = Array.from(new Set([...Object.keys(de), ...Object.keys(para)]))
        .filter(chave => !CAMPOS_OCULTOS.includes(chave));

      return chaves
        .filter(chave => JSON.stringify(de[chave]) !== JSON.stringify(para[chave]))
        .map(chave => ({
          label: this.campoLabel(chave),
          de: this.formatarValorCampo(chave, de[chave]),
          para: this.formatarValorCampo(chave, para[chave])
        }));
    },

    async carregarColaboradores() {
      this.loading = true;
      const auth = useAuthStore();
      this.user  = useAuthStore().user;
      try {
        const res = await api.get(`/mvpu/usuario/consultarColabs/${auth.loja.id_loja}`);
        this.colaboradores = res.data.data || [];
      } catch (e) { exibeErro(e, this.$toast); }
      finally { this.loading = false; }
    },

    selecionarAuditoria() {
      this.abaAtiva = 'auditoria';
      if (!this.auditoriaCarregada) this.carregarAuditoria();
    },

    async carregarAuditoria() {
      this.loadingAuditoria = true;
      const auth = useAuthStore();
      try {
        const res = await api.get(`/mvpu/usuario/consultarAuditoriaColabs/${auth.loja.id_loja}`);
        this.auditoriaResultados = res.data.data?.resultados || [];
        this.auditoriaCarregada = true;
      } catch (e) { exibeErro(e, this.$toast); }
      finally { this.loadingAuditoria = false; }
    },

    abrirNovaSenha(c) {
      this.selectedColab = c;
      this.novaSenha = '';
      this.confirmarSenha = '';
      this.modalSenha = true;
    },
    confirmarDesativar(c) { this.selectedColab = c; this.modalDesativar = true; },
    confirmarReativar(c) { this.selectedColab = c; this.modalReativar = true; },

    async enviarNovaSenha() {
      if (this.senhaDivergente || !this.novaSenha) return;
      this.loadingAcao = true;
      try {
        const auth = useAuthStore();
        await api.put(`/mvpu/usuario/editarColab/${this.selectedColab.email}/${auth.loja.id_loja}`, {
          pctInf: { tpOp: 'updpwd', passe_usuario: this.novaSenha }
        });
        this.$toast.add({ 
            severity: 'success', 
            summary: 'Senha atualizada', 
            detail: 'Nova senha enviada com sucesso!', 
            life: 3000 
        });

        this.modalSenha = false;
      } catch (e) { exibeErro(e, this.$toast); }
      finally { this.loadingAcao = false; }
    },

    async desativarColaborador() {
      this.loadingAcao = true;
      try {
        const auth = useAuthStore();
        await api.delete(`/mvpu/usuario/deletarColab/${this.selectedColab.email}/${auth.loja.id_loja}`);
        this.$toast.add({ 
            severity: 'success', 
            summary: 'Operação OK', 
            detail: 'Colaborador desativado!', 
            life: 3000 
        });

        this.modalDesativar = false;
        this.carregarColaboradores();
      } catch (e) { exibeErro(e, this.$toast); }
      finally { this.loadingAcao = false; }
    },

    async reativarColaborador() {
      this.loadingAcao = true;
      try {
        const auth = useAuthStore();
        await api.put(`/mvpu/usuario/editarColab/${this.selectedColab.email}/${auth.loja.id_loja}`, {
          pctInf: { tpOp: 'reat' }
        });

        this.$toast.add({ 
            severity: 'success', 
            summary: 'Operação OK', 
            detail: 'Colaborador reativado!', 
            life: 3000 
        });        

        this.modalReativar = false;
        this.carregarColaboradores();
      } catch (e) { exibeErro(e, this.$toast); }
      finally { this.loadingAcao = false; }
    }
  },

  mounted() { this.carregarColaboradores(); }
}
</script>

<style scoped>
.card { background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }

/* HEADER */
.table-header {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}
.search-box {
  display: flex; align-items: center; background: #f1f5f9;
  border-radius: 12px; padding: 8px 16px; gap: 10px; flex: 1;
}
.search-box input { border: none; background: transparent; outline: none; width: 100%; font-size: 14px; }
.search-box span { color: #64748b; }

/* TABS (PRINCIPAIS) */
.tabs { display: flex; gap: 8px; background: #f1f5f9; padding: 4px; border-radius: 12px; }
.tab-btn {
  border: none; background: transparent; padding: 8px 16px; border-radius: 9px;
  font-size: 13px; font-weight: 600; color: #64748b; cursor: pointer;
  display: flex; align-items: center; gap: 8px; transition: background 0.2s, color 0.2s;
}
.tab-btn:hover { color: #334155; }
.tab-btn.active { background: #fff; color: #ff8049; box-shadow: 0 2px 6px rgba(0,0,0,0.08); }
.tab-icon { font-size: 16px; }
.tab-count { background: #e2e8f0; color: #475569; font-size: 11px; font-weight: 700; padding: 1px 7px; border-radius: 999px; }
.tab-btn.active .tab-count { background: #ffe4d6; color: #ff8049; }

/* TABS (SECUNDÁRIAS - AUDITORIA) */
.tabs-secondary { margin-bottom: 16px; display: inline-flex; }
.tab-btn.small { padding: 6px 14px; font-size: 12px; }

/* PERFIL */
.perfil { display: flex; align-items: center; gap: 12px; }
.avatar { background: #e2e8f0; color: #ff8049; }
.nome { font-weight: 700; color: #1e293b; font-size: 14px; }
.email { font-size: 12px; color: #94a3b8; }

/* BOTÕES AÇÃO */
.acoes-buttons { display: flex; justify-content: center; gap: 12px; padding-right: 40px; }
.btn-action {
  border: none; background: transparent; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: transform 0.2s, color 0.2s;
}
.btn-action span { font-size: 22px; }
.key { color: #3b82f6; }
.key:hover { color: #1d4ed8; transform: scale(1.1); }
.delete { color: #ef4444; }
.delete:hover { color: #b91c1c; transform: scale(1.1); }
.reactivate { color: #22c55e; }
.reactivate:hover { color: #15803d; transform: scale(1.1); }

/* EXPANSÃO */
.detalhes-container { padding: 15px 40px; background: #f8fafc; border-radius: 0 0 8px 8px; }
.detalhes-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.info-label { display: block; font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase; margin-bottom: 4px; }
.info-value { display: block; font-size: 14px; color: #334155; font-weight: 500; }
.info-subvalue { display: block; font-size: 12px; color: #64748b; }

/* TAGS */
.tag-estoque { background: #dcfce7 !important; color: #166534 !important; }
.tag-caixa { background: #fef9c3 !important; color: #854d0e !important; }
.tag-audit { background: #e0e7ff !important; color: #3730a3 !important; }

/* MODAIS */
.field { margin-bottom: 15px; }
.field label { display: block; font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 5px; }
.field-erro { display: block; font-size: 12px; color: #ef4444; margin-top: -8px; margin-bottom: 8px; }
.modal-desc { font-size: 13px; color: #64748b; margin-bottom: 16px; }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.btn-confirm { background: #ff8049 !important; border: none !important; }
.delete-confirm { text-align: center; padding: 10px; }
.warning-icon { font-size: 48px; color: #f59e0b; margin-bottom: 10px; }
.reactivate-icon { font-size: 48px; color: #22c55e; margin-bottom: 10px; }

/* AUDITORIA - TIMELINE */
.audit-timeline { display: flex; flex-direction: column; gap: 14px; }
.audit-record { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; }
.audit-record-header { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 10px; font-size: 12px; }
.audit-data { color: #475569; font-weight: 600; }
.audit-metodo { color: #64748b; font-size: 12px; background: #f1f5f9; padding: 2px 10px; border-radius: 999px; }
.audit-usuario-afetado { color: #64748b; margin-left: auto; }

/* DIFF */
.diff-list { display: flex; flex-direction: column; gap: 8px; }
.diff-item { display: flex; align-items: center; gap: 12px; font-size: 13px; padding: 6px 0; border-bottom: 1px dashed #e2e8f0; }
.diff-item:last-child { border-bottom: none; }
.diff-label { min-width: 130px; font-weight: 700; color: #334155; }
.diff-values { display: flex; align-items: center; gap: 8px; }
.diff-old { color: #ef4444; text-decoration: line-through; opacity: 0.8; }
.diff-arrow { font-size: 16px; color: #94a3b8; }
.diff-new { color: #16a34a; font-weight: 600; }
.diff-empty { font-size: 12px; color: #94a3b8; font-style: italic; }

/* STATES */
.state-container { display: flex; flex-direction: column; align-items: center; padding: 40px; gap: 10px; }
.empty-icon { font-size: 40px; color: #cbd5e1; }
.muted { color: #94a3b8; font-size: 14px; }
</style>