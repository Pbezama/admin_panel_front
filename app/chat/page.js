'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useView } from '@/context/ViewContext'
import { api } from '@/lib/api'
import MensajeChat from '@/components/Chat/MensajeChat'
import EditorManual from '@/components/Editor/EditorManual'
import MetaAdsView from '@/components/Views/MetaAdsView'
import TareasView from '@/components/Views/TareasView'
import IntegracionesView from '@/components/Views/IntegracionesView'
import InformesView from '@/components/Views/InformesView'
import EntrenadorView from '@/components/Views/EntrenadorView'
import FlujosView from '@/components/Views/FlujosView'
import AgentesView from '@/components/Views/AgentesView'
import DashboardLiveView from '@/components/Views/DashboardLiveView'
import DashboardLayout from '@/components/DashboardLayout'
import { RotateCcw, Send, ChevronDown, ChevronUp, Database, Sparkles, PanelRightOpen, PanelRightClose } from 'lucide-react'
import '@/styles/Chat.css'

export default function ChatPage() {
  const [mensajes, setMensajes] = useState([])
  const [inputMensaje, setInputMensaje] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [datosMarca, setDatosMarca] = useState([])
  const [accionPendiente, setAccionPendiente] = useState(null)
  const [mostrarEditor, setMostrarEditor] = useState(true)
  const [modoActivo, setModoActivo] = useState('controlador')
  const [vistaMobile, setVistaMobile] = useState('chat')
  const [menuModoAbierto, setMenuModoAbierto] = useState(false)
  const [anchoChat, setAnchoChat] = useState(60)
  const [arrastrando, setArrastrando] = useState(false)

  const { usuario, loading, logout, sesionChatId, mensajesCount, incrementarMensajes, reiniciarChat, esSuperAdmin, esColaborador, onboardingCompletado, requiereOnboarding, marcaActiva } = useAuth()
  const { vistaActiva, navegarA, contextoVista, inicializado } = useView()
  const router = useRouter()
  const chatEndRef = useRef(null)
  const inputRef = useRef(null)
  const menuModoRef = useRef(null)

  // Redirigir si no esta logueado o si no completo onboarding
  useEffect(() => {
    if (!loading && !usuario) {
      router.push('/login')
      return
    }

    if (!loading && usuario && onboardingCompletado === false) {
      router.push('/onboarding')
      return
    }

    if (!loading && usuario && onboardingCompletado !== false) {
      cargarDatosMarca()
      // Solo auto-navegar si estamos en /chat raiz (no si ya hay sub-ruta)
      const enRaiz = window.location.pathname === '/chat' || window.location.pathname === '/chat/'
      if (enRaiz) {
        if (esColaborador) {
          navegarA('tareas')
        } else {
          agregarMensajeBienvenida()
        }
      }
    }
  }, [usuario, loading, router, esColaborador, onboardingCompletado])

  useEffect(() => {
    scrollToBottom()
  }, [mensajes])

  // Cerrar menu modo al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuModoRef.current && !menuModoRef.current.contains(event.target)) {
        setMenuModoAbierto(false)
      }
    }

    if (menuModoAbierto) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuModoAbierto])

  // Logica de arrastre para el divisor redimensionable
  useEffect(() => {
    const manejarMovimiento = (e) => {
      if (!arrastrando) return
      const contenedor = document.querySelector('.main-layout')
      if (!contenedor) return
      const rect = contenedor.getBoundingClientRect()
      const nuevoAncho = ((e.clientX - rect.left) / rect.width) * 100
      setAnchoChat(Math.min(70, Math.max(30, nuevoAncho)))
    }

    const finalizarArrastre = () => {
      setArrastrando(false)
    }

    if (arrastrando) {
      document.addEventListener('mousemove', manejarMovimiento)
      document.addEventListener('mouseup', finalizarArrastre)
    }

    return () => {
      document.removeEventListener('mousemove', manejarMovimiento)
      document.removeEventListener('mouseup', finalizarArrastre)
    }
  }, [arrastrando, anchoChat])

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const cargarDatosMarca = async () => {
    try {
      const idMarcaCargar = marcaActiva?.id_marca || usuario?.id_marca
      const resultado = await api.getDatosMarca(idMarcaCargar, false)
      if (resultado.success) {
        setDatosMarca(resultado.data || [])
      }
    } catch (error) {
      console.error('Error al cargar datos:', error)
      if (error?.status === 401 || error?.status === 403) {
        console.warn('Token invalido en cargarDatosMarca, redirigiendo a login')
        logout()
        router.push('/login')
      }
    }
  }

  useEffect(() => {
    if (marcaActiva && usuario && !loading) {
      cargarDatosMarca()
    }
  }, [marcaActiva?.id_marca])

  const agregarMensajeBienvenida = () => {
    const hora = new Date().getHours()
    let saludo = 'Buenos dias'
    if (hora >= 12 && hora < 19) saludo = 'Buenas tardes'
    else if (hora >= 19) saludo = 'Buenas noches'

    const mensajeBienvenida = {
      rol: 'assistant',
      contenido: `${saludo}, ${usuario?.nombre}.\n\nSoy tu asistente para administrar los datos de **${marcaActiva?.nombre_marca || usuario?.nombre_marca}**.\n\nPuedes hablarme en lenguaje natural, por ejemplo:\n\n- "Muestrame toda mi informacion"\n- "Quiero agregar una promocion de 20% de descuento hasta fin de mes"\n- "Desactiva la promocion del dia de la madre"\n- "Cambia la prioridad del ID 27 a 2"`,
      tipo: 'texto',
      mostrarBotonModo: true,
      timestamp: new Date().toISOString()
    }
    setMensajes([mensajeBienvenida])
  }

  const cambiarModo = (nuevoModo) => {
    if (nuevoModo === modoActivo) return

    const nombresModo = {
      controlador: 'Controlador',
      chatia: 'ChatIA'
    }

    const separador = {
      rol: 'system',
      tipo: 'separador',
      contenido: `Cambiaste a ${nombresModo[nuevoModo]}`,
      timestamp: new Date().toISOString(),
      modoOrigen: nuevoModo
    }
    setMensajes(prev => [...prev, separador])
    setModoActivo(nuevoModo)
    setAccionPendiente(null)
  }

  const toggleModoChatIA = () => {
    cambiarModo(modoActivo === 'chatia' ? 'controlador' : 'chatia')
  }

  const ejecutarDelegacion = async (delegacion) => {
    const { agenteDestino, datosParaDelegar, razon } = delegacion

    const nombresModo = {
      controlador: 'Controlador',
      chatia: 'ChatIA'
    }

    const msgDelegacion = {
      rol: 'system',
      tipo: 'delegacion',
      contenido: `${nombresModo[modoActivo]} delego a ${nombresModo[agenteDestino]}`,
      desde: modoActivo,
      hacia: agenteDestino,
      timestamp: new Date().toISOString()
    }
    setMensajes(prev => [...prev, msgDelegacion])

    setModoActivo(agenteDestino)
    setAccionPendiente(null)

    if (datosParaDelegar) {
      setTimeout(() => {
        enviarMensajeConContextoDelegado(datosParaDelegar, razon)
      }, 100)
    }
  }

  const enviarMensajeConContextoDelegado = async (datos, razon) => {
    setEnviando(true)

    let datosFormateados = ''
    if (datos) {
      if (datos.categoria) datosFormateados += `- Categoria: ${datos.categoria}\n`
      if (datos.clave) datosFormateados += `- Clave: ${datos.clave}\n`
      if (datos.valor) datosFormateados += `- Valor: ${datos.valor}\n`
      if (datos.prioridad) datosFormateados += `- Prioridad: ${datos.prioridad}\n`
      if (!datosFormateados && Object.keys(datos).length > 0) {
        datosFormateados = JSON.stringify(datos, null, 2)
      }
    }

    const contextoInicial = `[DELEGACION RECIBIDA]
Razon: ${razon}

Datos a procesar:
${datosFormateados || 'Sin datos especificos'}

El usuario ya aprobo esta delegacion. Procede a pedir confirmacion para agregar estos datos a la base.`

    const mensajeContexto = {
      rol: 'user',
      contenido: 'Accion delegada',
      contenidoCompleto: contextoInicial,
      timestamp: new Date().toISOString(),
      modoOrigen: modoActivo,
      esDelegacion: true
    }
    setMensajes(prev => [...prev, mensajeContexto])

    try {
      const historial = mensajes.map(m => ({
        rol: m.rol,
        contenido: m.contenidoCompleto || m.contenido,
        modoOrigen: m.modoOrigen,
        tipo: m.tipo,
        comentariosCompletos: m.comentariosCompletos,
        datos: m.datos,
        tabla_preview: m.tabla_preview
      }))

      const contexto = {
        nombreUsuario: usuario?.nombre,
        nombreMarca: marcaActiva?.nombre_marca || usuario?.nombre_marca,
        idMarca: marcaActiva?.id_marca || usuario?.id_marca,
        esSuperAdmin,
        datosMarca,
        historial
      }

      let respuesta
      if (modoActivo === 'chatia') {
        respuesta = await api.chatIA(contextoInicial, historial, {
          nombreMarca: marcaActiva?.nombre_marca || usuario?.nombre_marca,
          datosMarca
        })
      } else {
        respuesta = await api.chatControlador(contextoInicial, contexto)
      }

      const mensajeRespuesta = {
        rol: 'assistant',
        contenido: respuesta.contenido,
        tipo: respuesta.tipo,
        datos: respuesta.datos,
        delegacion: respuesta.delegacion,
        sugerencias: respuesta.sugerencias,
        timestamp: new Date().toISOString(),
        modoOrigen: modoActivo
      }
      setMensajes(prev => [...prev, mensajeRespuesta])

      if (respuesta.accionPendiente) {
        setAccionPendiente(respuesta.accionPendiente)
      }
    } catch (err) {
      console.error('Error procesando delegacion:', err)
    }

    setEnviando(false)
  }

  const cambiarVistaMobile = (vista) => {
    setVistaMobile(vista)
  }

  const handleEnviarMensaje = async (e) => {
    e.preventDefault()

    if (!inputMensaje.trim() || enviando) return

    if (mensajesCount >= 20) {
      setMensajes(prev => [...prev, {
        rol: 'assistant',
        contenido: 'Has alcanzado el limite de 20 mensajes en esta sesion. Por favor, reinicia la conversacion para continuar.',
        tipo: 'error',
        timestamp: new Date().toISOString()
      }])
      return
    }

    const textoMensaje = inputMensaje.trim()
    const modoParaProcesar = modoActivo

    setInputMensaje('')
    setEnviando(true)
    incrementarMensajes()

    const mensajeUsuario = {
      rol: 'user',
      contenido: textoMensaje,
      timestamp: new Date().toISOString(),
      modoOrigen: modoParaProcesar
    }
    setMensajes(prev => [...prev, mensajeUsuario])

    try {
      await api.saveChatMessage({
        usuario_id: usuario?.id,
        sesion_id: sesionChatId,
        rol: 'user',
        contenido: textoMensaje
      })
    } catch (e) {
      console.error('Error guardando mensaje:', e)
    }

    try {
      const historial = mensajes.map(m => ({
        rol: m.rol,
        contenido: m.contenidoCompleto || m.contenido,
        modoOrigen: m.modoOrigen,
        tipo: m.tipo,
        comentariosCompletos: m.comentariosCompletos,
        datos: m.datos,
        tabla_preview: m.tabla_preview
      }))

      let respuesta

      if (modoParaProcesar === 'chatia') {
        respuesta = await api.chatIA(textoMensaje, historial, {
          nombreMarca: marcaActiva?.nombre_marca || usuario?.nombre_marca,
          datosMarca
        })
      } else {
        const contexto = {
          nombreUsuario: usuario?.nombre,
          nombreMarca: marcaActiva?.nombre_marca || usuario?.nombre_marca,
          idMarca: marcaActiva?.id_marca || usuario?.id_marca,
          esSuperAdmin,
          datosMarca,
          historial,
          accionPendienteActual: accionPendiente
        }
        respuesta = await api.chatControlador(textoMensaje, contexto)
      }

      if (modoParaProcesar === 'chatia') {
        const mensajeRespuesta = {
          rol: 'assistant',
          contenido: respuesta.contenido,
          tipo: respuesta.tipo,
          timestamp: new Date().toISOString(),
          modoOrigen: modoParaProcesar,
          delegacion: respuesta.delegacion || null,
          sugerencias: respuesta.sugerencias || null,
          puntosClave: respuesta.puntosClave || null
        }
        setMensajes(prev => [...prev, mensajeRespuesta])
        setEnviando(false)
        inputRef.current?.focus()
        return
      }

      if (respuesta.tipo === 'navegacion') {
        const mensajeNavegacion = {
          rol: 'assistant',
          contenido: respuesta.contenido,
          tipo: 'texto',
          timestamp: new Date().toISOString(),
          modoOrigen: modoParaProcesar
        }
        setMensajes(prev => [...prev, mensajeNavegacion])
        navegarA(respuesta.destino, respuesta.contexto)
        setEnviando(false)
        return
      }

      if (respuesta.tipo === 'consultar_comentarios') {
        try {
          const filtros = {
            idMarca: marcaActiva?.id_marca || usuario?.id_marca,
            ...respuesta.filtros
          }

          const resultadoComentarios = await api.queryComments(filtros)

          let mensajeResultado
          if (resultadoComentarios.success && resultadoComentarios.data?.length > 0) {
            const columnas = ['ID', 'Comentario Original', 'Texto Publicacion', 'Respuesta', 'Inbox', 'Fecha']
            const filas = resultadoComentarios.data.map(c => [
              c.id,
              (c.comentario_original || '').substring(0, 50) + ((c.comentario_original || '').length > 50 ? '...' : '') || '-',
              (c.texto_publicacion || '').substring(0, 50) + ((c.texto_publicacion || '').length > 50 ? '...' : '') || '-',
              (c.respuesta_comentario || '').substring(0, 50) + ((c.respuesta_comentario || '').length > 50 ? '...' : '') || '-',
              (c.mensaje_inbox || '').substring(0, 50) + ((c.mensaje_inbox || '').length > 50 ? '...' : '') || '-',
              c.creado_en ? new Date(c.creado_en).toLocaleDateString('es-CL') : '-'
            ])

            mensajeResultado = {
              rol: 'assistant',
              contenido: respuesta.mensaje || `Encontre ${resultadoComentarios.total || resultadoComentarios.data.length} comentarios.`,
              tipo: 'tabla',
              datos: { columnas, filas },
              comentariosCompletos: resultadoComentarios.data,
              timestamp: new Date().toISOString(),
              modoOrigen: 'controlador'
            }
          } else {
            mensajeResultado = {
              rol: 'assistant',
              contenido: 'No encontre comentarios con los filtros especificados.',
              tipo: 'texto',
              timestamp: new Date().toISOString(),
              modoOrigen: 'controlador'
            }
          }

          setMensajes(prev => [...prev, mensajeResultado])
        } catch (err) {
          console.error('Error consultando comentarios:', err)
        }
        setEnviando(false)
        inputRef.current?.focus()
        return
      }

      if (respuesta.tipo === 'crear_tarea' && respuesta.tarea) {
        try {
          const resultado = await api.crearTarea({
            ...respuesta.tarea,
            creado_por_sistema: true
          })

          if (resultado.success) {
            let mensajeContenido = respuesta.contenido + '\n\n✓ Tarea creada exitosamente.'
            if (resultado.whatsappEnviado) {
              mensajeContenido += `\n📱 WhatsApp enviado a ${resultado.whatsappDestinatario}`
            }
            const mensajeExito = {
              rol: 'assistant',
              contenido: mensajeContenido,
              tipo: 'exito',
              timestamp: new Date().toISOString(),
              modoOrigen: 'controlador'
            }
            setMensajes(prev => [...prev, mensajeExito])
          } else {
            throw new Error(resultado.error)
          }
        } catch (err) {
          const mensajeError = {
            rol: 'assistant',
            contenido: `Error al crear la tarea: ${err.message}`,
            tipo: 'error',
            timestamp: new Date().toISOString()
          }
          setMensajes(prev => [...prev, mensajeError])
        }
        setEnviando(false)
        inputRef.current?.focus()
        return
      }

      if (respuesta.tipo === 'accion_confirmada' && respuesta.ejecutar) {
        await ejecutarAccion(respuesta.ejecutar)
        return
      }

      if (respuesta.tipo === 'accion_confirmada' && !respuesta.ejecutar && accionPendiente) {
        await ejecutarAccion({
          accion: accionPendiente.accion,
          parametros: accionPendiente.parametros
        })
        return
      }

      if (respuesta.tipo === 'confirmacion' && respuesta.accionPendiente) {
        setAccionPendiente(respuesta.accionPendiente)
      } else if (respuesta.tipo !== 'confirmacion' && respuesta.tipo !== 'accion_confirmada') {
        if (accionPendiente) {
          setAccionPendiente(null)
        }
      }

      const mensajeRespuesta = {
        rol: 'assistant',
        contenido: respuesta.contenido,
        tipo: respuesta.tipo,
        datos: respuesta.datos,
        timestamp: new Date().toISOString(),
        modoOrigen: 'controlador',
        delegacion: respuesta.delegacion || null
      }
      setMensajes(prev => [...prev, mensajeRespuesta])

    } catch (err) {
      console.error('Error procesando mensaje:', err)
      const mensajeError = {
        rol: 'assistant',
        contenido: `Ups, tuve un problema: ${err.message}`,
        tipo: 'error',
        timestamp: new Date().toISOString()
      }
      setMensajes(prev => [...prev, mensajeError])
    }

    setEnviando(false)
    inputRef.current?.focus()
  }

  const ejecutarAccion = async (ejecutar) => {
    const { accion, parametros } = ejecutar

    try {
      let resultado

      switch (accion) {
        case 'agregar':
          resultado = await api.addDato({
            'ID marca': marcaActiva?.id_marca || usuario?.id_marca,
            'Nombre marca': marcaActiva?.nombre_marca || usuario?.nombre_marca,
            categoria: parametros.categoria,
            clave: parametros.clave,
            valor: parametros.valor,
            prioridad: parametros.prioridad || 3,
            fecha_inicio: parametros.fecha_inicio || null,
            fecha_caducidad: parametros.fecha_caducidad || null
          })
          break

        case 'modificar':
          if (!parametros.id_fila) {
            throw new Error('No se especifico el ID del registro a modificar')
          }
          resultado = await api.updateDato(parametros.id_fila, parametros.updates)
          break

        case 'desactivar':
          if (!parametros.id_fila) {
            throw new Error('No se especifico el ID del registro a desactivar')
          }
          resultado = await api.deactivateDato(parametros.id_fila)
          break

        default:
          resultado = { success: false, error: `Accion no reconocida: ${accion}` }
      }

      try {
        await api.saveLogAction({
          usuario_id: usuario?.id,
          usuario_nombre: usuario?.nombre,
          id_marca: marcaActiva?.id_marca || usuario?.id_marca,
          nombre_marca: marcaActiva?.nombre_marca || usuario?.nombre_marca,
          tipo_accion: accion,
          descripcion: JSON.stringify(parametros),
          exito: resultado.success,
          mensaje_resultado: resultado.success ? 'Exito' : resultado.error
        })
      } catch (e) {
        console.error('Error guardando log:', e)
      }

      let mensajeResultado

      if (resultado.success) {
        const datos = resultado.data

        const tablaResultado = {
          columnas: ['Campo', 'Valor'],
          filas: [
            ['ID', datos.id],
            ['Categoria', datos.categoria],
            ['Clave', datos.clave],
            ['Valor', (datos.valor || '').substring(0, 100) + ((datos.valor || '').length > 100 ? '...' : '')],
            ['Prioridad', datos.prioridad],
            ['Estado', datos.Estado ? 'Activo' : 'Inactivo'],
            ['Fecha inicio', datos.fecha_inicio ? new Date(datos.fecha_inicio).toLocaleDateString('es-CL') : '-'],
            ['Fecha termino', datos.fecha_caducidad ? new Date(datos.fecha_caducidad).toLocaleDateString('es-CL') : '-']
          ]
        }

        const accionTexto = {
          'agregar': 'agregado',
          'modificar': 'modificado',
          'desactivar': 'desactivado'
        }[accion] || 'procesado'

        mensajeResultado = {
          rol: 'assistant',
          contenido: `Listo. El registro ha sido ${accionTexto} exitosamente.`,
          tipo: 'exito',
          datos: tablaResultado,
          timestamp: new Date().toISOString()
        }

        await cargarDatosMarca()
      } else {
        mensajeResultado = {
          rol: 'assistant',
          contenido: `No pude completar la accion: ${resultado.error}`,
          tipo: 'error',
          timestamp: new Date().toISOString()
        }
      }

      setMensajes(prev => [...prev, mensajeResultado])
      setAccionPendiente(null)

    } catch (err) {
      console.error('Error ejecutando accion:', err)
      const mensajeError = {
        rol: 'assistant',
        contenido: `Error ejecutando la accion: ${err.message}`,
        tipo: 'error',
        timestamp: new Date().toISOString()
      }
      setMensajes(prev => [...prev, mensajeError])
      setAccionPendiente(null)
    }

    setEnviando(false)
  }

  const handleReiniciarChat = () => {
    reiniciarChat()
    setMensajes([])
    setAccionPendiente(null)
    agregarMensajeBienvenida()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleEnviarMensaje(e)
    }
  }

  const handleRespuestaRapida = async (respuesta) => {
    if (enviando) return

    setEnviando(true)
    incrementarMensajes()

    const mensajeUsuario = {
      rol: 'user',
      contenido: respuesta,
      timestamp: new Date().toISOString()
    }
    setMensajes(prev => [...prev, mensajeUsuario])

    try {
      await api.saveChatMessage({
        usuario_id: usuario?.id,
        sesion_id: sesionChatId,
        rol: 'user',
        contenido: respuesta
      })
    } catch (e) {
      console.error('Error guardando mensaje:', e)
    }

    if (respuesta.toLowerCase() === 'si' || respuesta.toLowerCase() === 'yes') {
      if (accionPendiente) {
        await ejecutarAccion({
          accion: accionPendiente.accion,
          parametros: accionPendiente.parametros
        })
      } else {
        setEnviando(false)
      }
    } else {
      const mensajeCancelado = {
        rol: 'assistant',
        contenido: 'Entendido, he cancelado la accion. En que mas puedo ayudarte?',
        tipo: 'texto',
        timestamp: new Date().toISOString()
      }
      setMensajes(prev => [...prev, mensajeCancelado])
      setAccionPendiente(null)
      setEnviando(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Cargando...</p>
      </div>
    )
  }

  if (!usuario) {
    return null
  }

  // Renderizar contenido segun vista activa
  const renderVistaActiva = () => {
    switch (vistaActiva) {
      case 'meta-ads':
        return <MetaAdsView contexto={contextoVista} />
      case 'tareas':
        return <TareasView />
      case 'integraciones':
        return <IntegracionesView />
      case 'informes':
        return <InformesView />
      case 'entrenador':
        return <EntrenadorView />
      case 'flujos':
        return <FlujosView />
      case 'agentes':
        return <AgentesView />
      case 'dashboard-live':
        return <DashboardLiveView />
      default:
        return renderChat()
    }
  }

  const renderChat = () => (
    <div className="app-layout">
      {/* Layout principal dividido */}
      <div className={`main-layout ${arrastrando ? 'arrastrando' : ''}`}>
        {/* Panel izquierdo: Chat */}
        <div
          className={`chat-panel ${!mostrarEditor ? 'full-width' : ''} mobile-panel ${vistaMobile === 'chat' ? 'mobile-visible' : 'mobile-hidden'}`}
          style={mostrarEditor ? { flex: `0 0 ${anchoChat}%`, maxWidth: `${anchoChat}%` } : undefined}
        >
          {/* Barra de herramientas del chat */}
          <div className="chat-toolbar">
            <div className="chat-toolbar-left">
              {modoActivo === 'chatia' && (
                <span className="chat-toolbar-badge badge-chatia">Modo ChatIA</span>
              )}
              {modoActivo === 'controlador' && (
                <span className="chat-toolbar-badge badge-controlador">Modo Controlador</span>
              )}
            </div>
            <div className="chat-toolbar-right">
              <button
                onClick={() => setMostrarEditor(!mostrarEditor)}
                className="chat-toolbar-btn desktop-only"
                title={mostrarEditor ? 'Ocultar editor' : 'Mostrar editor'}
              >
                {mostrarEditor ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
              </button>
              <button onClick={handleReiniciarChat} className="chat-toolbar-btn" title="Reiniciar chat">
                <RotateCcw size={16} />
              </button>
            </div>
          </div>

          {/* Indicador de accion pendiente */}
          {modoActivo === 'controlador' && accionPendiente && (
            <div className="accion-pendiente-indicator">
              <span>*</span>
              <span>Accion pendiente: <strong>{accionPendiente.accion}</strong></span>
              <span className="accion-id">
                {accionPendiente.accion === 'modificar' && accionPendiente.parametros?.id_fila &&
                  `(ID: ${accionPendiente.parametros.id_fila})`
                }
              </span>
            </div>
          )}

          {/* Mensajes */}
          <main className="chat-messages">
            {mensajes.map((mensaje, index) => (
              <MensajeChat
                key={index}
                mensaje={mensaje}
                modoActivo={modoActivo}
                onToggleModo={toggleModoChatIA}
                onCambiarModo={cambiarModo}
                onRespuestaRapida={handleRespuestaRapida}
                onDelegacion={ejecutarDelegacion}
                onNavegar={navegarA}
                nombreMarca={marcaActiva?.nombre_marca || usuario.nombre_marca}
                usuario={usuario}
              />
            ))}

            {enviando && (
              <div className="mensaje-loading">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span>Pensando...</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </main>

          {/* Input */}
          <footer className="chat-input-container">
            <div className="mensajes-restantes">
              {20 - mensajesCount} mensajes restantes
            </div>
            <form onSubmit={handleEnviarMensaje} className="chat-input-form">
              {/* Selector de modo (solo Controlador/ChatIA) */}
              <div className="menu-input-wrapper" ref={menuModoRef}>
                <button
                  type="button"
                  className={`btn-menu-input modo-${modoActivo}`}
                  onClick={() => setMenuModoAbierto(!menuModoAbierto)}
                  aria-expanded={menuModoAbierto}
                  aria-haspopup="true"
                >
                  <span className="menu-input-icon">
                    {modoActivo === 'controlador' ? <Database size={14} /> : <Sparkles size={14} />}
                  </span>
                  <span className="menu-input-texto">
                    {modoActivo === 'controlador' ? 'Controlador' : 'ChatIA'}
                  </span>
                  <span className="menu-input-arrow">
                    {menuModoAbierto ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                  </span>
                </button>

                {menuModoAbierto && (
                  <div className="menu-input-dropdown">
                    {modoActivo !== 'controlador' && (
                      <button
                        type="button"
                        className="menu-input-option"
                        onClick={() => { cambiarModo('controlador'); setMenuModoAbierto(false) }}
                      >
                        <span className="option-icon"><Database size={16} /></span>
                        <span className="option-texto">Controlador</span>
                        <span className="option-desc">Gestionar datos</span>
                      </button>
                    )}
                    {modoActivo !== 'chatia' && (
                      <button
                        type="button"
                        className="menu-input-option"
                        onClick={() => { cambiarModo('chatia'); setMenuModoAbierto(false) }}
                      >
                        <span className="option-icon"><Sparkles size={16} /></span>
                        <span className="option-texto">ChatIA</span>
                        <span className="option-desc">Chat general</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              <textarea
                ref={inputRef}
                value={inputMensaje}
                onChange={(e) => setInputMensaje(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  modoActivo === 'controlador' ? "Escribe tu mensaje..." : "Pregunta lo que quieras..."
                }
                disabled={enviando || mensajesCount >= 20}
                rows={1}
              />
              <button
                type="submit"
                disabled={enviando || !inputMensaje.trim() || mensajesCount >= 20}
                className="btn-enviar"
              >
                {enviando ? '...' : <Send size={18} />}
              </button>
            </form>
          </footer>
        </div>

        {/* Divisor redimensionable (solo desktop) */}
        {mostrarEditor && (
          <div
            className={`panel-divider ${arrastrando ? 'dragging' : ''}`}
            onMouseDown={() => setArrastrando(true)}
          />
        )}

        {/* Panel derecho: Editor Manual */}
        {mostrarEditor && (
          <div
            className={`editor-panel mobile-panel ${vistaMobile === 'editor' ? 'mobile-visible' : 'mobile-hidden'}`}
            style={{ flex: `0 0 ${100 - anchoChat}%`, minWidth: `${100 - anchoChat}%` }}
          >
            <EditorManual
              usuario={usuario}
              esSuperAdmin={esSuperAdmin}
              marcaActiva={marcaActiva}
              onDatosActualizados={cargarDatosMarca}
            />
          </div>
        )}
      </div>

      {/* Barra de navegacion inferior - SOLO MOVIL */}
      <nav className="mobile-nav">
        <button
          className={`mobile-nav-btn ${vistaMobile === 'chat' ? 'active' : ''}`}
          onClick={() => cambiarVistaMobile('chat')}
        >
          <span className="mobile-nav-icon">
            {modoActivo === 'controlador' ? <Database size={20} /> : <Sparkles size={20} />}
          </span>
          <span className="mobile-nav-label">Chat</span>
        </button>
        <button
          className={`mobile-nav-btn ${vistaMobile === 'editor' ? 'active' : ''}`}
          onClick={() => cambiarVistaMobile('editor')}
        >
          <span className="mobile-nav-icon"><PanelRightOpen size={20} /></span>
          <span className="mobile-nav-label">Editor</span>
        </button>
      </nav>
    </div>
  )

  return (
    <DashboardLayout>
      {renderVistaActiva()}
    </DashboardLayout>
  )
}
