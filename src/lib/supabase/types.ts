// Remplacer par : npx supabase gen types typescript --project-id [ID]

export type Database = {
  public: {
    Tables: {
      citizen_profiles: {
        Row: {
          id:                string
          display_name:      string
          avatar_url:        string | null
          email:             string | null
          locale:            string
          bible_translation: string
          preferences:       Record<string, unknown>
          short_code:        string | null
          created_at:        string
          updated_at:        string
        }
        Insert: {
          id:                 string
          display_name:       string
          avatar_url?:        string | null
          email?:             string | null
          locale?:            string
          bible_translation?: string
          preferences?:       Record<string, unknown>
          short_code?:        string | null
        }
        Update: {
          id?:                string
          display_name?:      string
          avatar_url?:        string | null
          email?:             string | null
          locale?:            string
          bible_translation?: string
          preferences?:       Record<string, unknown>
          short_code?:        string | null
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
          visibility: 'private' | 'allies' | 'tribe'
          tribe_id:   string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?:         string
          user_id:     string
          title?:      string | null
          content?:    unknown
          domain_id?:  string | null
          visibility?: 'private' | 'allies' | 'tribe'
          tribe_id?:   string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?:         string
          user_id?:    string
          title?:      string | null
          content?:    unknown
          domain_id?:  string | null
          visibility?: 'private' | 'allies' | 'tribe'
          tribe_id?:   string | null
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
      verses: {
        Row: {
          id:         string
          user_id:    string
          reference:  string
          text:       string
          domain:     string | null
          visibility: 'private' | 'allies'
          created_at: string
        }
        Insert: {
          id?:         string
          user_id:     string
          reference:   string
          text:        string
          domain?:     string | null
          visibility?: 'private' | 'allies'
        }
        Update: {
          id?:         string
          user_id?:    string
          reference?:  string
          text?:       string
          domain?:     string | null
          visibility?: 'private' | 'allies'
        }
        Relationships: []
      }
      allies: {
        Row: {
          id:           string
          requester_id: string
          receiver_id:  string
          status:       'pending' | 'accepted' | 'rejected'
          created_at:   string
        }
        Insert: {
          id?:          string
          requester_id: string
          receiver_id:  string
          status?:      'pending' | 'accepted' | 'rejected'
        }
        Update: {
          status?: 'pending' | 'accepted' | 'rejected'
        }
        Relationships: []
      }
      tribes: {
        Row: {
          id:          string
          name:        string
          theme:       string
          creator_id:  string
          invite_code: string
          created_at:  string
        }
        Insert: {
          id?:         string
          name:        string
          theme:       string
          creator_id:  string
          invite_code: string
        }
        Update: {
          name?:  string
          theme?: string
        }
        Relationships: []
      }
      tribe_members: {
        Row: {
          id:        string
          tribe_id:  string
          user_id:   string
          role:      'admin' | 'member'
          status:    'pending' | 'member'
          joined_at: string
        }
        Insert: {
          id?:       string
          tribe_id:  string
          user_id:   string
          role?:     'admin' | 'member'
          status?:   'pending' | 'member'
        }
        Update: {
          role?:   'admin' | 'member'
          status?: 'pending' | 'member'
        }
        Relationships: []
      }
      enluminures: {
        Row: {
          id:                  string
          note_id:             string
          author_id:           string
          type:                'text' | 'verse'
          highlighted_passage: string | null
          content:             string
          verse_text:          string | null
          created_at:          string
        }
        Insert: {
          id?:                  string
          note_id:              string
          author_id:            string
          type:                 'text' | 'verse'
          highlighted_passage?: string | null
          content:              string
          verse_text?:          string | null
        }
        Update: never
        Relationships: []
      }
      notifications: {
        Row: {
          id:           string
          user_id:      string
          type:         'invitation_received' | 'invitation_accepted' | 'territory_updated' | 'verse_shared'
          from_user_id: string
          payload:      Record<string, unknown>
          read_at:      string | null
          created_at:   string
        }
        Insert: {
          id?:          string
          user_id:      string
          type:         'invitation_received' | 'invitation_accepted' | 'territory_updated' | 'verse_shared'
          from_user_id: string
          payload?:     Record<string, unknown>
          read_at?:     string | null
        }
        Update: {
          read_at?: string | null
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      search_citizen_by_email: {
        Args: { search_email: string }
        Returns: Array<{ id: string; display_name: string; avatar_url: string | null }>
      }
    }
  }
}
