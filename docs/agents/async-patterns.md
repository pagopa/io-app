# Async State Patterns

## pot (Active)

Used for representing async data states:

```tsx
import * as pot from "@pagopa/ts-commons/lib/pot";

// States
pot.none
pot.noneLoading
pot.some(value)
pot.toLoading(pot)
pot.toError(pot, error)

// Guards
pot.isNone()
pot.isSome()
pot.isLoading()
pot.isError()
```

Additional utilities in `ts/utils/pot.ts`: `isStrictNone()`, `foldK()`, `potFoldWithDefault()`

## io-ts (Active)

Used for validating external API responses and untrusted data.

## fp-ts (Deprecated)

**Avoid in new code.** Use standard TypeScript instead:

- Standard null/undefined checks over `Option<T>`
- Try/catch over `Either<E, A>`
- Native array methods over `pipe()` chains
