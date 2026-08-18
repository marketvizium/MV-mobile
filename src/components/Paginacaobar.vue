<template>
  <div class="tp-pagination">
    <button
      class="tp-pg-btn"
      :disabled="paginacao.pagina_atual <= 1"
      @click="$emit('ir', paginacao.pagina_atual - 1)"
    >
      <span class="material-symbols-outlined">chevron_left</span>
    </button>
    <span class="tp-pg-info poppins-medium">
      Página {{ paginacao.pagina_atual }} de {{ paginacao.total_paginas }}
    </span>
    <button
      class="tp-pg-btn"
      :disabled="paginacao.pagina_atual >= paginacao.total_paginas"
      @click="$emit('ir', paginacao.pagina_atual + 1)"
    >
      <span class="material-symbols-outlined">chevron_right</span>
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';

interface Paginacao {
  pagina_atual: number;
  itens_por_pagina: number;
  total_registros: number;
  total_paginas: number;
}

export default defineComponent({
  name: 'PaginacaoBar',
  props: {
    paginacao: { type: Object as PropType<Paginacao>, required: true }
  },
  emits: ['ir']
});
</script>

<style scoped>
.tp-pagination { display: flex; align-items: center; justify-content: center; gap: 14px; margin-top: 20px; }
.tp-pg-btn {
  width: 34px; height: 34px; border-radius: 50%; border: 1px solid var(--border, #e2e8f0);
  background: var(--bg-card, #fff); color: var(--text1, #1e293b); display: flex; align-items: center;
  justify-content: center; cursor: pointer; box-shadow: var(--shadow, 0 4px 6px -1px rgba(0,0,0,0.05));
}
.tp-pg-btn:disabled { opacity: .4; cursor: not-allowed; }
.tp-pg-info { font-size: 12px; color: var(--text2, #64748b); }
</style>