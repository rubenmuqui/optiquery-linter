# 🚀 OptiQuery Linter

A powerful, static code analysis tool designed to detect performance bottlenecks and dangerous SQL/ORM anti-patterns in TypeScript projects. 

OptiQuery Linter analyzes your Abstract Syntax Tree (AST) to catch database inefficiencies *before* they reach production, supporting both raw SQL queries and Prisma ORM.

## ✨ Features
* 🔍 **Zero-runtime overhead:** Analyzes code statically via AST (`ts-morph`).
* ⚡ **Performance focused:** Detects N+1 queries, Over-fetching, and `ORDER BY RAND()`.
* 🛡️ **Safety first:** Prevents catastrophic unbounded `UPDATE` and `DELETE` mutations.
* 📦 **Multi-target:** Understands generic SQL (`node-sql-parser`) and Prisma template literals.
* 🛠️ **Auto-fix capabilities:** Automatically resolves safe-to-fix structural issues without breaking business logic.

## 📦 Installation

The recommended way to run OptiQuery Linter is using `npx`, which requires no global installation:

```bash
# Analyze a specific file
npx optiquery-linter analyze src/database/queries.ts

# Analyze an entire directory
npx optiquery-linter analyze ./src
```

### Local Installation (Recommended for Teams)
To ensure all developers in your team use the same version, install it as a development dependency:

```bash
npm install -D optiquery-linter
```
Once installed, you can add it to your `package.json` scripts or run it locally via:
```bash
npx optiquery analyze ./src
```

## 🚀 Usage

### Auto-Fixing Issues
OptiQuery Linter can automatically fix certain safe structural issues (like injecting default limits or updating deprecated methods). Just append the `--fix` flag to your command:

```bash
npx optiquery-linter analyze ./src --fix
```
*Note: The linter will only apply fixes that are 100% deterministic and safe for your codebase.*

### Bypassing Rules
If you have a legitimate reason to bypass a rule (e.g., a specific migration script), you can silence the linter for a specific line using the following comment:

```typescript
// optiquery-disable-next-line
const users = await db.query("SELECT * FROM users");
```

## 📏 Supported Rules

### Prisma ORM
* `prisma/no-n-plus-one`: Detects loops containing database queries.
* `prisma/no-over-fetching`: Prevents `findMany` without a `select` clause.
* `prisma/no-unbounded-query`: Flags queries lacking `take` or `limit` constraints. **[🔧 Supports Auto-fix]**
* `prisma/no-deprecated-find-one`: Replaces deprecated `.findOne()` with `.findUnique()`. **[🔧 Supports Auto-fix]**

### Raw SQL
* `sql/no-select-star`: Detects the use of `SELECT *` (Over-fetching).
* `sql/no-unbounded-modify`: Prevents `UPDATE` or `DELETE` without a `WHERE` clause.
* `sql/no-order-by-rand`: Flags inefficient random sorting (`ORDER BY RAND()`).
* `sql/no-implicit-insert`: Detects `INSERT` statements lacking explicit column names.

## 🎓 About
This project was developed as a Final Degree Project (TFG) in Software Engineering, focusing on code quality, static analysis, and database performance optimization.