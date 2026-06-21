import { supabase } from '@/integrations/supabase/client';
import type { Atestado, PncpItem, Solucao, TriagemResultado } from './types';

export async function buscarLicitacoes(params: {
  diasAtras?: number;
  modalidades?: number[];
  palavraChave?: string;
  uf?: string;
  filtroTI?: boolean;
}) {
  const { data, error } = await supabase.functions.invoke('pncp-search', { body: params });
  if (error) throw error;
  return data as { items: PncpItem[]; meta: any };
}

export async function triagemIA(licitacao: PncpItem) {
  const [{ data: atestados }, { data: solucoes }] = await Promise.all([
    supabase.from('atestados').select('*'),
    supabase.from('solucoes').select('*'),
  ]);
  const { data, error } = await supabase.functions.invoke('ai-triagem', {
    body: { licitacao, atestados: atestados ?? [], solucoes: solucoes ?? [] },
  });
  if (error) throw error;
  if ((data as any)?.error) throw new Error((data as any).error);
  return (data as any).triagem as TriagemResultado;
}

export async function salvarTriagem(licitacao: PncpItem, t: TriagemResultado) {
  return supabase.from('triagens').insert({
    licitacao_id: licitacao.id,
    licitacao_titulo: licitacao.objeto?.slice(0, 240),
    orgao: licitacao.orgao,
    valor_estimado: licitacao.valorEstimado,
    score_aderencia: t.score_aderencia,
    nivel: t.nivel,
    resumo: t.resumo,
    pontos_fortes: t.pontos_fortes,
    pontos_fracos: t.pontos_fracos,
    atestados_match: t.atestados_match,
    solucoes_match: t.solucoes_match,
    rentabilidade: t.rentabilidade,
    recomendacao: t.recomendacao,
  });
}

export async function listarAtestados() {
  const { data, error } = await supabase.from('atestados').select('*').order('criado_em', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Atestado[];
}
export async function upsertAtestado(a: Partial<Atestado> & { id?: string }) {
  if (a.id) {
    const { error } = await supabase.from('atestados').update(a).eq('id', a.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('atestados').insert(a as any);
    if (error) throw error;
  }
}
export async function deleteAtestado(id: string) {
  const { error } = await supabase.from('atestados').delete().eq('id', id);
  if (error) throw error;
}

export async function listarSolucoes() {
  const { data, error } = await supabase.from('solucoes').select('*').order('criado_em', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Solucao[];
}
export async function upsertSolucao(s: Partial<Solucao> & { id?: string }) {
  if (s.id) {
    const { error } = await supabase.from('solucoes').update(s).eq('id', s.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('solucoes').insert(s as any);
    if (error) throw error;
  }
}
export async function deleteSolucao(id: string) {
  const { error } = await supabase.from('solucoes').delete().eq('id', id);
  if (error) throw error;
}

export async function toggleFavorito(item: PncpItem) {
  const { data: existing } = await supabase.from('favoritos').select('id').eq('licitacao_id', item.id).maybeSingle();
  if (existing) {
    await supabase.from('favoritos').delete().eq('id', existing.id);
    return false;
  }
  await supabase.from('favoritos').insert({ licitacao_id: item.id, licitacao_payload: item as any });
  return true;
}

export async function listarFavoritos() {
  const { data } = await supabase.from('favoritos').select('*').order('criado_em', { ascending: false });
  return data ?? [];
}

export async function listarTriagens() {
  const { data } = await supabase.from('triagens').select('*').order('criado_em', { ascending: false }).limit(50);
  return data ?? [];
}
