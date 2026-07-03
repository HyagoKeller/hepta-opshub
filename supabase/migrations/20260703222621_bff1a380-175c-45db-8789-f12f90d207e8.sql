-- ══════════════════════════════════════════════════════════════════════════
-- Núcleo 03 · Automações & Transformação Digital
-- Mesmo padrão de RLS "open_all" do Núcleo 02 nesta fase (mock).
-- Em V2, migrar para user_roles + user_module_access (ver docs/security.md).
-- ══════════════════════════════════════════════════════════════════════════

-- 1) automacoes ─────────────────────────────────────────────────────────────
CREATE TABLE public.automacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT NOT NULL DEFAULT 'low_code' CHECK (tipo IN ('no_code','low_code','code')),
  estagio TEXT NOT NULL DEFAULT 'ideia' CHECK (
    estagio IN ('ideia','oportunidade','viabilidade','poc','piloto','produto_interno','oferta_cliente')
  ),
  nucleo_origem_id TEXT,
  responsavel_id TEXT,
  responsavel_nome TEXT,
  custo_estimado NUMERIC(14,2),
  economia_estimada NUMERIC(14,2),
  economia_realizada NUMERIC(14,2),
  complexidade TEXT NOT NULL DEFAULT 'media' CHECK (complexidade IN ('baixa','media','alta')),
  risco TEXT NOT NULL DEFAULT 'medio' CHECK (risco IN ('baixo','medio','alto')),
  maturidade TEXT NOT NULL DEFAULT 'experimental' CHECK (
    maturidade IN ('experimental','estavel','consolidada')
  ),
  reusavel BOOLEAN NOT NULL DEFAULT false,
  stack_integracoes TEXT[] NOT NULL DEFAULT '{}',
  tags TEXT[] NOT NULL DEFAULT '{}',
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.automacoes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.automacoes TO anon;
GRANT ALL ON public.automacoes TO service_role;

ALTER TABLE public.automacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "automacoes_open_all" ON public.automacoes
  FOR ALL USING (true) WITH CHECK (true);

-- 2) automacao_historico ────────────────────────────────────────────────────
CREATE TABLE public.automacao_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automacao_id UUID NOT NULL REFERENCES public.automacoes(id) ON DELETE CASCADE,
  estagio_anterior TEXT,
  estagio_novo TEXT NOT NULL,
  nota TEXT,
  autor_id TEXT,
  autor_nome TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.automacao_historico TO authenticated;
GRANT SELECT, INSERT ON public.automacao_historico TO anon;
GRANT ALL ON public.automacao_historico TO service_role;

ALTER TABLE public.automacao_historico ENABLE ROW LEVEL SECURITY;
CREATE POLICY "automacao_historico_open_all" ON public.automacao_historico
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX idx_automacao_historico_automacao ON public.automacao_historico(automacao_id, criado_em DESC);

-- 3) automacao_ofertas ─────────────────────────────────────────────────────
CREATE TABLE public.automacao_ofertas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automacao_id UUID NOT NULL REFERENCES public.automacoes(id) ON DELETE CASCADE,
  nome_oferta TEXT NOT NULL,
  descricao_comercial TEXT,
  clientes_aplicaveis TEXT[] NOT NULL DEFAULT '{}',
  margem_estimada NUMERIC(5,2),
  status TEXT NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa','descontinuada')),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.automacao_ofertas TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.automacao_ofertas TO anon;
GRANT ALL ON public.automacao_ofertas TO service_role;

ALTER TABLE public.automacao_ofertas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "automacao_ofertas_open_all" ON public.automacao_ofertas
  FOR ALL USING (true) WITH CHECK (true);

-- 4) Trigger utilitário: mantém atualizado_em em automacoes/ofertas ─────────
CREATE OR REPLACE FUNCTION public.tg_touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.atualizado_em = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_automacoes_touch
  BEFORE UPDATE ON public.automacoes
  FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

CREATE TRIGGER trg_automacao_ofertas_touch
  BEFORE UPDATE ON public.automacao_ofertas
  FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- 5) Trigger de auditoria: grava histórico a cada mudança de estágio ───────
CREATE OR REPLACE FUNCTION public.tg_automacao_log_estagio()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.estagio IS DISTINCT FROM OLD.estagio THEN
    INSERT INTO public.automacao_historico (automacao_id, estagio_anterior, estagio_novo, nota)
    VALUES (NEW.id, OLD.estagio, NEW.estagio, 'Alteração automática via trigger');
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.automacao_historico (automacao_id, estagio_anterior, estagio_novo, nota)
    VALUES (NEW.id, NULL, NEW.estagio, 'Automação criada');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_automacoes_estagio_audit
  AFTER INSERT OR UPDATE OF estagio ON public.automacoes
  FOR EACH ROW EXECUTE FUNCTION public.tg_automacao_log_estagio();
