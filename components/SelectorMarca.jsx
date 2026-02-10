'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import '@/styles/SelectorMarca.css'

const SelectorMarca = () => {
  const { esSuperAdmin, marcaActiva, marcasDisponibles, cambiarMarca } = useAuth()
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false)
  const [marcaPendiente, setMarcaPendiente] = useState(null)

  if (!esSuperAdmin || marcasDisponibles.length === 0 || !marcaActiva) {
    return null
  }

  const handleSeleccion = (e) => {
    const idSeleccionado = e.target.value
    if (String(idSeleccionado) === String(marcaActiva.id_marca)) return

    const marca = marcasDisponibles.find(m => String(m.id_marca) === String(idSeleccionado))
    if (marca) {
      setMarcaPendiente(marca)
      setMostrarConfirmacion(true)
    }
  }

  const confirmarCambio = () => {
    if (marcaPendiente) {
      cambiarMarca(marcaPendiente)
    }
    setMostrarConfirmacion(false)
    setMarcaPendiente(null)
  }

  const cancelarCambio = () => {
    setMostrarConfirmacion(false)
    setMarcaPendiente(null)
  }

  return (
    <>
      <div className="selector-marca">
        <select
          value={marcaActiva.id_marca}
          onChange={handleSeleccion}
          className="selector-marca-dropdown"
        >
          {marcasDisponibles.map(marca => (
            <option key={marca.id_marca} value={marca.id_marca}>
              {marca.nombre_marca}
            </option>
          ))}
        </select>
      </div>

      {mostrarConfirmacion && (
        <div className="confirmacion-overlay" onClick={cancelarCambio}>
          <div className="confirmacion-modal" onClick={e => e.stopPropagation()}>
            <div className="confirmacion-icono">⚠</div>
            <h3>Cambiar de cuenta</h3>
            <p>
              Cambiaras de cuenta a <strong>{marcaPendiente?.nombre_marca}</strong>.
            </p>
            <p className="confirmacion-advertencia">
              Los cambios no guardados se perderan.
            </p>
            <div className="confirmacion-acciones">
              <button className="btn-cancelar" onClick={cancelarCambio}>
                Cancelar
              </button>
              <button className="btn-confirmar" onClick={confirmarCambio}>
                Cambiar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default SelectorMarca
