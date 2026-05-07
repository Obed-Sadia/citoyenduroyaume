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
        'relative flex items-center gap-2.5 h-9 rounded-md transition-colors duration-150 select-none',
        active ? 'pl-[10px] pr-2.5' : 'px-3',
        active
          ? 'bg-[var(--color-amber-bg)] text-[var(--color-amber-400)] border-l-2 border-[var(--color-amber-400)] rounded-l-none'
          : 'border-l-2 border-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]'
      )}
    >
      <Icon size={expanded ? 16 : 18} strokeWidth={active ? 2 : 1.5} aria-hidden className="flex-shrink-0" />
      <AnimatePresence>
        {expanded && (
          <motion.span
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -5 }}
            transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.15 }}
            className="text-[12.5px] font-[450] leading-none whitespace-nowrap"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
      {children}
    </Link>
  )
}
