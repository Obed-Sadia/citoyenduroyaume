# Feature : Le Journal

Rôle : liste et éditeur des notes de méditation.

## Composants à créer
- `JournalList.tsx` — liste des notes, tri par date
- `JournalCard.tsx` — aperçu d'une note (titre, extrait, domaine, date)
- `JournalEditor.tsx` — éditeur plein écran
- `DomainBadge.tsx` — badge coloré du Domaine associé

## Éditeur
Tiptap avec extensions : `StarterKit` + `Placeholder` + `CharacterCount`.

## Sauvegarde
Debounce 1 s → Supabase table `notes` + IndexedDB (Dexie.js) pour offline.
Gemini classe automatiquement le Domaine et génère un titre si absent.
