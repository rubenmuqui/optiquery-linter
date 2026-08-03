import { describe, it, expect } from 'vitest';
import { Project } from 'ts-morph';
import { noDeprecatedFindOneRule } from '../../../src/plugins/prisma/no-deprecated-find-one.js';

describe('Rule: prisma/no-deprecated-find-one', () => {
  const project = new Project({ useInMemoryFileSystem: true });

  it('should detect deprecated findOne() usage', () => {
    const badCode = `
      const user = await prisma.user.findOne({
        where: { id: 1 }
      });
    `;
    const sourceFile = project.createSourceFile('bad-find-one.ts', badCode, { overwrite: true });

    const issues = noDeprecatedFindOneRule.analyze(sourceFile, 'bad-find-one.ts');

    expect(issues).toHaveLength(1);
    expect(issues[0]?.ruleId).toBe('prisma/no-deprecated-find-one');
    expect(issues[0]?.fixed).toBeFalsy();
  });

  it('should auto-fix findOne() to findUnique() when fix mode is enabled', () => {
    const fixableCode = `
      const user = await prisma.user.findOne({
        where: { id: 1 }
      });
    `;
    const sourceFile = project.createSourceFile('fix-find-one.ts', fixableCode, { overwrite: true });

    const issues = noDeprecatedFindOneRule.analyze(sourceFile, 'fix-find-one.ts', true);

    expect(issues).toHaveLength(1);
    expect(issues[0]?.fixed).toBe(true);
    expect(sourceFile.getText()).toContain('prisma.user.findUnique');
  });

  it('should ignore modern findUnique() usage', () => {
    const goodCode = `
      const user = await prisma.user.findUnique({
        where: { id: 1 }
      });
    `;
    const sourceFile = project.createSourceFile('good-find-unique.ts', goodCode, { overwrite: true });

    const issues = noDeprecatedFindOneRule.analyze(sourceFile, 'good-find-unique.ts');

    expect(issues).toHaveLength(0);
  });
});