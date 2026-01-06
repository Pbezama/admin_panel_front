import './globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'Admin Panel - Panel de Administración',
  description: 'Panel de administración con asistente IA',
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
