import type { Metadata } from 'next'
import AuthPage from './AuthPageClient'

export const metadata: Metadata = {
  title: 'Log In or Sign Up — LexIQ',
  description: 'Access India\'s AI Legal Intelligence Platform. Log in or create your free account to access specialized legal AI assistants.',
}

export default function Page() {
  return <AuthPage />
}
