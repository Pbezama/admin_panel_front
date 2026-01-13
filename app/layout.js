import './globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'Crecetec - Tu marca potenciada por IA',
  description: 'La plataforma todo-en-uno que integra WhatsApp, Instagram y automatizaciones con IA para escalar tu negocio sin aumentar tu equipo.',
  keywords: 'automatizacion, whatsapp business, instagram, IA, chatbot, marketing digital, atencion al cliente',
  authors: [{ name: 'Crecetec' }],
  openGraph: {
    title: 'Crecetec - Tu marca potenciada por IA',
    description: 'Automatiza WhatsApp, Instagram y mas con inteligencia artificial.',
    type: 'website',
    locale: 'es_CL',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
