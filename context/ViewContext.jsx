'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const ViewContext = createContext(null)

// Parsear URL actual → vista + contexto
function parseUrlToView() {
  if (typeof window === 'undefined') return { vista: 'chat', contexto: null }
  const path = window.location.pathname.replace('/chat', '').split('/').filter(Boolean)
  // [] → chat
  // ['tareas'] → tareas
  // ['flujos'] → flujos (lista)
  // ['flujos', 'editor', '123'] → flujos con sub=editor, id=123
  // ['flujos', 'monitor'] → flujos con sub=monitor
  // ['flujos', 'nuevo'] → flujos con sub=nuevo
  const vista = path[0] || 'chat'
  let contexto = null
  if (path.length > 1) {
    contexto = { sub: path[1], id: path[2] || null }
  }
  return { vista, contexto }
}

// Generar URL desde vista + contexto
function viewToUrl(vistaId, contexto) {
  if (vistaId === 'chat' || !vistaId) return '/chat'
  let url = '/chat/' + vistaId
  if (contexto?.sub) url += '/' + contexto.sub
  if (contexto?.id) url += '/' + contexto.id
  return url
}

export function ViewProvider({ children }) {
  const [vistaActiva, setVistaActiva] = useState('chat')
  const [contextoVista, setContextoVista] = useState(null)
  const [historialVistas, setHistorialVistas] = useState(['chat'])
  const [inicializado, setInicializado] = useState(false)

  // Inicializar desde URL al montar
  useEffect(() => {
    const { vista, contexto } = parseUrlToView()
    if (vista !== 'chat') {
      setVistaActiva(vista)
      setContextoVista(contexto)
      setHistorialVistas(['chat', vista])
    }
    setInicializado(true)

    // Escuchar boton atras/adelante del navegador
    const handlePopState = () => {
      const { vista, contexto } = parseUrlToView()
      setVistaActiva(vista)
      setContextoVista(contexto)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navegarA = useCallback((vistaId, contexto = null) => {
    const url = viewToUrl(vistaId, contexto)
    window.history.pushState({ vistaId, contexto }, '', url)
    setVistaActiva(vistaId)
    setContextoVista(contexto)
    setHistorialVistas(prev => [...prev, vistaId])
  }, [])

  const volverAlChat = useCallback(() => {
    window.history.pushState({}, '', '/chat')
    setVistaActiva('chat')
    setContextoVista(null)
  }, [])

  const volverAtras = useCallback(() => {
    window.history.back()
  }, [])

  const estaEnChat = vistaActiva === 'chat'

  const value = {
    vistaActiva,
    contextoVista,
    historialVistas,
    estaEnChat,
    inicializado,
    navegarA,
    volverAlChat,
    volverAtras
  }

  return (
    <ViewContext.Provider value={value}>
      {children}
    </ViewContext.Provider>
  )
}

export function useView() {
  const context = useContext(ViewContext)
  if (!context) {
    throw new Error('useView debe usarse dentro de ViewProvider')
  }
  return context
}

export default ViewContext
