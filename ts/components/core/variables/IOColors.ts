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
  greyLight: "#E6E9F2",
  bluegreyLight: "#CCD4DC",
  grey: "#909DA8",
  bluegrey: "#475A6D",
  bluegreyDark: "#17324D",
  black: "#000000",
  blue: "#0073E6",
  aqua: "#00C5CA",
  red: "#C02927",
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
