'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Map, BookOpen, Sparkles, Users, CircleUser } from 'lucide-react'
import { useNavStore } from '@/lib/stores/nav.store'
import { cn } from '@/lib/utils'

const ITEMS = [
  { href: '/',          label: 'Carte',     icon: Map },
  { href: '/journal',   label: 'Journal',   icon: BookOpen },
  { href: '/secrets',   label: 'Secrets',   icon: Sparkles },
  { href: '/alliances', label: 'Alliances', icon: Users, badge: true },
  { href: '/profil',    label: 'Profil',    icon: CircleUser },
]

function isActive(href: string, pathname: string): boolean {
  if (href === '/alliances') return pathname.startsWith('/alliances') || pathname.startsWith('/notifications')
  if (href === '/') return pathname === '/'
  return pathname.startsWith(href)
}

export default function BottomNav() {
  const pathname    = usePathname()
  const unreadCount = useNavStore((s) => s.unreadCount)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[var(--z-bottomnav)]
                    h-16 pb-[env(safe-area-inset-bottom,0px)]
                    flex items-stretch
                    bg-[rgba(9,8,11,0.75)] backdrop-blur-[24px]
                    border-t border-[var(--color-border)] md:hidden">
      {ITEMS.map(({ href, label, icon: Icon, badge }) => {
        const active    = isActive(href, pathname)
        const showBadge = badge && unreadCount > 0
        return (
          <Link key={href} href={href} aria-current={active ? 'page' : undefined}
                className="relative flex-1 flex flex-col items-center justify-center gap-1 pt-1">
            <div className="relative">
              <Icon size={22} strokeWidth={active ? 2 : 1.5} aria-hidden
                    className={cn('transition-colors duration-150',
                      active ? 'text-[var(--color-amber-400)]' : 'text-[var(--color-text-muted)]')} />
              <AnimatePresence>
                {showBadge && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                               className="absolute -top-0.5 -right-0.5 w-[6px] h-[6px] rounded-full bg-[var(--color-amber-400)]" />
                )}
              </AnimatePresence>
            </div>
            <motion.span
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: active ? 1 : 0, y: active ? 0 : 3 }}
              transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.15 }}
              className={cn('text-[10px] font-medium leading-none',
                active ? 'text-[var(--color-amber-400)]' : 'text-[var(--color-text-muted)]')}
            >
              {label}
            </motion.span>
          </Link>
        )
      })}
    </nav>
  )
}
