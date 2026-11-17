import type {
  IOColorSemantics,
  IOComponentColor
} from "../../core/tokens/colors/semantic";

export const codeBlockColors = (s: IOColorSemantics) =>
  ({
    background: s.surface.secondary,
    border: s.stroke.default
  }) satisfies {
    background: IOComponentColor<"background">;
    border: IOComponentColor<"stroke">;
  };
