// Proxy PNCP com camada de PURIFICAÇÃO determinística.
// REQ-01 (CATSER/CATMAT TI via keywords), REQ-02 (Blacklist), REQ-03 (Modalidade + valor mínimo).
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const PNCP_BASE = 'https://pncp.gov.br/api/consulta/v1';

// Modalidades cobertas por padrão (Lei 14.133 + Lei 8.666 legada):
// 6 Pregão Eletrônico | 4 Concorrência Eletrônica | 8 Dispensa | 7 Concorrência Presencial | 5 Pregão Presencial | 9 Inexigibilidade
const DEFAULT_MODALIDADES = [6, 4, 8];
const MAX_PAGES = 3;         // paginação: até 3 páginas por modalidade
const PAGE_SIZE = 500;       // PNCP aceita até 500 por página

// REQ-01: Keywords TI (Portarias SGD 750/2023 e 1070/2023 + CATSER/CATMAT).
const TI_KEYWORDS = [
  'tecnologia da informa', ' tic ', 'sistema', 'software', 'aplicativo', 'aplicação', 'app ',
  'desenvolvimento', 'sustenta', 'service desk', 'help desk', 'help-desk', 'central de servi',
  'itsm', 'esm', 'itil', 'fábrica de software', 'fabrica de software', 'fábrica de sistemas',
  'cloud', 'nuvem', 'datacenter', 'data center', 'hospedagem', 'colocation',
  'cibersegur', 'segurança da informa', 'seguranca da informa', 'siem', 'soc ', 'edr', 'xdr',
  'rede', 'infraestrutura de ti', 'observabilidade', 'monitoramento', 'devops', 'devsecops',
  'inteligência artificial', 'inteligencia artificial', ' ia ', 'analytics', 'business intelligence',
  ' bi ', 'ust', 'ponto de função', 'ponto de funcao', 'computação', 'computacao',
  'copilot', 'automação', 'automacao', 'rpa', 'low-code', 'low code', 'no-code', 'no code',
  'governança de ti', 'governanca de ti', 'arquitetura de solu', 'engenharia de software',
  'suporte técnico', 'suporte tecnico', ' n1 ', ' n2 ', ' n3 ',
  'sustentação de sistema', 'sustentacao de sistema', 'outsourcing', 'body shop',
  'portal', 'website', 'site institucional', 'e-gov', 'gov.br',
  'servidor', 'storage', 'backup', 'firewall', 'switch', 'roteador',
  'licenç', 'licenc', 'microsoft', 'oracle', 'sap', 'servicenow', 'invgate',
  'crm', 'erp', 'workflow', 'assinatura digital', 'certificado digital',
];

const DEFAULT_BLACKLIST = [
  'alimentos', 'gêneros alimentícios', 'generos alimenticios', 'refeição', 'refeicao',
  'merenda', 'hortifruti', 'limpeza predial', 'conservação predial', 'conservacao predial',
  'vigilância armada', 'vigilancia armada', 'asfalto', 'cimento', 'uniformes',
  'veículos automotores', 'veiculos automotores', 'medicamento', 'medicamentos',
  'combustível', 'combustivel', 'mobiliário escolar', 'mobiliario escolar',
  'obra civil', 'reforma predial', 'jardinagem', 'capina', 'pintura predial',
  'material de escritório', 'material de escritorio', 'material esportivo',
];

function ymd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}
function isTiObject(text: string) {
  if (!text) return false;
  const lower = ` ${text.toLowerCase()} `;
  return TI_KEYWORDS.some((k) => lower.includes(k));
}
function blacklistHit(text: string, blacklist: string[]): string | null {
  if (!text) return null;
  const lower = ` ${text.toLowerCase()} `;
  for (const w of blacklist) if (lower.includes(w.toLowerCase())) return w;
  return null;
}

async function fetchModalidade(modalidade: number, dataInicial: Date, dataFinal: Date, uf?: string) {
  const collected: any[] = [];
  let totalRegistros = 0;
  for (let pagina = 1; pagina <= MAX_PAGES; pagina++) {
    const url = new URL(`${PNCP_BASE}/contratacoes/publicacao`);
    url.searchParams.set('dataInicial', ymd(dataInicial));
    url.searchParams.set('dataFinal', ymd(dataFinal));
    url.searchParams.set('codigoModalidadeContratacao', String(modalidade));
    url.searchParams.set('pagina', String(pagina));
    url.searchParams.set('tamanhoPagina', String(PAGE_SIZE));
    if (uf) url.searchParams.set('uf', uf);
    const r = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
    if (!r.ok) {
      console.error('PNCP error', modalidade, 'pg', pagina, r.status);
      break;
    }
    const j = await r.json().catch(() => null);
    if (!j || !Array.isArray(j.data)) break;
    collected.push(...j.data);
    totalRegistros = j.totalRegistros ?? totalRegistros;
    if (j.data.length < PAGE_SIZE) break;
    if (collected.length >= totalRegistros) break;
  }
  return { data: collected, totalRegistros };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const body = await req.json().catch(() => ({}));
    const diasAtras: number = body.diasAtras ?? 7;
    const modalidades: number[] = body.modalidades ?? DEFAULT_MODALIDADES;
    const palavraChave: string | undefined = body.palavraChave?.toString().trim().toLowerCase() || undefined;
    const uf: string | undefined = body.uf?.toString().toUpperCase() || undefined;
    const filtroTI: boolean = body.filtroTI ?? true;
    const valorMinimo: number = Number(body.valorMinimo ?? 50000);
    const blacklistExtra: string[] = Array.isArray(body.blacklistExtra) ? body.blacklistExtra : [];
    const incluirDescartados: boolean = body.incluirDescartados ?? false;

    const blacklist = [...DEFAULT_BLACKLIST, ...blacklistExtra.map((b) => b.toLowerCase())];
    const dataFinal = new Date();
    const dataInicial = new Date();
    dataInicial.setDate(dataInicial.getDate() - diasAtras);

    const results = await Promise.all(modalidades.map((m) => fetchModalidade(m, dataInicial, dataFinal, uf)));
    let merged: any[] = [];
    let totalRegistros = 0;
    for (const r of results) { merged = merged.concat(r.data); totalRegistros += r.totalRegistros ?? 0; }

    const normalized = merged.map((it: any) => {
      const objeto = it.objetoCompra ?? it.objeto ?? '';
      const amparo = it.amparoLegal?.nome ?? '';
      const valor = it.valorTotalEstimado ?? null;
      const ti = isTiObject(objeto);
      const black = blacklistHit(objeto, blacklist);

      let status: 'candidate' | 'discarded' = 'candidate';
      const motivos: string[] = [];
      if (black) { status = 'discarded'; motivos.push(`Blacklist: "${black}"`); }
      if (filtroTI && !ti) { status = 'discarded'; motivos.push('Fora do escopo de TI (nenhuma keyword CATSER/CATMAT bateu)'); }
      if (valor !== null && valor > 0 && valor < valorMinimo) {
        status = 'discarded';
        motivos.push(`Valor R$ ${Number(valor).toLocaleString('pt-BR')} < mínimo R$ ${valorMinimo.toLocaleString('pt-BR')}`);
      }

      return {
        id: it.numeroControlePNCP ?? `${it.orgaoEntidade?.cnpj ?? 'x'}-${it.numeroCompra ?? Math.random()}`,
        numeroControlePNCP: it.numeroControlePNCP,
        objeto,
        modalidade: it.modalidadeNome ?? it.modalidadeId,
        modalidadeId: it.modalidadeId,
        orgao: it.orgaoEntidade?.razaoSocial ?? '—',
        cnpjOrgao: it.orgaoEntidade?.cnpj,
        unidade: it.unidadeOrgao?.nomeUnidade,
        uf: it.unidadeOrgao?.ufSigla,
        municipio: it.unidadeOrgao?.municipioNome,
        valorEstimado: valor,
        dataPublicacao: it.dataPublicacaoPncp ?? it.dataInclusao,
        dataAbertura: it.dataAberturaProposta,
        dataEncerramento: it.dataEncerramentoProposta,
        situacao: it.situacaoCompraNome,
        linkSistemaOrigem: it.linkSistemaOrigem,
        amparoLegal: amparo,
        aderencia: {
          ti,
          portaria750: /750\/2023|sgd[\s\-_]*750/i.test(objeto + ' ' + amparo),
          portaria1070: /1\.?070\/2023|sgd[\s\-_]*1\.?070/i.test(objeto + ' ' + amparo),
          lei14133: /14\.?133|in\s*sgd\s*94|in\s*94/i.test(objeto + ' ' + amparo),
        },
        status,
        motivos_descarte: motivos,
        raw: it,
      };
    });

    let filtered = normalized;
    if (palavraChave) filtered = filtered.filter((i) => i.objeto?.toLowerCase().includes(palavraChave));
    if (!incluirDescartados) filtered = filtered.filter((i) => i.status === 'candidate');

    const seen = new Set<string>();
    filtered = filtered.filter((i) => (seen.has(i.id) ? false : (seen.add(i.id), true)));
    filtered.sort((a, b) => (b.dataPublicacao ?? '').localeCompare(a.dataPublicacao ?? ''));

    const stats = {
      total_bruto: normalized.length,
      candidatos: normalized.filter((i) => i.status === 'candidate').length,
      descartados: normalized.filter((i) => i.status === 'discarded').length,
      descartados_blacklist: normalized.filter((i) => i.motivos_descarte.some((m) => m.startsWith('Blacklist'))).length,
      descartados_fora_ti: normalized.filter((i) => i.motivos_descarte.some((m) => m.startsWith('Fora do escopo'))).length,
      descartados_valor: normalized.filter((i) => i.motivos_descarte.some((m) => m.startsWith('Valor'))).length,
    };

    return new Response(JSON.stringify({
      items: filtered,
      meta: { ...stats, totalRegistros, intervalo: { de: ymd(dataInicial), ate: ymd(dataFinal) }, modalidades, valorMinimo, blacklistAplicada: blacklist.length, paginasPorModalidade: MAX_PAGES },
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('pncp-search error', e);
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
