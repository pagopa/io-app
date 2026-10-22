import type {
  IOColorSemantics,
  IOColorStates,
  IOComponentColor
} from "../../core/tokens/colors/semantic";

/* `disabled` keeps the `default` border, faded with the whole field */
export const textInputColors = (s: IOColorSemantics) =>
  ({
    /* Fade behind the trailing element */
    background: s.background.default,
    border: {
      default: s.stroke.input,
      focused: s.stroke.focused,
      error: s.stroke.error
    },
    foreground: {
      default: s.text.content.default,
      disabled: s.text.content.secondary
    },
    label: s.text.content.tertiary,
    caret: s.text.content.action,
    icon: {
      default: s.icon.decorative,
      success: s.icon.success,
      error: s.icon.error
    },
    helper: { default: s.text.helper.default, error: s.text.helper.error }
  }) satisfies {
    background: IOComponentColor<"background">;
    border: Record<"default" | "error" | "focused", IOComponentColor<"stroke">>;
    caret: IOComponentColor<"foreground">;
    foreground: IOColorStates<"foreground">;
    helper: Record<"default" | "error", IOComponentColor<"foreground">>;
    icon: Record<
      "default" | "error" | "success",
      IOComponentColor<"foreground">
    >;
    label: IOComponentColor<"foreground">;
  };
