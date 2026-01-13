'use client'

import { MessageSquare } from 'lucide-react'
import ServicePageTemplate from '@/components/Crecetec/ServicePageTemplate'

export default function ChatVendedorPage() {
  return (
    <ServicePageTemplate
      icon={MessageSquare}
      title="Chat Vendedor"
      description="Chatbot inteligente que atiende y convierte visitantes 24/7"
      price="$49.990 + IVA/mes"
      priceType="mensual - Primer mes GRATIS"
      features={[
        'Chatbot con inteligencia artificial',
        '400 conversaciones incluidas/mes',
        'Primer mes completamente gratis',
        'Integracion facil en tu sitio',
        'Respuestas personalizadas',
        'Captura de leads automatica',
        'Panel de conversaciones',
        'Notificaciones en tiempo real',
        'Escalamiento a humano cuando es necesario',
      ]}
      benefits={[
        {
          title: 'Atencion 24/7',
          description: 'No pierdas leads fuera de horario de oficina.',
        },
        {
          title: 'Aumento de conversiones',
          description: 'Respuestas inmediatas aumentan la tasa de conversion.',
        },
        {
          title: 'Sin riesgo',
          description: 'Prueba gratis el primer mes completo.',
        },
        {
          title: 'Facil implementacion',
          description: 'Solo copias un codigo en tu sitio web.',
        },
      ]}
      process={[
        { title: 'Configuracion', description: 'Personalizamos el bot' },
        { title: 'Integracion', description: 'Lo instalamos en tu sitio' },
        { title: 'Entrenamiento', description: 'Ajustamos respuestas' },
        { title: 'Optimizacion', description: 'Mejoramos continuamente' },
      ]}
    />
  )
}
