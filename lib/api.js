/**
 * Cliente HTTP para comunicación con el backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

/**
 * Obtiene el token del localStorage
 */
const getToken = () => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

/**
 * Realiza una petición HTTP al backend
 */
async function request(endpoint, options = {}) {
  const token = getToken()

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const config = {
    ...options,
    headers
  }

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body)
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
    const data = await response.json()

    if (!response.ok) {
      throw new ApiError(
        data.error || 'Error en la petición',
        response.status,
        data
      )
    }

    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(
      error.message || 'Error de conexión',
      0,
      null
    )
  }
}

/**
 * API Client
 */
export const api = {
  // Auth
  login: (usuario, contrasena) =>
    request('/api/auth/login', {
      method: 'POST',
      body: { usuario, contrasena }
    }),

  verify: () =>
    request('/api/auth/verify', { method: 'POST' }),

  // Chat
  chatControlador: (mensaje, contexto) =>
    request('/api/chat/controlador', {
      method: 'POST',
      body: { mensaje, contexto }
    }),

  chatIA: (mensaje, historial, contextoMarca) =>
    request('/api/chat/chatia', {
      method: 'POST',
      body: { mensaje, historial, contextoMarca }
    }),

  // Data
  getDatosMarca: (idMarca, all = false) =>
    request(`/api/data/marca?id=${idMarca || ''}&all=${all}`),

  addDato: (dato) =>
    request('/api/data/add', {
      method: 'POST',
      body: { dato }
    }),

  updateDato: (id, updates) =>
    request('/api/data/update', {
      method: 'PUT',
      body: { id, updates }
    }),

  deactivateDato: (id) =>
    request('/api/data/deactivate', {
      method: 'POST',
      body: { id }
    }),

  // Comments
  getComments: (idMarca, limite) =>
    request(`/api/comments?idMarca=${idMarca || ''}&limite=${limite || 100}`),

  queryComments: (filtros) =>
    request('/api/comments/query', {
      method: 'POST',
      body: { filtros }
    }),

  // Logs
  saveLogAction: (log) =>
    request('/api/logs/action', {
      method: 'POST',
      body: { log }
    }),

  saveChatMessage: (mensaje) =>
    request('/api/logs/chat', {
      method: 'POST',
      body: { mensaje }
    }),

  getChatHistory: (sesionId, limite) =>
    request(`/api/logs/chat?sesionId=${sesionId}&limite=${limite || 50}`),

  // Analysis
  analizarMarca: (datos, nombreMarca) =>
    request('/api/analysis/marca', {
      method: 'POST',
      body: { datos, nombreMarca }
    }),

  analizarComentarios: (datos, nombreMarca) =>
    request('/api/analysis/comentarios', {
      method: 'POST',
      body: { datos, nombreMarca }
    }),

  // Health
  health: () => request('/api/health')
}

export { ApiError }
export default api
