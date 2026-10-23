import { ComponentProps } from "react";

import type {
  IOColorSemantics,
  IOComponentColor
} from "../../core/tokens/colors/semantic";
import type { Alert } from "./Alert";

type AlertVariant = ComponentProps<typeof Alert>["variant"];

/* Text and icon on the status tint */
export const alertColors = (s: IOColorSemantics) => {
  const variant = (status: AlertVariant) => ({
    background: s.surface[status],
    foreground: s.foreground.onTint[status]
  });

  return {
    error: variant("error"),
    info: variant("info"),
    success: variant("success"),
    warning: variant("warning")
  } satisfies Record<
    AlertVariant,
    {
      background: IOComponentColor<"background">;
      foreground: IOComponentColor<"foreground">;
    }
  >;
};
