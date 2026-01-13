'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { FileSearch, MessageSquare, Check, ArrowRight } from 'lucide-react'

const extras = [
  {
    icon: FileSearch,
    title: 'Asesoria Web Vendedor',
    price: '$100.000 + IVA',
    priceType: 'pago unico',
    features: [
      'Auditoria completa de tu sitio web en 7 fases',
      'Mapa de journey del cliente',
      'Plan de mejoras P0/P1/P2',
      'Guia de contenido y tracking',
    ],
    cta: 'Saber mas',
    href: '/extras/asesoria-web-vendedor',
  },
  {
    icon: MessageSquare,
    title: 'Chat Vendedor',
    price: '$49.990 + IVA/mes',
    priceType: 'mensual',
    badge: 'Primer mes GRATIS',
    features: [
      'Chatbot inteligente para tu sitio',
      '400 conversaciones incluidas',
      'Primer mes GRATIS',
      'Aumenta conversiones 24/7',
    ],
    cta: 'Activar Chat',
    href: '/extras/chat-vendedor',
  },
]

const ExtrasSection = () => {
  return (
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
            Potencia tu negocio con estos extras
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Servicios adicionales para maximizar tus resultados
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {extras.map((extra, index) => (
            <motion.div
              key={extra.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="bg-card rounded-2xl p-6 md:p-8 shadow-card border border-border h-full flex flex-col">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <extra.icon className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-display font-semibold text-foreground">
                        {extra.title}
                      </h3>
                      {extra.badge && (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                          {extra.badge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-display font-bold text-accent">
                        {extra.price}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({extra.priceType})
                      </span>
                    </div>
                  </div>
                </div>

                <ul className="space-y-3 mb-6 flex-1">
                  {extra.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={extra.href}
                  className="btn-outline w-full inline-flex items-center justify-center gap-2"
                >
                  {extra.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ExtrasSection
