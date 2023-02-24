import type { ColorValue } from "react-native";
import LinearGradient from "react-native-linear-gradient"; // Used by `getGradientColorValues` function
import { ComponentProps } from "react";

/*
TYPESCRIPT FUNCTIONS
*/

// Ensure the Type for IOColor without losing the inferred types
function asIOColors<T extends { [key: string]: ColorValue }>(arg: T): T {
  return arg;
}

function asIOColorGradients<T extends { [key: string]: Array<ColorValue> }>(
  arg: T
): T {
  return arg;
}

/*
ENTIRE COLOR SCALE
*/

export const IOColors = asIOColors({
  white: "#FFFFFF",
  grey50: "#F4F5F8",
  grey100: "#E8EBF1",
  grey200: "#D2D6E3",
  grey450: "#99A3C1",
  grey650: "#636B82",
  grey700: "#555C70",
  grey850: "#2B2E38",
  blackNew: "#0E0F13",
  blueNew: "#0B3EE3",
  blueNewDark: "#031344",
  blueNewLight: "#B6C5F7",
  blueNew50: "#E7ECFC",
  blueNew100: "#CED8F9",
  blueNew200: "#9DB2F4",
  blueNew600: "#0932B6",
  turquoise: "#00C5CA",
  turquoiseDark: "#003B3D",
  turquoiseLight: "#AAEEEF",
  turquoise50: "#DBF9FA",
  turquoise100: "#C2F3F4",
  error: "#FE6666",
  errorGraphic: "#D75252",
  errorDark: "#761F1F",
  errorLight: "#FFD1D1",
  warning: "#FFC824",
  warningGraphic: "#A5822A",
  warningDark: "#614C15",
  warningLight: "#FFF5DA",
  success: "#6CC66A",
  successGraphic: "#427940",
  successDark: "#224021",
  successLight: "#D3EED2",
  info: "#6BCFFB",
  infoGraphic: "#418DAF",
  infoDark: "#215C76",
  infoLight: "#E1F5FE",
  cobalt: "#2C489D" /* used in the `Bonus Vacanze` only */,
  blueItalia: "#0066CC" /* pagoPA service */,
  /* Temporary */
  blue600: "#0353A3",
  blue50: "#EFF7FF",
  /* Legacy */
  greyUltraLight: "#F5F6F7",
  greyLight: "#E6E9F2",
  bluegreyLight: "#CCD4DC",
  grey: "#909DA8",
  milderGray: "#5F6F80",
  bluegrey: "#475A6D",
  bluegreyDark: "#17324D",
  black: "#000000",
  noCieButton: "#789CCD" /* Half-disabled noCIE CTA BG, LandingScreen.tsx */,
  blue: "#0073E6",
  blueUltraLight: "#99CCFF" /* Almost deprecated, avoid if possible */,
  aqua: "#00C5CA",
  aquaUltraLight: "#C1F4F2",
  antiqueFuchsia: "#9B5897" /* used in the CgnDiscountValueBox only */,
  yellow: "#FFC824" /* Almost deprecated, used in `PaymentHistoryList` only */,
  orange: "#EA7614",
  red: "#C02927",
  green: "#005C3C",
  greenLight: "#5CA85A"
});

export type IOColors = keyof typeof IOColors;

// Dark Mode Palette
export const IOColorsDark: Record<NonNullable<IOColors>, ColorValue> = {
  /* Add original IOColors to allow overwriting
  of specific color values */
  ...IOColors,
  blackNew: "#0E0F13",
  grey50: "#2B2E38",
  grey100: "#555C70",
  grey200: "#636B82",
  grey450: "#99A3C1",
  grey650: "#D2D6E3",
  grey700: "#E8EBF1",
  grey850: "#F4F5F8",
  white: "#FFFFFF",
  blueNew: "#2351E6",
  turquoise: "#19CBCF",
  warning: "#FFD059",
  warningLight: "#FFEFC7",
  error: "#FE7575",
  success: "#7BCC79",
  info: "#7AD4FB"
};

export type IOColorsDark = keyof typeof IOColorsDark;

export const IOColorGradients = asIOColorGradients({
  appLaunch: ["#0C00D3", "#0073E6"],
  appIcon: ["#1D51DF", "#1723D5"],
  grey: ["#475A6D", "#42484F"],
  cgnAll: ["#475A6D", "#E6E9F2"],
  cgn: ["#9184B7", "#5C488F"],
  cgnFinance: ["#3E2F87", "#8FDBC0"],
  cgnCulture: ["#C51C82", "#E28DC0"],
  cgnLearning: ["#0871B6", "#AE97C3"],
  cgnHealth: ["#F1901A", "#EE898A"],
  cgnHome: ["#DC1415", "#F8C78C"],
  cgnJobOffers: ["#DC1415", "#EE898A"],
  cgnSport: ["#1D827D", "#83B8DA"],
  cgnMobility: ["#1D827D", "#8FC7C5"],
  cgnTelco: ["#0871B6", "#83B8DA"],
  cgnTravel: ["#E00F69", "#F8C78C"]
});

export type IOColorGradients = keyof typeof IOColorGradients;

export const getGradientColorValues = (
  gradientId: IOColorGradients
): ComponentProps<typeof LinearGradient>["colors"] => {
  const [first, second]: Array<ColorValue> = IOColorGradients[gradientId];
  return [first, second];
};

/*
COLOR SETS
*/

const {
  white,
  greyUltraLight,
  greyLight,
  bluegreyLight,
  grey,
  milderGray,
  bluegrey,
  bluegreyDark,
  black,
  noCieButton,
  blue,
  blueUltraLight,
  aqua,
  aquaUltraLight,
  cobalt,
  antiqueFuchsia,
  yellow,
  orange,
  red,
  green,
  greenLight
} = IOColors;

export const IOColorsLegacy = {
  white,
  greyUltraLight,
  greyLight,
  bluegreyLight,
  grey,
  milderGray,
  bluegrey,
  bluegreyDark,
  black,
  noCieButton,
  blue,
  blueUltraLight,
  aqua,
  aquaUltraLight,
  cobalt,
  antiqueFuchsia,
  yellow,
  orange,
  red,
  green,
  greenLight
};
export type IOColorLegacy = keyof typeof IOColorsLegacy;

export const IOColorsNeutral = asIOColors({
  white: IOColors.white,
  grey50: IOColors.grey50,
  grey100: IOColors.grey100,
  grey200: IOColors.grey200,
  grey450: IOColors.grey450,
  grey650: IOColors.grey650,
  grey700: IOColors.grey700,
  grey850: IOColors.grey850,
  blackNew: IOColors.blackNew
});
export type IOColorsNeutral = keyof typeof IOColorsNeutral;

export const IOColorsNeutralDark: Record<
  NonNullable<IOColorsNeutral>,
  ColorValue
> = {
  blackNew: IOColorsDark.blackNew,
  grey50: IOColorsDark.grey50,
  grey100: IOColorsDark.grey100,
  grey200: IOColorsDark.grey200,
  grey450: IOColorsDark.grey450,
  grey650: IOColorsDark.grey650,
  grey700: IOColorsDark.grey700,
  grey850: IOColorsDark.grey850,
  white: IOColors.white
};

export type IOColorsNeutralDark = keyof typeof IOColorsNeutralDark;

export const IOColorsTints = asIOColors({
  blueNewDark: IOColors.blueNewDark,
  blueNew600: IOColors.blueNew600,
  blueNew: IOColors.blueNew,
  blueNew200: IOColors.blueNew200,
  blueNewLight: IOColors.blueNewLight,
  blueNew100: IOColors.blueNew100,
  blueNew50: IOColors.blueNew50,
  turquoiseDark: IOColors.turquoiseDark,
  turquoise: IOColors.turquoise,
  turquoiseLight: IOColors.turquoiseLight,
  turquoise100: IOColors.turquoise100,
  turquoise50: IOColors.turquoise50
});
export type IOColorsTints = keyof typeof IOColorsTints;

export const IOColorsTintsDark: Record<
  NonNullable<IOColorsTints>,
  ColorValue
> = {
  blueNewDark: IOColorsDark.blueNewDark,
  blueNew600: IOColorsDark.blueNew600,
  blueNew: IOColorsDark.blueNew,
  blueNew200: IOColorsDark.blueNew200,
  blueNewLight: IOColorsDark.blueNewLight,
  blueNew100: IOColorsDark.blueNew100,
  blueNew50: IOColorsDark.blueNew50,
  turquoiseDark: IOColorsDark.turquoiseDark,
  turquoise: IOColorsDark.turquoise,
  turquoiseLight: IOColorsDark.turquoiseLight,
  turquoise100: IOColorsDark.turquoise100,
  turquoise50: IOColorsDark.turquoise50
};

export type IOColorsTintsDark = keyof typeof IOColorsTintsDark;

export const IOColorsStatus = asIOColors({
  errorDark: IOColors.errorDark,
  errorGraphic: IOColors.errorGraphic,
  error: IOColors.error,
  errorLight: IOColors.errorLight,
  warningDark: IOColors.warningDark,
  warningGraphic: IOColors.warningGraphic,
  warning: IOColors.warning,
  warningLight: IOColors.warningLight,
  successDark: IOColors.successDark,
  successGraphic: IOColors.successGraphic,
  success: IOColors.success,
  successLight: IOColors.successLight,
  infoDark: IOColors.infoDark,
  infoGraphic: IOColors.infoGraphic,
  info: IOColors.info,
  infoLight: IOColors.infoLight
});
export type IOColorsStatus = keyof typeof IOColorsStatus;
export type IOColorsStatusForeground = Extract<
  IOColorsStatus,
  "errorDark" | "warningDark" | "infoDark" | "successDark"
>;
export type IOColorsStatusBackground = Extract<
  IOColorsStatus,
  "errorLight" | "warningLight" | "infoLight" | "successLight"
>;

export const IOColorsStatusDark: Record<
  NonNullable<IOColorsStatus>,
  ColorValue
> = {
  errorDark: IOColorsDark.errorDark,
  errorGraphic: IOColorsDark.errorGraphic,
  error: IOColorsDark.error,
  errorLight: IOColorsDark.errorLight,
  warningDark: IOColorsDark.warningDark,
  warningGraphic: IOColorsDark.warningGraphic,
  warning: IOColorsDark.warning,
  warningLight: IOColorsDark.warningLight,
  successDark: IOColorsDark.successDark,
  successGraphic: IOColorsDark.successGraphic,
  success: IOColorsDark.success,
  successLight: IOColorsDark.successLight,
  infoDark: IOColorsDark.infoDark,
  infoGraphic: IOColorsDark.infoGraphic,
  info: IOColorsDark.info,
  infoLight: IOColorsDark.infoLight
};

export type IOColorsStatusDark = keyof typeof IOColorsStatusDark;

const { blueItalia, blue50, blue600 } = IOColors;

export const IOColorsExtra = {
  cobalt,
  blueItalia,
  blue50,
  blue600
};
export type IOColorsExtra = keyof typeof IOColorsExtra;

/*
UTILS
*/

/**
Return the color value with RGBA format (RGB + Alpha transparency), starting from the hexadecimal color value only.
@param hexCode Color value in hexadecimal format. No short version accepted.
@param opacity Opacity value that range from 0 to 1. Default value = 1.
 */
/* Taken from this Gist: https://gist.github.com/danieliser/b4b24c9f772066bcf0a6 */
export const hexToRgba = (hexCode: string, opacity: number = 1) => {
  const hex = hexCode.replace("#", "");

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r},${g},${b},${opacity})`;
};

/*
REFACTORING REFERENCES
Alias tokens:
*/
/* 
tabUnderlineColor → greyUltraLight
headerIconLight → greyLight
colorSkeleton → bluegreyLight
itemSeparator → bluegreyLight
btnLightBorderColor → grey
disabledService → grey, not referenced though
headerIconDark → milderGray
textColor → bluegrey
topTabBarTextColor → bluegrey
unselectedColor → bluegrey
textColorDark → bluegreyDark
cardTextColor → bluegreyDark
footerShadowColor → black
topTabBarActiveTextColor → blue
selectedColor → blue
contentPrimaryBackground → blue
textLinkColor → blue
colorHighlight → aqua
toastColor → aquaUltraLight
brandDanger → red
calendarExpirableColor → red
brandSuccess → green
*/

/* NEW PALETTE → OLD PALETTE
That is, which color replaces the other? */
/*
`blackNew` replaces `black`
`grey50` → `greyUltraLight`
`grey100` → `greyLight`
`grey200` → `blueGreyLight`
`grey450` → `grey`
`grey650` → `milderGrey`
`grey700` → `bluegrey`
`grey850` → `bluegreyDark`
`blueNew` → `blue`
`turquoise` → `aqua`
`turquoiseLight` → `aquaUltraLight`
`warning` → `yellow`
`error` → `red`
`success` → `green`
*/
