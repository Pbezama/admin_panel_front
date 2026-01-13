'use client'

import { ShoppingCart } from 'lucide-react'
import ServicePageTemplate from '@/components/Crecetec/ServicePageTemplate'

export default function TiendasVirtualesPage() {
  return (
    <ServicePageTemplate
      icon={ShoppingCart}
      title="Tiendas Virtuales"
      subtitle="E-commerce completo para vender online 24/7"
      description="Desarrollamos tiendas online profesionales con todo lo necesario para vender: catalogo de productos, carrito de compras, pasarelas de pago chilenas y panel de administracion intuitivo. Tu negocio abierto las 24 horas."
      price="$550.000"
      priceNote="+ IVA | Incluye 1 año de hosting"
      features={[
        'Diseño personalizado e-commerce',
        'Catalogo ilimitado de productos',
        'Carrito de compras',
        'Pasarelas de pago (Webpay, Mercado Pago)',
        'Gestion de inventario',
        'Panel de administracion',
        'Calculadora de envios',
        'Integracion con Chilexpress/Starken',
        'Emails transaccionales',
        'Cupones de descuento',
        'Reportes de ventas',
        'Capacitacion completa',
      ]}
      methodology={[
        {
          step: 1,
          title: 'Planificacion',
          description: 'Definimos estructura, categorias y flujo de compra',
        },
        {
          step: 2,
          title: 'Diseño UX',
          description: 'Creamos una experiencia de compra intuitiva',
        },
        {
          step: 3,
          title: 'Desarrollo',
          description: 'Integramos pagos, envios y funcionalidades',
        },
        {
          step: 4,
          title: 'Testing',
          description: 'Probamos todo el flujo antes de lanzar',
        },
      ]}
      differentiators={[
        {
          title: 'Pagos Chilenos',
          description: 'Integracion nativa con Webpay Plus y Mercado Pago.',
        },
        {
          title: 'Envios Automatizados',
          description: 'Conexion directa con las principales empresas de courier.',
        },
        {
          title: 'Facil de Administrar',
          description: 'Panel intuitivo para gestionar productos, pedidos e inventario.',
        },
      ]}
      faqs={[
        {
          question: 'Cuanto tiempo toma desarrollar la tienda?',
          answer: 'Una tienda virtual estandar toma entre 4 y 6 semanas dependiendo de la cantidad de productos.',
        },
        {
          question: 'Que pasarelas de pago incluyen?',
          answer: 'Integramos Webpay Plus de Transbank y Mercado Pago. Otras opciones tienen costo adicional.',
        },
        {
          question: 'Puedo subir productos yo mismo?',
          answer: 'Si, te capacitamos para administrar tu tienda de forma autonoma.',
        },
        {
          question: 'Incluyen carga inicial de productos?',
          answer: 'Incluimos la carga de hasta 50 productos. Productos adicionales tienen costo extra.',
        },
        {
          question: 'Que comisiones tienen las pasarelas de pago?',
          answer: 'Las comisiones son de cada proveedor: Webpay cobra ~2.95% y Mercado Pago ~3.49% + IVA.',
        },
        {
          question: 'Puedo vender a otros paises?',
          answer: 'Si, podemos configurar envios internacionales y multiples monedas.',
        },
      ]}
    />
  )
}
