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
  colorWhiteRGB: `rgb(255, 255, 255)` /* from various JEST tests */,
  greyUltralight: "#FCFDFF",
  brandGray: "#F5F6F7" /* from variables.ts */,
  /* ALIAS TOKEN: tabUnderlineColor -> brandGray */
  greyLight: "#E6E9F2",
  lightestGray: "#E0E3E6" /* from variables.ts */,
  headerIconLight: "#E4E7EA" /* from variables.ts, ALIAS TOKEN */,
  optCodeComponent: "#D9D9D9" /* from relative component */,
  borderColor: `rgb(216, 216, 216)` /* found in various JEST tests, similar to optCodeComponent */,
  lighterGray: "#C1C9D2" /* from variables.ts */,
  bluegreyLight: "#CCD4DC",
  brandMildGray: "#C7D1D9" /* from variables.ts */,
  shineColor:
    "#C1CCD6" /* from variables.ts, similar to brandMildGray, Animation ALIAS TOKEN */,
  itemSeparator: "#C9C9C9" /* from variables.ts, ALIAS TOKEN */,
  listSelectionBarColor: "#A9A9A9" /* from relative JEST snap test */,
  btnLightBorderColor: "#AEB5BF" /* from variables.ts, ALIAS TOKEN */,
  grey: "#909DA8",
  /* ALIAS TOKEN: disabledService -> grey, not referenced by anything */
  headerIconDark: "#798593" /* from variables.ts, ALIAS TOKEN */,
  itemBorderDefaultColor:
    "#5F6F82" /* from variables.ts, similar to milderGray, ALIAS TOKEN */,
  milderGray: "#5F6F80" /* from variables.ts */,
  darkerGray: "#4B5C6F" /* from variables.ts */,
  bluegrey: "#475A6D",
  brandDarkGray: "#475A6D" /* from variables.ts, duplicate of bluegrey */,
  textColor:
    "#475A6D" /* from variables.ts, duplicate of bluegrey, ALIAS TOKEN */,
  topTabBarTextColor:
    "#475A6D" /* from variables.ts, duplicate of bluegrey, ALIAS TOKEN */,
  unselectedColor:
    "#475A6D" /* from variables.ts, duplicate of bluegrey, ALIAS TOKEN */,
  bluegreyDark: "#17324D",
  brandDarkestGray:
    "#17324D" /* from variables.ts, duplicate of bluegreyDark */,
  cardFontColor:
    "#17324D" /* from variables.ts, duplicate of bluegreyDark and brandDarkestGray, ALIAS TOKEN */,
  textColorDark: `rgb(28, 28, 30)` /* found in various JEST tests */,
  black: "#000000",
  colorBlack: "#000000" /* from variables.ts, duplicate of black */,
  footerShadowColor:
    "#000000" /* from variables.ts, duplicate of black, ALIAS TOKEN */,
  brandPrimary: "#0066CC" /* from variables.ts */,
  topTabBarActiveTextColor:
    "#0066CC" /* from variables.ts, duplicate of brandPrimary, ALIAS TOKEN */,
  blue: "#0073E6",
  selectedColor:
    "#0073E6" /* from variables.ts, duplicate of blue, ALIAS TOKEN */,
  contentPrimaryBackground:
    "#0073E6" /* from variables.ts, duplicate of blue, ALIAS TOKEN */,
  ListSelectionBarColor: "#007AFF" /* from ListSelectionBar JEST test */,
  textLinkColor:
    "#0073E6" /* from variables.ts, duplicate of blue, ALIAS TOKEN */,
  checkBoxColor: "#039BE5" /* from CheckBox component */,
  brandPrimaryLight: "#99CCFF" /* from variables.ts */,
  noCieButton:
    "#789CCD" /* Background of half-disabled noCIE CTA, from LandingScreen.tsx */,
  featuredCardShadow: "#00274E" /* from FeaturedCard component */,
  activeBonus: "#2C489D" /* from relative component (BonusVacanze) */,
  cgnDiscount: "#9B5897" /* from CgnDiscountValueBox */,
  aqua: "#00C5CA",
  brandHighlight: "#00C5CA" /* from variables.ts, duplicate of aqua */,
  brandHighLighter: "#00CDD2" /* from variables.ts */,
  toastColor: "#C1F4F2" /* from variables.ts, ALIAS TOKEN */,
  badgeYellow: "#FFC824" /* from variables.ts, ALIAS TOKEN */,
  cgnDiscountDetailBg: "#EB9505" /* from relative component */,
  cardExpiredTextColor: "#FF0000" /* from variables.ts, ALIAS TOKEN */,
  calendarExpirableColor: "#D0021B" /* from variables.ts, ALIAS TOKEN */,
  itemTest: "#ED1727" /* from relative JEST snap test */,
  red: "#C02927",
  brandDanger: "#CC3333" /* from variables.ts */,
  brandSuccess: "#007005" /* from variables.ts */,
  orange: "#EA7614",
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
