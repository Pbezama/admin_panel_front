'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useView } from '@/context/ViewContext'
import { api } from '@/lib/api'
import AgentEditorTabs from '@/components/AgentEditor/AgentEditorTabs'
import '@/styles/AgentesView.css'

const TONOS = [
  { id: 'profesional', label: 'Profesional' },
  { id: 'cercano', label: 'Cercano' },
  { id: 'formal', label: 'Formal' },
  { id: 'divertido', label: 'Divertido' },
  { id: 'tecnico', label: 'Tecnico' }
]

const ICONOS = ['🤖', '🧠', '💼', '🎓', '📋', '🛠️', '💬', '⚡', '🔍', '📞', '🏥', '🏦']

const COLORES = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#059669']

const ESTADO_BADGE = {
  borrador: { label: 'Borrador', color: '#6b7280' },
  activo: { label: 'Activo', color: '#22c55e' },
  pausado: { label: 'Pausado', color: '#f59e0b' }
}

export default function AgentesView() {
  const { usuario, marcaActiva } = useAuth()
  const { contextoVista, navegarA } = useView()

  const [agentes, setAgentes] = useState([])
  const [agenteActivo, setAgenteActivo] = useState(null)
  const [vista, setVista] = useState('lista')
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState(null)

  // Wizard state
  const [nuevoAgente, setNuevoAgente] = useState({
    nombre: '', descripcion: '', objetivo: '', tono: 'profesional', icono: '🤖', color: '#8b5cf6'
  })

  useEffect(() => {
    cargarAgentes()
  }, [marcaActiva])

  // Handle sub-navigation
  useEffect(() => {
    if (contextoVista?.sub === 'editor' && contextoVista?.id) {
      cargarAgenteParaEditar(contextoVista.id)
    }
  }, [contextoVista])

  const cargarAgentes = async () => {
    setCargando(true)
    try {
      const res = await api.getAgentes()
      if (res.success) {
        setAgentes(res.agentes || [])
      }
    } catch (err) {
      console.error('Error cargando agentes:', err)
    } finally {
      setCargando(false)
    }
  }

  const cargarAgenteParaEditar = async (id) => {
    try {
      const res = await api.getAgente(id)
      if (res.success) {
        setAgenteActivo(res.agente)
        setVista('editor')
      }
    } catch (err) {
      console.error('Error cargando agente:', err)
    }
  }

  const mostrarMensaje = (texto, tipo = 'success') => {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje(null), 4000)
  }

  const volverALista = () => {
    setVista('lista')
    setAgenteActivo(null)
    setNuevoAgente({ nombre: '', descripcion: '', objetivo: '', tono: 'profesional', icono: '🤖', color: '#8b5cf6' })
    navegarA('agentes')
    cargarAgentes()
  }

  const handleCrear = async () => {
    if (!nuevoAgente.nombre.trim()) {
      mostrarMensaje('El nombre es requerido', 'error')
      return
    }
    setGuardando(true)
    try {
      const res = await api.crearAgente(nuevoAgente)
      if (res.success) {
        mostrarMensaje('Agente creado exitosamente')
        setAgenteActivo(res.agente)
        setVista('editor')
        navegarA('agentes', { sub: 'editor', id: res.agente.id })
      } else {
        mostrarMensaje(res.error || 'Error al crear', 'error')
      }
    } catch (err) {
      mostrarMensaje('Error al crear agente', 'error')
    } finally {
      setGuardando(false)
    }
  }

  const handleGuardar = async (datos) => {
    if (!agenteActivo) return
    setGuardando(true)
    try {
      const res = await api.actualizarAgente(agenteActivo.id, datos)
      if (res.success) {
        setAgenteActivo(prev => ({ ...prev, ...res.agente }))
        mostrarMensaje('Agente guardado')
      } else {
        mostrarMensaje(res.error || 'Error al guardar', 'error')
      }
    } catch (err) {
      mostrarMensaje('Error al guardar', 'error')
    } finally {
      setGuardando(false)
    }
  }

  const handleActivar = async (agente) => {
    const nuevoEstado = agente.estado === 'activo' ? 'pausado' : 'activo'
    try {
      const res = await api.activarAgente(agente.id, nuevoEstado)
      if (res.success) {
        mostrarMensaje(`Agente ${nuevoEstado === 'activo' ? 'activado' : 'pausado'}`)
        cargarAgentes()
      } else {
        mostrarMensaje(res.error || 'Error', 'error')
      }
    } catch (err) {
      mostrarMensaje('Error al cambiar estado', 'error')
    }
  }

  const handleDuplicar = async (agente) => {
    try {
      const res = await api.duplicarAgente(agente.id)
      if (res.success) {
        mostrarMensaje('Agente duplicado')
        cargarAgentes()
      }
    } catch (err) {
      mostrarMensaje('Error al duplicar', 'error')
    }
  }

  const handleEliminar = async (agente) => {
    if (!confirm(`¿Eliminar el agente "${agente.nombre}"?`)) return
    try {
      const res = await api.eliminarAgente(agente.id)
      if (res.success) {
        mostrarMensaje('Agente eliminado')
        cargarAgentes()
      } else {
        mostrarMensaje(res.error || 'Error al eliminar', 'error')
      }
    } catch (err) {
      mostrarMensaje('Error al eliminar', 'error')
    }
  }

  const handleEditar = (agente) => {
    navegarA('agentes', { sub: 'editor', id: agente.id })
    cargarAgenteParaEditar(agente.id)
  }

  // ── Render: Lista ──
  if (vista === 'lista') {
    return (
      <div className="agentes-container">
        {mensaje && (
          <div className={`agentes-toast agentes-toast-${mensaje.tipo}`}>{mensaje.texto}</div>
        )}

        <div className="agentes-header">
          <div>
            <h2 className="agentes-title">Agentes IA</h2>
            <p className="agentes-subtitle">Agentes autonomos que manejan conversaciones de forma inteligente</p>
          </div>
          <button className="agentes-btn-crear" onClick={() => setVista('nuevo')}>
            + Nuevo agente
          </button>
        </div>

        {cargando ? (
          <div className="agentes-loading">Cargando agentes...</div>
        ) : agentes.length === 0 ? (
          <div className="agentes-empty">
            <span className="agentes-empty-icon">🤖</span>
            <h3>Sin agentes</h3>
            <p>Crea tu primer agente IA para automatizar conversaciones de forma inteligente</p>
            <button className="agentes-btn-crear" onClick={() => setVista('nuevo')}>
              Crear primer agente
            </button>
          </div>
        ) : (
          <div className="agentes-grid">
            {agentes.map(agente => {
              const badge = ESTADO_BADGE[agente.estado] || ESTADO_BADGE.borrador
              return (
                <div key={agente.id} className="agente-card">
                  <div className="agente-card-header">
                    <div className="agente-card-icon" style={{ backgroundColor: agente.color || '#8b5cf6' }}>
                      {agente.icono || '🤖'}
                    </div>
                    <span className="agente-card-badge" style={{ backgroundColor: badge.color }}>
                      {badge.label}
                    </span>
                  </div>
                  <div className="agente-card-body">
                    <h3 className="agente-card-nombre">{agente.nombre}</h3>
                    <p className="agente-card-desc">{agente.descripcion || 'Sin descripcion'}</p>
                    {agente.objetivo && (
                      <p className="agente-card-objetivo"><strong>Objetivo:</strong> {agente.objetivo}</p>
                    )}
                  </div>
                  <div className="agente-card-footer">
                    <span className="agente-card-stat">
                      {agente.conversaciones_activas || 0} conv. activas
                    </span>
                    <div className="agente-card-actions">
                      <button onClick={() => handleEditar(agente)} title="Editar">Editar</button>
                      <button onClick={() => handleActivar(agente)} title={agente.estado === 'activo' ? 'Pausar' : 'Activar'}>
                        {agente.estado === 'activo' ? 'Pausar' : 'Activar'}
                      </button>
                      <button onClick={() => handleDuplicar(agente)} title="Duplicar">Duplicar</button>
                      <button onClick={() => handleEliminar(agente)} title="Eliminar" className="agente-btn-danger">Eliminar</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // ── Render: Nuevo (wizard) ──
  if (vista === 'nuevo') {
    return (
      <div className="agentes-container">
        {mensaje && (
          <div className={`agentes-toast agentes-toast-${mensaje.tipo}`}>{mensaje.texto}</div>
        )}

        <div className="agentes-nuevo-form">
          <h3>Crear nuevo agente</h3>

          <div className="agentes-form-grid">
            <label className="agente-field">
              <span>Nombre del agente *</span>
              <input
                value={nuevoAgente.nombre}
                onChange={e => setNuevoAgente(p => ({ ...p, nombre: e.target.value }))}
                placeholder="Ej: Encargado Academico, Soporte Tecnico..."
              />
            </label>

            <label className="agente-field">
              <span>Descripcion</span>
              <input
                value={nuevoAgente.descripcion}
                onChange={e => setNuevoAgente(p => ({ ...p, descripcion: e.target.value }))}
                placeholder="Breve descripcion de que hace este agente"
              />
            </label>

            <label className="agente-field agente-field-full">
              <span>Objetivo principal</span>
              <textarea
                value={nuevoAgente.objetivo}
                onChange={e => setNuevoAgente(p => ({ ...p, objetivo: e.target.value }))}
                placeholder="Ej: Resolver consultas academicas de los alumnos sobre campus, horarios y profesores"
                rows={2}
              />
            </label>

            <label className="agente-field">
              <span>Tono</span>
              <select
                value={nuevoAgente.tono}
                onChange={e => setNuevoAgente(p => ({ ...p, tono: e.target.value }))}
              >
                {TONOS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </label>

            <div className="agente-field">
              <span>Icono</span>
              <div className="agente-icon-selector">
                {ICONOS.map(ic => (
                  <button
                    key={ic}
                    className={`agente-icon-btn ${nuevoAgente.icono === ic ? 'selected' : ''}`}
                    onClick={() => setNuevoAgente(p => ({ ...p, icono: ic }))}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            <div className="agente-field">
              <span>Color</span>
              <div className="agente-color-selector">
                {COLORES.map(c => (
                  <button
                    key={c}
                    className={`agente-color-btn ${nuevoAgente.color === c ? 'selected' : ''}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setNuevoAgente(p => ({ ...p, color: c }))}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="agentes-form-actions">
            <button className="agentes-btn-cancelar" onClick={volverALista}>Cancelar</button>
            <button className="agentes-btn-crear" onClick={handleCrear} disabled={guardando}>
              {guardando ? 'Creando...' : 'Crear agente'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Render: Editor ──
  if (vista === 'editor' && agenteActivo) {
    return (
      <div className="agentes-container">
        {mensaje && (
          <div className={`agentes-toast agentes-toast-${mensaje.tipo}`}>{mensaje.texto}</div>
        )}

        <div className="agente-editor-header">
          <button className="agentes-btn-volver" onClick={volverALista}>← Volver</button>
          <div className="agente-editor-title-area">
            <span className="agente-editor-icon" style={{ backgroundColor: agenteActivo.color || '#8b5cf6' }}>
              {agenteActivo.icono || '🤖'}
            </span>
            <h3>{agenteActivo.nombre}</h3>
            <span
              className="agente-card-badge"
              style={{ backgroundColor: (ESTADO_BADGE[agenteActivo.estado] || ESTADO_BADGE.borrador).color }}
            >
              {(ESTADO_BADGE[agenteActivo.estado] || ESTADO_BADGE.borrador).label}
            </span>
          </div>
        </div>

        <AgentEditorTabs
          agente={agenteActivo}
          onSave={handleGuardar}
          guardando={guardando}
          onRefresh={() => cargarAgenteParaEditar(agenteActivo.id)}
          mostrarMensaje={mostrarMensaje}
        />
      </div>
    )
  }

  return null
}
