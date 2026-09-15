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
import { IOTypography, useIOTheme } from "@pagopa/io-app-design-system";

const theme = useIOTheme();
const {
  h1: { colorToken, ...h1Style }
} = IOTypography;
// { dynamicTypeRamp: "largeTitle", lineHeight: 42, size: 28, weight: "Semibold" }
```

Like `IOColors`, the name doubles as the type of its own keys, so a component can take a style by name:

```tsx
type Props = { typographicStyle?: IOTypography }; // "hero" | "h1" | …
```

The keys mirror the `IOText` props, so an entry can be spread straight into the component. That's what every style does:

```tsx
<IOText {...h1Style} color={theme[colorToken]}>…</IOText>
```

Reach for it when you have to reproduce a style outside the React Native text tree — a SwiftUI text, a canvas, a skeleton placeholder sized on the text it stands in for — instead of copying the numbers:

```tsx
<IOSkeleton height={IOTypography.h2.size} radius={4} shape="rectangle" width="80%" />
```

Two entries need a word of warning:
- `buttonText` pins a static `color` rather than a `colorToken`, because `IOButton` and `SearchInput` animate it through Reanimated;
- `h6` carries a `legacySize`, applied while the legacy typeface is enabled.

The color of a text rendered as a link is the same for every style, so it's exported on its own as `IOTypographicLinkColorToken`.

## `IOText`

This library already offers a range of predefined typographic styles, such as `H1`, `H2`, and so on. However, there may be times when you need to add a specific typographic style with visual attributes that are not included in any of the predefined styles.

In this case, you can define a custom typographic style using the `IOText` component, which is specifically designed to replace the native `Text` component.

It has some useful features:
- Built-in support for bold text, if set by the user (iOS only)
- Based on the new `IOFontSize` scale