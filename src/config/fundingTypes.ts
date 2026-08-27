import type { FundingType } from '../types'

export type FundingTypeInfo = {
  id: FundingType
  emoji: string
  label: string
  short: string
  blurb: string
}

export const FUNDING_TYPES: Record<FundingType, FundingTypeInfo> = {
  taxes: {
    id: 'taxes',
    emoji: '🧾',
    label: 'Tax revenue',
    short: 'Taxes',
    blurb: 'What people and companies pay in',
  },
  appropriation: {
    id: 'appropriation',
    emoji: '🗳️',
    label: 'Appropriation',
    short: 'Appropriation',
    blurb: 'Money Congress sets aside for an agency in a spending bill',
  },
  formula: {
    id: 'formula',
    emoji: '📊',
    label: 'Formula grant',
    short: 'Formula',
    blurb: 'Shared out by a formula in the law — population, poverty, need',
  },
  competitive: {
    id: 'competitive',
    emoji: '🏆',
    label: 'Competitive grant',
    short: 'Competitive',
    blurb: 'Applicants compete and the agency picks the winners',
  },
  block: {
    id: 'block',
    emoji: '🧱',
    label: 'Block grant',
    short: 'Block',
    blurb: 'A lump sum the receiver can spend flexibly',
  },
  coop: {
    id: 'coop',
    emoji: '🪢',
    label: 'Cooperative agreement',
    short: 'Co-op',
    blurb: 'A grant where the agency stays closely involved',
  },
  subaward: {
    id: 'subaward',
    emoji: '🧩',
    label: 'Pass-through subaward',
    short: 'Subaward',
    blurb: 'A slice handed on to another organization to carry out',
  },
  earmark: {
    id: 'earmark',
    emoji: '📌',
    label: 'Congressional earmark',
    short: 'Earmark',
    blurb: 'Directed by Congress to one named project',
  },
  contract: {
    id: 'contract',
    emoji: '📜',
    label: 'Procurement contract',
    short: 'Contract',
    blurb: 'Payment for goods or services the government bought',
  },
  reimbursement: {
    id: 'reimbursement',
    emoji: '♻️',
    label: 'Reimbursement',
    short: 'Reimburse',
    blurb: 'Paid back after the money has already been spent',
  },
  loan: {
    id: 'loan',
    emoji: '💳',
    label: 'Loan or guarantee',
    short: 'Loan',
    blurb: 'Has to be repaid, or is a promise to cover someone’s debt',
  },
  interagency: {
    id: 'interagency',
    emoji: '🔁',
    label: 'Interagency agreement',
    short: 'Interagency',
    blurb: 'One government office paying another',
  },
  voucher: {
    id: 'voucher',
    emoji: '🎟️',
    label: 'Voucher or benefit',
    short: 'Voucher',
    blurb: 'Paid on a person’s behalf, or straight to them',
  },
  taxCredit: {
    id: 'taxCredit',
    emoji: '🪙',
    label: 'Tax credit',
    short: 'Tax credit',
    blurb: 'A cut in taxes owed rather than a payment out',
  },
  match: {
    id: 'match',
    emoji: '🪞',
    label: 'Match or cost share',
    short: 'Match',
    blurb: 'The receiver’s own share that the award requires',
  },
  indirect: {
    id: 'indirect',
    emoji: '🧮',
    label: 'Indirect cost recovery',
    short: 'Indirect',
    blurb: 'Overhead paid on top of the program costs',
  },
  donation: {
    id: 'donation',
    emoji: '💝',
    label: 'Private donation',
    short: 'Donation',
    blurb: 'A gift from a private funder',
  },
}

export const FUNDING_TYPE_GROUPS: { title: string; ids: FundingType[] }[] = [
  { title: 'Where it starts', ids: ['taxes', 'appropriation'] },
  {
    title: 'Grants',
    ids: ['formula', 'competitive', 'block', 'coop', 'subaward', 'earmark'],
  },
  { title: 'Buying and paying back', ids: ['contract', 'reimbursement', 'loan', 'interagency'] },
  { title: 'Reaching people', ids: ['voucher', 'taxCredit'] },
  { title: 'Everything else', ids: ['match', 'indirect', 'donation'] },
]
