import type {
  IOColorMode,
  IOColorSemantics,
  IOComponentColor
} from "../../core/tokens/colors/semantic";
import type { IconButton } from "../buttons";
import type { Banner } from "./Banner";

/* Only the background changes with `color` */
export const bannerColors = (s: IOColorSemantics, mode: IOColorMode) => {
  const isDark = mode === "dark";
  return {
    background: {
      neutral: s.surface.secondary,
      turquoise: s.surface.highlight
    },
    foreground: {
      title: s.text.heading.secondary,
      content: s.text.content.tertiary,
      action: s.text.content.action
    },
    /* `IconButton` variant, not a color */
    closeButton: isDark ? "contrast" : "neutral"
  } satisfies {
    background: Record<Banner["color"], IOComponentColor<"background">>;
    closeButton: NonNullable<IconButton["color"]>;
    foreground: Record<
      "action" | "content" | "title",
      IOComponentColor<"foreground">
    >;
  };
};
