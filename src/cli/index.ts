import { Command } from 'commander';
import chalk from 'chalk';
import { OptiQueryEngine } from '../core/engine.js';
import { TypeScriptParser } from '../parsers/typescript/index.js';
import { noNPlusOneRule } from '../plugins/prisma/no-n-plus-one.js';
import { ConsoleReporter } from '../reporters/console.js';
import { JsonReporter } from '../reporters/json.js';

const program = new Command();

program.name('optiquery')
    .description('Static analysis linter to detect database query inefficiencies')
    .version('1.0.0');

program.command('analyze')
    .description('Analyze a file or directory for anti-patterns')
    .argument('<path>', 'Path to target file or directory')
    .option('-f, --format <type>', 'Output format (console or json)', 'console')
    .action((path, options) => {
        console.log(chalk.blue.bold(`\nStarting OptiQuery Linter v1.0`));
        console.log(chalk.gray(`Scanning target: ${path}\n`));

        try {
            const engine = new OptiQueryEngine();
            const parser = new TypeScriptParser();

            engine.registerRule(noNPlusOneRule);
            const ast = parser.parseFile(path);
            const issues = engine.execute(ast, path);

            let reporter;
            if (options.format.toLowerCase() === 'json') {
                reporter = new JsonReporter();
            } else {
                reporter = new ConsoleReporter();
            }
            reporter.report(issues);
        } catch (error: any) {

            console.error(chalk.red(`Error analyzing ${path}: ${error.message}\n`));
        }
    });

program.parse();