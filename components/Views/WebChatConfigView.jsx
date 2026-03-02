'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useView } from '@/context/ViewContext'
import { api } from '@/lib/api'
import {
  Globe,
  Copy,
  Check,
  RefreshCw,
  Eye,
  Palette,
  Clock,
  Code,
  Key,
  ArrowLeft,
  Save,
  AlertTriangle,
  MessageCircle
} from 'lucide-react'
import '@/styles/WebChatConfigView.css'

export default function WebChatConfigView() {
  const { usuario, marcaActiva } = useAuth()
  const { navegarA } = useView()

  const [config, setConfig] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  const [copiado, setCopiado] = useState(null)
  const [mostrarConfirmRegen, setMostrarConfirmRegen] = useState(false)
  const [previewAbierto, setPreviewAbierto] = useState(false)

  // Formulario
  const [form, setForm] = useState({
    activo: true,
    color_primario: '#2d3a5c',
    color_texto_header: '#ffffff',
    logo_url: '',
    posicion: 'bottom-right',
    tamano: 'normal',
    titulo_chat: 'Chat',
    mensaje_bienvenida: '',
    horario_activo: false,
    horario_inicio: '09:00',
    horario_fin: '18:00',
    horario_zona: 'America/Santiago',
    mensaje_fuera_horario: 'Estamos fuera de horario. Te responderemos pronto.'
  })

  useEffect(() => {
    cargarConfig()
  }, [marcaActiva?.id_marca])

  const cargarConfig = async () => {
    setCargando(true)
    try {
      const resultado = await api.getWebChatConfig()
      if (resultado.success && resultado.data) {
        setConfig(resultado.data)
        setForm({
          activo: resultado.data.activo ?? true,
          color_primario: resultado.data.color_primario || '#2d3a5c',
          color_texto_header: resultado.data.color_texto_header || '#ffffff',
          logo_url: resultado.data.logo_url || '',
          posicion: resultado.data.posicion || 'bottom-right',
          tamano: resultado.data.tamano || 'normal',
          titulo_chat: resultado.data.titulo_chat || 'Chat',
          mensaje_bienvenida: resultado.data.mensaje_bienvenida || '',
          horario_activo: resultado.data.horario_activo || false,
          horario_inicio: resultado.data.horario_inicio || '09:00',
          horario_fin: resultado.data.horario_fin || '18:00',
          horario_zona: resultado.data.horario_zona || 'America/Santiago',
          mensaje_fuera_horario: resultado.data.mensaje_fuera_horario || 'Estamos fuera de horario. Te responderemos pronto.'
        })
      }
    } catch (error) {
      console.error('Error cargando config webchat:', error)
    }
    setCargando(false)
  }

  const crearConfig = async () => {
    setGuardando(true)
    try {
      const resultado = await api.crearWebChatConfig(form)
      if (resultado.success) {
        setConfig(resultado.data)
        mostrarMsg('Widget creado exitosamente', 'success')
      } else {
        mostrarMsg(resultado.error || 'Error al crear', 'error')
      }
    } catch (error) {
      mostrarMsg('Error al crear: ' + error.message, 'error')
    }
    setGuardando(false)
  }

  const guardarConfig = async () => {
    setGuardando(true)
    try {
      const resultado = await api.actualizarWebChatConfig(form)
      if (resultado.success) {
        setConfig(resultado.data)
        mostrarMsg('Configuracion guardada', 'success')
      } else {
        mostrarMsg(resultado.error || 'Error al guardar', 'error')
      }
    } catch (error) {
      mostrarMsg('Error al guardar: ' + error.message, 'error')
    }
    setGuardando(false)
  }

  const regenerarKey = async () => {
    try {
      const resultado = await api.regenerarWebChatKey()
      if (resultado.success) {
        setConfig(resultado.data)
        mostrarMsg('API Key regenerada. El snippet anterior dejara de funcionar.', 'success')
      } else {
        mostrarMsg(resultado.error || 'Error al regenerar', 'error')
      }
    } catch (error) {
      mostrarMsg('Error al regenerar: ' + error.message, 'error')
    }
    setMostrarConfirmRegen(false)
  }

  const mostrarMsg = (texto, tipo = 'success') => {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje(null), 4000)
  }

  const copiar = async (texto, id) => {
    try {
      await navigator.clipboard.writeText(texto)
      setCopiado(id)
      setTimeout(() => setCopiado(null), 2000)
    } catch (e) {
      mostrarMsg('Error al copiar', 'error')
    }
  }

  const apiUrl = typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001')
    : ''

  const snippet = config?.api_key
    ? `<script src="${apiUrl}/api/webchat/widget.js" data-key="${config.api_key}"></script>`
    : ''

  if (cargando) {
    return (
      <div className="webchat-view">
        <div className="webchat-loading">
          <div className="webchat-loading-spinner" />
          <span>Cargando configuracion...</span>
        </div>
      </div>
    )
  }

  // Si no hay config, mostrar pantalla de creacion
  if (!config) {
    return (
      <div className="webchat-view">
        <div className="webchat-empty">
          <div className="webchat-empty-icon">
            <Globe size={48} />
          </div>
          <h2>Chat Web</h2>
          <p>Agrega un widget de chat a cualquier sitio web para que tus clientes puedan interactuar con tus flujos conversacionales.</p>
          <button className="btn-primary" onClick={crearConfig} disabled={guardando}>
            {guardando ? 'Creando...' : 'Activar Chat Web'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="webchat-view">
      {/* Toast */}
      {mensaje && (
        <div className={`webchat-toast ${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}

      {/* Header */}
      <div className="webchat-header">
        <div className="webchat-header-left">
          <h2><Globe size={20} /> Chat Web</h2>
          <span className={`webchat-status-badge ${config.activo ? 'activo' : 'inactivo'}`}>
            {config.activo ? 'Activo' : 'Inactivo'}
          </span>
        </div>
        <div className="webchat-header-right">
          <button
            className="btn-secondary"
            onClick={() => setPreviewAbierto(!previewAbierto)}
          >
            <Eye size={16} />
            {previewAbierto ? 'Ocultar Preview' : 'Preview'}
          </button>
          <button
            className="btn-primary"
            onClick={guardarConfig}
            disabled={guardando}
          >
            <Save size={16} />
            {guardando ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>

      <div className="webchat-content">
        <div className="webchat-grid">
          {/* Columna principal */}
          <div className="webchat-main">

            {/* Seccion: Snippet */}
            <div className="webchat-card">
              <div className="webchat-card-header">
                <Code size={18} />
                <h3>Codigo de instalacion</h3>
              </div>
              <p className="webchat-card-desc">
                Copia y pega este codigo antes del cierre <code>&lt;/body&gt;</code> en tu sitio web.
                Funciona en Shopify, WooCommerce, WordPress, o cualquier pagina HTML.
              </p>
              <div className="webchat-snippet">
                <code>{snippet}</code>
                <button
                  className="btn-copiar"
                  onClick={() => copiar(snippet, 'snippet')}
                  title="Copiar snippet"
                >
                  {copiado === 'snippet' ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            {/* Seccion: API Key */}
            <div className="webchat-card">
              <div className="webchat-card-header">
                <Key size={18} />
                <h3>API Key</h3>
              </div>
              <div className="webchat-key-row">
                <code className="webchat-key">{config.api_key}</code>
                <button
                  className="btn-copiar"
                  onClick={() => copiar(config.api_key, 'key')}
                >
                  {copiado === 'key' ? <Check size={16} /> : <Copy size={16} />}
                </button>
                <button
                  className="btn-danger-sm"
                  onClick={() => setMostrarConfirmRegen(true)}
                >
                  <RefreshCw size={14} /> Regenerar
                </button>
              </div>
              {mostrarConfirmRegen && (
                <div className="webchat-confirm">
                  <AlertTriangle size={16} />
                  <span>El snippet actual dejara de funcionar. Continuar?</span>
                  <button className="btn-danger-sm" onClick={regenerarKey}>Si, regenerar</button>
                  <button className="btn-secondary-sm" onClick={() => setMostrarConfirmRegen(false)}>Cancelar</button>
                </div>
              )}
            </div>

            {/* Seccion: Apariencia */}
            <div className="webchat-card">
              <div className="webchat-card-header">
                <Palette size={18} />
                <h3>Apariencia</h3>
              </div>

              <div className="webchat-form-grid">
                <div className="webchat-field">
                  <label>Titulo del chat</label>
                  <input
                    type="text"
                    value={form.titulo_chat}
                    onChange={e => setForm({...form, titulo_chat: e.target.value})}
                    placeholder="Chat"
                  />
                </div>

                <div className="webchat-field">
                  <label>URL del logo</label>
                  <input
                    type="url"
                    value={form.logo_url}
                    onChange={e => setForm({...form, logo_url: e.target.value})}
                    placeholder="https://ejemplo.com/logo.png"
                  />
                </div>

                <div className="webchat-field">
                  <label>Color primario</label>
                  <div className="webchat-color-input">
                    <input
                      type="color"
                      value={form.color_primario}
                      onChange={e => setForm({...form, color_primario: e.target.value})}
                    />
                    <input
                      type="text"
                      value={form.color_primario}
                      onChange={e => setForm({...form, color_primario: e.target.value})}
                    />
                  </div>
                </div>

                <div className="webchat-field">
                  <label>Color texto header</label>
                  <div className="webchat-color-input">
                    <input
                      type="color"
                      value={form.color_texto_header}
                      onChange={e => setForm({...form, color_texto_header: e.target.value})}
                    />
                    <input
                      type="text"
                      value={form.color_texto_header}
                      onChange={e => setForm({...form, color_texto_header: e.target.value})}
                    />
                  </div>
                </div>

                <div className="webchat-field">
                  <label>Posicion</label>
                  <select
                    value={form.posicion}
                    onChange={e => setForm({...form, posicion: e.target.value})}
                  >
                    <option value="bottom-right">Abajo a la derecha</option>
                    <option value="bottom-left">Abajo a la izquierda</option>
                  </select>
                </div>

                <div className="webchat-field">
                  <label>Tamano</label>
                  <select
                    value={form.tamano}
                    onChange={e => setForm({...form, tamano: e.target.value})}
                  >
                    <option value="pequeno">Pequeno</option>
                    <option value="normal">Normal</option>
                    <option value="grande">Grande</option>
                  </select>
                </div>
              </div>

              <div className="webchat-field" style={{marginTop: 16}}>
                <label>Mensaje de bienvenida (opcional)</label>
                <textarea
                  value={form.mensaje_bienvenida}
                  onChange={e => setForm({...form, mensaje_bienvenida: e.target.value})}
                  placeholder="Hola! En que te puedo ayudar?"
                  rows={2}
                />
              </div>

              <div className="webchat-field webchat-toggle-field">
                <label className="webchat-toggle">
                  <input
                    type="checkbox"
                    checked={form.activo}
                    onChange={e => setForm({...form, activo: e.target.checked})}
                  />
                  <span className="webchat-toggle-slider" />
                  <span>Widget activo</span>
                </label>
              </div>
            </div>

            {/* Seccion: Horario */}
            <div className="webchat-card">
              <div className="webchat-card-header">
                <Clock size={18} />
                <h3>Horario de atencion</h3>
              </div>

              <div className="webchat-field webchat-toggle-field">
                <label className="webchat-toggle">
                  <input
                    type="checkbox"
                    checked={form.horario_activo}
                    onChange={e => setForm({...form, horario_activo: e.target.checked})}
                  />
                  <span className="webchat-toggle-slider" />
                  <span>Restringir por horario</span>
                </label>
              </div>

              {form.horario_activo && (
                <div className="webchat-horario-grid">
                  <div className="webchat-field">
                    <label>Hora inicio</label>
                    <input
                      type="time"
                      value={form.horario_inicio}
                      onChange={e => setForm({...form, horario_inicio: e.target.value})}
                    />
                  </div>

                  <div className="webchat-field">
                    <label>Hora fin</label>
                    <input
                      type="time"
                      value={form.horario_fin}
                      onChange={e => setForm({...form, horario_fin: e.target.value})}
                    />
                  </div>

                  <div className="webchat-field">
                    <label>Zona horaria</label>
                    <select
                      value={form.horario_zona}
                      onChange={e => setForm({...form, horario_zona: e.target.value})}
                    >
                      <option value="America/Santiago">Chile (Santiago)</option>
                      <option value="America/Argentina/Buenos_Aires">Argentina (Buenos Aires)</option>
                      <option value="America/Bogota">Colombia (Bogota)</option>
                      <option value="America/Mexico_City">Mexico (CDMX)</option>
                      <option value="America/Lima">Peru (Lima)</option>
                      <option value="Europe/Madrid">Espana (Madrid)</option>
                      <option value="America/New_York">EEUU (New York)</option>
                      <option value="America/Los_Angeles">EEUU (Los Angeles)</option>
                    </select>
                  </div>

                  <div className="webchat-field" style={{gridColumn: '1 / -1'}}>
                    <label>Mensaje fuera de horario</label>
                    <textarea
                      value={form.mensaje_fuera_horario}
                      onChange={e => setForm({...form, mensaje_fuera_horario: e.target.value})}
                      rows={2}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Columna preview */}
          {previewAbierto && (
            <div className="webchat-preview-col">
              <div className="webchat-preview-sticky">
                <h4>Preview del widget</h4>
                <div className="webchat-preview-frame">
                  <div
                    className="webchat-preview-bubble"
                    style={{ background: form.color_primario }}
                  >
                    <MessageCircle size={24} color={form.color_texto_header} />
                  </div>
                  <div className="webchat-preview-window">
                    <div
                      className="webchat-preview-header"
                      style={{ background: form.color_primario, color: form.color_texto_header }}
                    >
                      {form.logo_url && (
                        <img src={form.logo_url} alt="" className="webchat-preview-logo" />
                      )}
                      <div>
                        <div className="webchat-preview-title">{form.titulo_chat || 'Chat'}</div>
                        <div className="webchat-preview-status">En linea</div>
                      </div>
                    </div>
                    <div className="webchat-preview-messages">
                      {form.mensaje_bienvenida && (
                        <div className="webchat-preview-msg bot">
                          {form.mensaje_bienvenida}
                        </div>
                      )}
                      <div className="webchat-preview-msg user" style={{ background: form.color_primario, color: form.color_texto_header }}>
                        Hola!
                      </div>
                    </div>
                    <div className="webchat-preview-input">
                      <span>Escribe un mensaje...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
