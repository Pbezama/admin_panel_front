'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { api } from '@/lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sesionChatId, setSesionChatId] = useState(null)
  const [mensajesCount, setMensajesCount] = useState(0)

  // Estado de onboarding y límites
  const [onboardingCompletado, setOnboardingCompletado] = useState(null)
  const [plan, setPlan] = useState('gratuito')
  const [limitesUso, setLimitesUso] = useState(null)

  // Estado de marca activa (super admin)
  const [marcaActiva, setMarcaActiva] = useState(null)
  const [marcasDisponibles, setMarcasDisponibles] = useState([])

  // Cargar sesión desde localStorage al iniciar
  useEffect(() => {
    const cargarSesion = async () => {
      try {
        const tokenGuardado = localStorage.getItem('token')
        const usuarioGuardado = localStorage.getItem('usuario')

        if (tokenGuardado && usuarioGuardado) {
          // Verificar que el token siga siendo válido
          try {
            const resultado = await api.verify()
            if (resultado.valid) {
              const usr = JSON.parse(usuarioGuardado)
              setUsuario(usr)
              setToken(tokenGuardado)
              setSesionChatId(localStorage.getItem('sesionChatId') || uuidv4())

              // Restaurar marca activa
              const marcaGuardada = localStorage.getItem('marcaActiva')
              if (marcaGuardada) {
                setMarcaActiva(JSON.parse(marcaGuardada))
              } else {
                setMarcaActiva({ id_marca: usr.id_marca, nombre_marca: usr.nombre_marca })
              }
            } else {
              // Token inválido, limpiar
              limpiarSesion()
            }
          } catch (error) {
            // Si es error de autenticación (401/403), limpiar sesión
            if (error?.status === 401 || error?.status === 403) {
              console.warn('Token expirado o inválido, limpiando sesión')
              limpiarSesion()
            } else {
              // Error de conexión real, usar datos guardados
              console.warn('Error de conexión, usando datos guardados')
              const usr = JSON.parse(usuarioGuardado)
              setUsuario(usr)
              setToken(tokenGuardado)
              setSesionChatId(localStorage.getItem('sesionChatId') || uuidv4())

              const marcaGuardada = localStorage.getItem('marcaActiva')
              if (marcaGuardada) {
                setMarcaActiva(JSON.parse(marcaGuardada))
              } else {
                setMarcaActiva({ id_marca: usr.id_marca, nombre_marca: usr.nombre_marca })
              }
            }
          }
        }
      } catch (error) {
        console.error('Error al cargar sesión:', error)
        limpiarSesion()
      } finally {
        setLoading(false)
      }
    }

    cargarSesion()
  }, [])

  const limpiarSesion = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    localStorage.removeItem('sesionChatId')
    localStorage.removeItem('onboardingCompletado')
    localStorage.removeItem('plan')
    localStorage.removeItem('marcaActiva')
    setUsuario(null)
    setToken(null)
    setSesionChatId(null)
    setMensajesCount(0)
    setOnboardingCompletado(null)
    setPlan('gratuito')
    setLimitesUso(null)
    setMarcaActiva(null)
    setMarcasDisponibles([])
  }

  // Verificar estado de onboarding
  const verificarEstadoOnboarding = useCallback(async () => {
    if (!token) return

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/onboarding/status`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const data = await response.json()

      if (data.success) {
        setOnboardingCompletado(data.onboarding_completado)
        setPlan(data.plan || 'gratuito')
        setLimitesUso(data.uso || null)
        localStorage.setItem('onboardingCompletado', String(data.onboarding_completado))
        localStorage.setItem('plan', data.plan || 'gratuito')
      }
    } catch (error) {
      console.error('Error verificando onboarding:', error)
      // Usar valores de localStorage si hay error de conexión
      const savedOnboarding = localStorage.getItem('onboardingCompletado')
      if (savedOnboarding !== null) {
        setOnboardingCompletado(savedOnboarding === 'true')
      }
    }
  }, [token])

  // Cargar límites actuales
  const cargarLimites = useCallback(async () => {
    if (!token) return

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/limites`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const data = await response.json()

      if (data.success) {
        setPlan(data.plan || 'gratuito')
        setLimitesUso({
          uso: data.uso,
          limites: data.limites,
          restantes: data.restantes,
          puede: data.puede
        })
      }
    } catch (error) {
      console.error('Error cargando límites:', error)
    }
  }, [token])

  // Cargar marcas disponibles para super admin (desde cuentas_instagram)
  const cargarMarcasDisponibles = useCallback(async () => {
    if (!token) return

    try {
      const resultado = await api.getMarcasInstagram()
      if (resultado.success && resultado.data) {
        setMarcasDisponibles(resultado.data.map(item => ({
          id_marca: item.id_marca,
          nombre_marca: item.instagram_name || item.page_name || `Marca ${item.id_marca}`,
          instagram_id: item.instagram_id
        })))
      }
    } catch (error) {
      console.error('Error cargando marcas disponibles:', error)
    }
  }, [token])

  // Verificar onboarding cuando cambia el token
  useEffect(() => {
    if (token && usuario) {
      verificarEstadoOnboarding()
    }
  }, [token, usuario, verificarEstadoOnboarding])

  // Cargar marcas disponibles para super admin
  useEffect(() => {
    if (token && usuario?.es_super_admin) {
      cargarMarcasDisponibles()
    }
  }, [token, usuario, cargarMarcasDisponibles])

  const login = async (usuarioInput, contrasena) => {
    try {
      const resultado = await api.login(usuarioInput, contrasena)

      if (resultado.success) {
        const nuevaSesion = uuidv4()

        setUsuario(resultado.usuario)
        setToken(resultado.token)
        setSesionChatId(nuevaSesion)
        setMensajesCount(0)

        // Guardar estado de onboarding del login
        const onboardingState = resultado.onboarding?.completado ?? resultado.usuario?.onboarding_completado ?? false
        const planState = resultado.usuario?.plan || 'gratuito'

        setOnboardingCompletado(onboardingState)
        setPlan(planState)

        // Inicializar marca activa (restaurar de localStorage o usar la del usuario)
        const marcaGuardada = localStorage.getItem('marcaActiva')
        if (marcaGuardada && resultado.usuario.es_super_admin) {
          setMarcaActiva(JSON.parse(marcaGuardada))
        } else {
          const marca = { id_marca: resultado.usuario.id_marca, nombre_marca: resultado.usuario.nombre_marca }
          setMarcaActiva(marca)
          localStorage.setItem('marcaActiva', JSON.stringify(marca))
        }

        localStorage.setItem('token', resultado.token)
        localStorage.setItem('usuario', JSON.stringify(resultado.usuario))
        localStorage.setItem('sesionChatId', nuevaSesion)
        localStorage.setItem('onboardingCompletado', String(onboardingState))
        localStorage.setItem('plan', planState)

        return {
          success: true,
          onboarding_completado: onboardingState,
          requiere_onboarding: !onboardingState
        }
      } else {
        return { success: false, error: resultado.error }
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    limpiarSesion()
  }

  const cambiarMarca = (marca) => {
    setMarcaActiva(marca)
    localStorage.setItem('marcaActiva', JSON.stringify(marca))
    // Recargar para que toda la app use la nueva marca
    window.location.reload()
  }

  const reiniciarChat = () => {
    const nuevaSesion = uuidv4()
    setSesionChatId(nuevaSesion)
    setMensajesCount(0)
    localStorage.setItem('sesionChatId', nuevaSesion)
  }

  const incrementarMensajes = () => {
    setMensajesCount(prev => prev + 1)
  }

  const esSuperAdmin = usuario?.es_super_admin || false
  const tipoUsuario = usuario?.tipo_usuario || 'adm'
  const esColaborador = tipoUsuario === 'colaborador'
  const esAdministrador = tipoUsuario === 'adm' || esSuperAdmin
  const esPlanGratuito = plan === 'gratuito'
  const requiereOnboarding = onboardingCompletado === false

  const value = {
    usuario,
    token,
    loading,
    sesionChatId,
    mensajesCount,
    esSuperAdmin,
    tipoUsuario,
    esColaborador,
    esAdministrador,
    // Onboarding y límites
    onboardingCompletado,
    setOnboardingCompletado,
    plan,
    esPlanGratuito,
    limitesUso,
    requiereOnboarding,
    verificarEstadoOnboarding,
    cargarLimites,
    // Marca activa (super admin)
    marcaActiva,
    marcasDisponibles,
    cambiarMarca,
    // Funciones
    login,
    logout,
    reiniciarChat,
    incrementarMensajes
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}

export default AuthContext
