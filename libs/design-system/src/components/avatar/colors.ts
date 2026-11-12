import type {
  IOColorSemantics,
  IOComponentColor,
  Named
} from "../../core/tokens/colors/semantic";

import {
  type IOTokenColor,
  IOColorPalette as p
} from "../../core/tokens/colors/palette";

/* Tiles and placeholder icon are the same in both modes: logos are drawn for a white tile */
export const avatarColors = (s: IOColorSemantics) =>
  ({
    background: { logo: p.greyscale.white, placeholder: p.greyscale[50] },
    border: s.stroke.default,
    icon: p.greyscale[300]
  }) satisfies {
    background: Named<IOTokenColor>;
    border: IOComponentColor<"stroke">;
    icon: IOTokenColor;
  };
