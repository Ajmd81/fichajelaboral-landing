import { useEffect, useState } from 'react'
import { Outlet, NavLink, useNavigate, useParams } from 'react-router-dom'
import { getSession, logout, isAdmin } from '../services/auth'
import { useDemoStatus } from '../hooks/useDemoStatus'

export function PanelLayout() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const session  = getSession()
  const { isDemo, diasRestantes, diasTotales } = useDemoStatus()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!session) { navigate('/' + slug + '/login'); return }
    if (session.empresaSlug !== slug) {
      logout()
      navigate('/' + slug + '/login')
    }
  }, [slug])

  function handleLogout() {
    logout()
    navigate('/' + slug + '/login')
  }

  const pct = diasTotales ? Math.round((diasRestantes! / diasTotales) * 100) : 0

  const navItems = [
    { to: 'dashboard', label: 'Dashboard',  icon: '▦' },
    ...(isAdmin() ? [{ to: 'empleados', label: 'Empleados', icon: '👥' }] : []),
    { to: 'fichajes', label: 'Fichajes',   icon: '🕐' },
    ...(isAdmin() ? [
      { to: 'computo-equipo',    label: 'Resumen equipo',  icon: '📊' },
      { to: 'computo-empleado',  label: 'Detalle empleado', icon: '👤' },
      { to: 'vacaciones',        label: 'Vacaciones',       icon: '🏖️' },
    ] : []),
  ]

  return (
    <div className="min-h-screen flex bg-gray-50">

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-56 bg-white border-r border-gray-200
                         flex flex-col transition-transform duration-200
                         ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>

        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-gray-100">
          <span className="font-display text-lg text-gray-900">
            Fichajes<span className="text-green-primary">Laborales</span>
          </span>
        </div>

        {/* Empresa */}
        <div className="px-5 py-3 border-b border-gray-100">
          <p className="text-xs text-gray-400 mb-0.5">Empresa</p>
          <p className="text-sm font-medium text-gray-900 truncate">{session?.empresaNombre}</p>
        </div>

        {/* Demo banner */}
        {isDemo && (
          <div className="mx-3 mt-3 bg-green-light rounded-xl px-3 py-2.5">
            <p className="text-xs font-medium text-green-dark mb-1">
              Modo Demo · {diasRestantes}d restantes
            </p>
            <div className="w-full bg-green-primary/20 rounded-full h-1.5">
              <div className="bg-green-primary h-1.5 rounded-full transition-all"
                style={{ width: pct + '%' }} />
            </div>
            <button
              onClick={() => navigate('/contacto')}
              className="mt-2 w-full text-[10px] font-medium text-white bg-green-primary
                         rounded-lg py-1.5 border-none cursor-pointer hover:bg-green-dark transition-colors">
              Activar licencia →
            </button>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={`/${slug}/${to}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors no-underline
                 ${isActive
                   ? 'bg-green-light text-green-primary font-medium'
                   : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
              }
            >
              <span>{icon}</span> {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer sidebar */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-green-light flex items-center justify-center
                            text-green-primary text-xs font-display">
              {session?.username?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">{session?.username}</p>
              <p className="text-[10px] text-gray-400">{session?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-500
                       hover:text-red-primary hover:bg-red-50 rounded-xl transition-colors
                       bg-transparent border-none cursor-pointer">
            ↩ Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Overlay móvil */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/20 lg:hidden"
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-56 flex flex-col min-h-screen">

        {/* Top bar móvil */}
        <header className="h-14 lg:hidden flex items-center px-4 bg-white border-b border-gray-200">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-gray-600 bg-transparent border-none cursor-pointer text-lg">
            ☰
          </button>
          <span className="font-display text-base text-gray-900 ml-3">
            Fichajes<span className="text-green-primary">Laborales</span>
          </span>
        </header>

        {/* Contenido */}
        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}