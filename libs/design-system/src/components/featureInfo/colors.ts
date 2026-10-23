import type {
  IOColorSemantics,
  IOComponentColor
} from "../../core/tokens/colors/semantic";

export const featureInfoColors = (s: IOColorSemantics) =>
  ({
    content: s.text.content.tertiary,
    action: s.text.content.action,
    icon: s.icon.decorative
  }) satisfies Record<
    "action" | "content" | "icon",
    IOComponentColor<"foreground">
  >;
