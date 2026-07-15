import type { LinterRule } from '../core/types.js';

import { noNPlusOneRule } from './prisma/no-n-plus-one.js';
import { noOverFetchingRule } from './prisma/no-over-fetching.js';
import { noUnboundedQueryRule } from './prisma/no-unbounded-query.js';
import { noSelectStarRule } from './sql/no-select-star.js';
import { noUnboundedModifyRule } from './sql/no-unbounded-modify.js'; 
import { noOrderByRandRule } from './sql/no-order-by-rand.js';
import { noImplicitInsertRule }  from './sql/no-implicit-insert.js';

export const recommendedRules: LinterRule[] = [
  noNPlusOneRule,
  noOverFetchingRule,
  noUnboundedQueryRule,
  noSelectStarRule,
  noUnboundedModifyRule,
  noOrderByRandRule,
  noImplicitInsertRule
];