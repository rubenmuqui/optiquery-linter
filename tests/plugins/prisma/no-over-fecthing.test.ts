import { describe, it, expect } from 'vitest';
import { Project } from 'ts-morph';
import { noOverFetchingRule } from '../../../src/plugins/prisma/no-over-fetching.js';

describe('Rule: prisma/no-over-fetching', () => {
  const project = new Project({ useInMemoryFileSystem: true });

  it('should detect queries missing the select clause', () => {
    const badCode = `
      const users = await prisma.user.findMany({
        where: { active: true }
      });
    `;
    const sourceFile = project.createSourceFile('bad-overfetch.ts', badCode, { overwrite: true });
    
    const issues = noOverFetchingRule.analyze(sourceFile, 'bad-overfetch.ts');
    
    expect(issues).toHaveLength(1);
    expect(issues[0]?.ruleId).toBe('prisma/no-over-fetching');
  });

  it('should pass if the select clause is present', () => {
    const goodCode = `
      const users = await prisma.user.findMany({
        where: { active: true },
        select: { id: true, name: true }
      });
    `;
    const sourceFile = project.createSourceFile('good-overfetch.ts', goodCode, { overwrite: true });
    
    const issues = noOverFetchingRule.analyze(sourceFile, 'good-overfetch.ts');
    
    expect(issues).toHaveLength(0);
  });
});