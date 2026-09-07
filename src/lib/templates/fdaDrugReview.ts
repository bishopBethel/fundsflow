import { columnX } from '../layout'
import { edge, node } from './build'
import type { FlowTemplate } from '../../types'

export const fdaDrugReview: FlowTemplate = {
  id: 'fda-drug-review',
  name: 'FDA drug review',
  blurb:
    'Industry user fees sit alongside a congressional appropriation to pay for the review that clears a new medicine.',
  nodes: [
    node('taxpayers', 'taxpayers', 'U.S. Taxpayers', columnX(0), 120, 3_400_000_000),
    node('fees', 'feeRevenue', 'Pharma User Fees (PDUFA)', columnX(0), 400, 1_400_000_000),
    node('congress', 'congress', 'Congress — FY26 Approps', columnX(1), 120),
    node('fda', 'federal', 'Food & Drug Administration', columnX(2), 260),
    node('cder', 'program', 'Drug Review Program (CDER)', columnX(3), 100),
    node('labDeal', 'govContract', 'Lab Testing Contract', columnX(3), 400),
    node('sites', 'hospital', 'Clinical Trial Sites', columnX(4), 100),
    node('labs', 'vendor', 'Contract Testing Labs', columnX(4), 400),
    node('patients', 'community', 'Patients Getting New Medicines', columnX(5), 250),
  ],
  edges: [
    edge('taxes', 'taxpayers', 'congress', 3_400_000_000, { fundingType: 'taxes' }),
    edge('approps', 'congress', 'fda', 3_400_000_000, {
      fundingType: 'appropriation',
      duration: 'singleYear',
      spendingUse: 'programmatic',
    }),
    edge('fees-fda', 'fees', 'fda', 1_400_000_000, {
      fundingType: 'userFee',
      duration: 'noYear',
      spendingUse: 'operational',
      spendingRoute: 'direct',
    }),
    edge('fda-cder', 'fda', 'cder', 3_400_000_000, {
      fundingType: 'discretionary',
      spendingUse: 'programmatic',
    }),
    edge('fda-lab', 'fda', 'labDeal', 1_200_000_000, {
      fundingType: 'contract',
      spendingRoute: 'indirect',
    }),
    edge('cder-sites', 'cder', 'sites', 2_600_000_000, {
      fundingType: 'coop',
      spendingUse: 'programmatic',
    }),
    edge('lab-labs', 'labDeal', 'labs', 1_200_000_000, { fundingType: 'contract' }),
    edge('sites-patients', 'sites', 'patients', 2_400_000_000, { spendingRoute: 'direct' }),
  ],
}
