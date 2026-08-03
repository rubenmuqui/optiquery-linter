# Rule: `prisma/no-unbounded-mutation`

## Description
Detects `updateMany()` and `deleteMany()` Prisma mutations that are not scoped by a restrictive `where` clause.

Bulk mutations without boundaries are one of the highest-risk database anti-patterns. A missing or empty `where` can unintentionally modify or delete entire tables.

## ❌ Incorrect Code
```typescript
await prisma.user.updateMany({
  data: { active: false }
});

await prisma.session.deleteMany({
  where: {}
});
```

## ✅ Correct Code
```typescript
await prisma.user.updateMany({
  where: { lastLogin: { lt: new Date('2024-01-01') } },
  data: { active: false }
});

await prisma.session.deleteMany({
  where: { expiresAt: { lt: new Date() } }
});
```