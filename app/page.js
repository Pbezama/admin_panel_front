'use client'

import Header from '@/components/Crecetec/Header'
import Footer from '@/components/Crecetec/Footer'
import WhatsAppButton from '@/components/Crecetec/WhatsAppButton'
import HeroSection from '@/components/Crecetec/sections/HeroSection'
import ServicesSection from '@/components/Crecetec/sections/ServicesSection'
import ExtrasSection from '@/components/Crecetec/sections/ExtrasSection'
import DifferentiatorsSection from '@/components/Crecetec/sections/DifferentiatorsSection'
import ResultsSection from '@/components/Crecetec/sections/ResultsSection'
import MethodologySection from '@/components/Crecetec/sections/MethodologySection'
import VerticalsSection from '@/components/Crecetec/sections/VerticalsSection'
import TestimonialsSection from '@/components/Crecetec/sections/TestimonialsSection'
import FAQSection from '@/components/Crecetec/sections/FAQSection'
import CTASection from '@/components/Crecetec/sections/CTASection'

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <ServicesSection />
        <ExtrasSection />
        <DifferentiatorsSection />
        <ResultsSection />
        <MethodologySection />
        <VerticalsSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
