# Feature : La Carte

Rôle : page d'accueil, atlas interactif des 7 Domaines.

## Composants à créer
- `HexMap.tsx` — grille hexagonale des 7 Domaines
- `DomainTooltip.tsx` — tooltip au survol d'un hexagone
- `ZoneGrise.tsx` — zone non encore explorée par le Citoyen

## Couleurs hexagones
Identiques à `TerritoireAtlas` (voir `src/features/profil/CLAUDE.md`).

## Données
Supabase `GROUP BY domain_id` pour les stats par Domaine.
Fallback IndexedDB (Dexie.js) si offline.
