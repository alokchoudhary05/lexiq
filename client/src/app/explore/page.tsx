import type { Metadata } from 'next'
import ExplorePageClient from './ExplorePageClient'

export const metadata: Metadata = {
  title: 'Explore Legal GPTs — LexIQ',
  description: 'Browse all specialized AI legal models trained on Indian law — BNS, CrPC, IPC, Income Tax, and Criminal Law.',
}

export default function ExplorePage() {
  return <ExplorePageClient />
}
