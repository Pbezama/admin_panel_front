'use client'

import { AuthProvider } from '@/context/AuthContext'
import { ViewProvider } from '@/context/ViewContext'

export function Providers({ children }) {
  return (
    <AuthProvider>
      <ViewProvider>
        {children}
      </ViewProvider>
    </AuthProvider>
  )
}
