function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="font-display text-xl text-gray-900 mb-3 pb-2 border-b-2 border-green-light">{title}</h2>
      {children}
    </div>
  )
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-600 font-light leading-relaxed mb-3">{children}</p>
}
function UL({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5 mb-3 ml-4">
      {items.map(i => <li key={i} className="text-sm text-gray-600 font-light leading-relaxed list-disc">{i}</li>)}
    </ul>
  )
}

export function AvisoLegalPage() {
  return (
    <div className="pt-16">
      <div className="bg-green-hero border-b border-green-primary/12 py-14 px-8"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(0,146,60,0.08) 1px, transparent 1px)', backgroundSize: '28px 28px' }}>
        <div className="max-w-3xl mx-auto">
          <span className="inline-block bg-green-light text-green-primary text-xs font-medium px-3 py-1 rounded-full mb-4">Legal</span>
          <h1 className="font-display text-4xl text-gray-900 mb-2">Aviso Legal</h1>
          <p className="text-sm text-gray-500 font-light">En cumplimiento del artículo 10 de la Ley 34/2002 (LSSI-CE).</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-8 py-16">
        <Section title="1. Datos identificativos del titular">
          <P>
            <strong className="text-gray-900 font-medium">FichajesLaborales</strong><br />
            NIF: 44372838L<br />
            Domicilio: Calle Ingeniero Ruiz de Azúa s/n Local 8, 14006 Córdoba, España<br />
            Teléfono: +34 658 527 186<br />
            Email: <a href="mailto:hola@fichajelaboral.com" className="text-green-primary no-underline hover:underline">hola@fichajelaboral.com</a>
          </P>
        </Section>

        <Section title="2. Objeto y ámbito de aplicación">
          <P>El presente Aviso Legal regula el acceso, navegación y uso del sitio web y de la aplicación móvil FichajesLaborales. El acceso y uso implica la aceptación plena de las condiciones aquí establecidas.</P>
        </Section>

        <Section title="3. Propiedad intelectual e industrial">
          <P>Todos los contenidos — incluyendo textos, imágenes, logotipos, código fuente y diseño — son propiedad de FichajesLaborales o de sus licenciantes, protegidos por la legislación española e internacional sobre propiedad intelectual.</P>
          <P>Queda expresamente prohibida su reproducción, distribución o transformación sin autorización expresa y por escrito del titular.</P>
        </Section>

        <Section title="4. Uso del sitio web">
          <P>El usuario se compromete a no realizar las siguientes conductas:</P>
          <UL items={[
            'Introducir o difundir contenidos ilícitos o que vulneren derechos de terceros.',
            'Difundir virus o cualquier código malicioso.',
            'Intentar acceder sin autorización a áreas restringidas.',
            'Reproducir los contenidos del sitio con fines comerciales sin autorización.',
          ]} />
        </Section>

        <Section title="5. Exclusión de garantías y responsabilidad">
          <P>FichajesLaborales no garantiza la disponibilidad y continuidad ininterrumpida del sitio web. No se responsabiliza de los daños derivados de la utilización del servicio, salvo dolo o negligencia grave del titular.</P>
        </Section>

        <Section title="6. Legislación aplicable y jurisdicción">
          <P>Este Aviso Legal se rige por la legislación española. Para la resolución de cualquier controversia, las partes se someten a los Juzgados y Tribunales de Córdoba.</P>
        </Section>
      </div>
    </div>
  )
}