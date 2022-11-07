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
  greyUltraLight: "#F5F6F7",
  /* ↳ ALIAS TOKEN: tabUnderlineColor → greyUltraLight */
  greyLight: "#E6E9F2",
  /* ↳ ALIAS TOKEN: headerIconLight → greyLight */
  bluegreyLight: "#CCD4DC",
  /* ↳ ALIAS TOKEN: colorSkeleton → bluegreyLight */
  /* ↳ ALIAS TOKEN: itemSeparator → bluegreyLight */
  grey: "#909DA8",
  /* ↳ ALIAS TOKEN: btnLightBorderColor → grey */
  /* ↳ ALIAS TOKEN: disabledService → grey, not referenced though */
  milderGray: "#5F6F80",
  /* ↳ ALIAS TOKEN: headerIconDark → milderGray */
  bluegrey: "#475A6D",
  /* ↳ ALIAS TOKEN: textColor → bluegrey */
  /* ↳ ALIAS TOKEN: topTabBarTextColor → bluegrey */
  /* ↳ ALIAS TOKEN: unselectedColor → bluegrey */
  bluegreyDark: "#17324D",
  /* ↳ ALIAS TOKEN: textColorDark → bluegreyDark */
  /* ↳ ALIAS TOKEN: cardTextColor → bluegreyDark */
  black: "#000000",
  /* ↳ ALIAS TOKEN: footerShadowColor → black */
  noCieButton:
    "#789CCD" /* Background of half-disabled noCIE CTA, from LandingScreen.tsx */,
  blue: "#0073E6",
  /* ↳ ALIAS TOKEN: topTabBarActiveTextColor → blue */
  /* ↳ ALIAS TOKEN: selectedColor → blue */
  /* ↳ ALIAS TOKEN: contentPrimaryBackground → blue */
  /* ↳ ALIAS TOKEN: textLinkColor → blue */
  blueUltraLight: "#99CCFF" /* Almost deprecated, avoid if possible */,
  aqua: "#00C5CA",
  /* ↳ ALIAS TOKEN: colorHighlight → aqua */
  aquaUltraLight: "#C1F4F2",
  /* ↳ ALIAS TOKEN: toastColor → aquaUltraLight */
  cobalt: "#2C489D" /* used in the `Bonus Vacanze` only */,
  antiqueFuchsia:
    "#9B5897" /* used in the CgnDiscountValueBox component only */,
  yellow: "#FFC824" /* Almost deprecated, used in `PaymentHistoryList` only */,
  orange: "#EA7614",
  red: "#C02927",
  /* ↳ ALIAS TOKEN: brandDanger → red */
  /* ↳ ALIAS TOKEN: calendarExpirableColor → red */
  green: "#005C3C"
  /* ↳ ALIAS TOKEN: brandSuccess → green */
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
