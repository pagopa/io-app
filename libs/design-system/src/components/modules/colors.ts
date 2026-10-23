import type {
  IOColorSemantics,
  IOComponentColor
} from "../../core/tokens/colors/semantic";

export const moduleColors = (s: IOColorSemantics) =>
  ({
    border: s.stroke.default,
    foreground: {
      label: s.text.content.default,
      description: s.text.content.tertiary,
      icon: s.icon.decorative,
      /* Interactive ink (titles, amounts, chevrons) */
      action: s.foreground.action.primary.default
    }
  }) satisfies {
    border: IOComponentColor<"stroke">;
    foreground: Record<
      "action" | "description" | "icon" | "label",
      IOComponentColor<"foreground">
    >;
  };
