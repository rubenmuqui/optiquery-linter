# Rule: `prisma/no-offset-pagination-without-order`

## Description
Detects Prisma `findMany()` queries using offset pagination (`skip` + `take`) without `orderBy`.

Without deterministic ordering, paginated results can shift between requests, causing duplicated or missing records across pages.

## ❌ Incorrect Code
```typescript
const page = await prisma.user.findMany({
  skip: 20,
  take: 10
});
```

## ✅ Correct Code
```typescript
const page = await prisma.user.findMany({
  skip: 20,
  take: 10,
  orderBy: { id: 'asc' }
});
```