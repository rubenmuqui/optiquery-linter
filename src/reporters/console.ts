import chalk from 'chalk';
import type { LinterIssue, LinterReporter } from '../core/types.js';

export class ConsoleReporter implements LinterReporter {
  public name = 'console';

  public report(issues: LinterIssue[]): void {
    if (issues.length === 0) {
      console.log(chalk.green('No issues found. Your code is optimized!\n'));
      return;
    }

    console.log(chalk.red.bold(`Found ${issues.length} issue(s):\n`));
    
    issues.forEach((issue) => {
      console.log(chalk.yellow(`[${issue.ruleId}] Line ${issue.line} in ${issue.file}`));
      console.log(chalk.white(`   ${issue.message}`));
      if (issue.suggestion) {
        console.log(chalk.green(`   Suggestion: ${issue.suggestion}`));
      }
      console.log('');
    });
  }
}