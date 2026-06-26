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

## `IOText`

This library already offers a range of predefined typographic styles, such as `H1`, `H2`, and so on. However, there may be times when you need to add a specific typographic style with visual attributes that are not included in any of the predefined styles.

In this case, you can define a custom typographic style using the `IOText` component, which is specifically designed to replace the native `Text` component.

It has some useful features:
- Built-in support for bold text, if set by the user (iOS only)
- Based on the new `IOFontSize` scale