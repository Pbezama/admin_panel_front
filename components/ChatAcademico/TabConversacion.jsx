'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { Save, Loader2 } from 'lucide-react'

export default function TabConversacion({ config, setConfig, mostrarMensaje, recargarHistorial }) {
  const [guardando, setGuardando] = useState(false)
  const [valores, setValores] = useState({
    tiempo_espera_respuesta: config?.tiempo_espera_respuesta ?? 120,
    intentos_reactivacion: config?.intentos_reactivacion ?? 1,
    mensaje_reactivacion: config?.mensaje_reactivacion || '',
    mensaje_despedida: config?.mensaje_despedida || '',
    mensaje_timeout: config?.mensaje_timeout || '',
    mensaje_error: config?.mensaje_error || '',
    webhook_derivacion: config?.webhook_derivacion || '',
    webhook_callback: config?.webhook_callback || '',
    temperatura: config?.temperatura ?? 0.7,
    max_tokens: config?.max_tokens ?? 1500,
    parallel_tool_calls: config?.parallel_tool_calls ?? true,
  })

  const handleChange = (campo, valor) => {
    setValores(prev => ({ ...prev, [campo]: valor }))
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

  return (
    <div className="ca-tab-content">
      {/* Tiempos */}
      <div className="ca-section">
        <h3>Tiempos</h3>
        <div className="ca-form-grid">
          <div className="ca-field">
            <label className="ca-label">Tiempo espera respuesta (seg)</label>
            <input
              type="number"
              className="ca-input ca-input-sm"
              value={valores.tiempo_espera_respuesta}
              onChange={e => handleChange('tiempo_espera_respuesta', parseInt(e.target.value) || 0)}
              min={30}
              max={600}
            />
          </div>
          <div className="ca-field">
            <label className="ca-label">Intentos de reactivacion</label>
            <input
              type="number"
              className="ca-input ca-input-sm"
              value={valores.intentos_reactivacion}
              onChange={e => handleChange('intentos_reactivacion', parseInt(e.target.value) || 0)}
              min={0}
              max={5}
            />
          </div>
        </div>
      </div>

      {/* Mensajes */}
      <div className="ca-section">
        <h3>Mensajes</h3>
        <div className="ca-field">
          <label className="ca-label">Mensaje de reactivacion</label>
          <textarea
            className="ca-textarea ca-textarea-sm"
            value={valores.mensaje_reactivacion}
            onChange={e => handleChange('mensaje_reactivacion', e.target.value)}
            placeholder="Ej: Hola? Sigues ahi?"
            rows={2}
          />
        </div>
        <div className="ca-field">
          <label className="ca-label">Mensaje de despedida</label>
          <textarea
            className="ca-textarea ca-textarea-sm"
            value={valores.mensaje_despedida}
            onChange={e => handleChange('mensaje_despedida', e.target.value)}
            placeholder="Ej: Espero haberlo ayudado, nos vemos!"
            rows={2}
          />
        </div>
        <div className="ca-field">
          <label className="ca-label">Mensaje de timeout</label>
          <textarea
            className="ca-textarea ca-textarea-sm"
            value={valores.mensaje_timeout}
            onChange={e => handleChange('mensaje_timeout', e.target.value)}
            placeholder="Ej: Se acabo el tiempo de espera..."
            rows={2}
          />
        </div>
        <div className="ca-field">
          <label className="ca-label">Mensaje de error</label>
          <textarea
            className="ca-textarea ca-textarea-sm"
            value={valores.mensaje_error}
            onChange={e => handleChange('mensaje_error', e.target.value)}
            placeholder="Ej: Lo siento, ocurrio un error..."
            rows={2}
          />
        </div>
      </div>

      {/* Webhooks */}
      <div className="ca-section">
        <h3>Webhooks</h3>
        <div className="ca-field">
          <label className="ca-label">URL Webhook derivacion</label>
          <input
            className="ca-input"
            value={valores.webhook_derivacion}
            onChange={e => handleChange('webhook_derivacion', e.target.value)}
            placeholder="https://..."
          />
        </div>
        <div className="ca-field">
          <label className="ca-label">URL Callback conversacion</label>
          <input
            className="ca-input"
            value={valores.webhook_callback}
            onChange={e => handleChange('webhook_callback', e.target.value)}
            placeholder="https://..."
          />
        </div>
      </div>

      {/* Modelo */}
      <div className="ca-section">
        <h3>Parametros del Modelo</h3>
        <div className="ca-form-grid">
          <div className="ca-field">
            <label className="ca-label">Temperatura ({valores.temperatura})</label>
            <input
              type="range"
              className="ca-range"
              value={valores.temperatura}
              onChange={e => handleChange('temperatura', parseFloat(e.target.value))}
              min={0}
              max={1}
              step={0.1}
            />
          </div>
          <div className="ca-field">
            <label className="ca-label">Max tokens</label>
            <input
              type="number"
              className="ca-input ca-input-sm"
              value={valores.max_tokens}
              onChange={e => handleChange('max_tokens', parseInt(e.target.value) || 500)}
              min={100}
              max={4096}
            />
          </div>
          <div className="ca-field">
            <label className="ca-label">Tool calls en paralelo</label>
            <button
              className={`ca-toggle-field ${valores.parallel_tool_calls ? 'active' : ''}`}
              onClick={() => handleChange('parallel_tool_calls', !valores.parallel_tool_calls)}
            >
              {valores.parallel_tool_calls ? 'Activado' : 'Desactivado'}
            </button>
          </div>
        </div>
      </div>

      <div className="ca-actions">
        <button
          className="ca-btn ca-btn-primary"
          onClick={guardar}
          disabled={guardando}
        >
          {guardando ? <><Loader2 className="ca-spinner" size={16} /> Guardando...</> : <><Save size={16} /> Guardar Parametros</>}
        </button>
      </div>
    </div>
  )
}
