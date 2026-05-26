'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Map, BookOpen, Sparkles, Scroll, Users, Bell, CircleUser, ChevronRight } from 'lucide-react'
import { useNavStore } from '@/lib/stores/nav.store'
import { NavItem } from './NavItem'
import { NotificationBadge } from './NotificationBadge'

const NAV_ITEMS = [
  { href: '/',              label: 'La Carte',        icon: Map },
  { href: '/journal',       label: 'Le Journal',      icon: BookOpen },
  { href: '/secrets',       label: 'Les Secrets',     icon: Sparkles },
  { href: '/bibliotheque',  label: 'La Bibliothèque', icon: Scroll },
  { href: '/alliances',     label: 'Alliances',       icon: Users },
  { href: '/notifications', label: 'Notifications',   icon: Bell, badge: true },
]

function isActive(href: string, pathname: string): boolean {
  if (href === '/') return pathname === '/'
  return pathname.startsWith(href)
}

export default function Sidebar() {
  const { isLocked, toggleLock } = useNavStore()
  const [isHovered, setIsHovered] = useState(false)
  const pathname = usePathname()
  const expanded = isLocked || isHovered

  useEffect(() => {
    if (window.innerWidth >= 1024) {
      useNavStore.setState({ isLocked: true })
    }
  }, [])

  return (
    <motion.nav
      animate={{ width: expanded ? 240 : 48 }}
      transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ background: 'var(--glass-sidebar-bg)' }}
      className="relative flex flex-col h-full flex-shrink-0 overflow-hidden
                 backdrop-blur-[20px] border-r border-[var(--color-border)]"
    >
      <Link href="/" className="flex items-center gap-2.5 h-[52px] px-[13px] flex-shrink-0
                                border-b border-[var(--color-border)]">
        <div className="w-[30px] h-[30px] rounded-[6px] border border-[var(--color-accent-border)] bg-[var(--color-accent-bg)] flex items-center justify-center font-[family-name:var(--font-editorial)] text-[14px] font-[500] text-[var(--color-accent)] flex-shrink-0">
          B
        </div>
        <AnimatePresence>
          {expanded && (
            <motion.span
              initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }}
              transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.15 }}
              className="text-[11px] font-medium tracking-[0.1em] text-[var(--color-text-primary)] whitespace-nowrap"
            >
              BASILEIA
            </motion.span>
          )}
        </AnimatePresence>
      </Link>

      <div className="flex-1 flex flex-col gap-px px-2 py-2.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon, badge }) => (
          <NavItem key={href} href={href} label={label} icon={icon}
                   active={isActive(href, pathname)} expanded={expanded}>
            {badge && <NotificationBadge />}
          </NavItem>
        ))}
      </div>

      <div className="px-2 pt-2 pb-2 border-t border-[var(--color-border)] flex-shrink-0">
        <NavItem href="/profil" label="Profil" icon={CircleUser}
                 active={isActive('/profil', pathname)} expanded={expanded} />
      </div>

      <motion.button
        onClick={toggleLock}
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered || isLocked ? 1 : 0 }}
        transition={{ duration: 0.15 }}
        className="absolute top-[58px] right-0 translate-x-1/2
                   w-4 h-4 rounded-full
                   bg-[var(--color-bg-elevated)] border border-[var(--color-border)]
                   flex items-center justify-center
                   text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]
                   transition-colors z-20 cursor-pointer"
        aria-label={isLocked ? 'Déverrouiller la sidebar' : 'Verrouiller la sidebar'}
      >
        <motion.span animate={{ rotate: isLocked ? 180 : 0 }} transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.2 }} className="flex">
          <ChevronRight size={9} strokeWidth={2.5} />
        </motion.span>
      </motion.button>
    </motion.nav>
  )
}
