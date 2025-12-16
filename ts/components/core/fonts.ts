/**
 * Utility functions to manage font properties to style mapping for both iOS and Android
 * Fonts are managed differently on Android and iOS. Read the Font section of the
 * README file included in this repository.
 */

import { Platform } from "react-native";

export type IOFontFamily = keyof typeof fonts;

const weights = ["Light", "Regular", "Semibold", "Bold"] as const;
export type IOFontWeight = (typeof weights)[number];

const weightValues = ["300", "400", "600", "700"] as const;
export type FontWeightValue = (typeof weightValues)[number];

const fontKeys: ReadonlyArray<IOFontFamily> = ["TitilliumSansPro"];

/**
 * Choose the font name based on the platform
 */
const fonts = {
  TitilliumSansPro: Platform.select({
    android: "TitilliumSansPro",
    ios: "Titillium Sans Pro"
  }),
  ReadexPro: Platform.select({
    android: "ReadexPro",
    ios: "Readex Pro"
  }),
  FiraCode: Platform.select({
    android: "FiraCode",
    web: "FiraCode",
    ios: "Fira Code"
  })
};

/**
 * Mapping between the nominal description of the weight (also the postfix used on Android) and the numeric value
 * used on iOS
 */
export const fontWeights: Record<IOFontWeight, FontWeightValue> = {
  Light: "300",
  Regular: "400",
  Semibold: "600",
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
 * All the used font.
 * Since it is calculated only once and with few elements, readability was preferred.
 */
export const allUsedFonts = [
  ...new Set(
    fontKeys.flatMap(font =>
      weights.flatMap(weight =>
        [FontStyle.normal, FontStyle.italic].flatMap(fontStyle =>
          makeFontFamilyName(font, weight, fontStyle === FontStyle.italic)
        )
      )
    )
  )
];

/**
 * Return a {@link FontStyleObject} with the fields filled based on the platform (iOS or Android).
 * @param weight
 * @param isItalic
 * @param font
 * @deprecated Don't use local `makeFontStyleObject`. Import it from `io-app-design-system` instead.
 */
export const makeFontStyleObject = (
  weight: IOFontWeight | undefined = undefined,
  isItalic: boolean | undefined = false,
  font: IOFontFamily | undefined = "TitilliumSansPro"
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
