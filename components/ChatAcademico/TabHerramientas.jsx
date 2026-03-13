'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { Plus, Trash2, ChevronDown, ChevronUp, Save, Loader2, ToggleLeft, ToggleRight } from 'lucide-react'

const TIPO_LABELS = {
  respuesta_fija: 'Texto',
  google_sheets: 'Google Sheets',
  custom_python: 'Python',
  flujo: 'Flujo',
}

const TIPO_COLORS = {
  respuesta_fija: '#3b82f6',
  google_sheets: '#22c55e',
  custom_python: '#f59e0b',
  flujo: '#a855f7',
}

export default function TabHerramientas({ herramientas, recargarHerramientas, mostrarMensaje, recargarHistorial }) {
  const [expandida, setExpandida] = useState(null)
  const [editando, setEditando] = useState({})
  const [guardando, setGuardando] = useState(null)
  const [creando, setCreando] = useState(false)
  const [nuevaHerramienta, setNuevaHerramienta] = useState({ nombre: '', nombre_display: '', descripcion: '', respuesta_texto: '', tipo: 'respuesta_fija' })

  const toggleExpand = (id) => {
    if (expandida === id) {
      setExpandida(null)
      setEditando({})
    } else {
      const h = herramientas.find(h => h.id === id)
      setExpandida(id)
      setEditando({
        nombre_display: h.nombre_display || '',
        descripcion: h.descripcion || '',
        respuesta_texto: h.respuesta_texto || '',
      })
    }
  }

  const toggleActivo = async (h) => {
    try {
      const res = await api.actualizarChatAcademicoHerramienta(h.id, { activo: !h.activo })
      if (res.success) {
        mostrarMensaje(`${h.nombre_display || h.nombre} ${!h.activo ? 'activada' : 'desactivada'}`)
        recargarHerramientas()
        recargarHistorial()
      }
    } catch (err) {
      mostrarMensaje('Error al cambiar estado', 'error')
    }
  }

  const guardarEdicion = async (id) => {
    setGuardando(id)
    try {
      const res = await api.actualizarChatAcademicoHerramienta(id, editando)
      if (res.success) {
        mostrarMensaje('Herramienta actualizada')
        recargarHerramientas()
        recargarHistorial()
        setExpandida(null)
      } else {
        mostrarMensaje(res.error || 'Error al guardar', 'error')
      }
    } catch (err) {
      mostrarMensaje('Error al guardar herramienta', 'error')
    } finally {
      setGuardando(null)
    }
  }

  const crearHerramienta = async () => {
    if (!nuevaHerramienta.nombre || !nuevaHerramienta.descripcion) {
      mostrarMensaje('Nombre y descripcion son requeridos', 'error')
      return
    }
    setCreando(true)
    try {
      const res = await api.crearChatAcademicoHerramienta(nuevaHerramienta)
      if (res.success) {
        mostrarMensaje('Herramienta creada')
        setNuevaHerramienta({ nombre: '', nombre_display: '', descripcion: '', respuesta_texto: '', tipo: 'respuesta_fija' })
        recargarHerramientas()
        recargarHistorial()
      } else {
        mostrarMensaje(res.error || 'Error al crear', 'error')
      }
    } catch (err) {
      mostrarMensaje('Error al crear herramienta', 'error')
    } finally {
      setCreando(false)
    }
  }

  const eliminarHerramienta = async (id) => {
    if (!confirm('Eliminar esta herramienta?')) return
    try {
      const res = await api.eliminarChatAcademicoHerramienta(id)
      if (res.success) {
        mostrarMensaje('Herramienta eliminada')
        recargarHerramientas()
        recargarHistorial()
        setExpandida(null)
      } else {
        mostrarMensaje(res.error || 'Error al eliminar', 'error')
      }
    } catch (err) {
      mostrarMensaje('Error al eliminar', 'error')
    }
  }

  return (
    <div className="ca-tab-content">
      {/* Nueva herramienta */}
      <div className="ca-nueva-herramienta">
        <h3>Nueva Herramienta</h3>
        <div className="ca-nueva-form">
          <input
            className="ca-input"
            placeholder="Nombre (identificador unico, ej: miNuevaTool)"
            value={nuevaHerramienta.nombre}
            onChange={e => setNuevaHerramienta(p => ({ ...p, nombre: e.target.value }))}
          />
          <input
            className="ca-input"
            placeholder="Nombre visible (ej: Mi Nueva Herramienta)"
            value={nuevaHerramienta.nombre_display}
            onChange={e => setNuevaHerramienta(p => ({ ...p, nombre_display: e.target.value }))}
          />
          <textarea
            className="ca-textarea ca-textarea-sm"
            placeholder="Descripcion (cuando debe usarla la IA)"
            value={nuevaHerramienta.descripcion}
            onChange={e => setNuevaHerramienta(p => ({ ...p, descripcion: e.target.value }))}
            rows={2}
          />
          <textarea
            className="ca-textarea ca-textarea-sm"
            placeholder="Respuesta que retorna al usuario"
            value={nuevaHerramienta.respuesta_texto}
            onChange={e => setNuevaHerramienta(p => ({ ...p, respuesta_texto: e.target.value }))}
            rows={2}
          />
          <button className="ca-btn ca-btn-primary" onClick={crearHerramienta} disabled={creando}>
            {creando ? <Loader2 className="ca-spinner" size={16} /> : <Plus size={16} />}
            Crear
          </button>
        </div>
      </div>

      {/* Lista de herramientas */}
      <div className="ca-herramientas-list">
        <h3>Herramientas ({herramientas.length})</h3>
        {herramientas.map(h => (
          <div key={h.id} className={`ca-herramienta-card ${!h.activo ? 'ca-inactiva' : ''}`}>
            <div className="ca-herramienta-header" onClick={() => toggleExpand(h.id)}>
              <div className="ca-herramienta-info">
                <span className="ca-herramienta-badge" style={{ background: TIPO_COLORS[h.tipo] }}>
                  {TIPO_LABELS[h.tipo]}
                </span>
                <span className="ca-herramienta-nombre">{h.nombre_display || h.nombre}</span>
                {h.es_semilla && <span className="ca-herramienta-semilla">predefinida</span>}
              </div>
              <div className="ca-herramienta-actions">
                <button
                  className="ca-toggle-btn"
                  onClick={(e) => { e.stopPropagation(); toggleActivo(h) }}
                  title={h.activo ? 'Desactivar' : 'Activar'}
                >
                  {h.activo ? <ToggleRight size={24} className="ca-toggle-on" /> : <ToggleLeft size={24} className="ca-toggle-off" />}
                </button>
                {expandida === h.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </div>

            {expandida === h.id && (
              <div className="ca-herramienta-body">
                <label className="ca-label">Nombre visible</label>
                <input
                  className="ca-input"
                  value={editando.nombre_display || ''}
                  onChange={e => setEditando(p => ({ ...p, nombre_display: e.target.value }))}
                />

                <label className="ca-label">Descripcion (cuando la IA debe usarla)</label>
                <textarea
                  className="ca-textarea ca-textarea-sm"
                  value={editando.descripcion || ''}
                  onChange={e => setEditando(p => ({ ...p, descripcion: e.target.value }))}
                  rows={3}
                />

                {(h.tipo === 'respuesta_fija') && (
                  <>
                    <label className="ca-label">Respuesta al usuario</label>
                    <textarea
                      className="ca-textarea ca-textarea-sm"
                      value={editando.respuesta_texto || ''}
                      onChange={e => setEditando(p => ({ ...p, respuesta_texto: e.target.value }))}
                      rows={4}
                    />
                  </>
                )}

                {(h.tipo === 'google_sheets' || h.tipo === 'custom_python') && (
                  <p className="ca-nota">La logica de esta herramienta esta en Python. Solo puedes editar la descripcion y activar/desactivar.</p>
                )}

                <div className="ca-herramienta-footer">
                  <button
                    className="ca-btn ca-btn-primary"
                    onClick={() => guardarEdicion(h.id)}
                    disabled={guardando === h.id}
                  >
                    {guardando === h.id ? <Loader2 className="ca-spinner" size={16} /> : <Save size={16} />}
                    Guardar
                  </button>
                  {!h.es_semilla && (
                    <button className="ca-btn ca-btn-danger" onClick={() => eliminarHerramienta(h.id)}>
                      <Trash2 size={16} /> Eliminar
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
