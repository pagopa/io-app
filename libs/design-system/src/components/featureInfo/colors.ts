import type {
  IOColorSemantics,
  IOComponentColor,
  Named
} from "../../core/tokens/colors/semantic";

export const featureInfoColors = (s: IOColorSemantics) =>
  ({
    contrast: {
      content: s.foreground.onAccent.default,
      action: s.foreground.action.inverse.default,
      icon: s.foreground.onAccent.default
    },
    neutral: {
      content: s.text.content.tertiary,
      action: s.text.content.action,
      icon: s.icon.decorative
    }
  }) satisfies Named<IOComponentColor<"foreground">>;
