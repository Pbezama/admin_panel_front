'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

const CATALOGO_TOOLS = [
  { tipo: 'buscar_conocimiento', nombre: 'Buscar en conocimiento', desc: 'Busca informacion en la base de conocimiento de la marca y del agente' },
  { tipo: 'guardar_bd', nombre: 'Guardar en BD', desc: 'Guarda datos del cliente en la base de datos (base_cuentas)' },
  { tipo: 'crear_tarea', nombre: 'Crear tarea', desc: 'Crea una tarea interna para el equipo' },
  { tipo: 'agendar_cita', nombre: 'Agendar cita', desc: 'Crea un evento en Google Calendar' },
  { tipo: 'transferir_humano', nombre: 'Transferir a humano', desc: 'Escala la conversacion a un ejecutivo humano' },
  { tipo: 'finalizar_conversacion', nombre: 'Finalizar conversacion', desc: 'Cierra la conversacion con el cliente' },
  { tipo: 'enviar_mensaje', nombre: 'Enviar mensaje', desc: 'Envia un mensaje intermedio al cliente' },
  { tipo: 'guardar_variable', nombre: 'Guardar variable', desc: 'Almacena un dato en las variables de la conversacion' }
]

const PARAM_TIPOS = ['string', 'number', 'boolean']

export default function TabHerramientas({ agente, onRefresh, mostrarMensaje }) {
  const [catalogo, setCatalogo] = useState([])
  const [customTools, setCustomTools] = useState([])
  const [customAsignadas, setCustomAsignadas] = useState([])
  const [creandoTool, setCreandoTool] = useState(false)
  const [editandoTool, setEditandoTool] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const [toolForm, setToolForm] = useState({
    nombre: '', descripcion: '', endpoint_url: '', metodo_http: 'POST',
    headers: '{}', body_template: '{}',
    parametros: []
  })

  useEffect(() => {
    cargarHerramientas()
  }, [agente?.id])

  const cargarHerramientas = async () => {
    if (!agente?.id) return
    try {
      const [resH, resCustom] = await Promise.all([
        api.getHerramientasAgente(agente.id),
        api.getHerramientasCustom()
      ])

      if (resH.success) {
        setCatalogo(resH.herramientas.catalogo || [])
        setCustomAsignadas((resH.herramientas.custom || []).map(c => c.id_herramienta))
      }
      if (resCustom.success) {
        setCustomTools(resCustom.herramientas || [])
      }
    } catch (err) {
      console.error('Error cargando herramientas:', err)
    }
  }

  const toggleCatalogo = async (tipo) => {
    const item = catalogo.find(h => h.tipo === tipo)
    if (!item) return
    const nuevoEstado = !item.habilitada
    setCatalogo(prev => prev.map(h => h.tipo === tipo ? { ...h, habilitada: nuevoEstado } : h))

    try {
      await api.setHerramientasAgente(agente.id, {
        catalogo: [{ tipo, habilitada: nuevoEstado }]
      })
    } catch (err) {
      setCatalogo(prev => prev.map(h => h.tipo === tipo ? { ...h, habilitada: !nuevoEstado } : h))
    }
  }

  const toggleCustom = async (toolId) => {
    const estaAsignada = customAsignadas.includes(toolId)
    const nuevas = estaAsignada
      ? customAsignadas.filter(id => id !== toolId)
      : [...customAsignadas, toolId]

    setCustomAsignadas(nuevas)

    try {
      await api.setHerramientasAgente(agente.id, { custom_ids: nuevas })
    } catch (err) {
      setCustomAsignadas(prev => prev) // revert
    }
  }

  // Custom tool CRUD
  const resetToolForm = () => {
    setToolForm({
      nombre: '', descripcion: '', endpoint_url: '', metodo_http: 'POST',
      headers: '{}', body_template: '{}', parametros: []
    })
    setCreandoTool(false)
    setEditandoTool(null)
  }

  const addParametro = () => {
    setToolForm(prev => ({
      ...prev,
      parametros: [...prev.parametros, { nombre: '', tipo: 'string', descripcion: '', requerido: true }]
    }))
  }

  const updateParametro = (idx, campo, valor) => {
    setToolForm(prev => ({
      ...prev,
      parametros: prev.parametros.map((p, i) => i === idx ? { ...p, [campo]: valor } : p)
    }))
  }

  const removeParametro = (idx) => {
    setToolForm(prev => ({
      ...prev,
      parametros: prev.parametros.filter((_, i) => i !== idx)
    }))
  }

  const handleGuardarTool = async () => {
    if (!toolForm.nombre || !toolForm.descripcion || !toolForm.endpoint_url) {
      mostrarMensaje('Nombre, descripcion y URL son requeridos', 'error')
      return
    }

    setGuardando(true)
    try {
      let headersJson, bodyJson
      try { headersJson = JSON.parse(toolForm.headers) } catch { headersJson = {} }
      try { bodyJson = JSON.parse(toolForm.body_template) } catch { bodyJson = {} }

      const datos = {
        nombre: toolForm.nombre,
        descripcion: toolForm.descripcion,
        endpoint_url: toolForm.endpoint_url,
        metodo_http: toolForm.metodo_http,
        headers: headersJson,
        body_template: bodyJson,
        parametros: toolForm.parametros
      }

      if (editandoTool) {
        const res = await api.actualizarHerramientaCustom(editandoTool, datos)
        if (res.success) mostrarMensaje('Herramienta actualizada')
      } else {
        const res = await api.crearHerramientaCustom(datos)
        if (res.success) mostrarMensaje('Herramienta creada')
      }

      resetToolForm()
      cargarHerramientas()
    } catch (err) {
      mostrarMensaje('Error al guardar herramienta', 'error')
    } finally {
      setGuardando(false)
    }
  }

  const handleEditarTool = (tool) => {
    setToolForm({
      nombre: tool.nombre,
      descripcion: tool.descripcion,
      endpoint_url: tool.endpoint_url,
      metodo_http: tool.metodo_http || 'POST',
      headers: JSON.stringify(tool.headers || {}, null, 2),
      body_template: JSON.stringify(tool.body_template || {}, null, 2),
      parametros: tool.parametros || []
    })
    setEditandoTool(tool.id)
    setCreandoTool(true)
  }

  const handleEliminarTool = async (id) => {
    if (!confirm('¿Eliminar esta herramienta?')) return
    try {
      await api.eliminarHerramientaCustom(id)
      mostrarMensaje('Herramienta eliminada')
      cargarHerramientas()
    } catch (err) {
      mostrarMensaje('Error al eliminar', 'error')
    }
  }

  const isEnabled = (tipo) => {
    const item = catalogo.find(h => h.tipo === tipo)
    return item ? item.habilitada : true
  }

  return (
    <>
      {/* Herramientas del sistema */}
      <div className="agente-tools-section">
        <h4>Herramientas del sistema</h4>
        <div className="agente-tools-list">
          {CATALOGO_TOOLS.map(tool => (
            <div key={tool.tipo} className="agente-tool-row">
              <div className="agente-tool-info">
                <span className="agente-tool-name">{tool.nombre}</span>
                <span className="agente-tool-desc">{tool.desc}</span>
              </div>
              <button
                className={`agente-toggle ${isEnabled(tool.tipo) ? 'active' : ''}`}
                onClick={() => toggleCatalogo(tool.tipo)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Herramientas custom */}
      <div className="agente-tools-section">
        <h4>Herramientas custom</h4>

        {customTools.length > 0 && (
          <div className="agente-tools-list" style={{ marginBottom: 12 }}>
            {customTools.map(tool => (
              <div key={tool.id} className="agente-custom-tool-card">
                <div className="agente-tool-info">
                  <span className="agente-tool-name">{tool.nombre}</span>
                  <span className="agente-tool-desc">{tool.descripcion}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    className={`agente-toggle ${customAsignadas.includes(tool.id) ? 'active' : ''}`}
                    onClick={() => toggleCustom(tool.id)}
                  />
                  <div className="agente-custom-tool-card-actions">
                    <button onClick={() => handleEditarTool(tool)}>Editar</button>
                    <button onClick={() => handleEliminarTool(tool.id)} style={{ color: '#dc2626' }}>X</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!creandoTool ? (
          <button className="agente-add-param-btn" onClick={() => setCreandoTool(true)}>
            + Crear nueva herramienta
          </button>
        ) : (
          <div className="agente-custom-tool-form">
            <h4>{editandoTool ? 'Editar herramienta' : 'Nueva herramienta custom'}</h4>

            <div className="agentes-form-grid">
              <label className="agente-field">
                <span>Nombre *</span>
                <input value={toolForm.nombre} onChange={e => setToolForm(p => ({ ...p, nombre: e.target.value }))} placeholder="Ej: Consultar horarios" />
              </label>
              <label className="agente-field">
                <span>Metodo HTTP</span>
                <select value={toolForm.metodo_http} onChange={e => setToolForm(p => ({ ...p, metodo_http: e.target.value }))}>
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                </select>
              </label>
              <label className="agente-field agente-field-full">
                <span>Descripcion *</span>
                <input value={toolForm.descripcion} onChange={e => setToolForm(p => ({ ...p, descripcion: e.target.value }))} placeholder="Que hace esta herramienta (la IA usa esta descripcion para decidir cuando usarla)" />
              </label>
              <label className="agente-field agente-field-full">
                <span>Endpoint URL *</span>
                <input value={toolForm.endpoint_url} onChange={e => setToolForm(p => ({ ...p, endpoint_url: e.target.value }))} placeholder="https://api.ejemplo.com/consultar" />
              </label>

              <label className="agente-field">
                <span>Headers (JSON)</span>
                <textarea value={toolForm.headers} onChange={e => setToolForm(p => ({ ...p, headers: e.target.value }))} rows={2} />
              </label>
              <label className="agente-field">
                <span>Body template (JSON)</span>
                <textarea value={toolForm.body_template} onChange={e => setToolForm(p => ({ ...p, body_template: e.target.value }))} rows={2} />
              </label>
            </div>

            {/* Parametros */}
            <div style={{ marginTop: 16 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#475569', textTransform: 'uppercase' }}>Parametros</span>
              {toolForm.parametros.map((param, idx) => (
                <div key={idx} className="agente-param-row">
                  <input placeholder="Nombre" value={param.nombre} onChange={e => updateParametro(idx, 'nombre', e.target.value)} />
                  <select value={param.tipo} onChange={e => updateParametro(idx, 'tipo', e.target.value)}>
                    {PARAM_TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <input placeholder="Descripcion" value={param.descripcion} onChange={e => updateParametro(idx, 'descripcion', e.target.value)} />
                  <label><input type="checkbox" checked={param.requerido} onChange={e => updateParametro(idx, 'requerido', e.target.checked)} /> Req</label>
                  <button className="agente-param-remove" onClick={() => removeParametro(idx)}>X</button>
                </div>
              ))}
              <button className="agente-add-param-btn" onClick={addParametro}>+ Agregar parametro</button>
            </div>

            <div className="agente-custom-form-actions">
              <button className="agentes-btn-cancelar" onClick={resetToolForm}>Cancelar</button>
              <button className="agentes-btn-crear" onClick={handleGuardarTool} disabled={guardando}>
                {guardando ? 'Guardando...' : (editandoTool ? 'Actualizar' : 'Crear herramienta')}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
