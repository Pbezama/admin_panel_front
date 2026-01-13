'use client'

import { Monitor } from 'lucide-react'
import ServicePageTemplate from '@/components/Crecetec/ServicePageTemplate'

export default function DisenoWebPage() {
  return (
    <ServicePageTemplate
      icon={Monitor}
      title="Diseño de Paginas Web"
      subtitle="Sitios profesionales que convierten visitantes en clientes"
      description="Creamos sitios web modernos, rapidos y optimizados para moviles que reflejan la identidad de tu marca y estan diseñados para generar conversiones. Cada proyecto incluye diseño personalizado, desarrollo responsive y optimizacion SEO basica."
      price="$499.990"
      priceNote="+ IVA | Incluye 1 año de hosting"
      features={[
        'Diseño 100% personalizado',
        'Responsive (movil, tablet, desktop)',
        'Hasta 5 paginas',
        '1 año de hosting incluido',
        'Certificado SSL (HTTPS)',
        'Optimizacion SEO basica',
        'Formulario de contacto',
        'Integracion redes sociales',
        'Google Analytics configurado',
        'Capacitacion de uso',
        'Dominio .cl primer año',
        'Soporte post-lanzamiento',
      ]}
      methodology={[
        {
          step: 1,
          title: 'Briefing',
          description: 'Entendemos tu negocio, objetivos y competencia',
        },
        {
          step: 2,
          title: 'Diseño',
          description: 'Creamos wireframes y diseño visual',
        },
        {
          step: 3,
          title: 'Desarrollo',
          description: 'Programamos tu sitio con las mejores practicas',
        },
        {
          step: 4,
          title: 'Lanzamiento',
          description: 'Publicamos y te capacitamos',
        },
      ]}
      differentiators={[
        {
          title: 'Diseño que Convierte',
          description: 'No solo bonito, diseñado para que los visitantes tomen accion.',
        },
        {
          title: 'Velocidad Garantizada',
          description: 'Sitios optimizados que cargan en menos de 3 segundos.',
        },
        {
          title: 'Soporte Incluido',
          description: '30 dias de soporte post-lanzamiento sin costo adicional.',
        },
      ]}
      faqs={[
        {
          question: 'Cuanto tiempo toma el proyecto?',
          answer: 'Un sitio web estandar toma entre 3 y 4 semanas desde el briefing hasta el lanzamiento.',
        },
        {
          question: 'Puedo modificar el contenido despues?',
          answer: 'Si, te entregamos el sitio con un panel de administracion facil de usar y te capacitamos.',
        },
        {
          question: 'Que pasa despues del primer año de hosting?',
          answer: 'El hosting tiene un costo de $40.000/mes. Te avisamos con anticipacion para renovar.',
        },
        {
          question: 'Incluyen el contenido y las fotos?',
          answer: 'Incluimos la redaccion de textos basicos. Las fotos pueden ser stock o propias tuyas.',
        },
        {
          question: 'El sitio sera visible en Google?',
          answer: 'Si, incluimos optimizacion SEO basica para que Google indexe tu sitio correctamente.',
        },
      ]}
    />
  )
}
