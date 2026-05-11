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

---

# === Système de mémoire de session (KIT-MEMOIRE) ===

# Mémoire de Session — Guide Agent

## INSTRUCTION

Tu travailles dans un projet équipé d'un système de mémoire de session.
Ce système résout l'amnésie entre les sessions : quand l'utilisateur fait `/clear`, le contexte n'est pas perdu — il est archivé et rechargeable en 30 secondes.

**Ton rôle :**
- En début de session : charger le contexte via `/recall`
- En cours de session : travailler normalement
- En fin de session : archiver via `/archive` avant tout `/clear`

Ce comportement n'est pas optionnel. Sans archive, le contexte est perdu définitivement.

## CONNAISSANCE

### Où vit la mémoire

Tout le contexte de session est stocké dans le dossier `memory/` à la racine de ce projet.

```
memory/
├── _index.md                    # Catalogue de toutes les sessions
├── archives/                    # Une archive par session (immuable)
│   └── YYYY-MM-DD-HHhMM-{projet}-{resume}.md
└── projets/                     # Un dossier par projet
    └── {nom}/
        ├── contexte.md          # Snapshot mutable — toujours à jour
        └── historique.md        # Fil chronologique des sessions
```

### Le fichier contexte.md

C'est le fichier le plus important pour les performances.
- Il contient l'état courant du projet (~25 lignes)
- `/recall` le lit EN PRIORITÉ avant de consulter les archives (~70 lignes)
- Il est écrasé à chaque `/archive` — pas d'accumulation
- Résultat : la reprise de session consomme 2x moins de tokens

### Format d'une archive

```markdown
---
date: YYYY-MM-DD
heure: "HH:MM"
projet: {nom}
phase: {description courte}
tags: [projet/{nom}, type/archive]
---

# Session YYYY-MM-DD HHhMM — {Projet} {Resume}

## Resume
[2-3 phrases : objectif de la session + résultat livré]

## Travail effectue
- {action concrète avec chemins si pertinent}

## Decisions
- **{Decision}** : {raison}

## Etat du projet
- Phase actuelle : {phase}
- Valide : {éléments terminés}
- En cours : {éléments en cours}

## Prochaines etapes
1. {étape 1}
2. {étape 2}

## Fichiers modifies
- `{chemin}` — {créé|modifié|supprimé}

## Assets (URLs)
{URLs des fichiers générés, ou "Aucun."}
```

### Format du contexte.md

```markdown
---
projet: {nom}
phase: {phase actuelle}
derniere-session: YYYY-MM-DD
tags: [projet/{nom}]
---

# {Projet} — Contexte actif

## Etat courant
- Phase : {phase actuelle}
- Valide : {éléments terminés}
- En cours : {éléments en cours}

## Decisions cumulees
- {décision 1} — {raison}

## Prochaines etapes
1. {étape 1}
2. {étape 2}

## Assets actifs (URLs)
{URLs validées les plus récentes uniquement}
```

## ACTION

### Commandes disponibles

| Commande | Quand | Ce que Claude fait |
|---|---|---|
| `/archive` | Avant chaque `/clear` | Résume la session, écrit les fichiers, confirme que le clear est safe |
| `/recall` | Début de session ou après `/clear` | Charge le contexte, affiche le briefing, propose la suite |
| `/recall {projet}` | Si plusieurs projets | Charge directement le projet nommé |

### Cycle standard

```
Nouvelle session
  └─ /recall {projet}       → briefing en 30 secondes

Travail
  └─ Claude exécute, vous supervisez

Fin de session
  └─ /archive               → contexte sauvegardé
  └─ /clear                 → session propre, mémoire intacte
```

### Si aucune archive n'existe encore

Au premier `/recall`, répondre :
```
Aucune session trouvée pour ce projet.
Mémoire initialisée — memory/_index.md est prêt.
Décris ce sur quoi tu travailles et on commence.
```

Créer `memory/_index.md` s'il n'existe pas (avec le template vide).

