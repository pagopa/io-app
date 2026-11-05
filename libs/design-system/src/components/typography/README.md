# Typography

## Handling font files

Fonts are handled differently than Android and iOS. To use the font, `Titillio-Semibold` example, you must apply the following properties for Android:

```css
{
  fontFamily: 'Titillio-Semibold'
}
```

while in iOS the code to be applied is:

```css
{
  fontFamily: 'Titillio',
  fontWeight: '600',
}
```

The different font handling is managed by the `makeFontFamilyName` function. It's included in the [fonts.ts](../../utils/fonts.ts) file, which contains many other utility functions that simplify font management.

## `IOTypography`

Every predefined style (`H1`, `Body`, `Caption`, …) reads its visual attributes from `IOTypography`, exported by [IOTypography.ts](../../core/IOTypography.ts). A value lives there and nowhere else, so the components can't drift from what a consumer reads.

```tsx
import { IOTypography, useIOColors } from "@pagopa/io-app-design-system";

const typographyColors = useIOColors().component.typography;
const { h1: h1Style } = IOTypography;
// { dynamicTypeRamp: "largeTitle", lineHeight: 42, size: 28, weight: "Semibold" }
```

Like `IOColorsLegacy`, the name doubles as the type of its own keys, so a component can take a style by name:

```tsx
type Props = { typographicStyle?: IOTypography }; // "hero" | "h1" | …
```

The keys mirror the `IOText` props, so an entry can be spread straight into the component. That's what every style does:

```tsx
<IOText {...h1Style} color={typographyColors.h1}>
  …
</IOText>
```

Reach for it when you have to reproduce a style outside the React Native text tree — a SwiftUI text, a canvas, a skeleton placeholder sized on the text it stands in for — instead of copying the numbers:

```tsx
<IOSkeleton
  height={IOTypography.h2.size}
  radius={4}
  shape="rectangle"
  width="80%"
/>
```

`h6` carries a `legacySize`, applied while the legacy typeface is enabled.

`IOTypography` holds no color: the default ink of each style is in `useIOColors().component.typography`, under the style's own name (`typography.h1`), plus `link` for any style rendered `asLink`. Outside React, read it from `IOColors.light` / `IOColors.dark`. A `color` prop overrides it. `ButtonText` defaults to the action ink, `foreground.action.primary`; its DS callers set the ink of the component it sits in.

## `IOText`

This library already offers a range of predefined typographic styles, such as `H1`, `H2`, and so on. However, there may be times when you need to add a specific typographic style with visual attributes that are not included in any of the predefined styles.

In this case, you can define a custom typographic style using the `IOText` component, which is specifically designed to replace the native `Text` component.

It has some useful features:

- Built-in support for bold text, if set by the user (iOS only)
- Based on the new `IOFontSize` scale
