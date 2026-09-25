import "server-only";

/**
 * true si el envío de un formulario con `<CamposAntispam />` parece de un
 * bot: ha rellenado el campo trampa, o se envió antes de `tiempoMinimoMs`
 * desde que se cargó el formulario. Si falta la hora de carga (JS
 * desactivado) no se bloquea: el campo trampa sigue protegiendo.
 */
export function esEnvioSospechoso(formData: FormData, tiempoMinimoMs = 0): boolean {
  if (String(formData.get("sitio_web") ?? "").trim() !== "") return true;

  if (tiempoMinimoMs > 0) {
    const cargadoEn = Number(formData.get("cargado_en"));
    if (Number.isFinite(cargadoEn) && cargadoEn > 0 && Date.now() - cargadoEn < tiempoMinimoMs) {
      return true;
    }
  }
  return false;
}
