import { useEffect, useState } from 'react'
import { api } from '../services/api'

interface Vacaciones {
  id: number
  empleadoId: number
  empleadoNombre: string
  fechaInicio: string
  fechaFin: string
  diasLaborables: number
  estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA'
  comentario?: string
  motivoRechazo?: string
  fechaSolicitud: string
  fechaResolucion?: string
  resueltoPor?: string
}

const ESTADOS_LABEL = {
  PENDIENTE: 'Pendiente',
  APROBADA:  'Aprobada',
  RECHAZADA: 'Rechazada',
} as const

const ESTADOS_CLASS = {
  PENDIENTE: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  APROBADA:  'bg-green-light text-green-primary',
  RECHAZADA: 'bg-red-50 text-red-primary',
} as const

export function VacacionesPage() {
  const [solicitudes, setSolicitudes] = useState<Vacaciones[]>([])
  const [loading,     setLoading]     = useState(true)
  const [filtro,      setFiltro]      = useState<'todas' | 'PENDIENTE' | 'APROBADA' | 'RECHAZADA'>('PENDIENTE')

  // Modal de rechazo
  const [rechazoTarget, setRechazoTarget] = useState<Vacaciones | null>(null)
  const [motivo,        setMotivo]        = useState('')
  const [saving,        setSaving]        = useState(false)

  async function cargar() {
    setLoading(true)
    try {
      const r = await api.get('/vacaciones/empresa')
      setSolicitudes(r.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    cargar() 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function aprobar(v: Vacaciones) {
    if (!confirm('¿Aprobar las vacaciones de ' + v.empleadoNombre + ' del ' + formatFecha(v.fechaInicio) + ' al ' + formatFecha(v.fechaFin) + '?')) return
    try {
      await api.patch('/vacaciones/' + v.id + '/aprobar')
      await cargar()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      alert('Error al aprobar: ' + (e?.response?.data?.message ?? 'desconocido'))
    }
  }

  async function rechazar() {
    if (!rechazoTarget) return
    if (!motivo.trim()) {
      alert('El motivo del rechazo es obligatorio')
      return
    }
    setSaving(true)
    try {
      await api.patch('/vacaciones/' + rechazoTarget.id + '/rechazar', { motivo })
      setRechazoTarget(null)
      setMotivo('')
      await cargar()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      alert('Error al rechazar: ' + (e?.response?.data?.message ?? 'desconocido'))
    } finally {
      setSaving(false)
    }
  }

  const filtered = solicitudes.filter(v => filtro === 'todas' || v.estado === filtro)

  const pendientesCount = solicitudes.filter(v => v.estado === 'PENDIENTE').length

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-gray-900 mb-1">Vacaciones</h1>
        <p className="text-sm text-gray-500">
          {solicitudes.length} solicitudes
          {pendientesCount > 0 && (
            <span className="ml-2 text-yellow-700 font-medium">· {pendientesCount} pendiente{pendientesCount !== 1 ? 's' : ''}</span>
          )}
        </p>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(['PENDIENTE','APROBADA','RECHAZADA','todas'] as const).map(f => (
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
          <div className="px-6 py-12 text-center text-sm text-gray-400">
            {filtro === 'PENDIENTE' ? '✨ No hay solicitudes pendientes.' : 'No hay solicitudes en este estado.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Empleado</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Periodo</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Días</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Solicitado</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Comentario</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Estado</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(v => (
                  <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{v.empleadoNombre}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatFecha(v.fechaInicio)} → {formatFecha(v.fechaFin)}
                    </td>
                    <td className="px-4 py-3 text-gray-900 font-medium">{v.diasLaborables}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{formatFecha(v.fechaSolicitud)}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate" title={v.comentario}>
                      {v.comentario ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${ESTADOS_CLASS[v.estado]}`}>
                        {ESTADOS_LABEL[v.estado]}
                      </span>
                      {v.estado === 'RECHAZADA' && v.motivoRechazo && (
                        <p className="text-[10px] text-gray-400 mt-1 max-w-[150px]" title={v.motivoRechazo}>
                          {v.motivoRechazo}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {v.estado === 'PENDIENTE' ? (
                        <div className="flex gap-2">
                          <button onClick={() => aprobar(v)}
                            className="text-xs px-3 py-1.5 rounded-lg bg-green-light text-green-primary
                                       hover:bg-green-primary hover:text-white transition-colors
                                       border-none cursor-pointer font-medium">
                            ✓ Aprobar
                          </button>
                          <button onClick={() => { setRechazoTarget(v); setMotivo('') }}
                            className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-primary
                                       hover:bg-red-primary hover:text-white transition-colors
                                       border-none cursor-pointer font-medium">
                            ✕ Rechazar
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">
                          {v.resueltoPor ?? '—'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de rechazo */}
      {rechazoTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display text-xl text-gray-900">Rechazar solicitud</h2>
              <button onClick={() => setRechazoTarget(null)}
                className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer text-xl">✕</button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              <strong>{rechazoTarget.empleadoNombre}</strong> ha solicitado del {formatFecha(rechazoTarget.fechaInicio)} al {formatFecha(rechazoTarget.fechaFin)} ({rechazoTarget.diasLaborables} días).
            </p>

            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Motivo del rechazo <span className="text-red-primary">*</span>
            </label>
            <textarea className="input-field resize-none h-24 mb-4"
              placeholder="Ej: el equipo no puede prescindir de ti en ese periodo. Solicita otras fechas."
              value={motivo}
              onChange={e => setMotivo(e.target.value)} />

            <div className="flex gap-3">
              <button type="button" onClick={() => setRechazoTarget(null)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm
                           hover:border-gray-300 transition-colors bg-white cursor-pointer">
                Cancelar
              </button>
              <button onClick={rechazar} disabled={saving || !motivo.trim()}
                className="flex-1 bg-red-primary text-white py-2.5 rounded-xl text-sm font-medium
                           hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed
                           border-none cursor-pointer">
                {saving ? 'Rechazando…' : 'Confirmar rechazo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function formatFecha(s: string): string {
  if (!s) return '—'
  // Formato ISO YYYY-MM-DD o YYYY-MM-DDTHH:MM:SS
  const d = new Date(s)
  if (isNaN(d.getTime())) return s
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
}