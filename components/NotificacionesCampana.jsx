'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { api } from '@/lib/api'
import '@/styles/NotificacionesCampana.css'

/**
 * Componente de campanita de notificaciones
 * Muestra tareas pendientes y publicaciones pendientes
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
      // Cargar tareas pendientes
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
            icono: '📋'
          })
        })
      }

      // Cargar publicaciones pendientes
      const pubsResult = await api.getPublicacionesPendientes()
      if (pubsResult.success && pubsResult.data?.length > 0) {
        pubsResult.data.forEach(pub => {
          // Parsear el valor si viene concatenado
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
            icono: '📢'
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

  const handleNotificacionClick = (notificacion) => {
    setAbierto(false)
    if (onNavegar) {
      onNavegar('tareas')
    }
  }

  const totalNotificaciones = notificaciones.length
  const tieneNotificaciones = totalNotificaciones > 0

  if (!esAdmin) return null

  return (
    <div className="notificaciones-campana" ref={menuRef}>
      <button
        className={`campana-btn ${tieneNotificaciones ? 'tiene-notificaciones' : ''}`}
        onClick={() => setAbierto(!abierto)}
        title={tieneNotificaciones ? `${totalNotificaciones} notificaciones` : 'Sin notificaciones'}
      >
        <span className="campana-icono">🔔</span>
        {tieneNotificaciones && (
          <span className="campana-badge">{totalNotificaciones > 9 ? '9+' : totalNotificaciones}</span>
        )}
      </button>

      {abierto && (
        <div className="notificaciones-dropdown">
          <div className="notificaciones-header">
            <h3>Notificaciones</h3>
            <button className="btn-refrescar" onClick={cargarNotificaciones} disabled={cargando}>
              {cargando ? '...' : '↻'}
            </button>
          </div>

          <div className="notificaciones-lista">
            {cargando && notificaciones.length === 0 ? (
              <div className="notificaciones-cargando">Cargando...</div>
            ) : notificaciones.length === 0 ? (
              <div className="notificaciones-vacio">
                <span>✓</span>
                <p>No hay notificaciones pendientes</p>
              </div>
            ) : (
              notificaciones.map(notif => (
                <button
                  key={notif.id}
                  className={`notificacion-item notificacion-${notif.tipo}`}
                  onClick={() => handleNotificacionClick(notif)}
                >
                  <span className="notificacion-icono">{notif.icono}</span>
                  <div className="notificacion-contenido">
                    <span className="notificacion-titulo">{notif.titulo}</span>
                    <span className="notificacion-descripcion">{notif.descripcion}</span>
                    <span className="notificacion-fecha">
                      {notif.fecha ? new Date(notif.fecha).toLocaleDateString('es-CL') : ''}
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
