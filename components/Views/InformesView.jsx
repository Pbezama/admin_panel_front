'use client'

/**
 * InformesView - Centro de Informes Completo
 *
 * Dos tabs principales:
 * 1. Informes Instagram - Vista existente de informes del sistema externo
 * 2. Generador de Reportes - Nuevo: genera reportes de todas las fuentes de datos
 */

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import {
  BarChart3,
  MessageSquare,
  CheckSquare,
  Users,
  Database,
  MessageCircle,
  GitBranch,
  Headphones,
  Brain,
  FileText,
  Download,
  FileSpreadsheet,
  FileDown,
  Globe,
  Search,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  X,
  Eye,
  Calendar,
  Filter,
  Lock
} from 'lucide-react'
import '@/styles/InformesView.css'

// ============================================
// CONFIGURACION DE TIPOS DE REPORTE
// ============================================

const REPORT_TYPES = [
  { id: 'comentarios', label: 'Comentarios RRSS', icon: MessageSquare, desc: 'Comentarios de redes sociales', adminOnly: false },
  { id: 'tareas', label: 'Tareas', icon: CheckSquare, desc: 'Gestion de tareas', adminOnly: false },
  { id: 'usuarios', label: 'Usuarios', icon: Users, desc: 'Usuarios de la marca', adminOnly: true },
  { id: 'base_datos', label: 'Base de Datos', icon: Database, desc: 'Reglas y datos de la marca', adminOnly: true },
  { id: 'mensajes_chat', label: 'Mensajes DM', icon: MessageCircle, desc: 'Conversaciones directas de RRSS', adminOnly: false },
  { id: 'flujos', label: 'Flujos', icon: GitBranch, desc: 'Flujos conversacionales', adminOnly: false },
  { id: 'conversaciones_transferidas', label: 'Conv. Transferidas', icon: Headphones, desc: 'Conversaciones transferidas a agentes', adminOnly: false },
  { id: 'conocimiento', label: 'Conocimiento de Marca', icon: Brain, desc: 'Base de conocimiento de la marca', adminOnly: false },
]

// Definicion de filtros por tipo
const FILTROS_POR_TIPO = {
  comentarios: [
    { key: 'fechaDesde', label: 'Desde', type: 'date' },
    { key: 'fechaHasta', label: 'Hasta', type: 'date' },
    { key: 'clasificacion', label: 'Clasificacion', type: 'text', placeholder: 'Ej: positivo, negativo...' },
    { key: 'esInapropiado', label: 'Inapropiado', type: 'select', options: [{ value: '', label: 'Todos' }, { value: 'true', label: 'Si' }, { value: 'false', label: 'No' }] },
    { key: 'textoLibre', label: 'Buscar texto', type: 'text', placeholder: 'Buscar en comentarios...' }
  ],
  tareas: [
    { key: 'fechaDesde', label: 'Desde', type: 'date' },
    { key: 'fechaHasta', label: 'Hasta', type: 'date' },
    { key: 'estado', label: 'Estado', type: 'select', options: [{ value: '', label: 'Todos' }, { value: 'pendiente', label: 'Pendiente' }, { value: 'en_progreso', label: 'En Progreso' }, { value: 'completada', label: 'Completada' }] },
    { key: 'prioridad', label: 'Prioridad', type: 'select', options: [{ value: '', label: 'Todas' }, { value: 'baja', label: 'Baja' }, { value: 'media', label: 'Media' }, { value: 'alta', label: 'Alta' }, { value: 'urgente', label: 'Urgente' }] }
  ],
  usuarios: [
    { key: 'tipoUsuario', label: 'Tipo', type: 'select', options: [{ value: '', label: 'Todos' }, { value: 'adm', label: 'Administrador' }, { value: 'colaborador', label: 'Colaborador' }] },
    { key: 'activo', label: 'Activo', type: 'select', options: [{ value: '', label: 'Todos' }, { value: 'true', label: 'Si' }, { value: 'false', label: 'No' }] },
    { key: 'fechaDesde', label: 'Registro desde', type: 'date' },
    { key: 'fechaHasta', label: 'Registro hasta', type: 'date' }
  ],
  base_datos: [
    { key: 'categoria', label: 'Categoria', type: 'text', placeholder: 'Buscar categoria...' },
    { key: 'estadoActivo', label: 'Estado', type: 'select', options: [{ value: '', label: 'Todos' }, { value: 'true', label: 'Activo' }, { value: 'false', label: 'Inactivo' }] },
    { key: 'prioridad', label: 'Prioridad', type: 'text', placeholder: 'Ej: 1, 2, 3...' }
  ],
  mensajes_chat: [
    { key: 'fechaDesde', label: 'Desde', type: 'date' },
    { key: 'fechaHasta', label: 'Hasta', type: 'date' },
    { key: 'platform', label: 'Plataforma', type: 'select', options: [{ value: '', label: 'Todas' }, { value: 'instagram', label: 'Instagram' }, { value: 'whatsapp', label: 'WhatsApp' }, { value: 'webchat', label: 'WebChat' }] },
    { key: 'role', label: 'Rol', type: 'select', options: [{ value: '', label: 'Todos' }, { value: 'user', label: 'Usuario' }, { value: 'assistant', label: 'Asistente/Bot' }] },
    { key: 'textoLibre', label: 'Buscar texto', type: 'text', placeholder: 'Buscar en mensajes...' }
  ],
  flujos: [
    { key: 'fechaDesde', label: 'Desde', type: 'date' },
    { key: 'fechaHasta', label: 'Hasta', type: 'date' },
    { key: 'estado', label: 'Estado', type: 'select', options: [{ value: '', label: 'Todos' }, { value: 'activo', label: 'Activo' }, { value: 'inactivo', label: 'Inactivo' }] }
  ],
  conversaciones_transferidas: [
    { key: 'fechaDesde', label: 'Desde', type: 'date' },
    { key: 'fechaHasta', label: 'Hasta', type: 'date' },
    { key: 'estado', label: 'Estado', type: 'select', options: [{ value: '', label: 'Todos' }, { value: 'transferida', label: 'Transferida' }, { value: 'cerrada_agente', label: 'Cerrada por Agente' }, { value: 'cerrada', label: 'Cerrada' }] }
  ],
  conocimiento: [
    { key: 'estado', label: 'Estado', type: 'select', options: [{ value: '', label: 'Todos' }, { value: 'pendiente', label: 'Pendiente' }, { value: 'aprobado', label: 'Aprobado' }, { value: 'editado', label: 'Editado' }, { value: 'rechazado', label: 'Rechazado' }] },
    { key: 'categoria', label: 'Categoria', type: 'text', placeholder: 'Buscar categoria...' }
  ]
}

// ============================================
// HELPERS
// ============================================

const formatearNumero = (num) => {
  if (num === null || num === undefined) return '0'
  return Number(num).toLocaleString('es-CL')
}

const formatearFecha = (fecha) => {
  if (!fecha) return ''
  return new Date(fecha).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })
}

const formatearPeriodo = (desde, hasta) => `${formatearFecha(desde)} - ${formatearFecha(hasta)}`

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const InformesView = () => {
  const { usuario, marcaActiva, esSuperAdmin, esColaborador } = useAuth()
  const esAdmin = !esColaborador

  // Tab principal
  const [tabActiva, setTabActiva] = useState('generador')

  // Estado del generador
  const [tipoSeleccionado, setTipoSeleccionado] = useState(null)
  const [filtros, setFiltros] = useState({})
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false)
  const [datos, setDatos] = useState([])
  const [columnas, setColumnas] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [consultaRealizada, setConsultaRealizada] = useState(false)

  // Estado exportacion
  const [exportando, setExportando] = useState(null)

  // Estado informes Instagram
  const [informesIG, setInformesIG] = useState([])
  const [loadingIG, setLoadingIG] = useState(true)
  const [errorIG, setErrorIG] = useState(null)

  // Estado generacion informe RRSS
  const [generandoRRSS, setGenerandoRRSS] = useState(false)
  const [errorRRSS, setErrorRRSS] = useState(null)
  const [periodoDesde, setPeriodoDesde] = useState('')
  const [periodoHasta, setPeriodoHasta] = useState('')

  // Cargar informes Instagram al montar + set default dates
  useEffect(() => {
    cargarInformesIG()
    // Default: last 7 days
    const hoy = new Date()
    const hace7 = new Date(hoy)
    hace7.setDate(hace7.getDate() - 7)
    setPeriodoHasta(hoy.toISOString().split('T')[0])
    setPeriodoDesde(hace7.toISOString().split('T')[0])
  }, [])

  const cargarInformesIG = async () => {
    try {
      setLoadingIG(true)
      setErrorIG(null)
      const marcaId = esSuperAdmin ? marcaActiva?.id_marca : null
      const resultado = await api.getInformes(marcaId)
      if (resultado.success) {
        setInformesIG(resultado.data)
      } else {
        setErrorIG(resultado.error)
      }
    } catch (err) {
      setErrorIG(err.message)
    } finally {
      setLoadingIG(false)
    }
  }

  const abrirInformeIG = (id) => {
    const marcaId = esSuperAdmin ? marcaActiva?.id_marca : null
    const url = api.getInformeHtmlUrl(id, marcaId)
    window.open(url, '_blank')
  }

  const generarInformeRRSS = async () => {
    if (!periodoDesde || !periodoHasta) {
      setErrorRRSS('Selecciona las fechas del periodo')
      return
    }

    try {
      setGenerandoRRSS(true)
      setErrorRRSS(null)

      const resultado = await api.generarInformeRRSS(periodoDesde, periodoHasta, true)

      if (resultado.success && resultado.html) {
        // Open the generated HTML in a new tab
        const blob = new Blob([resultado.html], { type: 'text/html; charset=utf-8' })
        const url = URL.createObjectURL(blob)
        window.open(url, '_blank')
        setTimeout(() => URL.revokeObjectURL(url), 60000)

        // Mostrar estado de guardado
        if (resultado.guardado) {
          await cargarInformesIG()
          if (!resultado.htmlGuardado && resultado.guardarError) {
            setErrorRRSS(`Informe guardado pero sin HTML: ${resultado.guardarError}`)
          }
        } else {
          const errorMsg = resultado.guardarError || 'Error desconocido al guardar'
          setErrorRRSS(`Informe generado pero NO guardado: ${errorMsg}`)
          console.error('[Informe RRSS] No guardado:', errorMsg)
        }
      } else {
        setErrorRRSS(resultado.error || 'Error generando informe')
      }
    } catch (err) {
      setErrorRRSS(err.message || 'Error de conexion')
    } finally {
      setGenerandoRRSS(false)
    }
  }

  // ============================================
  // GENERADOR DE REPORTES
  // ============================================

  const seleccionarTipo = (tipo) => {
    setTipoSeleccionado(tipo)
    setFiltros({})
    setDatos([])
    setColumnas([])
    setTotal(0)
    setConsultaRealizada(false)
    setError(null)
    setFiltrosAbiertos(true)
  }

  const actualizarFiltro = (key, value) => {
    setFiltros(prev => ({ ...prev, [key]: value }))
  }

  const limpiarFiltros = () => {
    setFiltros({})
  }

  const consultarDatos = async () => {
    if (!tipoSeleccionado) return

    try {
      setLoading(true)
      setError(null)

      // Remove empty filter values
      const filtrosLimpios = {}
      Object.entries(filtros).forEach(([k, v]) => {
        if (v !== '' && v !== null && v !== undefined) {
          filtrosLimpios[k] = v
        }
      })

      const resultado = await api.queryReporte(tipoSeleccionado, filtrosLimpios)

      if (resultado.success) {
        setDatos(resultado.data)
        setColumnas(resultado.columnas)
        setTotal(resultado.total)
        setConsultaRealizada(true)
      } else {
        setError(resultado.error)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const exportar = async (formato) => {
    if (!tipoSeleccionado) return

    try {
      setExportando(formato)

      const filtrosLimpios = {}
      Object.entries(filtros).forEach(([k, v]) => {
        if (v !== '' && v !== null && v !== undefined) filtrosLimpios[k] = v
      })

      await api.exportReporte(tipoSeleccionado, filtrosLimpios, formato)
    } catch (err) {
      setError(`Error exportando: ${err.message}`)
    } finally {
      setExportando(null)
    }
  }

  const verHTMLInteractivo = async () => {
    if (!tipoSeleccionado) return

    try {
      setExportando('html')

      const filtrosLimpios = {}
      Object.entries(filtros).forEach(([k, v]) => {
        if (v !== '' && v !== null && v !== undefined) filtrosLimpios[k] = v
      })

      const resultado = await api.generarReporteHTML(tipoSeleccionado, filtrosLimpios, true)

      if (resultado.success && resultado.html) {
        // Open HTML in new tab
        const blob = new Blob([resultado.html], { type: 'text/html; charset=utf-8' })
        const url = URL.createObjectURL(blob)
        window.open(url, '_blank')
        setTimeout(() => URL.revokeObjectURL(url), 60000)
      } else {
        setError(resultado.error || 'Error generando reporte HTML')
      }
    } catch (err) {
      setError(`Error: ${err.message}`)
    } finally {
      setExportando(null)
    }
  }

  // Filter report types by role
  const tiposDisponibles = REPORT_TYPES.filter(t => !t.adminOnly || esAdmin)

  const tipoActual = REPORT_TYPES.find(t => t.id === tipoSeleccionado)
  const filtrosActuales = FILTROS_POR_TIPO[tipoSeleccionado] || []

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="informes-view">
      {/* Tabs principales */}
      <div className="informes-tabs">
        <button
          className={`informes-tab ${tabActiva === 'generador' ? 'active' : ''}`}
          onClick={() => setTabActiva('generador')}
        >
          <BarChart3 size={16} />
          <span>Generador de Reportes</span>
        </button>
        <button
          className={`informes-tab ${tabActiva === 'instagram' ? 'active' : ''}`}
          onClick={() => setTabActiva('instagram')}
        >
          <FileText size={16} />
          <span>Informes Instagram</span>
          {informesIG.length > 0 && (
            <span className="informes-tab-badge">{informesIG.length}</span>
          )}
        </button>
      </div>

      {/* ============================================ */}
      {/* TAB: GENERADOR DE REPORTES */}
      {/* ============================================ */}
      {tabActiva === 'generador' && (
        <div className="generador-container">
          {/* Selector de tipo */}
          <div className="generador-tipos">
            <h3 className="generador-section-title">Selecciona un tipo de reporte</h3>
            <div className="tipos-grid">
              {tiposDisponibles.map(tipo => {
                const Icon = tipo.icon
                const selected = tipoSeleccionado === tipo.id
                return (
                  <button
                    key={tipo.id}
                    className={`tipo-card ${selected ? 'selected' : ''}`}
                    onClick={() => seleccionarTipo(tipo.id)}
                  >
                    <div className="tipo-card-icon">
                      <Icon size={22} />
                    </div>
                    <div className="tipo-card-info">
                      <span className="tipo-card-label">{tipo.label}</span>
                      <span className="tipo-card-desc">{tipo.desc}</span>
                    </div>
                    {tipo.adminOnly && (
                      <span className="tipo-card-admin" title="Solo administradores">
                        <Lock size={12} />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Panel de filtros */}
          {tipoSeleccionado && filtrosActuales.length > 0 && (
            <div className="generador-filtros">
              <button
                className="filtros-toggle"
                onClick={() => setFiltrosAbiertos(!filtrosAbiertos)}
              >
                <Filter size={16} />
                <span>Filtros</span>
                {filtrosAbiertos ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>

              {filtrosAbiertos && (
                <div className="filtros-panel">
                  <div className="filtros-grid">
                    {filtrosActuales.map(filtro => (
                      <div key={filtro.key} className="filtro-campo">
                        <label>{filtro.label}</label>
                        {filtro.type === 'select' ? (
                          <select
                            value={filtros[filtro.key] || ''}
                            onChange={e => actualizarFiltro(filtro.key, e.target.value)}
                          >
                            {filtro.options.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        ) : filtro.type === 'date' ? (
                          <input
                            type="date"
                            value={filtros[filtro.key] || ''}
                            onChange={e => actualizarFiltro(filtro.key, e.target.value)}
                          />
                        ) : (
                          <input
                            type="text"
                            value={filtros[filtro.key] || ''}
                            onChange={e => actualizarFiltro(filtro.key, e.target.value)}
                            placeholder={filtro.placeholder || ''}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="filtros-acciones">
                    <button className="btn-limpiar" onClick={limpiarFiltros}>
                      <X size={14} /> Limpiar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Boton consultar + acciones */}
          {tipoSeleccionado && (
            <div className="generador-acciones">
              <button
                className="btn-consultar"
                onClick={consultarDatos}
                disabled={loading}
              >
                {loading ? (
                  <><RefreshCw size={16} className="spin" /> Consultando...</>
                ) : (
                  <><Search size={16} /> Consultar Datos</>
                )}
              </button>

              {consultaRealizada && datos.length > 0 && (
                <div className="acciones-export">
                  <span className="registros-info">{formatearNumero(total)} registros encontrados</span>
                  <div className="export-buttons">
                    <button
                      className="btn-export btn-csv"
                      onClick={() => exportar('csv')}
                      disabled={exportando}
                    >
                      <Download size={14} />
                      {exportando === 'csv' ? 'Exportando...' : 'CSV'}
                    </button>
                    <button
                      className="btn-export btn-excel"
                      onClick={() => exportar('excel')}
                      disabled={exportando}
                    >
                      <FileSpreadsheet size={14} />
                      {exportando === 'excel' ? 'Exportando...' : 'Excel'}
                    </button>
                    <button
                      className="btn-export btn-pdf"
                      onClick={() => exportar('pdf')}
                      disabled={exportando}
                    >
                      <FileDown size={14} />
                      {exportando === 'pdf' ? 'Exportando...' : 'PDF'}
                    </button>
                    <button
                      className="btn-export btn-html"
                      onClick={verHTMLInteractivo}
                      disabled={exportando}
                    >
                      <Globe size={14} />
                      {exportando === 'html' ? 'Generando...' : 'HTML Interactivo'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="generador-error">
              <p>{error}</p>
              <button onClick={() => setError(null)}>Cerrar</button>
            </div>
          )}

          {/* Tabla de resultados */}
          {consultaRealizada && (
            <div className="generador-resultados">
              {datos.length === 0 ? (
                <div className="resultados-vacio">
                  <Search size={40} />
                  <h3>Sin resultados</h3>
                  <p>No se encontraron datos con los filtros seleccionados.</p>
                </div>
              ) : (
                <div className="resultados-tabla-container">
                  <div className="resultados-tabla-scroll">
                    <table className="resultados-tabla">
                      <thead>
                        <tr>
                          <th>#</th>
                          {columnas.map(col => (
                            <th key={col.key}>{col.label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {datos.slice(0, 100).map((row, idx) => (
                          <tr key={row.id || idx}>
                            <td className="td-num">{idx + 1}</td>
                            {columnas.map(col => {
                              let val = row[col.key]
                              if (val === null || val === undefined) val = ''
                              if (typeof val === 'boolean') val = val ? 'Si' : 'No'
                              if (typeof val === 'object') val = JSON.stringify(val)
                              val = String(val)

                              // Format dates
                              if (col.key.includes('fecha') || col.key.includes('creado') || col.key.includes('timestamp') || col.key.includes('login') || col.key.includes('actualizado') || col.key.includes('registro')) {
                                if (val && val.includes('T')) {
                                  val = formatearFecha(val)
                                }
                              }

                              const truncated = val.length > 80 ? val.substring(0, 80) + '...' : val
                              return (
                                <td key={col.key} title={val}>
                                  {truncated}
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {datos.length > 100 && (
                    <div className="resultados-mas">
                      Mostrando 100 de {formatearNumero(total)} registros. Exporta para ver todos.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Empty state inicial */}
          {!tipoSeleccionado && (
            <div className="generador-empty">
              <BarChart3 size={48} />
              <h3>Centro de Reportes</h3>
              <p>Selecciona un tipo de reporte arriba para comenzar a generar informes de tu marca.</p>
            </div>
          )}
        </div>
      )}

      {/* ============================================ */}
      {/* TAB: INFORMES INSTAGRAM */}
      {/* ============================================ */}
      {tabActiva === 'instagram' && (
        <div className="instagram-container">
          {/* Generar nuevo informe */}
          <div className="rrss-generar-section">
            <h3 className="generador-section-title">Generar Informe RRSS</h3>
            <p className="rrss-generar-desc">
              Genera un informe completo de Instagram con analisis de engagement, contenido, campanas recomendadas y rendimiento del bot IA.
            </p>
            <div className="rrss-generar-form">
              <div className="rrss-fecha-grupo">
                <div className="filtro-campo">
                  <label>Desde</label>
                  <input
                    type="date"
                    value={periodoDesde}
                    onChange={e => setPeriodoDesde(e.target.value)}
                    disabled={generandoRRSS}
                  />
                </div>
                <div className="filtro-campo">
                  <label>Hasta</label>
                  <input
                    type="date"
                    value={periodoHasta}
                    onChange={e => setPeriodoHasta(e.target.value)}
                    disabled={generandoRRSS}
                  />
                </div>
              </div>
              <button
                className="btn-generar-rrss"
                onClick={generarInformeRRSS}
                disabled={generandoRRSS || !periodoDesde || !periodoHasta}
              >
                {generandoRRSS ? (
                  <><RefreshCw size={16} className="spin" /> Generando informe... (puede tardar 1-3 min)</>
                ) : (
                  <><BarChart3 size={16} /> Generar Informe</>
                )}
              </button>
            </div>
            {errorRRSS && (
              <div className="generador-error" style={{ marginTop: 12 }}>
                <p>{errorRRSS}</p>
                <button onClick={() => setErrorRRSS(null)}>Cerrar</button>
              </div>
            )}
          </div>

          {/* Lista de informes existentes */}
          <h3 className="generador-section-title" style={{ marginTop: 24 }}>Informes Generados</h3>
          {loadingIG ? (
            <div className="ig-loading">
              <RefreshCw size={24} className="spin" />
              <span>Cargando informes...</span>
            </div>
          ) : errorIG ? (
            <div className="ig-error">
              <p>Error: {errorIG}</p>
              <button onClick={cargarInformesIG}>Reintentar</button>
            </div>
          ) : informesIG.length === 0 ? (
            <div className="ig-vacio">
              <BarChart3 size={48} />
              <h3>No hay informes disponibles</h3>
              <p>Cuando se genere un nuevo informe de Instagram de tu marca, aparecera aqui.</p>
            </div>
          ) : (
            <div className="ig-lista">
              {informesIG.map(informe => (
                <div key={informe.id} className="ig-card" onClick={() => abrirInformeIG(informe.id)}>
                  <div className="ig-card-header">
                    <div className="ig-periodo">
                      <span className="periodo-label">Periodo</span>
                      <span className="periodo-valor">{formatearPeriodo(informe.periodo_desde, informe.periodo_hasta)}</span>
                    </div>
                    <div className="ig-fecha-gen">
                      <Calendar size={12} />
                      {formatearFecha(informe.fecha_generacion)}
                    </div>
                  </div>

                  <div className="ig-metricas">
                    <div className="ig-metrica">
                      <span className="metrica-valor">{formatearNumero(informe.total_posts)}</span>
                      <span className="metrica-label">Posts</span>
                    </div>
                    <div className="ig-metrica">
                      <span className="metrica-valor">{formatearNumero(informe.total_likes)}</span>
                      <span className="metrica-label">Likes</span>
                    </div>
                    <div className="ig-metrica">
                      <span className="metrica-valor">{formatearNumero(informe.total_comments)}</span>
                      <span className="metrica-label">Comentarios</span>
                    </div>
                    <div className="ig-metrica">
                      <span className="metrica-valor">{formatearNumero(informe.total_reach)}</span>
                      <span className="metrica-label">Alcance</span>
                    </div>
                    <div className="ig-metrica">
                      <span className="metrica-valor">{informe.engagement_rate}%</span>
                      <span className="metrica-label">Engagement</span>
                    </div>
                    <div className="ig-metrica">
                      <span className="metrica-valor">{formatearNumero(informe.followers_count)}</span>
                      <span className="metrica-label">Seguidores</span>
                    </div>
                  </div>

                  <div className="ig-card-footer">
                    <div className="ig-tags">
                      {informe.industria && <span className="ig-tag">{informe.industria}</span>}
                      {informe.sub_industria && <span className="ig-tag tag-sub">{informe.sub_industria}</span>}
                    </div>
                    <button className="btn-ver-ig" onClick={(e) => { e.stopPropagation(); abrirInformeIG(informe.id) }}>
                      <Eye size={14} /> Ver Informe
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default InformesView
