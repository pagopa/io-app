import type {
  IOColorSemantics,
  IOColorStates,
  IOComponentColor
} from "../../core/tokens/colors/semantic";

import { withAlpha } from "../../core/tokens/colors/utils";

/* Fills are the action hue faded; `primary` sits on `background.accent` */
export const numberButtonColors = (s: IOColorSemantics) =>
  ({
    neutral: {
      background: {
        default: withAlpha(s.surface.action.primary.default, 0.1),
        pressed: withAlpha(s.surface.action.primary.default, 0.35)
      },
      foreground: s.foreground.action.primary.default
    },
    primary: {
      background: {
        default: withAlpha(s.surface.action.inverse.default, 0.15),
        pressed: withAlpha(s.surface.action.inverse.default, 0.5)
      },
      foreground: s.foreground.action.inverse.default
    }
  }) satisfies Record<
    "neutral" | "primary",
    {
      background: IOColorStates<"background">;
      foreground: IOComponentColor<"foreground">;
    }
  >;
