import { useEffect, useState } from 'react'
import { api } from '../services/api'

interface DiaComputo {
  fecha: string
  horasOrdinarias: number
  horasExtrasDiurnas: number
  horasExtrasNocturnas: number
  totalHoras: number
}

interface ResumenPeriodo {
  horasOrdinarias: number
  horasExtrasDiurnas: number
  horasExtrasNocturnas: number
  totalExtras: number
  totalHoras: number
}

interface ComputoEmpleadoResponse {
  empleadoId: number
  nombreCompleto: string
  horasContratadasDia: number
  horasExtrasAcumuladasAnio: number
  limiteAnualExtras: number
  dias: DiaComputo[]
  resumenSemanal: ResumenPeriodo
  resumenMensual: ResumenPeriodo
}

interface Empleado {
  id: number
  nombre: string
  apellido: string
}

const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
]

export function ComputoEmpleadoPage() {
  const hoy = new Date()
  const [empleados,    setEmpleados]    = useState<Empleado[]>([])
  const [empleadoId,   setEmpleadoId]   = useState<number | ''>('')
  const [anio,         setAnio]         = useState(hoy.getFullYear())
  const [mes,          setMes]          = useState(hoy.getMonth() + 1)
  const [data,         setData]         = useState<ComputoEmpleadoResponse | null>(null)
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState('')

  useEffect(() => {
    api.get('/empleados').then(r => {
      setEmpleados(r.data)
      if (r.data.length > 0) setEmpleadoId(r.data[0].id)
    })
  }, [])

  async function cargar() {
    if (!empleadoId) return
    setLoading(true)
    setError('')
    setData(null)
    try {
      const desde = anio + '-' + String(mes).padStart(2, '0') + '-01'
      const lastDay = new Date(anio, mes, 0).getDate()
      const hasta = anio + '-' + String(mes).padStart(2, '0') + '-' + String(lastDay).padStart(2, '0')
      const r = await api.get('/computo/empleado/' + empleadoId, { params: { desde, hasta } })
      setData(r.data)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setError(e?.response?.data?.message ?? 'Error cargando cómputo')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (empleadoId) cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empleadoId, anio, mes])

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-gray-900 mb-1">Detalle por empleado</h1>
        <p className="text-sm text-gray-500">Desglose diario, semanal y mensual de horas trabajadas y extras</p>
      </div>

      {/* Selector */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6 flex items-end gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Empleado</label>
          <select className="input-field w-full" value={empleadoId}
            onChange={e => setEmpleadoId(e.target.value ? Number(e.target.value) : '')}>
            <option value="">Selecciona…</option>
            {empleados.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.nombre} {emp.apellido}</option>
            ))}
          </select>
        </div>
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

      {loading && (
        <div className="bg-white border border-gray-200 rounded-2xl px-6 py-12 text-center text-sm text-gray-400">
          Cargando…
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-primary text-sm rounded-2xl px-5 py-4">
          {error}
        </div>
      )}

      {data && !loading && (
        <>
          {/* Stats principales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard label="Jornada contratada" value={data.horasContratadasDia.toFixed(1) + ' h/día'} color="#5A6475" />
            <StatCard label="Total mes"           value={data.resumenMensual.totalHoras.toFixed(2) + ' h'} color="#00923C" />
            <StatCard label="Extras este mes"     value={data.resumenMensual.totalExtras.toFixed(2) + ' h'} color="#0081CF" />
            <StatCard label="Extras año / límite"
              value={data.horasExtrasAcumuladasAnio.toFixed(1) + ' / ' + data.limiteAnualExtras + ' h'}
              color={data.horasExtrasAcumuladasAnio >= data.limiteAnualExtras
                ? '#D2514E'
                : data.horasExtrasAcumuladasAnio > 60 ? '#F5A623' : '#00923C'} />
          </div>

          {/* Resumen semanal/mensual */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <ResumenBlock title="Semana actual" data={data.resumenSemanal} />
            <ResumenBlock title="Mes completo"  data={data.resumenMensual} />
          </div>

          {/* Tabla diaria */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-display text-base text-gray-900">Desglose diario</h2>
            </div>
            {data.dias.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-gray-400">Sin días registrados.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left  px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Fecha</th>
                      <th className="text-right px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Ordinarias</th>
                      <th className="text-right px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Ext. diurnas</th>
                      <th className="text-right px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Ext. nocturnas</th>
                      <th className="text-right px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.dias.map(d => (
                      <tr key={d.fecha} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-900">{formatFecha(d.fecha)}</td>
                        <td className="px-4 py-3 text-right text-gray-700">{d.horasOrdinarias.toFixed(2)} h</td>
                        <td className="px-4 py-3 text-right text-blue-primary">{d.horasExtrasDiurnas.toFixed(2)} h</td>
                        <td className="px-4 py-3 text-right text-purple-700">{d.horasExtrasNocturnas.toFixed(2)} h</td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">{d.totalHoras.toFixed(2)} h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">{label}</p>
      <p className="font-display text-2xl leading-none" style={{ color }}>{value}</p>
    </div>
  )
}

function ResumenBlock({ title, data }: { title: string; data: { horasOrdinarias: number; horasExtrasDiurnas: number; horasExtrasNocturnas: number; totalExtras: number; totalHoras: number } }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <h3 className="font-display text-base text-gray-900 mb-3">{title}</h3>
      <div className="space-y-2 text-sm">
        <Row label="Ordinarias"      value={data.horasOrdinarias.toFixed(2) + ' h'} />
        <Row label="Extras diurnas"  value={data.horasExtrasDiurnas.toFixed(2) + ' h'} color="text-blue-primary" />
        <Row label="Extras nocturnas" value={data.horasExtrasNocturnas.toFixed(2) + ' h'} color="text-purple-700" />
        <div className="border-t border-gray-100 pt-2 mt-2">
          <Row label="Total" value={data.totalHoras.toFixed(2) + ' h'} bold />
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, color, bold }: { label: string; value: string; color?: string; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-600">{label}</span>
      <span className={(color ?? 'text-gray-900') + (bold ? ' font-semibold' : '')}>{value}</span>
    </div>
  )
}

function formatFecha(s: string): string {
  if (!s) return '—'
  const d = new Date(s)
  if (isNaN(d.getTime())) return s
  return d.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: '2-digit' })
}