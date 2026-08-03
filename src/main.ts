import { createApp } from 'vue'
import App from './App.vue'
import router from './router';
//import 'material-symbols'
import { IonicVue } from '@ionic/vue';
import './assets/fonts.css'

/* CSS do Ionic */
import '@ionic/vue/css/core.css';
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';
import './theme/variables.css';

import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

/* PrimeVue 4.5.4 + PrimeUIX */
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura'; 
import ToastService from 'primevue/toastservice';
import Toast from 'primevue/toast';
import 'primeicons/primeicons.css';

/** * IMPORTANTE: Importe o setToast do seu arquivo de serviço
 * Certifique-se de que o caminho abaixo está correto para o seu projeto
 */
import { setToast } from './services/toast'; 

const app = createApp(App)
  .use(IonicVue)
  .use(router)
  .use(ToastService);

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)

app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            cssLayer: false,
            darkModeSelector: false 
        }
    },
    locale: {
        firstDayOfWeek: 0,
        dayNames: ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'],
        dayNamesShort: ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'],
        dayNamesMin: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
        monthNames: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
        monthNamesShort: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
        today: 'Hoje',
        clear: 'Limpar'
    }
});

app.component('Toast', Toast);

router.isReady().then(() => {
  // 1. Montamos o app e guardamos a instância retornada (Root Component)
  const vm = app.mount('#app');

  // 2. Vinculamos o $toast do Vue ao seu serviço global
  // Agora o toastService.error() saberá qual instância do PrimeVue usar
  if (vm.$toast) {
    setToast(vm.$toast);
  }
});