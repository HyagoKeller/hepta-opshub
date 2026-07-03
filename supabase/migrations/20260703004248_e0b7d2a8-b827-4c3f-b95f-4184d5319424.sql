CREATE TABLE public.perfis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  cargo text NOT NULL,
  senioridade text NOT NULL DEFAULT 'pleno',
  skills text[] NOT NULL DEFAULT '{}',
  certificacoes text[] NOT NULL DEFAULT '{}',
  frameworks text[] NOT NULL DEFAULT '{}',
  custo_hora numeric,
  disponibilidade_pct integer NOT NULL DEFAULT 100,
  ativo boolean NOT NULL DEFAULT true,
  observacoes text,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.perfis TO anon, authenticated;
GRANT ALL ON public.perfis TO service_role;

ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;

CREATE POLICY open_all ON public.perfis FOR ALL USING (true) WITH CHECK (true);