import { useEffect, useState } from 'react'
import { api } from '../services/api'

interface FichajeAnonimo {
  id: number
  codigoAnonimo: string
  horaEntrada: string
  horaSalida?: string
  tipo: string
  cerrado: boolean
  version: number
  modificado: boolean
  conGeolocalizacion: boolean
  mocked?: boolean
}

const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
]

const TIPOS_LABEL: Record<string, string> = {
  JORNADA:          'Jornada',
  DESPLAZAMIENTO:   'Desplazamiento',
  VISITA_COMERCIAL: 'Visita comercial',
  REUNION_EXTERNA:  'Reunión externa',
  FORMACION:        'Formación',
}

export function RltFichajesPage() {
  const hoy = new Date()
  const [anio, setAnio] = useState(hoy.getFullYear())
  const [mes,  setMes]  = useState(hoy.getMonth() + 1)
  const [fichajes, setFichajes] = useState<FichajeAnonimo[]>([])
  const [loading,  setLoading]  = useState(true)
  const [filtro,   setFiltro]   = useState<'todos' | 'modificados'>('todos')

  async function cargar() {
    setLoading(true)
    try {
      const r = await api.get('/rlt/fichajes', { params: { anio, mes } })
      setFichajes(r.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anio, mes])

  const filtered = fichajes.filter(f => filtro === 'todos' || f.modificado)
  const modificadosCount = fichajes.filter(f => f.modificado).length

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1 flex-wrap">
          <h1 className="font-display text-3xl text-gray-900">Fichajes anónimos</h1>
          <span className="bg-purple-50 text-purple-700 text-[10px] px-2.5 py-1 rounded-full font-medium uppercase tracking-wide">
            🔒 Anonimizado
          </span>
        </div>
        <p className="text-sm text-gray-500">
          {fichajes.length} registros en el mes
          {modificadosCount > 0 && <span> · {modificadosCount} modificados</span>}
        </p>
      </div>

      {/* Selector */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4 flex items-end gap-3 flex-wrap">
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

      {/* Filtro */}
      <div className="flex gap-2 mb-6">
        {(['todos','modificados'] as const).map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            className={`px-4 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer
              ${filtro === f
                ? 'bg-green-primary text-white border-green-primary'
                : 'bg-white text-gray-600 border-gray-200 hover:border-green-primary hover:text-green-primary'}`}>
            {f === 'todos' ? 'Todos' : 'Solo modificados'}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-gray-400">Cargando…</div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-400">
            {filtro === 'modificados' ? '✓ No hay fichajes modificados este mes.' : 'No hay fichajes en este periodo.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Código</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Entrada</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Salida</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Tipo</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">GPS</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Estado</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">V</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(f => (
                  <tr key={f.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-gray-900">{f.codigoAnonimo}</td>
                    <td className="px-4 py-3 text-gray-600">{formatFechaHora(f.horaEntrada)}</td>
                    <td className="px-4 py-3 text-gray-600">{f.horaSalida ? formatFechaHora(f.horaSalida) : '—'}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 font-medium">
                        {TIPOS_LABEL[f.tipo] ?? f.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {f.conGeolocalizacion ? (
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="text-green-primary">📍 Sí</span>
                          {f.mocked && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-50 text-red-primary font-semibold uppercase"
                              title="Ubicación simulada (Fake GPS) detectada">
                              ⚠️ Fake
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium
                        ${f.cerrado ? 'bg-green-light text-green-primary' : 'bg-blue-50 text-blue-primary'}`}>
                        {f.cerrado ? 'Completo' : 'En curso'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {f.modificado ? (
                        <span className="text-xs px-2 py-1 rounded-full bg-yellow-50 text-yellow-700 font-medium"
                          title="Modificado tras la creación">
                          ✏️ v{f.version}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">v1</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-[10px] text-gray-400 mt-4 italic">
        🔒 Los datos personales (nombre, DNI, teléfono, ubicación GPS exacta) están ocultos conforme al RGPD. Cada código identifica al mismo empleado a lo largo del tiempo, pero no permite identificar a la persona física.
      </p>
    </div>
  )
}

function formatFechaHora(s: string): string {
  if (!s) return '—'
  const d = new Date(s)
  if (isNaN(d.getTime())) return s
  return d.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}