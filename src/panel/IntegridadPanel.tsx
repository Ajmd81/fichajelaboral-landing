import { useEffect, useState } from 'react'
import { api } from '../services/api'

type TipoIncidencia = 'HASH_MISMATCH' | 'CADENA_ROTA' | 'MODIFICACION_SIN_AUDIT'

interface FichajeCorrupto {
  fichajeId: number
  empleadoId: number
  empleadoNombre: string
  horaEntrada: string
  version: number
  tipo: TipoIncidencia
  hashEsperado?: string
  hashAlmacenado?: string
  descripcion: string
}

interface IntegridadResultado {
  empresaId: number
  empresaNombre: string
  fecha: string
  totalFichajes: number
  totalCorruptos: number
  cadenaIntegra: boolean
  incidencias: FichajeCorrupto[]
}

interface HistorialItem {
  id: number
  fecha: string
  totalFichajes: number
  totalCorruptos: number
  cadenaIntegra: boolean
  automatica: boolean
}

const TIPO_LABEL: Record<TipoIncidencia, string> = {
  HASH_MISMATCH:           'Hash no coincide',
  CADENA_ROTA:             'Cadena rota',
  MODIFICACION_SIN_AUDIT:  'Modificación sin audit log',
}

const TIPO_COLOR: Record<TipoIncidencia, string> = {
  HASH_MISMATCH:           'bg-red-50 text-red-primary',
  CADENA_ROTA:             'bg-orange-50 text-orange-700',
  MODIFICACION_SIN_AUDIT:  'bg-yellow-50 text-yellow-700',
}

export function IntegridadPage() {
  const [resultado, setResultado] = useState<IntegridadResultado | null>(null)
  const [historial, setHistorial] = useState<HistorialItem[]>([])
  const [verificando, setVerificando] = useState(false)
  const [loadingHist, setLoadingHist] = useState(true)
  const [error, setError] = useState('')

  async function cargarHistorial() {
    setLoadingHist(true)
    try {
      const r = await api.get('/verificacion/integridad/historial')
      setHistorial(r.data)
    } catch {
      // silencioso
    } finally {
      setLoadingHist(false)
    }
  }

  useEffect(() => {
    void cargarHistorial()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function verificarAhora() {
    setVerificando(true)
    setError('')
    try {
      const r = await api.get('/verificacion/integridad')
      setResultado(r.data)
      await cargarHistorial()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setError(e?.response?.data?.message ?? 'Error al verificar la integridad')
    } finally {
      setVerificando(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-gray-900 mb-1">Verificación de integridad</h1>
        <p className="text-sm text-gray-500">
          Recalcula la cadena hash SHA-256 de todos los fichajes para detectar manipulaciones directas en la base de datos · Conforme Ley Control Horario 2026
        </p>
      </div>

      {/* Banner acción */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <div className="flex items-start gap-5 flex-wrap">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl flex-shrink-0">
            🛡️
          </div>
          <div className="flex-1 min-w-[200px]">
            <h2 className="font-display text-lg text-gray-900 mb-1">Auditoría de cadena hash</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Cada fichaje incluye un hash SHA-256 que se enlaza con el anterior del mismo empleado.
              Si alguien modifica los datos directamente en la BBDD, la cadena se rompe y este sistema lo detecta.
              También se ejecuta automáticamente cada noche a las 03:00.
            </p>
          </div>
          <button onClick={verificarAhora} disabled={verificando}
            className="bg-green-primary text-white px-6 py-3 rounded-xl text-sm font-medium
                       hover:bg-green-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                       shadow-[0_4px_16px_rgba(0,146,60,0.28)] border-none cursor-pointer">
            {verificando ? 'Verificando…' : '▶ Verificar ahora'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-primary text-sm rounded-2xl px-5 py-4 mb-6">
          {error}
        </div>
      )}

      {/* Resultado de la última verificación */}
      {resultado && (
        <div className="mb-6">
          <h2 className="font-display text-base text-gray-900 mb-3">Última verificación</h2>

          <div className={`rounded-2xl p-6 mb-4 border
            ${resultado.cadenaIntegra
              ? 'bg-green-light border-green-primary'
              : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="text-4xl">{resultado.cadenaIntegra ? '✓' : '⚠️'}</div>
              <div className="flex-1">
                <p className={`font-display text-2xl mb-1
                  ${resultado.cadenaIntegra ? 'text-green-primary' : 'text-red-primary'}`}>
                  {resultado.cadenaIntegra
                    ? 'Cadena íntegra'
                    : resultado.totalCorruptos + ' incidencia' + (resultado.totalCorruptos !== 1 ? 's' : '') + ' detectada' + (resultado.totalCorruptos !== 1 ? 's' : '')}
                </p>
                <p className="text-sm text-gray-700">
                  {resultado.totalFichajes} fichajes verificados · {new Date(resultado.fecha).toLocaleString('es-ES')}
                </p>
              </div>
            </div>
          </div>

          {/* Tabla de incidencias */}
          {resultado.incidencias.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Fichaje</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Empleado</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Entrada</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">V</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Tipo</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Detalle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultado.incidencias.map(i => (
                      <tr key={i.fichajeId + '-' + i.tipo} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-gray-900">#{i.fichajeId}</td>
                        <td className="px-4 py-3 text-gray-900 font-medium">{i.empleadoNombre}</td>
                        <td className="px-4 py-3 text-gray-600">{formatFechaHora(i.horaEntrada)}</td>
                        <td className="px-4 py-3 text-xs text-gray-400">v{i.version}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${TIPO_COLOR[i.tipo]}`}>
                            {TIPO_LABEL[i.tipo]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600 max-w-md">
                          {i.descripcion}
                          {i.hashEsperado && i.hashAlmacenado && (
                            <details className="mt-1 text-[10px] text-gray-400 font-mono break-all">
                              <summary className="cursor-pointer">Ver hashes</summary>
                              <div className="mt-1">Esperado: {i.hashEsperado.substring(0, 32)}…</div>
                              <div>Almacenado: {i.hashAlmacenado.substring(0, 32)}…</div>
                            </details>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Histórico */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-display text-base text-gray-900">Histórico (últimas 10)</h2>
        </div>
        {loadingHist ? (
          <div className="px-6 py-12 text-center text-sm text-gray-400">Cargando…</div>
        ) : historial.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-400">
            Aún no se ha ejecutado ninguna verificación. Pulsa "Verificar ahora" o espera al chequeo automático nocturno.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left  px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Fecha</th>
                  <th className="text-left  px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Tipo</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Verificados</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Corruptos</th>
                  <th className="text-left  px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Resultado</th>
                </tr>
              </thead>
              <tbody>
                {historial.map(h => (
                  <tr key={h.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700">{new Date(h.fecha).toLocaleString('es-ES')}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium
                        ${h.automatica ? 'bg-blue-50 text-blue-primary' : 'bg-gray-100 text-gray-600'}`}>
                        {h.automatica ? '🌙 Automática' : '🖱 Manual'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900">{h.totalFichajes}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={h.totalCorruptos > 0 ? 'text-red-primary font-semibold' : 'text-gray-400'}>
                        {h.totalCorruptos}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {h.cadenaIntegra ? (
                        <span className="text-xs text-green-primary font-medium">✓ Íntegra</span>
                      ) : (
                        <span className="text-xs text-red-primary font-medium">⚠️ Manipulación</span>
                      )}
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

function formatFechaHora(s: string): string {
  if (!s) return '—'
  const d = new Date(s)
  if (isNaN(d.getTime())) return s
  return d.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}