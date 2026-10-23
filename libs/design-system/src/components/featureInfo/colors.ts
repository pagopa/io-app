import type {
  IOColorSemantics,
  IOComponentColor,
  Named
} from "../../core/tokens/colors/semantic";

export const featureInfoColors = (s: IOColorSemantics) =>
  ({
    content: s.text.content.tertiary,
    action: s.text.content.action,
    icon: s.icon.decorative
  }) satisfies Named<IOComponentColor<"foreground">>;
