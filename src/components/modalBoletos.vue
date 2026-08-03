<template>
  <Teleport to="body">
    <Transition name="backdrop">
      <div v-if="modelValue" class="modal-backdrop" @click.self="close">
        <Transition name="modal-slide">
          <div v-if="modelValue" class="modal-shell">

            <!-- HEADER -->
            <div class="modal-head">
              <div class="head-left">
                <div class="head-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <rect x="3" y="5" width="18" height="14" rx="2"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                    <line x1="7" y1="15" x2="11" y2="15"/>
                  </svg>
                </div>
                <div>
                  <h2 class="head-title">Forma de pagamento</h2>
                  <p class="head-sub">{{ existeRegistro ? 'Editar parcelamento em boletos' : 'Definir parcelamento em boletos' }}</p>
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
                <p>Consultando boleto cadastrado...</p>
              </div>

              <!-- ERRO -->
              <div v-else-if="erroCarregamento" class="state-box error">
                <div class="state-icon error">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="13"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </div>
                <p>Não foi possível consultar o boleto cadastrado.</p>
                <span>{{ erroCarregamento }}</span>
                <button class="retry-btn" @click="carregarOperacao">Tentar novamente</button>
              </div>

              <!-- CONTEÚDO -->
              <div v-else class="content-grid">

                <!-- LADO ESQUERDO: QUANTIDADE -->
                <div class="col-quantidade">
                  <span class="col-label">Quantidade de boletos</span>
                  <p class="col-help">Em quantas vezes o varejista vai pagar este pedido.</p>

                  <div class="qty-list">
                    <button
                      v-for="n in 6"
                      :key="n"
                      type="button"
                      :class="['qty-pill', { active: quantidadeBoletos === n }]"
                      @click="selecionarQuantidade(n)"
                    >
                      <span class="qty-number">{{ n }}</span>
                      <span class="qty-text">{{ n === 1 ? 'boleto único' : `boletos` }}</span>
                    </button>
                  </div>
                </div>

                <!-- DIVISOR -->
                <div class="col-divider" aria-hidden="true"></div>

                <!-- LADO DIREITO: PRAZOS -->
                <div class="col-prazos">
                  <span class="col-label">Prazo de cada boleto (dias)</span>
                  <p class="col-help">Informe em quantos dias cada boleto vence, a partir da emissão.</p>

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
              <span class="foot-info" v-if="!carregando && !erroCarregamento">
                {{ existeRegistro ? 'Atualizando registro existente' : 'Novo registro' }}
              </span>
              <span class="foot-spacer"></span>
              <button class="foot-btn ghost" type="button" @click="close" :disabled="salvando">Cancelar</button>
              <button
                class="foot-btn primary"
                type="button"
                :disabled="salvando || carregando || !!erroCarregamento"
                @click="salvar"
              >
                <span v-if="salvando" class="btn-spinner"></span>
                {{ salvando ? 'Salvando...' : 'Salvar' }}
              </button>
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
  idLoja: { type: [String, Number], required: true },
  idCotacao: { type: [String, Number], required: true },
  idVendedor: { type: [String, Number], default: null },
})

const emit = defineEmits(['update:modelValue', 'salvo', 'erro'])

const close = () => emit('update:modelValue', false)

// ── ESTADO BASE ───────────────────────────────────────────────────────
const carregando = ref(false)
const salvando = ref(false)
const erroCarregamento = ref('')
const existeRegistro = ref(false)
const registroOriginal = ref(null) // guarda o registro vindo do GET (id, registrado_em etc.)

const quantidadeBoletos = ref(1)
let proximoIdCampo = 1

// Cada item: { id, dias }. "id" é só uma chave estável para o v-for/transition,
// não tem relação com o backend.
const prazos = reactive([{ id: proximoIdCampo++, dias: null }])

// Guarda valores já digitados por posição, para não perder o que o vendedor
// preencheu caso ele aumente/diminua a quantidade de boletos durante a edição.
const cacheValores = new Map()

const erroPorIndice = ref([])
const mensagemErroGeral = ref('')

// ── MONTAGEM DOS CAMPOS DE PRAZO CONFORME QUANTIDADE ────────────────
function montarCampos(qtd) {
  // Salva os valores atuais no cache antes de remontar
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

// ── PREVIEW DO TEXTO RESUMO ──────────────────────────────────────────
const previewTexto = computed(() => {
  const valores = prazos.map(p => p.dias)
  if (valores.some(v => v === null || v === '' || v === undefined || Number.isNaN(v))) return ''

  if (valores.length === 1) {
    return `Pagamento em boleto único, com vencimento em ${valores[0]} dias.`
  }
  const partes = valores.map((v, i) => `${ordinal(i + 1)} em ${v} dias`)
  return `Pagamento dividido em ${valores.length} boletos: ${partes.join(', ')}.`
})

function ordinal(n) {
  return `${n}º`
}

// ── VALIDAÇÃO ─────────────────────────────────────────────────────────
function validar() {
  limparErros()
  const erros = prazos.map(() => false)
  let mensagem = ''

  // Todos preenchidos e numéricos positivos
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

  // Ordem crescente
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

// ── FORMATAÇÃO DA STRING "prazo" ─────────────────────────────────────
// Envio: array de dias -> "14/18/25/36"
function formatarPrazoParaEnvio() {
  return prazos.map(p => Number(p.dias)).join('/')
}

// Recebimento: "14/18/25/36" -> popula os campos
function popularCamposComPrazo(quantidade, prazoString) {
  const dias = String(prazoString || '')
    .split('/')
    .map(v => v.trim())
    .filter(v => v.length > 0)
    .map(v => Number(v))

  const qtd = quantidade || dias.length || 1
  quantidadeBoletos.value = qtd

  // monta os campos respeitando a quantidade e injeta os valores recebidos
  prazos.splice(0, prazos.length)
  cacheValores.clear()
  for (let i = 0; i < qtd; i++) {
    const valor = Number.isFinite(dias[i]) ? dias[i] : null
    cacheValores.set(i, valor)
    prazos.push({ id: proximoIdCampo++, dias: valor })
  }
  limparErros()
}

// ── API ───────────────────────────────────────────────────────────────
function montarUrl() {
  return `/mvpu/cotacao/operacoesBoleto/${props.idLoja}/${props.idCotacao}`
}

// Extrai a mensagem de erro vinda do backend para exibição inline no formulário.
// Cobre os formatos mais comuns de retorno de erro da API (message, erro, error, msg).
function extrairMensagemErro(e, fallback) {
  return (
    e?.response?.data?.message ||
    e?.response?.data?.erro ||
    e?.response?.data?.error ||
    e?.response?.data?.msg ||
    e?.message ||
    fallback
  )
}

async function carregarOperacao() {
  carregando.value = true
  erroCarregamento.value = ''
  existeRegistro.value = false
  registroOriginal.value = null

  try {
    const { data } = await api.get(montarUrl())

    const registro = Array.isArray(data) ? data[0] : (data?.registro || data)

    if (registro.data.length) {
      emit('update:modelValue', false)
    }

    // ❌ REMOVER ESTA LINHA — está solta, sem corpo, e pode quebrar
    // antes de chegar na validação correta:
    // if(registro.data.length)

    if (!registro || !registro.prazo) {
      existeRegistro.value = false
      quantidadeBoletos.value = 1
      montarCampos(1)
      return
    }

    existeRegistro.value = true
    registroOriginal.value = registro
    popularCamposComPrazo(registro.quantidade_boletos, registro.prazo)

  } catch (e) {

    console.log(e)

    if (e?.response?.status === 404) {
      // Nenhum boleto cadastrado ainda: estado inicial padrão (1 boleto)
      existeRegistro.value = false
      quantidadeBoletos.value = 1
      montarCampos(1)
      return
    }

    erroCarregamento.value = extrairMensagemErro(e, 'Erro inesperado ao consultar o boleto.')
    exibeErro(e, toast)
  } finally {
    carregando.value = false
  }
}

async function salvar() {
  if (!validar()) {
    toast.add({
      severity: 'info',
      summary: 'Dados inválidos',
      detail: mensagemErroGeral.value,
      life: 3000,
    })
    return
  }

  salvando.value = true
  mensagemErroGeral.value = ''

  const payload = {
    quantidade_boletos: quantidadeBoletos.value,
    prazo: formatarPrazoParaEnvio(),
    registrado_em: Date.now(),
  }

  try {
    const { data } = existeRegistro.value
      ? await api.put(montarUrl(), payload)
      : await api.post(montarUrl(), payload)

    const jaExistia = existeRegistro.value
    existeRegistro.value = true

    toast.add({
      severity: 'success',
      summary: jaExistia ? 'Boleto atualizado' : 'Boleto cadastrado',
      detail: jaExistia
        ? 'O parcelamento foi atualizado com sucesso'
        : 'O parcelamento foi cadastrado com sucesso',
      life: 3000,
    })

    emit('salvo', { ...payload, resposta: data })
    close()

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
    carregarOperacao()
  }
}, { immediate: true })
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=JetBrains+Mono:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* ── BACKDROP ───────────────────────────────────────── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(100,116,139,0.35);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
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
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow:
    0 0 0 1px rgba(0,0,0,0.03),
    0 32px 80px rgba(15,23,42,0.14),
    0 8px 24px rgba(15,23,42,0.08);
  position: relative;
}

/* ── HEADER ─────────────────────────────────────────── */
.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 16px;
  border-bottom: 1px solid #f1f5f9;
  background: linear-gradient(135deg, rgba(255,128,73,0.04) 0%, transparent 60%);
  flex-shrink: 0;
}
.head-left { display: flex; align-items: center; gap: 12px; }
.head-icon {
  width: 40px; height: 40px; border-radius: 12px;
  background: rgba(255,128,73,0.1);
  border: 1px solid rgba(255,128,73,0.22);
  display: flex; align-items: center; justify-content: center;
  color: #ff8049;
  flex-shrink: 0;
}
.head-title { font-size: 1rem; font-weight: 600; color: #0f172a; letter-spacing: -0.01em; }
.head-sub { font-size: 0.72rem; color: #94a3b8; margin-top: 1px; }
.head-actions { display: flex; gap: 6px; }

.icon-btn {
  width: 32px; height: 32px; border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #94a3b8;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.icon-btn:hover { background: #f1f5f9; color: #475569; border-color: #cbd5e1; }
.icon-btn.close-btn:hover { background: #f1f5f9; color: #334155; }

/* ── BODY ───────────────────────────────────────────── */
.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 22px 20px;
  scrollbar-width: thin; scrollbar-color: #e2e8f0 transparent;
}
.modal-body::-webkit-scrollbar { width: 4px; }
.modal-body::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 2px; }

/* ── STATE BOX (loading / error) ─────────────────────── */
.state-box {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 48px 24px; gap: 8px; text-align: center;
}
.state-box p { font-size: 0.88rem; color: #334155; font-weight: 500; }
.state-box span { font-size: 0.78rem; color: #94a3b8; }
.spinner {
  width: 26px; height: 26px; border-radius: 50%;
  border: 3px solid #f1f5f9; border-top-color: #ff8049;
  animation: spin 0.7s linear infinite;
  margin-bottom: 6px;
}
.state-icon.error {
  width: 44px; height: 44px; border-radius: 50%;
  background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
  color: #ef4444;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 4px;
}
.retry-btn {
  margin-top: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.78rem; font-weight: 600;
  padding: 7px 16px; border-radius: 9px;
  border: 1px solid #e2e8f0; background: #fff; color: #475569;
  cursor: pointer; transition: all 0.15s;
}
.retry-btn:hover { background: #f1f5f9; border-color: #cbd5e1; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── CONTENT GRID ─────────────────────────────────────── */
.content-grid {
  display: grid;
  grid-template-columns: 200px 1px 1fr;
  gap: 22px;
  align-items: start;
}
.col-divider {
  background: #f1f5f9;
  align-self: stretch;
}
.col-label {
  display: block;
  font-size: 0.78rem; font-weight: 600; color: #0f172a;
  margin-bottom: 3px;
}
.col-help {
  font-size: 0.72rem; color: #94a3b8; line-height: 1.4;
  margin-bottom: 14px;
}

/* ── QUANTIDADE (esquerda) ────────────────────────────── */
.qty-list { display: flex; flex-direction: column; gap: 6px; }
.qty-pill {
  display: flex; align-items: baseline; gap: 7px;
  padding: 9px 12px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #64748b;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  text-align: left;
  transition: all 0.15s;
  width: 100%;
}
.qty-pill:hover { border-color: #cbd5e1; background: #f1f5f9; color: #334155; }
.qty-pill.active {
  background: rgba(255,128,73,0.08);
  border-color: rgba(255,128,73,0.4);
  color: #ff8049;
  box-shadow: 0 0 0 1px rgba(255,128,73,0.12);
}
.qty-number { font-size: 0.95rem; font-weight: 700; }
.qty-text { font-size: 0.74rem; font-weight: 500; }

/* ── PRAZOS (direita) ─────────────────────────────────── */
.col-prazos { min-width: 0; }
.prazo-list { display: flex; flex-direction: column; gap: 8px; }
.prazo-row {
  display: flex; align-items: center; gap: 10px;
}
.prazo-badge {
  flex-shrink: 0;
  width: 30px; height: 30px;
  border-radius: 8px;
  background: rgba(255,128,73,0.08);
  border: 1px solid rgba(255,128,73,0.22);
  color: #ff8049;
  font-size: 0.72rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.prazo-field {
  position: relative;
  flex: 1;
  display: flex; align-items: center;
}
.prazo-input {
  width: 100%;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 9px 56px 9px 12px;
  color: #0f172a;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.88rem;
  outline: none;
  transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
  -moz-appearance: textfield;
}
.prazo-input::-webkit-outer-spin-button,
.prazo-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.prazo-input::placeholder { color: #cbd5e1; }
.prazo-input:focus { border-color: rgba(255,128,73,0.5); background: #fff; box-shadow: 0 0 0 3px rgba(255,128,73,0.08); }
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

/* ── PREVIEW ───────────────────────────────────────────── */
.preview-box {
  margin-top: 16px;
  padding: 12px 14px;
  border-radius: 12px;
  background: #fafafa;
  border: 1px solid #f1f5f9;
}
.preview-label {
  font-size: 0.62rem; font-weight: 700; color: #94a3b8;
  text-transform: uppercase; letter-spacing: 0.5px;
}
.preview-text {
  font-size: 0.8rem; color: #334155; line-height: 1.5; margin-top: 4px;
}

/* ── FOOTER ─────────────────────────────────────────── */
.modal-foot {
  padding: 14px 20px;
  border-top: 1px solid #f1f5f9;
  background: #fafafa;
  display: flex; align-items: center; gap: 10px;
  flex-shrink: 0;
}
.foot-info { font-size: 0.72rem; color: #94a3b8; }
.foot-spacer { flex: 1; }
.foot-btn {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.82rem; font-weight: 600;
  padding: 9px 18px; border-radius: 10px;
  border: none; cursor: pointer;
  display: flex; align-items: center; gap: 7px;
  transition: all 0.15s;
}
.foot-btn.ghost { background: #fff; color: #64748b; border: 1px solid #e2e8f0; }
.foot-btn.ghost:hover:not(:disabled) { background: #f1f5f9; color: #334155; border-color: #cbd5e1; }
.foot-btn.primary { background: #ff8049; color: #fff; }
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
.modal-slide-leave-to { opacity: 0; transform: scale(0.97) translateY(8px); }

.prazo-item-enter-active, .prazo-item-leave-active { transition: all 0.18s ease; }
.prazo-item-enter-from, .prazo-item-leave-to { opacity: 0; transform: translateY(-6px); }
.prazo-item-move { transition: transform 0.18s ease; }

/* ── RESPONSIVO ───────────────────────────────────────── */
@media (max-width: 640px) {
  .modal-backdrop { padding: 0; align-items: flex-end; }
  .modal-shell {
    width: 100%;
    max-width: 100%;
    max-height: 94vh;
    border-radius: 20px 20px 0 0;
  }
  .modal-slide-enter-from { transform: translateY(100%); }
  .modal-slide-leave-to { transform: translateY(100%); }

  .content-grid {
    grid-template-columns: 1fr;
    gap: 18px;
  }
  .col-divider {
    height: 1px;
    width: 100%;
  }
  .qty-list {
    flex-direction: row;
    flex-wrap: wrap;
  }
  .qty-pill {
    width: auto;
    flex: 1 1 auto;
    justify-content: center;
    min-width: 64px;
  }

  .modal-foot { flex-wrap: wrap; }
  .foot-info { order: 3; width: 100%; text-align: center; margin-top: 4px; }
  .foot-btn { flex: 1; justify-content: center; }
}

@media (max-width: 380px) {
  .qty-list { flex-direction: column; }
  .qty-pill { flex: none; }
}
</style>