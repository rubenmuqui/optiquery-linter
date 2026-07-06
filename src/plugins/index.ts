import type { LinterRule } from '../core/types.js';

import { noNPlusOneRule } from './prisma/no-n-plus-one.js';
import { noOverFetchingRule } from './prisma/no-over-fetching.js';

export const recommendedRules: LinterRule[] = [
  noNPlusOneRule,
  noOverFetchingRule
];