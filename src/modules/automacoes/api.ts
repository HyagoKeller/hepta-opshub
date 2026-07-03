import { supabase } from '@/integrations/supabase/client';
import type {
  Automacao, AutomacaoEstagio, AutomacaoHistorico, AutomacaoOferta,
} from './types';

// Nota: as tabelas foram criadas nesta migração e ainda não estão no `types.ts`
// gerado automaticamente. Usamos `as any` estrategicamente até a regeneração.
const db = supabase as any;

// ── Automações ─────────────────────────────────────────────────────────────
export const listAutomacoes = async (): Promise<Automacao[]> => {
  const { data, error } = await db.from('automacoes').select('*').order('atualizado_em', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Automacao[];
};

export const getAutomacao = async (id: string): Promise<Automacao | null> => {
  const { data, error } = await db.from('automacoes').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return (data ?? null) as Automacao | null;
};

export const createAutomacao = async (payload: Partial<Automacao>): Promise<Automacao> => {
  const { data, error } = await db.from('automacoes').insert(payload).select('*').single();
  if (error) throw error;
  return data as Automacao;
};

export const updateAutomacao = async (id: string, patch: Partial<Automacao>): Promise<Automacao> => {
  const { data, error } = await db.from('automacoes').update(patch).eq('id', id).select('*').single();
  if (error) throw error;
  return data as Automacao;
};

export const moverEstagio = async (id: string, novo: AutomacaoEstagio): Promise<Automacao> => {
  // O trigger no banco grava a linha em automacao_historico automaticamente.
  return updateAutomacao(id, { estagio: novo });
};

export const deleteAutomacao = async (id: string): Promise<void> => {
  const { error } = await db.from('automacoes').delete().eq('id', id);
  if (error) throw error;
};

// ── Histórico ──────────────────────────────────────────────────────────────
export const listHistorico = async (automacaoId: string): Promise<AutomacaoHistorico[]> => {
  const { data, error } = await db
    .from('automacao_historico')
    .select('*')
    .eq('automacao_id', automacaoId)
    .order('criado_em', { ascending: false });
  if (error) throw error;
  return (data ?? []) as AutomacaoHistorico[];
};

// ── Ofertas ────────────────────────────────────────────────────────────────
export const listOfertas = async (): Promise<AutomacaoOferta[]> => {
  const { data, error } = await db
    .from('automacao_ofertas')
    .select('*')
    .order('atualizado_em', { ascending: false });
  if (error) throw error;
  return (data ?? []) as AutomacaoOferta[];
};

export const listOfertasByAutomacao = async (automacaoId: string): Promise<AutomacaoOferta[]> => {
  const { data, error } = await db
    .from('automacao_ofertas')
    .select('*')
    .eq('automacao_id', automacaoId);
  if (error) throw error;
  return (data ?? []) as AutomacaoOferta[];
};
