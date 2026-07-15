# Rule: `sql/no-implicit-insert`

## Description
Detects `INSERT` statements that do not explicitly define target column names.

Relying on implicit column order (e.g., `INSERT INTO table VALUES (...)`) makes your queries highly fragile. If a database administrator adds, removes, or reorders a column in the schema, this query will immediately break in production because the values will no longer align with the table structure.

## ❌ Incorrect Code
```typescript
// Anti-pattern: Implicit column mapping
await db.query("INSERT INTO customers VALUES (1, 'Acme Corp', 'ACTIVE')");
```

## ✅ Correct Code
Always specify the exact columns you are inserting data into.

```typescript
// Optimized and Safe: Explicit column mapping
await db.query("INSERT INTO customers (id, name, status) VALUES (1, 'Acme Corp', 'ACTIVE')");
```