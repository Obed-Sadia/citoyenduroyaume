'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItemProps {
  href:      string
  label:     string
  icon:      LucideIcon
  active?:   boolean
  expanded?: boolean
  children?: React.ReactNode
}

export function NavItem({ href, label, icon: Icon, active = false, expanded = false, children }: NavItemProps) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'relative flex items-center gap-2.5 h-9 px-3 rounded-[var(--radius-sm)] transition-colors duration-150 select-none',
        active
          ? 'bg-[var(--color-bg-active)] text-[var(--color-text-primary)] font-medium'
          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]'
      )}
    >
      <Icon size={expanded ? 16 : 18} strokeWidth={active ? 2 : 1.5} aria-hidden className="flex-shrink-0" />
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.span
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -5 }}
            transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.15 }}
            className="text-[12.5px] leading-none whitespace-nowrap"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
      {children}
    </Link>
  )
}
