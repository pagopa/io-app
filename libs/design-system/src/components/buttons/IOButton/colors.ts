import type {
  IOColorSemantics,
  IOComponentColors
} from "../../../core/tokens/colors/semantic";
import type { IOButtonColor, IOButtonVariant } from "./IOButton";

import { withAlpha } from "../../../core/tokens/colors/utils";

const transparent = {
  default: "transparent",
  pressed: "transparent",
  disabled: "transparent"
} as const;

export const buttonColors = (s: IOColorSemantics) =>
  ({
    solid: {
      primary: {
        background: s.surface.action.primary,
        foreground: {
          default: s.foreground.onAction.primary,
          pressed: s.foreground.onAction.primary,
          disabled: s.foreground.onAction.disabled
        }
      },
      danger: {
        background: s.surface.action.danger,
        foreground: {
          default: s.foreground.onAction.danger,
          pressed: s.foreground.onAction.danger,
          disabled: s.foreground.onAction.disabled
        }
      },
      contrast: {
        background: s.surface.action.inverse,
        foreground: {
          default: s.foreground.onAction.inverse,
          pressed: s.foreground.onAction.inverse,
          disabled: s.foreground.onAction.inverse
        }
      }
    },
    outline: {
      primary: {
        background: {
          default: withAlpha(s.surface.action.primary.pressed, 0),
          pressed: withAlpha(s.surface.action.primary.pressed, 0.1),
          disabled: "transparent"
        },
        foreground: s.foreground.action.primary
      },
      danger: {
        background: {
          default: withAlpha(s.surface.action.danger.default, 0),
          pressed: withAlpha(s.surface.action.danger.default, 0.1),
          disabled: "transparent"
        },
        foreground: s.foreground.action.danger
      },
      contrast: {
        background: {
          default: withAlpha(s.surface.action.inverse.default, 0),
          pressed: withAlpha(s.surface.action.inverse.default, 0.1),
          disabled: "transparent"
        },
        foreground: s.foreground.action.inverse
      }
    },
    /* A disabled link keeps its hue, faded */
    link: {
      primary: {
        background: transparent,
        foreground: {
          ...s.foreground.action.primary,
          disabled: withAlpha(s.foreground.action.primary.default, 0.85)
        }
      },
      danger: {
        background: transparent,
        foreground: {
          ...s.foreground.action.danger,
          disabled: withAlpha(s.foreground.action.danger.default, 0.85)
        }
      },
      contrast: {
        background: transparent,
        foreground: s.foreground.action.inverse
      }
    }
  }) satisfies Record<
    IOButtonVariant,
    Record<IOButtonColor, IOComponentColors>
  >;
