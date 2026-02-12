'use client'

import { useState, useEffect } from 'react'

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

export default function NodeInspector({ nodo, onUpdate, onDelete }) {
  const [datos, setDatos] = useState(nodo?.data || {})

  useEffect(() => {
    setDatos(nodo?.data || {})
  }, [nodo?.id])

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
            <label className="flow-field">
              <span>Tabla</span>
              <input value={datos.tabla || 'base_cuentas'} onChange={e => actualizar('tabla', e.target.value)} />
            </label>
            <label className="flow-field">
              <span>Categoria</span>
              <input
                value={datos.campos?.categoria || ''}
                onChange={e => actualizarAnidado('campos', 'categoria', e.target.value)}
                placeholder="lead"
              />
            </label>
            <label className="flow-field">
              <span>Clave</span>
              <input
                value={datos.campos?.clave || ''}
                onChange={e => actualizarAnidado('campos', 'clave', e.target.value)}
                placeholder="{{nombre_cliente}}"
              />
            </label>
            <label className="flow-field">
              <span>Valor</span>
              <textarea
                value={datos.campos?.valor || ''}
                onChange={e => actualizarAnidado('campos', 'valor', e.target.value)}
                placeholder="Email: {{email_cliente}}"
                rows={2}
              />
            </label>
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
            <label className="flow-field">
              <span>Mensaje al usuario</span>
              <textarea
                value={datos.mensaje_usuario || ''}
                onChange={e => actualizar('mensaje_usuario', e.target.value)}
                placeholder="Te estoy conectando con un ejecutivo..."
                rows={2}
              />
            </label>
            <label className="flow-field">
              <span>Mensaje al ejecutivo</span>
              <textarea
                value={datos.mensaje_ejecutivo || ''}
                onChange={e => actualizar('mensaje_ejecutivo', e.target.value)}
                placeholder="Nuevo lead desde {{canal}}: {{nombre_cliente}}"
                rows={2}
              />
            </label>
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
      </div>
    </div>
  )
}
