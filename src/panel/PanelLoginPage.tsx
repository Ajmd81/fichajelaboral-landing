import { useState } from 'react'
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom'
import { login } from '../services/auth'

export function PanelLoginPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const fromRegistro = (location.state as any)?.fromRegistro
  const diasDemo     = (location.state as any)?.diasDemo
  const expira       = (location.state as any)?.expira

  const [form, setForm]       = useState({ email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(slug!, form.email, form.password)
      navigate('/' + slug + '/dashboard')
    } catch (err: any) {
      const msg: string = err?.response?.data?.message ?? ''
      if (err?.response?.status === 403 && msg.includes('DEMO_EXPIRADA')) {
        setError('El periodo de demo ha finalizado. Activa tu licencia para continuar.')
      } else if (err?.response?.status === 401) {
        setError('Email o contraseña incorrectos.')
      } else {
        setError('Error de conexión. Inténtalo de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-green-hero flex flex-col relative"
      style={{ backgroundImage: 'radial-gradient(circle, rgba(0,146,60,0.08) 1px, transparent 1px)', backgroundSize: '28px 28px' }}>

      {/* Nav mínimo */}
      <nav className="h-16 flex items-center justify-between px-8
                      bg-white/80 backdrop-blur-md border-b border-green-primary/15">
        <Link to="/" className="font-display text-xl text-gray-900 no-underline">
          Fichajes<span className="text-green-primary">Laborales</span>
        </Link>
        <Link to="/registro" className="text-sm text-gray-400 no-underline hover:text-green-primary transition-colors">
          ¿Sin cuenta? <strong className="text-green-primary font-medium">Prueba gratis →</strong>
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* Banner bienvenida tras registro */}
          {fromRegistro && (
            <div className="bg-green-light border border-green-primary/20 rounded-2xl px-5 py-4 mb-6 flex items-start gap-3">
              <span className="text-xl">🎉</span>
              <div>
                <p className="text-sm font-medium text-green-dark mb-0.5">¡Empresa creada correctamente!</p>
                <p className="text-xs text-gray-600 font-light">
                  Tienes <strong>{diasDemo} días de prueba</strong> gratuita hasta el {expira}. Inicia sesión para empezar.
                </p>
              </div>
            </div>
          )}

          {/* Tarjeta */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-7">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl
                              bg-green-light mb-4">
                <span className="text-2xl">⏱️</span>
              </div>
              <h1 className="font-display text-2xl text-gray-900 mb-1">Accede a tu panel</h1>
              <p className="text-sm text-gray-400 font-light">
                Empresa: <strong className="text-gray-700">{slug}</strong>
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-primary text-xs
                              rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
                <span>⚠</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Email</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="admin@tuempresa.com"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  autoFocus
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-medium text-gray-600">Contraseña</label>
                  <Link to="/recuperar" className="text-xs text-green-primary no-underline hover:underline">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="input-field pr-10"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400
                               hover:text-green-primary transition-colors bg-transparent border-none cursor-pointer"
                  >
                    {showPass ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-primary text-white py-3 rounded-xl font-medium text-sm
                           hover:bg-green-dark transition-colors shadow-[0_4px_16px_rgba(0,146,60,0.28)]
                           disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {loading ? 'Accediendo…' : 'Entrar →'}
              </button>
            </form>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs text-gray-400">¿Aún no tienes cuenta?</span>
              </div>
            </div>

            <Link to="/registro"
              className="block text-center text-sm text-green-primary font-medium no-underline hover:underline">
              Crear cuenta gratis — 15 días sin compromiso
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}