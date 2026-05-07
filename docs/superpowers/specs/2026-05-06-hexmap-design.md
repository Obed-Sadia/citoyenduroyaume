# HexMap — Design Spec
_Date : 2026-05-06 · Feature : La Carte · BASILEIA_

---

## Contexte

`HexMap` est le composant central de la page d'accueil `/` (La Carte). Il affiche les 7 Domaines de BASILEIA sous forme de grille hexagonale interactive (~500px), grand format, centré sur la page. C'est le premier élément visuel que le Citoyen voit à l'ouverture de l'app.

---

## Architecture & fichiers

| Fichier | Action | Rôle |
|---------|--------|------|
| `src/features/carte/domain-constants.ts` | Créer | Constantes partagées : `DomainId`, `ExplorationLevel`, `FILL`, `STROKE`, `hexPoints()`, `DOMAINS` |
| `src/features/carte/HexMap.tsx` | Créer | SVG interactif — grille hex large |
| `src/features/carte/DomainTooltip.tsx` | Créer | Popup tap court avec stats du Domaine |
| `src/features/carte/ZoneGrise.tsx` | Créer | Overlay pointillé pour hexagones inexploréss |
| `src/features/profil/stats/TerritoireAtlas.tsx` | Modifier | Importer depuis `domain-constants.ts` au lieu de déclarer en local |
| `src/app/(main)/page.tsx` | Modifier | Fetch Supabase + intégrer `<HexMap>` |

### Principe de partage

`domain-constants.ts` exporte exactement ce que les deux composants ont en commun : types, couleurs, et la fonction `hexPoints()`. Les coordonnées cx/cy restent dans chaque composant (échelles différentes).

---

## `domain-constants.ts`

Exporte :
- `DomainId` — union type des 7 identifiants
- `ExplorationLevel` — `0 | 1 | 2 | 3 | 4 | 5`
- `FILL: Record<ExplorationLevel, string>` — couleurs ambre par niveau
- `STROKE: Record<ExplorationLevel, { color: string; width: number }>` — bordures par niveau
- `hexPoints(cx, cy): string` — génère les points d'un hexagone pointy-top
- `DOMAIN_META` — tableau `{ id, label, abbr }` sans coordonnées (positions définies dans chaque composant)

---

## `HexMap.tsx`

### Géométrie

- `R = 52px` (vs 22px dans TerritoireAtlas — ratio ×2.36)
- SVG viewBox : `0 0 320 425`
- Conteneur : `max-width: 500px`, centré, `width: 100%`
- Disposition pointy-top losange vertical :

```
         LE ROI          cx≈160, cy≈56
  TERRITOIRE  CITOYENS   cx≈114/206, cy≈134
CONSTITUTION    LOIS     cx≈68/252, cy≈212
    GOUVERNEMENT         cx≈160, cy≈290
     PRIVILÈGES          cx≈160, cy≈368
```

### Props

```typescript
interface DomainStats {
  exploration: ExplorationLevel
  journalCount: number
  secretCount: number
}

interface HexMapProps {
  stats: Partial<Record<DomainId, DomainStats>>
  activeThisWeek?: DomainId | null
}
```

Navigation sur tap long : gérée en interne avec `useRouter()` de Next.js — pas de prop fonction (incompatible Server Component).

### Interactions

| Geste | Comportement |
|-------|-------------|
| Tap court (`onClick`) | Ouvre `DomainTooltip` pour ce Domaine |
| Tap long (`onPointerDown` + timer 500ms) | Navigate vers `/domaines/[id]` via `useRouter()` |
| Hover desktop | `scale(1.04)`, `ease [0.16,1,0.3,1], 150ms` |
| Clic hors tooltip | Ferme le tooltip |

Un seul tooltip ouvert à la fois. L'état (`selectedDomain`) est local au composant (`useState<DomainId | null>`).

> `HexMap` requiert `"use client"` (state, router, event handlers).

### Animations

- **Mount** : chaque hexagone entre avec `opacity: 0→1, scale: 0.92→1`, stagger de 30ms par index
- **Pulse actif** : hexagone `activeThisWeek` — `opacity: [1, 0.7, 1]`, duration 3s, Infinity, easeInOut
- **Hover** : `whileHover={{ scale: 1.04 }}`, transition `ease [0.16,1,0.3,1], 0.15s`
- Jamais de bounce. Max 300ms.

### `ZoneGrise` intégré

Pour chaque hexagone avec `exploration === 0`, `<ZoneGrise points={...}>` est superposé.

---

## `DomainTooltip.tsx` (`"use client"`)

### Structure visuelle

```
┌─────────────────────────────┐
│ LE ROI              [level] │  ← nom ALL CAPS 10px + badge niveau ambre
│ ─────────────────────────── │
│ 12 journaux   ·   4 secrets │  ← comptages, text-secondary 11px
│                             │
│          [ Explorer → ]     │  ← bouton → onNavigate(id)
└─────────────────────────────┘
```

- Fond : `var(--color-bg-elevated)`
- Border-radius : `var(--radius-xl)` (14px)
- Ombre : `var(--shadow-md)`
- Position : sous l'hexagone tapé, centré, ajusté pour rester dans le viewport
- Animation : `opacity 0→1, y: +8→0`, `ease [0.16,1,0.3,1], 150ms`
- Fermeture : tap hors du tooltip

---

## `ZoneGrise.tsx`

Composant SVG pur (pas de `"use client"`).

- Reçoit `points: string` (identique au `<polygon>` de l'hexagone)
- Superpose un `<pattern>` de petits cercles `r=0.8px`, espacement 6px
- Couleur : `rgba(120,115,110,0.12)`
- Pas d'animation
- Rendu uniquement si `level === 0`

---

## Intégration page

```
/app/(main)/page.tsx  (Server Component)
  ↓ fetch Supabase GROUP BY domain_id
  ↓ <HexMap stats={domainStats} activeThisWeek={activeId} onNavigate={...} />

HexMap  ("use client")
  ↓ SVG interactif avec state local (selectedDomain)
  ↓ <ZoneGrise> pour level 0
  ↓ <DomainTooltip> conditionnel
```

`CartePage` reste Server Component. `HexMap` est le seul Client Component de la feature.

---

## Décisions

| Sujet | Décision |
|-------|----------|
| Partage des constantes | `domain-constants.ts` — pas de duplication |
| Taille HexMap | R=52px, SVG 320×425, max-width 500px |
| Interaction tap | Court → tooltip · Long (500ms) → navigation |
| ZoneGrise | Pattern SVG pointillé, pas d'animation |
| Tooltip position | Sous l'hexagone, ajustement viewport côté client |
| Source données | Supabase Server Component → props ; fallback objet vide |

---

## Hors scope

- Page `/domaines/[id]` (future feature)
- Offline fallback Dexie.js (traité dans `src/lib/db/` — prochaine session)
- `DomainTooltip` avec contenu verset (non demandé)
