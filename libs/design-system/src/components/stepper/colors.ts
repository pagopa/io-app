import type {
  IOColorSemantics,
  IOComponentColor
} from "../../core/tokens/colors/semantic";

export const stepperColors = (s: IOColorSemantics) =>
  ({
    default: s.foreground.inactive,
    active: s.foreground.accent
  }) satisfies Record<string, IOComponentColor<"foreground">>;
