'use client'

/**
 * InformesView - Vista de Informes de Instagram
 *
 * Muestra listado de informes generados por el sistema automatizado,
 * ordenados por fecha de generación. Permite abrir el HTML del informe
 * en nueva pestaña.
 */

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useView } from '@/context/ViewContext'
import { api } from '@/lib/api'
import '@/styles/InformesView.css'

// Formatear número con separador de miles
const formatearNumero = (num) => {
  if (num === null || num === undefined) return '0'
  return Number(num).toLocaleString('es-CL')
}

// Formatear fecha legible
const formatearFecha = (fecha) => {
  if (!fecha) return ''
  return new Date(fecha).toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

// Formatear periodo
const formatearPeriodo = (desde, hasta) => {
  return `${formatearFecha(desde)} - ${formatearFecha(hasta)}`
}

const InformesView = () => {
  const { usuario, logout, marcaActiva, esSuperAdmin } = useAuth()
  const { volverAlChat } = useView()

  const [informes, setInformes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const cargarInformes = async () => {
    try {
      setLoading(true)
      setError(null)
      const marcaId = esSuperAdmin ? marcaActiva?.id_marca : null
      const resultado = await api.getInformes(marcaId)
      if (resultado.success) {
        setInformes(resultado.data)
      } else {
        setError(resultado.error)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarInformes()
  }, [])

  const abrirInforme = (id) => {
    const marcaId = esSuperAdmin ? marcaActiva?.id_marca : null
    const url = api.getInformeHtmlUrl(id, marcaId)
    window.open(url, '_blank')
  }

  if (loading) {
    return (
      <div className="informes-view loading">
        <div className="loading-spinner">Cargando informes...</div>
      </div>
    )
  }

  return (
    <div className="informes-view">
      {/* Header */}
      <header className="informes-header">
        <div className="header-left">
          <button className="btn-volver" onClick={volverAlChat}>← Volver al Chat</button>
          <h1>Informes de Instagram</h1>
        </div>
        <div className="header-right">
          <span className="marca-badge">{marcaActiva?.nombre_marca || usuario?.nombre_marca}</span>
          <button className="btn-cerrar-sesion" onClick={logout}>
            Cerrar Sesion
          </button>
        </div>
      </header>

      {/* Contenido */}
      <div className="informes-content">
        {error ? (
          <div className="informes-error">
            <p>Error: {error}</p>
            <button onClick={cargarInformes}>Reintentar</button>
          </div>
        ) : informes.length === 0 ? (
          <div className="informes-vacio">
            <div className="vacio-icono">📊</div>
            <h2>No hay informes disponibles</h2>
            <p>Cuando se genere un nuevo informe de tu marca, aparecera aqui.</p>
          </div>
        ) : (
          <div className="informes-lista">
            {informes.map(informe => (
              <div key={informe.id} className="informe-card" onClick={() => abrirInforme(informe.id)}>
                <div className="informe-card-header">
                  <div className="informe-periodo">
                    <span className="periodo-label">Periodo</span>
                    <span className="periodo-valor">{formatearPeriodo(informe.periodo_desde, informe.periodo_hasta)}</span>
                  </div>
                  <div className="informe-fecha-generacion">
                    Generado: {formatearFecha(informe.fecha_generacion)}
                  </div>
                </div>

                <div className="informe-metricas">
                  <div className="informe-metrica">
                    <span className="metrica-valor">{formatearNumero(informe.total_posts)}</span>
                    <span className="metrica-label">Posts</span>
                  </div>
                  <div className="informe-metrica">
                    <span className="metrica-valor">{formatearNumero(informe.total_likes)}</span>
                    <span className="metrica-label">Likes</span>
                  </div>
                  <div className="informe-metrica">
                    <span className="metrica-valor">{formatearNumero(informe.total_comments)}</span>
                    <span className="metrica-label">Comentarios</span>
                  </div>
                  <div className="informe-metrica">
                    <span className="metrica-valor">{formatearNumero(informe.total_reach)}</span>
                    <span className="metrica-label">Alcance</span>
                  </div>
                  <div className="informe-metrica">
                    <span className="metrica-valor">{informe.engagement_rate}%</span>
                    <span className="metrica-label">Engagement</span>
                  </div>
                  <div className="informe-metrica">
                    <span className="metrica-valor">{formatearNumero(informe.followers_count)}</span>
                    <span className="metrica-label">Seguidores</span>
                  </div>
                </div>

                <div className="informe-card-footer">
                  <div className="informe-tags">
                    {informe.industria && <span className="informe-tag">{informe.industria}</span>}
                    {informe.sub_industria && <span className="informe-tag tag-sub">{informe.sub_industria}</span>}
                  </div>
                  <button className="btn-ver-informe" onClick={(e) => { e.stopPropagation(); abrirInforme(informe.id) }}>
                    Ver Informe →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default InformesView
