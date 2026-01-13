'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Check, ArrowRight, ChevronDown, Star } from 'lucide-react'
import Header from '@/components/Crecetec/Header'
import Footer from '@/components/Crecetec/Footer'
import WhatsAppButton from '@/components/Crecetec/WhatsAppButton'
import CTASection from '@/components/Crecetec/sections/CTASection'

export default function ServicePageTemplate({
  title,
  subtitle,
  description,
  price,
  priceType,
  priceNote,
  features,
  benefits,
  process,
  methodology,
  differentiators,
  faqs,
  icon: Icon,
}) {
  const [openFaq, setOpenFaq] = useState(null)

  // Use methodology if provided, otherwise use process
  const steps = methodology || process

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
              className="max-w-3xl mx-auto text-center"
            >
              {Icon && (
                <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <Icon className="w-10 h-10 text-primary" />
                </div>
              )}
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xl text-primary font-medium mb-4">
                  {subtitle}
                </p>
              )}
              <p className="text-lg text-muted-foreground mb-6">
                {description}
              </p>
              <div className="inline-flex flex-col items-center gap-1">
                <span className="text-4xl font-display font-bold text-accent">{price}</span>
                <span className="text-muted-foreground">
                  {priceNote || (priceType && `(${priceType})`)}
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section className="section-padding">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-display font-bold text-foreground mb-4">
                Que incluye
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {features.map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="flex items-start gap-3 p-4 bg-card rounded-xl border border-border"
                >
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-foreground">{feature}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Differentiators */}
        {differentiators && differentiators.length > 0 && (
          <section className="section-padding bg-primary text-primary-foreground">
            <div className="container-custom">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl font-display font-bold mb-4">
                  Por que elegirnos
                </h2>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {differentiators.map((diff, index) => (
                  <motion.div
                    key={diff.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center"
                  >
                    <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-white/20 flex items-center justify-center">
                      <Star className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-display font-semibold mb-2">
                      {diff.title}
                    </h3>
                    <p className="text-primary-foreground/80 text-sm">
                      {diff.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Benefits */}
        {benefits && benefits.length > 0 && (
          <section className="section-padding bg-muted">
            <div className="container-custom">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl font-display font-bold text-foreground mb-4">
                  Beneficios
                </h2>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-card rounded-2xl p-6 shadow-card border border-border"
                  >
                    <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Process/Methodology */}
        {steps && steps.length > 0 && (
          <section className="section-padding">
            <div className="container-custom">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl font-display font-bold text-foreground mb-4">
                  Como funciona
                </h2>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                {steps.map((step, index) => (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="relative bg-card rounded-2xl p-6 shadow-card border border-border text-center"
                  >
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                      {step.step || index + 1}
                    </div>
                    <h3 className="text-lg font-display font-semibold text-foreground mt-2 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">{step.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FAQs */}
        {faqs && faqs.length > 0 && (
          <section className="section-padding bg-muted">
            <div className="container-custom">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl font-display font-bold text-foreground mb-4">
                  Preguntas frecuentes
                </h2>
              </motion.div>

              <div className="max-w-3xl mx-auto space-y-4">
                {faqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="bg-card rounded-xl border border-border overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="w-full flex items-center justify-between p-5 text-left"
                    >
                      <span className="font-medium text-foreground pr-4">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform ${
                          openFaq === index ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    <AnimatePresence>
                      {openFaq === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 text-muted-foreground">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-12 bg-background">
          <div className="container-custom text-center">
            <p className="text-muted-foreground mb-4">
              Listo para empezar?
            </p>
            <Link href="/contacto" className="btn-accent inline-flex items-center gap-2 text-lg">
              Solicitar cotizacion
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

        <CTASection />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
