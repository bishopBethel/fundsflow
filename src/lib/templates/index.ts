import { sampleEdges, sampleNodes } from '../sampleFlow'
import { disasterRecovery } from './disasterRecovery'
import { fdaDrugReview } from './fdaDrugReview'
import { housingVouchers } from './housingVouchers'
import { nihResearch } from './nihResearch'
import { titleISchools } from './titleISchools'
import type { FlowTemplate } from '../../types'

export const TEMPLATES: FlowTemplate[] = [
  fdaDrugReview,
  titleISchools,
  housingVouchers,
  disasterRecovery,
  nihResearch,
  {
    id: 'federal-grant-journey',
    name: 'Federal grant journey',
    blurb:
      'The original demo map — taxes and FDA user fees fanning out through two agencies to neighborhoods and families.',
    nodes: sampleNodes,
    edges: sampleEdges,
  },
]
