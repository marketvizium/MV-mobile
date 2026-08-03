<template>
    <ion-refresher 
        slot="fixed" 
        @ionRefresh="handleRefresh" 
        pull-factor="0.5" 
        pull-min="100" 
        pull-max="200"
      >
        <ion-refresher-content 
          pulling-text="Puxe para atualizar..."
          refreshing-spinner="circles"
          refreshing-text="Recarregando plataforma...">
        </ion-refresher-content>
      </ion-refresher>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { IonRefresher, IonRefresherContent, } from '@ionic/vue';

export default defineComponent({
  name: 'RefresherIonic',

  components: {
    IonRefresher, 
    IonRefresherContent,
  },
  methods: {
    handleRefresh(event: any) {
      // O evento 'complete()' para o spinner do Ionic antes do reload total
      setTimeout(() => {
        event.target.complete();
        window.location.reload();
      }, 1000);
    },
  },

});
</script>