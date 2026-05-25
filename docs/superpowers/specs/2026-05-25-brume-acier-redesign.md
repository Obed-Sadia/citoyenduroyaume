# BASILEIA — Redesign Brume & Acier

**Date :** 2026-05-25  
**Statut :** Validé en brainstorm — prêt pour implémentation  
**Scope :** Refonte complète du design system + layout de toutes les pages

---

## 1. Contexte & motivation

L'actuel design (charbon chaud + ambre + Cormorant) manque de cohérence et ne reflète plus la direction souhaitée. L'utilisateur veut une refonte complète vers une esthétique moderne, non-religieuse, sobre et intellectuelle.

---

## 2. Direction : Brume & Acier

**Ambiance :** Gris ardoise froid, bleu acier, blanc brumeux. Minimalisme structuré, sobre et intellectuel. Références : Raycast, Bear app dark, Linear.

**Ce qui change :**
- Palette complète (fonds, surfaces, textes, accent)
- Typographie (Lora + DM Mono remplace Cormorant + DM Sans)
- Layout de toutes les pages (Magazine + Bento)

**Ce qui ne change pas :**
- Logique de navigation (Sidebar md+, BottomNav mobile)
- Easings et durées d'animation (`cubic-bezier(0.16,1,0.3,1)`, max 300ms)
- Structure des routes
- Philosophie App-Effacement

---

## 3. Nouveau Design System

### 3.1 Couleurs

Remplace **intégralement** `src/styles/tokens.css`. Les tokens ambre sont supprimés et remplacés par les tokens saphir.

```css
/* Fonds */
--color-bg-base:     #131517;   /* fond principal */
--color-bg-surface:  #181c1f;   /* sidebar, panels */
--color-bg-elevated: #1d2226;   /* modales, bento cards */
--color-bg-hover:    rgba(180,195,210,0.04);
--color-bg-active:   rgba(107,159,212,0.08);

/* Texte (bleuté froid — jamais blanc pur) */
--color-text-primary:   rgba(205,218,228,0.93);
--color-text-secondary: rgba(165,185,200,0.62);
--color-text-muted:     rgba(140,165,185,0.36);
--color-text-disabled:  rgba(140,165,185,0.18);
--color-text-accent:    #6B9FD4;

/* Accent : Saphir (remplace Ambre) */
--color-accent:        #6B9FD4;
--color-accent-light:  #8BBAE0;
--color-accent-dark:   #4A80B8;
--color-accent-bg:     rgba(107,159,212,0.08);
--color-accent-border: rgba(107,159,212,0.20);

/* Bordures */
--color-border:        rgba(180,195,210,0.08);
--color-border-mid:    rgba(180,195,210,0.13);
--color-border-subtle: rgba(180,195,210,0.05);

/* Ombres */
--shadow-sm: 0 1px 2px rgba(0,0,0,0.5);
--shadow-md: 0 4px 12px rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,0.4);
```

**Règle fondamentale :** `--color-accent` (#6B9FD4 saphir) est le seul accent. Aucune autre couleur vive. Pas d'ambre, pas de vert, pas de rouge.

### 3.2 Typographie

Remplace les imports de fonts dans `src/app/layout.tsx` et `@theme {}` dans `globals.css`.

| Famille | Usage | Caractéristiques |
|---------|-------|-----------------|
| **Lora** | Versets (italic), titres de pages, titres de notes | `font-style: italic` pour contenu, `font-weight: 500` pour titres |
| **DM Mono** | Toute l'UI : labels, références bibliques, timestamps, badges, boutons, placeholders | `letter-spacing` adapté selon contexte |

**Supprimé :** Cormorant Garamond, DM Sans.

```css
/* globals.css — @theme */
@theme {
  --font-family-sans:     'DM Mono', monospace;
  --font-family-editorial:'Lora', Georgia, serif;
}
```

**Échelle typographique :**

| Taille | Poids | Police | Usage |
|--------|-------|--------|-------|
| `20–22px` | `500` | Lora | Titre de page (hero) |
| `15–17px` | `500` | Lora | Titre de note/entrée dans le feed |
| `13–15px` | `400 italic` | Lora | Versets, corps éditorial |
| `12px` | `400` | Lora | Excerpt de note |
| `11px` | `400` | DM Mono | Corps UI, capture input |
| `10px` | `500` | DM Mono | Tabs, labels de section |
| `9px` | `400` | DM Mono | Références bibliques, dates, badges |
| `8px` | `400` | DM Mono | Colonnes de table, labels de stat-card |

**Labels de section :** `font-size: 9–10px · letter-spacing: .12–.14em · text-transform: uppercase · color: --color-accent (opacity 0.65)`

### 3.3 Rayons de bords

| Contexte | Valeur |
|----------|--------|
| Bento cards, feed entries | `8px` |
| Boutons, badges, pills | `5–7px` |
| Logo mark sidebar | `6px` |
| Badges domaine | `3–4px` |
| Nav items sidebar | `7px` |
| Avatars | `9999px` |

---

## 4. Layout Pattern : Magazine + Bento

Toutes les pages principales suivent ce pattern vertical en 4 zones :

```
┌─────────────────────────────────────┐
│  HERO                               │  ← flex-shrink: 0
│  Label · Titre (Lora 20px) · Stats  │
├─────────────────────────────────────┤
│  BENTO GRID                         │  ← flex-shrink: 0
│  [wide accent card] [stat] [stat]   │
├─────────────────────────────────────┤
│  TABS (optionnel)                   │  ← flex-shrink: 0
├─────────────────────────────────────┤
│  FEED / LISTE                       │  ← flex: 1, overflow-y: auto
│  Entrées compactes                  │
├─────────────────────────────────────┤
│  CAPTURE BAR (si applicable)        │  ← flex-shrink: 0
└─────────────────────────────────────┘
```

### 4.1 Zone Hero

```
padding: 22px 26px 20px
border-bottom: 1px solid var(--color-border)

Structure :
  hero-label    → DM Mono 9px · UPPERCASE · letter-spacing .14em · accent · opacity .65
  hero-title    → Lora 20-22px · font-weight 500 · text-primary
  hero-subtitle → Lora italic 14px · text-secondary (optionnel, seulement si pertinent)
  hero-stats    → flex row, stat-pills à droite (voir §4.4)
```

### 4.2 Bento Grid

```
padding: 16px 26px
border-bottom: 1px solid var(--color-border)
display: grid
grid-template-columns: repeat(3–4, 1fr)
gap: 8px

Bento card (.bc) :
  background: var(--color-bg-surface)
  border: 1px solid var(--color-border)
  border-radius: 8px
  padding: 12px 14px
  hover → border-color: var(--color-border-mid), background: var(--color-bg-elevated)

Wide accent card (.bc.accent.wide) — toujours présente :
  grid-column: span 2
  background: var(--color-accent-bg)
  border-color: var(--color-accent-border)
  Contient le contenu le plus récent / mis en avant

Stat card (.bc) :
  bc-lbl  → DM Mono 8px · UPPERCASE · text-muted
  bc-val  → DM Mono 20px · font-weight 400 · color accent
  bc-sub  → DM Mono 9px · text-muted
```

### 4.3 Feed / Liste

```
padding: 4px 26px 20px
overflow-y: auto

feed-header :
  DM Mono 9px · UPPERCASE · text-muted  /  "Tout voir →" accent .6 opacity

entry (.entry) :
  padding: 13px 0
  border-bottom: 1px solid var(--color-border-subtle)
  display: flex · gap: 14px
  hover → opacity: .85

  entry-title   → Lora 14-15px · font-weight 500 · text-primary
  entry-verse   → Lora italic 13px · text-secondary (pour versets)
  entry-excerpt → DM Mono 10px · text-secondary · -webkit-line-clamp: 2
  entry-meta    → flex row · gap 8px
    entry-ref    → DM Mono 9px · accent · opacity .65
    entry-domain → DM Mono 8px · UPPERCASE · text-muted
    entry-date   → DM Mono 8px · text-muted · margin-left auto
    entry-tag    → DM Mono 8px · padding 2px 7px · border-radius 3px
                   default: border var(--color-border-mid) · text-muted
                   .hi: border accent-border · bg accent-bg · color accent
  entry-arrow   → "›" · text-muted · opacity .5 · flex-shrink 0
```

### 4.4 Stat Pills (hero)

```
.stat-pill :
  display: flex · flex-direction: column · align-items: flex-end
  padding: 8px 12px
  border-radius: 7px
  background: var(--color-bg-surface)
  border: 1px solid var(--color-border)
  min-width: 60px

  stat-val → DM Mono 18px · font-weight 400 · color accent · line-height 1
  stat-lbl → DM Mono 8px · UPPERCASE · letter-spacing .08em · text-muted
```

### 4.5 Capture Bar

```
padding: 12px 26px
border-top: 1px solid var(--color-border)
background: var(--color-bg-surface)

cap-wrap :
  display: flex · align-items: center · gap: 10px
  background: var(--color-bg-base)
  border: 1px solid var(--color-border-mid)
  border-radius: 7px · padding: 9px 14px
  focus-within → border-color: var(--color-accent-border)

  cap-ref   → DM Mono 9px · text-muted (référence biblique)
  cap-div   → 1px · height 12px · color-border-mid
  cap-input → Lora italic 12px · text-secondary · placeholder text-muted
  cap-btn   → DM Mono 8px · UPPERCASE · padding 5px 12px · border-radius 5px
              border accent-border · bg accent-bg · color accent
```

### 4.6 Tabs (optionnel)

```
display: flex · padding: 0 26px
border-bottom: 1px solid var(--color-border)

.tab :
  DM Mono 9px · UPPERCASE · letter-spacing .1em
  padding: 11px 14px
  color: text-muted · border-bottom: 2px solid transparent
  .on → color: accent · border-bottom-color: accent
```

---

## 5. Sidebar redesign

```
width: 50px (collapsed) / 220px (expanded)
background: var(--color-bg-surface)
border-right: 1px solid var(--color-border)

Logo mark :
  30×30px · border-radius: 6px
  border: 1px solid var(--color-accent-border)
  background: var(--color-accent-bg)
  Lora 14px · font-weight 500 · color accent
  Lettre "B" (pas d'icône SVG complexe)

Nav item (.nav) :
  34×34px · border-radius: 7px
  border: 1px solid transparent
  default → color: text-muted
  hover   → color: text-secondary · bg rgba(180,195,210,0.04)
  .on     → color: accent · bg accent-bg · border: accent-border

Icônes : 15px · stroke-width 1.5 (default) · 2 (active)
```

---

## 6. Spécifications par page

### La Carte (accueil)
- **Hero :** "Ton Territoire" + stat pills (Versets, Notes, Domaines x/7)
- **Bento :** Wide card = domaine le plus actif (nom + hex-row niveau) + 4 cards domaines restants + 1 card verset récent
- **Feed :** Activité récente (5 derniers items mixés : notes, versets, secrets)
- HexMap SVG existant → **remplacé** par les bento cards domaines (le bento suffit pour l'overview territoire). La page `/domaines/[id]` reste accessible via clic sur une bento card domaine.

### Le Journal
- **Hero :** "Notes de méditation" + stats (total notes, ce mois)
- **Bento :** Wide = dernière note (titre + excerpt + badge domaine) + stat cards (domaine le + noté, durée moy., mots écrits)
- **Feed :** Toutes les notes — entry-title (Lora) + entry-excerpt (DM Mono) + badge domaine + date
- **Capture :** Input DM Mono normal (pas italic) + bouton "Écrire"

### Les Secrets
- **Hero :** "Fulgurances" + description + stats (total, ce mois)
- **Bento :** Wide = dernier secret (texte Lora italic) + stat cards par domaine top 2
- **Feed :** secret-entry → texte Lora italic + meta (badge domaine + date)
- **Capture :** Input Lora italic + bouton "◈ Domaine"

### La Bibliothèque
- **Hero :** "Versets ancrés" + stats (total versets, nb domaines)
- **Bento :** Wide = verset mis en avant (texte + ref + domaine) + stat cards par domaine (top 3)
- **Tabs :** Tous · puis un tab par domaine (scroll horizontal si besoin)
- **Feed :** entry-verse (Lora italic) + entry-ref + entry-domain + entry-date
- **Capture :** Champ réf. + divider + input verset Lora italic + bouton "Ancrer"

### Alliances
- **Hero :** "Tes Alliés" + stats (nb alliés, en attente)
- **Bento :** Wide = allié le plus actif + cards alliés (2-3 max)
- **Feed :** Demandes en attente + activité alliance récente

### /domaines/[id] (Domaine vivant)
- **Hero :** Nom du domaine + hex SVG ambre → **saphir** + stats (versets, notes, niveau)
- **Bento :** Wide = verset ancré phare du domaine + stats compact
- **Tabs :** Notes | Secrets | Versets
- **Feed :** Contenu filtré par onglet

---

## 7. Animations

Aucun changement aux timings. Seules les couleurs des états changent (amber → saphir).

```typescript
// Inchangé
ease: [0.16, 1, 0.3, 1]
duration: 150–300ms max
```

Stagger bento cards au mount : `delay = index * 40ms`, `opacity 0→1 + y 8→0`.

---

## 8. Fichiers impactés

| Fichier | Type de changement |
|---------|-------------------|
| `src/styles/tokens.css` | Refonte complète palette |
| `src/styles/globals.css` | Mise à jour @theme fonts |
| `src/app/layout.tsx` | Remplacement imports Google Fonts |
| `src/features/nav/Sidebar.tsx` | Nouveau logo mark + nav items |
| `src/features/nav/BottomNav.tsx` | Couleurs saphir |
| `src/features/nav/NavItem.tsx` | Couleurs saphir |
| `src/app/(main)/page.tsx` | Layout Magazine + Bento |
| `src/app/(main)/journal/page.tsx` | Layout Magazine + Bento |
| `src/app/(main)/secrets/page.tsx` | Layout Magazine + Bento |
| `src/app/(main)/bibliotheque/page.tsx` | Layout Magazine + Bento |
| `src/app/(main)/alliances/page.tsx` | Layout Magazine + Bento |
| `src/features/carte/DomaineHeader.tsx` | Couleurs saphir |
| `src/features/carte/DomaineContent.tsx` | Layout bento + tabs |
| `src/features/carte/DomainTooltip.tsx` | Couleurs saphir |
| `src/features/journal/JournalCard.tsx` | Nouveau style entry |
| `src/features/bibliotheque/VerseCard.tsx` | Nouveau style entry |
| `src/features/secrets/SecretCard.tsx` | Nouveau style secret-entry |
| `src/features/secrets/CaptureBar.tsx` | Nouveau style capture |
| `src/features/bibliotheque/VerseCaptureBar.tsx` | Nouveau style capture |
| `src/features/profil/*.tsx` | Couleurs saphir |

---

## 9. Ce qu'on ne fait JAMAIS (inchangé + ajouts)

```
❌ Gradients (aucun, nulle part)
❌ Glow / neon / shadow colorée
❌ Fond noir pur #000000
❌ Couleur ambre EF9F27 (remplacé par saphir 6B9FD4)
❌ Inter, Roboto, Arial, DM Sans pour l'éditorial
❌ Animation > 300ms ou avec bounce
❌ Gamification (streaks, scores, félicitations)
❌ Comparaison entre Citoyens
```
