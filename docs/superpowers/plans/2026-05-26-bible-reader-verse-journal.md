# Bible Reader + Verse Journal Insertion — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter un lecteur Bible multi-versions (api.bible) accessible via un drawer latéral global, avec insertion directe de versets dans l'éditeur Tiptap du Journal.

**Architecture:** Un drawer Framer Motion `fixed right-0` contrôlé par `useBibleStore`. Les requêtes api.bible passent exclusivement par des Server Actions (`'use server'`) pour garder la clé API côté serveur. La version Bible préférée est lue/écrite dans `useProfilStore.bible_translation` (colonne déjà existante dans Supabase `citizen_profiles`).

**Tech Stack:** Next.js 16 Server Actions · Zustand 5 · Framer Motion 12 · api.bible (`scripture.api.bible`) · Tiptap (déjà installé)

---

## File Map

| Fichier | Action | Rôle |
|---------|--------|------|
| `src/lib/bible/bible-versions.ts` | Créer | Versions préférées + helper `findBibleByAbbrev` |
| `src/lib/bible/bible-api.ts` | Créer | Server Actions : `getBooks`, `getChapters`, `getChapterVerses`, `searchVerses`, `resolveBibleId` |
| `src/lib/stores/bible.store.ts` | Créer | UI state : `isOpen`, `mode`, `insertCallback`, navigation livre/chapitre |
| `src/features/bible/BibleDrawer.tsx` | Créer | Drawer complet (search + nav + versets + action contextuelle) |
| `src/features/bible/BibleFAB.tsx` | Créer | Bouton flottant 📖 (caché sur `/journal/[id]`) |
| `src/app/(main)/layout.tsx` | Modifier | Ajouter `BibleFAB` + `BibleDrawer` |
| `src/features/journal/JournalEditor.tsx` | Modifier | Bouton Bible dans footer + `handleBibleInsert` |
| `.env.local` | Modifier | Ajouter `BIBLE_API_KEY` |

---

## Task 1: Clé API + bible-versions.ts

**Files:**
- Create: `src/lib/bible/bible-versions.ts`
- Modify: `.env.local`

- [ ] **Step 1.1 : Obtenir une clé api.bible**

  Aller sur https://scripture.api.bible → "Get API Key" → créer un compte gratuit → copier la clé.

- [ ] **Step 1.2 : Ajouter la clé dans `.env.local`**

  Ajouter à la fin de `.env.local` :
  ```
  BIBLE_API_KEY=ta_cle_api_bible_ici
  ```

- [ ] **Step 1.3 : Créer `src/lib/bible/bible-versions.ts`**

  ```ts
  export interface BibleVersion {
    id: string
    abbreviation: string
    name: string
    language: string
  }

  export const PREFERRED_VERSIONS = ['LSG', 'NEG', 'NBS', 'KJV', 'NVI'] as const
  export type VersionAbbreviation = (typeof PREFERRED_VERSIONS)[number]

  export function findBibleByAbbrev(
    bibles: BibleVersion[],
    abbrev: string
  ): BibleVersion | undefined {
    const upper = abbrev.toUpperCase()
    return (
      bibles.find((b) => b.abbreviation.toUpperCase() === upper) ??
      bibles.find((b) => b.name.toUpperCase().includes(upper))
    )
  }
  ```

- [ ] **Step 1.4 : Commit**

  ```bash
  git add src/lib/bible/bible-versions.ts .env.local
  git commit -m "feat(bible): bible-versions helper + BIBLE_API_KEY env"
  ```

---

## Task 2: Server Actions api.bible — `bible-api.ts`

**Files:**
- Create: `src/lib/bible/bible-api.ts`

- [ ] **Step 2.1 : Créer `src/lib/bible/bible-api.ts`**

  ```ts
  'use server'

  import { findBibleByAbbrev, type BibleVersion } from '@/lib/bible/bible-versions'

  const BASE = 'https://api.scripture.api.bible/v1'

  function apiHeaders(): HeadersInit {
    return { 'api-key': process.env.BIBLE_API_KEY ?? '' }
  }

  let biblesCache: BibleVersion[] | null = null

  export async function getAvailableBibles(): Promise<BibleVersion[]> {
    if (biblesCache) return biblesCache
    try {
      const res = await fetch(`${BASE}/bibles`, { headers: apiHeaders(), next: { revalidate: 3600 } })
      if (!res.ok) return []
      const json = await res.json()
      biblesCache = (json.data as Array<{ id: string; abbreviation: string; name: string; language?: { id: string } }>).map(
        (b) => ({
          id: b.id,
          abbreviation: b.abbreviation ?? '',
          name: b.name,
          language: b.language?.id ?? 'unknown',
        })
      )
      return biblesCache!
    } catch {
      return []
    }
  }

  export async function resolveBibleId(abbreviation: string): Promise<string> {
    const bibles = await getAvailableBibles()
    const found = findBibleByAbbrev(bibles, abbreviation)
    if (found) return found.id
    const french = bibles.find((b) => b.language === 'fra' || b.language === 'fre')
    return french?.id ?? bibles[0]?.id ?? ''
  }

  export interface BibleBook {
    id: string
    name: string
  }

  export async function getBooks(bibleId: string): Promise<BibleBook[]> {
    try {
      const res = await fetch(`${BASE}/bibles/${bibleId}/books`, {
        headers: apiHeaders(),
        next: { revalidate: 86400 },
      })
      if (!res.ok) return []
      const json = await res.json()
      return (json.data as Array<{ id: string; name: string }>).map((b) => ({
        id: b.id,
        name: b.name,
      }))
    } catch {
      return []
    }
  }

  export interface BibleChapter {
    id: string
    number: string
  }

  export async function getChapters(bibleId: string, bookId: string): Promise<BibleChapter[]> {
    try {
      const res = await fetch(`${BASE}/bibles/${bibleId}/books/${bookId}/chapters`, {
        headers: apiHeaders(),
        next: { revalidate: 86400 },
      })
      if (!res.ok) return []
      const json = await res.json()
      return (json.data as Array<{ id: string; number: string }>)
        .filter((c) => c.number !== 'intro')
        .map((c) => ({ id: c.id, number: c.number }))
    } catch {
      return []
    }
  }

  export interface BibleVerse {
    id: string
    verseNumber: number
    text: string
    reference: string
  }

  export async function getChapterVerses(
    bibleId: string,
    chapterId: string,
    bookName: string,
    chapterNumber: string
  ): Promise<BibleVerse[]> {
    try {
      const url = `${BASE}/bibles/${bibleId}/chapters/${chapterId}?content-type=text&include-verse-numbers=true&include-titles=false&include-chapter-numbers=false`
      const res = await fetch(url, { headers: apiHeaders(), next: { revalidate: 86400 } })
      if (!res.ok) return []
      const json = await res.json()
      const raw: string = json.data?.content ?? ''
      // Parse "[1] text [2] text…" format
      const matches = [...raw.matchAll(/\[(\d+)\]\s*([^\[]+)/g)]
      return matches.map((m) => {
        const vn = parseInt(m[1], 10)
        return {
          id: `${chapterId}.${vn}`,
          verseNumber: vn,
          text: m[2].trim().replace(/\s+/g, ' '),
          reference: `${bookName} ${chapterNumber}:${vn}`,
        }
      })
    } catch {
      return []
    }
  }

  export async function searchVerses(bibleId: string, query: string): Promise<BibleVerse[]> {
    if (!query.trim()) return []
    try {
      const res = await fetch(
        `${BASE}/bibles/${bibleId}/search?query=${encodeURIComponent(query)}&limit=20`,
        { headers: apiHeaders() }
      )
      if (!res.ok) return []
      const json = await res.json()
      return ((json.data?.verses ?? []) as Array<{ id: string; text: string; reference: string }>).map(
        (v) => ({
          id: v.id,
          verseNumber: 0,
          text: v.text,
          reference: v.reference,
        })
      )
    } catch {
      return []
    }
  }
  ```

- [ ] **Step 2.2 : Vérifier que la clé API fonctionne**

  ```bash
  cd /home/obeds/Dev/perso/citoyen-du-royaume
  node -e "
  const key = require('fs').readFileSync('.env.local','utf8').match(/BIBLE_API_KEY=(.+)/)?.[1]?.trim()
  fetch('https://api.scripture.api.bible/v1/bibles?language=fra', {headers:{'api-key':key}})
    .then(r=>r.json()).then(d=>console.log('OK - Bibles fr:', d.data?.slice(0,3).map(b=>b.abbreviation)))
    .catch(e=>console.error('FAIL',e))
  "
  ```
  Attendu : liste de Bibles françaises (LSG, NEG…).

- [ ] **Step 2.3 : Commit**

  ```bash
  git add src/lib/bible/bible-api.ts
  git commit -m "feat(bible): Server Actions api.bible — getBooks/getChapters/getChapterVerses/search"
  ```

---

## Task 3: `bible.store.ts` — état UI du drawer

**Files:**
- Create: `src/lib/stores/bible.store.ts`

- [ ] **Step 3.1 : Créer `src/lib/stores/bible.store.ts`**

  ```ts
  import { create } from 'zustand'

  interface BibleStore {
    isOpen: boolean
    mode: 'read' | 'insert'
    insertCallback: ((text: string, reference: string) => void) | null
    currentBook: string | null
    currentBookName: string | null
    currentChapterId: string | null
    currentChapterNumber: string | null
    open: (mode: 'read' | 'insert', cb?: (text: string, reference: string) => void) => void
    close: () => void
    setBook: (bookId: string, bookName: string) => void
    setChapter: (bookId: string, bookName: string, chapterId: string, chapterNumber: string) => void
  }

  export const useBibleStore = create<BibleStore>((set) => ({
    isOpen: false,
    mode: 'read',
    insertCallback: null,
    currentBook: null,
    currentBookName: null,
    currentChapterId: null,
    currentChapterNumber: null,

    open: (mode, cb) => set({ isOpen: true, mode, insertCallback: cb ?? null }),
    close: () => set({ isOpen: false, insertCallback: null }),

    setBook: (bookId, bookName) =>
      set({ currentBook: bookId, currentBookName: bookName, currentChapterId: null, currentChapterNumber: null }),

    setChapter: (bookId, bookName, chapterId, chapterNumber) =>
      set({ currentBook: bookId, currentBookName: bookName, currentChapterId: chapterId, currentChapterNumber: chapterNumber }),
  }))
  ```

- [ ] **Step 3.2 : Commit**

  ```bash
  git add src/lib/stores/bible.store.ts
  git commit -m "feat(bible): useBibleStore — drawer UI state + insert callback"
  ```

---

## Task 4: `BibleDrawer.tsx` — composant drawer principal

**Files:**
- Create: `src/features/bible/BibleDrawer.tsx`

- [ ] **Step 4.1 : Créer `src/features/bible/BibleDrawer.tsx`**

  ```tsx
  'use client'

  import { useEffect, useRef, useState, useCallback } from 'react'
  import { AnimatePresence, motion } from 'framer-motion'
  import { useBibleStore } from '@/lib/stores/bible.store'
  import { useProfilStore } from '@/lib/stores/profil.store'
  import { useVersesStore } from '@/lib/stores/verses.store'
  import {
    getBooks,
    getChapters,
    getChapterVerses,
    resolveBibleId,
    searchVerses,
    type BibleBook,
    type BibleChapter,
    type BibleVerse,
  } from '@/lib/bible/bible-api'
  import { PREFERRED_VERSIONS } from '@/lib/bible/bible-versions'
  import { cn } from '@/lib/utils'

  export function BibleDrawer() {
    const {
      isOpen, mode, insertCallback, close,
      currentBook, currentBookName, currentChapterId, currentChapterNumber,
      setBook, setChapter,
    } = useBibleStore()
    const { bible_translation, setBibleTranslation } = useProfilStore()
    const { addVerse } = useVersesStore()

    const [bibleId, setBibleId]           = useState<string | null>(null)
    const [books, setBooks]               = useState<BibleBook[]>([])
    const [chapters, setChapters]         = useState<BibleChapter[]>([])
    const [verses, setVerses]             = useState<BibleVerse[]>([])
    const [searchQuery, setSearchQuery]   = useState('')
    const [searchResults, setSearchResults] = useState<BibleVerse[]>([])
    const [isSearching, setIsSearching]   = useState(false)
    const [loadingVerses, setLoadingVerses] = useState(false)
    const [error, setError]               = useState<string | null>(null)
    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    // Resolve bibleId when version changes
    useEffect(() => {
      resolveBibleId(bible_translation).then(setBibleId).catch(() => setError('Version introuvable.'))
    }, [bible_translation])

    // Load book list when bibleId is resolved
    useEffect(() => {
      if (!bibleId) return
      setError(null)
      getBooks(bibleId).then(setBooks).catch(() => setError('Impossible de charger la Bible.'))
    }, [bibleId])

    // Load chapters when book is selected
    useEffect(() => {
      if (!bibleId || !currentBook) return
      getChapters(bibleId, currentBook).then(setChapters)
    }, [bibleId, currentBook])

    // Load verses when chapter is selected
    useEffect(() => {
      if (!bibleId || !currentChapterId || !currentBookName || !currentChapterNumber) {
        setVerses([])
        return
      }
      setLoadingVerses(true)
      setError(null)
      getChapterVerses(bibleId, currentChapterId, currentBookName, currentChapterNumber)
        .then(setVerses)
        .catch(() => setError('Impossible de charger ce chapitre.'))
        .finally(() => setLoadingVerses(false))
    }, [bibleId, currentChapterId, currentBookName, currentChapterNumber])

    const handleSearch = useCallback(
      (q: string) => {
        setSearchQuery(q)
        if (searchTimer.current) clearTimeout(searchTimer.current)
        if (!q.trim()) { setSearchResults([]); return }
        setIsSearching(true)
        searchTimer.current = setTimeout(() => {
          if (!bibleId) { setIsSearching(false); return }
          searchVerses(bibleId, q)
            .then(setSearchResults)
            .catch(() => setSearchResults([]))
            .finally(() => setIsSearching(false))
        }, 300)
      },
      [bibleId]
    )

    function handleVerseAction(verse: BibleVerse) {
      if (mode === 'insert' && insertCallback) {
        insertCallback(verse.text, verse.reference)
        close()
      } else {
        addVerse(verse.reference, verse.text, undefined, 'private')
      }
    }

    const actionLabel = mode === 'insert' ? '↳ Insérer' : 'Ancrer'
    const showSearch  = searchQuery.trim().length > 0
    const verseList   = showSearch ? searchResults : verses

    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay desktop */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
              className="fixed inset-0 z-40 hidden md:block"
              style={{ background: 'rgba(0,0,0,0.45)' }}
            />

            {/* Drawer */}
            <motion.div
              key="drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-y-0 right-0 z-50 flex flex-col w-full md:w-[480px]"
              style={{
                background: 'var(--color-bg-surface)',
                borderLeft: '1px solid var(--color-border)',
              }}
            >
              {/* ── Header ─────────────────────────────────────── */}
              <div
                className="flex shrink-0 items-center justify-between px-4 py-3 border-b"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={close}
                    className="text-[14px] md:hidden transition-opacity hover:opacity-70"
                    style={{ color: 'var(--color-text-secondary)' }}
                    aria-label="Fermer"
                  >
                    ←
                  </button>
                  <span
                    className="text-[10px] font-medium tracking-[.08em] uppercase"
                    style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)' }}
                  >
                    Bible
                  </span>
                  <select
                    value={bible_translation}
                    onChange={(e) => setBibleTranslation(e.target.value)}
                    className="rounded-[4px] px-1.5 py-0.5 text-[10px] outline-none cursor-pointer"
                    style={{
                      background: 'var(--color-bg-base)',
                      border: '1px solid var(--color-border-mid)',
                      color: 'var(--color-text-secondary)',
                      fontFamily: 'var(--font-sans)',
                    }}
                  >
                    {PREFERRED_VERSIONS.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={close}
                  className="hidden md:block text-[12px] transition-opacity hover:opacity-70"
                  style={{ color: 'var(--color-text-muted)' }}
                  aria-label="Fermer"
                >
                  ✕
                </button>
              </div>

              {/* ── Search ─────────────────────────────────────── */}
              <div
                className="shrink-0 px-4 py-2.5 border-b"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <div
                  className="flex items-center gap-2 rounded-[5px] px-3 py-2"
                  style={{ background: 'var(--color-bg-base)', border: '1px solid var(--color-border-mid)' }}
                >
                  <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>⌕</span>
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Jean 3:16 ou mot-clé…"
                    className="flex-1 bg-transparent text-[12px] outline-none placeholder:text-[var(--color-text-disabled)]"
                    style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-sans)' }}
                  />
                  {isSearching && (
                    <span className="text-[10px] animate-pulse" style={{ color: 'var(--color-text-muted)' }}>…</span>
                  )}
                  {searchQuery && !isSearching && (
                    <button
                      onClick={() => handleSearch('')}
                      className="text-[10px] transition-opacity hover:opacity-70"
                      style={{ color: 'var(--color-text-muted)' }}
                    >✕</button>
                  )}
                </div>
              </div>

              {/* ── Main Content ────────────────────────────────── */}
              {error ? (
                <div className="flex flex-1 items-center justify-center px-6 text-center">
                  <p className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>{error}</p>
                </div>
              ) : showSearch ? (
                /* Search results */
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
                  {searchResults.length === 0 && !isSearching && (
                    <p className="text-[12px] py-6 text-center" style={{ color: 'var(--color-text-muted)' }}>
                      Aucun verset trouvé.
                    </p>
                  )}
                  {searchResults.map((v) => (
                    <VerseRow key={v.id} verse={v} actionLabel={actionLabel} onAction={handleVerseAction} />
                  ))}
                </div>
              ) : (
                /* Book / Chapter / Verse navigation */
                <div className="flex flex-1 overflow-hidden">
                  {/* Book list */}
                  <div
                    className="w-[130px] shrink-0 border-r overflow-y-auto py-2"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    {books.map((book) => (
                      <button
                        key={book.id}
                        onClick={() => setBook(book.id, book.name)}
                        className={cn(
                          'w-full text-left px-3 py-1.5 text-[11px] transition-colors',
                          currentBook === book.id
                            ? 'text-[var(--color-text-primary)] bg-[rgba(255,255,255,0.06)]'
                            : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
                        )}
                        style={{ fontFamily: 'var(--font-sans)' }}
                      >
                        {book.name}
                      </button>
                    ))}
                  </div>

                  {/* Chapter + Verse panel */}
                  <div className="flex flex-1 flex-col overflow-hidden">
                    {/* Chapter numbers */}
                    {chapters.length > 0 && (
                      <div
                        className="shrink-0 flex flex-wrap gap-1 px-3 py-2 border-b"
                        style={{ borderColor: 'var(--color-border)' }}
                      >
                        {chapters.map((ch) => (
                          <button
                            key={ch.id}
                            onClick={() =>
                              setChapter(currentBook!, currentBookName!, ch.id, ch.number)
                            }
                            className={cn(
                              'text-[10px] w-7 h-7 rounded-[4px] transition-colors',
                              currentChapterId === ch.id
                                ? 'text-[var(--color-text-primary)] bg-[rgba(255,255,255,0.10)]'
                                : 'text-[var(--color-text-muted)] hover:bg-[rgba(255,255,255,0.04)]'
                            )}
                            style={{ fontFamily: 'var(--font-sans)' }}
                          >
                            {ch.number}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Verse list */}
                    <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
                      {loadingVerses && (
                        <p className="text-[11px] py-4 text-center animate-pulse" style={{ color: 'var(--color-text-muted)' }}>
                          Chargement…
                        </p>
                      )}
                      {!loadingVerses && verseList.length === 0 && currentChapterId && (
                        <p className="text-[11px] py-4 text-center" style={{ color: 'var(--color-text-muted)' }}>
                          Aucun verset.
                        </p>
                      )}
                      {!loadingVerses && !currentBook && (
                        <p className="text-[11px] py-6 text-center" style={{ color: 'var(--color-text-muted)' }}>
                          Choisis un livre.
                        </p>
                      )}
                      {verseList.map((v) => (
                        <VerseRow key={v.id} verse={v} actionLabel={actionLabel} onAction={handleVerseAction} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    )
  }

  interface VerseRowProps {
    verse: BibleVerse
    actionLabel: string
    onAction: (verse: BibleVerse) => void
  }

  function VerseRow({ verse, actionLabel, onAction }: VerseRowProps) {
    return (
      <div
        className="group flex items-start gap-2.5 rounded-[4px] px-2 py-2 transition-colors hover:bg-[rgba(255,255,255,0.03)]"
      >
        {verse.verseNumber > 0 && (
          <span
            className="shrink-0 w-5 text-right text-[9px] pt-[3px]"
            style={{ color: 'var(--color-text-disabled)', fontFamily: 'var(--font-sans)' }}
          >
            {verse.verseNumber}
          </span>
        )}
        <p
          className="flex-1 text-[12px] italic leading-relaxed"
          style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-editorial)' }}
        >
          {verse.reference && verse.verseNumber === 0 && (
            <span
              className="not-italic text-[9px] tracking-[.06em] uppercase mr-1.5 block mb-0.5"
              style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)' }}
            >
              {verse.reference}
            </span>
          )}
          {verse.text}
        </p>
        <button
          onClick={() => onAction(verse)}
          className="shrink-0 opacity-0 group-hover:opacity-100 text-[8px] font-medium tracking-[.06em] uppercase px-2 py-1 rounded-[3px] border transition-all"
          style={{
            color: 'var(--color-text-primary)',
            borderColor: 'var(--color-border-mid)',
            background: 'rgba(255,255,255,0.06)',
            fontFamily: 'var(--font-sans)',
          }}
        >
          {actionLabel}
        </button>
      </div>
    )
  }
  ```

- [ ] **Step 4.2 : Commit**

  ```bash
  git add src/features/bible/BibleDrawer.tsx
  git commit -m "feat(bible): BibleDrawer — search + nav livre/chapitre + versets"
  ```

---

## Task 5: `BibleFAB.tsx` — bouton flottant global

**Files:**
- Create: `src/features/bible/BibleFAB.tsx`

- [ ] **Step 5.1 : Créer `src/features/bible/BibleFAB.tsx`**

  ```tsx
  'use client'

  import { usePathname } from 'next/navigation'
  import { useBibleStore } from '@/lib/stores/bible.store'

  export function BibleFAB() {
    const pathname = usePathname()
    const open = useBibleStore((s) => s.open)

    // Caché dans l'éditeur Journal — le footer de JournalEditor a son propre bouton
    if (pathname.startsWith('/journal/')) return null

    return (
      <button
        onClick={() => open('read')}
        className="fixed z-30 bottom-[72px] right-4 md:bottom-6 flex h-10 w-10 items-center justify-center rounded-full border transition-opacity hover:opacity-80"
        style={{
          background: 'var(--color-bg-surface)',
          borderColor: 'var(--color-border-mid)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
        }}
        aria-label="Ouvrir la Bible"
      >
        <span className="text-[16px]" aria-hidden="true">📖</span>
      </button>
    )
  }
  ```

- [ ] **Step 5.2 : Commit**

  ```bash
  git add src/features/bible/BibleFAB.tsx
  git commit -m "feat(bible): BibleFAB — bouton flottant (caché sur /journal/[id])"
  ```

---

## Task 6: Intégration dans `layout.tsx`

**Files:**
- Modify: `src/app/(main)/layout.tsx`

- [ ] **Step 6.1 : Modifier `src/app/(main)/layout.tsx`**

  Remplacer le contenu entier par :

  ```tsx
  import Sidebar from '@/features/nav/Sidebar'
  import BottomNav from '@/features/nav/BottomNav'
  import { AuthProvider } from '@/features/auth/AuthProvider'
  import { SyncDot } from '@/features/nav/SyncDot'
  import { BackgroundCanvas } from '@/components/ui/BackgroundCanvas'
  import { BibleFAB } from '@/features/bible/BibleFAB'
  import { BibleDrawer } from '@/features/bible/BibleDrawer'

  export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
      <AuthProvider>
        <BackgroundCanvas />
        <SyncDot />
        <div className="flex h-screen overflow-hidden relative">
          <div className="hidden md:flex h-full relative z-[var(--z-sidebar)]">
            <Sidebar />
          </div>
          <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
            {children}
          </main>
          <BottomNav />
        </div>
        <BibleFAB />
        <BibleDrawer />
      </AuthProvider>
    )
  }
  ```

- [ ] **Step 6.2 : Lancer le dev server et vérifier le FAB**

  ```bash
  npm run dev
  ```

  Vérifier dans le navigateur :
  - Le FAB 📖 apparaît en bas à droite sur toutes les pages (Carte, Secrets, Bibliothèque…)
  - Cliquer sur 📖 ouvre le drawer depuis la droite avec animation
  - Le sélecteur de version fonctionne (change LSG → KJV → retour)
  - Le drawer se ferme via ✕ (desktop) ou ← (mobile)
  - La liste de livres se charge (peut prendre 1-2s la première fois)

- [ ] **Step 6.3 : Commit**

  ```bash
  git add src/app/"(main)"/layout.tsx
  git commit -m "feat(bible): intégrer BibleFAB + BibleDrawer dans le layout principal"
  ```

---

## Task 7: Intégration dans `JournalEditor.tsx`

**Files:**
- Modify: `src/features/journal/JournalEditor.tsx`

- [ ] **Step 7.1 : Ajouter l'import du store Bible**

  Dans `src/features/journal/JournalEditor.tsx`, ajouter l'import après les imports existants :

  ```ts
  import { useBibleStore } from '@/lib/stores/bible.store'
  ```

- [ ] **Step 7.2 : Ajouter `openBible` dans le composant**

  Dans le corps de `JournalEditor`, après la ligne `const saveTimer = ...` :

  ```ts
  const openBible = useBibleStore((s) => s.open)

  function handleBibleInsert(text: string, reference: string) {
    editor?.chain().focus()
      .insertContent(`<blockquote><em>${text}</em> — <small>${reference}</small></blockquote>`)
      .run()
  }
  ```

- [ ] **Step 7.3 : Ajouter le bouton Bible dans le footer**

  Dans le `<footer>` de `JournalEditor`, dans le `<div>` qui contient le compteur de mots, ajouter le bouton après le compteur :

  Trouver ce bloc :
  ```tsx
  <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
    {words} mot{words !== 1 ? 's' : ''}
  </span>
  ```

  Remplacer par :
  ```tsx
  <div className="flex items-center gap-3">
    <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
      {words} mot{words !== 1 ? 's' : ''}
    </span>
    <button
      type="button"
      onClick={() => openBible('insert', handleBibleInsert)}
      className="text-[9px] font-medium tracking-[.07em] uppercase px-2.5 py-1 rounded-[4px] border transition-opacity hover:opacity-70"
      style={{
        color: 'var(--color-text-muted)',
        borderColor: 'var(--color-border)',
        background: 'rgba(255,255,255,0.03)',
        fontFamily: 'var(--font-sans)',
      }}
      aria-label="Ouvrir la Bible et insérer un verset"
    >
      📖 Bible
    </button>
  </div>
  ```

- [ ] **Step 7.4 : Vérifier l'insertion**

  Dans le navigateur :
  - Aller sur `/journal` → créer ou ouvrir une note
  - Cliquer sur "📖 Bible" dans le footer
  - Le drawer s'ouvre (le FAB n'apparaît pas)
  - Naviguer vers un verset → hover → "↳ Insérer"
  - Cliquer → le drawer se ferme → le verset apparaît en `<blockquote>` dans la note
  - La note se sauvegarde automatiquement (debounce 1s)

- [ ] **Step 7.5 : Commit**

  ```bash
  git add src/features/journal/JournalEditor.tsx
  git commit -m "feat(journal): bouton Bible dans l'éditeur + insertion blockquote au curseur"
  ```

---

## Task 8: Vérification finale + nettoyage

- [ ] **Step 8.1 : Vérifier le build**

  ```bash
  npm run build
  ```
  Attendu : `✓ Compiled successfully` sans erreurs TypeScript.

- [ ] **Step 8.2 : Checklist manuelle**

  | Scénario | Attendu |
  |----------|---------|
  | FAB visible sur `/` | ✓ |
  | FAB visible sur `/bibliotheque` | ✓ |
  | FAB absent sur `/journal/[id]` | ✓ |
  | Drawer : changer version → liste se recharge | ✓ |
  | Drawer : recherche "amour" → versets pertinents | ✓ |
  | Drawer : nav Livre → Chapitre → versets | ✓ |
  | Drawer depuis Journal : "↳ Insérer" → blockquote dans note | ✓ |
  | Drawer depuis Carte : "Ancrer" → sauvegarde en Bibliothèque | ✓ |
  | Préférences `/profil` : changer version → reflété dans drawer | ✓ |
  | Mobile : drawer plein écran, ← pour fermer | ✓ |

- [ ] **Step 8.3 : Commit final**

  ```bash
  git add -A
  git commit -m "feat: lecteur Bible drawer + insertion Journal — Phase F complète"
  ```

---

## Notes de déploiement

Avant `vercel --prod`, ajouter la variable d'environnement sur Vercel :

```bash
vercel env add BIBLE_API_KEY production
# Entrer la valeur quand demandé
```
