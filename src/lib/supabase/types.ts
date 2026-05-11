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
        Insert: {
          id:                 string
          display_name:       string
          avatar_url?:        string | null
          locale?:            string
          bible_translation?: string
          preferences?:       Record<string, unknown>
        }
        Update: {
          id?:                string
          display_name?:      string
          avatar_url?:        string | null
          locale?:            string
          bible_translation?: string
          preferences?:       Record<string, unknown>
        }
        Relationships: []
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
        Insert: {
          id?:         string
          user_id:     string
          title?:      string | null
          content?:    unknown
          domain_id?:  string | null
          updated_at?: string
        }
        Update: {
          id?:         string
          user_id?:    string
          title?:      string | null
          content?:    unknown
          domain_id?:  string | null
          updated_at?: string
        }
        Relationships: []
      }
      secrets: {
        Row: {
          id:         string
          user_id:    string
          text:       string
          domain_id:  string | null
          created_at: string
        }
        Insert: {
          id?:        string
          user_id:    string
          text:       string
          domain_id?: string | null
        }
        Update: {
          id?:        string
          user_id?:   string
          text?:      string
          domain_id?: string | null
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}
