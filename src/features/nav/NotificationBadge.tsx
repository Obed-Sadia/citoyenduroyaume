'use client'

import { motion } from 'framer-motion'
import { useNavStore } from '@/lib/stores/nav.store'

export function NotificationBadge() {
  const unreadCount = useNavStore((s) => s.unreadCount)
  if (unreadCount === 0) return null
  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className="absolute top-1.5 right-1.5 flex items-center justify-center"
      aria-label={`${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`}
    >
      <motion.span
        animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        className="absolute w-2 h-2 rounded-full bg-[var(--color-text-primary)]"
      />
      <span className="relative w-[7px] h-[7px] rounded-full bg-[var(--color-text-primary)]" />
    </motion.span>
  )
}
