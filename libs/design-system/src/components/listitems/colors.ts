import type {
  IOColorSemantics,
  IOColorStates,
  IOComponentColor,
  Named
} from "../../core/tokens/colors/semantic";

import { withAlpha } from "../../core/tokens/colors/utils";

export const listItemColors = (s: IOColorSemantics) =>
  ({
    background: {
      default: withAlpha(s.surface.secondary, 0),
      pressed: s.surface.secondary
    },
    foreground: {
      label: s.text.content.default,
      description: s.text.content.tertiary,
      caption: s.text.content.tertiary,
      icon: {
        decorative: s.icon.decorative,
        action: s.icon.action
      },
      /* Interactive ink (values, chevrons) */
      action: {
        primary: s.foreground.action.primary.default,
        danger: s.foreground.action.danger.default
      },
      amount: s.text.content.action,
      error: s.foreground.error,
      success: s.foreground.success,
      featured: s.foreground.featured
    }
  }) satisfies {
    background: IOColorStates<"background">;
    foreground: Named<IOComponentColor<"foreground">>;
  };
