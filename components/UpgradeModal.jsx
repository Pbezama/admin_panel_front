'use client'

import { useEffect } from 'react'

/**
 * UpgradeModal - Modal que se muestra cuando se alcanza un límite
 *
 * Props:
 * - isOpen: boolean - Si el modal está abierto
 * - onClose: function - Función para cerrar el modal
 * - tipo: string - Tipo de límite alcanzado ('datos', 'tareas', 'comentarios')
 * - usado: number - Cantidad usada
 * - limite: number - Límite del plan
 */
export default function UpgradeModal({ isOpen, onClose, tipo, usado, limite }) {
  // Cerrar con Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Prevenir scroll del body cuando está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const getNombreTipo = () => {
    switch (tipo) {
      case 'datos':
        return 'reglas, ofertas y respuestas'
      case 'tareas':
        return 'tareas'
      case 'comentarios':
        return 'comentarios procesados'
      default:
        return 'recursos'
    }
  }

  return (
    <div className="upgrade-modal-overlay" onClick={onClose}>
      <div className="upgrade-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          x
        </button>

        <div className="modal-icon">
          <span>!</span>
        </div>

        <h2>Limite alcanzado</h2>

        <p className="modal-mensaje">
          Has alcanzado el limite de <strong>{limite} {getNombreTipo()}</strong> en el plan gratuito.
        </p>

        <div className="modal-uso">
          <div className="uso-barra">
            <div
              className="uso-progreso"
              style={{ width: `${Math.min(100, (usado / limite) * 100)}%` }}
            ></div>
          </div>
          <span className="uso-texto">{usado} / {limite} usados</span>
        </div>

        <div className="modal-beneficios">
          <h3>Con Premium obtendras:</h3>
          <ul>
            <li>Sin limite de reglas, ofertas y respuestas</li>
            <li>Sin limite de tareas</li>
            <li>Colaboradores ilimitados</li>
            <li>Comentarios ilimitados</li>
            <li>Informes y reportes</li>
            <li>Historial completo</li>
            <li>Archivos adjuntos</li>
          </ul>
        </div>

        <div className="modal-acciones">
          <a href="/planes" className="btn-upgrade">
            Ver planes
          </a>
          <button className="btn-cerrar" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>

      <style jsx>{`
        .upgrade-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          backdrop-filter: blur(4px);
        }

        .upgrade-modal {
          background: var(--bg-card, #1a1a2e);
          border: 1px solid var(--border-subtle, #2a2a4a);
          border-radius: 16px;
          padding: 32px;
          max-width: 400px;
          width: 100%;
          position: relative;
          text-align: center;
          animation: modalIn 0.2s ease;
        }

        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .modal-close {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 28px;
          height: 28px;
          border-radius: 6px;
          border: 1px solid var(--border-subtle, #2a2a4a);
          background: transparent;
          color: var(--text-muted, #64748b);
          font-size: 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .modal-close:hover {
          background: var(--bg-secondary, #1f1f3a);
          color: var(--text-primary, #fff);
        }

        .modal-icon {
          width: 64px;
          height: 64px;
          background: rgba(239, 68, 68, 0.1);
          border: 2px solid rgba(239, 68, 68, 0.3);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
        }

        .modal-icon span {
          font-size: 28px;
          font-weight: 700;
          color: #ef4444;
        }

        h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary, #fff);
          margin: 0 0 12px 0;
        }

        .modal-mensaje {
          font-size: 14px;
          color: var(--text-secondary, #94a3b8);
          margin: 0 0 20px 0;
          line-height: 1.5;
        }

        .modal-mensaje strong {
          color: var(--text-primary, #fff);
        }

        .modal-uso {
          background: var(--bg-secondary, #1f1f3a);
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 20px;
        }

        .uso-barra {
          height: 8px;
          background: var(--border-subtle, #2a2a4a);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .uso-progreso {
          height: 100%;
          background: linear-gradient(90deg, #ef4444, #f87171);
          border-radius: 4px;
        }

        .uso-texto {
          font-size: 12px;
          color: var(--text-muted, #64748b);
        }

        .modal-beneficios {
          text-align: left;
          background: rgba(139, 92, 246, 0.05);
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: 10px;
          padding: 16px;
          margin-bottom: 24px;
        }

        .modal-beneficios h3 {
          font-size: 13px;
          font-weight: 600;
          color: var(--accent-purple, #8b5cf6);
          margin: 0 0 12px 0;
        }

        .modal-beneficios ul {
          margin: 0;
          padding-left: 18px;
        }

        .modal-beneficios li {
          font-size: 12px;
          color: var(--text-secondary, #94a3b8);
          line-height: 1.8;
        }

        .modal-acciones {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .btn-upgrade {
          display: block;
          padding: 14px 20px;
          background: var(--gradient-primary, linear-gradient(135deg, #8b5cf6, #ec4899));
          border: none;
          border-radius: 10px;
          color: white;
          font-size: 15px;
          font-weight: 600;
          text-decoration: none;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-upgrade:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);
        }

        .btn-cerrar {
          padding: 12px;
          background: transparent;
          border: 1px solid var(--border-subtle, #2a2a4a);
          border-radius: 8px;
          color: var(--text-secondary, #94a3b8);
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-cerrar:hover {
          background: var(--bg-secondary, #1f1f3a);
          color: var(--text-primary, #fff);
        }

        @media (max-width: 480px) {
          .upgrade-modal {
            padding: 24px;
          }

          .modal-icon {
            width: 56px;
            height: 56px;
          }

          .modal-icon span {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  )
}
