#!/usr/bin/env node
import { cac } from 'cac';
import { OptiQueryEngine } from '../core/engine.js';
import { recommendedRules } from '../plugins/index.js';

const cli = cac('optiquery');

cli
  .command('analyze <fileOrDirectory>', 'Analyze TypeScript files for SQL/Prisma anti-patterns')
  .option('--fix', 'Automatically fix safe-to-fix issues')
  .action((path: string, options: { fix?: boolean }) => {
    const engine = new OptiQueryEngine();
    
    engine.registerRules(recommendedRules);

    const isFixMode = options.fix || false;
    
    console.log(`Analyzing ${path}...${isFixMode ? '  (Auto-fix enabled)' : ''}`);
    
    const issues = engine.analyzeFile(path, isFixMode);

    const unresolvedIssues = issues.filter(issue => !issue.fixed);
    const fixedCount = issues.length - unresolvedIssues.length;

    if (fixedCount > 0) {
      console.log(`Auto-fixed ${fixedCount} issues!`);
    }

    if (unresolvedIssues.length === 0) {
      console.log('No unresolved issues found!');
    } else {
      console.log(`Found ${unresolvedIssues.length} unresolved issues:`);
      unresolvedIssues.forEach(issue => {
        console.log(`- [${issue.ruleId}] ${issue.file}:${issue.line} -> ${issue.message}`);
      });
      process.exit(1); 
    }
  });

cli.help();
cli.parse();