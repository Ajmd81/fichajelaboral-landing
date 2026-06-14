import { useEffect, useState } from 'react'
import { api } from '../services/api'

interface ResumenEmpresa {
  empresaNombre: string
  anio: number
  mes: number
  empleadosTotales: number
  empleadosActivos: number
  horasOrdinariasTotal: number
  horasExtrasDiurnasTotal: number
  horasExtrasNocturnasTotal: number
  mediaHorasPorEmpleado: number
  empleadosAlLimiteExtras: number
  fichajesModificados: number
  vacacionesAprobadasMes: number
  vacacionesPendientes: number
  vacacionesRechazadas: number
}

interface EmpleadoAnonimo {
  codigoAnonimo: string
  horasContratadasDia: number
  horasOrdinarias: number
  horasExtrasDiurnas: number
  horasExtrasNocturnas: number
  totalHoras: number
  extrasAcumuladasAnio: number
  limiteAnualSuperado: boolean
}

interface IntegridadResumen {
  fecha: string
  totalFichajes: number
  totalCorruptos: number
  cadenaIntegra: boolean
}

const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
]

export function RltResumenPage() {
  const hoy = new Date()
  const [anio, setAnio] = useState(hoy.getFullYear())
  const [mes,  setMes]  = useState(hoy.getMonth() + 1)
  const [resumen,  setResumen]  = useState<ResumenEmpresa | null>(null)
  const [empleados, setEmpleados] = useState<EmpleadoAnonimo[]>([])
  const [integridad, setIntegridad] = useState<IntegridadResumen | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  async function cargar() {
    setLoading(true)
    setError('')
    try {
      const [r, e, i] = await Promise.all([
        api.get('/rlt/resumen',   { params: { anio, mes } }),
        api.get('/rlt/empleados', { params: { anio, mes } }),
        api.get('/verificacion/integridad/resumen'),
      ])
      setResumen(r.data)
      setEmpleados(e.data)
      setIntegridad(i.data)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setError(e?.response?.data?.message ?? 'Error cargando datos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anio, mes])

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1 flex-wrap">
          <h1 className="font-display text-3xl text-gray-900">Resumen empresa</h1>
          <span className="bg-purple-50 text-purple-700 text-[10px] px-2.5 py-1 rounded-full font-medium uppercase tracking-wide">
            🔒 Anonimizado
          </span>
        </div>
        <p className="text-sm text-gray-500">
          Datos agregados de la empresa · Sin identificación personal · Cumplimiento Art. 35 ET
        </p>
      </div>

      {/* Selector */}
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

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-2xl px-6 py-12 text-center text-sm text-gray-400">Cargando…</div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-primary text-sm rounded-2xl px-5 py-4">{error}</div>
      ) : resumen && (
        <>
          {/* Stats globales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Stat icon="👥" label="Empleados activos"  value={String(resumen.empleadosActivos)}        color="#5A6475" />
            <Stat icon="🕐" label="Horas ordinarias"    value={resumen.horasOrdinariasTotal.toFixed(1) + ' h'} color="#00923C" />
            <Stat icon="☀️" label="Extras diurnas"      value={resumen.horasExtrasDiurnasTotal.toFixed(1) + ' h'} color="#0081CF" />
            <Stat icon="🌙" label="Extras nocturnas"    value={resumen.horasExtrasNocturnasTotal.toFixed(1) + ' h'} color="#6B46C1" />
          </div>

          {/* Alertas de cumplimiento */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <AlertCard
              icon="⚠️"
              count={resumen.empleadosAlLimiteExtras}
              label="empleados al límite anual de extras"
              detail={resumen.empleadosAlLimiteExtras > 0
                ? 'Han alcanzado las 80h anuales (Art. 35.2 ET). Sus fichajes están bloqueados hasta el siguiente año natural.'
                : 'Ningún empleado ha superado el límite legal de 80 horas extras anuales.'}
              alert={resumen.empleadosAlLimiteExtras > 0}
            />
            <AlertCard
              icon="✏️"
              count={resumen.fichajesModificados}
              label="fichajes modificados este mes"
              detail="Todas las modificaciones quedan registradas en el audit log con motivo obligatorio (sellado hash inmutable)."
              alert={resumen.fichajesModificados > 5}
            />
          </div>

          {/* Integridad de la cadena hash */}
        {integridad && (
        <div className={`rounded-2xl p-5 mb-6 border
            ${integridad.cadenaIntegra
            ? 'bg-green-light border-green-primary'
            : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center gap-4 flex-wrap">
            <div className="text-3xl">{integridad.cadenaIntegra ? '🛡️' : '⚠️'}</div>
            <div className="flex-1">
                <p className={`font-display text-lg mb-0.5
                ${integridad.cadenaIntegra ? 'text-green-primary' : 'text-red-primary'}`}>
                {integridad.cadenaIntegra
                    ? 'Cadena hash íntegra'
                    : integridad.totalCorruptos + ' fichaje' + (integridad.totalCorruptos !== 1 ? 's' : '') + ' manipulado' + (integridad.totalCorruptos !== 1 ? 's' : '') + ' detectado' + (integridad.totalCorruptos !== 1 ? 's' : '')}
                </p>
                <p className="text-xs text-gray-700">
                {integridad.totalFichajes} fichajes verificados · {new Date(integridad.fecha).toLocaleString('es-ES')}
                </p>
            </div>
            </div>
        </div>
        )}

          {/* Vacaciones */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
            <h2 className="font-display text-base text-gray-900 mb-4">Vacaciones del periodo</h2>
            <div className="grid grid-cols-3 gap-4">
              <VacRow color="#00923C" bg="bg-green-light"  label="Aprobadas en el mes" value={resumen.vacacionesAprobadasMes} />
              <VacRow color="#B07300" bg="bg-yellow-50"    label="Pendientes (totales)" value={resumen.vacacionesPendientes} />
              <VacRow color="#D2514E" bg="bg-red-50"       label="Rechazadas (totales)" value={resumen.vacacionesRechazadas} />
            </div>
          </div>

          {/* Tabla empleados anonimizados */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
              <h2 className="font-display text-base text-gray-900">Detalle por empleado (anónimo)</h2>
              <p className="text-xs text-gray-400">Cada código representa al mismo empleado a lo largo del tiempo</p>
            </div>
            {empleados.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-gray-400">Sin datos.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left  px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Código</th>
                      <th className="text-right px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Jornada/día</th>
                      <th className="text-right px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Ordinarias</th>
                      <th className="text-right px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Ext. diurnas</th>
                      <th className="text-right px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Ext. nocturnas</th>
                      <th className="text-right px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Total mes</th>
                      <th className="text-right px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Extras año</th>
                    </tr>
                  </thead>
                  <tbody>
                    {empleados.map(e => (
                      <tr key={e.codigoAnonimo} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-gray-900">{e.codigoAnonimo}</td>
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
        </>
      )}
    </div>
  )
}

function Stat({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
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

function AlertCard({ icon, count, label, detail, alert }: { icon: string; count: number; label: string; detail: string; alert: boolean }) {
  return (
    <div className={`border rounded-2xl p-5
      ${alert ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
      <div className="flex items-start gap-3 mb-2">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className={`font-display text-2xl leading-none ${alert ? 'text-red-primary' : 'text-gray-900'}`}>
            {count}
          </p>
          <p className="text-sm text-gray-700 mt-1">{label}</p>
        </div>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-2">{detail}</p>
    </div>
  )
}

function VacRow({ color, bg, label, value }: { color: string; bg: string; label: string; value: number }) {
  return (
    <div className={`${bg} rounded-xl p-4`}>
      <p className="font-display text-2xl leading-none" style={{ color }}>{value}</p>
      <p className="text-xs text-gray-600 mt-1">{label}</p>
    </div>
  )
}