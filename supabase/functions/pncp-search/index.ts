// Proxy para API pública do PNCP (gov.br/pncp)
// Docs: https://pncp.gov.br/api/consulta/swagger-ui/index.html
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const PNCP_BASE = 'https://pncp.gov.br/api/consulta/v1';

// Códigos de modalidade comuns
// 6 = Pregão Eletrônico | 8 = Dispensa | 4 = Concorrência Eletrônica | 12 = Credenciamento
const DEFAULT_MODALIDADES = [6, 8, 4];

// Palavras-chave para filtrar objeto de TI (alinhado às Portarias SGD 750/2023 e 1070/2023)
const TI_KEYWORDS = [
  'tecnologia da informa',
  'tic',
  'sistema',
  'software',
  'desenvolvimento',
  'sustenta',
  'service desk',
  'help desk',
  'help-desk',
  'itsm',
  'itil',
  'fábrica de software',
  'fabrica de software',
  'cloud',
  'nuvem',
  'datacenter',
  'data center',
  'cibersegur',
  'segurança da informa',
  'rede',
  'infraestrutura',
  'observabilidade',
  'monitoramento',
  'devops',
  'devsecops',
  'inteligência artificial',
  'analytics',
  'business intelligence',
  ' bi ',
  'ust',
  'ponto de função',
  'computa',
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const diasAtras: number = body.diasAtras ?? 7;
    const modalidades: number[] = body.modalidades ?? DEFAULT_MODALIDADES;
    const palavraChave: string | undefined = body.palavraChave?.toString().trim().toLowerCase() || undefined;
    const uf: string | undefined = body.uf?.toString().toUpperCase() || undefined;
    const filtroTI: boolean = body.filtroTI ?? true;
    const pagina: number = body.pagina ?? 1;
    const tamanho: number = Math.min(body.tamanho ?? 50, 50);

    const dataFinal = new Date();
    const dataInicial = new Date();
    dataInicial.setDate(dataInicial.getDate() - diasAtras);

    // PNCP exige uma chamada por modalidade. Fazemos em paralelo.
    const calls = modalidades.map(async (modalidade) => {
      const url = new URL(`${PNCP_BASE}/contratacoes/publicacao`);
      url.searchParams.set('dataInicial', ymd(dataInicial));
      url.searchParams.set('dataFinal', ymd(dataFinal));
      url.searchParams.set('codigoModalidadeContratacao', String(modalidade));
      url.searchParams.set('pagina', String(pagina));
      url.searchParams.set('tamanhoPagina', String(tamanho));
      if (uf) url.searchParams.set('uf', uf);

      const r = await fetch(url.toString(), {
        headers: { Accept: 'application/json' },
      });
      if (!r.ok) {
        console.error('PNCP error', modalidade, r.status, await r.text());
        return { data: [] as any[], totalRegistros: 0, totalPaginas: 0 };
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

    // Normaliza e enriquece
    const normalized = merged.map((it: any) => {
      const objeto = it.objetoCompra ?? it.objeto ?? '';
      return {
        id:
          it.numeroControlePNCP ??
          `${it.orgaoEntidade?.cnpj ?? 'x'}-${it.numeroCompra ?? Math.random()}`,
        numeroControlePNCP: it.numeroControlePNCP,
        objeto,
        modalidade: it.modalidadeNome ?? it.modalidadeId,
        modalidadeId: it.modalidadeId,
        orgao: it.orgaoEntidade?.razaoSocial ?? '—',
        cnpjOrgao: it.orgaoEntidade?.cnpj,
        unidade: it.unidadeOrgao?.nomeUnidade,
        uf: it.unidadeOrgao?.ufSigla,
        municipio: it.unidadeOrgao?.municipioNome,
        valorEstimado: it.valorTotalEstimado ?? null,
        dataPublicacao: it.dataPublicacaoPncp ?? it.dataInclusao,
        dataAbertura: it.dataAberturaProposta,
        dataEncerramento: it.dataEncerramentoProposta,
        situacao: it.situacaoCompraNome,
        linkSistemaOrigem: it.linkSistemaOrigem,
        amparoLegal: it.amparoLegal?.nome,
        // Heurística simples para destacar Portarias 750/1070
        aderencia: {
          ti: isTiObject(objeto),
          portaria750: /750\/2023|sgd[\s\-_]*750|in\s*94|14\.?133/i.test(objeto + ' ' + (it.amparoLegal?.nome ?? '')),
          portaria1070: /1\.?070\/2023|sgd[\s\-_]*1\.?070/i.test(objeto + ' ' + (it.amparoLegal?.nome ?? '')),
        },
        raw: it,
      };
    });

    let filtered = normalized;
    if (filtroTI) filtered = filtered.filter((i) => i.aderencia.ti);
    if (palavraChave) filtered = filtered.filter((i) => i.objeto?.toLowerCase().includes(palavraChave));

    // Dedup por id
    const seen = new Set<string>();
    filtered = filtered.filter((i) => {
      if (seen.has(i.id)) return false;
      seen.add(i.id);
      return true;
    });

    // Ordena por dataPublicacao desc
    filtered.sort((a, b) => (b.dataPublicacao ?? '').localeCompare(a.dataPublicacao ?? ''));

    return new Response(
      JSON.stringify({
        items: filtered,
        meta: {
          totalAntesFiltro: normalized.length,
          totalAposFiltro: filtered.length,
          totalRegistros,
          intervalo: { de: ymd(dataInicial), ate: ymd(dataFinal) },
          modalidades,
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
