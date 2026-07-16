# 🚀 OptiQuery Linter

A powerful, static code analysis tool designed to detect performance bottlenecks and dangerous SQL/ORM anti-patterns in TypeScript projects. 

OptiQuery Linter analyzes your Abstract Syntax Tree (AST) to catch database inefficiencies *before* they reach production, supporting both raw SQL queries and Prisma ORM.

## ✨ Features
* 🔍 **Zero-runtime overhead:** Analyzes code statically via AST (`ts-morph`).
* ⚡ **Performance focused:** Detects N+1 queries, Over-fetching, and `ORDER BY RAND()`.
* 🛡️ **Safety first:** Prevents catastrophic unbounded `UPDATE` and `DELETE` mutations.
* 📦 **Multi-target:** Understands generic SQL (`node-sql-parser`) and Prisma template literals.

## 📦 Installation

You can install OptiQuery Linter globally to use it across all your projects:

```bash
npm install -g optiquery-linter
```

Or install it as a development dependency in a specific project:

```bash
npm install -D optiquery-linter
```

## 🚀 Usage

Run the linter pointing it to your TypeScript files or directories:

```bash
# Analyze a specific file
optiquery analyze src/database/queries.ts

# Analyze an entire directory (via npx if installed locally)
npx optiquery analyze ./src
```

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
* `prisma/no-unbounded-query`: Flags queries lacking `take` or `limit` constraints.

### Raw SQL
* `sql/no-select-star`: Detects the use of `SELECT *` (Over-fetching).
* `sql/no-unbounded-modify`: Prevents `UPDATE` or `DELETE` without a `WHERE` clause.
* `sql/no-order-by-rand`: Flags inefficient random sorting (`ORDER BY RAND()`).
* `sql/no-implicit-insert`: Detects `INSERT` statements lacking explicit column names.

## 🎓 About
This project was developed as a Final Degree Project (TFG) in Software Engineering, focusing on code quality, static analysis, and database performance optimization.