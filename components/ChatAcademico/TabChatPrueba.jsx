'use client'

import { useState, useRef, useEffect } from 'react'
import { api } from '@/lib/api'
import {
  Send, Trash2, Loader2, Bot, User, Wrench,
  AlertTriangle, ChevronDown, ChevronRight,
  MessageSquare, Zap, ArrowRight, Database
} from 'lucide-react'

export default function TabChatPrueba() {
  const [mensaje, setMensaje] = useState('')
  const [historial, setHistorial] = useState([]) // historial completo para GPT (con tool_calls)
  const [mensajesUI, setMensajesUI] = useState([]) // mensajes para mostrar en UI
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)
  const [expandidos, setExpandidos] = useState({}) // controla que bloques estan expandidos
  const [conversationId, setConversationId] = useState(null) // ID persistente en Supabase
  const chatRef = useRef(null)
  const inputRef = useRef(null)
  const turnoRef = useRef(0) // contador de turnos

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [mensajesUI])

  const toggleExpandido = (key) => {
    setExpandidos(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const enviar = async () => {
    const texto = mensaje.trim()
    if (!texto || enviando) return

    setMensaje('')
    setError(null)
    const turnoActual = ++turnoRef.current

    // Agregar mensaje del usuario a la UI
    setMensajesUI(prev => [...prev, { role: 'user', content: texto, turno: turnoActual }])
    setEnviando(true)

    try {
      const res = await api.probarChatAcademico({
        mensaje: texto,
        historial,
        conversation_id: conversationId
      })

      if (res.success) {
        // Agregar bloque de tools con resumen de iteraciones
        if (res.tool_calls && res.tool_calls.length > 0) {
          setMensajesUI(prev => [...prev, {
            role: 'tools',
            calls: res.tool_calls,
            resumen_mb: res.resumen_mb,
            turno: turnoActual
          }])
        }

        // Agregar respuesta del bot
        setMensajesUI(prev => [...prev, {
          role: 'assistant',
          content: res.respuesta,
          resumen_mb: res.resumen_mb,
          turno: turnoActual
        }])

        // Actualizar historial completo (con tool_calls para memoria)
        setHistorial(res.historial_actualizado || [])
        // Guardar conversation_id para reutilizar en siguientes mensajes
        if (res.conversation_id) setConversationId(res.conversation_id)
      } else {
        setError(res.error || 'Error al procesar mensaje')
      }
    } catch (err) {
      setError(err.message || 'Error de conexion')
    } finally {
      setEnviando(false)
      inputRef.current?.focus()
    }
  }

  const limpiar = () => {
    setMensajesUI([])
    setHistorial([])
    setError(null)
    setMensaje('')
    setConversationId(null)
    turnoRef.current = 0
    setExpandidos({})
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviar()
    }
  }

  // Cuenta de turnos en historial
  const turnosEnMemoria = historial.filter(m => m.role === 'user').length

  return (
    <div className="ca-tab-content ca-chat-prueba">
      {/* Header */}
      <div className="ca-chat-header">
        <div className="ca-chat-header-info">
          <Bot size={20} />
          <div>
            <span className="ca-chat-title">Chat de Prueba</span>
            <span className="ca-chat-badge">MODO PRUEBA - No envia mensajes reales</span>
          </div>
        </div>
        <div className="ca-chat-header-actions">
          {turnosEnMemoria > 0 && (
            <span className="ca-chat-memoria-badge">
              <Database size={12} />
              {turnosEnMemoria} turnos en memoria
            </span>
          )}
          <button className="ca-btn ca-btn-ghost" onClick={limpiar} title="Limpiar conversacion">
            <Trash2 size={16} />
            Limpiar
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div className="ca-chat-messages" ref={chatRef}>
        {mensajesUI.length === 0 && (
          <div className="ca-chat-empty">
            <Bot size={40} className="ca-chat-empty-icon" />
            <p>Escribe un mensaje para probar el chatbot con la configuracion actual.</p>
            <p className="ca-chat-empty-hint">
              Las herramientas se ejecutan en PARALELO con datos reales de Google Sheets.
              <br />El chat mantiene memoria de las ultimas 20+ conversaciones.
            </p>
          </div>
        )}

        {mensajesUI.map((msg, i) => {
          if (msg.role === 'user') {
            return (
              <div key={i} className="ca-chat-msg ca-chat-msg-user">
                <div className="ca-chat-msg-avatar ca-avatar-user"><User size={14} /></div>
                <div className="ca-chat-msg-bubble ca-bubble-user">{msg.content}</div>
              </div>
            )
          }

          if (msg.role === 'tools') {
            const expandido = expandidos[`tools-${i}`] !== false // expandido por defecto
            const resumen = msg.resumen_mb || {}
            return (
              <div key={i} className="ca-chat-tools-block">
                {/* Etiqueta resumen clickeable */}
                <div
                  className="ca-chat-tools-summary"
                  onClick={() => toggleExpandido(`tools-${i}`)}
                >
                  <div className="ca-chat-tools-summary-left">
                    {expandido ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    <Zap size={14} className="ca-tools-icon" />
                    <span className="ca-tools-summary-text">
                      {msg.calls.length} herramienta{msg.calls.length > 1 ? 's' : ''} ejecutada{msg.calls.length > 1 ? 's' : ''}
                      {resumen.iteraciones_gpt > 1 && ` en ${resumen.iteraciones_gpt} iteraciones`}
                    </span>
                  </div>
                  <div className="ca-chat-tools-summary-tags">
                    {msg.calls.map((call, j) => (
                      <span key={j} className={`ca-tool-tag ca-tool-tag-${call.tipo}`}>
                        {call.nombre_display}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Detalle expandible */}
                {expandido && (
                  <div className="ca-chat-tools-detail">
                    {msg.calls.map((call, j) => (
                      <div key={j} className="ca-chat-tool-call">
                        <div className="ca-chat-tool-header">
                          <Wrench size={12} />
                          <span className="ca-chat-tool-name">{call.nombre_display}</span>
                          <span className={`ca-chat-tool-tipo ca-tipo-${call.tipo}`}>{call.tipo}</span>
                        </div>
                        {Object.keys(call.argumentos || {}).length > 0 && (
                          <div className="ca-chat-tool-args">
                            <span className="ca-tool-args-label">Args:</span> {JSON.stringify(call.argumentos)}
                          </div>
                        )}
                        <div className="ca-chat-tool-result">
                          <span className="ca-tool-result-label">Resultado:</span>
                          <pre className="ca-tool-result-pre">{call.resultado}</pre>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          }

          if (msg.role === 'assistant') {
            const resumen = msg.resumen_mb || {}
            const tieneTools = resumen.tools_ejecutadas > 0
            return (
              <div key={i} className="ca-chat-msg ca-chat-msg-bot">
                <div className="ca-chat-msg-avatar ca-avatar-bot"><Bot size={14} /></div>
                <div className="ca-chat-msg-content">
                  <div className="ca-chat-msg-bubble ca-bubble-bot">{msg.content}</div>
                  {/* Etiqueta MB: lo que se enviaria por WhatsApp */}
                  <div
                    className="ca-chat-mb-label"
                    onClick={() => toggleExpandido(`mb-${i}`)}
                  >
                    <MessageSquare size={12} />
                    <span>Respuesta a MessageBird</span>
                    {tieneTools && (
                      <span className="ca-mb-tools-count">
                        {resumen.tools_ejecutadas} tool{resumen.tools_ejecutadas > 1 ? 's' : ''}
                        {resumen.iteraciones_gpt > 1 && ` · ${resumen.iteraciones_gpt} iter.`}
                      </span>
                    )}
                    {expandidos[`mb-${i}`] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  </div>
                  {expandidos[`mb-${i}`] && (
                    <div className="ca-chat-mb-detail">
                      <div className="ca-mb-row">
                        <span className="ca-mb-key">Texto enviado:</span>
                        <span className="ca-mb-val">{resumen.texto_enviado?.substring(0, 200)}{resumen.texto_enviado?.length > 200 ? '...' : ''}</span>
                      </div>
                      <div className="ca-mb-row">
                        <span className="ca-mb-key">Tools ejecutadas:</span>
                        <span className="ca-mb-val">{resumen.tools_ejecutadas || 0}</span>
                      </div>
                      <div className="ca-mb-row">
                        <span className="ca-mb-key">Iteraciones GPT:</span>
                        <span className="ca-mb-val">{resumen.iteraciones_gpt || 1}</span>
                      </div>
                      {resumen.herramientas_usadas?.length > 0 && (
                        <div className="ca-mb-row">
                          <span className="ca-mb-key">Herramientas:</span>
                          <span className="ca-mb-val">{resumen.herramientas_usadas.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          }

          return null
        })}

        {enviando && (
          <div className="ca-chat-msg ca-chat-msg-bot">
            <div className="ca-chat-msg-avatar ca-avatar-bot"><Bot size={14} /></div>
            <div className="ca-chat-msg-bubble ca-bubble-bot ca-typing">
              <Loader2 className="ca-spinner" size={16} /> Pensando...
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="ca-chat-error">
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      {/* Input */}
      <div className="ca-chat-input-area">
        <textarea
          ref={inputRef}
          className="ca-chat-input"
          value={mensaje}
          onChange={e => setMensaje(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un mensaje de prueba..."
          rows={1}
          disabled={enviando}
        />
        <button
          className="ca-chat-send"
          onClick={enviar}
          disabled={!mensaje.trim() || enviando}
        >
          {enviando ? <Loader2 className="ca-spinner" size={18} /> : <Send size={18} />}
        </button>
      </div>
    </div>
  )
}
