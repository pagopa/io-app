import type {
  IOColorSemantics,
  IOComponentColor,
  Named
} from "../../core/tokens/colors/semantic";

export const moduleColors = (s: IOColorSemantics) =>
  ({
    border: s.stroke.default,
    foreground: {
      title: s.text.heading.default,
      description: s.text.content.tertiary,
      icon: {
        decorative: s.icon.decorative,
        action: s.icon.action
      },
      /* Interactive ink (titles, amounts) */
      action: s.text.content.action
    }
  }) satisfies {
    border: IOComponentColor<"stroke">;
    foreground: Named<IOComponentColor<"foreground">>;
  };
