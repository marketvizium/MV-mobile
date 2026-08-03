// toastService.ts
import { ToastMessageOptions } from 'primevue/toast';

let toastInstance: any = null;

export const setToast = (instance: any) => {
  toastInstance = instance;
};

export const toastService = {
  success(msg: string) {
    toastInstance?.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: msg,
      life: 3000
    });
  },

  error(msg: string, cod: string | number, err: string) {
    toastInstance?.add({
      severity: 'error',
      summary: 'Erro',
      detail: `${msg} COD:${cod}, MSG: ${err}`,
      life: 5000
    });
  },

  info(msg: string) {
    toastInstance?.add({
      severity: 'info',
      summary: 'Info',
      detail: msg,
      life: 3000
    });
  }
};