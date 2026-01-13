'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, TrendingUp, BarChart3, Users, Target, Zap, Bell, ChevronUp, Globe, Mail, MousePointerClick } from 'lucide-react'

const HeroSection = () => {
  // Data for the area chart
  const chartData = [20, 35, 25, 45, 35, 55, 45, 65, 55, 75, 85, 95]
  const chartData2 = [15, 25, 20, 35, 30, 40, 35, 50, 45, 60, 70, 80]

  // Generate SVG path for smooth curve
  const generatePath = (data, height = 120, width = 400) => {
    const maxVal = Math.max(...data)
    const points = data.map((val, i) => ({
      x: (i / (data.length - 1)) * width,
      y: height - (val / maxVal) * height * 0.85
    }))

    let path = `M ${points[0].x} ${points[0].y}`
    for (let i = 1; i < points.length; i++) {
      const xc = (points[i].x + points[i - 1].x) / 2
      const yc = (points[i].y + points[i - 1].y) / 2
      path += ` Q ${points[i - 1].x} ${points[i - 1].y}, ${xc} ${yc}`
    }
    path += ` L ${points[points.length - 1].x} ${points[points.length - 1].y}`
    return path
  }

  const generateAreaPath = (data, height = 120, width = 400) => {
    const linePath = generatePath(data, height, width)
    return `${linePath} L ${width} ${height} L 0 ${height} Z`
  }

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />

      {/* Decorative Elements */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />

      <div className="container-custom relative z-10 pt-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6"
            >
              <TrendingUp className="w-4 h-4" />
              Agencia de Marketing Digital
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight mb-6">
              Marketing de{' '}
              <span className="text-accent">resultados</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl">
              Estrategias diseñadas para que tu negocio no pare de crecer.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/#servicios" className="btn-outline inline-flex items-center justify-center gap-2">
                Ver Servicios
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/contacto" className="btn-accent inline-flex items-center justify-center gap-2">
                Cotizar Ahora
              </Link>
            </div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-12 flex items-center gap-8"
            >
              <div className="text-center">
                <div className="text-2xl font-display font-bold text-foreground">+30</div>
                <div className="text-sm text-muted-foreground">Clientes activos</div>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <div className="text-2xl font-display font-bold text-foreground">5x-8x</div>
                <div className="text-sm text-muted-foreground">Mejora ROAS</div>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <div className="text-2xl font-display font-bold text-foreground">+5</div>
                <div className="text-sm text-muted-foreground">Años experiencia</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Professional Dashboard */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="hidden lg:block"
          >
            <div className="relative">
              {/* Main Dashboard Card */}
              <div className="bg-card rounded-3xl shadow-2xl p-6 border border-border/50 backdrop-blur-sm">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-base">Dashboard de Rendimiento</h3>
                      <p className="text-xs text-muted-foreground">Actualizado hace 5 min</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="w-2 h-2 bg-green-500 rounded-full"
                    />
                    <span className="text-xs text-green-600 font-medium">En vivo</span>
                  </div>
                </div>

                {/* KPI Cards Row */}
                <div className="grid grid-cols-4 gap-3 mb-5">
                  {[
                    { icon: Users, label: 'Visitas', value: '24.5K', change: '+18%', color: 'text-blue-600', bg: 'bg-blue-50' },
                    { icon: Target, label: 'Leads', value: '1,847', change: '+32%', color: 'text-purple-600', bg: 'bg-purple-50' },
                    { icon: MousePointerClick, label: 'CTR', value: '4.8%', change: '+12%', color: 'text-green-600', bg: 'bg-green-50' },
                    { icon: Zap, label: 'ROAS', value: '5.2x', change: '+28%', color: 'text-orange-600', bg: 'bg-orange-50' },
                  ].map((kpi, i) => (
                    <motion.div
                      key={kpi.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className="bg-muted/50 rounded-xl p-3 border border-border/30"
                    >
                      <div className={`w-7 h-7 ${kpi.bg} rounded-lg flex items-center justify-center mb-2`}>
                        <kpi.icon className={`w-3.5 h-3.5 ${kpi.color}`} />
                      </div>
                      <div className="text-lg font-display font-bold text-foreground">{kpi.value}</div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">{kpi.label}</span>
                        <span className="text-[10px] text-green-600 font-medium flex items-center gap-0.5">
                          <ChevronUp className="w-2.5 h-2.5" />
                          {kpi.change}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Chart Area */}
                <div className="bg-gradient-to-b from-muted/30 to-muted/10 rounded-2xl p-4 mb-5 border border-border/20">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-foreground">Rendimiento mensual</span>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                        Conversiones
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-accent/60"></span>
                        Leads
                      </span>
                    </div>
                  </div>

                  {/* SVG Chart */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    className="relative h-32"
                  >
                    <svg viewBox="0 0 400 120" className="w-full h-full" preserveAspectRatio="none">
                      {/* Grid lines */}
                      {[0, 30, 60, 90, 120].map((y) => (
                        <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="currentColor" strokeOpacity="0.05" strokeWidth="1" />
                      ))}

                      {/* Area gradient for primary */}
                      <defs>
                        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="hsl(222 35% 28%)" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="hsl(222 35% 28%)" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="areaGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="hsl(4 65% 48%)" stopOpacity="0.2" />
                          <stop offset="100%" stopColor="hsl(4 65% 48%)" stopOpacity="0" />
                        </linearGradient>
                      </defs>

                      {/* Area fills */}
                      <motion.path
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 0.8 }}
                        d={generateAreaPath(chartData)}
                        fill="url(#areaGradient)"
                      />
                      <motion.path
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2, duration: 0.8 }}
                        d={generateAreaPath(chartData2)}
                        fill="url(#areaGradient2)"
                      />

                      {/* Lines */}
                      <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 0.9, duration: 1.2 }}
                        d={generatePath(chartData)}
                        fill="none"
                        stroke="hsl(222 35% 28%)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 1.1, duration: 1.2 }}
                        d={generatePath(chartData2)}
                        fill="none"
                        stroke="hsl(4 65% 48%)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeOpacity="0.7"
                      />

                      {/* Data points */}
                      {chartData.map((val, i) => {
                        const x = (i / (chartData.length - 1)) * 400
                        const y = 120 - (val / Math.max(...chartData)) * 120 * 0.85
                        return (
                          <motion.circle
                            key={i}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 1.3 + i * 0.05 }}
                            cx={x}
                            cy={y}
                            r="4"
                            fill="white"
                            stroke="hsl(222 35% 28%)"
                            strokeWidth="2"
                          />
                        )
                      })}
                    </svg>

                    {/* X-axis labels */}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[9px] text-muted-foreground pt-1">
                      {['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'].map((m) => (
                        <span key={m}>{m}</span>
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* Channel Performance */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { name: 'Meta Ads', icon: '📘', value: '$12,450', roi: '4.2x', progress: 85 },
                    { name: 'Google Ads', icon: '🔍', value: '$8,320', roi: '3.8x', progress: 70 },
                    { name: 'Email', icon: '📧', value: '$3,180', roi: '6.1x', progress: 55 },
                  ].map((channel, i) => (
                    <motion.div
                      key={channel.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.4 + i * 0.1 }}
                      className="bg-muted/40 rounded-xl p-3 border border-border/20"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm">{channel.icon}</span>
                        <span className="text-xs font-medium text-foreground">{channel.name}</span>
                      </div>
                      <div className="text-sm font-display font-bold text-foreground mb-1">{channel.value}</div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground">ROI: {channel.roi}</span>
                      </div>
                      <div className="mt-2 h-1 bg-border/50 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${channel.progress}%` }}
                          transition={{ delay: 1.6 + i * 0.1, duration: 0.6 }}
                          className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Floating Notification Card */}
              <motion.div
                initial={{ opacity: 0, x: 30, y: -10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 1.8 }}
                className="absolute -right-6 top-8 bg-card p-4 rounded-2xl shadow-xl border border-border/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">+52%</div>
                    <div className="text-xs text-muted-foreground">Conversiones hoy</div>
                  </div>
                </div>
              </motion.div>

              {/* Floating Alert Card */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 2 }}
                className="absolute -left-6 bottom-24 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-4 rounded-2xl shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">15 nuevos leads</div>
                    <div className="text-xs opacity-80">En las ultimas 2 horas</div>
                  </div>
                </div>
              </motion.div>

              {/* Mini Stats Pill */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.2 }}
                className="absolute -right-2 bottom-16 bg-card px-4 py-2 rounded-full shadow-lg border border-border/50 flex items-center gap-2"
              >
                <Globe className="w-4 h-4 text-accent" />
                <span className="text-xs font-medium">847 visitas/hora</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
