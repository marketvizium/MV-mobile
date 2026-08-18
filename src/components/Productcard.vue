<template>
  <div class="pcard" @click="$emit('open', produto)">

    <div class="pcard-media">
      <img
        :src="imagemPrincipal"
        :alt="produto.nome"
        class="pcard-img"
        loading="lazy"
        @error="onImgError"
      />

      <!-- Badges superiores -->
      <div class="pcard-badges">
        <span v-if="temDesconto" class="pbadge pbadge-red">-{{ percentualDesconto }}%</span>
        <span v-if="produto.eh_lancamento" class="pbadge pbadge-green">Novo</span>
        <span v-if="produto.destaque" class="pbadge pbadge-dark">Destaque</span>
      </div>

      <!-- Ações rápidas (favorito / visualizar) -->
      <div class="pcard-quick-actions">
        <button
          class="pqa-btn"
          :class="{ active: isFavorite }"
          @click.stop="$emit('toggle-favorite', produto)"
          title="Favoritar"
        >
          <span class="material-symbols-outlined">{{ isFavorite ? 'favorite' : 'favorite_border' }}</span>
        </button>
        <button class="pqa-btn" @click.stop="$emit('open', produto)" title="Visualizar">
          <span class="material-symbols-outlined">visibility</span>
        </button>
      </div>

      <!-- Overlay de ação rápida (estilo "Add To Cart") -->
      <div class="pcard-overlay">
        <button class="pcard-overlay-btn poppins-medium" @click.stop="$emit('pedido-direto', produto)">
          <span class="material-symbols-outlined" style="font-size:15px">bolt</span>
          Pedido Direto
        </button>
      </div>
    </div>

    <div class="pcard-body">
      <div class="pcard-top-row">
        <span v-if="produto.categoria" class="pcard-cat">{{ produto.categoria }}</span>
        <span
          v-if="produto.ativo === false"
          class="pcard-inactive poppins-medium"
        >Inativo</span>
      </div>

      <div class="pcard-nome poppins-medium">{{ produto.nome || 'Produto sem nome' }}</div>

      <div class="pcard-preco-row">
        <template v-if="temDesconto">
          <span class="pcard-preco-final poppins-semibold">{{ formatBRL(precoFinal) }}</span>
          <span class="pcard-preco-original">{{ formatBRL(precoBase) }}</span>
        </template>
        <template v-else>
          <span class="pcard-preco-final poppins-semibold">{{ formatBRL(precoBase) }}</span>
        </template>
      </div>

      <!-- Avaliação (0 a 5 estrelas) -->
      <div class="pcard-rating" :title="`Avaliação: ${notaAvaliacao.toFixed(1)}/5`">
        <span
          v-for="(icone, i) in estrelasIcones(notaAvaliacao)"
          :key="i"
          class="material-symbols-outlined pcard-star"
          :class="{ filled: icone !== 'star_border' }"
        >{{ icone }}</span>
        <span class="pcard-rating-txt">{{ notaAvaliacao.toFixed(1) }}</span>
      </div>

      <!-- Métricas: curtidas, compartilhamentos, visualizações -->
      <div class="pcard-metrics">
        <span class="pcard-metric" title="Curtidas">
          <span class="material-symbols-outlined">favorite</span>
          {{ formatCount(statValue(produto, 'curtidas')) }}
        </span>
        <span class="pcard-metric" title="Compartilhamentos">
          <span class="material-symbols-outlined">share</span>
          {{ formatCount(statValue(produto, 'compartilhamentos')) }}
        </span>
        <span class="pcard-metric" title="Visualizações">
          <span class="material-symbols-outlined">visibility</span>
          {{ formatCount(statValue(produto, 'visualizacoes')) }}
        </span>
      </div>

      <!-- Completude do anúncio -->
      <div class="pcard-completude" :title="`Completude do anúncio: ${produto.completude_score ?? 0}/8`">
        <div class="pcard-completude-track">
          <div
            class="pcard-completude-fill"
            :style="{ width: (((produto.completude_score ?? 0) / 8) * 100) + '%' }"
          ></div>
        </div>
        <span class="pcard-completude-txt">{{ produto.completude_score ?? 0 }}/8</span>
      </div>

      <div class="pcard-actions">
        <button class="pcard-btn pcard-btn-outline poppins-medium" @click.stop="$emit('add-cotacao', produto)">
          <span class="material-symbols-outlined" style="font-size:15px">request_quote</span>
          Cotação
        </button>
        <button class="pcard-btn pcard-btn-solid poppins-medium" @click.stop="$emit('pedido-direto', produto)">
          <span class="material-symbols-outlined" style="font-size:15px">shopping_cart_checkout</span>
          Pedido
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';

export default defineComponent({
  name: 'ProductCard',

  props: {
    produto: {
      type: Object as PropType<any>,
      required: true
    },
    isFavorite: {
      type: Boolean,
      default: false
    }
  },

  emits: ['open', 'toggle-favorite', 'add-cotacao', 'pedido-direto'],

  data() {
    return {
      imgFallback: false
    };
  },

  computed: {
    imagemPrincipal(): string {
      if (this.imgFallback) return this.placeholder;
      return (
        this.produto.foto_capa ||
        this.produto.foto_1 ||
        this.produto.foto_2 ||
        this.produto.foto_3 ||
        this.placeholder
      );
    },

    placeholder(): string {
      return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="100%" height="100%" fill="#f1f3f5"/><text x="50%" y="50%" font-family="sans-serif" font-size="14" fill="#94a3b8" text-anchor="middle" dy=".3em">Sem imagem</text></svg>`
      );
    },

    // ── Preço ──────────────────────────────────────────────
    // Obs: o payload do backend ainda não expõe explicitamente o nome do
    // campo de preço-base; testamos os nomes mais prováveis com fallback.
    precoBase(): number {
      const p = this.produto;
      const valor = p.preco ?? p.valor ?? p.preco_venda ?? p.valor_venda ?? p.preco_unitario ?? 0;
      return Number(valor) || 0;
    },

    temDesconto(): boolean {
      const p = this.produto;
      if (p.promocao_desconto === null || p.promocao_desconto === undefined) return false;
      const agora = Date.now();
      const inicio = p.desconto_inicio ? Number(p.desconto_inicio) : null;
      const fim = p.desconto_fim ? Number(p.desconto_fim) : null;
      if (inicio && fim) return agora >= inicio && agora <= fim;
      return true;
    },

    percentualDesconto(): number {
      const v = Number(this.produto.promocao_desconto) || 0;
      // Se vier como fração (0-1), converte para percentual
      return v > 0 && v <= 1 ? Math.round(v * 100) : Math.round(v);
    },

    precoFinal(): number {
      if (!this.temDesconto) return this.precoBase;
      const desconto = this.percentualDesconto / 100;
      return Math.max(this.precoBase * (1 - desconto), 0);
    },

    // ── Avaliação (0 a 5) ──────────────────────────────────
    // Testamos os nomes de campo mais prováveis; ajuste conforme o payload real.
    notaAvaliacao(): number {
      const p = this.produto;
      const valor = p.avaliacao ?? p.nota_media ?? p.media_avaliacao ?? p.rating ?? p?.metricas?.avaliacao ?? 0;
      return Math.min(5, Math.max(0, Number(valor) || 0));
    }
  },

  methods: {
    formatBRL(v: number): string {
      return Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    },
    onImgError() {
      this.imgFallback = true;
    },

    // Lê uma métrica do produto testando os formatos mais prováveis do payload
    // (campo plano, ou dentro de `metricas`/`estatisticas`/`stats`).
    statValue(produto: any, campo: string): number {
      if (!produto) return 0;
      const candidatos = [
        produto?.[campo],
        produto?.metricas?.[campo],
        produto?.estatisticas?.[campo],
        produto?.stats?.[campo]
      ];
      const achou = candidatos.find((v) => v !== undefined && v !== null);
      return Number(achou) || 0;
    },

    // Formata contagens grandes: 1200 -> "1,2k", 3400000 -> "3,4M"
    formatCount(v: number): string {
      const n = Number(v) || 0;
      if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace('.0', '').replace('.', ',') + 'M';
      if (n >= 1_000) return (n / 1_000).toFixed(1).replace('.0', '').replace('.', ',') + 'k';
      return String(n);
    },

    // Converte uma nota 0-5 em 5 ícones (cheio / meio / vazio)
    estrelasIcones(nota: number): string[] {
      const n = Math.min(5, Math.max(0, Number(nota) || 0));
      const icones: string[] = [];
      for (let i = 1; i <= 5; i++) {
        if (n >= i) icones.push('star');
        else if (n >= i - 0.5) icones.push('star_half');
        else icones.push('star_border');
      }
      return icones;
    }
  }
});
</script>

<style scoped>
.pcard {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow .2s ease, transform .2s ease, border-color .2s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
}
.pcard:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--border2);
  transform: translateY(-2px);
}

.pcard-media {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  background: var(--bg-el);
  overflow: hidden;
}
.pcard-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform .35s ease;
}
.pcard:hover .pcard-img { transform: scale(1.06); }

.pcard-badges {
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 2;
}
.pbadge {
  font-size: 10px;
  font-weight: 800;
  padding: 3px 7px;
  border-radius: 5px;
  color: #fff;
  letter-spacing: .2px;
}
.pbadge-red  { background: var(--red); }
.pbadge-green{ background: var(--green); }
.pbadge-dark { background: var(--text1); }

.pcard-quick-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  z-index: 2;
}
.pqa-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.92);
  color: var(--text2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: var(--shadow);
}
.pqa-btn .material-symbols-outlined { font-size: 16px; }
.pqa-btn.active { color: var(--red); }
.pqa-btn:hover { background: #fff; }

.pcard-overlay {
  position: absolute;
  left: 0; right: 0; bottom: 0;
  padding: 8px;
  background: linear-gradient(0deg, rgba(0,0,0,0.55), transparent);
  opacity: 0;
  transform: translateY(6px);
  transition: opacity .2s ease, transform .2s ease;
  z-index: 2;
}
.pcard:hover .pcard-overlay { opacity: 1; transform: translateY(0); }
.pcard-overlay-btn {
  width: 100%;
  background: var(--text1);
  color: #fff;
  border: none;
  border-radius: 7px;
  padding: 7px 0;
  font-size: 11.5px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
}

.pcard-body {
  padding: 10px 11px 11px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.pcard-top-row { display: flex; align-items: center; justify-content: space-between; gap: 6px; }
.pcard-cat {
  font-size: 10px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: .3px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pcard-inactive {
  font-size: 9.5px;
  color: var(--red);
  background: var(--red2);
  padding: 1px 6px;
  border-radius: 4px;
  white-space: nowrap;
}

.pcard-nome {
  font-size: 12.5px;
  color: var(--text1);
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 32px;
}

.pcard-preco-row { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
.pcard-preco-final { font-size: 15px; color: #ff8049; }
.pcard-preco-original { font-size: 11.5px; color: var(--muted); text-decoration: line-through; }

.pcard-rating { display: flex; align-items: center; gap: 2px; }
.pcard-star {
  font-size: 14px !important;
  color: var(--border, #e2e8f0);
  font-variation-settings: 'FILL' 0, 'wght' 400, 'opsz' 20;
}
.pcard-star.filled {
  color: #ffb100;
  font-variation-settings: 'FILL' 1, 'wght' 400, 'opsz' 20;
}
.pcard-rating-txt { font-size: 10.5px; color: var(--muted); margin-left: 3px; }

.pcard-metrics {
  display: flex;
  align-items: center;
  gap: 12px;
}
.pcard-metric {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 10.5px;
  color: var(--muted);
}
.pcard-metric .material-symbols-outlined { font-size: 14px !important; }

.pcard-completude { display: flex; align-items: center; gap: 6px; }
.pcard-completude-track {
  flex: 1;
  height: 4px;
  border-radius: 3px;
  background: var(--bg-el2);
  overflow: hidden;
}
.pcard-completude-fill {
  height: 100%;
  background: var(--green);
  border-radius: 3px;
}
.pcard-completude-txt { font-size: 9.5px; color: var(--muted); white-space: nowrap; }

.pcard-actions { display: flex; gap: 6px; margin-top: 2px; }
.pcard-btn {
  flex: 1;
  border-radius: 7px;
  padding: 7px 4px;
  font-size: 10.5px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: background .15s ease;
  background: #ff8049;
}
.pcard-btn-outline {
  background: var(--bg-card);
  border-color: var(--border);
  color: var(--text2);
}
.pcard-btn-outline:hover { background: var(--bg-el); }
.pcard-btn-solid {
  background: #ff8049;
  color: #fff;
}
.pcard-btn-solid:hover { background: #ff8049; }
</style>