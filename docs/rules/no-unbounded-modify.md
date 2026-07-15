# Rule: `sql/no-unbounded-modify`

## Description
Detects `UPDATE` or `DELETE` SQL statements that are missing a `WHERE` clause. 

Executing a modification query without a boundary condition is a catastrophic anti-pattern that can lead to total data loss or corruption by overwriting/deleting every single row in a table.

## ❌ Incorrect Code
The linter will flag any raw SQL string or template literal that attempts a global mutation.

```typescript
// Anti-pattern: Overwrites all users' statuses
await db.query("UPDATE users SET status = 'INACTIVE'");

// Anti-pattern: Deletes the entire sessions table
await prisma.$executeRaw`DELETE FROM user_sessions`;
```

## ✅ Correct Code
Always scope your mutations using a `WHERE` clause to explicitly target the intended records.

```typescript
// Optimized and Safe: Modifies a specific user
await db.query("UPDATE users SET status = 'INACTIVE' WHERE last_login < '2023-01-01'");

// Optimized and Safe: Deletes only expired sessions
await prisma.$executeRaw`DELETE FROM user_sessions WHERE expires_at < NOW()`;
```