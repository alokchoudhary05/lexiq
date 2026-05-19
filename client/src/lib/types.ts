// ─── TypeScript Types for LexIQ ───────────────────────────────────────────────

export interface User {
  id: string
  email: string
  full_name: string
  role: 'student' | 'advocate' | 'citizen'
  avatar_url?: string
}

export interface ChatSession {
  id: string
  user_id: string
  title: string
  gpt_model: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  session_id: string
  role: 'user' | 'assistant'
  content: string
  metadata: {
    sources?: string[]
    source_type?: 'documents' | 'web' | 'none' | 'not_law'
    label?: string
    lang?: 'en' | 'hi' | 'hinglish'
  }
  created_at: string
}

export type DomainKey = 'auto' | 'bns' | 'crpc' | 'ipc' | 'ita' | 'itr' | 'criminal' | 'tax'

export interface DomainConfig {
  label: string
  prefix: string
  color: string
  icon: string
  description: string
  shortLabel: string
}

export const DOMAIN_OPTIONS: Record<DomainKey, DomainConfig> = {
  auto: {
    label: 'Auto (Smart Detect)',
    shortLabel: 'Auto GPT',
    prefix: '',
    color: '#f97316',
    icon: '⚡',
    description: 'Automatically detects the best law domain',
  },
  bns: {
    label: 'Bharatiya Nyaya Sanhita',
    shortLabel: 'BNS GPT',
    prefix: '\\bns ',
    color: '#f97316',
    icon: '⚖️',
    description: "BNS 2023 — India's new criminal code replacing IPC",
  },
  crpc: {
    label: 'CrPC Expert',
    shortLabel: 'CrPC GPT',
    prefix: '\\crpc ',
    color: '#34d399',
    icon: '📋',
    description: 'Criminal procedure, bail, FIR, courts',
  },
  ipc: {
    label: 'IPC (Legacy)',
    shortLabel: 'IPC GPT',
    prefix: '\\ipc ',
    color: '#f97316',
    icon: '📜',
    description: 'Indian Penal Code 1860 — legacy cases',
  },
  ita: {
    label: 'Income Tax Act',
    shortLabel: 'ITA GPT',
    prefix: '\\ita ',
    color: '#fbbf24',
    icon: '💼',
    description: 'Income-tax Act 2025 — deductions, TDS',
  },
  itr: {
    label: 'Income Tax Rules',
    shortLabel: 'ITR GPT',
    prefix: '\\itr ',
    color: '#fb7185',
    icon: '📑',
    description: 'Income-tax Rules 2026',
  },
  criminal: {
    label: 'Criminal Law (All)',
    shortLabel: 'Criminal GPT',
    prefix: '\\criminal ',
    color: '#a78bfa',
    icon: '🔒',
    description: 'BNS + CrPC combined',
  },
  tax: {
    label: 'Tax Law (All)',
    shortLabel: 'Tax GPT',
    prefix: '\\tax ',
    color: '#fbbf24',
    icon: '💰',
    description: 'ITA + ITR combined',
  },
}

export const SIDEBAR_GPTS: DomainKey[] = ['bns', 'crpc', 'ipc', 'ita', 'criminal']

export function getDomainPrefix(domain: DomainKey): string {
  return DOMAIN_OPTIONS[domain]?.prefix ?? ''
}
