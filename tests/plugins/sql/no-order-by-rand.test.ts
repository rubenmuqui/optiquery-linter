import { describe, it, expect } from 'vitest';
import { Project } from 'ts-morph';
import { noOrderByRandRule } from '../../../src/plugins/sql/no-order-by-rand.js';

describe('Rule: sql/no-order-by-rand', () => {
  const project = new Project({ useInMemoryFileSystem: true });

  it('should detect ORDER BY RAND() in a query', () => {
    const badCode = `
      const randomUser = await db.query("SELECT * FROM users ORDER BY RAND() LIMIT 1");
    `;
    const sourceFile = project.createSourceFile('bad-rand.ts', badCode, { overwrite: true });
    
    const issues = noOrderByRandRule.analyze(sourceFile, 'bad-rand.ts');
    
    expect(issues).toHaveLength(1);
    expect(issues[0]?.ruleId).toBe('sql/no-order-by-rand');
  });

  it('should detect ORDER BY RANDOM() in Prisma template literals', () => {
    const badCode = `
      const randomPost = await prisma.$queryRaw\`SELECT title FROM posts ORDER BY RANDOM() LIMIT 5\`;
    `;
    const sourceFile = project.createSourceFile('bad-random.ts', badCode, { overwrite: true });
    
    const issues = noOrderByRandRule.analyze(sourceFile, 'bad-random.ts');
    
    expect(issues).toHaveLength(1);
  });

  it('should pass if ORDER BY uses standard columns', () => {
    const goodCode = `
      const latestUsers = await db.query("SELECT id FROM users ORDER BY created_at DESC LIMIT 10");
    `;
    const sourceFile = project.createSourceFile('good-order.ts', goodCode, { overwrite: true });
    
    const issues = noOrderByRandRule.analyze(sourceFile, 'good-order.ts');
    
    expect(issues).toHaveLength(0);
  });
});