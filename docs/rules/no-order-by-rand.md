# Rule: `sql/no-order-by-rand`

## Description
Detects the use of `ORDER BY RAND()` or `ORDER BY RANDOM()` in raw SQL queries.

Sorting by a random function is a severe performance anti-pattern. The database engine must assign a random value to *every single row* in the table, sort the entire temporary table, and then discard most of it to return the limited results. On large tables, this causes massive CPU and Memory spikes.

## ❌ Incorrect Code
```typescript
// Anti-pattern: Forces a full table scan and temporary sorting
const randomWinner = await db.query("SELECT email FROM users ORDER BY RAND() LIMIT 1");
```

## ✅ Correct Code
To fetch random rows efficiently, consider alternative approaches such as fetching a list of IDs and randomizing them in application memory, or using indexed sequential logic.

```typescript
// Optimized: Standard indexed sorting
const latestUsers = await db.query("SELECT email FROM users ORDER BY created_at DESC LIMIT 10");
```