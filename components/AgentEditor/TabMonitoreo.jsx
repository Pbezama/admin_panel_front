'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

export default function TabMonitoreo({ agente, mostrarMensaje }) {
  const [conversaciones, setConversaciones] = useState([])
  const [convHistorico, setConvHistorico] = useState([])
  const [chatAbierto, setChatAbierto] = useState(null)
  const [mensajes, setMensajes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [vistaHistorico, setVistaHistorico] = useState(false)

  useEffect(() => {
    if (agente?.id) cargarConversaciones()
  }, [agente?.id])

  const cargarConversaciones = async () => {
    setCargando(true)
    try {
      const [resActivas, resHistorico] = await Promise.all([
        api.getConversacionesAgente(agente.id, 'activa'),
        api.getConversacionesAgente(agente.id, 'completada')
      ])

      if (resActivas.success) setConversaciones(resActivas.conversaciones || [])
      if (resHistorico.success) setConvHistorico(resHistorico.conversaciones || [])
    } catch (err) {
      console.error('Error cargando conversaciones:', err)
    } finally {
      setCargando(false)
    }
  }

  const verChat = async (convId) => {
    try {
      const res = await api.getMensajesConvAgente(convId)
      if (res.success) {
        setMensajes(res.mensajes || [])
        setChatAbierto(convId)
      }
    } catch (err) {
      mostrarMensaje('Error al cargar mensajes', 'error')
    }
  }

  const cerrarConv = async (convId) => {
    if (!confirm('¿Cerrar esta conversacion?')) return
    try {
      const res = await api.cerrarConvAgente(convId)
      if (res.success) {
        mostrarMensaje('Conversacion cerrada')
        cargarConversaciones()
        setChatAbierto(null)
      }
    } catch (err) {
      mostrarMensaje('Error al cerrar', 'error')
    }
  }

  const formatTiempo = (fecha) => {
    if (!fecha) return ''
    const d = new Date(fecha)
    const ahora = new Date()
    const diffMs = ahora - d
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 1) return 'Ahora'
    if (diffMin < 60) return `${diffMin}m`
    const diffH = Math.floor(diffMin / 60)
    if (diffH < 24) return `${diffH}h`
    return d.toLocaleDateString()
  }

  const totalActivas = conversaciones.length
  const totalHistorico = convHistorico.length
  const promedioTurnos = convHistorico.length > 0
    ? Math.round(convHistorico.reduce((sum, c) => sum + (c.agente_turnos || 0), 0) / convHistorico.length)
    : 0

  // Vista de chat abierto
  if (chatAbierto) {
    return (
      <>
        <button className="agente-chat-back-btn" onClick={() => setChatAbierto(null)}>
          ← Volver a conversaciones
        </button>
        <div className="agente-chat-view">
          {mensajes.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#94a3b8' }}>Sin mensajes</p>
          ) : (
            mensajes.map((msg, idx) => (
              <div key={idx} className={`agente-chat-msg agente-chat-msg-${msg.rol || msg.role || 'assistant'}`}>
                <div className="agente-chat-bubble">
                  {msg.contenido || msg.content || msg.mensaje || ''}
                </div>
                <span className="agente-chat-time">{formatTiempo(msg.creado_en)}</span>
              </div>
            ))
          )}
        </div>
        {conversaciones.find(c => c.id === chatAbierto) && (
          <div style={{ marginTop: 12, textAlign: 'right' }}>
            <button className="agente-conv-btn-cerrar" onClick={() => cerrarConv(chatAbierto)}>
              Cerrar conversacion manualmente
            </button>
          </div>
        )}
      </>
    )
  }

  return (
    <>
      {/* Stats */}
      <div className="agente-monitor-stats">
        <div className="agente-stat-card">
          <div className="agente-stat-value">{totalActivas}</div>
          <div className="agente-stat-label">Conversaciones activas</div>
        </div>
        <div className="agente-stat-card">
          <div className="agente-stat-value">{totalHistorico}</div>
          <div className="agente-stat-label">Total historico</div>
        </div>
        <div className="agente-stat-card">
          <div className="agente-stat-value">{promedioTurnos}</div>
          <div className="agente-stat-label">Promedio turnos</div>
        </div>
      </div>

      {/* Toggle activas/historico */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          className={`agente-tab-btn ${!vistaHistorico ? 'active' : ''}`}
          onClick={() => setVistaHistorico(false)}
          style={{ padding: '6px 16px', borderRadius: 8, border: '1px solid #e2e8f0' }}
        >
          Activas ({totalActivas})
        </button>
        <button
          className={`agente-tab-btn ${vistaHistorico ? 'active' : ''}`}
          onClick={() => setVistaHistorico(true)}
          style={{ padding: '6px 16px', borderRadius: 8, border: '1px solid #e2e8f0' }}
        >
          Historico ({totalHistorico})
        </button>
      </div>

      {cargando ? (
        <div className="agente-monitor-empty">Cargando...</div>
      ) : (
        <>
          {!vistaHistorico ? (
            conversaciones.length === 0 ? (
              <div className="agente-monitor-empty">No hay conversaciones activas con este agente</div>
            ) : (
              <div className="agente-conv-list">
                {conversaciones.map(conv => (
                  <div key={conv.id} className="agente-conv-card">
                    <div className="agente-conv-info">
                      <span className="agente-conv-user">
                        {conv.canal}: {conv.identificador_usuario}
                      </span>
                      <span className="agente-conv-meta">
                        {conv.agente_turnos || 0} turnos | Iniciada {formatTiempo(conv.creado_en)}
                      </span>
                    </div>
                    <div className="agente-conv-actions">
                      <button className="agente-conv-btn-ver" onClick={() => verChat(conv.id)}>Ver chat</button>
                      <button className="agente-conv-btn-cerrar" onClick={() => cerrarConv(conv.id)}>Cerrar</button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            convHistorico.length === 0 ? (
              <div className="agente-monitor-empty">Sin conversaciones historicas</div>
            ) : (
              <div className="agente-conv-list">
                {convHistorico.map(conv => (
                  <div key={conv.id} className="agente-conv-card">
                    <div className="agente-conv-info">
                      <span className="agente-conv-user">
                        {conv.canal}: {conv.identificador_usuario}
                      </span>
                      <span className="agente-conv-meta">
                        {conv.agente_turnos || 0} turnos | {formatTiempo(conv.actualizado_en)}
                      </span>
                    </div>
                    <div className="agente-conv-actions">
                      <button className="agente-conv-btn-ver" onClick={() => verChat(conv.id)}>Ver chat</button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </>
      )}
    </>
  )
}
