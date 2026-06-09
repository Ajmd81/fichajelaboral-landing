import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../services/api'

export function RegistroPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ nombreEmpresa: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field: string, value: string) {
    setForm(p => ({ ...p, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (form.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    setLoading(true)
    try {
      const { data } = await api.post('/public/register', form)
      navigate('/' + data.slug + '/login', {
        state: { fromRegistro: true, diasDemo: data.diasDemo, expira: data.expira }
      })
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Error al crear la cuenta. Inténtalo de nuevo.')
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
            <div className="inline-flex items-center gap-2 bg-green-primary/10 border border-green-primary/20
                            text-green-dark text-xs font-medium px-4 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-green-primary" />
              15 días gratis · Sin tarjeta
            </div>
            <h1 className="font-display text-4xl text-gray-900 leading-tight mb-4">
              Empieza a controlar<br />tu horario hoy
            </h1>
            <p className="text-gray-600 font-light leading-relaxed mb-8">
              Crea tu empresa, añade a tu equipo y ficha desde el móvil en menos de 10 minutos.
            </p>
            <div className="flex flex-col gap-3">
              {[
                'Empleados y fichajes ilimitados durante la prueba',
                'App nativa para iOS y Android incluida',
                'Panel web con informes exportables',
                'Sin permanencia ni contrato. Cancela cuando quieras.',
              ].map(perk => (
                <div key={perk} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-light flex items-center justify-center
                                  text-green-primary text-xs font-bold flex-shrink-0 mt-0.5">✓</div>
                  <span className="text-sm text-gray-600">{perk}</span>
                </div>
              ))}
            </div>
          </div>

          {/* FORMULARIO */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full">
            <span className="inline-block bg-green-light text-green-primary text-xs font-medium
                             px-3 py-1 rounded-full mb-3">Registro gratuito</span>
            <h2 className="font-display text-2xl text-gray-900 mb-1">Crea tu cuenta</h2>
            <p className="text-sm text-gray-400 font-light mb-7">
              Tu empresa estará operativa en menos de 5 minutos.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Nombre de tu empresa
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ej. Taller Mecánico García"
                  value={form.nombreEmpresa}
                  onChange={e => update('nombreEmpresa', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Email del administrador
                </label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="admin@tuempresa.com"
                  value={form.email}
                  onChange={e => update('email', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Contraseña
                </label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Mínimo 8 caracteres"
                  value={form.password}
                  onChange={e => update('password', e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-primary text-xs
                                rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-primary text-white py-3 rounded-xl font-medium text-sm
                           hover:bg-green-dark transition-colors shadow-[0_4px_16px_rgba(0,146,60,0.28)]
                           disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {loading ? 'Creando cuenta…' : 'Crear cuenta gratis →'}
              </button>
            </form>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs text-gray-400">¿Ya tienes cuenta?</span>
              </div>
            </div>

            <Link to="/login"
              className="block text-center text-sm text-green-primary font-medium no-underline hover:underline">
              Iniciar sesión
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}