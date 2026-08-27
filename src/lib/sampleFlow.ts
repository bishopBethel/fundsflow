import type { FundNode, FundingType, MoneyEdge } from '../types'

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
  fundingType?: FundingType,
): MoneyEdge => ({ id, source, target, type: 'money', data: { amount, fundingType } })

export const sampleNodes: FundNode[] = [
  node('n1', 'taxpayers', 'U.S. Taxpayers', 0, 300, 12_000_000),
  node('n2', 'congress', 'Congress — FY26 Bill', 320, 300),
  node('n3', 'federal', 'Health & Human Services', 640, 120),
  node('n4', 'federal', 'Housing & Urban Dev.', 640, 500),
  node('n5', 'blockGrant', 'Community Services Block Grant', 960, 20),
  node('n6', 'competitiveGrant', 'Healthy Cities NOFO', 960, 250),
  node('n7', 'voucher', 'Housing Choice Vouchers', 960, 500),
  node('n8', 'state', 'State of Jefferson', 1300, 20),
  node('n9', 'city', 'City of Riverside', 1300, 250),
  node('n10', 'household', 'Riverside Families', 1300, 500),
  node('n11', 'subgrant', 'County Subawards', 1620, -60),
  node('n12', 'govContract', 'Clinic Build Contract', 1620, 250),
  node('n13', 'ngo', 'Neighbors United', 1940, -140),
  node('n14', 'ngo', 'Food For All', 1940, 40),
  node('n15', 'vendor', 'BrickWorks Construction', 1940, 250),
  node('n16', 'community', 'Riverside Neighborhoods', 2260, -50),
]

export const sampleEdges: MoneyEdge[] = [
  edge('e1', 'n1', 'n2', 12_000_000, 'taxes'),
  edge('e2', 'n2', 'n3', 7_500_000, 'appropriation'),
  edge('e3', 'n2', 'n4', 4_500_000, 'appropriation'),
  edge('e4', 'n3', 'n5', 4_000_000, 'block'),
  edge('e5', 'n3', 'n6', 3_000_000, 'competitive'),
  edge('e6', 'n4', 'n7', 4_200_000, 'voucher'),
  edge('e7', 'n5', 'n8', 4_000_000, 'formula'),
  edge('e8', 'n6', 'n9', 3_000_000, 'competitive'),
  edge('e9', 'n7', 'n10', 4_200_000, 'voucher'),
  edge('e10', 'n8', 'n11', 2_600_000, 'subaward'),
  edge('e11', 'n9', 'n12', 1_800_000, 'contract'),
  edge('e12', 'n11', 'n13', 1_200_000, 'subaward'),
  edge('e13', 'n11', 'n14', 1_300_000, 'subaward'),
  edge('e14', 'n12', 'n15', 1_800_000, 'contract'),
  edge('e15', 'n13', 'n16', 900_000),
  edge('e16', 'n14', 'n16', 1_000_000),
]
