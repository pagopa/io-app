/**
 * Utility functions to manage font properties to style mapping for both iOS and Android
 * Fonts are managed differently on Android and iOS. Read the Font section of the
 * README file included in this repository.
 */

import { Platform, TextStyle } from "react-native";

/**
 * Choose the font name based on the platform
 */
const fonts = {
  TitilliumSansPro: Platform.select({
    android: "TitilliumSansPro",
    web: "TitilliumSansPro",
    ios: "Titillium Sans Pro",
    default: "TitilliumSansPro"
  }),
  Titillio: Platform.select({
    android: "Titillio",
    web: "Titillio",
    ios: "Titillio",
    default: "Titillio"
  }),
  FiraCode: Platform.select({
    android: "FiraCode",
    web: "FiraCode",
    ios: "Fira Code",
    default: "FiraCode"
  })
} as const;

export type IOFontFamily = keyof typeof fonts;

/*
 * Font Sizes
 */
const fontSizes = [12, 14, 16, 20, 22, 26, 28, 32] as const;
const fontSizesLegacy = [17, 28, 31, 35] as const;
const allFontSizes = [...new Set([...fontSizes, ...fontSizesLegacy])];
export type IOFontSize = (typeof allFontSizes)[number];

/*
 * Font Weights
 */

const weights = [
  "Thin",
  "Light",
  "Regular",
  "Medium",
  "Semibold",
  "Bold",
  "Black"
] as const;
export type IOFontWeight = (typeof weights)[number];

const weightValues = ["200", "300", "400", "500", "600", "700", "900"] as const;
export type IOFontWeightNumeric = (typeof weightValues)[number];

/**
 * Mapping between the nominal description of the weight (also the postfix used on Android) and the numeric value
 * used on iOS
 */
export const fontWeights: Record<IOFontWeight, IOFontWeightNumeric> = {
  Thin: "200",
  Light: "300",
  Regular: "400",
  Medium: "500",
  Semibold: "600",
  Bold: "700",
  Black: "900"
};

type FontStyleObject = {
  fontSize: IOFontSize | number;
  /* We also accept `string` because Android needs a composed 
  fontFamily name, like `TitilliumSansPro-Regular` */
  fontFamily: string | IOFontFamily;
  fontWeight?: IOFontWeightNumeric;
  lineHeight?: TextStyle["lineHeight"];
  fontStyle?: TextStyle["fontStyle"];
  boldEnabled?: boolean;
};

/* Function that, given a certain weight, returns the next
available `FontWeight` value. 
For example, if I set it to `Regular`, the function 
should return `Medium`, and so on. If I set it to the last `FontWeight`
value, the function will return the same value.
*/
const getBolderFontWeight = (weight: IOFontWeight): IOFontWeight => {
  const currentWeight = weights.indexOf(weight);
  return currentWeight === weights.length - 1
    ? weight
    : weights[currentWeight + 1];
};

/**
 * Get the correct `fontFamily` name on both Android and iOS.
 * @param font
 * @param weight
 * @param isItalic
 */
export const makeFontFamilyName = (
  font: IOFontFamily,
  weight: IOFontWeight = defaultWeight,
  fontStyle: TextStyle["fontStyle"] = "normal"
): string =>
  Platform.select({
    web: fonts[font],
    android: `${fonts[font]}-${weight || "Regular"}${
      fontStyle === "italic" ? "Italic" : ""
    }`,
    ios: fonts[font],
    default: fonts[font]
  });

/**
 * Default `IOText` typography style
 */
const defaultFont: IOFontFamily = "TitilliumSansPro";
const defaultWeight: IOFontWeight = "Regular";
const defaultFontSize: IOFontSize = 16;
export const IOMaxFontSizeMultiplier = 1.5;

/**
 * Return a {@link FontStyleObject} with the fields filled based on the platform (iOS or Android).
 * @param size
 * @param font
 * @param weight
 * @param fontStyle
 */

export const makeFontStyleObject = (
  size: number = defaultFontSize,
  font: IOFontFamily = defaultFont,
  lineHeight: TextStyle["lineHeight"],
  weight: IOFontWeight = defaultWeight,
  fontStyle: TextStyle["fontStyle"] = "normal",
  boldEnabled: boolean = false
): FontStyleObject => {
  /* If bold text is currently enabled, we select the next
     available `IOFontWeight` value */
  const dynamicWeight = boldEnabled ? getBolderFontWeight(weight) : weight;

  return Platform.select({
    web: {
      fontSize: size,
      fontFamily: makeFontFamilyName(font, dynamicWeight, fontStyle),
      fontWeight: fontWeights[dynamicWeight],
      lineHeight,
      fontStyle
    },
    // On Android other type attributes, like `fontWeight` or `fontStyle`
    // are directly managed through the `fontFamily` name, so we dont' need to
    // include them in the object.
    android: {
      fontSize: size,
      fontFamily: makeFontFamilyName(font, dynamicWeight, fontStyle),
      lineHeight,
      includeFontPadding: false
    },
    ios: {
      fontSize: size,
      fontFamily: makeFontFamilyName(font, dynamicWeight, fontStyle),
      fontWeight: fontWeights[dynamicWeight],
      lineHeight,
      fontStyle
    },
    default: {
      fontSize: size,
      fontFamily: makeFontFamilyName(font, dynamicWeight, fontStyle)
    }
  });
};
