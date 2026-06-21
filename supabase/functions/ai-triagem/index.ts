// Triagem contextual via Lovable AI Gateway (Gemini).
// Pipeline em 2 etapas internas:
//   REQ-06: Validação semântica de TI (SIM/NÃO) — barato e rápido (gemini-flash).
//   REQ-07 + REQ-08 + REQ-09: Extração estruturada de requisitos, score de aderência,
//                              categorização BID/PARCIAL/NO-BID e resumo executivo (3 tópicos).
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const GATEWAY = 'https://ai.gateway.lovable.dev/v1/chat/completions';

// ===== ETAPA 1 — REQ-06 — Validação semântica restritiva =====
const SYS_VALIDACAO = `Você é classificador rigoroso de licitações públicas brasileiras. Analise o "Objeto" do edital e diga, em UMA palavra, se é uma contratação de serviços ou produtos de TECNOLOGIA DA INFORMAÇÃO CORPORATIVA (software, sustentação, fábrica, ITSM/ESM, cloud, segurança, suporte, dev, IA, automação, governança de TI). Responda apenas: SIM ou NAO.`;

// ===== ETAPA 2 — REQ-07/08/09 — Triagem completa =====
const SYS_TRIAGEM = `Você é especialista em licitações de TI no Brasil (Lei 14.133/21, IN SGD 94/2022, Portarias SGD/MGI 750/2023 e 1070/2023).

Você recebe:
- A licitação (objeto, modalidade, valor, órgão).
- O CORE BUSINESS da empresa (especialidades, frameworks, tecnologias, certificações).
- O ACERVO DE ATESTADOS (CAT) da empresa.
- O CATÁLOGO DE SOLUÇÕES que a empresa entrega.

TAREFA — Retorne ESTRITAMENTE um JSON neste schema, sem markdown, sem texto fora do JSON:
{
  "requisitos_extraidos": {
    "tecnologias_exigidas": ["..."],
    "certificacoes_obrigatorias": ["..."],
    "volume_estimado": "string descrevendo volume (UST, pontos de função, usuários, postos)",
    "perfis_profissionais": ["..."],
    "prazo_execucao": "string"
  },
  "score_aderencia": <inteiro 0-100>,
  "nivel": "BID" | "PARCIAL" | "NO-BID",
  "categoria_explicacao": "frase curta dizendo por que esse nível",
  "resumo": "<2-3 frases>",
  "resumo_executivo": [
    "O QUE FAZER: ...",
    "PRAZO: ...",
    "ORÇAMENTO: ..."
  ],
  "pontos_fortes": ["..."],
  "pontos_fracos": ["..."],
  "atestados_match": [{"id":"...","titulo":"...","relevancia":<0-100>,"justificativa":"..."}],
  "solucoes_match": [{"id":"...","nome":"...","relevancia":<0-100>,"justificativa":"..."}],
  "rentabilidade": {
    "margem_estimada_pct": <number>,
    "valor_estimado_brl": <number|null>,
    "custo_estimado_brl": <number|null>,
    "lucro_estimado_brl": <number|null>,
    "risco": "baixo" | "medio" | "alto",
    "observacoes": "..."
  },
  "recomendacao": "participar" | "monitorar" | "descartar"
}

REGRAS DE CATEGORIZAÇÃO (REQ-08):
- 🟢 BID = score 80-100: escopo casa fortemente com automação, ITSM/ESM, Squads ou serviços que a empresa domina E há atestados que cobrem as exigências.
- 🟡 PARCIAL = score 50-79: a empresa domina o serviço, mas faltam tecnologias específicas ou volumes nos atestados. Indica composição com parceiros.
- 🔴 NO-BID = score < 50: fuga do escopo (hardware puro, cabeamento, etc.) ou exige atestados que a empresa não possui.`;

async function callGemini(model: string, system: string, user: string, jsonMode = true) {
  return fetch(GATEWAY, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Lovable-API-Key': LOVABLE_API_KEY!,
      'X-Lovable-AIG-SDK': 'vercel-ai-sdk',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
    }),
  });
}

function aiError(status: number) {
  if (status === 429) return { status: 429, msg: 'Limite de uso da IA atingido. Tente novamente em instantes.' };
  if (status === 402) return { status: 402, msg: 'Créditos de IA esgotados. Adicione créditos ao workspace.' };
  return { status: 502, msg: `Falha IA: ${status}` };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'LOVABLE_API_KEY ausente' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const body = await req.json();
    const { licitacao, atestados = [], solucoes = [], companyProfile, model } = body;
    if (!licitacao) {
      return new Response(JSON.stringify({ error: 'licitacao obrigatória' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ===== ETAPA 1: REQ-06 Validação semântica =====
    const valRes = await callGemini(
      'google/gemini-2.5-flash',
      SYS_VALIDACAO,
      `Objeto: ${licitacao.objeto}\nModalidade: ${licitacao.modalidade}\nÓrgão: ${licitacao.orgao}`,
      false,
    );
    if (!valRes.ok) {
      const e = aiError(valRes.status);
      return new Response(JSON.stringify({ error: e.msg }), { status: e.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const valData = await valRes.json();
    const valVerdict = (valData?.choices?.[0]?.message?.content ?? '').toString().trim().toUpperCase();
    if (valVerdict.startsWith('NAO') || valVerdict.startsWith('NÃO')) {
      return new Response(JSON.stringify({
        triagem: {
          score_aderencia: 0,
          nivel: 'NO-BID',
          categoria_explicacao: 'IA classificou objeto como NÃO sendo de TI corporativa.',
          resumo: 'Objeto fora do escopo de TI corporativa. Triagem encerrada na validação semântica.',
          resumo_executivo: ['O QUE FAZER: descartar', 'PRAZO: —', 'ORÇAMENTO: —'],
          requisitos_extraidos: {},
          pontos_fortes: [],
          pontos_fracos: ['Fora do escopo de TI corporativa.'],
          atestados_match: [],
          solucoes_match: [],
          rentabilidade: { margem_estimada_pct: 0, valor_estimado_brl: licitacao.valorEstimado ?? null, custo_estimado_brl: null, lucro_estimado_brl: null, risco: 'alto', observacoes: '—' },
          recomendacao: 'descartar',
        },
        validacao_ti: false,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ===== ETAPA 2: REQ-07/08/09 — Triagem completa =====
    const payload = {
      licitacao: {
        objeto: licitacao.objeto,
        orgao: licitacao.orgao,
        modalidade: licitacao.modalidade,
        valorEstimado: licitacao.valorEstimado,
        amparoLegal: licitacao.amparoLegal,
        uf: licitacao.uf,
        municipio: licitacao.municipio,
        dataPublicacao: licitacao.dataPublicacao,
        dataAbertura: licitacao.dataAbertura,
      },
      core_business: companyProfile ?? null,
      atestados: atestados.map((a: any) => ({
        id: a.id, titulo: a.titulo, cliente: a.cliente, tipo_servico: a.tipo_servico,
        descricao: a.descricao, valor: a.valor_contrato, vigente: a.vigente, tags: a.tags,
      })),
      solucoes: solucoes.map((s: any) => ({
        id: s.id, nome: s.nome, categoria: s.categoria, fabricante: s.fabricante,
        descricao: s.descricao, diferenciais: s.diferenciais, margem_estimada: s.margem_estimada,
        certificacoes: s.certificacoes, tags: s.tags,
      })),
    };

    const aiRes = await callGemini(
      model ?? 'google/gemini-2.5-pro',
      SYS_TRIAGEM,
      'Analise a licitação abaixo contra o portfólio. Retorne só o JSON especificado.\n\n' + JSON.stringify(payload, null, 2),
      true,
    );
    if (!aiRes.ok) {
      const e = aiError(aiRes.status);
      const txt = await aiRes.text().catch(() => '');
      return new Response(JSON.stringify({ error: e.msg, detail: txt }), {
        status: e.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const data = await aiRes.json();
    const content = data?.choices?.[0]?.message?.content ?? '{}';
    let parsed: any = {};
    try { parsed = typeof content === 'string' ? JSON.parse(content) : content; }
    catch { parsed = { error: 'JSON inválido da IA', raw: content }; }

    return new Response(JSON.stringify({ triagem: parsed, validacao_ti: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('ai-triagem error', e);
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
