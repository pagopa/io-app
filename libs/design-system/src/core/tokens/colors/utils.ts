import type { ColorValue } from "react-native";

import {
  IOColorRole,
  IOColorValue,
  IOHexColors,
  IOOpacity,
  IORoleColor,
  IOTaggedColors,
  IOTranslucentColor
} from "./palette";

/* Tags every color of an object with where it was declared */
export const tagColors =
  <C extends IOColorValue>() =>
  <const T extends IOHexColors>(colors: T) =>
    colors as unknown as IOTaggedColors<T, C>;

/**
 * Sets the alpha channel of a color, as `rgba(r,g,b,a)`. Accepts a hex or an
 * `rgba()` color: an existing alpha is replaced, not multiplied. A token color
 * with an alpha from `IOOpacity.scale` returns a token color (a semantic one
 * keeps its role); anything else returns a plain string (legacy `hexToRgba`
 * calls).
 */
export function withAlpha<R extends IOColorRole>(
  color: IORoleColor<R>,
  opacity: IOOpacity
): IORoleColor<R>;
export function withAlpha(
  color: IOColorValue,
  opacity: IOOpacity
): IOTranslucentColor;
export function withAlpha(color: ColorValue, opacity?: number): string;
export function withAlpha(color: ColorValue, opacity = 1) {
  const value = color.toString();
  const [r, g, b] = value.startsWith("rgb")
    ? value
        .slice(value.indexOf("(") + 1, -1)
        .split(",")
        .map(Number)
    : [0, 2, 4].map(i =>
        parseInt(value.replace("#", "").substring(i, i + 2), 16)
      );
  return `rgba(${r},${g},${b},${opacity})`;
}
