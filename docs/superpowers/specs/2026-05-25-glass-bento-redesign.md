# BASILEIA — Glass Bento Redesign

**Date** : 2026-05-25  
**Statut** : Approuvé  
**Scope** : Refonte complète de l'identité visuelle — toutes les pages

---

## Résumé

Refonte du design général de BASILEIA selon la direction **Glass Bento** : une grille de panneaux modulaires translucides (`glassmorphism`) sur un fond sombre vivant (orbes ambrés + grain). Nouveau pairing typographique **Geist + Fraunces**. La sidebar et le BottomNav deviennent glass. Le principe App-Effacement est préservé — l'interface s'efface devant la Parole.

---

## 1. Fond global (Background)

### Couleur de base
```css
background: #09080B;  /* Légèrement plus bleuté que l'actuel #0A0907 */
```

### Orbes ambiants (fixed, pointer-events: none)
```css
/* Orbe 1 — ambre, haut gauche */
background: rgba(239, 159, 39, 0.13);
width: 340px; height: 340px;
filter: blur(80px);
position: fixed; top: -80px; left: -20px;

/* Orbe 2 — violet très atténué, bas droite */
background: rgba(110, 75, 180, 0.08);
width: 260px; height: 260px;
filter: blur(70px);
position: fixed; bottom: -60px; right: -20px;
```

### Grain (fixed overlay)
```css
/* Texture noise SVG, opacity 3.5% */
opacity: 0.035;
background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
background-size: 180px;
position: fixed; inset: 0;
pointer-events: none; z-index: 0;
```

**Implémentation** : les orbes et le grain vivent dans `src/app/layout.tsx` (root layout) ou dans un composant `<BackgroundCanvas />` côté client rendu une seule fois pour toute l'app.

---

## 2. Système de panneaux glass

Trois niveaux de panneaux réutilisables. Tous partagent `backdrop-filter: blur(16px)` et `border-radius: 11px`.

| Variante | Token CSS | background | border |
|----------|-----------|------------|--------|
| `base` | `--glass-base` | `rgba(255,255,255,0.045)` | `rgba(255,255,255,0.09)` |
| `amber` | `--glass-amber` | `rgba(239,159,39,0.07)` | `rgba(239,159,39,0.18)` |
| `strong` | `--glass-strong` | `rgba(255,255,255,0.065)` | `rgba(255,255,255,0.11)` |

### Composant `GlassPanel`
```tsx
// src/components/ui/GlassPanel.tsx
type Variant = 'base' | 'amber' | 'strong'

interface Props {
  variant?: Variant
  className?: string
  children: React.ReactNode
}
```

Le composant applique `backdrop-filter`, `background`, `border`, `border-radius` via les tokens. Pas de `"use client"` sauf si animé.

---

## 3. Sidebar — Glass

### Changements vs état actuel
| Propriété | Avant | Après |
|-----------|-------|-------|
| `background` | `var(--color-bg-surface)` (#0F0E0C) | `rgba(255,255,255,0.03)` |
| `backdrop-filter` | aucun | `blur(20px)` |
| `border-right` | `rgba(255,255,255,0.07)` | inchangé |

Width collapsed (48px) et expanded (240px) : **inchangés**.  
Comportement hover/lock : **inchangé**.  
Logo mark, NavItems, états actifs ambre : **inchangés**.

### Nouveau token à ajouter
```css
--glass-sidebar-bg: rgba(255, 255, 255, 0.03);
```

---

## 4. BottomNav — Glass

### Changements vs état actuel
| Propriété | Avant | Après |
|-----------|-------|-------|
| `background` | `rgba(10,9,7,0.88)` | `rgba(9,8,11,0.75)` |
| `backdrop-filter` | `blur(16px)` | `blur(24px)` |
| `border-top` | `rgba(255,255,255,0.07)` | inchangé |

Icônes, labels, états actifs : **inchangés**.

---

## 5. Grille Bento

### Layout de grille
```css
display: grid;
gap: 8px;
/* Colonnes selon le contexte de la page (2, 3 ou 4 colonnes) */
```

### Tailles de cells
- `span-1` : 1 colonne — stat isolée, icône de route
- `span-2` : 2 colonnes — verset mis en avant, liste courte
- `span-3` : pleine largeur — liste de versets, domaines, feed

### Composant `BentoGrid` + `BentoCell`
```tsx
// src/components/ui/BentoGrid.tsx
interface BentoCellProps {
  span?: 1 | 2 | 3
  variant?: 'base' | 'amber' | 'strong'
  className?: string
  children: React.ReactNode
}
```

`BentoCell` étend `GlassPanel` avec la prop `span` qui gère `grid-column: span N`.

---

## 6. Application par type de page

### Pages dashboard (grille bento complète)
Toutes ces pages utilisent un layout bento pour l'ensemble du contenu :

| Page | Structure cible |
|------|----------------|
| `/bibliotheque` | Verset du jour (span-2) + stat ancrés (span-1) + stat ce mois + domaines (span-2) + liste versets (span-3) |
| `/profil` | Stats contemplatives (3×span-1) + préférences (span-2) + compte (span-1) |
| `/alliances` | Alliés actifs (span-2) + stat alliances (span-1) + onglets invitations/versets en bento |
| `/notifications` | Feed notifications en panels glass empilés (pas de grille stricte — liste fluide) |
| `/secrets` | Stat secrets (3×span-1) + grille de cartes secrets |

### Pages texte (bento header, contenu linéaire)
Le header de la page est en bento (titre + stats), mais la zone de contenu reste linéaire dans un grand panel glass :

| Page | Structure cible |
|------|----------------|
| `/journal` | Header bento (stat notes + date) + liste de notes en panel glass large + éditeur dans un panel glass plein |
| `/journal/[id]` | Header minimal glass + éditeur plein écran dans panel glass |
| `/secrets` (détail) | Panel glass plein pour le contenu secret |

### La Carte (`/`)
Structure spéciale — la HexMap reste plein écran. Le shell glass s'applique à :
- Sidebar glass (déjà inclus)
- Tooltip de domaine → `GlassPanel variant="strong"`
- DomaineContent → panel glass flottant

---

## 7. Typographie

### Polices
```css
/* Google Fonts — dans layout.tsx ou globals.css */
font-family: 'Geist', system-ui, sans-serif;       /* UI */
font-family: 'Fraunces', Georgia, serif;            /* Éditorial */
```

Import Google Fonts :
```
Geist: wght@300;400;500;600
Fraunces: ital,opsz,wght@0,9..144,300..500;1,9..144,300..500
```

### Mapping des rôles

| Usage | Police | Taille | Poids | Style |
|-------|--------|--------|-------|-------|
| Labels UI, nav, boutons | Geist | inchangé | inchangé | normal |
| Eyebrow / breadcrumb | Geist | 9px | 500 | normal, tracking 0.11em |
| Stats numériques | Geist | inchangé | 300 | normal |
| Titres de page | Fraunces | 15px | 400 | normal |
| Texte de verset | Fraunces | 14–15px | 400 | italic |
| Référence de verset (ex: Matthieu 6:33) | Geist | 9px | 500 | uppercase, tracking 0.09em |
| Métadonnées (domaine, date) | Geist | 10px | 400 | normal |

### Tokens CSS à mettre à jour
```css
/* tokens.css */
--font-sans: 'Geist', system-ui, sans-serif;
--font-editorial: 'Fraunces', Georgia, serif;
```

---

## 8. Tokens CSS nouveaux

À ajouter dans `tokens.css` :

```css
/* Glass */
--glass-blur: 16px;
--glass-blur-heavy: 24px;
--glass-base-bg:    rgba(255, 255, 255, 0.045);
--glass-base-border: rgba(255, 255, 255, 0.09);
--glass-amber-bg:    rgba(239, 159, 39, 0.07);
--glass-amber-border: rgba(239, 159, 39, 0.18);
--glass-strong-bg:   rgba(255, 255, 255, 0.065);
--glass-strong-border: rgba(255, 255, 255, 0.11);
--glass-sidebar-bg:  rgba(255, 255, 255, 0.03);

/* Fond */
--color-bg-base: #09080B;  /* mise à jour — légèrement plus froid */

/* Bento */
--bento-gap: 8px;
--bento-radius: 11px;
```

---

## 9. Ce qui ne change pas

- Accent ambre `#EF9F27` — seul accent, aucune autre couleur vive
- Tokens `--color-text-*`, `--color-amber-*`, `--color-border` — inchangés
- Animations : ease `[0.16, 1, 0.3, 1]` · max `300ms` · zéro bounce
- Lucide icons, outline uniquement
- Responsive breakpoints : `768px` (sidebar ↔ BottomNav)
- `"use client"` uniquement si hooks/animations/events
- Principe App-Effacement : l'interface s'efface devant la Parole

---

## 10. Anti-patterns (inchangés + nouveaux)

```
❌ Gradient (toujours aucun — les orbes sont du radial-gradient en fond fixe, pas dans les composants)
❌ Glow / neon / shadow colorée dans les composants
❌ backdrop-filter sur des éléments imbriqués profondément (perf GPU)
❌ Glass sur glass sans fond riche derrière — l'effet disparaît
❌ Bento grille sur du contenu de lecture longue (journal, texte de verset long)
❌ Fraunces en poids > 500 — devient trop chargé
❌ Geist en italic — réservé à Fraunces
```

---

## 11. Ordre d'implémentation suggéré

1. **Tokens & fonts** — `tokens.css` + import Geist/Fraunces dans layout
2. **BackgroundCanvas** — orbes + grain en composant isolé
3. **GlassPanel + BentoCell** — composants de base réutilisables
4. **Sidebar + BottomNav** — mise à jour glass
5. **Pages dashboard** — Bibliothèque → Profil → Alliances → Notifications → Secrets
6. **Pages texte** — Journal (liste + éditeur)
7. **La Carte** — tooltips + DomaineContent en glass
