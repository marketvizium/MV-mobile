<template>
  <Teleport to="body">
    <div class="modal-overlay" v-if="modelValue" @click.self="fechar">
      <div class="modal-box modal-box-vendedores">

        <!-- Header -->
        <div class="modal-header">
          <span>
            <span class="material-symbols-outlined header-icon">group_add</span>
            Incluir vendedores na cotação
          </span>
          <button class="modal-close" @click="fechar">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Abas -->
        <div class="tabs-row">
          <button
            type="button"
            class="tab-btn"
            :class="{ active: abaAtiva === 'disponiveis' }"
            @click="abaAtiva = 'disponiveis'"
          >
            Disponíveis
            <span class="tab-badge">{{ vendedoresDisponiveis.length }}</span>
          </button>
          <button
            type="button"
            class="tab-btn"
            :class="{ active: abaAtiva === 'participantes' }"
            @click="abaAtiva = 'participantes'"
          >
            Já participantes
            <span class="tab-badge">{{ vendedoresParticipantes.length }}</span>
          </button>
        </div>

        <div class="modal-body modal-body-vendedores">

          <!-- ===================== ABA: DISPONÍVEIS (selecionáveis) ===================== -->
          <div v-show="abaAtiva === 'disponiveis'" class="aba-conteudo">

            <div class="vendedores-header">
              <div>
                <p class="section-title">Vendedores disponíveis</p>
                <p class="section-subtitle">
                  {{ selecionados.length }} de {{ listaFiltradaDisponiveis.length }} selecionado(s)
                </p>
              </div>

              <div class="vendedores-header-actions">
                <div class="search-box">
                  <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  <input
                    v-model="buscaDisponiveis"
                    class="search-input"
                    placeholder="Buscar por nome, empresa, CNPJ..."
                  />
                </div>

                <button
                  type="button"
                  class="btn-sel-todos"
                  :disabled="listaFiltradaDisponiveis.length === 0"
                  @click="toggleSelecionarTodos"
                >
                  {{ todosSelecionadosDisponiveis ? 'Desmarcar todos' : 'Selecionar todos' }}
                </button>
              </div>
            </div>

            <!-- Loading -->
            <div v-if="loadingDisponiveis" class="loading-vendedores">
              <span>Carregando vendedores...</span>
            </div>

            <!-- Lista paginada -->
            <div v-else class="vendedores-list">
              <div
                v-for="vendedor in paginadosDisponiveis"
                :key="vendedor.id_vendedor"
                class="vendedor-card"
                :class="{ selecionado: selecionados.includes(vendedor.id_vendedor) }"
                @click="toggleVendedor(vendedor.id_vendedor)"
              >
                <div class="check-circle" :class="{ checked: selecionados.includes(vendedor.id_vendedor) }">
                  <svg v-if="selecionados.includes(vendedor.id_vendedor)" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>

                <div class="vendedor-info">
                  <div class="vendedor-top">
                    <span class="vendedor-nome">{{ vendedor.nome }}</span>
                    <span class="vendedor-empresa">{{ vendedor.nome_empresa }}</span>
                  </div>
                  <div class="vendedor-bottom">
                    <span class="vendedor-cnpj">CNPJ: {{ formatarCNPJ(vendedor.cnpj) }}</span>
                    <span v-if="vendedor.cidade" class="vendedor-cidade">{{ vendedor.cidade }}{{ vendedor.estado ? ` / ${vendedor.estado}` : '' }}</span>
                  </div>
                </div>

                <div class="vendedor-taxa" :title="`Taxa de resposta: ${vendedor.taxa_resposta ?? 0}%`">
                  <span class="taxa-valor">{{ vendedor.taxa_resposta ?? 0 }}%</span>
                  <span class="taxa-label">resposta</span>
                </div>
              </div>

              <div v-if="listaFiltradaDisponiveis.length === 0" class="sem-vendedores">
                Nenhum vendedor disponível para incluir.
              </div>
            </div>

            <!-- Paginação -->
            <div v-if="totalPaginasDisponiveis > 1" class="paginacao">
              <button class="btn-pag" :disabled="paginaDisponiveis === 1" @click="paginaDisponiveis--">‹</button>
              <span class="pag-info">{{ paginaDisponiveis }} / {{ totalPaginasDisponiveis }}</span>
              <button class="btn-pag" :disabled="paginaDisponiveis === totalPaginasDisponiveis" @click="paginaDisponiveis++">›</button>
            </div>
          </div>

          <!-- ===================== ABA: JÁ PARTICIPANTES (somente leitura) ===================== -->
          <div v-show="abaAtiva === 'participantes'" class="aba-conteudo">

            <div class="vendedores-header">
              <div>
                <p class="section-title">Vendedores já participantes</p>
                <p class="section-subtitle">
                  {{ listaFiltradaParticipantes.length }} vendedor(es) nesta cotação
                </p>
              </div>

              <div class="vendedores-header-actions">
                <div class="search-box">
                  <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  <input
                    v-model="buscaParticipantes"
                    class="search-input"
                    placeholder="Buscar por nome, empresa, CNPJ..."
                  />
                </div>
              </div>
            </div>

            <!-- Loading -->
            <div v-if="loadingParticipantes" class="loading-vendedores">
              <span>Carregando vendedores...</span>
            </div>

            <!-- Lista paginada -->
            <div v-else class="vendedores-list">
              <div
                v-for="vendedor in paginadosParticipantes"
                :key="vendedor.id_vendedor"
                class="vendedor-card vendedor-card-readonly"
              >
                <div class="check-circle checked check-circle-fixo">
                  <span class="material-symbols-outlined participante-icon">task_alt</span>
                </div>

                <div class="vendedor-info">
                  <div class="vendedor-top">
                    <span class="vendedor-nome">{{ vendedor.nome }}</span>
                    <span class="vendedor-empresa">{{ vendedor.nome_empresa }}</span>
                  </div>
                  <div class="vendedor-bottom">
                    <span class="vendedor-cnpj">CNPJ: {{ formatarCNPJ(vendedor.cnpj) }}</span>
                    <span v-if="vendedor.cidade" class="vendedor-cidade">{{ vendedor.cidade }}{{ vendedor.estado ? ` / ${vendedor.estado}` : '' }}</span>
                  </div>
                </div>

                <span class="badge-participante">Participante</span>
              </div>

              <div v-if="listaFiltradaParticipantes.length === 0" class="sem-vendedores">
                Nenhum vendedor participante encontrado.
              </div>
            </div>

            <!-- Paginação -->
            <div v-if="totalPaginasParticipantes > 1" class="paginacao">
              <button class="btn-pag" :disabled="paginaParticipantes === 1" @click="paginaParticipantes--">‹</button>
              <span class="pag-info">{{ paginaParticipantes }} / {{ totalPaginasParticipantes }}</span>
              <button class="btn-pag" :disabled="paginaParticipantes === totalPaginasParticipantes" @click="paginaParticipantes++">›</button>
            </div>
          </div>

        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button class="action-btn btn-outline" :disabled="salvando" @click="fechar">Cancelar</button>
          <button
            class="action-btn btn-primary"
            :disabled="salvando || selecionados.length === 0"
            @click="incluirVendedores"
          >
            <span v-if="salvando">Incluindo...</span>
            <span v-else>Incluir{{ selecionados.length ? ` (${selecionados.length})` : '' }}</span>
          </button>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script>
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import exibeErro from '@/utils/ExibeErro'

const POR_PAGINA = 10

export default {
  name: 'ModalIncluirVendedores',

  props: {
    // Controla a exibição do modal (v-model)
    modelValue: {
      type: Boolean,
      required: true,
      default: false
    },
    // ID da cotação para a qual novos vendedores serão incluídos
    idCotacao: {
      type: [Number, String],
      required: true
    }
  },

  emits: ['update:modelValue', 'close', 'vendedores-incluidos'],

  data () {
    return {
      auth: null,

      abaAtiva: 'disponiveis', // 'disponiveis' | 'participantes'

      loadingParticipantes: false,
      loadingDisponiveis: false,
      salvando: false,

      vendedoresParticipantes: [],
      vendedoresDisponiveis: [],
      selecionados: [],

      buscaParticipantes: '',
      buscaDisponiveis: '',

      paginaParticipantes: 1,
      paginaDisponiveis: 1
    }
  },

  computed: {
    listaFiltradaParticipantes () {
      return this.filtrar(this.vendedoresParticipantes, this.buscaParticipantes)
    },

    listaFiltradaDisponiveis () {
      return this.filtrar(this.vendedoresDisponiveis, this.buscaDisponiveis)
    },

    totalPaginasParticipantes () {
      return Math.max(1, Math.ceil(this.listaFiltradaParticipantes.length / POR_PAGINA))
    },

    totalPaginasDisponiveis () {
      return Math.max(1, Math.ceil(this.listaFiltradaDisponiveis.length / POR_PAGINA))
    },

    paginadosParticipantes () {
      const inicio = (this.paginaParticipantes - 1) * POR_PAGINA
      return this.listaFiltradaParticipantes.slice(inicio, inicio + POR_PAGINA)
    },

    paginadosDisponiveis () {
      const inicio = (this.paginaDisponiveis - 1) * POR_PAGINA
      return this.listaFiltradaDisponiveis.slice(inicio, inicio + POR_PAGINA)
    },

    todosSelecionadosDisponiveis () {
      if (this.listaFiltradaDisponiveis.length === 0) return false
      return this.listaFiltradaDisponiveis.every(v => this.selecionados.includes(v.id_vendedor))
    }
  },

  watch: {
    // Sempre que o modal for aberto, recarrega os dados do zero
    modelValue (aberto) {
      if (aberto) {
        this.auth = useAuthStore()
        this.resetEstado()
        this.carregarVendedores()
      }
    },

    buscaParticipantes () {
      this.paginaParticipantes = 1
    },

    buscaDisponiveis () {
      this.paginaDisponiveis = 1
    }
  },

  methods: {
    fechar () {
      this.$emit('update:modelValue', false)
      this.$emit('close')
    },

    resetEstado () {
      this.abaAtiva = 'disponiveis'
      this.selecionados = []
      this.buscaParticipantes = ''
      this.buscaDisponiveis = ''
      this.paginaParticipantes = 1
      this.paginaDisponiveis = 1
    },

    filtrar (lista, termoBusca) {
      const termo = (termoBusca || '').toLowerCase().trim()
      if (!termo) return lista
      return lista.filter(v =>
        (v.nome || '').toLowerCase().includes(termo) ||
        (v.nome_empresa || '').toLowerCase().includes(termo) ||
        (v.cnpj || '').replace(/\D/g, '').includes(termo.replace(/\D/g, '')) ||
        (v.email || '').toLowerCase().includes(termo) ||
        (v.cidade || '').toLowerCase().includes(termo)
      )
    },

    formatarCNPJ (cnpj) {
      if (!cnpj) return '—'
      const s = cnpj.replace(/\D/g, '')
      if (s.length !== 14) return cnpj
      return s.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    },

    toggleVendedor (id) {
      const idx = this.selecionados.indexOf(id)
      if (idx === -1) {
        this.selecionados.push(id)
      } else {
        this.selecionados.splice(idx, 1)
      }
    },

    toggleSelecionarTodos () {
      if (this.todosSelecionadosDisponiveis) {
        const idsFiltrados = this.listaFiltradaDisponiveis.map(v => v.id_vendedor)
        this.selecionados = this.selecionados.filter(id => !idsFiltrados.includes(id))
      } else {
        this.listaFiltradaDisponiveis.forEach(v => {
          if (!this.selecionados.includes(v.id_vendedor)) {
            this.selecionados.push(v.id_vendedor)
          }
        })
      }
    },

    // Carrega as duas listas em paralelo: participantes e disponíveis
    async carregarVendedores () {
      await Promise.all([
        this.consultarVendedores(true),
        this.consultarVendedores(false)
      ])
    },

    async consultarVendedores (somenteParticipantes) {

      //this.vendedoresParticipantes=[]
      //this.vendedoresDisponiveis=[]


      if (somenteParticipantes) {
        this.loadingParticipantes = true
      } else {
        this.loadingDisponiveis = true
      }

      try {
        const res = await api.get(
          `/mvpu/usuario/consultarVendedores/${this.auth.loja.id_loja}`,
          {
            headers:{
              idcotacao: this.idCotacao,
              Somenteparticipantes: somenteParticipantes
            }
          }
        )

        const lista = res.data.data || res.data || []

        if (somenteParticipantes) {
          this.vendedoresParticipantes = lista
        } else {

          let vendedorEstaParticipando = false

          lista.forEach(vendedorPartOuNaoParticipando=>{

            vendedorEstaParticipando=false

            this.vendedoresParticipantes.forEach((vendedorParticipando)=>{
                if(vendedorPartOuNaoParticipando.id_vendedor==vendedorParticipando.id_vendedor){
                  vendedorEstaParticipando = true
                }
            })

            if(!vendedorEstaParticipando && vendedorPartOuNaoParticipando.nome_empresa!=null){
              this.vendedoresDisponiveis.push(vendedorPartOuNaoParticipando)    
            }
          })

        }
      } catch (e) {
        exibeErro(e, this.$toast)
      } finally {
        if (somenteParticipantes) {
          this.loadingParticipantes = false
        } else {
          this.loadingDisponiveis = false
        }
      }
    },

    async incluirVendedores () {
      if (this.selecionados.length === 0) return

      this.salvando = true
      try {
        // ATENÇÃO: a rota de inclusão de vendedores na cotação não foi
        // especificada. Ajuste o endpoint/payload abaixo conforme a API real.
        await api.post(
          `/mvpu/cotacao/incluirVendedores/${this.auth.loja.id_loja}`,
          {
            id_cotacao: this.idCotacao,
            arrayVendedores: this.selecionados
          }
        )

        this.$toast.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: this.selecionados.length === 1
            ? 'Vendedor incluído na cotação com sucesso!'
            : 'Vendedores incluídos na cotação com sucesso!',
          life: 4000
        })

        this.$emit('vendedores-incluidos', [...this.selecionados])

        this.selecionados = []
        this.abaAtiva = 'participantes'

        // Recarrega as duas listas para refletir a mudança
        await this.carregarVendedores()
      } catch (e) {
        exibeErro(e, this.$toast)
      } finally {
        this.salvando = false
      }
    }
  }
}
</script>

<style scoped>
/* ===== Overlay ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 16px;
  font-family: 'Poppins';
}

.modal-box-vendedores {
  background: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 720px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
}

/* ===== Header ===== */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #eeeeee;
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  flex-shrink: 0;
}

.modal-header span {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-icon {
  color: #FF8049;
  font-size: 22px;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  transition: background 0.2s ease;
}

.modal-close:hover {
  background: #f5f5f5;
}

/* ===== Abas ===== */
.tabs-row {
  display: flex;
  gap: 4px;
  padding: 10px 24px 0;
  border-bottom: 1px solid #eeeeee;
  flex-shrink: 0;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  border: none;
  background: transparent;
  padding: 10px 14px;
  font-family: 'Poppins', sans-serif;
  font-size: 13.5px;
  font-weight: 600;
  color: #888;
  cursor: pointer;
  border-bottom: 2.5px solid transparent;
  transition: color 0.2s ease, border-color 0.2s ease;
}

.tab-btn:hover {
  color: #FF8049;
}

.tab-btn.active {
  color: #FF8049;
  border-bottom-color: #FF8049;
}

.tab-badge {
  background: #f0f0f0;
  color: #666;
  font-size: 11.5px;
  font-weight: 700;
  border-radius: 999px;
  padding: 1px 8px;
  min-width: 20px;
  text-align: center;
}

.tab-btn.active .tab-badge {
  background: #FFE7DA;
  color: #B84F1F;
}

/* ===== Corpo do modal, com scroll interno ===== */
.modal-body-vendedores {
  padding: 18px 24px;
  overflow: hidden;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.aba-conteudo {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

/* ===== Cabeçalho da seção de vendedores ===== */
.vendedores-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 14px;
  flex-shrink: 0;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #222;
  margin: 0;
  font-family: 'Poppins', sans-serif;
}

.section-subtitle {
  font-size: 12px;
  color: #999;
  margin: 2px 0 0;
  font-family: 'Poppins', sans-serif;
}

.vendedores-header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

/* Search */
.search-box {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 0 12px;
  height: 38px;
  min-width: 220px;
}

.search-icon {
  color: #aaa;
  flex-shrink: 0;
  margin-right: 8px;
}

.search-input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 13px;
  font-family: 'Poppins', sans-serif;
  color: #333;
  width: 100%;
}

.search-input::placeholder {
  color: #bbb;
}

/* Botão selecionar todos */
.btn-sel-todos {
  height: 38px;
  padding: 0 16px;
  border-radius: 8px;
  border: 1px solid #FF8049;
  color: #FF8049;
  background: transparent;
  font-size: 13px;
  font-family: 'Poppins', sans-serif;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s, color 0.2s;
}

.btn-sel-todos:hover:not(:disabled) {
  background: #FF8049;
  color: #fff;
}

.btn-sel-todos:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Lista */
.vendedores-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  padding-right: 2px;
}

/* Card vendedor */
.vendedor-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  border-radius: 10px;
  border: 1.5px solid #eee;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  user-select: none;
}

.vendedor-card:hover {
  border-color: #FF8049;
  background: #fff8f5;
}

.vendedor-card.selecionado {
  border-color: #FF8049;
  background: #fff3ee;
}

.vendedor-card-readonly {
  cursor: default;
}

.vendedor-card-readonly:hover {
  border-color: #eee;
  background: #fff;
}

/* Check circle */
.check-circle {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid #ddd;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s, background 0.2s;
}

.check-circle.checked {
  border-color: #FF8049;
  background: #FF8049;
}

.check-circle-fixo {
  border-color: #2E7D32;
  background: #2E7D32;
}

.participante-icon {
  font-size: 14px;
  color: #fff;
}

/* Info */
.vendedor-info {
  flex: 1;
  min-width: 0;
}

.vendedor-top {
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;
}

.vendedor-nome {
  font-size: 14px;
  font-weight: 600;
  color: #222;
  font-family: 'Poppins', sans-serif;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.vendedor-empresa {
  font-size: 13px;
  font-weight: 600;
  color: #FF8049;
  font-family: 'Poppins', sans-serif;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.vendedor-bottom {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 3px;
}

.vendedor-cnpj {
  font-size: 12px;
  color: #777;
  font-family: 'Poppins', sans-serif;
}

.vendedor-cidade {
  font-size: 12px;
  color: #aaa;
  font-family: 'Poppins', sans-serif;
}

/* Taxa */
.vendedor-taxa {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.taxa-valor {
  font-size: 15px;
  font-weight: 700;
  color: #333;
  font-family: 'Poppins', sans-serif;
  line-height: 1;
}

.taxa-label {
  font-size: 10px;
  color: #aaa;
  font-family: 'Poppins', sans-serif;
  margin-top: 2px;
}

/* Badge participante (aba somente leitura) */
.badge-participante {
  flex-shrink: 0;
  background: #E8F5E9;
  color: #2E7D32;
  font-size: 11.5px;
  font-weight: 700;
  font-family: 'Poppins', sans-serif;
  padding: 4px 10px;
  border-radius: 20px;
}

/* Loading / sem resultados */
.loading-vendedores,
.sem-vendedores {
  text-align: center;
  color: #aaa;
  font-size: 14px;
  font-family: 'Poppins', sans-serif;
  padding: 32px 0;
}

/* Paginação */
.paginacao {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 12px 0 4px;
  flex-shrink: 0;
}

.btn-pag {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background: #fff;
  font-size: 18px;
  cursor: pointer;
  color: #555;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s, color 0.2s;
  line-height: 1;
}

.btn-pag:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.btn-pag:not(:disabled):hover {
  border-color: #FF8049;
  color: #FF8049;
}

.pag-info {
  font-size: 13px;
  color: #666;
  font-family: 'Poppins', sans-serif;
  min-width: 50px;
  text-align: center;
}

/* ===== Footer ===== */
.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #eeeeee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-shrink: 0;
}

.action-btn {
  border-radius: 10px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: background 0.2s ease, opacity 0.2s ease;
  font-family: 'Poppins', sans-serif;
}

.btn-outline {
  background: transparent;
  border: 1px solid #cccccc;
  color: #1a1a1a;
}

.btn-outline:hover:not(:disabled) {
  background: #f5f5f5;
}

.btn-outline:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #FF8049;
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: #ce673b;
}

.btn-primary:disabled {
  background: #ffb894;
  cursor: not-allowed;
}

/* ===== Responsivo: telas abaixo de 450px ===== */
@media (max-width: 450px) {
  .modal-header {
    padding: 16px 18px;
    font-size: 15px;
  }

  .header-icon {
    font-size: 19px;
  }

  .modal-close {
    width: 30px;
    height: 30px;
  }

  .modal-close .material-symbols-outlined {
    font-size: 18px;
  }

  .tabs-row {
    padding: 8px 14px 0;
  }

  .tab-btn {
    padding: 8px 10px;
    font-size: 12px;
  }

  .modal-body-vendedores {
    padding: 14px 16px;
  }

  .vendedores-header-actions {
    width: 100%;
  }

  .search-box {
    min-width: 0;
    flex: 1;
  }

  .vendedor-card {
    padding: 10px 12px;
    gap: 10px;
  }

  .vendedor-nome {
    font-size: 13px;
  }

  .vendedor-empresa {
    font-size: 12px;
  }

  .vendedor-cnpj,
  .vendedor-cidade {
    font-size: 11px;
  }

  .taxa-valor {
    font-size: 13px;
  }

  .badge-participante {
    font-size: 10.5px;
    padding: 3px 8px;
  }

  .modal-footer {
    padding: 12px 16px;
  }

  .action-btn {
    padding: 8px 14px;
    font-size: 12.5px;
  }
}
</style>