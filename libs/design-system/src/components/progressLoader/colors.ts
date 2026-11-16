import type {
  IOColorSemantics,
  IOComponentColor
} from "../../core/tokens/colors/semantic";

/* `background` is the track, `foreground` the bar */
export const progressLoaderColors = (s: IOColorSemantics) =>
  ({
    background: s.surface.secondary,
    foreground: s.foreground.accent
  }) satisfies {
    background: IOComponentColor<"background">;
    foreground: IOComponentColor<"foreground">;
  };
