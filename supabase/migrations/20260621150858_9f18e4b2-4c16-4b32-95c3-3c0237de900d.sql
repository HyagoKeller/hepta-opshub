
CREATE TABLE public.atestados (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  cliente TEXT NOT NULL,
  tipo_servico TEXT NOT NULL,
  descricao TEXT,
  valor_contrato NUMERIC(14,2),
  data_inicio DATE,
  data_fim DATE,
  vigente BOOLEAN NOT NULL DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  arquivo_url TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.solucoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  categoria TEXT NOT NULL,
  fabricante TEXT,
  descricao TEXT,
  diferenciais TEXT,
  margem_estimada NUMERIC(5,2),
  certificacoes TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.triagens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  licitacao_id TEXT NOT NULL,
  licitacao_titulo TEXT,
  orgao TEXT,
  valor_estimado NUMERIC(14,2),
  score_aderencia INTEGER,
  nivel TEXT,
  resumo TEXT,
  pontos_fortes JSONB DEFAULT '[]',
  pontos_fracos JSONB DEFAULT '[]',
  atestados_match JSONB DEFAULT '[]',
  solucoes_match JSONB DEFAULT '[]',
  rentabilidade JSONB DEFAULT '{}',
  recomendacao TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.favoritos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  licitacao_id TEXT NOT NULL UNIQUE,
  licitacao_payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'monitorando',
  notas TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.atestados TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.solucoes TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.triagens TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.favoritos TO anon, authenticated;
GRANT ALL ON public.atestados, public.solucoes, public.triagens, public.favoritos TO service_role;

ALTER TABLE public.atestados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solucoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.triagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favoritos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "open_all" ON public.atestados FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "open_all" ON public.solucoes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "open_all" ON public.triagens FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "open_all" ON public.favoritos FOR ALL USING (true) WITH CHECK (true);

INSERT INTO public.solucoes (nome, categoria, fabricante, descricao, diferenciais, margem_estimada, certificacoes, tags) VALUES
('InvGate Service Management', 'ITSM', 'InvGate', 'Plataforma ITSM/ITIL para gestão de serviços, incidentes, problemas e mudanças.', 'Implantação rápida, UX moderna, ITIL v4, automações com IA.', 35.00, ARRAY['ITIL 4','Partner InvGate Gold'], ARRAY['itsm','service desk','itil','750']),
('InvGate Asset Management', 'ITAM', 'InvGate', 'Gestão completa de ativos de TI, inventário automático e ciclo de vida.', 'Discovery agentless, CMDB integrado, conformidade de licenças.', 32.00, ARRAY['Partner InvGate Gold'], ARRAY['itam','cmdb','inventario','750']),
('Fábrica de Software', 'Desenvolvimento', 'Hepta', 'Equipe alocada para desenvolvimento de sistemas sob demanda (UST/FP).', 'Squads multidisciplinares, métricas SLA, integração DevSecOps.', 28.00, ARRAY['MPS.BR','ISO 27001'], ARRAY['fabrica','ust','desenvolvimento','1070']),
('Sustentação de Sistemas', 'Operação', 'Hepta', 'Sustentação evolutiva e corretiva de sistemas em produção.', '24x7, SLA por severidade, observabilidade.', 30.00, ARRAY['ITIL 4'], ARRAY['sustentacao','n2','n3','1070']);
