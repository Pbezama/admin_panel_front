'use client'

import { useState, useCallback, useRef } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { nodeTypes } from './nodes/FlowNodes'
import NodePalette from './NodePalette'
import NodeInspector from './NodeInspector'
import FlowAIChat from './FlowAIChat'
import { autoLayoutNodes } from '@/lib/autoLayout'

const DATOS_DEFAULT = {
  inicio: { trigger_tipo: 'keyword', trigger_valor: '' },
  mensaje: { texto: '', tipo_mensaje: 'texto', botones: [] },
  pregunta: { texto: '', tipo_respuesta: 'texto_libre', variable_destino: '', validacion: { requerido: true } },
  condicion: { variable: '', operador: 'no_vacio', valor: '' },
  guardar_variable: { variable: '', valor: '', tipo_valor: 'literal' },
  guardar_bd: { tabla: 'base_cuentas', campos: { categoria: 'lead', clave: '', valor: '', prioridad: 3 } },
  buscar_conocimiento: { consulta: '{{ultima_respuesta}}', categorias: [], variable_destino: 'resultado_busqueda', max_resultados: 5 },
  respuesta_ia: { instrucciones: '', usar_conocimiento: true, usar_variables: true, temperatura: 0.7 },
  crear_tarea: { titulo: '', descripcion: '', tipo: 'otro', prioridad: 'media', asignar_a: 'auto' },
  transferir_humano: { mensaje_usuario: 'Te estoy conectando con un ejecutivo...', mensaje_ejecutivo: '' },
  agendar_cita: { titulo: '', duracion_minutos: 30, descripcion: '' },
  esperar: { mensaje_espera: '', variable_destino: '' },
  fin: { mensaje_despedida: '', accion: 'cerrar' }
}

export default function FlowCanvas({ flujo, onSave, guardando, marcaNombre }) {
  const reactFlowWrapper = useRef(null)
  const [reactFlowInstance, setReactFlowInstance] = useState(null)
  const [selectedNode, setSelectedNode] = useState(null)

  // Convertir nodos del flujo al formato de React Flow
  const nodosIniciales = (flujo?.nodos || []).map(n => ({
    id: n.id,
    type: n.tipo,
    position: n.posicion || { x: 250, y: 0 },
    data: n.datos || {}
  }))

  const edgesIniciales = (flujo?.edges || []).map(e => ({
    id: e.id,
    source: e.origen,
    target: e.destino,
    label: e.label || '',
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { strokeWidth: 2 },
    data: { condicion: e.condicion }
  }))

  const [nodes, setNodes, onNodesChange] = useNodesState(nodosIniciales)
  const [edges, setEdges, onEdgesChange] = useEdgesState(edgesIniciales)

  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge({
      ...params,
      id: `edge_${Date.now()}`,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { strokeWidth: 2 },
      data: { condicion: null }
    }, eds))
  }, [setEdges])

  const onNodeClick = useCallback((_, node) => {
    setSelectedNode(node)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  // Drop desde la paleta
  const onDragOver = useCallback((event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback((event) => {
    event.preventDefault()
    const tipo = event.dataTransfer.getData('application/reactflow-type')
    if (!tipo || !reactFlowInstance) return

    const position = reactFlowInstance.screenToFlowPosition({
      x: event.clientX,
      y: event.clientY
    })

    const newNode = {
      id: `node_${Date.now()}`,
      type: tipo,
      position,
      data: { ...(DATOS_DEFAULT[tipo] || {}) }
    }

    setNodes((nds) => [...nds, newNode])
  }, [reactFlowInstance, setNodes])

  // Actualizar datos de un nodo
  const onUpdateNode = useCallback((nodeId, nuevosDatos) => {
    setNodes((nds) =>
      nds.map((n) => n.id === nodeId ? { ...n, data: { ...nuevosDatos } } : n)
    )
  }, [setNodes])

  // Eliminar nodo
  const onDeleteNode = useCallback((nodeId) => {
    setNodes((nds) => nds.filter(n => n.id !== nodeId))
    setEdges((eds) => eds.filter(e => e.source !== nodeId && e.target !== nodeId))
    setSelectedNode(null)
  }, [setNodes, setEdges])

  // Recibir flujo generado por la IA
  const handleFlowGenerated = useCallback((flujoIA) => {
    if (!flujoIA || !flujoIA.nodos || flujoIA.nodos.length === 0) return

    // Obtener nodo inicio existente
    const nodoInicio = nodes.find(n => n.type === 'inicio')
    const inicioInfo = nodoInicio
      ? { id: nodoInicio.id, posicion: nodoInicio.position }
      : { id: 'node_inicio', posicion: { x: 250, y: 50 } }

    // Auto-layout de los nodos generados
    const nodosConPosicion = autoLayoutNodes(flujoIA.nodos, flujoIA.edges, inicioInfo)

    // Convertir a formato ReactFlow
    const nuevosNodos = nodosConPosicion.map(n => ({
      id: n.id,
      type: n.tipo,
      position: n.posicion,
      data: n.datos || {}
    }))

    // Generar labels descriptivos para edges
    const nuevosEdges = flujoIA.edges.map(e => {
      let label = ''
      if (e.condicion) {
        if (e.condicion.tipo === 'boton') label = e.condicion.valor || ''
        else if (e.condicion.tipo === 'resultado_true') label = 'Si'
        else if (e.condicion.tipo === 'resultado_false') label = 'No'
        else if (e.condicion.tipo === 'respuesta_exacta') label = e.condicion.valor || ''
        else if (e.condicion.tipo === 'respuesta_contiene') label = `~${e.condicion.valor || ''}`
      }

      return {
        id: e.id,
        source: e.origen,
        target: e.destino,
        label,
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { strokeWidth: 2 },
        data: { condicion: e.condicion || null }
      }
    })

    // Edge desde inicio al primer nodo generado
    const primerNodoId = flujoIA.nodos[0]?.id
    const edgeDesdeInicio = {
      id: 'edge_inicio_ia',
      source: inicioInfo.id,
      target: primerNodoId,
      label: '',
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { strokeWidth: 2 },
      data: { condicion: null }
    }

    // Mantener inicio + agregar nuevos nodos
    setNodes(prev => {
      const inicioNode = prev.find(n => n.type === 'inicio')
      return inicioNode ? [inicioNode, ...nuevosNodos] : nuevosNodos
    })

    setEdges([edgeDesdeInicio, ...nuevosEdges])

    // Ajustar vista despues de render
    setTimeout(() => {
      reactFlowInstance?.fitView({ padding: 0.15 })
    }, 200)
  }, [nodes, setNodes, setEdges, reactFlowInstance])

  // Guardar: convertir de React Flow al formato del backend
  const handleSave = () => {
    const nodosBackend = nodes.map(n => ({
      id: n.id,
      tipo: n.type,
      posicion: n.position,
      datos: n.data
    }))

    const edgesBackend = edges.map(e => ({
      id: e.id,
      origen: e.source,
      destino: e.target,
      label: e.label || '',
      condicion: e.data?.condicion || null
    }))

    onSave(nodosBackend, edgesBackend)
  }

  return (
    <div className="flow-canvas-layout">
      <NodePalette />

      <div className="flow-canvas-center">
        <div className="flow-canvas-toolbar">
          <button className="flow-btn-save" onClick={handleSave} disabled={guardando}>
            {guardando ? 'Guardando...' : 'Guardar flujo'}
          </button>
          <span className="flow-canvas-info">
            {nodes.length} nodos | {edges.length} conexiones
          </span>
        </div>

        <div className="flow-canvas-reactflow-wrapper" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
            deleteKeyCode={['Backspace', 'Delete']}
            snapToGrid
            snapGrid={[15, 15]}
          >
            <Background variant="dots" gap={15} size={1} />
            <Controls />
            <MiniMap
              nodeColor={(n) => {
                const colores = {
                  inicio: '#22c55e', mensaje: '#3b82f6', pregunta: '#f59e0b',
                  condicion: '#ec4899', guardar_variable: '#6366f1', guardar_bd: '#10b981',
                  buscar_conocimiento: '#eab308', respuesta_ia: '#8b5cf6',
                  crear_tarea: '#f97316', transferir_humano: '#ef4444', agendar_cita: '#059669', esperar: '#ea580c', fin: '#6b7280'
                }
                return colores[n.type] || '#999'
              }}
              style={{ height: 100 }}
            />
          </ReactFlow>
        </div>

        <FlowAIChat
          flujo={flujo}
          onFlowGenerated={handleFlowGenerated}
          marcaNombre={marcaNombre}
        />
      </div>

      <NodeInspector
        nodo={selectedNode}
        onUpdate={onUpdateNode}
        onDelete={onDeleteNode}
      />
    </div>
  )
}
