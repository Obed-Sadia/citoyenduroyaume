"use client"

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSecretsStore } from '@/lib/stores/secrets.store'
import { SecretCard } from '@/features/secrets/SecretCard'

const EASE = [0.16, 1, 0.3, 1] as const

export function SecretFeed() {
  const secrets = useSecretsStore((s) => s.secrets)
  const loadFromDb = useSecretsStore((s) => s.loadFromDb)

  useEffect(() => {
    loadFromDb()
  }, [loadFromDb])

  if (secrets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
        <p
          className="text-[15px]"
          style={{ fontFamily: 'var(--font-editorial)', color: 'var(--color-text-secondary)' }}
        >
          Aucune fulgurance capturée.
        </p>
        <p className="mt-1 text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
          Tape ci-dessous ce que l'Esprit te murmure.
        </p>
      </div>
    )
  }

  return (
    <motion.ul
      className="flex flex-col gap-3 px-6 pb-6"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.05 } },
      }}
    >
      {secrets.map((secret) => (
        <motion.li
          key={secret.id}
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { ease: EASE, duration: 0.25 },
            },
          }}
        >
          <SecretCard secret={secret} />
        </motion.li>
      ))}
    </motion.ul>
  )
}
