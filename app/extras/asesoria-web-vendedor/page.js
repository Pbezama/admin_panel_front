'use client'

import { FileSearch } from 'lucide-react'
import ServicePageTemplate from '@/components/Crecetec/ServicePageTemplate'

export default function AsesoriaWebVendedorPage() {
  return (
    <ServicePageTemplate
      icon={FileSearch}
      title="Asesoria Web Vendedor"
      description="Auditoria completa de tu sitio web para convertir mas visitantes en clientes"
      price="$100.000 + IVA"
      priceType="pago unico"
      features={[
        'Auditoria completa en 7 fases',
        'Analisis de UX/UI',
        'Mapa de journey del cliente',
        'Identificacion de fricciones',
        'Plan de mejoras P0/P1/P2',
        'Guia de contenido',
        'Recomendaciones de tracking',
        'Documento entregable completo',
        'Reunion de presentacion de resultados',
      ]}
      benefits={[
        {
          title: 'Vision objetiva',
          description: 'Ojos frescos que identifican lo que tu no ves.',
        },
        {
          title: 'Prioridades claras',
          description: 'Sabes exactamente que mejorar primero.',
        },
        {
          title: 'Ahorro de tiempo',
          description: 'No pierdas tiempo en cambios que no impactan.',
        },
        {
          title: 'Implementacion opcional',
          description: 'Puedes implementar tu o contratarnos.',
        },
      ]}
      process={[
        { title: 'Kick-off', description: 'Conocemos tu negocio' },
        { title: 'Analisis', description: 'Auditamos tu sitio' },
        { title: 'Diagnostico', description: 'Identificamos problemas' },
        { title: 'Entrega', description: 'Presentamos el plan' },
      ]}
    />
  )
}
