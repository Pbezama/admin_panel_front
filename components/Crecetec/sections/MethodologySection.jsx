'use client'

import { motion } from 'framer-motion'
import { Search, Target, Rocket, BarChart3 } from 'lucide-react'

const steps = [
  {
    icon: Search,
    number: '01',
    title: 'Diagnostico',
    description: 'Analizamos tu negocio y competencia',
  },
  {
    icon: Target,
    number: '02',
    title: 'Estrategia',
    description: 'Diseñamos el plan a tu medida',
  },
  {
    icon: Rocket,
    number: '03',
    title: 'Ejecucion',
    description: 'Implementamos y optimizamos',
  },
  {
    icon: BarChart3,
    number: '04',
    title: 'Resultados',
    description: 'Medimos y reportamos todo',
  },
]

const MethodologySection = () => {
  return (
    <section className="section-padding bg-background overflow-hidden">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Nuestra metodologia
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Un proceso probado para garantizar el exito de tu proyecto
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative"
              >
                <div className="bg-card rounded-2xl p-6 shadow-card border border-border text-center">
                  {/* Step Number Badge */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                    {index + 1}
                  </div>

                  <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4 mt-2">
                    <step.icon className="w-8 h-8 text-primary" />
                  </div>

                  <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {step.description}
                  </p>
                </div>

                {/* Arrow for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-8 -translate-y-1/2 z-20">
                    <svg className="w-full h-full text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default MethodologySection
