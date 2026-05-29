import type { Metadata } from 'next'
import { CarteDomainStats } from '@/features/carte/CarteDomainStats'

export const metadata: Metadata = { title: 'La Carte — BASILEIA' }

export default function CartePage() {
  return <CarteDomainStats />
}
