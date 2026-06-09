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
      {items.map(i => (
        <li key={i} className="text-sm text-gray-600 font-light leading-relaxed list-disc">{i}</li>
      ))}
    </ul>
  )
}

export function PrivacidadPage() {
  return (
    <div className="pt-16">
      {/* Hero */}
      <div className="bg-green-hero border-b border-green-primary/12 py-14 px-8"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(0,146,60,0.08) 1px, transparent 1px)', backgroundSize: '28px 28px' }}>
        <div className="max-w-3xl mx-auto">
          <span className="inline-block bg-green-light text-green-primary text-xs font-medium px-3 py-1 rounded-full mb-4">Legal</span>
          <h1 className="font-display text-4xl text-gray-900 mb-2">Política de Privacidad</h1>
          <p className="text-sm text-gray-500 font-light">Última actualización: junio de 2025 · Responsable: FichajesLaborales</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-8 py-16">
        <div className="bg-green-light border-l-4 border-green-primary rounded-r-xl px-5 py-4 mb-10">
          <P>En FichajesLaborales tratamos tus datos con la máxima responsabilidad. Solo recogemos lo estrictamente necesario para prestar el servicio, nunca los vendemos a terceros y los almacenamos en servidores ubicados en la Unión Europea.</P>
        </div>

        <Section title="1. Responsable del tratamiento">
          <P><strong className="text-gray-900 font-medium">FichajesLaborales</strong><br />
          NIF: 44372838L<br />
          Domicilio: Calle Ingeniero Ruiz de Azúa s/n Local 8, 14006 Córdoba, España<br />
          Email: <a href="mailto:privacidad@fichajelaboral.com" className="text-green-primary no-underline hover:underline">privacidad@fichajelaboral.com</a></P>
        </Section>

        <Section title="2. Datos que recogemos">
          <UL items={[
            'Registro y cuenta: nombre de la empresa, email del administrador y contraseña cifrada.',
            'Empleados: nombre, apellidos, email y rol dentro de la empresa.',
            'Fichajes: hora de entrada, hora de salida y coordenadas GPS del dispositivo en el momento del fichaje.',
            'Facturación: datos gestionados a través de Stripe (no almacenamos datos de tarjeta).',
            'Técnicos: dirección IP, tipo de dispositivo y logs de acceso para seguridad y mantenimiento.',
          ]} />
        </Section>

        <Section title="3. Finalidad y base jurídica">
          <UL items={[
            'Prestación del servicio: ejecución del contrato (Art. 6.1.b RGPD).',
            'Geolocalización en fichajes: interés legítimo y cumplimiento del RDL 8/2019, con consentimiento explícito del empleado.',
            'Comunicaciones comerciales: consentimiento del usuario (Art. 6.1.a RGPD).',
            'Cumplimiento legal: obligación legal (Art. 6.1.c RGPD).',
          ]} />
        </Section>

        <Section title="4. Geolocalización — información específica">
          <P>La app solicita permiso de ubicación únicamente en el momento de realizar un fichaje. Las coordenadas GPS quedan registradas junto con la marca de tiempo y son accesibles al administrador de la empresa.</P>
          <P>El empleado puede revocar el permiso de ubicación desde los ajustes de su dispositivo, lo que impedirá realizar fichajes desde la app.</P>
        </Section>

        <Section title="5. Conservación de datos">
          <P>Los datos de fichaje se conservan durante <strong className="text-gray-900 font-medium">4 años</strong> desde su registro, en cumplimiento con la normativa laboral española. Los datos de cuenta se eliminan en un plazo máximo de 30 días desde la solicitud de baja.</P>
        </Section>

        <Section title="6. Cesión de datos a terceros">
          <P>No vendemos ni cedemos datos a terceros con fines comerciales. Solo compartimos datos con:</P>
          <UL items={[
            'Stripe Inc. — pasarela de pago (EE.UU., con cláusulas contractuales tipo UE).',
            'Railway / infraestructura cloud — alojamiento de servidores en la UE.',
          ]} />
        </Section>

        <Section title="7. Derechos del usuario">
          <P>Puedes ejercer en cualquier momento los siguientes derechos enviando un email a <a href="mailto:privacidad@fichajelaboral.com" className="text-green-primary no-underline hover:underline">privacidad@fichajelaboral.com</a>:</P>
          <UL items={[
            'Acceso, rectificación y supresión de tus datos.',
            'Limitación u oposición al tratamiento.',
            'Portabilidad de los datos.',
            'Retirada del consentimiento en cualquier momento.',
          ]} />
          <P>También puedes presentar una reclamación ante la <strong className="text-gray-900 font-medium">Agencia Española de Protección de Datos (AEPD)</strong> en <a href="https://www.aepd.es" target="_blank" rel="noreferrer" className="text-green-primary no-underline hover:underline">www.aepd.es</a>.</P>
        </Section>

        <Section title="8. Cookies">
          <P>Utilizamos únicamente cookies técnicas estrictamente necesarias para el funcionamiento del servicio. No utilizamos cookies de seguimiento ni publicidad de terceros.</P>
        </Section>

        <Section title="9. Cambios en esta política">
          <P>Nos reservamos el derecho a actualizar esta política. En caso de cambios significativos, te notificaremos por email con al menos 15 días de antelación.</P>
        </Section>
      </div>
    </div>
  )
}