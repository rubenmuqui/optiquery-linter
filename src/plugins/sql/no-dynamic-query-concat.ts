import type { LinterRule, LinterIssue } from '../../core/types.js';
import { SyntaxKind, SourceFile, Expression, TemplateExpression, Identifier } from 'ts-morph';

const isDynamicSqlExpression = (expression: Expression): boolean => {
  if (expression.isKind(SyntaxKind.TemplateExpression)) {
    const template = expression as TemplateExpression;
    return template.getTemplateSpans().length > 0;
  }

  if (expression.isKind(SyntaxKind.BinaryExpression)) {
    return true;
  }

  return false;
};

const resolveIdentifierInitializer = (identifier: Identifier): Expression | undefined => {
  const sourceFile = identifier.getSourceFile();
  const variableDeclaration = sourceFile.getVariableDeclaration(identifier.getText());

  if (!variableDeclaration) {
    return undefined;
  }
  const initializer = variableDeclaration.getInitializer();

  if (!initializer) {
    return undefined;
  }

  return initializer as Expression;
};

export const noDynamicQueryConcatRule: LinterRule = {
  id: 'sql/no-dynamic-query-concat',
  description: 'Detects dynamic SQL string concatenation/interpolation in raw queries',

  analyze: (astNode: any, filePath: string): LinterIssue[] => {
    const issues: LinterIssue[] = [];
    const sourceFile = astNode as SourceFile;

    const callExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);
    for (const call of callExpressions) {
      const functionName = call.getExpression().getText();
      const isRawQueryCall =
        functionName.endsWith('query') ||
        functionName.endsWith('$queryRawUnsafe') ||
        functionName.endsWith('$executeRawUnsafe');

      if (!isRawQueryCall) {
        continue;
      }

      const args = call.getArguments();
      const sqlArg = args[0];

      if (!sqlArg) {
        continue;
      }

      let isDynamic = false;

      if (sqlArg.isKind(SyntaxKind.Identifier)) {
        const initializer = resolveIdentifierInitializer(sqlArg as Identifier);
        if (initializer) {
          isDynamic = isDynamicSqlExpression(initializer);
        }
      } else {
        isDynamic = isDynamicSqlExpression(sqlArg as Expression);
      }

      if (isDynamic) {
        issues.push({
          ruleId: 'sql/no-dynamic-query-concat',
          message: 'Dynamic SQL construction detected via concatenation/interpolation.',
          file: filePath,
          line: call.getStartLineNumber(),
          suggestion: 'Use parameterized queries or Prisma safe query APIs to avoid SQL injection risks and improve query planning.'
        });
      }
    }

    const taggedTemplates = sourceFile.getDescendantsOfKind(SyntaxKind.TaggedTemplateExpression);
    for (const tagged of taggedTemplates) {
      const tag = tagged.getTag().getText();
      const isRawTag =
        tag.endsWith('$queryRawUnsafe') ||
        tag.endsWith('$executeRawUnsafe');

      if (!isRawTag) {
        continue;
      }

      const template = tagged.getTemplate();
      if (template.isKind(SyntaxKind.TemplateExpression) && template.getTemplateSpans().length > 0) {
        issues.push({
          ruleId: 'sql/no-dynamic-query-concat',
          message: 'Dynamic SQL interpolation detected in tagged raw query template.',
          file: filePath,
          line: tagged.getStartLineNumber(),
          suggestion: 'Avoid interpolating user-controlled values directly. Use bound parameters or Prisma-safe helpers.'
        });
      }
    }

    return issues;
  }
};