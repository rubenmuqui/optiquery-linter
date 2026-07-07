import { describe, it, expect } from 'vitest';
import { Project } from 'ts-morph';
import { noUnboundedQueryRule } from '../../../src/plugins/prisma/no-unbounded-query.js';

describe('Rule: prisma/no-unbounded-query', () => {
  const project = new Project({ useInMemoryFileSystem: true });

  it('should detect findMany queries missing the take clause', () => {
    const badCode = `
      const logs = await prisma.log.findMany({
        where: { status: 'ERROR' }
      });
    `;
    const sourceFile = project.createSourceFile('bad-unbounded.ts', badCode, { overwrite: true });
    
    const issues = noUnboundedQueryRule.analyze(sourceFile, 'bad-unbounded.ts');
    
    expect(issues).toHaveLength(1);
    expect(issues[0]?.ruleId).toBe('prisma/no-unbounded-query');
  });

  it('should pass if the take clause is present', () => {
    const goodCode = `
      const logs = await prisma.log.findMany({
        where: { status: 'ERROR' },
        take: 100
      });
    `;
    const sourceFile = project.createSourceFile('good-unbounded.ts', goodCode, { overwrite: true });
    
    const issues = noUnboundedQueryRule.analyze(sourceFile, 'good-unbounded.ts');
    
    expect(issues).toHaveLength(0);
  });

  it('should ignore findUnique queries (since they inherently return 1 record)', () => {
    const goodCode = `
      const user = await prisma.user.findUnique({
        where: { id: 1 }
      });
    `;
    const sourceFile = project.createSourceFile('ignore-unique.ts', goodCode, { overwrite: true });
    
    const issues = noUnboundedQueryRule.analyze(sourceFile, 'ignore-unique.ts');
    
    expect(issues).toHaveLength(0);
  });
});