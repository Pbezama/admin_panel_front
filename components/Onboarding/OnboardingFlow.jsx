'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

// URL directa de OAuth de Facebook
const FACEBOOK_OAUTH_URL = 'https://www.facebook.com/v17.0/dialog/oauth?client_id=1321111752593392&redirect_uri=https%3A%2F%2Fwww.mrkt21.com%2Fcomentarios%2Ffacebook_callback&scope=public_profile%2Cpages_show_list%2Cbusiness_management%2Cpages_read_engagement%2Cpages_read_user_content%2Cpages_manage_engagement%2Cpages_manage_metadata%2Cpages_messaging%2Cpages_manage_posts%2Cinstagram_basic%2Cinstagram_manage_comments%2Cinstagram_manage_messages&state=5'

export default function OnboardingFlow() {
  const router = useRouter()
  const { usuario, setOnboardingCompletado } = useAuth()
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

  // Ir al chat
  const handleContinuar = () => {
    if (setOnboardingCompletado) {
      setOnboardingCompletado(true)
    }
    router.push('/chat')
  }

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        <div className="onboarding-header">
          <div className="onboarding-logo">C</div>
          <h1>Bienvenido a Crecetec</h1>
          <p>Conecta tu cuenta de Facebook para comenzar</p>
        </div>

        <div className="onboarding-content">
          <div className="step-content">
            <div className="step-icon facebook-icon">f</div>
            <h2>Conecta tu Facebook e Instagram</h2>
            <p>
              Conecta tu pagina de Facebook para automatizar respuestas a comentarios.
            </p>

            {conectado ? (
              <div className="conexion-exitosa">
                <div className="exito-icon">✓</div>
                <span>Cuenta conectada exitosamente</span>
              </div>
            ) : (
              <button
                onClick={handleConnectFacebook}
                disabled={conectando}
                className={`btn-conectar-facebook ${conectando ? 'conectando' : ''}`}
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

            <button onClick={handleContinuar} className="btn-siguiente">
              {conectado ? 'Continuar al chat' : 'Omitir por ahora'}
            </button>
          </div>
        </div>

        <div className="onboarding-footer">
          <p>Al continuar, aceptas nuestros terminos de servicio</p>
        </div>
      </div>
    </div>
  )
}
