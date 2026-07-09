# Rule: `sql/no-select-star`

## Description
Detects the use of `SELECT *` in raw SQL queries embedded within TypeScript code (e.g., `db.query` or `prisma.$queryRaw`).

Using `SELECT *` is a well-known database anti-pattern. It forces the database engine to fetch every single column from the table, bypassing index optimizations, wasting memory, and dramatically increasing network payload size.

## ❌ Incorrect Code
The linter will flag raw queries that attempt to fetch all columns from a table.

```typescript
// Anti-pattern: Fetching all columns unconditionally
const users = await db.query("SELECT * FROM users WHERE status = 'ACTIVE'");

// Anti-pattern with Prisma raw queries
const logs = await prisma.$queryRaw`SELECT * FROM system_logs`;
```

## ✅ Correct Code
Always specify the exact columns your application needs. This reduces memory consumption and allows the database to perform index-only scans.

```typescript
// Optimized: Fetching only the required data
const users = await db.query("SELECT id, email, username FROM users WHERE status = 'ACTIVE'");

const logs = await prisma.$queryRaw`SELECT id, error_message FROM system_logs`;
```