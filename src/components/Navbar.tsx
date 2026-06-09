import { Link, useLocation } from 'react-router-dom'

export function Navbar() {
  const { pathname } = useLocation()
  const isPanelRoute = pathname.includes('/dashboard') ||
                       pathname.includes('/empleados') ||
                       pathname.includes('/fichajes')

  if (isPanelRoute) return null

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-8
                    bg-white/80 backdrop-blur-md border-b border-green-primary/15">
      <Link to="/" className="font-display text-xl text-gray-900 no-underline">
        Fichajes<span className="text-green-primary">Laborales</span>
      </Link>

      <ul className="hidden md:flex items-center gap-8 list-none m-0 p-0">
        <li><a href="/#features" className="text-sm text-gray-600 no-underline hover:text-gray-900 transition-colors">Funciones</a></li>
        <li><a href="/#pricing"  className="text-sm text-gray-600 no-underline hover:text-gray-900 transition-colors">Precios</a></li>
        <li><a href="/#faq"      className="text-sm text-gray-600 no-underline hover:text-gray-900 transition-colors">FAQ</a></li>
        <li>
          <Link to="/registro"
            className="bg-green-primary text-white text-sm font-medium px-5 py-2
                       rounded-lg hover:bg-green-dark transition-colors no-underline">
            Prueba gratis
          </Link>
        </li>
      </ul>
    </nav>
  )
}