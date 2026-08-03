

// Removemos o import do toastService daqui de dentro para evitar conflito de instância
export default function exibeErro(payload: any, toast: any): void {
  

  // Se o toast não vier, tentamos usar o global, mas o ideal é vir do componente
  const t = toast; 

  if (!payload.response) {
    t.add({
      severity: 'error',
      summary: 'Erro de Rede',
      detail: payload.message || 'Certificado inválido ou servidor offline',
      life: 5000
    });
  } else {
    const data = payload.response.data;
    const cod = data?.COD || data?.body?.COD || payload.response.status;
    const msg = data?.MSG || data?.body?.MSG || 'Erro inesperado';

    t.add({
      severity: 'error',
      summary: `Erro: ${cod}`,
      detail: msg,
      life: 5000
    });
  }
}