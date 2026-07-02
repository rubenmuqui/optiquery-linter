# Rule: `prisma/no-n-plus-one`

## Description
Detects database queries executed inside loops. This is a classic performance bottleneck known as the **N+1 query problem**. 

If a loop runs 100 times, the application will make 100 individual round-trips to the database. This significantly increases latency and degrades server performance.

## ❌ Incorrect Code
The linter will flag scenarios where a Prisma client method is invoked inside a `for`, `for...of`, or `for...in` statement.

```typescript
// Anti-pattern: N+1 queries
const allUsers = await prisma.user.findMany();

for (const user of allUsers) {
  // 🚨 Linter Warning: Inefficient query detected inside loop
  const userPosts = await prisma.post.findMany({ 
    where: { authorId: user.id } 
  });
}
```

## ✅ Correct Code
Extract the query outside the loop. Use Prisma's `in` operator to fetch all related records in a single database query, and then map them in memory if needed.

```typescript
// Optimized: 2 queries total, regardless of user count
const allUsers = await prisma.user.findMany();
const userIds = allUsers.map(user => user.id);

// 💡 Single query using the 'in' clause
const allPosts = await prisma.post.findMany({
  where: { 
    authorId: { in: userIds } 
  }
});
```