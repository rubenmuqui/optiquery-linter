# Rule: `prisma/no-unbounded-query`

## Description
Detects `findMany` queries that lack a `take` (limit) clause. This is known as an **Unbounded Query**.

Fetching records without a strict limit is highly dangerous in production environments. As the database table grows, an unbounded query will attempt to load thousands or millions of records into the server's RAM at once, inevitably leading to slow response times, database bottlenecks, and fatal **Out of Memory (OOM)** crashes.

## ❌ Incorrect Code
The linter will flag any `findMany` operation that does not include the `take` property in its arguments.

```typescript
// Anti-pattern: Unbounded query (Brings the entire table to memory)
const allLogs = await prisma.systemLog.findMany({
  where: {
    status: 'ERROR'
  }
});
```

## ✅ Correct Code
Always enforce pagination or strict limits using the `take` property. If you need all records, process them in chunks using cursor-based pagination.

```typescript
// Optimized: Safely limits the result set
const recentLogs = await prisma.systemLog.findMany({
  where: {
    status: 'ERROR'
  },
  take: 100, // 💡 Hard limit prevents memory exhaustion
  orderBy: {
    createdAt: 'desc'
  }
});
```