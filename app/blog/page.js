'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, ArrowRight, Mail, Send } from 'lucide-react'
import Header from '@/components/Crecetec/Header'
import Footer from '@/components/Crecetec/Footer'
import WhatsAppButton from '@/components/Crecetec/WhatsAppButton'

const posts = [
  {
    id: 1,
    slug: '5-estrategias-seo-pymes',
    title: '5 Estrategias SEO que Toda PYME Deberia Implementar en 2024',
    excerpt: 'Descubre las tacticas de posicionamiento mas efectivas para negocios locales que quieren aparecer en Google.',
    category: 'SEO',
    date: '15 Dic 2024',
    readTime: '5 min',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop',
  },
  {
    id: 2,
    slug: 'guia-meta-ads-restaurantes',
    title: 'Guia Completa de Meta Ads para Restaurantes',
    excerpt: 'Aprende a crear campañas de publicidad en Facebook e Instagram que llenen tu local sin depender de apps de delivery.',
    category: 'Marketing',
    date: '10 Dic 2024',
    readTime: '8 min',
    image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&h=500&fit=crop',
  },
  {
    id: 3,
    slug: 'errores-comunes-ecommerce',
    title: 'Los 7 Errores mas Comunes en E-commerce (y Como Evitarlos)',
    excerpt: 'Analizamos los problemas que mas afectan las ventas online y te damos soluciones practicas.',
    category: 'E-commerce',
    date: '5 Dic 2024',
    readTime: '6 min',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=500&fit=crop',
  },
  {
    id: 4,
    slug: 'google-business-profile-optimizacion',
    title: 'Como Optimizar tu Google Business Profile para Atraer Mas Clientes',
    excerpt: 'Tu perfil de Google es tu carta de presentacion. Aprende a configurarlo para maximizar visibilidad.',
    category: 'SEO Local',
    date: '28 Nov 2024',
    readTime: '4 min',
    image: 'https://images.unsplash.com/photo-1553484771-371a605b060b?w=800&h=500&fit=crop',
  },
  {
    id: 5,
    slug: 'metricas-marketing-digital',
    title: 'Las Unicas Metricas que Importan en Marketing Digital',
    excerpt: 'Olvidate de los likes y enfocate en lo que realmente impacta tu negocio.',
    category: 'Analytics',
    date: '20 Nov 2024',
    readTime: '7 min',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop',
  },
  {
    id: 6,
    slug: 'diseno-web-que-convierte',
    title: 'Diseno Web que Convierte: Principios de UX para PYMES',
    excerpt: 'No basta con tener un sitio bonito. Descubre como disenar para que los visitantes se conviertan en clientes.',
    category: 'Diseno Web',
    date: '15 Nov 2024',
    readTime: '6 min',
    image: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&h=500&fit=crop',
  },
]

const categorias = ['Todos', 'SEO', 'Marketing', 'E-commerce', 'Diseno Web', 'Analytics', 'SEO Local']

export default function BlogPage() {
  const [categoriaActiva, setCategoriaActiva] = useState('Todos')
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const postsFiltrados = categoriaActiva === 'Todos'
    ? posts
    : posts.filter(post => post.category === categoriaActiva)

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email) {
      setSubscribed(true)
      setEmail('')
      setTimeout(() => setSubscribed(false), 3000)
    }
  }

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
                Blog CreceTec
              </h1>
              <p className="text-lg text-muted-foreground">
                Tips, estrategias y tendencias de marketing digital para hacer crecer tu negocio.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-8 border-b border-border">
          <div className="container-custom">
            <div className="flex flex-wrap justify-center gap-3">
              {categorias.map((categoria) => (
                <button
                  key={categoria}
                  onClick={() => setCategoriaActiva(categoria)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    categoria === categoriaActiva
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
                  }`}
                >
                  {categoria}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Posts Grid */}
        <section className="section-padding">
          <div className="container-custom">
            {postsFiltrados.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No hay articulos en esta categoria todavia.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {postsFiltrados.map((post, index) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group"
                  >
                    <Link href={`/blog/${post.slug}`} className="block">
                      <div className="bg-card rounded-2xl overflow-hidden shadow-card border border-border transition-all duration-300 group-hover:shadow-card-hover group-hover:-translate-y-1">
                        {/* Image */}
                        <div className="relative h-48 overflow-hidden bg-muted">
                          <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute top-4 left-4">
                            <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                              {post.category}
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                          <h2 className="text-lg font-display font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                            {post.title}
                          </h2>
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {post.date}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {post.readTime}
                              </span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Newsletter */}
        <section className="section-padding bg-primary">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-2xl mx-auto text-center"
            >
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-display font-bold text-primary-foreground mb-4">
                Suscribete a nuestro newsletter
              </h2>
              <p className="text-primary-foreground/80 mb-6">
                Recibe tips de marketing digital directamente en tu inbox. Sin spam, solo valor.
              </p>

              {subscribed ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-white/10 rounded-xl text-white"
                >
                  Gracias por suscribirte! Pronto recibiras nuestro contenido.
                </motion.div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                    className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-primary-foreground placeholder-primary-foreground/50 focus:outline-none focus:border-white/40"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-white text-primary font-semibold rounded-xl hover:bg-white/90 transition-colors inline-flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Suscribirme
                  </button>
                </form>
              )}

              <p className="text-xs text-primary-foreground/60 mt-4">
                Al suscribirte, aceptas recibir emails de CreceTec. Puedes darte de baja en cualquier momento.
              </p>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
