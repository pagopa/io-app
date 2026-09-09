/*
TYPOGRAPHIC STYLES
Every typographic style of the Design System, described as data instead of
being pinned inside the component that renders it. The leaf components
(`H1`, `Body`, …) are the first consumer, so each value lives here and
nowhere else, but any other consumer that has to reproduce a style outside
the React Native text tree — a SwiftUI text, a canvas, a skeleton
placeholder — can read the same attributes.
*/

import { TextProps, TextStyle } from "react-native";

import { IOFontFamily, IOFontSize, IOFontWeight } from "../utils/fonts";
import { IOColors, IOTheme } from "./IOColors";

export type IOTypographicStyle = IOTypographicAttributes & IOTypographicColor;

/**
 * Visual attributes of a typographic style. The keys mirror the `IOText`
 * props, so an entry can be spread straight into the component.
 */
type IOTypographicAttributes = {
  /**
   * iOS Dynamic Type ramp the style maps to. Absent on the styles that have
   * never declared one.
   */
  dynamicTypeRamp?: TextProps["dynamicTypeRamp"];
  /**
   * Absent when the style follows the typeface currently enabled, which is
   * resolved by `IOText` through `useIONewTypeface`.
   */
  font?: IOFontFamily;
  /**
   * Size applied while the legacy typeface is enabled. Only `H6` declares one.
   */
  legacySize?: IOFontSize;
  lineHeight?: TextStyle["lineHeight"];
  size: IOFontSize;
  /**
   * Attributes applied on top of the font style. They are kept apart from
   * `style` so a consumer can still override the latter.
   */
  textStyle?: Pick<TextStyle, "letterSpacing" | "textTransform">;
  weight: IOFontWeight;
};

/**
 * Chromatic default of a style, applied when no `color` prop is set. It's a
 * theme token for every style but `ButtonText`, which pins a static value.
 */
type IOTypographicColor =
  | { color: IOColors; colorToken?: never }
  | { color?: never; colorToken: keyof IOTheme };

/* Default color for any text rendered as a link, whatever its style */
export const IOTypographicLinkColorToken: keyof IOTheme =
  "interactiveElem-default";

export const IOTypography = {
  hero: {
    colorToken: "textHeading-default",
    lineHeight: 48,
    size: 32,
    weight: "Semibold"
  },
  h1: {
    colorToken: "textHeading-default",
    dynamicTypeRamp: "largeTitle",
    lineHeight: 42,
    size: 28,
    weight: "Semibold"
  },
  h2: {
    colorToken: "textHeading-default",
    dynamicTypeRamp: "title1",
    lineHeight: 34,
    size: 26,
    weight: "Semibold"
  },
  h3: {
    colorToken: "textHeading-default",
    dynamicTypeRamp: "title2",
    lineHeight: 33,
    size: 22,
    weight: "Semibold"
  },
  h4: {
    colorToken: "textHeading-default",
    dynamicTypeRamp: "title3",
    lineHeight: 24,
    size: 20,
    weight: "Semibold"
  },
  h5: {
    colorToken: "textHeading-default",
    dynamicTypeRamp: "subheadline",
    lineHeight: 16,
    size: 14,
    textStyle: { letterSpacing: 0.5, textTransform: "uppercase" },
    weight: "Semibold"
  },
  h6: {
    colorToken: "textHeading-default",
    dynamicTypeRamp: "headline",
    legacySize: 17,
    lineHeight: 24,
    size: 16,
    weight: "Semibold"
  },
  body: {
    colorToken: "textBody-tertiary",
    dynamicTypeRamp: "body",
    lineHeight: 24,
    size: 16,
    weight: "Regular"
  },
  bodySmall: {
    colorToken: "textBody-tertiary",
    dynamicTypeRamp: "footnote",
    lineHeight: 21,
    size: 14,
    weight: "Regular"
  },
  bodyMonospace: {
    colorToken: "textBody-tertiary",
    dynamicTypeRamp: "body",
    font: "FiraCode",
    lineHeight: 24,
    size: 16,
    textStyle: { letterSpacing: 0.5 },
    weight: "Medium"
  },
  labelMini: {
    colorToken: "textBody-tertiary",
    dynamicTypeRamp: "footnote",
    lineHeight: 18,
    size: 12,
    weight: "Semibold"
  },
  caption: {
    colorToken: "textBody-default",
    dynamicTypeRamp: "caption1",
    size: 12,
    textStyle: { letterSpacing: 0.5, textTransform: "uppercase" },
    weight: "Regular"
  },
  buttonText: {
    /* Static value, and not a theme token: `IOButton` and `SearchInput`
       animate this color through Reanimated, which needs a `ColorValue` */
    color: "white",
    lineHeight: 20,
    size: 16,
    weight: "Semibold"
  },
  mdH1: {
    colorToken: "textHeading-default",
    lineHeight: 24,
    size: 20,
    weight: "Semibold"
  },
  mdH2: {
    colorToken: "textHeading-default",
    lineHeight: 24,
    size: 18,
    weight: "Semibold"
  },
  mdH3: {
    colorToken: "textHeading-default",
    lineHeight: 24,
    size: 16,
    weight: "Semibold"
  }
} as const satisfies Record<string, IOTypographicStyle>;

export type IOTypography = keyof typeof IOTypography;
