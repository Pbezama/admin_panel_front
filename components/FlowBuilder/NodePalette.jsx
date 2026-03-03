'use client'

const NODOS_DISPONIBLES = [
  { tipo: 'inicio', label: 'Inicio', icon: '▶', desc: 'Punto de entrada del flujo', color: '#22c55e' },
  { tipo: 'mensaje', label: 'Mensaje', icon: '💬', desc: 'Enviar texto, botones o lista', color: '#3b82f6' },
  { tipo: 'pregunta', label: 'Pregunta', icon: '❓', desc: 'Pedir datos al usuario', color: '#f59e0b' },
  { tipo: 'condicion', label: 'Condicion', icon: '🔀', desc: 'Si/entonces (bifurcar)', color: '#ec4899' },
  { tipo: 'guardar_variable', label: 'Variable', icon: '📝', desc: 'Guardar dato en variable', color: '#6366f1' },
  { tipo: 'guardar_bd', label: 'Datos BD', icon: '💾', desc: 'Insertar, buscar o actualizar en tus tablas personalizadas', color: '#10b981' },
  { tipo: 'buscar_conocimiento', label: 'Conocimiento', icon: '🔍', desc: 'Buscar en entrenador IA', color: '#eab308' },
  { tipo: 'respuesta_ia', label: 'Respuesta IA', icon: '🤖', desc: 'GPT responde con contexto', color: '#8b5cf6' },
  { tipo: 'crear_tarea', label: 'Crear Tarea', icon: '📋', desc: 'Asignar tarea a equipo', color: '#f97316' },
  { tipo: 'transferir_humano', label: 'Transferir', icon: '🧑‍💼', desc: 'Pasar a ejecutivo humano', color: '#ef4444' },
  { tipo: 'agendar_cita', label: 'Agendar Cita', icon: '📅', desc: 'Crear evento en Google Calendar', color: '#059669' },
  { tipo: 'reconocer_respuesta', label: 'Reconocer', icon: '🧠', desc: 'IA analiza texto y decide camino', color: '#d946ef' },
  { tipo: 'usar_agente', label: 'Usar Agente', icon: '🤖', desc: 'Delegar a un agente IA autonomo', color: '#8b5cf6' },
  { tipo: 'esperar', label: 'Esperar Respuesta', icon: '⏳', desc: 'Pausar y esperar respuesta del cliente', color: '#ea580c' },
  { tipo: 'fin', label: 'Fin', icon: '🏁', desc: 'Terminar flujo', color: '#6b7280' }
]

export default function NodePalette() {
  const onDragStart = (event, tipo) => {
    event.dataTransfer.setData('application/reactflow-type', tipo)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div className="flow-palette">
      <h3 className="flow-palette-title">Nodos</h3>
      <div className="flow-palette-list">
        {NODOS_DISPONIBLES.map(nodo => (
          <div
            key={nodo.tipo}
            className="flow-palette-item"
            draggable
            onDragStart={(e) => onDragStart(e, nodo.tipo)}
            style={{ borderLeft: `3px solid ${nodo.color}` }}
          >
            <span className="flow-palette-icon">{nodo.icon}</span>
            <div>
              <div className="flow-palette-label">{nodo.label}</div>
              <div className="flow-palette-desc">{nodo.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
