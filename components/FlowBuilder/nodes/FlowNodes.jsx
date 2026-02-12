'use client'

import { Handle, Position } from '@xyflow/react'

const handleStyle = { width: 8, height: 8 }

// Colores por tipo de nodo
const COLORES = {
  inicio: { bg: '#dcfce7', border: '#22c55e', icon: '▶' },
  mensaje: { bg: '#dbeafe', border: '#3b82f6', icon: '💬' },
  pregunta: { bg: '#fef3c7', border: '#f59e0b', icon: '❓' },
  condicion: { bg: '#fce7f3', border: '#ec4899', icon: '🔀' },
  guardar_variable: { bg: '#e0e7ff', border: '#6366f1', icon: '📝' },
  guardar_bd: { bg: '#d1fae5', border: '#10b981', icon: '💾' },
  buscar_conocimiento: { bg: '#fef9c3', border: '#eab308', icon: '🔍' },
  respuesta_ia: { bg: '#ede9fe', border: '#8b5cf6', icon: '🤖' },
  crear_tarea: { bg: '#ffedd5', border: '#f97316', icon: '📋' },
  transferir_humano: { bg: '#fee2e2', border: '#ef4444', icon: '🧑‍💼' },
  agendar_cita: { bg: '#ecfdf5', border: '#059669', icon: '📅' },
  esperar: { bg: '#fff7ed', border: '#ea580c', icon: '⏳' },
  fin: { bg: '#f3f4f6', border: '#6b7280', icon: '🏁' }
}

const LABELS = {
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

function BaseNode({ data, tipo, selected }) {
  const color = COLORES[tipo] || COLORES.mensaje
  const label = LABELS[tipo] || tipo

  return (
    <div
      style={{
        background: color.bg,
        border: `2px solid ${selected ? '#000' : color.border}`,
        borderRadius: 8,
        padding: '8px 12px',
        minWidth: 180,
        maxWidth: 260,
        fontSize: 13,
        boxShadow: selected ? '0 0 0 2px #000' : '0 1px 3px rgba(0,0,0,0.1)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, fontWeight: 600 }}>
        <span>{color.icon}</span>
        <span>{label}</span>
      </div>
      {data.texto && (
        <div style={{ fontSize: 11, color: '#555', lineHeight: 1.3, wordBreak: 'break-word' }}>
          {data.texto.length > 80 ? data.texto.substring(0, 80) + '...' : data.texto}
        </div>
      )}
      {data.variable_destino && (
        <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>
          → {data.variable_destino}
        </div>
      )}
      {data.botones?.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
          {data.botones.map((b, i) => (
            <span key={i} style={{
              fontSize: 10, background: '#fff', border: `1px solid ${color.border}`,
              borderRadius: 4, padding: '1px 6px'
            }}>
              {b.texto || b.title}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export function InicioNode({ data, selected }) {
  return (
    <div>
      <BaseNode data={data} tipo="inicio" selected={selected} />
      <Handle type="source" position={Position.Bottom} style={handleStyle} />
    </div>
  )
}

export function MensajeNode({ data, selected }) {
  return (
    <div>
      <Handle type="target" position={Position.Top} style={handleStyle} />
      <BaseNode data={data} tipo="mensaje" selected={selected} />
      <Handle type="source" position={Position.Bottom} style={handleStyle} />
    </div>
  )
}

export function PreguntaNode({ data, selected }) {
  return (
    <div>
      <Handle type="target" position={Position.Top} style={handleStyle} />
      <BaseNode data={{ ...data, texto: data.texto || `Tipo: ${data.tipo_respuesta || 'texto_libre'}` }} tipo="pregunta" selected={selected} />
      <Handle type="source" position={Position.Bottom} style={handleStyle} />
    </div>
  )
}

export function CondicionNode({ data, selected }) {
  return (
    <div>
      <Handle type="target" position={Position.Top} style={handleStyle} />
      <BaseNode data={{ texto: `${data.variable || '?'} ${data.operador || '?'} ${data.valor || ''}` }} tipo="condicion" selected={selected} />
      <Handle type="source" position={Position.Bottom} id="true" style={{ ...handleStyle, left: '30%' }} />
      <Handle type="source" position={Position.Bottom} id="false" style={{ ...handleStyle, left: '70%' }} />
    </div>
  )
}

export function GuardarVariableNode({ data, selected }) {
  return (
    <div>
      <Handle type="target" position={Position.Top} style={handleStyle} />
      <BaseNode data={{ texto: `${data.variable || '?'} = ${data.valor || '?'}` }} tipo="guardar_variable" selected={selected} />
      <Handle type="source" position={Position.Bottom} style={handleStyle} />
    </div>
  )
}

export function GuardarBdNode({ data, selected }) {
  return (
    <div>
      <Handle type="target" position={Position.Top} style={handleStyle} />
      <BaseNode data={{ texto: `Tabla: ${data.tabla || 'base_cuentas'}` }} tipo="guardar_bd" selected={selected} />
      <Handle type="source" position={Position.Bottom} style={handleStyle} />
    </div>
  )
}

export function BuscarConocimientoNode({ data, selected }) {
  return (
    <div>
      <Handle type="target" position={Position.Top} style={handleStyle} />
      <BaseNode data={{ texto: data.consulta || 'Buscar en conocimiento', variable_destino: data.variable_destino }} tipo="buscar_conocimiento" selected={selected} />
      <Handle type="source" position={Position.Bottom} style={handleStyle} />
    </div>
  )
}

export function RespuestaIaNode({ data, selected }) {
  return (
    <div>
      <Handle type="target" position={Position.Top} style={handleStyle} />
      <BaseNode data={{ texto: data.instrucciones || 'Respuesta generada por IA' }} tipo="respuesta_ia" selected={selected} />
      <Handle type="source" position={Position.Bottom} style={handleStyle} />
    </div>
  )
}

export function CrearTareaNode({ data, selected }) {
  return (
    <div>
      <Handle type="target" position={Position.Top} style={handleStyle} />
      <BaseNode data={{ texto: data.titulo || 'Nueva tarea' }} tipo="crear_tarea" selected={selected} />
      <Handle type="source" position={Position.Bottom} style={handleStyle} />
    </div>
  )
}

export function TransferirHumanoNode({ data, selected }) {
  return (
    <div>
      <Handle type="target" position={Position.Top} style={handleStyle} />
      <BaseNode data={{ texto: data.mensaje_usuario || 'Transferir a ejecutivo' }} tipo="transferir_humano" selected={selected} />
    </div>
  )
}

export function EsperarNode({ data, selected }) {
  return (
    <div>
      <Handle type="target" position={Position.Top} style={handleStyle} />
      <BaseNode data={{ texto: data.mensaje_espera || 'Esperando respuesta...', variable_destino: data.variable_destino }} tipo="esperar" selected={selected} />
      <Handle type="source" position={Position.Bottom} style={handleStyle} />
    </div>
  )
}

export function AgendarCitaNode({ data, selected }) {
  return (
    <div>
      <Handle type="target" position={Position.Top} style={handleStyle} />
      <BaseNode data={{ texto: data.titulo || 'Agendar cita en Calendar' }} tipo="agendar_cita" selected={selected} />
      <Handle type="source" position={Position.Bottom} style={handleStyle} />
    </div>
  )
}

export function FinNode({ data, selected }) {
  return (
    <div>
      <Handle type="target" position={Position.Top} style={handleStyle} />
      <BaseNode data={{ texto: data.mensaje_despedida || data.accion || 'Fin del flujo' }} tipo="fin" selected={selected} />
    </div>
  )
}

// Mapa de tipos de nodo para React Flow
export const nodeTypes = {
  inicio: InicioNode,
  mensaje: MensajeNode,
  pregunta: PreguntaNode,
  condicion: CondicionNode,
  guardar_variable: GuardarVariableNode,
  guardar_bd: GuardarBdNode,
  buscar_conocimiento: BuscarConocimientoNode,
  respuesta_ia: RespuestaIaNode,
  crear_tarea: CrearTareaNode,
  transferir_humano: TransferirHumanoNode,
  agendar_cita: AgendarCitaNode,
  esperar: EsperarNode,
  fin: FinNode
}
