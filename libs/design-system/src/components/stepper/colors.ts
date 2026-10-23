import type {
  IOColorMode,
  IOColorSemantics,
  IOComponentColor
} from "../../core/tokens/colors/semantic";

import {
  type IOTokenColor,
  IOColorPalette as p
} from "../../core/tokens/colors/palette";

/* Inactive steps from the palette: no semantic token has grey 200 / grey 700 */
export const stepperColors = (s: IOColorSemantics, mode: IOColorMode) =>
  ({
    default: mode === "light" ? p.greyscale[200] : p.greyscale[700],
    active: s.foreground.accent
  }) satisfies {
    active: IOComponentColor<"foreground">;
    default: IOTokenColor;
  };
