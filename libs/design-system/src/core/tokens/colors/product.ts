/*
PRODUCT COLORS
Identity colors of the products the Design System shows itself (a product
icon, a component variant). One object per mode, beside the semantic tokens.
Colors of a single feature (bonus cards, credentials…) live in that feature.
*/

import { IOTokenColor, IOColorPalette as p } from "./palette";
import { IOColorScheme, Named } from "./semantic";
import { withAlpha } from "./utils";

export const light = {
  pagopa: { icon: p.blueItalia[500] },
  cgn: { surface: p.hanPurple[100], content: p.hanPurple[500] }
} as const satisfies Named<IOTokenColor>;

export type IOColorProducts = IOColorScheme<typeof light>;

export const dark = {
  pagopa: { icon: p.blueItalia[300] },
  cgn: {
    surface: withAlpha(p.hanPurple[250], 0.2),
    content: p.hanPurple[250]
  }
} as const satisfies IOColorProducts;
