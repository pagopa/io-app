import type {
  IOColorSemantics,
  IOComponentColors
} from "../../../core/tokens/colors/semantic";
import type { IconButtonSolid } from "./IconButtonSolid";

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
