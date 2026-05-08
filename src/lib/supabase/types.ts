// Remplacer par : npx supabase gen types typescript --project-id [ID]

export type Database = {
  public: {
    Tables: {
      citizen_profiles: {
        Row: {
          id:                string
          display_name:      string
          avatar_url:        string | null
          locale:            string
          bible_translation: string
          preferences:       Record<string, unknown>
          created_at:        string
          updated_at:        string
        }
        Insert: Omit<Database['public']['Tables']['citizen_profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['citizen_profiles']['Insert']>
      }
      notes: {
        Row: {
          id:         string
          user_id:    string
          title:      string | null
          content:    unknown
          domain_id:  string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['notes']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['notes']['Insert']>
      }
      secrets: {
        Row: {
          id:         string
          user_id:    string
          text:       string
          domain_id:  string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['secrets']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['secrets']['Insert']>
      }
    }
  }
}
