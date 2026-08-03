import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError
} from 'axios'

// ==============================
// INSTÂNCIA AXIOS
// ==============================

export const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  //baseURL: 'https://market-vizium.cloud',

  timeout: 30000, // Melhor para mobile

  headers: {
    'Content-Type': 'application/json',
    'mx54oivbd8a6x2fd89456plms9v72a64':'ap984xp3DOsS5f4a1sZkpOi47135LmNO'
  }
})

// ==============================
// INTERCEPTOR DE REQUISIÇÃO
// ==============================

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // ==========================
    // TOKEN
    // ==========================

    const token = localStorage.getItem('token')

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // ==========================
    // CONTENT TYPE
    // ==========================

    // Se for FormData → deixa navegador definir
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    } else {
      config.headers['Content-Type'] = 'application/json'
    }

    // ==========================
    // LOG REQUEST
    // ==========================

    

    return config
  },

  (error: AxiosError) => {

    return Promise.reject(error)
  }
)

// ==============================
// INTERCEPTOR DE RESPOSTA
// ==============================

api.interceptors.response.use(
  (response: AxiosResponse) => {
    

    return response
  },

  (error: AxiosError<any>) => {
    // ==========================
    // SERVIDOR RESPONDEU
    // ==========================


     if (error.response) {

      

    // ==========================
    // SEM RESPOSTA
    // ==========================

    } else if (error.request) {

      

    // ==========================
    // ERRO INTERNO
    // ==========================

    } else {

      
    }

    return Promise.reject(error)
  }
)