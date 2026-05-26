# BASILEIA — Redesign Noir Éditorial

**Date** : 2026-05-26  
**Statut** : Approuvé  
**Remplace** : `2026-05-25-brume-acier-redesign.md` (Brume & Acier)  
**Direction** : Moderne & Minimaliste — Éditorial Spacieux

---

## 1. Vision & Philosophie

### Principe directeur
**App-Effacement absolu.** L'interface disparaît derrière le contenu. Aucune couleur ne réclame l'attention. La hiérarchie est exprimée uniquement par l'opacité du blanc sur fond noir.

### Ce qui change vs Brume & Acier
| Dimension | Brume & Acier | Noir Éditorial |
|-----------|--------------|----------------|
| Fond | `#131517` (ardoise froide) | `#0a0a0a` (quasi-noir absolu) |
| Accent | Saphir `#6B9FD4` | **Aucun** — monochrome pur |
| Texte | Teinte bleu-gris | Blanc pur avec opacité variable |
| Typo UI | DM Mono (monospace) | System sans (-apple-system) |
| Typo éditorial | Lora (serif classique) | Instrument Serif (expressif) |
| Surfaces | Glass panels avec teinte bleue | Surfaces neutres `#111111` |
| Densité | Compact, bento serré | Spacieux, espace négatif intentionnel |

---

## 2. Tokens CSS

### Couleurs
```css
:root {
  /* Surfaces */
  --color-bg-base:     #0a0a0a;
  --color-bg-surface:  #111111;
  --color-bg-elevated: #181818;
  --color-bg-hover:    rgba(255,255,255,0.04);
  --color-bg-active:   rgba(255,255,255,0.06);

  /* Texte — hiérarchie par opacité uniquement */
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
}
```

### Règle fondamentale couleur
**Zéro couleur d'accent.** Ni saphir, ni ambre, ni indigo. Le blanc `rgba(255,255,255,0.88)` est le seul signal "actif". Les états (hover, actif, désactivé) sont exprimés par variation d'opacité et de fond uniquement.

### Suppression des tokens obsolètes
Supprimer : `--color-accent*`, `--glass-*`, `--color-text-accent`, tout token de teinte bleue.

---

## 3. Typographie

### Familles
```css
@theme {
  --font-family-sans:      -apple-system, 'Helvetica Neue', sans-serif;
  --font-family-editorial: 'Instrument Serif', Georgia, serif;
}
```

Imports Google Fonts à ajouter dans `layout.tsx` :
```
Instrument Serif — italic + non-italic, weight 400
```

### Échelle
| Rôle | Famille | Taille | Poids | Style | Tracking |
|------|---------|--------|-------|-------|---------|
| Display (hero mobile) | Instrument Serif | 38px | 400 | normal | -0.025em |
| H1 — titre page | Instrument Serif | 28px | 400 | normal | -0.020em |
| H2 — section | Instrument Serif | 20px | 400 | normal | -0.015em |
| Verset ancré | Instrument Serif | 16px | 400 | italic | 0 |
| Corps UI | System sans | 13px | 400 | normal | 0 |
| Label section | System sans | 9px | 500 | normal | 0.16em (CAPS) |
| Métadonnée | System sans | 11px | 400 | normal | 0 |
| Nom domaine (feed) | Instrument Serif | 15px | 400 | italic | 0 |

### Règles
- `line-height` éditorial : `1.8` minimum pour les versets
- `line-height` corps : `1.65`
- `text-wrap: balance` sur tous les titres H1/H2
- `text-wrap: pretty` sur les corps de texte > 2 lignes
- `max-width` prose : `64ch`

---

## 4. Espacement & Radius

### Espacement (inchangé — système 4/8px)
Garder les valeurs Tailwind existantes. Augmenter le padding des pages :
- Page padding horizontal : `32px` (desktop), `20px` (mobile)
- Gap hero → bento : `28px`
- Gap bento → feed : `22px`
- Bento gap interne : `6px`

### Radius
| Token | Valeur | Usage |
|-------|--------|-------|
| `--radius-xs` | 3px | Badges, tags |
| `--radius-sm` | 5px | Nav items |
| `--radius-md` | 6px | Bento blocks |
| `--radius-lg` | 8px | Panels, feed containers |
| `--radius-xl` | 10px | Modales, drawers |

Réduction par rapport à Brume & Acier — coins plus nets, plus géométriques.

---

## 5. Composants

### NavItem (Sidebar)
```
État default :
  color: text-secondary (rgba .42)
  background: transparent
  hover → background: bg-hover (rgba .04), color: text-primary (.88)

État actif :
  background: bg-active (rgba .06)
  color: text-primary (.88)
  font-weight: 500
  border-left: SUPPRIMÉ (plus de bordure colorée)
  border-radius: radius-sm (5px) sur tous les côtés
```

Supprimer la `border-left: 2px solid accent` de Brume & Acier — incompatible avec le monochrome.

### BentoCard
```
background: --color-bg-surface (#111111)
border: 1px solid --color-border (rgba .06)
border-radius: --radius-md (6px)
padding: 12px 14px

BentoCard accent (domaine le plus actif) :
  background: rgba(255,255,255,0.04)
  border-color: --color-border-mid (rgba .10)

BentoVal :
  font-family: Instrument Serif
  font-size: 26px
  color: text-primary (.88)
  letter-spacing: -0.02em

BentoSub :
  font-size: 10px
  color: text-muted (.22)
```

### FeedEntry (liste domaines)
```
Container :
  border: 1px solid --color-border
  border-radius: --radius-lg (8px)
  overflow: hidden

Row :
  padding: 13px 18px
  border-bottom: 1px solid --color-border
  hover → background: bg-hover

Nom (Instrument Serif italic) :
  font-size: 15px
  color: text-secondary (.42)

Badge niveau :
  font-size: 8.5px
  border: 1px solid border-mid
  border-radius: radius-xs
  padding: 2px 7px
  color: text-muted (.22)
  background: transparent

Badge niveau actif :
  color: text-primary (.88)
  background: rgba(255,255,255,.05)
```

### Verset Card
```
background: --color-bg-surface
border: 1px solid --color-border
border-radius: --radius-lg
padding: 20px 22px

Texte verset :
  font-family: Instrument Serif italic
  font-size: 17px
  color: rgba(255,255,255,0.75)
  line-height: 1.8

Référence :
  font-size: 10px
  color: text-muted (.22)
  letter-spacing: 0.04em
  margin-top: 10px
```

### Sidebar (desktop)
```
width: 200px collapsed / 200px expanded (suppression du mode collapsed icon-only)
background: --color-bg-base (#0a0a0a)
border-right: 1px solid --color-border
padding: 20px 10px

Logo :
  font-family: Instrument Serif
  font-size: 16px
  color: text-primary (.88)
  padding: 4px 10px 20px
```

> **Note sidebar** : envisager de supprimer le mode collapsed (48px) au profit d'une sidebar toujours visible à 200px sur desktop ≥ 768px. Décision finale à l'implémentation.

### BottomNav (mobile < 768px)
```
background: rgba(10,10,10,0.92)
border-top: 1px solid --color-border
backdrop-filter: blur(12px)
height: 60px

Icon actif : stroke rgba(255,255,255,.88), stroke-width 2
Icon inactif : stroke rgba(255,255,255,.28), stroke-width 1.5
Label actif : font-size 9px, color text-primary (.88)
Label inactif : font-size 9px, color text-muted (.22)
```

### Avatar Citoyen
```
border: 1px solid rgba(255,255,255,.12)
background: rgba(255,255,255,.06)
initiales : text-primary (.88), font-weight 500
Fallback couleur : conserver le hash HSL existant (hue 0–60°)
```

### Blocs métriques (stats profil)
```
background: rgba(255,255,255,.03)
border: 1px solid --color-border
border-radius: --radius-md
padding: 12px 14px

Valeur : Instrument Serif, 22px, text-primary (.88)
Label : System sans, 9px, text-muted (.22), ALL CAPS
```

---

## 6. Structure de page — La Carte

```
┌─ Hero ────────────────────────────────────────────┐
│  [LABEL SECTION]          padding: 32px 32px 0    │
│  Titre H1 spacieux                                │
│  Sous-titre corps UI                              │
└───────────────────────────────────────────────────┘
  gap: 28px
┌─ Bento Grid ──────────────────────────────────────┐
│  4 colonnes · gap 6px · padding: 0 32px           │
│  [Wide accent: domaine actif] [Stat] [Stat]       │
│  [Stat] [Domaine] [Domaine] [Domaine]             │
└───────────────────────────────────────────────────┘
  gap: 22px
┌─ Feed ────────────────────────────────────────────┐
│  [Label "Domaines restants"]                      │
│  Container bordé · liste de rows                  │
│  padding: 0 32px 40px                             │
└───────────────────────────────────────────────────┘
```

Même pattern appliqué aux autres pages avec leurs contenus spécifiques.

---

## 7. Animations (inchangées)

Conserver les easings existants :
```css
--ease-fast: cubic-bezier(0.16,1,0.3,1);
```
Durées : 150ms (micro), 200ms (défaut), 300ms (max absolu).  
Jamais de bounce, jamais > 300ms.

`initial={false}` sur tous les `AnimatePresence` (pas d'animation au premier rendu).

---

## 8. Ce qu'on ne fait JAMAIS (mis à jour)

```
❌ Toute couleur d'accent (ni saphir, ni ambre, ni indigo, ni vert)
❌ Gradient (aucun, nulle part)
❌ Glow / neon / shadow colorée
❌ Glass effect avec teinte colorée
❌ Fond noir pur #000000 (utiliser #0a0a0a)
❌ Border-left colorée sur nav items actifs
❌ DM Mono comme font UI principale
❌ Lora comme font éditoriale
❌ Streak, score, barre de progression, gamification
❌ Animation > 300ms ou avec bounce
❌ Notification qui s'impose au Citoyen
```

---

## 9. Fichiers à modifier

| Fichier | Changement |
|---------|-----------|
| `src/styles/tokens.css` | Nouveau jeu de tokens complet |
| `src/styles/globals.css` | Remplacer DM Mono → system sans, Lora → Instrument Serif |
| `src/app/layout.tsx` | Remplacer imports Google Fonts (Instrument Serif uniquement) |
| `src/components/bento/BentoCard.tsx` | Styles mis à jour |
| `src/components/layout/FeedEntry.tsx` | Styles mis à jour |
| `src/features/nav/Sidebar.tsx` | Supprimer border-left accent, revoir état actif |
| `src/features/nav/BottomNav.tsx` | Couleurs monochrome |
| `src/features/profil/stats/MetricBlock.tsx` | Renommer prop `amber` → styles monochrome |
| `src/app/(main)/page.tsx` | Padding spacieux, hero H1 plus grand |
| `docs/style-guide.md` | MAJ complète pour refléter la nouvelle direction |

---

## 10. Hors-scope

- Changements de logique métier ou de routes
- Nouvelles fonctionnalités (Phase F)
- Refactor de l'architecture des composants
- Mode clair (`data-theme="light"`) — à définir ultérieurement
