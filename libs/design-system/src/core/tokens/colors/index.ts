/*
COLOR TOKENS
Three tiers, as in `IODimensions`:
- Palette: `IOColorPalette`, the hue ramps (see `palette.ts`)
- Semantic: one object per mode, from the Figma `Semantics` collection
  (see `semantic.ts`). Beside it, the product colors (see `product.ts`)
- Component: each component declares its colors in its own `colors.ts`, by
  variant, role (`background`, `foreground`, `border`) and state. A reference
  to a semantic token follows a design choice shared with other components; a
  palette value is a deliberate exception

Component configs import only `palette.ts`, `semantic.ts`, `product.ts` and
`utils.ts`:
importing this file or the theme context would create a cycle.
*/

import { alertColors } from "../../../components/alert/colors";
import { badgeColors } from "../../../components/badge/colors";
import { buttonColors } from "../../../components/buttons/IOButton/colors";
import {
  IOColorProducts,
  dark as productDark,
  light as productLight
} from "./product";
import { dark, IOColorMode, IOColorSemantics, light } from "./semantic";

export * from "./palette";
export type { IOColorProducts } from "./product";
export type {
  IOColorMode,
  IOColorSemantics,
  IOColorStates,
  IOComponentColor,
  IOComponentColors
} from "./semantic";
export { withAlpha } from "./utils";

const theme = (
  s: IOColorSemantics,
  product: IOColorProducts,
  mode: IOColorMode
) => ({
  ...s,
  product,
  component: {
    alert: alertColors(s),
    badge: badgeColors(s, product),
    button: buttonColors(s, mode)
  }
});

export type IOColorTheme = ReturnType<typeof theme>;

/**
 * Color tokens of each mode: the Figma semantic tokens, plus the product colors
 * under `product` and the component colors under `component`.
 */
export const IOColors: Record<IOColorMode, IOColorTheme> = {
  light: theme(light, productLight, "light"),
  dark: theme(dark, productDark, "dark")
};
