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
                    <span class="material-symbols-outlined">campaign</span>
                    NOTICIÁRIO DA LOJA
                </div>
                        
                <h2 class="news-title">{{ slotProps.data.title }}</h2>
                <p class="news-text">{{ slotProps.data.description }}</p>
                        
                <div class="news-footer">
                    <button class="news-btn">
                    {{ slotProps.data.buttonLabel }}
                    <span class="material-symbols-outlined">chevron_right</span>
                    </button>
                    <span class="news-time">Atualizado em: {{slotProps.data.atualizado_em}}</span>
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
    component:{
        Carousel
    },

    data(){
        return{
            banners: [
                {
                    title: "Novidade: Marviz Trends chegou!",
                    description: "Conheça a nova plataforma de anúncios para vendedores. Encontre produtos em destaque, ofertas exclusivas e descontos especiais publicados pelos fornecedores. Adicione os itens encontrados diretamente às suas cotações ou realize pedidos de forma prática.",
                    icon: "local_offer",
                    buttonLabel: "Explorar Marviz Trends",
                    atualizado_em: "12/10/2026",
                    colorClass: "bg-orange"
                },
                {
                    title: "Novo: Pedido Direto",
                    description: "Agora ficou ainda mais rápido abastecer sua loja. Envie pedidos diretamente aos vendedores sem precisar abrir uma cotação. O vendedor recebe o pedido para faturamento imediatamente, agilizando todo o processo de compra.",
                    icon: "shopping_cart_checkout",
                    buttonLabel: "Criar Pedido Direto",
                    atualizado_em: "12/10/2026",
                    colorClass: "bg-dark"
                },
                {
                    title: "Encontre fornecedores e faça cotações",
                    description: "Pesquise vendedores cadastrados na plataforma, solicite cotações para centenas de produtos e compare as melhores ofertas antes de fechar negócio. Mais praticidade, economia e transparência para sua loja.",
                    icon: "request_quote",
                    buttonLabel: "Iniciar Cotação",
                    atualizado_em: "12/10/2026",
                    colorClass: "bg-blue"
                },
                {
                    title: "Mais oportunidades para sua loja",
                    description: "Acompanhe novidades da plataforma, descubra novos fornecedores, fortaleça suas parcerias comerciais e mantenha seu estoque competitivo realizando cotações sempre que precisar.",
                    icon: "storefront",
                    buttonLabel: "Conhecer Recursos",
                    atualizado_em: "12/10/2026",
                    colorClass: "bg-green"
                }
            ],
        }
    },
    methods:{

    }
}
</script>

<style>
/* Container Geral - O segredo é o max-width e overflow hidden */
.news-banner-container {
  width: 100%;
  box-sizing: border-box;
  overflow: hidden; /* Garante que nada saia daqui */
}

/* Forçar o Carousel a respeitar o container pai */
:deep(.p-carousel) {
  width: 100%;
}

:deep(.p-carousel-content) {
  overflow: hidden;
}

/* Slide Interno */
.news-slide {
  position: relative;
  min-height: 320px;
  display: flex;
  align-items: center;
  color: white;
  border-radius: 16px;
  overflow: hidden;
  box-sizing: border-box;
  margin: 0 4px; /* Pequeno respiro entre os slides se houver mais de um visível */
}

/* Ajuste das Bolinhas (Indicadores) */
:deep(.p-carousel-indicators) {
  padding: 1rem 0;
  justify-content: center;
  gap: 10px;
  list-style: none; /* Remove pontos de lista indesejados */
}

/* Reset do botão padrão do PrimeVue para as bolinhas */
:deep(.p-carousel-indicator button) {
  width: 12px !important;
  height: 12px !important;
  border-radius: 50% !important;
  border: none !important;
  padding: 0 !important;
  margin: 0 !important;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 1; /* Garante que a cor apareça */
}

/* Bolinha Ativa preenchida com #FF8049 */
:deep(.p-carousel-indicator.p-highlight button) {
  background-color: #FF8049 !important;
  width: 30px !important; /* Efeito pílula */
  border-radius: 6px !important;
}

/* Variações de Cores (Gradientes) */
.bg-orange { background: linear-gradient(135deg, #FF8049 0%, #E65D26 100%); }
.bg-dark   { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); }
.bg-blue   { background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); }
.bg-green  { background: linear-gradient(135deg, #10b981 0%, #064e3b 100%); }

/* Conteúdo */
.news-body {
  position: relative;
  z-index: 2;
  transform: translateX(40px);
  max-width: 65%;
}

.news-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5px);
  padding: 5px 12px;
  border-radius: 50px;
  margin-bottom: 1rem;
}

.news-title {
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 0.5rem 0;
  line-height: 1.2;
}

.news-text {
  font-size: 1rem;
  opacity: 0.9;
  margin-bottom: 1.5rem;
}

.news-btn {
  background: #ffffff;
  color: #1e293b;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
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
  font-size: 200px !important;
}

.news-footer{
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Responsividade */
@media (max-width: 768px) {
  .news-slide {
    padding: 1.5rem;
    min-height: 300px;
  }
  .news-body {
    max-width: 100%;
  }
  .news-title {
    font-size: 1.5rem;
  }
  .news-bg-icon span {
    font-size: 120px !important;
  }
}


@media(max-width: 576px){
.news-slide {
    padding: 0px;
    margin: 0px;
    text-wrap:inherit;
    min-height: 500px;
    justify-content: center;
    text-align: center;
  }

  .news-body{
    padding: 0px;
    margin: 0px;
  }

   .news-title {
    font-size: 1.3rem;
  }

  .news-footer{
    display: flex;
    flex-direction: column;
  }

  .news-body{
    transform: translateX(0px);
    padding: 40px;
  }
}
</style>