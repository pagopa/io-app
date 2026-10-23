import type {
  IOColorSemantics,
  IOComponentColor
} from "../../core/tokens/colors/semantic";

export const skeletonColors = (s: IOColorSemantics) =>
  ({ background: s.surface.skeleton }) satisfies {
    background: IOComponentColor<"background">;
  };
