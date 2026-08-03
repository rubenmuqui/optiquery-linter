import { describe, it, expect } from 'vitest';
import { Project } from 'ts-morph';
import { noOffsetPaginationWithoutOrderRule } from '../../../src/plugins/prisma/no-offset-pagination-without-order.js';

describe('Rule: prisma/no-offset-pagination-without-order', () => {
  const project = new Project({ useInMemoryFileSystem: true });

  it('should detect skip/take pagination without orderBy', () => {
    const badCode = `
      const users = await prisma.user.findMany({
        skip: 20,
        take: 10
      });
    `;
    const sourceFile = project.createSourceFile('bad-offset.ts', badCode, { overwrite: true });

    const issues = noOffsetPaginationWithoutOrderRule.analyze(sourceFile, 'bad-offset.ts');

    expect(issues).toHaveLength(1);
    expect(issues[0]?.ruleId).toBe('prisma/no-offset-pagination-without-order');
  });

  it('should pass when skip/take includes orderBy', () => {
    const goodCode = `
      const users = await prisma.user.findMany({
        skip: 20,
        take: 10,
        orderBy: { id: 'asc' }
      });
    `;
    const sourceFile = project.createSourceFile('good-offset.ts', goodCode, { overwrite: true });

    const issues = noOffsetPaginationWithoutOrderRule.analyze(sourceFile, 'good-offset.ts');

    expect(issues).toHaveLength(0);
  });

  it('should ignore queries that do not use skip/take together', () => {
    const code = `
      const users = await prisma.user.findMany({
        take: 10
      });
    `;
    const sourceFile = project.createSourceFile('ignore-take-only.ts', code, { overwrite: true });

    const issues = noOffsetPaginationWithoutOrderRule.analyze(sourceFile, 'ignore-take-only.ts');

    expect(issues).toHaveLength(0);
  });
});