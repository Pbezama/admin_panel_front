'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useView } from '@/context/ViewContext'
import '@/styles/IntegracionesView.css'

// URL directa de OAuth de Facebook
const FACEBOOK_OAUTH_URL = 'https://www.facebook.com/v17.0/dialog/oauth?client_id=1321111752593392&redirect_uri=https%3A%2F%2Fwww.mrkt21.com%2Fcomentarios%2Ffacebook_callback&scope=public_profile%2Cpages_show_list%2Cbusiness_management%2Cpages_read_engagement%2Cpages_read_user_content%2Cpages_manage_engagement%2Cpages_manage_metadata%2Cpages_messaging%2Cpages_manage_posts%2Cinstagram_basic%2Cinstagram_manage_comments%2Cinstagram_manage_messages&state=5'

export default function IntegracionesView() {
  const { usuario } = useAuth()
  const { volverAlChat } = useView()
  const [conectando, setConectando] = useState(false)
  const [conectado, setConectado] = useState(false)
  const popupIntervalRef = useRef(null)

  // Limpiar intervalo al desmontar
  useEffect(() => {
    return () => {
      if (popupIntervalRef.current) {
        clearInterval(popupIntervalRef.current)
      }
    }
  }, [])

  // Conectar Facebook - abre popup y detecta cuando cierra
  const handleConnectFacebook = () => {
    setConectando(true)

    // Dimensiones y posicion del popup centrado
    const width = 600
    const height = 700
    const left = (window.innerWidth - width) / 2 + window.screenX
    const top = (window.innerHeight - height) / 2 + window.screenY

    const popup = window.open(
      FACEBOOK_OAUTH_URL,
      'facebook_oauth',
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
    )

    // Monitorear cuando el popup se cierra
    popupIntervalRef.current = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(popupIntervalRef.current)
        popupIntervalRef.current = null
        setConectando(false)
        setConectado(true)
      }
    }, 500)
  }

  return (
    <div className="integraciones-view">
      <header className="integraciones-header">
        <div className="header-left">
          <button onClick={volverAlChat} className="btn-volver">
            <span className="volver-icon">&larr;</span>
            <span>Volver</span>
          </button>
          <h1>Integraciones</h1>
        </div>
        <div className="header-right">
          <span className="marca-nombre">{usuario?.nombre_marca || usuario?.email}</span>
        </div>
      </header>

      <main className="integraciones-content">
        <section className="integracion-seccion">
          <div className="seccion-header">
            <div className="seccion-icon facebook-icon">f</div>
            <div className="seccion-info">
              <h2>Facebook e Instagram</h2>
              <p>Conecta tus paginas de Facebook e Instagram Business</p>
            </div>
          </div>

          <div className="conexion-acciones">
            {conectado ? (
              <div className="conexion-exitosa">
                <div className="exito-icon">✓</div>
                <span>Cuenta conectada exitosamente</span>
                <button
                  onClick={() => setConectado(false)}
                  className="btn-conectar-otra"
                >
                  Conectar otra cuenta
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnectFacebook}
                disabled={conectando}
                className={`btn-conectar ${conectando ? 'conectando' : ''}`}
              >
                {conectando ? (
                  <>
                    <div className="spinner-small"></div>
                    <span>Conectando...</span>
                  </>
                ) : (
                  <>
                    <span className="btn-icon">f</span>
                    <span>Conectar con Facebook</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="info-box">
            <h4>Como funciona</h4>
            <ul>
              <li>Al conectar tu pagina de Facebook, tambien se vinculara tu cuenta de Instagram Business</li>
              <li>Podras recibir y responder automaticamente a comentarios</li>
            </ul>
          </div>
        </section>

        <section className="integracion-seccion disabled">
          <div className="seccion-header">
            <div className="seccion-icon whatsapp-icon">W</div>
            <div className="seccion-info">
              <h2>WhatsApp Business</h2>
              <p>Proximamente</p>
            </div>
          </div>
          <div className="coming-soon">
            <span>Proximamente</span>
          </div>
        </section>
      </main>
    </div>
  )
}
