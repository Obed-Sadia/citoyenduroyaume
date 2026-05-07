"use client"

import { motion } from 'framer-motion'
import {
  type DomainId,
  type ExplorationLevel,
  FILL,
  STROKE,
  DOMAIN_META,
} from '@/features/carte/domain-constants'

const R    = 22
const S3O2 = parseFloat((R * Math.sqrt(3) / 2).toFixed(2))
const RH   = R / 2

function hexPoints(cx: number, cy: number): string {
  return [
    [cx,        cy - R ],
    [cx + S3O2, cy - RH],
    [cx + S3O2, cy + RH],
    [cx,        cy + R ],
    [cx - S3O2, cy + RH],
    [cx - S3O2, cy - RH],
  ].map(([x, y]) => `${x},${y}`).join(' ')
}

const ATLAS_DOMAINS: Array<{ id: DomainId; abbr: string; label: string; cx: number; cy: number }> = [
  { ...DOMAIN_META[0], cx: 68,  cy: 24  },
  { ...DOMAIN_META[1], cx: 49,  cy: 57  },
  { ...DOMAIN_META[2], cx: 87,  cy: 57  },
  { ...DOMAIN_META[3], cx: 30,  cy: 90  },
  { ...DOMAIN_META[4], cx: 106, cy: 90  },
  { ...DOMAIN_META[5], cx: 68,  cy: 123 },
  { ...DOMAIN_META[6], cx: 68,  cy: 156 },
]

interface TerritoireAtlasProps {
  exploration?:    Partial<Record<DomainId, ExplorationLevel>>
  activeThisWeek?: DomainId | null
}

export function TerritoireAtlas({
  exploration    = {},
  activeThisWeek = null,
}: TerritoireAtlasProps) {
  return (
    <svg width={136} height={180} viewBox="0 0 136 180" fill="none" aria-label="Territoire intérieur">
      {ATLAS_DOMAINS.map((domain) => {
        const level     = (exploration[domain.id] ?? 0) as ExplorationLevel
        const fill      = FILL[level]
        const stroke    = STROKE[level]
        const isActive  = activeThisWeek === domain.id
        const points    = hexPoints(domain.cx, domain.cy)
        const textColor = level >= 2
          ? 'rgba(255,252,245,0.65)'
          : 'rgba(255,252,245,0.18)'

        return (
          <g key={domain.id}>
            <title>{domain.label}</title>
            <motion.polygon
              points={points}
              fill={fill}
              stroke={stroke.color}
              strokeWidth={stroke.width}
              animate={isActive ? { opacity: [1, 0.7, 1] } : undefined}
              transition={isActive
                ? { repeat: Infinity, duration: 3, ease: 'easeInOut' }
                : undefined
              }
            />
            <text
              x={domain.cx}
              y={domain.cy + 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={6.5}
              fill={textColor}
              fontFamily="var(--font-sans)"
              letterSpacing="0.06em"
              style={{ userSelect: 'none', pointerEvents: 'none' }}
            >
              {domain.abbr}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
