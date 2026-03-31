'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { Save, Loader2, ChevronDown, ChevronRight } from 'lucide-react'

const SECCIONES = [
  {
    id: 'prompt_rol',
    label: 'Rol e Identidad',
    ayuda: 'Define quien es el bot, su nombre, su proposito y las areas que cubre. Es lo primero que lee el modelo.',
    ejemplo: 'Ej: Eres Javier, asistente virtual de Prouniversitas PreUCV. Tu objetivo PRIMARIO es RESOLVER la consulta del cliente...',
    placeholder: 'Define la identidad, nombre y areas que cubre el bot...',
    rows: 14,
  },
  {
    id: 'prompt_estilo',
    label: 'Estilo de Respuesta',
    ayuda: 'Como debe comunicarse: tono, formato, uso de emojis, tecnicismos, metodologias de venta (NEPQ, etc).',
    ejemplo: 'Ej: Utiliza un lenguaje natural, chileno, evitando tecnicismos. Aplica los principios del NEPQ de Jeremy Miner...',
    placeholder: 'Define el tono, estilo de comunicacion y formato de respuestas...',
    rows: 10,
  },
  {
    id: 'prompt_reglas',
    label: 'Reglas de Comunicacion',
    ayuda: 'Reglas estrictas que el bot SIEMPRE debe seguir. Cada regla con guion (-). Incluye: saludos, derivacion, uso de herramientas, restricciones.',
    ejemplo: 'Ej:\n- Saluda al principio de la conversacion.\n- No mencionas precios.\n- Cuando pregunten por estado de cuenta, pide el RUT y usa buscarEstadoCuentaPorRut.\n- La senal [DERIVAR] solo se usa cuando...',
    placeholder: '- Regla 1\n- Regla 2\n- Regla 3...',
    rows: 16,
  },
  {
    id: 'prompt_consideraciones',
    label: 'Conocimiento del Negocio',
    ayuda: 'Informacion especifica del negocio organizada por secciones (## TITULO). El bot usa esto como base de conocimiento para responder consultas.',
    ejemplo: 'Ej:\n## CAMPUS VIRTUAL\n- Acceso: www.preucvonline.cl\n- Usuario: RUT sin puntos\n\n## FINANZAS Y PAGOS\n- Usar herramienta buscarEstadoCuentaPorRut...\n\n## CONTRATOS\n- Prepago: derivar a ejecutiva...',
    placeholder: '## SECCION 1\n- Dato importante\n- Otro dato\n\n## SECCION 2\n...',
    rows: 20,
  },
  {
    id: 'prompt_actividades',
    label: 'Actividades Semanales',
    ayuda: 'Actividades de la semana actual. Se inyecta al contexto del bot. Actualizar cada semana. Dejar vacio si no aplica.',
    ejemplo: 'Ej:\n## Actividades de esta semana\n- Ensayo N1 de LEN / MAT\n- Clase de Correccion Ensayo\n- Clase Magistral de Comprension Lectora',
    placeholder: '## Actividades de esta semana\n- Actividad 1\n- Actividad 2...',
    rows: 12,
  },
  {
    id: 'prompt_clasificacion',
    label: 'Clasificacion de Conversaciones',
    ayuda: 'Prompt usado al finalizar cada conversacion para generar un resumen y clasificar el area/tipo. Debe retornar JSON con "descripcion" y "area". Se usa para reportes y seguimiento.',
    ejemplo: 'Ej: Analiza la conversacion y responde con JSON: {"descripcion": "resumen corto", "area": "Finanzas/Auditoria"}. Areas: Academico, Soporte Tecnico, Finanzas, Administracion, Servicio. Tipos: Urgente, Traspaso, Auditoria.',
    placeholder: 'Analiza la siguiente conversacion...\n\nAREAS TEMATICAS:\n- "Academico" -> ...\n- "Finanzas" -> ...\n\nTIPOS:\n- "/Urgente" -> ...\n- "/Traspaso" -> ...\n- "/Auditoria" -> ...',
    rows: 20,
  },
  {
    id: 'prompt_contexto_cliente',
    label: 'Template de Contexto del Cliente',
    ayuda: 'Template del mensaje de sistema que se inyecta con los datos del cliente en cada conversacion. Usa {phone}, {conversation_id}, {channel_id} y {datos_alumno} como variables.',
    ejemplo: 'Ej: ## Datos del Cliente\n- Telefono: {phone}\nIMPORTANTE: Ya tienes los datos pre-cargados...\nEXCEPCION FINANCIERA: Para montos, usa la herramienta...\n{datos_alumno}',
    placeholder: '## Datos del Cliente Actual\n- Telefono del cliente: {phone}\n- Conversation ID: {conversation_id}\n...\n{datos_alumno}\n## Capacidades Multimedia\n...',
    rows: 16,
  },
]

export default function TabPrompt({ config, setConfig, mostrarMensaje, recargarHistorial }) {
  const [guardando, setGuardando] = useState(false)
  const [seccionActiva, setSeccionActiva] = useState('prompt_rol')
  const [mostrarEjemplo, setMostrarEjemplo] = useState(false)
  const [valores, setValores] = useState({
    prompt_rol: config?.prompt_rol || '',
    prompt_estilo: config?.prompt_estilo || '',
    prompt_reglas: config?.prompt_reglas || '',
    prompt_consideraciones: config?.prompt_consideraciones || '',
    prompt_actividades: config?.prompt_actividades || '',
    prompt_clasificacion: config?.prompt_clasificacion || '',
    prompt_contexto_cliente: config?.prompt_contexto_cliente || '',
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
  const charCount = (valores[seccionActiva] || '').length

  return (
    <div className="ca-tab-content">
      <div className="ca-sub-tabs">
        {SECCIONES.map(s => (
          <button
            key={s.id}
            className={`ca-sub-tab ${seccionActiva === s.id ? 'active' : ''}`}
            onClick={() => { setSeccionActiva(s.id); setMostrarEjemplo(false) }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="ca-section">
        <div className="ca-section-header">
          <h3>{seccionInfo.label}</h3>
          <p className="ca-section-ayuda">{seccionInfo.ayuda}</p>
          <button
            className="ca-btn-link"
            onClick={() => setMostrarEjemplo(!mostrarEjemplo)}
            style={{ marginTop: '6px', fontSize: '12px', color: 'var(--color-accent, #6b9fff)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            {mostrarEjemplo ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            {mostrarEjemplo ? 'Ocultar ejemplo' : 'Ver ejemplo'}
          </button>
          {mostrarEjemplo && (
            <pre className="ca-ejemplo" style={{ marginTop: '8px', padding: '10px 14px', background: 'rgba(107,159,255,0.08)', borderRadius: '6px', fontSize: '12px', color: '#8ba3c7', whiteSpace: 'pre-wrap', lineHeight: '1.5', border: '1px solid rgba(107,159,255,0.15)' }}>
              {seccionInfo.ejemplo}
            </pre>
          )}
        </div>
        <textarea
          className="ca-textarea"
          value={valores[seccionActiva]}
          onChange={(e) => handleChange(seccionActiva, e.target.value)}
          placeholder={seccionInfo.placeholder}
          rows={seccionInfo.rows || 12}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#6b7280', marginTop: '4px', padding: '0 4px' }}>
          <span>{charCount.toLocaleString()} caracteres</span>
          <span>{seccionActiva === 'prompt_contexto_cliente' ? 'Variables: {phone}, {conversation_id}, {channel_id}, {datos_alumno}' : ''}</span>
        </div>
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
