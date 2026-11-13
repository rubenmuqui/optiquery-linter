# 🚀 OptiQuery Linter

[![npm version](https://img.shields.io/npm/v/optiquery-linter.svg)](https://www.npmjs.com/package/optiquery-linter)
[![npm downloads](https://img.shields.io/npm/dm/optiquery-linter.svg)](https://www.npmjs.com/package/optiquery-linter)
[![license](https://img.shields.io/npm/l/optiquery-linter.svg)](./LICENSE)
[![node](https://img.shields.io/node/v/optiquery-linter.svg)](https://nodejs.org)

A powerful, static code analysis tool designed to detect performance bottlenecks and dangerous SQL/ORM anti-patterns in TypeScript projects. 

OptiQuery Linter analyzes your Abstract Syntax Tree (AST) to catch database inefficiencies *before* they reach production, supporting both raw SQL queries and Prisma ORM.

Requires Node.js 18 or newer.

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

### Library Usage
The engine and the rules are also exported, so you can run the analysis from your own tooling:

```typescript
import { OptiQueryEngine, recommendedRules, ConsoleReporter } from "optiquery-linter";

const engine = new OptiQueryEngine();
engine.registerRules(recommendedRules);

const issues = engine.analyzePath("./src");
new ConsoleReporter().report(issues);
```

Individual rule sets are available from `optiquery-linter/plugins`.

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
* `prisma/no-unbounded-mutation`: Protects against massive, unconstrained updates or deletes.
* `prisma/no-offset-pagination-without-order`: Ensures paginated queries include an `orderBy` clause to prevent inconsistent or duplicate results.
* `prisma/no-deprecated-find-one`: Replaces deprecated `.findOne()` with `.findUnique()`. **[🔧 Supports Auto-fix]**

### Raw SQL
* `sql/no-select-star`: Detects the use of `SELECT *` (Over-fetching).
* `sql/no-unbounded-modify`: Prevents `UPDATE` or `DELETE` without a `WHERE` clause.
* `sql/no-order-by-rand`: Flags inefficient random sorting (`ORDER BY RAND()`).
* `sql/no-implicit-insert`: Detects `INSERT` statements lacking explicit column names.
* `sql/no-dynamic-query-concat`: Prevents SQL injection risks and caching issues by flagging dynamic string concatenation in queries.
## 🛠️ Development

```bash
npm install
npm run build      # bundles dist/ with tsup
npm run test       # vitest, 33 tests
npm run typecheck  # tsc --noEmit
npm run dev -- analyze ./tests   # run the CLI from source
```

Publishing is gated: `prepublishOnly` runs the build and the full test suite, and `prepack`
rebuilds `dist/` so the tarball never ships stale output.

```bash
npm version patch        # or minor / major
npm publish              # requires npm login with access to the package
```

The published tarball contains only `dist/`, `README.md` and `LICENSE` (see the `files` field).
