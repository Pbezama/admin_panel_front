'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useView } from '@/context/ViewContext'
import { api } from '@/lib/api'
import { getSupabaseClient } from '@/lib/supabaseClient'
import '@/styles/DashboardLiveView.css'

export default function DashboardLiveView() {
  const [conversaciones, setConversaciones] = useState([])
  const [seleccionada, setSeleccionada] = useState(null)
  const [mensajes, setMensajes] = useState([])
  const [inputMensaje, setInputMensaje] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje] = useState(null)

  const { usuario, marcaActiva } = useAuth()
  const { navegarA } = useView()
  const chatEndRef = useRef(null)
  const channelConvRef = useRef(null)
  const channelMsgRef = useRef(null)

  const mostrarMensaje = (texto, tipo = 'info') => {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje(null), 4000)
  }

  // Cargar conversaciones transferidas
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

  // Cargar mensajes de la conversacion seleccionada
  const cargarMensajes = useCallback(async (convId) => {
    try {
      const result = await api.getMensajesFlujo(convId)
      if (result.success) {
        setMensajes(result.data || [])
      }
    } catch (error) {
      console.error('Error cargando mensajes:', error)
    }
  }, [])

  // Seleccionar conversacion
  const seleccionarConversacion = useCallback((conv) => {
    setSeleccionada(conv)
    cargarMensajes(conv.id)
  }, [cargarMensajes])

  // Suscripciones Supabase Realtime
  useEffect(() => {
    cargarConversaciones()

    const supabase = getSupabaseClient()
    if (!supabase) return

    // Suscripcion a cambios en conversaciones_flujo
    channelConvRef.current = supabase
      .channel('dashboard-conversaciones')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversaciones_flujo'
      }, (payload) => {
        const { eventType, new: newRecord, old: oldRecord } = payload

        if (eventType === 'INSERT' && newRecord.estado === 'transferida') {
          setConversaciones(prev => [newRecord, ...prev])
          mostrarMensaje('Nueva conversacion transferida', 'info')
        }

        if (eventType === 'UPDATE') {
          if (newRecord.estado === 'transferida') {
            setConversaciones(prev => {
              const existe = prev.find(c => c.id === newRecord.id)
              if (existe) {
                return prev.map(c => c.id === newRecord.id ? { ...c, ...newRecord } : c)
              }
              return [newRecord, ...prev]
            })
          } else if (oldRecord?.estado === 'transferida' && newRecord.estado !== 'transferida') {
            setConversaciones(prev => prev.filter(c => c.id !== newRecord.id))
            if (seleccionada?.id === newRecord.id) {
              setSeleccionada(null)
              setMensajes([])
            }
          }
        }
      })
      .subscribe()

    return () => {
      if (channelConvRef.current) {
        supabase.removeChannel(channelConvRef.current)
      }
    }
  }, [cargarConversaciones])

  // Suscripcion a mensajes de la conversacion seleccionada
  useEffect(() => {
    const supabase = getSupabaseClient()
    if (!supabase || !seleccionada) return

    // Limpiar suscripcion anterior
    if (channelMsgRef.current) {
      supabase.removeChannel(channelMsgRef.current)
    }

    channelMsgRef.current = supabase
      .channel(`dashboard-mensajes-${seleccionada.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'mensajes_flujo',
        filter: `conversacion_id=eq.${seleccionada.id}`
      }, (payload) => {
        setMensajes(prev => [...prev, payload.new])
      })
      .subscribe()

    return () => {
      if (channelMsgRef.current) {
        supabase.removeChannel(channelMsgRef.current)
      }
    }
  }, [seleccionada?.id])

  // Auto-scroll al final
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  // Enviar respuesta
  const enviarRespuesta = async () => {
    if (!inputMensaje.trim() || !seleccionada || enviando) return

    setEnviando(true)
    try {
      const result = await api.responderConversacion(seleccionada.id, inputMensaje)
      if (result.success) {
        setInputMensaje('')
      } else {
        mostrarMensaje('Error al enviar mensaje', 'error')
      }
    } catch (error) {
      console.error('Error enviando:', error)
      mostrarMensaje('Error al enviar mensaje', 'error')
    } finally {
      setEnviando(false)
    }
  }

  // Cerrar conversacion
  const cerrarConversacion = async () => {
    if (!seleccionada) return
    try {
      const result = await api.cerrarConversacion(seleccionada.id, '')
      if (result.success) {
        mostrarMensaje('Conversacion cerrada', 'exito')
        setSeleccionada(null)
        setMensajes([])
        cargarConversaciones()
      }
    } catch (error) {
      mostrarMensaje('Error al cerrar', 'error')
    }
  }

  // Handle Enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviarRespuesta()
    }
  }

  // Formatear canal
  const formatCanal = (canal) => {
    const iconos = { whatsapp: '📱', instagram: '📸', web: '🌐' }
    return `${iconos[canal] || '💬'} ${canal}`
  }

  // Formatear fecha relativa
  const formatTiempo = (fecha) => {
    if (!fecha) return ''
    const diff = Date.now() - new Date(fecha).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'ahora'
    if (mins < 60) return `hace ${mins}m`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `hace ${hrs}h`
    return new Date(fecha).toLocaleDateString('es-CL')
  }

  return (
    <div className="dashboard-live-container">
      {/* Header */}
      <header className="dashboard-live-header">
        <div className="dashboard-live-header-left">
          <button className="dashboard-live-back" onClick={() => navegarA('chat')}>
            ← Volver
          </button>
          <h1>💬 Chat en Vivo</h1>
          <span className="dashboard-live-badge">{conversaciones.length} activas</span>
        </div>
        <div className="dashboard-live-header-right">
          <button className="dashboard-live-refresh" onClick={cargarConversaciones}>
            Actualizar
          </button>
        </div>
      </header>

      {mensaje && (
        <div className={`dashboard-live-toast ${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}

      <div className="dashboard-live-body">
        {/* Panel izquierdo: Lista de conversaciones */}
        <aside className="dashboard-live-sidebar">
          <div className="dashboard-live-sidebar-header">
            <h3>Conversaciones transferidas</h3>
          </div>
          <div className="dashboard-live-conv-list">
            {cargando ? (
              <div className="dashboard-live-empty">Cargando...</div>
            ) : conversaciones.length === 0 ? (
              <div className="dashboard-live-empty">
                No hay conversaciones transferidas.
                <br /><br />
                Cuando un flujo transfiera a humano, apareceran aqui en tiempo real.
              </div>
            ) : (
              conversaciones.map(conv => (
                <button
                  key={conv.id}
                  className={`dashboard-live-conv-item ${seleccionada?.id === conv.id ? 'active' : ''}`}
                  onClick={() => seleccionarConversacion(conv)}
                >
                  <div className="conv-item-header">
                    <span className="conv-item-canal">{formatCanal(conv.canal)}</span>
                    <span className="conv-item-tiempo">{formatTiempo(conv.actualizado_en)}</span>
                  </div>
                  <div className="conv-item-id">{conv.identificador_usuario}</div>
                  <div className="conv-item-flujo">{conv.flujos?.nombre || 'Flujo desconocido'}</div>
                  {conv.variables?.nombre_cliente && (
                    <div className="conv-item-nombre">{conv.variables.nombre_cliente}</div>
                  )}
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Panel central: Chat */}
        <main className="dashboard-live-chat">
          {!seleccionada ? (
            <div className="dashboard-live-no-selection">
              <div className="no-selection-icon">💬</div>
              <p>Selecciona una conversacion para responder</p>
            </div>
          ) : (
            <>
              {/* Header del chat */}
              <div className="dashboard-live-chat-header">
                <div className="chat-header-info">
                  <span className="chat-header-canal">{formatCanal(seleccionada.canal)}</span>
                  <span className="chat-header-user">{seleccionada.identificador_usuario}</span>
                  {seleccionada.variables?.nombre_cliente && (
                    <span className="chat-header-nombre">({seleccionada.variables.nombre_cliente})</span>
                  )}
                </div>
                <button className="chat-header-close" onClick={cerrarConversacion}>
                  Cerrar conversacion
                </button>
              </div>

              {/* Mensajes */}
              <div className="dashboard-live-messages">
                {mensajes.map((msg, i) => (
                  <div
                    key={msg.id || i}
                    className={`dashboard-live-msg ${msg.direccion === 'entrante' ? 'msg-entrante' : 'msg-saliente'} ${msg.tipo_nodo === 'ejecutivo_humano' ? 'msg-ejecutivo' : ''}`}
                  >
                    <div className="msg-bubble">
                      <div className="msg-contenido">{msg.contenido}</div>
                      <div className="msg-meta">
                        <span className="msg-tipo">{msg.tipo_nodo === 'ejecutivo_humano' ? 'Ejecutivo' : msg.tipo_nodo || ''}</span>
                        <span className="msg-hora">
                          {msg.creado_en ? new Date(msg.creado_en).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="dashboard-live-input">
                <textarea
                  value={inputMensaje}
                  onChange={(e) => setInputMensaje(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribe tu respuesta..."
                  disabled={enviando}
                  rows={2}
                />
                <button
                  className="dashboard-live-send"
                  onClick={enviarRespuesta}
                  disabled={!inputMensaje.trim() || enviando}
                >
                  {enviando ? '...' : 'Enviar'}
                </button>
              </div>
            </>
          )}
        </main>

        {/* Panel derecho: Info de la conversacion */}
        {seleccionada && (
          <aside className="dashboard-live-info">
            <h3>Detalles</h3>
            <div className="info-section">
              <label>Canal</label>
              <span>{formatCanal(seleccionada.canal)}</span>
            </div>
            <div className="info-section">
              <label>Usuario</label>
              <span>{seleccionada.identificador_usuario}</span>
            </div>
            <div className="info-section">
              <label>Flujo</label>
              <span>{seleccionada.flujos?.nombre || 'N/A'}</span>
            </div>
            <div className="info-section">
              <label>Inicio</label>
              <span>{seleccionada.creado_en ? new Date(seleccionada.creado_en).toLocaleString('es-CL') : 'N/A'}</span>
            </div>

            {seleccionada.variables && Object.keys(seleccionada.variables).length > 0 && (
              <>
                <h3 style={{ marginTop: '16px' }}>Variables capturadas</h3>
                {Object.entries(seleccionada.variables).map(([key, value]) => (
                  <div className="info-section" key={key}>
                    <label>{key}</label>
                    <span>{String(value)}</span>
                  </div>
                ))}
              </>
            )}
          </aside>
        )}
      </div>
    </div>
  )
}
