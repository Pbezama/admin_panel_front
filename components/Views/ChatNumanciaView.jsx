'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import {
  ShoppingBag,
  FileText,
  Wrench,
  Bot,
  Code,
  Sliders,
  Loader2,
  Save,
  Trash2,
  Plus,
  Copy,
  Send,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import '@/styles/ChatNumanciaView.css'

const TABS = [
  { id: 'instrucciones', label: 'Instrucciones', icon: FileText },
  { id: 'comportamiento', label: 'Comportamiento', icon: Sliders },
  { id: 'herramientas', label: 'Herramientas', icon: Wrench },
  { id: 'widget', label: 'Widget Web', icon: Code },
  { id: 'prueba', label: 'Chat de Prueba', icon: Bot },
]

const CHAT_NUMANCIA_URL =
  process.env.NEXT_PUBLIC_CHAT_NUMANCIA_URL || 'https://chat-numancia-api.vercel.app'

export default function ChatNumanciaView() {
  const { marcaActiva } = useAuth()
  const [config, setConfig] = useState(null)
  const [herramientas, setHerramientas] = useState([])
  const [tabActiva, setTabActiva] = useState('instrucciones')
  const [cargando, setCargando] = useState(true)
  const [activando, setActivando] = useState(false)
  const [mensaje, setMensaje] = useState(null)

  useEffect(() => {
    cargarDatos()
  }, [marcaActiva?.id_marca])

  const cargarDatos = async () => {
    setCargando(true)
    try {
      const [resCfg, resTools] = await Promise.all([
        api.getChatNumanciaConfig(),
        api.getChatNumanciaHerramientas(),
      ])
      if (resCfg.success) setConfig(resCfg.data)
      if (resTools.success) setHerramientas(resTools.data || [])
    } catch (e) {
      console.error('Error cargando ChatNumancia:', e)
    } finally {
      setCargando(false)
    }
  }

  const activar = async () => {
    setActivando(true)
    try {
      const res = await api.crearChatNumanciaConfig({})
      if (res.success) {
        notificar('ChatNumancia activado', 'ok')
        await cargarDatos()
      } else {
        notificar(res.error || 'Error al activar', 'err')
      }
    } catch (e) {
      notificar('Error al activar', 'err')
    } finally {
      setActivando(false)
    }
  }

  const notificar = (texto, tipo = 'ok') => {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje(null), 4000)
  }

  if (cargando) {
    return (
      <div className="cn-view">
        <div className="cn-loading">
          <Loader2 className="cn-spin" size={32} />
          <p>Cargando configuración...</p>
        </div>
      </div>
    )
  }

  if (!config) {
    return (
      <div className="cn-view">
        <div className="cn-activar">
          <ShoppingBag size={64} className="cn-activar-icon" />
          <h2>Chat Numancia</h2>
          <p>
            Configura el chatbot de atención para Numancia Sports. Podrás personalizar
            las instrucciones, herramientas y parámetros de conversación desde este
            panel.
          </p>
          <button className="cn-btn cn-btn-primary" onClick={activar} disabled={activando}>
            {activando ? (
              <>
                <Loader2 className="cn-spin" size={16} /> Activando...
              </>
            ) : (
              'Activar Chat Numancia'
            )}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="cn-view">
      {mensaje && <div className={`cn-mensaje cn-mensaje-${mensaje.tipo}`}>{mensaje.texto}</div>}

      <div className="cn-tabs">
        {TABS.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              className={`cn-tab ${tabActiva === tab.id ? 'active' : ''}`}
              onClick={() => setTabActiva(tab.id)}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      <div className="cn-content">
        {tabActiva === 'instrucciones' && (
          <TabInstrucciones config={config} setConfig={setConfig} notificar={notificar} />
        )}
        {tabActiva === 'comportamiento' && (
          <TabComportamiento config={config} setConfig={setConfig} notificar={notificar} />
        )}
        {tabActiva === 'herramientas' && (
          <TabHerramientas
            herramientas={herramientas}
            recargar={cargarDatos}
            notificar={notificar}
          />
        )}
        {tabActiva === 'widget' && (
          <TabWidget config={config} setConfig={setConfig} notificar={notificar} />
        )}
        {tabActiva === 'prueba' && <TabChatPrueba notificar={notificar} />}
      </div>
    </div>
  )
}

// ============================================
// Seccion colapsable reutilizable
// ============================================
function Seccion({ titulo, descripcion, defaultOpen = true, children }) {
  const [abierto, setAbierto] = useState(defaultOpen)
  return (
    <div className="cn-subsec">
      <button className="cn-subsec-head" onClick={() => setAbierto(!abierto)}>
        <div>
          <strong>{titulo}</strong>
          {descripcion && <div className="cn-subsec-desc">{descripcion}</div>}
        </div>
        {abierto ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {abierto && <div className="cn-subsec-body">{children}</div>}
    </div>
  )
}

// ============================================
// Tab: Instrucciones (prompt + conocimiento)
// ============================================
function TabInstrucciones({ config, setConfig, notificar }) {
  const [campos, setCampos] = useState({
    prompt_rol: config.prompt_rol || '',
    prompt_estilo: config.prompt_estilo || '',
    prompt_reglas: config.prompt_reglas || '',
    prompt_consideraciones: config.prompt_consideraciones || '',
    usar_base_cuentas: config.usar_base_cuentas ?? true,
  })
  const [guardando, setGuardando] = useState(false)

  const upd = (k, v) => setCampos((p) => ({ ...p, [k]: v }))

  const guardar = async () => {
    setGuardando(true)
    try {
      const res = await api.actualizarChatNumanciaConfig({ ...campos, _seccion: 'instrucciones' })
      if (res.success) {
        setConfig(res.data)
        notificar('Instrucciones guardadas')
      } else {
        notificar(res.error || 'Error guardando', 'err')
      }
    } catch (e) {
      notificar(e.message || 'Error guardando', 'err')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="cn-section">
      <h3>Instrucciones del chatbot</h3>
      <p className="cn-hint">
        Define el rol, estilo, reglas y consideraciones que el modelo usará como system
        prompt. Las filas activas de <code>base_cuentas</code> se inyectan adicionalmente
        si activas la opción de abajo.
      </p>

      <Seccion titulo="Rol del asistente" descripcion="Quién es el bot y qué objetivo tiene.">
        <textarea
          className="cn-textarea"
          rows={4}
          value={campos.prompt_rol}
          onChange={(e) => upd('prompt_rol', e.target.value)}
          placeholder="Eres el asistente virtual de Numancia Sports..."
        />
      </Seccion>

      <Seccion titulo="Estilo de respuesta" descripcion="Tono, idioma, formato de salida.">
        <textarea
          className="cn-textarea"
          rows={4}
          value={campos.prompt_estilo}
          onChange={(e) => upd('prompt_estilo', e.target.value)}
        />
      </Seccion>

      <Seccion titulo="Reglas de comunicación" descripcion="Qué debe y qué no debe hacer.">
        <textarea
          className="cn-textarea"
          rows={6}
          value={campos.prompt_reglas}
          onChange={(e) => upd('prompt_reglas', e.target.value)}
        />
      </Seccion>

      <Seccion
        titulo="Consideraciones específicas"
        descripcion="Contexto adicional (campañas, productos destacados, restricciones temporales)."
      >
        <textarea
          className="cn-textarea"
          rows={6}
          value={campos.prompt_consideraciones}
          onChange={(e) => upd('prompt_consideraciones', e.target.value)}
        />
      </Seccion>

      <Seccion
        titulo="Base de conocimiento (base_cuentas)"
        descripcion="Inyecta dinámicamente las filas activas de la marca en el system prompt."
      >
        <label className="cn-check">
          <input
            type="checkbox"
            checked={campos.usar_base_cuentas}
            onChange={(e) => upd('usar_base_cuentas', e.target.checked)}
          />
          <span>Inyectar conocimiento de base_cuentas en el prompt</span>
        </label>
        <p className="cn-hint" style={{ marginTop: 8 }}>
          Se agrupan por categoría (prompt, regla, info, observación, promoción) y se
          filtran por vigencia (<code>fecha_inicio</code>, <code>fecha_caducidad</code>).
        </p>
      </Seccion>

      <div className="cn-actions">
        <button className="cn-btn cn-btn-primary" onClick={guardar} disabled={guardando}>
          {guardando ? <Loader2 className="cn-spin" size={16} /> : <Save size={16} />}
          <span>Guardar</span>
        </button>
      </div>
    </div>
  )
}

// ============================================
// Tab: Comportamiento (modelo + conversación + mensajes + webhooks)
// ============================================
function TabComportamiento({ config, setConfig, notificar }) {
  const [campos, setCampos] = useState({
    modelo_ia: config.modelo_ia || 'gpt-4o',
    temperatura: config.temperatura ?? 0.6,
    max_tokens: config.max_tokens ?? 1500,
    parallel_tool_calls: config.parallel_tool_calls ?? true,
    usar_emojis: config.usar_emojis ?? true,
    max_mensajes_conversacion: config.max_mensajes_conversacion ?? 60,
    max_tokens_contexto: config.max_tokens_contexto ?? 100000,
    max_iteraciones_tools: config.max_iteraciones_tools ?? 3,
    tiempo_espera_respuesta: config.tiempo_espera_respuesta ?? 120,
    intentos_reactivacion: config.intentos_reactivacion ?? 1,
    mensaje_bienvenida: config.mensaje_bienvenida || '',
    mensaje_reactivacion: config.mensaje_reactivacion || '',
    mensaje_despedida: config.mensaje_despedida || '',
    mensaje_timeout: config.mensaje_timeout || '',
    mensaje_error: config.mensaje_error || '',
    webhook_derivacion: config.webhook_derivacion || '',
    webhook_callback: config.webhook_callback || '',
    canales_activos: config.canales_activos || ['webchat'],
  })
  const [guardando, setGuardando] = useState(false)

  const upd = (k, v) => setCampos((p) => ({ ...p, [k]: v }))

  const toggleCanal = (canal) => {
    const actual = new Set(campos.canales_activos || [])
    if (actual.has(canal)) actual.delete(canal)
    else actual.add(canal)
    upd('canales_activos', Array.from(actual))
  }

  const guardar = async () => {
    setGuardando(true)
    try {
      const res = await api.actualizarChatNumanciaConfig({
        ...campos,
        _seccion: 'comportamiento',
      })
      if (res.success) {
        setConfig(res.data)
        notificar('Configuración guardada')
      } else {
        notificar(res.error || 'Error guardando', 'err')
      }
    } catch (e) {
      notificar(e.message || 'Error guardando', 'err')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="cn-section">
      <h3>Comportamiento del bot</h3>
      <p className="cn-hint">
        Parámetros del modelo, gestión de contexto, mensajes automáticos y canales
        activos.
      </p>

      <Seccion titulo="Modelo IA" descripcion="Qué modelo usa y con qué creatividad responde.">
        <div className="cn-row">
          <div className="cn-field">
            <label className="cn-label">Modelo</label>
            <select
              className="cn-input"
              value={campos.modelo_ia}
              onChange={(e) => upd('modelo_ia', e.target.value)}
            >
              <option value="gpt-4o">gpt-4o</option>
              <option value="gpt-4o-mini">gpt-4o-mini</option>
              <option value="gpt-4-turbo">gpt-4-turbo</option>
              <option value="gpt-4.1">gpt-4.1</option>
              <option value="gpt-4.1-mini">gpt-4.1-mini</option>
            </select>
          </div>
          <div className="cn-field">
            <label className="cn-label">Temperatura ({campos.temperatura})</label>
            <input
              className="cn-input"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={campos.temperatura}
              onChange={(e) => upd('temperatura', parseFloat(e.target.value))}
            />
            <div className="cn-micro">0 = preciso · 1 = creativo</div>
          </div>
          <div className="cn-field">
            <label className="cn-label">Max tokens por respuesta</label>
            <input
              className="cn-input"
              type="number"
              min="100"
              max="4000"
              value={campos.max_tokens}
              onChange={(e) => upd('max_tokens', parseInt(e.target.value, 10) || 0)}
            />
          </div>
        </div>
      </Seccion>

      <Seccion
        titulo="Memoria y herramientas"
        descripcion="Cuánto historial recuerda y cuántas tool calls seguidas puede hacer."
      >
        <div className="cn-row">
          <div className="cn-field">
            <label className="cn-label">Max mensajes en memoria</label>
            <input
              className="cn-input"
              type="number"
              min="10"
              max="500"
              value={campos.max_mensajes_conversacion}
              onChange={(e) =>
                upd('max_mensajes_conversacion', parseInt(e.target.value, 10) || 0)
              }
            />
          </div>
          <div className="cn-field">
            <label className="cn-label">Max tokens contexto</label>
            <input
              className="cn-input"
              type="number"
              min="10000"
              max="200000"
              step="10000"
              value={campos.max_tokens_contexto}
              onChange={(e) =>
                upd('max_tokens_contexto', parseInt(e.target.value, 10) || 0)
              }
            />
            <div className="cn-micro">Al excederse, comprime el historial con gpt-4o-mini</div>
          </div>
          <div className="cn-field">
            <label className="cn-label">Max iteraciones de tools</label>
            <input
              className="cn-input"
              type="number"
              min="1"
              max="10"
              value={campos.max_iteraciones_tools}
              onChange={(e) =>
                upd('max_iteraciones_tools', parseInt(e.target.value, 10) || 0)
              }
            />
          </div>
        </div>
        <label className="cn-check">
          <input
            type="checkbox"
            checked={campos.parallel_tool_calls}
            onChange={(e) => upd('parallel_tool_calls', e.target.checked)}
          />
          <span>Permitir llamadas a tools en paralelo</span>
        </label>
        <label className="cn-check">
          <input
            type="checkbox"
            checked={campos.usar_emojis}
            onChange={(e) => upd('usar_emojis', e.target.checked)}
          />
          <span>
            Permitir emojis en las respuestas (si está apagado, el bot recibe una
            regla crítica de no usar emojis incluso si la base de conocimiento o las
            herramientas incluyen)
          </span>
        </label>
      </Seccion>

      <Seccion
        titulo="Canales activos"
        descripcion="Por dónde debe responder el bot."
      >
        <div className="cn-canales">
          {['webchat', 'whatsapp', 'instagram'].map((c) => (
            <label key={c} className="cn-canal">
              <input
                type="checkbox"
                checked={(campos.canales_activos || []).includes(c)}
                onChange={() => toggleCanal(c)}
              />
              <span>{c}</span>
            </label>
          ))}
        </div>
      </Seccion>

      <Seccion
        titulo="Timers de conversación"
        descripcion="Cuánto espera el bot por una respuesta antes de reactivar o cerrar."
        defaultOpen={false}
      >
        <div className="cn-row">
          <div className="cn-field">
            <label className="cn-label">Tiempo de espera (seg)</label>
            <input
              className="cn-input"
              type="number"
              min="30"
              max="3600"
              value={campos.tiempo_espera_respuesta}
              onChange={(e) =>
                upd('tiempo_espera_respuesta', parseInt(e.target.value, 10) || 0)
              }
            />
          </div>
          <div className="cn-field">
            <label className="cn-label">Intentos de reactivación</label>
            <input
              className="cn-input"
              type="number"
              min="0"
              max="5"
              value={campos.intentos_reactivacion}
              onChange={(e) =>
                upd('intentos_reactivacion', parseInt(e.target.value, 10) || 0)
              }
            />
          </div>
        </div>
      </Seccion>

      <Seccion
        titulo="Mensajes automáticos"
        descripcion="Textos que envía el bot en momentos clave."
        defaultOpen={false}
      >
        <label className="cn-label">Mensaje de bienvenida (se muestra al abrir el widget)</label>
        <textarea
          className="cn-textarea"
          rows={2}
          value={campos.mensaje_bienvenida}
          onChange={(e) => upd('mensaje_bienvenida', e.target.value)}
        />

        <label className="cn-label">Mensaje de reactivación (cuando el usuario no responde)</label>
        <textarea
          className="cn-textarea"
          rows={2}
          value={campos.mensaje_reactivacion}
          onChange={(e) => upd('mensaje_reactivacion', e.target.value)}
        />

        <label className="cn-label">Mensaje de despedida</label>
        <textarea
          className="cn-textarea"
          rows={2}
          value={campos.mensaje_despedida}
          onChange={(e) => upd('mensaje_despedida', e.target.value)}
        />

        <label className="cn-label">Mensaje de timeout</label>
        <textarea
          className="cn-textarea"
          rows={2}
          value={campos.mensaje_timeout}
          onChange={(e) => upd('mensaje_timeout', e.target.value)}
        />

        <label className="cn-label">Mensaje de error</label>
        <textarea
          className="cn-textarea"
          rows={2}
          value={campos.mensaje_error}
          onChange={(e) => upd('mensaje_error', e.target.value)}
        />
      </Seccion>

      <Seccion
        titulo="Webhooks externos"
        descripcion="URLs a las que se notifica cuando el bot deriva o reactiva."
        defaultOpen={false}
      >
        <label className="cn-label">Webhook de derivación a humano</label>
        <input
          className="cn-input"
          type="url"
          value={campos.webhook_derivacion}
          onChange={(e) => upd('webhook_derivacion', e.target.value)}
          placeholder="https://..."
        />

        <label className="cn-label">Webhook de callback (reactivar conversación)</label>
        <input
          className="cn-input"
          type="url"
          value={campos.webhook_callback}
          onChange={(e) => upd('webhook_callback', e.target.value)}
          placeholder="https://..."
        />
      </Seccion>

      <div className="cn-actions">
        <button className="cn-btn cn-btn-primary" onClick={guardar} disabled={guardando}>
          {guardando ? <Loader2 className="cn-spin" size={16} /> : <Save size={16} />}
          <span>Guardar</span>
        </button>
      </div>
    </div>
  )
}

// ============================================
// Tab: Herramientas
// ============================================
function TabHerramientas({ herramientas, recargar, notificar }) {
  const [editando, setEditando] = useState(null)
  const [creando, setCreando] = useState(false)

  const toggleActivo = async (h) => {
    try {
      await api.actualizarChatNumanciaHerramienta(h.id, { activo: !h.activo })
      notificar(h.activo ? 'Herramienta desactivada' : 'Herramienta activada')
      await recargar()
    } catch (e) {
      notificar(e.message || 'Error', 'err')
    }
  }

  const eliminar = async (h) => {
    if (!confirm(`¿Eliminar la herramienta "${h.nombre}"?`)) return
    try {
      const res = await api.eliminarChatNumanciaHerramienta(h.id)
      if (res.success) {
        notificar('Herramienta eliminada')
        await recargar()
      } else {
        notificar(res.error || 'Error', 'err')
      }
    } catch (e) {
      notificar(e.message || 'Error', 'err')
    }
  }

  return (
    <div className="cn-section">
      <div className="cn-section-head">
        <div>
          <h3>Herramientas (Tools)</h3>
          <p className="cn-hint">
            El modelo puede invocar estas funciones según la conversación. Tipos disponibles:
            respuesta fija, base_cuentas (lee fila por filtro), custom_python, flujo.
          </p>
        </div>
        <button className="cn-btn cn-btn-primary" onClick={() => setCreando(true)}>
          <Plus size={16} /> Nueva
        </button>
      </div>

      <div className="cn-tools-list">
        {herramientas.length === 0 && <p className="cn-empty">Aún no hay herramientas.</p>}
        {herramientas.map((h) => (
          <div key={h.id} className={`cn-tool ${h.activo ? '' : 'cn-tool-off'}`}>
            <div className="cn-tool-head">
              <strong>{h.nombre_display || h.nombre}</strong>
              <span className={`cn-badge cn-badge-${h.tipo}`}>{h.tipo}</span>
              {h.es_semilla && <span className="cn-badge cn-badge-seed">semilla</span>}
            </div>
            <p className="cn-tool-desc">{h.descripcion}</p>
            {h.respuesta_texto && (
              <pre className="cn-tool-preview">{h.respuesta_texto.slice(0, 300)}</pre>
            )}
            <div className="cn-tool-actions">
              <button className="cn-btn cn-btn-sm" onClick={() => setEditando(h)}>
                Editar
              </button>
              <button className="cn-btn cn-btn-sm" onClick={() => toggleActivo(h)}>
                {h.activo ? 'Desactivar' : 'Activar'}
              </button>
              {!h.es_semilla && (
                <button
                  className="cn-btn cn-btn-sm cn-btn-danger"
                  onClick={() => eliminar(h)}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {(editando || creando) && (
        <EditorHerramienta
          herramienta={editando}
          onClose={() => {
            setEditando(null)
            setCreando(false)
          }}
          onGuardar={async () => {
            await recargar()
            setEditando(null)
            setCreando(false)
          }}
          notificar={notificar}
        />
      )}
    </div>
  )
}

function EditorHerramienta({ herramienta, onClose, onGuardar, notificar }) {
  const [datos, setDatos] = useState(
    herramienta || {
      nombre: '',
      nombre_display: '',
      descripcion: '',
      tipo: 'respuesta_fija',
      respuesta_texto: '',
      base_cuentas_filtro: {},
      parametros_openai: { type: 'object', properties: {}, required: [], additionalProperties: false },
      orden: 99,
    }
  )
  const [guardando, setGuardando] = useState(false)

  const upd = (k, v) => setDatos((p) => ({ ...p, [k]: v }))

  const guardar = async () => {
    setGuardando(true)
    try {
      let res
      if (herramienta) {
        res = await api.actualizarChatNumanciaHerramienta(herramienta.id, datos)
      } else {
        res = await api.crearChatNumanciaHerramienta(datos)
      }
      if (res.success || res.data) {
        notificar(herramienta ? 'Herramienta actualizada' : 'Herramienta creada')
        await onGuardar()
      } else {
        notificar(res.error || 'Error', 'err')
      }
    } catch (e) {
      notificar(e.message || 'Error', 'err')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="cn-modal-backdrop" onClick={onClose}>
      <div className="cn-modal" onClick={(e) => e.stopPropagation()}>
        <h3>{herramienta ? 'Editar herramienta' : 'Nueva herramienta'}</h3>
        <label className="cn-label">Nombre (identificador)</label>
        <input
          className="cn-input"
          value={datos.nombre}
          onChange={(e) => upd('nombre', e.target.value)}
          disabled={!!herramienta}
        />
        <label className="cn-label">Nombre visible</label>
        <input
          className="cn-input"
          value={datos.nombre_display}
          onChange={(e) => upd('nombre_display', e.target.value)}
        />
        <label className="cn-label">Descripción (la ve el modelo)</label>
        <textarea
          className="cn-textarea"
          rows={3}
          value={datos.descripcion}
          onChange={(e) => upd('descripcion', e.target.value)}
        />
        <label className="cn-label">Tipo</label>
        <select
          className="cn-input"
          value={datos.tipo}
          onChange={(e) => upd('tipo', e.target.value)}
        >
          <option value="respuesta_fija">respuesta_fija</option>
          <option value="base_cuentas">base_cuentas</option>
          <option value="custom_python">custom_python</option>
          <option value="flujo">flujo</option>
        </select>
        <label className="cn-label">Respuesta / texto</label>
        <textarea
          className="cn-textarea"
          rows={5}
          value={datos.respuesta_texto}
          onChange={(e) => upd('respuesta_texto', e.target.value)}
        />
        {datos.tipo === 'base_cuentas' && (
          <>
            <label className="cn-label">
              Filtro base_cuentas (JSON: categoria, clave)
            </label>
            <textarea
              className="cn-textarea"
              rows={2}
              value={JSON.stringify(datos.base_cuentas_filtro || {}, null, 2)}
              onChange={(e) => {
                try {
                  upd('base_cuentas_filtro', JSON.parse(e.target.value))
                } catch {}
              }}
            />
          </>
        )}
        <label className="cn-label">
          parametros_openai (JSON Schema de argumentos)
        </label>
        <textarea
          className="cn-textarea"
          rows={4}
          value={JSON.stringify(datos.parametros_openai || {}, null, 2)}
          onChange={(e) => {
            try {
              upd('parametros_openai', JSON.parse(e.target.value))
            } catch {}
          }}
        />
        <div className="cn-actions">
          <button className="cn-btn" onClick={onClose}>
            Cancelar
          </button>
          <button className="cn-btn cn-btn-primary" onClick={guardar} disabled={guardando}>
            {guardando ? <Loader2 className="cn-spin" size={16} /> : <Save size={16} />}
            <span>Guardar</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================
// Tab: Widget Web (apariencia + snippet)
// ============================================
function TabWidget({ config, setConfig, notificar }) {
  const [campos, setCampos] = useState({
    widget_activo: config.widget_activo ?? true,
    widget_titulo: config.widget_titulo || 'Numancia Sports',
    widget_color_primario: config.widget_color_primario || '#1a3a6b',
    widget_color_texto_header: config.widget_color_texto_header || '#ffffff',
    widget_posicion: config.widget_posicion || 'bottom-right',
    widget_tamano: config.widget_tamano || 'normal',
    widget_logo_url: config.widget_logo_url || '',
  })
  const [guardando, setGuardando] = useState(false)
  const [copiado, setCopiado] = useState(false)

  const upd = (k, v) => setCampos((p) => ({ ...p, [k]: v }))

  const snippet = `<script src="${CHAT_NUMANCIA_URL}/api/widget.js" data-key="${
    config.api_key || ''
  }" data-api-url="${CHAT_NUMANCIA_URL}"></script>`

  const copiar = () => {
    navigator.clipboard.writeText(snippet)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  const guardar = async () => {
    setGuardando(true)
    try {
      const res = await api.actualizarChatNumanciaConfig({ ...campos, _seccion: 'widget' })
      if (res.success) {
        setConfig(res.data)
        notificar('Widget actualizado')
      } else {
        notificar(res.error || 'Error guardando', 'err')
      }
    } catch (e) {
      notificar(e.message || 'Error guardando', 'err')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="cn-section">
      <h3>Widget para numanciasports.cl</h3>
      <p className="cn-hint">
        Configura cómo se ve el widget embebido en el sitio. Los cambios se reflejan en la
        próxima carga de la página del cliente (widget tiene cache de 60s).
      </p>

      <Seccion titulo="Estado del widget">
        <label className="cn-check">
          <input
            type="checkbox"
            checked={campos.widget_activo}
            onChange={(e) => upd('widget_activo', e.target.checked)}
          />
          <span>Widget activo (si está apagado, no responde mensajes del webchat)</span>
        </label>
      </Seccion>

      <Seccion titulo="Apariencia">
        <div className="cn-row">
          <div className="cn-field">
            <label className="cn-label">Título</label>
            <input
              className="cn-input"
              value={campos.widget_titulo}
              onChange={(e) => upd('widget_titulo', e.target.value)}
            />
          </div>
          <div className="cn-field">
            <label className="cn-label">Posición</label>
            <select
              className="cn-input"
              value={campos.widget_posicion}
              onChange={(e) => upd('widget_posicion', e.target.value)}
            >
              <option value="bottom-right">Abajo derecha</option>
              <option value="bottom-left">Abajo izquierda</option>
            </select>
          </div>
          <div className="cn-field">
            <label className="cn-label">Tamaño</label>
            <select
              className="cn-input"
              value={campos.widget_tamano}
              onChange={(e) => upd('widget_tamano', e.target.value)}
            >
              <option value="pequeno">Pequeño</option>
              <option value="normal">Normal</option>
              <option value="grande">Grande</option>
            </select>
          </div>
        </div>

        <div className="cn-row">
          <div className="cn-field">
            <label className="cn-label">Color primario</label>
            <div className="cn-color-row">
              <input
                type="color"
                value={campos.widget_color_primario}
                onChange={(e) => upd('widget_color_primario', e.target.value)}
                className="cn-color-picker"
              />
              <input
                className="cn-input"
                value={campos.widget_color_primario}
                onChange={(e) => upd('widget_color_primario', e.target.value)}
              />
            </div>
          </div>
          <div className="cn-field">
            <label className="cn-label">Color texto header</label>
            <div className="cn-color-row">
              <input
                type="color"
                value={campos.widget_color_texto_header}
                onChange={(e) => upd('widget_color_texto_header', e.target.value)}
                className="cn-color-picker"
              />
              <input
                className="cn-input"
                value={campos.widget_color_texto_header}
                onChange={(e) => upd('widget_color_texto_header', e.target.value)}
              />
            </div>
          </div>
          <div className="cn-field">
            <label className="cn-label">Logo URL (opcional)</label>
            <input
              className="cn-input"
              type="url"
              value={campos.widget_logo_url}
              onChange={(e) => upd('widget_logo_url', e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="cn-preview">
          <div
            className="cn-preview-header"
            style={{
              background: campos.widget_color_primario,
              color: campos.widget_color_texto_header,
            }}
          >
            {campos.widget_logo_url && (
              <img src={campos.widget_logo_url} className="cn-preview-logo" alt="" />
            )}
            <div>
              <div style={{ fontWeight: 600 }}>{campos.widget_titulo}</div>
              <div style={{ fontSize: 12, opacity: 0.85 }}>En línea</div>
            </div>
          </div>
          <div className="cn-preview-body">
            <div className="cn-preview-msg-bot">
              {config.mensaje_bienvenida || 'Hola, ¿en qué puedo ayudarte?'}
            </div>
            <div
              className="cn-preview-msg-user"
              style={{ background: campos.widget_color_primario, color: campos.widget_color_texto_header }}
            >
              Ejemplo mensaje cliente
            </div>
          </div>
        </div>
      </Seccion>

      <div className="cn-actions">
        <button className="cn-btn cn-btn-primary" onClick={guardar} disabled={guardando}>
          {guardando ? <Loader2 className="cn-spin" size={16} /> : <Save size={16} />}
          <span>Guardar apariencia</span>
        </button>
      </div>

      <Seccion titulo="Código para el sitio" descripcion="Pega este snippet antes de </body> en numanciasports.cl" defaultOpen>
        <label className="cn-label">API Key pública (widget)</label>
        <input className="cn-input" value={config.api_key || '—'} readOnly />

        <label className="cn-label" style={{ marginTop: 12 }}>Snippet HTML</label>
        <pre className="cn-code">{snippet}</pre>
        <button className="cn-btn" onClick={copiar}>
          <Copy size={16} /> <span>{copiado ? '¡Copiado!' : 'Copiar'}</span>
        </button>

        <div className="cn-info-grid">
          <div>
            <strong>URL backend</strong>
            <div>{CHAT_NUMANCIA_URL}</div>
          </div>
          <div>
            <strong>Canales activos</strong>
            <div>{(config.canales_activos || []).join(', ') || '—'}</div>
          </div>
          <div>
            <strong>Widget activo</strong>
            <div>{config.widget_activo ? 'Sí' : 'No'}</div>
          </div>
        </div>
      </Seccion>
    </div>
  )
}

// ============================================
// Tab: Chat de Prueba
// ============================================
function TabChatPrueba({ notificar }) {
  const [mensajes, setMensajes] = useState([])
  const [input, setInput] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [sessionId, setSessionId] = useState(`prueba_${Date.now()}`)
  const listaRef = useRef(null)

  useEffect(() => {
    if (listaRef.current) listaRef.current.scrollTop = listaRef.current.scrollHeight
  }, [mensajes, enviando])

  const enviar = async () => {
    const texto = input.trim()
    if (!texto || enviando) return
    setMensajes((m) => [...m, { from: 'user', texto }])
    setInput('')
    setEnviando(true)
    try {
      const res = await api.probarChatNumancia({ mensaje: texto, session_id: sessionId })
      if (res.success) {
        setMensajes((m) => [...m, { from: 'bot', texto: res.respuesta, estado: res.estado }])
      } else {
        setMensajes((m) => [
          ...m,
          { from: 'bot', texto: res.error || 'Error en el backend', err: true },
        ])
      }
    } catch (e) {
      setMensajes((m) => [...m, { from: 'bot', texto: e.message, err: true }])
    } finally {
      setEnviando(false)
    }
  }

  const reiniciar = () => {
    setMensajes([])
    setSessionId(`prueba_${Date.now()}`)
  }

  return (
    <div className="cn-section cn-chat-prueba">
      <div className="cn-section-head">
        <div>
          <h3>Chat de prueba</h3>
          <p className="cn-hint">
            Envía mensajes reales al backend <code>chat-numancia-api</code> usando la
            configuración actual (herramientas, base_cuentas y persistencia incluidas).
          </p>
        </div>
        <button className="cn-btn cn-btn-sm" onClick={reiniciar}>
          Reiniciar conversación
        </button>
      </div>

      <div className="cn-chat-list" ref={listaRef}>
        {mensajes.length === 0 && <p className="cn-empty">Sin mensajes todavía.</p>}
        {mensajes.map((m, i) => (
          <div key={i} className={`cn-msg cn-msg-${m.from} ${m.err ? 'cn-msg-err' : ''}`}>
            {m.texto}
            {m.estado && m.estado !== 'activa' && (
              <span className="cn-msg-estado">{m.estado}</span>
            )}
          </div>
        ))}
        {enviando && (
          <div className="cn-msg cn-msg-bot cn-msg-typing">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
      </div>

      <div className="cn-chat-input-row">
        <textarea
          className="cn-textarea"
          rows={2}
          placeholder="Escribe un mensaje de prueba..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              enviar()
            }
          }}
        />
        <button
          className="cn-btn cn-btn-primary"
          onClick={enviar}
          disabled={enviando || !input.trim()}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}
