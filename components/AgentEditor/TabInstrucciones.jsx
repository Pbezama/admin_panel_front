'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

const MODELOS = [
  { id: 'gpt-4o-mini', label: 'GPT-4o Mini (rapido, economico)' },
  { id: 'gpt-4o', label: 'GPT-4o (potente)' },
  { id: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  { id: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (basico)' }
]

const IDIOMAS = [
  'espanol', 'ingles', 'portugues', 'frances', 'aleman', 'italiano', 'chino', 'japones', 'coreano', 'arabe'
]

const SECCIONES = [
  { id: 'identidad', label: 'Identidad' },
  { id: 'comportamiento', label: 'Comportamiento' },
  { id: 'mensajes', label: 'Mensajes' },
  { id: 'avanzado', label: 'Avanzado' }
]

export default function TabInstrucciones({ agente, onSave, guardando }) {
  const [form, setForm] = useState({
    nombre: '',
    objetivo: '',
    tono: 'profesional',
    personalidad: '',
    instrucciones: '',
    reglas: '',
    restricciones: '',
    formato_respuesta: '',
    ejemplos: '',
    idioma: 'espanol',
    condiciones_cierre: '',
    mensaje_bienvenida: '',
    mensaje_despedida: '',
    mensaje_error: '',
    mensaje_fuera_tema: '',
    mensaje_transferencia: '',
    mensaje_limite_turnos: '',
    temperatura: 0.7,
    modelo: 'gpt-4o-mini',
    max_turnos: 50,
    max_tokens: 800,
    max_historial: 20,
    max_conocimiento: 15,
    prompt_sistema_custom: '',
    agentes_delegables: []
  })

  const [seccionActiva, setSeccionActiva] = useState('identidad')
  const [agentesDisponibles, setAgentesDisponibles] = useState([])
  const [usarPromptCustom, setUsarPromptCustom] = useState(false)
  const [mostrarPreview, setMostrarPreview] = useState(false)

  useEffect(() => {
    if (agente) {
      const f = {
        nombre: agente.nombre || '',
        objetivo: agente.objetivo || '',
        tono: agente.tono || 'profesional',
        personalidad: agente.personalidad || '',
        instrucciones: agente.instrucciones || '',
        reglas: agente.reglas || '',
        restricciones: agente.restricciones || '',
        formato_respuesta: agente.formato_respuesta || '',
        ejemplos: agente.ejemplos || '',
        idioma: agente.idioma || 'espanol',
        condiciones_cierre: agente.condiciones_cierre || '',
        mensaje_bienvenida: agente.mensaje_bienvenida || '',
        mensaje_despedida: agente.mensaje_despedida || '',
        mensaje_error: agente.mensaje_error || '',
        mensaje_fuera_tema: agente.mensaje_fuera_tema || '',
        mensaje_transferencia: agente.mensaje_transferencia || '',
        mensaje_limite_turnos: agente.mensaje_limite_turnos || '',
        temperatura: agente.temperatura ?? 0.7,
        modelo: agente.modelo || 'gpt-4o-mini',
        max_turnos: agente.max_turnos || 50,
        max_tokens: agente.max_tokens || 800,
        max_historial: agente.max_historial || 20,
        max_conocimiento: agente.max_conocimiento || 15,
        prompt_sistema_custom: agente.prompt_sistema_custom || '',
        agentes_delegables: agente.agentes_delegables || []
      }
      setForm(f)
      setUsarPromptCustom(!!agente.prompt_sistema_custom)
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
    const datos = { ...form }
    if (!usarPromptCustom) {
      datos.prompt_sistema_custom = ''
    }
    onSave(datos)
  }

  // Generar preview del prompt
  const generarPreview = () => {
    if (usarPromptCustom && form.prompt_sistema_custom) {
      return form.prompt_sistema_custom
    }
    let p = `Eres ${form.nombre || 'un asistente'}.`
    if (form.objetivo) p += `\n\nOBJETIVO: ${form.objetivo}`
    if (form.personalidad) {
      p += `\n\nPERSONALIDAD:\n${form.personalidad}`
    } else if (form.tono) {
      p += `\n\nTONO: Debes comunicarte de forma ${form.tono}.`
    }
    if (form.idioma && form.idioma !== 'espanol') p += `\n\nIDIOMA: Debes responder siempre en ${form.idioma}.`
    if (form.instrucciones) p += `\n\nINSTRUCCIONES:\n${form.instrucciones}`
    if (form.reglas) p += `\n\nREGLAS (debes cumplir SIEMPRE):\n${form.reglas}`
    if (form.restricciones) p += `\n\nRESTRICCIONES (NUNCA hagas esto):\n${form.restricciones}`
    if (form.formato_respuesta) p += `\n\nFORMATO DE RESPUESTA:\n${form.formato_respuesta}`
    if (form.mensaje_fuera_tema) p += `\n\nSi te preguntan algo fuera de tu alcance, responde: ${form.mensaje_fuera_tema}`
    if (form.ejemplos) p += `\n\nEJEMPLOS DE CONVERSACION:\n${form.ejemplos}`
    if (form.condiciones_cierre) p += `\n\nCondiciones para finalizar:\n${form.condiciones_cierre}`
    return p
  }

  return (
    <>
      {/* Sub-navegacion de secciones */}
      <div className="agente-secciones-bar">
        {SECCIONES.map(s => (
          <button
            key={s.id}
            className={`agente-seccion-btn ${seccionActiva === s.id ? 'active' : ''}`}
            onClick={() => setSeccionActiva(s.id)}
          >
            {s.label}
          </button>
        ))}
        <button
          className={`agente-seccion-btn agente-seccion-preview ${mostrarPreview ? 'active' : ''}`}
          onClick={() => setMostrarPreview(!mostrarPreview)}
        >
          Vista previa
        </button>
      </div>

      {/* Preview del prompt */}
      {mostrarPreview && (
        <div className="agente-prompt-preview">
          <div className="agente-prompt-preview-header">
            <span>Prompt del sistema generado</span>
            <span className="agente-prompt-preview-chars">{generarPreview().length} caracteres</span>
          </div>
          <pre className="agente-prompt-preview-text">{generarPreview()}</pre>
        </div>
      )}

      {/* ══════ SECCION: IDENTIDAD ══════ */}
      {seccionActiva === 'identidad' && (
        <div className="agente-config-section">
          <div className="agente-config-section-header">
            <h4>Identidad del agente</h4>
            <p>Define quien es tu agente, su personalidad y como se presenta</p>
          </div>

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
              <span>Idioma</span>
              <select value={form.idioma} onChange={e => actualizar('idioma', e.target.value)}>
                {IDIOMAS.map(i => <option key={i} value={i}>{i.charAt(0).toUpperCase() + i.slice(1)}</option>)}
              </select>
            </label>

            <label className="agente-field agente-field-full">
              <span>Objetivo principal</span>
              <textarea
                value={form.objetivo}
                onChange={e => actualizar('objetivo', e.target.value)}
                placeholder="Ej: Resolver consultas academicas sobre campus, horarios y profesores"
                rows={2}
              />
            </label>

            <label className="agente-field agente-field-full">
              <span>Personalidad (describe libremente como es tu agente)</span>
              <textarea
                value={form.personalidad}
                onChange={e => actualizar('personalidad', e.target.value)}
                placeholder={`Ej: Eres amable, paciente y empatico. Usas un lenguaje cercano pero profesional. Te gusta usar analogias para explicar conceptos complejos. Siempre muestras entusiasmo por ayudar. Evitas ser demasiado formal o robotico.`}
                rows={4}
              />
              <span className="agente-field-hint">Si esta vacio, se usara el tono seleccionado abajo como fallback</span>
            </label>

            {!form.personalidad && (
              <label className="agente-field">
                <span>Tono (fallback si no defines personalidad)</span>
                <select value={form.tono} onChange={e => actualizar('tono', e.target.value)}>
                  <option value="profesional">Profesional</option>
                  <option value="cercano">Cercano</option>
                  <option value="formal">Formal</option>
                  <option value="divertido">Divertido</option>
                  <option value="tecnico">Tecnico</option>
                </select>
              </label>
            )}
          </div>
        </div>
      )}

      {/* ══════ SECCION: COMPORTAMIENTO ══════ */}
      {seccionActiva === 'comportamiento' && (
        <div className="agente-config-section">
          <div className="agente-config-section-header">
            <h4>Comportamiento</h4>
            <p>Define como actua tu agente: instrucciones, reglas, restricciones y ejemplos</p>
          </div>

          <div className="agente-instrucciones-grid">
            <label className="agente-field agente-field-full">
              <span>Instrucciones principales</span>
              <textarea
                value={form.instrucciones}
                onChange={e => actualizar('instrucciones', e.target.value)}
                placeholder={`Ej:\n- Primero saluda al alumno y pregunta en que puedes ayudar\n- Busca en tu base de conocimiento para responder preguntas\n- Si no encuentras la respuesta, transfiere a un humano\n- Siempre se amable y paciente\n- Confirma que la duda fue resuelta antes de cerrar`}
                rows={10}
              />
            </label>

            <label className="agente-field agente-field-full">
              <span>Reglas obligatorias (el agente SIEMPRE cumplira estas reglas)</span>
              <textarea
                value={form.reglas}
                onChange={e => actualizar('reglas', e.target.value)}
                placeholder={`Ej:\n- Siempre pedir el nombre del cliente antes de continuar\n- Nunca inventar informacion, solo usar la base de conocimiento\n- Siempre confirmar datos antes de agendar una cita\n- Responder en maximo 3 parrafos\n- Siempre despedirse de forma cordial`}
                rows={6}
              />
            </label>

            <label className="agente-field agente-field-full">
              <span>Restricciones (lo que NUNCA debe hacer o decir)</span>
              <textarea
                value={form.restricciones}
                onChange={e => actualizar('restricciones', e.target.value)}
                placeholder={`Ej:\n- No hablar de precios ni hacer cotizaciones\n- No dar opiniones personales sobre la competencia\n- No compartir datos internos de la empresa\n- No prometer plazos de entrega especificos\n- No usar lenguaje coloquial o jerga`}
                rows={6}
              />
            </label>

            <label className="agente-field agente-field-full">
              <span>Formato de respuesta</span>
              <textarea
                value={form.formato_respuesta}
                onChange={e => actualizar('formato_respuesta', e.target.value)}
                placeholder={`Ej:\n- Respuestas cortas de maximo 2-3 oraciones\n- Usar viñetas para listar opciones\n- Incluir emojis relevantes al contexto\n- Terminar cada respuesta con una pregunta de seguimiento`}
                rows={4}
              />
            </label>

            <label className="agente-field agente-field-full">
              <span>Ejemplos de conversacion (ayudan al agente a entender el estilo esperado)</span>
              <textarea
                value={form.ejemplos}
                onChange={e => actualizar('ejemplos', e.target.value)}
                placeholder={`Ej:\nCliente: Hola, quiero saber los horarios\nAgente: Hola! Con gusto te ayudo. Que programa o curso te interesa? Asi puedo darte los horarios exactos.\n\nCliente: La carrera de ingenieria\nAgente: La carrera de Ingenieria tiene clases de lunes a viernes. El turno manana es de 8:00 a 12:00 y el turno tarde de 14:00 a 18:00. Te gustaria saber mas detalles?`}
                rows={8}
              />
            </label>

            <label className="agente-field agente-field-full">
              <span>Condiciones de cierre (cuando debe terminar la conversacion)</span>
              <textarea
                value={form.condiciones_cierre}
                onChange={e => actualizar('condiciones_cierre', e.target.value)}
                placeholder={`Ej:\n- El cliente confirma que su duda fue resuelta\n- El cliente se despide\n- Han pasado mas de 3 mensajes sin avance\n- El cliente pide hablar con un humano`}
                rows={4}
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
        </div>
      )}

      {/* ══════ SECCION: MENSAJES ══════ */}
      {seccionActiva === 'mensajes' && (
        <div className="agente-config-section">
          <div className="agente-config-section-header">
            <h4>Mensajes personalizados</h4>
            <p>Configura los mensajes automaticos del agente para cada situacion. Puedes usar variables como {'{{nombre}}'}, {'{{fecha_actual}}'}, {'{{hora_actual}}'}</p>
          </div>

          <div className="agente-instrucciones-grid">
            <label className="agente-field agente-field-full">
              <span>Mensaje de bienvenida (primer contacto, antes de la IA)</span>
              <textarea
                value={form.mensaje_bienvenida}
                onChange={e => actualizar('mensaje_bienvenida', e.target.value)}
                placeholder="Ej: Hola! Soy el asistente virtual de la marca. En que puedo ayudarte hoy?"
                rows={3}
              />
              <span className="agente-field-hint">Se envia automaticamente cuando el agente inicia. Dejar vacio para que la IA genere su propia bienvenida.</span>
            </label>

            <label className="agente-field agente-field-full">
              <span>Mensaje de despedida</span>
              <textarea
                value={form.mensaje_despedida}
                onChange={e => actualizar('mensaje_despedida', e.target.value)}
                placeholder="Ej: Fue un placer ayudarte! Si necesitas algo mas, no dudes en escribirnos. Hasta pronto!"
                rows={2}
              />
            </label>

            <label className="agente-field agente-field-full">
              <span>Mensaje de error (cuando algo falla)</span>
              <textarea
                value={form.mensaje_error}
                onChange={e => actualizar('mensaje_error', e.target.value)}
                placeholder="Ej: Disculpa, tuve un problema tecnico. Puedes intentar de nuevo o escribir 'hablar con humano' para que te atienda una persona."
                rows={2}
              />
            </label>

            <label className="agente-field agente-field-full">
              <span>Mensaje fuera de tema (cuando preguntan algo que no le compete)</span>
              <textarea
                value={form.mensaje_fuera_tema}
                onChange={e => actualizar('mensaje_fuera_tema', e.target.value)}
                placeholder="Ej: Disculpa, eso esta fuera de mi area. Solo puedo ayudarte con temas academicos. Quieres que te conecte con alguien que pueda ayudarte?"
                rows={2}
              />
              <span className="agente-field-hint">Esta instruccion se incluye en el prompt del agente para que responda asi ante temas fuera de su alcance.</span>
            </label>

            <label className="agente-field agente-field-full">
              <span>Mensaje al transferir a humano</span>
              <textarea
                value={form.mensaje_transferencia}
                onChange={e => actualizar('mensaje_transferencia', e.target.value)}
                placeholder="Ej: Te voy a conectar con una persona de nuestro equipo que podra ayudarte mejor. Un momento por favor."
                rows={2}
              />
            </label>

            <label className="agente-field agente-field-full">
              <span>Mensaje al alcanzar limite de turnos</span>
              <textarea
                value={form.mensaje_limite_turnos}
                onChange={e => actualizar('mensaje_limite_turnos', e.target.value)}
                placeholder="Ej: Hemos llegado al limite de esta conversacion. Si aun necesitas ayuda, por favor inicia una nueva conversacion."
                rows={2}
              />
              <span className="agente-field-hint">Se envia cuando se alcanza el maximo de turnos configurado. Dejar vacio para usar un mensaje por defecto.</span>
            </label>
          </div>
        </div>
      )}

      {/* ══════ SECCION: AVANZADO ══════ */}
      {seccionActiva === 'avanzado' && (
        <div className="agente-config-section">
          <div className="agente-config-section-header">
            <h4>Configuracion avanzada</h4>
            <p>Parametros tecnicos del modelo de IA y limites de operacion</p>
          </div>

          <div className="agente-instrucciones-grid">
            <label className="agente-field">
              <span>Modelo de IA</span>
              <select value={form.modelo} onChange={e => actualizar('modelo', e.target.value)}>
                {MODELOS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
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
              <span className="agente-field-hint">0 = preciso y consistente, 1 = creativo y variado</span>
            </div>

            <label className="agente-field">
              <span>Max tokens por respuesta</span>
              <input
                type="number"
                min="100"
                max="4000"
                step="100"
                value={form.max_tokens}
                onChange={e => actualizar('max_tokens', parseInt(e.target.value) || 800)}
              />
              <span className="agente-field-hint">Largo maximo de cada respuesta del agente (100-4000)</span>
            </label>

            <label className="agente-field">
              <span>Maximo turnos de conversacion</span>
              <input
                type="number"
                min="5"
                max="500"
                value={form.max_turnos}
                onChange={e => actualizar('max_turnos', parseInt(e.target.value) || 50)}
              />
              <span className="agente-field-hint">Turnos antes de cerrar automaticamente</span>
            </label>

            <label className="agente-field">
              <span>Mensajes de historial (contexto)</span>
              <input
                type="number"
                min="5"
                max="100"
                value={form.max_historial}
                onChange={e => actualizar('max_historial', parseInt(e.target.value) || 20)}
              />
              <span className="agente-field-hint">Cuantos mensajes previos incluir como contexto</span>
            </label>

            <label className="agente-field">
              <span>Fragmentos de conocimiento</span>
              <input
                type="number"
                min="5"
                max="50"
                value={form.max_conocimiento}
                onChange={e => actualizar('max_conocimiento', parseInt(e.target.value) || 15)}
              />
              <span className="agente-field-hint">Cuantos fragmentos de la base de conocimiento incluir</span>
            </label>

            {/* Prompt custom override */}
            <div className="agente-field agente-field-full">
              <div className="agente-prompt-custom-toggle">
                <label className="agente-toggle-label">
                  <button
                    type="button"
                    className={`agente-toggle ${usarPromptCustom ? 'active' : ''}`}
                    onClick={() => setUsarPromptCustom(!usarPromptCustom)}
                  />
                  <span>Usar prompt de sistema personalizado (override completo)</span>
                </label>
                {usarPromptCustom && (
                  <span className="agente-field-hint agente-field-hint-warning">
                    Al activar esto, se ignoran todos los campos de arriba (personalidad, reglas, etc.) y se usa SOLO este prompt.
                  </span>
                )}
              </div>
            </div>

            {usarPromptCustom && (
              <label className="agente-field agente-field-full">
                <span>Prompt de sistema completo</span>
                <textarea
                  value={form.prompt_sistema_custom}
                  onChange={e => actualizar('prompt_sistema_custom', e.target.value)}
                  placeholder="Escribe el prompt de sistema completo que quieres usar. Esto reemplaza TODA la configuracion de identidad y comportamiento."
                  rows={16}
                  className="agente-textarea-monospace"
                />
                <span className="agente-field-hint">{form.prompt_sistema_custom.length} caracteres</span>
              </label>
            )}
          </div>
        </div>
      )}

      <div className="agente-save-bar">
        <button className="agentes-btn-crear" onClick={handleGuardar} disabled={guardando}>
          {guardando ? 'Guardando...' : 'Guardar configuracion'}
        </button>
      </div>
    </>
  )
}
