import type { LinterRule, LinterIssue } from '../../core/types.js';
import { SyntaxKind, SourceFile } from 'ts-morph';
import pkg from 'node-sql-parser';
const { Parser } = pkg;

export const noUnboundedModifyRule: LinterRule = {
  id: 'sql/no-unbounded-modify',
  description: 'Detects UPDATE or DELETE statements without a WHERE clause to prevent catastrophic data loss',
  
  analyze: (astNode: any, filePath: string): LinterIssue[] => {
    const issues: LinterIssue[] = [];
    const sourceFile = astNode as SourceFile;
    const sqlParser = new Parser();

    const analyzeSqlString = (sqlString: string, lineNumber: number) => {
      try {
        const sqlAst = sqlParser.astify(sqlString);
        const statements = Array.isArray(sqlAst) ? sqlAst : [sqlAst];

        for (const stmt of statements) {
          if (stmt.type === 'update' || stmt.type === 'delete') {
            if (!stmt.where) {
              issues.push({
                ruleId: 'sql/no-unbounded-modify',
                message: `Dangerous SQL detected: '${stmt.type.toUpperCase()}' statement is missing a WHERE clause.`,
                file: filePath,
                line: lineNumber,
                suggestion: `Always include a WHERE clause in ${stmt.type.toUpperCase()} statements to prevent modifying the entire table.`
              });
            }
          }
        }
      } catch (error) {
      }
    };

    const callExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);
    for (const call of callExpressions) {
      const functionName = call.getExpression().getText();
      if (functionName.endsWith('query')) {
        const args = call.getArguments();
        if (args.length > 0 && args[0]?.isKind(SyntaxKind.StringLiteral)) {
          const sqlString = args[0].getText().slice(1, -1);
          analyzeSqlString(sqlString, call.getStartLineNumber());
        }
      }
    }

    const taggedTemplates = sourceFile.getDescendantsOfKind(SyntaxKind.TaggedTemplateExpression);
    for (const tagged of taggedTemplates) {
      const tag = tagged.getTag().getText();
      if (tag.endsWith('$executeRaw') || tag.endsWith('$queryRaw')) {
        const template = tagged.getTemplate();
        const sqlString = template.getText().slice(1, -1);
        analyzeSqlString(sqlString, tagged.getStartLineNumber());
      }
    }

    return issues;
  }
};