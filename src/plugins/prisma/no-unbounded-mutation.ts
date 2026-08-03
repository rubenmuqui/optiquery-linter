import type { LinterRule, LinterIssue } from '../../core/types.js';
import { SyntaxKind, SourceFile, ObjectLiteralExpression, PropertyAssignment } from 'ts-morph';

export const noUnboundedMutationRule: LinterRule = {
  id: 'prisma/no-unbounded-mutation',
  description: 'Detects updateMany/deleteMany calls without a bounded where clause',

  analyze: (astNode: any, filePath: string): LinterIssue[] => {
    const issues: LinterIssue[] = [];
    const sourceFile = astNode as SourceFile;

    const callExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);

    for (const call of callExpressions) {
      const expression = call.getExpression();

      if (!expression.isKind(SyntaxKind.PropertyAccessExpression)) {
        continue;
      }

      const methodName = expression.getName();
      if (methodName !== 'updateMany' && methodName !== 'deleteMany') {
        continue;
      }

      const ownerExpressionText = expression.getExpression().getText();
      if (!ownerExpressionText.startsWith('prisma.')) {
        continue;
      }

      const args = call.getArguments();
      let isUnbounded = false;

      if (args.length === 0) {
        isUnbounded = true;
      } else if (args[0]?.isKind(SyntaxKind.ObjectLiteralExpression)) {
        const queryArgs = args[0] as ObjectLiteralExpression;
        const whereProperty = queryArgs.getProperty('where');

        if (!whereProperty) {
          isUnbounded = true;
        } else if (whereProperty.isKind(SyntaxKind.PropertyAssignment)) {
          const whereAssignment = whereProperty as PropertyAssignment;
          const initializer = whereAssignment.getInitializer();

          if (initializer?.isKind(SyntaxKind.ObjectLiteralExpression)) {
            const whereObject = initializer as ObjectLiteralExpression;
            if (whereObject.getProperties().length === 0) {
              isUnbounded = true;
            }
          }
        }
      }

      if (isUnbounded) {
        issues.push({
          ruleId: 'prisma/no-unbounded-mutation',
          message: `Potentially dangerous Prisma mutation detected: ${methodName}() without a restrictive where clause.`,
          file: filePath,
          line: call.getStartLineNumber(),
          suggestion: `Add a scoped 'where' condition to ${methodName}() to avoid affecting unintended rows.`
        });
      }
    }

    return issues;
  }
};