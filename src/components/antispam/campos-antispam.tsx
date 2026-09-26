"use client";

import { useEffect, useRef } from "react";

/**
 * Campos invisibles contra bots de spam, sin captcha: un "honeypot" que una
 * persona nunca ve ni rellena (los bots rellenan todo) y la hora a la que se
 * cargó el formulario, para descartar envíos hechos en menos tiempo del que
 * tarda un humano. La hora se pone en el navegador tras hidratar (no en el
 * render) para no provocar un desajuste de hidratación. Se validan en el
 * servidor con `esEnvioSospechoso` (src/lib/antispam.ts).
 */
export function CamposAntispam() {
  const cargadoEn = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (cargadoEn.current) cargadoEn.current.value = String(Date.now());
  }, []);

  return (
    <>
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          No rellenes este campo
          <input name="sitio_web" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      <input ref={cargadoEn} type="hidden" name="cargado_en" defaultValue="" />
    </>
  );
}
