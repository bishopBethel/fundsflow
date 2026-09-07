import { columnX } from '../layout'
import { edge, node } from './build'
import type { FlowTemplate } from '../../types'

export const titleISchools: FlowTemplate = {
  id: 'title-i-schools',
  name: 'Title I school funding',
  blurb:
    'A formula written into the law splits national education money down to one district, and out to the classrooms.',
  nodes: [
    node('taxpayers', 'taxpayers', 'U.S. Taxpayers', columnX(0), 240, 18_400_000_000),
    node('congress', 'congress', 'Congress — FY26 Bill', columnX(1), 240),
    node('ed', 'federal', 'U.S. Dept. of Education', columnX(2), 240),
    node('titleI', 'formulaGrant', 'Title I, Part A', columnX(3), 240),
    node('sea', 'state', 'State Education Agency', columnX(4), 240),
    node('district', 'schoolDistrict', 'Riverside Unified', columnX(5), 240),
    node('tutoring', 'program', 'After-School Tutoring', columnX(6), 100),
    node('reading', 'program', 'Reading Specialists', columnX(6), 380),
    node('students', 'community', 'Students in Title I Schools', columnX(7), 240),
  ],
  edges: [
    edge('taxes', 'taxpayers', 'congress', 18_400_000_000, { fundingType: 'taxes' }),
    edge('approps', 'congress', 'ed', 18_400_000_000, {
      fundingType: 'appropriation',
      duration: 'singleYear',
      spendingUse: 'programmatic',
    }),
    edge('ed-title', 'ed', 'titleI', 18_400_000_000, {
      fundingType: 'formula',
      spendingRoute: 'indirect',
    }),
    edge('title-sea', 'titleI', 'sea', 640_000_000, {
      fundingType: 'formula',
      duration: 'singleYear',
      spendingRoute: 'indirect',
    }),
    edge('sea-district', 'sea', 'district', 42_000_000, {
      fundingType: 'formula',
      spendingRoute: 'indirect',
    }),
    edge('district-tutoring', 'district', 'tutoring', 16_000_000, {
      spendingUse: 'programmatic',
    }),
    edge('district-reading', 'district', 'reading', 14_000_000, {
      spendingUse: 'programmatic',
    }),
    edge('tutoring-students', 'tutoring', 'students', 16_000_000, { spendingRoute: 'direct' }),
    edge('reading-students', 'reading', 'students', 14_000_000, { spendingRoute: 'direct' }),
  ],
}
