# Commands

## Setup

```bash
pnpm setup              # Install deps + generate APIs + locales
pnpm sync               # Full sync including iOS pods (bundle + pod install + generate)
pnpm dev:pod-install.   # Specific command to install iOS Pods on local environment with script variable
```

## Running the App

```bash
pnpm run-ios            # Run iOS simulator
pnpm dev:run-android    # Run Android in production debug mode (requires emulator running)
```

### Android Emulator Setup

```bash
pnpm lollipop_checks:comment    # Disable hardware keystore check for emulator
pnpm lollipop_checks:uncomment  # Re-enable before committing (required)
```

## Code Generation

```bash
pnpm generate           # Regenerate API models + locales from OpenAPI specs
```

## Quality Checks

```bash
pnpm lint               # ESLint check
pnpm lint-autofix       # ESLint with auto-fix
pnpm tsc:noemit         # TypeScript check only
pnpm prettier:check     # Check formatting
```
