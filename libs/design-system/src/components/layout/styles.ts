import { BoxShadowValue } from "react-native";

import { IOColorPalette, withAlpha } from "../../core/tokens";

/** Shared footer `boxShadow` */
export const footerBoxShadow = {
  offsetX: 0,
  offsetY: 0,
  blurRadius: 32,
  color: withAlpha(IOColorPalette.greyscale.black, 0.1)
} satisfies BoxShadowValue;
