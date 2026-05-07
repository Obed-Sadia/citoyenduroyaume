"use client"

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  type DomainId,
  type ExplorationLevel,
  FILL,
  STROKE,
  DOMAIN_META,
} from '@/features/carte/domain-constants'
import { ZoneGrise } from '@/features/carte/ZoneGrise'
import { DomainTooltip } from '@/features/carte/DomainTooltip'

// ── Géométrie ────────────────────────────────────────────────────────────────
const R    = 52
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

const HEXMAP_DOMAINS = DOMAIN_META.map((meta, i) => ({
  ...meta,
  ...[
    { cx: 160, cy: 58  },
    { cx: 115, cy: 136 },
    { cx: 205, cy: 136 },
    { cx: 70,  cy: 214 },
    { cx: 250, cy: 214 },
    { cx: 160, cy: 292 },
    { cx: 160, cy: 370 },
  ][i],
}))

const SVG_W = 320
const SVG_H = 424

// ── Animations ───────────────────────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.03 } },
}

const hexVariants = {
  hidden:  { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { ease: [0.16, 1, 0.3, 1] as const, duration: 0.2 } },
}

// ── Types ────────────────────────────────────────────────────────────────────
export interface DomainStats {
  exploration: ExplorationLevel
  journalCount: number
  secretCount: number
}

interface HexMapProps {
  stats: Partial<Record<DomainId, DomainStats>>
  activeThisWeek?: DomainId | null
}

// ── Composant ────────────────────────────────────────────────────────────────
export function HexMap({ stats, activeThisWeek = null }: HexMapProps) {
  const router = useRouter()
  const [selected, setSelected] = useState<DomainId | null>(null)
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressFireRef = useRef(false)

  const selectedDomain = selected
    ? HEXMAP_DOMAINS.find((d) => d.id === selected) ?? null
    : null

  const tooltipStyle: React.CSSProperties = selectedDomain
    ? (() => {
        const flipUp = (selectedDomain.cy + R + 10) / SVG_H > 0.8
        return {
          left: `${(selectedDomain.cx / SVG_W) * 100}%`,
          top: flipUp
            ? `${((selectedDomain.cy - R - 10) / SVG_H) * 100}%`
            : `${((selectedDomain.cy + R + 10) / SVG_H) * 100}%`,
          transform: flipUp
            ? 'translate(-50%, -100%)'
            : 'translateX(-50%)',
        }
      })()
    : {}

  function handlePointerDown(domainId: DomainId): void {
    longPressFireRef.current = false
    longPressRef.current = setTimeout(() => {
      longPressFireRef.current = true
      longPressRef.current = null
      router.push(`/domaines/${domainId}`)
    }, 500)
  }

  function handlePointerUp(): void {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current)
      longPressRef.current = null
    }
  }

  function handleClick(domainId: DomainId): void {
    if (longPressFireRef.current) return
    setSelected((prev) => (prev === domainId ? null : domainId))
  }

  return (
    <div className="relative mx-auto w-full max-w-[500px]">
      <motion.svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        fill="none"
        className="w-full"
        aria-label="Atlas des 7 Domaines"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {HEXMAP_DOMAINS.map((domain) => {
          const domainStats = stats[domain.id]
          const level       = (domainStats?.exploration ?? 0) as ExplorationLevel
          const fill        = FILL[level]
          const stroke      = STROKE[level]
          const isActive    = activeThisWeek === domain.id
          const points      = hexPoints(domain.cx, domain.cy)
          const textColor   = level >= 2
            ? 'rgba(255,252,245,0.65)'
            : 'rgba(255,252,245,0.18)'

          return (
            <motion.g
              key={domain.id}
              variants={hexVariants}
              style={{
                cursor: 'pointer',
                transformOrigin: `${domain.cx}px ${domain.cy}px`,
              }}
              whileHover={{ scale: 1.04 }}
              transition={{ ease: [0.16, 1, 0.3, 1] as const, duration: 0.15 }}
              onClick={() => handleClick(domain.id)}
              onPointerDown={() => handlePointerDown(domain.id)}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              <title>{domain.label}</title>

              <motion.polygon
                points={points}
                fill={fill}
                stroke={stroke.color}
                strokeWidth={stroke.width}
                animate={isActive ? { opacity: [1, 0.7, 1] } : { opacity: 1 }}
                transition={
                  isActive
                    ? { repeat: Infinity, duration: 3, ease: 'easeInOut' }
                    : { duration: 0 }
                }
              />

              {level === 0 && <ZoneGrise points={points} id={domain.id} />}

              <text
                x={domain.cx}
                y={domain.cy + 3}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={14}
                fill={textColor}
                fontFamily="var(--font-sans)"
                letterSpacing="0.06em"
                style={{ userSelect: 'none', pointerEvents: 'none' }}
              >
                {domain.abbr}
              </text>
            </motion.g>
          )
        })}
      </motion.svg>

      {selected && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setSelected(null)}
          aria-hidden="true"
        />
      )}

      <AnimatePresence>
        {selected && selectedDomain && (
          <DomainTooltip
            key={selected}
            label={selectedDomain.label}
            exploration={(stats[selected]?.exploration ?? 0) as ExplorationLevel}
            journalCount={stats[selected]?.journalCount ?? 0}
            secretCount={stats[selected]?.secretCount ?? 0}
            style={tooltipStyle}
            onNavigate={() => {
              setSelected(null)
              router.push(`/domaines/${selected}`)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
