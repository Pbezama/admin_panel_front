'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import Header from '@/components/Crecetec/Header'
import Footer from '@/components/Crecetec/Footer'
import WhatsAppButton from '@/components/Crecetec/WhatsAppButton'
import { Check, Sparkles, User, Mail, Building2, Lock, ArrowRight, Loader2, Phone, Calendar, MessageCircle, Shield, Clock, Headphones } from 'lucide-react'

const planes = [
  {
    id: 'basico',
    name: 'Basico',
    price: '$29',
    period: '/mes',
    features: ['1 canal', '500 msgs/mes', 'Soporte email']
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$79',
    period: '/mes',
    popular: true,
    features: ['3 canales', '5,000 msgs/mes', 'IA personalizada']
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: null,
    features: ['Ilimitado', 'Soporte 24/7', 'API access']
  }
]

function RegistroContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { login } = useAuth()
  const [planSeleccionado, setPlanSeleccionado] = useState('pro')
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    empresa: '',
    password: ''
  })
  const [registrando, setRegistrando] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const planParam = searchParams.get('plan')
    if (planParam && planes.find(p => p.id === planParam)) {
      setPlanSeleccionado(planParam)
    }
  }, [searchParams])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setRegistrando(true)

    try {
      if (!formData.nombre || !formData.email || !formData.empresa || !formData.password) {
        throw new Error('Todos los campos son requeridos')
      }

      if (formData.password.length < 8) {
        throw new Error('La contrasena debe tener al menos 8 caracteres')
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            nombre: formData.nombre,
            email: formData.email,
            empresa: formData.empresa,
            password: formData.password
          })
        }
      )

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Error al registrar')
      }

      if (data.token) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('usuario', JSON.stringify(data.usuario))
        localStorage.setItem('onboardingCompletado', 'false')
        localStorage.setItem('plan', 'gratuito')
        router.push('/onboarding')
      } else {
        router.push('/login?registered=true')
      }

    } catch (err) {
      console.error('Error en registro:', err)
      setError(err.message || 'Error al registrar usuario')
    } finally {
      setRegistrando(false)
    }
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

        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-4xl mx-auto"
          >
        {/* Main Card */}
        <div className="bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">

          {/* Card Header */}
          <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-5 text-center">
            <h1 className="text-xl font-display font-bold text-white">
              Crea tu cuenta
            </h1>
            <p className="text-primary-foreground/80 text-sm mt-1">
              Selecciona tu plan y comienza a crecer
            </p>
          </div>

          {/* Content Grid */}
          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">

            {/* Left Column - Plan Selection */}
            <div className="p-6 md:p-8 bg-muted/30">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Selecciona un Plan
                </h2>
              </div>

              <div className="space-y-3">
                {planes.map((plan) => (
                  <motion.div
                    key={plan.id}
                    onClick={() => setPlanSeleccionado(plan.id)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`
                      relative p-5 rounded-xl cursor-pointer transition-all duration-200
                      ${planSeleccionado === plan.id
                        ? 'bg-primary/10 border-2 border-primary shadow-lg'
                        : 'bg-card border-2 border-transparent hover:border-border shadow-sm hover:shadow-md'
                      }
                    `}
                  >
                    {/* Popular Badge */}
                    {plan.popular && (
                      <span className="absolute -top-2.5 right-4 px-3 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded-full shadow-md">
                        Popular
                      </span>
                    )}

                    {/* Plan Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                          ${planSeleccionado === plan.id
                            ? 'border-primary bg-primary'
                            : 'border-muted-foreground/30'
                          }
                        `}>
                          {planSeleccionado === plan.id && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span className="font-display font-semibold text-foreground">{plan.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-display font-bold text-foreground">{plan.price}</span>
                        {plan.period && (
                          <span className="text-sm text-muted-foreground">{plan.period}</span>
                        )}
                      </div>
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap gap-2 pl-8">
                      {plan.features.map((feat, i) => (
                        <span
                          key={i}
                          className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-md"
                        >
                          {feat}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Plan Benefits Note */}
              <div className="mt-6 p-4 bg-card rounded-xl border border-border">
                <p className="text-xs text-muted-foreground text-center">
                  Todos los planes incluyen <strong className="text-foreground">14 dias gratis</strong> para probar
                </p>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center text-center p-3 bg-card rounded-xl border border-border">
                  <Shield className="w-5 h-5 text-primary mb-1" />
                  <span className="text-[10px] text-muted-foreground">Datos seguros</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 bg-card rounded-xl border border-border">
                  <Clock className="w-5 h-5 text-primary mb-1" />
                  <span className="text-[10px] text-muted-foreground">Setup en 5 min</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 bg-card rounded-xl border border-border">
                  <Headphones className="w-5 h-5 text-primary mb-1" />
                  <span className="text-[10px] text-muted-foreground">Soporte incluido</span>
                </div>
              </div>

              {/* Prefer a Call? CTA */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6 bg-gradient-to-br from-primary to-primary/80 rounded-xl p-5 text-center"
              >
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-display font-bold text-white mb-1">
                  Prefieres una llamada?
                </h3>
                <p className="text-sm text-white/80 mb-4">
                  Agenda una asesoria gratuita de 30 minutos
                </p>
                <a
                  href="https://wa.me/56912345678?text=Hola,%20quiero%20agendar%20una%20asesoría%20gratuita"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white text-primary font-semibold px-5 py-2.5 rounded-lg hover:bg-white/90 transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  Agendar ahora
                </a>
              </motion.div>

              {/* WhatsApp Quick Contact */}
              <a
                href="https://wa.me/56912345678?text=Hola,%20tengo%20dudas%20sobre%20los%20planes"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center gap-3 p-4 bg-card rounded-xl border border-border hover:border-green-500 transition-colors group"
              >
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-500 transition-colors">
                  <MessageCircle className="w-5 h-5 text-green-600 group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium text-foreground">Tienes dudas?</span>
                  <p className="text-xs text-muted-foreground">Escribenos por WhatsApp</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-green-500 transition-colors" />
              </a>
            </div>

            {/* Right Column - Registration Form */}
            <div className="p-6 md:p-8 bg-card">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-accent" />
                </div>
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Tus Datos
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nombre completo
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      placeholder="Tu nombre"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                {/* Empresa */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nombre de tu empresa
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      name="empresa"
                      value={formData.empresa}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      placeholder="Mi Empresa S.A."
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Contrasena
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={8}
                      className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      placeholder="Minimo 8 caracteres"
                    />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl flex items-center gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-destructive font-bold text-sm">!</span>
                    </div>
                    <span className="text-sm text-destructive">{error}</span>
                  </motion.div>
                )}

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={registrando}
                  whileHover={{ scale: registrando ? 1 : 1.02 }}
                  whileTap={{ scale: registrando ? 1 : 0.98 }}
                  className={`
                    w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all
                    ${registrando
                      ? 'bg-muted text-muted-foreground cursor-not-allowed'
                      : 'bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/25'
                    }
                  `}
                >
                  {registrando ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creando cuenta...
                    </>
                  ) : (
                    <>
                      Crear cuenta gratis
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>

                {/* Login Link */}
                <p className="text-center text-sm text-muted-foreground pt-2">
                  Ya tienes cuenta?{' '}
                  <Link href="/login" className="text-primary font-medium hover:underline">
                    Inicia sesion
                  </Link>
                </p>

                {/* Security Note */}
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-start gap-3 text-xs text-muted-foreground">
                    <Shield className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <p>
                      Tus datos estan protegidos con encriptacion SSL. Nunca compartimos tu informacion con terceros.
                    </p>
                  </div>
                </div>

                {/* Contact Alternative */}
                <div className="mt-4 p-4 bg-muted/50 rounded-xl">
                  <p className="text-xs text-center text-muted-foreground">
                    Necesitas ayuda? Contactanos al{' '}
                    <a href="mailto:soporte@crecetec.com" className="text-primary hover:underline">
                      soporte@crecetec.com
                    </a>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>

            {/* Footer Note */}
            <p className="text-center text-xs text-muted-foreground mt-6">
              Al crear tu cuenta, aceptas nuestros{' '}
              <Link href="/terminos" className="text-primary hover:underline">Terminos de Servicio</Link>
              {' '}y{' '}
              <Link href="/privacidad" className="text-primary hover:underline">Politica de Privacidad</Link>
            </p>
          </motion.div>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  )
}

export default function RegistroPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Cargando...</span>
        </div>
      </div>
    }>
      <RegistroContent />
    </Suspense>
  )
}
