'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Instagram, Linkedin, Send } from 'lucide-react'
import { useState } from 'react'

const Footer = () => {
  const [email, setEmail] = useState('')

  const handleNewsletterSubmit = (e) => {
    e.preventDefault()
    // Handle newsletter subscription
    console.log('Newsletter subscription:', email)
    setEmail('')
  }

  return (
    <footer className="bg-crecetec-dark text-white">
      <div className="container-custom section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Logo & Description */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/logo-crecetec.png"
                alt="CreceTec - Agencia de Marketing"
                width={128}
                height={128}
                className="h-32 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Marketing de resultados. Ayudamos a PYMES a alcanzar su maximo potencial digital.
            </p>
          </div>

          {/* Servicios */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Servicios</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/servicios/diseno-web" className="text-gray-400 hover:text-primary transition-colors">
                  Diseño Web
                </Link>
              </li>
              <li>
                <Link href="/servicios/tiendas-virtuales" className="text-gray-400 hover:text-primary transition-colors">
                  Tiendas Virtuales
                </Link>
              </li>
              <li>
                <Link href="/servicios/marketing" className="text-gray-400 hover:text-primary transition-colors">
                  Marketing
                </Link>
              </li>
              <li>
                <Link href="/servicios/seo" className="text-gray-400 hover:text-primary transition-colors">
                  SEO
                </Link>
              </li>
            </ul>
          </div>

          {/* Extras */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Extras</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/extras/asesoria-web-vendedor" className="text-gray-400 hover:text-primary transition-colors">
                  Asesoria Web Vendedor
                </Link>
              </li>
              <li>
                <Link href="/extras/chat-vendedor" className="text-gray-400 hover:text-primary transition-colors">
                  Chat Vendedor
                </Link>
              </li>
            </ul>
          </div>

          {/* Recursos */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Recursos</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-primary transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/precios" className="text-gray-400 hover:text-primary transition-colors">
                  Precios
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="text-gray-400 hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Contacto</h4>
            <ul className="space-y-3 text-gray-400">
              <li>
                <a href="https://wa.me/56912345678" className="hover:text-primary transition-colors">
                  +56 9 1234 5678
                </a>
              </li>
              <li>
                <a href="mailto:contacto@crecetec.com" className="hover:text-primary transition-colors">
                  contacto@crecetec.com
                </a>
              </li>
              <li>Chile</li>
            </ul>
          </div>
        </div>

        {/* Newsletter & Social */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Newsletter */}
            <div className="w-full lg:w-auto">
              <p className="text-sm text-gray-400 mb-3 text-center lg:text-left">
                Suscribete para tips de marketing
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Tu email"
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary flex-1 lg:w-64"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:bg-primary hover:text-white transition-all"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:bg-primary hover:text-white transition-all"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:bg-primary hover:text-white transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          © 2024 CreceTec. Marketing de resultados.
        </div>
      </div>
    </footer>
  )
}

export default Footer
