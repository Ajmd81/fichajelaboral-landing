import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="bg-[#F7F9FC] border-t border-gray-200 pt-12 pb-8 px-8">
      <div className="max-w-5xl mx-auto flex flex-wrap justify-between items-center gap-4">

        <span className="font-display text-base text-gray-900">
          Fichajes<span className="text-green-primary">Laborales</span>
        </span>

        <ul className="flex flex-wrap gap-6 list-none m-0 p-0">
          <li><Link to="/privacidad"  className="text-xs text-gray-400 no-underline hover:text-green-primary transition-colors">Política de privacidad</Link></li>
          <li><Link to="/terminos"    className="text-xs text-gray-400 no-underline hover:text-green-primary transition-colors">Términos de uso</Link></li>
          <li><Link to="/aviso-legal" className="text-xs text-gray-400 no-underline hover:text-green-primary transition-colors">Aviso legal</Link></li>
          <li><Link to="/contacto"    className="text-xs text-gray-400 no-underline hover:text-green-primary transition-colors">Contacto</Link></li>
        </ul>

      </div>
      <p className="text-center text-xs text-gray-400 mt-8 pt-6 border-t border-gray-200">
        © 2025 FichajesLaborales · Hecho en España 🇪🇸
      </p>
    </footer>
  )
}