'use client'

import { useState, useMemo } from 'react'

const SYSTEM_VARS = [
  { nombre: 'nombre_marca', desc: 'Nombre de la marca' },
  { nombre: 'canal', desc: 'Canal actual (whatsapp/instagram/web)' },
  { nombre: 'identificador_usuario', desc: 'ID del usuario' },
  { nombre: 'fecha_actual', desc: 'Fecha actual (DD/MM/YYYY)' },
  { nombre: 'hora_actual', desc: 'Hora actual (HH:MM)' },
  { nombre: 'timestamp', desc: 'Marca de tiempo ISO' },
  { nombre: 'ultima_respuesta', desc: 'Última respuesta del usuario' }
]

// Iconos por tipo de nodo que genera la variable
const ICON_POR_TIPO = {
  pregunta: '❓',
  esperar: '⏳',
  guardar_variable: '📝',
  buscar_conocimiento: '🔍',
  respuesta_ia: '🤖',
  reconocer_respuesta: '🧠',
  crear_tarea: '📋'
}

export default function VariablesPanel({ nodes }) {
  const [collapsed, setCollapsed] = useState(true)
  const [copiedVar, setCopiedVar] = useState(null)

  // Escanear nodos para extraer variables creadas dinámicamente
  const flowVars = useMemo(() => {
    const vars = []
    const seen = new Set()

    const add = (nombre, origen, tipoNodo) => {
      if (!nombre || seen.has(nombre)) return
      seen.add(nombre)
      vars.push({ nombre, origen, icon: ICON_POR_TIPO[tipoNodo] || '📦' })
    }

    for (const node of (nodes || [])) {
      const d = node.data || {}

      switch (node.type) {
        case 'pregunta':
          if (d.variable_destino) add(d.variable_destino, 'Pregunta', 'pregunta')
          break

        case 'esperar':
          if (d.variable_destino) add(d.variable_destino, 'Esperar', 'esperar')
          break

        case 'guardar_variable':
          if (d.variable) add(d.variable, 'Guardar Variable', 'guardar_variable')
          break

        case 'buscar_conocimiento':
          if (d.variable_destino) {
            add(d.variable_destino, 'Buscar Conocimiento', 'buscar_conocimiento')
            add(`${d.variable_destino}_raw`, 'Buscar Conocimiento (raw)', 'buscar_conocimiento')
          }
          break

        case 'respuesta_ia':
          add('respuesta_ia', 'Respuesta IA', 'respuesta_ia')
          break

        case 'reconocer_respuesta':
          if (d.extracciones?.length > 0) {
            d.extracciones.forEach(ext => {
              if (ext.variable) add(ext.variable, 'Reconocer Respuesta', 'reconocer_respuesta')
            })
          }
          break

        case 'crear_tarea':
          add('ultima_tarea_id', 'Crear Tarea', 'crear_tarea')
          break
      }
    }

    return vars
  }, [nodes])

  const handleCopy = async (nombre) => {
    try {
      await navigator.clipboard.writeText(`{{${nombre}}}`)
      setCopiedVar(nombre)
      setTimeout(() => setCopiedVar(null), 1500)
    } catch {
      // Fallback para navegadores sin clipboard API
      const el = document.createElement('textarea')
      el.value = `{{${nombre}}}`
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopiedVar(nombre)
      setTimeout(() => setCopiedVar(null), 1500)
    }
  }

  if (collapsed) {
    return (
      <button
        className="flow-vars-toggle-collapsed"
        onClick={() => setCollapsed(false)}
        title="Ver variables disponibles"
      >
        {'{ }'}
        <span className="flow-vars-toggle-badge">
          {SYSTEM_VARS.length + flowVars.length}
        </span>
      </button>
    )
  }

  return (
    <div className="flow-vars-panel">
      <div className="flow-vars-header">
        <span className="flow-vars-title">{'{ }'} Variables</span>
        <span className="flow-vars-hint">Click para copiar</span>
        <button
          className="flow-vars-close"
          onClick={() => setCollapsed(true)}
        >
          ✕
        </button>
      </div>

      <div className="flow-vars-body">
        {/* Variables del sistema */}
        <div className="flow-vars-section">
          <div className="flow-vars-section-label">Sistema</div>
          {SYSTEM_VARS.map(v => (
            <button
              key={v.nombre}
              className={`flow-vars-item ${copiedVar === v.nombre ? 'flow-vars-item-copied' : ''}`}
              onClick={() => handleCopy(v.nombre)}
              title={v.desc}
            >
              <span className="flow-vars-item-icon">⚙️</span>
              <span className="flow-vars-item-name">{`{{${v.nombre}}}`}</span>
              {copiedVar === v.nombre && <span className="flow-vars-item-check">✓</span>}
            </button>
          ))}
        </div>

        {/* Variables del flujo */}
        <div className="flow-vars-section">
          <div className="flow-vars-section-label">
            Flujo
            {flowVars.length === 0 && <span className="flow-vars-section-empty"> — sin variables aún</span>}
          </div>
          {flowVars.map(v => (
            <button
              key={v.nombre}
              className={`flow-vars-item ${copiedVar === v.nombre ? 'flow-vars-item-copied' : ''}`}
              onClick={() => handleCopy(v.nombre)}
              title={`Origen: ${v.origen}`}
            >
              <span className="flow-vars-item-icon">{v.icon}</span>
              <span className="flow-vars-item-name">{`{{${v.nombre}}}`}</span>
              {copiedVar === v.nombre && <span className="flow-vars-item-check">✓</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
