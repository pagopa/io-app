import { ColorValue } from "react-native";

/* Used by `getGradientColorValues` function */
import LinearGradient from "react-native-linear-gradient";
import { ComponentProps } from "react";

// Ensure the Type for IOColor without losing the inferred types
function asIOColors<T extends { [key: string]: ColorValue }>(arg: T): T {
  return arg;
}

function asIOColorGradients<T extends { [key: string]: Array<ColorValue> }>(
  arg: T
): T {
  return arg;
}
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
  blueDark: "#031344",
  blueLight: "#B6C5F7",
  blue50: "#E7ECFC",
  blue100: "#CED8F9",
  blue200: "#9DB2F4",
  blue600: "#0932B6",
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
  /* LEGACY */
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

export const getGradientColorValues = (
  gradientId: IOColorGradientType
): ComponentProps<typeof LinearGradient>["colors"] => {
  const [first, second]: Array<ColorValue> = IOColorGradients[gradientId];
  return [first, second];
};

export type IOColorType = keyof typeof IOColors;
export type IOColorGradientType = keyof typeof IOColorGradients;

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

const {
  grey50,
  grey100,
  grey200,
  grey450,
  grey650,
  grey700,
  grey850,
  blackNew
} = IOColors;

export const IOColorsNeutral = {
  white,
  grey50,
  grey100,
  grey200,
  grey450,
  grey650,
  grey700,
  grey850,
  blackNew
};
export type IOColorsNeutral = keyof typeof IOColorsNeutral;

const {
  blueNew,
  blueDark,
  blueLight,
  blue50,
  blue100,
  blue600,
  turquoise,
  turquoiseDark,
  turquoiseLight,
  turquoise100,
  turquoise50
} = IOColors;

export const IOColorsTints = {
  blueDark,
  blue600,
  blueNew,
  blueLight,
  blue100,
  blue50,
  turquoiseDark,
  turquoise,
  turquoiseLight,
  turquoise100,
  turquoise50
};
export type IOColorsTints = keyof typeof IOColorsTints;

const {
  error,
  errorGraphic,
  errorDark,
  errorLight,
  warning,
  warningGraphic,
  warningDark,
  warningLight,
  success,
  successGraphic,
  successDark,
  successLight,
  info,
  infoGraphic,
  infoDark,
  infoLight
} = IOColors;

export const IOColorsStatus = {
  errorDark,
  errorGraphic,
  error,
  errorLight,
  warningDark,
  warningGraphic,
  warning,
  warningLight,
  successDark,
  successGraphic,
  success,
  successLight,
  infoDark,
  infoGraphic,
  info,
  infoLight
};
export type IOColorsStatus = keyof typeof IOColorsStatus;
export type IOColorsStatusForeground = Extract<
  IOColorsStatus,
  "errorDark" | "warningDark" | "infoDark" | "successDark"
>;
export type IOColorsStatusBackground = Extract<
  IOColorsStatus,
  "errorLight" | "warningLight" | "infoLight" | "successLight"
>;

const { blueItalia } = IOColors;

export const IOColorsExtra = {
  cobalt,
  blueItalia
};
export type IOColorsExtra = keyof typeof IOColorsExtra;

/*
REFERENCES
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
