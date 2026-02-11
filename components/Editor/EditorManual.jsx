'use client'

import { useState, useEffect, useMemo } from 'react'
import { api } from '@/lib/api'
import MenuDescarga from './MenuDescarga'
import '@/styles/EditorManual.css'

// Categorias del conocimiento de marca (Entrenador IA)
const CATEGORIAS_CONOCIMIENTO = {
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

// Categorias predefinidas para el desplegable
const CATEGORIAS_OPCIONES = [
  { value: 'prompt', label: 'Prompt Principal' },
  { value: 'promocion', label: 'Promociones' },
  { value: 'regla', label: 'Reglas' },
  { value: 'horario', label: 'Horarios' },
  { value: 'info', label: 'Informacion General' },
  { value: 'precio', label: 'Precios' },
  { value: 'estilo_respuesta', label: 'Estilo de Respuesta' },
  { value: 'observacion', label: 'Observaciones' },
  { value: 'contacto', label: 'Contacto' },
  { value: 'servicio', label: 'Servicios' }
]

const EditorManual = ({ usuario, esSuperAdmin, marcaActiva, onDatosActualizados }) => {
  const [datos, setDatos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtroCategoria, setFiltroCategoria] = useState('todas')
  const [busqueda, setBusqueda] = useState('')
  const [editandoId, setEditandoId] = useState(null)
  const [formEdicion, setFormEdicion] = useState({})
  const [mostrarFormNuevo, setMostrarFormNuevo] = useState(false)
  const [formNuevo, setFormNuevo] = useState({
    categoria: '',
    clave: '',
    valor: '',
    prioridad: 3,
    fecha_inicio: '',
    fecha_caducidad: ''
  })
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState(null)

  // Estado para conocimiento de marca
  const [conocimiento, setConocimiento] = useState([])
  const [cargandoConocimiento, setCargandoConocimiento] = useState(false)
  const [filtroConocimientoCategoria, setFiltroConocimientoCategoria] = useState('')
  const [busquedaConocimiento, setBusquedaConocimiento] = useState('')
  const [expandidosConocimiento, setExpandidosConocimiento] = useState({})

  // Estado para comentarios
  const [vistaActiva, setVistaActiva] = useState('datos')
  const [comentarios, setComentarios] = useState([])
  const [cargandoComentarios, setCargandoComentarios] = useState(false)
  const [paginaComentarios, setPaginaComentarios] = useState(1)
  const [filasPorPagina, setFilasPorPagina] = useState(20)
  const [ordenColumna, setOrdenColumna] = useState('creado_en')
  const [ordenDireccion, setOrdenDireccion] = useState('desc')
  const [filtroComentarios, setFiltroComentarios] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('todos')

  useEffect(() => {
    cargarDatos()
  }, [usuario, marcaActiva?.id_marca])

  const cargarDatos = async () => {
    setCargando(true)
    try {
      const idMarcaCargar = marcaActiva?.id_marca || usuario?.id_marca
      const resultado = await api.getDatosMarca(idMarcaCargar, false)
      if (resultado.success) {
        setDatos(resultado.data || [])
      }
    } catch (error) {
      console.error('Error al cargar datos:', error)
    }
    setCargando(false)
  }

  // Cargar conocimiento de marca
  const cargarConocimiento = async () => {
    setCargandoConocimiento(true)
    try {
      const result = await api.getConocimientoEntrenador()
      if (result.success) {
        setConocimiento(result.conocimiento || [])
      }
    } catch (error) {
      console.error('Error al cargar conocimiento:', error)
    }
    setCargandoConocimiento(false)
  }

  // Filtrar conocimiento aprobado/editado
  const conocimientoAprobado = useMemo(() => {
    let items = conocimiento.filter(k => k.estado === 'aprobado' || k.estado === 'editado')

    if (filtroConocimientoCategoria) {
      items = items.filter(k => k.categoria === filtroConocimientoCategoria)
    }

    if (busquedaConocimiento) {
      const busq = busquedaConocimiento.toLowerCase()
      items = items.filter(k =>
        (k.titulo || '').toLowerCase().includes(busq) ||
        (k.contenido || '').toLowerCase().includes(busq) ||
        (k.categoria || '').toLowerCase().includes(busq)
      )
    }

    return items
  }, [conocimiento, filtroConocimientoCategoria, busquedaConocimiento])

  // Cargar comentarios
  const cargarComentarios = async () => {
    setCargandoComentarios(true)
    try {
      const idMarcaCargar = marcaActiva?.id_marca || usuario?.id_marca
      const resultado = await api.getComments(
        idMarcaCargar,
        500
      )
      if (resultado.success) {
        setComentarios(resultado.data || [])
        setPaginaComentarios(1)
      }
    } catch (error) {
      console.error('Error al cargar comentarios:', error)
    }
    setCargandoComentarios(false)
  }

  // Filtrar, ordenar y paginar comentarios
  const comentariosProcesados = useMemo(() => {
    let resultado = [...comentarios]

    // Filtrar por tipo
    if (filtroTipo === 'inapropiados') {
      resultado = resultado.filter(c => c.es_inapropiado)
    } else if (filtroTipo === 'con_respuesta') {
      resultado = resultado.filter(c => c.respuesta_comentario)
    }

    // Filtrar por texto
    if (filtroComentarios) {
      const busquedaLower = filtroComentarios.toLowerCase()
      resultado = resultado.filter(c =>
        (c.comentario_original || '').toLowerCase().includes(busquedaLower) ||
        (c.texto_publicacion || '').toLowerCase().includes(busquedaLower) ||
        (c.respuesta_comentario || '').toLowerCase().includes(busquedaLower)
      )
    }

    // Ordenar
    resultado.sort((a, b) => {
      let valorA = a[ordenColumna]
      let valorB = b[ordenColumna]

      if (ordenColumna === 'creado_en') {
        valorA = new Date(valorA || 0)
        valorB = new Date(valorB || 0)
      }

      if (ordenColumna === 'id') {
        valorA = Number(valorA) || 0
        valorB = Number(valorB) || 0
      }

      if (typeof valorA === 'string') valorA = valorA.toLowerCase()
      if (typeof valorB === 'string') valorB = valorB.toLowerCase()

      if (valorA < valorB) return ordenDireccion === 'asc' ? -1 : 1
      if (valorA > valorB) return ordenDireccion === 'asc' ? 1 : -1
      return 0
    })

    return resultado
  }, [comentarios, filtroComentarios, filtroTipo, ordenColumna, ordenDireccion])

  // Calcular comentarios paginados
  const totalPaginasComentarios = Math.ceil(comentariosProcesados.length / filasPorPagina)
  const comentariosPaginados = comentariosProcesados.slice(
    (paginaComentarios - 1) * filasPorPagina,
    paginaComentarios * filasPorPagina
  )

  // Cambiar ordenamiento
  const cambiarOrden = (columna) => {
    if (ordenColumna === columna) {
      setOrdenDireccion(ordenDireccion === 'asc' ? 'desc' : 'asc')
    } else {
      setOrdenColumna(columna)
      setOrdenDireccion('desc')
    }
    setPaginaComentarios(1)
  }

  // Icono de orden
  const iconoOrden = (columna) => {
    if (ordenColumna !== columna) return ''
    return ordenDireccion === 'asc' ? ' ^' : ' v'
  }

  // Cargar conocimiento cuando se cambia a esa vista
  useEffect(() => {
    if (vistaActiva === 'conocimiento' && conocimiento.length === 0) {
      cargarConocimiento()
    }
  }, [vistaActiva])

  // Cargar comentarios cuando se cambia a esa vista
  useEffect(() => {
    if (vistaActiva === 'comentarios' && comentarios.length === 0) {
      cargarComentarios()
    }
  }, [vistaActiva])

  // Obtener categorias unicas
  const categoriasExistentes = [...new Set(datos.map(d => d.categoria))].filter(Boolean)
  const todasCategorias = [...new Set([...CATEGORIAS_OPCIONES.map(c => c.value), ...categoriasExistentes])]

  // Filtrar datos
  const datosFiltrados = datos.filter(dato => {
    const coincideCategoria = filtroCategoria === 'todas' || dato.categoria === filtroCategoria
    const coincideBusqueda = !busqueda ||
      dato.clave?.toLowerCase().includes(busqueda.toLowerCase()) ||
      dato.valor?.toLowerCase().includes(busqueda.toLowerCase()) ||
      dato.categoria?.toLowerCase().includes(busqueda.toLowerCase())
    return coincideCategoria && coincideBusqueda
  })

  const mostrarMensaje = (texto, tipo = 'exito') => {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje(null), 3000)
  }

  // HANDLERS DE EDICION
  const iniciarEdicion = (dato) => {
    setEditandoId(dato.id)
    setFormEdicion({
      categoria: dato.categoria || '',
      clave: dato.clave || '',
      valor: dato.valor || '',
      prioridad: dato.prioridad || 3,
      fecha_inicio: dato.fecha_inicio ? dato.fecha_inicio.split('T')[0] : '',
      fecha_caducidad: dato.fecha_caducidad ? dato.fecha_caducidad.split('T')[0] : ''
    })
  }

  const cancelarEdicion = () => {
    setEditandoId(null)
    setFormEdicion({})
  }

  const guardarEdicion = async () => {
    if (!formEdicion.clave || !formEdicion.valor) {
      mostrarMensaje('Clave y valor son requeridos', 'error')
      return
    }

    setGuardando(true)
    try {
      const resultado = await api.updateDato(editandoId, {
        categoria: formEdicion.categoria,
        clave: formEdicion.clave,
        valor: formEdicion.valor,
        prioridad: parseInt(formEdicion.prioridad) || 3,
        fecha_inicio: formEdicion.fecha_inicio || null,
        fecha_caducidad: formEdicion.fecha_caducidad || null
      })

      if (resultado.success) {
        mostrarMensaje('Registro actualizado correctamente')
        await cargarDatos()
        onDatosActualizados?.()
        cancelarEdicion()
      } else {
        mostrarMensaje(resultado.error || 'Error al actualizar', 'error')
      }
    } catch (error) {
      mostrarMensaje(error.message, 'error')
    }
    setGuardando(false)
  }

  // HANDLERS DE NUEVO REGISTRO
  const guardarNuevo = async () => {
    if (!formNuevo.categoria || !formNuevo.clave || !formNuevo.valor) {
      mostrarMensaje('Categoria, clave y valor son requeridos', 'error')
      return
    }

    setGuardando(true)
    try {
      const resultado = await api.addDato({
        'ID marca': marcaActiva?.id_marca || usuario?.id_marca,
        'Nombre marca': marcaActiva?.nombre_marca || usuario?.nombre_marca,
        categoria: formNuevo.categoria,
        clave: formNuevo.clave,
        valor: formNuevo.valor,
        prioridad: parseInt(formNuevo.prioridad) || 3,
        fecha_inicio: formNuevo.fecha_inicio || null,
        fecha_caducidad: formNuevo.fecha_caducidad || null
      })

      if (resultado.success) {
        mostrarMensaje('Registro agregado correctamente')
        await cargarDatos()
        onDatosActualizados?.()
        setMostrarFormNuevo(false)
        setFormNuevo({
          categoria: '',
          clave: '',
          valor: '',
          prioridad: 3,
          fecha_inicio: '',
          fecha_caducidad: ''
        })
      } else {
        mostrarMensaje(resultado.error || 'Error al agregar', 'error')
      }
    } catch (error) {
      mostrarMensaje(error.message, 'error')
    }
    setGuardando(false)
  }

  // HANDLER DE DESACTIVAR
  const handleDesactivar = async (id) => {
    if (!window.confirm('Estas seguro de desactivar este registro?')) return

    setGuardando(true)
    try {
      const resultado = await api.deactivateDato(id)

      if (resultado.success) {
        mostrarMensaje('Registro desactivado')
        await cargarDatos()
        onDatosActualizados?.()
      } else {
        mostrarMensaje(resultado.error || 'Error al desactivar', 'error')
      }
    } catch (error) {
      mostrarMensaje(error.message, 'error')
    }
    setGuardando(false)
  }

  // RENDER
  return (
    <div className="editor-manual">
      {/* Header del Editor */}
      <div className="editor-header">
        <h2>Editor Manual</h2>
        {vistaActiva === 'datos' && (
          <button
            className="btn-agregar"
            onClick={() => setMostrarFormNuevo(!mostrarFormNuevo)}
          >
            {mostrarFormNuevo ? 'X Cancelar' : '+ Agregar'}
          </button>
        )}
      </div>

      {/* Pestanas para cambiar vista */}
      <div className="editor-tabs">
        <button
          className={`tab-btn ${vistaActiva === 'datos' ? 'active' : ''}`}
          onClick={() => setVistaActiva('datos')}
        >
          Datos de Marca
        </button>
        <button
          className={`tab-btn ${vistaActiva === 'conocimiento' ? 'active' : ''}`}
          onClick={() => setVistaActiva('conocimiento')}
        >
          Conocimiento IA
          {conocimientoAprobado.length > 0 && (
            <span className="tab-badge-conocimiento">{conocimientoAprobado.length}</span>
          )}
        </button>
        <button
          className={`tab-btn ${vistaActiva === 'comentarios' ? 'active' : ''}`}
          onClick={() => setVistaActiva('comentarios')}
        >
          Comentarios
        </button>
      </div>

      {/* Mensaje de feedback */}
      {mensaje && (
        <div className={`editor-mensaje ${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}

      {/* VISTA DE CONOCIMIENTO DE MARCA */}
      {vistaActiva === 'conocimiento' && (
        <div className="conocimiento-section">
          <div className="conocimiento-header-editor">
            <span>{conocimientoAprobado.length} conocimientos aprobados</span>
            <button className="btn-refresh" onClick={cargarConocimiento} title="Actualizar">
              R
            </button>
          </div>

          <div className="conocimiento-filtros-editor">
            <div className="filtro-busqueda">
              <input
                type="text"
                placeholder="Buscar en conocimiento..."
                value={busquedaConocimiento}
                onChange={(e) => setBusquedaConocimiento(e.target.value)}
              />
            </div>
            <select
              className="filtro-categoria-conocimiento"
              value={filtroConocimientoCategoria}
              onChange={(e) => setFiltroConocimientoCategoria(e.target.value)}
            >
              <option value="">Todas las categorias</option>
              {Object.entries(CATEGORIAS_CONOCIMIENTO).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
          </div>

          {cargandoConocimiento ? (
            <div className="editor-loading">Cargando conocimiento...</div>
          ) : conocimientoAprobado.length === 0 ? (
            <div className="editor-empty">
              No hay conocimiento aprobado. Entrena tu marca desde el Entrenador IA.
            </div>
          ) : (
            <div className="conocimiento-lista-editor">
              {Object.entries(CATEGORIAS_CONOCIMIENTO).map(([catKey, catInfo]) => {
                const items = conocimientoAprobado.filter(k => k.categoria === catKey)
                if (items.length === 0) return null
                return (
                  <div key={catKey} className="conocimiento-grupo-editor">
                    <div
                      className="conocimiento-grupo-header"
                      style={{ borderLeftColor: catInfo.color }}
                    >
                      <span
                        className="conocimiento-cat-dot"
                        style={{ background: catInfo.color }}
                      ></span>
                      <span className="conocimiento-cat-label">{catInfo.label}</span>
                      <span className="conocimiento-cat-count">{items.length}</span>
                    </div>
                    {items.map(item => (
                      <div
                        key={item.id}
                        className="conocimiento-item-editor"
                        onClick={() => setExpandidosConocimiento(prev => ({
                          ...prev, [item.id]: !prev[item.id]
                        }))}
                      >
                        <div className="item-titulo-row">
                          <span className="item-titulo">{item.titulo}</span>
                          <span
                            className="item-confianza"
                            style={{ color: item.confianza >= 80 ? '#10b981' : item.confianza >= 50 ? '#f59e0b' : '#ef4444' }}
                          >
                            {item.confianza}%
                          </span>
                        </div>
                        {expandidosConocimiento[item.id] && (
                          <div className="item-contenido-expanded">
                            {item.contenido}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* VISTA DE COMENTARIOS */}
      {vistaActiva === 'comentarios' && (
        <div className="comentarios-section">
          {/* Header con acciones */}
          <div className="comentarios-header">
            <span>{comentariosProcesados.length} de {comentarios.length} comentarios</span>
            <div className="comentarios-acciones">
              <MenuDescarga
                datos={comentariosProcesados}
                mapeoColumnas={{
                  'ID': 'id',
                  'Comentario Original': 'comentario_original',
                  'Texto Publicacion': 'texto_publicacion',
                  'Respuesta': 'respuesta_comentario',
                  'Mensaje Inbox': 'mensaje_inbox',
                  'Fecha': 'creado_en'
                }}
                nombreArchivo={`comentarios_${marcaActiva?.nombre_marca || usuario?.nombre_marca}`}
                titulo={`Comentarios - ${marcaActiva?.nombre_marca || usuario?.nombre_marca}`}
                tipo="comentarios"
                nombreMarca={marcaActiva?.nombre_marca || usuario?.nombre_marca}
                campoFecha="creado_en"
              />
              <button className="btn-refresh" onClick={cargarComentarios} title="Actualizar">
                R
              </button>
            </div>
          </div>

          {/* Filtros de comentarios */}
          <div className="comentarios-filtros">
            <div className="filtro-busqueda-comentarios">
              <input
                type="text"
                placeholder="Buscar en comentarios..."
                value={filtroComentarios}
                onChange={(e) => {
                  setFiltroComentarios(e.target.value)
                  setPaginaComentarios(1)
                }}
              />
            </div>
            <select
              className="filtro-tipo-comentarios"
              value={filtroTipo}
              onChange={(e) => {
                setFiltroTipo(e.target.value)
                setPaginaComentarios(1)
              }}
            >
              <option value="todos">Todos</option>
              <option value="inapropiados">Solo inapropiados</option>
              <option value="con_respuesta">Con respuesta</option>
            </select>
            <select
              className="filtro-filas"
              value={filasPorPagina}
              onChange={(e) => {
                setFilasPorPagina(Number(e.target.value))
                setPaginaComentarios(1)
              }}
            >
              <option value={10}>10 filas</option>
              <option value={20}>20 filas</option>
              <option value={50}>50 filas</option>
              <option value={100}>100 filas</option>
            </select>
          </div>

          {cargandoComentarios ? (
            <div className="editor-loading">Cargando comentarios...</div>
          ) : comentarios.length === 0 ? (
            <div className="editor-empty">No hay comentarios</div>
          ) : comentariosProcesados.length === 0 ? (
            <div className="editor-empty">No hay comentarios con los filtros aplicados</div>
          ) : (
            <>
              <div className="comentarios-tabla-container">
                <table className="comentarios-tabla">
                  <thead>
                    <tr>
                      <th className="th-ordenable" onClick={() => cambiarOrden('id')}>
                        ID{iconoOrden('id')}
                      </th>
                      <th className="th-ordenable" onClick={() => cambiarOrden('comentario_original')}>
                        Comentario Original{iconoOrden('comentario_original')}
                      </th>
                      <th>Texto Publicacion</th>
                      <th>Respuesta</th>
                      <th>Inbox</th>
                      <th className="th-ordenable" onClick={() => cambiarOrden('creado_en')}>
                        Fecha{iconoOrden('creado_en')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comentariosPaginados.map(c => (
                      <tr key={c.id} className={c.es_inapropiado ? 'fila-inapropiado' : ''}>
                        <td>{c.id}</td>
                        <td title={c.comentario_original || ''}>
                          {(c.comentario_original || '').substring(0, 40)}{(c.comentario_original || '').length > 40 ? '...' : ''}
                        </td>
                        <td title={c.texto_publicacion || ''}>
                          {(c.texto_publicacion || '').substring(0, 40)}{(c.texto_publicacion || '').length > 40 ? '...' : ''}
                        </td>
                        <td title={c.respuesta_comentario || ''}>
                          {(c.respuesta_comentario || '').substring(0, 40)}{(c.respuesta_comentario || '').length > 40 ? '...' : ''}
                        </td>
                        <td title={c.mensaje_inbox || ''}>
                          {(c.mensaje_inbox || '').substring(0, 40)}{(c.mensaje_inbox || '').length > 40 ? '...' : ''}
                        </td>
                        <td>{c.creado_en ? new Date(c.creado_en).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' }) : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Controles de paginacion */}
              <div className="paginacion-controles">
                <button
                  className="btn-paginacion"
                  onClick={() => setPaginaComentarios(p => Math.max(1, p - 1))}
                  disabled={paginaComentarios === 1}
                >
                  Anterior
                </button>
                <span className="paginacion-info">
                  Pagina {paginaComentarios} de {totalPaginasComentarios || 1}
                </span>
                <button
                  className="btn-paginacion"
                  onClick={() => setPaginaComentarios(p => Math.min(totalPaginasComentarios, p + 1))}
                  disabled={paginaComentarios >= totalPaginasComentarios}
                >
                  Siguiente
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* VISTA DE DATOS DE MARCA */}
      {vistaActiva === 'datos' && (
        <>
          {/* Formulario para nuevo registro */}
          {mostrarFormNuevo && (
            <div className="form-nuevo">
              <h3>Nuevo Registro</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Categoria *</label>
                  <select
                    value={formNuevo.categoria}
                    onChange={(e) => setFormNuevo({...formNuevo, categoria: e.target.value})}
                  >
                    <option value="">Seleccionar categoria...</option>
                    {CATEGORIAS_OPCIONES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Clave *</label>
                  <input
                    type="text"
                    value={formNuevo.clave}
                    onChange={(e) => setFormNuevo({...formNuevo, clave: e.target.value})}
                    placeholder="ej: descuento_navidad, horario_atencion"
                  />
                </div>
                <div className="form-group form-group-full">
                  <label>Descripcion *</label>
                  <textarea
                    value={formNuevo.valor}
                    onChange={(e) => setFormNuevo({...formNuevo, valor: e.target.value})}
                    placeholder="Ej: Promocion especial de Navidad con 30% de descuento..."
                    rows={4}
                  />
                </div>
                <div className="form-group">
                  <label>Prioridad</label>
                  <select
                    value={formNuevo.prioridad}
                    onChange={(e) => setFormNuevo({...formNuevo, prioridad: e.target.value})}
                  >
                    <option value={1}>1 - Maxima</option>
                    <option value={2}>2 - Alta</option>
                    <option value={3}>3 - Normal</option>
                    <option value={4}>4 - Baja</option>
                    <option value={5}>5 - Minima</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Fecha inicio</label>
                  <input
                    type="date"
                    value={formNuevo.fecha_inicio}
                    onChange={(e) => setFormNuevo({...formNuevo, fecha_inicio: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Fecha termino</label>
                  <input
                    type="date"
                    value={formNuevo.fecha_caducidad}
                    onChange={(e) => setFormNuevo({...formNuevo, fecha_caducidad: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-actions">
                <button
                  className="btn-cancelar"
                  onClick={() => setMostrarFormNuevo(false)}
                >
                  Cancelar
                </button>
                <button
                  className="btn-guardar"
                  onClick={guardarNuevo}
                  disabled={guardando}
                >
                  {guardando ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          )}

          {/* Filtros */}
          <div className="editor-filtros">
            <div className="filtro-busqueda">
              <input
                type="text"
                placeholder="Buscar..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <div className="filtro-categoria">
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
              >
                <option value="todas">Todas las categorias</option>
                {todasCategorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <button className="btn-refresh" onClick={cargarDatos} title="Actualizar">
              R
            </button>
          </div>

          {/* Lista de datos */}
          <div className="editor-lista">
            {cargando ? (
              <div className="editor-loading">Cargando datos...</div>
            ) : datosFiltrados.length === 0 ? (
              <div className="editor-empty">
                No hay datos que mostrar
              </div>
            ) : (
              datosFiltrados.map(dato => (
                <div key={dato.id} className={`editor-card ${editandoId === dato.id ? 'editando' : ''}`}>
                  {editandoId === dato.id ? (
                    // Modo edicion
                    <div className="card-edicion">
                      <div className="form-grid">
                        <div className="form-group">
                          <label>Categoria</label>
                          <select
                            value={formEdicion.categoria}
                            onChange={(e) => setFormEdicion({...formEdicion, categoria: e.target.value})}
                          >
                            <option value="">Seleccionar categoria...</option>
                            {CATEGORIAS_OPCIONES.map(cat => (
                              <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Clave</label>
                          <input
                            type="text"
                            value={formEdicion.clave}
                            onChange={(e) => setFormEdicion({...formEdicion, clave: e.target.value})}
                          />
                        </div>
                        <div className="form-group form-group-full">
                          <label>Descripcion</label>
                          <textarea
                            value={formEdicion.valor}
                            onChange={(e) => setFormEdicion({...formEdicion, valor: e.target.value})}
                            rows={4}
                          />
                        </div>
                        <div className="form-group">
                          <label>Prioridad</label>
                          <select
                            value={formEdicion.prioridad}
                            onChange={(e) => setFormEdicion({...formEdicion, prioridad: e.target.value})}
                          >
                            <option value={1}>1 - Maxima</option>
                            <option value={2}>2 - Alta</option>
                            <option value={3}>3 - Normal</option>
                            <option value={4}>4 - Baja</option>
                            <option value={5}>5 - Minima</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Fecha inicio</label>
                          <input
                            type="date"
                            value={formEdicion.fecha_inicio}
                            onChange={(e) => setFormEdicion({...formEdicion, fecha_inicio: e.target.value})}
                          />
                        </div>
                        <div className="form-group">
                          <label>Fecha termino</label>
                          <input
                            type="date"
                            value={formEdicion.fecha_caducidad}
                            onChange={(e) => setFormEdicion({...formEdicion, fecha_caducidad: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="form-actions">
                        <button className="btn-cancelar" onClick={cancelarEdicion}>
                          Cancelar
                        </button>
                        <button
                          className="btn-guardar"
                          onClick={guardarEdicion}
                          disabled={guardando}
                        >
                          {guardando ? 'Guardando...' : 'Guardar'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Modo visualizacion
                    <>
                      <div className="card-header">
                        <span className="card-categoria">{dato.categoria}</span>
                        <span className="card-id">ID: {dato.id}</span>
                      </div>
                      <div className="card-body">
                        <div className="card-clave">{dato.clave}</div>
                        <div className="card-valor">{dato.valor}</div>
                      </div>
                      <div className="card-meta">
                        <span className="meta-prioridad" title="Prioridad">
                          P{dato.prioridad}
                        </span>
                        {dato.fecha_inicio && (
                          <span className="meta-fecha" title="Fecha inicio">
                            Desde: {new Date(dato.fecha_inicio).toLocaleDateString('es-CL')}
                          </span>
                        )}
                        {dato.fecha_caducidad && (
                          <span className="meta-fecha" title="Fecha termino">
                            Hasta: {new Date(dato.fecha_caducidad).toLocaleDateString('es-CL')}
                          </span>
                        )}
                      </div>
                      <div className="card-actions">
                        <button
                          className="btn-editar"
                          onClick={() => iniciarEdicion(dato)}
                          title="Editar"
                        >
                          E
                        </button>
                        <button
                          className="btn-desactivar"
                          onClick={() => handleDesactivar(dato.id)}
                          title="Desactivar"
                        >
                          X
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer con contador y descarga */}
          <div className="editor-footer">
            <span>{datosFiltrados.length} de {datos.length} registros</span>
            <MenuDescarga
              datos={datosFiltrados}
              mapeoColumnas={{
                'ID': 'id',
                'Categoria': 'categoria',
                'Clave': 'clave',
                'Valor': 'valor',
                'Prioridad': 'prioridad',
                'Estado': 'Estado',
                'Fecha Inicio': 'fecha_inicio',
                'Fecha Termino': 'fecha_caducidad'
              }}
              nombreArchivo={`datos_${marcaActiva?.nombre_marca || usuario?.nombre_marca}`}
              titulo={`Datos de Marca - ${marcaActiva?.nombre_marca || usuario?.nombre_marca}`}
              tipo="datos"
              nombreMarca={marcaActiva?.nombre_marca || usuario?.nombre_marca}
              campoFecha="fecha_inicio"
            />
          </div>
        </>
      )}
    </div>
  )
}

export default EditorManual
