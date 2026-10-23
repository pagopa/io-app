import type {
  IOColorSemantics,
  IOComponentColor
} from "../../core/tokens/colors/semantic";

/* The default ink: the `color` prop replaces it */
export const loadingSpinnerColors = (s: IOColorSemantics) =>
  ({ foreground: s.foreground.accent }) satisfies {
    foreground: IOComponentColor<"foreground">;
  };
