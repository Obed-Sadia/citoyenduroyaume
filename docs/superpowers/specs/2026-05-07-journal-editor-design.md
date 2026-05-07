# Journal Editor — Design Spec

**Date :** 2026-05-07

## Objectif

Implémenter `JournalEditor` (Tiptap plein écran) + la route `/journal/[id]`, et brancher le bouton "+" de `JournalList` pour créer de nouvelles notes. Sauvegarde en mémoire via Zustand (pas de Dexie/Supabase à ce stade).

---

## Architecture

### Store — `src/lib/stores/notes.store.ts`

Zustand sans persist. Initialise `notes` depuis `MOCK_NOTES`.

```typescript
interface NotesStore {
  notes: Note[]
  addNote: (note: Note) => void
  updateNote: (id: string, patch: Partial<Note>) => void
  getNoteById: (id: string) => Note | undefined
}
```

- `addNote` insère en tête de liste (note la plus récente en premier)
- `updateNote` merge `patch` sur la note existante (immutable)
- `getNoteById` : find simple

### Route — `src/app/(main)/journal/[id]/page.tsx`

Server Component. Reçoit `params: { id: string }` — passe `id` à `<JournalEditor id={id} />`. Pas de redirect côté serveur (le store est client-side).

```
Metadata : { title: 'Méditation — BASILEIA' }
```

### Éditeur — `src/features/journal/JournalEditor.tsx`

Client Component (`"use client"`).

**Header (sticky) :**
- Bouton `←` : `router.back()`
- `<input>` titre : texte Cormorant 18px, fond transparent, placeholder "Sans titre"
- `<DomainBadge>` si `note.domain !== null`

**Corps :**
- `<EditorContent>` Tiptap, prend tout l'espace restant (`flex-1 overflow-y-auto`)
- Police éditoriale : `var(--font-editorial)`, taille 16px, `leading-relaxed`
- Placeholder : "Commence à écrire…" (via extension Tiptap)

**Footer (sticky bas) :**
- Compteur de mots depuis `CharacterCount` : `{words} mot{words !== 1 ? 's' : ''}`
- Statut : "Enregistré" après debounce 1 s, "Modification en cours…" pendant la frappe

**Logique de sauvegarde (debounce 1 s) :**
- Sur chaque changement de l'éditeur → `updateNote(id, { excerpt: texte tronqué à 120 chars, wordCount })`
- Sur chaque changement du titre → `updateNote(id, { title })`
- Statut "Enregistré" → passe après 1 s sans changement

**Initialisation :**
- `getNoteById(id)` → si `undefined`, rend un message "Note introuvable" + lien retour
- `useEditor` initialisé avec `note.content` (nouveau champ) ou vide

**Note : nouveau champ `content`**
`Note` dans `mock-notes.ts` n'a pas de champ `content` (HTML Tiptap). Il faut l'ajouter :

```typescript
export interface Note {
  id: string
  title: string
  excerpt: string
  content: string  // HTML Tiptap, vide par défaut
  domain: DomainId | null
  createdAt: string
  wordCount: number
}
```

Toutes les `MOCK_NOTES` auront `content: ''`.

### Mise à jour — `JournalList.tsx`

Bouton "+" :
```typescript
const { addNote } = useNotesStore()
const router = useRouter()

function handleCreate() {
  const id = crypto.randomUUID()
  addNote({
    id,
    title: '',
    excerpt: '',
    content: '',
    domain: null,
    createdAt: new Date().toISOString(),
    wordCount: 0,
  })
  router.push(`/journal/${id}`)
}
```

`JournalList` lit aussi `notes` depuis le store au lieu de `MOCK_NOTES` directement.

---

## Packages à installer

```bash
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-placeholder @tiptap/extension-character-count
```

---

## Hors scope

- Supabase, Dexie.js
- Classification Domaine par Gemini
- Auto-titre par Gemini
- Formatage avancé (toolbar)
- Images, fichiers joints
