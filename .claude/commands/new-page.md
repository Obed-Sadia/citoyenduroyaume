---
description: Crée une page Next.js pour BASILEIA
---

Chemin : `src/app/(main)/[route]/page.tsx`

Pattern :

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '$TITRE$ — BASILEIA',
}

export default function $NOM$Page() {
  return (
    <div>
      <header className="px-6 py-5 border-b border-[var(--color-border)]">
        <p className="text-[10px] font-medium tracking-[.09em] uppercase
                      text-[var(--color-text-muted)] mb-4">
          $BREADCRUMB$
        </p>
      </header>
      <div className="px-6 py-5">
        {/* TODO */}
      </div>
    </div>
  )
}
```

Après création, mets à jour `STATUS.md` :
- Déplace la tâche dans ✅ Terminé
- Ajoute la prochaine tâche logique dans 📋 Prochaine session

Page à créer : $ARGUMENTS$
