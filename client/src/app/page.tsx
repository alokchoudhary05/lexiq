import type { Metadata } from 'next'
import LandingPage from '@/components/landing/LandingPage'

export const metadata: Metadata = {
  title: 'LexIQ — India\'s AI Legal Counsel, Available 24/7',
  description: 'LexIQ provides specialized AI legal assistants trained on BNS 2023, CrPC, IPC, Income Tax Act. Ask in Hindi or English — get instant legal guidance.',
}

export default function HomePage() {
  return <LandingPage />
}
