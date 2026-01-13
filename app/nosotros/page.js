'use client'

import { motion } from 'framer-motion'
import { Target, Heart, Users, Award, Lightbulb, Shield } from 'lucide-react'
import Header from '@/components/Crecetec/Header'
import Footer from '@/components/Crecetec/Footer'
import WhatsAppButton from '@/components/Crecetec/WhatsAppButton'
import CTASection from '@/components/Crecetec/sections/CTASection'

const valores = [
  {
    icon: Heart,
    title: 'Cercania',
    description: 'Somos tu socio estrategico, no un proveedor mas. Conocemos tu negocio como si fuera nuestro.',
  },
  {
    icon: Shield,
    title: 'Transparencia',
    description: 'Acceso total a metricas, sin letras chicas. Sabes exactamente que hacemos y por que.',
  },
  {
    icon: Target,
    title: 'Resultados',
    description: 'Nos enfocamos en lo que importa: metricas que impactan tu negocio, no vanity metrics.',
  },
  {
    icon: Lightbulb,
    title: 'Innovacion',
    description: 'Actualizados con las ultimas tendencias y herramientas del marketing digital.',
  },
]

const equipo = [
  {
    nombre: 'Carolina Mendoza',
    cargo: 'Directora General',
    descripcion: '10+ años en marketing digital. Ex-Google.',
    iniciales: 'CM',
  },
  {
    nombre: 'Sebastian Rojas',
    cargo: 'Director de Performance',
    descripcion: 'Especialista en Meta Ads y Google Ads.',
    iniciales: 'SR',
  },
  {
    nombre: 'Valentina Torres',
    cargo: 'Directora Creativa',
    descripcion: 'Diseñadora UX/UI con enfoque en conversion.',
    iniciales: 'VT',
  },
  {
    nombre: 'Andres Muñoz',
    cargo: 'Director de SEO',
    descripcion: 'Experto en posicionamiento organico y contenidos.',
    iniciales: 'AM',
  },
]

export default function NosotrosPage() {
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
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
                Conoce a CreceTec
              </h1>
              <p className="text-lg text-muted-foreground">
                Somos la agencia de marketing digital que ayuda a PYMES a alcanzar su maximo potencial.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Historia */}
        <section className="section-padding">
          <div className="container-custom">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6">
                  Nuestra Historia
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    CreceTec nacio en 2019 con una mision clara: democratizar el marketing digital de calidad para las PYMES.
                  </p>
                  <p>
                    Cansados de ver como las grandes agencias ignoraban a los pequeños negocios, decidimos crear una alternativa: servicios profesionales, transparentes y a precios accesibles.
                  </p>
                  <p>
                    Hoy, despues de mas de 50 proyectos exitosos, seguimos fieles a nuestra filosofia: <span className="text-primary font-medium">crecer junto a nuestros clientes</span>.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="grid grid-cols-2 gap-4"
              >
                <div className="bg-primary text-primary-foreground rounded-2xl p-6 text-center">
                  <div className="text-4xl font-display font-bold mb-2">+50</div>
                  <div className="text-sm opacity-80">Proyectos completados</div>
                </div>
                <div className="bg-muted rounded-2xl p-6 text-center">
                  <div className="text-4xl font-display font-bold text-foreground mb-2">+30</div>
                  <div className="text-sm text-muted-foreground">Clientes activos</div>
                </div>
                <div className="bg-muted rounded-2xl p-6 text-center">
                  <div className="text-4xl font-display font-bold text-foreground mb-2">5+</div>
                  <div className="text-sm text-muted-foreground">Años de experiencia</div>
                </div>
                <div className="bg-secondary text-secondary-foreground rounded-2xl p-6 text-center">
                  <div className="text-4xl font-display font-bold mb-2">95%</div>
                  <div className="text-sm opacity-80">Retencion</div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Mision y Vision */}
        <section className="section-padding bg-muted">
          <div className="container-custom">
            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-card rounded-2xl p-8 shadow-card border border-border"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <Target className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-display font-bold text-foreground mb-4">
                  Nuestra Mision
                </h3>
                <p className="text-muted-foreground">
                  Impulsar el crecimiento digital de las PYMES a traves de estrategias de marketing efectivas, medibles y transparentes.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-card rounded-2xl p-8 shadow-card border border-border"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <Award className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-display font-bold text-foreground mb-4">
                  Nuestra Vision
                </h3>
                <p className="text-muted-foreground">
                  Ser la agencia de referencia para PYMES, reconocida por transformar negocios en marcas digitales exitosas.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Valores */}
        <section className="section-padding">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                Nuestros Valores
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {valores.map((valor, index) => (
                <motion.div
                  key={valor.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <valor.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                    {valor.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {valor.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Equipo */}
        <section className="section-padding bg-muted">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                Nuestro Equipo
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Profesionales apasionados por el marketing digital y comprometidos con tu exito.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {equipo.map((miembro, index) => (
                <motion.div
                  key={miembro.nombre}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-card rounded-2xl p-6 shadow-card border border-border text-center"
                >
                  <div className="w-20 h-20 mx-auto rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-display font-bold mb-4">
                    {miembro.iniciales}
                  </div>
                  <h3 className="text-lg font-display font-semibold text-foreground mb-1">
                    {miembro.nombre}
                  </h3>
                  <p className="text-primary font-medium text-sm mb-2">
                    {miembro.cargo}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {miembro.descripcion}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <CTASection />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
