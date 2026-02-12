'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useView } from '@/context/ViewContext'
import Sidebar from '@/components/Sidebar'
import SelectorMarca from '@/components/SelectorMarca'
import NotificacionesCampana from '@/components/NotificacionesCampana'
import { Menu } from 'lucide-react'
import '@/styles/Dashboard.css'

const viewTitles = {
  chat: 'Chat',
  tareas: 'Tareas',
  flujos: 'Flujos',
  entrenador: 'Entrenador',
  informes: 'Informes',
  'dashboard-live': 'Chat en Vivo',
  integraciones: 'Integraciones',
  'meta-ads': 'Meta Ads',
}

export default function DashboardLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const { usuario, esSuperAdmin, esColaborador, marcaActiva } = useAuth()
  const { vistaActiva, navegarA } = useView()

  const titulo = viewTitles[vistaActiva] || 'Dashboard'
  const nombreMarca = marcaActiva?.nombre_marca || usuario?.nombre_marca || ''

  return (
    <div className="dashboard-wrapper">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="dashboard-content">
        {/* Compact Header */}
        <header className="dashboard-header">
          <div className="dashboard-header-left">
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={20} />
            </button>
            <h1 className="dashboard-header-title">{titulo}</h1>
            {esSuperAdmin ? (
              <SelectorMarca />
            ) : (
              <span className="dashboard-header-marca">{nombreMarca}</span>
            )}
          </div>
          <div className="dashboard-header-right">
            {esSuperAdmin && (
              <span className="dashboard-header-badge">Super Admin</span>
            )}
            <NotificacionesCampana onNavegar={navegarA} esAdmin={!esColaborador} />
          </div>
        </header>

        {/* View Area */}
        <div className="dashboard-view-area">
          {children}
        </div>
      </div>
    </div>
  )
}
