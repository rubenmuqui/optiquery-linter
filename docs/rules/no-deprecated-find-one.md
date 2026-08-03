# Rule: `prisma/no-deprecated-find-one`

## Description
Detects deprecated Prisma `findOne()` calls and recommends `findUnique()`.

In modern Prisma versions, `findOne()` is no longer part of the client API. Keeping deprecated calls in a codebase increases migration risk and can break builds during dependency updates.

## ❌ Incorrect Code
```typescript
const user = await prisma.user.findOne({
  where: { id: 42 }
});
```

## ✅ Correct Code
```typescript
const user = await prisma.user.findUnique({
  where: { id: 42 }
});
```

## 🔧 Auto-fix
This rule supports auto-fix. Running the linter with `--fix` rewrites:

- `.findOne(...)` → `.findUnique(...)`