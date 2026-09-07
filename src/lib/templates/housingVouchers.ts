import { columnX } from '../layout'
import { edge, node } from './build'
import type { FlowTemplate } from '../../types'

export const housingVouchers: FlowTemplate = {
  id: 'housing-vouchers',
  name: 'Housing choice vouchers',
  blurb:
    'Rent help never touches the family it belongs to — a housing authority pays the landlord on their behalf.',
  nodes: [
    node('congress', 'congress', 'Congress — FY26 Bill', columnX(0), 240, 32_000_000_000),
    node('hud', 'federal', 'Housing & Urban Development', columnX(1), 240),
    node('section8', 'voucher', 'Housing Choice Vouchers (Section 8)', columnX(2), 160),
    node('fss', 'competitiveGrant', 'Family Self-Sufficiency NOFO', columnX(2), 440),
    node('pha', 'city', 'Riverside Housing Authority', columnX(3), 160),
    node('support', 'ngo', 'Tenant Support Services', columnX(3), 440),
    node('families', 'household', 'Voucher Families', columnX(4), 120),
    node('landlords', 'vendor', 'Private Landlords', columnX(5), 120),
    node('renters', 'community', 'Riverside Renters', columnX(5), 400),
  ],
  edges: [
    edge('approps', 'congress', 'hud', 32_000_000_000, {
      fundingType: 'appropriation',
      duration: 'singleYear',
      spendingUse: 'programmatic',
    }),
    edge('hud-s8', 'hud', 'section8', 30_000_000_000, {
      fundingType: 'voucher',
      spendingRoute: 'direct',
    }),
    edge('hud-fss', 'hud', 'fss', 120_000_000, {
      fundingType: 'competitive',
      spendingRoute: 'indirect',
    }),
    edge('s8-pha', 'section8', 'pha', 58_000_000, {
      fundingType: 'voucher',
      duration: 'singleYear',
      spendingRoute: 'indirect',
    }),
    edge('fss-support', 'fss', 'support', 1_400_000, {
      fundingType: 'subaward',
      spendingRoute: 'indirect',
    }),
    edge('pha-families', 'pha', 'families', 54_000_000, {
      fundingType: 'voucher',
      spendingUse: 'programmatic',
      spendingRoute: 'direct',
    }),
    edge('families-landlords', 'families', 'landlords', 54_000_000, { spendingRoute: 'direct' }),
    edge('support-renters', 'support', 'renters', 1_400_000, { spendingRoute: 'direct' }),
  ],
}
