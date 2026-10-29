import type {
  IOColorMode,
  IOColorSemantics,
  IOComponentColor
} from "../../core/tokens/colors/semantic";
import type { TabItem } from "./TabItem";

import {
  type IOTokenColor,
  IOColorPalette as p
} from "../../core/tokens/colors/palette";
import { withAlpha } from "../../core/tokens/colors/utils";

type TabItemColors = {
  background: Record<"default" | "selected", IOComponentColor<"background">>;
  border?: { default: IOTokenColor; selected: IOComponentColor<"stroke"> };
  foreground: Record<"default" | "disabled", IOComponentColor<"foreground">> & {
    selected: IOTokenColor;
  };
};

/* Keyed by `color`. Fills and the selected border are the ink hue faded; `primary` follows the mode, and dark mode needs stronger alphas to match the legacy contrast */
export const tabItemColors = (s: IOColorSemantics, mode: IOColorMode) => {
  const isDark = mode === "dark";
  return {
    primary: {
      background: {
        default: withAlpha(s.surface.action.primary.default, 0),
        selected: withAlpha(
          s.surface.action.primary.default,
          isDark ? 0.2 : 0.1
        )
      },
      border: {
        /* From the palette: no stroke token is grey 300 / grey 700 */
        default: isDark ? p.greyscale[700] : p.greyscale[300],
        selected: withAlpha(s.stroke.focused, isDark ? 0.6 : 0.5)
      },
      foreground: {
        default: s.foreground.action.neutral.default,
        selected: s.foreground.action.primary.default,
        disabled: s.foreground.action.neutral.disabled
      }
    },
    /* On a dark or accent background, in both modes: the `inverse` tokens are the same in both. No border: selected, it would match the fill */
    contrast: {
      background: {
        default: withAlpha(s.surface.action.inverse.default, 0.1),
        selected: s.surface.action.inverse.default
      },
      foreground: {
        default: s.foreground.action.inverse.default,
        /* No mode-independent black token */
        selected: p.greyscale.black,
        disabled: s.foreground.action.inverse.disabled
      }
    }
  } satisfies Record<NonNullable<TabItem["color"]>, TabItemColors>;
};
