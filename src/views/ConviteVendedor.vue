<template>
  <ion-page class="accept-page">
    <ion-content :fullscreen="true">
      <main class="invitation-shell">
        <div class="wordmark">
          <span class="brand-icon"><ion-icon :icon="storefrontOutline" /></span>
          Market
          <strong>Vizium</strong>
        </div>
        <section
          class="invitation-card"
          :aria-busy="estado === 'carregando' || aceitando"
        >
          <div class="top-line"></div>
          <div
            class="card-content"
            aria-live="polite"
          >
            <template v-if="estado === 'carregando'">
              <div class="illustration"><ion-spinner name="crescent" /></div>
              <h1>Preparando seu convite</h1>
              <p>Estamos consultando os dados da loja.</p>
            </template>
            <template v-else-if="estado === 'nao-autorizado'">
              <div class="illustration"><ion-icon :icon="lockClosedOutline" /></div>
              <span class="eyebrow">ACESSO NÃO AUTORIZADO</span>
              <h1>Entre para continuar</h1>
              <p>Você precisa estar logado para acessar o convite da loja.</p>
              <button
                class="primary"
                @click="irParaLogin"
              >
                Prosseguir para o login
                <ion-icon :icon="arrowForwardOutline" />
              </button>
            </template>
            <template v-else-if="estado === 'erro'">
              <div class="illustration muted">
                <ion-icon :icon="alertCircleOutline" />
              </div>
              <h1>Não foi possível abrir o convite</h1>
              <p role="alert">{{ mensagemErro }}</p>
              <button
                v-if="podeTentar"
                class="primary"
                @click="consultar"
              >
                Tentar novamente
              </button>
              <button
                class="secondary"
                @click="irDashboard"
              >
                Cancelar
              </button>
            </template>
            <template v-else-if="estado === 'sucesso'">
              <div
                class="celebration"
                aria-hidden="true"
              >
                <i
                  v-for="p in confetes"
                  :key="p.id"
                  :style="p.estilo"
                />
                <div class="success-medallion"><ion-icon :icon="checkmarkOutline" /></div>
              </div>
              <span class="eyebrow">CONVITE ACEITO</span>
              <h1>Que venham bons negócios!</h1>
              <p>
                Agora você está vinculado à
                <strong>{{ convite?.nome_fantasia }}</strong>
                e pode participar das cotações e pedidos da loja.
              </p>
              <p class="redirect-note">Indo para seu painel…</p>
              <button
                class="primary"
                @click="irDashboard"
              >
                Ir para o painel
                <ion-icon :icon="arrowForwardOutline" />
              </button>
            </template>
            <template v-else-if="convite">
              <div class="illustration">
                <ion-icon :icon="expirou ? timeOutline : storefrontOutline" />
                <span
                  v-if="!expirou"
                  class="mini-icon"
                >
                  <ion-icon :icon="mailOpenOutline" />
                </span>
              </div>
              <span class="eyebrow">
                {{ expirou ? 'PRAZO ENCERRADO' : 'UMA NOVA CONEXÃO' }}
              </span>
              <h1>{{ expirou ? 'Este convite expirou' : 'Você recebeu um convite!' }}</h1>
              <p v-if="!expirou">
                A loja
                <strong>{{ convite.nome_fantasia }}</strong>
                quer se conectar com você.
              </p>
              <p v-else>Solicite um novo convite à loja para continuar.</p>
              <div class="store-card">
                <span class="store-symbol"><ion-icon :icon="storefrontOutline" /></span>
                <div>
                  <small>LOJA QUE CONVIDOU VOCÊ</small>
                  <h2>{{ convite.nome_fantasia }}</h2>
                  <p>CNPJ: {{ formatarCnpj(convite.cnpj) }}</p>
                </div>
              </div>
              <p
                v-if="!expirou"
                class="purpose"
              >
                Ao prosseguir, você se vincula à loja para participar das suas
                <strong>cotações e pedidos.</strong>
              </p>
              <dl class="dates">
                <div>
                  <dt>Emitido em</dt>
                  <dd>{{ formatarData(convite.criado_em) }}</dd>
                </div>
                <div>
                  <dt>{{ expirou ? 'Expirou em' : 'Válido até' }}</dt>
                  <dd>{{ formatarData(convite.expira_em) }}</dd>
                </div>
              </dl>
              <div class="expiry-note">
                <ion-icon :icon="timeOutline" />
                <span>
                  O convite tem validade de
                  <strong>7 dias</strong>
                  a partir da emissão.
                </span>
              </div>
              <p
                v-if="mensagemErro"
                class="error"
                role="alert"
              >
                {{ mensagemErro }}
              </p>
              <div class="actions">
                <button
                  class="secondary"
                  :disabled="aceitando"
                  @click="irDashboard"
                >
                  Cancelar
                </button>
                <button
                  v-if="!expirou"
                  class="primary"
                  :disabled="aceitando"
                  @click="aceitar"
                >
                  <ion-spinner
                    v-if="aceitando"
                    name="crescent"
                  />
                  <template v-else>
                    Prosseguir
                    <ion-icon :icon="arrowForwardOutline" />
                  </template>
                </button>
                <button
                  v-else
                  class="primary"
                  @click="irDashboard"
                >
                  Ir para o painel
                </button>
              </div>
              <p class="fine-print">
                <ion-icon :icon="shieldCheckmarkOutline" />
                Confirme apenas se reconhecer esta loja.
              </p>
            </template>
          </div>
        </section>
        <p class="footer-note">Conectando lojas e vendedores.</p>
      </main>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
  import { defineComponent } from 'vue'
  import { IonPage, IonContent, IonIcon, IonSpinner } from '@ionic/vue'
  import {
    storefrontOutline,
    lockClosedOutline,
    alertCircleOutline,
    arrowForwardOutline,
    checkmarkOutline,
    timeOutline,
    mailOpenOutline,
    shieldCheckmarkOutline,
  } from 'ionicons/icons'
  import { api } from '@/services/api'
  import { useAuthStore } from '@/stores/auth'
  type Convite = {
    nome_fantasia: string
    cnpj: string
    criado_em: number
    expira_em: number
    expirado: boolean
    convite_aceito: boolean
    aceito_em: number | null
  }
  type Estado = 'carregando' | 'nao-autorizado' | 'erro' | 'pronto' | 'sucesso'
  export default defineComponent({
    name: 'AceitarConvite',
    components: { IonPage, IonContent, IonIcon, IonSpinner },
    data() {
      return {
        storefrontOutline,
        lockClosedOutline,
        alertCircleOutline,
        arrowForwardOutline,
        checkmarkOutline,
        timeOutline,
        mailOpenOutline,
        shieldCheckmarkOutline,
        estado: 'carregando' as Estado,
        convite: null as Convite | null,
        aceitando: false,
        mensagemErro: '',
        podeTentar: true,
        agora: Date.now(),
        versao: 0,
        ativa: false,
        relogio: undefined as ReturnType<typeof setInterval> | undefined,
        redirecionamento: undefined as ReturnType<typeof setTimeout> | undefined,
        confetes: Array.from({ length: 28 }, (_, id) => ({
          id,
          estilo: {
            '--angle': `${id * 137.5}deg`,
            '--distance': `${80 + (id % 5) * 15}px`,
            '--delay': `${(id % 7) * 0.045}s`,
            '--color': ['#ff8049', '#23b8bc', '#895de2', '#f5c344'][id % 4],
          },
        })),
      }
    },
    computed: {
      hash(): string {
        return typeof this.$route.params.hash_convite === 'string'
          ? this.$route.params.hash_convite
          : ''
      },
      expirou(): boolean {
        return Boolean(
          this.convite && (this.convite.expirado || this.convite.expira_em <= this.agora)
        )
      },
    },
    watch: {
      hash() {
        if (this.ativa) {
          clearTimeout(this.redirecionamento)
          this.aceitando = false
          void this.consultar()
        }
      },
    },
    methods: {
      autenticado() {
        return Boolean(useAuthStore().token || localStorage.getItem('token'))
      },
      irParaLogin() {
        window.location.replace('/app/login')
      },
      irDashboard() {
        clearTimeout(this.redirecionamento)
        void this.$router.push({ name: 'Dashboard' })
      },
      formatarData(ms: number) {
        return new Intl.DateTimeFormat('pt-BR', {
          dateStyle: 'short',
          timeStyle: 'short',
        }).format(ms)
      },
      formatarCnpj(valor: string) {
        const n = valor.replace(/\D/g, '')
        return n.length === 14
          ? n.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
          : valor || 'Não informado'
      },
      corpoResposta(payload: any) {
        const corpo = payload?.body ?? payload
        const status = Number(payload?.status)
        if (status >= 400) {
          throw Object.assign(new Error('Falha da API'), { response: { status } })
        }
        return corpo
      },
      lerConvite(payload: any): Convite {
        const corpo = this.corpoResposta(payload)
        const d = corpo?.data ?? corpo
        if (
          !d ||
          typeof d.nome_fantasia !== 'string' ||
          !d.nome_fantasia.trim() ||
          typeof d.expirado !== 'boolean' ||
          typeof d.convite_aceito !== 'boolean' ||
          d.criado_em == null ||
          d.expira_em == null ||
          !Number.isSafeInteger(Number(d.criado_em)) ||
          !Number.isSafeInteger(Number(d.expira_em)) ||
          Number(d.expira_em) <= 0
        ) {
          throw new Error('Resposta inválida')
        }
        return {
          nome_fantasia: d.nome_fantasia,
          cnpj: String(d.cnpj ?? ''),
          criado_em: Number(d.criado_em),
          expira_em: Number(d.expira_em),
          expirado: d.expirado,
          convite_aceito: d.convite_aceito,
          aceito_em: d.aceito_em == null ? null : Number(d.aceito_em),
        }
      },
      tratarErro(erro: any, aoAceitar = false) {
        const status = Number(erro?.response?.status)
        if (status === 401) {
          this.convite = null
          this.estado = 'nao-autorizado'
          return
        }
        if (status === 410 && this.convite) {
          this.convite.expirado = true
          this.estado = 'pronto'
          return
        }
        this.podeTentar = ![400, 403, 404, 410].includes(status)
        this.mensagemErro =
          status === 403
            ? 'Este convite não está autorizado para sua conta.'
            : status === 404
            ? 'Convite não encontrado. Confira o link recebido.'
            : status === 410
            ? 'Este convite expirou. Solicite um novo link à loja.'
            : status === 400
            ? 'O convite não pôde ser validado. Confira o link recebido.'
            : aoAceitar
            ? 'Não foi possível confirmar o aceite. Clique em Prosseguir para consultar a situação antes de tentar novamente.'
            : 'Não foi possível consultar o convite. Verifique sua conexão e tente novamente.'
        if (!aoAceitar || !this.podeTentar) {
          this.estado = 'erro'
        }
      },
      async consultar() {
        const atual = ++this.versao
        this.convite = null
        this.mensagemErro = ''
        this.estado = 'carregando'
        this.podeTentar = true

        console.log(this.autenticado())
        if (!this.autenticado()) {
          this.estado = 'nao-autorizado'
          return
        }
        if (!this.hash.trim()) {
          this.estado = 'erro'
          this.podeTentar = false
          this.mensagemErro = 'O link não contém uma hash de convite válida.'
          return
        }
        try {
          const res = await api.get(
            `/mvpu/loja/consultarConvite/${encodeURIComponent(this.hash)}`
          )
          if (atual !== this.versao || !this.ativa) {
            return
          }
          this.convite = this.lerConvite(res.data)
          if (this.convite.convite_aceito) {
            this.irDashboard()
            return
          }
          this.agora = Date.now()
          this.estado = 'pronto'
        } catch (erro) {
          if (atual === this.versao && this.ativa) {
            this.tratarErro(erro)
          }
        }
      },
      async aceitar() {
        if (this.aceitando || !this.convite || this.estado !== 'pronto') {
          return
        }
        if (!this.autenticado()) {
          this.convite = null
          this.estado = 'nao-autorizado'
          return
        }
        this.agora = Date.now()
        if (this.expirou) {
          return
        }
        const atual = this.versao,
          hashAtual = this.hash
        this.aceitando = true
        this.mensagemErro = ''
        try {
          // Reconsulta antes do POST: um aceite anterior pode ter concluído mesmo
          // quando a conexão caiu, ou pode ter sido feito em outra aba.
          const verificacao = await api.get(
            `/mvpu/loja/consultarConvite/${encodeURIComponent(hashAtual)}`
          )

          if (atual !== this.versao || !this.ativa) {
            return
          }
          this.convite = this.lerConvite(verificacao.data)
          if (this.convite.convite_aceito) {
            this.irDashboard()
            return
          }
          this.agora = Date.now()
          if (this.expirou) {
            return
          }
          const res = await api.post(
            `/mvpu/loja/aceitarConvite/${encodeURIComponent(hashAtual)}`
          )
          if (atual !== this.versao || !this.ativa) {
            return
          }

          console.log(res, "RES")

          const corpo = this.corpoResposta(res.data.data)
          // Códigos do controller de aceite definido nesta integração.
          if (corpo?.COD != null && !['1529', '1530'].includes(String(corpo.COD))) {
            throw new Error('Aceite não confirmado')
          }
          if (String(corpo?.COD) === '1529') {
            this.irDashboard()
            return
          }
          this.estado = 'sucesso'
          this.redirecionamento = setTimeout(this.irDashboard, 2400)
        } catch (erro) {
          if (atual === this.versao && this.ativa) {
            this.tratarErro(erro, true)
          }
        } finally {
          if (atual === this.versao) {
            this.aceitando = false
          }
        }
      },
      sair() {
        this.ativa = false
        this.versao++
        this.aceitando = false
        clearInterval(this.relogio)
        clearTimeout(this.redirecionamento)
      },
    },
    ionViewWillEnter() {
      this.ativa = true
      clearInterval(this.relogio)
      this.relogio = setInterval(() => {
        this.agora = Date.now()
      }, 1000)
      void this.consultar()
    },
    ionViewDidLeave() {
      this.sair()
    },
    beforeUnmount() {
      this.sair()
    },
  })
</script>

<style scoped>
  .accept-page {
    font-family: 'Poppins', sans-serif;
    color: #253248;
  }
  .accept-page ion-content {
    --background: #f8f7f5;
  }
  * {
    box-sizing: border-box;
  }
  .invitation-shell {
    min-height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30px 20px calc(24px + env(safe-area-inset-bottom));
    background: radial-gradient(ellipse at 12% 12%, #fff0e4, transparent 48%),
      radial-gradient(ellipse at 92% 90%, #f3ebff, transparent 45%);
  }
  .wordmark {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 16px;
    letter-spacing: -0.4px;
    margin-bottom: 24px;
  }
  .brand-icon {
    width: 32px;
    height: 32px;
    display: grid;
    place-items: center;
    background: #ff8049;
    color: #38291f;
    border-radius: 11px;
    margin-right: 5px;
  }
  .brand-icon ion-icon {
    font-size: 19px;
  }
  .invitation-card {
    position: relative;
    background: #fff;
    border: 1px solid #eee8e2;
    border-radius: 30px;
    width: 100%;
    max-width: 560px;
    overflow: hidden;
    box-shadow: 0 18px 70px #5c44300c;
  }
  .top-line {
    height: 5px;
    background: linear-gradient(90deg, #ffcc9c, #ff8049, #ffc5a9);
  }
  .card-content {
    padding: 30px 38px 28px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }
  h1,
  h2,
  p {
    margin: 0;
  }
  h1 {
    font-size: 29px;
    line-height: 1.22;
    letter-spacing: -0.9px;
    max-width: 440px;
  }
  p {
    font-size: 14px;
    line-height: 1.7;
    color: #6b7280;
  }
  p strong {
    color: #3c4351;
  }
  .eyebrow {
    font-size: 10px;
    font-weight: 700;
    color: #a34b24;
    letter-spacing: 1.8px;
  }
  .illustration {
    position: relative;
    display: grid;
    place-items: center;
    width: 100px;
    height: 100px;
    border-radius: 34px;
    background: linear-gradient(145deg, #fff3e9, #ffe6d5);
    color: #c26337;
    margin: 4px 0 8px;
    box-shadow: 0 8px 30px #ff804915;
  }
  .illustration > ion-icon {
    font-size: 47px;
  }
  .mini-icon {
    position: absolute;
    bottom: -5px;
    right: -8px;
    border: 4px solid white;
    background: #ff8049;
    border-radius: 16px;
    width: 39px;
    height: 39px;
    display: grid;
    place-items: center;
    color: #352a24;
  }
  .mini-icon ion-icon {
    font-size: 19px;
  }
  .muted {
    background: #f0f2f5;
    color: #687487;
  }
  .store-card {
    display: flex;
    align-items: center;
    gap: 14px;
    width: 100%;
    padding: 18px;
    text-align: left;
    border: 1px solid #eceef1;
    background: #fafbfc;
    border-radius: 18px;
    margin-top: 3px;
  }
  .store-card > div {
    min-width: 0;
  }
  .store-symbol {
    width: 44px;
    height: 44px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    background: #fff0e6;
    color: #b65328;
    border-radius: 14px;
  }
  .store-symbol ion-icon {
    font-size: 24px;
  }
  .store-card small {
    font-size: 9px;
    letter-spacing: 1px;
    color: #7d8592;
  }
  .store-card h2 {
    font-size: 17px;
    line-height: 1.4;
    margin: 3px 0;
    overflow-wrap: anywhere;
  }
  .store-card p {
    font-size: 12px;
    overflow-wrap: anywhere;
  }
  .purpose {
    font-size: 13px;
  }
  .dates {
    display: grid;
    grid-template-columns: 1fr 1fr;
    width: 100%;
    gap: 16px;
    margin: 0;
    padding: 12px 0;
  }
  .dates > div + div {
    border-left: 1px solid #e7e9ed;
  }
  .dates dt {
    font-size: 11px;
    color: #79818e;
  }
  .dates dd {
    margin: 6px 0 0;
    font-size: 12px;
    font-weight: 600;
  }
  .expiry-note {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 11px;
    color: #94603f;
    background: #fff7ee;
    padding: 10px 13px;
    border-radius: 12px;
  }
  .expiry-note ion-icon {
    font-size: 18px;
    flex-shrink: 0;
  }
  .actions {
    display: flex;
    width: 100%;
    gap: 12px;
    margin-top: 5px;
  }
  .actions button {
    flex: 1;
    min-width: 0;
  }
  button {
    font: inherit;
    font-size: 13px;
    font-weight: 600;
    min-height: 49px;
    border-radius: 14px;
    padding: 12px 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
  }
  button:disabled {
    opacity: 0.6;
    cursor: wait;
  }
  button:focus-visible {
    outline: 3px solid #a7481f;
    outline-offset: 4px;
  }
  .primary {
    background: #ff8049;
    color: #34261e;
    border: 1px solid #ff8049;
  }
  .primary:hover:not(:disabled) {
    background: #ff976b;
  }
  .secondary {
    background: white;
    border: 1px solid #dce0e6;
    color: #526074;
  }
  .card-content > button {
    width: 100%;
  }
  button ion-icon {
    font-size: 18px;
  }
  .fine-print {
    font-size: 10px;
    color: #828894;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .fine-print ion-icon {
    font-size: 14px;
  }
  .footer-note {
    font-size: 11px;
    margin-top: 20px;
    color: #8b8c94;
  }
  .error {
    font-size: 12px;
    color: #a32e2e;
  }
  .redirect-note {
    font-size: 12px;
  }
  ion-spinner {
    width: 25px;
    height: 25px;
  }
  .celebration {
    position: relative;
    width: 260px;
    height: 240px;
    display: grid;
    place-items: center;
    margin: 4px 0;
  }
  .success-medallion {
    display: grid;
    place-items: center;
    width: 120px;
    height: 120px;
    background: #fff;
    border-radius: 50%;
    box-shadow: 0 10px 45px #5f44321a;
    color: #ff8049;
    animation: pop 0.55s ease-out;
  }
  .success-medallion ion-icon {
    font-size: 68px;
  }
  .celebration i {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 7px;
    height: 13px;
    border-radius: 2px;
    background: var(--color);
    opacity: 0;
    animation: confetti 1.9s var(--delay) ease-out both;
  }
  .celebration i:nth-child(3n) {
    border-radius: 50%;
    width: 7px;
    height: 7px;
  }
  @keyframes confetti {
    0% {
      opacity: 0;
      transform: rotate(var(--angle)) translateY(25px) rotate(0);
    }
    15% {
      opacity: 1;
    }
    75% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: rotate(var(--angle)) translateY(var(--distance)) rotate(260deg);
    }
  }
  @keyframes pop {
    from {
      opacity: 0;
      transform: scale(0.65);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  @media (max-width: 480px) {
    .invitation-shell {
      padding: 20px 12px calc(20px + env(safe-area-inset-bottom));
    }
    .wordmark {
      margin-bottom: 18px;
    }
    .card-content {
      padding: 26px 22px 24px;
      gap: 15px;
    }
    .invitation-card {
      border-radius: 25px;
    }
    h1 {
      font-size: 26px;
    }
    .illustration {
      width: 88px;
      height: 88px;
      border-radius: 29px;
    }
    .store-card {
      padding: 14px;
    }
    .store-card h2 {
      font-size: 16px;
    }
    .dates {
      gap: 10px;
    }
    .dates dd {
      font-size: 11px;
    }
    .celebration {
      height: 210px;
    }
    .expiry-note {
      text-align: left;
    }
  }
  @media (max-width: 350px) {
    .card-content {
      padding: 22px 16px;
    }
    .actions {
      flex-direction: column-reverse;
    }
    .dates {
      grid-template-columns: 1fr;
    }
    .dates > div + div {
      border: 0;
      padding-top: 8px;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .celebration i {
      animation: none;
      opacity: 0.8;
      transform: rotate(var(--angle)) translateY(var(--distance));
    }
    .success-medallion {
      animation: none;
    }
  }
</style>