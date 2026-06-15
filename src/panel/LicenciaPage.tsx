import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../services/api'

interface SesionInfo {
  empresaNombre?: string
  demo?: boolean
  diasRestantesDemo?: number
  plan?: 'BASICO' | 'PROFESIONAL' | 'ULTIMATE' | null
  subscriptionStatus?: string | null
  currentPeriodEnd?: string | null
}

const PLANES = [
  {
    id: 'BASICO' as const,
    nombre: 'Básico',
    rango: '1-15 empleados',
    precio: 348,
    precioMensual: 29,
    destacado: false,
  },
  {
    id: 'PROFESIONAL' as const,
    nombre: 'Profesional',
    rango: '16-50 empleados',
    precio: 468,
    precioMensual: 39,
    destacado: true,
  },
  {
    id: 'ULTIMATE' as const,
    nombre: 'Ultimate',
    rango: '51+ empleados',
    precio: 588,
    precioMensual: 49,
    destacado: false,
  },
]

export function LicenciaPage() {
  const [params] = useSearchParams()
  const [sesion, setSesion]   = useState<SesionInfo>({})
  const [loading, setLoading] = useState(true)
  const [pago, setPago]       = useState<string | null>(null)
  const [error, setError]     = useState('')

  // Mensajes según query params de Stripe
  const success  = params.get('success')  === 'true'
  const canceled = params.get('canceled') === 'true'

  async function cargar() {
    setLoading(true)
    try {
      const r = await api.get('/empresas/mi-empresa')
      setSesion(r.data)
    } catch {
      // silencioso
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void cargar()
    // Si venimos de Stripe success, esperar 3s y recargar para que el webhook haya procesado
    if (success) {
      const t = setTimeout(() => { void cargar() }, 3000)
      return () => clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [success])

  async function activarPlan(planId: string) {
    setPago(planId)
    setError('')
    try {
      const r = await api.post('/stripe/checkout-session', { plan: planId })
      window.location.href = r.data.url
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setError(e?.response?.data?.message ?? 'Error al iniciar el pago')
      setPago(null)
    }
  }

  async function gestionarSuscripcion() {
    setPago('portal')
    try {
      const r = await api.post('/stripe/customer-portal')
      window.location.href = r.data.url
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setError(e?.response?.data?.message ?? 'No se pudo abrir el portal')
      setPago(null)
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-sm text-gray-400">Cargando…</div>
  }

  const tieneSuscripcion = sesion.subscriptionStatus === 'ACTIVE' || sesion.subscriptionStatus === 'TRIALING'
  const planActual = PLANES.find(p => p.id === sesion.plan)

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-gray-900 mb-1">Licencia y facturación</h1>
        <p className="text-sm text-gray-500">
          {tieneSuscripcion
            ? `Plan ${planActual?.nombre} activo · ${sesion.empresaNombre}`
            : sesion.demo
              ? `Modo Demo · ${sesion.diasRestantesDemo} días restantes`
              : 'Selecciona un plan para activar tu licencia'}
        </p>
      </div>

      {/* Mensaje éxito */}
      {success && (
        <div className="bg-green-light border border-green-primary rounded-2xl p-5 mb-6 flex items-start gap-3">
          <span className="text-2xl">✓</span>
          <div>
            <p className="font-display text-lg text-green-primary">¡Pago completado!</p>
            <p className="text-sm text-gray-700">
              Tu suscripción se activará en unos segundos. Si no ves los cambios, recarga la página.
            </p>
          </div>
        </div>
      )}

      {/* Mensaje cancelado */}
      {canceled && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 mb-6">
          <p className="font-display text-base text-yellow-800 mb-1">⚠️ Pago cancelado</p>
          <p className="text-sm text-gray-700">No se ha realizado ningún cargo. Puedes volver a intentarlo cuando quieras.</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-primary text-sm rounded-2xl px-5 py-4 mb-6">
          {error}
        </div>
      )}

      {/* Suscripción activa */}
      {tieneSuscripcion && planActual && (
        <div className="bg-white border-2 border-green-primary rounded-2xl p-8 mb-8">
          <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
            <div>
              <p className="text-xs font-medium text-green-primary uppercase tracking-wide mb-1">Plan activo</p>
              <h2 className="font-display text-3xl text-gray-900">{planActual.nombre}</h2>
              <p className="text-sm text-gray-500 mt-1">{planActual.rango}</p>
            </div>
            <div className="text-right">
              <p className="font-display text-3xl text-gray-900">{planActual.precio}€<span className="text-sm text-gray-400 font-sans"> /año</span></p>
              <p className="text-xs text-gray-500">Equivale a {planActual.precioMensual}€/mes</p>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-5 mb-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Estado</p>
                <p className="font-medium text-green-primary">✓ Activa</p>
              </div>
              {sesion.currentPeriodEnd && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Renovación</p>
                  <p className="font-medium text-gray-900">
                    {new Date(sesion.currentPeriodEnd).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              )}
            </div>
          </div>

          <button onClick={gestionarSuscripcion} disabled={pago === 'portal'}
            className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-xl text-sm font-medium
                       hover:border-green-primary hover:text-green-primary transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
            {pago === 'portal' ? 'Abriendo portal…' : '⚙ Gestionar suscripción · cambiar plan · descargar facturas'}
          </button>
        </div>
      )}

      {/* Planes disponibles */}
      {!tieneSuscripcion && (
        <>
          <h2 className="font-display text-xl text-gray-900 mb-4">Elige tu plan</h2>
          <p className="text-sm text-gray-500 mb-6">
            Todos los planes incluyen cumplimiento legal completo (Ley Control Horario 2026), exportación PDF/CSV oficial, app móvil para empleados y panel web.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PLANES.map(plan => (
              <div key={plan.id}
                className={`bg-white rounded-2xl p-6 border-2 flex flex-col
                  ${plan.destacado ? 'border-green-primary shadow-[0_8px_24px_rgba(0,146,60,0.18)]' : 'border-gray-200'}`}>
                {plan.destacado && (
                  <span className="self-start text-[10px] font-medium uppercase tracking-wide text-white bg-green-primary px-2.5 py-1 rounded-full mb-3">
                    Más popular
                  </span>
                )}
                <h3 className="font-display text-2xl text-gray-900 mb-1">{plan.nombre}</h3>
                <p className="text-sm text-gray-500 mb-5">{plan.rango}</p>

                <div className="mb-5">
                  <p className="font-display text-3xl text-gray-900">{plan.precio}€<span className="text-sm text-gray-400 font-sans"> /año</span></p>
                  <p className="text-xs text-gray-400 mt-0.5">≈ {plan.precioMensual}€/mes · IVA no incluido</p>
                </div>

                <ul className="space-y-2 text-sm text-gray-700 mb-6 flex-1">
                  <li className="flex items-start gap-2"><span className="text-green-primary">✓</span> Fichajes ilimitados</li>
                  <li className="flex items-start gap-2"><span className="text-green-primary">✓</span> Cadena hash inmutable</li>
                  <li className="flex items-start gap-2"><span className="text-green-primary">✓</span> Exportación PDF / CSV</li>
                  <li className="flex items-start gap-2"><span className="text-green-primary">✓</span> Vacaciones y extras</li>
                  <li className="flex items-start gap-2"><span className="text-green-primary">✓</span> Verificación de integridad</li>
                  <li className="flex items-start gap-2"><span className="text-green-primary">✓</span> Rol RLT anonimizado</li>
                  <li className="flex items-start gap-2"><span className="text-green-primary">✓</span> App móvil con detección de Fake GPS</li>
                  {plan.id !== 'BASICO' && <li className="flex items-start gap-2"><span className="text-green-primary">✓</span> Soporte prioritario</li>}
                  {plan.id === 'ULTIMATE' && <li className="flex items-start gap-2"><span className="text-green-primary">✓</span> Multi-empresa</li>}
                </ul>

                <button onClick={() => activarPlan(plan.id)} disabled={pago !== null}
                  className={`w-full py-3 rounded-xl text-sm font-medium transition-colors border-none cursor-pointer
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${plan.destacado
                      ? 'bg-green-primary text-white hover:bg-green-dark shadow-[0_4px_16px_rgba(0,146,60,0.28)]'
                      : 'bg-gray-900 text-white hover:bg-gray-800'}`}>
                  {pago === plan.id ? 'Redirigiendo a Stripe…' : 'Contratar plan'}
                </button>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-400 mt-6 text-center">
            Pago seguro mediante Stripe · Puedes cancelar en cualquier momento · Pago anual, sin permanencia
          </p>
        </>
      )}
    </div>
  )
}