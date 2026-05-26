# Redesign Brume & Acier — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refonte complète du design system BASILEIA — palette Brume & Acier, accent Saphir (#6B9FD4), typographie Lora + DM Mono, layout Magazine + Bento sur toutes les pages.

**Architecture:** Chaque page suit le pattern Magazine+Bento (hero éditorial → bento grid → feed → capture bar). Les tokens CSS sont remplacés en premier (Task 1) car tout le reste en dépend. Les composants partagés (BentoCard, FeedEntry) sont créés en Task 3 avant les pages.

**Tech Stack:** Next.js 16 App Router · TypeScript strict · Tailwind CSS v4 · Framer Motion · next/font/google (Lora + DM_Mono)

---

## Fichiers touchés

| Fichier | Action |
|---------|--------|
| `src/styles/tokens.css` | Refonte complète |
| `src/styles/globals.css` | @theme fonts + ProseMirror |
| `src/app/layout.tsx` | Geist+Fraunces → Lora+DM_Mono |
| `src/components/bento/BentoCard.tsx` | Créer |
| `src/components/layout/FeedEntry.tsx` | Créer |
| `src/features/nav/Sidebar.tsx` | Couleurs saphir + logo B |
| `src/features/nav/BottomNav.tsx` | Couleurs saphir |
| `src/features/nav/NavItem.tsx` | Couleurs saphir |
| `src/features/nav/NotificationBadge.tsx` | Couleur saphir |
| `src/app/(main)/page.tsx` | Magazine+Bento (remplace HexMap) |
| `src/app/(main)/journal/page.tsx` | Magazine+Bento |
| `src/features/journal/JournalCard.tsx` | Nouveau style entry |
| `src/app/(main)/secrets/page.tsx` | Magazine+Bento |
| `src/features/secrets/SecretCard.tsx` | Nouveau style |
| `src/features/secrets/CaptureBar.tsx` | Nouveau style |
| `src/app/(main)/bibliotheque/page.tsx` | Magazine+Bento |
| `src/features/bibliotheque/VerseCard.tsx` | Nouveau style entry |
| `src/features/bibliotheque/VerseCaptureBar.tsx` | Nouveau style |
| `src/app/(main)/alliances/page.tsx` | Magazine+Bento |
| `src/features/carte/DomaineHeader.tsx` | Couleurs saphir |
| `src/features/carte/DomaineContent.tsx` | Tabs + layout |
| `src/app/(main)/domaines/[id]/page.tsx` | Hero bento |
| `src/app/(main)/profil/page.tsx` | Couleurs saphir |

---

## Task 1 — Design Tokens (tokens.css)

**Files:**
- Modify: `src/styles/tokens.css`

- [ ] **Remplacer intégralement le contenu de `src/styles/tokens.css`**

```css
:root {
  /* === Accent : Saphir (remplace ambre) === */
  --color-accent:        #6B9FD4;
  --color-accent-light:  #8BBAE0;
  --color-accent-dark:   #4A80B8;
  --color-accent-bg:     rgba(107,159,212,0.08);
  --color-accent-border: rgba(107,159,212,0.20);

  /* === Surfaces (ardoise froide) === */
  --color-bg-base:     #131517;
  --color-bg-surface:  #181c1f;
  --color-bg-elevated: #1d2226;
  --color-bg-hover:    rgba(180,195,210,0.04);
  --color-bg-active:   rgba(107,159,212,0.08);

  /* === Texte (bleuté froid) === */
  --color-text-primary:   rgba(205,218,228,0.93);
  --color-text-secondary: rgba(165,185,200,0.62);
  --color-text-muted:     rgba(140,165,185,0.36);
  --color-text-disabled:  rgba(140,165,185,0.18);
  --color-text-accent:    #6B9FD4;

  /* === Bordures === */
  --color-border:        rgba(180,195,210,0.08);
  --color-border-mid:    rgba(180,195,210,0.13);
  --color-border-subtle: rgba(180,195,210,0.05);

  /* === Fonts (remplacées par next/font dans layout.tsx) === */
  --font-sans:      'DM Mono', monospace;
  --font-editorial: 'Lora', Georgia, serif;

  /* === Ombres === */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.5);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,0.4);

  /* === Easing === */
  --ease-fast: cubic-bezier(0.16,1,0.3,1);

  /* === Layout === */
  --bento-gap:    8px;
  --bento-radius: 8px;

  --sidebar-collapsed-width: 50px;
  --sidebar-expanded-width:  220px;
  --bottom-nav-height:       64px;

  /* === Radius === */
  --radius-xs: 3px;
  --radius-sm: 5px;
  --radius-md: 7px;
  --radius-lg: 8px;
  --radius-xl: 12px;

  /* === Z-index === */
  --z-sidebar:   10;
  --z-bottomnav: 50;
  --z-modal:     60;
}

[data-theme="light"] {
  --color-bg-base:     #f0f2f5;
  --color-bg-surface:  #ffffff;
  --color-bg-elevated: #ffffff;
  --color-text-primary:   rgba(20,30,40,0.90);
  --color-text-secondary: rgba(20,30,40,0.55);
  --color-text-muted:     rgba(20,30,40,0.35);
  --color-border:        rgba(0,0,0,0.09);
  --color-border-subtle: rgba(0,0,0,0.05);
}
```

- [ ] **Lancer le dev server et vérifier visuellement**

```bash
cd ~/Dev/perso/citoyen-du-royaume && pnpm dev
```

Le fond doit être `#131517` (ardoise sombre froide). Tous les textes doivent apparaître en bleuté froid, plus aucune teinte chaude/ambre.

- [ ] **Commit**

```bash
git add src/styles/tokens.css
git commit -m "feat(design): tokens Brume & Acier — palette saphir remplace ambre"
```

---

## Task 2 — Typographie (layout.tsx + globals.css)

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/styles/globals.css`

- [ ] **Remplacer les imports de fonts dans `src/app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import { Lora, DM_Mono } from 'next/font/google'
import '@/styles/globals.css'

const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-editorial',
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'BASILEIA',
  description: 'Un territoire intérieur que le Citoyen cartographie lui-même.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${lora.variable} ${dmMono.variable}`}>
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Mettre à jour le bloc `@theme` dans `src/styles/globals.css`**

Remplacer uniquement le bloc `@theme` (lignes 4-7 actuelles) :

```css
@theme {
  --font-family-sans:      'DM Mono', monospace;
  --font-family-editorial: 'Lora', Georgia, serif;
}
```

Mettre à jour aussi ProseMirror (éditeur Journal) — changer `font-size: 16px` → `14px` et garder `font-family: var(--font-editorial)` :

```css
.ProseMirror {
  outline: none;
  color: var(--color-text-primary);
  font-family: var(--font-editorial);
  font-style: italic;
  font-size: 14px;
  line-height: 1.85;
  min-height: 200px;
}
```

- [ ] **Vérifier dans le browser**

L'interface entière doit être en DM Mono (police monospace, chiffres uniformes). Les versets doivent être en Lora italic.

- [ ] **Commit**

```bash
git add src/app/layout.tsx src/styles/globals.css
git commit -m "feat(design): typographie Lora + DM Mono remplace Geist + Fraunces"
```

---

## Task 3 — Composants partagés (BentoCard + FeedEntry)

**Files:**
- Create: `src/components/bento/BentoCard.tsx`
- Create: `src/components/layout/FeedEntry.tsx`

Ces deux composants sont utilisés par toutes les pages. Les créer avant d'attaquer les pages.

- [ ] **Créer `src/components/bento/BentoCard.tsx`**

```tsx
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
      className={cn(
        'rounded-[var(--bento-radius)] border p-[12px_14px] flex flex-col gap-1.5 transition-colors duration-150',
        wide && 'col-span-2',
        accent
          ? 'bg-[var(--color-accent-bg)] border-[var(--color-accent-border)]'
          : 'bg-[var(--color-bg-surface)] border-[var(--color-border)]',
        onClick && 'cursor-pointer hover:border-[var(--color-border-mid)] hover:bg-[var(--color-bg-elevated)]',
        className
      )}
    >
      {label && (
        <p className="text-[8px] font-medium tracking-[.10em] uppercase text-[var(--color-text-muted)] mb-1">
          {label}
        </p>
      )}
      {children}
    </div>
  )
}

export function BentoVal({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('text-[20px] font-normal text-[var(--color-accent)] leading-none', className)}>
      {children}
    </span>
  )
}

export function BentoSub({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[9px] text-[var(--color-text-muted)]">
      {children}
    </span>
  )
}
```

- [ ] **Créer `src/components/layout/FeedEntry.tsx`**

```tsx
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
  title,
  verse,
  excerpt,
  reference,
  domain,
  date,
  tag,
  tagAccent,
  onClick,
  className,
}: FeedEntryProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-start gap-3.5 py-[13px] border-b border-[var(--color-border-subtle)] transition-opacity duration-150',
        onClick && 'cursor-pointer hover:opacity-80',
        className
      )}
    >
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        {title && (
          <p className="font-[family-name:var(--font-editorial)] text-[14px] font-[500] text-[var(--color-text-primary)] leading-[1.3]">
            {title}
          </p>
        )}
        {verse && (
          <p className="font-[family-name:var(--font-editorial)] italic text-[13px] text-[var(--color-text-secondary)] leading-[1.65]">
            {verse}
          </p>
        )}
        {excerpt && (
          <p className="text-[10px] text-[var(--color-text-secondary)] leading-[1.6] line-clamp-2">
            {excerpt}
          </p>
        )}
        <div className="flex items-center gap-2 mt-[5px] flex-wrap">
          {tag && (
            <span className={cn(
              'text-[8px] font-medium tracking-[.06em] uppercase px-[7px] py-[2px] rounded-[3px] border',
              tagAccent
                ? 'border-[var(--color-accent-border)] bg-[var(--color-accent-bg)] text-[var(--color-accent)]'
                : 'border-[var(--color-border-mid)] text-[var(--color-text-muted)]'
            )}>
              {tag}
            </span>
          )}
          {reference && (
            <span className="text-[9px] text-[var(--color-accent)] opacity-65 tracking-[.04em]">
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
        <span className="text-[12px] text-[var(--color-text-muted)] opacity-50 mt-[3px] flex-shrink-0">›</span>
      )}
    </div>
  )
}

export function FeedHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex items-center justify-between py-[14px]">
      <p className="text-[9px] font-medium tracking-[.12em] uppercase text-[var(--color-text-muted)]">{title}</p>
      {action && (
        <button onClick={onAction} className="text-[9px] text-[var(--color-accent)] opacity-60 tracking-[.06em] hover:opacity-100 transition-opacity">
          {action} →
        </button>
      )}
    </div>
  )
}
```

- [ ] **Commit**

```bash
git add src/components/
git commit -m "feat(design): composants partagés BentoCard + FeedEntry"
```

---

## Task 4 — Navigation (Sidebar + BottomNav + NavItem)

**Files:**
- Modify: `src/features/nav/Sidebar.tsx`
- Modify: `src/features/nav/BottomNav.tsx`
- Modify: `src/features/nav/NavItem.tsx`
- Modify: `src/features/nav/NotificationBadge.tsx`

Lire chaque fichier avant de le modifier.

- [ ] **Lire les 4 fichiers**

```bash
cat src/features/nav/Sidebar.tsx
cat src/features/nav/BottomNav.tsx
cat src/features/nav/NavItem.tsx
cat src/features/nav/NotificationBadge.tsx
```

- [ ] **Modifier `src/features/nav/NavItem.tsx`**

Remplacer toutes les références de couleur ambre par saphir. Règles :
- `--color-amber-400` → `--color-accent`
- `--color-amber-bg` → `--color-accent-bg`
- `--color-amber-border` → `--color-accent-border`
- État actif : border-left reste, couleur devient `var(--color-accent)`
- `rounded-[var(--radius-md)]` → `rounded-[var(--radius-md)]` (7px, inchangé)

- [ ] **Modifier `src/features/nav/Sidebar.tsx`**

Changer le logo mark (carré "B") :
```tsx
// Remplacer le bloc logo existant par :
<div className="w-[30px] h-[30px] rounded-[6px] border border-[var(--color-accent-border)] bg-[var(--color-accent-bg)] flex items-center justify-center font-[family-name:var(--font-editorial)] text-[14px] font-[500] text-[var(--color-accent)]">
  B
</div>
```

Remplacer toutes les couleurs ambre par saphir (même pattern que NavItem).

- [ ] **Modifier `src/features/nav/BottomNav.tsx`**

Remplacer toutes les couleurs ambre par saphir. L'item actif passe de `text-amber-400` à `text-[var(--color-accent)]`.

- [ ] **Modifier `src/features/nav/NotificationBadge.tsx`**

```tsx
// Le dot pulsant : amber-400 → accent
// Avant : bg-[var(--color-amber-400)]
// Après :
<div className="... bg-[var(--color-accent)]" />
// Ring : même remplacement
```

- [ ] **Vérifier dans le browser**

Sidebar : logo "B" saphir, items actifs en bleu saphir, aucune teinte ambre visible.

- [ ] **Commit**

```bash
git add src/features/nav/
git commit -m "feat(design): navigation — couleurs ambre → saphir"
```

---

## Task 5 — La Carte (accueil) — Magazine + Bento

**Files:**
- Modify: `src/app/(main)/page.tsx`

La HexMap interactive est **remplacée** par le layout Magazine+Bento. La navigation vers `/domaines/[id]` se fait désormais via les bento cards. `fetchDomainStats()` est conservée et adaptée.

- [ ] **Lire le fichier actuel**

```bash
cat src/app/(main)/page.tsx
cat src/features/carte/domain-constants.ts
```

- [ ] **Réécrire `src/app/(main)/page.tsx`**

```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { type DomainId, DOMAIN_META } from '@/features/carte/domain-constants'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { BentoCard, BentoVal, BentoSub } from '@/components/bento/BentoCard'
import { FeedEntry, FeedHeader } from '@/components/layout/FeedEntry'

export const metadata: Metadata = { title: 'La Carte — BASILEIA' }

type DomainStats = { notes: number; secrets: number; verses: number; level: number }

function computeLevel(total: number): number {
  if (total >= 21) return 5
  if (total >= 11) return 4
  if (total >= 6)  return 3
  if (total >= 3)  return 2
  if (total >= 1)  return 1
  return 0
}

async function fetchStats(): Promise<{
  domainStats: Partial<Record<DomainId, DomainStats>>
  totalNotes: number
  totalSecrets: number
  totalVerses: number
}> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { domainStats: {}, totalNotes: 0, totalSecrets: 0, totalVerses: 0 }

    const [notesRes, secretsRes, versesRes] = await Promise.all([
      supabase.from('notes').select('domain_id').eq('user_id', user.id),
      supabase.from('secrets').select('domain_id').eq('user_id', user.id),
      supabase.from('verses').select('domain_id').eq('user_id', user.id),
    ])

    const validIds = new Set<string>(DOMAIN_META.map((d) => d.id))
    const count = (rows: { domain_id: string | null }[] | null) => {
      const map: Partial<Record<DomainId, number>> = {}
      rows?.forEach(({ domain_id }) => {
        if (domain_id && validIds.has(domain_id)) {
          const id = domain_id as DomainId
          map[id] = (map[id] ?? 0) + 1
        }
      })
      return map
    }

    const noteCounts   = count(notesRes.data)
    const secretCounts = count(secretsRes.data)
    const verseCounts  = count(versesRes.data)
    const allIds = new Set<DomainId>([
      ...Object.keys(noteCounts) as DomainId[],
      ...Object.keys(secretCounts) as DomainId[],
      ...Object.keys(verseCounts) as DomainId[],
    ])

    const domainStats: Partial<Record<DomainId, DomainStats>> = {}
    for (const id of allIds) {
      const notes   = noteCounts[id]   ?? 0
      const secrets = secretCounts[id] ?? 0
      const verses  = verseCounts[id]  ?? 0
      domainStats[id] = { notes, secrets, verses, level: computeLevel(notes + secrets + verses) }
    }

    return {
      domainStats,
      totalNotes:   notesRes.data?.length   ?? 0,
      totalSecrets: secretsRes.data?.length ?? 0,
      totalVerses:  versesRes.data?.length  ?? 0,
    }
  } catch {
    return { domainStats: {}, totalNotes: 0, totalSecrets: 0, totalVerses: 0 }
  }
}

export default async function CartePage() {
  const { domainStats, totalNotes, totalSecrets, totalVerses } = await fetchStats()

  const totalItems = totalNotes + totalSecrets + totalVerses
  const domainesActifs = Object.values(domainStats).filter((s) => s && s.level > 0).length

  const topDomain = DOMAIN_META.reduce<{ meta: typeof DOMAIN_META[0]; stats: DomainStats } | null>(
    (best, meta) => {
      const s = domainStats[meta.id]
      if (!s) return best
      const total = s.notes + s.secrets + s.verses
      if (!best) return { meta, stats: s }
      const bestTotal = best.stats.notes + best.stats.secrets + best.stats.verses
      return total > bestTotal ? { meta, stats: s } : best
    },
    null
  )

  return (
    <div className="flex flex-col h-full">
      {/* Hero */}
      <div className="flex-shrink-0 px-[26px] pt-[22px] pb-[20px] border-b border-[var(--color-border)]">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-[9px] font-medium tracking-[.14em] uppercase text-[var(--color-accent)] opacity-65 mb-2">
              La Carte
            </p>
            <h1 className="font-[family-name:var(--font-editorial)] text-[22px] font-[500] text-[var(--color-text-primary)] leading-[1.25] tracking-[-0.01em]">
              Ton Territoire
            </h1>
            <p className="font-[family-name:var(--font-editorial)] italic text-[14px] text-[var(--color-text-secondary)] leading-[1.8] mt-1 max-w-[400px]">
              {domainesActifs} domaine{domainesActifs > 1 ? 's' : ''} exploré{domainesActifs > 1 ? 's' : ''} sur 7. Continue à approfondir ta compréhension du Royaume.
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {[
              { val: totalVerses,  lbl: 'Versets' },
              { val: totalNotes,   lbl: 'Notes' },
              { val: `${domainesActifs}/7`, lbl: 'Domaines' },
            ].map(({ val, lbl }) => (
              <div key={lbl} className="flex flex-col items-end px-3 py-2 rounded-[7px] bg-[var(--color-bg-surface)] border border-[var(--color-border)] min-w-[60px]">
                <span className="text-[18px] font-normal text-[var(--color-accent)] leading-none">{val}</span>
                <span className="text-[8px] font-medium tracking-[.08em] uppercase text-[var(--color-text-muted)] mt-1">{lbl}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bento grid */}
      <div
        className="flex-shrink-0 grid gap-[var(--bento-gap)] p-[16px_26px] border-b border-[var(--color-border)]"
        style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}
      >
        {/* Wide accent : domaine le plus actif */}
        {topDomain ? (
          <Link href={`/domaines/${topDomain.meta.id}`}>
            <BentoCard label="Domaine le plus actif" wide accent>
              <p className="font-[family-name:var(--font-editorial)] text-[16px] font-[500] text-[var(--color-text-primary)]">
                {topDomain.meta.label}
              </p>
              <p className="text-[9px] text-[var(--color-text-muted)]">
                {topDomain.stats.notes} notes · {topDomain.stats.secrets} secrets · niveau {topDomain.stats.level}
              </p>
            </BentoCard>
          </Link>
        ) : (
          <BentoCard label="Domaine le plus actif" wide accent>
            <p className="text-[12px] text-[var(--color-text-muted)] italic font-[family-name:var(--font-editorial)]">
              Aucun domaine exploré encore.
            </p>
          </BentoCard>
        )}

        {/* Stat cards domaines */}
        {DOMAIN_META.slice(0, 4).map((meta) => {
          const s = domainStats[meta.id]
          return (
            <Link key={meta.id} href={`/domaines/${meta.id}`}>
              <BentoCard label={meta.label}>
                <BentoVal>{s?.level ?? 0}<span className="text-[12px] text-[var(--color-text-muted)]">/5</span></BentoVal>
                <BentoSub>{s ? `${s.notes + s.secrets + s.verses} entrées` : 'Inexploré'}</BentoSub>
              </BentoCard>
            </Link>
          )
        })}

        {/* Stats totaux */}
        <BentoCard label="Entrées totales">
          <BentoVal>{totalItems}</BentoVal>
          <BentoSub>notes + secrets + versets</BentoSub>
        </BentoCard>
      </div>

      {/* Feed — activité récente (placeholder statique) */}
      <div className="flex-1 overflow-y-auto px-[26px] pb-5">
        <FeedHeader title="Domaines restants" />
        {DOMAIN_META.slice(4).map((meta) => {
          const s = domainStats[meta.id]
          return (
            <FeedEntry
              key={meta.id}
              title={meta.label}
              excerpt={s ? `Niveau ${s.level} · ${s.notes + s.secrets + s.verses} entrées` : 'Inexploré — commence par ancrer un verset'}
              tag={s ? `Niv. ${s.level}` : 'Inexploré'}
              tagAccent={!!s && s.level > 0}
              onClick={() => { window.location.href = `/domaines/${meta.id}` }}
            />
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Vérifier dans le browser**

La Carte doit afficher hero + bento + feed sans HexMap. Cliquer une bento card → navigue vers `/domaines/[id]`.

- [ ] **Commit**

```bash
git add src/app/(main)/page.tsx
git commit -m "feat(design): La Carte — layout Magazine+Bento remplace HexMap"
```

---

## Task 6 — Le Journal

**Files:**
- Modify: `src/app/(main)/journal/page.tsx`
- Modify: `src/features/journal/JournalCard.tsx`
- Modify: `src/features/journal/JournalList.tsx`

- [ ] **Lire les fichiers**

```bash
cat src/app/(main)/journal/page.tsx
cat src/features/journal/JournalCard.tsx
cat src/features/journal/JournalList.tsx
```

- [ ] **Mettre à jour `src/features/journal/JournalCard.tsx`**

Remplacer le rendu par le pattern FeedEntry. Adapter les props existantes :

```tsx
'use client'
import { useRouter } from 'next/navigation'
import { FeedEntry } from '@/components/layout/FeedEntry'
import type { Note } from './mock-notes'
import { relativeTime } from '@/lib/utils'

interface JournalCardProps {
  note: Note
}

export function JournalCard({ note }: JournalCardProps) {
  const router = useRouter()
  return (
    <FeedEntry
      title={note.title}
      excerpt={note.content?.slice(0, 140)}
      tag={note.domainId ?? undefined}
      tagAccent={!!note.domainId}
      date={relativeTime(note.createdAt)}
      onClick={() => router.push(`/journal/${note.id}`)}
    />
  )
}
```

- [ ] **Mettre à jour `src/app/(main)/journal/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { JournalList } from '@/features/journal/JournalList'
import { BentoCard, BentoVal, BentoSub } from '@/components/bento/BentoCard'

export const metadata: Metadata = { title: 'Journal — BASILEIA' }

export default function JournalPage() {
  return (
    <div className="flex flex-col h-full">
      {/* Hero */}
      <div className="flex-shrink-0 px-[26px] pt-[22px] pb-[20px] border-b border-[var(--color-border)]">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-[9px] font-medium tracking-[.14em] uppercase text-[var(--color-accent)] opacity-65 mb-2">
              Le Journal
            </p>
            <h1 className="font-[family-name:var(--font-editorial)] text-[22px] font-[500] text-[var(--color-text-primary)] leading-[1.25] tracking-[-0.01em]">
              Notes de méditation
            </h1>
          </div>
        </div>
      </div>

      {/* Bento */}
      <div
        className="flex-shrink-0 grid gap-[var(--bento-gap)] p-[16px_26px] border-b border-[var(--color-border)]"
        style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}
      >
        <BentoCard label="Dernière note" wide accent>
          <p className="font-[family-name:var(--font-editorial)] text-[13px] font-[500] text-[var(--color-text-primary)]">
            Commence à écrire pour voir ta dernière note ici
          </p>
        </BentoCard>
        <BentoCard label="Mots écrits">
          <BentoVal>—</BentoVal>
          <BentoSub>ce mois</BentoSub>
        </BentoCard>
      </div>

      {/* Feed — JournalList existant */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <JournalList />
      </div>
    </div>
  )
}
```

- [ ] **Vérifier dans le browser**

Le Journal affiche hero + bento vide + liste des notes avec le nouveau style FeedEntry.

- [ ] **Commit**

```bash
git add src/app/(main)/journal/page.tsx src/features/journal/JournalCard.tsx
git commit -m "feat(design): Journal — Magazine+Bento + JournalCard → FeedEntry"
```

---

## Task 7 — Les Secrets

**Files:**
- Modify: `src/app/(main)/secrets/page.tsx`
- Modify: `src/features/secrets/SecretCard.tsx`
- Modify: `src/features/secrets/CaptureBar.tsx`

- [ ] **Lire les fichiers**

```bash
cat src/app/(main)/secrets/page.tsx
cat src/features/secrets/SecretCard.tsx
cat src/features/secrets/CaptureBar.tsx
```

- [ ] **Mettre à jour `src/features/secrets/SecretCard.tsx`**

```tsx
'use client'
import { FeedEntry } from '@/components/layout/FeedEntry'
import type { Secret } from '@/lib/stores/secrets.store'
import { relativeTime } from '@/lib/utils'

interface SecretCardProps {
  secret: Secret
}

export function SecretCard({ secret }: SecretCardProps) {
  return (
    <FeedEntry
      verse={secret.text}
      tag={secret.domainId ?? undefined}
      tagAccent={!!secret.domainId}
      date={relativeTime(secret.createdAt)}
    />
  )
}
```

- [ ] **Mettre à jour `src/features/secrets/CaptureBar.tsx`** — nouveau style visuel

Lire le fichier entier, puis remplacer uniquement le rendu JSX. Conserver toute la logique (store, AI classify, focus ref). Changer le style de la barre de saisie :

```tsx
// Wrapper principal :
<div className="flex-shrink-0 p-[12px_26px] border-t border-[var(--color-border)] bg-[var(--color-bg-surface)]">
  <div className="flex items-center gap-2.5 bg-[var(--color-bg-base)] border border-[var(--color-border-mid)] rounded-[7px] px-3.5 py-[9px] focus-within:border-[var(--color-accent-border)] transition-colors">
    <input
      ref={inputRef}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder="Une fulgurance…"
      className="flex-1 bg-transparent outline-none font-[family-name:var(--font-editorial)] italic text-[13px] text-[var(--color-text-secondary)] placeholder:text-[var(--color-text-muted)]"
    />
    <button
      onClick={handleClassify}
      disabled={!text.trim() || isClassifying}
      className="text-[8px] font-medium tracking-[.08em] uppercase px-3 py-[5px] rounded-[5px] border border-[var(--color-accent-border)] bg-[var(--color-accent-bg)] text-[var(--color-accent)] disabled:opacity-40 transition-colors hover:bg-[rgba(107,159,212,0.14)]"
    >
      ◈ Domaine
    </button>
  </div>
</div>
```

- [ ] **Mettre à jour `src/app/(main)/secrets/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { SecretFeed } from '@/features/secrets/SecretFeed'
import { CaptureBar } from '@/features/secrets/CaptureBar'
import { BentoCard } from '@/components/bento/BentoCard'

export const metadata: Metadata = { title: 'Secrets — BASILEIA' }

export default function SecretsPage() {
  return (
    <div className="flex flex-col h-full">
      {/* Hero */}
      <div className="flex-shrink-0 px-[26px] pt-[22px] pb-[20px] border-b border-[var(--color-border)]">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-[9px] font-medium tracking-[.14em] uppercase text-[var(--color-accent)] opacity-65 mb-2">
              Les Secrets
            </p>
            <h1 className="font-[family-name:var(--font-editorial)] text-[22px] font-[500] text-[var(--color-text-primary)] leading-[1.25] tracking-[-0.01em]">
              Fulgurances
            </h1>
            <p className="font-[family-name:var(--font-editorial)] italic text-[14px] text-[var(--color-text-secondary)] leading-[1.8] mt-1">
              Intuitions soudaines. Capturées avant qu'elles ne s'évanouissent.
            </p>
          </div>
        </div>
      </div>

      {/* Bento */}
      <div
        className="flex-shrink-0 grid gap-[var(--bento-gap)] p-[16px_26px] border-b border-[var(--color-border)]"
        style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}
      >
        <BentoCard label="Dernier secret" wide accent>
          <p className="font-[family-name:var(--font-editorial)] italic text-[12px] text-[var(--color-text-secondary)] leading-[1.7]">
            Capture ta première fulgurance ci-dessous.
          </p>
        </BentoCard>
        <BentoCard label="Total">
          <span className="text-[20px] font-normal text-[var(--color-accent)] leading-none">—</span>
        </BentoCard>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <SecretFeed />
      </div>

      <CaptureBar />
    </div>
  )
}
```

- [ ] **Vérifier dans le browser**

Les Secrets : hero + bento + feed + barre de capture au nouveau style.

- [ ] **Commit**

```bash
git add src/app/(main)/secrets/page.tsx src/features/secrets/
git commit -m "feat(design): Secrets — Magazine+Bento + CaptureBar redesign"
```

---

## Task 8 — La Bibliothèque

**Files:**
- Modify: `src/app/(main)/bibliotheque/page.tsx`
- Modify: `src/features/bibliotheque/VerseCard.tsx`
- Modify: `src/features/bibliotheque/VerseCaptureBar.tsx` (ou `VerseFeed.tsx` selon structure)

- [ ] **Lire les fichiers**

```bash
cat src/app/(main)/bibliotheque/page.tsx
cat src/features/bibliotheque/VerseCard.tsx
cat src/features/bibliotheque/VerseFeed.tsx
cat src/features/bibliotheque/VerseCaptureBar.tsx 2>/dev/null || cat src/features/bibliotheque/VerseSearch.tsx
```

- [ ] **Mettre à jour `src/features/bibliotheque/VerseCard.tsx`**

Adapter pour utiliser FeedEntry. Conserver la logique de suppression existante :

```tsx
'use client'
import { FeedEntry } from '@/components/layout/FeedEntry'
import { relativeTime } from '@/lib/utils'
// Conserver les imports existants (store, types)

// Dans le render, remplacer par :
return (
  <FeedEntry
    verse={verse.text}
    reference={verse.reference}
    domain={verse.domainId ?? undefined}
    date={relativeTime(verse.createdAt)}
  />
)
```

- [ ] **Mettre à jour `src/app/(main)/bibliotheque/page.tsx`** avec le layout Magazine+Bento

```tsx
import type { Metadata } from 'next'
import { VerseFeed } from '@/features/bibliotheque/VerseFeed'
import { BentoCard, BentoVal, BentoSub } from '@/components/bento/BentoCard'
// Importer VerseCaptureBar si elle existe

export const metadata: Metadata = { title: 'Bibliothèque — BASILEIA' }

export default function BiblioPage() {
  return (
    <div className="flex flex-col h-full">
      {/* Hero */}
      <div className="flex-shrink-0 px-[26px] pt-[22px] pb-[20px] border-b border-[var(--color-border)]">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-[9px] font-medium tracking-[.14em] uppercase text-[var(--color-accent)] opacity-65 mb-2">
              La Bibliothèque
            </p>
            <h1 className="font-[family-name:var(--font-editorial)] text-[22px] font-[500] text-[var(--color-text-primary)] leading-[1.25] tracking-[-0.01em]">
              Versets ancrés
            </h1>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <div className="flex flex-col items-end px-3 py-2 rounded-[7px] bg-[var(--color-bg-surface)] border border-[var(--color-border)] min-w-[60px]">
              <span className="text-[18px] font-normal text-[var(--color-accent)] leading-none">—</span>
              <span className="text-[8px] font-medium tracking-[.08em] uppercase text-[var(--color-text-muted)] mt-1">Versets</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bento */}
      <div
        className="flex-shrink-0 grid gap-[var(--bento-gap)] p-[16px_26px] border-b border-[var(--color-border)]"
        style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}
      >
        <BentoCard label="Verset mis en avant" wide accent>
          <p className="font-[family-name:var(--font-editorial)] italic text-[13px] text-[var(--color-text-secondary)] leading-[1.75]">
            Ancre ton premier verset ci-dessous.
          </p>
        </BentoCard>
        <BentoCard label="Domaines couverts">
          <BentoVal>—</BentoVal>
          <BentoSub>sur 7</BentoSub>
        </BentoCard>
      </div>

      {/* Tabs filtres */}
      <div className="flex-shrink-0 flex px-[26px] border-b border-[var(--color-border)]">
        {['Tous', 'Le Roi', 'Le Territoire', 'Les Lois'].map((tab, i) => (
          <button
            key={tab}
            className={`text-[9px] font-medium tracking-[.10em] uppercase px-[14px] py-[11px] border-b-2 transition-colors ${
              i === 0
                ? 'text-[var(--color-accent)] border-[var(--color-accent)]'
                : 'text-[var(--color-text-muted)] border-transparent hover:text-[var(--color-text-secondary)]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <VerseFeed />
      </div>

      {/* Capture — adapter le composant existant au nouveau style (même pattern que CaptureBar) */}
    </div>
  )
}
```

- [ ] **Mettre à jour la capture bar de la Bibliothèque** (VerseCaptureBar ou équivalent)

Même pattern visuel que Secrets (Task 7), mais avec un champ référence en plus :

```tsx
// Wrapper :
<div className="flex-shrink-0 p-[12px_26px] border-t border-[var(--color-border)] bg-[var(--color-bg-surface)]">
  <div className="flex items-center gap-2.5 bg-[var(--color-bg-base)] border border-[var(--color-border-mid)] rounded-[7px] px-3.5 py-[9px] focus-within:border-[var(--color-accent-border)] transition-colors">
    <span className="text-[9px] text-[var(--color-text-muted)] whitespace-nowrap">Réf.</span>
    <div className="w-px h-[12px] bg-[var(--color-border-mid)]" />
    {/* input reference existant */}
    {/* input verset Lora italic */}
    <button className="text-[8px] font-medium tracking-[.10em] uppercase px-3 py-[5px] rounded-[5px] border border-[var(--color-accent-border)] bg-[var(--color-accent-bg)] text-[var(--color-accent)] disabled:opacity-40 hover:bg-[rgba(107,159,212,0.14)] transition-colors whitespace-nowrap">
      Ancrer
    </button>
  </div>
</div>
```

- [ ] **Vérifier dans le browser**

La Bibliothèque affiche hero + bento + tabs + feed des versets + capture bar.

- [ ] **Commit**

```bash
git add src/app/(main)/bibliotheque/page.tsx src/features/bibliotheque/
git commit -m "feat(design): Bibliothèque — Magazine+Bento + VerseCard redesign"
```

---

## Task 9 — Alliances

**Files:**
- Modify: `src/app/(main)/alliances/page.tsx`

- [ ] **Lire le fichier**

```bash
cat src/app/(main)/alliances/page.tsx
```

- [ ] **Réécrire avec le layout Magazine+Bento**

```tsx
import type { Metadata } from 'next'
import { BentoCard, BentoVal, BentoSub } from '@/components/bento/BentoCard'
import { FeedEntry, FeedHeader } from '@/components/layout/FeedEntry'
// Conserver les imports Supabase et composants existants (AllyCard etc.)

export const metadata: Metadata = { title: 'Alliances — BASILEIA' }

export default async function AlliancesPage() {
  // Conserver la logique de fetch existante

  return (
    <div className="flex flex-col h-full">
      {/* Hero */}
      <div className="flex-shrink-0 px-[26px] pt-[22px] pb-[20px] border-b border-[var(--color-border)]">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-[9px] font-medium tracking-[.14em] uppercase text-[var(--color-accent)] opacity-65 mb-2">
              Alliances
            </p>
            <h1 className="font-[family-name:var(--font-editorial)] text-[22px] font-[500] text-[var(--color-text-primary)] leading-[1.25] tracking-[-0.01em]">
              Tes Alliés
            </h1>
            <p className="font-[family-name:var(--font-editorial)] italic text-[14px] text-[var(--color-text-secondary)] leading-[1.8] mt-1">
              Citoyens du même Royaume. Partage de territoire et de progression.
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <div className="flex flex-col items-end px-3 py-2 rounded-[7px] bg-[var(--color-bg-surface)] border border-[var(--color-border)] min-w-[60px]">
              <span className="text-[18px] font-normal text-[var(--color-accent)] leading-none">—</span>
              <span className="text-[8px] font-medium tracking-[.08em] uppercase text-[var(--color-text-muted)] mt-1">Alliés</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bento — alliés récents */}
      <div
        className="flex-shrink-0 grid gap-[var(--bento-gap)] p-[16px_26px] border-b border-[var(--color-border)]"
        style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}
      >
        <BentoCard label="Alliance principale" wide accent>
          <p className="font-[family-name:var(--font-editorial)] text-[13px] text-[var(--color-text-secondary)] italic">
            Invite un allié pour commencer.
          </p>
        </BentoCard>
        <BentoCard label="En attente">
          <BentoVal>—</BentoVal>
          <BentoSub>demandes</BentoSub>
        </BentoCard>
      </div>

      {/* Feed — liste AllyCard existante */}
      <div className="flex-1 overflow-y-auto px-[26px] py-4">
        {/* Insérer ici les composants AllyCard existants */}
        <FeedHeader title="Demandes en attente" />
      </div>
    </div>
  )
}
```

- [ ] **Vérifier** puis **commit**

```bash
git add src/app/(main)/alliances/page.tsx
git commit -m "feat(design): Alliances — layout Magazine+Bento"
```

---

## Task 10 — Domaines vivants (/domaines/[id])

**Files:**
- Modify: `src/features/carte/DomaineHeader.tsx`
- Modify: `src/features/carte/DomaineContent.tsx`
- Modify: `src/app/(main)/domaines/[id]/page.tsx`

- [ ] **Lire les fichiers**

```bash
cat src/features/carte/DomaineHeader.tsx
cat src/features/carte/DomaineContent.tsx
cat src/app/(main)/domaines/[id]/page.tsx
```

- [ ] **Mettre à jour `src/features/carte/DomaineHeader.tsx`**

Conserver la structure hex SVG, remplacer toutes les couleurs ambre par saphir :
- `fill` amber → `fill-[var(--color-accent)]` ou `fill-[var(--color-accent-bg)]`
- `stroke` amber → `stroke-[var(--color-accent)]`
- `text-amber-*` → `text-[var(--color-accent)]`
- `border-amber-*` → `border-[var(--color-accent-border)]`

Ajouter le pattern hero en haut :
```tsx
<div className="flex-shrink-0 px-[26px] pt-[22px] pb-[20px] border-b border-[var(--color-border)]">
  <p className="text-[9px] font-medium tracking-[.14em] uppercase text-[var(--color-accent)] opacity-65 mb-2">
    {domainMeta.label}
  </p>
  {/* hex SVG existant + stats existants */}
</div>
```

- [ ] **Mettre à jour `src/features/carte/DomaineContent.tsx`**

Les tabs (Notes | Secrets | Versets) :
```tsx
// Remplacer les classes de tabs ambre par saphir
// tab actif : text-[var(--color-accent)] border-b-[var(--color-accent)]
// tab inactif : text-[var(--color-text-muted)]
```

Les entrées du feed : utiliser `FeedEntry` depuis `@/components/layout/FeedEntry`.

- [ ] **Vérifier dans le browser**

Cliquer sur une bento card de La Carte → naviguer vers `/domaines/[id]` → affiche le bon contenu avec les couleurs saphir.

- [ ] **Commit**

```bash
git add src/features/carte/DomaineHeader.tsx src/features/carte/DomaineContent.tsx src/app/(main)/domaines/
git commit -m "feat(design): Domaines vivants — couleurs saphir + hero layout"
```

---

## Task 11 — Profil

**Files:**
- Modify: `src/app/(main)/profil/page.tsx`
- Modify: `src/features/profil/CitizenIdentity.tsx`
- Modify: `src/features/profil/stats/MetricBlock.tsx`
- Modify: `src/features/profil/stats/TerritoireAtlas.tsx`
- Modify: `src/features/profil/PreferencesForm.tsx`

- [ ] **Lire les fichiers**

```bash
cat src/app/(main)/profil/page.tsx
cat src/features/profil/CitizenIdentity.tsx
cat src/features/profil/stats/MetricBlock.tsx
cat src/features/profil/stats/TerritoireAtlas.tsx
```

- [ ] **Remplacer toutes les références ambre dans ces fichiers**

Pattern de remplacement systématique :
- `--color-amber-400` → `--color-accent`
- `--color-amber-300` → `--color-accent-light`
- `--color-amber-bg` → `--color-accent-bg`
- `--color-amber-border` → `--color-accent-border`
- `border-[var(--color-amber-*)]` → `border-[var(--color-accent-border)]`
- `text-amber-*` / `fill-amber-*` → `text-[var(--color-accent)]` / `fill-[var(--color-accent)]`

Dans `TerritoireAtlas.tsx`, les hexagones de niveaux différents utilisent des variantes d'opacité de l'accent saphir :
- Niveau 5 : `fill-[var(--color-accent)]` opacity 1
- Niveau 4 : `fill-[var(--color-accent)]` opacity .55
- Niveau 3 : `fill-[var(--color-accent)]` opacity .28
- Niveau 1-2 : `fill-[rgba(180,195,210,0.10)]`

- [ ] **Ajouter le hero à la page profil**

```tsx
<div className="flex-shrink-0 px-[26px] pt-[22px] pb-[20px] border-b border-[var(--color-border)]">
  <p className="text-[9px] font-medium tracking-[.14em] uppercase text-[var(--color-accent)] opacity-65 mb-2">
    Profil
  </p>
  <h1 className="font-[family-name:var(--font-editorial)] text-[22px] font-[500] text-[var(--color-text-primary)] leading-[1.25]">
    Mon Identité
  </h1>
</div>
```

- [ ] **Vérifier dans le browser**

Profil : avatar en saphir, stats MetricBlock avec valeurs saphir, TerritoireAtlas en dégradé saphir.

- [ ] **Commit final**

```bash
git add src/app/(main)/profil/page.tsx src/features/profil/
git commit -m "feat(design): Profil — couleurs saphir + hero layout"
```

---

## Vérification finale

- [ ] **Mettre à jour `/notifications/page.tsx`** si elle existe (non couverte par les tâches mais hérite des tokens ambre)

```bash
cat src/app/(main)/notifications/page.tsx
# Remplacer les couleurs ambre par saphir selon le même pattern que Task 4
```

- [ ] **Passer sur toutes les pages** et s'assurer qu'aucune couleur ambre ne subsiste

```bash
grep -r "amber" src/ --include="*.tsx" --include="*.css" -l
```

Si des fichiers remontent, les corriger et commiter.

- [ ] **Vérifier que les fonts chargent correctement**

Ouvrir les DevTools → onglet Network → filtrer "font" → Lora et DM Mono doivent apparaître.

- [ ] **Vérifier la navigation mobile** (< 768px)

BottomNav doit apparaître en bas, accent saphir sur l'item actif.

- [ ] **Mettre à jour STATUS.md**

Ajouter dans `## ✅ Terminé` :
```markdown
### Redesign Brume & Acier
- [x] Design tokens Brume & Acier (saphir, ardoise froide)
- [x] Typographie Lora + DM Mono
- [x] Layout Magazine + Bento — toutes les pages
- [x] Navigation redesign (saphir)
```

- [ ] **Commit de clôture**

```bash
git add STATUS.md
git commit -m "chore: STATUS — redesign Brume & Acier complet"
```
