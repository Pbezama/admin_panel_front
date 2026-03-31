'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { Save, Loader2, Plus, X } from 'lucide-react'

export default function TabConversacion({ config, setConfig, mostrarMensaje, recargarHistorial }) {
  const [guardando, setGuardando] = useState(false)
  const [nuevaPalabraDerivar, setNuevaPalabraDerivar] = useState('')
  const [nuevaPalabraUrgente, setNuevaPalabraUrgente] = useState('')
  const [valores, setValores] = useState({
    tiempo_espera_respuesta: config?.tiempo_espera_respuesta ?? 120,
    intentos_reactivacion: config?.intentos_reactivacion ?? 1,
    buffer_espera_segundos: config?.buffer_espera_segundos ?? 8,
    mensaje_reactivacion: config?.mensaje_reactivacion || '',
    mensaje_despedida: config?.mensaje_despedida || '',
    mensaje_timeout: config?.mensaje_timeout || '',
    mensaje_error: config?.mensaje_error || '',
    mensaje_derivacion: config?.mensaje_derivacion || '',
    webhook_derivacion: config?.webhook_derivacion || '',
    webhook_callback: config?.webhook_callback || '',
    temperatura: config?.temperatura ?? 0.7,
    max_tokens: config?.max_tokens ?? 1500,
    parallel_tool_calls: config?.parallel_tool_calls ?? true,
    max_mensajes_conversacion: config?.max_mensajes_conversacion ?? 60,
    max_tokens_contexto: config?.max_tokens_contexto ?? 100000,
    max_iteraciones_tools: config?.max_iteraciones_tools ?? 3,
    palabras_derivar: config?.palabras_derivar || [],
    palabras_urgente: config?.palabras_urgente || [],
  })

  const handleChange = (campo, valor) => {
    setValores(prev => ({ ...prev, [campo]: valor }))
  }

  const agregarPalabra = (campo, valor, setCampo) => {
    const limpio = valor.trim().toLowerCase()
    if (!limpio) return
    if (valores[campo].includes(limpio)) {
      mostrarMensaje('Esa palabra ya existe', 'error')
      return
    }
    handleChange(campo, [...valores[campo], limpio])
    setCampo('')
  }

  const quitarPalabra = (campo, idx) => {
    handleChange(campo, valores[campo].filter((_, i) => i !== idx))
  }

  const guardar = async () => {
    setGuardando(true)
    try {
      const res = await api.actualizarChatAcademicoConfig({
        ...valores,
        _seccion: 'conversacion'
      })
      if (res.success) {
        setConfig(res.data)
        mostrarMensaje('Parametros de conversacion guardados')
        recargarHistorial()
      } else {
        mostrarMensaje(res.error || 'Error al guardar', 'error')
      }
    } catch (err) {
      mostrarMensaje('Error al guardar parametros', 'error')
    } finally {
      setGuardando(false)
    }
  }

  const tagStyle = {
    display: 'inline-flex', alignItems: 'center', gap: '4px',
    padding: '3px 10px', borderRadius: '12px', fontSize: '12px',
    background: 'rgba(107,159,255,0.12)', color: '#8ba3c7', border: '1px solid rgba(107,159,255,0.2)',
  }
  const tagBtnStyle = {
    background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444',
    padding: '0', display: 'flex', alignItems: 'center',
  }
  const tagsContainerStyle = {
    display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px',
  }

  return (
    <div className="ca-tab-content">
      {/* Tiempos */}
      <div className="ca-section">
        <h3>Tiempos</h3>
        <p className="ca-section-ayuda">Configura los tiempos de espera y el buffer de mensajes del bot.</p>
        <div className="ca-form-grid">
          <div className="ca-field">
            <label className="ca-label">Tiempo espera respuesta (seg)</label>
            <input
              type="number" className="ca-input ca-input-sm"
              value={valores.tiempo_espera_respuesta}
              onChange={e => handleChange('tiempo_espera_respuesta', parseInt(e.target.value) || 0)}
              min={30} max={600}
            />
            <span className="ca-field-hint">Segundos sin respuesta antes de reactivar o cerrar (30-600)</span>
          </div>
          <div className="ca-field">
            <label className="ca-label">Intentos de reactivacion</label>
            <input
              type="number" className="ca-input ca-input-sm"
              value={valores.intentos_reactivacion}
              onChange={e => handleChange('intentos_reactivacion', parseInt(e.target.value) || 0)}
              min={0} max={5}
            />
            <span className="ca-field-hint">Veces que el bot intenta reactivar antes de cerrar (0 = no reactiva)</span>
          </div>
          <div className="ca-field">
            <label className="ca-label">Buffer de mensajes (seg)</label>
            <input
              type="number" className="ca-input ca-input-sm"
              value={valores.buffer_espera_segundos}
              onChange={e => handleChange('buffer_espera_segundos', parseInt(e.target.value) || 5)}
              min={3} max={30}
            />
            <span className="ca-field-hint">Segundos que espera para acumular multiples mensajes antes de procesar (3-30)</span>
          </div>
        </div>
      </div>

      {/* Mensajes */}
      <div className="ca-section">
        <h3>Mensajes del Sistema</h3>
        <p className="ca-section-ayuda">Mensajes automaticos que el bot envia en situaciones especificas. No pasan por el modelo IA.</p>
        <div className="ca-field">
          <label className="ca-label">Mensaje de reactivacion</label>
          <textarea className="ca-textarea ca-textarea-sm" value={valores.mensaje_reactivacion}
            onChange={e => handleChange('mensaje_reactivacion', e.target.value)}
            placeholder="Ej: Hola? Sigues ahi?" rows={2} />
          <span className="ca-field-hint">Se envia cuando el cliente no responde tras el tiempo de espera</span>
        </div>
        <div className="ca-field">
          <label className="ca-label">Mensaje de despedida</label>
          <textarea className="ca-textarea ca-textarea-sm" value={valores.mensaje_despedida}
            onChange={e => handleChange('mensaje_despedida', e.target.value)}
            placeholder="Ej: Espero haberlo ayudado, nos vemos!" rows={2} />
          <span className="ca-field-hint">Se envia al finalizar la conversacion normalmente</span>
        </div>
        <div className="ca-field">
          <label className="ca-label">Mensaje de timeout</label>
          <textarea className="ca-textarea ca-textarea-sm" value={valores.mensaje_timeout}
            onChange={e => handleChange('mensaje_timeout', e.target.value)}
            placeholder="Ej: Se acabo el tiempo de espera..." rows={2} />
          <span className="ca-field-hint">Se envia cuando se agotan los intentos de reactivacion</span>
        </div>
        <div className="ca-field">
          <label className="ca-label">Mensaje de error</label>
          <textarea className="ca-textarea ca-textarea-sm" value={valores.mensaje_error}
            onChange={e => handleChange('mensaje_error', e.target.value)}
            placeholder="Ej: Lo siento, ocurrio un error..." rows={2} />
          <span className="ca-field-hint">Se envia cuando ocurre un error tecnico en el procesamiento</span>
        </div>
        <div className="ca-field">
          <label className="ca-label">Mensaje de derivacion a humano</label>
          <textarea className="ca-textarea ca-textarea-sm" value={valores.mensaje_derivacion}
            onChange={e => handleChange('mensaje_derivacion', e.target.value)}
            placeholder="Ej: Lo siento, no he podido resolver tu consulta. Estoy derivando tu caso..." rows={2} />
          <span className="ca-field-hint">Respuesta de la herramienta derivarConsultaAHumano cuando el bot no puede resolver</span>
        </div>
      </div>

      {/* Deteccion inmediata */}
      <div className="ca-section">
        <h3>Deteccion Inmediata (sin IA)</h3>
        <p className="ca-section-ayuda">Palabras clave que activan derivacion o urgencia SIN pasar por el modelo. Si el mensaje del cliente contiene alguna de estas frases, se ejecuta la accion de inmediato.</p>

        <div className="ca-field" style={{ marginBottom: '20px' }}>
          <label className="ca-label">Palabras de derivacion</label>
          <span className="ca-field-hint" style={{ marginBottom: '6px', display: 'block' }}>Si el cliente dice alguna de estas frases, se deriva a humano sin consultar al modelo. Ej: "hablar con alguien", "derivame"</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input className="ca-input" value={nuevaPalabraDerivar}
              onChange={e => setNuevaPalabraDerivar(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && agregarPalabra('palabras_derivar', nuevaPalabraDerivar, setNuevaPalabraDerivar)}
              placeholder="Escribe una frase y presiona Enter..." />
            <button className="ca-btn ca-btn-secondary" style={{ whiteSpace: 'nowrap' }}
              onClick={() => agregarPalabra('palabras_derivar', nuevaPalabraDerivar, setNuevaPalabraDerivar)}>
              <Plus size={14} /> Agregar
            </button>
          </div>
          <div style={tagsContainerStyle}>
            {valores.palabras_derivar.map((p, i) => (
              <span key={i} style={tagStyle}>
                {p}
                <button style={tagBtnStyle} onClick={() => quitarPalabra('palabras_derivar', i)}><X size={12} /></button>
              </span>
            ))}
          </div>
        </div>

        <div className="ca-field">
          <label className="ca-label">Palabras de urgencia</label>
          <span className="ca-field-hint" style={{ marginBottom: '6px', display: 'block' }}>Si el cliente dice alguna de estas frases, se clasifica como urgente y se deriva inmediatamente. Ej: "no puedo entrar a mi clase", "ya empezo"</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input className="ca-input" value={nuevaPalabraUrgente}
              onChange={e => setNuevaPalabraUrgente(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && agregarPalabra('palabras_urgente', nuevaPalabraUrgente, setNuevaPalabraUrgente)}
              placeholder="Escribe una frase y presiona Enter..." />
            <button className="ca-btn ca-btn-secondary" style={{ whiteSpace: 'nowrap' }}
              onClick={() => agregarPalabra('palabras_urgente', nuevaPalabraUrgente, setNuevaPalabraUrgente)}>
              <Plus size={14} /> Agregar
            </button>
          </div>
          <div style={tagsContainerStyle}>
            {valores.palabras_urgente.map((p, i) => (
              <span key={i} style={{ ...tagStyle, background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                {p}
                <button style={tagBtnStyle} onClick={() => quitarPalabra('palabras_urgente', i)}><X size={12} /></button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Webhooks */}
      <div className="ca-section">
        <h3>Webhooks</h3>
        <p className="ca-section-ayuda">URLs de los endpoints que se invocan al derivar o hacer callback de conversacion.</p>
        <div className="ca-field">
          <label className="ca-label">URL Webhook derivacion</label>
          <input className="ca-input" value={valores.webhook_derivacion}
            onChange={e => handleChange('webhook_derivacion', e.target.value)}
            placeholder="https://flows.messagebird.com/..." />
          <span className="ca-field-hint">Se llama al derivar la conversacion a un humano (MessageBird Flow)</span>
        </div>
        <div className="ca-field">
          <label className="ca-label">URL Callback conversacion</label>
          <input className="ca-input" value={valores.webhook_callback}
            onChange={e => handleChange('webhook_callback', e.target.value)}
            placeholder="https://robotventa-pbezama.pythonanywhere.com/..." />
          <span className="ca-field-hint">Se llama despues de cada intercambio para mantener la conversacion activa</span>
        </div>
      </div>

      {/* Modelo */}
      <div className="ca-section">
        <h3>Parametros del Modelo</h3>
        <p className="ca-section-ayuda">Configuracion del modelo GPT-4o que usa el bot para generar respuestas.</p>
        <div className="ca-form-grid">
          <div className="ca-field">
            <label className="ca-label">Temperatura ({valores.temperatura})</label>
            <input type="range" className="ca-range" value={valores.temperatura}
              onChange={e => handleChange('temperatura', parseFloat(e.target.value))}
              min={0} max={1} step={0.1} />
            <span className="ca-field-hint">0 = respuestas exactas, 1 = mas creativo. Recomendado: 0.5-0.7</span>
          </div>
          <div className="ca-field">
            <label className="ca-label">Max tokens</label>
            <input type="number" className="ca-input ca-input-sm" value={valores.max_tokens}
              onChange={e => handleChange('max_tokens', parseInt(e.target.value) || 500)}
              min={100} max={4096} />
            <span className="ca-field-hint">Longitud maxima de cada respuesta del bot (100-4096)</span>
          </div>
          <div className="ca-field">
            <label className="ca-label">Max mensajes en conversacion</label>
            <input type="number" className="ca-input ca-input-sm" value={valores.max_mensajes_conversacion}
              onChange={e => handleChange('max_mensajes_conversacion', parseInt(e.target.value) || 20)}
              min={10} max={200} />
            <span className="ca-field-hint">Limite de mensajes en el historial antes de comprimir (system + user + assistant + tools)</span>
          </div>
          <div className="ca-field">
            <label className="ca-label">Max tokens de contexto</label>
            <input type="number" className="ca-input ca-input-sm" value={valores.max_tokens_contexto}
              onChange={e => handleChange('max_tokens_contexto', parseInt(e.target.value) || 50000)}
              min={10000} max={128000} step={5000} />
            <span className="ca-field-hint">Limite de tokens antes de comprimir historial. GPT-4o soporta hasta 128K</span>
          </div>
          <div className="ca-field">
            <label className="ca-label">Max iteraciones de tools</label>
            <input type="number" className="ca-input ca-input-sm" value={valores.max_iteraciones_tools}
              onChange={e => handleChange('max_iteraciones_tools', parseInt(e.target.value) || 1)}
              min={1} max={10} />
            <span className="ca-field-hint">Rondas de herramientas antes de forzar respuesta final (1-10)</span>
          </div>
          <div className="ca-field">
            <label className="ca-label">Tool calls en paralelo</label>
            <button className={`ca-toggle-field ${valores.parallel_tool_calls ? 'active' : ''}`}
              onClick={() => handleChange('parallel_tool_calls', !valores.parallel_tool_calls)}>
              {valores.parallel_tool_calls ? 'Activado' : 'Desactivado'}
            </button>
            <span className="ca-field-hint">Permite ejecutar multiples herramientas simultaneamente en una ronda</span>
          </div>
        </div>
      </div>

      <div className="ca-actions">
        <button className="ca-btn ca-btn-primary" onClick={guardar} disabled={guardando}>
          {guardando ? <><Loader2 className="ca-spinner" size={16} /> Guardando...</> : <><Save size={16} /> Guardar Parametros</>}
        </button>
      </div>
    </div>
  )
}
