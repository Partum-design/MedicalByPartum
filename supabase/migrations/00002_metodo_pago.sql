-- ============================================================================
-- Medical OS — Migración 00002: pago en efectivo
-- Agrega la opción de pagar la consulta en efectivo en la clínica, además
-- del pago con tarjeta vía Stripe.
-- ============================================================================

create type metodo_pago as enum ('tarjeta', 'efectivo');

alter table public.citas
  add column metodo_pago metodo_pago not null default 'tarjeta';

alter table public.pagos
  add column metodo_pago metodo_pago not null default 'tarjeta';

-- fn_bloquear_slot: ahora recibe el método de pago elegido por el paciente
-- y crea de una vez el registro en `pagos` (antes nada lo insertaba; solo
-- el webhook de Stripe lo actualizaba).
create or replace function public.fn_bloquear_slot(
  p_medico_id uuid,
  p_inicio timestamptz,
  p_fin timestamptz,
  p_modalidad modalidad_cita default 'presencial',
  p_metodo_pago metodo_pago default 'tarjeta'
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cita_id uuid;
  v_medico medicos%rowtype;
begin
  if auth.uid() is null then
    raise exception 'No autenticado';
  end if;

  -- El paciente debe tener teléfono verificado por OTP antes de reservar
  if not exists (
    select 1 from usuarios
     where id = auth.uid() and telefono_verificado
  ) then
    raise exception 'Teléfono no verificado';
  end if;

  -- Máximo 3 slots bloqueados simultáneos por paciente (anti-hoarding)
  if (select count(*) from citas
       where paciente_id = auth.uid()
         and estado = 'bloqueada'
         and bloqueo_expira_en > now()) >= 3 then
    raise exception 'Límite de reservas simultáneas alcanzado';
  end if;

  select * into v_medico from medicos where id = p_medico_id and activo;
  if not found then
    raise exception 'Médico no disponible';
  end if;

  insert into citas (clinica_id, medico_id, paciente_id, inicio, fin,
                     modalidad, estado, precio, bloqueo_expira_en, metodo_pago)
  values (v_medico.clinica_id, p_medico_id, auth.uid(), p_inicio, p_fin,
          p_modalidad, 'bloqueada', v_medico.precio_consulta,
          now() + interval '10 minutes', p_metodo_pago)
  returning id into v_cita_id;

  insert into pagos (cita_id, clinica_id, paciente_id, monto, metodo_pago)
  values (v_cita_id, v_medico.clinica_id, auth.uid(), v_medico.precio_consulta, p_metodo_pago);

  return v_cita_id;
end;
$$;

-- fn_confirmar_pago_efectivo: el médico o el administrador de la clínica
-- confirman en recepción que el paciente ya pagó en efectivo. Hace lo mismo
-- que el webhook de Stripe hace para tarjeta, pero disparado manualmente.
create or replace function public.fn_confirmar_pago_efectivo(p_cita_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cita citas%rowtype;
begin
  select * into v_cita from citas where id = p_cita_id;
  if not found then
    raise exception 'Cita no encontrada';
  end if;

  if v_cita.medico_id <> fn_mi_medico_id()
     and not (fn_mi_rol() = 'admin_clinica' and v_cita.clinica_id = fn_mi_clinica())
  then
    raise exception 'No autorizado';
  end if;

  update pagos
     set estado = 'pagado', pagado_en = now()
   where cita_id = p_cita_id
     and metodo_pago = 'efectivo';

  update citas
     set estado = 'confirmada', bloqueo_expira_en = null
   where id = p_cita_id
     and estado in ('bloqueada', 'pendiente_pago');
end;
$$;
