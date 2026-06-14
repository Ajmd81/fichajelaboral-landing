import { useEffect, useState } from 'react'
import { api } from '../services/api'
import { isAdmin } from '../services/auth'

interface Fichaje {
  id: number
  empleadoId: number
  empleadoNombre: string
  horaEntrada: string
  horaSalida?: string
  cerrado: boolean
  latitud?: number
  longitud?: number
  tipo?: TipoFichaje
  observaciones?: string
  hashActual?: string
  version?: number
  mocked?: boolean
}

interface AuditoriaItem {
  id: number
  fichajeId: number
  accion: 'CREATE' | 'UPDATE' | 'DELETE'
  valorAntes?: string
  valorDespues?: string
  motivo: string
  modificadoPor: string
  timestamp: string
  hash: string
}

interface Empleado {
  id: number
  nombre: string
  apellido: string
}

type TipoFichaje = 'JORNADA' | 'DESPLAZAMIENTO' | 'VISITA_COMERCIAL' | 'REUNION_EXTERNA' | 'FORMACION'

const TIPOS_LABEL: Record<TipoFichaje, string> = {
  JORNADA:          'Jornada',
  DESPLAZAMIENTO:   'Desplazamiento',
  VISITA_COMERCIAL: 'Visita comercial',
  REUNION_EXTERNA:  'Reunión externa',
  FORMACION:        'Formación',
}

const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
]

export function FichajesPage() {
  const admin = isAdmin()
  const [fichajes,  setFichajes]  = useState<Fichaje[]>([])
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [loading,   setLoading]   = useState(true)
  const [filtro,    setFiltro]    = useState<'todos' | 'abiertos' | 'cerrados' | 'fakegps'>('todos')

  // Edit modal
  const [editFichaje, setEditFichaje] = useState<Fichaje | null>(null)
  const [editForm, setEditForm] = useState({ horaEntrada: '', horaSalida: '', tipo: 'JORNADA' as TipoFichaje, observaciones: '', motivo: '' })
  const [saving, setSaving] = useState(false)
  const [editError, setEditError] = useState('')

  // Audit modal
  const [auditFichaje, setAuditFichaje] = useState<Fichaje | null>(null)
  const [auditItems, setAuditItems] = useState<AuditoriaItem[]>([])

  // Export
  const hoy = new Date()
  const [expEmpleadoId, setExpEmpleadoId] = useState<number | ''>('')
  const [expAnio, setExpAnio] = useState(hoy.getFullYear())
  const [expMes,  setExpMes]  = useState(hoy.getMonth() + 1)
  const [exporting, setExporting] = useState(false)

  async function cargar() {
    setLoading(true)
    try {
      const url = admin ? '/fichajes/equipo' : '/fichajes/mis-fichajes'
      const r = await api.get(url)
      setFichajes(r.data)
      if (admin) {
        const e = await api.get('/empleados')
        setEmpleados(e.data)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [])

  // ── Editar fichaje ──────────────────────────────────────────────
  function abrirEdit(f: Fichaje) {
    setEditFichaje(f)
    setEditError('')
    setEditForm({
      horaEntrada:   isoFromDdMm(f.horaEntrada),
      horaSalida:    f.horaSalida ? isoFromDdMm(f.horaSalida) : '',
      tipo:          f.tipo ?? 'JORNADA',
      observaciones: f.observaciones ?? '',
      motivo:        '',
    })
  }

  async function guardarEdit() {
    if (!editFichaje) return
    if (!editForm.motivo.trim()) {
      setEditError('El motivo es obligatorio (Ley de Control Horario 2026)')
      return
    }
    setSaving(true)
    try {
      const payload: any = {
        tipo:          editForm.tipo,
        observaciones: editForm.observaciones,
        motivo:        editForm.motivo,
      }
      if (editForm.horaEntrada) payload.horaEntrada = editForm.horaEntrada + ':00'
      if (editForm.horaSalida)  payload.horaSalida  = editForm.horaSalida + ':00'

      await api.patch('/fichajes/' + editFichaje.id, payload)
      setEditFichaje(null)
      await cargar()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setEditError(e?.response?.data?.message ?? 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  // ── Auditoría ──────────────────────────────────────────────────
  async function verAuditoria(f: Fichaje) {
    setAuditFichaje(f)
    setAuditItems([])
    try {
      const r = await api.get('/auditoria/fichaje/' + f.id)
      setAuditItems(r.data)
    } catch {
      setAuditItems([])
    }
  }

  // ── Exportar ──────────────────────────────────────────────────
  async function exportar(formato: 'pdf' | 'csv') {
    if (!expEmpleadoId) return
    setExporting(true)
    try {
      const r = await api.get('/exportacion/empleado/' + expEmpleadoId + '/' + formato, {
        params: { anio: expAnio, mes: expMes },
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([r.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = 'registro-jornada-' + expEmpleadoId + '-' + expAnio + '-' + String(expMes).padStart(2, '0') + '.' + formato
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      alert('Error exportando: ' + (e?.response?.data?.message ?? 'desconocido'))
    } finally {
      setExporting(false)
    }
  }

  const filtered = fichajes.filter(f => {
    if (filtro === 'todos')    return true
    if (filtro === 'abiertos') return !f.cerrado
    if (filtro === 'cerrados') return f.cerrado
    if (filtro === 'fakegps')  return f.mocked === true
    return true
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-gray-900 mb-1">
          {admin ? 'Fichajes del equipo' : 'Mis fichajes'}
        </h1>
        <p className="text-sm text-gray-500">{fichajes.length} registros · Cumple Ley Control Horario 2026</p>
      </div>

      {/* Bloque de exportación (solo admin) */}
      {admin && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
          <h2 className="font-display text-base text-gray-900 mb-3">📑 Exportar informe oficial</h2>
          <p className="text-xs text-gray-500 mb-4">Genera el registro mensual de jornada en formato PDF (para inspección) o CSV (para nóminas).</p>

          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Empleado</label>
              <select className="input-field min-w-[200px]" value={expEmpleadoId}
                onChange={e => setExpEmpleadoId(e.target.value ? Number(e.target.value) : '')}>
                <option value="">Selecciona…</option>
                {empleados.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.nombre} {emp.apellido}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Mes</label>
              <select className="input-field" value={expMes} onChange={e => setExpMes(Number(e.target.value))}>
                {MESES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Año</label>
              <input type="number" className="input-field w-24" value={expAnio}
                onChange={e => setExpAnio(Number(e.target.value))} />
            </div>
            <button onClick={() => exportar('pdf')} disabled={!expEmpleadoId || exporting}
              className="bg-green-primary text-white px-5 py-2.5 rounded-xl text-sm font-medium
                         hover:bg-green-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                         border-none cursor-pointer">
              {exporting ? 'Generando…' : '⬇ PDF'}
            </button>
            <button onClick={() => exportar('csv')} disabled={!expEmpleadoId || exporting}
              className="bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-medium
                         hover:border-green-primary hover:text-green-primary transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
              ⬇ CSV
            </button>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex gap-2 mb-6">
        {(['todos','abiertos','cerrados','fakegps'] as const).map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            className={`px-4 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer
              ${filtro === f
                ? f === 'fakegps'
                ? 'bg-red-primary text-white border-red-primary'
                : 'bg-green-primary text-white border-green-primary'
                : 'bg-white text-gray-600 border-gray-200 hover:border-green-primary hover:text-green-primary'}`}>
            {f === 'fakegps' ? '⚠️ Fake GPS' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-gray-400">Cargando…</div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-400">No hay fichajes.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {admin && <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Empleado</th>}
                  <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Entrada</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Salida</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Tipo</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Ubicación</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Estado</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">V</th>
                  {admin && <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map(f => (
                  <tr key={f.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    {admin && <td className="px-4 py-3 font-medium text-gray-900">{f.empleadoNombre}</td>}
                    <td className="px-4 py-3 text-gray-600">{f.horaEntrada ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{f.horaSalida ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 font-medium">
                        {f.tipo ? TIPOS_LABEL[f.tipo] : 'Jornada'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {f.latitud != null && f.longitud != null ? (
                        <div className="flex items-center gap-2 flex-wrap">
                          <a href={'https://maps.google.com/?q=' + f.latitud + ',' + f.longitud}
                            target="_blank" rel="noreferrer"
                            className="text-xs text-green-primary no-underline hover:underline">
                            📍 Ver mapa
                          </a>
                          {f.mocked && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-primary font-semibold uppercase tracking-wide"
                              title="Ubicación generada por una app de Fake GPS — revisar este fichaje">
                              ⚠️ Fake GPS
                            </span>
                          )}
                        </div>
                      ) : <span className="text-xs text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium
                        ${f.cerrado ? 'bg-green-light text-green-primary' : 'bg-blue-50 text-blue-primary'}`}>
                        {f.cerrado ? 'Completo' : 'En curso'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400" title={'Hash: ' + (f.hashActual ?? '')}>
                      v{f.version ?? 1}
                    </td>
                    {admin && (
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => abrirEdit(f)}
                            className="text-xs text-gray-500 hover:text-green-primary bg-transparent border-none cursor-pointer"
                            title="Editar fichaje">
                            ✏️
                          </button>
                          <button onClick={() => verAuditoria(f)}
                            className="text-xs text-gray-500 hover:text-blue-primary bg-transparent border-none cursor-pointer"
                            title="Historial de cambios">
                            📜
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Modal Editar ─── */}
      {editFichaje && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display text-xl text-gray-900">Modificar fichaje #{editFichaje.id}</h2>
              <button onClick={() => setEditFichaje(null)}
                className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer text-xl">✕</button>
            </div>
            <p className="text-xs text-gray-500 mb-5">
              Toda modificación queda registrada con sellado hash inmutable.
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Entrada</label>
                  <input type="datetime-local" className="input-field"
                    value={editForm.horaEntrada}
                    onChange={e => setEditForm(p => ({ ...p, horaEntrada: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Salida</label>
                  <input type="datetime-local" className="input-field"
                    value={editForm.horaSalida}
                    onChange={e => setEditForm(p => ({ ...p, horaSalida: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Tipo</label>
                <select className="input-field" value={editForm.tipo}
                  onChange={e => setEditForm(p => ({ ...p, tipo: e.target.value as TipoFichaje }))}>
                  {(Object.keys(TIPOS_LABEL) as TipoFichaje[]).map(t => (
                    <option key={t} value={t}>{TIPOS_LABEL[t]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Observaciones</label>
                <textarea className="input-field resize-none h-20" placeholder="Opcional"
                  value={editForm.observaciones}
                  onChange={e => setEditForm(p => ({ ...p, observaciones: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Motivo de modificación <span className="text-red-primary">*</span>
                </label>
                <textarea className="input-field resize-none h-20"
                  placeholder="Obligatorio. Ej: el empleado olvidó cerrar la jornada el viernes."
                  value={editForm.motivo}
                  onChange={e => setEditForm(p => ({ ...p, motivo: e.target.value }))} required />
              </div>

              {editError && (
                <div className="bg-red-50 border border-red-200 text-red-primary text-xs rounded-xl px-4 py-3">
                  {editError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditFichaje(null)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm
                             hover:border-gray-300 transition-colors bg-white cursor-pointer">
                  Cancelar
                </button>
                <button onClick={guardarEdit} disabled={saving}
                  className="flex-1 bg-green-primary text-white py-2.5 rounded-xl text-sm font-medium
                             hover:bg-green-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed
                             border-none cursor-pointer">
                  {saving ? 'Guardando…' : 'Guardar cambios'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal Auditoría ─── */}
      {auditFichaje && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display text-xl text-gray-900">Historial fichaje #{auditFichaje.id}</h2>
              <button onClick={() => setAuditFichaje(null)}
                className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer text-xl">✕</button>
            </div>
            <p className="text-xs text-gray-500 mb-5">
              Cada cambio queda registrado con sellado hash inmutable.
            </p>

            {auditItems.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Sin entradas de auditoría.</p>
            ) : (
              <div className="space-y-3">
                {auditItems.map(a => (
                  <div key={a.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium
                        ${a.accion === 'CREATE' ? 'bg-green-light text-green-primary'
                        : a.accion === 'UPDATE' ? 'bg-blue-50 text-blue-primary'
                        : 'bg-red-50 text-red-primary'}`}>
                        {a.accion}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(a.timestamp).toLocaleString('es-ES')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 mb-1">
                      <strong>Por:</strong> {a.modificadoPor}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Motivo:</strong> {a.motivo}
                    </p>
                    {a.valorAntes && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-gray-500 hover:text-gray-900">Ver detalle</summary>
                        <div className="mt-2 space-y-2">
                          <div>
                            <p className="text-gray-400 mb-1">Antes:</p>
                            <pre className="bg-red-50 p-2 rounded text-[10px] overflow-x-auto">{a.valorAntes}</pre>
                          </div>
                          {a.valorDespues && (
                            <div>
                              <p className="text-gray-400 mb-1">Después:</p>
                              <pre className="bg-green-light p-2 rounded text-[10px] overflow-x-auto">{a.valorDespues}</pre>
                            </div>
                          )}
                        </div>
                      </details>
                    )}
                    <p className="text-[10px] text-gray-300 mt-2 font-mono break-all">Hash: {a.hash}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Helper: convierte "10/06/2026 23:51" en "2026-06-10T23:51"
function isoFromDdMm(s: string): string {
  if (!s) return ''
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/)
  if (!m) return ''
  return m[3] + '-' + m[2] + '-' + m[1] + 'T' + m[4] + ':' + m[5]
}