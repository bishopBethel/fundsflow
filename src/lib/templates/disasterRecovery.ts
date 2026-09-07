import { columnX } from '../layout'
import { edge, node } from './build'
import type { FlowTemplate } from '../../types'

export const disasterRecovery: FlowTemplate = {
  id: 'disaster-recovery',
  name: 'Disaster recovery',
  blurb:
    'The deepest chain here: relief money passes through a state, a county and a city before a crew ever clears a street.',
  nodes: [
    node('drf', 'treasury', 'Disaster Relief Fund', columnX(0), 260, 20_000_000_000),
    node('fema', 'federal', 'FEMA', columnX(1), 260),
    node('pa', 'grant', 'Public Assistance Grant', columnX(2), 100),
    node('redcross', 'ngo', 'Red Cross Shelters', columnX(2), 460),
    node('state', 'state', 'State Emergency Management', columnX(3), 100),
    node('displaced', 'household', 'Displaced Families', columnX(3), 460),
    node('county', 'subgrant', 'County Subawards', columnX(4), 100),
    node('city', 'city', 'City of Riverside', columnX(5), 100),
    node('debris', 'govContract', 'Debris Removal Contract', columnX(6), 100),
    node('crew', 'vendor', 'Gulf Coast Restoration', columnX(7), 100),
    node('neighborhoods', 'community', 'Storm-Hit Neighborhoods', columnX(8), 180),
  ],
  edges: [
    edge('drf-fema', 'drf', 'fema', 20_000_000_000, {
      fundingType: 'appropriation',
      duration: 'noYear',
      spendingUse: 'programmatic',
    }),
    edge('fema-pa', 'fema', 'pa', 840_000_000, {
      fundingType: 'reimbursement',
      spendingRoute: 'indirect',
    }),
    edge('fema-redcross', 'fema', 'redcross', 46_000_000, {
      fundingType: 'coop',
      spendingUse: 'programmatic',
      spendingRoute: 'direct',
    }),
    edge('pa-state', 'pa', 'state', 840_000_000, {
      fundingType: 'reimbursement',
      duration: 'multiYear',
      spendingRoute: 'indirect',
    }),
    edge('state-county', 'state', 'county', 310_000_000, {
      fundingType: 'subaward',
      spendingRoute: 'indirect',
    }),
    edge('county-city', 'county', 'city', 74_000_000, {
      fundingType: 'subaward',
      spendingRoute: 'indirect',
    }),
    edge('city-debris', 'city', 'debris', 48_000_000, {
      fundingType: 'contract',
      spendingRoute: 'indirect',
    }),
    edge('debris-crew', 'debris', 'crew', 48_000_000, {
      fundingType: 'contract',
      spendingUse: 'programmatic',
    }),
    edge('crew-neighborhoods', 'crew', 'neighborhoods', 48_000_000, { spendingRoute: 'direct' }),
    edge('redcross-displaced', 'redcross', 'displaced', 46_000_000, {
      spendingUse: 'programmatic',
      spendingRoute: 'direct',
    }),
  ],
}
