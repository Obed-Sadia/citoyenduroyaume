# Gemini Domain Classification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter la classification Gemini des Domaines — suggestion au premier save du Journal (B) et bouton manuel dans CaptureBar (C).

**Architecture:** Une Server Action `classifyDomain(text)` appelle `gemini-2.0-flash` avec un prompt à 7 choix forcés. `JournalEditor` l'appelle une seule fois après le debounce si `note.domain === null`. `CaptureBar` l'appelle sur clic d'un bouton `◈ Domaine`. L'état de suggestion est 100% local (`useState`) dans chaque composant — aucun store modifié.

**Tech Stack:** `@google/generative-ai` ^0.24, Next.js 16 Server Actions, TypeScript strict

---

## Fichiers touchés

| Action  | Fichier |
|---------|---------|
| Create  | `src/lib/ai/classify-domain.ts` |
| Modify  | `src/features/journal/JournalEditor.tsx` |
| Modify  | `src/features/secrets/CaptureBar.tsx` |
| Modify  | `STATUS.md` |

---

## Task 0 : Installer le SDK Gemini

**Files:**
- Modify: `package.json` (via npm)

- [ ] **Step 1 : Installer `@google/generative-ai`**

  ```bash
  npm install @google/generative-ai
  ```

  Expected : `@google/generative-ai` apparaît dans `package.json` > `dependencies`.

- [ ] **Step 2 : Ajouter la clé API dans `.env.local`**

  Ouvrir `.env.local` et ajouter (la valeur est déjà dans `.env.local.example`) :

  ```
  GEMINI_API_KEY=<ta_clé>
  ```

- [ ] **Step 3 : Commit**

  ```bash
  git add package.json package-lock.json
  git commit -m "chore: install @google/generative-ai"
  ```

---

## Task 1 : Server Action `classifyDomain`

**Files:**
- Create: `src/lib/ai/classify-domain.ts`

- [ ] **Step 1 : Créer `src/lib/ai/classify-domain.ts`**

  ```typescript
  'use server'

  import { GoogleGenerativeAI } from '@google/generative-ai'
  import { DOMAIN_META, type DomainId } from '@/features/carte/domain-constants'

  const VALID_IDS = new Set<string>(DOMAIN_META.map((d) => d.id))

  const PROMPT =
    `Tu es un assistant de classification théologique pour l'application BASILEIA.\n` +
    `Les 7 Domaines du Royaume sont :\n` +
    `- roi : La nature, l'identité et le règne de Dieu le Roi\n` +
    `- territoire : Le territoire intérieur, la terre promise, l'espace de règne\n` +
    `- citoyens : La communauté, les relations, le corps du Christ\n` +
    `- constitution : La Parole comme loi fondamentale, les promesses\n` +
    `- lois : Les principes, les commandements, la sagesse pratique\n` +
    `- gouvernement : L'autorité spirituelle, la délégation, le leadership\n` +
    `- privileges : Les droits, les bénédictions, l'héritage du Royaume\n\n` +
    `Lis ce texte et réponds UNIQUEMENT par l'identifiant du domaine le plus pertinent\n` +
    `(un seul mot parmi : roi, territoire, citoyens, constitution, lois, gouvernement, privileges).\n\n` +
    `Texte : `

  export async function classifyDomain(text: string): Promise<DomainId> {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    const result = await model.generateContent(PROMPT + text)
    const raw = result.response.text().trim().toLowerCase()
    return (VALID_IDS.has(raw) ? raw : 'roi') as DomainId
  }
  ```

- [ ] **Step 2 : Vérifier le build TypeScript**

  ```bash
  npx tsc --noEmit
  ```

  Expected : aucune erreur.

- [ ] **Step 3 : Commit**

  ```bash
  git add src/lib/ai/classify-domain.ts
  git commit -m "feat(ai): add classifyDomain Server Action (gemini-2.0-flash)"
  ```

---

## Task 2 : JournalEditor — suggestion au premier save

**Files:**
- Modify: `src/features/journal/JournalEditor.tsx`

**Contexte :** `note.domain` est de type `DomainId | null`. L'éditeur a déjà un debounce 1s dans `onUpdate`. `editor.getText()` retourne le texte brut depuis Tiptap.

- [ ] **Step 1 : Ajouter les imports et les états locaux**

  Remplacer la ligne d'import existante :
  ```typescript
  import { useEffect, useRef, useState } from 'react'
  ```
  par (inchangé — `useCallback` non nécessaire ici) :
  ```typescript
  import { useEffect, useRef, useState } from 'react'
  ```

  Ajouter l'import de `classifyDomain`, `DOMAIN_META` et `DomainId` après les imports existants :
  ```typescript
  import { classifyDomain } from '@/lib/ai/classify-domain'
  import { DOMAIN_META, type DomainId } from '@/features/carte/domain-constants'
  ```

  Dans le corps du composant, après la ligne `const saveTimer = useRef(...)`, ajouter :
  ```typescript
  const [suggestion, setSuggestion]     = useState<DomainId | null>(null)
  const [classifying, setClassifying]   = useState(false)
  const hasAttemptedRef                 = useRef(!!note?.domain)
  const classifyingRef                  = useRef(false)
  ```

- [ ] **Step 2 : Ajouter la logique de classification dans le debounce**

  Remplacer le callback `onUpdate` existant :

  ```typescript
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
  ```

  par :

  ```typescript
  onUpdate({ editor }) {
    setSaveStatus('saving')
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      const html    = editor.getHTML()
      const text    = editor.getText()
      const words   = text.trim() ? text.trim().split(/\s+/).length : 0
      const excerpt = text.slice(0, 120)
      updateNote(id, { content: html, excerpt, wordCount: words })
      setSaveStatus('saved')

      if (!hasAttemptedRef.current && !classifyingRef.current && text.length >= 20) {
        hasAttemptedRef.current = true
        classifyingRef.current  = true
        setClassifying(true)
        try {
          const domain = await classifyDomain(text)
          setSuggestion(domain)
        } catch {
          // silent — App-Effacement
        } finally {
          setClassifying(false)
          classifyingRef.current = false
        }
      }
    }, 1000)
  },
  ```

- [ ] **Step 3 : Ajouter les handlers de validation/rejet**

  Après la fonction `handleTitleChange`, ajouter :

  ```typescript
  function handleValidateDomain() {
    if (!suggestion) return
    updateNote(id, { domain: suggestion })
    setSuggestion(null)
  }

  function handleDismissSuggestion() {
    setSuggestion(null)
  }
  ```

- [ ] **Step 4 : Mettre à jour l'UI du header**

  Remplacer dans le `<header>` la ligne :
  ```typescript
  {note.domain && <DomainBadge domain={note.domain} />}
  ```

  par :
  ```typescript
  {note.domain ? (
    <DomainBadge domain={note.domain} />
  ) : suggestion ? (
    <div className="flex items-center gap-1.5 shrink-0">
      <span
        className="animate-pulse text-[10px] font-medium tracking-[.06em] uppercase px-2 py-1 rounded-[var(--radius-sm)] border border-[var(--color-amber-border)] bg-[var(--color-amber-bg)] text-[var(--color-amber-400)]"
      >
        {DOMAIN_META.find((d) => d.id === suggestion)?.abbr} · Suggéré
      </span>
      <button
        onClick={handleValidateDomain}
        className="text-[10px] px-2 py-1 rounded-[var(--radius-sm)] border border-[var(--color-amber-border)] bg-[var(--color-amber-bg)] text-[var(--color-amber-400)] transition-opacity hover:opacity-70"
      >
        Valider
      </button>
      <button
        onClick={handleDismissSuggestion}
        className="text-[10px] text-[var(--color-text-muted)] transition-opacity hover:opacity-70"
        aria-label="Ignorer la suggestion"
      >
        ✕
      </button>
    </div>
  ) : classifying ? (
    <span className="text-[10px] text-[var(--color-text-muted)] animate-pulse shrink-0">…</span>
  ) : null}
  ```

- [ ] **Step 5 : Vérifier le build TypeScript**

  ```bash
  npx tsc --noEmit
  ```

  Expected : aucune erreur.

- [ ] **Step 6 : Commit**

  ```bash
  git add src/features/journal/JournalEditor.tsx
  git commit -m "feat(journal): suggest domain via Gemini on first save"
  ```

---

## Task 3 : CaptureBar — bouton `◈ Domaine`

**Files:**
- Modify: `src/features/secrets/CaptureBar.tsx`

**Contexte :** `addSecret(text, domainId?)` — le deuxième argument est optionnel. Le bouton apparaît quand `text.trim().length >= 3`. La soumission inclut le domaine suggéré si présent.

- [ ] **Step 1 : Ajouter les imports**

  Remplacer :
  ```typescript
  import { useEffect, useRef, useState } from 'react'
  import { useSecretsStore } from '@/lib/stores/secrets.store'
  ```
  par :
  ```typescript
  import { useEffect, useRef, useState } from 'react'
  import { useSecretsStore } from '@/lib/stores/secrets.store'
  import { classifyDomain } from '@/lib/ai/classify-domain'
  import { DOMAIN_META, type DomainId } from '@/features/carte/domain-constants'
  import { cn } from '@/lib/utils'
  ```

- [ ] **Step 2 : Ajouter les états locaux**

  Après la ligne `const addSecret = useSecretsStore(...)`, ajouter :
  ```typescript
  const [suggestedDomain, setSuggestedDomain] = useState<DomainId | null>(null)
  const [classifying, setClassifying]         = useState(false)
  ```

- [ ] **Step 3 : Ajouter le handler de classification**

  Après la fonction `handleKeyDown`, ajouter :
  ```typescript
  async function handleClassify() {
    if (classifying || text.trim().length < 3) return
    setClassifying(true)
    try {
      const domain = await classifyDomain(text.trim())
      setSuggestedDomain(domain)
    } catch {
      // silent — App-Effacement
    } finally {
      setClassifying(false)
    }
  }
  ```

- [ ] **Step 4 : Mettre à jour `handleKeyDown` pour inclure le domaine**

  Remplacer :
  ```typescript
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && text.trim()) {
      addSecret(text.trim())
      setText('')
    }
  }
  ```
  par :
  ```typescript
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && text.trim()) {
      addSecret(text.trim(), suggestedDomain ?? undefined)
      setText('')
      setSuggestedDomain(null)
    }
  }
  ```

- [ ] **Step 5 : Mettre à jour le JSX**

  Remplacer le `return` complet :
  ```typescript
  return (
    <div
      className="sticky bottom-16 md:bottom-0 z-10 border-t border-[var(--color-border)] bg-[var(--color-bg-base)] px-4 py-3"
    >
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Une fulgurance… Entrée pour capturer"
        className="w-full bg-transparent text-[14px] leading-relaxed outline-none placeholder:text-[var(--color-text-disabled)]"
        style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-editorial)' }}
      />
    </div>
  )
  ```
  par :
  ```typescript
  const showDomainRow = text.trim().length >= 3

  return (
    <div className="sticky bottom-16 md:bottom-0 z-10 border-t border-[var(--color-border)] bg-[var(--color-bg-base)] px-4 pt-3 pb-2">
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => { setText(e.target.value); setSuggestedDomain(null) }}
        onKeyDown={handleKeyDown}
        placeholder="Une fulgurance… Entrée pour capturer"
        className="w-full bg-transparent text-[14px] leading-relaxed outline-none placeholder:text-[var(--color-text-disabled)]"
        style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-editorial)' }}
      />

      {showDomainRow && (
        <div className="mt-2 flex h-6 items-center">
          {suggestedDomain ? (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-medium tracking-[.06em] uppercase px-2 py-0.5 rounded-[var(--radius-sm)] border border-[var(--color-amber-border)] bg-[var(--color-amber-bg)] text-[var(--color-amber-400)]">
                {DOMAIN_META.find((d) => d.id === suggestedDomain)?.abbr}
              </span>
              <button
                onClick={() => setSuggestedDomain(null)}
                className="text-[10px] text-[var(--color-text-muted)] transition-opacity hover:opacity-70"
                aria-label="Retirer le domaine"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={handleClassify}
              disabled={classifying}
              className={cn(
                'flex items-center gap-1 text-[10px] font-medium tracking-[.06em] uppercase transition-opacity',
                'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]',
                classifying && 'opacity-40 cursor-not-allowed'
              )}
            >
              <span aria-hidden="true">{classifying ? '…' : '◈'}</span>
              {!classifying && 'Domaine'}
            </button>
          )}
        </div>
      )}
    </div>
  )
  ```

  Note : `onChange` réinitialise aussi `suggestedDomain` — si l'utilisateur modifie le texte après une suggestion, la suggestion est annulée.

- [ ] **Step 6 : Vérifier le build TypeScript**

  ```bash
  npx tsc --noEmit
  ```

  Expected : aucune erreur.

- [ ] **Step 7 : Commit**

  ```bash
  git add src/features/secrets/CaptureBar.tsx
  git commit -m "feat(secrets): add Gemini domain button in CaptureBar"
  ```

---

## Task 4 : Mettre à jour STATUS.md

**Files:**
- Modify: `STATUS.md`

- [ ] **Step 1 : Déplacer Supabase auth dans ✅ Terminé**

  Dans la section `## ✅ Terminé`, ajouter après `### Persistance locale — Dexie.js` :

  ```markdown
  ### Auth & Stats — Supabase
  - [x] `src/lib/supabase/server.ts` — client serveur SSR
  - [x] `middleware.ts` + `proxy.ts` — refresh session + protection routes
  - [x] `src/app/auth/callback/route.ts` — échange code → session
  - [x] `src/app/(auth)/login/` — page magic link (LoginForm)
  - [x] `src/app/(main)/page.tsx` — fetchDomainStats() réel depuis Supabase

  ### IA — Classification Gemini
  - [x] `src/lib/ai/classify-domain.ts` — Server Action (gemini-2.0-flash)
  - [x] `src/features/journal/JournalEditor.tsx` — suggestion domaine au premier save
  - [x] `src/features/secrets/CaptureBar.tsx` — bouton ◈ Domaine manuel
  ```

- [ ] **Step 2 : Mettre à jour 📋 Prochaine session**

  Remplacer le contenu de `## 📋 Prochaine session` par :

  ```markdown
  1. ~~Supabase auth + `fetchDomainStats()`~~ ✅ fait
  2. ~~Gemini — classification automatique des Domaines~~ ✅ fait
  3. Gemini — auto-titre des notes Journal (si titre vide après 30s d'écriture)
  4. Sync Supabase — pousser notes + secrets IndexedDB vers Supabase en arrière-plan
  ```

- [ ] **Step 3 : Commit**

  ```bash
  git add STATUS.md
  git commit -m "docs: mark Supabase auth + Gemini classification as done in STATUS.md"
  ```

---

## Vérification manuelle post-implémentation

1. `npm run dev`
2. **Journal** : créer une note, écrire ≥ 20 caractères → attendre 2s → chip pulsant apparaît dans le header → cliquer Valider → `DomainBadge` s'affiche à la place
3. **Journal** : rejeter la suggestion (✕) → chip disparaît, pas de domain badge → Gemini ne reclasse pas à la sauvegarde suivante
4. **Secrets** : taper ≥ 3 caractères dans la CaptureBar → bouton `◈ Domaine` apparaît → cliquer → chip ambre s'affiche → Enter soumet avec le domaine
5. **Secrets** : après chip, modifier le texte → chip disparaît (reset), bouton `◈ Domaine` revient
