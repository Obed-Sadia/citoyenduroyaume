# BASILEIA

> App de méditation profonde sur la Parole. Principe : **App-Effacement**.
> Avant tout composant visuel → lire `docs/style-guide.md`.

## Stack
Next.js 16 App Router · TypeScript strict · Tailwind CSS v4 · Framer Motion · Radix/shadcn · Zustand · Supabase · Gemini

## Où tout se trouve
| Besoin | Fichier |
|--------|---------|
| Vision complète | `docs/vision.md` |
| Design tokens / règles visuelles | `docs/style-guide.md` |
| Nav (Sidebar, BottomNav) | `src/features/nav/CLAUDE.md` |
| Profil & stats contemplatives | `src/features/profil/CLAUDE.md` |
| État courant du projet | `STATUS.md` ← **lire à chaque session** |

## Conventions (mémo rapide)
- Composants : `PascalCase.tsx` — un composant par fichier
- Imports : alias `@/` uniquement
- Classes conditionnelles : `cn()` de `@/lib/utils`
- Couleurs : tokens CSS `var(--color-*)` — jamais de valeur hardcodée
- `"use client"` seulement si hooks/animations/events
- Jamais de `useEffect` pour dériver de l'état

## Routes
```
/               La Carte (accueil)
/journal        Le Journal
/secrets        Les Secrets
/bibliotheque   La Bibliothèque
/alliances      Alliances & Tribus
/notifications  Notifications
/profil         Profil & Paramètres
```

## Responsive
- `< 768px` → BottomNav · `pb-16` sur `<main>`
- `≥ 768px` → Sidebar (48px collapsed / 220px expanded)

## Les 7 Domaines
Le Roi · Le Territoire · Les Citoyens · La Constitution · Les Lois · Le Gouvernement · Les Privilèges