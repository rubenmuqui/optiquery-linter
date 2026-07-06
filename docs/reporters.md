# 📊 Reporters & Output Formats

OptiQuery Linter supports multiple output formats to accommodate both local development and automated CI/CD pipelines. You can specify the reporter using the `--format` (or `-f`) flag in the CLI.

## 1. Console Reporter (Default)
Designed for human readability during local development. It outputs color-coded logs to the terminal, detailing the rule ID, file path, line number, and actionable suggestions.

**Usage:**
```bash
optiquery analyze ./src
```

## 2. JSON Reporter
Designed for machine readability. It generates an `optiquery-report.json` file in the root directory. This is ideal for parsing within GitHub Actions, Jenkins, or SonarQube workflows to block pull requests if architectural issues are detected.

**Usage:**
```bash
optiquery analyze ./src --format json
```

**JSON Schema:**
```json
{
  "totalIssues": 1,
  "analyzedAt": "2026-07-02T17:53:25.237Z",
  "issues": [
    {
      "ruleId": "prisma/no-n-plus-one",
      "message": "Inefficient query detected inside loop: prisma.post.findMany(...)",
      "file": "path/to/bad-code.ts",
      "line": 36,
      "suggestion": "Extract the query outside the loop using 'findMany' with an 'in' clause."
    }
  ]
}
```