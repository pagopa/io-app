import { ColorValue } from "react-native";

// Ensure the Type for IOColor without losing the inferred types
function asIOColors<T extends { [key: string]: ColorValue }>(arg: T): T {
  return arg;
}

function asIOColorGradients<T extends { [key: string]: Array<ColorValue> }>(
  arg: T
): T {
  return arg;
}

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
  blueDark: "#0066CC",
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
  cardExpiredTextColor: "#FF0000" /* from variables.ts, ALIAS TOKEN */,
  calendarExpirableColor: "#D0021B" /* from variables.ts, ALIAS TOKEN */,
  red: "#C02927",
  brandDanger: "#CC3333" /* from variables.ts */,
  green: "#007005" /* from variables.ts */,
  noCieButton:
    "#789CCD" /* Background of half-disabled noCIE CTA, from LandingScreen.tsx */,
  greyGradientTop: "#475A6D",
  greyGradientBottom: "#42484F",
  yellowGradientTop: "#FEC709",
  yellowGradientBottom: "#FAA01F"
});

export const IOColorGradients = asIOColorGradients({
  appLaunch: ["#0C00D3", "#0073E6"],
  appIcon: ["#1D51DF", "#1723D5"],
  grey: ["#475A6D", "#42484F"],
  yellow: ["#FEC709", "#FAA01F"],
  cgn: ["#9184B7", "#5C488F"],
  cgnCulture: ["#C51C82", "#E28DC0"],
  cgnHealth: ["#F1901A", "#EE898A"],
  cgnLearning: ["#0871B6", "#AE97C3"],
  cgnSport: ["#DC1415", "#F8C78C"],
  cgnTelco: ["#0871B6", "#83B8DA"],
  cgnFinance: ["#3E2F87", "#8FDBC0"],
  cgnTravel: ["#E00F69", "#F8C78C"],
  cgnMobility: ["#1D827D", "#8FC7C5"],
  cgnJobOffers: ["#DC1415", "#EE898A"]
});

export type IOColorType = keyof typeof IOColors;
