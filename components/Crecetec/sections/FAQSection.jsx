'use client'

import { motion } from 'framer-motion'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const faqs = [
  {
    question: 'Cuanto tiempo toma ver resultados?',
    answer: 'Depende del servicio. SEO: 3-6 meses. Ads: resultados desde la primera semana. Siempre establecemos expectativas claras desde el inicio.',
  },
  {
    question: 'Que inversion en ads necesito?',
    answer: 'Recomendamos minimo $500.000/mes por canal para resultados significativos. Sin embargo, analizamos cada caso para optimizar tu presupuesto.',
  },
  {
    question: 'Tienen permanencia minima?',
    answer: 'No. Trabajamos mes a mes, sin contratos de largo plazo. Nos ganamos tu confianza con resultados, no con clausulas.',
  },
  {
    question: 'Como miden los resultados?',
    answer: 'Dashboard en tiempo real con acceso 24/7 a todas las metricas. Reportes mensuales detallados y reuniones de seguimiento.',
  },
  {
    question: 'Trabajan con cualquier negocio?',
    answer: 'Nos especializamos en PYMES, especialmente restaurantes y e-commerce. Si tu negocio esta fuera de estas categorias, igual conversemos.',
  },
  {
    question: 'Incluyen el diseño de contenidos?',
    answer: 'Si, todos nuestros servicios incluyen diseño de piezas graficas y contenido. Contamos con un equipo creativo dedicado.',
  },
]

const FAQSection = () => {
  return (
    <section id="faq" className="section-padding bg-muted">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Preguntas Frecuentes
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Respuestas claras a las dudas mas comunes
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card rounded-xl border border-border px-6 data-[state=open]:shadow-card"
              >
                <AccordionTrigger className="text-left font-display font-semibold text-foreground hover:text-primary hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  )
}

export default FAQSection
