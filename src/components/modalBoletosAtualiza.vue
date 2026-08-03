<template>
  <Teleport to="body">
    <Transition name="backdrop">
      <div v-if="modelValue" class="modal-backdrop" @click.self="close">
        <Transition name="modal-slide">
          <div v-if="modelValue" class="modal-shell">

            <!-- HEADER -->
            <div class="modal-head">
              <div class="head-left">
                <button v-if="modoEdicao" class="back-btn" @click="voltarParaLista" aria-label="Voltar">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                </button>
                <div class="head-icon" :class="{ editing: modoEdicao }">
                  <svg v-if="!modoEdicao" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <rect x="3" y="5" width="18" height="14" rx="2"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                    <line x1="7" y1="15" x2="11" y2="15"/>
                  </svg>
                  <svg v-else width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </div>
                <div>
                  <h2 class="head-title">
                    {{ modoEdicao ? 'Editar parcelamento' : 'Boletos cadastrados' }}
                  </h2>
                  <p class="head-sub">
                    {{ modoEdicao
                      ? `Boleto #${boletoEmEdicao?.id_cotacao} · ${boletoEmEdicao?.quantidade_boletos}x`
                      : `${boletos.length} registro${boletos.length !== 1 ? 's' : ''} encontrado${boletos.length !== 1 ? 's' : ''}`
                    }}
                  </p>
                </div>
              </div>
              <div class="head-actions">
                <button class="icon-btn close-btn" @click="close" aria-label="Fechar">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- BODY -->
            <div class="modal-body">

              <!-- LOADING -->
              <div v-if="carregando" class="state-box">
                <div class="spinner"></div>
                <p>Consultando boletos...</p>
              </div>

              <!-- ERRO -->
              <div v-else-if="erroCarregamento" class="state-box">
                <div class="state-icon error">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="13"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </div>
                <p>Não foi possível consultar os boletos.</p>
                <span>{{ erroCarregamento }}</span>
                <button class="retry-btn" @click="carregarBoletos">Tentar novamente</button>
              </div>

              <!-- LISTA VAZIA -->
              <div v-else-if="!modoEdicao && boletos.length === 0" class="state-box">
                <div class="state-icon empty">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <rect x="3" y="5" width="18" height="14" rx="2"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                    <line x1="7" y1="15" x2="11" y2="15"/>
                  </svg>
                </div>
                <p>Nenhum boleto cadastrado</p>
                <span>Não há parcelamentos registrados para esta cotação.</span>
              </div>

              <!-- LISTA DE BOLETOS -->
              <div v-else-if="!modoEdicao" class="lista-boletos">
                <TransitionGroup name="card-item" tag="div" class="cards-wrapper">
                  <div
                    v-for="boleto in boletos"
                    :key="boleto.id_cotacao + '-' + boleto.id_vendedor"
                    class="boleto-card"
                  >
                    <!-- Topo do card -->
                    <div class="card-top">
                      <div class="card-meta">
                        <span class="card-badge">
                          {{ boleto.quantidade_boletos }}x
                        </span>
                        <div class="card-info">
                          <span class="card-title">
                            {{ boleto.quantidade_boletos === 1 ? 'Boleto único' : `${boleto.quantidade_boletos} boletos` }}
                          </span>
                          <span class="card-date">Registrado {{ formatarData(boleto.registrado_em) }}</span>
                        </div>
                      </div>
                      <button class="edit-btn" @click="iniciarEdicao(boleto)" aria-label="Editar boleto">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Editar
                      </button>
                    </div>

                    <!-- Prazos em chips -->
                    <div class="card-prazos">
                      <div
                        v-for="(dias, idx) in parsearPrazos(boleto.prazo)"
                        :key="idx"
                        class="prazo-chip"
                      >
                        <span class="chip-ord">{{ idx + 1 }}º</span>
                        <span class="chip-dias">{{ dias }}d</span>
                      </div>
                      <div class="prazo-chip summary">
                        <span class="chip-label">Total</span>
                        <span class="chip-dias">{{ calcularTotal(boleto.prazo) }}d</span>
                      </div>
                    </div>

                    <!-- Preview legível -->
                    <p class="card-preview">{{ gerarPreview(boleto.quantidade_boletos, boleto.prazo) }}</p>
                  </div>
                </TransitionGroup>
              </div>

              <!-- MODO EDIÇÃO -->
              <div v-else class="content-grid">

                <!-- ESQUERDA: QUANTIDADE -->
                <div class="col-quantidade">
                  <span class="col-label">Quantidade de boletos</span>
                  <p class="col-help">Em quantas parcelas o varejista vai pagar.</p>

                  <div class="qty-list">
                    <button
                      v-for="n in 6"
                      :key="n"
                      type="button"
                      :class="['qty-pill', { active: quantidadeBoletos === n }]"
                      @click="selecionarQuantidade(n)"
                    >
                      <span class="qty-number">{{ n }}</span>
                      <span class="qty-text">{{ n === 1 ? 'único' : 'boletos' }}</span>
                    </button>
                  </div>
                </div>

                <!-- DIVISOR -->
                <div class="col-divider" aria-hidden="true"></div>

                <!-- DIREITA: PRAZOS -->
                <div class="col-prazos">
                  <span class="col-label">Vencimento de cada boleto</span>
                  <p class="col-help">Dias corridos a partir da emissão do pedido.</p>

                  <TransitionGroup name="prazo-item" tag="div" class="prazo-list">
                    <div
                      v-for="(item, idx) in prazos"
                      :key="item.id"
                      class="prazo-row"
                    >
                      <span class="prazo-badge">{{ idx + 1 }}º</span>
                      <div class="prazo-field">
                        <input
                          :id="`prazo-${item.id}`"
                          v-model.number="item.dias"
                          type="number"
                          min="1"
                          step="1"
                          inputmode="numeric"
                          class="prazo-input"
                          :class="{ 'has-error': erroPorIndice[idx] }"
                          placeholder="0"
                          @input="onInputPrazo(idx)"
                        />
                        <span class="prazo-suffix">dias</span>
                      </div>
                    </div>
                  </TransitionGroup>

                  <p v-if="mensagemErroGeral" class="form-error">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="13"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {{ mensagemErroGeral }}
                  </p>

                  <!-- PREVIEW -->
                  <div v-if="previewTexto" class="preview-box">
                    <span class="preview-label">Resumo</span>
                    <p class="preview-text">{{ previewTexto }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- FOOTER -->
            <div class="modal-foot">
              <template v-if="modoEdicao">
                <button class="foot-btn ghost" type="button" @click="voltarParaLista" :disabled="salvando">
                  Cancelar
                </button>
                <span class="foot-spacer"></span>
                <button
                  class="foot-btn primary"
                  type="button"
                  :disabled="salvando"
                  @click="salvar"
                >
                  <span v-if="salvando" class="btn-spinner"></span>
                  {{ salvando ? 'Salvando...' : 'Salvar alterações' }}
                </button>
              </template>
              <template v-else>
                <span class="foot-info" v-if="!carregando && !erroCarregamento">
                  Clique em <strong>Editar</strong> para alterar um boleto
                </span>
                <span class="foot-spacer"></span>
                <button class="foot-btn ghost" type="button" @click="close">Fechar</button>
              </template>
            </div>

          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { api } from '@/services/api'
import { ref, reactive, computed, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import exibeErro from '@/utils/ExibeErro'

const toast = useToast()

// ── PROPS / EMITS ─────────────────────────────────────────────────────
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  idLoja:     { type: [String, Number], required: true },
  idCotacao:  { type: [String, Number], required: true },
  idVendedor: { type: [String, Number], default: null },
})

const emit = defineEmits(['update:modelValue', 'salvo', 'erro'])
const close = () => emit('update:modelValue', false)

// ── ESTADO ────────────────────────────────────────────────────────────
const carregando        = ref(false)
const salvando          = ref(false)
const erroCarregamento  = ref('')
const boletos           = ref([])
const modoEdicao        = ref(false)
const boletoEmEdicao    = ref(null)

// Campos do formulário de edição
const quantidadeBoletos = ref(1)
let proximoIdCampo = 1
const prazos            = reactive([{ id: proximoIdCampo++, dias: null }])
const cacheValores      = new Map()
const erroPorIndice     = ref([])
const mensagemErroGeral = ref('')

// ── HELPERS ───────────────────────────────────────────────────────────
function parsearPrazos(prazoString) {
  return String(prazoString || '')
    .split('/')
    .map(v => v.trim())
    .filter(Boolean)
    .map(Number)
}

function calcularTotal(prazoString) {
  const dias = parsearPrazos(prazoString)
  return dias.length ? Math.max(...dias) : 0
}

function gerarPreview(qtd, prazoString) {
  const dias = parsearPrazos(prazoString)
  if (!dias.length) return ''
  if (dias.length === 1) return `Pagamento em boleto único com vencimento em ${dias[0]} dias.`
  const partes = dias.map((v, i) => `${i + 1}º em ${v} dias`)
  return `Parcelado em ${qtd} boletos: ${partes.join(', ')}.`
}

function formatarData(timestamp) {
  if (!timestamp) return '—'
  const ms = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp
  if (isNaN(ms)) return '—'
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(new Date(ms))
}

function ordinal(n) { return `${n}º` }

// ── CAMPOS DE PRAZO ───────────────────────────────────────────────────
function montarCampos(qtd) {
  prazos.forEach((p, idx) => cacheValores.set(idx, p.dias))
  prazos.splice(0, prazos.length)
  for (let i = 0; i < qtd; i++) {
    prazos.push({ id: proximoIdCampo++, dias: cacheValores.get(i) ?? null })
  }
  limparErros()
}

function selecionarQuantidade(n) {
  quantidadeBoletos.value = n
}

watch(quantidadeBoletos, (novaQtd) => {
  montarCampos(novaQtd)
})

function onInputPrazo(idx) {
  cacheValores.set(idx, prazos[idx].dias)
  if (erroPorIndice.value[idx]) {
    erroPorIndice.value[idx] = false
    mensagemErroGeral.value = ''
  }
}

function limparErros() {
  erroPorIndice.value = prazos.map(() => false)
  mensagemErroGeral.value = ''
}

// ── PREVIEW ───────────────────────────────────────────────────────────
const previewTexto = computed(() => {
  const valores = prazos.map(p => p.dias)
  if (valores.some(v => v === null || v === '' || v === undefined || Number.isNaN(v))) return ''
  if (valores.length === 1) return `Pagamento em boleto único, com vencimento em ${valores[0]} dias.`
  const partes = valores.map((v, i) => `${ordinal(i + 1)} em ${v} dias`)
  return `Parcelado em ${valores.length} boletos: ${partes.join(', ')}.`
})

// ── VALIDAÇÃO ─────────────────────────────────────────────────────────
function validar() {
  limparErros()
  const erros = prazos.map(() => false)
  let mensagem = ''

  prazos.forEach((p, idx) => {
    const valor = p.dias
    if (valor === null || valor === '' || valor === undefined || Number.isNaN(Number(valor))) {
      erros[idx] = true
      mensagem = 'Preencha o prazo de todos os boletos.'
    } else if (Number(valor) <= 0 || !Number.isInteger(Number(valor))) {
      erros[idx] = true
      mensagem = 'O prazo deve ser um número inteiro maior que zero.'
    }
  })

  if (!mensagem) {
    for (let i = 1; i < prazos.length; i++) {
      if (Number(prazos[i].dias) <= Number(prazos[i - 1].dias)) {
        erros[i] = true
        erros[i - 1] = true
        mensagem = `O prazo do ${ordinal(i + 1)} boleto deve ser maior que o do ${ordinal(i)}.`
        break
      }
    }
  }

  erroPorIndice.value = erros
  mensagemErroGeral.value = mensagem
  return !mensagem
}

function formatarPrazoParaEnvio() {
  return prazos.map(p => Number(p.dias)).join('/')
}

// ── MODO EDIÇÃO ───────────────────────────────────────────────────────
function iniciarEdicao(boleto) {
  boletoEmEdicao.value = boleto
  modoEdicao.value = true

  // Limpa cache e repopula com os dados do boleto selecionado
  cacheValores.clear()
  const dias = parsearPrazos(boleto.prazo)
  const qtd  = boleto.quantidade_boletos || dias.length || 1

  // Popula cache antes de setar quantidade (o watch vai chamar montarCampos)
  dias.forEach((v, i) => cacheValores.set(i, v))

  // Desativa o watch temporariamente setando direto
  prazos.splice(0, prazos.length)
  for (let i = 0; i < qtd; i++) {
    prazos.push({ id: proximoIdCampo++, dias: cacheValores.get(i) ?? null })
  }
  quantidadeBoletos.value = qtd
  limparErros()
}

function voltarParaLista() {
  modoEdicao.value = false
  boletoEmEdicao.value = null
  cacheValores.clear()
  limparErros()
}

// ── URL ───────────────────────────────────────────────────────────────
function montarUrl() {
  return `/mvpu/cotacao/operacoesBoleto/${props.idLoja}/${props.idCotacao}`
}

function extrairMensagemErro(e, fallback) {
  return (
    e?.response?.data?.message ||
    e?.response?.data?.erro   ||
    e?.response?.data?.error  ||
    e?.response?.data?.msg    ||
    e?.message                ||
    fallback
  )
}

// ── API: CARREGAR ─────────────────────────────────────────────────────
async function carregarBoletos() {
  carregando.value      = true
  erroCarregamento.value = ''
  boletos.value         = []

  try {
    const { data } = await api.get(montarUrl())
    // Suporta { COD, MSG, data: [...] } e array direto
    boletos.value = Array.isArray(data) ? data : (data?.data ?? [])
  } catch (e) {
    if (e?.response?.status === 404) {
      boletos.value = []
      return
    }
    erroCarregamento.value = extrairMensagemErro(e, 'Erro inesperado ao consultar os boletos.')
    exibeErro(e, toast)
  } finally {
    carregando.value = false
  }
}

// ── API: SALVAR ───────────────────────────────────────────────────────
async function salvar() {
  if (!validar()) {
    toast.add({ severity: 'info', summary: 'Dados inválidos', detail: mensagemErroGeral.value, life: 3000 })
    return
  }

  salvando.value        = true
  mensagemErroGeral.value = ''

  const payload = {
    quantidade_boletos: quantidadeBoletos.value,
    prazo:              formatarPrazoParaEnvio(),
    registrado_em:      Date.now(),
  }

  try {
    const { data } = await api.put(montarUrl(), payload)

    // Atualiza o item na lista local para refletir imediatamente
    const idx = boletos.value.findIndex(
      b => b.id_cotacao === boletoEmEdicao.value.id_cotacao &&
           b.id_vendedor === boletoEmEdicao.value.id_vendedor
    )
    if (idx !== -1) {
      boletos.value[idx] = { ...boletos.value[idx], ...payload }
    }

    toast.add({
      severity: 'success',
      summary:  'Boleto atualizado',
      detail:   'O parcelamento foi atualizado com sucesso.',
      life:     3000,
    })

    emit('salvo', { ...payload, resposta: data })
    voltarParaLista()

  } catch (e) {
    mensagemErroGeral.value = extrairMensagemErro(e, 'Erro inesperado ao salvar o boleto.')
    exibeErro(e, toast)
    emit('erro', e)
  } finally {
    salvando.value = false
  }
}

// ── CICLO DE VIDA ─────────────────────────────────────────────────────
watch(() => props.modelValue, (aberto) => {
  if (aberto) {
    modoEdicao.value = false
    boletoEmEdicao.value = null
    carregarBoletos()
  }
}, { immediate: true })
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=JetBrains+Mono:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* ── BACKDROP ───────────────────────────────────────── */
.modal-backdrop {
  position: fixed; inset: 0;
  background: rgba(100,116,139,0.35);
  backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999;
  font-family: 'DM Sans', sans-serif;
  padding: 16px;
}

/* ── SHELL ──────────────────────────────────────────── */
.modal-shell {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  width: 640px;
  max-width: calc(100vw - 32px);
  max-height: 90vh;
  display: flex; flex-direction: column;
  overflow: hidden;
  box-shadow:
    0 0 0 1px rgba(0,0,0,0.03),
    0 32px 80px rgba(15,23,42,0.14),
    0 8px 24px rgba(15,23,42,0.08);
}

/* ── HEADER ─────────────────────────────────────────── */
.modal-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 20px 16px;
  border-bottom: 1px solid #f1f5f9;
  background: linear-gradient(135deg, rgba(255,128,73,0.04) 0%, transparent 60%);
  flex-shrink: 0;
}
.head-left { display: flex; align-items: center; gap: 10px; }

.back-btn {
  width: 32px; height: 32px; border-radius: 8px;
  border: 1px solid #e2e8f0; background: #f8fafc;
  color: #64748b; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s; flex-shrink: 0;
}
.back-btn:hover { background: #f1f5f9; color: #334155; border-color: #cbd5e1; }

.head-icon {
  width: 40px; height: 40px; border-radius: 12px;
  background: rgba(255,128,73,0.1);
  border: 1px solid rgba(255,128,73,0.22);
  display: flex; align-items: center; justify-content: center;
  color: #ff8049; flex-shrink: 0;
  transition: background 0.2s, border-color 0.2s;
}
.head-icon.editing {
  background: rgba(99,102,241,0.1);
  border-color: rgba(99,102,241,0.25);
  color: #6366f1;
}

.head-title { font-size: 1rem; font-weight: 600; color: #0f172a; letter-spacing: -0.01em; }
.head-sub   { font-size: 0.72rem; color: #94a3b8; margin-top: 1px; }
.head-actions { display: flex; gap: 6px; }

.icon-btn {
  width: 32px; height: 32px; border-radius: 8px;
  border: 1px solid #e2e8f0; background: #f8fafc;
  color: #94a3b8; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.icon-btn:hover { background: #f1f5f9; color: #334155; border-color: #cbd5e1; }

/* ── BODY ───────────────────────────────────────────── */
.modal-body {
  flex: 1; overflow-y: auto;
  padding: 20px;
  scrollbar-width: thin; scrollbar-color: #e2e8f0 transparent;
}
.modal-body::-webkit-scrollbar { width: 4px; }
.modal-body::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 2px; }

/* ── STATE BOX ───────────────────────────────────────── */
.state-box {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 48px 24px; gap: 8px; text-align: center;
}
.state-box p    { font-size: 0.88rem; color: #334155; font-weight: 500; }
.state-box span { font-size: 0.78rem; color: #94a3b8; }

.spinner {
  width: 26px; height: 26px; border-radius: 50%;
  border: 3px solid #f1f5f9; border-top-color: #ff8049;
  animation: spin 0.7s linear infinite;
  margin-bottom: 6px;
}

.state-icon {
  width: 44px; height: 44px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 4px;
}
.state-icon.error { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); color: #ef4444; }
.state-icon.empty { background: rgba(100,116,139,0.08); border: 1px solid #e2e8f0; color: #94a3b8; }

.retry-btn {
  margin-top: 10px; font-family: 'DM Sans', sans-serif;
  font-size: 0.78rem; font-weight: 600; padding: 7px 16px; border-radius: 9px;
  border: 1px solid #e2e8f0; background: #fff; color: #475569;
  cursor: pointer; transition: all 0.15s;
}
.retry-btn:hover { background: #f1f5f9; border-color: #cbd5e1; }

@keyframes spin { to { transform: rotate(360deg); } }

/* ── LISTA DE BOLETOS ────────────────────────────────── */
.cards-wrapper { display: flex; flex-direction: column; gap: 10px; }

.boleto-card {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 14px 16px;
  background: #fafafa;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.boleto-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 2px 12px rgba(15,23,42,0.06);
}

.card-top {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 12px;
}
.card-meta { display: flex; align-items: center; gap: 10px; }

.card-badge {
  width: 38px; height: 38px; border-radius: 10px;
  background: rgba(255,128,73,0.1);
  border: 1px solid rgba(255,128,73,0.22);
  color: #ff8049;
  font-size: 0.85rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.card-title { display: block; font-size: 0.88rem; font-weight: 600; color: #0f172a; }
.card-date  { display: block; font-size: 0.71rem; color: #94a3b8; margin-top: 1px; }

.edit-btn {
  display: flex; align-items: center; gap: 5px;
  padding: 6px 12px; border-radius: 8px;
  border: 1px solid #e2e8f0; background: #fff;
  color: #475569; font-family: 'DM Sans', sans-serif;
  font-size: 0.76rem; font-weight: 600;
  cursor: pointer; transition: all 0.15s;
  flex-shrink: 0;
}
.edit-btn:hover {
  background: rgba(99,102,241,0.06);
  border-color: rgba(99,102,241,0.3);
  color: #6366f1;
}
.edit-btn svg { flex-shrink: 0; }

/* Chips de prazo */
.card-prazos {
  display: flex; flex-wrap: wrap; gap: 6px;
  margin-bottom: 10px;
}
.prazo-chip {
  display: flex; align-items: center; gap: 4px;
  padding: 4px 9px; border-radius: 20px;
  background: #fff; border: 1px solid #e2e8f0;
}
.prazo-chip.summary {
  background: rgba(255,128,73,0.06);
  border-color: rgba(255,128,73,0.2);
}
.chip-ord   { font-size: 0.68rem; color: #94a3b8; font-weight: 600; }
.chip-dias  { font-size: 0.76rem; color: #334155; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
.chip-label { font-size: 0.68rem; color: #ff8049; font-weight: 600; }

.card-preview {
  font-size: 0.76rem; color: #64748b; line-height: 1.45;
  padding-top: 10px;
  border-top: 1px solid #f1f5f9;
}

/* ── MODO EDIÇÃO — GRID ──────────────────────────────── */
.content-grid {
  display: grid;
  grid-template-columns: 190px 1px 1fr;
  gap: 20px;
  align-items: start;
}
.col-divider { background: #f1f5f9; align-self: stretch; }

.col-label {
  display: block; font-size: 0.78rem; font-weight: 600; color: #0f172a; margin-bottom: 3px;
}
.col-help {
  font-size: 0.72rem; color: #94a3b8; line-height: 1.4; margin-bottom: 14px;
}

/* QUANTIDADE */
.qty-list { display: flex; flex-direction: column; gap: 6px; }
.qty-pill {
  display: flex; align-items: baseline; gap: 7px;
  padding: 9px 12px; border-radius: 10px;
  border: 1px solid #e2e8f0; background: #f8fafc;
  color: #64748b; cursor: pointer;
  font-family: 'DM Sans', sans-serif; text-align: left;
  transition: all 0.15s; width: 100%;
}
.qty-pill:hover   { border-color: #cbd5e1; background: #f1f5f9; color: #334155; }
.qty-pill.active  {
  background: rgba(255,128,73,0.08);
  border-color: rgba(255,128,73,0.4);
  color: #ff8049;
  box-shadow: 0 0 0 1px rgba(255,128,73,0.12);
}
.qty-number { font-size: 0.95rem; font-weight: 700; }
.qty-text   { font-size: 0.74rem; font-weight: 500; }

/* PRAZOS */
.col-prazos   { min-width: 0; }
.prazo-list   { display: flex; flex-direction: column; gap: 8px; }
.prazo-row    { display: flex; align-items: center; gap: 10px; }

.prazo-badge {
  flex-shrink: 0; width: 30px; height: 30px; border-radius: 8px;
  background: rgba(99,102,241,0.08);
  border: 1px solid rgba(99,102,241,0.2);
  color: #6366f1;
  font-size: 0.72rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}

.prazo-field  { position: relative; flex: 1; display: flex; align-items: center; }
.prazo-input {
  width: 100%; background: #f8fafc;
  border: 1px solid #e2e8f0; border-radius: 10px;
  padding: 9px 56px 9px 12px;
  color: #0f172a;
  font-family: 'JetBrains Mono', monospace; font-size: 0.88rem;
  outline: none;
  transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
  -moz-appearance: textfield;
}
.prazo-input::-webkit-outer-spin-button,
.prazo-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.prazo-input::placeholder { color: #cbd5e1; }
.prazo-input:focus {
  border-color: rgba(99,102,241,0.5); background: #fff;
  box-shadow: 0 0 0 3px rgba(99,102,241,0.08);
}
.prazo-input.has-error { border-color: rgba(239,68,68,0.5); background: rgba(239,68,68,0.03); }
.prazo-input.has-error:focus { box-shadow: 0 0 0 3px rgba(239,68,68,0.08); }

.prazo-suffix {
  position: absolute; right: 12px;
  font-size: 0.72rem; color: #94a3b8; font-weight: 500;
  pointer-events: none;
}

.form-error {
  display: flex; align-items: center; gap: 6px;
  font-size: 0.76rem; color: #ef4444; font-weight: 500;
  margin-top: 10px;
}

/* PREVIEW */
.preview-box {
  margin-top: 14px; padding: 12px 14px;
  border-radius: 12px; background: #fafafa; border: 1px solid #f1f5f9;
}
.preview-label {
  font-size: 0.62rem; font-weight: 700; color: #94a3b8;
  text-transform: uppercase; letter-spacing: 0.5px;
}
.preview-text { font-size: 0.8rem; color: #334155; line-height: 1.5; margin-top: 4px; }

/* ── FOOTER ─────────────────────────────────────────── */
.modal-foot {
  padding: 14px 20px; border-top: 1px solid #f1f5f9; background: #fafafa;
  display: flex; align-items: center; gap: 10px; flex-shrink: 0;
}
.foot-info    { font-size: 0.72rem; color: #94a3b8; }
.foot-info strong { color: #475569; }
.foot-spacer  { flex: 1; }

.foot-btn {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.82rem; font-weight: 600;
  padding: 9px 18px; border-radius: 10px;
  border: none; cursor: pointer;
  display: flex; align-items: center; gap: 7px;
  transition: all 0.15s;
}
.foot-btn.ghost   { background: #fff; color: #64748b; border: 1px solid #e2e8f0; }
.foot-btn.ghost:hover:not(:disabled) { background: #f1f5f9; color: #334155; border-color: #cbd5e1; }
.foot-btn.primary { background: #6366f1; color: #fff; }
.foot-btn.primary:hover:not(:disabled) { filter: brightness(1.08); }
.foot-btn:disabled { opacity: 0.55; cursor: not-allowed; }

.btn-spinner {
  width: 13px; height: 13px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff;
  animation: spin 0.7s linear infinite;
}

/* ── TRANSITIONS ─────────────────────────────────────── */
.backdrop-enter-active, .backdrop-leave-active { transition: opacity 0.25s ease; }
.backdrop-enter-from, .backdrop-leave-to { opacity: 0; }

.modal-slide-enter-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.modal-slide-leave-active { transition: all 0.2s ease; }
.modal-slide-enter-from { opacity: 0; transform: scale(0.94) translateY(16px); }
.modal-slide-leave-to   { opacity: 0; transform: scale(0.97) translateY(8px); }

.prazo-item-enter-active, .prazo-item-leave-active { transition: all 0.18s ease; }
.prazo-item-enter-from, .prazo-item-leave-to { opacity: 0; transform: translateY(-6px); }
.prazo-item-move { transition: transform 0.18s ease; }

.card-item-enter-active { transition: all 0.2s ease; }
.card-item-enter-from   { opacity: 0; transform: translateY(8px); }

/* ── RESPONSIVO ───────────────────────────────────────── */
@media (max-width: 640px) {
  .modal-backdrop { padding: 0; align-items: flex-end; }
  .modal-shell {
    width: 100%; max-width: 100%; max-height: 94vh;
    border-radius: 20px 20px 0 0;
  }
  .modal-slide-enter-from { transform: translateY(100%); }
  .modal-slide-leave-to   { transform: translateY(100%); }

  .content-grid { grid-template-columns: 1fr; gap: 18px; }
  .col-divider  { height: 1px; width: 100%; }

  .qty-list { flex-direction: row; flex-wrap: wrap; }
  .qty-pill { width: auto; flex: 1 1 auto; justify-content: center; min-width: 64px; }

  .modal-foot { flex-wrap: wrap; }
  .foot-info  { order: 3; width: 100%; text-align: center; margin-top: 4px; }
  .foot-btn   { flex: 1; justify-content: center; }
}

@media (max-width: 380px) {
  .qty-list { flex-direction: column; }
  .qty-pill { flex: none; }
}
</style>