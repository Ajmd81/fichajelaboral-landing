import { useEffect, useState } from 'react'
import { api } from '../services/api'

interface VacacionesAnonima {
  id: number
  codigoAnonimo: string
  fechaInicio: string
  fechaFin: string
  diasLaborables: number
  estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA'
  fechaSolicitud: string
  fechaResolucion?: string
}

const ESTADOS_LABEL = {
  PENDIENTE: 'Pendiente',
  APROBADA:  'Aprobada',
  RECHAZADA: 'Rechazada',
} as const

const ESTADOS_CLASS = {
  PENDIENTE: 'bg-yellow-50 text-yellow-700',
  APROBADA:  'bg-green-light text-green-primary',
  RECHAZADA: 'bg-red-50 text-red-primary',
} as const

export function RltVacacionesPage() {
  const [solicitudes, setSolicitudes] = useState<VacacionesAnonima[]>([])
  const [loading,     setLoading]     = useState(true)
  const [filtro,      setFiltro]      = useState<'todas' | 'PENDIENTE' | 'APROBADA' | 'RECHAZADA'>('todas')

  async function cargar() {
    setLoading(true)
    try {
      const r = await api.get('/rlt/vacaciones')
      setSolicitudes(r.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = solicitudes.filter(v => filtro === 'todas' || v.estado === filtro)

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1 flex-wrap">
          <h1 className="font-display text-3xl text-gray-900">Vacaciones anónimas</h1>
          <span className="bg-purple-50 text-purple-700 text-[10px] px-2.5 py-1 rounded-full font-medium uppercase tracking-wide">
            🔒 Anonimizado
          </span>
        </div>
        <p className="text-sm text-gray-500">{solicitudes.length} solicitudes en total</p>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(['todas','PENDIENTE','APROBADA','RECHAZADA'] as const).map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            className={`px-4 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer
              ${filtro === f
                ? 'bg-green-primary text-white border-green-primary'
                : 'bg-white text-gray-600 border-gray-200 hover:border-green-primary hover:text-green-primary'}`}>
            {f === 'todas' ? 'Todas' : ESTADOS_LABEL[f]}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-gray-400">Cargando…</div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-400">Sin solicitudes en este estado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Código</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Periodo</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Días</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Solicitado</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Resuelto</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Estado</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(v => (
                  <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-gray-900">{v.codigoAnonimo}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatFecha(v.fechaInicio)} → {formatFecha(v.fechaFin)}
                    </td>
                    <td className="px-4 py-3 text-gray-900 font-medium">{v.diasLaborables}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{formatFecha(v.fechaSolicitud)}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {v.fechaResolucion ? formatFecha(v.fechaResolucion) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${ESTADOS_CLASS[v.estado]}`}>
                        {ESTADOS_LABEL[v.estado]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-[10px] text-gray-400 mt-4 italic">
        🔒 Los nombres y datos personales están ocultos. Cada código identifica al mismo empleado de forma consistente sin permitir su identificación.
      </p>
    </div>
  )
}

function formatFecha(s: string): string {
  if (!s) return '—'
  const d = new Date(s)
  if (isNaN(d.getTime())) return s
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
}