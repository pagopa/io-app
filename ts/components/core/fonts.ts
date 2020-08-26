/**
 * Utility functions to manage font properties to style mapping for both iOS and Android
 * Fonts are managed differently on Android and iOS. Read the Font section of the
 * README file included in this repository.
 */

import { Platform } from "react-native";

export type IOFontFamily = keyof typeof fonts;
export type IOFontWeight = "Light" | "Regular" | "SemiBold" | "Bold";
export type FontWeightValue = "300" | "400" | "600" | "700";

/**
 * Choose the font name based on the platform
 */
const fonts = {
  TitilliumWeb: Platform.select({
    android: "TitilliumWeb",
    ios: "Titillium Web"
  }),
  RobotoMono: Platform.select({
    android: "RobotoMono",
    ios: "Roboto Mono"
  })
};

/**
 * Mapping between the nominal description of the weight (also the postfix used on Android) and the numeric value
 * used on iOS
 */
export const fontWeights: Record<IOFontWeight, FontWeightValue> = {
  Light: "300",
  Regular: "400",
  SemiBold: "600",
  Bold: "700"
};

export enum FontStyle {
  "normal" = "normal",
  "italic" = "italic"
}

type FontStyleObject = {
  fontFamily: string;
  fontWeight?: FontWeightValue;
  fontStyle?: FontStyle;
};

/**
 * Get the correct `fontFamily` name on both Android and iOS.
 * @param font
 * @param weight
 * @param isItalic
 */
const makeFontFamilyName = (
  font: IOFontFamily,
  weight?: IOFontWeight,
  isItalic: boolean = false
): string =>
  Platform.select({
    default: "undefined",
    android: `${fonts[font]}-${weight || "Regular"}${isItalic ? "Italic" : ""}`,
    ios: fonts[font]
  });

/**
 * Return a {@link FontStyleObject} with the fields filled based on the platform (iOS or Android).
 * @param weight
 * @param isItalic
 * @param font
 */
export const makeFontStyleObject = (
  weight: IOFontWeight | undefined = undefined,
  isItalic: boolean | undefined = false,
  font: IOFontFamily | undefined = "TitilliumWeb"
): FontStyleObject =>
  Platform.select({
    default: {
      fontFamily: "undefined"
    },
    android: {
      fontFamily: makeFontFamilyName(font, weight, isItalic)
    },
    ios: {
      fontFamily: makeFontFamilyName(font, weight, isItalic),
      fontWeight: weight !== undefined ? fontWeights[weight] : weight,
      fontStyle: isItalic ? FontStyle.italic : FontStyle.normal
    }
  });
