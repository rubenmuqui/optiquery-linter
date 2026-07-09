import { describe, it, expect } from 'vitest';
import { Project } from 'ts-morph';
import { noSelectStarRule } from '../../../src/plugins/sql/no-select-star.js';

describe('Rule: sql/no-select-star', () => {
  const project = new Project({ useInMemoryFileSystem: true });

  it('should detect SELECT * in string literals (e.g., db.query)', () => {
    const badCode = `
      const users = await db.query("SELECT * FROM users WHERE active = 1");
    `;
    const sourceFile = project.createSourceFile('bad-sql-string.ts', badCode, { overwrite: true });
    
    const issues = noSelectStarRule.analyze(sourceFile, 'bad-sql-string.ts');
    
    expect(issues).toHaveLength(1);
    expect(issues[0]?.ruleId).toBe('sql/no-select-star');
  });

  it('should detect SELECT * in template literals (e.g., prisma.$queryRaw)', () => {
    const badCode = `
      const users = await prisma.$queryRaw\`SELECT * FROM users\`;
    `;
    const sourceFile = project.createSourceFile('bad-sql-template.ts', badCode, { overwrite: true });
    
    const issues = noSelectStarRule.analyze(sourceFile, 'bad-sql-template.ts');
    
    expect(issues).toHaveLength(1);
    expect(issues[0]?.ruleId).toBe('sql/no-select-star');
  });

  it('should pass if specific columns are selected', () => {
    const goodCode = `
      const users = await db.query("SELECT id, name, email FROM users WHERE active = 1");
      const posts = await prisma.$queryRaw\`SELECT title FROM posts\`;
    `;
    const sourceFile = project.createSourceFile('good-sql.ts', goodCode, { overwrite: true });
    
    const issues = noSelectStarRule.analyze(sourceFile, 'good-sql.ts');
    
    expect(issues).toHaveLength(0);
  });
});