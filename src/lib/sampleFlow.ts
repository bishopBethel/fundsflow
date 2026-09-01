import { columnX } from './layout'
import type { FundNode, MoneyEdge, MoneyEdgeData } from '../types'

const node = (
  id: string,
  kind: FundNode['data']['kind'],
  label: string,
  x: number,
  y: number,
  pot?: number,
): FundNode => ({ id, type: 'fund', position: { x, y }, data: { kind, label, pot } })

const edge = (
  id: string,
  source: string,
  target: string,
  amount: number,
  tags: Omit<MoneyEdgeData, 'amount'> = {},
): MoneyEdge => ({ id, source, target, type: 'money', data: { amount, ...tags } })

export const sampleNodes: FundNode[] = [
  node('n1', 'taxpayers', 'U.S. Taxpayers', columnX(0), 210, 12_000_000),
  node('n17', 'feeRevenue', 'FDA User Fees', columnX(0), 470, 900_000),
  node('n2', 'congress', 'Congress — FY26 Bill', columnX(1), 300),
  node('n3', 'federal', 'Health & Human Services', columnX(2), 120),
  node('n4', 'federal', 'Housing & Urban Dev.', columnX(2), 500),
  node('n5', 'blockGrant', 'Community Services Block Grant', columnX(3), 20),
  node('n6', 'competitiveGrant', 'Healthy Cities NOFO', columnX(3), 250),
  node('n7', 'voucher', 'Housing Choice Vouchers', columnX(3), 500),
  node('n8', 'state', 'State of Jefferson', columnX(4), 20),
  node('n9', 'city', 'City of Riverside', columnX(4), 250),
  node('n10', 'household', 'Riverside Families', columnX(4), 500),
  node('n11', 'subgrant', 'County Subawards', columnX(5), -60),
  node('n12', 'govContract', 'Clinic Build Contract', columnX(5), 250),
  node('n13', 'ngo', 'Neighbors United', columnX(6), -140),
  node('n14', 'ngo', 'Food For All', columnX(6), 40),
  node('n15', 'vendor', 'BrickWorks Construction', columnX(6), 250),
  node('n16', 'community', 'Riverside Neighborhoods', columnX(7), -50),
]

export const sampleEdges: MoneyEdge[] = [
  edge('e1', 'n1', 'n2', 12_000_000, { fundingType: 'taxes' }),
  edge('e17', 'n17', 'n3', 900_000, {
    fundingType: 'userFee',
    duration: 'noYear',
    spendingUse: 'operational',
    spendingRoute: 'direct',
  }),
  edge('e2', 'n2', 'n3', 7_500_000, {
    fundingType: 'discretionary',
    duration: 'singleYear',
    spendingUse: 'programmatic',
  }),
  edge('e3', 'n2', 'n4', 4_500_000, {
    fundingType: 'discretionary',
    duration: 'multiYear',
    spendingUse: 'programmatic',
  }),
  edge('e4', 'n3', 'n5', 4_000_000, { fundingType: 'block', spendingRoute: 'indirect' }),
  edge('e5', 'n3', 'n6', 3_000_000, { fundingType: 'competitive', spendingRoute: 'indirect' }),
  edge('e6', 'n4', 'n7', 4_200_000, { fundingType: 'voucher', spendingRoute: 'direct' }),
  edge('e7', 'n5', 'n8', 4_000_000, { fundingType: 'formula' }),
  edge('e8', 'n6', 'n9', 3_000_000, { fundingType: 'competitive' }),
  edge('e9', 'n7', 'n10', 4_200_000, { fundingType: 'voucher', spendingRoute: 'direct' }),
  edge('e10', 'n8', 'n11', 2_600_000, { fundingType: 'subaward', spendingRoute: 'indirect' }),
  edge('e11', 'n9', 'n12', 1_800_000, { fundingType: 'contract', spendingRoute: 'indirect' }),
  edge('e12', 'n11', 'n13', 1_200_000, { fundingType: 'subaward' }),
  edge('e13', 'n11', 'n14', 1_300_000, { fundingType: 'subaward' }),
  edge('e14', 'n12', 'n15', 1_800_000, { fundingType: 'contract' }),
  edge('e15', 'n13', 'n16', 900_000),
  edge('e16', 'n14', 'n16', 1_000_000),
]
