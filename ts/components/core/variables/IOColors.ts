import * as React from "react";
import { ComponentProps } from "react";
import { Appearance, ColorValue } from "react-native";
import LinearGradient from "react-native-linear-gradient"; // Used by `getGradientColorValues` function

/*
TYPESCRIPT FUNCTIONS
*/

// Ensure the Type for IOColor without losing the inferred types
function asIOColors<T extends { [key: string]: ColorValue }>(arg: T): T {
  return arg;
}

function asIOThemeColors<T extends { [key: string]: IOColors }>(arg: T): T {
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
  "grey-50": "#F4F5F8",
  "grey-100": "#E8EBF1",
  "grey-200": "#D2D6E3",
  "grey-300": "#BBC2D6",
  "grey-450": "#99A3C1",
  "grey-650": "#636B82",
  "grey-700": "#555C70",
  "grey-850": "#2B2E38",
  black: "#0E0F13",
  "blueIO-850": "#031344",
  "blueIO-600": "#0932B6",
  "blueIO-500": "#0B3EE3",
  "blueIO-450": "#2351E6" /* Dark mode */,
  "blueIO-200": "#9DB2F4",
  "blueIO-150": "#B6C5F7",
  "blueIO-100": "#CED8F9",
  "blueIO-50": "#E7ECFC",
  "turquoise-850": "#003B3D",
  "turquoise-500": "#00C5CA",
  "turquoise-450": "#19CBCF" /* Dark mode */,
  "turquoise-150": "#AAEEEF",
  "turquoise-100": "#C2F3F4",
  "turquoise-50": "#DBF9FA",
  "hanPurple-850": "#1A0744",
  "hanPurple-500": "#5517E3",
  "hanPurple-250": "#CCB9F7",
  "hanPurple-100": "#DDD1F9",
  "hanPurple-50": "#EEE8FC",
  "error-850": "#761F1F",
  "error-600": "#D75252",
  "error-500": "#FE6666",
  "error-400": "#FE8585" /* Dark mode */,
  "error-100": "#FFE0E0",
  "warning-850": "#614C15",
  "warning-700": "#A5822A",
  "warning-500": "#FFCB46",
  "warning-400": "#FFD56B" /* Dark mode */,
  "warning-100": "#FFF5DA",
  "success-850": "#224021",
  "success-700": "#427940",
  "success-500": "#6CC66A",
  "success-400": "#89D188" /* Dark mode */,
  "success-100": "#E1F4E1",
  "info-850": "#215C76",
  "info-700": "#418DAF",
  "info-500": "#6BCFFB",
  "info-400": "#89D9FC" /* Dark mode */,
  "info-100": "#E1F5FE",
  cobalt: "#2C489D" /* used in the `Bonus Vacanze` only */,
  "blueItalia-850": "#001F3D",
  "blueItalia-600": "#0052A3",
  "blueItalia-500": "#0066CC" /* pagoPA service */,
  "blueItalia-100": "#C4DCF5",
  "blueItalia-50": "#DDEBFA",
  /* Temporary scale based on legacy Blue */
  "blue-600": "#0353A3",
  "blue-50": "#EFF7FF",
  /* Legacy */
  greyUltraLight: "#F5F6F7",
  greyLight: "#E6E9F2",
  bluegreyLight: "#CCD4DC",
  grey: "#909DA8",
  milderGray: "#5F6F80",
  bluegrey: "#475A6D",
  bluegreyDark: "#17324D",
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
░░░ COLORS SETS ░░░
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
  black: IOColors.black,
  "grey-850": IOColors["grey-850"],
  "grey-700": IOColors["grey-700"],
  "grey-650": IOColors["grey-650"],
  "grey-450": IOColors["grey-450"],
  "grey-300": IOColors["grey-300"],
  "grey-200": IOColors["grey-200"],
  "grey-150": IOColors["grey-100"],
  "grey-50": IOColors["grey-50"],
  white: IOColors.white
});
export type IOColorsNeutral = keyof typeof IOColorsNeutral;

export const IOColorsTints = asIOColors({
  "blueIO-850": IOColors["blueIO-850"],
  "blueIO-600": IOColors["blueIO-600"],
  "blueIO-500": IOColors["blueIO-500"],
  "blueIO-450": IOColors["blueIO-450"],
  "blueIO-200": IOColors["blueIO-200"],
  "blueIO-150": IOColors["blueIO-150"],
  "blueIO-100": IOColors["blueIO-100"],
  "blueIO-50": IOColors["blueIO-50"],
  "turquoise-850": IOColors["turquoise-850"],
  "turquoise-500": IOColors["turquoise-500"],
  "turquoise-450": IOColors["turquoise-450"],
  "turquoise-150": IOColors["turquoise-150"],
  "turquoise-100": IOColors["turquoise-100"],
  "turquoise-50": IOColors["turquoise-50"]
});
export type IOColorsTints = keyof typeof IOColorsTints;

export const IOColorsStatus = asIOColors({
  "error-850": IOColors["error-850"],
  "error-600": IOColors["error-600"],
  "error-500": IOColors["error-500"],
  "error-400": IOColors["error-400"],
  "error-100": IOColors["error-100"],
  "warning-850": IOColors["warning-850"],
  "warning-700": IOColors["warning-700"],
  "warning-500": IOColors["warning-500"],
  "warning-400": IOColors["warning-400"],
  "warning-100": IOColors["warning-100"],
  "success-850": IOColors["success-850"],
  "success-700": IOColors["success-700"],
  "success-500": IOColors["success-500"],
  "success-400": IOColors["success-400"],
  "success-100": IOColors["success-100"],
  "info-850": IOColors["info-850"],
  "info-700": IOColors["info-700"],
  "info-500": IOColors["info-500"],
  "info-400": IOColors["info-400"],
  "info-100": IOColors["info-100"]
});

export type IOColorsStatus = keyof typeof IOColorsStatus;
export type IOColorsStatusForeground = Extract<
  IOColorsStatus,
  "error-850" | "warning-850" | "info-850" | "success-850"
>;
export type IOColorsStatusBackground = Extract<
  IOColorsStatus,
  "error-100" | "warning-100" | "info-100" | "success-100"
>;

export const IOColorsExtra = {
  cobalt: IOColors.cobalt,
  "blueItalia-850": IOColors["blueItalia-850"],
  "blueItalia-600": IOColors["blueItalia-600"],
  "blueItalia-500": IOColors["blueItalia-500"],
  "blueItalia-100": IOColors["blueItalia-100"],
  "blueItalia-50": IOColors["blueItalia-50"],
  "blue-600": IOColors["blue-600"],
  "blue-50": IOColors["blue-50"]
};
export type IOColorsExtra = keyof typeof IOColorsExtra;

/*
░░░ THEME COLORS ░░░
*/

export type IOTheme = {
  // General
  "appBackground-primary": IOColors;
  "appBackground-secondary": IOColors;
  "appBackground-tertiary": IOColors;
  "interactiveElem-default": IOColors;
  "interactiveElem-pressed": IOColors;
  "listItem-pressed": IOColors;
  // Typography
  "textHeading-default": IOColors;
  "textBody-default": IOColors;
  "textBody-secondary": IOColors;
  "textBody-tertiary": IOColors;
  // Design System related
  "cardBorder-default": IOColors;
  "icon-default": IOColors;
  // Layout
  "divider-default": IOColors;
  // Status
  errorIcon: IOColors;
  errorText: IOColors;
};

export const IOThemeLight: IOTheme = {
  // General
  "appBackground-primary": "white",
  "appBackground-secondary": "grey-50",
  "appBackground-tertiary": "grey-100",
  "interactiveElem-default": "blueIO-500",
  "interactiveElem-pressed": "blueIO-600",
  "listItem-pressed": "grey-50",
  // Typography
  "textHeading-default": "black",
  "textBody-default": "black",
  "textBody-secondary": "grey-850",
  "textBody-tertiary": "grey-700",
  // Design System related
  "cardBorder-default": "grey-100",
  "icon-default": "grey-650",
  // Layout
  "divider-default": "grey-100",
  // Status
  errorIcon: "error-500",
  errorText: "error-850"
};

export const IOThemeDark: IOTheme = {
  ...IOThemeLight,
  // General
  "appBackground-primary": "black",
  "appBackground-secondary": "grey-850",
  "appBackground-tertiary": "grey-700",
  "interactiveElem-default": "blueIO-450",
  "listItem-pressed": "grey-850",
  // Typography
  "textHeading-default": "grey-200",
  "textBody-default": "white",
  "textBody-secondary": "grey-100",
  "textBody-tertiary": "grey-450",
  // Design System related
  "cardBorder-default": "grey-850",
  "icon-default": "grey-450",
  // Layout
  "divider-default": "grey-850",
  // Status
  errorIcon: "error-400",
  errorText: "error-400"
};

export const themeStatusColorsLightMode = asIOThemeColors({
  errorMain: "error-500",
  errorBackground: "error-100",
  errorGraphics: "error-600",
  errorTypography: "error-850",
  warningMain: "warning-500",
  warningBackground: "warning-100",
  warningGraphics: "warning-700",
  warningTypography: "warning-850",
  successMain: "success-500",
  successBackground: "success-100",
  successGraphics: "success-700",
  successTypography: "success-850",
  infoMain: "info-500",
  infoBackground: "info-100",
  infoGraphics: "info-700",
  infoTypography: "info-850"
});

export type themeStatusColorsLightMode =
  keyof typeof themeStatusColorsLightMode;

export const themeStatusColorsDarkMode: Record<
  NonNullable<themeStatusColorsLightMode>,
  IOColorsStatus
> = {
  errorMain: "error-400",
  errorBackground: "error-100",
  errorGraphics: "error-600",
  errorTypography: "error-850",
  warningMain: "warning-400",
  warningBackground: "warning-100",
  warningGraphics: "warning-700",
  warningTypography: "warning-850",
  successMain: "success-400",
  successBackground: "success-100",
  successGraphics: "success-700",
  successTypography: "success-850",
  infoMain: "info-400",
  infoBackground: "info-100",
  infoGraphics: "info-700",
  infoTypography: "info-850"
};

export type themeStatusColorsDarkMode = keyof typeof themeStatusColorsDarkMode;

/*
THEME CONTEXT
*/
export const IOThemes = { light: IOThemeLight, dark: IOThemeDark };
export const IOThemeContext: React.Context<IOTheme> = React.createContext(
  Appearance.getColorScheme() === "dark" ? IOThemes.dark : IOThemes.light
);
export const useIOTheme = () => React.useContext(IOThemeContext);

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
