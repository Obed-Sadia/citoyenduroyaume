# Noir Éditorial — Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer le design Brume & Acier (saphir, DM Mono, Lora, glass) par une direction Noir Éditorial (monochrome pur, Instrument Serif, bento spacieux).

**Architecture:** Chaque tâche est autonome et se termine par un build propre. Les tokens CSS sont le point de départ — tous les composants en dépendent. Aucune logique métier ne change.

**Tech Stack:** Next.js 16 App Router · Tailwind CSS v4 · Framer Motion · `next/font/google`

---

## Fichiers modifiés

| Fichier | Type | Changement |
|---------|------|-----------|
| `src/styles/tokens.css` | Modify | Nouveau jeu de tokens monochrome complet |
| `src/styles/globals.css` | Modify | Fonts system sans + Instrument Serif, fond noir |
| `src/app/layout.tsx` | Modify | Remplacer Lora + DM_Mono → Instrument_Serif |
| `src/features/nav/NavItem.tsx` | Modify | Supprimer border-left accent, états via opacité |
| `src/features/nav/Sidebar.tsx` | Modify | Logo monochrome, supprimer glass-sidebar-bg |
| `src/features/nav/BottomNav.tsx` | Modify | Couleurs monochrome, bg noir |
| `src/components/bento/BentoCard.tsx` | Modify | Couleurs monochrome, BentoVal Instrument Serif |
| `src/components/layout/FeedEntry.tsx` | Modify | Supprimer references accent, font editorial |
| `src/features/profil/stats/MetricBlock.tsx` | Modify | Prop `amber` → monochrome, Instrument Serif |
| `src/app/(main)/page.tsx` | Modify | Padding spacieux, H1 34px, structure héro |
| `docs/style-guide.md` | Modify | MAJ complète design system |

---

## Task 1 : Foundation — tokens.css

**Files:**
- Modify: `src/styles/tokens.css`

- [ ] **Réécrire tokens.css complet**

```css
/* src/styles/tokens.css */
:root {
  /* Surfaces */
  --color-bg-base:     #0a0a0a;
  --color-bg-surface:  #111111;
  --color-bg-elevated: #181818;
  --color-bg-hover:    rgba(255,255,255,0.04);
  --color-bg-active:   rgba(255,255,255,0.06);

  /* Texte — hiérarchie par opacité uniquement, zéro couleur d'accent */
  --color-text-primary:   rgba(255,255,255,0.88);
  --color-text-secondary: rgba(255,255,255,0.42);
  --color-text-muted:     rgba(255,255,255,0.22);
  --color-text-disabled:  rgba(255,255,255,0.12);

  /* Bordures */
  --color-border:        rgba(255,255,255,0.06);
  --color-border-mid:    rgba(255,255,255,0.10);
  --color-border-subtle: rgba(255,255,255,0.03);

  /* Ombres */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.6);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.7), 0 1px 3px rgba(0,0,0,0.5);

  /* Fonts (remplacées par next/font dans layout.tsx) */
  --font-sans:      -apple-system, 'Helvetica Neue', sans-serif;
  --font-editorial: 'Instrument Serif', Georgia, serif;

  /* Easing */
  --ease-fast: cubic-bezier(0.16,1,0.3,1);

  /* Layout */
  --bento-gap:    6px;
  --bento-radius: 6px;

  --sidebar-collapsed-width: 50px;
  --sidebar-expanded-width:  240px;
  --bottom-nav-height:       60px;

  /* Radius */
  --radius-xs: 3px;
  --radius-sm: 5px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 10px;

  /* Z-index */
  --z-sidebar:   10;
  --z-bottomnav: 50;
  --z-modal:     60;
}

[data-theme="light"] {
  --color-bg-base:        #f0ede8;
  --color-bg-surface:     #ffffff;
  --color-bg-elevated:    #ffffff;
  --color-text-primary:   rgba(20,18,14,0.90);
  --color-text-secondary: rgba(20,18,14,0.50);
  --color-text-muted:     rgba(20,18,14,0.30);
  --color-border:         rgba(0,0,0,0.08);
  --color-border-subtle:  rgba(0,0,0,0.04);
}
```

- [ ] **Vérifier le build**

```bash
cd /home/obeds/Dev/perso/citoyen-du-royaume && npm run build 2>&1 | tail -20
```

Attendu : `✓ Compiled successfully` ou liste d'erreurs TypeScript (pas d'erreurs CSS à ce stade).

- [ ] **Commit**

```bash
git add src/styles/tokens.css
git commit -m "style: tokens monochrome Noir Éditorial — zéro accent couleur"
```

---

## Task 2 : Fonts — globals.css + layout.tsx

**Files:**
- Modify: `src/styles/globals.css`
- Modify: `src/app/layout.tsx`

- [ ] **Mettre à jour globals.css**

```css
/* src/styles/globals.css */
@import "tailwindcss";
@import './tokens.css';

@source not "../../docs/**";
@source not "../../memory/**";

@theme {
  --font-family-sans:      -apple-system, 'Helvetica Neue', sans-serif;
  --font-family-editorial: 'Instrument Serif', Georgia, serif;
}

html {
  background: var(--color-bg-base);
  color: var(--color-text-primary);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}

/* Grain de fond — fixe, pointer-events none */
html::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  opacity: 0.025;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 180px;
}

::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 2px;
}

/* Tiptap editor */
.ProseMirror {
  outline: none;
  color: var(--color-text-primary);
  font-family: var(--font-editorial);
  font-style: italic;
  font-size: 15px;
  line-height: 1.85;
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
  font-weight: 400;
  margin: 1.25em 0 0.5em;
  font-family: var(--font-editorial);
}
.ProseMirror ul, .ProseMirror ol { padding-left: 1.5em; margin: 0.5em 0; }
.ProseMirror strong { color: var(--color-text-primary); font-weight: 600; }
.ProseMirror em { font-style: italic; }
```

- [ ] **Mettre à jour layout.tsx**

```tsx
// src/app/layout.tsx
import type { Metadata } from 'next'
import { Instrument_Serif } from 'next/font/google'
import '@/styles/globals.css'

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-editorial',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'BASILEIA',
  description: 'Un territoire intérieur que le Citoyen cartographie lui-même.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={instrumentSerif.variable}>
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Vérifier le build**

```bash
npm run build 2>&1 | tail -20
```

Attendu : `✓ Compiled successfully`. Si erreur `Instrument_Serif not found` : vérifier le nom exact dans `next/font/google` — peut être `Instrument_Serif` ou `InstrumentSerif` selon la version de Next.

- [ ] **Commit**

```bash
git add src/styles/globals.css src/app/layout.tsx
git commit -m "style: fonts Instrument Serif + system sans — supprimer Lora + DM Mono"
```

---

## Task 3 : NavItem — supprimer border-left accent

**Files:**
- Modify: `src/features/nav/NavItem.tsx`

- [ ] **Réécrire NavItem.tsx**

```tsx
// src/features/nav/NavItem.tsx
'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItemProps {
  href:      string
  label:     string
  icon:      LucideIcon
  active?:   boolean
  expanded?: boolean
  children?: React.ReactNode
}

export function NavItem({ href, label, icon: Icon, active = false, expanded = false, children }: NavItemProps) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'relative flex items-center gap-2.5 h-9 px-3 rounded-[var(--radius-sm)] transition-colors duration-150 select-none',
        active
          ? 'bg-[var(--color-bg-active)] text-[var(--color-text-primary)]'
          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]'
      )}
    >
      <Icon size={expanded ? 16 : 18} strokeWidth={active ? 2 : 1.5} aria-hidden className="flex-shrink-0" />
      <AnimatePresence>
        {expanded && (
          <motion.span
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -5 }}
            transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.15 }}
            className={cn(
              'text-[12.5px] leading-none whitespace-nowrap',
              active ? 'font-[500]' : 'font-[400]'
            )}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
      {children}
    </Link>
  )
}
```

- [ ] **Vérifier le build**

```bash
npm run build 2>&1 | tail -20
```

- [ ] **Commit**

```bash
git add src/features/nav/NavItem.tsx
git commit -m "style: NavItem monochrome — supprimer border-left accent, états par opacité"
```

---

## Task 4 : Sidebar — logo monochrome + supprimer glass

**Files:**
- Modify: `src/features/nav/Sidebar.tsx`

- [ ] **Réécrire Sidebar.tsx**

```tsx
// src/features/nav/Sidebar.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Map, BookOpen, Sparkles, Scroll, Users, Bell, CircleUser, ChevronRight } from 'lucide-react'
import { useNavStore } from '@/lib/stores/nav.store'
import { NavItem } from './NavItem'
import { NotificationBadge } from './NotificationBadge'

const NAV_ITEMS = [
  { href: '/',              label: 'La Carte',        icon: Map },
  { href: '/journal',       label: 'Le Journal',      icon: BookOpen },
  { href: '/secrets',       label: 'Les Secrets',     icon: Sparkles },
  { href: '/bibliotheque',  label: 'La Bibliothèque', icon: Scroll },
  { href: '/alliances',     label: 'Alliances',       icon: Users },
  { href: '/notifications', label: 'Notifications',   icon: Bell, badge: true },
]

function isActive(href: string, pathname: string): boolean {
  if (href === '/') return pathname === '/'
  return pathname.startsWith(href)
}

export default function Sidebar() {
  const { isLocked, toggleLock } = useNavStore()
  const [isHovered, setIsHovered] = useState(false)
  const pathname = usePathname()
  const expanded = isLocked || isHovered

  useEffect(() => {
    if (window.innerWidth >= 1024) {
      useNavStore.setState({ isLocked: true })
    }
  }, [])

  return (
    <motion.nav
      animate={{ width: expanded ? 240 : 50 }}
      transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative flex flex-col h-full flex-shrink-0 overflow-hidden
                 bg-[var(--color-bg-base)] border-r border-[var(--color-border)]"
    >
      <Link
        href="/"
        className="flex items-center gap-2.5 h-[52px] px-[13px] flex-shrink-0
                   border-b border-[var(--color-border)]"
      >
        <div
          className="w-[28px] h-[28px] rounded-[var(--radius-sm)] border border-[var(--color-border-mid)]
                     bg-[var(--color-bg-surface)] flex items-center justify-center
                     font-[family-name:var(--font-editorial)] text-[13px] text-[var(--color-text-primary)]
                     flex-shrink-0"
        >
          B
        </div>
        <AnimatePresence>
          {expanded && (
            <motion.span
              initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }}
              transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.15 }}
              className="text-[11px] font-medium tracking-[0.08em] text-[var(--color-text-secondary)] whitespace-nowrap uppercase"
            >
              BASILEIA
            </motion.span>
          )}
        </AnimatePresence>
      </Link>

      <div className="flex-1 flex flex-col gap-px px-2 py-2.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon, badge }) => (
          <NavItem key={href} href={href} label={label} icon={icon}
                   active={isActive(href, pathname)} expanded={expanded}>
            {badge && <NotificationBadge />}
          </NavItem>
        ))}
      </div>

      <div className="px-2 pt-2 pb-2 border-t border-[var(--color-border)] flex-shrink-0">
        <NavItem href="/profil" label="Profil" icon={CircleUser}
                 active={isActive('/profil', pathname)} expanded={expanded} />
      </div>

      <motion.button
        onClick={toggleLock}
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered || isLocked ? 1 : 0 }}
        transition={{ duration: 0.15 }}
        className="absolute top-[58px] right-0 translate-x-1/2
                   w-4 h-4 rounded-full
                   bg-[var(--color-bg-elevated)] border border-[var(--color-border)]
                   flex items-center justify-center
                   text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]
                   transition-colors z-20 cursor-pointer"
        aria-label={isLocked ? 'Déverrouiller la sidebar' : 'Verrouiller la sidebar'}
      >
        <motion.span animate={{ rotate: isLocked ? 180 : 0 }} transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.2 }} className="flex">
          <ChevronRight size={9} strokeWidth={2.5} />
        </motion.span>
      </motion.button>
    </motion.nav>
  )
}
```

- [ ] **Vérifier le build**

```bash
npm run build 2>&1 | tail -20
```

- [ ] **Commit**

```bash
git add src/features/nav/Sidebar.tsx
git commit -m "style: Sidebar monochrome — logo neutre, supprimer glass-sidebar-bg"
```

---

## Task 5 : BottomNav — monochrome

**Files:**
- Modify: `src/features/nav/BottomNav.tsx`

- [ ] **Réécrire BottomNav.tsx**

```tsx
// src/features/nav/BottomNav.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Map, BookOpen, Sparkles, Users, CircleUser } from 'lucide-react'
import { useNavStore } from '@/lib/stores/nav.store'
import { cn } from '@/lib/utils'

const ITEMS = [
  { href: '/',          label: 'Carte',     icon: Map },
  { href: '/journal',   label: 'Journal',   icon: BookOpen },
  { href: '/secrets',   label: 'Secrets',   icon: Sparkles },
  { href: '/alliances', label: 'Alliances', icon: Users, badge: true },
  { href: '/profil',    label: 'Profil',    icon: CircleUser },
]

function isActive(href: string, pathname: string): boolean {
  if (href === '/alliances') return pathname.startsWith('/alliances') || pathname.startsWith('/notifications')
  if (href === '/') return pathname === '/'
  return pathname.startsWith(href)
}

export default function BottomNav() {
  const pathname    = usePathname()
  const unreadCount = useNavStore((s) => s.unreadCount)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[var(--z-bottomnav)]
                    h-[var(--bottom-nav-height)] pb-[env(safe-area-inset-bottom,0px)]
                    flex items-stretch
                    bg-[rgba(10,10,10,0.92)] backdrop-blur-[24px]
                    border-t border-[var(--color-border)] md:hidden">
      {ITEMS.map(({ href, label, icon: Icon, badge }) => {
        const active    = isActive(href, pathname)
        const showBadge = badge && unreadCount > 0
        return (
          <Link key={href} href={href} aria-current={active ? 'page' : undefined}
                className="relative flex-1 flex flex-col items-center justify-center gap-1 pt-1">
            <div className="relative">
              <Icon
                size={22}
                strokeWidth={active ? 2 : 1.5}
                aria-hidden
                className={cn(
                  'transition-colors duration-150',
                  active ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)]'
                )}
              />
              <AnimatePresence>
                {showBadge && (
                  <motion.span
                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    className="absolute -top-0.5 -right-0.5 w-[5px] h-[5px] rounded-full bg-[var(--color-text-primary)]"
                  />
                )}
              </AnimatePresence>
            </div>
            <motion.span
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: active ? 1 : 0, y: active ? 0 : 3 }}
              transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.15 }}
              className={cn(
                'text-[9px] leading-none',
                active ? 'text-[var(--color-text-primary)] font-[500]' : 'text-[var(--color-text-muted)]'
              )}
            >
              {label}
            </motion.span>
          </Link>
        )
      })}
    </nav>
  )
}
```

- [ ] **Vérifier le build**

```bash
npm run build 2>&1 | tail -20
```

- [ ] **Commit**

```bash
git add src/features/nav/BottomNav.tsx
git commit -m "style: BottomNav monochrome — bg noir, icônes/labels blanc opacité variable"
```

---

## Task 6 : BentoCard — Instrument Serif + monochrome

**Files:**
- Modify: `src/components/bento/BentoCard.tsx`

- [ ] **Réécrire BentoCard.tsx**

```tsx
// src/components/bento/BentoCard.tsx
import { cn } from '@/lib/utils'

interface BentoCardProps {
  label?: string
  wide?: boolean
  accent?: boolean
  className?: string
  onClick?: () => void
  children: React.ReactNode
}

export function BentoCard({ label, wide, accent, className, onClick, children }: BentoCardProps) {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick() : undefined}
      className={cn(
        'rounded-[var(--bento-radius)] border p-[12px_14px] flex flex-col gap-1.5 transition-colors duration-150',
        wide && 'col-span-2',
        accent
          ? 'bg-[rgba(255,255,255,0.04)] border-[var(--color-border-mid)]'
          : 'bg-[var(--color-bg-surface)] border-[var(--color-border)]',
        onClick && 'cursor-pointer hover:border-[var(--color-border-mid)] hover:bg-[var(--color-bg-elevated)]',
        className
      )}
    >
      {label && (
        <p className="text-[8.5px] font-medium tracking-[.12em] uppercase text-[var(--color-text-muted)] mb-0.5">
          {label}
        </p>
      )}
      {children}
    </div>
  )
}

export function BentoVal({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn(
      'font-[family-name:var(--font-editorial)] text-[26px] font-[400] text-[var(--color-text-primary)] leading-none tracking-[-0.02em]',
      className
    )}>
      {children}
    </span>
  )
}

export function BentoSub({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] text-[var(--color-text-muted)]">
      {children}
    </span>
  )
}
```

- [ ] **Vérifier le build**

```bash
npm run build 2>&1 | tail -20
```

- [ ] **Commit**

```bash
git add src/components/bento/BentoCard.tsx
git commit -m "style: BentoCard monochrome — BentoVal Instrument Serif, supprimer accent-bg"
```

---

## Task 7 : FeedEntry — supprimer accent, Instrument Serif

**Files:**
- Modify: `src/components/layout/FeedEntry.tsx`

- [ ] **Réécrire FeedEntry.tsx**

```tsx
// src/components/layout/FeedEntry.tsx
import { cn } from '@/lib/utils'

interface FeedEntryProps {
  title?: string
  verse?: string
  excerpt?: string
  reference?: string
  domain?: string
  date?: string
  tag?: string
  tagAccent?: boolean
  onClick?: () => void
  className?: string
}

export function FeedEntry({
  title, verse, excerpt, reference, domain, date, tag, tagAccent, onClick, className,
}: FeedEntryProps) {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick() : undefined}
      className={cn(
        'flex items-start gap-3.5 py-[13px] px-[18px] border-b border-[var(--color-border)] last:border-b-0 transition-colors duration-150 hover:bg-[var(--color-bg-hover)]',
        onClick && 'cursor-pointer',
        className
      )}
    >
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        {title && (
          <p className="font-[family-name:var(--font-editorial)] italic text-[15px] text-[var(--color-text-secondary)] leading-[1.3]">
            {title}
          </p>
        )}
        {verse && (
          <p className="font-[family-name:var(--font-editorial)] italic text-[13px] text-[var(--color-text-secondary)] leading-[1.8]">
            {verse}
          </p>
        )}
        {excerpt && (
          <p className="text-[11px] text-[var(--color-text-secondary)] leading-[1.6] line-clamp-2">
            {excerpt}
          </p>
        )}
        <div className="flex items-center gap-2 mt-[4px] flex-wrap">
          {tag && (
            <span className={cn(
              'text-[8px] font-medium tracking-[.06em] uppercase px-[7px] py-[2px] rounded-[var(--radius-xs)] border',
              tagAccent
                ? 'border-[var(--color-border-mid)] bg-[rgba(255,255,255,0.05)] text-[var(--color-text-primary)]'
                : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
            )}>
              {tag}
            </span>
          )}
          {reference && (
            <span className="text-[9px] text-[var(--color-text-muted)] tracking-[.04em]">
              {reference}
            </span>
          )}
          {domain && (
            <span className="text-[8px] tracking-[.08em] uppercase text-[var(--color-text-muted)]">
              {domain}
            </span>
          )}
          {date && (
            <span className="text-[8px] text-[var(--color-text-muted)] ml-auto">
              {date}
            </span>
          )}
        </div>
      </div>
      {onClick && (
        <span aria-hidden="true" className="text-[12px] text-[var(--color-text-muted)] opacity-40 mt-[3px] flex-shrink-0">›</span>
      )}
    </div>
  )
}

export function FeedHeader({
  title, action, onAction,
}: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex items-center justify-between py-[10px] px-[18px] border-b border-[var(--color-border)] bg-[rgba(255,255,255,0.01)]">
      <p className="text-[9px] font-medium tracking-[.14em] uppercase text-[var(--color-text-muted)]">
        {title}
      </p>
      {action && (
        <button
          type="button"
          onClick={onAction}
          className="text-[9px] text-[var(--color-text-muted)] tracking-[.06em] hover:text-[var(--color-text-secondary)] transition-colors"
        >
          {action} →
        </button>
      )}
    </div>
  )
}
```

- [ ] **Vérifier le build**

```bash
npm run build 2>&1 | tail -20
```

- [ ] **Commit**

```bash
git add src/components/layout/FeedEntry.tsx
git commit -m "style: FeedEntry monochrome — Instrument Serif italic, supprimer accent"
```

---

## Task 8 : MetricBlock — Instrument Serif, supprimer prop amber

**Files:**
- Modify: `src/features/profil/stats/MetricBlock.tsx`

- [ ] **Réécrire MetricBlock.tsx**

```tsx
// src/features/profil/stats/MetricBlock.tsx
import { cn } from '@/lib/utils'

interface MetricBlockProps {
  value: string | number
  label: string
  highlight?: boolean
  small?: boolean
}

export function MetricBlock({ value, label, highlight = false, small = false }: MetricBlockProps) {
  return (
    <div
      className="rounded-[var(--radius-md)] border border-[var(--color-border)]"
      style={{ background: 'var(--color-bg-surface)', padding: '12px 14px' }}
    >
      <p
        className={cn(
          'font-[family-name:var(--font-editorial)] font-[400] leading-none tracking-[-0.02em]',
          small ? 'text-[18px]' : 'text-[26px]',
          highlight ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'
        )}
      >
        {value}
      </p>
      <p
        className="mt-2 leading-tight text-[9px] font-medium tracking-[.1em] uppercase"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {label}
      </p>
    </div>
  )
}
```

- [ ] **Chercher les usages de la prop `amber` et les remplacer**

```bash
grep -rn 'amber=' /home/obeds/Dev/perso/citoyen-du-royaume/src --include="*.tsx" | grep -v node_modules
```

Pour chaque fichier trouvé, remplacer `amber={true}` ou `amber` par `highlight={true}` ou `highlight`.

- [ ] **Vérifier le build**

```bash
npm run build 2>&1 | tail -20
```

- [ ] **Commit**

```bash
git add src/features/profil/stats/MetricBlock.tsx
git commit -m "style: MetricBlock — Instrument Serif, prop amber→highlight, monochrome"
```

---

## Task 9 : La Carte — padding spacieux, H1 34px

**Files:**
- Modify: `src/app/(main)/page.tsx`

- [ ] **Mettre à jour le hero de CartePage**

Remplacer la section `{/* Hero */}` dans `src/app/(main)/page.tsx` :

```tsx
{/* Hero */}
<div className="flex-shrink-0 px-8 pt-8 pb-6 border-b border-[var(--color-border)]">
  <div className="flex items-start justify-between gap-6">
    <div>
      <p className="text-[9px] font-medium tracking-[.16em] uppercase text-[var(--color-text-muted)] mb-3">
        La Carte · Royaume
      </p>
      <h1 className="font-[family-name:var(--font-editorial)] text-[34px] font-[400] text-[var(--color-text-primary)] leading-[1.1] tracking-[-0.025em] mb-2">
        Ton Territoire
      </h1>
      <p className="text-[12px] text-[var(--color-text-secondary)] leading-[1.65] max-w-[400px]" style={{ textWrap: 'pretty' } as React.CSSProperties}>
        {domainesActifs} domaine{domainesActifs > 1 ? 's' : ''} exploré{domainesActifs > 1 ? 's' : ''} sur 7. Continue à approfondir ta compréhension du Royaume.
      </p>
    </div>
  </div>
</div>
```

- [ ] **Mettre à jour la section bento grid**

Remplacer `p-[16px_26px]` par `p-[6px_32px_0]` sur le div bento :

```tsx
<div
  className="flex-shrink-0 grid gap-[var(--bento-gap)] p-[6px_32px_0] border-b border-[var(--color-border)]"
  style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}
>
```

- [ ] **Mettre à jour le feed**

Remplacer `px-[26px]` par `px-8` sur la section feed, et envelopper les FeedEntry dans un container bordé :

```tsx
{/* Feed — domaines restants */}
<div className="flex-1 overflow-y-auto px-8 pb-6 pt-4">
  <div className="border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden">
    <FeedHeader title="Domaines restants" />
    {DOMAIN_META.slice(4).map((meta) => {
      const s = domainStats[meta.id]
      return (
        <Link key={meta.id} href={`/domaines/${meta.id}`} className="block">
          <FeedEntry
            title={meta.label}
            excerpt={
              s
                ? `Niveau ${s.level} · ${s.notes + s.secrets} entrées`
                : 'Inexploré — commence par ancrer un verset'
            }
            tag={s && s.level > 0 ? `Niv. ${s.level}` : 'Inexploré'}
            tagAccent={!!s && s.level > 0}
          />
        </Link>
      )
    })}
  </div>
</div>
```

- [ ] **Retirer les stats dans le hero** (les stats sont déjà dans le bento, le hero est plus épuré)

Dans la section Hero, supprimer le bloc `<div className="flex gap-2 flex-shrink-0">` avec les 3 chips de stats.

- [ ] **Vérifier le build**

```bash
npm run build 2>&1 | tail -20
```

- [ ] **Commit**

```bash
git add src/app/(main)/page.tsx
git commit -m "style: La Carte — hero spacieux H1 34px, feed dans container bordé"
```

---

## Task 10 : NotificationBadge — monochrome

**Files:**
- Modify: `src/features/nav/NotificationBadge.tsx`

- [ ] **Lire le fichier existant**

```bash
cat /home/obeds/Dev/perso/citoyen-du-royaume/src/features/nav/NotificationBadge.tsx
```

- [ ] **Remplacer toute référence à `--color-accent` par couleur monochrome**

Chercher et remplacer `var(--color-accent)` par `var(--color-text-primary)` dans ce fichier.  
Le dot de notification devient blanc opaque au lieu d'ambre.

- [ ] **Vérifier le build**

```bash
npm run build 2>&1 | tail -20
```

- [ ] **Commit**

```bash
git add src/features/nav/NotificationBadge.tsx
git commit -m "style: NotificationBadge — dot blanc, supprimer accent ambre/saphir"
```

---

## Task 11 : Scan global — supprimer tous les tokens obsolètes

**Files:**
- Modify: tous les fichiers `.tsx` qui référencent encore d'anciens tokens

- [ ] **Rechercher les tokens obsolètes restants**

```bash
grep -rn 'color-accent\|glass-\|color-amber\|amber-400\|amber-bg\|accent-bg\|accent-border\|text-accent' \
  /home/obeds/Dev/perso/citoyen-du-royaume/src --include="*.tsx" --include="*.css" | grep -v node_modules
```

- [ ] **Pour chaque occurrence trouvée :**

| Token obsolète | Remplacer par |
|----------------|--------------|
| `var(--color-accent)` | `var(--color-text-primary)` |
| `var(--color-accent-bg)` | `rgba(255,255,255,0.04)` |
| `var(--color-accent-border)` | `var(--color-border-mid)` |
| `var(--color-text-accent)` | `var(--color-text-primary)` |
| `var(--glass-*)` | `var(--color-bg-surface)` ou supprimer |
| `var(--color-amber-*)` | supprimer ou `var(--color-text-muted)` |

- [ ] **Vérifier le build**

```bash
npm run build 2>&1 | tail -20
```

Attendu : zéro erreur TypeScript. Les warnings CSS de tokens inconnus disparaissent.

- [ ] **Commit**

```bash
git add -p
git commit -m "style: supprimer tous les tokens obsolètes — accent, glass, amber"
```

---

## Task 12 : MAJ style-guide.md

**Files:**
- Modify: `docs/style-guide.md`

- [ ] **Réécrire style-guide.md**

Remplacer le contenu complet par la version Noir Éditorial. Sections à mettre à jour :

**Section 1 — Couleurs :** remplacer la palette ambre et les surfaces charbon chaud par les tokens monochrome de Task 1.

**Section 2 — Typographie :** remplacer Cormorant Garamond / DM Sans / JetBrains Mono par Instrument Serif / System sans. Mettre à jour l'échelle de taille (titres 34/28/20px, versets 16px italic).

**Section 3 — Espacement :** ajouter padding 32px pour les pages.

**Section 4 — Radius :** mettre à jour avec les nouvelles valeurs (xs 3, sm 5, md 6, lg 8, xl 10).

**Section 6 — Composants :** mettre à jour NavItem (plus de border-left), BentoCard (couleurs monochrome), FeedEntry (Instrument Serif, container bordé), MetricBlock (prop highlight).

**Section 7 — Icônes :** inchangé.

**Section 10 — Ce qu'on ne fait JAMAIS :** ajouter `❌ Toute couleur d'accent (ni saphir, ni ambre, ni indigo)` et `❌ Border-left colorée sur nav items actifs`.

- [ ] **Commit**

```bash
git add docs/style-guide.md
git commit -m "docs: style-guide Noir Éditorial — monochrome, Instrument Serif, tokens mis à jour"
```

---

## Task 13 : Vérification visuelle finale

- [ ] **Démarrer le dev server**

```bash
npm run dev
```

- [ ] **Vérifier sur http://localhost:3000 :**

Checklist visuelle :
- [ ] Fond `#0a0a0a` sur toutes les pages (pas de teinte bleue résiduelle)
- [ ] Instrument Serif visible sur les titres H1 et les versets
- [ ] System sans sur l'UI (labels, corps, timestamps)
- [ ] NavItem actif : fond `rgba(255,255,255,0.06)`, pas de border-left colorée
- [ ] BottomNav : icônes blanches actives, grises inactives
- [ ] BentoVal en Instrument Serif 26px
- [ ] FeedEntry titres en Instrument Serif italic
- [ ] Aucune couleur saphir ni ambre visible nulle part

- [ ] **Tester responsive mobile (< 768px)**

DevTools → iPhone 14 Pro (390px) :
- [ ] BottomNav visible, hauteur 60px, fond quasi-noir
- [ ] Sidebar masquée
- [ ] Contenu non masqué par le BottomNav

- [ ] **Commit final si ajustements mineurs**

```bash
git add -p
git commit -m "style: ajustements visuels post-vérification Noir Éditorial"
```

---

## Résumé des commits attendus

```
style: tokens monochrome Noir Éditorial — zéro accent couleur
style: fonts Instrument Serif + system sans — supprimer Lora + DM Mono
style: NavItem monochrome — supprimer border-left accent, états par opacité
style: Sidebar monochrome — logo neutre, supprimer glass-sidebar-bg
style: BottomNav monochrome — bg noir, icônes/labels blanc opacité variable
style: BentoCard monochrome — BentoVal Instrument Serif, supprimer accent-bg
style: FeedEntry monochrome — Instrument Serif italic, supprimer accent
style: MetricBlock — Instrument Serif, prop amber→highlight, monochrome
style: La Carte — hero spacieux H1 34px, feed dans container bordé
style: NotificationBadge — dot blanc, supprimer accent ambre/saphir
style: supprimer tous les tokens obsolètes — accent, glass, amber
docs: style-guide Noir Éditorial — monochrome, Instrument Serif, tokens mis à jour
```
