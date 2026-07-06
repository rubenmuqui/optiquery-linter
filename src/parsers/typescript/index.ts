import { Project, SourceFile } from 'ts-morph';
import fs from 'fs';
import path from 'path';

export class TypeScriptParser {
    private project: Project;

    constructor() {
        this.project = new Project();
    }

    public parse(targetPath: string): SourceFile[] {
        const stats = fs.statSync(targetPath);

        if (stats.isDirectory()) {
            const globPath = path.posix.join(targetPath.replace(/\\/g, '/'), '**/*.ts');
            this.project.addSourceFilesAtPaths(globPath);
        } else {
            this.project.addSourceFileAtPath(targetPath);;
        }
        return this.project.getSourceFiles();
    }
}