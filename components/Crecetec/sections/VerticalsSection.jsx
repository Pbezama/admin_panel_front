'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Utensils, ShoppingBag, Check, ArrowRight } from 'lucide-react'

const verticals = [
  {
    icon: Utensils,
    title: 'Restaurantes y Gastronomia',
    subtitle: 'Llena tu restaurante sin depender de apps de delivery',
    features: [
      'Campañas locales',
      'Retargeting dias bajos',
      'Contenido reels',
      'Google Business',
    ],
    kpi: '+30%',
    kpiLabel: 'reservas/mes',
    href: '/verticales/restaurantes',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: ShoppingBag,
    title: 'E-commerce y Retail',
    subtitle: 'Vende mas con cada peso invertido en publicidad',
    features: [
      'Meta Ads catalogo',
      'Google Shopping',
      'Remarketing',
      'Email marketing',
    ],
    kpi: 'ROAS >400%',
    kpiLabel: '',
    href: '/verticales/ecommerce',
    color: 'from-blue-500 to-indigo-500',
  },
]

const VerticalsSection = () => {
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
            Especialistas en tu industria
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Soluciones especificas para los sectores que mejor conocemos
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {verticals.map((vertical, index) => (
            <motion.div
              key={vertical.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="bg-card rounded-2xl overflow-hidden shadow-card border border-border h-full flex flex-col">
                {/* Header with gradient */}
                <div className={`bg-gradient-to-r ${vertical.color} p-6`}>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                      <vertical.icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-display font-semibold text-white">
                        {vertical.title}
                      </h3>
                      <p className="text-white/80 text-sm">
                        {vertical.subtitle}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <ul className="space-y-3 mb-6 flex-1">
                    {vertical.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-primary shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div>
                      <span className="text-3xl font-display font-bold text-accent">
                        {vertical.kpi}
                      </span>
                      {vertical.kpiLabel && (
                        <span className="text-muted-foreground ml-1">
                          {vertical.kpiLabel}
                        </span>
                      )}
                    </div>
                    <Link
                      href={vertical.href}
                      className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
                    >
                      Ver solucion
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default VerticalsSection
