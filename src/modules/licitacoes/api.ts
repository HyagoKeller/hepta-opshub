import { supabase } from '@/integrations/supabase/client';
import type { Atestado, CompanyProfile, OportunidadeEstrategica, Perfil, PncpItem, Solucao, TriagemResultado } from './types';

export async function buscarLicitacoes(params: {
  diasAtras?: number;
  modalidades?: number[];
  palavraChave?: string;
  uf?: string;
  filtroTI?: boolean;
  valorMinimo?: number;
  blacklistExtra?: string[];
  incluirDescartados?: boolean;
}) {
  const { data, error } = await supabase.functions.invoke('pncp-search', { body: params });
  if (error) throw error;
  return data as { items: PncpItem[]; meta: any };
}

export async function getCompanyProfile(): Promise<CompanyProfile | null> {
  const { data } = await supabase.from('company_profile').select('*').limit(1).maybeSingle();
  return (data as any) ?? null;
}

export async function upsertCompanyProfile(p: Partial<CompanyProfile> & { id?: string }) {
  const payload = { ...p, atualizado_em: new Date().toISOString() } as any;
  if (p.id) {
    const { error } = await supabase.from('company_profile').update(payload).eq('id', p.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('company_profile').insert(payload);
    if (error) throw error;
  }
}

export async function triagemIA(licitacao: PncpItem) {
  const [{ data: atestados }, { data: solucoes }, { data: perfis }, companyProfile] = await Promise.all([
    supabase.from('atestados').select('*'),
    supabase.from('solucoes').select('*'),
    supabase.from('perfis').select('*').eq('ativo', true),
    getCompanyProfile(),
  ]);
  const { data, error } = await supabase.functions.invoke('ai-triagem', {
    body: { licitacao, atestados: atestados ?? [], solucoes: solucoes ?? [], perfis: perfis ?? [], companyProfile },
  });
  if (error) throw error;
  if ((data as any)?.error) throw new Error((data as any).error);
  return (data as any).triagem as TriagemResultado;
}

export async function listarPerfis(): Promise<Perfil[]> {
  const { data, error } = await supabase.from('perfis').select('*').order('nome');
  if (error) throw error;
  return (data ?? []) as Perfil[];
}
export async function upsertPerfil(p: Partial<Perfil> & { id?: string }) {
  const payload = { ...p, atualizado_em: new Date().toISOString() } as any;
  if (p.id) {
    const { error } = await supabase.from('perfis').update(payload).eq('id', p.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('perfis').insert(payload);
    if (error) throw error;
  }
}
export async function deletePerfil(id: string) {
  const { error } = await supabase.from('perfis').delete().eq('id', id);
  if (error) throw error;
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
    resumo_executivo: (t.resumo_executivo ?? []) as any,
    requisitos_extraidos: (t.requisitos_extraidos ?? {}) as any,
    pontos_fortes: t.pontos_fortes,
    pontos_fracos: t.pontos_fracos,
    atestados_match: t.atestados_match,
    solucoes_match: t.solucoes_match,
    rentabilidade: t.rentabilidade,
    recomendacao: t.recomendacao,
  });
}

// REQ-10 — Gatilho para Núcleo de Transformação
export async function aprovarComoEstrategico(licitacao: PncpItem, t: TriagemResultado, responsavel?: string) {
  const { error } = await supabase.from('oportunidades_estrategicas').insert({
    licitacao_id: licitacao.id,
    licitacao_titulo: licitacao.objeto?.slice(0, 240),
    orgao: licitacao.orgao,
    uf: licitacao.uf,
    valor_estimado: licitacao.valorEstimado,
    score_aderencia: t.score_aderencia,
    nivel: t.nivel,
    resumo_executivo: t.resumo_executivo ?? [],
    recomendacao: t.recomendacao,
    responsavel,
    status: 'em_proposta',
    triagem_payload: t as any,
    licitacao_payload: licitacao as any,
  });
  if (error) throw error;
}

export async function listarEstrategicas(): Promise<OportunidadeEstrategica[]> {
  const { data } = await supabase.from('oportunidades_estrategicas').select('*').order('criado_em', { ascending: false });
  return (data ?? []) as any;
}

export async function atualizarStatusEstrategica(id: string, status: string, responsavel?: string) {
  const { error } = await supabase.from('oportunidades_estrategicas').update({ status, responsavel, atualizado_em: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
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
