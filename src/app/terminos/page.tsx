import type { Metadata } from "next";
import Link from "next/link";
import { PaginaLegal } from "@/components/legal/pagina-legal";
import { obtenerTitularLegal } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description: "Condiciones de uso del sitio y de inscripción en los torneos.",
};

export default async function TerminosPage() {
  const titular = await obtenerTitularLegal();

  if (!titular.esOrganizador) {
    return (
      <PaginaLegal titulo="Términos y condiciones">
        <p>
          AfterGolf Torneos es una plataforma para que clubes y asociaciones de golf amateur
          gestionen sus torneos. Este dominio solo contiene información sobre el producto; la
          contratación del servicio por parte de un club se formaliza en un acuerdo específico con
          él.
        </p>
        <p>
          Las inscripciones en torneos se realizan en la web de cada organizador y se rigen por sus
          propios términos y condiciones.
        </p>
        <p>
          Para cualquier duda, escríbenos a{" "}
          <a href={`mailto:${titular.email}`}>{titular.email}</a>.
        </p>
      </PaginaLegal>
    );
  }

  return (
    <PaginaLegal titulo="Términos y condiciones">
      <p>
        Estos términos regulan el uso de este sitio web y la inscripción en los torneos organizados
        por <strong>{titular.nombre}</strong> (el &quot;organizador&quot;). Al crear una cuenta o
        inscribirte en un torneo aceptas estas condiciones.
      </p>

      <h2>1. Cuenta de usuario</h2>
      <p>
        Puedes inscribirte con una cuenta (Google o enlace por email) o como invitado. Eres
        responsable de que los datos que facilitas (nombre, licencia federativa, hándicap, email)
        sean veraces y estén actualizados; el organizador puede corregirlos o anular una inscripción
        con datos falsos.
      </p>

      <h2>2. Inscripción en torneos</h2>
      <ul>
        <li>
          La inscripción queda registrada al enviar el formulario, pero la plaza no está
          garantizada hasta que el organizador la confirma (normalmente, tras recibir el pago).
        </li>
        <li>
          Si el torneo tiene cupo máximo y está completo, puedes apuntarte a la lista de espera; se
          te avisará si queda una plaza libre.
        </li>
        <li>
          Cada torneo tiene sus propias normas (formato de juego, categorías, premios, horarios),
          publicadas en su ficha. Inscribirte supone aceptarlas, junto con las Reglas de Golf
          vigentes y las normas del campo.
        </li>
        <li>
          Los horarios de salida y la composición de los grupos los decide el organizador y pueden
          cambiar hasta el día del torneo. Intentamos respetar las peticiones de &quot;jugar
          con&quot;, pero no se garantizan.
        </li>
      </ul>

      <h2>3. Precio y pago</h2>
      <p>
        El precio de cada torneo se indica en su ficha (puede ser distinto para socios y no socios).
        El pago se realiza por los medios que indique el organizador (por ejemplo, Bizum o
        transferencia) y lo confirma el organizador manualmente. Si el pago no se recibe en el plazo
        indicado, la inscripción puede anularse.
      </p>

      <h2>4. Cancelaciones y devoluciones</h2>
      <ul>
        <li>
          Si no puedes asistir, avisa al organizador cuanto antes. La devolución del importe, total
          o parcial, dependerá de la antelación del aviso y de los compromisos ya adquiridos con el
          campo; consulta las condiciones concretas del torneo o pregunta al organizador.
        </li>
        <li>
          Si el organizador cancela el torneo, se devolverá íntegramente el importe pagado o se
          ofrecerá trasladarlo a otro torneo, a tu elección.
        </li>
        <li>
          Si el torneo se suspende por causas meteorológicas o de fuerza mayor una vez empezado, se
          aplicarán las normas del torneo y del campo.
        </li>
      </ul>
      <p>
        Al tratarse de servicios de ocio con fecha determinada, no aplica el derecho de desistimiento
        de 14 días (art. 103.l del Real Decreto Legislativo 1/2007).
      </p>

      <h2>5. Resultados y clasificaciones</h2>
      <p>
        Los resultados, clasificaciones y horarios de salida (con nombre, hándicap y puntuación de
        cada jugador) se publican en la web. Los resultados oficiales son los que publica el
        organizador; las reclamaciones deben hacerse según las normas del torneo.
      </p>

      <h2>6. Imágenes</h2>
      <p>
        Durante los torneos pueden tomarse fotografías que el organizador publique en su web o
        redes sociales. Si no quieres aparecer, indícalo al organizador.
      </p>

      <h2>7. Uso correcto del sitio</h2>
      <p>
        No está permitido usar el sitio para fines ilícitos, enviar inscripciones o mensajes
        automatizados (spam), intentar acceder a zonas o datos de otros usuarios o afectar a su
        funcionamiento.
      </p>

      <h2>8. Responsabilidad</h2>
      <p>
        Cada jugador participa bajo su propia responsabilidad y debe contar con la licencia
        federativa y el seguro que exija el torneo. El organizador no responde de los daños
        causados por los jugadores a sí mismos o a terceros durante el juego.
      </p>

      <h2>9. Cambios y legislación</h2>
      <p>
        El organizador puede actualizar estos términos; la versión aplicable es la publicada en el
        momento de tu inscripción. Se rigen por la legislación española. Para cualquier duda,
        usa el <Link href="/contacto">formulario de contacto</Link>. Consulta también el{" "}
        <Link href="/aviso-legal">Aviso legal</Link> y la{" "}
        <Link href="/privacidad">Política de privacidad</Link>.
      </p>
    </PaginaLegal>
  );
}
