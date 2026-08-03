import { describe, it, expect } from 'vitest';
import { Project } from 'ts-morph';
import { noUnboundedMutationRule } from '../../../src/plugins/prisma/no-unbounded-mutation.js';

describe('Rule: prisma/no-unbounded-mutation', () => {
  const project = new Project({ useInMemoryFileSystem: true });

  it('should detect updateMany without where clause', () => {
    const badCode = `
      await prisma.user.updateMany({
        data: { active: false }
      });
    `;
    const sourceFile = project.createSourceFile('bad-update-many.ts', badCode, { overwrite: true });

    const issues = noUnboundedMutationRule.analyze(sourceFile, 'bad-update-many.ts');

    expect(issues).toHaveLength(1);
    expect(issues[0]?.ruleId).toBe('prisma/no-unbounded-mutation');
  });

  it('should detect deleteMany with empty where object', () => {
    const badCode = `
      await prisma.session.deleteMany({
        where: {}
      });
    `;
    const sourceFile = project.createSourceFile('bad-delete-many.ts', badCode, { overwrite: true });

    const issues = noUnboundedMutationRule.analyze(sourceFile, 'bad-delete-many.ts');

    expect(issues).toHaveLength(1);
    expect(issues[0]?.ruleId).toBe('prisma/no-unbounded-mutation');
  });

  it('should pass when updateMany has a restrictive where clause', () => {
    const goodCode = `
      await prisma.user.updateMany({
        where: { lastLogin: { lt: new Date('2024-01-01') } },
        data: { active: false }
      });
    `;
    const sourceFile = project.createSourceFile('good-update-many.ts', goodCode, { overwrite: true });

    const issues = noUnboundedMutationRule.analyze(sourceFile, 'good-update-many.ts');

    expect(issues).toHaveLength(0);
  });
});