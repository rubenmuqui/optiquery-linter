import type { LinterRule, LinterIssue } from '../../core/types.js';
import { SyntaxKind, SourceFile } from 'ts-morph';
import pkg from 'node-sql-parser';
const { Parser } = pkg;

export const noSelectStarRule: LinterRule = {
  id: 'sql/no-select-star',
  description: 'Detects the use of SELECT * in raw SQL queries (Over-fetching)',
  
  analyze: (astNode: any, filePath: string): LinterIssue[] => {
    const issues: LinterIssue[] = [];
    const sourceFile = astNode as SourceFile;
    const sqlParser = new Parser();

    const analyzeSqlString = (sqlString: string, lineNumber: number) => {
      try {
        const sqlAst = sqlParser.astify(sqlString);
        const statements = Array.isArray(sqlAst) ? sqlAst : [sqlAst];

        for (const stmt of statements) {
          if (stmt.type === 'select') {
            const columns: any = stmt.columns; 
            const hasStar = columns === '*' || (
              Array.isArray(columns) && 
              columns.some((col: any) => col.expr?.type === 'column_ref' && col.expr?.column === '*')
            );
            
            if (hasStar) {
              issues.push({
                ruleId: 'sql/no-select-star',
                message: `Inefficient SQL detected: Avoid using 'SELECT *' in raw queries.`,
                file: filePath,
                line: lineNumber,
                suggestion: "Specify the exact columns you need (e.g., 'SELECT id, name FROM ...') to reduce bandwidth and memory."
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
      if (tag.endsWith('$queryRaw')) {
        const template = tagged.getTemplate();
        const sqlString = template.getText().slice(1, -1);
        analyzeSqlString(sqlString, tagged.getStartLineNumber());
      }
    }

    return issues;
  }
};