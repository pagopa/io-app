## UI & Design System

All UI components must come from **`@pagopa/io-app-design-system`** first. 
Only build custom components when the design system has no suitable primitive.

```ts
import {
  IOButton,
  IOColors,
  IOText,
  useIOTheme,
  useIOToast
} from "@pagopa/io-app-design-system";
```

- **Theming**: Use `useIOTheme()` to access semantic color tokens. Never use raw hex values.
- **Accessibility**: The ESLint config includes `react-native-a11y/all`. All interactive elements must have accessible labels.
- Screens should be functional components. Do not use class components.
