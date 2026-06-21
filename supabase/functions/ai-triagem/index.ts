// Triagem de aderência de licitação via Lovable AI Gateway (Gemini)
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const GATEWAY = 'https://ai.gateway.lovable.dev/v1/chat/completions';

const SYSTEM = `Você é um especialista em licitações públicas brasileiras de TI (Lei 14.133/21, IN SGD/MGI 94/2022, Portarias SGD 750/2023 e 1070/2023).
Avalie a aderência de uma licitação ao portfólio da empresa (atestados de capacidade técnica + soluções que ela trabalha) e retorne ESTRITAMENTE um JSON no formato:
{
  "score_aderencia": <0-100>,
  "nivel": "alta" | "media" | "baixa" | "incompativel",
  "resumo": "<2-3 frases>",
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
NÃO inclua texto fora do JSON. NÃO use markdown.`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'LOVABLE_API_KEY ausente' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { licitacao, atestados = [], solucoes = [], model } = body;
    if (!licitacao) {
      return new Response(JSON.stringify({ error: 'licitacao obrigatória' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userPayload = {
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
      atestados: atestados.map((a: any) => ({
        id: a.id,
        titulo: a.titulo,
        cliente: a.cliente,
        tipo_servico: a.tipo_servico,
        descricao: a.descricao,
        valor: a.valor_contrato,
        vigente: a.vigente,
        tags: a.tags,
      })),
      solucoes: solucoes.map((s: any) => ({
        id: s.id,
        nome: s.nome,
        categoria: s.categoria,
        fabricante: s.fabricante,
        descricao: s.descricao,
        diferenciais: s.diferenciais,
        margem_estimada: s.margem_estimada,
        certificacoes: s.certificacoes,
        tags: s.tags,
      })),
    };

    const aiRes = await fetch(GATEWAY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Lovable-API-Key': LOVABLE_API_KEY,
        'X-Lovable-AIG-SDK': 'vercel-ai-sdk',
      },
      body: JSON.stringify({
        model: model ?? 'google/gemini-2.5-pro',
        messages: [
          { role: 'system', content: SYSTEM },
          {
            role: 'user',
            content:
              'Analise a licitação abaixo contra o portfólio. Retorne só o JSON especificado.\n\n' +
              JSON.stringify(userPayload, null, 2),
          },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: 'Limite de uso da IA atingido. Tente novamente em instantes.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: 'Créditos de IA esgotados. Adicione créditos no workspace.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ error: `Falha IA: ${aiRes.status}`, detail: errText }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await aiRes.json();
    const content = data?.choices?.[0]?.message?.content ?? '{}';
    let parsed: any = {};
    try {
      parsed = typeof content === 'string' ? JSON.parse(content) : content;
    } catch {
      parsed = { error: 'JSON inválido da IA', raw: content };
    }

    return new Response(JSON.stringify({ triagem: parsed }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('ai-triagem error', e);
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
