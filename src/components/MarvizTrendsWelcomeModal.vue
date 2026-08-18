<template>
  <Teleport to="body">
    <Transition name="mvz-fade">
      <div
        v-if="isOpen"
        class="mvz-backdrop"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mvz-title"
      >
        <Transition name="mvz-pop" appear>
          <div v-if="isOpen" class="mvz-modal">

            <!-- Barra superior fixa: sempre visível, nunca corta -->
            <div class="mvz-topbar">
              <span class="mvz-topbar-count">{{ currentIndex + 1 }} / {{ slides.length }}</span>
              <button
                class="mvz-close"
                type="button"
                aria-label="Fechar"
                @click="dismissForNow"
              >
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            <!-- Viewport com os slides -->
            <div
              class="mvz-viewport"
              @touchstart.passive="onTouchStart"
              @touchend.passive="onTouchEnd"
            >
              <div
                class="mvz-track"
                :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
              >

                <!-- SLIDE 0: Apresentação do Marviz Trends -->
                <div class="mvz-slide mvz-slide-hero" style="overflow-x: hidden;">
                  <div class="mvz-hero-glow"></div>

                  <div class="mvz-badge">
                    <span class="material-symbols-outlined">storefront</span>
                    MARVIZ TRENDS
                  </div>

                  <h1 id="mvz-title" class="mvz-hero-title">
                    Bem-vindo à vitrine que vende por você
                  </h1>

                  <p class="mvz-hero-text">
                    O Marviz Trends é a sua nova plataforma de anúncios: os
                    varejistas encontram seus produtos no catálogo,
                    visualizam, avaliam e fazem pedidos com o seu produto!
                  </p>

                  <div class="mvz-stat-row">
                    <div class="mvz-stat">
                      <span class="material-symbols-outlined">bolt</span>
                      Pedido direto, sem cotação
                    </div>
                    <div class="mvz-stat">
                      <span class="material-symbols-outlined">trending_up</span>
                      Mais visibilidade nas lojas
                    </div>
                    <div class="mvz-stat">
                      <span class="material-symbols-outlined">payments</span>
                      Aumente seu faturamento
                    </div>
                  </div>

                  <p class="mvz-hero-hint">
                    Arraste ou use as setas para conhecer como funciona
                    <span class="material-symbols-outlined">arrow_forward</span>
                  </p>
                </div>

                <!-- SLIDES 1..6: um tópico por página -->
                <div
                  v-for="step in stepSlides"
                  :key="step.marker"
                  class="mvz-slide mvz-slide-step"
                >
                  <span class="mvz-step-marker">PASSO {{ step.marker }}</span>

                  <div class="mvz-step-icon" :class="`mvz-icon-${step.color}`">
                    <span class="material-symbols-outlined">{{ step.icon }}</span>
                  </div>

                  <h2 class="mvz-step-title">{{ step.title }}</h2>
                  <p class="mvz-step-text" v-html="step.description"></p>
                </div>

              </div>
            </div>

            <!-- Indicadores (bolinhas), clicáveis -->
            <div class="mvz-dots">
              <button
                v-for="(slide, i) in slides"
                :key="i"
                type="button"
                class="mvz-dot"
                :class="{ 'mvz-dot-active': i === currentIndex }"
                :aria-label="`Ir para página ${i + 1}`"
                @click="goTo(i)"
              ></button>
            </div>

            <!-- Rodapé: navegação + ações -->
            <div class="mvz-footer">
              <button
                type="button"
                class="mvz-btn-ghost mvz-btn-never"
                @click="dismissForever"
              >
                Não ver novamente
              </button>

              <div class="mvz-footer-nav">
                <button
                  v-if="!isFirst"
                  type="button"
                  class="mvz-btn-secondary"
                  @click="prev"
                >
                  <span class="material-symbols-outlined">arrow_back</span>
                  Voltar
                </button>

                <button
                  type="button"
                  class="mvz-btn-primary"
                  @click="isLast ? dismissForNow() : next()"
                >
                  {{ isLast ? 'Entendi!' : 'Próximo' }}
                  <span class="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>

          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
const STORAGE_KEY = 'marviz_trends_tutorial_dismissed';
const SWIPE_THRESHOLD = 40;

export default {
  name: 'MarvizTrendsWelcomeModal',

  data() {
    return {
      isOpen: false,
      currentIndex: 0,
      touchStartX: 0,
      touchEndX: 0,
      stepSlides: [
        {
          marker: '01',
          icon: 'add_a_photo',
          color: 'coral',
          title: 'Adicione uma foto de qualidade',
          description:
            'A foto é <strong>obrigatória</strong>. Use uma imagem bonita, com boa iluminação e que deixe claro do que se trata o produto — é a primeira coisa que o varejista vê.',
        },
        {
          marker: '02',
          icon: 'fact_check',
          color: 'navy',
          title: 'Preencha o máximo de especificações',
          description:
            'Código de barras, descrição, fabricante, categoria e preço. Quanto mais completo o anúncio, maior o seu ranking dentro da plataforma.',
        },
        {
          marker: '03',
          icon: 'military_tech',
          color: 'green',
          title: 'Capriche para subir no ranking',
          description:
            'As recomendações aos varejistas são automáticas e priorizam anúncios mais completos e caprichados. Qualidade do anúncio = mais chance de venda.',
        },
        {
          marker: '04',
          icon: 'local_offer',
          color: 'coral',
          title: 'Crie ofertas e promoções',
          description:
            'Produtos com promoção ganham mais destaque e atraem mais clientes. Use ofertas para aumentar suas vendas e sua visibilidade na plataforma.',
        },
        {
          marker: '05',
          icon: 'rocket_launch',
          color: 'navy',
          title: 'Envie novidades para "Lançamentos"',
          description:
            'Produtos novos enviados para a aba Lançamentos chamam a atenção dos varejistas que buscam novidades para a loja.',
        },
        {
          marker: '06',
          icon: 'inventory_2',
          color: 'green',
          title: 'Cadastre o máximo de produtos',
          description:
            'Quanto mais produtos no seu catálogo, mais chances de ser recomendado e receber pedidos direto dos varejistas.',
        },
      ],
    };
  },

  computed: {
    slides() {
      return [{ type: 'hero' }, ...this.stepSlides];
    },
    isFirst() {
      return this.currentIndex === 0;
    },
    isLast() {
      return this.currentIndex === this.slides.length - 1;
    },
  },

  mounted() {
    const dismissedForever = localStorage.getItem(STORAGE_KEY) === 'true';
    if (!dismissedForever) {
      this.isOpen = true;
    }
    window.addEventListener('keydown', this.onKeydown);
  },

  beforeUnmount() {
    window.removeEventListener('keydown', this.onKeydown);
  },

  methods: {
    next() {
      if (!this.isLast) this.currentIndex += 1;
    },
    prev() {
      if (!this.isFirst) this.currentIndex -= 1;
    },
    goTo(i) {
      this.currentIndex = i;
    },
    onKeydown(e) {
      if (!this.isOpen) return;
      if (e.key === 'ArrowRight') this.next();
      if (e.key === 'ArrowLeft') this.prev();
      if (e.key === 'Escape') this.dismissForNow();
    },
    onTouchStart(e) {
      this.touchStartX = e.changedTouches[0].clientX;
    },
    onTouchEnd(e) {
      this.touchEndX = e.changedTouches[0].clientX;
      const delta = this.touchEndX - this.touchStartX;
      if (Math.abs(delta) < SWIPE_THRESHOLD) return;
      if (delta < 0) this.next();
      else this.prev();
    },

    // Fecha só por agora: volta a aparecer na próxima vez que a página carregar
    dismissForNow() {
      this.isOpen = false;
    },

    // Fecha para sempre: grava a preferência e nunca mais mostra
    dismissForever() {
      localStorage.setItem(STORAGE_KEY, 'true');
      this.isOpen = false;
    },
  },
};
</script>

<style>
/* ==========================================================================
   Tokens de marca — Marviz Trends
   ========================================================================== */
.mvz-backdrop {
  --mvz-coral: #FF8049;
  --mvz-coral-deep: #E65D26;
  --mvz-navy: #14213D;
  --mvz-navy-soft: #1E2E52;
  --mvz-green: #16A34A;
  --mvz-cream: #FFF9F5;
  --mvz-ink: #1A1A2E;
  --mvz-slate: #5B6472;
}

/* ==========================================================================
   Backdrop + posicionamento centralizado
   ========================================================================== */
.mvz-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  width: 100%;
  height: 100%;
  background: rgba(10, 14, 26, 0.72);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(8px, 3vw, 32px);
  box-sizing: border-box;
}

/* ==========================================================================
   Modal — altura travada em unidades de viewport dinâmicas (dvh),
   para nunca cortar conteúdo em telas curtas / celular
   ========================================================================== */
.mvz-modal {
  position: relative;
  width: 100%;
  max-width: 640px;
  height: min(88dvh, 640px);
  max-height: min(88dvh, 640px);
  min-width: 0;
  contain: inline-size;
  background: var(--mvz-cream);
  border-radius: 22px;
  box-shadow: 0 30px 80px rgba(20, 33, 61, 0.45);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

/* Barra superior fixa (não faz parte do slide, então nunca é cortada) */
.mvz-topbar {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  box-sizing: border-box;
}

.mvz-topbar-count {
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: var(--mvz-slate);
}

.mvz-close {
  width: 36px;
  height: 36px;
  min-width: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(20, 33, 61, 0.08);
  color: var(--mvz-ink);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s ease;
}
.mvz-close:hover { background: rgba(20, 33, 61, 0.16); }
.mvz-close .material-symbols-outlined { font-size: 20px; }

/* ==========================================================================
   Viewport / track do slider
   ========================================================================== */
.mvz-viewport {
  flex: 1 1 auto;
  min-height: 0;
  width: 100%;
  overflow: hidden;
  touch-action: pan-y;
}

.mvz-track {
  display: flex;
  height: 100%;
  width: 100%;
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
}

.mvz-slide {
  flex: 0 0 100%;
  max-width: 100%;
  min-width: 0;
  height: 100%;
  box-sizing: border-box;
  overflow-y: auto;              /* slide rola internamente em vez de cortar texto */
  -webkit-overflow-scrolling: touch;
  padding: clamp(16px, 4vw, 32px) clamp(22px, 5vw, 40px) clamp(20px, 3vh, 28px);
}

/* ---- Slide hero (página 1) ---- */
.mvz-slide-hero {
  position: relative;
  color: #fff;
  background: linear-gradient(135deg, var(--mvz-coral) 0%, var(--mvz-coral-deep) 55%, var(--mvz-navy) 130%);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.mvz-hero-glow {
  position: absolute;
  top: -60px;
  right: -60px;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.25) 0%, transparent 70%);
  pointer-events: none;
}

.mvz-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
  padding: 7px 16px;
  border-radius: 50px;
  margin-bottom: 1rem;
  width: fit-content;
}
.mvz-badge .material-symbols-outlined { font-size: 18px; }

.mvz-hero-title {
  font-size: clamp(1.4rem, 3vw + 0.5rem, 2rem);
  font-weight: 800;
  line-height: 1.2;
  margin: 0 0 0.75rem 0;
  max-width: 100%;
  min-width: 0;
  overflow-wrap: break-word;
}

.mvz-hero-text {
  font-size: clamp(0.98rem, 0.4vw + 0.88rem, 1.08rem);
  line-height: 1.5;
  opacity: 0.97;
  margin: 0 0 1.3rem 0;
  max-width: 100%;
  min-width: 0;
  overflow-wrap: break-word;
}
.mvz-hero-text strong { font-weight: 800; }

.mvz-stat-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 1.4rem;
}

.mvz-stat {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 8px 13px;
  border-radius: 12px;
  min-width: 0;
}
.mvz-stat .material-symbols-outlined { font-size: 19px; }

.mvz-hero-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.88rem;
  font-weight: 700;
  opacity: 0.85;
  margin: 0;
}
.mvz-hero-hint .material-symbols-outlined { font-size: 18px; }

/* ---- Slides de passo (páginas 2 a 7) ---- */
.mvz-slide-step {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  text-align: left;
}

.mvz-step-marker {
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: var(--mvz-coral-deep);
  margin-bottom: 14px;
}

.mvz-step-icon {
  width: clamp(56px, 10vw, 72px);
  height: clamp(56px, 10vw, 72px);
  min-width: 56px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  margin-bottom: 18px;
  flex-shrink: 0;
}
.mvz-step-icon .material-symbols-outlined { font-size: clamp(28px, 5vw, 36px); }

.mvz-icon-coral { background: linear-gradient(135deg, var(--mvz-coral), var(--mvz-coral-deep)); }
.mvz-icon-navy  { background: linear-gradient(135deg, var(--mvz-navy-soft), var(--mvz-navy)); }
.mvz-icon-green { background: linear-gradient(135deg, #22C55E, var(--mvz-green)); }

.mvz-step-title {
  font-size: clamp(1.25rem, 2vw + 0.7rem, 1.65rem);
  font-weight: 800;
  color: var(--mvz-ink);
  line-height: 1.25;
  margin: 0 0 12px 0;
  max-width: 100%;
  min-width: 0;
  overflow-wrap: break-word;
}

.mvz-step-text {
  font-size: clamp(1rem, 0.5vw + 0.9rem, 1.1rem);
  line-height: 1.6;
  color: var(--mvz-slate);
  margin: 0;
  max-width: 100%;
  min-width: 0;
  overflow-wrap: break-word;
}
.mvz-step-text strong { color: var(--mvz-ink); font-weight: 800; }

/* ==========================================================================
   Indicadores (bolinhas)
   ========================================================================== */
.mvz-dots {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 4px 0 10px;
}

.mvz-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: rgba(20, 33, 61, 0.18);
  cursor: pointer;
  padding: 0;
  transition: all 0.25s ease;
}
.mvz-dot-active {
  width: 22px;
  border-radius: 5px;
  background: var(--mvz-coral-deep);
}

/* ==========================================================================
   Rodapé — navegação e ações
   ========================================================================== */
.mvz-footer {
  flex: 0 0 auto;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 0 clamp(16px, 4vw, 32px) clamp(14px, 3vh, 22px);
  box-sizing: border-box;
}

.mvz-footer-nav {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}

.mvz-btn-never {
  font-size: 0.92rem;
}

.mvz-btn-ghost {
  background: transparent;
  border: none;
  color: var(--mvz-slate);
  font-weight: 700;
  padding: 10px 8px;
  cursor: pointer;
  border-radius: 10px;
  text-decoration: underline;
  text-underline-offset: 3px;
  white-space: nowrap;
}
.mvz-btn-ghost:hover { color: var(--mvz-ink); background: rgba(20, 33, 61, 0.05); }

.mvz-btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(20, 33, 61, 0.06);
  color: var(--mvz-ink);
  border: none;
  font-weight: 700;
  font-size: 0.98rem;
  padding: 12px 18px;
  border-radius: 12px;
  cursor: pointer;
  white-space: nowrap;
}
.mvz-btn-secondary:hover { background: rgba(20, 33, 61, 0.12); }
.mvz-btn-secondary .material-symbols-outlined { font-size: 19px; }

.mvz-btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  background: linear-gradient(135deg, var(--mvz-coral), var(--mvz-coral-deep));
  color: #fff;
  border: none;
  font-weight: 800;
  font-size: 0.98rem;
  padding: 12px 20px;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(230, 93, 38, 0.35);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  min-width: 0;
  white-space: nowrap;
}
.mvz-btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 30px rgba(230, 93, 38, 0.42);
}
.mvz-btn-primary .material-symbols-outlined { font-size: 19px; }

/* ==========================================================================
   Transições de entrada/saída do modal
   ========================================================================== */
.mvz-fade-enter-active, .mvz-fade-leave-active { transition: opacity 0.2s ease; }
.mvz-fade-enter-from, .mvz-fade-leave-to { opacity: 0; }

.mvz-pop-enter-active { transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.22, 1, 0.36, 1); }
.mvz-pop-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.mvz-pop-enter-from, .mvz-pop-leave-to { opacity: 0; transform: translateY(16px) scale(0.97); }

@media (prefers-reduced-motion: reduce) {
  .mvz-fade-enter-active, .mvz-fade-leave-active,
  .mvz-pop-enter-active, .mvz-pop-leave-active,
  .mvz-track {
    transition: none !important;
  }
}

/* ==========================================================================
   Responsividade — telas estreitas (celular)
   ========================================================================== */
@media (max-width: 480px) {
  .mvz-modal { border-radius: 18px; }
  .mvz-slide { padding-left: 20px; padding-right: 20px; }
  .mvz-footer {
    flex-direction: column-reverse;
    align-items: stretch;
  }
  .mvz-footer-nav {
    margin-left: 0;
    justify-content: stretch;
  }
  .mvz-btn-secondary,
  .mvz-btn-primary {
    flex: 1 1 auto;
    justify-content: center;
  }
  .mvz-btn-never {
    align-self: center;
  }

  .mvz-hero-text{
    font-size: 14px;
  }

  .mvz-hero-title{
    font-size: 18px;
  }
}

/* ==========================================================================
   Responsividade — eixo Y (telas curtas / celular em paisagem)
   ========================================================================== */
@media (max-height: 700px) {
  .mvz-modal { height: min(94dvh, 640px); max-height: min(94dvh, 640px); }
  .mvz-step-icon { margin-bottom: 12px; }
  .mvz-hero-hint { display: none; }
}

@media (max-height: 560px) {
  .mvz-topbar { padding: 8px 14px; }
  .mvz-slide { padding-top: 10px; padding-bottom: 10px; }
  .mvz-step-icon {
    width: 48px; height: 48px; min-width: 48px;
    border-radius: 14px; margin-bottom: 8px;
  }
  .mvz-step-icon .material-symbols-outlined { font-size: 24px; }
  .mvz-step-marker { margin-bottom: 8px; }
  .mvz-stat-row { margin-bottom: 0.8rem; }
  .mvz-badge { margin-bottom: 0.6rem; }
  .mvz-dots { padding: 2px 0 6px; }
}
</style>