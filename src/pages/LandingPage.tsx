import { Link } from 'react-router-dom'
import { useState } from 'react'


// ── FAQ Item ──────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-gray-200 py-5">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center gap-4 text-left
                   text-sm font-medium text-gray-900 bg-transparent border-none cursor-pointer p-0"
      >
        <span>{q}</span>
        <span className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0
                          text-base transition-all duration-200
                          ${open ? 'bg-green-light text-green-primary rotate-45' : 'bg-gray-100 text-gray-600'}`}>
          +
        </span>
      </button>
      {open && (
        <p className="mt-3 text-sm text-gray-600 font-light leading-relaxed">{a}</p>
      )}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────
export function LandingPage() {
  return (
    <div className="overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="relative pt-36 pb-24 text-center bg-green-hero overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(0,146,60,0.08) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 bg-green-primary/10 border border-green-primary/20
                          text-green-dark text-xs font-medium px-4 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green-primary" />
            15 días gratis · Sin tarjeta de crédito
          </div>

          <h1 className="font-display text-5xl md:text-6xl text-gray-900 leading-tight mb-6">
            El fichaje laboral que<br />
            <em className="not-italic text-green-primary">tu equipo</em> usará
          </h1>

          <p className="text-lg text-gray-600 font-light leading-relaxed max-w-lg mx-auto mb-10">
            Registra entradas y salidas con ubicación GPS verificada.
            Cada empleado ficha solo él mismo — desde el móvil, en tiempo real.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/registro" className="btn-primary">
              Empezar gratis →
            </Link>
            <a href="#features" className="btn-secondary">
              Ver funciones →
            </a>
          </div>

          <p className="mt-5 text-xs text-gray-400">
            <strong className="text-green-primary font-medium">✓ 15 días sin límites</strong>
            &nbsp;·&nbsp; Activa la licencia cuando quieras
          </p>
        </div>

        {/* Mockup */}
        <div className="relative z-10 max-w-3xl mx-auto px-6 mt-16">
          <div className="bg-gray-900 rounded-2xl p-2.5 shadow-2xl">
            <div className="bg-[#1E2736] rounded-t-xl px-4 py-2.5 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D2514E]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#F5A623]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#00923C]" />
            </div>
            <div className="bg-gray-50 rounded-b-xl overflow-hidden">
              <div className="grid grid-cols-[180px_1fr]">
                {/* Sidebar */}
                <div className="bg-white border-r border-gray-200 py-4 hidden sm:block">
                  <div className="px-4 pb-3 mb-2 border-b border-gray-100 font-display text-xs text-green-primary">
                    FichajesLaborales
                  </div>
                  {['Panel','Empleados','Fichajes','Informes','Ajustes'].map((item, i) => (
                    <div key={item} className={`px-4 py-2 text-xs flex items-center gap-2
                      ${i === 0 ? 'bg-green-light text-green-primary font-medium border-r-2 border-green-primary' : 'text-gray-500'}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {item}
                    </div>
                  ))}
                </div>
                {/* Content */}
                <div className="p-4">
                  <p className="font-display text-xs text-gray-900 mb-3">Panel de hoy — {new Date().toLocaleDateString('es-ES', { weekday:'long', day:'2-digit', month:'short', year:'numeric' })}</p>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[['Activos','12','text-blue-primary'],['A tiempo','10','text-green-primary'],['Incidencias','2','text-red-primary']].map(([label, val, color]) => (
                      <div key={label} className="bg-white border border-gray-200 rounded-lg p-2.5">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">{label}</p>
                        <p className={`font-display text-xl ${color}`}>{val}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="grid grid-cols-[1.4fr_.8fr_.8fr_1.1fr_.8fr] bg-gray-100 px-3 py-1.5">
                      {['Empleado','Entrada','Salida','Ubicación','Estado'].map(h => (
                        <span key={h} className="text-[9px] text-gray-400 uppercase tracking-wide font-medium">{h}</span>
                      ))}
                    </div>
                    {[
                      ['Ana García','08:02','—','📍 Sede Central','in'],
                      ['Carlos Ruiz','08:15','—','📍 Almacén Norte','in'],
                      ['Marta López','—','—','Sin fichar','out'],
                      ['Pedro Sanz','09:01','—','📍 Sede Central','in'],
                    ].map(([name, entrada, salida, ubicacion, status]) => (
                      <div key={name} className="grid grid-cols-[1.4fr_.8fr_.8fr_1.1fr_.8fr] px-3 py-2 border-t border-gray-100 items-center even:bg-gray-50">
                        <span className="text-[11px] font-medium text-gray-900">{name}</span>
                        <span className="text-[10px] text-gray-500">{entrada}</span>
                        <span className="text-[10px] text-gray-500">{salida}</span>
                        <span className={`text-[10px] ${status === 'in' ? 'text-green-primary' : 'text-gray-400'}`}>{ubicacion}</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium w-fit
                          ${status === 'in' ? 'bg-green-light text-green-primary' : 'bg-red-50 text-red-primary'}`}>
                          {status === 'in' ? 'Activo' : 'Pendiente'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── LOGOS ── */}
      <div className="py-10 px-8 border-y border-gray-100 text-center">
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-5">Empresas que ya controlan su horario</p>
        <div className="flex items-center justify-center gap-10 flex-wrap">
          {['AutoTaller Gómez','Clínica BioSalud','Logística Rápida','Cafetería Central','Obras & Reformas MT'].map(n => (
            <span key={n} className="font-display text-gray-300 text-base">{n}</span>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 px-8 max-w-5xl mx-auto">
        <p className="section-tag mb-2">Funciones</p>
        <h2 className="section-title mb-4">Todo lo que necesitas,<br />nada que no uses</h2>
        <p className="section-sub max-w-lg mb-14">Diseñado para pymes que quieren cumplir con el registro horario sin complicarse la vida.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Tarjeta destacada GPS */}
          <div className="col-span-full border-2 border-green-primary rounded-2xl p-8 bg-green-hero">
            <div className="flex items-start gap-5 flex-wrap">
              <div className="w-12 h-12 rounded-xl bg-green-light flex items-center justify-center text-xl flex-shrink-0">📍</div>
              <div>
                <span className="inline-block bg-green-light text-green-primary text-[10px] font-semibold
                                 px-2.5 py-0.5 rounded-full uppercase tracking-wide mb-2">Función clave</span>
                <h3 className="font-display text-lg text-gray-900 mb-2">
                  Fichaje con geolocalización — cada empleado sólo puede fichar él mismo
                </h3>
                <p className="text-sm text-gray-600 font-light leading-relaxed">
                  Al fichar desde la app, el sistema registra automáticamente la <strong className="text-gray-900 font-medium">ubicación GPS del empleado</strong> en ese momento.
                  El administrador ve exactamente <strong className="text-gray-900 font-medium">dónde estaba cada persona</strong> al entrar y al salir.
                  No hay delegación posible: el fichaje está vinculado al dispositivo y a la sesión personal del empleado,
                  garantizando que <strong className="text-gray-900 font-medium">nadie puede fichar por otro</strong>.
                </p>
              </div>
            </div>
          </div>

          {[
            { icon: '📱', color: 'bg-blue-50', title: 'App móvil nativa',       desc: 'iOS y Android. Un toque para fichar. La app solicita la ubicación en el momento del fichaje — sin ubicación, no hay fichaje.' },
            { icon: '⏱️', color: 'bg-green-light', title: 'Panel en tiempo real', desc: 'Ve en directo quién está trabajando, desde dónde fichó, quién ha llegado tarde y quién aún no ha registrado entrada.' },
            { icon: '📊', color: 'bg-blue-50', title: 'Informes exportables',    desc: 'Exporta horas y ubicaciones de cada empleado en PDF o Excel para RRHH, nóminas o auditorías laborales.' },
            { icon: '👥', color: 'bg-green-light', title: 'Multi-empleado',       desc: 'Gestiona equipos de cualquier tamaño. Roles diferenciados: administrador, responsable y empleado.' },
            { icon: '🔔', color: 'bg-red-50',  title: 'Alertas de incidencia',   desc: 'Notificaciones automáticas cuando un empleado llega tarde, supera horas o no cierra su jornada.' },
            { icon: '🔒', color: 'bg-blue-50', title: 'Multi-empresa seguro',    desc: 'Cada empresa tiene su propio espacio aislado. Tus datos son solo tuyos, cifrados y en Europa.' },
          ].map(({ icon, color, title, desc }) => (
            <div key={title}
              className="border border-gray-200 rounded-2xl p-8 hover:border-green-primary
                         hover:-translate-y-1 hover:shadow-md transition-all duration-200 bg-white">
              <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center text-xl mb-5`}>{icon}</div>
              <h3 className="font-display text-base text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-600 font-light leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section className="bg-green-hero py-24 px-8"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(0,146,60,0.08) 1px, transparent 1px)', backgroundSize: '28px 28px' }}>
        <div className="max-w-5xl mx-auto">
          <p className="section-tag mb-2">Cómo funciona</p>
          <h2 className="section-title mb-3">En marcha en menos de 10 minutos</h2>
          <p className="section-sub mb-14">Sin instalaciones, sin IT, sin contratos.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { n:'01', title:'Crea tu empresa',     desc:'Regístrate, pon el nombre de tu empresa y configura tu perfil de administrador.' },
              { n:'02', title:'Añade empleados',      desc:'Invítalos por email o dales acceso directamente. Cada uno recibe sus credenciales al instante.' },
              { n:'03', title:'Fichad con ubicación', desc:'Al fichar desde la app, se registra la hora exacta y la ubicación GPS. Cada empleado solo puede fichar él mismo.' },
              { n:'04', title:'Controla y exporta',   desc:'Desde el panel web tienes visibilidad total y puedes generar informes con un clic.' },
            ].map(({ n, title, desc }) => (
              <div key={n}>
                <p className="font-display text-5xl text-green-primary/20 leading-none mb-2">{n}</p>
                <h3 className="font-display text-base text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-600 font-light leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-24 px-8 max-w-5xl mx-auto text-center">
        <p className="section-tag mb-2">Precios</p>
        <h2 className="section-title mb-3">Un precio justo, sin sorpresas</h2>
        <p className="section-sub mb-14 max-w-md mx-auto">Empieza gratis. Activa la licencia cuando estés convencido.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Free */}
          <div className="border border-gray-200 rounded-2xl p-10 text-left hover:-translate-y-1 hover:shadow-md transition-all duration-200">
            <h3 className="font-display text-xl text-gray-900 mb-1">Prueba gratuita</h3>
            <p className="text-xs text-gray-400 mb-5">Sin tarjeta · Sin compromiso</p>
            <p className="font-display text-5xl text-gray-900 leading-none mb-1">0<sup className="text-2xl">€</sup></p>
            <p className="text-xs text-gray-400 mb-8">durante 15 días</p>
            <ul className="space-y-3 mb-8">
              {['Empleados ilimitados','App iOS y Android','Panel web completo','Soporte por email'].map(f => (
                <li key={f} className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="text-green-primary font-bold">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link to="/registro" className="block text-center border border-gray-200 text-gray-900 py-3
                                            rounded-xl text-sm font-medium hover:border-green-primary
                                            hover:text-green-primary transition-colors no-underline">
              Empezar gratis
            </Link>
          </div>

          {/* Pro */}
          <div className="relative border-2 border-green-primary rounded-2xl p-10 text-left
                          bg-green-hero hover:-translate-y-1 hover:shadow-md transition-all duration-200">
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2
                             bg-green-primary text-white text-[10px] font-bold
                             px-4 py-1 rounded-full uppercase tracking-wide whitespace-nowrap">
              Más popular
            </span>
            <h3 className="font-display text-xl text-gray-900 mb-1">Licencia anual</h3>
            <p className="text-xs text-gray-400 mb-5">Todo incluido · Factura disponible</p>
            <p className="font-display text-5xl text-gray-900 leading-none mb-1">
              <sup className="text-2xl">€</sup>29
              <span className="text-base font-normal text-[#B8860B]">/mes</span>
            </p>
            <p className="text-xs text-gray-600 mb-8">facturado anualmente · 348 €/año</p>
            <ul className="space-y-3 mb-8">
              {['Todo lo del plan gratuito','Exportación PDF y Excel','Alertas e incidencias','Soporte prioritario','Actualizaciones incluidas'].map(f => (
                <li key={f} className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="text-green-primary font-bold">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link to="/registro" className="block text-center bg-green-primary text-white py-3
                                            rounded-xl text-sm font-medium hover:bg-green-dark
                                            transition-colors no-underline shadow-[0_4px_16px_rgba(0,146,60,0.30)]">
              Activar licencia
            </Link>
          </div>
        </div>
        <p className="mt-8 text-xs text-gray-400">
          ¿Necesitas factura o tienes varias sedes?{' '}
          <Link to="/contacto" className="text-green-primary no-underline hover:underline">Contáctanos</Link>
        </p>
      </section>

      {/* ── TESTIMONIALES ── */}
      <section className="bg-gray-50 py-24 px-8">
        <div className="max-w-5xl mx-auto">
          <p className="section-tag mb-2 text-center block">Opiniones</p>
          <h2 className="section-title mb-3 text-center">Lo que dicen nuestros clientes</h2>
          <p className="section-sub mb-14 text-center max-w-md mx-auto">Empresas reales que han simplificado su control horario.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { stars:5, text:'"Llevábamos años con hojas Excel que nadie rellenaba bien. Con FichajesLaborales todos fichan desde el móvil y yo veo todo desde el ordenador. No podría ser más fácil."', name:'Manuel García', role:'Dueño · AutoTaller Gómez', color:'bg-blue-primary' },
              { stars:5, text:'"La inspección de trabajo nos pedía el registro de jornada y no teníamos nada organizado. Ahora exporto el informe en dos clics. Un ahorro de tiempo enorme."', name:'Laura Pérez', role:'RRHH · Clínica BioSalud', color:'bg-green-primary' },
              { stars:4, text:'"Tenemos repartidores que nunca están en la oficina. Antes era imposible controlar el horario. Ahora fichan desde la app cuando salen y cuando vuelven."', name:'José Martínez', role:'Director · Logística Rápida', color:'bg-red-primary' },
            ].map(({ stars, text, name, role, color }) => (
              <div key={name} className="bg-white border border-gray-200 rounded-2xl p-7">
                <p className="text-yellow-400 text-sm mb-4">{'★'.repeat(stars)}{'☆'.repeat(5-stars)}</p>
                <p className="text-sm text-gray-600 font-light leading-relaxed italic mb-5">{text}</p>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center
                                  text-white text-xs font-display flex-shrink-0`}>
                    {name.split(' ').map(n => n[0]).join('').slice(0,2)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{name}</p>
                    <p className="text-xs text-gray-400">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-24 px-8 max-w-2xl mx-auto">
        <h2 className="section-title text-center mb-12">Preguntas frecuentes</h2>
        <FaqItem q="¿Puede fichar un empleado por otro?" a="No. Cada fichaje está vinculado a la sesión personal del empleado y registra la ubicación GPS del dispositivo en ese momento. El administrador ve exactamente dónde estaba cada persona al fichar. No existe ninguna forma de que un empleado registre la entrada o salida de otro." />
        <FaqItem q="¿Necesito tarjeta de crédito para la prueba?" a="No. La prueba gratuita de 15 días es completamente gratuita y no requiere ningún método de pago. Solo te pedimos un email y el nombre de tu empresa." />
        <FaqItem q="¿Qué pasa cuando terminan los 15 días?" a="Tu cuenta queda en modo limitado: puedes ver los datos pero no registrar nuevos fichajes. En ningún caso se borran tus datos. Cuando actives la licencia, todo vuelve a funcionar al instante." />
        <FaqItem q="¿Cuántos empleados puedo tener?" a="No hay límite de empleados en ninguno de los planes. Tanto en la prueba gratuita como en la licencia de pago puedes añadir todos los que necesites." />
        <FaqItem q="¿Es válido para la normativa española de registro de jornada?" a="Sí. FichajesLaborales registra la hora exacta de entrada y salida de cada empleado con sello de tiempo, y permite exportar informes mensuales en formato PDF con todos los datos exigidos por el RDL 8/2019." />
        <FaqItem q="¿Puedo cancelar cuando quiera?" a="Sí. No hay permanencia ni contrato de fidelización. Puedes cancelar desde tu panel de cliente en cualquier momento." />
      </section>

      {/* ── CTA FINAL ── */}
      <section className="bg-green-hero py-24 px-8 text-center relative overflow-hidden"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(0,146,60,0.08) 1px, transparent 1px)', backgroundSize: '28px 28px' }}>
        <h2 className="section-title mb-4 max-w-xl mx-auto">Empieza hoy, sin excusas</h2>
        <p className="section-sub mb-10">15 días gratis, sin tarjeta, sin compromisos. Tu equipo fichando mañana.</p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link to="/registro" className="btn-primary">Crear mi cuenta gratis →</Link>
          <Link to="/contacto" className="btn-secondary">Hablar con ventas</Link>
        </div>
      </section>

    </div>
  )
}