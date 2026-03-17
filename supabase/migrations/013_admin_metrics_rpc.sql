-- Migration: RPC para métricas do dashboard admin
-- Retorna KPIs agregados para consultas

CREATE OR REPLACE FUNCTION get_admin_metrics(
  p_date_from DATE DEFAULT (CURRENT_DATE - INTERVAL '30 days'),
  p_date_to DATE DEFAULT (CURRENT_DATE + INTERVAL '7 days')
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_result JSONB;
  v_total_agendadas INT;
  v_total_confirmadas INT;
  v_total_canceladas INT;
  v_total_realizadas INT;
  v_consultas_proximos_7_dias JSONB;
  v_por_dia JSONB;
BEGIN
  IF NOT (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR EXISTS (SELECT 1 FROM public.profiles p JOIN public.roles r ON p.role_id = r.id WHERE p.id = auth.uid() AND r.name = 'Administrador')
  ) THEN
    RAISE EXCEPTION 'Sem permissão';
  END IF;

  SELECT COUNT(*) INTO v_total_agendadas FROM public.appointments
    WHERE status = 'agendada' AND appointment_date BETWEEN p_date_from AND p_date_to;
  SELECT COUNT(*) INTO v_total_confirmadas FROM public.appointments
    WHERE status = 'confirmada' AND appointment_date BETWEEN p_date_from AND p_date_to;
  SELECT COUNT(*) INTO v_total_canceladas FROM public.appointments
    WHERE status = 'cancelada' AND appointment_date BETWEEN p_date_from AND p_date_to;
  SELECT COUNT(*) INTO v_total_realizadas FROM public.appointments
    WHERE status = 'realizada' AND appointment_date BETWEEN p_date_from AND p_date_to;

  SELECT jsonb_agg(row) INTO v_consultas_proximos_7_dias
  FROM (
    SELECT d.name AS doctor_name, COUNT(a.id) AS total
    FROM public.doctors d
    LEFT JOIN public.appointments a ON a.doctor_id = d.id
      AND a.appointment_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
      AND a.status NOT IN ('cancelada')
    WHERE d.is_active = true
    GROUP BY d.id, d.name
  ) row;

  SELECT jsonb_object_agg(dt, cnt) INTO v_por_dia
  FROM (
    SELECT appointment_date::text AS dt, COUNT(*) AS cnt
    FROM public.appointments
    WHERE appointment_date BETWEEN p_date_from AND p_date_to
      AND status NOT IN ('cancelada')
    GROUP BY appointment_date
  ) sub;

  v_result := jsonb_build_object(
    'total_agendadas', COALESCE(v_total_agendadas, 0),
    'total_confirmadas', COALESCE(v_total_confirmadas, 0),
    'total_canceladas', COALESCE(v_total_canceladas, 0),
    'total_realizadas', COALESCE(v_total_realizadas, 0),
    'taxa_cancelamento', CASE WHEN (v_total_agendadas + v_total_confirmadas + v_total_canceladas) > 0
      THEN ROUND(100.0 * v_total_canceladas / NULLIF(v_total_agendadas + v_total_confirmadas + v_total_canceladas, 0), 1)
      ELSE 0 END,
    'consultas_proximos_7_dias', COALESCE(v_consultas_proximos_7_dias, '[]'::jsonb),
    'por_dia', COALESCE(v_por_dia, '{}'::jsonb),
    'periodo', jsonb_build_object('de', p_date_from, 'ate', p_date_to)
  );
  RETURN v_result;
END;
$$;
