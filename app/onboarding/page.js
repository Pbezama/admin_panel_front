'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import OnboardingFlow from '@/components/Onboarding/OnboardingFlow'
import '@/styles/Onboarding.css'

export default function OnboardingPage() {
  const router = useRouter()
  const { usuario, loading, onboardingCompletado } = useAuth()

  useEffect(() => {
    // Si no hay usuario, redirigir a login
    if (!loading && !usuario) {
      router.push('/login')
      return
    }

    // Si ya completó onboarding, redirigir a chat
    if (!loading && usuario && onboardingCompletado) {
      router.push('/chat')
    }
  }, [usuario, loading, onboardingCompletado, router])

  // Mostrar loading mientras verifica
  if (loading) {
    return (
      <div className="onboarding-loading">
        <div className="spinner"></div>
        <span>Cargando...</span>
      </div>
    )
  }

  // Si no hay usuario, no mostrar nada (se redirigirá)
  if (!usuario) {
    return null
  }

  // Si ya completó onboarding, no mostrar nada (se redirigirá)
  if (onboardingCompletado) {
    return null
  }

  return <OnboardingFlow />
}
