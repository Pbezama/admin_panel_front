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

  // Super admin: inyectar marca activa en todas las peticiones
  try {
    const marcaGuardada = localStorage.getItem('marcaActiva')
    if (marcaGuardada) {
      const marca = JSON.parse(marcaGuardada)
      if (marca?.id_marca) {
        headers['X-Marca-ID'] = String(marca.id_marca)
        if (marca.nombre_marca) {
          headers['X-Marca-Nombre'] = encodeURIComponent(marca.nombre_marca)
        }
      }
    }
  } catch (e) {
    // Ignorar errores de localStorage/parsing
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

  register: (nombre, email, empresa, password) =>
    request('/api/auth/register', {
      method: 'POST',
      body: { nombre, email, empresa, password }
    }),

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

  chatCreadorFlujos: (mensaje, historial, contextoFlujo) =>
    request('/api/chat/creador-flujos', {
      method: 'POST',
      body: { mensaje, historial, contextoFlujo }
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

  // Tareas
  getTareas: (estado) =>
    request(`/api/tareas${estado ? `?estado=${estado}` : ''}`),

  crearTarea: (tarea) =>
    request('/api/tareas', {
      method: 'POST',
      body: tarea
    }),

  updateTarea: (id, updates) =>
    request(`/api/tareas/${id}`, {
      method: 'PUT',
      body: updates
    }),

  cambiarEstadoTarea: (id, estado, extras = {}) =>
    request(`/api/tareas/${id}`, {
      method: 'PUT',
      body: { estado, ...extras }
    }),

  deleteTarea: (id) =>
    request(`/api/tareas/${id}`, {
      method: 'DELETE'
    }),

  getColaboradores: () =>
    request('/api/tareas/colaboradores'),

  // Notas de Tareas
  getNotasTarea: (idTarea) =>
    request(`/api/tareas/${idTarea}/notas`),

  agregarNotaTarea: (idTarea, nota) =>
    request(`/api/tareas/${idTarea}/notas`, {
      method: 'POST',
      body: nota
    }),

  // Historial de Tareas
  getHistorialTarea: (idTarea) =>
    request(`/api/tareas/${idTarea}/historial`),

  // Upload de archivos
  uploadArchivoTarea: async (idTarea, archivo) => {
    const token = getToken()
    const formData = new FormData()
    formData.append('archivo', archivo)

    const response = await fetch(`${API_BASE_URL}/api/tareas/${idTarea}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })

    const data = await response.json()
    if (!response.ok) {
      throw new ApiError(data.error || 'Error subiendo archivo', response.status, data)
    }
    return data
  },

  // Todos los archivos (admin)
  getTodosLosArchivos: () =>
    request('/api/tareas/archivos'),

  // Publicaciones Pendientes (Reglas)
  getPublicacionesPendientes: () =>
    request('/api/reglas/pendientes'),

  aprobarPublicacion: (postId, tareaId) =>
    request('/api/reglas/aprobar', {
      method: 'POST',
      body: { postId, accion: 'aprobar', tareaId }
    }),

  rechazarPublicacion: (postId, tareaId) =>
    request('/api/reglas/aprobar', {
      method: 'POST',
      body: { postId, accion: 'rechazar', tareaId }
    }),

  modificarPublicacion: (id, campos) =>
    request('/api/reglas/modificar', {
      method: 'PUT',
      body: { id, campos }
    }),

  // Notificaciones persistentes
  getNotificaciones: (soloNoLeidas = true) =>
    request(`/api/notificaciones?solo_no_leidas=${soloNoLeidas}`),

  marcarNotificacionesLeidas: (ids) =>
    request('/api/notificaciones/leer', { method: 'POST', body: { ids } }),

  // Informes Instagram
  getInformes: (marcaId) =>
    request(`/api/informes${marcaId ? `?marca_id=${marcaId}` : ''}`),

  getInformeHtmlUrl: (id, marcaId) => {
    const token = getToken()
    let url = `${API_BASE_URL}/api/informes/${id}/html?token=${token}`
    if (marcaId) url += `&marca_id=${marcaId}`
    return url
  },

  // Marcas
  getMarcasInstagram: () => request('/api/marcas/instagram'),

  getSitioWebMarca: () => request('/api/marcas/sitio-web'),

  // Entrenador de Marca
  uploadDocumentosEntrenador: async (archivos) => {
    const token = getToken()
    const formData = new FormData()
    for (const archivo of archivos) {
      formData.append('archivos', archivo)
    }

    const headers = { 'Authorization': `Bearer ${token}` }
    try {
      const marcaGuardada = localStorage.getItem('marcaActiva')
      if (marcaGuardada) {
        const marca = JSON.parse(marcaGuardada)
        if (marca?.id_marca) {
          headers['X-Marca-ID'] = String(marca.id_marca)
          if (marca.nombre_marca) headers['X-Marca-Nombre'] = encodeURIComponent(marca.nombre_marca)
        }
      }
    } catch (e) {}

    const response = await fetch(`${API_BASE_URL}/api/entrenador/upload`, {
      method: 'POST',
      headers,
      body: formData
    })
    const data = await response.json()
    if (!response.ok) throw new ApiError(data.error || 'Error subiendo archivos', response.status, data)
    return data
  },

  getDocumentosEntrenador: () =>
    request('/api/entrenador/documentos'),

  eliminarDocumentoEntrenador: (id) =>
    request(`/api/entrenador/documentos/${id}`, { method: 'DELETE' }),

  procesarEntrenador: () =>
    request('/api/entrenador/procesar', { method: 'POST' }),

  getConocimientoEntrenador: (estado) =>
    request(`/api/entrenador/conocimiento${estado ? `?estado=${estado}` : ''}`),

  aprobarConocimiento: (datos) =>
    request('/api/entrenador/aprobar', { method: 'POST', body: datos }),

  aprobarReglasEntrenador: (datos) =>
    request('/api/entrenador/aprobar-reglas', { method: 'POST', body: datos }),

  // Flujos Conversacionales
  getFlujos: () =>
    request('/api/flujos'),

  crearFlujo: (flujo) =>
    request('/api/flujos', { method: 'POST', body: flujo }),

  getFlujo: (id) =>
    request(`/api/flujos/${id}`),

  actualizarFlujo: (id, datos) =>
    request(`/api/flujos/${id}`, { method: 'PUT', body: datos }),

  eliminarFlujo: (id) =>
    request(`/api/flujos/${id}`, { method: 'DELETE' }),

  activarFlujo: (id, estado) =>
    request(`/api/flujos/${id}/activar`, { method: 'POST', body: { estado } }),

  duplicarFlujo: (id) =>
    request(`/api/flujos/${id}/duplicar`, { method: 'POST', body: {} }),

  getFlujosTemplates: () =>
    request('/api/flujos-templates'),

  crearFlujoSeed: (idMarca) =>
    request('/api/flujos-seed', { method: 'POST', body: { id_marca: idMarca } }),

  getConversacionesFlujo: (estado) =>
    request(`/api/conversaciones-flujo${estado ? `?estado=${estado}` : ''}`),

  getMensajesFlujo: (conversacionId) =>
    request(`/api/conversaciones-flujo/${conversacionId}/mensajes`),

  getLogsFlujo: (conversacionId) =>
    request(`/api/conversaciones-flujo/${conversacionId}/logs`),

  getConversacionesMonitor: (filtros = {}) => {
    const params = new URLSearchParams()
    if (filtros.flujo_id) params.set('flujo_id', filtros.flujo_id)
    if (filtros.canal) params.set('canal', filtros.canal)
    if (filtros.estado) params.set('estado', filtros.estado)
    if (filtros.desde) params.set('desde', filtros.desde)
    if (filtros.hasta) params.set('hasta', filtros.hasta)
    const qs = params.toString()
    return request(`/api/conversaciones-flujo/monitor${qs ? `?${qs}` : ''}`)
  },

  // Google Calendar
  getGoogleCalendarStatus: () =>
    request('/api/google/status'),

  getGoogleAuthUrl: (callbackUrl) =>
    request(`/api/google/auth?callback_url=${encodeURIComponent(callbackUrl || window.location.origin)}`),

  disconnectGoogleCalendar: () =>
    request('/api/google/disconnect', { method: 'POST' }),

  // Dashboard Live
  getConversacionesTransferidas: () =>
    request('/api/dashboard-live/conversaciones'),

  responderConversacion: (id, mensaje, audio = null) =>
    request(`/api/dashboard-live/conversaciones/${id}/responder`, { method: 'POST', body: { mensaje, audio } }),

  enviarMediaConversacion: async (id, archivo) => {
    const token = getToken()
    const formData = new FormData()
    formData.append('archivo', archivo)

    const headers = {}
    if (token) headers['Authorization'] = `Bearer ${token}`
    try {
      const marcaGuardada = localStorage.getItem('marcaActiva')
      if (marcaGuardada) {
        const marca = JSON.parse(marcaGuardada)
        if (marca?.id_marca) {
          headers['X-Marca-ID'] = String(marca.id_marca)
          if (marca.nombre_marca) headers['X-Marca-Nombre'] = encodeURIComponent(marca.nombre_marca)
        }
      }
    } catch (e) { /* ignore */ }

    const response = await fetch(`${API_BASE_URL}/api/dashboard-live/conversaciones/${id}/media`, {
      method: 'POST',
      headers,
      body: formData
    })
    const data = await response.json()
    if (!response.ok) throw new ApiError(data.error || 'Error subiendo archivo', response.status, data)
    return data
  },

  cerrarConversacion: (id, mensajeDespedida) =>
    request(`/api/dashboard-live/conversaciones/${id}/cerrar`, { method: 'POST', body: { mensaje_despedida: mensajeDespedida } }),

  asignarEjecutivo: (id, ejecutivoId) =>
    request(`/api/dashboard-live/conversaciones/${id}/asignar`, { method: 'POST', body: { ejecutivo_id: ejecutivoId } }),

  // Reportes (Generador)
  getReporteTipos: () =>
    request('/api/reportes/query'),

  queryReporte: (tipo, filtros = {}) =>
    request('/api/reportes/query', {
      method: 'POST',
      body: { tipo, filtros }
    }),

  exportReporte: async (tipo, filtros = {}, formato) => {
    const token = getToken()
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
    try {
      const marcaGuardada = localStorage.getItem('marcaActiva')
      if (marcaGuardada) {
        const marca = JSON.parse(marcaGuardada)
        if (marca?.id_marca) {
          headers['X-Marca-ID'] = String(marca.id_marca)
          if (marca.nombre_marca) headers['X-Marca-Nombre'] = encodeURIComponent(marca.nombre_marca)
        }
      }
    } catch (e) {}

    const response = await fetch(`${API_BASE_URL}/api/reportes/export`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ tipo, filtros, formato })
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new ApiError(data.error || 'Error exportando reporte', response.status, data)
    }

    const blob = await response.blob()
    const ext = formato === 'excel' ? 'xlsx' : formato
    const fecha = new Date().toISOString().split('T')[0]
    const filename = `reporte_${tipo}_${fecha}.${ext}`

    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    return { success: true }
  },

  generarReporteHTML: (tipo, filtros = {}, guardar = false) =>
    request('/api/reportes/html', {
      method: 'POST',
      body: { tipo, filtros, guardar }
    }),

  getReporteCacheUrl: (cacheId) => {
    const token = getToken()
    return `${API_BASE_URL}/api/reportes/cache/${cacheId}?token=${token}`
  },

  // Generar Informe RRSS (Instagram Analytics)
  generarInformeRRSS: (periodoDesde, periodoHasta, guardar = true) =>
    request('/api/reportes/informe-rrss', {
      method: 'POST',
      body: { periodo_desde: periodoDesde, periodo_hasta: periodoHasta, guardar }
    }),

  // Health
  health: () => request('/api/health')
}

export { ApiError }
export default api
