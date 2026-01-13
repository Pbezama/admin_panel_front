'use client'

import { useAuth } from '@/context/AuthContext'

/**
 * LimiteBanner - Muestra advertencia cuando se acerca al límite
 *
 * Props:
 * - tipo: 'datos' | 'tareas' | 'comentarios' (opcional, si no se pasa muestra todos)
 * - className: clases CSS adicionales
 */
export default function LimiteBanner({ tipo, className = '' }) {
  const { esPlanGratuito, limitesUso } = useAuth()

  // Solo mostrar en plan gratuito
  if (!esPlanGratuito || !limitesUso) {
    return null
  }

  const { uso, limites, restantes } = limitesUso

  // Determinar qué límites mostrar
  const limitesAmostrar = []

  if (!tipo || tipo === 'datos') {
    const datosRestantes = restantes?.datos?.restante ?? (limites?.datos - (uso?.datos_usados || 0))
    if (datosRestantes <= 2 && datosRestantes > 0) {
      limitesAmostrar.push({
        tipo: 'datos',
        restante: datosRestantes,
        limite: limites?.datos || 5,
        nombre: 'reglas/ofertas'
      })
    }
  }

  if (!tipo || tipo === 'tareas') {
    const tareasRestantes = restantes?.tareas?.restante ?? (limites?.tareas - (uso?.tareas_usadas || 0))
    if (tareasRestantes <= 2 && tareasRestantes > 0) {
      limitesAmostrar.push({
        tipo: 'tareas',
        restante: tareasRestantes,
        limite: limites?.tareas || 5,
        nombre: 'tareas'
      })
    }
  }

  if (!tipo || tipo === 'comentarios') {
    const comentariosRestantes = restantes?.comentarios?.restante ?? (limites?.comentarios - (uso?.comentarios_usados || 0))
    if (comentariosRestantes <= 2 && comentariosRestantes > 0) {
      limitesAmostrar.push({
        tipo: 'comentarios',
        restante: comentariosRestantes,
        limite: limites?.comentarios || 5,
        nombre: 'comentarios'
      })
    }
  }

  // Si no hay límites cerca, no mostrar nada
  if (limitesAmostrar.length === 0) {
    return null
  }

  return (
    <div className={`limite-banner ${className}`}>
      {limitesAmostrar.map((item) => (
        <div key={item.tipo} className="limite-item">
          <span className="limite-icon">!</span>
          <span className="limite-texto">
            Te quedan <strong>{item.restante}</strong> de {item.limite} {item.nombre} disponibles
          </span>
          <a href="/planes" className="limite-link">
            Mejorar plan
          </a>
        </div>
      ))}

      <style jsx>{`
        .limite-banner {
          padding: 12px 16px;
          background: rgba(251, 191, 36, 0.1);
          border: 1px solid rgba(251, 191, 36, 0.3);
          border-radius: 8px;
          margin-bottom: 16px;
        }

        .limite-item {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #fbbf24;
          font-size: 13px;
        }

        .limite-item + .limite-item {
          margin-top: 8px;
        }

        .limite-icon {
          width: 20px;
          height: 20px;
          background: rgba(251, 191, 36, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 11px;
          flex-shrink: 0;
        }

        .limite-texto {
          flex: 1;
        }

        .limite-texto strong {
          font-weight: 600;
        }

        .limite-link {
          color: #fbbf24;
          text-decoration: underline;
          font-size: 12px;
          white-space: nowrap;
        }

        .limite-link:hover {
          color: #fcd34d;
        }
      `}</style>
    </div>
  )
}
