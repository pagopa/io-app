import type { ComponentProps } from "react";

import type {
  IOColorSemantics,
  IOComponentColor
} from "../../core/tokens/colors/semantic";
import type { CodeInput, CodeInputStatus } from "./CodeInput";

import { withAlpha } from "../../core/tokens/colors/utils";

/* Empty dots take `border`, filled dots `foreground` by status; `primary` sits on `background.accent` */
export const codeInputColors = (s: IOColorSemantics) =>
  ({
    primary: {
      border: withAlpha(s.stroke.onAccent, 0.7),
      foreground: {
        default: s.foreground.onAccent.default,
        error: s.foreground.onAccent.error
      }
    },
    neutral: {
      border: s.stroke.input,
      foreground: { default: s.foreground.default, error: s.foreground.error }
    }
  }) satisfies Record<
    NonNullable<ComponentProps<typeof CodeInput>["variant"]>,
    {
      border: IOComponentColor<"stroke">;
      foreground: Record<CodeInputStatus, IOComponentColor<"foreground">>;
    }
  >;
