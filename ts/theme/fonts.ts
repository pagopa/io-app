/**
 * Utility functions to manage font properties to style mapping for both iOS and Android
 * Fonts are managed differently on Android and iOS. Read the Font section of the
 * README file included in this repository.
 */

import { Platform, PlatformStatic } from "react-native";

type PlatformSelectType = PlatformStatic["select"];

const fonts = {
  TitilliumSansPro: Platform.select({
    android: "TitilliumSansPro",
    ios: "Titillium Sans Pro"
  })
};

const fontWeights = {
  "300": "Light",
  "400": "Regular",
  "600": "Semibold",
  "700": "Bold"
};

type FontFamily = keyof typeof fonts;
export type FontWeight = keyof typeof fontWeights;
enum FontStyle {
  "normal" = "normal",
  "italic" = "italic"
}

type FontStyleObject = {
  fontFamily: string;
  fontWeight?: FontWeight;
  fontStyle?: FontStyle;
};

/**
 * Get the correct fontFamily name on both Android and iOS
 */
const makeFontFamilyName = (
  osSelect: PlatformSelectType,
  font: FontFamily,
  weight?: FontWeight,
  isItalic: boolean = false
): string =>
  osSelect({
    default: "undefined",
    android: `${fonts[font]}-${fontWeights[weight || "400"]}${
      isItalic ? "Italic" : ""
    }`,
    ios: fonts[font]
  });

/**
 * This function returns an object containing all the properties needed to use
 * a Font correctly on both Android and iOS.
 * @deprecated
 */
export const makeFontStyleObject = (
  osSelect: PlatformSelectType,
  weight: FontWeight | undefined = undefined,
  isItalic: boolean | undefined = false,
  font: FontFamily | undefined = "TitilliumSansPro"
): FontStyleObject =>
  osSelect({
    default: {
      fontFamily: "undefined"
    },
    android: {
      fontFamily: makeFontFamilyName(osSelect, font, weight, isItalic)
    },
    ios: {
      fontFamily: makeFontFamilyName(osSelect, font, weight, isItalic),
      fontWeight: weight,
      fontStyle: isItalic ? FontStyle.italic : FontStyle.normal
    }
  });
