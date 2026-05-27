# Spec — Lecteur Bible + Insertion Journal

**Date** : 2026-05-26  
**Projet** : BASILEIA (Citoyen du Royaume)  
**Statut** : validé, prêt pour implémentation

---

## Objectif

Deux features liées :
1. **Lecteur Bible global** — consulter la Bible (multi-versions) depuis n'importe quelle page via un drawer latéral
2. **Insertion dans le Journal** — insérer un verset directement au curseur depuis l'éditeur Tiptap

---

## Architecture

### Source de données Bible

API : **api.bible** (American Bible Society — `scripture.api.bible`)  
- Gratuit, clé API requise (variable d'env `BIBLE_API_KEY`)  
- Traductions françaises supportées : LSG 1910, NEG 1979, TOB, Semeur  
- Traductions anglaises : ESV, NIV, KJV  
- Endpoints utilisés :
  - `GET /bibles` — liste des versions disponibles
  - `GET /bibles/{bibleId}/search?query=Jean+3:16` — recherche par référence ou mot-clé
  - `GET /bibles/{bibleId}/books` — liste des livres
  - `GET /bibles/{bibleId}/chapters/{chapterId}` — contenu d'un chapitre avec versets

Wrapper serveur : `src/lib/bible/bible-api.ts` — toutes les requêtes passent par une Server Action pour ne pas exposer la clé API côté client.

### Préférence version

La colonne `bible_translation` existe déjà dans `citizen_profiles`.  
- Valeur par défaut : `"LSG"` (Louis Segond 1910)  
- Modifiée depuis le drawer Bible ET depuis `/profil` → Préférences  
- Persistée via `updateProfile()` existant (Server Action)  
- En attendant la sync, stockée en Zustand (`useBibleStore`)

---

## Composants

### `BibleDrawer` — `src/features/bible/BibleDrawer.tsx`

Drawer latéral accessible depuis toute l'app.

**Props :**
```ts
interface BibleDrawerProps {
  open: boolean
  onClose: () => void
  mode: 'read' | 'insert'           // 'insert' = depuis Journal
  onInsert?: (text: string, reference: string) => void  // callback insertion
}
```

**Structure interne :**
- Header : label "Bible" + sélecteur version + bouton fermer
- Barre de recherche : référence (ex : "Jean 3:16") ou mot-clé, debounce 300ms
- Panneau gauche : navigation Livre → Chapitre (liste scrollable)
- Panneau droit : versets du chapitre courant, chaque verset a un bouton contextuel :
  - Mode `'read'` → bouton "Ancrer" (sauvegarde en Bibliothèque via `addVerse()`)
  - Mode `'insert'` → bouton "↳ Insérer" (appelle `onInsert`)

**Responsive :**
- Desktop (≥768px) : slide-in depuis la droite, largeur 45%, overlay semi-transparent à gauche
- Mobile (<768px) : plein écran, bouton ← (retour) en lieu et place du ✕

**Animation :** Framer Motion `x: '100%' → 0`, duration 250ms, ease out.

### `BibleFAB` — `src/features/bible/BibleFAB.tsx`

Bouton flottant 📖, positionné `fixed bottom-[68px] right-4` (au-dessus de la BottomNav sur mobile).  
N'apparaît pas dans l'éditeur Journal — le Journal a son propre bouton.  
Ouvre `BibleDrawer` en mode `'read'`.

### `useBibleStore` — `src/lib/stores/bible.store.ts`

```ts
interface BibleStore {
  isOpen: boolean
  mode: 'read' | 'insert'
  selectedBibleId: string           // ex: 'de4e12af7f28f599-01' (LSG)
  currentBook: string | null
  currentChapter: string | null
  open: (mode: 'read' | 'insert') => void
  close: () => void
  setVersion: (bibleId: string) => void
  setChapter: (book: string, chapter: string) => void
}
```

### `src/lib/bible/bible-api.ts`

Server Actions wrappant api.bible :
```ts
export async function searchBible(bibleId: string, query: string): Promise<Verse[]>
export async function getChapter(bibleId: string, chapterId: string): Promise<Verse[]>
export async function getBooks(bibleId: string): Promise<Book[]>
export async function getAvailableBibles(): Promise<BibleVersion[]>
```

Types :
```ts
interface Verse { id: string; reference: string; text: string }
interface Book  { id: string; name: string; abbreviation: string }
interface BibleVersion { id: string; name: string; abbreviation: string; language: string }
```

---

## Intégration Journal

Dans `JournalEditor.tsx` :
- Bouton "📖 Bible" ajouté dans le footer de l'éditeur (entre compteur mots et statut)
- Ouvre `BibleDrawer` en mode `'insert'` via `useBibleStore.open('insert')`
- Callback `onInsert` :
  ```ts
  function handleBibleInsert(text: string, reference: string) {
    editor?.chain().focus()
      .insertContent(`<blockquote><em>${text}</em> <small>${reference}</small></blockquote>`)
      .run()
  }
  ```
- Le verset s'insère en `<blockquote>` Tiptap à la position du curseur

---

## Intégration Préférences

Dans `PreferencesForm.tsx` :
- Nouveau champ "Traduction Bible" : dropdown avec les versions disponibles
- Lecture initiale depuis `citizen_profiles.bible_translation`
- Mise à jour via `updateProfile({ bible_translation: bibleId })`
- Synchronisé avec `useBibleStore.selectedBibleId`

---

## Positionnement BibleDrawer dans le layout

Dans le layout principal `src/app/(main)/layout.tsx` :
- `BibleFAB` rendu globalement (sauf dans `/journal/[id]`)
- `BibleDrawer` rendu globalement (portal ou direct dans layout)
- Le drawer est contrôlé par `useBibleStore`

---

## Gestion d'erreurs

- Requête api.bible échouée → message discret dans le drawer ("Impossible de charger. Réessayer.")
- Pas de résultat de recherche → "Aucun verset trouvé pour cette référence"
- Clé API manquante → warning en console dev, drawer désactivé silencieusement en prod

---

## Variables d'environnement

```
BIBLE_API_KEY=<clé api.bible>
```

À ajouter dans `.env.local` et Vercel.

---

## Ce qui est hors scope

- Lecture audio de la Bible
- Notes marginales ou surlignage persisté par verset
- Partage de verset aux Alliés depuis le drawer (peut venir en Phase G)
- Mode hors-ligne / cache local complet de la Bible

---

## Fichiers à créer / modifier

| Fichier | Action |
|---------|--------|
| `src/features/bible/BibleDrawer.tsx` | Créer |
| `src/features/bible/BibleFAB.tsx` | Créer |
| `src/lib/stores/bible.store.ts` | Créer |
| `src/lib/bible/bible-api.ts` | Créer |
| `src/app/(main)/layout.tsx` | Modifier — ajouter FAB + Drawer |
| `src/features/journal/JournalEditor.tsx` | Modifier — bouton Bible + callback insert |
| `src/features/profil/PreferencesForm.tsx` | Modifier — champ traduction Bible |
| `.env.local` | Modifier — ajouter BIBLE_API_KEY |
