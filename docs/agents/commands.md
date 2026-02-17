# Commands

## Setup

```bash
yarn setup              # Install deps + generate APIs + locales
yarn sync               # Full sync including iOS pods (bundle + pod install + generate)
yarn dev:pod-install.   # Specific command to install iOS Pods on local environment with script variable
```

## Running the App

```bash
yarn run-ios            # Run iOS simulator
yarn dev:run-android    # Run Android in production debug mode (requires emulator running)
```

### Android Emulator Setup

```bash
yarn lollipop_checks:comment    # Disable hardware keystore check for emulator
yarn lollipop_checks:uncomment  # Re-enable before committing (required)
```

## Code Generation

```bash
yarn generate           # Regenerate API models + locales from OpenAPI specs
yarn generate:locales   # Regenerate only locale files from YAML
```

## Quality Checks

```bash
yarn lint               # ESLint check
yarn lint-autofix       # ESLint with auto-fix
yarn tsc:noemit         # TypeScript check only
yarn prettier:check     # Check formatting
```
