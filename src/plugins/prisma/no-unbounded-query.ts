import type { LinterRule, LinterIssue } from '../../core/types.js';
import { SyntaxKind, SourceFile, ObjectLiteralExpression } from 'ts-morph';

export const noUnboundedQueryRule: LinterRule = {
  id: 'prisma/no-unbounded-query',
  description: 'Detects Prisma findMany queries without a take/limit clause to prevent memory exhaustion',
  
  analyze: (astNode: any, filePath: string, isFixMode?: boolean): LinterIssue[] => {
    const issues: LinterIssue[] = [];
    const sourceFile = astNode as SourceFile;

    const callExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);

    for (const call of callExpressions) {
      const expression = call.getExpression();
      
      if (expression.isKind(SyntaxKind.PropertyAccessExpression)) {
        const methodName = expression.getName();
        
        if (methodName === 'findMany') {
          const args = call.getArguments();
          let hasTake = false;
          let firstArg = args[0];

          if (firstArg && firstArg.isKind(SyntaxKind.ObjectLiteralExpression)) {
            const obj = firstArg as ObjectLiteralExpression;
            hasTake = obj.getProperty('take') !== undefined;
          }

          if (!hasTake) {
            let fixed = false;

            if (isFixMode) {
              try {
                if (args.length === 0) {
                  call.addArgument('{ take: 100 }');
                  fixed = true;
                } else if (firstArg && firstArg.isKind(SyntaxKind.ObjectLiteralExpression)) {
                  const obj = firstArg as ObjectLiteralExpression;
                  obj.addPropertyAssignment({ name: 'take', initializer: '100' });
                  fixed = true;
                }
              } catch (e) {
                fixed = false;
              }
            }

            issues.push({
              ruleId: 'prisma/no-unbounded-query',
              message: `Unbounded Prisma query detected. Use 'take' to limit the result set.`,
              file: filePath,
              line: call.getStartLineNumber(),
              suggestion: "Add { take: 100 } (or another appropriate limit) to your findMany query.",
              fixed: fixed
            });
          }
        }
      }
    }

    return issues;
  }
};