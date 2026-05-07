import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

type Theme = 'dark' | 'light' | 'system'
type EditorFont = 'cormorant' | 'dm-sans' | 'literata'
type FontSize = 'sm' | 'md' | 'lg'

interface ProfilState {
  theme:             Theme
  editor_font:       EditorFont
  font_size:         FontSize
  bible_translation: string
  locale:            string
  setTheme:             (theme: Theme)      => void
  setEditorFont:        (font: EditorFont)  => void
  setFontSize:          (size: FontSize)    => void
  setBibleTranslation:  (t: string)         => void
  setLocale:            (locale: string)    => void
}

export const useProfilStore = create<ProfilState>()(
  persist(
    (set) => ({
      theme:             'dark',
      editor_font:       'cormorant',
      font_size:         'md',
      bible_translation: 'LSG',
      locale:            'fr',
      setTheme:             (theme)             => set({ theme }),
      setEditorFont:        (editor_font)       => set({ editor_font }),
      setFontSize:          (font_size)         => set({ font_size }),
      setBibleTranslation:  (bible_translation) => set({ bible_translation }),
      setLocale:            (locale)            => set({ locale }),
    }),
    {
      name:    'basileia-profil',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
