'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useView } from '@/context/ViewContext'
import {
  MessageSquare,
  CheckSquare,
  GitBranch,
  Brain,
  BarChart3,
  Headphones,
  Link,
  Megaphone,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu
} from 'lucide-react'

const navGroups = [
  {
    label: 'Principal',
    items: [
      { id: 'chat', label: 'Chat', icon: MessageSquare, desc: 'Controlador + ChatIA' },
    ]
  },
  {
    label: 'Herramientas',
    items: [
      { id: 'tareas', label: 'Tareas', icon: CheckSquare, desc: 'Gestion de tareas' },
      { id: 'flujos', label: 'Flujos', icon: GitBranch, desc: 'Flujos conversacionales' },
      { id: 'entrenador', label: 'Entrenador', icon: Brain, desc: 'Entrenar IA' },
      { id: 'informes', label: 'Informes', icon: BarChart3, desc: 'Informes Instagram' },
    ]
  },
  {
    label: 'Canales',
    items: [
      { id: 'dashboard-live', label: 'Chat en Vivo', icon: Headphones, desc: 'Conversaciones transferidas' },
      { id: 'integraciones', label: 'Integraciones', icon: Link, desc: 'Facebook / Instagram' },
      { id: 'meta-ads', label: 'Meta Ads', icon: Megaphone, desc: 'Campanas' },
    ]
  }
]

export default function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile }) {
  const { usuario, logout, esSuperAdmin, marcaActiva } = useAuth()
  const { vistaActiva, navegarA } = useView()

  const handleNavClick = (vistaId) => {
    navegarA(vistaId)
    if (onCloseMobile) onCloseMobile()
  }

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  const getInitials = (nombre) => {
    if (!nombre) return '?'
    return nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  const nombreMarca = marcaActiva?.nombre_marca || usuario?.nombre_marca || ''

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${mobileOpen ? 'visible' : ''}`}
        onClick={onCloseMobile}
      />

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo-area">
          <div className="sidebar-logo">
            <img src="/logo-crecetec.png" alt="CreceTec" />
            <div className="sidebar-logo-text">
              <h2>CreceTec</h2>
              <span>Panel de Administracion</span>
            </div>
          </div>
          <button
            className="sidebar-toggle"
            onClick={onToggleCollapse}
            title={collapsed ? 'Expandir' : 'Colapsar'}
          >
            {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navGroups.map((group) => (
            <div key={group.label} className="sidebar-group">
              <div className="sidebar-group-label">{group.label}</div>
              {group.items.map((item) => {
                const Icon = item.icon
                const isActive = vistaActiva === item.id
                return (
                  <button
                    key={item.id}
                    className={`sidebar-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleNavClick(item.id)}
                    title={collapsed ? item.label : undefined}
                  >
                    <span className="sidebar-item-icon">
                      <Icon size={18} />
                    </span>
                    <span className="sidebar-item-label">{item.label}</span>
                    <span className="sidebar-item-tooltip">{item.label}</span>
                  </button>
                )
              })}
            </div>
          ))}
        </nav>

        {/* User Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user-avatar">
            {getInitials(usuario?.nombre)}
          </div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{usuario?.nombre}</span>
            <span className="sidebar-user-marca">{nombreMarca}</span>
          </div>
          <button
            className="sidebar-logout-btn"
            onClick={handleLogout}
            title="Cerrar sesion"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  )
}

export { navGroups }
