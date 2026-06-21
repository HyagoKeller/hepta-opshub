// Proxy para API pública do PNCP (gov.br/pncp) com camada de PURIFICAÇÃO determinística.
// REQ-01 (CATSER/CATMAT TI via keywords), REQ-02 (Blacklist), REQ-03 (Modalidade + valor mínimo).
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const PNCP_BASE = 'https://pncp.gov.br/api/consulta/v1';

// 6 = Pregão Eletrônico | 8 = Dispensa | 4 = Concorrência Eletrônica | 12 = Credenciamento
const DEFAULT_MODALIDADES = [6, 4];

// REQ-01: Keywords alinhadas a CATSER/CATMAT do Grupo TI (Portarias SGD 750 e 1070).
const TI_KEYWORDS = [
  'tecnologia da informa', 'tic', 'sistema', 'software', 'desenvolvimento',
  'sustenta', 'service desk', 'help desk', 'help-desk', 'itsm', 'esm', 'itil',
  'fábrica de software', 'fabrica de software', 'cloud', 'nuvem', 'datacenter',
  'data center', 'cibersegur', 'segurança da informa', 'rede', 'infraestrutura',
  'observabilidade', 'monitoramento', 'devops', 'devsecops', 'inteligência artificial',
  'analytics', 'business intelligence', ' bi ', 'ust', 'ponto de função', 'computa',
  'copilot', 'automação', 'rpa', 'low-code', 'low code', 'governança de ti',
  'arquitetura de soluç', 'engenharia de software', 'suporte técnico', 'n1', 'n2', 'n3',
  'sustentação de sistema', 'sustentaçao de sistema',
];

// REQ-02: Blacklist padrão (palavras negativas que descartam o edital).
const DEFAULT_BLACKLIST = [
  'alimentos', 'gêneros alimentícios', 'generos alimenticios', 'refeição', 'refeicao',
  'merenda', 'hortifruti', 'limpeza', 'conservação', 'conservacao', 'vigilância armada',
  'vigilancia armada', 'asfalto', 'cimento', 'uniformes', 'veículos', 'veiculos',
  'medicamento', 'medicamentos', 'combustível', 'combustivel', 'mobiliário', 'mobiliario',
  'obra civil', 'reforma predial', 'jardinagem', 'capina', 'pintura predial',
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
  for (const w of blacklist) {
    if (lower.includes(w.toLowerCase())) return w;
  }
  return null;
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
    const valorMinimo: number = Number(body.valorMinimo ?? 50000); // REQ-03
    const blacklistExtra: string[] = Array.isArray(body.blacklistExtra) ? body.blacklistExtra : [];
    const incluirDescartados: boolean = body.incluirDescartados ?? false;
    const pagina: number = body.pagina ?? 1;
    const tamanho: number = Math.min(body.tamanho ?? 50, 50);

    const blacklist = [...DEFAULT_BLACKLIST, ...blacklistExtra.map((b) => b.toLowerCase())];

    const dataFinal = new Date();
    const dataInicial = new Date();
    dataInicial.setDate(dataInicial.getDate() - diasAtras);

    const calls = modalidades.map(async (modalidade) => {
      const url = new URL(`${PNCP_BASE}/contratacoes/publicacao`);
      url.searchParams.set('dataInicial', ymd(dataInicial));
      url.searchParams.set('dataFinal', ymd(dataFinal));
      url.searchParams.set('codigoModalidadeContratacao', String(modalidade));
      url.searchParams.set('pagina', String(pagina));
      url.searchParams.set('tamanhoPagina', String(tamanho));
      if (uf) url.searchParams.set('uf', uf);
      const r = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
      if (!r.ok) {
        console.error('PNCP error', modalidade, r.status, await r.text());
        return { data: [] as any[], totalRegistros: 0 };
      }
      return r.json();
    });

    const results = await Promise.all(calls);
    let merged: any[] = [];
    let totalRegistros = 0;
    for (const r of results) {
      if (Array.isArray(r?.data)) merged = merged.concat(r.data);
      totalRegistros += r?.totalRegistros ?? 0;
    }

    // Normaliza + aplica purificação determinística (status: candidate | discarded)
    const normalized = merged.map((it: any) => {
      const objeto = it.objetoCompra ?? it.objeto ?? '';
      const amparo = it.amparoLegal?.nome ?? '';
      const valor = it.valorTotalEstimado ?? null;
      const ti = isTiObject(objeto);
      const black = blacklistHit(objeto, blacklist);

      // Decisão de purificação (REQ-02, REQ-03)
      let status: 'candidate' | 'discarded' = 'candidate';
      const motivos: string[] = [];
      if (black) { status = 'discarded'; motivos.push(`Blacklist: "${black}"`); }
      if (filtroTI && !ti) { status = 'discarded'; motivos.push('Fora do escopo de TI (CATSER/CATMAT TI)'); }
      if (valor !== null && valor > 0 && valor < valorMinimo) {
        status = 'discarded';
        motivos.push(`Valor estimado abaixo do mínimo (R$ ${valorMinimo.toLocaleString('pt-BR')})`);
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

    // Dedup
    const seen = new Set<string>();
    filtered = filtered.filter((i) => (seen.has(i.id) ? false : (seen.add(i.id), true)));
    filtered.sort((a, b) => (b.dataPublicacao ?? '').localeCompare(a.dataPublicacao ?? ''));

    const stats = {
      total_bruto: normalized.length,
      candidatos: normalized.filter((i) => i.status === 'candidate').length,
      descartados: normalized.filter((i) => i.status === 'discarded').length,
      descartados_blacklist: normalized.filter((i) => i.motivos_descarte.some((m) => m.startsWith('Blacklist'))).length,
      descartados_fora_ti: normalized.filter((i) => i.motivos_descarte.some((m) => m.startsWith('Fora do escopo'))).length,
      descartados_valor: normalized.filter((i) => i.motivos_descarte.some((m) => m.startsWith('Valor estimado'))).length,
    };

    return new Response(
      JSON.stringify({
        items: filtered,
        meta: {
          ...stats,
          totalRegistros,
          intervalo: { de: ymd(dataInicial), ate: ymd(dataFinal) },
          modalidades,
          valorMinimo,
          blacklistAplicada: blacklist.length,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    console.error('pncp-search error', e);
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
