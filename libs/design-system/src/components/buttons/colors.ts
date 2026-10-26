import type {
  IOColorSemantics,
  IOComponentColors
} from "../../core/tokens/colors/semantic";
import type { IconButton } from "./IconButton";
import type { IconButtonSolid } from "./IconButtonSolid";

/* Icon only: every state from one `foreground.action` entry */
export const iconButtonColors = (s: IOColorSemantics) =>
  ({
    primary: { foreground: s.foreground.action.primary },
    neutral: { foreground: s.foreground.action.neutral },
    contrast: { foreground: s.foreground.action.inverse }
  }) satisfies Record<NonNullable<IconButton["color"]>, IOComponentColors>;

export const iconButtonSolidColors = (s: IOColorSemantics) =>
  ({
    primary: {
      background: s.surface.action.primary,
      foreground: {
        default: s.foreground.onAction.primary,
        disabled: s.foreground.onAction.disabled
      }
    },
    contrast: {
      background: s.surface.action.inverse,
      foreground: {
        default: s.foreground.onAction.inverse,
        disabled: s.foreground.onAction.inverse
      }
    }
  }) satisfies Record<NonNullable<IconButtonSolid["color"]>, IOComponentColors>;
