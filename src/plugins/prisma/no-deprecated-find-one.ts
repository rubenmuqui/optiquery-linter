import type { LinterRule, LinterIssue } from '../../core/types.js';
import { SyntaxKind, SourceFile } from 'ts-morph';

export const noDeprecatedFindOneRule: LinterRule = {
  id: 'prisma/no-deprecated-find-one',
  description: 'Detects deprecated Prisma findOne() calls and replaces them with findUnique()',

  analyze: (astNode: any, filePath: string, isFixMode?: boolean): LinterIssue[] => {
    const issues: LinterIssue[] = [];
    const sourceFile = astNode as SourceFile;

    const callExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);

    for (const call of callExpressions) {
      const expression = call.getExpression();

      if (!expression.isKind(SyntaxKind.PropertyAccessExpression)) {
        continue;
      }

      const methodName = expression.getName();
      if (methodName !== 'findOne') {
        continue;
      }

      const ownerExpressionText = expression.getExpression().getText();
      if (!ownerExpressionText.startsWith('prisma.')) {
        continue;
      }

      let fixed = false;

      if (isFixMode) {
        try {
          expression.replaceWithText(`${ownerExpressionText}.findUnique`);
          fixed = true;
        } catch (error) {
          fixed = false;
        }
      }

      issues.push({
        ruleId: 'prisma/no-deprecated-find-one',
        message: 'Deprecated Prisma method detected: findOne() has been replaced by findUnique().',
        file: filePath,
        line: call.getStartLineNumber(),
        suggestion: "Replace '.findOne(...)' with '.findUnique(...)' to align with modern Prisma APIs.",
        fixed
      });
    }

    return issues;
  }
};