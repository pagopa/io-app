## Testing instructions

- Co-locate tests in `__tests__/` next to implementation
- Use `renderScreenWithNavigationStoreContext` for screens
- Use `withStore` HOC for components needing store
- Use `expectSaga` for saga integration tests, `testSaga` for unit tests
- Use `test.each` to avoid repeating similar tests across multiple scenarios
- Define scenario arrays with descriptive names and use `$name` interpolation in test titles
- Derive initial state from `appReducer(undefined, applicationChangeState("active"))` for realistic defaults.
- Mock SVGs via `ts/__mocks__/svgMock.js` (already configured in jest).

```ts
// Typical test setup
const store = configureMockStore<GlobalState>()(
  appReducer(undefined, applicationChangeState("active"))
);
render(<Provider store={store}><MyComponent /></Provider>);
```

Run single test file during development:
```bash
yarn test:dev -- ts/features/myFeature/__tests__/myTest.test.ts
