'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
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
import VariablesPanel from './VariablesPanel'
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
  reconocer_respuesta: {
    instrucciones: '',
    variable_origen: 'ultima_respuesta',
    usar_contexto_completo: true,
    salidas: [
      { id: 'salida_1', descripcion: 'Entrego la informacion' },
      { id: 'salida_2', descripcion: 'No entrego la informacion' }
    ],
    extracciones: [],
    temperatura: 0.3
  },
  usar_agente: { agente_id: null, mensaje_transicion: 'Te voy a conectar con nuestro asistente especializado...' },
  esperar: { mensaje_espera: '', variable_destino: '' },
  fin: { mensaje_despedida: '', accion: 'cerrar' }
}

export default function FlowCanvas({ flujo, onSave, guardando, marcaNombre }) {
  const reactFlowWrapper = useRef(null)
  const [reactFlowInstance, setReactFlowInstance] = useState(null)
  const [selectedNode, setSelectedNode] = useState(null)
  const [clipboard, setClipboard] = useState(null)
  const [copyMsg, setCopyMsg] = useState(null)

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
    sourceHandle: e.sourceHandle || null,
    targetHandle: e.targetHandle || null,
    label: e.label || '',
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { strokeWidth: 2 },
    data: { condicion: e.condicion }
  }))

  const [nodes, setNodes, onNodesChange] = useNodesState(nodosIniciales)
  const [edges, setEdges, onEdgesChange] = useEdgesState(edgesIniciales)

  const onConnect = useCallback((params) => {
    // Auto-generar condicion según el tipo de nodo origen y el handle usado
    let condicion = null
    let label = ''

    const sourceNode = nodes.find(n => n.id === params.source)
    if (sourceNode && params.sourceHandle) {
      switch (sourceNode.type) {
        case 'condicion':
          if (params.sourceHandle === 'true') {
            condicion = { tipo: 'resultado_true' }
            label = 'Sí'
          } else if (params.sourceHandle === 'false') {
            condicion = { tipo: 'resultado_false' }
            label = 'No'
          }
          break

        case 'reconocer_respuesta': {
          const salida = sourceNode.data.salidas?.find(s => s.id === params.sourceHandle)
          if (salida) {
            condicion = { tipo: 'salida_ia', valor: params.sourceHandle, descripcion: salida.descripcion || '' }
            label = salida.descripcion || params.sourceHandle
          }
          break
        }

        case 'mensaje':
          if (params.sourceHandle.startsWith('boton_')) {
            const idx = parseInt(params.sourceHandle.replace('boton_', ''))
            const boton = sourceNode.data.botones?.[idx]
            const textoBoton = boton?.texto || boton?.title || ''
            if (textoBoton) {
              condicion = { tipo: 'boton', valor: textoBoton }
              label = textoBoton
            }
          }
          break

        case 'pregunta':
          if (params.sourceHandle === 'si') {
            condicion = { tipo: 'boton', valor: 'Sí' }
            label = 'Sí'
          } else if (params.sourceHandle === 'no') {
            condicion = { tipo: 'boton', valor: 'No' }
            label = 'No'
          } else if (params.sourceHandle.startsWith('boton_')) {
            const idx = parseInt(params.sourceHandle.replace('boton_', ''))
            const boton = sourceNode.data.botones?.[idx]
            const textoBoton = boton?.texto || boton?.title || ''
            if (textoBoton) {
              condicion = { tipo: 'boton', valor: textoBoton }
              label = textoBoton
            }
          }
          break
      }
    }

    setEdges((eds) => addEdge({
      ...params,
      id: `edge_${Date.now()}`,
      label,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { strokeWidth: 2 },
      data: { condicion }
    }, eds))
  }, [setEdges, nodes])

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

  // Copiar nodo seleccionado (Ctrl+C)
  const handleCopy = useCallback(() => {
    if (!selectedNode) return
    // No permitir copiar el nodo inicio
    if (selectedNode.type === 'inicio') {
      setCopyMsg('El nodo inicio no se puede copiar')
      setTimeout(() => setCopyMsg(null), 2000)
      return
    }
    setClipboard({
      type: selectedNode.type,
      data: JSON.parse(JSON.stringify(selectedNode.data))
    })
    setCopyMsg('Nodo copiado')
    setTimeout(() => setCopyMsg(null), 2000)
  }, [selectedNode])

  // Pegar nodo (Ctrl+V)
  const handlePaste = useCallback(() => {
    if (!clipboard || !reactFlowInstance) return

    // Calcular posición: al lado del nodo seleccionado o en el centro del viewport
    let position
    if (selectedNode) {
      position = {
        x: selectedNode.position.x + 200,
        y: selectedNode.position.y + 80
      }
    } else {
      const viewport = reactFlowInstance.getViewport()
      const wrapper = reactFlowWrapper.current
      if (wrapper) {
        const bounds = wrapper.getBoundingClientRect()
        position = reactFlowInstance.screenToFlowPosition({
          x: bounds.left + bounds.width / 2,
          y: bounds.top + bounds.height / 2
        })
      } else {
        position = { x: 400, y: 300 }
      }
    }

    const newNode = {
      id: `node_${Date.now()}`,
      type: clipboard.type,
      position,
      data: JSON.parse(JSON.stringify(clipboard.data))
    }

    setNodes((nds) => [...nds, newNode])
    setSelectedNode(newNode)
    setCopyMsg('Nodo pegado')
    setTimeout(() => setCopyMsg(null), 2000)
  }, [clipboard, selectedNode, reactFlowInstance, setNodes])

  // Duplicar nodo (Ctrl+D)
  const handleDuplicate = useCallback(() => {
    if (!selectedNode || selectedNode.type === 'inicio') return
    const newNode = {
      id: `node_${Date.now()}`,
      type: selectedNode.type,
      position: {
        x: selectedNode.position.x + 200,
        y: selectedNode.position.y + 80
      },
      data: JSON.parse(JSON.stringify(selectedNode.data))
    }
    setNodes((nds) => [...nds, newNode])
    setSelectedNode(newNode)
    setCopyMsg('Nodo duplicado')
    setTimeout(() => setCopyMsg(null), 2000)
  }, [selectedNode, setNodes])

  // Escuchar atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignorar si se está escribiendo en un input/textarea/select
      const tag = e.target.tagName.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) return

      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault()
        handleCopy()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault()
        handlePaste()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault()
        handleDuplicate()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleCopy, handlePaste, handleDuplicate])

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
        else if (e.condicion.tipo === 'salida_ia') label = e.condicion.descripcion || e.condicion.valor || ''
      }

      return {
        id: e.id,
        source: e.origen,
        target: e.destino,
        sourceHandle: e.sourceHandle || null,
        targetHandle: e.targetHandle || null,
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
      sourceHandle: e.sourceHandle || null,
      targetHandle: e.targetHandle || null,
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
          <div className="flow-canvas-toolbar-right">
            {copyMsg && <span className="flow-copy-msg">{copyMsg}</span>}
            {selectedNode && selectedNode.type !== 'inicio' && (
              <div className="flow-node-actions">
                <button className="flow-action-btn" onClick={handleCopy} title="Copiar (Ctrl+C)">
                  Copiar
                </button>
                <button className="flow-action-btn" onClick={handleDuplicate} title="Duplicar (Ctrl+D)">
                  Duplicar
                </button>
                {clipboard && (
                  <button className="flow-action-btn flow-action-paste" onClick={handlePaste} title="Pegar (Ctrl+V)">
                    Pegar
                  </button>
                )}
              </div>
            )}
            {!selectedNode && clipboard && (
              <button className="flow-action-btn flow-action-paste" onClick={handlePaste} title="Pegar (Ctrl+V)">
                Pegar nodo
              </button>
            )}
            <span className="flow-canvas-info">
              {nodes.length} nodos | {edges.length} conexiones
            </span>
          </div>
        </div>

        <div className="flow-canvas-reactflow-wrapper" ref={reactFlowWrapper}>
          <VariablesPanel nodes={nodes} />
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
                  crear_tarea: '#f97316', transferir_humano: '#ef4444', agendar_cita: '#059669',
                  reconocer_respuesta: '#d946ef', usar_agente: '#8b5cf6', esperar: '#ea580c', fin: '#6b7280'
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
          nodosActuales={nodes}
          edgesActuales={edges}
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
