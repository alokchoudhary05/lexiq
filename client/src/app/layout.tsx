import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/lib/ThemeProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LexIQ — India\'s AI Legal Intelligence Platform',
  description: 'Specialized AI legal assistants trained on BNS 2023, CrPC, IPC, Income Tax Act & Criminal Law. Ask in Hindi or English.',
  keywords: 'Indian law AI, legal chatbot, BNS 2023, IPC, CrPC, Income Tax, LexIQ',
  openGraph: {
    title: 'LexIQ — India\'s AI Legal Counsel',
    description: 'Specialized AI legal assistants for Indian law. Available 24/7.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
