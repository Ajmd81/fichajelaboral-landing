import { useState } from 'react'

export function ContactoPage() {
  const [form, setForm]       = useState({ nombre: '', email: '', motivo: '', mensaje: '' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')

  function update(field: string, value: string) {
    setForm(p => ({ ...p, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    // Simula envío — conecta aquí con Resend, Formspree, etc.
    await new Promise(r => setTimeout(r, 1200))
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="pt-16 min-h-screen bg-green-hero"
      style={{ backgroundImage: 'radial-gradient(circle, rgba(0,146,60,0.08) 1px, transparent 1px)', backgroundSize: '28px 28px' }}>

      <div className="max-w-4xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* INFO */}
          <div>
            <h1 className="font-display text-4xl text-gray-900 leading-tight mb-4">
              Hablemos de <span className="text-green-primary">tu empresa</span>
            </h1>
            <p className="text-gray-600 font-light leading-relaxed mb-10">
              Si tienes dudas sobre el producto, quieres una demo personalizada o necesitas ayuda con tu cuenta, estamos aquí.
            </p>

            <div className="space-y-4 mb-8">
              {[
                { icon: '✉️', label: 'Email general',       value: 'hola@fichajelaboral.com',        href: 'mailto:hola@fichajelaboral.com' },
                { icon: '🔒', label: 'Privacidad y datos',  value: 'privacidad@fichajelaboral.com',  href: 'mailto:privacidad@fichajelaboral.com' },
                { icon: '📞', label: 'Teléfono',            value: '+34 658 527 186',                href: 'tel:+34658527186' },
                { icon: '📍', label: 'Dirección',           value: 'Calle Ingeniero Ruiz de Azúa s/n Local 8, 14006 Córdoba', href: undefined },
              ].map(({ icon, label, value, href }) => (
                <div key={label} className="flex items-center gap-4 bg-white border border-gray-200 rounded-2xl px-5 py-4">
                  <div className="w-10 h-10 rounded-xl bg-green-light flex items-center justify-center text-lg flex-shrink-0">
                    {icon}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
                    {href
                      ? <a href={href} className="text-sm font-medium text-gray-900 no-underline hover:text-green-primary transition-colors">{value}</a>
                      : <p className="text-sm font-medium text-gray-900">{value}</p>
                    }
                  </div>
                </div>
              ))}
            </div>

            {/* Horario */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="font-display text-base text-gray-900 mb-4">Horario de atención</h3>
              {[
                { dia: 'Lunes – Viernes', hora: '9:00 – 18:00', cerrado: false },
                { dia: 'Sábado',          hora: '10:00 – 13:00', cerrado: false },
                { dia: 'Domingo',         hora: 'Cerrado',        cerrado: true },
              ].map(({ dia, hora, cerrado }) => (
                <div key={dia} className="flex justify-between py-2 border-b last:border-0 border-gray-100">
                  <span className="text-sm text-gray-600 font-light">{dia}</span>
                  <span className={`text-sm font-medium ${cerrado ? 'text-gray-400' : 'text-gray-900'}`}>{hora}</span>
                </div>
              ))}
            </div>
          </div>

          {/* FORMULARIO */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            {sent ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">📬</div>
                <h3 className="font-display text-2xl text-gray-900 mb-2">¡Mensaje recibido!</h3>
                <p className="text-sm text-gray-600 font-light">Te respondemos en menos de 24 horas en días laborables.</p>
              </div>
            ) : (
              <>
                <span className="inline-block bg-green-light text-green-primary text-xs font-medium px-3 py-1 rounded-full mb-3">Escríbenos</span>
                <h2 className="font-display text-2xl text-gray-900 mb-1">Envíanos un mensaje</h2>
                <p className="text-sm text-gray-400 font-light mb-7">Te respondemos en menos de 24 horas en días laborables.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Nombre</label>
                    <input type="text" className="input-field" placeholder="Tu nombre completo"
                      value={form.nombre} onChange={e => update('nombre', e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Email</label>
                    <input type="email" className="input-field" placeholder="tu@empresa.com"
                      value={form.email} onChange={e => update('email', e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Motivo</label>
                    <select className="input-field" value={form.motivo} onChange={e => update('motivo', e.target.value)} required>
                      <option value="">Selecciona un motivo…</option>
                      <option value="demo">Solicitar demo personalizada</option>
                      <option value="ventas">Información sobre precios</option>
                      <option value="soporte">Soporte técnico</option>
                      <option value="privacidad">Consulta sobre privacidad / datos</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Mensaje</label>
                    <textarea className="input-field resize-none h-28" placeholder="Cuéntanos en qué podemos ayudarte…"
                      value={form.mensaje} onChange={e => update('mensaje', e.target.value)} required />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-primary text-xs rounded-xl px-4 py-3">
                      {error}
                    </div>
                  )}

                  <button type="submit" disabled={loading}
                    className="w-full bg-green-primary text-white py-3 rounded-xl font-medium text-sm
                               hover:bg-green-dark transition-colors shadow-[0_4px_16px_rgba(0,146,60,0.28)]
                               disabled:opacity-60 disabled:cursor-not-allowed">
                    {loading ? 'Enviando…' : 'Enviar mensaje →'}
                  </button>
                </form>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}