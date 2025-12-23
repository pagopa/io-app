description: 'Testing best practices'
applyTo: '**/*.test.jsx, **/*.test.tsx, **/*.test.js, **/*.test.ts'
---
# Testing Patterns

## Test File Organization
- **Co-located tests**: Place tests in `__tests__/` directory next to implementation (e.g., `components/MyComponent.tsx` → `components/__tests__/MyComponent.test.tsx`)
- **File naming**: Match implementation file name with `.test.tsx` or `.test.ts` extension
- **Test structure**: Use `describe` blocks to group related tests logically

## Component Testing Strategy

### Simple Components (Atoms, Molecules)
**Prefer snapshot testing** to cover different variants. Test multiple states/props variations with `toMatchSnapshot()`.

### Complex Components
**Prefer testID-based testing** for targeted assertions. Use `getByTestId`, `fireEvent`, and specific property/state checks.

## Test Setup and Cleanup

```tsx
describe("MyComponent", () => {
  beforeEach(() => jest.clearAllMocks());
  afterEach(() => jest.restoreAllMocks());
  beforeAll(() => { /* expensive one-time setup */ });
  afterAll(() => { /* one-time cleanup */ });
});
```

## Component Tests

### Testing Screens
Use `renderScreenWithNavigationStoreContext` from `utils/testWrapper`:
```tsx
const renderComponent = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);
  return renderScreenWithNavigationStoreContext(MyScreen, ROUTES.SCREEN_NAME, {}, store);
};
```

### Testing Simple Components
Use `withStore` HOC from `utils/jest/withStore` if store is needed:
```tsx
const MyComponentWithStore = withStore(MyComponent);
```

### Creating Test Stores
- **Real store**: `createStore(appReducer, appReducer(undefined, applicationChangeState("active")) as any)`
- **Mock store**: `configureMockStore<GlobalState>()(globalState as GlobalState)`

## Saga Tests

### Integration Tests (`expectSaga`)
```tsx
return expectSaga(mySaga, myAction.request())
  .provide([[call(apiClient.getData), { status: 200, value: mockData }]])
  .put(myAction.success(mockData))
  .run();
```

### Unit Tests (`testSaga`)
```tsx
testSaga(mySaga, myAction.request())
  .next()
  .call(apiClient.getData)
  .next({ status: 200, value: mockData })
  .put(myAction.success(mockData))
  .next()
  .isDone();
```

### Testable Saga Helpers
Export small generator functions via `testable` object (only in `__DEV__`):
```tsx
export const testable = __DEV__ ? { waitForResult, handleApiCall } : undefined;
```

## Reducer Tests
Test initial state and all action handlers. Use `typesafe-actions` action creators.

## Mocking

### Module Mocks
```tsx
jest.mock("../../../utils/url", () => ({ openWebUrl: jest.fn() }));
jest.mock("../../../store/hooks", () => ({
  ...jest.requireActual("../../../store/hooks"),
  useIOSelector: jest.fn(),
  useIODispatch: jest.fn()
}));
```

### Selective Mocking
```tsx
jest.spyOn(urlUtils, "openWebUrl").mockImplementation(() => {});
```

### Common Mocks
- React Native: `Linking`, `Alert`
- Navigation: `@react-navigation/native`
- Sentry: `@sentry/react-native`
- IO hooks: `useIOSelector`, `useIODispatch`, `useIONavigation`

## Assertions

- **Snapshots**: `expect(toJSON()).toMatchSnapshot()`
- **TestID**: `expect(getByTestId("my-button")).not.toBeNull()`
- **Content**: `expect(getByText("Hello")).not.toBeNull()`
- **Prefer `queryBy*`** for checking absence (returns `null` vs throwing)
- **Use `getBy*`** when element must exist (throws if not found)

## Parameterized Tests with `it.each`

### Array Syntax
```tsx
const potStates = [pot.none, pot.noneLoading, pot.some({})];
it.each(potStates)("renders correctly for %s", (potState) => {
  expect(renderComponent({ data: potState }).toJSON()).toMatchSnapshot();
});
```

### Table Syntax
```tsx
it.each`
  variant       | disabled | expectedColor
  ${"primary"}  | ${false} | ${"blue"}
  ${"secondary"}| ${true}  | ${"gray"}
`("renders $variant with $expectedColor when disabled=$disabled", 
  ({ variant, disabled, expectedColor }) => {
    expect(getByTestId("button").props.style.backgroundColor).toBe(expectedColor);
  }
);
```

### Use Cases
- Testing multiple pot states (`pot.none`, `pot.noneLoading`, `pot.some`, etc.)
- Testing component variants/states
- Testing different error types/conditions
- Testing selectors with multiple inputs

### Benefits
- Reduced code duplication
- Better test coverage
- Clear test names showing exact conditions
- Maintainable - changes in one place

## Common Anti-Patterns

### ❌ DON'T
- Place tests in separate top-level `tests/` directory
- Use `setTimeout` or manual promises for async (use `waitFor` instead)
- Leave mocks active between tests (clean up in `afterEach`)
- Use `getByTestId` for checking absence (use `queryByTestId`)
- Create custom test utilities that duplicate `@testing-library/react-native`
- Test implementation details instead of behavior
- Repeat test logic - use `it.each` for multiple conditions

### ✅ DO
- Co-locate tests in `__tests__/` next to implementation
- Use `waitFor` from `@testing-library/react-native` for async
- Clean up mocks with `jest.restoreAllMocks()` and `jest.clearAllMocks()`
- Use `queryBy*` for optional elements
- Use provided test utilities (`renderScreenWithNavigationStoreContext`, `withStore`)
- Test user-facing behavior and outcomes
- Use parameterized tests (`it.each`) to reduce duplication
