import { describe, it, expect } from 'vitest';
import { Project } from 'ts-morph';
import { noImplicitInsertRule } from '../../../src/plugins/sql/no-implicit-insert.js';

describe('Rule: sql/no-implicit-insert', () => {
  const project = new Project({ useInMemoryFileSystem: true });

  it('should detect INSERT without explicit columns', () => {
    const badCode = `
      await db.query("INSERT INTO users VALUES (1, 'admin@test.com', 'hashedpassword')");
    `;
    const sourceFile = project.createSourceFile('bad-insert.ts', badCode, { overwrite: true });
    
    const issues = noImplicitInsertRule.analyze(sourceFile, 'bad-insert.ts');
    
    expect(issues).toHaveLength(1);
    expect(issues[0]?.ruleId).toBe('sql/no-implicit-insert');
  });

  it('should pass if INSERT explicitly declares columns', () => {
    const goodCode = `
      await prisma.$executeRaw\`INSERT INTO users (id, email, password) VALUES (1, 'admin@test.com', 'hashed')\`;
    `;
    const sourceFile = project.createSourceFile('good-insert.ts', goodCode, { overwrite: true });
    
    const issues = noImplicitInsertRule.analyze(sourceFile, 'good-insert.ts');
    
    expect(issues).toHaveLength(0);
  });
});