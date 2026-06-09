import { useEffect, useState } from 'react'
import { api } from '../services/api'
import { isAdmin } from '../services/auth'

interface Fichaje {
  id: number
  empleadoNombre: string
  horaEntrada: string
  horaSalida?: string
  cerrado: boolean
  latitud?: number
  longitud?: number
}

export function FichajesPage() {
  const [fichajes, setFichajes] = useState<Fichaje[]>([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [filtro,   setFiltro]   = useState<'todos' | 'abiertos' | 'cerrados'>('todos')

  useEffect(() => {
    const endpoint = isAdmin() ? '/fichajes/equipo' : '/fichajes/mis-fichajes'
    api.get(endpoint)
      .then(r => setFichajes(r.data))
      .finally(() => setLoading(false))
  }, [])

  const filtered = fichajes
    .filter(f => filtro === 'todos' || (filtro === 'abiertos' ? !f.cerrado : f.cerrado))
    .filter(f => !search || f.empleadoNombre?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-gray-900 mb-1">Fichajes</h1>
        <p className="text-sm text-gray-500">{fichajes.length} registros en total</p>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        {isAdmin() && (
          <input
            type="text"
            className="input-field max-w-xs"
            placeholder="Buscar empleado…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        )}
        <div className="flex gap-2">
          {(['todos','abiertos','cerrados'] as const).map(f => (
            <button key={f} onClick={() => setFiltro(f)}
              className={`px-4 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer
                ${filtro === f
                  ? 'bg-green-primary text-white border-green-primary'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-green-primary hover:text-green-primary'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
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
                  {isAdmin() && <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Empleado</th>}
                  <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Entrada</th>
                  <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Salida</th>
                  <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Ubicación entrada</th>
                  <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Estado</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(f => (
                  <tr key={f.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    {isAdmin() && (
                      <td className="px-6 py-4 font-medium text-gray-900">{f.empleadoNombre}</td>
                    )}
                    <td className="px-6 py-4 text-gray-600">{f.horaEntrada ?? '—'}</td>
                    <td className="px-6 py-4 text-gray-600">{f.horaSalida  ?? '—'}</td>
                    <td className="px-6 py-4">
                      {f.latitud && f.longitud ? (
                        <a href={`https://maps.google.com/?q=${f.latitud},${f.longitud}`}
                          target="_blank" rel="noreferrer"
                          className="text-xs text-green-primary no-underline hover:underline flex items-center gap-1">
                          📍 Ver en mapa
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
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