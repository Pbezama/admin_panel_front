'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

// URL de Facebook OAuth (redirige a mrkt21.com/comentarios/facebook_callback)
const FACEBOOK_OAUTH_URL = 'https://www.facebook.com/v17.0/dialog/oauth?client_id=1321111752593392&redirect_uri=https%3A%2F%2Fwww.mrkt21.com%2Fcomentarios%2Ffacebook_callback&scope=public_profile%2Cpages_show_list%2Cbusiness_management%2Cpages_read_engagement%2Cpages_read_user_content%2Cpages_manage_engagement%2Cpages_manage_metadata%2Cpages_messaging%2Cpages_manage_posts%2Cinstagram_basic%2Cinstagram_manage_comments%2Cinstagram_manage_messages&state=5'

// Configuracion de polling
const POLLING_INTERVAL = 2000 // 2 segundos
const MAX_POLLING_TIME = 300000 // 5 minutos

export default function OnboardingFlow() {
  const router = useRouter()
  const { usuario, setOnboardingCompletado } = useAuth()
  const [verificando, setVerificando] = useState(true) // Verificando al cargar
  const [conectando, setConectando] = useState(false)
  const [conectado, setConectado] = useState(false)
  const [error, setError] = useState(null)
  const pollingRef = useRef(null)
  const startTimeRef = useRef(null)
  const verificacionInicial = useRef(false)

  // PRIMERO: Verificar si la marca ya existe en base_cuentas al cargar
  useEffect(() => {
    const verificarMarcaExistente = async () => {
      if (!usuario?.nombre_marca || verificacionInicial.current) return
      verificacionInicial.current = true

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/onboarding/check-connection?nombre_marca=${encodeURIComponent(usuario.nombre_marca)}`
        )
        const data = await res.json()

        if (data.exists) {
          // Marca encontrada - asociar y redirigir directamente
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/onboarding/associate-marca`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: usuario.id,
              id_marca: data.id_marca,
              nombre_marca: data.nombre
            })
          })

          if (setOnboardingCompletado) {
            setOnboardingCompletado(true)
          }

          // Redirigir al chat directamente
          router.push('/chat')
          return
        }
      } catch (err) {
        console.error('Error verificando marca:', err)
      }

      // Si no existe la marca, mostrar pantalla de onboarding
      setVerificando(false)
    }

    verificarMarcaExistente()
  }, [usuario, router, setOnboardingCompletado])

  // Limpiar polling al desmontar
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [])

  // Iniciar polling para detectar conexion
  const iniciarPolling = () => {
    startTimeRef.current = Date.now()

    pollingRef.current = setInterval(async () => {
      // Verificar timeout
      if (Date.now() - startTimeRef.current > MAX_POLLING_TIME) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
        setConectando(false)
        setError('Tiempo de espera agotado. Por favor intenta de nuevo.')
        return
      }

      try {
        // Verificar si ya existe conexion
        const nombreMarca = usuario?.nombre_marca
        if (!nombreMarca) return

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/onboarding/check-connection?nombre_marca=${encodeURIComponent(nombreMarca)}`
        )
        const data = await res.json()

        if (data.exists) {
          // Conexion encontrada - asociar marca al usuario
          clearInterval(pollingRef.current)
          pollingRef.current = null

          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/onboarding/associate-marca`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: usuario.id,
              id_marca: data.id_marca,
              nombre_marca: data.nombre
            })
          })

          // Marcar onboarding como completado y redirigir automaticamente
          setConectando(false)
          setConectado(true)

          if (setOnboardingCompletado) {
            setOnboardingCompletado(true)
          }

          // Redirigir al chat automaticamente despues de 1 segundo
          setTimeout(() => {
            router.push('/chat')
          }, 1000)
        }
      } catch (err) {
        console.error('Error en polling:', err)
      }
    }, POLLING_INTERVAL)
  }

  // Abrir nueva pestaña con Facebook OAuth y comenzar polling
  const handleConnectFacebook = () => {
    setConectando(true)
    setError(null)

    // Abrir Facebook OAuth en nueva pestaña
    window.open(FACEBOOK_OAUTH_URL, '_blank')

    // Iniciar polling para detectar cuando se complete la conexion
    iniciarPolling()
  }

  // Cancelar conexion
  const handleCancelar = () => {
    setConectando(false)
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }

  // Ir al chat
  const handleContinuar = async () => {
    try {
      // Completar onboarding en el backend
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/onboarding/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
    } catch (err) {
      console.error('Error completando onboarding:', err)
    }

    if (setOnboardingCompletado) {
      setOnboardingCompletado(true)
    }
    router.push('/chat')
  }

  // Mostrar loading mientras verifica si la marca ya existe
  if (verificando) {
    return (
      <div className="onboarding-container">
        <div className="onboarding-card">
          <div className="onboarding-header">
            <div className="onboarding-logo">C</div>
            <h1>Verificando cuenta...</h1>
          </div>
          <div className="onboarding-content">
            <div className="esperando-conexion">
              <div className="spinner"></div>
              <p>Verificando si tu marca ya esta conectada...</p>
            </div>
          </div>
        </div>
      </div>
    )
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

            {error && (
              <div className="conexion-error">
                <span>{error}</span>
              </div>
            )}

            {conectado ? (
              <div className="conexion-exitosa">
                <div className="exito-icon">✓</div>
                <span>Cuenta conectada exitosamente</span>
              </div>
            ) : conectando ? (
              <div className="esperando-conexion">
                <div className="spinner"></div>
                <p>Esperando conexion...</p>
                <p className="hint">Completa el proceso en la nueva pestaña que se abrio</p>
                <button onClick={handleCancelar} className="btn-cancelar">
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnectFacebook}
                className="btn-conectar-facebook"
              >
                <span className="btn-icon">f</span>
                <span>Conectar con Facebook</span>
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
