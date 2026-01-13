'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'

const stats = [
  { value: 50, suffix: '%', prefix: '+', label: 'Alcance organico promedio' },
  { value: 200, suffix: '%', prefix: 'ROAS >', label: 'Retorno en campañas' },
  { value: 30, suffix: '', prefix: '+', label: 'Clientes activos' },
  { value: '5x-8x', suffix: '', prefix: '', label: 'Mejora promedio de ROAS', isText: true },
]

const Counter = ({ value, suffix, prefix, isText }) => {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (isInView && !isText) {
      const duration = 2000
      const steps = 60
      const increment = value / steps
      let current = 0
      const timer = setInterval(() => {
        current += increment
        if (current >= value) {
          setCount(value)
          clearInterval(timer)
        } else {
          setCount(Math.floor(current))
        }
      }, duration / steps)
      return () => clearInterval(timer)
    }
  }, [isInView, value, isText])

  return (
    <span ref={ref}>
      {isText ? value : `${prefix}${count}${suffix}`}
    </span>
  )
}

const ResultsSection = () => {
  return (
    <section className="py-16 md:py-24 bg-accent">
      <div className="container-custom">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-accent-foreground mb-2">
                <Counter value={stat.value} suffix={stat.suffix} prefix={stat.prefix} isText={stat.isText} />
              </div>
              <p className="text-accent-foreground/80 text-sm md:text-base">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ResultsSection
