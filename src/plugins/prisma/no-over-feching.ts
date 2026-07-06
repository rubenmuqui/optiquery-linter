import type { LinterRule, LinterIssue } from '../../core/types.js';
import { SyntaxKind, SourceFile, ObjectLiteralExpression } from 'ts-morph';

export const noOverFetchingRule: LinterRule = {
    id: 'prisma/no-over-fetching',
    description: 'Detects queries without a select clause (Over-fetching)',

    analyze: (astNode: any, filePath: string): LinterIssue[] => {
        const issues: LinterIssue[] = [];
        const sourceFile = astNode as SourceFile;

        const callExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);

        for (const call of callExpressions) {
            const functionName = call.getExpression().getText();

            if (functionName.startsWith('prisma.') && (functionName.endsWith('.findMany') || functionName.endsWith('.findUnique'))) {
                const args = call.getArguments();
                let hasSelect = false;

                if (args.length > 0 && args[0]?.asKind(SyntaxKind.ObjectLiteralExpression)) {
                    const objLiteral = args[0] as ObjectLiteralExpression;
                    if(objLiteral.getProperty('select')) {
                        hasSelect = true;
                    }
            }

            if (!hasSelect) {
                issues.push({
                    ruleId: 'prisma/no-over-fetching',
                    message: `Over-fetching detected: '${functionName}' is missing a 'select' clause.`,
                    file: filePath,
                    line: call.getStartLineNumber(),
                    suggestion: "Specify only the necessary fields using 'select' to reduce memory usage and DB load."
                });
            }
        }
    }

    return issues;
    }
}