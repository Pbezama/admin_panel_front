'use client'

import { createContext, useContext, useState } from 'react'

const ViewContext = createContext(null)

export function ViewProvider({ children }) {
  const [vistaActiva, setVistaActiva] = useState('chat')
  const [contextoVista, setContextoVista] = useState(null)
  const [historialVistas, setHistorialVistas] = useState(['chat'])

  const navegarA = (vistaId, contexto = null) => {
    setHistorialVistas(prev => [...prev, vistaId])
    setVistaActiva(vistaId)
    setContextoVista(contexto)
  }

  const volverAlChat = () => {
    setVistaActiva('chat')
    setContextoVista(null)
  }

  const volverAtras = () => {
    if (historialVistas.length > 1) {
      const nuevoHistorial = [...historialVistas]
      nuevoHistorial.pop()
      const vistaAnterior = nuevoHistorial[nuevoHistorial.length - 1]
      setHistorialVistas(nuevoHistorial)
      setVistaActiva(vistaAnterior)
    } else {
      volverAlChat()
    }
  }

  const estaEnChat = vistaActiva === 'chat'

  const value = {
    vistaActiva,
    contextoVista,
    historialVistas,
    estaEnChat,
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
