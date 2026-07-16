import { Project, SourceFile } from 'ts-morph';
import type { LinterRule, LinterIssue } from './types.js';

export class OptiQueryEngine {
  private project: Project;
  private rules: LinterRule[] = [];

  constructor() {
    this.project = new Project();
  }

  registerRules(rules: LinterRule[]) {
    this.rules = rules;
  }

  analyzeFile(filePath: string, isFixMode: boolean = false): LinterIssue[] {
    const sourceFile = this.project.addSourceFileAtPath(filePath);
    return this.analyzeSource(sourceFile, filePath, isFixMode);
  }

  analyzeCode(code: string, fileName: string = 'temp.ts', isFixMode: boolean = false): LinterIssue[] {
    const sourceFile = this.project.createSourceFile(fileName, code, { overwrite: true });
    return this.analyzeSource(sourceFile, fileName, isFixMode);
  }

  private analyzeSource(sourceFile: SourceFile, filePath: string, isFixMode: boolean): LinterIssue[] {
    let issues: LinterIssue[] = [];

    for (const rule of this.rules) {
      issues.push(...rule.analyze(sourceFile, filePath, isFixMode));
    }


    const fileLines = sourceFile.getFullText().split(/\r?\n/);

    issues = issues.filter(issue => {
      const prevLineIndex = issue.line - 2;
      
      if (prevLineIndex >= 0) {
        const prevLineText = fileLines[prevLineIndex] || '';
        
        if (prevLineText.includes('// optiquery-disable-next-line')) {
          return false; 
        }
      }
      return true; 
    });

    if (isFixMode) {
      sourceFile.saveSync();
    }
    
    return issues;
  }
}