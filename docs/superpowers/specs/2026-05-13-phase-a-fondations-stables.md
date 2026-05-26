# Phase A — Fondations stables

**Date :** 2026-05-13
**Projet :** BASILEIA (Citoyen du Royaume)
**Statut :** Approuvé

---

## Objectif

Corriger les bugs critiques de la Phase 3 avant d'avancer vers le profil complet :
1. Auth instable (magic link → OTP)
2. Données partagées entre comptes (IndexedDB non isolée par userId)
3. Logout non fonctionnel
4. `getSession()` non sécurisé dans sync.ts

---

## Section 1 — Auth OTP

### Problème
Le magic link Supabase est instable : il dépend du navigateur qui ouvre l'email, expire rapidement, et le PKCE échoue si le contexte navigateur change. De plus, plusieurs comptes sur le même navigateur peuvent se retrouver avec la même session.

### Solution : OTP à 6 chiffres

Flow en 2 écrans :

```
/login
  → LoginForm : champ email + bouton "Envoyer le code"
  → supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } })
  → redirect vers /login/verify?email=<email>

/login/verify
  → OtpForm : input 6 chiffres + bouton "Vérifier"
  → supabase.auth.verifyOtp({ email, token, type: 'email' })
  → session créée directement (pas de callback route)
  → initDb(userId) + charger stores → redirect /
```

### Composants

**`src/app/(auth)/login/LoginForm.tsx`** — modifier
- Supprimer l'appel magic link
- Appeler `signInWithOtp({ email })`
- En succès : `router.push('/login/verify?email=' + encodeURIComponent(email))`
- Gestion d'erreur : message visible si email invalide ou rate limit

**`src/app/(auth)/login/verify/page.tsx`** — nouveau
- Page Server Component, passe `email` depuis `searchParams` à `OtpForm`
- Si pas d'email dans les params → redirect `/login`

**`src/features/auth/OtpForm.tsx`** — nouveau
- Input 6 chiffres (type="number" ou 6 inputs séparés — à décider visuellement)
- Appelle `verifyOtp({ email, token, type: 'email' })`
- En succès : `initDb(userId)` + `loadFromDb()` sur tous les stores + `router.push('/')`
- Bouton "Renvoyer" désactivé 60s après l'envoi initial (compte à rebours visible)
- Erreur affichée si code invalide ou expiré

### Callback route
`src/app/auth/callback/route.ts` reste intact — non utilisé par ce flow mais peut servir plus tard (OAuth).

---

## Section 2 — Isolation Dexie par userId

### Problème
`basileia.db.ts` crée une DB avec le nom fixe `'basileia'`. Tous les comptes sur le même navigateur partagent la même IndexedDB. Les stores Zustand ne se réinitialisent pas au changement de compte.

### Solution : DB dynamique préfixée par userId

#### `src/lib/db/basileia.db.ts` — modifier

```
Avant : export const db = createDb()   ← singleton module-level
Après : export function initDb(userId: string): void
        export function getDb(): BasileiaDB
        export async function closeDb(): Promise<void>
```

- Nom DB = `basileia_${userId}`
- `initDb` ferme l'instance précédente si elle existe, ouvre la nouvelle
- `getDb` retourne l'instance courante, throw si non initialisée
- `closeDb` ferme et déréférence l'instance

#### Repos — modifier (×3)

`notes.repo.ts`, `secrets.repo.ts`, `verses.repo.ts` : remplacer `db.notes` / `db.secrets` / `db.verses` par `getDb().notes` etc.

#### `src/features/auth/AuthProvider.tsx` — nouveau

Composant client, placé dans `src/app/(main)/layout.tsx`.

Responsabilités :
- Au mount : `supabase.auth.getUser()` → si user connecté → `initDb(user.id)` → `loadFromDb()` sur tous les stores
- Sur `onAuthStateChange('SIGNED_IN')` : idem
- Sur `onAuthStateChange('SIGNED_OUT')` : `closeDb()` + reset stores + `router.push('/login')`

Cela garantit que la DB est toujours initialisée avant que les pages enfants n'essaient de lire les stores.

---

## Section 3 — Logout fonctionnel

### Problème
Le bouton "Déconnecter" dans `profil/page.tsx` est un `<button>` HTML sans handler. L'utilisateur ne peut pas se déconnecter.

### Solution : LogoutButton client component

**`src/features/profil/LogoutButton.tsx`** — nouveau
- `"use client"`
- Au clic :
  1. `supabase.auth.signOut()`
  2. `closeDb()`
  3. `useNotesStore.getState().reset()`
  4. `useSecretsStore.getState().reset()`
  5. `useVersesStore.getState().reset()`
  6. `router.push('/login')`
- État de chargement pendant la déconnexion (bouton désactivé)

**`src/app/(main)/profil/page.tsx`** — modifier
- Remplacer `<button>Déconnecter</button>` par `<LogoutButton />`

#### Stores — ajouter action `reset()` (×3)

`notes.store.ts`, `secrets.store.ts`, `verses.store.ts` :
```ts
reset: () => set({ notes: [], isLoaded: false })
// idem pour secrets et verses
```

---

## Section 4 — Fix sécurité sync.ts

### Problème
`getUserId()` dans `sync.ts` appelle `getSession()` qui retourne la session depuis le cache local sans validation serveur. Une session expirée ou manipulée peut passer.

### Solution
Remplacer `supabase.auth.getSession()` par `supabase.auth.getUser()` dans `sync.ts`.

```ts
// Avant
const { data: { session } } = await supabase.auth.getSession()
return session?.user.id ?? null

// Après
const { data: { user } } = await supabase.auth.getUser()
return user?.id ?? null
```

---

## Récapitulatif des fichiers

| Action | Fichier |
|--------|---------|
| Modifié | `src/app/(auth)/login/LoginForm.tsx` |
| Modifié | `src/lib/db/basileia.db.ts` |
| Modifié | `src/lib/db/notes.repo.ts` |
| Modifié | `src/lib/db/secrets.repo.ts` |
| Modifié | `src/lib/db/verses.repo.ts` |
| Modifié | `src/lib/stores/notes.store.ts` |
| Modifié | `src/lib/stores/secrets.store.ts` |
| Modifié | `src/lib/stores/verses.store.ts` |
| Modifié | `src/lib/supabase/sync.ts` |
| Modifié | `src/app/(main)/profil/page.tsx` |
| Nouveau | `src/app/(auth)/login/verify/page.tsx` |
| Nouveau | `src/features/auth/OtpForm.tsx` |
| Nouveau | `src/features/auth/AuthProvider.tsx` |
| Nouveau | `src/features/profil/LogoutButton.tsx` |

---

## Ordre d'implémentation recommandé

1. `basileia.db.ts` — initDb/getDb/closeDb
2. Repos × 3 — utiliser getDb()
3. Stores × 3 — ajouter reset()
4. `sync.ts` — getSession → getUser
5. `AuthProvider.tsx` — init au boot
6. `(main)/layout.tsx` — monter AuthProvider
7. `LoginForm.tsx` — OTP step 1
8. `login/verify/page.tsx` + `OtpForm.tsx` — OTP step 2
9. `LogoutButton.tsx` — logout
10. `profil/page.tsx` — brancher LogoutButton

---

## Contraintes

- Pas de nouvelles dépendances
- Supabase OTP doit être activé dans le Dashboard (Auth > Providers > Email > Enable OTP)
- `shouldCreateUser: true` — BASILEIA est ouvert à tous, l'OTP crée le compte si l'email n'existe pas encore
- `AuthProvider` doit être client mais ses enfants restent Server Components
