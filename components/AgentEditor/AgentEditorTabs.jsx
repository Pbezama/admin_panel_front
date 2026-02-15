'use client'

import { useState } from 'react'
import TabInstrucciones from './TabInstrucciones'
import TabHerramientas from './TabHerramientas'
import TabConocimiento from './TabConocimiento'
import TabMonitoreo from './TabMonitoreo'

const TABS = [
  { id: 'instrucciones', label: 'Instrucciones' },
  { id: 'herramientas', label: 'Herramientas' },
  { id: 'conocimiento', label: 'Conocimiento' },
  { id: 'monitoreo', label: 'Monitoreo' }
]

export default function AgentEditorTabs({ agente, onSave, guardando, onRefresh, mostrarMensaje }) {
  const [tabActivo, setTabActivo] = useState('instrucciones')

  return (
    <div className="agente-editor-tabs">
      <div className="agente-tabs-bar">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`agente-tab-btn ${tabActivo === tab.id ? 'active' : ''}`}
            onClick={() => setTabActivo(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="agente-tab-content">
        {tabActivo === 'instrucciones' && (
          <TabInstrucciones agente={agente} onSave={onSave} guardando={guardando} />
        )}
        {tabActivo === 'herramientas' && (
          <TabHerramientas agente={agente} onRefresh={onRefresh} mostrarMensaje={mostrarMensaje} />
        )}
        {tabActivo === 'conocimiento' && (
          <TabConocimiento agente={agente} onRefresh={onRefresh} mostrarMensaje={mostrarMensaje} />
        )}
        {tabActivo === 'monitoreo' && (
          <TabMonitoreo agente={agente} mostrarMensaje={mostrarMensaje} />
        )}
      </div>
    </div>
  )
}
