<template>
  <ion-modal
    :is-open="isOpen"
    :backdrop-dismiss="true"
    class="ept-modal"
    @didDismiss="fechar"
  >
    <div class="ept-wrapper">

      <!-- ══ HEADER ══ -->
      <div class="ept-header">
        <div class="ept-header-text">
          <h2 class="ept-title poppins-semibold">Enviar produto</h2>
          <p class="ept-subtitle poppins-regular" v-if="produtoNome">
            <strong>{{ produtoNome }}</strong> · escolha a loja
          </p>
          <p class="ept-subtitle poppins-regular" v-else>
            Escolha para qual loja deseja enviar este produto
          </p>
        </div>
        <button class="ept-close" @click="fechar">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <!-- ══ BUSCA ══ -->
      <div class="ept-search-box">
        <span class="material-symbols-outlined">search</span>
        <input
          v-model="busca"
          type="text"
          placeholder="Buscar loja..."
          @input="paginaAtual = 1"
        />
      </div>

      <!-- ══ LISTA ROLÁVEL ══ -->
      <div class="ept-scroll">

        <!-- LOADING -->
        <div v-if="loadingLojas" class="ept-loja-card skeleton" v-for="n in 4" :key="'sk'+n">
          <div class="sk-avatar"></div>
          <div class="sk-lines">
            <div class="sk-line" style="width:60%"></div>
            <div class="sk-line" style="width:40%"></div>
          </div>
        </div>

        <!-- ERRO AO CARREGAR -->
        <div v-else-if="erroLojas" class="ept-empty">
          <span class="material-symbols-outlined">error</span>
          <p>Não foi possível carregar suas lojas associadas.</p>
          <button class="ept-retry" @click="fetchLojas">Tentar novamente</button>
        </div>

        <!-- VAZIO -->
        <div v-else-if="!lojasFiltradas.length" class="ept-empty">
          <span class="material-symbols-outlined">storefront</span>
          <p>{{ busca ? 'Nenhuma loja encontrada.' : 'Você ainda não está associado a nenhuma loja.' }}</p>
        </div>

        <!-- CARDS DE LOJA -->
        <div
          v-else
          v-for="loja in lojasPagina"
          :key="loja.id_loja"
          class="ept-loja-card"
        >
          <div class="ept-loja-avatar">
            <img v-if="loja.foto || loja.logo" :src="loja.foto || loja.logo" :alt="loja.nome_loja || loja.nome" />
            <span v-else class="material-symbols-outlined">storefront</span>
          </div>
          <div class="ept-loja-info">
            <span class="ept-loja-nome poppins-medium">{{ loja.nome_loja || loja.nome || 'Loja' }}</span>
            <span class="ept-loja-sub poppins-regular" v-if="loja.cidade || loja.bairro">
              {{ [loja.bairro, loja.cidade].filter(Boolean).join(' · ') }}
            </span>
          </div>
          <button
            class="ept-btn-enviar poppins-medium"
            :class="{ enviado: statusEnvio[loja.id_loja] === 'enviado' }"
            :disabled="statusEnvio[loja.id_loja] === 'enviando' || statusEnvio[loja.id_loja] === 'enviado'"
            @click="enviarProduto(loja)"
          >
            <ion-spinner v-if="statusEnvio[loja.id_loja] === 'enviando'" name="crescent" class="ept-btn-spinner"></ion-spinner>
            <template v-else-if="statusEnvio[loja.id_loja] === 'enviado'">
              <span class="material-symbols-outlined">check</span> Enviado
            </template>
            <template v-else>
              <span class="material-symbols-outlined">send</span> Enviar
            </template>
          </button>
        </div>
      </div>

      <!-- ══ PAGINAÇÃO SIMPLES ══ -->
      <div class="ept-pager" v-if="!loadingLojas && totalPaginas > 1">
        <button class="ept-pager-btn" :disabled="paginaAtual === 1" @click="paginaAtual--">
          <span class="material-symbols-outlined">chevron_left</span>
        </button>
        <span class="ept-pager-label poppins-regular">Página {{ paginaAtual }} de {{ totalPaginas }}</span>
        <button class="ept-pager-btn" :disabled="paginaAtual === totalPaginas" @click="paginaAtual++">
          <span class="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
    </div>
  </ion-modal>
</template>

<script>
import { IonModal, IonSpinner } from '@ionic/vue';
import { api } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import { toastService } from '@/services/toast';
import exibeErro from '@/utils/ExibeErro';

const ENDPOINT_LOJAS = '/mvpu/usuario/VendedorAssociadas/';
const ENDPOINT_ENVIAR = '/mvpu/cotacao/enviarProdutoTrend';

export default {
  name: 'ModalEnviarProdutoTrend',
  components: { IonModal, IonSpinner },
  props: {
    isOpen: { type: Boolean, default: false },
    idProdutoVendedor: { type: [String, Number], default: null },
    produtoNome: { type: String, default: '' },
  },
  emits: ['update:isOpen', 'enviado'],
  data() {
    return {
      lojas: [],
      loadingLojas: false,
      erroLojas: false,
      busca: '',
      paginaAtual: 1,
      itensPorPagina: 6,
      statusEnvio: {}, // { [id_loja]: 'enviando' | 'enviado' }
    };
  },
  computed: {
    idVendedorAtivo() {
      const authStore = useAuthStore();
      return authStore?.vendedor?.id_vendedor ?? authStore?.usuario?.id_vendedor ?? null;
    },
    lojasFiltradas() {
      if (!this.busca) return this.lojas;
      const termo = this.busca.toLowerCase();
      return this.lojas.filter(l =>
        (l.nome_loja || l.nome || '').toLowerCase().includes(termo)
      );
    },
    totalPaginas() {
      return Math.max(1, Math.ceil(this.lojasFiltradas.length / this.itensPorPagina));
    },
    lojasPagina() {
      const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
      return this.lojasFiltradas.slice(inicio, inicio + this.itensPorPagina);
    },
  },
  watch: {
    isOpen(val) {
      if (val) {
        this.busca = '';
        this.paginaAtual = 1;
        this.statusEnvio = {};
        this.fetchLojas();
      }
    },
  },
  methods: {
    async fetchLojas() {
      this.loadingLojas = true;
      this.erroLojas = false;
      try {
        const response = await api.get(ENDPOINT_LOJAS, {
          params: { id_vendedor: this.idVendedorAtivo },
        });
        const payload = response.data?.data;
        this.lojas = Array.isArray(payload)
          ? payload
          : (payload?.lojas || payload?.associadas || []);
      } catch (err) {
        this.erroLojas = true;
        this.lojas = [];
      } finally {
        this.loadingLojas = false;
      }
    },

    async enviarProduto(loja) {
      if (!this.idProdutoVendedor || !loja?.id_loja) return;

      this.statusEnvio = { ...this.statusEnvio, [loja.id_loja]: 'enviando' };

      try {
        await api.post(ENDPOINT_ENVIAR, {
            produtos: [
                {
                    id_produto_vendedor: this.idProdutoVendedor,
                    id_loja: loja.id_loja,
                    id_vendedor: this.idVendedorAtivo,
                }
            ]
        });

        this.statusEnvio = { ...this.statusEnvio, [loja.id_loja]: 'enviado' };
        toastService?.success?.('Produto enviado para a loja com sucesso!');
        this.$emit('enviado', loja);
      } catch (err) {
        this.statusEnvio = { ...this.statusEnvio };
        delete this.statusEnvio[loja.id_loja];
        exibeErro(err, this.$toast);
      }
    },

    fechar() {
      this.$emit('update:isOpen', false);
    },
  },
};
</script>

<style scoped>
.ept-modal {
  --width: 100%;
  --max-width: 480px;
  --height: auto;
  --max-height: 86vh;
  --border-radius: 22px;
  --box-shadow: 0 24px 60px rgba(15, 23, 42, 0.28);
  --background: #fff;
}
@media (max-width: 400px) {
  .ept-modal { --width: 92vw; --max-height: 90vh; --border-radius: 20px; }
}

.ept-wrapper { display: flex; flex-direction: column; max-height: 86vh; }

/* ══ HEADER ══ */
.ept-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 22px 22px 14px;
  border-bottom: 1px solid #f1f5f9;
}
.ept-title { font-size: 19px; color: #1e293b; margin: 0 0 4px; line-height: 1.3; }
.ept-subtitle { font-size: 13px; color: #64748b; margin: 0; line-height: 1.5; }
.ept-subtitle strong { color: #334155; font-weight: 600; }
.ept-close {
  flex-shrink: 0;
  width: 34px; height: 34px;
  border: none; background: #f1f5f9;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  color: #64748b;
}
.ept-close .material-symbols-outlined { font-size: 20px; }

/* ══ BUSCA ══ */
.ept-search-box {
  display: flex; align-items: center; gap: 8px;
  margin: 14px 22px 0;
  background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;
  padding: 10px 14px;
}
.ept-search-box .material-symbols-outlined { font-size: 19px; color: #94a3b8; }
.ept-search-box input {
  border: none; outline: none; background: transparent;
  font-size: 14px; color: #1e293b; width: 100%;
}

/* ══ SCROLL / LISTA ══ */
.ept-scroll {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 14px 22px 6px;
  display: flex; flex-direction: column; gap: 10px;
}

.ept-loja-card {
  display: flex; align-items: center; gap: 12px;
  background: #f8fafc; border: 1px solid #e2e8f0;
  border-radius: 14px; padding: 12px;
}
.ept-loja-avatar {
  width: 44px; height: 44px; flex-shrink: 0;
  border-radius: 12px; overflow: hidden;
  background: #fff7ed;
  display: flex; align-items: center; justify-content: center;
}
.ept-loja-avatar img { width: 100%; height: 100%; object-fit: cover; }
.ept-loja-avatar .material-symbols-outlined { font-size: 22px; color: #ff8049; }
.ept-loja-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.ept-loja-nome { font-size: 14px; color: #1e293b; }
.ept-loja-sub { font-size: 12px; color: #94a3b8; }

.ept-btn-enviar {
  flex-shrink: 0;
  border: none;
  background: linear-gradient(135deg, #ff8049, #ff9a6a);
  color: #fff;
  font-size: 13px;
  border-radius: 12px;
  padding: 10px 14px;
  display: flex; align-items: center; gap: 6px;
  box-shadow: 0 6px 16px rgba(255, 128, 73, 0.28);
}
.ept-btn-enviar .material-symbols-outlined { font-size: 17px; }
.ept-btn-enviar:disabled { opacity: 0.7; }
.ept-btn-enviar.enviado {
  background: #dcfce7; color: #16a34a; box-shadow: none;
}
.ept-btn-spinner { width: 16px; height: 16px; --color: #fff; }

/* ══ ESTADOS VAZIO / ERRO ══ */
.ept-empty {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 36px 16px; text-align: center; color: #94a3b8;
}
.ept-empty .material-symbols-outlined { font-size: 34px; }
.ept-empty p { font-size: 13px; margin: 0; }
.ept-retry {
  margin-top: 4px; border: 1px solid #e2e8f0; background: #fff;
  border-radius: 10px; padding: 8px 16px; font-size: 12.5px; color: #ff8049;
}

/* ══ SKELETON ══ */
.ept-loja-card.skeleton { pointer-events: none; }
.sk-avatar { width: 44px; height: 44px; border-radius: 12px; background: #e2e8f0; flex-shrink: 0; animation: sk-pulse 1.2s infinite ease-in-out; }
.sk-lines { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.sk-line { height: 10px; border-radius: 6px; background: #e2e8f0; animation: sk-pulse 1.2s infinite ease-in-out; }
@keyframes sk-pulse { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }

/* ══ PAGINAÇÃO ══ */
.ept-pager {
  flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; gap: 14px;
  padding: 14px 22px 20px;
  border-top: 1px solid #f1f5f9;
}
.ept-pager-btn {
  width: 34px; height: 34px; border: 1px solid #e2e8f0; background: #fff;
  border-radius: 10px; color: #475569;
  display: flex; align-items: center; justify-content: center;
}
.ept-pager-btn:disabled { opacity: 0.4; }
.ept-pager-label { font-size: 12.5px; color: #64748b; }
</style>