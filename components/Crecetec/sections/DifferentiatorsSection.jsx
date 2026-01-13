'use client'

import { motion } from 'framer-motion'
import { MapPin, LayoutDashboard, Settings, ClipboardCheck } from 'lucide-react'

const differentiators = [
  {
    icon: MapPin,
    title: 'Cercania',
    description: 'Tu socio estrategico, no un proveedor mas',
  },
  {
    icon: LayoutDashboard,
    title: 'Transparencia Total',
    description: 'Acceso completo a todas tus metricas',
  },
  {
    icon: Settings,
    title: 'Flexibilidad',
    description: 'Servicios que se adaptan a tu negocio',
  },
  {
    icon: ClipboardCheck,
    title: 'Limites Claros',
    description: 'Entregables definidos, sin sorpresas',
  },
]

const DifferentiatorsSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Por que elegir CreceTec?
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {differentiators.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <item.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                {item.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default DifferentiatorsSection
