import type { Metadata } from 'next'
import type { CSSProperties } from 'react'
import { CitizenIdentity } from '@/features/profil/CitizenIdentity'
import { TerritoireAtlas } from '@/features/profil/stats/TerritoireAtlas'
import { MetricBlock } from '@/features/profil/stats/MetricBlock'
import { PreferencesForm } from '@/features/profil/PreferencesForm'
import type { DomainId } from '@/features/carte/domain-constants'

export const metadata: Metadata = { title: 'Profil — BASILEIA' }

// TODO: remplacer par les données Supabase (citizen_profiles + agrégats notes/secrets/verses)
const MOCK_EXPLORATION: Partial<Record<DomainId, 0 | 1 | 2 | 3 | 4 | 5>> = {
  roi:          4,
  territoire:   3,
  citoyens:     2,
  constitution: 5,
  lois:         1,
  gouvernement: 0,
  privileges:   3,
}

const BTN_STYLE: CSSProperties = {
  fontSize:     '11px',
  color:        'var(--color-text-secondary)',
  background:   'rgba(255,255,255,0.05)',
  border:       '1px solid rgba(255,255,255,0.08)',
  borderRadius: '6px',
  padding:      '4px 10px',
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
const SECTION_LABEL = 'text-[10px] font-medium tracking-[.09em] uppercase mb-4'

export default function ProfilPage() {
  return (
    <div className="max-w-[920px] mx-auto">
      <header className="px-10 py-5 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <p className={SECTION_LABEL} style={{ color: 'var(--color-text-muted)' }}>
          Profil & Paramètres
        </p>
        <p className="text-[15px] font-medium" style={{ color: 'var(--color-text-primary)' }}>
          Mon Profil
        </p>
      </header>

      <div className="px-10 py-8 space-y-10">

        {/* ── Identité ── */}
        <section>
          <CitizenIdentity displayName="Obed Sadia" locale="fr" createdAt="2024-01-15" />
        </section>

        {/* ── Mon Territoire Intérieur ── */}
        <section>
          <p className={SECTION_LABEL} style={{ color: 'var(--color-text-muted)' }}>
            Mon Territoire Intérieur
          </p>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="shrink-0">
              <TerritoireAtlas exploration={MOCK_EXPLORATION} activeThisWeek="constitution" />
            </div>
            <div className="grid grid-cols-2 gap-2 content-start flex-1">
              <MetricBlock value={24} label="Journaux"               amber />
              <MetricBlock value={12} label="Secrets capturés"               />
              <MetricBlock value={89} label="Versets ancrés"         amber />
              <MetricBlock value={7}  label="En profondeur"                  />
              <MetricBlock value="La Constitution" label="Domaine de prédilection" amber small />
            </div>
          </div>
        </section>

        {/* ── Préférences ── */}
        <section>
          <p className={SECTION_LABEL} style={{ color: 'var(--color-text-muted)' }}>
            Préférences
          </p>
          <PreferencesForm />
        </section>

        {/* ── Compte ── */}
        <section>
          <p className={SECTION_LABEL} style={{ color: 'var(--color-text-muted)' }}>
            Compte
          </p>
          <div>
            <div className="flex items-center justify-between py-3" style={ROW}>
              <span className="text-[12.5px]" style={{ color: 'var(--color-text-secondary)' }}>Email</span>
              <span className="text-[11px]"   style={{ color: 'var(--color-text-muted)' }}>o•••••@gmail.com</span>
            </div>
            <div className="flex items-center justify-between py-3" style={ROW}>
              <span className="text-[12.5px]" style={{ color: 'var(--color-text-secondary)' }}>Mot de passe</span>
              <button className="transition-opacity hover:opacity-70" style={BTN_STYLE}>Changer</button>
            </div>
            <div className="flex items-center justify-between py-3" style={ROW}>
              <span className="text-[12.5px]" style={{ color: 'var(--color-text-secondary)' }}>Session</span>
              <button className="transition-opacity hover:opacity-70" style={BTN_STYLE}>Déconnecter</button>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-[12.5px]" style={{ color: 'rgba(180,70,70,0.80)' }}>Supprimer le compte</span>
              <button className="transition-opacity hover:opacity-70" style={BTN_DANGER}>Supprimer</button>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
