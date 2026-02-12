'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useView } from '@/context/ViewContext'
import { api } from '@/lib/api'
import FlowCanvas from '@/components/FlowBuilder/FlowCanvas'
import '@/styles/FlujosView.css'

const TRIGGER_TIPOS = [
  { value: 'keyword', label: 'Palabra clave' },
  { value: 'first_message', label: 'Primer mensaje' },
  { value: 'menu', label: 'Menu' },
  { value: 'manual', label: 'Manual' }
]

export default function FlujosView() {
  const { usuario, marcaActiva } = useAuth()
  const { volverAlChat } = useView()

  const [flujos, setFlujos] = useState([])
  const [flujoActivo, setFlujoActivo] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  const [vistaActiva, setVistaActiva] = useState('lista') // lista | editor | nuevo
  const [nuevoFlujo, setNuevoFlujo] = useState({ nombre: '', descripcion: '', trigger_tipo: 'keyword', trigger_valor: '', canales: ['whatsapp'] })

  const idMarca = marcaActiva?.id_marca || usuario?.id_marca

  useEffect(() => {
    cargarFlujos()
  }, [idMarca])

  const cargarFlujos = async () => {
    setCargando(true)
    try {
      const result = await api.getFlujos()
      setFlujos(result.flujos || [])
    } catch (error) {
      console.error('Error cargando flujos:', error)
      mostrarMensaje('Error cargando flujos', 'error')
    } finally {
      setCargando(false)
    }
  }

  const mostrarMensaje = (texto, tipo = 'info') => {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje(null), 4000)
  }

  const handleCrearFlujo = async () => {
    if (!nuevoFlujo.nombre.trim()) {
      mostrarMensaje('El nombre es requerido', 'error')
      return
    }

    try {
      const result = await api.crearFlujo({
        ...nuevoFlujo,
        nodos: [
          {
            id: 'node_inicio',
            tipo: 'inicio',
            posicion: { x: 250, y: 50 },
            datos: { trigger_tipo: nuevoFlujo.trigger_tipo, trigger_valor: nuevoFlujo.trigger_valor }
          }
        ],
        edges: []
      })

      mostrarMensaje('Flujo creado', 'exito')
      setNuevoFlujo({ nombre: '', descripcion: '', trigger_tipo: 'keyword', trigger_valor: '', canales: ['whatsapp'] })
      await cargarFlujos()
      // Abrir en editor
      setFlujoActivo(result.flujo)
      setVistaActiva('editor')
    } catch (error) {
      mostrarMensaje('Error creando flujo: ' + error.message, 'error')
    }
  }

  const handleAbrirEditor = async (flujo) => {
    try {
      const result = await api.getFlujo(flujo.id)
      setFlujoActivo(result.flujo)
      setVistaActiva('editor')
    } catch (error) {
      mostrarMensaje('Error abriendo flujo', 'error')
    }
  }

  const handleGuardar = async (nodos, edges) => {
    if (!flujoActivo) return
    setGuardando(true)
    try {
      await api.actualizarFlujo(flujoActivo.id, { nodos, edges })
      mostrarMensaje('Flujo guardado', 'exito')
      // Recargar
      const result = await api.getFlujo(flujoActivo.id)
      setFlujoActivo(result.flujo)
    } catch (error) {
      mostrarMensaje('Error guardando: ' + error.message, 'error')
    } finally {
      setGuardando(false)
    }
  }

  const handleActivar = async (flujo) => {
    const nuevoEstado = flujo.estado === 'activo' ? 'pausado' : 'activo'
    try {
      await api.activarFlujo(flujo.id, nuevoEstado)
      mostrarMensaje(`Flujo ${nuevoEstado === 'activo' ? 'activado' : 'pausado'}`, 'exito')
      cargarFlujos()
    } catch (error) {
      mostrarMensaje('Error cambiando estado', 'error')
    }
  }

  const handleDuplicar = async (flujo) => {
    try {
      await api.duplicarFlujo(flujo.id)
      mostrarMensaje('Flujo duplicado', 'exito')
      cargarFlujos()
    } catch (error) {
      mostrarMensaje('Error duplicando flujo', 'error')
    }
  }

  const handleEliminar = async (flujo) => {
    if (!confirm(`Eliminar flujo "${flujo.nombre}"?`)) return
    try {
      await api.eliminarFlujo(flujo.id)
      mostrarMensaje('Flujo eliminado', 'exito')
      cargarFlujos()
    } catch (error) {
      mostrarMensaje('Error eliminando flujo', 'error')
    }
  }

  const handleCrearSeed = async () => {
    try {
      const result = await api.crearFlujoSeed(idMarca)
      mostrarMensaje('Flujo de ejemplo creado. Envia "agendar" por WhatsApp para probarlo.', 'exito')
      cargarFlujos()
    } catch (error) {
      mostrarMensaje('Error creando flujo seed', 'error')
    }
  }

  const estadoBadge = (estado) => {
    const estilos = {
      activo: 'flujo-badge-activo',
      borrador: 'flujo-badge-borrador',
      pausado: 'flujo-badge-pausado'
    }
    return <span className={`flujo-badge ${estilos[estado] || ''}`}>{estado}</span>
  }

  // Vista: Editor de flujo
  if (vistaActiva === 'editor' && flujoActivo) {
    return (
      <div className="flujos-view flujos-editor-mode">
        <header className="flujos-header">
          <div className="flujos-header-left">
            <button className="flujos-btn-volver" onClick={() => { setVistaActiva('lista'); setFlujoActivo(null) }}>
              ← Volver
            </button>
            <h2>{flujoActivo.nombre}</h2>
            {estadoBadge(flujoActivo.estado)}
          </div>
          <div className="flujos-header-right">
            <span className="flujos-trigger-info">
              Trigger: {flujoActivo.trigger_tipo} {flujoActivo.trigger_valor ? `"${flujoActivo.trigger_valor}"` : ''}
            </span>
          </div>
        </header>

        {mensaje && (
          <div className={`flujos-mensaje flujos-mensaje-${mensaje.tipo}`}>
            {mensaje.texto}
          </div>
        )}

        <FlowCanvas
          flujo={flujoActivo}
          onSave={handleGuardar}
          guardando={guardando}
        />
      </div>
    )
  }

  // Vista: Lista de flujos
  return (
    <div className="flujos-view">
      <header className="flujos-header">
        <div className="flujos-header-left">
          <button className="flujos-btn-volver" onClick={volverAlChat}>← Volver</button>
          <h2>Flujos Conversacionales</h2>
        </div>
        <div className="flujos-header-right">
          <button className="flujos-btn-seed" onClick={handleCrearSeed}>
            Crear flujo ejemplo
          </button>
          <button className="flujos-btn-nuevo" onClick={() => setVistaActiva('nuevo')}>
            + Nuevo flujo
          </button>
        </div>
      </header>

      {mensaje && (
        <div className={`flujos-mensaje flujos-mensaje-${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}

      {/* Formulario nuevo flujo */}
      {vistaActiva === 'nuevo' && (
        <div className="flujos-nuevo-form">
          <h3>Crear nuevo flujo</h3>
          <div className="flujos-form-grid">
            <label className="flow-field">
              <span>Nombre del flujo</span>
              <input
                value={nuevoFlujo.nombre}
                onChange={e => setNuevoFlujo(prev => ({ ...prev, nombre: e.target.value }))}
                placeholder="Ej: Captar Lead, Agendar Reunion..."
              />
            </label>
            <label className="flow-field">
              <span>Descripcion (opcional)</span>
              <input
                value={nuevoFlujo.descripcion}
                onChange={e => setNuevoFlujo(prev => ({ ...prev, descripcion: e.target.value }))}
                placeholder="Breve descripcion del flujo"
              />
            </label>
            <label className="flow-field">
              <span>Tipo de trigger</span>
              <select
                value={nuevoFlujo.trigger_tipo}
                onChange={e => setNuevoFlujo(prev => ({ ...prev, trigger_tipo: e.target.value }))}
              >
                {TRIGGER_TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </label>
            {nuevoFlujo.trigger_tipo === 'keyword' && (
              <label className="flow-field">
                <span>Palabras clave (separadas por |)</span>
                <input
                  value={nuevoFlujo.trigger_valor}
                  onChange={e => setNuevoFlujo(prev => ({ ...prev, trigger_valor: e.target.value }))}
                  placeholder="agendar|cita|reunion"
                />
              </label>
            )}
            <div className="flow-field">
              <span>Canales</span>
              <div className="flujos-canales-check">
                {[
                  { value: 'whatsapp', label: '📱 WhatsApp' },
                  { value: 'instagram', label: '📸 Instagram' },
                  { value: 'web', label: '🌐 Web Chat' }
                ].map(canal => (
                  <label key={canal.value} className="flujos-canal-item">
                    <input
                      type="checkbox"
                      checked={(nuevoFlujo.canales || []).includes(canal.value)}
                      onChange={(e) => {
                        setNuevoFlujo(prev => {
                          const canales = prev.canales || []
                          if (e.target.checked) {
                            return { ...prev, canales: [...canales, canal.value] }
                          } else {
                            return { ...prev, canales: canales.filter(c => c !== canal.value) }
                          }
                        })
                      }}
                    />
                    {canal.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="flujos-form-actions">
            <button className="flujos-btn-cancelar" onClick={() => setVistaActiva('lista')}>Cancelar</button>
            <button className="flujos-btn-crear" onClick={handleCrearFlujo}>Crear flujo</button>
          </div>
        </div>
      )}

      {/* Lista de flujos */}
      {cargando ? (
        <div className="flujos-loading">Cargando flujos...</div>
      ) : flujos.length === 0 ? (
        <div className="flujos-empty">
          <p>No hay flujos creados aun.</p>
          <p>Crea tu primer flujo o usa el boton "Crear flujo ejemplo" para empezar.</p>
        </div>
      ) : (
        <div className="flujos-lista">
          {flujos.map(flujo => (
            <div key={flujo.id} className="flujo-card">
              <div className="flujo-card-info">
                <div className="flujo-card-top">
                  <h3>{flujo.nombre}</h3>
                  {estadoBadge(flujo.estado)}
                </div>
                {flujo.descripcion && <p className="flujo-card-desc">{flujo.descripcion}</p>}
                <div className="flujo-card-meta">
                  <span>Trigger: {flujo.trigger_tipo} {flujo.trigger_valor ? `"${flujo.trigger_valor}"` : ''}</span>
                  <span>Canal: {(flujo.canales || []).join(', ')}</span>
                  <span>{(flujo.nodos || []).length} nodos</span>
                </div>
              </div>
              <div className="flujo-card-actions">
                <button className="flujo-btn-editar" onClick={() => handleAbrirEditor(flujo)}>Editar</button>
                <button
                  className={`flujo-btn-activar ${flujo.estado === 'activo' ? 'activo' : ''}`}
                  onClick={() => handleActivar(flujo)}
                >
                  {flujo.estado === 'activo' ? 'Pausar' : 'Activar'}
                </button>
                <button className="flujo-btn-duplicar" onClick={() => handleDuplicar(flujo)}>Duplicar</button>
                <button className="flujo-btn-eliminar" onClick={() => handleEliminar(flujo)}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
