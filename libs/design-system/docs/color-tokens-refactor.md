# Color tokens refactor

Multi-step plan to move every color of the Design System into a single typed source, the color slice of `IOTokens` (`IOTokens.color`). It follows the [dimension tokens refactor](./dimension-tokens-refactor.md).

Scope: **colors only**.

## Decisions

| Topic           | Decision                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Tiers           | Palette (`IOColorPalette`) → semantic tokens, one object per mode mirroring the Figma `Semantics` collection (`Color/Text/Content/Error` → `text.content.error`) → component colors, declared by each component in its own `colors.ts` and exposed under `IOColors.<mode>.component`                                                                                                                                                                                                                                                                                                                                                                                                             |
| Hue names       | Figma's (`greyscale`, `blueIO`, `hanPurple`, `turquoise`, `red`, `yellow`, `green`, `lightBlue`, `blueItalia`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Palette shape   | Nested, step-keyed: `IOColorPalette.greyscale[50]`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Source of truth | Common ground: the code value wins; where the code contradicts itself, Figma decides                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Modes           | `dark` must define every token of `light` (`IOColorScheme`). A token can be opaque in one mode and translucent in the other                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Alpha           | Opaque by default. Alpha only through `withAlpha(color, opacity)`, with `opacity` from `IOOpacity.scale`; named opacities sit next to the ramp (`IOOpacity.disabled`: 0.5, every disabled state); output is `rgba()`, not 8-digit hex                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Types           | Branded: `IOPaletteColor` (palette), `IOTranslucentColor` (`withAlpha`), `IOTokenColor` (either of them: no written string satisfies it), `IOCustomColor` (a hex declared in a module-level constant)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Access          | Never destructure color tokens: `IOColorPalette.…` or `colors.…` (`const colors = useIOColors()`) keep the reference readable as "one of our colors"                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Theme access    | `useIOColors()` returns the tokens of the resolved mode, from the same context and mode logic as `useIOTheme()`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Text colors     | Typographic styles accept a token, never a written value: the guarantee the legacy name lookup (`IOColorsLegacy[color]`) gave. `style.color` stays the escape hatch for animated colors                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Semantic rules  | Groups are properties shared across components (`background`, `surface`, `brand`, `icon`, `pictogram`, `text`, `stroke`): no component groups, no states, no catch-all. A status color at the root of a group sits on a neutral background (`text.content.error`); `onTint` holds the ones on the matching `surface` tint (`text.content.onTint.error` on `surface.error`), `onColor` the ones on a solid fill. Dark `onTint` values are the 100 step, the inverse of light's 850; `text.label.onTint` (short labels: badges) keeps the more saturated 400 step. A token nothing uses is removed, not kept for later. Emphasis by ordinal (`secondary`, `tertiary`) or `strong`, no comparatives |
| Product colors  | A product the DS shows itself (a product icon, a component variant) gets its colors in `product.ts`, one object per mode beside the semantic tokens (`colors.product.pagopa.icon`, `colors.product.cgn.surface`). Colors of a single feature (bonus cards, IT Wallet credentials, CGN screens) live in that feature\'s own `colors.ts`, built from the palette                                                                                                                                                                                                                                                                                                                                   |
| Component shape | Every component config is variant → role (`background`, `foreground`, `border`) → state (`default` required, `pressed`, `disabled`), typed by `IOComponentColors` and checked with `satisfies` against the component's own variant types                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Layering        | Component configs import only `palette.ts`, `semantic.ts`, `product.ts` and `utils.ts` (types from their component with `import type`); `tokens/colors/index.ts` imports the configs. Deleting a component breaks that import, so its colors can't be left behind                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Gradients       | `IOColorGradients` and `getGradientColorValues` are deprecated, not migrated                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Compatibility   | Non-breaking until the legacy removal, which needs a DS major                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |

## Figma follow-ups (design side)

- Code-only semantic tokens, not in Figma: `text.helper.success`, `pictogram.tertiary`. Add them to Figma, or move them into component configs as palette exceptions.
- Renames from the semantic clean-up: `onAccent` and `neutral.onBrand` → `onColor.default`; `icon.*OnColor` → `icon.onTint.*`; `neutral.header` → `icon.strong`; `inputStronger` → `inputStrong`.
- Status text: `text.content.<status>` (850) → `text.content.onTint.<status>` (dark: 100); `text.content.<status>` now holds the color on a neutral background (light 600/700, dark 400), replacing `text.helper.error` and `text.helper.success`.
- `surface.info` in dark: `LightBlue/400` at 20%, like the other tints (was opaque `LightBlue/100`).
- `surface.accent`: unused, removed from the code.
- New `text.label.onTint.<status>` (850 light, 400 dark; `highlight`: `Turquoise/300`) for short labels on a tint, such as badges.
- Product colors (`product.pagopa`, `product.cgn`): a `Products` collection, with light and dark modes.
- Groups moved to the component tier (see below): remove them from `Semantics`, or keep them as component variables.
- `Color/Opacity` has 20, 60 and 50 (`Disabled`): add the code values `0`, `10`, `15`, `70` and `85` of `IOOpacity.scale`.
- `Background/Overlay` is `Greyscale/850` at 20% in both modes; the code uses `Greyscale/Black` at 15% (light) and 70% (dark), from the bottom sheet and modal backdrop: align Figma.

## Moved to the component tier

Removed from the semantic layer: each component defines them in its `colors.ts` when it migrates (light / dark).

| Former token                                                     | Values                                                                                          | Owner                     |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------- |
| `action.primary` (default, pressed, disabled)                    | blueIO 500, 600, grey 300 / blueIO 300, 400, grey 700                                           | `IOButton` (done)         |
| `action.danger`                                                  | red 600, 500, grey 300 / red 600, 500, grey 700                                                 | `IOButton` (done)         |
| `action.inverse`                                                 | white, blueIO 50, blueIO 50 (both)                                                              | `IOButton` (done)         |
| `text.onAction.primary`, `text.onAction.inverse`                 | white / black; blueIO 500 (both)                                                                | `IOButton` (done)         |
| `surface.defaultPressed`                                         | grey 50 / grey 900                                                                              | List items                |
| `indicator` (accent, inverse, inactive, inactiveStronger, error) | blueIO 500, white, grey 200, grey 650, red 600 / blueIO 300, black, grey 700, grey 200, red 400 | Page indicators, steppers |
| `selection.active`                                               | blueIO 500 / blueIO 300                                                                         | Checkbox, radio, switch   |
| `navbar` (default, active)                                       | grey 700, blueIO 500 / grey 300, blueIO 300                                                     | Tab bar                   |
| `misc.skeleton` (default, defaultOnColor, accent, highlight)     | grey 100, 200, 650, turquoise 100 / grey 850, 700, 300, turquoise 600                           | `IOSkeleton`              |
| `misc.placeholder`                                               | turquoise 50 (both)                                                                             | Placeholders              |
| `misc.system` (default, inverse)                                 | black, white / white, white                                                                     | Status bar                |

## Layout

```
src/core/
  IOColors.ts         Legacy palette and themes (deprecated)
  tokens/
    index.ts          IOTokens = { dimension: IODimensions, color: IOColors }
    colors/
      palette.ts      IOColorPalette, IOOpacity, color types
      semantic.ts     light, dark (Figma Semantics), IOComponentColors
      product.ts      light, dark product colors
      utils.ts        tagColors, withAlpha
      index.ts        IOColors per mode: semantic + product + component configs
src/components/
  <component>/colors.ts   <component>Colors(semantic, mode)
src/context/
  IOThemeContextProvider.tsx   colors field, useIOColors
```

## Steps

### 1. Palette and alpha ✅

- `IOColorPalette` (nested, Figma hue names) and `IOOpacity` (`scale`, `disabled`). The local `DISABLED_OPACITY` constants of 8 components use `IOOpacity.disabled`.
- `withAlpha` in `utils.ts`; `hexToRgba` becomes its deprecated alias.
- Legacy `IOColors` renamed to `IOColorsLegacy` (233 files); gradients deprecated.

### 2. Semantic and component tiers ✅

- `light` and `dark` semantic objects, `IOColors.{light,dark}` with the component tier merged in, `IOTokens.color`.
- Component configs: `IOButton/colors.ts` (solid, outline, link × primary, danger, contrast) and `badge/colors.ts`, exposed as `component.button` and `component.badge`.
- `IconButtonContained` removed instead of migrated.
- Semantic clean-up: component groups, states and `misc` moved to the component tier; one `onColor` convention.
- Product tier: `product.pagopa` (the `productPagoPA` icon, used by the main-app payment headers) and `product.cgn` (Badge `cgn`).

### 3. Theme access ✅

- `colors` field in `IOThemeContext`, `useIOColors()` hook.
- `useIOTheme` deprecated.

### 4. Lint guards ✅

- `@io-app/no-hardcoded-colors` (warn): colors outside module-level constants (gradient arrays, color props, colors inside functions, `withAlpha`/`hexToRgba` arguments). Off for tests, dev-only screens, generated SVGs, logos and the palettes.
- `react-native/no-color-literals` (error, existing) owns style objects: `StyleSheet.*` and `*style*` props.
- `no-restricted-syntax`: no destructuring of `IOColorPalette` or `useIOColors()`.

### 5. Text colors ✅

- IOText `color` accepts `IOTextColor` (`IOColorsLegacy | IOTokenColor`): a legacy name is resolved as before, a token is used as is.
- Semantic and component leaves narrowed from `IOColorValue` to `IOTokenColor`.

### 6. Migrate DS components

- Done: `IOButton`, `Badge` (also fixes `"unspecified"` rendering dark colors in light mode), `Alert` (`surface.<status>` + `text.content.onTint.<status>`).
- Left: every other component reading `useIOTheme()` or `IOColorsLegacy`.
- Each migration adds a `colors.ts` next to the component, registers it in `tokens/colors/index.ts` and drops the local color maps.

### 7. Migrate main-app

- ~220 files call `useIOTheme()`: move `IOColorsLegacy[theme["…"]]` to `colors.…`.
- ~75 `no-hardcoded-colors` warnings (mostly IT Wallet: `Trustmark`, `BrandedBox`, `DigitalVersionBadge`, `itwStyleUtils`): move to tokens or module-level constants.
- Feature colors (bonus cards, CGN, IT Wallet credentials) move to a `colors.ts` in their feature; the pagoPA icons of `AvatarDouble` and `BarcodeScanScreen` move to `colors.product.pagopa.icon`.
- Then switch `@io-app/no-hardcoded-colors` to `error`.

### 8. Remove legacy (DS major)

- `IOColors.ts`: `IOColorsLegacy`, `IOColorsNeutral`, `IOColorsTints`, `IOColorsStatus*`, `IOColorsExtra`, `IOColorGradients`, `getGradientColorValues`, `themeKeys`, `IOTheme`, `IOThemeLight`, `IOThemeDark`, `themeStatusColors*`, the `asIO*` helpers, `hexToRgba`.
- Context: `IOThemes`, the `theme` field, `useIOTheme`.
- IOText: remove `IOTextColor`, `isLegacyColor` and `getTextColorValue` (also used by `AnimatedNumericText` on iOS); `color` becomes `IOTokenColor`. Same for the `IOColorsLegacy` default in `typography/common.tsx`.

### 9. Optional: Figma generator

- Generate the palette and semantic tiers from the Figma variables, as in the dimension plan (Step 8); the component tier stays hand-written.

## Known gaps

- `withAlpha` accepts `IOCustomColor`, so `withAlpha("#123456", 0.5)` type-checks as an `IOTranslucentColor`. `no-hardcoded-colors` flags the written hex.
- Inside a style object, a color passed through a call (`backgroundColor: hexToRgba("#…", 0.4)`) is caught by neither lint rule.
