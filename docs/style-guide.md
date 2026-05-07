# BASILEIA · Style Guide

> Fichier de référence design. Claude Code doit le lire avant de créer tout composant visuel.
> Philosophie : **App-Effacement** — l'interface s'efface devant la pensée.

---
## Skills disponibles — charger avant de coder

Avant tout composant visuel, charger les skills pertinents :

| Tâche | Commande |
|-------|----------|
| N'importe quel composant UI | `frontend-design` |
| Animation (hover, transition, mount) | `framer-motion` |
| Vérifier la qualité UX | `ui-ux-pro-max` |
| Améliorer un composant existant | `make-interfaces-feel-better` |
| Composant trop complexe | `simplify` |
| Composant shadcn nécessaire | `shadcn` |
| Composant 21st.dev nécessaire | `use 21st-dev MCP` |

Règle : ne jamais créer un composant visuel sans avoir lu
au minimum `frontend-design` + `framer-motion`.


## 1. Couleurs

### Règle fondamentale
**Un seul accent : l'ambre.** Aucune autre couleur vive n'entre dans l'interface.
Pas de purple. Pas de bleu vif. Pas de vert. L'ambre ou rien.

### Palette ambre

| Token | Valeur | Usage |
|-------|--------|-------|
| `--color-amber-300` | `#F5BB62` | Hover states légers, texte secondaire ambre |
| `--color-amber-400` | `#EF9F27` | **Accent principal** — icônes actives, texte amber, dots |
| `--color-amber-500` | `#C97D0E` | Borders ambre foncées |
| `--color-amber-600` | `#854F0B` | Hexagones moyennement explorés |
| `--color-amber-700` | `#633806` | Hexagones peu explorés |
| `--color-amber-bg` | `rgba(239,159,39,0.11)` | Fond item actif sidebar |
| `--color-amber-border` | `rgba(239,159,39,0.30)` | Bordure du logo mark, éléments ambre |

### Surfaces (charbon chaud — jamais froid, jamais #000)

| Token | Valeur | Usage |
|-------|--------|-------|
| `--color-bg-base` | `#0A0907` | Fond principal de l'app |
| `--color-bg-surface` | `#0F0E0C` | Sidebar, panels, cartes |
| `--color-bg-elevated` | `#161412` | Modales, popovers, tooltips |
| `--color-bg-hover` | `rgba(255,255,255,0.04)` | Hover état non-actif |
| `--color-bg-active` | `rgba(239,159,39,0.08)` | Fond état actif |

### Texte (crème chaud — jamais blanc pur)

| Token | Valeur | Usage |
|-------|--------|-------|
| `--color-text-primary` | `rgba(255,252,245,0.92)` | Titres, noms, contenu principal |
| `--color-text-secondary` | `rgba(255,252,245,0.55)` | Corps de texte UI, labels |
| `--color-text-muted` | `rgba(255,252,245,0.30)` | Métadonnées, timestamps, désactivé |
| `--color-text-disabled` | `rgba(255,252,245,0.18)` | Éléments inactifs |
| `--color-text-amber` | `#EF9F27` | Texte en couleur ambre |

### Bordures

| Token | Valeur | Usage |
|-------|--------|-------|
| `--color-border` | `rgba(255,255,255,0.07)` | Séparateurs principaux (sidebar, sections) |
| `--color-border-subtle` | `rgba(255,255,255,0.04)` | Séparateurs très discrets |
| `--color-border-amber` | `rgba(239,159,39,0.30)` | Élément ambre avec bordure |

---

## 2. Typographie

### Familles

| Variable | Famille | Fallbacks | Usage |
|----------|---------|-----------|-------|
| `--font-editorial` | `Cormorant Garamond` | `Georgia, serif` | Versets ancrés, titres de journaux, citations |
| `--font-sans` | `DM Sans` | `system-ui, sans-serif` | Toute l'interface UI |
| `--font-mono` | `JetBrains Mono` | `Fira Code, monospace` | Métadonnées techniques si nécessaire |

### Échelle de taille

| Taille | Poids | Usage |
|--------|-------|-------|
| `28px` | `500` | Titre de journal (Cormorant) |
| `18px` | `400 italic` | Bloc verset ancré (Cormorant) |
| `15px` | `500` | Nom utilisateur, titre page |
| `13px` | `400` | Corps paragraphes UI |
| `12.5px` | `400` | Items de navigation étendus, notifications |
| `11px` | `400` | Métadonnées, timestamps, email masqué |
| `10px` | `500` | Labels de section (ALL CAPS, tracking .09em) |

### Règles typographiques

- **Jamais Inter, Roboto, Arial ou les fonts système pour l'éditorial**
- Labels de section : `text-transform: uppercase; letter-spacing: .09em; font-size: 10px`
- Versets : `font-style: italic`, référence en `font-size: 13px` non italique
- `line-height` éditorial : `1.75` — jamais en dessous de `1.5` pour les versets
- `max-width` prose : `68ch`

---

## 3. Espacement

Système en `rem` pour le rythme vertical, `px` pour les gaps internes.

| Valeur | Tailwind | Usage |
|--------|----------|-------|
| 2px | `gap-0.5` | Gap micro icône/label |
| 4px | `p-1` | Padding interne compact (badges) |
| 6px | `gap-1.5` | Gap entre items nav |
| 8px | `p-2, px-2` | Padding horizontal sidebar items |
| 10px | `p-2.5` | Padding nav section |
| 12px | `p-3, px-3` | Padding logo sidebar |
| 16px | `p-4` | Sections internes |
| 20px | `p-5` | Padding de page (header) |
| 24px | `p-6` | Sections majeures |

---

## 4. Rayons de bords

| Token | Valeur | Usage |
|-------|--------|-------|
| `--radius-xs` | `3px` | Badges, étiquettes |
| `--radius-sm` | `4px` | Logo mark (carré B) |
| `--radius-md` | `6px` | Nav items, buttons, selects |
| `--radius-lg` | `10px` | Panels, cards, preview windows |
| `--radius-xl` | `14px` | Modales, drawers |
| `9999px` | — | Avatars (cercle), dots de notification |

**Attention :** Un nav item actif a `border-left: 2px solid amber` → **pas d'arrondi à gauche** (`rounded-l-none`).

---

## 5. Transitions & Animations

### Easings

```css
/* Éasing principal — fluide, jamais mécanique */
--ease-out-fast:  cubic-bezier(0.16, 1, 0.3, 1) 150ms;
--ease-out-base:  cubic-bezier(0.16, 1, 0.3, 1) 200ms;  /* ★ défaut */
--ease-out-slow:  cubic-bezier(0.16, 1, 0.3, 1) 300ms;  /* max absolu */
```

**Jamais de bounce.** Jamais de `spring` visible (sauf `NotificationBadge` mount).

### Valeurs Framer Motion par composant

```typescript
// Sidebar — width
{ ease: [0.16, 1, 0.3, 1], duration: 0.2 }

// Label nav — enter/exit
{ ease: [0.16, 1, 0.3, 1], duration: 0.15 }
initial: { opacity: 0, x: -6 }  →  animate: { opacity: 1, x: 0 }

// Chevron de lock — rotate
{ ease: [0.16, 1, 0.3, 1], duration: 0.2 }

// NotificationBadge — mount
{ type: 'spring', stiffness: 400, damping: 20 }

// Pulse ring de notification
{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }
animate: { scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }

// BottomNav label — appear
{ ease: [0.16, 1, 0.3, 1], duration: 0.15 }
animate: { opacity: active ? 1 : 0, y: active ? 0 : 3 }
```

---

## 6. Composants — Règles de style

### NavItem (Sidebar)

```
État default :
  color: text-secondary
  border-left: 2px solid transparent
  hover → background: bg-hover, color: text-primary

État actif :
  background: amber-bg (rgba(239,159,39,0.11))
  color: amber-400
  border-left: 2px solid amber-400
  border-radius: 0 6px 6px 0  (pas d'arrondi à gauche !)
  padding-left: 10px (compense la border de 2px)
```

### NotificationBadge

```
Taille : 7px × 7px, border-radius: 9999px
Couleur : amber-400
Position : absolute, top-1.5 right-1.5 dans l'icône parente
Ring pulsant : scale [1→1.8→1], opacity [0.4→0→0.4], 2.5s, Infinity
```

### Avatar Citoyen

```
Taille : 46px × 46px, border-radius: 9999px
Border : 1.5px solid rgba(239,159,39,0.4)
Background : rgba(239,159,39,0.11)
Contenu : initiales (2 lettres), 14px, amber-400, font-weight 500

Fallback couleur (si pas d'image) :
  hue = hash(display_name) % 60  // spectre 0–60° (rouge → jaune chaud)
  background: hsl(hue, 45%, 28%)
```

### Blocs métriques (Stats contemplatives)

```
Background : rgba(255,255,255,0.04)
Border-radius : 6px
Padding : 11px 13px

Valeur principale :
  font-size: 21px, font-weight: 500, line-height: 1
  Couleur amber-400 si métrique "positive/active", text-primary sinon

Label :
  font-size: 10px, color: text-muted
```

### Notification item

```
Structure : dot + texte + temps
Dot non lu : 8px, amber-400
Dot lu : rgba(255,252,245,0.20)
Séparateur : border-bottom 0.5px solid rgba(255,255,255,0.06)
Nom acteur : text-primary, font-weight 500
Texte : text-secondary, font-size 12.5px, line-height 1.5
Temps : font-size 10px, text-muted, margin-top 2px
```

### Section header (page)

```
Breadcrumb : font-size 10px, ALL CAPS, tracking .09em, text-muted, margin-bottom 16px
Titre : font-size 15px, font-weight 500, text-primary
Container : padding 20px 22px 0, border-bottom 0.5px solid border
```

### Préférence row

```
Label : font-size 12.5px, text-secondary
Valeur-bouton : font-size 11px, text-secondary
  background: rgba(255,255,255,0.05)
  border: 1px solid rgba(255,255,255,0.08)
  border-radius: 6px, padding: 4px 10px
```

---

## 7. Icônes

Bibliothèque : **Lucide React** — uniquement outline, jamais filled.

| Icône Lucide | Route / Usage |
|-------------|---------------|
| `Map` | La Carte |
| `BookOpen` | Le Journal |
| `Sparkles` | Les Secrets |
| `Scroll` | La Bibliothèque |
| `Users` | Alliances |
| `Bell` | Notifications |
| `CircleUser` | Profil |
| `ChevronRight` | Chevron lock sidebar |
| `Feather` | Type: enluminure |
| `UserPlus` | Type: demande d'alliance |

Tailles sidebar : `18px` collapsed / `16px` expanded
Taille BottomNav : `22px`
StrokeWidth : `2` si actif, `1.5` sinon

---

## 8. Responsive — breakpoints

| Breakpoint | Navigation | Ajustements |
|-----------|-----------|-------------|
| `base` (< 768px) | BottomNav fixe en bas | `padding-bottom: 64px` sur `<main>` |
| `md` (≥ 768px) | Sidebar | BottomNav `display: none` |

Sidebar : `48px` collapsed (default) → `220px` expanded (hover ou locked)

**Safe area iOS :**
```css
padding-bottom: env(safe-area-inset-bottom, 0px);  /* BottomNav */
```

---

## 9. Ombres

```css
--shadow-sm:    0 1px 2px rgba(0,0,0,0.4);
--shadow-md:    0 4px 12px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.3);
--shadow-amber: 0 0 0 1px var(--color-amber-border), 0 0 16px rgba(239,159,39,0.08);
```

Utiliser les ombres avec parcimonie. L'interface vit dans la profondeur des fonds sombres, pas dans les ombres projetées.

---

## 10. Ce qu'on ne fait JAMAIS

```
❌ Streak (nombre de jours consécutifs)
❌ Score ou niveau de progression
❌ Barre de progression vers un objectif
❌ "Bien joué !" ou félicitations gamifiées
❌ Comparaison entre Citoyens
❌ Animation > 300ms ou avec bounce
❌ Gradient (aucun, nulle part)
❌ Glow / neon / shadow colorée
❌ Fond noir pur #000000
❌ Purple, bleu vif, vert vif comme accent
❌ Inter, Roboto, Arial pour l'éditorial
❌ Notification qui s'impose au Citoyen
```
