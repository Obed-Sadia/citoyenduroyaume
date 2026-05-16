import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { syncPreferences } from '@/lib/supabase/sync'

type Theme = 'dark' | 'light' | 'system'
type EditorFont = 'cormorant' | 'dm-sans' | 'literata'
type FontSize = 'sm' | 'md' | 'lg'

interface ProfilState {
  theme:             Theme
  editor_font:       EditorFont
  font_size:         FontSize
  bible_translation: string
  locale:            string
  share_territoire:  boolean
  setTheme:             (theme: Theme)      => void
  setEditorFont:        (font: EditorFont)  => void
  setFontSize:          (size: FontSize)    => void
  setBibleTranslation:  (t: string)         => void
  setLocale:            (locale: string)    => void
  setShareTerritoire:   (v: boolean)        => void
  hydrateFromRemote:    (prefs: Record<string, unknown>) => void
}

export const useProfilStore = create<ProfilState>()(
  persist(
    (set) => ({
      theme:             'dark',
      editor_font:       'cormorant',
      font_size:         'md',
      bible_translation: 'LSG',
      locale:            'fr',
      share_territoire:  false,

      setTheme: (theme) => {
        set({ theme })
        void syncPreferences({ theme })
      },
      setEditorFont: (editor_font) => {
        set({ editor_font })
        void syncPreferences({ editor_font })
      },
      setFontSize: (font_size) => {
        set({ font_size })
        void syncPreferences({ font_size })
      },
      setBibleTranslation: (bible_translation) => {
        set({ bible_translation })
        void syncPreferences({ bible_translation })
      },
      setLocale: (locale) => {
        set({ locale })
        void syncPreferences({ locale })
      },
      setShareTerritoire: (share_territoire) => {
        set({ share_territoire })
        void syncPreferences({ share_territoire })
      },

      // Hydrate depuis Supabase sans déclencher un re-push
      hydrateFromRemote: (prefs) => {
        const allowed: Partial<ProfilState> = {}
        if (typeof prefs.theme === 'string')
          allowed.theme = prefs.theme as Theme
        if (typeof prefs.editor_font === 'string')
          allowed.editor_font = prefs.editor_font as EditorFont
        if (typeof prefs.font_size === 'string')
          allowed.font_size = prefs.font_size as FontSize
        if (typeof prefs.bible_translation === 'string')
          allowed.bible_translation = prefs.bible_translation
        if (typeof prefs.locale === 'string')
          allowed.locale = prefs.locale
        if (typeof prefs.share_territoire === 'boolean')
          allowed.share_territoire = prefs.share_territoire
        set(allowed)
      },
    }),
    {
      name:    'basileia-profil',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
