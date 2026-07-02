export interface LinterIssue {
    ruleId: string;
    message: string;
    file: string;
    line: number;
    suggestion?: string;
}

export interface LinterRule {
    id: string;
    description: string;
    analyze: (astNode: any, filePath: string) => LinterIssue[];
}

export interface LinterReporter {
    name: string;
    report: (issues: LinterIssue[]) => void;
}