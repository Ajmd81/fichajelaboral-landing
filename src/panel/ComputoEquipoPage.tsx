import { useEffect, useState } from 'react'
import { api } from '../services/api'

interface EmpleadoComputoEquipo {
  empleadoId: number
  nombreCompleto: string
  horasContratadasDia: number
  horasOrdinarias: number
  horasExtrasDiurnas: number
  horasExtrasNocturnas: number
  totalHoras: number
  extrasAcumuladasAnio: number
  limiteAnualSuperado: boolean
}

const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
]

export function ComputoEquipoPage() {
  const hoy = new Date()
  const [anio, setAnio] = useState(hoy.getFullYear())
  const [mes,  setMes]  = useState(hoy.getMonth() + 1)
  const [data, setData] = useState<EmpleadoComputoEquipo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function cargar() {
    setLoading(true)
    setError('')
    try {
      const desde = anio + '-' + String(mes).padStart(2, '0') + '-01'
      // último día del mes
      const lastDay = new Date(anio, mes, 0).getDate()
      const hasta = anio + '-' + String(mes).padStart(2, '0') + '-' + String(lastDay).padStart(2, '0')
      const r = await api.get('/computo/equipo', { params: { desde, hasta } })
      setData(r.data)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setError(e?.response?.data?.message ?? 'Error cargando cómputo')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anio, mes])

  // Resumen global
  const totales = data.reduce((acc, e) => ({
    ord:   acc.ord + e.horasOrdinarias,
    extD:  acc.extD + e.horasExtrasDiurnas,
    extN:  acc.extN + e.horasExtrasNocturnas,
    total: acc.total + e.totalHoras,
  }), { ord: 0, extD: 0, extN: 0, total: 0 })

  const empleadosAlLimite = data.filter(e => e.limiteAnualSuperado).length

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-gray-900 mb-1">Resumen del equipo</h1>
        <p className="text-sm text-gray-500">Horas trabajadas, extras diurnas y nocturnas por empleado · Conforme al Art. 35 ET</p>
      </div>

      {/* Selector mes */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6 flex items-end gap-3 flex-wrap">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Mes</label>
          <select className="input-field" value={mes} onChange={e => setMes(Number(e.target.value))}>
            {MESES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Año</label>
          <input type="number" className="input-field w-24" value={anio}
            onChange={e => setAnio(Number(e.target.value))} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon="🕐" label="Horas ordinarias"  value={totales.ord.toFixed(2) + ' h'} color="#00923C" />
        <StatCard icon="☀️" label="Extras diurnas"    value={totales.extD.toFixed(2) + ' h'} color="#0081CF" />
        <StatCard icon="🌙" label="Extras nocturnas"  value={totales.extN.toFixed(2) + ' h'} color="#6B46C1" />
        <StatCard icon="📊" label="Total mes"          value={totales.total.toFixed(2) + ' h'} color="#131B27" />
      </div>

      {/* Alerta empleados al límite */}
      {empleadosAlLimite > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 mb-6 flex items-start gap-3">
          <span className="text-lg">⚠️</span>
          <div>
            <p className="text-sm font-medium text-red-primary mb-0.5">
              {empleadosAlLimite} empleado{empleadosAlLimite !== 1 ? 's' : ''} ha alcanzado el límite anual de 80h extras
            </p>
            <p className="text-xs text-gray-600 font-light">
              No podrán registrar más fichajes hasta el año siguiente (Art. 35.2 ET).
            </p>
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-gray-400">Cargando…</div>
        ) : error ? (
          <div className="px-6 py-12 text-center text-sm text-red-primary">{error}</div>
        ) : data.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-400">Sin datos para este periodo.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left  px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Empleado</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Jornada/día</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Ordinarias</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Ext. diurnas</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Ext. nocturnas</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Total mes</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Extras año</th>
                </tr>
              </thead>
              <tbody>
                {data.map(e => (
                  <tr key={e.empleadoId} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{e.nombreCompleto}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{e.horasContratadasDia.toFixed(1)} h</td>
                    <td className="px-4 py-3 text-right text-gray-900">{e.horasOrdinarias.toFixed(2)} h</td>
                    <td className="px-4 py-3 text-right text-blue-primary">{e.horasExtrasDiurnas.toFixed(2)} h</td>
                    <td className="px-4 py-3 text-right text-purple-700">{e.horasExtrasNocturnas.toFixed(2)} h</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">{e.totalHoras.toFixed(2)} h</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium
                        ${e.limiteAnualSuperado
                          ? 'bg-red-50 text-red-primary'
                          : e.extrasAcumuladasAnio > 60
                          ? 'bg-yellow-50 text-yellow-700'
                          : 'bg-green-light text-green-primary'}`}>
                        {e.extrasAcumuladasAnio.toFixed(1)} / 80 h
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ background: color + '18', color }}>{icon}</div>
      <div>
        <p className="font-display text-xl text-gray-900 leading-none mb-1">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  )
}