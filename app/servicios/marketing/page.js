'use client'

import { Megaphone } from 'lucide-react'
import ServicePageTemplate from '@/components/Crecetec/ServicePageTemplate'

export default function MarketingPage() {
  return (
    <ServicePageTemplate
      icon={Megaphone}
      title="Marketing y Publicidad"
      subtitle="Campañas que generan resultados medibles"
      description="Gestionamos tus campañas de publicidad digital en Google y Meta (Facebook/Instagram) con enfoque en ROI. Analisis de mercado, segmentacion precisa, optimizacion continua y reportes transparentes. Cada peso invertido, maximizado."
      price="$499.990/mes"
      priceNote="+ IVA | Sin permanencia minima"
      features={[
        'Analisis de mercado y competencia',
        'Estrategia de campañas',
        'Gestion de Google Ads',
        'Gestion de Meta Ads (FB/IG)',
        'Creacion de audiencias',
        'Diseño de piezas graficas',
        'Copywriting publicitario',
        'A/B Testing continuo',
        'Optimizacion semanal',
        'Dashboard en tiempo real',
        'Reportes mensuales',
        'Reuniones de seguimiento',
      ]}
      methodology={[
        {
          step: 1,
          title: 'Auditoria',
          description: 'Analizamos tu situacion actual y competencia',
        },
        {
          step: 2,
          title: 'Estrategia',
          description: 'Definimos objetivos, canales y presupuesto',
        },
        {
          step: 3,
          title: 'Ejecucion',
          description: 'Lanzamos y optimizamos campañas',
        },
        {
          step: 4,
          title: 'Reportes',
          description: 'Medimos resultados y ajustamos',
        },
      ]}
      differentiators={[
        {
          title: 'Enfoque en ROAS',
          description: 'No buscamos clics, buscamos ventas y conversiones reales.',
        },
        {
          title: 'Transparencia Total',
          description: 'Acceso 24/7 a todas las cuentas y metricas.',
        },
        {
          title: 'Sin Permanencia',
          description: 'Mes a mes. Nos ganamos tu confianza con resultados.',
        },
      ]}
      faqs={[
        {
          question: 'Cuanto debo invertir en publicidad ademas del fee?',
          answer: 'Recomendamos minimo $500.000/mes por canal (Google o Meta) para resultados significativos.',
        },
        {
          question: 'Cuanto tiempo para ver resultados?',
          answer: 'En campañas de Ads puedes ver resultados desde la primera semana. La optimizacion mejora mes a mes.',
        },
        {
          question: 'Incluyen el diseño de las piezas?',
          answer: 'Si, creamos todas las imagenes y videos para las campañas.',
        },
        {
          question: 'Que metricas reportan?',
          answer: 'ROAS, CPA, CTR, conversiones, alcance y todas las metricas relevantes para tu negocio.',
        },
        {
          question: 'Puedo ver las campañas en tiempo real?',
          answer: 'Si, te damos acceso de lectura a todas las plataformas publicitarias.',
        },
        {
          question: 'Trabajan con presupuestos pequeños?',
          answer: 'Podemos trabajar con presupuestos desde $300.000/mes, pero recomendamos mas para mejores resultados.',
        },
      ]}
    />
  )
}
