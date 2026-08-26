import type { BlockKind, BlockRole } from '../types'

export type BlockType = {
  kind: BlockKind
  role: BlockRole
  emoji: string
  label: string
  blurb: string
  color: string
  colorSoft: string
}

export const BLOCK_TYPES: Record<BlockKind, BlockType> = {
  federal: {
    kind: 'federal',
    role: 'source',
    emoji: '🦅',
    label: 'Federal Agency',
    blurb: 'Big national pot of money',
    color: '#2563eb',
    colorSoft: '#dbeafe',
  },
  state: {
    kind: 'state',
    role: 'source',
    emoji: '🏛️',
    label: 'State Government',
    blurb: 'Statewide funds and budgets',
    color: '#4f46e5',
    colorSoft: '#e0e7ff',
  },
  city: {
    kind: 'city',
    role: 'source',
    emoji: '🏙️',
    label: 'City / Local Gov',
    blurb: 'Your town or county’s money',
    color: '#0891b2',
    colorSoft: '#cffafe',
  },
  foundation: {
    kind: 'foundation',
    role: 'source',
    emoji: '💼',
    label: 'Private Foundation',
    blurb: 'Philanthropic giving',
    color: '#9333ea',
    colorSoft: '#f3e8ff',
  },
  grant: {
    kind: 'grant',
    role: 'vehicle',
    emoji: '🎁',
    label: 'Grant',
    blurb: 'Money given for a purpose',
    color: '#16a34a',
    colorSoft: '#dcfce7',
  },
  govContract: {
    kind: 'govContract',
    role: 'vehicle',
    emoji: '📜',
    label: 'Government Contract',
    blurb: 'Paid work for the government',
    color: '#d97706',
    colorSoft: '#fef3c7',
  },
  privContract: {
    kind: 'privContract',
    role: 'vehicle',
    emoji: '🤝',
    label: 'Private Contract',
    blurb: 'A deal between organizations',
    color: '#ea580c',
    colorSoft: '#ffedd5',
  },
  subgrant: {
    kind: 'subgrant',
    role: 'vehicle',
    emoji: '🧩',
    label: 'Sub-grant',
    blurb: 'A grant passed further along',
    color: '#0d9488',
    colorSoft: '#ccfbf1',
  },
  ngo: {
    kind: 'ngo',
    role: 'recipient',
    emoji: '💗',
    label: 'NGO / Nonprofit',
    blurb: 'Mission-driven organization',
    color: '#e11d48',
    colorSoft: '#ffe4e6',
  },
  vendor: {
    kind: 'vendor',
    role: 'recipient',
    emoji: '🏪',
    label: 'Business / Vendor',
    blurb: 'A company doing the work',
    color: '#65a30d',
    colorSoft: '#ecfccb',
  },
  program: {
    kind: 'program',
    role: 'recipient',
    emoji: '🚀',
    label: 'Program / Project',
    blurb: 'Where the work happens',
    color: '#7c3aed',
    colorSoft: '#ede9fe',
  },
  community: {
    kind: 'community',
    role: 'recipient',
    emoji: '👥',
    label: 'People / Community',
    blurb: 'Who it all helps',
    color: '#059669',
    colorSoft: '#d1fae5',
  },
}

export const PALETTE_GROUPS: { title: string; hint: string; kinds: BlockKind[] }[] = [
  {
    title: 'Where money starts',
    hint: 'Give these a starting pot 💰',
    kinds: ['federal', 'state', 'city', 'foundation'],
  },
  {
    title: 'How money moves',
    hint: 'Pass money along',
    kinds: ['grant', 'govContract', 'privContract', 'subgrant'],
  },
  {
    title: 'Where money lands',
    hint: 'The good it does',
    kinds: ['ngo', 'vendor', 'program', 'community'],
  },
]
