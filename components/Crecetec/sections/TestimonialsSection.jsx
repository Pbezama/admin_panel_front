'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Maria Gonzalez',
    role: 'Dueña',
    company: 'Restaurante El Puerto',
    text: 'CreceTec transformo nuestro restaurante. Pasamos de depender de apps de delivery a tener un flujo constante de reservas directas. El ROI ha sido increible.',
    rating: 5,
    avatar: 'MG',
  },
  {
    name: 'Carlos Ramirez',
    role: 'CEO',
    company: 'TiendaTech',
    text: 'El equipo de CreceTec entiende realmente el e-commerce. Nuestro ROAS mejoro un 300% en los primeros 3 meses. Totalmente recomendados.',
    rating: 5,
    avatar: 'CR',
  },
  {
    name: 'Andrea Lopez',
    role: 'Gerente de Marketing',
    company: 'ModaValpo',
    text: 'Por fin una agencia que cumple lo que promete. Dashboard transparente, resultados medibles y un equipo que esta siempre disponible.',
    rating: 5,
    avatar: 'AL',
  },
  {
    name: 'Roberto Soto',
    role: 'Fundador',
    company: 'Cafe Artesanal',
    text: 'Siendo un negocio pequeño, pense que el marketing digital no era para nosotros. CreceTec nos demostro lo contrario con resultados tangibles.',
    rating: 5,
    avatar: 'RS',
  },
]

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

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
            Lo que dicen nuestros clientes
          </h2>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          {/* Quote Icon */}
          <Quote className="absolute -top-4 -left-4 w-16 h-16 text-primary/10" />

          {/* Testimonial Card */}
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-card rounded-2xl p-8 md:p-12 shadow-card border border-border text-center"
          >
            {/* Stars */}
            <div className="flex justify-center gap-1 mb-6">
              {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
              ))}
            </div>

            {/* Text */}
            <p className="text-lg md:text-xl text-foreground mb-8 leading-relaxed">
              "{testimonials[currentIndex].text}"
            </p>

            {/* Author */}
            <div className="flex items-center justify-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-display font-semibold text-lg">
                {testimonials[currentIndex].avatar}
              </div>
              <div className="text-left">
                <div className="font-display font-semibold text-foreground">
                  {testimonials[currentIndex].name}
                </div>
                <div className="text-muted-foreground text-sm">
                  {testimonials[currentIndex].role}, {testimonials[currentIndex].company}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prevTestimonial}
              className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-primary' : 'bg-border'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextTestimonial}
              className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection
