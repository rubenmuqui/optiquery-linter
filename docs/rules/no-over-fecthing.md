# Rule: `prisma/no-over-fetching`

## Description
Detects `findMany` or `findUnique` Prisma queries that omit the `select` clause. 

Retrieving entire rows from the database when only a few columns are needed consumes unnecessary bandwidth and memory (Over-fetching), similar to running a `SELECT *` in SQL.

## ❌ Incorrect Code
```typescript
// Anti-pattern: Fetching all user data (including hashed passwords, etc.)
const users = await prisma.user.findMany({
  where: { isActive: true }
});
```

## ✅ Correct Code
```typescript
// Optimized: Fetching only the data required by the application
const users = await prisma.user.findMany({
  where: { isActive: true },
  select: {
    id: true,
    email: true,
    name: true
  }
});
```