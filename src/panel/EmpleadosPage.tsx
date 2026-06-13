import { useEffect, useState } from 'react'
import { api } from '../services/api'

interface Empleado {
  id: number
  nombre: string
  apellido: string
  dni?: string
  telefono?: string
  username: string
  role: string
  activo: boolean
  dispositivoVinculado: boolean
}

const EMPTY_FORM = { nombre: '', apellido: '', dni: '', telefono: '', username: '', password: '', role: 'EMPLOYEE' }

function traducirRol(role: string) {
  switch (role) {
    case 'EMPLOYEE': return 'Empleado'
    case 'ADMIN':    return 'Administrador'
    default:         return role
  }
}

export function EmpleadosPage() {
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [modal,     setModal]     = useState(false)
  const [form,      setForm]      = useState(EMPTY_FORM)
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState('')

  // Reset password modal
  const [resetTarget,    setResetTarget]    = useState<Empleado | null>(null)
  const [resetPassword,  setResetPassword]  = useState('')
  const [resetting,      setResetting]      = useState(false)
  const [copied,         setCopied]         = useState(false)

  function update(field: string, value: string) {
    setForm(p => ({ ...p, [field]: value }))
  }

  async function cargar() {
    setLoading(true)
    api.get('/empleados')
      .then(r => setEmpleados(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    void cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleCrear(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (form.role === 'EMPLOYEE' || form.telefono.trim()) {
      const telLimpio = form.telefono.replace(/[\s\-()]/g, '').replace(/^\+34/, '').replace(/^0034/, '')
      if (form.role === 'EMPLOYEE' && !telLimpio) {
        setError('El teléfono es obligatorio para los empleados (será su acceso a la app móvil).')
        return
      }
      if (telLimpio && !/^[67]\d{8}$/.test(telLimpio)) {
        setError('Teléfono inválido. Debe ser un móvil español (9 dígitos comenzando por 6 o 7).')
        return
      }
    }

    setSaving(true)
    try {
      await api.post('/empleados', form)
      setModal(false)
      setForm(EMPTY_FORM)
      await cargar()
    } catch (err: unknown) {
      const e = err as { response?: { status?: number; data?: { message?: string } } }
      const msg = e?.response?.data?.message ?? ''
      if (msg.includes('DEMO_LIMITE_EMPLEADOS')) {
        setError('Has alcanzado el límite de empleados del plan demo.')
      } else if (msg) {
        setError(msg)
      } else if (e?.response?.status === 409) {
        setError('Ya existe un usuario con ese email o teléfono en esta empresa.')
      } else {
        setError('Error al crear el empleado. Inténtalo de nuevo.')
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleDesactivar(id: number) {
    if (!confirm('¿Desactivar este empleado?')) return
    await api.patch('/empleados/' + id + '/desactivar')
    await cargar()
  }

  async function handleResetDispositivo(id: number) {
    if (!confirm('¿Desvincular el dispositivo de este empleado?')) return
    await api.delete('/empleados/' + id + '/dispositivo')
    await cargar()
  }

  // ── Reset password ──────────────────────────────────────────
  function abrirResetPassword(emp: Empleado) {
    setResetTarget(emp)
    setResetPassword('')
    setCopied(false)
  }

  async function confirmarResetPassword() {
    if (!resetTarget) return
    setResetting(true)
    try {
      const r = await api.post('/empleados/' + resetTarget.id + '/reset-password')
      setResetPassword(r.data.passwordTemporal)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      alert('Error al resetear: ' + (e?.response?.data?.message ?? 'desconocido'))
    } finally {
      setResetting(false)
    }
  }

  async function copiarPassword() {
    if (!resetPassword) return
    try {
      await navigator.clipboard.writeText(resetPassword)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      alert('No se pudo copiar al portapapeles')
    }
  }

  function cerrarResetModal() {
    setResetTarget(null)
    setResetPassword('')
    setCopied(false)
  }

  const filtered = empleados.filter(e =>
    (e.nombre + ' ' + e.apellido + ' ' + (e.dni ?? '') + ' ' + e.username + ' ' + (e.telefono ?? ''))
      .toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl text-gray-900 mb-1">Empleados</h1>
          <p className="text-sm text-gray-500">{empleados.filter(e => e.activo).length} activos de {empleados.length} total</p>
        </div>
        <button
          onClick={() => { setModal(true); setError('') }}
          className="bg-green-primary text-white px-5 py-2.5 rounded-xl text-sm font-medium
                     hover:bg-green-dark transition-colors shadow-[0_4px_16px_rgba(0,146,60,0.28)]
                     border-none cursor-pointer">
          + Nuevo empleado
        </button>
      </div>

      {/* Buscador */}
      <div className="mb-6">
        <input type="text" className="input-field max-w-sm"
          placeholder="Buscar por nombre, DNI, email o teléfono…"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Tabla */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-gray-400">Cargando…</div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-gray-400 mb-3">No hay empleados todavía.</p>
            <button onClick={() => setModal(true)}
              className="text-sm text-green-primary font-medium bg-transparent border-none cursor-pointer hover:underline">
              Crear el primer empleado →
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Empleado</th>
                  <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Teléfono</th>
                  <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Email</th>
                  <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Rol</th>
                  <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Dispositivo</th>
                  <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Estado</th>
                  <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(e => (
                  <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-light flex items-center justify-center
                                        text-green-primary text-xs font-medium flex-shrink-0">
                          {e.nombre[0]}{e.apellido[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{e.nombre} {e.apellido}</p>
                          {e.dni && <p className="text-xs text-gray-400">{e.dni}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {e.telefono ? (
                        <span className="font-mono text-xs">{e.telefono}</span>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-xs">{e.username}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium
                        ${e.role === 'ADMIN' ? 'bg-blue-50 text-blue-primary' : 'bg-gray-100 text-gray-600'}`}>
                        {traducirRol(e.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {e.dispositivoVinculado ? (
                        <span className="text-xs text-green-primary flex items-center gap-1">📱 Vinculado</span>
                      ) : (
                        <span className="text-xs text-gray-400">Sin vincular</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium
                        ${e.activo ? 'bg-green-light text-green-primary' : 'bg-red-50 text-red-primary'}`}>
                        {e.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {e.activo && (
                          <button onClick={() => abrirResetPassword(e)}
                            className="text-xs text-gray-400 hover:text-blue-primary transition-colors
                                       bg-transparent border-none cursor-pointer"
                            title="Resetear contraseña">
                            🔑
                          </button>
                        )}
                        {e.dispositivoVinculado && (
                          <button onClick={() => handleResetDispositivo(e.id)}
                            className="text-xs text-gray-400 hover:text-orange-500 transition-colors
                                       bg-transparent border-none cursor-pointer"
                            title="Desvincular dispositivo">
                            📵
                          </button>
                        )}
                        {e.activo && (
                          <button onClick={() => handleDesactivar(e.id)}
                            className="text-xs text-gray-400 hover:text-red-primary transition-colors
                                       bg-transparent border-none cursor-pointer"
                            title="Desactivar empleado">
                            🚫
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal crear empleado */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl text-gray-900">Nuevo empleado</h2>
              <button onClick={() => { setModal(false); setForm(EMPTY_FORM); setError('') }}
                className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer text-xl">
                ✕
              </button>
            </div>

            <form onSubmit={handleCrear} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Nombre</label>
                  <input type="text" className="input-field" placeholder="Juan"
                    value={form.nombre} onChange={e => update('nombre', e.target.value)} required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Apellido</label>
                  <input type="text" className="input-field" placeholder="García"
                    value={form.apellido} onChange={e => update('apellido', e.target.value)} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">DNI</label>
                  <input type="text" className="input-field" placeholder="12345678A"
                    value={form.dni} onChange={e => update('dni', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Rol</label>
                  <select className="input-field" value={form.role} onChange={e => update('role', e.target.value)}>
                    <option value="EMPLOYEE">Empleado</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Teléfono móvil {form.role === 'EMPLOYEE' && <span className="text-red-primary">*</span>}
                </label>
                <input type="tel" className="input-field" placeholder="600 123 456"
                  value={form.telefono} onChange={e => update('telefono', e.target.value)}
                  required={form.role === 'EMPLOYEE'} />
                {form.role === 'EMPLOYEE' && (
                  <p className="text-[10px] text-gray-400 mt-1">El empleado iniciará sesión en la app móvil con este número.</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Email {form.role === 'ADMIN' ? <span className="text-red-primary">*</span> : <span className="text-gray-400 font-normal">(opcional)</span>}
                </label>
                <input type="email" className="input-field" placeholder="juan@tuempresa.com"
                  value={form.username} onChange={e => update('username', e.target.value)} required />
                {form.role === 'ADMIN' && (
                  <p className="text-[10px] text-gray-400 mt-1">El administrador inicia sesión en el panel web con este email.</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Contraseña inicial</label>
                <input type="password" className="input-field" placeholder="Mínimo 6 caracteres"
                  value={form.password} onChange={e => update('password', e.target.value)} required />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-primary text-xs rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button"
                  onClick={() => { setModal(false); setForm(EMPTY_FORM); setError('') }}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm
                             hover:border-gray-300 transition-colors bg-white cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-green-primary text-white py-2.5 rounded-xl text-sm font-medium
                             hover:bg-green-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed
                             border-none cursor-pointer">
                  {saving ? 'Creando…' : 'Crear empleado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal resetear contraseña */}
      {resetTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display text-xl text-gray-900">Resetear contraseña</h2>
              <button onClick={cerrarResetModal}
                className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer text-xl">
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              Empleado: <strong>{resetTarget.nombre} {resetTarget.apellido}</strong>
            </p>

            {!resetPassword ? (
              <>
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 mb-5">
                  <p className="text-xs text-yellow-800 leading-relaxed">
                    Se generará una contraseña temporal nueva. La anterior dejará de funcionar inmediatamente.
                    Comunícasela al empleado por un canal seguro — solo la verás una vez.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={cerrarResetModal}
                    className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm
                               hover:border-gray-300 transition-colors bg-white cursor-pointer">
                    Cancelar
                  </button>
                  <button onClick={confirmarResetPassword} disabled={resetting}
                    className="flex-1 bg-blue-primary text-white py-2.5 rounded-xl text-sm font-medium
                               hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed
                               border-none cursor-pointer">
                    {resetting ? 'Generando…' : 'Generar nueva contraseña'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="bg-green-light border border-green-primary rounded-xl px-5 py-4 mb-3">
                  <p className="text-[10px] text-green-dark uppercase tracking-wide mb-2 font-medium">
                    Contraseña temporal
                  </p>
                  <p className="font-mono text-2xl text-gray-900 tracking-wider select-all break-all">
                    {resetPassword}
                  </p>
                </div>

                <p className="text-[10px] text-gray-400 mb-5 italic">
                  ⚠️ Esta contraseña no se volverá a mostrar. Cópiala ahora y entrégasela al empleado.
                </p>

                <div className="flex gap-3">
                  <button onClick={copiarPassword}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors border-none cursor-pointer
                      ${copied
                        ? 'bg-green-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    {copied ? '✓ Copiada' : '📋 Copiar al portapapeles'}
                  </button>
                  <button onClick={cerrarResetModal}
                    className="flex-1 bg-green-primary text-white py-2.5 rounded-xl text-sm font-medium
                               hover:bg-green-dark transition-colors border-none cursor-pointer">
                    Cerrar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}