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
  greyUltralight: "#FCFDFF",
  brandGray: "#F5F6F7" /* from variables.ts */,
  /* ALIAS TOKEN: tabUnderlineColor → brandGray */
  greyLight: "#E6E9F2",
  lightestGray: "#E0E3E6" /* from variables.ts */,
  headerIconLight: "#E4E7EA" /* from variables.ts, ALIAS TOKEN */,
  optCodeComponent: "#D9D9D9" /* from relative component */,
  lighterGray: "#C1C9D2" /* from variables.ts */,
  bluegreyLight: "#CCD4DC",
  /* ALIAS TOKEN: colorSkeleton → bluegreyLight */
  /* ALIAS TOKEN: itemSeparator → bluegreyLight */
  btnLightBorderColor: "#AEB5BF" /* from variables.ts, ALIAS TOKEN */,
  grey: "#909DA8",
  /* ALIAS TOKEN: disabledService → grey, not referenced by anything */
  headerIconDark: "#798593" /* from variables.ts, ALIAS TOKEN */,
  milderGray: "#5F6F80",
  bluegrey: "#475A6D",
  /* ALIAS TOKEN: textColor → bluegrey */
  /* ALIAS TOKEN: topTabBarTextColor → bluegrey */
  /* ALIAS TOKEN: unselectedColor → bluegrey */
  bluegreyDark: "#17324D",
  /* ALIAS TOKEN: textColorDark → bluegreyDark */
  /* ALIAS TOKEN: cardTextColor → bluegreyDark */
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
