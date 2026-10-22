-- Revisión de seguridad: lo que un jugador puede escribir por su cuenta.
--
-- Las policies de RLS de inscripciones / pedidos_pago dejan que un jugador
-- escriba SUS filas, pero no limitan QUÉ escribe en ellas. Llamando a la
-- Data API directamente (con su propia sesión, sin pasar por la web) un
-- jugador podía:
--   - marcar su pedido como "confirmado" o su inscripción como "confirmada"
--     sin haber pagado;
--   - inscribirse con el precio que quisiera, en un torneo no publicado o
--     con el cupo ya lleno (incluido pasar de lista de espera a plaza);
--   - enganchar su inscripción al pedido de otra persona, para que al
--     confirmar el admin ese pago quedase confirmada también la suya;
--   - crear fichas de jugador a nombre de otro usuario o de otro club.
--
-- Estos triggers repiten en la base de datos las mismas reglas que ya
-- aplica la web, así que el flujo normal no cambia. No afectan a:
--   - service_role (inscripción de invitados, tareas del servidor),
--   - SQL directo / migraciones (sin JWT),
--   - el admin del organizador del torneo (gestiona inscripciones y pagos).

-- ---------------------------------------------------------------------------
-- Ayudante: ¿la petición viene de un usuario de la Data API (anon o con
-- sesión), y no de service_role o de SQL directo?
create or replace function public.es_peticion_de_usuario()
returns boolean
language sql
stable
set search_path = public
as $$
  select coalesce(auth.role(), '') in ('anon', 'authenticated');
$$;

-- ---------------------------------------------------------------------------
-- inscripciones
create or replace function public.validar_inscripcion_jugador()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  t record;
  ocupadas integer;
  cuenta_cupo constant estado_inscripcion[] := array['pendiente_pago', 'confirmada']::estado_inscripcion[];
begin
  if not es_peticion_de_usuario() then
    return new;
  end if;

  -- Bloquea la fila del torneo: serializa las altas del mismo torneo para
  -- que dos inscripciones simultáneas no se cuelen en la última plaza.
  select id, organizador_id, estado, modo_pago, precio_cents, precio_socio_cents, cupo_maximo
    into t
    from torneos
   where id = new.torneo_id
   for update;

  if is_admin() and t.organizador_id = organizador_id_actual() then
    return new;
  end if;

  if tg_op = 'UPDATE'
     and (new.torneo_id is distinct from old.torneo_id or new.jugador_id is distinct from old.jugador_id) then
    raise exception 'No se puede cambiar el torneo o el jugador de una inscripción.'
      using errcode = '42501';
  end if;

  -- Estados que puede elegir el propio jugador. "confirmada" solo cuando
  -- el torneo se paga en el club (no hay pago que confirmar).
  if new.estado = 'confirmada' then
    if t.modo_pago is distinct from 'club'
       and not (tg_op = 'UPDATE' and old.estado = 'confirmada') then
      raise exception 'Solo el organizador puede confirmar una inscripción.'
        using errcode = '42501';
    end if;
  elsif new.estado not in ('carrito', 'pendiente_pago', 'en_lista_espera') then
    if not (tg_op = 'UPDATE' and new.estado = old.estado) then
      raise exception 'Estado de inscripción no permitido.' using errcode = '42501';
    end if;
  end if;

  -- Solo se apunta uno a torneos abiertos.
  if (tg_op = 'INSERT' or new.estado is distinct from old.estado) and t.estado <> 'publicado' then
    raise exception 'Este torneo no admite inscripciones en este momento.' using errcode = '42501';
  end if;

  -- Precio: el del torneo (o el de socio, si lo tiene y es socio).
  if tg_op = 'INSERT'
     or new.precio_cents is distinct from old.precio_cents
     or new.es_socio is distinct from old.es_socio then
    if new.precio_cents is distinct from (
      case when new.es_socio and t.precio_socio_cents is not null
           then t.precio_socio_cents else t.precio_cents end
    ) then
      raise exception 'Precio de inscripción no válido.' using errcode = '42501';
    end if;
  end if;

  -- El pedido de pago tiene que ser del propio jugador.
  if new.pedido_pago_id is not null
     and (tg_op = 'INSERT' or new.pedido_pago_id is distinct from old.pedido_pago_id)
     and not exists (
       select 1 from pedidos_pago p where p.id = new.pedido_pago_id and p.user_id = auth.uid()
     ) then
    raise exception 'Pedido de pago no válido.' using errcode = '42501';
  end if;

  -- Cupo: al ocupar plaza (alta, o salir de carrito / lista de espera).
  if t.cupo_maximo is not null
     and new.estado = any (cuenta_cupo)
     and (tg_op = 'INSERT' or not (old.estado = any (cuenta_cupo))) then
    select count(*) into ocupadas
      from inscripciones i
     where i.torneo_id = new.torneo_id
       and i.estado = any (cuenta_cupo)
       and i.id <> new.id;
    if ocupadas >= t.cupo_maximo then
      raise exception 'El cupo del torneo está completo.' using errcode = '42501';
    end if;
  end if;

  return new;
end;
$$;

create or replace trigger trg_validar_inscripcion_jugador
  before insert or update on public.inscripciones
  for each row execute function public.validar_inscripcion_jugador();

-- ---------------------------------------------------------------------------
-- pedidos_pago
create or replace function public.validar_pedido_jugador()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  t_modo_pago text;
  t_precio integer;
  t_precio_socio integer;
begin
  if not es_peticion_de_usuario() then
    return new;
  end if;

  if is_admin() and organizador_id_actual() is not null and (
       exists (select 1 from torneos tt where tt.id = new.torneo_id and tt.organizador_id = organizador_id_actual())
       or exists (
         select 1 from inscripciones i join torneos tt on tt.id = i.torneo_id
          where i.pedido_pago_id = new.id and tt.organizador_id = organizador_id_actual()
       )
     ) then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.confirmado_por is not null or new.notas_admin is not null or new.marcado_pagado_at is not null then
      raise exception 'Campos de pedido reservados al organizador.' using errcode = '42501';
    end if;

    if new.torneo_id is not null then
      select modo_pago::text, precio_cents, precio_socio_cents
        into t_modo_pago, t_precio, t_precio_socio
        from torneos where id = new.torneo_id;
      if new.total_cents is distinct from t_precio
         and new.total_cents is distinct from t_precio_socio then
        raise exception 'Importe del pedido no válido.' using errcode = '42501';
      end if;
    end if;

    -- Pagar en el club no tiene nada que confirmar: nace confirmado.
    -- Cualquier otro pedido nace pendiente de que el organizador lo confirme.
    if new.estado = 'confirmado' then
      if new.metodo_pago is distinct from 'club' or t_modo_pago is distinct from 'club' then
        raise exception 'Solo el organizador puede confirmar un pago.' using errcode = '42501';
      end if;
    elsif new.estado <> 'pendiente_confirmacion' then
      raise exception 'Estado de pedido no permitido.' using errcode = '42501';
    end if;
    return new;
  end if;

  -- UPDATE: el jugador solo puede avisar de que ya ha pagado
  -- (pendiente_confirmacion -> marcado_pagado); el resto es del organizador.
  if new.estado is distinct from old.estado
     and not (old.estado = 'pendiente_confirmacion' and new.estado = 'marcado_pagado') then
    raise exception 'Solo el organizador puede cambiar el estado de un pago.' using errcode = '42501';
  end if;
  if new.user_id is distinct from old.user_id
     or new.torneo_id is distinct from old.torneo_id
     or new.metodo_pago is distinct from old.metodo_pago
     or new.total_cents is distinct from old.total_cents
     or new.confirmado_at is distinct from old.confirmado_at
     or new.confirmado_por is distinct from old.confirmado_por
     or new.notas_admin is distinct from old.notas_admin then
    raise exception 'Campos de pedido reservados al organizador.' using errcode = '42501';
  end if;
  return new;
end;
$$;

create or replace trigger trg_validar_pedido_jugador
  before insert or update on public.pedidos_pago
  for each row execute function public.validar_pedido_jugador();

-- ---------------------------------------------------------------------------
-- jugadores: un usuario solo crea SU ficha; las fichas sin cuenta (o de
-- otros) las crea el admin de ese organizador (o el servidor, para los
-- invitados, con service_role).
alter policy jugadores_insert_auth on public.jugadores
  with check (
    (auth.uid() is not null and user_id = auth.uid())
    or (is_admin() and organizador_id = organizador_id_actual())
  );

-- ---------------------------------------------------------------------------
-- Storage: cualquier admin de cualquier club podía reemplazar o borrar los
-- archivos (pósters, logos de patrocinadores, imágenes de ligas, horarios,
-- PDFs de resultados) de otro club. Subir sigue igual; modificar o borrar
-- queda para los admins del mismo organizador que quien lo subió.
create or replace function public.archivo_es_de_mi_organizador(propietario uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select is_super_admin() or (
    is_admin() and exists (
      select 1 from usuarios_admin ua
       where ua.user_id = propietario
         and ua.organizador_id = organizador_id_actual()
    )
  );
$$;

alter policy posters_admin_update on storage.objects
  using (bucket_id = 'posters' and archivo_es_de_mi_organizador(owner))
  with check (bucket_id = 'posters' and is_admin());
alter policy posters_admin_delete on storage.objects
  using (bucket_id = 'posters' and archivo_es_de_mi_organizador(owner));

alter policy patrocinadores_logos_admin_update on storage.objects
  using (bucket_id = 'patrocinadores' and archivo_es_de_mi_organizador(owner))
  with check (bucket_id = 'patrocinadores' and is_admin());
alter policy patrocinadores_logos_admin_delete on storage.objects
  using (bucket_id = 'patrocinadores' and archivo_es_de_mi_organizador(owner));

alter policy ligas_imagenes_admin_update on storage.objects
  using (bucket_id = 'ligas' and archivo_es_de_mi_organizador(owner))
  with check (bucket_id = 'ligas' and is_admin());
alter policy ligas_imagenes_admin_delete on storage.objects
  using (bucket_id = 'ligas' and archivo_es_de_mi_organizador(owner));

alter policy horarios_admin_update on storage.objects
  using (bucket_id = 'horarios' and archivo_es_de_mi_organizador(owner))
  with check (bucket_id = 'horarios' and is_admin());
alter policy horarios_admin_delete on storage.objects
  using (bucket_id = 'horarios' and archivo_es_de_mi_organizador(owner));

-- resultados-pdf tiene una sola policy ALL: subir (with check) sigue
-- abierto a cualquier admin; modificar/borrar (using) pasa a ser del mismo
-- organizador. La lectura pública sigue en resultados_pdf_lectura_publica.
alter policy resultados_pdf_admin_all on storage.objects
  using (bucket_id = 'resultados-pdf' and archivo_es_de_mi_organizador(owner))
  with check (bucket_id = 'resultados-pdf' and is_admin());

-- ---------------------------------------------------------------------------
-- Aviso del linter de Supabase: search_path fijo (sin cambio de comportamiento).
alter function public.organizador_id_dominio() set search_path = public;

-- Grants explícitos de la Data API para las funciones nuevas (ver 069).
grant execute on function public.es_peticion_de_usuario() to anon, authenticated, service_role;
grant execute on function public.archivo_es_de_mi_organizador(uuid) to anon, authenticated, service_role;
