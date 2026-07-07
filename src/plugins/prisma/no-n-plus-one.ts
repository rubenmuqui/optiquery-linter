import type { LinterRule, LinterIssue } from '../../core/types.js';
import { SyntaxKind, SourceFile } from 'ts-morph';

export const noNPlusOneRule: LinterRule = {
    id: 'prisma/no-n-plus-one',
    description: 'Detects potential N+1 query issues in Prisma code.',

    analyze: (astNode:any, filePath: string): LinterIssue[] => {
        const issues: LinterIssue[] = [];
        const sourceFile = astNode as SourceFile;
        const loops = sourceFile.getDescendantsOfKind(SyntaxKind.ForOfStatement);

        for (const loop of loops) {
            const functionCalls = loop.getDescendantsOfKind(SyntaxKind.CallExpression);

            const prismaCalls = functionCalls.filter(call => 
                call.getText().startsWith('prisma.')
            );

            for (const badCall of prismaCalls) {
                issues.push({
                    ruleId: 'prisma/no-n-plus-one',
                    message: `N + 1 query detected: ${badCall.getText()}`,
                    file: filePath,
                    line: badCall.getStartLineNumber(),
                    suggestion: "Extract the query outside the loop using 'findMany' with an 'in' clause."
                });
            }
        }
        return issues;
    }
}