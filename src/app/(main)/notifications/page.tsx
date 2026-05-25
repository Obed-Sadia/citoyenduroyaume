import type { Metadata } from 'next'
import { getNotifications } from '@/lib/actions/allies'
import { NotificationFeed } from '@/features/notifications/NotificationFeed'

export const metadata: Metadata = { title: 'Notifications — BASILEIA' }

export default async function NotificationsPage() {
  const notifications = await getNotifications()

  return (
    <div>
      <header className="px-6 py-5 border-b border-[var(--color-border)]">
        <p
          className="text-[10px] font-medium tracking-[.09em] uppercase mb-1"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Notifications
        </p>
      </header>
      <NotificationFeed notifications={notifications} />
    </div>
  )
}
