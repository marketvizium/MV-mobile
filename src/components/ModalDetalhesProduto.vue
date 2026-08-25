<template>
  <Teleport to="body">
    <div class="modal-overlay" v-if="modelValue" @click.self="fechar">
      <div class="modal-box modal-box-detalhes">
        <div class="modal-header">
          <span>
            <span class="material-symbols-outlined header-icon">inventory_2</span>
            Detalhes do produto
          </span>
          <button class="modal-close" @click="fechar">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="modal-body modal-body-detalhes" v-if="produto">

          <!-- Título do produto em destaque -->
          <div class="produto-titulo-card">
            <div class="produto-titulo-icon">
              <span class="material-symbols-outlined">shopping_bag</span>
            </div>
            <div class="produto-titulo-info">
              <h3>{{ produto.nome || 'Produto sem nome' }}</h3>
              <span class="produto-codigo">
                <span class="material-symbols-outlined mini-icon">barcode</span>
                {{ produto.codigo_barra || 'Sem código de barras' }}
              </span>
            </div>
          </div>

          <!-- Seção: Dados do produto -->
          <div class="secao-detalhes">
            <div class="secao-titulo">
              <span class="material-symbols-outlined">sell</span>
              Dados do produto
            </div>
            <div class="grid-detalhes">
              <div class="detalhe-item">
                <span class="material-symbols-outlined detalhe-icon">tag</span>
                <div class="detalhe-texto">
                  <span class="detalhe-label">ID do produto</span>
                  <span class="detalhe-valor">{{ produto.id_produto ?? '—' }}</span>
                </div>
              </div>
              <div class="detalhe-item">
                <span class="material-symbols-outlined detalhe-icon">category</span>
                <div class="detalhe-texto">
                  <span class="detalhe-label">Categoria</span>
                  <span class="detalhe-valor">{{ produto.categoria || '—' }}</span>
                </div>
              </div>
              <div class="detalhe-item">
                <span class="material-symbols-outlined detalhe-icon">style</span>
                <div class="detalhe-texto">
                  <span class="detalhe-label">Tipo</span>
                  <span class="detalhe-valor">{{ produto.tipo || '—' }}</span>
                </div>
              </div>
              <div class="detalhe-item">
                <span class="material-symbols-outlined detalhe-icon">payments</span>
                <div class="detalhe-texto">
                  <span class="detalhe-label">Preço de custo</span>
                  <span class="detalhe-valor">{{ formatarMoeda(produto.preco_custo) }}</span>
                </div>
              </div>
              <div class="detalhe-item">
                <span class="material-symbols-outlined detalhe-icon">sell</span>
                <div class="detalhe-texto">
                  <span class="detalhe-label">Preço de venda</span>
                  <span class="detalhe-valor">{{ formatarMoeda(produto.preco_venda) }}</span>
                </div>
              </div>
              <div class="detalhe-item">
                <span class="material-symbols-outlined detalhe-icon">percent</span>
                <div class="detalhe-texto">
                  <span class="detalhe-label">Margem</span>
                  <span class="detalhe-valor">{{ formatarPercentual(produto.margem) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Seção: Dados da solicitação -->
          <div class="secao-detalhes">
            <div class="secao-titulo">
              <span class="material-symbols-outlined">request_quote</span>
              Dados da solicitação
            </div>
            <div class="grid-detalhes">
              <div class="detalhe-item">
                <span class="material-symbols-outlined detalhe-icon">confirmation_number</span>
                <div class="detalhe-texto">
                  <span class="detalhe-label">ID solicitado</span>
                  <span class="detalhe-valor">{{ produto.id_solicitado ?? '—' }}</span>
                </div>
              </div>
              <div class="detalhe-item">
                <span class="material-symbols-outlined detalhe-icon">description</span>
                <div class="detalhe-texto">
                  <span class="detalhe-label">ID cotação</span>
                  <span class="detalhe-valor">{{ produto.id_cotacao ?? '—' }}</span>
                </div>
              </div>
              <div class="detalhe-item">
                <span class="material-symbols-outlined detalhe-icon">inventory</span>
                <div class="detalhe-texto">
                  <span class="detalhe-label">Quantidade</span>
                  <span class="detalhe-valor">{{ produto.quantidade ?? '—' }}</span>
                </div>
              </div>
              <div class="detalhe-item">
                <span class="material-symbols-outlined detalhe-icon">layers</span>
                <div class="detalhe-texto">
                  <span class="detalhe-label">Qtd. unitária composição</span>
                  <span class="detalhe-valor">{{ produto.qtd_unitaria_composicao ?? '—' }}</span>
                </div>
              </div>
              <div class="detalhe-item">
                <span class="material-symbols-outlined detalhe-icon">event</span>
                <div class="detalhe-texto">
                  <span class="detalhe-label">Adicionado em</span>
                  <span class="detalhe-valor">{{ formatarData(produto.adicionado_em) }}</span>
                </div>
              </div>
              <div class="detalhe-item">
                <span class="material-symbols-outlined detalhe-icon">task_alt</span>
                <div class="detalhe-texto">
                  <span class="detalhe-label">Resultado do fechamento</span>
                  <span class="detalhe-valor">{{ produto.resultado_fechamento || 'Pendente' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Seção: Usuário -->
          <div class="secao-detalhes">
            <div class="secao-titulo">
              <span class="material-symbols-outlined">person</span>
              Usuário responsável
            </div>
            <div class="grid-detalhes">
              <div class="detalhe-item">
                <span class="material-symbols-outlined detalhe-icon">badge</span>
                <div class="detalhe-texto">
                  <span class="detalhe-label">Nome</span>
                  <span class="detalhe-valor">{{ produto.nome_usuario || '—' }}</span>
                </div>
              </div>
              <div class="detalhe-item">
                <span class="material-symbols-outlined detalhe-icon">mail</span>
                <div class="detalhe-texto">
                  <span class="detalhe-label">E-mail</span>
                  <span class="detalhe-valor detalhe-valor-quebra">{{ produto.email || '—' }}</span>
                </div>
              </div>
              <div class="detalhe-item">
                <span class="material-symbols-outlined detalhe-icon">fingerprint</span>
                <div class="detalhe-texto">
                  <span class="detalhe-label">ID usuário</span>
                  <span class="detalhe-valor">{{ produto.id_usuario ?? '—' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Seção: Última compra (destaque) -->
          <div class="secao-detalhes secao-destaque">
            <div class="secao-titulo">
              <span class="material-symbols-outlined">history</span>
              Última compra
            </div>
            <div class="grid-detalhes">
              <div class="detalhe-item">
                <span class="material-symbols-outlined detalhe-icon">storefront</span>
                <div class="detalhe-texto">
                  <span class="detalhe-label">Origem</span>
                  <span class="detalhe-valor">
                    <span class="badge-origem" :class="produto.origem_ultima_compra === 'cotacao' ? 'badge-cotacao' : 'badge-pedido'">
                      {{ origemFormatada(produto.origem_ultima_compra) }}
                    </span>
                  </span>
                </div>
              </div>
              <div class="detalhe-item">
                <span class="material-symbols-outlined detalhe-icon">calendar_month</span>
                <div class="detalhe-texto">
                  <span class="detalhe-label">Data da última compra</span>
                  <span class="detalhe-valor">{{ formatarData(produto.data_ultima_compra) }}</span>
                </div>
              </div>
              <div class="detalhe-item">
                <span class="material-symbols-outlined detalhe-icon">attach_money</span>
                <div class="detalhe-texto">
                  <span class="detalhe-label">Último preço</span>
                  <span class="detalhe-valor">{{ formatarMoeda(produto.ultimo_preco) }}</span>
                </div>
              </div>
              <div class="detalhe-item">
                <span class="material-symbols-outlined detalhe-icon">production_quantity_limits</span>
                <div class="detalhe-texto">
                  <span class="detalhe-label">Última quantidade</span>
                  <span class="detalhe-valor">{{ produto.ultima_quantidade ?? '—' }}</span>
                </div>
              </div>
              <div class="detalhe-item">
                <span class="material-symbols-outlined detalhe-icon">category</span>
                <div class="detalhe-texto">
                  <span class="detalhe-label">Último tipo</span>
                  <span class="detalhe-valor">{{ produto.ultimo_tipo || '—' }}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div class="modal-footer">
          <button class="action-btn btn-outline" @click="fechar">Fechar</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
export default {
  name: 'ModalDetalhesProduto',

  props: {
    // Controla a exibição do modal (v-model)
    modelValue: {
      type: Boolean,
      required: true,
      default: false
    },
    // Objeto com todos os dados do produto/solicitação a serem exibidos
    produto: {
      type: Object,
      default: null
    }
  },

  emits: ['update:modelValue', 'close'],

  methods: {
    fechar () {
      this.$emit('update:modelValue', false)
      this.$emit('close')
    },

    formatarMoeda (valor) {
      if (valor === null || valor === undefined || valor === '') return '—'
      const num = Number(valor)
      if (Number.isNaN(num)) return '—'
      return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    },

    formatarPercentual (valor) {
      if (valor === null || valor === undefined || valor === '') return '—'
      const num = Number(valor)
      if (Number.isNaN(num)) return '—'
      return `${num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`
    },

    formatarData (valor) {
      if (!valor) return '—'
      const data = new Date(valor)
      if (Number.isNaN(data.getTime())) return '—'
      return data.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    origemFormatada (origem) {
      if (origem === 'cotacao') return 'Cotação'
      if (origem === 'pedido') return 'Pedido'
      return origem || '—'
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
}

.modal-box-detalhes {
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

/* ===== Corpo do modal, com scroll interno ===== */
.modal-body-detalhes {
  padding: 20px 24px;
  overflow-y: auto;
  flex: 1;
}

/* ===== Card de título do produto ===== */
.produto-titulo-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #FF8049;
  border-radius: 14px;
  padding: 16px 18px;
  margin-bottom: 22px;
}

.produto-titulo-icon {
  width: 48px;
  height: 48px;
  min-width: 48px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
}

.produto-titulo-icon .material-symbols-outlined {
  font-size: 26px;
  color: #ffffff;
}

.produto-titulo-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.produto-titulo-info h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: #ffffff;
  word-break: break-word;
}

.produto-codigo {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
}

.mini-icon {
  font-size: 16px;
}

/* ===== Seções ===== */
.secao-detalhes {
  margin-bottom: 22px;
}

.secao-detalhes:last-child {
  margin-bottom: 4px;
}

.secao-titulo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  color: #FF8049;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #FFE7DA;
}

.secao-titulo .material-symbols-outlined {
  font-size: 18px;
}

.secao-destaque {
  background: #FFF6F1;
  border: 1px solid #FFD9C4;
  border-radius: 14px;
  padding: 16px;
}

.secao-destaque .secao-titulo {
  border-bottom-color: #FFD9C4;
}

/* ===== Grid de itens ===== */
.grid-detalhes {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.detalhe-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: #fafafa;
  border-radius: 10px;
  padding: 10px 12px;
  min-width: 0;
}

.secao-destaque .detalhe-item {
  background: #ffffff;
}

.detalhe-icon {
  font-size: 20px;
  color: #FF8049;
  margin-top: 2px;
  flex-shrink: 0;
}

.detalhe-texto {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.detalhe-label {
  font-size: 12.5px;
  color: #777777;
  font-weight: 500;
}

.detalhe-valor {
  font-size: 15px;
  color: #1a1a1a;
  font-weight: 600;
  word-break: break-word;
}

.detalhe-valor-quebra {
  word-break: break-all;
}

/* ===== Badge de origem ===== */
.badge-origem {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
}

.badge-cotacao {
  background: #FFE7DA;
  color: #B84F1F;
}

.badge-pedido {
  background: #E8E8E8;
  color: #1a1a1a;
}

/* ===== Footer ===== */
.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #eeeeee;
  display: flex;
  justify-content: flex-end;
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
}

.btn-outline {
  background: transparent;
  border: 1px solid #cccccc;
  color: #1a1a1a;
}

.btn-outline:hover {
  background: #f5f5f5;
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

  .modal-body-detalhes {
    padding: 14px 16px;
  }

  .produto-titulo-card {
    gap: 10px;
    padding: 12px 14px;
    margin-bottom: 16px;
  }

  .produto-titulo-icon {
    width: 38px;
    height: 38px;
    min-width: 38px;
    border-radius: 10px;
  }

  .produto-titulo-icon .material-symbols-outlined {
    font-size: 20px;
  }

  .produto-titulo-info h3 {
    font-size: 14px;
  }

  .produto-codigo {
    font-size: 11px;
  }

  .mini-icon {
    font-size: 13px;
  }

  .secao-detalhes {
    margin-bottom: 16px;
  }

  .secao-titulo {
    font-size: 11.5px;
    gap: 6px;
    margin-bottom: 8px;
    padding-bottom: 6px;
  }

  .secao-titulo .material-symbols-outlined {
    font-size: 15px;
  }

  .secao-destaque {
    padding: 12px;
  }

  .grid-detalhes {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .detalhe-item {
    padding: 8px 10px;
    gap: 8px;
  }

  .detalhe-icon {
    font-size: 16px;
  }

  .detalhe-label {
    font-size: 10.5px;
  }

  .detalhe-valor {
    font-size: 12.5px;
  }

  .badge-origem {
    font-size: 11px;
    padding: 2px 8px;
  }

  .modal-footer {
    padding: 12px 16px;
  }

  .action-btn {
    padding: 8px 16px;
    font-size: 12.5px;
  }
}
</style>