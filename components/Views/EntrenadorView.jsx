'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useView } from '@/context/ViewContext'
import { api } from '@/lib/api'
import '@/styles/EntrenadorView.css'

const CATEGORIAS = {
  identidad: { label: 'Identidad', color: '#6366f1' },
  productos: { label: 'Productos', color: '#f59e0b' },
  servicios: { label: 'Servicios', color: '#10b981' },
  precios: { label: 'Precios', color: '#ef4444' },
  publico_objetivo: { label: 'Publico Objetivo', color: '#8b5cf6' },
  tono_voz: { label: 'Tono de Voz', color: '#ec4899' },
  competencia: { label: 'Competencia', color: '#f97316' },
  promociones: { label: 'Promociones', color: '#14b8a6' },
  horarios: { label: 'Horarios', color: '#06b6d4' },
  politicas: { label: 'Politicas', color: '#64748b' },
  contenido: { label: 'Contenido', color: '#a855f7' },
  faq: { label: 'FAQ', color: '#3b82f6' },
  otro: { label: 'Otro', color: '#78716c' }
}

const PRIORIDADES = {
  1: { label: 'Obligatorio', color: '#ef4444' },
  2: { label: 'Muy importante', color: '#f97316' },
  3: { label: 'Importante', color: '#f59e0b' },
  4: { label: 'Recomendado', color: '#10b981' },
  5: { label: 'Opcional', color: '#06b6d4' },
  6: { label: 'Complementario', color: '#64748b' }
}

export default function EntrenadorView() {
  const { usuario, marcaActiva } = useAuth()
  const { volverAlChat } = useView()

  const [tabActiva, setTabActiva] = useState('documentos')
  const [documentos, setDocumentos] = useState([])
  const [conocimiento, setConocimiento] = useState([])
  const [conocimientoPorCategoria, setConocimientoPorCategoria] = useState({})
  const [reglasPropuestas, setReglasPropuestas] = useState([])
  const [cargando, setCargando] = useState(false)
  const [subiendo, setSubiendo] = useState(false)
  const [procesando, setProcesando] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  const [expandidos, setExpandidos] = useState({})
  const [editando, setEditando] = useState(null)
  const [editandoRegla, setEditandoRegla] = useState(null)
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [seleccionados, setSeleccionados] = useState([])
  const [seleccionadosReglas, setSeleccionadosReglas] = useState([])
  const [dragOver, setDragOver] = useState(false)

  const fileInputRef = useRef(null)
  const pollIntervalRef = useRef(null)

  // Cargar datos al montar
  useEffect(() => {
    cargarDocumentos()
    cargarConocimiento()
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
    }
  }, [])

  // Polling para actualizar estado de documentos en procesamiento
  useEffect(() => {
    const hayProcesando = documentos.some(d => d.estado === 'procesando' || d.estado === 'pendiente')
    if (hayProcesando && !pollIntervalRef.current) {
      pollIntervalRef.current = setInterval(() => {
        cargarDocumentos()
      }, 5000)
    } else if (!hayProcesando && pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
  }, [documentos])

  const mostrarMensaje = (texto, tipo = 'info') => {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje(null), 4000)
  }

  const cargarDocumentos = async () => {
    try {
      const result = await api.getDocumentosEntrenador()
      if (result.success) {
        setDocumentos(result.documentos || [])
      }
    } catch (err) {
      console.error('Error cargando documentos:', err)
    }
  }

  const cargarConocimiento = async () => {
    try {
      setCargando(true)
      const result = await api.getConocimientoEntrenador(filtroEstado || undefined)
      if (result.success) {
        setConocimiento(result.conocimiento || [])
        setConocimientoPorCategoria(result.conocimiento_por_categoria || {})
        setReglasPropuestas(result.reglas_propuestas || [])
      }
    } catch (err) {
      console.error('Error cargando conocimiento:', err)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    if (tabActiva === 'conocimiento' || tabActiva === 'reglas') {
      cargarConocimiento()
    }
  }, [tabActiva, filtroEstado])

  // ========== DOCUMENTOS ==========

  const handleSubirArchivos = async (archivos) => {
    if (!archivos || archivos.length === 0) return
    setSubiendo(true)
    try {
      const result = await api.uploadDocumentosEntrenador(Array.from(archivos))
      if (result.success) {
        const exitosos = result.documentos.filter(d => d.success).length
        const fallidos = result.documentos.filter(d => !d.success)
        if (exitosos > 0) {
          mostrarMensaje(`${exitosos} archivo(s) subidos correctamente`, 'exito')
        } else if (fallidos.length > 0) {
          mostrarMensaje(`Error subiendo archivos: ${fallidos[0].error || 'Error desconocido'}`, 'error')
        }
        cargarDocumentos()
      }
    } catch (err) {
      mostrarMensaje('Error subiendo archivos: ' + err.message, 'error')
    } finally {
      setSubiendo(false)
    }
  }

  const handleEliminarDocumento = async (id) => {
    if (!confirm('Eliminar este documento?')) return
    try {
      await api.eliminarDocumentoEntrenador(id)
      mostrarMensaje('Documento eliminado', 'exito')
      cargarDocumentos()
    } catch (err) {
      mostrarMensaje('Error eliminando: ' + err.message, 'error')
    }
  }

  const handleAnalizar = async () => {
    const procesados = documentos.filter(d => d.estado === 'procesado')
    if (procesados.length === 0) {
      mostrarMensaje('No hay documentos procesados para analizar', 'error')
      return
    }
    setProcesando(true)
    try {
      const result = await api.procesarEntrenador()
      if (result.success) {
        mostrarMensaje(`Analisis completado: ${result.conocimiento?.length || 0} conocimientos, ${result.reglas_propuestas?.length || 0} reglas propuestas`, 'exito')
        cargarConocimiento()
        setTabActiva('conocimiento')
      } else {
        mostrarMensaje(result.error || 'Error en el analisis', 'error')
      }
    } catch (err) {
      mostrarMensaje('Error analizando: ' + err.message, 'error')
    } finally {
      setProcesando(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleSubirArchivos(e.dataTransfer.files)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => setDragOver(false)

  // ========== CONOCIMIENTO ==========

  const toggleExpandido = (id) => {
    setExpandidos(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const handleAprobarConocimiento = async (id) => {
    try {
      await api.aprobarConocimiento({ id, accion: 'aprobar' })
      mostrarMensaje('Conocimiento aprobado', 'exito')
      cargarConocimiento()
    } catch (err) {
      mostrarMensaje('Error: ' + err.message, 'error')
    }
  }

  const handleRechazarConocimiento = async (id) => {
    try {
      await api.aprobarConocimiento({ id, accion: 'rechazar' })
      mostrarMensaje('Conocimiento rechazado', 'info')
      cargarConocimiento()
    } catch (err) {
      mostrarMensaje('Error: ' + err.message, 'error')
    }
  }

  const handleGuardarEdicion = async (id) => {
    if (!editando) return
    try {
      await api.aprobarConocimiento({
        id,
        accion: 'aprobar',
        edicion: {
          titulo: editando.titulo,
          contenido: editando.contenido,
          categoria: editando.categoria,
          confianza: editando.confianza
        }
      })
      mostrarMensaje('Editado y aprobado', 'exito')
      setEditando(null)
      cargarConocimiento()
    } catch (err) {
      mostrarMensaje('Error: ' + err.message, 'error')
    }
  }

  const handleAprobarLote = async () => {
    if (seleccionados.length === 0) {
      mostrarMensaje('Selecciona al menos un item', 'error')
      return
    }
    try {
      await api.aprobarConocimiento({ ids: seleccionados, accion: 'aprobar' })
      mostrarMensaje(`${seleccionados.length} items aprobados`, 'exito')
      setSeleccionados([])
      cargarConocimiento()
    } catch (err) {
      mostrarMensaje('Error: ' + err.message, 'error')
    }
  }

  const handleAprobarTodosPendientes = async () => {
    const pendientes = conocimiento.filter(k => k.estado === 'pendiente').map(k => k.id)
    if (pendientes.length === 0) {
      mostrarMensaje('No hay pendientes', 'info')
      return
    }
    if (!confirm(`Aprobar ${pendientes.length} items pendientes?`)) return
    try {
      await api.aprobarConocimiento({ ids: pendientes, accion: 'aprobar' })
      mostrarMensaje(`${pendientes.length} items aprobados`, 'exito')
      cargarConocimiento()
    } catch (err) {
      mostrarMensaje('Error: ' + err.message, 'error')
    }
  }

  const toggleSeleccion = (id) => {
    setSeleccionados(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  // ========== REGLAS ==========

  const handleAprobarRegla = async (id) => {
    try {
      await api.aprobarReglasEntrenador({ id, accion: 'aprobar' })
      mostrarMensaje('Regla aprobada y activada', 'exito')
      cargarConocimiento()
    } catch (err) {
      mostrarMensaje('Error: ' + err.message, 'error')
    }
  }

  const handleRechazarRegla = async (id) => {
    try {
      await api.aprobarReglasEntrenador({ id, accion: 'rechazar' })
      mostrarMensaje('Regla rechazada', 'info')
      cargarConocimiento()
    } catch (err) {
      mostrarMensaje('Error: ' + err.message, 'error')
    }
  }

  const handleGuardarEdicionRegla = async (id) => {
    if (!editandoRegla) return
    try {
      await api.aprobarReglasEntrenador({
        id,
        accion: 'aprobar',
        edicion: {
          categoria: editandoRegla.categoria,
          clave: editandoRegla.clave,
          valor: editandoRegla.valor,
          prioridad: editandoRegla.prioridad
        }
      })
      mostrarMensaje('Regla editada y aprobada', 'exito')
      setEditandoRegla(null)
      cargarConocimiento()
    } catch (err) {
      mostrarMensaje('Error: ' + err.message, 'error')
    }
  }

  const handleAprobarTodasReglas = async () => {
    const ids = reglasPropuestas.map(r => r.id)
    if (ids.length === 0) {
      mostrarMensaje('No hay reglas propuestas', 'info')
      return
    }
    if (!confirm(`Aprobar ${ids.length} reglas?`)) return
    try {
      await api.aprobarReglasEntrenador({ ids, accion: 'aprobar' })
      mostrarMensaje(`${ids.length} reglas aprobadas`, 'exito')
      cargarConocimiento()
    } catch (err) {
      mostrarMensaje('Error: ' + err.message, 'error')
    }
  }

  // ========== HELPERS ==========

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'pendiente': return '⏳'
      case 'procesando': return '🔄'
      case 'procesado': return '✅'
      case 'error': return '❌'
      case 'aprobado': return '✅'
      case 'rechazado': return '❌'
      case 'editado': return '✏️'
      default: return '⏳'
    }
  }

  const getConfianzaColor = (confianza) => {
    if (confianza >= 90) return '#10b981'
    if (confianza >= 70) return '#f59e0b'
    if (confianza >= 50) return '#f97316'
    return '#ef4444'
  }

  const formatTamano = (bytes) => {
    if (!bytes) return '-'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / 1048576).toFixed(1) + ' MB'
  }

  const conocimientoFiltrado = filtroCategoria
    ? conocimiento.filter(k => k.categoria === filtroCategoria)
    : conocimiento

  const totalPendientes = conocimiento.filter(k => k.estado === 'pendiente').length
  const totalAprobados = conocimiento.filter(k => k.estado === 'aprobado' || k.estado === 'editado').length

  // ========== RENDER ==========

  return (
    <div className="entrenador-view">
      <header className="entrenador-header">
        <div className="header-left">
          <button onClick={volverAlChat} className="btn-volver">
            <span className="volver-icon">&larr;</span>
            <span>Volver</span>
          </button>
          <h1>Entrenador de Marca</h1>
        </div>
        <div className="header-right">
          <span className="marca-nombre">{marcaActiva?.nombre_marca || usuario?.nombre_marca || 'Mi Marca'}</span>
        </div>
      </header>

      {/* Mensaje flash */}
      {mensaje && (
        <div className={`entrenador-mensaje ${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}

      {/* Tabs */}
      <nav className="entrenador-tabs">
        <button
          className={`tab ${tabActiva === 'documentos' ? 'activa' : ''}`}
          onClick={() => setTabActiva('documentos')}
        >
          Documentos
          {documentos.length > 0 && <span className="tab-badge">{documentos.length}</span>}
        </button>
        <button
          className={`tab ${tabActiva === 'conocimiento' ? 'activa' : ''}`}
          onClick={() => setTabActiva('conocimiento')}
        >
          Mapa de Conocimiento
          {totalPendientes > 0 && <span className="tab-badge pendiente">{totalPendientes}</span>}
        </button>
        <button
          className={`tab ${tabActiva === 'reglas' ? 'activa' : ''}`}
          onClick={() => setTabActiva('reglas')}
        >
          Reglas Propuestas
          {reglasPropuestas.length > 0 && <span className="tab-badge">{reglasPropuestas.length}</span>}
        </button>
      </nav>

      <main className="entrenador-content">
        {/* ========== TAB DOCUMENTOS ========== */}
        {tabActiva === 'documentos' && (
          <div className="tab-documentos">
            {/* Drop zone */}
            <div
              className={`dropzone ${dragOver ? 'drag-over' : ''} ${subiendo ? 'subiendo' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => !subiendo && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                style={{ display: 'none' }}
                onChange={(e) => handleSubirArchivos(e.target.files)}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.json,.pptx,.jpg,.jpeg,.png,.webp,.mp3,.wav,.m4a,.mp4"
              />
              {subiendo ? (
                <div className="dropzone-subiendo">
                  <div className="spinner"></div>
                  <p>Subiendo archivos...</p>
                </div>
              ) : (
                <>
                  <div className="dropzone-icon">📁</div>
                  <p className="dropzone-titulo">Arrastra archivos aqui o haz clic para seleccionar</p>
                  <p className="dropzone-desc">PDF, Word, Excel, Imagenes, Audio, PPT, TXT, JSON</p>
                </>
              )}
            </div>

            {/* Boton analizar */}
            <div className="documentos-acciones">
              <button
                className="btn-analizar"
                onClick={handleAnalizar}
                disabled={procesando || documentos.filter(d => d.estado === 'procesado').length === 0}
              >
                {procesando ? (
                  <>
                    <div className="spinner-small"></div>
                    Analizando con IA...
                  </>
                ) : (
                  '🧠 Analizar Todo'
                )}
              </button>
              <span className="documentos-info">
                {documentos.filter(d => d.estado === 'procesado').length} procesados /
                {' '}{documentos.filter(d => d.estado === 'procesando').length} en proceso /
                {' '}{documentos.length} total
              </span>
            </div>

            {/* Lista de documentos */}
            <div className="documentos-lista">
              {documentos.length === 0 ? (
                <div className="empty-state">
                  <p>No hay documentos subidos</p>
                  <p className="empty-desc">Sube archivos para que la IA aprenda sobre tu marca</p>
                </div>
              ) : (
                documentos.map(doc => (
                  <div key={doc.id} className={`documento-card ${doc.estado}`}>
                    <div className="doc-info">
                      <span className="doc-estado">{getEstadoIcon(doc.estado)}</span>
                      <div className="doc-detalles">
                        <span className="doc-nombre">{doc.nombre_archivo}</span>
                        <span className="doc-meta">
                          {formatTamano(doc.tamano)} · {doc.tipo_archivo?.split('/').pop()}
                          {doc.estado === 'error' && doc.error_procesamiento && (
                            <span className="doc-error"> · {doc.error_procesamiento}</span>
                          )}
                        </span>
                      </div>
                    </div>
                    <button
                      className="btn-eliminar-doc"
                      onClick={() => handleEliminarDocumento(doc.id)}
                      title="Eliminar"
                    >
                      X
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ========== TAB CONOCIMIENTO ========== */}
        {tabActiva === 'conocimiento' && (
          <div className="tab-conocimiento">
            {/* Filtros y acciones */}
            <div className="conocimiento-toolbar">
              <div className="filtros">
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="filtro-select"
                >
                  <option value="">Todos los estados</option>
                  <option value="pendiente">Pendientes</option>
                  <option value="aprobado">Aprobados</option>
                  <option value="rechazado">Rechazados</option>
                  <option value="editado">Editados</option>
                </select>
                <select
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                  className="filtro-select"
                >
                  <option value="">Todas las categorias</option>
                  {Object.entries(CATEGORIAS).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>
              <div className="acciones-lote">
                {seleccionados.length > 0 && (
                  <button className="btn-aprobar-lote" onClick={handleAprobarLote}>
                    Aprobar {seleccionados.length} seleccionados
                  </button>
                )}
                {totalPendientes > 0 && (
                  <button className="btn-aprobar-todos" onClick={handleAprobarTodosPendientes}>
                    Aprobar todos los pendientes ({totalPendientes})
                  </button>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="conocimiento-stats">
              <div className="stat">
                <span className="stat-num">{conocimiento.length}</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="stat aprobado">
                <span className="stat-num">{totalAprobados}</span>
                <span className="stat-label">Aprobados</span>
              </div>
              <div className="stat pendiente">
                <span className="stat-num">{totalPendientes}</span>
                <span className="stat-label">Pendientes</span>
              </div>
            </div>

            {/* Cards de conocimiento */}
            {cargando ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Cargando conocimiento...</p>
              </div>
            ) : conocimientoFiltrado.length === 0 ? (
              <div className="empty-state">
                <p>No hay conocimiento extraido</p>
                <p className="empty-desc">Sube documentos y ejecuta el analisis para generar el mapa de conocimiento</p>
              </div>
            ) : (
              <div className="conocimiento-grid">
                {Object.entries(CATEGORIAS).map(([catKey, catInfo]) => {
                  const items = conocimientoFiltrado.filter(k => k.categoria === catKey)
                  if (items.length === 0) return null
                  return (
                    <div key={catKey} className="categoria-grupo">
                      <div className="categoria-header" style={{ borderColor: catInfo.color }}>
                        <span className="categoria-dot" style={{ background: catInfo.color }}></span>
                        <h3>{catInfo.label}</h3>
                        <span className="categoria-count">{items.length}</span>
                      </div>
                      <div className="categoria-items">
                        {items.map(item => (
                          <div key={item.id} className={`conocimiento-card ${item.estado}`}>
                            <div className="card-header-row">
                              <input
                                type="checkbox"
                                checked={seleccionados.includes(item.id)}
                                onChange={() => toggleSeleccion(item.id)}
                                className="card-checkbox"
                              />
                              <span className="card-estado">{getEstadoIcon(item.estado)}</span>
                              <h4
                                className="card-titulo"
                                onClick={() => toggleExpandido(item.id)}
                              >
                                {editando?.id === item.id ? (
                                  <input
                                    type="text"
                                    value={editando.titulo}
                                    onChange={(e) => setEditando({ ...editando, titulo: e.target.value })}
                                    className="edit-input"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                ) : item.titulo}
                              </h4>
                              <div className="card-confianza" title={`Confianza: ${item.confianza}%`}>
                                <div
                                  className="confianza-bar"
                                  style={{
                                    width: `${item.confianza}%`,
                                    background: getConfianzaColor(item.confianza)
                                  }}
                                ></div>
                                <span className="confianza-text">{item.confianza}%</span>
                              </div>
                            </div>

                            {(expandidos[item.id] || editando?.id === item.id) && (
                              <div className="card-body">
                                {editando?.id === item.id ? (
                                  <div className="card-edit">
                                    <textarea
                                      value={editando.contenido}
                                      onChange={(e) => setEditando({ ...editando, contenido: e.target.value })}
                                      className="edit-textarea"
                                      rows={5}
                                    />
                                    <div className="edit-actions">
                                      <button className="btn-save" onClick={() => handleGuardarEdicion(item.id)}>Guardar y Aprobar</button>
                                      <button className="btn-cancel" onClick={() => setEditando(null)}>Cancelar</button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <p className="card-contenido">{item.contenido}</p>
                                    <div className="card-acciones">
                                      {item.estado === 'pendiente' && (
                                        <>
                                          <button className="btn-aprobar" onClick={() => handleAprobarConocimiento(item.id)}>Aprobar</button>
                                          <button className="btn-rechazar" onClick={() => handleRechazarConocimiento(item.id)}>Rechazar</button>
                                        </>
                                      )}
                                      <button
                                        className="btn-editar"
                                        onClick={() => setEditando({
                                          id: item.id,
                                          titulo: item.titulo,
                                          contenido: item.contenido,
                                          categoria: item.categoria,
                                          confianza: item.confianza
                                        })}
                                      >
                                        Editar
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ========== TAB REGLAS ========== */}
        {tabActiva === 'reglas' && (
          <div className="tab-reglas">
            <div className="reglas-toolbar">
              <span className="reglas-info">{reglasPropuestas.length} reglas propuestas por la IA</span>
              {reglasPropuestas.length > 0 && (
                <button className="btn-aprobar-todos" onClick={handleAprobarTodasReglas}>
                  Aprobar todas las reglas
                </button>
              )}
            </div>

            {reglasPropuestas.length === 0 ? (
              <div className="empty-state">
                <p>No hay reglas propuestas</p>
                <p className="empty-desc">Ejecuta el analisis de documentos para que la IA proponga reglas BDM</p>
              </div>
            ) : (
              <div className="reglas-lista">
                {reglasPropuestas.map(regla => (
                  <div key={regla.id} className="regla-card">
                    <div className="regla-header">
                      <span
                        className="regla-categoria-badge"
                        style={{ background: CATEGORIAS[regla.categoria]?.color || '#64748b' }}
                      >
                        {regla.categoria}
                      </span>
                      <span className="regla-clave">{regla.clave}</span>
                      <span
                        className="regla-prioridad"
                        style={{ color: PRIORIDADES[regla.prioridad]?.color || '#64748b' }}
                      >
                        P{regla.prioridad} - {PRIORIDADES[regla.prioridad]?.label || 'Sin prioridad'}
                      </span>
                    </div>

                    {editandoRegla?.id === regla.id ? (
                      <div className="regla-edit">
                        <div className="edit-row">
                          <label>Clave:</label>
                          <input
                            type="text"
                            value={editandoRegla.clave}
                            onChange={(e) => setEditandoRegla({ ...editandoRegla, clave: e.target.value })}
                            className="edit-input"
                          />
                        </div>
                        <div className="edit-row">
                          <label>Valor:</label>
                          <textarea
                            value={editandoRegla.valor}
                            onChange={(e) => setEditandoRegla({ ...editandoRegla, valor: e.target.value })}
                            className="edit-textarea"
                            rows={3}
                          />
                        </div>
                        <div className="edit-row">
                          <label>Prioridad:</label>
                          <select
                            value={editandoRegla.prioridad}
                            onChange={(e) => setEditandoRegla({ ...editandoRegla, prioridad: parseInt(e.target.value) })}
                            className="edit-select"
                          >
                            {Object.entries(PRIORIDADES).map(([k, v]) => (
                              <option key={k} value={k}>P{k} - {v.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="edit-actions">
                          <button className="btn-save" onClick={() => handleGuardarEdicionRegla(regla.id)}>Guardar y Aprobar</button>
                          <button className="btn-cancel" onClick={() => setEditandoRegla(null)}>Cancelar</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="regla-valor">{regla.valor}</p>
                        <div className="regla-acciones">
                          <button className="btn-aprobar" onClick={() => handleAprobarRegla(regla.id)}>Aprobar</button>
                          <button className="btn-rechazar" onClick={() => handleRechazarRegla(regla.id)}>Rechazar</button>
                          <button
                            className="btn-editar"
                            onClick={() => setEditandoRegla({
                              id: regla.id,
                              categoria: regla.categoria,
                              clave: regla.clave,
                              valor: regla.valor,
                              prioridad: regla.prioridad
                            })}
                          >
                            Editar
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
