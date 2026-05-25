import type { Metadata } from 'next'
import type { CSSProperties } from 'react'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { CitizenIdentity } from '@/features/profil/CitizenIdentity'
import { LogoutButton } from '@/features/profil/LogoutButton'
import { InviteBlock } from '@/features/alliances/InviteBlock'
import { TerritoireAtlas } from '@/features/profil/stats/TerritoireAtlas'
import { MetricBlock } from '@/features/profil/stats/MetricBlock'
import { PreferencesForm } from '@/features/profil/PreferencesForm'
import type { DomainId } from '@/features/carte/domain-constants'
import { BentoGrid, BentoCell } from '@/components/ui/BentoGrid'
import { GlassPanel } from '@/components/ui/GlassPanel'

export const metadata: Metadata = { title: 'Profil — BASILEIA' }

const DOMAIN_IDS: DomainId[] = [
  'roi', 'territoire', 'citoyens', 'constitution', 'lois', 'gouvernement', 'privileges',
]

const DOMAIN_LABELS: Record<DomainId, string> = {
  roi:          'Le Roi',
  territoire:   'Le Territoire',
  citoyens:     'Les Citoyens',
  constitution: 'La Constitution',
  lois:         'Les Lois',
  gouvernement: 'Le Gouvernement',
  privileges:   'Les Privilèges',
}

function toExplorationLevel(count: number): 0 | 1 | 2 | 3 | 4 | 5 {
  if (count === 0) return 0
  if (count <= 2) return 1
  if (count <= 5) return 2
  if (count <= 10) return 3
  if (count <= 20) return 4
  return 5
}

function maskEmail(email: string): string {
  const atIdx = email.indexOf('@')
  if (atIdx < 0) return email
  const local  = email.slice(0, atIdx)
  const domain = email.slice(atIdx)
  if (local.length <= 2) return `${local[0]}•••${domain}`
  return `${local[0]}${'•'.repeat(Math.min(local.length - 1, 5))}${domain}`
}

const BTN_DANGER: CSSProperties = {
  fontSize:     '11px',
  color:        'rgba(180,70,70,0.80)',
  background:   'rgba(150,50,50,0.08)',
  border:       '1px solid rgba(150,50,50,0.18)',
  borderRadius: '6px',
  padding:      '4px 10px',
}

const ROW = { borderBottom: '0.5px solid rgba(255,255,255,0.06)' }

export default async function ProfilPage() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profileResult, notesResult, secretsResult, versesResult] = await Promise.all([
    supabase
      .from('citizen_profiles')
      .select('display_name, avatar_url, locale, created_at, short_code')
      .eq('id', user.id)
      .single(),
    supabase
      .from('notes')
      .select('domain_id, updated_at')
      .eq('user_id', user.id),
    supabase
      .from('secrets')
      .select('domain_id, created_at')
      .eq('user_id', user.id),
    supabase
      .from('verses')
      .select('domain, created_at')
      .eq('user_id', user.id),
  ])

  const profile  = profileResult.data
  const notes    = notesResult.data   ?? []
  const secrets  = secretsResult.data ?? []
  const verses   = versesResult.data  ?? []

  // Count items per domain
  const domainCounts: Record<DomainId, number> = {
    roi: 0, territoire: 0, citoyens: 0, constitution: 0,
    lois: 0, gouvernement: 0, privileges: 0,
  }
  for (const n of notes) {
    if (n.domain_id && (DOMAIN_IDS as string[]).includes(n.domain_id))
      domainCounts[n.domain_id as DomainId] += 1
  }
  for (const s of secrets) {
    if (s.domain_id && (DOMAIN_IDS as string[]).includes(s.domain_id))
      domainCounts[s.domain_id as DomainId] += 1
  }
  for (const v of verses) {
    if (v.domain && (DOMAIN_IDS as string[]).includes(v.domain))
      domainCounts[v.domain as DomainId] += 1
  }

  // Exploration levels (0–5) per domain
  const exploration: Partial<Record<DomainId, 0 | 1 | 2 | 3 | 4 | 5>> = {}
  for (const id of DOMAIN_IDS) {
    exploration[id] = toExplorationLevel(domainCounts[id])
  }

  // Domain de prédilection
  let topDomain: DomainId | null = null
  let topCount = 0
  for (const id of DOMAIN_IDS) {
    if (domainCounts[id] > topCount) { topCount = domainCounts[id]; topDomain = id }
  }

  // Domain le plus actif cette semaine
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  let activeThisWeek: DomainId | undefined
  let latestTs = ''
  for (const n of notes) {
    if (n.domain_id && n.updated_at > weekAgo && n.updated_at > latestTs) {
      latestTs = n.updated_at; activeThisWeek = n.domain_id as DomainId
    }
  }
  for (const s of secrets) {
    if (s.domain_id && s.created_at > weekAgo && s.created_at > latestTs) {
      latestTs = s.created_at; activeThisWeek = s.domain_id as DomainId
    }
  }
  for (const v of verses) {
    if (v.domain && v.created_at > weekAgo && v.created_at > latestTs) {
      latestTs = v.created_at; activeThisWeek = v.domain as DomainId
    }
  }

  // "En profondeur" — notes ayant reçu une classification de domaine
  const enProfondeur = notes.filter(n => n.domain_id !== null).length

  return (
    <div className="max-w-[920px] mx-auto px-4 pt-4 md:px-5 md:pt-5 pb-20 space-y-3">

      {/* Header */}
      <BentoGrid cols={3}>
        <BentoCell span={2} variant="strong" className="px-4 py-3">
          <p
            className="text-[9px] font-medium tracking-[0.11em] uppercase mb-0.5"
            style={{ color: 'var(--color-amber-400)' }}
          >
            Profil & Paramètres
          </p>
          <p
            className="text-[15px] font-[family-name:var(--font-editorial)]"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Mon Profil
          </p>
        </BentoCell>
        <BentoCell variant="base" className="flex items-center justify-center">
          <CitizenIdentity
            displayName={profile?.display_name ?? user.email ?? 'Citoyen'}
            avatarUrl={profile?.avatar_url}
            locale={profile?.locale ?? 'fr'}
            createdAt={profile?.created_at ?? user.created_at}
          />
        </BentoCell>
      </BentoGrid>

      {/* Territoire intérieur */}
      <GlassPanel variant="base" className="p-[13px]">
        <p
          className="text-[9px] font-medium tracking-[0.11em] uppercase mb-4"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Mon Territoire Intérieur
        </p>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="shrink-0">
            <TerritoireAtlas exploration={exploration} activeThisWeek={activeThisWeek} />
          </div>
          <div className="grid grid-cols-2 gap-2 content-start flex-1">
            <MetricBlock value={notes.length}   label="Journaux"               amber />
            <MetricBlock value={secrets.length} label="Secrets capturés"               />
            <MetricBlock value={verses.length}  label="Versets ancrés"         amber />
            <MetricBlock value={enProfondeur}   label="En profondeur"                  />
            <MetricBlock
              value={topDomain && topCount > 0 ? DOMAIN_LABELS[topDomain] : '—'}
              label="Domaine de prédilection"
              amber
              small
            />
          </div>
        </div>
      </GlassPanel>

      {/* Préférences */}
      <GlassPanel variant="base" className="p-[13px]">
        <p
          className="text-[9px] font-medium tracking-[0.11em] uppercase mb-4"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Préférences
        </p>
        <PreferencesForm />
      </GlassPanel>

      {/* Compte */}
      <GlassPanel variant="base" className="p-[13px]">
        <p
          className="text-[9px] font-medium tracking-[0.11em] uppercase mb-4"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Compte
        </p>
        <InviteBlock shortCode={profile?.short_code ?? '……'} />
        <div className="flex items-center justify-between py-3" style={ROW}>
          <span className="text-[12.5px]" style={{ color: 'var(--color-text-secondary)' }}>Email</span>
          <span className="text-[11px]"   style={{ color: 'var(--color-text-muted)' }}>
            {user.email ? maskEmail(user.email) : '—'}
          </span>
        </div>
        <div className="flex items-center justify-between py-3" style={ROW}>
          <span className="text-[12.5px]" style={{ color: 'var(--color-text-secondary)' }}>Session</span>
          <LogoutButton />
        </div>
        <div className="flex items-center justify-between py-3">
          <span className="text-[12.5px]" style={{ color: 'rgba(180,70,70,0.80)' }}>Supprimer le compte</span>
          <button className="transition-opacity hover:opacity-70" style={BTN_DANGER}>Supprimer</button>
        </div>
      </GlassPanel>

    </div>
  )
}
