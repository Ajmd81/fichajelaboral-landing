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

export function TerminosPage() {
  return (
    <div className="pt-16">
      <div className="bg-green-hero border-b border-green-primary/12 py-14 px-8"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(0,146,60,0.08) 1px, transparent 1px)', backgroundSize: '28px 28px' }}>
        <div className="max-w-3xl mx-auto">
          <span className="inline-block bg-green-light text-green-primary text-xs font-medium px-3 py-1 rounded-full mb-4">Legal</span>
          <h1 className="font-display text-4xl text-gray-900 mb-2">Términos de Uso</h1>
          <p className="text-sm text-gray-500 font-light">Última actualización: junio de 2025 · FichajesLaborales</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-8 py-16">
        <div className="bg-green-light border-l-4 border-green-primary rounded-r-xl px-5 py-4 mb-10">
          <P>Al registrarte y usar FichajesLaborales aceptas estos términos. Si no estás de acuerdo con alguno de ellos, no debes usar el servicio.</P>
        </div>

        <Section title="1. Objeto del contrato">
          <P>FichajesLaborales ofrece una plataforma SaaS de control horario y geolocalización de empleados accesible mediante aplicación web y app móvil (iOS y Android).</P>
        </Section>

        <Section title="2. Registro y cuenta">
          <P>El Cliente es responsable de:</P>
          <UL items={[
            'Mantener la confidencialidad de sus credenciales de acceso.',
            'Toda la actividad realizada desde su cuenta.',
            'Notificar de forma inmediata cualquier uso no autorizado.',
            'Proporcionar información veraz y actualizada durante el registro.',
          ]} />
        </Section>

        <Section title="3. Periodo de prueba">
          <P>Se ofrece un <strong className="text-gray-900 font-medium">periodo de prueba gratuito de 15 días</strong> desde la creación de la cuenta, sin necesidad de facilitar datos de pago. Transcurrido dicho periodo, el acceso quedará limitado hasta activar una licencia de pago.</P>
        </Section>

        <Section title="4. Licencias y precios">
          <P>Las tarifas vigentes están publicadas en la página de precios. El pago se realiza a través de Stripe de forma segura. Los precios podrán actualizarse con un preaviso mínimo de 30 días.</P>
        </Section>

        <Section title="5. Cancelación y reembolsos">
          <P>El Cliente puede cancelar su suscripción en cualquier momento desde el panel de cliente. <strong className="text-gray-900 font-medium">No se realizan reembolsos prorrateados</strong> salvo error imputable al Proveedor.</P>
        </Section>

        <Section title="6. Obligaciones del Cliente">
          <UL items={[
            'Usar el servicio conforme a la legalidad vigente, en especial el RDL 8/2019 sobre registro de jornada.',
            'Informar a sus empleados del tratamiento de datos de geolocalización y obtener su consentimiento conforme al RGPD.',
            'No usar el servicio para actividades ilícitas o fraudulentas.',
            'No intentar acceder a datos de otras empresas ni realizar ingeniería inversa sobre el sistema.',
          ]} />
        </Section>

        <Section title="7. Disponibilidad del servicio">
          <P>El Proveedor se compromete a mantener una disponibilidad del servicio del <strong className="text-gray-900 font-medium">99,5% mensual</strong>, excluyendo mantenimientos programados e interrupciones causadas por terceros.</P>
        </Section>

        <Section title="8. Propiedad intelectual">
          <P>Todos los derechos sobre el software, diseño, marca y contenidos pertenecen al Proveedor. El Cliente adquiere únicamente una licencia de uso no exclusiva y no transferible.</P>
        </Section>

        <Section title="9. Limitación de responsabilidad">
          <P>La responsabilidad máxima del Proveedor no excederá el importe pagado por el Cliente en los últimos 12 meses.</P>
        </Section>

        <Section title="10. Legislación aplicable">
          <P>Estos Términos se rigen por la legislación española. Para cualquier controversia, las partes se someten a los Juzgados y Tribunales de Córdoba.</P>
        </Section>
      </div>
    </div>
  )
}