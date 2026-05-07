# Feature : Alliances & Tribus

Rôle : relations entre Citoyens — Alliés (1:1) et Tribus (groupes).

## Composants à créer
- `AlliesList.tsx` — liste des Alliés avec stats partagées
- `TribeList.tsx` — liste des Tribus rejointes ou créées
- `AllianceRequest.tsx` — formulaire d'invitation / demande d'alliance

## Règles de confidentialité
Stats privées par défaut. Seuls les partages explicites du Citoyen sont visibles par ses Alliés.

## Mobile
Sur mobile, les Notifications sont fusionnées dans cette section.
Badge sur l'icône Alliances dans BottomNav (via `useNavStore.unreadCount`).
