# Rule: `sql/no-dynamic-query-concat`

## Description
Detects dynamic SQL string construction in raw query calls, including concatenation and interpolated templates.

Building SQL dynamically in application code can introduce SQL injection risks and usually degrades query-plan stability. Prefer parameterized or safe query APIs.

## ❌ Incorrect Code
```typescript
const query = "SELECT * FROM users WHERE id = " + userId;
await db.query(query);

await db.query(`SELECT * FROM users WHERE id = ${userId}`);
await prisma.$queryRawUnsafe(`SELECT * FROM users WHERE id = ${userId}`);
```

## ✅ Correct Code
```typescript
await db.query("SELECT id, email FROM users WHERE id = ?", [userId]);

await prisma.$queryRaw`SELECT id, email FROM users WHERE id = ${userId}`;
```

## Notes
When using Prisma raw queries, prefer safe parameter handling and avoid constructing SQL clauses from untrusted string fragments.