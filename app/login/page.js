'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import Header from '@/components/Crecetec/Header'
import Footer from '@/components/Crecetec/Footer'
import WhatsAppButton from '@/components/Crecetec/WhatsAppButton'
import { User, Lock, ArrowRight, Loader2, Shield } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { usuario, loading, login } = useAuth()
  const [usuarioInput, setUsuarioInput] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    if (!loading && usuario) {
      router.push('/chat')
    }
  }, [usuario, loading, router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setEnviando(true)

    try {
      const resultado = await login(usuarioInput, contrasena)

      if (resultado.success) {
        router.push('/chat')
      } else {
        setError(resultado.error || 'Error al iniciar sesion')
      }
    } catch (err) {
      setError('Error de conexion con el servidor')
      console.error(err)
    } finally {
      setEnviando(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Cargando...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 pt-32 pb-16 px-4">
        {/* Background decorations */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="container-custom flex items-center justify-center min-h-[60vh]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            {/* Main Card */}
            <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden">

              {/* Card Header */}
              <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-5 text-center">
                <h1 className="text-xl font-display font-bold text-white">
                  Iniciar Sesion
                </h1>
                <p className="text-primary-foreground/80 text-sm mt-1">
                  Accede a tu panel de administracion
                </p>
              </div>

              {/* Form */}
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Usuario */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Usuario o Email
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={usuarioInput}
                        onChange={(e) => setUsuarioInput(e.target.value)}
                        required
                        disabled={enviando}
                        className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all disabled:opacity-50 text-sm"
                        placeholder="Ingresa tu usuario"
                      />
                    </div>
                  </div>

                  {/* Contrasena */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Contrasena
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        value={contrasena}
                        onChange={(e) => setContrasena(e.target.value)}
                        required
                        disabled={enviando}
                        className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all disabled:opacity-50 text-sm"
                        placeholder="Ingresa tu contrasena"
                      />
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-center gap-2"
                    >
                      <div className="w-5 h-5 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-destructive font-bold text-xs">!</span>
                      </div>
                      <span className="text-sm text-destructive">{error}</span>
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={enviando}
                    className={`
                      w-full py-2.5 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-all text-sm
                      ${enviando
                        ? 'bg-muted text-muted-foreground cursor-not-allowed'
                        : 'bg-primary hover:bg-primary/90'
                      }
                    `}
                  >
                    {enviando ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Iniciando sesion...
                      </>
                    ) : (
                      <>
                        Iniciar Sesion
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Forgot Password */}
                  <div className="text-center">
                    <Link
                      href="/recuperar-contrasena"
                      className="text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      Olvidaste tu contrasena?
                    </Link>
                  </div>

                  {/* Divider */}
                  <div className="relative py-3">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">o</span>
                    </div>
                  </div>

                  {/* Register Link */}
                  <p className="text-center text-sm text-muted-foreground">
                    No tienes cuenta?{' '}
                    <Link href="/registro" className="text-primary font-medium hover:underline">
                      Registrate gratis
                    </Link>
                  </p>
                </form>
              </div>
            </div>

            {/* Security Note */}
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="w-3.5 h-3.5 text-green-600" />
              <span>Conexion segura con encriptacion SSL</span>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  )
}
