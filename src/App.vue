<template>
  <ion-app>
    <Toast position="top-center" class="toast-style" />

    <!-- Tela de loading falsa -->
    <div v-if="showLoading" class="loading-container">

      <!-- Carrossel de imagens de fundo, em crossfade contínuo -->
      <div class="loading-bg-stack">
        <div
          v-for="(slide, i) in slides"
          :key="slide.image"
          class="loading-bg-slide"
          :class="{ active: i === slideIndex }"
          :style="{ backgroundImage: `url(${slide.image})` }"
        ></div>
        <div class="loading-bg-overlay"></div>
      </div>

      <div class="loading-content">
        <div class="loading-bar-track" v-if="!canProceed" >
          <div class="loading-bar-fill" :style="{ width: loadingProgress + '%' }"></div>
        </div>

        <Transition name="tip-fade" mode="out-in" v-if="!canProceed">
          <p class="loading-tip" :key="slideIndex">{{ currentSlideMessage }}</p>
        </Transition>

        <Transition name="fade">
          <button
            v-if="canProceed"
            class="ready-button"
            type="button"
            @click="onReadyClick"
          >
            Tudo pronto →
          </button>
        </Transition>
      </div>
    </div>

    <!-- Aplicação -->
    <ion-router-outlet v-else-if="!showIntro" />

    <!--
      Vídeo de abertura.
      Fica sempre montado a partir do onMounted (mesmo durante o loading) para que o
      navegador possa começar a baixar/decodificar o vídeo com antecedência. Assim,
      quando a intro é exibida, o primeiro frame já está pronto e não aparece a tela
      cinza com o ícone de play. A visibilidade é controlada por classe, não por v-if,
      então o elemento <video> nunca é destruído/recriado.
    -->
    <div
      v-show="showIntro"
      class="intro-container"
      @click="unlockAudio"
      @touchstart="unlockAudio"
    >
      <video
        ref="videoRef"
        class="intro-video"
        muted
        playsinline
        webkit-playsinline
        preload="auto"
        :src="currentIntroVideo"
        @ended="onVideoEnded"
        @canplay="onCanPlay"
        @canplaythrough="onCanPlayThrough"
      ></video>

      <!-- Aparece só se o navegador bloquear o áudio automático -->
      <Transition name="fade">
        <button
          v-if="needsTapToUnmute"
          class="unmute-button"
          type="button"
          @click.stop="unlockAudio"
        >
          🔊 Tocar com som
        </button>
      </Transition>
    </div>
  </ion-app>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { IonApp, IonRouterOutlet } from '@ionic/vue'
import Toast from 'primevue/toast'
import '@/assets/fonts.css'
import introVideoMobile from '@/assets/MV-intro.mp4'
import introVideoDesktop from '@/assets/MV-intro-desktop.mp4'

// Imagens de fundo do carrossel exibido durante a tela de loading falsa.
import loadingBg1 from '@/assets/loading/image-loading-1.png'
import loadingBg2 from '@/assets/loading/image-loading-2.png'
import loadingBg3 from '@/assets/loading/image-loading-3.png'
import loadingBg4 from '@/assets/loading/image-loading-4.png'

// Chave usada no sessionStorage para lembrar que a intro já foi mostrada
// nesta sessão (sobrevive a refresh/reload, mas é limpa quando a aba/app é fechado).
const INTRO_SEEN_KEY = 'mv_intro_seen'

const hasSeenIntroThisSession = (): boolean => {
  if (typeof window === 'undefined') return false
  try {
    return sessionStorage.getItem(INTRO_SEEN_KEY) === '1'
  } catch {
    // Em alguns ambientes (modo privado restrito, etc.) sessionStorage pode lançar erro.
    // Nesse caso, tratamos como "ainda não viu" para não travar o app.
    return false
  }
}

const markIntroAsSeen = () => {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(INTRO_SEEN_KEY, '1')
  } catch {
    // Ignora silenciosamente se não for possível gravar.
  }
}

const introAlreadySeen = hasSeenIntroThisSession()

const videoRef = ref<HTMLVideoElement>()

const showIntro = ref(false)
const needsTapToUnmute = ref(false)
const audioUnlocked = ref(false)

// Verdadeiro quando o navegador já conseguiu bufferizar o vídeo o suficiente
// para tocar do início ao fim sem precisar pausar pra carregar mais dados.
// É isso que evita a tela cinza com ícone de play na transição.
const videoReadyToPlay = ref(false)
let videoReadyFallbackTimer: ReturnType<typeof setTimeout> | undefined

// --- Detecção de breakpoint para escolher o vídeo correto ---
const DESKTOP_BREAKPOINT = 992
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 0)
const isDesktop = computed(() => windowWidth.value >= DESKTOP_BREAKPOINT)
const currentIntroVideo = computed(() => isDesktop.value ? introVideoDesktop : introVideoMobile)

const handleResize = () => {
  windowWidth.value = window.innerWidth
}

// --- Tela de loading falsa ---
// Se a intro já foi vista nesta sessão, nem o loading falso é exibido:
// o app vai direto pro conteúdo.
const showLoading = ref(!introAlreadySeen)
const loadingProgress = ref(0)
const loadingDone = ref(false)

// O botão "Tudo pronto" só aparece quando a barra falsa termina E o vídeo real
// já está pronto pra tocar sem engasgar. Assim a transição pro vídeo é instantânea.
const canProceed = computed(() => loadingDone.value && videoReadyToPlay.value)

// Carrossel de fundo: cada slide combina uma imagem com uma frase de uso
// do sistema de cotação, para comunicar valor enquanto o app "carrega".
const slides = [
  {
    image: loadingBg1,
    message: 'Abra novas cotações e transforme pedidos em minutos, direto no sistema.',
  },
  {
    image: loadingBg3,
    message: 'Descubra produtos de lançamento antes da concorrência e garanta seu pedido.',
  },
  {
    image: loadingBg2,
    message: 'Encontre as lojas certas e leve suas vendas a quem já está pronto para comprar.',
  },
  {
    image: loadingBg4,
    message: 'Acompanhe cada disputa de preço em tempo real, do primeiro lance à decisão final.',
  },
]

const slideIndex = ref(0)
const currentSlideMessage = computed(() => slides[slideIndex.value % slides.length].message)

let tipInterval: ReturnType<typeof setInterval> | undefined
let progressInterval: ReturnType<typeof setInterval> | undefined

const startFakeLoading = () => {
  tipInterval = setInterval(() => {
    slideIndex.value = (slideIndex.value + 1) % slides.length
  }, 5000)

  progressInterval = setInterval(() => {
    // Avança de forma não-linear pra parecer "real": rápido no começo, mais lento perto do fim
    const remaining = 100 - loadingProgress.value
    const step = Math.max(1, remaining * 0.12)
    loadingProgress.value = Math.min(100, loadingProgress.value + step)

    if (loadingProgress.value >= 100) {
      loadingProgress.value = 100
      loadingDone.value = true
      clearInterval(progressInterval)
      clearInterval(tipInterval)
    }
  }, 220)
}

const onReadyClick = () => {
  // Esse clique é o gesto do usuário que permite o áudio tocar sem bloqueio.
  // O <video> já está montado e pré-carregado desde o início (ver onMounted),
  // então não precisamos de setTimeout aqui: o elemento já existe no DOM.
  showLoading.value = false
  showIntro.value = true

  const video = videoRef.value
  if (video) {
    video.currentTime = 0
    video.muted = false
    video.volume = 1
    video.play()
      .then(() => {
        audioUnlocked.value = true
      })
      .catch(() => {
        // Se ainda assim for bloqueado, cai no fallback do botão de som
        video.muted = true
        video.play().catch(() => {})
        needsTapToUnmute.value = true
      })
  }
}

// --- Vídeo intro ---

// Tenta ligar o som do vídeo. Funciona de forma confiável quando chamado
// dentro de um gesto do usuário (click/touchstart), e também tentamos
// chamar automaticamente assim que o vídeo estiver pronto — se o navegador
// bloquear, mostramos o botão de fallback em vez de falhar silenciosamente.
const unlockAudio = async () => {
  const video = videoRef.value
  // Defesa extra: nunca tentar tocar o vídeo (com ou sem som) se a intro
  // ainda não está visível na tela. Isso evita qualquer disparo "fantasma"
  // antes do clique do usuário, mesmo se essa função for chamada de algum
  // outro lugar no futuro.
  if (!video || audioUnlocked.value || !showIntro.value) return

  try {
    video.muted = false
    video.volume = 1
    await video.play()

    audioUnlocked.value = true
    needsTapToUnmute.value = false
  } catch (err) {
    video.muted = true
    needsTapToUnmute.value = true
  }
}

const onCanPlay = () => {
  // IMPORTANTE: "canplay" é disparado pelo navegador automaticamente durante o
  // preload (video.load()), normalmente ainda durante a tela de loading falsa,
  // ANTES do usuário clicar em "Tudo pronto". Por isso, NUNCA chamamos
  // unlockAudio() aqui antes de showIntro ser true — senão o vídeo dispara
  // (com tentativa de som) escondido por trás do loading, sem gesto do usuário.
  if (!showIntro.value) return

  if (!audioUnlocked.value) {
    unlockAudio()
  }
}

// Disparado quando o navegador estima ter bufferizado o suficiente pra tocar
// o vídeo inteiro sem precisar pausar. É o sinal mais confiável de "pronto".
const onCanPlayThrough = () => {
  videoReadyToPlay.value = true
  if (videoReadyFallbackTimer) {
    clearTimeout(videoReadyFallbackTimer)
    videoReadyFallbackTimer = undefined
  }
}

// Começa a carregar o vídeo real assim que o app monta, em paralelo com a
// barra de loading falsa. Em conexões lentas, ou caso o navegador nunca
// dispare "canplaythrough" (acontece em alguns WebViews), liberamos o botão
// de qualquer forma depois de um tempo limite, pra não travar o usuário.
const startVideoPreload = () => {
  const video = videoRef.value
  if (!video) return

  video.load()

  videoReadyFallbackTimer = setTimeout(() => {
    videoReadyToPlay.value = true
  }, 8000)
}

// Se a tela cruzar o breakpoint mobile/desktop (ex: rotação, redimensionamento
// de janela) antes do vídeo ser exibido, o :src troca e o navegador descarta
// o buffer já feito. Detectamos isso e recarregamos o vídeo certo, mantendo o
// botão "Tudo pronto" bloqueado até o novo arquivo estar pronto.
watch(currentIntroVideo, () => {
  if (showIntro.value) return // já está sendo exibido, não precisa trocar
  videoReadyToPlay.value = false
  if (videoReadyFallbackTimer) {
    clearTimeout(videoReadyFallbackTimer)
    videoReadyFallbackTimer = undefined
  }
  // Aguarda o próximo tick pro Vue atualizar o atributo src no DOM antes de chamar load().
  setTimeout(() => startVideoPreload(), 0)
})

onMounted(() => {
  if (introAlreadySeen) {
    // Já mostramos loading + vídeo nesta sessão (app já estava aberto e houve
    // um refresh/atualização). Pula direto pro conteúdo, sem rodar de novo.
    showLoading.value = false
    showIntro.value = false
    return
  }

  startFakeLoading()
  startVideoPreload()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (tipInterval) clearInterval(tipInterval)
  if (progressInterval) clearInterval(progressInterval)
  if (videoReadyFallbackTimer) clearTimeout(videoReadyFallbackTimer)
})

const onVideoEnded = () => {
  showIntro.value = false
  // Marca que a intro já foi exibida nesta sessão. Só volta a aparecer se o
  // usuário fechar completamente o app/navegador e abrir de novo (nova sessão).
  markIntroAsSeen()
}
</script>

<style>
:root {
  font-family: 'Poppins', sans-serif;
}

input {
  background-color: #FFF;
  color: #000;
}

body {
  font-family: 'Poppins', sans-serif;
  font-weight: 400;
}

/* Tela de loading falsa */
.loading-container {
  position: fixed;
  inset: 0;
  z-index: 999999;
  background: #0b0b0c;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* Carrossel de imagens de fundo */
.loading-bg-stack {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.loading-bg-slide {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  opacity: 0;
  transform: scale(1.06);
  transition: opacity 1.4s ease;
}

.loading-bg-slide.active {
  opacity: 1;
  animation: loading-ken-burns 6.4s ease-out forwards;
}

@keyframes loading-ken-burns {
  from { transform: scale(1.1); }
  to { transform: scale(1); }
}

.loading-bg-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(6, 6, 8, 0.1) 0%, rgba(6, 6, 8, 0.72) 55%, rgba(6, 6, 8, 0.92) 100%);
}

.loading-content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 320px;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  justify-content: end;
  height: 100vh; padding-bottom: 60px;
}

.loading-logo {
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 32px;
}

.loading-bar-track {
  width: 100%;
  height: 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  overflow: hidden;
  margin-bottom: 16px;
}

.loading-bar-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #ff8a00, #ff6a00);
  transition: width 0.25s ease;
}

.loading-tip {
  min-height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14.5px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 400;
  letter-spacing: 0.01em;
  margin: 0 0 24px;
}

.tip-fade-enter-active,
.tip-fade-leave-active {
  transition: opacity 0.3s ease;
}

.tip-fade-enter-from,
.tip-fade-leave-to {
  opacity: 0;
}

.ready-button {
  padding: 12px 28px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(90deg, #ff8a00, #ff6a00);
  color: #ffffff;
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(255, 106, 0, 0.35);
  width: 100%;
}

/* Tela de abertura (vídeo) */
.intro-container {
  position: fixed;
  inset: 0;
  z-index: 999999;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.intro-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.unmute-button {
  position: absolute;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000000;
  padding: 12px 24px;
  border: none;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.95);
  color: #000;
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Toast */
.p-toast {
  z-index: 99999 !important;
}

.p-toast-message {
  border-radius: 12px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  background: #ffffff !important;
  opacity: 1 !important;
}

.p-toast-message-content {
  padding: 1rem !important;
}

.p-toast-summary,
.p-toast-detail {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

@media(max-width: 576px){
  .toast-style{
    width: 100%;
  }
}
</style>