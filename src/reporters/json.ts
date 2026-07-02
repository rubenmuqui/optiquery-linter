import fs from 'fs';
import chalk from 'chalk';
import type { LinterIssue, LinterReporter } from '../core/types.js';

export class JsonReporter implements LinterReporter {
    public name = 'json';

    public report(issues: LinterIssue[]): void {
        const outputPath = './optiquery-report.json';

        const reportData = {
            totalissues: issues.length,
            analyzedAt: new Date().toISOString(),
            issues: issues
        };

        fs.writeFileSync(outputPath, JSON.stringify(reportData, null, 2), 'utf-8');
        console.log(chalk.green(`JSON report generated at: ${outputPath}`));
    }
}