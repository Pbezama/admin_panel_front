'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { Save, Loader2 } from 'lucide-react'

const SECCIONES = [
  { id: 'prompt_rol', label: 'Rol', placeholder: 'Ej: Atiende consultas de estudiantes y apoderados de manera calida y empatica...', ayuda: 'Define quien es el bot y cual es su funcion principal.' },
  { id: 'prompt_estilo', label: 'Estilo de Respuesta', placeholder: 'Ej: Utiliza un lenguaje natural, chileno, evitando tecnicismos...', ayuda: 'Como debe comunicarse el bot (tono, formato, idioma).' },
  { id: 'prompt_reglas', label: 'Reglas de Comunicacion', placeholder: 'Ej: No menciones precios. No repitas informacion. Usa emojis...', ayuda: 'Reglas estrictas que el bot debe seguir siempre.' },
  { id: 'prompt_consideraciones', label: 'Consideraciones Especificas', placeholder: 'Ej: Para estudiantes Blender, las clases de matematica son presenciales u online...', ayuda: 'Informacion especifica del negocio que el bot debe conocer.' },
  { id: 'prompt_actividades', label: 'Actividades Semanales', placeholder: 'Ej: Semana del 28 de abril\n- Clases anuales sesion n3\n- Charla: El poder de las metas...', ayuda: 'Informacion de actividades de la semana. Se envia como contexto al bot. Dejar vacio si no aplica.' },
]

export default function TabPrompt({ config, setConfig, mostrarMensaje, recargarHistorial }) {
  const [guardando, setGuardando] = useState(false)
  const [seccionActiva, setSeccionActiva] = useState('prompt_rol')
  const [valores, setValores] = useState({
    prompt_rol: config?.prompt_rol || '',
    prompt_estilo: config?.prompt_estilo || '',
    prompt_reglas: config?.prompt_reglas || '',
    prompt_consideraciones: config?.prompt_consideraciones || '',
    prompt_actividades: config?.prompt_actividades || '',
  })

  const handleChange = (campo, valor) => {
    setValores(prev => ({ ...prev, [campo]: valor }))
  }

  const guardar = async () => {
    setGuardando(true)
    try {
      const res = await api.actualizarChatAcademicoConfig({
        ...valores,
        _seccion: 'instrucciones'
      })
      if (res.success) {
        setConfig(res.data)
        mostrarMensaje('Instrucciones guardadas correctamente')
        recargarHistorial()
      } else {
        mostrarMensaje(res.error || 'Error al guardar', 'error')
      }
    } catch (err) {
      mostrarMensaje('Error al guardar instrucciones', 'error')
    } finally {
      setGuardando(false)
    }
  }

  const seccionInfo = SECCIONES.find(s => s.id === seccionActiva)

  return (
    <div className="ca-tab-content">
      <div className="ca-sub-tabs">
        {SECCIONES.map(s => (
          <button
            key={s.id}
            className={`ca-sub-tab ${seccionActiva === s.id ? 'active' : ''}`}
            onClick={() => setSeccionActiva(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="ca-section">
        <div className="ca-section-header">
          <h3>{seccionInfo.label}</h3>
          <p className="ca-section-ayuda">{seccionInfo.ayuda}</p>
        </div>
        <textarea
          className="ca-textarea"
          value={valores[seccionActiva]}
          onChange={(e) => handleChange(seccionActiva, e.target.value)}
          placeholder={seccionInfo.placeholder}
          rows={12}
        />
      </div>

      <div className="ca-actions">
        <button
          className="ca-btn ca-btn-primary"
          onClick={guardar}
          disabled={guardando}
        >
          {guardando ? <><Loader2 className="ca-spinner" size={16} /> Guardando...</> : <><Save size={16} /> Guardar Instrucciones</>}
        </button>
      </div>
    </div>
  )
}
