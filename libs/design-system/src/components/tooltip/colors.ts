import type {
  IOColorSemantics,
  IOComponentColor
} from "../../core/tokens/colors/semantic";

import {
  type IOTokenColor,
  IOColorPalette as p
} from "../../core/tokens/colors/palette";

/* The backdrop is black from the palette, faded by the tooltip per mode */
export const tooltipColors = (s: IOColorSemantics) =>
  ({
    background: s.surface.secondary,
    backdrop: p.greyscale.black
  }) satisfies {
    backdrop: IOTokenColor;
    background: IOComponentColor<"background">;
  };
