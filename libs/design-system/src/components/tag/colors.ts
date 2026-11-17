import type { IOTokenColor } from "../../core/tokens/colors/palette";
import type {
  IOColorSemantics,
  IOComponentColors
} from "../../core/tokens/colors/semantic";
import type { TagIconColor } from "./Tag";

/* One look for every variant: only the icon color changes */
export const tagColors = (s: IOColorSemantics) =>
  ({
    background: { default: s.surface.default },
    border: { default: s.stroke.default },
    foreground: { default: s.text.content.tertiary },
    /* By icon color, not by variant: `custom` picks one */
    icon: {
      primary: s.icon.action,
      warning: s.icon.warning,
      error: s.icon.error,
      success: s.icon.success,
      info: s.icon.info,
      grey: s.icon.default,
      lightGrey: s.icon.decorative
    }
  }) satisfies IOComponentColors & {
    icon: Record<TagIconColor, IOTokenColor>;
  };
