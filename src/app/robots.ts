import type { MetadataRoute } from "next";
import { urlBaseActual } from "@/lib/sitio";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = await urlBaseActual();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Zonas privadas o sin valor para buscadores.
      disallow: ["/admin", "/god", "/cuenta", "/carrito", "/api", "/auth", "/login"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
