import type { LinterRule, LinterIssue } from '../../core/types.js';
import { SyntaxKind, SourceFile, CallExpression } from 'ts-morph';
import { Parser } from 'node-sql-parser';

export const noSelectStarRule: LinterRule = {
  id: 'sql/no-select-star',
  description: 'Detects the use of SELECT * in raw SQL queries (Over-fetching)',
  
  analyze: (astNode: any, filePath: string): LinterIssue[] => {
    const issues: LinterIssue[] = [];
    const sourceFile = astNode as SourceFile;
    const sqlParser = new Parser();

    const callExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);

    for (const call of callExpressions) {
      const functionName = call.getExpression().getText();
      

      if (functionName.endsWith('$queryRaw') || functionName.endsWith('query')) {
        
        const args = call.getArguments();
        let sqlString = '';

        if (args.length > 0 && args[0]?.isKind(SyntaxKind.StringLiteral)) {
          sqlString = args[0].getText().replace(/['"`]/g, ''); 
        } else if (args.length > 0 && args[0]?.isKind(SyntaxKind.NoSubstitutionTemplateLiteral)) {
           sqlString = args[0].getText().replace(/`/g, '');
        }

        if (sqlString) {
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
                    line: call.getStartLineNumber(),
                    suggestion: "Specify the exact columns you need (e.g., 'SELECT id, name FROM ...') to reduce bandwidth and memory."
                  });
                }
              }
            }
          } catch (error) {
          }
        }
      }
    }

    return issues;
  }
};