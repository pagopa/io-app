import type { ComponentProps } from "react";

import type {
  IOColorSemantics,
  IOComponentColor
} from "../../core/tokens/colors/semantic";
import type { BoxedInput } from "./BoxedInput";

type BoxStatus = ComponentProps<typeof BoxedInput>["status"];

/* Box by status; `foreground` is the digit, or the dot of a secret value, in every status */
export const otpInputColors = (s: IOColorSemantics) =>
  ({
    box: {
      default: { border: s.stroke.input },
      focus: { border: s.stroke.focused },
      error: { background: s.surface.error, border: s.stroke.error }
    },
    foreground: s.text.heading.default,
    helper: { error: s.text.helper.error }
  }) satisfies {
    box: Record<
      BoxStatus,
      {
        background?: IOComponentColor<"background">;
        border: IOComponentColor<"stroke">;
      }
    >;
    foreground: IOComponentColor<"foreground">;
    helper: { error: IOComponentColor<"foreground"> };
  };
