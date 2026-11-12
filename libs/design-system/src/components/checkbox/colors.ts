import type {
  IOColorSemantics,
  IOComponentColor
} from "../../core/tokens/colors/semantic";

/* Unchecked: the input border; checked: the primary action fill, its ink on the tick */
export const checkboxColors = (s: IOColorSemantics) =>
  ({
    background: s.surface.action.primary.default,
    border: s.stroke.input,
    foreground: s.foreground.onAction.primary,
    label: s.text.content.default
  }) satisfies {
    background: IOComponentColor<"background">;
    border: IOComponentColor<"stroke">;
    foreground: IOComponentColor<"foreground">;
    label: IOComponentColor<"foreground">;
  };
