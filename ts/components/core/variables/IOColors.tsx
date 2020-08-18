import { ColorValue } from "react-native";

// Ensure the Type for IOColor without losing the inferred types
function asIOColor<T extends { [key: string]: ColorValue }>(arg: T): T {
  return arg;
}

/**
 * The palette of color used, created from
 * https://pagopa.invisionapp.com/console/IO-app---Library-ckcdil0710mt1014buxuo4u34/ckcdilqwl032d01xbx6db5zwz/play
 */
export const IOColors = asIOColor({
  black: "#000000",
  white: "#FFFFFF",
  bluegreyDark: "#17324D",
  bluegrey: "#5C6F82",
  bluegreyLight: "#CCD4DC",
  greyLight: "#E6E9F2",
  greyUltralight: "#FCFDFF",
  blue: "#0073E6",
  aqua: "#00C5CA",
  red: "#C02927",
  greyGradientTop: "#5C6F82",
  greyGradientBottom: "#42484F"
});
