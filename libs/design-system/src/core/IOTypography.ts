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

export type IOTypographicStyle = IOTypographicAttributes;

/**
 * Visual attributes of a typographic style. The keys mirror the `IOText` props,
 * so an entry can be spread straight into the component.
 */
type IOTypographicAttributes = {
  /**
   * The iOS Dynamic Type ramp the style maps to. Absent on the styles that have
   * never declared one.
   */
  dynamicTypeRamp?: TextProps["dynamicTypeRamp"];
  /**
   * Absent when the style follows the typeface currently enabled, which is
   * resolved by `IOText` through `useIONewTypeface`.
   */
  font?: IOFontFamily;
  /** Size applied while the legacy typeface is enabled. Only `H6` declares one. */
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

export const IOTypography = {
  hero: {
    lineHeight: 48,
    size: 32,
    weight: "Semibold"
  },
  h1: {
    dynamicTypeRamp: "largeTitle",
    lineHeight: 42,
    size: 28,
    weight: "Semibold"
  },
  h2: {
    dynamicTypeRamp: "title1",
    lineHeight: 34,
    size: 26,
    weight: "Semibold"
  },
  h3: {
    dynamicTypeRamp: "title2",
    lineHeight: 33,
    size: 22,
    weight: "Semibold"
  },
  h4: {
    dynamicTypeRamp: "title3",
    lineHeight: 24,
    size: 20,
    weight: "Semibold"
  },
  h5: {
    dynamicTypeRamp: "subheadline",
    lineHeight: 16,
    size: 14,
    textStyle: { letterSpacing: 0.5, textTransform: "uppercase" },
    weight: "Semibold"
  },
  h6: {
    dynamicTypeRamp: "headline",
    legacySize: 17,
    lineHeight: 24,
    size: 16,
    weight: "Semibold"
  },
  body: {
    dynamicTypeRamp: "body",
    lineHeight: 24,
    size: 16,
    weight: "Regular"
  },
  bodySmall: {
    dynamicTypeRamp: "footnote",
    lineHeight: 21,
    size: 14,
    weight: "Regular"
  },
  bodyMonospace: {
    dynamicTypeRamp: "body",
    font: "FiraCode",
    lineHeight: 24,
    size: 16,
    textStyle: { letterSpacing: 0.5 },
    weight: "Medium"
  },
  labelMini: {
    dynamicTypeRamp: "footnote",
    lineHeight: 18,
    size: 12,
    weight: "Semibold"
  },
  caption: {
    dynamicTypeRamp: "caption1",
    size: 12,
    textStyle: { letterSpacing: 0.5, textTransform: "uppercase" },
    weight: "Regular"
  },
  buttonText: {
    lineHeight: 20,
    size: 16,
    weight: "Semibold"
  },
  mdH1: {
    lineHeight: 24,
    size: 20,
    weight: "Semibold"
  },
  mdH2: {
    lineHeight: 24,
    size: 18,
    weight: "Semibold"
  },
  mdH3: {
    lineHeight: 24,
    size: 16,
    weight: "Semibold"
  }
} as const satisfies Record<string, IOTypographicStyle>;

export type IOTypography = keyof typeof IOTypography;
