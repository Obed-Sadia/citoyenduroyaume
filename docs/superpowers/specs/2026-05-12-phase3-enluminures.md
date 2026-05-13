# Phase 3 — Les Enluminures : Spec

**Date** : 2026-05-12
**Statut** : Approuvé — prêt pour implémentation

---

## Périmètre

Phase 3 couvre la couche sociale complète de BASILEIA :
- **Alliés** — connexions bilatérales 1:1
- **Tribus** — groupes thématiques avec approbation
- **Enluminures** — 4e objet fondamental : annotations sur le Journal d'un Allié

Découpée en deux blocs livrables indépendamment :
- **Bloc 1** : Schema Supabase complet + Alliés
- **Bloc 2** : Tribus + Enluminures (requiert Bloc 1)

---

## Philosophie

Pas de réseau social. Pas de feed global. Pas de compteur de followers.

- Connexions toujours explicites et bilatérales
- Partages jamais automatiques — toujours initiés par le Citoyen
- L'Enluminure n'est pas un like, pas un commentaire — une trace laissée avec intention
- Les Enluminures reçues sont visibles uniquement par l'auteur du Journal

---

## Schema Supabase

### Nouvelles tables

**`allies`**
```sql
id           uuid PRIMARY KEY DEFAULT gen_random_uuid()
requester_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
receiver_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
status       text NOT NULL DEFAULT 'pending' -- 'pending' | 'accepted' | 'rejected'
created_at   timestamptz NOT NULL DEFAULT now()
UNIQUE (requester_id, receiver_id)
```

**`tribes`**
```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
name        text NOT NULL
theme       text NOT NULL
creator_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
invite_code text NOT NULL UNIQUE -- 8 chars alphanumériques
created_at  timestamptz NOT NULL DEFAULT now()
```

**`tribe_members`**
```sql
id        uuid PRIMARY KEY DEFAULT gen_random_uuid()
tribe_id  uuid NOT NULL REFERENCES tribes(id) ON DELETE CASCADE
user_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
role      text NOT NULL DEFAULT 'member' -- 'admin' | 'member'
status    text NOT NULL DEFAULT 'pending' -- 'pending' | 'member'
joined_at timestamptz NOT NULL DEFAULT now()
UNIQUE (tribe_id, user_id)
```

**`enluminures`**
```sql
id                   uuid PRIMARY KEY DEFAULT gen_random_uuid()
note_id              uuid NOT NULL REFERENCES notes(id) ON DELETE CASCADE
author_id            uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
type                 text NOT NULL -- 'text' | 'verse'
highlighted_passage  text CHECK (char_length(highlighted_passage) <= 300) -- extrait du Journal sélectionné (nullable)
content              text NOT NULL -- texte ≤50 chars OU référence verset (ex: "Jean 3:16")
verse_text           text -- si type='verse', texte complet du verset (nullable)
created_at           timestamptz NOT NULL DEFAULT now()
```

### Modifications tables existantes

**`notes`** — ajouter :
```sql
visibility  text NOT NULL DEFAULT 'private' -- 'private' | 'allies' | 'tribe'
tribe_id    uuid REFERENCES tribes(id) ON DELETE SET NULL -- nullable
```

**`profiles`** — ajouter :
```sql
short_code  text UNIQUE -- 6 chars alphanumériques, généré à la création du compte
```

### RLS
- `allies` : un Citoyen voit seulement les lignes où il est `requester_id` ou `receiver_id`
- `tribes` : membres voient la Tribu ; non-membres voient uniquement nom + thème via invite_code
- `tribe_members` : membres voient les autres membres de leurs Tribus
- `enluminures` : seul l'auteur du Journal (`notes.user_id`) voit les Enluminures reçues + l'auteur de l'Enluminure voit les siennes
- `notes` (visibility) : `allies` → lisible par les Alliés acceptés ; `tribe` → lisible par les membres de la Tribu

---

## Bloc 1 — Alliés

### Flux connexion

1. Le Citoyen voit son `short_code` dans `/profil` + bouton "Copier mon lien d'invitation"
2. L'autre Citoyen saisit le code dans `/alliances` → demande créée (`status: 'pending'`)
3. Le destinataire voit la demande dans l'onglet "Demandes" → Accepter / Refuser
4. Connexion bilatérale : `status: 'accepted'`

Le lien d'invitation = `https://basileia.app/invite/[short_code]` — ouvre directement la demande pré-remplie.

### Page `/alliances`

Trois onglets :
- **Mes Alliés** — liste `AlliesList.tsx`
- **Mes Tribus** — liste `TribeList.tsx` *(Bloc 2)*
- **Demandes** — badge si pending, `AllyRequest.tsx` + `TribeMemberList.tsx` admin

### Visibilité Journal (Bloc 1)

Dans `JournalEditor.tsx` — icône discrète (pas de barre visible par défaut, cohérent App-Effacement) :
- `Privé` (défaut)
- `Alliés` → `visibility: 'allies'`

Les Journals `visibility: 'allies'` sont accessibles via `AllyCard` → tap → ouvre une vue détail Allié avec la liste de ses Journals partagés (`AllyJournalFeed.tsx`). Pas de feed global.

### Composants Bloc 1

| Composant | Rôle |
|-----------|------|
| `InviteBlock.tsx` | Code court + bouton copier lien (dans `/profil`) |
| `ConnectForm.tsx` | Champ saisie code court + soumettre |
| `AllyRequest.tsx` | Carte demande entrante — Accepter / Refuser |
| `AllyCard.tsx` | Avatar initiales + nom + TerritoireAtlas miniature + stats |
| `AlliesList.tsx` | Liste Alliés acceptés |
| `AllyJournalFeed.tsx` | Vue détail Allié — liste ses Journals partagés |

---

## Bloc 2 — Tribus + Enluminures

### Flux Tribu

1. Citoyen crée une Tribu (nom + thème) → `invite_code` généré (8 chars)
2. Lien partageable : `https://basileia.app/tribu/[invite_code]`
3. Nouveau Citoyen ouvre le lien → page aperçu Tribu → "Demander à rejoindre" → `status: 'pending'`
4. Admin approuve dans "Demandes" → `status: 'member'`

### Visibilité Journal (Bloc 2)

Toggle dans `JournalEditor.tsx` étendu à trois états :
- `Privé` → `Alliés` → `Tribu [sélectionner]`
- Sélectionner "Tribu" ouvre un picker parmi les Tribus du Citoyen

### Flux Enluminure

Un Journal partagé (via Alliés ou Tribu) affiche un bouton discret en bas.

**Mode texte** : sélection d'un passage → zone ≤50 chars → soumettre
**Mode verset** : référence (ex: "Jean 3:16") + texte du verset → soumettre

Les Enluminures reçues sont affichées en marge du Journal de l'auteur uniquement — en Cormorant Garamond italique, avec le nom de l'Allié. Jamais publiques, jamais comptabilisées dans les stats.

### Composants Bloc 2

| Composant | Rôle |
|-----------|------|
| `TribeCard.tsx` | Nom + thème + nb membres + rôle (admin/membre) |
| `TribeCreateForm.tsx` | Formulaire nom + thème |
| `TribeMemberList.tsx` | Liste membres + demandes pending (admin seulement) |
| `TribeJournalFeed.tsx` | Journals publiés dans la Tribu avec Enluminures |
| `EnluminureComposer.tsx` | Switcher mode texte / mode verset |
| `EnluminureMargin.tsx` | Affichage en marge (auteur seulement) |
| `EnluminureBadge.tsx` | Indicateur discret sur `JournalCard` (auteur seulement) |

---

## Notifications (fusionnées dans `/alliances`)

Pas de notifications push — cohérent avec "pas de notifications qui interrompent."

Badge sur l'icône Alliances dans `BottomNav` (via `useNavStore.unreadCount`) si :
- Nouvelle demande d'alliance pending
- Nouvelle Enluminure reçue
- Nouvelle demande d'adhésion à une Tribu (admin)

Le Citoyen ouvre l'app quand il est prêt — pas l'inverse.

---

## Contraintes design (App-Effacement)

- Pas de feed global des Journals d'Alliés — on accède via la fiche Allié ou la Tribu
- Pas de compteur d'Enluminures visible publiquement
- Pas de "popularité" — pas de tri par nombre d'Enluminures
- Le toggle de visibilité Journal est discret — pas dans la toolbar principale
- Une Enluminure n'a pas de réponse possible — trace unique, intentionnelle

---

## Hors périmètre Phase 3

- Recherche sémantique entre Journals d'Alliés (Gemini embeddings — Phase 4)
- "Ponts lumineux" entre Secrets similaires (Phase 4)
- Stats TerritoireAtlas partagées avec Alliés (configurable en Phase 3 mais affichage Phase 4)
- Notifications push web (hors philosophie BASILEIA)
