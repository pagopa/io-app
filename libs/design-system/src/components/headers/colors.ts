import type {
  IOColorSemantics,
  IOComponentColor,
  Named
} from "../../core/tokens/colors/semantic";

/* Shared by the headers; `accent` and `onAccent` for the `contrast` variant */
export const headerColors = (s: IOColorSemantics) =>
  ({
    background: {
      default: s.background.default,
      accent: s.background.accent
    },
    border: s.stroke.divider,
    /* The title; the actions take their colors from `IconButton` */
    foreground: {
      default: s.text.heading.default,
      onAccent: s.foreground.onAccent.default
    }
  }) satisfies {
    background: Named<IOComponentColor<"background">>;
    border: IOComponentColor<"stroke">;
    foreground: Named<IOComponentColor<"foreground">>;
  };
