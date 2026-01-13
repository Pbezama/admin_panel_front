'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Phone, Mail, MapPin } from 'lucide-react'
import Header from '@/components/Crecetec/Header'
import Footer from '@/components/Crecetec/Footer'
import WhatsAppButton from '@/components/Crecetec/WhatsAppButton'

export default function ContactoPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    servicio: '',
    mensaje: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const servicios = [
    'Diseño de Paginas Web',
    'Tiendas Virtuales',
    'Marketing y Publicidad',
    'Posicionamiento SEO',
    'Asesoria Web Vendedor',
    'Chat Vendedor',
    'Otro',
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    setFormData({
      nombre: '',
      email: '',
      telefono: '',
      servicio: '',
      mensaje: '',
    })
    setIsSubmitting(false)
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-28">
        {/* Hero */}
        <section className="section-padding bg-gradient-to-br from-primary/10 via-background to-background">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
                Contactanos
              </h1>
              <p className="text-lg text-muted-foreground">
                Cuentanos sobre tu proyecto y te responderemos en menos de 24 horas
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="section-padding">
          <div className="container-custom">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Form */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="bg-card rounded-2xl p-8 shadow-card border border-border">
                  <h2 className="text-2xl font-display font-bold text-foreground mb-6">
                    Solicita tu cotizacion
                  </h2>

                  {submitted && (
                    <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-xl">
                      Mensaje enviado! Nos pondremos en contacto contigo pronto.
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="nombre" className="block text-sm font-medium text-foreground mb-2">
                        Nombre completo *
                      </label>
                      <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                        placeholder="Tu nombre"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                        placeholder="tu@email.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="telefono" className="block text-sm font-medium text-foreground mb-2">
                        Telefono *
                      </label>
                      <input
                        type="tel"
                        id="telefono"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                        placeholder="+56 9 1234 5678"
                      />
                    </div>

                    <div>
                      <label htmlFor="servicio" className="block text-sm font-medium text-foreground mb-2">
                        Servicio de interes *
                      </label>
                      <select
                        id="servicio"
                        name="servicio"
                        value={formData.servicio}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                      >
                        <option value="">Selecciona un servicio</option>
                        {servicios.map((servicio) => (
                          <option key={servicio} value={servicio}>
                            {servicio}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="mensaje" className="block text-sm font-medium text-foreground mb-2">
                        Mensaje
                      </label>
                      <textarea
                        id="mensaje"
                        name="mensaje"
                        value={formData.mensaje}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors resize-none"
                        placeholder="Cuentanos sobre tu proyecto..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary w-full inline-flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        'Enviando...'
                      ) : (
                        <>
                          Enviar mensaje
                          <Send className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </motion.div>

              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-2xl font-display font-bold text-foreground mb-6">
                    Informacion de contacto
                  </h2>
                  <p className="text-muted-foreground mb-8">
                    Prefieres contactarnos directamente? Aqui tienes nuestros datos.
                  </p>
                </div>

                <div className="space-y-6">
                  <a
                    href="https://wa.me/56912345678"
                    className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Phone className="w-6 h-6 text-primary group-hover:text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-foreground">WhatsApp</h3>
                      <p className="text-muted-foreground">+56 9 1234 5678</p>
                    </div>
                  </a>

                  <a
                    href="mailto:contacto@crecetec.com"
                    className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Mail className="w-6 h-6 text-primary group-hover:text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-foreground">Email</h3>
                      <p className="text-muted-foreground">contacto@crecetec.com</p>
                    </div>
                  </a>

                  <div className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-foreground">Ubicacion</h3>
                      <p className="text-muted-foreground">Chile</p>
                    </div>
                  </div>
                </div>

                {/* CTA Card */}
                <div className="bg-gradient-cta rounded-2xl p-8 text-center">
                  <h3 className="text-xl font-display font-bold text-white mb-2">
                    Prefieres una llamada?
                  </h3>
                  <p className="text-white/80 mb-4">
                    Agenda una asesoria gratuita de 30 minutos
                  </p>
                  <a
                    href="https://wa.me/56912345678?text=Hola,%20quiero%20agendar%20una%20asesoría%20gratuita"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-white inline-block"
                  >
                    Agendar ahora
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
