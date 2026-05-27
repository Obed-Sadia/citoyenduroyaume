'use client'

import { useEffect } from 'react'
import { Mail, CheckCircle, Hexagon, BookOpen } from 'lucide-react'
import { type NotificationWithSender, markNotificationsRead } from '@/lib/actions/allies'
import { useNavStore } from '@/lib/stores/nav.store'
import { getInitials, nameToHsl } from '@/lib/utils'

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'à l\'instant'
  if (mins < 60) return `il y a ${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `il y a ${hours}h`
  const days = Math.floor(hours / 24)
  return `il y a ${days}j`
}

function getIcon(type: NotificationWithSender['type']): React.ReactNode {
  switch (type) {
    case 'invitation_received': return <Mail size={16} />
    case 'invitation_accepted': return <CheckCircle size={16} />
    case 'territory_updated':   return <Hexagon size={16} />
    case 'verse_shared':        return <BookOpen size={16} />
  }
}

function getText(n: NotificationWithSender): string {
  const name = n.sender.display_name
  switch (n.type) {
    case 'invitation_received': return `${name} t'a envoyé une invitation d'alliance`
    case 'invitation_accepted': return `${name} a accepté ton invitation`
    case 'territory_updated':   return `${name} a mis à jour son Territoire`
    case 'verse_shared': {
      const ref = typeof n.payload.reference === 'string' ? n.payload.reference : ''
      return `${name} a ancré ${ref}`
    }
  }
}

interface Props {
  notifications: NotificationWithSender[]
}

export function NotificationFeed({ notifications }: Props) {
  useEffect(() => {
    const unreadIds = notifications
      .filter((n) => n.read_at === null)
      .map((n) => n.id)

    if (unreadIds.length > 0) {
      markNotificationsRead(unreadIds).catch(() => {})
    }

    useNavStore.getState().clearUnread()
  }, [notifications])

  if (notifications.length === 0) {
    return (
      <p
        className="py-12 text-center text-[13px]"
        style={{ color: 'var(--color-text-muted)' }}
      >
        Aucune notification.
      </p>
    )
  }

  return (
    <div>
      {notifications.map((n) => (
        <div
          key={n.id}
          className="flex items-start gap-4 px-6 py-4"
          style={{
            background: n.read_at ? 'transparent' : 'var(--color-bg-active)',
            borderBottom: '0.5px solid rgba(255,255,255,0.06)',
          }}
        >
          {/* Icône type */}
          <div
            className="mt-0.5 shrink-0"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {getIcon(n.type)}
          </div>

          {/* Avatar */}
          <div
            className="h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-[11px] font-medium"
            style={{
              background: nameToHsl(n.sender.display_name),
              color: 'var(--color-text-primary)',
              border: '1.5px solid var(--color-border-mid)',
            }}
          >
            {getInitials(n.sender.display_name)}
          </div>

          {/* Texte */}
          <div className="flex-1 min-w-0">
            <p
              className="text-[13px]"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {getText(n)}
            </p>
            <p
              className="text-[11px] mt-0.5"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {relativeTime(n.created_at)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
