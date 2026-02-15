'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useView } from '@/context/ViewContext'
import { api } from '@/lib/api'
import '@/styles/DashboardLiveView.css'

const CANAL_ICONOS = { whatsapp: '📱', instagram: '📸', web: '🌐' }

function formatHora(fecha) {
  if (!fecha) return ''
  return new Date(fecha).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
}

function formatTiempoRelativo(fecha) {
  if (!fecha) return ''
  const diff = Date.now() - new Date(fecha).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'ahora'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const dias = Math.floor(hrs / 24)
  if (dias < 7) return `${dias}d`
  return new Date(fecha).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' })
}

function formatTimer(segundos) {
  const m = Math.floor(segundos / 60)
  const s = segundos % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

const EMOJIS_FRECUENTES = [
  '😊', '😂', '❤️', '👍', '🙏', '😍', '🔥', '✅',
  '👋', '😄', '🎉', '💪', '😉', '🤗', '👏', '💯',
  '⭐', '🌟', '💬', '📌', '✨', '🙌', '😎', '🤝',
  '📞', '📧', '🕐', '📅', '💡', '⚡', '🎯', '📣'
]

export default function DashboardLiveView() {
  const [conversaciones, setConversaciones] = useState([])
  const [seleccionada, setSeleccionada] = useState(null)
  const [mensajes, setMensajes] = useState([])
  const [inputMensaje, setInputMensaje] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [toast, setToast] = useState(null)
  const [mostrarInfo, setMostrarInfo] = useState(false)
  const [mostrarEmojis, setMostrarEmojis] = useState(false)

  // Audio
  const [grabando, setGrabando] = useState(false)
  const [tiempoGrabacion, setTiempoGrabacion] = useState(0)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const timerGrabacionRef = useRef(null)
  const canceladoRef = useRef(false)
  const streamRef = useRef(null)
  const emojiRef = useRef(null)

  // Archivos adjuntos
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const fileInputRef = useRef(null)

  const { usuario, marcaActiva } = useAuth()
  const { navegarA } = useView()
  const chatEndRef = useRef(null)
  const inputRef = useRef(null)

  const mostrarToast = (texto, tipo = 'info') => {
    setToast({ texto, tipo })
    setTimeout(() => setToast(null), 3000)
  }

  // ── Cargar datos ──
  const cargarConversaciones = useCallback(async () => {
    try {
      const result = await api.getConversacionesTransferidas()
      if (result.success) {
        setConversaciones(result.conversaciones || [])
      }
    } catch (error) {
      console.error('Error cargando conversaciones:', error)
    } finally {
      setCargando(false)
    }
  }, [])

  const cargarMensajes = useCallback(async (convId) => {
    try {
      const result = await api.getMensajesFlujo(convId)
      if (result.success) {
        setMensajes(prev => {
          const nuevos = result.mensajes || []
          // Mantener mensajes optimistas que aun no llegaron al servidor
          const optimistas = prev.filter(m => m._optimista && !nuevos.some(n => n.contenido === m.contenido && n.direccion === m.direccion))
          return [...nuevos, ...optimistas]
        })
      }
    } catch (error) {
      console.error('Error cargando mensajes:', error)
    }
  }, [])

  const seleccionarConversacion = useCallback((conv) => {
    setSeleccionada(conv)
    setMostrarInfo(false)
    cargarMensajes(conv.id)
  }, [cargarMensajes])

  // ── Polling de conversaciones (siempre activo) ──
  useEffect(() => {
    cargarConversaciones()

    const interval = setInterval(() => {
      cargarConversaciones()
    }, 5000)

    return () => clearInterval(interval)
  }, [cargarConversaciones])

  // ── Polling de mensajes (siempre activo cuando hay conversacion seleccionada) ──
  useEffect(() => {
    if (!seleccionada) return

    const interval = setInterval(() => {
      cargarMensajes(seleccionada.id)
    }, 3000)

    return () => clearInterval(interval)
  }, [seleccionada?.id, cargarMensajes])

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  // ── Enviar mensaje de texto ──
  const enviarRespuesta = async () => {
    if (!inputMensaje.trim() || !seleccionada || enviando) return

    const texto = inputMensaje.trim()
    setInputMensaje('')
    setEnviando(true)

    // Update optimista
    const msgOptimista = {
      _optimista: true,
      id: `opt_${Date.now()}`,
      conversacion_id: seleccionada.id,
      direccion: 'saliente',
      contenido: texto,
      tipo_nodo: 'ejecutivo_humano',
      creado_en: new Date().toISOString(),
      metadata: { ejecutivo_nombre: usuario?.nombre }
    }
    setMensajes(prev => [...prev, msgOptimista])

    try {
      const result = await api.responderConversacion(seleccionada.id, texto)
      if (!result.success) {
        mostrarToast('Error al enviar mensaje', 'error')
        // Remover optimista
        setMensajes(prev => prev.filter(m => m.id !== msgOptimista.id))
      }
    } catch (error) {
      console.error('Error enviando:', error)
      mostrarToast('Error al enviar: ' + (error.message || 'Error desconocido'), 'error')
      setMensajes(prev => prev.filter(m => m.id !== msgOptimista.id))
    } finally {
      setEnviando(false)
      inputRef.current?.focus()
    }
  }

  // ── Audio ──
  const iniciarGrabacion = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []
      canceladoRef.current = false

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop())
        if (canceladoRef.current) {
          audioChunksRef.current = []
          return
        }
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const reader = new FileReader()
        reader.onloadend = () => {
          enviarAudio(reader.result)
        }
        reader.readAsDataURL(audioBlob)
      }

      mediaRecorder.start()
      setGrabando(true)
      setTiempoGrabacion(0)
      timerGrabacionRef.current = setInterval(() => setTiempoGrabacion(t => t + 1), 1000)
    } catch (err) {
      console.error('Error accediendo microfono:', err)
      mostrarToast('No se pudo acceder al microfono', 'error')
    }
  }

  const detenerGrabacion = () => {
    canceladoRef.current = false
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    setGrabando(false)
    clearInterval(timerGrabacionRef.current)
  }

  const cancelarGrabacion = () => {
    canceladoRef.current = true
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    setGrabando(false)
    clearInterval(timerGrabacionRef.current)
    setTiempoGrabacion(0)
  }

  const enviarAudio = async (base64Audio) => {
    if (!seleccionada || !base64Audio) return

    setEnviando(true)

    // Update optimista
    const msgOptimista = {
      _optimista: true,
      id: `opt_audio_${Date.now()}`,
      conversacion_id: seleccionada.id,
      direccion: 'saliente',
      contenido: '🎤 Mensaje de voz',
      tipo_nodo: 'ejecutivo_humano',
      creado_en: new Date().toISOString(),
      metadata: { ejecutivo_nombre: usuario?.nombre, audio: base64Audio }
    }
    setMensajes(prev => [...prev, msgOptimista])

    try {
      const result = await api.responderConversacion(seleccionada.id, '🎤 Mensaje de voz', base64Audio)
      if (!result.success) {
        mostrarToast('Error al enviar audio', 'error')
        setMensajes(prev => prev.filter(m => m.id !== msgOptimista.id))
      }
    } catch (error) {
      console.error('Error enviando audio:', error)
      mostrarToast('Error al enviar audio', 'error')
      setMensajes(prev => prev.filter(m => m.id !== msgOptimista.id))
    } finally {
      setEnviando(false)
    }
  }

  // ── Archivos adjuntos ──
  const seleccionarArchivo = (e) => {
    const archivo = e.target.files?.[0]
    if (!archivo) return

    if (archivo.size > 10 * 1024 * 1024) {
      mostrarToast('Archivo muy grande (max 10MB)', 'error')
      return
    }

    setArchivoSeleccionado(archivo)

    if (archivo.type.startsWith('image/')) {
      const url = URL.createObjectURL(archivo)
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }
  }

  const cancelarArchivo = () => {
    setArchivoSeleccionado(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const enviarArchivo = async () => {
    if (!archivoSeleccionado || !seleccionada || enviando) return

    setEnviando(true)
    const esImagen = archivoSeleccionado.type.startsWith('image/')
    const contenido = esImagen
      ? `📷 Imagen: ${archivoSeleccionado.name}`
      : `📎 Documento: ${archivoSeleccionado.name}`

    const msgOptimista = {
      _optimista: true,
      id: `opt_media_${Date.now()}`,
      conversacion_id: seleccionada.id,
      direccion: 'saliente',
      contenido,
      tipo_nodo: 'ejecutivo_humano',
      creado_en: new Date().toISOString(),
      metadata: {
        ejecutivo_nombre: usuario?.nombre,
        tipo_media: esImagen ? 'image' : 'document',
        url_media: previewUrl,
        nombre_archivo: archivoSeleccionado.name
      }
    }
    setMensajes(prev => [...prev, msgOptimista])

    try {
      const result = await api.enviarMediaConversacion(seleccionada.id, archivoSeleccionado)
      if (!result.success) {
        mostrarToast('Error al enviar archivo', 'error')
        setMensajes(prev => prev.filter(m => m.id !== msgOptimista.id))
      }
    } catch (error) {
      console.error('Error enviando archivo:', error)
      mostrarToast('Error al enviar: ' + (error.message || 'Error desconocido'), 'error')
      setMensajes(prev => prev.filter(m => m.id !== msgOptimista.id))
    } finally {
      setEnviando(false)
      cancelarArchivo()
    }
  }

  // ── Cerrar conversacion ──
  const cerrarConversacion = async () => {
    if (!seleccionada) return
    if (!confirm('Cerrar esta conversacion?')) return
    try {
      const result = await api.cerrarConversacion(seleccionada.id, '')
      if (result.success) {
        mostrarToast('Conversacion cerrada', 'exito')
        setSeleccionada(null)
        setMensajes([])
        cargarConversaciones()
      }
    } catch (error) {
      mostrarToast('Error al cerrar', 'error')
    }
  }

  // ── Keyboard ──
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviarRespuesta()
    }
  }

  // Insertar emoji
  const insertarEmoji = (emoji) => {
    setInputMensaje(prev => prev + emoji)
    inputRef.current?.focus()
  }

  // Cerrar emoji picker al hacer click fuera
  useEffect(() => {
    if (!mostrarEmojis) return
    const handleClickOutside = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setMostrarEmojis(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [mostrarEmojis])

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      clearInterval(timerGrabacionRef.current)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
      }
    }
  }, [])

  // ── Render helpers ──
  const getUltimoMensaje = (conv) => {
    // No tenemos el ultimo mensaje en la lista, mostramos el flujo
    return conv.flujos?.nombre || 'Conversacion'
  }

  const getNombreContacto = (conv) => {
    if (conv.variables?.nombre_cliente) return conv.variables.nombre_cliente
    if (conv.variables?.nombre) return conv.variables.nombre
    const id = conv.identificador_usuario || ''
    if (conv.canal === 'whatsapp' && id.length > 6) {
      return '+' + id.replace(/^(\d{2})(\d+)(\d{4})$/, '$1 *** $3')
    }
    return id
  }

  const getIniciales = (conv) => {
    const nombre = getNombreContacto(conv)
    if (!nombre) return '?'
    const partes = nombre.split(' ')
    if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase()
    return nombre.substring(0, 2).toUpperCase()
  }

  const getColorAvatar = (conv) => {
    const colores = ['#25d366', '#128c7e', '#075e54', '#34b7f1', '#00a884', '#02735e']
    const idx = (conv.id || 0) % colores.length
    return colores[idx]
  }

  return (
    <div className="wsp-container">
      {/* Toast */}
      {toast && (
        <div className={`wsp-toast wsp-toast-${toast.tipo}`}>
          {toast.texto}
        </div>
      )}

      {/* ── Sidebar ── */}
      <aside className="wsp-sidebar">
        <div className="wsp-sidebar-header">
          <button className="wsp-back-btn" onClick={() => navegarA('chat')} title="Volver">
            ←
          </button>
          <h2>Chat en Vivo</h2>
          <span className="wsp-badge">{conversaciones.length}</span>
        </div>

        <div className="wsp-conv-list">
          {cargando ? (
            <div className="wsp-empty">Cargando...</div>
          ) : conversaciones.length === 0 ? (
            <div className="wsp-empty">
              Sin conversaciones transferidas.
              <br />Cuando un flujo transfiera a humano, aparecera aqui.
            </div>
          ) : (
            conversaciones.map(conv => (
              <button
                key={conv.id}
                className={`wsp-conv-item ${seleccionada?.id === conv.id ? 'active' : ''}`}
                onClick={() => seleccionarConversacion(conv)}
              >
                <div className="wsp-avatar" style={{ background: getColorAvatar(conv) }}>
                  {getIniciales(conv)}
                </div>
                <div className="wsp-conv-info">
                  <div className="wsp-conv-top">
                    <span className="wsp-conv-nombre">{getNombreContacto(conv)}</span>
                    <span className="wsp-conv-hora">{formatTiempoRelativo(conv.actualizado_en)}</span>
                  </div>
                  <div className="wsp-conv-bottom">
                    <span className="wsp-conv-canal">{CANAL_ICONOS[conv.canal] || '💬'}</span>
                    <span className="wsp-conv-preview">{getUltimoMensaje(conv)}</span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* ── Chat ── */}
      <main className="wsp-chat">
        {!seleccionada ? (
          <div className="wsp-no-chat">
            <div className="wsp-no-chat-icon">💬</div>
            <h3>Chat en Vivo CreceTec</h3>
            <p>Selecciona una conversacion para responder al cliente</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="wsp-chat-header">
              <div className="wsp-chat-header-left" onClick={() => setMostrarInfo(!mostrarInfo)}>
                <div className="wsp-avatar wsp-avatar-sm" style={{ background: getColorAvatar(seleccionada) }}>
                  {getIniciales(seleccionada)}
                </div>
                <div className="wsp-chat-header-info">
                  <span className="wsp-chat-nombre">{getNombreContacto(seleccionada)}</span>
                  <span className="wsp-chat-status">
                    {CANAL_ICONOS[seleccionada.canal]} {seleccionada.canal} · {seleccionada.identificador_usuario}
                  </span>
                </div>
              </div>
              <div className="wsp-chat-header-actions">
                <button className="wsp-header-btn" onClick={() => setMostrarInfo(!mostrarInfo)} title="Info">
                  ℹ️
                </button>
                <button className="wsp-header-btn wsp-header-btn-close" onClick={cerrarConversacion} title="Cerrar conversacion">
                  ✕
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="wsp-messages">
              {/* Fecha separator */}
              {mensajes.length > 0 && (
                <div className="wsp-date-separator">
                  <span>{new Date(mensajes[0]?.creado_en || Date.now()).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
              )}

              {mensajes.map((msg, i) => {
                const esSaliente = msg.direccion === 'saliente'
                const esAudioBase64 = msg.metadata?.audio
                const esAudioUrl = msg.metadata?.tipo_media === 'audio' && msg.metadata?.url_media
                const esImagen = msg.metadata?.tipo_media === 'image'
                const esDocumento = msg.metadata?.tipo_media === 'document'
                const esOptimista = msg._optimista

                return (
                  <div key={msg.id || i} className={`wsp-msg ${esSaliente ? 'wsp-msg-out' : 'wsp-msg-in'}`}>
                    <div className={`wsp-bubble ${esSaliente ? 'wsp-bubble-out' : 'wsp-bubble-in'}`}>
                      {!esSaliente && msg.tipo_nodo && msg.tipo_nodo !== 'ejecutivo_humano' && (
                        <div className="wsp-bubble-label">
                          {msg.tipo_nodo === 'respuesta_usuario' ? 'Cliente' : msg.tipo_nodo}
                        </div>
                      )}
                      {esSaliente && msg.metadata?.ejecutivo_nombre && (
                        <div className="wsp-bubble-label wsp-bubble-label-out">
                          {msg.metadata.ejecutivo_nombre}
                        </div>
                      )}

                      {esImagen ? (
                        <div className="wsp-bubble-image">
                          <a href={msg.metadata.url_media} target="_blank" rel="noopener noreferrer">
                            <img src={msg.metadata.url_media} alt={msg.metadata.nombre_archivo || 'Imagen'} />
                          </a>
                          {msg.contenido && !msg.contenido.startsWith('📷') && !msg.contenido.startsWith('[') && (
                            <div className="wsp-bubble-text">{msg.contenido}</div>
                          )}
                        </div>
                      ) : esDocumento ? (
                        <a className="wsp-bubble-document" href={msg.metadata.url_media} target="_blank" rel="noopener noreferrer">
                          <span className="wsp-doc-icon">📄</span>
                          <span className="wsp-doc-name">{msg.metadata.nombre_archivo || 'Documento'}</span>
                          <span className="wsp-doc-download">⬇</span>
                        </a>
                      ) : esAudioBase64 ? (
                        <div className="wsp-audio-msg">
                          <audio controls src={msg.metadata.audio} preload="none" />
                        </div>
                      ) : esAudioUrl ? (
                        <div className="wsp-audio-msg">
                          <audio controls src={msg.metadata.url_media} preload="none" />
                        </div>
                      ) : (
                        <div className="wsp-bubble-text">{msg.contenido}</div>
                      )}

                      <div className="wsp-bubble-meta">
                        <span className="wsp-bubble-hora">{formatHora(msg.creado_en)}</span>
                        {esSaliente && (
                          <span className={`wsp-checks ${esOptimista ? 'wsp-checks-pending' : 'wsp-checks-sent'}`}>
                            {esOptimista ? '✓' : '✓✓'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}

              <div ref={chatEndRef} />
            </div>

            {/* Preview bar */}
            {archivoSeleccionado && (
              <div className="wsp-preview-bar">
                <div className="wsp-preview-content">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="wsp-preview-img" />
                  ) : (
                    <span className="wsp-preview-doc-icon">📄</span>
                  )}
                  <span className="wsp-preview-name">{archivoSeleccionado.name}</span>
                  <span className="wsp-preview-size">
                    {(archivoSeleccionado.size / 1024).toFixed(0)} KB
                  </span>
                </div>
                <div className="wsp-preview-actions">
                  <button className="wsp-preview-cancel" onClick={cancelarArchivo}>✕</button>
                  <button className="wsp-preview-send" onClick={enviarArchivo} disabled={enviando}>
                    {enviando ? '...' : '➤'}
                  </button>
                </div>
              </div>
            )}

            {/* Input bar */}
            <div className="wsp-input-bar">
              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={seleccionarArchivo}
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                style={{ display: 'none' }}
              />

              {grabando ? (
                <div className="wsp-recording">
                  <button className="wsp-rec-cancel" onClick={cancelarGrabacion} title="Cancelar">
                    ✕
                  </button>
                  <div className="wsp-rec-indicator">
                    <span className="wsp-rec-dot"></span>
                    <span className="wsp-rec-timer">{formatTimer(tiempoGrabacion)}</span>
                  </div>
                  <button className="wsp-rec-send" onClick={detenerGrabacion} title="Enviar audio">
                    ➤
                  </button>
                </div>
              ) : (
                <>
                  <div className="wsp-input-area">
                    {/* Emoji picker */}
                    {mostrarEmojis && (
                      <div className="wsp-emoji-picker" ref={emojiRef}>
                        <div className="wsp-emoji-grid">
                          {EMOJIS_FRECUENTES.map((emoji, i) => (
                            <button
                              key={i}
                              className="wsp-emoji-btn"
                              onClick={() => insertarEmoji(emoji)}
                              type="button"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="wsp-input-wrapper">
                      <button
                        className="wsp-attach-btn"
                        onClick={() => fileInputRef.current?.click()}
                        type="button"
                        title="Adjuntar archivo"
                        disabled={enviando}
                      >
                        📎
                      </button>
                      <button
                        className="wsp-emoji-toggle"
                        onClick={() => setMostrarEmojis(!mostrarEmojis)}
                        type="button"
                        title="Emojis"
                      >
                        😊
                      </button>
                      <textarea
                        ref={inputRef}
                        value={inputMensaje}
                        onChange={(e) => setInputMensaje(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Escribe un mensaje"
                        disabled={enviando}
                        rows={1}
                      />
                    </div>
                  </div>

                  <button
                    className="wsp-send-btn"
                    onClick={enviarRespuesta}
                    disabled={enviando || !inputMensaje.trim()}
                    title="Enviar"
                  >
                    ➤
                  </button>
                  <button
                    className="wsp-mic-btn"
                    onClick={iniciarGrabacion}
                    disabled={enviando}
                    title="Grabar audio"
                  >
                    🎤
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </main>

      {/* ── Info panel ── */}
      {seleccionada && mostrarInfo && (
        <aside className="wsp-info-panel">
          <div className="wsp-info-header">
            <button className="wsp-info-close" onClick={() => setMostrarInfo(false)}>✕</button>
            <span>Info del contacto</span>
          </div>

          <div className="wsp-info-avatar-section">
            <div className="wsp-avatar wsp-avatar-lg" style={{ background: getColorAvatar(seleccionada) }}>
              {getIniciales(seleccionada)}
            </div>
            <h3>{getNombreContacto(seleccionada)}</h3>
            <p>{seleccionada.identificador_usuario}</p>
          </div>

          <div className="wsp-info-section">
            <h4>Detalles</h4>
            <div className="wsp-info-row">
              <span className="wsp-info-label">Canal</span>
              <span>{CANAL_ICONOS[seleccionada.canal]} {seleccionada.canal}</span>
            </div>
            <div className="wsp-info-row">
              <span className="wsp-info-label">Flujo</span>
              <span>{seleccionada.flujos?.nombre || 'N/A'}</span>
            </div>
            <div className="wsp-info-row">
              <span className="wsp-info-label">Inicio</span>
              <span>{seleccionada.creado_en ? new Date(seleccionada.creado_en).toLocaleString('es-CL') : 'N/A'}</span>
            </div>
          </div>

          {seleccionada.variables && Object.keys(seleccionada.variables).length > 0 && (
            <div className="wsp-info-section">
              <h4>Variables capturadas</h4>
              {Object.entries(seleccionada.variables).map(([key, value]) => (
                <div className="wsp-info-row" key={key}>
                  <span className="wsp-info-label">{key}</span>
                  <span>{String(value)}</span>
                </div>
              ))}
            </div>
          )}
        </aside>
      )}
    </div>
  )
}
