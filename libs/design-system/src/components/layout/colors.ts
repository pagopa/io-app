import type {
  IOColorSemantics,
  IOComponentColor
} from "../../core/tokens/colors/semantic";

export const footerColors = (s: IOColorSemantics) =>
  ({ background: s.background.default }) satisfies {
    background: IOComponentColor<"background">;
  };

export const dividerColors = (s: IOColorSemantics) =>
  ({ border: s.stroke.divider }) satisfies {
    border: IOComponentColor<"stroke">;
  };
