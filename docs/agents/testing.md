# Testing

## Commands

```bash
yarn test:dev                    # Run tests without coverage
yarn test:ci                     # CI mode with coverage
jest path/to/file.test.ts        # Single test file
jest -t "test name pattern"      # Tests matching pattern
```

## Structure

- Co-locate tests in `__tests__/` next to implementation
- Use `renderScreenWithNavigationStoreContext` for screens
- Use `withStore` HOC for components needing store
- Use `expectSaga` for saga integration tests, `testSaga` for unit tests
- Use `test.each` to avoid repeating similar tests across multiple scenarios
- Define scenario arrays with descriptive names and use `$name` interpolation in test titles

## Common Utilities

```tsx
import { renderScreenWithNavigationStoreContext } from "../../utils/testWrapper";
import { withStore } from "../../utils/jest/withStore";
```


