import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { login } from '../services/auth'

export function LoginPage() {
  const navigate = useNavigate()
  const { slug: slugParam } = useParams()
  const [form, setForm] = useState({ slug: slugParam ?? '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  useEffect(() => {
    // Prellenar slug si viene por URL ?slug=xxx
    const params = new URLSearchParams(window.location.search)
    const s = params.get('slug')
    if (s) setForm(p => ({ ...p, slug: s }))
  }, [])

  function update(field: string, value: string) {
    setForm(p => ({ ...p, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.slug, form.email, form.password)
      navigate('/' + form.slug + '/dashboard')
    } catch (err: any) {
      const msg: string = err?.response?.data?.message ?? ''
      if (err?.response?.status === 403 && msg.includes('DEMO_EXPIRADA')) {
        setError('El periodo de demo de 15 días ha finalizado. Contacta con el administrador para activar tu licencia.')
      } else if (err?.response?.status === 401) {
        setError('Email o contraseña incorrectos.')
      } else if (err?.response?.status === 404) {
        setError('Empresa no encontrada. Comprueba el identificador.')
      } else {
        setError('Error de conexión. Inténtalo de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-green-hero relative flex flex-col"
      style={{ backgroundImage: 'radial-gradient(circle, rgba(0,146,60,0.08) 1px, transparent 1px)', backgroundSize: '28px 28px' }}>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-4xl w-full">

          {/* INFO */}
          <div>
            <h1 className="font-display text-4xl text-gray-900 leading-tight mb-4">
              Bienvenido de nuevo a{' '}
              <span className="text-green-primary">tu panel</span>
            </h1>
            <p className="text-gray-600 font-light leading-relaxed mb-10">
              Controla los fichajes de tu equipo en tiempo real desde cualquier dispositivo.
            </p>
            <div className="flex gap-8 flex-wrap">
              {[
                { val: '+500.', label: 'Empresas activas' },
                { val: '15d',   label: 'Prueba gratuita' },
                { val: '24/7',  label: 'Disponibilidad' },
              ].map(({ val, label }) => (
                <div key={label}>
                  <p className="font-display text-3xl text-gray-900 leading-none mb-1">
                    {val.replace(/[.d/7]/g, m => `<span class="text-green-primary">${m}</span>`).includes('<')
                      ? <span dangerouslySetInnerHTML={{ __html:
                          val.replace('.','<span class="text-green-primary">.</span>')
                             .replace('d','<span class="text-green-primary">d</span>')
                             .replace('/7','<span class="text-green-primary">/7</span>')
                        }} />
                      : val
                    }
                  </p>
                  <p className="text-xs text-gray-400 font-light">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* FORMULARIO */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full">
            <span className="inline-block bg-green-light text-green-primary text-xs font-medium
                             px-3 py-1 rounded-full mb-3">Acceso seguro</span>
            <h2 className="font-display text-2xl text-gray-900 mb-1">Iniciar sesión</h2>
            <p className="text-sm text-gray-400 font-light mb-7">
              Introduce las credenciales de tu empresa.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-primary text-xs
                              rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
                <span>⚠</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Slug */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Empresa</label>
                <div className="flex border-[1.5px] border-gray-200 rounded-xl overflow-hidden
                                focus-within:border-green-primary focus-within:shadow-[0_0_0_3px_rgba(0,146,60,0.12)]
                                transition-all duration-200">
                  <span className="px-3 py-3 text-xs text-gray-400 bg-gray-100 border-r border-gray-200
                                   flex items-center whitespace-nowrap">
                    fichajelaboral.com/
                  </span>
                  <input
                    type="text"
                    className="flex-1 px-3 py-3 text-sm text-gray-900 bg-gray-50 outline-none
                               placeholder:text-gray-400"
                    placeholder="mi-empresa"
                    value={form.slug}
                    onChange={e => update('slug', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Email</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="admin@tuempresa.com"
                  value={form.email}
                  onChange={e => update('email', e.target.value)}
                  required
                />
              </div>

              {/* Password */}
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
                    onChange={e => update('password', e.target.value)}
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
                {loading ? 'Accediendo…' : 'Entrar a mi panel →'}
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