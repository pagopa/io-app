/**
 * This file imports all the variables defined inside the native-base material
 * theme than overwrites or add more variables. The combined variables are
 * exported to be used in our components theme files (check `./components`
 * directory).
 */

/* eslint-disable no-invalid-this */

import { Millisecond } from "@pagopa/ts-commons/lib/units";
import materialVariables from "native-base/src/theme/variables/material";
import { Platform } from "react-native";
import { IOColors } from "../components/core/variables/IOColors";
import { FontWeight, makeFontStyleObject } from "./fonts";
import { ThemeSimpleValue } from "./types";

export const VIBRATION_LONG_PRESS_DURATION = 50 as Millisecond;

export const VIBRATION_BARCODE_SCANNED_DURATION = 50 as Millisecond;

// eslint-disable-next-line
const customVariables = Object.assign(materialVariables, {
  minTouchableAreaSize: 48,

  // Android
  buttonUppercaseAndroidText: false /* NB Theme variable, don't remove */,

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

  get btnLightTextColor(): ThemeSimpleValue {
    return this.textColor;
  },

  /* ALIAS TOKENS */
  /* Don't put hardcoded color values here.
    Add them to IOColors object, instead.
  */
  brandPrimary: IOColors.blue /* NB Theme variable, don't remove */,
  colorHighlight: IOColors.aqua,
  brandSuccess: IOColors.green /* NB Theme variable, don't remove */,
  brandDanger: IOColors.red /* NB Theme variable, don't remove */,

  btnLightBorderColor: IOColors.grey,

  cardShadow: IOColors.black,

  calendarExpirableColor: IOColors.red,

  itemSeparator: IOColors.bluegreyLight,

  toastColor: IOColors.aquaUltraLight,

  /* When the background is dark */
  headerIconDark: IOColors.milderGray,
  /* When the background is light */
  headerIconLight: IOColors.greyLight,

  // Font
  ...makeFontStyleObject(Platform.select),
  fontSizeBase: 16,
  get fontSize2(): number {
    return this.fontSizeBase * 1.25;
  },
  lineHeightBase: 24,

  // Icon
  iconFamily: "Entypo" /* NB Theme variable, don't remove */,
  iconSizeBase: 24,

  // Content
  contentPadding: 24,
  contentPaddingLarge: 48,
  contentBackground: IOColors.white,
  contentPrimaryBackground: IOColors.blue,

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
  toolbarDefaultBg: IOColors.white /* NB Theme variable, don't remove */,
  appHeaderHeight: 56,
  appHeaderPaddingHorizontal: 12,
  titleHeaderPaddingHorizontal: 24,
  titleHeaderPaddingLeft: 16,
  headerBorderBottomWidth: 0,
  headerBodyFontSize: 14,
  headerBodyFontWeight: "600" as FontWeight,
  get toolbarBtnColor(): ThemeSimpleValue {
    /* NB Theme variable, don't remove */
    return this.textColor;
  },
  get toolbarTextColor(): ThemeSimpleValue {
    return this.textColor;
  },
  androidStatusBarColor: IOColors.white,

  // Text
  textColor: IOColors.bluegrey,
  textColorDark: IOColors.bluegreyDark,
  textLinkColor: IOColors.blue,
  textMessageDetailLinkColor: "#0073E6",
  // TODO: Delete the following variables after refactor using
  // the new Text component (not from NativeBase)
  textNormalWeight: "400" as FontWeight,
  textBoldWeight: "700" as FontWeight,
  textLinkWeight: "600" as FontWeight,

  // Skeleton/Placeholder
  colorSkeleton: IOColors.bluegreyLight,

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

  // Tabs
  tabDefaultBg: IOColors.white /* NB Theme variable, don't remove */,
  topTabBarTextColor: IOColors.bluegrey /* NB Theme variable, don't remove */,
  topTabBarActiveTextColor: IOColors.blue /* NB Theme variable, don't remove */,
  tabUnderlineColor: IOColors.greyUltraLight,
  tabUnderlineHeight: 2,

  // Animations
  activeOpacity: 0.25,

  // Spacing
  spacingBase: 8,

  // IconFont
  selectedColor: IOColors.blue,
  unselectedColor: IOColors.bluegrey
});

export default customVariables;
