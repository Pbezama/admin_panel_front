'use client'

import { useState, useEffect, useRef } from 'react'
import { api } from '@/lib/api'

export default function TabConocimiento({ agente, onRefresh, mostrarMensaje }) {
  const [categoriasMarca, setCategoriasMarca] = useState([])
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState([])
  const [fragmentos, setFragmentos] = useState([])
  const [documentos, setDocumentos] = useState([])
  const [mostrarFormFragmento, setMostrarFormFragmento] = useState(false)
  const [nuevoFragmento, setNuevoFragmento] = useState({ titulo: '', contenido: '' })
  const [subiendo, setSubiendo] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (agente?.id) {
      cargarDatos()
    }
  }, [agente?.id])

  const cargarDatos = async () => {
    try {
      const [resCat, resCon, resDoc] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/agentes/${agente.id}/conocimiento`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(r => r.json()).catch(() => ({ success: false })),
        api.getConocimientoAgente(agente.id),
        api.getDocumentosAgente(agente.id)
      ])

      // Cargar categorías de la marca
      try {
        const resCatMarca = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/entrenador/categorias`,
          { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
        )
        const dataCat = await resCatMarca.json()
        if (dataCat.success) {
          setCategoriasMarca(dataCat.categorias || [])
        }
      } catch { /* ignore */ }

      if (resCon.success) setFragmentos(resCon.conocimiento || [])
      if (resDoc.success) setDocumentos(resDoc.documentos || [])
      setCategoriasSeleccionadas(agente.categorias_conocimiento || [])
    } catch (err) {
      console.error('Error cargando conocimiento:', err)
    }
  }

  const toggleCategoria = async (nombre) => {
    const nuevas = categoriasSeleccionadas.includes(nombre)
      ? categoriasSeleccionadas.filter(c => c !== nombre)
      : [...categoriasSeleccionadas, nombre]

    setCategoriasSeleccionadas(nuevas)

    try {
      await api.actualizarAgente(agente.id, { categorias_conocimiento: nuevas })
    } catch (err) {
      mostrarMensaje('Error al actualizar categorias', 'error')
    }
  }

  const handleAddFragmento = async () => {
    if (!nuevoFragmento.contenido.trim()) {
      mostrarMensaje('El contenido es requerido', 'error')
      return
    }

    try {
      const res = await api.addConocimientoAgente(agente.id, nuevoFragmento)
      if (res.success) {
        mostrarMensaje('Fragmento agregado')
        setNuevoFragmento({ titulo: '', contenido: '' })
        setMostrarFormFragmento(false)
        cargarDatos()
      }
    } catch (err) {
      mostrarMensaje('Error al agregar fragmento', 'error')
    }
  }

  const handleDeleteFragmento = async (fragmentoId) => {
    if (!confirm('¿Eliminar este fragmento?')) return
    try {
      const res = await api.deleteConocimientoAgente(agente.id, fragmentoId)
      if (res.success) {
        mostrarMensaje('Fragmento eliminado')
        cargarDatos()
      }
    } catch (err) {
      mostrarMensaje('Error al eliminar', 'error')
    }
  }

  const handleSubirArchivo = async (e) => {
    const archivo = e.target.files?.[0]
    if (!archivo) return

    setSubiendo(true)
    try {
      const formData = new FormData()
      formData.append('archivo', archivo)

      const token = localStorage.getItem('token')
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${baseUrl}/api/agentes/${agente.id}/documentos`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })
      const data = await response.json()

      if (data.success) {
        mostrarMensaje(`Documento subido: ${data.fragmentos_creados} fragmentos generados`)
        cargarDatos()
      } else {
        mostrarMensaje(data.error || 'Error al subir', 'error')
      }
    } catch (err) {
      mostrarMensaje('Error al subir archivo', 'error')
    } finally {
      setSubiendo(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <>
      {/* Categorías de la marca */}
      <div className="agente-conocimiento-section">
        <h4>Categorias de la marca (conocimiento compartido)</h4>
        <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 10px' }}>
          Selecciona que categorias de la base de conocimiento general puede consultar este agente
        </p>
        {categoriasMarca.length === 0 ? (
          <p style={{ fontSize: 13, color: '#94a3b8' }}>No hay categorias en la base de conocimiento de la marca</p>
        ) : (
          <div className="agente-categorias-grid">
            {categoriasMarca.map(cat => (
              <button
                key={cat.nombre || cat}
                className={`agente-cat-chip ${categoriasSeleccionadas.includes(cat.nombre || cat) ? 'selected' : ''}`}
                onClick={() => toggleCategoria(cat.nombre || cat)}
              >
                {cat.nombre || cat}
                {cat.count && <span className="agente-cat-count">({cat.count})</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Documentos propios */}
      <div className="agente-conocimiento-section">
        <h4>Documentos propios del agente</h4>

        <div
          className="agente-upload-area"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.csv,.json,.pdf"
            style={{ display: 'none' }}
            onChange={handleSubirArchivo}
          />
          <p>{subiendo ? 'Subiendo...' : 'Click para subir un documento (.txt, .md, .csv, .json)'}</p>
        </div>

        {documentos.length > 0 && (
          <div className="agente-doc-list">
            {documentos.map(doc => (
              <div key={doc.id} className="agente-doc-item">
                <span>{doc.nombre}</span>
                <span
                  className="agente-doc-status"
                  style={{
                    background: doc.estado === 'pendiente' ? '#fef3c7' : '#dcfce7',
                    color: doc.estado === 'pendiente' ? '#92400e' : '#166534'
                  }}
                >
                  {doc.fragmentos_generados || 0} fragmentos
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fragmentos de conocimiento */}
      <div className="agente-conocimiento-section">
        <h4>Fragmentos de conocimiento ({fragmentos.length})</h4>

        {fragmentos.length > 0 && (
          <div className="agente-fragmentos-list">
            {fragmentos.map(frag => (
              <div key={frag.id} className="agente-fragmento-card">
                <div className="agente-fragmento-header">
                  <span className="agente-fragmento-titulo">{frag.titulo || 'Sin titulo'}</span>
                  <button className="agente-fragmento-delete" onClick={() => handleDeleteFragmento(frag.id)}>
                    Eliminar
                  </button>
                </div>
                <p className="agente-fragmento-contenido">{frag.contenido}</p>
              </div>
            ))}
          </div>
        )}

        {!mostrarFormFragmento ? (
          <button
            className="agente-add-param-btn"
            onClick={() => setMostrarFormFragmento(true)}
            style={{ marginTop: 12 }}
          >
            + Agregar fragmento manualmente
          </button>
        ) : (
          <div className="agente-add-fragmento">
            <h5>Nuevo fragmento de conocimiento</h5>
            <label className="agente-field">
              <span>Titulo</span>
              <input
                value={nuevoFragmento.titulo}
                onChange={e => setNuevoFragmento(p => ({ ...p, titulo: e.target.value }))}
                placeholder="Titulo del fragmento"
              />
            </label>
            <label className="agente-field" style={{ marginTop: 8 }}>
              <span>Contenido *</span>
              <textarea
                value={nuevoFragmento.contenido}
                onChange={e => setNuevoFragmento(p => ({ ...p, contenido: e.target.value }))}
                placeholder="Escribe la informacion que el agente debe conocer..."
                rows={5}
              />
            </label>
            <div className="agente-custom-form-actions">
              <button className="agentes-btn-cancelar" onClick={() => setMostrarFormFragmento(false)}>Cancelar</button>
              <button className="agentes-btn-crear" onClick={handleAddFragmento}>Agregar</button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
