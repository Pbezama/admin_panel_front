'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import {
  Cloud, Plus, RefreshCw, Trash2, ExternalLink, ChevronRight, ChevronDown,
  FileSpreadsheet, FileText, File, FolderOpen, Search, Eye, Link2, Unlink,
  Database, Settings, CheckCircle, AlertCircle, Clock, X, ArrowLeft,
  Sheet, Table, Layers, Edit3, Copy, MoreVertical
} from 'lucide-react'
import '@/styles/GoogleView.css'

export default function GoogleView() {
  const { marcaActiva } = useAuth()

  // Tabs principales
  const [tab, setTab] = useState('conexiones') // conexiones, archivos, fuentes
  const [mensaje, setMensaje] = useState(null)

  // Conexiones
  const [conexiones, setCon] = useState([])
  const [cargandoCon, setCargandoCon] = useState(true)
  const [modalConexion, setModalConexion] = useState(false)
  const [formCon, setFormCon] = useState({ nombre_cuenta: '' })

  // Archivos
  const [archivos, setArchivos] = useState([])
  const [cargandoArch, setCargandoArch] = useState(false)
  const [filtroTipo, setFiltroTipo] = useState('')

  // Explorador Drive
  const [explorador, setExplorador] = useState(false)
  const [conexionExplorar, setConexionExplorar] = useState(null)
  const [archivosDrive, setArchivosDrive] = useState([])
  const [busquedaDrive, setBusquedaDrive] = useState('')
  const [carpetaActual, setCarpetaActual] = useState(null)
  const [cargandoDrive, setCargandoDrive] = useState(false)

  // Detalle archivo + pestanas
  const [archivoDetalle, setArchivoDetalle] = useState(null)
  const [pestanasDisp, setPestanasDisp] = useState([])
  const [cargandoPest, setCargandoPest] = useState(false)

  // Preview
  const [preview, setPreview] = useState(null)
  const [cargandoPreview, setCargandoPreview] = useState(false)

  // Fuentes
  const [fuentes, setFuentes] = useState([])
  const [cargandoFuentes, setCargandoFuentes] = useState(false)
  const [modalFuente, setModalFuente] = useState(false)
  const [formFuente, setFormFuente] = useState({ nombre: '', descripcion: '', tipo: 'sheets', pestana_ids: [], archivo_ids: [] })

  useEffect(() => {
    cargarConexiones()
  }, [marcaActiva?.id_marca])

  useEffect(() => {
    // Detectar callback de OAuth
    const params = new URLSearchParams(window.location.search)
    if (params.get('google_connect') === 'success') {
      mostrarMsg('Cuenta de Google conectada exitosamente', 'success')
      cargarConexiones()
      window.history.replaceState({}, '', window.location.pathname)
    } else if (params.get('google_connect') === 'error') {
      mostrarMsg(`Error al conectar: ${params.get('reason') || 'desconocido'}`, 'error')
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  const mostrarMsg = (texto, tipo = 'success') => {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje(null), 5000)
  }

  // ─── CONEXIONES ─────────────────────────────────────────

  const cargarConexiones = async () => {
    setCargandoCon(true)
    try {
      const res = await api.getGoogleConexiones()
      if (res.success) setCon(res.conexiones || [])
    } catch (e) {
      console.error('Error cargando conexiones:', e)
    }
    setCargandoCon(false)
  }

  const crearConexion = async () => {
    if (!formCon.nombre_cuenta) {
      mostrarMsg('El nombre de la cuenta es requerido', 'error')
      return
    }
    try {
      const res = await api.crearGoogleConexion({
        nombre_cuenta: formCon.nombre_cuenta,
        callback_url: window.location.origin + '/chat/google'
      })
      if (res.success && res.oauth_url) {
        // Redirigir a Google OAuth
        window.location.href = res.oauth_url
      } else {
        mostrarMsg(res.error || 'Error al crear conexion', 'error')
      }
    } catch (e) {
      mostrarMsg(e.message, 'error')
    }
  }

  const reconectar = async (id) => {
    try {
      const res = await api.reconectarGoogle(id, { callback_url: window.location.origin + '/chat/google' })
      if (res.success && res.oauth_url) {
        window.location.href = res.oauth_url
      }
    } catch (e) {
      mostrarMsg(e.message, 'error')
    }
  }

  const eliminarConexion = async (id) => {
    if (!confirm('¿Eliminar esta conexion? Se desvincularan todos los archivos asociados.')) return
    try {
      await api.eliminarGoogleConexion(id)
      mostrarMsg('Conexion eliminada')
      cargarConexiones()
    } catch (e) {
      mostrarMsg(e.message, 'error')
    }
  }

  // ─── ARCHIVOS ───────────────────────────────────────────

  const cargarArchivos = async () => {
    setCargandoArch(true)
    try {
      const res = await api.getGoogleArchivos(filtroTipo)
      if (res.success) setArchivos(res.archivos || [])
    } catch (e) {
      console.error('Error cargando archivos:', e)
    }
    setCargandoArch(false)
  }

  useEffect(() => {
    if (tab === 'archivos') cargarArchivos()
  }, [tab, filtroTipo])

  // ─── EXPLORADOR DRIVE ──────────────────────────────────

  const abrirExplorador = (conexion) => {
    setConexionExplorar(conexion)
    setExplorador(true)
    setCarpetaActual(null)
    setBusquedaDrive('')
    explorarDrive(conexion.id)
  }

  const explorarDrive = async (conId, folderId, query) => {
    setCargandoDrive(true)
    try {
      const res = await api.explorarGoogleDrive({
        conexion_id: conId || conexionExplorar?.id,
        folder_id: folderId,
        query
      })
      if (res.success) setArchivosDrive(res.archivos || [])
    } catch (e) {
      mostrarMsg(e.message, 'error')
    }
    setCargandoDrive(false)
  }

  const agregarArchivo = async (driveFile) => {
    try {
      const alias = prompt('Nombre/alias para este archivo:', driveFile.nombre)
      if (alias === null) return
      const desc = prompt('Descripcion (para que la IA sepa cuando usarlo):', '')
      const res = await api.agregarGoogleArchivo({
        conexion_id: conexionExplorar.id,
        google_file_id: driveFile.google_file_id,
        alias: alias || driveFile.nombre,
        descripcion: desc || ''
      })
      if (res.success) {
        mostrarMsg(`"${alias || driveFile.nombre}" vinculado`)
        if (res.pestanas_disponibles?.length > 0) {
          mostrarMsg(`${res.pestanas_disponibles.length} pestanas detectadas. Seleccionalas en el detalle del archivo.`)
        }
        cargarArchivos()
      } else {
        mostrarMsg(res.error || 'Error', 'error')
      }
    } catch (e) {
      mostrarMsg(e.message, 'error')
    }
  }

  const eliminarArchivo = async (id) => {
    if (!confirm('¿Desvincular este archivo?')) return
    try {
      await api.eliminarGoogleArchivo(id)
      mostrarMsg('Archivo desvinculado')
      cargarArchivos()
    } catch (e) {
      mostrarMsg(e.message, 'error')
    }
  }

  // ─── PESTANAS ──────────────────────────────────────────

  const verDetalle = async (archivo) => {
    setArchivoDetalle(archivo)
    if (archivo.tipo_archivo === 'sheet') {
      setCargandoPest(true)
      try {
        const res = await api.getGooglePestanas(archivo.id)
        if (res.success) setPestanasDisp(res.pestanas || [])
      } catch (e) {
        console.error(e)
      }
      setCargandoPest(false)
    }
  }

  const seleccionarPestanas = async (pestanas) => {
    try {
      const res = await api.seleccionarGooglePestanas(archivoDetalle.id, pestanas)
      if (res.success) {
        mostrarMsg(`${pestanas.length} pestanas vinculadas`)
        verDetalle(archivoDetalle)
        cargarArchivos()
      }
    } catch (e) {
      mostrarMsg(e.message, 'error')
    }
  }

  // ─── PREVIEW ───────────────────────────────────────────

  const verPreview = async (pestanaId) => {
    setCargandoPreview(true)
    try {
      const res = await api.previewGoogleSheet({ pestana_id: pestanaId, max_filas: 10 })
      if (res.success) setPreview(res)
    } catch (e) {
      mostrarMsg(e.message, 'error')
    }
    setCargandoPreview(false)
  }

  // ─── FUENTES ───────────────────────────────────────────

  const cargarFuentes = async () => {
    setCargandoFuentes(true)
    try {
      const res = await api.getGoogleFuentes()
      if (res.success) setFuentes(res.fuentes || [])
    } catch (e) {
      console.error(e)
    }
    setCargandoFuentes(false)
  }

  useEffect(() => {
    if (tab === 'fuentes') cargarFuentes()
  }, [tab])

  const crearFuente = async () => {
    if (!formFuente.nombre) {
      mostrarMsg('El nombre es requerido', 'error')
      return
    }
    try {
      const res = await api.crearGoogleFuente(formFuente)
      if (res.success) {
        mostrarMsg('Fuente creada')
        setModalFuente(false)
        setFormFuente({ nombre: '', descripcion: '', tipo: 'sheets', pestana_ids: [], archivo_ids: [] })
        cargarFuentes()
      }
    } catch (e) {
      mostrarMsg(e.message, 'error')
    }
  }

  const eliminarFuente = async (id) => {
    if (!confirm('¿Eliminar esta fuente de datos?')) return
    try {
      await api.eliminarGoogleFuente(id)
      mostrarMsg('Fuente eliminada')
      cargarFuentes()
    } catch (e) {
      mostrarMsg(e.message, 'error')
    }
  }

  // ─── ICONOS HELPER ─────────────────────────────────────

  const iconoTipo = (tipo) => {
    switch (tipo) {
      case 'sheet': return <FileSpreadsheet size={18} className="icon-sheet" />
      case 'doc': return <FileText size={18} className="icon-doc" />
      case 'pdf': return <File size={18} className="icon-pdf" />
      case 'folder': return <FolderOpen size={18} className="icon-folder" />
      default: return <File size={18} />
    }
  }

  const estadoBadge = (estado) => {
    switch (estado) {
      case 'activa': return <span className="badge badge-activa"><CheckCircle size={12} /> Activa</span>
      case 'expirada': return <span className="badge badge-expirada"><Clock size={12} /> Expirada</span>
      case 'revocada': return <span className="badge badge-error"><AlertCircle size={12} /> Revocada</span>
      case 'pendiente': return <span className="badge badge-pendiente"><Clock size={12} /> Pendiente</span>
      default: return <span className="badge">{estado}</span>
    }
  }

  // ─── RENDER ─────────────────────────────────────────────

  return (
    <div className="google-view">
      {/* Header */}
      <div className="google-header">
        <div className="google-header-left">
          <Cloud size={24} />
          <div>
            <h1>Google Integration</h1>
            <p>Calendar, Drive, Sheets y Docs conectados a tu marca</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="google-tabs">
        <button className={`google-tab ${tab === 'conexiones' ? 'active' : ''}`} onClick={() => setTab('conexiones')}>
          <Link2 size={16} /> Conexiones
        </button>
        <button className={`google-tab ${tab === 'archivos' ? 'active' : ''}`} onClick={() => setTab('archivos')}>
          <FileSpreadsheet size={16} /> Archivos
        </button>
        <button className={`google-tab ${tab === 'fuentes' ? 'active' : ''}`} onClick={() => setTab('fuentes')}>
          <Database size={16} /> Fuentes de Datos
        </button>
      </div>

      {/* Toast */}
      {mensaje && (
        <div className={`google-toast ${mensaje.tipo}`}>
          {mensaje.tipo === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {mensaje.texto}
          <button onClick={() => setMensaje(null)}><X size={14} /></button>
        </div>
      )}

      {/* ─── TAB CONEXIONES ─── */}
      {tab === 'conexiones' && (
        <div className="google-section">
          <div className="google-section-header">
            <h2>Cuentas de Google conectadas</h2>
            <button className="btn-primary" onClick={() => setModalConexion(true)}>
              <Plus size={16} /> Nueva conexion
            </button>
          </div>

          {cargandoCon ? (
            <div className="google-loading">Cargando conexiones...</div>
          ) : conexiones.length === 0 ? (
            <div className="google-empty">
              <Cloud size={48} />
              <h3>Sin conexiones</h3>
              <p>Conecta una cuenta de Google para acceder a Calendar, Drive, Sheets y Docs</p>
              <button className="btn-primary" onClick={() => setModalConexion(true)}>
                <Plus size={16} /> Conectar cuenta
              </button>
            </div>
          ) : (
            <div className="google-cards">
              {conexiones.map(con => (
                <div key={con.id} className="google-card">
                  <div className="google-card-header">
                    <div className="google-card-icon">
                      <Cloud size={20} />
                    </div>
                    <div className="google-card-info">
                      <h3>{con.nombre_cuenta}</h3>
                      <span className="google-card-email">{con.email_google || 'Sin conectar'}</span>
                    </div>
                    {estadoBadge(con.estado)}
                  </div>
                  <div className="google-card-actions">
                    {con.estado === 'activa' && (
                      <button className="btn-sm btn-outline" onClick={() => abrirExplorador(con)}>
                        <FolderOpen size={14} /> Explorar Drive
                      </button>
                    )}
                    {(con.estado === 'expirada' || con.estado === 'revocada') && (
                      <button className="btn-sm btn-primary" onClick={() => reconectar(con.id)}>
                        <RefreshCw size={14} /> Reconectar
                      </button>
                    )}
                    <button className="btn-sm btn-danger" onClick={() => eliminarConexion(con.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB ARCHIVOS ─── */}
      {tab === 'archivos' && (
        <div className="google-section">
          <div className="google-section-header">
            <h2>Archivos vinculados</h2>
            <div className="google-filtros">
              <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
                <option value="">Todos</option>
                <option value="sheet">Sheets</option>
                <option value="doc">Docs</option>
                <option value="pdf">PDFs</option>
              </select>
              <button className="btn-outline" onClick={cargarArchivos}>
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          {cargandoArch ? (
            <div className="google-loading">Cargando archivos...</div>
          ) : archivos.length === 0 ? (
            <div className="google-empty">
              <FileSpreadsheet size={48} />
              <h3>Sin archivos vinculados</h3>
              <p>Explora tu Drive desde una conexion para vincular archivos</p>
            </div>
          ) : (
            <div className="google-list">
              {archivos.map(arch => (
                <div key={arch.id} className="google-list-item" onClick={() => verDetalle(arch)}>
                  <div className="google-list-icon">{iconoTipo(arch.tipo_archivo)}</div>
                  <div className="google-list-info">
                    <h4>{arch.alias || arch.nombre_archivo}</h4>
                    <span className="google-list-sub">
                      {arch.descripcion || arch.nombre_archivo}
                      {arch.google_conexiones && <> · {arch.google_conexiones.email_google}</>}
                    </span>
                  </div>
                  <div className="google-list-meta">
                    <span className={`badge badge-tipo-${arch.tipo_archivo}`}>{arch.tipo_archivo}</span>
                    <button className="btn-icon" onClick={(e) => { e.stopPropagation(); eliminarArchivo(arch.id) }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB FUENTES DE DATOS ─── */}
      {tab === 'fuentes' && (
        <div className="google-section">
          <div className="google-section-header">
            <h2>Fuentes de datos virtuales</h2>
            <button className="btn-primary" onClick={() => setModalFuente(true)}>
              <Plus size={16} /> Nueva fuente
            </button>
          </div>

          {cargandoFuentes ? (
            <div className="google-loading">Cargando fuentes...</div>
          ) : fuentes.length === 0 ? (
            <div className="google-empty">
              <Database size={48} />
              <h3>Sin fuentes de datos</h3>
              <p>Las fuentes combinan pestanas de distintos archivos en una sola fuente logica para los agentes</p>
            </div>
          ) : (
            <div className="google-cards">
              {fuentes.map(f => (
                <div key={f.id} className="google-card">
                  <div className="google-card-header">
                    <div className="google-card-icon"><Layers size={20} /></div>
                    <div className="google-card-info">
                      <h3>{f.nombre}</h3>
                      <span className="google-card-email">{f.descripcion || 'Sin descripcion'}</span>
                    </div>
                    <span className={`badge badge-tipo-${f.tipo}`}>{f.tipo}</span>
                  </div>
                  <div className="google-card-details">
                    {f.google_fuente_pestanas?.length > 0 && (
                      <span><Table size={12} /> {f.google_fuente_pestanas.length} pestanas</span>
                    )}
                    {f.google_fuente_documentos?.length > 0 && (
                      <span><FileText size={12} /> {f.google_fuente_documentos.length} documentos</span>
                    )}
                  </div>
                  <div className="google-card-actions">
                    <button className="btn-sm btn-danger" onClick={() => eliminarFuente(f.id)}>
                      <Trash2 size={14} /> Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── MODAL: NUEVA CONEXION ─── */}
      {modalConexion && (
        <div className="google-modal-overlay" onClick={() => setModalConexion(false)}>
          <div className="google-modal" onClick={e => e.stopPropagation()}>
            <div className="google-modal-header">
              <h2>Nueva conexion de Google</h2>
              <button onClick={() => setModalConexion(false)}><X size={20} /></button>
            </div>
            <div className="google-modal-body">
              <p className="google-modal-hint">
                Conecta tu cuenta de Google para acceder a Calendar, Drive, Sheets y Docs.
                Se abrira una ventana de Google donde autorizaras los permisos necesarios.
              </p>
              <label>
                Nombre de la cuenta
                <input
                  type="text"
                  value={formCon.nombre_cuenta}
                  onChange={e => setFormCon({ ...formCon, nombre_cuenta: e.target.value })}
                  placeholder="Ej: Cuenta principal empresa"
                  autoFocus
                />
              </label>
            </div>
            <div className="google-modal-footer">
              <button className="btn-outline" onClick={() => setModalConexion(false)}>Cancelar</button>
              <button className="btn-primary" onClick={crearConexion}>
                <Cloud size={16} /> Conectar con Google
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: EXPLORADOR DRIVE ─── */}
      {explorador && (
        <div className="google-modal-overlay" onClick={() => setExplorador(false)}>
          <div className="google-modal google-modal-lg" onClick={e => e.stopPropagation()}>
            <div className="google-modal-header">
              <h2><FolderOpen size={20} /> Explorar Drive - {conexionExplorar?.nombre_cuenta}</h2>
              <button onClick={() => setExplorador(false)}><X size={20} /></button>
            </div>
            <div className="google-modal-body">
              <div className="drive-search">
                <Search size={16} />
                <input
                  type="text"
                  value={busquedaDrive}
                  onChange={e => setBusquedaDrive(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && explorarDrive(conexionExplorar.id, carpetaActual, busquedaDrive)}
                  placeholder="Buscar archivos..."
                />
                <button onClick={() => explorarDrive(conexionExplorar.id, carpetaActual, busquedaDrive)}>Buscar</button>
              </div>
              {carpetaActual && (
                <button className="drive-back" onClick={() => { setCarpetaActual(null); explorarDrive(conexionExplorar.id) }}>
                  <ArrowLeft size={14} /> Volver a raiz
                </button>
              )}
              {cargandoDrive ? (
                <div className="google-loading">Explorando Drive...</div>
              ) : archivosDrive.length === 0 ? (
                <div className="google-empty-sm">No se encontraron archivos</div>
              ) : (
                <div className="drive-files">
                  {archivosDrive.map(f => (
                    <div
                      key={f.google_file_id}
                      className="drive-file"
                      onClick={() => f.tipo === 'folder'
                        ? (setCarpetaActual(f.google_file_id), explorarDrive(conexionExplorar.id, f.google_file_id))
                        : agregarArchivo(f)
                      }
                    >
                      {iconoTipo(f.tipo)}
                      <div className="drive-file-info">
                        <span className="drive-file-name">{f.nombre}</span>
                        <span className="drive-file-meta">{f.tipo} · {f.modificado ? new Date(f.modificado).toLocaleDateString() : ''}</span>
                      </div>
                      {f.tipo !== 'folder' && (
                        <button className="btn-sm btn-primary">
                          <Plus size={14} /> Vincular
                        </button>
                      )}
                      {f.tipo === 'folder' && <ChevronRight size={16} />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: DETALLE ARCHIVO + PESTANAS ─── */}
      {archivoDetalle && (
        <div className="google-modal-overlay" onClick={() => { setArchivoDetalle(null); setPreview(null) }}>
          <div className="google-modal google-modal-lg" onClick={e => e.stopPropagation()}>
            <div className="google-modal-header">
              {iconoTipo(archivoDetalle.tipo_archivo)}
              <h2>{archivoDetalle.alias || archivoDetalle.nombre_archivo}</h2>
              <button onClick={() => { setArchivoDetalle(null); setPreview(null) }}><X size={20} /></button>
            </div>
            <div className="google-modal-body">
              <div className="archivo-detalle-meta">
                <span><strong>Archivo:</strong> {archivoDetalle.nombre_archivo}</span>
                <span><strong>Tipo:</strong> {archivoDetalle.tipo_archivo}</span>
                {archivoDetalle.descripcion && <span><strong>Descripcion:</strong> {archivoDetalle.descripcion}</span>}
                {archivoDetalle.url_archivo && (
                  <a href={archivoDetalle.url_archivo} target="_blank" rel="noopener noreferrer" className="btn-sm btn-outline">
                    <ExternalLink size={14} /> Abrir en Google
                  </a>
                )}
              </div>

              {archivoDetalle.tipo_archivo === 'sheet' && (
                <>
                  <h3 className="pestanas-title">Pestanas</h3>
                  {cargandoPest ? (
                    <div className="google-loading">Cargando pestanas...</div>
                  ) : (
                    <div className="pestanas-list">
                      {pestanasDisp.map(p => (
                        <div key={p.sheet_id} className={`pestana-item ${p.seleccionada ? 'selected' : ''}`}>
                          <div className="pestana-info">
                            <Table size={14} />
                            <span>{p.nombre}</span>
                            <span className="pestana-meta">{p.filas} filas · {p.columnas} cols</span>
                          </div>
                          <div className="pestana-actions">
                            {p.seleccionada ? (
                              <button className="btn-sm btn-outline" onClick={() => verPreview(p.sheet_id)}>
                                <Eye size={14} /> Preview
                              </button>
                            ) : (
                              <button className="btn-sm btn-primary" onClick={() => seleccionarPestanas([{
                                sheet_id: p.sheet_id, nombre: p.nombre
                              }])}>
                                <Plus size={14} /> Vincular
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Preview tabla */}
              {cargandoPreview && <div className="google-loading">Cargando preview...</div>}
              {preview && !cargandoPreview && (
                <div className="preview-section">
                  <h3>Preview: {preview.nombre_pestana} ({preview.total_preview} filas)</h3>
                  <div className="preview-table-wrapper">
                    <table className="preview-table">
                      <thead>
                        <tr>
                          {preview.headers.map((h, i) => <th key={i}>{h}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {preview.filas.map((row, i) => (
                          <tr key={i}>
                            {preview.headers.map((_, j) => <td key={j}>{row[j] || ''}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: NUEVA FUENTE ─── */}
      {modalFuente && (
        <div className="google-modal-overlay" onClick={() => setModalFuente(false)}>
          <div className="google-modal" onClick={e => e.stopPropagation()}>
            <div className="google-modal-header">
              <h2>Nueva fuente de datos</h2>
              <button onClick={() => setModalFuente(false)}><X size={20} /></button>
            </div>
            <div className="google-modal-body">
              <p className="google-modal-hint">
                Las fuentes agrupan pestanas y documentos de distintos archivos. Los agentes usan la descripcion para saber cuando consultar cada fuente.
              </p>
              <label>
                Nombre
                <input
                  type="text"
                  value={formFuente.nombre}
                  onChange={e => setFormFuente({ ...formFuente, nombre: e.target.value })}
                  placeholder="Ej: Base de clientes completa"
                />
              </label>
              <label>
                Descripcion (para la IA)
                <textarea
                  value={formFuente.descripcion}
                  onChange={e => setFormFuente({ ...formFuente, descripcion: e.target.value })}
                  placeholder="Ej: Contiene todos los clientes activos con nombre, email, telefono y fecha de registro"
                  rows={3}
                />
              </label>
              <label>
                Tipo
                <select value={formFuente.tipo} onChange={e => setFormFuente({ ...formFuente, tipo: e.target.value })}>
                  <option value="sheets">Sheets (hojas de calculo)</option>
                  <option value="docs">Documentos (Docs + PDFs)</option>
                  <option value="mixta">Mixta (Sheets + Docs)</option>
                </select>
              </label>
            </div>
            <div className="google-modal-footer">
              <button className="btn-outline" onClick={() => setModalFuente(false)}>Cancelar</button>
              <button className="btn-primary" onClick={crearFuente}>
                <Database size={16} /> Crear fuente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
