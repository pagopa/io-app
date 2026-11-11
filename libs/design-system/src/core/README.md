# Core

The visual attributes the whole library is built on.

## Tokens

[`tokens`](./tokens) holds the Design System tokens as plain data, with no platform code, so they read the same way in code and in the design tool.

| Token type                                  | Object                       | Content                                                                         |
| ------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------- |
| [Colors](./tokens/colors/README.md)         | `IOColors`, `IOColorPalette` | Semantic tokens and component colors by mode; the palette                       |
| [Dimensions](./tokens/dimensions/README.md) | `IODimensions`               | Spacing, padding, radius, stroke and sizes: scales, system and component values |

## Other attributes

Not yet migrated to `tokens`:

- [`IOTypography`](./IOTypography.ts): visual attributes of each typographic style
- [`IOStyles`](./IOStyles.ts): common styles shared across components
- [`IOAnimations`](./IOAnimations.ts): animation attributes of interactive elements
- [`IOTransitions`](./IOTransitions.ts): custom enter/exit transitions

## Deprecated

- [`IOColorsLegacy`](./IOColorsLegacy.ts): the legacy palette and themes, replaced by `IOColors`
