---
title: "Database Performance: Beyond the Basics"
date: "2024-11-10"
category: "Technical"
tags: ["Database", "PostgreSQL", "Performance", "Optimization"]
readTime: "10 min read"
---

Most database performance advice stops at "add an index." Here's what actually matters when you're dealing with real-world scale and complexity.

## Understanding Query Planning

Before optimizing, you need to understand what's happening. PostgreSQL's `EXPLAIN ANALYZE` is your best friend:

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT u.*, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE u.created_at > '2024-01-01'
GROUP BY u.id;
```

Key metrics to watch:
- **Actual time**: Real execution time (not estimates)
- **Buffers**: How much data was read from disk vs cache
- **Rows**: Actual vs estimated row counts

When estimates are wildly off, `ANALYZE` your tables:

```sql
ANALYZE users;
ANALYZE orders;
```

## Index Strategies That Work

### Covering Indexes

Include all columns needed by the query to avoid table lookups:

```sql
-- Query
SELECT id, email, name FROM users WHERE email = 'user@example.com';

-- Covering index (includes all selected columns)
CREATE INDEX idx_users_email_covering ON users (email) INCLUDE (id, name);
```

### Partial Indexes

Index only the data you actually query:

```sql
-- Only index active users (90% of queries filter on this)
CREATE INDEX idx_users_active ON users (email) WHERE status = 'active';

-- Only index recent orders
CREATE INDEX idx_orders_recent ON orders (user_id, created_at)
WHERE created_at > CURRENT_DATE - INTERVAL '90 days';
```

### Expression Indexes

Index computed values:

```sql
-- Query uses LOWER()
SELECT * FROM users WHERE LOWER(email) = 'user@example.com';

-- Index the expression
CREATE INDEX idx_users_email_lower ON users (LOWER(email));
```

## Connection Pooling Is Critical

Database connections are expensive. A single PostgreSQL connection uses 5-10MB of memory. Without pooling:

```
100 app instances × 10 connections = 1000 connections = 10GB RAM
```

Use PgBouncer or similar:

```ini
[pgbouncer]
pool_mode = transaction  ; Release connection after each transaction
max_client_conn = 1000
default_pool_size = 20   ; Only 20 actual DB connections
```

Application-side pooling matters too:

```typescript
import { Pool } from "pg";

const pool = new Pool({
  max: 20,                    // Max connections in pool
  idleTimeoutMillis: 30000,   // Close idle connections
  connectionTimeoutMillis: 2000,
});

// Always use pool.query(), never create individual clients
const result = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
```

## Batch Operations

### Bulk Inserts

```sql
-- Bad: Individual inserts
INSERT INTO events (user_id, action) VALUES (1, 'click');
INSERT INTO events (user_id, action) VALUES (2, 'view');
-- ... 998 more

-- Good: Bulk insert
INSERT INTO events (user_id, action) VALUES
  (1, 'click'),
  (2, 'view'),
  -- ... 998 more
;

-- Better: Use COPY for large datasets
COPY events (user_id, action) FROM '/tmp/events.csv' WITH CSV;
```

### Bulk Updates with CTEs

```sql
-- Update many rows efficiently
WITH updates AS (
  SELECT unnest(ARRAY[1,2,3,4,5]) as id,
         unnest(ARRAY['a','b','c','d','e']) as new_status
)
UPDATE users u
SET status = updates.new_status
FROM updates
WHERE u.id = updates.id;
```

## Pagination Done Right

### Offset Pagination Is Slow

```sql
-- Gets slower as offset increases
SELECT * FROM posts ORDER BY created_at DESC LIMIT 20 OFFSET 10000;
-- Must scan 10,020 rows to return 20
```

### Use Cursor-Based Pagination

```sql
-- Fast regardless of page depth
SELECT * FROM posts
WHERE created_at < '2024-01-15T10:30:00Z'  -- Cursor from previous page
ORDER BY created_at DESC
LIMIT 20;
```

Implementation:

```typescript
interface PaginatedResult<T> {
  data: T[];
  cursor: string | null;
  hasMore: boolean;
}

async function getPosts(cursor?: string): Promise<PaginatedResult<Post>> {
  const limit = 20;

  let query = "SELECT * FROM posts";
  const params: any[] = [];

  if (cursor) {
    query += " WHERE created_at < $1";
    params.push(decodeCursor(cursor));
  }

  query += " ORDER BY created_at DESC LIMIT $" + (params.length + 1);
  params.push(limit + 1); // Fetch one extra to check hasMore

  const result = await pool.query(query, params);
  const hasMore = result.rows.length > limit;
  const data = result.rows.slice(0, limit);

  return {
    data,
    cursor: data.length > 0 ? encodeCursor(data[data.length - 1].created_at) : null,
    hasMore,
  };
}
```

## Monitoring Queries

### Log Slow Queries

```sql
-- postgresql.conf
log_min_duration_statement = 100  -- Log queries taking >100ms
```

### Use pg_stat_statements

```sql
CREATE EXTENSION pg_stat_statements;

-- Find slowest queries
SELECT query, calls, mean_exec_time, total_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Find most called queries
SELECT query, calls, mean_exec_time
FROM pg_stat_statements
ORDER BY calls DESC
LIMIT 10;
```

## Key Takeaways

1. **Measure first** - use EXPLAIN ANALYZE before optimizing
2. **Connection pooling** - essential at any scale
3. **Smart indexes** - covering, partial, and expression indexes
4. **Batch operations** - never insert/update one row at a time
5. **Cursor pagination** - offset pagination doesn't scale
6. **Monitor continuously** - slow queries creep in over time

Database performance is about understanding your data access patterns and optimizing for them specifically. Generic advice only gets you so far.

## References

- [PostgreSQL Documentation](https://www.postgresql.org/docs/current/) - Official docs
- [Use The Index, Luke](https://use-the-index-luke.com/) - SQL indexing and tuning guide
- [PgBouncer Documentation](https://www.pgbouncer.org/) - Connection pooling
- [Postgres EXPLAIN Visualizer](https://explain.dalibo.com/) - Visual query analysis
- [pg_stat_statements](https://www.postgresql.org/docs/current/pgstatstatements.html) - Query statistics
- [High Performance PostgreSQL](https://www.highperfpostgresql.com/) - Performance patterns
