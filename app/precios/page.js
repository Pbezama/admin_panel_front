'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Check, ArrowRight } from 'lucide-react'
import Header from '@/components/Crecetec/Header'
import Footer from '@/components/Crecetec/Footer'
import WhatsAppButton from '@/components/Crecetec/WhatsAppButton'
import CTASection from '@/components/Crecetec/sections/CTASection'

const servicios = [
  {
    name: 'Diseño de Paginas Web',
    type: 'Pago unico',
    price: '$499.990',
    features: [
      'Diseño personalizado',
      'Responsive (movil y desktop)',
      '1 año de hosting incluido',
      'SSL incluido',
      'Entrega en 3-4 semanas',
    ],
    href: '/servicios/diseno-web',
  },
  {
    name: 'Tiendas Virtuales',
    type: 'Pago unico',
    price: '$550.000',
    features: [
      'E-commerce completo',
      'Pasarelas de pago integradas',
      '1 año de hosting incluido',
      'Panel de administracion',
      'Capacitacion incluida',
    ],
    href: '/servicios/tiendas-virtuales',
    popular: true,
  },
  {
    name: 'Marketing y Publicidad',
    type: 'Mensual',
    price: '$499.990/mes',
    features: [
      'Analisis de mercado',
      'Campañas Google y Meta Ads',
      'Optimizacion continua',
      'Reportes mensuales',
      'Dashboard 24/7',
    ],
    href: '/servicios/marketing',
  },
  {
    name: 'Posicionamiento SEO',
    type: 'Mensual',
    price: '$199.990/mes',
    features: [
      'Auditoria tecnica',
      'Optimizacion on-page',
      'Link building',
      'Contenido optimizado',
      'Reportes mensuales',
    ],
    href: '/servicios/seo',
  },
]

const extras = [
  {
    name: 'Asesoria Web Vendedor',
    type: 'Pago unico',
    price: '$100.000 + IVA',
    description: 'Auditoria completa de tu sitio web en 7 fases con plan de mejoras detallado.',
    href: '/extras/asesoria-web-vendedor',
  },
  {
    name: 'Chat Vendedor',
    type: 'Mensual',
    price: '$49.990 + IVA/mes',
    description: 'Chatbot inteligente con 400 conversaciones incluidas. Primer mes gratis.',
    badge: '1er mes GRATIS',
    href: '/extras/chat-vendedor',
  },
]

export default function PreciosPage() {
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
                Precios transparentes
              </h1>
              <p className="text-lg text-muted-foreground">
                Sin letras chicas. Sin sorpresas. Sabes exactamente lo que pagas.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Pricing Grid */}
        <section className="section-padding">
          <div className="container-custom">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {servicios.map((servicio, index) => (
                <motion.div
                  key={servicio.name}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`relative bg-card rounded-2xl p-6 shadow-card border ${
                    servicio.popular ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                  }`}
                >
                  {servicio.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">
                      Mas popular
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="text-lg font-display font-semibold text-foreground mb-1">
                      {servicio.name}
                    </h3>
                    <span className="text-sm text-muted-foreground">{servicio.type}</span>
                    <div className="mt-4">
                      <span className="text-3xl font-display font-bold text-primary">
                        {servicio.price}
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {servicio.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={servicio.href}
                    className={`w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                      servicio.popular ? 'btn-primary' : 'btn-outline'
                    }`}
                  >
                    Ver mas
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Extras */}
        <section className="section-padding bg-muted">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                Servicios Extra
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {extras.map((extra, index) => (
                <motion.div
                  key={extra.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-card rounded-2xl p-6 shadow-card border border-border"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-display font-semibold text-foreground">
                          {extra.name}
                        </h3>
                        {extra.badge && (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                            {extra.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">{extra.type}</span>
                    </div>
                    <span className="text-xl font-display font-bold text-primary">
                      {extra.price}
                    </span>
                  </div>
                  <p className="text-muted-foreground mb-4">{extra.description}</p>
                  <Link
                    href={extra.href}
                    className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
                  >
                    Ver detalles
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Notes */}
        <section className="py-12 bg-background">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto bg-muted rounded-2xl p-6 md:p-8">
              <h3 className="font-display font-semibold text-foreground mb-4">
                Notas importantes
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>- Todos los precios son + IVA</li>
                <li>- Paginas Web y Tiendas Virtuales incluyen 1 año de hosting. Despues: $40.000/mes</li>
                <li>- No hay permanencia minima en servicios mensuales</li>
                <li>- Todos los servicios incluyen diseño de contenidos</li>
              </ul>
            </div>
          </div>
        </section>

        <CTASection />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
