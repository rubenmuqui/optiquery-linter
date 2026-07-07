import type { LinterRule, LinterIssue } from "../../core/types.js";
import { SyntaxKind, SourceFile, ObjectLiteralExpression } from 'ts-morph';

export const noUnboundedQueryRule: LinterRule = {
    id: 'prisma/no-unbounded-query',
    description: 'Detects findMany queries without a take (limit) clause',

    analyze: (astNode: any, filePath: string): LinterIssue[] => {
        const issues: LinterIssue[] = [];
        const sourceFile = astNode as SourceFile;
        const callExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);

        for (const call of callExpressions) {
            const functionName = call.getExpression().getText();

            if(functionName.startsWith('prisma.') && functionName.endsWith('.findMany')) {
                const args = call.getArguments();
                let hasTake = false;

                if (args.length > 0 && args[0]?.isKind(SyntaxKind.ObjectLiteralExpression)) {
                    const objLiteral = args[0] as ObjectLiteralExpression;
                    if (objLiteral.getProperty('take')) {
                        hasTake = true;
                    }
                }

                if (!hasTake) {
                    issues.push({
                        ruleId: 'prisma/no-unbounded-query',
                        message: `Unbounded query detected: '${functionName}' is missing a 'take' (limit) clause.`,
                        file: filePath,
                        line: call.getStartLineNumber(),
                        suggestion: "Always paginate or limit your queries using 'take' to prevent memory exhaustion."    
                    });
                }
            }
        }
        return issues;
    }
}