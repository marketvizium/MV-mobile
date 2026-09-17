<template>
  <ion-page class="profile-page">
    <ion-content :fullscreen="true">
      <RefresherIonic />
      <main v-if="usuarioLocal" class="profile-shell">
        <header class="page-intro"><div><p class="eyebrow">SUA CONTA</p><h1>Meu perfil</h1></div><span class="brand-label">Market Vizium</span></header>
        <section class="profile-hero" aria-label="Resumo do perfil">
          <div class="hero-cover" aria-hidden="true"><span></span><span></span><ion-icon :icon="sparklesOutline" /></div>
          <div class="hero-body">
            <div class="identity"><div class="avatar-wrap"><img :src="fotoFalhou ? personagem : (usuarioLocal.foto || personagem)" alt="Foto de perfil" @error="fotoFalhou = true"><span class="role-badge">{{ nivel }}</span></div><div class="identity-text"><p class="eyebrow">BOM TER VOCÊ POR AQUI</p><h2>{{ usuarioLocal.nome || 'Usuário' }}</h2><p>{{ usuarioLocal.email || 'E-mail não informado' }}</p></div></div>
            <button class="primary" style="color: #FFF" @click="router.push({ name: 'EditarMeuPerfil' })"><ion-icon :icon="createOutline" />Editar perfil</button>
          </div>
          <div class="profile-facts"><div><ion-icon :icon="shieldCheckmarkOutline" /><span><small>Seu acesso</small><strong>{{ nivel }}</strong></span></div><div><ion-icon :icon="calendarOutline" /><span><small>Membro desde</small><strong>{{ dataCriacaoFormatada }}</strong></span></div><button v-if="usuarioLocal.nivel == 1" class="stores-link" @click="router.push({ name: 'consultarLojasDono' })"><ion-icon :icon="storefrontOutline" />Consultar lojas<ion-icon :icon="chevronForwardOutline" /></button></div>
        </section>
        <div class="profile-grid">
          <div class="details-column">
            <section v-for="grupo in grupos" :key="grupo.titulo" class="detail-card"><header><span class="section-icon"><ion-icon :icon="grupo.icone" /></span><div><h2>{{ grupo.titulo }}</h2><p>{{ grupo.descricao }}</p></div></header><dl><div v-for="campo in grupo.campos" :key="campo.nome"><dt>{{ campo.nome }}</dt><dd>{{ campo.valor || 'Não informado' }}</dd></div></dl></section>
          </div>
          <aside class="sidebar">
            <section class="invite-card"><div class="invite-art" aria-hidden="true"><span class="orbit"></span><ion-icon :icon="ticketOutline" /><span class="mini-person"><ion-icon :icon="personAddOutline" /></span></div><span class="pill">CONEXÕES DA LOJA</span><h2>Bons negócios começam com bons parceiros.</h2><p>Convide vendedores para se vincularem à sua loja e participarem das cotações e pedidos.</p><div class="expiry-note"><ion-icon :icon="timeOutline" /><span>Convite válido por <strong>7 DIAS</strong></span></div><button class="primary full" style="color: #FFF;" :disabled="gerando || !idLoja" @click="gerarConvite"><ion-spinner v-if="gerando" name="crescent" /><ion-icon v-else :icon="shareSocialOutline" />{{ gerando ? 'Gerando convite…' : 'Compartilhar convite da loja' }}</button><button class="secondary full my-invites" :disabled="!idLoja" @click="abrirHistorico"><ion-icon :icon="listOutline" />Meus convites</button><p class="fine-print">Ao gerar, copie ou compartilhe no modal. O código aparece uma única vez.</p><p v-if="!idLoja" class="error" role="alert">Selecione uma loja para gerar um convite.</p><p v-if="erroGeracao" class="error" role="alert">{{ erroGeracao }}</p></section>
            <section class="security-note"><ion-icon :icon="shieldCheckmarkOutline" /><div><h3>Você escolhe quem participa</h3><p>Compartilhe apenas com os vendedores que deseja vincular. Para desassociar alguém, vá à aba de vendedores, busque o nome e selecione desvincular.</p></div></section>
          </aside>
        </div>
        <footer class="profile-footer"><div><strong>Sua conta, do seu jeito.</strong><p>Mantenha seus dados de contato atualizados.</p></div><button class="logout" @click="auth.logout()"><ion-icon :icon="logOutOutline" />Sair da conta</button></footer>
      </main>
      <div v-else class="empty-account"><ion-icon :icon="personOutline" /><h1>Perfil indisponível</h1><p>Entre na sua conta para consultar seus dados.</p><button class="primary" @click="router.replace({ name: 'Login' })">Ir para o login</button></div>
    </ion-content>
    <ion-modal :is-open="modalAberto" :backdrop-dismiss="false" :can-dismiss="podeFecharModal" @didDismiss="limparConvite" class="invite-modal">
      <ion-header><ion-toolbar><ion-title>Convite gerado</ion-title></ion-toolbar></ion-header>
      <ion-content class="ion-padding">
        <div class="modal-body"><div class="large-icon"><ion-icon :icon="checkmarkCircleOutline" /></div><h2>Copie agora. Ele aparece só uma vez.</h2>
          <p>Ao fechar esta janela, você não poderá consultar o código novamente.</p>
          <aside class="notice"><ion-icon :icon="shieldCheckmarkOutline" /><div><strong>Compartilhe com cuidado</strong><p>Envie apenas para os vendedores que irão se vincular à sua loja. Não compartilhe com qualquer pessoa.</p></div></aside>
          <label for="codigo-convite">Seu convite</label><textarea id="codigo-convite" ref="campoConvite" :value="codigoConvite" readonly rows="4" spellcheck="false" @focus="selecionarCodigo" />
          <button v-if="podeCompartilhar" class="primary" :disabled="compartilhando" @click="compartilharConvite"><ion-icon :icon="shareSocialOutline" />{{ compartilhando ? 'Abrindo compartilhamento…' : 'Compartilhar convite' }}</button>
          <button class="secondary" :disabled="copiando" @click="copiarConvite"><ion-icon :icon="copiado ? checkmarkCircleOutline : copyOutline" />{{ copiado ? 'Convite copiado!' : 'Copiar convite' }}</button>
          <p role="status" aria-live="polite">{{ feedbackCopia }}</p>
          <p class="modal-expiration"><ion-icon :icon="timeOutline" /><strong>Validade: 7 DIAS</strong><br>{{ expiracaoGerada ? `Expira em ${formatarData(expiracaoGerada)}` : 'O prazo começa na emissão do convite.' }}</p>
          <label class="acknowledgement"><input v-model="confirmouFechamento" type="checkbox">Entendi que, ao fechar, não poderei ver este convite novamente.</label>
          <button class="secondary full" :disabled="!confirmouFechamento" @click="modalAberto = false">Concluir e fechar</button>
        </div>
      </ion-content>
    </ion-modal>
    <Teleport to="body">
      <dialog ref="dialogoHistorico" class="history-dialog" aria-labelledby="history-title" aria-describedby="history-description" @cancel.prevent="fecharHistorico" @click="fecharPeloFundo">
        <div class="history-frame">
          <header class="history-header"><div><p class="eyebrow">CONEXÕES DA LOJA</p><h2 id="history-title">Meus convites</h2><p id="history-description">Acompanhe os prazos e os vendedores que aceitaram.</p></div><button class="secondary icon-button" aria-label="Fechar meus convites" autofocus @click="fecharHistorico"><ion-icon :icon="closeOutline" /></button></header>
          <div class="history-scroll" :aria-busy="carregando">
            <aside class="history-notice"><ion-icon :icon="timeOutline" /><p><strong>Validade de 7 DIAS.</strong> O código não pode ser consultado novamente. Aqui você acompanha apenas o histórico de adesões.</p></aside>
            <div class="history-controls"><label>Mostrar convites<select v-model="filtroAceites"><option value="todos">Todos os convites</option><option value="com">Com aceites</option><option value="sem">Sem aceites registrados</option></select></label><button class="secondary" :disabled="carregando || !idLoja" @click="consultarConvites"><ion-icon :icon="refreshOutline" />Atualizar</button></div>
            <p class="history-explanation">A consulta informa apenas quem aceitou. Não é possível identificar quem recebeu o convite e ainda não aceitou.</p>
            <div v-if="carregando" class="history-empty" role="status"><ion-spinner /><p>Buscando seus convites…</p></div>
            <div v-else-if="erroConsulta" class="history-empty" role="alert"><p class="error">{{ erroConsulta }}</p><button class="secondary" :disabled="!idLoja" @click="consultarConvites">Tentar novamente</button></div>
            <div v-else-if="!convitesFiltrados.length" class="history-empty"><ion-icon :icon="ticketOutline" /><h3>{{ convites.length ? 'Nenhum convite neste filtro' : 'Nenhum convite encontrado' }}</h3><p>{{ convites.length ? 'Selecione outro filtro para consultar o histórico.' : 'Os convites gerados para esta loja aparecerão aqui.' }}</p></div>
            <div v-else class="history-cards">
              <article v-for="(convite, index) in convitesFiltrados" :key="convite.id || index" class="history-item">
                <header><h3>Convite #{{ convite.id || index + 1 }}</h3><span class="history-status" :class="status(convite).classe">{{ status(convite).texto }}</span></header>
                <p v-if="convite.statusRegistro" class="history-explanation">Status do registro: {{ convite.statusRegistro }}</p>
                <dl><div><dt>Emitido em</dt><dd>{{ formatarData(convite.emissao) }}</dd></div><div><dt>Expira em</dt><dd>{{ formatarData(convite.expiracao) }}</dd></div></dl>
                <details class="history-sellers" open><summary><ion-icon :icon="peopleOutline" />{{ convite.vendedores.length }} {{ convite.vendedores.length === 1 ? 'aceite registrado' : 'aceites registrados' }}</summary>
                  <ul v-if="convite.vendedores.length"><li v-for="(vendedor, i) in convite.vendedores" :key="vendedor.id || i"><img v-if="vendedor.foto && !vendedor.fotoFalhou" :src="vendedor.foto" alt="" loading="lazy" referrerpolicy="no-referrer" @error="vendedor.fotoFalhou = true"><span v-else class="history-avatar" aria-hidden="true">{{ vendedor.nome.slice(0, 1).toUpperCase() }}</span><div><strong>{{ vendedor.nome }}</strong><small v-if="vendedor.cnpj">CNPJ: {{ vendedor.cnpj }}</small><small v-if="vendedor.cidade || vendedor.estado">{{ [vendedor.cidade, vendedor.estado].filter(Boolean).join(' / ') }}</small><small class="accepted-label">Aceitou em: {{ formatarData(vendedor.aceitoEm) }}</small></div></li></ul>
                  <p v-else class="no-acceptance">Nenhum aceite registrado para este convite.</p>
                </details>
              </article>
            </div>
          </div>
          <footer class="history-footer"><p>Para desvincular, busque o vendedor na aba de vendedores.</p><button class="secondary" @click="fecharHistorico">Fechar</button></footer>
        </div>
      </dialog>
    </Teleport>

  </ion-page>
</template>

<script setup lang="ts">
import { nextTick, computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { IonPage, IonContent, IonIcon, IonSpinner, IonModal, IonHeader, IonToolbar, IonTitle, onIonViewWillEnter, onIonViewDidLeave } from '@ionic/vue'
import { closeOutline, listOutline, refreshOutline, peopleOutline, calendarOutline, checkmarkCircleOutline, copyOutline, personAddOutline, personOutline, shieldCheckmarkOutline, ticketOutline, timeOutline } from 'ionicons/icons'
import personagem from '@/assets/personagem.png'
import RefresherIonic from '@/components/refresherIonic.vue'
import { sparklesOutline, createOutline, storefrontOutline, chevronForwardOutline, shareSocialOutline, logOutOutline, mailOutline, locationOutline, cardOutline } from 'ionicons/icons'
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

type Registro = Record<string, any>
const auth = useAuthStore()
const router = useRouter()
const idLoja = computed(() => auth.loja?.id_loja)
const gerando = ref(false), copiando = ref(false)
const erroGeracao = ref('')
const modalAberto = ref(false), confirmouFechamento = ref(false), copiado = ref(false)
const codigoConvite = ref(''), feedbackCopia = ref('')
const expiracaoGerada = ref<number | null>(null)
const campoConvite = ref<HTMLTextAreaElement | null>(null)
let contexto = 0

function dataEmMs(valor: unknown): number | null {
  if (valor === null || valor === undefined || valor === '') return null
  const numerico = typeof valor === 'number' || /^\d+$/.test(String(valor))
  const numero = Number(valor)
  const ms = numerico ? (numero < 1e12 ? numero * 1000 : numero) : Date.parse(String(valor))
  return Number.isFinite(ms) ? ms : null
}
function extrairGerado(resposta: Registro) {
  const dados = resposta.data ?? resposta
  const codigo = typeof dados === 'string' ? dados : dados.convite ?? dados.codigo ?? dados.link ?? dados.token
  if (typeof codigo !== 'string' || !codigo.trim()) throw new Error('Resposta sem código de convite')
  return { codigo, expiracao: typeof dados === 'object' ? dataEmMs(dados.data_expiracao ?? dados.expires_at ?? dados.expira_em) : null }
}
function formatarData(ms: number | null) {
  return ms === null ? 'Não informada' : new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(ms)
}
async function gerarConvite() {
  if (gerando.value || !idLoja.value) return
  const loja = idLoja.value, contextoAtual = contexto
  gerando.value = true
  erroGeracao.value = ''
  try {
    // A rota já recebe o id da loja, conforme o endpoint informado.
    const resposta = await api.post(`/mvpu/loja/gerarConvite/${encodeURIComponent(String(loja))}`)
    if (contextoAtual !== contexto || loja !== idLoja.value) return
    const gerado = extrairGerado(resposta.data)
    codigoConvite.value = gerado.codigo
    expiracaoGerada.value = gerado.expiracao
    confirmouFechamento.value = false
    copiado.value = false
    feedbackCopia.value = ''
    modalAberto.value = true
  } catch {
    if (contextoAtual === contexto) erroGeracao.value = 'Não foi possível obter o convite. A solicitação pode ter sido processada; consulte o histórico antes de gerar outro.'
  } finally { gerando.value = false }
}
function selecionarCodigo() { campoConvite.value?.select() }
async function copiarConvite() {
  if (copiando.value || !codigoConvite.value) return
  copiando.value = true
  try {
    await navigator.clipboard.writeText(codigoConvite.value)
    copiado.value = true
    feedbackCopia.value = 'Copiado. Envie somente aos vendedores escolhidos.'
  } catch {
    campoConvite.value?.focus()
    selecionarCodigo()
    feedbackCopia.value = 'A cópia automática não está disponível. Copie manualmente o texto selecionado.'
  } finally { copiando.value = false }
}
function podeFecharModal() { return confirmouFechamento.value }
function limparConvite() {
  modalAberto.value = false
  codigoConvite.value = ''
  expiracaoGerada.value = null
  feedbackCopia.value = ''
  copiado.value = false
  confirmouFechamento.value = false
}

const usuarioLocal = computed(() => auth.usuario ?? null)
const fotoFalhou = ref(false)
const nivel = computed(() => (({ 1: 'Admin', 6: 'Supervisor', 7: 'Colaborador' } as Record<number, string>)[Number(usuarioLocal.value?.nivel)] || 'Usuário'))
const dataCriacaoFormatada = computed(() => {
  const ms = dataEmMs(usuarioLocal.value?.data_criacao)
  return ms === null ? 'Não informado' : new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric' }).format(ms)
})
const grupos = computed(() => {
  const u = usuarioLocal.value
  return [
    { titulo: 'Contato', descricao: 'Para manter a conversa em dia', icone: mailOutline, campos: [{ nome: 'E-mail', valor: u?.email }, { nome: 'Celular', valor: u?.celular }] },
    { titulo: 'Documentação', descricao: 'Informações do seu cadastro', icone: cardOutline, campos: [{ nome: 'CPF', valor: u?.cpf }, { nome: 'Data de pagamento', valor: u?.data_pagamento }] },
    { titulo: 'Endereço', descricao: 'Onde você está', icone: locationOutline, campos: [{ nome: 'Rua', valor: u?.rua }, { nome: 'Cidade / Estado', valor: [u?.cidade, u?.estado].filter(Boolean).join(' / ') }, { nome: 'CEP', valor: u?.cep }] },
  ]
})
const podeCompartilhar = typeof navigator !== 'undefined' && typeof navigator.share === 'function'
const compartilhando = ref(false)
async function compartilharConvite() {
  if (compartilhando.value || !codigoConvite.value) return
  compartilhando.value = true
  try {
    await navigator.share({ title: 'Convite da loja', text: `Você foi convidado para se vincular à nossa loja e participar das cotações e pedidos. O convite tem validade de 7 dias a partir da emissão. Não encaminhe a terceiros.\n\n${codigoConvite.value}` })
    feedbackCopia.value = 'Compartilhamento concluído.'
  } catch (erro) {
    feedbackCopia.value = erro instanceof Error && erro.name === 'AbortError' ? 'Compartilhamento cancelado. Você ainda pode copiar o convite.' : 'Não foi possível compartilhar. Use o botão de copiar convite.'
  } finally { compartilhando.value = false }
}
function parar() { contexto++; limparConvite(); fecharHistorico(); convites.value = [] }
watch(() => usuarioLocal.value?.foto, () => { fotoFalhou.value = false })
watch(idLoja, () => { parar(); erroGeracao.value = '' })
watch(usuarioLocal, usuario => { if (!usuario) parar() })
onIonViewWillEnter(() => {
  if (!auth.token && !localStorage.getItem('token')) void router.replace({ name: 'Login' })
})
onIonViewDidLeave(parar)
onBeforeUnmount(parar)
type Vendedor = { id: string; nome: string; cnpj: string; foto: string; estado: string; cidade: string; aceitoEm: number | null; fotoFalhou: boolean }
type Convite = { id: string; emissao: number | null; expiracao: number | null; statusRegistro: string; vendedores: Vendedor[] }

const dialogoHistorico = ref<HTMLDialogElement | null>(null)
const convites = ref<Convite[]>([])
const carregando = ref(false)
const erroConsulta = ref('')
const agora = ref(Date.now())
const filtroAceites = ref('todos')
let versaoConsulta = 0
let timerHistorico: ReturnType<typeof setInterval> | undefined
let focoAnterior: HTMLElement | null = null
const convitesFiltrados = computed(() => convites.value.filter(c => filtroAceites.value === 'com' ? c.vendedores.length > 0 : filtroAceites.value === 'sem' ? c.vendedores.length === 0 : true))
async function abrirHistorico() {
  if (!idLoja.value) return
  focoAnterior = document.activeElement instanceof HTMLElement ? document.activeElement : null
  filtroAceites.value = 'todos'
  await nextTick()
  dialogoHistorico.value?.showModal()
  agora.value = Date.now()
  clearInterval(timerHistorico)
  timerHistorico = setInterval(() => { agora.value = Date.now() }, 30000)
  void consultarConvites()
}
function fecharHistorico() {
  versaoConsulta++
  carregando.value = false
  clearInterval(timerHistorico)
  dialogoHistorico.value?.close()
  focoAnterior?.focus()
  focoAnterior = null
}
function fecharPeloFundo(event: MouseEvent) {
  if (event.target !== dialogoHistorico.value) return
  const rect = dialogoHistorico.value!.getBoundingClientRect()
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) fecharHistorico()
}
function normalizarConvite(item: Registro): Convite {
  const vendedores = item.vendedores ?? []
  if (!Array.isArray(vendedores)) throw new Error('Formato de vendedores inválido')
  return {
    id: String(item.id_convite_vendedor_loja ?? ''),
    emissao: dataEmMs(item.criado_em),
    expiracao: dataEmMs(item.expira_em),
    // Os valores possíveis de status não foram especificados; preserve o valor
    // retornado e apresente a situação do prazo separadamente.
    statusRegistro: item.status == null ? '' : String(item.status),
    vendedores: vendedores
      // Uma consulta com LEFT JOIN pode retornar um participante inteiramente nulo.
      .filter((v: Registro | null) => v != null && v.id_vendedor != null && v.id_vendedor !== '')
      .map((v: Registro) => ({
        id: String(v.id_vendedor),
        nome: String(v.nome || 'Vendedor sem nome'),
        cnpj: String(v.cnpj ?? ''),
        foto: fotoSegura(v.foto),
        estado: String(v.estado ?? ''),
        cidade: String(v.cidade ?? ''),
        aceitoEm: dataEmMs(v.aceito_em),
        fotoFalhou: false,
      })),
  }
}
function fotoSegura(valor: unknown): string {
  if (typeof valor !== 'string') return ''
  try { const url = new URL(valor); return ['https:', 'http:'].includes(url.protocol) ? url.href : '' } catch { return '' }
}
function status(convite: Convite) {
  if (convite.expiracao === null) return { classe: 'unknown', texto: 'Prazo não informado' }
  const restante = convite.expiracao - agora.value
  if (restante <= 0) return { classe: 'expired', texto: 'Expirado' }
  return restante <= 86400000 ? { classe: 'soon', texto: 'Expira em breve' } : { classe: 'active', texto: 'Dentro do prazo' }
}
async function consultarConvites() {
  const loja = idLoja.value
  const versao = ++versaoConsulta
  erroConsulta.value = ''
  if (!loja) { carregando.value = false; convites.value = []; return }
  carregando.value = true
  try {
    const resposta = await api.get(`/mvpu/loja/consultarConvites/${encodeURIComponent(String(loja))}`)
    if (versao !== versaoConsulta) return
    const dados = resposta.data?.data ?? resposta.data
    const lista = Array.isArray(dados) ? dados : dados?.convites
    if (!Array.isArray(lista)) throw new Error('Formato de resposta inválido')
    convites.value = lista.map(normalizarConvite).sort((a, b) => (b.emissao ?? 0) - (a.emissao ?? 0))
    agora.value = Date.now()
  } catch {
    if (versao === versaoConsulta) erroConsulta.value = 'Verifique sua conexão e tente novamente. Se persistir, confira o formato de resposta da API.'
  } finally { if (versao === versaoConsulta) carregando.value = false }
}

</script>

<style scoped>
*{box-sizing:border-box}h1,h2,h3,p{margin:0}h1{line-height:1.25}h2{line-height:1.4}p{font-size:14px;line-height:1.7;color:#596679}button,input,textarea{font:inherit}button{min-height:46px;border-radius:12px;padding:12px 18px;display:inline-flex;align-items:center;justify-content:center;gap:9px;cursor:pointer;font-size:14px;font-weight:600}button:disabled{opacity:.55;cursor:not-allowed}button:focus-visible,textarea:focus-visible,input:focus-visible{outline:3px solid #9e3a10;outline-offset:3px}ion-icon{flex-shrink:0;font-size:22px}.eyebrow{font-size:10px;font-weight:700;letter-spacing:1.8px;color:#a3411a;margin-bottom:7px}.primary{background:#ff8049;border:1px solid #ff8049;color:#302318}.primary:hover:not(:disabled){background:#ff9567}.secondary{background:#fff;border:1px solid #dbe1e9;color:#344054}.full{width:100%}.pill{font-size:10px;font-weight:700;letter-spacing:1px;color:#9e3a10;border-radius:20px;padding:6px 12px}.error{color:#a52626!important;font-size:13px;margin:12px 0}ion-spinner{width:22px;height:22px}dl{display:grid;grid-template-columns:1fr 1fr}dd{margin:6px 0 0}.notice{display:flex;gap:13px;border:1px solid #f7d8c6;border-radius:14px;background:#fff6ef;padding:18px;color:#963b15}.notice strong{font-size:14px}.notice p{margin-top:4px;color:#80513b;font-size:13px}.large-icon{display:grid;place-items:center;background:#fff0e8;color:#b64718;border-radius:18px;width:64px;height:64px}.large-icon ion-icon{font-size:32px}.invite-modal{--width:560px;--height:min(850px,94dvh);--border-radius:20px}.modal-body{font-family:'Poppins',sans-serif;color:#243247;display:flex;flex-direction:column;gap:16px;padding:8px}.modal-body h2{font-size:23px}.modal-body label{font-size:13px;font-weight:600}.modal-body textarea{background:#f8f9fb;border:1px solid #ced5df;border-radius:12px;padding:14px;width:100%;resize:vertical;color:#273449;font-size:15px;line-height:1.6}.modal-body .acknowledgement{display:flex;align-items:flex-start;gap:10px;font-size:12px;line-height:1.7;font-weight:400}.acknowledgement input{width:18px;height:18px;flex-shrink:0;accent-color:#a3411a}.modal-expiration{background:#fff6ef;padding:14px;border-radius:12px;color:#963b15;font-size:13px}.modal-expiration ion-icon{vertical-align:middle;margin-right:7px;font-size:19px}@media(max-width:720px){.invite-modal{--width:100%;--height:100%;--border-radius:0}.modal-body{padding-bottom:calc(16px + env(safe-area-inset-bottom))}}

.profile-page{font-family:'Poppins',sans-serif;color:#263247}.profile-page ion-content{--background:#f7f8fa}.profile-shell{margin:auto;padding:32px 28px calc(36px + env(safe-area-inset-bottom))}.page-intro{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px}.page-intro h1{font-size:28px}.brand-label{font-size:12px;color:#697386}.profile-hero{background:white;border-radius:28px;overflow:hidden;border:1px solid #e9eaf0;box-shadow:0 10px 36px #2e384508}.hero-cover{height:138px;background:linear-gradient(115deg,#ffe4d4,#ffb790 58%,#ff8049);position:relative;overflow:hidden}.hero-cover span{position:absolute;width:260px;height:260px;border:1px solid #ffffff66;border-radius:50%;right:50px;top:-135px}.hero-cover span+span{right:-30px;top:-50px;width:310px;height:310px}.hero-cover>ion-icon{position:absolute;right:65px;top:48px;color:#fff4eb;font-size:44px;transform:rotate(12deg)}.hero-body{padding:0 32px 26px;display:flex;align-items:center;justify-content:space-between;gap:24px}.identity{display:flex;align-items:center;gap:24px;min-width:0}.avatar-wrap{position:relative;margin-top:-32px;flex-shrink:0}.avatar-wrap img{width:124px;height:124px;border:6px solid white;border-radius:38px;object-fit:cover;background:#fff5ef;box-shadow:0 5px 18px #49322016}.role-badge{position:absolute;bottom:-7px;left:50%;transform:translateX(-50%);border:3px solid #fff;border-radius:30px;background:#293647;color:#fff;padding:5px 14px;font-size:11px;white-space:nowrap}.identity-text{min-width:0;padding-top:22px}.identity-text h2{font-size:25px;overflow-wrap:anywhere}.identity-text>p:last-child{font-size:13px;overflow-wrap:anywhere}.profile-facts{border-top:1px solid #f0f1f4;display:flex;align-items:center;gap:36px;padding:20px 32px}.profile-facts>div{display:flex;align-items:center;gap:12px}.profile-facts ion-icon{color:#ac4b25}.profile-facts small{display:block;font-size:11px;color:#697386}.profile-facts strong{display:block;font-size:13px;margin-top:3px}.stores-link{margin-left:auto;border:0;background:#fff7f2;color:#964019;font-size:12px}.stores-link ion-icon{font-size:18px}.profile-grid{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);gap:26px;margin-top:26px}.details-column{display:grid;gap:18px;align-content:start}.detail-card{background:#fff;border:1px solid #e8ebef;border-radius:24px;padding:24px}.detail-card header{display:flex;align-items:center;gap:13px}.section-icon{display:grid;place-items:center;width:44px;height:44px;border-radius:15px;background:#fff2e9;color:#ae4c24;flex-shrink:0}.detail-card h2{font-size:16px}.detail-card header p{font-size:12px}.detail-card dl{background:none;padding:0;margin:22px 0 0;gap:22px}.detail-card dt{font-size:11px}.detail-card dd{font-size:13px;overflow-wrap:anywhere;font-weight:500}.sidebar{min-width:0}.invite-card{background:linear-gradient(150deg,#fff9f4,#fff0e6);border:1px solid #f4dac9;padding:28px;border-radius:28px}.invite-art{position:relative;display:grid;place-items:center;width:92px;height:88px;margin:4px 0 24px}.invite-art>ion-icon{font-size:51px;color:#a74722;transform:rotate(-18deg);z-index:1}.orbit{position:absolute;inset:0;background:#ffdbbf;border-radius:32px;transform:rotate(-9deg)}.mini-person{position:absolute;right:-8px;bottom:-4px;display:grid;place-items:center;background:white;box-shadow:0 4px 12px #7b37121c;color:#b34a22;width:36px;height:36px;border-radius:13px;z-index:2}.mini-person ion-icon{font-size:19px}.invite-card .pill{background:white;display:inline-block}.invite-card h2{font-size:25px;letter-spacing:-.6px;margin:15px 0 12px}.invite-card>p{font-size:13px;color:#745644}.expiry-note{display:flex;align-items:center;gap:8px;margin:22px 0 18px;font-size:12px;color:#8b401e}.expiry-note ion-icon{font-size:18px}.invite-card .primary{font-size:12px;padding:13px 10px}.invite-card .fine-print{font-size:11px;text-align:center;margin-top:12px}.security-note{display:flex;gap:12px;padding:24px 10px}.security-note>ion-icon{color:#9e4b2b}.security-note h3{font-size:12px;margin-bottom:5px}.security-note p{font-size:12px}.profile-footer{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:26px 0 0;margin-top:28px;border-top:1px solid #e3e7ec}.profile-footer strong{font-size:13px}.profile-footer p{font-size:12px}.logout{background:white;color:#a63535;border:1px solid #ead5d5;font-size:12px}.empty-account{min-height:70vh;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:16px;padding:28px;text-align:center}.empty-account>ion-icon{font-size:44px;color:#b34a22}.profile-page .primary{box-shadow:0 5px 14px #ff80491a}.profile-page button{transition:background .15s,box-shadow .15s}.profile-page button:hover:not(:disabled){box-shadow:0 5px 18px #25324212}
@media(max-width:800px){.profile-shell{padding:22px 16px 36px}.profile-grid{grid-template-columns:1fr}.hero-body{padding:0 22px 24px;align-items:flex-start;flex-direction:column;gap:24px}.hero-body>.primary{align-self:flex-end;margin-top:-12px}.identity{gap:18px}.identity-text h2{font-size:22px}.profile-facts{padding:20px 22px;gap:24px;flex-wrap:wrap}.stores-link{margin-left:0}.invite-card{padding:26px}.invite-art{float:right;margin-left:20px;width:72px;height:72px}.invite-card h2{max-width:430px}.invite-card .primary{font-size:14px}.sidebar{display:flex;flex-direction:column}.brand-label{font-size:11px}.detail-card{padding:22px}}
@media(max-width:480px){.hero-cover{height:108px}.hero-cover>ion-icon{right:35px;top:32px;font-size:32px}.identity{flex-direction:column;align-items:flex-start;gap:18px;width:100%}.identity-text{padding-top:0}.avatar-wrap img{width:100px;height:100px;border-radius:30px}.hero-body>.primary{align-self:stretch;margin-top:0}.profile-facts{gap:20px;justify-content:space-between}.profile-facts>div{gap:8px}.stores-link{width:100%}.identity-text h2{font-size:24px}.profile-hero{border-radius:24px}.detail-card dl{grid-template-columns:1fr;gap:18px}.invite-card h2{font-size:23px}.invite-art{width:60px;height:60px;margin-left:12px}.invite-art>ion-icon{font-size:38px}.profile-footer{align-items:flex-start;flex-direction:column}.logout{width:100%}.brand-label{display:none}.page-intro h1{font-size:25px}}
@media(prefers-reduced-motion:reduce){.profile-page button{transition:none}}

.my-invites{margin-top:10px}.history-dialog{padding:0;border:0;border-radius:26px;width:min(960px,calc(100vw - 40px));max-width:none;max-height:none;height:min(850px,calc(100dvh - 48px));color:#263247;background:#f8f9fb;font-family:'Poppins',sans-serif;box-shadow:0 28px 90px #14203940;overflow:hidden}.history-dialog::backdrop{background:#17233599;backdrop-filter:blur(5px)}.history-frame{display:flex;flex-direction:column;height:100%;min-height:0}.history-header,.history-footer{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:22px 26px;background:#fff;flex-shrink:0}.history-header{border-bottom:1px solid #e8ebef}.history-header h2{font-size:24px}.history-header p:last-child{font-size:12px;margin-top:5px}.icon-button{padding:10px;flex-shrink:0}.history-scroll{overflow-y:auto;overscroll-behavior:contain;min-height:0;padding:24px}.history-notice{display:flex;align-items:flex-start;gap:12px;background:#fff0e5;border:1px solid #f6d7c0;border-radius:16px;padding:15px;color:#a3471d}.history-notice p{font-size:12px;color:#7f4a30}.history-controls{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin:20px 0 12px}.history-controls label{display:grid;gap:6px;font-size:12px;color:#526074}.history-controls select{font:inherit;min-height:46px;padding:10px 30px 10px 12px;border:1px solid #dce1e8;border-radius:12px;background:#fff;color:#263247;max-width:100%}.history-dialog :is(select,summary):focus-visible{outline:3px solid #9e3a10;outline-offset:3px}.history-explanation{font-size:11px;line-height:1.6;margin:10px 0 16px}.history-cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;align-items:start}.history-item{min-width:0;padding:20px;background:#fff;border:1px solid #e2e7ed;border-radius:20px}.history-item>header{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}.history-item h3{font-size:15px;overflow-wrap:anywhere}.history-status{font-size:10px;padding:6px 9px;border-radius:20px;background:#edf0f5;color:#556173}.history-status.active{color:#246344;background:#e8f6ed}.history-status.soon{color:#98531e;background:#fff0de}.history-item dl{gap:14px;margin:18px 0;padding:14px;background:#f8f9fb;border-radius:12px}.history-item dt{font-size:11px;color:#687386}.history-item dd{font-size:12px;overflow-wrap:anywhere}.history-sellers{border-top:1px solid #edf0f3;padding-top:14px}.history-sellers summary{cursor:pointer;font-size:12px;font-weight:600;min-height:36px}.history-sellers summary ion-icon{vertical-align:middle;font-size:18px;margin-right:5px}.history-sellers ul{list-style:none;padding:0;margin:8px 0 0}.history-sellers li{display:flex;gap:11px;padding:12px 0;border-bottom:1px solid #f1f3f6}.history-sellers li:last-child{border:0}.history-sellers img,.history-avatar{width:40px;height:40px;border-radius:50%;object-fit:cover;flex-shrink:0}.history-avatar{display:grid;place-items:center;background:#fff0e5;color:#a3471d}.history-sellers li>div{display:grid;gap:4px;min-width:0}.history-sellers strong{font-size:12px;overflow-wrap:anywhere}.history-sellers small{font-size:11px;color:#687386;overflow-wrap:anywhere}.history-sellers .accepted-label{color:#286348}.no-acceptance{font-size:12px;padding:12px 0;color:#687386}.history-empty{display:flex;align-items:center;flex-direction:column;text-align:center;gap:14px;padding:45px 12px}.history-empty h3{font-size:18px}.history-footer{border-top:1px solid #e8ebef;padding:16px 24px}.history-footer p{font-size:11px;max-width:480px}
@media(max-width:700px){.history-dialog{width:calc(100vw - 20px);height:calc(100dvh - 24px);border-radius:22px}.history-cards{grid-template-columns:1fr}.history-header{padding:18px}.history-header h2{font-size:21px}.history-scroll{padding:16px}.history-controls{flex-wrap:wrap}.history-controls label{flex:1;min-width:180px}.history-controls button{font-size:12px}.history-footer{padding:14px 18px calc(14px + env(safe-area-inset-bottom))}.history-item{padding:16px}}
</style>
