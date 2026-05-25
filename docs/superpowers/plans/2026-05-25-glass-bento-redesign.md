# Glass Bento Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refondre l'identité visuelle de BASILEIA en Glass Bento — panneaux translucides sur fond vivant (orbes + grain), grille bento modulaire, typographie Geist + Fraunces.

**Architecture:** Un composant `BackgroundCanvas` fixe fournit les orbes et grain. `GlassPanel` et `BentoCell` sont les briques de base réutilisables. Chaque page est refactorée indépendamment en utilisant ces briques — aucune logique métier n'est modifiée.

**Tech Stack:** Next.js 16 App Router, TypeScript strict, Tailwind CSS v4, Framer Motion, `next/font/google`

**Spec:** `docs/superpowers/specs/2026-05-25-glass-bento-redesign.md`

---

## Fichiers touchés

| Action | Fichier | Rôle |
|--------|---------|------|
| Modifier | `src/app/layout.tsx` | Fonts Geist + Fraunces via next/font/google |
| Modifier | `src/styles/globals.css` | @theme fonts, grain CSS, bg body |
| Modifier | `src/styles/tokens.css` | Tokens glass + bg #09080B |
| Créer | `src/components/ui/BackgroundCanvas.tsx` | Orbes fixés (client) |
| Modifier | `src/app/(main)/layout.tsx` | Ajouter BackgroundCanvas, supprimer bg |
| Créer | `src/components/ui/GlassPanel.tsx` | Panel glass 3 variantes |
| Créer | `src/components/ui/BentoGrid.tsx` | BentoGrid + BentoCell |
| Modifier | `src/features/nav/Sidebar.tsx` | bg → glass |
| Modifier | `src/features/nav/BottomNav.tsx` | blur renforcé |
| Modifier | `src/app/(main)/bibliotheque/page.tsx` | Layout bento |
| Modifier | `src/app/(main)/profil/page.tsx` | Layout bento |
| Modifier | `src/app/(main)/notifications/page.tsx` | GlassPanel feed |
| Modifier | `src/app/(main)/alliances/page.tsx` | Header glass |
| Modifier | `src/app/(main)/secrets/page.tsx` | Header bento |
| Modifier | `src/app/(main)/journal/page.tsx` | Header bento |
| Modifier | `src/features/carte/DomainTooltip.tsx` | GlassPanel strong |

---

## Task 1 — Tokens CSS + Fonts

**Fichiers :**
- Modifier : `src/styles/tokens.css`
- Modifier : `src/styles/globals.css`
- Modifier : `src/app/layout.tsx`

- [ ] **Ajouter les tokens glass dans `src/styles/tokens.css`**

Ajouter après `--ease-fast` (avant la fermeture `:root {`) :

```css
/* Glass */
--glass-blur: 16px;
--glass-blur-heavy: 24px;
--glass-base-bg:      rgba(255, 255, 255, 0.045);
--glass-base-border:  rgba(255, 255, 255, 0.09);
--glass-amber-bg:     rgba(239, 159, 39, 0.07);
--glass-amber-border: rgba(239, 159, 39, 0.18);
--glass-strong-bg:    rgba(255, 255, 255, 0.065);
--glass-strong-border: rgba(255, 255, 255, 0.11);
--glass-sidebar-bg:   rgba(255, 255, 255, 0.03);

/* Bento */
--bento-gap: 8px;
--bento-radius: 11px;
```

Et mettre à jour la couleur de fond :

```css
--color-bg-base: #09080B;  /* était #0A0907 */
```

- [ ] **Remplacer les fonts dans `src/styles/globals.css`**

Remplacer le bloc `@theme` existant :

```css
@theme {
  --font-family-sans:      'Geist', system-ui, sans-serif;
  --font-family-editorial: 'Fraunces', Georgia, serif;
}
```

- [ ] **Remplacer les imports de fonts dans `src/app/layout.tsx`**

Remplacer le fichier en entier :

```tsx
import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { Fraunces } from 'next/font/google'
import '@/styles/globals.css'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  axes: ['opsz'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-editorial',
})

export const metadata: Metadata = {
  title: 'BASILEIA',
  description: 'Un territoire intérieur que le Citoyen cartographie lui-même.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${geist.variable} ${fraunces.variable}`}>
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Vérifier le build**

```bash
npm run build
```

Résultat attendu : `✓ Compiled successfully` — zéro erreur TypeScript.

- [ ] **Commit**

```bash
git add src/styles/tokens.css src/styles/globals.css src/app/layout.tsx
git commit -m "feat(design): update tokens glass + switch fonts Geist/Fraunces"
```

---

## Task 2 — BackgroundCanvas + Main Layout

**Fichiers :**
- Créer : `src/components/ui/BackgroundCanvas.tsx`
- Modifier : `src/app/(main)/layout.tsx`

- [ ] **Créer `src/components/ui/BackgroundCanvas.tsx`**

```tsx
'use client'

export function BackgroundCanvas() {
  return (
    <>
      <div
        aria-hidden
        style={{
          position: 'fixed',
          top: -80,
          left: -20,
          width: 340,
          height: 340,
          borderRadius: '50%',
          background: 'rgba(239, 159, 39, 0.13)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'fixed',
          bottom: -60,
          right: -20,
          width: 260,
          height: 260,
          borderRadius: '50%',
          background: 'rgba(110, 75, 180, 0.08)',
          filter: 'blur(70px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
    </>
  )
}
```

- [ ] **Ajouter le grain dans `src/styles/globals.css`**

Ajouter après le bloc `html { ... }` :

```css
/* Grain de fond — fixe, pointer-events none */
html::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.035;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 180px;
}
```

- [ ] **Mettre à jour `src/app/(main)/layout.tsx`**

```tsx
import Sidebar from '@/features/nav/Sidebar'
import BottomNav from '@/features/nav/BottomNav'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { SyncDot } from '@/features/nav/SyncDot'
import { BackgroundCanvas } from '@/components/ui/BackgroundCanvas'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <BackgroundCanvas />
      <SyncDot />
      <div className="flex h-screen overflow-hidden relative" style={{ zIndex: 1 }}>
        <div className="hidden md:flex h-full relative z-[var(--z-sidebar)]">
          <Sidebar />
        </div>
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          {children}
        </main>
        <BottomNav />
      </div>
    </AuthProvider>
  )
}
```

- [ ] **Lancer le dev server et vérifier visuellement**

```bash
npm run dev
```

Ouvrir `http://localhost:3000`. Vérifier : fond sombre `#09080B`, orbe ambre visible en haut à gauche, teinte violette en bas à droite, grain léger sur l'ensemble.

- [ ] **Commit**

```bash
git add src/components/ui/BackgroundCanvas.tsx src/styles/globals.css src/app/\(main\)/layout.tsx
git commit -m "feat(design): add BackgroundCanvas with orbs + grain overlay"
```

---

## Task 3 — GlassPanel + BentoGrid

**Fichiers :**
- Créer : `src/components/ui/GlassPanel.tsx`
- Créer : `src/components/ui/BentoGrid.tsx`

- [ ] **Créer `src/components/ui/GlassPanel.tsx`**

```tsx
import { cn } from '@/lib/utils'
import type { CSSProperties, ReactNode } from 'react'

export type GlassVariant = 'base' | 'amber' | 'strong'

const VARIANT_STYLES: Record<GlassVariant, CSSProperties> = {
  base: {
    background: 'var(--glass-base-bg)',
    border: '1px solid var(--glass-base-border)',
  },
  amber: {
    background: 'var(--glass-amber-bg)',
    border: '1px solid var(--glass-amber-border)',
  },
  strong: {
    background: 'var(--glass-strong-bg)',
    border: '1px solid var(--glass-strong-border)',
  },
}

interface GlassPanelProps {
  variant?: GlassVariant
  className?: string
  style?: CSSProperties
  children: ReactNode
}

export function GlassPanel({
  variant = 'base',
  className,
  style,
  children,
}: GlassPanelProps) {
  return (
    <div
      className={cn('rounded-[var(--bento-radius)] backdrop-blur-[16px]', className)}
      style={{ ...VARIANT_STYLES[variant], ...style }}
    >
      {children}
    </div>
  )
}
```

- [ ] **Créer `src/components/ui/BentoGrid.tsx`**

```tsx
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'
import { GlassPanel, type GlassVariant } from './GlassPanel'

interface BentoGridProps {
  cols?: 2 | 3 | 4
  className?: string
  children: ReactNode
}

interface BentoCellProps {
  span?: 1 | 2 | 3 | 4
  variant?: GlassVariant
  className?: string
  children: ReactNode
}

const COLS_CLASS: Record<2 | 3 | 4, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
}

const SPAN_CLASS: Record<1 | 2 | 3 | 4, string> = {
  1: '',
  2: 'col-span-2',
  3: 'col-span-3',
  4: 'col-span-4',
}

export function BentoGrid({ cols = 3, className, children }: BentoGridProps) {
  return (
    <div
      className={cn('grid', COLS_CLASS[cols], className)}
      style={{ gap: 'var(--bento-gap)' }}
    >
      {children}
    </div>
  )
}

export function BentoCell({
  span = 1,
  variant = 'base',
  className,
  children,
}: BentoCellProps) {
  return (
    <GlassPanel
      variant={variant}
      className={cn('p-[13px]', SPAN_CLASS[span], className)}
    >
      {children}
    </GlassPanel>
  )
}
```

- [ ] **Vérifier le build TypeScript**

```bash
npm run build
```

Résultat attendu : `✓ Compiled successfully`, zéro erreur.

- [ ] **Commit**

```bash
git add src/components/ui/GlassPanel.tsx src/components/ui/BentoGrid.tsx
git commit -m "feat(design): add GlassPanel and BentoGrid/BentoCell components"
```

---

## Task 4 — Sidebar Glass

**Fichiers :**
- Modifier : `src/features/nav/Sidebar.tsx`

- [ ] **Mettre à jour le `<motion.nav>` dans `src/features/nav/Sidebar.tsx`**

Remplacer les classes `className` du `<motion.nav>` (ligne 44) :

```tsx
// Avant
className="relative flex flex-col h-full flex-shrink-0 overflow-hidden
           bg-[var(--color-bg-surface)] border-r border-[var(--color-border)]"

// Après
className="relative flex flex-col h-full flex-shrink-0 overflow-hidden
           border-r border-[var(--color-border)] backdrop-blur-[20px]"
style={{ background: 'var(--glass-sidebar-bg)' } as React.CSSProperties}
```

Note : ajouter `import type { CSSProperties } from 'react'` si pas déjà présent, ou caster via `as React.CSSProperties`.

- [ ] **Vérifier visuellement sur `http://localhost:3000`**

La sidebar doit être translucide — les orbes du fond doivent être visibles à travers elle.

- [ ] **Commit**

```bash
git add src/features/nav/Sidebar.tsx
git commit -m "feat(design): sidebar glass backdrop-blur"
```

---

## Task 5 — BottomNav Glass

**Fichiers :**
- Modifier : `src/features/nav/BottomNav.tsx`

- [ ] **Lire le fichier actuel**

```bash
cat src/features/nav/BottomNav.tsx
```

- [ ] **Mettre à jour le style du nav**

Trouver le `<nav>` ou `<div>` racine du BottomNav. Remplacer les valeurs de background et backdrop-filter :

```tsx
// Trouver ces valeurs et les remplacer :
// background: 'rgba(10, 9, 7, 0.88)'  →  'rgba(9, 8, 11, 0.75)'
// backdrop-filter: blur(16px)          →  blur(24px)
```

Si le style est via className Tailwind `backdrop-blur-[16px]`, remplacer par `backdrop-blur-[24px]`.
Si via style inline, remplacer la valeur de `backdropFilter`.

- [ ] **Vérifier visuellement sur mobile (`< 768px`) via les DevTools navigateur**

Le BottomNav doit être plus translucide qu'avant, laissant le fond passer.

- [ ] **Commit**

```bash
git add src/features/nav/BottomNav.tsx
git commit -m "feat(design): BottomNav enhanced glass blur"
```

---

## Task 6 — Bibliothèque page — Bento

**Fichiers :**
- Modifier : `src/app/(main)/bibliotheque/page.tsx`

- [ ] **Remplacer le contenu de `src/app/(main)/bibliotheque/page.tsx`**

```tsx
'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useVersesStore } from '@/lib/stores/verses.store'
import { VerseFeed } from '@/features/bibliotheque/VerseFeed'
import { VerseCaptureBar } from '@/features/bibliotheque/VerseCaptureBar'
import { VerseSearch } from '@/features/bibliotheque/VerseSearch'
import { BentoGrid, BentoCell } from '@/components/ui/BentoGrid'

export default function BibliothequePage() {
  const verses = useVersesStore((s) => s.verses)
  const loadFromDb = useVersesStore((s) => s.loadFromDb)
  const [query, setQuery] = useState('')

  useEffect(() => {
    loadFromDb()
  }, [loadFromDb])

  const handleSearch = useCallback((q: string) => setQuery(q), [])

  const filtered = useMemo(() => {
    if (!query.trim()) return verses
    const q = query.toLowerCase()
    return verses.filter(
      (v) => v.reference.toLowerCase().includes(q) || v.text.toLowerCase().includes(q)
    )
  }, [verses, query])

  // Stats
  const thisMonth = useMemo(() => {
    const start = new Date()
    start.setDate(1)
    start.setHours(0, 0, 0, 0)
    return verses.filter((v) => new Date(v.created_at ?? 0) >= start).length
  }, [verses])

  const domains = useMemo(
    () => new Set(verses.map((v) => v.domain).filter(Boolean)).size,
    [verses]
  )

  return (
    <div className="pb-20 px-4 pt-4 md:px-5 md:pt-5">

      {/* Header bento */}
      <BentoGrid cols={3} className="mb-2">
        <BentoCell span={2} variant="strong" className="px-4 py-3">
          <p
            className="text-[9px] font-medium tracking-[0.11em] uppercase mb-0.5"
            style={{ color: 'var(--color-amber-400)' }}
          >
            La Bibliothèque
          </p>
          <p
            className="text-[15px] font-[family-name:var(--font-editorial)] font-[400]"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Versets Ancrés
          </p>
        </BentoCell>

        <BentoCell variant="base" className="flex flex-col justify-center items-center text-center">
          <p
            className="font-[family-name:var(--font-editorial)] text-[32px] font-[300] leading-none"
            style={{ color: 'var(--color-amber-400)' }}
          >
            {verses.length}
          </p>
          <p
            className="text-[8px] tracking-[0.08em] uppercase mt-0.5"
            style={{ color: 'var(--color-text-muted)' }}
          >
            ancrés
          </p>
        </BentoCell>
      </BentoGrid>

      <BentoGrid cols={3} className="mb-4">
        <BentoCell variant="base" className="flex flex-col justify-center">
          <p
            className="font-[family-name:var(--font-editorial)] text-[24px] font-[300] leading-none"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {thisMonth}
          </p>
          <p
            className="text-[8px] tracking-[0.08em] uppercase mt-0.5"
            style={{ color: 'var(--color-text-muted)' }}
          >
            ce mois
          </p>
        </BentoCell>
        <BentoCell variant="base" className="flex flex-col justify-center">
          <p
            className="font-[family-name:var(--font-editorial)] text-[24px] font-[300] leading-none"
            style={{ color: 'var(--color-amber-400)' }}
          >
            {domains}
          </p>
          <p
            className="text-[8px] tracking-[0.08em] uppercase mt-0.5"
            style={{ color: 'var(--color-text-muted)' }}
          >
            domaines
          </p>
        </BentoCell>
        <BentoCell span={1} variant="base">
          <VerseSearch onSearch={handleSearch} />
        </BentoCell>
      </BentoGrid>

      {/* Feed dans un panel glass */}
      <BentoCell span={3} variant="base" className="col-span-full">
        <VerseFeed verses={filtered} />
      </BentoCell>

      <VerseCaptureBar />
    </div>
  )
}
```

- [ ] **Vérifier visuellement sur `http://localhost:3000/bibliotheque`**

Le header doit être en grille bento. Les stats s'affichent en panels glass. Le feed des versets est dans un panel glass.

- [ ] **Vérifier le build**

```bash
npm run build
```

- [ ] **Commit**

```bash
git add src/app/\(main\)/bibliotheque/page.tsx
git commit -m "feat(design): bibliotheque page bento glass layout"
```

---

## Task 7 — Profil page — Bento

**Fichiers :**
- Modifier : `src/app/(main)/profil/page.tsx`

- [ ] **Remplacer le `<header>` et le wrapper racine dans `src/app/(main)/profil/page.tsx`**

La logique de données (Supabase, calculs) reste intacte. Seule la structure JSX change.

Remplacer le `return (...)` :

```tsx
// Ajouter ces imports en haut du fichier (après les imports existants) :
import { BentoGrid, BentoCell } from '@/components/ui/BentoGrid'
import { GlassPanel } from '@/components/ui/GlassPanel'

// Remplacer le return :
return (
  <div className="max-w-[920px] mx-auto px-4 pt-4 md:px-5 md:pt-5 pb-20 space-y-3">

    {/* Header */}
    <BentoGrid cols={3}>
      <BentoCell span={2} variant="strong" className="px-4 py-3">
        <p
          className="text-[9px] font-medium tracking-[0.11em] uppercase mb-0.5"
          style={{ color: 'var(--color-amber-400)' }}
        >
          Profil & Paramètres
        </p>
        <p
          className="text-[15px] font-[family-name:var(--font-editorial)]"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Mon Profil
        </p>
      </BentoCell>
      <BentoCell variant="base" className="flex items-center justify-center">
        <CitizenIdentity
          displayName={profile?.display_name ?? user.email ?? 'Citoyen'}
          avatarUrl={profile?.avatar_url}
          locale={profile?.locale ?? 'fr'}
          createdAt={profile?.created_at ?? user.created_at}
        />
      </BentoCell>
    </BentoGrid>

    {/* Territoire intérieur */}
    <GlassPanel variant="base" className="p-[13px]">
      <p
        className="text-[9px] font-medium tracking-[0.11em] uppercase mb-4"
        style={{ color: 'var(--color-text-muted)' }}
      >
        Mon Territoire Intérieur
      </p>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="shrink-0">
          <TerritoireAtlas exploration={exploration} activeThisWeek={activeThisWeek} />
        </div>
        <div className="grid grid-cols-2 gap-2 content-start flex-1">
          <MetricBlock value={notes.length}   label="Journaux"               amber />
          <MetricBlock value={secrets.length} label="Secrets capturés"               />
          <MetricBlock value={verses.length}  label="Versets ancrés"         amber />
          <MetricBlock value={enProfondeur}   label="En profondeur"                  />
          <MetricBlock
            value={topDomain && topCount > 0 ? DOMAIN_LABELS[topDomain] : '—'}
            label="Domaine de prédilection"
            amber
            small
          />
        </div>
      </div>
    </GlassPanel>

    {/* Préférences */}
    <GlassPanel variant="base" className="p-[13px]">
      <p
        className="text-[9px] font-medium tracking-[0.11em] uppercase mb-4"
        style={{ color: 'var(--color-text-muted)' }}
      >
        Préférences
      </p>
      <PreferencesForm />
    </GlassPanel>

    {/* Compte */}
    <GlassPanel variant="base" className="p-[13px]">
      <p
        className="text-[9px] font-medium tracking-[0.11em] uppercase mb-4"
        style={{ color: 'var(--color-text-muted)' }}
      >
        Compte
      </p>
      <InviteBlock shortCode={profile?.short_code ?? '……'} />
      <div className="flex items-center justify-between py-3" style={ROW}>
        <span className="text-[12.5px]" style={{ color: 'var(--color-text-secondary)' }}>Email</span>
        <span className="text-[11px]"   style={{ color: 'var(--color-text-muted)' }}>
          {user.email ? maskEmail(user.email) : '—'}
        </span>
      </div>
      <div className="flex items-center justify-between py-3" style={ROW}>
        <span className="text-[12.5px]" style={{ color: 'var(--color-text-secondary)' }}>Session</span>
        <LogoutButton />
      </div>
      <div className="flex items-center justify-between py-3">
        <span className="text-[12.5px]" style={{ color: 'rgba(180,70,70,0.80)' }}>Supprimer le compte</span>
        <button className="transition-opacity hover:opacity-70" style={BTN_DANGER}>Supprimer</button>
      </div>
    </GlassPanel>

  </div>
)
```

- [ ] **Vérifier sur `http://localhost:3000/profil`**

Les sections Territoire, Préférences, Compte sont dans des panels glass distincts. Le header est en bento.

- [ ] **Vérifier le build**

```bash
npm run build
```

- [ ] **Commit**

```bash
git add src/app/\(main\)/profil/page.tsx
git commit -m "feat(design): profil page bento glass layout"
```

---

## Task 8 — Notifications page — Glass

**Fichiers :**
- Modifier : `src/app/(main)/notifications/page.tsx`

- [ ] **Remplacer `src/app/(main)/notifications/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { getNotifications } from '@/lib/actions/allies'
import { NotificationFeed } from '@/features/notifications/NotificationFeed'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { BentoGrid, BentoCell } from '@/components/ui/BentoGrid'

export const metadata: Metadata = { title: 'Notifications — BASILEIA' }

export default async function NotificationsPage() {
  const notifications = await getNotifications()
  const unread = notifications.filter((n) => !n.read_at).length

  return (
    <div className="px-4 pt-4 md:px-5 md:pt-5 pb-20 space-y-3">

      <BentoGrid cols={3} className="mb-2">
        <BentoCell span={2} variant="strong" className="px-4 py-3">
          <p
            className="text-[9px] font-medium tracking-[0.11em] uppercase mb-0.5"
            style={{ color: 'var(--color-amber-400)' }}
          >
            Notifications
          </p>
          <p
            className="text-[15px] font-[family-name:var(--font-editorial)]"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Activité récente
          </p>
        </BentoCell>
        <BentoCell variant={unread > 0 ? 'amber' : 'base'} className="flex flex-col justify-center items-center text-center">
          <p
            className="font-[family-name:var(--font-editorial)] text-[28px] font-[300] leading-none"
            style={{ color: unread > 0 ? 'var(--color-amber-400)' : 'var(--color-text-secondary)' }}
          >
            {unread}
          </p>
          <p
            className="text-[8px] tracking-[0.08em] uppercase mt-0.5"
            style={{ color: 'var(--color-text-muted)' }}
          >
            non lues
          </p>
        </BentoCell>
      </BentoGrid>

      <GlassPanel variant="base">
        <NotificationFeed notifications={notifications} />
      </GlassPanel>

    </div>
  )
}
```

- [ ] **Vérifier sur `http://localhost:3000/notifications`**

- [ ] **Commit**

```bash
git add src/app/\(main\)/notifications/page.tsx
git commit -m "feat(design): notifications page glass bento header"
```

---

## Task 9 — Alliances page — Glass

**Fichiers :**
- Modifier : `src/app/(main)/alliances/page.tsx`

- [ ] **Remplacer `src/app/(main)/alliances/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { AllianceTabs } from '@/features/alliances/AllianceTabs'
import { BentoGrid, BentoCell } from '@/components/ui/BentoGrid'

export const metadata: Metadata = { title: 'Alliances — BASILEIA' }

export default function AlliancesPage() {
  return (
    <div className="flex flex-col h-full">

      <div className="px-4 pt-4 md:px-5 md:pt-5 pb-3">
        <BentoGrid cols={3}>
          <BentoCell span={3} variant="strong" className="px-4 py-3">
            <p
              className="text-[9px] font-medium tracking-[0.11em] uppercase mb-0.5"
              style={{ color: 'var(--color-amber-400)' }}
            >
              Alliances & Tribus
            </p>
            <p
              className="text-[15px] font-[family-name:var(--font-editorial)]"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Mes Alliances
            </p>
          </BentoCell>
        </BentoGrid>
      </div>

      <AllianceTabs />
    </div>
  )
}
```

- [ ] **Vérifier sur `http://localhost:3000/alliances`**

- [ ] **Commit**

```bash
git add src/app/\(main\)/alliances/page.tsx
git commit -m "feat(design): alliances page glass header"
```

---

## Task 10 — Secrets page — Bento header

**Fichiers :**
- Modifier : `src/app/(main)/secrets/page.tsx`

- [ ] **Remplacer `src/app/(main)/secrets/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { SecretFeed } from '@/features/secrets/SecretFeed'
import { CaptureBar } from '@/features/secrets/CaptureBar'
import { BentoGrid, BentoCell } from '@/components/ui/BentoGrid'
import { GlassPanel } from '@/components/ui/GlassPanel'

export const metadata: Metadata = { title: 'Les Secrets — BASILEIA' }

export default function SecretsPage() {
  return (
    <div className="flex flex-col min-h-full px-4 pt-4 md:px-5 md:pt-5 pb-20 space-y-3">

      <BentoGrid cols={3}>
        <BentoCell span={3} variant="strong" className="px-4 py-3">
          <p
            className="text-[9px] font-medium tracking-[0.11em] uppercase mb-0.5"
            style={{ color: 'var(--color-amber-400)' }}
          >
            Les Secrets · Fulgurances
          </p>
          <p
            className="text-[15px] font-[family-name:var(--font-editorial)]"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Révélations captées
          </p>
        </BentoCell>
      </BentoGrid>

      <GlassPanel variant="base" className="flex-1">
        <SecretFeed />
      </GlassPanel>

      <CaptureBar />
    </div>
  )
}
```

- [ ] **Vérifier sur `http://localhost:3000/secrets`**

- [ ] **Commit**

```bash
git add src/app/\(main\)/secrets/page.tsx
git commit -m "feat(design): secrets page bento header + glass feed"
```

---

## Task 11 — Journal page — Bento header

**Fichiers :**
- Modifier : `src/app/(main)/journal/page.tsx`

- [ ] **Lire le fichier actuel**

```bash
cat src/app/\(main\)/journal/page.tsx
```

- [ ] **Ajouter les imports et remplacer le `<header>` existant par un bento header**

Ajouter en haut du fichier :

```tsx
import { BentoGrid, BentoCell } from '@/components/ui/BentoGrid'
import { GlassPanel } from '@/components/ui/GlassPanel'
```

Remplacer le bloc `<header>` existant par :

```tsx
<div className="px-4 pt-4 md:px-5 md:pt-5 pb-3">
  <BentoGrid cols={3}>
    <BentoCell span={2} variant="strong" className="px-4 py-3">
      <p
        className="text-[9px] font-medium tracking-[0.11em] uppercase mb-0.5"
        style={{ color: 'var(--color-amber-400)' }}
      >
        Le Journal
      </p>
      <p
        className="text-[15px] font-[family-name:var(--font-editorial)]"
        style={{ color: 'var(--color-text-primary)' }}
      >
        Méditations
      </p>
    </BentoCell>
    <BentoCell variant="base" className="flex flex-col justify-center items-center text-center">
      {/* Note count — à adapter selon le store/prop disponible */}
      <p
        className="font-[family-name:var(--font-editorial)] text-[28px] font-[300] leading-none"
        style={{ color: 'var(--color-amber-400)' }}
      >
        —
      </p>
      <p
        className="text-[8px] tracking-[0.08em] uppercase mt-0.5"
        style={{ color: 'var(--color-text-muted)' }}
      >
        notes
      </p>
    </BentoCell>
  </BentoGrid>
</div>
```

Envelopper la liste de notes dans un `<GlassPanel variant="base">` si elle n'est pas déjà dans un conteneur stylé.

- [ ] **Vérifier sur `http://localhost:3000/journal`**

- [ ] **Vérifier le build**

```bash
npm run build
```

- [ ] **Commit**

```bash
git add src/app/\(main\)/journal/page.tsx
git commit -m "feat(design): journal page bento header"
```

---

## Task 12 — La Carte — Tooltips glass

**Fichiers :**
- Modifier : `src/features/carte/DomainTooltip.tsx`

- [ ] **Lire le fichier actuel**

```bash
cat src/features/carte/DomainTooltip.tsx
```

- [ ] **Remplacer le style du tooltip racine**

Trouver le conteneur principal du tooltip (généralement un `<div>` avec `bg-[var(--color-bg-elevated)]` ou similaire).

Remplacer par `GlassPanel variant="strong"` :

```tsx
import { GlassPanel } from '@/components/ui/GlassPanel'

// Remplacer le div racine du tooltip par :
<GlassPanel variant="strong" className="p-[13px] min-w-[180px]">
  {/* contenu existant inchangé */}
</GlassPanel>
```

- [ ] **Vérifier sur `http://localhost:3000`**

Survoler un hexagone de la Carte. Le tooltip doit être translucide avec backdrop-blur.

- [ ] **Vérifier le build final**

```bash
npm run build
```

Résultat attendu : `✓ Compiled successfully` sur toutes les routes.

- [ ] **Commit final**

```bash
git add src/features/carte/DomainTooltip.tsx
git commit -m "feat(design): La Carte tooltip glass panel"
```

---

## Checklist de validation finale

Avant de merger, vérifier chaque point sur `http://localhost:3000` :

- [ ] Fond `#09080B` + orbe ambre visible en haut à gauche
- [ ] Orbe violet atténué visible en bas à droite
- [ ] Grain subtil sur l'ensemble de l'app
- [ ] Sidebar translucide (orbes visibles à travers)
- [ ] BottomNav translucide sur mobile (< 768px)
- [ ] Typographie Geist visible dans les labels UI (nav, stats)
- [ ] Fraunces italic visible dans les versets (Bibliothèque)
- [ ] Bibliothèque : grille bento 3 colonnes en header
- [ ] Profil : sections en panels glass distincts
- [ ] Notifications : header bento + feed en glass
- [ ] Alliances : header glass
- [ ] Secrets : header bento + feed en glass
- [ ] Journal : header bento
- [ ] La Carte : tooltips translucides
- [ ] `npm run build` passe sans erreur TypeScript
