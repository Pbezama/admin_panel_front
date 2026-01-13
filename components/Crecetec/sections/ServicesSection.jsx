'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Monitor, ShoppingCart, Megaphone, TrendingUp, ArrowRight } from 'lucide-react'

const services = [
  {
    icon: Monitor,
    title: 'Diseño de Paginas Web',
    description: 'Sitios profesionales y responsivos. Incluye 1 año de hosting.',
    price: '$499.990',
    href: '/servicios/diseno-web',
  },
  {
    icon: ShoppingCart,
    title: 'Tiendas Virtuales',
    description: 'E-commerce con pasarelas de pago. Incluye 1 año de hosting.',
    price: '$550.000',
    href: '/servicios/tiendas-virtuales',
  },
  {
    icon: Megaphone,
    title: 'Marketing y Publicidad',
    description: 'Analisis de mercado, campañas Google/Meta, optimizacion y reportes.',
    price: '$499.990/mes',
    href: '/servicios/marketing',
  },
  {
    icon: TrendingUp,
    title: 'Posicionamiento SEO',
    description: 'Aparece en Google con estrategia de posicionamiento.',
    price: '$199.990/mes',
    href: '/servicios/seo',
  },
]

const ServicesSection = () => {
  return (
    <section id="servicios" className="section-padding bg-background">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Nuestros Servicios
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Soluciones digitales completas para hacer crecer tu negocio
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={service.href} className="block group">
                <div className="card-service h-full">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                      <service.icon className="w-7 h-7 text-primary group-hover:text-accent-foreground transition-colors" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-display font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {service.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-display font-bold text-accent">
                          {service.price}
                        </span>
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                          Ver mas <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ServicesSection
