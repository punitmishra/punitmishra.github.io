---
title: "TypeScript at Scale: Patterns That Actually Work"
date: "2024-11-15"
category: "Technical"
tags: ["TypeScript", "Architecture", "Best Practices", "Frontend"]
readTime: "8 min read"
---

After maintaining TypeScript codebases with millions of lines of code, I've developed strong opinions about what works and what doesn't. Here's a practical guide to patterns that scale.

## The Type System Is Your Friend

The most common mistake teams make is fighting TypeScript instead of embracing it. The type system is not a hindrance—it's documentation that can't go stale.

### Prefer Explicit Over Implicit

```typescript
// Bad: What does this return?
function processUser(user: any) {
  return user.data?.profile?.name ?? "Unknown";
}

// Good: Self-documenting
interface UserProfile {
  name: string;
  email: string;
  role: "admin" | "user" | "guest";
}

interface User {
  id: string;
  data: {
    profile: UserProfile | null;
  };
}

function processUser(user: User): string {
  return user.data.profile?.name ?? "Unknown";
}
```

### Use Discriminated Unions

This pattern is incredibly powerful for modeling state:

```typescript
// Model all possible states explicitly
type RequestState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: Error };

function renderUser(state: RequestState<User>) {
  switch (state.status) {
    case "idle":
      return <Placeholder />;
    case "loading":
      return <Spinner />;
    case "success":
      return <UserCard user={state.data} />;
    case "error":
      return <ErrorMessage error={state.error} />;
  }
}
```

The compiler ensures you handle all cases. If you add a new state, TypeScript tells you everywhere you need to update.

## Configuration That Matters

Your `tsconfig.json` settings dramatically impact code quality:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true,
    "noPropertyAccessFromIndexSignature": true
  }
}
```

The `noUncheckedIndexedAccess` option is particularly valuable:

```typescript
const users: User[] = [];

// Without noUncheckedIndexedAccess
const first = users[0]; // Type: User (wrong! could be undefined)

// With noUncheckedIndexedAccess
const first = users[0]; // Type: User | undefined (correct!)
```

## Zod for Runtime Validation

TypeScript types disappear at runtime. Use Zod to bridge the gap:

```typescript
import { z } from "zod";

// Define schema once
const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(["admin", "user", "guest"]),
  createdAt: z.string().datetime(),
});

// Infer type from schema
type User = z.infer<typeof UserSchema>;

// Validate at runtime (API boundaries)
async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  const data = await response.json();
  return UserSchema.parse(data); // Throws if invalid
}
```

## Avoid These Anti-Patterns

### 1. Don't Use `any` as an Escape Hatch

```typescript
// Bad
function handleEvent(event: any) {
  event.target.value; // No type safety
}

// Good
function handleEvent(event: React.ChangeEvent<HTMLInputElement>) {
  event.target.value; // Fully typed
}
```

### 2. Don't Over-Engineer Generic Types

```typescript
// Over-engineered
type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

// Often, simpler is better
type UpdateUserInput = Partial<Pick<User, "name" | "email">>;
```

### 3. Avoid Type Assertions When Possible

```typescript
// Bad: Lying to the compiler
const user = response.data as User;

// Good: Validate at runtime
const user = UserSchema.parse(response.data);
```

## Project Structure for Scale

```
src/
├── types/           # Shared type definitions
│   ├── api.ts       # API response types
│   ├── domain.ts    # Business domain types
│   └── index.ts     # Re-exports
├── utils/           # Typed utility functions
├── hooks/           # Custom React hooks with proper types
└── components/      # UI components with typed props
```

Keep types close to where they're used, but extract shared types to a central location.

## Key Takeaways

1. **Embrace strict mode** - it catches real bugs
2. **Use discriminated unions** - model state explicitly
3. **Validate at boundaries** - use Zod for runtime checks
4. **Avoid `any`** - use `unknown` if you truly don't know the type
5. **Keep it simple** - overly complex types are a code smell

TypeScript's power comes from using it as intended. Fight the urge to escape the type system—it's trying to help you.
