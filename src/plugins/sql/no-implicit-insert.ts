import type { LinterRule, LinterIssue } from '../../core/types.js';
import { SyntaxKind, SourceFile } from 'ts-morph';
import pkg from 'node-sql-parser';
const { Parser } = pkg;

export const noImplicitInsertRule: LinterRule = {
  id: 'sql/no-implicit-insert',
  description: 'Detects INSERT statements without explicit column names',
  
  analyze: (astNode: any, filePath: string): LinterIssue[] => {
    const issues: LinterIssue[] = [];
    const sourceFile = astNode as SourceFile;
    const sqlParser = new Parser();

    const analyzeSqlString = (sqlString: string, lineNumber: number) => {
      try {
        const sqlAst = sqlParser.astify(sqlString);
        const statements = Array.isArray(sqlAst) ? sqlAst : [sqlAst];

        for (const stmt of statements) {
          if (stmt.type === 'insert') {
            if (!stmt.columns || stmt.columns.length === 0) {
              issues.push({
                ruleId: 'sql/no-implicit-insert',
                message: `Fragile SQL detected: INSERT statement without explicit column names.`,
                file: filePath,
                line: lineNumber,
                suggestion: "Always specify the target columns (e.g., INSERT INTO table (col1, col2) VALUES ...) to prevent breaks if the schema changes."
              });
            }
          }
        }
      } catch (error) {}
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
      const tag = tagged.getTag().getText();
      if (tag.endsWith('$executeRaw') || tag.endsWith('$queryRaw')) {
        analyzeSqlString(tagged.getTemplate().getText().slice(1, -1), tagged.getStartLineNumber());
      }
    }

    return issues;
  }
};