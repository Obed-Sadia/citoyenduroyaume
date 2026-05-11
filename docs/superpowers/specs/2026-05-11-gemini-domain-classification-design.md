# Design — Classification automatique des Domaines (Gemini)

**Date :** 2026-05-11
**Projet :** BASILEIA (Citoyen du Royaume)
**Statut :** Approuvé

---

## Objectif

Permettre à Gemini de suggérer automatiquement le Domaine théologique d'une note (Journal) ou d'un secret, tout en laissant le Citoyen valider ou ignorer la suggestion. L'IA reste invisible — elle propose, elle n'impose pas.

---

## Principe directeur

App-Effacement : Gemini ne s'interpose jamais. Si l'API échoue, l'expérience reste intacte. Aucun message d'erreur visible, aucun spinner bloquant.

---

## Architecture

### Point d'entrée unique

**`src/lib/ai/classify-domain.ts`** — Server Action exportée :

```ts
'use server'
export async function classifyDomain(text: string): Promise<DomainId>
```

- Dépendance : `@google/generative-ai` (SDK officiel Google)
- Modèle : `gemini-2.0-flash`
- Clé API : `process.env.GEMINI_API_KEY`
- Prompt : liste les 7 domaines avec leur signification théologique, demande une réponse en un seul mot parmi les 7 IDs (`roi`, `territoire`, `citoyens`, `constitution`, `lois`, `gouvernement`, `privileges`)
- Validation : si la réponse ne correspond pas exactement à un ID valide → fallback `roi`
- Erreur réseau / quota : propagation de l'exception (l'appelant gère silencieusement)

### Fichiers touchés

| Action  | Fichier |
|---------|---------|
| Create  | `src/lib/ai/classify-domain.ts` |
| Modify  | `src/features/journal/JournalEditor.tsx` |
| Modify  | `src/features/secrets/CaptureBar.tsx` |

---

## Intégration Journal (B — suggestion au premier save)

**Déclencheur :** après le debounce de sauvegarde (1s), si `note.domain_id === null` ET `editor.getText().length >= 20`. Le texte brut est extrait via `editor.getText()` (instance Tiptap déjà disponible dans `JournalEditor`).

**UI — 3 états du chip domaine dans le header de l'éditeur :**

| État | Affichage |
|------|-----------|
| Pas de domaine, pas de suggestion | invisible |
| Suggestion reçue | chip ambre pulsant `● LE ROI · Suggéré  [Valider] [✕]` |
| Domaine validé | chip ambre fixe `● LE ROI` |

**Validation :** `updateNote(id, { domain_id: suggestion })` → mise à jour store + Dexie.
**Rejet :** chip disparaît, `domain_id` reste `null`. Gemini ne reclasse pas (une seule suggestion par note).
**Erreur Gemini :** exception capturée silencieusement, aucun chip affiché.

**État local :** `useState<DomainId | null>` pour la suggestion + `useState<boolean>` pour le loading. Aucun changement de store.

---

## Intégration Secrets (C — déclencheur manuel dans CaptureBar)

**Déclencheur :** bouton `◈ Domaine` visible dès que le champ texte contient ≥ 3 caractères.

**Flux :**

| Étape | UI |
|-------|----|
| Texte ≥ 3 chars | `◈ Domaine` visible (discret) |
| Clic bouton | spinner inline, bouton désactivé |
| Suggestion reçue | chip ambre `LE ROI ✕` remplace le bouton |
| Soumission (Enter) | `addSecret(text, suggestedDomainId)` |
| Clic ✕ chip | retour état initial, pas de domaine |
| Erreur Gemini | retour état initial silencieux |

**État local :** `useState<DomainId | null>` pour la suggestion + `useState<boolean>` pour le loading. Aucun changement de store.

---

## Prompt Gemini

```
Tu es un assistant de classification théologique pour l'application BASILEIA.
Les 7 Domaines du Royaume sont :
- roi : La nature, l'identité et le règne de Dieu le Roi
- territoire : Le territoire intérieur, la terre promise, l'espace de règne
- citoyens : La communauté, les relations, le corps du Christ
- constitution : La Parole comme loi fondamentale, les promesses
- lois : Les principes, les commandements, la sagesse pratique
- gouvernement : L'autorité spirituelle, la délégation, le leadership
- privileges : Les droits, les bénédictions, l'héritage du Royaume

Lis ce texte et réponds UNIQUEMENT par l'identifiant du domaine le plus pertinent
(un seul mot parmi : roi, territoire, citoyens, constitution, lois, gouvernement, privileges).

Texte : {text}
```

---

## Gestion d'erreurs

| Scénario | Comportement |
|----------|--------------|
| Gemini indisponible | exception silencieuse, pas de suggestion affichée |
| Réponse hors liste | fallback `roi` |
| Texte vide / trop court | appel non déclenché (guard côté appelant) |
| Quota dépassé | exception silencieuse |

---

## Décisions

| Sujet | Décision | Raison |
|-------|----------|--------|
| Modèle | `gemini-2.0-flash` | Rapide + peu coûteux pour un choix parmi 7 |
| Fallback | `roi` | Valeur stable, jamais de `null` en sortie |
| Reclassification Journal | Non | Une seule suggestion (B = premier save) |
| Erreurs | Silencieuses | App-Effacement — l'IA ne doit jamais bloquer |
| Store | Non modifié | État de suggestion 100% local aux composants |
