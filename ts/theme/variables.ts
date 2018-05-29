/**
 * This file imports all the variables defined inside the native-base material
 * theme than overwrites or add more variables. The combined variables are
 * exported to be used in our components theme files (check `./components`
 * directory).
 */

// tslint:disable:no-invalid-this

import materialVariables from "native-base/src/theme/variables/material";
import { Platform } from "react-native";

import { FontWeight, makeFontStyleObject } from "./fonts";
import { ThemeSimpleValue } from "./types";

// tslint:disable-next-line
const customVariables = Object.assign(materialVariables, {
  // Android
  btnUppercaseAndroidText: false,

  // Button
  btnTextFontWeight: "700" as FontWeight,
  btnHeight: 48,
  btnFontSize: 16,
  btnSmallHeight: 39,
  btnSmallFontSize: 16,
  get btnLightTextColor(): ThemeSimpleValue {
    return this.textColor;
  },
  btnLightBorderColor: "#E6E9F2",

  // Color
  brandPrimary: "#0066CC",
  brandPrimaryInverted: "#FFFFFF",
  brandGray: "#F5F6F7",
  brandLight: "#FCFDFF",
  brandSuccess: "#007005",
  brandDanger: "#CC3333",
  brandLightGray: "#E6E9F2",
  brandDarkGray: "#5C6F82",

  cardFontColor: "#17324D",
  colorWhite: "white",

  // Font
  ...makeFontStyleObject(Platform.select),
  fontSizeBase: 16,
  get fontSize1(): number {
    return this.fontSizeBase * 0.75;
  },
  get fontSize2(): number {
    return this.fontSizeBase * 0.875;
  },
  get fontSize3(): number {
    return this.fontSizeBase * 1;
  },
  get fontSize4(): number {
    return this.fontSizeBase * 1.125;
  },
  get fontSize5(): number {
    return this.fontSizeBase * 1.5;
  },
  get fontSize6(): number {
    return this.fontSizeBase * 1.75;
  },
  lineHeight: 24,

  // Icon
  iconFamily: "Entypo",

  // Content
  contentPadding: 24,
  contentBackground: "#FFFFFF",
  contentAlternativeBackground: "#F5F6F7",

  // Footer
  footerBackground: "#FFFFFF",
  footerElevation: 50,
  footerPaddingTop: 24,
  footerPaddingLeft: 24,
  footerPaddingBottom: 16,
  footerPaddingRight: 24,
  footerShadowColor: "#000000",
  footerShadowOffsetWidth: 0,
  footerShadowOffsetHeight: 50,
  footerShadowOpacity: 0.3,
  footerShadowRadius: 50,

  // Grid
  gridGutter: 10,

  // H1
  h1Color: "#17324D",
  h1FontWeight: "700" as FontWeight,

  // H3
  h3Color: "#17324D",
  h3FontWeight: "600" as FontWeight,

  // Header
  headerPaddingHorizontal: 24,
  headerBorderBottomWidth: 0,
  headerBodyFontSize: 14,
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
  textColor: "#5C6F82",
  textLinkColor: "#0063CF",
  textBoldWeight: "700" as FontWeight,
  textLinkWeight: "600" as FontWeight,

  // Spacer
  spacerHeight: 16,
  spacerLargeHeight: 24,
  spacerExtralargeHeight: 40,

  borderRadiusBase: 4
});

export default customVariables;
