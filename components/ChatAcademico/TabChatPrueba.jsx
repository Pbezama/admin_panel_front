'use client'

import { useState, useRef, useEffect } from 'react'
import { api } from '@/lib/api'
import { Send, Trash2, Loader2, Bot, User, Wrench, AlertTriangle } from 'lucide-react'

export default function TabChatPrueba() {
  const [mensaje, setMensaje] = useState('')
  const [historial, setHistorial] = useState([])
  const [mensajesUI, setMensajesUI] = useState([])
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)
  const chatRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [mensajesUI])

  const enviar = async () => {
    const texto = mensaje.trim()
    if (!texto || enviando) return

    setMensaje('')
    setError(null)

    // Agregar mensaje del usuario a la UI
    setMensajesUI(prev => [...prev, { role: 'user', content: texto }])
    setEnviando(true)

    try {
      const res = await api.probarChatAcademico({
        mensaje: texto,
        historial
      })

      if (res.success) {
        // Agregar tool calls si hubo
        if (res.tool_calls && res.tool_calls.length > 0) {
          setMensajesUI(prev => [...prev, { role: 'tools', calls: res.tool_calls }])
        }

        // Agregar respuesta del bot
        setMensajesUI(prev => [...prev, { role: 'assistant', content: res.respuesta }])

        // Actualizar historial para contexto
        setHistorial(res.historial_actualizado || [])
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
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviar()
    }
  }

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
        <button className="ca-btn ca-btn-ghost" onClick={limpiar} title="Limpiar conversacion">
          <Trash2 size={16} />
          Limpiar
        </button>
      </div>

      {/* Messages area */}
      <div className="ca-chat-messages" ref={chatRef}>
        {mensajesUI.length === 0 && (
          <div className="ca-chat-empty">
            <Bot size={40} className="ca-chat-empty-icon" />
            <p>Escribe un mensaje para probar el chatbot con la configuracion actual.</p>
            <p className="ca-chat-empty-hint">Las herramientas tipo Google Sheets y Python mostraran respuestas simuladas.</p>
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
            return (
              <div key={i} className="ca-chat-tools">
                {msg.calls.map((call, j) => (
                  <div key={j} className="ca-chat-tool-call">
                    <div className="ca-chat-tool-header">
                      <Wrench size={12} />
                      <span className="ca-chat-tool-name">{call.nombre_display}</span>
                      <span className="ca-chat-tool-tipo">{call.tipo}</span>
                    </div>
                    {Object.keys(call.argumentos).length > 0 && (
                      <div className="ca-chat-tool-args">
                        Args: {JSON.stringify(call.argumentos)}
                      </div>
                    )}
                    <div className="ca-chat-tool-result">{call.resultado}</div>
                  </div>
                ))}
              </div>
            )
          }

          if (msg.role === 'assistant') {
            return (
              <div key={i} className="ca-chat-msg ca-chat-msg-bot">
                <div className="ca-chat-msg-avatar ca-avatar-bot"><Bot size={14} /></div>
                <div className="ca-chat-msg-bubble ca-bubble-bot">{msg.content}</div>
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
