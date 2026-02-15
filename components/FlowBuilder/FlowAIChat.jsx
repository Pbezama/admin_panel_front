'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'

const MENSAJE_SEED = 'Hola, quiero crear un flujo'

/**
 * Genera un resumen compacto del flujo actual para enviar a la IA
 * como contexto cuando el usuario pide modificaciones.
 */
function resumirFlujoActual(nodos, edges) {
  if (!nodos || nodos.length <= 1) return null

  const resumen = nodos
    .filter(n => n.type !== 'inicio')
    .map(n => {
      let detalle = n.type
      if (n.data?.texto) detalle += `: "${n.data.texto.slice(0, 60)}"`
      else if (n.data?.mensaje_despedida) detalle += `: "${n.data.mensaje_despedida.slice(0, 60)}"`
      else if (n.data?.mensaje_usuario) detalle += `: "${n.data.mensaje_usuario.slice(0, 60)}"`
      else if (n.data?.instrucciones) detalle += `: "${n.data.instrucciones.slice(0, 60)}"`
      else if (n.data?.variable) detalle += `: ${n.data.variable}`
      else if (n.data?.titulo) detalle += `: "${n.data.titulo.slice(0, 60)}"`
      return `  ${n.id} [${detalle}]`
    })
    .join('\n')

  const conexiones = edges
    .map(e => {
      let label = ''
      if (e.data?.condicion) {
        const c = e.data.condicion
        if (c.tipo === 'boton') label = ` (boton: ${c.valor})`
        else if (c.tipo === 'resultado_true') label = ' (Si)'
        else if (c.tipo === 'resultado_false') label = ' (No)'
      }
      return `  ${e.source} → ${e.target}${label}`
    })
    .join('\n')

  return `NODOS (${nodos.length}):\n${resumen}\n\nCONEXIONES (${edges.length}):\n${conexiones}`
}

export default function FlowAIChat({ flujo, onFlowGenerated, marcaNombre, nodosActuales, edgesActuales }) {
  const [mensajes, setMensajes] = useState([])
  const [input, setInput] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [minimizado, setMinimizado] = useState(false)
  const [vecesGenerado, setVecesGenerado] = useState(0)
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

      // Incluir resumen del flujo actual si ya hay nodos en el canvas
      const flujoActualResumen = resumirFlujoActual(nodosActuales, edgesActuales)

      const respuesta = await api.chatCreadorFlujos(
        texto,
        historial,
        {
          nombreMarca: marcaNombre || '',
          nombre: flujo?.nombre || '',
          trigger_tipo: flujo?.trigger_tipo || 'keyword',
          trigger_modo: flujo?.trigger_modo || 'contiene',
          trigger_valor: flujo?.trigger_valor || '',
          canales: flujo?.canales || [],
          flujoActual: flujoActualResumen
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

      // Si se genero/actualizo el flujo, notificar al padre
      if (respuesta.tipo === 'flujo_generado' && respuesta.flujo) {
        setVecesGenerado(prev => prev + 1)
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
    setVecesGenerado(0)
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

  const placeholderTexto = vecesGenerado > 0
    ? 'Pide cambios: "agrega un paso de...", "cambia el mensaje de...", "elimina..."'
    : 'Describe lo que necesitas...'

  return (
    <div className="flow-ai-chat">
      <div className="flow-ai-chat-header">
        <div className="flow-ai-chat-header-left">
          <span className="flow-ai-chat-icon">⚡</span>
          <span className="flow-ai-chat-title">Creador de Flujo con IA</span>
        </div>
        <div className="flow-ai-chat-header-right">
          {vecesGenerado > 0 && (
            <button className="flow-ai-chat-regenerate" onClick={handleRegenerar} title="Borrar todo y empezar desde cero">
              Desde cero
            </button>
          )}
          <button className="flow-ai-chat-minimize" onClick={() => setMinimizado(true)} title="Minimizar">
            ▼
          </button>
        </div>
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

            {/* Indicador de flujo generado/actualizado */}
            {m.tipo === 'flujo_generado' && (
              <div className="flow-ai-msg-success">
                ✓ Flujo actualizado en el canvas. Puedes seguir pidiendo cambios.
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

      {/* Input area - SIEMPRE visible */}
      <div className="flow-ai-chat-input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholderTexto}
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
    </div>
  )
}
