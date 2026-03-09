# Code Conventions

## TypeScript

- Prefer string literal unions over `enum`: `type MyType = "type_a" | "type_b"`

## Naming

- `camelCase` for files and variables
- `PascalCase` for components and classes
- `UPPER_SNAKE_CASE` for constants

## File Organization

- **Max 200 lines per file**
- **One component per file**

## IO-Specific Hooks

Use these instead of raw Redux/Navigation hooks:

- `useIOSelector` instead of `useSelector`
- `useIODispatch` instead of `useDispatch`
- `useIOStore` instead of `useStore`
- `useIONavigation` instead of `useNavigation`

## Design System

Import all UI components from `@pagopa/io-app-design-system`:

```tsx
import { VSpacer, H3, Body, IOColors, useIOToast } from "@pagopa/io-app-design-system";
```

Never create custom typography or spacing.

## Internationalization

Translations in `locales/{it,en,de}/` as YAML. Only Italian (`it`) is mandatory.

```bash
yarn generate:locales  # After modifying YAML files
```

```tsx
import I18n from "../../i18n";
I18n.t("features.itWallet.discovery.title")
```

## Import Restrictions

- Import `I18n` from `ts/i18n.ts`, not from `i18n-js`
- Import pot as `import * as pot from "@pagopa/ts-commons/lib/pot"`, not `{ pot }` from `@pagopa/ts-commons`
