import type {
  IOColorSemantics,
  IOComponentColor
} from "../../core/tokens/colors/semantic";

/* Track on the screen background, bar on the accent ink */
export const progressLoaderColors = (s: IOColorSemantics) =>
  ({
    background: s.background.default,
    foreground: s.foreground.accent
  }) satisfies {
    background: IOComponentColor<"background">;
    foreground: IOComponentColor<"foreground">;
  };
