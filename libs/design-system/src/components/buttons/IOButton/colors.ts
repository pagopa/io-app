import type {
  IOColorMode,
  IOColorSemantics,
  IOComponentColors
} from "../../../core/tokens/colors/semantic";
import type { IOButtonColor, IOButtonVariant } from "./IOButton";

import {
  IOOpacity,
  IOColorPalette as p
} from "../../../core/tokens/colors/palette";
import { withAlpha } from "../../../core/tokens/colors/utils";

const transparent = {
  default: "transparent",
  pressed: "transparent",
  disabled: "transparent"
} as const;

export const buttonColors = (s: IOColorSemantics, mode: IOColorMode) => {
  const isDark = mode === "dark";
  /* Disabled label of solid and outline buttons */
  const disabled = isDark ? p.greyscale[300] : p.greyscale[700];
  /* Disabled fill of solid buttons */
  const disabledFill = isDark ? p.greyscale[700] : p.greyscale[300];
  /* Figma `Color/Action/Primary` */
  const primary = {
    default: isDark ? p.blueIO[300] : p.blueIO[500],
    pressed: isDark ? p.blueIO[400] : p.blueIO[600],
    disabled: disabledFill
  };

  return {
    solid: {
      primary: {
        background: primary,
        foreground: {
          default: isDark ? p.greyscale.black : p.greyscale.white,
          pressed: isDark ? p.greyscale.black : p.greyscale.white,
          disabled
        }
      },
      danger: {
        background: {
          default: p.red[600],
          pressed: p.red[500],
          disabled: disabledFill
        },
        foreground: {
          default: s.text.content.onColor.default,
          pressed: s.text.content.onColor.default,
          disabled
        }
      },
      contrast: {
        background: {
          default: p.greyscale.white,
          pressed: p.blueIO[50],
          disabled: p.blueIO[50]
        },
        foreground: {
          default: p.blueIO[500],
          pressed: p.blueIO[500],
          disabled: p.blueIO[500]
        }
      }
    },
    outline: {
      primary: {
        background: {
          default: withAlpha(primary.pressed, 0),
          pressed: withAlpha(primary.pressed, 0.1),
          disabled: "transparent"
        },
        foreground: {
          default: s.text.content.action,
          pressed: primary.pressed,
          disabled: isDark ? p.greyscale[450] : p.greyscale[650]
        }
      },
      danger: {
        background: {
          default: withAlpha(p.red[600], 0),
          pressed: withAlpha(p.red[600], 0.1),
          disabled: "transparent"
        },
        foreground: {
          default: s.text.content.error,
          pressed: s.text.content.error,
          disabled
        }
      },
      contrast: {
        background: {
          default: withAlpha(p.blueIO[600], 0),
          pressed: withAlpha(p.blueIO[600], 0.5),
          disabled: "transparent"
        },
        foreground: {
          default: p.greyscale.white,
          pressed: p.greyscale.white,
          disabled: p.blueIO[200]
        }
      }
    },
    link: {
      primary: {
        background: transparent,
        foreground: {
          default: s.text.content.action,
          pressed: primary.pressed,
          disabled: withAlpha(primary.default, 0.85)
        }
      },
      danger: {
        background: transparent,
        foreground: {
          default: s.text.content.error,
          pressed: s.text.content.error,
          disabled: withAlpha(s.text.content.error, 0.85)
        }
      },
      contrast: {
        background: transparent,
        foreground: {
          default: p.greyscale.white,
          pressed: withAlpha(p.greyscale.white, 0.85),
          disabled: withAlpha(p.greyscale.white, IOOpacity.disabled)
        }
      }
    }
  } satisfies Record<IOButtonVariant, Record<IOButtonColor, IOComponentColors>>;
};
