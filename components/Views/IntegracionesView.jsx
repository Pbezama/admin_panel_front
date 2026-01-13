'use client'

/**
 * IntegracionesView - Vista de Integraciones con Facebook/Instagram
 *
 * Permite:
 * - Conectar cuenta de Facebook/Instagram via OAuth
 * - Ver cuentas conectadas
 * - Desconectar cuentas
 */

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useView } from '@/context/ViewContext'
import { api } from '@/lib/api'
import '@/styles/IntegracionesView.css'

// Backend de PythonAnywhere para OAuth de Facebook
const PYTHONANYWHERE_URL = 'https://www.mrkt21.com/comentarios'

export default function IntegracionesView() {
  const { usuario, token } = useAuth()
  const { volverAlChat } = useView()

  const [cuentasConectadas, setCuentasConectadas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [conectando, setConectando] = useState(false)
  const [desconectando, setDesconectando] = useState(null)

  // Cargar cuentas conectadas via proxy (evita CORS)
  const cargarCuentas = useCallback(async () => {
    if (!usuario?.id || !usuario?.id_marca || !token) return

    setCargando(true)
    setError(null)

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
      } else {
        throw new Error(data.error || 'Error al cargar cuentas')
      }
    } catch (err) {
      console.error('Error cargando cuentas:', err)
      setError(err.message)
      setCuentasConectadas([])
    } finally {
      setCargando(false)
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
        // Recargar cuentas conectadas
        cargarCuentas()
      } else if (event.data && event.data.type === 'OAUTH_ERROR') {
        console.error('OAuth error:', event.data)
        setConectando(false)
        setError(event.data.message || 'Error en la conexión')
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [cargarCuentas])

  // Conectar Facebook/Instagram via PythonAnywhere
  const handleConnectFacebook = () => {
    if (!usuario?.id || !usuario?.id_marca) {
      setError('No se encontró información del usuario')
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

    // Calcular posición centrada del popup
    const width = 600
    const height = 700
    const left = (window.screen.width - width) / 2
    const top = (window.screen.height - height) / 2

    const popup = window.open(
      oauthUrl,
      'oauth_facebook',
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
    )

    // Verificar si el popup fue bloqueado
    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      setError('El popup fue bloqueado. Por favor, permite popups para este sitio.')
      setConectando(false)
      return
    }

    // Verificar periódicamente si el popup se cerró sin completar OAuth
    const checkPopup = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkPopup)
        setConectando(false)
      }
    }, 1000)
  }

  // Desconectar cuenta (no disponible con PythonAnywhere actualmente)
  const handleDisconnect = async (pageId) => {
    // Por ahora, la desconexion no esta disponible con el backend de PythonAnywhere
    // Se debe contactar al administrador para desconectar cuentas
    setError('La desconexion de cuentas debe solicitarse al administrador')
  }

  return (
    <div className="integraciones-view">
      {/* Header */}
      <header className="integraciones-header">
        <div className="header-left">
          <button onClick={volverAlChat} className="btn-volver">
            <span className="volver-icon">&larr;</span>
            <span>Volver</span>
          </button>
          <h1>Integraciones</h1>
        </div>
        <div className="header-right">
          <span className="marca-nombre">{usuario?.nombre_marca}</span>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="integraciones-content">
        {/* Sección Facebook/Instagram */}
        <section className="integracion-seccion">
          <div className="seccion-header">
            <div className="seccion-icon facebook-icon">f</div>
            <div className="seccion-info">
              <h2>Facebook e Instagram</h2>
              <p>Conecta tus páginas de Facebook e Instagram Business para automatizar respuestas a comentarios</p>
            </div>
          </div>

          {/* Estado de conexión */}
          <div className="conexion-estado">
            {cargando ? (
              <div className="cargando">
                <div className="spinner"></div>
                <span>Cargando cuentas...</span>
              </div>
            ) : error ? (
              <div className="error-mensaje">
                <span className="error-icon">!</span>
                <span>{error}</span>
                <button onClick={() => { setError(null); cargarCuentas(); }} className="btn-reintentar">
                  Reintentar
                </button>
              </div>
            ) : cuentasConectadas.length > 0 ? (
              <div className="cuentas-lista">
                <h3>Cuentas conectadas ({cuentasConectadas.length})</h3>
                {cuentasConectadas.map((cuenta) => (
                  <div key={cuenta.page_id} className="cuenta-item">
                    <div className="cuenta-info">
                      <span className="cuenta-icon">@</span>
                      <div className="cuenta-detalles">
                        <span className="cuenta-nombre">{cuenta.page_name}</span>
                        {cuenta.instagram_username && (
                          <span className="cuenta-instagram">@{cuenta.instagram_username}</span>
                        )}
                        {cuenta.conectado_en && (
                          <span className="cuenta-fecha">
                            Conectada el {new Date(cuenta.conectado_en).toLocaleDateString('es-CL')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="cuenta-acciones">
                      <span className="cuenta-estado conectado">Conectada</span>
                      <button
                        onClick={() => handleDisconnect(cuenta.page_id)}
                        disabled={desconectando === cuenta.page_id}
                        className="btn-desconectar"
                      >
                        {desconectando === cuenta.page_id ? '...' : 'Desconectar'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="sin-cuentas">
                <span className="sin-cuentas-icon">~</span>
                <p>No tienes cuentas conectadas</p>
                <p className="sin-cuentas-descripcion">
                  Conecta tu página de Facebook para comenzar a automatizar las respuestas a comentarios
                </p>
              </div>
            )}
          </div>

          {/* Botón conectar */}
          <div className="conexion-acciones">
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
          </div>

          {/* Información adicional */}
          <div className="info-box">
            <h4>Como funciona</h4>
            <ul>
              <li>Al conectar tu página de Facebook, también se vinculará tu cuenta de Instagram Business asociada</li>
              <li>Podrás recibir y responder automáticamente a comentarios en tus publicaciones</li>
              <li>La IA generará respuestas personalizadas basadas en el contexto de tu marca</li>
            </ul>
          </div>
        </section>

        {/* Más integraciones (futuro) */}
        <section className="integracion-seccion disabled">
          <div className="seccion-header">
            <div className="seccion-icon whatsapp-icon">W</div>
            <div className="seccion-info">
              <h2>WhatsApp Business</h2>
              <p>Próximamente - Automatiza respuestas en WhatsApp</p>
            </div>
          </div>
          <div className="coming-soon">
            <span>Próximamente</span>
          </div>
        </section>
      </main>
    </div>
  )
}
