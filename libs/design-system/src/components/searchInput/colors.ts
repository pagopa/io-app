import type {
  IOColorSemantics,
  IOComponentColor
} from "../../core/tokens/colors/semantic";

export const searchInputColors = (s: IOColorSemantics) =>
  ({
    background: {
      default: s.surface.secondary,
      focused: s.surface.tertiary
    },
    foreground: s.text.content.default,
    placeholder: s.text.content.tertiary,
    icon: s.text.content.tertiary,
    caret: s.text.content.action,
    /* An `IOButton` link, outside it: same ink */
    cancel: s.foreground.action.primary.default
  }) satisfies {
    background: Record<"default" | "focused", IOComponentColor<"background">>;
    cancel: IOComponentColor<"foreground">;
    caret: IOComponentColor<"foreground">;
    foreground: IOComponentColor<"foreground">;
    icon: IOComponentColor<"foreground">;
    placeholder: IOComponentColor<"foreground">;
  };
