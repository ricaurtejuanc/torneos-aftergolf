import type { Metadata } from "next";
import Link from "next/link";
import { PaginaLegal, DatosTitular } from "@/components/legal/pagina-legal";
import { obtenerTitularLegal } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: "Cómo tratamos tus datos personales y cómo ejercer tus derechos.",
};

export default async function PrivacidadPage() {
  const titular = await obtenerTitularLegal();
  const contacto = titular.email ? (
    <a href={`mailto:${titular.email}`}>{titular.email}</a>
  ) : (
    <Link href="/contacto">el formulario de contacto</Link>
  );

  return (
    <PaginaLegal titulo="Política de privacidad">
      <p>
        Esta política explica cómo se tratan tus datos personales cuando usas este sitio web,
        conforme al Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD).
      </p>

      <h2>Responsable del tratamiento</h2>
      <DatosTitular titular={titular} />
      {titular.esOrganizador ? (
        <p>
          AfterGolf Torneos actúa como <em>encargado del tratamiento</em>: aloja y gestiona
          técnicamente la plataforma por cuenta de {titular.nombre}, sin usar tus datos para fines
          propios.
        </p>
      ) : null}

      <h2>Qué datos tratamos y para qué</h2>
      <ul>
        <li>
          <strong>Cuenta de usuario</strong> (email y, si entras con Google, tu nombre): para
          identificarte y darte acceso a tu área personal. Base legal: ejecución del contrato
          (art. 6.1.b RGPD).
        </li>
        <li>
          <strong>Inscripción en torneos</strong> (nombre, apellidos, email, licencia federativa,
          sexo, hándicap, socio o no, con quién quieres jugar): para gestionar tu plaza, los
          horarios de salida, los pagos y las comunicaciones del torneo. Base legal: ejecución del
          contrato.
        </li>
        <li>
          <strong>Resultados y clasificaciones</strong> (nombre, hándicap, puntuación y posición):
          se publican en la web, como es habitual en las competiciones de golf, para dar a conocer
          los resultados. Base legal: interés legítimo del organizador y aceptación de las normas
          del torneo al inscribirte. Puedes oponerte escribiendo a {contacto}.
        </li>
        <li>
          <strong>Pagos</strong>: registramos el estado del pago de tu inscripción (por ejemplo, un
          Bizum o una transferencia confirmados por el organizador). No almacenamos datos de
          tarjetas.
        </li>
        <li>
          <strong>Formulario de contacto</strong> (nombre, email, teléfono opcional y mensaje): para
          responder a tu consulta. Base legal: tu consentimiento al enviarla.
        </li>
        <li>
          <strong>Estadísticas de visitas</strong> (página visitada, navegador y una huella
          irreversible de la IP): solo si aceptas las cookies de analítica. Base legal:
          consentimiento. Más información en la <Link href="/cookies">Política de cookies</Link>.
        </li>
      </ul>

      <h2>Cuánto tiempo los conservamos</h2>
      <p>
        Los datos de cuenta se conservan mientras la mantengas activa. Los de inscripciones,
        resultados y clasificaciones, mientras sean necesarios para el histórico de la competición
        y durante los plazos legales aplicables (por ejemplo, obligaciones contables). Las consultas
        de contacto, el tiempo necesario para atenderlas.
      </p>

      <h2>A quién se comunican</h2>
      <p>
        No vendemos ni cedemos tus datos a terceros. Los compartimos solo con proveedores que
        prestan servicios necesarios para el funcionamiento del sitio, con contratos de encargo de
        tratamiento:
      </p>
      <ul>
        <li>Supabase (base de datos, autenticación y almacenamiento de archivos).</li>
        <li>Vercel (alojamiento web y, si lo aceptas, analítica de visitas).</li>
        <li>Google (solo si eliges iniciar sesión con tu cuenta de Google).</li>
        <li>El proveedor de correo electrónico con el que se envían las notificaciones.</li>
      </ul>
      <p>
        Algunos de estos proveedores pueden tratar datos fuera del Espacio Económico Europeo; en
        ese caso lo hacen con las garantías previstas en el RGPD (decisiones de adecuación o
        cláusulas contractuales tipo).
      </p>

      <h2>Tus derechos</h2>
      <p>
        Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación del
        tratamiento y portabilidad escribiendo a {contacto}. Muchos de tus datos puedes editarlos
        directamente desde <Link href="/cuenta">tu cuenta</Link>. Si consideras que no se han
        atendido correctamente, puedes reclamar ante la Agencia Española de Protección de Datos (
        <a href="https://www.aepd.es" target="_blank" rel="noreferrer">
          www.aepd.es
        </a>
        ).
      </p>

      <h2>Menores de edad</h2>
      <p>
        Si un menor de 14 años va a participar en un torneo, la inscripción debe hacerla su padre,
        madre o tutor legal.
      </p>
    </PaginaLegal>
  );
}
