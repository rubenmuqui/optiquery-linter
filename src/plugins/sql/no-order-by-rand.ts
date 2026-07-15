import type { LinterRule, LinterIssue } from '../../core/types.js';
import { SyntaxKind, SourceFile } from 'ts-morph';
import pkg from 'node-sql-parser';
const { Parser } = pkg;

export const noOrderByRandRule: LinterRule = {
  id: 'sql/no-order-by-rand',
  description: 'Detects ORDER BY RAND() which causes massive performance degradation on large tables',
  
  analyze: (astNode: any, filePath: string): LinterIssue[] => {
    const issues: LinterIssue[] = [];
    const sourceFile = astNode as SourceFile;
    const sqlParser = new Parser();

    const analyzeSqlString = (sqlString: string, lineNumber: number) => {
      let hasRand = false;

      try {
        const sqlAst = sqlParser.astify(sqlString);
        const statements = Array.isArray(sqlAst) ? sqlAst : [sqlAst];

        for (const stmt of statements) {
          if (stmt.type === 'select' && stmt.orderby) {
            hasRand = stmt.orderby.some((order: any) => {
              if (!order.expr) return false;
              
              let funcName = '';
              if (typeof order.expr.name === 'string') {
                funcName = order.expr.name.toUpperCase();
              } else if (order.expr.name?.value) {
                funcName = String(order.expr.name.value).toUpperCase();
              } else if (Array.isArray(order.expr.name)) {
                funcName = String(order.expr.name[0]?.value || '').toUpperCase();
              }

              return (order.expr.type === 'aggr_func' || order.expr.type === 'function') && 
                     (funcName === 'RAND' || funcName === 'RANDOM');
            });
          }
        }
      } catch (error) {
      }


      if (!hasRand && /ORDER\s+BY\s+(RAND|RANDOM)\s*\(/i.test(sqlString)) {
        hasRand = true;
      }

      if (hasRand) {
        issues.push({
          ruleId: 'sql/no-order-by-rand',
          message: `Inefficient SQL detected: ORDER BY RAND() causes severe performance degradation.`,
          file: filePath,
          line: lineNumber,
          suggestion: "Avoid sorting by random in the database. Fetch an array of IDs, randomize them in memory, or use sequential logic."
        });
      }
    };

    const callExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);
    for (const call of callExpressions) {
      if (call.getExpression().getText().endsWith('query')) {
        const args = call.getArguments();
        if (args.length > 0 && args[0]?.isKind(SyntaxKind.StringLiteral)) {
          analyzeSqlString(args[0].getText().slice(1, -1), call.getStartLineNumber());
        }
      }
    }

    const taggedTemplates = sourceFile.getDescendantsOfKind(SyntaxKind.TaggedTemplateExpression);
    for (const tagged of taggedTemplates) {
      if (tagged.getTag().getText().endsWith('$queryRaw')) {
        analyzeSqlString(tagged.getTemplate().getText().slice(1, -1), tagged.getStartLineNumber());
      }
    }

    return issues;
  }
};