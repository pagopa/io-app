/**
 * Utility functions to manage font properties to style mapping for both iOS and Android
 * Fonts are managed differently on Android and iOS. Read the Font section of the
 * README file included in this repository.
 */

import { Platform, PlatformStatic } from "react-native";

type PlatformSelectType = PlatformStatic["select"];

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

export const fontWeights = {
  "300": "Light",
  "400": "Regular",
  "600": "SemiBold",
  "700": "Bold"
};

export type FontFamily = keyof typeof fonts;
export type FontWeight = keyof typeof fontWeights;
export const enum FontStyle {
  "normal" = "normal",
  "italic" = "italic"
}

export type FontStyleObject = {
  fontFamily: string;
  fontWeight?: FontWeight;
  fontStyle?: FontStyle;
};

/**
 * Get the correct fontFamily name on both Android and iOS
 */
export const makeFontFamilyName = (
  osSelect: PlatformSelectType,
  font: FontFamily,
  weight: FontWeight | undefined,
  isItalic: boolean | undefined
): string =>
  osSelect({
    android: `${fonts[font]}-${fontWeights[weight || "400"]}${
      isItalic ? "Italic" : ""
    }`,
    ios: fonts[font]
  });

/**
 * This function returns an object containing all the properties needed to use
 * a Font correctly on both Android and iOS.
 */
export const makeFontStyleObject = (
  osSelect: PlatformSelectType,
  weight: FontWeight | undefined = undefined,
  isItalic: boolean | undefined = false,
  font: FontFamily | undefined = "TitilliumWeb"
): FontStyleObject =>
  osSelect({
    android: {
      fontFamily: makeFontFamilyName(osSelect, font, weight, isItalic)
    },
    ios: {
      fontFamily: makeFontFamilyName(osSelect, font, weight, isItalic),
      fontWeight: weight,
      fontStyle: isItalic ? FontStyle.italic : FontStyle.normal
    }
  });
