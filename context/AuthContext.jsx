'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { api } from '@/lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sesionChatId, setSesionChatId] = useState(null)
  const [mensajesCount, setMensajesCount] = useState(0)

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
              setUsuario(JSON.parse(usuarioGuardado))
              setToken(tokenGuardado)
              setSesionChatId(localStorage.getItem('sesionChatId') || uuidv4())
            } else {
              // Token inválido, limpiar
              limpiarSesion()
            }
          } catch {
            // Error de conexión, usar datos guardados
            setUsuario(JSON.parse(usuarioGuardado))
            setToken(tokenGuardado)
            setSesionChatId(localStorage.getItem('sesionChatId') || uuidv4())
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
    setUsuario(null)
    setToken(null)
    setSesionChatId(null)
    setMensajesCount(0)
  }

  const login = async (usuarioInput, contrasena) => {
    try {
      const resultado = await api.login(usuarioInput, contrasena)

      if (resultado.success) {
        const nuevaSesion = uuidv4()

        setUsuario(resultado.usuario)
        setToken(resultado.token)
        setSesionChatId(nuevaSesion)
        setMensajesCount(0)

        localStorage.setItem('token', resultado.token)
        localStorage.setItem('usuario', JSON.stringify(resultado.usuario))
        localStorage.setItem('sesionChatId', nuevaSesion)

        return { success: true }
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
