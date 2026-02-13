'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { api } from '@/lib/api'
import '@/styles/NotificacionesCampana.css'

const ICONOS_TIPO = {
  cambio_estado: '\uD83D\uDD04',
  tarea_actualizada: '\uD83D\uDD04',
  nota_agregada: '\uD83D\uDCAC',
  archivo_subido: '\uD83D\uDCCE'
}

/**
 * Componente de campanita de notificaciones
 * Muestra notificaciones persistentes, tareas pendientes y publicaciones pendientes
 */
const NotificacionesCampana = ({ onNavegar, esAdmin = false }) => {
  const [abierto, setAbierto] = useState(false)
  const [notificaciones, setNotificaciones] = useState([])
  const [cargando, setCargando] = useState(false)
  const menuRef = useRef(null)

  // Cargar notificaciones
  const cargarNotificaciones = useCallback(async () => {
    if (!esAdmin) return

    setCargando(true)
    const nuevasNotificaciones = []

    try {
      // 1. Cargar notificaciones persistentes (de la tabla)
      try {
        const notifResult = await api.getNotificaciones(true)
        if (notifResult.success && notifResult.data?.length > 0) {
          notifResult.data.forEach(notif => {
            nuevasNotificaciones.push({
              id: `db-${notif.id}`,
              dbId: notif.id,
              tipo: 'notificacion_tarea',
              subtipo: notif.tipo,
              titulo: notif.titulo,
              descripcion: notif.descripcion || '',
              fecha: notif.fecha_creacion,
              icono: ICONOS_TIPO[notif.tipo] || '\uD83D\uDD14',
              persistente: true,
              idTarea: notif.id_tarea,
              nombreActor: notif.nombre_actor
            })
          })
        }
      } catch (err) {
        // Si falla (tabla no existe aún), ignorar silenciosamente
        console.log('Notificaciones persistentes no disponibles:', err.message)
      }

      // 2. Cargar tareas pendientes
      const tareasResult = await api.getTareas('pendiente')
      if (tareasResult.success && tareasResult.data?.length > 0) {
        tareasResult.data.forEach(tarea => {
          nuevasNotificaciones.push({
            id: `tarea-${tarea.id}`,
            tipo: 'tarea',
            titulo: tarea.titulo,
            descripcion: tarea.descripcion?.substring(0, 60) + (tarea.descripcion?.length > 60 ? '...' : '') || 'Sin descripcion',
            fecha: tarea.fecha_creacion,
            prioridad: tarea.prioridad,
            icono: '\uD83D\uDCCB'
          })
        })
      }

      // 3. Cargar publicaciones pendientes
      const pubsResult = await api.getPublicacionesPendientes()
      if (pubsResult.success && pubsResult.data?.length > 0) {
        pubsResult.data.forEach(pub => {
          let contenido = pub.valor || 'Nueva publicacion detectada'
          if (contenido.includes('|') && contenido.includes('Valor:')) {
            const match = contenido.match(/Valor:\s*([^|]+)/)
            if (match) contenido = match[1].trim()
          }

          nuevasNotificaciones.push({
            id: `pub-${pub.id}`,
            tipo: 'publicacion',
            titulo: 'Nueva publicacion detectada',
            descripcion: contenido.substring(0, 60) + (contenido.length > 60 ? '...' : ''),
            fecha: pub.creado_en,
            icono: '\uD83D\uDCE2'
          })
        })
      }

      setNotificaciones(nuevasNotificaciones)
    } catch (err) {
      console.error('Error cargando notificaciones:', err)
    }

    setCargando(false)
  }, [esAdmin])

  // Cargar al montar y cada 30 segundos
  useEffect(() => {
    cargarNotificaciones()
    const intervalo = setInterval(cargarNotificaciones, 30000)
    return () => clearInterval(intervalo)
  }, [cargarNotificaciones])

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setAbierto(false)
      }
    }

    if (abierto) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [abierto])

  const handleNotificacionClick = async (notificacion) => {
    // Si es persistente, marcar como leída
    if (notificacion.persistente && notificacion.dbId) {
      try {
        await api.marcarNotificacionesLeidas([notificacion.dbId])
        setNotificaciones(prev => prev.filter(n => n.id !== notificacion.id))
      } catch (err) {
        console.error('Error marcando leída:', err)
      }
    }

    setAbierto(false)
    if (onNavegar) {
      onNavegar('tareas')
    }
  }

  const handleMarcarTodasLeidas = async () => {
    const persistentes = notificaciones.filter(n => n.persistente && n.dbId)
    if (persistentes.length === 0) return

    try {
      await api.marcarNotificacionesLeidas(persistentes.map(n => n.dbId))
      setNotificaciones(prev => prev.filter(n => !n.persistente))
    } catch (err) {
      console.error('Error marcando todas leídas:', err)
    }
  }

  const totalNotificaciones = notificaciones.length
  const tieneNotificaciones = totalNotificaciones > 0
  const tienePersistentes = notificaciones.some(n => n.persistente)

  if (!esAdmin) return null

  return (
    <div className="notificaciones-campana" ref={menuRef}>
      <button
        className={`campana-btn ${tieneNotificaciones ? 'tiene-notificaciones' : ''}`}
        onClick={() => setAbierto(!abierto)}
        title={tieneNotificaciones ? `${totalNotificaciones} notificaciones` : 'Sin notificaciones'}
      >
        <span className="campana-icono">{'\uD83D\uDD14'}</span>
        {tieneNotificaciones && (
          <span className="campana-badge">{totalNotificaciones > 9 ? '9+' : totalNotificaciones}</span>
        )}
      </button>

      {abierto && (
        <div className="notificaciones-dropdown">
          <div className="notificaciones-header">
            <h3>Notificaciones</h3>
            <div className="notificaciones-header-acciones">
              {tienePersistentes && (
                <button
                  className="btn-marcar-leidas"
                  onClick={handleMarcarTodasLeidas}
                  title="Marcar todas como leidas"
                >
                  {'\u2713'}
                </button>
              )}
              <button className="btn-refrescar" onClick={cargarNotificaciones} disabled={cargando}>
                {cargando ? '...' : '\u21BB'}
              </button>
            </div>
          </div>

          <div className="notificaciones-lista">
            {cargando && notificaciones.length === 0 ? (
              <div className="notificaciones-cargando">Cargando...</div>
            ) : notificaciones.length === 0 ? (
              <div className="notificaciones-vacio">
                <span>{'\u2713'}</span>
                <p>No hay notificaciones pendientes</p>
              </div>
            ) : (
              notificaciones.map(notif => (
                <button
                  key={notif.id}
                  className={`notificacion-item notificacion-${notif.tipo} ${notif.persistente ? 'notificacion-persistente' : ''}`}
                  onClick={() => handleNotificacionClick(notif)}
                >
                  <span className="notificacion-icono">{notif.icono}</span>
                  <div className="notificacion-contenido">
                    <span className="notificacion-titulo">{notif.titulo}</span>
                    <span className="notificacion-descripcion">{notif.descripcion}</span>
                    {notif.nombreActor && (
                      <span className="notificacion-actor">{notif.nombreActor}</span>
                    )}
                    <span className="notificacion-fecha">
                      {notif.fecha ? new Date(notif.fecha).toLocaleDateString('es-CL', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : ''}
                    </span>
                  </div>
                  {notif.prioridad === 'alta' && (
                    <span className="notificacion-prioridad">!</span>
                  )}
                </button>
              ))
            )}
          </div>

          {tieneNotificaciones && (
            <div className="notificaciones-footer">
              <button
                className="btn-ver-todas"
                onClick={() => { setAbierto(false); onNavegar && onNavegar('tareas') }}
              >
                Ver todas las tareas →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificacionesCampana
