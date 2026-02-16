'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  MarkerType
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { nodeTypes } from './nodes/FlowNodes'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import '@/styles/FlowMonitor.css'

// Colores de estado para nodos
const ESTADO_COLORES = {
  ejecutado: { shadow: '0 0 0 3px #22c55e', color: '#22c55e' },
  error: { shadow: '0 0 0 3px #ef4444', color: '#ef4444' },
  esperando: { shadow: '0 0 0 3px #f59e0b', color: '#f59e0b' }
}

const ESTADO_LABELS = {
  activa: 'Activa',
  completada: 'Completada',
  transferida: 'Transferida',
  cancelada: 'Cancelada',
  error: 'Error'
}

const CANAL_ICONOS = {
  whatsapp: '📱',
  instagram: '📸',
  facebook: '📘',
  web: '🌐'
}

const TIPO_NODO_ICONOS = {
  inicio: '▶',
  mensaje: '💬',
  pregunta: '❓',
  condicion: '🔀',
  guardar_variable: '📝',
  guardar_bd: '💾',
  buscar_conocimiento: '🔍',
  respuesta_ia: '🤖',
  crear_tarea: '📋',
  transferir_humano: '🧑‍💼',
  agendar_cita: '📅',
  esperar: '⏳',
  fin: '🏁'
}

const TIPO_NODO_LABELS = {
  inicio: 'Inicio',
  mensaje: 'Mensaje',
  pregunta: 'Pregunta',
  condicion: 'Condicion',
  guardar_variable: 'Guardar Variable',
  guardar_bd: 'Guardar en BD',
  buscar_conocimiento: 'Buscar Conocimiento',
  respuesta_ia: 'Respuesta IA',
  crear_tarea: 'Crear Tarea',
  transferir_humano: 'Transferir Humano',
  agendar_cita: 'Agendar Cita',
  esperar: 'Esperar Respuesta',
  fin: 'Fin'
}

function parseNodosEdges(flujo) {
  let nodos = flujo?.nodos || []
  let edges = flujo?.edges || []
  if (typeof nodos === 'string') {
    try { nodos = JSON.parse(nodos) } catch { nodos = [] }
  }
  if (typeof edges === 'string') {
    try { edges = JSON.parse(edges) } catch { edges = [] }
  }
  return { nodos, edges }
}

export default function FlowMonitor({ onVolver }) {
  const { usuario, marcaActiva } = useAuth()

  const [conversaciones, setConversaciones] = useState([])
  const [flujos, setFlujos] = useState([])
  const [seleccionada, setSeleccionada] = useState(null)
  const [logs, setLogs] = useState([])
  const [cargando, setCargando] = useState(true)
  const [cargandoLogs, setCargandoLogs] = useState(false)
  const [nodoSeleccionado, setNodoSeleccionado] = useState(null)
  const [deteniendo, setDeteniendo] = useState(false)

  // Filtros
  const [filtroFlujo, setFiltroFlujo] = useState('')
  const [filtroCanal, setFiltroCanal] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')

  const cargarConversaciones = useCallback(async () => {
    setCargando(true)
    try {
      const filtros = {}
      if (filtroFlujo) filtros.flujo_id = filtroFlujo
      if (filtroCanal) filtros.canal = filtroCanal
      if (filtroEstado) filtros.estado = filtroEstado

      const result = await api.getConversacionesMonitor(filtros)
      if (result.success) {
        setConversaciones(result.conversaciones || [])
      }
    } catch (error) {
      console.error('Error cargando conversaciones monitor:', error)
    } finally {
      setCargando(false)
    }
  }, [filtroFlujo, filtroCanal, filtroEstado])

  const cargarFlujos = useCallback(async () => {
    try {
      const result = await api.getFlujos()
      setFlujos(result.flujos || [])
    } catch (error) {
      console.error('Error cargando flujos:', error)
    }
  }, [])

  useEffect(() => {
    cargarFlujos()
  }, [cargarFlujos])

  useEffect(() => {
    cargarConversaciones()
  }, [cargarConversaciones])

  const cargarLogs = useCallback(async (convId) => {
    setCargandoLogs(true)
    try {
      const result = await api.getLogsFlujo(convId)
      if (result.success) {
        setLogs(result.logs || [])
      }
    } catch (error) {
      console.error('Error cargando logs:', error)
    } finally {
      setCargandoLogs(false)
    }
  }, [])

  const seleccionarConversacion = useCallback(async (conv) => {
    setSeleccionada(conv)
    setNodoSeleccionado(null)
    await cargarLogs(conv.id)
  }, [cargarLogs])

  const detenerFlujo = useCallback(async () => {
    if (!seleccionada || deteniendo) return
    setDeteniendo(true)
    try {
      const result = await api.detenerConversacionFlujo(seleccionada.id)
      if (result.success) {
        setSeleccionada(prev => ({ ...prev, estado: 'cancelada' }))
        setConversaciones(prev =>
          prev.map(c => c.id === seleccionada.id ? { ...c, estado: 'cancelada' } : c)
        )
      }
    } catch (error) {
      console.error('Error deteniendo flujo:', error)
    } finally {
      setDeteniendo(false)
    }
  }, [seleccionada, deteniendo])

  const recargarTodo = useCallback(async () => {
    await cargarConversaciones()
    if (seleccionada) {
      await cargarLogs(seleccionada.id)
    }
  }, [cargarConversaciones, seleccionada, cargarLogs])

  // Construir nodos ReactFlow - misma visual del editor, solo un punto de color
  const construirNodosReactFlow = useCallback(() => {
    if (!seleccionada?.flujos) return { nodes: [], edges: [] }

    const { nodos, edges } = parseNodosEdges(seleccionada.flujos)

    const nodosRF = nodos.map(n => {
      const logNodo = logs.find(l => l.nodo_id === n.id)

      return {
        id: n.id,
        type: n.tipo,
        position: n.posicion || { x: 250, y: 0 },
        data: {
          ...(n.datos || {}),
          _monitorEstado: logNodo?.estado || null,
          _monitorActivo: true
        }
      }
    })

    const edgesRF = edges.map(e => {
      const logOrigen = logs.find(l => l.nodo_id === e.origen)
      const logDestino = logs.find(l => l.nodo_id === e.destino)

      let strokeColor = '#ddd'
      if (logOrigen?.estado === 'ejecutado' && logDestino) {
        strokeColor = logDestino.estado === 'error' ? '#ef4444' : '#22c55e'
      } else if (logOrigen?.estado === 'ejecutado' && !logDestino) {
        strokeColor = '#94a3b8'
      }

      return {
        id: e.id,
        source: e.origen,
        target: e.destino,
        sourceHandle: e.sourceHandle || undefined,
        label: e.label || '',
        style: { stroke: strokeColor, strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: strokeColor },
        data: { condicion: e.condicion }
      }
    })

    return { nodes: nodosRF, edges: edgesRF }
  }, [seleccionada, logs])

  const { nodes, edges } = construirNodosReactFlow()

  const onNodeClick = useCallback((_, node) => {
    const logNodo = logs.find(l => l.nodo_id === node.id)
    if (logNodo) {
      setNodoSeleccionado({ ...logNodo, _nodeId: node.id, _nodeType: node.type })
    } else {
      setNodoSeleccionado({ nodo_id: node.id, tipo_nodo: node.type, estado: 'no_alcanzado', _nodeId: node.id, _nodeType: node.type })
    }
  }, [logs])

  const formatFecha = (fecha) => {
    if (!fecha) return 'N/A'
    return new Date(fecha).toLocaleString('es-CL', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  const formatTiempoRelativo = (fecha) => {
    if (!fecha) return ''
    const diff = Date.now() - new Date(fecha).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'ahora'
    if (mins < 60) return `hace ${mins}m`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `hace ${hrs}h`
    const dias = Math.floor(hrs / 24)
    if (dias < 7) return `hace ${dias}d`
    return new Date(fecha).toLocaleDateString('es-CL')
  }

  const getEstadoBadge = (estado) => {
    const clases = {
      activa: 'monitor-badge-activa',
      completada: 'monitor-badge-completada',
      transferida: 'monitor-badge-transferida',
      cancelada: 'monitor-badge-cancelada'
    }
    return <span className={`monitor-badge ${clases[estado] || ''}`}>{ESTADO_LABELS[estado] || estado}</span>
  }

  const getLogEstadoBadge = (estado) => {
    const clases = {
      ejecutado: 'monitor-log-ejecutado',
      error: 'monitor-log-error',
      esperando: 'monitor-log-esperando',
      no_alcanzado: 'monitor-log-no-alcanzado'
    }
    const labels = {
      ejecutado: 'Ejecutado',
      error: 'Error',
      esperando: 'Esperando',
      no_alcanzado: 'No alcanzado'
    }
    return <span className={`monitor-log-badge ${clases[estado] || ''}`}>{labels[estado] || estado}</span>
  }

  return (
    <div className="flow-monitor-container">
      {/* Header */}
      <header className="flow-monitor-header">
        <div className="flow-monitor-header-left">
          <button className="flow-monitor-back" onClick={onVolver}>
            ← Volver
          </button>
          <h2>Monitor de Flujos</h2>
          <span className="flow-monitor-count">{conversaciones.length} ejecuciones</span>
        </div>
        <div className="flow-monitor-header-right">
          <button className="flow-monitor-refresh" onClick={recargarTodo}>
            Actualizar
          </button>
        </div>
      </header>

      <div className="flow-monitor-body">
        {/* Panel izquierdo: Filtros + Lista */}
        <aside className="flow-monitor-sidebar">
          <div className="flow-monitor-filters">
            <select
              value={filtroFlujo}
              onChange={e => setFiltroFlujo(e.target.value)}
              className="flow-monitor-select"
            >
              <option value="">Todos los flujos</option>
              {flujos.map(f => (
                <option key={f.id} value={f.id}>{f.nombre}</option>
              ))}
            </select>
            <select
              value={filtroCanal}
              onChange={e => setFiltroCanal(e.target.value)}
              className="flow-monitor-select"
            >
              <option value="">Todos los canales</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="web">Web</option>
            </select>
            <select
              value={filtroEstado}
              onChange={e => setFiltroEstado(e.target.value)}
              className="flow-monitor-select"
            >
              <option value="">Todos los estados</option>
              <option value="activa">Activa</option>
              <option value="completada">Completada</option>
              <option value="transferida">Transferida</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>

          <div className="flow-monitor-list">
            {cargando ? (
              <div className="flow-monitor-empty">Cargando...</div>
            ) : conversaciones.length === 0 ? (
              <div className="flow-monitor-empty">
                No hay ejecuciones de flujos.
                <br /><br />
                Cuando un flujo se active, aparecera aqui.
              </div>
            ) : (
              conversaciones.map(conv => (
                <button
                  key={conv.id}
                  className={`flow-monitor-item ${seleccionada?.id === conv.id ? 'active' : ''}`}
                  onClick={() => seleccionarConversacion(conv)}
                >
                  <div className="monitor-item-top">
                    <span className="monitor-item-flujo">{conv.flujos?.nombre || 'Flujo'}</span>
                    <span className="monitor-item-tiempo">{formatTiempoRelativo(conv.creado_en)}</span>
                  </div>
                  <div className="monitor-item-mid">
                    <span className="monitor-item-canal">
                      {CANAL_ICONOS[conv.canal] || '💬'} {conv.canal}
                    </span>
                    {getEstadoBadge(conv.estado)}
                  </div>
                  <div className="monitor-item-user">{conv.identificador_usuario}</div>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Panel central: Mapa ReactFlow */}
        <main className="flow-monitor-canvas">
          {!seleccionada ? (
            <div className="flow-monitor-no-selection">
              <div className="flow-monitor-no-selection-icon">🗺️</div>
              <p>Selecciona una ejecucion para ver el mapa del flujo</p>
            </div>
          ) : (
            <div className="flow-monitor-reactflow-wrapper">
              {/* Leyenda */}
              <div className="flow-monitor-legend">
                <span className="legend-item legend-ejecutado">Ejecutado</span>
                <span className="legend-item legend-error">Error</span>
                <span className="legend-item legend-esperando">Esperando</span>
                <span className="legend-item legend-no-alcanzado">No alcanzado</span>
              </div>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodeClick={onNodeClick}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={true}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                minZoom={0.3}
                maxZoom={1.5}
              >
                <Background color="#f0f0f0" gap={20} />
                <Controls showInteractive={false} />
                <MiniMap
                  nodeColor={(node) => {
                    const logN = logs.find(l => l.nodo_id === node.id)
                    if (!logN) return '#d1d5db'
                    if (logN.estado === 'ejecutado') return '#22c55e'
                    if (logN.estado === 'error') return '#ef4444'
                    if (logN.estado === 'esperando') return '#f59e0b'
                    return '#d1d5db'
                  }}
                  style={{ height: 80 }}
                />
              </ReactFlow>
            </div>
          )}
        </main>

        {/* Panel derecho: Detalle + Timeline */}
        {seleccionada && (
          <aside className="flow-monitor-detail">
            {/* Info de la conversacion */}
            <div className="monitor-detail-section">
              <h3>Conversacion</h3>
              <div className="monitor-detail-row">
                <label>Usuario</label>
                <span>{seleccionada.identificador_usuario}</span>
              </div>
              <div className="monitor-detail-row">
                <label>Canal</label>
                <span>{CANAL_ICONOS[seleccionada.canal] || ''} {seleccionada.canal}</span>
              </div>
              <div className="monitor-detail-row">
                <label>Flujo</label>
                <span>{seleccionada.flujos?.nombre || 'N/A'}</span>
              </div>
              <div className="monitor-detail-row">
                <label>Estado</label>
                {getEstadoBadge(seleccionada.estado)}
              </div>
              {seleccionada.estado === 'activa' && (
                <button
                  className="monitor-btn-detener"
                  onClick={detenerFlujo}
                  disabled={deteniendo}
                >
                  {deteniendo ? 'Deteniendo...' : 'Detener flujo'}
                </button>
              )}
              <div className="monitor-detail-row">
                <label>Inicio</label>
                <span>{formatFecha(seleccionada.creado_en)}</span>
              </div>
            </div>

            {/* Timeline */}
            <div className="monitor-detail-section">
              <h3>Timeline ({logs.length} nodos)</h3>
              {cargandoLogs ? (
                <div className="monitor-timeline-loading">Cargando logs...</div>
              ) : logs.length === 0 ? (
                <div className="monitor-timeline-empty">Sin logs de ejecucion</div>
              ) : (
                <div className="monitor-timeline">
                  {logs.map((logItem, i) => (
                    <button
                      key={logItem.id || i}
                      className={`monitor-timeline-item ${nodoSeleccionado?.id === logItem.id ? 'active' : ''}`}
                      onClick={() => setNodoSeleccionado(logItem)}
                    >
                      <div className="timeline-item-header">
                        <span className="timeline-item-icon">
                          {TIPO_NODO_ICONOS[logItem.tipo_nodo] || '⚙️'}
                        </span>
                        <span className="timeline-item-tipo">
                          {TIPO_NODO_LABELS[logItem.tipo_nodo] || logItem.tipo_nodo}
                        </span>
                        {getLogEstadoBadge(logItem.estado)}
                      </div>
                      <div className="timeline-item-meta">
                        {logItem.duracion_ms != null && (
                          <span className="timeline-item-duracion">{logItem.duracion_ms}ms</span>
                        )}
                        <span className="timeline-item-nodo">{logItem.nodo_id}</span>
                      </div>
                      {logItem.error && (
                        <div className="timeline-item-error">{logItem.error}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Detalle del nodo seleccionado */}
            {nodoSeleccionado && (
              <div className="monitor-detail-section">
                <h3>Detalle: {TIPO_NODO_LABELS[nodoSeleccionado.tipo_nodo] || nodoSeleccionado.tipo_nodo}</h3>
                <div className="monitor-detail-row">
                  <label>Nodo ID</label>
                  <span>{nodoSeleccionado.nodo_id}</span>
                </div>
                <div className="monitor-detail-row">
                  <label>Estado</label>
                  {getLogEstadoBadge(nodoSeleccionado.estado)}
                </div>
                {nodoSeleccionado.duracion_ms != null && (
                  <div className="monitor-detail-row">
                    <label>Duracion</label>
                    <span>{nodoSeleccionado.duracion_ms}ms</span>
                  </div>
                )}
                {nodoSeleccionado.error && (
                  <div className="monitor-nodo-error">
                    <label>Error</label>
                    <pre>{nodoSeleccionado.error}</pre>
                  </div>
                )}
                {nodoSeleccionado.datos_entrada && Object.keys(nodoSeleccionado.datos_entrada).length > 0 && (
                  <div className="monitor-nodo-vars">
                    <label>Datos entrada</label>
                    <div className="monitor-vars-list">
                      {Object.entries(nodoSeleccionado.datos_entrada).map(([k, v]) => (
                        <div key={k} className="monitor-var-item">
                          <span className="monitor-var-key">{k}:</span>
                          <span className="monitor-var-value">
                            {typeof v === 'object' ? JSON.stringify(v, null, 1) : String(v)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {nodoSeleccionado.datos_salida && Object.keys(nodoSeleccionado.datos_salida).length > 0 && (
                  <div className="monitor-nodo-vars">
                    <label>Datos salida</label>
                    <div className="monitor-vars-list">
                      {Object.entries(nodoSeleccionado.datos_salida).map(([k, v]) => (
                        <div key={k} className="monitor-var-item">
                          <span className="monitor-var-key">{k}:</span>
                          <span className="monitor-var-value">
                            {typeof v === 'object' ? JSON.stringify(v, null, 1) : String(v)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Variables finales */}
            {seleccionada.variables && Object.keys(seleccionada.variables).length > 0 && (
              <div className="monitor-detail-section">
                <h3>Variables finales</h3>
                <div className="monitor-vars-list">
                  {Object.entries(seleccionada.variables).map(([k, v]) => (
                    <div key={k} className="monitor-var-item">
                      <span className="monitor-var-key">{k}:</span>
                      <span className="monitor-var-value">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  )
}
