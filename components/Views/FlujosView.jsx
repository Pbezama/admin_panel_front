'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useView } from '@/context/ViewContext'
import { api } from '@/lib/api'
import FlowCanvas from '@/components/FlowBuilder/FlowCanvas'
import FlowMonitor from '@/components/FlowBuilder/FlowMonitor'
import '@/styles/FlujosView.css'

const TRIGGER_TIPOS = [
  { value: 'keyword', label: 'Palabra clave', icon: '🔑', desc: 'Se activa cuando el cliente escribe una palabra especifica' },
  { value: 'first_message', label: 'Primer mensaje', icon: '💬', desc: 'Se activa con cualquier primer mensaje de un cliente nuevo' }
]

const PALABRAS_SUGERIDAS = [
  'hola', 'info', 'precio', 'cotizar', 'agendar', 'cita', 'reservar',
  'ayuda', 'horario', 'promocion', 'comprar', 'catalogo', 'servicio'
]

export default function FlujosView() {
  const { usuario, marcaActiva } = useAuth()
  const { navegarA, contextoVista } = useView()

  const [flujos, setFlujos] = useState([])
  const [flujoActivo, setFlujoActivo] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  const [vistaActiva, setVistaActiva] = useState('lista') // lista | editor | nuevo | monitor
  const [nuevoFlujo, setNuevoFlujo] = useState({ nombre: '', descripcion: '', trigger_tipo: 'keyword', trigger_modo: 'contiene', trigger_valor: '', canales: ['whatsapp'] })
  const [keywords, setKeywords] = useState([])
  const [keywordInput, setKeywordInput] = useState('')
  const [dmContinuo, setDmContinuo] = useState(null) // '1' o '2'
  const [cambiandoDm, setCambiandoDm] = useState(false)

  const idMarca = marcaActiva?.id_marca || usuario?.id_marca
  const esAdmin = usuario?.es_super_admin || usuario?.tipo_usuario === 'admin'

  // Sincronizar keywords array → trigger_valor string
  const syncKeywordsToValor = (kws) => {
    const valor = kws.join('|')
    setNuevoFlujo(prev => ({ ...prev, trigger_valor: valor }))
  }

  const agregarKeyword = (palabra) => {
    const limpia = palabra.trim().toLowerCase()
    if (!limpia || keywords.includes(limpia)) return
    const nuevas = [...keywords, limpia]
    setKeywords(nuevas)
    syncKeywordsToValor(nuevas)
    setKeywordInput('')
  }

  const eliminarKeyword = (palabra) => {
    const nuevas = keywords.filter(k => k !== palabra)
    setKeywords(nuevas)
    syncKeywordsToValor(nuevas)
  }

  const handleKeywordKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      agregarKeyword(keywordInput)
    }
  }

  // Cargar estado dm_continuo
  useEffect(() => {
    if (idMarca) {
      api.getDmContinuo().then(result => {
        if (result.success) setDmContinuo(result.dm_continuo)
      }).catch(() => {})
    }
  }, [idMarca])

  const handleToggleDmContinuo = async () => {
    if (cambiandoDm) return
    const nuevoModo = dmContinuo === '1' ? '2' : '1'
    setCambiandoDm(true)
    try {
      const result = await api.setDmContinuo(nuevoModo)
      if (result.success) {
        setDmContinuo(result.dm_continuo)
        mostrarMensaje(
          nuevoModo === '1'
            ? 'Modo activado: El sistema responde continuamente por DM'
            : 'Modo activado: El sistema solo responde al comentario y primer DM',
          'exito'
        )
      }
    } catch (error) {
      mostrarMensaje('Error cambiando modo: ' + error.message, 'error')
    } finally {
      setCambiandoDm(false)
    }
  }

  useEffect(() => {
    cargarFlujos()
  }, [idMarca])

  // Sincronizar sub-vista desde contextoVista (URL)
  useEffect(() => {
    if (!contextoVista) {
      // Sin contexto = lista de flujos
      if (vistaActiva !== 'lista' && vistaActiva !== 'nuevo') {
        setVistaActiva('lista')
        setFlujoActivo(null)
      }
      return
    }

    if (contextoVista.sub === 'editor' && contextoVista.id) {
      // Abrir editor de un flujo especifico
      api.getFlujo(contextoVista.id).then(result => {
        setFlujoActivo(result.flujo)
        setVistaActiva('editor')
      }).catch(() => {
        mostrarMensaje('Error abriendo flujo', 'error')
        navegarA('flujos')
      })
    } else if (contextoVista.sub === 'monitor') {
      setVistaActiva('monitor')
    } else if (contextoVista.sub === 'nuevo') {
      setVistaActiva('nuevo')
    }
  }, [contextoVista])

  const cargarFlujos = async () => {
    setCargando(true)
    try {
      const result = await api.getFlujos()
      setFlujos(result.flujos || [])
    } catch (error) {
      console.error('Error cargando flujos:', error)
      mostrarMensaje('Error cargando flujos', 'error')
    } finally {
      setCargando(false)
    }
  }

  const mostrarMensaje = (texto, tipo = 'info') => {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje(null), 4000)
  }

  const handleCrearFlujo = async () => {
    if (!nuevoFlujo.nombre.trim()) {
      mostrarMensaje('El nombre es requerido', 'error')
      return
    }

    try {
      const result = await api.crearFlujo({
        ...nuevoFlujo,
        nodos: [
          {
            id: 'node_inicio',
            tipo: 'inicio',
            posicion: { x: 250, y: 50 },
            datos: { trigger_tipo: nuevoFlujo.trigger_tipo, trigger_modo: nuevoFlujo.trigger_modo, trigger_valor: nuevoFlujo.trigger_valor }
          }
        ],
        edges: []
      })

      mostrarMensaje('Flujo creado', 'exito')
      setNuevoFlujo({ nombre: '', descripcion: '', trigger_tipo: 'keyword', trigger_modo: 'contiene', trigger_valor: '', canales: ['whatsapp'] })
      setKeywords([])
      setKeywordInput('')
      await cargarFlujos()
      // Abrir en editor con URL
      navegarA('flujos', { sub: 'editor', id: result.flujo.id })
    } catch (error) {
      mostrarMensaje('Error creando flujo: ' + error.message, 'error')
    }
  }

  const handleAbrirEditor = async (flujo) => {
    navegarA('flujos', { sub: 'editor', id: flujo.id })
  }

  const handleGuardar = async (nodos, edges) => {
    if (!flujoActivo) return
    setGuardando(true)
    try {
      await api.actualizarFlujo(flujoActivo.id, { nodos, edges })
      mostrarMensaje('Flujo guardado', 'exito')
      // Recargar
      const result = await api.getFlujo(flujoActivo.id)
      setFlujoActivo(result.flujo)
    } catch (error) {
      mostrarMensaje('Error guardando: ' + error.message, 'error')
    } finally {
      setGuardando(false)
    }
  }

  const handleActivar = async (flujo) => {
    const nuevoEstado = flujo.estado === 'activo' ? 'pausado' : 'activo'
    try {
      await api.activarFlujo(flujo.id, nuevoEstado)
      mostrarMensaje(`Flujo ${nuevoEstado === 'activo' ? 'activado' : 'pausado'}`, 'exito')
      cargarFlujos()
    } catch (error) {
      mostrarMensaje('Error cambiando estado', 'error')
    }
  }

  const handleDuplicar = async (flujo) => {
    try {
      await api.duplicarFlujo(flujo.id)
      mostrarMensaje('Flujo duplicado', 'exito')
      cargarFlujos()
    } catch (error) {
      mostrarMensaje('Error duplicando flujo', 'error')
    }
  }

  const handleEliminar = async (flujo) => {
    if (!confirm(`Eliminar flujo "${flujo.nombre}"?`)) return
    try {
      await api.eliminarFlujo(flujo.id)
      mostrarMensaje('Flujo eliminado', 'exito')
      cargarFlujos()
    } catch (error) {
      mostrarMensaje('Error eliminando flujo', 'error')
    }
  }

  const handleCrearSeed = async () => {
    try {
      const result = await api.crearFlujoSeed(idMarca)
      mostrarMensaje('Flujo de ejemplo creado. Envia "agendar" por WhatsApp para probarlo.', 'exito')
      cargarFlujos()
    } catch (error) {
      mostrarMensaje('Error creando flujo seed', 'error')
    }
  }

  const volverALista = () => {
    navegarA('flujos')
    setFlujoActivo(null)
    setVistaActiva('lista')
  }

  const estadoBadge = (estado) => {
    const estilos = {
      activo: 'flujo-badge-activo',
      borrador: 'flujo-badge-borrador',
      pausado: 'flujo-badge-pausado'
    }
    return <span className={`flujo-badge ${estilos[estado] || ''}`}>{estado}</span>
  }

  // Vista: Monitor de flujos
  if (vistaActiva === 'monitor') {
    return (
      <div className="flujos-view flujos-editor-mode">
        <FlowMonitor onVolver={volverALista} />
      </div>
    )
  }

  // Vista: Editor de flujo
  if (vistaActiva === 'editor' && flujoActivo) {
    return (
      <div className="flujos-view flujos-editor-mode">
        <header className="flujos-header">
          <div className="flujos-header-left">
            <button className="flujos-btn-volver" onClick={volverALista}>
              ← Volver
            </button>
            <h2>{flujoActivo.nombre}</h2>
            {estadoBadge(flujoActivo.estado)}
          </div>
          <div className="flujos-header-right">
            <span className="flujos-trigger-info">
              {flujoActivo.trigger_tipo === 'first_message' ? '💬 Primer mensaje' : `🔑 ${flujoActivo.trigger_valor ? flujoActivo.trigger_valor.split('|').join(', ') : ''}`}
            </span>
          </div>
        </header>

        {mensaje && (
          <div className={`flujos-mensaje flujos-mensaje-${mensaje.tipo}`}>
            {mensaje.texto}
          </div>
        )}

        <FlowCanvas
          flujo={flujoActivo}
          onSave={handleGuardar}
          guardando={guardando}
          marcaNombre={marcaActiva?.nombre_marca || usuario?.nombre_marca || ''}
        />
      </div>
    )
  }

  // Vista: Lista de flujos
  return (
    <div className="flujos-view">
      <header className="flujos-header">
        <div className="flujos-header-left">
          <button className="flujos-btn-volver" onClick={() => navegarA('chat')}>← Volver</button>
          <h2>Flujos Conversacionales</h2>
        </div>
        <div className="flujos-header-right">
          <button className="flujos-btn-monitor" onClick={() => navegarA('flujos', { sub: 'monitor' })}>
            Monitor
          </button>
          <button className="flujos-btn-seed" onClick={handleCrearSeed}>
            Crear flujo ejemplo
          </button>
          <button className="flujos-btn-nuevo" onClick={() => {
            setVistaActiva('nuevo')
            navegarA('flujos', { sub: 'nuevo' })
          }}>
            + Nuevo flujo
          </button>
        </div>
      </header>

      {mensaje && (
        <div className={`flujos-mensaje flujos-mensaje-${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}

      {/* Panel de modo DM - solo admin/super admin */}
      {esAdmin && dmContinuo !== null && vistaActiva === 'lista' && (
        <div className="dm-modo-panel">
          <div className="dm-modo-info">
            <div className="dm-modo-titulo">
              <span className="dm-modo-icon">{dmContinuo === '1' ? '🔄' : '💬'}</span>
              <div>
                <h4>Modo de respuesta por DM</h4>
                <p>{dmContinuo === '1'
                  ? 'El sistema responde continuamente a todos los mensajes por DM'
                  : 'El sistema solo responde al comentario y al primer mensaje por DM'
                }</p>
              </div>
            </div>
          </div>
          <div className="dm-modo-toggle-area">
            <div className="dm-modo-options">
              <button
                type="button"
                className={`dm-modo-option ${dmContinuo === '1' ? 'dm-modo-option-active' : ''}`}
                onClick={() => { if (dmContinuo !== '1') handleToggleDmContinuo() }}
                disabled={cambiandoDm}
              >
                <span className="dm-modo-option-icon">🔄</span>
                <span className="dm-modo-option-label">Continuo</span>
                <span className="dm-modo-option-desc">Responde siempre</span>
              </button>
              <button
                type="button"
                className={`dm-modo-option ${dmContinuo === '2' ? 'dm-modo-option-active' : ''}`}
                onClick={() => { if (dmContinuo !== '2') handleToggleDmContinuo() }}
                disabled={cambiandoDm}
              >
                <span className="dm-modo-option-icon">💬</span>
                <span className="dm-modo-option-label">Solo primero</span>
                <span className="dm-modo-option-desc">Comentario + 1er DM</span>
              </button>
            </div>
            {cambiandoDm && <span className="dm-modo-saving">Guardando...</span>}
          </div>
        </div>
      )}

      {/* Formulario nuevo flujo */}
      {vistaActiva === 'nuevo' && (
        <div className="flujos-nuevo-form">
          <h3>Crear nuevo flujo</h3>
          <div className="flujos-form-grid">
            <label className="flow-field">
              <span>Nombre del flujo</span>
              <input
                value={nuevoFlujo.nombre}
                onChange={e => setNuevoFlujo(prev => ({ ...prev, nombre: e.target.value }))}
                placeholder="Ej: Captar Lead, Agendar Reunion..."
              />
            </label>
            <label className="flow-field">
              <span>Descripcion (opcional)</span>
              <input
                value={nuevoFlujo.descripcion}
                onChange={e => setNuevoFlujo(prev => ({ ...prev, descripcion: e.target.value }))}
                placeholder="Breve descripcion del flujo"
              />
            </label>
            {/* Tipo de trigger - Cards visuales */}
            <div className="trigger-tipo-selector">
              <span className="trigger-tipo-label">Cuando se activa el flujo?</span>
              <div className="trigger-tipo-cards">
                {TRIGGER_TIPOS.map(t => (
                  <button
                    key={t.value}
                    type="button"
                    className={`trigger-tipo-card ${nuevoFlujo.trigger_tipo === t.value ? 'trigger-tipo-card-active' : ''}`}
                    onClick={() => setNuevoFlujo(prev => ({ ...prev, trigger_tipo: t.value }))}
                  >
                    <span className="trigger-tipo-card-icon">{t.icon}</span>
                    <span className="trigger-tipo-card-name">{t.label}</span>
                    <span className="trigger-tipo-card-desc">{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Primer mensaje - Info visual */}
            {nuevoFlujo.trigger_tipo === 'first_message' && (
              <div className="trigger-desc-box">
                <p className="trigger-desc-text">
                  El flujo se activa automaticamente cuando llega <strong>cualquier mensaje</strong> de un cliente que no tiene una conversacion activa.
                </p>
                <div className="trigger-visual-example">
                  <div className="trigger-example-bubble trigger-example-user">Hola, necesito informacion</div>
                  <div className="trigger-example-arrow">↓ Se activa el flujo</div>
                  <div className="trigger-example-bubble trigger-example-bot">Bienvenido! En que puedo ayudarte?</div>
                </div>
              </div>
            )}

            {/* Palabra clave - Panel interactivo */}
            {nuevoFlujo.trigger_tipo === 'keyword' && (
              <div className="trigger-keyword-panel">
                {/* Modo de coincidencia - Toggle visual */}
                <div className="trigger-modo-section">
                  <span className="trigger-modo-label">Como debe coincidir?</span>
                  <div className="trigger-modo-toggle">
                    <button
                      type="button"
                      className={`trigger-modo-btn ${(nuevoFlujo.trigger_modo || 'contiene') === 'contiene' ? 'trigger-modo-btn-active' : ''}`}
                      onClick={() => setNuevoFlujo(prev => ({ ...prev, trigger_modo: 'contiene' }))}
                    >
                      <span className="trigger-modo-btn-icon">🔍</span>
                      <span className="trigger-modo-btn-title">Contiene</span>
                      <span className="trigger-modo-btn-desc">El mensaje incluye la palabra en cualquier parte</span>
                    </button>
                    <button
                      type="button"
                      className={`trigger-modo-btn ${nuevoFlujo.trigger_modo === 'igual' ? 'trigger-modo-btn-active' : ''}`}
                      onClick={() => setNuevoFlujo(prev => ({ ...prev, trigger_modo: 'igual' }))}
                    >
                      <span className="trigger-modo-btn-icon">🎯</span>
                      <span className="trigger-modo-btn-title">Exacto</span>
                      <span className="trigger-modo-btn-desc">El mensaje debe ser exactamente la palabra</span>
                    </button>
                  </div>
                </div>

                {/* Input de palabras clave */}
                <div className="trigger-keywords-section">
                  <span className="trigger-keywords-label">Palabras que activan el flujo</span>
                  <p className="trigger-keywords-help">Si el cliente escribe alguna de estas palabras, el flujo se activa</p>

                  {/* Chips de keywords agregadas */}
                  {keywords.length > 0 && (
                    <div className="trigger-keywords-chips">
                      {keywords.map(kw => (
                        <span key={kw} className="trigger-keyword-chip">
                          {kw}
                          <button type="button" className="trigger-keyword-chip-remove" onClick={() => eliminarKeyword(kw)}>x</button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Input para agregar */}
                  <div className="trigger-keyword-add-row">
                    <input
                      type="text"
                      value={keywordInput}
                      onChange={e => setKeywordInput(e.target.value)}
                      onKeyDown={handleKeywordKeyDown}
                      placeholder="Escribe una palabra y presiona Enter"
                      className="trigger-keyword-add-input"
                    />
                    <button
                      type="button"
                      className="trigger-keyword-add-btn"
                      onClick={() => agregarKeyword(keywordInput)}
                      disabled={!keywordInput.trim()}
                    >
                      + Agregar
                    </button>
                  </div>

                  {/* Sugerencias rapidas */}
                  <div className="trigger-keywords-sugerencias">
                    <span className="trigger-sugerencias-label">Sugerencias rapidas:</span>
                    <div className="trigger-sugerencias-list">
                      {PALABRAS_SUGERIDAS.filter(p => !keywords.includes(p)).slice(0, 8).map(palabra => (
                        <button
                          key={palabra}
                          type="button"
                          className="trigger-sugerencia-btn"
                          onClick={() => agregarKeyword(palabra)}
                        >
                          + {palabra}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Preview visual */}
                {keywords.length > 0 && (
                  <div className="trigger-preview">
                    <span className="trigger-preview-label">Vista previa</span>
                    <div className="trigger-preview-box">
                      <div className="trigger-preview-msg">
                        <span className="trigger-preview-user">Cliente:</span>
                        {(nuevoFlujo.trigger_modo || 'contiene') === 'contiene'
                          ? <span>"...{keywords[0]}..."</span>
                          : <span>"{keywords[0]}"</span>
                        }
                      </div>
                      <div className="trigger-preview-result">
                        ✅ Flujo se activa porque {(nuevoFlujo.trigger_modo || 'contiene') === 'contiene' ? 'contiene' : 'es exactamente'} <strong>"{keywords[0]}"</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="trigger-canales-section">
              <span className="trigger-canales-label">En que canales funciona?</span>
              <div className="trigger-canales-grid">
                {[
                  { value: 'whatsapp', label: 'WhatsApp', icon: '📱', color: '#25D366' },
                  { value: 'instagram', label: 'Instagram', icon: '📸', color: '#E4405F' },
                  { value: 'web', label: 'Web Chat', icon: '🌐', color: '#3B82F6' }
                ].map(canal => {
                  const activo = (nuevoFlujo.canales || []).includes(canal.value)
                  return (
                    <button
                      key={canal.value}
                      type="button"
                      className={`trigger-canal-card ${activo ? 'trigger-canal-card-active' : ''}`}
                      style={activo ? { borderColor: canal.color, background: canal.color + '10' } : {}}
                      onClick={() => {
                        setNuevoFlujo(prev => {
                          const canales = prev.canales || []
                          if (activo) {
                            return { ...prev, canales: canales.filter(c => c !== canal.value) }
                          } else {
                            return { ...prev, canales: [...canales, canal.value] }
                          }
                        })
                      }}
                    >
                      <span className="trigger-canal-icon">{canal.icon}</span>
                      <span className="trigger-canal-name">{canal.label}</span>
                      {activo && <span className="trigger-canal-check">✓</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
          <div className="flujos-form-actions">
            <button className="flujos-btn-cancelar" onClick={volverALista}>Cancelar</button>
            <button className="flujos-btn-crear" onClick={handleCrearFlujo}>Crear flujo</button>
          </div>
        </div>
      )}

      {/* Lista de flujos */}
      {cargando ? (
        <div className="flujos-loading">Cargando flujos...</div>
      ) : flujos.length === 0 ? (
        <div className="flujos-empty">
          <p>No hay flujos creados aun.</p>
          <p>Crea tu primer flujo o usa el boton "Crear flujo ejemplo" para empezar.</p>
        </div>
      ) : (
        <div className="flujos-lista">
          {flujos.map(flujo => (
            <div key={flujo.id} className="flujo-card">
              <div className="flujo-card-info">
                <div className="flujo-card-top">
                  <h3>{flujo.nombre}</h3>
                  {estadoBadge(flujo.estado)}
                </div>
                {flujo.descripcion && <p className="flujo-card-desc">{flujo.descripcion}</p>}
                <div className="flujo-card-meta">
                  <span>{flujo.trigger_tipo === 'first_message' ? '💬 Primer mensaje' : `🔑 ${flujo.trigger_valor ? flujo.trigger_valor.split('|').join(', ') : 'Sin palabras'}`}</span>
                  <span>Canal: {(flujo.canales || []).join(', ')}</span>
                  <span>{(flujo.nodos || []).length} nodos</span>
                </div>
              </div>
              <div className="flujo-card-actions">
                <button className="flujo-btn-editar" onClick={() => handleAbrirEditor(flujo)}>Editar</button>
                <button
                  className={`flujo-btn-activar ${flujo.estado === 'activo' ? 'activo' : ''}`}
                  onClick={() => handleActivar(flujo)}
                >
                  {flujo.estado === 'activo' ? 'Pausar' : 'Activar'}
                </button>
                <button className="flujo-btn-duplicar" onClick={() => handleDuplicar(flujo)}>Duplicar</button>
                <button className="flujo-btn-eliminar" onClick={() => handleEliminar(flujo)}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
