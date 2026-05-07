# Feature : Navigation

## Composants
| Fichier | Rôle |
|---------|------|
| `Sidebar.tsx` | Navigation desktop — collapsed 48px / expanded 220px |
| `BottomNav.tsx` | Navigation mobile — 5 items fixes, position fixed |
| `NavItem.tsx` | Item réutilisable — utilisé par Sidebar uniquement |
| `NotificationBadge.tsx` | Dot ambre pulsant — consomme `useNavStore` |

---

## Comportement Sidebar

```
Hover souris  → isHovered = true  → expanded temporaire
Click chevron → toggleLock()      → isLocked basculé (persisté)

expanded = isLocked || isHovered
```

Animation width via Framer Motion :
```
48px → 220px
ease: [0.16, 1, 0.3, 1]
duration: 0.2
```

---

## État — `nav.store.ts`

```typescript
isLocked:     boolean   // sidebar verrouillée — PERSISTÉ localStorage
unreadCount:  number    // non lues — NON PERSISTÉ, rechargé depuis Supabase

toggleLock()            // verrou sidebar
setUnreadCount(n)       // appelé par hook Supabase Realtime
clearUnread()           // appelé à l'ouverture de /notifications
```

---

## Structure sidebar (haut → bas)

```
[Logo B · BASILEIA]      ← lien vers /
─────────────────────
La Carte        /
Le Journal      /journal
Les Secrets     /secrets
La Bibliothèque /bibliotheque
Alliances       /alliances
Notifications   /notifications   ← Bell + badge si unreadCount > 0
─────────────────────
Profil          /profil           ← toujours en bas (flex-shrink-0)
```

---

## Matching route active

```typescript
// "/" → exact match uniquement
// Autres → pathname.startsWith(href)
const isActive = href === '/'
  ? pathname === '/'
  : pathname.startsWith(href)
```

---

## BottomNav — 5 items

```
Carte · Journal · Secrets · Alliances · Profil
```

Notifications fusionnées dans Alliances sur mobile.
Badge dot ambre sur Alliances si `unreadCount > 0`.
Notifications n'apparaît PAS comme item séparé dans le BottomNav.

---

## Responsive

```
base (< 768px) → Sidebar display:none    BottomNav display:flex
md   (≥ 768px) → Sidebar display:flex   BottomNav display:none
```

`<main>` : `pb-16 md:pb-0` pour éviter que le BottomNav couvre le contenu.

---

## Styles — NavItem actif

```css
/* Sidebar */
background   : rgba(239,159,39,0.11)
color        : #EF9F27
border-left  : 2px solid #EF9F27
border-radius: 0 6px 6px 0    /* pas d'arrondi à gauche */
padding-left : 10px            /* compense la border de 2px */

/* BottomNav */
icon color   : #EF9F27
label        : opacity 1 (sinon opacity 0)
```

---

## Styles — BottomNav

```css
height          : 64px + env(safe-area-inset-bottom)
background      : rgba(10, 9, 7, 0.88)
backdrop-filter : blur(16px)
border-top      : 1px solid rgba(255,255,255,0.07)
position        : fixed; bottom:0; left:0; right:0
z-index         : 50
```

---

## NotificationBadge

```
Taille       : 7×7px, border-radius: 9999px
Couleur      : #EF9F27
Position     : absolute top-1.5 right-1.5 sur l'icône Bell
Ring pulsant : scale [1→1.8→1], opacity [0.4→0→0.4], 2.5s, Infinity
Mount        : spring, stiffness 400, damping 20
```

---

## Icônes Lucide

| Icône | Usage |
|-------|-------|
| `Map` | La Carte |
| `BookOpen` | Le Journal |
| `Sparkles` | Les Secrets |
| `Scroll` | La Bibliothèque |
| `Users` | Alliances |
| `Bell` | Notifications |
| `CircleUser` | Profil |
| `ChevronRight` | Chevron lock sidebar |

Tailles : `18px` collapsed · `16px` expanded · `22px` BottomNav
StrokeWidth : `2` si actif · `1.5` sinon

---

## ⚠️ Pièges

- `overflow-hidden` obligatoire sur `<nav>` — labels débordent sinon
- `Bell` existe SEULEMENT dans la Sidebar, pas dans le BottomNav
- Chevron : `opacity 0` par défaut, visible au hover ou si `isLocked`
- `AnimatePresence` requis pour l'animation exit du label au collapse
- Sidebar : `border-left: 2px` sur item actif → `rounded-l-none` obligatoire
