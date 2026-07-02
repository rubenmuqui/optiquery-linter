import { Project, SourceFile } from 'ts-morph';

export class TypeScriptParser {
    private project: Project;

    constructor() {
        this.project = new Project();
    }

    public parseFile(filePath: string): SourceFile {
        return this.project.addSourceFileAtPath(filePath);
    }
}