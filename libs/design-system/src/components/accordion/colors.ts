import type {
  IOColorSemantics,
  IOComponentColor,
  Named
} from "../../core/tokens/colors/semantic";

export const accordionColors = (s: IOColorSemantics) =>
  ({
    background: s.surface.default,
    border: s.stroke.default,
    foreground: {
      title: s.text.content.default,
      icon: s.icon.decorative,
      chevron: s.foreground.action.primary.default
    }
  }) satisfies {
    background: IOComponentColor<"background">;
    border: IOComponentColor<"stroke">;
    foreground: Named<IOComponentColor<"foreground">>;
  };
