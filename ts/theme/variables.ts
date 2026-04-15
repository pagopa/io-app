/**
 * This file imports all the variables defined inside the native-base material
 * theme than overwrites or add more variables. The combined variables are
 * exported to be used in our components theme files (check `./components`
 * directory).
 */

import { IOColors } from "@pagopa/io-app-design-system";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { Platform } from "react-native";
import { FontWeight, makeFontStyleObject } from "./fonts";

export const VIBRATION_LONG_PRESS_DURATION = 50 as Millisecond;

export const VIBRATION_BARCODE_SCANNED_DURATION = 50 as Millisecond;

const customVariables = {
  minTouchableAreaSize: 48,

  // Button
  btnTextFontWeight: "700" as FontWeight,
  textLightButtonWeight: "600" as FontWeight,

  btnHeight: 40,
  btnWidgetHeight: 24,
  btnFontSize: 16,

  btnXSmallHeight: 32,
  btnXSmallLineHeight: 18,
  btnXSmallFontSize: 14,
  btnXSmallIconSize: 18,

  btnSmallHeight: 39,
  btnSmallLineHeight: 20,
  btnSmallFontSize: 14,
  btnSmallIconSize: 20,

  btnBorderRadius: 4,

  // Inputs (after removing `native-base` dependency)
  // Source: https://docs-v2.nativebase.io/docs/ThemeVariables.html
  inputHeightBase: 50,
  inputFontSize: 16,

  /* ALIAS TOKENS */
  /* Don't put hardcoded color values here.
    Add them to IOColors object, instead.
  */
  brandPrimary: IOColors["blueIO-500"],

  cardShadow: IOColors.black,

  itemSeparator: IOColors["grey-200"],

  // Font
  ...makeFontStyleObject(Platform.select),
  fontSizeBase: 16,
  get fontSize2(): number {
    return this.fontSizeBase * 1.25;
  },
  lineHeightBase: 24,

  // Icon
  iconSizeBase: 24,

  // Content
  contentPadding: 24,
  contentPaddingLarge: 48,
  contentBackground: IOColors.white,

  // Footer
  footerBackground: IOColors.white,
  footerElevation: 20,
  footerPaddingTop: 16,
  footerPaddingLeft: 24,
  footerPaddingBottom: 16,
  footerPaddingRight: 24,
  footerShadowColor: IOColors.black,
  footerShadowOffsetWidth: 0,
  footerShadowOffsetHeight: 50,
  footerShadowOpacity: 0.5,
  footerShadowRadius: 37,

  // Grid
  gridGutter: 10,

  // Header
  appHeaderHeight: 56,
  appHeaderPaddingHorizontal: 12,
  titleHeaderPaddingHorizontal: 24,
  titleHeaderPaddingLeft: 16,
  headerBorderBottomWidth: 0,
  headerBodyFontSize: 14,
  headerBodyFontWeight: "600" as FontWeight,

  // Text
  textColor: IOColors["grey-700"],
  textMessageDetailLinkColor: "#0073E6",
  // TODO: Delete the following variables after refactor using
  // the new Text component (not from NativeBase)
  textNormalWeight: "400" as FontWeight,
  textBoldWeight: "700" as FontWeight,
  textLinkWeight: "600" as FontWeight,

  // Label
  // TODO: Delete the following line after refactor using
  // the new Label component (not from NativeBase)
  labelNormalWeight: "400" as FontWeight,

  // Input
  inputNormalWeight: "400" as FontWeight,

  // Spacer
  spacerExtrasmallHeight: 4,
  spacerSmallHeight: 8,
  spacerHeight: 16,
  spacerLargeHeight: 24,
  spacerExtralargeHeight: 40,

  // Vertical spacer
  spacerWidth: 16,
  spacerLargeWidth: 24,
  spacerExtralargeWidth: 40,

  // Border radius
  borderRadiusBase: 4,

  // Animations
  activeOpacity: 0.25,

  // Spacing
  spacingBase: 8
};

export default customVariables;
