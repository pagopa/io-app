import { ColorValue } from "react-native";

// Ensure the Type for IOColor without losing the inferred types
function asIOColors<T extends { [key: string]: ColorValue }>(arg: T): T {
  return arg;
}

export const IOColors = asIOColors({
  black: "#000000",
  white: "#FFFFFF",
  bluegreyDark: "#17324D",
  bluegrey: "#475A6D",
  grey: "#909DA8",
  bluegreyLight: "#CCD4DC",
  greyLight: "#E6E9F2",
  greyUltralight: "#FCFDFF",
  blue: "#0073E6",
  aqua: "#00C5CA",
  red: "#C02927",
  orange: "#EA7614",
  greyGradientTop: "#475A6D",
  greyGradientBottom: "#42484F",
  yellowGradientTop: "#FEC709",
  yellowGradientBottom: "#FAA01F"
});

export type IOColorType = keyof typeof IOColors;
