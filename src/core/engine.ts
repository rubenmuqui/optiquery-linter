import type { LinterRule, LinterIssue } from './types.js';

export class OptiQueryEngine {
    private rules: LinterRule[] = [];

    public registerRule(rule: LinterRule): void {
        this.rules.push(rule);
    }

    public execute(ast:any, filePath: string): LinterIssue[] {
        const allIssues: LinterIssue[] = [];
        for (const rule of this.rules) {
            const issues = rule.analyze(ast, filePath);
            allIssues.push(...issues);
        }
        return allIssues;
    }
}