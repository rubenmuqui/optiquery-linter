import { describe, it, expect } from 'vitest';
import { Project } from 'ts-morph';
import { noUnboundedModifyRule } from '../../../src/plugins/sql/no-unbounded-modify.js';

describe('Rule: sql/no-unbounded-modify', () => {
  const project = new Project({ useInMemoryFileSystem: true });

  it('should detect UPDATE without WHERE clause', () => {
    const badCode = `
      const result = await db.query("UPDATE users SET active = 0");
    `;
    const sourceFile = project.createSourceFile('bad-update.ts', badCode, { overwrite: true });
    
    const issues = noUnboundedModifyRule.analyze(sourceFile, 'bad-update.ts');
    
    expect(issues).toHaveLength(1);
    expect(issues[0]?.ruleId).toBe('sql/no-unbounded-modify');
  });

  it('should detect DELETE without WHERE clause in Prisma $executeRaw', () => {
    const badCode = `
      const result = await prisma.$executeRaw\`DELETE FROM sessions\`;
    `;
    const sourceFile = project.createSourceFile('bad-delete.ts', badCode, { overwrite: true });
    
    const issues = noUnboundedModifyRule.analyze(sourceFile, 'bad-delete.ts');
    
    expect(issues).toHaveLength(1);
    expect(issues[0]?.ruleId).toBe('sql/no-unbounded-modify');
  });

  it('should pass if UPDATE or DELETE has a WHERE clause', () => {
    const goodCode = `
      const updateRes = await db.query("UPDATE users SET active = 0 WHERE id = 1");
      const deleteRes = await prisma.$executeRaw\`DELETE FROM sessions WHERE expired = true\`;
    `;
    const sourceFile = project.createSourceFile('good-modify.ts', goodCode, { overwrite: true });
    
    const issues = noUnboundedModifyRule.analyze(sourceFile, 'good-modify.ts');
    
    expect(issues).toHaveLength(0);
  });
});