'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import TabPrompt from '@/components/ChatAcademico/TabPrompt'
import TabHerramientas from '@/components/ChatAcademico/TabHerramientas'
import TabConversacion from '@/components/ChatAcademico/TabConversacion'
import TabChatPrueba from '@/components/ChatAcademico/TabChatPrueba'
import { GraduationCap, FileText, Wrench, MessageSquare, Bot, History, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import '@/styles/ChatAcademicoView.css'

const TABS = [
  { id: 'instrucciones', label: 'Instrucciones', icon: FileText },
  { id: 'herramientas', label: 'Herramientas', icon: Wrench },
  { id: 'conversacion', label: 'Conversacion', icon: MessageSquare },
  { id: 'chat-prueba', label: 'Chat de Prueba', icon: Bot },
]

export default function ChatAcademicoView() {
  const { usuario, marcaActiva } = useAuth()
  const [config, setConfig] = useState(null)
  const [herramientas, setHerramientas] = useState([])
  const [historial, setHistorial] = useState([])
  const [tabActiva, setTabActiva] = useState('instrucciones')
  const [cargando, setCargando] = useState(true)
  const [activando, setActivando] = useState(false)
  const [mostrarHistorial, setMostrarHistorial] = useState(false)
  const [mensaje, setMensaje] = useState(null)

  useEffect(() => {
    cargarDatos()
  }, [marcaActiva?.id_marca])

  const cargarDatos = async () => {
    setCargando(true)
    try {
      const [resConfig, resHerramientas, resHistorial] = await Promise.all([
        api.getChatAcademicoConfig(),
        api.getChatAcademicoHerramientas(),
        api.getChatAcademicoHistorial(30)
      ])

      if (resConfig.success) setConfig(resConfig.data)
      if (resHerramientas.success) setHerramientas(resHerramientas.data || [])
      if (resHistorial.success) setHistorial(resHistorial.data || [])
    } catch (err) {
      console.error('Error cargando datos chat academico:', err)
    } finally {
      setCargando(false)
    }
  }

  const activarChatAcademico = async () => {
    setActivando(true)
    try {
      const res = await api.crearChatAcademicoConfig({})
      if (res.success) {
        mostrarMensaje('Chat Academico activado correctamente', 'exito')
        await cargarDatos()
      } else {
        mostrarMensaje(res.error || 'Error al activar', 'error')
      }
    } catch (err) {
      mostrarMensaje('Error al activar Chat Academico', 'error')
    } finally {
      setActivando(false)
    }
  }

  const mostrarMensaje = (texto, tipo = 'exito') => {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje(null), 4000)
  }

  const recargarHerramientas = async () => {
    try {
      const res = await api.getChatAcademicoHerramientas()
      if (res.success) setHerramientas(res.data || [])
    } catch (err) {
      console.error('Error recargando herramientas:', err)
    }
  }

  const recargarHistorial = async () => {
    try {
      const res = await api.getChatAcademicoHistorial(30)
      if (res.success) setHistorial(res.data || [])
    } catch (err) {
      console.error('Error recargando historial:', err)
    }
  }

  if (cargando) {
    return (
      <div className="ca-view">
        <div className="ca-loading">
          <Loader2 className="ca-spinner" size={32} />
          <p>Cargando configuracion...</p>
        </div>
      </div>
    )
  }

  if (!config) {
    return (
      <div className="ca-view">
        <div className="ca-activar">
          <GraduationCap size={64} className="ca-activar-icon" />
          <h2>Chat Academico</h2>
          <p>Configura el chatbot de atencion para tu marca. Podras personalizar las instrucciones, herramientas y parametros de conversacion.</p>
          <button
            className="ca-btn ca-btn-primary"
            onClick={activarChatAcademico}
            disabled={activando}
          >
            {activando ? <><Loader2 className="ca-spinner" size={16} /> Activando...</> : 'Activar Chat Academico'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="ca-view">
      {mensaje && (
        <div className={`ca-mensaje ca-mensaje-${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}

      {/* Tab bar */}
      <div className="ca-tabs">
        {TABS.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              className={`ca-tab ${tabActiva === tab.id ? 'active' : ''}`}
              onClick={() => setTabActiva(tab.id)}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div className="ca-content">
        {tabActiva === 'instrucciones' && (
          <TabPrompt
            config={config}
            setConfig={setConfig}
            mostrarMensaje={mostrarMensaje}
            recargarHistorial={recargarHistorial}
          />
        )}
        {tabActiva === 'herramientas' && (
          <TabHerramientas
            herramientas={herramientas}
            recargarHerramientas={recargarHerramientas}
            mostrarMensaje={mostrarMensaje}
            recargarHistorial={recargarHistorial}
          />
        )}
        {tabActiva === 'conversacion' && (
          <TabConversacion
            config={config}
            setConfig={setConfig}
            mostrarMensaje={mostrarMensaje}
            recargarHistorial={recargarHistorial}
          />
        )}
        {tabActiva === 'chat-prueba' && (
          <TabChatPrueba />
        )}
      </div>

      {/* Historial colapsable */}
      <div className="ca-historial-section">
        <button
          className="ca-historial-toggle"
          onClick={() => setMostrarHistorial(!mostrarHistorial)}
        >
          <History size={16} />
          <span>Historial de cambios</span>
          {mostrarHistorial ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {mostrarHistorial && (
          <div className="ca-historial-list">
            {historial.length === 0 ? (
              <p className="ca-historial-vacio">Sin cambios registrados</p>
            ) : (
              historial.map(h => (
                <div key={h.id} className="ca-historial-item">
                  <span className="ca-historial-fecha">
                    {new Date(h.creado_en).toLocaleString('es-CL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="ca-historial-usuario">{h.usuario_nombre}</span>
                  <span className={`ca-historial-badge ca-badge-${h.accion}`}>{h.accion}</span>
                  <span className="ca-historial-seccion">{h.seccion}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
