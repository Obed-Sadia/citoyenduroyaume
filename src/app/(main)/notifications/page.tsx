import type { Metadata } from 'next'
import { getNotifications } from '@/lib/actions/allies'
import { NotificationFeed } from '@/features/notifications/NotificationFeed'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { BentoGrid, BentoCell } from '@/components/ui/BentoGrid'

export const metadata: Metadata = { title: 'Notifications — BASILEIA' }

export default async function NotificationsPage() {
  const notifications = await getNotifications()
  const unread = notifications.filter((n) => !n.read_at).length

  return (
    <div className="px-4 pt-4 md:px-5 md:pt-5 pb-20 space-y-3">

      <BentoGrid cols={3} className="mb-2">
        <BentoCell span={2} variant="strong" className="px-4 py-3">
          <p
            className="text-[9px] font-medium tracking-[0.11em] uppercase mb-0.5"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Notifications
          </p>
          <p
            className="text-[15px] font-[family-name:var(--font-editorial)]"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Activité récente
          </p>
        </BentoCell>
        <BentoCell variant={unread > 0 ? 'strong' : 'base'} className="flex flex-col justify-center items-center text-center">
          <p
            className="font-[family-name:var(--font-editorial)] text-[28px] font-[300] leading-none"
            style={{ color: unread > 0 ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
          >
            {unread}
          </p>
          <p
            className="text-[8px] tracking-[0.08em] uppercase mt-0.5"
            style={{ color: 'var(--color-text-muted)' }}
          >
            non lues
          </p>
        </BentoCell>
      </BentoGrid>

      <GlassPanel variant="base">
        <NotificationFeed notifications={notifications} />
      </GlassPanel>

    </div>
  )
}
