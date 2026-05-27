# BASILEIA — Style Guide : Noir Éditorial

> Principes : App-Effacement absolu · Monochrome pur · Éditorial spacieux

---

## 1. Couleurs

### Tokens disponibles

```css
/* Surfaces */
--color-bg-base:     #0a0a0a       /* fond principal */
--color-bg-surface:  #111111       /* cartes, panels */
--color-bg-elevated: #181818       /* éléments surélevés */
--color-bg-hover:    rgba(255,255,255,0.04)
--color-bg-active:   rgba(255,255,255,0.06)

/* Texte — hiérarchie par opacité uniquement */
--color-text-primary:   rgba(255,255,255,0.88)   /* titres, valeurs actives */
--color-text-secondary: rgba(255,255,255,0.42)   /* corps, labels nav inactifs */
--color-text-muted:     rgba(255,255,255,0.22)   /* metadata, sous-titres */
--color-text-disabled:  rgba(255,255,255,0.12)   /* placeholders */

/* Bordures */
--color-border:        rgba(255,255,255,0.06)    /* défaut */
--color-border-mid:    rgba(255,255,255,0.10)    /* focus, accentué */
--color-border-subtle: rgba(255,255,255,0.03)    /* séparateurs légers */

/* Ombres */
--shadow-sm: 0 1px 2px rgba(0,0,0,0.6)
--shadow-md: 0 4px 16px rgba(0,0,0,0.7), 0 1px 3px rgba(0,0,0,0.5)
```

### Règle fondamentale

**Zéro couleur d'accent.** La hiérarchie est exprimée uniquement par l'opacité du blanc. Pas de saphir, pas d'ambre, pas d'indigo.

---

## 2. Typographie

### Familles

| Rôle | Font | Variable CSS |
|------|------|-------------|
| UI (navigation, labels, corps) | System sans (-apple-system) | `var(--font-sans)` |
| Éditorial (titres, versets, valeurs BentoVal) | Instrument Serif | `var(--font-editorial)` |

### Échelle

| Élément | Font | Taille | Style | Tracking |
|---------|------|--------|-------|---------|
| Hero H1 | Instrument Serif | 34px | normal | -0.02em |
| H2 section | Instrument Serif | 20px | normal | -0.015em |
| BentoVal | Instrument Serif | 26px | normal | -0.02em |
| Verset ancré | Instrument Serif | 17px | italic | 0 |
| Corps UI | System sans | 13px | normal | 0 |
| Label section | System sans | 9px | CAPS | 0.14em |
| Métadonnée | System sans | 10–11px | normal | 0 |

### Règles

- `line-height` éditorial : 1.8 minimum
- `line-height` corps : 1.65
- `text-wrap: balance` sur tous les titres
- `max-width` prose : 64ch

---

## 3. Espacement & Radius

### Radius tokens

| Token | Valeur | Usage |
|-------|--------|-------|
| `--radius-xs` | 3px | Badges, tags |
| `--radius-sm` | 5px | Nav items |
| `--radius-md` | 6px | BentoCard, MetricBlock |
| `--radius-lg` | 8px | Panels, feed containers |
| `--radius-xl` | 10px | Modales, drawers |

### Padding pages

- Desktop : `px-[32px]`
- Mobile : `px-5`

### Bento

- Gap interne : `var(--bento-gap)` = 6px
- Radius : `var(--bento-radius)` = 6px

---

## 4. Composants

### NavItem (actif)

```css
background: var(--color-bg-active)  /* rgba .06 */
color:      var(--color-text-primary)
font-weight: 500
border-radius: var(--radius-sm)     /* 5px, tous côtés */
/* PAS de border-left colorée */
```

### BentoCard

```css
background:    var(--color-bg-surface)
border:        1px solid var(--color-border)
border-radius: var(--bento-radius)
padding:       12px 14px

/* Variante accent (domaine actif) */
background:    rgba(255,255,255,0.04)
border-color:  var(--color-border-mid)
```

### FeedEntry

```css
border-bottom: 1px solid var(--color-border)
last-child: border-bottom: none    /* last:border-b-0 */
hover: background: var(--color-bg-hover)
padding: 13px 18px
```

### Boutons CTA primaires

```css
background:    rgba(255,255,255,0.10)
border:        1px solid var(--color-border-mid)
color:         var(--color-text-primary)
```

### Inputs (focus)

```css
focus-within:border-color: var(--color-border-mid)
```

---

## 5. Animations

```css
--ease-fast: cubic-bezier(0.16,1,0.3,1)
```

- Durées : 150ms (micro), 200ms (défaut), 300ms (max)
- Jamais > 300ms, jamais de bounce
- `initial={false}` sur tous les `AnimatePresence`

---

## 6. Ce qu'on ne fait JAMAIS

```
❌ Toute couleur d'accent (ni saphir, ni ambre, ni indigo, ni vert)
❌ Gradient (aucun, nulle part)
❌ Glow / neon / shadow colorée
❌ Glass effect avec teinte colorée (--glass-* supprimé)
❌ Fond noir pur #000000 (utiliser #0a0a0a)
❌ Border-left colorée sur nav items actifs
❌ DM Mono comme font UI
❌ Lora comme font éditoriale
❌ Streak, score, barre de progression, gamification
❌ Animation > 300ms ou avec bounce
❌ Notification qui s'impose au Citoyen
```

---

## 7. Références

- Spec complète : `docs/superpowers/specs/2026-05-26-noir-editorial-redesign.md`
- Tokens CSS : `src/styles/tokens.css`
- Fonts : `src/app/layout.tsx` (Instrument_Serif via next/font/google)
