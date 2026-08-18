<template>
  <ion-page class="pd-details-page">
    <ion-content :fullscreen="true">

      <RefresherIonic />

      <div class="page-wrapper">

        <!-- Back -->
        <div class="back-btn" @click="$router.back()">
          <span class="material-symbols-outlined">arrow_back_ios</span>
          <span>Voltar</span>
        </div>

        <!-- ============ LOADING (skeleton) ============ -->
        <div v-if="loading" class="skeleton-list">
          <div v-for="i in 4" :key="i" class="skeleton-card"></div>
        </div>

        <!-- ============ ESTADO: INDISPONÍVEL ============ -->
        <div v-else-if="isIndisponivel" class="center-state">
          <div class="state-card">
            <div class="state-icon orange">
              <span class="material-symbols-outlined">hourglass_empty</span>
            </div>
            <h2>A loja está preparando seu pedido</h2>
            <p>
              A loja ainda está separando e faturando os produtos deste pedido direto.
              Fique atento, você será notificado assim que o faturamento estiver disponível para consulta.
            </p>
            <div class="date-pill" v-if="cabecalho?.nome_pedido_direto">
              <span class="material-symbols-outlined">receipt_long</span>
              <span>{{ cabecalho.nome_pedido_direto }}</span>
            </div>
            <button class="btn-primary mt-16" @click="fetchFaturamento(true)">
              <span class="material-symbols-outlined">refresh</span>
              Verificar novamente
            </button>
            <button class="btn-ghost" @click="$router.back()">Voltar para Listagem</button>
          </div>
        </div>

        <!-- ============ ESTADO: FINALIZADA (carregando faturamento) ============ -->
        <div v-else-if="isFinalizada && loadingFat" class="skeleton-list">
          <div v-for="i in 3" :key="i" class="skeleton-card"></div>
        </div>

        <!-- ============ ESTADO: FINALIZADA (erro) ============ -->
        <div v-else-if="isFinalizada && erroFat" class="center-state">
          <div class="state-card">
            <div class="state-icon red">
              <span class="material-symbols-outlined">error_outline</span>
            </div>
            <h2>Não foi possível carregar o faturamento</h2>
            <p>Ocorreu um erro ao consultar os produtos faturados deste pedido. Tente novamente.</p>
            <button class="btn-primary mt-16" @click="fetchFaturamento(true)">
              <span class="material-symbols-outlined">refresh</span>
              Tentar novamente
            </button>
          </div>
        </div>

        <!-- ============ ESTADO: FINALIZADA (vazio) ============ -->
        <div v-else-if="isFinalizada && itensFaturados.length === 0" class="center-state">
          <div class="state-card">
            <div class="state-icon orange">
              <span class="material-symbols-outlined">inventory_2</span>
            </div>
            <h2>Nenhum produto faturado</h2>
            <p>Não encontramos produtos faturados para este pedido direto.</p>
            <button class="btn-ghost" @click="$router.back()">Voltar para Listagem</button>
          </div>
        </div>

        <!-- ============ ESTADO: FINALIZADA (faturamento) ============ -->
        <div v-else-if="isFinalizada" class="finished-view">

          <!-- PDF hidden container (impressão via jsPDF) -->
          <div ref="reportContainer" v-show="false"></div>

          <div class="finished-header">
            <div class="success-chip">
              <span class="material-symbols-outlined">verified</span>
              PEDIDO FATURADO
            </div>
            <h1 class="quote-title">{{ cabecalho?.nome_pedido_direto || 'Pedido Direto' }}</h1>
            <p class="quote-subtitle">
              Faturado em {{ formatarDataHora(cabecalho?.finalizado_em) }}. Confira os itens e valores abaixo.
            </p>
          </div>

          <div class="stats-row">
            <div class="stat-box">
              <span class="stat-label">Total de Itens</span>
              <span class="stat-value">{{ totalItensGeral }}</span>
            </div>
            <div class="stat-box accent">
              <span class="stat-label">Valor Total</span>
              <span class="stat-value">R$ {{ formatVal(totalGeralFaturamento) }}</span>
            </div>
          </div>

          <div class="info-banner" v-if="totalItensSemPrecoGeral > 0">
            <span class="material-symbols-outlined">info</span>
            <span>
              {{ totalItensSemPrecoGeral }} produto{{ totalItensSemPrecoGeral > 1 ? 's' : '' }} sem preço definido
              pelo vendedor — não {{ totalItensSemPrecoGeral > 1 ? 'entram' : 'entra' }} no valor total e serão
              exibidos como <b>"Preço a combinar"</b>.
            </span>
          </div>

          <!-- ===== Agrupado por vendedor ===== -->
          <div class="table-card" v-for="v in vendedoresFaturamento" :key="v.id_vendedor">
            <div class="vendor-card-head">
              <div class="vendor-info">
                <span class="vendor-name">SEU PEDIDO</span>
                <span class="vendor-sub" v-if="v.cidade || v.estado">{{ v.cidade }}<span v-if="v.cidade && v.estado">, </span>{{ v.estado }}</span>
              </div>
              <div class="vendor-total">
                <span class="vendor-total-label">Subtotal</span>
                <span class="vendor-total-value">R$ {{ formatVal(v.totalValor) }}</span>
              </div>
            </div>

            <div class="produtos-fat-list">
              <div v-for="p in v.produtos" :key="p.item_pedido_direto" class="produto-fat-row">
                <div class="pf-info">
                  <span class="pf-name" style="font-size: 1rem; font-weight: 600;">{{ p.nome_exibicao }}</span>
                  <span class="pf-name" style="color: #555;" v-if="p.codigo_barra">Cod. barra: {{ p.codigo_barra }}</span>
                  <span class="pf-name" style="color: #555;" >Qtd: {{ p.quantidade ?? '—' }}</span>
                  <div class="pf-tags" style="margin-top: 10px;">
                    <span class="type-tag">{{ p.tipo_produto || 'unidade' }}</span>
                    <span class="pf-qtd" v-if="p.qtd_unitaria_composicao">{{ p.qtd_unitaria_composicao }} un/emb.</span>
                  </div>
                </div>

                <div class="pf-price">
                  <template v-if="p.tem_preco">
                    <template v-if="p.descontoAtivo">
                      <span class="pf-price-old">R$ {{ formatVal(p.precoOriginal) }}</span>
                      <span class="pf-price-final">R$ {{ formatVal(p.precoFinal) }}</span>
                      <span class="pf-discount-badge">-{{ p.promocao_desconto }}%</span>
                    </template>
                    <template v-else>
                      <span class="pf-price-final">R$ {{ formatVal(p.precoFinal) }}</span>
                    </template>
                    <span class="pf-subtotal">Subtotal: R$ {{ formatVal(p.subtotal) }}</span>
                  </template>
                  <template v-else>
                    <span class="pf-no-price">Preço a combinar</span>
                  </template>
                </div>
              </div>
            </div>
          </div>

          <div class="total-geral-card">
            <span class="poppins-medium">Total geral do pedido</span>
            <span class="poppins-semibold">R$ {{ formatVal(totalGeralFaturamento) }}</span>
          </div>

          <div class="footer-actions">
            <button class="btn-primary" @click="exportToPDF">
              <span class="material-symbols-outlined">print</span>
              Imprimir Comprovante
            </button>
            <button class="btn-ghost" @click="$router.back()">Voltar para Listagem</button>
          </div>
        </div>

      </div>

    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { IonPage, IonContent } from '@ionic/vue'
import { api } from '@/services/api'
import RefresherIonic from '@/components/refresherIonic.vue'
import exibeErro from '@/utils/ExibeErro'

import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import autoTable from 'jspdf-autotable'
import { Capacitor } from '@capacitor/core'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'

export default defineComponent({
  name: 'DetalhesPedidoDireto',
  components: { IonPage, IonContent, RefresherIonic },

  data() {
    return {
      loading: true,
      loadingFat: false,
      erroFat: false,

      cabecalho: null as any,
      itensFaturados: [] as any[],
    }
  },

  computed: {
    isIndisponivel(): boolean {
      return this.cabecalho?.status_pedido_direto === 'indisponivel'
    },
    isFinalizada(): boolean {
      return this.cabecalho?.status_pedido_direto === 'finalizada'
    },

    // Agrupa os itens faturados (payload flat) por vendedor, aplicando a
    // regra de preço/desconto item a item.
    vendedoresFaturamento(): any[] {
      const map: Record<number, any> = {}

      for (const raw of this.itensFaturados) {
        const idVendedor = raw.id_vendedor
        if (!map[idVendedor]) {
          map[idVendedor] = {
            id_vendedor: idVendedor,
            nome: raw.nome,
            email: raw.email,
            celular: raw.celular,
            foto_perfil: raw.foto_perfil,
            cidade: raw.cidade,
            estado: raw.estado,
            produtos: [] as any[],
            totalValor: 0,
          }
        }

        const temPreco = raw.preco_produto != null
        const descontoAtivo = temPreco && this.isDescontoAtivo(raw)
        const precoOriginal = temPreco ? Number(raw.preco_produto) : null
        const precoFinal = temPreco ? this.precoComDesconto(raw) : null
        const quantidade = Number(raw.quantidade) || 0
        const subtotal = temPreco ? (precoFinal as number) * quantidade : null

        const produto = {
          ...raw,
          nome_exibicao: raw.nome || raw.nome_produto_cad || 'Produto não cadastrado',
          codigo_barra: raw.codigo_barra_pv || raw.codigo_barra_prod ||  null,
          tem_preco: temPreco,
          descontoAtivo,
          precoOriginal,
          precoFinal,
          subtotal,
        }

        map[idVendedor].produtos.push(produto)
        if (temPreco) map[idVendedor].totalValor += subtotal as number
      }

      return Object.values(map)
    },

    totalGeralFaturamento(): number {
      return this.vendedoresFaturamento.reduce((s: number, v: any) => s + (v.totalValor || 0), 0)
    },
    totalItensGeral(): number {
      return this.itensFaturados.length
    },
    totalItensSemPrecoGeral(): number {
      return this.itensFaturados.filter((i: any) => i.preco_produto == null).length
    },
  },

  methods: {
    // ─── UTILS ────────────────────────────────────────────────
    formatVal(v: any): string {
      if (v == null || isNaN(Number(v))) return '—'
      return Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
    formatarData(v: any): string {
      if (!v) return '—'
      return new Date(Number(v)).toLocaleDateString('pt-BR')
    },
    formatarDataHora(v: any): string {
      if (!v) return '—'
      return new Date(Number(v)).toLocaleString('pt-BR')
    },
    initials(nome?: string | null): string {
      return (nome || '').split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()
    },

    // Regra de desconto ativo (exatamente conforme especificado):
    // a promoção só é considerada válida se o pedido já foi finalizado
    // (cabecalho.finalizado_em) e o momento de finalização respeita a
    // janela de início/fim do desconto do item.
    isDescontoAtivo(item: any): boolean {
      if (!item || item.promocao_desconto == null) return false
      const agora = Date.now()
      const inicio = item.desconto_inicio ? Number(item.desconto_inicio) : null
      const fim = item.desconto_fim ? Number(item.desconto_fim) : null
      if (inicio && agora < inicio) return false

      if (Number(this.cabecalho?.finalizado_em) == 0) return false
      if (fim && (agora > fim) && (Number(this.cabecalho?.finalizado_em) > fim)) return false

      return true
    },
    precoComDesconto(item: any): number {
      const base = Number(item?.preco_produto ?? 0)
      if (!this.isDescontoAtivo(item)) return base
      const desconto = Number(item.promocao_desconto || 0)
      return base - (base * desconto) / 100
    },

    // ─── CARREGAMENTO ─────────────────────────────────────────
    async fetchFaturamento(manual = false) {
      if (!this.cabecalho?.id_pedido_direto) return
      this.loadingFat = true
      this.erroFat = false
      try {
        const res = await api.get(`/mvpu/cotacao/consultarFatPedidoDireto/${this.cabecalho.id_pedido_direto}`)
        this.itensFaturados = res.data?.data || []
      } catch (e) {
        this.erroFat = true
        exibeErro(e, this.$toast)
      } finally {
        this.loadingFat = false
        this.loading = false
        if (manual && !this.erroFat) {
          this.$toast?.add({ severity: 'success', summary: 'Atualizado', detail: 'Faturamento consultado com sucesso.', life: 2500 })
        }
      }
    },

    // ─── IMPRESSÃO / PDF ──────────────────────────────────────
    async exportToPDF() {
      try {
        const doc = new jsPDF()
        const pageWidth = doc.internal.pageSize.getWidth()
        const pageHeight = doc.internal.pageSize.getHeight()
        const primaryColor: [number, number, number] = [255, 128, 73]
        const secondaryColor: [number, number, number] = [30, 41, 59]
        const lightGray: [number, number, number] = [100, 116, 139]
        const borderColor: [number, number, number] = [226, 232, 240]

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(22)
        const textMarket = 'Market'
        const textVizium = ' Vizium'
        const marketWidth = doc.getTextWidth(textMarket)
        const viziumWidth = doc.getTextWidth(textVizium)
        const startX = (pageWidth - marketWidth - viziumWidth) / 2
        doc.setTextColor(85, 85, 85)
        doc.text(textMarket, startX, 25)
        doc.setTextColor(...primaryColor)
        doc.text(textVizium, startX + marketWidth, 25)

        doc.setDrawColor(...borderColor)
        doc.line(15, 35, pageWidth - 15, 35)
        doc.setFontSize(8)
        doc.setTextColor(...lightGray)
        doc.setFont('helvetica', 'bold')
        doc.text('COMPROVANTE DE PEDIDO DIRETO', 15, 42)
        doc.text(`EMITIDO EM: ${new Date().toLocaleString('pt-BR')}`, pageWidth - 15, 42, { align: 'right' })

        doc.setFontSize(10)
        doc.setTextColor(...secondaryColor)
        doc.text('Resumo do Pedido', 15, 52)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.setTextColor(...lightGray)
        doc.text(`NOME DO PEDIDO: ${this.cabecalho?.nome_pedido_direto || 'PEDIDO DIRETO'}`, 15, 58)
        doc.text(`FATURADO EM: ${this.formatarDataHora(this.cabecalho?.finalizado_em)}`, 15, 63)

        const tableBody: any[] = []
        this.vendedoresFaturamento.forEach((v: any) => {
          v.produtos.forEach((p: any) => {
            tableBody.push([
              p.codigo_barra || '--',
              { content: p.nome_exibicao, styles: { fontStyle: 'bold', textColor: [30, 41, 59] } },
              `${p.quantidade ?? '--'} ${p.tipo_produto || ''}`.trim(),
              p.tem_preco ? `R$ ${Number(p.precoOriginal).toFixed(2)}${p.descontoAtivo ? ` (-${p.promocao_desconto}%)` : ''}` : 'A combinar',
              p.tem_preco ? `R$ ${Number(p.subtotal).toFixed(2)}` : '--',
            ])
          })
        })

        autoTable(doc, {
          startY: 75,
          head: [['CÓD. BARRA', 'PRODUTO', 'QTD./TIPO', 'VL. UNIT.', 'SUBTOTAL']],
          body: tableBody,
          theme: 'plain',
          headStyles: { fillColor: [255, 255, 255], textColor: secondaryColor, fontStyle: 'bold', fontSize: 7, cellPadding: { top: 5, bottom: 5, left: 2, right: 2 } },
          styles: { font: 'helvetica', fontSize: 9, cellPadding: 4, textColor: [51, 65, 85], lineWidth: 0 },
          columnStyles: { 0: { cellWidth: 35, fontSize: 8, textColor: lightGray }, 4: { halign: 'right', fontStyle: 'bold', textColor: secondaryColor } },
          didDrawCell: (data: any) => {
            if (data.section === 'body') {
              doc.setDrawColor(...borderColor)
              doc.setLineWidth(0.1)
              doc.line(data.cell.x, data.cell.y + data.cell.height, data.cell.x + data.cell.width, data.cell.y + data.cell.height)
            }
          },
        })

        const finalY = (doc as any).lastAutoTable.finalY + 15
        doc.setFillColor(252, 253, 255)
        doc.setDrawColor(...borderColor)
        doc.roundedRect(pageWidth - 85, finalY - 5, 70, 22, 2, 2, 'FD')
        doc.setFontSize(8)
        doc.setTextColor(...lightGray)
        doc.setFont('helvetica', 'bold')
        doc.text('VALOR TOTAL', pageWidth - 80, finalY + 3)
        doc.setFontSize(15)
        doc.setTextColor(...primaryColor)
        doc.text(`R$ ${this.totalGeralFaturamento.toFixed(2)}`, pageWidth - 20, finalY + 13, { align: 'right' })

        if (this.totalItensSemPrecoGeral > 0) {
          doc.setFontSize(7)
          doc.setTextColor(...lightGray)
          doc.setFont('helvetica', 'normal')
          doc.text(
            `* ${this.totalItensSemPrecoGeral} produto(s) sem preço definido não entram no valor total.`,
            15,
            finalY + 10
          )
        }

        const footerY = pageHeight - 12
        doc.setFontSize(7)
        doc.setTextColor(...lightGray)
        doc.setFont('helvetica', 'normal')
        doc.text('Documento gerado pela plataforma MarketVizium.', 15, footerY)
        doc.text(`Página ${doc.internal.getNumberOfPages()}`, pageWidth - 15, footerY, { align: 'right' })

        const pdfFileName = `MarketVizium_PedidoDireto_${new Date().toISOString().split('T')[0]}.pdf`

        if (Capacitor.isNativePlatform()) {
          const pdfBase64 = doc.output('datauristring').split(',')[1]
          const result = await Filesystem.writeFile({
            path: pdfFileName,
            data: pdfBase64,
            directory: Directory.Cache,
          })
          await Share.share({
            title: 'Comprovante de Pedido Direto',
            text: 'Comprovante gerado pelo MarketVizium',
            url: result.uri,
            dialogTitle: 'Salvar ou enviar comprovante',
          })
        } else {
          doc.save(pdfFileName)
        }
      } catch (error) {
        this.$toast?.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível gerar o comprovante.', life: 3000 })
      }
    },
  },

  ionViewDidEnter() {
    this.loading = true
    this.erroFat = false
    this.itensFaturados = []

    const query = this.$route.query

    this.cabecalho = {
      id_pedido_direto: query.id_pedido_direto as string | null,
      nome_pedido_direto: query.nome_pedido_direto as string | null,
      status_pedido_direto: (query.status_pedido_direto as string) || 'indisponivel',
      id_usuario: query.id_usuario as string | null,
      finalizado_em: query.finalizado_em as string | null,
    }

    if (this.isFinalizada) {
      this.fetchFaturamento()
    } else {
      this.loading = false
    }
  },
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

* { box-sizing: border-box; }

.pd-details-page {
  --background: #FFF;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
}
ion-content { --background: #FFF; }

.page-wrapper {
  max-width: 720px;
  margin: 0 auto;
  padding: 16px 16px 24px;
}

/* ===== BACK BUTTON ===== */
.back-btn {
  display: flex; align-items: center; gap: 4px;
  color: #999; font-size: 13px; font-weight: 500;
  cursor: pointer; padding: 8px 0 12px; width: fit-content;
}
.back-btn:active { opacity: 0.6; }
.back-btn .material-symbols-outlined { font-size: 16px; }

/* ===== SKELETON ===== */
.skeleton-list { display: flex; flex-direction: column; gap: 10px; margin-top: 12px; }
.skeleton-card {
  height: 90px;
  background: linear-gradient(90deg, #ececec 25%, #f5f5f5 50%, #ececec 75%);
  background-size: 200% 100%;
  border-radius: 16px;
  animation: shimmer 1.4s infinite;
}
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* ===== CENTER STATE ===== */
.center-state { display: flex; justify-content: center; align-items: center; min-height: 60vh; }
.state-card { text-align: center; padding: 32px 24px; max-width: 380px; margin: 0 auto; }
.state-icon { width: 72px; height: 72px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
.state-icon.orange { background: #fff3ee; }
.state-icon.orange .material-symbols-outlined { font-size: 36px; color: #FF8049; }
.state-icon.red { background: #fef2f2; }
.state-icon.red .material-symbols-outlined { font-size: 36px; color: #dc2626; }
.state-card h2 { font-size: 18px; font-weight: 700; color: #1a1a1a; margin: 0 0 8px; }
.state-card p { font-size: 14px; color: #666; line-height: 1.6; margin: 0 0 16px; }
.date-pill {
  display: inline-flex; align-items: center; gap: 6px;
  background: #f5f5f7; border-radius: 50px; padding: 8px 14px;
  font-size: 12px; color: #666; margin-bottom: 8px;
}
.date-pill .material-symbols-outlined { font-size: 14px; }

/* ===== BUTTONS ===== */
.btn-primary {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  background: #FF8049; color: #fff; border: none; border-radius: 12px;
  padding: 13px 24px; font-size: 14px; font-weight: 600;
  cursor: pointer; width: 100%; font-family: inherit;
  transition: background 0.15s, transform 0.1s;
}
.btn-primary:active { background: #e56a36; transform: scale(0.98); }
.btn-primary .material-symbols-outlined { font-size: 18px; }

.btn-ghost {
  display: flex; align-items: center; justify-content: center;
  background: transparent; color: #999; border: none; border-radius: 12px;
  padding: 12px 24px; font-size: 14px; font-weight: 500;
  cursor: pointer; width: 100%; font-family: inherit;
}
.btn-ghost:active { opacity: 0.6; }

.mt-16 { margin-top: 16px; }

/* ===== FINISHED VIEW ===== */
.finished-view { animation: fadeUp 0.4s ease; padding-top: 4px; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

.finished-header { margin-bottom: 20px; padding-top: 8px; }
.success-chip {
  display: inline-flex; align-items: center; gap: 6px;
  background: #ecfdf5; color: #059669; border-radius: 50px;
  padding: 5px 12px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px;
}
.success-chip .material-symbols-outlined { font-size: 14px; }

.quote-title { font-size: 18px; font-weight: 700; color: #1a1a1a; margin: 10px 0 4px; line-height: 1.3; }
.quote-subtitle { font-size: 13px; color: #666; margin: 4px 0 0; }

.stats-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
.stat-box { background: #fff; border-radius: 14px; padding: 14px 16px; border: 1px solid #eee; display: flex; flex-direction: column; gap: 4px; }
.stat-box.accent { background: #FF8049; border-color: #FF8049; }
.stat-label { font-size: 10px; text-transform: uppercase; color: #999; font-weight: 600; letter-spacing: 0.5px; }
.stat-box.accent .stat-label { color: rgba(255,255,255,0.8); }
.stat-value { font-size: 20px; font-weight: 700; color: #1a1a1a; }
.stat-box.accent .stat-value { color: #fff; }

/* ===== INFO BANNER (itens sem preço) ===== */
.info-banner {
  display: flex; align-items: flex-start; gap: 8px;
  background: #fff7ed; border: 1px solid #fed7aa; color: #9a3412;
  border-radius: 12px; padding: 10px 14px; font-size: 12px;
  line-height: 1.5; margin-bottom: 16px;
}
.info-banner .material-symbols-outlined { font-size: 16px; margin-top: 1px; flex-shrink: 0; }

/* ===== VENDOR / PRODUCT CARDS ===== */
.table-card { background: #fff; border-radius: 16px; padding: 16px; border: 1px solid #eee; margin-bottom: 14px; }

.vendor-card-head {
  display: flex; align-items: center; gap: 10px;
  padding-bottom: 12px; margin-bottom: 12px; border-bottom: 1px solid #f1f5f9;
}
.vendor-avatar {
  width: 38px; height: 38px; border-radius: 50%; overflow: hidden; flex-shrink: 0;
  background: #FF8049; display: flex; align-items: center; justify-content: center;
}
.vendor-avatar img { width: 100%; height: 100%; object-fit: cover; }
.vendor-initials { color: #fff; font-size: 13px; font-weight: 700; }
.vendor-info { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.vendor-name { font-size: 13px; font-weight: 700; color: #1a1a1a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.vendor-sub { font-size: 11px; color: #999; }
.vendor-total { text-align: right; flex-shrink: 0; }
.vendor-total-label { display: block; font-size: 9px; text-transform: uppercase; color: #999; font-weight: 600; }
.vendor-total-value { font-size: 14px; font-weight: 700; color: #FF8049; }

.produtos-fat-list { display: flex; flex-direction: column; gap: 12px; }
.produto-fat-row {
  display: flex; justify-content: space-between; align-items: flex-start;
  gap: 10px; padding-bottom: 12px; border-bottom: 1px solid #f8f8f8;
}
.produto-fat-row:last-child { border-bottom: none; padding-bottom: 0; }

.pf-info { display: flex; flex-direction: column; gap: 4px; min-width: 0; flex: 1; }
.pf-name { font-size: 13px; font-weight: 600; color: #1a1a1a; }
.pf-tags { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.type-tag { background: rgba(255,128,73,0.1); color: #FF8049; padding: 2px 7px; border-radius: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
.pf-qtd { font-size: 11px; color: #666; }
.pf-barcode { font-size: 10px; color: #999; }
.mono { font-family: 'DM Mono', monospace; }

.pf-price { text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 2px; flex-shrink: 0; }
.pf-price-old { font-size: 11px; color: #94a3b8; text-decoration: line-through; }
.pf-price-final { font-size: 14px; font-weight: 700; color: #1a1a1a; }
.pf-discount-badge {
  background: #fee2e2; color: #dc2626; font-size: 9px; font-weight: 700;
  padding: 1px 6px; border-radius: 4px;
}
.pf-subtotal { font-size: 11px; color: #FF8049; font-weight: 600; }
.pf-no-price { font-size: 12px; color: #999; font-style: italic; }

.total-geral-card {
  display: flex; justify-content: space-between; align-items: center;
  background: #1a1a1a; color: #fff; border-radius: 14px;
  padding: 14px 18px; font-size: 14px; margin-bottom: 20px;
}
.poppins-medium { font-weight: 500; }
.poppins-semibold { font-weight: 600; font-size: 16px; color: #FF8049; }

.footer-actions { display: flex; flex-direction: column; gap: 8px; padding-bottom: 16px; }

@media print {
  .back-btn, .footer-actions { display: none !important; }
}
</style>