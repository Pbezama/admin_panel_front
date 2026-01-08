'use client'

/**
 * TareasView - Vista de Tareas con Pipeline/Kanban
 *
 * Incluye:
 * - Drag & Drop entre columnas
 * - Sistema de notas con archivos
 * - Filtros y busqueda
 * - Indicadores de vencimiento
 * - Historial de cambios
 * - ChatIA flotante para colaboradores
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useView } from '@/context/ViewContext'
import { api } from '@/lib/api'
import '@/styles/TareasView.css'

// Estados del pipeline
const ESTADOS = [
  { id: 'pendiente', nombre: 'Pendiente', color: '#f59e0b', icon: '○' },
  { id: 'asignada', nombre: 'Asignada', color: '#3b82f6', icon: '◐' },
  { id: 'en_proceso', nombre: 'En Proceso', color: '#8b5cf6', icon: '◑' },
  { id: 'completada', nombre: 'Completada', color: '#10b981', icon: '●' }
]

// Tipos de tarea
const TIPOS_TAREA = {
  crear_imagen: { nombre: 'Crear Imagen', icon: '🎨' },
  verificar_respuesta: { nombre: 'Verificar Respuesta', icon: '✓' },
  revisar_contenido: { nombre: 'Revisar Contenido', icon: '📝' },
  responder_cliente: { nombre: 'Responder Cliente', icon: '💬' },
  otro: { nombre: 'Otro', icon: '📋' }
}

// Prioridades
const PRIORIDADES = {
  alta: { nombre: 'Alta', color: '#ef4444', icon: '🔴' },
  media: { nombre: 'Media', color: '#f59e0b', icon: '🟡' },
  baja: { nombre: 'Baja', color: '#10b981', icon: '🟢' }
}

// Funcion para calcular dias restantes
const diasRestantes = (fecha) => {
  if (!fecha) return null
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const limite = new Date(fecha)
  limite.setHours(0, 0, 0, 0)
  const diff = Math.ceil((limite - hoy) / (1000 * 60 * 60 * 24))
  return diff
}

// Formatear tamaño de archivo
const formatearTamano = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
}

// ============================================
// COMPONENTE: ChatIA Flotante
// ============================================
const ChatIAFlotante = ({ usuario }) => {
  const [abierto, setAbierto] = useState(false)
  const [minimizado, setMinimizado] = useState(false)
  const [mensajes, setMensajes] = useState([])
  const [inputMensaje, setInputMensaje] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [posicion, setPosicion] = useState({ x: 0, y: 100 })
  const [arrastrando, setArrastrando] = useState(false)
  const [offsetArrastre, setOffsetArrastre] = useState({ x: 0, y: 0 })

  // Establecer posicion inicial en el cliente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPosicion({ x: window.innerWidth - 420, y: 100 })
    }
  }, [])

  const chatEndRef = useRef(null)
  const contenedorRef = useRef(null)

  // Scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    if (abierto && !minimizado) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [mensajes, abierto, minimizado])

  // Agregar mensaje de bienvenida al abrir
  useEffect(() => {
    if (abierto && mensajes.length === 0) {
      setMensajes([{
        rol: 'assistant',
        contenido: `Hola ${usuario?.nombre}! Soy ChatIA, tu asistente. Puedo ayudarte con:\n\n- Responder preguntas sobre tus tareas\n- Darte ideas y sugerencias\n- Ayudarte a redactar contenido\n\nEscribe lo que necesites.`,
        timestamp: new Date().toISOString()
      }])
    }
  }, [abierto, usuario?.nombre])

  // Handlers de arrastre
  const handleMouseDown = useCallback((e) => {
    if (e.target.closest('.chatia-header')) {
      setArrastrando(true)
      const rect = contenedorRef.current.getBoundingClientRect()
      setOffsetArrastre({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
    }
  }, [])

  const handleMouseMove = useCallback((e) => {
    if (arrastrando) {
      const nuevoX = Math.max(0, Math.min(window.innerWidth - 400, e.clientX - offsetArrastre.x))
      const nuevoY = Math.max(0, Math.min(window.innerHeight - 100, e.clientY - offsetArrastre.y))
      setPosicion({ x: nuevoX, y: nuevoY })
    }
  }, [arrastrando, offsetArrastre])

  const handleMouseUp = useCallback(() => {
    setArrastrando(false)
  }, [])

  useEffect(() => {
    if (arrastrando) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [arrastrando, handleMouseMove, handleMouseUp])

  const handleEnviarMensaje = async (e) => {
    e.preventDefault()
    if (!inputMensaje.trim() || enviando) return

    const textoMensaje = inputMensaje.trim()
    setInputMensaje('')
    setEnviando(true)

    // Agregar mensaje del usuario
    const mensajeUsuario = {
      rol: 'user',
      contenido: textoMensaje,
      timestamp: new Date().toISOString()
    }
    setMensajes(prev => [...prev, mensajeUsuario])

    try {
      const historial = mensajes.map(m => ({
        rol: m.rol,
        contenido: m.contenido
      }))

      const respuesta = await api.chatIA(textoMensaje, historial, {
        nombreMarca: usuario?.nombre_marca,
        datosMarca: []
      })

      const mensajeRespuesta = {
        rol: 'assistant',
        contenido: respuesta.contenido,
        timestamp: new Date().toISOString()
      }
      setMensajes(prev => [...prev, mensajeRespuesta])
    } catch (err) {
      console.error('Error en ChatIA:', err)
      const mensajeError = {
        rol: 'assistant',
        contenido: 'Lo siento, tuve un problema. Intenta de nuevo.',
        timestamp: new Date().toISOString()
      }
      setMensajes(prev => [...prev, mensajeError])
    }

    setEnviando(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleEnviarMensaje(e)
    }
  }

  // Boton flotante cuando esta cerrado
  if (!abierto) {
    return (
      <button
        className="chatia-boton-flotante"
        onClick={() => setAbierto(true)}
        title="Abrir ChatIA"
      >
        <span className="chatia-boton-icon">💬</span>
        <span className="chatia-boton-texto">ChatIA</span>
      </button>
    )
  }

  return (
    <div
      ref={contenedorRef}
      className={`chatia-flotante ${minimizado ? 'minimizado' : ''} ${arrastrando ? 'arrastrando' : ''}`}
      style={{ left: posicion.x, top: posicion.y }}
      onMouseDown={handleMouseDown}
    >
      {/* Header arrastrable */}
      <div className="chatia-header">
        <div className="chatia-header-info">
          <span className="chatia-icon">🤖</span>
          <span className="chatia-titulo">ChatIA</span>
        </div>
        <div className="chatia-header-acciones">
          <button
            className="chatia-btn-minimizar"
            onClick={() => setMinimizado(!minimizado)}
            title={minimizado ? 'Expandir' : 'Minimizar'}
          >
            {minimizado ? '◻' : '—'}
          </button>
          <button
            className="chatia-btn-cerrar"
            onClick={() => setAbierto(false)}
            title="Cerrar"
          >
            ×
          </button>
        </div>
      </div>

      {/* Contenido */}
      {!minimizado && (
        <>
          {/* Area de mensajes con scroll */}
          <div className="chatia-mensajes">
            {mensajes.map((msg, idx) => (
              <div key={idx} className={`chatia-mensaje ${msg.rol}`}>
                <div className="chatia-mensaje-contenido">
                  {msg.contenido.split('\n').map((linea, i) => (
                    <span key={i}>{linea}<br /></span>
                  ))}
                </div>
                <span className="chatia-mensaje-hora">
                  {new Date(msg.timestamp).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            {enviando && (
              <div className="chatia-mensaje assistant">
                <div className="chatia-typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleEnviarMensaje} className="chatia-input-form">
            <textarea
              value={inputMensaje}
              onChange={(e) => setInputMensaje(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu mensaje..."
              disabled={enviando}
              rows={1}
            />
            <button type="submit" disabled={enviando || !inputMensaje.trim()}>
              {enviando ? '...' : '➤'}
            </button>
          </form>
        </>
      )}
    </div>
  )
}

// ============================================
// COMPONENTE: TareaCard
// ============================================
const TareaCard = ({ tarea, onVerDetalle, onDragStart, onDragEnd }) => {
  const tipo = TIPOS_TAREA[tarea.tipo] || TIPOS_TAREA.otro
  const prioridad = PRIORIDADES[tarea.prioridad] || PRIORIDADES.media
  const dias = diasRestantes(tarea.fecha_limite)
  const estaVencida = dias !== null && dias < 0 && tarea.estado !== 'completada'
  const proximaVencer = dias !== null && dias >= 0 && dias <= 2 && tarea.estado !== 'completada'

  return (
    <div
      className={`tarea-card ${estaVencida ? 'vencida' : ''} ${proximaVencer ? 'proxima-vencer' : ''}`}
      draggable
      onDragStart={(e) => onDragStart(e, tarea)}
      onDragEnd={onDragEnd}
      onClick={() => onVerDetalle(tarea)}
    >
      <div className="tarea-header">
        <span className="tarea-tipo" title={tipo.nombre}>{tipo.icon}</span>
        <span className="tarea-prioridad" style={{ color: prioridad.color }} title={`Prioridad ${prioridad.nombre}`}>
          {prioridad.icon}
        </span>
      </div>

      <h4 className="tarea-titulo">{tarea.titulo}</h4>

      {tarea.descripcion && (
        <p className="tarea-descripcion">
          {tarea.descripcion.length > 60 ? `${tarea.descripcion.substring(0, 60)}...` : tarea.descripcion}
        </p>
      )}

      <div className="tarea-footer">
        {tarea.fecha_limite && (
          <span className={`tarea-fecha ${estaVencida ? 'vencida' : ''} ${proximaVencer ? 'proxima' : ''}`}>
            📅 {dias === 0 ? 'Hoy' : dias === 1 ? 'Mañana' : dias < 0 ? `Vencida hace ${Math.abs(dias)}d` : `${dias}d`}
          </span>
        )}
        <div className="tarea-badges">
          {tarea.creado_por_sistema && <span className="badge-sistema" title="Creada por IA">🤖</span>}
          {tarea.nombre_asignado && <span className="badge-asignado" title={tarea.nombre_asignado}>👤</span>}
        </div>
      </div>
    </div>
  )
}

// ============================================
// COMPONENTE: PipelineColumna con Drop
// ============================================
const PipelineColumna = ({ estado, tareas, onVerDetalle, onDragStart, onDragEnd, onDrop, dragOverEstado }) => {
  const estadoInfo = ESTADOS.find(e => e.id === estado)
  const isOver = dragOverEstado === estado

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  return (
    <div
      className={`pipeline-columna ${isOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDrop={(e) => onDrop(e, estado)}
    >
      <div className="columna-header" style={{ borderColor: estadoInfo.color }}>
        <span className="columna-icon" style={{ color: estadoInfo.color }}>{estadoInfo.icon}</span>
        <h3>{estadoInfo.nombre}</h3>
        <span className="columna-count">{tareas.length}</span>
      </div>

      <div className="columna-contenido">
        {tareas.length === 0 ? (
          <div className="columna-vacia">Arrastra tareas aqui</div>
        ) : (
          tareas.map(tarea => (
            <TareaCard
              key={tarea.id}
              tarea={tarea}
              onVerDetalle={onVerDetalle}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            />
          ))
        )}
      </div>
    </div>
  )
}

// ============================================
// COMPONENTE: Modal Detalle con Notas e Historial
// ============================================
const TareaDetalleModal = ({ tarea, onClose, onCambiarEstado, esAdmin, colaboradores, onActualizarTarea }) => {
  const { usuario } = useAuth()
  const [tab, setTab] = useState('detalle') // detalle, notas, historial
  const [notas, setNotas] = useState([])
  const [historial, setHistorial] = useState([])
  const [nuevaNota, setNuevaNota] = useState('')
  const [subiendoArchivo, setSubiendoArchivo] = useState(false)
  const [cargando, setCargando] = useState(false)
  const fileInputRef = useRef(null)

  const tipo = TIPOS_TAREA[tarea.tipo] || TIPOS_TAREA.otro
  const prioridad = PRIORIDADES[tarea.prioridad] || PRIORIDADES.media
  const estadoActual = ESTADOS.find(e => e.id === tarea.estado)

  // Cargar notas e historial
  useEffect(() => {
    cargarNotas()
    cargarHistorial()
  }, [tarea.id])

  const cargarNotas = async () => {
    try {
      const resultado = await api.getNotasTarea(tarea.id)
      if (resultado.success) setNotas(resultado.data)
    } catch (err) {
      console.error('Error cargando notas:', err)
    }
  }

  const cargarHistorial = async () => {
    try {
      const resultado = await api.getHistorialTarea(tarea.id)
      if (resultado.success) setHistorial(resultado.data)
    } catch (err) {
      console.error('Error cargando historial:', err)
    }
  }

  const handleAgregarNota = async () => {
    if (!nuevaNota.trim()) return
    setCargando(true)
    try {
      await api.agregarNotaTarea(tarea.id, {
        contenido: nuevaNota,
        tipo: 'texto'
      })
      setNuevaNota('')
      await cargarNotas()
    } catch (err) {
      console.error('Error agregando nota:', err)
    }
    setCargando(false)
  }

  const handleSubirArchivo = async (e) => {
    const archivo = e.target.files[0]
    if (!archivo) return

    setSubiendoArchivo(true)
    try {
      // Subir archivo
      const uploadResult = await api.uploadArchivoTarea(tarea.id, archivo)
      if (uploadResult.success) {
        // Crear nota con el archivo
        await api.agregarNotaTarea(tarea.id, {
          contenido: `Archivo adjunto: ${archivo.name}`,
          tipo: esImagen(archivo.type) ? 'imagen' : 'archivo',
          archivo_url: uploadResult.data.url,
          archivo_nombre: uploadResult.data.nombre,
          archivo_tipo: uploadResult.data.tipo,
          archivo_tamano: uploadResult.data.tamano
        })
        await cargarNotas()
      }
    } catch (err) {
      console.error('Error subiendo archivo:', err)
      alert('Error al subir el archivo')
    }
    setSubiendoArchivo(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const esImagen = (tipo) => tipo && tipo.startsWith('image/')
  const esVideo = (tipo) => tipo && tipo.startsWith('video/')

  const handleCambiarAsignado = async (nuevoAsignado) => {
    const colaborador = colaboradores.find(c => c.id === parseInt(nuevoAsignado))
    try {
      await api.updateTarea(tarea.id, {
        asignado_a: nuevoAsignado ? parseInt(nuevoAsignado) : null,
        nombre_asignado: colaborador?.nombre || null
      })
      onActualizarTarea()
    } catch (err) {
      console.error('Error actualizando asignado:', err)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-contenido modal-detalle" onClick={e => e.stopPropagation()}>
        <button className="modal-cerrar" onClick={onClose}>×</button>

        {/* Header */}
        <div className="modal-header-detalle">
          <div className="modal-badges">
            <span className="modal-tipo">{tipo.icon} {tipo.nombre}</span>
            <span className="modal-prioridad" style={{ background: prioridad.color }}>{prioridad.nombre}</span>
          </div>
          <h2>{tarea.titulo}</h2>
        </div>

        {/* Tabs */}
        <div className="modal-tabs">
          <button className={tab === 'detalle' ? 'activo' : ''} onClick={() => setTab('detalle')}>
            Detalle
          </button>
          <button className={tab === 'notas' ? 'activo' : ''} onClick={() => setTab('notas')}>
            Notas ({notas.length})
          </button>
          <button className={tab === 'archivos' ? 'activo' : ''} onClick={() => setTab('archivos')}>
            Archivos ({notas.filter(n => n.archivo_url).length})
          </button>
          <button className={tab === 'historial' ? 'activo' : ''} onClick={() => setTab('historial')}>
            Historial ({historial.length})
          </button>
        </div>

        {/* Tab: Detalle */}
        {tab === 'detalle' && (
          <div className="tab-contenido">
            {tarea.descripcion && (
              <div className="detalle-seccion">
                <h4>Descripcion</h4>
                <p>{tarea.descripcion}</p>
              </div>
            )}

            <div className="detalle-grid">
              <div className="detalle-item">
                <label>Estado</label>
                <select
                  value={tarea.estado}
                  onChange={(e) => onCambiarEstado(tarea.id, e.target.value)}
                  style={{ borderColor: estadoActual.color }}
                >
                  {ESTADOS.map(est => (
                    <option key={est.id} value={est.id}>{est.icon} {est.nombre}</option>
                  ))}
                </select>
              </div>

              {esAdmin && (
                <div className="detalle-item">
                  <label>Asignado a</label>
                  <select
                    value={tarea.asignado_a || ''}
                    onChange={(e) => handleCambiarAsignado(e.target.value)}
                  >
                    <option value="">Sin asignar</option>
                    {colaboradores.map(col => (
                      <option key={col.id} value={col.id}>{col.nombre}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="detalle-item">
                <label>Fecha Limite</label>
                <span>{tarea.fecha_limite ? new Date(tarea.fecha_limite).toLocaleDateString('es-CL') : 'Sin fecha'}</span>
              </div>

              <div className="detalle-item">
                <label>Creada</label>
                <span>{new Date(tarea.fecha_creacion).toLocaleDateString('es-CL')}</span>
              </div>

              {tarea.fecha_completada && (
                <div className="detalle-item">
                  <label>Completada</label>
                  <span>{new Date(tarea.fecha_completada).toLocaleDateString('es-CL')}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Notas */}
        {tab === 'notas' && (
          <div className="tab-contenido tab-notas">
            {/* Input nueva nota */}
            <div className="nueva-nota">
              <textarea
                value={nuevaNota}
                onChange={(e) => setNuevaNota(e.target.value)}
                placeholder="Escribe una nota..."
                rows={3}
              />
              <div className="nueva-nota-acciones">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleSubirArchivo}
                  style={{ display: 'none' }}
                />
                <button
                  className="btn-adjuntar"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={subiendoArchivo}
                >
                  {subiendoArchivo ? '⏳' : '📎'} Adjuntar
                </button>
                <button
                  className="btn-enviar-nota"
                  onClick={handleAgregarNota}
                  disabled={cargando || !nuevaNota.trim()}
                >
                  Agregar Nota
                </button>
              </div>
            </div>

            {/* Lista de notas */}
            <div className="notas-lista">
              {notas.length === 0 ? (
                <p className="sin-notas">No hay notas todavia</p>
              ) : (
                notas.map(nota => (
                  <div key={nota.id} className={`nota-item ${nota.tipo}`}>
                    <div className="nota-header">
                      <span className="nota-autor">{nota.nombre_creador}</span>
                      <span className="nota-fecha">
                        {new Date(nota.fecha_creacion).toLocaleString('es-CL')}
                      </span>
                    </div>

                    {nota.contenido && <p className="nota-contenido">{nota.contenido}</p>}

                    {nota.archivo_url && (
                      <div className="nota-archivo">
                        {esImagen(nota.archivo_tipo) ? (
                          <a href={nota.archivo_url} target="_blank" rel="noopener noreferrer">
                            <img src={nota.archivo_url} alt={nota.archivo_nombre} className="nota-imagen" />
                          </a>
                        ) : esVideo(nota.archivo_tipo) ? (
                          <video controls className="nota-video">
                            <source src={nota.archivo_url} type={nota.archivo_tipo} />
                          </video>
                        ) : (
                          <a href={nota.archivo_url} target="_blank" rel="noopener noreferrer" className="nota-archivo-link">
                            📄 {nota.archivo_nombre} ({formatearTamano(nota.archivo_tamano)})
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab: Archivos */}
        {tab === 'archivos' && (
          <div className="tab-contenido tab-archivos">
            {/* Subir archivo */}
            <div className="subir-archivo-seccion">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleSubirArchivo}
                style={{ display: 'none' }}
              />
              <button
                className="btn-subir-archivo"
                onClick={() => fileInputRef.current?.click()}
                disabled={subiendoArchivo}
              >
                {subiendoArchivo ? '⏳ Subiendo...' : '📤 Subir Archivo'}
              </button>
            </div>

            {/* Lista de archivos */}
            <div className="archivos-lista">
              {notas.filter(n => n.archivo_url).length === 0 ? (
                <p className="sin-archivos">No hay archivos adjuntos</p>
              ) : (
                notas.filter(n => n.archivo_url).map(archivo => (
                  <div key={archivo.id} className="archivo-item">
                    <div className="archivo-preview">
                      {esImagen(archivo.archivo_tipo) ? (
                        <img src={archivo.archivo_url} alt={archivo.archivo_nombre} />
                      ) : esVideo(archivo.archivo_tipo) ? (
                        <span className="archivo-icono">🎬</span>
                      ) : (
                        <span className="archivo-icono">📄</span>
                      )}
                    </div>
                    <div className="archivo-info">
                      <span className="archivo-nombre">{archivo.archivo_nombre}</span>
                      <span className="archivo-meta">
                        {formatearTamano(archivo.archivo_tamano)} • {new Date(archivo.fecha_creacion).toLocaleDateString('es-CL')}
                      </span>
                      <span className="archivo-autor">Subido por {archivo.nombre_creador}</span>
                    </div>
                    <div className="archivo-acciones">
                      <a
                        href={archivo.archivo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-ver-archivo"
                        title="Ver archivo"
                      >
                        👁
                      </a>
                      <a
                        href={archivo.archivo_url}
                        download={archivo.archivo_nombre}
                        className="btn-descargar-archivo"
                        title="Descargar"
                      >
                        ⬇
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab: Historial */}
        {tab === 'historial' && (
          <div className="tab-contenido tab-historial">
            {historial.length === 0 ? (
              <p className="sin-historial">No hay cambios registrados</p>
            ) : (
              <div className="historial-lista">
                {historial.map(item => (
                  <div key={item.id} className="historial-item">
                    <div className="historial-icono">📝</div>
                    <div className="historial-contenido">
                      <p>
                        <strong>{item.nombre_modificador}</strong> cambio <em>{item.campo_modificado}</em>
                      </p>
                      <p className="historial-cambio">
                        <span className="valor-anterior">{item.valor_anterior}</span>
                        <span className="flecha">→</span>
                        <span className="valor-nuevo">{item.valor_nuevo}</span>
                      </p>
                      <span className="historial-fecha">
                        {new Date(item.fecha_modificacion).toLocaleString('es-CL')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// COMPONENTE: Modal Nueva Tarea
// ============================================
const NuevaTareaModal = ({ onClose, onCrear, colaboradores }) => {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    tipo: 'otro',
    prioridad: 'media',
    fecha_limite: '',
    asignado_a: ''
  })
  const [creando, setCreando] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.titulo.trim()) return
    if (!formData.asignado_a) {
      alert('Debes asignar la tarea a un colaborador')
      return
    }

    setCreando(true)
    const colaborador = colaboradores.find(c => c.id === parseInt(formData.asignado_a))
    await onCrear({
      ...formData,
      asignado_a: parseInt(formData.asignado_a),
      nombre_asignado: colaborador?.nombre || null,
      fecha_limite: formData.fecha_limite || null
    })
    setCreando(false)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-contenido modal-form" onClick={e => e.stopPropagation()}>
        <button className="modal-cerrar" onClick={onClose}>×</button>
        <h2>Nueva Tarea</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-grupo">
            <label>Titulo *</label>
            <input
              type="text"
              value={formData.titulo}
              onChange={(e) => setFormData({...formData, titulo: e.target.value})}
              placeholder="Titulo de la tarea"
              required
            />
          </div>

          <div className="form-grupo">
            <label>Descripcion</label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
              placeholder="Descripcion detallada..."
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-grupo">
              <label>Tipo</label>
              <select value={formData.tipo} onChange={(e) => setFormData({...formData, tipo: e.target.value})}>
                {Object.entries(TIPOS_TAREA).map(([key, val]) => (
                  <option key={key} value={key}>{val.icon} {val.nombre}</option>
                ))}
              </select>
            </div>
            <div className="form-grupo">
              <label>Prioridad</label>
              <select value={formData.prioridad} onChange={(e) => setFormData({...formData, prioridad: e.target.value})}>
                {Object.entries(PRIORIDADES).map(([key, val]) => (
                  <option key={key} value={key}>{val.icon} {val.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-grupo">
              <label>Fecha Limite</label>
              <input
                type="date"
                value={formData.fecha_limite}
                onChange={(e) => setFormData({...formData, fecha_limite: e.target.value})}
              />
            </div>
            <div className="form-grupo">
              <label>Asignar a *</label>
              <select value={formData.asignado_a} onChange={(e) => setFormData({...formData, asignado_a: e.target.value})} required>
                <option value="">Seleccionar colaborador</option>
                {colaboradores.map(col => (
                  <option key={col.id} value={col.id}>{col.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-acciones">
            <button type="button" className="btn-cancelar" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-crear" disabled={creando}>
              {creando ? 'Creando...' : 'Crear Tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ============================================
// COMPONENTE: Modal Todos los Archivos (Admin)
// ============================================
const TodosArchivosModal = ({ onClose, onVerTarea }) => {
  const [archivos, setArchivos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtroTarea, setFiltroTarea] = useState('')

  useEffect(() => {
    cargarArchivos()
  }, [])

  const cargarArchivos = async () => {
    try {
      const resultado = await api.getTodosLosArchivos()
      if (resultado.success) setArchivos(resultado.data)
    } catch (err) {
      console.error('Error cargando archivos:', err)
    }
    setCargando(false)
  }

  const esImagen = (tipo) => tipo && tipo.startsWith('image/')
  const esVideo = (tipo) => tipo && tipo.startsWith('video/')

  // Agrupar archivos por tarea
  const archivosPorTarea = archivos.reduce((acc, archivo) => {
    const tareaId = archivo.id_tarea
    if (!acc[tareaId]) {
      acc[tareaId] = {
        id: tareaId,
        titulo: archivo.tarea_titulo,
        estado: archivo.tarea_estado,
        archivos: []
      }
    }
    acc[tareaId].archivos.push(archivo)
    return acc
  }, {})

  const tareasConArchivos = Object.values(archivosPorTarea).filter(t =>
    !filtroTarea || t.titulo.toLowerCase().includes(filtroTarea.toLowerCase())
  )

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-contenido modal-archivos-todos" onClick={e => e.stopPropagation()}>
        <button className="modal-cerrar" onClick={onClose}>×</button>
        <h2>📁 Todos los Archivos</h2>

        {/* Buscador */}
        <div className="archivos-filtro">
          <input
            type="text"
            placeholder="🔍 Buscar por tarea..."
            value={filtroTarea}
            onChange={(e) => setFiltroTarea(e.target.value)}
          />
          <span className="archivos-total">{archivos.length} archivos en total</span>
        </div>

        {cargando ? (
          <p className="cargando-archivos">Cargando archivos...</p>
        ) : tareasConArchivos.length === 0 ? (
          <p className="sin-archivos-global">No hay archivos subidos</p>
        ) : (
          <div className="archivos-por-tarea">
            {tareasConArchivos.map(tarea => (
              <div key={tarea.id} className="tarea-archivos-grupo">
                <div className="tarea-archivos-header">
                  <h4>{tarea.titulo}</h4>
                  <span className={`estado-badge ${tarea.estado}`}>{tarea.estado}</span>
                </div>
                <div className="tarea-archivos-lista">
                  {tarea.archivos.map(archivo => (
                    <div key={archivo.id} className="archivo-item-global">
                      <div className="archivo-preview-mini">
                        {esImagen(archivo.archivo_tipo) ? (
                          <img src={archivo.archivo_url} alt={archivo.archivo_nombre} />
                        ) : esVideo(archivo.archivo_tipo) ? (
                          <span>🎬</span>
                        ) : (
                          <span>📄</span>
                        )}
                      </div>
                      <div className="archivo-info-mini">
                        <span className="archivo-nombre">{archivo.archivo_nombre}</span>
                        <span className="archivo-meta">
                          {formatearTamano(archivo.archivo_tamano)} • {archivo.nombre_creador}
                        </span>
                      </div>
                      <div className="archivo-acciones-mini">
                        <a href={archivo.archivo_url} target="_blank" rel="noopener noreferrer" title="Ver">👁</a>
                        <a href={archivo.archivo_url} download={archivo.archivo_nombre} title="Descargar">⬇</a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// COMPONENTE PRINCIPAL: TareasView
// ============================================
const TareasView = () => {
  const { esAdministrador, esColaborador, usuario, logout } = useAuth()
  const { volverAlChat } = useView()

  const [tareas, setTareas] = useState([])
  const [colaboradores, setColaboradores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // UI State
  const [vistaActual, setVistaActual] = useState('pipeline')
  const [tareaSeleccionada, setTareaSeleccionada] = useState(null)
  const [mostrarNuevaTarea, setMostrarNuevaTarea] = useState(false)
  const [mostrarTodosArchivos, setMostrarTodosArchivos] = useState(false)
  const [notificacion, setNotificacion] = useState(null)

  // Filtros
  const [busqueda, setBusqueda] = useState('')
  const [filtroPrioridad, setFiltroPrioridad] = useState('')
  const [filtroColaborador, setFiltroColaborador] = useState('')

  // Drag & Drop
  const [draggedTarea, setDraggedTarea] = useState(null)
  const [dragOverEstado, setDragOverEstado] = useState(null)

  // Cargar datos
  const cargarTareas = async () => {
    try {
      setLoading(true)
      const resultado = await api.getTareas()
      if (resultado.success) setTareas(resultado.data)
      else setError(resultado.error)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const cargarColaboradores = async () => {
    if (!esAdministrador) return
    try {
      const resultado = await api.getColaboradores()
      if (resultado.success) setColaboradores(resultado.data)
    } catch (err) {
      console.error('Error cargando colaboradores:', err)
    }
  }

  useEffect(() => {
    cargarTareas()
    cargarColaboradores()
  }, [esAdministrador])

  // Filtrar tareas
  const tareasFiltradas = tareas.filter(t => {
    if (busqueda && !t.titulo.toLowerCase().includes(busqueda.toLowerCase()) &&
        !t.descripcion?.toLowerCase().includes(busqueda.toLowerCase())) return false
    if (filtroPrioridad && t.prioridad !== filtroPrioridad) return false
    if (filtroColaborador && t.asignado_a !== parseInt(filtroColaborador)) return false
    return true
  })

  // Agrupar por estado
  const tareasPorEstado = ESTADOS.reduce((acc, estado) => {
    acc[estado.id] = tareasFiltradas.filter(t => t.estado === estado.id)
    return acc
  }, {})

  // Handlers
  const handleCambiarEstado = async (id, nuevoEstado) => {
    try {
      const resultado = await api.cambiarEstadoTarea(id, nuevoEstado)
      if (resultado.success) {
        setTareas(tareas.map(t => t.id === id ? { ...t, estado: nuevoEstado, ...resultado.data } : t))
        if (tareaSeleccionada?.id === id) {
          setTareaSeleccionada({ ...tareaSeleccionada, estado: nuevoEstado })
        }
      }
    } catch (err) {
      console.error('Error cambiando estado:', err)
    }
  }

  const handleCrearTarea = async (datosTarea) => {
    try {
      const resultado = await api.crearTarea(datosTarea)
      if (resultado.success) {
        setTareas([resultado.data, ...tareas])
        // Mostrar notificación de WhatsApp enviado
        if (resultado.whatsappEnviado) {
          setNotificacion({
            tipo: 'exito',
            mensaje: `Tarea creada y WhatsApp enviado a ${resultado.whatsappDestinatario}`
          })
        } else {
          setNotificacion({
            tipo: 'info',
            mensaje: 'Tarea creada (WhatsApp no enviado - sin teléfono)'
          })
        }
        // Auto-ocultar notificación después de 4 segundos
        setTimeout(() => setNotificacion(null), 4000)
      }
    } catch (err) {
      console.error('Error creando tarea:', err)
      setNotificacion({ tipo: 'error', mensaje: 'Error al crear la tarea' })
      setTimeout(() => setNotificacion(null), 4000)
    }
  }

  // Drag & Drop handlers
  const handleDragStart = (e, tarea) => {
    setDraggedTarea(tarea)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragEnd = () => {
    setDraggedTarea(null)
    setDragOverEstado(null)
  }

  const handleDragOver = (estado) => {
    setDragOverEstado(estado)
  }

  const handleDrop = async (e, nuevoEstado) => {
    e.preventDefault()
    if (draggedTarea && draggedTarea.estado !== nuevoEstado) {
      await handleCambiarEstado(draggedTarea.id, nuevoEstado)
    }
    setDraggedTarea(null)
    setDragOverEstado(null)
  }

  const limpiarFiltros = () => {
    setBusqueda('')
    setFiltroPrioridad('')
    setFiltroColaborador('')
  }

  if (loading) {
    return (
      <div className="tareas-view loading">
        <div className="loading-spinner">Cargando tareas...</div>
      </div>
    )
  }

  return (
    <div className="tareas-view">
      {/* Notificación flotante */}
      {notificacion && (
        <div className={`notificacion-flotante ${notificacion.tipo}`}>
          <span>{notificacion.tipo === 'exito' ? '✓' : notificacion.tipo === 'error' ? '✕' : 'ℹ'}</span>
          {notificacion.mensaje}
          <button onClick={() => setNotificacion(null)}>×</button>
        </div>
      )}

      {/* Header */}
      <header className="tareas-header">
        <div className="header-left">
          {esAdministrador && (
            <button className="btn-volver" onClick={volverAlChat}>← Volver al Chat</button>
          )}
          <h1>📋 {esColaborador ? 'Mis Tareas' : 'Gestion de Tareas'}</h1>
        </div>
        <div className="header-right">
          <div className="vista-toggle">
            <button className={vistaActual === 'pipeline' ? 'activo' : ''} onClick={() => setVistaActual('pipeline')}>
              Pipeline
            </button>
            <button className={vistaActual === 'tabla' ? 'activo' : ''} onClick={() => setVistaActual('tabla')}>
              Tabla
            </button>
          </div>
          {esAdministrador && (
            <>
              <button className="btn-ver-archivos" onClick={() => setMostrarTodosArchivos(true)}>
                📁 Archivos
              </button>
              <button className="btn-nueva-tarea" onClick={() => setMostrarNuevaTarea(true)}>
                + Nueva Tarea
              </button>
            </>
          )}
          <button className="btn-cerrar-sesion" onClick={logout}>
            Cerrar Sesion
          </button>
        </div>
      </header>

      {/* Filtros */}
      <div className="filtros-bar">
        <div className="filtros-izq">
          <input
            type="text"
            placeholder="🔍 Buscar tareas..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="input-busqueda"
          />
          <select value={filtroPrioridad} onChange={(e) => setFiltroPrioridad(e.target.value)}>
            <option value="">Todas las prioridades</option>
            {Object.entries(PRIORIDADES).map(([key, val]) => (
              <option key={key} value={key}>{val.icon} {val.nombre}</option>
            ))}
          </select>
          {esAdministrador && (
            <select value={filtroColaborador} onChange={(e) => setFiltroColaborador(e.target.value)}>
              <option value="">Todos los colaboradores</option>
              {colaboradores.map(col => (
                <option key={col.id} value={col.id}>{col.nombre}</option>
              ))}
            </select>
          )}
        </div>
        {(busqueda || filtroPrioridad || filtroColaborador) && (
          <button className="btn-limpiar-filtros" onClick={limpiarFiltros}>
            ✕ Limpiar filtros
          </button>
        )}
      </div>

      {/* Contenido */}
      {error ? (
        <div className="error-mensaje">
          Error: {error}
          <button onClick={cargarTareas}>Reintentar</button>
        </div>
      ) : vistaActual === 'pipeline' ? (
        <div className="pipeline-container">
          {ESTADOS.map(estado => (
            <PipelineColumna
              key={estado.id}
              estado={estado.id}
              tareas={tareasPorEstado[estado.id] || []}
              onVerDetalle={setTareaSeleccionada}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
              dragOverEstado={dragOverEstado}
            />
          ))}
        </div>
      ) : (
        <div className="tabla-container">
          <table className="tareas-tabla">
            <thead>
              <tr>
                <th>Titulo</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Prioridad</th>
                <th>Asignado</th>
                <th>Fecha Limite</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tareasFiltradas.map(tarea => {
                const tipo = TIPOS_TAREA[tarea.tipo] || TIPOS_TAREA.otro
                const prioridad = PRIORIDADES[tarea.prioridad] || PRIORIDADES.media
                const estadoInfo = ESTADOS.find(e => e.id === tarea.estado)
                const dias = diasRestantes(tarea.fecha_limite)
                const vencida = dias !== null && dias < 0 && tarea.estado !== 'completada'

                return (
                  <tr key={tarea.id} className={vencida ? 'fila-vencida' : ''}>
                    <td>{tarea.titulo}</td>
                    <td>{tipo.icon} {tipo.nombre}</td>
                    <td><span style={{ color: estadoInfo.color }}>{estadoInfo.icon} {estadoInfo.nombre}</span></td>
                    <td><span style={{ color: prioridad.color }}>{prioridad.icon} {prioridad.nombre}</span></td>
                    <td>{tarea.nombre_asignado || '-'}</td>
                    <td className={vencida ? 'fecha-vencida' : ''}>
                      {tarea.fecha_limite ? new Date(tarea.fecha_limite).toLocaleDateString('es-CL') : '-'}
                    </td>
                    <td>
                      <button className="btn-ver" onClick={() => setTareaSeleccionada(tarea)}>Ver</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modales */}
      {tareaSeleccionada && (
        <TareaDetalleModal
          tarea={tareaSeleccionada}
          onClose={() => setTareaSeleccionada(null)}
          onCambiarEstado={handleCambiarEstado}
          esAdmin={esAdministrador}
          colaboradores={colaboradores}
          onActualizarTarea={cargarTareas}
        />
      )}

      {mostrarNuevaTarea && (
        <NuevaTareaModal
          onClose={() => setMostrarNuevaTarea(false)}
          onCrear={handleCrearTarea}
          colaboradores={colaboradores}
        />
      )}

      {mostrarTodosArchivos && (
        <TodosArchivosModal
          onClose={() => setMostrarTodosArchivos(false)}
        />
      )}

      {/* ChatIA Flotante - Solo para colaboradores */}
      {esColaborador && (
        <ChatIAFlotante usuario={usuario} />
      )}
    </div>
  )
}

export default TareasView
