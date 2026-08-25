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
            <span class="cotacao-name">Registrar Cotação</span>
          </div>
        </div>
      </div>
    </ion-header>

    <ion-content :fullscreen="true"  class="console-content">
      <div class="form-container" style="padding-bottom: 0;">

        <div style="overflow-y: scroll;">
          <div class="title-section" style="flex-shrink: 0;">
            <h2 class="poppins-semibold">Registrar Cotação</h2>
            <p class="poppins-regular muted">Crie uma nova cotação informando nome e período de validade.</p>
          </div>
  
          <div class="form-group margin-top-20" style="flex-shrink: 0;">
            <label class="form-label poppins-medium">Nome da cotação *</label>
            <input
              type="text"
              maxlength="27"
              placeholder="Ex: Cotação de Alimentos Nov/26"
              v-model="cotacao.nome_cotacao"
              class="form-input poppins-regular"
            />
          </div>
  
          <div class="form-row margin-top-20 calendar-section" style="flex-shrink: 0;">
            <div class="form-col">
              <label class="form-label poppins-medium">Início da cotação *</label>
              <div class="input-date-wrapper">
                <Calendar
                  v-model="inicioCotacaoDate"
                  showTime
                  hourFormat="24"
                  dateFormat="dd/mm/yy"
                  placeholder="Selecione data e hora"
                  class="w-full prime-calendar"
                  inputClass="form-input poppins-regular input-date w-full"
                />
              </div>
            </div>
  
            <div class="form-col">
              <label class="form-label poppins-medium">Final da cotação *</label>
              <div class="input-date-wrapper">
                <Calendar
                  v-model="fimCotacaoDate"
                  showTime
                  hourFormat="24"
                  dateFormat="dd/mm/yy"
                  placeholder="Selecione data e hora"
                  class="w-full prime-calendar"
                  inputClass="form-input poppins-regular input-date w-full"
                />
              </div>
            </div>
          </div>
  
          <!-- OBSERVAÇÃO -->
          <div class="form-group margin-top-20" style="flex-shrink: 0;">
            <div class="obs-header">
              <label class="form-label poppins-medium" style="margin-bottom: 0;">Observação (opcional)</label>
              <span class="obs-contador poppins-regular" :class="{ limite: (cotacao.observacao || '').length >= 255 }">
                {{ (cotacao.observacao || '').length }}/255
              </span>
            </div>
            <textarea
              v-model="cotacao.observacao"
              maxlength="255"
              rows="2"
              class="obs-textarea poppins-regular"
              placeholder="Deixe uma observação para os vendedores sobre esta cotação..."
            />
          </div>
  
          <!-- CONDIÇÃO DE PAGAMENTO (BOLETOS) -->
          <div class="form-group margin-top-20" style="flex-shrink: 0;">
            <label class="form-label poppins-medium">Condição de pagamento (opcional)</label>
            <button type="button" class="condicao-btn" @click="abrirModalBoletos">
              <div class="condicao-btn-info">
                <span class="material-symbols-outlined condicao-btn-icon">receipt_long</span>
                <span class="condicao-btn-texto poppins-regular" :class="{ vazio: !cotacao.prazo_boleto }">
                  {{ resumoCondicaoPagamento }}
                </span>
              </div>
              <span class="material-symbols-outlined condicao-btn-seta">chevron_right</span>
            </button>
          </div>
  
         
          <!-- SWITCH: Itens não respondidos -->
          <div class="form-group margin-top-20" style="flex-shrink: 0;">
            <div class="switch-wrapper" @click="adicionarItensNaoRespondidos = !adicionarItensNaoRespondidos">
              <div class="switch-track" :class="{ active: adicionarItensNaoRespondidos }">
                <div class="switch-thumb" :class="{ active: adicionarItensNaoRespondidos }" />
              </div>
              <span class="switch-label poppins-regular">
                Adicionar produtos não respondido na cotação anterior
              </span>
            </div>
          </div>
  
          <!-- SEÇÃO: Vendedores -->
          <div class="vendedores-section margin-top-20" style="flex: 1; min-height: 0; overflow: hidden; display: flex; flex-direction: column;">
            <div class="vendedores-header" style="flex-shrink: 0;">
              <div>
                <p class="section-title poppins-semibold">Vendedores participantes</p>
                <p class="section-subtitle poppins-regular">
                  {{ vendedoresSelecionados.length }} de {{ vendedoresFiltrados.length }} selecionado(s)
                </p>
              </div>
  
              <button class="btn-sel-todos poppins-medium" @click="toggleSelecionarTodos">
                {{ todosSelecionados ? 'Desmarcar todos' : 'Selecionar todos' }}
              </button>
            </div>
  
            <div class="search-box" style="flex-shrink: 0;">
              <span class="material-symbols-outlined search-icon">search</span>
              <input
                v-model="busca"
                class="search-input poppins-regular"
                placeholder="Buscar por nome, empresa, CNPJ..."
              />
            </div>
  
            <!-- Loading -->
            <div v-if="loadingVendedores" class="loading-vendedores poppins-regular">
              Carregando vendedores...
            </div>
  
            <!-- Lista -->
            <div v-else class="vendedores-list">
              <div
                v-for="vendedor in vendedoresPaginados"
                :key="vendedor.id_vendedor"
                class="vendedor-card"
                :class="{ selecionado: vendedoresSelecionados.includes(vendedor.id_vendedor) }"
                @click="toggleVendedor(vendedor.id_vendedor)"
              >
                <div class="check-circle" :class="{ checked: vendedoresSelecionados.includes(vendedor.id_vendedor) }">
                  <span v-if="vendedoresSelecionados.includes(vendedor.id_vendedor)" class="material-symbols-outlined check-icon">check</span>
                </div>
  
                <div class="vendedor-info">
                  <div class="vendedor-top">
                    <span class="vendedor-nome poppins-medium">{{ vendedor.nome }}</span>
                    <span class="vendedor-empresa poppins-medium">{{ vendedor.nome_empresa }}</span>
                  </div>
                  <div class="vendedor-bottom">
                    <span class="vendedor-cnpj poppins-regular">CNPJ: {{ formatarCNPJ(vendedor.cnpj) }}</span>
                    <span v-if="vendedor.cidade" class="vendedor-cidade poppins-regular">{{ vendedor.cidade }}{{ vendedor.estado ? ` / ${vendedor.estado}` : '' }}</span>
                  </div>
                </div>
  
                <div class="vendedor-taxa">
                  <span class="taxa-valor poppins-semibold">{{ vendedor.taxa_resposta ?? 0 }}%</span>
                  <span class="taxa-label poppins-regular">resposta</span>
                </div>
              </div>
  
              <div v-if="vendedoresFiltrados.length === 0" class="sem-vendedores poppins-regular">
                Nenhum vendedor encontrado.
              </div>
            </div>
  
            <!-- Paginação -->
            <div v-if="totalPaginas > 1" class="paginacao" style="flex-shrink: 0;">
              <button class="btn-pag" :disabled="paginaAtual === 1" @click="paginaAtual--">‹</button>
              <span class="pag-info poppins-regular">{{ paginaAtual }} / {{ totalPaginas }}</span>
              <button class="btn-pag" :disabled="paginaAtual === totalPaginas" @click="paginaAtual++">›</button>
            </div>
          </div>
        </div>

         <!-- MODAL: Condição de pagamento -->
        <Teleport to="body">
          <div v-if="modalBoletoAberto" class="boleto-modal-overlay" @click.self="fecharModalBoletos">
            <div class="boleto-modal">
              <div class="boleto-modal-header">
                <h3 class="poppins-semibold">Condição de pagamento</h3>
                <button type="button" class="boleto-modal-close" @click="fecharModalBoletos">
                  <span class="material-symbols-outlined">close</span>
                </button>
              </div>

              <div class="boleto-modal-body">
                <!-- Passo 1: quantidade de boletos -->
                <p class="boleto-step-title poppins-semibold">1. Quantos boletos?</p>
                <div class="qtd-boletos-group">
                  <button
                    v-for="qtd in [1, 2, 3]"
                    :key="qtd"
                    type="button"
                    class="qtd-boleto-btn poppins-semibold"
                    :class="{ active: qtdBoletosTemp === qtd }"
                    @click="selecionarQtdBoletos(qtd)"
                  >
                    {{ qtd }} {{ qtd === 1 ? 'boleto' : 'boletos' }}
                  </button>
                </div>

                <!-- Passo 2: prazo (combinação já pronta) -->
                <div v-if="qtdBoletosTemp">
                  <p class="boleto-step-title poppins-semibold">2. Selecione o prazo</p>
                  <div class="prazo-radio-list">
                    <div
                      v-for="opcao in opcoesPrazoAtual"
                      :key="opcao"
                      class="prazo-radio-item poppins-regular"
                      @click="selecionarPrazo(opcao)"
                    >
                      <span>{{ opcao }} dias</span>
                      <span class="radio-circle" :class="{ checked: prazoSelecionadoTemp === opcao }" />
                    </div>
                  </div>
                </div>
              </div>

              <div class="boleto-modal-footer">
                <p class="boleto-resumo poppins-semibold">{{ resumoModal }}</p>
                <div class="boleto-modal-actions">
                  <button type="button" class="boleto-btn-cancelar poppins-medium" @click="fecharModalBoletos">
                    Cancelar
                  </button>
                  <button
                    type="button"
                    class="boleto-btn-confirmar poppins-medium"
                    :disabled="!qtdBoletosTemp || !prazoSelecionadoTemp"
                    @click="confirmarCondicaoPagamento"
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Teleport>


        <div class="form-actions-row margin-top-30" style="flex-shrink: 0;">
          <button
            @click="limparTudo"
            class="action-btn btn-outline-gray poppins-medium full-w height-50"
            :disabled="loading"
          >
            Limpar tudo
          </button>

          <button
            @click="cadastrarCotacao"
            class="action-btn btn-primary poppins-medium full-w height-50"
            :disabled="loading || vendedoresSelecionados.length === 0"
          >
            <ion-spinner name="crescent" v-if="loading" class="spinner-button"></ion-spinner>
            <span v-else>Cadastrar cotação</span>
          </button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, Teleport } from 'vue'
import { 
  IonPage, 
  IonHeader,
  IonContent, 
  IonSpinner 
} from '@ionic/vue'
import Calendar from 'primevue/calendar'
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import exibeErro from '@/utils/ExibeErro'
import RefresherIonic from '@/components/refresherIonic.vue'

const POR_PAGINA = 10

export default defineComponent({
  name: 'RegistrarCotacaoMobile',
  
  components: {
    IonPage,
    IonHeader,
    IonContent,
    IonSpinner,
    Calendar,
    RefresherIonic
  },

  data() {
    return {
      loading: false,
      loadingVendedores: false,
      auth: null as any,
      cotacao: {
        nome_cotacao: null as string | null,
        observacao: '' as string,
        qtd_boletos: null as number | null,
        prazo_boleto: null as string | null
      },
      // Tipagem alterada para Date pois o PrimeVue retorna objetos Date
      inicioCotacaoDate: null as Date | null,
      fimCotacaoDate: null as Date | null,

      // Modal condição de pagamento (boletos)
      modalBoletoAberto: false,
      qtdBoletosTemp: null as number | null,
      prazoSelecionadoTemp: null as string | null,

      // Flag itens não respondidos
      adicionarItensNaoRespondidos: false,

      // Vendedores
      vendedores: [] as any[],
      vendedoresSelecionados: [] as number[],
      busca: '',
      paginaAtual: 1
    }
  },

  computed: {
    vendedoresFiltrados (): any[] {
      const termo = this.busca.toLowerCase().trim()
      if (!termo) return this.vendedores
      return this.vendedores.filter((v: any) =>
        (v.nome         || '').toLowerCase().includes(termo) ||
        (v.nome_empresa || '').toLowerCase().includes(termo) ||
        (v.cnpj         || '').replace(/\D/g, '').includes(termo.replace(/\D/g, '')) ||
        (v.email        || '').toLowerCase().includes(termo) ||
        (v.cidade       || '').toLowerCase().includes(termo)
      )
    },

    totalPaginas (): number {
      return Math.max(1, Math.ceil(this.vendedoresFiltrados.length / POR_PAGINA))
    },

    vendedoresPaginados (): any[] {
      const inicio = (this.paginaAtual - 1) * POR_PAGINA
      return this.vendedoresFiltrados.slice(inicio, inicio + POR_PAGINA)
    },

    todosSelecionados (): boolean {
      if (this.vendedoresFiltrados.length === 0) return false
      return this.vendedoresFiltrados.every((v: any) => this.vendedoresSelecionados.includes(v.id_vendedor))
    },

    // Bases de prazo (múltiplos de 7) usadas para montar as combinações, até ~80 dias
    basesPrazo (): number[] {
      const bases: number[] = []
      for (let dias = 7; dias <= 70; dias += 7) {
        bases.push(dias)
      }
      return bases
    },

    // Combinações prontas de prazo para a quantidade de boletos escolhida no modal
    // Ex.: 1 boleto → ['7', '14', '21', ...] | 2 boletos → ['7/14', '14/21', '21/28', ...]
    opcoesPrazoAtual (): string[] {
      if (!this.qtdBoletosTemp) return []
      return this.basesPrazo.map(base => {
        const combinacao: number[] = []
        for (let i = 0; i < (this.qtdBoletosTemp as number); i++) {
          combinacao.push(base + (i * 7))
        }
        return combinacao.join('/')
      })
    },

    // Texto exibido no botão da tela principal
    resumoCondicaoPagamento (): string {
      if (!this.cotacao.qtd_boletos || !this.cotacao.prazo_boleto) {
        return 'Selecionar condição de pagamento'
      }
      const qtd = this.cotacao.qtd_boletos
      const label = qtd === 1 ? 'boleto' : 'boletos'
      return `${qtd} ${label} • ${this.cotacao.prazo_boleto.split('/').join('/')} dias`
    },

    // Texto exibido no rodapé do modal enquanto o usuário seleciona
    resumoModal (): string {
      if (!this.qtdBoletosTemp) {
        return 'Selecione a quantidade de boletos para começar.'
      }
      if (!this.prazoSelecionadoTemp) {
        return 'Selecione o prazo desejado.'
      }
      const qtd = this.qtdBoletosTemp
      const label = qtd === 1 ? 'boleto' : 'boletos'
      const dias = this.prazoSelecionadoTemp.split('/').join(' e ')
      return `Condição de pagamento: ${qtd} ${label} — ${dias} dias`
    }
  },

  watch: {
    busca () {
      this.paginaAtual = 1
    }
  },

  methods: {
    limparTudo() {
      this.cotacao.nome_cotacao = null
      this.cotacao.observacao = ''
      this.cotacao.qtd_boletos = null
      this.cotacao.prazo_boleto = null
      this.inicioCotacaoDate = null
      this.fimCotacaoDate = null
      this.adicionarItensNaoRespondidos = false
      this.vendedoresSelecionados = []
      this.busca = ''
      this.paginaAtual = 1
      this.qtdBoletosTemp = null
      this.prazoSelecionadoTemp = null
    },

    abrirModalBoletos () {
      // Pré-carrega o modal com a condição já salva, se houver
      this.qtdBoletosTemp = this.cotacao.qtd_boletos || null
      this.prazoSelecionadoTemp = this.cotacao.prazo_boleto || null
      this.modalBoletoAberto = true
    },

    fecharModalBoletos () {
      this.modalBoletoAberto = false
    },

    selecionarQtdBoletos (qtd: number) {
      this.qtdBoletosTemp = qtd
      // Ao trocar a quantidade, a combinação anterior não é mais válida
      this.prazoSelecionadoTemp = null
    },

    selecionarPrazo (opcao: string) {
      this.prazoSelecionadoTemp = opcao
    },

    confirmarCondicaoPagamento () {
      if (!this.qtdBoletosTemp || !this.prazoSelecionadoTemp) return

      this.cotacao.qtd_boletos = this.qtdBoletosTemp
      this.cotacao.prazo_boleto = this.prazoSelecionadoTemp

      this.modalBoletoAberto = false
    },

    formatarCNPJ (cnpj: string): string {
      if (!cnpj) return '—'
      const s = cnpj.replace(/\D/g, '')
      if (s.length !== 14) return cnpj
      return s.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    },

    toggleVendedor (id: number) {
      const idx = this.vendedoresSelecionados.indexOf(id)
      if (idx === -1) {
        this.vendedoresSelecionados.push(id)
      } else {
        this.vendedoresSelecionados.splice(idx, 1)
      }
    },

    toggleSelecionarTodos () {
      if (this.todosSelecionados) {
        const idsFiltrados = this.vendedoresFiltrados.map((v: any) => v.id_vendedor)
        this.vendedoresSelecionados = this.vendedoresSelecionados.filter(id => !idsFiltrados.includes(id))
      } else {
        this.vendedoresFiltrados.forEach((v: any) => {
          if (!this.vendedoresSelecionados.includes(v.id_vendedor)) {
            this.vendedoresSelecionados.push(v.id_vendedor)
          }
        })
      }
    },

    async carregarVendedores () {
      this.loadingVendedores = true
      try {
        const res = await api.get(`/mvpu/usuario/consultarVendedores/${this.auth.loja.id_loja}`)
        this.vendedores = res.data.data || []
      } catch (e) {
        exibeErro(e, this.$toast)
      } finally {
        this.loadingVendedores = false
      }
    },

    async cadastrarCotacao() {
      if (!this.cotacao.nome_cotacao) {
        
        this.$toast.add({ 
            severity: 'info', 
            summary: 'Dados faltantes', 
            detail: 'Preencha o nome da cotação', 
            life: 3000 
            });

        return
      }
      if (!this.inicioCotacaoDate || !this.fimCotacaoDate) {
        
        this.$toast.add({ 
            severity: 'info', 
            summary: 'Dados faltantes', 
            detail: 'Preencha o período da cotação', 
            life: 3000 
            });

        return
      }

      if(this.inicioCotacaoDate.getTime() >= this.fimCotacaoDate.getTime() ){
        this.$toast.add({ 
            severity: 'info', 
            summary: 'Período inválido', 
            detail: 'O período final da cotação deve ser superior ao inicial', 
            life: 3000 
            });

        return
      }

      if (this.vendedoresSelecionados.length === 0) {
        this.$toast.add({
            severity: 'info',
            summary: 'Vendedores não selecionados',
            detail: 'Selecione ao menos um vendedor para criar a cotação',
            life: 3000
            });

        return
      }

      
      try {
        this.loading = true

        const CINCO_MINUTOS = 1000 * 60 * 5

      

        if( this.inicioCotacaoDate.getTime() - Date.now()  <  CINCO_MINUTOS){
          this.$toast.add({ 
            severity: 'info', 
            summary: 'Data inválida', 
            detail: 'O campo "Início da cotação" deve estar no mínimo há 5 minutos do horário atual', 
            life: 3000 
            });

            return
        }

        if( this.inicioCotacaoDate.getTime() > this.fimCotacaoDate.getTime() ){
          this.$toast.add({ 
            severity: 'info', 
            summary: 'Data inválida', 
            detail: 'A data final da cotação deve ser maior que a inicial', 
            life: 3000 
            });

            return
        }

        const payload = {
          nome_cotacao: this.cotacao.nome_cotacao,
          observacao: this.cotacao.observacao,
          qtd_boletos: this.cotacao.qtd_boletos,
          prazo_boleto: this.cotacao.prazo_boleto,
          // Agora podemos chamar o getTime() diretamente no objeto Date
          inicio_cotacao: this.inicioCotacaoDate.getTime(),
          final_cotacao: this.fimCotacaoDate.getTime(),
          adicionarItensNaoRespondidos: this.adicionarItensNaoRespondidos,
          arrayVendedores: this.vendedoresSelecionados
        }


        await api.post(
          `/mvpu/cotacao/criarCotacao/${this.auth.loja.id_loja}`,
          payload
        )

        if (this.$toast) {
          this.$toast.add({ 
            severity: 'success', 
            summary: 'Cotação criada', 
            detail: 'Cotação registrada com sucesso', 
            life: 3000 
            });
        }
        
        this.limparTudo()
        this.$router.back()

      } catch (e) {
        exibeErro(e, this.$toast)
      } finally {
        this.loading = false
      }
    }
  },

  mounted() {
    this.auth = useAuthStore()
    this.carregarVendedores()
  }
})
</script>

<style scoped>
/* === CONTAINER & ESTRUTURA BASE (CORES FIXAS DARK) === */
.console-page {
  --background: #FFF !important;
  background-color: #FFF !important;
  overflow-y: scroll;
}

.console-content {
  --background: #FFF !important;
  background-color: #FFF !important;
  color: #000;

}

.form-container {
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  background-color: #FFF;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
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

/* === FORMULÁRIOS & CAMPOS MOBILE === */
.form-group {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.form-row {
  display: flex;
  gap: 12px;
  width: 100%;
}

.form-col {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: 13px;
  color: #555 !important;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-input {
  background-color: #f0f0f0 !important;
  border: 1px solid rgb(177, 177, 177) !important;
  color: #000 !important;
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 15px;
  outline: none;
  width: 100%;
  height: 48px;
  box-sizing: border-box;
  transition: border-color 0.3s ease;
}

.form-input:focus {
  border-color: #FF8049 !important;
}

@media(max-width: 576px){
    .calendar-section{
        display: flex;
        flex-direction: column;
    }
}

/* Forçar cor do placeholder no padrão dark */
.form-input::placeholder {
  color: #474747 !important;
}

.input-date {
  color: #525252 !important;
}

.input-date-wrapper {
  position: relative;
  width: 100%;
}

/* === PRIME VUE OVERRIDES === */
.w-full {
  width: 100%;
}

.prime-calendar {
  width: 100%;
}
:deep(.prime-calendar){
  background-color: #FFF !important;
}

/* Evitar que o PrimeVue crie bordas duplas já que aplicamos o form-input direto no inputClass */
:deep(.p-calendar) {
  width: 100%;
}

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

/* === OBSERVAÇÃO === */
.obs-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.obs-contador {
  font-size: 11px;
  color: #888 !important;
}

.obs-contador.limite {
  color: #e05353 !important;
}

.obs-textarea {
  width: 100%;
  background-color: #f0f0f0 !important;
  border: 1px solid rgb(177, 177, 177) !important;
  color: #000 !important;
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 15px;
  outline: none;
  box-sizing: border-box;
  resize: none;
  transition: border-color 0.3s ease;
}

.obs-textarea:focus {
  border-color: #FF8049 !important;
}

.obs-textarea::placeholder {
  color: #474747 !important;
}

/* === CONDIÇÃO DE PAGAMENTO (BOTÃO) === */
.condicao-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f0f0f0 !important;
  border: 1px solid rgb(177, 177, 177) !important;
  border-radius: 10px;
  padding: 12px 14px;
  height: 48px;
  box-sizing: border-box;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.condicao-btn:active {
  border-color: #FF8049 !important;
}

.condicao-btn-info {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.condicao-btn-icon {
  color: #FF8049 !important;
  font-size: 20px;
  flex-shrink: 0;
}

.condicao-btn-texto {
  font-size: 15px;
  color: #000 !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.condicao-btn-texto.vazio {
  color: #474747 !important;
}

.condicao-btn-seta {
  color: #999 !important;
  font-size: 20px;
  flex-shrink: 0;
}

/* === MODAL BOLETOS === */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.boleto-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.boleto-modal {
  width: 100%;
  max-width: 420px;
  max-height: 85vh;
  background: #fff;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.boleto-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}

.boleto-modal-header h3 {
  margin: 0;
  font-size: 16px;
  color: #222 !important;
}

.boleto-modal-close {
  border: none;
  background: transparent;
  cursor: pointer;
  color: #999 !important;
  display: flex;
  align-items: center;
  padding: 4px;
}

.boleto-modal-close:active {
  color: #555 !important;
}

.boleto-modal-body {
  padding: 18px 20px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.boleto-step-title {
  font-size: 15px;
  color: #444 !important;
  margin: 0 0 10px;
}

.boleto-modal-body > div:not(:last-child) {
  margin-bottom: 22px;
}

/* Passo 1: quantidade de boletos */
.qtd-boletos-group {
  display: flex;
  gap: 8px;
}

.qtd-boleto-btn {
  flex: 1;
  padding: 10px 8px;
  border: 1.5px solid #ddd;
  border-radius: 8px;
  background: #fff;
  font-size: 15px;
  color: #555 !important;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s, color 0.2s;
}

.qtd-boleto-btn.active {
  border-color: #FF8049;
  background: #FF8049 !important;
  color: #fff !important;
}

/* Passo 2: lista de rádio de prazos */
.prazo-radio-list {
  border: 1px solid #eee;
  border-radius: 8px;
  max-height: 220px;
  overflow-y: auto;
}

.prazo-radio-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 1px solid #f2f2f2;
  cursor: pointer;
  font-size: 15px;
  color: #333 !important;
  transition: background 0.15s;
}

.prazo-radio-item:last-child {
  border-bottom: none;
}

.radio-circle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #ccc;
  flex-shrink: 0;
  position: relative;
  transition: border-color 0.2s;
}

.radio-circle.checked {
  border-color: #FF8049;
}

.radio-circle.checked::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #FF8049;
}

.boleto-modal-footer {
  padding: 14px 20px 18px;
  border-top: 1px solid #eee;
  flex-shrink: 0;
}

.boleto-resumo {
  font-size: 12.5px;
  color: #000 !important;
  margin: 0 0 12px;
  text-align: center;
}

.boleto-modal-actions {
  display: flex;
  gap: 10px;
}

.boleto-btn-cancelar {
  flex: 1;
  height: 42px;
  border-radius: 6px;
  border: 1px solid #ccc;
  background: #fff;
  color: #666 !important;
  font-size: 13px;
  cursor: pointer;
}

.boleto-btn-confirmar {
  flex: 2;
  height: 42px;
  border-radius: 6px;
  border: none;
  background: #FF8049 !important;
  color: #fff !important;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}

.boleto-btn-confirmar:disabled {
  background: #ffb894 !important;
  cursor: not-allowed;
}

/* === SWITCH === */
.switch-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  user-select: none;
}

.switch-track {
  width: 44px;
  height: 24px;
  border-radius: 999px;
  background-color: #ccc;
  position: relative;
  transition: background-color 0.25s;
  flex-shrink: 0;
}

.switch-track.active {
  background-color: #FF8049;
}

.switch-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  transition: left 0.25s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.switch-thumb.active {
  left: 23px;
}

.switch-label {
  font-size: 14px;
  color: #444 !important;
  line-height: 1.4;
}

/* === VENDEDORES SECTION === */
.vendedores-section {
  border-top: 1px solid #eee;
  padding-top: 16px;
}

.vendedores-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.section-title {
  font-size: 15px;
  color: #000 !important;
  margin: 0;
}

.section-subtitle {
  font-size: 12px;
  color: #888 !important;
  margin: 2px 0 0;
}

.btn-sel-todos {
  height: 36px;
  padding: 0 14px;
  border-radius: 8px;
  border: 1px solid #FF8049;
  color: #FF8049 !important;
  background: transparent;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}

.btn-sel-todos:active {
  background: #FF8049;
  color: #fff !important;
}

/* Search */
.search-box {
  display: flex;
  align-items: center;
  background-color: #f0f0f0;
  border: 1px solid rgb(177, 177, 177);
  border-radius: 10px;
  padding: 0 12px;
  height: 46px;
  margin-bottom: 12px;
}

.search-icon {
  color: #888;
  flex-shrink: 0;
  margin-right: 8px;
  font-size: 18px;
}

.search-input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  color: #000 !important;
  width: 100%;
  height: 100%;
}

.search-input::placeholder {
  color: #888 !important;
}

/* Lista */
.vendedores-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-height: 400px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.vendedor-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1.5px solid #eee;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}

.vendedor-card.selecionado {
  border-color: #FF8049;
  background: #fff3ee;
}

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

.check-icon {
  font-size: 14px;
  color: #fff !important;
}

.vendedor-info {
  flex: 1;
  min-width: 0;
}

.vendedor-top {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}

.vendedor-nome {
  font-size: 14px;
  color: #000 !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.vendedor-empresa {
  font-size: 12px;
  color: #FF8049 !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.vendedor-bottom {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 3px;
  flex-wrap: wrap;
}

.vendedor-cnpj {
  font-size: 11px;
  color: #777 !important;
}

.vendedor-cidade {
  font-size: 11px;
  color: #aaa !important;
}

.vendedor-taxa {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.taxa-valor {
  font-size: 14px;
  color: #333 !important;
  line-height: 1;
}

.taxa-label {
  font-size: 9px;
  color: #aaa !important;
  margin-top: 2px;
}

.loading-vendedores,
.sem-vendedores {
  text-align: center;
  color: #aaa !important;
  font-size: 14px;
  padding: 24px 0;
}

/* Paginação */
.paginacao {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 14px 0 4px;
}

.btn-pag {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background: #fff;
  font-size: 16px;
  cursor: pointer;
  color: #555;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.btn-pag:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.pag-info {
  font-size: 12px;
  color: #666 !important;
  min-width: 46px;
  text-align: center;
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

/* Força o wrapper do calendário e o input interno do PrimeVue a ocuparem 100% da largura */
:deep(.p-calendar),
:deep(.p-datepicker) { /* .p-datepicker caso esteja usando PrimeVue v4 */
  width: 100% !important;
  display: flex !important;
}

:deep(.p-calendar .p-inputtext),
:deep(.p-datepicker .p-inputtext) {
  width: 100% !important;
  flex: 1 1 auto !important;
}
</style>