# Journal Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implémenter JournalEditor (Tiptap) + route `/journal/[id]`, brancher le bouton "+" de JournalList, et gérer les notes via un store Zustand en mémoire.

**Architecture:** Un store Zustand (`notes.store.ts`) initialisé depuis `MOCK_NOTES` gère toutes les notes en mémoire. `JournalList` lit depuis le store et crée de nouvelles notes. `JournalEditor` lit et met à jour une note via debounce 1 s. La route `/journal/[id]` est un Server Component qui passe l'`id` à `JournalEditor`.

**Tech Stack:** Next.js 16 App Router · TypeScript strict · Zustand · Tiptap (StarterKit + Placeholder + CharacterCount) · Framer Motion (existant) · CSS tokens `var(--*)`

---

## Fichiers

| Action | Chemin |
|--------|--------|
| Modifier | `src/features/journal/mock-notes.ts` — ajouter `content: string` à `Note` |
| Créer | `src/lib/stores/notes.store.ts` — Zustand store |
| Modifier | `src/features/journal/JournalList.tsx` — lire store + bouton "+" fonctionnel |
| Modifier | `src/styles/globals.css` — styles Tiptap `.ProseMirror` |
| Créer | `src/features/journal/JournalEditor.tsx` — éditeur Tiptap |
| Créer | `src/app/(main)/journal/[id]/page.tsx` — route dynamique |

---

## Task 1 : Installer Tiptap

**Files:**
- Modify: `package.json` (via npm install)

- [ ] **Step 1 : Installer les packages**

```bash
cd /mnt/d/Importants/citoyenduroyaume && npm install @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-placeholder @tiptap/extension-character-count
```

Expected: packages ajoutés sans erreur, `node_modules/@tiptap/react` présent.

- [ ] **Step 2 : Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install Tiptap packages"
```

---

## Task 2 : Ajouter `content` à l'interface `Note`

**Files:**
- Modify: `src/features/journal/mock-notes.ts`

- [ ] **Step 1 : Remplacer le contenu du fichier**

```typescript
// src/features/journal/mock-notes.ts
import type { DomainId } from '@/features/carte/domain-constants'

export interface Note {
  id: string
  title: string
  excerpt: string
  content: string  // HTML Tiptap
  domain: DomainId | null
  createdAt: string  // ISO 8601
  wordCount: number
}

export const MOCK_NOTES: Note[] = [
  {
    id: '1',
    title: 'La paix qui surpasse tout entendement',
    excerpt:
      "En méditant sur Philippiens 4:7, j'ai réalisé que cette paix n'est pas une absence de tempête mais une présence au milieu d'elle. Le Roi règne même dans le chaos.",
    content: '',
    domain: 'roi',
    createdAt: new Date(Date.now() - 1 * 86_400_000).toISOString(),
    wordCount: 312,
  },
  {
    id: '2',
    title: '',
    excerpt:
      "Quelques réflexions sur la souveraineté divine dans les petites choses du quotidien. Rien n'échappe à la Constitution du Royaume.",
    content: '',
    domain: 'constitution',
    createdAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
    wordCount: 87,
  },
  {
    id: '3',
    title: "Le territoire de l'âme",
    excerpt: '',
    content: '',
    domain: 'territoire',
    createdAt: new Date(Date.now() - 3 * 86_400_000).toISOString(),
    wordCount: 24,
  },
  {
    id: '4',
    title: 'Méditation sur la grâce',
    excerpt:
      "La grâce n'est pas simplement une faveur accordée, c'est une transformation profonde qui remodèle l'identité du Citoyen du Royaume.",
    content: '',
    domain: null,
    createdAt: new Date(Date.now() - 6 * 86_400_000).toISOString(),
    wordCount: 445,
  },
]
```

- [ ] **Step 2 : Commit**

```bash
git add src/features/journal/mock-notes.ts
git commit -m "feat(journal): add content field to Note interface"
```

---

## Task 3 : Créer `notes.store.ts`

**Files:**
- Create: `src/lib/stores/notes.store.ts`

- [ ] **Step 1 : Créer le fichier**

```typescript
// src/lib/stores/notes.store.ts
import { create } from 'zustand'
import { MOCK_NOTES } from '@/features/journal/mock-notes'
import type { Note } from '@/features/journal/mock-notes'

interface NotesStore {
  notes: Note[]
  addNote: (note: Note) => void
  updateNote: (id: string, patch: Partial<Note>) => void
  getNoteById: (id: string) => Note | undefined
}

export const useNotesStore = create<NotesStore>((set, get) => ({
  notes: MOCK_NOTES,
  addNote: (note) => set((state) => ({ notes: [note, ...state.notes] })),
  updateNote: (id, patch) =>
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, ...patch } : n)),
    })),
  getNoteById: (id) => get().notes.find((n) => n.id === id),
}))
```

- [ ] **Step 2 : Commit**

```bash
git add src/lib/stores/notes.store.ts
git commit -m "feat(journal): add notes Zustand store"
```

---

## Task 4 : Mettre à jour `JournalList.tsx`

**Files:**
- Modify: `src/features/journal/JournalList.tsx`

- [ ] **Step 1 : Remplacer le contenu du fichier**

```tsx
// src/features/journal/JournalList.tsx
"use client"

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useNotesStore } from '@/lib/stores/notes.store'
import { JournalCard } from '@/features/journal/JournalCard'

const EASE = [0.16, 1, 0.3, 1] as const

export function JournalList() {
  const { notes, addNote } = useNotesStore()
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

  return (
    <div>
      <div className="flex items-center justify-between px-6 py-4">
        <p
          className="text-[11px] font-medium uppercase tracking-[.09em]"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {notes.length} méditation{notes.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={handleCreate}
          aria-label="Nouvelle méditation"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-amber-border)] bg-[var(--color-amber-bg)] transition-opacity hover:opacity-80"
          style={{ color: 'var(--color-amber-400)' }}
        >
          <Plus size={14} strokeWidth={1.5} />
        </button>
      </div>

      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <p
            className="text-[15px]"
            style={{ fontFamily: 'var(--font-editorial)', color: 'var(--color-text-secondary)' }}
          >
            Aucune méditation pour l'instant.
          </p>
          <p className="mt-1 text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
            Commence par écrire ce que la Parole t'a dit aujourd'hui.
          </p>
        </div>
      ) : (
        <motion.ul
          className="flex flex-col gap-3 px-6 pb-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.05 } },
          }}
        >
          {notes.map((note) => (
            <motion.li
              key={note.id}
              variants={{
                hidden: { opacity: 0, y: 12 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { ease: EASE, duration: 0.25 },
                },
              }}
            >
              <JournalCard note={note} />
            </motion.li>
          ))}
        </motion.ul>
      )}
    </div>
  )
}
```

- [ ] **Step 2 : Commit**

```bash
git add src/features/journal/JournalList.tsx
git commit -m "feat(journal): wire JournalList to notes store, activate + button"
```

---

## Task 5 : Ajouter les styles Tiptap dans `globals.css`

**Files:**
- Modify: `src/styles/globals.css`

- [ ] **Step 1 : Ajouter à la fin du fichier**

Ajouter ces lignes à la fin de `src/styles/globals.css` (après la scrollbar) :

```css
/* Tiptap editor */
.ProseMirror {
  outline: none;
  color: var(--color-text-primary);
  font-family: var(--font-editorial);
  font-size: 16px;
  line-height: 1.75;
  min-height: 200px;
}

.ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  color: var(--color-text-disabled);
  pointer-events: none;
  float: left;
  height: 0;
}

.ProseMirror p { margin: 0 0 0.75em; }
.ProseMirror h1, .ProseMirror h2, .ProseMirror h3 {
  color: var(--color-text-primary);
  font-weight: 600;
  margin: 1.25em 0 0.5em;
}
.ProseMirror ul, .ProseMirror ol { padding-left: 1.5em; margin: 0.5em 0; }
.ProseMirror strong { color: var(--color-text-primary); font-weight: 600; }
.ProseMirror em { font-style: italic; }
```

- [ ] **Step 2 : Commit**

```bash
git add src/styles/globals.css
git commit -m "feat(journal): add Tiptap ProseMirror styles"
```

---

## Task 6 : Créer `JournalEditor.tsx`

**Files:**
- Create: `src/features/journal/JournalEditor.tsx`

- [ ] **Step 1 : Créer le fichier**

```tsx
// src/features/journal/JournalEditor.tsx
"use client"

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import { ArrowLeft } from 'lucide-react'
import { useNotesStore } from '@/lib/stores/notes.store'
import { DomainBadge } from '@/features/journal/DomainBadge'

interface JournalEditorProps {
  id: string
}

export function JournalEditor({ id }: JournalEditorProps) {
  const router = useRouter()
  const { getNoteById, updateNote } = useNotesStore()
  const note = getNoteById(id)

  const [title, setTitle] = useState(note?.title ?? '')
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved')
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Commence à écrire…' }),
      CharacterCount,
    ],
    content: note?.content ?? '',
    onUpdate({ editor }) {
      setSaveStatus('saving')
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => {
        const html = editor.getHTML()
        const text = editor.getText()
        const words = text.trim() ? text.trim().split(/\s+/).length : 0
        const excerpt = text.slice(0, 120)
        updateNote(id, { content: html, excerpt, wordCount: words })
        setSaveStatus('saved')
      }, 1000)
    },
  })

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [])

  function handleTitleChange(value: string) {
    setTitle(value)
    setSaveStatus('saving')
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      updateNote(id, { title: value })
      setSaveStatus('saved')
    }, 1000)
  }

  if (!note) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
        <p className="text-[15px]" style={{ color: 'var(--color-text-secondary)' }}>
          Note introuvable.
        </p>
        <button
          onClick={() => router.push('/journal')}
          className="mt-4 text-[12px] transition-opacity hover:opacity-70"
          style={{ color: 'var(--color-amber-400)' }}
        >
          ← Retour au journal
        </button>
      </div>
    )
  }

  const words = editor?.storage.characterCount?.words() ?? 0

  return (
    <div className="flex h-full flex-col">
      <header
        className="flex shrink-0 items-center gap-3 border-b px-4 py-3"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <button
          onClick={() => router.back()}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] transition-opacity hover:opacity-70"
          style={{ color: 'var(--color-text-secondary)' }}
          aria-label="Retour"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
        </button>

        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Sans titre"
          className="min-w-0 flex-1 bg-transparent text-[18px] font-medium outline-none placeholder:opacity-30"
          style={{ fontFamily: 'var(--font-editorial)', color: 'var(--color-text-primary)' }}
        />

        {note.domain && <DomainBadge domain={note.domain} />}
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        <EditorContent editor={editor} />
      </div>

      <footer
        className="flex shrink-0 items-center justify-between border-t px-6 py-3"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
          {words} mot{words !== 1 ? 's' : ''}
        </span>
        <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
          {saveStatus === 'saving' ? 'Modification en cours…' : 'Enregistré'}
        </span>
      </footer>
    </div>
  )
}
```

- [ ] **Step 2 : Commit**

```bash
git add src/features/journal/JournalEditor.tsx
git commit -m "feat(journal): add JournalEditor with Tiptap"
```

---

## Task 7 : Créer la route `/journal/[id]`

**Files:**
- Create: `src/app/(main)/journal/[id]/page.tsx`

- [ ] **Step 1 : Créer le fichier**

```tsx
// src/app/(main)/journal/[id]/page.tsx
import type { Metadata } from 'next'
import { JournalEditor } from '@/features/journal/JournalEditor'

export const metadata: Metadata = { title: 'Méditation — BASILEIA' }

interface Props {
  params: Promise<{ id: string }>
}

export default async function JournalEntryPage({ params }: Props) {
  const { id } = await params
  return <JournalEditor id={id} />
}
```

- [ ] **Step 2 : Commit**

```bash
git add src/app/(main)/journal/[id]/page.tsx
git commit -m "feat(journal): add /journal/[id] route"
```

---

## Task 8 : Vérification build

- [ ] **Step 1 : Build de production**

```bash
npm run build 2>&1 | tail -30
```

Expected : `✓ Compiled successfully`, route `ƒ /journal/[id]` apparaît comme Dynamic.

- [ ] **Step 2 : Vérifications visuelles**

Lancer `npm run dev` et tester :
1. `/journal` — 4 cartes s'affichent depuis le store
2. Clic "+" — crée une note vide, navigue vers `/journal/{uuid}`
3. Dans l'éditeur : taper du texte → footer passe à "Modification en cours…" → revient à "Enregistré" après 1 s
4. Modifier le titre → idem
5. Bouton `←` → retour à `/journal`
6. Revenir sur `/journal` → la nouvelle note apparaît en tête de liste avec le wordCount mis à jour
7. Cliquer une JournalCard existante → `/journal/{id}`, contenu vide (normal — `content: ''` dans les mock)
