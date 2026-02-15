'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

const TONOS = [
  { id: 'profesional', label: 'Profesional' },
  { id: 'cercano', label: 'Cercano' },
  { id: 'formal', label: 'Formal' },
  { id: 'divertido', label: 'Divertido' },
  { id: 'tecnico', label: 'Tecnico' }
]

export default function TabInstrucciones({ agente, onSave, guardando }) {
  const [form, setForm] = useState({
    nombre: '',
    objetivo: '',
    tono: 'profesional',
    instrucciones: '',
    condiciones_cierre: '',
    temperatura: 0.7,
    max_turnos: 50,
    agentes_delegables: []
  })

  const [agentesDisponibles, setAgentesDisponibles] = useState([])

  useEffect(() => {
    if (agente) {
      setForm({
        nombre: agente.nombre || '',
        objetivo: agente.objetivo || '',
        tono: agente.tono || 'profesional',
        instrucciones: agente.instrucciones || '',
        condiciones_cierre: agente.condiciones_cierre || '',
        temperatura: agente.temperatura ?? 0.7,
        max_turnos: agente.max_turnos || 50,
        agentes_delegables: agente.agentes_delegables || []
      })
    }
  }, [agente])

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await api.getAgentes()
        if (res.success) {
          setAgentesDisponibles(
            (res.agentes || []).filter(a => a.id !== agente?.id && a.estado === 'activo')
          )
        }
      } catch (e) { /* ignore */ }
    }
    cargar()
  }, [agente?.id])

  const actualizar = (campo, valor) => {
    setForm(prev => ({ ...prev, [campo]: valor }))
  }

  const toggleDelegable = (id) => {
    setForm(prev => {
      const lista = prev.agentes_delegables || []
      return {
        ...prev,
        agentes_delegables: lista.includes(id)
          ? lista.filter(x => x !== id)
          : [...lista, id]
      }
    })
  }

  const handleGuardar = () => {
    onSave(form)
  }

  return (
    <>
      <div className="agente-instrucciones-grid">
        <label className="agente-field">
          <span>Nombre</span>
          <input
            value={form.nombre}
            onChange={e => actualizar('nombre', e.target.value)}
            placeholder="Nombre del agente"
          />
        </label>

        <label className="agente-field">
          <span>Tono</span>
          <select value={form.tono} onChange={e => actualizar('tono', e.target.value)}>
            {TONOS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </label>

        <label className="agente-field agente-field-full">
          <span>Objetivo resumido</span>
          <textarea
            value={form.objetivo}
            onChange={e => actualizar('objetivo', e.target.value)}
            placeholder="Ej: Resolver consultas academicas sobre campus, horarios y profesores"
            rows={2}
          />
        </label>

        <label className="agente-field agente-field-full">
          <span>Instrucciones principales</span>
          <textarea
            value={form.instrucciones}
            onChange={e => actualizar('instrucciones', e.target.value)}
            placeholder={`Ej: Eres el encargado academico de la marca. Tu objetivo es ayudar a los alumnos con dudas sobre el campus.\n\n- Primero saluda al alumno y pregunta en que puedes ayudar\n- Busca en tu base de conocimiento para responder preguntas\n- Si no encuentras la respuesta, transfiere a un humano\n- Siempre se amable y paciente`}
            rows={12}
          />
        </label>

        <label className="agente-field agente-field-full">
          <span>Condiciones de cierre</span>
          <textarea
            value={form.condiciones_cierre}
            onChange={e => actualizar('condiciones_cierre', e.target.value)}
            placeholder={`Cierra la conversacion cuando:\n- El cliente confirma que su duda fue resuelta\n- El cliente se despide\n- Han pasado mas de 3 mensajes sin avance relevante`}
            rows={4}
          />
        </label>

        <div className="agente-field">
          <span>Temperatura ({form.temperatura})</span>
          <div className="agente-field-slider">
            <span>0</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={form.temperatura}
              onChange={e => actualizar('temperatura', parseFloat(e.target.value))}
            />
            <span>1</span>
          </div>
        </div>

        <label className="agente-field">
          <span>Maximo turnos</span>
          <input
            type="number"
            min="5"
            max="200"
            value={form.max_turnos}
            onChange={e => actualizar('max_turnos', parseInt(e.target.value) || 50)}
          />
        </label>

        {agentesDisponibles.length > 0 && (
          <div className="agente-field agente-field-full">
            <span>Puede delegar a (click para seleccionar)</span>
            <div className="agente-delegables-list">
              {agentesDisponibles.map(a => (
                <button
                  key={a.id}
                  type="button"
                  className={`agente-delegable-chip ${form.agentes_delegables.includes(a.id) ? 'selected' : ''}`}
                  onClick={() => toggleDelegable(a.id)}
                >
                  {a.icono} {a.nombre}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="agente-save-bar">
        <button className="agentes-btn-crear" onClick={handleGuardar} disabled={guardando}>
          {guardando ? 'Guardando...' : 'Guardar instrucciones'}
        </button>
      </div>
    </>
  )
}
