import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock } from "lucide-react";
import { obtenerTorneoPorSlug } from "@/lib/data/torneos";

export const metadata: Metadata = { title: "En lista de espera" };

export default async function ListaEsperaConfirmacionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const torneo = await obtenerTorneoPorSlug(slug);
  if (!torneo) notFound();

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <Link href={`/torneos/${slug}`} className="text-sm text-ajag-gris-500 hover:underline">
        ← Volver al torneo
      </Link>

      <div className="card-ajag mt-6 p-8 text-center">
        <Clock size={40} className="mx-auto text-ajag-oro-600" />
        <h1 className="mt-3 font-display text-xl font-semibold text-ajag-verde-900">
          Estás en lista de espera
        </h1>
        <p className="mt-2 text-sm text-ajag-gris-500">
          El cupo de <strong className="text-ajag-verde-900">{torneo.nombre}</strong> está
          completo. Te hemos apuntado a la lista de espera — si se libera una plaza, te
          avisaremos por email para confirmarla. De momento no se te ha cobrado nada.
        </p>
      </div>
    </div>
  );
}
