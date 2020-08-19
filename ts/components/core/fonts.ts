/**
 * Utility functions to manage font properties to style mapping for both iOS and Android
 * Fonts are managed differently on Android and iOS. Read the Font section of the
 * README file included in this repository.
 */

import { Platform } from "react-native";

export type IOFontFamily = keyof typeof fonts;
export type IOFontWeight = "Light" | "Regular" | "SemiBold" | "Bold";
export type FontWeightValue = "300" | "400" | "600" | "700";

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
 * Get the correct fontFamily name on both Android and iOS
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
 * This function returns an object containing all the properties needed to use
 * a Font correctly on both Android and iOS.
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
