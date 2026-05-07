# Feature : Profil & Stats Contemplatives

## Philosophie des stats

Les stats de BASILEIA ne mesurent pas la performance.
Elles révèlent la profondeur du voyage intérieur.

```
✗ Streaks       ✗ Scores      ✗ Niveaux
✗ Barres de progression       ✗ Comparaisons entre Citoyens
```

> « Ce n'est pas combien tu as écrit. C'est où tu es allé. »

---

## Structure de la page /profil

```
IDENTITÉ
  Avatar · Nom · "Citoyen depuis [date] · [locale] · [traduction]"
  Bouton Modifier

MON TERRITOIRE INTÉRIEUR
  TerritoireAtlas (SVG 136×202px)   +   Grille MetricBlock (2 colonnes)

PRÉFÉRENCES
  Langue · Traduction biblique · Thème · Police · Taille du texte

COMPTE
  Email masqué · Changer mot de passe · Déconnecter · Supprimer compte
```

---

## Composants

| Fichier | Rôle |
|---------|------|
| `CitizenIdentity.tsx` | Avatar + nom + badge date + bouton Modifier |
| `stats/TerritoireAtlas.tsx` | SVG hexagonal animé (Framer Motion) |
| `stats/MetricBlock.tsx` | Chiffre + label — sobre, pas de barre |
| `PreferencesForm.tsx` | Dropdowns langue / thème / police |

---

## TerritoireAtlas — disposition

7 hexagones pointy-top en losange vertical :

```
        LE ROI
  TERRITOIRE  CITOYENS
CONSTITUTION    LOIS
    GOUVERNEMENT
     PRIVILÈGES
```

### Couleurs par niveau d'exploration

```
Très exploré   → #EF9F27              (ambre)
Bien exploré   → #BA7517
Moyen-fort     → #854F0B
Moyen-faible   → #633806
Peu exploré    → rgba(120,115,110,0.18) + stroke 0.5
Inexploré      → rgba(120,115,110,0.07) + stroke 0.22
```

### Animation Framer Motion

Hexagone actif cette semaine → pulse doux :
```
animate: { opacity: [1, 0.7, 1] }
transition: { repeat: Infinity, duration: 3, ease: 'easeInOut' }
```
Pas de pulse si aucune activité cette semaine.

---

## MetricBlock — métriques

| Métrique | Couleur valeur | Source |
|----------|---------------|--------|
| Journaux | Ambre | `COUNT(notes)` |
| Secrets capturés | Primaire | `COUNT(secrets)` |
| Versets ancrés | Ambre | `COUNT(DISTINCT verse_id)` |
| En profondeur | Primaire | `COUNT(notes WHERE anchored_verse_count >= 3)` |
| Domaine de prédilection | Ambre (texte 14px) | `GROUP BY domain_id ORDER BY COUNT DESC LIMIT 1` |

---

## CitizenIdentity — avatar

```
Taille  : 46×46px · border-radius: 9999px
Border  : 1.5px solid rgba(239,159,39,0.40)
Fond    : rgba(239,159,39,0.11)
Contenu : initiales 2 lettres · 14px · #EF9F27 · font-weight 500
```

Fallback couleur si pas d'image :
```typescript
// Spectre 0–60° (rouge → jaune chaud) — jamais criard
const hue = Math.abs(hash(displayName) % 60)
background: `hsl(${hue}, 45%, 28%)`
```

---

## PreferencesForm — dropdowns

| Label | Options |
|-------|---------|
| Langue | Français · English · Português · Español |
| Traduction biblique | LSG · NEG · NBS · KJV · NVI |
| Thème | Sombre · Clair · Système |
| Police éditoriale | Cormorant · DM Sans · Literata |

Style des boutons-dropdown :
```css
font-size  : 11px
color      : var(--color-text-secondary)
background : rgba(255,255,255,0.05)
border     : 1px solid rgba(255,255,255,0.08)
border-radius : 6px
padding    : 4px 10px
```

---

## Schéma Supabase — `citizen_profiles`

```sql
id                UUID PRIMARY KEY REFERENCES auth.users(id)
display_name      TEXT NOT NULL          -- 1 à 60 caractères
avatar_url        TEXT                   -- nullable, URL Supabase Storage
locale            TEXT DEFAULT 'fr'      -- 'fr'|'en'|'pt'|'es'
bible_translation TEXT DEFAULT 'LSG'
preferences       JSONB DEFAULT '{}'
created_at        TIMESTAMPTZ
updated_at        TIMESTAMPTZ
```

RLS activé — chaque Citoyen lit et modifie uniquement son propre profil.

---

## Store — `profil.store.ts`

```typescript
// Persisté localStorage + sync Supabase
theme             : 'dark' | 'light' | 'system'   // défaut: 'dark'
editor_font       : 'cormorant' | 'dm-sans' | 'literata'
font_size         : 'sm' | 'md' | 'lg'
bible_translation : string                          // défaut: 'LSG'
locale            : string                          // défaut: 'fr'
```

---

## Visibilité des stats

Privées par défaut.
Option dans Préférences : "Partager mon Territoire avec mes Alliés" (toggle).
En offline : stats calculées depuis IndexedDB (comptages locaux).

---

## ⚠️ Pièges

- Jamais de barre de progression vers un objectif
- `TerritoireAtlas` : les couleurs des hexagones inexploréss ont un fond
  quasi transparent — vérifier le contraste sur fond sombre
- `MetricBlock` valeur ambre = métrique "positive/active" uniquement,
  pas toutes les métriques
- Avatar fallback : la fonction `nameToHsl` doit être déterministe —
  même nom = même couleur à chaque render
