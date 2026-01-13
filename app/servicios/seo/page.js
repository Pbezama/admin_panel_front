'use client'

import { TrendingUp } from 'lucide-react'
import ServicePageTemplate from '@/components/Crecetec/ServicePageTemplate'

export default function SEOPage() {
  return (
    <ServicePageTemplate
      icon={TrendingUp}
      title="Posicionamiento SEO"
      subtitle="Aparece en Google cuando tus clientes te buscan"
      description="Implementamos estrategias de SEO local y organico para que tu negocio aparezca en las primeras posiciones de Google. Auditoria tecnica, optimizacion on-page, link building y contenido optimizado para trafico que convierte."
      price="$199.990/mes"
      priceNote="+ IVA | Sin permanencia minima"
      features={[
        'Auditoria SEO tecnica',
        'Investigacion de keywords',
        'Optimizacion on-page',
        'Optimizacion tecnica',
        'Link building',
        'SEO Local (Google Business)',
        'Contenido optimizado',
        'Analisis de competencia',
        'Seguimiento de rankings',
        'Reportes mensuales',
        'Correccion de errores tecnicos',
        'Estrategia de contenidos',
      ]}
      methodology={[
        {
          step: 1,
          title: 'Auditoria',
          description: 'Analizamos tu sitio y detectamos oportunidades',
        },
        {
          step: 2,
          title: 'Keywords',
          description: 'Identificamos las palabras clave con potencial',
        },
        {
          step: 3,
          title: 'Optimizacion',
          description: 'Mejoramos tu sitio tecnica y contenido',
        },
        {
          step: 4,
          title: 'Autoridad',
          description: 'Construimos enlaces y reputacion',
        },
      ]}
      differentiators={[
        {
          title: 'SEO Local',
          description: 'Especialistas en posicionar negocios en busquedas locales de tu zona.',
        },
        {
          title: 'White Hat',
          description: 'Solo tecnicas eticas. Sin riesgo de penalizaciones de Google.',
        },
        {
          title: 'Resultados Medibles',
          description: 'Seguimiento de rankings y trafico organico mes a mes.',
        },
      ]}
      faqs={[
        {
          question: 'Cuanto tiempo toma ver resultados en SEO?',
          answer: 'SEO es una estrategia de mediano plazo. Los primeros resultados se ven entre 3 y 6 meses.',
        },
        {
          question: 'Garantizan primer lugar en Google?',
          answer: 'Nadie puede garantizar posiciones. Trabajamos para mejorar tu visibilidad de forma sostenible.',
        },
        {
          question: 'Que diferencia hay con Google Ads?',
          answer: 'SEO genera trafico organico (gratis) a largo plazo. Ads es trafico pagado inmediato.',
        },
        {
          question: 'Necesito tener un blog?',
          answer: 'Es recomendable. El contenido fresco ayuda al posicionamiento. Podemos crearlo por ti.',
        },
        {
          question: 'Incluyen la redaccion de contenidos?',
          answer: 'Incluimos 2 articulos optimizados al mes. Contenido adicional tiene costo extra.',
        },
        {
          question: 'Trabajan con cualquier tipo de sitio?',
          answer: 'Si, aunque obtenemos mejores resultados con WordPress y sitios que podemos optimizar tecnicamente.',
        },
      ]}
    />
  )
}
