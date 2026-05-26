# Feature : La Bibliothèque

Rôle : versets bibliques ancrés par le Citoyen.

## Composants
- `VerseCard.tsx` — carte verset (référence + texte italic + badge domaine + suppression hover)
- `VerseFeed.tsx` — liste animée (stagger Framer Motion), accepte `verses: Verse[]` en prop
- `VerseCaptureBar.tsx` — barre sticky (référence + texte + ◈ Domaine Gemini), Enter pour capturer
- `VerseSearch.tsx` — input de recherche client-side, debounce 300ms, reset sur Escape

## Typographie
- Texte du verset : `font-editorial` (Cormorant Garamond italic), 18px — toujours, sans exception
- Référence (ex : Jean 3:16) : `font-sans` (DM Sans), 11px, muted, uppercase, tracking large

## Pattern données
- Store : `useVersesStore` → `src/lib/stores/verses.store.ts`
- Repo : `VersesRepo` → `src/lib/db/verses.repo.ts`
- Sync : `syncVerse()` → `src/lib/supabase/sync.ts` (fire-and-forget, silencieux)
