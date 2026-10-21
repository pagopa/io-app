import { ComponentProps } from "react";

import type {
  IOColorSemantics,
  IOComponentColors
} from "../../core/tokens/colors/semantic";
import type { Alert } from "./Alert";

/* Text and icon on the status tint */
export const alertColors = (s: IOColorSemantics) =>
  ({
    error: {
      background: { default: s.surface.error },
      foreground: { default: s.foreground.onTint.error }
    },
    warning: {
      background: { default: s.surface.warning },
      foreground: { default: s.foreground.onTint.warning }
    },
    info: {
      background: { default: s.surface.info },
      foreground: { default: s.foreground.onTint.info }
    },
    success: {
      background: { default: s.surface.success },
      foreground: { default: s.foreground.onTint.success }
    }
  }) satisfies Record<
    ComponentProps<typeof Alert>["variant"],
    IOComponentColors
  >;
