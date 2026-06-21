
-- 1. Company Profile (singleton)
CREATE TABLE public.company_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL DEFAULT 'Hepta',
  missao text,
  especialidades jsonb NOT NULL DEFAULT '[]'::jsonb,
  frameworks text[] NOT NULL DEFAULT '{}'::text[],
  tecnologias text[] NOT NULL DEFAULT '{}'::text[],
  certificacoes text[] NOT NULL DEFAULT '{}'::text[],
  diferenciais text,
  blacklist_custom text[] NOT NULL DEFAULT '{}'::text[],
  valor_minimo numeric NOT NULL DEFAULT 50000,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.company_profile TO authenticated, anon;
GRANT ALL ON public.company_profile TO service_role;

ALTER TABLE public.company_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY open_all ON public.company_profile FOR ALL USING (true) WITH CHECK (true);

-- 2. Oportunidades Estratégicas (REQ-10)
CREATE TABLE public.oportunidades_estrategicas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  licitacao_id text NOT NULL,
  licitacao_titulo text,
  orgao text,
  uf text,
  valor_estimado numeric,
  score_aderencia integer,
  nivel text,
  resumo_executivo jsonb DEFAULT '[]'::jsonb,
  recomendacao text,
  responsavel text,
  status text NOT NULL DEFAULT 'novo',
  triagem_payload jsonb,
  licitacao_payload jsonb,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.oportunidades_estrategicas TO authenticated, anon;
GRANT ALL ON public.oportunidades_estrategicas TO service_role;

ALTER TABLE public.oportunidades_estrategicas ENABLE ROW LEVEL SECURITY;
CREATE POLICY open_all ON public.oportunidades_estrategicas FOR ALL USING (true) WITH CHECK (true);

-- 3. Triagens: novos campos
ALTER TABLE public.triagens
  ADD COLUMN IF NOT EXISTS resumo_executivo jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS requisitos_extraidos jsonb DEFAULT '{}'::jsonb;

-- 4. Seed perfil padrão da Hepta
INSERT INTO public.company_profile (nome, missao, especialidades, frameworks, tecnologias, certificacoes, diferenciais, blacklist_custom, valor_minimo)
VALUES (
  'Hepta',
  'Implementar, sustentar e evoluir plataformas de TI corporativa com governança, automação e squads multidisciplinares.',
  '[
    {"area":"ITSM/ESM","nivel":"especialista","descricao":"Implementação, configuração e operação de plataformas ITSM e ESM"},
    {"area":"Governança de TI","nivel":"especialista","descricao":"Práticas ágeis, ITIL, COBIT e frameworks de serviços"},
    {"area":"Automação & IA","nivel":"especialista","descricao":"Desenvolvimento de agentes de IA e ecossistemas Copilot"},
    {"area":"Squads de Desenvolvimento","nivel":"especialista","descricao":"Alocação de squads de engenharia de software e suporte multinível"}
  ]'::jsonb,
  ARRAY['ITIL v4','COBIT','SAFe','Scrum','DevOps','TOGAF'],
  ARRAY['InvGate','ServiceNow','Jira Service Management','Microsoft Copilot','Azure OpenAI','Power Platform','Microsoft 365','GLPI'],
  ARRAY['ISO 27001','ISO 20000','MPS-Br','CMMI'],
  'Squads dedicados ao setor público, atestados em órgãos federais, fábrica de software certificada.',
  ARRAY['alimentos','gêneros alimentícios','refeição','merenda','hortifruti','limpeza','conservação','vigilância armada','asfalto','cimento','uniformes','veículos','medicamento','medicamentos','combustível','combustivel','mobiliário','mobiliario','obra civil','reforma predial'],
  50000
);
