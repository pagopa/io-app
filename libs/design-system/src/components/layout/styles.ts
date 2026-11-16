import { BoxShadowValue } from "react-native";

import { light } from "../../core/tokens/colors/semantic";

/** Shared footer `boxShadow` */
export const footerBoxShadow = {
  offsetX: 0,
  offsetY: 0,
  blurRadius: 32,
  color: light.surface.shadow
} satisfies BoxShadowValue;
