'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'

// Backend de PythonAnywhere para OAuth de Facebook
const PYTHONANYWHERE_URL = 'https://www.mrkt21.com/comentarios'

export default function OnboardingFlow() {
  const router = useRouter()
  const { usuario, token, setOnboardingCompletado } = useAuth()

  const [paso, setPaso] = useState(1)
  const [conectando, setConectando] = useState(false)
  const [cuentasConectadas, setCuentasConectadas] = useState([])
  const [error, setError] = useState(null)
  const [cargandoCuentas, setCargandoCuentas] = useState(true)
  const [completandoOnboarding, setCompletandoOnboarding] = useState(false)

  // Cargar cuentas conectadas via proxy (evita CORS)
  const cargarCuentas = useCallback(async () => {
    if (!usuario?.id || !usuario?.id_marca || !token) return

    setCargandoCuentas(true)
    try {
      // Usar proxy local para evitar CORS con PythonAnywhere
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(
        `${apiUrl}/api/facebook/proxy-accounts`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const data = await response.json()

      if (data.success) {
        setCuentasConectadas(data.accounts || [])
        // Si ya tiene cuentas, avanzar al paso 2
        if (data.accounts && data.accounts.length > 0) {
          setPaso(2)
        }
      }
    } catch (err) {
      console.error('Error cargando cuentas:', err)
    } finally {
      setCargandoCuentas(false)
    }
  }, [usuario, token])

  useEffect(() => {
    cargarCuentas()
  }, [cargarCuentas])

  // Escuchar mensajes de OAuth
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'OAUTH_SUCCESS') {
        console.log('OAuth exitoso:', event.data)
        setConectando(false)
        setError(null)
        cargarCuentas()
        setPaso(2) // Avanzar al paso 2
      } else if (event.data && event.data.type === 'OAUTH_ERROR') {
        console.error('OAuth error:', event.data)
        setConectando(false)
        setError(event.data.message || 'Error en la conexion')
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [cargarCuentas])

  // Conectar Facebook/Instagram via PythonAnywhere
  const handleConnectFacebook = () => {
    if (!usuario?.id || !usuario?.id_marca) {
      setError('No se encontro informacion del usuario')
      return
    }

    setConectando(true)
    setError(null)

    const callbackUrl = window.location.origin

    // Usar el backend de PythonAnywhere para OAuth
    const oauthUrl = `${PYTHONANYWHERE_URL}/oauth/init?` +
      `crecetec_user_id=${usuario.id}` +
      `&crecetec_marca_id=${usuario.id_marca}` +
      `&callback_url=${encodeURIComponent(callbackUrl)}`

    const width = 600
    const height = 700
    const left = (window.screen.width - width) / 2
    const top = (window.screen.height - height) / 2

    const popup = window.open(
      oauthUrl,
      'oauth_facebook',
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
    )

    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      setError('El popup fue bloqueado. Por favor, permite popups para este sitio.')
      setConectando(false)
      return
    }

    const checkPopup = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkPopup)
        setConectando(false)
      }
    }, 1000)
  }

  // Completar onboarding
  const handleCompletarOnboarding = async () => {
    if (cuentasConectadas.length === 0) {
      setError('Debes conectar al menos una cuenta de Facebook/Instagram')
      return
    }

    setCompletandoOnboarding(true)
    setError(null)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/onboarding/complete`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const data = await response.json()

      if (data.success) {
        // Actualizar estado en contexto
        if (setOnboardingCompletado) {
          setOnboardingCompletado(true)
        }
        // Redirigir al chat
        router.push('/chat')
      } else {
        throw new Error(data.error || 'Error al completar onboarding')
      }
    } catch (err) {
      console.error('Error completando onboarding:', err)
      setError(err.message)
    } finally {
      setCompletandoOnboarding(false)
    }
  }

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        {/* Header */}
        <div className="onboarding-header">
          <div className="onboarding-logo">C</div>
          <h1>Bienvenido a Crecetec</h1>
          <p>Configura tu cuenta para comenzar</p>
        </div>

        {/* Pasos */}
        <div className="onboarding-steps">
          <div className={`step ${paso >= 1 ? 'active' : ''} ${paso > 1 ? 'completed' : ''}`}>
            <div className="step-number">{paso > 1 ? '✓' : '1'}</div>
            <span>Conectar redes</span>
          </div>
          <div className="step-line"></div>
          <div className={`step ${paso >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <span>Comenzar</span>
          </div>
        </div>

        {/* Contenido segun paso */}
        <div className="onboarding-content">
          {paso === 1 && (
            <>
              <div className="step-content">
                <div className="step-icon facebook-icon">f</div>
                <h2>Conecta tu Facebook e Instagram</h2>
                <p>
                  Para usar Crecetec, necesitas conectar al menos una pagina de Facebook.
                  Esto nos permite automatizar las respuestas a comentarios en tus publicaciones.
                </p>

                {error && (
                  <div className="onboarding-error">
                    <span className="error-icon">!</span>
                    <span>{error}</span>
                  </div>
                )}

                {cargandoCuentas ? (
                  <div className="loading-cuentas">
                    <div className="spinner-small"></div>
                    <span>Verificando cuentas...</span>
                  </div>
                ) : cuentasConectadas.length > 0 ? (
                  <div className="cuentas-conectadas-preview">
                    <p className="cuentas-label">Cuentas conectadas:</p>
                    {cuentasConectadas.map((cuenta) => (
                      <div key={cuenta.page_id} className="cuenta-preview">
                        <span className="cuenta-icon-small">@</span>
                        <span>{cuenta.page_name}</span>
                        {cuenta.instagram_username && (
                          <span className="ig-tag">@{cuenta.instagram_username}</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : null}

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
                  ) : cuentasConectadas.length > 0 ? (
                    <>
                      <span className="btn-icon">+</span>
                      <span>Conectar otra cuenta</span>
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">f</span>
                      <span>Conectar con Facebook</span>
                    </>
                  )}
                </button>

                {cuentasConectadas.length > 0 && (
                  <button
                    onClick={() => setPaso(2)}
                    className="btn-siguiente"
                  >
                    Continuar
                  </button>
                )}
              </div>
            </>
          )}

          {paso === 2 && (
            <>
              <div className="step-content">
                <div className="step-icon success-icon">✓</div>
                <h2>Todo listo!</h2>
                <p>
                  Has conectado {cuentasConectadas.length} cuenta{cuentasConectadas.length !== 1 ? 's' : ''}.
                  Ahora puedes comenzar a usar Crecetec para automatizar las respuestas a comentarios.
                </p>

                <div className="plan-info">
                  <h3>Tu plan: Gratuito</h3>
                  <ul>
                    <li>5 comentarios procesados</li>
                    <li>5 reglas/ofertas/respuestas</li>
                    <li>5 tareas</li>
                    <li>1 cuenta de Facebook</li>
                    <li>20 mensajes de chat por sesion</li>
                  </ul>
                  <p className="upgrade-hint">
                    Mejora a Premium para eliminar todos los limites
                  </p>
                </div>

                {error && (
                  <div className="onboarding-error">
                    <span className="error-icon">!</span>
                    <span>{error}</span>
                  </div>
                )}

                <button
                  onClick={handleCompletarOnboarding}
                  disabled={completandoOnboarding}
                  className="btn-comenzar"
                >
                  {completandoOnboarding ? (
                    <>
                      <div className="spinner-small"></div>
                      <span>Configurando...</span>
                    </>
                  ) : (
                    <span>Comenzar a usar Crecetec</span>
                  )}
                </button>

                <button
                  onClick={() => setPaso(1)}
                  className="btn-volver-paso"
                >
                  Volver a conectar cuentas
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="onboarding-footer">
          <p>Al continuar, aceptas nuestros terminos de servicio y politica de privacidad</p>
        </div>
      </div>
    </div>
  )
}
