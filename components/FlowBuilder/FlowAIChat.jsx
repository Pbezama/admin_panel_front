'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'

const MENSAJE_SEED = 'Hola, quiero crear un flujo'

export default function FlowAIChat({ flujo, onFlowGenerated, marcaNombre }) {
  const [mensajes, setMensajes] = useState([])
  const [input, setInput] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [minimizado, setMinimizado] = useState(false)
  const [flujoGenerado, setFlujoGenerado] = useState(false)
  const chatEndRef = useRef(null)
  const iniciadoRef = useRef(false)

  // Auto-inicio: si el flujo tiene solo el nodo inicio (nuevo), arrancar la conversacion
  useEffect(() => {
    if (iniciadoRef.current) return
    const esNuevo = flujo && (!flujo.nodos || flujo.nodos.length <= 1)
    if (esNuevo) {
      iniciadoRef.current = true
      enviarMensaje(MENSAJE_SEED)
    }
  }, [flujo?.id])

  const scrollAlFinal = useCallback(() => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 50)
  }, [])

  useEffect(() => {
    scrollAlFinal()
  }, [mensajes, scrollAlFinal])

  const enviarMensaje = async (texto) => {
    if (!texto?.trim() || enviando) return

    const mensajeUsuario = { rol: 'user', contenido: texto, tipo: 'texto' }
    const nuevosMensajes = [...mensajes, mensajeUsuario]
    setMensajes(nuevosMensajes)
    setInput('')
    setEnviando(true)

    try {
      const historial = nuevosMensajes.map(m => ({
        rol: m.rol,
        contenido: m.contenido,
        tipo: m.tipo
      }))

      const respuesta = await api.chatCreadorFlujos(
        texto,
        historial,
        {
          nombreMarca: marcaNombre || '',
          nombre: flujo?.nombre || '',
          trigger_tipo: flujo?.trigger_tipo || 'keyword',
          trigger_valor: flujo?.trigger_valor || '',
          canales: flujo?.canales || []
        }
      )

      const mensajeIA = {
        rol: 'assistant',
        contenido: respuesta.contenido || '',
        tipo: respuesta.tipo || 'texto',
        opciones: respuesta.opciones || null,
        flujo: respuesta.flujo || null
      }

      setMensajes(prev => [...prev, mensajeIA])

      // Si se genero el flujo, notificar al padre
      if (respuesta.tipo === 'flujo_generado' && respuesta.flujo) {
        setFlujoGenerado(true)
        onFlowGenerated(respuesta.flujo)
      }

    } catch (error) {
      console.error('[FlowAIChat] Error:', error)
      setMensajes(prev => [...prev, {
        rol: 'assistant',
        contenido: 'Error al procesar: ' + (error.message || 'intenta de nuevo'),
        tipo: 'error'
      }])
    } finally {
      setEnviando(false)
    }
  }

  const handleOpcionClick = (opcion) => {
    if (!enviando) enviarMensaje(opcion)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviarMensaje(input)
    }
  }

  const handleRegenerar = () => {
    setFlujoGenerado(false)
    setMensajes([])
    iniciadoRef.current = false
    setTimeout(() => {
      iniciadoRef.current = true
      enviarMensaje(MENSAJE_SEED)
    }, 100)
  }

  // Minimizado
  if (minimizado) {
    return (
      <div className="flow-ai-chat-minimized" onClick={() => setMinimizado(false)}>
        <span className="flow-ai-chat-icon">⚡</span>
        <span>Creador de Flujo con IA</span>
        <span className="flow-ai-chat-expand">▲</span>
      </div>
    )
  }

  // Filtrar el mensaje seed de la vista
  const mensajesVisibles = mensajes.filter(m =>
    !(m.rol === 'user' && m.contenido === MENSAJE_SEED)
  )

  return (
    <div className="flow-ai-chat">
      <div className="flow-ai-chat-header">
        <div className="flow-ai-chat-header-left">
          <span className="flow-ai-chat-icon">⚡</span>
          <span className="flow-ai-chat-title">Creador de Flujo con IA</span>
        </div>
        <button className="flow-ai-chat-minimize" onClick={() => setMinimizado(true)} title="Minimizar">
          ▼
        </button>
      </div>

      <div className="flow-ai-chat-messages">
        {mensajesVisibles.map((m, i) => (
          <div key={i} className={`flow-ai-msg flow-ai-msg-${m.rol}`}>
            <div className={`flow-ai-msg-content ${m.tipo === 'error' ? 'flow-ai-msg-error' : ''}`}>
              {m.contenido}
            </div>

            {/* Opciones clickeables */}
            {m.tipo === 'pregunta_ia' && m.opciones && m.opciones.length > 0 && (
              <div className="flow-ai-msg-opciones">
                {m.opciones.map((op, j) => (
                  <button
                    key={j}
                    className="flow-ai-opcion-btn"
                    onClick={() => handleOpcionClick(op)}
                    disabled={enviando || i < mensajesVisibles.length - 1}
                  >
                    {op}
                  </button>
                ))}
              </div>
            )}

            {/* Indicador de flujo generado */}
            {m.tipo === 'flujo_generado' && (
              <div className="flow-ai-msg-success">
                ✓ Flujo generado con exito. Revisa el canvas de arriba.
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {enviando && (
          <div className="flow-ai-msg flow-ai-msg-assistant">
            <div className="flow-ai-msg-typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input area */}
      {!flujoGenerado && (
        <div className="flow-ai-chat-input-area">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe lo que necesitas..."
            disabled={enviando}
            className="flow-ai-chat-input"
          />
          <button
            onClick={() => enviarMensaje(input)}
            disabled={enviando || !input.trim()}
            className="flow-ai-chat-send"
          >
            {enviando ? '...' : 'Enviar'}
          </button>
        </div>
      )}

      {/* Estado completado */}
      {flujoGenerado && (
        <div className="flow-ai-chat-done">
          <span>Flujo generado. Puedes editarlo manualmente en el canvas.</span>
          <button className="flow-ai-chat-regenerate" onClick={handleRegenerar}>
            Regenerar
          </button>
        </div>
      )}
    </div>
  )
}
