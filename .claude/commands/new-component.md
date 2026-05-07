---
description: Crée un composant BASILEIA avec le bon pattern
---

Avant de coder, lis `docs/style-guide.md`.

Puis crée le composant avec ce pattern :

```tsx
'use client' // seulement si hooks / events / animations

import { cn } from '@/lib/utils'

interface $NOM$Props {
  className?: string
}

export function $NOM$({ className }: $NOM$Props) {
  return (
    <div className={cn('', className)}>
    </div>
  )
}
```

Règles :
- Couleurs → `var(--color-*)` uniquement, jamais de valeur hardcodée
- Animations → Framer Motion, ease `[0.16,1,0.3,1]`, max 200ms
- Icônes → Lucide React, outline, strokeWidth 1.5 / 2 si actif
- Classes conditionnelles → `cn()` toujours
- Mobile-first

Composant à créer : $ARGUMENTS$
