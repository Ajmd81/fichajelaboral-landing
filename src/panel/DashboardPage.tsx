import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../services/api'
import { getSession, isAdmin } from '../services/auth'
import { useDemoStatus } from '../hooks/useDemoStatus'

interface Fichaje {
  id: number
  empleadoNombre: string
  horaEntrada: string
  horaSalida?: string
  cerrado: boolean
  latitud?: number
  longitud?: number
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: number | string; color: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ background: color + '18', color }}>
        {icon}
      </div>
      <div>
        <p className="font-display text-2xl text-gray-900 leading-none mb-1">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  )
}

export function DashboardPage() {
  useParams<{ slug: string }>()
  const session = getSession()
  const { isDemo, diasRestantes } = useDemoStatus()
  const [empleados, setEmpleados] = useState<any[]>([])
  const [fichajes,  setFichajes]  = useState<Fichaje[]>([])

  useEffect(() => {
    if (isAdmin()) {
      api.get('/empleados').then(r => setEmpleados(r.data)).catch(() => {})
      api.get('/fichajes/equipo').then(r => setFichajes(r.data)).catch(() => {})
    } else {
      api.get('/fichajes/mis-fichajes').then(r => setFichajes(r.data)).catch(() => {})
    }
  }, [])

  const hoy = new Date().toISOString().slice(0, 10)
  const fichajesHoy = fichajes.filter(f => f.horaEntrada?.startsWith(hoy))

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl text-gray-900 mb-1">
          Bienvenido, {session?.username} 👋
        </h1>
        <p className="text-gray-500 text-sm">{session?.empresaNombre}</p>
      </div>

      {/* Demo alert */}
      {isDemo && diasRestantes !== undefined && diasRestantes <= 3 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 mb-6 flex items-start gap-3">
          <span className="text-lg">⚠️</span>
          <div>
            <p className="text-sm font-medium text-red-primary mb-0.5">
              Tu periodo de demo expira en {diasRestantes} {diasRestantes === 1 ? 'día' : 'días'}
            </p>
            <p className="text-xs text-gray-600 font-light">
              Activa tu licencia para no perder el acceso a tu panel.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isAdmin() && (
          <StatCard icon="👥" label="Empleados activos" value={empleados.filter(e => e.activo).length} color="#0081CF" />
        )}
        <StatCard icon="🕐" label="Fichajes totales"  value={fichajes.length}    color="#00923C" />
        <StatCard icon="✅" label="Fichajes hoy"       value={fichajesHoy.length} color="#d97706" />
        {isDemo && (
          <StatCard icon="⏳" label="Días de demo restantes"
            value={diasRestantes ?? 0}
            color={(diasRestantes ?? 0) <= 3 ? '#D2514E' : '#0081CF'} />
        )}
      </div>

      {/* Tabla últimos fichajes */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-display text-base text-gray-900">
            {isAdmin() ? 'Últimos fichajes del equipo' : 'Mis últimos fichajes'}
          </h2>
        </div>

        {fichajes.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-gray-400">Sin fichajes registrados todavía.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {isAdmin() && <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Empleado</th>}
                  <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Entrada</th>
                  <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Salida</th>
                  <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Ubicación</th>
                  <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Estado</th>
                </tr>
              </thead>
              <tbody>
                {fichajes.slice(0, 10).map(f => (
                  <tr key={f.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    {isAdmin() && <td className="px-6 py-3 font-medium text-gray-900">{f.empleadoNombre}</td>}
                    <td className="px-6 py-3 text-gray-600">{f.horaEntrada ?? '—'}</td>
                    <td className="px-6 py-3 text-gray-600">{f.horaSalida  ?? '—'}</td>
                    <td className="px-6 py-3">
                      {f.latitud && f.longitud ? (
                        <a href={`https://maps.google.com/?q=${f.latitud},${f.longitud}`}
                          target="_blank" rel="noreferrer"
                          className="text-xs text-green-primary no-underline hover:underline flex items-center gap-1">
                          📍 Ver mapa
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium
                        ${f.cerrado
                          ? 'bg-green-light text-green-primary'
                          : 'bg-blue-50 text-blue-primary'}`}>
                        {f.cerrado ? 'Completo' : 'En curso'}
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