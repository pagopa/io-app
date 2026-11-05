import type {
  IOColorSemantics,
  IOComponentColor,
  Named
} from "../../core/tokens/colors/semantic";

import {
  type IOTokenColor,
  IOColorPalette as p
} from "../../core/tokens/colors/palette";
import { withAlpha } from "../../core/tokens/colors/utils";

/* A white tile with a black 10% border in both modes: logos are drawn for it */
export const avatarColors = (s: IOColorSemantics) =>
  ({
    background: { logo: p.greyscale.white, placeholder: p.greyscale[50] },
    border: withAlpha(p.greyscale.black, 0.1),
    icon: s.icon.decorative
  }) satisfies {
    background: Named<IOTokenColor>;
    border: IOTokenColor;
    icon: IOComponentColor<"foreground">;
  };
