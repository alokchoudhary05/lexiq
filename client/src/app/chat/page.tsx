import type { Metadata } from 'next'
import ChatPageClient from './ChatPageClient'

export const metadata: Metadata = {
  title: 'Chat — LexIQ Legal AI',
  description: 'Ask anything about Indian law using LexIQ\'s specialized Legal GPTs.',
}

export default function ChatPage() {
  return <ChatPageClient />
}
