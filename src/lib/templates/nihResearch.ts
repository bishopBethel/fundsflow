import { columnX } from '../layout'
import { edge, node } from './build'
import type { FlowTemplate } from '../../types'

export const nihResearch: FlowTemplate = {
  id: 'nih-research',
  name: 'NIH research grant',
  blurb:
    'One competitive award splits in two on arrival — direct costs for the science, indirect costs to keep the lights on.',
  nodes: [
    node('taxpayers', 'taxpayers', 'U.S. Taxpayers', columnX(0), 240, 47_000_000_000),
    node('congress', 'congress', 'Congress — FY26 Bill', columnX(1), 240),
    node('niaid', 'federal', 'NIH — NIAID', columnX(2), 240),
    node('r01', 'competitiveGrant', 'R01 Research Grant', columnX(3), 240),
    node('university', 'university', 'State University', columnX(4), 140),
    node('facilities', 'university', 'University Facilities & Admin', columnX(4), 420),
    node('lab', 'program', 'Vaccine Research Lab', columnX(5), 40),
    node('teaching', 'hospital', 'Teaching Hospital', columnX(5), 360),
    node('trials', 'community', 'Patients in Trials', columnX(6), 200),
  ],
  edges: [
    edge('taxes', 'taxpayers', 'congress', 47_000_000_000, { fundingType: 'taxes' }),
    edge('approps', 'congress', 'niaid', 6_600_000_000, {
      fundingType: 'appropriation',
      duration: 'multiYear',
      spendingUse: 'programmatic',
    }),
    edge('niaid-r01', 'niaid', 'r01', 3_900_000, {
      fundingType: 'competitive',
      duration: 'multiYear',
      spendingUse: 'programmatic',
      spendingRoute: 'indirect',
    }),
    edge('r01-university', 'r01', 'university', 2_600_000, {
      fundingType: 'competitive',
      duration: 'multiYear',
      spendingUse: 'programmatic',
      spendingRoute: 'direct',
    }),
    edge('r01-facilities', 'r01', 'facilities', 1_300_000, {
      fundingType: 'indirect',
      spendingUse: 'operational',
      spendingRoute: 'direct',
    }),
    edge('university-lab', 'university', 'lab', 1_700_000, { spendingUse: 'programmatic' }),
    edge('university-teaching', 'university', 'teaching', 800_000, {
      fundingType: 'contract',
      spendingUse: 'programmatic',
    }),
    edge('lab-trials', 'lab', 'trials', 1_700_000, { spendingRoute: 'direct' }),
    edge('teaching-trials', 'teaching', 'trials', 800_000, { spendingRoute: 'direct' }),
  ],
}
