import type {
  IOColorMode,
  IOColorSemantics,
  IOComponentColor
} from "../../core/tokens/colors/semantic";
import type { ToastVariant } from "./types";

import { withAlpha } from "../../core/tokens/colors/utils";

/* Text and icon on the status tint; the border, the ink at 50%, hidden in dark */
export const toastColors = (s: IOColorSemantics, mode: IOColorMode) => {
  const borderOpacity = mode === "light" ? 0.5 : 0;

  const variant = (status: ToastVariant) => ({
    background: s.surface[status],
    foreground: s.foreground.onTint[status],
    border: withAlpha(s.foreground.onTint[status], borderOpacity)
  });

  return {
    error: variant("error"),
    info: variant("info"),
    success: variant("success"),
    warning: variant("warning")
  } satisfies Record<
    ToastVariant,
    {
      background: IOComponentColor<"background">;
      border: IOComponentColor<"foreground">;
      foreground: IOComponentColor<"foreground">;
    }
  >;
};
