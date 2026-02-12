'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import '@/styles/WebChat.css'

function generarSessionId() {
  return 'web_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9)
}

export default function WebChatPage() {
  const { marcaId } = useParams()
  const [mensajes, setMensajes] = useState([])
  const [inputTexto, setInputTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [marca, setMarca] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [sessionId, setSessionId] = useState('')
  const [error, setError] = useState(null)

  const chatEndRef = useRef(null)
  const inputRef = useRef(null)

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

  // Inicializar session
  useEffect(() => {
    let sid = sessionStorage.getItem(`webchat_session_${marcaId}`)
    if (!sid) {
      sid = generarSessionId()
      sessionStorage.setItem(`webchat_session_${marcaId}`, sid)
    }
    setSessionId(sid)
  }, [marcaId])

  // Cargar info de la marca
  useEffect(() => {
    async function cargarMarca() {
      try {
        const res = await fetch(`${API_BASE}/api/webchat/${marcaId}/info`)
        const data = await res.json()
        if (data.success && data.marca) {
          setMarca(data.marca)
        } else {
          setError('Chat no disponible')
        }
      } catch {
        setError('Error de conexion')
      } finally {
        setCargando(false)
      }
    }
    if (marcaId) cargarMarca()
  }, [marcaId, API_BASE])

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  // Enviar mensaje
  const enviarMensaje = useCallback(async (texto) => {
    if (!texto?.trim() || !sessionId || enviando) return

    const textoFinal = texto.trim()

    // Agregar mensaje del usuario
    setMensajes(prev => [...prev, { direccion: 'entrante', contenido: textoFinal, tipo: 'texto' }])
    setInputTexto('')
    setEnviando(true)

    try {
      const res = await fetch(`${API_BASE}/api/webchat/${marcaId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, mensaje: textoFinal })
      })

      const data = await res.json()

      if (data.success && data.respuestas) {
        // Agregar todas las respuestas del bot
        const nuevos = data.respuestas.map(r => ({
          direccion: 'saliente',
          contenido: r.contenido,
          tipo: r.tipo,
          botones: r.botones || null,
          opciones: r.opciones || null,
          botonTexto: r.botonTexto || null
        }))
        setMensajes(prev => [...prev, ...nuevos])
      } else if (data.error) {
        setMensajes(prev => [...prev, { direccion: 'saliente', contenido: data.error, tipo: 'error' }])
      }
    } catch {
      setMensajes(prev => [...prev, { direccion: 'saliente', contenido: 'Error de conexion. Intenta de nuevo.', tipo: 'error' }])
    } finally {
      setEnviando(false)
      inputRef.current?.focus()
    }
  }, [sessionId, enviando, marcaId, API_BASE])

  // Click en boton
  const handleBotonClick = (boton) => {
    enviarMensaje(boton.id || boton.texto)
  }

  // Click en opcion de lista
  const handleOpcionClick = (opcion) => {
    enviarMensaje(opcion.id || opcion.titulo)
  }

  // Handle Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviarMensaje(inputTexto)
    }
  }

  if (cargando) {
    return (
      <div className="webchat-loading">
        <div className="webchat-spinner" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="webchat-error">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="webchat-container">
      {/* Header */}
      <header className="webchat-header">
        <div className="webchat-header-info">
          <div className="webchat-avatar">{marca?.nombre?.[0] || '?'}</div>
          <div>
            <h1 className="webchat-brand-name">{marca?.nombre || 'Chat'}</h1>
            <span className="webchat-status">En linea</span>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="webchat-messages">
        {mensajes.length === 0 && (
          <div className="webchat-welcome">
            <p>Hola! Escribe un mensaje para comenzar.</p>
          </div>
        )}

        {mensajes.map((msg, i) => (
          <div key={i} className={`webchat-msg ${msg.direccion === 'entrante' ? 'msg-user' : 'msg-bot'} ${msg.tipo === 'error' ? 'msg-error' : ''}`}>
            <div className="webchat-bubble">
              <p>{msg.contenido}</p>

              {/* Botones */}
              {msg.tipo === 'botones' && msg.botones && (
                <div className="webchat-botones">
                  {msg.botones.map((btn, j) => (
                    <button
                      key={j}
                      className="webchat-boton"
                      onClick={() => handleBotonClick(btn)}
                      disabled={enviando}
                    >
                      {btn.texto}
                    </button>
                  ))}
                </div>
              )}

              {/* Lista */}
              {msg.tipo === 'lista' && msg.opciones && (
                <div className="webchat-lista">
                  {msg.opciones.map((opt, j) => (
                    <button
                      key={j}
                      className="webchat-opcion"
                      onClick={() => handleOpcionClick(opt)}
                      disabled={enviando}
                    >
                      <span className="opcion-titulo">{opt.titulo}</span>
                      {opt.descripcion && <span className="opcion-desc">{opt.descripcion}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {enviando && (
          <div className="webchat-msg msg-bot">
            <div className="webchat-bubble webchat-typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="webchat-input-area">
        <input
          ref={inputRef}
          type="text"
          value={inputTexto}
          onChange={(e) => setInputTexto(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un mensaje..."
          disabled={enviando}
          autoFocus
        />
        <button
          className="webchat-send"
          onClick={() => enviarMensaje(inputTexto)}
          disabled={!inputTexto.trim() || enviando}
        >
          ➤
        </button>
      </div>
    </div>
  )
}
