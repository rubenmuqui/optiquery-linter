import type { LinterRule, LinterIssue } from '../../core/types.js';
import { SyntaxKind, SourceFile, ObjectLiteralExpression } from 'ts-morph';

export const noOffsetPaginationWithoutOrderRule: LinterRule = {
  id: 'prisma/no-offset-pagination-without-order',
  description: 'Detects offset pagination (skip + take) without orderBy in Prisma findMany queries',

  analyze: (astNode: any, filePath: string): LinterIssue[] => {
    const issues: LinterIssue[] = [];
    const sourceFile = astNode as SourceFile;

    const callExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);

    for (const call of callExpressions) {
      const expression = call.getExpression();

      if (!expression.isKind(SyntaxKind.PropertyAccessExpression)) {
        continue;
      }

      if (expression.getName() !== 'findMany') {
        continue;
      }

      const ownerExpressionText = expression.getExpression().getText();
      if (!ownerExpressionText.startsWith('prisma.')) {
        continue;
      }

      const args = call.getArguments();
      if (args.length === 0 || !args[0]?.isKind(SyntaxKind.ObjectLiteralExpression)) {
        continue;
      }

      const queryArgs = args[0] as ObjectLiteralExpression;
      const hasSkip = queryArgs.getProperty('skip') !== undefined;
      const hasTake = queryArgs.getProperty('take') !== undefined;
      const hasOrderBy = queryArgs.getProperty('orderBy') !== undefined;

      if (hasSkip && hasTake && !hasOrderBy) {
        issues.push({
          ruleId: 'prisma/no-offset-pagination-without-order',
          message: 'Offset pagination detected without orderBy. Results can be unstable between pages.',
          file: filePath,
          line: call.getStartLineNumber(),
          suggestion: "Add a deterministic 'orderBy' field (e.g., createdAt or id) when using skip/take pagination."
        });
      }
    }

    return issues;
  }
};