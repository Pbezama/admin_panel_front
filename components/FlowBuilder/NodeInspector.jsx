'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { useView } from '@/context/ViewContext'

// Documentacion detallada por tipo de nodo
const NODE_DOCS = {
  inicio: {
    titulo: 'Nodo Inicio',
    descripcion: 'Es el punto de entrada obligatorio de todo flujo. Define como y cuando se activa el flujo automaticamente. Cada flujo tiene exactamente un nodo inicio que no se puede eliminar.',
    comoUsarlo: 'Se configura al crear el flujo (nombre, trigger y canales). Hay dos tipos de trigger:\n\n- Palabra clave: Se activa cuando el mensaje del cliente coincide con las palabras configuradas (contiene o es igual). Puedes combinar varias con | (O) y + (Y).\n- Primer mensaje: Se activa con cualquier mensaje de un cliente sin conversacion activa (primera vez o despues de cerrar).\n\nNo necesitas conectar nada antes de este nodo, solo despues.',
    variables: [
      { nombre: '{{canal}}', desc: 'Canal por donde llego el mensaje (whatsapp, instagram, web)' },
      { nombre: '{{telefono_cliente}}', desc: 'Numero de telefono del cliente (WhatsApp)' },
      { nombre: '{{nombre_cliente}}', desc: 'Nombre del cliente si esta disponible' },
      { nombre: '{{mensaje_original}}', desc: 'Texto del mensaje que activo el trigger' }
    ],
    ejemplo: 'Trigger "Palabra clave" con modo "contiene" y valor "agendar|cita" → cuando un cliente escribe "Quiero agendar una cita" por WhatsApp, el flujo arranca. Trigger "Primer mensaje" → cualquier mensaje de un cliente nuevo o con conversacion cerrada activa el flujo.'
  },
  mensaje: {
    titulo: 'Enviar Mensaje',
    descripcion: 'Envia un mensaje al cliente por el canal activo. Puede ser texto simple, texto con botones interactivos (max 3), o una lista de opciones. Los botones permiten que el cliente responda con un solo tap.',
    comoUsarlo: '1. Elige el tipo de mensaje (texto, con botones, o lista).\n2. Escribe el texto del mensaje. Puedes usar {{variable}} para interpolar datos dinamicos.\n3. Si elegiste "Con botones", agrega hasta 3 botones con texto corto (max 20 caracteres).\n4. Conecta las salidas: si tiene botones, cada boton genera un camino diferente en el flujo.',
    variables: [
      { nombre: '{{nombre_cliente}}', desc: 'Nombre del cliente' },
      { nombre: '{{email_cliente}}', desc: 'Email capturado previamente' },
      { nombre: '{{cualquier_variable}}', desc: 'Cualquier variable guardada antes en el flujo' }
    ],
    ejemplo: 'Mensaje con botones: "Hola {{nombre_cliente}}, que tipo de reunion prefieres?" con botones: [Presencial] [Videollamada] [Telefonica]. Cada boton dirige a un camino distinto del flujo.'
  },
  pregunta: {
    titulo: 'Hacer Pregunta',
    descripcion: 'Envia una pregunta al cliente y espera su respuesta. La respuesta se guarda automaticamente en una variable que puedes usar despues en otros nodos. Soporta validacion: si la respuesta no cumple el formato, se vuelve a preguntar.',
    comoUsarlo: '1. Escribe la pregunta que quieres hacer.\n2. Selecciona el tipo de respuesta esperada (texto libre, email, telefono, numero, fecha, opcion multiple).\n3. Define el nombre de la variable donde se guardara la respuesta.\n4. Opcionalmente activa "Campo requerido" y un mensaje de error personalizado.\n5. El flujo se pausa hasta que el cliente responda.',
    variables: [
      { nombre: 'variable_destino', desc: 'La variable donde se guarda la respuesta (tu la defines)' },
      { nombre: '{{ultima_respuesta}}', desc: 'Siempre contiene la ultima respuesta del cliente' }
    ],
    ejemplo: 'Pregunta: "Cual es tu email para enviarte la confirmacion?" → tipo: email → variable: email_cliente. Si el cliente escribe algo que no es email, se muestra el mensaje de error y se repite la pregunta.'
  },
  condicion: {
    titulo: 'Condicion (Si/No)',
    descripcion: 'Evalua una variable y bifurca el flujo en dos caminos: uno cuando la condicion se cumple (Si) y otro cuando no (No). Es el nodo clave para crear flujos inteligentes con logica de decisiones.',
    comoUsarlo: '1. Indica que variable quieres evaluar (ej: tipo_reunion).\n2. Elige el operador: igual, no igual, contiene, no vacio, vacio, mayor que, menor que, regex.\n3. Si el operador lo requiere, escribe el valor a comparar.\n4. Conecta DOS salidas desde este nodo: una para "Si" (true) y otra para "No" (false).',
    variables: [
      { nombre: 'variable', desc: 'Cualquier variable guardada previamente en el flujo' }
    ],
    ejemplo: 'Variable: "tipo_reunion", Operador: "Es igual a", Valor: "presencial" → Si el cliente eligio presencial, va por el camino "Si" (se pide direccion). Si eligio otra cosa, va por el camino "No" (se pide link de Zoom).'
  },
  guardar_variable: {
    titulo: 'Guardar Variable',
    descripcion: 'Asigna un valor a una variable del flujo sin interaccion con el cliente. Util para setear valores por defecto, calcular campos derivados, o preparar datos antes de usarlos en otros nodos.',
    comoUsarlo: '1. Define el nombre de la variable (ej: tipo_reunion).\n2. Escribe el valor: puede ser texto fijo ("presencial") o una referencia a otra variable ({{ultima_respuesta}}).\n3. Elige el tipo: "Literal" para texto fijo, "Sistema" para valores como fecha_actual, hora_actual.',
    variables: [
      { nombre: 'variable', desc: 'Nombre de la variable que estas creando/modificando' },
      { nombre: '{{otra_variable}}', desc: 'Puedes referenciar variables existentes en el valor' }
    ],
    ejemplo: 'Variable: "estado_lead", Valor: "calificado", Tipo: Literal → Marca al lead como calificado para usarlo despues en una condicion o al guardar en base de datos.'
  },
  guardar_bd: {
    titulo: 'Datos en Base de Datos',
    descripcion: 'Guarda, busca o actualiza datos en tus tablas personalizadas. Modo clasico: inserta en base_cuentas. Modo tabla personalizada: crea tus propias tablas con columnas a medida y ejecuta INSERT, UPDATE, SELECT o DELETE.',
    comoUsarlo: 'Modo clasico: igual que siempre (base_cuentas).\n\nModo tabla personalizada:\n1. Selecciona "Tabla personalizada".\n2. Elige la operacion: INSERT para guardar, UPDATE para modificar, SELECT para consultar, DELETE para eliminar.\n3. Elige una tabla existente o crea una nueva definiendo columnas (o importando un CSV/Excel).\n4. Mapea cada columna a una variable del flujo usando {{variable}}.\n5. Para UPDATE/DELETE/SELECT: agrega filtros para seleccionar que registros afectar.',
    variables: [
      { nombre: '{{cualquier_variable}}', desc: 'Todas las variables del flujo disponibles en el mapeo' },
      { nombre: 'variable_resultado', desc: 'En SELECT: la variable donde se guardan los registros encontrados (array JSON)' }
    ],
    ejemplo: 'INSERT → tabla "clientes_captados": nombre={{nombre_cliente}}, email={{email_cliente}}, canal={{canal}}.\nSELECT → tabla "productos" con filtro categoria=premium → resultado en "productos_premium".\nUPDATE → tabla "leads" con filtro email={{email_cliente}} → actualizar estado="contactado".'
  },
  buscar_conocimiento: {
    titulo: 'Buscar en Conocimiento',
    descripcion: 'Busca informacion relevante en la base de conocimiento de la marca (creada con el Entrenador). Permite que la IA responda con informacion precisa sobre productos, servicios, precios, politicas, etc.',
    comoUsarlo: '1. Define la consulta: normalmente {{ultima_respuesta}} para buscar lo que pregunto el cliente.\n2. Opcionalmente filtra por categorias (productos, precios, horarios, etc.).\n3. Define donde guardar el resultado (variable_destino).\n4. Ajusta max resultados (1-20). Mas resultados = mas contexto pero mas lento.\n5. Conecta un nodo "Respuesta IA" despues para que la IA use este conocimiento.',
    variables: [
      { nombre: '{{ultima_respuesta}}', desc: 'Lo que pregunto el cliente (usado como consulta)' },
      { nombre: 'variable_destino', desc: 'Variable donde se guarda el resultado de la busqueda' }
    ],
    ejemplo: 'Consulta: "{{ultima_respuesta}}", Categorias: "productos, precios", Variable: "info_producto" → Si el cliente pregunta "Cuanto cuesta el plan premium?", busca en conocimiento y guarda la info relevante en info_producto.'
  },
  respuesta_ia: {
    titulo: 'Respuesta con IA',
    descripcion: 'Genera una respuesta inteligente usando IA (OpenAI). Puede usar el conocimiento de marca buscado previamente y las variables del flujo como contexto. Ideal para respuestas personalizadas y naturales.',
    comoUsarlo: '1. Escribe instrucciones claras para la IA: que tono usar, que informacion incluir, limites de la respuesta.\n2. Activa "Usar conocimiento del entrenador" si quieres que use info de la base de conocimiento.\n3. Activa "Incluir variables del flujo" para que la IA sepa el nombre del cliente, sus respuestas, etc.\n4. Combina con "Buscar conocimiento" antes para respuestas mas precisas.',
    variables: [
      { nombre: 'Todas las variables', desc: 'La IA recibe todas las variables del flujo como contexto' },
      { nombre: 'resultado_busqueda', desc: 'Si buscaste conocimiento antes, la IA lo usa automaticamente' }
    ],
    ejemplo: 'Instrucciones: "Responde sobre el producto que pregunto el cliente usando la informacion encontrada. Se amable, usa el nombre del cliente. Maximo 3 oraciones." → La IA genera: "Hola Juan! El Plan Premium cuesta $49/mes e incluye soporte prioritario."'
  },
  reconocer_respuesta: {
    titulo: 'Reconocer Respuesta (IA)',
    descripcion: 'Usa inteligencia artificial para ENTENDER lo que dice el cliente y tomar decisiones inteligentes. A diferencia del nodo "Condicion" que compara texto literalmente, este nodo comprende el significado del mensaje. Puede clasificar la respuesta en multiples caminos y ademas extraer datos automaticamente (nombres, telefonos, emails, etc.).',
    comoUsarlo: '1. Escribe instrucciones claras para la IA: que debe buscar o interpretar del mensaje.\n2. "Variable a analizar" indica que texto evaluar (por defecto ultima_respuesta).\n3. Agrega "Salidas posibles": cada salida es un camino diferente que puede tomar el flujo. La IA elige UNA basandose en lo que dijo el cliente.\n4. Opcionalmente agrega "Extracciones": variables que la IA debe extraer del texto (ej: numero de telefono, nombre, email).\n5. Conecta cada salida a un nodo diferente. Las conexiones se crean con tipo "salida_ia".',
    variables: [
      { nombre: 'variable_origen', desc: 'El texto que la IA analiza (por defecto ultima_respuesta)' },
      { nombre: 'Extracciones', desc: 'Variables que la IA extrae automaticamente del texto del cliente' },
      { nombre: 'salida elegida', desc: 'La IA clasifica el mensaje y el flujo sigue por la salida correspondiente' }
    ],
    ejemplo: 'Instrucciones: "Reconoce si el cliente entrego su numero de telefono"\nSalidas: "Entrego numero" / "No entrego numero" / "Pide mas info"\nExtracciones: telefono_cliente → "Extrae el numero si lo menciono"\n\nCliente dice: "Si, mi numero es 56912345678" → La IA elige "Entrego numero" y guarda 56912345678 en telefono_cliente.\nCliente dice: "Primero quiero saber los precios" → La IA elige "Pide mas info".'
  },
  crear_tarea: {
    titulo: 'Crear Tarea',
    descripcion: 'Crea automaticamente una tarea en el sistema de tareas del panel admin. Util para que el equipo haga seguimiento: llamar al lead, enviar propuesta, confirmar cita, etc. La tarea aparece en el dashboard del ejecutivo asignado.',
    comoUsarlo: '1. Define el titulo de la tarea (soporta variables: "Contactar a {{nombre_cliente}}").\n2. Escribe una descripcion con todos los datos relevantes del flujo.\n3. Selecciona la prioridad (alta, media, baja).\n4. La tarea se asigna automaticamente al ejecutivo disponible.',
    variables: [
      { nombre: '{{nombre_cliente}}', desc: 'Nombre del lead/cliente' },
      { nombre: '{{telefono_cliente}}', desc: 'Telefono para contacto' },
      { nombre: '{{canal}}', desc: 'Canal de origen' },
      { nombre: '{{cualquier_variable}}', desc: 'Cualquier variable del flujo' }
    ],
    ejemplo: 'Titulo: "Llamar a {{nombre_cliente}} - Lead calificado", Descripcion: "Lead desde {{canal}}. Email: {{email_cliente}}. Interes en: {{tipo_reunion}}", Prioridad: Alta → Se crea la tarea y el ejecutivo la ve en su panel.'
  },
  transferir_humano: {
    titulo: 'Transferir a Humano',
    descripcion: 'Transfiere la conversacion a un ejecutivo humano en el Dashboard Live. El flujo se pausa y un agente real toma el control. Ideal cuando el cliente necesita atencion personalizada o el flujo no puede resolver su caso.',
    comoUsarlo: '1. Escribe el mensaje que vera el cliente mientras espera (ej: "Te conecto con un ejecutivo...").\n2. Opcionalmente escribe un mensaje para el ejecutivo con contexto del caso.\n3. La conversacion aparece en Dashboard Live como "transferida".\n4. El ejecutivo puede ver todo el historial del flujo y las variables recopiladas.',
    variables: [
      { nombre: '{{nombre_cliente}}', desc: 'Se incluye automaticamente en la notificacion al ejecutivo' },
      { nombre: '{{canal}}', desc: 'Canal de origen para que el ejecutivo sepa por donde responder' },
      { nombre: '{{todas_las_variables}}', desc: 'El ejecutivo ve todas las variables del flujo' }
    ],
    ejemplo: 'Mensaje al usuario: "Entiendo, te estoy conectando con un ejecutivo que te ayudara con esto. Por favor espera un momento." Mensaje al ejecutivo: "Lead {{nombre_cliente}} desde {{canal}} necesita ayuda con {{tipo_consulta}}."'
  },
  agendar_cita: {
    titulo: 'Agendar Cita',
    descripcion: 'Crea un evento en Google Calendar con los datos recopilados en el flujo. Requiere que la marca tenga Google Calendar conectado desde la seccion de Integraciones. Automatiza completamente el agendamiento.',
    comoUsarlo: '1. Define el titulo de la cita (soporta variables).\n2. Configura la duracion en minutos (15-240).\n3. Escribe una descripcion opcional para el evento.\n4. IMPORTANTE: Antes de este nodo, debes haber recopilado las variables fecha_cita y hora_cita usando nodos "Pregunta".\n5. Requiere Google Calendar conectado en Configuracion > Integraciones.',
    variables: [
      { nombre: 'fecha_cita', desc: 'REQUERIDA - Fecha de la cita (formato YYYY-MM-DD)' },
      { nombre: 'hora_cita', desc: 'REQUERIDA - Hora de la cita (formato HH:MM)' },
      { nombre: '{{nombre_cliente}}', desc: 'Para el titulo del evento' },
      { nombre: '{{email_cliente}}', desc: 'Para enviar invitacion por correo' }
    ],
    ejemplo: 'Titulo: "Cita con {{nombre_cliente}}", Duracion: 30 min, Descripcion: "Reunion {{tipo_reunion}} - Lead desde {{canal}}" → Crea evento en Google Calendar para la fecha y hora indicadas por el cliente.'
  },
  usar_agente: {
    titulo: 'Usar Agente IA',
    descripcion: 'Transfiere el control completo de la conversacion a un agente IA autonomo. El agente piensa, entiende contexto, y persigue un objetivo usando herramientas. A diferencia de un flujo lineal, el agente se adapta a lo que dice el cliente y toma decisiones inteligentes.',
    comoUsarlo: '1. Selecciona el agente que manejara la conversacion (debe estar en estado "activo").\n2. Opcionalmente escribe un mensaje de transicion para el cliente.\n3. Cuando el flujo llega a este nodo, el agente toma control total.\n4. El agente responde mensaje a mensaje hasta cumplir su objetivo o ser cerrado manualmente.\n5. Este es un nodo TERMINAL: no tiene salida. El agente decide cuando finalizar.',
    variables: [
      { nombre: 'agente_id', desc: 'ID del agente seleccionado' },
      { nombre: 'mensaje_transicion', desc: 'Mensaje que se envia al cliente antes de transferir al agente' }
    ],
    ejemplo: 'Un flujo detecta que el cliente tiene dudas academicas (via reconocer_respuesta). El nodo "Usar Agente" activa al "Encargado Academico", que tiene acceso a conocimiento sobre campus, horarios y profesores. El agente conversa libremente con el cliente hasta resolver su duda.'
  },
  esperar: {
    titulo: 'Esperar Respuesta',
    descripcion: 'Pausa el flujo y espera a que el cliente envie un nuevo mensaje. A diferencia de "Pregunta", no valida el formato de la respuesta. Util cuando necesitas una respuesta abierta o el cliente necesita tiempo para decidir.',
    comoUsarlo: '1. Opcionalmente escribe un mensaje que se envia antes de esperar (ej: "Toma tu tiempo, escribe cuando estes listo").\n2. Define la variable donde guardar la respuesta del cliente.\n3. El flujo queda pausado indefinidamente hasta que el cliente responda.\n4. Cuando el cliente responde, el flujo continua automaticamente por la conexion de salida.',
    variables: [
      { nombre: 'variable_destino', desc: 'Variable donde se guarda la respuesta (tu la defines)' },
      { nombre: '{{ultima_respuesta}}', desc: 'Siempre contiene la ultima respuesta del cliente' }
    ],
    ejemplo: 'Mensaje: "Te enviamos la propuesta por email. Cuando la revises, escribenos aqui que te parecio." Variable: "feedback_propuesta" → El flujo espera dias si es necesario. Cuando el cliente responde, su mensaje se guarda en feedback_propuesta.'
  },
  fin: {
    titulo: 'Fin del Flujo',
    descripcion: 'Marca el final de una rama del flujo. Envia un mensaje de despedida opcional y ejecuta una accion final: cerrar la conversacion, volver al menu principal, o reiniciar el flujo desde cero.',
    comoUsarlo: '1. Escribe un mensaje de despedida (opcional pero recomendado).\n2. Elige la accion final:\n   - "Cerrar conversacion": Termina todo, la proxima vez el cliente inicia desde cero.\n   - "Volver al menu": Regresa al menu principal (si existe un flujo tipo menu).\n   - "Reiniciar flujo": Vuelve a ejecutar este mismo flujo desde el inicio.',
    variables: [
      { nombre: '{{nombre_cliente}}', desc: 'Para personalizar la despedida' },
      { nombre: '{{cualquier_variable}}', desc: 'Todas las variables del flujo para el mensaje final' }
    ],
    ejemplo: 'Mensaje: "Listo {{nombre_cliente}}, tu cita quedo agendada para {{fecha_cita}} a las {{hora_cita}}. Te enviamos la confirmacion a {{email_cliente}}. Que tengas un excelente dia!", Accion: Cerrar conversacion.'
  }
}

const TIPOS_MENSAJE = [
  { value: 'texto', label: 'Texto simple' },
  { value: 'botones', label: 'Con botones (max 3)' },
  { value: 'lista', label: 'Lista de opciones' }
]

const TIPOS_RESPUESTA = [
  { value: 'texto_libre', label: 'Texto libre' },
  { value: 'email', label: 'Email' },
  { value: 'telefono', label: 'Telefono' },
  { value: 'numero', label: 'Numero' },
  { value: 'fecha', label: 'Fecha' },
  { value: 'opcion_multiple', label: 'Opcion multiple' }
]

const OPERADORES = [
  { value: 'igual', label: 'Es igual a' },
  { value: 'no_igual', label: 'No es igual a' },
  { value: 'contiene', label: 'Contiene' },
  { value: 'no_vacio', label: 'No esta vacio' },
  { value: 'vacio', label: 'Esta vacio' },
  { value: 'mayor_que', label: 'Mayor que' },
  { value: 'menor_que', label: 'Menor que' },
  { value: 'regex', label: 'Regex' }
]

const CATEGORIAS_CONOCIMIENTO = [
  'identidad', 'productos', 'servicios', 'precios', 'publico_objetivo',
  'tono_voz', 'competencia', 'promociones', 'horarios', 'politicas',
  'contenido', 'faq', 'otro'
]

function NodeDocSection({ tipo }) {
  const [abierto, setAbierto] = useState(false)
  const doc = NODE_DOCS[tipo]
  if (!doc) return null

  return (
    <div className="node-doc-section">
      <button
        className={`node-doc-toggle ${abierto ? 'node-doc-toggle-open' : ''}`}
        onClick={() => setAbierto(!abierto)}
      >
        <span className="node-doc-toggle-icon">{abierto ? '▼' : '▶'}</span>
        <span>Como se usa</span>
      </button>
      {abierto && (
        <div className="node-doc-content">
          <div className="node-doc-block">
            <h4 className="node-doc-subtitle">{doc.titulo}</h4>
            <p className="node-doc-text">{doc.descripcion}</p>
          </div>
          <div className="node-doc-block">
            <h4 className="node-doc-subtitle">Instrucciones</h4>
            <p className="node-doc-text node-doc-pre">{doc.comoUsarlo}</p>
          </div>
          {doc.variables && doc.variables.length > 0 && (
            <div className="node-doc-block">
              <h4 className="node-doc-subtitle">Variables disponibles</h4>
              <div className="node-doc-vars">
                {doc.variables.map((v, i) => (
                  <div key={i} className="node-doc-var">
                    <code className="node-doc-var-name">{v.nombre}</code>
                    <span className="node-doc-var-desc">{v.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="node-doc-block">
            <h4 className="node-doc-subtitle">Ejemplo</h4>
            <p className="node-doc-text node-doc-ejemplo">{doc.ejemplo}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function NodeInspector({ nodo, onUpdate, onDelete }) {
  const { navegarA } = useView()
  const [datos, setDatos] = useState(nodo?.data || {})
  const [agentes, setAgentes] = useState([])
  const [cargandoAgentes, setCargandoAgentes] = useState(false)
  const [ejecutivos, setEjecutivos] = useState([])
  const [cargandoEjecutivos, setCargandoEjecutivos] = useState(false)
  const [tablasCustom, setTablasCustom] = useState([])
  const [cargandoTablas, setCargandoTablas] = useState(false)
  const [creandoTabla, setCreandoTabla] = useState(false)
  const [nuevaTabla, setNuevaTabla] = useState({ nombre: '', columnas: [] })
  const [importPreview, setImportPreview] = useState(null)
  const [guardandoTabla, setGuardandoTabla] = useState(false)

  useEffect(() => {
    setDatos(nodo?.data || {})
  }, [nodo?.id])

  // Cargar agentes cuando se selecciona un nodo usar_agente
  useEffect(() => {
    if (nodo?.type === 'usar_agente') {
      setCargandoAgentes(true)
      api.getAgentes()
        .then(result => setAgentes(result.agentes || []))
        .catch(() => setAgentes([]))
        .finally(() => setCargandoAgentes(false))
    }
  }, [nodo?.type, nodo?.id])

  // Cargar ejecutivos cuando se selecciona un nodo transferir_humano
  useEffect(() => {
    if (nodo?.type === 'transferir_humano') {
      setCargandoEjecutivos(true)
      api.getColaboradores()
        .then(result => setEjecutivos(result.data || []))
        .catch(() => setEjecutivos([]))
        .finally(() => setCargandoEjecutivos(false))
    }
  }, [nodo?.type, nodo?.id])

  // Cargar tablas custom cuando guardar_bd está en modo tabla_custom
  useEffect(() => {
    if (nodo?.type === 'guardar_bd' && datos.modo === 'tabla_custom') {
      setCargandoTablas(true)
      api.getTablasCustom()
        .then(r => setTablasCustom(r.tablas || []))
        .catch(() => setTablasCustom([]))
        .finally(() => setCargandoTablas(false))
    }
  }, [nodo?.type, datos.modo, nodo?.id])

  if (!nodo) {
    return (
      <div className="flow-inspector">
        <div className="flow-inspector-empty">
          Selecciona un nodo para editar sus propiedades
        </div>
      </div>
    )
  }

  const tipo = nodo.type

  const actualizar = (campo, valor) => {
    const nuevosDatos = { ...datos, [campo]: valor }
    setDatos(nuevosDatos)
    onUpdate(nodo.id, nuevosDatos)
  }

  const actualizarAnidado = (campo, subcampo, valor) => {
    const obj = { ...(datos[campo] || {}), [subcampo]: valor }
    actualizar(campo, obj)
  }

  const agregarBoton = () => {
    const botones = [...(datos.botones || [])]
    botones.push({ id: `btn_${Date.now()}`, texto: `Opcion ${botones.length + 1}` })
    actualizar('botones', botones)
  }

  const eliminarBoton = (idx) => {
    const botones = [...(datos.botones || [])]
    botones.splice(idx, 1)
    actualizar('botones', botones)
  }

  const actualizarBoton = (idx, campo, valor) => {
    const botones = [...(datos.botones || [])]
    botones[idx] = { ...botones[idx], [campo]: valor }
    actualizar('botones', botones)
  }

  return (
    <div className="flow-inspector">
      <div className="flow-inspector-header">
        <h3>Editar nodo</h3>
        <button className="flow-inspector-delete" onClick={() => onDelete(nodo.id)}>Eliminar</button>
      </div>

      <div className="flow-inspector-body">
        {/* INICIO */}
        {tipo === 'inicio' && (
          <div className="flow-inspector-info">
            Punto de entrada del flujo. Se activa cuando un mensaje coincide con el trigger configurado.
          </div>
        )}

        {/* MENSAJE */}
        {tipo === 'mensaje' && (
          <>
            <label className="flow-field">
              <span>Tipo de mensaje</span>
              <select value={datos.tipo_mensaje || 'texto'} onChange={e => actualizar('tipo_mensaje', e.target.value)}>
                {TIPOS_MENSAJE.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </label>
            <label className="flow-field">
              <span>Texto</span>
              <textarea
                value={datos.texto || ''}
                onChange={e => actualizar('texto', e.target.value)}
                placeholder="Escribe el mensaje... Usa {{variable}} para interpolar"
                rows={3}
              />
            </label>
            {(datos.tipo_mensaje === 'botones') && (
              <div className="flow-field">
                <span>Botones (max 3)</span>
                {(datos.botones || []).map((btn, i) => (
                  <div key={i} className="flow-boton-row">
                    <input
                      value={btn.texto || ''}
                      onChange={e => actualizarBoton(i, 'texto', e.target.value)}
                      placeholder="Texto del boton"
                      maxLength={20}
                    />
                    <input
                      value={btn.id || ''}
                      onChange={e => actualizarBoton(i, 'id', e.target.value)}
                      placeholder="ID"
                      style={{ width: 80 }}
                    />
                    <button className="flow-btn-mini" onClick={() => eliminarBoton(i)}>x</button>
                  </div>
                ))}
                {(datos.botones || []).length < 3 && (
                  <button className="flow-btn-add" onClick={agregarBoton}>+ Agregar boton</button>
                )}
              </div>
            )}
          </>
        )}

        {/* PREGUNTA */}
        {tipo === 'pregunta' && (
          <>
            <label className="flow-field">
              <span>Texto de la pregunta</span>
              <textarea
                value={datos.texto || ''}
                onChange={e => actualizar('texto', e.target.value)}
                placeholder="Ej: Cual es tu email?"
                rows={2}
              />
            </label>
            <label className="flow-field">
              <span>Tipo de respuesta</span>
              <select value={datos.tipo_respuesta || 'texto_libre'} onChange={e => actualizar('tipo_respuesta', e.target.value)}>
                {TIPOS_RESPUESTA.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </label>
            <label className="flow-field">
              <span>Guardar en variable</span>
              <input
                value={datos.variable_destino || ''}
                onChange={e => actualizar('variable_destino', e.target.value)}
                placeholder="nombre_cliente"
              />
            </label>
            <label className="flow-field-check">
              <input
                type="checkbox"
                checked={datos.validacion?.requerido || false}
                onChange={e => actualizarAnidado('validacion', 'requerido', e.target.checked)}
              />
              <span>Campo requerido</span>
            </label>
            <label className="flow-field">
              <span>Mensaje de error</span>
              <input
                value={datos.validacion?.mensaje_error || ''}
                onChange={e => actualizarAnidado('validacion', 'mensaje_error', e.target.value)}
                placeholder="Por favor ingresa un valor valido"
              />
            </label>
          </>
        )}

        {/* CONDICION */}
        {tipo === 'condicion' && (
          <>
            <label className="flow-field">
              <span>Variable a evaluar</span>
              <input
                value={datos.variable || ''}
                onChange={e => actualizar('variable', e.target.value)}
                placeholder="nombre_variable"
              />
            </label>
            <label className="flow-field">
              <span>Operador</span>
              <select value={datos.operador || 'no_vacio'} onChange={e => actualizar('operador', e.target.value)}>
                {OPERADORES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>
            {!['no_vacio', 'vacio'].includes(datos.operador) && (
              <label className="flow-field">
                <span>Valor a comparar</span>
                <input
                  value={datos.valor || ''}
                  onChange={e => actualizar('valor', e.target.value)}
                  placeholder="valor"
                />
              </label>
            )}
          </>
        )}

        {/* GUARDAR VARIABLE */}
        {tipo === 'guardar_variable' && (
          <>
            <label className="flow-field">
              <span>Nombre de la variable</span>
              <input
                value={datos.variable || ''}
                onChange={e => actualizar('variable', e.target.value)}
                placeholder="tipo_reunion"
              />
            </label>
            <label className="flow-field">
              <span>Valor</span>
              <input
                value={datos.valor || ''}
                onChange={e => actualizar('valor', e.target.value)}
                placeholder="videollamada o {{variable}}"
              />
            </label>
            <label className="flow-field">
              <span>Tipo de valor</span>
              <select value={datos.tipo_valor || 'literal'} onChange={e => actualizar('tipo_valor', e.target.value)}>
                <option value="literal">Literal (texto fijo)</option>
                <option value="sistema">Sistema (fecha_actual, hora_actual, etc)</option>
              </select>
            </label>
          </>
        )}

        {/* GUARDAR BD */}
        {tipo === 'guardar_bd' && (
          <>
            {/* Toggle modo */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
              {['clasico', 'tabla_custom'].map(m => (
                <button
                  key={m}
                  onClick={() => actualizar('modo', m)}
                  style={{
                    flex: 1, padding: '5px 8px', fontSize: 11, borderRadius: 6, cursor: 'pointer', fontWeight: 600,
                    background: datos.modo === m ? '#10b981' : 'transparent',
                    color: datos.modo === m ? '#fff' : '#6b7280',
                    border: `1.5px solid ${datos.modo === m ? '#10b981' : '#d1d5db'}`
                  }}
                >
                  {m === 'clasico' ? 'Clásico' : 'Tabla personalizada'}
                </button>
              ))}
            </div>

            {/* ── MODO CLÁSICO ── */}
            {(datos.modo || 'clasico') === 'clasico' && (
              <>
                <label className="flow-field">
                  <span>Tabla</span>
                  <input value={datos.tabla || 'base_cuentas'} onChange={e => actualizar('tabla', e.target.value)} />
                </label>
                <label className="flow-field">
                  <span>Categoria</span>
                  <input value={datos.campos?.categoria || ''} onChange={e => actualizarAnidado('campos', 'categoria', e.target.value)} placeholder="lead" />
                </label>
                <label className="flow-field">
                  <span>Clave</span>
                  <input value={datos.campos?.clave || ''} onChange={e => actualizarAnidado('campos', 'clave', e.target.value)} placeholder="{{nombre_cliente}}" />
                </label>
                <label className="flow-field">
                  <span>Valor</span>
                  <textarea value={datos.campos?.valor || ''} onChange={e => actualizarAnidado('campos', 'valor', e.target.value)} placeholder="Email: {{email_cliente}}" rows={2} />
                </label>
              </>
            )}

            {/* ── MODO TABLA CUSTOM ── */}
            {datos.modo === 'tabla_custom' && (
              <>
                {/* Operación */}
                <label className="flow-field">
                  <span>Operación</span>
                  <select value={datos.operacion || 'insert'} onChange={e => actualizar('operacion', e.target.value)}>
                    <option value="insert">INSERT – Insertar registro</option>
                    <option value="update">UPDATE – Actualizar registros</option>
                    <option value="select">SELECT – Consultar registros</option>
                    <option value="delete">DELETE – Eliminar registros</option>
                  </select>
                </label>

                {/* Selector de tabla */}
                {!creandoTabla ? (
                  <label className="flow-field">
                    <span>Tabla</span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <select
                        style={{ flex: 1 }}
                        value={datos.tabla_id || ''}
                        onChange={e => {
                          const t = tablasCustom.find(x => x.id === Number(e.target.value))
                          actualizar('tabla_id', t?.id || null)
                          actualizar('tabla_nombre', t?.nombre || '')
                        }}
                      >
                        <option value="">— {cargandoTablas ? 'Cargando...' : 'Selecciona tabla'} —</option>
                        {tablasCustom.map(t => (
                          <option key={t.id} value={t.id}>{t.nombre} ({t.total_registros || 0} reg)</option>
                        ))}
                      </select>
                      <button
                        onClick={() => { setCreandoTabla(true); setNuevaTabla({ nombre: '', columnas: [] }); setImportPreview(null) }}
                        style={{ padding: '4px 8px', fontSize: 11, background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', whiteSpace: 'nowrap' }}
                      >
                        + Nueva
                      </button>
                    </div>
                  </label>
                ) : (
                  /* ── Formulario de nueva tabla ── */
                  <div style={{ border: '1.5px solid #6366f1', borderRadius: 8, padding: 10, marginBottom: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: 12, color: '#6366f1', marginBottom: 8 }}>Nueva tabla</div>
                    <label className="flow-field">
                      <span>Nombre de la tabla</span>
                      <input
                        value={nuevaTabla.nombre}
                        onChange={e => setNuevaTabla(p => ({ ...p, nombre: e.target.value }))}
                        placeholder="ej: clientes_captados"
                      />
                    </label>

                    {/* Columnas manuales */}
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Columnas</div>
                    {(nuevaTabla.columnas || []).map((col, i) => (
                      <div key={i} style={{ display: 'flex', gap: 4, marginBottom: 4, alignItems: 'center' }}>
                        <input
                          value={col.nombre}
                          onChange={e => {
                            const cols = [...nuevaTabla.columnas]
                            cols[i] = { ...cols[i], nombre: e.target.value }
                            setNuevaTabla(p => ({ ...p, columnas: cols }))
                          }}
                          placeholder="nombre_columna"
                          style={{ flex: 2, padding: '3px 6px', fontSize: 11, borderRadius: 4, border: '1px solid #d1d5db' }}
                        />
                        <select
                          value={col.tipo}
                          onChange={e => {
                            const cols = [...nuevaTabla.columnas]
                            cols[i] = { ...cols[i], tipo: e.target.value }
                            setNuevaTabla(p => ({ ...p, columnas: cols }))
                          }}
                          style={{ flex: 1, padding: '3px 6px', fontSize: 11, borderRadius: 4, border: '1px solid #d1d5db' }}
                        >
                          <option value="texto">Texto</option>
                          <option value="numero">Número</option>
                          <option value="email">Email</option>
                          <option value="fecha">Fecha</option>
                          <option value="booleano">Booleano</option>
                        </select>
                        <button
                          onClick={() => setNuevaTabla(p => ({ ...p, columnas: p.columnas.filter((_, j) => j !== i) }))}
                          style={{ padding: '2px 7px', fontSize: 12, background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                        >×</button>
                      </div>
                    ))}
                    <button
                      onClick={() => setNuevaTabla(p => ({ ...p, columnas: [...p.columnas, { nombre: '', tipo: 'texto', requerido: false }] }))}
                      style={{ fontSize: 11, color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0', marginBottom: 6 }}
                    >+ Agregar columna</button>

                    {/* Import CSV/Excel */}
                    <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>O importar esquema desde archivo:</div>
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls,.ods"
                      style={{ fontSize: 11, marginBottom: 6 }}
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        const fd = new FormData()
                        fd.append('archivo', file)
                        try {
                          const res = await api.importarEsquemaCSV(fd)
                          setImportPreview(res)
                          setNuevaTabla(p => ({ ...p, columnas: res.columnas_detectadas || [] }))
                        } catch (err) {
                          alert('Error al analizar el archivo: ' + err.message)
                        }
                      }}
                    />
                    {importPreview && (
                      <div style={{ fontSize: 10, color: '#059669', marginBottom: 6 }}>
                        ✓ {importPreview.total_filas} filas detectadas · {importPreview.columnas_detectadas?.length} columnas
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                      <button
                        disabled={guardandoTabla || !nuevaTabla.nombre.trim()}
                        onClick={async () => {
                          if (!nuevaTabla.nombre.trim()) return
                          setGuardandoTabla(true)
                          try {
                            const res = await api.crearTablaCustom({
                              nombre: nuevaTabla.nombre.trim(),
                              columnas: nuevaTabla.columnas
                            })
                            const t = res.tabla
                            setTablasCustom(prev => [t, ...prev])
                            actualizar('tabla_id', t.id)
                            actualizar('tabla_nombre', t.nombre)

                            // Si hay importPreview → importar datos también
                            if (importPreview?.preview_filas) {
                              const fd2 = new FormData()
                              // Nota: para importar datos se necesita el archivo de nuevo
                              // (el preview no guarda los datos completos por seguridad)
                              // El usuario puede importar desde la vista "Mis Tablas"
                            }

                            setCreandoTabla(false)
                            setNuevaTabla({ nombre: '', columnas: [] })
                            setImportPreview(null)
                          } catch (err) {
                            alert('Error al crear tabla: ' + err.message)
                          } finally {
                            setGuardandoTabla(false)
                          }
                        }}
                        style={{ flex: 1, padding: '5px', fontSize: 11, background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', opacity: guardandoTabla ? 0.6 : 1 }}
                      >
                        {guardandoTabla ? 'Creando...' : 'Crear tabla'}
                      </button>
                      <button
                        onClick={() => { setCreandoTabla(false); setImportPreview(null) }}
                        style={{ padding: '5px 10px', fontSize: 11, background: 'transparent', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer' }}
                      >Cancelar</button>
                    </div>
                  </div>
                )}

                {/* Tabla seleccionada → mostrar columnas de la tabla */}
                {datos.tabla_id && !creandoTabla && (() => {
                  const tablaSeleccionada = tablasCustom.find(t => t.id === datos.tabla_id)
                  const columnas = tablaSeleccionada?.columnas || []
                  const mapeo = datos.mapeo || []
                  const filtros = datos.filtros || []
                  const operacion = datos.operacion || 'insert'

                  return (
                    <>
                      {/* Mapeo de columnas (INSERT / UPDATE) */}
                      {(operacion === 'insert' || operacion === 'update') && columnas.length > 0 && (
                        <div style={{ marginBottom: 8 }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                            {operacion === 'insert' ? 'Mapeo de columnas' : 'Datos a actualizar'}
                          </div>
                          {columnas.map((col, i) => {
                            const item = mapeo.find(m => m.columna === col.nombre) || { columna: col.nombre, valor: '' }
                            return (
                              <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
                                <span style={{ fontSize: 10, color: '#6b7280', minWidth: 90, maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={col.nombre}>
                                  {col.nombre}
                                </span>
                                <input
                                  value={item.valor}
                                  onChange={e => {
                                    const nuevo = mapeo.filter(m => m.columna !== col.nombre)
                                    nuevo.push({ columna: col.nombre, valor: e.target.value })
                                    actualizar('mapeo', nuevo)
                                  }}
                                  placeholder={`{{${col.nombre}}}`}
                                  style={{ flex: 1, padding: '3px 6px', fontSize: 11, borderRadius: 4, border: '1px solid #d1d5db' }}
                                />
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {/* Mapeo manual (INSERT sin columnas definidas) */}
                      {(operacion === 'insert' || operacion === 'update') && columnas.length === 0 && (
                        <div style={{ marginBottom: 8 }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Mapeo de columnas</div>
                          {mapeo.map((item, i) => (
                            <div key={i} style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 4 }}>
                              <input
                                value={item.columna}
                                onChange={e => { const m = [...mapeo]; m[i] = { ...m[i], columna: e.target.value }; actualizar('mapeo', m) }}
                                placeholder="columna"
                                style={{ flex: 1, padding: '3px 6px', fontSize: 11, borderRadius: 4, border: '1px solid #d1d5db' }}
                              />
                              <input
                                value={item.valor}
                                onChange={e => { const m = [...mapeo]; m[i] = { ...m[i], valor: e.target.value }; actualizar('mapeo', m) }}
                                placeholder="{{variable}}"
                                style={{ flex: 1, padding: '3px 6px', fontSize: 11, borderRadius: 4, border: '1px solid #d1d5db' }}
                              />
                              <button onClick={() => actualizar('mapeo', mapeo.filter((_, j) => j !== i))} style={{ padding: '2px 7px', fontSize: 12, background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>×</button>
                            </div>
                          ))}
                          <button onClick={() => actualizar('mapeo', [...mapeo, { columna: '', valor: '' }])} style={{ fontSize: 11, color: '#10b981', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0' }}>+ Agregar campo</button>
                        </div>
                      )}

                      {/* Filtros WHERE (UPDATE / DELETE / SELECT) */}
                      {(operacion === 'update' || operacion === 'delete' || operacion === 'select') && (
                        <div style={{ marginBottom: 8 }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Filtros (condición WHERE)</div>
                          {filtros.map((f, i) => (
                            <div key={i} style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 4 }}>
                              <input
                                value={f.columna}
                                onChange={e => { const arr = [...filtros]; arr[i] = { ...arr[i], columna: e.target.value }; actualizar('filtros', arr) }}
                                placeholder="columna"
                                style={{ flex: 2, padding: '3px 6px', fontSize: 11, borderRadius: 4, border: '1px solid #d1d5db' }}
                              />
                              <select
                                value={f.operador || 'eq'}
                                onChange={e => { const arr = [...filtros]; arr[i] = { ...arr[i], operador: e.target.value }; actualizar('filtros', arr) }}
                                style={{ flex: 1, padding: '3px 4px', fontSize: 10, borderRadius: 4, border: '1px solid #d1d5db' }}
                              >
                                <option value="eq">= igual</option>
                                <option value="neq">≠ distinto</option>
                                <option value="like">~ contiene</option>
                                <option value="gt">&gt; mayor</option>
                                <option value="lt">&lt; menor</option>
                              </select>
                              <input
                                value={f.valor}
                                onChange={e => { const arr = [...filtros]; arr[i] = { ...arr[i], valor: e.target.value }; actualizar('filtros', arr) }}
                                placeholder="valor / {{var}}"
                                style={{ flex: 2, padding: '3px 6px', fontSize: 11, borderRadius: 4, border: '1px solid #d1d5db' }}
                              />
                              <button onClick={() => actualizar('filtros', filtros.filter((_, j) => j !== i))} style={{ padding: '2px 7px', fontSize: 12, background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>×</button>
                            </div>
                          ))}
                          <button onClick={() => actualizar('filtros', [...filtros, { columna: '', operador: 'eq', valor: '' }])} style={{ fontSize: 11, color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0' }}>+ Agregar filtro</button>
                        </div>
                      )}

                      {/* Variable resultado (SELECT) */}
                      {operacion === 'select' && (
                        <label className="flow-field">
                          <span>Guardar resultado en variable</span>
                          <input
                            value={datos.variable_resultado || ''}
                            onChange={e => actualizar('variable_resultado', e.target.value)}
                            placeholder="ej: registros_encontrados"
                          />
                        </label>
                      )}
                    </>
                  )
                })()}

                <div className="flow-field-info" style={{ marginTop: 8 }}>
                  {datos.tabla_id
                    ? `Tabla: ${datos.tabla_nombre} · ${datos.operacion?.toUpperCase() || 'INSERT'}`
                    : 'Selecciona o crea una tabla para configurar el mapeo'}
                </div>
              </>
            )}
          </>
        )}

        {/* BUSCAR CONOCIMIENTO */}
        {tipo === 'buscar_conocimiento' && (
          <>
            <label className="flow-field">
              <span>Consulta de busqueda</span>
              <input
                value={datos.consulta || ''}
                onChange={e => actualizar('consulta', e.target.value)}
                placeholder="{{ultima_respuesta}}"
              />
            </label>
            <label className="flow-field">
              <span>Categorias (separadas por coma)</span>
              <input
                value={(datos.categorias || []).join(', ')}
                onChange={e => actualizar('categorias', e.target.value.split(',').map(c => c.trim()).filter(Boolean))}
                placeholder="productos, precios, horarios"
              />
            </label>
            <label className="flow-field">
              <span>Guardar resultado en variable</span>
              <input
                value={datos.variable_destino || ''}
                onChange={e => actualizar('variable_destino', e.target.value)}
                placeholder="resultado_busqueda"
              />
            </label>
            <label className="flow-field">
              <span>Max resultados</span>
              <input
                type="number"
                value={datos.max_resultados || 5}
                onChange={e => actualizar('max_resultados', parseInt(e.target.value) || 5)}
                min={1}
                max={20}
              />
            </label>
          </>
        )}

        {/* RESPUESTA IA */}
        {tipo === 'respuesta_ia' && (
          <>
            <label className="flow-field">
              <span>Instrucciones para la IA</span>
              <textarea
                value={datos.instrucciones || ''}
                onChange={e => actualizar('instrucciones', e.target.value)}
                placeholder="Responde usando el conocimiento de marca..."
                rows={3}
              />
            </label>
            <label className="flow-field-check">
              <input
                type="checkbox"
                checked={datos.usar_conocimiento !== false}
                onChange={e => actualizar('usar_conocimiento', e.target.checked)}
              />
              <span>Usar conocimiento del entrenador</span>
            </label>
            <label className="flow-field-check">
              <input
                type="checkbox"
                checked={datos.usar_variables !== false}
                onChange={e => actualizar('usar_variables', e.target.checked)}
              />
              <span>Incluir variables del flujo como contexto</span>
            </label>
          </>
        )}

        {/* CREAR TAREA */}
        {tipo === 'crear_tarea' && (
          <>
            <label className="flow-field">
              <span>Titulo de la tarea</span>
              <input
                value={datos.titulo || ''}
                onChange={e => actualizar('titulo', e.target.value)}
                placeholder="Contactar a {{nombre_cliente}}"
              />
            </label>
            <label className="flow-field">
              <span>Descripcion</span>
              <textarea
                value={datos.descripcion || ''}
                onChange={e => actualizar('descripcion', e.target.value)}
                placeholder="Lead desde flujo WhatsApp..."
                rows={2}
              />
            </label>
            <label className="flow-field">
              <span>Prioridad</span>
              <select value={datos.prioridad || 'media'} onChange={e => actualizar('prioridad', e.target.value)}>
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </label>
          </>
        )}

        {/* TRANSFERIR HUMANO */}
        {tipo === 'transferir_humano' && (
          <>
            <div className="flow-field">
              <span>Ejecutivo asignado</span>
              {cargandoEjecutivos ? (
                <div className="flow-field-info">Cargando ejecutivos...</div>
              ) : ejecutivos.length > 0 ? (
                <>
                  <select
                    value={datos.ejecutivo_id || ''}
                    onChange={e => {
                      const id = e.target.value ? Number(e.target.value) : null
                      const ej = ejecutivos.find(u => u.id === id)
                      const nuevosDatos = {
                        ...datos,
                        ejecutivo_id: id,
                        ejecutivo_nombre: ej?.nombre || ''
                      }
                      setDatos(nuevosDatos)
                      onUpdate(nodo.id, nuevosDatos)
                    }}
                    style={{ width: '100%' }}
                  >
                    <option value="">Todos los ejecutivos (notificacion general)</option>
                    {ejecutivos.map(ej => (
                      <option key={ej.id} value={ej.id}>
                        {ej.nombre} {ej.telefono ? `(${ej.telefono})` : '(sin telefono)'}
                      </option>
                    ))}
                  </select>
                  <small style={{ color: '#888', fontSize: '11px', display: 'block', marginTop: 4 }}>
                    {datos.ejecutivo_id
                      ? 'Se notificara por WhatsApp al ejecutivo seleccionado'
                      : 'Se creara notificacion en el panel para todos los ejecutivos'}
                  </small>
                </>
              ) : (
                <div className="flow-field-info">No hay ejecutivos disponibles</div>
              )}
            </div>

            <label className="flow-field flow-toggle">
              <span>Notificar al cliente</span>
              <input
                type="checkbox"
                checked={datos.notificar_cliente !== false}
                onChange={e => actualizar('notificar_cliente', e.target.checked)}
              />
              <small style={{ color: '#888', fontSize: '11px', display: 'block', marginTop: 4 }}>
                {datos.notificar_cliente === false
                  ? 'Transferencia silenciosa: el cliente no sabra que fue transferido'
                  : 'Se enviara el mensaje de abajo al cliente'}
              </small>
            </label>
            {datos.notificar_cliente !== false && (
              <label className="flow-field">
                <span>Mensaje al usuario</span>
                <textarea
                  value={datos.mensaje_usuario || ''}
                  onChange={e => actualizar('mensaje_usuario', e.target.value)}
                  placeholder="Te estoy conectando con un ejecutivo..."
                  rows={2}
                />
              </label>
            )}
            <label className="flow-field">
              <span>Mensaje al ejecutivo (contexto)</span>
              <textarea
                value={datos.mensaje_ejecutivo || ''}
                onChange={e => actualizar('mensaje_ejecutivo', e.target.value)}
                placeholder="Nuevo lead desde {{canal}}: {{nombre_cliente}}"
                rows={2}
              />
              <small style={{ color: '#888', fontSize: '11px', display: 'block', marginTop: 4 }}>
                Este texto se incluye en la notificacion WhatsApp como contexto adicional
              </small>
            </label>
          </>
        )}

        {/* RECONOCER RESPUESTA */}
        {tipo === 'reconocer_respuesta' && (
          <>
            <label className="flow-field">
              <span>Instrucciones para la IA</span>
              <textarea
                value={datos.instrucciones || ''}
                onChange={e => actualizar('instrucciones', e.target.value)}
                placeholder="Ej: Reconoce si el cliente entrego su numero de telefono en el mensaje"
                rows={3}
              />
            </label>
            <label className="flow-field">
              <span>Variable a analizar</span>
              <input
                value={datos.variable_origen || ''}
                onChange={e => actualizar('variable_origen', e.target.value)}
                placeholder="ultima_respuesta"
              />
            </label>
            <label className="flow-field-check">
              <input
                type="checkbox"
                checked={datos.usar_contexto_completo !== false}
                onChange={e => actualizar('usar_contexto_completo', e.target.checked)}
              />
              <span>Incluir toda la conversacion como contexto</span>
            </label>
            <div className="flow-field-info">
              Si esta activo, la IA recibe todo el historial de la conversacion ademas del ultimo mensaje.
              Esto le permite entender mejor el contexto de la respuesta del cliente.
            </div>

            {/* Salidas posibles */}
            <div className="flow-field">
              <span>Salidas posibles (caminos del flujo)</span>
              {(datos.salidas || []).map((salida, i) => (
                <div key={i} className="flow-reconocer-salida-row">
                  <input
                    value={salida.id || ''}
                    onChange={e => {
                      const salidas = [...(datos.salidas || [])]
                      salidas[i] = { ...salidas[i], id: e.target.value }
                      actualizar('salidas', salidas)
                    }}
                    placeholder="id_salida"
                    style={{ width: 90 }}
                  />
                  <input
                    value={salida.descripcion || ''}
                    onChange={e => {
                      const salidas = [...(datos.salidas || [])]
                      salidas[i] = { ...salidas[i], descripcion: e.target.value }
                      actualizar('salidas', salidas)
                    }}
                    placeholder="Descripcion para la IA"
                    style={{ flex: 1 }}
                  />
                  <button
                    className="flow-btn-mini"
                    onClick={() => {
                      const salidas = [...(datos.salidas || [])]
                      salidas.splice(i, 1)
                      actualizar('salidas', salidas)
                    }}
                  >x</button>
                </div>
              ))}
              <button
                className="flow-btn-add"
                onClick={() => {
                  const salidas = [...(datos.salidas || [])]
                  salidas.push({ id: `salida_${salidas.length + 1}`, descripcion: '' })
                  actualizar('salidas', salidas)
                }}
              >+ Agregar salida</button>
            </div>

            {/* Extracciones */}
            <div className="flow-field">
              <span>Extraer datos del texto (opcional)</span>
              {(datos.extracciones || []).map((ext, i) => (
                <div key={i} className="flow-reconocer-ext-row">
                  <input
                    value={ext.variable || ''}
                    onChange={e => {
                      const extracciones = [...(datos.extracciones || [])]
                      extracciones[i] = { ...extracciones[i], variable: e.target.value }
                      actualizar('extracciones', extracciones)
                    }}
                    placeholder="variable"
                    style={{ width: 100 }}
                  />
                  <input
                    value={ext.instruccion || ''}
                    onChange={e => {
                      const extracciones = [...(datos.extracciones || [])]
                      extracciones[i] = { ...extracciones[i], instruccion: e.target.value }
                      actualizar('extracciones', extracciones)
                    }}
                    placeholder="Que extraer: ej. el numero de telefono"
                    style={{ flex: 1 }}
                  />
                  <button
                    className="flow-btn-mini"
                    onClick={() => {
                      const extracciones = [...(datos.extracciones || [])]
                      extracciones.splice(i, 1)
                      actualizar('extracciones', extracciones)
                    }}
                  >x</button>
                </div>
              ))}
              <button
                className="flow-btn-add"
                onClick={() => {
                  const extracciones = [...(datos.extracciones || [])]
                  extracciones.push({ variable: '', instruccion: '' })
                  actualizar('extracciones', extracciones)
                }}
              >+ Agregar extraccion</button>
            </div>
          </>
        )}

        {/* USAR AGENTE */}
        {tipo === 'usar_agente' && (
          <>
            <div className="flow-field">
              <span>Seleccionar agente</span>
              {cargandoAgentes ? (
                <div className="flow-field-info">Cargando agentes...</div>
              ) : agentes.length > 0 ? (
                <div className="flow-agente-list">
                  {agentes.map(ag => {
                    const seleccionado = datos.agente_id === ag.id
                    return (
                      <button
                        key={ag.id}
                        type="button"
                        className={`flow-agente-option ${seleccionado ? 'flow-agente-option-active' : ''}`}
                        onClick={() => {
                          const nuevosDatos = { ...datos, agente_id: ag.id, agente_nombre: ag.nombre, agente_icono: ag.icono }
                          setDatos(nuevosDatos)
                          onUpdate(nodo.id, nuevosDatos)
                        }}
                      >
                        <span className="flow-agente-option-icon">{ag.icono || '🤖'}</span>
                        <div className="flow-agente-option-info">
                          <span className="flow-agente-option-name">{ag.nombre}</span>
                          <span className="flow-agente-option-estado">
                            {ag.estado === 'activo' ? '● Activo' : ag.estado === 'borrador' ? '○ Borrador' : '◐ Pausado'}
                          </span>
                        </div>
                        {seleccionado && <span className="flow-agente-option-check">✓</span>}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="flow-agente-empty">
                  <p>No hay agentes creados</p>
                  <button
                    type="button"
                    className="flow-agente-crear-btn"
                    onClick={() => navegarA('agentes')}
                  >
                    + Crear agente
                  </button>
                </div>
              )}
            </div>

            {datos.agente_id && (
              <div className="flow-agente-selected-info">
                <span className="flow-agente-selected-icon">{datos.agente_icono || agentes.find(a => a.id === datos.agente_id)?.icono || '🤖'}</span>
                <span>{datos.agente_nombre || agentes.find(a => a.id === datos.agente_id)?.nombre || 'Agente seleccionado'}</span>
              </div>
            )}

            <label className="flow-field">
              <span>Mensaje de transicion</span>
              <textarea
                value={datos.mensaje_transicion || ''}
                onChange={e => actualizar('mensaje_transicion', e.target.value)}
                placeholder="Te voy a conectar con nuestro asistente especializado..."
                rows={2}
              />
            </label>
            {/* SALIDAS DEL AGENTE */}
            <div className="flow-field">
              <span>Salidas del agente</span>
              <div className="flow-field-info" style={{ marginBottom: 6 }}>
                Cuando el agente finalice, elegira automaticamente una salida. Conecta cada salida a otro nodo (otro agente, mensaje, fin, etc.)
              </div>
              {(datos.salidas || []).map((salida, i) => (
                <div key={i} className="flow-reconocer-salida-row">
                  <input
                    value={salida.id || ''}
                    onChange={e => {
                      const salidas = [...(datos.salidas || [])]
                      salidas[i] = { ...salidas[i], id: e.target.value }
                      actualizar('salidas', salidas)
                    }}
                    placeholder="id_salida"
                    style={{ width: 90 }}
                  />
                  <input
                    value={salida.descripcion || ''}
                    onChange={e => {
                      const salidas = [...(datos.salidas || [])]
                      salidas[i] = { ...salidas[i], descripcion: e.target.value }
                      actualizar('salidas', salidas)
                    }}
                    placeholder="Descripcion (ej: Cliente satisfecho)"
                    style={{ flex: 1 }}
                  />
                  <button
                    className="flow-btn-mini"
                    onClick={() => {
                      const salidas = [...(datos.salidas || [])]
                      salidas.splice(i, 1)
                      actualizar('salidas', salidas)
                    }}
                  >x</button>
                </div>
              ))}
              <button
                className="flow-btn-add"
                onClick={() => {
                  const salidas = [...(datos.salidas || [])]
                  salidas.push({ id: `salida_${salidas.length + 1}`, descripcion: '' })
                  actualizar('salidas', salidas)
                }}
              >+ Agregar salida</button>
            </div>

            <label className="flow-field">
              <span>Variable resultado</span>
              <input
                value={datos.variable_resultado || ''}
                onChange={e => actualizar('variable_resultado', e.target.value)}
                placeholder="resultado_agente"
              />
              <span style={{ fontSize: 10, color: '#6b7280' }}>La ultima respuesta del agente se guardara en esta variable</span>
            </label>

            <div className="flow-field-info">
              {(datos.salidas || []).length > 0
                ? `${(datos.salidas || []).length} salida(s) configurada(s). El agente elige automaticamente la salida al finalizar.`
                : 'Sin salidas: el flujo continuara por la conexion directa al finalizar el agente.'}
            </div>
          </>
        )}

        {/* ESPERAR RESPUESTA */}
        {tipo === 'esperar' && (
          <>
            <label className="flow-field">
              <span>Mensaje antes de esperar (opcional)</span>
              <textarea
                value={datos.mensaje_espera || ''}
                onChange={e => actualizar('mensaje_espera', e.target.value)}
                placeholder="Puedes escribir tu respuesta cuando quieras..."
                rows={2}
              />
            </label>
            <label className="flow-field">
              <span>Guardar respuesta en variable</span>
              <input
                type="text"
                value={datos.variable_destino || ''}
                onChange={e => actualizar('variable_destino', e.target.value)}
                placeholder="respuesta_cliente"
              />
            </label>
            <div className="flow-field-info">
              El flujo se pausa hasta que el cliente envie un mensaje.
              La respuesta se guarda en la variable indicada.
            </div>
          </>
        )}

        {/* AGENDAR CITA */}
        {tipo === 'agendar_cita' && (
          <>
            <label className="flow-field">
              <span>Titulo de la cita</span>
              <input
                type="text"
                value={datos.titulo || ''}
                onChange={e => actualizar('titulo', e.target.value)}
                placeholder="Cita con {{nombre_cliente}}"
              />
            </label>
            <label className="flow-field">
              <span>Duracion (minutos)</span>
              <input
                type="number"
                value={datos.duracion_minutos || 30}
                onChange={e => actualizar('duracion_minutos', parseInt(e.target.value) || 30)}
                min={15}
                max={240}
              />
            </label>
            <label className="flow-field">
              <span>Descripcion</span>
              <textarea
                value={datos.descripcion || ''}
                onChange={e => actualizar('descripcion', e.target.value)}
                placeholder="Cita agendada desde flujo {{canal}}"
                rows={2}
              />
            </label>
            <div className="flow-field-info">
              Variables requeridas: <strong>fecha_cita</strong>, <strong>hora_cita</strong>.
              Opcionales: nombre_cliente, email_cliente.
              Requiere Google Calendar conectado en Integraciones.
            </div>
          </>
        )}

        {/* FIN */}
        {tipo === 'fin' && (
          <>
            <label className="flow-field">
              <span>Mensaje de despedida</span>
              <textarea
                value={datos.mensaje_despedida || ''}
                onChange={e => actualizar('mensaje_despedida', e.target.value)}
                placeholder="Gracias por contactarnos!"
                rows={2}
              />
            </label>
            <label className="flow-field">
              <span>Accion al finalizar</span>
              <select value={datos.accion || 'cerrar'} onChange={e => actualizar('accion', e.target.value)}>
                <option value="cerrar">Cerrar conversacion</option>
                <option value="volver_menu">Volver al menu</option>
                <option value="reiniciar_flujo">Reiniciar flujo</option>
              </select>
            </label>
          </>
        )}

        {/* Seccion de documentacion del nodo */}
        <NodeDocSection tipo={tipo} />
      </div>
    </div>
  )
}
