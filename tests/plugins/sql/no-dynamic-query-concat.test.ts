import { describe, it, expect } from 'vitest';
import { Project } from 'ts-morph';
import { noDynamicQueryConcatRule } from '../../../src/plugins/sql/no-dynamic-query-concat.js';

describe('Rule: sql/no-dynamic-query-concat', () => {
  const project = new Project({ useInMemoryFileSystem: true });

  it('should detect string concatenation in db.query', () => {
    const badCode = `
      const query = "SELECT * FROM users WHERE id = " + userId;
      const result = await db.query(query);
    `;
    const sourceFile = project.createSourceFile('bad-concat.ts', badCode, { overwrite: true });

    const issues = noDynamicQueryConcatRule.analyze(sourceFile, 'bad-concat.ts');

    expect(issues).toHaveLength(1);
    expect(issues[0]?.ruleId).toBe('sql/no-dynamic-query-concat');
  });

  it('should detect direct interpolated template in db.query', () => {
    const badCode = `
      const result = await db.query(` + "`SELECT * FROM users WHERE id = ${userId}`" + `);
    `;
    const sourceFile = project.createSourceFile('bad-template.ts', badCode, { overwrite: true });

    const issues = noDynamicQueryConcatRule.analyze(sourceFile, 'bad-template.ts');

    expect(issues).toHaveLength(1);
    expect(issues[0]?.ruleId).toBe('sql/no-dynamic-query-concat');
  });

  it('should detect interpolation in Prisma unsafe raw query API', () => {
    const badCode = `
      const id = 5;
      const result = await prisma.$queryRawUnsafe(` + "`SELECT * FROM users WHERE id = ${id}`" + `);
    `;
    const sourceFile = project.createSourceFile('bad-prisma-raw.ts', badCode, { overwrite: true });

    const issues = noDynamicQueryConcatRule.analyze(sourceFile, 'bad-prisma-raw.ts');

    expect(issues).toHaveLength(1);
    expect(issues[0]?.ruleId).toBe('sql/no-dynamic-query-concat');
  });

  it('should pass for static SQL literals and static tagged templates', () => {
    const goodCode = `
      const resultA = await db.query("SELECT id, email FROM users");
      const userId = 1;
      const resultB = await prisma.$queryRaw` + "`SELECT id FROM users WHERE id = ${userId}`" + `;
    `;
    const sourceFile = project.createSourceFile('good-static-sql.ts', goodCode, { overwrite: true });

    const issues = noDynamicQueryConcatRule.analyze(sourceFile, 'good-static-sql.ts');

    expect(issues).toHaveLength(0);
  });
});