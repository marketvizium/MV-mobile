<template>
  <ion-page class="privacy-page">
    <ion-content :fullscreen="true" class="ion-padding">

      <RefresherIonic />

      <!-- ===================== HEADER ===================== -->
      <div class="header-nav">
        <div class="back-btn" @click="$router.back()">
          <span class="material-symbols-outlined" style="font-size: 18px; color: #000;">arrow_back_ios</span>
        </div>
        <h2 class="poppins-semibold page-title">Privacidade</h2>
        <div class="placeholder-box"></div>
      </div>

      <div class="main-view-container">

        <!-- ===================== INTRO ===================== -->
        <div class="intro-card">
          <span class="material-symbols-outlined intro-icon">shield_person</span>
          <div>
            <p class="intro-title poppins-semibold">Sua privacidade, do seu jeito</p>
            <p class="intro-text">
              Aqui você encontra os documentos que regem o uso da plataforma,
              entende como tratamos seus dados e pode gerenciar as
              configurações da sua conta. Leia com calma — algumas decisões
              aqui, como a exclusão de conta, não podem ser desfeitas depois
              de um certo prazo.
            </p>
          </div>
        </div>

        <!-- ===================== DOCUMENTOS LEGAIS ===================== -->
        <h3 class="section-title poppins-semibold">Documentos legais</h3>
        <p class="section-desc">
          Estes documentos explicam, em detalhes, as regras de uso do sistema
          e como tratamos seus dados pessoais, em conformidade com a Lei
          Geral de Proteção de Dados (LGPD).
        </p>

        <div class="legal-links">
          <button
            class="legal-link-btn primary"
            @click="openLegal('termos')"
            target="_blank"
            rel="noopener"
          >
            <span class="material-symbols-outlined">description</span>
            <span class="legal-link-text">
              <span class="legal-link-title">Conferir Termos de Uso</span>
              <span class="legal-link-sub">Regras de uso do sistema e do módulo de cotação</span>
            </span>
            <span class="material-symbols-outlined arrow-ext">open_in_new</span>
        </button>

          <button
            class="legal-link-btn secondary"
            @click="openLegal('privacidade')"
            target="_blank"
            rel="noopener"
          >
            <span class="material-symbols-outlined">policy</span>
            <span class="legal-link-text">
              <span class="legal-link-title">Conferir Política de Privacidade</span>
              <span class="legal-link-sub">Como coletamos, usamos e protegemos seus dados</span>
            </span>
            <span class="material-symbols-outlined arrow-ext">open_in_new</span>
        </button>
        </div>

        <!-- ===================== COMO TRATAMOS SEUS DADOS ===================== -->
        <h3 class="section-title poppins-semibold mt-4">Como tratamos seus dados</h3>
        <p class="section-desc">
          Um resumo rápido — a explicação completa está sempre na Política de
          Privacidade acima.
        </p>

        <div class="input-group">
          <div v-for="item in dataUsage" :key="item.title" class="info-item">
            <span class="material-symbols-outlined info-icon">{{ item.icon }}</span>
            <div>
              <div class="info-title">{{ item.title }}</div>
              <div class="info-desc">{{ item.desc }}</div>
            </div>
          </div>
        </div>

        <!-- ===================== SEUS DIREITOS ===================== -->
        <h3 class="section-title poppins-semibold mt-4">Seus direitos</h3>
        <p class="section-desc">
          Como titular de dados, você pode exercer os direitos abaixo a
          qualquer momento, entrando em contato pelos canais do final desta
          página.
        </p>

        <div class="rights-grid">
          <div v-for="r in rights" :key="r.title" class="right-card">
            <span class="material-symbols-outlined right-icon">{{ r.icon }}</span>
            <div>
              <p class="right-title">{{ r.title }}</p>
              <p class="right-desc">{{ r.desc }}</p>
            </div>
          </div>
        </div>

        <!-- ===================== SEGURANÇA ===================== -->
        <h3 class="section-title poppins-semibold mt-4">Segurança da informação</h3>
        <p class="section-desc">
          Medidas técnicas e administrativas usadas para proteger seus dados.
        </p>

        <div class="security-grid">
          <div v-for="s in security" :key="s" class="security-item">
            <span class="security-check">
              <span class="material-symbols-outlined" style="font-size: 14px;">check</span>
            </span>
            <span>{{ s }}</span>
          </div>
        </div>

        <!-- ===================== FAQ ===================== -->
        <h3 class="section-title poppins-semibold mt-4">Perguntas frequentes</h3>

        <div class="faq-list">
          <div v-for="(f, i) in faq" :key="i" class="faq-item">
            <div class="faq-question" @click="toggleFaq(i)">
              <span>{{ f.question }}</span>
              <span
                class="material-symbols-outlined faq-chevron"
                :class="{ open: openFaq === i }"
              >expand_more</span>
            </div>
            <transition name="faq-fade">
              <div v-if="openFaq === i" class="faq-answer">
                {{ f.answer }}
              </div>
            </transition>
          </div>
        </div>

        <!-- ===================== CONTATO ===================== -->
        <h3 class="section-title poppins-semibold mt-4">Ainda com dúvidas?</h3>
        <p class="section-desc">
          Fale com o nosso encarregado de dados (DPO) para qualquer questão
          sobre privacidade, tratamento de dados ou seus direitos como
          titular.
        </p>

        <div class="input-group" style="margin-bottom: 10px;">
          <div class="info-item">
            <span class="material-symbols-outlined info-icon">mail</span>
            <div>
              <div class="info-title">E-mail</div>
              <div class="info-desc">{{ contact.email }}</div>
            </div>
          </div>
          <div class="info-item">
            <span class="material-symbols-outlined info-icon">call</span>
            <div>
              <div class="info-title">Telefone</div>
              <div class="info-desc">{{ contact.phone }}</div>
            </div>
          </div>
        </div>

        <p class="reminder-text">
          Este resumo tem caráter informativo e não substitui a leitura
          completa dos Termos de Uso e da Política de Privacidade,
          disponíveis nos links no início desta página.
        </p>

        <!-- espaço extra proposital: mantém a exclusão de conta afastada -->
        <div class="spacer-block"></div>

        <!-- ===================== ZONA DE RISCO ===================== -->
        <div class="danger-zone">
          <div class="danger-header">
            <span class="material-symbols-outlined danger-icon">warning</span>
            <h3 class="danger-title poppins-semibold">Zona de risco</h3>
          </div>
          <p class="danger-text">
            A exclusão da sua conta é uma ação séria e, após o prazo de
            carência, <strong>irreversível</strong>. Antes de prosseguir,
            leia com atenção o que acontece em cada etapa:
          </p>

          <ol class="danger-steps">
            <li>
              Sua conta é <strong>desativada imediatamente</strong> — seu
              perfil deixa de aparecer para lojas e vendedores, e você perde
              o acesso ao sistema.
            </li>
            <li>
              Você tem um prazo de <strong>15 (quinze) dias</strong> para
              entrar em contato e reverter a exclusão, caso mude de ideia.
            </li>
            <li>
              Após esse prazo, <strong>todos os seus dados pessoais,
              cotações e ofertas são excluídos permanentemente</strong> dos
              nossos sistemas, ressalvados os registros que devamos manter
              por obrigação legal, fiscal ou para cotações já fechadas que
              envolvam terceiros.
            </li>
          </ol>

          <button class="delete-account-btn" @click="showDeleteModal = true">
            <span class="material-symbols-outlined">delete_forever</span>
            Excluir minha conta
          </button>
        </div>

      </div>

      <div class="bottom-spacer"></div>

      <!-- ===================== MODAL DE EXCLUSÃO ===================== -->
      <transition name="fade">
        <div v-if="showDeleteModal" class="modal-overlay" @click.self="closeDeleteModal">
          <div class="modal-card">
            <span class="material-symbols-outlined modal-icon">delete_forever</span>

            <h3 class="modal-title poppins-semibold">Excluir minha conta</h3>

            <p class="modal-text">
              Ao confirmar, sua conta será <strong>desativada imediatamente</strong>.
              Você terá <strong>15 dias</strong> para entrar em contato conosco
              e reativá-la, caso mude de ideia.
            </p>
            <p class="modal-text">
              Passado esse prazo, <strong>todos os seus dados pessoais,
              cotações e ofertas serão excluídos permanentemente</strong> e
              não poderão ser recuperados, ressalvados os registros que
              devamos manter por obrigação legal.
            </p>

            <label class="modal-checkbox">
              <input type="checkbox" v-model="confirmUnderstood" />
              <span>Entendi que, após 15 dias, essa ação não poderá ser desfeita.</span>
            </label>

            <div class="modal-actions">
              <button class="modal-btn cancel" @click="closeDeleteModal" :disabled="deleting">
                Cancelar
              </button>
              <button
                class="modal-btn confirm"
                :disabled="!confirmUnderstood || deleting"
                @click="confirmDeleteAccount"
              >
                <i v-if="deleting" class="pi pi-spin pi-spinner"></i>
                <span v-else>Excluir conta</span>
              </button>
            </div>
          </div>
        </div>
      </transition>

    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonPage, IonContent } from '@ionic/vue';
import { useAuthStore } from '@/stores/auth';
import { api } from '@/services/api';
import RefresherIonic from '@/components/refresherIonic.vue';
import { Browser } from '@capacitor/browser';

export default defineComponent({
  name: 'Privacidade',
  components: { IonPage, IonContent, RefresherIonic },
  setup() {
    const authStore = useAuthStore();
    return { authStore };
  },
  data() {
    return {
      links: {
        termos: 'https://market-vizium.cloud/termos-uso',
        privacidade: 'https://market-vizium.cloud/legal',
      },

      contact: {
        email: 'marketvizium@gmail.com',
        phone: '+55 11 96302-8031',
      },

      dataUsage: [
        {
          icon: 'badge',
          title: 'Cadastro e perfil',
          desc: 'Nome, contato e localização usados para identificar você nas cotações e associações com lojas.',
        },
        {
          icon: 'request_quote',
          title: 'Cotações e ofertas',
          desc: 'Preços e propostas enviados por vendedores ficam vinculados à cotação para histórico e auditoria.',
        },
        {
          icon: 'credit_card',
          title: 'Assinatura das lojas',
          desc: 'Dados de pagamento são processados por parceiro financeiro; não armazenamos o número completo do cartão.',
        },
        {
          icon: 'forum',
          title: 'Comunicações',
          desc: 'Usamos seu e-mail e celular apenas para notificações relacionadas à própria plataforma.',
        },
      ],

      rights: [
        { icon: 'visibility', title: 'Confirmação e acesso', desc: 'Saber se tratamos seus dados e obter uma cópia deles.' },
        { icon: 'edit_note', title: 'Correção', desc: 'Corrigir dados incompletos, inexatos ou desatualizados.' },
        { icon: 'delete_sweep', title: 'Eliminação', desc: 'Solicitar a exclusão dos seus dados, respeitadas as obrigações legais.' },
        { icon: 'move_up', title: 'Portabilidade', desc: 'Solicitar a portabilidade dos seus dados a outro fornecedor.' },
        { icon: 'toggle_off', title: 'Revogação de consentimento', desc: 'Revogar qualquer consentimento fornecido, a qualquer tempo.' },
        { icon: 'share', title: 'Informação sobre compartilhamento', desc: 'Saber com quem seus dados foram compartilhados.' },
      ],

      security: [
        'Criptografia de dados em trânsito e em repouso',
        'Controle de acesso por função (loja, supervisor, operador, vendedor)',
        'Monitoramento e registro de acessos ao sistema',
        'Backups periódicos e testados',
      ],

      faq: [
        {
          question: 'Quem pode ver minhas ofertas em uma cotação?',
          answer: 'Apenas a loja responsável pela cotação e os supervisores por ela cadastrados têm acesso às ofertas enviadas. Outros vendedores não veem os valores uns dos outros.',
        },
        {
          question: 'A loja vê meus dados de contato antes de eu aceitar a associação?',
          answer: 'A loja vê as informações públicas do seu perfil ao avaliar sua solicitação de associação. Dados sensíveis de contato ficam visíveis normalmente após o vínculo ser aprovado.',
        },
        {
          question: 'Por quanto tempo meus dados ficam guardados?',
          answer: 'Enquanto sua conta estiver ativa, e por um período adicional após o encerramento, conforme prazos legais de guarda. Os detalhes estão na Política de Privacidade.',
        },
        {
          question: 'Posso pedir a portabilidade dos meus dados?',
          answer: 'Sim. Você pode solicitar uma cópia estruturada dos seus dados a qualquer momento pelos canais de contato desta página.',
        },
        {
          question: 'O que acontece se eu excluir minha conta?',
          answer: 'Sua conta é desativada imediatamente e, após 15 dias, seus dados são excluídos permanentemente, ressalvado o que devemos manter por obrigação legal. Veja os detalhes na seção "Zona de risco" no final desta página.',
        },
        {
          question: 'Como falo com o encarregado de dados (DPO)?',
          answer: 'Pelo e-mail ou telefone indicados na seção "Ainda com dúvidas?" desta página.',
        },
      ],

      openFaq: null as number | null,

      showDeleteModal: false,
      confirmUnderstood: false,
      deleting: false,
    };
  },
  methods: {
    toggleFaq(index: number) {
      this.openFaq = this.openFaq === index ? null : index;
    },

    closeDeleteModal() {
      if (this.deleting) return;
      this.showDeleteModal = false;
      this.confirmUnderstood = false;
    },

    async confirmDeleteAccount() {
      if (!this.confirmUnderstood) return;

       await Browser.open({
            url: 'https://market-vizium.cloud/excluir-conta'
        });
     
    },

    async openLegal(legalTipo: String){

        if(legalTipo == 'termos'){
            await Browser.open({
                url: this.links.termos
            });

        }else{
            await Browser.open({
                url: this.links.privacidade
            });
        }
    }
  },
});
</script>

<style scoped>
.privacy-page { --background: #fbfbfb; }

/* HEADER */
.header-nav { display: flex; align-items: center; justify-content: space-between; padding: 10px 0 20px 0; }
.back-btn { width: 40px; height: 40px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.page-title { font-size: 18px; color: #1a1a1a; margin: 0; }
.placeholder-box { width: 40px; flex-shrink: 0; }

.main-view-container { max-width: 640px; margin: 0 auto; }

.section-title { font-size: 11px; color: #FF8049; text-transform: uppercase; letter-spacing: 0.04em; margin: 30px 0 6px 5px; }
.section-desc { font-size: 13px; color: #888; margin: 0 0 14px 5px; line-height: 1.5; max-width: 60ch; }
.mt-4 { margin-top: 30px; }

/* INTRO */
.intro-card {
  display: flex; gap: 14px; align-items: flex-start;
  background: #fff7f4; border: 1px solid #ffe3d5; border-radius: 16px;
  padding: 18px; margin-bottom: 10px;
}
.intro-icon { font-size: 30px; color: #FF8049; flex-shrink: 0; }
.intro-title { font-size: 15px; color: #1a1a1a; margin: 0 0 6px; }
.intro-text { font-size: 13.5px; color: #6b5c53; line-height: 1.55; margin: 0; }

/* LEGAL LINKS */
.legal-links { display: flex; flex-direction: column; gap: 10px; }
.legal-link-btn {
  display: flex; align-items: center; gap: 15px;
  padding: 14px 16px; border-radius: 14px;
  text-decoration: none; cursor: pointer;
  transition: transform 0.1s ease;
  text-align: start;
}
.legal-link-btn:active { transform: scale(0.98); }
.legal-link-btn.primary { background: #FF8049; color: white; }
.legal-link-btn.secondary { background: #333; color: white; }
.legal-link-btn .material-symbols-outlined { font-size: 22px; flex-shrink: 0; }
.legal-link-text { display: flex; flex-direction: column; flex: 1; }
.legal-link-title { font-size: 14.5px; font-weight: 600; }
.legal-link-sub { font-size: 12px; opacity: 0.85; margin-top: 2px; }
.arrow-ext { font-size: 18px !important; opacity: 0.8; }

/* INPUT GROUP / INFO ITEM (reaproveita padrão do EditarPerfil) */
.input-group {
  background: white; border-radius: 16px;
  overflow: hidden; border: 1px solid #f2f2f2;
}
.info-item {
  display: flex; gap: 12px; align-items: flex-start;
  padding: 15px; border-bottom: 1px solid #f9f9f9;
}
.info-item:last-child { border-bottom: none; }
.info-icon { color: #FF8049; font-size: 20px; flex-shrink: 0; margin-top: 2px; }
.info-title { font-size: 14px; font-weight: 600; color: #333; }
.info-desc { font-size: 13px; color: #888; margin-top: 2px; line-height: 1.45; }

/* RIGHTS GRID */
.rights-grid { display: flex; flex-direction: column; gap: 10px; }
.right-card {
  display: flex; gap: 12px; align-items: flex-start;
  background: white; border: 1px solid #f2f2f2; border-radius: 14px; padding: 14px;
}
.right-icon { color: #FF8049; font-size: 20px; flex-shrink: 0; margin-top: 2px; }
.right-title { font-size: 14px; font-weight: 600; color: #333; margin: 0 0 3px; }
.right-desc { font-size: 12.5px; color: #888; margin: 0; line-height: 1.45; }

/* SECURITY */
.security-grid { display: flex; flex-direction: column; gap: 8px; }
.security-item {
  display: flex; align-items: center; gap: 10px;
  background: white; border: 1px solid #f2f2f2; border-radius: 12px;
  padding: 12px 14px; font-size: 13.5px; color: #555;
}
.security-check {
  width: 20px; height: 20px; border-radius: 50%; flex-shrink: 0;
  background: #fff0e9; color: #FF8049;
  display: flex; align-items: center; justify-content: center;
}

/* FAQ */
.faq-list { background: white; border: 1px solid #f2f2f2; border-radius: 16px; overflow: hidden; }
.faq-item { border-bottom: 1px solid #f9f9f9; }
.faq-item:last-child { border-bottom: none; }
.faq-question {
  display: flex; justify-content: space-between; align-items: center;
  padding: 15px; cursor: pointer; font-size: 13.5px; font-weight: 600; color: #333;
}
.faq-chevron { color: #bbb; transition: transform 0.2s ease; }
.faq-chevron.open { transform: rotate(180deg); color: #FF8049; }
.faq-answer { padding: 0 15px 15px; font-size: 13px; color: #777; line-height: 1.55; }
.faq-fade-enter-active, .faq-fade-leave-active { transition: opacity 0.15s ease; }
.faq-fade-enter-from, .faq-fade-leave-to { opacity: 0; }

/* CONTATO / LEMBRETE */
.reminder-text { font-size: 12px; color: #aaa; line-height: 1.5; margin: 4px 5px 0; }

/* ESPAÇO PROPOSITAL ANTES DA ZONA DE RISCO */
.spacer-block { height: 60px; }

/* DANGER ZONE */
.danger-zone {
  border: 1.5px solid #f6c6c2; background: #fff6f5;
  border-radius: 18px; padding: 22px 20px; margin-top: 10px;
}
.danger-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.danger-icon { color: #e0483d; font-size: 22px; }
.danger-title { color: #b3392f; font-size: 15px; margin: 0; }
.danger-text { font-size: 13.5px; color: #8a4740; line-height: 1.55; margin: 0 0 12px; }
.danger-steps { margin: 0 0 18px; padding-left: 20px; }
.danger-steps li { font-size: 13px; color: #8a4740; line-height: 1.6; margin-bottom: 8px; }
.danger-steps strong { color: #6e2b23; }

.delete-account-btn {
  width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
  background: white; color: #e0483d; border: 1.5px solid #e0483d;
  border-radius: 12px; padding: 13px; font-size: 14.5px; font-weight: 600;
  cursor: pointer; transition: background 0.15s ease;
}
.delete-account-btn:active { background: #fff0ef; }

/* MODAL */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 2000; padding: 20px;
}
.modal-card {
  background: white; border-radius: 20px; padding: 26px 22px;
  width: 100%; max-width: 400px; text-align: left;
  max-height: 90vh; overflow-y: auto;
}
.modal-icon { font-size: 34px; color: #e0483d; display: block; margin: 0 auto 10px; text-align: center; }
.modal-title { font-size: 17px; color: #1a1a1a; text-align: center; margin: 0 0 14px; }
.modal-text { font-size: 13.5px; color: #555; line-height: 1.55; margin: 0 0 12px; }
.modal-text strong { color: #1a1a1a; }

.modal-checkbox {
  display: flex; align-items: flex-start; gap: 10px;
  font-size: 12.5px; color: #555; line-height: 1.5;
  margin: 14px 0 18px; cursor: pointer;
}
.modal-checkbox input { margin-top: 2px; flex-shrink: 0; width: 16px; height: 16px; accent-color: #e0483d; }

.modal-actions { display: flex; gap: 10px; }
.modal-btn {
  flex: 1; padding: 12px; border-radius: 12px; font-size: 14px; font-weight: 600;
  border: none; cursor: pointer;
}
.modal-btn.cancel { background: #f2f2f2; color: #555; }
.modal-btn.confirm { background: #e0483d; color: white; }
.modal-btn.confirm:disabled { background: #f2b3ae; cursor: not-allowed; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.bottom-spacer { height: 150px; }

/* ---------------- RESPONSIVE ---------------- */
@media (min-width: 641px) {
  .rights-grid { display: grid; grid-template-columns: 1fr 1fr; }
  .legal-links { flex-direction: row; }
  .legal-link-btn { flex: 1; }
}

@media (max-width: 400px) {
  .legal-link-sub { display: none; }
}
</style>