'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Calendar } from 'lucide-react'

const CTASection = () => {
  return (
    <section className="py-20 md:py-28 bg-primary relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-primary-foreground mb-4">
            Listo para crecer?
          </h2>
          <p className="text-primary-foreground/80 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Agenda una asesoria gratuita de 30 minutos y descubre como podemos impulsar tu negocio
          </p>
          <Link
            href="/contacto"
            className="btn-white inline-flex items-center gap-2 text-lg"
          >
            <Calendar className="w-5 h-5" />
            Agendar Ahora
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default CTASection
