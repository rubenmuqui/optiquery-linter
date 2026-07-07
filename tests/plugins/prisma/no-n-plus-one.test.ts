import { describe, it, expect } from 'vitest';
import { Project } from 'ts-morph';
import { noNPlusOneRule } from '../../../src/plugins/prisma/no-n-plus-one.js';

describe('Rule: prisma/no-n-plus-one', () => {
  const project = new Project({ useInMemoryFileSystem: true });

  it('should detect Prisma queries inside for...of loops (N+1 problem)', () => {
    const badCode = `
      const users = await prisma.user.findMany();
      for (const user of users) {
        const posts = await prisma.post.findMany({ where: { authorId: user.id } });
      }
    `;
    const sourceFile = project.createSourceFile('bad.ts', badCode, { overwrite: true });

    const issues = noNPlusOneRule.analyze(sourceFile, 'bad.ts');

    expect(issues).toHaveLength(1);
    expect(issues[0]?.ruleId).toBe('prisma/no-n-plus-one');
    expect(issues[0]?.line).toBe(4); 
  });

  it('should NOT detect issues if queries are outside loops', () => {
    const goodCode = `
      const users = await prisma.user.findMany();
      const userIds = users.map(u => u.id);
      const posts = await prisma.post.findMany({ where: { authorId: { in: userIds } } });
    `;
    const sourceFile = project.createSourceFile('good.ts', goodCode, { overwrite: true });

    const issues = noNPlusOneRule.analyze(sourceFile, 'good.ts');

    expect(issues).toHaveLength(0);
  });
});