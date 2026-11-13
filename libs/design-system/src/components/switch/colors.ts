import type {
  IOColorSemantics,
  IOComponentColor
} from "../../core/tokens/colors/semantic";

import {
  type IOTokenColor,
  IOColorPalette as p
} from "../../core/tokens/colors/palette";

/* Off track: the grey of `stroke.input`, at least 3:1 in both modes; the native thumb is white in both modes */
export const switchColors = (s: IOColorSemantics) =>
  ({
    track: { off: p.greyscale[650], on: s.surface.action.primary.default },
    thumb: p.greyscale.white
  }) satisfies {
    thumb: IOTokenColor;
    track: { off: IOTokenColor; on: IOComponentColor<"background"> };
  };
