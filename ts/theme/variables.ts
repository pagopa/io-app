/**
 * This file imports all the variables defined inside the native-base material
 * theme than overwrites or add more variables. The combined variables are
 * exported to be used in our components theme files (check `./components`
 * directory).
 */

/* eslint-disable no-invalid-this */

import { Millisecond } from "italia-ts-commons/lib/units";
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

  // Button
  btnTextFontWeight: "700" as FontWeight,
  textLightButtonWeight: "600" as FontWeight,

  btnHeight: 40,
  btnWidgetHeight: 24,
  btnFontSize: 16,
  btnIconSize: 24,

  btnXSmallHeight: 32,
  btnXSmallLineHeight: 18,
  btnXSmallFontSize: 14,
  btnXSmallIconSize: 18,

  btnSmallHeight: 39,
  btnSmallLineHeight: 20,
  btnSmallFontSize: 14,
  btnSmallIconSize: 20,

  get btnLightTextColor(): ThemeSimpleValue {
    return this.textColor;
  },

  /* ALIAS TOKENS */
  /* Don't put hardcoded color values here.
    Add them to IOColors object, instead.
  */
  brandPrimary: IOColors.blue,
  colorHighlight: IOColors.aqua,
  colorSuccess: IOColors.green,
  colorDanger: IOColors.red,

  btnLightBorderColor: IOColors.grey,

  cardShadow: IOColors.black,
  cardTextColor: IOColors.bluegreyDark,

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
  get fontSizeXSmall(): number {
    return this.fontSizeBase * 0.8125;
  },
  get fontSizeSmall(): number {
    return this.fontSizeBase * 0.875;
  },
  get fontSize1(): number {
    return this.fontSizeBase;
  },
  get fontSize2(): number {
    return this.fontSizeBase * 1.25;
  },
  get fontSize4(): number {
    return this.fontSizeBase * 1.75;
  },
  lineHeightBase: 24,
  lineHeightSmall: 18,
  lineHeightXSmall: 17,
  get lineHeightFontSizeRatio(): number {
    return this.lineHeightBase / this.fontSizeBase;
  },

  // Icon
  iconFamily: "Entypo",
  iconSizeBase: 24,

  get iconSize1(): number {
    return this.iconSizeBase * (2 / 3);
  },
  get iconSize2(): number {
    return this.iconSizeBase * (5 / 6);
  },
  get iconSize3(): number {
    return this.iconSizeBase * 1;
  },
  get iconSize4(): number {
    return this.iconSizeBase * (7 / 6);
  },
  get iconSize5(): number {
    return this.iconSizeBase * 1.5;
  },
  get iconSize6(): number {
    return this.iconSizeBase * 2;
  },
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
  footerBottomBorderWidth: 1,

  // Grid
  gridGutter: 10,

  // Header
  appHeaderHeight: 56,
  appHeaderPaddingHorizontal: 12,
  titleHeaderPaddingHorizontal: 24,
  headerBorderBottomWidth: 0,
  headerBodyFontSize: 14,
  headerFontColor: "#000000",
  headerBodyFontWeight: "600" as FontWeight,
  toolbarDefaultBg: "#FFFFFF",
  get toolbarTextColor(): ThemeSimpleValue {
    return this.textColor;
  },
  get toolbarBtnColor(): ThemeSimpleValue {
    return this.textColor;
  },
  androidStatusBarColor: "#FFFFFF",

  // Modal
  modalMargin: 0,
  modalPadding: 24,
  modalHeaderHeight: 75,

  // Text
  textColor: IOColors.bluegrey,
  textColorDark: IOColors.bluegreyDark,
  textLinkColor: IOColors.blue,
  textMessageDetailLinkColor: "#0073E6",
  textNormalWeight: "400" as FontWeight,
  textBoldWeight: "700" as FontWeight,
  textLinkWeight: "600" as FontWeight,

  // Skeleton/Placeholder
  colorSkeleton: IOColors.bluegreyLight,

  // Label
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

  borderRadiusBase: 4,

  // Tabs
  tabDefaultBg: "#FFFFFF",
  tabUnderlineColor: IOColors.greyUltraLight,
  tabUnderlineHeight: 2,
  topTabBarTextColor: IOColors.bluegrey,
  topTabBarActiveTextColor: IOColors.blue,

  // Animations
  activeOpacity: 0.25,

  // Spacing
  spacingBase: 8,

  // IconFont
  selectedColor: IOColors.blue,
  unselectedColor: IOColors.bluegrey,

  // Checkbox
  checkboxDefaultColor: "transparent"
});

export default customVariables;
