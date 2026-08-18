<template>
    <div class="news-banner-container">
        <Carousel 
            :value="banners" 
            :numVisible="1" 
            :numScroll="1" 
            :circular="true" 
            :autoplayInterval="5000"
            :showNavigators="false" 
            class="direct-carousel"
        >
            <template #item="slotProps">
            <div class="news-slide" :class="slotProps.data.colorClass">
                <div class="news-body">
                <div class="news-badge">
                    <span class="material-symbols-outlined">{{ slotProps.data.badgeIcon }}</span>
                    {{ slotProps.data.badgeLabel }}
                </div>
                        
                <h2 class="news-title">{{ slotProps.data.title }}</h2>
                <p class="news-text">{{ slotProps.data.description }}</p>
                        
                <div class="news-footer">
                    <button class="news-btn">
                      <span class="news-btn-label">
                        {{ slotProps.data.buttonLabel }}
                      </span>
                    </button>
                    <span class="news-time">
                          Atualizado em: {{ slotProps.data.atualizado_em }}
                      </span>
                </div>
                </div>

                <div class="news-bg-icon">
                <span class="material-symbols-outlined">{{ slotProps.data.icon }}</span>
                </div>
            </div>
            </template>
        </Carousel>
    </div>
</template>
<script>

import { Carousel } from 'primevue';


export default{
    name:'BannerSite',
    
    components:{
        Carousel
    },

    data(){
        return{
            banners: [
                {
                    title: "O que é o Marviz Trends?",
                    description: "A nova plataforma de anúncios do Marviz: seus produtos ficam visíveis para os varejistas, que compram e emitem pedidos diretos, sem precisar cotar com outros vendedores. Mais visibilidade e mais faturamento para a sua loja.",
                    icon: "storefront",
                    badgeIcon: "campaign",
                    badgeLabel: "GUIA MARVIZ TRENDS",
                    buttonLabel: "Conhecer o Marviz Trends",
                    atualizado_em: "24/07/2026",
                    colorClass: "bg-orange"
                },
                {
                    title: "Capriche na foto do produto",
                    description: "A foto é obrigatória e é a primeira coisa que o varejista vê. Use uma imagem bonita, bem iluminada e que deixe claro do que se trata o produto para atrair mais pedidos.",
                    icon: "add_a_photo",
                    badgeIcon: "tips_and_updates",
                    badgeLabel: "PASSO 1 · FOTO DO PRODUTO",
                    buttonLabel: "Adicionar foto do produto",
                    atualizado_em: "24/07/2026",
                    colorClass: "bg-dark"
                },
                {
                    title: "Preencha todas as especificações",
                    description: "Código de barras, descrição, fabricante, categoria e preço: quanto mais completo o anúncio, maior o seu ranking. Os produtos são recomendados aos varejistas com base na qualidade do anúncio.",
                    icon: "fact_check",
                    badgeIcon: "tips_and_updates",
                    badgeLabel: "PASSO 2 · ESPECIFICAÇÕES",
                    buttonLabel: "Completar especificações",
                    atualizado_em: "24/07/2026",
                    colorClass: "bg-blue"
                },
                {
                    title: "Crie ofertas e promoções",
                    description: "Produtos com promoção ganham mais destaque e atraem mais clientes. Use ofertas para aumentar suas vendas e a visibilidade do seu catálogo na plataforma.",
                    icon: "local_offer",
                    badgeIcon: "tips_and_updates",
                    badgeLabel: "PASSO 3 · OFERTAS",
                    buttonLabel: "Criar promoção",
                    atualizado_em: "24/07/2026",
                    colorClass: "bg-green"
                },
                {
                    title: 'Envie novidades para "Lançamentos"',
                    description: "Produtos novos enviados para a aba Lançamentos chamam a atenção dos varejistas que estão sempre em busca de novidades para a loja.",
                    icon: "rocket_launch",
                    badgeIcon: "tips_and_updates",
                    badgeLabel: "PASSO 4 · LANÇAMENTOS",
                    buttonLabel: "Enviar lançamento",
                    atualizado_em: "24/07/2026",
                    colorClass: "bg-teal"
                },
                {
                    title: "Cadastre o máximo de produtos",
                    description: "Quanto mais produtos no seu catálogo, mais chances de ser recomendado e de receber pedidos direto dos varejistas. Amplie seu catálogo sempre que puder.",
                    icon: "inventory_2",
                    badgeIcon: "tips_and_updates",
                    badgeLabel: "PASSO 5 · CATÁLOGO",
                    buttonLabel: "Cadastrar produtos",
                    atualizado_em: "24/07/2026",
                    colorClass: "bg-purple"
                }
            ],
        }
    },
    methods:{

    }
}
</script>

<style>
/* ==========================================================================
   PRINCÍPIO GERAL DESTE ARQUIVO:
   O TAMANHO É SEMPRE DITADO PELO CONTAINER, NUNCA PELO CONTEÚDO.
   Isso é garantido em 3 camadas, em TODOS os elementos da cadeia:
     1) width: 100% + max-width: 100%   -> trava a largura no valor do pai
     2) min-width: 0                     -> remove o "tamanho mínimo de
                                             conteúdo" que o flexbox aplica
                                             por padrão (a causa raiz do bug)
     3) contain: inline-size             -> proíbe o navegador de deixar o
                                             conteúdo interno influenciar a
                                             largura do próprio elemento,
                                             não importa quanto texto/padding
                                             seja adicionado depois
   ========================================================================== */

.news-banner-container {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.news-banner-container * {
  box-sizing: border-box;
}

/* Trava todos os elementos internos do PrimeVue Carousel na largura do pai */
:deep(.p-carousel),
:deep(.p-carousel-content),
:deep(.p-carousel-container),
:deep(.p-carousel-items-content),
:deep(.p-carousel-items-container),
:deep(.p-carousel-item) {
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
  box-sizing: border-box;
}

:deep(.p-carousel-content) {
  overflow: hidden;
}

/* ==========================================================================
   Slide Interno
   ========================================================================== */
.news-slide {
  position: relative;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  contain: inline-size;     /* conteúdo NUNCA aumenta a largura do slide */
  min-height: clamp(220px, 32vw, 380px);
  margin-left: 5px;
  margin-right: 5px;
  display: flex;
  align-items: center;
  color: white;
  border-radius: 16px;
  overflow: hidden;
  box-sizing: border-box;
  margin: 0 4px;
  padding: clamp(1.25rem, 4vw, 2.5rem);
}

/* Indicadores (bolinhas) */
:deep(.p-carousel-indicators) {
  padding: 1rem 0;
  justify-content: center;
  gap: 10px;
  list-style: none;
  flex-wrap: wrap;
}

:deep(.p-carousel-indicator button) {
  width: 12px !important;
  height: 12px !important;
  border-radius: 50% !important;
  border: none !important;
  padding: 0 !important;
  margin: 0 !important;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 1;
}

:deep(.p-carousel-indicator.p-highlight button) {
  background-color: #FF8049 !important;
  width: 30px !important;
  border-radius: 6px !important;
}

/* Variações de Cores (Gradientes) */
.bg-orange { background: linear-gradient(135deg, #FF8049 0%, #E65D26 100%); }
.bg-dark   { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); }
.bg-blue   { background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); }
.bg-green  { background: linear-gradient(135deg, #10b981 0%, #064e3b 100%); }
.bg-teal   { background: linear-gradient(135deg, #14b8a6 0%, #0f766e 100%); }
.bg-purple { background: linear-gradient(135deg, #8b5cf6 0%, #5b21b6 100%); }

/* ==========================================================================
   Conteúdo
   ========================================================================== */
.news-body {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: min(65%, 560px);
  min-width: 0;
  contain: inline-size;     /* título/texto/botão não expandem este bloco */
  overflow: hidden;
}

.news-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
  font-size: 10px;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5px);
  padding: 5px 12px;
  border-radius: 50px;
  margin-bottom: 1rem;
}

.news-title {
  font-size: clamp(1.15rem, 2.2vw + 0.5rem, 2rem);
  font-weight: 800;
  margin: 0 0 0.5rem 0;
  line-height: 1.2;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.news-text {
  font-size: clamp(0.85rem, 0.6vw + 0.65rem, 1rem);
  opacity: 0.9;
  margin-bottom: 1.5rem;
  line-height: 1.5;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow-wrap: anywhere;
  word-break: break-word;
}

/* Footer: precisa existir FORA do media query para não depender de breakpoint */
.news-footer {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  gap: 10px;
}

.news-btn {
  background: #ffffff;
  color: #1e293b;
  border: none;
  height: 40px;
  padding: 0 clamp(12px, 2vw, 20px);
  border-radius: 8px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  font-size: clamp(0.8rem, 1.5vw, 0.95rem);
  max-width: 100%;
  min-width: 0;
  flex-shrink: 1;
}

.news-btn-label {
  min-width: 0;
  overflow-wrap: anywhere;
  white-space: normal;
}

.news-time {
  display: inline-block;
  font-size: 0.8rem;
  opacity: 0.85;
  min-width: 0;
  max-width: 100%;
  overflow-wrap: anywhere;
  flex-shrink: 1;
}

/* Ícone de Fundo */
.news-bg-icon {
  position: absolute;
  right: -5%;
  bottom: -15%;
  z-index: 1;
  opacity: 0.1;
  pointer-events: none;
}

.news-bg-icon span {
  font-size: clamp(90px, 18vw, 200px) !important;
}

/* ==========================================================================
   Responsividade — ajustes visuais apenas; a LARGURA já está travada acima
   independentemente de qualquer valor de fonte/padding que venha a mudar.
   ========================================================================== */
@media (max-width: 992px) {
  .news-body {
    max-width: 75%;
  }
}

@media (max-width: 768px) {
  .news-slide {
    min-height: 280px;
  }
  .news-body {
    max-width: 100%;
  }
}

@media (max-width: 576px) {
  .news-slide {
    min-height: 420px;
    text-align: center;
    justify-content: center;
  }

  .news-body {
    max-width: 100%;
  }

  .news-footer {
    flex-direction: column;
    align-items: center;
  }
}

@media (max-width: 380px) {
  .news-slide {
    padding: 1.25rem;
    min-height: 380px;
    border-radius: 12px;
  }

  .news-btn {
    width: 100%;
  }
}
</style>