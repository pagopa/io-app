import type {
  IOColorSemantics,
  IOComponentColors
} from "../../../core/tokens/colors/semantic";
import type { IconButton } from "./IconButton";

/* Icon only: every state from one `foreground.action` entry */
export const iconButtonColors = (s: IOColorSemantics) =>
  ({
    primary: { foreground: s.foreground.action.primary },
    neutral: { foreground: s.foreground.action.neutral },
    contrast: { foreground: s.foreground.action.inverse }
  }) satisfies Record<NonNullable<IconButton["color"]>, IOComponentColors>;
