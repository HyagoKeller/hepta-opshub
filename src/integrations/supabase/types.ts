export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      atestados: {
        Row: {
          arquivo_url: string | null
          cliente: string
          criado_em: string
          data_fim: string | null
          data_inicio: string | null
          descricao: string | null
          id: string
          tags: string[] | null
          tipo_servico: string
          titulo: string
          valor_contrato: number | null
          vigente: boolean
        }
        Insert: {
          arquivo_url?: string | null
          cliente: string
          criado_em?: string
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          id?: string
          tags?: string[] | null
          tipo_servico: string
          titulo: string
          valor_contrato?: number | null
          vigente?: boolean
        }
        Update: {
          arquivo_url?: string | null
          cliente?: string
          criado_em?: string
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          id?: string
          tags?: string[] | null
          tipo_servico?: string
          titulo?: string
          valor_contrato?: number | null
          vigente?: boolean
        }
        Relationships: []
      }
      favoritos: {
        Row: {
          criado_em: string
          id: string
          licitacao_id: string
          licitacao_payload: Json
          notas: string | null
          status: string
        }
        Insert: {
          criado_em?: string
          id?: string
          licitacao_id: string
          licitacao_payload: Json
          notas?: string | null
          status?: string
        }
        Update: {
          criado_em?: string
          id?: string
          licitacao_id?: string
          licitacao_payload?: Json
          notas?: string | null
          status?: string
        }
        Relationships: []
      }
      solucoes: {
        Row: {
          categoria: string
          certificacoes: string[] | null
          criado_em: string
          descricao: string | null
          diferenciais: string | null
          fabricante: string | null
          id: string
          margem_estimada: number | null
          nome: string
          tags: string[] | null
        }
        Insert: {
          categoria: string
          certificacoes?: string[] | null
          criado_em?: string
          descricao?: string | null
          diferenciais?: string | null
          fabricante?: string | null
          id?: string
          margem_estimada?: number | null
          nome: string
          tags?: string[] | null
        }
        Update: {
          categoria?: string
          certificacoes?: string[] | null
          criado_em?: string
          descricao?: string | null
          diferenciais?: string | null
          fabricante?: string | null
          id?: string
          margem_estimada?: number | null
          nome?: string
          tags?: string[] | null
        }
        Relationships: []
      }
      triagens: {
        Row: {
          atestados_match: Json | null
          criado_em: string
          id: string
          licitacao_id: string
          licitacao_titulo: string | null
          nivel: string | null
          orgao: string | null
          pontos_fortes: Json | null
          pontos_fracos: Json | null
          recomendacao: string | null
          rentabilidade: Json | null
          resumo: string | null
          score_aderencia: number | null
          solucoes_match: Json | null
          valor_estimado: number | null
        }
        Insert: {
          atestados_match?: Json | null
          criado_em?: string
          id?: string
          licitacao_id: string
          licitacao_titulo?: string | null
          nivel?: string | null
          orgao?: string | null
          pontos_fortes?: Json | null
          pontos_fracos?: Json | null
          recomendacao?: string | null
          rentabilidade?: Json | null
          resumo?: string | null
          score_aderencia?: number | null
          solucoes_match?: Json | null
          valor_estimado?: number | null
        }
        Update: {
          atestados_match?: Json | null
          criado_em?: string
          id?: string
          licitacao_id?: string
          licitacao_titulo?: string | null
          nivel?: string | null
          orgao?: string | null
          pontos_fortes?: Json | null
          pontos_fracos?: Json | null
          recomendacao?: string | null
          rentabilidade?: Json | null
          resumo?: string | null
          score_aderencia?: number | null
          solucoes_match?: Json | null
          valor_estimado?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
